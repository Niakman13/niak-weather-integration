"""Swiss providers: stable registry ids, honest availability and native danger degrees."""
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from zoneinfo import ZoneInfo

import pytest

from engine import polleninfo
from engine.brief import read_vigilance
from engine.compute import compute
from engine.detection import detect_sources, vigilance_candidates
from engine.settings import Settings
from engine.catalogue import Item
from engine.watch import AlertWatch
from engine.alerts import vigilance_parts

NOW = datetime(2026, 4, 15, 12, tzinfo=timezone.utc)
ZONE = ZoneInfo("Europe/Zurich")


def state(entity_id, value, **attributes):
    return SimpleNamespace(entity_id=entity_id, state=value, attributes=attributes, last_updated=NOW)


def pollen_data(station="BAS", plant="BEECH", word="very_strong"):
    level = state(f"sensor.renamed_{station}_{plant}", word)
    health = state(f"sensor.health_{station}_{plant}", "online")
    registry = {s.entity_id: {"platform": "swiss_pollen", "unique_id": f"{station}.{plant}.{suffix}",
                             "config_entry_id": plant} for s, suffix in [(level, "level"), (health, "station_state")]}
    return [level, health], registry


def pollen_run(word="very_strong", health="online"):
    states, registry = pollen_data(word=word)
    states[1].state = health
    options = polleninfo.detect(states, registry, "swiss_pollen")
    settings = Settings.from_options({"weather_entity": "weather.home", "pollen_source": "legacy",
                                     "pollen_provider": "swiss_pollen", **options})
    values = {s.entity_id: s for s in states}
    values["weather.home"] = state("weather.home", "sunny", temperature=20, temperature_unit="°C")
    return settings, compute(values.get, settings, [], [], {}, {}, [], None, NOW, ZONE)


@pytest.mark.parametrize("word,expected", [("none", 0), ("low", 1), ("medium", 2), ("strong", 3), ("very_strong", 4)])
def test_swiss_pollen_levels_reach_the_sensor_and_card(word, expected):
    settings, result = pollen_run(word)
    assert settings.pollen_provider == "swiss_pollen"
    assert result.catalogue["pollens"].value == expected
    assert result.catalogue["pollens"].source == "swiss_pollen"
    panel = next(p for p in result.view.air.today if p.kind == "pollen")
    assert panel.primary.value == expected and panel.source == "Swiss Pollen" and panel.scale == 4
    assert panel.details[0].label == "Hêtre"
    assert not any(p.kind == "pollen" for p in result.view.air.tomorrow)
    assert result.catalogue["pollens"].extra["demain"] is None
    assert settings.pollens[0].station_state_entity in settings.entity_ids()


@pytest.mark.parametrize("health", ["offline", "error", "unknown", "unavailable"])
def test_station_failure_cannot_report_zero_or_trigger_a_pollen_alert(health):
    _, result = pollen_run(health=health)
    assert result.catalogue["pollens"].value is None
    assert not any(s.key.startswith("legacy-") for s in result.brief.signals)
    assert not any(c.entity and c.entity.startswith("sensor.renamed_") for c in result.view.extras)


def test_detection_groups_species_by_station_across_config_entries():
    states, registry = pollen_data()
    others, entries = pollen_data(plant="BIRCH")
    found = polleninfo.detect(states + others, registry | entries, "swiss_pollen")
    assert {p["nom"] for p in found["pollens"]} == {"Hêtre", "Bouleau"}
    assert len(polleninfo.candidates(states + others, registry | entries, "swiss_pollen")[0]) == 2
    others, entries = pollen_data(station="BER")
    assert polleninfo.detect(states + others, registry | entries, "swiss_pollen") == {}


def warnings(levels=(3, 5), ends=None):
    return state("sensor.alerts", str(len(levels)), attribution="Source: MeteoSwiss",
                 warning_types=["Forest fires", "Flood"][:len(levels)], warning_levels_numeric=list(levels),
                 warning_valid_from=[(NOW - timedelta(hours=1)).isoformat()] * len(levels),
                 warning_valid_to=ends or [(NOW + timedelta(hours=2)).isoformat()] * len(levels),
                 warning_texts=["Consignes"] * len(levels), warning_links=["https://www.meteosuisse.admin.ch"])


def read(s):
    return read_vigilance(Settings(weather_entity="weather.home", vigilance_entity=s.entity_id), lambda _: s, NOW)


