// The « Météo » tab of the shared « Niak » panel: each place's settings, step by step, then saved at once.
// Niak Weather computes everything (draft.py): this page shows the draft, sends each change and saves it.
import {LitElement,html,unsafeCSS,nothing,type TemplateResult,type PropertyValues} from 'lit';
import {customElement,property,state} from 'lit/decorators.js';
import styles from './styles.css';
import {frame,hubStyles,modernStyles,hubIcon,helpTip} from './socle/ui';
import {NONE,stages,intros,extensionGroups,enabledKeys,provenance,sameSet,entityLine,grouped,capital,type Change,type Choice,type DraftReply,type Field,type Hass,type Line,type Place,type Places,type Sources,type View,type Extension} from './model';

const categories=['sources','station','air','pollens','entites','recapitulatif','eau-jardin'];
const order=[0,1,2,3,6,4,5];
const sections=[{stage:0,label:'Sources météo',icon:'weather'},{stage:1,label:'Station météo',icon:'temperature'},{stage:2,label:'Qualité de l’air',icon:'air'},{stage:3,label:'Pollens',icon:'pollen'},{stage:6,label:'Eau et jardin',icon:'pollen'},{stage:4,label:'Entités',icon:'entities'}];
const sectionStage=(section:string)=>section==='extensions'?0:categories.indexOf(section);

@customElement('niak-weather-setup')
export class WeatherSetup extends LitElement {
 static styles=[unsafeCSS(styles),hubStyles,modernStyles];
 @property({attribute:false}) hass?:Hass;
 @property({attribute:false}) route?:{path:string};
 @property({type:Boolean}) narrow=false;
 @state() private places?:Places;
 @state() private entryId:string|null=null;
 @state() private editing=false;
 @state() private draft?:Sources;
 @state() private view?:View;
 @state() private stage=0;
 @state() private enabled:string[]=[];
 @state() private busy=false;
 @state() private error='';
 @state() private saved='';
 @state() private confirmLeave=false;
 @state() private placeTitle='';
 @state() private extensionId='';
 private routeHandled:string|undefined;
 private routeGeneration=0;
 private drafts=new Map<string,{draft:Sources;view:View;stage:number;enabled:string[];error:string;initial:string;initialEnabled:string[];savedOptions?:Sources;touched:Set<string>;placeTitle:string}>();
 private initial='';
 private initialEnabled:string[]=[];
 private savedOptions?:Sources;
 private touched=new Set<string>();
 private generation=0;
 private beforeUnload=(e:BeforeUnloadEvent)=>{if(this.dirty()||[...this.drafts.values()].some(d=>JSON.stringify(d.draft)!==d.initial||!sameSet(d.enabled,d.initialEnabled))){e.preventDefault();e.returnValue='';}};
 connectedCallback(){super.connectedCallback();window.addEventListener('beforeunload',this.beforeUnload);}
 disconnectedCallback(){super.disconnectedCallback();this.routeGeneration++;if(this.busy)this.routeHandled=undefined;window.removeEventListener('beforeunload',this.beforeUnload);}
 protected updated(changed:PropertyValues){
  this.setAttribute('data-theme',this.hass?.themes?.darkMode===false?'light':'dark');
  if(this.hass&&!this.places&&!this.busy&&!this.error)void this.load();
  if(changed.has('route')&&this.places)void this.followRoute();
 }
 private message(e:unknown){return typeof e==='object'&&e&&'message' in e?String((e as {message:unknown}).message):'Home Assistant ne répond pas. Réessayez.';}
 private async load(){
  this.busy=true;
  try{this.places=await this.hass!.callWS<Places>({type:'niak_weather/panel/places'});this.error='';await this.followRoute();}
  catch(e){this.error=this.message(e);}
  finally{this.busy=false;}
  // A place restarting after a save: look again in a moment, a few times at most.
  if(this.places?.places.some(p=>!p.loaded&&!p.failed)&&this.retries<10){this.retries++;setTimeout(()=>{if(!this.editing)void this.load();},2000);}
  else this.retries=0;
 }
 private retries=0;
 private dirty(){return !!this.draft&&(JSON.stringify(this.draft)!==this.initial||!sameSet(this.enabled,this.initialEnabled));}
 private top(){this.scrollTop=0;this.renderRoot.querySelector('main')?.scrollIntoView?.({block:'start'});}

