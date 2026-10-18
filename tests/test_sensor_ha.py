"""The « Bulletin du jour » sensor, for automations that read the forecast aloud or send it. Skipped without Home Assistant
(the engine's tests run without it): ../ha-test/venv/bin/python -m unittest tests/test_sensor_ha.py"""
from pathlib import Path
import sys
from types import SimpleNamespace
import unittest

try:
    import homeassistant  # noqa: F401
except ImportError:  # pragma: no cover - the engine's own test run
    raise unittest.SkipTest("Home Assistant is not installed")

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from custom_components.niak_weather.engine import families  # noqa: E402
from custom_components.niak_weather.sensor import OBJECT_IDS, SENSORS, NiakWeatherSensor  # noqa: E402

BULLETIN = next(d for d in SENSORS if d.key == "bulletin")
TEXT = "Cet après-midi, pluie toute la journée (1,7 mm) ; jusqu’à 12 °C. Ce soir et cette nuit, la pluie cesse vers 19 h, puis ciel couvert."


def snapshot(bulletin: dict | None) -> SimpleNamespace:
    return SimpleNamespace(view={"bulletin": bulletin} if bulletin is not None else {})


class BulletinSensorTests(unittest.TestCase):
    def test_gives_the_text_and_each_period(self):
        s = snapshot({"summary": TEXT, "periods": [{"label": "Cet après-midi", "text": "Pluie toute la journée.", "icon": "x"},
                                                    {"label": "Ce soir et cette nuit", "text": "La pluie cesse vers 19 h."}]})
        self.assertEqual(BULLETIN.value(s), TEXT)
        self.assertEqual(BULLETIN.attributes(s), {"text": TEXT, "periods": [
            {"label": "Cet après-midi", "text": "Pluie toute la journée."}, {"label": "Ce soir et cette nuit", "text": "La pluie cesse vers 19 h."}]})

    def test_a_long_bulletin_stays_whole_in_the_attribute(self):
        long = TEXT * 3
        s = snapshot({"summary": long, "periods": []})
        self.assertEqual(len(BULLETIN.value(s)), 255)
        self.assertEqual(BULLETIN.attributes(s)["text"], long)

    def test_unknown_without_a_forecast(self):
        self.assertIsNone(BULLETIN.value(snapshot(None)))
        self.assertEqual(BULLETIN.attributes(snapshot(None)), {"text": None, "periods": []})

    def test_named_enabled_with_the_next_hours_and_kept_out_of_the_recorder(self):
        self.assertEqual(OBJECT_IDS["bulletin"], "bulletin_du_jour")
        self.assertEqual(families.family_of("bulletin"), "prochaines_heures")
        self.assertIn("prochaines_heures", families.DEFAULT_FAMILIES)
        self.assertTrue({"text", "periods"} <= NiakWeatherSensor._unrecorded_attributes)


if __name__ == "__main__":
    unittest.main()
