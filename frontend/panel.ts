// The « Météo » tab of the shared « Niak » panel: each place's settings, step by step, then saved at once.
// Niak Weather computes everything (draft.py): this page shows the draft, sends each change and saves it.
import {LitElement,html,unsafeCSS,nothing,type TemplateResult,type PropertyValues} from 'lit';
import {customElement,property,state} from 'lit/decorators.js';
import styles from './styles.css';
import {frame,hubStyles,modernStyles,hubIcon,helpTip} from './socle/ui';
import {NONE,stages,intros,extensionGroups,enabledKeys,provenance,sameSet,entityLine,grouped,capital,type Change,type Choice,type DraftReply,type Field,type Hass,type Line,type Place,type Places,type Sources,type View,type Extension} from './model';

const categories=['sources','station','air','pollens','entites','recapitulatif','extensions'];

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
 @state() private allSensors='';
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
  const parts=path.split('/').filter(Boolean),section=parts[0]==='reglages'?(parts[1]??'extensions'):parts[0],id=parts[0]==='reglages'?parts[2]:parts[1],stage=categories.indexOf(section);this.remember();
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
 private choiceList(name:string,choices:Choice[],value:string,pick:(v:string)=>void){
  return html`<div role="radiogroup" aria-label=${({model:'Modèle de station',air:'Source de qualité de l’air',pollen:'Source des pollens'} as Record<string,string>)[name]??name}>${choices.map(c=>html`<label class="choice ${c.value===value?'on':''} ${c.available===false?'off':''}">
   <input type="radio" name=${name} .checked=${c.value===value} ?disabled=${c.available===false||this.busy} @change=${()=>pick(c.value)}>
   <span><strong>${c.label}</strong>${c.available===false?html`<span>Pas encore installée</span>`:c.hint?html`<span>${c.hint}</span>`:nothing}</span></label>`)}</div>`;
 }
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
  return html`<div class="bottom"><button ?disabled=${this.busy||this.stage===0} @click=${()=>this.go(this.stage-1)}>Retour</button>
   ${next??html`<button class="primary" ?disabled=${this.busy} @click=${()=>this.go(this.stage===6?0:this.stage+1)}>Continuer</button>`}</div>`;
 }

 // ---- The steps ----
 private prevision(v:View){const p=v.prevision;
  return html`${frame('Prévisions du lieu',html`${this.field(p.fields[0])}
   <div class="field nk-setting-row"><div class="field-top"><h3 id="l-location">Nom du lieu</h3><span>Facultatif</span>${helpTip('Nom du lieu','Affiché en tête de la carte. Vide : le nom vient du service météo.')}</div>
    <input aria-labelledby="l-location" .value=${p.location} placeholder=${p.location_placeholder} ?disabled=${this.busy} @change=${(e:Event)=>this.set('location',(e.target as HTMLInputElement).value.trim())}></div>`,{className:'nk-field-section nk-plain'})}
   ${frame('Alertes et saison',html`${p.fields.slice(1).filter(f=>!['water_restriction_entity','lightning_entity'].includes(f.key)).map(f=>this.field(f))}`,{className:'nk-field-section nk-plain'})}
   <button class="link" ?disabled=${this.busy} @click=${()=>void this.change({op:'redetect',value:'weather'})}>Rechercher à nouveau</button>
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
  return html`${frame('Source de qualité de l’air',html`${this.choiceList('air',a.sources,a.value,x=>void this.change({op:'air',value:x}))}
   ${a.areas.length||a.value==='waqi'?nothing:html`<p class="notice">Atmo France n’est pas encore installée : <a href="https://github.com/sebcaps/atmofrance" target="_blank" rel="noreferrer">installer l’intégration Atmo France</a>, puis revenez ici.</p>`}
   ${a.stations.length||a.value==='atmo'?nothing:html`<p class="notice">WAQI n’est pas encore installée : créez un jeton gratuit sur <a href="https://aqicn.org/data-platform/token/" target="_blank" rel="noreferrer">aqicn.org</a>, puis ajoutez l’intégration « World Air Quality Index » dans Paramètres → Appareils et services.</p>`}
   ${a.value==='atmo'&&a.areas.length?this.zone('l-aarea','Zone Atmo France',a.areas,a.area,x=>void this.change({op:'air',value:'atmo',area:x})):nothing}
   ${a.value==='waqi'&&a.stations.length?this.zone('l-astation','Station WAQI',a.stations,a.station,x=>void this.change({op:'air',value:'waqi',area:x})):nothing}`,{className:'nk-field-section nk-plain'})}${this.bottom()}`;
 }
 private pollen(v:View){
  const p=v.pollen;const chosen=p.species.filter(s=>s.chosen).map(s=>s.id);
  const toggle=(id:string,on:boolean)=>void this.change({op:'pollens',value:on?[...chosen,id]:chosen.filter(x=>x!==id)});
  return html`${frame('Source des pollens',html`${this.choiceList('pollen',p.sources,p.value,x=>void this.change({op:'pollen',value:x}))}
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
   ${this.bottom()}`;
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
 private extensionRows(items:Extension[],entryId?:string):TemplateResult{
  const row=(e:Extension)=>html`<section class="extension-row" aria-label=${e.name}><div><h3>${e.name}</h3><p>${e.description}</p><div class="extension-status">
   <span class="extension-badge ${e.installed?'ok':'none'}">${e.installed?'Installée':'Pas installée'}</span>
   ${e.configured?html`<span class="extension-badge ok">Configurée</span>`:e.installed?html`<span class="extension-badge bad">À configurer</span>`:nothing}</div></div>
   <button ?disabled=${this.busy} @click=${()=>{this.extensionId=e.id;if(entryId)void this.open(entryId,6);else if(e.installed&&!e.field)this.go(e.stage);}}>${e.configured?'Modifier':e.installed?'Configurer':'Comment l’installer'}</button>
   ${!entryId&&this.extensionId===e.id?html`<div class="extension-detail"><h3>${e.installed?'Configurer':'Installer'} ${e.name}</h3>
    ${!e.installed||e.field&&!this.view?.prevision.fields.find(f=>f.key===e.field)?.options.length?html`<p>${e.install}</p><p class="hint">Après l’ajout dans Home Assistant, revenez ici puis actualisez la détection.</p>
     <div class="actions">${e.url?html`<a href=${e.url} target="_blank" rel="noreferrer">Voir l’intégration ${e.name}</a>`:nothing}<a href="/config/integrations" target="_blank" rel="noreferrer">Appareils et services</a></div>`:nothing}
    ${e.field?this.view?.prevision.fields.filter(f=>f.key===e.field).map(f=>this.field(f)):e.installed?html`<button class="link" @click=${()=>this.go(e.stage)}>Choisir les données de ${e.name} →</button>`:nothing}
   </div>`:nothing}</section>`;
  return html`${extensionGroups(items).map(group=>html`<details class="extension-category" ?open=${group.items.some(e=>e.id===this.extensionId)}>
   <summary><span>${group.label}</span><span class="category-count">${group.items.filter(e=>e.configured).length} configurée${group.items.filter(e=>e.configured).length>1?'s':''} · ${group.items.length} disponible${group.items.length>1?'s':''}</span></summary>
   ${group.items.map(row)}</details>`)}`;
 }
 private extensions(v:View){return html`${frame('Extensions météo',html`<p class="muted">Installez une intégration dans Home Assistant, puis choisissez les données que Niak Weather utilisera pour ce lieu.</p>
  ${this.extensionRows(v.extensions??[])}
  <button class="link" ?disabled=${this.busy} @click=${()=>void this.change({op:'redetect',value:'weather'})}>Actualiser la détection des extensions</button>`,{className:'extensions-frame'})}${this.bottom()}`;}
 private recap(v:View){
  const added=this.enabled.filter(k=>!this.initialEnabled.includes(k)).length,removed=this.initialEnabled.filter(k=>!this.enabled.includes(k)).length;
  const change=[added?`${added} de plus`:'',removed?`${removed} de moins`:''].filter(Boolean).join(', ');
  const entities=v.entities.new?v.entities.families.filter(f=>f.chosen).map(f=>f.name).join(', ')||'aucune famille'
   :`${this.enabled.length} actives`+(change?` (${change} qu’avant)`:'');
  return html`${frame('Récapitulatif',html`<dl class="summary">
    <dt>Sources météo</dt><dd>${v.summary.weather} · « ${v.title} »</dd>
    <dt>Station météo</dt><dd>${v.summary.station}${v.station.model!==NONE?(v.station.history?' · historique calculé':' · sans historique'):''}</dd>
    <dt>Qualité de l’air</dt><dd>${capital(v.summary.air)}</dd>
    <dt>Pollens</dt><dd>${capital(v.summary.pollen)}</dd>
    <dt>Entités</dt><dd>${entities}</dd></dl>`)}
   ${v.needs.length?html`${frame('À savoir',html`<ul>${v.needs.map(n=>html`<li class="warn">${n}. L’entité restera vide.</li>`)}</ul>`)}`:nothing}
   <p class="notice">${this.entryId?'En enregistrant, le lieu redémarre avec ses nouveaux réglages : la carte se met à jour quelques secondes plus tard.':'En enregistrant, Niak Weather crée ce lieu et ses entités.'}</p>
   ${this.bottom(html`<div class="end"><button ?disabled=${this.busy} @click=${()=>this.leave()}>Abandonner</button>
    <button class="primary" ?disabled=${this.busy||!this.draft?.weather_entity} @click=${()=>void this.save()}>${this.entryId?'Enregistrer':'Créer ce lieu'}</button></div>`)}`;
 }

 // ---- Pages ----
 private home(){
  const p=this.places!;
  return html`<main><h1>${(this.route?.path??'').startsWith('/reglages')?'Réglages généraux':'Vue d’ensemble'}</h1><p class="muted">${categories.includes((this.route?.path??'').split('/').filter(Boolean)[0])?'Choisissez le lieu à configurer : '+stages[categories.indexOf((this.route?.path??'').split('/').filter(Boolean)[0])]+'.':'Vos sources météo et les compléments disponibles pour votre maison.'}</p>
   ${this.saved?html`<p class="notice" role="status">${this.saved}</p>`:nothing}
   ${p.places.length?p.places.map(place=>this.place(place)):html`<h1>Ma météo</h1>
    ${frame('Votre lieu',html`<p class="muted">Niak Weather propose ce qu’il trouve dans Home Assistant ; vous vérifiez chaque étape avant de créer le lieu.</p>
     ${p.can_add?html`<button class="primary" ?disabled=${this.busy} @click=${()=>void this.open(null)}>Configurer mon lieu</button>`
      :html`<p class="warn">Aucun service météo dans Home Assistant : installez Météo-France (Paramètres → Appareils et services), puis revenez ici.</p>`}`,{className:''})}`}
   ${!p.places.length?frame('Extensions disponibles',html`<p class="muted">Créez votre lieu pour choisir les données des extensions.</p>${extensionGroups(p.extensions??[]).map(g=>html`<details class="extension-category"><summary>${g.label}</summary>${g.items.map(e=>html`<div class="extension-row"><div><h3>${e.name}</h3><p>${e.description}</p><span class="extension-badge ${e.installed?'ok':'none'}">${e.installed?'Installée':'Pas installée'}</span></div>${e.url?html`<a href=${e.url} target="_blank" rel="noreferrer">Installation</a>`:nothing}</div>`)}</details>`)}`):nothing}
   <div class="footer">${p.places.length&&p.can_add?html`<button class="link" ?disabled=${this.busy} @click=${()=>void this.open(null)}>Ajouter un lieu</button>`:nothing}
    <span class="hint">Les sources et entités se règlent dans Réglages généraux.</span></div></main>`;
 }
 // One line of a frame: its state, what it means, and the step of the assistant that changes it.
 private line(entryId:string,l:Line){
  return html`<li class=${l.level}><span class="dot"></span><div><strong>${l.text}</strong>${l.why?html`<span class="why">${l.why}</span>`:nothing}</div>
   ${l.stage!==null&&l.stage!==undefined?html`<button class="link go" ?disabled=${this.busy} @click=${()=>void this.open(entryId,l.stage!)}>${stages[l.stage]}</button>`:nothing}</li>`;
 }
 private place(p:Place){
  const category=categories.indexOf((this.route?.path??'').split('/').filter(Boolean)[0]);
  const h=p.health,all=this.allSensors===p.entry_id,sensors=all?h.sensors:h.sensors.slice(0,8);
  return html`<section class="place room-place" aria-labelledby=${'p-'+p.entry_id}>
   <div class="head"><div><h2 id=${'p-'+p.entry_id}>${p.title}</h2>
    <p class="state ${h.level==='ok'?'ok':'bad'}"><span class="dot"></span>${h.summary}${h.tips_summary?html`<span class="muted"> · ${h.tips_summary}</span>`:nothing}</p></div>
    <button class="primary" ?disabled=${this.busy} @click=${()=>void this.open(p.entry_id,category>=0?category:6)}>Configurer le lieu</button></div>
   ${!p.loaded&&!p.failed?html`<p class="notice" role="status">Le lieu redémarre…</p>`:nothing}
    ${h.todo.length?html`${frame('À régler',html`<ul class="lines">${h.todo.map(l=>this.line(p.entry_id,l))}</ul>`,{className:'wide todo'})}`:nothing}
    ${h.tips.length?html`${frame('À améliorer',html`<ul class="lines">${h.tips.map(l=>this.line(p.entry_id,l))}</ul>`,{className:'wide'})}`:nothing}
   ${frame('Extensions',html`<p class="muted">Ce qui est installé dans Home Assistant et configuré pour ce lieu.</p>${this.extensionRows(p.extensions??[],p.entry_id)}`,{className:'extensions-frame'})}
   <div class="actions"><button class="link" ?disabled=${this.busy} @click=${()=>void this.open(p.entry_id,4)}>Choisir les entités pour mes automatisations</button></div>
   <details class="health-details"><summary>Sources, conseils et état du lieu</summary><p class="legend"><span class="ok"><span class="dot"></span>fonctionne</span><span class="bad"><span class="dot"></span>à régler</span><span class="tip"><span class="dot"></span>à améliorer</span><span class="none"><span class="dot"></span>non utilisé</span></p>
   <div class="grid">
    ${frame('Sources',html`<ul class="lines">${h.sources.map(s=>html`<li class=${s.level}><span class="dot"></span><div><strong>${s.label}</strong><span class="why">${s.text}</span></div></li>`)}</ul>`,{className:''})}
    ${h.sensors.length?html`${frame('Capteurs de la station',html`
     <ul class="sensors">${sensors.map(s=>html`<li class=${s.level} title=${s.name}><span class="dot"></span><span>${s.label}</span><span class="v">${s.text}</span></li>`)}</ul>
     ${h.sensors.length>8?html`<button class="link" aria-expanded=${all?'true':'false'} @click=${()=>{this.allSensors=all?'':p.entry_id;}}>${all?'Masquer':`Voir les ${h.sensors.length} capteurs`}</button>`:nothing}`,{count:h.sensors.length,collapsible:true})}`:nothing}
    ${frame('Entités Niak Weather',html`<ul class="lines">${h.entities.map(l=>this.line(p.entry_id,{...l,stage:null}))}</ul>`,{className:''})}
    ${frame('Versions et liens',html`<ul class="lines">${h.versions.map(l=>this.line(p.entry_id,{...l,stage:null}))}</ul>`,{collapsible:true,open:false})}
   </div></details></section>`;
 }
 private editor(){
  const v=this.view!;
  const body=[this.prevision,this.station,this.air,this.pollen,this.entities,this.recap,this.extensions][this.stage].call(this,v);
  return html`<main><button class="link" @click=${()=>this.leave()}>← Vue d’ensemble Météo</button>
   ${this.confirmLeave?html`<div class="notice" role="alert"><p>Vos changements ne sont pas enregistrés.</p><div class="actions">
    <button @click=${()=>{this.confirmLeave=false;}}>Continuer à modifier</button><button @click=${()=>this.close()}>Abandonner les changements</button></div></div>`:nothing}
   <div class="workspace-head"><h1>${this.entryId?'Réglages généraux':'Nouveau lieu'}</h1><p class="step-count">Les réglages de ce lieu météo</p></div>
   <div class="place-context"><span>Lieu météo : <strong>${this.placeTitle||v.title}</strong></span></div>
   <nav class="steps config-tabs" aria-label="Configuration météo">${[6,0,1,2,3,4,5].map(i=>html`<button aria-current=${i===this.stage?'step':'false'} ?disabled=${this.busy} @click=${()=>this.go(i)}>${stages[i]}</button>`)}</nav>
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
