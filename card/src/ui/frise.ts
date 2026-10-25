// The banner's timeline, drawn: a sentence that scrolls through the points over a track cut by the forecast sky,
// the points as dated labels above it. The labels are placed after measuring, so they never overlap; when they cannot all fit, they keep only their icons.
import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { colon, t } from '../i18n';
import { property, state } from 'lit/decorators.js';
import { define } from './define';
import { buildFrise, type Frise, type FriseGroup, type FriseItem } from '../frise';
import type { AlertPoint, Slot, TickerPoint } from '../view';

/** Each point stays 4.5 s; a tap on a label holds it 9 s. */
const STEP = 4500, HOLD = 9000;
/** Rebuilt every 5 minutes even when the view does not change: « now » moves along the track. */
const STALE = 300;
/** Gap between two labels, and how far a label may pass the edge of the track. */
const GAP = 6, EDGE = 10;

const tone = (i: FriseItem) => `--tone:var(--nw-${i.theme ?? (i.alert ? `level${i.alert}` : 'calm')})`;
const stop = (e: Event) => e.stopPropagation();

@define('niak-frise')
export class NiakFrise extends LitElement {
  @property({ attribute: false }) points: TickerPoint[] = [];
  @property({ attribute: false }) alerts: AlertPoint[] = [];
  @property({ attribute: false }) hours: Slot[] = [];
  /** The integration's own list for the timeline (2.0.5 and later). */
  @property({ attribute: false }) timeline?: TickerPoint[];
  /** The point on show. */
  @state() private index = 0;
  /** The point sliding out, for the length of its transition. */
  @state() private leaving?: number;
  @state() private paused = false;
  /** How long the point on show stays: its progress bar fills in that time. */
  @state() private step = STEP;
  private frise: Frise = buildFrise([], [], [], 0);
  private built = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private leave?: ReturnType<typeof setTimeout>;
  private due = 0;
  private left = STEP;
  private resize?: ResizeObserver;

  connectedCallback() {
    super.connectedCallback();
    this.schedule(STEP);
    if (this.hasUpdated) this.observe();
  }
  disconnectedCallback() { super.disconnectedCallback(); clearTimeout(this.timer); clearTimeout(this.leave); this.resize?.disconnect(); }

  protected willUpdate(changed: PropertyValues<this>) {
    const now = Date.now() / 1000;
    if (!changed.has('points') && !changed.has('alerts') && !changed.has('hours') && !changed.has('timeline') && now - this.built < STALE) return;
    const shown = this.frise.items[this.index]?.text;
    this.frise = buildFrise(this.points, this.alerts, this.hours, now, this.timeline); this.built = now;
    // The point on show stays on show if it is still there: nothing moves when the view is refreshed.
    const keep = this.frise.items.findIndex(i => i.text === shown);
    this.index = keep >= 0 ? keep : 0; this.leaving = undefined;
  }
  protected firstUpdated() { this.observe(); }
  protected updated() { this.layout(); }
  private observe() {
    const track = this.renderRoot.querySelector('.track');
    if (!track || typeof ResizeObserver === 'undefined') return;
    this.resize?.disconnect();
    this.resize = new ResizeObserver(() => this.layout()); this.resize.observe(track);
  }

  // ---- The scrolling: one timer, paused while the pointer or the focus is on the timeline. ----
  private schedule(delay: number) {
    clearTimeout(this.timer);
    this.step = delay; this.left = delay; this.due = Date.now() + delay;
    if (!this.paused) this.timer = setTimeout(() => this.next(), delay);
  }
  private next() {
    if (Date.now() / 1000 - this.built >= STALE) this.requestUpdate();
    const count = this.frise.items.length;
    if (count < 2 || document.hidden) { this.schedule(STEP); return; }
    this.show((this.index + 1) % count, STEP);
  }
  private show(n: number, delay: number) {
    if (n !== this.index) {
      this.leaving = this.index; this.index = n;
      clearTimeout(this.leave); this.leave = setTimeout(() => { this.leaving = undefined; }, 460);
    }
    this.schedule(delay);
  }
  /** A tap on a label shows its first point; another tap goes to the next point of the same label. */
  private pick(g: FriseGroup) {
    const k = g.items.indexOf(this.index);
    this.show(k < 0 ? g.items[0] : g.items[(k + 1) % g.items.length], HOLD);
  }
  private pause = (e: Event) => {
    if ((e as PointerEvent).pointerType === 'touch' || this.paused) return;
    this.paused = true; clearTimeout(this.timer); this.left = Math.max(300, this.due - Date.now());
  };
  private resume = (e: Event) => {
    if ((e as PointerEvent).pointerType === 'touch' || !this.paused || (e.type === 'pointerleave' && this.matches(':focus-within'))) return;
    this.paused = false; this.due = Date.now() + this.left; this.timer = setTimeout(() => this.next(), this.left);
  };

