"""A written forecast for the next four parts of the day, from the provider's hourly forecast."""
from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Sequence
from zoneinfo import ZoneInfo

from .brief import number
from .conditions import condition_icon
from .forecast import Hour, day_offset


@dataclass(frozen=True)
class _Slot:
    slot: int
    names: tuple[str, str, str]
    short: tuple[str, str, str]
    start: str
    during: str


SLOTS = (
    _Slot(0, ("cette nuit", "cette nuit", "la nuit suivante"), ("Nuit", "Nuit", "Nuit sv."), "en début de nuit", "en fin de nuit"),
    _Slot(1, ("ce matin", "demain matin", "après-demain matin"), ("Matin", "Dem. matin", "Matin"), "en début de matinée", "en fin de matinée"),
    _Slot(2, ("cet après-midi", "demain après-midi", "après-demain après-midi"), ("Après-midi", "Dem. après-midi", "Après-midi"),
          "en début d’après-midi", "en fin d’après-midi"),
    _Slot(3, ("ce soir", "demain soir", "après-demain soir"), ("Soirée", "Dem. soir", "Soirée"), "en début de soirée", "en fin de soirée"),
)
# Most severe first: a storm or rain in a period outweighs the hours around it.
SEVERITY = ("lightning-rainy", "lightning", "hail", "snowy", "snowy-rainy", "pouring", "rainy", "fog", "windy", "windy-variant",
            "cloudy", "partlycloudy", "sunny", "clear-night")
DAY = {"sunny": "ensoleillé", "clear-night": "ciel dégagé", "partlycloudy": "éclaircies", "cloudy": "ciel couvert", "fog": "brouillard",
       "rainy": "pluie", "pouring": "fortes pluies", "lightning": "orages", "lightning-rainy": "orages et pluie", "hail": "grêle", "snowy": "neige",
       "snowy-rainy": "pluie et neige", "windy": "venteux", "windy-variant": "venteux et nuageux", "exceptional": "conditions exceptionnelles"}
NIGHT = {"sunny": "ciel dégagé", "clear-night": "ciel dégagé", "partlycloudy": "quelques nuages"}
FROM = ("du nord", "du nord-est", "d’est", "du sud-est", "du sud", "du sud-ouest", "d’ouest", "du nord-ouest")


@dataclass(frozen=True)
class Period:
    key: str
    label: str
    """« Cet après-midi », « Demain matin »…"""
    short: str
    condition: str
    icon: str
    text: str
    """A full sentence for this period: sky, temperatures, wind."""
    phrase: str
    """The sky in a few words, « éclaircies, puis pluie »."""
    early: str
    late: str
    night: bool
    during: str
    start: str
    tmin: int | None
    tmax: int | None
    rain: float
    wind: int | None
    gust: int | None
    bearing: float | None


@dataclass(frozen=True)
class Bulletin:
    summary: str
    periods: tuple[Period, ...]


def _round(value: float) -> int:
    return int(math.floor(value + 0.5))


def _cap(text: str) -> str:
    return text[:1].upper() + text[1:]


def _rainy(condition: str) -> bool:
    return condition in ("rainy", "pouring", "lightning-rainy", "snowy-rainy", "hail")


def _severity(condition: str) -> int:
    return SEVERITY.index(condition) if condition in SEVERITY else -1


def dominant(conditions: Sequence[str], rain: float) -> str:
    severe = next((c for c in SEVERITY[:5] if c in conditions), None)
    if severe:
        return severe
    # Over several hours, less than 1 mm is a few drops: a rainy pictogram without it is not called rain.
    if rain >= 1:
        return "pouring" if "pouring" in conditions or rain >= 8 else "rainy"
    counts: dict[str, int] = {}
    for c in conditions:
        if not _rainy(c):
            counts[c] = counts.get(c, 0) + 1
    ranked = sorted(counts.items(), key=lambda x: (-x[1], _severity(x[0])))
    return ranked[0][0] if ranked else conditions[0] if conditions else "cloudy"


def phrase(condition: str, night: bool) -> str:
    return (NIGHT.get(condition) if night else None) or DAY.get(condition) or "temps variable"


def wind_text(speed: float, gust: float | None = None, bearing: float | None = None) -> str:
    strength = "faible" if speed < 10 else "modéré" if speed < 20 else "assez fort" if speed < 40 else "fort" if speed < 60 else "très fort"
    side = "" if bearing is None else " " + FROM[_round(bearing / 45) % 8]
    gusts = f", rafales à {number(gust, 0)} km/h" if gust is not None and gust >= 40 and gust >= speed + 10 else ""
    return "vent faible" if speed < 10 else f"vent{side} {strength} ({number(speed, 0)} km/h){gusts}"


