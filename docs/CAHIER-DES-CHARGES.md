# Cahier des charges — Niak Weather

Version 1 — 13 octobre 2026. Document vivant : il évolue avec le projet, et toute décision nouvelle y est écrite avant d'être codée. Il complète la documentation existante (capteurs, synthèse, bulletin, sources, technique), qui décrit le détail.

## 1. Objet

Niak Weather est **le cerveau météo local** du logement. Il lit la station, le fournisseur de prévisions, la vigilance Météo-France, Atmo France et les pollens de Polleninformation ou d'IRM KMI ; il calcule une seule fois, dans Home Assistant ; il dit **ce que la météo implique** (ressenti, synthèse, bulletin, alertes) ; il donne ses résultats à la carte et aux autres systèmes. Version stable actuelle : intégration 2.0.9, carte 2.0.8.

## 2. Principes

1. **Les règles plutôt qu'une IA** : chaque résultat est explicable et testé.
2. **Une donnée manquante reste inconnue**, jamais « pas de pluie » ou « pas d'alerte ».
3. **Capteurs génériques** : des valeurs utiles à tous ; ce qui est propre à une maison va dans des blueprints (sur GitHub).
4. **Stabilité** : de vrais utilisateurs s'en servent ; les identifiants d'entités ne changent jamais.
5. **Niak Weather décrit le temps ; il ne décide ni ne commande rien** dans la maison.

## 3. Place dans l'écosystème Niak

Référence commune : [Écosystème Niak](../../niak-ecosysteme/ECOSYSTEME.md).

**Rôle** : producteur de données météo pour tout l'écosystème. Il ne dépend d'aucune autre brique Niak.

**Ce qu'il consomme** : Home Assistant (station, entité météo du fournisseur, vigilance, Atmo France, Polleninformation ou IRM KMI, soleil). Aucune brique Niak.

**Liens visibles** : **Configurer → Écosystème Niak** montre chaque brique, reliée à ce lieu, installée mais pas reliée, non installée, ou à venir. Une brique est « reliée » quand elle écoute ce lieu par l'interface et donne son domaine (`brick`).

**Panneau commun « Niak »** (depuis 2.2.0b1, [écosystème § 8](../../niak-ecosysteme/ECOSYSTEME.md)) : Niak Weather embarque le socle et s'y inscrit avec l'onglet **Météo** (`/niak/meteo`) : réglages de chaque lieu par étapes (Prévisions, Station, Air, Pollens, Capteurs, Récapitulatif), mêmes détections que l'assistant de Paramètres, qui reste disponible (pas d'ancienne adresse de panneau : **Configurer** l'ouvre toujours). Sur l'Accueil : bleu quand chaque lieu est calculé avec sa station qui répond ; orange pour une station ou un capteur qui ne répond pas, des prévisions pas reçues, une entité active sans source, une carte plus ancienne que 2.0.8 (version lue dans HACS) ; plus les briques reliées.

**Ce qu'il fournit**
| Destinataire | Ce qu'il fournit | Intensité |
|---|---|---|
| Niak Confort | station déjà réglée (température, humidité, pluie, vent et direction, ensoleillement) ; pluie en cours et à venir, orage, vent fort, gel, canicule, vigilance ; prévisions horaires ; qualité de l'air et pollens ; point de rosée, tendance | forte |
| Niak Chauffage (futur) | prévisions (froid à venir, nuit, ensoleillement), degrés-jours de chauffe et de climatisation | forte |
| Niak Jardin (futur) | pluie tombée (24 h, 7 jours) et prévue (heure, 6 h, 24 h), et plus tard évapotranspiration et bilan hydrique | forte |
| Niak Énergie (futur) | ensoleillement prévu demain | moyenne |
| Automatisations | capteurs, oui/non, évènement `niak_weather_alerte`, action `niak_weather.prevision`, blueprints | — |

