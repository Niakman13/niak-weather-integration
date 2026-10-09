"""Gathers what the engine needs from Home Assistant, runs it, and shares the result with the sensors and the cards.

Sensor changes recompute everything within a couple of seconds; forecasts, history and rain statistics are fetched on their
own rhythm, in the background, and never block a recomputation."""
from __future__ import annotations

import asyncio
from collections.abc import Callable, Coroutine
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from homeassistant.components.recorder import get_instance, history, statistics
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.debounce import Debouncer
from homeassistant.helpers.event import async_call_later, async_track_state_change_event, async_track_time_interval
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .const import DEBOUNCE_SECONDS, DOMAIN, FORECAST_INTERVAL, FORECAST_RETRY, HISTORY_INTERVAL, LOGGER, RAIN_INTERVAL, TICK
from .engine.brief import Brief, build_brief
from .engine.forecast import Day, Hour, Units, parse_days, parse_hours
from .engine.local import LocalWeather, build_local
from .engine.settings import Settings
from .engine.station import Derived, Statistic, derive_station, midnight
from .engine.trends import Change
from .engine.view import build_view, to_json

RAIN_UNITS = ("mm", "in", "inch")
FORECAST_KINDS = (("daily", 1), ("hourly", 2))
"""Forecast types and their bit in the weather entity's supported features."""


@dataclass(frozen=True)
class Snapshot:
    """Everything known at one moment: the typed results for the sensors, and the view the cards draw."""

    local: LocalWeather
    brief: Brief
    derived: Derived | None
    view: dict[str, Any]
    computed: datetime = field(compare=False)


type NiakWeatherConfigEntry = ConfigEntry[NiakWeatherCoordinator]


