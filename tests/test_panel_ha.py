"""The « Météo » tab with a real Home Assistant: the draft follows the assistant's steps and detection. Skipped without Home Assistant
(the engine's tests run without it): ../ha-test/venv/bin/python -m unittest tests/test_panel_ha.py"""
from pathlib import Path
import sys
import tempfile
import unittest

try:
    from homeassistant.config_entries import ConfigEntries
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers import area_registry as ar, device_registry as dr, entity_registry as er
except ImportError:  # pragma: no cover - the engine's own test run
    raise unittest.SkipTest("Home Assistant is not installed")

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from custom_components.niak_weather import socle  # noqa: E402
from custom_components.niak_weather.draft import Draft  # noqa: E402
from custom_components.niak_weather.panel import weather_status  # noqa: E402

STATION = {
    "sensor.gw2000a_outdoor_temperature": ("14.2", {"unit_of_measurement": "°C", "device_class": "temperature"}),
    "sensor.outdoor_humidity": ("78", {"unit_of_measurement": "%", "device_class": "humidity"}),
    "sensor.gw2000a_rain_rate": ("0", {"unit_of_measurement": "mm/h", "device_class": "precipitation_intensity"}),
    "sensor.gw2000a_wind_gust": ("20", {"unit_of_measurement": "km/h", "device_class": "wind_speed"}),
    "sensor.gw2000a_wind_speed": ("12", {"unit_of_measurement": "km/h", "device_class": "wind_speed"}),
    "sensor.gw2000a_wind_direction": ("270", {"unit_of_measurement": "°", "device_class": "wind_direction"}),
}


class PanelTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.hass = HomeAssistant(self.directory.name)
        self.hass.config_entries = ConfigEntries(self.hass, {})
        await self.hass.config_entries.async_initialize()
        await ar.async_load(self.hass)
        dr.async_setup(self.hass)
        await dr.async_load(self.hass)
        await er.async_load(self.hass)
        self.hass.states.async_set("weather.maison", "sunny", {"friendly_name": "Maison"})
        for entity_id, (value, attributes) in STATION.items():
            self.hass.states.async_set(entity_id, value, attributes)

    async def asyncTearDown(self):
        await self.hass.async_stop()
        self.directory.cleanup()

    async def test_a_new_place_starts_from_what_home_assistant_has(self):
        draft = Draft.start(self.hass, None)
        self.assertEqual(draft.sources["weather_entity"], "weather.maison")
        self.assertEqual(draft.sources["temperature_entity"], "sensor.gw2000a_outdoor_temperature")
        self.assertEqual(draft.sources["wind_gust_entity"], "sensor.gw2000a_wind_gust")
        self.assertEqual(draft.sources["families"], ["maintenant", "alertes", "prochaines_heures"])
        view = draft.view()
        self.assertEqual(view["title"], "Maison")
        self.assertEqual(view["station"]["model"], "gw2000a")
        # « Alertes » is chosen and there is no Météo-France vigilance: said before saving.
        self.assertIn("Vigilance Météo-France : il faut la vigilance Météo-France", view["needs"])
        self.assertEqual(view["pollen"]["value"], "none")

    async def test_no_station_then_a_station_again_proposes_its_sensors(self):
        draft = Draft.start(self.hass, None)
        self.assertEqual(draft.change({"op": "station", "value": "none"}), "")
        self.assertEqual(draft.sources["temperature_entity"], "")
        self.assertEqual(draft.view()["station"]["model"], "none")
        draft.change({"op": "station", "value": "gw2000a"})
        self.assertEqual(draft.sources["temperature_entity"], "sensor.gw2000a_outdoor_temperature")

    async def test_a_mean_wind_chosen_for_the_gusts_is_flagged_with_the_right_one(self):
        draft = Draft.start(self.hass, None)
        draft.change({"op": "set", "key": "wind_gust_entity", "value": "sensor.gw2000a_wind_speed"})
        gust = next(f for g in draft.view()["station"]["groups"] for f in g["fields"] if f["key"] == "wind_gust_entity")
        self.assertIn("ne semble pas donner", gust["warning"])
        self.assertEqual(gust["better"]["id"], "sensor.gw2000a_wind_gust")

    async def test_a_sensor_that_does_not_answer_is_said(self):
        self.hass.states.async_set("sensor.gw2000a_rain_rate", "unavailable", STATION["sensor.gw2000a_rain_rate"][1])
        rain = next(f for g in Draft.start(self.hass, None).view()["station"]["groups"] for f in g["fields"] if f["key"] == "rain_rate_entity")
        self.assertEqual(rain["warning"], "Ce capteur ne répond pas pour l’instant.")

    async def test_a_source_not_installed_is_refused_and_unknown_changes_too(self):
        draft = Draft.start(self.hass, None)
        self.assertEqual(draft.change({"op": "pollen", "value": "polleninformation"}), "Polleninformation n’est pas installée.")
        self.assertEqual(draft.change({"op": "set", "key": "families", "value": []}), "Changement inconnu.")
        self.assertEqual(draft.change({"op": "station", "value": "ws91"}), "Modèle de station inconnu.")

    async def test_the_air_is_chosen_by_source_like_the_pollens(self):
        draft = Draft.start(self.hass, None)
        air = draft.view()["air"]
        self.assertEqual([s["value"] for s in air["sources"]], ["atmo", "none"])
        self.assertFalse(air["sources"][0]["available"])
        self.assertEqual(air["value"], "none")
        self.assertEqual(draft.change({"op": "air", "value": "atmo"}), "Atmo France n’est pas installée.")
        self.assertEqual(draft.change({"op": "air", "value": "lyon"}), "Source de qualité de l’air inconnue.")
        self.assertEqual(draft.change({"op": "air", "value": "none"}), "")
        self.assertEqual(draft.sources["air_source"], "none")

    async def test_saving_without_a_weather_service_is_refused(self):
        with self.assertRaises(ValueError):
            await Draft(self.hass, {"weather_entity": ""}).save(None)

    async def test_home_page_without_a_place_asks_for_one(self):
        status = await weather_status(self.hass)
        self.assertEqual(status["level"], "action")
        self.assertIn("onglet Météo", status["details"][0])

    async def test_weather_joins_confort_in_the_same_panel(self):
        async def ok(hass):
            return {"level": "ok", "summary": "", "details": [], "links": []}
        base = {"version": "1", "icon": "mdi:x", "module_url": "/x.js", "status": ok}
        await socle.async_register_brick(self.hass, {**base, "domain": "niak_comfort", "name": "Niak Confort", "slug": "confort",
                                                     "element": "niak-comfort-setup", "legacy_path": None}, "/c/niak-socle.js")
        await socle.async_register_brick(self.hass, {**base, "domain": "niak_weather", "name": "Niak Weather", "slug": "meteo",
                                                     "element": "niak-weather-setup", "status": weather_status, "legacy_path": ""}, "/w/niak-socle.js")
        overview = await socle.async_overview(self.hass)
        self.assertEqual([b["slug"] for b in overview["bricks"]], ["meteo", "confort"])
        self.assertEqual(overview["others"], [])
        self.assertEqual(overview["bricks"][0]["status"]["level"], "action")


if __name__ == "__main__":
    unittest.main()


