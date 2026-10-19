import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { define } from './ui/define';
import { cleanConfig, sections } from './config';
import { displayed } from './display';
import { bubbles, pieces, tokens } from './ui/charter';
import { DEFAULT_BLOCKS, renderTile, tileStyles, type PressTarget } from './views/tile';
import { alertItems, compactStyles, renderAlert, renderForecastCard, renderMini, renderRain } from './views/compact';
import { fullStyles, renderFull, type SectionId } from './views/full';
import { heroStyles } from './views/hero';
import { todayStyles } from './views/today';
import { forecastStyles } from './views/forecasts';
import { airStyles } from './views/air';
import './ui/weather-sky';
import './editor/niak-weather-card-editor';
import { VIEW_VERSION, type ViewMessage, type WeatherView } from './view';
import type { HomeAssistant, PressAction, WeatherCardConfig } from './types';

const HOLD_MS = 500;
/** Phones and tablets: unless set otherwise, the tile's sky is lightened (fewer drops, clouds and leaves); its drawing is scaled down there anyway. */
const LIGHT_SKY = matchMedia('(pointer: coarse)');
let instances = 0;

/** Why there is no weather to show, and what to do about it. */
type Problem = 'missing' | 'not_configured' | 'choose_entry' | 'not_found' | 'version' | 'error';
const PROBLEMS: Record<Problem, { title: string; text: string; links?: [string, string][] }> = {
  // Home Assistant only starts an integration once it is added: downloaded from HACS but not added yet, it does not answer either.
  missing: { title: 'Niak Weather a besoin de son intégration',
    text: 'Depuis la version 2.0, la carte reçoit ses calculs de l’intégration Niak Weather. Déjà téléchargée depuis HACS ? Ajoutez-la dans Paramètres → Appareils et services. Sinon, installez-la depuis HACS, redémarrez Home Assistant, puis ajoutez-la. Déjà ajoutée ? Elle n’a pas démarré : les journaux disent pourquoi (Paramètres → Système → Journaux, cherchez « niak »).',
    links: [['Ajouter l’intégration', '/config/integrations/dashboard/add?domain=niak_weather'], ['L’installer', 'https://github.com/Niakman13/niak-weather-integration#installation']] },
  not_configured: { title: 'Ajoutez l’intégration Niak Weather',
    text: 'Elle est installée mais pas encore configurée. Elle peut reprendre les réglages de vos cartes.',
    links: [['Ajouter l’intégration', '/config/integrations/dashboard/add?domain=niak_weather']] },
  choose_entry: { title: 'Choisissez un lieu', text: 'Plusieurs lieux Niak Weather sont configurés : choisissez celui de cette carte dans ses réglages.' },
  not_found: { title: 'Lieu introuvable', text: 'Le lieu de cette carte n’existe plus : choisissez-en un autre dans ses réglages.' },
  version: { title: 'Rechargez la page', text: 'L’intégration Niak Weather vient d’être mise à jour : rechargez la page pour afficher sa carte.' },
  // The integration answered, with an error: say which, it tells what went wrong.
  error: { title: 'L’intégration Niak Weather a renvoyé une erreur',
    text: 'Les journaux de Home Assistant disent pourquoi : Paramètres → Système → Journaux, cherchez « niak ».', links: [['Voir les journaux', '/config/logs']] },
};

