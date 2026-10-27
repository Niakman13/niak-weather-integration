"""Blitzortung's strikes: how near the storm is, where, whether it comes closer, and what that changes for the Orage sensor, the sky and the brief."""
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from engine import lightning
from engine.compute import compute
from engine.detection import detect_sources, lightning_candidates
from engine.forecast import Hour
from engine.lightning import Lightning, Strike, keep, read, strike_of
from engine.settings import Settings
from engine.trends import Change

PARIS = ZoneInfo("Europe/Paris")
NOW = datetime(2026, 10, 21, 16, 0, tzinfo=PARIS)
T = NOW.timestamp()
GARDANNE = (43.455, 5.469)


@dataclass
class State:
    state: str
    attributes: dict[str, Any] = field(default_factory=dict)
    entity_id: str = ""


def strikes(*rows: tuple[float, float, float | None]) -> list[Strike]:
    """(minutes ago, km, azimuth)."""
    return [Strike(T - minutes * 60, km, azimuth) for minutes, km, azimuth in rows]


# ── Reading the strikes ─────────────────────────────────────────────────────

def test_no_strike_says_no_storm_but_is_not_unknown():
    seen = read([], T)
    assert seen.available and seen.nearest is None and not seen.near and seen.level == 0 and seen.text == ""


def test_a_storm_coming_closer_from_the_south_west():
    seen = read(strikes((18, 38, 225), (16, 36, 220), (14, 34, 230), (8, 20, 225), (5, 16, 222), (2, 12, 228)), T)
    assert seen.near and seen.trend == lightning.APPROACHING and seen.level == 2
    assert seen.text == "Orage à 12 km au sud-ouest, il se rapproche"
    assert seen.count == 6 and seen.near_count == 3


def test_a_storm_moving_away_stays_on_while_within_30_km():
    seen = read(strikes((18, 10, 90), (16, 12, 90), (14, 11, 85), (8, 22, 95), (5, 25, 90), (2, 28, 92)), T)
    assert seen.near and seen.trend == lightning.LEAVING and seen.level == 2  # the nearest of the 20 minutes was 10 km
    assert seen.text == "Orage à 10 km à l’est, il s’éloigne"


def test_strikes_all_around_give_no_direction():
    seen = read(strikes((3, 20, 0), (3, 22, 90), (2, 21, 180), (1, 23, 270)), T)
    assert seen.direction == "" and seen.text == "Orage à 20 km"


def test_a_far_storm_is_only_worth_knowing():
    seen = read(strikes((5, 62, 0), (2, 60, 5)), T)
    assert not seen.near and seen.level == 0 and seen.text == "Orage au loin : 60 km au nord"


def test_strikes_older_than_20_minutes_no_longer_count():
    assert read(strikes((25, 5, 0)), T).nearest is None


def test_a_strike_from_the_distance_sensor():
    sw = State("12.4", {"unit_of_measurement": "km", "lat": 43.38, "lon": 5.37})
    strike = strike_of(sw, T, *GARDANNE)
    assert strike is not None and strike.distance == 12.4 and lightning.direction_words(strike.azimuth) == "au sud-ouest"
    assert strike_of(State("unknown"), T) is None and strike_of(State("unavailable"), T) is None
    assert strike_of(State("5", {"unit_of_measurement": "mi"}), T).distance == 5 * 1.609344
    # Without the strike's position, the direction stays unknown.
    assert strike_of(State("12.4", {"unit_of_measurement": "km"}), T, *GARDANNE).azimuth is None


def test_kept_an_hour_a_live_strike_wins_over_its_recorded_copy():
    recorded = lightning.from_history([Change(T - 120, "15.0"), Change(T - 4000, "8.0"), Change(T - 60, "unknown")])
    assert [s.distance for s in recorded] == [15.0, 8.0]
    kept = keep([*recorded, Strike(T - 120, 15.0, 200.0)], T)
    assert kept == [Strike(T - 120, 15.0, 200.0)]


# ── What it changes ─────────────────────────────────────────────────────────

SUNNY = [Hour(time=NOW + timedelta(hours=i), temperature=20, precipitation=0, condition="sunny", wind_speed=10, wind_gust=20) for i in range(8)]
STORMY = [Hour(time=NOW + timedelta(hours=i), temperature=20, precipitation=2, condition="lightning-rainy", wind_speed=10, wind_gust=20)
          for i in range(3)] + SUNNY[3:]


def run(seen: Lightning | None, hours=SUNNY, condition: str = "sunny"):
    states = {"weather.home": State(condition, {"temperature": 20, "temperature_unit": "°C", "attribution": "Météo-France"}),
              "sun.sun": State("above_horizon", {"elevation": 30}), "sensor.blitzortung_distance": State("unknown")}
    settings = Settings.from_options({"weather_entity": "weather.home", "lightning_entity": "sensor.blitzortung_distance"})
    return compute(states.get, settings, hours, [], {}, {}, [], None, NOW, PARIS, lightning=seen)


def test_strikes_within_30_km_turn_the_storm_on_without_any_forecast():
    result = run(read(strikes((4, 25, 180), (1, 22, 180)), T))
    storm = result.catalogue["orage"]
    assert storm.value is True and storm.source == "blitzortung" and storm.reason == "Orage à 22 km au sud"
    assert storm.extra["eclair_le_plus_proche_km"] == 22 and storm.extra["direction"] == "au sud"
    signal = next(s for s in result.brief.signals if s.key == "storm-near")
    assert signal.text == "Orage à 22 km au sud" and signal.severity == 1 and "Débranchez" in signal.explanation


