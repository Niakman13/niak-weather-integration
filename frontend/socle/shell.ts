// Niak shared panel (socle v1.1): header, tabs and the home page listing every Niak brick.
// Copied unchanged into each brick from niak-ecosysteme/socle/ (see ECOSYSTEME.md § 8).
import {LitElement,html,css,nothing,type PropertyValues} from 'lit';

export const ELEMENT='niak-socle-1-3';
type Level='ok'|'action'|'unknown';
export interface BrickStatus {level:Level;summary:string;details:string[];links:string[]}
export interface Brick {domain:string;name:string;slug:string;version:string;icon:string;module_url:string;element:string;status:BrickStatus;tab?:string|null}
export interface Other {domain:string;name:string;pitch:string;url:string;installed:boolean;settings_path:string}
export interface Overview {version:1;socle:number[];bricks:Brick[];others:Other[]}
interface Hass {callWS<T>(msg:Record<string,unknown>):Promise<T>;themes?:{darkMode?:boolean}}
type Tab=HTMLElement&{hass?:unknown;narrow?:boolean;route?:unknown};

export const levelText:Record<Level,string>={ok:'Tout est suivi',action:'À faire',unknown:'État inconnu'};
// "/confort/abc" → ["confort","/abc"]; the home page has no slug.
export function splitPath(path:string|undefined):[string,string]{
 const parts=(path??'').split('/').filter(Boolean);
 return [parts[0]??'',parts.length>1?'/'+parts.slice(1).join('/'):''];
}
export function shortName(name:string){return name.replace(/^Niak /,'');}
// The tab's name: its own (since socle 1.1, « Météo » for Niak Weather), else the brick's without « Niak ».
export function tabName(b:{name:string;tab?:string|null}){return b.tab||shortName(b.name);}
function navigate(path:string,replace=false){
 history[replace?'replaceState':'pushState'](null,'',path);
 window.dispatchEvent(new CustomEvent('location-changed',{detail:{replace}}));
}

