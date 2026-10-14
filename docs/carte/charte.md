# Charte et organisation du code

Cette page s’adresse à qui veut modifier la carte. Elle explique où se décide chaque chose, pour qu’un changement se fasse à un seul endroit et s’applique partout : tuile, tuile dépliée et carte complète.

## Trois étages

| Dossier | Rôle | Ce qu’on y trouve |
| --- | --- | --- |
| [Intégration](https://github.com/Niakman13/niak-weather-integration) | **Calculer**, sans rien afficher | Ressenti, conditions, brief, bulletin, alertes, historiques de la station, Atmo, saisons. Elle envoie à la carte tout ce qu’elle montre, en français clair ; `src/view.ts` décrit cet envoi. |
| `src/ui` | **Les pièces** de la charte | `charter.ts` (jetons et pièces de base), `parts.ts` (bulles, pastilles, en-têtes de cadre, bouton « i »), `ticker.ts` (la bulle qui défile), `frise.ts` (la frise du bandeau), `weather-sky.ts` (le ciel animé). |
| `src/views` | **Assembler** les écrans | `tile.ts` (tuile qui se déplie), `hero.ts` (bandeau de la carte complète), `today.ts`, `forecasts.ts`, `air.ts`, `full.ts` (la carte complète et ses sections repliables). |

`src/niak-weather-card.ts` s’abonne à l’intégration, choisit le format et gère les gestes (appui, appui long, clavier, fenêtre complète). `src/display.ts` applique les réglages d’affichage, `src/ui/charts.ts` dessine les courbes à partir des points reçus, `src/frise.ts` prépare la frise (étiquettes, segments du ciel, heures). `src/editor` contient l’éditeur des réglages d’affichage.

Les vues ne lisent que le modèle de vue : elles ne connaissent ni les identifiants des capteurs, ni les unités à convertir, ni les noms internes du moteur. Ajouter une information, c’est l’ajouter au modèle de vue de l’intégration (`engine/view.py`, avec un test dans `tests/test_view.py`) et à `src/view.ts`, puis l’afficher avec les pièces existantes.

## La charte : un seul fichier

Toute l’apparence se décide dans `src/ui/charter.ts`. Les vues n’écrivent jamais une couleur, un arrondi ou une taille de texte en dur : elles utilisent ces jetons.

| Jeton | Rôle |
| --- | --- |
| `--nw-line` | Le contour de toutes les bulles, tuiles, pastilles et cadres |
| `--nw-radius` | L’arrondi unique des boîtes (14 px) ; `--nw-radius-pill` pour les pastilles |
| `--nw-glass-strong`, `--nw-blur` | Le verre posé sur le ciel : la bulle du brief, les étiquettes de la frise |
| `--nw-glass-clear`, `--nw-frost` | Le verre dépoli de la frise : plus clair pour laisser voir le ciel animé, plus flou pour rester lisible |
| `--nw-fs-label` … `--nw-fs-temp` | Les six tailles de texte : étiquette 10, secondaire 12, texte 13, titre 17, valeur 30, température 42 |
| `--nw-rain`, `--nw-wind`, `--nw-heat`, `--nw-cold`, `--nw-calm`, `--nw-pressure` | Les couleurs de sens, palette « Aube » (pastel, OKLCH, même clarté et même saturation) |
| `--nw-level1` à `--nw-level3` | Les niveaux d’alerte : jaune, orange, rouge |
| `--nw-ink` | La part de couleur dans un texte coloré : 34 % garde même le jaune lisible (contraste 4,5:1) |
| `--nw-expand`, `--nw-ease` | La durée et l’allure du dépliage |

Exemple : changer `--nw-line` change le contour de toute la carte, dans les trois formats. Changer `--nw-radius` arrondit toutes les boîtes de la même façon.

Les couleurs de fond, de texte et d’accent suivent le thème Home Assistant. Les couleurs de sens appartiennent à la carte, pour que leur sens ne change pas d’un thème à l’autre. Un thème peut néanmoins les remplacer :

```yaml
# Dans un thème Home Assistant
niak-rain-color: "#4fb3bf"
niak-level1-color: "#f2c94c"
```

Variables disponibles : `niak-rain-color`, `niak-wind-color`, `niak-heat-color`, `niak-cold-color`, `niak-calm-color`, `niak-pressure-color`, `niak-level1-color`, `niak-level2-color`, `niak-level3-color`.

## Les pièces

| Pièce | Classe | Où |
| --- | --- | --- |
| Étiquette en petites capitales | `.nw-label` | Partout |
| Bulle du brief, bulle d’alerte | `.nw-bubble`, `.nw-bubble--alert` | Bulle qui défile de la tuile repliée |
| Pastille de vigilance | `.nw-alert` avec `alertPill()` | Haut du bandeau et de la tuile |
| Frise | `<niak-frise>` | Bandeau de la carte complète, tuile dépliée |
| Pastille de source | `.nw-badge` | Un seul style pour toutes les sources |
| Pastille d’info teintée | `.nw-chip` | Facteurs du ressenti, tendances, mesures en plus |
| Cadre | `.nw-panel` avec `panelHead()` | Toute la carte complète |
| Légende | `.nw-legend` | Toujours centrée sous son graphique |
| Bouton « i » et bulle d’explication | `info()` | Synthèse, Ressenti |

Poids du texte : Home Assistant fournit Roboto en 400, 500 et 700, et un 600 s’affiche donc en gras. Le bulletin du jour (`.nw-bulletin`) et la pastille de source (`.nw-badge`) sont en 500 (moyen), jamais en gras.

Règles de la charte : seule l’icône d’une bulle prend la couleur de son thème, le contour coloré et le halo sont réservés aux alertes. Un graphique a un titre « période · unité » au-dessus, sa légende centrée en dessous et ses valeurs posées dessus.

## Le bandeau

Le bandeau tient en trois choses, du plus officiel au plus détaillé.

1. **La vigilance officielle** (Météo-France, pour le département) : une pastille compacte en haut, l’icône du phénomène dans un disque de la couleur du niveau. Elle porte le contour net et le halo des alertes, comme la bulle d’alerte. Sur une carte étroite, seul le phénomène reste écrit (« Orages ») : le disque et le halo disent le niveau. Sans vigilance, rien n’apparaît. Elle n’apparaît que là : la frise ne la répète pas.
2. **Le bulletin du jour**, en entier, sous l’étiquette « Bulletin du jour », en poids moyen (`.nw-bulletin`).
3. **La frise**, sous l’étiquette « Événements », dans un verre dépoli (`--nw-glass-clear`, `--nw-frost`) au contour net de 1 px. Elle montre la liste que l’intégration prépare pour elle : ce qui compte maintenant, puis chaque point des prochaines heures à son heure (pluie, orage, gel, brouillard, température, pluie de demain, air et pollens dès 3 sur 6), au plus 6 étiquettes. Les textes ne répètent pas l’heure : l’étiquette la donne.
   - en haut, **la phrase qui défile** : un point à la fois, toutes les 4,5 s, avec une barre de progression par point. Elle se met en pause au survol ou au focus ;
   - au-dessus de la piste, **une étiquette par point**, à son heure. Les points du moment (mesurés chez vous, ou à moins de 20 min) forment **une seule étiquette « Maintenant »**, avec leurs icônes empilées et leur nombre. L’étiquette prend entièrement la couleur du point affiché, icônes comprises ; l’icône de ce point passe devant, plus soutenue. Les points à moins d’une heure d’écart partagent une étiquette. Un appui sur une étiquette affiche son point ; un nouvel appui passe au point suivant du groupe ;
   - **l’alerte mesurée chez vous** (pluie forte, vent fort, verglas…) n’a pas de pastille à elle : elle ouvre l’étiquette « Maintenant », qui prend alors le contour et le halo d’alerte. Un point sérieux à venir (niveau 2) a le même traitement ;
   - **la piste** suit le ciel prévu heure par heure (soleil, nuit, éclaircies, nuages, pluie, orage, neige, grêle, brouillard, vent), dans les couleurs de sens ;
   - **les heures** sous la piste : « Maintenant », les repères de 6 heures (« minuit », « midi », « 6 h »), l’heure de fin.

Les étiquettes sont placées après mesure : elles ne se chevauchent jamais et restent dans le cadre. Quand elles ne tiennent pas toutes (un téléphone), elles ne gardent que leurs icônes ; l’heure reste dans la phrase qui défile. Les heures trop proches s’effacent. Dans la tuile, la frise remplace la bulle qui défile quand on la déplie.

Le halo, partout : une ombre fixe dont seule l’opacité respire (`nw-glow`, 5,2 s). Il ne clignote pas et s’arrête quand les animations sont coupées.

Le verre dépoli coûte cher aux appareils lents : le réglage `glass_effect: false` le coupe partout (plus aucun flou, `--nw-blur` et `--nw-frost` à `none`) et rend le verre plus opaque pour garder le texte lisible.

Le ciel derrière le bandeau :

- **soleil** : un grand disque entier avec ses rayons qui tournent lentement, plus gros et plus chaud en été ;
- **lune** : des cratères (un creux ombré, un bord éclairé) ;
- **nuages, orages et vent** : ceux de la carte (nuages dessinés, éclairs avec flash, rafales en volutes) ;
- **neige** : elle tombe droit en se balançant doucement, sur quatre profondeurs, avec de gros flocons au premier plan. Les nuages de neige sont gris, pour que les flocons blancs se voient. Une couche blanche se forme au sol et s’épaissit en 40 s ;
- **grêle** : elle rebondit deux fois sur le bas du cadre, puis fond ;
- **pluie, orage et grêle** : l’eau au sol miroite, avec des éclaboussures et des ondes.

## Vérifier un changement

```sh
npm run validate           # types, tests, compilation
npm run test:browser       # contrôles dans un vrai navigateur
npm run visual:capture -- --out apres
npm run visual:compare reference apres
npm run visual:sheet apres
```

Le banc visuel photographie 94 scènes (météos, saisons, alertes, données manquantes, thèmes et largeurs) à heure fixe : la même scène donne toujours la même image. `npm run visual:docs` refait les images du README.
