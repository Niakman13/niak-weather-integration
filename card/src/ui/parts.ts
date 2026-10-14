// The charter's pieces as templates. Views assemble these; they never write a pill or a bubble by hand.
import { html, nothing, svg, type TemplateResult } from 'lit';
import type { AlertPoint, Chip, TickerPoint } from '../view';
import { numberFormat } from '../intl-cache';

/** French number, at most `digits` decimals (exactly `digits` when `fixed`). */
export const nf = (v: number, digits = 1, fixed = false) => numberFormat('fr-FR', { maximumFractionDigits: digits, minimumFractionDigits: fixed ? digits : 0 }).format(v);
/** A number stays with its unit at the end of a line: « (6 °C) » is never cut after the 6. */
export const unbroken = (text: string) => text.replace(/(\d) (°C|km\/h|mm|%|hPa)/g, '$1\u00a0$2');
/** The colour of a meaning token, for `--c`. */
export const tint = (theme: string) => `--c:var(--nw-${theme})`;
/** Colour of a temperature, from cold (5 °C) to heat (30 °C), mixed from the palette. */
export const tempColor = (t: number) => `color-mix(in oklab,var(--nw-heat) ${Math.round(Math.min(100, Math.max(0, (t - 5) / 25 * 100)))}%,var(--nw-cold))`;
/** Opens the entity's more-info when the card is tapped there. */
export const entity = (id?: string) => id ?? nothing;

export const label = (text: string) => html`<span class="nw-label">${text}</span>`;
export const badge = (text: string) => html`<span class="nw-badge" title=${text}>${text}</span>`;

export function chip(c: Chip): TemplateResult {
  return html`<span class="nw-chip" style=${tint(c.theme)} data-entity=${entity(c.entity)} role=${c.entity ? 'button' : nothing} tabindex=${c.entity ? 0 : nothing}>
    <ha-icon icon=${c.icon}></ha-icon>${c.value ? html`<b>${c.value}</b>` : nothing}${c.label}</span>`;
}

/** A brief bubble: its icon takes the colour of its theme; the outline stays neutral. */
export function bubble(p: TickerPoint, extraClass = ''): TemplateResult {
  return html`<p class=${`nw-bubble ${extraClass}`} data-theme=${p.theme ?? nothing} style=${p.theme ? tint(p.theme) : nothing}>
    <ha-icon icon=${p.icon}></ha-icon><span class="nw-label">${p.label}</span><b title=${p.text}>${p.text}</b></p>`;
}

/** An alert bubble: the same shape, tinted by its level, with its halo. */
export function alertBubble(a: AlertPoint, extraClass = ''): TemplateResult {
  return html`<p class=${`nw-bubble nw-bubble--alert nw-level${a.level} ${extraClass}`} role="status">
    <ha-icon icon=${a.icon}></ha-icon>${a.label ? html`<span class="nw-label">${a.label}</span>` : nothing}<b title=${a.text}>${a.text}</b></p>`;
}

/** The official vigilance in the banner: « Vigilance orange · Orages », as a compact pill with its halo. */
export function alertPill(a: AlertPoint): TemplateResult {
  return html`<p class=${`nw-alert nw-level${a.level}`} role="status" title=${a.source} data-entity=${entity(a.entity)}>
    <span class="dot"><ha-icon icon=${a.icon}></ha-icon></span><span>${a.label ? html`<b>${a.label}<span class="sep"> · </span></b>` : nothing}${a.text}</span></p>`;
}

const ROSE = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
/** Where the wind comes from, as a point of the compass (« SO »). */
export const rose = (deg: number) => ROSE[Math.round(((deg % 360 + 360) % 360) / 22.5) % 16];

/** An arrow pointing where the wind goes (the bearing is where it comes from). */
export const windArrow = (bearing: number) => svg`<svg viewBox="0 0 10 10" aria-hidden="true" style=${`transform:rotate(${Math.round(bearing + 180)}deg)`}><path d="M5 0 9 10 5 7.5 1 10Z"/></svg>`;

export interface Explanation { title: string; text: unknown; example?: unknown }
/** The « i » button and its explanation bubble. `id` must be unique in the card. */
export function info(id: string, e: Explanation): TemplateResult {
  return html`<button class="nw-info" type="button" popovertarget=${id} aria-label=${`Qu’est-ce que : ${e.title} ?`} @click=${stop}><ha-icon icon="mdi:information-variant"></ha-icon></button>
    <div class="nw-pop" id=${id} popover @toggle=${place} @click=${stop}><b>${e.title}</b>${e.text}${e.example ? html`<div class="ex">${e.example}</div>` : nothing}</div>`;
}
const stop = (event: Event) => event.stopPropagation();
/** Opens the bubble under its button, without leaving the screen. */
function place(event: Event) {
  const pop = event.currentTarget as HTMLElement;
  if ((event as ToggleEvent).newState !== 'open') return;
  const button = (pop.getRootNode() as ShadowRoot).querySelector(`[popovertarget="${pop.id}"]`);
  if (!button) return;
  const r = button.getBoundingClientRect();
  pop.style.top = `${Math.max(8, Math.min(r.bottom + 8, innerHeight - pop.offsetHeight - 8))}px`;
  pop.style.left = `${Math.max(8, Math.min(r.left - 12, innerWidth - pop.offsetWidth - 8))}px`;
}

/** Panel header: tinted icon, title (with its « i » if any), source pill. */
export function panelHead(icon: string, theme: string, title: string, source: string, explain?: TemplateResult): TemplateResult {
  return html`<header class="nw-panel-head"><span class="nw-panel-icon" style=${tint(theme)}><ha-icon icon=${icon}></ha-icon></span>
    <h3><span>${title}</span>${explain ?? nothing}</h3>${badge(source)}</header>`;
}

/** Legend entry: a line, a square or a dashed line in a colour. */
export const legend = (text: string, color: string, shape: '' | 'sq' | 'dash' = '') =>
  html`<span><i class=${shape} style=${shape === 'dash' ? `--c:${color}` : `background:${color}`}></i>${text}</span>`;
