"""Gathers what the engine needs from Home Assistant, runs it, and shares the result with the sensors and the cards.

Sensor changes recompute everything within a couple of seconds; forecasts, history and rain statistics are fetched on their
own rhythm, in the background, and never block a recomputation."""
from __future__ import annotations

import asyncio
from collections.abc import Callable, Coroutine
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from functools import partial
from typing import Any
from zoneinfo import ZoneInfo

import aiohttp

from homeassistant.components.recorder import get_instance, history, statistics
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import CoreState, Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.debounce import Debouncer
from homeassistant.helpers.event import async_call_later, async_track_state_change_event, async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .const import AIR_INTERVAL, DEBOUNCE_SECONDS, DOMAIN, FORECAST_INTERVAL, FORECAST_RETRY, HISTORY_INTERVAL, LOGGER, RAIN_INTERVAL, TICK
from .engine import lightning, open_meteo, waqi
from .engine.brief import Brief
from .engine.catalogue import Item
from .engine.compute import compute
from .engine.forecast import Day, Hour, Units, engine_rows, parse_days, parse_hours
from .engine.local import LocalWeather
from .engine.nowcast import rain_ahead
from .engine.settings import Settings
from .engine.series import RAIN_DAYS, WEEK, hourly_changes, rain_state_key, rain_sum_key, weather_history, weather_history_key, week_key
from .engine.station import Derived, Statistic, midnight
from .engine.trends import Change
from .engine.units import Kind, measurement
from .engine.view import to_json
from .engine.watch import AlertState, AlertWatch

ALERT_EVENT = f"{DOMAIN}_alerte"

RAIN_UNITS = ("mm", "in", "inch")
FORECAST_KINDS = (("daily", 1), ("hourly", 2))
"""Forecast types and their bit in the weather entity's supported features."""


def original_condition(registry: er.EntityRegistry, weather_entity: str) -> str | None:
    """Météo-France's sensor of its own description (« Bruine », « Brouillard givrant »…), beside the weather entity.
    Home Assistant creates it disabled: it counts only once the user has enabled it. The daily one is left aside."""
    weather = registry.async_get(weather_entity)
    if weather is None or weather.platform != "meteo_france" or not weather.config_entry_id:
        return None
    for entry in er.async_entries_for_config_entry(registry, weather.config_entry_id):
        unique_id = str(entry.unique_id)
        if (entry.domain == "sensor" and not entry.disabled_by and unique_id.endswith("_original_condition")
                and not unique_id.endswith("_daily_original_condition")):
            return entry.entity_id
    return None


def radar_rain(registry: er.EntityRegistry, weather_entity: str) -> str | None:
    """Météo-France's « rain within the hour » sensor (radar, five minutes at a time), beside the weather entity."""
    weather = registry.async_get(weather_entity)
    if weather is None or weather.platform != "meteo_france" or not weather.config_entry_id:
        return None
    return next((entry.entity_id for entry in er.async_entries_for_config_entry(registry, weather.config_entry_id)
                 if entry.domain == "sensor" and not entry.disabled_by and str(entry.unique_id).endswith("_next_rain")), None)


@dataclass(frozen=True)
class Snapshot:
    """Everything known at one moment: the typed results for the sensors, and the view the cards draw."""

    local: LocalWeather
    brief: Brief
    derived: Derived | None
    view: dict[str, Any]
    catalogue: dict[str, Item]
    alerts: dict[str, AlertState]
    """The alerts in progress, held a little after they stop being observed."""
    computed: datetime = field(compare=False)
    rain_ahead: dict[str, Any] = field(default_factory=dict)
    """When the next rain starts, to the minute from Météo-France's radar when it is there."""


type NiakWeatherConfigEntry = ConfigEntry[NiakWeatherCoordinator]


def alert_store(hass: HomeAssistant, entry_id: str) -> Store[dict[str, Any]]:
    """The alerts in progress of one place, kept across restarts so that a restart neither repeats nor forgets them."""
    return Store(hass, 1, f"{DOMAIN}.alertes.{entry_id}")


