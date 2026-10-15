"""The technical state of a place, for the home page of the « Météo » tab: what works, what needs the user, what could be set better.

Orange (`bad`) is only for what stops something from working; a better setting is a tip, never orange. Grey (`none`) is what is
not used. Every text is French, short, and says what the user gains or loses.
"""
from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass, field
from .families import STATION_DEPENDENT

STALE_FORECAST = 90
"""Minutes after which a forecast that should come every 15 minutes is old."""
# Where an entity's missing source is set (an assistant step); the others are station sensors.
NEED_STAGE = {"vigilance": 0, "qualite_air": 2, "pollens": 3}
# What a station sensor brings, when the station has one that is not chosen.
GAINS = {
    "temperature_entity": "la température mesurée chez vous, au lieu de celle du service météo",
    "humidity_entity": "l’humidité mesurée chez vous, pour le ressenti, le brouillard et le séchage du linge",
    "rain_rate_entity": "la pluie qui tombe maintenant, pour l’alerte de pluie forte",
    "wind_gust_entity": "les rafales mesurées, pour l’alerte de vent fort",
    "wind_bearing_entity": "la direction du vent, pour les autres briques (ouvrir côté abrité)",
    "pressure_entity": "la tendance de la pression, signe d’une dégradation",
    "uv_index_entity": "l’indice UV, pour l’alerte UV forts",
    "solar_radiation_entity": "l’ensoleillement mesuré",
}


@dataclass(frozen=True)
class Sensor:
    label: str
    """What it measures (« Rafales »)."""
    name: str
    status: str
    """« ok », « silent » (unavailable or unknown) or « missing » (no longer in Home Assistant)."""
    age: float | None = None
    """Minutes since its last value (ok) or since it stopped answering (silent)."""


@dataclass(frozen=True)
class Facts:
    title: str
    failed: bool = False
    restarting: bool = False
    """Saved a moment ago: it computes again shortly, nothing is missing yet."""
    weather: str = ""
    weather_ok: bool = True
    forecast_age: float | None = None
    vigilance: str = ""
    vigilance_ok: bool = True
    vigilance_found: str = ""
    """A Météo-France vigilance sensor Home Assistant has, when none is chosen."""
    season: str = ""
    station: str = ""
    """The station's model (« GW2000A »), "" without a station."""
    sensors: Sequence[Sensor] = ()
    history: bool = True
    unused: Sequence[tuple[str, str, str]] = ()
    """Station sensors Home Assistant has but that are not chosen: (field, label, sensor name)."""
    air: str = ""
    air_ok: bool = True
    atmo_installed: bool = False
    pollen: str = ""
    pollen_ok: bool = True
    pollen_available: bool = False
    entities: Sequence[tuple[str, str, str, bool, bool]] = ()
    """(key, name, family, enabled, has a value)."""
    needs: dict[str, str] = field(default_factory=dict)
    """What an entity still misses, by key: « la vigilance officielle »."""
    ready_families: Sequence[str] = ()
    """Families switched off whose entities would all have their source."""
    integration: str = ""
    card_twice: bool = False
    """The card from HACS is still installed next to the one the integration serves."""
    links: Sequence[str] = ()


def ago(minutes: float | None) -> str:
    if minutes is None:
        return ""
    if minutes < 1.5:
        return "à l’instant"
    if minutes < 60:
        return f"il y a {round(minutes)} min"
    if minutes < 48 * 60:
        return f"il y a {round(minutes / 60)} h"
    return f"il y a {round(minutes / 1440)} j"


def _since(minutes: float | None) -> str:
    text = ago(minutes)
    return f" depuis {text.removeprefix('il y a ')}" if text.startswith("il y a") else ""


def _plural(n: int, word: str, plural: str | None = None) -> str:
    return f"{n} {word if n == 1 else plural or word + 's'}"


def _line(level: str, text: str, why: str = "", stage: int | None = None) -> dict:
    return {"level": level, "text": text, "why": why, "stage": stage}


