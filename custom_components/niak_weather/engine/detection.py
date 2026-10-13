"""Finding the home's sources among Home Assistant's entities: the weather service, the station's sensors, Atmo France.
Never a guess between two candidates: an ambiguous field stays empty for the user to choose."""
from __future__ import annotations

import re
from typing import Any, Callable, Mapping, Sequence

from . import atmo, polleninfo
from .atmo import StateLike, normal
from .settings import ATMO_KEYS

Registry = Mapping[str, Mapping[str, Any]]
"""Entity registry entries by entity id: platform, device_id, disabled_by, config_entry_id, unique_id, translation_key, original_name."""
Devices = Mapping[str, Mapping[str, Any]]
"""Device registry entries by id: name, name_by_user, manufacturer."""

STATION_RULES: dict[str, re.Pattern[str]] = {k: re.compile(v) for k, v in {
    "temperature_entity": r"(?:outdoor|outside|exterieur|external).*temp|temp.*(?:outdoor|outside|exterieur|external)|(?:ecowitt|ws\d{2}|station.*meteo).*temp",
    "humidity_entity": r"(?:outdoor|outside|exterieur|external).*humid|humid.*(?:outdoor|outside|exterieur|external)|humidity|humidite",
    "wind_speed_entity": r"(?:wind.*(?:speed|average|avg)|(?:average|avg).*wind|moyenne.*vent|vent.*moyenne|vitesse.*vent)",
    "wind_gust_entity": r"gust|rafale",
    "wind_bearing_entity": r"(?:wind.*(?:bearing|direction)|direction.*vent)",
    "rain_rate_entity": r"(?:rain.*(?:rate|intensity)|pluie.*(?:taux|intensite))",
    "rain_total_entity": r"precipitation|total.*rain|rain.*total|cumul.*pluie",
    "daily_rain_entity": r"(?:daily|today|jour|quotidien).*rain|rain.*(?:daily|today|jour|quotidien)|pluie.*(?:jour|quotidien)",
    "rain_24h_entity": r"(?:24h|24_h).*(?:rain|precip)|(?:rain|precip).*(?:24h|24_h)|pluie.*24|precipitation.*24",
    "weekly_rain_entity": r"(?:weekly|week|semaine).*rain|rain.*(?:weekly|week|semaine)|pluie.*semaine",
    "monthly_rain_entity": r"(?:monthly|month|mois).*rain|rain.*(?:monthly|month|mois)|pluie.*mois",
    "yearly_rain_entity": r"(?:yearly|year|annual).*rain|rain.*(?:yearly|year|annual)|pluie.*(?:annuel|annee)",
    "event_rain_entity": r"(?:event|episode).*rain|rain.*(?:event|episode)|pluie.*(?:event|episode)",
    "pressure_entity": r"pressure|pression",
    "solar_radiation_entity": r"solar.*radiation|radiation.*solar|rayonnement",
    "dew_point_entity": r"dew_?point|point.*rosee|rosee",
    "uv_index_entity": r"uv_index|index_uv|\buv\b",
    "illuminance_entity": r"lux|illuminance|luminosite",
    "max_daily_gust_entity": r"max.*(?:daily.*gust|gust|rafale)|rafale.*max",
    "temperature_trend_entity": r"tendance.*temp.*(?:ext|dehors)|temp.*(?:ext|outdoor).*trend",
}.items()}
STATION_FIELDS = tuple(STATION_RULES)
SOURCE_FIELDS = ("weather_entity", "vigilance_entity", "sun_entity", "sun_elevation_entity", "season_entity")
CATEGORY_FIELDS: dict[str, tuple[str, ...]] = {"weather": SOURCE_FIELDS, "station": STATION_FIELDS, "atmo": ATMO_KEYS}

