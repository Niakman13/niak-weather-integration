"""Lightning from the Blitzortung integration (mrk-its/homeassistant-blitzortung): strikes detected by a community network of receivers.

Its distance sensor only holds the last strike and falls back to « unknown » after a quiet spell: Niak keeps the strikes of the last hour
itself, each at its time, and reads from them how near the storm is, where it stands and whether it comes closer. The direction is worked
out from the strike's position and the home's, as Blitzortung does; strikes reloaded from the Recorder after a restart have no position."""
from __future__ import annotations

import math
import statistics
from dataclasses import dataclass
from typing import Any, Iterable, Sequence

from .trends import Change
from .units import finite, french

KEEP = 3600
"""Strikes older than an hour are forgotten."""
WINDOW = 20 * 60
"""A storm is judged on the strikes of the last 20 minutes; the alerts then hold it a little longer."""
RECENT = 10 * 60
NEAR_KM = 30
"""Closer than this, the storm is here: the Orage sensor goes on."""
CLOSE_KM = 15
OVERHEAD_KM = 10
"""Closer than this within ten minutes, the sky shown is a storm."""
TREND_KM = 5
"""How much the typical distance must change between two ten-minute spans to say the storm comes closer or moves away."""
DIRECTIONS = ("au nord", "au nord-est", "à l’est", "au sud-est", "au sud", "au sud-ouest", "à l’ouest", "au nord-ouest")
APPROACHING, LEAVING = "approche", "eloigne"


@dataclass(frozen=True)
class Strike:
    at: float
    """Seconds since 1970."""
    distance: float
    """Kilometres from the place Blitzortung watches."""
    azimuth: float | None = None
    """Degrees from the north, from the home towards the strike; None when its position is unknown."""


def kilometres(value: Any, unit: Any) -> float | None:
    number = finite(value)
    if number is None or number < 0:
        return None
    return number * 1.609344 if str(unit or "").strip().lower() in ("mi", "mile", "miles") else number


def bearing(latitude: float, longitude: float, lat: float, lon: float) -> float:
    """The direction of a point seen from the home, Blitzortung's own way: flat projection, degrees from the north."""
    dy = math.radians(lat - latitude)
    dx = math.radians(lon - longitude) * math.cos(math.radians(latitude))
    return math.degrees(math.atan2(dx, dy)) % 360


def strike_of(state: Any, at: float, latitude: float | None = None, longitude: float | None = None) -> Strike | None:
    """The strike a new state of the distance sensor announces; None for « unknown », « unavailable » or a value that is not a distance."""
    if state is None:
        return None
    attributes = getattr(state, "attributes", {}) or {}
    distance = kilometres(state.state, attributes.get("unit_of_measurement"))
    if distance is None:
        return None
    lat, lon = finite(attributes.get("lat")), finite(attributes.get("lon"))
    azimuth = (bearing(latitude, longitude, lat, lon)
               if lat is not None and lon is not None and latitude is not None and longitude is not None else None)
    return Strike(at, distance, azimuth)


def from_history(changes: Sequence[Change], unit: Any = "km") -> list[Strike]:
    """The strikes the Recorder kept: one per distance it recorded, without position."""
    return [Strike(c.time, d) for c in changes if (d := kilometres(c.state, unit)) is not None]


def keep(strikes: Iterable[Strike], now: float) -> list[Strike]:
    """The last hour's strikes in time order, one per moment (a strike seen live wins over its copy from the Recorder)."""
    by_time: dict[float, Strike] = {}
    for s in strikes:
        if now - KEEP <= s.at <= now + 60 and (s.at not in by_time or by_time[s.at].azimuth is None):
            by_time[s.at] = s
    return [by_time[t] for t in sorted(by_time)]


def _direction(azimuths: Sequence[float]) -> float | None:
    """Their mean direction; None when the strikes lie all around (no side stands out)."""
    if not azimuths:
        return None
    x = sum(math.sin(math.radians(a)) for a in azimuths) / len(azimuths)
    y = sum(math.cos(math.radians(a)) for a in azimuths) / len(azimuths)
    return math.degrees(math.atan2(x, y)) % 360 if math.hypot(x, y) >= 0.5 else None


