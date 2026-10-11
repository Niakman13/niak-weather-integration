"""The catalogue of sensors, the alerts over time and the forecast for a window, on the three situations of the catalogue's mock-up."""
from dataclasses import dataclass, field
from datetime import datetime, time, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import pytest

from engine.catalogue import Item, night_end, rain_between
from engine.compute import compute
from engine.forecast import Day, Hour, Units, engine_rows
from engine.prevision import NoForecast, forecast_window, window
from engine.settings import Settings
from engine.watch import AlertWatch

PARIS = ZoneInfo("Europe/Paris")


@dataclass
class State:
    state: str
    attributes: dict[str, Any] = field(default_factory=dict)


def sensor(value: Any, unit: str = "") -> State:
    return State(str(value), {"unit_of_measurement": unit})


STATION = {"temperature_entity": "sensor.t", "humidity_entity": "sensor.h", "wind_speed_entity": "sensor.wind", "wind_gust_entity": "sensor.gust",
           "rain_rate_entity": "sensor.rate", "uv_index_entity": "sensor.uv", "solar_radiation_entity": "sensor.solar", "station_history": False}


def run(now: datetime, readings: dict[str, Any], hours: list[Hour], days: list[Day] = (), condition: str = "sunny", options: dict[str, Any] | None = None,
        extra: dict[str, State] | None = None, elevation: float = 30):
    units = {"sensor.t": "°C", "sensor.h": "%", "sensor.wind": "km/h", "sensor.gust": "km/h", "sensor.rate": "mm/h", "sensor.uv": "", "sensor.solar": "W/m²"}
    states = {"weather.home": State(condition, {"temperature": readings.get("sensor.t"), "humidity": readings.get("sensor.h"), "temperature_unit": "°C",
                                                "wind_speed_unit": "km/h", "attribution": "Météo-France"}),
              "sun.sun": State("above_horizon", {"elevation": elevation, "next_rising": "2026-10-12T05:45:00+00:00",
                                                 "next_setting": "2026-10-11T17:00:00+00:00"}),
              **{k: sensor(v, units[k]) for k, v in readings.items()}, **(extra or {})}
    settings = Settings.from_options({"weather_entity": "weather.home", "location": "Gardanne", **STATION, **(options or {})})
    return compute(states.get, settings, hours, list(days), {}, {}, [], None, now, PARIS).catalogue


def hourly(start: datetime, rows: list[tuple]) -> list[Hour]:
    """One hour per row from `start`: (temperature, precipitation, condition[, gust])."""
    return [Hour(time=start + timedelta(hours=i), temperature=r[0], precipitation=r[1], condition=r[2], wind_speed=10,
                 wind_gust=r[3] if len(r) > 3 else 20, humidity=60) for i, r in enumerate(rows)]


# Été caniculaire, 15 h.
SUMMER = datetime(2026, 7, 21, 15, 0, tzinfo=PARIS)
SUMMER_HOURS = hourly(SUMMER, [(37, 0, "sunny")] * 4 + [(33, 0, "sunny")] * 4 + [(26, 0, "clear-night")] * 8 + [(24, 0, "clear-night")] * 3
                      + [(30, 0, "sunny")] * 6 + [(38, 0, "sunny")] * 6)
SUMMER_DAYS = [Day(SUMMER.replace(hour=0), "sunny", 37, 22, 0), Day(SUMMER.replace(hour=0) + timedelta(days=1), "sunny", 38, 24, 0)]
# Nuit de gel, 21 h.
WINTER = datetime(2026, 1, 14, 21, 0, tzinfo=PARIS)
WINTER_HOURS = hourly(WINTER, [(1, 0, "clear-night")] * 4 + [(-1, 0, "clear-night")] * 4 + [(-2, 0, "clear-night")] * 2 + [(4, 0, "sunny")] * 8)
WINTER_DAYS = [Day(WINTER.replace(hour=0), "sunny", 8, -1, 0), Day(WINTER.replace(hour=0) + timedelta(days=1), "sunny", 9, -2, 0)]
# Orage d'automne, 16 h.
AUTUMN = datetime(2026, 10, 11, 16, 0, tzinfo=PARIS)
AUTUMN_HOURS = hourly(AUTUMN, [(16, 6.5, "lightning-rainy", 75), (15, 9, "lightning-rainy", 70), (15, 4, "lightning-rainy", 60), (14, 2, "rainy"),
                               (13, 0.5, "rainy"), (13, 0, "cloudy")] + [(12, 0, "cloudy")] * 18)


