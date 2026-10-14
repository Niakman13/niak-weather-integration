"""The « Météo » tab of the shared « Niak » panel (socle, see socle.py) and what the panel's home page says about Niak Weather.

The assistant of Paramètres (Configurer) stays as it is while the panel takes over: Niak Weather keeps no former panel
address, so the « Configurer » button still opens it.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant

from .const import DOMAIN, LOGGER
from .draft import Draft, ecosystem_of, entity_keys, linked, needs_text
from .engine import detection, ecosystem, families, home
from .engine.settings import Settings
from .socle import async_register_brick

ASSETS = f"/{DOMAIN}-assets"
CARD_REPOSITORY = "Niakman13/niak-weather"
# Where each missing source shows on the tab's home page; the others under the entities.
NEED_ROW = {"vigilance": "prevision", "qualite_air": "air", "pollens": "pollen"}
FAILED = (ConfigEntryState.SETUP_ERROR, ConfigEntryState.SETUP_RETRY, ConfigEntryState.MIGRATION_ERROR, ConfigEntryState.FAILED_UNLOAD)


async def async_setup_panel(hass: HomeAssistant, version: str) -> None:
    if not getattr(hass, "http", None) or not hasattr(hass.http, "async_register_static_paths"):
        return  # Headless setups and isolated tests have no frontend.
    if not hass.data.get(f"{DOMAIN}_panel"):
        await hass.http.async_register_static_paths([StaticPathConfig(ASSETS, str(Path(__file__).parent / "frontend"), False)])
        for command in (ws_places, ws_open, ws_change, ws_save):
            websocket_api.async_register_command(hass, command)
        hass.data[f"{DOMAIN}_panel"] = True
    await async_register_brick(hass, {
        "domain": DOMAIN, "name": "Niak Weather", "slug": "meteo", "tab": "Météo", "version": version, "icon": "mdi:weather-partly-cloudy",
        "module_url": f"{ASSETS}/panel.js?v={version}", "element": "niak-weather-setup", "status": weather_status, "legacy_path": "",
    }, f"{ASSETS}/niak-socle.js?v={version}")


def _capital(text: str) -> str:
    return text[:1].upper() + text[1:]


def _entries(hass: HomeAssistant) -> list[Any]:
    return sorted(hass.config_entries.async_entries(DOMAIN), key=lambda e: e.title)


def _entry(hass: HomeAssistant, entry_id: str | None) -> Any:
    entry = hass.config_entries.async_get_entry(entry_id) if entry_id else None
    if entry_id and (entry is None or entry.domain != DOMAIN):
        raise LookupError("Lieu Niak Weather introuvable.")
    return entry


def _silent(hass: HomeAssistant, sources: dict[str, Any]) -> tuple[int, list[str]]:
    """How many station sensors are chosen, and the names of those that do not answer."""
    chosen = [sources[f] for f in detection.STATION_FIELDS if sources.get(f)]
    silent = []
    for entity_id in chosen:
        state = hass.states.get(entity_id)
        if state is None or state.state in ("unavailable", "unknown"):
            silent.append(str(state.attributes.get("friendly_name") or entity_id) if state else entity_id)
    return len(chosen), silent


def place(hass: HomeAssistant, entry: Any) -> tuple[dict[str, Any], home.Place]:
    """One place, for the tab's home page and for the panel's home page."""
    sources = dict(entry.options)
    summary = Draft(hass, sources, entry)._summary()
    loaded = entry.state is ConfigEntryState.LOADED
    # Between saving and running again a place is only restarting: not an error.
    failed = entry.state in FAILED
    count, silent = _silent(hass, sources)
    try:
        missing = families.needs(Settings.from_options(sources))
    except ValueError:
        missing = {}
    present = entity_keys(hass, entry)
    todo: dict[str, list[str]] = {}
    for key, text in missing.items():
        if present.get(key):
            todo.setdefault(NEED_ROW.get(key, "entities"), []).append(needs_text(key, text))
    needs = [n for lines in todo.values() for n in lines]
    if silent:
        todo.setdefault("station", []).insert(0, "Ne répond pas : " + ", ".join(silent))
    enabled = [k for k, on in present.items() if on]
    chosen_families = {families.family_of(k) for k in enabled} - {None}
    bricks = ecosystem_of(hass, entry.entry_id)
    rows = [
        {"key": "prevision", "title": "Prévisions", "text": summary["weather"], "stage": 0},
        {"key": "station", "title": "Station", "text": summary["station"] + (", tous répondent" if count and not silent else ""), "stage": 1},
        {"key": "air", "title": "Qualité de l’air", "text": _capital(summary["air"]), "stage": 2},
        {"key": "pollen", "title": "Pollens", "text": _capital(summary["pollen"]), "stage": 3},
        {"key": "entities", "title": "Capteurs et automatisations", "stage": 4,
         "text": f"{len(enabled)} actives sur {len(present)} · {len(chosen_families)} famille{'s' if len(chosen_families) > 1 else ''}"},
    ]
    for row in rows:
        row["todo"] = todo.get(row["key"], [])
    coordinator = getattr(entry, "runtime_data", None) if loaded else None
    info = {"entry_id": entry.entry_id, "title": entry.title, "loaded": loaded, "failed": failed, "rows": rows,
            "ecosystem": {"text": _capital(ecosystem.summary(linked(hass, entry.entry_id))), "bricks": bricks}}
    status = home.Place(title=entry.title, loaded=not failed, station=count, silent=silent,
                        forecast=bool(getattr(coordinator, "hours", None)) if coordinator is not None else True,
                        needs=needs, links=[b["name"] for b in bricks if b["state"] == "linked"]
                        # A brick that did not say who it is (an older version) is still a link.
                        + (["une autre brique Niak"] if linked(hass, entry.entry_id).get("") else []))
    return info, status


def card_version(hass: HomeAssistant) -> str | None:
    """The Niak Weather card's version as HACS installed it; "" when HACS knows it is not installed; None when unknown."""
    hacs = hass.data.get("hacs")
    try:
        repository = hacs.repositories.get_by_full_name(CARD_REPOSITORY) if hacs is not None else None
        if repository is None:
            return None
        if not repository.data.installed:
            return ""
        return str(repository.data.installed_version or "").removeprefix("v") or None
    except Exception:  # noqa: BLE001 - HACS's insides may change: the card's version is then simply unknown
        LOGGER.debug("Card version not read from HACS", exc_info=True)
        return None


