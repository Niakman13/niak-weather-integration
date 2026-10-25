import { css, html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { define } from '../ui/define';
import { cleanConfig, sections } from '../config';
import type { HomeAssistant, WeatherCardConfig } from '../types';

/** The card's editor: which place, then how to show it. The sources are set in the integration. */
const defaults: Partial<WeatherCardConfig> = { format: 'full', show_synthesis: true, show_bulletin: true, show_today: true, show_predictions: true,
  collapse_today: false, collapse_predictions: false, smart_brief: true, weather_animations: true, weather_animation_quality: 'standard',
  show_atmo_details: true, show_atmo_tomorrow: true, glass_effect: true, tile_blocks: ['bulletin', 'events'], forecast_tab: 'hours', pressure_span: '6h', clock: 'none' };
export const labels: Partial<Record<keyof WeatherCardConfig, string>> = {
  entry_id: 'Lieu', format: 'Format',
  weather_animations: 'Ciel animé et halos', weather_animation_quality: 'Qualité des animations', glass_effect: 'Effet verre dépoli',
  show_synthesis: 'Bandeau (synthèse et météo du moment)', show_bulletin: 'Bulletin du jour', smart_brief: 'Alertes et événements',
  show_today: 'Section Aujourd’hui', collapse_today: 'Aujourd’hui replié au départ',
  show_predictions: 'Section Prévisions', collapse_predictions: 'Prévisions repliées au départ',
  show_atmo_details: 'Détail des polluants et des pollens', show_atmo_tomorrow: 'Air et pollens de demain',
  weather_path: 'Page à ouvrir',
  tile_blocks: 'Contenu de la tuile dépliée', forecast_tab: 'Prévisions affichées au départ', banner_blocks: 'Contenu du bandeau', today_blocks: 'Contenu d’Aujourd’hui', forecast_blocks: 'Contenu des Prévisions',
  hold_action: 'Appui long', tap_action: 'Appui', pressure_span: 'Courbe de pression', clock: 'Heure dans le bandeau',
};
/** One line under the settings that need it. */
const helpers: Partial<Record<keyof WeatherCardConfig, string>> = {
  weather_animations: 'Coupées, le ciel et les halos restent fixes.',
  weather_animation_quality: 'Allégée : moins de gouttes, de flocons et de nuages.',
  glass_effect: 'Le flou demande beaucoup de ressources : à couper sur un appareil lent. Coupé, le verre devient plus opaque.',
  smart_brief: 'La vigilance, l’alerte mesurée chez vous et la frise des événements. Coupé, la frise ne montre que le ciel prévu.',
  weather_path: 'Le chemin de la page, par exemple /meteo ou /lovelace/meteo.',
  tile_blocks: 'Cochez ce qui s’affiche quand la tuile est dépliée, et faites glisser pour changer l’ordre.',
  banner_blocks: 'Le bandeau et son ciel animé restent toujours, avec le lieu, la vigilance et la météo du moment. Cochez ce qu’il montre en dessous, dans l’ordre.',
  today_blocks: 'Tout décocher retire la section.',
  forecast_blocks: 'Tout décocher retire la section.',
  forecast_tab: 'Un appui sur Heures ou Jours change l’affichage ; ce choix est gardé sur chaque appareil.',
  pressure_span: 'Sur plusieurs jours, on voit mieux arriver une dépression ou un anticyclone.',
  clock: 'L’heure de l’appareil, mise à jour chaque minute.',
};
const SETTINGS = '/config/integrations/integration/niak_weather';

@define('niak-weather-card-editor')
export class NiakWeatherCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private config?: WeatherCardConfig;
  /** The integration's places; null when the integration does not answer. */
  @state() private entries?: Array<{ entry_id: string; title: string }> | null;
  private asked = false;
  private readonly computeLabel = (item: { name: keyof WeatherCardConfig; title?: string }) =>
    item.title ?? (item.name === 'hold_action' && this.tapped ? 'Appui' : labels[item.name] ?? item.name);
  private readonly computeHelper = (item: { name: keyof WeatherCardConfig }) =>
    helpers[item.name] ?? '';
  private get small(): boolean { return !!this.config?.format && this.config.format !== 'full'; }
  /** Mini and alert open the full card on a simple tap. */
  private get tapped(): boolean { return this.config?.format === 'mini' || this.config?.format === 'alert'; }

  public setConfig(config: WeatherCardConfig): void {
    const next = cleanConfig(config);
    if (this.config && JSON.stringify(next) === JSON.stringify(this.config)) return;
    this.config = next;
  }
  protected shouldUpdate(changed: Map<PropertyKey, unknown>): boolean {
    // Home Assistant pushes every state change to editors: nothing here depends on them.
    if (changed.has('hass') && !this.asked && this.hass) {
      this.asked = true;
      this.hass.callWS<Array<{ entry_id: string; title: string }>>({ type: 'niak_weather/entries' })
        .then(entries => { this.entries = entries; }, () => { this.entries = null; });
    }
    return !(changed.size === 1 && changed.has('hass'));
  }
  private changed(event: CustomEvent<{ value: Partial<WeatherCardConfig> }>): void {
    event.stopPropagation();
    if (!this.config) return;
    this.config = cleanConfig({ ...this.config, ...event.detail.value });
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
  }
  /** The place and the format on top, then folding groups: the look and its cost first, then what the card shows. */
  private schema(): unknown[] {
    const toggles = (...names: Array<keyof WeatherCardConfig>) => names.map(name => ({ name, selector: { boolean: {} } }));
    const group = (title: string, icon: string, schema: unknown[], expanded = false) => ({ type: 'expandable', name: '', title, icon, flatten: true, expanded, schema });
    const format = { name: 'format', selector: { select: { mode: 'list', options: [
      { value: 'full', label: 'Complète : la page météo' },
      { value: 'tile', label: 'Tuile : une bande qui se déplie d’un appui' },
      { value: 'intermediate', label: 'Tuile dépliée : la même, ouverte au départ' },
      { value: 'mini', label: 'Mini : une seule ligne' },
      { value: 'forecast', label: 'Prévisions : les heures et les jours' },
      { value: 'rain', label: 'Pluie : à venir et tombée' },
      { value: 'alert', label: 'Alerte : visible seulement en cas de vigilance ou d’alerte' }] } } };
    const blocks = { name: 'tile_blocks', selector: { select: { multiple: true, reorder: true, mode: 'list', options: [
      { value: 'bulletin', label: 'Bulletin du jour' }, { value: 'events', label: 'Événements (la frise)' },
      { value: 'moments', label: 'Les prochains moments (soir, nuit, matin…)' }, { value: 'forecast', label: 'Prévisions (heures ou jours)' }] } } };
    const tab = { name: 'forecast_tab', selector: { select: { mode: 'dropdown', options: [{ value: 'hours', label: 'Heures' }, { value: 'days', label: 'Jours' }] } } };
    // The tile's tap and long press (a tap on mini and alert, which do not fold): the popup, a page (then its path), fold or unfold, or nothing.
    const foldable = this.config?.format === 'tile' || this.config?.format === 'intermediate';
    const hold = this.config?.hold_action ?? (this.config?.weather_path ? 'page' : 'popup'), tap = foldable ? this.config?.tap_action ?? 'toggle' : undefined;
    const press = (name: 'tap_action' | 'hold_action') => ({ name, required: true, selector: { select: { mode: 'dropdown', options: [
      ...(foldable ? [{ value: 'toggle', label: 'Déplier ou replier la tuile' }] : []),
      { value: 'popup', label: 'Ouvrir la météo complète en fenêtre' }, { value: 'page', label: 'Ouvrir une page' }, { value: 'none', label: 'Rien' }] } } });
    const path = [...(foldable ? [press('tap_action')] : []), press('hold_action'),
      ...(hold === 'page' || tap === 'page' ? [{ name: 'weather_path', selector: { text: {} } }] : [])];
    const place = this.entries && this.entries.length > 1
      ? [{ name: 'entry_id', selector: { select: { options: this.entries.map(e => ({ value: e.entry_id, label: e.title })) } } }] : [];
    const look = group('Visuel et performance', 'mdi:palette-outline', [...toggles('weather_animations'),
      { name: 'weather_animation_quality', required: true, selector: { select: { mode: 'dropdown', options: [{ value: 'standard', label: 'Standard' }, { value: 'low', label: 'Allégée' }] } } },
      ...toggles('glass_effect')], true);
    // The tile unfolds on a tap and opens the full card on a long press: its own options.
    const kind = this.config?.format;
    if (kind === 'mini' || kind === 'alert') return [...place, format, group('Fonctionnalités', 'mdi:tune-variant', path, true)];
    if (kind === 'forecast') return [...place, format, group('Fonctionnalités', 'mdi:tune-variant', [tab], true)];
    if (kind === 'rain') return [...place, format];
    if (this.small) return [...place, format, look,
      group('Contenu', 'mdi:view-list-outline', [blocks, ...((this.config?.tile_blocks ?? []).includes('forecast') ? [tab] : [])], true),
      group('Fonctionnalités', 'mdi:tune-variant', path)];
    // The full card's three sections, in their fixed order, each with its own blocks only.
    const list = (name: string, options: Array<[string, string]>) => ({ name, selector: { select: { multiple: true, reorder: true, mode: 'list',
      options: options.map(([value, label]) => ({ value, label })) } } });
    const choice = (name: string, options: Array<[string, string]>) => ({ name, required: true, selector: { select: { mode: 'dropdown',
      options: options.map(([value, label]) => ({ value, label })) } } });
    return [...place, format, look,
      group('Bandeau intelligent', 'mdi:view-day-outline', [list('banner_blocks', [['bulletin', 'Bulletin du jour'], ['events', 'Événements (la frise)'],
        ['moments', 'Les prochains moments (soir, nuit, matin…)'], ['forecast', 'Prévisions en tuiles (heures ou jours)']]),
        choice('clock', [['none', 'Masquée'], ['left', 'Sous le titre, en grand'], ['right', 'Au-dessus de « En ce moment »']])], true),
      group('Aujourd’hui', 'mdi:calendar-today', [list('today_blocks', [['rain', 'Pluie'], ['wind', 'Vent'], ['pressure', 'Pression'], ['comfort', 'Ressenti'],
        ['extras', 'Pastilles (humidité, rosée, soleil…)'], ['air', 'Air et pollens du jour']]),
        choice('pressure_span', [['6h', '6 dernières heures'], ['1d', '24 dernières heures'], ['2d', '2 derniers jours'], ['7d', '7 derniers jours']]),
        ...toggles('collapse_today')]),
      group('Prévisions', 'mdi:calendar-week', [list('forecast_blocks', [['hours', 'Les 18 prochaines heures'], ['days', 'Les 7 prochains jours'],
        ['air', 'Air et pollens de demain']]), ...toggles('collapse_predictions')]),
      group('Air et pollens', 'mdi:flower-pollen-outline', toggles('show_atmo_details'))];
  }
  protected render() {
    if (!this.config || !this.hass) return nothing;
    // An older card shows what its switches allowed: the lists start from there.
    const s = sections(this.config);
    const blocks = { ...(this.config.show_bulletin === false ? { tile_blocks: ['events'] } : {}),
      banner_blocks: s.banner, today_blocks: s.today, forecast_blocks: s.forecasts };
    const presses = { tap_action: 'toggle', hold_action: this.config.weather_path ? 'page' : 'popup' };
    const data = Object.fromEntries(Object.entries({ ...defaults, ...presses, ...blocks, ...this.config }).filter(([key]) => key !== 'type'));
    const one = this.entries?.length === 1 ? this.entries[0] : undefined;
    return html`
      ${this.entries === null ? html`<p class="note warn">L’intégration Niak Weather ne répond pas : la carte en a besoin depuis la version 2.0.
          Déjà téléchargée ? <a href="/config/integrations/dashboard/add?domain=niak_weather" @click=${this.follow}>Ajoutez-la</a>.
          Sinon, <a href="https://github.com/Niakman13/niak-weather-integration#installation" target="_blank" rel="noopener noreferrer">installez-la</a>.</p>`
        : this.entries?.length === 0 ? html`<p class="note warn">Ajoutez l’intégration Niak Weather : Paramètres → Appareils et services.</p>`
        : html`<p class="note">${one ? html`Lieu : <b>${one.title}</b>. ` : nothing}Les sources (prévisions, station, air et pollens) se règlent dans
          <a href=${SETTINGS} @click=${this.follow}>l’intégration Niak Weather</a>.</p>`}
      <ha-form .hass=${this.hass} .data=${data} .schema=${this.schema()} .computeLabel=${this.computeLabel} .computeHelper=${this.computeHelper} @value-changed=${this.changed}></ha-form>`;
  }
  /** A link inside Home Assistant opens there, without reloading the page. */
  private follow = (e: MouseEvent) => {
    e.preventDefault();
    history.pushState(null, '', (e.currentTarget as HTMLAnchorElement).getAttribute('href') ?? SETTINGS);
    window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));
  };
  static styles = css`
    .note { color:var(--secondary-text-color); font-size:13px; line-height:1.6; margin:0 0 16px; }
    .note.warn { color:var(--primary-text-color); }
    a { color:var(--primary-color); }
  `;
}
