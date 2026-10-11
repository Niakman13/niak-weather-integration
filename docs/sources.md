# Sources et réglages

[Accueil](../README.md) · [Les capteurs](capteurs.md) · [Le ressenti](ressenti.md) · [La synthèse et les alertes](synthese.md) · [Le bulletin du jour](bulletin.md) · [Pluie, vent, pression](mesures.md) · [Fonctionnement technique](technique.md)

Niak Weather assemble des données **déjà présentes** dans Home Assistant. Il ne remplace pas vos intégrations : il lit leurs entités et leurs prévisions. Seule l’entité météo est obligatoire ; le reste enrichit.

| Source | Statut | Ce qu’elle apporte |
| --- | --- | --- |
| Entité météo `weather.*` | **Obligatoire** | Ciel de la zone, prévisions heure par heure et jour par jour. Météo-France est recommandé. |
| Station météo | Conseillée | Les mesures prises chez vous. |
| Soleil (`sun.sun`) | Conseillé, déjà présent en général | Jour et nuit, effets du soleil et d’une nuit claire sur le ressenti. |
| Vigilance Météo-France | Facultative | La vigilance officielle du département. |
| Saison | Facultative | La saison de l’intégration Saison ; sinon, calculée d’après la date et l’hémisphère. |
| Atmo France | Facultative | Air extérieur et pollens, aujourd’hui et demain. |
| Historique (Recorder) | Facultatif, actif par défaut dans Home Assistant | Courbes et tendances, cumuls de pluie et rafale du jour calculés quand la station ne les donne pas. |

## Configurer

**Paramètres → Appareils et services → Ajouter une intégration → Niak Weather.**

1. **Reprendre une carte** (si vous aviez déjà la carte Niak Weather) : ses réglages sont repris et affichés à chaque étape, pour vérification. Sinon, **Tout configurer**.
2. **Météo** : l’entité météo, le nom du lieu, la vigilance, la saison.
3. **Station météo** : le modèle reconnu, puis chaque capteur. Laissez vide ce que la station ne mesure pas.
4. **Qualité de l’air et pollens** : la commune Atmo France.

Chaque champ est prérempli avec ce que Home Assistant connaît. **Un champ laissé vide est un choix** : il n’est jamais rempli à votre place ensuite. Tout se modifie dans **Configurer**, une partie à la fois. Plusieurs lieux ? Ajoutez l’intégration une fois par lieu.

## Météo-France — ciel et prévisions