_WIND_UNITS = r"^(km/h|m/s|mph|kn|kt|kts|knots?)$"
_PHYSICAL: dict[str, tuple[tuple[str, ...], str]] = {
    "temperature_entity": (("temperature",), r"^(°?[cf]|k)$"), "dew_point_entity": (("temperature",), r"^(°?[cf]|k)$"),
    "humidity_entity": (("humidity",), r"^%$"), "pressure_entity": (("pressure", "atmospheric_pressure"), r"^(hpa|pa|kpa|mbar|inhg|mmhg)$"),
    "wind_speed_entity": (("wind_speed",), _WIND_UNITS), "wind_gust_entity": (("wind_speed",), _WIND_UNITS),
    "max_daily_gust_entity": (("wind_speed",), _WIND_UNITS), "wind_bearing_entity": (("wind_direction",), r"^(°|deg|degrees?)$"),
    "illuminance_entity": (("illuminance",), r"^(lx|lux)$"), "solar_radiation_entity": (("irradiance",), r"^k?w/(m²|m2)$"),
    "rain_rate_entity": (("precipitation_intensity",), r"^(mm|in|inch)/h$"), "temperature_trend_entity": (("temperature",), r"^(°?[cf])/h$"),
}
_MEASURES: dict[str, tuple[tuple[str, ...], str]] = {
    **{k: v for k, v in _PHYSICAL.items() if k != "temperature_trend_entity"},
    "uv_index_entity": ((), r"^(uv|uvindex|index)$"), "temperature_trend_entity": ((), r"^(°?[cf])/h$"), "sun_elevation_entity": ((), r"^(°|deg|degrees?)$"),
}
_RAIN_PERIODS = re.compile(r"^(daily_rain|rain_24h|weekly_rain|monthly_rain|yearly_rain|event_rain|rain_total)_entity$")
_NOT_OUTDOOR = r"dew|rosee|humidex|heat_?index|wind_?chill|apparent|ressenti|indoor|interieur|trend|tendance"


def sensor_text(state: StateLike, entry: Mapping[str, Any] | None = None) -> str:
    e = entry or {}
    return normal(f"{state.entity_id} {state.attributes.get('friendly_name') or ''} {e.get('unique_id') or ''} {e.get('translation_key') or ''} "
                  f"{e.get('original_name') or ''}")


def _unit(state: StateLike) -> str:
    return re.sub(r"\s", "", str(state.attributes.get("unit_of_measurement") or "").lower())


def function_matches(state: StateLike, field: str, entry: Mapping[str, Any] | None = None) -> bool:
    """Whether a sensor can do this job, for automatic and manual choices alike (a dew point is not a thermometer)."""
    t, unit, cls = sensor_text(state, entry), _unit(state), state.attributes.get("device_class")
    measure = _PHYSICAL.get(field)
    if measure and ((cls and str(cls) not in measure[0]) or (unit and not re.search(measure[1], unit))):
        return False
    if _RAIN_PERIODS.match(field) and ((cls and cls != "precipitation") or (unit and not re.search(r"^(mm|in|inch)$", unit))):
        return False
    if field == "illuminance_entity" and re.search(r"\braw\b|_raw|brut", t):
        return False
    if field == "temperature_entity" and re.search(_NOT_OUTDOOR, t):
        return False
    if field == "humidity_entity" and re.search(r"humidex|absolute|absolue|indoor|interieur|heat.?stress|battery|batterie", t):
        return False
    if field == "wind_speed_entity" and re.search(r"direction|bearing|gust|rafale|max", t):
        return False
    if field == "wind_gust_entity" and (re.search(r"direction|bearing|max|daily", t) or not STATION_RULES[field].search(t)):
        return False
    if field in ("max_daily_gust_entity", "dew_point_entity") and not STATION_RULES[field].search(t):
        return False
    if field == "pressure_entity" and re.search(r"trend|tendance", t):
        return False
    if field == "temperature_trend_entity" and not re.search(r"°?[cf]/h", unit) and not STATION_RULES[field].search(t):
        return False
    if field == "rain_total_entity":
        return state.attributes.get("state_class") == "total_increasing" and not re.search(
            r"24.?h|daily|today|jour|week|semaine|month|mois|year|annee|event|episode|rate|intensite", t)
    if _RAIN_PERIODS.match(field):
        return bool(STATION_RULES[field].search(t)) and (field != "daily_rain_entity" or not re.search(r"24.?h|week|month|year|semaine|mois|annee", t))
    if field in ("wind_speed_entity", "wind_gust_entity"):
        return not unit or bool(re.search(_WIND_UNITS, unit))
    if field == "illuminance_entity":
        return (not cls or cls == "illuminance") and (not unit or bool(re.search(r"^(lx|lux)$", unit)))
    return True


