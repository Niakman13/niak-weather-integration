"""Current sky and measurement tiles (ported from the card's current-weather and current-measurements tests)."""
from dataclasses import dataclass, field, replace
from datetime import datetime, timezone
from typing import Any
from zoneinfo import ZoneInfo

import pytest

from engine.current import current_metrics, current_weather, meaningful_comfort
from engine.forecast import parse_hours
from engine.local import LocalWeather, build_local
from engine.settings import Settings

PARIS = ZoneInfo("Europe/Paris")
NOW = datetime(2026, 10, 5, 12, tzinfo=timezone.utc)


@dataclass
class State:
    state: str
    attributes: dict[str, Any] = field(default_factory=dict)


def local(states: dict[str, State], settings: Settings, feels: float | None = None, rate: float | None = None, unavailable: bool = False) -> LocalWeather:
    """What the engine knows from these states, with the feel or the rain rate pinned when a case needs it."""
    w = build_local(states.get, settings, [], {}, NOW, PARIS)
    if feels is not None:
        w = replace(w, feel=replace(w.feel, value=feels))
    if rate is not None:
        w = replace(w, rain=replace(w.rain, rate=rate))
    return replace(w, temperature=None) if unavailable else w


# ── Current weather ──────────────────────────────────────────────────────────

def home(condition: str = "sunny", **extra: State) -> dict[str, State]:
    return {"weather.home": State(condition, {"temperature": 20, "temperature_unit": "°C"}), **{k.replace("__", "."): v for k, v in extra.items()}}


def sky(states: dict[str, State], options: dict[str, str] | None = None, **pinned: Any):
    settings = Settings.from_options({"weather_entity": "weather.home", **(options or {})})
    return current_weather(states.get, settings, local(states, settings, **{"feels": 22, **pinned}))


def test_does_not_animate_a_future_storm_or_infer_one_from_an_alert() -> None:
    now = sky(home())
    assert (now.condition, now.temperature, now.feels, now.source, now.phase) == ("sunny", 20, 22, "Ciel · bulletin météo", "unknown")


@pytest.mark.parametrize("condition", ["sunny", "clear-night", "partlycloudy", "cloudy", "rainy", "pouring", "lightning", "lightning-rainy", "snowy",
                                       "snowy-rainy", "hail", "fog", "windy", "windy-variant", "exceptional"])
def test_accepts_every_condition_of_the_weather_entity(condition: str) -> None:
    assert sky(home(condition)).condition == condition


def test_normalises_condition_aliases() -> None:
    assert sky(home("lightning_rainy")).condition == "lightning-rainy"
    assert sky(home("clear")).condition == "sunny"


@pytest.mark.parametrize("state", ["unknown", "unavailable", "invented"])
def test_neutral_scene_without_a_fake_zero(state: str) -> None:
    now = sky(home(state), unavailable=True)
    assert (now.condition, now.label, now.temperature, now.feels) == ("unknown", "Météo indisponible", 20 if state == "invented" else None, None)


def test_uses_observed_rain_with_converted_units() -> None:
    now = sky(home(sensor__rain=State(".2", {"unit_of_measurement": "in/h"})), {"rain_rate_entity": "sensor.rain"})
    assert (now.condition, now.source, now.condition_entity) == ("pouring", "Pluie mesurée ici", "sensor.rain")


def test_does_not_replace_an_unavailable_rain_gauge() -> None:
    assert sky(home(sensor__rain=State("unavailable")), {"rain_rate_entity": "sensor.rain"}).condition == "sunny"


def test_does_not_animate_rain_when_the_gauge_measures_zero() -> None:
    now = sky(home("rainy", sensor__rain=State("0")), {"rain_rate_entity": "sensor.rain"})
    assert (now.condition, now.label, now.source) == ("cloudy", "Nuageux, sans pluie mesurée", "Pas de pluie mesurée · ciel du bulletin")


def test_keeps_snow_and_hail_distinct_from_rain_gauge_readings() -> None:
    for condition in ("snowy", "snowy-rainy", "hail"):
        assert sky(home(condition), rate=15).condition == condition


