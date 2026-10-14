// The « Météo » tab of the shared « Niak » panel: each place's settings, step by step, then saved at once.
// Niak Weather computes everything (draft.py): this page shows the draft, sends each change and saves it.
import {LitElement,html,unsafeCSS,nothing,type TemplateResult} from 'lit';
import {customElement,property,state} from 'lit/decorators.js';
import styles from './styles.css';
import {NONE,stages,brickState,enabledKeys,provenance,sameSet,entityLine,grouped,capital,type Change,type Choice,type DraftReply,type Field,type Hass,type Place,type Places,type Sources,type View} from './model';

@customElement('niak-weather-setup')
export class WeatherSetup extends LitElement {
 static styles=unsafeCSS(styles);
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
 @state() private openEco='';
 @state() private placeTitle='';
 private initial='';
 private initialEnabled:string[]=[];
 private savedOptions?:Sources;
 private touched=new Set<string>();
 private generation=0;
 private beforeUnload=(e:BeforeUnloadEvent)=>{if(this.dirty()){e.preventDefault();e.returnValue='';}};
 connectedCallback(){super.connectedCallback();window.addEventListener('beforeunload',this.beforeUnload);}
 disconnectedCallback(){super.disconnectedCallback();window.removeEventListener('beforeunload',this.beforeUnload);}
 protected updated(){
  this.setAttribute('data-theme',this.hass?.themes?.darkMode===false?'light':'dark');
  if(this.hass&&!this.places&&!this.busy&&!this.error)void this.load();
 }
 private message(e:unknown){return typeof e==='object'&&e&&'message' in e?String((e as {message:unknown}).message):'Home Assistant ne répond pas. Réessayez.';}
 private async load(){
  this.busy=true;
  try{this.places=await this.hass!.callWS<Places>({type:'niak_weather/panel/places'});this.error='';}
  catch(e){this.error=this.message(e);}
  finally{this.busy=false;}
  // A place restarting after a save: look again in a moment, a few times at most.
  if(this.places?.places.some(p=>!p.loaded&&!p.failed)&&this.retries<10){this.retries++;setTimeout(()=>{if(!this.editing)void this.load();},2000);}
  else this.retries=0;
 }
 private retries=0;
 private dirty(){return !!this.draft&&(JSON.stringify(this.draft)!==this.initial||!sameSet(this.enabled,this.initialEnabled));}
 private top(){this.scrollTop=0;this.renderRoot.querySelector('main')?.scrollIntoView?.({block:'start'});}

 // ---- Opening, changing, saving ----
 private async open(entryId:string|null,stage=0){
  this.busy=true;this.error='';this.saved='';
  try{
   const reply=await this.hass!.callWS<DraftReply&{saved:Sources|null}>({type:'niak_weather/panel/open',...(entryId?{entry_id:entryId}:{})});
   this.placeTitle=this.places?.places.find(p=>p.entry_id===entryId)?.title??'';
   this.entryId=entryId;this.draft=reply.draft;this.view=reply.view;this.stage=stage;this.editing=true;this.touched=new Set();
   // Leaving asks first once something changed since opening; a new place always does.
   this.initial=entryId?JSON.stringify(reply.draft):'';
   this.savedOptions=reply.saved??undefined;
   this.enabled=enabledKeys(reply.view);this.initialEnabled=[...this.enabled];
   await this.updateComplete;this.top();
  }catch(e){this.error=this.message(e);}
  finally{this.busy=false;}
 }
 private async change(change:Change){
  if(!this.draft||this.busy)return;
  const generation=++this.generation;this.busy=true;this.error='';
  if(change.key)this.touched.add(change.key);
  try{
   const reply=await this.hass!.callWS<DraftReply>({type:'niak_weather/panel/change',draft:this.draft,change,...(this.entryId?{entry_id:this.entryId}:{})});
   if(generation!==this.generation)return;
   this.draft=reply.draft;this.view=reply.view;this.error=reply.error;
  }catch(e){this.error=this.message(e);}
  finally{if(generation===this.generation)this.busy=false;}
 }
 private set(key:string,value:unknown){void this.change({op:'set',key,value});}
 private async save(){
  if(!this.draft)return;
  this.busy=true;this.error='';
  try{
   await this.hass!.callWS({type:'niak_weather/panel/save',draft:this.draft,...(this.entryId?{entry_id:this.entryId,enabled:this.enabled}:{})});
   const title=this.view?.title??'',created=!this.entryId;
   this.close();
   this.saved=created?`${title} est créé : ses entités apparaissent dans quelques secondes.`
    :`${title} est enregistré : le lieu redémarre avec ses nouveaux réglages, la carte suit dans quelques secondes.`;
   this.places=undefined;
  }catch(e){this.error=this.message(e);}
  finally{this.busy=false;}
 }
 private close(){this.editing=false;this.draft=undefined;this.view=undefined;this.confirmLeave=false;this.error='';void this.updateComplete.then(()=>this.top());}
 private leave(){if(this.dirty()&&!this.confirmLeave){this.confirmLeave=true;return;}this.close();}
 private go(stage:number){this.stage=stage;void this.updateComplete.then(()=>this.top());}

