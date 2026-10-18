"""WAQI for today's air, Open-Meteo for tomorrow's: both said on Atmo France's scale of 1 to 6."""
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo

import pytest

from engine import open_meteo, waqi
from engine.atmo import POLLUTANT_METRICS, read_metric
from engine.catalogue import _atmo
from engine.families import needs
from engine.settings import Settings
from engine.view import _air

PARIS = ZoneInfo("Europe/Paris")
NOW = datetime(2026, 10, 18, 12, 30, tzinfo=timezone.utc)
STATION = "3836"
PLACE = "Gardanne, PACA, France"


@dataclass
class State:
    entity_id: str
    state: str
    attributes: dict[str, Any] = field(default_factory=dict)
    last_reported: datetime | None = NOW - timedelta(minutes=14)


# What a WAQI station in Gardanne gave on 18 October: particles and ozone, no nitrogen nor sulphur dioxide.
MEASURES = {"air_quality": ("indice_de_qualite_de_l_air", "29"), "pm25": ("pm2_5", "29"), "pm10": ("pm10", "17"), "ozone": ("ozone", "6"),
            "dominant_pollutant": ("polluant_dominant", "pm25"), "humidity": ("humidite", "88.5")}


def install(values: dict[str, str] | None = None) -> tuple[dict[str, State], dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    states, registry = {}, {}
    for key, (name, value) in MEASURES.items():
        entity_id = f"sensor.gardanne_paca_france_{name}"
        states[entity_id] = State(entity_id, (values or {}).get(key, value))
        registry[entity_id] = {"platform": "waqi", "unique_id": f"{STATION}_{key}", "device_id": "dev", "disabled_by": None}
    registry["sensor.autre"] = {"platform": "atmofrance", "unique_id": "x_pm25", "device_id": "dev"}
    return states, registry, {"dev": {"name": PLACE, "name_by_user": None}}


def settings_for(registry: dict[str, dict[str, Any]], devices: dict[str, dict[str, Any]], **extra: Any) -> Settings:
    return Settings.from_options({"weather_entity": "weather.home", "air_source": "waqi", **waqi.detect(registry, devices, STATION), **extra})


def forecast(tomorrow: list[float | None]) -> open_meteo.Data:
    """Open-Meteo's hourly answer for today (calm) and tomorrow (the given European indices, repeated)."""
    times = [f"2026-10-{day}T{h:02d}:00" for day in (18, 19) for h in range(24)]
    aqi = [15.0] * 24 + [tomorrow[h % len(tomorrow)] for h in range(24)]
    payload = {"hourly": {"time": times, **{column: aqi for column in open_meteo.COLUMNS.values()}}}
    return open_meteo.parse(payload, NOW - timedelta(minutes=20))


# ---- Conversion ----

@pytest.mark.parametrize(("pollutant", "index", "level"), [
    ("pm25", 29, 1),     # about 7 µg/m³: Bon
    ("pm25", 60, 2),     # about 15 µg/m³: Moyen
    ("pm25", 100, 4),    # 35.4 µg/m³: Mauvais
    ("pm25", 180, 6),    # about 112 µg/m³: Extrêmement mauvais
    ("pm10", 17, 1),
    ("pm10", 50, 4),     # 54 µg/m³: Mauvais from 50
    ("o3", 6, 1),
    ("o3", 100, 4),      # 70 ppb, 140 µg/m³: Mauvais
    ("no2", 53, 3),      # 53 ppb, about 101 µg/m³: Dégradé
    ("so2", 0, 1),
    ("pm25", 600, 6),    # beyond the American scale, the last line goes on
])
def test_an_american_sub_index_is_cut_at_the_atmo_thresholds(pollutant: str, index: float, level: int) -> None:
    assert waqi.level(pollutant, index) == level


def test_open_meteo_european_index_cut_every_twenty_points() -> None:
    assert [open_meteo.level(v) for v in (0, 20, 20.5, 40, 41, 60, 61, 80, 81, 100, 101)] == [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6]


# ---- Detection ----

def test_finds_the_station_and_each_of_its_sensors_by_unique_id() -> None:
    _, registry, devices = install()
    assert waqi.stations(registry, devices) == [{"value": STATION, "label": PLACE}]
    found = waqi.detect(registry, devices, STATION)
    assert found["waqi_pm25_entity"] == "sensor.gardanne_paca_france_pm2_5"
    assert found["waqi_o3_entity"] == "sensor.gardanne_paca_france_ozone"
    assert found["waqi_air_entity"] == "sensor.gardanne_paca_france_indice_de_qualite_de_l_air"
    assert found["waqi_no2_entity"] == "" and found["waqi_so2_entity"] == ""  # this station does not measure them
    assert found["waqi_place"] == PLACE


def test_a_disabled_sensor_or_another_integration_is_left_out() -> None:
    _, registry, devices = install()
    registry["sensor.gardanne_paca_france_pm2_5"]["disabled_by"] = "user"
    assert waqi.detect(registry, devices, STATION)["waqi_pm25_entity"] == ""
    assert waqi.identity("sensor.autre", registry) is None


def test_waqi_sensors_count_only_when_waqi_gives_the_air() -> None:
    _, registry, devices = install()
    detected = waqi.detect(registry, devices, STATION)
    assert Settings.from_options({"weather_entity": "weather.home", "air_source": "atmo", **detected}).waqi == {}
    assert "sensor.gardanne_paca_france_pm2_5" in settings_for(registry, devices).entity_ids()


# ---- Reading: today the station, tomorrow Open-Meteo ----

def test_today_is_the_station_measure_said_on_six_levels() -> None:
    states, registry, devices = install()
    s, get = waqi.overlay(settings_for(registry, devices), states.get, forecast([30]), NOW, PARIS)
    air = read_metric(get, s, "air", False, NOW, PARIS)
    assert air is not None and air.value == 1 and air.label == "Bon"
    assert air.entity_id == "sensor.gardanne_paca_france_indice_de_qualite_de_l_air"  # a tap opens the WAQI sensor
    assert air.zone == f"station {PLACE}" and air.updated == "18/10 14:16" and not air.stale
    pm25 = read_metric(get, s, "pm25", False, NOW, PARIS)
    assert pm25 is not None and pm25.value == 1
    assert read_metric(get, s, "no2", False, NOW, PARIS) is None  # not measured: not shown


def test_the_air_index_is_the_worst_pollutant() -> None:
    states, registry, devices = install({"air_quality": "100", "pm25": "29", "ozone": "100"})
    s, get = waqi.overlay(settings_for(registry, devices), states.get, None, NOW, PARIS)
    air = read_metric(get, s, "air", False, NOW, PARIS)
    assert air is not None and air.value == 4 and air.label == "Mauvais"


def test_without_pollutants_the_overall_index_is_read_as_the_dominant_one() -> None:
    states, registry, devices = install()
    for key in ("pm25", "pm10", "ozone"):
        registry.pop(next(i for i, e in registry.items() if e["unique_id"] == f"{STATION}_{key}"))
    states["sensor.gardanne_paca_france_indice_de_qualite_de_l_air"].state = "100"
    s, get = waqi.overlay(settings_for(registry, devices), states.get, None, NOW, PARIS)
    air = read_metric(get, s, "air", False, NOW, PARIS)
    assert air is not None and air.value == 4


def test_tomorrow_is_open_meteo_forecast_the_worst_hour_of_the_day() -> None:
    states, registry, devices = install()
    s, get = waqi.overlay(settings_for(registry, devices), states.get, forecast([25, 45, 30]), NOW, PARIS)
    tomorrow = read_metric(get, s, "air", True, NOW, PARIS)
    assert tomorrow is not None and tomorrow.value == 3 and tomorrow.label == "Dégradé" and tomorrow.zone == open_meteo.ZONE
    assert read_metric(get, s, "o3", True, NOW, PARIS) is not None


def test_an_unavailable_station_says_so_and_never_borrows_open_meteo_for_today() -> None:
    states, registry, devices = install({k: "unavailable" for k in MEASURES})
    s, get = waqi.overlay(settings_for(registry, devices), states.get, forecast([30]), NOW, PARIS)
    air = read_metric(get, s, "air", False, NOW, PARIS)
    assert air is not None and air.value is None and air.label == "Indisponible"
    assert read_metric(get, s, "air", True, NOW, PARIS) is not None  # tomorrow still comes


def test_without_forecast_tomorrow_stays_empty() -> None:
    states, registry, devices = install()
    s, get = waqi.overlay(settings_for(registry, devices), states.get, None, NOW, PARIS)
    tomorrow = read_metric(get, s, "air", True, NOW, PARIS)
    assert tomorrow is not None and tomorrow.value is None
    later = NOW + timedelta(days=1)
    s, get = waqi.overlay(settings_for(registry, devices), states.get, forecast([30]), later, PARIS)
    assert read_metric(get, s, "air", True, later, PARIS).value is None  # type: ignore[union-attr]


def test_atmo_france_is_left_untouched() -> None:
    s = Settings.from_options({"weather_entity": "weather.home", "atmo_air_entity": "sensor.atmo_air"})
    get = {}.get
    assert waqi.overlay(s, get, forecast([30]), NOW, PARIS) == (s, get)


def test_atmo_pollens_stay_with_waqi_air() -> None:
    states, registry, devices = install()
    states["sensor.atmo_pollen"] = State("sensor.atmo_pollen", "2", {"Date de mise à jour": "2026-10-18T08:00:00"})
    s, get = waqi.overlay(settings_for(registry, devices, pollen_source="atmo", atmo_pollen_entity="sensor.atmo_pollen"), states.get, None, NOW, PARIS)
    assert s.atmo["atmo_pollen_entity"] == "sensor.atmo_pollen"
    assert read_metric(get, s, "pollen", False, NOW, PARIS).value == 2  # type: ignore[union-attr]


# ---- What the family sees ----

def test_the_panels_name_who_gives_the_air() -> None:
    states, registry, devices = install()
    s, get = waqi.overlay(settings_for(registry, devices), states.get, forecast([30]), NOW, PARIS)
    today = _air(get, s, NOW, PARIS, False)[0]
    tomorrow = _air(get, s, NOW, PARIS, True)[0]
    assert (today.kind, today.source, today.zone) == ("air", "WAQI", f"station {PLACE}")
    assert [d.label for d in today.details] == ["PM2.5", "PM10", "O₃"]
    assert (tomorrow.source, tomorrow.primary.label) == ("Open-Meteo", "Moyen")  # type: ignore[union-attr]


def test_the_air_sensor_says_its_source() -> None:
    states, registry, devices = install()
    s, get = waqi.overlay(settings_for(registry, devices), states.get, forecast([30]), NOW, PARIS)
    item = _atmo(get, s, "air", POLLUTANT_METRICS, NOW, PARIS)
    assert (item.value, item.source, item.extra["demain"]) == (1, "waqi", 2)
    assert item.reason.startswith("Bon (1/6)")


def test_what_is_missing_names_waqi() -> None:
    _, registry, devices = install()
    assert "qualite_air" not in needs(settings_for(registry, devices))
    empty = Settings.from_options({"weather_entity": "weather.home", "air_source": "waqi"})
    assert needs(empty)["qualite_air"] == "une station WAQI qui donne l’indice de qualité de l’air"


# ---- Open-Meteo's answer ----

def test_open_meteo_answer_gathered_by_local_day() -> None:
    data = forecast([25, None, 45])
    assert data.days[datetime(2026, 10, 19).date()]["air"] == 45
    with pytest.raises(ValueError):
        open_meteo.parse({"error": True, "reason": "bad"}, NOW)


def test_open_meteo_is_asked_once_an_hour_and_ten_minutes_after_a_failure() -> None:
    data = forecast([30])
    assert not open_meteo.due(data, data.fetched, data.fetched + timedelta(minutes=59))
    assert open_meteo.due(data, data.fetched, data.fetched + timedelta(hours=1))
    assert not open_meteo.due(None, NOW, NOW + timedelta(minutes=5))
    assert open_meteo.due(None, NOW, NOW + timedelta(minutes=10))
    assert open_meteo.params(43.4512345, 5.4698765, PARIS)["latitude"] == "43.451"
