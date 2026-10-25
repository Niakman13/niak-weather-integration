// The time in the banner: it moves on by itself on each new minute, without redrawing the card.
import { css, html, LitElement } from 'lit';
import { state } from 'lit/decorators.js';
import { define } from './define';
import { dateFormat } from '../intl-cache';
import { currentLocale } from '../i18n';

@define('niak-clock')
export class NiakClock extends LitElement {
  @state() private now = new Date();
  private timer?: ReturnType<typeof setTimeout>;

  public connectedCallback(): void { super.connectedCallback(); this.tick(); }
  public disconnectedCallback(): void { super.disconnectedCallback(); clearTimeout(this.timer); }

  /** Waits for the next minute, not a whole minute: the clock never lags behind the device's. */
  private tick = () => {
    this.now = new Date();
    clearTimeout(this.timer);
    this.timer = setTimeout(this.tick, 60_000 - this.now.getSeconds() * 1000 - this.now.getMilliseconds() + 50);
  };

  protected render() {
    return html`<time datetime=${this.now.toISOString()}>${dateFormat(currentLocale(), { hour: '2-digit', minute: '2-digit' }).format(this.now)}</time>`;
  }

  static styles = css`
    :host { display:block; font-variant-numeric:tabular-nums; line-height:1; }
    time { font:inherit; }
  `;
}

declare global { interface HTMLElementTagNameMap { 'niak-clock': NiakClock } }
