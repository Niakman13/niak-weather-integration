# Pluie, vent, pression

[Accueil](../README.md) · [Le ressenti](ressenti.md) · [La synthèse et les alertes](synthese.md) · [Le bulletin du jour](bulletin.md) · [Sources et réglages](sources.md) · [Fonctionnement technique](technique.md)

Les mesures de la station passent toujours en premier ; le bulletin complète ce qui manque, en le disant. Les historiques viennent **seulement** des capteurs enregistrés : ils ne sont jamais reconstitués à partir des prévisions.

## Pluie

Le chiffre principal est la pluie **des dernières 24 h** si la station la donne, sinon celle **depuis minuit**. Ces deux périodes ne sont pas mélangées.

**Sans compteur 24 h ni compteur du jour**, mais avec un **compteur total** (qui ne fait que monter), Niak Weather calcule lui-même la pluie des dernières 24 h, du jour, de la semaine, du mois et de l’année, à partir de l’historique et des statistiques longue durée de Home Assistant. Une remise à zéro du compteur est suivie ; une petite baisse n’est pas comptée comme de la pluie. Si une partie de la période manque, le total est marqué **≥** : il peut être plus élevé.

Les **7 derniers jours** viennent de l’historique du compteur du jour (son maximum chaque jour, dans le fuseau de Home Assistant), ou du compteur total. Un jour sans données est un tiret, pas un zéro ; un jour incomplet est marqué **≥**.

Sans station, le cadre décrit l’état du bulletin (« Pluie », « Temps sec ») et le cumul prévu : jamais un cumul mesuré inventé.

## Vent

Le chiffre principal est le **vent moyen** ; les rafales sont à côté (ce sont les pointes, pas la même mesure). Sans vent moyen, les rafales deviennent le chiffre principal.

La courbe couvre 6 heures, par tranches de 10 minutes : moyenne pondérée par la durée pour le vent moyen, maximum pour les rafales. Le dernier point est la lecture du moment. Les périodes inconnues restent des coupures.

La **rafale maximale du jour** vient de la station, ou est calculée depuis l’historique des rafales depuis minuit (marquée **≥** si l’historique est partiel). La direction absente n’est jamais remplacée par 0°.

## Pression

La pression en hPa et sa variation : la dernière lecture comparée à celle d’il y a **3 heures** (au moins 20 minutes d’historique). Sous 0,05 hPa, elle est « stable ». La courbe couvre 6 heures, par tranches de 10 minutes. Une pression qui baisse n’est jamais présentée comme une pluie certaine.

## Température

La tendance en °C par heure vient d’un capteur de la station s’il existe, sinon de l’historique du thermomètre sur la dernière heure. Elle n’est affichée qu’à partir de 0,1 °C par heure.

## À quel rythme

| Lecture | Fréquence |
| --- | --- |
| Vos capteurs | En direct, regroupés sur 2 secondes |
| Recalcul complet (heure qui passe, dates, tendances) | Chaque minute |
| Prévisions | Toutes les 15 minutes (nouvel essai après 1 minute en cas d’échec) |
| Historique vent et pression (6 h) | Toutes les 5 minutes |
| Historique et statistiques de pluie (8 jours, année) | Toutes les 15 minutes |

[Les calculs dans le code](../custom_components/niak_weather/engine/station.py).