# Computed values, never taken for station sensors: Thermal Comfort's (humidex, dew point…) and Niak Weather's own.
DERIVED = ("thermal_comfort", "niak_weather")


def _is_thermal(state: StateLike, entry: Mapping[str, Any] | None) -> bool:
    return ((entry or {}).get("platform") in DERIVED or state.entity_id.startswith(("sensor.niak_weather_", "binary_sensor.niak_weather_"))
            or bool(re.search(r"thermal.*comfort", sensor_text(state, entry))))


def candidates(states: Sequence[StateLike], field: str, registry: Registry, options: Mapping[str, Any] | None = None) -> list[str]:
    """Sensors whose name and measure fit a station field."""
    rule, device = STATION_RULES.get(field), (options or {}).get("station_device_id")
    if rule is None:
        return []
    found = []
    for state in states:
        entry = registry.get(state.entity_id)
        if not state.entity_id.startswith("sensor.") or (entry or {}).get("disabled_by") or _is_thermal(state, entry):
            continue
        if device and (entry or {}).get("device_id") != device and field != "temperature_trend_entity":
            continue
        t = sensor_text(state, entry)
        if not rule.search(t) or not function_matches(state, field, entry):
            continue
        if (field == "temperature_entity" and re.search(_NOT_OUTDOOR, t)) or (field == "humidity_entity" and re.search(r"humidex|absolute|absolue|indoor|interieur", t)) \
                or (field == "pressure_entity" and re.search(r"trend|tendance", t)) or (field == "wind_speed_entity" and re.search(r"gust|rafale|max", t)) \
                or (field == "wind_gust_entity" and re.search(r"max|daily", t)) or (field == "daily_rain_entity" and re.search(r"24h|24_h|max|year", t)):
            continue
        found.append(state.entity_id)
    return sorted(found)


def measurement_matches(state: StateLike, field: str) -> bool:
    """The sensor measures the right thing, by its type or unit: an explicit unit wins over a misleading name."""
    cls, unit = normal(state.attributes.get("device_class")), re.sub(r"\s", "", normal(state.attributes.get("unit_of_measurement")))
    if _RAIN_PERIODS.match(field):
        return cls == "precipitation" if cls else bool(re.search(r"^(mm|in|inch)$", unit))
    if field == "uv_index_entity" and not cls and not unit:
        return bool(re.search(r"uv_index|index_uv|\buv\b", normal(f"{state.entity_id} {state.attributes.get('friendly_name')}")))
    rule = _MEASURES.get(field)
    if rule is None:
        return False
    return cls in rule[0] if cls and rule[0] else bool(re.search(rule[1], unit))


def manual_candidates(states: Sequence[StateLike], field: str, registry: Registry, options: Mapping[str, Any] | None = None) -> list[str]:
    """What the form offers for a field: sensors measuring the right thing, plus untyped ones named for it."""
    options = options or {}
    semantic = set(candidates(states, field, registry, options))
    found = []
    for state in states:
        entry = registry.get(state.entity_id) or {}
        if not state.entity_id.startswith("sensor.") or entry.get("disabled_by") or entry.get("platform") in DERIVED:
            continue
        if not function_matches(state, field, entry):
            continue
        if options.get("station_device_id") and entry.get("device_id") and entry.get("device_id") != options.get("station_device_id"):
            continue
        typed = state.attributes.get("device_class") or state.attributes.get("unit_of_measurement")
        if measurement_matches(state, field) or (not typed and state.entity_id in semantic):
            found.append(state.entity_id)
    return sorted(found)


def _unique_best(ids: Sequence[str], score: Callable[[str], float]) -> str | None:
    ranked = sorted(((i, score(i)) for i in ids), key=lambda r: -r[1])
    if not ranked or (len(ranked) > 1 and ranked[1][1] == ranked[0][1]):
        return None
    return ranked[0][0]



