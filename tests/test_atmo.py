"""Atmo France: finding the 38 sensors and reading them honestly (ported from the card's atmo tests)."""
from dataclasses import dataclass, field, replace
from datetime import datetime, timezone
from typing import Any
from zoneinfo import ZoneInfo

from engine.atmo import METRICS, areas, candidates, detect, reading
from engine.detection import detect_station
from engine.settings import ATMO_KEYS, Settings, atmo_key

PARIS = ZoneInfo("Europe/Paris")
NOW = datetime(2026, 10, 4, 10, tzinfo=timezone.utc)
POLLUTION = ("air", "pm25", "pm10", "no2", "o3", "so2")
NAMES = {"air": "Qualité globale", "pollen": "Qualité globale Pollen", "pm25": "PM25", "pm10": "PM10", "no2": "Dioxyde d’azote", "o3": "Ozone",
         "so2": "Dioxyde de soufre"}


@dataclass
class State:
    entity_id: str
    state: str
    attributes: dict[str, Any] = field(default_factory=dict)


def fixture(city: str = "Ma commune", entry: str = "a") -> tuple[list[State], dict[str, dict[str, Any]]]:
    """An Atmo France install for one town: every measure, today and tomorrow, renamed entities included."""
    states, registry = [], {}
    for tomorrow in (False, True):
        for metric in METRICS:
            entity_id, concentration = f"sensor.{entry}_{metric}{'_j_1' if tomorrow else ''}", metric.endswith("_concentration")
            label = NAMES.get(metric, METRICS[metric].label)
            states.append(State(entity_id, "1.4" if concentration else "1", {
                "attribution": "Atmo France-AtmoSud", "Nom de la zone": city, "Type de zone": "Commune", "friendly_name": "Entité renommée",
                **({"unit_of_measurement": "µg/m³"} if concentration else {})}))
            registry[entity_id] = {"platform": "atmofrance", "device_id": f"{'air' if metric in POLLUTION else 'pollen'}-{entry}", "config_entry_id": entry,
                                   "original_name": f"{label}-{city}{'-J+1' if tomorrow else ''}", "unique_id": f"{entry}-12345-{label}{'-J+1' if tomorrow else ''}"}
    return states, registry


def test_recognises_all_38_sensors_renamed_tomorrow_and_concentrations_included() -> None:
    states, registry = fixture()
    result = detect(states, registry, {})
    assert len(ATMO_KEYS) == 38 and all(key in result for key in ATMO_KEYS)
    assert {k: result[k] for k in ("atmo_area", "pollen_source", "atmo_air_entity", "atmo_air_tomorrow_entity", "atmo_grass_concentration_entity")} == {
        "atmo_area": "zone:commune:ma commune", "pollen_source": "atmo", "atmo_air_entity": "sensor.a_air", "atmo_air_tomorrow_entity": "sensor.a_air_j_1",
        "atmo_grass_concentration_entity": "sensor.a_grass_concentration"}


def test_groups_by_zone_and_never_picks_a_random_first_town() -> None:
    (a, ra), (b, rb) = fixture("Paris", "a"), fixture("Lyon", "b")
    states, registry = [*a, *b], {**ra, **rb}
    assert len(areas(states, registry)) == 2
    assert detect(states, registry, {}) == {}
    assert detect(states, registry, {"location": "Lyon"})["atmo_air_entity"] == "sensor.b_air"
    assert candidates(states, "atmo_air_entity", registry, "zone:commune:lyon") == ["sensor.b_air"]


def test_keeps_manual_choices_cleared_fields_and_a_declined_zone() -> None:
    states, registry = fixture()
    assert "atmo_air_entity" not in detect(states, registry, {"atmo_air_entity": "sensor.manual", "atmo_grass_entity": ""})
    assert "atmo_grass_entity" not in detect(states, registry, {"atmo_grass_entity": ""})
    assert detect(states, registry, {"atmo_area": ""}) == {}
    assert "pollen_source" not in detect(states, registry, {"pollen_source": "none"})


def test_does_not_mix_other_aqi_indoor_pollutants_or_polleninformation() -> None:
    states = [State("sensor.indoor_pm25", "12", {"device_class": "pm25", "unit_of_measurement": "µg/m³"}),
              State("sensor.polleninformation_city_grasses", "3"), State("sensor.qualite_globale", "4")]
    assert candidates(states, "atmo_pm25_entity", {}) == []
    assert detect(states, {}, {}) == {}
    assert "pollens" not in detect_station(states, {}, {}, {})
    assert len(detect_station(states, {}, {}, {"pollen_source": "legacy"})["pollens"]) == 1


