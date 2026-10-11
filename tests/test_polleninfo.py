"""Polleninformation EU: levels 0 to 4 read from the sensor's number (its French words are feminine), its own panel, the pollens sensor."""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from engine import polleninfo
from engine.compute import compute
from engine.settings import Settings

PARIS = ZoneInfo("Europe/Paris")
NOW = datetime(2026, 10, 11, 15, 40, tzinfo=PARIS)


@dataclass
class State:
    entity_id: str
    state: str
    attributes: dict[str, Any] = field(default_factory=dict)


def species(slug: str, word: str, level: int, tomorrow: int, place: str = "gardanne") -> State:
    return State(f"sensor.polleninformation_{place}_{slug}", word, {
        "numeric_state": level, "named_state": word, "tomorrow_numeric_state": tomorrow, "allergen_slug": slug, "location_title": place.capitalize(),
        "location_slug": place, "type": "pollen", "friendly_name": f"Polleninformation ({place.capitalize()}) {slug}", "last_updated": "2026-10-11T15:30:52+02:00"})


STATES = [species("grasses", "élevée", 3, 1), species("ragweed", "modérée", 2, 2), species("birch", "aucune", 0, 0),
          State("sensor.polleninformation_gardanne_allergy_risk", "modérée", {"numeric_state": 2, "tomorrow_numeric_state": 1, "location_slug": "gardanne",
                                                                              "location_title": "Gardanne", "last_updated": "2026-10-11T15:30:52+02:00"}),
          State("sensor.polleninformation_gardanne_allergy_risk_hourly", "aucune", {"numeric_state": 0, "location_slug": "gardanne"})]


def test_the_level_comes_from_the_number_and_understands_feminine_words() -> None:
    assert polleninfo.level(STATES[0]) == 3 and polleninfo.level(STATES[0], tomorrow=True) == 1
    assert polleninfo.level(State("sensor.x", "très élevée")) == 4
    assert polleninfo.level(State("sensor.x", "modérée")) == 2
    assert polleninfo.level(State("sensor.x", "unavailable")) is None


def test_detection_proposes_the_species_and_the_risk_of_the_only_place() -> None:
    found = polleninfo.detect(STATES, {})
    assert [p["id"] for p in found["pollens"]] == ["sensor.polleninformation_gardanne_birch", "sensor.polleninformation_gardanne_grasses",
                                                   "sensor.polleninformation_gardanne_ragweed"]
    assert found["pollens"][1]["nom"] == "Graminées"
    assert found["pollen_risk_entity"] == "sensor.polleninformation_gardanne_allergy_risk"
    # Two places: the user chooses.
    assert polleninfo.detect([*STATES, species("grasses", "faible", 1, 1, "marseille")], {}) == {}


def run(options: dict[str, Any]):
    states = {s.entity_id: s for s in STATES}
    states["weather.home"] = State("weather.home", "sunny", {"temperature": 20, "temperature_unit": "°C"})
    settings = Settings.from_options({"weather_entity": "weather.home", "pollen_source": "legacy", **options})
    return compute(states.get, settings, [], [], {}, {}, [], None, NOW, PARIS)


OPTIONS = {"pollens": [{"id": s.entity_id} for s in STATES[:3]], "pollen_risk_entity": "sensor.polleninformation_gardanne_allergy_risk"}


def test_the_pollen_panel_keeps_polleninformation_scale() -> None:
    result = run(OPTIONS)
    today, tomorrow = result.view.air.today, result.view.air.tomorrow
    panel = next(p for p in today if p.kind == "pollen")
    assert panel.scale == 4 and panel.primary.value == 2 and panel.zone == "Gardanne"
    assert [d.label for d in panel.details] == ["Graminées", "Ambroisie", "Bouleau"]
    assert panel.worse is not None and panel.worse.label == "Graminées"
    assert next(p for p in tomorrow if p.kind == "pollen").primary.value == 1


def test_the_pollens_sensor_and_the_brief_use_polleninformation() -> None:
    result = run(OPTIONS)
    item = result.catalogue["pollens"]
    assert item.value == 2 and item.reason == "Modéré (2/4) · Graminées" and item.extra["echelle"] == 4 and item.extra["demain"] == 1
    assert any(s.text == "Graminées : pollens élevés" for s in result.brief.signals)
    assert run({}).catalogue["pollens"].reason == "Capteurs Polleninformation non choisis"
