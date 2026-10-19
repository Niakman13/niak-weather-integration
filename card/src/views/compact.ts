// The small cards: « Mini » (one line), « Prévisions » (the hours and the days alone), « Pluie » and « Alerte » (only when there is one).
// A tap on Mini and Alerte opens the full card, like a long press on the tile.
import { css, html, nothing, type TemplateResult } from 'lit';
import type { TickerPoint, WeatherView } from '../view';
import { alertBubble, alertPill, bubble, chip, label, nf } from '../ui/parts';
import { hoursChart, week } from './forecasts';
import { rainPanel } from './today';
import type { PressTarget } from './tile';

/** One line: the sky and the temperature now, the place, and the most serious alert. */
export function renderMini(v: WeatherView, holdTarget: PressTarget): TemplateResult {
  const n = v.now, alert = v.alerts.find(a => a.official) ?? v.alerts[0];
  const place = `Météo${v.location ? ` à ${v.location}` : ''}`;
  return html`<div class=${`nw-mini${holdTarget === 'none' ? ' still' : ''}`} role=${holdTarget === 'none' ? 'group' : 'button'} tabindex=${holdTarget === 'none' ? -1 : 0}
      aria-label=${holdTarget === 'none' ? place : `${place} : appui pour ${holdTarget === 'page' ? 'la page météo' : 'la carte complète'}`}>
    <ha-icon class="mini-icon" icon=${n.icon}></ha-icon>
    <span class="mini-temp">${n.temperature === undefined ? '—' : nf(n.temperature)}<small>°C</small></span>
    <span class="mini-text"><b>${n.label}</b>${v.location ? html`<span>${v.location}</span>` : nothing}</span>
    ${alert ? alertPill(alert) : nothing}
  </div>`;
}

/** What deserves to be seen now: the vigilances, the alert measured at home, then the serious points of the coming hours. */
export function alertItems(v: WeatherView): { alerts: WeatherView['alerts']; points: TickerPoint[] } {
  return { alerts: v.alerts, points: v.points.filter(p => p.level >= 2 && p.group !== 'official') };
}

/** Only while there is something serious; the card hides itself otherwise (a placeholder while the dashboard is being edited). */
export function renderAlert(v: WeatherView, editing: boolean): TemplateResult | typeof nothing {
  const { alerts, points } = alertItems(v);
  if (!alerts.length && !points.length) return editing
    ? html`<div class="nw-alertcard quiet-card"><ha-icon icon="mdi:shield-check-outline"></ha-icon><span><b>Aucune alerte en ce moment.</b> Cette carte reste cachée tant que tout est calme.</span></div>`
    : nothing;
  return html`<div class="nw-alertcard" role="button" tabindex="0" aria-label="Alertes météo : appui pour la carte complète">
    ${v.location ? html`<span class="place">${v.location}</span>` : nothing}
    ${alerts.map(a => alertBubble(a))}${points.map(p => bubble(p))}
  </div>`;
}

/** The hours (curve) or the days (table), with the switch between them. */
export function renderForecastCard(v: WeatherView, tab: 'hours' | 'days', onTab: (tab: 'hours' | 'days') => void, entity: string, uid: string): TemplateResult {
  const hasHours = v.hours.some(h => h.temperature !== undefined), hasDays = v.days.length > 0;
  const shown = !hasHours ? 'days' : !hasDays ? 'hours' : tab;
  const select = (t: 'hours' | 'days') => (e: Event) => { e.stopPropagation(); onTab(t); };
  const body = shown === 'hours' ? hoursChart(v.hours, v.provider, entity, uid) : week(v.days, v.provider, entity);
  return html`<div class="nw-forecastcard">
    <div class="fcard-head"><span class="fcard-title"><b>Prévisions</b>${v.location ? html`<span>${v.location}</span>` : nothing}</span>
      ${hasHours && hasDays ? html`<span class="seg" role="group" aria-label="Prévisions affichées">
        <button type="button" aria-pressed=${shown === 'hours'} @click=${select('hours')}>Heures</button>
        <button type="button" aria-pressed=${shown === 'days'} @click=${select('days')}>Jours</button></span>` : nothing}</div>
    ${body === nothing ? html`<p class="nw-empty">Prévisions indisponibles pour le moment.</p>` : body}
  </div>`;
}

/** The rain to come, from the forecast hours: within the hour, over 6 hours, and when the next rain starts. */
export function rainAhead(v: WeatherView): { hour: number; six: number; next?: string } {
  const hours = v.hours, sum = (n: number) => hours.slice(0, n).reduce((t, h) => t + (h.precipitation ?? 0), 0);
  const first = hours.find(h => h.precipitation >= .3);
  return { hour: sum(1), six: sum(6), next: first ? (first.hour === 0 ? 'minuit' : first.hour === 12 ? 'midi' : `${first.hour} h`) : undefined };
}

