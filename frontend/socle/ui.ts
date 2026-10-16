// Shared Niak interface, embedded independently in each brick.
import {LitElement,html,css,nothing,type TemplateResult,type PropertyValues} from 'lit';

// Popovers live in the browser top layer, so help escapes scrolling panels.
class NiakHelp extends LitElement {
 static properties={label:{type:String},content:{attribute:false},trigger:{type:String},opened:{state:true}};
 declare trigger:string;declare label:string;declare content:unknown;declare opened:boolean;
 private onViewportChange=(e:Event)=>{const pop=this.renderRoot.querySelector('[popover]');if(this.opened&&!(e.target instanceof Node&&pop?.contains(e.target)))this.close();};
 connectedCallback(){super.connectedCallback();window.addEventListener('scroll',this.onViewportChange,true);window.addEventListener('resize',this.onViewportChange);}
 private pinned=false;private timer?:ReturnType<typeof setTimeout>;
 constructor(){super();this.label='Aide';this.trigger='Aide';this.opened=false;}
 disconnectedCallback(){super.disconnectedCallback();window.removeEventListener('scroll',this.onViewportChange,true);window.removeEventListener('resize',this.onViewportChange);clearTimeout(this.timer);this.pinned=false;this.opened=false;}
 private async show(){
  clearTimeout(this.timer);this.opened=true;await this.updateComplete;
  if(!this.isConnected||!this.opened)return;
  const pop=this.renderRoot.querySelector<HTMLElement>('[popover]')!;
  if(!pop.matches(':popover-open'))pop.showPopover();
  this.place();
 }
 private place(){
  const button=this.renderRoot.querySelector('button')!,pop=this.renderRoot.querySelector<HTMLElement>('[popover]')!;
  const r=button.getBoundingClientRect(),size=pop.getBoundingClientRect();
  const left=Math.max(12,Math.min(r.right-size.width,window.innerWidth-size.width-12));
  const top=r.bottom+8+size.height<=window.innerHeight-12?r.bottom+8:Math.max(12,r.top-size.height-8);
  pop.style.left=left+'px';pop.style.top=top+'px';
 }
 private close(){clearTimeout(this.timer);this.pinned=false;this.opened=false;const pop=this.renderRoot.querySelector<HTMLElement>('[popover]');if(pop?.matches(':popover-open'))pop.hidePopover();}
 private leave(){if(!this.pinned)this.timer=setTimeout(()=>this.close(),160);}
 protected updated(changed:PropertyValues){if(changed.has('content')&&this.opened)this.close();}
 protected render(){return html`<button class="help-button" type="button" aria-label=${'Aide : '+this.label} aria-expanded=${String(this.opened)} aria-controls="help-content" aria-describedby=${this.opened?'help-content':nothing}
  @pointerenter=${(e:PointerEvent)=>{if(e.pointerType==='mouse')void this.show();}} @pointerleave=${()=>this.leave()}
  @click=${()=>{if(this.pinned)this.close();else{this.pinned=true;void this.show();}}}
  @keydown=${(e:KeyboardEvent)=>{if(e.key==='Escape')this.close();}}>
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/></svg><span>${this.trigger}</span></button>
  <div id="help-content" popover="auto" role="tooltip" @toggle=${(e:Event)=>{const on=(e as ToggleEvent).newState==='open';if(this.opened!==on)this.opened=on;if(!on)this.pinned=false;}}
   @pointerenter=${()=>clearTimeout(this.timer)} @pointerleave=${()=>this.leave()} @keydown=${(e:KeyboardEvent)=>{if(e.key==='Escape')this.close();}}>
   <div class="help-head"><strong>${this.label}</strong><button type="button" aria-label="Fermer l’aide" @click=${()=>this.close()}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
   <div class="help-content">${this.content}</div></div>`;}
 static styles=css`
  :host{display:inline-flex;vertical-align:middle;flex-shrink:0;color:var(--secondary-text-color,#bdc5d1);font:13px/1.6 Manrope,system-ui,sans-serif}
  *{box-sizing:border-box}button{display:inline-flex;justify-content:center;align-items:center;min-width:44px;min-height:44px;padding:8px 10px;gap:6px;font:inherit;cursor:pointer;border:0;border-radius:8px;background:transparent;color:inherit}
  .help-button{color:var(--nk-help-accent,#a1c9e8);text-align:left}.help-button svg{width:16px;height:16px;flex-shrink:0}button span{text-decoration:none}
  button:hover{background:color-mix(in srgb,currentColor 10%,transparent)}button[aria-expanded=true]{color:var(--nk-help-accent,#a1c9e8);background:color-mix(in srgb,currentColor 10%,transparent)}
  :focus-visible{outline:2px solid var(--nk-help-accent,#a1c9e8);outline-offset:2px}
  [popover]{position:fixed;inset:auto;margin:0;width:min(360px,calc(100vw - 24px));max-height:min(440px,calc(100dvh - 24px));overflow:auto;padding:16px 18px;color:var(--primary-text-color,#edf1f7);background:var(--ha-card-background,var(--card-background-color,#222932));border:1px solid var(--divider-color,#657386);border-radius:22px;box-shadow:0 8px 28px #0003}
  .help-head{display:flex;align-items:center;gap:8px;font-size:15px}.help-head strong{flex:1}.help-head button{margin:-8px -10px -8px 0;flex-shrink:0}
  .help-content{margin-top:10px}.help-content p{margin:8px 0}.help-content p:first-child{margin-top:0}.help-content p:last-child{margin-bottom:0}.help-content ul{margin:0;padding-left:18px}.help-content li+li{margin-top:8px}
  a{color:var(--nk-help-accent,#a1c9e8);text-underline-offset:3px}
 `;
}
if(!customElements.get('niak-hub-help-v1'))customElements.define('niak-hub-help-v1',NiakHelp);
export function helpTip(label:string,content:unknown,trigger='Aide'){return html`<niak-hub-help-v1 .label=${label} .content=${content} .trigger=${trigger}></niak-hub-help-v1>`;}
export function defaultValue(value:string,onReset:()=>void,explanation:unknown,options:{applied:boolean;disabled?:boolean;note?:string}):TemplateResult {
 return html`<div class="nk-default"><div class="nk-default-value"><span>Valeur par défaut</span><strong>${value}</strong>${options.note?html`<p>${options.note}</p>`:nothing}</div>
  <div class="nk-default-actions"><button type="button" class="nk-reset" ?disabled=${options.disabled||options.applied} @click=${onReset}>${options.disabled?'Choisissez un capteur':options.applied?'Valeur appliquée':'Rétablir la valeur par défaut'}</button>
  ${helpTip('Comprendre la valeur par défaut',explanation,'Pourquoi cette valeur ?')}</div></div>`;
}
export function frame(title:string,body:unknown,options:{count?:string|number;open?:boolean;className?:string;collapsible?:boolean;help?:unknown}={}):TemplateResult {
 const count=options.count===undefined?nothing:html`<span class="nk-count">${options.count}</span>`;
 if(options.collapsible)return html`<details class=${'nk-section '+(options.className??'')} ?open=${options.open!==false}>
  <summary><span class="nk-title">${title}</span>${count}</summary><div class="nk-body">${body}</div></details>`;
 return html`<section class=${'nk-section '+(options.className??'')}><div class="nk-section-head"><h2 class="nk-title">${title}</h2>${count}${options.help?helpTip(title,options.help):nothing}</div><div class="nk-body">${body}</div></section>`;
}
export const hubStyles=css`
 :host{--nk-help-accent:#a1c9e8;--nk-space-tight:8px;--nk-space-section:24px}
 :host([data-theme=light]){--nk-help-accent:#285f87}

 :host{--nk-accent:var(--primary-color,#a1c9e8);--nk-border:var(--divider-color,#657386);--nk-muted:var(--secondary-text-color,#bdc5d1);--nk-surface:var(--ha-card-background,var(--card-background-color,#222932));--nk-radius:16px;--nk-gap:16px}
 main{max-width:1120px;width:100%;padding:32px 28px 64px}
 h1,h2,h3,.nk-title{overflow-wrap:anywhere}h1{line-height:1.25;margin:0 0 8px}p{max-width:none}
 .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
 .nk-section{display:block;align-self:start;min-width:0;background:var(--nk-surface);border:1px solid var(--nk-border);border-radius:var(--nk-radius);margin:16px 0;overflow-wrap:anywhere}
 .nk-section>summary{list-style:none;display:flex;align-items:center;gap:12px;min-height:56px;padding:14px 18px;cursor:pointer;font-size:18px;font-weight:600;line-height:1.4}
 .nk-section>summary::-webkit-details-marker{display:none}
 .nk-section>summary:before,.group>summary:before{content:'';width:8px;height:8px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(-45deg);flex-shrink:0;margin-right:4px;color:var(--nk-muted)}
 .nk-section[open]>summary:before,.group[open]>summary:before{transform:rotate(45deg)}
 .nk-section[open]>summary{border-bottom:1px solid var(--nk-border)}
 .nk-title{flex:1;min-width:0}.nk-section-head{display:flex;align-items:center;gap:12px;padding:16px 20px 0;min-height:44px}.nk-section-head .nk-title{font-size:17px;font-weight:600;line-height:1.4;margin:0}.nk-section-head+ .nk-body{padding-top:12px}.nk-count{color:var(--nk-muted);font-size:14px;font-weight:400;flex-shrink:0;font-variant-numeric:tabular-nums}
 .nk-body{padding:18px 20px 20px}.nk-body>:first-child{margin-top:0}.nk-body>:last-child{margin-bottom:0}
 .nk-body>.field:first-child{border-top:0}.nk-section.wide{grid-column:1/-1}
 .nk-section.todo{border-color:color-mix(in srgb,var(--warning-color,#f2a65a) 55%,var(--nk-border))}
 .hl-grid,.grid{gap:var(--nk-gap);align-items:start}.hl-grid>.nk-section,.grid>.nk-section{margin:0}
 .field:not(.nk-body .field),.room,.start,.searched{background:var(--nk-surface);border:1px solid var(--nk-border);border-radius:var(--nk-radius);padding:18px;margin:16px 0;min-width:0}
 .nk-body>.field{border-radius:0;background:transparent;margin:0;padding:18px 0;border:0;border-top:1px solid var(--nk-border)}
 .field>h2,.start>h2{margin-top:0}
 .intro,.group{background:var(--nk-surface);border:1px solid var(--nk-border);border-radius:var(--nk-radius);padding:0 16px;margin:16px 0}
 .intro>summary{cursor:pointer;list-style:none;min-height:44px;display:flex;align-items:center;font-weight:600}
 .intro>summary::-webkit-details-marker{display:none}
 .group{min-width:0}.group>summary{display:flex;justify-content:space-between;align-items:center;min-height:56px;font-size:18px}
 .group>.field{border:0;border-top:1px solid var(--nk-border);background:transparent;border-radius:0;padding:18px 0;margin:0}.group>.field:first-of-type{border-top:0}
 .group[open]>summary{border-bottom:1px solid var(--nk-border)}.group[open]{padding-bottom:4px}.group p{max-width:none}
 .intro ul{margin:0 0 14px;padding-left:1.2em;list-style:none}.intro li{max-width:none;margin:4px 0}.group>summary{list-style:none;gap:12px}.group>summary strong{flex:1;min-width:0}.group>summary strong:before{display:none}
 .group>summary .hint{white-space:normal;text-align:right}.group>summary:before{display:block}
 .opening>.group{grid-column:1/-1}.opening>*{min-width:0}
 .room>div,.candidate>div,.source>span,.choice>span,.other>div{min-width:0}
 .hl-table{overscroll-behavior-x:contain;scrollbar-width:thin}.hl-table:focus-visible{outline:3px solid var(--nk-accent);outline-offset:3px}
 .hl-table table{font-variant-numeric:tabular-nums}
 .hl-go,.hl-table th button.link,.lines .go{min-height:44px;white-space:normal}
 .state{flex-wrap:wrap}.free label{min-width:min(220px,100%)}
 button,a.button{max-width:100%;overflow-wrap:anywhere}input,select{min-width:0}
 .intro[open]>summary{border-bottom:1px solid var(--nk-border);margin-bottom:12px}
 ::selection{background:var(--primary-color,#285f87);color:var(--text-primary-color,#fff)}input{caret-color:var(--nk-accent)}
 :host{scrollbar-width:thin;scrollbar-color:var(--nk-border) transparent}

 main>h1,.hl-head h1,.head h1{font-size:28px;font-weight:650;letter-spacing:-.02em}
 .nk-step-help{display:flex;align-items:center;gap:4px;color:var(--nk-muted);font-size:14px;margin:-4px 0 18px}
 .nk-step-help niak-hub-help-v1{margin-left:-10px}
 .steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px 10px;overflow:visible;padding:0;margin:20px 0 16px}
 .steps button{width:100%;min-width:0;max-width:none;min-height:48px;display:flex;gap:8px;align-items:center;border-radius:10px;border:1px solid transparent;padding:10px 12px;text-align:left;white-space:normal;line-height:1.4}
 .steps button[aria-current=step]{border:1px solid color-mix(in srgb,var(--nk-help-accent) 40%,var(--nk-border));border-radius:10px;background:color-mix(in srgb,var(--nk-help-accent) 9%,var(--nk-surface));color:var(--primary-text-color,#edf1f7)}
 .nk-step-index{display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;width:22px;height:22px;border:1px solid var(--nk-border);border-radius:6px;flex-shrink:0}
 .steps [aria-current=step] .nk-step-index{color:var(--nk-help-accent);border-color:currentColor}
 .nk-home-head{display:flex;justify-content:space-between;gap:24px;align-items:flex-end;margin:4px 0 28px}.nk-home-head h1{font-size:30px;letter-spacing:-.025em;margin:0 0 8px}.nk-home-head p{margin:0;color:var(--nk-muted);font-size:15px}
 .nk-bricks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-bottom:28px}.nk-bricks>.nk-section{margin:0}
 .nk-bricks .nk-section-head{padding-top:22px}.nk-bricks .nk-title{font-size:20px}
 .nk-bricks .nk-body{padding-top:20px}.nk-bricks .version{font-size:12px;margin:0 0 14px}.nk-bricks .level{align-items:flex-start;font-size:15px;line-height:1.5}.nk-bricks .dot{margin-top:6px;align-self:flex-start}
 .nk-bricks .summary{margin:0}.nk-bricks .primary{margin-top:18px}.nk-bricks ul{color:var(--nk-muted);font-size:14px}
 .nk-count{font-size:12px;font-weight:500;border:1px solid var(--nk-border);border-radius:6px;padding:3px 8px;line-height:1.5}
 .hl-head,.head{margin-bottom:20px}.hl-state,.state{font-size:15px;line-height:1.6}.hl-legend,.legend{gap:16px;margin:0 0 24px}
 .hl-grid>.nk-section.wide,.grid>.nk-section.wide{margin:0}
 .nk-section .nk-section{background:transparent;border-radius:10px}.nk-section .nk-section-head{padding-top:12px}
 .bottom{padding-top:20px;margin-top:28px}.bottom button.primary{min-width:150px}
 .sensor-settings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 16px;border-top:1px solid var(--nk-border);padding-top:16px;margin-top:18px}
 .sensor-settings>h4,.sensor-settings>p,.sensor-settings>button,.sensor-settings>niak-hub-help-v1{grid-column:1/-1}
 .sensor-settings>h4{margin:0;font-size:15px;font-weight:600}.sensor-settings>label{min-width:0;margin:0}.sensor-settings>button{justify-self:start}.sensor-settings>niak-hub-help-v1{justify-self:start}
 .nk-default{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:14px 16px;margin-top:4px;border-radius:10px;background:var(--nk-surface);border:1px solid var(--nk-border)}
 .nk-default-value{display:flex;gap:6px 12px;align-items:baseline;flex-wrap:wrap;min-width:0}.nk-default-value>span{font-size:13px;color:var(--nk-muted)}.nk-default-value>strong{font-size:15px;font-weight:600}.nk-default-value p{flex-basis:100%;font-size:13px;color:var(--nk-muted);margin:0}
 .nk-default-actions{display:flex;align-items:center;gap:4px 12px;flex-wrap:wrap}.nk-default-actions .nk-reset{font-size:13px;padding:8px 12px;min-height:40px;border-radius:8px;border:1px solid var(--nk-border);background:transparent}.nk-default-actions .nk-reset:disabled{opacity:1;color:var(--nk-muted);border-color:transparent;cursor:default}
 section.nk-section.nk-plain{border:0;border-radius:0;background:transparent;border-bottom:1px solid var(--nk-border);padding:0 0 24px;margin:24px 0}
 .nk-section.nk-plain>.nk-section-head{padding:0;gap:10px;flex-wrap:wrap}.nk-section.nk-plain>.nk-body{padding:8px 0 0}.nk-plain .nk-title{font-size:19px}.nk-plain .sensor-settings{border-top:0;margin-top:14px;padding-top:0}
 .field:not(.nk-body .field){border:0;border-bottom:1px solid var(--nk-border);border-radius:0;background:transparent;padding:22px 0;margin:0}
 .source,.choice{border-radius:10px}.field{border-radius:12px}
 @media(max-width:760px){.steps{grid-template-columns:repeat(2,minmax(0,1fr))}.steps button{font-size:14px;padding:8px}.nk-default{padding:12px;gap:8px}.nk-default-actions{gap:4px}.nk-default-actions .nk-reset{min-height:44px}.nk-bricks{grid-template-columns:1fr}.nk-home-head{display:block}.nk-home-head h1{font-size:28px}}
 @media(max-width:600px){main{padding:24px 16px 48px}.nk-section>summary{padding:14px;font-size:17px}.nk-body{padding:14px}.room{flex-wrap:wrap}.room button{min-height:44px}.nk-count{max-width:42%;text-align:right}.hl-state{align-items:flex-start}}
`;

