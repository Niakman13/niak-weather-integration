"""What the « Niak » home page says about Niak Weather (socle v1, ECOSYSTEME.md § 8): one level, one sentence, a few details.

Blue (`ok`) when every place is computed with its station answering; orange (`action`) as soon as something needs the user.
Grey (`unknown`) is left to the socle, for when this status cannot be computed at all.
"""
from __future__ import annotations

import re
from collections.abc import Sequence
from dataclasses import dataclass

MIN_CARD = "2.0.8"
"""The oldest Niak Weather card that shows everything this integration sends."""


@dataclass(frozen=True)
class Place:
    title: str
    loaded: bool = True
    station: int = 0
    """How many station sensors are chosen."""
    silent: Sequence[str] = ()
    """The chosen station sensors that do not answer (unavailable, unknown or gone), by name."""
    forecast: bool = True
    """Whether the weather service gave its forecast."""
    needs: Sequence[str] = ()
    """Enabled entities still missing their source, as « Vigilance : il faut la vigilance Météo-France »."""
    links: Sequence[str] = ()
    """The Niak bricks listening to this place, by name."""


def _plural(n: int, word: str) -> str:
    return f"{n} {word}{'s' if n > 1 else ''}"


def _version(text: str) -> tuple[int, ...]:
    # A beta counts as its release (2.0.9-beta.1 ≥ 2.0.9), as the card does for the integration.
    found = re.match(r"\d+(?:\.\d+)*", text or "")
    return tuple(int(p) for p in found.group(0).split(".")) if found else ()


def card_outdated(version: str, minimum: str = MIN_CARD) -> bool:
    return _version(version) < _version(minimum)


def status(places: Sequence[Place], card: str | None) -> dict:
    """`card`: the installed card's version, "" when it is not installed, None when Niak Weather cannot tell."""
    if not places:
        return {"level": "action", "summary": "Aucun lieu suivi pour l’instant.",
                "details": ["Ajoutez votre lieu dans l’onglet Météo."], "links": []}
    todo: list[str] = []
    details: list[str] = []
    several = len(places) > 1
    for place in places:
        where = f" ({place.title})" if several else ""
        if not place.loaded:
            todo.append(f"Calcul arrêté : {place.title}")
            continue
        if place.station and len(place.silent) >= place.station:
            todo.append(f"La station ne répond pas{where}")
        elif place.silent:
            todo.append(f"Ne répond pas{where} : " + ", ".join(place.silent))
        if not place.forecast:
            todo.append(f"Prévisions pas encore reçues du service météo{where}")
        todo.extend(f"{need}{where}" for need in place.needs)
    if card and card_outdated(card):
        todo.append(f"Carte Niak Weather {card} à mettre à jour dans HACS")
    elif card:
        details.append(f"Carte Niak Weather {card}, en accord avec l’intégration.")
    elif card == "":
        details.append("Carte Niak Weather non installée : c’est elle qui affiche la météo sur vos tableaux de bord.")
    links = [f"Relié à {name} · {place.title}" for place in places for name in place.links]
    followed = f"{len(places)} lieux suivis" if several else "1 lieu suivi"
    if all(p.loaded and p.station for p in places):
        followed += " avec " + ("leurs stations" if several else "sa station")
    if todo:
        return {"level": "action", "summary": f"{followed}, " + _plural(len(todo), "point") + " à régler.",
                "details": todo + details, "links": links}
    return {"level": "ok", "summary": f"{followed}, rien à régler.", "details": details, "links": links}