@define('niak-weather-card')
export class NiakWeatherCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  /** Set by Home Assistant while the dashboard is edited, and in the card picker: the alert card then shows when it would hide. */
  @property({ attribute: false }) public editMode = false;
  @property({ attribute: false }) public preview = false;
  @state() private config?: WeatherCardConfig;
  /** The forecasts on the hours or the days (remembered on this device). */
  @state() private tab: 'hours' | 'days' = 'hours';
  /** What the integration computed, as it last sent it. */
  @state() private view?: WeatherView;
  @state() private problem?: Problem;
  /** The integration's own words when it answered with an error. */
  private failure = '';
  /** The tile is unfolded (remembered on this device). */
  @state() private open = false;
  /** The full card is shown over the page, after a long press on the tile. */
  @state() private dialogOpen = false;
  @state() private folded: Record<SectionId, boolean> = { today: false, predictions: false };
  private readonly uid = `nw${++instances}`;
  private subscription?: Promise<() => Promise<void>>;
  private subscribedTo?: string;
  private retry?: ReturnType<typeof setTimeout>;
  private press?: { x: number; y: number; long: boolean; timer: ReturnType<typeof setTimeout>; frame: number };

  public setConfig(config: WeatherCardConfig): void {
    const next = cleanConfig(config), old = this.config;
    if (old && JSON.stringify(old) === JSON.stringify(next)) return;
    this.config = next;
    if (!old || old.collapse_today !== next.collapse_today || old.collapse_predictions !== next.collapse_predictions)
      this.folded = { today: next.collapse_today === true, predictions: next.collapse_predictions === true };
    if (!old || old.format !== next.format || old.entry_id !== next.entry_id) this.open = this.remembered(next);
    if (!old || old.forecast_tab !== next.forecast_tab || old.entry_id !== next.entry_id) this.tab = this.rememberedTab(next);
    // Another place: its own view, from a new subscription.
    if (old && old.entry_id !== next.entry_id) { this.unsubscribe(); this.view = undefined; this.problem = undefined; }
  }
  public static getStubConfig(): WeatherCardConfig { return { type: 'custom:niak-weather-card' }; }
  public static getConfigElement(): HTMLElement { return document.createElement('niak-weather-card-editor'); }
  public getCardSize(): number {
    if (!this.config) return 10;
    if (this.config.format === 'mini') return 1;
    if (this.config.format === 'alert') return this.view && this.hasAlert(this.view) ? 2 : 0;
    if (this.config.format === 'forecast' || this.config.format === 'rain') return 5;
    if (this.tile) return this.unfolded ? 7 : 2;
    return Math.max(1, (this.config.show_synthesis === false ? 0 : 4) + (this.config.show_today === false ? 0 : 5) + (this.config.show_predictions === false ? 0 : 4));
  }
  public getGridOptions() {
    const format = this.config?.format;
    if (format === 'mini') return { columns: 12, rows: 1, min_columns: 3 };
    return this.tile || format === 'alert' || format === 'forecast' || format === 'rain' ? { columns: 12, rows: 'auto', min_columns: 6 } : { columns: 'full', rows: 'auto' };
  }

  /** A tile that no press folds stays as its format starts, whatever was remembered. */
  private get unfolded(): boolean {
    return this.tapTarget === 'toggle' || this.holdTarget === 'toggle' ? this.open : this.config?.format === 'intermediate';
  }
  /** Tile and intermediate formats: one band that unfolds. */
  private get tile(): boolean { return this.config?.format === 'tile' || this.config?.format === 'intermediate'; }
  /** Everything but the full card: what a long press (a tap on mini and alert) opens. */
  private get small(): boolean { return !!this.config?.format && this.config.format !== 'full'; }
  private hasAlert(v: WeatherView): boolean { const { alerts, points } = alertItems(v); return alerts.length + points.length > 0; }
  private rememberedTab(config: WeatherCardConfig): 'hours' | 'days' {
    try { const v = localStorage.getItem(`niak-weather:tab:${config.entry_id ?? ''}`); if (v === 'hours' || v === 'days') return v; } catch { /* private browsing */ }
    return config.forecast_tab ?? 'hours';
  }
  private setTab = (tab: 'hours' | 'days') => {
    this.tab = tab;
    try { localStorage.setItem(`niak-weather:tab:${this.config?.entry_id ?? ''}`, tab); } catch { /* private browsing */ }
  };
  private key(config = this.config!) { return `niak-weather:open:${config.format}:${config.entry_id ?? config.weather_entity ?? ''}`; }
  private remembered(config: WeatherCardConfig): boolean {
    try { const v = localStorage.getItem(this.key(config)); if (v !== null) return v === '1'; } catch { /* private browsing */ }
    return config.format === 'intermediate';
  }

  public connectedCallback(): void { super.connectedCallback(); this.picker = this.inPicker(); this.subscribe(); }
  /** In the « Add card » window Home Assistant flags nothing: the card finds the window among its ancestors. */
  private picker = false;
  private inPicker(): boolean {
    for (let node: Node | null = this; node; node = node.parentNode ?? (node instanceof ShadowRoot ? node.host : null))
      if (node instanceof HTMLElement && node.localName === 'hui-card-picker') return true;
    return false;
  }
  /** Being edited or chosen: the alert card shows what it would hide. */
  private get editing(): boolean { return this.editMode || this.preview || this.picker; }
  public disconnectedCallback(): void { super.disconnectedCallback(); this.cancelPress(); this.unsubscribe(); }
  protected shouldUpdate(changed: PropertyValues): boolean {
    if (changed.has('hass') || changed.has('config')) this.subscribe();
    // Home Assistant pushes every state change: the card only redraws when the integration sends a new view.
    return !(changed.size === 1 && changed.has('hass'));
  }
  protected updated(): void {
    // The alert card takes no room while all is calm, except while the dashboard is being edited.
    this.toggleAttribute('hidden', this.config?.format === 'alert' && !!this.view && !this.hasAlert(this.view) && !this.editing);
    this.toggleAttribute('still', this.config?.weather_animations === false);
    this.toggleAttribute('flat', this.config?.glass_effect === false);
    const dialog = this.renderRoot.querySelector<HTMLDialogElement>('dialog');
    if (dialog && this.dialogOpen && !dialog.open) dialog.showModal();
  }

  /** One live subscription to the integration's view of this card's place. */
  private subscribe(): void {
    const connection = this.hass?.connection, config = this.config;
    if (!connection || !config || !this.isConnected) return;
    const place = config.entry_id ?? '';
    if (this.subscription && this.subscribedTo === place) return;
    this.unsubscribe();
    this.subscribedTo = place;
    const subscription = connection.subscribeMessage<ViewMessage | { version: number; reload: true }>(m => this.receive(m),
      { type: 'niak_weather/subscribe', ...(config.entry_id ? { entry_id: config.entry_id } : {}) });
    this.subscription = subscription;
    subscription.catch((error: { code?: string; message?: string }) => {
      if (this.subscription !== subscription) return;
      this.subscription = undefined;
      const code = error?.code;
      // Only an unknown command means the integration is not running; any other answer is an error of its own.
      this.failure = [error?.message, code].filter(Boolean).join(' · ');
      this.problem = code === 'not_configured' || code === 'choose_entry' || code === 'not_found' ? code : !code || code === 'unknown_command' ? 'missing' : 'error';
      // Home Assistant may still be starting, or the place being set up: try again, less often when nothing answers.
      if (code !== 'choose_entry') this.retryLater(code === 'unknown_command' ? 30_000 : 5_000);
    });
  }
  private receive(message: ViewMessage | { version: number; reload: true }): void {
    if ('reload' in message) { this.unsubscribe(); this.retryLater(2_000); return; }
    if (message.version !== VIEW_VERSION) { this.problem = 'version'; return; }
    this.problem = undefined;
    this.view = message.view;
  }
  private unsubscribe(): void {
    clearTimeout(this.retry);
    const subscription = this.subscription;
    this.subscription = undefined; this.subscribedTo = undefined;
    void subscription?.then(stop => stop()).catch(() => { /* already closed */ });
  }
  private retryLater(delay: number): void {
    clearTimeout(this.retry);
    this.retry = setTimeout(() => this.subscribe(), delay);
  }

  protected render() {
    if (!this.config) return nothing;
    if (this.problem && !this.view) return this.renderProblem(PROBLEMS[this.problem]);
    if (!this.view) return html`<ha-card><div class="nw-wait" role="status" aria-label="Chargement de la météo"></div></ha-card>`;
    const config = this.config, view = displayed(this.view, config, this.tile);
    // Gusts for the sky: the station's last measure, else the forecast for this hour.
    const measured = view.wind?.gust.at(-1)?.[1];
    const gust = measured ?? view.hours[0]?.gust ?? 0;
    const sky = html`<niak-weather-sky .condition=${view.now.condition} .phase=${view.now.phase} .animated=${config.weather_animations !== false}
      .quality=${config.weather_animation_quality ?? (this.tile && LIGHT_SKY.matches ? 'low' : 'standard')} .wind=${view.now.wind ?? 0} .gust=${gust} .season=${view.season.info.season}></niak-weather-sky>`;
    const full = () => renderFull(view, { sky, uid: this.uid, entity: view.weatherEntity, station: view.station,
      sections: sections(config), tab: this.tab, onTab: this.setTab,
      folded: this.folded, onFold: id => { this.folded = { ...this.folded, [id]: !this.folded[id] }; } });
    const title = `Météo${view.location ? ` · ${view.location}` : ''}`;
    const dialog = () => this.dialogOpen ? html`<dialog class="nw-dialog" aria-label=${title} @close=${() => { this.dialogOpen = false; }} @click=${this.openEntity} @keydown=${this.entityKey}>
        <header><b>${title}</b><button type="button" @click=${this.closeDialog}>Fermer</button></header>${full()}</dialog>` : nothing;
    const holdTarget = this.holdTarget;
    switch (config.format) {
      case 'mini':
        return html`<ha-card><div @click=${this.tap} @keydown=${this.tapKey}>${renderMini(view, holdTarget)}</div>${dialog()}</ha-card>`;
      case 'alert': {
        const body = renderAlert(view, this.editing);
        return body === nothing ? nothing : html`<ha-card><div @click=${this.tap} @keydown=${this.tapKey}>${body}</div>${dialog()}</ha-card>`;
      }
      case 'rain':
        return html`<ha-card @click=${this.openEntity} @keydown=${this.entityKey}>${renderRain(view)}</ha-card>`;
      case 'forecast':
        return html`<ha-card @click=${this.openEntity} @keydown=${this.entityKey}>${renderForecastCard(view, this.tab, this.setTab, view.weatherEntity, this.uid)}</ha-card>`;
    }
    if (!this.tile) return html`<ha-card @click=${this.openEntity} @keydown=${this.entityKey}>${full()}</ha-card>`;
    const blocks = config.tile_blocks?.length ? config.tile_blocks : config.show_bulletin === false ? ['events' as const] : DEFAULT_BLOCKS;
    return html`<ha-card>
      <div @pointerdown=${this.down} @pointermove=${this.move} @pointerup=${this.up} @pointercancel=${this.cancelPress} @pointerleave=${this.cancelPress}
        @contextmenu=${this.noMenu} @keydown=${this.tileKey}>
        ${renderTile(view, sky, { open: this.unfolded, tapTarget: this.tapTarget, holdTarget, blocks, tab: this.tab, onTab: this.setTab })}</div>
      ${dialog()}
    </ha-card>`;
  }

  private renderProblem(p: (typeof PROBLEMS)[Problem]) {
    return html`<ha-card><div class="nw-problem" role="status"><ha-icon icon="mdi:weather-partly-cloudy"></ha-icon>
      <div><b>${p.title}</b>${p === PROBLEMS.error && this.failure ? html`<p class="failure">« ${this.failure} »</p>` : nothing}<p>${p.text}</p>${p.links ? html`<div class="links">${p.links.map(([label, href], i) => html`<a class=${i ? 'second' : ''} href=${href}
        target=${href.startsWith('/') ? nothing : '_blank'} rel="noopener noreferrer" @click=${this.follow}>${label}</a>`)}</div>` : nothing}</div></div></ha-card>`;
  }
  /** A link inside Home Assistant opens there, without reloading the page. */
  private follow = (e: MouseEvent) => {
    const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
    if (!href?.startsWith('/')) return;
    e.preventDefault(); this.go(href);
  };
  private go(path: string): void {
    history.pushState(null, '', path);
    window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));
  }

  /** What a long press on the tile (a tap on mini and alert) does: the full card, the user's weather page, fold or unfold, or nothing. */
  private get holdTarget(): PressTarget { return this.target(this.config?.hold_action ?? (this.weatherPath ? 'page' : 'popup')); }
  /** What a tap on the tile does; unfolding unless chosen otherwise. */
  private get tapTarget(): PressTarget { return this.target(this.config?.tap_action ?? 'toggle'); }
  private target(action: PressAction): PressTarget {
    if (action === 'none') return 'none';
    // Only the tile folds; a page without a valid path falls back to the full card rather than doing nothing.
    if (action === 'toggle') return this.tile ? 'toggle' : 'card';
    return action === 'page' && this.weatherPath ? 'page' : 'card';
  }
  private get weatherPath(): string | undefined {
    const path = this.config?.weather_path;
    return path?.startsWith('/') && !path.startsWith('//') ? path : undefined;
  }
  private tileCard() { return this.renderRoot.querySelector<HTMLElement>('.nw-tilecard'); }
  /** Tap and long press (½ s): what each is set to do. Sliding cancels both. */
  private down = (e: PointerEvent) => {
    const card = this.tileCard();
    if (e.button !== 0 || !card) return;
    this.cancelPress();
    const ring = card.querySelector<HTMLElement>('.press-ring'), r = card.getBoundingClientRect(), start = performance.now();
    ring?.style.setProperty('left', `${e.clientX - r.left}px`); ring?.style.setProperty('top', `${e.clientY - r.top}px`);
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / HOLD_MS);
      ring?.style.setProperty('--p', String(p)); card.classList.toggle('pressing', p > .15);
      if (p < 1 && this.press) this.press.frame = requestAnimationFrame(tick);
    };
    // Without a long press to give, a press is only a tap: no ring fills up.
    const holdable = this.holdTarget !== 'none';
    this.press = { x: e.clientX, y: e.clientY, long: false, frame: holdable ? requestAnimationFrame(tick) : 0,
      timer: setTimeout(() => { if (!this.press || !holdable) return; this.press.long = true; this.stopRing(); this.act(this.holdTarget); }, HOLD_MS) };
  };
  private move = (e: PointerEvent) => { if (this.press && Math.hypot(e.clientX - this.press.x, e.clientY - this.press.y) > 10) this.cancelPress(); };
  private up = () => { const press = this.press; this.cancelPress(); if (press && !press.long) this.act(this.tapTarget); };
  private stopRing() {
    if (!this.press) return;
    clearTimeout(this.press.timer); cancelAnimationFrame(this.press.frame);
    this.tileCard()?.classList.remove('pressing');
  }
  private cancelPress = () => { this.stopRing(); this.press = undefined; };
  /** A long press on a phone also opens the browser menu: not on the card. */
  private noMenu = (e: Event) => e.preventDefault();
  private tileKey = (e: KeyboardEvent) => {
    if (e.target !== this.tileCard() || !['Enter', ' '].includes(e.key)) return;
    e.preventDefault();
    this.act(e.shiftKey ? this.holdTarget : this.tapTarget);
  };
  /** Mini and alert: a tap opens the full card (or the weather page). */
  private tap = (e: Event) => { if (!(e.target as HTMLElement).closest('dialog')) this.act(this.holdTarget); };
  private tapKey = (e: KeyboardEvent) => {
    if (!['Enter', ' '].includes(e.key) || (e.target as HTMLElement).closest('dialog') || this.holdTarget === 'none') return;
    e.preventDefault(); this.act(this.holdTarget);
  };
  private toggle() {
    this.open = !this.open;
    try { localStorage.setItem(this.key(), this.open ? '1' : '0'); } catch { /* private browsing */ }
  }
  private act(target: PressTarget) {
    const path = this.weatherPath;
    if (target === 'toggle') this.toggle();
    else if (target === 'page' && path) this.go(path);
    else if (target === 'card') this.dialogOpen = true;
  }
  private closeDialog = () => { this.renderRoot.querySelector('dialog')?.close(); };
  /** A value of the full card opens its sensor's details, like the rest of Home Assistant. */
  private openEntity = (e: Event) => {
    const target = e.composedPath().find((el): el is HTMLElement => el instanceof HTMLElement && el.hasAttribute('data-entity'));
    if (!target || target.closest('.nw-tilecard')) return;
    // Home Assistant's details window would open under ours: close ours first.
    this.closeDialog();
    this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: target.getAttribute('data-entity') }, bubbles: true, composed: true }));
  };
  private entityKey = (e: KeyboardEvent) => {
    if (!['Enter', ' '].includes(e.key) || !(e.target instanceof HTMLElement) || !e.target.hasAttribute('data-entity')) return;
    e.preventDefault(); this.openEntity(e);
  };

  static styles = [tokens, pieces, bubbles, tileStyles, compactStyles, heroStyles, fullStyles, todayStyles, forecastStyles, airStyles, css`
    :host { display:block; }
    :host([hidden]) { display:none; }
    /* Animations switched off: the alert halo stays still too, in the tile, the window and the scrolling bubble. */
    :host([still]) { --nw-motion:paused; }
    /* Frosted glass switched off: no blur anywhere (it costs a lot on slow devices), a more opaque glass keeps the text readable. */
    :host([flat]) { --nw-blur:none; --nw-frost:none; --nw-glass-clear:color-mix(in srgb, var(--nw-bg) 86%, transparent); --nw-glass-strong:color-mix(in srgb, var(--nw-bg) 92%, transparent); }
    ha-card { padding:0; overflow:hidden; container-type:inline-size; }
    .nw-wait { min-height:96px; background:var(--nw-bg); }
    .nw-problem { display:flex; gap:14px; align-items:flex-start; padding:18px 20px; color:var(--nw-fg); font-size:var(--nw-fs-text); line-height:1.5; }
    .nw-problem > ha-icon { --mdc-icon-size:28px; color:var(--nw-accent); flex:none; }
    .nw-problem b { font-size:var(--nw-fs-title); }
    .nw-problem p { margin:4px 0 10px; color:var(--nw-fg2); }
    .nw-problem a { display:inline-block; padding:6px 14px; border-radius:var(--nw-radius-pill); background:var(--nw-accent); color:var(--nw-bg);
      font-weight:600; text-decoration:none; font-size:var(--nw-fs-small); }
    .nw-problem .links { display:flex; flex-wrap:wrap; gap:8px; }
    .nw-problem .failure { color:var(--nw-fg); font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:var(--nw-fs-small); word-break:break-word; }
    .nw-problem a.second { background:none; color:var(--nw-accent); box-shadow:inset 0 0 0 1px var(--nw-line); }
    dialog.nw-dialog { border:0; padding:0; width:min(1180px, 96vw); max-height:92vh; border-radius:16px; overflow:auto; overscroll-behavior:contain;
      background:var(--nw-bg); color:var(--nw-fg); box-shadow:0 24px 80px #0005; }
    dialog.nw-dialog::backdrop { background:#0b1520aa; backdrop-filter:blur(2px); }
    .nw-dialog > header { position:sticky; top:0; z-index:3; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 14px;
      background:var(--nw-bg); border-bottom:1px solid var(--nw-line-soft); font-size:var(--nw-fs-text); }
    .nw-dialog > header button { border:1px solid var(--nw-line); background:var(--nw-bg); border-radius:var(--nw-radius-pill); padding:5px 14px; cursor:pointer; font-size:var(--nw-fs-small); font-weight:600; }
    @media (max-width:600px) { dialog.nw-dialog { width:100vw; max-width:100vw; height:100dvh; max-height:100dvh; border-radius:0; margin:0; } }
    /* Full screen on a phone, the app may draw under the system bars: room to scroll the last section above them. */
    @media (max-width:600px) { dialog.nw-dialog > .nw-full { padding-bottom:calc(env(safe-area-inset-bottom, 0px) + 72px); } }
  `];
}

