"""History charts and column status (ported from the card's history-series tests)."""
import json
from dataclasses import replace
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest

from engine.series import ColumnStatus, column_status, pressure_chart_series, rain_days, wind_chart_series
from engine.trends import Change, Direction, Trend
from test_brief import weather

PARIS = ZoneInfo("Europe/Paris")
NOW = datetime(2026, 10, 5, 16, tzinfo=timezone.utc)
FIXTURE = Path(__file__).parent / "fixtures" / "gw2000a-daily-rain-2026-10-07.json"


def p(moment: str, state: str) -> Change:
    return Change(datetime.fromisoformat(moment.replace("Z", "+00:00")).timestamp(), state)


def values(days) -> list[float | None]:
    return [d.value for d in days]


def test_keeps_every_day_of_a_real_gw2000a_week_whose_station_drops_out_for_a_few_seconds() -> None:
    # Recorder export of sensor.gw2000a_daily_rain, 29/09 → 07/10/2026. The station goes `unavailable` almost every day;
    # the monthly counter (40.6 mm on 07/10) confirms the October values.
    at = datetime(2026, 10, 7, 13, 20, tzinfo=timezone.utc)
    rows = [Change(r["lu"], r["s"]) for r in json.loads(FIXTURE.read_text())] + [Change(at.timestamp(), "19.3")]
    days = rain_days(rows, "mm", at, PARIS)
    assert values(days) == [19.5, 0.3, 1, 0, 0, 0.5, 19.3]
    assert [d.label for d in days] == ["jeu.", "ven.", "sam.", "dim.", "lun.", "mar.", "Auj."]


def test_keeps_absent_history_absent_instead_of_fabricating_zero_bars() -> None:
    assert all(d.value is None for d in rain_days([], "mm", NOW, PARIS))


def test_takes_daily_maxima_without_subtracting_or_accumulating_across_midnight_resets() -> None:
    days = rain_days([p("2026-09-28T22:00:00Z", "0"), p("2026-09-29T14:00:00Z", "3"), p("2026-09-29T22:00:00Z", "0"),
                      p("2026-09-30T16:00:00Z", "5"), p("2026-09-30T22:00:00Z", "0")], "mm", NOW, PARIS)
    assert (days[0].date, days[0].value) == ("2026-09-29", 3)
    assert (days[1].date, days[1].value, days[1].partial) == ("2026-09-30", 5, False)
    assert days[2].value == 0


def test_never_carries_an_old_nonzero_daily_counter_into_a_day_with_no_records() -> None:
    days = rain_days([p("2026-09-29T12:00:00Z", "5")], "mm", NOW, PARIS)
    assert (days[0].value, days[0].partial) == (5, True)
    assert days[1].value is None


def test_keeps_a_day_whose_counter_recovers_after_an_outage_and_marks_mid_day_resets_partial() -> None:
    days = rain_days([p("2026-09-28T22:00:00Z", "0"), p("2026-09-29T12:00:00Z", "unavailable"), p("2026-09-29T14:00:00Z", "3"),
                      p("2026-09-29T22:00:00Z", "0"), p("2026-09-30T10:00:00Z", "4"), p("2026-09-30T12:00:00Z", "0")], "mm", NOW, PARIS)
    assert days[0].value == 3
    assert (days[1].value, days[1].partial) == (4, True)


def test_does_not_erase_days_whose_counter_is_briefly_unknown_at_the_midnight_reset() -> None:
    rows = []
    for i, day in enumerate(["2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05"]):
        midnight = datetime.fromisoformat(f"{day}T00:00:00+02:00").timestamp()
        rows += [Change(midnight, "unknown"), Change(midnight + 2, "0"), *([Change(midnight + 36000, str(i * 3))] if i % 2 else [])]
    days = rain_days(rows, "mm", NOW, PARIS)
    assert values(days) == [0, 3, 0, 9, 0, 15, 0]
    assert not any(d.partial for d in days[1:])  # The first day has no earlier reading.


def test_marks_a_day_partial_when_an_outage_is_still_running_at_midnight() -> None:
    days = rain_days([p("2026-09-28T22:00:00Z", "0"), p("2026-09-29T08:00:00Z", "2"), p("2026-09-29T18:00:00Z", "unavailable"),
                      p("2026-09-30T06:00:00Z", "0")], "mm", NOW, PARIS)
    assert (days[0].value, days[0].partial) == (2, True)
    assert (days[1].value, days[1].partial) == (0, False)


