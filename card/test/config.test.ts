import { describe, expect, it } from 'vitest';
import { cleanConfig } from '../src/config';
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