  // ---- Measured placement: labels keep apart and inside the frame, hours never touch, small segments lose their icon. ----
  private layout() {
    const track = this.renderRoot.querySelector<HTMLElement>('.track'), width = track?.clientWidth;
    if (!track || !width) return;
    const pins = [...track.querySelectorAll<HTMLElement>('.pin')];
    // Too many labels for the width (a phone): they keep only their icons, the time stays in the sentence above.
    track.classList.remove('compact');
    const room = (list: HTMLElement[]) => list.reduce((sum, p) => sum + p.offsetWidth + GAP, -GAP) <= width + 2 * EDGE;
    if (!room(pins)) track.classList.add('compact');
    const w = pins.map(p => p.offsetWidth), x = pins.map(p => Number(p.dataset.x) * width);
    x.forEach((v, i) => { x[i] = Math.max(v, w[i] / 2 - EDGE, i ? x[i - 1] + (w[i - 1] + w[i]) / 2 + GAP : -Infinity); });
    for (let i = x.length - 1; i >= 0; i--) x[i] = Math.min(x[i], i === x.length - 1 ? width - w[i] / 2 + EDGE : x[i + 1] - (w[i + 1] + w[i]) / 2 - GAP);
    pins.forEach((p, i) => { p.style.left = `${Math.round(x[i])}px`; });
    track.querySelectorAll<HTMLElement>('.seg').forEach(s => s.classList.toggle('tight', s.clientWidth < 28));
    const marks = [...this.renderRoot.querySelectorAll<HTMLElement>('.hours span')];
    marks.forEach(m => m.classList.remove('hide'));
    if (marks.length < 3) return;
    const end = marks[marks.length - 1].getBoundingClientRect();
    let previous = marks[0].getBoundingClientRect();
    for (const m of marks.slice(1, -1)) {
      const r = m.getBoundingClientRect();
      if (r.left < previous.right + 18 || r.right > end.left - 18) m.classList.add('hide'); else previous = r;
    }
  }

  protected render() {
    const { items, groups, segments, marks } = this.frise;
    if (!items.length && !segments.length) return nothing;
    const when = (i: FriseItem) => i.now || !i.clock ? i.label : `${i.label} · ${i.clock}`;
    return html`<div class=${`panel${this.paused ? ' paused' : ''}`} @pointerenter=${this.pause} @pointerleave=${this.resume} @focusin=${this.pause} @focusout=${this.resume}>
      ${items.length ? html`<div class="head" aria-hidden="true">
        <div class="say">${items.map((i, n) => html`<div class=${`item${n === this.index ? ' on' : n === this.leaving ? ' off' : ''}${i.alert ? ' al' : ''}`}
          style=${`${tone(i)}${i.alert ? `;--al:var(--nw-level${i.alert})` : ''}`}>
          <span class="badge"><ha-icon icon=${i.icon}></ha-icon></span><div><div class="when">${when(i)}</div><div class="x" title=${i.text}>${i.text}</div></div></div>`)}</div>
        ${items.length > 1 ? html`<div class="progress" style=${`--step:${this.step}ms`}>${items.map((_, n) => html`<i class=${n === this.index ? 'on' : n < this.index ? 'done' : ''}></i>`)}</div>` : nothing}
      </div>` : nothing}
      <div class=${`track${groups.length ? '' : ' bare'}`}>
        <div class="chips">${groups.map(g => {
          // The whole label takes the colour of the point on show: its background, the rings of its icons, the icon in front.
          const active = g.items.includes(this.index), lead = items[active ? this.index : g.items[0]];
          return html`<button type="button" class=${`pin${active ? ' on' : ''}${g.alert ? ' al' : ''}`} data-x=${g.x}
            style=${`left:${(g.x * 100).toFixed(2)}%;${tone(lead)}${g.alert ? `;--al:var(--nw-level${g.alert})` : ''}`}
            aria-label=${g.items.map(n => colon(when(items[n]), items[n].text)).join(t(' ; '))} @click=${() => this.pick(g)} @pointerdown=${stop}>
            <span class="chip"><span class="stack">${g.items.map((n, j) => html`<span class=${`mini${n === this.index || (!active && !j) ? ' cur' : ''}`} style=${tone(items[n])}>
              <ha-icon icon=${items[n].icon}></ha-icon></span>`)}</span><span class="clock">${g.clock}</span>${g.items.length > 1 ? html`<span class="count">${g.items.length}</span>` : nothing}</span>
            <span class="stem"></span></button>`;
        })}</div>
        <div class="lane">${segments.length ? segments.map(s => html`<span class=${`seg s-${s.kind}`} style=${`flex:${s.flex}`}><ha-icon icon=${s.icon}></ha-icon></span>`)
          : html`<span class="seg s-cloud" style="flex:1"></span>`}</div>
        <span class="needle"></span>
      </div>
      ${segments.length ? html`<div class="hours" aria-hidden="true">${marks.map(m => html`<span class=${m.edge ?? ''} style=${`left:${(m.x * 100).toFixed(2)}%`}>${m.text}</span>`)}</div>` : nothing}
      <ul class="sr">${items.map(i => html`<li>${colon(when(i), i.text)}</li>`)}</ul>
    </div>`;
  }

