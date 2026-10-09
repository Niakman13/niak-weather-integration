"""Air quality and pollens from the Atmo France integration (sebcaps/atmofrance).

Pollution sensors are indices from 1 to 6 (7 = event), NOT concentrations. Pollen levels use 1..6; 0 is missing.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Iterable, Mapping, Protocol, Sequence
from zoneinfo import ZoneInfo

from .settings import ATMO_KEYS, ATMO_METRICS, Settings, atmo_key
from .units import finite


@dataclass(frozen=True)
class Metric:
    label: str
    icon: str
    key: str
    """The integration's translation key, kept even when a user renames the entity."""
    match: re.Pattern[str]


METRICS: dict[str, Metric] = {
    "air": Metric("Air extérieur — indice global", "mdi:air-filter", "code_qual", re.compile(r"qualite.*globale(?!.*pollen)")),
    "pm25": Metric("PM2.5 — sous-indice", "mdi:blur", "code_pm25", re.compile(r"pm2[._\s]?5")),
    "pm10": Metric("PM10 — sous-indice", "mdi:blur", "code_pm10", re.compile(r"pm10")),
    "no2": Metric("NO₂ — sous-indice", "mdi:molecule", "code_no2", re.compile(r"dioxyde.*azote|\bno2\b")),
    "o3": Metric("O₃ — sous-indice", "mdi:molecule", "code_o3", re.compile(r"ozone|\bo3\b")),
    "so2": Metric("SO₂ — sous-indice", "mdi:molecule", "code_so2", re.compile(r"dioxyde.*soufre|\bso2\b")),
    "pollen": Metric("Pollens — indice global", "mdi:flower-pollen", "code_qual", re.compile(r"qualite.*globale.*pollen|pollen.*(?:global|index|indice)")),
    "grass": Metric("Graminées", "mdi:grass", "code_gram", re.compile(r"gramin")),
    "ragweed": Metric("Ambroisie", "mdi:flower-pollen", "code_ambr", re.compile(r"ambroisie|ragweed")),
    "mugwort": Metric("Armoise", "mdi:flower-pollen", "code_arm", re.compile(r"armoise|mugwort")),
    "alder": Metric("Aulne", "mdi:tree-outline", "code_aul", re.compile(r"aulne|alder")),
    "birch": Metric("Bouleau", "mdi:tree-outline", "code_boul", re.compile(r"bouleau|birch")),
    "olive": Metric("Olivier", "mdi:fruit-cherries", "code_oliv", re.compile(r"olivier|olive")),
    "grass_concentration": Metric("Concentration — Graminées", "mdi:grass", "conc_gram", re.compile(r"gramin")),
    "ragweed_concentration": Metric("Concentration — Ambroisie", "mdi:flower-pollen", "conc_ambr", re.compile(r"ambroisie|ragweed")),
    "mugwort_concentration": Metric("Concentration — Armoise", "mdi:flower-pollen", "conc_arm", re.compile(r"armoise|mugwort")),
    "alder_concentration": Metric("Concentration — Aulne", "mdi:tree-outline", "conc_aul", re.compile(r"aulne|alder")),
    "birch_concentration": Metric("Concentration — Bouleau", "mdi:tree-outline", "conc_boul", re.compile(r"bouleau|birch")),
    "olive_concentration": Metric("Concentration — Olivier", "mdi:fruit-cherries", "conc_oliv", re.compile(r"olivier|olive")),
}
assert tuple(METRICS) == ATMO_METRICS
POLLEN_METRICS = ("grass", "ragweed", "mugwort", "alder", "birch", "olive")
POLLUTANT_METRICS = ("pm25", "pm10", "no2", "o3", "so2")

AIR_LABELS = ("Indisponible", "Bon", "Moyen", "Dégradé", "Mauvais", "Très mauvais", "Extrêmement mauvais", "Événement")
POLLEN_LABELS = ("Indisponible", "Très faible", "Faible", "Modéré", "Élevé", "Très élevé", "Extrêmement élevé")
COLORS = ("#969696", "#50f0e6", "#50ccaa", "#f0e641", "#ff5050", "#960032", "#872181", "#888888")


