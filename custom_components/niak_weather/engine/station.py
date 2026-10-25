"""What the station's own history tells, when it has no sensor for it: rain totals from a total counter,
the temperature trend, the strongest gust of the day. Missing data is never invented: a total is marked partial instead."""
from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Any, Callable, Mapping, Sequence
from zoneinfo import ZoneInfo

from .i18n import N_, t
from .settings import Settings
from .trends import Change
from .units import Kind, finite, measurement

WEEKDAYS = (N_("lun."), N_("mar."), N_("mer."), N_("jeu."), N_("ven."), N_("sam."), N_("dim."))


@dataclass(frozen=True)
class Total:
    value: float | None = None
    partial: bool = True
    """Some of the period is missing: the true total may be higher."""


@dataclass(frozen=True)
class Statistic:
    """A long-term statistics row of Home Assistant (times in seconds)."""

    start: float
    end: float
    sum: float | None = None
    state: float | None = None
    partial: bool = False


@dataclass(frozen=True)
class RainDay:
    date: str
    label: str
    value: float | None
    partial: bool


@dataclass(frozen=True)
class Derived:
    day: Total
    recent: Total
    """The last 24 hours."""
    week: Total
    month: Total
    year: Total
    days: tuple[RainDay, ...]
    temperature_trend: float | None
    """°C per hour over the last hour."""
    gust_max: Total | None


def _round(value: float) -> float:
    return math.floor(value * 100 + 0.5) / 100


def counter_increase(rows: Sequence[tuple[float, float | None]], start: float, end: float) -> Total:
    """Rain fallen between two moments, from an ever-growing counter; a reset to zero is followed, a small dip is not."""
    points = sorted((p for p in rows if p[0] <= end), key=lambda p: p[0])
    prior = next((p for p in reversed(points) if p[0] <= start), None)
    first = prior if prior is not None and prior[1] is not None else next((p for p in points if p[0] >= start and p[1] is not None), None)
    if first is None:
        return Total()
    previous, value, partial = first[1], 0.0, prior is None or prior[1] is None
    window = [p for p in points if first[0] < p[0] <= end]
    if not window and (prior is None or first[0] < end):
        return Total()
    for _, v in window:
        if v is None or v < 0:
            partial = True
            continue
        if v < previous and v > previous * 0.9:
            partial = True  # Small drops are not evidence of a reset.
            continue
        value += v - previous if v >= previous else v
        previous = v
    return Total(_round(value), partial or (points[-1][0] if points else 0) < end)


def statistic_increase(rows: Sequence[Statistic], start: float, end: float) -> Total:
    """Rain between two moments from hourly or daily statistics, without interpolating inside a row."""
    valid = sorted((p for p in rows if p.end <= end and finite(p.sum) is not None), key=lambda p: p.end)
    # Start at the next known boundary instead of including rain that may predate the requested period.
    prior = next((p for p in valid if p.end == start), None)
    first = prior or next((p for p in valid if p.end > start), None)
    last = valid[-1] if valid else None
    if first is None or last is None or (first is last and (prior is None or last.end < end)):
        return Total()
    partial, previous, value = prior is None or first.end != start or last.end < end, first, 0.0
    for p in (p for p in valid if p.end > first.end):
        if p.start > previous.end or (p.sum or 0) < (previous.sum or 0) or p.partial:
            partial = True
        value += max(0.0, (p.sum or 0) - (previous.sum or 0))
        previous = p
    return Total(_round(value), partial)


def midnight(day: date, zone: ZoneInfo) -> float:
    return datetime(day.year, day.month, day.day, tzinfo=zone).timestamp()


@dataclass(frozen=True)
class Periods:
    day: float
    week: float
    month: float
    year: float


def period_starts(now: datetime, zone: ZoneInfo) -> Periods:
    """Local midnight today, on Monday, on the 1st of the month and on 1 January (seconds)."""
    today = now.astimezone(zone).date()
    return Periods(midnight(today, zone), midnight(today - timedelta(days=today.weekday()), zone),
                   midnight(today.replace(day=1), zone), midnight(today.replace(month=1, day=1), zone))