// One entry per format in Home Assistant's « Add card » window. Each creates the same card (`custom:niak-weather-card`) with its format:
// the picker takes the type from getStubConfig, so dashboards never depend on these extra names.
const FORMATS: Array<[NonNullable<WeatherCardConfig['format']>, string, string]> = [
  ['full', 'Niak Weather', 'La page météo : synthèse, mesures, prévisions, air et pollens.'],
  ['tile', 'Niak Weather · Tuile', 'Une bande qui se déplie d’un appui ; son contenu se choisit.'],
  ['intermediate', 'Niak Weather · Tuile dépliée', 'La tuile, ouverte au départ : bulletin, événements, moments ou prévisions.'],
  ['mini', 'Niak Weather · Mini', 'Une seule ligne : le ciel, la température et la vigilance.'],
  ['forecast', 'Niak Weather · Prévisions', 'Les 18 prochaines heures ou les 7 prochains jours.'],
  ['rain', 'Niak Weather · Pluie', 'La pluie à venir, celle qui tombe et celle qui est tombée.'],
  ['alert', 'Niak Weather · Alerte', 'Visible seulement en cas de vigilance ou d’alerte.'],
];
for (const [format, name, description] of FORMATS) {
  const type = format === 'full' ? 'niak-weather-card' : `niak-weather-${format === 'intermediate' ? 'tile-open' : format}-card`;
  if (format !== 'full' && !customElements.get(type)) customElements.define(type, class extends NiakWeatherCard {
    public static getStubConfig(): WeatherCardConfig { return { type: 'custom:niak-weather-card', format }; }
    // Written by hand as its own type, it keeps its format.
    public setConfig(config: WeatherCardConfig): void { super.setConfig({ format, ...config }); }
  });
  window.customCards = window.customCards || [];
  // A card from HACS still installed next to the integration's has offered them already.
  if (!window.customCards.some(card => card.type === type)) window.customCards.push({ type, name, description, preview: true });
}
declare global { interface Window { customCards: Array<Record<string, unknown>>; } }
