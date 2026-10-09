"""Seasons and day length (ported from the card's season tests)."""
import re
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Any
from zoneinfo import ZoneInfo

from engine.season import current_season, day_length, daylight_text, season_from_date

PARIS = ZoneInfo("Europe/Paris")


@dataclass
class State:
    state: str
    attributes: dict[str, Any] = field(default_factory=dict)


def at(day: str) -> datetime:
    return datetime.fromisoformat(f"{day}T12:00:00+02:00")


def season(day: str, sensor: str | None = None, latitude: float | None = 43.45):
    states = {"sensor.saison": State(sensor)} if sensor else {}
    return current_season(states.get, "sensor.saison" if sensor else None, at(day), PARIS, latitude)


def test_follows_equinoxes_and_solstices_flipped_in_the_south() -> None:
    days = ["2026-03-19", "2026-03-20", "2026-06-21", "2026-09-21", "2026-09-22", "2026-12-21", "2027-01-15"]
    assert [season_from_date(date.fromisoformat(d)) for d in days] == ["winter", "spring", "summer", "summer", "autumn", "winter", "winter"]
    assert season_from_date(date(2026, 10, 7), -33.9) == "spring"


def test_trusts_the_season_sensor_and_falls_back_to_the_date() -> None:
    s = season("2026-07-14", "autumn")
    assert (s.season, s.from_sensor, s.label) == ("autumn", True, "Automne")
    assert season("2026-07-14", "Automne").season == "autumn"
    s = season("2026-07-14", "unavailable")
    assert (s.season, s.from_sensor) == ("summer", False)
    assert (season("2026-07-14").season, season("2026-07-14").icon) == ("summer", "mdi:white-balance-sunny")


def test_dates_the_start_on_the_astronomical_or_meteorological_calendar() -> None:
    s = season("2026-09-23")
    assert (s.season, s.days_in, s.start) == ("autumn", 1, (9, 22))
    assert season("2026-10-07").days_in == 15
    s = season("2027-01-03")
    assert (s.season, s.days_in, s.start) == ("winter", 13, (12, 21))
    # A meteorological Season sensor turns to autumn on 1 September, before the equinox.
    s = season("2026-09-05", "autumn")
    assert (s.season, s.days_in, s.start) == ("autumn", 4, (9, 1))
    s = season("2026-09-25", latitude=-33.9)
    assert (s.season, s.days_in) == ("spring", 3)


def test_tells_the_day_length_and_how_fast_it_changes() -> None:
    # Gardanne, 7 October: about 11 h 25 of daylight, shrinking by about 2.7 min a day.
    info = season("2026-10-07")
    assert abs(info.day_length - 11.42) < 0.05 and -3.5 < info.day_change < -2
    assert re.match(r"^11 h \d\d de jour · les jours raccourcissent de 3 min par jour$", daylight_text(info))
    assert day_length(date(2026, 6, 21), 43.45) > 15
    # Home Assistant's sun.sun at Gardanne, 200 m, 8 October 2026: 11 h 27 min 22 s between sunrise and sunset.
    assert abs(day_length(date(2026, 10, 8), 43.447, 200) - (11 + 27 / 60 + 22 / 3600)) * 60 < 2
    assert daylight_text(season("2026-10-07", latitude=None)) == ""


def test_announces_a_new_season_only_its_first_week() -> None:
    assert season("2026-09-23").news == "C’est l’automne"
    assert season("2026-10-07").news is None
    assert season("2026-09-23").tip.startswith("Automne depuis le 22 septembre · ")
