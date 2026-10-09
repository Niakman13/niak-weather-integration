"""What Niak Weather computes, as sensors for automations (heating, shutters, watering…)."""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorEntityDescription, SensorStateClass
from homeassistant.const import UnitOfPrecipitationDepth, UnitOfPressure, UnitOfSpeed, UnitOfTemperature, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import NiakWeatherConfigEntry, NiakWeatherCoordinator, Snapshot
from .engine.feel import Alert
from .engine.moisture import humidex

ALERTS = ["none", *(a.value for a in Alert)]


def _feels(s: Snapshot) -> float | None:
    return s.local.feel.value if s.local.available else None


def _humidex(s: Snapshot) -> float | None:
    # The engine keeps the humidex only when it raises the feel; the sensor always gives it, like Thermal Comfort.
    w = s.local
    return round(humidex(w.temperature, w.dew_point), 1) if w.temperature is not None and w.dew_point is not None else None


def _rain_24h(s: Snapshot) -> float | None:
    if s.local.rain.last_24h is not None:
        return s.local.rain.last_24h
    return s.derived.recent.value if s.derived else None


def _max_gust(s: Snapshot) -> float | None:
    if s.local.wind.max_today is not None:
        return s.local.wind.max_today
    return s.derived.gust_max.value if s.derived and s.derived.gust_max else None


def _temperature_trend(s: Snapshot) -> float | None:
    if s.local.temperature_trend is not None:
        return s.local.temperature_trend
    return s.derived.temperature_trend if s.derived else None


@dataclass(frozen=True, kw_only=True)
class NiakSensorDescription(SensorEntityDescription):
    value: Callable[[Snapshot], Any]
    attributes: Callable[[Snapshot], dict[str, Any]] | None = None


SENSORS: tuple[NiakSensorDescription, ...] = (
    NiakSensorDescription(
        key="feels_like", translation_key="feels_like", device_class=SensorDeviceClass.TEMPERATURE, state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS, suggested_display_precision=1, value=_feels,
        attributes=lambda s: {"base": s.local.feel.base, "word": s.local.feel.word, "phrase": s.local.feel.phrase,
                              "wind_effect": s.local.feel.effects.wind, "sun_effect": s.local.feel.effects.sun,
                              "rain_effect": s.local.feel.effects.rain, "clear_night_effect": s.local.feel.effects.night}),
    NiakSensorDescription(
        key="dew_point", translation_key="dew_point", device_class=SensorDeviceClass.TEMPERATURE, state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS, suggested_display_precision=1, value=lambda s: s.local.dew_point),
    NiakSensorDescription(
        key="frost_point", translation_key="frost_point", device_class=SensorDeviceClass.TEMPERATURE, state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS, suggested_display_precision=1, value=lambda s: s.local.frost_point),
    NiakSensorDescription(
        key="humidex", translation_key="humidex", state_class=SensorStateClass.MEASUREMENT, suggested_display_precision=1,
        value=lambda s: _humidex(s)),
    NiakSensorDescription(
        key="alert", translation_key="alert", device_class=SensorDeviceClass.ENUM, options=ALERTS,
        value=lambda s: s.local.alert.value if s.local.alert else "none", attributes=lambda s: {"level": s.local.level.value}),
    NiakSensorDescription(
        key="brief", translation_key="brief", value=lambda s: s.brief.title[:255],
        attributes=lambda s: {"level": s.brief.label, "severity": s.brief.severity, "summary": s.brief.summary,
                              "points": [{"key": p.key, "group": p.group, "severity": p.severity, "text": p.text} for p in s.brief.signals]}),
    NiakSensorDescription(
        key="next_rain", translation_key="next_rain", device_class=SensorDeviceClass.DURATION, native_unit_of_measurement=UnitOfTime.HOURS,
        value=lambda s: s.local.rain.next_hours, attributes=lambda s: {"amount": s.local.rain.next_amount}),
    NiakSensorDescription(
        key="pressure_trend", translation_key="pressure_trend", device_class=SensorDeviceClass.PRESSURE, state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPressure.HPA, suggested_display_precision=1, value=lambda s: s.local.pressure_trend.change,
        attributes=lambda s: {"direction": s.local.pressure_trend.direction.value if s.local.pressure_trend.direction else None,
                              "text": s.local.pressure_trend.text, "minutes": s.local.pressure_trend.minutes}),
    NiakSensorDescription(
        key="rain_24h", translation_key="rain_24h", device_class=SensorDeviceClass.PRECIPITATION, state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPrecipitationDepth.MILLIMETERS, suggested_display_precision=1, value=_rain_24h,
        attributes=lambda s: {"partial": _rain_24h(s) is not None and s.local.rain.last_24h is None and bool(s.derived) and s.derived.recent.partial}),
    NiakSensorDescription(
        key="max_gust_today", translation_key="max_gust_today", device_class=SensorDeviceClass.WIND_SPEED, state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfSpeed.KILOMETERS_PER_HOUR, suggested_display_precision=0, value=_max_gust,
        attributes=lambda s: {"partial": s.local.wind.max_today is None and bool(s.derived and s.derived.gust_max) and s.derived.gust_max.partial}),
    NiakSensorDescription(
        key="temperature_trend", translation_key="temperature_trend", state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement="°C/h", suggested_display_precision=1, value=_temperature_trend),
)


async def async_setup_entry(hass: HomeAssistant, entry: NiakWeatherConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    async_add_entities(NiakWeatherSensor(entry.runtime_data, description) for description in SENSORS)


class NiakWeatherSensor(CoordinatorEntity[NiakWeatherCoordinator], SensorEntity):
    _attr_has_entity_name = True
    # The brief's long texts are for automations and dashboards, not for the Recorder.
    _unrecorded_attributes = frozenset({"summary", "points", "phrase"})
    entity_description: NiakSensorDescription

    def __init__(self, coordinator: NiakWeatherCoordinator, description: NiakSensorDescription) -> None:
        super().__init__(coordinator)
        entry = coordinator.config_entry
        self.entity_description = description
        self._attr_unique_id = f"{entry.entry_id}_{description.key}"
        self._attr_device_info = DeviceInfo(identifiers={(DOMAIN, entry.entry_id)}, name=entry.title, manufacturer="Niakman13",
                                            model="Niak Weather", entry_type=DeviceEntryType.SERVICE)

    @property
    def native_value(self) -> Any:
        return self.entity_description.value(self.coordinator.data) if self.coordinator.data else None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        describe = self.entity_description.attributes
        return describe(self.coordinator.data) if describe and self.coordinator.data else None

    @property
    def icon(self) -> str | None:
        # The brief takes the icon of its most important point.
        if self.entity_description.key == "brief" and self.coordinator.data:
            return self.coordinator.data.brief.icon
        return super().icon
