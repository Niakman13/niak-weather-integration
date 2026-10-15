"""The settings of a place in the « Météo » tab of the Niak panel: a draft changed step by step, then saved at once.

It follows the assistant of Paramètres (config_flow.py) step for step and reuses its detection, so that both give the same
settings; that assistant stays available while the panel takes over. Nothing is saved before `save`.
"""
from __future__ import annotations

import json
from functools import cache
from pathlib import Path
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .api import API_KEY
from .config_flow import NONE, _clean, _context, _SourceSteps
from .const import DOMAIN
from .engine import detection, ecosystem, families, polleninfo
from .engine.settings import Settings

POLLEN_SOURCES = ("atmo", polleninfo.POLLENINFORMATION, polleninfo.IRM_KMI, NONE)
SIMPLE = frozenset({"weather_entity", "location", "vigilance_entity", "season_entity", "sun_entity", "sun_elevation_entity",
                    "forecast_source", "station_history", "pollen_risk_entity", *detection.STATION_FIELDS})
RECOMMENDED = frozenset({"temperature_entity", "humidity_entity", "rain_rate_entity", "wind_gust_entity", "wind_bearing_entity"})
HELP = {
    "weather_entity": "Les prévisions heure par heure et jour par jour. Météo-France de préférence ; Niak Weather les corrige avec votre station.",
    "vigilance_entity": "Les alertes officielles du département s’ajoutent à celles que calcule Niak.",
    "season_entity": "Sans capteur, la saison suit la date.",
    "temperature_entity": "La température dehors, à l’ombre.",
    "rain_rate_entity": "Dit s’il pleut maintenant (mm/h). Un cumul de la journée ne le dit pas.",
    "wind_gust_entity": "Les pointes de vent : elles déclenchent l’alerte de vent fort.",
    "wind_bearing_entity": "D’où vient le vent, en degrés.",
    "station_history": "Cumuls de pluie, tendance de la température et rafale du jour, quand la station ne les donne pas.",
}
MODELS = (("gw2000a", "Ecowitt GW2000A", "Passerelle Ecowitt et ses capteurs"),
          ("ws90", "Ecowitt WS90", "Capteur tout-en-un, souvent via Zigbee2MQTT"),
          (detection.NETATMO, "Netatmo", "Station Netatmo et ses modules : extérieur, pluviomètre, anémomètre"),
          ("manual", "Une autre station", "Vous choisissez chaque capteur"),
          (NONE, "Pas de station", "Niak Weather s’appuie sur le service météo seul"))


@cache
def _translations() -> dict[str, Any]:
    return json.loads((Path(__file__).parent / "translations" / "fr.json").read_text(encoding="utf-8"))


def _label(text: str) -> tuple[str, str]:
    """« Ressenti — la température ressentie » → its name and its hint."""
    name, _, hint = text.partition(" — ")
    return name, hint


def field_label(field: str) -> str:
    for section in _translations()["options"]["step"]["station_sensors"]["sections"].values():
        if field in section["data"]:
            return str(section["data"][field])
    return field


def entity_label(key: str) -> tuple[str, str]:
    return _label(_translations()["selector"]["entity"]["options"].get(key, key))


def family_label(family: str) -> tuple[str, str]:
    return _label(_translations()["selector"]["family"]["options"].get(family, family))


def needs_text(key: str, text: str) -> str:
    return f"{entity_label(key)[0]} : il faut {text}"


def _settings(sources: dict[str, Any]) -> Settings:
    # A draft may not have its weather service yet: what the entities need does not depend on it.
    return Settings.from_options(_clean({**sources, "weather_entity": sources.get("weather_entity") or "-"}))


