"""Kleenex/Scottex levels and dated forecasts, never concentration counts or retained stale data."""
from datetime import timedelta

import pytest

from engine import polleninfo
from engine import kleenex
from engine.compute import compute
from engine.settings import Settings
from test_swiss import NOW, ZONE, state


def data(place="home"):
    entries = {}
    states = []
    for key, value in [("trees", "120"), ("grass", "0"), ("weeds", "8"), ("trees_level", "high"),
                       ("date", NOW.date().isoformat()), ("last_updated", NOW.isoformat()), ("error", "")]:
        s = state(f"sensor.renamed_{place}_{key}", value)
        if key in ("trees", "grass", "weeds"):
            s.attributes.update(level={"trees": "very-high", "grass": "low", "weeds": "moderate"}[key],
                                forecast=[{"date": (NOW.date() + timedelta(days=n)).isoformat(), "value": 999,
                                           "level": "high" if n == 1 else "low"} for n in (2, 1)])
        entries[s.entity_id] = {"platform": "kleenex_pollenradar", "config_entry_id": place,
                               "unique_id": f"{place}-Kleenex Pollen Radar{key}"}
        states.append(s)
    return states, entries


def run(change=None):
    states, entries = data()
    options = polleninfo.detect(states, entries, "kleenex_pollenradar")
    settings = Settings.from_options({"weather_entity": "weather.home", "pollen_source": "legacy",
                                     "pollen_provider": "kleenex_pollenradar", **options})
    values = {s.entity_id: s for s in states}
    values["weather.home"] = state("weather.home", "sunny", temperature=20, temperature_unit="°C")
    if change:
        change(values)
    return settings, compute(values.get, settings, [], [], {}, {}, [], None, NOW, ZONE)


def test_detects_group_counts_with_level_attributes_without_duplicate_level_sensors():
    states, registry = data()
    species, risks = polleninfo.candidates(states, registry, "kleenex_pollenradar")
    assert species == ["sensor.renamed_home_grass", "sensor.renamed_home_trees", "sensor.renamed_home_weeds"]
    assert risks == []
    options = polleninfo.detect(states, registry, "kleenex_pollenradar")
    assert {p["nom"] for p in options["pollens"]} == {"Arbres", "Graminées", "Herbacées"}
    others, entries = data("other")
    assert polleninfo.detect(states + others, registry | entries, "kleenex_pollenradar") == {}


def test_card_sensor_brief_and_tomorrow_use_levels_and_calendar_dates():
    settings, result = run()
    assert result.catalogue["pollens"].value == 4
    assert result.catalogue["pollens"].extra["demain"] == 3
    today, tomorrow = result.view.air.today[0], result.view.air.tomorrow[0]
    assert today.primary.value == 4 and tomorrow.primary.value == 3
    assert today.source == "Kleenex / Scottex"
    assert {d.label for d in today.details} == {"Arbres", "Graminées", "Herbacées"}
    assert next(d for d in today.details if d.label == "Graminées").reading.value == 1
    assert any("Arbres" in s.text and "Kleenex" in s.explanation for s in result.brief.signals)
    assert "sensor.renamed_home_last_updated" in settings.entity_ids()
    assert "sensor.renamed_home_date" in settings.entity_ids()
    assert "sensor.renamed_home_error" in settings.entity_ids()


@pytest.mark.parametrize("key,value", [("last_updated", (NOW - timedelta(hours=49)).isoformat()),
                                       ("last_updated", "unknown"), ("last_updated", "2026-04-15T12:00:00"),
                                       ("date", (NOW.date() - timedelta(days=1)).isoformat()), ("error", "403 Forbidden")])
def test_retained_or_undated_data_never_looks_current(key, value):
    def change(states):
        states[f"sensor.renamed_home_{key}"].state = value
    _, result = run(change)
    assert result.catalogue["pollens"].value is None
    assert not any(s.key.startswith("legacy-") for s in result.brief.signals)
    assert not result.view.air.today and not result.view.air.tomorrow


def test_missing_tomorrow_stays_unknown():
    def change(states):
        for key in ("trees", "grass", "weeds"):
            states[f"sensor.renamed_home_{key}"].attributes["forecast"] = []
    _, result = run(change)
    assert result.catalogue["pollens"].extra["demain"] is None
    assert not result.view.air.tomorrow


def test_enabled_detail_sensors_keep_the_species_name_and_forecast():
    states, registry = data()
    detail = state("sensor.my_birch", "very-high", forecast=[{"date": (NOW.date() + timedelta(days=1)).isoformat(), "level": "low"}])
    registry[detail.entity_id] = {"platform": "kleenex_pollenradar", "unique_id": "home-Kleenex Pollen Radartrees_details-Bouleau-level"}
    option = polleninfo.pollen_option(detail.entity_id, detail, registry)
    assert option["nom"] == "Bouleau"
    settings = Settings.from_options({"weather_entity": "weather.home", "pollen_provider": "kleenex_pollenradar", "pollens": [option]})
    get = {s.entity_id: s for s in [*states, detail]}.get
    assert kleenex.reading(get, settings.pollens[0], False, NOW, ZONE).value == 4
    assert kleenex.reading(get, settings.pollens[0], True, NOW, ZONE).value == 1
    registry[detail.entity_id]["disabled_by"] = "user"
    assert detail.entity_id not in polleninfo.candidates([detail], registry, "kleenex_pollenradar")[0]


@pytest.mark.parametrize("key,value", [("date", "not-a-date"), ("trees", "unavailable")])
def test_invalid_date_or_unavailable_sensor_is_not_a_pollen_level(key, value):
    def change(states):
        states[f"sensor.renamed_home_{key}"].state = value
    _, result = run(change)
    if key == "date":
        assert result.catalogue["pollens"].value is None
    else:
        assert result.catalogue["pollens"].value == 2


def test_malformed_forecast_never_creates_a_tomorrow_value():
    def change(states):
        for key in ("trees", "grass", "weeds"):
            states[f"sensor.renamed_home_{key}"].attributes["forecast"] = "not-a-list"
    _, result = run(change)
    assert result.catalogue["pollens"].extra["demain"] is None


def test_missing_timestamp_diagnostic_and_unknown_level_remain_unknown():
    def change(states):
        del states["sensor.renamed_home_last_updated"]
    _, result = run(change)
    assert result.catalogue["pollens"].value is None
    def unknown(states):
        for key in ("trees", "grass", "weeds"):
            states[f"sensor.renamed_home_{key}"].attributes["level"] = "unknown"
    _, result = run(unknown)
    assert result.catalogue["pollens"].value is None
