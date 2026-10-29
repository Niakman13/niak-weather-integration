"""What the « Hestia » home page says about Hestia Weather (socle v1, ECOSYSTEME.md § 8): one level, one sentence, a few details.

Blue (`ok`) when every place is computed with its station answering; orange (`action`) as soon as something needs the user.
Grey (`unknown`) is left to the socle, for when this status cannot be computed at all.
"""
from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass

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
    """Enabled entities still missing their source, as « Vigilance : il faut la vigilance officielle »."""
    down: Sequence[str] = ()
    """The chosen air and pollen sources that do not answer, as « Atmo France ne répond pas : pollens »."""
    links: Sequence[str] = ()
    """The Hestia bricks listening to this place, by name."""


def _plural(n: int, word: str) -> str:
    return f"{n} {word}{'s' if n > 1 else ''}"


def status(places: Sequence[Place], card_twice: bool = False) -> dict:
    """`card_twice`: the card from HACS is still installed next to the one the integration serves."""
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
        todo.extend(f"{source}{where}" for source in place.down)
    if card_twice:
        todo.append("Carte installée deux fois : retirez la carte Hestia Weather de HACS")
    links = [f"Relié à {name} · {place.title}" for place in places for name in place.links]
    followed = f"{len(places)} lieux suivis" if several else "1 lieu suivi"
    if all(p.loaded and p.station for p in places):
        followed += " avec " + ("leurs stations" if several else "sa station")
    if todo:
        return {"level": "action", "summary": f"{followed}, " + _plural(len(todo), "point") + " à régler.",
                "details": todo + details, "links": links}
    return {"level": "ok", "summary": f"{followed}, rien à régler.", "details": details, "links": links}
