"""Météo-France's « original condition » sensor, found beside the weather entity. Skipped without Home Assistant
(the engine's tests run without it): ~/hestia-ha-test/venv/bin/python -m unittest tests/test_original_condition_ha.py"""
from pathlib import Path
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import patch

try:
    import homeassistant  # noqa: F401
except ImportError:  # pragma: no cover - the engine's own test run
    raise unittest.SkipTest("Home Assistant is not installed")

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from custom_components.hestia_weather import coordinator  # noqa: E402


def entry(entity_id: str, unique_id: str, platform: str = "meteo_france", disabled_by: str | None = None) -> SimpleNamespace:
    return SimpleNamespace(entity_id=entity_id, domain=entity_id.split(".")[0], unique_id=unique_id, platform=platform,
                           disabled_by=disabled_by, config_entry_id="mf")


class Registry:
    def __init__(self, *entries: SimpleNamespace) -> None:
        self.entries = {e.entity_id: e for e in entries}

    def async_get(self, entity_id: str) -> SimpleNamespace | None:
        return self.entries.get(entity_id)


def find(*entries: SimpleNamespace, weather: str = "weather.gardanne") -> str | None:
    registry = Registry(*entries)
    with patch.object(coordinator.er, "async_entries_for_config_entry", lambda r, _: list(r.entries.values())):
        return coordinator.original_condition(registry, weather)  # type: ignore[arg-type]


WEATHER = entry("weather.gardanne", "43.45,5.47")
DAILY = entry("sensor.gardanne_daily_original_condition", "43.45,5.47_daily_original_condition")
NOW = entry("sensor.gardanne_original_condition", "43.45,5.47_original_condition")


class OriginalConditionTests(unittest.TestCase):
    def test_finds_the_sensor_of_the_current_description(self):
        self.assertEqual(find(WEATHER, DAILY, NOW), "sensor.gardanne_original_condition")

    def test_leaves_the_daily_one_aside(self):
        self.assertIsNone(find(WEATHER, DAILY))

    def test_a_disabled_sensor_does_not_count(self):
        self.assertIsNone(find(WEATHER, entry(NOW.entity_id, NOW.unique_id, disabled_by="integration")))

    def test_only_for_meteo_france(self):
        self.assertIsNone(find(entry("weather.gardanne", "x", platform="met"), NOW))


class RadarRainTests(unittest.TestCase):
    def radar(self, *entries: SimpleNamespace, weather: str = "weather.gardanne") -> str | None:
        registry = Registry(*entries)
        with patch.object(coordinator.er, "async_entries_for_config_entry", lambda r, _: list(r.entries.values())):
            return coordinator.radar_rain(registry, weather)  # type: ignore[arg-type]

    def test_finds_the_rain_within_the_hour_beside_the_weather_entity(self):
        rain = entry("sensor.gardanne_next_rain", "43.45,5.47_next_rain")
        self.assertEqual(self.radar(WEATHER, NOW, rain), "sensor.gardanne_next_rain")

    def test_none_without_meteo_france(self):
        self.assertIsNone(self.radar(entry("weather.gardanne", "x", platform="met"), entry("sensor.gardanne_next_rain", "x_next_rain")))