  static styles = css`
    :host { display:block; min-width:0; color:var(--nw-fg); }
    ha-icon { display:flex; line-height:0; }
    button { font:inherit; color:inherit; }
    .sr { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; margin:0; padding:0; }
    /* Frosted glass: clear enough to see the animated sky through it, blurred enough to keep the text readable. Crisp 1 px outline. */
    .panel { position:relative; padding:12px 16px; border-radius:var(--nw-radius); border:1px solid var(--nw-line);
      background:var(--nw-glass-clear); backdrop-filter:var(--nw-frost); -webkit-backdrop-filter:var(--nw-frost); box-shadow:0 8px 24px rgb(15 25 45 / .08); }

    /* The sentence: one point at a time, sliding up. */
    .head { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
    /* Clipped for the slide, so it starts 3 px further left: the outline of the badge stays whole. */
    .say { position:relative; flex:1; min-width:0; height:38px; overflow:hidden; margin-left:-3px; }
    .item { position:absolute; inset:0 0 0 3px; display:flex; gap:10px; align-items:center; opacity:0; translate:0 100%; transition:opacity .45s var(--nw-ease), translate .45s var(--nw-ease); }
    .item.on { opacity:1; translate:0 0; } .item.off { opacity:0; translate:0 -100%; }
    .item > div { min-width:0; }
    .when { font-size:var(--nw-fs-label); line-height:13px; letter-spacing:var(--nw-label-spacing); text-transform:uppercase; font-weight:700; white-space:nowrap;
      color:color-mix(in oklab, var(--tone) var(--nw-ink), var(--nw-fg)); }
    .x { font-size:var(--nw-fs-text); line-height:18px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .badge { display:grid; place-items:center; width:32px; height:32px; flex:none; border-radius:10px; background:color-mix(in srgb, var(--tone) 32%, var(--nw-bg)); }
    .badge ha-icon { --mdc-icon-size:18px; color:color-mix(in oklab, var(--tone) 40%, var(--nw-fg)); }
    .item.al .badge { background:color-mix(in srgb, var(--al) 50%, var(--nw-bg)); box-shadow:0 0 0 1px color-mix(in oklab, var(--al) 70%, transparent); }
    .item.al .badge ha-icon { color:color-mix(in oklab, var(--al) 30%, var(--nw-fg)); }
    .item.al .when { color:color-mix(in oklab, var(--al) var(--nw-ink), var(--nw-fg)); }
    /* One bar per point: the one on show fills while it stays. */
    .progress { display:flex; gap:4px; flex:none; }
    .progress i { position:relative; width:18px; height:3px; border-radius:2px; background:var(--nw-line); overflow:hidden; }
    .progress i.done { background:color-mix(in srgb, var(--nw-fg2) 60%, transparent); }
    .progress i.on::after { content:''; position:absolute; inset:0; background:var(--nw-fg2); transform-origin:left; animation:fill var(--step) linear forwards; }
    .paused .progress i.on::after { animation-play-state:paused; }
    @keyframes fill { from { transform:scaleX(0); } }

    /* The track: labels above, the forecast sky as capsules, the needle of now on the left. */
    .track { position:relative; height:62px; margin:0 4px; }
    .track.bare { height:26px; }
    .chips { position:absolute; inset:0 0 auto; height:40px; }
    .pin { position:absolute; top:0; display:flex; flex-direction:column; align-items:center; translate:-50% 0; border:0; background:none; padding:0; cursor:pointer; }
    .pin:focus-visible { outline:none; } .pin:focus-visible .chip { outline:2px solid var(--nw-accent); outline-offset:2px; }
    .chip { --chip:var(--nw-glass-strong); position:relative; display:flex; gap:5px; align-items:center; padding:3px 6px 3px 4px; border-radius:var(--nw-radius-pill);
      white-space:nowrap; font-size:var(--nw-fs-small); line-height:16px; font-weight:600; font-variant-numeric:tabular-nums;
      background:var(--chip); border:1px solid transparent; transition:background .35s, transform .35s var(--nw-ease), box-shadow .35s; }
    /* The outline is drawn above the icons: the ring of the icon in front never eats into it. */
    .chip::before { content:''; position:absolute; inset:-1px; z-index:2; border-radius:inherit; border:1px solid var(--edge, var(--nw-line)); pointer-events:none; }
    .stem { width:1px; height:12px; background:var(--nw-line); }
    .pin.on .chip { --chip:color-mix(in srgb, var(--tone) 40%, var(--nw-bg)); transform:translateY(-2px); --edge:transparent; box-shadow:0 6px 14px rgb(0 0 0 / .12); }
    /* Stacked icons, all in the label's colour: each ringed with it to stand apart; the point on show is darker and comes forward. */
    .stack { display:flex; }
    .mini { position:relative; display:grid; place-items:center; width:20px; height:20px; border-radius:50%;
      background:color-mix(in srgb, var(--nw-fg) 6%, var(--chip)); box-shadow:0 0 0 2px var(--chip); transition:transform .3s var(--nw-ease), background .3s; }
    .mini + .mini { margin-left:-4px; }
    .mini ha-icon { --mdc-icon-size:13px; color:color-mix(in oklab, var(--tone) 40%, var(--nw-fg)); }
    .mini.cur { z-index:1; background:color-mix(in srgb, var(--tone) 70%, var(--nw-bg)); }
    .pin.on .mini.cur { transform:scale(1.12); }
    .count { display:grid; place-items:center; min-width:16px; height:16px; padding:0 4px; box-sizing:border-box; border-radius:8px;
      font-size:var(--nw-fs-label); font-weight:700; background:var(--nw-fg); color:var(--nw-bg); }
    /* A label holding an alert: the charter's alert outline and halo (a fixed shadow whose opacity breathes). */
    .pin.al .chip { --edge:color-mix(in oklab, var(--al) 70%, transparent); box-shadow:0 0 6px 0 color-mix(in oklab, var(--al) 32%, transparent); }
    .pin.al .chip::after { content:''; position:absolute; inset:-1px; border-radius:inherit; pointer-events:none; opacity:0;
      box-shadow:0 0 14px 2px color-mix(in oklab, var(--al) 55%, transparent); animation:nw-glow 5.2s ease-in-out infinite; animation-play-state:var(--nw-motion, running); }
    .lane { position:absolute; left:0; right:0; top:40px; height:16px; display:flex; gap:2px; }
    .track.bare .lane { top:5px; }
    .seg { display:grid; place-items:center; min-width:0; height:100%; overflow:hidden; border-radius:5px; background:color-mix(in srgb, var(--tone) 80%, transparent); }
    .seg:first-child { border-radius:8px 5px 5px 8px; } .seg:last-child { border-radius:5px 8px 8px 5px; } .seg:only-child { border-radius:8px; }
    .seg ha-icon { --mdc-icon-size:11px; color:color-mix(in oklab, var(--tone) 30%, #1f2430); }
    .seg.tight ha-icon { display:none; }
    .s-sun { --tone:var(--nw-heat); } .s-night { --tone:color-mix(in oklab, var(--nw-pressure) 70%, var(--nw-cold)); }
    .s-partly { --tone:color-mix(in oklab, var(--nw-cold) 60%, var(--nw-heat)); } .s-cloud { --tone:color-mix(in srgb, var(--nw-fg2) 35%, var(--nw-bg)); }
    .s-rain { --tone:var(--nw-rain); } .s-storm { --tone:var(--nw-pressure); } .s-snow { --tone:var(--nw-cold); } .s-wind { --tone:var(--nw-wind); }
    .s-hail { --tone:color-mix(in oklab, var(--nw-cold) 55%, var(--nw-pressure)); } .s-fog { --tone:color-mix(in srgb, var(--nw-fg2) 22%, var(--nw-bg)); }
    .compact .clock { display:none; }
    .needle { position:absolute; left:0; top:34px; width:3px; height:28px; margin-left:-1.5px; border-radius:2px; background:var(--nw-fg); box-shadow:0 0 0 2px var(--nw-bg); }
    .track.bare .needle { top:0; height:26px; }
    .hours { position:relative; height:14px; margin:0 4px; font-size:var(--nw-fs-label); line-height:14px; color:var(--nw-fg2); letter-spacing:.04em; font-variant-numeric:tabular-nums; }
    .hours span { position:absolute; translate:-50% 0; white-space:nowrap; }
    .hours span.first { translate:0 0; } .hours span.last { translate:-100% 0; } .hours span.hide { visibility:hidden; }
    @keyframes nw-glow { 50% { opacity:1; } }
    @media (prefers-reduced-motion:reduce) {
      .item, .chip, .mini { transition:none; } .progress i.on::after { animation:none; } .pin.al .chip::after { animation:none; }
    }
  `;
}

declare global { interface HTMLElementTagNameMap { 'niak-frise': NiakFrise } }
