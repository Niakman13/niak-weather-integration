// Hestia shared panel (socle v1.15): header, tabs and the home page listing every Hestia brick.
// Copied unchanged into each brick from hestia-ecosysteme/socle/ (see ECOSYSTEME.md § 8).
import {LitElement,html,css,nothing,type PropertyValues} from 'lit';
import {frame,hubStyles,modernStyles,hubIcon} from './ui';
import {t,fr,setLanguage} from './i18n';

export const ELEMENT='hestia-socle-1-15';
// The panel's address (socle 1.12): /hestia; the former address leads there, keeping the rest of the address.
export const BASE='/hestia';
// The Hestia logo (logo-github): its gradient reads on a light or a dark menu alike.
// One gradient id per copy: the hidden mobile bar's copy must not be the one the menu's refers to.
const logo=(id:string)=>html`<svg class="nk-logo" viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id=${id} gradientUnits="userSpaceOnUse" x1="30" y1="30" x2="170" y2="170"><stop offset="0" stop-color="#F3A683"/><stop offset="0.5" stop-color="#B49BE0"/><stop offset="1" stop-color="#5E9BD8"/></linearGradient></defs><path d="M92.04 59.78L93.73 50.39L106.27 50.39L107.96 59.78A41 41 0 0 1 119.75 64.07L119.75 64.07L127.09 57.97L136.69 66.03L131.95 74.31A41 41 0 0 1 138.23 85.17L138.23 85.17L147.76 85.21L149.94 97.56L140.99 100.86A41 41 0 0 1 138.81 113.21L138.81 113.21L146.09 119.38L139.83 130.23L130.85 127.01A41 41 0 0 1 121.24 135.07L121.24 135.07L122.85 144.47L111.08 148.76L106.27 140.52A41 41 0 0 1 93.73 140.52L93.73 140.52L88.92 148.76L77.15 144.47L78.76 135.07A41 41 0 0 1 69.15 127.01L69.15 127.01L60.17 130.23L53.91 119.38L61.19 113.21A41 41 0 0 1 59.01 100.86L59.01 100.86L50.06 97.56L52.24 85.21L61.77 85.17A41 41 0 0 1 68.05 74.31L68.05 74.31L63.31 66.03L72.91 57.97L80.25 64.07A41 41 0 0 1 92.04 59.78Z" fill="none" stroke="url(#${id})" stroke-width="6" stroke-linejoin="round"/><path d="M82 114.5 V84 M118 116 V85.5 M82 100 H118" fill="none" stroke="url(#${id})" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="82" cy="121" r="5" fill="none" stroke="url(#${id})" stroke-width="4.5"/><circle cx="118" cy="79" r="5" fill="none" stroke="url(#${id})" stroke-width="4.5"/><path d="M100 43 V30" stroke="url(#${id})" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="100" cy="24" r="5.5" fill="none" stroke="url(#${id})" stroke-width="4"/><path d="M141 59 L150 50 H158" stroke="url(#${id})" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="164" cy="50" r="5.5" fill="none" stroke="url(#${id})" stroke-width="4"/><path d="M157 100 H170" stroke="url(#${id})" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="176" cy="100" r="5.5" fill="none" stroke="url(#${id})" stroke-width="4"/><path d="M141 141 L150 150 V158" stroke="url(#${id})" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="150" cy="164" r="5.5" fill="none" stroke="url(#${id})" stroke-width="4"/><path d="M100 157 V170" stroke="url(#${id})" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="100" cy="176" r="5.5" fill="none" stroke="url(#${id})" stroke-width="4"/><path d="M59 141 L50 150 H42" stroke="url(#${id})" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="36" cy="150" r="5.5" fill="none" stroke="url(#${id})" stroke-width="4"/><path d="M43 100 H30" stroke="url(#${id})" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="100" r="5.5" fill="none" stroke="url(#${id})" stroke-width="4"/><path d="M59 59 L50 50 V42" stroke="url(#${id})" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="36" r="5.5" fill="none" stroke="url(#${id})" stroke-width="4"/></svg>`;
type Level='ok'|'action'|'unknown';
export interface BrickStatus {level:Level;summary:string;details:string[];links:string[]}
export interface Brick {domain:string;name:string;slug:string;version:string;icon:string;module_url:string;element:string;status:BrickStatus;tab?:string|null;navigation?:number|null}
export interface Other {domain:string;name:string;pitch:string;url:string;installed:boolean;settings_path:string}
export interface Overview {version:1;socle:number[];bricks:Brick[];others:Other[];sidebar?:boolean;theme?:'ha'|'hestia'}
interface Hass {callWS<T>(msg:Record<string,unknown>):Promise<T>;themes?:{darkMode?:boolean};language?:string}
type Tab=HTMLElement&{hass?:unknown;narrow?:boolean;route?:unknown};