def normal(value: Any) -> str:
    """Lower case without accents, for matching names whatever their spelling."""
    text = unicodedata.normalize("NFD", "" if value is None else str(value))
    return "".join(c for c in text if not unicodedata.combining(c)).lower()


def short_label(metric: str) -> str:
    return METRICS[metric].label.replace(" — sous-indice", "")


class StateLike(Protocol):
    entity_id: str
    state: str
    attributes: Mapping[str, Any]


@dataclass(frozen=True)
class Reading:
    entity_id: str
    label: str
    value: float | None
    color: str
    zone: str
    updated: str
    """Publication date « jj/mm hh:mm » in local time, empty when unknown."""
    unit: str | None
    """Only for concentrations."""
    stale: bool
    """Published more than 48 h ago: not used to decide anything."""


def reading(state: StateLike | None, entity_id: str, pollen: bool, now: datetime, zone: ZoneInfo, concentration: bool = False) -> Reading | None:
    """One Atmo sensor, checked: only a real level counts (1–6, 7 = event for the air), never a guess."""
    if not entity_id:
        return None
    attributes: Mapping[str, Any] = state.attributes if state else {}
    raw = state.state if state else None
    number = finite(raw) if raw not in (None, "unavailable", "unknown") else None
    valid = number is not None and (number >= 0 if concentration else number.is_integer() and 1 <= number <= (6 if pollen else 7)) and (
        concentration or not attributes.get("unit_of_measurement"))
    index = int(number) if valid and not concentration and number is not None else None
    labels = POLLEN_LABELS if pollen else AIR_LABELS
    label = str(attributes.get("Libellé") or (labels[index] if index is not None and index < len(labels) else "")) if valid else "Indisponible"
    color = str(attributes.get("Couleur")) if valid and re.fullmatch(r"#[\da-fA-F]{3}(?:[\da-fA-F]{3})?", str(attributes.get("Couleur"))) else (
        COLORS[index] if index is not None and not concentration else COLORS[0])
    stamp = attributes.get("Date de mise à jour")
    published: datetime | None = None
    if isinstance(stamp, str):
        try:
            published = datetime.fromisoformat(stamp.replace("Z", "+00:00"))
        except ValueError:
            published = None
        if published is not None and published.tzinfo is None:
            # Atmo writes its publication time without a zone: it is UTC.
            published = published.replace(tzinfo=timezone.utc)
    return Reading(entity_id=entity_id, label=label, value=number if valid else None, color=color, zone=str(attributes.get("Nom de la zone") or ""),
                   updated=published.astimezone(zone).strftime("%d/%m %H:%M") if published else "",
                   unit=str(attributes.get("unit_of_measurement") or "") if concentration else None,
                   stale=published is not None and now - published > timedelta(hours=48))


def read_metric(get: Any, settings: Settings, metric: str, tomorrow: bool, now: datetime, zone: ZoneInfo) -> Reading | None:
    entity_id = settings.atmo.get(atmo_key(metric, tomorrow), "")
    return reading(get(entity_id) if entity_id else None, entity_id, metric not in ("air", *POLLUTANT_METRICS), now, zone,
                   concentration=metric.endswith("_concentration"))


# ---- Detection, for the configuration form ----

def _text(state: StateLike, entry: Mapping[str, Any] | None) -> str:
    e = entry or {}
    return normal(f"{state.entity_id} {state.attributes.get('friendly_name', '')} {e.get('original_name') or ''} {e.get('unique_id') or ''} {e.get('translation_key') or ''}")


def _is_atmo(state: StateLike, entry: Mapping[str, Any] | None) -> bool:
    # Do not mistake a generic AQI, Polleninformation or an indoor PM sensor for Atmo France.
    return (entry or {}).get("platform") == "atmofrance" or bool(re.search(r"atmo[ _-]?france", normal(state.attributes.get("attribution"))))


def _is_tomorrow(state: StateLike, entry: Mapping[str, Any] | None) -> bool:
    return bool(re.search(r"(?:\bj\s*[+_ -]\s*1\b|\bdemain\b|\btomorrow\b|_j_?1(?:_|\b))", _text(state, entry)))


