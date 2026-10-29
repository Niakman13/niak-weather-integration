"""The last version under this technical name: a bridge to the Hestia name.

The next major version (Hestia Weather 3, Hestia Confort 2) is installed by HACS next to this one, in
custom_components/hestia_*. Home Assistant only starts an integration that has entries, and the home's entries still
have this name: nothing would start the new version. This bridge starts it, once Home Assistant has started; the new
version then carries the whole home over (entries, entities, history, learning, dashboards) and removes this folder.

HACS also remembers this folder's name and would look for it in the new version: the bridge asks it to read the
folder again, so that the update is offered and installed without an error. Both are guarded: if Home Assistant or
HACS changes, the bridge does nothing and the update is done by hand (« Add an integration »).
"""
from __future__ import annotations

from datetime import timedelta
import json
import logging
from pathlib import Path

from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.start import async_at_started
from homeassistant.setup import async_setup_component

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)
NEW = "hestia_" + DOMAIN.split("_", 1)[1]
REPOSITORY = {"niak_weather": "hestiaFB/hestia-weather-integration", "niak_comfort": "hestiaFB/hestia-comfort-integration"}[DOMAIN]
HACS_EVERY = timedelta(hours=6)


def _installed(path: str) -> bool:
    """The new version is installed next to this one: its manifest says so."""
    try:
        return json.loads(Path(path, "manifest.json").read_text(encoding="utf-8")).get("domain") == NEW
    except (OSError, ValueError):
        return False


async def async_start_new(hass: HomeAssistant) -> bool:
    """Starts the new version when it is installed and not started yet; True when it was started."""
    if NEW in hass.config.components:
        return False
    if not await hass.async_add_executor_job(_installed, hass.config.path("custom_components", NEW)):
        return False
    _LOGGER.info("%s is installed: starting it, it carries this home over to its Hestia name", NEW)
    return await async_setup_component(hass, NEW, {})


async def async_refresh_hacs(hass: HomeAssistant) -> bool:
    """HACS reads the repository's folder name again: when the new version is out, it finds custom_components/hestia_*."""
    try:
        hacs = hass.data.get("hacs")
        repository = hacs.repositories.get_by_full_name(REPOSITORY) if hacs is not None else None
        if repository is None or repository.content.path.remote != f"custom_components/{DOMAIN}":
            return False
        repository.content.path.remote = "custom_components"
        await repository.update_repository(ignore_issues=True, force=True)
        return True
    except Exception:  # noqa: BLE001 - HACS's insides may change: the update is then done after a restart
        _LOGGER.debug("HACS not asked to read the folder again", exc_info=True)
        return False


def async_setup_bridge(hass: HomeAssistant) -> None:
    async def started(_hass: HomeAssistant) -> None:
        try:
            await async_start_new(hass)
        except Exception:  # noqa: BLE001 - this version keeps working; « Add an integration » starts the new one
            _LOGGER.exception("%s could not be started", NEW)
        await async_refresh_hacs(hass)

    async def every(_now) -> None:
        await async_refresh_hacs(hass)

    async_at_started(hass, started)
    async_track_time_interval(hass, every, HACS_EVERY, cancel_on_shutdown=True)
