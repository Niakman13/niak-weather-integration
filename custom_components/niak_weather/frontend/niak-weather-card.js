// Home Assistant frontend#53890: wait for the final custom element registry.
while (!customElements.get('home-assistant')) {
  await customElements.whenDefined('home-assistant');
}
"use strict";(()=>{var di=Object.defineProperty;var hi=Object.getOwnPropertyDescriptor;var x=(e,i,t,n)=>{for(var a=n>1?void 0:n?hi(i,t):i,r=e.length-1,p;r>=0;r--)(p=e[r])&&(a=(n?p(i,t,a):p(a))||a);return n&&a&&di(i,t,a),a};var be=globalThis,we=be.ShadowRoot&&(be.ShadyCSS===void 0||be.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Le=Symbol(),dt=new WeakMap,se=class{constructor(i,t,n){if(this._$cssResult$=!0,n!==Le)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=i,this.t=t}get styleSheet(){let i=this.o,t=this.t;if(we&&i===void 0){let n=t!==void 0&&t.length===1;n&&(i=dt.get(t)),i===void 0&&((this.o=i=new CSSStyleSheet).replaceSync(this.cssText),n&&dt.set(t,i))}return i}toString(){return this.cssText}},ht=e=>new se(typeof e=="string"?e:e+"",void 0,Le),_=(e,...i)=>{let t=e.length===1?e[0]:i.reduce((n,a,r)=>n+(p=>{if(p._$cssResult$===!0)return p.cssText;if(typeof p=="number")return p;throw Error("Value passed to 'css' function must be a 'css' function result: "+p+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+e[r+1],e[0]);return new se(t,e,Le)},ut=(e,i)=>{if(we)e.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of i){let n=document.createElement("style"),a=be.litNonce;a!==void 0&&n.setAttribute("nonce",a),n.textContent=t.cssText,e.appendChild(n)}},He=we?e=>e:e=>e instanceof CSSStyleSheet?(i=>{let t="";for(let n of i.cssRules)t+=n.cssText;return ht(t)})(e):e;var{is:ui,defineProperty:fi,getOwnPropertyDescriptor:mi,getOwnPropertyNames:gi,getOwnPropertySymbols:bi,getPrototypeOf:wi}=Object,xe=globalThis,ft=xe.trustedTypes,xi=ft?ft.emptyScript:"",vi=xe.reactiveElementPolyfillSupport,oe=(e,i)=>e,le={toAttribute(e,i){switch(i){case Boolean:e=e?xi:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,i){let t=e;switch(i){case Boolean:t=e!==null;break;case Number:t=e===null?null:Number(e);break;case Object:case Array:try{t=JSON.parse(e)}catch{t=null}}return t}},ve=(e,i)=>!ui(e,i),mt={attribute:!0,type:String,converter:le,reflect:!1,useDefault:!1,hasChanged:ve};Symbol.metadata??=Symbol("metadata"),xe.litPropertyMetadata??=new WeakMap;var D=class extends HTMLElement{static addInitializer(i){this._$Ei(),(this.l??=[]).push(i)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(i,t=mt){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(i)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(i,t),!t.noAccessor){let n=Symbol(),a=this.getPropertyDescriptor(i,n,t);a!==void 0&&fi(this.prototype,i,a)}}static getPropertyDescriptor(i,t,n){let{get:a,set:r}=mi(this.prototype,i)??{get(){return this[t]},set(p){this[t]=p}};return{get:a,set(p){let s=a?.call(this);r?.call(this,p),this.requestUpdate(i,s,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(i){return this.elementProperties.get(i)??mt}static _$Ei(){if(this.hasOwnProperty(oe("elementProperties")))return;let i=wi(this);i.finalize(),i.l!==void 0&&(this.l=[...i.l]),this.elementProperties=new Map(i.elementProperties)}static finalize(){if(this.hasOwnProperty(oe("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(oe("properties"))){let t=this.properties,n=[...gi(t),...bi(t)];for(let a of n)this.createProperty(a,t[a])}let i=this[Symbol.metadata];if(i!==null){let t=litPropertyMetadata.get(i);if(t!==void 0)for(let[n,a]of t)this.elementProperties.set(n,a)}this._$Eh=new Map;for(let[t,n]of this.elementProperties){let a=this._$Eu(t,n);a!==void 0&&this._$Eh.set(a,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(i){let t=[];if(Array.isArray(i)){let n=new Set(i.flat(1/0).reverse());for(let a of n)t.unshift(He(a))}else i!==void 0&&t.push(He(i));return t}static _$Eu(i,t){let n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof i=="string"?i.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(i=>this.enableUpdating=i),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(i=>i(this))}addController(i){(this._$EO??=new Set).add(i),this.renderRoot!==void 0&&this.isConnected&&i.hostConnected?.()}removeController(i){this._$EO?.delete(i)}_$E_(){let i=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(i.set(n,this[n]),delete this[n]);i.size>0&&(this._$Ep=i)}createRenderRoot(){let i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ut(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(i=>i.hostConnected?.())}enableUpdating(i){}disconnectedCallback(){this._$EO?.forEach(i=>i.hostDisconnected?.())}attributeChangedCallback(i,t,n){this._$AK(i,n)}_$ET(i,t){let n=this.constructor.elementProperties.get(i),a=this.constructor._$Eu(i,n);if(a!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:le).toAttribute(t,n.type);this._$Em=i,r==null?this.removeAttribute(a):this.setAttribute(a,r),this._$Em=null}}_$AK(i,t){let n=this.constructor,a=n._$Eh.get(i);if(a!==void 0&&this._$Em!==a){let r=n.getPropertyOptions(a),p=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:le;this._$Em=a;let s=p.fromAttribute(t,r.type);this[a]=s??this._$Ej?.get(a)??s,this._$Em=null}}requestUpdate(i,t,n,a=!1,r){if(i!==void 0){let p=this.constructor;if(a===!1&&(r=this[i]),n??=p.getPropertyOptions(i),!((n.hasChanged??ve)(r,t)||n.useDefault&&n.reflect&&r===this._$Ej?.get(i)&&!this.hasAttribute(p._$Eu(i,n))))return;this.C(i,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(i,t,{useDefault:n,reflect:a,wrapped:r},p){n&&!(this._$Ej??=new Map).has(i)&&(this._$Ej.set(i,p??t??this[i]),r!==!0||p!==void 0)||(this._$AL.has(i)||(this.hasUpdated||n||(t=void 0),this._$AL.set(i,t)),a===!0&&this._$Em!==i&&(this._$Eq??=new Set).add(i))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let i=this.scheduleUpdate();return i!=null&&await i,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[a,r]of this._$Ep)this[a]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[a,r]of n){let{wrapped:p}=r,s=this[a];p!==!0||this._$AL.has(a)||s===void 0||this.C(a,void 0,r,s)}}let i=!1,t=this._$AL;try{i=this.shouldUpdate(t),i?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw i=!1,this._$EM(),n}i&&this._$AE(t)}willUpdate(i){}_$AE(i){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(i)),this.updated(i)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(i){return!0}update(i){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(i){}firstUpdated(i){}};D.elementStyles=[],D.shadowRootOptions={mode:"open"},D[oe("elementProperties")]=new Map,D[oe("finalized")]=new Map,vi?.({ReactiveElement:D}),(xe.reactiveElementVersions??=[]).push("2.1.2");var Fe=globalThis,gt=e=>e,ye=Fe.trustedTypes,bt=ye?ye.createPolicy("lit-html",{createHTML:e=>e}):void 0,kt="$lit$",W=`lit$${Math.random().toFixed(9).slice(2)}$`,_t="?"+W,yi=`<${_t}>`,Z=document,ce=()=>Z.createComment(""),de=e=>e===null||typeof e!="object"&&typeof e!="function",Ue=Array.isArray,$i=e=>Ue(e)||typeof e?.[Symbol.iterator]=="function",Oe=`[ 	
\f\r]`,pe=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,wt=/-->/g,xt=/>/g,Q=RegExp(`>|${Oe}(?:([^\\s"'>=/]+)(${Oe}*=${Oe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),vt=/'/g,yt=/"/g,At=/^(?:script|style|textarea|title)$/i,De=e=>(i,...t)=>({_$litType$:e,strings:i,values:t}),o=De(1),H=De(2),sn=De(3),Y=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),$t=new WeakMap,J=Z.createTreeWalker(Z,129);function Tt(e,i){if(!Ue(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return bt!==void 0?bt.createHTML(i):i}var ki=(e,i)=>{let t=e.length-1,n=[],a,r=i===2?"<svg>":i===3?"<math>":"",p=pe;for(let s=0;s<t;s++){let l=e[s],d,u,h=-1,f=0;for(;f<l.length&&(p.lastIndex=f,u=p.exec(l),u!==null);)f=p.lastIndex,p===pe?u[1]==="!--"?p=wt:u[1]!==void 0?p=xt:u[2]!==void 0?(At.test(u[2])&&(a=RegExp("</"+u[2],"g")),p=Q):u[3]!==void 0&&(p=Q):p===Q?u[0]===">"?(p=a??pe,h=-1):u[1]===void 0?h=-2:(h=p.lastIndex-u[2].length,d=u[1],p=u[3]===void 0?Q:u[3]==='"'?yt:vt):p===yt||p===vt?p=Q:p===wt||p===xt?p=pe:(p=Q,a=void 0);let g=p===Q&&e[s+1].startsWith("/>")?" ":"";r+=p===pe?l+yi:h>=0?(n.push(d),l.slice(0,h)+kt+l.slice(h)+W+g):l+W+(h===-2?s:g)}return[Tt(e,r+(e[t]||"<?>")+(i===2?"</svg>":i===3?"</math>":"")),n]},he=class e{constructor({strings:i,_$litType$:t},n){let a;this.parts=[];let r=0,p=0,s=i.length-1,l=this.parts,[d,u]=ki(i,t);if(this.el=e.createElement(d,n),J.currentNode=this.el.content,t===2||t===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(a=J.nextNode())!==null&&l.length<s;){if(a.nodeType===1){if(a.hasAttributes())for(let h of a.getAttributeNames())if(h.endsWith(kt)){let f=u[p++],g=a.getAttribute(h).split(W),k=/([.?@])?(.*)/.exec(f);l.push({type:1,index:r,name:k[2],strings:g,ctor:k[1]==="."?je:k[1]==="?"?Ie:k[1]==="@"?Ve:ne}),a.removeAttribute(h)}else h.startsWith(W)&&(l.push({type:6,index:r}),a.removeAttribute(h));if(At.test(a.tagName)){let h=a.textContent.split(W),f=h.length-1;if(f>0){a.textContent=ye?ye.emptyScript:"";for(let g=0;g<f;g++)a.append(h[g],ce()),J.nextNode(),l.push({type:2,index:++r});a.append(h[f],ce())}}}else if(a.nodeType===8)if(a.data===_t)l.push({type:2,index:r});else{let h=-1;for(;(h=a.data.indexOf(W,h+1))!==-1;)l.push({type:7,index:r}),h+=W.length-1}r++}}static createElement(i,t){let n=Z.createElement("template");return n.innerHTML=i,n}};function ie(e,i,t=e,n){if(i===Y)return i;let a=n!==void 0?t._$Co?.[n]:t._$Cl,r=de(i)?void 0:i._$litDirective$;return a?.constructor!==r&&(a?._$AO?.(!1),r===void 0?a=void 0:(a=new r(e),a._$AT(e,t,n)),n!==void 0?(t._$Co??=[])[n]=a:t._$Cl=a),a!==void 0&&(i=ie(e,a._$AS(e,i.values),a,n)),i}var Be=class{constructor(i,t){this._$AV=[],this._$AN=void 0,this._$AD=i,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(i){let{el:{content:t},parts:n}=this._$AD,a=(i?.creationScope??Z).importNode(t,!0);J.currentNode=a;let r=J.nextNode(),p=0,s=0,l=n[0];for(;l!==void 0;){if(p===l.index){let d;l.type===2?d=new ue(r,r.nextSibling,this,i):l.type===1?d=new l.ctor(r,l.name,l.strings,this,i):l.type===6&&(d=new qe(r,this,i)),this._$AV.push(d),l=n[++s]}p!==l?.index&&(r=J.nextNode(),p++)}return J.currentNode=Z,a}p(i){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(i,n,t),t+=n.strings.length-2):n._$AI(i[t])),t++}},ue=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(i,t,n,a){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=i,this._$AB=t,this._$AM=n,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let i=this._$AA.parentNode,t=this._$AM;return t!==void 0&&i?.nodeType===11&&(i=t.parentNode),i}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(i,t=this){i=ie(this,i,t),de(i)?i===c||i==null||i===""?(this._$AH!==c&&this._$AR(),this._$AH=c):i!==this._$AH&&i!==Y&&this._(i):i._$litType$!==void 0?this.$(i):i.nodeType!==void 0?this.T(i):$i(i)?this.k(i):this._(i)}O(i){return this._$AA.parentNode.insertBefore(i,this._$AB)}T(i){this._$AH!==i&&(this._$AR(),this._$AH=this.O(i))}_(i){this._$AH!==c&&de(this._$AH)?this._$AA.nextSibling.data=i:this.T(Z.createTextNode(i)),this._$AH=i}$(i){let{values:t,_$litType$:n}=i,a=typeof n=="number"?this._$AC(i):(n.el===void 0&&(n.el=he.createElement(Tt(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===a)this._$AH.p(t);else{let r=new Be(a,this),p=r.u(this.options);r.p(t),this.T(p),this._$AH=r}}_$AC(i){let t=$t.get(i.strings);return t===void 0&&$t.set(i.strings,t=new he(i)),t}k(i){Ue(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,n,a=0;for(let r of i)a===t.length?t.push(n=new e(this.O(ce()),this.O(ce()),this,this.options)):n=t[a],n._$AI(r),a++;a<t.length&&(this._$AR(n&&n._$AB.nextSibling,a),t.length=a)}_$AR(i=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);i!==this._$AB;){let n=gt(i).nextSibling;gt(i).remove(),i=n}}setConnected(i){this._$AM===void 0&&(this._$Cv=i,this._$AP?.(i))}},ne=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(i,t,n,a,r){this.type=1,this._$AH=c,this._$AN=void 0,this.element=i,this.name=t,this._$AM=a,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=c}_$AI(i,t=this,n,a){let r=this.strings,p=!1;if(r===void 0)i=ie(this,i,t,0),p=!de(i)||i!==this._$AH&&i!==Y,p&&(this._$AH=i);else{let s=i,l,d;for(i=r[0],l=0;l<r.length-1;l++)d=ie(this,s[n+l],t,l),d===Y&&(d=this._$AH[l]),p||=!de(d)||d!==this._$AH[l],d===c?i=c:i!==c&&(i+=(d??"")+r[l+1]),this._$AH[l]=d}p&&!a&&this.j(i)}j(i){i===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,i??"")}},je=class extends ne{constructor(){super(...arguments),this.type=3}j(i){this.element[this.name]=i===c?void 0:i}},Ie=class extends ne{constructor(){super(...arguments),this.type=4}j(i){this.element.toggleAttribute(this.name,!!i&&i!==c)}},Ve=class extends ne{constructor(i,t,n,a,r){super(i,t,n,a,r),this.type=5}_$AI(i,t=this){if((i=ie(this,i,t,0)??c)===Y)return;let n=this._$AH,a=i===c&&n!==c||i.capture!==n.capture||i.once!==n.once||i.passive!==n.passive,r=i!==c&&(n===c||a);a&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,i),this._$AH=i}handleEvent(i){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,i):this._$AH.handleEvent(i)}},qe=class{constructor(i,t,n){this.element=i,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(i){ie(this,i)}};var _i=Fe.litHtmlPolyfillSupport;_i?.(he,ue),(Fe.litHtmlVersions??=[]).push("3.3.3");var Pt=(e,i,t)=>{let n=t?.renderBefore??i,a=n._$litPart$;if(a===void 0){let r=t?.renderBefore??null;n._$litPart$=a=new ue(i.insertBefore(ce(),r),r,void 0,t??{})}return a._$AI(e),a};var We=globalThis,R=class extends D{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let i=super.createRenderRoot();return this.renderOptions.renderBefore??=i.firstChild,i}update(i){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(i),this._$Do=Pt(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Y}};R._$litElement$=!0,R.finalized=!0,We.litElementHydrateSupport?.({LitElement:R});var Ai=We.litElementPolyfillSupport;Ai?.({LitElement:R});(We.litElementVersions??=[]).push("4.2.2");var Ti={attribute:!0,type:String,converter:le,reflect:!1,hasChanged:ve},Pi=(e=Ti,i,t)=>{let{kind:n,metadata:a}=t,r=globalThis.litPropertyMetadata.get(a);if(r===void 0&&globalThis.litPropertyMetadata.set(a,r=new Map),n==="setter"&&((e=Object.create(e)).wrapped=!0),r.set(t.name,e),n==="accessor"){let{name:p}=t;return{set(s){let l=i.get.call(this);i.set.call(this,s),this.requestUpdate(p,l,e,!0,s)},init(s){return s!==void 0&&this.C(p,void 0,e,s),s}}}if(n==="setter"){let{name:p}=t;return function(s){let l=this[p];i.call(this,s),this.requestUpdate(p,l,e,!0,s)}}throw Error("Unsupported decorator location: "+n)};function C(e){return(i,t)=>typeof t=="object"?Pi(e,i,t):((n,a,r)=>{let p=a.hasOwnProperty(r);return a.constructor.createProperty(r,n),p?Object.getOwnPropertyDescriptor(a,r):void 0})(e,i,t)}function S(e){return C({...e,state:!0,attribute:!1})}var V=e=>i=>{customElements.get(e)||customElements.define(e,i)};function ke(e){return{hero:e.banner_blocks!==void 0||e.show_synthesis!==!1,banner:e.banner_blocks??(e.show_synthesis===!1?[]:[...e.show_bulletin===!1?[]:["bulletin"],"events"]),today:e.today_blocks??(e.show_today===!1?[]:["comfort","rain","wind","pressure","extras","air"]),forecasts:e.forecast_blocks??(e.show_predictions===!1?[]:["hours","days",...e.show_atmo_tomorrow===!1?[]:["air"]])}}function fe(e){let i={...e};i.mode==="compact"&&i.show_predictions===void 0&&(i.show_predictions=!1),delete i.mode;let t=i.full_blocks;if(Array.isArray(t)){let n=["bulletin","events","moments","forecast"],a=t.includes("air");i.banner_blocks??=t.filter(r=>n.includes(r)),i.today_blocks??=t.includes("today")?["comfort","rain","wind","pressure","extras",...a?["air"]:[]]:[],i.forecast_blocks??=t.includes("predictions")?["hours","days",...a?["air"]:[]]:[]}delete i.full_blocks,delete i.air_blocks,delete i.lightning_distance_entity,delete i.comfort_entity,delete i.air_quality_entity,delete i.model_entity,delete i.forecast_entity,delete i.air_path;for(let n of["humidex_entity","humidex_perception_entity","thermal_dew_point_entity","heat_index_entity","absolute_humidity_entity","thermal_perception_entity","thermal_device_id"])delete i[n];return i}function Ct(e,i,t){let n=!t&&!!i.banner_blocks,a=t||n||i.smart_brief!==!1&&i.show_synthesis!==!1,r=p=>i.show_atmo_details===!1?p.map(s=>({...s,details:[],updated:""})):p;return{...e,brief:a?e.brief:void 0,alerts:a?e.alerts:[],points:a?e.points:[],timeline:a?e.timeline:[],bulletin:i.show_bulletin===!1&&!(t&&i.tile_blocks?.length)&&!n?void 0:e.bulletin,air:{today:r(e.air.today),tomorrow:i.show_atmo_tomorrow===!1&&!i.forecast_blocks?[]:r(e.air.tomorrow)}}}var St=_`
  :host {
    /* Theme colours, with fallbacks for themes that leave them out. */
    --nw-fg: var(--primary-text-color, #212121);
    --nw-fg2: var(--secondary-text-color, #727272);
    --nw-bg: var(--ha-card-background, var(--card-background-color, #fff));
    --nw-accent: var(--primary-color, #03a9f4);

    /* Outlines and radii: one radius for every box (tiles, bubbles, panels), one for pills. */
    --nw-line: color-mix(in srgb, var(--nw-fg) 13%, transparent);
    --nw-line-soft: color-mix(in srgb, var(--nw-fg) 8%, transparent);
    --nw-radius-card: var(--ha-card-border-radius, 12px);
    --nw-radius: 14px;
    --nw-radius-pill: 999px;

    /* Glass over the sky: the brief bubble and the timeline's labels. */
    --nw-glass-strong: color-mix(in srgb, var(--nw-bg) 84%, transparent);
    --nw-blur: blur(6px) saturate(1.2);
    /* Frosted glass of the banner's timeline: clearer, so the animated sky shows through, and blurred more to stay readable. */
    --nw-glass-clear: color-mix(in srgb, var(--nw-bg) 45%, transparent);
    --nw-frost: blur(14px) saturate(1.6);

    /* Spacing */
    --nw-pad-bubble: 6px 14px 7px 10px;
    --nw-pad-panel: 18px 20px;

    /* Type scale: six sizes for the whole card, nothing else.
       label 10 (small capitals) · small 12 · text 13 · title 17 · value 30 · temperature 42 */
    --nw-fs-label: 10px; --nw-fs-small: 12px; --nw-fs-text: 13px; --nw-fs-title: 17px; --nw-fs-value: 30px; --nw-fs-temp: 42px;
    --nw-label-spacing: .6px;

    /* Meaning colours, « Aube » palette: OKLCH, same lightness and chroma, only the hue changes, so they always match.
       Pastel for surfaces; text in these colours uses the ink mix below, darker on light themes, lighter on dark ones. */
    --nw-rain: var(--niak-rain-color, oklch(.8 .07 190));
    --nw-wind: var(--niak-wind-color, oklch(.79 .075 280));
    --nw-heat: var(--niak-heat-color, oklch(.83 .085 42));
    --nw-cold: var(--niak-cold-color, oklch(.85 .05 220));
    --nw-calm: var(--niak-calm-color, oklch(.83 .075 150));
    --nw-pressure: var(--niak-pressure-color, oklch(.78 .07 315));
    --nw-level1: var(--niak-level1-color, oklch(.88 .1 96));
    --nw-level2: var(--niak-level2-color, oklch(.81 .105 64));
    --nw-level3: var(--niak-level3-color, oklch(.74 .115 18));
    /* How much of the meaning colour goes into a coloured text: 34 % keeps even the light yellow readable (contrast 4.5:1) on its tinted pill. */
    --nw-ink: 34%;

    /* Motion */
    --nw-ease: cubic-bezier(.2, .8, .2, 1);
    --nw-expand: .45s;
  }
`,Et=_`
  ha-icon { display:flex; line-height:0; }
  button { font:inherit; color:inherit; }
  [data-entity] { cursor:pointer; }
  [data-entity]:focus-visible, button:focus-visible { outline:2px solid var(--nw-accent); outline-offset:2px; }
  .sr { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }

  /* Label: small capitals, one size everywhere. */
  .nw-label { font-size:var(--nw-fs-label); line-height:13px; font-weight:700; letter-spacing:var(--nw-label-spacing); text-transform:uppercase; color:var(--nw-fg2); white-space:nowrap; }

  /* Coloured text, always readable: the meaning colour mixed into the text colour. */
  .nw-ink { font-size:var(--nw-fs-small); font-weight:600; color:color-mix(in oklab, var(--c) var(--nw-ink), var(--nw-fg)); }

  /* The day's bulletin: medium weight, never bold. Home Assistant's Roboto comes in 400, 500 and 700: a 600 shows as bold. */
  .nw-bulletin { margin:0; font-size:var(--nw-fs-text); font-weight:500; line-height:1.5; max-width:62ch; }

  /* Source pill: one rule for the whole card. Same shape as the info pill, only the tint differs. */
  .nw-badge { display:inline-flex; align-items:center; font-size:var(--nw-fs-small); line-height:18px; font-weight:500; white-space:nowrap;
    padding:3px 10px; border-radius:var(--nw-radius-pill); border:1px solid var(--nw-line); background:color-mix(in srgb, var(--nw-bg) 70%, transparent); color:var(--nw-fg);
    max-width:100%; overflow:hidden; text-overflow:ellipsis; box-sizing:border-box; }
  /* Info pill: tinted background, icon and text in the colour, value in bold. */
  .nw-chip { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:var(--nw-radius-pill); font-size:var(--nw-fs-small); line-height:18px; font-weight:600;
    white-space:nowrap; border:1px solid transparent; background:color-mix(in oklab, var(--c) 24%, transparent); color:color-mix(in oklab, var(--c) var(--nw-ink), var(--nw-fg)); }
  .nw-chip ha-icon { --mdc-icon-size:14px; } .nw-chip b { font-weight:700; }
  .nw-chips { display:flex; flex-wrap:wrap; gap:8px; }

  /* « En ce moment »: condition, temperature, source, with a halo that keeps them readable on any sky. */
  .nw-now { display:flex; flex-direction:column; align-items:flex-end; text-align:right; gap:2px;
    text-shadow:0 0 14px var(--nw-bg), 0 0 5px var(--nw-bg), 0 0 2px var(--nw-bg); }
  .nw-now .nw-label { color:color-mix(in srgb, var(--nw-fg) 75%, transparent); }
  .nw-now :is(.nw-chip, .nw-badge) { text-shadow:none; color:var(--nw-fg); background:color-mix(in srgb, var(--nw-bg) 86%, transparent); border-color:var(--nw-line); backdrop-filter:var(--nw-blur); }
  .nw-now .nw-chip ha-icon { color:color-mix(in oklab, var(--c) 70%, var(--nw-fg)); }
  .nw-now .cond { display:flex; align-items:center; gap:6px; font-weight:650; font-size:var(--nw-fs-text); }
  .nw-now .cond ha-icon { --mdc-icon-size:17px; }
  .nw-now .temp { font-size:var(--nw-fs-value); font-weight:700; letter-spacing:-1px; line-height:1.05; white-space:nowrap; }
  .nw-now .temp small { font-size:var(--nw-fs-text); font-weight:400; vertical-align:super; margin-left:2px; letter-spacing:0; }
  /* Today's low and high: a quiet line under the temperature. */
  .nw-now .range { display:flex; gap:10px; font-size:var(--nw-fs-small); font-weight:600; font-variant-numeric:tabular-nums; white-space:nowrap;
    color:color-mix(in srgb, currentColor 82%, transparent); }
  /* Storm and downpour clouds stay dark whatever the theme: the text on them turns white, the pills keep the theme. */
  .dark-sky .nw-now { color:#fff; text-shadow:0 1px 5px #0b1a2b99; }
  .dark-sky .nw-now .nw-label { color:rgba(255,255,255,.88); }

  /* Panel: every frame of the full card. */
  .nw-panel { background:var(--nw-bg); border:1px solid var(--nw-line); border-radius:var(--nw-radius); padding:var(--nw-pad-panel);
    display:flex; flex-direction:column; gap:14px; min-width:0; box-sizing:border-box; }
  /* When the title and its source do not fit on one line, the source moves under the title rather than cutting it. */
  .nw-panel-head { display:flex; flex-wrap:wrap; align-items:center; gap:8px 10px; min-width:0; }
  .nw-panel-head h3 { display:flex; align-items:center; gap:8px; margin:0; font-size:var(--nw-fs-title); font-weight:700; letter-spacing:-.2px; flex:1 0 auto; max-width:calc(100% - 42px); white-space:nowrap; }
  .nw-panel-head h3 > span { overflow:hidden; text-overflow:ellipsis; }
  .nw-panel-head .nw-badge { margin-left:auto; }
  .nw-panel-icon { display:grid; place-items:center; width:32px; height:32px; border-radius:10px; flex:none;
    background:color-mix(in oklab, var(--c) 28%, transparent); color:color-mix(in oklab, var(--c) 60%, var(--nw-fg)); }
  .nw-panel-icon ha-icon { --mdc-icon-size:18px; }
  .nw-sub { margin:-8px 0 0; font-size:var(--nw-fs-small); color:var(--nw-fg2); }
  .nw-empty { margin:0; padding:14px 0; text-align:center; font-size:var(--nw-fs-small); color:var(--nw-fg2); }

  /* Legend: always centred under its chart. */
  .nw-legend { display:flex; justify-content:center; flex-wrap:wrap; gap:6px 16px; font-size:var(--nw-fs-small); color:var(--nw-fg2); margin-top:auto; }
  .nw-legend span { display:inline-flex; align-items:center; gap:6px; }
  .nw-legend i { width:14px; height:4px; border-radius:2px; background:var(--c); }
  .nw-legend i.sq { width:10px; height:10px; border-radius:3px; }
  .nw-legend i.dash { background:repeating-linear-gradient(90deg, color-mix(in oklab, var(--c) 60%, transparent) 0 3px, transparent 3px 5px); }
  .nw-legend svg { width:10px; height:10px; fill:color-mix(in oklab, var(--nw-wind) 70%, var(--nw-fg)); }

  /* Main value of a panel: big figure, unit, caption. */
  .metric-row { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px 14px; }
  .metric { display:flex; flex-direction:column; gap:4px; min-width:0; border:0; background:none; padding:0; text-align:left; }
  .metric-main { display:flex; align-items:baseline; gap:5px; }
  .metric-main b { font-size:var(--nw-fs-value); font-weight:700; letter-spacing:-1px; line-height:1; font-variant-numeric:tabular-nums; }
  .metric-main span { font-size:var(--nw-fs-text); color:var(--nw-fg2); font-weight:600; }
  .metric small { font-size:var(--nw-fs-small); color:var(--nw-fg2); }
  .metric small b { color:var(--nw-fg); }
  /* Three small values under a line. */
  .stats { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:8px; padding-top:12px; border-top:1px solid var(--nw-line-soft); margin-top:auto; }
  .stats > * { display:flex; flex-direction:column; gap:2px; min-width:0; }
  .stats .nw-label { overflow:hidden; text-overflow:ellipsis; }
  .stats b { font-size:var(--nw-fs-text); font-weight:700; font-variant-numeric:tabular-nums; white-space:nowrap; }

  /* Small history chart: the same frame for rain, wind and pressure. */
  .mini { display:flex; flex-direction:column; gap:4px; }
  .mini-top { font-size:var(--nw-fs-small); color:var(--nw-fg2); }
  .mini-plot { position:relative; height:52px; margin:16px 0 14px; }
  .mini-plot svg { position:absolute; inset:0; width:100%; height:100%; overflow:visible; }
  .mini-axis { display:flex; justify-content:space-between; }
  /* A value posed on a chart: above its point, below it when the point touches the top. */
  .pill { position:absolute; transform:translate(-50%, -130%); font-size:var(--nw-fs-small); font-weight:700; padding:2px 8px; border-radius:var(--nw-radius-pill);
    background:var(--nw-bg); border:1px solid var(--nw-line); box-shadow:0 2px 6px #0001; white-space:nowrap; }
  .pill.low { transform:translate(-50%, 40%); }

  /* Folding details at the bottom of a panel. */
  .nw-details { font-size:var(--nw-fs-small); color:var(--nw-fg2); border-top:1px solid var(--nw-line-soft); padding-top:10px; margin-top:auto; }
  .nw-details summary { cursor:pointer; list-style:none; display:flex; align-items:center; gap:6px; font-weight:600; }
  .nw-details summary::-webkit-details-marker { display:none; }
  .nw-details summary ha-icon { --mdc-icon-size:16px; transition:transform .2s; }
  .nw-details[open] summary ha-icon { transform:rotate(90deg); }
  .nw-details ul { margin:8px 0 0; padding:0; list-style:none; display:grid; gap:6px; }
  .nw-details li { display:flex; justify-content:space-between; gap:12px; font-size:var(--nw-fs-text); color:var(--nw-fg); }
  .nw-details li b { text-align:right; }
  .nw-details p { margin:8px 0 0; }

  /* « i » button and its explanation bubble: one sentence, then an example. */
  .nw-info { display:inline-grid; place-items:center; width:22px; height:22px; padding:0; flex:none; border-radius:50%; border:1px solid var(--nw-line);
    background:var(--nw-bg); color:var(--nw-fg2); cursor:pointer; }
  .nw-info:hover { color:var(--nw-fg); border-color:color-mix(in srgb, var(--nw-fg) 30%, transparent); }
  .nw-info ha-icon { --mdc-icon-size:15px; }
  .nw-pop { position:fixed; inset:auto; margin:0; width:min(320px, calc(100vw - 24px)); max-height:min(70vh, 480px); overflow:auto; box-sizing:border-box;
    padding:12px 14px; border-radius:var(--nw-radius); border:1px solid var(--nw-line); background:var(--nw-bg); color:var(--nw-fg);
    box-shadow:0 12px 32px #0b1a2b26; font-size:var(--nw-fs-text); line-height:1.45; font-weight:400;
    white-space:normal; text-align:left; letter-spacing:0; text-transform:none; text-shadow:none; }
  .nw-pop > b { display:block; margin-bottom:4px; }
  .nw-pop .ex { margin-top:8px; padding-top:8px; border-top:1px solid var(--nw-line); font-size:var(--nw-fs-small); color:var(--nw-fg2); }
  .nw-pop .ex::before { content:'Exemple'; display:block; font-size:var(--nw-fs-label); font-weight:700; letter-spacing:var(--nw-label-spacing); text-transform:uppercase; margin-bottom:2px; }
  .nw-pop a { color:var(--nw-accent); }
`,_e=_`
  .nw-bubble { display:inline-grid; grid-template-columns:auto minmax(0,1fr); column-gap:10px; align-items:center; max-width:100%; box-sizing:border-box; margin:0;
    padding:var(--nw-pad-bubble); border-radius:var(--nw-radius); background:var(--nw-glass-strong); border:1px solid var(--nw-line); backdrop-filter:var(--nw-blur);
    color:var(--nw-fg); transition:opacity .35s, transform .35s; }
  .nw-bubble ha-icon { --mdc-icon-size:18px; display:flex; line-height:0; grid-row:1/3; color:var(--nw-fg2); }
  /* A touch of colour: only the icon takes the colour of the bubble's theme. */
  .nw-bubble[data-theme] ha-icon { color:color-mix(in oklab, var(--c) 70%, var(--nw-fg)); }
  .nw-bubble .nw-label { grid-column:2; font-size:var(--nw-fs-label); line-height:13px; font-weight:700; letter-spacing:var(--nw-label-spacing); text-transform:uppercase; color:var(--nw-fg2); white-space:nowrap; }
  .nw-bubble b { grid-column:2; font-size:var(--nw-fs-text); line-height:16px; font-weight:500; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .nw-bubble.out { opacity:0; transform:translateY(-5px); }
  /* Alert: the same bubble, tinted by its level, with a breathing halo (a fixed shadow whose opacity pulses: no repaint). */
  .nw-bubble--alert { --al:var(--nw-level1); position:relative; border-color:color-mix(in oklab, var(--al) 60%, transparent);
    background:linear-gradient(100deg, color-mix(in oklab, var(--nw-bg) 72%, var(--al)), color-mix(in oklab, var(--nw-bg) 90%, var(--al)));
    box-shadow:0 0 6px 0 color-mix(in oklab, var(--al) 32%, transparent), 0 4px 18px -10px color-mix(in oklab, var(--al) 65%, transparent); }
  .nw-bubble--alert::after { content:''; position:absolute; inset:-1px; border-radius:inherit; box-shadow:0 0 16px 2px color-mix(in oklab, var(--al) 55%, transparent);
    opacity:0; animation:nw-glow 5.2s ease-in-out infinite; animation-play-state:var(--nw-motion, running); pointer-events:none; }
  .nw-bubble--alert ha-icon { color:color-mix(in oklab, var(--al) 70%, var(--nw-fg)); }
  .nw-bubble--alert .nw-label { color:color-mix(in oklab, var(--al) var(--nw-ink), var(--nw-fg)); }
  /* Official vigilance in the banner: a compact pill, its icon in a disc of the level's colour, the same outline and halo as the alert bubble. */
  .nw-alert { --al:var(--nw-level1); position:relative; display:inline-flex; align-items:center; gap:8px; max-width:100%; box-sizing:border-box; margin:0;
    padding:3px 14px 3px 3px; border-radius:var(--nw-radius-pill); font-size:var(--nw-fs-text); line-height:18px; color:var(--nw-fg);
    background:color-mix(in srgb, var(--al) 30%, color-mix(in srgb, var(--nw-bg) 55%, transparent)); border:1px solid color-mix(in oklab, var(--al) 60%, transparent);
    backdrop-filter:var(--nw-blur); box-shadow:0 0 6px 0 color-mix(in oklab, var(--al) 32%, transparent), 0 4px 18px -10px color-mix(in oklab, var(--al) 65%, transparent); }
  .nw-alert::after { content:''; position:absolute; inset:-1px; border-radius:inherit; box-shadow:0 0 16px 2px color-mix(in oklab, var(--al) 55%, transparent);
    opacity:0; animation:nw-glow 5.2s ease-in-out infinite; animation-play-state:var(--nw-motion, running); pointer-events:none; }
  .nw-alert .dot { display:grid; place-items:center; width:24px; height:24px; flex:none; border-radius:50%; background:var(--al); color:#2b2620; }
  .nw-alert .dot ha-icon { --mdc-icon-size:14px; display:flex; line-height:0; }
  .nw-alert > span:last-child { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .nw-alert b { font-weight:650; }
  /* On a narrow card the phenomenon is enough: the disc's colour and the halo give the level, screen readers still read it. */
  @container (max-width:400px) { .nw-alert b { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; } }
  /* The level's colour, after the pieces that set the yellow of level 1. */
  .nw-level2 { --al:var(--nw-level2); } .nw-level3 { --al:var(--nw-level3); }
  @keyframes nw-glow { 50% { opacity:1; } }
  @media (prefers-reduced-motion:reduce) { .nw-bubble { transition:none; } .nw-bubble--alert::after, .nw-alert::after { animation:none; } }
`;var Mt=new Map;function Rt(e,i={}){let t=JSON.stringify([e,i]),n=Mt.get(t);return n||Mt.set(t,n=new Intl.NumberFormat(e,i)),n}var v=(e,i=1,t=!1)=>Rt("fr-FR",{maximumFractionDigits:i,minimumFractionDigits:t?i:0}).format(e),Ae=e=>e.replace(/(\d) (°C|km\/h|mm|%|hPa)/g,"$1\xA0$2"),N=e=>`--c:var(--nw-${e})`,ae=e=>`color-mix(in oklab,var(--nw-heat) ${Math.round(Math.min(100,Math.max(0,(e-5)/25*100)))}%,var(--nw-cold))`,X=e=>e??c,A=e=>o`<span class="nw-label">${e}</span>`,Ci=e=>o`<span class="nw-badge" title=${e}>${e}</span>`;function O(e){return o`<span class="nw-chip" style=${N(e.theme)} data-entity=${X(e.entity)} role=${e.entity?"button":c} tabindex=${e.entity?0:c}>
    <ha-icon icon=${e.icon}></ha-icon>${e.value?o`<b>${e.value}</b>`:c}${e.label}</span>`}function Te(e,i=""){return o`<p class=${`nw-bubble ${i}`} data-theme=${e.theme??c} style=${e.theme?N(e.theme):c}>
    <ha-icon icon=${e.icon}></ha-icon><span class="nw-label">${e.label}</span><b title=${e.text}>${e.text}</b></p>`}function Pe(e,i=""){return o`<p class=${`nw-bubble nw-bubble--alert nw-level${e.level} ${i}`} role="status">
    <ha-icon icon=${e.icon}></ha-icon>${e.label?o`<span class="nw-label">${e.label}</span>`:c}<b title=${e.text}>${e.text}</b></p>`}function ee(e){return o`<p class=${`nw-alert nw-level${e.level}`} role="status" title=${e.source} data-entity=${X(e.entity)}>
    <span class="dot"><ha-icon icon=${e.icon}></ha-icon></span><span>${e.label?o`<b>${e.label}<span class="sep"> · </span></b>`:c}${e.text}</span></p>`}var Si=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"],me=e=>Si[Math.round((e%360+360)%360/22.5)%16],re=e=>H`<svg viewBox="0 0 10 10" aria-hidden="true" style=${`transform:rotate(${Math.round(e+180)}deg)`}><path d="M5 0 9 10 5 7.5 1 10Z"/></svg>`;function Ce(e,i){return o`<button class="nw-info" type="button" popovertarget=${e} aria-label=${`Qu\u2019est-ce que : ${i.title} ?`} @click=${zt}><ha-icon icon="mdi:information-variant"></ha-icon></button>
    <div class="nw-pop" id=${e} popover @toggle=${Ei} @click=${zt}><b>${i.title}</b>${i.text}${i.example?o`<div class="ex">${i.example}</div>`:c}</div>`}var zt=e=>e.stopPropagation();function Ei(e){let i=e.currentTarget;if(e.newState!=="open")return;let t=i.getRootNode().querySelector(`[popovertarget="${i.id}"]`);if(!t)return;let n=t.getBoundingClientRect();i.style.top=`${Math.max(8,Math.min(n.bottom+8,innerHeight-i.offsetHeight-8))}px`,i.style.left=`${Math.max(8,Math.min(n.left-12,innerWidth-i.offsetWidth-8))}px`}function q(e,i,t,n,a){return o`<header class="nw-panel-head"><span class="nw-panel-icon" style=${N(i)}><ha-icon icon=${e}></ha-icon></span>
    <h3><span>${t}</span>${a??c}</h3>${Ci(n)}</header>`}var te=(e,i,t="")=>o`<span><i class=${t} style=${t==="dash"?`--c:${i}`:`background:${i}`}></i>${e}</span>`;var G=class extends R{constructor(){super(...arguments);this.points=[];this.index=0;this.leaving=!1}connectedCallback(){super.connectedCallback(),this.leaving=!1,this.timer=setInterval(()=>this.next(),5e3)}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.timer),clearTimeout(this.swap)}willUpdate(t){if(!t.has("points"))return;let n=this.points.findIndex(a=>a.text===this.shown);if(n>=0){this.index=n;return}if(this.shown===void 0||this.reduced){this.index=0;return}this.leaving=!0,clearTimeout(this.swap),this.swap=setTimeout(()=>{this.index=0,this.leaving=!1},300)}get reduced(){return matchMedia("(prefers-reduced-motion: reduce)").matches}next(){let t=this.getRootNode().host;if(this.points.length<2||document.hidden||t?.matches(":hover, :focus-within"))return;let n=()=>{this.index=(this.index+1)%this.points.length,this.leaving=!1};if(this.reduced){n();return}this.leaving=!0,this.swap=setTimeout(n,350)}render(){let t=this.points[this.index%Math.max(1,this.points.length)];if(this.shown=t?.text,!t)return c;let n=this.leaving?"out":"";return o`<div aria-hidden="true">${"official"in t?Pe(t,n):Te(t,n)}</div>
      <ul class="sr">${this.points.map(a=>o`<li>${a.label?`${a.label} : `:""}${a.text}</li>`)}</ul>`}};G.styles=[_e,_`
    :host { display:block; min-width:0; }
    ha-icon { display:flex; line-height:0; }
    .sr { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; margin:0; padding:0; }
  `],x([C({attribute:!1})],G.prototype,"points",2),x([S()],G.prototype,"index",2),x([S()],G.prototype,"leaving",2),G=x([V("niak-ticker")],G);var Mi={sunny:"sun","clear-night":"night",partlycloudy:"partly",cloudy:"cloud",fog:"fog",rainy:"rain",pouring:"rain",lightning:"storm","lightning-rainy":"storm",snowy:"snow","snowy-rainy":"snow",hail:"hail",windy:"wind","windy-variant":"wind",exceptional:"cloud"},Ri=e=>e.condition==="sunny"&&e.night?"night":Mi[e.condition]??"cloud",Ne=e=>e===0?"minuit":e===12?"midi":`${e} h`,Se=e=>Math.min(3,Math.max(1,e));function Ge(e,i,t,n,a){let r=t.filter(m=>m.time!==void 0),p=r[r.length-1],s=Math.max(10800,Math.min(64800,p?p.time+3600-n:64800)),l=m=>Math.max(0,Math.min(1,(m-n)/s)),d=(m,E)=>({at:m,clock:E??(m===void 0?"":Ne(new Date(m*1e3).getHours())),now:m===void 0||m<=n+1200}),u=m=>({label:m.label,icon:m.icon,text:m.text,theme:m.theme,alert:m.alert||m.level>=2?Se(m.level):void 0,...d(m.at,m.clock)}),h=i.filter(m=>!m.official).map(m=>({label:m.label??"Maintenant",icon:m.icon,text:m.text,alert:Se(m.level),...d(m.at,m.clock)})),f=a?a.map(u):[...h,...e.map(u)],g=[...f.filter(m=>m.now),...f.filter(m=>!m.now).sort((m,E)=>m.at-E.at)],k=(m,E,I)=>{let F=Math.max(0,...m.map(U=>g[U].alert??0));return{items:m,x:l(E),clock:I,theme:g[m[0]].theme,alert:F?Se(F):void 0}},y=g.flatMap((m,E)=>m.now?[E]:[]),$=[];g.forEach((m,E)=>{if(m.now)return;let I=$[$.length-1];I&&m.at-g[I[0]].at<3600?I.push(E):$.push([E])});let M=[...y.length?[k(y,n,"Maintenant")]:[],...$.map(m=>k(m,g[m[0]].at,g[m[0]].clock))],T=[];for(let m of r){let E=Math.max(m.time,n),I=Math.min(m.time+3600,n+s);if(I<=E)continue;let F=Ri(m),U=T[T.length-1];U&&U.kind===F&&(F!=="partly"||U.icon===m.icon)?U.flex+=I-E:T.push({kind:F,icon:m.icon,flex:I-E})}let P=[{x:0,text:"Maintenant",edge:"first"}];for(let m of r)m.hour%6===0&&l(m.time)>.04&&l(m.time)<.9&&P.push({x:l(m.time),text:Ne(m.hour)});return p&&P.push({x:1,text:Ne((p.hour+Math.round((n+s-p.time)/3600))%24),edge:"last"}),{items:g,groups:M,segments:T,marks:P}}var ge=4500,zi=9e3,Lt=300,Ee=6,Ke=10,Qe=e=>`--tone:var(--nw-${e.theme??(e.alert?`level${e.alert}`:"calm")})`,Li=e=>e.stopPropagation(),j=class extends R{constructor(){super(...arguments);this.points=[];this.alerts=[];this.hours=[];this.index=0;this.paused=!1;this.step=ge;this.frise=Ge([],[],[],0);this.built=0;this.due=0;this.left=ge;this.pause=t=>{t.pointerType==="touch"||this.paused||(this.paused=!0,clearTimeout(this.timer),this.left=Math.max(300,this.due-Date.now()))};this.resume=t=>{t.pointerType==="touch"||!this.paused||t.type==="pointerleave"&&this.matches(":focus-within")||(this.paused=!1,this.due=Date.now()+this.left,this.timer=setTimeout(()=>this.next(),this.left))}}connectedCallback(){super.connectedCallback(),this.schedule(ge),this.hasUpdated&&this.observe()}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.timer),clearTimeout(this.leave),this.resize?.disconnect()}willUpdate(t){let n=Date.now()/1e3;if(!t.has("points")&&!t.has("alerts")&&!t.has("hours")&&!t.has("timeline")&&n-this.built<Lt)return;let a=this.frise.items[this.index]?.text;this.frise=Ge(this.points,this.alerts,this.hours,n,this.timeline),this.built=n;let r=this.frise.items.findIndex(p=>p.text===a);this.index=r>=0?r:0,this.leaving=void 0}firstUpdated(){this.observe()}updated(){this.layout()}observe(){let t=this.renderRoot.querySelector(".track");!t||typeof ResizeObserver>"u"||(this.resize?.disconnect(),this.resize=new ResizeObserver(()=>this.layout()),this.resize.observe(t))}schedule(t){clearTimeout(this.timer),this.step=t,this.left=t,this.due=Date.now()+t,this.paused||(this.timer=setTimeout(()=>this.next(),t))}next(){Date.now()/1e3-this.built>=Lt&&this.requestUpdate();let t=this.frise.items.length;if(t<2||document.hidden){this.schedule(ge);return}this.show((this.index+1)%t,ge)}show(t,n){t!==this.index&&(this.leaving=this.index,this.index=t,clearTimeout(this.leave),this.leave=setTimeout(()=>{this.leaving=void 0},460)),this.schedule(n)}pick(t){let n=t.items.indexOf(this.index);this.show(n<0?t.items[0]:t.items[(n+1)%t.items.length],zi)}layout(){let t=this.renderRoot.querySelector(".track"),n=t?.clientWidth;if(!t||!n)return;let a=[...t.querySelectorAll(".pin")];t.classList.remove("compact"),(h=>h.reduce((f,g)=>f+g.offsetWidth+Ee,-Ee)<=n+2*Ke)(a)||t.classList.add("compact");let p=a.map(h=>h.offsetWidth),s=a.map(h=>Number(h.dataset.x)*n);s.forEach((h,f)=>{s[f]=Math.max(h,p[f]/2-Ke,f?s[f-1]+(p[f-1]+p[f])/2+Ee:-1/0)});for(let h=s.length-1;h>=0;h--)s[h]=Math.min(s[h],h===s.length-1?n-p[h]/2+Ke:s[h+1]-(p[h+1]+p[h])/2-Ee);a.forEach((h,f)=>{h.style.left=`${Math.round(s[f])}px`}),t.querySelectorAll(".seg").forEach(h=>h.classList.toggle("tight",h.clientWidth<28));let l=[...this.renderRoot.querySelectorAll(".hours span")];if(l.forEach(h=>h.classList.remove("hide")),l.length<3)return;let d=l[l.length-1].getBoundingClientRect(),u=l[0].getBoundingClientRect();for(let h of l.slice(1,-1)){let f=h.getBoundingClientRect();f.left<u.right+18||f.right>d.left-18?h.classList.add("hide"):u=f}}render(){let{items:t,groups:n,segments:a,marks:r}=this.frise;if(!t.length&&!a.length)return c;let p=s=>s.now||!s.clock?s.label:`${s.label} \xB7 ${s.clock}`;return o`<div class=${`panel${this.paused?" paused":""}`} @pointerenter=${this.pause} @pointerleave=${this.resume} @focusin=${this.pause} @focusout=${this.resume}>
      ${t.length?o`<div class="head" aria-hidden="true">
        <div class="say">${t.map((s,l)=>o`<div class=${`item${l===this.index?" on":l===this.leaving?" off":""}${s.alert?" al":""}`}
          style=${`${Qe(s)}${s.alert?`;--al:var(--nw-level${s.alert})`:""}`}>
          <span class="badge"><ha-icon icon=${s.icon}></ha-icon></span><div><div class="when">${p(s)}</div><div class="x" title=${s.text}>${s.text}</div></div></div>`)}</div>
        ${t.length>1?o`<div class="progress" style=${`--step:${this.step}ms`}>${t.map((s,l)=>o`<i class=${l===this.index?"on":l<this.index?"done":""}></i>`)}</div>`:c}
      </div>`:c}
      <div class=${`track${n.length?"":" bare"}`}>
        <div class="chips">${n.map(s=>{let l=s.items.includes(this.index),d=t[l?this.index:s.items[0]];return o`<button type="button" class=${`pin${l?" on":""}${s.alert?" al":""}`} data-x=${s.x}
            style=${`left:${(s.x*100).toFixed(2)}%;${Qe(d)}${s.alert?`;--al:var(--nw-level${s.alert})`:""}`}
            aria-label=${s.items.map(u=>`${p(t[u])} : ${t[u].text}`).join(" ; ")} @click=${()=>this.pick(s)} @pointerdown=${Li}>
            <span class="chip"><span class="stack">${s.items.map((u,h)=>o`<span class=${`mini${u===this.index||!l&&!h?" cur":""}`} style=${Qe(t[u])}>
              <ha-icon icon=${t[u].icon}></ha-icon></span>`)}</span><span class="clock">${s.clock}</span>${s.items.length>1?o`<span class="count">${s.items.length}</span>`:c}</span>
            <span class="stem"></span></button>`})}</div>
        <div class="lane">${a.length?a.map(s=>o`<span class=${`seg s-${s.kind}`} style=${`flex:${s.flex}`}><ha-icon icon=${s.icon}></ha-icon></span>`):o`<span class="seg s-cloud" style="flex:1"></span>`}</div>
        <span class="needle"></span>
      </div>
      ${a.length?o`<div class="hours" aria-hidden="true">${r.map(s=>o`<span class=${s.edge??""} style=${`left:${(s.x*100).toFixed(2)}%`}>${s.text}</span>`)}</div>`:c}
      <ul class="sr">${t.map(s=>o`<li>${p(s)} : ${s.text}</li>`)}</ul>
    </div>`}};j.styles=_`
    :host { display:block; min-width:0; color:var(--nw-fg); }
    ha-icon { display:flex; line-height:0; }
    button { font:inherit; color:inherit; }
    .sr { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; margin:0; padding:0; }
    /* Frosted glass: clear enough to see the animated sky through it, blurred enough to keep the text readable. Crisp 1 px outline. */
    .panel { position:relative; padding:12px 16px; border-radius:var(--nw-radius); border:1px solid var(--nw-line);
      background:var(--nw-glass-clear); backdrop-filter:var(--nw-frost); -webkit-backdrop-filter:var(--nw-frost); box-shadow:0 8px 24px rgb(15 25 45 / .08); }

    /* The sentence: one point at a time, sliding up. */
    .head { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
    /* Clipped for the slide, so it starts 3 px further left: the outline of the badge stays whole. */
    .say { position:relative; flex:1; min-width:0; height:38px; overflow:hidden; margin-left:-3px; }
    .item { position:absolute; inset:0 0 0 3px; display:flex; gap:10px; align-items:center; opacity:0; translate:0 100%; transition:opacity .45s var(--nw-ease), translate .45s var(--nw-ease); }
    .item.on { opacity:1; translate:0 0; } .item.off { opacity:0; translate:0 -100%; }
    .item > div { min-width:0; }
    .when { font-size:var(--nw-fs-label); line-height:13px; letter-spacing:var(--nw-label-spacing); text-transform:uppercase; font-weight:700; white-space:nowrap;
      color:color-mix(in oklab, var(--tone) var(--nw-ink), var(--nw-fg)); }
    .x { font-size:var(--nw-fs-text); line-height:18px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .badge { display:grid; place-items:center; width:32px; height:32px; flex:none; border-radius:10px; background:color-mix(in srgb, var(--tone) 32%, var(--nw-bg)); }
    .badge ha-icon { --mdc-icon-size:18px; color:color-mix(in oklab, var(--tone) 40%, var(--nw-fg)); }
    .item.al .badge { background:color-mix(in srgb, var(--al) 50%, var(--nw-bg)); box-shadow:0 0 0 1px color-mix(in oklab, var(--al) 70%, transparent); }
    .item.al .badge ha-icon { color:color-mix(in oklab, var(--al) 30%, var(--nw-fg)); }
    .item.al .when { color:color-mix(in oklab, var(--al) var(--nw-ink), var(--nw-fg)); }
    /* One bar per point: the one on show fills while it stays. */
    .progress { display:flex; gap:4px; flex:none; }
    .progress i { position:relative; width:18px; height:3px; border-radius:2px; background:var(--nw-line); overflow:hidden; }
    .progress i.done { background:color-mix(in srgb, var(--nw-fg2) 60%, transparent); }
    .progress i.on::after { content:''; position:absolute; inset:0; background:var(--nw-fg2); transform-origin:left; animation:fill var(--step) linear forwards; }
    .paused .progress i.on::after { animation-play-state:paused; }
    @keyframes fill { from { transform:scaleX(0); } }

    /* The track: labels above, the forecast sky as capsules, the needle of now on the left. */
    .track { position:relative; height:62px; margin:0 4px; }
    .track.bare { height:26px; }
    .chips { position:absolute; inset:0 0 auto; height:40px; }
    .pin { position:absolute; top:0; display:flex; flex-direction:column; align-items:center; translate:-50% 0; border:0; background:none; padding:0; cursor:pointer; }
    .pin:focus-visible { outline:none; } .pin:focus-visible .chip { outline:2px solid var(--nw-accent); outline-offset:2px; }
    .chip { --chip:var(--nw-glass-strong); position:relative; display:flex; gap:5px; align-items:center; padding:3px 6px 3px 4px; border-radius:var(--nw-radius-pill);
      white-space:nowrap; font-size:var(--nw-fs-small); line-height:16px; font-weight:600; font-variant-numeric:tabular-nums;
      background:var(--chip); border:1px solid transparent; transition:background .35s, transform .35s var(--nw-ease), box-shadow .35s; }
    /* The outline is drawn above the icons: the ring of the icon in front never eats into it. */
    .chip::before { content:''; position:absolute; inset:-1px; z-index:2; border-radius:inherit; border:1px solid var(--edge, var(--nw-line)); pointer-events:none; }
    .stem { width:1px; height:12px; background:var(--nw-line); }
    .pin.on .chip { --chip:color-mix(in srgb, var(--tone) 40%, var(--nw-bg)); transform:translateY(-2px); --edge:transparent; box-shadow:0 6px 14px rgb(0 0 0 / .12); }
    /* Stacked icons, all in the label's colour: each ringed with it to stand apart; the point on show is darker and comes forward. */
    .stack { display:flex; }
    .mini { position:relative; display:grid; place-items:center; width:20px; height:20px; border-radius:50%;
      background:color-mix(in srgb, var(--nw-fg) 6%, var(--chip)); box-shadow:0 0 0 2px var(--chip); transition:transform .3s var(--nw-ease), background .3s; }
    .mini + .mini { margin-left:-4px; }
    .mini ha-icon { --mdc-icon-size:13px; color:color-mix(in oklab, var(--tone) 40%, var(--nw-fg)); }
    .mini.cur { z-index:1; background:color-mix(in srgb, var(--tone) 70%, var(--nw-bg)); }
    .pin.on .mini.cur { transform:scale(1.12); }
    .count { display:grid; place-items:center; min-width:16px; height:16px; padding:0 4px; box-sizing:border-box; border-radius:8px;
      font-size:var(--nw-fs-label); font-weight:700; background:var(--nw-fg); color:var(--nw-bg); }
    /* A label holding an alert: the charter's alert outline and halo (a fixed shadow whose opacity breathes). */
    .pin.al .chip { --edge:color-mix(in oklab, var(--al) 70%, transparent); box-shadow:0 0 6px 0 color-mix(in oklab, var(--al) 32%, transparent); }
    .pin.al .chip::after { content:''; position:absolute; inset:-1px; border-radius:inherit; pointer-events:none; opacity:0;
      box-shadow:0 0 14px 2px color-mix(in oklab, var(--al) 55%, transparent); animation:nw-glow 5.2s ease-in-out infinite; animation-play-state:var(--nw-motion, running); }
    .lane { position:absolute; left:0; right:0; top:40px; height:16px; display:flex; gap:2px; }
    .track.bare .lane { top:5px; }
    .seg { display:grid; place-items:center; min-width:0; height:100%; overflow:hidden; border-radius:5px; background:color-mix(in srgb, var(--tone) 80%, transparent); }
    .seg:first-child { border-radius:8px 5px 5px 8px; } .seg:last-child { border-radius:5px 8px 8px 5px; } .seg:only-child { border-radius:8px; }
    .seg ha-icon { --mdc-icon-size:11px; color:color-mix(in oklab, var(--tone) 30%, #1f2430); }
    .seg.tight ha-icon { display:none; }
    .s-sun { --tone:var(--nw-heat); } .s-night { --tone:color-mix(in oklab, var(--nw-pressure) 70%, var(--nw-cold)); }
    .s-partly { --tone:color-mix(in oklab, var(--nw-cold) 60%, var(--nw-heat)); } .s-cloud { --tone:color-mix(in srgb, var(--nw-fg2) 35%, var(--nw-bg)); }
    .s-rain { --tone:var(--nw-rain); } .s-storm { --tone:var(--nw-pressure); } .s-snow { --tone:var(--nw-cold); } .s-wind { --tone:var(--nw-wind); }
    .s-hail { --tone:color-mix(in oklab, var(--nw-cold) 55%, var(--nw-pressure)); } .s-fog { --tone:color-mix(in srgb, var(--nw-fg2) 22%, var(--nw-bg)); }
    .compact .clock { display:none; }
    .needle { position:absolute; left:0; top:34px; width:3px; height:28px; margin-left:-1.5px; border-radius:2px; background:var(--nw-fg); box-shadow:0 0 0 2px var(--nw-bg); }
    .track.bare .needle { top:0; height:26px; }
    .hours { position:relative; height:14px; margin:0 4px; font-size:var(--nw-fs-label); line-height:14px; color:var(--nw-fg2); letter-spacing:.04em; font-variant-numeric:tabular-nums; }
    .hours span { position:absolute; translate:-50% 0; white-space:nowrap; }
    .hours span.first { translate:0 0; } .hours span.last { translate:-100% 0; } .hours span.hide { visibility:hidden; }
    @keyframes nw-glow { 50% { opacity:1; } }
    @media (prefers-reduced-motion:reduce) {
      .item, .chip, .mini { transition:none; } .progress i.on::after { animation:none; } .pin.al .chip::after { animation:none; }
    }
  `,x([C({attribute:!1})],j.prototype,"points",2),x([C({attribute:!1})],j.prototype,"alerts",2),x([C({attribute:!1})],j.prototype,"hours",2),x([C({attribute:!1})],j.prototype,"timeline",2),x([S()],j.prototype,"index",2),x([S()],j.prototype,"leaving",2),x([S()],j.prototype,"paused",2),x([S()],j.prototype,"step",2),j=x([V("niak-frise")],j);var jt=["bulletin","events"];function Ht(e,i){return e==="page"?"page m\xE9t\xE9o":e==="card"?"carte compl\xE8te":i?"replier":"d\xE9plier"}function Je(e,i,t,n=c,a=""){return o`<div class="nw-tile" title=${a||c}>${A(e)}<ha-icon icon=${i}></ha-icon><strong>${t}</strong>${n}</div>`}var Ze=(e,i=.1)=>e>=i?o`<span class="nw-ink" style=${N("rain")}>${v(e)} mm</span>`:o`<span class="nw-ink">&nbsp;</span>`;function Ot(e,i,t){if(e===void 0)return o`<span class="tile-wind">&nbsp;</span>`;let n=`Vent ${i===void 0?"":`du ${me(i)} `}${v(e,0)} km/h${t!==void 0&&t>e?`, rafales ${v(t,0)} km/h`:""}`;return o`<span class="tile-wind" title=${n} aria-label=${n}>${i===void 0?c:re(i)}${v(e,0)}</span>`}var Hi=e=>e.tmin===void 0?"\u2014":e.tmin===e.tmax?`${e.tmin} \xB0C`:`${e.tmin}\u2013${e.tmax} \xB0C`,Ye=e=>e.bulletin?.periods.length?o`<div class="block">${A("Les prochains moments")}<div class="moments">${e.bulletin.periods.map(i=>Je(i.label,i.icon,Hi(i),o`<small>${i.phrase}</small>${i.rain>=1?Ze(i.rain):c}`,i.text))}</div></div>`:c;function Xe(e,i,t,n="Pr\xE9visions"){let a=e.hours.slice(0,12).filter(l=>l.temperature!==void 0),r=e.days.slice(0,5);if(!a.length&&!r.length)return c;let p=a.length?r.length?i:"hours":"days",s=l=>d=>{d.stopPropagation(),t(l)};return o`<div class="block"><div class="block-title">${A(n)}
      ${a.length&&r.length?o`<span class="seg" role="group" aria-label="Prévisions affichées">
        <button type="button" aria-pressed=${p==="hours"} @click=${s("hours")} @pointerdown=${Bt}>Heures</button>
        <button type="button" aria-pressed=${p==="days"} @click=${s("days")} @pointerdown=${Bt}>Jours</button></span>`:c}</div>
    ${p==="hours"?o`<div class="hours">${a.map(l=>Je(`${l.hour} h`,l.icon,`${v(l.temperature,0)}\xB0`,o`${Ze(l.precipitation)}${Ot(l.wind,l.bearing,l.gust)}`,l.conditionLabel))}</div>`:o`<div class="days">${r.map(l=>Je(l.label,l.icon,l.high===void 0?"\u2014":`${l.high}\xB0`,o`<span class="lo">${l.low===void 0?"":`${l.low}\xB0`}</span>${Ze(l.rain)}${Ot(l.wind,l.bearing,l.gust)}`,l.conditionLabel))}</div>`}</div>`}var Bt=e=>e.stopPropagation();function Oi(e){let i=e.days.find(n=>n.today);if(!i||i.low===void 0&&i.high===void 0)return c;let t=`Pr\xE9vu aujourd\u2019hui : ${[i.low===void 0?"":`mini ${i.low} \xB0C`,i.high===void 0?"":`maxi ${i.high} \xB0C`].filter(Boolean).join(", ")}`;return o`<span class="range" title=${t} aria-label=${t}>${i.low===void 0?c:o`<span>↓ ${i.low}°</span>`}${i.high===void 0?c:o`<span>↑ ${i.high}°</span>`}</span>`}function et(e,i,t=c){let n=e.now;return o`<div class="nw-now">${i?A("En ce moment"):c}
    <span class="cond" data-entity=${n.conditionEntity??c} title=${n.source}><ha-icon icon=${n.icon}></ha-icon>${n.label}</span>
    ${n.temperature===void 0?o`<span class="cond">Température indisponible</span>`:o`<span class="temp" data-entity=${n.temperatureEntity??c} aria-label=${`${n.temperatureSource} : ${v(n.temperature)} degr\xE9s Celsius`}>${v(n.temperature)}<small>°C</small></span>`}
    ${Oi(e)}${t}<span class="nw-badge">${n.temperatureSource}</span></div>`}var tt=e=>e.points.length||e.alerts.length||e.hours.length||e.timeline?.length?o`<div class="nw-events">${A("\xC9v\xE9nements")}<niak-frise .points=${e.points} .alerts=${e.alerts} .hours=${e.hours} .timeline=${e.timeline}></niak-frise></div>`:c;function It(e,i,t){let n=e.alerts.filter(f=>f.official),[a,...r]=n,s=[...[...e.alerts.filter(f=>!f.official),...r].map(f=>({...f,alert:!0})),...e.points],l=e.bulletin?.summary,d=[["Appui",t.tapTarget],["Appui long",t.holdTarget]].filter(([,f])=>f!=="none"),u=t.tapTarget==="toggle"||t.holdTarget==="toggle",h=d.filter(([f,g])=>f!=="Appui"||g!=="toggle");return o`<div class=${`nw-tilecard${t.open?" open":""}${u?"":" fixed"}${e.now.darkSky?" dark-sky":""}${s.length?"":" quiet"}`}
      role="button" tabindex="0" aria-expanded=${u?t.open:c}
      aria-label=${`M\xE9t\xE9o${e.location?` \xE0 ${e.location}`:""}${d.length?` : ${d.map(([f,g])=>`${f.toLowerCase()} pour ${Ht(g,t.open)}`).join(", ")}`:""}`}>
    <div class="sky" aria-hidden="true">${i}</div><div class="veil" aria-hidden="true"></div><i class="press-ring" aria-hidden="true"></i>
    <div class="top">
      <div class="meta">${e.location?o`<span class="place">${e.location}</span>`:c}${a?ee(a):c}
        ${r.map(f=>o`<div class="reveal"><div>${ee(f)}</div></div>`)}</div>
      <div class="brief"><div><div>${s.length?o`<niak-ticker .points=${s}></niak-ticker>`:c}</div></div></div>
      ${et(e,!1)}
    </div>
    <div class="grabber" aria-hidden="true"><i></i></div>
    <div class="more" ?inert=${!t.open}><div><div class="more-in">
      ${t.blocks.map(f=>f==="bulletin"?l?o`<div class="bulletin">${A("Bulletin du jour")}<p class="nw-bulletin">${Ae(l)}</p></div>`:c:f==="events"?tt(e):f==="moments"?Ye(e):Xe(e,t.tab,t.onTab))}
      <div class="foot"><span>${e.forecastSource}${e.now.temperatureSource!==e.forecastSource?` \xB7 ${e.now.temperatureSource.toLowerCase()}`:""}</span>
        ${h.length?o`<span>${h.map(([f,g])=>`${f} : ${Ht(g,!0)}`).join(" \xB7 ")}</span>`:c}</div>
    </div></div></div>
  </div>`}var Vt=_`
  .nw-tilecard { position:relative; isolation:isolate; overflow:hidden; cursor:pointer; user-select:none; -webkit-user-select:none; -webkit-tap-highlight-color:transparent;
    color:var(--nw-fg); border-radius:inherit; transition:box-shadow .2s; }
  .nw-tilecard:focus-visible { outline:2px solid var(--nw-accent); outline-offset:-2px; }
  /* The sky keeps its drawing size and shrinks as one block: clouds, sun and rain stay in proportion. */
  .sky { position:absolute; top:0; right:0; z-index:-2; width:calc(100% / var(--k)); height:calc(100% / var(--k)); transform:scale(var(--k)); transform-origin:top right; pointer-events:none; }
  .nw-tilecard .sky { --k:.5; --nw-orb-x:calc(100% - 370px); }
  .veil { position:absolute; inset:0; z-index:-1; pointer-events:none; }
  .nw-tilecard .veil { background:linear-gradient(90deg, var(--nw-bg) 0%, color-mix(in srgb, var(--nw-bg) 96%, transparent) 18%,
    color-mix(in srgb, var(--nw-bg) 70%, transparent) 30%, color-mix(in srgb, var(--nw-bg) 30%, transparent) 46%, transparent 64%); }
  /* Unfolded, the timeline has its own frosted glass: the veil keeps the text side and fades the bottom softly, the ground still showing. */
  .nw-tilecard.open .veil { background:linear-gradient(90deg, var(--nw-bg) 0%, color-mix(in srgb, var(--nw-bg) 92%, transparent) 30%, color-mix(in srgb, var(--nw-bg) 40%, transparent) 60%, transparent 85%),
    linear-gradient(0deg, color-mix(in srgb, var(--nw-bg) 55%, transparent) 0%, transparent 30%); }
  .top { display:grid; grid-template-columns:minmax(0,1fr) auto; grid-template-areas:"meta now" "brief now"; column-gap:14px; row-gap:8px; padding:14px 16px; align-items:center; }
  .quiet .top { grid-template-areas:"meta now"; }
  .meta { grid-area:meta; align-self:start; display:flex; flex-direction:column; align-items:flex-start; gap:6px; min-width:0; }
  .place { font-size:var(--nw-fs-small); color:var(--nw-fg2); max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .brief { grid-area:brief; min-width:0; min-height:38px; transition:min-height var(--nw-expand) var(--nw-ease); }
  .quiet .brief { display:none; }
  /* Unfolded, the scrolling bubble folds away: the timeline below shows the same points. */
  .brief > div { display:grid; grid-template-rows:1fr; transition:grid-template-rows var(--nw-expand) var(--nw-ease), opacity .25s; }
  .brief > div > div { min-height:0; overflow:clip; overflow-clip-margin:18px; }
  .open .brief { min-height:0; }
  .open .brief > div { grid-template-rows:0fr; opacity:0; }
  /* Anchored at the top: it does not move when the left column grows as the tile unfolds. */
  .top .nw-now { grid-area:now; align-self:start; position:relative; }
  /* The source fades in under the temperature, out of the flow: nothing moves. */
  .top .nw-now .nw-badge { position:absolute; top:100%; right:0; max-width:none; margin-top:6px; opacity:0; transform:translateY(-4px); transition:opacity .3s .15s, transform .3s .15s; pointer-events:none; }
  .open .top .nw-now .nw-badge { opacity:1; transform:none; }
  /* Folded, extra alerts wait in the scrolling bubble; unfolded, they open gently under the first one. */
  .reveal { display:grid; grid-template-rows:0fr; margin-top:-6px; opacity:0;
    transition:grid-template-rows var(--nw-expand) var(--nw-ease), margin-top var(--nw-expand) var(--nw-ease), opacity .3s .1s; }
  .reveal > div { min-height:0; overflow:clip; overflow-clip-margin:18px; }
  .open .reveal { grid-template-rows:1fr; margin-top:0; opacity:1; }
  /* The unfolding part: the height animates with grid-template-rows, no measuring in script. */
  /* Folded, the hidden part is not drawn at all (visibility waits for the end of the folding): its glass costs nothing on a phone. */
  .more { display:grid; grid-template-rows:0fr; visibility:hidden; transition:grid-template-rows var(--nw-expand) var(--nw-ease), visibility 0s linear var(--nw-expand); }
  .open .more { grid-template-rows:1fr; visibility:visible; transition:grid-template-rows var(--nw-expand) var(--nw-ease), visibility 0s; }
  .more > div { overflow:hidden; min-height:0; }
  .more-in { padding:0 16px 14px; display:flex; flex-direction:column; gap:12px; opacity:0; transform:translateY(-6px); transition:opacity .3s .1s, transform .3s .1s; }
  .open .more-in { opacity:1; transform:none; }
  .bulletin, .nw-events, .block { display:flex; flex-direction:column; gap:6px; }
  .bulletin, .nw-events { gap:4px; }
  /* Moments, hours and days: see-through tiles over the sky, without blur (it would be recomputed at every frame of the sky). */
  .moments, .hours, .days { display:grid; gap:8px; }
  .moments { grid-template-columns:repeat(4, minmax(0,1fr)); }
  .days { grid-template-columns:repeat(5, minmax(0,1fr)); }
  .hours { grid-auto-flow:column; grid-auto-columns:minmax(60px,1fr); overflow-x:auto; scrollbar-width:none; padding-bottom:2px; }
  .nw-tile { display:grid; grid-template-columns:auto minmax(0,1fr); align-items:center; align-content:start; column-gap:8px; row-gap:3px;
    padding:10px 12px; border-radius:var(--nw-radius); min-width:0; box-sizing:border-box;
    background:color-mix(in srgb, var(--nw-bg) 72%, transparent); border:1px solid var(--nw-line); }
  .nw-tile > .nw-label, .nw-tile > small, .nw-tile > .nw-ink { grid-column:1/-1; }
  .nw-tile ha-icon { --mdc-icon-size:24px; }
  .nw-tile strong { font-size:var(--nw-fs-title); line-height:1.2; font-weight:700; letter-spacing:-.3px; white-space:nowrap; }
  .nw-tile small { font-size:var(--nw-fs-small); color:var(--nw-fg2); }
  .hours .nw-tile, .days .nw-tile { grid-template-columns:1fr; justify-items:center; text-align:center; padding:9px 6px; }
  .hours .nw-tile strong, .days .nw-tile strong { font-size:var(--nw-fs-text); }
  .days .lo { font-size:var(--nw-fs-small); font-weight:600; color:var(--nw-fg2); }
  .tile-wind { display:inline-flex; align-items:center; justify-content:center; gap:3px; font-size:var(--nw-fs-small); color:var(--nw-fg2); white-space:nowrap; }
  .tile-wind svg { width:10px; height:10px; fill:color-mix(in oklab, var(--nw-wind) 70%, var(--nw-fg)); }
  .block-title { display:flex; align-items:center; justify-content:space-between; gap:10px; }
  .seg { display:inline-flex; padding:2px; border-radius:var(--nw-radius-pill); border:1px solid var(--nw-line); background:color-mix(in srgb, var(--nw-bg) 72%, transparent); }
  .seg button { font-size:var(--nw-fs-small); line-height:1; font-weight:600; border:0; background:none; color:var(--nw-fg2); padding:5px 10px; border-radius:var(--nw-radius-pill); cursor:pointer; }
  .seg button[aria-pressed=true] { background:var(--nw-bg); color:var(--nw-fg); box-shadow:0 1px 3px #0002; }
  @container (max-width:600px) { .moments { grid-template-columns:repeat(2, minmax(0,1fr)); } }
  .foot { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:4px 10px; font-size:var(--nw-fs-small); color:var(--nw-fg2); }
  .grabber { display:flex; justify-content:center; padding:0 0 8px; }
  .grabber i { width:34px; height:4px; border-radius:4px; background:var(--nw-line); }
  .open .grabber, .fixed .grabber { display:none; }
  /* Long press: a ring fills up under the finger. */
  .nw-tilecard.pressing { box-shadow:inset 0 0 0 3px color-mix(in srgb, var(--nw-accent) 45%, transparent); }
  .press-ring { position:absolute; width:44px; height:44px; margin:-22px 0 0 -22px; border-radius:50%; pointer-events:none; opacity:0;
    background:conic-gradient(var(--nw-accent) calc(var(--p, 0) * 1turn), transparent 0);
    -webkit-mask:radial-gradient(circle, transparent 15px, #000 16px); mask:radial-gradient(circle, transparent 15px, #000 16px); }
  .pressing .press-ring { opacity:.9; }
  @container (max-width:480px) {
    .top { grid-template-areas:"meta now" "brief brief"; }
    .nw-tilecard .sky { --k:.42; --nw-orb-x:calc(100% - 300px); }
    .days { grid-template-columns:repeat(5, minmax(58px,1fr)); overflow-x:auto; scrollbar-width:none; }
  }
  @media (prefers-reduced-motion:reduce) { .more, .more-in, .reveal, .brief, .brief > div, .top .nw-now .nw-badge { transition:none; } }
`;function it(e,i,t,n){let a=e.map((b,w)=>({h:b,i:w})).filter(b=>b.h.temperature!==void 0);if(a.length<3)return c;let r=e.length,p=100/(r-1),s=b=>b*p,l=a.map(b=>b.h.temperature),d=Math.min(...l)-1.5,u=Math.max(...l)+1.5,h=b=>(1-(b-d)/(u-d))*78+8,f=a.map(b=>[s(b.i),h(b.h.temperature)]),g=f.map(([b,w],B)=>B?`C${f[B-1][0]+(b-f[B-1][0])/2} ${f[B-1][1]} ${f[B-1][0]+(b-f[B-1][0])/2} ${w} ${b} ${w}`:`M${b} ${w}`).join(" "),k=a.reduce((b,w)=>w.h.temperature>b.h.temperature?w:b),y=a.reduce((b,w)=>w.h.temperature<b.h.temperature?w:b),$=Math.max(2,...e.map(b=>b.precipitation)),M=e.some(b=>b.precipitation>=.1),T=e.some(b=>b.wind!==void 0),P=[];e.forEach((b,w)=>{if(!b.night)return;let B=P.at(-1);B&&B[1]===w-1?B[1]=w:P.push([w,w])});let m=e.findIndex((b,w)=>w>0&&b.day>e[w-1].day),E=[1,4,7,10,13,16].filter(b=>b<r&&e[b].temperature!==void 0),I=b=>{let w=h(b.h.temperature);return o`<span class=${`pill${w<30?" low":""}`} style=${`left:${Math.min(94,Math.max(6,s(b.i)))}%;top:${w}%`}>${v(b.h.temperature,0)}°</span>`},F=`${n}-fs`,U=`${n}-fa`;return o`<section class="nw-panel" aria-label="18 prochaines heures">${q("mdi:chart-bell-curve-cumulative","wind","18 prochaines heures",i)}
    <div class="fc" data-entity=${t}>
      <div class="fc-marks">${m<0||s(m)>22?o`<span style="left:0">Maintenant</span>`:c}${m>0?o`<span class="next" style=${`left:${s(m)}%`}>Demain</span>`:c}</div>
      <div class="fc-plot" role="img" aria-label=${`Temp\xE9ratures de ${v(y.h.temperature,0)} \xE0 ${v(k.h.temperature,0)} \xB0C${M?`, pluie jusqu\u2019\xE0 ${v(Math.max(...e.map(b=>b.precipitation)))} mm par heure`:", pas de pluie pr\xE9vue"}`}>
        ${P.map(([b,w])=>{let B=Math.max(0,s(b)-p/2),ci=Math.min(100,s(w)+p/2);return o`<i class="fc-night" style=${`left:${B}%;width:${ci-B}%`}></i>`})}
        ${m>0?o`<i class="fc-divider" style=${`left:${s(m)}%`}></i>`:c}
        ${e.map((b,w)=>b.precipitation>=.1?o`<i class="fc-bar" title=${`${b.hour} h : ${v(b.precipitation)} mm`} style=${`left:calc(${s(w)}% - 5px);height:${Math.max(6,b.precipitation/$*42)}%`}></i>`:c)}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs>
          <linearGradient id=${F} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--nw-heat)"/><stop offset="1" stop-color="var(--nw-cold)"/></linearGradient>
          <linearGradient id=${U} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--nw-heat)" stop-opacity=".28"/><stop offset="1" stop-color="var(--nw-cold)" stop-opacity="0"/></linearGradient></defs>
          ${H`<path d=${`${g} L${f.at(-1)[0]} 100 L${f[0][0]} 100Z`} fill=${`url(#${U})`}/><path class="fc-line" d=${g} stroke=${`url(#${F})`}/>`}</svg>
        <i class="fc-dot" style=${`left:${f[0][0]}%;top:${f[0][1]}%;--c:${ae(a[0].h.temperature)}`}></i>
        ${I(k)}${y.i!==k.i&&v(y.h.temperature,0)!==v(k.h.temperature,0)?I(y):c}
      </div>
      <div class="fc-hours">${E.map(b=>{let w=e[b];return o`<div style=${`left:${s(b)}%`} title=${w.conditionLabel}>${A(`${w.hour} h`)}<ha-icon icon=${w.icon}></ha-icon><b>${v(w.temperature,0)}°</b>
          ${w.wind===void 0?c:o`<span class="fc-wind" title=${`Vent ${w.bearing===void 0?"":`du ${me(w.bearing)} `}${v(w.wind,0)} km/h${w.gust!==void 0&&w.gust>w.wind?`, rafales ${v(w.gust,0)} km/h`:""}`}>${w.bearing===void 0?c:re(w.bearing)}${v(w.wind,0)}</span>`}</div>`})}</div>
    </div>
    <div class="nw-legend">${te("Temp\xE9rature","linear-gradient(90deg,var(--nw-cold),var(--nw-heat))")}${M?te("Pluie","var(--nw-rain)","sq"):c}
      ${P.length?te("Nuit","color-mix(in oklab,var(--nw-wind) 30%,transparent)","sq"):c}${T?o`<span>${re(200)}Vent km/h</span>`:c}</div>
  </section>`}function nt(e,i,t){if(!e.length)return c;let n=e.flatMap(l=>l.low??l.high??[]),a=e.flatMap(l=>l.high??l.low??[]),r=Math.min(...n),p=Math.max(...a,r+1),s=l=>(l-r)/(p-r)*100;return o`<section class="nw-panel" aria-label="7 prochains jours">${q("mdi:calendar-week","wind",`${e.length} prochains jours`,i)}
    <div class="wk" data-entity=${t} role="group" aria-label="Températures minimales et maximales en °C, pluie en mm, vent maximal en km/h">
      <span></span><span></span>${A("Min")}<span></span>${A("Max")}${A("Pluie")}${A("Vent")}
      ${e.map((l,d)=>o`${d?o`<i class="rule"></i>`:c}<span class=${`day${l.today?" today":""}`}>${l.label}</span>
        <ha-icon icon=${l.icon} title=${l.conditionLabel}></ha-icon>
        <span class="lo">${l.low===void 0?"":`${l.low}\xB0`}</span>
        <span class="track">${l.low!==void 0&&l.high!==void 0?o`<i style=${`left:${s(l.low)}%;width:${Math.max(2,s(l.high)-s(l.low))}%;background:linear-gradient(90deg,${ae(l.low)},${ae(l.high)})`}></i>`:c}</span>
        <span class="hi">${l.high===void 0?"\u2014":`${l.high}\xB0`}</span>
        <span class="rain">${l.rain>=.1?`${v(l.rain)} mm`:""}</span>
        <span class="wind" title=${l.wind===void 0?"":`Vent ${l.bearing===void 0?"":`du ${me(l.bearing)} `}jusqu\u2019\xE0 ${l.wind} km/h${l.gust!==void 0&&l.gust>l.wind?`, rafales ${l.gust} km/h`:""}`}>${l.wind===void 0?"":o`${l.bearing===void 0?c:re(l.bearing)}${l.wind}`}</span>`)}
    </div>
  </section>`}function qt(e,i,t,n,a=["hours","days","air"]){let r=a.map(s=>s==="hours"?it(e.hours,e.provider,i,t):s==="days"?nt(e.days,e.provider,i):c).filter(s=>s!==c),p=a.some(s=>s!=="air");return o`${r.length?o`<div class=${`panels${r.length===1?" single":""}`}>${r}</div>`:p?o`<p class="nw-empty">Prévisions indisponibles pour le moment.</p>`:c}${a.includes("air")?n:c}`}var Ft=_`
  .panels { display:grid; grid-template-columns:minmax(0,1.35fr) minmax(0,1fr); gap:16px; align-items:stretch; }
  .panels.single { grid-template-columns:minmax(0,1fr); }
  @container (max-width:980px) { .panels { grid-template-columns:minmax(0,1fr); } }
  /* 18 hours */
  .fc { display:grid; grid-template-rows:auto 168px auto; gap:6px; cursor:pointer; }
  .fc-marks { position:relative; height:14px; }
  .fc-marks span { position:absolute; top:0; font-size:var(--nw-fs-label); line-height:13px; font-weight:700; letter-spacing:var(--nw-label-spacing); text-transform:uppercase; color:var(--nw-fg2); white-space:nowrap; }
  .fc-marks .next { transform:translateX(-50%); }
  .fc-plot { position:relative; border-radius:12px; background:linear-gradient(color-mix(in oklab, var(--nw-line) 40%, transparent) 1px, transparent 1px) 0 0/100% 42px; }
  .fc-night { position:absolute; top:0; bottom:0; background:color-mix(in oklab, var(--nw-wind) 14%, transparent); }
  .fc-plot svg { position:absolute; inset:0; width:100%; height:100%; overflow:visible; }
  .fc-line { fill:none; stroke-width:3; stroke-linecap:round; stroke-linejoin:round; vector-effect:non-scaling-stroke; }
  .fc-bar { position:absolute; bottom:0; width:10px; border-radius:6px 6px 2px 2px; background:color-mix(in oklab, var(--nw-rain) 75%, transparent); }
  .fc-divider { position:absolute; top:0; bottom:0; width:0; border-left:1px dashed color-mix(in oklab, var(--nw-fg2) 55%, transparent); }
  .fc-dot { position:absolute; width:10px; height:10px; margin:-5px 0 0 -5px; border-radius:50%; background:var(--nw-bg); border:3px solid var(--c); }
  /* Each hour sits exactly under its point of the curve. */
  .fc-hours { position:relative; height:78px; }
  .fc-hours > div { position:absolute; top:0; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:3px; }
  .fc-hours ha-icon { --mdc-icon-size:20px; }
  .fc-hours b { font-size:var(--nw-fs-text); font-weight:700; }
  .fc-wind { display:inline-flex; align-items:center; gap:3px; font-size:var(--nw-fs-small); color:var(--nw-fg2); white-space:nowrap; }
  .fc-wind svg, .wk .wind svg { width:10px; height:10px; fill:color-mix(in oklab, var(--nw-wind) 70%, var(--nw-fg)); }
  /* 7 days */
  .wk { display:grid; grid-template-columns:auto auto auto minmax(40px,1fr) auto auto auto; align-items:center; column-gap:12px; row-gap:2px; cursor:pointer; }
  .wk > .nw-label { padding-bottom:4px; }
  .wk > .nw-label:nth-child(3), .wk > .nw-label:nth-child(6), .wk > .nw-label:nth-child(7) { text-align:right; }
  .wk .day { font-size:var(--nw-fs-text); font-weight:700; padding:7px 0; }
  .wk .day.today { color:color-mix(in oklab, var(--nw-wind) var(--nw-ink), var(--nw-fg)); }
  .wk ha-icon { --mdc-icon-size:20px; color:var(--nw-fg2); }
  .wk .lo, .wk .hi { font-size:var(--nw-fs-text); font-variant-numeric:tabular-nums; }
  .wk .lo { color:var(--nw-fg2); text-align:right; } .wk .hi { font-weight:700; }
  .wk .track { position:relative; height:6px; border-radius:3px; background:color-mix(in oklab, var(--nw-line) 70%, transparent); }
  .wk .track i { position:absolute; top:0; bottom:0; border-radius:3px; }
  .wk .rain { white-space:nowrap; font-size:var(--nw-fs-small); font-weight:600; color:color-mix(in oklab, var(--nw-rain) var(--nw-ink), var(--nw-fg)); text-align:right; min-width:42px; }
  .wk .wind { display:inline-flex; align-items:center; justify-content:flex-end; gap:3px; white-space:nowrap; font-size:var(--nw-fs-small); color:var(--nw-fg2); min-width:30px; }
  .wk .rule { grid-column:1/-1; height:1px; background:var(--nw-line-soft); }
  @container (max-width:380px) { .wk { column-gap:7px; } .wk .rain { min-width:34px; } }
`;var at=(...e)=>Math.max(0,...e.flatMap(i=>i.length?[i[i.length-1][0]]:[])),Me=(e,i,t=0)=>48-(e-t)/Math.max(1e-6,i-t)*44;function Re(e,i,t,n=0){let a=[],r=[];for(let p of e)p[1]===null?(r.length>1&&a.push(r),r=[]):r.push(p);return r.length>1&&a.push(r),a.map(p=>{let s=p.map(([f,g])=>({x:(f-(t-21600))/21600*100,y:Me(g,i,n)})),l=s.slice(1).map((f,g)=>(f.y-s[g].y)/(f.x-s[g].x)),d=s.map((f,g)=>g===0?l[0]:g===s.length-1?l.at(-1):l[g-1]*l[g]<=0?0:2/(1/l[g-1]+1/l[g]));l.forEach((f,g)=>{if(f===0){d[g]=0,d[g+1]=0;return}let k=Math.hypot(d[g]/f,d[g+1]/f);k>3&&(d[g]*=3/k,d[g+1]*=3/k)});let u=f=>f.toFixed(2),h=`M${u(s[0].x)},${u(s[0].y)}`;for(let f=1;f<s.length;f++){let g=s[f-1],k=s[f],y=(k.x-g.x)/3;h+=` C${u(g.x+y)},${u(g.y+d[f-1]*y)} ${u(k.x-y)},${u(k.y-d[f]*y)} ${u(k.x)},${u(k.y)}`}return{line:h,area:`${h} L${u(s.at(-1).x)},50 L${u(s[0].x)},50 Z`}})}function rt(e,i,t,n){let a=e.filter(d=>d[1]!==null);if(a.length<2)return[];let r=a.reduce((d,u)=>u[1]>d[1]?u:d),p=a.reduce((d,u)=>u[1]<d[1]?u:d),s=d=>Math.min(92,Math.max(8,(d-(i-21600))/21600*100)),l=([d,u])=>({x:s(d),y:t(u)/50*100,text:n(u)});return n(r[1])===n(p[1])?[l(r)]:[l(r),l(p)]}var Ut=e=>e.map(i=>o`<span class=${`pill${i.y<30?" low":""}`} style=${`left:${i.x}%;top:${i.y}%`}>${i.text}</span>`),st=e=>e.length?o`<div class="stats">${e.map(i=>o`<div data-entity=${X(i.entity)}>${A(i.label)}<b>${i.value}</b></div>`)}</div>`:c,Dt=o`<div class="mini-axis">${A("\u22126 h")}${A("\u22123 h")}${A("maintenant")}</div>`,Wt=(e,i)=>e.map(t=>H`
  <path d=${t.area} fill=${`color-mix(in oklab,${i} 16%,transparent)`}/>
  <path d=${t.line} fill="none" stroke=${i} stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>`);function Bi(e,i,t){let n=s=>Math.min(100,Math.max(0,(s+5)/50*100)),a=t?"au thermom\xE8tre":"\xE0 la temp\xE9rature du bulletin",r=e.gap===void 0||Math.abs(e.gap)<.1?"":`${e.gap>0?"+":"\u2212"}${v(Math.abs(e.gap))} \xB0C par rapport ${a}`,p=Ce(`${i}-feel`,{title:"Ressenti",text:o`C’est la température que le corps perçoit. L’humidité et le soleil la font monter, le vent la fait baisser.
      C’est une estimation, pas un indice officiel. <a href="https://github.com/Niakman13/niak-weather#expliquer-le-ressenti" target="_blank" rel="noopener noreferrer">En savoir plus</a>`,example:e.example?`En ce moment : ${e.example}.`:"25 \xB0C au thermom\xE8tre dans un air tr\xE8s humide se ressentent comme 30 \xB0C."});return o`<section class="nw-panel" aria-label="Ressenti">${q("mdi:thermometer","heat","Ressenti",e.source,p)}
    <div class="metric-row">
      <div class="metric" data-entity=${X(e.entity)}><div class="metric-main"><b>${v(e.feels)}</b><span>°C</span></div>
        <small>${[e.word?o`<b>${e.word}</b>`:"",e.humidity,r].filter(Boolean).map((s,l)=>o`${l?" \xB7 ":""}${s}`)}</small></div>
      ${e.factors.length?o`<div class="nw-chips factors">${e.factors.map(O)}</div>`:c}
    </div>
    <div class="rail-line"><span>−5°</span><div class="rail">
      ${e.temperature===void 0?c:o`<i class="thermo" style=${`left:${n(e.temperature)}%`} title=${`${t?"Thermom\xE8tre":"Bulletin"} ${v(e.temperature)} \xB0C`}></i>`}
      <i class="feel" style=${`left:${n(e.feels)}%;--c:${ae(e.feels)}`} title=${`Ressenti ${v(e.feels)} \xB0C`}></i></div><span>45°</span></div>
  </section>`}function ot(e){let i=Math.max(1,...(e.days??[]).map(n=>n.value??0)),t=e.rate!==void 0&&e.rate>0?O({theme:"rain",icon:"mdi:weather-rainy",value:`${v(e.rate)} mm/h`,label:"en ce moment",entity:e.rateEntity}):e.status?O({theme:"rain",icon:"mdi:weather-rainy",label:e.status}):c;return o`<section class="nw-panel" aria-label="Pluie">${q("mdi:weather-rainy","rain","Pluie",e.source)}
    <div class="metric-row"><div class="metric" data-entity=${e.entity}>
      ${e.text?o`<div class="metric-main"><b class="word">${e.text}</b></div>`:o`<div class="metric-main"><b>${e.value===void 0?"\u2014":v(e.value,1,!0)}</b><span>${e.unit}</span></div>`}<small>${e.label}</small></div>${t}</div>
    <div class="mini" title=${e.daysNote}><div class="mini-top">7 derniers jours · mm</div>
      ${e.days?o`<div class="bars" role="img" aria-label="Pluie des 7 derniers jours">${e.days.map(n=>o`<div title=${`${n.date} : ${n.value===void 0?"indisponible":`${n.partial?"au moins ":""}${v(n.value)} mm`}`}>
          <span>${n.value===void 0?"\u2014":n.value?`${n.partial?"\u2265 ":""}${v(n.value)}`:""}</span>
          <i class=${n.value?"":"zero"} style=${`height:${n.value?Math.max(12,n.value/i*74):5}%`}></i></div>`)}</div>
        <div class="bars-axis">${e.days.map(n=>A(n.label.replace(".","")))}</div>`:o`<p class="nw-empty">${e.empty}</p>`}</div>
    ${st(e.stats)}
  </section>`}function ji(e){let i="var(--nw-wind)",t=at(e.mean,e.gust),n=Re(e.mean,e.top,t),a=Re(e.gust,e.top,t);return o`<section class="nw-panel" aria-label="Vent">${q("mdi:weather-windy","wind","Vent",e.source)}
    <div class="metric-row"><div class="metric" data-entity=${e.entity}><div class="metric-main"><b>${e.value===void 0?"\u2014":v(e.value,0)}</b><span>km/h</span></div>
      <small>${e.label}${e.description?` \xB7 ${e.description}`:""}</small></div>
      ${e.status?O({theme:"wind",icon:"mdi:weather-windy",label:e.status}):c}
      ${e.bearing===void 0?c:o`<svg class="compass" viewBox="0 0 72 72" role="img" aria-label=${e.compass} data-entity=${X(e.bearingEntity)}>
        <circle cx="36" cy="36" r="30" fill="color-mix(in oklab,var(--nw-wind) 10%,transparent)" stroke="var(--nw-line)"/>
        <text x="36" y="16" text-anchor="middle" font-size="10" font-weight="700" fill="var(--nw-fg2)">N</text>
        <path d="M36 16 44 46 36 40 28 46Z" fill="color-mix(in oklab,var(--nw-wind) 75%,var(--nw-fg))" transform=${`rotate(${(e.bearing+180)%360} 36 36)`}/></svg>`}</div>
    <div class="mini"><div class="mini-top">6 dernières heures · km/h</div>
      ${n.length||a.length?o`<div class="mini-plot"><svg viewBox="0 0 100 50" preserveAspectRatio="none" role="img" aria-label="Vent des 6 dernières heures, moyennes et rafales par dix minutes">
          ${a.map(r=>H`<path d=${r.line} fill="none" stroke="color-mix(in oklab,var(--nw-wind) 55%,transparent)" stroke-width="2" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/>`)}
          ${Wt(n,i)}</svg>${Ut(rt(e.mean,t,r=>Me(r,e.top),r=>v(r,0)))}</div>${Dt}
        <div class="nw-legend">${te(e.meanLabel,i)}${a.length?te("Rafales",i,"dash"):c}</div>`:o`<p class="nw-empty">${e.empty}</p>`}</div>
    ${st(e.stats)}
  </section>`}function Ii(e){let i=at(e.series),t=Re(e.series,e.top,i,e.low);return o`<section class="nw-panel" aria-label="Pression">${q("mdi:gauge","pressure","Pression",e.source)}
    <div class="metric-row"><div class="metric" data-entity=${X(e.entity)}><div class="metric-main"><b>${e.value===void 0?"\u2014":v(e.value,0)}</b><span>hPa</span></div>
      <small>${e.description}</small></div>${e.trend?O(e.trend):c}</div>
    <div class="mini"><div class="mini-top">6 dernières heures · hPa</div>
      ${t.length?o`<div class="mini-plot"><svg viewBox="0 0 100 50" preserveAspectRatio="none" role="img" aria-label="Pression des 6 dernières heures">${Wt(t,"var(--nw-pressure)")}</svg>${Ut(rt(e.series,i,n=>Me(n,e.top,e.low),n=>v(n,0)))}</div>${Dt}`:o`<p class="nw-empty">${e.empty}</p>`}</div>
    ${st(e.stats)}
  </section>`}var Vi=["comfort","rain","wind","pressure","extras","air"];function Nt(e,i,t,n,a=Vi){let r=d=>d==="rain"?e.rain&&ot(e.rain):d==="wind"?e.wind&&ji(e.wind):d==="pressure"?e.pressure&&Ii(e.pressure):void 0,p=[],s=[],l=()=>{s.length&&p.push(o`<div class=${`grid3 n${s.length}`}>${s}</div>`),s=[]};for(let d of a){let u=r(d);if(u){s.push(u);continue}l(),d==="comfort"&&e.comfort&&p.push(Bi(e.comfort,i,t)),d==="extras"&&e.extras.length&&p.push(o`<div class="nw-chips extras">${e.extras.map(O)}</div>`),d==="air"&&p.push(n)}return l(),o`${p}`}var Gt=_`
  /* Three panels: one column on a phone, two then three as the card widens; the third never leaves a hole. */
  .grid3 { display:grid; grid-template-columns:minmax(0,1fr); gap:16px; }
  @container (min-width:560px) { .grid3 { grid-template-columns:repeat(2, minmax(0,1fr)); } .grid3.n3 > :last-child, .grid3.n1 > * { grid-column:1/-1; } }
  @container (min-width:860px) { .grid3.n3 { grid-template-columns:repeat(3, minmax(0,1fr)); } .grid3.n3 > :last-child { grid-column:auto; } }
  .extras { justify-content:center; }
  .factors { justify-content:flex-end; }
  .metric .word { font-size:var(--nw-fs-title); letter-spacing:-.2px; }
  .compass { width:72px; height:72px; flex:none; }
  /* The feel gauge on one line, its bounds at both ends. */
  .rail-line { display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:10px; font-size:var(--nw-fs-small); color:var(--nw-fg2); padding:6px 0 2px; }
  .rail { position:relative; height:8px; border-radius:var(--nw-radius-pill);
    background:linear-gradient(90deg, var(--nw-cold), var(--nw-rain) 28%, var(--nw-calm) 45%, var(--nw-level1) 62%, var(--nw-heat) 78%, var(--nw-level3)); }
  .rail .thermo { position:absolute; top:50%; width:3px; height:18px; margin:-9px 0 0 -1.5px; border-radius:2px; background:var(--nw-bg); box-shadow:0 0 0 1px var(--nw-line); }
  .rail .feel { position:absolute; top:50%; box-sizing:border-box; width:20px; height:20px; margin:-10px 0 0 -10px; border-radius:50%; background:var(--nw-bg); border:4px solid var(--c); box-shadow:0 1px 4px #0002; }
  /* Rain of the last seven days: the value on each bar. */
  .bars, .bars-axis { display:grid; grid-template-columns:repeat(7, 1fr); gap:6px; }
  .bars { align-items:end; height:66px; }
  .bars > div { display:flex; flex-direction:column; justify-content:flex-end; height:100%; gap:3px; }
  .bars span { font-size:var(--nw-fs-small); font-weight:700; text-align:center; line-height:1; min-height:12px; }
  .bars i { display:block; border-radius:5px 5px 2px 2px; background:color-mix(in oklab, var(--nw-rain) 80%, transparent); min-height:3px; }
  .bars i.zero { background:color-mix(in oklab, var(--nw-line) 80%, transparent); }
  .bars-axis { text-align:center; }
`;function Kt(e,i){let t=e.now,n=e.alerts.find(r=>r.official)??e.alerts[0],a=`M\xE9t\xE9o${e.location?` \xE0 ${e.location}`:""}`;return o`<div class=${`nw-mini${i==="none"?" still":""}`} role=${i==="none"?"group":"button"} tabindex=${i==="none"?-1:0}
      aria-label=${i==="none"?a:`${a} : appui pour ${i==="page"?"la page m\xE9t\xE9o":"la carte compl\xE8te"}`}>
    <ha-icon class="mini-icon" icon=${t.icon}></ha-icon>
    <span class="mini-temp">${t.temperature===void 0?"\u2014":v(t.temperature)}<small>°C</small></span>
    <span class="mini-text"><b>${t.label}</b>${e.location?o`<span>${e.location}</span>`:c}</span>
    ${n?ee(n):c}
  </div>`}function lt(e){return{alerts:e.alerts,points:e.points.filter(i=>i.level>=2&&i.group!=="official")}}function Qt(e,i){let{alerts:t,points:n}=lt(e);return!t.length&&!n.length?i?o`<div class="nw-alertcard quiet-card"><ha-icon icon="mdi:shield-check-outline"></ha-icon><span><b>Aucune alerte en ce moment.</b> Cette carte reste cachée tant que tout est calme.</span></div>`:c:o`<div class="nw-alertcard" role="button" tabindex="0" aria-label="Alertes météo : appui pour la carte complète">
    ${e.location?o`<span class="place">${e.location}</span>`:c}
    ${t.map(a=>Pe(a))}${n.map(a=>Te(a))}
  </div>`}function Jt(e,i,t,n,a){let r=e.hours.some(u=>u.temperature!==void 0),p=e.days.length>0,s=r?p?i:"hours":"days",l=u=>h=>{h.stopPropagation(),t(u)},d=s==="hours"?it(e.hours,e.provider,n,a):nt(e.days,e.provider,n);return o`<div class="nw-forecastcard">
    <div class="fcard-head"><span class="fcard-title"><b>Prévisions</b>${e.location?o`<span>${e.location}</span>`:c}</span>
      ${r&&p?o`<span class="seg" role="group" aria-label="Prévisions affichées">
        <button type="button" aria-pressed=${s==="hours"} @click=${l("hours")}>Heures</button>
        <button type="button" aria-pressed=${s==="days"} @click=${l("days")}>Jours</button></span>`:c}</div>
    ${d===c?o`<p class="nw-empty">Prévisions indisponibles pour le moment.</p>`:d}
  </div>`}function qi(e){let i=e.hours,t=a=>i.slice(0,a).reduce((r,p)=>r+(p.precipitation??0),0),n=i.find(a=>a.precipitation>=.3);return{hour:t(1),six:t(6),next:n?n.hour===0?"minuit":n.hour===12?"midi":`${n.hour} h`:void 0}}function Zt(e){let i=qi(e),n=e.hours.length>0?i.six<.1?o`<div class="nw-chips">${O({theme:"calm",icon:"mdi:weather-partly-cloudy",label:i.next?`Pas de pluie avant ${i.next}`:"Pas de pluie pr\xE9vue d\u2019ici 18 h"})}</div>`:o`<div class="nw-chips">${O({theme:"rain",icon:"mdi:timer-sand",value:`${v(i.hour)} mm`,label:"dans l\u2019heure"})}
        ${O({theme:"rain",icon:"mdi:weather-pouring",value:`${v(i.six)} mm`,label:"sur 6 h"})}
        ${i.next&&i.hour<.1?O({theme:"rain",icon:"mdi:clock-outline",label:`\xE0 partir de ${i.next}`}):c}</div>`:o`<p class="nw-empty">Prévisions indisponibles pour le moment.</p>`;return o`<div class="nw-raincard">
    <div class="fcard-head"><span class="fcard-title"><b>Pluie</b>${e.location?o`<span>${e.location}</span>`:c}</span></div>
    <div class="rain-ahead">${A("\xC0 venir")}${n}</div>
    ${e.rain?ot(e.rain):c}
  </div>`}var Yt=_`
  .nw-mini { display:flex; align-items:center; gap:10px; padding:10px 14px; min-height:56px; box-sizing:border-box; cursor:pointer; color:var(--nw-fg); }
  .nw-mini.still { cursor:default; }
  .nw-mini:focus-visible, .nw-alertcard:focus-visible { outline:2px solid var(--nw-accent); outline-offset:-2px; }
  .mini-icon { --mdc-icon-size:30px; color:color-mix(in oklab, var(--nw-wind) var(--nw-ink), var(--nw-fg)); flex:none; }
  .mini-temp { font-size:24px; font-weight:700; letter-spacing:-.6px; white-space:nowrap; line-height:1; }
  .mini-temp small { font-size:var(--nw-fs-small); font-weight:400; vertical-align:super; margin-left:1px; letter-spacing:0; }
  .mini-text { display:flex; flex-direction:column; min-width:0; flex:1; line-height:1.3; }
  .mini-text b { font-size:var(--nw-fs-text); font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .mini-text span { font-size:var(--nw-fs-small); color:var(--nw-fg2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .nw-mini .nw-alert { flex:none; max-width:46%; }
  /* Narrow: the sky, the temperature and the vigilance; the words give way. */
  @container (max-width:300px) { .mini-text { display:none; } .nw-mini .nw-alert { max-width:none; margin-left:auto; } }

  .nw-alertcard { display:flex; flex-direction:column; align-items:stretch; gap:8px; padding:12px 14px; cursor:pointer; color:var(--nw-fg); }
  .nw-alertcard .place { font-size:var(--nw-fs-small); color:var(--nw-fg2); }
  .nw-alertcard .nw-bubble { max-width:none; }
  .quiet-card { flex-direction:row; align-items:center; gap:10px; cursor:default; color:var(--nw-fg2); font-size:var(--nw-fs-text); }
  .quiet-card ha-icon { --mdc-icon-size:22px; color:color-mix(in oklab, var(--nw-calm) var(--nw-ink), var(--nw-fg)); flex:none; }
  .quiet-card b { color:var(--nw-fg); font-weight:600; }

  .nw-forecastcard { display:flex; flex-direction:column; gap:12px; padding:14px 16px 16px; }
  .fcard-head { display:flex; align-items:center; justify-content:space-between; gap:10px; }
  .fcard-title { display:flex; align-items:baseline; gap:8px; min-width:0; }
  .fcard-title b { font-size:var(--nw-fs-title); font-weight:700; letter-spacing:-.2px; }
  .fcard-title span { font-size:var(--nw-fs-small); color:var(--nw-fg2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  /* The full card's panels, without their frame: the card is the frame. */
  .nw-forecastcard .nw-panel, .nw-raincard .nw-panel { border:0; padding:0; background:none; }
  .nw-forecastcard .nw-panel-head { display:none; }
  .nw-raincard { display:flex; flex-direction:column; gap:12px; padding:14px 16px 16px; }
  .rain-ahead { display:flex; flex-direction:column; gap:6px; padding-bottom:12px; border-bottom:1px solid var(--nw-line-soft); }
  /* The panel's own title says « Pluie » again: only its source pill stays, on the right. */
  .nw-raincard .nw-panel-head :is(.nw-panel-icon, h3) { display:none; }
`;var Xt={6:["calm","calm","level1","level2","level3","pressure"],4:["calm","level1","level2","level3"]},ze=(e,i)=>e&&!e.stale&&e.value!==void 0&&e.value<=i&&(i!==6||e.value>=1)?e.value:void 0;function Fi(e,i){let t=ze(e,i),n=Xt[i]??Xt[6],a=360/i,r=p=>{let s=(p*a-88)*Math.PI/180,l=((p+1)*a-92)*Math.PI/180,d=32,u=38;return H`<path d=${`M${u+d*Math.cos(s)} ${u+d*Math.sin(s)} A${d} ${d} 0 0 1 ${u+d*Math.cos(l)} ${u+d*Math.sin(l)}`} fill="none" stroke-width="9" stroke-linecap="round"
      stroke=${t!==void 0&&p<t?`var(--nw-${n[p]})`:"color-mix(in oklab,var(--nw-fg) 10%,transparent)"}/>`};return o`<svg class="disc" viewBox="0 0 76 76" aria-hidden="true">${n.map((p,s)=>r(s))}
    <text x="38" y="44" text-anchor="middle" font-size="17" font-weight="700" fill="currentColor">${t??"\u2013"}</text></svg>`}function Ui(e){let i=e.reading,t=e.concentration,n=r=>r.value===void 0?"concentration indisponible":`${v(r.value,2)}${r.unit?` ${r.unit}`:""}`;return`${i.unit!==void 0?n(i):`${i.label}${t?` \xB7 ${n(t)}`:""}`}${i.stale?" \xB7 donn\xE9es anciennes":""}`}function Di(e){let i=e.kind==="air",t=e.primary,n=e.scale??6,a=ze(t,n),r=n===6,p=e.source??(r?"Atmo France":"Polleninformation"),s=e.worse?ze(e.worse.reading,n)??0:0,l=!i&&r&&e.tomorrow&&!t?.stale&&t?.unavailableReason==="no_index",d=!i&&r&&e.details.some(h=>h.concentration?.value===0&&ze(h.reading,n)===void 0),u=l?"Pr\xE9vision non disponible":t?t.stale?"Donn\xE9es anciennes":t.value===7?"\xC9v\xE9nement signal\xE9":t.label:"Indice non configur\xE9";return o`<section class="nw-panel" aria-label=${`${i?"Air ext\xE9rieur":"Pollens"} ${e.tomorrow?"demain":"aujourd\u2019hui"}`}>
    ${q(i?"mdi:air-filter":"mdi:flower-pollen-outline","calm",i?"Air ext\xE9rieur":"Pollens",p)}
    <p class="nw-sub">${e.tomorrow?"Demain":"Aujourd\u2019hui"}${e.zone?` \xB7 ${e.zone}`:""}</p>
    <div class="aq" data-entity=${t?.entityId??c} role=${t?"button":c} tabindex=${t?0:c}>${Fi(t,n)}
      <div class="txt">${A(e.tomorrow?"Indice de demain":"Indice du jour")}<strong>${u}</strong>
        <small>${a!==void 0?`Niveau ${a} sur ${n}`:t?.value===7&&r?"Code 7 \xB7 hors \xE9chelle":l?"Indice pollen non fourni":"Niveau indisponible"}</small></div></div>
    ${l?o`<p class="availability-note">Atmo France ne fournit pas d’indice pollen exploitable pour demain à cet endroit.</p>`:c}
    ${e.worse?o`<div class="nw-chips">${O({theme:`level${Math.min(3,Math.max(1,s-(r?2:1)))}`,icon:"mdi:alert-circle-outline",value:e.worse.label,label:e.worse.reading.label.toLowerCase(),entity:e.worse.reading.entityId})}</div>`:c}
    ${e.details.length||e.updated?o`<details class="nw-details"><summary><ha-icon icon="mdi:chevron-right"></ha-icon>${i?"D\xE9tail des polluants":"D\xE9tail des pollens"}</summary>
      ${e.details.length?o`<ul>${e.details.map(h=>o`<li data-entity=${h.reading.entityId}><span>${h.label}</span><b>${Ui(h)}</b></li>`)}</ul>`:c}
      ${d?o`<p>Une concentration à 0 peut être une valeur réelle ou remplacer une donnée manquante chez Atmo France. Elle ne permet pas, à elle seule, de conclure à une absence de pollen.</p>`:c}
      ${e.updated?o`<p>${r&&!e.source?"Publication Atmo":`Mise \xE0 jour ${p}`} : ${e.updated}.${e.stale?" Certaines donn\xE9es sont anciennes : \xE0 v\xE9rifier dans l\u2019int\xE9gration.":""}</p>`:c}</details>`:c}
  </section>`}var pt=e=>e.length?o`<div class="panels-two">${e.map(Di)}</div>`:c,ei=_`
  .panels-two { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:16px; align-items:stretch; }
  .panels-two > :only-child { grid-column:1/-1; }
  @container (max-width:640px) { .panels-two { grid-template-columns:minmax(0,1fr); } }
  .availability-note { color:var(--nw-fg2); font-size:var(--nw-fs-small); line-height:1.5; }
  .aq { display:grid; grid-template-columns:auto minmax(0,1fr); align-items:center; gap:16px; }
  .aq .disc { width:76px; height:76px; }
  .aq .txt { display:flex; flex-direction:column; gap:2px; min-width:0; }
  .aq strong { font-size:var(--nw-fs-title); font-weight:700; }
  .aq small { font-size:var(--nw-fs-small); color:var(--nw-fg2); }
`;var Wi=[{key:"official",title:"Vigilance officielle"},{key:"now",title:"Maintenant"},{key:"future",title:"\xC0 venir"},{key:"environment",title:"Air et pollens"}];function Ni(e,i){let t=e.brief,n=t?Wi.map(a=>({...a,signals:t.signals.filter(r=>r.group===a.key&&(r.severity>0||e.points.some(p=>p.text===r.text)))})).filter(a=>a.signals.length):[];return Ce(`${i}-brief`,{title:"Synth\xE8se",text:o`La météo du jour en une phrase, avec ce qui compte maintenant et ce qui arrive.
      ${n.map(a=>o`<div class="brief-group">${A(a.title)}<ul>${a.signals.map(r=>o`<li data-entity=${r.entity??c}>
        <ha-icon icon=${r.icon}></ha-icon><span>${r.text}</span></li>`)}</ul></div>`)}
      ${t?.caveats.length?o`<div class="brief-group">${A("\xC0 v\xE9rifier")}<ul>${t.caveats.map(a=>o`<li><ha-icon icon="mdi:alert-circle-outline"></ha-icon><span>${a}</span></li>`)}</ul></div>`:c}`,example:"\xAB Pluie ce soir, puis \xE9claircies demain matin. \xBB"})}function ti(e,i,t,n,a){let r=e.now.trend===void 0?c:o`<span class="nw-chip" style=${N(e.now.trend>0?"heat":"cold")}
    title=${e.now.trend>0?"La temp\xE9rature monte":"La temp\xE9rature baisse"}><ha-icon icon=${e.now.trend>0?"mdi:arrow-top-right":"mdi:arrow-bottom-right"}></ha-icon>${e.now.trend>0?"+":"\u2212"}${v(Math.abs(e.now.trend))} °C/h</span>`,p=e.season.news?o`<span class="nw-chip" style=${N("calm")} title=${e.season.tip}><ha-icon icon=${e.season.info.icon}></ha-icon>${e.season.news}</span>`:c,s=e.alerts.filter(u=>u.official),l=ct(e),d=n[0]==="bulletin"?n.slice(1):n;return o`<section class=${`nw-hero${e.now.darkSky?" dark-sky":""}`} aria-label="Synthèse">
    <div class="sky" aria-hidden="true">${i}</div><div class="veil" aria-hidden="true"></div>
    <header class="fm-head"><h2>Synthèse</h2>${Ni(e,t)}<span>${[e.location,e.dateLabel].filter(Boolean).join(" \xB7 ")}</span>${p}</header>
    <div class="hero-main">
      ${s.length?o`<div class="nw-alerts">${s.map(u=>ee(u))}</div>`:c}
      ${n[0]==="bulletin"?l:c}
    </div>
    ${et(e,!0,r)}
    ${d.length?o`<div class="hero-blocks">${d.map(a)}</div>`:c}
  </section>`}var ct=e=>e.bulletin?o`${A("Bulletin du jour")}<p class="nw-bulletin">${Ae(e.bulletin.summary)}</p>`:c,ii=_`
  .nw-hero { position:relative; isolation:isolate; overflow:hidden; padding:20px 24px 24px; display:grid; grid-template-columns:minmax(0,1fr) auto;
    grid-template-areas:"head now" "main now" "blocks blocks"; column-gap:24px; row-gap:12px; color:var(--nw-fg); }
  .nw-hero .sky { --k:1; }
  /* The text side stays readable; the bottom fades softly towards the next section, light enough for the ground (puddles, snow) to show. */
  .nw-hero .veil { background:linear-gradient(90deg, var(--nw-bg) 0%, color-mix(in srgb, var(--nw-bg) 92%, transparent) 30%,
    color-mix(in srgb, var(--nw-bg) 45%, transparent) 55%, transparent 78%),
    linear-gradient(0deg, color-mix(in srgb, var(--nw-bg) 55%, transparent) 0%, transparent 30%); }
  .nw-hero > .fm-head { grid-area:head; cursor:default; flex-wrap:wrap; }
  .hero-main { grid-area:main; display:flex; flex-direction:column; align-items:flex-start; gap:10px; min-width:0; }
  .nw-alerts { display:flex; flex-wrap:wrap; gap:8px; max-width:100%; }
  .nw-hero .nw-bulletin { animation:nw-rise .7s var(--nw-ease) both; }
  @keyframes nw-rise { from { opacity:0; filter:blur(3px); } }
  .nw-hero > .nw-now { grid-area:now; align-self:start; gap:4px; }
  .nw-hero > .nw-now .temp { font-size:var(--nw-fs-temp); }
  .nw-hero > .nw-now .temp small { font-size:var(--nw-fs-title); }
  .hero-blocks { grid-area:blocks; display:flex; flex-direction:column; gap:14px; margin-top:4px; min-width:0; }
  .hero-blocks > .nw-events, .hero-blocks > .hero-bulletin, .hero-blocks > .block { display:flex; flex-direction:column; gap:6px; }
  .brief-group { margin-top:10px; }
  .brief-group ul { list-style:none; margin:4px 0 0; padding:0; display:grid; gap:4px; }
  .brief-group li { display:flex; align-items:flex-start; gap:7px; font-size:var(--nw-fs-small); }
  .brief-group li ha-icon { --mdc-icon-size:15px; color:var(--nw-fg2); margin-top:1px; }
  @media (prefers-reduced-motion:reduce) { .nw-hero .nw-bulletin { animation:none; } }
  @container (max-width:650px) {
    .nw-hero { grid-template-columns:minmax(0,1fr); grid-template-areas:"head" "now" "main" "blocks"; padding:16px 14px 18px; }
  }
`;function ni(e,i,t,n,a){let r=n.folded[e],p=s=>{s instanceof KeyboardEvent&&s.key!=="Enter"&&s.key!==" "||(s.preventDefault(),n.onFold(e))};return o`<section class=${`fm-section${r?" folded":""}`} aria-labelledby=${`${n.uid}-${e}`}>
    <header class="fm-head" role="button" tabindex="0" aria-expanded=${!r} @click=${p} @keydown=${p}>
      <h2 id=${`${n.uid}-${e}`}>${i}</h2><span>${t}</span>
      <span class="fm-fold" aria-hidden="true"><ha-icon icon="mdi:chevron-down"></ha-icon></span></header>
    ${r?c:o`<div class="fm-body">${a()}</div>`}
  </section>`}function ai(e,i){let{hero:t,banner:n,today:a,forecasts:r}=i.sections,p=s=>s==="bulletin"?o`<div class="hero-bulletin">${ct(e)}</div>`:s==="events"?tt(e):s==="moments"?Ye(e):Xe(e,i.tab,i.onTab);return o`<div class="nw-full">
    ${t?ti(e,i.sky,i.uid,n,p):c}
    ${a.length?ni("today","Aujourd\u2019hui",e.comfort?"Mesures et ressenti":"Conditions actuelles",i,()=>Nt(e,i.uid,i.station,pt(e.air.today),a)):c}
    ${r.length?ni("predictions","Pr\xE9visions",e.forecastSource,i,()=>qt(e,i.entity,i.uid,pt(e.air.tomorrow),r)):c}
  </div>`}var ri=_`
  .nw-full { container-type:inline-size; color:var(--nw-fg); }
  .fm-section { padding:20px 24px 24px; border-top:1px solid var(--nw-line-soft); }
  .nw-full > .fm-section:first-child { border-top:0; }
  .fm-head { display:flex; align-items:center; gap:10px; min-width:0; }
  .fm-section > .fm-head { cursor:pointer; user-select:none; -webkit-user-select:none; border-radius:var(--nw-radius); }
  .fm-head:focus-visible { outline:2px solid var(--nw-accent); outline-offset:4px; }
  .fm-head h2 { margin:0; font-size:var(--nw-fs-title); font-weight:750; letter-spacing:-.2px; }
  .fm-head > span:not(.fm-fold):not(.nw-chip) { font-size:var(--nw-fs-small); color:var(--nw-fg2); flex:1; min-width:0; }
  .fm-fold { display:grid; place-items:center; width:30px; height:30px; flex:none; border-radius:var(--nw-radius-pill); border:1px solid var(--nw-line); background:var(--nw-bg); color:var(--nw-fg2); }
  .fm-fold ha-icon { --mdc-icon-size:20px; transition:transform .3s; }
  .folded .fm-fold ha-icon { transform:rotate(-90deg); }
  .fm-body { display:grid; gap:16px; margin-top:16px; }
  @container (max-width:560px) { .fm-section { padding:16px 14px 18px; } }
`;var si=[{d:"M58 0 43 40 61 52 35 88 49 97 24 144 37 151 12 217M43 40 23 56 34 67 17 91M35 88 72 107 64 121 88 147",delay:0},{d:"M42 0 62 35 48 52 81 87 67 102 92 153 80 171 104 216M62 35 85 40 81 58 105 80",delay:-2.1},{d:"M70 0 52 30 66 44 40 78 58 86 30 130 44 136 26 190M52 30 34 42 40 56M40 78 18 96",delay:-4.2}],z=class extends R{constructor(){super(...arguments);this.condition="unknown";this.phase="unknown";this.quality="standard";this.animated=!0;this.wind=0;this.season="";this.visible=!1;this.pageVisible=!0;this.visibility=()=>{this.pageVisible=!document.hidden}}connectedCallback(){super.connectedCallback(),this.visibility(),document.addEventListener("visibilitychange",this.visibility),typeof IntersectionObserver<"u"?(this.observer=new IntersectionObserver(t=>{this.visible=t.some(n=>n.isIntersecting)}),this.observer.observe(this)):this.visible=!0}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),document.removeEventListener("visibilitychange",this.visibility)}cloud(t){return o`<div class=${`cloud ${t}`}><svg viewBox="0 0 180 112" aria-hidden="true">
      <path class="cloud-rear" d="M42 103C21 103 7 90 7 70C7 53 17 40 33 36C35 16 50 5 69 5C91 5 107 19 109 40C116 37 123 36 130 36C154 36 172 51 172 73C172 92 157 103 137 103Z"/>
      <path class="cloud-near" d="M38 103C26 103 19 95 19 84C19 73 27 65 36 64C38 52 47 45 59 45C72 45 82 54 83 65C99 62 116 72 116 85C116 96 108 103 94 103Z"/>
    </svg></div>`}stars(t){return Array.from({length:t},(n,a)=>{let r=2.2+a*7%10*.26;return o`<i class=${`star${a%6===0?" bright":""}`} style=${`--sx:${48+a*37%50}%;--sy:${4+a*53%62}%;--ss:${1.2+a%4*.5}px;--st:${r}s;--sd:${-(a*.73%r)}s`}></i>`})}fog(){let t=this.quality==="low"?3:5;return o`${this.phase==="day"||this.phase==="twilight"?o`<div class="fog-sun"></div>`:c}
      ${Array.from({length:t},(n,a)=>o`<div class=${`fog-band depth-${a%3}`} style=${`--fy:${6+a*16}%;--fl:${[-10,18,-25,30,0][a]}%;--fw:${[120,95,140,85,130][a]}%;--fd:${13+a*3}s;--fdelay:${-a*2.7}s;--dir:${a%2?-1:1}`}><svg viewBox="0 0 600 60" preserveAspectRatio="none"><path d="M0 34C60 16 130 20 190 30S330 48 400 32 520 14 600 28V60H0Z"/></svg></div>`)}`}static flake(t){let n="";for(let a=0;a<6;a++){let r=a*Math.PI/3,p=Math.cos(r),s=Math.sin(r),l=y=>[p*y,s*y],[d,u]=l(t);n+=`M0 0L${d.toFixed(1)} ${u.toFixed(1)}`;for(let[y,$]of[[.42,.3],[.68,.22]]){let[M,T]=l(t*y);for(let P of[-1,1]){let m=r+P*Math.PI/4;n+=`M${M.toFixed(1)} ${T.toFixed(1)}l${(Math.cos(m)*t*$).toFixed(1)} ${(Math.sin(m)*t*$).toFixed(1)}`}}let[h,f]=l(t*.24),[g,k]=[Math.cos(r+Math.PI/3)*t*.24,Math.sin(r+Math.PI/3)*t*.24];n+=`M${h.toFixed(1)} ${f.toFixed(1)}L${(Math.cos(r+Math.PI/6)*t*.36).toFixed(1)} ${(Math.sin(r+Math.PI/6)*t*.36).toFixed(1)}L${g.toFixed(1)} ${k.toFixed(1)}`}return n}static planeTint(t){let n=[["#d9a531","#e8b84a","#c76a26"],["#8f9e3e","#e29a34","#b5502a"],["#b64a2b","#c9572f","#7f2c1f"]][t];return H`<linearGradient id=${`nw-plane-${t}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color=${n[0]}/><stop offset=".55" stop-color=${n[1]}/><stop offset="1" stop-color=${n[2]}/></linearGradient>`}frostPane(){let t=[[372,34,58,.9,8,0],[300,18,34,.75,-12,.8],[404,112,30,.7,20,1.6],[246,52,22,.55,4,2.2],[330,88,18,.6,-6,1.2],[214,16,15,.45,14,2.8],[388,158,13,.45,-10,3.2],[270,108,11,.4,0,2],[176,40,12,.35,22,3.6],[140,12,9,.3,-14,4]],n=[[350,70,16],[262,30,10],[396,60,9],[220,78,7]],a=[[318,52],[244,10],[402,22],[286,74],[196,58]];return o`<svg class="frost-pane" viewBox="0 0 420 170" preserveAspectRatio="xMaxYMin meet" aria-hidden="true">
      <defs><radialGradient id="nw-bokeh"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      ${n.map(([r,p,s],l)=>H`<circle class="frost-bokeh" fill="url(#nw-bokeh)" cx=${r} cy=${p} r=${s} style=${`--fd:${l*1.1}s`}/>`)}
      ${t.map(([r,p,s,l,d,u])=>H`<g transform=${`translate(${r} ${p}) rotate(${d})`}><path class="frost-flake" style=${`--fo:${l};--fd:${u}s;stroke-width:${Math.max(1.2,s*.11)}`} d=${z.flake(s)}/></g>`)}
      ${a.map(([r,p],s)=>H`<path class="frost-spark" style=${`--fd:${s*.7}s`} transform=${`translate(${r} ${p})`} d="M0 -6L1.2 -1.2L6 0L1.2 1.2L0 6L-1.2 1.2L-6 0L-1.2 -1.2Z"/>`)}
    </svg>`}seasonal(t,n,a){let r=this.quality==="low",p=n||["windy","windy-variant"].includes(this.condition)||this.wind>=30,s=(l,d)=>Array.from({length:r?2:l},(u,h)=>o`<div class=${`drift${p?" drift--gusty":""}`} style=${`--dx:${46+h*23%50}%;--dt:${(p?5:11)+h*7%(p?4:7)}s;--dd:${-(h*3.1)%11}s;--rest:${12+h*29%70}%;--sw:${2.6+h%3*.5}s`}><i>${d(h)}</i></div>`);return this.season==="spring"&&!t&&!n&&!a?s(6,l=>o`<svg class=${`petal petal-${l%2}`} viewBox="0 0 12 12"><path d="M6 0C10 3 10 9 6 12C2 9 2 3 6 0Z"/></svg>`):this.season==="autumn"&&!["snowy","snowy-rainy","hail"].includes(this.condition)?s(5,l=>o`<svg class=${`plane plane-${l%3}`} viewBox="0 0 44 44"><defs>${z.planeTint(l%3)}</defs>
      <path class="stem" d="M22 30.5Q23 37 21 42.5"/><path class="blade" fill=${`url(#nw-plane-${l%3})`} d="M22 32Q14 34 8 31L4 28.5L7.5 27Q11 25.5 10 22.5L4.5 21L6.5 19.5L1 13L4.5 12.5L3 9Q8 9 10.5 12L11.5 10Q14.5 13 16 16Q15.3 11 16.8 7.6L15.4 6.2L18.8 5.3Q20.8 3.6 22 1Q23.2 3.6 25.2 5.3L28.6 6.2L27.2 7.6Q28.7 11 28 16Q29.5 13 32.5 10L33.5 12Q36 9 41 9L39.5 12.5L43 13L37.5 19.5L39.5 21L34 22.5Q33 25.5 36.5 27L40 28.5L36 31Q30 34 22 32Z"/><path class="veins" d="M22 31V4M22 31Q14 22 3.5 10M22 31Q30 22 40.5 10M22 31Q14 29 5 28.5M22 31Q30 29 39 28.5M22 19L17 13.5M22 19L27 13.5M22 12L19 8.5M22 12L25 8.5M13.5 21.5L8.5 18.5M30.5 21.5L35.5 18.5M10 17L6.5 12.5M34 17L37.5 12.5"/></svg>`):this.season==="summer"&&this.phase==="day"&&["sunny","partlycloudy"].includes(this.condition)?o`<div class="heat">${Array.from({length:r?3:7},(l,d)=>o`<div class="heat-plume" style=${`--hx:${47+d*13%46}%;--hh:${70+d*17%45}px;--hd:${-(d*.9)%4.2}s;--hs:${1.6+d%3*.35}s`}><svg viewBox="0 0 24 120" preserveAspectRatio="none"><defs><linearGradient id=${`nw-heat-${d}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" class="heat-stop" stop-opacity="0"/><stop offset=".35" class="heat-stop" stop-opacity=".6"/><stop offset="1" class="heat-stop" stop-opacity="0"/></linearGradient></defs><path stroke=${`url(#nw-heat-${d})`} d="M12 120C4 104 20 92 12 76S4 48 12 32S20 10 12 0"/></svg></div>`)}</div>`:this.season==="winter"?this.frostPane():c}render(){let t=["rainy","pouring","lightning-rainy","snowy-rainy","hail"].includes(this.condition),n=["snowy","snowy-rainy","hail"].includes(this.condition),a=["lightning","lightning-rainy"].includes(this.condition),r=this.condition==="hail",p=this.condition==="fog",s=!p&&!["sunny","clear-night","unknown","exceptional"].includes(this.condition),l=["sunny","clear-night","partlycloudy","windy"].includes(this.condition),d=["windy","windy-variant"].includes(this.condition),u=this.condition==="pouring",h=this.quality==="low",f=h?8:u?80:r?18:t?44:n?90:20,g=(y,$=f)=>Array.from({length:$},(M,T)=>{let P=y==="snow"?h?[1,3][T%2]:T%4:T%3,m=y==="rain"?(u?.45:.8)+P*.22:y==="snow"?[13,10.5,8.5,7][P]+T*7%5*.5:y==="hailstone"?1.9+T*37%8/10:3+P,E=y==="snow"?[3,5,7,11][P]:y==="hailstone"?4+T%3:2+P;return o`<i class=${`particle ${y} depth-${P}`} style=${`--x:${(T*37+7)%100}%;--delay:${-(T*13%37)/37*m}s;--duration:${m}s;--size:${E}px;--rest:${(T*19+8)%88}%;--drift:${u?-85:-38}px;--amp:${[4,7,10,14][P]}px;--sw:${2.6+T*5%20/10}s;--dx:${(T%2?1:-1)*(5+(T*5*37+11)%8)}px`}></i>`}),k=y=>o`<div class="wet"></div>${Array.from({length:h?Math.min(y,5):y},($,M)=>o`<i class="splash" style=${`--x:${4+(M*11*37+11)%92}%;--d:${1.1+(M*37+11)%7/10}s;--dl:-${(M*3*37+11)%150/100}s`}></i>`)}`;return o`<div class=${`scene ${this.phase} ${this.condition}${this.season?` season-${this.season}`:""}`} style=${`--play:${this.animated&&this.visible&&this.pageVisible?"running":"paused"};--cloud-duration:${d?6:Math.max(11,28-Math.min(Math.max(this.wind,0),60)/2.5)}s`} ?data-still=${!this.animated}>
      <div class="weather-art">${this.condition!=="unknown"&&this.condition!=="exceptional"?o`
        ${this.phase==="night"&&l?this.stars(this.quality==="low"?8:this.condition==="partlycloudy"?12:24):c}
        ${l?this.phase==="night"?o`<div class="orb moon"><i></i><b></b></div>`:o`<div class="orb sun"><i></i></div>`:c}
        ${u||a||r?o`<div class="overcast"></div>${this.cloud("heavy-left")}${h?c:this.cloud("heavy-right")}`:s?o`${this.cloud("back")}${this.cloud("front")}${h?c:this.cloud("small")}`:c}
        ${p?this.fog():c}
        ${this.condition!=="unknown"?this.seasonal(t||n,a,p):c}
        ${t?g("rain",r&&!h?18:f):c}${n?g(r?"hailstone":"snow",r&&!h?30:f):c}
        ${t?k(u?18:r?8:14):c}
        ${this.condition==="snowy"?o`<div class="snowbank"><svg viewBox="0 0 400 20" preserveAspectRatio="none"><defs><linearGradient id="nw-snowbank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#dfe9f4"/></linearGradient></defs>
          <path d="M0 20V11C22 6 40 13 66 9S112 4 140 9 190 14 222 8 276 4 306 10 360 13 400 8V20Z"/></svg>
          ${Array.from({length:h?3:8},(y,$)=>o`<i style=${`--x:${6+($*13*37+11)%88}%;--dl:-${($*37+11)%26/10}s`}></i>`)}</div>`:c}
        ${d?o`
          <div class="gust"><svg viewBox="0 0 420 100"><path d="M0 32h270c50 0 50-28 18-28M65 59h290c48 0 50 33 18 33M130 80h90"/></svg></div>
          <div class="gust second"><svg viewBox="0 0 420 100"><path d="M0 28h300c40 0 40-24 15-24M50 58h210c48 0 48 33 17 33"/></svg></div>
          ${Array.from({length:this.quality==="low"?2:5},(y,$)=>o`<div class="leaf-track" style=${`--leaf-top:${28+$*12}%;--leaf-delay:${-$*1.3}s;--leaf-time:${3.8+$*.5}s`}><div class="leaf"><svg viewBox="0 0 28 18"><path d="M2 9C8-2 21 1 27 4C23 17 9 20 2 9Z"/><path d="M0 10 22 6"/></svg></div></div>`)}
        `:c}
        ${a?o`${si.map((y,$)=>o`<div class=${`bolt b${$+1}`} style=${`animation-delay:${y.delay}s`}><svg viewBox="0 0 120 220"><path d=${y.d}/></svg></div>`)}
          ${si.map((y,$)=>o`<div class=${`flash f${$+1}`} style=${`animation-delay:${y.delay}s`}></div>`)}`:c}
      `:c}</div>
    </div>`}};z.styles=_`
    :host {display:block;position:absolute;inset:0;overflow:hidden;pointer-events:none;}
    /* The sky colour is a faded layer under the artwork: the drawings stay crisp while the card background shows through.
       Night and storm keep more of their colour, because their artwork (stars, moon, bolts) needs a dark sky. */
    .scene {position:absolute;inset:0;overflow:hidden;--sky:linear-gradient(150deg,#5689b8,#6cb4df 65%,#a3d0e6);--tint:.42;}
    .scene::before {content:'';position:absolute;inset:0;background:var(--sky);opacity:var(--tint);}
    /* Seasonal light: a faint wash on the artwork side, under everything else. */
    .scene::after {content:'';position:absolute;inset:0;pointer-events:none;background:var(--season-light,none);}
    .season-spring {--season-light:radial-gradient(ellipse 60% 90% at 80% 100%,rgba(150,210,120,.14),transparent 70%);}
    .season-summer {--season-light:radial-gradient(ellipse 55% 80% at 78% 20%,rgba(255,196,110,.16),transparent 70%);}
    .season-autumn {--season-light:radial-gradient(ellipse 65% 90% at 85% 90%,rgba(230,140,60,.14),transparent 70%);}
    .season-winter {--season-light:radial-gradient(ellipse 60% 90% at 85% 10%,rgba(190,225,255,.18),transparent 70%);}
    /* Summer: a bigger, hotter sun whose glow breathes. */
    .season-summer .sun {width:136px;height:136px;margin:-30px 0 0 -30px;box-shadow:0 0 64px 28px #ffc96a88;animation:bob 9s ease-in-out infinite,sun-glow 4s ease-in-out infinite;}
    /* Full-height track moved by translate only (top would relayout every frame); the leaf sits at its top. */
    .drift {position:absolute;left:var(--dx);top:0;height:100%;translate:0 -8%;animation:drift-fall var(--dt) linear var(--dd) infinite;}
    .drift>i {display:block;animation:sway var(--sw) ease-in-out infinite alternate;}
    .drift--gusty {animation-name:drift-gust;}
    .petal {width:14px;height:14px;filter:drop-shadow(0 1px 1px #0002);}.petal-0 {fill:#f2a9c6;}.petal-1 {fill:#fbe3ec;}
    /* Plane-tree leaf: five toothed lobes, palmate veins, long stem. */
    .plane {width:24px;height:24px;overflow:visible;filter:drop-shadow(0 1px 1.5px #0004);}
    .plane .stem {fill:none;stroke:#7a4a22;stroke-width:1.4;stroke-linecap:round;} .plane .blade {stroke:#6b3d16;stroke-opacity:.25;stroke-width:.4;} .plane .veins {fill:none;stroke:#5b3a17;stroke-opacity:.4;stroke-width:.6;stroke-linecap:round;}
    .plane-0 .stem {stroke:#8a5a26;} .plane-2 .stem {stroke:#5e2416;}
    .night .drift {filter:brightness(.6);}
    /* Heat rising over the artwork side, above the banner's bottom fade: warm wavy lines that climb and fade. */
    /* Heat rising from the ground on a sunny summer day: soft vertical plumes that waver as they climb, over a warm glow at the horizon. */
    .heat {position:absolute;left:0;right:0;top:16%;height:62%;--heat:color-mix(in srgb,var(--primary-text-color,#253047) 28%,rgb(255,168,80));background:radial-gradient(ellipse 50% 50% at 72% 78%,rgba(255,175,95,.16),transparent 75%);-webkit-mask-image:linear-gradient(transparent,#000 22%,#000 62%,transparent);mask-image:linear-gradient(transparent,#000 22%,#000 62%,transparent);}
    .heat-stop {stop-color:var(--heat);}
    .heat-plume {position:absolute;left:var(--hx);bottom:14%;width:22px;height:var(--hh);fill:none;stroke-width:7;stroke-linecap:round;filter:blur(3px);opacity:0;transform-origin:50% 100%;animation:heat-rise 4.2s ease-out var(--hd) infinite,heat-sway var(--hs) ease-in-out var(--hd) infinite alternate;}
    /* Clear of the "En ce moment" column on wide cards; the corner is free on mobile. */
    /* Winter corner: soft white glow from the corner, light-blue snowflakes with a white rim (visible on light and dark cards). */
    .frost-pane {position:absolute;right:0;top:0;width:min(46%,460px);height:186px;overflow:visible;background:radial-gradient(ellipse 70% 85% at 100% 0,rgba(235,246,255,.55),rgba(235,246,255,.18) 45%,transparent 75%);}
    .frost-flake {fill:none;stroke:#a7cdf2;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 1px #fff) drop-shadow(0 0 3px rgba(255,255,255,.6));transform-box:fill-box;transform-origin:center;opacity:var(--fo);animation:flake-cycle 16s ease-in-out var(--fd) infinite;}
    .frost-bokeh {opacity:.6;animation:bokeh-cycle 16s ease-in-out var(--fd) infinite;}
    .frost-spark {fill:#fff;filter:drop-shadow(0 0 3px #dff1ff);transform-box:fill-box;transform-origin:center;opacity:0;animation:spark-cycle 16s ease-in-out var(--fd) infinite;}
    .weather-art {display:contents;}
    .scene.night {--sky:linear-gradient(145deg,#0b1430,#1f3358 70%,#3a5274);--tint:.46;}
    .scene.twilight {--sky:linear-gradient(155deg,#404c8d,#d18d9b 65%,#f2c599);--tint:.5;}
    .scene.cloudy,.scene.windy-variant {--sky:linear-gradient(155deg,#4c657b,#8aa3b7 75%,#becbd4);}
    .scene.fog {--sky:linear-gradient(180deg,#8d9ba6,#b9c4cb 60%,#d3dade);--tint:.4;}
    .scene.rainy {--sky:linear-gradient(150deg,#263e56,#486580 65%,#6c8aa1);--tint:.45;}
    .scene.pouring {--sky:linear-gradient(150deg,#17293f,#35485e 65%,#536c83);--tint:.45;}
    .scene.lightning,.scene.lightning-rainy {--sky:linear-gradient(150deg,#0b1626,#1d2c40 65%,#32435a);--tint:.52;}
    /* A snowy sky a shade darker than the flakes, so they show. */
    .scene.snowy,.scene.snowy-rainy {--sky:linear-gradient(150deg,#3b5876,#7491ab 70%,#a9bfcf);--tint:.55;}
    .scene.hail {--sky:linear-gradient(150deg,#1d2a3c,#3f5068 65%,#56677d);--tint:.5;}
    .scene.night:not(.clear-night):not(.sunny):not(.partlycloudy) {--sky:linear-gradient(150deg,#111c2c,#334457 80%,#506276);--tint:.44;}
    .scene.night.lightning,.scene.night.lightning-rainy {--tint:.56;}
    .scene.unknown,.scene.exceptional {--sky:linear-gradient(145deg,#697782,#87949e);--tint:.3;}
    /* --nw-orb-x lets a smaller card move the sun or moon away from its text. */
    .orb {position:absolute;left:var(--nw-orb-x,73%);top:36px;width:76px;height:76px;border-radius:50%;}
    /* The big sun: a whole disc (never cut by the top of the card), its glow, and rays turning slowly. Centred where the 76 px orb was. */
    .sun {width:112px;height:112px;margin:-18px 0 0 -18px;background:radial-gradient(circle at 38% 36%,#fff9dc,#ffe17e 58%,#f2bb55);
      box-shadow:0 0 0 1px #fff3c455,0 0 48px 18px #ffd76a66;animation:bob 9s ease-in-out infinite;}
    .sun i {position:absolute;inset:-46px;border-radius:50%;background:repeating-conic-gradient(from 0deg,#fff2b000 0 13deg,#fff2b0b0 15deg 18deg,#fff2b000 20deg 30deg);
      -webkit-mask-image:radial-gradient(circle,transparent 38%,black 50%,transparent 72%);mask-image:radial-gradient(circle,transparent 38%,black 50%,transparent 72%);animation:rays 38s linear infinite;}
    .moon {width:60px;height:60px;background:radial-gradient(circle at 34% 32%,#fffef6,#f3efd6 55%,#d3dbe0);animation:bob 11s ease-in-out infinite;
      box-shadow:inset -9px -7px 14px #9aa6b255,0 0 16px 3px #fff9e0aa,0 0 50px 16px #e9efff40,0 0 110px 40px #c7d6ff1f;}
    .moon i {position:absolute;inset:-34px;border-radius:50%;background:radial-gradient(circle,#fff7d84d,transparent 66%);animation:halo 6s ease-in-out infinite alternate;}
    /* Craters: a shaded hollow with a lit rim. */
    .moon b {position:absolute;inset:0;border-radius:50%;background:
      radial-gradient(circle at 30% 58%,#b4bba866 0 5px,#fffef6aa 5.5px 6.5px,transparent 7px),radial-gradient(circle at 63% 28%,#b4bba855 0 4px,#fffef699 4.5px 5.3px,transparent 5.8px),
      radial-gradient(circle at 68% 68%,#b4bba84d 0 7px,#fffef680 7.5px 8.5px,transparent 9px),radial-gradient(circle at 44% 36%,#b4bba844 0 2.5px,transparent 3.2px),
      radial-gradient(circle at 50% 82%,#b4bba844 0 3px,transparent 3.8px),radial-gradient(circle at 22% 34%,#b4bba83d 0 2px,transparent 2.6px);}
    .star {position:absolute;left:var(--sx);top:var(--sy);width:var(--ss);height:var(--ss);border-radius:50%;background:#fff;box-shadow:0 0 4px #fffc;animation:twinkle var(--st) ease-in-out var(--sd) infinite;}
    .star.bright {width:calc(var(--ss) + 1px);height:calc(var(--ss) + 1px);box-shadow:0 0 6px 1px #fff;}
    .star.bright::before,.star.bright::after {content:'';position:absolute;left:50%;top:50%;width:11px;height:1px;translate:-50% -50%;background:linear-gradient(90deg,transparent,#fffe,transparent);}
    .star.bright::after {rotate:90deg;}
    .cloud {position:absolute;width:190px;height:120px;overflow:visible;filter:drop-shadow(0 5px 7px #172d4317);animation:clouds var(--cloud-duration,32s) ease-in-out infinite alternate;}
    /* Animated artwork is wrapped in a div: Chrome can only hand HTML boxes to the GPU, an animated <svg> restyles every frame. */
    :is(.cloud,.fog-band,.heat-plume,.gust,.leaf,.bolt)>svg {display:block;width:100%;height:100%;overflow:visible;}
    .cloud-rear {fill:#d6dde3;}.cloud-near {fill:#f4f7f8;}
    .cloud.back {left:55%;top:15px;width:220px;height:140px;opacity:.62;animation-delay:-12s;}
    .cloud.front {left:73%;top:90px;animation-delay:-4s;}
    .cloud.small {left:93%;top:6px;width:150px;height:95px;opacity:.7;animation-delay:-22s;}
    /* Storms and downpours: a dark ceiling and two extra banks of cloud, so the sky reads thick and closed. */
    .overcast {position:absolute;left:30%;right:0;top:0;height:46%;background:linear-gradient(180deg,rgba(28,38,52,.32),rgba(28,38,52,0));filter:blur(10px);}
    .cloud.heavy-left {left:40%;top:-34px;width:300px;height:180px;opacity:.9;animation-delay:-8s;}
    .cloud.heavy-right {left:80%;top:-40px;width:320px;height:190px;opacity:.85;animation-delay:-17s;}
    .night .cloud-rear {fill:#73869f;}.night .cloud-near {fill:#a0aec1;}
    .rainy .cloud-rear {fill:#7d90a5;}.pouring .cloud-rear,.hail .cloud-rear {fill:#56677c;}.lightning .cloud-rear,.lightning-rainy .cloud-rear {fill:#46566a;}
    .rainy .cloud-near {fill:#b0c0cf;}.pouring .cloud-near,.hail .cloud-near {fill:#8496aa;}
    /* Snow clouds are grey: white flakes show over them. */
    .snowy .cloud-rear,.snowy-rainy .cloud-rear {fill:#94a6b9;}.snowy .cloud-near,.snowy-rainy .cloud-near {fill:#bccad8;}.lightning .cloud-near,.lightning-rainy .cloud-near {fill:#728499;}
    .windy .cloud,.windy-variant .cloud {animation-name:wind-clouds;}
    .particle {position:absolute;left:var(--x);top:-40px;height:calc(100% + 80px);width:3px;animation:fall var(--duration) linear var(--delay) infinite;}
    .particle::before {content:'';position:absolute;top:0;left:0;display:block;}
    .rain::before {width:1.8px;height:23px;border-radius:2px;background:linear-gradient(#e4f3ff38,#eef8fff5);rotate:9deg;}
    .rain.depth-0 {opacity:.55;}.rain.depth-1 {opacity:.82;}.rain.depth-2::before {width:2.3px;height:30px;}
    .pouring .rain::before {height:34px;rotate:15deg;}.pouring .rain.depth-2::before {height:44px;width:2.6px;}
    .snow {animation-name:snow;}.snow.depth-0 {opacity:.6;}.snow.depth-1 {opacity:.8;}.snow.depth-2,.snow.depth-3 {opacity:1;}
    /* A white flake with a fine blue-grey rim and a soft glow: it shows on a pale sky as on a dark one. */
    .snow::before {width:var(--size);height:var(--size);border-radius:50%;background:radial-gradient(circle at 40% 38%,#fff 55%,#eef5fc);
      box-shadow:0 0 0 1px rgba(60,95,135,.6),0 1px 4px rgba(30,60,100,.35),0 0 6px 1px #fff6;
      animation:snow-sway var(--sw) ease-in-out var(--delay) infinite alternate;}
    /* Snow settling on the ground: a thin white layer that thickens slowly, a few crystals sparkling. */
    .snowbank {position:absolute;left:-1%;right:-1%;bottom:-1px;height:18px;transform-origin:50% 100%;scale:1 .3;animation:settle 40s ease-out forwards;}
    .snowbank svg {display:block;width:100%;height:100%;}.snowbank path {fill:url(#nw-snowbank);}
    .snowbank i {position:absolute;bottom:4px;left:var(--x);width:2px;height:2px;border-radius:50%;background:#fff;animation:twinkle 2.6s ease-in-out var(--dl) infinite;}
    /* Hail starts just above the card; its course (its own height, the card's) ends on the bottom edge, its ground. */
    .particle.hailstone {top:-12px;height:100%;animation-name:hail;--ground:calc(100% + 11px - var(--size));}
    .hailstone::before {width:var(--size);height:var(--size);border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#dcecff 60%,#b8d0ea);box-shadow:0 0 0 .6px rgba(70,110,150,.5);}
    /* Water on the ground: a shimmering film, splashes and ripples. Darker on a light card, lighter on a dark card or a dark sky. */
    .scene {--splash:color-mix(in srgb,color-mix(in srgb,var(--primary-text-color,#253047) 45%,#dcebff) 75%,transparent);}
    .pouring,.lightning-rainy,.hail {--splash:rgb(225 238 255 / .8);}
    .wet {position:absolute;left:0;right:0;bottom:0;height:10px;background:linear-gradient(0deg,var(--splash),transparent);opacity:.35;}
    .wet::after {content:'';position:absolute;inset:auto 0 0 0;height:1px;background:linear-gradient(90deg,transparent,var(--splash) 30%,transparent 55%,var(--splash) 80%,transparent);background-size:200% 100%;animation:sheen 6s linear infinite;}
    .splash {position:absolute;bottom:1px;left:var(--x);width:20px;height:10px;margin-left:-10px;}
    .splash::before {content:'';position:absolute;left:0;right:0;bottom:0;height:5px;border-radius:50%;border:1px solid var(--splash);opacity:0;scale:.2;animation:ripple var(--d) ease-out var(--dl) infinite;}
    .splash::after {content:'';position:absolute;left:9px;bottom:1px;width:2px;height:2px;border-radius:50%;opacity:0;box-shadow:-4px 0 0 .4px var(--splash),4px 0 0 .4px var(--splash);animation:spray var(--d) ease-out var(--dl) infinite;}
    .fog-sun {position:absolute;left:70%;top:30px;width:84px;height:84px;border-radius:50%;background:radial-gradient(circle,#fffbeae6,#fff4d080 45%,transparent 70%);filter:blur(1.5px);animation:fog-sun 9s ease-in-out infinite alternate;}
    /* Mist takes a little of the theme's text colour: pale grey on a light card, near white on a dark one. */
    .fog-band {position:absolute;left:var(--fl);top:var(--fy);width:var(--fw);height:24%;fill:color-mix(in srgb,var(--primary-text-color,#253047) 30%,#eef3f6);filter:blur(10px);animation:fog-drift var(--fd) ease-in-out var(--fdelay) infinite alternate,fog-breathe calc(var(--fd) * .7) ease-in-out var(--fdelay) infinite alternate;}
    .fog-band.depth-0 {--fo:.28;}.fog-band.depth-1 {--fo:.4;height:28%;}.fog-band.depth-2 {--fo:.52;height:32%;filter:blur(14px);}
    .night .fog-band {fill:#a9b6c4;}
    .gust {position:absolute;width:65%;height:95px;left:0;top:25%;fill:none;stroke:#f1f8ffd9;stroke-width:2;stroke-linecap:round;animation:gust 4s ease-in-out infinite;}
    .gust.second {top:57%;width:80%;opacity:.65;animation-delay:-2s;}
    .leaf-track {position:absolute;left:0;top:var(--leaf-top);width:100%;height:20px;animation:leaves var(--leaf-time) linear var(--leaf-delay) infinite;}
    .leaf {width:20px;height:14px;animation:tumble 1.6s linear infinite;filter:drop-shadow(0 2px 2px #0002);}
    .leaf path:first-child {fill:#e4c080;}.leaf path:last-child {fill:none;stroke:#a5854d;stroke-width:1.4;}
    .bolt {position:absolute;fill:none;stroke:#fff;stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 3px #f2f8ff) drop-shadow(0 0 16px #8fc2ff);opacity:0;animation:lightning 6s linear infinite;}
    .bolt.b1 {left:72%;top:80px;width:100px;height:170px;}
    .bolt.b2 {left:88%;top:55px;width:60px;height:130px;stroke-width:2.4;}
    .bolt.b3 {left:58%;top:28px;width:78px;height:150px;stroke-width:3;}
    /* One flash per bolt, centred on it and painted after the clouds so they light up too.
       Each strike flickers twice; strikes are ≥ 1.8 s apart, so never more than 2 flashes in a second
       (photosensitivity limit: 3). The text side of the card stays out of the bright centre. */
    .flash {position:absolute;inset:0;--fx:76%;--fy:30%;background:radial-gradient(ellipse 48% 105% at var(--fx) var(--fy),#f4f9ff,#c9dff7a6 30%,transparent 68%);mix-blend-mode:screen;opacity:0;animation:storm-flash 6s linear infinite;}
    .flash.f2 {--fx:92%;--fy:22%;}.flash.f3 {--fx:62%;--fy:18%;}
    .scene *, .scene *::after, .scene *::before {animation-play-state:var(--play,paused);}
    .scene[data-still] *,.scene[data-still] *::before,.scene[data-still] *::after {animation:none;}.scene[data-still] .particle {translate:0 var(--rest);}
    .scene[data-still] .snowbank {scale:1 1;}.scene[data-still] .particle.hailstone {translate:0 calc(var(--rest) * .9);}.scene[data-still] .drift {translate:0 var(--rest);}.scene[data-still] .frost-bokeh {opacity:.6;}
    .scene[data-still] .bolt.b1 {opacity:.8;}.scene[data-still] .flash {opacity:0;}
    @keyframes clouds {from{translate:-24px 0;}to{translate:32px 4px;}}
    @keyframes wind-clouds {from{translate:-75px -3px;}to{translate:90px 6px;}}
    @keyframes rays {to{rotate:360deg;}}
    @keyframes halo {from{opacity:.55;scale:.94;}to{opacity:1;scale:1.06;}}
    @keyframes twinkle {0%,100%{opacity:.25;scale:.7;}50%{opacity:1;scale:1.15;}}
    @keyframes fall {from{translate:0 0;}to{translate:var(--drift) 100%;}}
    @keyframes snow {to{translate:0 100%;}}
    @keyframes snow-sway {from{translate:calc(var(--amp) * -1) 0;}to{translate:var(--amp) 0;}}
    @keyframes settle {to{scale:1 1;}}
    @keyframes bob {50%{translate:0 5px;}}
    @keyframes sun-glow {50%{box-shadow:0 0 90px 40px #ffb84d99;}}
    /* Hail: a fall that speeds up, the impact, a clear first bounce, a second little hop, then the stone stops and melts. */
    @keyframes hail {
      0%{translate:0 0;opacity:1;animation-timing-function:cubic-bezier(.5,0,1,1);}
      50%{translate:0 var(--ground);animation-timing-function:cubic-bezier(0,0,.4,1);}
      64%{translate:var(--dx) calc(var(--ground) - 34px);animation-timing-function:cubic-bezier(.6,0,1,1);}
      76%{translate:calc(var(--dx) * 1.7) var(--ground);animation-timing-function:cubic-bezier(0,0,.4,1);}
      83%{translate:calc(var(--dx) * 2.1) calc(var(--ground) - 11px);animation-timing-function:cubic-bezier(.6,0,1,1);}
      89%{translate:calc(var(--dx) * 2.4) var(--ground);opacity:1;}
      100%{translate:calc(var(--dx) * 2.4) var(--ground);opacity:0;}}
    @keyframes ripple {0%{opacity:.9;scale:.2;}45%{opacity:0;scale:1.1;}100%{opacity:0;scale:1.1;}}
    @keyframes spray {0%{opacity:1;translate:0 0;scale:.6 1;}18%{opacity:1;translate:0 -7px;scale:1.4 1;}34%{opacity:0;translate:0 -1px;scale:1.9 1;}100%{opacity:0;}}
    @keyframes sheen {to{background-position:-200% 0;}}
    @keyframes fog-drift {from{translate:calc(var(--dir) * -7%) 0;}to{translate:calc(var(--dir) * 7%) 6px;}}
    @keyframes fog-sun {from{opacity:.55;}to{opacity:.9;}}
    @keyframes drift-fall {from{translate:0 -8%;}to{translate:-40px 108%;}}
    @keyframes drift-gust {from{translate:60px -8%;}to{translate:-160px 108%;}}
    @keyframes sway {from{translate:-10px 0;rotate:-25deg;}to{translate:10px 0;rotate:35deg;}}
    @keyframes heat-rise {0%{translate:0 18px;opacity:0;}30%{opacity:.85;}70%{opacity:.55;}100%{translate:0 -40px;opacity:0;}}
    @keyframes heat-sway {from{transform:skewX(-9deg) scaleX(.85);}to{transform:skewX(9deg) scaleX(1.2);}}
    /* Winter, 16 s: snowflakes gather from the corner, hold while sparkles shine, then fade. */
    @keyframes flake-cycle {0%{opacity:0;transform:scale(.3) rotate(-30deg);}28%{opacity:var(--fo);transform:scale(1) rotate(0);}68%{opacity:var(--fo);transform:scale(1) rotate(10deg);}88%,100%{opacity:0;transform:scale(1.08) rotate(16deg);}}
    @keyframes bokeh-cycle {0%,100%{opacity:0;}35%,70%{opacity:.6;}}
    @keyframes spark-cycle {0%,30%,78%,100%{opacity:0;transform:scale(.4);}42%,62%{opacity:1;transform:scale(1);}52%{opacity:.4;transform:scale(.7);}}
    @keyframes fog-breathe {from{opacity:calc(var(--fo) * .6);}to{opacity:var(--fo);}}
    @keyframes gust {0%{translate:-110% 0;opacity:0;}20%,75%{opacity:.75;}100%{translate:160% -15px;opacity:0;}}
    @keyframes leaves {from{translate:-5% 0;}to{translate:110% -18px;}}
    @keyframes tumble {to{rotate:360deg;}}
    @keyframes lightning {0%,4.5%,100%{opacity:0;}.6%,1.6%{opacity:1;}2.2%{opacity:.3;}3%{opacity:1;}}
    @keyframes storm-flash {0%,4.5%,100%{opacity:0;}.6%{opacity:.7;}1.6%{opacity:.5;}2.2%{opacity:.1;}3%{opacity:.55;}}
    @container(max-width:650px) {
      /* The artwork fills the whole card height: leaves, rain and snow fall to the bottom on every format. */
      .weather-art {display:block;position:absolute;top:0;right:0;width:100%;height:100%;overflow:hidden;}
      .cloud.heavy-left {left:auto;right:30%;width:220px;}.cloud.heavy-right {left:auto;right:-20%;width:240px;}
      .orb {left:var(--nw-orb-x,auto);right:12%;top:36px;}.cloud.back {left:auto;right:22%;top:20px;width:170px;}.cloud.front {left:auto;right:0;top:90px;width:150px;}.cloud.small {left:auto;right:-12%;top:6px;width:120px;}
      .bolt.b1 {left:auto;right:18%;}.bolt.b2 {left:auto;right:2%;}.bolt.b3 {left:auto;right:42%;}
      .flash.f1 {--fx:70%;}.flash.f2 {--fx:94%;}.flash.f3 {--fx:48%;}
      .fog-sun {left:auto;right:14%;}
      .frost-pane {width:70%;height:150px;}
    }
    @media(prefers-reduced-motion:reduce) {.scene *,.scene *::before,.scene *::after{animation:none!important;}.snowbank{scale:1 1;}.particle{translate:0 var(--rest);}.drift{top:var(--rest);}.frost-bokeh{opacity:.6;}.bolt.b1{opacity:.8;}.flash{opacity:0;}}
  `,x([C()],z.prototype,"condition",2),x([C()],z.prototype,"phase",2),x([C()],z.prototype,"quality",2),x([C({type:Boolean})],z.prototype,"animated",2),x([C({type:Number})],z.prototype,"wind",2),x([C()],z.prototype,"season",2),x([S()],z.prototype,"visible",2),x([S()],z.prototype,"pageVisible",2),z=x([V("niak-weather-sky")],z);var Gi={format:"full",show_synthesis:!0,show_bulletin:!0,show_today:!0,show_predictions:!0,collapse_today:!1,collapse_predictions:!1,smart_brief:!0,weather_animations:!0,weather_animation_quality:"standard",show_atmo_details:!0,show_atmo_tomorrow:!0,glass_effect:!0,tile_blocks:["bulletin","events"],forecast_tab:"hours"},Ki={entry_id:"Lieu",format:"Format",weather_animations:"Ciel anim\xE9 et halos",weather_animation_quality:"Qualit\xE9 des animations",glass_effect:"Effet verre d\xE9poli",show_synthesis:"Bandeau (synth\xE8se et m\xE9t\xE9o du moment)",show_bulletin:"Bulletin du jour",smart_brief:"Alertes et \xE9v\xE9nements",show_today:"Section Aujourd\u2019hui",collapse_today:"Aujourd\u2019hui repli\xE9 au d\xE9part",show_predictions:"Section Pr\xE9visions",collapse_predictions:"Pr\xE9visions repli\xE9es au d\xE9part",show_atmo_details:"D\xE9tail des polluants et des pollens",show_atmo_tomorrow:"Air et pollens de demain",weather_path:"Page \xE0 ouvrir",tile_blocks:"Contenu de la tuile d\xE9pli\xE9e",forecast_tab:"Pr\xE9visions affich\xE9es au d\xE9part",banner_blocks:"Contenu du bandeau",today_blocks:"Contenu d\u2019Aujourd\u2019hui",forecast_blocks:"Contenu des Pr\xE9visions",hold_action:"Appui long",tap_action:"Appui"},Qi={weather_animations:"Coup\xE9es, le ciel et les halos restent fixes.",weather_animation_quality:"All\xE9g\xE9e : moins de gouttes, de flocons et de nuages.",glass_effect:"Le flou demande beaucoup de ressources : \xE0 couper sur un appareil lent. Coup\xE9, le verre devient plus opaque.",smart_brief:"La vigilance, l\u2019alerte mesur\xE9e chez vous et la frise des \xE9v\xE9nements. Coup\xE9, la frise ne montre que le ciel pr\xE9vu.",weather_path:"Le chemin de la page, par exemple /meteo ou /lovelace/meteo.",tile_blocks:"Cochez ce qui s\u2019affiche quand la tuile est d\xE9pli\xE9e, et faites glisser pour changer l\u2019ordre.",banner_blocks:"Le bandeau et son ciel anim\xE9 restent toujours, avec le lieu, la vigilance et la m\xE9t\xE9o du moment. Cochez ce qu\u2019il montre en dessous, dans l\u2019ordre.",today_blocks:"Tout d\xE9cocher retire la section.",forecast_blocks:"Tout d\xE9cocher retire la section.",forecast_tab:"Un appui sur Heures ou Jours change l\u2019affichage ; ce choix est gard\xE9 sur chaque appareil."},oi="/config/integrations/integration/niak_weather",K=class extends R{constructor(){super(...arguments);this.asked=!1;this.computeLabel=t=>t.title??(t.name==="hold_action"&&this.tapped?"Appui":Ki[t.name]??t.name);this.computeHelper=t=>Qi[t.name]??"";this.follow=t=>{t.preventDefault(),history.pushState(null,"",t.currentTarget.getAttribute("href")??oi),window.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0}))}}get small(){return!!this.config?.format&&this.config.format!=="full"}get tapped(){return this.config?.format==="mini"||this.config?.format==="alert"}setConfig(t){let n=fe(t);this.config&&JSON.stringify(n)===JSON.stringify(this.config)||(this.config=n)}shouldUpdate(t){return t.has("hass")&&!this.asked&&this.hass&&(this.asked=!0,this.hass.callWS({type:"niak_weather/entries"}).then(n=>{this.entries=n},()=>{this.entries=null})),!(t.size===1&&t.has("hass"))}changed(t){t.stopPropagation(),this.config&&(this.config=fe({...this.config,...t.detail.value}),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0})))}schema(){let t=(...$)=>$.map(M=>({name:M,selector:{boolean:{}}})),n=($,M,T,P=!1)=>({type:"expandable",name:"",title:$,icon:M,flatten:!0,expanded:P,schema:T}),a={name:"format",selector:{select:{mode:"list",options:[{value:"full",label:"Compl\xE8te : la page m\xE9t\xE9o"},{value:"tile",label:"Tuile : une bande qui se d\xE9plie d\u2019un appui"},{value:"intermediate",label:"Tuile d\xE9pli\xE9e : la m\xEAme, ouverte au d\xE9part"},{value:"mini",label:"Mini : une seule ligne"},{value:"forecast",label:"Pr\xE9visions : les heures et les jours"},{value:"rain",label:"Pluie : \xE0 venir et tomb\xE9e"},{value:"alert",label:"Alerte : visible seulement en cas de vigilance ou d\u2019alerte"}]}}},r={name:"tile_blocks",selector:{select:{multiple:!0,reorder:!0,mode:"list",options:[{value:"bulletin",label:"Bulletin du jour"},{value:"events",label:"\xC9v\xE9nements (la frise)"},{value:"moments",label:"Les prochains moments (soir, nuit, matin\u2026)"},{value:"forecast",label:"Pr\xE9visions (heures ou jours)"}]}}},p={name:"forecast_tab",selector:{select:{mode:"dropdown",options:[{value:"hours",label:"Heures"},{value:"days",label:"Jours"}]}}},s=this.config?.format==="tile"||this.config?.format==="intermediate",l=this.config?.hold_action??(this.config?.weather_path?"page":"popup"),d=s?this.config?.tap_action??"toggle":void 0,u=$=>({name:$,required:!0,selector:{select:{mode:"dropdown",options:[...s?[{value:"toggle",label:"D\xE9plier ou replier la tuile"}]:[],{value:"popup",label:"Ouvrir la m\xE9t\xE9o compl\xE8te en fen\xEAtre"},{value:"page",label:"Ouvrir une page"},{value:"none",label:"Rien"}]}}}),h=[...s?[u("tap_action")]:[],u("hold_action"),...l==="page"||d==="page"?[{name:"weather_path",selector:{text:{}}}]:[]],f=this.entries&&this.entries.length>1?[{name:"entry_id",selector:{select:{options:this.entries.map($=>({value:$.entry_id,label:$.title}))}}}]:[],g=n("Visuel et performance","mdi:palette-outline",[...t("weather_animations"),{name:"weather_animation_quality",required:!0,selector:{select:{mode:"dropdown",options:[{value:"standard",label:"Standard"},{value:"low",label:"All\xE9g\xE9e"}]}}},...t("glass_effect")],!0),k=this.config?.format;if(k==="mini"||k==="alert")return[...f,a,n("Fonctionnalit\xE9s","mdi:tune-variant",h,!0)];if(k==="forecast")return[...f,a,n("Fonctionnalit\xE9s","mdi:tune-variant",[p],!0)];if(k==="rain")return[...f,a];if(this.small)return[...f,a,g,n("Contenu","mdi:view-list-outline",[r,...(this.config?.tile_blocks??[]).includes("forecast")?[p]:[]],!0),n("Fonctionnalit\xE9s","mdi:tune-variant",h)];let y=($,M)=>({name:$,selector:{select:{multiple:!0,reorder:!0,mode:"list",options:M.map(([T,P])=>({value:T,label:P}))}}});return[...f,a,g,n("Bandeau intelligent","mdi:view-day-outline",[y("banner_blocks",[["bulletin","Bulletin du jour"],["events","\xC9v\xE9nements (la frise)"],["moments","Les prochains moments (soir, nuit, matin\u2026)"],["forecast","Pr\xE9visions en tuiles (heures ou jours)"]])],!0),n("Aujourd\u2019hui","mdi:calendar-today",[y("today_blocks",[["rain","Pluie"],["wind","Vent"],["pressure","Pression"],["comfort","Ressenti"],["extras","Pastilles (humidit\xE9, ros\xE9e, soleil\u2026)"],["air","Air et pollens du jour"]]),...t("collapse_today")]),n("Pr\xE9visions","mdi:calendar-week",[y("forecast_blocks",[["hours","Les 18 prochaines heures"],["days","Les 7 prochains jours"],["air","Air et pollens de demain"]]),...t("collapse_predictions")]),n("Air et pollens","mdi:flower-pollen-outline",t("show_atmo_details"))]}render(){if(!this.config||!this.hass)return c;let t=ke(this.config),n={...this.config.show_bulletin===!1?{tile_blocks:["events"]}:{},banner_blocks:t.banner,today_blocks:t.today,forecast_blocks:t.forecasts},a={tap_action:"toggle",hold_action:this.config.weather_path?"page":"popup"},r=Object.fromEntries(Object.entries({...Gi,...a,...n,...this.config}).filter(([s])=>s!=="type")),p=this.entries?.length===1?this.entries[0]:void 0;return o`
      ${this.entries===null?o`<p class="note warn">L’intégration Niak Weather ne répond pas : la carte en a besoin depuis la version 2.0.
          Déjà téléchargée ? <a href="/config/integrations/dashboard/add?domain=niak_weather" @click=${this.follow}>Ajoutez-la</a>.
          Sinon, <a href="https://github.com/Niakman13/niak-weather-integration#installation" target="_blank" rel="noopener noreferrer">installez-la</a>.</p>`:this.entries?.length===0?o`<p class="note warn">Ajoutez l’intégration Niak Weather : Paramètres → Appareils et services.</p>`:o`<p class="note">${p?o`Lieu : <b>${p.title}</b>. `:c}Les sources (prévisions, station, air et pollens) se règlent dans
          <a href=${oi} @click=${this.follow}>l’intégration Niak Weather</a>.</p>`}
      <ha-form .hass=${this.hass} .data=${r} .schema=${this.schema()} .computeLabel=${this.computeLabel} .computeHelper=${this.computeHelper} @value-changed=${this.changed}></ha-form>`}};K.styles=_`
    .note { color:var(--secondary-text-color); font-size:13px; line-height:1.6; margin:0 0 16px; }
    .note.warn { color:var(--primary-text-color); }
    a { color:var(--primary-color); }
  `,x([C({attribute:!1})],K.prototype,"hass",2),x([S()],K.prototype,"config",2),x([S()],K.prototype,"entries",2),K=x([V("niak-weather-card-editor")],K);var li=500,Zi=matchMedia("(pointer: coarse)"),Yi=0,pi={missing:{title:"Niak Weather a besoin de son int\xE9gration",text:"Depuis la version 2.0, la carte re\xE7oit ses calculs de l\u2019int\xE9gration Niak Weather. D\xE9j\xE0 t\xE9l\xE9charg\xE9e depuis HACS ? Ajoutez-la dans Param\xE8tres \u2192 Appareils et services. Sinon, installez-la depuis HACS, red\xE9marrez Home Assistant, puis ajoutez-la. D\xE9j\xE0 ajout\xE9e ? Elle n\u2019a pas d\xE9marr\xE9 : les journaux disent pourquoi (Param\xE8tres \u2192 Syst\xE8me \u2192 Journaux, cherchez \xAB niak \xBB).",links:[["Ajouter l\u2019int\xE9gration","/config/integrations/dashboard/add?domain=niak_weather"],["L\u2019installer","https://github.com/Niakman13/niak-weather-integration#installation"]]},not_configured:{title:"Ajoutez l\u2019int\xE9gration Niak Weather",text:"Elle est install\xE9e mais pas encore configur\xE9e. Elle peut reprendre les r\xE9glages de vos cartes.",links:[["Ajouter l\u2019int\xE9gration","/config/integrations/dashboard/add?domain=niak_weather"]]},choose_entry:{title:"Choisissez un lieu",text:"Plusieurs lieux Niak Weather sont configur\xE9s : choisissez celui de cette carte dans ses r\xE9glages."},not_found:{title:"Lieu introuvable",text:"Le lieu de cette carte n\u2019existe plus : choisissez-en un autre dans ses r\xE9glages."},version:{title:"Rechargez la page",text:"L\u2019int\xE9gration Niak Weather vient d\u2019\xEAtre mise \xE0 jour : rechargez la page pour afficher sa carte."},error:{title:"L\u2019int\xE9gration Niak Weather a renvoy\xE9 une erreur",text:"Les journaux de Home Assistant disent pourquoi : Param\xE8tres \u2192 Syst\xE8me \u2192 Journaux, cherchez \xAB niak \xBB.",links:[["Voir les journaux","/config/logs"]]}},L=class extends R{constructor(){super(...arguments);this.editMode=!1;this.preview=!1;this.tab="hours";this.failure="";this.open=!1;this.dialogOpen=!1;this.folded={today:!1,predictions:!1};this.uid=`nw${++Yi}`;this.setTab=t=>{this.tab=t;try{localStorage.setItem(`niak-weather:tab:${this.config?.entry_id??""}`,t)}catch{}};this.picker=!1;this.follow=t=>{let n=t.currentTarget.getAttribute("href");n?.startsWith("/")&&(t.preventDefault(),this.go(n))};this.down=t=>{let n=this.tileCard();if(t.button!==0||!n)return;this.cancelPress();let a=n.querySelector(".press-ring"),r=n.getBoundingClientRect(),p=performance.now();a?.style.setProperty("left",`${t.clientX-r.left}px`),a?.style.setProperty("top",`${t.clientY-r.top}px`);let s=()=>{let d=Math.min(1,(performance.now()-p)/li);a?.style.setProperty("--p",String(d)),n.classList.toggle("pressing",d>.15),d<1&&this.press&&(this.press.frame=requestAnimationFrame(s))},l=this.holdTarget!=="none";this.press={x:t.clientX,y:t.clientY,long:!1,frame:l?requestAnimationFrame(s):0,timer:setTimeout(()=>{!this.press||!l||(this.press.long=!0,this.stopRing(),this.act(this.holdTarget))},li)}};this.move=t=>{this.press&&Math.hypot(t.clientX-this.press.x,t.clientY-this.press.y)>10&&this.cancelPress()};this.up=()=>{let t=this.press;this.cancelPress(),t&&!t.long&&this.act(this.tapTarget)};this.cancelPress=()=>{this.stopRing(),this.press=void 0};this.noMenu=t=>t.preventDefault();this.tileKey=t=>{t.target!==this.tileCard()||!["Enter"," "].includes(t.key)||(t.preventDefault(),this.act(t.shiftKey?this.holdTarget:this.tapTarget))};this.tap=t=>{t.target.closest("dialog")||this.act(this.holdTarget)};this.tapKey=t=>{!["Enter"," "].includes(t.key)||t.target.closest("dialog")||this.holdTarget==="none"||(t.preventDefault(),this.act(this.holdTarget))};this.closeDialog=()=>{this.renderRoot.querySelector("dialog")?.close()};this.openEntity=t=>{let n=t.composedPath().find(a=>a instanceof HTMLElement&&a.hasAttribute("data-entity"));!n||n.closest(".nw-tilecard")||(this.closeDialog(),this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:n.getAttribute("data-entity")},bubbles:!0,composed:!0})))};this.entityKey=t=>{!["Enter"," "].includes(t.key)||!(t.target instanceof HTMLElement)||!t.target.hasAttribute("data-entity")||(t.preventDefault(),this.openEntity(t))}}setConfig(t){let n=fe(t),a=this.config;a&&JSON.stringify(a)===JSON.stringify(n)||(this.config=n,(!a||a.collapse_today!==n.collapse_today||a.collapse_predictions!==n.collapse_predictions)&&(this.folded={today:n.collapse_today===!0,predictions:n.collapse_predictions===!0}),(!a||a.format!==n.format||a.entry_id!==n.entry_id)&&(this.open=this.remembered(n)),(!a||a.forecast_tab!==n.forecast_tab||a.entry_id!==n.entry_id)&&(this.tab=this.rememberedTab(n)),a&&a.entry_id!==n.entry_id&&(this.unsubscribe(),this.view=void 0,this.problem=void 0))}static getStubConfig(){return{type:"custom:niak-weather-card"}}static getConfigElement(){return document.createElement("niak-weather-card-editor")}getCardSize(){return this.config?this.config.format==="mini"?1:this.config.format==="alert"?this.view&&this.hasAlert(this.view)?2:0:this.config.format==="forecast"||this.config.format==="rain"?5:this.tile?this.unfolded?7:2:Math.max(1,(this.config.show_synthesis===!1?0:4)+(this.config.show_today===!1?0:5)+(this.config.show_predictions===!1?0:4)):10}getGridOptions(){let t=this.config?.format;return t==="mini"?{columns:12,rows:1,min_columns:3}:this.tile||t==="alert"||t==="forecast"||t==="rain"?{columns:12,rows:"auto",min_columns:6}:{columns:"full",rows:"auto"}}get unfolded(){return this.tapTarget==="toggle"||this.holdTarget==="toggle"?this.open:this.config?.format==="intermediate"}get tile(){return this.config?.format==="tile"||this.config?.format==="intermediate"}get small(){return!!this.config?.format&&this.config.format!=="full"}hasAlert(t){let{alerts:n,points:a}=lt(t);return n.length+a.length>0}rememberedTab(t){try{let n=localStorage.getItem(`niak-weather:tab:${t.entry_id??""}`);if(n==="hours"||n==="days")return n}catch{}return t.forecast_tab??"hours"}key(t=this.config){return`niak-weather:open:${t.format}:${t.entry_id??t.weather_entity??""}`}remembered(t){try{let n=localStorage.getItem(this.key(t));if(n!==null)return n==="1"}catch{}return t.format==="intermediate"}connectedCallback(){super.connectedCallback(),this.picker=this.inPicker(),this.subscribe()}inPicker(){for(let t=this;t;t=t.parentNode??(t instanceof ShadowRoot?t.host:null))if(t instanceof HTMLElement&&t.localName==="hui-card-picker")return!0;return!1}get editing(){return this.editMode||this.preview||this.picker}disconnectedCallback(){super.disconnectedCallback(),this.cancelPress(),this.unsubscribe()}shouldUpdate(t){return(t.has("hass")||t.has("config"))&&this.subscribe(),!(t.size===1&&t.has("hass"))}updated(){this.toggleAttribute("hidden",this.config?.format==="alert"&&!!this.view&&!this.hasAlert(this.view)&&!this.editing),this.toggleAttribute("still",this.config?.weather_animations===!1),this.toggleAttribute("flat",this.config?.glass_effect===!1);let t=this.renderRoot.querySelector("dialog");t&&this.dialogOpen&&!t.open&&t.showModal()}subscribe(){let t=this.hass?.connection,n=this.config;if(!t||!n||!this.isConnected)return;let a=n.entry_id??"";if(this.subscription&&this.subscribedTo===a)return;this.unsubscribe(),this.subscribedTo=a;let r=t.subscribeMessage(p=>this.receive(p),{type:"niak_weather/subscribe",...n.entry_id?{entry_id:n.entry_id}:{}});this.subscription=r,r.catch(p=>{if(this.subscription!==r)return;this.subscription=void 0;let s=p?.code;this.failure=[p?.message,s].filter(Boolean).join(" \xB7 "),this.problem=s==="not_configured"||s==="choose_entry"||s==="not_found"?s:!s||s==="unknown_command"?"missing":"error",s!=="choose_entry"&&this.retryLater(s==="unknown_command"?3e4:5e3)})}receive(t){if("reload"in t){this.unsubscribe(),this.retryLater(2e3);return}if(t.version!==1){this.problem="version";return}this.problem=void 0,this.view=t.view}unsubscribe(){clearTimeout(this.retry);let t=this.subscription;this.subscription=void 0,this.subscribedTo=void 0,t?.then(n=>n()).catch(()=>{})}retryLater(t){clearTimeout(this.retry),this.retry=setTimeout(()=>this.subscribe(),t)}render(){if(!this.config)return c;if(this.problem&&!this.view)return this.renderProblem(pi[this.problem]);if(!this.view)return o`<ha-card><div class="nw-wait" role="status" aria-label="Chargement de la météo"></div></ha-card>`;let t=this.config,n=Ct(this.view,t,this.tile),a=o`<niak-weather-sky .condition=${n.now.condition} .phase=${n.now.phase} .animated=${t.weather_animations!==!1}
      .quality=${t.weather_animation_quality??(this.tile&&Zi.matches?"low":"standard")} .wind=${n.now.wind??0} .season=${n.season.info.season}></niak-weather-sky>`,r=()=>ai(n,{sky:a,uid:this.uid,entity:n.weatherEntity,station:n.station,sections:ke(t),tab:this.tab,onTab:this.setTab,folded:this.folded,onFold:u=>{this.folded={...this.folded,[u]:!this.folded[u]}}}),p=`M\xE9t\xE9o${n.location?` \xB7 ${n.location}`:""}`,s=()=>this.dialogOpen?o`<dialog class="nw-dialog" aria-label=${p} @close=${()=>{this.dialogOpen=!1}} @click=${this.openEntity} @keydown=${this.entityKey}>
        <header><b>${p}</b><button type="button" @click=${this.closeDialog}>Fermer</button></header>${r()}</dialog>`:c,l=this.holdTarget;switch(t.format){case"mini":return o`<ha-card><div @click=${this.tap} @keydown=${this.tapKey}>${Kt(n,l)}</div>${s()}</ha-card>`;case"alert":{let u=Qt(n,this.editing);return u===c?c:o`<ha-card><div @click=${this.tap} @keydown=${this.tapKey}>${u}</div>${s()}</ha-card>`}case"rain":return o`<ha-card @click=${this.openEntity} @keydown=${this.entityKey}>${Zt(n)}</ha-card>`;case"forecast":return o`<ha-card @click=${this.openEntity} @keydown=${this.entityKey}>${Jt(n,this.tab,this.setTab,n.weatherEntity,this.uid)}</ha-card>`}if(!this.tile)return o`<ha-card @click=${this.openEntity} @keydown=${this.entityKey}>${r()}</ha-card>`;let d=t.tile_blocks?.length?t.tile_blocks:t.show_bulletin===!1?["events"]:jt;return o`<ha-card>
      <div @pointerdown=${this.down} @pointermove=${this.move} @pointerup=${this.up} @pointercancel=${this.cancelPress} @pointerleave=${this.cancelPress}
        @contextmenu=${this.noMenu} @keydown=${this.tileKey}>
        ${It(n,a,{open:this.unfolded,tapTarget:this.tapTarget,holdTarget:l,blocks:d,tab:this.tab,onTab:this.setTab})}</div>
      ${s()}
    </ha-card>`}renderProblem(t){return o`<ha-card><div class="nw-problem" role="status"><ha-icon icon="mdi:weather-partly-cloudy"></ha-icon>
      <div><b>${t.title}</b>${t===pi.error&&this.failure?o`<p class="failure">« ${this.failure} »</p>`:c}<p>${t.text}</p>${t.links?o`<div class="links">${t.links.map(([n,a],r)=>o`<a class=${r?"second":""} href=${a}
        target=${a.startsWith("/")?c:"_blank"} rel="noopener noreferrer" @click=${this.follow}>${n}</a>`)}</div>`:c}</div></div></ha-card>`}go(t){history.pushState(null,"",t),window.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0}))}get holdTarget(){return this.target(this.config?.hold_action??(this.weatherPath?"page":"popup"))}get tapTarget(){return this.target(this.config?.tap_action??"toggle")}target(t){return t==="none"?"none":t==="toggle"?this.tile?"toggle":"card":t==="page"&&this.weatherPath?"page":"card"}get weatherPath(){let t=this.config?.weather_path;return t?.startsWith("/")&&!t.startsWith("//")?t:void 0}tileCard(){return this.renderRoot.querySelector(".nw-tilecard")}stopRing(){this.press&&(clearTimeout(this.press.timer),cancelAnimationFrame(this.press.frame),this.tileCard()?.classList.remove("pressing"))}toggle(){this.open=!this.open;try{localStorage.setItem(this.key(),this.open?"1":"0")}catch{}}act(t){let n=this.weatherPath;t==="toggle"?this.toggle():t==="page"&&n?this.go(n):t==="card"&&(this.dialogOpen=!0)}};L.styles=[St,Et,_e,Vt,Yt,ii,ri,Gt,Ft,ei,_`
    :host { display:block; }
    :host([hidden]) { display:none; }
    /* Animations switched off: the alert halo stays still too, in the tile, the window and the scrolling bubble. */
    :host([still]) { --nw-motion:paused; }
    /* Frosted glass switched off: no blur anywhere (it costs a lot on slow devices), a more opaque glass keeps the text readable. */
    :host([flat]) { --nw-blur:none; --nw-frost:none; --nw-glass-clear:color-mix(in srgb, var(--nw-bg) 86%, transparent); --nw-glass-strong:color-mix(in srgb, var(--nw-bg) 92%, transparent); }
    ha-card { padding:0; overflow:hidden; container-type:inline-size; }
    .nw-wait { min-height:96px; background:var(--nw-bg); }
    .nw-problem { display:flex; gap:14px; align-items:flex-start; padding:18px 20px; color:var(--nw-fg); font-size:var(--nw-fs-text); line-height:1.5; }
    .nw-problem > ha-icon { --mdc-icon-size:28px; color:var(--nw-accent); flex:none; }
    .nw-problem b { font-size:var(--nw-fs-title); }
    .nw-problem p { margin:4px 0 10px; color:var(--nw-fg2); }
    .nw-problem a { display:inline-block; padding:6px 14px; border-radius:var(--nw-radius-pill); background:var(--nw-accent); color:var(--nw-bg);
      font-weight:600; text-decoration:none; font-size:var(--nw-fs-small); }
    .nw-problem .links { display:flex; flex-wrap:wrap; gap:8px; }
    .nw-problem .failure { color:var(--nw-fg); font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:var(--nw-fs-small); word-break:break-word; }
    .nw-problem a.second { background:none; color:var(--nw-accent); box-shadow:inset 0 0 0 1px var(--nw-line); }
    dialog.nw-dialog { border:0; padding:0; width:min(1180px, 96vw); max-height:92vh; border-radius:16px; overflow:auto; overscroll-behavior:contain;
      background:var(--nw-bg); color:var(--nw-fg); box-shadow:0 24px 80px #0005; }
    dialog.nw-dialog::backdrop { background:#0b1520aa; backdrop-filter:blur(2px); }
    .nw-dialog > header { position:sticky; top:0; z-index:3; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 14px;
      background:var(--nw-bg); border-bottom:1px solid var(--nw-line-soft); font-size:var(--nw-fs-text); }
    .nw-dialog > header button { border:1px solid var(--nw-line); background:var(--nw-bg); border-radius:var(--nw-radius-pill); padding:5px 14px; cursor:pointer; font-size:var(--nw-fs-small); font-weight:600; }
    @media (max-width:600px) { dialog.nw-dialog { width:100vw; max-width:100vw; height:100dvh; max-height:100dvh; border-radius:0; margin:0; } }
    /* Full screen on a phone, the app may draw under the system bars: room to scroll the last section above them. */
    @media (max-width:600px) { dialog.nw-dialog > .nw-full { padding-bottom:calc(env(safe-area-inset-bottom, 0px) + 72px); } }
  `],x([C({attribute:!1})],L.prototype,"hass",2),x([C({attribute:!1})],L.prototype,"editMode",2),x([C({attribute:!1})],L.prototype,"preview",2),x([S()],L.prototype,"config",2),x([S()],L.prototype,"tab",2),x([S()],L.prototype,"view",2),x([S()],L.prototype,"problem",2),x([S()],L.prototype,"open",2),x([S()],L.prototype,"dialogOpen",2),x([S()],L.prototype,"folded",2),L=x([V("niak-weather-card")],L);var Xi=[["full","Niak Weather","La page m\xE9t\xE9o : synth\xE8se, mesures, pr\xE9visions, air et pollens."],["tile","Niak Weather \xB7 Tuile","Une bande qui se d\xE9plie d\u2019un appui ; son contenu se choisit."],["intermediate","Niak Weather \xB7 Tuile d\xE9pli\xE9e","La tuile, ouverte au d\xE9part : bulletin, \xE9v\xE9nements, moments ou pr\xE9visions."],["mini","Niak Weather \xB7 Mini","Une seule ligne : le ciel, la temp\xE9rature et la vigilance."],["forecast","Niak Weather \xB7 Pr\xE9visions","Les 18 prochaines heures ou les 7 prochains jours."],["rain","Niak Weather \xB7 Pluie","La pluie \xE0 venir, celle qui tombe et celle qui est tomb\xE9e."],["alert","Niak Weather \xB7 Alerte","Visible seulement en cas de vigilance ou d\u2019alerte."]];for(let[e,i,t]of Xi){let n=e==="full"?"niak-weather-card":`niak-weather-${e==="intermediate"?"tile-open":e}-card`;e!=="full"&&!customElements.get(n)&&customElements.define(n,class extends L{static getStubConfig(){return{type:"custom:niak-weather-card",format:e}}setConfig(a){super.setConfig({format:e,...a})}}),window.customCards=window.customCards||[],window.customCards.some(a=>a.type===n)||window.customCards.push({type:n,name:i,description:t,preview:!0})}})();
