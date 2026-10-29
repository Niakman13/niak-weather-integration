"""Entity ids: a new home gets « hestia_weather… », a home set up under the old name keeps « niak_weather… ». Skipped without Home
Assistant (the engine's tests run without it): ../ha-test/venv/bin/python -m unittest tests/test_entity_ids_ha.py"""
from pathlib import Path
import sys
import tempfile
import unittest

try:
    from homeassistant.config_entries import ConfigEntries, ConfigEntry
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers import device_registry as dr, entity_registry as er
except ImportError:  # pragma: no cover - the engine's own test run
    raise unittest.SkipTest("Home Assistant is not installed")

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from custom_components.niak_weather.sensor import device_name, prefix  # noqa: E402


class EntityIdTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.hass = HomeAssistant(self.directory.name)
        self.hass.config_entries = ConfigEntries(self.hass, {})
        await self.hass.config_entries.async_initialize()
        dr.async_setup(self.hass)
        await dr.async_load(self.hass)
        await er.async_load(self.hass)

    async def asyncTearDown(self):
        await self.hass.async_stop()
        self.directory.cleanup()

    def place(self, title: str, entity_ids: tuple[str, ...] = ()) -> ConfigEntry:
        entry = ConfigEntry(version=1, minor_version=1, domain="niak_weather", title=title, data={}, source="user", options={},
                            unique_id=title, discovery_keys={}, subentries_data=None)
        self.hass.config_entries._entries[entry.entry_id] = entry
        registry = er.async_get(self.hass)
        for n, entity_id in enumerate(entity_ids):
            domain, object_id = entity_id.split(".", 1)
            registry.async_get_or_create(domain, "niak_weather", f"{entry.entry_id}_{n}", suggested_object_id=object_id, config_entry=entry)
        return entry

    async def test_a_new_home_gets_the_hestia_name(self):
        entry = self.place("Gardanne")
        self.assertEqual(prefix(self.hass, entry), "hestia_weather")
        self.assertEqual(device_name(self.hass, entry), "Hestia Weather")

    async def test_a_home_set_up_under_the_old_name_keeps_its_ids(self):
        entry = self.place("Gardanne", ("sensor.niak_weather_humidex", "weather.niak_weather"))
        self.assertEqual(prefix(self.hass, entry), "niak_weather")
        self.assertEqual(device_name(self.hass, entry), "Hestia Weather")

    async def test_the_next_places_add_their_name_in_either_family(self):
        first = self.place("Gardanne", ("sensor.niak_weather_humidex",))
        second = self.place("Marseille", ("sensor.niak_weather_marseille_humidex",))
        self.assertEqual(prefix(self.hass, first), "niak_weather")
        self.assertEqual(prefix(self.hass, second), "niak_weather_marseille")
        self.assertEqual(device_name(self.hass, second), "Hestia Weather Marseille")

    async def test_a_new_second_place_is_named_after_the_hestia_root(self):
        first = self.place("Gardanne")
        second = self.place("Marseille")
        self.assertEqual(prefix(self.hass, first), "hestia_weather")
        self.assertEqual(prefix(self.hass, second), "hestia_weather_marseille")

    async def test_one_renamed_entity_does_not_change_the_rest_of_a_home(self):
        entry = self.place("Gardanne", ("sensor.niak_weather_humidex", "sensor.my_own_name"))
        self.assertEqual(prefix(self.hass, entry), "niak_weather")


if __name__ == "__main__":
    unittest.main()