def test_labels_a_storm_as_the_bulletin_s_not_measured_lightning() -> None:
    assert sky(home("lightning"), rate=1).source == "Pluie mesurée · orage du bulletin"


def test_can_show_measured_rain_without_a_sky_bulletin() -> None:
    assert sky(home("unavailable"), rate=1).condition == "rainy"


def test_uses_the_configured_thermometer_and_converts_fahrenheit() -> None:
    now = sky(home(sensor__temp=State("68", {"unit_of_measurement": "°F"})), {"temperature_entity": "sensor.temp"})
    assert (now.temperature, now.temperature_entity, now.temperature_source) == (pytest.approx(20), "sensor.temp", "Station locale")


def test_labels_the_bulletin_fallback_when_the_thermometer_is_missing() -> None:
    now = sky(home(), {"temperature_entity": "sensor.missing"})
    assert (now.temperature, now.temperature_entity, now.temperature_source) == (20, "weather.home", "Bulletin météo")


def test_keeps_actual_zero_and_negative_temperatures() -> None:
    for t in (0, -15):
        assert sky({"weather.home": State("cloudy", {"temperature": t})}).temperature == t


@pytest.mark.parametrize(("elevation", "phase"), [(20, "day"), (1, "twilight"), (-12, "night")])
def test_sun_elevation_selects_the_phase(elevation: float, phase: str) -> None:
    now = sky(home(sun__sun=State("below_horizon", {"elevation": elevation})))
    assert (now.phase, now.condition) == (phase, "clear-night" if phase == "night" else "sunny")


def test_uses_the_configured_sun_elevation_and_never_invents_sunrise_times() -> None:
    assert sky(home("cloudy", sensor__elev=State("-15")), {"sun_elevation_entity": "sensor.elev"}).phase == "night"
    assert sky(home("cloudy")).phase == "unknown"


def test_current_sun_elevation_overrides_a_lingering_clear_night_bulletin() -> None:
    now = sky(home("clear-night", sun__sun=State("above_horizon", {"elevation": 35})))
    assert (now.phase, now.condition) == ("day", "sunny")


def test_converts_wind_units_for_the_animation_speed() -> None:
    assert sky(home("windy", sensor__wind=State("10", {"unit_of_measurement": "m/s"})), {"wind_speed_entity": "sensor.wind"}).wind == 36


def test_shows_the_temperature_trend_only_when_it_moves() -> None:
    settings = Settings.from_options({"weather_entity": "weather.home"})
    states = home()
    assert current_weather(states.get, settings, local(states, settings), 0.4).trend == 0.4
    assert current_weather(states.get, settings, local(states, settings), 0.05).trend is None
    assert current_weather(states.get, settings, local(states, settings, rate=5)).dark_sky


# ── Measurement tiles ────────────────────────────────────────────────────────

CITY = {"attribution": "Météo-France", "temperature": 20, "temperature_unit": "°C", "wind_speed": 12, "wind_speed_unit": "km/h",
        "pressure": 1012, "pressure_unit": "hPa"}


def city(**extra: State) -> dict[str, State]:
    return {"weather.city": State("cloudy", CITY), **{k.replace("__", "."): v for k, v in extra.items()}}


def metrics(states: dict[str, State], options: dict[str, str] | None = None, hours=(), now: datetime = NOW):
    settings = Settings.from_options({"weather_entity": "weather.city", **(options or {})})
    return {m.key: m for m in current_metrics(states.get, settings, local(states, settings), hours, now)}


def test_provides_the_four_tiles_without_a_station() -> None:
    result = metrics(city())
    assert list(result) == ["temperature", "wind", "rain", "pressure"]
    assert all(m.source == "Météo-France" and m.entity == "weather.city" for m in result.values())
    assert (result["rain"].text, result["rain"].value, result["rain"].unit) == ("Temps sec", None, "")


