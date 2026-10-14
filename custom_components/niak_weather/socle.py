"""Niak shared panel (socle v1): one sidebar entry « Niak » for every installed Niak brick.

Copied unchanged into each brick from niak-ecosysteme/socle/ (see ECOSYSTEME.md § 8).
Several copies may run side by side: the newest one shows the panel and every brick
registers with it. Registrations are plain dicts, so copies of different versions
understand each other; no brick ever reads another brick's settings.
"""
from __future__ import annotations

import asyncio
import logging

import voluptuous as vol
from homeassistant.components import frontend, websocket_api
from homeassistant.components.panel_custom import async_register_panel

SOCLE_VERSION = (1, 1)
# 1.1: an optional `tab`, the tab's own name when it is not the brick's (« Météo » for Niak Weather).
# The shell's custom element carries its version: two copies never fight over one name.
ELEMENT = "niak-socle-1-1"
KEY = "niak_socle"
PANEL = "niak"
TITLE = "Niak"
ICON = "mdi:home-heart"
LEVELS = ("ok", "action", "unknown")
# Published bricks only: the home page never proposes a brick that does not exist yet.
CATALOGUE = (
    {"domain": "niak_weather", "name": "Niak Weather",
     "pitch": "La météo de votre station : prévisions, alertes, qualité de l’air et pollens.",
     "url": "https://github.com/Niakman13/niak-weather-integration"},
    {"domain": "niak_comfort", "name": "Niak Confort",
     "pitch": "Le confort de chaque pièce et le bon moment pour ouvrir, fermer ou aérer.",
     "url": "https://github.com/Niakman13/niak-comfort-integration"},
)
_LOGGER = logging.getLogger(__name__)


async def async_register_brick(hass, brick, shell_url):
    """Register a brick: {domain, name, slug, version, icon, module_url, element, status, legacy_path} and, since 1.1, `tab`."""
    data = hass.data.setdefault(KEY, {"bricks": {}, "panel": None})
    data["bricks"][brick["domain"]] = {**brick, "socle": SOCLE_VERSION}
    if brick.get("legacy_path"):
        await _legacy_panel(hass, brick, shell_url)
    current = data.get("panel")
    if current is not None and tuple(current["socle"]) >= SOCLE_VERSION:
        return
    data["panel"] = {"socle": SOCLE_VERSION, "shell_url": shell_url, "domain": brick["domain"]}
    # Re-registering replaces an older copy's handler: the newest socle answers.
    websocket_api.async_register_command(hass, _ws_overview)
    if frontend.async_panel_exists(hass, PANEL):
        frontend.async_remove_panel(hass, PANEL, warn_if_unknown=False)
    await async_register_panel(hass, frontend_url_path=PANEL, webcomponent_name=ELEMENT,
                               sidebar_title=TITLE, sidebar_icon=ICON, module_url=shell_url,
                               require_admin=True)


async def _legacy_panel(hass, brick, shell_url):
    """The brick's former address stays valid, hidden from the sidebar, and leads to its tab.

    It also keeps the « Configurer » button of the integrations page working.
    """
    if frontend.async_panel_exists(hass, brick["legacy_path"]):
        return
    await async_register_panel(hass, frontend_url_path=brick["legacy_path"], webcomponent_name=ELEMENT,
                               module_url=shell_url, require_admin=True,
                               config={"redirect": f"/{PANEL}/{brick['slug']}"},
                               config_panel_domain=brick["domain"])


async def _status(hass, brick):
    try:
        async with asyncio.timeout(5):
            status = await brick["status"](hass)
        level = status.get("level")
        return {"level": level if level in LEVELS else "unknown",
                "summary": str(status.get("summary") or ""),
                "details": [str(d) for d in status.get("details", [])][:6],
                "links": [str(link) for link in status.get("links", [])][:6]}
    except Exception:  # noqa: BLE001 - one brick's failure never hides the others
        _LOGGER.exception("État de %s indisponible", brick.get("domain"))
        return {"level": "unknown", "summary": "État indisponible pour le moment.", "details": [], "links": []}


async def async_overview(hass):
    bricks = hass.data.get(KEY, {}).get("bricks", {})
    order = [c["domain"] for c in CATALOGUE]
    listed = sorted(bricks.values(), key=lambda b: (order.index(b["domain"]) if b["domain"] in order else len(order), b["name"]))
    result = []
    for brick in listed:
        result.append({**{k: brick.get(k) for k in ("domain", "name", "slug", "version", "icon", "module_url", "element", "tab")},
                       "status": await _status(hass, brick)})
    others = [{**c, "installed": c["domain"] in hass.config.components,
               "settings_path": f"/config/integrations/integration/{c['domain']}"}
              for c in CATALOGUE if c["domain"] not in bricks]
    return {"version": 1, "socle": list(SOCLE_VERSION), "bricks": result, "others": others}


@websocket_api.websocket_command({vol.Required("type"): "niak/overview"})
@websocket_api.require_admin
@websocket_api.async_response
async def _ws_overview(hass, connection, msg):
    connection.send_result(msg["id"], await async_overview(hass))
