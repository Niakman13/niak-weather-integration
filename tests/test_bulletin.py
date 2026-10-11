"""The daily bulletin (ported from the card's bulletin tests)."""
import math
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
    assert b.summary == "Aujourd’hui, grand soleil ; jusqu’à 19 °C. Ce soir et cette nuit, ciel dégagé ; 11 °C au petit matin, sans pluie."


def test_switches_to_tonight_and_tomorrow_in_the_evening() -> None:
    b = build_bulletin(plan("2026-10-08T17:00:00+00:00", 24, lambda h: {"condition": "cloudy", "temperature": 12, "wind_speed": 5}), utc("2026-10-08T16:30:00"), PARIS)
    assert [p.label for p in b.periods] == ["Ce soir", "Cette nuit", "Demain matin", "Demain après-midi"]
    assert b.summary == "Ce soir et cette nuit, ciel couvert ; 12 °C au petit matin. Demain, ciel couvert ; jusqu’à 12 °C, sans pluie."


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
    # The storm is told with its hour and amount; the rain running on into the evening stops, the wind drops.
    assert b.summary == ("Aujourd’hui, soleil et nuages, orages à partir de 14 h (12 mm) ; jusqu’à 18 °C, vent assez fort du sud-ouest et "
                         "rafales à 70 km/h. Ce soir et cette nuit, la pluie cesse vers 20 h, puis éclaircies ; 18 °C au petit matin, le vent faiblit.")
    # A rainy pictogram with 0.4 mm over a period is not a rainy evening worth a line of its own.
    assert next(p for p in b.periods if p.label == "Ce soir").condition != "rainy"


def test_describes_a_change_inside_a_period() -> None:
    # From 10:00 Paris: cloudy until 15 h, then sunny.
    b = build_bulletin(plan("2026-10-08T08:00:00+00:00", 20, lambda h: {"condition": "cloudy" if h < 5 else "sunny", "temperature": 20}), utc("2026-10-08T07:30:00"), PARIS)
    assert next(p for p in b.periods if p.label == "Cet après-midi").text.startswith("Ciel couvert, puis ensoleillé.")
    assert b.summary.startswith("Aujourd’hui, ciel gris en matinée, puis le soleil revient en début d’après-midi ; jusqu’à 20 °C.")


def test_needs_at_least_two_parts_of_the_day() -> None:
    assert build_bulletin(plan("2026-10-08T10:00:00+00:00", 2, lambda h: {"condition": "sunny", "temperature": 20}), utc("2026-10-08T09:30:00"), PARIS) is None


def summary(start: str, now: str, at: Callable[[int], dict[str, Any]], n: int = 18) -> str:
    """The bulletin's summary for `n` hours from `start`, both in Paris time."""
    first = datetime.fromisoformat(start).replace(tzinfo=PARIS)
    hours = parse_hours({"datetime": (first + timedelta(hours=h)).isoformat(), **at(h)} for h in range(n))
    b = build_bulletin(hours, datetime.fromisoformat(now).replace(tzinfo=PARIS), PARIS)
    assert b is not None
    return b.summary


def test_names_the_day_once_and_says_what_changes() -> None:
    # The evening of 9 Oct 2026, as Météo-France saw it: a clear night, then clouds at dawn giving way to sunshine.
    def at(h: int) -> dict[str, Any]:
        return {"condition": "clear-night" if h < 4 else "partlycloudy" if h < 12 else "sunny", "temperature": 12 - h * 0.6 if h < 10 else 6 + (h - 10) * 2,
                "precipitation": 0, "wind_speed": 5}
    assert summary("2026-10-09T22:00", "2026-10-09T21:30", at) == (
        "Ce soir et cette nuit, ciel dégagé en fin de soirée, puis quelques nuages après minuit ; frais au petit matin (8 °C). "
        "Demain, quelques nuages au lever du jour, puis le soleil s’impose en matinée ; jusqu’à 20 °C, sans pluie.")


def test_after_midnight_the_coming_day_is_named_by_its_weekday() -> None:
    text = summary("2026-10-10T01:00", "2026-10-10T00:40", lambda h: {"condition": "sunny" if h >= 6 else "clear-night", "temperature": 15})
    assert text.startswith("Cette nuit, ciel dégagé ; 15 °C au petit matin. Samedi, grand soleil")


def test_gives_no_minimum_for_a_night_the_forecast_does_not_reach() -> None:
    # From 09:00, eighteen hours stop at 03:00: the coldest hour is still to come.
    text = summary("2026-10-10T09:00", "2026-10-10T08:40", lambda h: {"condition": "sunny" if h < 9 else "clear-night", "temperature": 25 - h * 0.5})
    assert text.endswith("Ce soir et cette nuit, ciel dégagé ; sans pluie.")