 private path(path:string){if(!this.isConnected)return;this.routeHandled=path?'/'+path:'';history.pushState(null,'','/niak/meteo'+(path?'/'+path:''));window.dispatchEvent(new CustomEvent('location-changed'));}
 private remember(){if(this.draft&&this.view)this.drafts.set(this.entryId??'nouveau',{draft:this.draft,view:this.view,stage:this.stage,enabled:this.enabled,error:this.error,initial:this.initial,initialEnabled:this.initialEnabled,savedOptions:this.savedOptions,touched:this.touched,placeTitle:this.placeTitle});}
 private async followRoute(){
  const path=this.route?.path??'';if(path===this.routeHandled)return;this.routeHandled=path;this.routeGeneration++;
  const parts=path.split('/').filter(Boolean),section=parts[0]==='reglages'?(parts[1]??'sources'):parts[0],id=parts[0]==='reglages'?parts[2]:parts[1],stage=sectionStage(section);this.remember();
  const target=id??(this.editing?this.entryId:undefined)??(this.places?.places.length===1?this.places.places[0].entry_id:undefined);
  if(stage>=0&&target){
   const cached=this.drafts.get(target);if(cached){Object.assign(this,cached);this.entryId=target==='nouveau'?null:target;this.stage=stage;this.editing=true;return;}
   if(target==='nouveau'||this.places?.places.some(p=>p.entry_id===target)){await this.open(target==='nouveau'?null:target,stage,false);return;}
  }
  this.editing=false;this.draft=undefined;this.view=undefined;this.confirmLeave=false;this.error='';
 }
 // ---- Opening, changing, saving ----
 private async open(entryId:string|null,stage=0,route=true){
  const cached=this.drafts.get(entryId??'nouveau');if(route&&cached){Object.assign(this,cached);this.entryId=entryId;this.stage=stage;this.editing=true;this.path('reglages/'+categories[stage]+'/' +(entryId??'nouveau'));return;}
  const generation=this.routeGeneration;
  this.busy=true;this.error='';this.saved='';
  try{
   const reply=await this.hass!.callWS<DraftReply&{saved:Sources|null}>({type:'niak_weather/panel/open',...(entryId?{entry_id:entryId}:{})});
   if(generation!==this.routeGeneration)return;
   this.placeTitle=this.places?.places.find(p=>p.entry_id===entryId)?.title??'';
   this.entryId=entryId;this.draft=reply.draft;this.view=reply.view;this.stage=stage;this.editing=true;this.touched=new Set();
   // Leaving asks first once something changed since opening; a new place always does.
   this.initial=entryId?JSON.stringify(reply.draft):'';
   this.savedOptions=reply.saved??undefined;
   this.enabled=enabledKeys(reply.view);this.initialEnabled=[...this.enabled];
   if(route)this.path('reglages/'+categories[stage]+'/' +(entryId??'nouveau'));
   await this.updateComplete;this.top();
  }catch(e){this.error=this.message(e);}
  finally{this.busy=false;}
 }
 private async change(change:Change){
  if(!this.draft||this.busy)return;
  const generation=++this.generation,owner=this.entryId??'nouveau';this.busy=true;this.error='';
  if(change.key)this.touched.add(change.key);
  try{
   const reply=await this.hass!.callWS<DraftReply>({type:'niak_weather/panel/change',draft:this.draft,change,...(this.entryId?{entry_id:this.entryId}:{})});
   if(!this.editing||(this.entryId??'nouveau')!==owner){const cached=this.drafts.get(owner);if(cached)this.drafts.set(owner,{...cached,draft:reply.draft,view:reply.view,error:reply.error});return;}
   if(generation!==this.generation)return;
   this.draft=reply.draft;this.view=reply.view;this.error=reply.error;
  }catch(e){this.error=this.message(e);}
  finally{if(generation===this.generation)this.busy=false;}
 }
 private set(key:string,value:unknown){void this.change({op:'set',key,value});}
 private async save(){
  if(!this.draft)return;
  const generation=this.routeGeneration;this.busy=true;this.error='';
  try{
   await this.hass!.callWS({type:'niak_weather/panel/save',draft:this.draft,...(this.entryId?{entry_id:this.entryId,enabled:this.enabled}:{})});
   if(generation!==this.routeGeneration){this.places=undefined;return;}
   const title=this.view?.title??'',created=!this.entryId;
   this.close();
   this.saved=created?`${title} est créé : ses entités apparaissent dans quelques secondes.`
    :`${title} est enregistré : le lieu redémarre avec ses nouveaux réglages, la carte suit dans quelques secondes.`;
   this.places=undefined;
  }catch(e){this.error=this.message(e);}
  finally{this.busy=false;}
 }
 private close(){this.drafts.delete(this.entryId??'nouveau');this.path('');this.editing=false;this.draft=undefined;this.view=undefined;this.confirmLeave=false;this.error='';void this.updateComplete.then(()=>{this.top();});}
 private leave(){if(this.dirty()&&!this.confirmLeave){this.confirmLeave=true;return;}this.close();}
 private go(stage:number){this.stage=stage;this.path('reglages/'+categories[stage]+'/' +(this.entryId??'nouveau'));void this.updateComplete.then(()=>{this.top();});}

