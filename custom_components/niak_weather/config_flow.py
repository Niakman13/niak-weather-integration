"""Setting up a place: the weather service, the station and the air quality. Every field comes pre-filled from what Home Assistant
already has, or from an existing Niak Weather card; a field left empty is a deliberate choice that detection never overrides."""
from __future__ import annotations

import json
from collections.abc import Iterator
from dataclasses import fields
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import HomeAssistant, State, callback
from homeassistant.data_entry_flow import section
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.selector import (BooleanSelector, EntitySelector, EntitySelectorConfig, SelectOptionDict, SelectSelector,
                                            SelectSelectorConfig, SelectSelectorMode, TextSelector)

from .const import CARD_TYPE, DOMAIN, LOGGER
from .engine import atmo, detection
from .engine.settings import ATMO_KEYS, Settings
from .engine.view import place_name

SETTING_KEYS = frozenset({f.name for f in fields(Settings)} - {"atmo"}) | frozenset(ATMO_KEYS)
NONE = "none"


def _context(hass: HomeAssistant) -> tuple[list[State], dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    """States, entity registry and device registry, in the plain form the detection reads."""
    registry = {e.entity_id: {"platform": e.platform, "device_id": e.device_id, "disabled_by": e.disabled_by, "config_entry_id": e.config_entry_id,
                              "unique_id": e.unique_id, "translation_key": e.translation_key, "original_name": e.original_name}
                for e in er.async_get(hass).entities.values()}
    device_registry = dr.async_get(hass)
    # Recent Home Assistant iterates the devices themselves, older versions their ids.
    entries = (device_registry.async_get(d) if isinstance(d, str) else d for d in device_registry.devices)
    devices = {d.id: {"name": d.name, "name_by_user": d.name_by_user, "manufacturer": d.manufacturer} for d in entries if d is not None}
    return hass.states.async_all(), registry, devices


def _sensor(choices: list[str], current: str = "") -> EntitySelector:
    """A sensor picker limited to what fits, keeping the current choice even when it does not."""
    allowed = sorted(set(choices) | ({current} if current else set()))
    return EntitySelector(EntitySelectorConfig(domain="sensor", include_entities=allowed) if allowed else EntitySelectorConfig(domain="sensor"))


def _clean(sources: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in sources.items() if k in SETTING_KEYS and v is not None}


def _cards(node: Any) -> Iterator[dict[str, Any]]:
    if isinstance(node, dict):
        if node.get("type") == CARD_TYPE:
            yield node
        for value in node.values():
            yield from _cards(value)
    elif isinstance(node, list):
        for item in node:
            yield from _cards(item)


async def find_cards(hass: HomeAssistant) -> list[dict[str, Any]]:
    """The source settings of the Niak Weather cards already on the dashboards, each set once."""
    data = hass.data.get("lovelace")
    dashboards = getattr(data, "dashboards", None)
    if dashboards is None and isinstance(data, dict):
        dashboards = data.get("dashboards")
    found: list[dict[str, Any]] = []
    seen: set[str] = set()
    for url, dashboard in (dashboards or {}).items():
        try:
            config = await dashboard.async_load(False)
        except Exception as err:  # noqa: BLE001 - an empty or broken dashboard is simply skipped
            LOGGER.debug("Dashboard %s not read: %s", url, err)
            continue
        name = (config.get("title") if isinstance(config, dict) else None) or url or "Aperçu"
        for card in _cards(config):
            sources = {k: v for k, v in card.items() if k in SETTING_KEYS}
            key = json.dumps(sources, sort_keys=True, default=str)
            if not sources.get("weather_entity") or key in seen:
                continue
            seen.add(key)
            found.append({"label": f"{sources.get('location') or sources['weather_entity']} · {name}", "sources": sources})
    return found


class _SourceSteps:
    """The steps shared by the first setup and later changes."""

    hass: HomeAssistant
    sources: dict[str, Any]

    async def _done(self, step: str) -> ConfigFlowResult:
        raise NotImplementedError

    async def async_step_weather(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        states, registry, devices = _context(self.hass)
        if not any(s.entity_id.startswith("weather.") for s in states):
            return self.async_abort(reason="no_weather")  # type: ignore[attr-defined]
        if user_input is not None:
            advanced = user_input.get("advanced") or {}
            for key in ("weather_entity", "location", "vigilance_entity", "season_entity"):
                self.sources[key] = user_input.get(key, "")
            for key in ("sun_entity", "sun_elevation_entity", "forecast_source"):
                self.sources[key] = advanced.get(key, "")
            return await self._done("weather")
        filled = detection.fill(states, registry, devices, self.sources, "weather")
        weather = self.hass.states.get(filled.get("weather_entity") or "")
        location = filled.get("location") or (place_name(str(weather.attributes.get("friendly_name") or "")) if weather else "")
        schema = vol.Schema({
            vol.Required("weather_entity"): EntitySelector(EntitySelectorConfig(domain="weather")),
            vol.Optional("location"): TextSelector(),
            vol.Optional("vigilance_entity"): _sensor(detection.vigilance_candidates(states, registry), filled.get("vigilance_entity") or ""),
            vol.Optional("season_entity"): _sensor(detection.season_candidates(states, registry), filled.get("season_entity") or ""),
            vol.Required("advanced"): section(vol.Schema({
                vol.Optional("sun_entity"): EntitySelector(EntitySelectorConfig(domain="sun")),
                vol.Optional("sun_elevation_entity"): EntitySelector(EntitySelectorConfig(domain="sensor")),
                vol.Optional("forecast_source"): TextSelector(),
            }), {"collapsed": True}),
        })
        suggested: dict[str, Any] = {k: v for k, v in {**filled, "location": location}.items() if v}
        suggested["advanced"] = {k: suggested[k] for k in ("sun_entity", "sun_elevation_entity", "forecast_source") if k in suggested}
        return self.async_show_form(step_id="weather", data_schema=self.add_suggested_values_to_schema(schema, suggested))  # type: ignore[attr-defined]

    async def async_step_station(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        states, registry, devices = _context(self.hass)
        if user_input is not None:
            model, device = user_input["station_model"], user_input.get("station_device_id", NONE)
            self.sources["station_model"] = "" if model == NONE else model
            self.sources["station_device_id"] = "" if device == NONE else device
            self.sources["station_history"] = user_input.get("station_history", True)
            if model == NONE:
                for field in detection.STATION_FIELDS:
                    self.sources[field] = ""
                return await self._done("station_sensors")
            return await self.async_step_station_sensors()
        filled = detection.fill(states, registry, devices, self.sources, "station")
        # « No station » chosen before: every station field was emptied on purpose.
        declined = self.sources.get("station_model") == "" and all(self.sources.get(f) == "" for f in detection.STATION_FIELDS)
        if declined or not any(filled.get(f) for f in detection.STATION_FIELDS):
            model = self.sources.get("station_model") or NONE
        else:
            model = detection.selected_station_model(filled)
        choices = [SelectOptionDict(value=NONE, label="Aucun appareil — capteurs séparés"),
                   *(SelectOptionDict(value=d["value"], label=d["label"]) for d in detection.source_devices(states, registry, devices))]
        schema = vol.Schema({
            vol.Required("station_model"): SelectSelector(SelectSelectorConfig(options=["gw2000a", "ws90", "manual", NONE], translation_key="station_model",
                                                                               mode=SelectSelectorMode.LIST)),
            vol.Required("station_device_id"): SelectSelector(SelectSelectorConfig(options=choices, mode=SelectSelectorMode.DROPDOWN)),
            vol.Required("station_history"): BooleanSelector(),
        })
        suggested = {"station_model": model, "station_device_id": filled.get("station_device_id") or NONE,
                     "station_history": self.sources.get("station_history", True)}
        report = detection.station_report(states, registry, devices, filled)
        return self.async_show_form(step_id="station", data_schema=self.add_suggested_values_to_schema(schema, suggested),  # type: ignore[attr-defined]
                                    description_placeholders={"profile": report["profile"], "recognized": str(report["recognized"])})

    async def async_step_station_sensors(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        states, registry, devices = _context(self.hass)
        groups = detection.station_groups(self.sources.get("station_model") or "manual")
        if user_input is not None:
            shown: set[str] = set()
            for name, _, group in groups:
                values = user_input.get(name) or {}
                for field in group:
                    self.sources[field] = values.get(field, "")
                    shown.add(field)
            # A field the station model does not have is left unset, not refused: another model may use it later.
            for field in detection.STATION_FIELDS:
                if field not in shown:
                    self.sources.pop(field, None)
            return await self._done("station_sensors")
        filled = detection.fill(states, registry, devices, self.sources, "station")
        schema: dict[Any, Any] = {}
        suggested: dict[str, dict[str, str]] = {}
        for name, _, group in groups:
            inner = {}
            for field in group:
                current = filled.get(field) or ""
                inner[vol.Optional(field)] = _sensor(detection.manual_candidates(states, field, registry, filled), current)
                if current:
                    suggested.setdefault(name, {})[field] = current
            schema[vol.Required(name)] = section(vol.Schema(inner), {"collapsed": False})
        return self.async_show_form(step_id="station_sensors",  # type: ignore[attr-defined]
                                    data_schema=self.add_suggested_values_to_schema(vol.Schema(schema), suggested))  # type: ignore[attr-defined]

    async def async_step_air(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        states, registry, devices = _context(self.hass)
        areas = atmo.areas(states, registry, devices)
        legacy = any(s.entity_id.startswith("sensor.polleninformation_") for s in states)
        if user_input is None and not areas and not legacy:
            return await self._done("air")
        if user_input is not None:
            area, source = user_input.get("atmo_area", NONE), user_input.get("pollen_source", NONE)
            for key in (*ATMO_KEYS, "pollens"):
                self.sources.pop(key, None)
            self.sources["atmo_area"] = "" if area == NONE else area
            self.sources["pollen_source"] = source
            if area != NONE or source == "legacy":
                self.sources = detection.fill(states, registry, devices, self.sources, "atmo")
            return await self._done("air")
        filled = detection.fill(states, registry, devices, self.sources, "atmo")
        choices = [*(["atmo"] if areas else []), *(["legacy"] if legacy else []), NONE]
        schema = vol.Schema({
            vol.Required("atmo_area"): SelectSelector(SelectSelectorConfig(
                options=[SelectOptionDict(value=NONE, label="Aucune"), *(SelectOptionDict(value=a["value"], label=a["label"]) for a in areas)],
                mode=SelectSelectorMode.DROPDOWN)),
            vol.Required("pollen_source"): SelectSelector(SelectSelectorConfig(options=choices, translation_key="pollen_source", mode=SelectSelectorMode.LIST)),
        })
        source = filled.get("pollen_source") or ("atmo" if areas else "legacy" if legacy else NONE)
        suggested = {"atmo_area": filled.get("atmo_area") or NONE, "pollen_source": source if source in choices else NONE}
        return self.async_show_form(step_id="air", data_schema=self.add_suggested_values_to_schema(schema, suggested))  # type: ignore[attr-defined]

    def _title(self) -> str:
        weather = self.hass.states.get(self.sources.get("weather_entity") or "")
        return self.sources.get("location") or (place_name(str(weather.attributes.get("friendly_name") or "")) if weather else "") or "Niak Weather"


class NiakWeatherConfigFlow(_SourceSteps, ConfigFlow, domain=DOMAIN):
    VERSION = 1

    def __init__(self) -> None:
        self.sources = {}
        self._cards: list[dict[str, Any]] = []

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> NiakWeatherOptionsFlow:
        return NiakWeatherOptionsFlow()

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        self._cards = await find_cards(self.hass)
        if self._cards:
            return self.async_show_menu(step_id="user", menu_options=["import_card", "weather"])
        return await self.async_step_weather()

    async def async_step_import_card(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Start from a card's settings: each step then shows them, to check before saving."""
        if user_input is not None:
            self.sources = dict(self._cards[int(user_input["card"])]["sources"])
            return await self.async_step_weather()
        choices = [SelectOptionDict(value=str(i), label=card["label"]) for i, card in enumerate(self._cards)]
        return self.async_show_form(step_id="import_card", data_schema=vol.Schema({
            vol.Required("card"): SelectSelector(SelectSelectorConfig(options=choices, mode=SelectSelectorMode.LIST))}))

    async def _done(self, step: str) -> ConfigFlowResult:
        if step == "weather":
            return await self.async_step_station()
        if step == "station_sensors":
            return await self.async_step_air()
        return self.async_create_entry(title=self._title(), data={}, options=_clean(self.sources))


class NiakWeatherOptionsFlow(_SourceSteps, OptionsFlow):
    """Change one part at a time: the weather service, the station or the air quality."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        self.sources = dict(self.config_entry.options)
        return self.async_show_menu(step_id="init", menu_options=["weather", "station", "air"])

    async def _done(self, step: str) -> ConfigFlowResult:
        if step == "weather" and self._title() != self.config_entry.title:
            self.hass.config_entries.async_update_entry(self.config_entry, title=self._title())
        return self.async_create_entry(data=_clean(self.sources))
