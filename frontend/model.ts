// What the « Météo » tab receives from Niak Weather (panel.py, draft.py). Every text is already in French.
export interface Hass {callWS<T>(msg:Record<string,unknown>):Promise<T>;themes?:{darkMode?:boolean}}
export interface Entity {id:string;name:string;state:string;available:boolean;missing:boolean}
export interface Field {key:string;label:string;help:string;value:string;entity:Entity|null;need:string;options:Entity[];warning:string;better:Entity|null;recognized:string[]}
export interface Choice {value:string;label:string;hint?:string;available?:boolean}
// The technical state of a place (engine/health.py): orange (bad) stops something, tip could be better, none is not used.
export type Level='ok'|'bad'|'tip'|'none';
export interface Line {level:Level;text:string;why:string;stage:number|null}
export interface Health {title:string;level:'ok'|'action';summary:string;tips_summary:string;todo:Line[];tips:Line[];
 sources:{label:string;level:Level;text:string}[];sensors:{label:string;name:string;level:Level;text:string}[];entities:Line[];versions:Line[]}
export interface Place {entry_id:string;title:string;loaded:boolean;failed:boolean;health:Health}
export interface Places {places:Place[];can_add:boolean}
export interface Species extends Entity {label:string;chosen:boolean}
export interface EntityItem {key:string;name:string;hint:string;enabled:boolean;need:string;optional?:boolean}
export interface Family {key:string;name:string;hint?:string;chosen?:boolean;entities?:EntityItem[]}
export interface View {
 title:string;
 prevision:{fields:Field[];location:string;location_placeholder:string;advanced:Field[];forecast_source:string};
 station:{model:string;models:Choice[];device:string;devices:Choice[];profile:string;history:boolean;history_help:string;groups:{name:string;title:string;fields:Field[]}[]};
 air:{value:string;sources:Choice[];area:string;areas:Choice[]};
 pollen:{value:string;sources:Choice[];area:string;areas:Choice[];species:Species[];risk:Field|null};
 entities:{new:boolean;families:Family[]};
 summary:{weather:string;station:string;air:string;pollen:string};
 needs:string[];
}
export type Sources=Record<string,unknown>;
export interface DraftReply {draft:Sources;view:View;error:string}
export type Change={op:string;key?:string;value?:unknown;area?:string};

export const NONE='none';
export const stages=['Sources météo','Station météo / Capteurs locaux','Qualité de l’air','Pollens','Entités','Récapitulatif'];
// What each step is for, shown on top of it in a frame that folds: one idea per line.
export const intros:string[][]=[
 ['Les prévisions du lieu viennent d’un service météo installé dans Home Assistant, Météo-France par exemple.',
  'C’est la seule source obligatoire : sans elle, pas de carte.',
  'Niak Weather propose celle qu’il trouve ; vérifiez qu’elle correspond bien à votre lieu.'],
 ['Ce que vos propres capteurs mesurent chez vous : température, pluie, vent…',
  'Leurs mesures passent avant celles du service météo, plus loin de chez vous.',
  'Facultatif : sans station, la carte s’appuie sur les prévisions seules.'],
 ['L’indice de qualité de l’air du jour et ses polluants, pour votre zone.',
  'Une précaution régionale, pas une mesure à vos fenêtres.',
  'Choisissez la source, puis sa zone. Facultatif.'],
 ['Le niveau des pollens par espèce, pour anticiper les allergies.',
  'Choisissez la source, puis les espèces qui vous concernent. Facultatif.'],
 ['Les entités que Niak Weather crée dans Home Assistant, rangées par famille.',
  'Elles servent à vos automatisations et tableaux de bord ; la carte n’en a pas besoin.'],
 ['Tout ce que vous avez choisi, onglet par onglet.',
  'Rien ne change tant que vous n’avez pas enregistré ; un oubli, revenez à l’onglet voulu.'],
];

// The entities switched on, by key, as the « Entités » step shows them.
export function enabledKeys(view:View):string[]{
 return view.entities.new?[]:view.entities.families.flatMap(f=>(f.entities??[]).filter(e=>e.enabled).map(e=>e.key));
}
// Where a value came from, for an existing place: what Niak proposes differs from what was saved, and was not touched.
export function provenance(key:string,value:string,saved:Sources|undefined,touched:Set<string>):string{
 if(!saved||touched.has(key)||!value)return '';
 return (saved[key]??'')===value?'':'Proposé par Niak : vérifiez-le avant d’enregistrer.';
}
export function sameSet(a:string[],b:string[]){return a.length===b.length&&a.every(x=>b.includes(x));}
export function entityLine(e:Entity|null){
 if(!e)return '';
 if(e.missing)return `${e.id} · introuvable`;
 return e.state?`${e.state} · ${e.id}`:e.id;
}
// A field's choices: those recognised by name and measure first, when there are some among many.
export function grouped(f:Pick<Field,'options'|'recognized'>):{label:string;options:Entity[]}[]{
 const first=f.options.filter(o=>f.recognized.includes(o.id)),rest=f.options.filter(o=>!f.recognized.includes(o.id));
 return first.length&&rest.length?[{label:'Reconnus',options:first},{label:'Autres capteurs',options:rest}]:[{label:'',options:f.options}];
}
export function capital(text:string){return text.charAt(0).toUpperCase()+text.slice(1);}