 // ---- Pieces ----
 private choiceList(name:string,choices:Choice[],value:string,pick:(v:string)=>void,extensions:Extension[]=[]){
  return html`<div role="radiogroup" aria-label=${({model:'Modèle de station',air:'Source de qualité de l’air',pollen:'Source des pollens'} as Record<string,string>)[name]??name}>${choices.map(c=>{const e=extensions.find(e=>e.id===c.value||e.id==='atmo-'+name&&c.value==='atmo');return html`<div class="source-choice"><label class="choice ${c.value===value?'on':''} ${c.available===false?'off':''}">
   <input type="radio" name=${name} .checked=${c.value===value} ?disabled=${c.available===false||this.busy} @change=${()=>pick(c.value)}>
   <span><strong>${c.label}</strong>${c.hint?html`<span>${c.hint}</span>`:nothing}${c.available===false&&(!e||e.installed)?html`<span>${e?.installed?'Aucune donnée détectée pour cette source':'Pas encore installée'}</span>`:nothing}</span></label>
   ${e?this.integrationInfo(e,c.available!==false):nothing}</div>`;})}</div>`;
 }
 private integrationInfo(e:Extension|undefined,available=true):TemplateResult|typeof nothing{
  if(!e)return nothing;
  return html`<div class="integration-info" aria-label=${e.name}><div class="extension-status">
   <span class="extension-badge ${e.installed?'ok':'none'}">${e.installed?'Installée':'Pas installée'}</span>
   ${e.configured?html`<span class="extension-badge ok">Configurée pour ce lieu</span>`:nothing}
   ${!e.installed||!available?html`<button class="link" ?disabled=${this.busy} aria-expanded=${this.extensionId===e.id?'true':'false'} @click=${()=>{this.extensionId=this.extensionId===e.id?'':e.id;}}>${e.installed?'Configurer dans Home Assistant':'Comment l’installer'}</button>`:nothing}</div>
   ${this.extensionId===e.id?html`<div class="extension-detail"><p>${e.install}</p><div class="actions">${e.url?html`<a href=${e.url} target="_blank" rel="noreferrer">Voir l’intégration ${e.name}</a>`:nothing}<a href="/config/integrations" target="_blank" rel="noreferrer">Appareils et services</a></div><p class="hint">Après l’ajout dans Home Assistant, actualisez la détection dans cet onglet.</p></div>`:nothing}
  </div>`;
 }
 private refreshSources(){return html`<button class="link" ?disabled=${this.busy} @click=${()=>void this.change({op:'redetect',value:'weather'})}>Actualiser la détection</button>`;}
 private field(f:Field):TemplateResult{
  const origin=provenance(f.key,f.value,this.savedOptions,this.touched);
  return html`<div class="field nk-setting-row"><div class="field-top"><h3 id=${'l-'+f.key}>${f.label}</h3><span>${f.need}</span>${f.help?helpTip(f.label,f.help):nothing}</div>
   <select aria-labelledby=${'l-'+f.key} ?disabled=${this.busy} @change=${(e:Event)=>this.set(f.key,(e.target as HTMLSelectElement).value)}>
    <option value="" ?selected=${!f.value}>${f.options.length?'— Aucun —':'— Aucun capteur trouvé —'}</option>
    ${grouped(f).map(g=>{const items=g.options.map(o=>html`<option value=${o.id} ?selected=${o.id===f.value}>${o.name}${o.state?` · ${o.state}`:''}</option>`);
     return g.label?html`<optgroup label=${g.label}>${items}</optgroup>`:items;})}
   </select>
   ${f.entity?html`<p class="provenance">${entityLine(f.entity)}</p>`:nothing}
   ${origin?html`<p class="provenance">${origin}</p>`:nothing}
   ${f.warning?html`<p class="warn">${f.warning}</p>`:nothing}
   ${f.better?html`<button class="link" ?disabled=${this.busy} @click=${()=>this.set(f.key,f.better!.id)}>Choisir « ${f.better.name} » à la place</button>`:nothing}</div>`;
 }
 // What the step is for, in a frame that folds and stays folded.
 private intro(){return html`<div class="nk-step-help">${helpTip('Comprendre cette étape',html`<ul>${intros[this.stage].map(line=>html`<li>${line}</li>`)}</ul>`,'À quoi sert cette étape ?')}</div>`;}

