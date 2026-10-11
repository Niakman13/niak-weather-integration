"""Pollens from Polleninformation EU (krissen/polleninformation): one sensor per species and an overall allergy risk, each on its own
scale from 0 (none) to 4 (very high), today and tomorrow. Said as it is, never converted to Atmo's scale of 1 to 6."""
from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Any, Callable, Mapping, Sequence
from zoneinfo import ZoneInfo

from . import atmo
from .settings import LegacyPollen, Settings
from .units import finite

SCALE = 4
WORDS = ("Aucun", "Faible", "Modéré", "Élevé", "Très élevé")
COLORS = atmo.COLORS[1:6]
# The sensor's word, in any of the languages it writes (French words are feminine: « élevée », « très élevée »).
_WORDS = {"none": 0, "aucun": 0, "aucune": 0, "low": 1, "faible": 1, "moderate": 2, "modere": 2, "moderee": 2, "high": 3, "eleve": 3, "elevee": 3,
          "fort": 3, "forte": 3, "very high": 4, "very_high": 4, "tres eleve": 4, "tres elevee": 4}
SPECIES = {"grasses": ("Graminées", "mdi:grass"), "ragweed": ("Ambroisie", "mdi:flower-pollen"), "mugwort": ("Armoise", "mdi:flower-pollen"),
           "olive": ("Olivier", "mdi:leaf-circle"), "birch": ("Bouleau", "mdi:tree-outline"), "alder": ("Aulne", "mdi:tree-outline"),
           "hazel": ("Noisetier", "mdi:tree-outline"), "ash": ("Frêne", "mdi:tree-outline"), "plane": ("Platane", "mdi:tree-outline"),
           "cypress": ("Cyprès", "mdi:pine-tree"), "oak": ("Chêne", "mdi:tree-outline"), "poplar": ("Peuplier", "mdi:tree-outline")}
_RISK = re.compile(r"_allergy_risk$")


def level(state: Any, tomorrow: bool = False) -> int | None:
    """The level from 0 to 4: the sensor's number first, its word otherwise; None when unknown."""
    if state is None or state.state in ("unavailable", "unknown"):
        return None
    attributes: Mapping[str, Any] = state.attributes
    number = finite(attributes.get("tomorrow_numeric_state" if tomorrow else "numeric_state"))
    if number is None and not tomorrow:
        word = atmo.normal(state.state).strip()
        number = _WORDS.get(word, finite(state.state))
    return None if number is None else max(0, min(SCALE, int(round(number))))


def name(pollen: LegacyPollen, state: Any) -> str:
    """« Graminées »: the name chosen, else the species, else the sensor's own name without « Polleninformation (Lieu) »."""
    if pollen.name:
        return pollen.name
    slug = str(state.attributes.get("allergen_slug") or "") if state is not None else ""
    if slug in SPECIES:
        return SPECIES[slug][0]
    friendly = str(state.attributes.get("friendly_name") or "") if state is not None else ""
    return re.sub(r"^Polleninformation\s*(\([^)]*\))?\s*", "", friendly) or pollen.entity_id


def reading(state: Any, entity_id: str, tomorrow: bool, now: datetime, zone: ZoneInfo, label_name: str = "") -> atmo.Reading | None:
    """A Polleninformation sensor in the same shape as an Atmo reading, on the scale of 0 to 4."""
    if state is None:
        return None
    value = level(state, tomorrow)
    stamp = state.attributes.get("last_updated")
    published: datetime | None = None
    if isinstance(stamp, str):
        try:
            published = datetime.fromisoformat(stamp)
        except ValueError:
            published = None
    return atmo.Reading(entity_id=entity_id, label=label_name or (WORDS[value] if value is not None else "Indisponible"), value=value,
                        color=COLORS[value] if value is not None else atmo.COLORS[0], zone=str(state.attributes.get("location_title") or ""),
                        updated=published.astimezone(zone).strftime("%d/%m %H:%M") if published and published.tzinfo else "", unit=None,
                        stale=published is not None and published.tzinfo is not None and now - published > timedelta(hours=48))


def readings(get: Callable[[str], Any], settings: Settings, tomorrow: bool, now: datetime, zone: ZoneInfo
             ) -> tuple[atmo.Reading | None, list[tuple[str, atmo.Reading]]]:
    """The overall risk (or None), and each species with its name."""
    risk = reading(get(settings.pollen_risk_entity), settings.pollen_risk_entity, tomorrow, now, zone) if settings.pollen_risk_entity else None
    species = []
    for pollen in settings.pollens:
        state = get(pollen.entity_id)
        r = reading(state, pollen.entity_id, tomorrow, now, zone)
        if r is not None:
            species.append((name(pollen, state), r))
    return risk, species


def worst(risk: atmo.Reading | None, species: Sequence[tuple[str, atmo.Reading]]) -> tuple[int | None, str | None]:
    """The day's level (the overall risk when there is one, else the worst species) and the species that weighs most."""
    known = [(n, r) for n, r in species if r.value is not None and not r.stale]
    top = max(known, key=lambda x: x[1].value or 0) if known else None
    if risk is not None and risk.value is not None and not risk.stale:
        return int(risk.value), top[0] if top and top[1].value else None
    return (int(top[1].value or 0), top[0] if top[1].value else None) if top else (None, None)


# ---- Detection, for the configuration form ----

def candidates(states: Sequence[Any], registry: Mapping[str, Mapping[str, Any]]) -> tuple[list[str], list[str]]:
    """Polleninformation species sensors and allergy-risk sensors, by their integration or their name."""
    species, risks = [], []
    for state in states:
        entity_id = state.entity_id
        if not entity_id.startswith("sensor."):
            continue
        entry = registry.get(entity_id) or {}
        ours = entry.get("platform") == "polleninformation" or entity_id.startswith("sensor.polleninformation_")
        if not ours or entry.get("disabled_by"):
            continue
        if _RISK.search(entity_id):
            risks.append(entity_id)
        elif state.attributes.get("allergen_slug") or state.attributes.get("type") == "pollen" or re.search(r"_(" + "|".join(SPECIES) + ")$", entity_id):
            species.append(entity_id)
    return sorted(species), sorted(risks)


def place_of(entity_id: str, state: Any) -> str:
    slug = state.attributes.get("location_slug") if state is not None else None
    if slug:
        return str(slug)
    match = re.match(r"^sensor\.polleninformation_(.+?)_[a-z_]+$", entity_id)
    return match.group(1) if match else ""


def detect(states: Sequence[Any], registry: Mapping[str, Mapping[str, Any]]) -> dict[str, Any]:
    """The species and the risk of the only place, when there is just one: with several, the user chooses."""
    species, risks = candidates(states, registry)
    by_id = {s.entity_id: s for s in states}
    places = {place_of(i, by_id.get(i)) for i in (*species, *risks)}
    if len(places) != 1:
        return {}
    found: dict[str, Any] = {"pollens": [pollen_option(i, by_id.get(i)) for i in species]}
    if risks:
        found["pollen_risk_entity"] = risks[0]
    return found


def pollen_option(entity_id: str, state: Any) -> dict[str, str]:
    """A species as the settings store it."""
    slug = str(state.attributes.get("allergen_slug") or "") if state is not None else ""
    if not slug:
        match = re.search(r"_([a-z]+)$", entity_id)
        slug = match.group(1) if match else ""
    label, icon = SPECIES.get(slug, ("", "mdi:flower-pollen"))
    return {"id": entity_id, "nom": label, "ico": icon}
