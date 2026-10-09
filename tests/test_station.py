"""Station measurements derived from history and statistics (ported from the card's station-history tests)."""
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo

import pytest

from engine.settings import Settings
from engine.station import Statistic, Total, counter_increase, derive_station, midnight, period_starts, statistic_increase
from engine.trends import Change

UTC = ZoneInfo("UTC")
PARIS = ZoneInfo("Europe/Paris")


@dataclass
class State:
    state: str
    attributes: dict[str, Any] = field(default_factory=dict)


def utc(text: str) -> datetime:
    return datetime.fromisoformat(text).replace(tzinfo=timezone.utc)


def settings(**options: str) -> Settings:
    return Settings.from_options({"weather_entity": "weather.x", **options})


def test_computes_increases_across_resets_and_tells_missing_coverage_from_dry_weather() -> None:
    assert counter_increase([(0, 10), (10, 12), (20, 0), (30, 2)], 0, 30) == Total(4, False)
    assert counter_increase([(10, 12), (20, 14)], 0, 20) == Total(2, True)
    assert counter_increase([], 0, 20).value is None
    assert counter_increase([(20, 12)], 0, 20).value is None
    assert counter_increase([(0, 10), (20, 10)], 0, 20) == Total(0, False)


def test_calendar_periods_follow_the_home_time_zone_across_dst() -> None:
    p = period_starts(utc("2026-10-26T08:00:00"), PARIS)
    assert p.day == utc("2026-10-25T23:00:00").timestamp()
    assert p.week == p.day
    assert p.month == utc("2026-09-30T22:00:00").timestamp()
    assert p.year == utc("2025-12-31T23:00:00").timestamp()


def test_uses_the_cumulative_statistic_sum_and_labels_short_coverage() -> None:
    rows = [Statistic(0, 10, 100), Statistic(10, 20, 102), Statistic(20, 30, 107)]
    assert statistic_increase(rows, 10, 30) == Total(7, False)
    assert statistic_increase(rows[1:], 0, 30) == Total(5, True)
    assert statistic_increase([], 0, 30).value is None
    assert statistic_increase(rows, 15, 30) == Total(5, True)


def test_keeps_gaps_and_decreasing_sums_partial_instead_of_inventing_totals() -> None:
    assert counter_increase([(0, 10), (10, None), (20, 12)], 0, 20) == Total(2, True)
    assert counter_increase([(0, 10), (10, 9.8), (20, 10.2)], 0, 20) == Total(0.2, True)
    assert statistic_increase([Statistic(0, 10, 10), Statistic(20, 30, 12)], 10, 30) == Total(2, True)
    assert statistic_increase([Statistic(0, 10, 10), Statistic(10, 20, 5)], 10, 20).partial


def test_derives_rain_in_mm_the_temperature_trend_and_a_partial_gust_maximum() -> None:
    now = utc("2026-10-06T12:00:00")
    hour_ago = now.timestamp() - 3600
    states = {"sensor.rain": State("12", {"unit_of_measurement": "mm"}), "sensor.temp": State("20", {"unit_of_measurement": "°C"}),
              "sensor.gust": State("5", {"unit_of_measurement": "m/s"})}
    options = {"rain_total_entity": "sensor.rain", "temperature_entity": "sensor.temp", "wind_gust_entity": "sensor.gust"}
    history = {"sensor.rain": [Change(hour_ago, "10")], "sensor.temp": [Change(hour_ago, "18")], "sensor.gust": [Change(hour_ago, "10")]}
    result = derive_station(states.get, settings(**options), [], None, history, now, UTC)
    assert result.day == Total(2, True)
    assert result.temperature_trend == 2
    assert result.gust_max == Total(36, True)
    assert len(result.days) == 7 and result.days[0].value is None
    direct = derive_station(states.get, settings(**options, temperature_trend_entity="sensor.direct", max_daily_gust_entity="sensor.max"), [], None, {}, now, UTC)
    assert direct.temperature_trend is None and direct.gust_max is None


def test_bridges_the_statistic_tail_with_the_live_counter_and_converts_inches() -> None:
    now = utc("2026-10-06T12:00:00")
    end, day = now.timestamp(), utc("2026-10-06T00:00:00").timestamp()
    stats = [Statistic(day - 86400, day, 1, 1), Statistic(day, end - 3600, 1.5, 1.5)]
    options = settings(rain_total_entity="sensor.rain")
    result = derive_station({"sensor.rain": State("2", {"unit_of_measurement": "in"})}.get, options, stats, "in", {}, now, UTC)
    assert result.day.value == pytest.approx(25.4) and not result.day.partial
    missing = derive_station({"sensor.rain": State("unavailable", {"unit_of_measurement": "in"})}.get, options, stats, "in", {}, now, UTC)
    assert missing.day == Total(12.7, True)


def test_matches_home_assistant_statistics_daily_rows_joined_to_hourly_rows() -> None:
    # Mirrors recorder statistics_during_period: cumulative sum, days reduced on local midnights, hourly rows for the last days.
    now, hour = utc("2026-10-20T12:20:00"), 3600
    end = now.timestamp()

    def rain_in(t: float) -> float:
        return 0.5 if datetime.fromtimestamp(t, timezone.utc).hour in (5, 6) else 0

    hourly, total, t = [], 0.0, utc("2025-11-30T23:00:00").timestamp()
    while t + hour <= end:
        total += rain_in(t)
        hourly.append(Statistic(t, t + hour, total, total))
        t += hour
    daily: dict[date, Statistic] = {}
    for row in hourly:
        key = datetime.fromtimestamp(row.start, PARIS).date()
        first = daily.get(key)
        daily[key] = Statistic(first.start if first else midnight(key, PARIS), midnight(key + timedelta(days=1), PARIS), row.sum, row.state)
    hour_start = period_starts(now - timedelta(days=9), PARIS).day
    # One row per boundary: where a day and an hour end together, the hour wins, as in the card's test.
    rows = sorted([*daily.values(), *(r for r in hourly if r.start >= hour_start)], key=lambda r: r.end - r.start, reverse=True)
    ordered = sorted({r.end: r for r in rows}.values(), key=lambda r: r.end)
    result = derive_station({"sensor.rain": State(str(total), {"unit_of_measurement": "mm"})}.get, settings(rain_total_entity="sensor.rain"),
                            ordered, "mm", {}, now, PARIS)

    def truth(start: float) -> float:
        return sum(rain_in(r.start) for r in hourly if r.start >= start)

    starts = period_starts(now, PARIS)
    for name in ("day", "week", "month", "year"):
        assert getattr(result, name) == Total(truth(getattr(starts, name)), False), name
    assert [d.value for d in result.days] == [1] * 7
    assert [d.label for d in result.days] == ["mer.", "jeu.", "ven.", "sam.", "dim.", "lun.", "Auj."]