def test_summer_heat() -> None:
    c = run(SUMMER, {"sensor.t": 37, "sensor.h": 30, "sensor.wind": 8, "sensor.gust": 22, "sensor.rate": 0, "sensor.uv": 9, "sensor.solar": 820},
            SUMMER_HOURS, SUMMER_DAYS)
    assert c["canicule"].value is True and c["canicule"].level == 2
    assert "°C ressentis" in c["canicule"].reason and "38 °C prévus demain" in c["canicule"].reason
    assert c["uv_fort"].value is True and c["uv_fort"].level == 2
    assert (c["orage"].value, c["vent_fort"].value, c["pluie_forte"].value, c["gel"].value) == (False, False, False, False)
    assert c["pluie_en_cours"].value is False and c["pluie_6h"].value == 0 and c["pluie_6h"].reason == "Sec"
    assert c["maximale_demain"].value == 38
    assert c["minimale_nuit"].value == 24 and c["minimale_nuit"].reason.startswith("Nuit chaude")
    assert c["degres_jours_clim"].value == 7.5 and c["degres_jours_chauffe"].value == 0
    assert c["degres_jours_clim"].extra["demain"] == 9
    assert c["sechage_linge"].value == "excellent" and c["sechage_linge"].reason.startswith("Jusqu’à 19 h")
    assert c["ensoleillement_demain"].value == 100
    assert c["temps_observe"].value == "sunny"


def test_frost_night() -> None:
    c = run(WINTER, {"sensor.t": 3.1, "sensor.h": 55, "sensor.wind": 4, "sensor.gust": 8, "sensor.rate": 0}, WINTER_HOURS, WINTER_DAYS,
            condition="clear-night", options={"uv_index_entity": ""}, elevation=-30)
    assert c["gel"].value is True and c["gel"].level == 1 and "−2 °C prévus" in c["gel"].reason.replace("-", "−")
    assert c["givre_pare_brise"].value is True and "ciel clair" in c["givre_pare_brise"].reason
    assert c["minimale_nuit"].value == -2 and c["minimale_nuit"].reason == "Vers 5 h"
    assert c["degres_jours_chauffe"].value == 14.5
    assert c["sechage_linge"].value == "mauvais"
    assert c["uv_fort"].value is None and c["uv_fort"].reason == "Pas de capteur UV"
    assert c["canicule"].value is False


def test_autumn_storm() -> None:
    c = run(AUTUMN, {"sensor.t": 17, "sensor.h": 95, "sensor.wind": 32, "sensor.gust": 68, "sensor.rate": 9.4}, AUTUMN_HOURS,
            condition="lightning-rainy")
    assert c["orage"].value is True and c["orage"].reason == "Orage en cours, jusqu’à 19 h"
    assert c["orage"].end == AUTUMN + timedelta(hours=3)
    assert c["vent_fort"].value is True and c["vent_fort"].level == 2 and c["vent_fort"].reason == "Rafales mesurées à 68 km/h"
    assert c["pluie_forte"].value is True and c["pluie_forte"].reason == "9,4 mm/h mesurés ; 22 mm prévus d’ici 21 h"
    assert c["pluie_en_cours"].value is True and c["pluie_en_cours"].reason == "9,4 mm/h mesurés"
    assert c["pluie_heure"].value == 6.5 and c["pluie_6h"].value == 22
    assert c["pluie_6h"].reason == "Pluie de 16 h à 21 h"
    assert c["temps_observe"].value == "pouring" and c["temps_observe"].source == "station"
    assert c["sechage_linge"].value == "impossible"
    assert c["rafales_6h"].value == 75


def test_unknown_stays_unknown_without_forecast_nor_station() -> None:
    c = run(AUTUMN, {}, [], condition="rainy", options={k: "" for k in STATION if k.endswith("_entity")})
    for key in ("orage", "pluie_6h", "minimale_nuit", "maximale_demain", "rafales_6h", "givre_pare_brise", "degres_jours_chauffe", "ensoleillement_demain",
                "vigilance", "qualite_air", "pollens", "pluie_7j"):
        assert c[key].value is None, key
    # The bulletin still says whether it rains now.
    assert c["pluie_en_cours"].value is True and c["pluie_en_cours"].source == "bulletin"


