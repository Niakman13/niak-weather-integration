## 2.5.5b3 — Bulletin du jour et brouillard sous la pluie

- Nouveau capteur **Bulletin du jour** (`sensor.niak_weather_bulletin_du_jour`) : le texte de la prévision, prêt à lire sur une enceinte ou à envoyer en notification. Le texte entier et chaque moment de la journée sont aussi en attributs.
- Correction : sans pluviomètre, une humidité de 99 % ne fait plus afficher « Brouillard » quand le bulletin annonce de la pluie ou de la neige. Un pluviomètre qui ne mesure rien garde le brouillard.

## 2.5.5b2 — WAQI, deuxième source pour l’air

- Nouvelle source de qualité de l’air au choix, à côté d’Atmo France : **WAQI** (intégration « World Air Quality Index » de Home Assistant, jeton gratuit sur aqicn.org).
- Aujourd’hui : la mesure de la station choisie, ramenée à l’indice de 1 à 6 d’Atmo.
- Demain : la prévision Open-Meteo (modèle européen Copernicus), sans clé. Elle n’est demandée qu’avec WAQI, à la position de la maison.
- La carte, le panneau Niak et le capteur Qualité de l’air disent d’où vient l’air : « WAQI » ou « Open-Meteo ».
- Une station qui ne répond plus s’affiche « Indisponible » : aucun relais automatique.

## 2.5.2 — Formulaires harmonisés

- Les rubriques Weather reprennent les composants de Confort : réglages regroupés par sujet, mêmes titres et espacements, aides nommées en info-bulles.
- Les prévisions, alertes, mesures principales, sources d’air et de pollens et familles d’entités restent visibles. Les détails avancés gardent un repli.
- Les réglages généraux de Confort utilisent des lignes ouvertes à l’intérieur des groupes, sans cadre supplémentaire pour chaque capteur.

## 2.5.1 — Affichage du hub

- L’accueil et le menu occupent toute la hauteur disponible dans Home Assistant, y compris lorsque seule une brique est à jour.
- Le menu de configuration d’une pièce s’aligne sur toute la largeur du formulaire.
- Dans Accueil Niak → Réglages, choix mémorisé entre les couleurs et la police du thème Home Assistant et la palette Niak. Niak conserve le suivi du mode clair ou sombre de Home Assistant.
- La section Affichage reste toujours visible, sans repli.

## 2.5.0 — Le nouveau hub Niak

- Menu latéral regroupé par brique, avec accès direct aux sources météo, à la station, à la qualité de l’air, aux pollens et aux entités.
- Vue d’ensemble des lieux configurés et bouton Configurer pour chacun.
- Interface harmonisée en clair et sombre, adaptée au téléphone ; aides nommées en info-bulles, recommandations et erreurs visibles.
- Choix et brouillons conservés pendant la navigation. Weather reste utilisable seul ; les briques absentes ne créent pas de menus inutiles.
- Préférence pour masquer l’entrée Niak dans le menu Home Assistant, en gardant l’accès aux réglages par l’intégration.

Les sources, paramètres, entités et données existantes sont conservés. Après mise à jour HACS, redémarrez Home Assistant.