def test_groups_short_showers_and_keeps_snow_out_of_millimetres() -> None:
    showers = summary("2026-10-10T10:00", "2026-10-10T09:40",
                      lambda h: {"condition": "rainy" if h in (1, 5) else "partlycloudy", "temperature": 16, "precipitation": 0.6 if h in (1, 5) else 0})
    assert showers.startswith("Aujourd’hui, soleil et nuages, averses vers 11 h et vers 15 h (1,2 mm) ; jusqu’à 16 °C.")
    snow = summary("2026-10-10T17:00", "2026-10-10T16:40",
                   lambda h: {"condition": "snowy" if 3 <= h < 9 else "cloudy", "temperature": 0, "precipitation": 1 if 3 <= h < 9 else 0})
    assert snow == "Ce soir et cette nuit, ciel couvert, neige de 20 h à 2 h ; gel au petit matin (0 °C). Demain matin, ciel couvert ; sans dégel, 0 °C au mieux."


def test_fog_frost_heat_and_a_wind_that_keeps_blowing() -> None:
    fog = summary("2026-10-10T20:00", "2026-10-10T19:40", lambda h: {"condition": "clear-night" if h < 8 else "fog" if h < 13 else "sunny",
                                                                     "temperature": 3 - h / 2 if h < 11 else -2 + (h - 11) * 2})
    assert fog == ("Ce soir et cette nuit, ciel dégagé en début de soirée, puis brouillard en fin de nuit ; gel au petit matin (−1 °C). "
                   "Demain, brouillard au lever du jour, puis grand soleil en matinée ; jusqu’à 10 °C, sans pluie.")
    heat = summary("2026-10-10T08:00", "2026-10-10T07:40", lambda h: {"condition": "sunny", "temperature": 24 + h * 1.5 if h < 8 else 36 - (h - 8)})
    assert heat.startswith("Aujourd’hui, grand soleil ; très chaud, jusqu’à 36 °C.")
    storm = summary("2026-10-10T07:00", "2026-10-10T06:40", lambda h: {"condition": "rainy" if h < 11 else "cloudy", "temperature": 11,
                                                                       "precipitation": 2.5 if h < 11 else 0, "wind_speed": 45, "wind_gust_speed": 90, "wind_bearing": 330})
    assert storm == ("Aujourd’hui, pluie toute la journée (28 mm) ; jusqu’à 11 °C, vent fort du nord-ouest et rafales à 90 km/h. "
                     "Ce soir et cette nuit, ciel couvert ; vent toujours fort.")


def test_a_change_within_the_same_part_of_the_day_names_that_part_once() -> None:
    # The test bench of 11 Oct 2026: a few clouds at 18 h and 19 h, a clear sky from 20 h, rain after midnight.
    def at(h: int) -> dict[str, Any]:
        return {"condition": "partlycloudy" if h < 2 else "rainy" if 6 <= h < 11 else "clear-night", "temperature": 16 - h * 0.2,
                "precipitation": 2.6 if 6 <= h < 11 else 0, "wind_speed": 5}
    text = summary("2026-10-11T18:00", "2026-10-11T17:50", at, n=12)
    assert text.startswith("Ce soir et cette nuit, quelques nuages, puis le ciel se dégage en début de soirée, pluie de minuit à 5 h (13 mm)")
    assert text.count("en début de soirée") == 1


def test_storms_that_stop_then_start_again_are_said_to_start_again() -> None:
    # Storms all night, stopping at 8 h, then back from 14 h to 17 h.
    def at(h: int) -> dict[str, Any]:
        storm = h < 12 or 18 <= h < 21
        return {"condition": "lightning-rainy" if storm else "cloudy", "precipitation": 4 if storm else 0, "temperature": 14, "wind_speed": 5}
    text = summary("2026-10-11T20:00", "2026-10-11T19:50", at, n=22)
    assert "les orages cessent vers 8 h et reprennent vers 14 h" in text or "les orages cessent vers 8 h et reprennent de 14 h à 17 h" in text, text
    assert "et orages" not in text


def test_the_night_minimum_does_not_repeat_the_moment_of_the_sky() -> None:
    # A night that only cools in the evening, then warms up: the minimum comes early, when the fog lifts.
    def at(h: int) -> dict[str, Any]:
        return {"condition": "fog" if h < 2 else "clear-night", "temperature": 7 if h == 1 else 9 + h * 0.1, "precipitation": 0, "wind_speed": 5}
    text = summary("2026-10-11T18:00", "2026-10-11T17:50", at, n=14)
    assert text.count("en début de soirée") == 1 and "frais vers 19 h (7 °C)" in text
