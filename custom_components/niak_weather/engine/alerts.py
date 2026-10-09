"""Which points of the brief the bubbles show, and the alerts: the official vigilance and what the station measures, together."""
from __future__ import annotations

from dataclasses import dataclass

from .brief import Brief, Signal

DISPLAY_ORDER = ("official", "now", "future", "environment")


@dataclass(frozen=True)
class Point:
    """One point of the brief as a bubble shows it: a group label, an icon, one sentence and the colour of its theme."""

    group: str
    label: str
    icon: str
    text: str
    level: int
    theme: str | None = None
    entity: str | None = None


@dataclass(frozen=True)
class AlertPoint:
    level: int
    label: str | None
    text: str
    icon: str
    source: str
    """The full sentence it comes from, to avoid repeating it in the scrolling bubble."""
    official: bool
    entity: str | None = None


def label(s: Signal) -> str:
    if s.group == "now":
        return "Maintenant"
    if s.group == "future":
        return "À venir"
    return "Pollens" if s.key.startswith("pollen") or s.key.startswith("legacy") else "Air"


def theme_of(s: Signal) -> str | None:
    """The meaning colour of a point: rain, wind, heat or cold, pressure, air."""
    if s.key.startswith("rain") or s.key == "wind-rain":
        return "rain"
    if s.key.startswith("wind"):
        return "wind"
    if s.key in ("pressure", "storm"):
        return "pressure"
    if s.key == "uv":
        return "level1"
    if s.key in ("freeze-future", "frost-night", "fog", "fog-later"):
        return "cold"
    if s.key in ("temperature", "comfort-gap", "temperature-future"):
        return "cold" if "low" in s.icon or "snow" in s.icon else "heat"
    return "calm" if s.group == "environment" else None


@dataclass(frozen=True)
class Presentation:
    selected: tuple[Signal, ...]
    headline: str | None
    context: Signal | None
    outlook: Signal | None


def present(brief: Brief) -> Presentation:
    """The most important point first, then one per group; without any point needing attention, a useful context or outlook."""
    significant = sorted((s for s in brief.signals if s.severity > 0), key=lambda s: -s.severity)
    selected: list[Signal] = significant[:1]
    for group in ("future", "now", "environment", "official"):
        signal = next((s for s in significant if s.group == group and s not in selected), None)
        if signal and len(selected) < 3:
            selected.append(signal)
    for s in significant:
        if s not in selected and len(selected) < 3:
            selected.append(s)
    priority = selected[0] if selected else None
    by_key = {s.key: s for s in brief.signals}
    context = None if priority else (by_key.get("rain-now") or by_key.get("comfort-gap") or by_key.get("pressure"))
    outlook = None if priority or context else (next((s for s in brief.signals if s.group == "future" and s.key != "temperature-future"), None)
                                                or by_key.get("temperature-future"))
    headline = (brief.title if priority and priority.group == "official" else priority.text if priority
                else context.text if context else outlook.text if outlook else None)
    return Presentation(tuple(selected), headline, context, outlook)


def secondary(brief: Brief, p: Presentation) -> list[Signal]:
    """Useful observations and outlooks, without repeating the headline."""
    signals = list(p.selected[1:])
    by_key = {s.key: s for s in brief.signals}
    future = next((s for s in brief.signals if s.group == "future" and s.key != "temperature-future"), None)
    for s in (by_key.get("comfort-gap"), by_key.get("pressure"), future):
        if (s and (not p.selected or s is not p.selected[0]) and s is not p.context and s is not p.outlook and s not in signals and len(signals) < 3):
            signals.append(s)
    # Chosen by importance, read like the details: official warning, then now, then what is coming.
    return sorted(signals, key=lambda s: DISPLAY_ORDER.index(s.group))


def ticker_points(brief: Brief | None) -> list[Point]:
    """The points the bubble scrolls through, most important first, without the official warning (it has its own bubble)."""
    if brief is None:
        return []
    p = present(brief)
    points: list[Point] = []
    seen: list[Signal] = []
    for s in (*p.selected, p.context, p.outlook, *secondary(brief, p)):
        if s is not None and s.group != "official" and s not in seen:
            seen.append(s)
            points.append(Point(s.group, label(s), s.icon, s.text, s.severity, theme_of(s), s.entity))
    return points[:4]


def vigilance_parts(text: str) -> tuple[str | None, str]:
    """« Vigilance jaune · vent violent » → level above (« Vigilance jaune »), phenomena below (« Vent violent »)."""
    level, _, detail = text.partition(" · ")
    if level in ("Vigilance jaune", "Vigilance orange", "Vigilance rouge") and detail:
        return level, detail[0].upper() + detail[1:]
    return None, text


def alert_points(brief: Brief | None) -> list[AlertPoint]:
    """The vigilance first, then the most important point needing attention at home: neither hides the other."""
    if brief is None:
        return []
    alerts: list[AlertPoint] = []
    official = next((s for s in brief.signals if s.key == "official" and s.severity > 0), None)
    if official:
        level, detail = vigilance_parts(official.text)
        alerts.append(AlertPoint(official.severity, level, detail, "mdi:alert-outline", official.text, True, official.entity))
    top = sorted((s for s in brief.signals if s.group != "official" and s.severity > 0), key=lambda s: -s.severity)
    if top:
        alerts.append(AlertPoint(top[0].severity, label(top[0]), top[0].text, top[0].icon, top[0].text, False, top[0].entity))
    return alerts