def build_bulletin(hours: Sequence[Hour], now: datetime, zone: ZoneInfo) -> Bulletin | None:
    groups: dict[str, dict] = {}
    for h in hours:
        if h.time is None or h.time < now - timedelta(hours=1):
            continue
        day, slot = day_offset(h.time, now, zone), SLOTS[h.time.astimezone(zone).hour // 6]
        g = groups.setdefault(f"{day}-{slot.slot}", {"day": day, "slot": slot, "points": [], "first": h.time})
        g["points"].append(h)
    # The current part of the day needs two hours left to be worth a line; later ones need three forecast hours.
    ordered = sorted(groups.values(), key=lambda g: g["first"])
    usable = [g for i, g in enumerate(ordered) if len(g["points"]) >= (2 if i == 0 else 3)][:4]
    if len(usable) < 2:
        return None
    periods = []
    for g in usable:
        points: list[Hour] = g["points"]
        slot: _Slot = g["slot"]
        night = slot.slot == 0 or (slot.slot == 3 and any(p.condition == "clear-night" for p in points))
        conditions = [c.replace("clear-night", "sunny", 1) for c in (p.condition.replace("_", "-") for p in points) if c]
        rain = sum(max(0, p.precipitation or 0) for p in points)
        temps = [p.temperature for p in points if p.temperature is not None]
        winds = [p.wind_speed for p in points if p.wind_speed is not None]
        gusts = [p.wind_gust for p in points if p.wind_gust is not None and p.wind_gust > 0]
        x = y = 0.0
        for p in points:
            if p.wind_bearing is not None:
                weight = max(p.wind_speed or 0, 0.1)
                x += math.sin(math.radians(p.wind_bearing)) * weight
                y += math.cos(math.radians(p.wind_bearing)) * weight
        condition = dominant(conditions, rain)
        # Evolution inside the period: a clear change between its first and second half.
        half = math.ceil(len(conditions) / 2)
        early, late = dominant(conditions[:half], 0), dominant(conditions[half:], 0)
        evolves = not _rainy(condition) and condition not in ("lightning", "lightning-rainy") and phrase(early, night) != phrase(late, night)
        main = f"{phrase(early, night)}, puis {phrase(late, night)}" if evolves else phrase(condition, night)
        wind = _round(max(winds)) if winds else None
        gust = _round(max(gusts)) if gusts else None
        bearing = (math.degrees(math.atan2(x, y)) + 360) % 360 if x or y else None
        tmin = _round(min(temps)) if temps else None
        tmax = _round(max(temps)) if temps else None
        bits = [_cap(main) + (f" ({number(rain, 1)} mm)" if rain >= 1 else "")]
        if tmin is not None:
            bits.append(f"{number(tmin)} °C" if tmin == tmax else f"{number(tmin)} à {number(tmax or 0)} °C")
        if wind is not None:
            bits.append(_cap(wind_text(wind, gust, bearing)))
        d = min(g["day"], 2)
        prefix = "demain " if g["day"] >= 1 else ""
        periods.append(Period(key=f"{g['day']}-{slot.slot}", label=_cap(slot.names[d]), short=slot.short[d], condition=condition,
                              icon=condition_icon(condition, night), text=". ".join(bits) + ".", phrase=main,
                              early=early if evolves else condition, late=late if evolves else condition, night=night,
                              during=prefix + slot.during, start=prefix + slot.start, tmin=tmin, tmax=tmax, rain=rain, wind=wind, gust=gust, bearing=bearing))
    return Bulletin(summary=summarise(periods), periods=tuple(periods))


def summarise(periods: Sequence[Period]) -> str:
    """One readable paragraph: the sky as a sequence of states over time, then temperatures, rain and notable wind."""
    runs: list[dict] = []

    def push(condition: str, when: str, night: bool) -> None:
        if runs and runs[-1]["condition"] == condition:
            runs[-1]["when"].append(when)
            runs[-1]["night"] = runs[-1]["night"] or night
            runs[-1]["day"] = runs[-1]["day"] or not night
        else:
            runs.append({"condition": condition, "when": [when], "day": not night, "night": night})

    for p in periods:
        # A period whose sky changes reads « en début d’après-midi … en fin d’après-midi ».
        push(p.early, p.start if p.late != p.early else p.label.lower(), p.night)
        if p.late != p.early:
            push(p.late, p.during, p.night)

    def join(xs: Sequence[str]) -> str:
        return xs[0] if len(xs) < 2 else f"{', '.join(xs[:-1])} et {xs[-1]}"

    def span(xs: Sequence[str]) -> str:
        # Three parts of the day or more under the same sky: « ce soir et jusqu’à demain matin ».
        return f"{xs[0]} et jusqu’à {xs[-1]}" if len(xs) >= 3 else join(xs)

    def words(r: dict) -> str:
        return "beau temps" if r["condition"] == "sunny" and r["day"] and r["night"] else phrase(r["condition"], r["night"] and not r["day"])

    parts = [f"{words(r)} {span(r['when'])}" for r in runs]
    sky = _cap(parts[0] if len(parts) < 2 else f"{', '.join(parts[:-1])}, puis {parts[-1]}") + "."
    out = [sky]
    temps = [t for p in periods for t in (p.tmin, p.tmax) if t is not None]
    if temps:
        lo, hi = min(temps), max(temps)
        warm = next(p for p in periods if p.tmax == hi)
        cold = next(p for p in periods if p.tmin == lo)
        out.append(f"Autour de {number(lo)} °C." if lo == hi else f"De {number(lo)} °C {cold.label.lower()} à {number(hi)} °C {warm.label.lower()}.")
    wet = [p for p in periods if p.rain >= 1]
    out.append(f"Pluie {join([p.label.lower() for p in wet])} : {number(sum(p.rain for p in wet), 1)} mm au total." if wet else "Pas de pluie attendue.")
    windy = sorted((p for p in periods if (p.wind or 0) >= 30 or (p.gust or 0) >= 50),
                   key=lambda p: -(p.gust if p.gust is not None else p.wind if p.wind is not None else 0))
    if windy:
        w = windy[0]
        out.append(_cap(f"{wind_text(w.wind or 0, w.gust, w.bearing)} {w.label.lower()}."))
    return " ".join(out)