class NiakWeatherCoordinator(DataUpdateCoordinator[Snapshot]):
    config_entry: NiakWeatherConfigEntry

    def __init__(self, hass: HomeAssistant, entry: NiakWeatherConfigEntry) -> None:
        super().__init__(hass, LOGGER, config_entry=entry, name=f"{DOMAIN} {entry.title}", update_interval=TICK, always_update=False,
                         request_refresh_debouncer=Debouncer(hass, LOGGER, cooldown=DEBOUNCE_SECONDS, immediate=True))
        self.settings = Settings.from_options(entry.options)
        self.hours: list[Hour] = []
        self.days: list[Day] = []
        self.forecast_rows: dict[str, list[dict[str, Any]]] = {"hourly": [], "daily": []}
        """The provider's forecasts in the engine's units, passed on by the Niak Weather weather entity."""
        self.forecast_version = 0
        self.forecast_at: datetime | None = None
        """When the hourly forecast last arrived, for the Niak panel."""
        self.watch = AlertWatch()
        self._store = alert_store(hass, entry.entry_id)
        self.history: dict[str, list[Change]] = {}
        self.rain_history: dict[str, list[Change]] = {}
        self.statistics: list[Statistic] = []
        self.statistics_unit: str | None = None
        self.platforms: dict[str, str] = {}
        self.air_forecast: open_meteo.Data | None = None
        """Tomorrow's air from Open-Meteo, only when WAQI gives the air: WAQI has no forecast."""
        self._air_tried: datetime | None = None
        self.strikes: list[lightning.Strike] = []
        """Blitzortung's strikes of the last hour: its sensor only keeps the last one."""
        self._cancel_retry: Callable[[], None] | None = None
        self._stop_listeners: set[Callable[[], None]] = set()
        self._retries = 0
        self._unlisten_started: Callable[[], None] | None = None

    async def async_start(self) -> None:
        """First fetches, then listen to the sensors and keep each source fresh."""
        registry = er.async_get(self.hass)
        ids = self.settings.entity_ids()
        self.platforms = {e.entity_id: e.platform for e in registry.entities.values() if e.entity_id in ids}
        entry = self.config_entry
        self.watch = AlertWatch(await self._store.async_load())
        # Listen first: a weather service that starts while the first fetches run is caught at once.
        entry.async_on_unload(async_track_state_change_event(self.hass, sorted(ids), self._on_state_change))
        await asyncio.gather(self._load_forecasts(), self._load_history(), self._load_rain(), self._load_week(), self._load_air_forecast(),
                             self._load_strikes())
        for interval, load in ((FORECAST_INTERVAL, self._load_forecasts), (HISTORY_INTERVAL, self._load_history), (RAIN_INTERVAL, self._load_rain),
                               (RAIN_INTERVAL, self._load_week), (AIR_INTERVAL, self._load_air_forecast)):
            entry.async_on_unload(async_track_time_interval(self.hass, self._in_background(load), interval))
        entry.async_on_unload(self._cancel_forecast_retry)
        entry.async_on_unload(self._stopped)
        if self.hass.state is not CoreState.running:
            # Many weather services only compute their forecast once Home Assistant has started: ask again then.
            self._unlisten_started = self.hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, self._on_started)
            entry.async_on_unload(self._stop_listening_started)
        await self.async_config_entry_first_refresh()

    @callback
    def _on_started(self, _: Event) -> None:
        self._unlisten_started = None
        self._cancel_forecast_retry()
        self._in_background(self._load_forecasts)(dt_util.utcnow())

    @callback
    def _stop_listening_started(self) -> None:
        # A listener that already fired is gone: removing it again would log an error.
        if self._unlisten_started:
            self._unlisten_started()
            self._unlisten_started = None

    @callback
    def async_add_stop_listener(self, listener: Callable[[], None]) -> Callable[[], None]:
        """Called when this place stops (new settings, removal): a card can then subscribe again."""
        self._stop_listeners.add(listener)
        return lambda: self._stop_listeners.discard(listener)

    @callback
    def _stopped(self) -> None:
        for listener in list(self._stop_listeners):
            listener()
        self._stop_listeners.clear()

    @callback
    def _on_state_change(self, event: Event[EventStateChangedData]) -> None:
        data = event.data
        if data["entity_id"] == self.settings.lightning_entity and data["new_state"] is not None:
            # Each new distance is a strike; « unknown » after a quiet spell is not one.
            new = data["new_state"]
            strike = lightning.strike_of(new, new.last_updated.timestamp(), self.hass.config.latitude, self.hass.config.longitude)
            if strike is not None:
                self.strikes = lightning.keep([*self.strikes, strike], dt_util.utcnow().timestamp())
        if data["entity_id"] == self.settings.weather_entity and _ready(data["new_state"]) and not _ready(data["old_state"]):
            # The weather service has just started (or is back): its forecast is fetched now, not at the next retry.
            self._cancel_forecast_retry()
            self.config_entry.async_create_background_task(self.hass, self._load_then_refresh(self._load_forecasts), f"{DOMAIN} forecasts")
        if self.data is not None:
            self.config_entry.async_create_task(self.hass, self.async_request_refresh())

    def _in_background(self, load: Callable[[], Coroutine[Any, Any, None]]) -> Callable[[datetime], None]:
        @callback
        def run(_: datetime) -> None:
            self.config_entry.async_create_background_task(self.hass, self._load_then_refresh(load), f"{DOMAIN} {load.__name__}")
        return run

    async def _load_then_refresh(self, load: Callable[[], Coroutine[Any, Any, None]]) -> None:
        await load()
        await self.async_request_refresh()

    @callback
    def _cancel_forecast_retry(self) -> None:
        if self._cancel_retry:
            self._cancel_retry()
            self._cancel_retry = None

    async def _async_update_data(self) -> Snapshot:
        return self._compute()

    def _compute(self) -> Snapshot:
        hass = self.hass
        now = dt_util.now()
        zone = ZoneInfo(hass.config.time_zone)
        # WAQI's station today and Open-Meteo tomorrow stand where Atmo France's air sensors would be.
        settings, get = waqi.overlay(self.settings, hass.states.get, self.air_forecast, now, zone)
        strikes = None
        if settings.lightning_entity:
            sensor = hass.states.get(settings.lightning_entity)
            self.strikes = lightning.keep(self.strikes, now.timestamp())
            strikes = lightning.read(self.strikes, now.timestamp(), sensor is not None and sensor.state != STATE_UNAVAILABLE)
        result = compute(get, settings, self.hours, self.days, self.history, self.rain_history, self.statistics, self.statistics_unit,
                         now, zone, hass.config.latitude, hass.config.elevation or 0, self.platforms,
                         original_condition(er.async_get(hass), settings.weather_entity), strikes)
        events = self.watch.update(result.catalogue, now)
        if events:
            self._store.async_delay_save(self.watch.as_dict, 10)
        for event in events:
            hass.bus.async_fire(ALERT_EVENT, {"lieu": self.config_entry.title, "entry_id": self.config_entry.entry_id, "type": event.type,
                                              "etat": event.phase, "niveau": event.level, "source": event.source, "texte": event.text})
        radar = hass.states.get(radar_rain(er.async_get(hass), settings.weather_entity) or "")
        ahead = rain_ahead(radar.attributes if radar else None, self.hours, now)
        return Snapshot(result.local, result.brief, result.derived, to_json(result.view), result.catalogue, self.watch.states(), now, ahead)

    # ---- Sources ----

    async def _load_forecasts(self) -> None:
        """Hourly and daily forecasts, in the weather entity's units. A failure is retried a minute later, never shown as « no rain »."""
        entity_id = self.settings.weather_entity
        state = self.hass.states.get(entity_id)
        if not _ready(state):
            # The weather service has not started yet: Home Assistant may show a placeholder that answers with an empty forecast.
            self._schedule_forecast_retry()
            return
        features = int(state.attributes.get("supported_features") or 0)
        failed = False

        async def fetch(kind: str, bit: int) -> list[dict[str, Any]]:
            nonlocal failed
            if not features & bit:
                return []
            try:
                response = await self.hass.services.async_call("weather", "get_forecasts", {"type": kind}, blocking=True,
                                                               target={"entity_id": entity_id}, return_response=True)
            except HomeAssistantError as err:
                LOGGER.debug("No %s forecast from %s: %s", kind, entity_id, err)
                failed = True
                return []
            rows = list(((response or {}).get(entity_id) or {}).get("forecast") or [])
            # A service offering this forecast that answers with nothing is not ready yet: ask again shortly.
            failed = failed or not rows
            return rows

        daily, hourly = await asyncio.gather(*(fetch(kind, bit) for kind, bit in FORECAST_KINDS))
        attributes = state.attributes
        units = Units(attributes.get("temperature_unit") or "°C", attributes.get("precipitation_unit") or "mm", attributes.get("wind_speed_unit") or "km/h",
                      attributes.get("pressure_unit") or "hPa")
        # A failed request keeps the previous forecast rather than replacing it with nothing.
        if hourly or not failed:
            self.hours = parse_hours(hourly, units)
            self.forecast_rows["hourly"] = engine_rows(hourly, units)
        if hourly:
            self.forecast_at = dt_util.utcnow()
        if daily or not failed:
            self.days = parse_days(daily, units)
            self.forecast_rows["daily"] = engine_rows(daily, units)
        self.forecast_version += 1
        self._cancel_forecast_retry()
        if failed:
            self._schedule_forecast_retry()
        else:
            self._retries = 0

    async def _load_air_forecast(self) -> None:
        """Tomorrow's air from Open-Meteo, at the home's position, each hour; a failure keeps the previous forecast and is retried ten minutes later."""
        now = dt_util.utcnow()
        if self.settings.air_source != "waqi" or not open_meteo.due(self.air_forecast, self._air_tried, now):
            return
        self._air_tried = now
        hass = self.hass
        try:
            params = open_meteo.params(hass.config.latitude, hass.config.longitude, ZoneInfo(hass.config.time_zone))
            async with asyncio.timeout(30), async_get_clientsession(hass).get(open_meteo.URL, params=params) as response:
                response.raise_for_status()
                payload = await response.json()
            self.air_forecast = open_meteo.parse(payload, now)
        except (aiohttp.ClientError, TimeoutError, ValueError) as err:
            LOGGER.warning("Open-Meteo air forecast unavailable: %s", err)

    @callback
    def _schedule_forecast_retry(self) -> None:
        # Soon after a start (10 s, 20 s, 40 s), then every minute while the service stays silent.
        delay = min(FORECAST_RETRY, timedelta(seconds=10 * 2 ** self._retries))
        self._retries += 1
        self._cancel_forecast_retry()
        self._cancel_retry = async_call_later(self.hass, delay, self._in_background(self._retry_forecasts))

    async def _retry_forecasts(self) -> None:
        self._cancel_retry = None
        await self._load_forecasts()

    async def _states_during(self, start: datetime, entity_ids: list[str]) -> dict[str, list[Change]]:
        """Every recorded state change since `start` (with the state just before it), from the Recorder."""
        try:
            with_weather = self.settings.weather_entity in entity_ids
            result = await get_instance(self.hass).async_add_executor_job(
                partial(history.get_significant_states, self.hass, start, dt_util.utcnow(), entity_ids,
                        include_start_time_state=True, significant_changes_only=False,
                        minimal_response=False, no_attributes=not with_weather))
        except Exception as err:  # noqa: BLE001 - history is optional: a Recorder failure must never stop the weather
            # The Recorder may also exclude these sensors: no trend is invented, the card says it is being measured.
            LOGGER.warning("History unavailable for %s: %s", ", ".join(entity_ids), err)
            return {}
        changes = {entity_id: [Change(state.last_updated.timestamp(), state.state) for state in states if hasattr(state, "last_updated")]
                   for entity_id, states in result.items()}
        if with_weather:
            changes.update(weather_history(self.settings.weather_entity, result.get(self.settings.weather_entity, ())))
        return changes

    async def _load_history(self) -> None:
        """Six hours of pressure and wind for the charts and trends; today's gusts and the last hour of temperature when the station has no sensor for them."""
        s, now = self.settings, dt_util.utcnow()
        derived = s.station_history
        ids = sorted({s.weather_entity, s.pressure_entity, s.wind_speed_entity, s.wind_gust_entity,
                      s.temperature_entity if derived and not s.temperature_trend_entity else None} - {None, ""})
        if not ids:
            self.history = {}
            return
        start = now - timedelta(hours=6)
        if derived and not s.max_daily_gust_entity and s.wind_gust_entity:
            start = min(start, dt_util.start_of_local_day())
        recent = await self._states_during(start, ids)
        # The week of pressure, loaded less often, stays beside the six hours.
        self.history = {**{k: v for k, v in self.history.items() if k.endswith("#week")}, **recent}

    async def _load_week(self) -> None:
        """A week of pressure and wind for the longer charts: hourly means (maxima for gusts) of the long-term statistics,
        or the recorded states without them; the weather service's own values when the station has no such sensor."""
        s, now = self.settings, dt_util.utcnow()
        start = now - timedelta(seconds=WEEK + 3600)
        week: dict[str, list[Change]] = {}
        from_service = []
        for entity_id, attribute, kind, statistic in ((s.pressure_entity, "pressure", "pressure", "mean"),
                                                      (s.wind_speed_entity, "wind_speed", "speed", "mean"),
                                                      (s.wind_gust_entity, "wind_gust_speed", "speed", "max")):
            if not entity_id:
                from_service.append(attribute)
                continue
            rows = await self._hourly(entity_id, start, now, kind, statistic)
            if rows is None:
                rows = (await self._states_during(start, [entity_id])).get(entity_id, [])
            week[week_key(entity_id)] = rows
        if from_service and s.weather_entity:
            recorded = await self._states_during(start, [s.weather_entity])
            for attribute in from_service:
                key = weather_history_key(s.weather_entity, attribute)
                week[week_key(key)] = recorded.get(key, [])
        self.history = {**{k: v for k, v in self.history.items() if not k.endswith("#week")}, **week}

    async def _hourly(self, entity_id: str, start: datetime, now: datetime, kind: str, statistic: str) -> list[Change] | None:
        """Hourly means or maxima, or None when the sensor keeps no statistics. The sensor itself may not have started yet
        (Niak Weather often starts before the station): the statistics are read without it, in the unit they are kept in."""
        state = self.hass.states.get(entity_id)
        unit = state.attributes.get("unit_of_measurement") if state is not None else None

        def during() -> list[dict[str, Any]]:
            rows = statistics.statistics_during_period(self.hass, start, now, {entity_id}, "hour", {kind: unit} if unit else None, {statistic})
            return list(rows.get(entity_id, []))

        try:
            rows = await get_instance(self.hass).async_add_executor_job(during)
        except Exception as err:  # noqa: BLE001 - statistics are optional: the recorded states then give the week
            LOGGER.debug("Statistics unavailable for %s: %s", entity_id, err)
            return None
        return hourly_changes([(_seconds(r["start"]), _seconds(r["end"]), r.get(statistic)) for r in rows]) if rows else None

    async def _load_strikes(self) -> None:
        """The last hour of strikes from the Recorder, after a restart: their distance only, the Recorder keeps no position."""
        entity_id = self.settings.lightning_entity
        if not entity_id:
            return
        now = dt_util.utcnow()
        changes = await self._states_during(now - timedelta(seconds=lightning.KEEP), [entity_id])
        state = self.hass.states.get(entity_id)
        unit = state.attributes.get("unit_of_measurement") if state is not None else "km"
        # The state already there at the start is the last strike before the hour, or « unknown »: only changes count.
        recorded = [c for c in changes.get(entity_id, []) if c.time >= (now - timedelta(seconds=lightning.KEEP)).timestamp()]
        self.strikes = lightning.keep([*lightning.from_history(recorded, unit), *self.strikes], now.timestamp())

    async def _load_rain(self) -> None:
        """Eight days of the daily rain counter and the total counter; long-term statistics of the total for weeks, months and the year."""
        s, now = self.settings, dt_util.utcnow()
        ids = sorted({s.daily_rain_entity, s.rain_total_entity if s.station_history else None} - {None, ""})
        recorded = await self._states_during(now - timedelta(days=8), ids) if ids else {}
        self.statistics, self.statistics_unit = await self._rain_statistics(now)
        self.rain_history = {**recorded, **await self._rain_sums(now)}

    async def _rain_sums(self, now: datetime) -> dict[str, list[Change]]:
        """A month of hourly rain for the 24-hour and 30-day bars: the running sum of a rain counter's statistics,
        the total counter first, else the daily one, whose resets the sum already follows."""
        s = self.settings
        for entity_id in (s.rain_total_entity if s.station_history else None, s.daily_rain_entity):
            if not entity_id:
                continue
            # The statistics' own description, not the sensor: at start-up the station may not be there yet.
            unit = await self._sum_unit(entity_id)
            if unit not in RAIN_UNITS:
                continue
            start = now - timedelta(days=RAIN_DAYS + 1)

            def during(entity_id: str = entity_id) -> list[dict[str, Any]]:
                rows = statistics.statistics_during_period(self.hass, start, now, {entity_id}, "hour", None, {"sum", "state"})
                return list(rows.get(entity_id, []))

            try:
                rows = await get_instance(self.hass).async_add_executor_job(during)
            except Exception as err:  # noqa: BLE001 - statistics are optional: the seven days still come from the counter's history
                LOGGER.debug("Rain statistics unavailable for %s: %s", entity_id, err)
                continue
            rows = [r for r in rows if r.get("sum") is not None]
            if not rows:
                continue
            # Rows come in the unit the statistics keep: the bars are in millimetres.
            mm = (lambda v: measurement(v, unit, Kind.RAIN))
            last = rows[-1]
            return {rain_sum_key(entity_id): [Change(_seconds(r["end"]), str(mm(r["sum"]))) for r in rows],
                    rain_state_key(entity_id): [Change(_seconds(last["end"]), str(mm(last.get("state"))))]}
        return {}

    async def _sum_unit(self, entity_id: str) -> str | None:
        """The unit of a counter's long-term statistics, or None when it keeps no running sum."""
        try:
            metadata = await get_instance(self.hass).async_add_executor_job(lambda: statistics.get_metadata(self.hass, statistic_ids={entity_id}))
        except Exception as err:  # noqa: BLE001 - statistics are optional
            LOGGER.debug("Statistics metadata unavailable for %s: %s", entity_id, err)
            return None
        meta = metadata.get(entity_id)
        return meta[1].get("unit_of_measurement") if meta and meta[1].get("has_sum") else None

    async def _rain_statistics(self, now: datetime) -> tuple[list[Statistic], str | None]:
        s = self.settings
        entity_id = s.rain_total_entity
        # Its statistics say whether it is a counter (a running sum below): the sensor may not have started yet.
        if not entity_id or not s.station_history:
            return [], None
        instance = get_instance(self.hass)
        zone = ZoneInfo(self.hass.config.time_zone)
        local = now.astimezone(zone)
        year = datetime(local.year, 1, 1, tzinfo=zone)
        # Hourly rows start on a local midnight, where a daily row ends: no false gap at the junction.
        hourly_start = datetime.fromtimestamp(midnight(local.date() - timedelta(days=9), zone), zone)
        daily_start = min(year, now - timedelta(days=8)) - timedelta(days=1)

        def during(start: datetime, period: str) -> list[dict[str, Any]]:
            rows = statistics.statistics_during_period(self.hass, start, now, {entity_id}, period, None, {"sum", "state"})
            return list(rows.get(entity_id, []))

        try:
            metadata = await instance.async_add_executor_job(lambda: statistics.get_metadata(self.hass, statistic_ids={entity_id}))
            meta = metadata.get(entity_id)
            # Without `units`, rows come in the unit the statistics are stored in.
            unit = meta[1].get("unit_of_measurement") if meta and meta[1].get("has_sum") else None
            if unit not in RAIN_UNITS:
                return [], None
            daily = await instance.async_add_executor_job(during, daily_start, "day")
            hourly = await instance.async_add_executor_job(during, hourly_start, "hour")
        except Exception as err:  # noqa: BLE001 - statistics are optional: totals then come from the counter history alone
            LOGGER.warning("Rain statistics unavailable for %s: %s", entity_id, err)
            return [], None
        rows = sorted((Statistic(_seconds(r["start"]), _seconds(r["end"]), r.get("sum"), r.get("state")) for r in (*daily, *hourly)),
                      key=lambda r: r.end - r.start, reverse=True)
        # One row per boundary: where a day and an hour end together, the hour wins.
        return sorted({r.end: r for r in rows}.values(), key=lambda r: r.end), unit


def _ready(state: Any) -> bool:
    return state is not None and state.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN)


def _seconds(value: Any) -> float:
    return value.timestamp() if isinstance(value, datetime) else float(value)