/** « Pluie »: what is coming first, then what fell (the full card's rain panel, without its frame). */
export function renderRain(v: WeatherView): TemplateResult {
  const ahead = rainAhead(v), soon = v.hours.length > 0;
  const coming = !soon ? html`<p class="nw-empty">Prévisions indisponibles pour le moment.</p>`
    : ahead.six < .1 ? html`<div class="nw-chips">${chip({ theme: 'calm', icon: 'mdi:weather-partly-cloudy', label: ahead.next ? `Pas de pluie avant ${ahead.next}` : 'Pas de pluie prévue d’ici 18 h' })}</div>`
    : html`<div class="nw-chips">${chip({ theme: 'rain', icon: 'mdi:timer-sand', value: `${nf(ahead.hour)} mm`, label: 'dans l’heure' })}
        ${chip({ theme: 'rain', icon: 'mdi:weather-pouring', value: `${nf(ahead.six)} mm`, label: 'sur 6 h' })}
        ${ahead.next && ahead.hour < .1 ? chip({ theme: 'rain', icon: 'mdi:clock-outline', label: `à partir de ${ahead.next}` }) : nothing}</div>`;
  return html`<div class="nw-raincard">
    <div class="fcard-head"><span class="fcard-title"><b>Pluie</b>${v.location ? html`<span>${v.location}</span>` : nothing}</span></div>
    <div class="rain-ahead">${label('À venir')}${coming}</div>
    ${v.rain ? rainPanel(v.rain) : nothing}
  </div>`;
}

export const compactStyles = css`
  .nw-mini { display:flex; align-items:center; gap:10px; padding:10px 14px; min-height:56px; box-sizing:border-box; cursor:pointer; color:var(--nw-fg); }
  .nw-mini.still { cursor:default; }
  .nw-mini:focus-visible, .nw-alertcard:focus-visible { outline:2px solid var(--nw-accent); outline-offset:-2px; }
  .mini-icon { --mdc-icon-size:30px; color:color-mix(in oklab, var(--nw-wind) var(--nw-ink), var(--nw-fg)); flex:none; }
  .mini-temp { font-size:24px; font-weight:700; letter-spacing:-.6px; white-space:nowrap; line-height:1; }
  .mini-temp small { font-size:var(--nw-fs-small); font-weight:400; vertical-align:super; margin-left:1px; letter-spacing:0; }
  .mini-text { display:flex; flex-direction:column; min-width:0; flex:1; line-height:1.3; }
  .mini-text b { font-size:var(--nw-fs-text); font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .mini-text span { font-size:var(--nw-fs-small); color:var(--nw-fg2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .nw-mini .nw-alert { flex:none; max-width:46%; }
  /* Narrow: the sky, the temperature and the vigilance; the words give way. */
  @container (max-width:300px) { .mini-text { display:none; } .nw-mini .nw-alert { max-width:none; margin-left:auto; } }

  .nw-alertcard { display:flex; flex-direction:column; align-items:stretch; gap:8px; padding:12px 14px; cursor:pointer; color:var(--nw-fg); }
  .nw-alertcard .place { font-size:var(--nw-fs-small); color:var(--nw-fg2); }
  .nw-alertcard .nw-bubble { max-width:none; }
  .quiet-card { flex-direction:row; align-items:center; gap:10px; cursor:default; color:var(--nw-fg2); font-size:var(--nw-fs-text); }
  .quiet-card ha-icon { --mdc-icon-size:22px; color:color-mix(in oklab, var(--nw-calm) var(--nw-ink), var(--nw-fg)); flex:none; }
  .quiet-card b { color:var(--nw-fg); font-weight:600; }

  .nw-forecastcard { display:flex; flex-direction:column; gap:12px; padding:14px 16px 16px; }
  .fcard-head { display:flex; align-items:center; justify-content:space-between; gap:10px; }
  .fcard-title { display:flex; align-items:baseline; gap:8px; min-width:0; }
  .fcard-title b { font-size:var(--nw-fs-title); font-weight:700; letter-spacing:-.2px; }
  .fcard-title span { font-size:var(--nw-fs-small); color:var(--nw-fg2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  /* The full card's panels, without their frame: the card is the frame. */
  .nw-forecastcard .nw-panel, .nw-raincard .nw-panel { border:0; padding:0; background:none; }
  .nw-forecastcard .nw-panel-head { display:none; }
  .nw-raincard { display:flex; flex-direction:column; gap:12px; padding:14px 16px 16px; }
  .rain-ahead { display:flex; flex-direction:column; gap:6px; padding-bottom:12px; border-bottom:1px solid var(--nw-line-soft); }
  /* The panel's own title says « Pluie » again: only its source pill stays, on the right. */
  .nw-raincard .nw-panel-head :is(.nw-panel-icon, h3) { display:none; }
`;
