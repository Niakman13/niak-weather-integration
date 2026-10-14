// « Prévisions »: the next 18 hours as a curve, the next 7 days as a table.
import { css, html, nothing, svg, type TemplateResult } from 'lit';
import type { DayForecast, Slot, WeatherView } from '../view';
import { label, legend, nf, panelHead, rose, tempColor, windArrow } from '../ui/parts';

export function hoursChart(hours: Slot[], source: string, entity: string, uid: string): TemplateResult | typeof nothing {
  const points = hours.map((h, i) => ({ h, i })).filter(p => p.h.temperature !== undefined);
  if (points.length < 3) return nothing;
  const n = hours.length, step = 100 / (n - 1), X = (i: number) => i * step;
  const temps = points.map(p => p.h.temperature!), lo = Math.min(...temps) - 1.5, hi = Math.max(...temps) + 1.5;
  const Y = (t: number) => (1 - (t - lo) / (hi - lo)) * 78 + 8; // % of the height, room above and below for the pills
  const xy = points.map(p => [X(p.i), Y(p.h.temperature!)] as const);
  const line = xy.map(([x, y], i) => i ? `C${xy[i - 1][0] + (x - xy[i - 1][0]) / 2} ${xy[i - 1][1]} ${xy[i - 1][0] + (x - xy[i - 1][0]) / 2} ${y} ${x} ${y}` : `M${x} ${y}`).join(' ');
  const max = points.reduce((a, b) => b.h.temperature! > a.h.temperature! ? b : a), min = points.reduce((a, b) => b.h.temperature! < a.h.temperature! ? b : a);
  const peak = Math.max(2, ...hours.map(h => h.precipitation)), rain = hours.some(h => h.precipitation >= .1), wind = hours.some(h => h.wind !== undefined);
  const nights: Array<[number, number]> = [];
  hours.forEach((h, i) => { if (!h.night) return; const last = nights.at(-1); if (last && last[1] === i - 1) last[1] = i; else nights.push([i, i]); });
  const midnight = hours.findIndex((h, i) => i > 0 && h.day > hours[i - 1].day);
  const ticks = [1, 4, 7, 10, 13, 16].filter(i => i < n && hours[i].temperature !== undefined);
  const pill = (p: { h: Slot; i: number }) => { const y = Y(p.h.temperature!);
    return html`<span class=${`pill${y < 30 ? ' low' : ''}`} style=${`left:${Math.min(94, Math.max(6, X(p.i)))}%;top:${y}%`}>${nf(p.h.temperature!, 0)}°</span>`; };
  // Unique names: a gradient must never be looked up in another copy of the chart.
  const stroke = `${uid}-fs`, fill = `${uid}-fa`;
  return html`<section class="nw-panel" aria-label="18 prochaines heures">${panelHead('mdi:chart-bell-curve-cumulative', 'wind', '18 prochaines heures', source)}
    <div class="fc" data-entity=${entity}>
      <div class="fc-marks">${midnight < 0 || X(midnight) > 22 ? html`<span style="left:0">Maintenant</span>` : nothing}${midnight > 0 ? html`<span class="next" style=${`left:${X(midnight)}%`}>Demain</span>` : nothing}</div>
      <div class="fc-plot" role="img" aria-label=${`Températures de ${nf(min.h.temperature!, 0)} à ${nf(max.h.temperature!, 0)} °C${rain ? `, pluie jusqu’à ${nf(Math.max(...hours.map(h => h.precipitation)))} mm par heure` : ', pas de pluie prévue'}`}>
        ${nights.map(([a, b]) => { const left = Math.max(0, X(a) - step / 2), right = Math.min(100, X(b) + step / 2);
          return html`<i class="fc-night" style=${`left:${left}%;width:${right - left}%`}></i>`; })}
        ${midnight > 0 ? html`<i class="fc-divider" style=${`left:${X(midnight)}%`}></i>` : nothing}
        ${hours.map((h, i) => h.precipitation >= .1 ? html`<i class="fc-bar" title=${`${h.hour} h : ${nf(h.precipitation)} mm`} style=${`left:calc(${X(i)}% - 5px);height:${Math.max(6, h.precipitation / peak * 42)}%`}></i>` : nothing)}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs>
          <linearGradient id=${stroke} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--nw-heat)"/><stop offset="1" stop-color="var(--nw-cold)"/></linearGradient>
          <linearGradient id=${fill} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--nw-heat)" stop-opacity=".28"/><stop offset="1" stop-color="var(--nw-cold)" stop-opacity="0"/></linearGradient></defs>
          ${svg`<path d=${`${line} L${xy.at(-1)![0]} 100 L${xy[0][0]} 100Z`} fill=${`url(#${fill})`}/><path class="fc-line" d=${line} stroke=${`url(#${stroke})`}/>`}</svg>
        <i class="fc-dot" style=${`left:${xy[0][0]}%;top:${xy[0][1]}%;--c:${tempColor(points[0].h.temperature!)}`}></i>
        ${pill(max)}${min.i !== max.i && nf(min.h.temperature!, 0) !== nf(max.h.temperature!, 0) ? pill(min) : nothing}
      </div>
      <div class="fc-hours">${ticks.map(i => { const h = hours[i];
        return html`<div style=${`left:${X(i)}%`} title=${h.conditionLabel}>${label(`${h.hour} h`)}<ha-icon icon=${h.icon}></ha-icon><b>${nf(h.temperature!, 0)}°</b>
          ${h.wind === undefined ? nothing : html`<span class="fc-wind" title=${`Vent ${h.bearing === undefined ? '' : `du ${rose(h.bearing)} `}${nf(h.wind, 0)} km/h${h.gust !== undefined && h.gust > h.wind ? `, rafales ${nf(h.gust, 0)} km/h` : ''}`}>${h.bearing === undefined ? nothing : windArrow(h.bearing)}${nf(h.wind, 0)}</span>`}</div>`; })}</div>
    </div>
    <div class="nw-legend">${legend('Température', 'linear-gradient(90deg,var(--nw-cold),var(--nw-heat))')}${rain ? legend('Pluie', 'var(--nw-rain)', 'sq') : nothing}
      ${nights.length ? legend('Nuit', 'color-mix(in oklab,var(--nw-wind) 30%,transparent)', 'sq') : nothing}${wind ? html`<span>${windArrow(200)}Vent km/h</span>` : nothing}</div>
  </section>`;
}