 // ---- Pieces ----
 private choiceList(name:string,choices:Choice[],value:string,pick:(v:string)=>void){
  return html`<div role="radiogroup">${choices.map(c=>html`<label class="choice ${c.value===value?'on':''} ${c.available===false?'off':''}">
   <input type="radio" name=${name} .checked=${c.value===value} ?disabled=${c.available===false||this.busy} @change=${()=>pick(c.value)}>
   <span><strong>${c.label}</strong>${c.available===false?html`<span>Pas encore installée</span>`:c.hint?html`<span>${c.hint}</span>`:nothing}</span></label>`)}</div>`;
 }
 private field(f:Field):TemplateResult{
  const origin=provenance(f.key,f.value,this.savedOptions,this.touched);
  return html`<div class="field"><div class="field-top"><h3 id=${'l-'+f.key}>${f.label}</h3><span>${f.need}</span></div>
   ${f.help?html`<p class="hint">${f.help}</p>`:nothing}
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
 private bottom(next?:TemplateResult){
  return html`<div class="bottom"><button ?disabled=${this.busy||this.stage===0} @click=${()=>this.go(this.stage-1)}>Retour</button>
   ${next??html`<button class="primary" ?disabled=${this.busy} @click=${()=>this.go(this.stage+1)}>Continuer</button>`}</div>`;
 }

 // ---- The steps ----
 private prevision(v:View){
  const p=v.prevision;
  return html`${this.field(p.fields[0])}
   <div class="field"><div class="field-top"><h3 id="l-location">Nom du lieu</h3><span>Facultatif</span></div>
    <p class="hint">Affiché en tête de la carte. Vide : le nom vient du service météo.</p>
    <input aria-labelledby="l-location" .value=${p.location} placeholder=${p.location_placeholder} ?disabled=${this.busy}
     @change=${(e:Event)=>this.set('location',(e.target as HTMLInputElement).value.trim())}></div>
   ${p.fields.slice(1).map(f=>this.field(f))}
   <button class="link" ?disabled=${this.busy} @click=${()=>void this.change({op:'redetect',value:'weather'})}>Rechercher à nouveau</button>
   <details class="group"><summary><strong>Réglages avancés</strong><span class="hint">soleil, hauteur du soleil, nom de la source</span></summary>
    <p class="hint">Laissés vides, Niak prend le soleil de Home Assistant.</p>
    ${p.advanced.map(f=>this.field(f))}
    <div class="field"><div class="field-top"><h3 id="l-source">Nom de la source des prévisions</h3><span>Facultatif</span></div>
     <input aria-labelledby="l-source" .value=${p.forecast_source} ?disabled=${this.busy} @change=${(e:Event)=>this.set('forecast_source',(e.target as HTMLInputElement).value.trim())}></div>
   </details>${this.bottom()}`;
 }
 private station(v:View){
  const s=v.station;
  return html`<div class="field"><div class="field-top"><h3>Votre station</h3></div>
    ${s.model!==NONE?html`<p class="hint">Reconnue : ${s.profile}</p>`:nothing}
    ${this.choiceList('model',s.models,s.model,m=>void this.change({op:'station',value:m}))}</div>
   ${s.model===NONE?html`<p class="muted">Sans station, Niak Weather s’appuie sur le service météo seul : pas de pluie mesurée, pas d’alerte de la station.</p>`:html`
    <div class="field"><div class="field-top"><h3 id="l-device">Appareil</h3><span>Facultatif</span></div>
     <p class="hint">Limite les capteurs proposés à cet appareil.</p>
     <select aria-labelledby="l-device" ?disabled=${this.busy} @change=${(e:Event)=>void this.change({op:'device',value:(e.target as HTMLSelectElement).value})}>
      ${s.devices.map(d=>html`<option value=${d.value} ?selected=${d.value===s.device}>${d.label}</option>`)}</select></div>
    ${s.groups.map((g,i)=>html`<details class="group" ?open=${i<3||g.fields.some(f=>f.warning)}><summary><strong>${g.title}</strong>
      <span class="hint">${g.fields.filter(f=>f.value).length} sur ${g.fields.length}${g.fields.some(f=>f.warning)?html` · <span class="warn-inline">à vérifier</span>`:nothing}</span></summary>
     ${g.fields.map(f=>this.field(f))}</details>`)}
    <label class="check"><input type="checkbox" .checked=${s.history} ?disabled=${this.busy} @change=${(e:Event)=>this.set('station_history',(e.target as HTMLInputElement).checked)}>
     <span><strong>Calculer depuis l’historique</strong><span class="hint">${s.history_help}</span></span></label>
    <button class="link" ?disabled=${this.busy} @click=${()=>void this.change({op:'redetect',value:'station'})}>Rechercher à nouveau les capteurs</button>`}
   ${this.bottom()}`;
 }
 private air(v:View){
  const a=v.air;
  return html`<p class="muted">L’indice ATMO du jour et ses polluants, publiés par Atmo France pour votre zone. Une précaution régionale, pas une mesure à vos fenêtres.</p>
   ${a.areas.length?nothing:html`<p class="notice">Atmo France n’est pas encore installée : <a href="https://github.com/sebcaps/atmofrance" target="_blank" rel="noreferrer">installer l’intégration Atmo France</a>, puis revenez ici.</p>`}
   ${this.choiceList('air',[...a.areas.map(x=>({...x,hint:'Atmo France'})),{value:NONE,label:'Pas de qualité de l’air'}],a.value,x=>void this.change({op:'air',value:x}))}
   ${this.bottom()}`;
 }
 private pollen(v:View){
  const p=v.pollen;const chosen=p.species.filter(s=>s.chosen).map(s=>s.id);
  const toggle=(id:string,on:boolean)=>void this.change({op:'pollens',value:on?[...chosen,id]:chosen.filter(x=>x!==id)});
  return html`${this.choiceList('pollen',p.sources,p.value,x=>void this.change({op:'pollen',value:x}))}
   ${p.value==='atmo'&&p.areas.length>1?html`<div class="field"><div class="field-top"><h3 id="l-parea">Zone Atmo France des pollens</h3></div>
    <select aria-labelledby="l-parea" ?disabled=${this.busy} @change=${(e:Event)=>void this.change({op:'pollen',value:'atmo',area:(e.target as HTMLSelectElement).value})}>
     ${p.areas.map(x=>html`<option value=${x.value} ?selected=${x.value===p.area}>${x.label}</option>`)}</select></div>`:nothing}
   ${p.species.length?html`<h2>Espèces suivies</h2><p class="hint">Toutes celles trouvées sont proposées ; décochez celles qui ne vous concernent pas.</p>
    ${p.species.map(s=>html`<label class="check"><input type="checkbox" .checked=${s.chosen} ?disabled=${this.busy} @change=${(e:Event)=>toggle(s.id,(e.target as HTMLInputElement).checked)}>
     <span>${s.label} <span class="hint inline">· ${s.state||'indisponible'}</span>${s.chosen&&!s.available?html`<span class="warn">Ne répond pas pour l’instant (hors saison ?).</span>`:nothing}</span></label>`)}`:nothing}
   ${p.risk?this.field(p.risk):nothing}
   ${this.bottom()}`;
 }
 private entities(v:View){
  const e=v.entities;
  if(e.new){
   const chosen=e.families.filter(f=>f.chosen).map(f=>f.key);
   return html`<p class="muted">Les familles d’entités que Niak Weather crée dans Home Assistant. Vous pourrez ensuite les régler une par une.</p>
    ${e.families.map(f=>html`<label class="check"><input type="checkbox" .checked=${!!f.chosen} ?disabled=${this.busy}
     @change=${(ev:Event)=>void this.change({op:'families',value:(ev.target as HTMLInputElement).checked?[...chosen,f.key]:chosen.filter(x=>x!==f.key)})}>
     <span><strong>${f.name}</strong>${f.hint?html`<span class="hint">${f.hint}</span>`:nothing}</span></label>`)}${this.bottom()}`;
  }
  const flip=(key:string,on:boolean)=>{this.enabled=on?[...this.enabled,key]:this.enabled.filter(k=>k!==key);};
  return html`<p class="muted">Les entités que Niak Weather crée dans Home Assistant, par famille. Une entité décochée disparaît ; la carte n’en a pas besoin.</p>
   ${e.families.map(f=>{const items=f.entities??[];const on=items.filter(i=>this.enabled.includes(i.key)).length;
    return html`<details class="group" ?open=${items.some(i=>i.need&&this.enabled.includes(i.key))}><summary><strong>${f.name}</strong><span class="hint">${on} sur ${items.length}</span></summary>
     ${items.map(i=>html`<label class="check"><input type="checkbox" .checked=${this.enabled.includes(i.key)} @change=${(ev:Event)=>flip(i.key,(ev.target as HTMLInputElement).checked)}>
      <span>${i.name}${i.hint?html`<span class="hint">${i.hint}</span>`:nothing}${i.need?html`<span class="warn">${i.need}</span>`:nothing}</span></label>`)}</details>`;})}
   ${this.bottom()}`;
 }
 private recap(v:View){
  const added=this.enabled.filter(k=>!this.initialEnabled.includes(k)).length,removed=this.initialEnabled.filter(k=>!this.enabled.includes(k)).length;
  const change=[added?`${added} de plus`:'',removed?`${removed} de moins`:''].filter(Boolean).join(', ');
  const entities=v.entities.new?v.entities.families.filter(f=>f.chosen).map(f=>f.name).join(', ')||'aucune famille'
   :`${this.enabled.length} actives`+(change?` (${change} qu’avant)`:'');
  return html`<dl class="summary">
    <dt>Prévisions</dt><dd>${v.summary.weather} · « ${v.title} »</dd>
    <dt>Station</dt><dd>${v.summary.station}${v.station.model!==NONE?(v.station.history?' · historique calculé':' · sans historique'):''}</dd>
    <dt>Qualité de l’air</dt><dd>${capital(v.summary.air)}</dd>
    <dt>Pollens</dt><dd>${capital(v.summary.pollen)}</dd>
    <dt>Capteurs</dt><dd>${entities}</dd></dl>
   ${v.needs.length?html`<h2>À savoir</h2><ul>${v.needs.map(n=>html`<li class="warn">${n}. L’entité restera vide.</li>`)}</ul>`:nothing}
   <p class="notice">${this.entryId?'En enregistrant, le lieu redémarre avec ses nouveaux réglages : la carte se met à jour quelques secondes plus tard.':'En enregistrant, Niak Weather crée ce lieu et ses entités.'}</p>
   ${this.bottom(html`<div class="end"><button ?disabled=${this.busy} @click=${()=>this.leave()}>Abandonner</button>
    <button class="primary" ?disabled=${this.busy||!this.draft?.weather_entity} @click=${()=>void this.save()}>${this.entryId?'Enregistrer':'Créer ce lieu'}</button></div>`)}`;
 }

 // ---- Pages ----
 private home(){
  const p=this.places!;
  return html`<main><h1>Ma météo</h1>
   <p class="muted">Le service météo, votre station et l’air de votre ville : Niak Weather les réunit et calcule ce qu’ils annoncent.</p>
   ${this.saved?html`<p class="notice" role="status">${this.saved}</p>`:nothing}
   ${p.places.map(place=>this.place(place))}
   ${p.places.length?html`<h2>Ajouter un lieu</h2><p class="muted">Une résidence secondaire, un jardin éloigné : chaque lieu a ses prévisions et sa station.</p>`
    :html`<h2>Votre lieu</h2><p class="muted">Niak Weather propose ce qu’il trouve dans Home Assistant ; vous vérifiez chaque étape avant de créer le lieu.</p>`}
   ${p.can_add?html`<button class=${p.places.length?'':'primary'} ?disabled=${this.busy} @click=${()=>void this.open(null)}>${p.places.length?'Ajouter un lieu':'Configurer mon lieu'}</button>`
    :html`<p class="notice">Aucun service météo dans Home Assistant : installez Météo-France (Paramètres → Appareils et services), puis revenez ici.</p>`}
   <p class="hint fallback">L’ancien assistant reste disponible pendant la transition : Paramètres → Appareils et services → Niak Weather → Configurer.</p></main>`;
 }
 private place(p:Place){
  const open=this.openEco===p.entry_id;
  return html`<section><h2>${p.title}</h2>
   ${p.failed?html`<p class="warn">Calcul arrêté : Home Assistant n’a pas pu démarrer ce lieu. Vérifiez ses réglages ou les journaux (cherchez « niak »).</p>`
    :p.loaded?nothing:html`<p class="muted" role="status">Le lieu redémarre…</p>`}
   ${p.rows.map(r=>html`<div class="row"><div><h3>${r.title}</h3><p class="muted">${r.text}</p>${r.todo.map(t=>html`<p class="warn">${t}</p>`)}</div>
    <button ?disabled=${this.busy} @click=${()=>void this.open(p.entry_id,r.stage)}>Modifier</button></div>`)}
   <div class="row"><div><h3>Écosystème Niak</h3><p class="muted">${p.ecosystem.text}</p>
    ${open?html`<ul class="bricks">${p.ecosystem.bricks.map(b=>html`<li><strong>${b.name}</strong> · ${brickState[b.state]}. ${b.state==='linked'?'Il reprend':b.state==='future'?'Il reprendra':'Il reprendrait'} ${b.takes}.${b.state==='missing'?html` <a href=${b.url} target="_blank" rel="noreferrer">L’installer</a>`:nothing}</li>`)}</ul>
     <p class="hint">Chaque brique se relie à ce lieu dans ses propres réglages ; Niak Weather ne modifie jamais les autres.</p>`:nothing}</div>
    <button class="link" aria-expanded=${open?'true':'false'} @click=${()=>{this.openEco=open?'':p.entry_id;}}>${open?'Masquer':'Voir le détail'}</button></div></section>`;
 }
 private editor(){
  const v=this.view!;
  const body=[this.prevision,this.station,this.air,this.pollen,this.entities,this.recap][this.stage].call(this,v);
  return html`<main><button class="link" @click=${()=>this.leave()}>← Ma météo</button>
   ${this.confirmLeave?html`<div class="notice" role="alert"><p>Vos changements ne sont pas enregistrés.</p><div class="actions">
    <button @click=${()=>{this.confirmLeave=false;}}>Continuer à modifier</button><button @click=${()=>this.close()}>Abandonner les changements</button></div></div>`:nothing}
   <h1>${this.entryId?`Modifier ${this.placeTitle||v.title}`:'Nouveau lieu'}</h1><p class="step-count">Étape ${this.stage+1} sur ${stages.length}</p>
   <nav class="steps" aria-label="Étapes">${stages.map((s,i)=>html`<button aria-current=${i===this.stage?'step':'false'} @click=${()=>this.go(i)}>${s}</button>`)}</nav>
   ${this.error?html`<p class="notice error" role="alert">${this.error}</p>`:nothing}
   ${body}</main>${this.busy?html`<p class="busy" role="status">Un instant…</p>`:nothing}`;
 }
 protected render(){
  if(this.editing&&this.view)return this.editor();
  if(this.error&&!this.places)return html`<main><p class="notice error" role="alert">${this.error}</p><button @click=${()=>{this.error='';void this.load();}}>Réessayer</button></main>`;
  if(!this.places)return html`<main><p class="muted" role="status">Chargement…</p></main>`;
  return html`${this.error?html`<main><p class="notice error" role="alert">${this.error}</p></main>`:nothing}${this.home()}`;
 }
}
