import { css, html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { define } from './define';
import type { AlertPoint, TickerPoint } from '../view';
import { bubbles } from './charter';
import { alertBubble, bubble } from './parts';

/** A point of the scrolling bubble: a brief point, or an alert that had no room of its own. */
export type TickerItem = TickerPoint | (AlertPoint & { alert: true });

/**
 * Shows the points one at a time, every 5 s. Hovering or focusing the card pauses it.
 * When the list changes (the tile unfolds), the bubble on screen stays if it is still in the list: nothing moves.
 */
@define('niak-ticker')
export class NiakTicker extends LitElement {
  @property({ attribute: false }) points: TickerItem[] = [];
  @state() private index = 0;
  @state() private leaving = false;
  private timer?: ReturnType<typeof setInterval>;
  private swap?: ReturnType<typeof setTimeout>;
  private shown?: string;

  connectedCallback() {
    super.connectedCallback();
    // Home Assistant may move the card mid-fade: a cancelled swap must not leave the bubble transparent.
    this.leaving = false; this.timer = setInterval(() => this.next(), 5000);
  }
  disconnectedCallback() { super.disconnectedCallback(); clearInterval(this.timer); clearTimeout(this.swap); }

  protected willUpdate(changed: Map<PropertyKey, unknown>) {
    if (!changed.has('points')) return;
    const keep = this.points.findIndex(p => p.text === this.shown);
    if (keep >= 0) { this.index = keep; return; }
    if (this.shown === undefined || this.reduced) { this.index = 0; return; }
    // The bubble on screen is gone from the list: it fades out, the first one fades in.
    this.leaving = true; clearTimeout(this.swap);
    this.swap = setTimeout(() => { this.index = 0; this.leaving = false; }, 300);
  }
  private get reduced() { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
  private next() {
    const card = (this.getRootNode() as ShadowRoot).host;
    if (this.points.length < 2 || document.hidden || card?.matches(':hover, :focus-within')) return;
    const advance = () => { this.index = (this.index + 1) % this.points.length; this.leaving = false; };
    if (this.reduced) { advance(); return; }
    this.leaving = true; this.swap = setTimeout(advance, 350);
  }
  protected render() {
    const point = this.points[this.index % Math.max(1, this.points.length)];
    this.shown = point?.text;
    if (!point) return nothing;
    const out = this.leaving ? 'out' : '';
    return html`<div aria-hidden="true">${'official' in point ? alertBubble(point, out) : bubble(point, out)}</div>
      <ul class="sr">${this.points.map(p => html`<li>${p.label ? `${p.label} : ` : ''}${p.text}</li>`)}</ul>`;
  }
  static styles = [bubbles, css`
    :host { display:block; min-width:0; }
    ha-icon { display:flex; line-height:0; }
    .sr { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; margin:0; padding:0; }
  `];
}
