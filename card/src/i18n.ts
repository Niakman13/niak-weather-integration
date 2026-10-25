// The card's words follow Home Assistant's language. French is the source: each text is written in French in the code,
// and `t()` gives it in the user's language from that language's dictionary, French when the dictionary lacks it.
// Another language: add its dictionary (same keys as en.ts) to DICTIONARIES.
import { EN } from './i18n/en';

const DICTIONARIES: Record<string, Record<string, string>> = { en: EN };

let language = 'fr', locale = 'fr-FR';

/** Picks the words and the number format of Home Assistant's language; true when it changed. Any language but French reads English until it has its own dictionary. */
export function setLanguage(lang?: string, numbers?: string): boolean {
  const code = (lang ?? '').toLowerCase().split('-')[0];
  const next = code === 'fr' ? 'fr' : DICTIONARIES[code] ? code : 'en';
  const nextLocale = next === 'fr' ? 'fr-FR' : numbers || lang || 'en';
  const changed = next !== language || nextLocale !== locale;
  language = next; locale = nextLocale;
  return changed;
}

/** Before the card gets Home Assistant (the « Add card » list is written at load): the language the page was opened in. */
export function guessLanguage(): void {
  let lang: string | undefined;
  try { lang = (document.querySelector('home-assistant') as unknown as { hass?: { language?: string } } | null)?.hass?.language; } catch { /* not in Home Assistant */ }
  try { lang ??= JSON.parse(localStorage.getItem('selectedLanguage') ?? 'null') ?? undefined; } catch { /* private browsing */ }
  setLanguage(lang || document.documentElement.lang || navigator.language);
}

/** The language in use (« fr », « en »…), and the locale numbers and times are written in. */
export const currentLanguage = () => language;
export const currentLocale = () => locale;

/** A French text in the user's language; `{name}` takes the value of `vars.name`. */
export function t(french: string, vars?: Record<string, string | number>): string {
  const text = language === 'fr' ? french : DICTIONARIES[language]?.[french] ?? french;
  return vars ? text.replace(/\{(\w+)\}/g, (all, name: string) => name in vars ? String(vars[name]) : all) : text;
}

/** The hour on a scale: « 14 h » in French, « 14:00 » elsewhere. */
export const hourMark = (h: number) => language === 'fr' ? `${h} h` : `${String(h).padStart(2, '0')}:00`;

/** An hour of the day in a sentence: « minuit », « midi », « 14 h » in French; « midnight », « noon », « 14:00 » in English. */
export const hourText = (h: number) => h === 0 ? t('minuit') : h === 12 ? t('midi') : hourMark(h);

/** « Pluie : 2 mm » in French, « Rain: 2 mm » in English. */
export const colon = (label: string, text: string) => t('{label} : {text}', { label, text });

/** Marks a French text kept in a list and translated where it is shown, with t(): the dictionary test finds it there too. */
export const fr = (text: string) => text;
