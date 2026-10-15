"""The brief: what deserves attention now, next, in the air, and the official vigilance.

An attention hierarchy, never a weather model of its own nor a health recommendation.
"""
from __future__ import annotations

import math
import re
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Callable, Mapping, Sequence
from zoneinfo import ZoneInfo

from . import atmo, polleninfo, swiss
from .forecast import Day, Hour
from .local import LocalWeather
from .settings import Settings
from .units import finite, french

GROUPS = ("official", "now", "future", "environment")
COLORS = ("61,155,233", "190,140,35", "230,125,45", "215,70,75")
COLOR_NAMES = ("verte", "jaune", "orange", "rouge")
LEVELS = ("Synthèse", "À surveiller", "Attention renforcée", "Vigilance rouge officielle")
_KNOWN_COLORS = {"vert": 0, "green": 0, "jaune": 1, "yellow": 1, "orange": 2, "rouge": 3, "red": 3}


@dataclass(frozen=True)
class Signal:
    key: str
    group: str
    """« official », « now », « future » or « environment »."""
    severity: int
    """0 information, 1 to watch, 2 serious, 3 official red."""
    text: str
    explanation: str
    icon: str
    entity: str | None = None
    at: float | None = None
    """When a forecast point happens, in seconds since 1970; absent for what is measured now."""
    clock: str | None = None
    """That time as the banner writes it: « 20 h », « midi », « minuit », « demain »."""
    short: str | None = None
    """The sentence on the banner's timeline, without the time its label already gives: « Fortes pluies : 12 mm prévus »."""
    index: float | None = None
    """Atmo index (1 to 6) of an air or pollen point."""


@dataclass(frozen=True)
class Brief:
    title: str
    label: str
    color: str
    icon: str
    summary: str
    signals: tuple[Signal, ...]
    caveats: tuple[str, ...]
    available: bool
    severity: int = 0


def number(value: float, digits: int = 1) -> str:
    """French number, at most `digits` decimals, as the browser writes it."""
    return french(value, digits)


def _round_half_up(value: float) -> int:
    return int(math.floor(value + 0.5))


def _timing(hours: float) -> str:
    return "dans l’heure" if hours < 1 else f"dans environ {_round_half_up(hours)} h"


def known_color(value: Any) -> int | None:
    return _KNOWN_COLORS.get(atmo.normal(value).strip())


def _lower_first(text: str) -> str:
    """« Graminées » → « graminées », but « PM2.5 » and « NO₂ » stay as they are."""
    return text[0].lower() + text[1:] if re.match(r"^[A-ZÀ-Ý][a-zà-ÿ]", text) else text


def clock(when: datetime, now: datetime, zone: ZoneInfo) -> str:
    """« 20 h », « midi », « minuit » within the next 24 hours; « demain » or the day's name beyond."""
    local = when.astimezone(zone)
    if when - now < timedelta(hours=24):
        return "minuit" if local.hour == 0 else "midi" if local.hour == 12 else f"{local.hour} h"
    days = (local.date() - now.astimezone(zone).date()).days
    return "demain" if days == 1 else ("lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche")[local.weekday()]


@dataclass(frozen=True)
class Vigilance:
    level: int
    """0 green to 3 red."""
    phenomena: tuple[tuple[str, int], ...]
    """Each phenomenon above green with its own level, the most serious first."""
    warnings: tuple[swiss.Warning, ...] = ()
    source: str = "Météo-France"

    @property
    def extra(self) -> dict[str, Any]:
        values: dict[str, Any] = {"phenomenes": {k: COLOR_NAMES[c] for k, c in self.phenomena}}
        if self.source == "MétéoSuisse":
            values.update(fournisseur=self.source, degre=max((w.degree for w in self.warnings), default=1), echelle=5,
                          degres_phenomenes={w.name: w.degree for w in reversed(self.warnings)},
                          alertes=[{"phenomene": w.name, "degre": w.degree, "debut": w.start, "fin": w.end, "texte": w.text}
                                   for w in self.warnings])
        return values

    @property
    def text(self) -> str:
        """One text for every format: « Vigilance jaune · vent violent »; a phenomenon below the overall level says its own colour."""
        if self.source == "MétéoSuisse":
            degree = max((w.degree for w in self.warnings), default=1)
            details = ", ".join(f"{w.name.lower()} ({w.degree}/5)" for w in self.warnings)
            return f"MétéoSuisse · {swiss.DEGREES[degree]} ({degree}/5)" + (f" · {details}" if details else "")
        names = [f"{k.lower()}{'' if c == self.level else f' ({COLOR_NAMES[c]})'}" for k, c in self.phenomena]
        return f"Vigilance {COLOR_NAMES[self.level]}{' · ' + ', '.join(names) if names else ''}"


