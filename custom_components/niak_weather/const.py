"""Constants of the Niak Weather integration."""
from __future__ import annotations

import logging
from datetime import timedelta

DOMAIN = "niak_weather"
LOGGER = logging.getLogger(__package__)

CARD_TYPE = "custom:niak-weather-card"
VIEW_VERSION = 1
"""Version of the view sent to the card: raised when its shape changes in a way an older card cannot read."""

FORECAST_INTERVAL = timedelta(minutes=15)
FORECAST_RETRY = timedelta(minutes=1)
HISTORY_INTERVAL = timedelta(minutes=5)
RAIN_INTERVAL = timedelta(minutes=15)
AIR_INTERVAL = timedelta(minutes=15)
"""Checks whether tomorrow's air forecast (Open-Meteo, with WAQI) is due: it is fetched once an hour."""
TICK = timedelta(minutes=1)
"""Everything that depends on the time of day (next hours, date, trends) is recomputed at least this often."""
DEBOUNCE_SECONDS = 2