// Shared visual language approved for the whole hub. Semantic statuses stay blue/orange.
export const modernStyles=css`
 :host{color-scheme:dark;--primary-background-color:#1b1c1e;--card-background-color:#1b1c1e;--ha-card-background:#1b1c1e;--primary-text-color:#eeece8;--secondary-text-color:#b2aea7;--divider-color:#3b3c3f;--nk-selected:#303133;--nk-raised:#232426;--nk-button:#ebe8e1;--nk-on-button:#202122;--nk-help-accent:#a6c8d7;--nk-accent:#a6c8d7;--nk-todo:#e2b777;--error-color:#f1a59b;--warning-color:#e2b777;--nk-action-bg:#ebe8e1;--nk-ok:#a6c8d7;--nk-radius:25px;--nk-border:var(--divider-color);--nk-muted:var(--secondary-text-color);--nk-surface:var(--card-background-color);--nc-accent:var(--nk-accent);--nc-todo:var(--nk-todo);--nc-border:var(--nk-border);--nc-muted:var(--nk-muted);--nc-surface:var(--nk-surface);--nc-frame:var(--nk-surface);--nc-action-bg:var(--nk-button);--nw-accent:var(--nk-accent);--nw-todo:var(--nk-todo);--nw-border:var(--nk-border);--nw-muted:var(--nk-muted);--nw-surface:var(--nk-surface);--nw-frame:var(--nk-surface);--nw-action-bg:var(--nk-button);color:var(--primary-text-color);background:var(--primary-background-color);font:400 15px/1.65 Manrope,system-ui,sans-serif;scrollbar-width:thin}
 :host([data-theme=light]){color-scheme:light;--primary-background-color:#faf9f7;--card-background-color:#faf9f7;--ha-card-background:#faf9f7;--primary-text-color:#242321;--secondary-text-color:#75716b;--divider-color:#e2dfd9;--nk-selected:#eeece8;--nk-raised:#fff;--nk-button:#272623;--nk-on-button:#fff;--nk-help-accent:#36677d;--nk-accent:#36677d;--nk-todo:#966528;--nk-ok:#36677d;--error-color:#ae3e32;--warning-color:#966528;--nc-accent:#36677d;--nc-todo:#966528;--nw-accent:#36677d;--nw-todo:#966528}
 *{box-sizing:border-box}main{max-width:940px;width:100%;margin:0 auto;padding:54px 48px 64px}h1,main>h1,.hl-head h1,.head h1{font-size:29px;font-weight:650;letter-spacing:-.035em;line-height:1.3;margin:0 0 10px}h2{font-size:19px;letter-spacing:-.02em}h3{font-size:16px}p{max-width:none}.hint,.muted,.provenance{font-size:13px}button,input,select,.button{font:inherit;min-height:44px;border:1px solid var(--nk-border);border-radius:24px;padding:10px 17px;color:inherit;background:transparent}button,.button{cursor:pointer;line-height:1.5;touch-action:manipulation}input,select{width:100%;border-radius:15px;background:var(--nk-surface);margin-top:8px;padding:11px 14px}input[type=checkbox],input[type=radio]{width:19px;height:19px;min-height:19px;border-radius:4px;padding:0;accent-color:var(--nk-accent)}input[type=checkbox]:focus-visible,input[type=radio]:focus-visible{outline-offset:4px}button:hover,.button:hover{background:var(--nk-selected)}button.primary,.button.primary{background:var(--nk-button);color:var(--nk-on-button);border-color:var(--nk-button);font-weight:500}.primary:hover{filter:brightness(.9)}button.link{border:0;color:var(--nk-muted);background:transparent}button.link:hover{color:var(--primary-text-color);text-decoration:underline}button:disabled{cursor:default;opacity:.5}a{color:var(--nk-accent)}:focus-visible{outline:2px solid var(--nk-accent);outline-offset:3px}
 .nk-section{border-radius:25px;background:transparent;margin:24px 0}.nk-section-head{padding:24px 25px 0;gap:12px}.nk-section-head .nk-title{font-size:18px}.nk-body{padding:20px 25px 25px}.nk-section>summary{padding:18px 24px;font-size:15px}.nk-count{border:0;background:var(--nk-selected);border-radius:18px;font-size:11px;padding:3px 10px}.nk-bricks{gap:20px}.nk-home-head{margin-bottom:32px}.nk-home-head h1{font-size:29px}.nk-home-head p{font-size:14px}.nk-bricks .nk-title{font-size:20px}.nk-bricks .summary{font-size:14px}
 section.nk-section.nk-field-section.nk-plain{border:1px solid var(--nk-border);border-radius:25px;background:var(--nk-surface);padding:24px;margin:20px 0}section.nk-section.nk-field-section.nk-plain>.nk-section-head{padding:0;flex-wrap:wrap}section.nk-section.nk-field-section.nk-plain>.nk-body{padding:14px 0 0}section.nk-section.nk-field-section.nk-plain .nk-title{font-size:17px}.nk-field-section .sensor-settings{border-top:1px solid var(--nk-border);margin-top:20px;padding-top:18px}.sensor-settings{gap:16px}.sensor-settings>p.hint{grid-column:1/-1}.sensor-settings label{font-size:13px;font-weight:500}.sensor-settings h4{font-size:14px}.nk-default{border:0;border-top:1px solid var(--nk-border);border-radius:0;padding:16px 0 0;background:transparent;gap:6px 14px}.nk-default-value>span,.nk-default-value>strong{font-size:12px}.nk-default-actions .nk-reset{border-radius:20px;min-height:44px;font-size:12px}.nk-default-actions{gap:4px}
 .chosen .choice,.choice.on,.source.on{border-color:color-mix(in srgb,var(--nk-accent) 45%,var(--nk-border));background:color-mix(in srgb,var(--nk-accent) 5%,var(--nk-surface))}.choice,.source{border-radius:18px;padding:15px 17px}.choice strong,.source strong{font-size:14px}.candidate{padding:14px 0}.candidate button{font-size:13px}.candidates{border:0}.field:not(.nk-body .field){padding:22px 0;border-bottom:1px solid var(--nk-border)}.field-top h3{font-size:15px}.field-top{align-items:center}.nk-step-help{margin:4px 0 18px}.nk-step-help niak-hub-help-v1{margin-left:-10px}.step-count{font-size:13px;margin-bottom:24px}.group{border-radius:20px}.group>summary{font-size:15px}.notice{border-radius:18px;font-size:14px}.room,.start{border-radius:24px;padding:22px 24px;margin:16px 0}.room{display:flex;align-items:center;justify-content:space-between;gap:18px}.room h3{margin:0}.room p{margin:4px 0}.room button{font-size:13px}.room-list{margin:24px 0 32px}.bottom{border-top:1px solid var(--nk-border);margin-top:30px;padding-top:22px}.bottom .primary{min-width:120px}.health-details{margin-top:32px}.health-details>summary{min-height:44px;cursor:pointer;font-size:14px;color:var(--nk-muted)}
 .room-menu{display:flex;flex-direction:column;align-items:flex-start;gap:8px;margin:0 0 30px}.room-menu-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;padding:5px;background:var(--nk-selected);border-radius:999px;width:min(100%,620px)}.room-menu button{display:flex;justify-content:center;align-items:center;gap:8px;min-width:0;min-height:44px;width:100%;padding:9px 12px;font-size:13px;line-height:1.4;border:1px solid transparent;border-radius:999px;color:var(--nk-muted);background:transparent}.room-menu button svg{width:17px;height:17px;flex-shrink:0}.room-menu button:hover{background:color-mix(in srgb,var(--nk-surface) 50%,transparent);color:var(--primary-text-color)}.room-menu button[aria-current=page]{color:var(--primary-text-color);background:var(--nk-surface);border-color:color-mix(in srgb,var(--nk-border) 55%,transparent);box-shadow:0 1px 4px #0000000a;font-weight:600}.room-content-head{margin-bottom:25px}.room-content-head h2{font-size:23px;margin:0 0 7px}.room-content-head p{font-size:14px;color:var(--nk-muted);margin:0}.workspace-head{margin-bottom:25px}
 @media(max-width:760px){main{padding:30px 22px 48px}.room-menu{align-items:stretch;gap:7px;margin-bottom:26px}.room-menu-row{width:100%;padding:4px;gap:3px;border-radius:25px}.room-menu button{flex-direction:column;gap:5px;min-height:61px;padding:8px 4px;border-radius:21px;font-size:12px}.room-menu button svg{width:16px;height:16px}.room-content-head h2{font-size:21px}.nk-bricks{grid-template-columns:1fr}}
 @media(max-width:480px){main{padding:26px 18px 48px}h1,main>h1,.hl-head h1,.head h1{font-size:25px}section.nk-section.nk-field-section.nk-plain,.nk-body,.room,.start{padding:18px}.nk-section-head{padding:20px 18px 0}.sensor-settings{grid-template-columns:1fr}.nk-default{align-items:flex-start}.room{flex-wrap:wrap}.room>div{flex:1;min-width:140px}.nk-section>summary{padding:16px}.bottom{flex-wrap:wrap}.hl-lines li,.lines li{flex-wrap:wrap}.summary.compact{grid-template-columns:1fr}}
 @media(prefers-reduced-motion:no-preference){.room-menu button{transition:background-color .15s,color .15s}}
`;
// Line icons are decorative; all controls retain visible and accessible labels.
export function hubIcon(kind:string){const paths:Record<string,string>={home:'M3 10 12 3l9 7M5 9v12h14V9M9 21v-8h6v8',settings:'M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6',temperature:'M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0ZM12 8v10',openings:'M5 21V3h14v18M3 21h18M14 12h1',air:'M3 8h13a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h7',presence:'M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 22v-3a8 8 0 0 1 16 0v3',heating:'M5 21V3M19 21V3M5 6h14M5 18h14M9 6v12M15 6v12',room:'M3 21h18M5 21V4h14v17M9 8h2M14 8h1M9 12h2M14 12h1M10 21v-5h4v5',weather:'M5 16a5 5 0 1 1 4-9 5 5 0 1 1 8 6H5M4 3l1 2M14 2v2M2 10h2',pollen:'M12 21V10M6 8a3 3 0 1 1 6-3 3 3 0 1 1 6 3 3 3 0 1 1-6 3 3 3 0 1 1-6-3ZM5 15l7 4 7-4',entities:'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z'};return html`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${paths[kind]??paths.settings}></path></svg>`;}