export const levelText:Record<Level,string>={ok:fr('Tout est suivi'),action:fr('À faire'),unknown:fr('État inconnu')};
// "/confort/abc" → ["confort","/abc"]; the home page has no slug.
export function splitPath(path:string|undefined):[string,string]{
 const parts=(path??'').split('/').filter(Boolean);
 return [parts[0]??'',parts.length>1?'/'+parts.slice(1).join('/'):''];
}
export function shortName(name:string){return name.replace(/^Hestia /,'');}
// The tab's name: its own (since socle 1.1, « Météo » for Hestia Weather), else the brick's without « Hestia ».
export function tabName(b:{name:string;tab?:string|null;navigation?:number|null}){return t(b.tab||shortName(b.name));}
function navigate(path:string,replace=false){
 history[replace?'replaceState':'pushState'](null,'',path);
 window.dispatchEvent(new CustomEvent('location-changed',{detail:{replace}}));
}

export class HestiaShell extends LitElement {
 static properties={hass:{attribute:false},narrow:{type:Boolean},route:{attribute:false},panel:{attribute:false},overview:{state:true},error:{state:true},saving:{state:true},menuOpen:{state:true}};
 // Declared, not initialised as fields: whatever the brick's compiler options, Lit keeps its accessors.
 declare hass?:Hass;declare narrow:boolean;declare route?:{prefix:string;path:string};declare panel?:{config?:{redirect?:string}};
 declare menuOpen:boolean;declare overview?:Overview;declare error:string;declare saving:boolean;
 constructor(){super();this.narrow=false;this.error='';this.saving=false;this.menuOpen=false;this.fonts();}
 private fonts(){if(document.getElementById('hestia-hub-fonts'))return;const style=document.createElement('style');style.id='hestia-hub-fonts';style.textContent=[400,500,600,700].map(w=>`@font-face{font-family:Manrope;src:url('${new URL('./manrope-'+w+'.ttf',import.meta.url).href}');font-weight:${w};font-display:swap}`).join('');document.head.append(style);}
 private tabs=new Map<string,Tab>();
 private loading=false;
 private shown:string|undefined;
 private viewportObserver?:ResizeObserver;
 private viewportFrame=0;
 private resizeViewport=()=>{cancelAnimationFrame(this.viewportFrame);this.viewportFrame=requestAnimationFrame(()=>{if(!this.isConnected)return;const top=Math.max(0,this.getBoundingClientRect().top),bottom=parseFloat(getComputedStyle(this).getPropertyValue('--safe-area-inset-bottom'))||0;const height=Math.max(0,(window.visualViewport?.height??window.innerHeight)-top-bottom)+'px';if(this.style.getPropertyValue('--nk-viewport-height')!==height)this.style.setProperty('--nk-viewport-height',height);});};
 connectedCallback(){super.connectedCallback();window.addEventListener('resize',this.resizeViewport);window.visualViewport?.addEventListener('resize',this.resizeViewport);this.viewportObserver=new ResizeObserver(this.resizeViewport);this.viewportObserver.observe(this.parentElement??this);this.resizeViewport();}
 disconnectedCallback(){super.disconnectedCallback();window.removeEventListener('resize',this.resizeViewport);window.visualViewport?.removeEventListener('resize',this.resizeViewport);this.viewportObserver?.disconnect();cancelAnimationFrame(this.viewportFrame);}