def read_vigilance(settings: Settings, get: Callable[[str], Any], now: datetime, platforms: Mapping[str, str] | None = None) -> Vigilance | None:
    """The Météo-France vigilance, or None when it is not configured, not recognised or more than 48 hours old."""
    official = get(settings.vigilance_entity) if settings.vigilance_entity else None
    if official is not None and ((platforms or {}).get(settings.vigilance_entity or "") == "swissweather"
                                or "meteoswiss" in atmo.normal(official.attributes.get("attribution"))):
        updated = getattr(official, "last_updated", None)
        if isinstance(updated, datetime) and (updated.tzinfo is None or now - updated > timedelta(hours=48)):
            return None
        warnings = swiss.read(official, now)
        if warnings is None:
            return None
        return Vigilance(max((swiss.SEVERITIES[w.degree] for w in warnings), default=0),
                         tuple((w.name, swiss.SEVERITIES[w.degree]) for w in warnings), warnings, "MétéoSuisse")
    recognised = official is not None and (bool(re.search(r"meteo.?france", atmo.normal(official.attributes.get("attribution"))))
                                           or (platforms or {}).get(settings.vigilance_entity or "") == "meteo_france")
    level = known_color(official.state) if recognised else None
    updated = getattr(official, "last_updated", None)
    if level is None or (isinstance(updated, datetime) and now - updated > timedelta(hours=48)):
        return None
    phenomena = sorted(((k, known_color(v)) for k, v in official.attributes.items() if k not in ("attribution", "friendly_name", "icon")),
                       key=lambda x: -(x[1] or 0))
    return Vigilance(level, tuple((k, c) for k, c in phenomena if c))


@dataclass(frozen=True)
class _Point:
    hours: float
    hour: Hour