**Partage des rôles** : les décisions qui concernent la maison appartiennent aux autres briques. « Aérer, rafraîchissement, apports solaires » (prévus à l'étape 3) relèvent de **Niak Confort** ; « arrosage utile » relève de la future brique **Jardin** ; la production solaire estimée relève de la future brique **Énergie**. Niak Weather leur fournit les données météo nécessaires.

## 4. Interfaces publiées (contrat pour les autres briques)

Ces interfaces sont stables ; un changement incompatible change la version majeure.
- **Interface Python versionnée** `hass.data["niak_weather_api"]` (version 1) : `places()`, `station()`, `hourly()`, `add_listener(…, brick=)`, `linked()` — détail dans [technique.md](technique.md). Une brique qui écoute un lieu donne son domaine (`brick`) : elle apparaît alors « reliée » dans **Configurer → Écosystème Niak**, qui montre aussi les briques installées non reliées, absentes ou à venir (règle 4 de l'écosystème).
- **Entités** : `sensor.niak_weather_<clé>` et `binary_sensor.niak_weather_<clé>` (deuxième lieu : `niak_weather_<lieu>_<clé>`). Identifiant interne stable : `<entrée>_<clé>`. Les autres briques les reconnaissent par cet identifiant, jamais par le nom. Liste et attributs communs (`raison`, `source`, `debut`, `fin`, `partiel`, `niveau`) : [capteurs.md](capteurs.md).
- **Entité météo** `weather.niak_weather` (désactivée par défaut) : prévisions horaires et journalières.
- **Action** `niak_weather.prevision` (`debut`, `fin`, `lieu`) : la météo d'une fenêtre de temps.
- **Évènement** `niak_weather_alerte` : début, changement, fin d'une alerte.
- **API WebSocket** `niak_weather/entries`, `niak_weather/subscribe` (vue v1, réservée à la carte ; les autres briques utilisent les interfaces ci-dessus).

## 5. Feuille de route

| Étape | Contenu | État |
|---|---|---|
| 1 | Catalogue de capteurs (7 familles), évènement d'alerte, blueprints alertes / gel / bulletin | ✅ |
| 2 | Action `niak_weather.prevision`, entité `weather.niak_weather` | ✅ |
| **2 bis** | **Interfaces pour l'écosystème** : objet versionné `hass.data["niak_weather_api"]` (lieux, station par rôle dont la **direction du vent**, prévisions horaires avec direction du vent, abonnement) — voir [technique.md](technique.md) | ✅ 2.1.0b1 |
| 2 ter | Écran **Écosystème Niak** dans les réglages ; pollens **IRM KMI** (Belgique), 3ᵉ source à côté d'Atmo France et de Polleninformation | ✅ 2.1.0b2 |
| 2 quater | Onglet **Météo** du panneau commun « Niak » et état sur son Accueil (socle 1.1) | 🧪 2.2.0b1 |
| 2 quinquies | Page d'accueil technique de l'onglet Météo : à régler, à améliorer, sources, capteurs de la station, entités, versions et liens | 🧪 2.2.0b2 |
| 3 | Données pour les autres briques : évapotranspiration (ET0), bilan hydrique, ensoleillement prévu par heure. Les décisions (aérer, rafraîchir, arroser, production solaire) partent dans les briques concernées | à décider |
| — | Correction locale des prévisions par la station | abandonnée le 11 oct. 2026 (gain ~5 %, défauts d'emplacement des capteurs) |

## 6. Historique

- **v1 — 13 octobre 2026** : première version du cahier des charges, centrée sur la place de Niak Weather dans l'écosystème Niak et ses interfaces publiées.
- **v1.1 — 14 octobre 2026** : liens visibles dans les réglages (écran Écosystème Niak, `add_listener(…, brick=)`, `linked()`) ; pollens IRM KMI.
- **v1.2 — 14 octobre 2026** : Niak Weather rejoint le panneau commun « Niak » (onglet Météo, état sur l'Accueil) ; l'assistant de Paramètres reste en secours.