 private zone(id:string,label:string,areas:Choice[],value:string,pick:(v:string)=>void){
  return html`<div class="field"><div class="field-top"><h3 id=${id}>${label}</h3></div>
   <select aria-labelledby=${id} ?disabled=${this.busy} @change=${(e:Event)=>pick((e.target as HTMLSelectElement).value)}>
    ${areas.map(x=>html`<option value=${x.value} ?selected=${x.value===value}>${x.label}</option>`)}</select></div>`;
 }
 private bottom(next?:TemplateResult){
  if(this.entryId&&!next)return html`<div class="bottom"><button ?disabled=${this.busy} @click=${()=>this.leave()}>Retour à la vue d’ensemble</button><button class="primary" ?disabled=${this.busy||!this.draft?.weather_entity} @click=${()=>void this.save()}>Enregistrer</button></div>`;
  return html`<div class="bottom"><button ?disabled=${this.busy||this.stage===0} @click=${()=>this.go(order[Math.max(0,order.indexOf(this.stage)-1)])}>Retour</button>
   ${next??html`<button class="primary" ?disabled=${this.busy} @click=${()=>this.go(order[Math.min(order.indexOf(this.stage)+1,order.length-1)])}>Continuer</button>`}</div>`;
 }

 // ---- The steps ----
 private prevision(v:View){const p=v.prevision;
  return html`${frame('Prévisions du lieu',html`<h3>Météo-France</h3>${this.integrationInfo(v.extensions?.find(e=>e.id==='meteo_france'))}${this.field(p.fields[0])}
   <div class="field nk-setting-row"><div class="field-top"><h3 id="l-location">Nom du lieu</h3><span>Facultatif</span>${helpTip('Nom du lieu','Affiché en tête de la carte. Vide : le nom vient du service météo.')}</div>
    <input aria-labelledby="l-location" .value=${p.location} placeholder=${p.location_placeholder} ?disabled=${this.busy} @change=${(e:Event)=>this.set('location',(e.target as HTMLInputElement).value.trim())}></div>`,{className:'nk-field-section nk-plain'})}
   ${frame('Alertes et saison',html`${p.fields.slice(1).filter(f=>!['water_restriction_entity','lightning_entity'].includes(f.key)).map(f=>this.field(f))}`,{className:'nk-field-section nk-plain'})}
   ${frame('Orages et éclairs',html`<h3>Blitzortung</h3>${this.integrationInfo(v.extensions?.find(e=>e.id==='blitzortung'),!!p.fields.find(f=>f.key==='lightning_entity')?.options.length)}${p.fields.filter(f=>f.key==='lightning_entity').map(f=>this.field(f))}`,{className:'nk-field-section nk-plain'})}
   ${this.refreshSources()}
   ${frame('Réglages avancés',html`${helpTip('Soleil et prévisions','Laissés vides, Niak prend le soleil de Home Assistant.')}${p.advanced.map(f=>this.field(f))}
    <div class="field nk-setting-row"><div class="field-top"><h3 id="l-source">Nom de la source des prévisions</h3><span>Facultatif</span></div><input aria-labelledby="l-source" .value=${p.forecast_source} ?disabled=${this.busy} @change=${(e:Event)=>this.set('forecast_source',(e.target as HTMLInputElement).value.trim())}></div>`,{collapsible:true,open:false})}${this.bottom()}`;
 }
 private station(v:View){const s=v.station;
  return html`${frame('Votre station',html`${s.model!==NONE?html`<p class="hint">Reconnue : ${s.profile}</p>`:nothing}
   ${this.choiceList('model',s.models,s.model,m=>void this.change({op:'station',value:m}))}
   ${s.model!==NONE?html`<div class="field nk-setting-row"><div class="field-top"><h3 id="l-device">Appareil</h3><span>Facultatif</span>${helpTip('Appareil de la station','Limite les capteurs proposés à cet appareil.')}</div>
    <select aria-labelledby="l-device" ?disabled=${this.busy} @change=${(e:Event)=>void this.change({op:'device',value:(e.target as HTMLSelectElement).value})}>${s.devices.map(d=>html`<option value=${d.value} ?selected=${d.value===s.device}>${d.label}</option>`)}</select></div>`:nothing}`,{className:'nk-field-section nk-plain'})}
   ${s.model===NONE?html`<p class="muted">Sans station, Niak Weather s’appuie sur le service météo seul : pas de pluie mesurée, pas d’alerte de la station.</p>`:html`
    ${s.groups.map((g,i)=>frame(g.title,html`${g.fields.map(f=>this.field(f))}`,{count:`${g.fields.filter(f=>f.value).length} sur ${g.fields.length}${g.fields.some(f=>f.warning)?' · à vérifier':''}`,className:i<3||g.fields.some(f=>f.warning)?'nk-field-section nk-plain':'',collapsible:i>=3&&!g.fields.some(f=>f.warning),open:false}))}
    ${frame('Historique de la station',html`<label class="check"><input type="checkbox" .checked=${s.history} ?disabled=${this.busy} @change=${(e:Event)=>this.set('station_history',(e.target as HTMLInputElement).checked)}><span><strong>Calculer depuis l’historique</strong></span></label>${helpTip('Calculer depuis l’historique',s.history_help,'Comprendre ce réglage')}`,{className:'nk-field-section nk-plain'})}
    <button class="link" ?disabled=${this.busy} @click=${()=>void this.change({op:'redetect',value:'station'})}>Rechercher à nouveau les capteurs</button>`}${this.bottom()}`;
 }
 private air(v:View){const a=v.air;
  return html`${frame('Source de qualité de l’air',html`${this.choiceList('air',a.sources,a.value,x=>void this.change({op:'air',value:x}),extensionGroups(v.extensions??[]).find(g=>g.key==='air')?.items)}
   ${a.value==='atmo'&&a.areas.length?this.zone('l-aarea','Zone Atmo France',a.areas,a.area,x=>void this.change({op:'air',value:'atmo',area:x})):nothing}
   ${a.value==='waqi'&&a.stations.length?this.zone('l-astation','Station WAQI',a.stations,a.station,x=>void this.change({op:'air',value:'waqi',area:x})):nothing}`,{className:'nk-field-section nk-plain'})}${this.refreshSources()}${this.bottom()}`;
 }
 private pollen(v:View){
  const p=v.pollen;const chosen=p.species.filter(s=>s.chosen).map(s=>s.id);
  const toggle=(id:string,on:boolean)=>void this.change({op:'pollens',value:on?[...chosen,id]:chosen.filter(x=>x!==id)});
  return html`${frame('Source des pollens',html`${this.choiceList('pollen',p.sources,p.value,x=>void this.change({op:'pollen',value:x}),extensionGroups(v.extensions??[]).find(g=>g.key==='pollen')?.items)}
   ${p.value==='atmo'&&p.areas.length?this.zone('l-parea','Zone Atmo France des pollens',p.areas,p.area,x=>void this.change({op:'pollen',value:'atmo',area:x})):nothing}
   ${p.value==='swiss_pollen'&&p.stations.length?html`${this.zone('l-pstation','Station Swiss Pollen',p.station?p.stations:[{value:'',label:'Choisir une station…'},...p.stations],p.station,x=>void this.change({op:'pollen_station',value:x}))}
    <p class="hint">Mesures actuelles, sans prévision pour demain. Les niveaux d’une station hors service restent indisponibles.</p>`:nothing}
   ${p.value==='kleenex_pollenradar'&&p.stations.length?html`${this.zone('l-kplace','Lieu Kleenex / Scottex',p.station?p.stations:[{value:'',label:'Choisir un lieu…'},...p.stations],p.station,x=>void this.change({op:'pollen_station',value:x}))}
    <p class="hint">Niveaux de faible à très élevé, aujourd’hui et demain. Les données trop anciennes restent indisponibles.</p>`:nothing}
   `,{className:'nk-field-section nk-plain'})}
   ${p.species.length?frame(p.value==='kleenex_pollenradar'?'Espèces et groupes suivis':'Espèces suivies',html`${helpTip('Espèces suivies','Tous les capteurs trouvés pour ce lieu sont proposés ; décochez ceux qui ne vous concernent pas.')}
    ${p.species.map(s=>html`<label class="check"><input type="checkbox" .checked=${s.chosen} ?disabled=${this.busy} @change=${(e:Event)=>toggle(s.id,(e.target as HTMLInputElement).checked)}>
     <span>${s.label} <span class="hint inline">· ${s.state||'indisponible'}</span>${s.chosen&&!s.available?html`<span class="warn">Ne répond pas pour l’instant (hors saison ?).</span>`:nothing}</span></label>`)}`,{className:'nk-field-section nk-plain'}):nothing}
   ${p.risk?frame(p.risk.label,html`${this.field(p.risk)}`,{className:'nk-field-section nk-plain'}):nothing}
   ${this.refreshSources()}${this.bottom()}`;
 }
 private entities(v:View){
  const e=v.entities;
  if(e.new){
   const chosen=e.families.filter(f=>f.chosen).map(f=>f.key);
   return html`<p class="muted">Choisissez les familles à créer ; vous pourrez ensuite régler leurs entités une par une.</p>
    ${frame('Familles d’entités',html`${e.families.map(f=>html`<label class="check"><input type="checkbox" .checked=${!!f.chosen} ?disabled=${this.busy}
     @change=${(ev:Event)=>void this.change({op:'families',value:(ev.target as HTMLInputElement).checked?[...chosen,f.key]:chosen.filter(x=>x!==f.key)})}>
     <span><strong>${f.name}</strong>${f.hint?html`<span class="hint">${f.hint}</span>`:nothing}</span></label>`)}`,{className:'nk-field-section nk-plain'})}${this.bottom()}`;
  }
  const flip=(key:string,on:boolean)=>{this.enabled=on?[...this.enabled,key]:this.enabled.filter(k=>k!==key);};
  return html`<p class="muted">Une entité décochée disparaît de Home Assistant.</p>
   ${e.families.map(f=>{const items=f.entities??[];const on=items.filter(i=>this.enabled.includes(i.key)).length;
    return frame(f.name,html`
     ${items.map(i=>html`<label class="check"><input type="checkbox" .checked=${this.enabled.includes(i.key)} @change=${(ev:Event)=>flip(i.key,(ev.target as HTMLInputElement).checked)}>
      <span>${i.name}${i.hint?html`<span class="hint">${i.hint}</span>`:nothing}${i.need?html`<span class=${i.optional?'hint':'warn'}>${i.need}</span>`:nothing}</span></label>`)}`,{count:`${on} sur ${items.length}`,className:'nk-field-section nk-plain'});})}
   ${this.bottom()}`;
 }
 private water(v:View){return html`${frame('Restrictions d’eau',html`<h3>Vigieau</h3>${this.integrationInfo(v.extensions?.find(e=>e.id==='vigieau'),!!v.prevision.fields.find(f=>f.key==='water_restriction_entity')?.options.length)}
  ${v.prevision.fields.filter(f=>f.key==='water_restriction_entity').map(f=>this.field(f))}`,{className:'nk-field-section nk-plain'})}${this.refreshSources()}${this.bottom()}`;}
 private recap(v:View){
  const added=this.enabled.filter(k=>!this.initialEnabled.includes(k)).length,removed=this.initialEnabled.filter(k=>!this.enabled.includes(k)).length;
  const change=[added?`${added} de plus`:'',removed?`${removed} de moins`:''].filter(Boolean).join(', ');
  const entities=v.entities.new?v.entities.families.filter(f=>f.chosen).map(f=>f.name).join(', ')||'aucune famille'
   :`${this.enabled.length} actives`+(change?` (${change} qu’avant)`:'');
  return html`${frame('Configuration du lieu',html`<dl class="summary">
    <dt>Sources météo</dt><dd>${v.summary.weather} · « ${v.title} »</dd>
    <dt>Station météo</dt><dd>${v.summary.station}${v.station.model!==NONE?(v.station.history?' · historique calculé':' · sans historique'):''}</dd>
    <dt>Qualité de l’air</dt><dd>${capital(v.summary.air)}</dd>
    <dt>Pollens</dt><dd>${capital(v.summary.pollen)}</dd>
    <dt>Eau et jardin</dt><dd>${v.prevision.fields.find(f=>f.key==='water_restriction_entity')?.entity?.name||v.prevision.fields.find(f=>f.key==='water_restriction_entity')?.value||'Non configuré'}</dd>
    <dt>Orages et éclairs</dt><dd>${v.prevision.fields.find(f=>f.key==='lightning_entity')?.entity?.name||v.prevision.fields.find(f=>f.key==='lightning_entity')?.value||'Non configuré'}</dd>
    <dt>Entités</dt><dd>${entities}</dd></dl>`)}
   ${v.needs.length?html`${frame('À savoir',html`<ul>${v.needs.map(n=>html`<li class="warn">${n}. L’entité restera vide.</li>`)}</ul>`)}`:nothing}
   <p class="notice">${this.entryId?'En enregistrant, le lieu redémarre avec ses nouveaux réglages : la carte se met à jour quelques secondes plus tard.':'En enregistrant, Niak Weather crée ce lieu et ses entités.'}</p>
   ${this.bottom(html`<div class="end"><button ?disabled=${this.busy} @click=${()=>this.leave()}>Abandonner</button>
    <button class="primary" ?disabled=${this.busy||!this.draft?.weather_entity} @click=${()=>void this.save()}>${this.entryId?'Enregistrer':'Créer ce lieu'}</button></div>`)}`;
 }

