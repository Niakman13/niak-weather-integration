"""« Télécharger les diagnostics »: one file that explains a place, without saying where the home is."""
from datetime import datetime, timezone
import json
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, patch

try:
    from homeassistant.core import State
except ImportError:
    raise unittest.SkipTest('Home Assistant is not installed')

from custom_components.niak_weather.diagnostics import async_get_config_entry_diagnostics
from custom_components.niak_weather.engine.series import Change


class DiagnosticsTests(unittest.IsolatedAsyncioTestCase):
    async def test_the_place_is_explained_without_its_location(self):
        when = datetime(2026, 10, 29, 9, tzinfo=timezone.utc)
        states = {'sensor.pressure': State('sensor.pressure', '1012', {'unit_of_measurement': 'hPa', 'entity_picture': 'x'}, last_updated=when)}
        hass = SimpleNamespace(states=SimpleNamespace(get=states.get))
        coordinator = SimpleNamespace(last_update_success=True, forecast_at=when, forecast_rows={'hourly': [{}] * 48, 'daily': [{}] * 7},
                                      hours=[1] * 48, days=[1] * 7, history={'sensor.pressure': [Change(when.timestamp(), '1012')]},
                                      rain_history={}, statistics=[], statistics_unit=None, strikes=[SimpleNamespace(latitude=43.3, longitude=5.4)],
                                      lightning_month=12, air_forecast=None)
        entry = SimpleNamespace(title='Maison', state=SimpleNamespace(value='loaded'), runtime_data=coordinator,
                                options={'pressure_entity': 'sensor.pressure', 'missing_entity': 'sensor.gone', 'location': 'Marseille',
                                         'atmo_area': '13055', 'waqi_place': 'Marseille Thiers'})
        with patch('custom_components.niak_weather.diagnostics.async_get_integration', AsyncMock(return_value=SimpleNamespace(version='2.9.3'))):
            result = await async_get_config_entry_diagnostics(hass, entry)
        json.dumps(result)  # Home Assistant writes it as JSON.
        self.assertEqual(result['states']['sensor.pressure']['attributes'], {'unit_of_measurement': 'hPa'})
        self.assertTrue(result['states']['sensor.gone']['missing'])
        for key in ('location', 'atmo_area', 'waqi_place'):
            self.assertEqual(result['place']['options'][key], '**REDACTED**')
        self.assertEqual(result['loaded']['strikes'], 1)
        self.assertEqual(result['loaded']['history']['sensor.pressure'], {'changes': 1, 'last': when.isoformat()})
        self.assertNotIn('43.3', json.dumps(result))
