import type { BannerBlock, ForecastBlock, TodayBlock, WeatherCardConfig } from './types';

export interface Sections { hero: boolean; banner: BannerBlock[]; today: TodayBlock[]; forecasts: ForecastBlock[] }
/** What each section of the full card shows: its list when set, otherwise what the older switches showed. */
export function sections(c: WeatherCardConfig): Sections {
  return {
    // The banner and its animated sky always stay; only an older card that switched it off keeps it hidden.
    hero: c.banner_blocks !== undefined || c.show_synthesis !== false,
    banner: c.banner_blocks ?? (c.show_synthesis === false ? [] : [...(c.show_bulletin === false ? [] : ['bulletin' as const]), 'events']),
    today: c.today_blocks ?? (c.show_today === false ? [] : ['comfort', 'rain', 'wind', 'pressure', 'extras', 'air']),
    forecasts: c.forecast_blocks ?? (c.show_predictions === false ? [] : ['hours', 'days', ...(c.show_atmo_tomorrow === false ? [] : ['air' as const])]),
  };
}

/** Remove obsolete options while preserving explicit section choices. */
export function cleanConfig(config: WeatherCardConfig): WeatherCardConfig {
  const copy = { ...config } as WeatherCardConfig & {
    mode?: string; lightning_distance_entity?: string; comfort_entity?: string;
    air_quality_entity?: string; model_entity?: string; forecast_entity?: string; air_path?: string;
  } & Record<string, unknown>;
  if (copy.mode === 'compact' && copy.show_predictions === undefined) copy.show_predictions = false;
  delete copy.mode;
  // The mixed list of the betas 3 and 4 becomes the three sections.
  const mixed = copy.full_blocks as string[] | undefined;
  if (Array.isArray(mixed)) {
    const banner = ['bulletin', 'events', 'moments', 'forecast'], air = mixed.includes('air');
    copy.banner_blocks ??= mixed.filter(b => banner.includes(b)) as BannerBlock[];
    copy.today_blocks ??= mixed.includes('today') ? ['comfort', 'rain', 'wind', 'pressure', 'extras', ...(air ? ['air' as const] : [])] : [];
    copy.forecast_blocks ??= mixed.includes('predictions') ? ['hours', 'days', ...(air ? ['air' as const] : [])] : [];
  }
  delete copy.full_blocks; delete copy.air_blocks;
  delete copy.lightning_distance_entity; delete copy.comfort_entity;
  delete copy.air_quality_entity; delete copy.model_entity; delete copy.forecast_entity; delete copy.air_path;
  // Thermal Comfort is no longer needed: humidex, dew and frost points are computed by the card.
  for (const key of ['humidex_entity', 'humidex_perception_entity', 'thermal_dew_point_entity', 'heat_index_entity', 'absolute_humidity_entity', 'thermal_perception_entity', 'thermal_device_id']) delete copy[key];
  return copy;
}