def test_leaves_a_day_missing_when_the_counter_is_unavailable_all_day() -> None:
    days = rain_days([p("2026-09-28T22:00:00Z", "0"), p("2026-09-29T08:00:00Z", "unavailable"), p("2026-09-30T06:00:00Z", "0")], "mm", NOW, PARIS)
    assert days[0].value is None


def test_converts_inches_and_follows_the_local_date_rather_than_utc() -> None:
    days = rain_days([p("2026-10-04T23:00:00Z", "1")], "in", NOW, PARIS)
    assert (days[6].date, days[6].value) == ("2026-10-05", pytest.approx(25.4))
    assert days[5].value is None


def test_keeps_calendar_days_aligned_over_a_daylight_saving_transition() -> None:
    days = rain_days([], "mm", datetime(2026, 10, 26, 0, 30, tzinfo=timezone.utc), PARIS)
    assert [d.date for d in days] == [f"2026-10-{d}" for d in range(20, 27)]


def test_converts_recorded_pressure_and_preserves_gaps_without_fabricating_history() -> None:
    rows = [p("2026-10-05T10:00:00Z", "100000"), p("2026-10-05T12:00:00Z", "unavailable"), p("2026-10-05T13:00:00Z", "99600")]
    result = pressure_chart_series(rows, "Pa", NOW, 996)
    assert (result[0].value, result[12].value, result[18].value) == (1000, None, 996)
    assert pressure_chart_series([], "hPa", NOW, 996) == ()


def test_aggregates_time_weighted_wind_separately_from_gust_peaks() -> None:
    rows = [p("2026-10-05T10:00:00Z", "10"), p("2026-10-05T10:09:00Z", "30")]
    assert wind_chart_series(rows, "km/h", NOW, 14, "mean")[0].value == 12
    assert wind_chart_series(rows, "km/h", NOW, 14, "peak")[0].value == 30
    assert len(wind_chart_series(rows, "km/h", NOW, 14, "mean")) == 37
    assert wind_chart_series([], "km/h", NOW, 14, "mean") == ()


def test_bridges_a_restart_but_keeps_a_long_outage_as_a_gap_with_unit_conversion() -> None:
    # Home Assistant restarting: the station is `unavailable` for five minutes. Its history draws on; so does the card.
    rows = [p("2026-10-05T10:05:00Z", "2"), p("2026-10-05T10:25:00Z", "unavailable"), p("2026-10-05T10:30:00Z", "5")]
    series = wind_chart_series(rows, "m/s", NOW, None, "mean")
    assert [series[i].value for i in range(4)] == [pytest.approx(7.2), pytest.approx(7.2), pytest.approx(7.2), 18]
    assert series[-1].value is None
    # The station off for half an hour: a gap, never a made-up line.
    rows = [p("2026-10-05T10:00:00Z", "2"), p("2026-10-05T10:20:00Z", "unavailable"), p("2026-10-05T10:50:00Z", "5")]
    series = wind_chart_series(rows, "m/s", NOW, None, "mean")
    assert [series[i].value is None for i in range(6)] == [False, False, True, True, True, False]


def test_keeps_brief_gust_peaks_while_bounding_dense_history_to_37_points() -> None:
    end = NOW.timestamp()
    rows = [Change(end - 21600 + i, "150" if i == 5000 else "10") for i in range(21600)]
    result = wind_chart_series(rows, "km/h", NOW, 14, "peak")
    assert len(result) == 37 and max(p.value or 0 for p in result) == 150


def trend(change: float | None, direction: Direction | None = None) -> Trend:
    return Trend(change, 60, direction, "")


def status(rate: float | None, wind_change: float | None, pressure: Direction | None) -> ColumnStatus:
    w = weather()
    return column_status(replace(w, rain=replace(w.rain, rate=rate), wind=replace(w.wind, trend=trend(wind_change)), pressure_trend=trend(-1.4, pressure)))


def test_echoes_current_rain_notable_wind_changes_and_pressure_trends() -> None:
    assert status(1.2, 9, Direction.FALLING) == ColumnStatus("Pluie en cours", "Le vent s’intensifie", "La pression baisse")
    assert status(5, -10, Direction.RISING) == ColumnStatus("Forte pluie en cours", "Le vent faiblit", "La pression monte")


def test_stays_silent_when_nothing_notable_happens_or_data_is_missing() -> None:
    assert status(0, 4, Direction.STEADY) == ColumnStatus()
    assert status(None, None, None) == ColumnStatus()
    assert column_status(None) == ColumnStatus()
