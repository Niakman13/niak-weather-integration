"""Card resources with real HA collections: migration, loading modes and fallback."""
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

try:
    from homeassistant.core import HomeAssistant
    from homeassistant.components.lovelace import LovelaceData
    from homeassistant.components.lovelace.resources import ResourceStorageCollection, ResourceYAMLCollection
except ImportError:
    raise unittest.SkipTest('Home Assistant is not installed')

from custom_components.hestia_weather import socle


class CardResourceTests(unittest.IsolatedAsyncioTestCase):
    URL = '/hestia_weather-assets/hestia-weather-card.js'

    async def asyncSetUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.hass = HomeAssistant(self.temp.name)
        self.resources = ResourceStorageCollection(self.hass, SimpleNamespace(async_load=AsyncMock(return_value={})))
        self.hass.data['lovelace'] = LovelaceData('storage', {}, self.resources, {})

    async def asyncTearDown(self):
        await self.hass.async_stop()
        self.temp.cleanup()

    async def register(self):
        callbacks = []
        with patch.object(socle, 'async_at_started', side_effect=lambda hass, cb: callbacks.append(cb)):
            await socle.async_register_card(self.hass, self.URL, 'next')
        self.assertEqual(len(callbacks), 1)
        await callbacks[0](self.hass)

    async def test_storage_registers_only_a_dashboard_resource(self):
        with patch.object(socle.frontend, 'add_extra_js_url') as extra:
            await self.register()
            await self.register()
        extra.assert_not_called()
        self.assertTrue(self.resources.loaded)
        self.assertEqual([(r['url'], r['type']) for r in self.resources.async_items()], [(self.URL + '?v=next', 'module')])

    async def test_yaml_uses_guarded_extra_module_without_changing_yaml(self):
        items = [{'url': '/other.js', 'type': 'module'}]
        self.hass.data['lovelace'] = LovelaceData('yaml', {}, ResourceYAMLCollection(items), {})
        with patch.object(socle.frontend, 'add_extra_js_url') as extra:
            await self.register()
        extra.assert_called_once_with(self.hass, self.URL + '?v=next')
        self.assertEqual(items, [{'url': '/other.js', 'type': 'module'}])

    async def test_registration_failure_logs_and_falls_back(self):
        with patch.object(socle, '_card_resource', AsyncMock(side_effect=RuntimeError('storage failed'))), \
             patch.object(socle.frontend, 'add_extra_js_url') as extra, \
             self.assertLogs(socle.__name__, level='WARNING'):
            await self.register()
        extra.assert_called_once_with(self.hass, self.URL + '?v=next')

    async def test_encoded_workaround_is_migrated_and_duplicates_removed(self):
        await self.resources.async_create_item({'url': self.URL.replace('-', '%2D') + '?v=old', 'res_type': 'js'})
        await self.resources.async_create_item({'url': self.URL + '?v=old', 'res_type': 'module'})
        other = await self.resources.async_create_item({'url': '/hacsfiles/other.js', 'res_type': 'module'})
        await self.register()
        self.assertEqual([(r['url'], r['type']) for r in self.resources.async_items()], [(self.URL + '?v=next', 'module'), (other['url'], 'module')])
        await socle.async_remove_card(self.hass, self.URL)
        self.assertEqual(self.resources.async_items(), [other])

    async def test_existing_script_resource_becomes_a_module(self):
        await self.resources.async_create_item({'url': self.URL + '?v=next', 'res_type': 'js'})
        await self.register()
        self.assertEqual(self.resources.async_items()[0]['type'], 'module')

    async def test_only_the_exact_local_asset_is_owned(self):
        self.assertTrue(socle.is_card_resource(self.URL.replace('-', '%2d') + '?v=old#fragment', self.URL))
        for value in ('https://example.org' + self.URL, '//example.org' + self.URL, self.URL + '.backup', '/hacsfiles/hestia-weather-card.js'):
            self.assertFalse(socle.is_card_resource(value, self.URL), value)

    async def test_encoded_workaround_is_not_an_old_hacs_install(self):
        if 'weather' not in self.URL:
            return
        from custom_components.hestia_weather.panel import card_twice
        await self.resources.async_create_item({'url': self.URL.replace('-', '%2D') + '?v=old', 'res_type': 'module'})
        self.assertFalse(await card_twice(self.hass))
        await self.resources.async_create_item({'url': '/hacsfiles/hestia-weather/hestia-weather-card.js', 'res_type': 'module'})
        self.assertTrue(await card_twice(self.hass))
