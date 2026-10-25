import type { AirPanel, PressurePeriodId, PressureView, WeatherView } from './view';
import type { WeatherCardConfig } from './types';

/** The view as this card shows it: the integration computes everything, the card's display settings leave out what they hide. */
/** The pressure over the chosen period, when the integration sends it; six hours otherwise. */
function pressureOver(p: PressureView, period: PressurePeriodId): PressureView {
  const chosen = p.periods?.find(x => x.period === period);
  return chosen ? { ...p, period, series: chosen.series, low: chosen.low, top: chosen.top, stats: chosen.stats } : { ...p, period: '6h' };
}

export function displayed(v: WeatherView, config: WeatherCardConfig, tile: boolean): WeatherView {
  // The tile is the brief: it always shows it. On the full card the synthesis can be switched off, its bubbles with it.
  // A full card whose blocks are chosen keeps everything: its blocks decide what shows (the timeline only with « events »).
  const chosen = !tile && !!config.banner_blocks;
  const brief = tile || chosen || (config.smart_brief !== false && config.show_synthesis !== false);
  // Without details, the whole « Détail » fold goes: its list and the publication date it also holds.
  const details = (panels: AirPanel[]) => config.show_atmo_details === false ? panels.map(p => ({ ...p, details: [], updated: '' })) : panels;
  return {
    ...v,
    brief: brief ? v.brief : undefined, alerts: brief ? v.alerts : [], points: brief ? v.points : [], timeline: brief ? v.timeline : [],
    // A tile whose blocks are chosen keeps the bulletin: its moments come from it.
    bulletin: config.show_bulletin === false && !(tile && config.tile_blocks?.length) && !chosen ? undefined : v.bulletin,
    pressure: v.pressure && pressureOver(v.pressure, config.pressure_span ?? '6h'),
    air: { today: details(v.air.today), tomorrow: config.show_atmo_tomorrow === false && !config.forecast_blocks ? [] : details(v.air.tomorrow) },
  };
}
