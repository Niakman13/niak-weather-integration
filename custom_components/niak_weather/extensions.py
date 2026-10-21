"""Optional integrations: installation belongs to Home Assistant, selection to each Weather place.

Downloaded HACS repositories, config entries and entity platforms are separate evidence of installation.
A proposed sensor in a draft never counts as a saved configuration on the overview.
"""
from __future__ import annotations

from typing import Any, Mapping

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

# id, integration domain, name, benefit, repository, configuration stage, sensor setting
CATALOGUE = (
    ("atmo", "atmofrance", "Atmo France", "Qualité de l’air et pollens de votre commune.", "sebcaps/atmofrance", 2, ""),
    ("vigieau", "vigieau", "Vigieau", "Restrictions d’eau et usages concernés.", "kamaradclimber/vigieau", 6, "water_restriction_entity"),
    ("blitzortung", "blitzortung", "Blitzortung", "Éclairs à proximité, distance et direction de l’orage.", "mrk-its/homeassistant-blitzortung", 6, "lightning_entity"),
    ("waqi", "waqi", "WAQI", "Qualité de l’air mesurée par une station près de chez vous.", "", 2, ""),
    ("polleninformation", "polleninformation", "Polleninformation", "Pollens par espèce dans les pays couverts.", "krissen/polleninformation", 3, ""),
    ("irm_kmi", "irm_kmi", "IRM KMI", "Pollens en Belgique.", "jdejaegh/irm-kmi-ha", 3, ""),
    ("swiss_pollen", "swiss_pollen", "Swiss Pollen", "Mesures de pollens en Suisse.", "frimtec/hass-swiss-pollen", 3, ""),
    ("kleenex_pollenradar", "kleenex_pollenradar", "Kleenex / Scottex", "Pollens en France et dans les pays couverts.", "MarcoGos/kleenex_pollenradar", 3, ""),
)


def inventory(hass: HomeAssistant, options: Mapping[str, Any]) -> list[dict[str, Any]]:
    """Installation is global, configuration is read from this place's saved options only."""
    platforms = {e.platform for e in er.async_get(hass).entities.values()}
    installed = platforms | {e.domain for e in hass.config_entries.async_entries()}
    result = []
    for key, domain, name, benefit, repository, stage, field in CATALOGUE:
        if field:
            chosen = bool(options.get(field))
        elif key == "atmo":
            chosen = (options.get("air_source") not in ("none", "waqi") and bool(options.get("atmo_air_entity"))
                      or options.get("pollen_source") not in ("none", "legacy") and bool(options.get("atmo_pollen_entity")))
        elif key == "waqi":
            chosen = options.get("air_source") == "waqi" and bool(options.get("waqi_air_entity"))
        else:
            chosen = (options.get("pollen_source") == "legacy" and (options.get("pollen_provider") or "polleninformation") == key
                      and bool(options.get("pollens")))
        downloaded = False
        hacs = hass.data.get("hacs")
        if hacs is not None and repository:
            try:
                repo = hacs.repositories.get_by_full_name(repository)
                downloaded = bool(repo is not None and repo.data.installed)
            except (AttributeError, KeyError):
                pass  # HACS's internals are optional: config entries and registry still work.
        result.append({"id": key, "name": name, "description": benefit, "installed": domain in installed or downloaded,
                       "configured": chosen, "stage": stage, "field": field,
                       "url": f"https://github.com/{repository}" if repository else "https://www.home-assistant.io/integrations/waqi/" if key == "waqi" else "",
                       "integration": domain,
                       "install": ("Dans HACS, cherchez « Blitzortung.org Lightning Detector » et téléchargez-le. Redémarrez Home Assistant, "
                                   "puis ajoutez l’intégration « Blitzortung » dans Paramètres → Appareils et services. Choisissez votre maison."
                                   if key == "blitzortung" else f"Ajoutez l’intégration « {name} » dans Paramètres → Appareils et services. "
                                   + ("Si elle n’apparaît pas, téléchargez-la dans HACS, redémarrez Home Assistant, puis revenez l’ajouter." if repository else ""))})
    return result
