"""The view of a made-up situation, for the card's test bench: the same engine as in Home Assistant, without Home Assistant.

    python3 scripts/view_cli.py < scenario.json > view.json

Input: {"options": {...}, "states": {"weather.x": {"state": "sunny", "attributes": {...}}, ...}, "hourly": [...], "daily": [...],
        "history": {"sensor.x": [{"s": "12", "lu": 1791500000}, ...]}, "now": "2026-10-08T17:40:00+02:00",
        "time_zone": "Europe/Paris", "latitude": 43.45, "elevation": 0}
Output: {"version": 1, "integration": "2.0.9", "view": {...}}, as the integration sends it to the card."""
from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "custom_components" / "niak_weather"))

from engine import lightning  # noqa: E402
from engine.compute import compute  # noqa: E402
from engine.forecast import Units, parse_days, parse_hours, parse_time  # noqa: E402
from engine.settings import Settings  # noqa: E402
from engine.trends import Change  # noqa: E402
from engine.view import to_json  # noqa: E402
from engine.i18n import localized  # noqa: E402

VIEW_VERSION = 1
INTEGRATION = json.loads((Path(__file__).resolve().parent.parent / "custom_components" / "niak_weather" / "manifest.json").read_text())["version"]


@dataclass
class State:
    entity_id: str
    state: str
    attributes: dict[str, Any] = field(default_factory=dict)
    last_updated: datetime | None = None


def main() -> None:
    data = json.load(sys.stdin)
    states = {entity_id: State(entity_id, str(s.get("state")), s.get("attributes") or {}, parse_time(s["last_updated"]) if s.get("last_updated") else None)
              for entity_id, s in (data.get("states") or {}).items()}
    settings = Settings.from_options(data["options"])
    weather = states.get(settings.weather_entity)
    attributes = weather.attributes if weather else {}
    units = Units(attributes.get("temperature_unit") or "°C", attributes.get("precipitation_unit") or "mm", attributes.get("wind_speed_unit") or "km/h")
    history = {entity_id: [Change(float(r.get("lu") or r.get("lc") or 0), str(r.get("s"))) for r in rows]
               for entity_id, rows in (data.get("history") or {}).items()}
    zone = ZoneInfo(data.get("time_zone") or "UTC")
    now = parse_time(data["now"]) or datetime.now(zone)
    # The card's language, like the integration's niak_weather/subscribe.
    # Blitzortung's strikes, as [minutes ago, km, azimuth or null], when the scenario has some.
    seen = None
    if settings.lightning_entity:
        t = now.timestamp()
        seen = lightning.read([lightning.Strike(t - m * 60, km, az) for m, km, az in data.get("strikes") or []], t, True, data.get("lightning_month"))
    with localized(data.get("language") or "fr"):
        result = compute(states.get, settings, parse_hours(data.get("hourly") or [], units), parse_days(data.get("daily") or [], units), history, history,
                         [], None, now, zone, data.get("latitude"), data.get("elevation") or 0, lightning=seen)
        view = to_json(result.view)
    json.dump({"version": VIEW_VERSION, "integration": INTEGRATION, "view": view}, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
