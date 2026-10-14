import { describe, expect, it } from 'vitest';
import { displayed } from '../src/display';
import type { AirPanel, WeatherView } from '../src/view';
import type { WeatherCardConfig } from '../src/types';

const reading = { entityId: 'sensor.air', label: 'Moyen', value: 2, color: '#50ccaa', zone: 'Gardanne', updated: '', stale: false };
const panel = (tomorrow: boolean): AirPanel => ({ kind: 'air', tomorrow, zone: 'Gardanne', primary: reading, details: [{ label: 'O₃', reading }], updated: '10/10 à 13 h', stale: false });
const view = {
  location: 'Gardanne', alerts: [{ level: 1, text: 'Vigilance jaune', icon: 'mdi:alert', source: 'x', official: true }],
  points: [{ group: 'now', label: 'Maintenant', icon: 'mdi:x', text: 'Il pleut', level: 1 }],
  brief: { title: 'Pluie', label: 'À surveiller', color: '', icon: '', summary: '', signals: [], caveats: [], available: true, severity: 1 },
  bulletin: { summary: 'Pluie ce soir.', periods: [] }, air: { today: [panel(false)], tomorrow: [panel(true)] },
} as unknown as WeatherView;
const config = (extra: Partial<WeatherCardConfig> = {}): WeatherCardConfig => ({ type: 'custom:niak-weather-card', ...extra });

describe('What the card shows of the integration’s view', () => {
  it('shows everything by default', () => {
    expect(displayed(view, config(), false)).toEqual(view);
  });
  it('switches the synthesis off with its bubbles on the full card, never on the tile', () => {
    for (const off of [{ smart_brief: false }, { show_synthesis: false }]) {
      const v = displayed(view, config(off), false);
      expect([v.brief, v.alerts, v.points]).toEqual([undefined, [], []]);
      expect(displayed(view, config(off), true).points).toEqual(view.points);
    }
  });
  it('hides the bulletin, tomorrow’s air and the air details on request, keeping the rest', () => {
    const v = displayed(view, config({ show_bulletin: false, show_atmo_tomorrow: false, show_atmo_details: false }), false);
    expect(v.bulletin).toBeUndefined();
    expect(v.air.tomorrow).toEqual([]);
    // No « Détail » fold at all: neither the list nor the publication date it holds.
    expect(v.air.today[0]).toMatchObject({ primary: reading, details: [], updated: '' });
    expect(v.location).toBe('Gardanne');
  });
});
