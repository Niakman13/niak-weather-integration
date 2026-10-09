"""Names and icons of Home Assistant weather conditions: one table for the whole engine."""
from __future__ import annotations

CONDITIONS: dict[str, tuple[str, str]] = {
    "sunny": ("Ensoleillé", "mdi:weather-sunny"), "clear-night": ("Nuit claire", "mdi:weather-night"),
    "partlycloudy": ("Éclaircies", "mdi:weather-partly-cloudy"), "cloudy": ("Ciel couvert", "mdi:weather-cloudy"),
    "rainy": ("Pluie", "mdi:weather-rainy"), "pouring": ("Fortes pluies", "mdi:weather-pouring"),
    "lightning": ("Orage", "mdi:weather-lightning"), "lightning-rainy": ("Orage et pluie", "mdi:weather-lightning-rainy"),
    "snowy": ("Neige", "mdi:weather-snowy"), "snowy-rainy": ("Pluie et neige", "mdi:weather-snowy-rainy"),
    "hail": ("Grêle", "mdi:weather-hail"), "fog": ("Brouillard", "mdi:weather-fog"),
    "windy": ("Venteux", "mdi:weather-windy"), "windy-variant": ("Venteux et nuageux", "mdi:weather-windy-variant"),
    "exceptional": ("Conditions exceptionnelles", "mdi:alert-circle-outline"),
}


def condition_icon(condition: str, night: bool = False) -> str:
    """Icon of a condition; at night the sun gives way to the moon."""
    if night and condition == "sunny":
        return "mdi:weather-night"
    if night and condition == "partlycloudy":
        return "mdi:weather-night-partly-cloudy"
    return CONDITIONS.get(condition, ("", "mdi:weather-cloudy"))[1]


def condition_label(condition: str) -> str:
    return CONDITIONS.get(condition, (condition, ""))[0]
