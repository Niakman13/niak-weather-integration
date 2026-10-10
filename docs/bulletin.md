# Le bulletin du jour

[Accueil](../README.md) · [Le ressenti](ressenti.md) · [La synthèse et les alertes](synthese.md) · [Sources et réglages](sources.md) · [Pluie, vent, pression](mesures.md) · [Fonctionnement technique](technique.md)

Le bulletin raconte la suite de la journée comme un prévisionniste, en **deux phrases** au plus, à partir des prévisions heure par heure de votre entité météo.

> Ce soir et cette nuit, pluie jusqu’à 20 h et averses à partir de 5 h (3,1 mm), puis le ciel se dégage ; 13 °C au petit matin. Demain, la pluie cesse vers midi, puis éclaircies ; jusqu’à 23 °C.

## Deux moments

Les heures sont rangées en deux blocs :

- **le jour**, de 6 h à 18 h : « Aujourd’hui », « Cet après-midi », « Demain »… ;
- **la nuit**, de 18 h à 6 h, rattachée au soir qui la précède : « Ce soir et cette nuit ».

Après minuit, le jour qui commence est nommé par son nom (« Samedi »). Chaque phrase donne le temps, puis la température utile, puis le vent s’il compte.

## Le temps

- **Pluie** : ses heures (« jusqu’à 20 h », « à partir de 5 h », « de 14 h à 17 h », « vers 16 h ») et son cumul dès 1 mm. Une seule heure sèche entre deux averses ne coupe pas l’épisode. Au-delà de deux épisodes : « averses par moments ».
- Les mots suivent l’intensité : **quelques gouttes**, **averses** (courtes et faibles), **pluie**, **fortes pluies** (4 mm/h en moyenne et plus). **Orages** et **neige** gardent leur nom ; la neige ne se dit pas en millimètres.
- Une pluie qui continue d’une phrase à l’autre **cesse** (« la pluie cesse vers midi ») au lieu de recommencer sous un autre nom.
- **Le ciel** des heures sèches : stable (« grand soleil », « ciel couvert ») ou qui change (« ciel gris au lever du jour, puis le soleil revient vers midi »). Une heure isolée ne compte pas : c’est le fournisseur qui hésite, pas le ciel qui change.

## La température utile

- **La nuit** : la minimale, « au petit matin » si elle tombe entre 3 h et 8 h. Elle n’est donnée que si les prévisions couvrent ces heures. Les mots : gel (0 °C et moins), froid avec gelée possible (3 °C et moins), frais (moins de 10 °C), nuit chaude (20 °C et plus).
- **Le jour** : la maximale. Les mots : sans dégel (0 °C et moins), froid (5 °C et moins), chaud (30 °C), très chaud (35 °C).

## Le vent

Cité à partir de 30 km/h de vent moyen (« assez fort », « fort » dès 40 km/h), avec sa direction, et les rafales dès 50 km/h. S’il souffle encore dans la phrase suivante : « vent toujours fort » ; s’il tombe : « le vent faiblit ».

Sans pluie sur les deux moments, la dernière phrase se termine par « sans pluie ».

## Les limites

Le bulletin **relit les prévisions du fournisseur** : il ne prévoit rien lui-même et ne corrige pas les prévisions avec la station. Sa justesse est celle des prévisions reçues.

[Le rédacteur dans le code](../custom_components/niak_weather/engine/bulletin.py).