class NiakWeatherCoordinator(DataUpdateCoordinator[Snapshot]):
    config_entry: NiakWeatherConfigEntry

    def __init__(self, hass: HomeAssistant, entry: NiakWeatherConfigEntry) -> None:
        super().__init__(hass, LOGGER, config_entry=entry, name=f"{DOMAIN} {entry.title}", update_interval=TICK, always_update=False,
                         request_refresh_debouncer=Debouncer(hass, LOGGER, cooldown=DEBOUNCE_SECONDS, immediate=True))
        self.settings = Settings.from_options(entry.options)
        self.hours: list[Hour] = []
        self.days: list[Day] = []
        self.history: dict[str, list[Change]] = {}
        self.rain_history: dict[str, list[Change]] = {}
        self.statistics: list[Statistic] = []
        self.statistics_unit: str | None = None
        self.platforms: dict[str, str] = {}
        self._cancel_retry: Callable[[], None] | None = None

    async def async_start(self) -> None:
        """First fetches, then listen to the sensors and keep each source fresh."""
        registry = er.async_get(self.hass)
        ids = self.settings.entity_ids()
        self.platforms = {e.entity_id: e.platform for e in registry.entities.values() if e.entity_id in ids}
        await asyncio.gather(self._load_forecasts(), self._load_history(), self._load_rain())
        entry = self.config_entry
        entry.async_on_unload(async_track_state_change_event(self.hass, sorted(ids), self._on_state_change))
        for interval, load in ((FORECAST_INTERVAL, self._load_forecasts), (HISTORY_INTERVAL, self._load_history), (RAIN_INTERVAL, self._load_rain)):
            entry.async_on_unload(async_track_time_interval(self.hass, self._in_background(load), interval))
        entry.async_on_unload(self._cancel_forecast_retry)
        await self.async_config_entry_first_refresh()

    @callback
    def _on_state_change(self, event: Event[EventStateChangedData]) -> None:
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
        hass, s = self.hass, self.settings
        now, zone, get = dt_util.now(), ZoneInfo(hass.config.time_zone), hass.states.get
        # The engine reads the next hours, first one first: an hour already over is no longer « next ».
        upcoming = [h for h in self.hours if h.time is None or h.time.timestamp() > now.timestamp() - 3600][:18]
        local = build_local(get, s, upcoming, self.history, now, zone)
        derived = derive_station(get, s, self.statistics, self.statistics_unit, {**self.history, **self.rain_history}, now, zone) if s.station_history else None
        brief = build_brief(local, s, get, self.hours, self.days, now, zone, self.platforms)
        view = build_view(get, s, local, brief, self.hours, self.days, self.history, self.rain_history, derived, now, zone,
                          hass.config.latitude, hass.config.elevation or 0)
        return Snapshot(local, brief, derived, to_json(view), now)

    # ---- Sources ----

    async def _load_forecasts(self) -> None:
        """Hourly and daily forecasts, in the weather entity's units. A failure is retried a minute later, never shown as « no rain »."""
        entity_id = self.settings.weather_entity
        state = self.hass.states.get(entity_id)
        if state is None:
            # The weather service has not started yet.
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
            return list(((response or {}).get(entity_id) or {}).get("forecast") or [])

        daily, hourly = await asyncio.gather(*(fetch(kind, bit) for kind, bit in FORECAST_KINDS))
        attributes = state.attributes
        units = Units(attributes.get("temperature_unit") or "°C", attributes.get("precipitation_unit") or "mm", attributes.get("wind_speed_unit") or "km/h")
        # A failed request keeps the previous forecast rather than replacing it with nothing.
        if hourly or not failed:
            self.hours = parse_hours(hourly, units)
        if daily or not failed:
            self.days = parse_days(daily, units)
        self._cancel_forecast_retry()
        if failed:
            self._schedule_forecast_retry()

    @callback
    def _schedule_forecast_retry(self) -> None:
        self._cancel_forecast_retry()
        self._cancel_retry = async_call_later(self.hass, FORECAST_RETRY, self._in_background(self._retry_forecasts))

    async def _retry_forecasts(self) -> None:
        self._cancel_retry = None
        await self._load_forecasts()

    async def _states_during(self, start: datetime, entity_ids: list[str]) -> dict[str, list[Change]]:
        """Every recorded state change since `start` (with the state just before it), from the Recorder."""
        try:
            result = await get_instance(self.hass).async_add_executor_job(
                history.get_significant_states, self.hass, start, dt_util.utcnow(), entity_ids, None, True, False, False, True)
        except Exception as err:  # noqa: BLE001 - history is optional: a Recorder failure must never stop the weather
            # The Recorder may also exclude these sensors: no trend is invented, the card says it is being measured.
            LOGGER.warning("History unavailable for %s: %s", ", ".join(entity_ids), err)
            return {}
        return {entity_id: [Change(state.last_updated.timestamp(), state.state) for state in states if hasattr(state, "last_updated")]
                for entity_id, states in result.items()}

    async def _load_history(self) -> None:
        """Six hours of pressure and wind for the charts and trends; today's gusts and the last hour of temperature when the station has no sensor for them."""
        s, now = self.settings, dt_util.utcnow()
        derived = s.station_history
        ids = sorted({s.pressure_entity, s.wind_speed_entity, s.wind_gust_entity,
                      s.temperature_entity if derived and not s.temperature_trend_entity else None} - {None, ""})
        if not ids:
            self.history = {}
            return
        start = now - timedelta(hours=6)
        if derived and not s.max_daily_gust_entity and s.wind_gust_entity:
            start = min(start, dt_util.start_of_local_day())
        self.history = await self._states_during(start, ids)

    async def _load_rain(self) -> None:
        """Eight days of the daily rain counter and the total counter; long-term statistics of the total for weeks, months and the year."""
        s, now = self.settings, dt_util.utcnow()
        ids = sorted({s.daily_rain_entity, s.rain_total_entity if s.station_history else None} - {None, ""})
        self.rain_history = await self._states_during(now - timedelta(days=8), ids) if ids else {}
        self.statistics, self.statistics_unit = await self._rain_statistics(now)

    async def _rain_statistics(self, now: datetime) -> tuple[list[Statistic], str | None]:
        s = self.settings
        entity_id = s.rain_total_entity
        state = self.hass.states.get(entity_id) if entity_id and s.station_history else None
        if state is None or state.attributes.get("state_class") != "total_increasing":
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


def _seconds(value: Any) -> float:
    return value.timestamp() if isinstance(value, datetime) else float(value)
