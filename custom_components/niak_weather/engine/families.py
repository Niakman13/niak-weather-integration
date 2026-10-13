"""The entities by family, as the documentation and the settings show them, and what each one needs to give a value."""
from __future__ import annotations

from .settings import Settings

# Each family, then the keys of its entities (the end of their unique id: <entry_id>_<key>).
FAMILIES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("maintenant", ("feels_like", "temps_observe", "pluie_en_cours", "brouillard", "dew_point", "frost_point", "humidex", "pressure_trend",
                    "temperature_trend", "rain_24h", "max_gust_today")),
    ("alertes", ("vigilance", "alert", "brief", "orage", "vent_fort", "pluie_forte", "gel", "canicule", "uv_fort")),
    ("prochaines_heures", ("next_rain", "pluie_heure", "pluie_6h", "pluie_24h_prevue", "minimale_nuit", "maximale_demain", "rafales_6h")),
    ("jardin", ("pluie_7j",)),
    ("batiment", ("degres_jours_chauffe", "degres_jours_clim")),
    ("energie", ("ensoleillement_demain",)),
    ("vie_pratique", ("sechage_linge", "givre_pare_brise", "qualite_air", "pollens")),
    ("meteo", ("weather",)),
)
DEFAULT_FAMILIES = ("maintenant", "alertes", "prochaines_heures")
_FAMILY = {key: family for family, keys in FAMILIES for key in keys}


def family_of(key: str) -> str | None:
    return _FAMILY.get(key)


def needs(settings: Settings) -> dict[str, str]:
    """What is missing for an entity to give a value, in a few words; absent when nothing is."""
    rain_gauge = bool(settings.rain_total_entity or settings.daily_rain_entity or settings.rain_24h_entity)
    legacy = settings.pollen_source == "legacy" and bool(settings.pollens or settings.pollen_risk_entity)
    atmo_pollen = settings.pollen_source != "none" and bool(settings.atmo.get("atmo_pollen_entity"))
    missing = {
        "vigilance": not settings.vigilance_entity and "la vigilance Météo-France",
        "uv_fort": not settings.uv_index_entity and "un capteur UV",
        "pluie_7j": not (rain_gauge and settings.station_history) and "un pluviomètre et l’historique de la station",
        "rain_24h": not rain_gauge and "un pluviomètre",
        "pressure_trend": not settings.pressure_entity and "un capteur de pression",
        "max_gust_today": not (settings.max_daily_gust_entity or settings.wind_gust_entity) and "un capteur de rafales",
        "temperature_trend": not (settings.temperature_trend_entity or settings.temperature_entity) and "un thermomètre extérieur",
        "qualite_air": not settings.atmo.get("atmo_air_entity") and "Atmo France",
        "pollens": not (legacy or atmo_pollen) and "Atmo France, Polleninformation ou IRM KMI",
    }
    return {key: text for key, text in missing.items() if text}


def enabled_at_first(key: str, chosen: list[str] | None, default: bool, settings: Settings) -> bool:
    """Whether an entity starts enabled: the families chosen at setup when there are some (and what it needs is there), else its own default."""
    family = family_of(key)
    if chosen is None or family is None:
        return default
    return family in chosen and key not in needs(settings)
