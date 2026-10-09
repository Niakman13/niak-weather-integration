# Niak Weather — intégration

[![release](https://img.shields.io/github/v/release/Niakman13/niak-weather-integration?include_prereleases)](https://github.com/Niakman13/niak-weather-integration/releases)
[![Validate](https://github.com/Niakman13/niak-weather-integration/actions/workflows/validate.yml/badge.svg)](https://github.com/Niakman13/niak-weather-integration/actions/workflows/validate.yml)
[![HACS](https://img.shields.io/badge/HACS-Custom-orange)](https://hacs.xyz)
[![License](https://img.shields.io/github/license/Niakman13/niak-weather-integration)](LICENSE)

[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/Niakman13)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-frankblemont-FFDD00?logo=buymeacoffee&logoColor=black)](https://www.buymeacoffee.com/frankblemont)
[![PayPal](https://img.shields.io/badge/PayPal-Donate-00457C?logo=paypal&logoColor=white)](https://paypal.me/frankblemont)

**Le cerveau de la météo chez vous.** L’intégration lit vos prévisions, votre station et la qualité de l’air.
Elle calcule ce qu’ils veulent dire : ressenti, alertes, pluie à venir, tendances, bulletin du jour.
Elle donne le résultat à la [carte Niak Weather](https://github.com/Niakman13/niak-weather) et à vos automatisations.

> **Version bêta (2.0.0b1).** À installer avec la carte Niak Weather 2.0 bêta.

## Ce qu’il faut

- Home Assistant **2025.1** ou plus récent.
- Une entité météo `weather.*`. **Météo-France** est conseillée.
- En plus, si vous en avez : une station météo, Atmo France (air et pollens), la vigilance Météo-France.

## Installation

1. Dans HACS, ajoutez ce dépôt comme **dépôt personnalisé**, catégorie **Intégration**.
2. Installez **Niak Weather**, puis redémarrez Home Assistant.
3. **Paramètres → Appareils et services → Ajouter une intégration → Niak Weather.**

[![Ouvrir dans HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Niakman13&repository=niak-weather-integration&category=integration)

## Configuration

Chaque champ est déjà rempli avec ce que Home Assistant connaît.
Vous vérifiez, vous corrigez si besoin, c’est tout.

- **Vous utilisez déjà la carte Niak Weather ?** L’intégration propose de reprendre ses réglages.
- **Météo** : la source des prévisions, le nom du lieu, la vigilance, la saison.
- **Station météo** : le modèle (GW2000A, WS90 ou autre), puis chaque capteur.
- **Qualité de l’air et pollens** : la zone Atmo France.

Un champ laissé vide est un choix : il n’est jamais rempli à votre place.
Tout se modifie ensuite dans **Configurer**, une partie à la fois.

Plusieurs lieux ? Ajoutez l’intégration une fois par lieu.

## Les capteurs

| Capteur | Ce qu’il donne |
| --- | --- |
| Ressenti | La température ressentie, en °C, avec ses causes (vent, soleil, pluie, humidité). |
| Point de rosée, point de givre, humidex | Calculés depuis votre station, ou depuis le bulletin sans station. |
| Alerte de la station | Orage, forte pluie, rafales, canicule, gel, chaleur, froid, UV, ou aucune. |
| En bref | Le titre de la synthèse ; le texte complet est en attribut. |
| Pluie dans | Le nombre d’heures avant la prochaine pluie prévue. |
| Tendance de la pression | L’écart sur 3 h, en hPa. |
| Pluie sur 24 h, rafale maximale du jour, tendance de la température | Ceux de la station, ou calculés depuis l’historique. |

Une valeur inconnue reste **inconnue** : rien n’est inventé.

## Comment ça marche

- Les calculs suivent vos capteurs en direct, à deux secondes près.
- Les prévisions sont relues toutes les 15 minutes.
- L’historique (vent, pression, pluie) vient du Recorder de Home Assistant.
- La carte reçoit tout, déjà calculé : elle ne fait plus qu’afficher.

## Licence

[MIT](LICENSE)
