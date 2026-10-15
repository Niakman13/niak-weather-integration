"""Niak shared panel (socle v1): one sidebar entry « Niak » for every installed Niak brick.

Copied unchanged into each brick from niak-ecosysteme/socle/ (see ECOSYSTEME.md § 8).
Several copies may run side by side: the newest one shows the panel and every brick
registers with it. Registrations are plain dicts, so copies of different versions
understand each other; no brick ever reads another brick's settings.
"""
from __future__ import annotations

import asyncio
import logging
from urllib.parse import unquote, urlsplit

import voluptuous as vol
from homeassistant.components import frontend, websocket_api
from homeassistant.components.panel_custom import async_register_panel
from homeassistant.helpers.start import async_at_started

SOCLE_VERSION = (1, 4)
# 1.1: an optional `tab`, the tab's own name when it is not the brick's (« Météo » for Niak Weather).
# 1.2: async_register_card, the brick's card on every dashboard, also as a dashboard resource.
# 1.3: the home page says « À découvrir » and « Voir » for the bricks not installed (same contract as 1.2).
# 1.4: guarded card bundles, extra module only as fallback, encoded resource migration.
# The shell's custom element carries its version: two copies never fight over one name.
ELEMENT = "niak-socle-1-4"
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


async def async_register_card(hass, url, version):
    """The brick's card on every dashboard, at the brick's version (`url` without query: /niak_x-assets/niak-x-card.js).

    Prefer the dashboard resource collection. YAML collections cannot be edited:
    only there (or on registration failure) use an extra module. Every card bundle
    must wait for home-assistant before executing, including Lit and decorators
    (card-build.mjs), so this fallback and cached older index pages are safe too.
    """
    async def resource(_hass):
        try:
            if await _card_resource(hass, url, f"{url}?v={version}"):
                return
        except Exception:  # noqa: BLE001 - fall back to the guarded card bundle
            _LOGGER.warning("Ressource de tableau de bord %s non enregistrée", url, exc_info=True)
        frontend.add_extra_js_url(hass, f"{url}?v={version}")

    async_at_started(hass, resource)


def _resources(hass):
    """The dashboard resources kept by the user interface; None when they are written in YAML."""
    lovelace = hass.data.get("lovelace")
    resources = lovelace.get("resources") if isinstance(lovelace, dict) else getattr(lovelace, "resources", None)
    return resources if hasattr(resources, "async_create_item") else None


def is_card_resource(candidate, url):
    """Recognize only this local asset, including percent-encoded workarounds."""
    try:
        parsed = urlsplit(str(candidate))
        return not parsed.scheme and not parsed.netloc and unquote(parsed.path) == url
    except ValueError:
        return False


async def _card_resource(hass, url, wanted):
    """One resource for the card, at its current address: created, updated after a new version, duplicates removed."""
    resources = _resources(hass)
    if resources is None:
        return False
    if not getattr(resources, "loaded", True):
        await resources.async_load()
        resources.loaded = True
    mine = [item for item in resources.async_items() if is_card_resource(item.get("url", ""), url)]
    for extra in mine[1:]:
        await resources.async_delete_item(extra["id"])
    if not mine:
        await resources.async_create_item({"res_type": "module", "url": wanted})
    elif mine[0].get("url") != wanted or mine[0].get("type") != "module":
        await resources.async_update_item(mine[0]["id"], {"res_type": "module", "url": wanted})
    return True


async def async_remove_card(hass, url):
    """The card's dashboard resource goes when the brick's last place or room does: nothing left points to it."""
    resources = _resources(hass)
    if resources is None:
        return
    if not getattr(resources, "loaded", True):
        await resources.async_load()
        resources.loaded = True
    for item in [i for i in resources.async_items() if is_card_resource(i.get("url", ""), url)]:
        await resources.async_delete_item(item["id"])


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
