"""The interface Niak Weather publishes for the other Niak bricks (version 1).

Other bricks read `hass.data["niak_weather_api"]` and check `version` before using it.
They never read Niak Weather's own settings: this object is the contract, and it only grows
compatibly within a major version.
"""
from __future__ import annotations
from typing import TYPE_CHECKING, Any, Callable

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

# Kept free of Home Assistant imports so that it can be tested like the engine.
DOMAIN = "niak_weather"

API_KEY = "niak_weather_api"
API_VERSION = 1
# Station roles published to the other bricks, mapped to Niak Weather's own settings.
STATION = {"temperature": "temperature_entity", "humidity": "humidity_entity", "rain_rate": "rain_rate_entity",
           "wind_speed": "wind_speed_entity", "wind_gust": "wind_gust_entity", "wind_bearing": "wind_bearing_entity",
           "solar_radiation": "solar_radiation_entity", "uv_index": "uv_index_entity", "pressure": "pressure_entity"}


class NiakWeatherApi:
    version = API_VERSION

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        # How many listeners each brick has on each place: (entry_id, brick) → count.
        self._links: dict[tuple[str, str], int] = {}

    def _entries(self):
        return [e for e in self.hass.config_entries.async_entries(DOMAIN) if getattr(e.state, "value", e.state) == "loaded"]

    def _entry(self, entry_id: str | None):
        entries = self._entries()
        if entry_id:
            return next((e for e in entries if e.entry_id == entry_id), None)
        return entries[0] if len(entries) == 1 else None

    def places(self) -> list[dict[str, str]]:
        """The configured places, for a brick that must let the user choose one."""
        return [{"entry_id": e.entry_id, "title": e.title} for e in self._entries()]

    def station(self, entry_id: str | None = None) -> dict[str, Any] | None:
        """The station sensors chosen in Niak Weather, by role. Roles without a sensor are left out."""
        entry = self._entry(entry_id)
        if entry is None:
            return None
        settings = entry.runtime_data.settings
        sensors = {role: getattr(settings, name) for role, name in STATION.items() if getattr(settings, name, None)}
        return {"entry_id": entry.entry_id, "title": entry.title, "sensors": sensors}

    def hourly(self, entry_id: str | None = None) -> list[dict[str, Any]]:
        """The hourly forecast as Niak Weather reads it: °C, %, mm, km/h and degrees, ISO times."""
        entry = self._entry(entry_id)
        if entry is None:
            return []
        return [{"time": h.time.isoformat(), "temperature": h.temperature, "humidity": h.humidity,
                 "precipitation": h.precipitation, "wind_speed": h.wind_speed, "wind_gust": h.wind_gust,
                 "wind_bearing": h.wind_bearing, "condition": h.condition}
                for h in entry.runtime_data.hours if h.time is not None]

    def air(self, entry_id: str | None = None) -> dict[str, Any] | None:
        """Today's outdoor air from the source chosen in Niak Weather, on Atmo's scale: 1 Bon to 6 Extrêmement mauvais.

        `source` is « atmo » (the regional index of the day) or « waqi » (a station's measure); `entity_id` its sensor.
        `index` is None while the source does not answer. None without a place or without an air source."""
        entry = self._entry(entry_id)
        if entry is None:
            return None
        settings = entry.runtime_data.settings
        waqi = settings.air_source == "waqi"
        entity_id = settings.waqi.get("waqi_air_entity") if waqi else settings.atmo.get("atmo_air_entity")
        if settings.air_source == "none" or not entity_id:
            return None
        data = getattr(entry.runtime_data, "data", None)
        item = data.catalogue.get("qualite_air") if data is not None else None
        index = item.value if item is not None and isinstance(item.value, int) and 1 <= item.value <= 6 else None
        return {"entry_id": entry.entry_id, "source": "waqi" if waqi else "atmo", "provider": "WAQI" if waqi else "Atmo France",
                "entity_id": entity_id, "index": index, "label": item.extra.get("libelle") if index is not None else None,
                "at": data.computed.isoformat() if data is not None else None}

    def season(self, entry_id: str | None = None) -> dict[str, Any] | None:
        """Today's season for this place, as Niak Weather shows it: the Season sensor chosen in its settings when it
        answers, else the astronomical date. `season` is « spring », « summer », « autumn » or « winter »;
        `day_length` the hours of daylight. None without a place."""
        entry = self._entry(entry_id)
        if entry is None:
            return None
        from datetime import datetime, timezone
        from zoneinfo import ZoneInfo
        try:
            from .engine.season import current_season
        except ImportError:  # loaded on its own, as by the tests
            from engine.season import current_season
        found = current_season(self.hass.states.get, entry.runtime_data.settings.season_entity, datetime.now(timezone.utc),
                               ZoneInfo(self.hass.config.time_zone), self.hass.config.latitude, self.hass.config.elevation or 0)
        return {"entry_id": entry.entry_id, "season": found.season, "label": found.label, "from_sensor": found.from_sensor,
                "days_in": found.days_in, "day_length": found.day_length}

    def rain(self, entry_id: str | None = None) -> dict[str, Any] | None:
        """When the next rain starts. `minutes` (0: due now) with `precision` « minute » when Météo-France's radar
        forecast says it, « hour » when only the hourly forecast does (the rain falls somewhere in that hour);
        `dry_until`: the end of the hour the radar sees dry. None without a place or before the first calculation."""
        entry = self._entry(entry_id)
        data = getattr(entry.runtime_data, "data", None) if entry is not None else None
        if data is None:
            return None
        return {"entry_id": entry.entry_id, **data.rain_ahead, "at": data.computed.isoformat()}

    def add_listener(self, entry_id: str | None, update: Callable[[], None], brick: str | None = None) -> Callable[[], None]:
        """Calls `update` whenever this place is recomputed (new measures or forecasts).

        `brick`: the listener's own domain (« niak_comfort »), so that Niak Weather's settings show it linked to this place."""
        entry = self._entry(entry_id)
        if entry is None:
            return lambda: None
        remove = entry.runtime_data.async_add_listener(update)
        key = (entry.entry_id, brick or "")
        self._links[key] = self._links.get(key, 0) + 1

        stopped = False

        def stop() -> None:
            nonlocal stopped
            if stopped:
                return
            stopped = True
            remove()
            self._links[key] -= 1
        return stop

    def linked(self, entry_id: str) -> dict[str, int]:
        """The bricks listening to this place, by domain ("" for those that did not say who they are)."""
        return {brick: n for (place, brick), n in self._links.items() if place == entry_id and n}
