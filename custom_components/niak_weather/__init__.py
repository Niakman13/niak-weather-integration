"""Niak Weather: the brain of the weather at home. It reads the station, the forecast and the air quality, computes what
they mean, exposes the results as sensors and sends the Niak Weather card everything it shows."""
from __future__ import annotations

from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN
from .coordinator import NiakWeatherConfigEntry, NiakWeatherCoordinator, alert_store
from .services import async_setup_services
from .websocket import async_setup_websocket

PLATFORMS = [Platform.SENSOR, Platform.BINARY_SENSOR, Platform.WEATHER]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    async_setup_websocket(hass)
    async_setup_services(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: NiakWeatherConfigEntry) -> bool:
    coordinator = NiakWeatherCoordinator(hass, entry)
    await coordinator.async_start()
    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: NiakWeatherConfigEntry) -> bool:
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: NiakWeatherConfigEntry) -> None:
    """The place is removed: its alerts in progress go with it."""
    await alert_store(hass, entry.entry_id).async_remove()


async def _async_reload(hass: HomeAssistant, entry: NiakWeatherConfigEntry) -> None:
    """New settings: start again from them."""
    await hass.config_entries.async_reload(entry.entry_id)