class NetatmoTests(unittest.IsolatedAsyncioTestCase):
    """A Netatmo station as its integration registers it: one device per module, linked to the station, some sensors disabled."""

    async def asyncSetUp(self):
        from homeassistant.config_entries import ConfigEntry
        self.directory = tempfile.TemporaryDirectory()
        self.hass = HomeAssistant(self.directory.name)
        self.hass.config_entries = ConfigEntries(self.hass, {})
        await self.hass.config_entries.async_initialize()
        await ar.async_load(self.hass)
        dr.async_setup(self.hass)
        await dr.async_load(self.hass)
        await er.async_load(self.hass)
        netatmo = ConfigEntry(version=1, minor_version=1, domain="netatmo", title="Netatmo", data={}, source="user", options={},
                              unique_id="netatmo", discovery_keys={}, subentries_data=None)
        self.hass.config_entries._entries[netatmo.entry_id] = netatmo
        devices, entities = dr.async_get(self.hass), er.async_get(self.hass)

        def device(module: str, name: str, model: str, via=None):
            return devices.async_get_or_create(config_entry_id=netatmo.entry_id, identifiers={("netatmo", module)}, manufacturer="Netatmo",
                                               model=model, name=name, via_device_id=via).id
        home = device("home", "Maison", "Home")
        main = device("70:ee:50:00:00:01", "Intérieur", "Smart Home Weather station", home)
        modules = {"out": device("02:00:00:00:00:02", "Jardin", "Smart Outdoor Module", main),
                   "rain": device("05:00:00:00:00:03", "Pluviomètre", "Smart Rain Gauge", main),
                   "wind": device("06:00:00:00:00:04", "Anémomètre", "Smart Anemometer", main), "main": main}
        self.main, self.home = main, home
        C, MM = {"unit_of_measurement": "°C", "device_class": "temperature"}, {"unit_of_measurement": "mm", "device_class": "precipitation"}
        for object_id, module, key, value, attributes, disabled in (
                ("interieur_temperature", "main", "temperature", "21", C, False),
                ("interieur_pression_atmospherique", "main", "pressure", "1016", {"unit_of_measurement": "mbar", "device_class": "atmospheric_pressure"}, False),
                ("jardin_temperature", "out", "temperature", "9.4", C, False),
                ("jardin_humidite", "out", "humidity", "88", {"unit_of_measurement": "%", "device_class": "humidity"}, False),
                ("pluviometre_precipitations_aujourd_hui", "rain", "sum_rain_24", "3.1", {**MM, "state_class": "total_increasing"}, False),
                ("pluviometre_precipitations_derniere_heure", "rain", "sum_rain_1", "0.4", {**MM, "state_class": "total"}, True),
                ("anemometre_vitesse_du_vent", "wind", "windstrength", "14", {"unit_of_measurement": "km/h", "device_class": "wind_speed"}, False),
                ("anemometre_force_des_rafales", "wind", "guststrength", "31", {"unit_of_measurement": "km/h", "device_class": "wind_speed"}, True)):
            mac = next(i[1] for i in devices.async_get(modules[module]).identifiers)
            entry = entities.async_get_or_create("sensor", "netatmo", f"{mac}-{key}", suggested_object_id=object_id, config_entry=netatmo,
                                                 device_id=modules[module], disabled_by=er.RegistryEntryDisabler.INTEGRATION if disabled else None)
            if not disabled:
                self.hass.states.async_set(entry.entity_id, value, attributes)
        self.hass.states.async_set("weather.maison", "rainy", {"friendly_name": "Maison"})

    async def asyncTearDown(self):
        await self.hass.async_stop()
        self.directory.cleanup()

    async def test_a_new_place_proposes_the_netatmo_station_and_says_what_to_enable(self):
        draft = Draft.start(self.hass, None)
        self.assertEqual(draft.sources["station_model"], "netatmo")
        self.assertEqual((draft.sources["temperature_entity"], draft.sources["pressure_entity"], draft.sources["daily_rain_entity"]),
                         ("sensor.jardin_temperature", "sensor.interieur_pression_atmospherique", "sensor.pluviometre_precipitations_aujourd_hui"))
        station = draft.view()["station"]
        self.assertEqual((station["model"], station["profile"], station["device"]), ("netatmo", "Netatmo", self.main))
        self.assertEqual([d["label"] for d in station["devices"]], ["Aucun appareil — capteurs séparés", "Intérieur"])
        fields = {f["key"]: f for g in station["groups"] for f in g["fields"]}
        self.assertIn("sensor.anemometre_force_des_rafales", fields["wind_gust_entity"]["warning"])
        self.assertIn("Anémomètre", fields["wind_gust_entity"]["warning"])
        self.assertNotIn("solar_radiation_entity", fields)

    async def test_choosing_netatmo_after_no_station_fills_the_station_again(self):
        draft = Draft.start(self.hass, None)
        draft.change({"op": "station", "value": "none"})
        self.assertEqual(draft.change({"op": "station", "value": "netatmo"}), "")
        self.assertEqual(draft.sources["humidity_entity"], "sensor.jardin_humidite")
        self.assertEqual(draft.sources["wind_speed_entity"], "sensor.anemometre_vitesse_du_vent")
