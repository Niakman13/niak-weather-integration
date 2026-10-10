# Niak Weather — intégration

[![release](https://img.shields.io/github/v/release/Niakman13/niak-weather-integration)](https://github.com/Niakman13/niak-weather-integration/releases)
[![Validate](https://github.com/Niakman13/niak-weather-integration/actions/workflows/validate.yml/badge.svg)](https://github.com/Niakman13/niak-weather-integration/actions/workflows/validate.yml)
[![HACS](https://img.shields.io/badge/HACS-Custom-orange)](https://hacs.xyz)
[![License](https://img.shields.io/github/license/Niakman13/niak-weather-integration)](LICENSE)

[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/Niakman13)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-frankblemont-FFDD00?logo=buymeacoffee&logoColor=black)](https://www.buymeacoffee.com/frankblemont)
[![PayPal](https://img.shields.io/badge/PayPal-Donate-00457C?logo=paypal&logoColor=white)](https://paypal.me/frankblemont)

<img src="docs/images/icon.png" alt="" width="96" align="right">

**Le cerveau de la météo chez vous.** L’intégration lit vos prévisions, votre station et la qualité de l’air. Elle calcule ce qu’ils veulent dire : ressenti, alertes, bulletin du jour, pluie à venir, tendances, bilans.

Elle donne le résultat à la [carte Niak Weather](https://github.com/Niakman13/niak-weather) et à vos automatisations.

## Pourquoi

Une station météo donne des chiffres ; Météo-France donne des prévisions pour la commune. Niak Weather les met ensemble et les explique :

- **Maintenant** : ce que l’on ressent vraiment, et pourquoi (humidité, soleil, vent, pluie).
- **À venir** : la pluie, l’orage, le gel des prochaines heures, à leur heure.
- **Ce qui compte** : la vigilance officielle, l’alerte mesurée chez vous, l’air et les pollens.
- **Le bulletin du jour**, rédigé comme une prévision : « Ce soir et cette nuit, pluie jusqu’à 20 h (3 mm) ; 13 °C au petit matin. »

Tout est calculé une fois, dans Home Assistant : la carte affiche, vos automatisations utilisent les mêmes valeurs.

## Ce qu’il faut

- Home Assistant **2025.1** ou plus récent.
- Une entité météo `weather.*`. **Météo-France** est conseillée.
- En plus, si vous en avez : une station météo, la vigilance Météo-France, Atmo France (air et pollens).

## Installation

1. Dans HACS, ⋮ → **Dépôts personnalisés** : ajoutez `https://github.com/Niakman13/niak-weather-integration`, catégorie **Intégration**.
2. Installez **Niak Weather (intégration)**, puis redémarrez Home Assistant.
3. **Paramètres → Appareils et services → Ajouter une intégration → Niak Weather.**
4. Installez la [carte Niak Weather](https://github.com/Niakman13/niak-weather) pour l’afficher.

[![Ouvrir dans HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Niakman13&repository=niak-weather-integration&category=integration)

## Configuration

Chaque champ est déjà rempli avec ce que Home Assistant connaît : vous vérifiez, vous corrigez si besoin.

- **Vous utilisez déjà la carte Niak Weather ?** L’intégration propose de reprendre ses réglages.
- **Météo** : l’entité météo, le nom du lieu, la vigilance, la saison.
- **Station météo** : le modèle (GW2000A, WS90 ou autre), puis chaque capteur.
- **Qualité de l’air et pollens** : la commune Atmo France.

Un champ laissé vide est un choix : il n’est jamais rempli à votre place. Tout se modifie ensuite dans **Configurer**. Plusieurs lieux ? Ajoutez l’intégration une fois par lieu. [Détail des sources et des réglages](docs/sources.md).

## Les capteurs

| Capteur | Ce qu’il donne |
| --- | --- |
| `sensor.niak_weather_ressenti` | La température ressentie, avec ses causes en attributs. |
| `sensor.niak_weather_point_de_rosee`, `…_point_de_givre`, `…_humidex` | Calculés depuis votre station, ou depuis le bulletin sans station. |
| `sensor.niak_weather_alerte` | Orage, forte pluie, rafales, canicule, gel, chaleur, froid, UV, ou aucune. |
| `sensor.niak_weather_en_bref` | Le titre de la synthèse ; le texte complet est en attribut. |
| `sensor.niak_weather_pluie_dans` | Le nombre d’heures avant la prochaine pluie prévue. |
| `sensor.niak_weather_tendance_pression` | L’écart de pression sur 3 h, en hPa. |
| `sensor.niak_weather_pluie_24h`, `…_rafale_max_jour`, `…_tendance_temperature` | Ceux de la station, ou calculés depuis l’historique. |

Un deuxième lieu ajoute son nom : `sensor.niak_weather_marseille_ressenti`. Une valeur inconnue reste **inconnue** : rien n’est inventé.

## Documentation

| Page | Ce qu’elle explique |
| --- | --- |
| [Le ressenti](docs/ressenti.md) | Humidex, effets du vent, du soleil, de la pluie et de la nuit, mots et nuances, alerte de la station |
| [La synthèse et les alertes](docs/synthese.md) | Les points retenus, leurs seuils, les niveaux, la vigilance officielle |
| [Le bulletin du jour](docs/bulletin.md) | Comment il est rédigé |
| [Sources et réglages](docs/sources.md) | Météo-France, station, soleil, Atmo France, historique, toutes les clés |
| [Pluie, vent, pression](docs/mesures.md) | Cumuls, courbes, tendances, ce qui est calculé depuis l’historique |
| [Fonctionnement technique](docs/technique.md) | Moteur, coordinateur, capteurs, API, tests |

## Limites

Le ressenti est une **estimation locale**, pas une mesure physiologique ni une vigilance officielle. Niak Weather n’est pas un modèle de prévision : il lit et explique les prévisions de votre fournisseur. Il ne détecte pas la foudre. Ses alertes ne remplacent ni la vigilance Météo-France ni les consignes de sécurité.

## Licence

[MIT](LICENSE)
