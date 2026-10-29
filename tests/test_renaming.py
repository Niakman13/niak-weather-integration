"""Renaming « niak_weather… » ids « hestia_weather… »: whole ids only, in texts, dashboards and the files the interface writes."""
from __future__ import annotations

from engine.renaming import lines_with, new_id, rewrite, rewrite_data, users

MAPPING = {
    "sensor.niak_weather_pluie_24h": "sensor.hestia_weather_pluie_24h",
    "sensor.niak_weather_pluie_24h_prevue": "sensor.hestia_weather_pluie_24h_prevue",
    "weather.niak_weather": "weather.hestia_weather",
}


def test_new_ids_keep_the_place_and_the_key():
    assert new_id("sensor.niak_weather_ressenti") == "sensor.hestia_weather_ressenti"
    assert new_id("sensor.niak_weather_marseille_ressenti") == "sensor.hestia_weather_marseille_ressenti"
    assert new_id("weather.niak_weather") == "weather.hestia_weather"


def test_ids_that_are_not_hestia_weather_s_stay():
    assert new_id("sensor.ma_station_pluie") is None
    assert new_id("binary_sensor.sentinel_gardanne_niak_weather") is None
    assert new_id("sensor.niak_weathers") is None


def test_only_whole_ids_are_replaced():
    text = "states('sensor.niak_weather_pluie_24h_prevue') + states.sensor.niak_weather_pluie_24h.state; weather.niak_weather"
    changed, count = rewrite(text, MAPPING)
    assert changed == ("states('sensor.hestia_weather_pluie_24h_prevue') + states.sensor.hestia_weather_pluie_24h.state; "
                       "weather.hestia_weather")
    assert count == 3
    assert rewrite("weather.niak_weather_extra and xsensor.niak_weather_pluie_24h", MAPPING) == (
        "weather.niak_weather_extra and xsensor.niak_weather_pluie_24h", 0)


def test_dashboards_are_changed_at_any_depth_and_back():
    dashboard = {"views": [{"cards": [{"type": "custom:niak-weather-card", "entity": "weather.niak_weather"},
                                      {"type": "entities", "entities": ["sensor.niak_weather_pluie_24h", {"entity": "sensor.autre"}]}]}]}
    changed, count = rewrite_data(dashboard, MAPPING)
    assert count == 2
    assert changed["views"][0]["cards"][0] == {"type": "custom:niak-weather-card", "entity": "weather.hestia_weather"}
    back, _ = rewrite_data(changed, {new: old for old, new in MAPPING.items()})
    assert back == dashboard


def test_the_users_of_a_file_are_named():
    automations = """- id: '1'
  alias: Pluie au jardin
  triggers:
  - trigger: numeric_state
    entity_id: sensor.niak_weather_pluie_24h
- id: '2'
  alias: Volets
  actions: []
- id: '3'
  alias: "Alerte météo"
  conditions: "{{ is_state('weather.niak_weather', 'rainy') }}"
"""
    assert users(automations, MAPPING) == ["Pluie au jardin", "Alerte météo"]
    scripts = """arrosage:
  alias: Arrosage
  sequence:
  - condition: template
    value_template: "{{ states('sensor.niak_weather_pluie_24h') | float < 2 }}"
eclairage:
  sequence: []
sans_nom:
  sequence:
  - action: notify.x
    data:
      message: "{{ states('weather.niak_weather') }}"
"""
    assert users(scripts, MAPPING, keyed=True) == ["Arrosage", "sans_nom"]
    assert users("", MAPPING) == []


def test_hand_written_lines_are_found():
    text = "sensor:\n  - platform: template\n    state: \"{{ states('sensor.niak_weather_pluie_24h') }}\"\n# weather.niak_weather\n"
    assert lines_with(text, MAPPING) == [3, 4]
