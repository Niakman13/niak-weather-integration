// What the « Météo » tab receives from Niak Weather (panel.py, draft.py). Every text is already in French.
export interface Hass {callWS<T>(msg:Record<string,unknown>):Promise<T>;themes?:{darkMode?:boolean}}
export interface Entity {id:string;name:string;state:string;available:boolean;missing:boolean}
export interface Field {key:string;label:string;help:string;value:string;entity:Entity|null;need:string;options:Entity[];warning:string;better:Entity|null;recognized:string[]}
export interface Choice {value:string;label:string;hint?:string;available?:boolean}
export interface Row {key:string;title:string;text:string;stage:number;todo:string[]}
export interface Brick {domain:string;name:string;takes:string;url:string;state:'linked'|'installed'|'missing'|'future'}
export interface Place {entry_id:string;title:string;loaded:boolean;failed:boolean;rows:Row[];ecosystem:{text:string;bricks:Brick[]}}
export interface Places {places:Place[];can_add:boolean}
export interface Species extends Entity {label:string;chosen:boolean}
export interface EntityItem {key:string;name:string;hint:string;enabled:boolean;need:string}
export interface Family {key:string;name:string;hint?:string;chosen?:boolean;entities?:EntityItem[]}
export interface View {
 title:string;
 prevision:{fields:Field[];location:string;location_placeholder:string;advanced:Field[];forecast_source:string};
 station:{model:string;models:Choice[];device:string;devices:Choice[];profile:string;history:boolean;history_help:string;groups:{name:string;title:string;fields:Field[]}[]};
 air:{value:string;areas:Choice[]};
 pollen:{value:string;sources:Choice[];area:string;areas:Choice[];species:Species[];risk:Field|null};
 entities:{new:boolean;families:Family[]};
 summary:{weather:string;station:string;air:string;pollen:string};
 needs:string[];
}
export type Sources=Record<string,unknown>;
export interface DraftReply {draft:Sources;view:View;error:string}
export type Change={op:string;key?:string;value?:unknown;area?:string};

export const NONE='none';
export const stages=['Prévisions','Station','Air','Pollens','Capteurs','Récapitulatif'];
export const brickState:Record<Brick['state'],string>={linked:'relié à ce lieu',installed:'installé, pas relié à ce lieu',missing:'non installé',future:'à venir'};

// The entities switched on, by key, as the « Capteurs » step shows them.
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