export function week(days: DayForecast[], source: string, entity: string): TemplateResult | typeof nothing {
  if (!days.length) return nothing;
  const lows = days.flatMap(d => d.low ?? d.high ?? []), highs = days.flatMap(d => d.high ?? d.low ?? []);
  const lo = Math.min(...lows), hi = Math.max(...highs, lo + 1), P = (t: number) => (t - lo) / (hi - lo) * 100;
  return html`<section class="nw-panel" aria-label="7 prochains jours">${panelHead('mdi:calendar-week', 'wind', `${days.length} prochains jours`, source)}
    <div class="wk" data-entity=${entity} role="group" aria-label="Températures minimales et maximales en °C, pluie en mm, vent maximal en km/h">
      <span></span><span></span>${label('Min')}<span></span>${label('Max')}${label('Pluie')}${label('Vent')}
      ${days.map((d, i) => html`${i ? html`<i class="rule"></i>` : nothing}<span class=${`day${d.today ? ' today' : ''}`}>${d.label}</span>
        <ha-icon icon=${d.icon} title=${d.conditionLabel}></ha-icon>
        <span class="lo">${d.low === undefined ? '' : `${d.low}°`}</span>
        <span class="track">${d.low !== undefined && d.high !== undefined ? html`<i style=${`left:${P(d.low)}%;width:${Math.max(2, P(d.high) - P(d.low))}%;background:linear-gradient(90deg,${tempColor(d.low)},${tempColor(d.high)})`}></i>` : nothing}</span>
        <span class="hi">${d.high === undefined ? '—' : `${d.high}°`}</span>
        <span class="rain">${d.rain >= .1 ? `${nf(d.rain)} mm` : ''}</span>
        <span class="wind" title=${d.wind === undefined ? '' : `Vent ${d.bearing === undefined ? '' : `du ${rose(d.bearing)} `}jusqu’à ${d.wind} km/h${d.gust !== undefined && d.gust > d.wind ? `, rafales ${d.gust} km/h` : ''}`}>${d.wind === undefined ? '' : html`${d.bearing === undefined ? nothing : windArrow(d.bearing)}${d.wind}`}</span>`)}
    </div>
  </section>`;
}

export function renderForecasts(v: WeatherView, entity: string, uid: string, air: TemplateResult | typeof nothing,
                                blocks: Array<'hours' | 'days' | 'air'> = ['hours', 'days', 'air']): TemplateResult {
  // The curve and the table chosen, in their order; tomorrow's air and pollens under them when chosen.
  const panels = blocks.map(b => b === 'hours' ? hoursChart(v.hours, v.provider, entity, uid) : b === 'days' ? week(v.days, v.provider, entity) : nothing)
    .filter(p => p !== nothing);
  const wanted = blocks.some(b => b !== 'air');
  return html`${panels.length ? html`<div class=${`panels${panels.length === 1 ? ' single' : ''}`}>${panels}</div>`
    : wanted ? html`<p class="nw-empty">Prévisions indisponibles pour le moment.</p>` : nothing}${blocks.includes('air') ? air : nothing}`;
}