def test_vigilance_and_atmo() -> None:
    extra = {"sensor.vigilance": State("Orange", {"attribution": "Data provided by Météo-France", "Orages": "Orange", "Vent violent": "Jaune"}),
             "sensor.atmo": State("4", {"Libellé": "Mauvais", "Date de publication": "2026-10-11"}),
             "sensor.o3": State("4", {"Libellé": "Mauvais"}), "sensor.no2": State("2", {"Libellé": "Moyen"})}
    c = run(AUTUMN, {"sensor.t": 17}, AUTUMN_HOURS, options={"vigilance_entity": "sensor.vigilance", "atmo_air_entity": "sensor.atmo",
                                                             "atmo_o3_entity": "sensor.o3", "atmo_no2_entity": "sensor.no2"}, extra=extra)
    assert c["vigilance"].value == "orange" and c["vigilance"].level == 2
    assert c["vigilance"].extra["phenomenes"] == {"Orages": "orange", "Vent violent": "jaune"}
    assert c["qualite_air"].value == 4 and c["qualite_air"].extra["libelle"] == "Mauvais"
    assert "Ozone" in c["qualite_air"].reason or "O₃" in c["qualite_air"].reason


def test_rain_between_counts_the_part_of_each_hour_inside_the_window() -> None:
    hours = [Hour(time=AUTUMN, precipitation=4), Hour(time=AUTUMN + timedelta(hours=1), precipitation=2)]
    assert rain_between(hours, AUTUMN + timedelta(minutes=15), AUTUMN + timedelta(minutes=75)) == (3.5, False)
    assert rain_between(hours, AUTUMN, AUTUMN + timedelta(hours=3)) == (6, True)
    assert rain_between(hours, AUTUMN + timedelta(hours=5), AUTUMN + timedelta(hours=6)) == (None, True)


def test_the_night_ends_the_next_morning() -> None:
    assert night_end(datetime(2026, 10, 11, 23, 0, tzinfo=PARIS), PARIS) == datetime(2026, 10, 12, 10, 0, tzinfo=PARIS)
    assert night_end(datetime(2026, 10, 11, 5, 0, tzinfo=PARIS), PARIS) == datetime(2026, 10, 12, 10, 0, tzinfo=PARIS)
    assert night_end(datetime(2026, 10, 11, 3, 0, tzinfo=PARIS), PARIS) == datetime(2026, 10, 11, 10, 0, tzinfo=PARIS)


def item(value: Any, level: int = 1, reason: str = "x") -> dict[str, Item]:
    return {"vent_fort": Item(value, reason, "station", level=level)}


def test_an_alert_starts_at_once_and_ends_after_the_hold() -> None:
    watch, t = AlertWatch(), AUTUMN
    assert [(e.type, e.phase) for e in watch.update(item(True), t)] == [("vent_fort", "debut")]
    assert watch.update(item(False), t + timedelta(minutes=5)) == []
    assert watch.update(item(True), t + timedelta(minutes=10)) == []  # a gust around the threshold: still the same alert
    assert watch.update(item(False), t + timedelta(minutes=20)) == []
    ended = watch.update(item(False), t + timedelta(minutes=26))
    assert [(e.type, e.phase, e.text) for e in ended] == [("vent_fort", "fin", "Le vent est retombé")]
    assert watch.states() == {}


def test_unknown_never_ends_an_alert_and_the_state_survives_a_restart() -> None:
    watch = AlertWatch()
    watch.update(item(True, 2), AUTUMN)
    assert watch.update(item(None), AUTUMN + timedelta(hours=2)) == []
    again = AlertWatch(watch.as_dict())
    assert again.states()["vent_fort"].level == 2
    assert again.update(item(True, 2), AUTUMN + timedelta(hours=3)) == []


