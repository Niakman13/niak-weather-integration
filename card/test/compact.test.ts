import { describe, expect, it } from 'vitest';
import { alertItems, rainAhead } from '../src/views/compact';
import { airPanels } from '../src/views/single';
import { displayed } from '../src/display';
import type { AlertPoint, Slot, TickerPoint, WeatherView } from '../src/view';
import type { WeatherCardConfig } from '../src/types';

const slot = (hour: number, precipitation: number): Slot => ({ hour, day: 0, precipitation, condition: 'cloudy', conditionLabel: 'Couvert', icon: 'mdi:x', night: false });
const view = (extra: Partial<WeatherView>): WeatherView => ({ hours: [], days: [], alerts: [], points: [], ...extra }) as unknown as WeatherView;
const point = (level: number, group = 'future'): TickerPoint => ({ group, label: 'À venir', icon: 'mdi:x', text: `niveau ${level}`, level });
const vigilance: AlertPoint = { level: 2, label: 'Vigilance orange', text: 'Orages', icon: 'mdi:x', source: '', official: true };

describe('The rain card', () => {
  it('adds the rain of the next hour and of the next six, and says when the first rain starts', () => {
    const v = view({ hours: [slot(14, 0), slot(15, 0), slot(16, 2.4), slot(17, 9), slot(18, 1.5), slot(19, 0), slot(20, 4)] });
    expect(rainAhead(v)).toEqual({ hour: 0, six: 12.9, next: '16 h' });
  });
  it('writes noon and midnight in words, and knows when no rain is forecast', () => {
    expect(rainAhead(view({ hours: [slot(23, 0), slot(0, .5)] })).next).toBe('minuit');
    expect(rainAhead(view({ hours: [slot(11, 0), slot(12, 1)] })).next).toBe('midi');
    expect(rainAhead(view({ hours: [slot(11, 0), slot(12, .1)] })).next).toBeUndefined();
  });
});

describe('The alert card', () => {
  it('shows the vigilances and alerts, and only the serious points of the coming hours', () => {
    const v = view({ alerts: [vigilance], points: [point(1), point(2), point(3, 'official')] });
    expect(alertItems(v)).toEqual({ alerts: [vigilance], points: [point(2)] });
  });
  it('has nothing to show when all is calm', () => {
    const { alerts, points } = alertItems(view({ points: [point(0), point(1)] }));
    expect(alerts.length + points.length).toBe(0);
  });
});

describe('The tile’s blocks', () => {
  const bulletin = { summary: 'Ce soir, pluie.', periods: [] };
  const config = (extra: Partial<WeatherCardConfig>) => ({ type: 'custom:hestia-weather-card', ...extra }) as WeatherCardConfig;
  it('keeps the bulletin for a tile whose blocks are chosen: the moments come from it', () => {
    const v = view({ bulletin, air: { today: [], tomorrow: [] } } as Partial<WeatherView>);
    expect(displayed(v, config({ format: 'tile', show_bulletin: false, tile_blocks: ['moments'] }), true).bulletin).toEqual(bulletin);
    expect(displayed(v, config({ format: 'tile', show_bulletin: false }), true).bulletin).toBeUndefined();
  });
});

describe('The air and pollen card', () => {
  const panel = (kind: 'air' | 'pollen', tomorrow: boolean) => ({ kind, tomorrow, zone: '', details: [], updated: '', stale: false });
  it('shows the panels chosen, in their order, and skips those the sources do not give', () => {
    const v = view({ air: { today: [panel('air', false), panel('pollen', false)], tomorrow: [panel('air', true)] } } as Partial<WeatherView>);
    expect(airPanels(v, ['pollen_today', 'air_tomorrow', 'pollen_tomorrow'])).toEqual([panel('pollen', false), panel('air', true)]);
  });
});