def report(f: Facts) -> dict:
    todo: list[dict] = []
    tips: list[dict] = []
    enabled = {key for key, _, _, on, _ in f.entities if on}
    names = {key: name for key, name, _, _, _ in f.entities}

    # ---- What stops something from working ----
    if f.failed:
        todo.append(_line("bad", "Calcul arrêté", "Home Assistant n’a pas pu démarrer ce lieu : vérifiez ses réglages ou les journaux (cherchez « niak »).", 0))
    if not f.weather_ok:
        todo.append(_line("bad", "Le service météo ne répond pas", f"{f.weather or 'Aucun service choisi'} : pas de prévisions tant qu’il ne revient pas.", 0))
    elif not f.failed and not f.restarting and f.forecast_age is None:
        todo.append(_line("bad", "Prévisions pas encore reçues", "Le service météo n’a pas encore donné ses prévisions heure par heure.", 0))
    elif f.forecast_age is not None and f.forecast_age > STALE_FORECAST:
        todo.append(_line("bad", "Prévisions anciennes", f"Reçues {ago(f.forecast_age)} : le service météo ne les renouvelle plus.", 0))
    broken = [s for s in f.sensors if s.status != "ok"]
    oldest = max((s.age for s in broken if s.age is not None), default=None)
    if f.sensors and len(broken) == len(f.sensors):
        todo.append(_line("bad", "La station ne répond pas",
                          f"Aucun de ses {len(f.sensors)} capteurs ne donne de valeur{_since(oldest)} : Niak s’appuie sur le service météo.", 1))
    elif broken:
        verb = "ne répond pas" if len(broken) == 1 else "ne répondent pas"
        when = _since(oldest)
        todo.append(_line("bad", f"{_plural(len(broken), 'capteur')} de la station {verb}",
                          ", ".join(s.label for s in broken) + (f" ·{when}" if when else "") + ".", 1))
    for key, text in f.needs.items():
        if key in enabled:
            if key in STATION_DEPENDENT:
                if f.station:
                    tips.append(_line("tip", f"Compléter : {names.get(key, key)}", f"Facultatif : {text} permet cette fonction.", 1))
                continue
            todo.append(_line("bad", f"{names.get(key, key)} : active sans source", f"Il faut {text} : elle reste vide.", NEED_STAGE.get(key, 1)))
    if f.card_twice:
        todo.append(_line("bad", "Carte installée deux fois", "Retirez la carte Niak Weather de HACS : l’intégration la fournit maintenant.", None))

    # ---- What could be set better ----
    if not f.station:
        tips.append(_line("tip", "Ajouter une station météo",
                          "Sans station, la température, la pluie et le vent viennent du service météo, à quelques kilomètres. "
                          "Facultative, une station ajoute les mesures chez vous, les cumuls de pluie et les fonctions liées à ses capteurs.", 1))
    else:
        for key, label, name in f.unused:
            tips.append(_line("tip", f"Ajouter : {label[:1].lower()}{label[1:]}", f"Votre station en a un (« {name} ») : {GAINS.get(key, 'une mesure de plus')}.", 1))
        if not f.history:
            tips.append(_line("tip", "Calculer depuis l’historique",
                              "Cumuls de pluie, tendance de la température et rafale du jour, quand la station ne les donne pas.", 1))
    if not f.vigilance and "vigilance" not in enabled:
        tips.append(_line("tip", "Choisir la vigilance officielle",
                          f"Un capteur est disponible (« {f.vigilance_found} ») : les alertes officielles s’ajoutent à celles de Niak.", 0)
                    if f.vigilance_found else
                    _line("tip", "Ajouter la vigilance officielle",
                          "Installez Météo-France ou MeteoSwiss pour votre région : les alertes officielles s’ajoutent à celles de Niak.", 0))
    if not f.air:
        tips.append(_line("tip", "Choisir une zone Atmo France", "Atmo France est installée : l’indice de l’air du jour et ses polluants.", 2)
                    if f.atmo_installed else
                    _line("tip", "Ajouter la qualité de l’air", "Installez Atmo France : l’indice de l’air et les pollens du jour.", 2))
    if not f.pollen and f.pollen_available:
        tips.append(_line("tip", "Suivre les pollens", "Une source de pollens est installée : l’indice du jour, espèce par espèce.", 3))
    if f.ready_families:
        tips.append(_line("tip", "Entités Niak Weather à activer : " + ", ".join(f.ready_families),
                          "Niak Weather peut les créer pour vos automatisations : leurs sources sont en place. La carte n’en a pas besoin.", 4))

    # ---- Sources ----
    forecast_ok = f.weather_ok and f.forecast_age is not None and f.forecast_age <= STALE_FORECAST
    sources = [{"label": "Prévisions", "level": "ok" if forecast_ok else "bad",
                "text": f"{f.weather} · " + ("ne répond pas" if not f.weather_ok else "pas encore reçues" if f.forecast_age is None
                                             else f"reçues {ago(f.forecast_age)}")}]
    if f.vigilance:
        sources.append({"label": "Vigilance", "level": "ok" if f.vigilance_ok else "bad",
                        "text": f.vigilance + ("" if f.vigilance_ok else " · ne répond pas")})
    else:
        sources.append({"label": "Vigilance", "level": "bad" if "vigilance" in enabled else "none", "text": "aucun capteur choisi"})
    if f.station:
        ok = len(f.sensors) - len(broken)
        sources.append({"label": "Station", "level": "bad" if broken else "ok",
                        "text": f"{f.station} · " + (f"{_plural(len(f.sensors), 'capteur')}, tous répondent" if not broken
                                                    else f"{ok} capteur{'s' if ok > 1 else ''} sur {len(f.sensors)} répond{'ent' if ok > 1 else ''}")})
    else:
        sources.append({"label": "Station", "level": "none", "text": "pas de station"})
    for label, value, good in (("Qualité de l’air", f.air, f.air_ok), ("Pollens", f.pollen, f.pollen_ok)):
        sources.append({"label": label, "level": "none" if not value else "ok" if good else "bad",
                        "text": "aucune source" if not value else value + ("" if good else " · ne répond pas")})
    sources.append({"label": "Saison", "level": "ok" if f.season else "none", "text": f.season or "pas de capteur : suit la date"})

    # ---- The station's sensors, those that do not answer first ----
    sensors = []
    for s in sorted(f.sensors, key=lambda s: s.status == "ok"):
        if s.status == "ok":
            text = ago(s.age)
        elif s.status == "missing":
            text = "n’existe plus"
        else:
            text = "ne répond pas" + (f" · {ago(s.age).removeprefix('il y a ')}" if s.age is not None and s.age >= 1.5 else "")
        sensors.append({"label": s.label, "name": s.name, "level": "ok" if s.status == "ok" else "bad", "text": text})

    # ---- Entities ----
    active = [e for e in f.entities if e[3]]
    empty = [e[1] for e in active if not e[4]]
    families_on = list(dict.fromkeys(e[2] for e in active))
    off_families = [fam for fam in dict.fromkeys(e[2] for e in f.entities) if fam not in families_on]
    off = len(f.entities) - len(active)
    entities = [{"level": "ok", "text": f"{len(active)} actives sur {len(f.entities)}", "why": ", ".join(families_on)}]
    if empty:
        entities.append({"level": "none", "text": _plural(len(empty), "active sans valeur", "actives sans valeur"),
                         "why": ", ".join(empty) + " · rien à afficher pour l’instant, ou source manquante"})
    if off:
        entities.append({"level": "none", "text": _plural(off, "désactivée", "désactivées"),
                         "why": ", ".join(off_families) if off_families else "dans les familles actives"})

    # ---- Versions and links ----
    versions = [{"level": "ok", "text": f"Intégration {f.integration}", "why": "préversion" if "b" in f.integration else ""}]
    versions.append({"level": "bad" if f.card_twice else "ok", "text": f"Carte {f.integration}",
                     "why": "installée deux fois : retirez celle de HACS" if f.card_twice else "fournie par l’intégration"})
    versions += [{"level": "ok", "text": f"Relié à {name}", "why": ""} for name in f.links] or [
        {"level": "none", "text": "Aucune brique Niak reliée", "why": "Niak Confort peut reprendre la station, les alertes et les prévisions de ce lieu"}]

    return {"title": f.title, "level": "action" if todo else "ok",
            "summary": _plural(len(todo), "point") + " à régler" if todo else "Tout est suivi",
            "tips_summary": _plural(len(tips), "réglage") + " à améliorer" if tips else "",
            "todo": todo, "tips": tips, "sources": sources, "sensors": sensors, "entities": entities, "versions": versions}