def test_never_invents_rainfall_from_the_current_condition() -> None:
    result = metrics({"weather.city": State("rainy", {"attribution": "Météo-France", "temperature": 20})})
    assert (result["rain"].text, result["rain"].description, result["rain"].value) == ("Pluie", "État annoncé dans le bulletin", None)
    assert all(m.description != "Depuis minuit" for m in result.values())


def test_prefers_real_local_zeros_and_keeps_the_provider_for_other_tiles() -> None:
    result = metrics(city(sensor__wind=State("0", {"unit_of_measurement": "m/s"}), sensor__rain=State("0", {"unit_of_measurement": "mm/h"})),
                     {"wind_speed_entity": "sensor.wind", "rain_rate_entity": "sensor.rain"})
    assert (result["wind"].value, result["wind"].source, result["wind"].entity) == (0, "Station locale", "sensor.wind")
    assert (result["rain"].value, result["rain"].unit, result["rain"].source, result["rain"].entity) == (0, "mm/h", "Station locale", "sensor.rain")
    assert result["pressure"].source == "Météo-France"


def test_labels_a_missing_station_sensor_fallback_and_opens_the_provider() -> None:
    t = metrics(city(sensor__temp=State("unavailable")), {"temperature_entity": "sensor.temp"})["temperature"]
    assert (t.value, t.source, t.entity, t.fallback) == (20, "Météo-France", "weather.city", True)


def test_does_not_read_stale_attributes_of_an_unavailable_weather_entity() -> None:
    result = metrics({"weather.city": State("unavailable", {"temperature": 99, "wind_speed": 90, "pressure": 999})}, {"temperature_entity": "sensor.missing"})
    assert list(result) == ["temperature"]
    t = result["temperature"]
    assert (t.value, t.source, t.entity, t.fallback) == (None, "Station locale", "sensor.missing", False)


def test_keeps_rain_since_midnight_apart_from_intensity_and_forecasts() -> None:
    rain = metrics(city(sensor__total=State("2", {"unit_of_measurement": "mm"}), sensor__rate=State("0.1", {"unit_of_measurement": "in/h"})),
                   {"daily_rain_entity": "sensor.total", "rain_rate_entity": "sensor.rate"})["rain"]
    assert (rain.value, rain.unit, rain.description, rain.source, rain.entity) == (2, "mm", "Depuis minuit", "Station locale", "sensor.total")
    assert "2,5 mm/h" in rain.detail


def test_labels_near_term_forecast_rain_instead_of_a_daily_total() -> None:
    hours = parse_hours([{"datetime": "2026-10-05T12:30:00Z", "precipitation": 1.2}, {"datetime": "2026-10-05T11:00:00Z", "precipitation": 99}])
    rain = metrics(city(), hours=hours)["rain"]
    assert rain.detail == "1,2 mm prévus sur le prochain créneau"
    assert rain.description != "Depuis minuit"


def test_converts_provider_units_consistently() -> None:
    result = metrics({"weather.city": State("cloudy", {"temperature": 68, "temperature_unit": "°F", "wind_speed": 10, "wind_speed_unit": "m/s",
                                                       "pressure": 101.2, "pressure_unit": "kPa"})})
    assert (result["temperature"].value, result["wind"].value, result["pressure"].value) == (20, 36, 1012)


def comfort(states: dict[str, State], options: dict[str, str] | None = None) -> bool:
    settings = Settings.from_options({"weather_entity": "weather.city", **(options or {})})
    return meaningful_comfort(states.get, settings, local(states, settings))


def test_hides_the_feel_with_only_a_weather_provider() -> None:
    assert not comfort(city())


def test_keeps_the_feel_with_a_thermometer_or_the_bulletin_humidity_without_a_station() -> None:
    assert comfort(city(sensor__temp=State("20")), {"temperature_entity": "sensor.temp"})
    humid = {"weather.city": State("cloudy", {**CITY, "humidity": 60})}
    assert comfort(humid)
    # A configured but unavailable thermometer is never replaced by the bulletin.
    assert not comfort({**humid, "sensor.temp": State("unavailable")}, {"temperature_entity": "sensor.temp"})