def test_works_without_the_registry_from_attribution_and_zone() -> None:
    states, registry = fixture()
    named = [replace(s, attributes={**s.attributes, "friendly_name": registry[s.entity_id]["original_name"]}) for s in states]
    assert detect(named, {}, {})["atmo_air_entity"] == "sensor.a_air"
    assert detect(named, registry, {})["atmo_area"] == detect(named, {}, {})["atmo_area"]


def test_never_chooses_between_duplicates_and_skips_disabled_entities() -> None:
    states, registry = fixture()
    original = next(s for s in states if s.entity_id == "sensor.a_air")
    states.append(replace(original, entity_id="sensor.duplicate"))
    registry["sensor.duplicate"] = dict(registry["sensor.a_air"])
    assert "atmo_air_entity" not in detect(states, registry, {})
    registry["sensor.duplicate"]["disabled_by"] = "user"
    assert detect(states, registry, {})["atmo_air_entity"] == "sensor.a_air"


# ── Reading ──────────────────────────────────────────────────────────────────

def read(value: str, pollen: bool, attributes: dict[str, Any] | None = None, concentration: bool = False):
    return reading(State("sensor.test", value, attributes or {}), "sensor.test", pollen, NOW, PARIS, concentration)


def test_never_reads_0_as_no_allergens_and_keeps_all_six_pollen_levels() -> None:
    zero = read("0", True)
    assert (zero.label, zero.value) == ("Indisponible", None)
    assert [read(v, True).label for v in ("1", "2", "6")] == ["Très faible", "Faible", "Extrêmement élevé"]
    assert read("7", False).label == "Événement"


def test_does_not_take_a_concentration_for_an_index_nor_invent_missing_data() -> None:
    assert read("4", False, {"unit_of_measurement": "µg/m³"}).value is None
    for value in ("unknown", "unavailable", "", "1.2", "9", "-1"):
        assert read(value, True).value is None, value
    assert reading(None, "sensor.deleted", False, NOW, PARIS).label == "Indisponible"
    concentration = read("0", True, {"unit_of_measurement": "µg/m³"}, concentration=True)
    assert (concentration.value, concentration.unit) == (0, "µg/m³")


def test_keeps_published_labels_safe_colours_local_time_and_freshness() -> None:
    attributes = {"Libellé": "Élevé", "Couleur": "#ff5050", "Date de mise à jour": "2026-10-03T12:00:00", "Nom de la zone": "Ma commune"}
    r = read("4", True, attributes)
    assert (r.label, r.color, r.updated, r.stale) == ("Élevé", "#ff5050", "03/10 14:00", False)
    unsafe = read("4", True, {**attributes, "Couleur": "red;display:none", "Date de mise à jour": "2026-09-01"})
    assert (unsafe.color, unsafe.stale) == ("#ff5050", True)
    assert read("4", True, {"Date de mise à jour": "unknown"}).updated == ""


def test_leaves_out_the_older_pollen_list_only_when_atmo_gives_the_pollens() -> None:
    old = {"weather_entity": "weather.test", "pollens": [{"id": "sensor.old", "nom": "Ancien"}]}
    assert not Settings.from_options(old).atmo_pollens
    assert Settings.from_options({**old, "atmo_pollen_entity": "sensor.atmo"}).atmo_pollens
    assert not Settings.from_options({**old, "atmo_pollen_entity": "sensor.atmo", "pollen_source": "legacy"}).atmo_pollens
    assert atmo_key("grass_concentration", True) == "atmo_grass_concentration_tomorrow_entity"


def test_independent_air_and_pollen_zones_keep_all_38_sensors():
    states, registry = fixture("Legé")
    for state in states:
        metric = state.entity_id.removeprefix("sensor.a_").removesuffix("_j_1")
        if metric in POLLUTION:
            state.attributes.update({"Nom de la zone": "CC Sud Retz Atlantique", "Type de zone": "EPCI"})
    result = detect(states, registry, {"atmo_area": "zone:epci:cc sud retz atlantique", "atmo_pollen_area": "zone:commune:lege"})
    assert all(key in result for key in ATMO_KEYS)
    # The pollen source works even when the air zone is explicitly disabled.
    result = detect(states, registry, {"atmo_area": "", "atmo_pollen_area": "zone:commune:lege"})
    assert result["atmo_pollen_entity"] == "sensor.a_pollen"
    assert "atmo_air_entity" not in result
