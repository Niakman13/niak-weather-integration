"""The daily bulletin (ported from the card's bulletin tests)."""
import math
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Callable
from zoneinfo import ZoneInfo

from engine.bulletin import build_bulletin
from engine.forecast import parse_hours

PARIS = ZoneInfo("Europe/Paris")


def plan(start: str, n: int, at: Callable[[int], dict[str, Any]]):
    """Hourly forecast from `start` for `n` hours; `at(h)` gives the fields of hour h."""
    first = datetime.fromisoformat(start)
    return parse_hours({"datetime": (first + timedelta(hours=h)).isoformat(), **at(h)} for h in range(n))


def utc(text: str) -> datetime:
    return datetime.fromisoformat(text).replace(tzinfo=timezone.utc)


def test_reads_the_next_four_parts_of_the_day_in_the_morning() -> None:
    # 8 Oct 2026, 09:30 Paris; forecasts from 10:00.
    b = build_bulletin(plan("2026-10-08T08:00:00+00:00", 24, lambda h: {"condition": "sunny" if h < 10 else "clear-night", "temperature": 15 + math.sin(h / 4) * 4,
                                                                          "precipitation": 0, "wind_speed": 8, "wind_bearing": 270}), utc("2026-10-08T07:30:00"), PARIS)
    assert [p.label for p in b.periods] == ["Ce matin", "Cet après-midi", "Ce soir", "Cette nuit"]
    assert b.summary.startswith("Beau temps ce matin et jusqu’à cette nuit.")
    assert "Pas de pluie attendue." in b.summary and "Vent" not in b.summary


def test_switches_to_tonight_and_tomorrow_in_the_evening() -> None:
    b = build_bulletin(plan("2026-10-08T17:00:00+00:00", 24, lambda h: {"condition": "cloudy", "temperature": 12, "wind_speed": 5}), utc("2026-10-08T16:30:00"), PARIS)
    assert [p.label for p in b.periods] == ["Ce soir", "Cette nuit", "Demain matin", "Demain après-midi"]
    assert b.summary.startswith("Ciel couvert ce soir et jusqu’à demain après-midi. Autour de 12 °C.")


def test_storms_and_real_rain_lead_with_amounts_and_strong_wind_with_gusts() -> None:
    # From 10:00 Paris: storm 14–18 h, light rain 18–20 h.
    def at(h: int) -> dict[str, Any]:
        storm, light = 4 <= h < 8, 8 <= h < 10
        return {"condition": "lightning-rainy" if storm else "rainy" if light else "partlycloudy", "temperature": 18,
                "precipitation": 3 if storm else 0.2 if light else 0, "wind_speed": 35 if storm else 10, "wind_gust_speed": 70 if storm else 0, "wind_bearing": 225}
    b = build_bulletin(plan("2026-10-08T08:00:00+00:00", 24, at), utc("2026-10-08T07:30:00"), PARIS)
    afternoon = next(p for p in b.periods if p.label == "Cet après-midi")
    assert (afternoon.condition, afternoon.rain) == ("lightning-rainy", 12)
    assert afternoon.text == "Orages et pluie (12 mm). 18 °C. Vent du sud-ouest assez fort (35 km/h), rafales à 70 km/h."
    assert "Pluie cet après-midi : 12 mm au total." in b.summary
    assert "Vent du sud-ouest assez fort (35 km/h), rafales à 70 km/h cet après-midi." in b.summary
    # A rainy pictogram with 0.4 mm over a period is not a rainy evening worth a line of its own.
    assert next(p for p in b.periods if p.label == "Ce soir").condition != "rainy"


def test_describes_a_change_inside_a_period() -> None:
    # From 10:00 Paris: cloudy until 15 h, then sunny.
    b = build_bulletin(plan("2026-10-08T08:00:00+00:00", 20, lambda h: {"condition": "cloudy" if h < 5 else "sunny", "temperature": 20}), utc("2026-10-08T07:30:00"), PARIS)
    assert next(p for p in b.periods if p.label == "Cet après-midi").text.startswith("Ciel couvert, puis ensoleillé.")
    assert re.match(r"^Ciel couvert ce matin et en début d’après-midi, puis beau temps en fin d’après-midi et jusqu’à cette nuit\.", b.summary)


def test_needs_at_least_two_parts_of_the_day() -> None:
    assert build_bulletin(plan("2026-10-08T10:00:00+00:00", 2, lambda h: {"condition": "sunny", "temperature": 20}), utc("2026-10-08T09:30:00"), PARIS) is None