 protected updated(changed:PropertyValues){
  // The words follow Home Assistant's language: a change redraws the hub.
  if(setLanguage(this.hass?.language))this.requestUpdate();
  this.setAttribute('data-theme',this.hass?.themes?.darkMode===false?'light':'dark');
  this.setAttribute('data-appearance',this.overview?.theme??'hestia');
  for(const el of this.tabs.values())el.setAttribute('data-appearance',this.overview?.theme??'hestia');
  // A brick's former address (/hestia-confort/…) leads to its tab, keeping the rest of the path.
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
  try{this.overview=await this.hass!.callWS<Overview>({type:'hestia/overview',language:this.hass!.language});this.error='';}
  catch(e){this.error=typeof e==='object'&&e&&'message' in e?String(e.message):t('Connexion indisponible.');}
  finally{this.loading=false;}
 }
 // Each brick's tab is its own element, loaded once and kept: a draft survives a trip to the home page.
 private async tab(brick:Brick){
  let el=this.tabs.get(brick.slug);
  if(!el){
   try{if(!customElements.get(brick.element))await import(/* @vite-ignore */ brick.module_url);}
   catch{this.error=t('L’onglet {tab} ne s’est pas chargé. Rechargez la page.',{tab:tabName(brick)});return;}
   if(splitPath(this.route?.path)[0]!==brick.slug)return;
   if(this.tabs.has(brick.slug))return;
   el=document.createElement(brick.element) as Tab;el.setAttribute('embedded','');this.tabs.set(brick.slug,el);this.requestUpdate();
  }
  const [,rest]=splitPath(this.route?.path);
  el.setAttribute('data-appearance',this.overview?.theme??'hestia');
  el.hass=this.hass;el.narrow=this.narrow;el.route={prefix:`${BASE}/${brick.slug}`,path:rest};
 }
 // The sidebar entry (socle 1.6): shown only when this copy of the socle answers with the setting.
 private async setSidebar(visible:boolean){
  this.saving=true;
  try{const r=await this.hass!.callWS<{sidebar:boolean}>({type:'hestia/set_sidebar',visible});if(this.overview)this.overview={...this.overview,sidebar:r.sidebar};}
  catch(e){this.error=typeof e==='object'&&e&&'message' in e?String(e.message):t('Le réglage n’a pas été enregistré.');}
  finally{this.saving=false;}
 }
 private async setTheme(theme:'ha'|'hestia'){
  this.saving=true;
  try{const r=await this.hass!.callWS<{theme:'ha'|'hestia'}>({type:'hestia/set_theme',theme});if(this.overview)this.overview={...this.overview,theme:r.theme};}
  catch(e){this.error=typeof e==='object'&&e&&'message' in e?String(e.message):t('Le thème n’a pas été enregistré.');}
  finally{this.saving=false;}
 }
 private appearance(){return frame(t('Thème du hub'),html`<label class="theme-label" for="hub-theme">${t('Apparence')}</label><select id="hub-theme" .value=${this.overview?.theme??'hestia'} ?disabled=${this.saving} @change=${(e:Event)=>void this.setTheme((e.target as HTMLSelectElement).value as 'ha'|'hestia')}><option value="ha">${t('Suivre le thème Home Assistant')}</option><option value="hestia">${t('Utiliser le thème Hestia')}</option></select><p class="muted">${t('Home Assistant reprend les couleurs et la police de votre thème. Hestia utilise sa propre palette, en suivant le mode clair ou sombre de Home Assistant.')}</p>`);}
 private display(){const on=this.overview?.sidebar;
  if(on===undefined)return nothing;
  return html`${frame(t('Affichage'),html`<section class="other"><div><h3 id="sidebar-label">${t('Hestia dans le menu Home Assistant')}</h3>
   <p class="muted">${on?t('Hestia est dans le menu de gauche.'):t('Hestia n’est pas dans le menu de gauche.')}</p>
   <p class="muted">${t('Masqué, il reste ouvert par la roue de chaque intégration, dans Paramètres.')}</p></div>
   <button role="switch" aria-checked=${on?'true':'false'} aria-labelledby="sidebar-label" ?disabled=${this.saving} @click=${()=>this.setSidebar(!on)}><span class="track"><span class="thumb"></span></span>${on?t('Affiché'):t('Masqué')}</button></section>`)} `;}
 private menu(){this.dispatchEvent(new CustomEvent('hass-toggle-menu',{bubbles:true,composed:true}));}
 private go(slug:string){this.menuOpen=false;navigate(BASE+(slug?'/'+slug:''));}
 private home(){const o=this.overview!;
  return html`<main><div class="nk-home-head"><div><h1>${t('Votre logement, connecté')}</h1><p>${t('Vos briques Hestia et les points à compléter, au même endroit.')}</p></div></div><div class="nk-bricks">
   ${o.bricks.map(b=>html`${frame(t(b.name),html`<section class="brick ${b.status.level}"><p class="version">${t('Version {version}',{version:b.version})}</p>
    <p class="level"><span class="dot"></span>${t(levelText[b.status.level])}${b.status.summary?html`<span class="summary">${b.status.summary}</span>`:nothing}</p>
    ${b.status.details.length?html`<ul>${b.status.details.map(d=>html`<li>${d}</li>`)}</ul>`:nothing}
    ${b.status.links.length?html`<p class="links">${b.status.links.map(l=>html`<span>${l}</span>`)}</p>`:nothing}
    <button class="primary" @click=${()=>this.go(b.slug)}>${t('Ouvrir {tab}',{tab:tabName(b)})}</button></section>`,{className:b.status.level==='action'?'todo':''})}`)}
   </div>${o.others.length?html`${frame(t('À découvrir'),html`${o.others.map(x=>html`<section class="other"><div><h3>${t(x.name)}</h3><p class="muted">${x.installed?t('Installée. Ses réglages restent dans Paramètres, en attendant qu’elle rejoigne ce panneau.'):t(x.pitch)}</p></div>
    ${x.installed?html`<a class="button" href=${x.settings_path}>${t('Ouvrir ses réglages')}</a>`:html`<a class="button" href=${x.url} target="_blank" rel="noreferrer">${t('Voir')}</a>`}</section>`)}`)}`:nothing}
   </main>`;}
 private navGroup(label:string,items:string[][]){label=t(label);const current=(this.route?.path??'').replace(/^\/|\/$/g,'');return html`<nav aria-label=${label}><p class="nav-label">${label}</p>${items.map(([path,title,icon])=>html`<a href=${BASE+(path?'/'+path:'')} aria-current=${current===path||path.includes('/')&&current.startsWith(path+'/')?'page':nothing} @click=${(e:MouseEvent)=>{if(e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();this.go(path);}}}>${hubIcon(icon)}<span>${t(title)}</span></a>`)}</nav>`;}
 protected render(){
  if(this.panel?.config?.redirect)return nothing;
  const [slug]=splitPath(this.route?.path);const o=this.overview;
  const active=o?.bricks.some(b=>b.slug===slug)?slug:'';const settings=slug==='reglages';
  return html`<div class="mobile-bar"><button aria-label=${t('Ouvrir la navigation Hestia')} aria-expanded=${String(this.menuOpen)} @click=${()=>this.menuOpen=!this.menuOpen}>${hubIcon('settings')}</button>${logo('nk-logo-bar')}<strong>Hestia</strong><button aria-label=${t('Ouvrir le menu Home Assistant')} @click=${()=>this.menu()}>${hubIcon('home')}</button></div>
   ${this.menuOpen?html`<button class="backdrop" aria-label=${t('Fermer la navigation Hestia')} @click=${()=>this.menuOpen=false}></button>`:nothing}
   <aside class=${this.menuOpen?'open':''} aria-label=${t('Navigation Hestia')} @keydown=${(e:KeyboardEvent)=>{if(e.key==='Escape'){this.menuOpen=false;this.updateComplete.then(()=>this.renderRoot.querySelector<HTMLButtonElement>('.mobile-bar button')?.focus());}}}><div class="brand">${logo('nk-logo-menu')}<strong>Hestia</strong><button class="icon" aria-label=${t('Ouvrir le menu Home Assistant')} @click=${()=>this.menu()}>${hubIcon('home')}</button></div>
    ${this.navGroup(fr('Accueil Hestia'),[['',fr('Vue d’ensemble'),'home'],['reglages',fr('Réglages'),'settings']])}
    ${[...(o?.bricks??[])].sort((a,b)=>(a.slug==='meteo'?-1:b.slug==='meteo'?1:0)).map(b=>this.navGroup(tabName(b),((b.navigation??0)>=1&&b.slug==='confort'||(b.navigation??0)>=2&&b.slug==='meteo')?[[b.slug,fr('Accueil'),'home'],...(b.slug==='confort'&&(b.navigation??0)>=2?[[b.slug+'/bilan',fr('Bilan du logement'),'review']]:[]),[b.slug+'/reglages',fr('Réglages généraux'),'settings'],...((b.navigation??0)>=3?[[b.slug+'/extensions',fr('Extensions'),'extensions']]:[])]:b.navigation===1&&b.slug==='meteo'?[[b.slug,fr('Accueil'),'home'],[b.slug+'/sources',fr('Sources météo'),'weather'],[b.slug+'/station',fr('Station météo · capteurs locaux'),'temperature'],[b.slug+'/air',fr('Qualité de l’air'),'air'],[b.slug+'/pollens',fr('Pollens'),'pollen'],[b.slug+'/entites',fr('Entités'),'entities']]:[[b.slug,fr('Accueil'),'home']]))}
   </aside>
   <div class="content" ?inert=${this.menuOpen}>${this.error?html`<main><p class="notice" role="alert">${this.error}</p><button @click=${()=>{this.error='';void this.load();}}>${t('Réessayer')}</button></main>`
    :!o?html`<main><p class="muted" role="status">${t('Chargement…')}</p></main>`
    :active?this.tabs.get(active)??html`<main><p class="muted" role="status">${t('Chargement…')}</p></main>`:settings?html`<main><h1>${t('Réglages Hestia')}</h1><p class="muted">${t('Les préférences communes à votre hub.')}</p>${this.appearance()}${this.display()}</main>`:slug?html`<main><h1>${t('Cette page est indisponible')}</h1><p>${t('La brique correspondante n’est pas installée ou cette adresse est inconnue.')}</p><button @click=${()=>this.go('')}>${t('Retour à l’accueil')}</button></main>`:this.home()}</div>`;
 }
 static styles=[css`
  :host{display:flex;flex-direction:column;height:100%;color:var(--primary-text-color,#edf1f7);background:var(--primary-background-color,#151c25);font:16px/1.65 var(--paper-font-body1_-_font-family,Roboto,system-ui,sans-serif);--nk-accent:#a1c9e8;--nk-action-bg:#285f87;--nk-ok:#a1c9e8;--nk-todo:#f2a65a;--nk-border:var(--divider-color,#657386);--nk-muted:var(--secondary-text-color,#bdc5d1);--nk-surface:var(--card-background-color,#222932)}
  :host([data-theme=light]){--nk-accent:#285f87;--nk-ok:#285f87;--nk-todo:#b25a00}
  *{box-sizing:border-box}
  header{background:var(--nk-surface);border-bottom:1px solid var(--nk-border);padding:0 24px;flex-shrink:0}
  .bar{display:flex;gap:12px;align-items:center;padding:8px 0 0}.bar strong{font-size:18px}
  .menu-icon{font-size:0;width:22px;height:20px;display:block;border-top:2px solid currentColor;border-bottom:2px solid currentColor;position:relative}.menu-icon:after{content:'';height:2px;background:currentColor;position:absolute;top:7px;left:0;right:0}
  nav{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none}
  nav a{border:1px solid transparent;border-radius:8px;margin:8px 0;background:transparent;color:var(--nk-muted);padding:10px 14px;min-height:44px;font:inherit;font-weight:500;cursor:pointer;white-space:nowrap;text-decoration:none;display:inline-flex;align-items:center}
  nav a[aria-current=page]{color:var(--primary-text-color);background:color-mix(in srgb,var(--nk-help-accent) 12%,var(--nk-surface));border-color:color-mix(in srgb,var(--nk-help-accent) 35%,var(--nk-border))}
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
  button[role=switch]{gap:10px}.track{width:38px;height:22px;border-radius:11px;background:var(--nk-border);position:relative;flex-shrink:0}.thumb{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .15s}
  button[role=switch][aria-checked=true] .track{background:var(--nk-action-bg)}button[role=switch][aria-checked=true] .thumb{left:19px}button[disabled]{opacity:.6;cursor:default}
  @media(prefers-reduced-motion:reduce){.thumb{transition:none}}
  .notice{padding:14px 16px;border:1px solid var(--nk-border);border-radius:8px}
  @media(max-width:600px){header{padding:0 12px}main{padding:24px 16px 48px}h1{font-size:26px}.brick{padding:16px}.other{flex-direction:column;align-items:flex-start;gap:8px}}
 `,hubStyles,css`
  .nk-body>.brick{border:0;border-radius:0;padding:0;margin:0;background:transparent}
  @media(min-width:760px){header{display:grid;grid-template-columns:auto 1fr;gap:32px;align-items:center;padding:8px 28px}.bar{padding:0}nav a{margin:0}}
  .other{border-top:0;padding:0}.other+.other{margin-top:20px;padding-top:20px;border-top:1px solid var(--nk-border)}
 `,modernStyles,css`
 :host{position:relative;display:grid;grid-template-columns:264px minmax(0,1fr);height:var(--nk-viewport-height,100dvh);min-height:0;grid-template-rows:minmax(0,1fr)}aside{padding:28px 18px 20px;border-right:1px solid var(--nk-border);overflow:auto;background:var(--nk-surface)}.brand{display:flex;align-items:center;gap:8px;padding:0 4px 26px}.brand strong{font-size:25px;letter-spacing:-.04em}.brand button{border:0;padding:8px;min-width:44px}.brand svg{width:25px;height:25px}.brand .nk-logo{width:40px;height:40px;margin:-6px 0 -6px -4px;flex-shrink:0}.brand button{margin-left:auto}.mobile-bar .nk-logo{width:30px;height:30px;flex-shrink:0;margin-right:-4px}nav{display:block;overflow:visible;margin:0 0 20px}nav+nav{border-top:1px solid var(--nk-border);padding-top:18px}.nav-label{margin:0 12px 9px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--nk-muted)}nav a{display:flex;gap:12px;align-items:center;border:0;border-radius:24px;margin:3px 0;min-height:44px;padding:9px 13px;font-size:13px;white-space:normal}nav a svg{width:19px;height:19px;flex-shrink:0}nav a[aria-current=page]{background:var(--nk-selected);border:0;color:var(--primary-text-color);font-weight:600}nav a:hover{background:var(--nk-selected)}.content{min-width:0;overflow:auto;height:100%;grid-column:2}.content>*:not(main){height:100%}.mobile-bar,.backdrop{display:none}.theme-label{display:block;margin-bottom:6px}select{width:100%;max-width:460px;min-height:44px;padding:10px 14px;border:1px solid var(--nk-border);border-radius:15px;background:var(--nk-surface);color:inherit;font:inherit}.other{padding:0}.other+ .other{margin-top:20px;padding-top:20px}.nk-home-head{margin-top:0}
 @media(max-width:760px){:host{display:flex;flex-direction:column}.mobile-bar{display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--nk-border);padding:7px 14px;flex-shrink:0}.mobile-bar strong{margin-right:auto;font-size:20px}.mobile-bar button{border:0;padding:8px;min-width:44px}aside{display:none;position:absolute;inset:0 auto 0 0;width:min(290px,86vw);z-index:21;border-radius:0 24px 24px 0;box-shadow:0 12px 40px #0003}aside.open{display:block}.backdrop{display:block;position:absolute;inset:0;border:0;border-radius:0;background:#0006;z-index:20;width:100%;height:100%;padding:0}.content{flex:1;height:auto}.other{gap:12px}.brand{padding-bottom:20px}}
 `];
}
if(!customElements.get(ELEMENT))customElements.define(ELEMENT,HestiaShell);