export const forecastStyles = css`
  .panels { display:grid; grid-template-columns:minmax(0,1.35fr) minmax(0,1fr); gap:16px; align-items:stretch; }
  .panels.single { grid-template-columns:minmax(0,1fr); }
  @container (max-width:980px) { .panels { grid-template-columns:minmax(0,1fr); } }
  /* 18 hours */
  .fc { display:grid; grid-template-rows:auto 168px auto; gap:6px; cursor:pointer; }
  .fc-marks { position:relative; height:14px; }
  .fc-marks span { position:absolute; top:0; font-size:var(--nw-fs-label); line-height:13px; font-weight:700; letter-spacing:var(--nw-label-spacing); text-transform:uppercase; color:var(--nw-fg2); white-space:nowrap; }
  .fc-marks .next { transform:translateX(-50%); }
  .fc-plot { position:relative; border-radius:12px; background:linear-gradient(color-mix(in oklab, var(--nw-line) 40%, transparent) 1px, transparent 1px) 0 0/100% 42px; }
  .fc-night { position:absolute; top:0; bottom:0; background:color-mix(in oklab, var(--nw-wind) 14%, transparent); }
  .fc-plot svg { position:absolute; inset:0; width:100%; height:100%; overflow:visible; }
  .fc-line { fill:none; stroke-width:3; stroke-linecap:round; stroke-linejoin:round; vector-effect:non-scaling-stroke; }
  .fc-bar { position:absolute; bottom:0; width:10px; border-radius:6px 6px 2px 2px; background:color-mix(in oklab, var(--nw-rain) 75%, transparent); }
  .fc-divider { position:absolute; top:0; bottom:0; width:0; border-left:1px dashed color-mix(in oklab, var(--nw-fg2) 55%, transparent); }
  .fc-dot { position:absolute; width:10px; height:10px; margin:-5px 0 0 -5px; border-radius:50%; background:var(--nw-bg); border:3px solid var(--c); }
  /* Each hour sits exactly under its point of the curve. */
  .fc-hours { position:relative; height:78px; }
  .fc-hours > div { position:absolute; top:0; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:3px; }
  .fc-hours ha-icon { --mdc-icon-size:20px; }
  .fc-hours b { font-size:var(--nw-fs-text); font-weight:700; }
  .fc-wind { display:inline-flex; align-items:center; gap:3px; font-size:var(--nw-fs-small); color:var(--nw-fg2); white-space:nowrap; }
  .fc-wind svg, .wk .wind svg { width:10px; height:10px; fill:color-mix(in oklab, var(--nw-wind) 70%, var(--nw-fg)); }
  /* 7 days */
  .wk { display:grid; grid-template-columns:auto auto auto minmax(40px,1fr) auto auto auto; align-items:center; column-gap:12px; row-gap:2px; cursor:pointer; }
  .wk > .nw-label { padding-bottom:4px; }
  .wk > .nw-label:nth-child(3), .wk > .nw-label:nth-child(6), .wk > .nw-label:nth-child(7) { text-align:right; }
  .wk .day { font-size:var(--nw-fs-text); font-weight:700; padding:7px 0; }
  .wk .day.today { color:color-mix(in oklab, var(--nw-wind) var(--nw-ink), var(--nw-fg)); }
  .wk ha-icon { --mdc-icon-size:20px; color:var(--nw-fg2); }
  .wk .lo, .wk .hi { font-size:var(--nw-fs-text); font-variant-numeric:tabular-nums; }
  .wk .lo { color:var(--nw-fg2); text-align:right; } .wk .hi { font-weight:700; }
  .wk .track { position:relative; height:6px; border-radius:3px; background:color-mix(in oklab, var(--nw-line) 70%, transparent); }
  .wk .track i { position:absolute; top:0; bottom:0; border-radius:3px; }
  .wk .rain { white-space:nowrap; font-size:var(--nw-fs-small); font-weight:600; color:color-mix(in oklab, var(--nw-rain) var(--nw-ink), var(--nw-fg)); text-align:right; min-width:42px; }
  .wk .wind { display:inline-flex; align-items:center; justify-content:flex-end; gap:3px; white-space:nowrap; font-size:var(--nw-fs-small); color:var(--nw-fg2); min-width:30px; }
  .wk .rule { grid-column:1/-1; height:1px; background:var(--nw-line-soft); }
  @container (max-width:380px) { .wk { column-gap:7px; } .wk .rain { min-width:34px; } }
`;
