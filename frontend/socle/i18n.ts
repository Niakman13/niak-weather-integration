// The hub's words follow Home Assistant's language (socle 1.13). French is the source: each text is written in French in
// the code, and `t()` gives it in the user's language from that language's dictionary, French when it lacks one.
// Each brick adds its own dictionary (addDictionary) to the hub's; any language without one reads English.
import {SOCLE_EN} from './i18n-en';

const DICTIONARIES:Record<string,Record<string,string>>={en:{...SOCLE_EN}};
let language='fr';

/** A brick's words for a language, beside the hub's. */
export function addDictionary(lang:string,words:Record<string,string>){DICTIONARIES[lang]={...DICTIONARIES[lang],...words};}
/** Home Assistant's language (hass.language); true when it changed. */
export function setLanguage(lang?:string|null):boolean{
 const code=(lang??'').toLowerCase().split('-')[0];
 const next=code==='fr'||!code?'fr':DICTIONARIES[code]?code:'en';
 const changed=next!==language;language=next;return changed;
}
export const currentLanguage=()=>language;
/** The locale numbers and dates are written in. */
export const currentLocale=()=>language==='fr'?'fr-FR':language;
/** A French text in the user's language; `{name}` takes the value of `vars.name`. */
export function t(french:string,vars?:Record<string,string|number>):string{
 const text=language==='fr'?french:DICTIONARIES[language]?.[french]??french;
 return vars?text.replace(/\{(\w+)\}/g,(all,name:string)=>name in vars?String(vars[name]):all):text;
}
/** Marks a French text kept in a list and translated where it is shown: the dictionary test finds it there too. */
export const fr=(text:string)=>text;