def test_a_level_rises_at_once_and_falls_after_the_hold() -> None:
    watch = AlertWatch()
    watch.update(item(True, 1), AUTUMN)
    assert [(e.phase, e.level) for e in watch.update(item(True, 2), AUTUMN + timedelta(minutes=1))] == [("change", 2)]
    assert watch.update(item(True, 1), AUTUMN + timedelta(minutes=5)) == []
    assert [(e.phase, e.level) for e in watch.update(item(True, 1), AUTUMN + timedelta(minutes=17))] == [("change", 1)]


def test_the_vigilance_ends_as_soon_as_it_is_lifted() -> None:
    watch = AlertWatch()
    watch.update({"vigilance": Item("jaune", "Vigilance jaune", "vigilance", level=1)}, AUTUMN)
    events = watch.update({"vigilance": Item("verte", "Aucune vigilance", "vigilance", level=0)}, AUTUMN + timedelta(minutes=1))
    assert [(e.phase, e.text) for e in events] == [("fin", "Vigilance levée")]


def test_forecast_window_for_the_school_run() -> None:
    answer = forecast_window(AUTUMN_HOURS, [], AUTUMN + timedelta(minutes=15), AUTUMN + timedelta(hours=1), PARIS)
    assert answer["pluie"] == 4.9 and answer["condition"] == "lightning-rainy" and answer["rafales_max"] == 75
    assert answer["texte"] == "Orages et pluie, 4,9 mm de pluie, rafales à 75 km/h, 16 °C"
    assert answer["partiel"] is False and answer["ressenti_min"] is not None


def test_forecast_window_beyond_the_hours_uses_the_days() -> None:
    far = AUTUMN + timedelta(days=4)
    answer = forecast_window(AUTUMN_HOURS, [Day(far.replace(hour=0), "rainy", 18, 9, 6)], far, far + timedelta(hours=1), PARIS)
    assert answer["partiel"] is True and answer["texte"] == "Pluvieux, 6 mm de pluie sur la journée, 9 à 18 °C"
    with pytest.raises(NoForecast):
        forecast_window([], [], far, far + timedelta(hours=1), PARIS)


def test_engine_rows_converts_the_measures_and_keeps_the_rest() -> None:
    rows = engine_rows([{"datetime": "2026-10-11T16:00:00+02:00", "temperature": 59, "precipitation": 0.1, "wind_speed": 10, "pressure": 30,
                         "humidity": 80, "condition": "rainy", "cloud_coverage": 90}], Units("°F", "in", "mph", "inHg"))
    assert rows == [{"datetime": "2026-10-11T16:00:00+02:00", "temperature": 15, "precipitation": 2.54, "wind_speed": 16.09, "pressure": 1015.92,
                     "humidity": 80, "condition": "rainy", "cloud_coverage": 90}]


def test_window_from_times_written_by_the_user() -> None:
    evening = datetime(2026, 10, 11, 18, 0, tzinfo=PARIS)
    day = lambda d, h, m=0: datetime(2026, 10, d, h, m, tzinfo=PARIS)
    assert window(time(19, 0), time(20, 0), evening, PARIS) == (day(11, 19), day(11, 20))
    assert window(time(16, 15), time(17, 0), evening, PARIS) == (day(12, 16, 15), day(12, 17))  # already over today: tomorrow
    assert window(time(22, 0), time(2, 0), evening, PARIS) == (day(11, 22), day(12, 2))
    assert window(datetime(2026, 10, 13, 8, 0), datetime(2026, 10, 13, 9, 0), evening, PARIS) == (day(13, 8), day(13, 9))


def test_rain_tomorrow_in_the_daytime_says_tomorrow() -> None:
    evening = datetime(2026, 10, 11, 18, 0, tzinfo=PARIS)
    hours = hourly(evening, [(15, 0, "cloudy")] * 6 + [(13, 1, "rainy")] * 2 + [(12, 0, "cloudy")] * 10 + [(16, 2, "rainy")] * 2 + [(16, 0, "cloudy")] * 4)
    c = run(evening, {"sensor.t": 15}, hours)
    assert c["pluie_6h"].reason == "Sec"
    assert c["pluie_24h_prevue"].value == 6 and c["pluie_24h_prevue"].reason == "Pluie de minuit à 2 h, puis demain de midi à 14 h"
    assert run(evening, {"sensor.t": 15}, hours[:6] + [Hour(time=h.time) for h in hours[6:8]] + hours[8:])["pluie_24h_prevue"].reason == "Pluie demain de midi à 14 h"