def direction_words(azimuth: float | None) -> str:
    return "" if azimuth is None else DIRECTIONS[math.floor(azimuth % 360 / 45 + 0.5) % 8]


@dataclass(frozen=True)
class Lightning:
    available: bool
    """The Blitzortung sensor answers: without it, no strike says nothing."""
    nearest: float | None = None
    """Kilometres to the nearest strike of the last 20 minutes."""
    recent_nearest: float | None = None
    """The same over the last 10 minutes."""
    count: int = 0
    """Strikes in the last 20 minutes."""
    near_count: int = 0
    """Of which closer than 30 km."""
    last: float | None = None
    """When the last strike fell, in seconds since 1970."""
    trend: str | None = None
    """« approche », « eloigne », or None when it cannot be told."""
    azimuth: float | None = None

    @property
    def near(self) -> bool:
        return self.nearest is not None and self.nearest <= NEAR_KM

    @property
    def overhead(self) -> bool:
        return self.recent_nearest is not None and self.recent_nearest <= OVERHEAD_KM

    @property
    def direction(self) -> str:
        return direction_words(self.azimuth)

    @property
    def level(self) -> int:
        """2 when it is close or comes closer, 1 within 30 km, else 0."""
        if not self.near:
            return 0
        return 2 if (self.nearest or 0) <= CLOSE_KM or (self.trend == APPROACHING and (self.nearest or 0) <= 20) else 1

    @property
    def movement(self) -> str:
        return {APPROACHING: "il se rapproche", LEAVING: "il s’éloigne"}.get(self.trend or "", "")

    @property
    def text(self) -> str:
        """« Orage à 8 km au sud-ouest, il se rapproche », « Orage au loin : 45 km au nord »; "" without a strike."""
        if self.nearest is None:
            return ""
        km = f"{french(max(1.0, self.nearest), 0)} km"
        where = f" {self.direction}" if self.direction else ""
        text = f"Orage à {km}{where}" if self.near else f"Orage au loin : {km}{where}"
        return text + (f", {self.movement}" if self.movement else "")

    @property
    def explanation(self) -> str:
        near = f", dont {self.near_count} à moins de {NEAR_KM} km" if self.near_count and self.near_count < self.count else ""
        return (f"{self.count} éclair{'s' if self.count > 1 else ''} en 20 min{near}, détectés par le réseau Blitzortung. "
                "C’est une mesure, pas une prévision.")

    def extra(self) -> dict[str, Any]:
        """The attributes the Orage sensor and the API give: distance, direction, trend, strikes."""
        return {"eclair_le_plus_proche_km": None if self.nearest is None else round(self.nearest, 1), "direction": self.direction or None,
                "azimut": None if self.azimuth is None else round(self.azimuth), "tendance": self.trend, "eclairs_20_min": self.count,
                "eclairs_proches_20_min": self.near_count}


def read(strikes: Sequence[Strike], now: float, available: bool = True) -> Lightning:
    """What the strikes of the last 20 minutes say at `now`."""
    window = [s for s in strikes if now - WINDOW <= s.at <= now + 60]
    if not window:
        return Lightning(available)
    recent = [s for s in window if s.at >= now - RECENT]
    older = [s for s in window if s.at < now - RECENT]
    near = [s for s in window if s.distance <= NEAR_KM]
    trend = None
    if len(recent) >= 3 and len(older) >= 3:
        change = statistics.median(s.distance for s in recent) - statistics.median(s.distance for s in older)
        trend = APPROACHING if change <= -TREND_KM else LEAVING if change >= TREND_KM else None
    # Where the storm stands: the strikes that make it near, else all of them.
    shown = near or window
    return Lightning(available, min(s.distance for s in window), min((s.distance for s in recent), default=None), len(window), len(near),
                     max(s.at for s in window), trend, _direction([s.azimuth for s in shown if s.azimuth is not None]))
