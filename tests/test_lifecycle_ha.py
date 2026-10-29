"""A place reloaded at every settings change: nothing of the old one may keep running beside the new one."""
import tempfile
import unittest
from unittest.mock import AsyncMock, patch

try:
    from homeassistant.config_entries import ConfigEntries, ConfigEntry, ConfigEntryState
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers import device_registry as dr, entity_registry as er
except ImportError:
    raise unittest.SkipTest('Home Assistant is not installed')

from custom_components.niak_weather.coordinator import NiakWeatherCoordinator

LOADS = ('_load_forecasts', '_load_history', '_load_rain', '_load_week', '_load_air_forecast', '_load_strikes', '_load_lightning_month')


class LifecycleTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.hass = HomeAssistant(self.temp.name)
        self.hass.config_entries = ConfigEntries(self.hass, {})
        await self.hass.config_entries.async_initialize()
        dr.async_setup(self.hass)
        await dr.async_load(self.hass)
        await er.async_load(self.hass)

    async def asyncTearDown(self):
        await self.hass.async_stop()
        self.temp.cleanup()

    async def test_a_place_unloaded_leaves_no_listener_nor_timer(self):
        self.hass.states.async_set('weather.home', 'sunny', {})
        self.hass.states.async_set('sensor.pressure', '1012', {'unit_of_measurement': 'hPa'})
        entry = ConfigEntry(domain='niak_weather', title='Maison', unique_id='maison', version=1, minor_version=1, source='user',
                            data={}, options={'weather_entity': 'weather.home', 'pressure_entity': 'sensor.pressure'},
                            discovery_keys={}, subentries_data=[])
        self.hass.config_entries._entries[entry.entry_id] = entry
        entry._async_set_state(self.hass, ConfigEntryState.SETUP_IN_PROGRESS, None)
        before = dict(self.hass.bus.async_listeners())
        timers = len(self.hass.loop._scheduled)
        coordinator = NiakWeatherCoordinator(self.hass, entry)
        with patch.multiple(NiakWeatherCoordinator, **{name: AsyncMock() for name in LOADS}), \
                patch.object(NiakWeatherCoordinator, 'async_config_entry_first_refresh', AsyncMock()):
            await coordinator.async_start()
        self.assertGreater(len(self.hass.loop._scheduled), timers)  # the periodic loads are planned
        await entry._async_process_on_unload(self.hass)
        await coordinator.async_shutdown()
        self.assertEqual(dict(self.hass.bus.async_listeners()), before)
        self.assertEqual(len([t for t in self.hass.loop._scheduled if not t.cancelled()]), timers)
        self.assertIsNone(coordinator._cancel_retry)