def detect_station(states: Sequence[StateLike], registry: Registry, devices: Devices, options: Mapping[str, Any]) -> dict[str, Any]:
    """Station sensors, Atmo France and Polleninformation to propose. No guess from the device class alone; rain periods stay distinct."""
    selected: dict[str, Any] = {}
    by_id = {s.entity_id: s for s in states}

    def text(entity_id: str) -> str:
        return sensor_text(by_id[entity_id], registry.get(entity_id))

    def is_ecowitt(entity_id: str) -> bool:
        entry = registry.get(entity_id) or {}
        device = devices.get(entry.get("device_id") or "") or {}
        return entry.get("platform") == "ecowitt" or bool(re.search("ecowitt", device.get("manufacturer") or "", re.IGNORECASE)) \
            or bool(re.search(r"(?:ecowitt|gw\d{3,4}|wh\d{2}|ws\d{2})", text(entity_id)))

    temperature = options.get("temperature_entity") or _unique_best(candidates(states, "temperature_entity", registry, options),
                                                                    lambda i: 100 if is_ecowitt(i) else 0)
    device = options.get("station_device_id") or ((registry.get(temperature) or {}).get("device_id") if temperature else None)
    if device:
        selected["station_device_id"] = device
    prefix = re.sub(r"_(outdoor|outside|exterieur|external).*$", "", temperature.split(".")[-1]) if temperature else None
    for field in STATION_FIELDS:
        if options.get(field) is not None:
            continue
        ids = candidates(states, field, registry, {**options, "station_device_id": device or None})
        if field == "humidity_entity" and not device:
            ids = [i for i in ids if is_ecowitt(i) or re.search(r"outdoor|outside|exterieur|external", text(i))]

        def score(i: str, field: str = field) -> float:
            t = text(i)
            return ((100 if is_ecowitt(i) else 0) + (40 if prefix and prefix in i else 0)
                    + (20 if re.search(r"average|avg|moyenne", t) and field in ("wind_speed_entity", "wind_bearing_entity") else 0)
                    + (20 if field == "pressure_entity" and "relative" in t else 0))

        best = _unique_best(ids, score)
        if best:
            selected[field] = best
    selected.update(atmo.detect(states, registry, options, devices))
    if options.get("pollens") is None and options.get("pollen_source") == "legacy":
        found = polleninfo.detect(states, registry, options.get("pollen_provider") or polleninfo.POLLENINFORMATION)
        selected.update({k: v for k, v in found.items() if options.get(k) is None})
    return selected


def season_candidates(states: Sequence[StateLike], registry: Registry) -> list[str]:
    """The Season integration, or any sensor whose options are exactly the four seasons."""
    found = []
    for state in states:
        entry = registry.get(state.entity_id) or {}
        options = state.attributes.get("options")
        seasons = ",".join(sorted(map(str, options))) if isinstance(options, (list, tuple)) else ""
        if not entry.get("disabled_by") and state.entity_id.startswith("sensor.") and (entry.get("platform") == "season" or seasons == "autumn,spring,summer,winter"):
            found.append(state.entity_id)
    return found


def vigilance_candidates(states: Sequence[StateLike], registry: Registry) -> list[str]:
    """Météo-France weather alert sensors."""
    found = []
    for state in states:
        entry = registry.get(state.entity_id) or {}
        if entry.get("disabled_by") or not state.entity_id.startswith("sensor."):
            continue
        if not (entry.get("platform") == "meteo_france" or re.search(r"meteo.france", normal(state.attributes.get("attribution")))):
            continue
        if re.search(r"weather_alert|vigilance|alerte",
                     normal(f"{state.entity_id} {entry.get('unique_id')} {entry.get('translation_key')} {entry.get('original_name')}")):
            found.append(state.entity_id)
    return found


def detect_sources(states: Sequence[StateLike], registry: Registry, options: Mapping[str, Any]) -> dict[str, str]:
    """The weather service (Météo-France first), its vigilance, the sun and the season, each only when there is a single choice."""
    detected: dict[str, str] = {}
    # Niak Weather's own weather entity is a result, never a source.
    weather = [s for s in states if s.entity_id.startswith("weather.") and (registry.get(s.entity_id) or {}).get("platform") != "niak_weather"]
    preferred = [s for s in weather if (registry.get(s.entity_id) or {}).get("platform") == "meteo_france"
                 or re.search(r"meteo.france", normal(s.attributes.get("attribution")))]
    choices = preferred if len(preferred) == 1 else weather
    if options.get("weather_entity") is None and len(choices) == 1:
        detected["weather_entity"] = choices[0].entity_id
    weather_id = detected.get("weather_entity") or options.get("weather_entity") or ""
    entry = (registry.get(weather_id) or {}).get("config_entry_id")
    vigilances = vigilance_candidates(states, registry)
    local = [v for v in vigilances if (registry.get(v) or {}).get("config_entry_id") == entry] if entry else vigilances
    if options.get("vigilance_entity") is None and len(local) == 1:
        detected["vigilance_entity"] = local[0]
    suns = [s.entity_id for s in states if s.entity_id.startswith("sun.")]
    if options.get("sun_entity") is None and len(suns) == 1:
        detected["sun_entity"] = suns[0]
    seasons = season_candidates(states, registry)
    if options.get("season_entity") is None and len(seasons) == 1:
        detected["season_entity"] = seasons[0]
    return detected