class Draft(_SourceSteps):
    """The sources of one place being changed. The step methods of the assistant are not used: only its helpers."""

    def __init__(self, hass: HomeAssistant, sources: dict[str, Any], entry: ConfigEntry | None = None) -> None:
        self.hass, self.sources, self.entry = hass, dict(sources), entry

    @classmethod
    def start(cls, hass: HomeAssistant, entry: ConfigEntry | None) -> Draft:
        """The saved settings with what the assistant would propose on each screen; for a new place, everything detected."""
        draft = cls(hass, dict(entry.options) if entry else {}, entry)
        draft._fill("weather")
        draft._fill("station")
        if entry is None:
            areas = draft._areas()
            draft.sources["air_source"] = "atmo" if areas else "none"
            if areas:
                draft._fill("atmo")
                draft.sources.setdefault("atmo_area", areas[0]["value"])
            draft._apply_atmo()
            found = draft._pollen_found()
            draft.change({"op": "pollen", "value": "atmo" if areas else next((p for p, ok in found.items() if ok), NONE)})
            draft.sources["families"] = list(families.DEFAULT_FAMILIES)
        return draft

    def _fill(self, category: str, fill_empty: bool = False) -> None:
        states, registry, devices = _context(self.hass)
        self.sources = detection.fill(states, registry, devices, self.sources, category, fill_empty)

    def _pollen_found(self) -> dict[str, bool]:
        states, registry, _ = _context(self.hass)
        return {p: bool(polleninfo.candidates(states, registry, p)[0]) for p in polleninfo.PROVIDERS}

    def pollen_choice(self) -> str:
        source = self.sources.get("pollen_source")
        if source == "legacy":
            return polleninfo.provider(_settings(self.sources))
        return source if source in ("atmo", NONE) else NONE

    # ---- Changes, one per action of the tab; each returns an error message, or "" ----

    def change(self, change: dict[str, Any]) -> str:
        op, value, s = change.get("op"), change.get("value"), self.sources
        if op == "set" and change.get("key") in SIMPLE:
            s[change["key"]] = bool(value) if change["key"] == "station_history" else (value or "")
        elif op == "station":
            if value == NONE:
                s["station_model"], s["station_device_id"] = "", ""
                for field in detection.STATION_FIELDS:
                    s[field] = ""
            elif value in detection.STATION_MODELS:
                s["station_model"] = value
                if s.get("station_device_id") == "":
                    s.pop("station_device_id")
                shown = {f for _, _, group in detection.station_groups(value) for f in group}
                for field in detection.STATION_FIELDS:
                    # A field this model does not have is left unset; one emptied by « no station » is proposed again.
                    if field not in shown or s.get(field) == "":
                        s.pop(field, None)
                self._fill("station")
            else:
                return "Modèle de station inconnu."
        elif op == "device":
            s["station_device_id"] = "" if value in (None, NONE) else value
            for field in detection.STATION_FIELDS:
                s.pop(field, None)
            self._fill("station")
        elif op == "redetect":
            self._fill("weather" if value == "weather" else "station", fill_empty=True)
        elif op == "air":
            s["air_source"] = "none" if value == NONE else "atmo"
            if value != NONE:
                s["atmo_area"] = value
            elif s.get("pollen_source") != "atmo":
                s["atmo_area"] = ""
            self._apply_atmo()
        elif op == "pollen":
            return self._pollen(value, change.get("area"))
        elif op == "pollens":
            states, registry, _ = _context(self.hass)
            by_id = {st.entity_id: st for st in states}
            s["pollens"] = [polleninfo.pollen_option(i, by_id.get(i), registry) for i in value or []]
        elif op == "families" and self.entry is None:
            s["families"] = [f for f, _ in families.FAMILIES if f in (value or [])]
        else:
            return "Changement inconnu."
        return ""

    def _pollen(self, source: Any, area: str | None) -> str:
        areas, found, s = self._areas(), self._pollen_found(), self.sources
        if source not in POLLEN_SOURCES:
            return "Source de pollens inconnue."
        if source == "atmo" and not areas:
            return "Atmo France n’est pas installée."
        if source in found and not found[source]:
            return f"{polleninfo.PROVIDERS[source]} n’est pas installée."
        if source in found:
            if source != self.pollen_choice():
                # Another integration: its own sensors are proposed, not the other one's.
                s.pop("pollens", None)
                s.pop("pollen_risk_entity", None)
            s["pollen_provider"], s["pollen_source"] = source, "legacy"
            if "pollens" not in s:
                # First time with this source: all its species, and the overall risk of its only place.
                states, registry, _ = _context(self.hass)
                by_id = {st.entity_id: st for st in states}
                detected = polleninfo.detect(states, registry, source)
                s["pollens"] = detected.get("pollens") or [polleninfo.pollen_option(i, by_id.get(i), registry)
                                                           for i in polleninfo.candidates(states, registry, source)[0]]
                if detected.get("pollen_risk_entity"):
                    s["pollen_risk_entity"] = detected["pollen_risk_entity"]
        else:
            s["pollen_source"] = source
            if source == "atmo" and (area or not s.get("atmo_area")):
                s["atmo_area"] = area or areas[0]["value"]
        self._apply_atmo()
        return ""

    # ---- What the tab shows ----

    def _entity(self, entity_id: str | None) -> dict[str, Any] | None:
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        if state is None:
            return {"id": entity_id, "name": entity_id, "state": "", "available": False, "missing": True}
        available = state.state not in ("unavailable", "unknown")
        unit = state.attributes.get("unit_of_measurement")
        value = state.state if available else "indisponible"
        return {"id": entity_id, "name": str(state.attributes.get("friendly_name") or entity_id),
                "state": f"{value} {unit}" if unit and available else value, "available": available, "missing": False}

    def _field(self, key: str, label: str, ids: list[str], *, required: bool = False, warning: str = "",
               better: str = "", recognized: list[str] | None = None) -> dict[str, Any]:
        value = self.sources.get(key) or ""
        entity = self._entity(value)
        if not warning and entity:
            warning = ("Ce capteur n’existe plus dans Home Assistant." if entity["missing"]
                       else "Ce capteur ne répond pas pour l’instant." if not entity["available"] else "")
        allowed = sorted(set(ids) | ({value} if value else set()))
        return {"key": key, "label": label, "help": HELP.get(key, ""), "value": value, "entity": entity,
                "need": "Obligatoire" if required else "Conseillé" if key in RECOMMENDED else "Facultatif",
                "options": [e for e in map(self._entity, allowed) if e], "warning": warning,
                # Recognised by their name and measure: listed first, the others after.
                "recognized": [i for i in recognized or [] if i in allowed],
                "better": self._entity(better) if better else None}

    def view(self) -> dict[str, Any]:
        return {"title": self._title(), "prevision": self._prevision(), "station": self._station(), "air": self._air(),
                "pollen": self._pollens(), "entities": self.entities(), "summary": self._summary(), "needs": self.needs()}

    def _prevision(self) -> dict[str, Any]:
        states, registry, _ = _context(self.hass)
        s = self.sources
        own = {i for i, e in registry.items() if i.startswith("weather.") and e.get("platform") == DOMAIN}
        vigilance = detection.vigilance_candidates(states, registry)
        return {
            "fields": [
                self._field("weather_entity", "Service météo", [st.entity_id for st in states if st.entity_id.startswith("weather.") and st.entity_id not in own],
                            required=True, warning="" if s.get("weather_entity") else "Choisissez le service qui donne les prévisions."),
                self._field("vigilance_entity", "Vigilance Météo-France", vigilance,
                            warning="" if vigilance or s.get("vigilance_entity") else
                            "Aucun capteur de vigilance trouvé : installez Météo-France avec votre département, puis « Rechercher à nouveau »."),
                self._field("season_entity", "Saison", detection.season_candidates(states, registry)),
            ],
            "location": s.get("location") or "", "location_placeholder": self._title(),
            "advanced": [
                self._field("sun_entity", "Soleil", [st.entity_id for st in states if st.entity_id.startswith("sun.")]),
                self._field("sun_elevation_entity", "Hauteur du soleil",
                            [st.entity_id for st in states if st.entity_id.startswith("sensor.") and detection.measurement_matches(st, "sun_elevation_entity")]),
            ],
            "forecast_source": s.get("forecast_source") or "",
        }

    def station_model(self) -> str:
        s = self.sources
        if not s.get("station_model") and not any(s.get(f) for f in detection.STATION_FIELDS):
            return NONE
        return detection.selected_station_model(s)

    def _station(self) -> dict[str, Any]:
        states, registry, devices = _context(self.hass)
        s, model, groups = self.sources, self.station_model(), []
        netatmo = model == detection.NETATMO
        disabled = detection.netatmo_disabled(registry, devices, s) if netatmo else {}
        for name, title, group in detection.station_groups(model) if model != NONE else ():
            fields = []
            for field in group:
                value, found = s.get(field) or "", detection.candidates(states, field, registry, s, devices)
                warning, better = "", ""
                state = self.hass.states.get(value) if value else None
                if state is not None and not detection.function_matches(state, field, registry.get(value)):
                    warning = f"Ce capteur ne semble pas donner : {field_label(field).lower()}."
                    better = found[0] if len(found) == 1 and found[0] != value else ""
                elif s.get(field) is None and len(found) > 1:
                    warning = "Plusieurs capteurs possibles : choisissez le bon."
                elif field in disabled:
                    module = devices.get((registry.get(disabled[field]) or {}).get("device_id") or "") or {}
                    warning = (f"Home Assistant livre ce capteur Netatmo désactivé : activez {disabled[field]} "
                               f"(appareil « {module.get('name_by_user') or module.get('name') or 'Netatmo'} »), puis « Rechercher à nouveau les capteurs ».")
                fields.append(self._field(field, field_label(field), detection.manual_candidates(states, field, registry, s, devices),
                                          warning=warning, better=better, recognized=found))
            groups.append({"name": name, "title": title, "fields": fields})
        return {"model": model, "models": [{"value": v, "label": label, "hint": hint} for v, label, hint in MODELS],
                "device": s.get("station_device_id") or NONE,
                "devices": [{"value": NONE, "label": "Aucun appareil — capteurs séparés"},
                            *(self._netatmo_devices(devices) if netatmo else detection.source_devices(states, registry, devices))],
                "profile": detection.station_profile(states, registry, devices, s.get("station_device_id")),
                "history": bool(s.get("station_history", True)), "history_help": HELP["station_history"], "groups": groups}

    @staticmethod
    def _netatmo_devices(devices: dict[str, dict[str, Any]]) -> list[dict[str, str]]:
        """A Netatmo station is chosen as a whole, by its main module: its other modules come with it."""
        return [{"value": i, "label": str(devices[i].get("name_by_user") or devices[i].get("name") or i)} for i in detection.netatmo_stations(devices)]

    def _air(self) -> dict[str, Any]:
        s = self.sources
        return {"value": NONE if s.get("air_source") == "none" or not s.get("atmo_area") else s["atmo_area"], "areas": self._areas()}

    def _pollens(self) -> dict[str, Any]:
        states, registry, _ = _context(self.hass)
        areas, found, choice = self._areas(), self._pollen_found(), self.pollen_choice()
        sources = [{"value": "atmo", "label": "Atmo France", "hint": "Un indice de 1 à 6 par espèce, pour une zone Atmo France",
                    "available": bool(areas)},
                   *({"value": p, "label": polleninfo.PROVIDERS[p] + (" (Belgique)" if p == polleninfo.IRM_KMI else ""),
                      "hint": "Un capteur par espèce, niveaux de 0 à 4", "available": found[p]} for p in polleninfo.PROVIDERS),
                   {"value": NONE, "label": "Pas de pollens", "hint": "", "available": True}]
        result: dict[str, Any] = {"value": choice, "sources": sources, "area": self.sources.get("atmo_area") or "", "areas": areas,
                                  "species": [], "risk": None}
        if choice in polleninfo.PROVIDERS:
            species, risks = polleninfo.candidates(states, registry, choice)
            chosen = [p.get("id") for p in self.sources.get("pollens") or [] if isinstance(p, dict)]
            for entity_id in sorted(set(species) | set(chosen)):
                entity = self._entity(entity_id) or {}
                option = polleninfo.pollen_option(entity_id, self.hass.states.get(entity_id), registry)
                result["species"].append({**entity, "label": option["nom"] or entity.get("name"), "chosen": entity_id in chosen})
            if choice == polleninfo.POLLENINFORMATION:
                result["risk"] = self._field("pollen_risk_entity", "Risque allergique global", risks)
        return result

    def entities(self) -> dict[str, Any]:
        """Existing place: its entities by family, ticked when enabled. New place: the families to start with."""
        if self.entry is None:
            chosen = set(self.sources.get("families") or [])
            return {"new": True, "families": [{"key": f, "name": family_label(f)[0], "hint": family_label(f)[1], "chosen": f in chosen}
                                              for f, _ in families.FAMILIES]}
        needs, present = families.needs(_settings(self.sources)), entity_keys(self.hass, self.entry)
        return {"new": False, "families": [
            {"key": f, "name": family_label(f)[0], "entities": [
                {"key": k, "name": entity_label(k)[0], "hint": entity_label(k)[1], "enabled": present[k],
                 "need": f"Il faut {needs[k]}." if k in needs else ""} for k in keys if k in present]}
            for f, keys in families.FAMILIES if any(k in present for k in keys)]}

    def needs(self) -> list[str]:
        """What the enabled (or, for a new place, chosen) entities still miss."""
        needs = families.needs(_settings(self.sources))
        if self.entry is None:
            chosen = set(self.sources.get("families") or [])
            return [needs_text(k, t) for k, t in needs.items() if families.family_of(k) in chosen]
        present = entity_keys(self.hass, self.entry)
        return [needs_text(k, t) for k, t in needs.items() if present.get(k)]

    # ---- Saving ----

    async def save(self, enabled: list[str] | None) -> str:
        """Saves the place (a new one through the assistant, as Paramètres would) and its entities switched on or off."""
        sources = _clean(self.sources)
        if not sources.get("weather_entity") or self.hass.states.get(sources["weather_entity"]) is None:
            raise ValueError("Choisissez le service météo (étape Prévisions).")
        if self.entry is None:
            result = await self.hass.config_entries.flow.async_init(DOMAIN, context={"source": "panel"},
                                                                    data={"title": self._title(), "options": sources})
            entry = result.get("result")
            return entry.entry_id if entry else ""
        entry = self.entry
        if enabled is not None:
            registry, prefix, changed = er.async_get(self.hass), f"{entry.entry_id}_", False
            for item in er.async_entries_for_config_entry(registry, entry.entry_id):
                if not item.unique_id.startswith(prefix):
                    continue
                key = item.unique_id.removeprefix(prefix)
                if key in enabled and item.disabled_by is not None:
                    registry.async_update_entity(item.entity_id, disabled_by=None)
                    changed = True
                elif key not in enabled and item.disabled_by is None:
                    registry.async_update_entity(item.entity_id, disabled_by=er.RegistryEntryDisabler.USER)
                    changed = True
            if changed and sources == dict(entry.options):
                # Enabled entities appear once the place restarts, even when no setting changed.
                self.hass.config_entries.async_schedule_reload(entry.entry_id)
        self.hass.config_entries.async_update_entry(entry, title=self._title(), options=sources)
        return entry.entry_id


def entity_keys(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, bool]:
    """This place's entities by key, and whether each is enabled."""
    prefix = f"{entry.entry_id}_"
    return {e.unique_id.removeprefix(prefix): e.disabled_by is None
            for e in er.async_entries_for_config_entry(er.async_get(hass), entry.entry_id) if e.unique_id.startswith(prefix)}


def linked(hass: HomeAssistant, entry_id: str) -> dict[str, int]:
    api = hass.data.get(API_KEY)
    return api.linked(entry_id) if api is not None else {}


def ecosystem_of(hass: HomeAssistant, entry_id: str) -> list[dict[str, str]]:
    installed = {e.domain for e in hass.config_entries.async_entries() if e.domain.startswith("niak_")}
    return ecosystem.states(linked(hass, entry_id), installed)
