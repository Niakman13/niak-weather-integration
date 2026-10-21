"""The coordinator keeps Blitzortung's strikes: each new distance live, the last hour from the Recorder after a restart. Skipped without
Home Assistant (the engine's tests run without it): ../ha-test/venv/bin/python -m unittest tests/test_lightning_ha.py"""
import asyncio
from datetime import timedelta
from pathlib import Path
import sys
from types import SimpleNamespace
import unittest

try:
    from homeassistant.core import State
    from homeassistant.util import dt as dt_util
except ImportError:  # pragma: no cover - the engine's own test run
    raise unittest.SkipTest("Home Assistant is not installed")

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from custom_components.niak_weather.coordinator import NiakWeatherCoordinator  # noqa: E402
from custom_components.niak_weather.engine import lightning  # noqa: E402
from custom_components.niak_weather.engine.settings import Settings  # noqa: E402
from custom_components.niak_weather.engine.trends import Change  # noqa: E402

DISTANCE = "sensor.blitzortung_distance"


def coordinator(states: dict[str, State] | None = None) -> NiakWeatherCoordinator:
    """Only what the strikes need: the settings, the home's position, the states."""
    c = object.__new__(NiakWeatherCoordinator)
    c.settings = Settings(weather_entity="weather.home", lightning_entity=DISTANCE)
    c.strikes, c.data = [], None
    c.hass = SimpleNamespace(config=SimpleNamespace(latitude=43.455, longitude=5.469), states=SimpleNamespace(get=(states or {}).get))
    return c


def changed(new: State) -> SimpleNamespace:
    return SimpleNamespace(data={"entity_id": new.entity_id, "new_state": new, "old_state": None})


class StrikeTests(unittest.TestCase):
    def test_each_new_distance_is_a_strike_with_its_direction(self):
        c = coordinator()
        c._on_state_change(changed(State(DISTANCE, "12.4", {"unit_of_measurement": "km", "lat": 43.38, "lon": 5.37})))
        c._on_state_change(changed(State(DISTANCE, "12.4", {"unit_of_measurement": "km", "lat": 43.39, "lon": 5.38})))
        self.assertEqual(len(c.strikes), 2)
        self.assertEqual(lightning.direction_words(c.strikes[0].azimuth), "au sud-ouest")

    def test_unknown_after_a_quiet_spell_is_not_a_strike(self):
        c = coordinator()
        c._on_state_change(changed(State(DISTANCE, "unknown")))
        c._on_state_change(changed(State("sensor.other", "5")))
        self.assertEqual(c.strikes, [])

    def test_the_last_hour_comes_back_from_the_recorder(self):
        now = dt_util.utcnow().timestamp()
        c = coordinator({DISTANCE: State(DISTANCE, "unknown", {"unit_of_measurement": "km"})})

        async def during(start, ids):
            return {DISTANCE: [Change(now - 7200, "3.0"), Change(now - 600, "18.0"), Change(now - 300, "unknown"), Change(now - 120, "15.5")]}
        c._states_during = during
        asyncio.run(c._load_strikes())
        self.assertEqual([s.distance for s in c.strikes], [18.0, 15.5])
        seen = lightning.read(c.strikes, now)
        self.assertTrue(seen.near)
        self.assertEqual(seen.text, "Orage à 16 km")  # no position from the Recorder: no direction


if __name__ == "__main__":
    unittest.main()