def fill(states: Sequence[StateLike], registry: Registry, devices: Devices, options: Mapping[str, Any], category: str,
         fill_empty: bool = False) -> dict[str, Any]:
    """The options with one category's missing or broken references detected again. Empty values are deliberate opt-outs,
    kept unless `fill_empty`; unavailable entities are real references and stay; unresolved references remain for repair."""
    by_id = {s.entity_id: s for s in states}
    search = dict(options)
    for field in CATEGORY_FIELDS[category]:
        value = search.get(field)
        if isinstance(value, str) and ((value and value not in by_id) or (fill_empty and value == "")):
            del search[field]
    if category == "station" and search.get("station_device_id") and not any(e.get("device_id") == search["station_device_id"] for e in registry.values()):
        del search["station_device_id"]
    if category == "atmo" and search.get("atmo_area") and not any(a["value"] == search["atmo_area"] for a in atmo.areas(states, registry, devices)):
        del search["atmo_area"]
    if category == "weather":
        detected: dict[str, Any] = dict(detect_sources(states, registry, search))
    else:
        found = detect_station(states, registry, devices, search)
        keys = [*CATEGORY_FIELDS[category], *(("station_device_id",) if category == "station" else ()),
                *(("atmo_area", "pollen_source", "pollens", "pollen_risk_entity") if category == "atmo" else ())]
        detected = {k: found[k] for k in keys if k in found and not (k == "station_device_id" and search.get(k) == "")}
        # A chosen generic station can expose renamed sensors through their physical type.
        if category == "station" and search.get("station_device_id"):
            for field in ("temperature_entity", "humidity_entity", "pressure_entity", "illuminance_entity", "solar_radiation_entity"):
                if search.get(field) is not None or field in detected:
                    continue
                ids = [i for i in manual_candidates(states, field, registry, search)
                       if (registry.get(i) or {}).get("device_id") == search["station_device_id"]
                       and not re.search(r"indoor|interieur|dew|rosee|humidex|apparent|wind.?chill|heat.?index|trend|tendance",
                                         normal(f"{i} {by_id[i].attributes.get('friendly_name') or ''}"))]
                if len(ids) == 1:
                    detected[field] = ids[0]
    return {**options, **detected}


# ---- Station models, for the form ----

STATION_MODELS = {"gw2000a": "Ecowitt GW2000A", "ws90": "Shelly / Ecowitt WS90 — Zigbee2MQTT", "manual": "Autre station / configuration manuelle"}
STATION_GROUPS = (("station_temperature", "Température et humidité"), ("station_rain", "Pluie"), ("station_wind", "Vent"),
                  ("station_sun", "Soleil"), ("station_specific", "Spécifiques"))


def selected_station_model(options: Mapping[str, Any]) -> str:
    if options.get("station_model"):
        return str(options["station_model"])
    ids = " ".join(str(v) for k, v in options.items() if k.endswith("_entity") and isinstance(v, str)).lower()
    if "ws90" in ids and "gw2000" not in ids:
        return "ws90"
    if "gw2000" in ids and "ws90" not in ids:
        return "gw2000a"
    return "manual"