def test_strikes_overhead_make_the_sky_a_storm():
    result = run(read(strikes((3, 6, 0)), T))
    assert result.view.now.condition == "lightning" and result.view.now.source == "Éclairs à 6 km · Blitzortung"
    assert result.catalogue["temps_observe"].value == "lightning" and result.catalogue["temps_observe"].source == "blitzortung"
    assert result.brief.signals[0].key == "storm-near" and result.brief.signals[0].severity == 2


def test_a_real_storm_replaces_the_forecast_one_in_the_brief():
    result = run(read(strikes((2, 18, 270)), T), STORMY, "lightning-rainy")
    keys = [s.key for s in result.brief.signals]
    assert "storm-near" in keys and "storm" not in keys
    # The forecast's end is kept.
    assert result.catalogue["orage"].end is not None


def test_a_forecast_storm_without_a_strike_stays_on_and_says_so():
    storm = run(read([], T), STORMY, "lightning-rainy").catalogue["orage"]
    assert storm.value is True and storm.reason.endswith("aucun éclair à moins de 30 km pour l’instant")


def test_a_silent_blitzortung_says_nothing_about_the_storm():
    storm = run(read([], T, available=False), STORMY, "lightning-rainy").catalogue["orage"]
    assert storm.value is True and "éclair" not in storm.reason and storm.extra == {}


def test_without_blitzortung_nothing_changes():
    result = run(None)
    assert result.catalogue["orage"].value is False and not any(s.key.startswith("storm-") for s in result.brief.signals)


def test_a_far_storm_is_information_not_an_alert():
    result = run(read(strikes((2, 55, 45)), T))
    assert result.catalogue["orage"].value is False
    signal = next(s for s in result.brief.signals if s.key == "storm-far")
    assert signal.severity == 0 and signal.text == "Orage au loin : 55 km au nord-est"


# ── Finding Blitzortung ─────────────────────────────────────────────────────

def test_blitzortung_distance_is_found_alone():
    found = [State("unknown", entity_id="sensor.blitzortung_distance"), State("unknown", entity_id="sensor.blitzortung_azimuth"),
             State("0", entity_id="sensor.blitzortung_counter")]
    registry = {"sensor.blitzortung_distance": {"platform": "blitzortung", "unique_id": "abc-distance", "translation_key": "distance"},
                "sensor.blitzortung_azimuth": {"platform": "blitzortung", "unique_id": "abc-azimuth", "translation_key": "azimuth"},
                "sensor.blitzortung_counter": {"platform": "blitzortung", "unique_id": "abc-counter", "translation_key": "counter"}}
    assert lightning_candidates(found, registry) == ["sensor.blitzortung_distance"]
    assert detect_sources(found, registry, {})["lightning_entity"] == "sensor.blitzortung_distance"
    # A choice already made, even empty, is kept.
    assert "lightning_entity" not in detect_sources(found, registry, {"lightning_entity": ""})


# ── The card's radar ────────────────────────────────────────────────────────

def radar(seen: Lightning):
    from engine.view import _lightning
    return _lightning(Settings(weather_entity="weather.home", lightning_entity="sensor.blitzortung_lightning_distance"), seen)


def test_the_radar_gets_every_strike_of_the_hour_oldest_first():
    v = radar(read(strikes((50, 40, None), (18, 38, 225), (8, 20, 225), (5, 16, 222), (2, 12, 228)), T, month=41))
    assert v.strikes == ((50, 40, None), (18, 38, 225), (8, 20, 225), (5, 16, 222), (2, 12, 228))
    assert (v.hour_count, v.recent_count, v.last_minutes, v.month) == (5, 3, 2, 41)
    assert v.nearest == 12 and v.direction == "au sud-ouest" and v.step == 2 and v.headline == "L’orage est proche."


def test_the_four_steps_follow_the_orage_sensor():
    assert radar(read(strikes((3, 6, 40), (1, 8, 45)), T)).step == 3
    assert radar(read(strikes((3, 6, 40), (1, 8, 45)), T)).headline == "L’orage est sur vous."
    assert radar(read(strikes((4, 25, 90), (2, 27, 92)), T)).step == 1
    far = radar(read(strikes((4, 60, 0), (2, 62, 5)), T))
    assert far.step == 0 and far.headline == "Orage au loin."


def test_a_quiet_hour_says_since_when_or_that_there_was_nothing():
    calmed = radar(read(strikes((35, 12, 200)), T))
    assert calmed.step == 0 and calmed.headline == "Plus d’éclair depuis 35 min." and calmed.nearest == 12
    quiet = radar(read([], T))
    assert quiet.headline == "Aucun éclair dans l’heure." and quiet.strikes == () and quiet.nearest is None and quiet.month is None


def test_a_silent_sensor_is_said_and_no_radar_without_blitzortung():
    assert radar(read([], T, available=False)).headline.startswith("Blitzortung ne répond pas")
    from engine.view import _lightning
    assert _lightning(Settings(weather_entity="weather.home"), read([], T)) is None