 // ---- Pages ----
 private home(){
  const p=this.places!,parts=(this.route?.path??'').split('/').filter(Boolean);
  const choosing=parts[0]==='reglages'||(categories.includes(parts[0])||parts[0]==='extensions'),stage=sectionStage(parts[0]==='reglages'?(parts[1]??'sources'):parts[0]);
  return html`<main><div class="technical-top"><div><h1>${choosing?'Réglages généraux':'Météo'}</h1><p class="muted">${choosing?'Choisissez le lieu à configurer.':'État de Weather, extensions et configuration de vos lieux.'}</p></div>
   ${!choosing&&p.places.length?html`<button class="link" ?disabled=${this.busy} @click=${()=>void this.load()}>Actualiser le bilan</button>`:nothing}</div>
   ${this.saved?html`<p class="notice" role="status">${this.saved}</p>`:nothing}
   ${p.places.length?p.places.map(place=>choosing?frame(place.title,html`<p class="muted">${place.health.summary}</p><button ?disabled=${this.busy} @click=${()=>void this.open(place.entry_id,stage>=0?stage:0)}>Configurer le lieu</button>`):this.place(place)):frame('Votre lieu météo',html`
    <p class="muted">Configurez votre lieu pour suivre ici les sources, les capteurs et les données disponibles.</p>
    ${p.can_add?html`<button class="primary" ?disabled=${this.busy} @click=${()=>void this.open(null)}>Configurer mon lieu</button>`:html`<p class="warn">Aucun service météo dans Home Assistant : installez Météo-France dans Appareils et services, puis revenez ici.</p>`}`)}
   ${p.places.length&&p.can_add?html`<div class="footer"><button class="link" ?disabled=${this.busy} @click=${()=>void this.open(null)}>Ajouter un lieu</button></div>`:nothing}</main>`;
 }
 // One line of a frame: its state, what it means, and the step of the assistant that changes it.
 private line(entryId:string,l:Line){
  return html`<li class=${l.level}><span class="dot"></span><div><strong>${l.text}</strong>${l.why?html`<span class="why">${l.why}</span>`:nothing}</div>
   ${l.stage!==null&&l.stage!==undefined?html`<button class="link go" ?disabled=${this.busy} @click=${()=>void this.open(entryId,l.stage!)}>${stages[l.stage]}</button>`:nothing}</li>`;
 }
 private place(p:Place){
  const h=p.health,t=h.technical,station=t?.station,entities=t?.entities,extensions=p.extensions;
  const row=(label:string,text:string,level='none')=>html`<div class="technical-row"><strong>${label}</strong><span class=${level}>${text}</span></div>`;
  const config=(stage:number)=>html`<button ?disabled=${this.busy} @click=${()=>void this.open(p.entry_id,stage)}>${stages[stage]}</button>`;
  const badge=(e:Extension)=>html`<span class="extension-badge ${e.configured&&!e.installed?'bad':e.configured?'ok':'none'}">${e.configured?(e.installed?'Configurée':'Configurée · absente'):e.installed?'Installée · non utilisée':'Pas installée'}</span>`;
  const version=t?.integration||h.versions.find(v=>v.text.startsWith('Intégration '))?.text.replace(/^Intégration /,'');
  const card=h.versions.find(v=>v.text.startsWith('Carte '));
  const level=p.failed?'bad':!p.loaded?'none':h.level==='ok'?'ok':'bad';
  return html`<section class="technical-place" aria-labelledby=${'p-'+p.entry_id}>
   <div class="head"><div><h2 id=${'p-'+p.entry_id}>${p.title}</h2><p class="state ${level}"><span class="dot"></span>${p.failed?'Démarrage en échec':!p.loaded?'Redémarrage en cours':h.todo.length?'Fonctionnement à vérifier':'En fonctionnement'}${p.loaded?html`<span class="muted"> · ${h.todo.length?`${h.todo.length} point${h.todo.length>1?'s':''} à régler`:'aucun problème détecté'}</span>`:nothing}</p></div>
    <button ?disabled=${this.busy} @click=${()=>void this.open(p.entry_id,0)}>Réglages généraux</button></div>
   ${h.todo.length?frame('À corriger',html`<ul class="lines">${h.todo.map(l=>this.line(p.entry_id,l))}</ul>`,{className:'todo'}):nothing}
   <div class="dashboard-main">
    ${frame('État de Weather',html`${row('Lieu',p.loaded?'Chargé':p.failed?'En échec':'En cours de chargement',p.loaded?'ok':p.failed?'bad':'none')}
     ${h.sources.filter(x=>['Prévisions','Vigilance'].includes(x.label)).map(x=>row(x.label,x.text,x.level))}
     ${row('Dernier calcul',t?.computation??'Non disponible',t?.computation?'ok':'none')}
     ${row('Station',station?.name||'Non configurée')}
     ${row('Historique',!station?.name?'Sans station':!station.history?'Désactivé':station.history_sources==null?'Non disponible':`${station.history_sources} source${station.history_sources>1?'s':''} avec des données`)}`)}
    ${frame('Statistiques',html`<dl class="dashboard-stats">
     <div><dt>Capteurs de station qui répondent</dt><dd>${station?.configured?`${station.responding} / ${station.configured}`:'—'}</dd></div>
     <div><dt>Entités activées</dt><dd>${entities?`${entities.active} / ${entities.total}`:'—'}</dd></div>
     <div><dt>Entités actives avec une valeur</dt><dd>${entities?`${entities.with_value} / ${entities.active}`:'—'}</dd></div>
     <div><dt>Créneaux horaires reçus</dt><dd>${t?.forecast.hours??'—'}</dd></div>
     <div><dt>Prévisions quotidiennes reçues</dt><dd>${t?.forecast.days==null?'—':`${t.forecast.days} jour${t.forecast.days>1?'s':''}`}</dd></div>
    </dl>`)}
   </div>
   ${frame('Extensions',html`${extensions?html`<p class="hint extension-summary">${extensions.filter(e=>e.installed).length} / ${extensions.length} installées dans Home Assistant · ${extensions.filter(e=>e.configured).length} configurée${extensions.filter(e=>e.configured).length>1?'s':''} pour ce lieu</p>
    <div class="extension-overview">${extensionGroups(extensions).map(group=>html`<div class="extension-overview-group"><h3>${group.label}</h3><ul>${group.items.map(e=>html`<li><span>${e.name}</span>${badge(e)}</li>`)}</ul></div>`)}</div>`:html`<p class="muted">État des extensions non reçu. Actualisez le bilan.</p>`}
    <button class="link" ?disabled=${this.busy} @click=${()=>void this.open(p.entry_id,0)}>Configurer les sources →</button>`,{className:'overview-extensions'})}
   ${frame('Configuration',html`<nav class="dashboard-config" aria-label=${'Configuration de '+p.title}>${[0,1,2,3,6,4].map(config)}</nav>`)}
   ${frame('Versions et liens',html`<div class="dashboard-main dashboard-meta"><div>
     ${row('Intégration',version||'Version non reçue')}
     ${card?row('Carte',card.text.replace(/^Carte /,'')+' · '+card.why,card.level):nothing}
     ${row('API',t?`niak_weather_api v${t.interface_version}`:'Version non reçue')}
     ${row('Liaisons',t?.links.length?t.links.join(' · '):'Aucune brique reliée')}
    </div><nav class="dashboard-links" aria-label="Liens utiles">
     <a href="/config/integrations/integration/niak_weather">Intégration Home Assistant</a>
     <a href="/config/logs">Journaux Home Assistant</a>
     <a href="https://github.com/Niakman13/niak-weather-integration#readme" target="_blank" rel="noreferrer">Documentation</a>
     <a href="https://github.com/Niakman13/niak-weather-integration/releases" target="_blank" rel="noreferrer">Versions publiées</a>
     <a href="https://github.com/Niakman13/niak-weather-integration/issues" target="_blank" rel="noreferrer">Signaler un problème</a>
    </nav></div>`)}
   ${h.sensors.length?frame('Détail des capteurs',html`<ul class="sensors">${h.sensors.map(x=>html`<li class=${x.level}><span class="dot"></span><span title=${x.name}>${x.label}</span><span class="v">${x.text}</span></li>`)}</ul>`,{collapsible:true,open:false,count:h.sensors.length}):nothing}
   ${h.tips.length?frame('Possibilités d’amélioration',html`<ul class="lines">${h.tips.map(l=>this.line(p.entry_id,l))}</ul>`,{count:h.tips.length,collapsible:true,open:false}):nothing}
   </section>`;
 }
 private editor(){
  const v=this.view!;
  const body=[this.prevision,this.station,this.air,this.pollen,this.entities,this.recap,this.water][this.stage].call(this,v);
  return html`<main><button class="link" @click=${()=>this.leave()}>← Vue d’ensemble Météo</button>
   ${this.confirmLeave?html`<div class="notice" role="alert"><p>Vos changements ne sont pas enregistrés.</p><div class="actions">
    <button @click=${()=>{this.confirmLeave=false;}}>Continuer à modifier</button><button @click=${()=>this.close()}>Abandonner les changements</button></div></div>`:nothing}
   <div class="workspace-head"><h1>${this.entryId?'Réglages généraux':'Nouveau lieu'}</h1><p class="step-count">Les réglages de ce lieu météo</p></div>
   <div class="place-context"><span>Lieu météo : <strong>${this.placeTitle||v.title}</strong></span></div>
   <nav class="room-menu" aria-label="Configuration météo">${[sections.slice(0,3),sections.slice(3)].map(row=>html`<div class="room-menu-row">${row.map(x=>html`<button aria-label=${stages[x.stage]} title=${stages[x.stage]} aria-current=${x.stage===this.stage?'page':nothing} ?disabled=${this.busy} @click=${()=>this.go(x.stage)}>${hubIcon(x.icon)}<span>${x.label}</span></button>`)}</div>`)}</nav>
   <button class="link configuration-recap" aria-current=${this.stage===5?'page':nothing} ?disabled=${this.busy} @click=${()=>this.go(5)}>Récapitulatif</button>
   ${this.error?html`<p class="notice error" role="alert">${this.error}</p>`:nothing}
   <div class="room-content-head"><h2>${stages[this.stage]}</h2></div>${this.intro()}${body}</main>${this.busy?html`<p class="busy" role="status">Un instant…</p>`:nothing}`;
 }
 protected render(){
  if(this.editing&&this.view)return this.editor();
  if(this.error&&!this.places)return html`<main><p class="notice error" role="alert">${this.error}</p><button @click=${()=>{this.error='';void this.load();}}>Réessayer</button></main>`;
  if(!this.places)return html`<main><p class="muted" role="status">Chargement…</p></main>`;
  return html`${this.error?html`<main><p class="notice error" role="alert">${this.error}</p></main>`:nothing}${this.home()}`;
 }
}
