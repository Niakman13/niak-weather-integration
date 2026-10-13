"""IRM KMI (Belgium): one pollen sensor per species, a colour from green to purple read on the 0-4 scale, today only, no overall risk."""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from engine import polleninfo
from engine.compute import compute
from engine.detection import detect_station
from engine.settings import Settings

BRUSSELS = ZoneInfo("Europe/Brussels")
NOW = datetime(2026, 4, 14, 10, 0, tzinfo=BRUSSELS)
OPTIONS = ["green", "yellow", "orange", "red", "purple", "none"]


@dataclass
class State:
    entity_id: str
    state: str
    attributes: dict[str, Any] = field(default_factory=dict)


def irm(slug: str, colour: str, entry: str = "irm1") -> tuple[State, tuple[str, dict[str, Any]]]:
    entity_id = f"sensor.maison_pollen_{slug}"
    return (State(entity_id, colour, {"options": OPTIONS, "device_class": "enum", "friendly_name": f"Maison Pollen {slug}"}),
            (entity_id, {"platform": "irm_kmi", "unique_id": f"{entry}-pollen-{slug}", "config_entry_id": entry, "disabled_by": None}))


PAIRS = [irm("birch", "purple"), irm("oak", "orange"), irm("grasses", "none"), irm("alder", "green")]
STATES = [s for s, _ in PAIRS]
REGISTRY = dict(r for _, r in PAIRS)
# IRM KMI's other sensors are not pollens.
STATES.append(State("sensor.maison_temperature", "14"))
REGISTRY["sensor.maison_temperature"] = {"platform": "irm_kmi", "unique_id": "irm1-current-temperature", "config_entry_id": "irm1"}


def test_colours_read_on_the_zero_to_four_scale() -> None:
    assert [polleninfo.level(State("sensor.x", c)) for c in OPTIONS] == [0, 1, 2, 3, 4, 0]
    # No tomorrow from IRM KMI: unknown, never « none ».
    assert polleninfo.level(STATES[0], tomorrow=True) is None


def test_only_irm_kmi_pollen_sensors_are_found_with_their_species() -> None:
    species, risks = polleninfo.candidates(STATES, REGISTRY, polleninfo.IRM_KMI)
    assert species == ["sensor.maison_pollen_alder", "sensor.maison_pollen_birch", "sensor.maison_pollen_grasses", "sensor.maison_pollen_oak"]
    assert risks == []
    # Polleninformation's search does not take them.
    assert polleninfo.candidates(STATES, REGISTRY) == ([], [])
    found = polleninfo.detect(STATES, REGISTRY, polleninfo.IRM_KMI)
    assert [(p["id"], p["nom"]) for p in found["pollens"]][:2] == [("sensor.maison_pollen_alder", "Aulne"), ("sensor.maison_pollen_birch", "Bouleau")]
    # Two IRM KMI places: the user chooses.
    other = irm("hazel", "yellow", "irm2")
    assert polleninfo.detect([*STATES, other[0]], {**REGISTRY, other[1][0]: other[1][1]}, polleninfo.IRM_KMI) == {}


def test_the_detection_fills_the_species_when_irm_kmi_is_the_source() -> None:
    found = detect_station(STATES, REGISTRY, {}, {"pollen_source": "legacy", "pollen_provider": "irm_kmi"})
    assert len(found["pollens"]) == 4 and "pollen_risk_entity" not in found


def run(pollens: bool = True):
    states = {s.entity_id: s for s in STATES}
    states["weather.home"] = State("weather.home", "sunny", {"temperature": 20, "temperature_unit": "°C"})
    chosen = [polleninfo.pollen_option(s.entity_id, s, REGISTRY) for s in STATES[:4]] if pollens else []
    settings = Settings.from_options({"weather_entity": "weather.home", "pollen_source": "legacy", "pollen_provider": "irm_kmi", "pollens": chosen})
    return compute(states.get, settings, [], [], {}, {}, [], None, NOW, BRUSSELS)


def test_panel_sensor_and_brief_say_irm_kmi() -> None:
    result = run()
    panel = next(p for p in result.view.air.today if p.kind == "pollen")
    assert panel.scale == 4 and panel.source == "IRM KMI" and panel.primary.value == 4
    assert [d.label for d in panel.details] == ["Bouleau", "Chêne", "Graminées", "Aulne"]
    assert not any(p.kind == "pollen" for p in result.view.air.tomorrow)
    item = result.catalogue["pollens"]
    assert (item.value, item.reason, item.source, item.extra["demain"]) == (4, "Très élevé (4/4) · Bouleau", "irm_kmi", None)
    assert any(s.text == "Bouleau : pollens très élevés" and "IRM KMI" in s.explanation for s in result.brief.signals)
    assert run(pollens=False).catalogue["pollens"].reason == "Capteurs IRM KMI non choisis"
