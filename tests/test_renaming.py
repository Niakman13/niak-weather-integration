"""Renaming a home's former entity ids « hestia_weather… »: whole ids only, in texts, dashboards and the files the interface writes."""
from __future__ import annotations

from engine.legacy import ENTITY_ROOT as OLD
from engine.renaming import lines_with, new_id, rewrite, rewrite_data, users

MAPPING = {
    f"sensor.{OLD}_pluie_24h": "sensor.hestia_weather_pluie_24h",
    f"sensor.{OLD}_pluie_24h_prevue": "sensor.hestia_weather_pluie_24h_prevue",
    f"weather.{OLD}": "weather.hestia_weather",
}


def test_new_ids_keep_the_place_and_the_key():
    assert new_id(f"sensor.{OLD}_ressenti") == "sensor.hestia_weather_ressenti"
    assert new_id(f"sensor.{OLD}_marseille_ressenti") == "sensor.hestia_weather_marseille_ressenti"
    assert new_id(f"weather.{OLD}") == "weather.hestia_weather"


def test_ids_that_are_not_hestia_weather_s_stay():
    assert new_id("sensor.ma_station_pluie") is None
    assert new_id(f"binary_sensor.sentinel_gardanne_{OLD}") is None
    assert new_id(f"sensor.{OLD}s") is None


def test_only_whole_ids_are_replaced():
    text = f"states('sensor.{OLD}_pluie_24h_prevue') + states.sensor.{OLD}_pluie_24h.state; weather.{OLD}"
    changed, count = rewrite(text, MAPPING)
    assert changed == ("states('sensor.hestia_weather_pluie_24h_prevue') + states.sensor.hestia_weather_pluie_24h.state; "
                       "weather.hestia_weather")
    assert count == 3
    assert rewrite(f"weather.{OLD}_extra and xsensor.{OLD}_pluie_24h", MAPPING) == (
        f"weather.{OLD}_extra and xsensor.{OLD}_pluie_24h", 0)


def test_dashboards_are_changed_at_any_depth_and_back():
    dashboard = {"views": [{"cards": [{"type": "custom:hestia-weather-card", "entity": f"weather.{OLD}"},
                                      {"type": "entities", "entities": [f"sensor.{OLD}_pluie_24h", {"entity": "sensor.autre"}]}]}]}
    changed, count = rewrite_data(dashboard, MAPPING)
    assert count == 2
    assert changed["views"][0]["cards"][0] == {"type": "custom:hestia-weather-card", "entity": "weather.hestia_weather"}
    back, _ = rewrite_data(changed, {new: old for old, new in MAPPING.items()})
    assert back == dashboard


def test_the_users_of_a_file_are_named():
    automations = f"""- id: '1'
  alias: Pluie au jardin
  triggers:
  - trigger: numeric_state
    entity_id: sensor.{OLD}_pluie_24h
- id: '2'
  alias: Volets
  actions: []
- id: '3'
  alias: "Alerte météo"
  conditions: "{{{{ is_state('weather.{OLD}', 'rainy') }}}}"
"""
    assert users(automations, MAPPING) == ["Pluie au jardin", "Alerte météo"]
    scripts = f"""arrosage:
  alias: Arrosage
  sequence:
  - condition: template
    value_template: "{{{{ states('sensor.{OLD}_pluie_24h') | float < 2 }}}}"
eclairage:
  sequence: []
sans_nom:
  sequence:
  - action: notify.x
    data:
      message: "{{{{ states('weather.{OLD}') }}}}"
"""
    assert users(scripts, MAPPING, keyed=True) == ["Arrosage", "sans_nom"]
    assert users("", MAPPING) == []


def test_hand_written_lines_are_found():
    text = f"sensor:\n  - platform: template\n    state: \"{{{{ states('sensor.{OLD}_pluie_24h') }}}}\"\n# weather.{OLD}\n"
    assert lines_with(text, MAPPING) == [3, 4]
