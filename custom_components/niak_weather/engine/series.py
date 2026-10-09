"""What the small history charts show: seven days of rain, six hours of wind and pressure, and a word on what is happening now."""
from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Literal, NamedTuple, Sequence
from zoneinfo import ZoneInfo

from .local import LocalWeather
from .station import WEEKDAYS, RainDay
from .trends import Change, Direction
from .units import Kind, measurement

SPAN, STEP = 6 * 3600, 600
BUCKETS = SPAN // STEP


class Point(NamedTuple):
    time: float
    """Seconds since 1970."""
    value: float | None
    """None where the station did not report: a gap, never joined across."""


def _points(rows: Sequence[Change], unit: str | None, kind: Kind, now: float) -> list[Point]:
    return sorted((p for c in rows if 0 < (p := Point(c.time, measurement(c.state, unit, kind))).time <= now), key=lambda p: p.time)


def rain_days(rows: Sequence[Change], unit: str | None, now: datetime, zone: ZoneInfo) -> tuple[RainDay, ...]:
    """Daily maxima of a daily rain sensor, never differences of rolling 24 h, weekly or monthly totals."""
    series = [(p, datetime.fromtimestamp(p.time, zone).date()) for p in _points(rows, unit, Kind.RAIN, now.timestamp())]
    today = now.astimezone(zone).date()
    days = []
    for i in range(7):
        key: date = today - timedelta(days=6 - i)
        daily = [p for p, day in series if day == key]
        previous = next((p for p, day in reversed(series) if day < key), None)
        values = [p.value for p in daily if p.value is not None and p.value >= 0]
        # A daily counter keeps accumulating through a short outage (e.g. `unknown` at the midnight reset),
        # so readings after it still give the right maximum. Only an outage still running at the end of the day can hide rain.
        ends_in_outage = bool(daily) and (daily[-1].value is None or daily[-1].value < 0)
        # A zero that persists is a dry day; an old nonzero total must never be carried into a new day.
        highest = max(values) if values else 0 if not daily and previous is not None and previous.value == 0 else None
        # "At least 0 mm" says nothing: a dry reading followed by an unfinished outage stays unknown.
        value = None if ends_in_outage and highest == 0 else highest
        reset_inside = any(values[j] < values[j - 1] for j in range(1, len(values)))
        partial = value is not None and (reset_inside or ends_in_outage or (previous is None and bool(daily)))
        days.append(RainDay(key.isoformat(), "Auj." if i == 6 else WEEKDAYS[key.weekday()], value, partial))
    return tuple(days)


def wind_chart_series(rows: Sequence[Change], unit: str | None, now: datetime, current: float | None, mode: Literal["mean", "peak"]) -> tuple[Point, ...]:
    """Ten-minute time-weighted means or gust peaks; unknown intervals remain gaps."""
    return _chart_series(rows, unit, now, current, mode, Kind.WIND)


def pressure_chart_series(rows: Sequence[Change], unit: str | None, now: datetime, current: float | None = None) -> tuple[Point, ...]:
    return _chart_series(rows, unit, now, current, "mean", Kind.PRESSURE)


@dataclass
class _Bucket:
    sum: float = 0
    duration: float = 0
    peak: float = 0
    missing: bool = False


def _chart_series(rows: Sequence[Change], unit: str | None, now: datetime, current: float | None, mode: str, kind: Kind) -> tuple[Point, ...]:
    end = now.timestamp()
    start = end - SPAN
    events = [Point(p.time, p.value if p.value is not None and p.value >= 0 else None) for p in _points(rows, unit, kind, end)]
    if not events:
        return ()
    buckets = [_Bucket() for _ in range(BUCKETS)]
    for i, event in enumerate(events):
        a, b = max(start, event.time), min(end, events[i + 1].time if i + 1 < len(events) else end)
        j = max(0, math.floor((a - start) / STEP))
        while b > a and j < BUCKETS and start + j * STEP < b:
            bucket, duration = buckets[j], min(b, start + (j + 1) * STEP) - max(a, start + j * STEP)
            if event.value is None:
                bucket.missing = True
            else:
                bucket.sum += event.value * duration
                bucket.duration += duration
                bucket.peak = max(bucket.peak, event.value)
            j += 1
    full = [not b.missing and b.duration == STEP for b in buckets]
    return (*(Point(start + (i + 0.5) * STEP, (b.sum / b.duration if mode == "mean" else b.peak) if full[i] else None) for i, b in enumerate(buckets)),
            Point(end, current))


@dataclass(frozen=True)
class ColumnStatus:
    """One-word reminders of what is happening now, echoing the synthesis in the matching column."""

    rain: str | None = None
    wind: str | None = None
    pressure: str | None = None


def column_status(w: LocalWeather | None) -> ColumnStatus:
    if w is None:
        return ColumnStatus()
    rate, change, direction = w.rain.rate, w.wind.trend.change, w.pressure_trend.direction
    return ColumnStatus(
        rain=None if rate is None or rate < 0.3 else "Forte pluie en cours" if rate >= 4 else "Pluie en cours",
        # Over one hour: a few km/h is noise, 8 km/h is felt.
        wind=None if change is None else "Le vent s’intensifie" if change >= 8 else "Le vent faiblit" if change <= -8 else None,
        pressure="La pression baisse" if direction is Direction.FALLING else "La pression monte" if direction is Direction.RISING else None,
    )