Configurez [l’intégration Météo-France](https://www.home-assistant.io/integrations/meteo_france/) pour votre commune, puis choisissez son entité `weather.*`. Une autre entité météo convient si elle fournit les prévisions horaires et quotidiennes ; tous les fournisseurs ne sont pas vérifiés.

Niak Weather lit jusqu’à 18 heures et 7 jours, selon ce que le fournisseur donne : un horizon absent n’est pas inventé. La température du bulletin sert seulement quand il n’y a pas de thermomètre local.

**La station passe devant le bulletin** pour le temps du moment quand elle constate autre chose : pluie mesurée (dès 0,3 mm/h), brouillard probable, soleil fort sous un ciel annoncé couvert. Elle ne prétend jamais constater la foudre : les orages restent des prévisions. Cela change la présentation du temps actuel, pas les prévisions.

## Station météo

Les capteurs peuvent venir de [l’intégration Ecowitt](https://www.home-assistant.io/integrations/ecowitt/) (GW2000A), d’une WS90 via Zigbee2MQTT, ou de n’importe quel appareil, choisis à la main. Niak Weather reconnaît la station et propose ses capteurs ; les listes sont filtrées par type et par unité. Vérifiez que température et humidité sont bien celles de **l’extérieur**, et préférez la pression **relative**.

| Mesure | Utilité |
| --- | --- |
| Température et humidité extérieures | Thermomètre local, base du ressenti, de l’humidex, des points de rosée et de givre |
| Vent moyen, direction, rafales, rafale maximale du jour | Ressenti, alertes de vent, cadre Vent |
| Intensité de pluie, pluie depuis minuit | Pluie en cours, temps observé, cadre Pluie |
| Pluie sur 24 h, semaine, mois, année, épisode, compteur total | Bilans de pluie, sans additionner les compteurs entre eux |
| Pression | Cadre Pression et tendance |
| Rayonnement solaire, UV, luminosité | Effet du soleil sur le ressenti, alerte UV |
| Point de rosée, tendance de température | Gardés tels quels quand la station les donne |

Chaque mesure est facultative. Sans mesure locale, les cadres de la carte utilisent le bulletin et le disent. Un capteur configuré qui devient indisponible n’est pas remplacé en silence : le repli est signalé. Les compteurs semaine et mois sont ceux de la station : ils suivent ses remises à zéro.

Toutes les unités sont converties avant calcul (°F, m/s, mph, pouces, Pa…). Une valeur inconnue, indisponible ou vide ne devient jamais un zéro.

## Soleil

[L’intégration Soleil](https://www.home-assistant.io/integrations/sun/) est utilisée automatiquement (`sun.sun`). Elle donne la hauteur du soleil, donc le jour, le crépuscule et la nuit, et les effets du soleil et d’une nuit claire. Sans elle, ces effets sont réduits.

## Atmo France — air et pollens

Installez [l’intégration Atmo France](https://github.com/sebcaps/atmofrance) avec son compte Atmo Data, pour votre commune, et activez-y les indicateurs de pollution, de pollens et leurs prévisions si vous le souhaitez. Vos identifiants restent dans cette intégration : Niak Weather n’en demande aucun.

Niak Weather lit, pour aujourd’hui et pour demain, **19 mesures** : l’indice de l’air, cinq sous-indices (PM2.5, PM10, NO₂, O₃, SO₂), l’indice pollen, et le niveau et la concentration de six espèces (graminées, ambroisie, armoise, aulne, bouleau, olivier).

- Échelle de l’air : **1 (bon) à 6 (extrêmement mauvais)** ; pollens : **1 (très faible) à 6 (extrêmement élevé)**. **0 veut dire indisponible**, pas « aucun pollen ». **7 est un évènement**, pas un niveau.
- Un sous-indice pire que l’indice global reste visible, sous son nom.
- Les concentrations gardent leur unité, sans conversion ni seuil inventé.
- Ce sont des données de **zone**, pas des mesures du jardin. Une publication de plus de 48 h est signalée.

Les capteurs Polleninformation (ancienne source de pollens) restent lus si vous les aviez, avec leur échelle 0 à 4, mais jamais en double avec Atmo.

## Historique (Recorder)

Les capteurs de vent, de pression et de pluie doivent être enregistrés par l’historique de Home Assistant (c’est le cas par défaut). Il sert aux courbes, aux tendances et aux bilans calculés : voir [Pluie, vent, pression](mesures.md). Sans historique, les valeurs du moment restent affichées et rien n’est inventé.

## Les réglages

Les clés sont les mêmes que dans le YAML de la carte avant la 2.0 : les réglages d’une ancienne carte se reprennent tels quels.

| Réglage | Rôle |
| --- | --- |
| `weather_entity` | Entité météo, obligatoire |
| `location`, `forecast_source` | Nom du lieu et du fournisseur, si vous voulez les changer |
| `vigilance_entity` | Vigilance Météo-France du département |
| `season_entity` | Capteur de l’intégration Saison |
| `sun_entity`, `sun_elevation_entity` | Soleil, si ce n’est pas `sun.sun` |
| `station_model` | `gw2000a`, `ws90` ou `manual` |
| `station_history` | Calculer les cumuls de pluie et la rafale du jour depuis l’historique quand la station ne les donne pas (activé) |
| `temperature_entity`, `humidity_entity`, `dew_point_entity`, `temperature_trend_entity` | Température, humidité, point de rosée, tendance en °C/h |
| `wind_speed_entity`, `wind_gust_entity`, `wind_bearing_entity`, `max_daily_gust_entity` | Vent moyen, rafales, direction, rafale maximale du jour |
| `rain_rate_entity`, `daily_rain_entity`, `rain_24h_entity`, `weekly_rain_entity`, `monthly_rain_entity`, `yearly_rain_entity`, `event_rain_entity`, `rain_total_entity` | Intensité, cumuls de la station, compteur total |
| `pressure_entity` | Pression relative |
| `solar_radiation_entity`, `uv_index_entity`, `illuminance_entity` | Rayonnement, UV, luminosité |
| `atmo_area` | Commune Atmo France |
| `atmo_<mesure>_entity`, `atmo_<mesure>_tomorrow_entity` | Les mesures Atmo du jour et de demain (`air`, `pm25`, `grass`, `grass_concentration`…) |
| `pollen_source` | `atmo`, `legacy` (Polleninformation) ou `none` |

Les anciens réglages Thermal Comfort sont ignorés : Niak Weather calcule lui-même humidex, point de rosée et point de givre.
