// Air and pollens from Atmo France (index 1 to 6), Polleninformation or IRM KMI (0 to 4): the same panel for today (in « Aujourd'hui »)
// and tomorrow (in « Prévisions »).
import { css, html, nothing, svg, type TemplateResult } from 'lit';
import type { AirItem, AirPanel, AtmoReading } from '../view';
import { chip, label, nf, panelHead } from '../ui/parts';

/** The steps in the charter's colours. Atmo (6): good, fair, the three alert levels, the worst. Polleninformation (4): low to very high. */
const STEPS: Record<number, string[]> = { 6: ['calm', 'calm', 'level1', 'level2', 'level3', 'pressure'], 4: ['calm', 'level1', 'level2', 'level3'] };
/** The level when it is known and fresh; Polleninformation's 0 (« none ») is a real level, Atmo's scale starts at 1. */
const known = (r: AtmoReading | undefined, scale: number) => r && !r.stale && r.value !== undefined && r.value <= scale && (scale !== 6 || r.value >= 1) ? r.value : undefined;

/** One notch per step, filled up to the level, the level in the middle. */
function disc(r: AtmoReading | undefined, scale: number): TemplateResult {
  const value = known(r, scale), steps = STEPS[scale] ?? STEPS[6], turn = 360 / scale;
  const arc = (i: number) => {
    const a0 = (i * turn - 88) * Math.PI / 180, a1 = ((i + 1) * turn - 92) * Math.PI / 180, R = 32, C = 38;
    return svg`<path d=${`M${C + R * Math.cos(a0)} ${C + R * Math.sin(a0)} A${R} ${R} 0 0 1 ${C + R * Math.cos(a1)} ${C + R * Math.sin(a1)}`} fill="none" stroke-width="9" stroke-linecap="round"
      stroke=${value !== undefined && i < value ? `var(--nw-${steps[i]})` : 'color-mix(in oklab,var(--nw-fg) 10%,transparent)'}/>`;
  };
  return html`<svg class="disc" viewBox="0 0 76 76" aria-hidden="true">${steps.map((_, i) => arc(i))}
    <text x="38" y="44" text-anchor="middle" font-size="17" font-weight="700" fill="currentColor">${value ?? '–'}</text></svg>`;
}

/** What a detail line says: its level, or its concentration as published. */
function detail(item: AirItem): string {
  const r = item.reading, c = item.concentration;
  const concentration = (x: AtmoReading) => x.value === undefined ? 'concentration indisponible' : `${nf(x.value, 2)}${x.unit ? ` ${x.unit}` : ''}`;
  const value = r.unit !== undefined ? concentration(r) : `${r.label}${c ? ` · ${concentration(c)}` : ''}`;
  return `${value}${r.stale ? ' · données anciennes' : ''}`;
}

function panel(p: AirPanel): TemplateResult {
  const air = p.kind === 'air', r = p.primary, scale = p.scale ?? 6, value = known(r, scale), atmo = scale === 6;
  const source = atmo ? 'Atmo France' : p.source ?? 'Polleninformation';
  const worse = p.worse ? known(p.worse.reading, scale) ?? 0 : 0;
  const word = !r ? 'Indice non configuré' : r.stale ? 'Données anciennes' : r.value === 7 ? 'Événement signalé' : r.label;
  return html`<section class="nw-panel" aria-label=${`${air ? 'Air extérieur' : 'Pollens'} ${p.tomorrow ? 'demain' : 'aujourd’hui'}`}>
    ${panelHead(air ? 'mdi:air-filter' : 'mdi:flower-pollen-outline', 'calm', air ? 'Air extérieur' : 'Pollens', source)}
    <p class="nw-sub">${p.tomorrow ? 'Demain' : 'Aujourd’hui'}${p.zone ? ` · ${p.zone}` : ''}</p>
    <div class="aq" data-entity=${r?.entityId ?? nothing} role=${r ? 'button' : nothing} tabindex=${r ? 0 : nothing}>${disc(r, scale)}
      <div class="txt">${label(p.tomorrow ? 'Indice de demain' : 'Indice du jour')}<strong>${word}</strong>
        <small>${value !== undefined ? `Niveau ${value} sur ${scale}` : r?.value === 7 && atmo ? 'Code 7 · hors échelle' : 'Niveau indisponible'}</small></div></div>
    ${p.worse ? html`<div class="nw-chips">${chip({ theme: `level${Math.min(3, Math.max(1, worse - (atmo ? 2 : 1)))}` as 'level1', icon: 'mdi:alert-circle-outline',
      value: p.worse.label, label: p.worse.reading.label.toLowerCase(), entity: p.worse.reading.entityId })}</div>` : nothing}
    ${p.details.length || p.updated ? html`<details class="nw-details"><summary><ha-icon icon="mdi:chevron-right"></ha-icon>${air ? 'Détail des polluants' : 'Détail des pollens'}</summary>
      ${p.details.length ? html`<ul>${p.details.map(d => html`<li data-entity=${d.reading.entityId}><span>${d.label}</span><b>${detail(d)}</b></li>`)}</ul>` : nothing}
      ${p.updated ? html`<p>${atmo ? 'Publication Atmo' : `Mise à jour ${source}`} : ${p.updated}.${p.stale ? ' Certaines données sont anciennes : à vérifier dans l’intégration.' : ''}</p>` : nothing}</details>` : nothing}
  </section>`;
}

export const renderAir = (panels: AirPanel[]) => panels.length ? html`<div class="panels-two">${panels.map(panel)}</div>` : nothing;

export const airStyles = css`
  .panels-two { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:16px; align-items:stretch; }
  .panels-two > :only-child { grid-column:1/-1; }
  @container (max-width:640px) { .panels-two { grid-template-columns:minmax(0,1fr); } }
  .aq { display:grid; grid-template-columns:auto minmax(0,1fr); align-items:center; gap:16px; }
  .aq .disc { width:76px; height:76px; }
  .aq .txt { display:flex; flex-direction:column; gap:2px; min-width:0; }
  .aq strong { font-size:var(--nw-fs-title); font-weight:700; }
  .aq small { font-size:var(--nw-fs-small); color:var(--nw-fg2); }
`;