def station_groups(model: str) -> list[tuple[str, str, tuple[str, ...]]]:
    """The station's fields grouped by subject, only those its model has."""
    rain = (("rain_rate_entity", "daily_rain_entity", "rain_24h_entity", "weekly_rain_entity", "monthly_rain_entity", "yearly_rain_entity", "event_rain_entity")
            if model == "gw2000a" else ("rain_rate_entity", "rain_total_entity") if model == "ws90"
            else ("rain_rate_entity", "rain_total_entity", "daily_rain_entity", "rain_24h_entity", "weekly_rain_entity", "monthly_rain_entity",
                  "yearly_rain_entity", "event_rain_entity"))
    ws90 = model == "ws90"
    fields = (("temperature_entity", "humidity_entity"), rain,
              ("wind_speed_entity", "wind_gust_entity", "wind_bearing_entity", *(() if ws90 else ("max_daily_gust_entity",))),
              ("illuminance_entity", "uv_index_entity", *(() if ws90 else ("solar_radiation_entity",))),
              ("pressure_entity", "dew_point_entity", *(() if ws90 else ("temperature_trend_entity",))))
    return [(name, title, group) for (name, title), group in zip(STATION_GROUPS, fields)]


def station_profile(states: Sequence[StateLike], registry: Registry, devices: Devices, device_id: str | None) -> str:
    if device_id == "":
        return "Autres capteurs / configuration manuelle"
    by_id = {s.entity_id: s for s in states}
    entries = [(i, e) for i, e in registry.items() if e.get("device_id") == device_id]
    device = devices.get(device_id or "") or {}
    text = " ".join([str(device.get("name") or ""), str(device.get("name_by_user") or ""), str(device.get("manufacturer") or ""),
                     *(sensor_text(by_id[i], e) for i, e in entries if i in by_id)]).lower()
    if "ws90" in text:
        return "WS90 via MQTT" if any(e.get("platform") in ("mqtt", "zigbee2mqtt") for _, e in entries) else "WS90"
    if "gw2000" in text:
        return "GW2000A / Ecowitt"
    return "Autres capteurs / configuration manuelle"


def model_devices(states: Sequence[StateLike], registry: Registry, devices: Devices, model: str) -> list[str]:
    ids = list(dict.fromkeys([*devices, *(e.get("device_id") for e in registry.values() if e.get("device_id"))]))
    prefix = {"gw2000a": "GW2000", "ws90": "WS90"}.get(model, "")
    return [i for i in ids if station_profile(states, registry, devices, i).startswith(prefix)]


def source_devices(states: Sequence[StateLike], registry: Registry, devices: Devices) -> list[dict[str, str]]:
    """Devices that carry weather sensors, to choose the station."""
    by_id = {s.entity_id: s for s in states}
    semantic = {i for field in STATION_FIELDS for i in candidates(states, field, registry)}
    ids: list[str] = []
    for entity_id, entry in registry.items():
        state = by_id.get(entity_id)
        if state is None or not entry.get("device_id") or entry.get("disabled_by") or entry.get("platform") in DERIVED:
            continue
        if entity_id in semantic or any(measurement_matches(state, f) for f in STATION_FIELDS):
            ids.append(entry["device_id"])
    result = []
    for device_id in dict.fromkeys(ids):
        device = devices.get(device_id) or {}
        first = next((i for i, e in registry.items() if e.get("device_id") == device_id and i in by_id), None)
        label = device.get("name_by_user") or device.get("name") or (str(by_id[first].attributes.get("friendly_name") or device_id) if first else device_id)
        result.append({"value": device_id, "label": str(label)})
    return sorted(result, key=lambda d: d["label"])


def station_report(states: Sequence[StateLike], registry: Registry, devices: Devices, options: Mapping[str, Any]) -> dict[str, Any]:
    """What was recognised: each field « recognized », « ambiguous », « invalid » or « absent »."""
    by_id = {s.entity_id: s for s in states}
    detected = detect_station(states, registry, devices, options)
    fields = []
    for field in STATION_FIELDS:
        ids = candidates(states, field, registry, options)
        entity = options.get(field) or detected.get(field)
        if entity:
            status = "recognized" if entity in by_id and function_matches(by_id[entity], field, registry.get(entity)) else "invalid"
        else:
            status = "ambiguous" if len(ids) > 1 else "recognized" if len(ids) == 1 else "absent"
        fields.append({"field": field, "status": status, "entity": (entity or ids[0]) if status == "recognized" else None, "candidates": ids})
    return {"profile": station_profile(states, registry, devices, options.get("station_device_id")), "fields": fields,
            "recognized": sum(1 for f in fields if f["status"] == "recognized")}
