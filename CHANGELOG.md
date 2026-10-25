## 2.8.3 — Stable : barres de pluie sur 24 h et 30 jours

- Les barres de pluie sur 24 heures et 30 jours s’affichent même quand la station démarre après Niak Weather : elles restaient sur 7 jours.
- Même correction pour les cumuls de la semaine, du mois et de l’année calculés depuis le compteur total, et pour les courbes du vent et de la pression sur plusieurs jours.

## 2.8.2 — Stable : UV avec une station Netatmo

- Avec une station Netatmo, la case « Indice UV » est de nouveau proposée dans Réglages → Station, rubrique Soleil : on peut y choisir le capteur UV d’un autre appareil, comme OpenUV.
- L’indice UV actuel d’OpenUV est reconnu automatiquement (ni son maximum du jour, ni son niveau en toutes lettres).
- Sans capteur UV, « UV forts » utilise l’indice UV du service météo au lieu de rester inconnu.

## 2.8.1 — Stable : l’heure, et pluie, vent et pression sur plusieurs jours

- Barres de pluie au choix : 24 dernières heures (une par heure), 7 jours ou 30 jours (une par jour), avec le total de la période.
- Courbes du vent et de la pression au choix : 6 heures, 24 heures, 2 jours ou 7 jours.
- L’heure peut s’afficher dans le bandeau, en grand sous le titre ou au-dessus de « En ce moment ».

Cette version stable reprend la bêta 2.8.1b1, avec en plus les périodes de la pluie et du vent.

## 2.8.1b1 — Bêta : l’heure et la pression sur plusieurs jours

- La courbe de pression peut montrer les 6 dernières heures, 24 heures, 2 jours ou 7 jours : réglage « Courbe de pression » dans la section Aujourd’hui de la carte.
- L’heure peut s’afficher dans le bandeau, en grand sous le titre ou au-dessus de « En ce moment » : réglage « Heure dans le bandeau ».

## 2.8.0 — Stable : accueil technique et réglages par sujet

- Nouvel accueil technique : état de Weather, problèmes à corriger, extensions installées/configurées, statistiques, versions et liens utiles.
- Réglages regroupés par sujet : Météo-France et Blitzortung dans Sources météo, air et pollens dans leurs onglets, Vigieau dans Eau et jardin.
- Menu à icônes conforme à Niak Confort et cadres lisibles avec les thèmes Home Assistant, notamment Nordic.
- Choix conservés entre les onglets et anciens liens compatibles.

Cette version stable reprend la bêta 2.8.0b4 validée, sans changement fonctionnel supplémentaire.

## 2.8.0b4 — Bêta : réglages par sujet

- L’onglet Extensions est supprimé : les intégrations d’air et de pollens se règlent dans leurs onglets, Vigieau dans Eau et jardin, Blitzortung dans Sources météo.
- Météo-France est identifié dans Sources météo, avec son état d’installation et sa sélection enregistrée pour le lieu.
- Le menu de configuration reprend les deux rangées arrondies à icônes de Niak Confort.
- Les anciens liens Extensions ouvrent Sources météo ; le brouillon reste conservé entre les onglets et le nouvel assistant passe par Eau et jardin.

## 2.8.0b3 — Bêta : tableau de bord technique et thèmes Home Assistant

- La vue d’ensemble Météo devient un accueil technique : état des sources, prévisions reçues, dernier calcul, capteurs de la station, historique, entités et liaisons avec les autres briques.
- Les indicateurs distinguent les capteurs qui répondent, les entités avec une valeur et les points à régler. Les données pas encore reçues restent inconnues.
- L’accueil affiche une synthèse des extensions par catégorie, avec leur état installé/configuré, les accès directs aux réglages, les versions et les liens utiles. La sélection des données et l’aide à l’installation restent dans les réglages.
- En suivant le thème Home Assistant, les cadres restent visibles même si le thème donne aux séparateurs la couleur du fond, comme Nordic Perso. Les couleurs et la typographie du thème sont conservées.

## 2.8.0b2 — Bêta : extensions rangées par usage

- Les extensions sont regroupées dans quatre catégories repliables : **Qualité de l’air**, **Pollens**, **Eau et jardin**, **Orages et éclairs**.
- L’accueil et les réglages présentent les mêmes catégories, avec le nombre d’extensions configurées visible sans les ouvrir.
- Atmo France apparaît dans Air et dans Pollens ; chaque entrée indique son propre état et ouvre le bon réglage.

## 2.8.0b1 — Bêta : les extensions météo à portée de main

- L’accueil Météo présente les extensions : installées, configurées pour le lieu, ou pas encore installées.
- Blitzortung et Vigieau sont visibles avec un accès à leur configuration et des indications d’installation.
- Le menu Météo rejoint la logique de Confort : **Vue d’ensemble** et **Réglages généraux**.
- Les rubriques Sources météo, Station météo · capteurs locaux, Qualité de l’air, Pollens et Entités sont regroupées dans les réglages, avec les Extensions.
- Les anciens liens de configuration restent utilisables. Les changements restent en brouillon jusqu’à l’enregistrement.

## 2.7.0 — Stable : les éclairs et les restrictions d’eau

**En bref**

- **L’orage vu, pas seulement prévu.** Avec l’intégration Blitzortung, Niak Weather voit les éclairs autour de chez vous : à moins de 30 km, le capteur Orage s’allume et dit où est l’orage et s’il se rapproche.
- **Les restrictions d’eau de votre commune.** Avec l’intégration Vigieau, un nouveau capteur « Restrictions d’eau » (famille Jardin) donne le niveau de l’arrêté sécheresse.

### Nouveautés

- Éclairs à moins de 30 km : le capteur Orage s’allume, même sans orage prévu. « Orage à 12 km au sud-ouest, il se rapproche ». Distance, direction et tendance en attributs.
- Éclairs à moins de 10 km : le temps du moment et le ciel animé passent à « Orage ».
- Un orage plus lointain est signalé pour information, sans alerte.
- Capteur « Restrictions d’eau » : pas de restriction, vigilance, alerte, alerte renforcée ou crise ; usages restreints et lien de l’arrêté en attributs.
- Dès le niveau « Alerte », la carte et la synthèse le disent, en précisant si l’arrosage est restreint.
- Les autres briques Niak reçoivent les éclairs et les restrictions d’eau.

### Améliorations

- Vigieau et Blitzortung se choisissent dans l’étape Sources météo ; Niak les trouve seul quand il n’y a qu’un choix (pour Vigieau, la zone de l’eau du robinet).

## 2.6.3 — Stable : la couverture nuageuse partagée

**En bref**

- **La couverture nuageuse est partagée avec les autres briques Niak.** Niak Confort s’en sert pour estimer le soleil quand votre station est à l’ombre.

### Nouveautés

- La prévision heure par heure transmise aux autres briques donne aussi la couverture nuageuse (en %), quand le service météo la fournit.

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
