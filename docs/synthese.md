# La synthèse et les alertes

[Accueil](../README.md) · [Le ressenti](ressenti.md) · [Le bulletin du jour](bulletin.md) · [Sources et réglages](sources.md) · [Pluie, vent, pression](mesures.md) · [Fonctionnement technique](technique.md)

La synthèse transforme les mesures et les prévisions en quelques points clairs : **ce que l’on ressent maintenant, ce qui arrive, et ce qui mérite l’attention**. Elle n’utilise ni IA, ni abonnement, ni clé : ses règles sont explicables et testées.

## Quatre familles de points

| Famille | Ce qu’elle lit |
| --- | --- |
| **Vigilance officielle** | La vigilance Météo-France de votre département, si vous l’avez choisie. |
| **Maintenant** | Ce que mesure votre station : vent, pluie, brouillard probable, UV, chaleur ou froid ressentis, grand écart entre ressenti et thermomètre, pression qui monte ou baisse. |
| **À venir** | Les 6 prochaines heures de prévisions : première pluie et son cumul, orage ou grêle, gel. Puis la nuit : gelée, brouillard au petit matin. Et demain : forte pluie annoncée. |
| **Air et pollens** | Le plus mauvais des indices Atmo France, aujourd’hui et demain. |

Chaque point à venir porte **son heure** (« vers 20 h », « midi », « demain ») : la carte le pose au bon endroit sur la frise des heures à venir.

Les délais se calculent avec les dates des prévisions, jamais avec la place d’un point dans une liste. Les points passés ou au-delà de la fenêtre sont écartés.

## Les seuils

Ce sont des **règles de lecture** de Niak Weather, pas des seuils départementaux officiels ni des recommandations médicales.

| Point | À surveiller | Attention renforcée |
| --- | --- | --- |
| Vent mesuré | Vent moyen ≥ 30 km/h ou rafales ≥ 40 km/h | Vent moyen ≥ 50 km/h ou rafales ≥ 60 km/h |
| Pluie mesurée | ≥ 1 mm/h (cité dès 0,3 mm/h) | ≥ 4 mm/h |
| Pluie et vent ensemble | — | Pluie ≥ 1 mm/h et vent moyen ≥ 30 km/h |
| Ressenti | ≥ 34 °C ou ≤ 2 °C | ≥ 38 °C ou ≤ −3 °C |
| UV | ≥ 6 | ≥ 8 |
| Pluie prévue dans les 6 h | Cumul ≥ 5 mm (cité dès 1 mm) | ≥ 5 mm en une heure ou cumul ≥ 20 mm |
| Orage ou grêle prévus dans les 6 h | — | Toujours |
| Gel prévu dans les 6 h, gelée cette nuit | Toujours | — |
| Air extérieur Atmo | Indice 3 sur 6 | Indice 4 et plus |
| Pollens Atmo | Indice 4 sur 6 | Indice 5 et plus |

Un écart de plus de 4 °C entre ressenti et thermomètre, une pression qui bouge, un brouillard possible au petit matin, une montée ou une baisse de 3 °C dans les 6 h, une forte pluie demain (20 mm et plus) sont donnés **pour information**, sans élever le niveau.

## Les niveaux

| Niveau | Lecture |
| --- | --- |
| Synthèse | Rien de marqué parmi les données disponibles. Ce n’est pas une garantie de sécurité. |
| À surveiller | Au moins un point jaune. |
| Attention renforcée | Au moins un point orange. |
| Vigilance rouge officielle | Réservé à une vigilance rouge fournie par Météo-France. |
| Données insuffisantes | Ni ressenti, ni point, ni prévision. |

Le niveau prend **le plus élevé** des points, jamais une moyenne. Une vigilance officielle jaune, orange ou rouge impose son niveau, sans faire disparaître les observations de la station ni l’air.

## Ce que montre le bandeau

- **La vigilance officielle** reste en haut, à part : elle vaut pour le département et pour une période. La frise ne la répète pas.
- **La frise « Événements »** reçoit sa propre liste :
  - **maintenant** : ce qui demande l’attention, l’air et les pollens dès 3 sur 6, et une information utile au plus (écart de ressenti ou pression), trois au plus ;
  - **puis chaque point des prochaines heures, à son heure** : pluie, orage, gel, gelée, brouillard, température, forte pluie demain, air et pollens de demain dès 3 sur 6. Cinq au plus ; s’il y en a davantage, les plus importants ;
  - le point le plus sérieux porte le halo d’alerte ;
  - les textes ne répètent pas l’heure : « Fortes pluies : 12 mm prévus » sur l’étiquette « 17 h ».
- **La bulle qui défile** de la tuile repliée garde une sélection courte : au plus quatre points, les plus importants d’abord.
- Le **i** de la synthèse liste tous les points retenus, par famille, et les données à vérifier.

## La vigilance Météo-France

Le capteur de vigilance départementale est facultatif. Choisissez-le vous-même : le département n’est pas toujours celui qu’on devine d’après le nom de la commune. Seul un capteur reconnu comme une vigilance Météo-France est lu : un simple capteur nommé « rouge » ne compte pas.

La pastille dit le niveau et les phénomènes (« Vigilance orange · Orages, vent violent (jaune) »), avec l’icône du premier phénomène. Une vigilance mise à jour il y a plus de 48 h n’est pas présentée comme actuelle. Une vigilance verte ne veut pas dire que l’air est bon.

Les références restent le [dispositif officiel Météo-France](https://vigilance.meteofrance.fr/fr/guide-vigilance-meteo) et le [capteur Home Assistant](https://www.home-assistant.io/integrations/meteo_france/#about-weather_alert-sensor).

## Données manquantes

- Une quantité de pluie absente n’est pas un zéro : le cumul est dit « au moins ».
- Un indice Atmo publié il y a plus de 48 h ne qualifie pas la situation ; le code 7 est un évènement, pas un niveau.
- Sans humidité, le ressenti le dit.
- Ce qui manque est listé dans le **i**, sous « À vérifier ».

Aucune alerte de Niak Weather ne remplace les consignes officielles.

[Les règles dans le code](../custom_components/niak_weather/engine/brief.py).
