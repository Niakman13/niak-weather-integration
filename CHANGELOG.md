## 2.6.2 — Stable : la saison partagée

**En bref**

- **La saison est partagée avec les autres briques Niak.** Niak Confort s’en sert pour adapter ses conseils à l’été, à l’hiver et aux entre-saisons.

### Nouveautés

- Les autres briques Niak reçoivent la saison affichée par Niak Weather : celle de votre capteur Saison s’il est choisi, sinon celle du calendrier, avec la durée du jour.

## 2.6.1 — Stable : la pluie à la minute

**En bref**
- **« Pluie dans » donne enfin le temps qui reste**, à la minute près grâce à la pluie dans l’heure de Météo-France.

### Améliorations
- Le capteur « Pluie dans » donnait le numéro du créneau horaire (0 voulait dire « quelque part dans ce créneau »). Il donne maintenant le temps qui reste, en heures avec une décimale ; ses attributs disent aussi les minutes et d’où vient l’information (radar ou prévision).
- Quand la pluie dans l’heure de Météo-France ne voit rien tomber, la pluie de la prévision horaire est repoussée après cette heure sèche.

### Nouveautés
- Les autres briques Niak (Niak Confort) reçoivent l’heure de la prochaine pluie.

## 2.6.0 — Stable : ciel animé plus vivant

- Nouveauté : le vent se voit enfin. Météo-France n’annonce jamais « venteux » : c’est maintenant la force du vent qui compte. Une brise (dès 25 km/h, ou rafales à 45 km/h) dessine quelques filets d’air, un vent fort (dès 40 km/h, ou rafales à 70 km/h) des filets rapides qui poussent la pluie et la neige de biais.
- Nouveauté : par vent fort, la saison s’envole : pétales au printemps, aigrettes de pissenlit en été, feuilles de platane en automne, feuilles sèches en hiver.
- Amélioration : une pluie plus naturelle, chaque goutte avec sa longueur, son épaisseur et sa vitesse.
- Amélioration : une neige plus douce, aux flocons de tailles variées, un peu flous de près.
- Amélioration : le brouillard se voit mieux sur un thème clair.
- Nouveauté : le ciel animé distingue ce que Météo-France distingue : bruine, averses avec éclaircies, pluie verglaçante, brume, bancs de brouillard, brouillard givrant, quelques flocons, neige forte, risque d’orages, orage avec grêle… Le plus fidèle avec le capteur « Condition d’origine » de Météo-France activé ; sans lui, une partie se déduit des chiffres.

## 2.5.9 — Stable : appui court au choix

- Nouveauté : sur la tuile, l’appui court se choisit comme l’appui long, dans Fonctionnalités : déplier ou replier, ouvrir la météo complète en fenêtre, ouvrir une page, ou rien.
- Par défaut, rien ne change : l’appui déplie la tuile, l’appui long ouvre la météo complète (ou la page choisie).

## 2.5.8 — Stable : mini et maxi du jour

- Nouveauté : sous la température actuelle, la tuile et la carte complète montrent le mini et le maxi prévus aujourd’hui (↓ 16° ↑ 25°), jusqu’à minuit.

## 2.5.6 — Stable : bordures des événements

- Correction : dans les Événements, l’icône de la phrase qui défile (pluie, qualité de l’air…) n’a plus son bord gauche coupé.
- Correction : le contour de la pastille active de la frise n’est plus mangé par son icône.

## 2.5.5 — Stable : WAQI, Bulletin du jour, brouillard sous la pluie

Reprend les préversions 2.5.5b1 à 2.5.5b3 ci-dessous : panne d’une source d’air ou de pollens signalée, WAQI comme deuxième source pour l’air, capteur Bulletin du jour, brouillard corrigé sous la pluie.

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
