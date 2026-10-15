"""Recorder contract: weather attributes, not its textual sunny/cloudy state."""
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, patch

try:
    from homeassistant.core import State
except ImportError:
    raise unittest.SkipTest('Home Assistant is not installed')

from custom_components.niak_weather.coordinator import NiakWeatherCoordinator
from custom_components.niak_weather.engine.series import weather_history_key
from custom_components.niak_weather.engine.settings import Settings


class WeatherHistoryTests(unittest.IsolatedAsyncioTestCase):
    async def test_attribute_only_updates_are_requested_and_decoded(self):
        now = datetime.now(timezone.utc)
        rows = [State('weather.home', 'sunny', {'wind_speed': 10, 'wind_speed_unit': 'm/s', 'pressure': pressure},
                      last_updated=now - timedelta(minutes=offset)) for offset, pressure in ((60, 1010), (30, 1012))]
        # Calling the real adapter against a Recorder executor double isolates the DB query contract.
        async def execute(job):
            return job()
        recorder = SimpleNamespace(async_add_executor_job=AsyncMock(side_effect=execute))
        subject = SimpleNamespace(hass=object(), settings=Settings(weather_entity='weather.home'))
        with patch('custom_components.niak_weather.coordinator.get_instance', return_value=recorder), \
             patch('custom_components.niak_weather.coordinator.history.get_significant_states', return_value={'weather.home': rows}) as query:
            result = await NiakWeatherCoordinator._states_during(subject, now - timedelta(hours=6), ['weather.home'])
        self.assertFalse(query.call_args.kwargs['no_attributes'])
        self.assertFalse(query.call_args.kwargs['significant_changes_only'])
        self.assertFalse(query.call_args.kwargs['minimal_response'])
        self.assertEqual([c.state for c in result[weather_history_key('weather.home', 'pressure')]], ['1010.0', '1012.0'])
        self.assertEqual(result[weather_history_key('weather.home', 'wind_speed')][0].state, '36.0')

    async def test_weather_only_place_still_requests_history(self):
        subject = SimpleNamespace(settings=Settings(weather_entity='weather.home'), _states_during=AsyncMock(return_value={}))
        await NiakWeatherCoordinator._load_history(subject)
        self.assertEqual(subject._states_during.call_args.args[1], ['weather.home'])

    async def test_rain_history_does_not_fetch_unneeded_attributes(self):
        async def execute(job):
            return job()
        recorder = SimpleNamespace(async_add_executor_job=AsyncMock(side_effect=execute))
        subject = SimpleNamespace(hass=object(), settings=Settings(weather_entity='weather.home'))
        with patch('custom_components.niak_weather.coordinator.get_instance', return_value=recorder), \
             patch('custom_components.niak_weather.coordinator.history.get_significant_states', return_value={}) as query:
            await NiakWeatherCoordinator._states_during(subject, datetime.now(timezone.utc), ['sensor.rain'])
        self.assertTrue(query.call_args.kwargs['no_attributes'])
