// The full card: the banner, then « Aujourd'hui » and « Prévisions », each folded or unfolded with a tap on its title.
import { css, html, nothing, type TemplateResult } from 'lit';
import type { WeatherView } from '../view';
import type { BannerBlock } from '../types';
import type { Sections } from '../config';
import { renderAir } from './air';
import { renderForecasts } from './forecasts';
import { bulletinBlock, renderHero } from './hero';
import { forecastStrip, frise, moments } from './tile';
import { renderToday } from './today';

export type SectionId = 'today' | 'predictions';
export interface FullOptions {
  sky: TemplateResult; uid: string; entity: string;
  /** A local thermometer: the feel is compared with it rather than with the bulletin. */
  station: boolean;
  /** What each section shows, in its order; an empty list removes the section. */
  sections: Sections;
  folded: Record<SectionId, boolean>;
  onFold: (id: SectionId) => void;
  /** The hours/days tiles of the banner: their tab and the switch between them. */
  tab: 'hours' | 'days'; onTab: (tab: 'hours' | 'days') => void;
  /** Where the banner shows the time, if it does. */
  clock?: 'none' | 'left' | 'right';
}

function section(id: SectionId, title: string, subtitle: string, o: FullOptions, body: () => TemplateResult): TemplateResult {
  const folded = o.folded[id];
  const toggle = (e: Event) => { if (e instanceof KeyboardEvent && e.key !== 'Enter' && e.key !== ' ') return; e.preventDefault(); o.onFold(id); };
  return html`<section class=${`fm-section${folded ? ' folded' : ''}`} aria-labelledby=${`${o.uid}-${id}`}>
    <header class="fm-head" role="button" tabindex="0" aria-expanded=${!folded} @click=${toggle} @keydown=${toggle}>
      <h2 id=${`${o.uid}-${id}`}>${title}</h2><span>${subtitle}</span>
      <span class="fm-fold" aria-hidden="true"><ha-icon icon="mdi:chevron-down"></ha-icon></span></header>
    ${folded ? nothing : html`<div class="fm-body">${body()}</div>`}
  </section>`;
}

/** The full card: the smart banner, « Aujourd'hui », then « Prévisions », always in this order, each with what it was asked to show. */
export function renderFull(v: WeatherView, o: FullOptions): TemplateResult {
  const { hero, banner, today, forecasts } = o.sections;
  const draw = (b: BannerBlock) => b === 'bulletin' ? html`<div class="hero-bulletin">${bulletinBlock(v)}</div>` : b === 'events' ? frise(v)
    : b === 'moments' ? moments(v) : forecastStrip(v, o.tab, o.onTab);
  return html`<div class="nw-full">
    ${hero ? renderHero(v, o.sky, o.uid, banner, draw, o.clock) : nothing}
    ${today.length ? section('today', 'Aujourd’hui', v.comfort ? 'Mesures et ressenti' : 'Conditions actuelles', o,
      () => renderToday(v, o.uid, o.station, renderAir(v.air.today), today)) : nothing}
    ${forecasts.length ? section('predictions', 'Prévisions', v.forecastSource, o,
      () => renderForecasts(v, o.entity, o.uid, renderAir(v.air.tomorrow), forecasts)) : nothing}
  </div>`;
}

export const fullStyles = css`
  .nw-full { container-type:inline-size; color:var(--nw-fg); }
  .fm-section { padding:20px 24px 24px; border-top:1px solid var(--nw-line-soft); }
  .nw-full > .fm-section:first-child { border-top:0; }
  .fm-head { display:flex; align-items:center; gap:10px; min-width:0; }
  .fm-section > .fm-head { cursor:pointer; user-select:none; -webkit-user-select:none; border-radius:var(--nw-radius); }
  .fm-head:focus-visible { outline:2px solid var(--nw-accent); outline-offset:4px; }
  .fm-head h2 { margin:0; font-size:var(--nw-fs-title); font-weight:750; letter-spacing:-.2px; }
  .fm-head > span:not(.fm-fold):not(.nw-chip) { font-size:var(--nw-fs-small); color:var(--nw-fg2); flex:1; min-width:0; }
  .fm-fold { display:grid; place-items:center; width:30px; height:30px; flex:none; border-radius:var(--nw-radius-pill); border:1px solid var(--nw-line); background:var(--nw-bg); color:var(--nw-fg2); }
  .fm-fold ha-icon { --mdc-icon-size:20px; transition:transform .3s; }
  .folded .fm-fold ha-icon { transform:rotate(-90deg); }
  .fm-body { display:grid; gap:16px; margin-top:16px; }
  @container (max-width:560px) { .fm-section { padding:16px 14px 18px; } }
`;
