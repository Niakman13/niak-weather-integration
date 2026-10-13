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

    def add_listener(self, entry_id: str | None, update: Callable[[], None]) -> Callable[[], None]:
        """Calls `update` whenever this place is recomputed (new measures or forecasts)."""
        entry = self._entry(entry_id)
        if entry is None:
            return lambda: None
        return entry.runtime_data.async_add_listener(update)
