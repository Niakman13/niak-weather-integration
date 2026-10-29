"""Recorder contract: weather attributes, not its textual sunny/cloudy state."""
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, patch

try:
    from homeassistant.core import State
except ImportError:
    raise unittest.SkipTest('Home Assistant is not installed')

from custom_components.hestia_weather.coordinator import HestiaWeatherCoordinator
from custom_components.hestia_weather.engine.series import weather_history_key
from custom_components.hestia_weather.engine.settings import Settings


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
        with patch('custom_components.hestia_weather.place.recorder.get_instance', return_value=recorder), \
             patch('custom_components.hestia_weather.place.recorder.history.get_significant_states', return_value={'weather.home': rows}) as query:
            result = await HestiaWeatherCoordinator._states_during(subject, now - timedelta(hours=6), ['weather.home'])
        self.assertFalse(query.call_args.kwargs['no_attributes'])
        self.assertFalse(query.call_args.kwargs['significant_changes_only'])
        self.assertFalse(query.call_args.kwargs['minimal_response'])
        self.assertEqual([c.state for c in result[weather_history_key('weather.home', 'pressure')]], ['1010.0', '1012.0'])
        self.assertEqual(result[weather_history_key('weather.home', 'wind_speed')][0].state, '36.0')

    async def test_weather_only_place_still_requests_history(self):
        subject = SimpleNamespace(settings=Settings(weather_entity='weather.home'), history={}, _states_during=AsyncMock(return_value={}))
        await HestiaWeatherCoordinator._load_history(subject)
        self.assertEqual(subject._states_during.call_args.args[1], ['weather.home'])

    async def test_rain_history_does_not_fetch_unneeded_attributes(self):
        async def execute(job):
            return job()
        recorder = SimpleNamespace(async_add_executor_job=AsyncMock(side_effect=execute))
        subject = SimpleNamespace(hass=object(), settings=Settings(weather_entity='weather.home'))
        with patch('custom_components.hestia_weather.place.recorder.get_instance', return_value=recorder), \
             patch('custom_components.hestia_weather.place.recorder.history.get_significant_states', return_value={}) as query:
            await HestiaWeatherCoordinator._states_during(subject, datetime.now(timezone.utc), ['sensor.rain'])
        self.assertTrue(query.call_args.kwargs['no_attributes'])


class CompactWeekTests(unittest.IsolatedAsyncioTestCase):
    async def test_a_chatty_sensor_without_statistics_is_read_compacted(self):
        """A week of a sensor every 10 s, without long-term statistics: read day by day, its jitter once a minute."""
        now = datetime(2026, 10, 29, tzinfo=timezone.utc)
        start = now - timedelta(days=7)
        def significant(hass, begin, end, entity_ids, *args):
            steps = int((end - begin).total_seconds() // 10)
            return {'sensor.p': [State('sensor.p', str(1012 + (i % 2) / 10), last_updated=begin + timedelta(seconds=10 * i),
                                       last_changed=begin + timedelta(seconds=10 * i)) for i in range(steps)]}
        async def execute(job, *args):
            return job(*args)
        recorder = SimpleNamespace(async_add_executor_job=AsyncMock(side_effect=execute))
        subject = SimpleNamespace(hass=object())
        with patch('custom_components.hestia_weather.place.recorder.get_instance', return_value=recorder), \
             patch('homeassistant.components.recorder.history.get_significant_states', significant) as query:
            changes = await HestiaWeatherCoordinator._compact_states(subject, start, now, 'sensor.p')
        self.assertLess(len(changes), 7 * 24 * 60 + 10)  # 60 480 rows read, about one a minute kept
        self.assertEqual(changes[0].state, '1012.0')
