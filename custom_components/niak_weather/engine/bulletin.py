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
    return Bulletin(summary=narrate(hours, now, zone), periods=tuple(periods))


# The summary reads like a forecaster's: the rest of the day in at most two parts (« ce soir et cette nuit », « demain »),
# each saying what matters first (rain and its hours, then how the sky changes, then the temperature worth knowing and a
# notable wind), the day named once.

# Sky families, from the clearest. Rain, storms and snow are told by their hours, not by the sky.
SKY = {"sunny": 0, "clear-night": 0, "windy": 0, "partlycloudy": 1, "cloudy": 2, "windy-variant": 2, "fog": 3}
STEADY_DAY = ("grand soleil", "soleil et nuages", "ciel couvert", "brouillard")
STEADY_NIGHT = ("ciel dégagé", "quelques nuages", "ciel couvert", "brouillard")
SHORT_DAY = ("soleil", "quelques nuages", "ciel gris", "brouillard")
WEEKDAYS = ("Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche")


@dataclass(frozen=True)
class _Moment:
    hour: int
    """Local hour."""
    sky: int | None
    wet: bool
    kind: str
    """« orages », « neige », « pluie » for a wet hour."""
    rain: float
    temperature: float | None
    wind: float | None
    gust: float | None
    bearing: float | None


def _moment(h: Hour, zone: ZoneInfo) -> _Moment:
    condition = h.condition.replace("_", "-")
    rain = max(0.0, h.precipitation or 0)
    kind = ("orages" if condition in ("lightning", "lightning-rainy", "hail") else "neige" if condition in ("snowy", "snowy-rainy")
            else "pluie")
    wet = rain >= 0.1 or _rainy(condition) or condition in ("lightning", "lightning-rainy", "snowy")
    return _Moment(hour=h.time.astimezone(zone).hour if h.time else 0, sky=SKY.get(condition), wet=wet, kind=kind, rain=rain,
                   temperature=h.temperature, wind=h.wind_speed, gust=h.wind_gust if h.wind_gust and h.wind_gust > 0 else None,
                   bearing=h.wind_bearing)


def _when(hour: int) -> str:
    return ("après minuit" if hour < 3 else "en fin de nuit" if hour < 6 else "au lever du jour" if hour < 8 else "en matinée" if hour < 11
            else "vers midi" if hour < 13 else "en début d’après-midi" if hour < 16 else "en fin d’après-midi" if hour < 18
            else "en début de soirée" if hour < 21 else "en fin de soirée")


def _clock(hour: int) -> str:
    hour %= 24
    return "minuit" if hour == 0 else "midi" if hour == 12 else f"{hour} h"


def _change(before: int, after: int, night: bool) -> str:
    if before == 3:
        return ("le ciel se dégage" if night else "grand soleil") if after == 0 else "éclaircies" if after == 1 else "ciel gris"
    if after == 0:
        return "le ciel se dégage" if night else "le soleil s’impose" if before == 1 else "le soleil revient"
    if after == 1:
        return "quelques nuages" if before == 0 else "éclaircies"
    return "le ciel se couvre" if after == 2 else "brouillard"


def _sky(moments: Sequence[_Moment], night: bool) -> str:
    """The sky over the dry hours: steady, or how it changes."""
    runs: list[list] = []
    for m in moments:
        if m.sky is None:
            continue
        if runs and runs[-1][0] == m.sky:
            runs[-1][2] += 1
        else:
            runs.append([m.sky, m.hour, 1])
    # One odd hour is the provider hesitating, not the sky changing.
    if sum(r[2] for r in runs) >= 4:
        runs = [r for r in runs if r[2] > 1] or runs
        merged: list[list] = []
        for r in runs:
            if merged and merged[-1][0] == r[0]:
                merged[-1][2] += r[2]
            else:
                merged.append(list(r))
        runs = merged
    if not runs:
        return ""
    first, last = runs[0], runs[-1]
    if first[0] == last[0]:
        return (STEADY_NIGHT if night else STEADY_DAY)[first[0]]
    start = (STEADY_NIGHT if night else SHORT_DAY)[first[0]]
    before, after = _when(first[1]), _when(last[1])
    # Both in the same part of the day: « quelques nuages, puis le ciel se dégage en début de soirée », the part said once.
    return f"{start}{'' if before == after else ' ' + before}, puis {_change(first[0], last[0], night)} {after}"