def test_all_swiss_dangers_and_native_degree_five_survive_the_pipeline():
    s = warnings()
    settings = Settings(weather_entity="weather.home", vigilance_entity=s.entity_id)
    values = {s.entity_id: s, "weather.home": state("weather.home", "sunny", temperature=20, temperature_unit="°C")}
    result = compute(values.get, settings, [], [], {}, {}, [], None, NOW, ZONE)
    official = next(s for s in result.brief.signals if s.key == "official")
    assert "MétéoSuisse" in official.text and "5/5" in official.text
    assert "feux de forêt" in official.text and "crues" in official.text
    item = result.catalogue["vigilance"]
    assert item.value == "rouge" and item.extra["degre"] == 5
    assert item.extra["degres_phenomenes"] == {"Crues": 5, "Feux de forêt": 3}


@pytest.mark.parametrize("native,internal", [(0, 0), (1, 0), (2, 1), (3, 2), (4, 3), (5, 3)])
def test_native_danger_mapping(native, internal):
    assert read(warnings((native,))).level == internal


def test_expired_alerts_are_removed_and_missing_data_stays_unknown():
    s = warnings(ends=[(NOW - timedelta(minutes=1)).isoformat(), (NOW + timedelta(hours=1)).isoformat()])
    assert "feux de forêt" not in read(s).text
    assert read(warnings((3,), [(NOW - timedelta(seconds=1)).isoformat()])).level == 0
    assert read(warnings(())).level == 0
    del s.attributes["warning_levels_numeric"]
    assert read(s) is None


@pytest.mark.parametrize("value", ["unknown", "unavailable", "-1", "two"])
def test_aggregate_warning_unavailable_or_invalid_count_is_unknown(value):
    s = warnings()
    s.state = value
    assert read(s) is None


def test_missing_pollen_diagnostics_do_not_create_an_alert():
    states, registry = pollen_data()
    del registry[states[1].entity_id]
    chosen = polleninfo.detect(states, registry, "swiss_pollen")
    settings = Settings.from_options({"weather_entity": "weather.home", "pollen_source": "legacy",
                                     "pollen_provider": "swiss_pollen", **chosen})
    assert polleninfo.usable_level({s.entity_id: s for s in states}.get, settings, settings.pollens[0]) is None
    s = warnings()
    s.last_updated = NOW - timedelta(hours=49)
    assert read(s) is None


def test_only_the_aggregate_warning_sensor_is_proposed_even_when_renamed():
    s = warnings()
    other = state("sensor.severity", "Significant hazard")
    registry = {s.entity_id: {"platform": "swissweather", "unique_id": "2829.warnings", "config_entry_id": "swiss"},
                other.entity_id: {"platform": "swissweather", "unique_id": "2829.warning.level.0", "config_entry_id": "swiss"},
                "weather.home": {"platform": "swissweather", "config_entry_id": "swiss"}}
    states = [s, other, state("weather.home", "sunny")]
    assert vigilance_candidates(states, registry) == [s.entity_id]
    assert detect_sources(states, registry, {})["vigilance_entity"] == s.entity_id


@pytest.mark.parametrize("field,value", [
    ("warning_levels_numeric", [6]), ("warning_levels_numeric", [True]),
    ("warning_valid_to", ["not-a-date"]), ("warning_valid_to", [None]),
    ("warning_valid_to", ["2026-04-16T12:00:00"]), ("warning_types", []),
    ("warning_texts", []), ("warning_valid_from", ["2026-04-18T12:00:00+00:00"]),
])
def test_incomplete_or_invalid_warnings_never_become_green(field, value):
    s = warnings((3,))
    s.attributes[field] = value
    assert read(s) is None


def test_upcoming_warnings_are_visible_before_their_start_time():
    s = warnings((3,))
    s.attributes["warning_valid_from"] = [(NOW + timedelta(minutes=30)).isoformat()]
    assert read(s).extra["alertes"][0]["debut"] == (NOW + timedelta(minutes=30)).isoformat()


def test_native_change_from_four_to_five_emits_an_alert_even_with_the_same_hestia_color():
    watch = AlertWatch()
    for degree in (4, 5):
        official = read(warnings((degree,)))
        item = Item("rouge", official.text, "vigilance", level=official.level, extra=official.extra)
        events = watch.update({"vigilance": item}, NOW + timedelta(minutes=degree))
        assert len(events) == 1 and events[0].phase == ("debut" if degree == 4 else "change")
        assert f"{degree}/5" in events[0].text


def test_swiss_warning_pill_keeps_the_native_degree_and_phenomena():
    label, details = vigilance_parts(read(warnings()).text)
    assert "MétéoSuisse" in label and "5/5" in label
    assert details.startswith("Crues (5/5)")
