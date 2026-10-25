// @ts-ignore Node's types are not installed here: the test runs under Node.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { EN } from '../src/i18n/en';
import { hourText, setLanguage, t } from '../src/i18n';
import { rose } from '../src/ui/parts';

/** Every French text the card shows: the literals given to t() and fr(), the ternaries' both sides included. */
function frenchTexts(source: string): string[] {
  const found: string[] = [];
  const call = /\b(?:t|fr)\(/g;
  for (let m = call.exec(source); m; m = call.exec(source)) {
    // The first argument, up to its comma or its closing parenthesis: every string literal in it.
    let depth = 0, i = m.index + m[0].length;
    for (; i < source.length; i++) {
      const c = source[i];
      if (c === "'" || c === '"') {
        let j = i + 1, text = '';
        while (source[j] !== c) { if (source[j] === '\\') j++; text += source[j++]; }
        found.push(text); i = j;
      } else if (c === '`') break;
      else if ('([{'.includes(c)) depth++;
      else if (')]}'.includes(c)) { if (!depth--) break; }
      else if (c === ',' && !depth) break;
    }
  }
  return found;
}
const files = (dir: string): string[] => (readdirSync(dir) as string[]).flatMap(f => statSync(`${dir}/${f}`).isDirectory() ? files(`${dir}/${f}`) : f.endsWith('.ts') ? [`${dir}/${f}`] : []);
const sources = files(new URL('../src', import.meta.url).pathname.replace(/%20/g, ' ')).filter(f => !f.includes('/i18n/'));
const texts = new Set(sources.flatMap(f => frenchTexts(readFileSync(f, 'utf8') as string)).filter(Boolean));

describe('The card in English', () => {
  afterEach(() => setLanguage('fr'));
  it('finds the texts in t() and fr()', () => {
    expect(frenchTexts("t(a ? 'Oui' : 'Non', { x: 'pas ça' }) + fr('Bonjour')")).toEqual(['Oui', 'Non', 'Bonjour']);
    expect(texts.size).toBeGreaterThan(150);
  });
  it('has an English text for every French one', () => {
    expect([...texts].filter(text => !(text in EN))).toEqual([]);
  });
  it('keeps no English text the card no longer shows', () => {
    expect(Object.keys(EN).filter(text => !texts.has(text))).toEqual([]);
  });
  it('keeps the same {names} in both languages', () => {
    const names = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
    expect(Object.entries(EN).filter(([french, english]) => names(french).join() !== names(english).join()).map(([french]) => french)).toEqual([]);
  });
  it('follows Home Assistant: French in French, English in any other language', () => {
    expect(t('Pluie')).toBe('Pluie');
    setLanguage('en'); expect(t('Pluie')).toBe('Rain');
    setLanguage('nl'); expect(t('Niveau {value} sur {scale}', { value: 2, scale: 6 })).toBe('Level 2 of 6');
    setLanguage('fr-CA'); expect(t('Pluie')).toBe('Pluie');
  });
  it('writes hours and the compass the English way', () => {
    expect([hourText(0), hourText(12), hourText(9), rose(225)]).toEqual(['minuit', 'midi', '9 h', 'SO']);
    setLanguage('en');
    expect([hourText(0), hourText(12), hourText(9), rose(225), rose(270)]).toEqual(['midnight', 'noon', '09:00', 'SW', 'W']);
  });
});
