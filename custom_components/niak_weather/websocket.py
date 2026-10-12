"""What the Niak Weather card asks for: the configured places, and a live view of one of them."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN, VIEW_VERSION
from .coordinator import NiakWeatherConfigEntry

# This integration's version (manifest.json), sent with every view.
VERSION_KEY = f"{DOMAIN}_version"


@callback
def async_setup_websocket(hass: HomeAssistant, version: str) -> None:
    hass.data[VERSION_KEY] = version
    websocket_api.async_register_command(hass, ws_entries)
    websocket_api.async_register_command(hass, ws_subscribe)


@callback
def _loaded(hass: HomeAssistant) -> list[NiakWeatherConfigEntry]:
    return sorted((e for e in hass.config_entries.async_entries(DOMAIN) if e.state is ConfigEntryState.LOADED), key=lambda e: e.title)


@websocket_api.websocket_command({vol.Required("type"): "niak_weather/entries"})
@callback
def ws_entries(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """The places configured, for the card's editor."""
    connection.send_result(msg["id"], [{"entry_id": e.entry_id, "title": e.title} for e in _loaded(hass)])


@websocket_api.websocket_command({vol.Required("type"): "niak_weather/subscribe", vol.Optional("entry_id"): str})
@callback
def ws_subscribe(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """The view of one place, now and after every change. Without `entry_id`, the only configured place."""
    entries = _loaded(hass)
    wanted = msg.get("entry_id")
    entry = next((e for e in entries if e.entry_id == wanted), None) if wanted else entries[0] if len(entries) == 1 else None
    if entry is None:
        code, message = (("not_found", "Lieu Niak Weather introuvable") if wanted else
                         ("choose_entry", "Plusieurs lieux Niak Weather : choisissez-en un") if entries else
                         ("not_configured", "L’intégration Niak Weather n’est pas configurée"))
        connection.send_error(msg["id"], code, message)
        return
    coordinator = entry.runtime_data
    sent: dict[str, Any] = {}

    @callback
    def send() -> None:
        snapshot = coordinator.data
        # The view only travels when it changed: a recomputation that changes nothing costs the card nothing.
        if snapshot is None or sent.get("view") is snapshot.view or sent.get("view") == snapshot.view:
            return
        sent["view"] = snapshot.view
        connection.send_message(websocket_api.event_message(msg["id"], {"version": VIEW_VERSION, "integration": hass.data.get(VERSION_KEY, ""),
                                                                        "entryId": entry.entry_id, "title": entry.title, "view": snapshot.view}))

    @callback
    def stopped() -> None:
        # The place restarts with new settings: the card subscribes again a moment later.
        connection.send_message(websocket_api.event_message(msg["id"], {"version": VIEW_VERSION, "reload": True}))

    remove_view, remove_stop = coordinator.async_add_listener(send), coordinator.async_add_stop_listener(stopped)

    @callback
    def unsubscribe() -> None:
        remove_view()
        remove_stop()

    connection.subscriptions[msg["id"]] = unsubscribe
    connection.send_result(msg["id"])
    send()
