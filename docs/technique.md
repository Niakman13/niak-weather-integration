# Fonctionnement technique

[Accueil](../README.md) · [Le ressenti](ressenti.md) · [La synthèse et les alertes](synthese.md) · [Le bulletin du jour](bulletin.md) · [Sources et réglages](sources.md) · [Pluie, vent, pression](mesures.md)

Cette page s’adresse à qui veut comprendre ou modifier Niak Weather.

## Le but

Niak Weather est **le cerveau** : il lit les sources, calcule, et donne le résultat à ceux qui l’affichent ou s’en servent.

- La [carte Niak Weather](https://github.com/Niakman13/niak-weather) ne fait qu’afficher ce qu’il lui envoie.
- Les capteurs servent aux automatisations : volets, chauffage, arrosage, notifications.

Les calculs sont faits **une fois, dans Home Assistant**, au lieu de l’être dans chaque navigateur ouvert.

## Deux étages

| Dossier | Rôle |
| --- | --- |
| `custom_components/niak_weather/engine` | **Le moteur**, en Python pur, sans Home Assistant : unités, humidité, ressenti, conditions, prévisions, tendances, historiques, saisons, Atmo, synthèse, bulletin, modèle de vue. Il se teste seul. |
| `custom_components/niak_weather` | **La couche Home Assistant**, mince : parcours de configuration, coordinateur, capteurs, API websocket. |

Fichiers principaux du moteur : `feel.py` (ressenti et alerte de la station), `local.py` (la météo locale assemblée), `brief.py` (synthèse), `alerts.py` (ce que montrent les bulles et la frise), `bulletin.py` (bulletin du jour), `station.py` et `series.py` (historiques), `view.py` (ce que reçoit la carte), `detection.py` (reconnaissance de la station et des sources).

## Le coordinateur

- Il écoute les capteurs choisis et recalcule **2 secondes** après un changement (plusieurs changements rapprochés font un seul calcul).
- Il recalcule aussi **chaque minute**, pour ce qui dépend de l’heure.
- Il demande les prévisions (`weather.get_forecasts`, heures et jours) toutes les **15 minutes**, et réessaie en cas d’échec : après 10 s, 20 s, 40 s… jusqu’à 1 minute. Il relance aussi la lecture à la fin du démarrage de Home Assistant.
- Il lit l’historique du Recorder : vent et pression toutes les 5 minutes, pluie et statistiques toutes les 15 minutes.

## Les capteurs

Onze capteurs par lieu, aux identifiants fixes : `sensor.niak_weather_ressenti`, `…_point_de_rosee`, `…_point_de_givre`, `…_humidex`, `…_alerte`, `…_en_bref`, `…_pluie_dans`, `…_tendance_pression`, `…_pluie_24h`, `…_rafale_max_jour`, `…_tendance_temperature`. Pour un deuxième lieu, son nom s’ajoute : `sensor.niak_weather_marseille_ressenti`.

Une valeur inconnue reste **inconnue** : rien n’est inventé. Les longs textes de la synthèse sont en attributs, non enregistrés par le Recorder.

## L’API websocket

| Commande | Réponse |
| --- | --- |
| `niak_weather/entries` | La liste des lieux configurés (`entry_id`, `title`). |
| `niak_weather/subscribe` (`entry_id` facultatif avec un seul lieu) | Un message `{version, entryId, title, view}` à l’abonnement, puis à chaque changement de la vue. `{reload: true}` quand le lieu est reconfiguré. |

La **vue** contient tout ce que la carte affiche, déjà calculé et rédigé en français :

- conventions : clés en camelCase, temps en secondes depuis 1970, valeur inconnue absente (jamais `null`), points de graphique `[secondes, valeur]` ;
- chaque point de la synthèse porte son heure (`at`, `clock`), et chaque heure de prévision la sienne (`time`), pour la frise ;
- elle est décrite par `engine/view.py`, et côté carte par `src/view.ts` ;
- `version` monte seulement si une carte plus ancienne ne peut plus la lire : elle demande alors sa mise à jour.

## Tests

```sh
python -m venv .venv && .venv/bin/pip install pytest
.venv/bin/python -m pytest -q
```

Plus de 300 tests couvrent :

- le ressenti, comparé à 96 jeux de référence calculés indépendamment ;
- les conditions observées, la synthèse et ses seuils, les alertes ;
- le bulletin, les historiques de la station, Atmo France, les saisons ;
- la reconnaissance des capteurs et la vue envoyée à la carte.

La CI lance aussi `hassfest` et la validation HACS.

`scripts/view_cli.py` calcule une vue à partir d’un scénario JSON : le banc de la carte s’en sert pour dessiner ses démonstrations avec le vrai moteur.

## L’icône

`custom_components/niak_weather/brand/icon.png` : Home Assistant l’affiche pour l’intégration, à partir de la version 2026.
