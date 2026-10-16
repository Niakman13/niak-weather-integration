# Niak Weather — intégration

[![release](https://img.shields.io/github/v/release/Niakman13/niak-weather-integration?cacheSeconds=86400)](https://github.com/Niakman13/niak-weather-integration/releases)
[![Validate](https://github.com/Niakman13/niak-weather-integration/actions/workflows/validate.yml/badge.svg)](https://github.com/Niakman13/niak-weather-integration/actions/workflows/validate.yml)
[![HACS](https://img.shields.io/badge/HACS-Custom-orange)](https://hacs.xyz)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/Niakman13)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-frankblemont-FFDD00?logo=buymeacoffee&logoColor=black)](https://www.buymeacoffee.com/frankblemont)
[![PayPal](https://img.shields.io/badge/PayPal-Donate-00457C?logo=paypal&logoColor=white)](https://paypal.me/frankblemont)

<img src="docs/images/icon.png" alt="" width="96" align="right">

**Le cerveau de la météo chez vous.** L’intégration lit vos prévisions, votre station et la qualité de l’air. Elle calcule ce qu’ils veulent dire : ressenti, alertes, bulletin du jour, pluie à venir, tendances, bilans.

Elle donne le résultat à **sa carte**, fournie avec elle, et à vos automatisations.

![Niak Weather — votre station météo et les prévisions, réunies en une carte qui parle](docs/carte/images/niak-weather-banner.png)

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
- En plus, si vous en avez : une station météo, les vigilances de Météo-France ou de MeteoSwiss, Atmo France (air et pollens), Polleninformation, IRM KMI, Swiss Pollen ou Kleenex / Scottex.

## Installation

1. Dans HACS, ⋮ → **Dépôts personnalisés** : ajoutez `https://github.com/Niakman13/niak-weather-integration`, catégorie **Intégration**.
2. Installez **Niak Weather**, puis redémarrez Home Assistant.
3. **Paramètres → Appareils et services → Ajouter une intégration → Niak Weather.**
4. Sur un tableau de bord : **Ajouter une carte → Niak Weather**. La carte est fournie par l’intégration (depuis la 2.3) : rien d’autre à installer.

[![Ouvrir dans HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Niakman13&repository=niak-weather-integration&category=integration)

## Configuration

Chaque champ est déjà rempli avec ce que Home Assistant connaît : vous vérifiez, vous corrigez si besoin.

Un guide en quatre étapes, puis un récapitulatif :

1. **Météo** : l’entité météo, le nom du lieu, la vigilance, la saison.
2. **Station météo** : le modèle (GW2000A, WS90, Netatmo ou autre), puis chaque capteur.
3. **Qualité de l’air**, puis **Pollens** : l’air d’Atmo France, et les pollens d’Atmo France, de Polleninformation, d’IRM KMI (Belgique), de Swiss Pollen (Suisse) ou de Kleenex / Scottex (France et autres pays couverts).
4. **Capteurs et automatisations** : les familles d’entités à activer.

Vous utilisez déjà la carte Niak Weather ? Le guide propose de reprendre ses réglages. Un champ laissé vide est un choix : il n’est jamais rempli à votre place.

**Configurer** conduit au **hub Niak**. Depuis la version **2.5.0**, son menu regroupe Accueil Niak, Weather et Confort selon les briques installées. La vue d’ensemble Weather présente les lieux et leur bouton **Configurer**. Les rubriques **Sources météo**, **Station météo · capteurs locaux**, **Qualité de l’air**, **Pollens** et **Entités** ouvrent directement le réglage correspondant. Plusieurs lieux ? Choisissez le lieu à configurer. Le récapitulatif permet de vérifier et d’enregistrer l’ensemble.

L’interface suit le thème clair ou sombre de Home Assistant et s’adapte au téléphone. Les explications sont dans les aides nommées ; les recommandations restent visibles. Weather fonctionne seul. L’entrée Niak du menu Home Assistant peut être masquée dans **Accueil Niak → Réglages** ; le panneau reste accessible depuis la roue de l’intégration et le bouton **Visiter** de ses appareils. [Détail des sources et des réglages](docs/sources.md).

## La carte

Sept cartes à choisir dans **Ajouter une carte** : complète, tuile, tuile dépliée, mini, prévisions, pluie et alerte. Toutes s’écrivent `type: custom:niak-weather-card`, seul `format` change. [La carte en détail : formats, réglages, visuel](docs/carte/README.md).

![Niak Weather — tuile pleine et demi-largeur repliées, puis tuile dépliée, par temps d’orage avec vigilance jaune](docs/carte/images/niak-weather-formats.png)

Vous aviez installé la carte depuis HACS ? **Retirez-la de HACS**, puis rechargez la page : vos cartes restent en place. Tant qu’elle reste installée, l’accueil du panneau **Niak** l’indique en orange.

Dans l’application Home Assistant, une carte reste invisible juste après une mise à jour ? Réinitialisez son cache : **Paramètres → Application compagnon → Dépannage → Réinitialiser le cache du frontend**.

## Les capteurs et les automatisations

Niak Weather dit ce que la météo implique ; vos automatisations décident quoi en faire. Les entités sont rangées en sept familles :

| Famille | Par exemple |
| --- | --- |
| **Maintenant** | Ressenti, point de rosée, temps observé, pluie en cours |
| **Alertes** | Vigilance officielle (Météo-France ou MétéoSuisse), orage, vent fort, pluie forte, gel, canicule |
| **Prochaines heures** | Pluie dans l’heure, sur 6 h et 24 h, minimale de la nuit, maximale de demain |
| **Jardin** | Pluie des 7 derniers jours |
| **Bâtiment** | Degrés-jours de chauffe et de climatisation |
| **Énergie** | Ensoleillement de demain |
| **Vie pratique** | Séchage du linge, givre sur le pare-brise, qualité de l’air, pollens |

Chaque entité dit **pourquoi** (attribut `raison`) et **d’où vient** sa valeur (`source`). En plus des capteurs :

- l’évènement **`niak_weather_alerte`**, au début, au changement et à la fin de chaque alerte ;
- l’action **`niak_weather.prevision`**, qui répond à « quel temps entre 16 h 15 et 17 h ? » ;
- l’entité **`weather.niak_weather`** (à activer) : le temps vu par votre station, avec les prévisions du fournisseur ;
- des **modèles d’automatisation** à importer en un clic : notifier les alertes, protéger avant le gel, le bulletin du matin.

[Toutes les entités, leurs rôles et les modèles à importer](docs/capteurs.md). Un deuxième lieu ajoute son nom : `sensor.niak_weather_marseille_ressenti`. Une valeur inconnue reste **inconnue** : rien n’est inventé.

## Documentation

| Page | Ce qu’elle explique |
| --- | --- |
| [La carte](docs/carte/README.md) | Les sept cartes, le bandeau, les réglages, le visuel, les messages |
| [Les capteurs et les automatisations](docs/capteurs.md) | Les sept familles d’entités, l’évènement d’alerte, l’action, l’entité météo, les modèles à importer |
| [Le ressenti](docs/ressenti.md) | Humidex, effets du vent, du soleil, de la pluie et de la nuit, mots et nuances, alerte de la station |
| [La synthèse et les alertes](docs/synthese.md) | Les points retenus, leurs seuils, les niveaux, la vigilance officielle |
| [Le bulletin du jour](docs/bulletin.md) | Comment il est rédigé |
| [Sources et réglages](docs/sources.md) | Météo-France, station, soleil, Atmo France, historique, toutes les clés |
| [Pluie, vent, pression](docs/mesures.md) | Cumuls, courbes, tendances, ce qui est calculé depuis l’historique |
| [Fonctionnement technique](docs/technique.md) | Moteur, coordinateur, capteurs, API, tests ; le code de la carte est dans `card/` |

## Limites

Le ressenti est une **estimation locale**, pas une mesure physiologique ni une vigilance officielle. Niak Weather n’est pas un modèle de prévision : il lit et explique les prévisions de votre fournisseur. Il ne détecte pas la foudre. Ses alertes ne remplacent ni la vigilance Météo-France ni les consignes de sécurité.

## Licence

[MIT](LICENSE)
