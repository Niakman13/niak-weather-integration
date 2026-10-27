import { describe, expect, it } from 'vitest';
import { cardBlocks, cleanConfig } from '../src/config';
import type { WeatherCardConfig } from '../src/types';

const base: WeatherCardConfig = { type:'custom:niak-weather-card',weather_entity:'weather.city' };
describe('Legacy display migration',()=>{
  it('removes compact and preserves hidden forecasts without mutating input',()=>{
    const legacy={...base,mode:'compact'};
    const next=cleanConfig(legacy);
    expect(next).toEqual({...base,show_predictions:false});
    expect(legacy.mode).toBe('compact');
    expect(cleanConfig(next)).toEqual(next);
  });
  it.each([true,false])('preserves explicit forecast choice %s',show_predictions=>{
    expect(cleanConfig({...base,mode:'compact',show_predictions} as WeatherCardConfig)).toEqual({...base,show_predictions});
  });
  it('removes detailed without introducing section restrictions',()=>{
    expect(cleanConfig({...base,mode:'detailed'} as WeatherCardConfig)).toEqual(base);
  });
  it('does not add a mode to new configurations',()=>{
    expect(cleanConfig(base)).toEqual(base);
  });
});

describe('The cards on their own', () => {
  const card = (extra: Partial<WeatherCardConfig>) => ({ type: 'custom:niak-weather-card', ...extra }) as WeatherCardConfig;
  it('show everything their format has until parts are chosen', () => {
    expect(cardBlocks(card({ format: 'wind' }))).toEqual(['now', 'chart', 'stats']);
    expect(cardBlocks(card({ format: 'air' }))).toEqual(['air_today', 'pollen_today', 'air_tomorrow', 'pollen_tomorrow']);
    expect(cardBlocks(card({ format: 'full' }))).toEqual([]);
  });
  it('keep the chosen parts in their order, and only those of their format', () => {
    expect(cardBlocks(card({ format: 'air', card_blocks: ['pollen_tomorrow', 'air_today'] }))).toEqual(['pollen_tomorrow', 'air_today']);
    expect(cardBlocks(card({ format: 'pressure', card_blocks: ['chart', 'ahead'] }))).toEqual(['chart']);
  });
  it('start over with everything when the parts belong to another format, and show nothing when all are unticked', () => {
    expect(cardBlocks(card({ format: 'pressure', card_blocks: ['ahead', 'feel'] }))).toEqual(['now', 'chart', 'stats']);
    expect(cardBlocks(card({ format: 'rain', card_blocks: [] }))).toEqual([]);
  });
});