def build_brief(w: LocalWeather, settings: Settings, get: Callable[[str], Any], hours: Sequence[Hour], days: Sequence[Day],
                now: datetime, zone: ZoneInfo, platforms: Mapping[str, str] | None = None) -> Brief:
    signals: list[Signal] = []
    caveats: list[str] = []
    add = signals.append
    src = w.sources.get
    temp, feels, wind, gust, rain = w.temperature, w.feel.value, w.wind.speed, w.wind.gust, w.rain.rate
    station = bool(settings.temperature_entity)

    def when(t: datetime | None) -> dict[str, Any]:
        return {} if t is None else {"at": t.timestamp(), "clock": clock(t, now, zone)}

    current = "Ressenti indisponible." if feels is None else f"{number(feels)} °C ressentis"
    if feels is not None and temp is not None:
        delta = feels - temp
        current += (f", proche {'du thermomètre' if station else 'de la température météo'}." if abs(delta) < 0.6 else
                    f", {number(abs(delta))} °C {'de plus' if delta > 0 else 'de moins'} que {'le thermomètre' if station else 'la température météo'}.")
        e = w.feel.effects
        effect = sorted(((e.wind, "le vent"), (e.sun, "le soleil"), (e.rain, "la pluie"), (e.night, "le ciel nocturne")), key=lambda x: -abs(x[0]))[0]
        if abs(delta) >= 0.6:
            if abs(effect[0]) >= 0.6:
                current += f" {effect[1][0].upper() + effect[1][1:]} {'accentue la chaleur' if effect[0] > 0 else 'accentue la fraîcheur'}."
            elif w.humidex is not None and w.humidex - temp >= 0.6:
                current += " L’humidité accentue la chaleur."
    if feels is not None and not w.humidity_source and w.humidex is None:
        caveats.append("Humidité inconnue : le ressenti n’en tient pas compte.")
    if feels is not None and (feels >= 34 or feels <= 2):
        add(Signal("temperature", "now", 2 if feels >= 38 or feels <= -3 else 1,
                   f"Forte chaleur : {number(feels)} °C ressentis" if feels >= 34 else f"{'Grand froid' if feels <= -3 else 'Froid'} : {number(feels)} °C ressentis",
                   "Ressenti calculé par la carte. Ce n’est pas une vigilance officielle.", "mdi:thermometer-high" if feels >= 34 else "mdi:thermometer-low", src("temperature")))
    if temp is not None and feels is not None and abs(feels - temp) > 4 and not any(s.key == "temperature" for s in signals):
        add(Signal("comfort-gap", "now", 0,
                   f"Ressenti : {number(abs(feels - temp))} °C de {'plus' if feels > temp else 'moins'} {'qu’au thermomètre' if station else 'que la température annoncée'}",
                   "Plus de 4 °C d’écart entre le ressenti calculé et la température.", "mdi:thermometer-high" if feels > temp else "mdi:thermometer-low", src("temperature")))
    if (wind or 0) >= 30 or (gust or 0) >= 40:
        add(Signal("wind", "now", 2 if (wind or 0) >= 50 or (gust or 0) >= 60 else 1,
                   f"Vent {'très fort' if max(wind or 0, gust or 0) >= 60 else 'fort'}" + (f", rafales à {_round_half_up(gust)} km/h" if gust is not None else f" : {_round_half_up(wind or 0)} km/h"),
                   "Mesuré par votre station : vent moyen dès 30 km/h ou rafales dès 40 km/h.", "mdi:weather-windy", src("wind_gust" if gust is not None else "wind_speed")))
    elif wind is not None and wind >= 0:
        add(Signal("wind-soft", "now", 0, f"Vent {'faible' if wind < 15 else 'modéré'} : {_round_half_up(wind)} km/h", "Vent moyen mesuré en ce moment.",
                   "mdi:weather-windy", src("wind_speed")))
    if rain is not None and rain >= 0.3:
        add(Signal("rain-now", "now", 2 if rain >= 4 else 1 if rain >= 1 else 0, f"{'Forte pluie' if rain >= 4 else 'Il pleut'} : {number(rain)} mm/h",
                   "Pluie mesurée par votre station en ce moment.", "mdi:weather-pouring", src("rain_rate")))
    if (wind or 0) >= 30 and (rain or 0) >= 1:
        add(Signal("wind-rain", "now", 2, "Pluie et vent fort en même temps", "Au moins 1 mm/h de pluie et 30 km/h de vent moyen en même temps.",
                   "mdi:weather-pouring", src("rain_rate")))
    if w.condition == "fog" and w.observed:
        add(Signal("fog", "now", 1, "Brouillard possible", "Estimé avec l’humidité et le point de rosée. La visibilité n’est pas mesurée.", "mdi:weather-fog", src("humidity")))
    if (w.uv or 0) >= 6:
        add(Signal("uv", "now", 2 if (w.uv or 0) >= 8 else 1, f"UV élevés : indice {number(w.uv or 0)}", "Indice UV de vos capteurs.", "mdi:weather-sunny-alert", src("uv")))
    p = w.pressure_trend
    if p.direction is not None and str(p.direction) in ("hausse", "baisse") and p.change is not None:
        add(Signal("pressure", "now", 0,
                   f"La pression {'monte : +' if str(p.direction) == 'hausse' else 'baisse : −'}{number(abs(p.change))} hPa en {number((p.minutes or 180) / 60)} h",
                   "Calculé avec l’historique de la station. Cela ne suffit pas à prévoir la pluie.", "mdi:gauge", src("pressure")))

    # Forecast points by their time, never by their position; past and undated hours are left out.
    points = [_Point((h.time - now).total_seconds() / 3600, h) for h in hours if h.time is not None]
    upcoming = sorted((x for x in points if 0 <= x.hours <= 6), key=lambda x: x.hours)
    rains = [x for x in upcoming if x.hour.precipitation is not None and x.hour.precipitation >= 0.3]
    total = sum(max(0, x.hour.precipitation or 0) for x in upcoming)
    # Less than 1 mm over 6 h is a few drops: not worth a line.
    if rains and total >= 1:
        peak = max(x.hour.precipitation or 0 for x in rains)
        heavy = peak >= 5 or total >= 20
        amount = f"{'au moins ' if any(x.hour.precipitation is None for x in upcoming) else ''}{number(total)} mm prévus"
        add(Signal("rain-future", "future", 2 if heavy else 1 if total >= 5 else 0,
                   f"{'Fortes pluies' if heavy else 'Pluie'} {_timing(rains[0].hours)} : {amount}",
                   "Total prévu sur les 6 prochaines heures.", "mdi:weather-pouring", settings.weather_entity, **when(rains[0].hour.time),
                   short=f"{'Fortes pluies' if heavy else 'Pluie'} : {amount}"))
    storm = next((x for x in upcoming if x.hour.condition.replace("_", "-") in ("lightning", "lightning-rainy", "hail")), None)
    if storm:
        add(Signal("storm", "future", 2, f"Orage ou grêle {_timing(storm.hours)}", "Annoncé par le fournisseur météo pour les 6 prochaines heures.",
                   "mdi:weather-lightning", settings.weather_entity, **when(storm.hour.time), short="Orage ou grêle"))
    cold = next((x for x in upcoming if x.hour.temperature is not None and x.hour.temperature <= 0), None)
    if cold:
        add(Signal("freeze-future", "future", 1, f"Gel {_timing(cold.hours)} : {number(cold.hour.temperature or 0)} °C prévus", "Prévision du fournisseur météo.",
                   "mdi:snowflake", settings.weather_entity, **when(cold.hour.time),
                   short=f"Gel : {number(cold.hour.temperature or 0)} °C prévus"))

    def at(offset: float) -> str:
        return f"vers {(now + timedelta(hours=offset)).astimezone(zone).hour} h"

    # Tonight: the forecast minimum of the next 18 h against the frost and dew points.
    night = [x for x in points if 0 <= x.hours <= 18 and x.hour.temperature is not None]
    low = min(night, key=lambda x: x.hour.temperature or 0) if night else None
    low_t = low.hour.temperature if low else None
    if low and low_t is not None and low_t <= 3:
        # The ground cools 2–3 °C below the sheltered thermometer on a calm night: frost can form with +3 °C forecast.
        what = "Gel" if low_t <= 0 else "Gelée blanche possible" if w.frost_point is not None and w.frost_point >= low_t - 3 else "Gel au sol possible"
        text = f"{what} {at(low.hours)} : {number(low_t)} °C prévus"
        add(Signal("frost-night", "future", 1, text, "Minimum prévu dans les 18 h. Au sol, il fait 2 à 3 °C de moins que sous abri. Pensez aux plantes et au pare-brise.",
                   "mdi:snowflake-alert", settings.weather_entity, **when(low.hour.time),
                   short=f"{what} : {number(low_t)} °C prévus"))
        # The night's minimum says more than the first freezing hour: keep one frost line.
        signals[:] = [s for s in signals if s.key != "freeze-future"]
    if low and low_t is not None:
        # The night is judged on its own forecast: the afternoon's wind and dew point change every minute and would make the line blink.
        night_calm = low.hour.wind_speed < 8 if low.hour.wind_speed is not None else (wind or 0) < 8
        saturated = low.hour.humidity >= 95 if low.hour.humidity is not None else w.dew_point is not None and low_t <= w.dew_point
        if w.condition != "fog" and night_calm and (low.hour.precipitation or 0) < 0.3 and saturated and low_t > 0:
            add(Signal("fog-later", "future", 0, f"Brouillard possible {at(low.hours)}",
                       "Au plus froid de la nuit, l’air prévu est saturé d’humidité, sans vent ni pluie. C’est une estimation de la carte, pas une prévision de brouillard du fournisseur.",
                       "mdi:weather-fog", settings.weather_entity, **when(low.hour.time), short="Brouillard possible"))
    valid = [x.hour.temperature for x in upcoming if x.hour.temperature is not None]
    if temp is not None and valid and not cold:
        top, bottom = max(valid), min(valid)
        if top - temp >= 3 or temp - bottom >= 3:
            rising = top - temp >= 3
            peak = next(x for x in upcoming if x.hour.temperature == (top if rising else bottom))
            add(Signal("temperature-future", "future", 0,
                       f"Montée jusqu’à {number(top)} °C dans les 6 h" if rising else f"Baisse jusqu’à {number(bottom)} °C dans les 6 h",
                       "Comparé à la température actuelle, sur les 6 prochaines heures.", "mdi:thermometer", settings.weather_entity, **when(peak.hour.time),
                       short=f"Montée jusqu’à {number(top)} °C" if rising else f"Baisse jusqu’à {number(bottom)} °C"))
    tomorrow = now.astimezone(zone).date() + timedelta(days=1)
    heavy_day = next((d for d in days if d.time.astimezone(zone).date() == tomorrow and d.precipitation is not None and d.precipitation >= 20), None)
    if heavy_day:
        add(Signal("rain-tomorrow", "future", 0, f"Forte pluie demain : {number(heavy_day.precipitation or 0)} mm", "Prévision du fournisseur météo pour demain, dès 20 mm.",
                   "mdi:weather-pouring", settings.weather_entity, heavy_day.time.timestamp(), "demain",
                   short=f"Forte pluie : {number(heavy_day.precipitation or 0)} mm"))
    if not upcoming:
        caveats.append("Prévisions des 6 prochaines heures indisponibles.")
    elif any(x.hour.precipitation is None for x in upcoming):
        caveats.append("Certaines quantités de pluie manquent : le total peut être plus élevé.")

    with_pollen = settings.pollen_source not in ("none", "legacy")
    for next_day in (False, True):
        def group(metrics: Sequence[str]) -> list[tuple[str, atmo.Reading]]:
            out = []
            for metric in metrics:
                r = atmo.read_metric(get, settings, metric, next_day, now, zone)
                if r is not None and r.value is not None:
                    out.append((metric, r))
            return out
        air = group(("air", *atmo.POLLUTANT_METRICS))
        pollens = group(("pollen", *atmo.POLLEN_METRICS)) if with_pollen else []
        when = "demain" if next_day else "aujourd’hui"
        noon = datetime.combine(now.astimezone(zone).date() + timedelta(days=1), datetime.min.time(), zone).replace(hour=12)
        dated = {"at": noon.timestamp(), "clock": "demain"} if next_day else {}
        for kind, readings in (("air", air), ("pollen", pollens)):
            fresh = sorted((x for x in readings if not x[1].stale and (x[1].value or 0) <= 6), key=lambda x: -(x[1].value or 0))
            if any(x[1].stale for x in readings):
                caveats.append(f"Atmo {'air' if kind == 'air' else 'pollens'} {when} : données trop anciennes, non utilisées.")
            if any(not x[1].updated for x in fresh):
                caveats.append(f"Atmo {'air' if kind == 'air' else 'pollens'} : date de publication inconnue.")
            if fresh:
                metric, r = fresh[0]
                v = r.value or 0
                serious, watch = (4, 3) if kind == "air" else (5, 4)
                detail = f" ({_lower_first(atmo.short_label(metric))})" if metric != kind else ""
                said = f"{'Air extérieur : ' if kind == 'air' else 'Pollens : niveau '}{r.label.lower()}"
                add(Signal(f"{kind}-{str(next_day).lower()}", "environment", 2 if v >= serious else 1 if v >= watch else 0,
                           f"{said} {when}{detail}",
                           f"Indice Atmo {int(v)} sur 6{', zone ' + r.zone if r.zone else ''}. {'Publié le ' + r.updated + '.' if r.updated else 'Date de publication inconnue.'} Ce n’est pas une mesure faite chez vous.",
                           "mdi:air-filter" if kind == "air" else "mdi:flower-pollen", r.entity_id, **dated, short=f"{said}{detail}", index=v))
            event = next((x for x in readings if x[1].value == 7 and not x[1].stale), None)
            if event:
                add(Signal(f"atmo-event-{str(next_day).lower()}", "environment", 1, f"Événement signalé par Atmo {when}",
                           "Atmo signale un événement particulier (code 7). Ce n’est pas un niveau de pollution.", "mdi:information-outline", event[1].entity_id,
                           **dated, short="Événement signalé par Atmo"))
    if settings.pollen_source not in ("none", "atmo") and not settings.atmo_pollens:
        for pollen in settings.pollens:
            state = get(pollen.entity_id)
            level = polleninfo.usable_level(get, settings, pollen, now=now, zone=zone)
            if level is not None and 3 <= level <= 4:
                label = polleninfo.name(pollen, state)
                scale = "1 à 4" if polleninfo.provider(settings) == polleninfo.KLEENEX else "0 à 4"
                add(Signal(f"legacy-{pollen.entity_id}", "environment", 2 if level == 4 else 1, f"{label} : pollens {'très élevés' if level == 4 else 'élevés'}",
                           f"Niveau {polleninfo.provider_name(settings)}, sur une échelle de {scale}. Ce n’est pas une mesure faite chez vous.", "mdi:flower-pollen", pollen.entity_id,
                           short=f"Pollens : {label.lower()} {'très élevés' if level == 4 else 'élevés'}", index=level))
    if settings.vigilance_entity:
        official = read_vigilance(settings, get, now, platforms)
        if official is None:
            caveats.append("Vigilance indisponible ou trop ancienne : consultez le service officiel de votre région.")
        elif official.level > 0:
            add(Signal("official", "official", official.level, official.text,
                       f"Vigilance officielle {official.source}. Ouvrez le capteur pour lire les consignes.", "mdi:alert-outline", settings.vigilance_entity))

    severity = max((s.severity for s in signals), default=0)
    signals.sort(key=lambda s: (-s.severity, GROUPS.index(s.group), s.key))

    def phrases(g: str) -> str:
        return " ; ".join([s.text for s in signals if s.group == g][:2])

    lines = [f"Maintenant : {current}{' ' + phrases('now') + '.' if phrases('now') else ''}"]
    if phrases("future"):
        lines.append(f"À venir : {phrases('future')}.")
    elif not upcoming:
        lines.append("À venir : prévisions indisponibles.")
    if phrases("environment"):
        lines.append(f"Air et pollens : {phrases('environment')}.")
    if phrases("official"):
        lines.append(phrases("official") + ".")
    omitted = sum(1 for g in ("now", "future", "environment") for s in [x for x in signals if x.group == g][2:] if s.severity > 0)
    if omitted:
        lines.append(f"{omitted} autre{'s' if omitted > 1 else ''} point{'s' if omitted > 1 else ''} à consulter dans les explications.")
    available = feels is not None or bool(signals) or bool(upcoming)
    official_signal = next((s for s in signals if s.key == "official"), None)
    themes = {"wind": "Vent", "wind-rain": "Pluie et vent", "rain-now": "Pluie", "rain-future": "Pluie", "storm": "Orage",
              "temperature": "Chaleur" if feels is not None and feels >= 34 else "Froid", "freeze-future": "Froid", "frost-night": "Gel", "fog": "Brouillard", "uv": "UV"}
    topics: list[str] = []
    for s in signals:
        if s.severity > 0 and s.group != "official":
            topic = themes.get(s.key) or ("Air extérieur" if s.key.startswith("air-") or s.key.startswith("atmo-event") else "Pollens" if s.group == "environment" else "Météo")
            if topic not in topics:
                topics.append(topic)
    title = official_signal.text if official_signal and official_signal.severity == severity else " · ".join(topics[:3]) if topics else "Votre météo en bref"
    return Brief(title=title, label="Données insuffisantes" if not available else "Synthèse partielle" if severity == 0 and caveats else LEVELS[severity],
                 color=COLORS[severity] if available else "150,150,150", icon=next((s.icon for s in signals if s.severity > 0), "mdi:weather-partly-cloudy"),
                 summary="\n".join(lines), signals=tuple(signals), caveats=tuple(dict.fromkeys(caveats)), available=available, severity=severity)