def _after_rain(moments: Sequence[_Moment], night: bool) -> str:
    """The sky once the rain has stopped, in a few words."""
    skies = [m.sky for m in moments if m.sky is not None]
    if len(skies) < 2:
        return ""
    sky = max(set(skies), key=lambda s: (skies.count(s), -s))
    return (("le ciel se dégage" if night else "le soleil revient"), "éclaircies", "ciel couvert", "brouillard")[sky]


def _episodes(moments: Sequence[_Moment]) -> list[list[_Moment]]:
    """Wet hours, a single dry hour between two showers counting as the same episode."""
    out: list[list[_Moment]] = []
    dry = 0
    for m in moments:
        if m.wet:
            if out and dry <= 1 and out[-1]:
                out[-1].append(m)
            else:
                out.append([m])
            dry = 0
        else:
            dry += 1
    return out


def _rain(episodes: Sequence[Sequence[_Moment]], first: int, last: int, night: bool, continues: bool = False) -> str:
    if not episodes:
        return ""
    total = sum(m.rain for e in episodes for m in e)
    kinds = [m.kind for e in episodes for m in e]
    kind = "orages" if "orages" in kinds else "neige" if "neige" in kinds else "pluie"
    # Snow is not told in millimetres of water, nor rain that is only ending.
    amount = f" ({number(total, 0 if total >= 10 else 1)} mm)" if total >= 1 and kind != "neige" and not (continues and len(episodes) == 1) else ""
    if len(episodes) > 2:
        return f"{'averses' if kind == 'pluie' else kind} par moments{amount}"
    parts: list[tuple[str, str]] = []
    for e in episodes:
        rain = sum(m.rain for m in e)
        word = kind if kind != "pluie" else ("fortes pluies" if rain / len(e) >= 4 else "averses" if len(e) <= 2 and rain < 2
                                             else "quelques gouttes" if rain < 0.3 else "pluie")
        start, end = e[0].hour, (e[-1].hour + 1) % 24
        if e[0].hour == first and e[-1].hour == last:
            parts.append((word, "toute la nuit" if night else "toute la journée"))
        elif e[0].hour == first and continues:
            # Rain carried over from the part before: it stops, it does not start again under another name.
            stops = {"orages": "les orages cessent", "neige": "la neige cesse"}.get(kind, "la pluie cesse")
            parts.append((stops, f"vers {_clock(end)}"))
        elif parts and parts[0][0].endswith(("cesse", "cessent")) and word == kind:
            # « Les orages cessent vers 9 h et reprennent à partir de midi », not « … et orages à partir de midi ».
            again = "reprennent" if kind == "orages" else "reprend"
            parts.append((again, f"à partir de {_clock(start)}" if e[-1].hour == last else f"vers {_clock(start)}" if len(e) <= 2
                          else f"de {_clock(start)} à {_clock(end)}"))
        elif e[0].hour == first:
            parts.append((word, f"jusqu’à {_clock(end)}"))
        elif e[-1].hour == last:
            parts.append((word, f"à partir de {_clock(start)}"))
        elif len(e) <= 2:
            parts.append((word, f"vers {_clock(start)}"))
        else:
            parts.append((word, f"de {_clock(start)} à {_clock(end)}"))
    if len({w for w, _ in parts}) == 1:
        return f"{parts[0][0]} {' et '.join(t for _, t in parts)}{amount}"
    return " et ".join(f"{w} {t}" for w, t in parts) + amount


def _temperature(moments: Sequence[_Moment], night: bool, said: str = "") -> str:
    """`said` is the rest of the sentence: a moment it already names is given by its hour instead (« frais vers 19 h »)."""
    temps = [(m.temperature, m.hour) for m in moments if m.temperature is not None]
    if not temps:
        return ""
    if night:
        # A night the forecast does not follow until the morning has no minimum worth giving.
        if not any(3 <= h < 8 for _, h in temps):
            return ""
        low = min(t for t, _ in temps)
        hour = [h for t, h in temps if t == low][-1]
        value, when = _degrees(low), "au petit matin" if 3 <= hour < 8 else _when(hour)
        if when in said:
            when = f"vers {_clock(hour)}"
        if low >= 20:
            return f"nuit chaude, pas moins de {value} °C"
        return (f"gel {when} ({value} °C)" if low <= 0 else f"froid {when} ({value} °C), gelée possible" if low <= 3
                else f"frais {when} ({value} °C)" if low < 10 else f"{value} °C {when}")
    high = max(t for t, _ in temps)
    value = _degrees(high)
    return (f"très chaud, jusqu’à {value} °C" if high >= 35 else f"chaud, jusqu’à {value} °C" if high >= 30
            else f"sans dégel, {value} °C au mieux" if high <= 0 else f"froid, pas plus de {value} °C" if high <= 5 else f"jusqu’à {value} °C")


