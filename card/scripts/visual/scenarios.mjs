// Catalogue des scènes du banc visuel. Chaque scène devient une image : test-results/visual/<dossier>/<id>.png
// Le groupe sert de planche ; le libellé est affiché sous l'image.

export const CONDITIONS = {
  sunny: 'Soleil', partlycloudy: 'Éclaircies', cloudy: 'Couvert', rainy: 'Pluie', pouring: 'Fortes pluies', lightning: 'Orage',
  'lightning-rainy': 'Orage et pluie', snowy: 'Neige', 'snowy-rainy': 'Pluie et neige', hail: 'Grêle', fog: 'Brouillard',
  windy: 'Vent', 'clear-night': 'Nuit claire', exceptional: 'Exceptionnel',
};
const PHASES = { day: 'jour', twilight: 'crépuscule', night: 'nuit' };
const SEASONS = { spring: 'printemps', summer: 'été', autumn: 'automne', winter: 'hiver' };
const FORMATS = { tile: ['tuile', 680], half: ['demi-tuile', 332], intermediate: ['intermédiaire', 680], full: ['complète', 1180] };
const format = key => ({ format: key === 'half' ? 'tile' : key, width: FORMATS[key][1] });

const scenes = [];
const add = (group, id, label, s) => scenes.push({ id: `${group}/${id}`, group, label, ...s });

// 1. Le ciel : chaque météo à chaque moment de la journée, sur la tuile.
for (const [c, cl] of Object.entries(CONDITIONS)) for (const [p, pl] of Object.entries(PHASES))
  add('ciel', `${c}-${p}`, `${cl} · ${pl}`, { ...format('tile'), condition: c, phase: p });

// 2. Les saisons : un temps calme et un temps de pluie, de jour.
for (const [s, sl] of Object.entries(SEASONS)) for (const c of ['sunny', 'rainy'])
  add('saisons', `${s}-${c}`, `${sl[0].toUpperCase() + sl.slice(1)} · ${CONDITIONS[c]}`, { ...format('tile'), condition: c, season: s, phase: 'day' });

// 3. Les alertes : chaque niveau de vigilance dans chaque format, puis une alerte du brief sans vigilance.
for (const [v, vl] of [[undefined, 'sans vigilance'], ['Jaune', 'vigilance jaune'], ['Orange', 'vigilance orange'], ['Rouge', 'vigilance rouge']])
  for (const f of ['tile', 'half', 'intermediate', 'full'])
    add('alertes', `${(v ?? 'aucune').toLowerCase()}-${f}`, `${FORMATS[f][0]} · ${vl}`, { ...format(f), condition: v ? 'lightning-rainy' : 'partlycloudy', vigilance: v, phase: 'day' });
for (const f of ['tile', 'half', 'intermediate', 'full'])
  add('alertes', `vent-fort-${f}`, `${FORMATS[f][0]} · vent fort sans vigilance`, { ...format(f), condition: 'windy', wind: 58, gust: 92, phase: 'day' });

// 4. Les données : installation complète, sans station, sans prévisions, météo indisponible.
for (const [d, dl, s] of [['complet', 'complet', {}], ['sans-station', 'sans station ni Atmo', { station: false, atmo: false }],
  ['sans-previsions', 'prévisions indisponibles', { forecasts: false }], ['indisponible', 'météo indisponible', { unavailable: true }]])
  for (const f of ['tile', 'intermediate', 'full'])
    add('donnees', `${d}-${f}`, `${FORMATS[f][0]} · ${dl}`, { ...format(f), condition: 'partlycloudy', phase: 'day', ...s });

// 5. L'affichage : thème clair et sombre, téléphone, tablette et ordinateur.
for (const theme of ['light', 'dark']) {
  for (const [w, wl] of [[375, 'téléphone'], [768, 'tablette'], [1280, 'ordinateur']])
    add('affichage', `complete-${theme}-${w}`, `complète · ${theme === 'dark' ? 'sombre' : 'clair'} · ${wl}`, { format: 'full', width: w, theme, condition: 'rainy', vigilance: 'Jaune', phase: 'day' });
  for (const f of ['tile', 'half', 'intermediate'])
    add('affichage', `${f}-${theme}-375`, `${FORMATS[f][0]} · ${theme === 'dark' ? 'sombre' : 'clair'} · téléphone`, { format: f === 'half' ? 'tile' : f, width: f === 'half' ? 180 : 343, theme, condition: 'rainy', vigilance: 'Jaune', phase: 'day' });
}

export const SCENES = scenes;
export const GROUPS = { ciel: 'Le ciel', saisons: 'Les saisons', alertes: 'Les alertes', donnees: 'Les données', affichage: "L'affichage" };