def _area(state: StateLike, entry: Mapping[str, Any] | None) -> str:
    zone = state.attributes.get("Nom de la zone")
    if zone:
        return f"zone:{normal(state.attributes.get('Type de zone'))}:{normal(zone)}"
    if (entry or {}).get("config_entry_id"):
        return f"entry:{entry['config_entry_id']}"  # type: ignore[index]
    # No geographic metadata: do not mix unknown locations by assuming the whole integration is one town.
    return ""


def areas(states: Iterable[StateLike], registry: Mapping[str, Mapping[str, Any]], devices: Mapping[str, Mapping[str, Any]] | None = None) -> list[dict[str, str]]:
    """The Atmo France zones present, to choose one."""
    groups: dict[str, str] = {}
    for state in states:
        entry = registry.get(state.entity_id)
        if not _is_atmo(state, entry) or (entry or {}).get("disabled_by"):
            continue
        key = _area(state, entry)
        if key:
            device = (devices or {}).get((entry or {}).get("device_id") or "", {})
            groups[key] = str(state.attributes.get("Nom de la zone") or device.get("name_by_user") or "Atmo France")
    values = [{"value": k, "label": v} for k, v in groups.items()]
    for v in values:
        if sum(1 for o in values if o["label"] == v["label"]) > 1:
            v["label"] = f"{v['label']} ({v['value'][-6:]})"
    return sorted(values, key=lambda v: v["label"])


def candidates(states: Sequence[StateLike], key: str, registry: Mapping[str, Mapping[str, Any]], area: str | None = None) -> list[str]:
    """The sensors that can fill one Atmo setting (atmo_pm25_entity…), in the chosen zone."""
    tomorrow = "_tomorrow_entity" in key
    metric = re.sub(r"(?:_tomorrow)?_entity$", "", key[5:])
    spec = METRICS.get(metric)
    if spec is None:
        return []
    found = []
    for state in states:
        entry = registry.get(state.entity_id)
        if not state.entity_id.startswith("sensor.") or (entry or {}).get("disabled_by") or not _is_atmo(state, entry) or _is_tomorrow(state, entry) != tomorrow:
            continue
        if area and _area(state, entry) != area:
            continue
        text, concentration = _text(state, entry), metric.endswith("_concentration")
        if concentration != bool(re.search(r"concentration|\bconc_", text) or state.attributes.get("unit_of_measurement")):
            continue
        if (metric == "air" and "pollen" in text) or (metric == "pollen" and "pollen" not in text):
            continue
        # Home Assistant lets users rename entities; the integration's own unique_id and translation key keep the measure.
        if spec.match.search(text) or (spec.key != "code_qual" and normal((entry or {}).get("translation_key")) == spec.key):
            found.append(state.entity_id)
    return sorted(found)


def detect(states: Sequence[StateLike], registry: Mapping[str, Mapping[str, Any]], options: Mapping[str, Any],
           devices: Mapping[str, Mapping[str, Any]] | None = None) -> dict[str, str]:
    """Atmo settings to propose: the zone (the only one, or the one named like the location) and each sensor found once."""
    found: dict[str, str] = {}
    groups = areas(states, registry, devices)
    by_id = {s.entity_id: s for s in states}
    selected = {_area(by_id[options[k]], registry.get(options[k])) for k in ATMO_KEYS if options.get(k) in by_id} - {""}
    weather = by_id.get(options.get("weather_entity") or "")
    desired = normal(options.get("location") or (weather.attributes.get("friendly_name") if weather else ""))
    matches = [g for g in groups if normal(g["label"]) == desired]
    # An empty zone or pollen source is a choice (« none »), not a missing value: only what is unset gets detected.
    area = options.get("atmo_area")
    chosen = area if area is not None else (next(iter(selected)) if len(selected) == 1 else groups[0]["value"] if len(groups) == 1
                                            else matches[0]["value"] if len(matches) == 1 else None)
    if not chosen:
        return found
    if area is None:
        found["atmo_area"] = chosen
    if options.get("pollen_source") is None:
        found["pollen_source"] = "atmo"
    for key in ATMO_KEYS:
        if options.get(key) is not None:
            continue
        ids = candidates(states, key, registry, chosen)
        if len(ids) == 1:
            found[key] = ids[0]
    return found