def _degrees(value: float) -> str:
    return number(_round(value), 0).replace("-", "−")


def _wind(moments: Sequence[_Moment]) -> str:
    speed = max((m.wind for m in moments if m.wind is not None), default=0)
    gust = max((m.gust for m in moments if m.gust is not None), default=0)
    out = []
    if speed >= 30:
        windiest = max((m for m in moments if m.wind is not None), key=lambda m: m.wind or 0)
        side = "" if windiest.bearing is None else " " + FROM[_round(windiest.bearing / 45) % 8]
        out.append(f"vent {'fort' if speed >= 40 else 'assez fort'}{side}")
    if gust >= 50:
        out.append(f"rafales à {number(_round(gust), 0)} km/h")
    return " et ".join(out)


def _label(day: int, night: bool, moments: Sequence[_Moment], now: datetime, zone: ZoneInfo) -> str:
    if night:
        evening = any(m.hour >= 18 for m in moments)
        late = any(m.hour < 6 for m in moments)
        if day < 0 or not evening:
            return "Cette nuit" if day <= 0 else "La nuit suivante"
        if day == 0:
            return "Ce soir et cette nuit" if late else "Ce soir"
        return "Demain soir" if day == 1 else "Après-demain soir"
    morning, afternoon = any(m.hour < 12 for m in moments), any(m.hour >= 12 for m in moments)
    if day == 0:
        whole = WEEKDAYS[now.astimezone(zone).weekday()] if now.astimezone(zone).hour < 5 else "Aujourd’hui"
        return whole if morning and afternoon else "Ce matin" if morning else "Cet après-midi"
    if day == 1:
        return "Demain" if morning and afternoon else "Demain matin" if morning else "Demain après-midi"
    return "Après-demain"


def narrate(hours: Sequence[Hour], now: datetime, zone: ZoneInfo, parts: int = 2) -> str:
    """The rest of the day as a forecaster would say it, in at most `parts` sentences."""
    blocks: dict[tuple[int, bool], list[_Moment]] = {}
    for h in hours:
        if h.time is None or h.time < now - timedelta(minutes=30):
            continue
        local = h.time.astimezone(zone)
        night = not 6 <= local.hour < 18
        # The night belongs to the evening before it: « ce soir et cette nuit ».
        day = day_offset(h.time, now, zone) - (1 if local.hour < 6 else 0)
        blocks.setdefault((day, night), []).append(_moment(h, zone))
    usable = [(key, moments) for key, moments in blocks.items() if len(moments) >= 2][:parts]
    dry_everywhere = not any(m.wet for _, moments in usable for m in moments)
    sentences = []
    wet_before, windy_before = False, False
    for i, ((day, night), moments) in enumerate(usable):
        episodes = _episodes(moments)
        rain = _rain(episodes, moments[0].hour, moments[-1].hour, night, continues=wet_before)
        wet_before = moments[-1].wet
        if episodes and episodes[0][0] is moments[0]:
            sky = _after_rain([m for m in moments[moments.index(episodes[0][-1]) + 1:] if not m.wet], night)
            weather = rain + (f", puis {sky}" if sky else "")
        else:
            sky = _sky([m for m in moments if not m.wet], night)
            weather = ", ".join(x for x in (sky, rain) if x)
        wind = _wind(moments)
        # The same wind twice is said once: it keeps blowing, or it drops.
        told = "vent toujours fort" if wind and windy_before else "le vent faiblit" if windy_before else wind
        windy_before = bool(wind)
        facts = [x for x in (_temperature(moments, night, weather), told) if x]
        if dry_everywhere and i == len(usable) - 1:
            facts.append("sans pluie")
        text = " ; ".join(x for x in (weather, ", ".join(facts)) if x)
        if text:
            sentences.append(f"{_label(day, night, moments, now, zone)}, {text}.")
    return " ".join(sentences)
