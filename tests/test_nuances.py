"""Météo-France's nuances of the sky: from its own description first, else from the figures."""
import pytest

from engine.current import current_weather
from engine.nuances import DESCRIPTIONS, sky_detail
from engine.settings import Settings
from test_current import State, home, local, sky

SETTINGS = Settings.from_options({"weather_entity": "weather.home"})
SENSOR = "sensor.home_original_condition"


@pytest.mark.parametrize("description, condition, detail", [
    ("Bruine / Pluie faible", "rainy", "drizzle"), ("Rares averses", "rainy", "showers-light"), ("Averses", "rainy", "showers"),
    ("Pluie verglaçante", "snowy-rainy", "freezing-rain"), ("Brouillard givrant", "fog", "freezing-fog"), ("Bancs de Brouillard", "fog", "patches"),
    ("Risque d’orages", "lightning", "storm-risk"), ("Risque d'orages", "lightning", "storm-risk"), ("Orage avec grêle", "lightning", "storm-hail"),
    ("Averses orageuses", "lightning-rainy", "storm-showers"), ("Ciel voilé nuit", "partlycloudy", "veil"), ("Couvert", "cloudy", "overcast"),
    ("Neige forte", "snowy", "heavy-snow"), ("Quelques flocons", "snowy", "flurries"), ("Pluie", "rainy", ""), ("Éclaircies", "partlycloudy", ""),
])
def test_reads_meteo_france_descriptions(description: str, condition: str, detail: str) -> None:
    assert sky_detail(condition, description, None, None) == detail


def test_covers_the_descriptions_of_the_twelve_conditions() -> None:
    assert len(DESCRIPTIONS) >= 45
    assert {c for c, _ in DESCRIPTIONS.values()} == {"sunny", "clear-night", "partlycloudy", "cloudy", "fog", "rainy", "pouring", "snowy-rainy",
                                                     "snowy", "hail", "lightning", "lightning-rainy"}


def test_a_description_that_disagrees_with_the_sky_shown_is_ignored() -> None:
    # The rain gauge measured a downpour: « Bruine » no longer describes it.
    assert sky_detail("pouring", "Bruine", 6, 12) == ""


def test_without_a_description_the_figures_give_the_nuance() -> None:
    assert sky_detail("rainy", None, 0.2, 10) == "drizzle"
    assert sky_detail("rainy", None, 1.4, 10) == ""
    assert sky_detail("snowy-rainy", None, 1, -1) == "freezing-rain"
    assert sky_detail("snowy-rainy", None, 1, 2) == ""
    assert sky_detail("snowy", None, 0.1, -2) == "flurries"
    assert sky_detail("snowy", None, 4, -2) == "heavy-snow"
    assert sky_detail("sunny", None, None, 20) == ""


def test_the_current_sky_carries_the_nuance_of_the_sensor() -> None:
    states = home("rainy", sensor__home_original_condition=State("Bruine"))
    now = current_weather(states.get, SETTINGS, local(states, SETTINGS, feels=12), None, SENSOR)
    assert (now.condition, now.detail) == ("rainy", "drizzle")


def test_an_unavailable_sensor_falls_back_on_the_hour_forecast() -> None:
    states = home("rainy", sensor__home_original_condition=State("unavailable"))
    now = current_weather(states.get, SETTINGS, local(states, SETTINGS, feels=12), None, SENSOR, 0.3)
    assert now.detail == "drizzle"


def test_no_sensor_no_rain_no_nuance() -> None:
    assert sky(home("partlycloudy")).detail == ""