export class NiakShell extends LitElement {
 static properties={hass:{attribute:false},narrow:{type:Boolean},route:{attribute:false},panel:{attribute:false},overview:{state:true},error:{state:true}};
 // Declared, not initialised as fields: whatever the brick's compiler options, Lit keeps its accessors.
 declare hass?:Hass;declare narrow:boolean;declare route?:{prefix:string;path:string};declare panel?:{config?:{redirect?:string}};
 declare overview?:Overview;declare error:string;
 constructor(){super();this.narrow=false;this.error='';}
 private tabs=new Map<string,Tab>();
 private loading=false;
 private shown:string|undefined;
 protected updated(changed:PropertyValues){
  this.setAttribute('data-theme',this.hass?.themes?.darkMode===false?'light':'dark');
  // A brick's former address (/niak-confort/…) leads to its tab, keeping the rest of the path.
  const redirect=this.panel?.config?.redirect;
  if(redirect){if(changed.has('route')||changed.has('panel'))navigate(redirect+(this.route?.path??''),true);return;}
  const [slug]=splitPath(this.route?.path);
  // Fresh states on every return to the home page.
  if(this.hass&&!this.loading&&(!this.overview&&!this.error||slug===''&&this.shown!==undefined&&this.shown!==''))void this.load();
  this.shown=slug;
  const brick=this.overview?.bricks.find(b=>b.slug===slug);
  if(brick)void this.tab(brick);
 }
 private async load(){
  this.loading=true;
  try{this.overview=await this.hass!.callWS<Overview>({type:'niak/overview'});this.error='';}
  catch(e){this.error=typeof e==='object'&&e&&'message' in e?String(e.message):'Connexion indisponible.';}
  finally{this.loading=false;}
 }
 // Each brick's tab is its own element, loaded once and kept: a draft survives a trip to the home page.
 private async tab(brick:Brick){
  let el=this.tabs.get(brick.slug);
  if(!el){
   try{if(!customElements.get(brick.element))await import(/* @vite-ignore */ brick.module_url);}
   catch{this.error=`L’onglet ${tabName(brick)} ne s’est pas chargé. Rechargez la page.`;return;}
   if(this.tabs.has(brick.slug))return;
   el=document.createElement(brick.element) as Tab;el.setAttribute('embedded','');this.tabs.set(brick.slug,el);this.requestUpdate();
  }
  const [,rest]=splitPath(this.route?.path);
  el.hass=this.hass;el.narrow=this.narrow;el.route={prefix:`/niak/${brick.slug}`,path:rest};
 }
 private menu(){this.dispatchEvent(new CustomEvent('hass-toggle-menu',{bubbles:true,composed:true}));}
 private go(slug:string){navigate('/niak'+(slug?'/'+slug:''));}
 private home(){const o=this.overview!;
  return html`<main><h1>Accueil</h1><p class="muted">Les briques Niak installées et ce qu’elles suivent.</p>
   ${o.bricks.map(b=>html`<section class="brick ${b.status.level}"><div class="top"><h2>${b.name}</h2><span class="version">Version ${b.version}</span></div>
    <p class="level"><span class="dot"></span>${levelText[b.status.level]}${b.status.summary?html`<span class="summary">${b.status.summary}</span>`:nothing}</p>
    ${b.status.details.length?html`<ul>${b.status.details.map(d=>html`<li>${d}</li>`)}</ul>`:nothing}
    ${b.status.links.length?html`<p class="links">${b.status.links.map(l=>html`<span>${l}</span>`)}</p>`:nothing}
    <button class="primary" @click=${()=>this.go(b.slug)}>Ouvrir ${tabName(b)}</button></section>`)}
   ${o.others.length?html`<h2 class="others-title">À découvrir</h2>${o.others.map(x=>html`<section class="other"><div><h3>${x.name}</h3><p class="muted">${x.installed?'Installée. Ses réglages restent dans Paramètres, en attendant qu’elle rejoigne ce panneau.':x.pitch}</p></div>
    ${x.installed?html`<a class="button" href=${x.settings_path}>Ouvrir ses réglages</a>`:html`<a class="button" href=${x.url} target="_blank" rel="noreferrer">Voir</a>`}</section>`)}`:nothing}</main>`;}
 protected render(){
  if(this.panel?.config?.redirect)return nothing;
  const [slug]=splitPath(this.route?.path);const o=this.overview;
  const active=o?.bricks.some(b=>b.slug===slug)?slug:'';
  const tabs=[{slug:'',name:'Accueil'},...(o?.bricks??[]).map(b=>({slug:b.slug,name:tabName(b)}))];
  return html`<header><div class="bar"><button class="icon" aria-label="Ouvrir le menu Home Assistant" @click=${()=>this.menu()}><span class="menu-icon"></span></button><strong>Niak</strong></div>
   <nav role="tablist" aria-label="Briques Niak">${tabs.map(t=>html`<button role="tab" aria-selected=${t.slug===active?'true':'false'} @click=${()=>this.go(t.slug)}>${t.name}</button>`)}</nav></header>
   <div class="content">${this.error?html`<main><p class="notice" role="alert">${this.error}</p><button @click=${()=>{this.error='';void this.load();}}>Réessayer</button></main>`
    :!o?html`<main><p class="muted" role="status">Chargement…</p></main>`
    :active?this.tabs.get(active)??html`<main><p class="muted" role="status">Chargement…</p></main>`:this.home()}</div>`;
 }
 static styles=css`
  :host{display:flex;flex-direction:column;height:100%;color:var(--primary-text-color,#edf1f7);background:var(--primary-background-color,#151c25);font:16px/1.55 var(--paper-font-body1_-_font-family,Roboto,system-ui,sans-serif);--nk-accent:#a1c9e8;--nk-action-bg:#285f87;--nk-ok:#a1c9e8;--nk-todo:#f2a65a;--nk-border:var(--divider-color,#657386);--nk-muted:var(--secondary-text-color,#bdc5d1);--nk-surface:var(--card-background-color,#222932)}
  :host([data-theme=light]){--nk-accent:#285f87;--nk-ok:#285f87;--nk-todo:#b25a00}
  *{box-sizing:border-box}
  header{background:var(--nk-surface);border-bottom:1px solid var(--nk-border);padding:0 24px;flex-shrink:0}
  .bar{display:flex;gap:12px;align-items:center;padding:12px 0 4px}.bar strong{font-size:18px}
  .menu-icon{font-size:0;width:22px;height:20px;display:block;border-top:2px solid currentColor;border-bottom:2px solid currentColor;position:relative}.menu-icon:after{content:'';height:2px;background:currentColor;position:absolute;top:7px;left:0;right:0}
  nav{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none}
  nav button{border:0;border-bottom:3px solid transparent;border-radius:0;background:transparent;color:var(--nk-muted);padding:10px 14px;min-height:44px;font:inherit;font-weight:500;cursor:pointer;white-space:nowrap}
  nav button[aria-selected=true]{color:var(--primary-text-color);border-bottom-color:var(--nk-accent)}
  .content{flex:1;min-height:0;overflow:auto}
  .content>*:not(main){display:block;height:100%}
  main{max-width:940px;margin:0 auto;padding:32px 28px 64px}
  h1{font-size:30px;line-height:1.25;margin:0 0 8px}h2{font-size:22px;margin:0}h3{font-size:18px;margin:0 0 4px}
  p{margin:8px 0}.muted{color:var(--nk-muted)}
  button,.button{font:inherit;color:inherit;min-height:44px;border:1px solid var(--nk-border);border-radius:8px;background:var(--nk-surface);padding:10px 14px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;flex-shrink:0}
  button.icon{padding:8px;min-width:44px;justify-content:center}
  .primary{background:var(--nk-action-bg);color:#fff;border-color:var(--nk-action-bg);font-weight:600}
  :focus-visible{outline:3px solid var(--nk-accent);outline-offset:3px}
  .brick{border:1px solid var(--nk-border);border-radius:12px;padding:18px 20px;margin:20px 0;background:var(--nk-surface);--nk-level:var(--nk-muted)}
  .brick.ok{--nk-level:var(--nk-ok)}.brick.action{--nk-level:var(--nk-todo)}.brick.action{border-color:color-mix(in srgb,var(--nk-todo) 50%,var(--nk-border))}
  .top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}.version{font-size:14px;color:var(--nk-muted)}
  .level{font-weight:600;color:var(--nk-level);display:flex;align-items:baseline;gap:4px 10px;flex-wrap:wrap}.level .summary{color:var(--primary-text-color);font-weight:400}
  .dot{width:10px;height:10px;border-radius:50%;background:var(--nk-level);flex-shrink:0;align-self:center}
  ul{margin:8px 0 12px;padding-left:22px}li{margin:4px 0}
  .links{display:flex;gap:8px;flex-wrap:wrap}.links span{font-size:14px;border:1px solid var(--nk-border);border-radius:999px;padding:4px 12px;color:var(--nk-muted)}
  .brick .primary{margin-top:8px}
  .others-title{margin:36px 0 4px}
  .other{display:flex;justify-content:space-between;align-items:center;gap:20px;border-top:1px solid var(--nk-border);padding:16px 0}
  .notice{padding:14px 16px;border:1px solid var(--nk-border);border-radius:8px}
  @media(max-width:600px){header{padding:0 12px}main{padding:24px 16px 48px}h1{font-size:26px}.brick{padding:16px}.other{flex-direction:column;align-items:flex-start;gap:8px}}
 `;
}
if(!customElements.get(ELEMENT))customElements.define(ELEMENT,NiakShell);