async def weather_status(hass: HomeAssistant) -> dict[str, Any]:
    """What the « Niak » home page says about Niak Weather, from its own settings only."""
    return home.status([place(hass, e)[1] for e in _entries(hass)], card_version(hass))


def _has_weather(hass: HomeAssistant) -> bool:
    return any(not s.entity_id.startswith(f"weather.{DOMAIN}") for s in hass.states.async_all("weather"))


@websocket_api.websocket_command({vol.Required("type"): "niak_weather/panel/places"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_places(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    connection.send_result(msg["id"], {"places": [place(hass, e)[0] for e in _entries(hass)], "can_add": _has_weather(hass)})


def _send_draft(connection: websocket_api.ActiveConnection, msg: dict[str, Any], draft: Draft, error: str = "", **extra: Any) -> None:
    connection.send_result(msg["id"], {"draft": draft.sources, "view": draft.view(), "error": error, **extra})


@websocket_api.websocket_command({vol.Required("type"): "niak_weather/panel/open", vol.Optional("entry_id"): str})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_open(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """A place's draft: its settings with what the assistant would propose. Without `entry_id`, a new place."""
    try:
        entry = _entry(hass, msg.get("entry_id"))
    except LookupError as err:
        connection.send_error(msg["id"], "not_found", str(err))
        return
    if entry is None and not _has_weather(hass):
        connection.send_error(msg["id"], "no_weather", "Aucun service météo dans Home Assistant : installez Météo-France, puis revenez ici.")
        return
    # The saved settings come along: what Niak proposes on top of them shows as proposed.
    _send_draft(connection, msg, Draft.start(hass, entry), saved=dict(entry.options) if entry else None)


@websocket_api.websocket_command({vol.Required("type"): "niak_weather/panel/change", vol.Optional("entry_id"): str,
                                  vol.Required("draft"): dict, vol.Required("change"): dict})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_change(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """One change to the draft, as the assistant's step would make it. Nothing is saved."""
    try:
        entry = _entry(hass, msg.get("entry_id"))
    except LookupError as err:
        connection.send_error(msg["id"], "not_found", str(err))
        return
    draft = Draft(hass, msg["draft"], entry)
    error = draft.change(msg["change"])
    # A refused change leaves the draft as it was.
    _send_draft(connection, msg, Draft(hass, msg["draft"], entry) if error else draft, error)


@websocket_api.websocket_command({vol.Required("type"): "niak_weather/panel/save", vol.Optional("entry_id"): str,
                                  vol.Required("draft"): dict, vol.Optional("enabled"): [str]})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Saves the place: it restarts with its new settings."""
    try:
        entry_id = await Draft(hass, msg["draft"], _entry(hass, msg.get("entry_id"))).save(msg.get("enabled"))
    except (LookupError, ValueError) as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    connection.send_result(msg["id"], {"entry_id": entry_id})