def derive_station(get: Callable[[str], Any], settings: Settings, statistics: Sequence[Statistic], statistics_unit: str | None,
                   history: Mapping[str, Sequence[Change]], now: datetime, zone: ZoneInfo) -> Derived:
    end, starts = now.timestamp(), period_starts(now, zone)
    total_id = settings.rain_total_entity or ""
    total_state = get(total_id) if total_id else None
    unit = total_state.attributes.get("unit_of_measurement") if total_state else None
    counter: list[tuple[float, float | None]] = [(c.time, measurement(c.state, unit, Kind.RAIN)) for c in history.get(total_id, ())]
    live = measurement(total_state.state, unit, Kind.RAIN) if total_state else None
    if live is not None:
        counter.append((end, live))
    # Home Assistant reduces the current day or month into a row ending in the future: only completed boundaries are usable.
    stats = sorted((Statistic(p.start, p.end, measurement(p.sum, statistics_unit, Kind.RAIN), measurement(p.state, statistics_unit, Kind.RAIN), p.partial)
                    for p in statistics if p.end <= end), key=lambda p: p.end)
    last = stats[-1] if stats else None
    if last and live is not None and last.state is not None and last.sum is not None and last.end < end:
        tail = counter_increase([(last.end, last.state), *(p for p in counter if p[0] > last.end)], last.end, end)
        if tail.value is not None:
            stats.append(Statistic(last.end, end, last.sum + tail.value, live, tail.partial))

    def total(start: float, stop: float = end) -> Total:
        recent = counter_increase(counter, start, stop)
        recorded = statistic_increase(stats, start, stop)
        return recent if recent.value is not None and not recent.partial else recorded if recorded.value is not None else recent

    today = now.astimezone(zone).date()
    days = []
    for i in range(7):
        day = today - timedelta(days=6 - i)
        rain = total(midnight(day, zone), min(end, midnight(day + timedelta(days=1), zone)))
        days.append(RainDay(day.isoformat(), t("Auj.") if i == 6 else t(WEEKDAYS[day.weekday()]), rain.value, rain.partial))

    trend = None
    if not settings.temperature_trend_entity and settings.temperature_entity:
        state = get(settings.temperature_entity)
        t_unit = state.attributes.get("unit_of_measurement") if state else None
        rows = sorted(((c.time, measurement(c.state, t_unit, Kind.TEMPERATURE)) for c in history.get(settings.temperature_entity, ()) if c.time <= end),
                      key=lambda p: p[0])
        boundary = next((p for p in reversed(rows) if p[0] <= end - 3600), None)
        points = [p for p in rows if p[0] > end - 3600]
        if boundary:
            points.insert(0, (end - 3600, boundary[1]))
        first = next((p for p in points if p[1] is not None), None)
        current = measurement(state.state, t_unit, Kind.TEMPERATURE) if state else None
        if first and current is not None and end - first[0] >= 1800 and not any(p[1] is None for p in points):
            trend = _round((current - first[1]) * 3600 / (end - first[0]))

    gust_max = None
    if not settings.max_daily_gust_entity and settings.wind_gust_entity:
        state = get(settings.wind_gust_entity)
        g_unit = state.attributes.get("unit_of_measurement") if state else None
        rows = sorted(((c.time, measurement(c.state, g_unit, Kind.WIND)) for c in history.get(settings.wind_gust_entity, ())), key=lambda p: p[0])
        prior = next((p for p in reversed(rows) if p[0] <= starts.day), None)
        points = [p for p in rows if starts.day <= p[0] <= end]
        values = [v for v in (prior[1] if prior else None, *(p[1] for p in points), measurement(state.state, g_unit, Kind.WIND) if state else None)
                  if v is not None and v >= 0]
        if points and values:
            gust_max = Total(max(values), prior is None or any(p[1] is None for p in points))

    return Derived(day=total(starts.day), recent=total(end - 86400), week=total(starts.week), month=total(starts.month), year=total(starts.year),
                   days=tuple(days), temperature_trend=trend, gust_max=gust_max)
