// Home Assistant frontend#53890: wait for the final custom element registry.
while (!customElements.get('home-assistant')) {
  await customElements.whenDefined('home-assistant');
}
"use strict";(()=>{var Ii=Object.defineProperty;var qi=Object.getOwnPropertyDescriptor;var y=(t,i,e,n)=>{for(var a=n>1?void 0:n?qi(i,e):i,l=t.length-1,p;l>=0;l--)(p=t[l])&&(a=(n?p(i,e,a):p(a))||a);return n&&a&&Ii(i,e,a),a};var Ee=globalThis,Me=Ee.ShadowRoot&&(Ee.ShadyCSS===void 0||Ee.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ze=Symbol(),Mt=new WeakMap,we=class{constructor(i,e,n){if(this._$cssResult$=!0,n!==Ze)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=i,this.t=e}get styleSheet(){let i=this.o,e=this.t;if(Me&&i===void 0){let n=e!==void 0&&e.length===1;n&&(i=Mt.get(e)),i===void 0&&((this.o=i=new CSSStyleSheet).replaceSync(this.cssText),n&&Mt.set(e,i))}return i}toString(){return this.cssText}},Lt=t=>new we(typeof t=="string"?t:t+"",void 0,Ze),A=(t,...i)=>{let e=t.length===1?t[0]:i.reduce((n,a,l)=>n+(p=>{if(p._$cssResult$===!0)return p.cssText;if(typeof p=="number")return p;throw Error("Value passed to 'css' function must be a 'css' function result: "+p+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+t[l+1],t[0]);return new we(e,t,Ze)},zt=(t,i)=>{if(Me)t.adoptedStyleSheets=i.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of i){let n=document.createElement("style"),a=Ee.litNonce;a!==void 0&&n.setAttribute("nonce",a),n.textContent=e.cssText,t.appendChild(n)}},Xe=Me?t=>t:t=>t instanceof CSSStyleSheet?(i=>{let e="";for(let n of i.cssRules)e+=n.cssText;return Lt(e)})(t):t;var{is:Wi,defineProperty:Vi,getOwnPropertyDescriptor:Bi,getOwnPropertyNames:Ni,getOwnPropertySymbols:Di,getPrototypeOf:Ui}=Object,Le=globalThis,Rt=Le.trustedTypes,Gi=Rt?Rt.emptyScript:"",Ki=Le.reactiveElementPolyfillSupport,be=(t,i)=>t,ve={toAttribute(t,i){switch(i){case Boolean:t=t?Gi:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,i){let e=t;switch(i){case Boolean:e=t!==null;break;case Number:e=t===null?null:Number(t);break;case Object:case Array:try{e=JSON.parse(t)}catch{e=null}}return e}},ze=(t,i)=>!Wi(t,i),jt={attribute:!0,type:String,converter:ve,reflect:!1,useDefault:!1,hasChanged:ze};Symbol.metadata??=Symbol("metadata"),Le.litPropertyMetadata??=new WeakMap;var J=class extends HTMLElement{static addInitializer(i){this._$Ei(),(this.l??=[]).push(i)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(i,e=jt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(i)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(i,e),!e.noAccessor){let n=Symbol(),a=this.getPropertyDescriptor(i,n,e);a!==void 0&&Vi(this.prototype,i,a)}}static getPropertyDescriptor(i,e,n){let{get:a,set:l}=Bi(this.prototype,i)??{get(){return this[e]},set(p){this[e]=p}};return{get:a,set(p){let s=a?.call(this);l?.call(this,p),this.requestUpdate(i,s,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(i){return this.elementProperties.get(i)??jt}static _$Ei(){if(this.hasOwnProperty(be("elementProperties")))return;let i=Ui(this);i.finalize(),i.l!==void 0&&(this.l=[...i.l]),this.elementProperties=new Map(i.elementProperties)}static finalize(){if(this.hasOwnProperty(be("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(be("properties"))){let e=this.properties,n=[...Ni(e),...Di(e)];for(let a of n)this.createProperty(a,e[a])}let i=this[Symbol.metadata];if(i!==null){let e=litPropertyMetadata.get(i);if(e!==void 0)for(let[n,a]of e)this.elementProperties.set(n,a)}this._$Eh=new Map;for(let[e,n]of this.elementProperties){let a=this._$Eu(e,n);a!==void 0&&this._$Eh.set(a,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(i){let e=[];if(Array.isArray(i)){let n=new Set(i.flat(1/0).reverse());for(let a of n)e.unshift(Xe(a))}else i!==void 0&&e.push(Xe(i));return e}static _$Eu(i,e){let n=e.attribute;return n===!1?void 0:typeof n=="string"?n:typeof i=="string"?i.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(i=>this.enableUpdating=i),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(i=>i(this))}addController(i){(this._$EO??=new Set).add(i),this.renderRoot!==void 0&&this.isConnected&&i.hostConnected?.()}removeController(i){this._$EO?.delete(i)}_$E_(){let i=new Map,e=this.constructor.elementProperties;for(let n of e.keys())this.hasOwnProperty(n)&&(i.set(n,this[n]),delete this[n]);i.size>0&&(this._$Ep=i)}createRenderRoot(){let i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return zt(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(i=>i.hostConnected?.())}enableUpdating(i){}disconnectedCallback(){this._$EO?.forEach(i=>i.hostDisconnected?.())}attributeChangedCallback(i,e,n){this._$AK(i,n)}_$ET(i,e){let n=this.constructor.elementProperties.get(i),a=this.constructor._$Eu(i,n);if(a!==void 0&&n.reflect===!0){let l=(n.converter?.toAttribute!==void 0?n.converter:ve).toAttribute(e,n.type);this._$Em=i,l==null?this.removeAttribute(a):this.setAttribute(a,l),this._$Em=null}}_$AK(i,e){let n=this.constructor,a=n._$Eh.get(i);if(a!==void 0&&this._$Em!==a){let l=n.getPropertyOptions(a),p=typeof l.converter=="function"?{fromAttribute:l.converter}:l.converter?.fromAttribute!==void 0?l.converter:ve;this._$Em=a;let s=p.fromAttribute(e,l.type);this[a]=s??this._$Ej?.get(a)??s,this._$Em=null}}requestUpdate(i,e,n,a=!1,l){if(i!==void 0){let p=this.constructor;if(a===!1&&(l=this[i]),n??=p.getPropertyOptions(i),!((n.hasChanged??ze)(l,e)||n.useDefault&&n.reflect&&l===this._$Ej?.get(i)&&!this.hasAttribute(p._$Eu(i,n))))return;this.C(i,e,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(i,e,{useDefault:n,reflect:a,wrapped:l},p){n&&!(this._$Ej??=new Map).has(i)&&(this._$Ej.set(i,p??e??this[i]),l!==!0||p!==void 0)||(this._$AL.has(i)||(this.hasUpdated||n||(e=void 0),this._$AL.set(i,e)),a===!0&&this._$Em!==i&&(this._$Eq??=new Set).add(i))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let i=this.scheduleUpdate();return i!=null&&await i,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[a,l]of this._$Ep)this[a]=l;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[a,l]of n){let{wrapped:p}=l,s=this[a];p!==!0||this._$AL.has(a)||s===void 0||this.C(a,void 0,l,s)}}let i=!1,e=this._$AL;try{i=this.shouldUpdate(e),i?(this.willUpdate(e),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(e)):this._$EM()}catch(n){throw i=!1,this._$EM(),n}i&&this._$AE(e)}willUpdate(i){}_$AE(i){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(i)),this.updated(i)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(i){return!0}update(i){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(i){}firstUpdated(i){}};J.elementStyles=[],J.shadowRootOptions={mode:"open"},J[be("elementProperties")]=new Map,J[be("finalized")]=new Map,Ki?.({ReactiveElement:J}),(Le.reactiveElementVersions??=[]).push("2.1.2");var st=globalThis,Ft=t=>t,Re=st.trustedTypes,Ot=Re?Re.createPolicy("lit-html",{createHTML:t=>t}):void 0,Bt="$lit$",Z=`lit$${Math.random().toFixed(9).slice(2)}$`,Nt="?"+Z,Qi=`<${Nt}>`,ae=document,ye=()=>ae.createComment(""),$e=t=>t===null||typeof t!="object"&&typeof t!="function",ot=Array.isArray,Ji=t=>ot(t)||typeof t?.[Symbol.iterator]=="function",et=`[ 	
\f\r]`,xe=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ht=/-->/g,It=/>/g,ie=RegExp(`>|${et}(?:([^\\s"'>=/]+)(${et}*=${et}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),qt=/'/g,Wt=/"/g,Dt=/^(?:script|style|textarea|title)$/i,lt=t=>(i,...e)=>({_$litType$:t,strings:i,values:e}),o=lt(1),q=lt(2),Nn=lt(3),re=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),Vt=new WeakMap,ne=ae.createTreeWalker(ae,129);function Ut(t,i){if(!ot(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ot!==void 0?Ot.createHTML(i):i}var Yi=(t,i)=>{let e=t.length-1,n=[],a,l=i===2?"<svg>":i===3?"<math>":"",p=xe;for(let s=0;s<e;s++){let d=t[s],h,m,u=-1,f=0;for(;f<d.length&&(p.lastIndex=f,m=p.exec(d),m!==null);)f=p.lastIndex,p===xe?m[1]==="!--"?p=Ht:m[1]!==void 0?p=It:m[2]!==void 0?(Dt.test(m[2])&&(a=RegExp("</"+m[2],"g")),p=ie):m[3]!==void 0&&(p=ie):p===ie?m[0]===">"?(p=a??xe,u=-1):m[1]===void 0?u=-2:(u=p.lastIndex-m[2].length,h=m[1],p=m[3]===void 0?ie:m[3]==='"'?Wt:qt):p===Wt||p===qt?p=ie:p===Ht||p===It?p=xe:(p=ie,a=void 0);let b=p===ie&&t[s+1].startsWith("/>")?" ":"";l+=p===xe?d+Qi:u>=0?(n.push(h),d.slice(0,u)+Bt+d.slice(u)+Z+b):d+Z+(u===-2?s:b)}return[Ut(t,l+(t[e]||"<?>")+(i===2?"</svg>":i===3?"</math>":"")),n]},ke=class t{constructor({strings:i,_$litType$:e},n){let a;this.parts=[];let l=0,p=0,s=i.length-1,d=this.parts,[h,m]=Yi(i,e);if(this.el=t.createElement(h,n),ne.currentNode=this.el.content,e===2||e===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(a=ne.nextNode())!==null&&d.length<s;){if(a.nodeType===1){if(a.hasAttributes())for(let u of a.getAttributeNames())if(u.endsWith(Bt)){let f=m[p++],b=a.getAttribute(u).split(Z),$=/([.?@])?(.*)/.exec(f);d.push({type:1,index:l,name:$[2],strings:b,ctor:$[1]==="."?it:$[1]==="?"?nt:$[1]==="@"?at:pe}),a.removeAttribute(u)}else u.startsWith(Z)&&(d.push({type:6,index:l}),a.removeAttribute(u));if(Dt.test(a.tagName)){let u=a.textContent.split(Z),f=u.length-1;if(f>0){a.textContent=Re?Re.emptyScript:"";for(let b=0;b<f;b++)a.append(u[b],ye()),ne.nextNode(),d.push({type:2,index:++l});a.append(u[f],ye())}}}else if(a.nodeType===8)if(a.data===Nt)d.push({type:2,index:l});else{let u=-1;for(;(u=a.data.indexOf(Z,u+1))!==-1;)d.push({type:7,index:l}),u+=Z.length-1}l++}}static createElement(i,e){let n=ae.createElement("template");return n.innerHTML=i,n}};function de(t,i,e=t,n){if(i===re)return i;let a=n!==void 0?e._$Co?.[n]:e._$Cl,l=$e(i)?void 0:i._$litDirective$;return a?.constructor!==l&&(a?._$AO?.(!1),l===void 0?a=void 0:(a=new l(t),a._$AT(t,e,n)),n!==void 0?(e._$Co??=[])[n]=a:e._$Cl=a),a!==void 0&&(i=de(t,a._$AS(t,i.values),a,n)),i}var tt=class{constructor(i,e){this._$AV=[],this._$AN=void 0,this._$AD=i,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(i){let{el:{content:e},parts:n}=this._$AD,a=(i?.creationScope??ae).importNode(e,!0);ne.currentNode=a;let l=ne.nextNode(),p=0,s=0,d=n[0];for(;d!==void 0;){if(p===d.index){let h;d.type===2?h=new _e(l,l.nextSibling,this,i):d.type===1?h=new d.ctor(l,d.name,d.strings,this,i):d.type===6&&(h=new rt(l,this,i)),this._$AV.push(h),d=n[++s]}p!==d?.index&&(l=ne.nextNode(),p++)}return ne.currentNode=ae,a}p(i){let e=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(i,n,e),e+=n.strings.length-2):n._$AI(i[e])),e++}},_e=class t{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(i,e,n,a){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=i,this._$AB=e,this._$AM=n,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let i=this._$AA.parentNode,e=this._$AM;return e!==void 0&&i?.nodeType===11&&(i=e.parentNode),i}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(i,e=this){i=de(this,i,e),$e(i)?i===c||i==null||i===""?(this._$AH!==c&&this._$AR(),this._$AH=c):i!==this._$AH&&i!==re&&this._(i):i._$litType$!==void 0?this.$(i):i.nodeType!==void 0?this.T(i):Ji(i)?this.k(i):this._(i)}O(i){return this._$AA.parentNode.insertBefore(i,this._$AB)}T(i){this._$AH!==i&&(this._$AR(),this._$AH=this.O(i))}_(i){this._$AH!==c&&$e(this._$AH)?this._$AA.nextSibling.data=i:this.T(ae.createTextNode(i)),this._$AH=i}$(i){let{values:e,_$litType$:n}=i,a=typeof n=="number"?this._$AC(i):(n.el===void 0&&(n.el=ke.createElement(Ut(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===a)this._$AH.p(e);else{let l=new tt(a,this),p=l.u(this.options);l.p(e),this.T(p),this._$AH=l}}_$AC(i){let e=Vt.get(i.strings);return e===void 0&&Vt.set(i.strings,e=new ke(i)),e}k(i){ot(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,n,a=0;for(let l of i)a===e.length?e.push(n=new t(this.O(ye()),this.O(ye()),this,this.options)):n=e[a],n._$AI(l),a++;a<e.length&&(this._$AR(n&&n._$AB.nextSibling,a),e.length=a)}_$AR(i=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);i!==this._$AB;){let n=Ft(i).nextSibling;Ft(i).remove(),i=n}}setConnected(i){this._$AM===void 0&&(this._$Cv=i,this._$AP?.(i))}},pe=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(i,e,n,a,l){this.type=1,this._$AH=c,this._$AN=void 0,this.element=i,this.name=e,this._$AM=a,this.options=l,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=c}_$AI(i,e=this,n,a){let l=this.strings,p=!1;if(l===void 0)i=de(this,i,e,0),p=!$e(i)||i!==this._$AH&&i!==re,p&&(this._$AH=i);else{let s=i,d,h;for(i=l[0],d=0;d<l.length-1;d++)h=de(this,s[n+d],e,d),h===re&&(h=this._$AH[d]),p||=!$e(h)||h!==this._$AH[d],h===c?i=c:i!==c&&(i+=(h??"")+l[d+1]),this._$AH[d]=h}p&&!a&&this.j(i)}j(i){i===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,i??"")}},it=class extends pe{constructor(){super(...arguments),this.type=3}j(i){this.element[this.name]=i===c?void 0:i}},nt=class extends pe{constructor(){super(...arguments),this.type=4}j(i){this.element.toggleAttribute(this.name,!!i&&i!==c)}},at=class extends pe{constructor(i,e,n,a,l){super(i,e,n,a,l),this.type=5}_$AI(i,e=this){if((i=de(this,i,e,0)??c)===re)return;let n=this._$AH,a=i===c&&n!==c||i.capture!==n.capture||i.once!==n.once||i.passive!==n.passive,l=i!==c&&(n===c||a);a&&this.element.removeEventListener(this.name,this,n),l&&this.element.addEventListener(this.name,this,i),this._$AH=i}handleEvent(i){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,i):this._$AH.handleEvent(i)}},rt=class{constructor(i,e,n){this.element=i,this.type=6,this._$AN=void 0,this._$AM=e,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(i){de(this,i)}};var Zi=st.litHtmlPolyfillSupport;Zi?.(ke,_e),(st.litHtmlVersions??=[]).push("3.3.3");var Gt=(t,i,e)=>{let n=e?.renderBefore??i,a=n._$litPart$;if(a===void 0){let l=e?.renderBefore??null;n._$litPart$=a=new _e(i.insertBefore(ye(),l),l,void 0,e??{})}return a._$AI(t),a};var dt=globalThis,F=class extends J{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let i=super.createRenderRoot();return this.renderOptions.renderBefore??=i.firstChild,i}update(i){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(i),this._$Do=Gt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return re}};F._$litElement$=!0,F.finalized=!0,dt.litElementHydrateSupport?.({LitElement:F});var Xi=dt.litElementPolyfillSupport;Xi?.({LitElement:F});(dt.litElementVersions??=[]).push("4.2.2");var en={attribute:!0,type:String,converter:ve,reflect:!1,hasChanged:ze},tn=(t=en,i,e)=>{let{kind:n,metadata:a}=e,l=globalThis.litPropertyMetadata.get(a);if(l===void 0&&globalThis.litPropertyMetadata.set(a,l=new Map),n==="setter"&&((t=Object.create(t)).wrapped=!0),l.set(e.name,t),n==="accessor"){let{name:p}=e;return{set(s){let d=i.get.call(this);i.set.call(this,s),this.requestUpdate(p,d,t,!0,s)},init(s){return s!==void 0&&this.C(p,void 0,t,s),s}}}if(n==="setter"){let{name:p}=e;return function(s){let d=this[p];i.call(this,s),this.requestUpdate(p,d,t,!0,s)}}throw Error("Unsupported decorator location: "+n)};function E(t){return(i,e)=>typeof e=="object"?tn(t,i,e):((n,a,l)=>{let p=a.hasOwnProperty(l);return a.constructor.createProperty(l,n),p?Object.getOwnPropertyDescriptor(a,l):void 0})(t,i,e)}function M(t){return E({...t,state:!0,attribute:!1})}var D=t=>i=>{customElements.get(t)||customElements.define(t,i)};function Fe(t){return{hero:t.banner_blocks!==void 0||t.show_synthesis!==!1,banner:t.banner_blocks??(t.show_synthesis===!1?[]:[...t.show_bulletin===!1?[]:["bulletin"],"events"]),today:t.today_blocks??(t.show_today===!1?[]:["comfort","rain","wind","pressure","extras","air"]),forecasts:t.forecast_blocks??(t.show_predictions===!1?[]:["hours","days",...t.show_atmo_tomorrow===!1?[]:["air"]])}}function Ae(t){let i={...t};i.mode==="compact"&&i.show_predictions===void 0&&(i.show_predictions=!1),delete i.mode;let e=i.full_blocks;if(Array.isArray(e)){let n=["bulletin","events","moments","forecast"],a=e.includes("air");i.banner_blocks??=e.filter(l=>n.includes(l)),i.today_blocks??=e.includes("today")?["comfort","rain","wind","pressure","extras",...a?["air"]:[]]:[],i.forecast_blocks??=e.includes("predictions")?["hours","days",...a?["air"]:[]]:[]}delete i.full_blocks,delete i.air_blocks,delete i.lightning_distance_entity,delete i.comfort_entity,delete i.air_quality_entity,delete i.model_entity,delete i.forecast_entity,delete i.air_path;for(let n of["humidex_entity","humidex_perception_entity","thermal_dew_point_entity","heat_index_entity","absolute_humidity_entity","thermal_perception_entity","thermal_device_id"])delete i[n];return i}function nn(t,i){let e=t.periods?.find(n=>n.period===i);return e?{...t,period:i,series:e.series,low:e.low,top:e.top,stats:e.stats}:{...t,period:"6h"}}function an(t,i){let e=t.periods?.find(n=>n.period===i);return e?{...t,period:i,mean:e.mean,gust:e.gust,top:e.top}:{...t,period:"6h"}}function rn(t,i){let e=t.periods?.find(n=>n.period===i);return e?{...t,period:i,days:e.days,total:e.total,totalPartial:e.partial}:{...t,period:"7d"}}function Kt(t,i,e){let n=!e&&!!i.banner_blocks,a=e||n||i.smart_brief!==!1&&i.show_synthesis!==!1,l=p=>i.show_atmo_details===!1?p.map(s=>({...s,details:[],updated:""})):p;return{...t,brief:a?t.brief:void 0,alerts:a?t.alerts:[],points:a?t.points:[],timeline:a?t.timeline:[],bulletin:i.show_bulletin===!1&&!(e&&i.tile_blocks?.length)&&!n?void 0:t.bulletin,pressure:t.pressure&&nn(t.pressure,i.pressure_span??"6h"),wind:t.wind&&an(t.wind,i.wind_span??"6h"),rain:t.rain&&rn(t.rain,i.rain_span??"7d"),air:{today:l(t.air.today),tomorrow:i.show_atmo_tomorrow===!1&&!i.forecast_blocks?[]:l(t.air.tomorrow)}}}var Qt=A`
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
`,Jt=A`
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
  .nw-pop .ex::before { content:var(--nw-example-word, 'Exemple'); display:block; font-size:var(--nw-fs-label); font-weight:700; letter-spacing:var(--nw-label-spacing); text-transform:uppercase; margin-bottom:2px; }
  .nw-pop a { color:var(--nw-accent); }
`,Oe=A`
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
`;var Yt={Lieu:"Place",Format:"Format","Ciel anim\xE9 et halos":"Animated sky and halos","Qualit\xE9 des animations":"Animation quality","Effet verre d\xE9poli":"Frosted glass effect","Bandeau (synth\xE8se et m\xE9t\xE9o du moment)":"Banner (summary and current weather)","Bulletin du jour":"Today\u2019s bulletin","Alertes et \xE9v\xE9nements":"Alerts and events","Section Aujourd\u2019hui":"Today section","Aujourd\u2019hui repli\xE9 au d\xE9part":"Today folded at first","Section Pr\xE9visions":"Forecast section","Pr\xE9visions repli\xE9es au d\xE9part":"Forecast folded at first","D\xE9tail des polluants et des pollens":"Pollutant and pollen details","Air et pollens de demain":"Tomorrow\u2019s air and pollen","Page \xE0 ouvrir":"Page to open","Contenu de la tuile d\xE9pli\xE9e":"Unfolded tile content","Pr\xE9visions affich\xE9es au d\xE9part":"Forecast shown at first","Contenu du bandeau":"Banner content","Contenu d\u2019Aujourd\u2019hui":"Today content","Contenu des Pr\xE9visions":"Forecast content","Appui long":"Long press",Appui:"Tap","Courbe de pression":"Pressure chart","Courbe du vent":"Wind chart","Barres de pluie":"Rain bars","Heure dans le bandeau":"Time in the banner","Coup\xE9es, le ciel et les halos restent fixes.":"Off, the sky and the halos stay still.","All\xE9g\xE9e : moins de gouttes, de flocons et de nuages.":"Light: fewer drops, flakes and clouds.","Le flou demande beaucoup de ressources : \xE0 couper sur un appareil lent. Coup\xE9, le verre devient plus opaque.":"The blur takes a lot of power: switch it off on a slow device. Off, the glass becomes more opaque.","La vigilance, l\u2019alerte mesur\xE9e chez vous et la frise des \xE9v\xE9nements. Coup\xE9, la frise ne montre que le ciel pr\xE9vu.":"The weather warning, the alert measured at home and the events timeline. Off, the timeline only shows the forecast sky.","Le chemin de la page, par exemple /meteo ou /lovelace/meteo.":"The page\u2019s path, for example /weather or /lovelace/weather.","Cochez ce qui s\u2019affiche quand la tuile est d\xE9pli\xE9e, et faites glisser pour changer l\u2019ordre.":"Tick what shows when the tile is unfolded, and drag to change the order.","Le bandeau et son ciel anim\xE9 restent toujours, avec le lieu, la vigilance et la m\xE9t\xE9o du moment. Cochez ce qu\u2019il montre en dessous, dans l\u2019ordre.":"The banner and its animated sky always stay, with the place, the weather warning and the current weather. Tick what it shows below, in order.","Tout d\xE9cocher retire la section.":"Untick everything to remove the section.","Un appui sur Heures ou Jours change l\u2019affichage ; ce choix est gard\xE9 sur chaque appareil.":"A tap on Hours or Days switches the view; the choice is kept on each device.","Sur plusieurs jours, on voit mieux arriver une d\xE9pression ou un anticyclone.":"Over several days, a low or a high is easier to see coming.","24 heures et 30 jours demandent un pluviom\xE8tre dont Home Assistant garde les statistiques ; sinon, la carte montre 7 jours.":"24 hours and 30 days need a rain gauge whose statistics Home Assistant keeps; otherwise the card shows 7 days.","L\u2019heure de l\u2019appareil, mise \xE0 jour chaque minute.":"The device\u2019s time, updated every minute.","Compl\xE8te : la page m\xE9t\xE9o":"Full: the weather page","Tuile : une bande qui se d\xE9plie d\u2019un appui":"Tile: a band that unfolds with a tap","Tuile d\xE9pli\xE9e : la m\xEAme, ouverte au d\xE9part":"Unfolded tile: the same, open at first","Mini : une seule ligne":"Mini: a single line","Pr\xE9visions : les heures et les jours":"Forecast: the hours and the days","Pluie : \xE0 venir et tomb\xE9e":"Rain: coming and fallen","Alerte : visible seulement en cas de vigilance ou d\u2019alerte":"Alert: only shown during a weather warning or an alert","\xC9v\xE9nements (la frise)":"Events (the timeline)","Les prochains moments (soir, nuit, matin\u2026)":"The coming moments (evening, night, morning\u2026)","Pr\xE9visions (heures ou jours)":"Forecast (hours or days)",Heures:"Hours",Jours:"Days","D\xE9plier ou replier la tuile":"Unfold or fold the tile","Ouvrir la m\xE9t\xE9o compl\xE8te en fen\xEAtre":"Open the full weather in a window","Ouvrir une page":"Open a page",Rien:"Nothing","Visuel et performance":"Look and performance",Standard:"Standard",All\u00E9g\u00E9e:"Light",Fonctionnalit\u00E9s:"Features",Contenu:"Content","6 derni\xE8res heures":"Last 6 hours","24 derni\xE8res heures":"Last 24 hours","2 derniers jours":"Last 2 days","7 derniers jours":"Last 7 days","30 derniers jours":"Last 30 days","Bandeau intelligent":"Smart banner","Pr\xE9visions en tuiles (heures ou jours)":"Forecast tiles (hours or days)",Masqu\u00E9e:"Hidden","Sous le titre, en grand":"Under the title, large","Au-dessus de \xAB En ce moment \xBB":"Above \u201CRight now\u201D","Pastilles (humidit\xE9, ros\xE9e, soleil\u2026)":"Chips (humidity, dew, sun\u2026)","Air et pollens du jour":"Today\u2019s air and pollen","24 derni\xE8res heures (une barre par heure)":"Last 24 hours (one bar an hour)","30 derniers jours (une barre par jour)":"Last 30 days (one bar a day)","Les 18 prochaines heures":"The next 18 hours","Les 7 prochains jours":"The next 7 days","Air et pollens":"Air and pollen","L\u2019int\xE9gration Niak Weather ne r\xE9pond pas : la carte en a besoin depuis la version 2.0.":"The Niak Weather integration does not answer: the card needs it since version 2.0.","D\xE9j\xE0 t\xE9l\xE9charg\xE9e ?":"Already downloaded?","Ajoutez-la":"Add it","Sinon,":"Otherwise,","installez-la":"install it","Ajoutez l\u2019int\xE9gration Niak Weather : Param\xE8tres \u2192 Appareils et services.":"Add the Niak Weather integration: Settings \u2192 Devices & services.","Lieu :":"Place:","Les sources (pr\xE9visions, station, air et pollens) se r\xE8glent dans":"The sources (forecast, station, air and pollen) are set in","l\u2019int\xE9gration Niak Weather":"the Niak Weather integration","Niak Weather a besoin de son int\xE9gration":"Niak Weather needs its integration","Depuis la version 2.0, la carte re\xE7oit ses calculs de l\u2019int\xE9gration Niak Weather. D\xE9j\xE0 t\xE9l\xE9charg\xE9e depuis HACS ? Ajoutez-la dans Param\xE8tres \u2192 Appareils et services. Sinon, installez-la depuis HACS, red\xE9marrez Home Assistant, puis ajoutez-la. D\xE9j\xE0 ajout\xE9e ? Elle n\u2019a pas d\xE9marr\xE9 : les journaux disent pourquoi (Param\xE8tres \u2192 Syst\xE8me \u2192 Journaux, cherchez \xAB niak \xBB).":"Since version 2.0, the card gets its figures from the Niak Weather integration. Already downloaded from HACS? Add it in Settings \u2192 Devices & services. Otherwise, install it from HACS, restart Home Assistant, then add it. Already added? It did not start: the logs say why (Settings \u2192 System \u2192 Logs, search for \u201Cniak\u201D).","Ajouter l\u2019int\xE9gration":"Add the integration","L\u2019installer":"Install it","Ajoutez l\u2019int\xE9gration Niak Weather":"Add the Niak Weather integration","Elle est install\xE9e mais pas encore configur\xE9e. Elle peut reprendre les r\xE9glages de vos cartes.":"It is installed but not set up yet. It can take over your cards\u2019 settings.","Choisissez un lieu":"Choose a place","Plusieurs lieux Niak Weather sont configur\xE9s : choisissez celui de cette carte dans ses r\xE9glages.":"Several Niak Weather places are set up: choose this card\u2019s place in its settings.","Lieu introuvable":"Place not found","Le lieu de cette carte n\u2019existe plus : choisissez-en un autre dans ses r\xE9glages.":"This card\u2019s place no longer exists: choose another one in its settings.","Rechargez la page":"Reload the page","L\u2019int\xE9gration Niak Weather vient d\u2019\xEAtre mise \xE0 jour : rechargez la page pour afficher sa carte.":"The Niak Weather integration has just been updated: reload the page to show its card.","L\u2019int\xE9gration Niak Weather a renvoy\xE9 une erreur":"The Niak Weather integration returned an error","Les journaux de Home Assistant disent pourquoi : Param\xE8tres \u2192 Syst\xE8me \u2192 Journaux, cherchez \xAB niak \xBB.":"Home Assistant\u2019s logs say why: Settings \u2192 System \u2192 Logs, search for \u201Cniak\u201D.","Voir les journaux":"See the logs","Chargement de la m\xE9t\xE9o":"Loading the weather",M\u00E9t\u00E9o:"Weather","M\xE9t\xE9o \xE0 {place}":"Weather in {place}",Fermer:"Close","Niak Weather":"Niak Weather","La page m\xE9t\xE9o : synth\xE8se, mesures, pr\xE9visions, air et pollens.":"The weather page: summary, measurements, forecast, air and pollen.","Niak Weather \xB7 Tuile":"Niak Weather \xB7 Tile","Une bande qui se d\xE9plie d\u2019un appui ; son contenu se choisit.":"A band that unfolds with a tap; you choose what it holds.","Niak Weather \xB7 Tuile d\xE9pli\xE9e":"Niak Weather \xB7 Unfolded tile","La tuile, ouverte au d\xE9part : bulletin, \xE9v\xE9nements, moments ou pr\xE9visions.":"The tile, open at first: bulletin, events, moments or forecast.","Niak Weather \xB7 Mini":"Niak Weather \xB7 Mini","Une seule ligne : le ciel, la temp\xE9rature et la vigilance.":"A single line: the sky, the temperature and the weather warning.","Niak Weather \xB7 Pr\xE9visions":"Niak Weather \xB7 Forecast","Les 18 prochaines heures ou les 7 prochains jours.":"The next 18 hours or the next 7 days.","Niak Weather \xB7 Pluie":"Niak Weather \xB7 Rain","La pluie \xE0 venir, celle qui tombe et celle qui est tomb\xE9e.":"The rain to come, the rain falling and the rain that fell.","Niak Weather \xB7 Alerte":"Niak Weather \xB7 Alert","Visible seulement en cas de vigilance ou d\u2019alerte.":"Only shown during a weather warning or an alert.",Maintenant:"Now",maintenant:"now",minuit:"midnight",midi:"noon","N NNE NE ENE E ESE SE SSE S SSO SO OSO O ONO NO NNO":"N NNE NE ENE E ESE SE SSE S SSW SW WSW W WNW NW NNW","Vent du {from} jusqu\u2019\xE0 {speed} km/h":"Wind from {from} up to {speed} km/h","Vent jusqu\u2019\xE0 {speed} km/h":"Wind up to {speed} km/h","Vent du {from} {speed} km/h":"Wind from {from} {speed} km/h","Vent {speed} km/h":"Wind {speed} km/h",", rafales {gust} km/h":", gusts {gust} km/h","Qu\u2019est-ce que : {title} ?":"What is: {title}?",Exemple:"Example","{label} : {text}":"{label}: {text}"," ; ":"; ","concentration indisponible":"concentration unavailable","donn\xE9es anciennes":"old data","Pr\xE9vision non disponible":"Forecast not available","Indice non configur\xE9":"Index not set up","Donn\xE9es anciennes":"Old data","\xC9v\xE9nement signal\xE9":"Event reported","Air ext\xE9rieur demain":"Outdoor air tomorrow","Air ext\xE9rieur aujourd\u2019hui":"Outdoor air today","Pollens demain":"Pollen tomorrow","Pollens aujourd\u2019hui":"Pollen today","Air ext\xE9rieur":"Outdoor air",Pollens:"Pollen",Demain:"Tomorrow","Indice de demain":"Tomorrow\u2019s index","Indice du jour":"Today\u2019s index","Niveau {value} sur {scale}":"Level {value} of {scale}","Code 7 \xB7 hors \xE9chelle":"Code 7 \xB7 off the scale","Indice pollen non fourni":"Pollen index not given","Niveau indisponible":"Level unavailable","Atmo France ne fournit pas d\u2019indice pollen exploitable pour demain \xE0 cet endroit.":"Atmo France gives no usable pollen index for tomorrow at this place.","D\xE9tail des polluants":"Pollutant details","D\xE9tail des pollens":"Pollen details","Une concentration \xE0 0 peut \xEAtre une valeur r\xE9elle ou remplacer une donn\xE9e manquante chez Atmo France. Elle ne permet pas, \xE0 elle seule, de conclure \xE0 une absence de pollen.":"A concentration of 0 may be a real value or stand for missing data at Atmo France. On its own, it does not mean there is no pollen.","Publication Atmo : {date}.":"Published by Atmo: {date}.","Mise \xE0 jour {source} : {date}.":"Updated by {source}: {date}.","Certaines donn\xE9es sont anciennes : \xE0 v\xE9rifier dans l\u2019int\xE9gration.":"Some data is old: check it in the integration.","appui pour la page m\xE9t\xE9o":"tap for the weather page","appui pour la carte compl\xE8te":"tap for the full card","Aucune alerte en ce moment.":"No alert right now.","Cette carte reste cach\xE9e tant que tout est calme.":"This card stays hidden while all is calm.","Alertes m\xE9t\xE9o : appui pour la carte compl\xE8te":"Weather alerts: tap for the full card","Pr\xE9visions affich\xE9es":"Forecast shown","Pr\xE9visions indisponibles pour le moment.":"Forecast unavailable for now.","Pas de pluie avant {hour}":"No rain before {hour}","Pas de pluie pr\xE9vue d\u2019ici 18 h":"No rain expected in the next 18 hours","dans l\u2019heure":"within the hour","sur 6 h":"over 6 hours","\xE0 partir de {hour}":"from {hour}","\xC0 venir":"Coming up",Pr\u00E9visions:"Forecast","18 prochaines heures":"Next 18 hours","Temp\xE9ratures de {low} \xE0 {high} \xB0C":"Temperatures from {low} to {high} \xB0C",", pluie jusqu\u2019\xE0 {mm} mm par heure":", rain up to {mm} mm an hour",", pas de pluie pr\xE9vue":", no rain expected",Temp\u00E9rature:"Temperature",Nuit:"Night","Vent km/h":"Wind km/h","{n} prochains jours":"Next {n} days","Temp\xE9ratures minimales et maximales en \xB0C, pluie en mm, vent maximal en km/h":"Lowest and highest temperatures in \xB0C, rain in mm, strongest wind in km/h",Min:"Low",Max:"High","Aujourd\u2019hui":"Today","aujourd\u2019hui":"today","Mesures et ressenti":"Measurements and feel","Conditions actuelles":"Current conditions","Vigilance officielle":"Official warning",Synth\u00E8se:"Summary","La m\xE9t\xE9o du jour en une phrase, avec ce qui compte maintenant et ce qui arrive.":"Today\u2019s weather in one sentence, with what matters now and what is coming.","\xC0 v\xE9rifier":"To check","\xAB Pluie ce soir, puis \xE9claircies demain matin. \xBB":"\u201CRain this evening, then sunny spells tomorrow morning.\u201D","La temp\xE9rature monte":"The temperature is rising","La temp\xE9rature baisse":"The temperature is falling","page m\xE9t\xE9o":"weather page","carte compl\xE8te":"full card",replier:"fold",d\u00E9plier:"unfold","Les prochains moments":"The coming moments","Pr\xE9vu aujourd\u2019hui : {range}":"Expected today: {range}","mini {t} \xB0C":"low {t} \xB0C","maxi {t} \xB0C":"high {t} \xB0C","En ce moment":"Right now","Temp\xE9rature indisponible":"Temperature unavailable","{source} : {t} degr\xE9s Celsius":"{source}: {t} degrees Celsius",\u00C9v\u00E9nements:"Events","appui pour {goal}":"tap to {goal}","appui long pour {goal}":"long press to {goal}","Appui : {goal}":"Tap: {goal}","Appui long : {goal}":"Long press: {goal}",Pluie:"Rain",Vent:"Wind",Pression:"Pressure",Ressenti:"Feels like","\u22122 j":"\u22122 d","\u22121 j":"\u22121 d","\u22127 j":"\u22127 d","\u221230 j":"\u221230 d","\u221215 j":"\u221215 d","{gap} \xB0C par rapport au thermom\xE8tre":"{gap} \xB0C compared with the thermometer","{gap} \xB0C par rapport \xE0 la temp\xE9rature du bulletin":"{gap} \xB0C compared with the forecast temperature","C\u2019est la temp\xE9rature que le corps per\xE7oit. L\u2019humidit\xE9 et le soleil la font monter, le vent la fait baisser.":"It is the temperature the body feels. Humidity and sun push it up, wind brings it down.","C\u2019est une estimation, pas un indice officiel.":"It is an estimate, not an official index.","En savoir plus":"Learn more","En ce moment : {example}.":"Right now: {example}.","25 \xB0C au thermom\xE8tre dans un air tr\xE8s humide se ressentent comme 30 \xB0C.":"25 \xB0C on the thermometer in very humid air feels like 30 \xB0C.","Thermom\xE8tre {t} \xB0C":"Thermometer {t} \xB0C","Bulletin {t} \xB0C":"Forecast {t} \xB0C","Ressenti {t} \xB0C":"Feels like {t} \xB0C","en ce moment":"right now","Pluie des {period}":"Rain, {period}",indisponible:"unavailable","au moins {mm} mm":"at least {mm} mm","Vent des {period}, moyennes et rafales":"Wind, {period}, mean and gusts",Rafales:"Gusts","Pression des {period}":"Pressure, {period}"};var Zt={en:Yt},Te="fr",pt="fr-FR";function Pe(t,i){let e=(t??"").toLowerCase().split("-")[0],n=e==="fr"?"fr":Zt[e]?e:"en",a=n==="fr"?"fr-FR":i||t||"en",l=n!==Te||a!==pt;return Te=n,pt=a,l}function Xt(){let t;try{t=document.querySelector("home-assistant")?.hass?.language}catch{}try{t??=JSON.parse(localStorage.getItem("selectedLanguage")??"null")??void 0}catch{}Pe(t||document.documentElement.lang||navigator.language)}var He=()=>pt;function r(t,i){let e=Te==="fr"?t:Zt[Te]?.[t]??t;return i?e.replace(/\{(\w+)\}/g,(n,a)=>a in i?String(i[a]):n):e}var ce=t=>Te==="fr"?`${t} h`:`${String(t).padStart(2,"0")}:00`,Ie=t=>t===0?r("minuit"):t===12?r("midi"):ce(t),G=(t,i)=>r("{label} : {text}",{label:t,text:i}),g=t=>t;var ei=new Map,ti=new Map;function ii(t,i={}){let e=JSON.stringify([t,i]),n=ei.get(e);return n||ei.set(e,n=new Intl.DateTimeFormat(t,i)),n}function ni(t,i={}){let e=JSON.stringify([t,i]),n=ti.get(e);return n||ti.set(e,n=new Intl.NumberFormat(t,i)),n}var k=(t,i=1,e=!1)=>ni(He(),{maximumFractionDigits:i,minimumFractionDigits:e?i:0}).format(t),qe=t=>t.replace(/(\d) (°C|km\/h|mm|%|hPa)/g,"$1\xA0$2"),X=t=>`--c:var(--nw-${t})`,he=t=>`color-mix(in oklab,var(--nw-heat) ${Math.round(Math.min(100,Math.max(0,(t-5)/25*100)))}%,var(--nw-cold))`,se=t=>t??c,P=t=>o`<span class="nw-label">${t}</span>`,sn=t=>o`<span class="nw-badge" title=${t}>${t}</span>`;function W(t){return o`<span class="nw-chip" style=${X(t.theme)} data-entity=${se(t.entity)} role=${t.entity?"button":c} tabindex=${t.entity?0:c}>
    <ha-icon icon=${t.icon}></ha-icon>${t.value?o`<b>${t.value}</b>`:c}${t.label}</span>`}function We(t,i=""){return o`<p class=${`nw-bubble ${i}`} data-theme=${t.theme??c} style=${t.theme?X(t.theme):c}>
    <ha-icon icon=${t.icon}></ha-icon><span class="nw-label">${t.label}</span><b title=${t.text}>${t.text}</b></p>`}function Ve(t,i=""){return o`<p class=${`nw-bubble nw-bubble--alert nw-level${t.level} ${i}`} role="status">
    <ha-icon icon=${t.icon}></ha-icon>${t.label?o`<span class="nw-label">${t.label}</span>`:c}<b title=${t.text}>${t.text}</b></p>`}function oe(t){return o`<p class=${`nw-alert nw-level${t.level}`} role="status" title=${t.source} data-entity=${se(t.entity)}>
    <span class="dot"><ha-icon icon=${t.icon}></ha-icon></span><span>${t.label?o`<b>${t.label}<span class="sep"> · </span></b>`:c}${t.text}</span></p>`}var on=t=>r("N NNE NE ENE E ESE SE SSE S SSO SO OSO O ONO NO NNO").split(" ")[Math.round((t%360+360)%360/22.5)%16];function Ce(t,i,e,n=!1){let a=i===void 0?"":on(i),l=n?a?r("Vent du {from} jusqu\u2019\xE0 {speed} km/h",{from:a,speed:t}):r("Vent jusqu\u2019\xE0 {speed} km/h",{speed:t}):a?r("Vent du {from} {speed} km/h",{from:a,speed:t}):r("Vent {speed} km/h",{speed:t});return e===void 0?l:`${l}${r(", rafales {gust} km/h",{gust:e})}`}var ue=t=>q`<svg viewBox="0 0 10 10" aria-hidden="true" style=${`transform:rotate(${Math.round(t+180)}deg)`}><path d="M5 0 9 10 5 7.5 1 10Z"/></svg>`;function Be(t,i){return o`<button class="nw-info" type="button" popovertarget=${t} aria-label=${r("Qu\u2019est-ce que : {title} ?",{title:i.title})} @click=${ai}><ha-icon icon="mdi:information-variant"></ha-icon></button>
    <div class="nw-pop" id=${t} popover style=${`--nw-example-word:"${r("Exemple")}"`} @toggle=${ln} @click=${ai}><b>${i.title}</b>${i.text}${i.example?o`<div class="ex">${i.example}</div>`:c}</div>`}var ai=t=>t.stopPropagation();function ln(t){let i=t.currentTarget;if(t.newState!=="open")return;let e=i.getRootNode().querySelector(`[popovertarget="${i.id}"]`);if(!e)return;let n=e.getBoundingClientRect();i.style.top=`${Math.max(8,Math.min(n.bottom+8,innerHeight-i.offsetHeight-8))}px`,i.style.left=`${Math.max(8,Math.min(n.left-12,innerWidth-i.offsetWidth-8))}px`}function K(t,i,e,n,a){return o`<header class="nw-panel-head"><span class="nw-panel-icon" style=${X(i)}><ha-icon icon=${t}></ha-icon></span>
    <h3><span>${e}</span>${a??c}</h3>${sn(n)}</header>`}var le=(t,i,e="")=>o`<span><i class=${e} style=${e==="dash"?`--c:${i}`:`background:${i}`}></i>${t}</span>`;var ee=class extends F{constructor(){super(...arguments);this.points=[];this.index=0;this.leaving=!1}connectedCallback(){super.connectedCallback(),this.leaving=!1,this.timer=setInterval(()=>this.next(),5e3)}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.timer),clearTimeout(this.swap)}willUpdate(e){if(!e.has("points"))return;let n=this.points.findIndex(a=>a.text===this.shown);if(n>=0){this.index=n;return}if(this.shown===void 0||this.reduced){this.index=0;return}this.leaving=!0,clearTimeout(this.swap),this.swap=setTimeout(()=>{this.index=0,this.leaving=!1},300)}get reduced(){return matchMedia("(prefers-reduced-motion: reduce)").matches}next(){let e=this.getRootNode().host;if(this.points.length<2||document.hidden||e?.matches(":hover, :focus-within"))return;let n=()=>{this.index=(this.index+1)%this.points.length,this.leaving=!1};if(this.reduced){n();return}this.leaving=!0,this.swap=setTimeout(n,350)}render(){let e=this.points[this.index%Math.max(1,this.points.length)];if(this.shown=e?.text,!e)return c;let n=this.leaving?"out":"";return o`<div aria-hidden="true">${"official"in e?Ve(e,n):We(e,n)}</div>
      <ul class="sr">${this.points.map(a=>o`<li>${a.label?G(a.label,a.text):a.text}</li>`)}</ul>`}};ee.styles=[Oe,A`
    :host { display:block; min-width:0; }
    ha-icon { display:flex; line-height:0; }
    .sr { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; margin:0; padding:0; }
  `],y([E({attribute:!1})],ee.prototype,"points",2),y([M()],ee.prototype,"index",2),y([M()],ee.prototype,"leaving",2),ee=y([D("niak-ticker")],ee);var me=3600,dn=1200,pn=me,ri=18*me,cn=3*me,hn={sunny:"sun","clear-night":"night",partlycloudy:"partly",cloudy:"cloud",fog:"fog",rainy:"rain",pouring:"rain",lightning:"storm","lightning-rainy":"storm",snowy:"snow","snowy-rainy":"snow",hail:"hail",windy:"wind","windy-variant":"wind",exceptional:"cloud"},un=t=>t.condition==="sunny"&&t.night?"night":hn[t.condition]??"cloud",ct=Ie,Ne=t=>Math.min(3,Math.max(1,t));function ht(t,i,e,n,a){let l=e.filter(w=>w.time!==void 0),p=l[l.length-1],s=Math.max(cn,Math.min(ri,p?p.time+me-n:ri)),d=w=>Math.max(0,Math.min(1,(w-n)/s)),h=(w,S)=>({at:w,clock:S??(w===void 0?"":ct(new Date(w*1e3).getHours())),now:w===void 0||w<=n+dn}),m=w=>({label:w.label,icon:w.icon,text:w.text,theme:w.theme,alert:w.alert||w.level>=2?Ne(w.level):void 0,...h(w.at,w.clock)}),u=i.filter(w=>!w.official).map(w=>({label:w.label??r("Maintenant"),icon:w.icon,text:w.text,alert:Ne(w.level),...h(w.at,w.clock)})),f=a?a.map(m):[...u,...t.map(m)],b=[...f.filter(w=>w.now),...f.filter(w=>!w.now).sort((w,S)=>w.at-S.at)],$=(w,S,H)=>{let U=Math.max(0,...w.map(N=>b[N].alert??0));return{items:w,x:d(S),clock:H,theme:b[w[0]].theme,alert:U?Ne(U):void 0}},_=b.flatMap((w,S)=>w.now?[S]:[]),C=[];b.forEach((w,S)=>{if(w.now)return;let H=C[C.length-1];H&&w.at-b[H[0]].at<pn?H.push(S):C.push([S])});let V=[..._.length?[$(_,n,r("Maintenant"))]:[],...C.map(w=>$(w,b[w[0]].at,b[w[0]].clock))],T=[];for(let w of l){let S=Math.max(w.time,n),H=Math.min(w.time+me,n+s);if(H<=S)continue;let U=un(w),N=T[T.length-1];N&&N.kind===U&&(U!=="partly"||N.icon===w.icon)?N.flex+=H-S:T.push({kind:U,icon:w.icon,flex:H-S})}let z=[{x:0,text:r("Maintenant"),edge:"first"}];for(let w of l)w.hour%6===0&&d(w.time)>.04&&d(w.time)<.9&&z.push({x:d(w.time),text:ct(w.hour)});return p&&z.push({x:1,text:ct((p.hour+Math.round((n+s-p.time)/me))%24),edge:"last"}),{items:b,groups:V,segments:T,marks:z}}var Se=4500,mn=9e3,si=300,De=6,ut=10,mt=t=>`--tone:var(--nw-${t.theme??(t.alert?`level${t.alert}`:"calm")})`,fn=t=>t.stopPropagation(),B=class extends F{constructor(){super(...arguments);this.points=[];this.alerts=[];this.hours=[];this.index=0;this.paused=!1;this.step=Se;this.frise=ht([],[],[],0);this.built=0;this.due=0;this.left=Se;this.pause=e=>{e.pointerType==="touch"||this.paused||(this.paused=!0,clearTimeout(this.timer),this.left=Math.max(300,this.due-Date.now()))};this.resume=e=>{e.pointerType==="touch"||!this.paused||e.type==="pointerleave"&&this.matches(":focus-within")||(this.paused=!1,this.due=Date.now()+this.left,this.timer=setTimeout(()=>this.next(),this.left))}}connectedCallback(){super.connectedCallback(),this.schedule(Se),this.hasUpdated&&this.observe()}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.timer),clearTimeout(this.leave),this.resize?.disconnect()}willUpdate(e){let n=Date.now()/1e3;if(!e.has("points")&&!e.has("alerts")&&!e.has("hours")&&!e.has("timeline")&&n-this.built<si)return;let a=this.frise.items[this.index]?.text;this.frise=ht(this.points,this.alerts,this.hours,n,this.timeline),this.built=n;let l=this.frise.items.findIndex(p=>p.text===a);this.index=l>=0?l:0,this.leaving=void 0}firstUpdated(){this.observe()}updated(){this.layout()}observe(){let e=this.renderRoot.querySelector(".track");!e||typeof ResizeObserver>"u"||(this.resize?.disconnect(),this.resize=new ResizeObserver(()=>this.layout()),this.resize.observe(e))}schedule(e){clearTimeout(this.timer),this.step=e,this.left=e,this.due=Date.now()+e,this.paused||(this.timer=setTimeout(()=>this.next(),e))}next(){Date.now()/1e3-this.built>=si&&this.requestUpdate();let e=this.frise.items.length;if(e<2||document.hidden){this.schedule(Se);return}this.show((this.index+1)%e,Se)}show(e,n){e!==this.index&&(this.leaving=this.index,this.index=e,clearTimeout(this.leave),this.leave=setTimeout(()=>{this.leaving=void 0},460)),this.schedule(n)}pick(e){let n=e.items.indexOf(this.index);this.show(n<0?e.items[0]:e.items[(n+1)%e.items.length],mn)}layout(){let e=this.renderRoot.querySelector(".track"),n=e?.clientWidth;if(!e||!n)return;let a=[...e.querySelectorAll(".pin")];e.classList.remove("compact"),(u=>u.reduce((f,b)=>f+b.offsetWidth+De,-De)<=n+2*ut)(a)||e.classList.add("compact");let p=a.map(u=>u.offsetWidth),s=a.map(u=>Number(u.dataset.x)*n);s.forEach((u,f)=>{s[f]=Math.max(u,p[f]/2-ut,f?s[f-1]+(p[f-1]+p[f])/2+De:-1/0)});for(let u=s.length-1;u>=0;u--)s[u]=Math.min(s[u],u===s.length-1?n-p[u]/2+ut:s[u+1]-(p[u+1]+p[u])/2-De);a.forEach((u,f)=>{u.style.left=`${Math.round(s[f])}px`}),e.querySelectorAll(".seg").forEach(u=>u.classList.toggle("tight",u.clientWidth<28));let d=[...this.renderRoot.querySelectorAll(".hours span")];if(d.forEach(u=>u.classList.remove("hide")),d.length<3)return;let h=d[d.length-1].getBoundingClientRect(),m=d[0].getBoundingClientRect();for(let u of d.slice(1,-1)){let f=u.getBoundingClientRect();f.left<m.right+18||f.right>h.left-18?u.classList.add("hide"):m=f}}render(){let{items:e,groups:n,segments:a,marks:l}=this.frise;if(!e.length&&!a.length)return c;let p=s=>s.now||!s.clock?s.label:`${s.label} \xB7 ${s.clock}`;return o`<div class=${`panel${this.paused?" paused":""}`} @pointerenter=${this.pause} @pointerleave=${this.resume} @focusin=${this.pause} @focusout=${this.resume}>
      ${e.length?o`<div class="head" aria-hidden="true">
        <div class="say">${e.map((s,d)=>o`<div class=${`item${d===this.index?" on":d===this.leaving?" off":""}${s.alert?" al":""}`}
          style=${`${mt(s)}${s.alert?`;--al:var(--nw-level${s.alert})`:""}`}>
          <span class="badge"><ha-icon icon=${s.icon}></ha-icon></span><div><div class="when">${p(s)}</div><div class="x" title=${s.text}>${s.text}</div></div></div>`)}</div>
        ${e.length>1?o`<div class="progress" style=${`--step:${this.step}ms`}>${e.map((s,d)=>o`<i class=${d===this.index?"on":d<this.index?"done":""}></i>`)}</div>`:c}
      </div>`:c}
      <div class=${`track${n.length?"":" bare"}`}>
        <div class="chips">${n.map(s=>{let d=s.items.includes(this.index),h=e[d?this.index:s.items[0]];return o`<button type="button" class=${`pin${d?" on":""}${s.alert?" al":""}`} data-x=${s.x}
            style=${`left:${(s.x*100).toFixed(2)}%;${mt(h)}${s.alert?`;--al:var(--nw-level${s.alert})`:""}`}
            aria-label=${s.items.map(m=>G(p(e[m]),e[m].text)).join(r(" ; "))} @click=${()=>this.pick(s)} @pointerdown=${fn}>
            <span class="chip"><span class="stack">${s.items.map((m,u)=>o`<span class=${`mini${m===this.index||!d&&!u?" cur":""}`} style=${mt(e[m])}>
              <ha-icon icon=${e[m].icon}></ha-icon></span>`)}</span><span class="clock">${s.clock}</span>${s.items.length>1?o`<span class="count">${s.items.length}</span>`:c}</span>
            <span class="stem"></span></button>`})}</div>
        <div class="lane">${a.length?a.map(s=>o`<span class=${`seg s-${s.kind}`} style=${`flex:${s.flex}`}><ha-icon icon=${s.icon}></ha-icon></span>`):o`<span class="seg s-cloud" style="flex:1"></span>`}</div>
        <span class="needle"></span>
      </div>
      ${a.length?o`<div class="hours" aria-hidden="true">${l.map(s=>o`<span class=${s.edge??""} style=${`left:${(s.x*100).toFixed(2)}%`}>${s.text}</span>`)}</div>`:c}
      <ul class="sr">${e.map(s=>o`<li>${G(p(s),s.text)}</li>`)}</ul>
    </div>`}};B.styles=A`
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
  `,y([E({attribute:!1})],B.prototype,"points",2),y([E({attribute:!1})],B.prototype,"alerts",2),y([E({attribute:!1})],B.prototype,"hours",2),y([E({attribute:!1})],B.prototype,"timeline",2),y([M()],B.prototype,"index",2),y([M()],B.prototype,"leaving",2),y([M()],B.prototype,"paused",2),y([M()],B.prototype,"step",2),B=y([D("niak-frise")],B);var di=["bulletin","events"];function Ue(t,i){return t==="page"?r("page m\xE9t\xE9o"):t==="card"?r("carte compl\xE8te"):i?r("replier"):r("d\xE9plier")}function ft(t,i,e,n=c,a=""){return o`<div class="nw-tile" title=${a||c}>${P(t)}<ha-icon icon=${i}></ha-icon><strong>${e}</strong>${n}</div>`}var gt=(t,i=.1)=>t>=i?o`<span class="nw-ink" style=${X("rain")}>${k(t)} mm</span>`:o`<span class="nw-ink">&nbsp;</span>`;function oi(t,i,e){if(t===void 0)return o`<span class="tile-wind">&nbsp;</span>`;let n=Ce(k(t,0),i,e!==void 0&&e>t?k(e,0):void 0);return o`<span class="tile-wind" title=${n} aria-label=${n}>${i===void 0?c:ue(i)}${k(t,0)}</span>`}var gn=t=>t.tmin===void 0?"\u2014":t.tmin===t.tmax?`${t.tmin} \xB0C`:`${t.tmin}\u2013${t.tmax} \xB0C`,wt=t=>t.bulletin?.periods.length?o`<div class="block">${P(r("Les prochains moments"))}<div class="moments">${t.bulletin.periods.map(i=>ft(i.label,i.icon,gn(i),o`<small>${i.phrase}</small>${i.rain>=1?gt(i.rain):c}`,i.text))}</div></div>`:c;function bt(t,i,e,n=r("Pr\xE9visions")){let a=t.hours.slice(0,12).filter(d=>d.temperature!==void 0),l=t.days.slice(0,5);if(!a.length&&!l.length)return c;let p=a.length?l.length?i:"hours":"days",s=d=>h=>{h.stopPropagation(),e(d)};return o`<div class="block"><div class="block-title">${P(n)}
      ${a.length&&l.length?o`<span class="seg" role="group" aria-label=${r("Pr\xE9visions affich\xE9es")}>
        <button type="button" aria-pressed=${p==="hours"} @click=${s("hours")} @pointerdown=${li}>${r("Heures")}</button>
        <button type="button" aria-pressed=${p==="days"} @click=${s("days")} @pointerdown=${li}>${r("Jours")}</button></span>`:c}</div>
    ${p==="hours"?o`<div class="hours">${a.map(d=>ft(ce(d.hour),d.icon,`${k(d.temperature,0)}\xB0`,o`${gt(d.precipitation)}${oi(d.wind,d.bearing,d.gust)}`,d.conditionLabel))}</div>`:o`<div class="days">${l.map(d=>ft(d.label,d.icon,d.high===void 0?"\u2014":`${d.high}\xB0`,o`<span class="lo">${d.low===void 0?"":`${d.low}\xB0`}</span>${gt(d.rain)}${oi(d.wind,d.bearing,d.gust)}`,d.conditionLabel))}</div>`}</div>`}var li=t=>t.stopPropagation();function wn(t){let i=t.days.find(n=>n.today);if(!i||i.low===void 0&&i.high===void 0)return c;let e=r("Pr\xE9vu aujourd\u2019hui : {range}",{range:[i.low===void 0?"":r("mini {t} \xB0C",{t:i.low}),i.high===void 0?"":r("maxi {t} \xB0C",{t:i.high})].filter(Boolean).join(", ")});return o`<span class="range" title=${e} aria-label=${e}>${i.low===void 0?c:o`<span>↓ ${i.low}°</span>`}${i.high===void 0?c:o`<span>↑ ${i.high}°</span>`}</span>`}function vt(t,i,e=c,n=c){let a=t.now;return o`<div class="nw-now">${n}${i?P(r("En ce moment")):c}
    <span class="cond" data-entity=${a.conditionEntity??c} title=${a.source}><ha-icon icon=${a.icon}></ha-icon>${a.label}</span>
    ${a.temperature===void 0?o`<span class="cond">${r("Temp\xE9rature indisponible")}</span>`:o`<span class="temp" data-entity=${a.temperatureEntity??c} aria-label=${r("{source} : {t} degr\xE9s Celsius",{source:a.temperatureSource,t:k(a.temperature)})}>${k(a.temperature)}<small>°C</small></span>`}
    ${wn(t)}${e}<span class="nw-badge">${a.temperatureSource}</span></div>`}var xt=t=>t.points.length||t.alerts.length||t.hours.length||t.timeline?.length?o`<div class="nw-events">${P(r("\xC9v\xE9nements"))}<niak-frise .points=${t.points} .alerts=${t.alerts} .hours=${t.hours} .timeline=${t.timeline}></niak-frise></div>`:c;function pi(t,i,e){let n=t.alerts.filter(f=>f.official),[a,...l]=n,s=[...[...t.alerts.filter(f=>!f.official),...l].map(f=>({...f,alert:!0})),...t.points],d=t.bulletin?.summary,h=[["tap",e.tapTarget],["hold",e.holdTarget]].filter(([,f])=>f!=="none"),m=e.tapTarget==="toggle"||e.holdTarget==="toggle",u=h.filter(([f,b])=>f!=="tap"||b!=="toggle");return o`<div class=${`nw-tilecard${e.open?" open":""}${m?"":" fixed"}${t.now.darkSky?" dark-sky":""}${s.length?"":" quiet"}`}
      role="button" tabindex="0" aria-expanded=${m?e.open:c}
      aria-label=${`${t.location?r("M\xE9t\xE9o \xE0 {place}",{place:t.location}):r("M\xE9t\xE9o")}${h.length?` : ${h.map(([f,b])=>f==="tap"?r("appui pour {goal}",{goal:Ue(b,e.open)}):r("appui long pour {goal}",{goal:Ue(b,e.open)})).join(", ")}`:""}`}>
    <div class="sky" aria-hidden="true">${i}</div><div class="veil" aria-hidden="true"></div><i class="press-ring" aria-hidden="true"></i>
    <div class="top">
      <div class="meta">${t.location?o`<span class="place">${t.location}</span>`:c}${a?oe(a):c}
        ${l.map(f=>o`<div class="reveal"><div>${oe(f)}</div></div>`)}</div>
      <div class="brief"><div><div>${s.length?o`<niak-ticker .points=${s}></niak-ticker>`:c}</div></div></div>
      ${vt(t,!1)}
    </div>
    <div class="grabber" aria-hidden="true"><i></i></div>
    <div class="more" ?inert=${!e.open}><div><div class="more-in">
      ${e.blocks.map(f=>f==="bulletin"?d?o`<div class="bulletin">${P(r("Bulletin du jour"))}<p class="nw-bulletin">${qe(d)}</p></div>`:c:f==="events"?xt(t):f==="moments"?wt(t):bt(t,e.tab,e.onTab))}
      <div class="foot"><span>${t.forecastSource}${t.now.temperatureSource!==t.forecastSource?` \xB7 ${t.now.temperatureSource.toLowerCase()}`:""}</span>
        ${u.length?o`<span>${u.map(([f,b])=>f==="tap"?r("Appui : {goal}",{goal:Ue(b,!0)}):r("Appui long : {goal}",{goal:Ue(b,!0)})).join(" \xB7 ")}</span>`:c}</div>
    </div></div></div>
  </div>`}var ci=A`
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
`;function yt(t,i,e,n){let a=t.map((v,x)=>({h:v,i:x})).filter(v=>v.h.temperature!==void 0);if(a.length<3)return c;let l=t.length,p=100/(l-1),s=v=>v*p,d=a.map(v=>v.h.temperature),h=Math.min(...d)-1.5,m=Math.max(...d)+1.5,u=v=>(1-(v-h)/(m-h))*78+8,f=a.map(v=>[s(v.i),u(v.h.temperature)]),b=f.map(([v,x],j)=>j?`C${f[j-1][0]+(v-f[j-1][0])/2} ${f[j-1][1]} ${f[j-1][0]+(v-f[j-1][0])/2} ${x} ${v} ${x}`:`M${v} ${x}`).join(" "),$=a.reduce((v,x)=>x.h.temperature>v.h.temperature?x:v),_=a.reduce((v,x)=>x.h.temperature<v.h.temperature?x:v),C=Math.max(2,...t.map(v=>v.precipitation)),V=t.some(v=>v.precipitation>=.1),T=t.some(v=>v.wind!==void 0),z=[];t.forEach((v,x)=>{if(!v.night)return;let j=z.at(-1);j&&j[1]===x-1?j[1]=x:z.push([x,x])});let w=t.findIndex((v,x)=>x>0&&v.day>t[x-1].day),S=[1,4,7,10,13,16].filter(v=>v<l&&t[v].temperature!==void 0),H=v=>{let x=u(v.h.temperature);return o`<span class=${`pill${x<30?" low":""}`} style=${`left:${Math.min(94,Math.max(6,s(v.i)))}%;top:${x}%`}>${k(v.h.temperature,0)}°</span>`},U=`${n}-fs`,N=`${n}-fa`;return o`<section class="nw-panel" aria-label=${r("18 prochaines heures")}>${K("mdi:chart-bell-curve-cumulative","wind",r("18 prochaines heures"),i)}
    <div class="fc" data-entity=${e}>
      <div class="fc-marks">${w<0||s(w)>22?o`<span style="left:0">${r("Maintenant")}</span>`:c}${w>0?o`<span class="next" style=${`left:${s(w)}%`}>${r("Demain")}</span>`:c}</div>
      <div class="fc-plot" role="img" aria-label=${`${r("Temp\xE9ratures de {low} \xE0 {high} \xB0C",{low:k(_.h.temperature,0),high:k($.h.temperature,0)})}${V?r(", pluie jusqu\u2019\xE0 {mm} mm par heure",{mm:k(Math.max(...t.map(v=>v.precipitation)))}):r(", pas de pluie pr\xE9vue")}`}>
        ${z.map(([v,x])=>{let j=Math.max(0,s(v)-p/2),Q=Math.min(100,s(x)+p/2);return o`<i class="fc-night" style=${`left:${j}%;width:${Q-j}%`}></i>`})}
        ${w>0?o`<i class="fc-divider" style=${`left:${s(w)}%`}></i>`:c}
        ${t.map((v,x)=>v.precipitation>=.1?o`<i class="fc-bar" title=${G(ce(v.hour),`${k(v.precipitation)} mm`)} style=${`left:calc(${s(x)}% - 5px);height:${Math.max(6,v.precipitation/C*42)}%`}></i>`:c)}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs>
          <linearGradient id=${U} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--nw-heat)"/><stop offset="1" stop-color="var(--nw-cold)"/></linearGradient>
          <linearGradient id=${N} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--nw-heat)" stop-opacity=".28"/><stop offset="1" stop-color="var(--nw-cold)" stop-opacity="0"/></linearGradient></defs>
          ${q`<path d=${`${b} L${f.at(-1)[0]} 100 L${f[0][0]} 100Z`} fill=${`url(#${N})`}/><path class="fc-line" d=${b} stroke=${`url(#${U})`}/>`}</svg>
        <i class="fc-dot" style=${`left:${f[0][0]}%;top:${f[0][1]}%;--c:${he(a[0].h.temperature)}`}></i>
        ${H($)}${_.i!==$.i&&k(_.h.temperature,0)!==k($.h.temperature,0)?H(_):c}
      </div>
      <div class="fc-hours">${S.map(v=>{let x=t[v];return o`<div style=${`left:${s(v)}%`} title=${x.conditionLabel}>${P(ce(x.hour))}<ha-icon icon=${x.icon}></ha-icon><b>${k(x.temperature,0)}°</b>
          ${x.wind===void 0?c:o`<span class="fc-wind" title=${Ce(k(x.wind,0),x.bearing,x.gust!==void 0&&x.gust>x.wind?k(x.gust,0):void 0)}>${x.bearing===void 0?c:ue(x.bearing)}${k(x.wind,0)}</span>`}</div>`})}</div>
    </div>
    <div class="nw-legend">${le(r("Temp\xE9rature"),"linear-gradient(90deg,var(--nw-cold),var(--nw-heat))")}${V?le(r("Pluie"),"var(--nw-rain)","sq"):c}
      ${z.length?le(r("Nuit"),"color-mix(in oklab,var(--nw-wind) 30%,transparent)","sq"):c}${T?o`<span>${ue(200)}${r("Vent km/h")}</span>`:c}</div>
  </section>`}function $t(t,i,e){if(!t.length)return c;let n=t.flatMap(d=>d.low??d.high??[]),a=t.flatMap(d=>d.high??d.low??[]),l=Math.min(...n),p=Math.max(...a,l+1),s=d=>(d-l)/(p-l)*100;return o`<section class="nw-panel" aria-label=${r("{n} prochains jours",{n:t.length})}>${K("mdi:calendar-week","wind",r("{n} prochains jours",{n:t.length}),i)}
    <div class="wk" data-entity=${e} role="group" aria-label=${r("Temp\xE9ratures minimales et maximales en \xB0C, pluie en mm, vent maximal en km/h")}>
      <span></span><span></span>${P(r("Min"))}<span></span>${P(r("Max"))}${P(r("Pluie"))}${P(r("Vent"))}
      ${t.map((d,h)=>o`${h?o`<i class="rule"></i>`:c}<span class=${`day${d.today?" today":""}`}>${d.label}</span>
        <ha-icon icon=${d.icon} title=${d.conditionLabel}></ha-icon>
        <span class="lo">${d.low===void 0?"":`${d.low}\xB0`}</span>
        <span class="track">${d.low!==void 0&&d.high!==void 0?o`<i style=${`left:${s(d.low)}%;width:${Math.max(2,s(d.high)-s(d.low))}%;background:linear-gradient(90deg,${he(d.low)},${he(d.high)})`}></i>`:c}</span>
        <span class="hi">${d.high===void 0?"\u2014":`${d.high}\xB0`}</span>
        <span class="rain">${d.rain>=.1?`${k(d.rain)} mm`:""}</span>
        <span class="wind" title=${d.wind===void 0?"":Ce(d.wind,d.bearing,d.gust!==void 0&&d.gust>d.wind?d.gust:void 0,!0)}>${d.wind===void 0?"":o`${d.bearing===void 0?c:ue(d.bearing)}${d.wind}`}</span>`)}
    </div>
  </section>`}function hi(t,i,e,n,a=["hours","days","air"]){let l=a.map(s=>s==="hours"?yt(t.hours,t.provider,i,e):s==="days"?$t(t.days,t.provider,i):c).filter(s=>s!==c),p=a.some(s=>s!=="air");return o`${l.length?o`<div class=${`panels${l.length===1?" single":""}`}>${l}</div>`:p?o`<p class="nw-empty">${r("Pr\xE9visions indisponibles pour le moment.")}</p>`:c}${a.includes("air")?n:c}`}var ui=A`
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
`;var kt=(...t)=>Math.max(0,...t.flatMap(i=>i.length?[i[i.length-1][0]]:[])),Ge=(t,i,e=0)=>48-(t-e)/Math.max(1e-6,i-e)*44;function Ke(t,i,e,n=0,a=21600){let l=[],p=[];for(let s of t)s[1]===null?(p.length>1&&l.push(p),p=[]):p.push(s);return p.length>1&&l.push(p),l.map(s=>{let d=s.map(([b,$])=>({x:(b-(e-a))/a*100,y:Ge($,i,n)})),h=d.slice(1).map((b,$)=>(b.y-d[$].y)/(b.x-d[$].x)),m=d.map((b,$)=>$===0?h[0]:$===d.length-1?h.at(-1):h[$-1]*h[$]<=0?0:2/(1/h[$-1]+1/h[$]));h.forEach((b,$)=>{if(b===0){m[$]=0,m[$+1]=0;return}let _=Math.hypot(m[$]/b,m[$+1]/b);_>3&&(m[$]*=3/_,m[$+1]*=3/_)});let u=b=>b.toFixed(2),f=`M${u(d[0].x)},${u(d[0].y)}`;for(let b=1;b<d.length;b++){let $=d[b-1],_=d[b],C=(_.x-$.x)/3;f+=` C${u($.x+C)},${u($.y+m[b-1]*C)} ${u(_.x-C)},${u(_.y-m[b]*C)} ${u(_.x)},${u(_.y)}`}return{line:f,area:`${f} L${u(d.at(-1).x)},50 L${u(d[0].x)},50 Z`}})}function _t(t,i,e,n,a=21600){let l=t.filter(m=>m[1]!==null);if(l.length<2)return[];let p=l.reduce((m,u)=>u[1]>m[1]?u:m),s=l.reduce((m,u)=>u[1]<m[1]?u:m),d=m=>Math.min(92,Math.max(8,(m-(i-a))/a*100)),h=([m,u])=>({x:d(m),y:e(u)/50*100,text:n(u)});return n(p[1])===n(s[1])?[h(p)]:[h(p),h(s)]}var mi=t=>t.map(i=>o`<span class=${`pill${i.y<30?" low":""}`} style=${`left:${i.x}%;top:${i.y}%`}>${i.text}</span>`),At=t=>t.length?o`<div class="stats">${t.map(i=>o`<div data-entity=${se(i.entity)}>${P(i.label)}<b>${i.value}</b></div>`)}</div>`:c,fi={"6h":{span:6*3600,title:g("6 derni\xE8res heures"),axis:["\u22126 h","\u22123 h"]},"1d":{span:86400,title:g("24 derni\xE8res heures"),axis:["\u221224 h","\u221212 h"]},"2d":{span:2*86400,title:g("2 derniers jours"),axis:[g("\u22122 j"),g("\u22121 j")]},"7d":{span:7*86400,title:g("7 derniers jours"),axis:[g("\u22127 j"),""]}},gi=t=>o`<div class="mini-axis">${P(r(t.axis[0]))}${P(r(t.axis[1]))}${P(r("maintenant"))}</div>`,bn={"24h":{title:g("24 derni\xE8res heures"),axis:["\u221224 h","\u221212 h",g("maintenant")]},"7d":{title:g("7 derniers jours")},"30d":{title:g("30 derniers jours"),axis:[g("\u221230 j"),g("\u221215 j"),g("aujourd\u2019hui")]}},wi=(t,i)=>t.map(e=>q`
  <path d=${e.area} fill=${`color-mix(in oklab,${i} 16%,transparent)`}/>
  <path d=${e.line} fill="none" stroke=${i} stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>`);function vn(t,i,e){let n=p=>Math.min(100,Math.max(0,(p+5)/50*100)),a=t.gap===void 0||Math.abs(t.gap)<.1?"":r(e?"{gap} \xB0C par rapport au thermom\xE8tre":"{gap} \xB0C par rapport \xE0 la temp\xE9rature du bulletin",{gap:`${t.gap>0?"+":"\u2212"}${k(Math.abs(t.gap))}`}),l=Be(`${i}-feel`,{title:r("Ressenti"),text:o`${r("C\u2019est la temp\xE9rature que le corps per\xE7oit. L\u2019humidit\xE9 et le soleil la font monter, le vent la fait baisser.")}
      ${r("C\u2019est une estimation, pas un indice officiel.")} <a href="https://github.com/Niakman13/niak-weather#expliquer-le-ressenti" target="_blank" rel="noopener noreferrer">${r("En savoir plus")}</a>`,example:t.example?r("En ce moment : {example}.",{example:t.example}):r("25 \xB0C au thermom\xE8tre dans un air tr\xE8s humide se ressentent comme 30 \xB0C.")});return o`<section class="nw-panel" aria-label=${r("Ressenti")}>${K("mdi:thermometer","heat",r("Ressenti"),t.source,l)}
    <div class="metric-row">
      <div class="metric" data-entity=${se(t.entity)}><div class="metric-main"><b>${k(t.feels)}</b><span>°C</span></div>
        <small>${[t.word?o`<b>${t.word}</b>`:"",t.humidity,a].filter(Boolean).map((p,s)=>o`${s?" \xB7 ":""}${p}`)}</small></div>
      ${t.factors.length?o`<div class="nw-chips factors">${t.factors.map(W)}</div>`:c}
    </div>
    <div class="rail-line"><span>−5°</span><div class="rail">
      ${t.temperature===void 0?c:o`<i class="thermo" style=${`left:${n(t.temperature)}%`} title=${r(e?"Thermom\xE8tre {t} \xB0C":"Bulletin {t} \xB0C",{t:k(t.temperature)})}></i>`}
      <i class="feel" style=${`left:${n(t.feels)}%;--c:${he(t.feels)}`} title=${r("Ressenti {t} \xB0C",{t:k(t.feels)})}></i></div><span>45°</span></div>
  </section>`}function Tt(t){let i=Math.max(1,...(t.days??[]).map(s=>s.value??0)),e=bn[t.period??"7d"],n=(t.days?.length??0)>7,a=n?(t.days??[]).reduce((s,d)=>(d.value??0)>(s?.value??0)?d:s,void 0):void 0,l=s=>t.period==="24h"?s.label:t.period==="30d"?`${s.label}/${s.date.slice(5,7)}`:s.date,p=t.rate!==void 0&&t.rate>0?W({theme:"rain",icon:"mdi:weather-rainy",value:`${k(t.rate)} mm/h`,label:r("en ce moment"),entity:t.rateEntity}):t.status?W({theme:"rain",icon:"mdi:weather-rainy",label:t.status}):c;return o`<section class="nw-panel" aria-label=${r("Pluie")}>${K("mdi:weather-rainy","rain",r("Pluie"),t.source)}
    <div class="metric-row"><div class="metric" data-entity=${t.entity}>
      ${t.text?o`<div class="metric-main"><b class="word">${t.text}</b></div>`:o`<div class="metric-main"><b>${t.value===void 0?"\u2014":k(t.value,1,!0)}</b><span>${t.unit}</span></div>`}<small>${t.label}</small></div>${p}</div>
    <div class="mini" title=${t.daysNote}><div class="mini-top">${r(e.title)} · ${t.total===void 0?"mm":`${t.totalPartial?"\u2265 ":""}${k(t.total)} mm`}</div>
      ${t.days?o`<div class=${`bars${n?" dense":""}`} style=${`--n:${t.days.length}`} role="img" aria-label=${r("Pluie des {period}",{period:r(e.title)})}>${t.days.map(s=>o`<div title=${G(l(s),s.value===void 0?r("indisponible"):s.partial?r("au moins {mm} mm",{mm:k(s.value)}):`${k(s.value)} mm`)}>
          <span>${s.value===void 0?n?"":"\u2014":s.value&&(!n||s===a)?`${s.partial?"\u2265 ":""}${k(s.value)}`:""}</span>
          <i class=${s.value?"":"zero"} style=${`height:${s.value?Math.max(12,s.value/i*74):5}%`}></i></div>`)}</div>
        ${e.axis?o`<div class="mini-axis">${e.axis.map(s=>P(r(s)))}</div>`:o`<div class="bars-axis">${t.days.map(s=>P(s.label.replace(".","")))}</div>`}`:o`<p class="nw-empty">${t.empty}</p>`}</div>
    ${At(t.stats)}
  </section>`}function xn(t){let i="var(--nw-wind)",e=kt(t.mean,t.gust),n=fi[t.period??"6h"],a=Ke(t.mean,t.top,e,0,n.span),l=Ke(t.gust,t.top,e,0,n.span);return o`<section class="nw-panel" aria-label=${r("Vent")}>${K("mdi:weather-windy","wind",r("Vent"),t.source)}
    <div class="metric-row"><div class="metric" data-entity=${t.entity}><div class="metric-main"><b>${t.value===void 0?"\u2014":k(t.value,0)}</b><span>km/h</span></div>
      <small>${t.label}${t.description?` \xB7 ${t.description}`:""}</small></div>
      ${t.status?W({theme:"wind",icon:"mdi:weather-windy",label:t.status}):c}
      ${t.bearing===void 0?c:o`<svg class="compass" viewBox="0 0 72 72" role="img" aria-label=${t.compass} data-entity=${se(t.bearingEntity)}>
        <circle cx="36" cy="36" r="30" fill="color-mix(in oklab,var(--nw-wind) 10%,transparent)" stroke="var(--nw-line)"/>
        <text x="36" y="16" text-anchor="middle" font-size="10" font-weight="700" fill="var(--nw-fg2)">N</text>
        <path d="M36 16 44 46 36 40 28 46Z" fill="color-mix(in oklab,var(--nw-wind) 75%,var(--nw-fg))" transform=${`rotate(${(t.bearing+180)%360} 36 36)`}/></svg>`}</div>
    <div class="mini"><div class="mini-top">${r(n.title)} · km/h</div>
      ${a.length||l.length?o`<div class="mini-plot"><svg viewBox="0 0 100 50" preserveAspectRatio="none" role="img" aria-label=${r("Vent des {period}, moyennes et rafales",{period:r(n.title)})}>
          ${l.map(p=>q`<path d=${p.line} fill="none" stroke="color-mix(in oklab,var(--nw-wind) 55%,transparent)" stroke-width="2" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/>`)}
          ${wi(a,i)}</svg>${mi(_t(t.mean,e,p=>Ge(p,t.top),p=>k(p,0),n.span))}</div>${gi(n)}
        <div class="nw-legend">${le(t.meanLabel,i)}${l.length?le(r("Rafales"),i,"dash"):c}</div>`:o`<p class="nw-empty">${t.empty}</p>`}</div>
    ${At(t.stats)}
  </section>`}function yn(t){let i=fi[t.period??"6h"],e=kt(t.series),n=Ke(t.series,t.top,e,t.low,i.span);return o`<section class="nw-panel" aria-label=${r("Pression")}>${K("mdi:gauge","pressure",r("Pression"),t.source)}
    <div class="metric-row"><div class="metric" data-entity=${se(t.entity)}><div class="metric-main"><b>${t.value===void 0?"\u2014":k(t.value,0)}</b><span>hPa</span></div>
      <small>${t.description}</small></div>${t.trend?W(t.trend):c}</div>
    <div class="mini"><div class="mini-top">${r(i.title)} · hPa</div>
      ${n.length?o`<div class="mini-plot"><svg viewBox="0 0 100 50" preserveAspectRatio="none" role="img" aria-label=${r("Pression des {period}",{period:r(i.title)})}>${wi(n,"var(--nw-pressure)")}</svg>${mi(_t(t.series,e,a=>Ge(a,t.top,t.low),a=>k(a,0),i.span))}</div>${gi(i)}`:o`<p class="nw-empty">${t.empty}</p>`}</div>
    ${At(t.stats)}
  </section>`}var $n=["comfort","rain","wind","pressure","extras","air"];function bi(t,i,e,n,a=$n){let l=h=>h==="rain"?t.rain&&Tt(t.rain):h==="wind"?t.wind&&xn(t.wind):h==="pressure"?t.pressure&&yn(t.pressure):void 0,p=[],s=[],d=()=>{s.length&&p.push(o`<div class=${`grid3 n${s.length}`}>${s}</div>`),s=[]};for(let h of a){let m=l(h);if(m){s.push(m);continue}d(),h==="comfort"&&t.comfort&&p.push(vn(t.comfort,i,e)),h==="extras"&&t.extras.length&&p.push(o`<div class="nw-chips extras">${t.extras.map(W)}</div>`),h==="air"&&p.push(n)}return d(),o`${p}`}var vi=A`
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
  .bars, .bars-axis { display:grid; grid-template-columns:repeat(var(--n, 7), 1fr); gap:6px; }
  .bars.dense { gap:2px; }
  .bars.dense span { overflow:visible; white-space:nowrap; }
  .bars { align-items:end; height:66px; }
  .bars > div { display:flex; flex-direction:column; justify-content:flex-end; height:100%; gap:3px; }
  .bars span { font-size:var(--nw-fs-small); font-weight:700; text-align:center; line-height:1; min-height:12px; }
  .bars i { display:block; border-radius:5px 5px 2px 2px; background:color-mix(in oklab, var(--nw-rain) 80%, transparent); min-height:3px; }
  .bars i.zero { background:color-mix(in oklab, var(--nw-line) 80%, transparent); }
  .bars-axis { text-align:center; }
`;function xi(t,i){let e=t.now,n=t.alerts.find(l=>l.official)??t.alerts[0],a=t.location?r("M\xE9t\xE9o \xE0 {place}",{place:t.location}):r("M\xE9t\xE9o");return o`<div class=${`nw-mini${i==="none"?" still":""}`} role=${i==="none"?"group":"button"} tabindex=${i==="none"?-1:0}
      aria-label=${i==="none"?a:G(a,i==="page"?r("appui pour la page m\xE9t\xE9o"):r("appui pour la carte compl\xE8te"))}>
    <ha-icon class="mini-icon" icon=${e.icon}></ha-icon>
    <span class="mini-temp">${e.temperature===void 0?"\u2014":k(e.temperature)}<small>°C</small></span>
    <span class="mini-text"><b>${e.label}</b>${t.location?o`<span>${t.location}</span>`:c}</span>
    ${n?oe(n):c}
  </div>`}function Pt(t){return{alerts:t.alerts,points:t.points.filter(i=>i.level>=2&&i.group!=="official")}}function yi(t,i){let{alerts:e,points:n}=Pt(t);return!e.length&&!n.length?i?o`<div class="nw-alertcard quiet-card"><ha-icon icon="mdi:shield-check-outline"></ha-icon><span><b>${r("Aucune alerte en ce moment.")}</b> ${r("Cette carte reste cach\xE9e tant que tout est calme.")}</span></div>`:c:o`<div class="nw-alertcard" role="button" tabindex="0" aria-label=${r("Alertes m\xE9t\xE9o : appui pour la carte compl\xE8te")}>
    ${t.location?o`<span class="place">${t.location}</span>`:c}
    ${e.map(a=>Ve(a))}${n.map(a=>We(a))}
  </div>`}function $i(t,i,e,n,a){let l=t.hours.some(m=>m.temperature!==void 0),p=t.days.length>0,s=l?p?i:"hours":"days",d=m=>u=>{u.stopPropagation(),e(m)},h=s==="hours"?yt(t.hours,t.provider,n,a):$t(t.days,t.provider,n);return o`<div class="nw-forecastcard">
    <div class="fcard-head"><span class="fcard-title"><b>${r("Pr\xE9visions")}</b>${t.location?o`<span>${t.location}</span>`:c}</span>
      ${l&&p?o`<span class="seg" role="group" aria-label=${r("Pr\xE9visions affich\xE9es")}>
        <button type="button" aria-pressed=${s==="hours"} @click=${d("hours")}>${r("Heures")}</button>
        <button type="button" aria-pressed=${s==="days"} @click=${d("days")}>${r("Jours")}</button></span>`:c}</div>
    ${h===c?o`<p class="nw-empty">${r("Pr\xE9visions indisponibles pour le moment.")}</p>`:h}
  </div>`}function kn(t){let i=t.hours,e=a=>i.slice(0,a).reduce((l,p)=>l+(p.precipitation??0),0),n=i.find(a=>a.precipitation>=.3);return{hour:e(1),six:e(6),next:n?Ie(n.hour):void 0}}function ki(t){let i=kn(t),n=t.hours.length>0?i.six<.1?o`<div class="nw-chips">${W({theme:"calm",icon:"mdi:weather-partly-cloudy",label:i.next?r("Pas de pluie avant {hour}",{hour:i.next}):r("Pas de pluie pr\xE9vue d\u2019ici 18 h")})}</div>`:o`<div class="nw-chips">${W({theme:"rain",icon:"mdi:timer-sand",value:`${k(i.hour)} mm`,label:r("dans l\u2019heure")})}
        ${W({theme:"rain",icon:"mdi:weather-pouring",value:`${k(i.six)} mm`,label:r("sur 6 h")})}
        ${i.next&&i.hour<.1?W({theme:"rain",icon:"mdi:clock-outline",label:r("\xE0 partir de {hour}",{hour:i.next})}):c}</div>`:o`<p class="nw-empty">${r("Pr\xE9visions indisponibles pour le moment.")}</p>`;return o`<div class="nw-raincard">
    <div class="fcard-head"><span class="fcard-title"><b>${r("Pluie")}</b>${t.location?o`<span>${t.location}</span>`:c}</span></div>
    <div class="rain-ahead">${P(r("\xC0 venir"))}${n}</div>
    ${t.rain?Tt(t.rain):c}
  </div>`}var _i=A`
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
`;var Ai={6:["calm","calm","level1","level2","level3","pressure"],4:["calm","level1","level2","level3"]},Qe=(t,i)=>t&&!t.stale&&t.value!==void 0&&t.value<=i&&(i!==6||t.value>=1)?t.value:void 0;function _n(t,i){let e=Qe(t,i),n=Ai[i]??Ai[6],a=360/i,l=p=>{let s=(p*a-88)*Math.PI/180,d=((p+1)*a-92)*Math.PI/180,h=32,m=38;return q`<path d=${`M${m+h*Math.cos(s)} ${m+h*Math.sin(s)} A${h} ${h} 0 0 1 ${m+h*Math.cos(d)} ${m+h*Math.sin(d)}`} fill="none" stroke-width="9" stroke-linecap="round"
      stroke=${e!==void 0&&p<e?`var(--nw-${n[p]})`:"color-mix(in oklab,var(--nw-fg) 10%,transparent)"}/>`};return o`<svg class="disc" viewBox="0 0 76 76" aria-hidden="true">${n.map((p,s)=>l(s))}
    <text x="38" y="44" text-anchor="middle" font-size="17" font-weight="700" fill="currentColor">${e??"\u2013"}</text></svg>`}function An(t){let i=t.reading,e=t.concentration,n=l=>l.value===void 0?r("concentration indisponible"):`${k(l.value,2)}${l.unit?` ${l.unit}`:""}`;return`${i.unit!==void 0?n(i):`${i.label}${e?` \xB7 ${n(e)}`:""}`}${i.stale?` \xB7 ${r("donn\xE9es anciennes")}`:""}`}function Tn(t){let i=t.kind==="air",e=t.primary,n=t.scale??6,a=Qe(e,n),l=n===6,p=t.source??(l?"Atmo France":"Polleninformation"),s=t.worse?Qe(t.worse.reading,n)??0:0,d=!i&&l&&t.tomorrow&&!e?.stale&&e?.unavailableReason==="no_index",h=!i&&l&&t.details.some(u=>u.concentration?.value===0&&Qe(u.reading,n)===void 0),m=d?r("Pr\xE9vision non disponible"):e?e.stale?r("Donn\xE9es anciennes"):e.value===7?r("\xC9v\xE9nement signal\xE9"):e.label:r("Indice non configur\xE9");return o`<section class="nw-panel" aria-label=${i?r(t.tomorrow?"Air ext\xE9rieur demain":"Air ext\xE9rieur aujourd\u2019hui"):r(t.tomorrow?"Pollens demain":"Pollens aujourd\u2019hui")}>
    ${K(i?"mdi:air-filter":"mdi:flower-pollen-outline","calm",i?r("Air ext\xE9rieur"):r("Pollens"),p)}
    <p class="nw-sub">${t.tomorrow?r("Demain"):r("Aujourd\u2019hui")}${t.zone?` \xB7 ${t.zone}`:""}</p>
    <div class="aq" data-entity=${e?.entityId??c} role=${e?"button":c} tabindex=${e?0:c}>${_n(e,n)}
      <div class="txt">${P(t.tomorrow?r("Indice de demain"):r("Indice du jour"))}<strong>${m}</strong>
        <small>${a!==void 0?r("Niveau {value} sur {scale}",{value:a,scale:n}):e?.value===7&&l?r("Code 7 \xB7 hors \xE9chelle"):d?r("Indice pollen non fourni"):r("Niveau indisponible")}</small></div></div>
    ${d?o`<p class="availability-note">${r("Atmo France ne fournit pas d\u2019indice pollen exploitable pour demain \xE0 cet endroit.")}</p>`:c}
    ${t.worse?o`<div class="nw-chips">${W({theme:`level${Math.min(3,Math.max(1,s-(l?2:1)))}`,icon:"mdi:alert-circle-outline",value:t.worse.label,label:t.worse.reading.label.toLowerCase(),entity:t.worse.reading.entityId})}</div>`:c}
    ${t.details.length||t.updated?o`<details class="nw-details"><summary><ha-icon icon="mdi:chevron-right"></ha-icon>${i?r("D\xE9tail des polluants"):r("D\xE9tail des pollens")}</summary>
      ${t.details.length?o`<ul>${t.details.map(u=>o`<li data-entity=${u.reading.entityId}><span>${u.label}</span><b>${An(u)}</b></li>`)}</ul>`:c}
      ${h?o`<p>${r("Une concentration \xE0 0 peut \xEAtre une valeur r\xE9elle ou remplacer une donn\xE9e manquante chez Atmo France. Elle ne permet pas, \xE0 elle seule, de conclure \xE0 une absence de pollen.")}</p>`:c}
      ${t.updated?o`<p>${l&&!t.source?r("Publication Atmo : {date}.",{date:t.updated}):r("Mise \xE0 jour {source} : {date}.",{source:p,date:t.updated})}${t.stale?` ${r("Certaines donn\xE9es sont anciennes : \xE0 v\xE9rifier dans l\u2019int\xE9gration.")}`:""}</p>`:c}</details>`:c}
  </section>`}var Ct=t=>t.length?o`<div class="panels-two">${t.map(Tn)}</div>`:c,Ti=A`
  .panels-two { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:16px; align-items:stretch; }
  .panels-two > :only-child { grid-column:1/-1; }
  @container (max-width:640px) { .panels-two { grid-template-columns:minmax(0,1fr); } }
  .availability-note { color:var(--nw-fg2); font-size:var(--nw-fs-small); line-height:1.5; }
  .aq { display:grid; grid-template-columns:auto minmax(0,1fr); align-items:center; gap:16px; }
  .aq .disc { width:76px; height:76px; }
  .aq .txt { display:flex; flex-direction:column; gap:2px; min-width:0; }
  .aq strong { font-size:var(--nw-fs-title); font-weight:700; }
  .aq small { font-size:var(--nw-fs-small); color:var(--nw-fg2); }
`;var fe=class extends F{constructor(){super(...arguments);this.now=new Date;this.tick=()=>{this.now=new Date,clearTimeout(this.timer),this.timer=setTimeout(this.tick,6e4-this.now.getSeconds()*1e3-this.now.getMilliseconds()+50)}}connectedCallback(){super.connectedCallback(),this.tick()}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.timer)}render(){return o`<time datetime=${this.now.toISOString()}>${ii(He(),{hour:"2-digit",minute:"2-digit"}).format(this.now)}</time>`}};fe.styles=A`
    :host { display:block; font-variant-numeric:tabular-nums; line-height:1; }
    time { font:inherit; }
  `,y([M()],fe.prototype,"now",2),fe=y([D("niak-clock")],fe);var Pn=[{key:"official",title:g("Vigilance officielle")},{key:"now",title:g("Maintenant")},{key:"future",title:g("\xC0 venir")},{key:"environment",title:g("Air et pollens")}];function Cn(t,i){let e=t.brief,n=e?Pn.map(a=>({...a,signals:e.signals.filter(l=>l.group===a.key&&(l.severity>0||t.points.some(p=>p.text===l.text)))})).filter(a=>a.signals.length):[];return Be(`${i}-brief`,{title:r("Synth\xE8se"),text:o`${r("La m\xE9t\xE9o du jour en une phrase, avec ce qui compte maintenant et ce qui arrive.")}
      ${n.map(a=>o`<div class="brief-group">${P(r(a.title))}<ul>${a.signals.map(l=>o`<li data-entity=${l.entity??c}>
        <ha-icon icon=${l.icon}></ha-icon><span>${l.text}</span></li>`)}</ul></div>`)}
      ${e?.caveats.length?o`<div class="brief-group">${P(r("\xC0 v\xE9rifier"))}<ul>${e.caveats.map(a=>o`<li><ha-icon icon="mdi:alert-circle-outline"></ha-icon><span>${a}</span></li>`)}</ul></div>`:c}`,example:r("\xAB Pluie ce soir, puis \xE9claircies demain matin. \xBB")})}function Pi(t,i,e,n,a,l="none"){let p=t.now.trend===void 0?c:o`<span class="nw-chip" style=${X(t.now.trend>0?"heat":"cold")}
    title=${t.now.trend>0?r("La temp\xE9rature monte"):r("La temp\xE9rature baisse")}><ha-icon icon=${t.now.trend>0?"mdi:arrow-top-right":"mdi:arrow-bottom-right"}></ha-icon>${t.now.trend>0?"+":"\u2212"}${k(Math.abs(t.now.trend))} °C/h</span>`,s=t.season.news?o`<span class="nw-chip" style=${X("calm")} title=${t.season.tip}><ha-icon icon=${t.season.info.icon}></ha-icon>${t.season.news}</span>`:c,d=t.alerts.filter(u=>u.official),h=St(t),m=n[0]==="bulletin"?n.slice(1):n;return o`<section class=${`nw-hero${t.now.darkSky?" dark-sky":""}`} aria-label=${r("Synth\xE8se")}>
    <div class="sky" aria-hidden="true">${i}</div><div class="veil" aria-hidden="true"></div>
    <header class="fm-head"><h2>${r("Synth\xE8se")}</h2>${Cn(t,e)}<span>${[t.location,t.dateLabel].filter(Boolean).join(" \xB7 ")}</span>${s}</header>
    <div class="hero-main">
      ${l==="left"?o`<niak-clock class="hero-clock"></niak-clock>`:c}
      ${d.length?o`<div class="nw-alerts">${d.map(u=>oe(u))}</div>`:c}
      ${n[0]==="bulletin"?h:c}
    </div>
    ${vt(t,!0,p,l==="right"?o`<niak-clock class="now-clock"></niak-clock>`:c)}
    ${m.length?o`<div class="hero-blocks">${m.map(a)}</div>`:c}
  </section>`}var St=t=>t.bulletin?o`${P(r("Bulletin du jour"))}<p class="nw-bulletin">${qe(t.bulletin.summary)}</p>`:c,Ci=A`
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
  .hero-clock { font-size:var(--nw-fs-temp); font-weight:300; letter-spacing:-1px; }
  .now-clock { font-size:var(--nw-fs-title); font-weight:650; color:var(--nw-fg2); margin-bottom:4px; }
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
`;function Si(t,i,e,n,a){let l=n.folded[t],p=s=>{s instanceof KeyboardEvent&&s.key!=="Enter"&&s.key!==" "||(s.preventDefault(),n.onFold(t))};return o`<section class=${`fm-section${l?" folded":""}`} aria-labelledby=${`${n.uid}-${t}`}>
    <header class="fm-head" role="button" tabindex="0" aria-expanded=${!l} @click=${p} @keydown=${p}>
      <h2 id=${`${n.uid}-${t}`}>${i}</h2><span>${e}</span>
      <span class="fm-fold" aria-hidden="true"><ha-icon icon="mdi:chevron-down"></ha-icon></span></header>
    ${l?c:o`<div class="fm-body">${a()}</div>`}
  </section>`}function Ei(t,i){let{hero:e,banner:n,today:a,forecasts:l}=i.sections,p=s=>s==="bulletin"?o`<div class="hero-bulletin">${St(t)}</div>`:s==="events"?xt(t):s==="moments"?wt(t):bt(t,i.tab,i.onTab);return o`<div class="nw-full">
    ${e?Pi(t,i.sky,i.uid,n,p,i.clock):c}
    ${a.length?Si("today",r("Aujourd\u2019hui"),t.comfort?r("Mesures et ressenti"):r("Conditions actuelles"),i,()=>bi(t,i.uid,i.station,Ct(t.air.today),a)):c}
    ${l.length?Si("predictions",r("Pr\xE9visions"),t.forecastSource,i,()=>hi(t,i.entity,i.uid,Ct(t.air.tomorrow),l)):c}
  </div>`}var Mi=A`
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
`;var Li=[{d:"M58 0 43 40 61 52 35 88 49 97 24 144 37 151 12 217M43 40 23 56 34 67 17 91M35 88 72 107 64 121 88 147",delay:0},{d:"M42 0 62 35 48 52 81 87 67 102 92 153 80 171 104 216M62 35 85 40 81 58 105 80",delay:-2.1},{d:"M70 0 52 30 66 44 40 78 58 86 30 130 44 136 26 190M52 30 34 42 40 56M40 78 18 96",delay:-4.2}];var Sn=40,En=70,Mn=25,zi=45,L=class extends F{constructor(){super(...arguments);this.condition="unknown";this.phase="unknown";this.quality="standard";this.animated=!0;this.wind=0;this.gust=0;this.detail="";this.season="";this.visible=!1;this.pageVisible=!0;this.visibility=()=>{this.pageVisible=!document.hidden}}connectedCallback(){super.connectedCallback(),this.visibility(),document.addEventListener("visibilitychange",this.visibility),typeof IntersectionObserver<"u"?(this.observer=new IntersectionObserver(e=>{this.visible=e.some(n=>n.isIntersecting)}),this.observer.observe(this)):this.visible=!0}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),document.removeEventListener("visibilitychange",this.visibility)}cloud(e){return o`<div class=${`cloud ${e}`}><svg viewBox="0 0 180 112" aria-hidden="true">
      <path class="cloud-rear" d="M42 103C21 103 7 90 7 70C7 53 17 40 33 36C35 16 50 5 69 5C91 5 107 19 109 40C116 37 123 36 130 36C154 36 172 51 172 73C172 92 157 103 137 103Z"/>
      <path class="cloud-near" d="M38 103C26 103 19 95 19 84C19 73 27 65 36 64C38 52 47 45 59 45C72 45 82 54 83 65C99 62 116 72 116 85C116 96 108 103 94 103Z"/>
    </svg></div>`}stars(e){return Array.from({length:e},(n,a)=>{let l=2.2+a*7%10*.26;return o`<i class=${`star${a%6===0?" bright":""}`} style=${`--sx:${48+a*37%50}%;--sy:${4+a*53%62}%;--ss:${1.2+a%4*.5}px;--st:${l}s;--sd:${-(a*.73%l)}s`}></i>`})}fog(){let e=this.detail,n=this.quality==="low",a=e==="dense"||e==="freezing-fog",l=this.phase==="day"||this.phase==="twilight",p=(d,h,m,u,f,b)=>o`<div class=${`fog-band depth-${f}`} style=${`--fy:${h}%;--fl:${m}%;--fw:${u}%;--fd:${13+d*3}s;--fdelay:${-d*2.7}s;--dir:${d%2?-1:1}${b?`;--fh:${b}%`:""}`}><svg viewBox="0 0 600 60" preserveAspectRatio="none"><path d="M0 34C60 16 130 20 190 30S330 48 400 32 520 14 600 28V60H0Z"/></svg></div>`;if(e==="mist")return o`${l?o`<div class="orb sun"><i></i></div>`:o`<div class="orb moon"><i></i><b></b></div>`}
      <div class="fog-layer">${Array.from({length:n?3:6},(d,h)=>o`<div class="mist-thread" style=${`--fy:${30+h*11}%;--fl:${[-8,20,-15,26,4,-20][h]}%;--fw:${[90,70,110,64,96,80][h]}%;--fd:${16+h*3}s;--fdelay:${-h*3.1}s;--dir:${h%2?-1:1}`}></div>`)}</div>`;if(e==="patches")return o`${l?o`<div class="orb sun"><i></i></div>`:o`<div class="orb moon"><i></i><b></b></div>`}
      <div class="fog-layer patches">${[[0,52,-14,56,2,44],[1,60,36,50,2,40],[2,48,66,52,2,46],[3,68,10,60,1,34]].slice(0,n?2:4).map(([d,h,m,u,f,b])=>p(d,h,m,u,f,b))}</div>`;let s=n?a?4:3:a?7:5;return o`${l&&!a?o`<div class="fog-sun"></div>`:c}${a?o`<div class="fog-wall"></div>`:c}
      <div class="fog-layer">${Array.from({length:s},(d,h)=>p(h,(a?2:6)+h*(a?12:16),[-10,18,-25,30,0,-15,22][h],[120,95,140,85,130,110,100][h],h%3))}</div>
      ${e==="freezing-fog"?o`<div class="ice-air">${Array.from({length:n?8:22},(d,h)=>o`<i style=${`--x:${(h*37+5)%96}%;--y:${8+h*53%80}%;--t:${2.4+h%5*.5}s;--dl:-${h*.7%3}s`}></i>`)}</div>`:c}`}ice(e){return o`<div class=${`ice ${e}`}>${Array.from({length:this.quality==="low"?4:10},(n,a)=>o`<i style=${`--x:${4+(a*17*37+11)%92}%;--dl:-${(a*37+11)%30/10}s`}></i>`)}</div>`}windLines(e=!1){let n=Math.max(this.gust,this.wind*1.6)>=100,a=this.quality==="low"?e?2:4:e?5:n?14:10,l=["M0 20C60 8 120 30 180 18S300 6 400 20","M0 14C80 24 160 4 240 16S340 26 400 12","M0 18C90 10 170 26 260 16C320 10 350 0 340 -8C332 -16 316 -8 324 2","M0 22C70 14 140 24 210 16S330 8 400 18","M0 16C100 22 200 8 290 18C340 24 372 12 364 2C358 -6 344 0 350 8"],p=e?[0,1,3]:[0,1,2,3,4];return o`<div class="wind">${Array.from({length:a},(s,d)=>{let h=(e?3.6:n?1.5:2.3)+d*37%9/10;return o`<div class="wind-line" style=${`--wy:${8+d*29%80}%;--wx:${-10+d*41%45}%;--ww:${55+d*23%45}%;--wt:${h}s;--wd:${-(d*1.7%h).toFixed(2)}s;--wo:${(e?.45:.55)+d%3*(e?.12:.2)}`}>
        <svg viewBox="0 -20 400 50" preserveAspectRatio="none"><path d=${l[p[d%p.length]]}/></svg></div>`})}</div>`}cirrus(){return o`<div class="veil-wash"></div>${[0,1,2].slice(0,this.quality==="low"?2:3).map(e=>o`<div class=${`cirrus c${e}`}></div>`)}`}static flake(e){let n="";for(let a=0;a<6;a++){let l=a*Math.PI/3,p=Math.cos(l),s=Math.sin(l),d=_=>[p*_,s*_],[h,m]=d(e);n+=`M0 0L${h.toFixed(1)} ${m.toFixed(1)}`;for(let[_,C]of[[.42,.3],[.68,.22]]){let[V,T]=d(e*_);for(let z of[-1,1]){let w=l+z*Math.PI/4;n+=`M${V.toFixed(1)} ${T.toFixed(1)}l${(Math.cos(w)*e*C).toFixed(1)} ${(Math.sin(w)*e*C).toFixed(1)}`}}let[u,f]=d(e*.24),[b,$]=[Math.cos(l+Math.PI/3)*e*.24,Math.sin(l+Math.PI/3)*e*.24];n+=`M${u.toFixed(1)} ${f.toFixed(1)}L${(Math.cos(l+Math.PI/6)*e*.36).toFixed(1)} ${(Math.sin(l+Math.PI/6)*e*.36).toFixed(1)}L${b.toFixed(1)} ${$.toFixed(1)}`}return n}static planeTint(e){let n=[["#d9a531","#e8b84a","#c76a26"],["#8f9e3e","#e29a34","#b5502a"],["#b64a2b","#c9572f","#7f2c1f"]][e];return q`<linearGradient id=${`nw-plane-${e}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color=${n[0]}/><stop offset=".55" stop-color=${n[1]}/><stop offset="1" stop-color=${n[2]}/></linearGradient>`}frostPane(){let e=[[372,34,58,.9,8,0],[300,18,34,.75,-12,.8],[404,112,30,.7,20,1.6],[246,52,22,.55,4,2.2],[330,88,18,.6,-6,1.2],[214,16,15,.45,14,2.8],[388,158,13,.45,-10,3.2],[270,108,11,.4,0,2],[176,40,12,.35,22,3.6],[140,12,9,.3,-14,4]],n=[[350,70,16],[262,30,10],[396,60,9],[220,78,7]],a=[[318,52],[244,10],[402,22],[286,74],[196,58]];return o`<svg class="frost-pane" viewBox="0 0 420 170" preserveAspectRatio="xMaxYMin meet" aria-hidden="true">
      <defs><radialGradient id="nw-bokeh"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      ${n.map(([l,p,s],d)=>q`<circle class="frost-bokeh" fill="url(#nw-bokeh)" cx=${l} cy=${p} r=${s} style=${`--fd:${d*1.1}s`}/>`)}
      ${e.map(([l,p,s,d,h,m])=>q`<g transform=${`translate(${l} ${p}) rotate(${h})`}><path class="frost-flake" style=${`--fo:${d};--fd:${m}s;stroke-width:${Math.max(1.2,s*.11)}`} d=${L.flake(s)}/></g>`)}
      ${a.map(([l,p],s)=>q`<path class="frost-spark" style=${`--fd:${s*.7}s`} transform=${`translate(${l} ${p})`} d="M0 -6L1.2 -1.2L6 0L1.2 1.2L0 6L-1.2 1.2L-6 0L-1.2 -1.2Z"/>`)}
    </svg>`}static petal(e){return o`<svg class=${`petal petal-${e}`} viewBox="0 0 12 12"><path d="M6 0C10 3 10 9 6 12C2 9 2 3 6 0Z"/></svg>`}static plane(e){return o`<svg class=${`plane plane-${e}`} viewBox="0 0 44 44"><defs>${L.planeTint(e)}</defs>
      <path class="stem" d="M22 30.5Q23 37 21 42.5"/><path class="blade" fill=${`url(#nw-plane-${e})`} d="M22 32Q14 34 8 31L4 28.5L7.5 27Q11 25.5 10 22.5L4.5 21L6.5 19.5L1 13L4.5 12.5L3 9Q8 9 10.5 12L11.5 10Q14.5 13 16 16Q15.3 11 16.8 7.6L15.4 6.2L18.8 5.3Q20.8 3.6 22 1Q23.2 3.6 25.2 5.3L28.6 6.2L27.2 7.6Q28.7 11 28 16Q29.5 13 32.5 10L33.5 12Q36 9 41 9L39.5 12.5L43 13L37.5 19.5L39.5 21L34 22.5Q33 25.5 36.5 27L40 28.5L36 31Q30 34 22 32Z"/><path class="veins" d="M22 31V4M22 31Q14 22 3.5 10M22 31Q30 22 40.5 10M22 31Q14 29 5 28.5M22 31Q30 29 39 28.5M22 19L17 13.5M22 19L27 13.5M22 12L19 8.5M22 12L25 8.5M13.5 21.5L8.5 18.5M30.5 21.5L35.5 18.5M10 17L6.5 12.5M34 17L37.5 12.5"/></svg>`}static seed(){return o`<svg class="seed" viewBox="0 0 24 30"><path class="seed-stem" d="M12 29V12"/><ellipse class="seed-body" cx="12" cy="27.5" rx="1.3" ry="2.4"/>
      <path class="seed-rays" d="M12 12L3 6M12 12L5 3M12 12L8 1M12 12L12 0M12 12L16 1M12 12L19 3M12 12L21 6M12 12L1 10M12 12L23 10"/></svg>`}static leaf(e){return o`<svg class=${e?"dry":"gleaf"} viewBox="0 0 28 18"><path d="M2 9C8-2 21 1 27 4C23 17 9 20 2 9Z"/><path d="M0 10 22 6"/></svg>`}blown(e,n){let a=e==="seed"?1.5:e==="petal"?1.15:1,l=e==="plane"?1.4:1;return Array.from({length:this.quality==="low"?2:n},(p,s)=>{let d=f=>{let b=Math.sin((s+1)*91.7+f*47.3)*24634.6345;return b-Math.floor(b)},h=(3.2+d(1)*2.6)*a,m=e==="leaf"||e==="dry",u=e==="petal"?L.petal(s%2):e==="plane"?L.plane(s%3):e==="seed"?L.seed():L.leaf(e==="dry");return o`<div class="leaf-track" style=${`--leaf-top:${(18+d(2)*62).toFixed(0)}%;--leaf-delay:${(-d(3)*h).toFixed(2)}s;--leaf-time:${h.toFixed(2)}s`}><div class="leaf-bob" style=${`--bob:${((.7+d(4)*.9)*a).toFixed(2)}s;--lamp:${((6+d(5)*14)*a).toFixed(0)}px;--bd:${(-d(6)*1.5).toFixed(2)}s`}><div class=${`leaf k-${e}`} style=${`--spin:${((.9+d(7)*1.4)*l).toFixed(2)}s;--ls:${(.7+d(8)*.55).toFixed(2)};--lh:${m?((d(9)-.5)*50).toFixed(0):0}deg;--dir:${d(10)<.5?"normal":"reverse"}`}>${u}</div></div></div>`})}seasonal(e,n,a,l,p){let s=this.quality==="low",d=e||n,h=!d&&!l;if(p)return this.season==="spring"?h?this.blown("petal",7):c:this.season==="summer"?h?this.blown("seed",6):c:this.season==="autumn"?!n&&!l?this.blown("plane",5):c:this.season==="winter"?o`${this.frostPane()}${h?this.blown("dry",3):c}`:h?this.blown("leaf",5):c;let m=a||this.wind>=30||this.gust>=zi,u=(f,b)=>Array.from({length:s?2:f},($,_)=>o`<div class=${`drift${m?" drift--gusty":""}`} style=${`--dx:${46+_*23%50}%;--dt:${(m?5:11)+_*7%(m?4:7)}s;--dd:${-(_*3.1)%11}s;--rest:${12+_*29%70}%;--sw:${2.6+_%3*.5}s`}><i>${b(_)}</i></div>`);return this.season==="spring"&&!d&&!a&&!l?u(6,f=>L.petal(f%2)):this.season==="autumn"&&!["snowy","snowy-rainy","hail"].includes(this.condition)?u(5,f=>L.plane(f%3)):this.season==="summer"&&this.phase==="day"&&["sunny","partlycloudy"].includes(this.condition)?o`<div class="heat">${Array.from({length:s?3:7},(f,b)=>o`<div class="heat-plume" style=${`--hx:${47+b*13%46}%;--hh:${70+b*17%45}px;--hd:${-(b*.9)%4.2}s;--hs:${1.6+b%3*.35}s`}><svg viewBox="0 0 24 120" preserveAspectRatio="none"><defs><linearGradient id=${`nw-heat-${b}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" class="heat-stop" stop-opacity="0"/><stop offset=".35" class="heat-stop" stop-opacity=".6"/><stop offset="1" class="heat-stop" stop-opacity="0"/></linearGradient></defs><path stroke=${`url(#nw-heat-${b})`} d="M12 120C4 104 20 92 12 76S4 48 12 32S20 10 12 0"/></svg></div>`)}</div>`:this.season==="winter"?this.frostPane():c}render(){let e=this.detail,n=this.quality==="low",a=e==="freezing-rain",l=e==="storm-hail",p=e==="storm-risk",s=["showers","showers-light","snow-showers","sleet-showers","storm-showers"].includes(e),d=["rainy","pouring","lightning-rainy","snowy-rainy","hail"].includes(this.condition)||l,h=this.condition==="hail"||l,m=["snowy","snowy-rainy"].includes(this.condition)&&!a||h,u=["lightning","lightning-rainy"].includes(this.condition),f=u&&!p,b=this.condition==="fog",$=!b&&!["sunny","clear-night","unknown","exceptional"].includes(this.condition),_=["sunny","clear-night","partlycloudy","windy"].includes(this.condition)||s||p,C=["windy","windy-variant"].includes(this.condition)||this.wind>=Sn||this.gust>=En,V=!C&&(this.wind>=Mn||this.gust>=zi),T=this.condition==="pouring",z=T||f&&e!=="storm-showers"||h||e==="overcast",w=n?e==="heavy-snow"?14:e==="flurries"?5:8:T?80:h?18:e==="drizzle"?30:e==="showers-light"?20:d?52:e==="flurries"?22:e==="heavy-snow"?160:m?90:20,S=C?-150:T?-85:-38,H=(v,x=w)=>Array.from({length:x},(j,Q)=>{let R=I=>{let Y=Math.sin((Q+1)*12.9898+I*78.233+v.length*3.1)*43758.5453;return Y-Math.floor(Y)},Je=`--x:${(R(1)*104-2).toFixed(1)}%;--rest:${(R(2)*88).toFixed(0)}%`;if(v==="rain"){let I=R(3)<.45?0:R(3)<.82?1:2,Y=(T?.45:e==="drizzle"?1.5:.8)*(.85+R(4)*.35)*(1+(2-I)*.18),ge=(T?34:e==="drizzle"?10:a?16:22)*(.55+R(5)*.7)*(.7+I*.2),Ye=(T?2.4:e==="drizzle"?1.3:1.9)*(.75+I*.2),Hi=(C?24:T?15:e==="drizzle"?5:9)+(R(6)-.5)*5;return o`<i class=${`particle rain depth-${I}`} style=${`${Je};--delay:${(-R(7)*Y).toFixed(2)}s;--duration:${Y.toFixed(2)}s;--len:${ge.toFixed(1)}px;--w:${Ye.toFixed(2)}px;--rot:${Hi.toFixed(1)}deg;--o:${(.5+I*.18+R(8)*.2).toFixed(2)};--drift:${S+(R(9)-.5)*20}px`}></i>`}if(v==="snow"){let I=n?R(3)<.6?1:2:R(3)<.4?0:R(3)<.75?1:R(3)<.93?2:3,Y=[13,10.5,8.5,7][I]*(.85+R(4)*.3)*(e==="heavy-snow"?.6:1),ge=[[2,3.4],[3,5],[4.5,6.5],[6.5,9.5]][I],Ye=ge[0]+R(5)*(ge[1]-ge[0]);return o`<i class=${`particle snow depth-${I}`} style=${`${Je};--delay:${(-R(7)*Y).toFixed(2)}s;--duration:${Y.toFixed(2)}s;--size:${Ye.toFixed(1)}px;--o:${([.5,.62,.72,.78][I]+R(8)*.18).toFixed(2)};--blur:${[.3,.2,.5,1.1][I]}px;--amp:${([3,5,8,11][I]*(.6+R(9)*.8)).toFixed(1)}px;--sw:${(2.2+R(10)*2.5).toFixed(2)}s`}></i>`}let Et=1.9+Q*37%8/10,Oi=4+Q%3;return o`<i class=${`particle ${v} depth-${Q%3}`} style=${`${Je};--delay:${-(Q*13%37)/37*Et}s;--duration:${Et}s;--size:${Oi}px;--drift:${S}px;--dx:${(Q%2?1:-1)*(5+(Q*5*37+11)%8)}px`}></i>`}),U=v=>a?this.ice("glaze"):o`<div class="wet"></div>${e==="drizzle"?c:Array.from({length:n?Math.min(v,5):v},(x,j)=>o`<i class="splash" style=${`--x:${4+(j*11*37+11)%92}%;--d:${1.1+(j*37+11)%7/10}s;--dl:-${(j*3*37+11)%150/100}s`}></i>`)}`,N=o`${d?H("rain",h&&!n?18:w):c}${m?H(h?"hailstone":"snow",h&&!n?l?22:30:w):c}
        ${d?U(T?18:h?8:e==="showers-light"?6:14):c}`;return o`<div class=${`scene ${this.phase} ${this.condition}${e?` detail-${e}`:""}${C?" gale":""}${this.season?` season-${this.season}`:""}`} style=${`--play:${this.animated&&this.visible&&this.pageVisible?"running":"paused"};--cloud-duration:${C?6:Math.max(11,28-Math.min(Math.max(this.wind,0),60)/2.5)}s`} ?data-still=${!this.animated}>
      <div class="weather-art">${this.condition!=="unknown"&&this.condition!=="exceptional"?o`
        ${this.phase==="night"&&_?this.stars(this.quality==="low"?8:this.condition==="partlycloudy"&&e!=="few"?12:24):c}
        ${_?this.phase==="night"?o`<div class="orb moon"><i></i><b></b></div>`:o`<div class="orb sun"><i></i></div>`:c}
        ${z?o`<div class="overcast"></div>${this.cloud("heavy-left")}${n?c:this.cloud("heavy-right")}${e==="overcast"&&!n?this.cloud("back"):c}`:e==="veil"?this.cirrus():e==="few"?this.cloud("front"):$?o`${this.cloud("back")}${this.cloud("front")}${n?c:this.cloud("small")}`:c}
        ${b?this.fog():c}
        ${e==="freezing-fog"?this.ice("rime"):c}
        ${this.condition!=="unknown"?this.seasonal(d,m,u,b,C):c}
        ${s?o`<div class="burst">${N}</div>`:N}
        ${this.condition==="snowy"&&e!=="flurries"?o`<div class="snowbank"><svg viewBox="0 0 400 20" preserveAspectRatio="none"><defs><linearGradient id="nw-snowbank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#dfe9f4"/></linearGradient></defs>
          <path d="M0 20V11C22 6 40 13 66 9S112 4 140 9 190 14 222 8 276 4 306 10 360 13 400 8V20Z"/></svg>
          ${Array.from({length:n?3:8},(v,x)=>o`<i style=${`--x:${6+(x*13*37+11)%88}%;--dl:-${(x*37+11)%26/10}s`}></i>`)}</div>`:c}
        ${C?this.windLines():V?this.windLines(!0):c}
        ${u?o`${f?Li.map((v,x)=>o`<div class=${`bolt b${x+1}`} style=${`animation-delay:${v.delay}s`}><svg viewBox="0 0 120 220"><path d=${v.d}/></svg></div>`):c}
          ${Li.map((v,x)=>o`<div class=${`flash f${x+1}`} style=${`animation-delay:${v.delay}s`}></div>`)}`:c}
      `:c}</div>
    </div>`}};L.styles=A`
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
    .scene.fog {--sky:linear-gradient(180deg,#7f8e9a,#aab6be 60%,#c9d1d6);--tint:.5;}
    .scene.rainy {--sky:linear-gradient(150deg,#263e56,#486580 65%,#6c8aa1);--tint:.45;}
    .scene.pouring {--sky:linear-gradient(150deg,#17293f,#35485e 65%,#536c83);--tint:.45;}
    .scene.lightning,.scene.lightning-rainy {--sky:linear-gradient(150deg,#0b1626,#1d2c40 65%,#32435a);--tint:.52;}
    /* A snowy sky a shade darker than the flakes, so they show. */
    .scene.snowy,.scene.snowy-rainy {--sky:linear-gradient(150deg,#3b5876,#7491ab 70%,#a9bfcf);--tint:.55;}
    .scene.hail {--sky:linear-gradient(150deg,#1d2a3c,#3f5068 65%,#56677d);--tint:.5;}
    .scene.night:not(.clear-night):not(.sunny):not(.partlycloudy) {--sky:linear-gradient(150deg,#111c2c,#334457 80%,#506276);--tint:.44;}
    .scene.night.lightning,.scene.night.lightning-rainy {--tint:.56;}
    .scene.unknown,.scene.exceptional {--sky:linear-gradient(145deg,#697782,#87949e);--tint:.3;}
    /* Météo-France nuances: each one tints its sky a shade from the plain condition. */
    .scene.detail-veil {--sky:linear-gradient(150deg,#7b9cb8,#a9c6db 65%,#d4e2ec);--tint:.42;}
    .scene.detail-overcast {--sky:linear-gradient(155deg,#3f4f60,#6c7d8e 75%,#9aa8b4);--tint:.46;}
    .scene.detail-mist {--sky:linear-gradient(160deg,#6f98bd,#a6c3d8 60%,#d2dfe8);--tint:.45;}
    .scene.detail-patches {--sky:linear-gradient(150deg,#5a8ab8,#8ab8da 65%,#c2d8e6);--tint:.42;}
    .scene.detail-dense {--sky:linear-gradient(180deg,#6f7c87,#98a4ad 60%,#b8c1c7);--tint:.6;}
    .scene.detail-freezing-fog {--sky:linear-gradient(180deg,#6f879c,#a2b8c9 60%,#cbdae6);--tint:.6;}
    .scene.detail-drizzle {--sky:linear-gradient(150deg,#3a536b,#5f7b94 65%,#8aa2b5);--tint:.42;}
    .scene.detail-showers,.scene.detail-showers-light,.scene.detail-snow-showers,.scene.detail-sleet-showers {--sky:linear-gradient(150deg,#46698b,#6f97b8 65%,#a5c3d8);--tint:.44;}
    .scene.detail-freezing-rain {--sky:linear-gradient(150deg,#2c4560,#5b7d9c 65%,#9cb6cb);--tint:.5;}
    .scene.detail-flurries {--sky:linear-gradient(150deg,#56728e,#8ea7bd 70%,#bccbd8);--tint:.48;}
    .scene.detail-heavy-snow {--sky:linear-gradient(150deg,#2e465f,#5f7a93 70%,#8ea5b8);--tint:.58;}
    .scene.detail-storm-showers {--sky:linear-gradient(150deg,#2a3d52,#557089 65%,#8aa3b8);--tint:.48;}
    .scene.detail-storm-risk {--sky:linear-gradient(150deg,#2f4256,#5a6f86 65%,#8095aa);--tint:.48;}
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
    :is(.cloud,.fog-band,.heat-plume,.leaf,.bolt)>svg {display:block;width:100%;height:100%;overflow:visible;}
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
    /* Each drop carries its own length, width, lean and shade (set in render): a streak that fades towards its tail. */
    .rain {opacity:var(--o);}
    .rain::before {width:var(--w);height:var(--len);border-radius:var(--w);background:linear-gradient(#e4f3ff00,#eaf6ffd0 40%,#f6fbff);rotate:var(--rot);}
    .snow {animation-name:snow;opacity:var(--o);}
    /* A white flake with a fine blue-grey rim and a soft glow: it shows on a pale sky as on a dark one. */
    /* A soft flake: a bright heart melting into its edge, a faint shadow so it shows on a pale sky, near flakes slightly out of focus. */
    .snow::before {width:var(--size);height:var(--size);border-radius:50%;background:radial-gradient(circle at 46% 44%,#fff 0 28%,rgba(255,255,255,.78) 52%,rgba(255,255,255,0) 74%);
      box-shadow:0 0 2px rgba(45,75,115,.16);filter:blur(var(--blur));
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
    .scene {--fog-ink:color-mix(in srgb,var(--primary-text-color,#253047) 42%,#eef3f6);}
    .fog-band {position:absolute;left:var(--fl);top:var(--fy);width:var(--fw);height:var(--fh,24%);fill:var(--fog-ink);filter:blur(10px);animation:fog-drift var(--fd) ease-in-out var(--fdelay) infinite alternate,fog-breathe calc(var(--fd) * .7) ease-in-out var(--fdelay) infinite alternate;}
    .fog-band.depth-0 {--fo:.4;}.fog-band.depth-1 {--fo:.55;height:var(--fh,28%);}.fog-band.depth-2 {--fo:.7;height:var(--fh,32%);filter:blur(14px);}
    .night {--fog-ink:#a9b6c4;}
    /* Brume: thin threads of mist, low in the sky. */
    .mist-thread {position:absolute;left:var(--fl);top:var(--fy);width:var(--fw);height:9px;border-radius:50%;background:linear-gradient(90deg,transparent,var(--fog-ink) 30%,var(--fog-ink) 70%,transparent);
      filter:blur(3px);--fo:.75;animation:fog-drift var(--fd) ease-in-out var(--fdelay) infinite alternate,fog-breathe calc(var(--fd) * .7) ease-in-out var(--fdelay) infinite alternate;}
    /* Brouillard dense: a closed wall of grey that breathes, behind the bands. */
    .fog-wall {position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--fog-ink) 70%,transparent),var(--fog-ink));animation:wall-breathe 10s ease-in-out infinite alternate;}
    .detail-freezing-fog {--fog-ink:color-mix(in srgb,var(--primary-text-color,#253047) 34%,#d7eaff);}
    /* Ice crystals hanging in freezing fog: tiny glints that come and go. */
    .ice-air i {position:absolute;left:var(--x);top:var(--y);width:3px;height:3px;rotate:45deg;background:#fff;box-shadow:0 0 0 .5px rgba(60,95,135,.55),0 0 5px 1px #e3f3ff;animation:twinkle var(--t) ease-in-out var(--dl) infinite;}
    /* Wind threads take the theme's text colour: blue-grey on a light card, near white on a dark card, white on a dark sky. */
    .wind {position:absolute;inset:0;--wind-ink:color-mix(in srgb,var(--primary-text-color,#253047) 55%,#e9f2fa);}
    .night .wind,.pouring .wind,.lightning .wind,.lightning-rainy .wind,.hail .wind,.detail-overcast .wind,.detail-heavy-snow .wind {--wind-ink:#f1f7fd;}
    /* The whole thread is drawn; a soft-edged window slides along it, so it fades in at its tail and out at its head, never a dot or a cut. */
    .wind-line {position:absolute;left:var(--wx);top:var(--wy);width:var(--ww);height:34px;opacity:var(--wo);
      -webkit-mask-image:linear-gradient(90deg,transparent,#000 35%,#000 65%,transparent);mask-image:linear-gradient(90deg,transparent,#000 35%,#000 65%,transparent);
      -webkit-mask-size:45% 100%;mask-size:45% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
      animation:wind-sweep var(--wt) ease-in-out var(--wd) infinite,wind-run var(--wt) ease-in-out var(--wd) infinite;}
    .wind-line svg {display:block;width:100%;height:100%;overflow:visible;}
    .wind-line path {fill:none;stroke:var(--wind-ink);stroke-width:2.2;stroke-linecap:round;vector-effect:non-scaling-stroke;}
    .leaf-track {position:absolute;left:0;top:var(--leaf-top);width:100%;height:20px;animation:leaves var(--leaf-time) linear var(--leaf-delay) infinite;}
    /* The leaf rises and dips as it flies, and flips over as it spins (it narrows when seen edge-on). */
    .leaf-bob {animation:leaf-flutter var(--bob) ease-in-out var(--bd) infinite alternate;}
    .leaf {width:20px;height:14px;scale:var(--ls);filter:hue-rotate(var(--lh)) drop-shadow(0 2px 2px #0002);animation:leaf-spin var(--spin) linear infinite var(--dir);}
    .gleaf path:first-child {fill:#e4c080;}.gleaf path:last-child {fill:none;stroke:#a5854d;stroke-width:1.4;}
    .dry path:first-child {fill:#9c6b3c;}.dry path:last-child {fill:none;stroke:#6b4423;stroke-width:1.4;}
    /* What the wind carries keeps its own size; a dandelion seed sways instead of flipping. */
    .leaf.k-dry {width:17px;height:12px;}.leaf.k-plane {width:26px;height:26px;}.leaf.k-petal {width:12px;height:12px;}.leaf.k-seed {width:18px;height:23px;}
    .leaf.k-seed {animation:seed-sway var(--spin) ease-in-out infinite alternate;filter:drop-shadow(0 0 1px rgba(40,70,110,.35));}
    .seed-stem {fill:none;stroke:#e8eef2;stroke-width:1;}.seed-body {fill:#8a7a5c;}.seed-rays {fill:none;stroke:#fff;stroke-width:.9;stroke-linecap:round;}
    .bolt {position:absolute;fill:none;stroke:#fff;stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 3px #f2f8ff) drop-shadow(0 0 16px #8fc2ff);opacity:0;animation:lightning 6s linear infinite;}
    .bolt.b1 {left:72%;top:80px;width:100px;height:170px;}
    .bolt.b2 {left:88%;top:55px;width:60px;height:130px;stroke-width:2.4;}
    .bolt.b3 {left:58%;top:28px;width:78px;height:150px;stroke-width:3;}
    /* One flash per bolt, centred on it and painted after the clouds so they light up too.
       Each strike flickers twice; strikes are ≥ 1.8 s apart, so never more than 2 flashes in a second
       (photosensitivity limit: 3). The text side of the card stays out of the bright centre. */
    .flash {position:absolute;inset:0;--fx:76%;--fy:30%;background:radial-gradient(ellipse 48% 105% at var(--fx) var(--fy),#f4f9ff,#c9dff7a6 30%,transparent 68%);mix-blend-mode:screen;opacity:0;animation:storm-flash 6s linear infinite;}
    .flash.f2 {--fx:92%;--fy:22%;}.flash.f3 {--fx:62%;--fy:18%;}
    /* Ciel voilé: a milky wash, three long streaks of high cloud, the sun softened behind them. */
    .veil-wash {position:absolute;inset:0;background:radial-gradient(ellipse 55% 70% at 76% 30%,rgba(255,255,255,.3),transparent 72%);}
    .cirrus {position:absolute;left:var(--cx);top:var(--cy);width:var(--cw);height:12px;border-radius:50%;background:linear-gradient(90deg,transparent,#fffc 35%,#ffffffb0 65%,transparent);
      filter:blur(4px);rotate:-7deg;animation:clouds 30s ease-in-out infinite alternate;}
    .cirrus.c0 {--cx:44%;--cy:42px;--cw:56%;}.cirrus.c1 {--cx:58%;--cy:84px;--cw:46%;height:9px;animation-delay:-11s;}.cirrus.c2 {--cx:50%;--cy:122px;--cw:40%;height:7px;opacity:.7;animation-delay:-20s;}
    .detail-veil .sun {filter:blur(1.5px) saturate(.7);opacity:.82;box-shadow:0 0 70px 30px #fff4d455;}.detail-veil .sun i {opacity:.25;}
    .detail-veil .moon {filter:blur(1px);opacity:.75;}
    /* Couvert: a lighter grey ceiling than a storm's, closed from edge to edge. */
    .detail-overcast .overcast {left:0;height:60%;background:linear-gradient(180deg,rgba(60,72,86,.34),rgba(60,72,86,0));}
    .detail-overcast .cloud-rear {fill:#8c99a6;}.detail-overcast .cloud-near {fill:#b9c3cc;}
    /* Brume: thin; brouillard dense: thick and closer. */
    .fog-layer {position:absolute;inset:0;}
    /* Bancs de brouillard: thick, opaque banks lying on the ground. */
    .patches .fog-band {--fo:.92;filter:blur(8px);}
    .detail-dense .fog-band,.detail-freezing-fog .fog-band {height:34%;}
    /* Bruine: short, fine, slow drops. */
    /* Pluie verglaçante: glassy drops, then ice on the ground. */
    .detail-freezing-rain .rain::before {background:linear-gradient(#dff4ff00,#e6f7ffc0 50%,#f6fcff);}
    .ice {position:absolute;left:0;right:0;bottom:0;height:9px;}
    .ice.glaze {background:linear-gradient(0deg,rgba(214,238,255,.75),rgba(214,238,255,0));}
    .ice.glaze::after {content:'';position:absolute;inset:auto 0 0 0;height:2px;background:linear-gradient(90deg,transparent 40%,#fff 50%,transparent 60%);background-size:250% 100%;animation:sheen 3.5s linear infinite;}
    .ice.rime {height:7px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.85) 0 1px,transparent 1px 4px),linear-gradient(0deg,rgba(240,248,255,.8),rgba(240,248,255,0));
      -webkit-mask-image:linear-gradient(0deg,#000,transparent);mask-image:linear-gradient(0deg,#000,transparent);}
    .ice i {position:absolute;bottom:2px;left:var(--x);width:3px;height:3px;rotate:45deg;background:#fff;box-shadow:0 0 5px 1px #e6f6ff;animation:twinkle 3s ease-in-out var(--dl) infinite;}
    /* Averses: the shower passes, stops, comes back (14 s). */
    .burst {position:absolute;inset:0;animation:burst 14s ease-in-out infinite;}
    /* Risque d'orages: no bolt, only a faint glow inside the clouds now and then. */
    .detail-storm-risk .flash {animation-name:distant-flash;animation-duration:9s;}
    /* Neige forte: bigger flakes, falling slantwise. */
    .detail-heavy-snow .snow {animation-name:snow-heavy;}.detail-heavy-snow .snow::before {scale:1.15;}
    /* Strong wind: rain and snow driven sideways. */
    .gale .snow {animation-name:snow-gale;}
    .scene *, .scene *::after, .scene *::before {animation-play-state:var(--play,paused);}
    .scene[data-still] *,.scene[data-still] *::before,.scene[data-still] *::after {animation:none;}.scene[data-still] .particle {translate:0 var(--rest);}
    .scene[data-still] .snowbank {scale:1 1;}.scene[data-still] .particle.hailstone {translate:0 calc(var(--rest) * .9);}.scene[data-still] .drift {translate:0 var(--rest);}.scene[data-still] .frost-bokeh {opacity:.6;}
    .scene[data-still] .bolt.b1 {opacity:.8;}.scene[data-still] .flash {opacity:0;}.scene[data-still] .burst {opacity:1;}.scene[data-still] .wind-line {-webkit-mask-position:50% 0;mask-position:50% 0;}
    @keyframes clouds {from{translate:-24px 0;}to{translate:32px 4px;}}
    @keyframes wind-clouds {from{translate:-75px -3px;}to{translate:90px 6px;}}
    @keyframes rays {to{rotate:360deg;}}
    @keyframes halo {from{opacity:.55;scale:.94;}to{opacity:1;scale:1.06;}}
    @keyframes twinkle {0%,100%{opacity:.25;scale:.7;}50%{opacity:1;scale:1.15;}}
    @keyframes fall {from{translate:0 0;}to{translate:var(--drift) 100%;}}
    @keyframes snow {to{translate:0 100%;}}
    @keyframes snow-gale {to{translate:-140px 100%;}}
    @keyframes snow-heavy {to{translate:-55px 100%;}}
    @keyframes burst {0%,100%{opacity:0;}12%,58%{opacity:1;}70%{opacity:0;}}
    @keyframes distant-flash {0%,3%,100%{opacity:0;}.8%{opacity:.28;}1.6%{opacity:.08;}2.2%{opacity:.22;}}
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
    @keyframes wall-breathe {from{opacity:.5;}to{opacity:.75;}}
    @keyframes fog-breathe {from{opacity:calc(var(--fo) * .6);}to{opacity:var(--fo);}}
    /* The soft window slides from before the tail to past the head, while the thread drifts downwind: each loop starts and ends unseen. */
    @keyframes wind-sweep {from{-webkit-mask-position:-90% 0;mask-position:-90% 0;}to{-webkit-mask-position:190% 0;mask-position:190% 0;}}
    @keyframes wind-run {0%{translate:-6% 0;}100%{translate:14% -4px;}}
    @keyframes leaves {from{translate:-8% 10px;}35%{translate:30% -14px;}70%{translate:72% 6px;}to{translate:112% -20px;}}
    @keyframes seed-sway {from{rotate:-28deg;}to{rotate:22deg;}}
    @keyframes leaf-flutter {from{translate:0 calc(var(--lamp) * -1);}to{translate:0 var(--lamp);}}
    @keyframes leaf-spin {0%{transform:rotate(0) scaleY(1);}25%{transform:rotate(90deg) scaleY(.35);}50%{transform:rotate(180deg) scaleY(1);}75%{transform:rotate(270deg) scaleY(-.45);}100%{transform:rotate(360deg) scaleY(1);}}
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
    @media(prefers-reduced-motion:reduce) {.scene *,.scene *::before,.scene *::after{animation:none!important;}.snowbank{scale:1 1;}.particle{translate:0 var(--rest);}.drift{top:var(--rest);}.frost-bokeh{opacity:.6;}.bolt.b1{opacity:.8;}.flash{opacity:0;}.burst{opacity:1;}.wind-line{-webkit-mask-position:50% 0;mask-position:50% 0;}}
  `,y([E()],L.prototype,"condition",2),y([E()],L.prototype,"phase",2),y([E()],L.prototype,"quality",2),y([E({type:Boolean})],L.prototype,"animated",2),y([E({type:Number})],L.prototype,"wind",2),y([E({type:Number})],L.prototype,"gust",2),y([E()],L.prototype,"detail",2),y([E()],L.prototype,"season",2),y([M()],L.prototype,"visible",2),y([M()],L.prototype,"pageVisible",2),L=y([D("niak-weather-sky")],L);var Ln={format:"full",show_synthesis:!0,show_bulletin:!0,show_today:!0,show_predictions:!0,collapse_today:!1,collapse_predictions:!1,smart_brief:!0,weather_animations:!0,weather_animation_quality:"standard",show_atmo_details:!0,show_atmo_tomorrow:!0,glass_effect:!0,tile_blocks:["bulletin","events"],forecast_tab:"hours",pressure_span:"6h",wind_span:"6h",rain_span:"7d",clock:"none"},zn={entry_id:g("Lieu"),format:g("Format"),weather_animations:g("Ciel anim\xE9 et halos"),weather_animation_quality:g("Qualit\xE9 des animations"),glass_effect:g("Effet verre d\xE9poli"),show_synthesis:g("Bandeau (synth\xE8se et m\xE9t\xE9o du moment)"),show_bulletin:g("Bulletin du jour"),smart_brief:g("Alertes et \xE9v\xE9nements"),show_today:g("Section Aujourd\u2019hui"),collapse_today:g("Aujourd\u2019hui repli\xE9 au d\xE9part"),show_predictions:g("Section Pr\xE9visions"),collapse_predictions:g("Pr\xE9visions repli\xE9es au d\xE9part"),show_atmo_details:g("D\xE9tail des polluants et des pollens"),show_atmo_tomorrow:g("Air et pollens de demain"),weather_path:g("Page \xE0 ouvrir"),tile_blocks:g("Contenu de la tuile d\xE9pli\xE9e"),forecast_tab:g("Pr\xE9visions affich\xE9es au d\xE9part"),banner_blocks:g("Contenu du bandeau"),today_blocks:g("Contenu d\u2019Aujourd\u2019hui"),forecast_blocks:g("Contenu des Pr\xE9visions"),hold_action:g("Appui long"),tap_action:g("Appui"),pressure_span:g("Courbe de pression"),wind_span:g("Courbe du vent"),rain_span:g("Barres de pluie"),clock:g("Heure dans le bandeau")},Rn={weather_animations:g("Coup\xE9es, le ciel et les halos restent fixes."),weather_animation_quality:g("All\xE9g\xE9e : moins de gouttes, de flocons et de nuages."),glass_effect:g("Le flou demande beaucoup de ressources : \xE0 couper sur un appareil lent. Coup\xE9, le verre devient plus opaque."),smart_brief:g("La vigilance, l\u2019alerte mesur\xE9e chez vous et la frise des \xE9v\xE9nements. Coup\xE9, la frise ne montre que le ciel pr\xE9vu."),weather_path:g("Le chemin de la page, par exemple /meteo ou /lovelace/meteo."),tile_blocks:g("Cochez ce qui s\u2019affiche quand la tuile est d\xE9pli\xE9e, et faites glisser pour changer l\u2019ordre."),banner_blocks:g("Le bandeau et son ciel anim\xE9 restent toujours, avec le lieu, la vigilance et la m\xE9t\xE9o du moment. Cochez ce qu\u2019il montre en dessous, dans l\u2019ordre."),today_blocks:g("Tout d\xE9cocher retire la section."),forecast_blocks:g("Tout d\xE9cocher retire la section."),forecast_tab:g("Un appui sur Heures ou Jours change l\u2019affichage ; ce choix est gard\xE9 sur chaque appareil."),pressure_span:g("Sur plusieurs jours, on voit mieux arriver une d\xE9pression ou un anticyclone."),rain_span:g("24 heures et 30 jours demandent un pluviom\xE8tre dont Home Assistant garde les statistiques ; sinon, la carte montre 7 jours."),clock:g("L\u2019heure de l\u2019appareil, mise \xE0 jour chaque minute.")},Ri="/config/integrations/integration/niak_weather",te=class extends F{constructor(){super(...arguments);this.asked=!1;this.computeLabel=e=>e.title??(e.name==="hold_action"&&this.tapped?r("Appui"):r(zn[e.name]??e.name));this.computeHelper=e=>r(Rn[e.name]??"");this.follow=e=>{e.preventDefault(),history.pushState(null,"",e.currentTarget.getAttribute("href")??Ri),window.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0}))}}get small(){return!!this.config?.format&&this.config.format!=="full"}get tapped(){return this.config?.format==="mini"||this.config?.format==="alert"}setConfig(e){let n=Ae(e);this.config&&JSON.stringify(n)===JSON.stringify(this.config)||(this.config=n)}shouldUpdate(e){return e.has("hass")&&this.hass&&Pe(this.hass.language,this.hass.locale?.language)?!0:(e.has("hass")&&!this.asked&&this.hass&&(this.asked=!0,this.hass.callWS({type:"niak_weather/entries"}).then(n=>{this.entries=n},()=>{this.entries=null})),!(e.size===1&&e.has("hass")))}changed(e){e.stopPropagation(),this.config&&(this.config=Ae({...this.config,...e.detail.value}),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0})))}schema(){let e=(...T)=>T.map(z=>({name:z,selector:{boolean:{}}})),n=(T,z,w,S=!1)=>({type:"expandable",name:"",title:T,icon:z,flatten:!0,expanded:S,schema:w}),a={name:"format",selector:{select:{mode:"list",options:[{value:"full",label:r("Compl\xE8te : la page m\xE9t\xE9o")},{value:"tile",label:r("Tuile : une bande qui se d\xE9plie d\u2019un appui")},{value:"intermediate",label:r("Tuile d\xE9pli\xE9e : la m\xEAme, ouverte au d\xE9part")},{value:"mini",label:r("Mini : une seule ligne")},{value:"forecast",label:r("Pr\xE9visions : les heures et les jours")},{value:"rain",label:r("Pluie : \xE0 venir et tomb\xE9e")},{value:"alert",label:r("Alerte : visible seulement en cas de vigilance ou d\u2019alerte")}]}}},l={name:"tile_blocks",selector:{select:{multiple:!0,reorder:!0,mode:"list",options:[{value:"bulletin",label:r("Bulletin du jour")},{value:"events",label:r("\xC9v\xE9nements (la frise)")},{value:"moments",label:r("Les prochains moments (soir, nuit, matin\u2026)")},{value:"forecast",label:r("Pr\xE9visions (heures ou jours)")}]}}},p={name:"forecast_tab",selector:{select:{mode:"dropdown",options:[{value:"hours",label:r("Heures")},{value:"days",label:r("Jours")}]}}},s=this.config?.format==="tile"||this.config?.format==="intermediate",d=this.config?.hold_action??(this.config?.weather_path?"page":"popup"),h=s?this.config?.tap_action??"toggle":void 0,m=T=>({name:T,required:!0,selector:{select:{mode:"dropdown",options:[...s?[{value:"toggle",label:r("D\xE9plier ou replier la tuile")}]:[],{value:"popup",label:r("Ouvrir la m\xE9t\xE9o compl\xE8te en fen\xEAtre")},{value:"page",label:r("Ouvrir une page")},{value:"none",label:r("Rien")}]}}}),u=[...s?[m("tap_action")]:[],m("hold_action"),...d==="page"||h==="page"?[{name:"weather_path",selector:{text:{}}}]:[]],f=this.entries&&this.entries.length>1?[{name:"entry_id",selector:{select:{options:this.entries.map(T=>({value:T.entry_id,label:T.title}))}}}]:[],b=n(r("Visuel et performance"),"mdi:palette-outline",[...e("weather_animations"),{name:"weather_animation_quality",required:!0,selector:{select:{mode:"dropdown",options:[{value:"standard",label:r("Standard")},{value:"low",label:r("All\xE9g\xE9e")}]}}},...e("glass_effect")],!0),$=this.config?.format;if($==="mini"||$==="alert")return[...f,a,n(r("Fonctionnalit\xE9s"),"mdi:tune-variant",u,!0)];if($==="forecast")return[...f,a,n(r("Fonctionnalit\xE9s"),"mdi:tune-variant",[p],!0)];if($==="rain")return[...f,a];if(this.small)return[...f,a,b,n(r("Contenu"),"mdi:view-list-outline",[l,...(this.config?.tile_blocks??[]).includes("forecast")?[p]:[]],!0),n(r("Fonctionnalit\xE9s"),"mdi:tune-variant",u)];let _=(T,z)=>({name:T,selector:{select:{multiple:!0,reorder:!0,mode:"list",options:z.map(([w,S])=>({value:w,label:S}))}}}),C=[["6h",r("6 derni\xE8res heures")],["1d",r("24 derni\xE8res heures")],["2d",r("2 derniers jours")],["7d",r("7 derniers jours")]],V=(T,z)=>({name:T,required:!0,selector:{select:{mode:"dropdown",options:z.map(([w,S])=>({value:w,label:S}))}}});return[...f,a,b,n(r("Bandeau intelligent"),"mdi:view-day-outline",[_("banner_blocks",[["bulletin",r("Bulletin du jour")],["events",r("\xC9v\xE9nements (la frise)")],["moments",r("Les prochains moments (soir, nuit, matin\u2026)")],["forecast",r("Pr\xE9visions en tuiles (heures ou jours)")]]),V("clock",[["none",r("Masqu\xE9e")],["left",r("Sous le titre, en grand")],["right",r("Au-dessus de \xAB En ce moment \xBB")]])],!0),n(r("Aujourd\u2019hui"),"mdi:calendar-today",[_("today_blocks",[["rain",r("Pluie")],["wind",r("Vent")],["pressure",r("Pression")],["comfort",r("Ressenti")],["extras",r("Pastilles (humidit\xE9, ros\xE9e, soleil\u2026)")],["air",r("Air et pollens du jour")]]),V("rain_span",[["24h",r("24 derni\xE8res heures (une barre par heure)")],["7d",r("7 derniers jours")],["30d",r("30 derniers jours (une barre par jour)")]]),V("wind_span",C),V("pressure_span",C),...e("collapse_today")]),n(r("Pr\xE9visions"),"mdi:calendar-week",[_("forecast_blocks",[["hours",r("Les 18 prochaines heures")],["days",r("Les 7 prochains jours")],["air",r("Air et pollens de demain")]]),...e("collapse_predictions")]),n(r("Air et pollens"),"mdi:flower-pollen-outline",e("show_atmo_details"))]}render(){if(!this.config||!this.hass)return c;let e=Fe(this.config),n={...this.config.show_bulletin===!1?{tile_blocks:["events"]}:{},banner_blocks:e.banner,today_blocks:e.today,forecast_blocks:e.forecasts},a={tap_action:"toggle",hold_action:this.config.weather_path?"page":"popup"},l=Object.fromEntries(Object.entries({...Ln,...a,...n,...this.config}).filter(([s])=>s!=="type")),p=this.entries?.length===1?this.entries[0]:void 0;return o`
      ${this.entries===null?o`<p class="note warn">${r("L\u2019int\xE9gration Niak Weather ne r\xE9pond pas : la carte en a besoin depuis la version 2.0.")}
          ${r("D\xE9j\xE0 t\xE9l\xE9charg\xE9e ?")} <a href="/config/integrations/dashboard/add?domain=niak_weather" @click=${this.follow}>${r("Ajoutez-la")}</a>.
          ${r("Sinon,")} <a href="https://github.com/Niakman13/niak-weather-integration#installation" target="_blank" rel="noopener noreferrer">${r("installez-la")}</a>.</p>`:this.entries?.length===0?o`<p class="note warn">${r("Ajoutez l\u2019int\xE9gration Niak Weather : Param\xE8tres \u2192 Appareils et services.")}</p>`:o`<p class="note">${p?o`${r("Lieu :")} <b>${p.title}</b>. `:c}${r("Les sources (pr\xE9visions, station, air et pollens) se r\xE8glent dans")}
          <a href=${Ri} @click=${this.follow}>${r("l\u2019int\xE9gration Niak Weather")}</a>.</p>`}
      <ha-form .hass=${this.hass} .data=${l} .schema=${this.schema()} .computeLabel=${this.computeLabel} .computeHelper=${this.computeHelper} @value-changed=${this.changed}></ha-form>`}};te.styles=A`
    .note { color:var(--secondary-text-color); font-size:13px; line-height:1.6; margin:0 0 16px; }
    .note.warn { color:var(--primary-text-color); }
    a { color:var(--primary-color); }
  `,y([E({attribute:!1})],te.prototype,"hass",2),y([M()],te.prototype,"config",2),y([M()],te.prototype,"entries",2),te=y([D("niak-weather-card-editor")],te);var ji=500,Fn=matchMedia("(pointer: coarse)"),On=0,Fi={missing:{title:g("Niak Weather a besoin de son int\xE9gration"),text:g("Depuis la version 2.0, la carte re\xE7oit ses calculs de l\u2019int\xE9gration Niak Weather. D\xE9j\xE0 t\xE9l\xE9charg\xE9e depuis HACS ? Ajoutez-la dans Param\xE8tres \u2192 Appareils et services. Sinon, installez-la depuis HACS, red\xE9marrez Home Assistant, puis ajoutez-la. D\xE9j\xE0 ajout\xE9e ? Elle n\u2019a pas d\xE9marr\xE9 : les journaux disent pourquoi (Param\xE8tres \u2192 Syst\xE8me \u2192 Journaux, cherchez \xAB niak \xBB)."),links:[[g("Ajouter l\u2019int\xE9gration"),"/config/integrations/dashboard/add?domain=niak_weather"],[g("L\u2019installer"),"https://github.com/Niakman13/niak-weather-integration#installation"]]},not_configured:{title:g("Ajoutez l\u2019int\xE9gration Niak Weather"),text:g("Elle est install\xE9e mais pas encore configur\xE9e. Elle peut reprendre les r\xE9glages de vos cartes."),links:[[g("Ajouter l\u2019int\xE9gration"),"/config/integrations/dashboard/add?domain=niak_weather"]]},choose_entry:{title:g("Choisissez un lieu"),text:g("Plusieurs lieux Niak Weather sont configur\xE9s : choisissez celui de cette carte dans ses r\xE9glages.")},not_found:{title:g("Lieu introuvable"),text:g("Le lieu de cette carte n\u2019existe plus : choisissez-en un autre dans ses r\xE9glages.")},version:{title:g("Rechargez la page"),text:g("L\u2019int\xE9gration Niak Weather vient d\u2019\xEAtre mise \xE0 jour : rechargez la page pour afficher sa carte.")},error:{title:g("L\u2019int\xE9gration Niak Weather a renvoy\xE9 une erreur"),text:g("Les journaux de Home Assistant disent pourquoi : Param\xE8tres \u2192 Syst\xE8me \u2192 Journaux, cherchez \xAB niak \xBB."),links:[[g("Voir les journaux"),"/config/logs"]]}},O=class extends F{constructor(){super(...arguments);this.editMode=!1;this.preview=!1;this.tab="hours";this.failure="";this.open=!1;this.dialogOpen=!1;this.folded={today:!1,predictions:!1};this.uid=`nw${++On}`;this.setTab=e=>{this.tab=e;try{localStorage.setItem(`niak-weather:tab:${this.config?.entry_id??""}`,e)}catch{}};this.picker=!1;this.follow=e=>{let n=e.currentTarget.getAttribute("href");n?.startsWith("/")&&(e.preventDefault(),this.go(n))};this.down=e=>{let n=this.tileCard();if(e.button!==0||!n)return;this.cancelPress();let a=n.querySelector(".press-ring"),l=n.getBoundingClientRect(),p=performance.now();a?.style.setProperty("left",`${e.clientX-l.left}px`),a?.style.setProperty("top",`${e.clientY-l.top}px`);let s=()=>{let h=Math.min(1,(performance.now()-p)/ji);a?.style.setProperty("--p",String(h)),n.classList.toggle("pressing",h>.15),h<1&&this.press&&(this.press.frame=requestAnimationFrame(s))},d=this.holdTarget!=="none";this.press={x:e.clientX,y:e.clientY,long:!1,frame:d?requestAnimationFrame(s):0,timer:setTimeout(()=>{!this.press||!d||(this.press.long=!0,this.stopRing(),this.act(this.holdTarget))},ji)}};this.move=e=>{this.press&&Math.hypot(e.clientX-this.press.x,e.clientY-this.press.y)>10&&this.cancelPress()};this.up=()=>{let e=this.press;this.cancelPress(),e&&!e.long&&this.act(this.tapTarget)};this.cancelPress=()=>{this.stopRing(),this.press=void 0};this.noMenu=e=>e.preventDefault();this.tileKey=e=>{e.target!==this.tileCard()||!["Enter"," "].includes(e.key)||(e.preventDefault(),this.act(e.shiftKey?this.holdTarget:this.tapTarget))};this.tap=e=>{e.target.closest("dialog")||this.act(this.holdTarget)};this.tapKey=e=>{!["Enter"," "].includes(e.key)||e.target.closest("dialog")||this.holdTarget==="none"||(e.preventDefault(),this.act(this.holdTarget))};this.closeDialog=()=>{this.renderRoot.querySelector("dialog")?.close()};this.openEntity=e=>{let n=e.composedPath().find(a=>a instanceof HTMLElement&&a.hasAttribute("data-entity"));!n||n.closest(".nw-tilecard")||(this.closeDialog(),this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:n.getAttribute("data-entity")},bubbles:!0,composed:!0})))};this.entityKey=e=>{!["Enter"," "].includes(e.key)||!(e.target instanceof HTMLElement)||!e.target.hasAttribute("data-entity")||(e.preventDefault(),this.openEntity(e))}}setConfig(e){let n=Ae(e),a=this.config;a&&JSON.stringify(a)===JSON.stringify(n)||(this.config=n,(!a||a.collapse_today!==n.collapse_today||a.collapse_predictions!==n.collapse_predictions)&&(this.folded={today:n.collapse_today===!0,predictions:n.collapse_predictions===!0}),(!a||a.format!==n.format||a.entry_id!==n.entry_id)&&(this.open=this.remembered(n)),(!a||a.forecast_tab!==n.forecast_tab||a.entry_id!==n.entry_id)&&(this.tab=this.rememberedTab(n)),a&&a.entry_id!==n.entry_id&&(this.unsubscribe(),this.view=void 0,this.problem=void 0))}static getStubConfig(){return{type:"custom:niak-weather-card"}}static getConfigElement(){return document.createElement("niak-weather-card-editor")}getCardSize(){return this.config?this.config.format==="mini"?1:this.config.format==="alert"?this.view&&this.hasAlert(this.view)?2:0:this.config.format==="forecast"||this.config.format==="rain"?5:this.tile?this.unfolded?7:2:Math.max(1,(this.config.show_synthesis===!1?0:4)+(this.config.show_today===!1?0:5)+(this.config.show_predictions===!1?0:4)):10}getGridOptions(){let e=this.config?.format;return e==="mini"?{columns:12,rows:1,min_columns:3}:this.tile||e==="alert"||e==="forecast"||e==="rain"?{columns:12,rows:"auto",min_columns:6}:{columns:"full",rows:"auto"}}get unfolded(){return this.tapTarget==="toggle"||this.holdTarget==="toggle"?this.open:this.config?.format==="intermediate"}get tile(){return this.config?.format==="tile"||this.config?.format==="intermediate"}get small(){return!!this.config?.format&&this.config.format!=="full"}hasAlert(e){let{alerts:n,points:a}=Pt(e);return n.length+a.length>0}rememberedTab(e){try{let n=localStorage.getItem(`niak-weather:tab:${e.entry_id??""}`);if(n==="hours"||n==="days")return n}catch{}return e.forecast_tab??"hours"}key(e=this.config){return`niak-weather:open:${e.format}:${e.entry_id??e.weather_entity??""}`}remembered(e){try{let n=localStorage.getItem(this.key(e));if(n!==null)return n==="1"}catch{}return e.format==="intermediate"}connectedCallback(){super.connectedCallback(),this.picker=this.inPicker(),this.subscribe()}inPicker(){for(let e=this;e;e=e.parentNode??(e instanceof ShadowRoot?e.host:null))if(e instanceof HTMLElement&&e.localName==="hui-card-picker")return!0;return!1}get editing(){return this.editMode||this.preview||this.picker}disconnectedCallback(){super.disconnectedCallback(),this.cancelPress(),this.unsubscribe()}shouldUpdate(e){(e.has("hass")||e.has("config"))&&this.subscribe();let n=this.hass&&`${this.hass.language}|${this.hass.locale?.language??""}`;return n&&n!==this.language?(this.language=n,Pe(this.hass.language,this.hass.locale?.language),!0):!(e.size===1&&e.has("hass"))}updated(){this.toggleAttribute("hidden",this.config?.format==="alert"&&!!this.view&&!this.hasAlert(this.view)&&!this.editing),this.toggleAttribute("still",this.config?.weather_animations===!1),this.toggleAttribute("flat",this.config?.glass_effect===!1);let e=this.renderRoot.querySelector("dialog");e&&this.dialogOpen&&!e.open&&e.showModal()}subscribe(){let e=this.hass?.connection,n=this.config;if(!e||!n||!this.isConnected)return;let a=`${n.entry_id??""}|${this.hass?.language??""}`;if(this.subscription&&this.subscribedTo===a)return;this.unsubscribe(),this.subscribedTo=a;let l=e.subscribeMessage(p=>this.receive(p),{type:"niak_weather/subscribe",language:this.hass?.language,...n.entry_id?{entry_id:n.entry_id}:{}});this.subscription=l,l.catch(p=>{if(this.subscription!==l)return;this.subscription=void 0;let s=p?.code;this.failure=[p?.message,s].filter(Boolean).join(" \xB7 "),this.problem=s==="not_configured"||s==="choose_entry"||s==="not_found"?s:!s||s==="unknown_command"?"missing":"error",s!=="choose_entry"&&this.retryLater(s==="unknown_command"?3e4:5e3)})}receive(e){if("reload"in e){this.unsubscribe(),this.retryLater(2e3);return}if(e.version!==1){this.problem="version";return}this.problem=void 0,this.view=e.view}unsubscribe(){clearTimeout(this.retry);let e=this.subscription;this.subscription=void 0,this.subscribedTo=void 0,e?.then(n=>n()).catch(()=>{})}retryLater(e){clearTimeout(this.retry),this.retry=setTimeout(()=>this.subscribe(),e)}render(){if(!this.config)return c;if(this.problem&&!this.view)return this.renderProblem(Fi[this.problem]);if(!this.view)return o`<ha-card><div class="nw-wait" role="status" aria-label=${r("Chargement de la m\xE9t\xE9o")}></div></ha-card>`;let e=this.config,n=Kt(this.view,e,this.tile),l=n.wind?.gust.at(-1)?.[1]??n.hours[0]?.gust??0,p=o`<niak-weather-sky .condition=${n.now.condition} .phase=${n.now.phase} .animated=${e.weather_animations!==!1}
      .quality=${e.weather_animation_quality??(this.tile&&Fn.matches?"low":"standard")} .wind=${n.now.wind??0} .gust=${l} .detail=${n.now.detail??""} .season=${n.season.info.season}></niak-weather-sky>`,s=()=>Ei(n,{sky:p,uid:this.uid,entity:n.weatherEntity,station:n.station,sections:Fe(e),tab:this.tab,onTab:this.setTab,clock:e.clock,folded:this.folded,onFold:f=>{this.folded={...this.folded,[f]:!this.folded[f]}}}),d=`${r("M\xE9t\xE9o")}${n.location?` \xB7 ${n.location}`:""}`,h=()=>this.dialogOpen?o`<dialog class="nw-dialog" aria-label=${d} @close=${()=>{this.dialogOpen=!1}} @click=${this.openEntity} @keydown=${this.entityKey}>
        <header><b>${d}</b><button type="button" @click=${this.closeDialog}>${r("Fermer")}</button></header>${s()}</dialog>`:c,m=this.holdTarget;switch(e.format){case"mini":return o`<ha-card><div @click=${this.tap} @keydown=${this.tapKey}>${xi(n,m)}</div>${h()}</ha-card>`;case"alert":{let f=yi(n,this.editing);return f===c?c:o`<ha-card><div @click=${this.tap} @keydown=${this.tapKey}>${f}</div>${h()}</ha-card>`}case"rain":return o`<ha-card @click=${this.openEntity} @keydown=${this.entityKey}>${ki(n)}</ha-card>`;case"forecast":return o`<ha-card @click=${this.openEntity} @keydown=${this.entityKey}>${$i(n,this.tab,this.setTab,n.weatherEntity,this.uid)}</ha-card>`}if(!this.tile)return o`<ha-card @click=${this.openEntity} @keydown=${this.entityKey}>${s()}</ha-card>`;let u=e.tile_blocks?.length?e.tile_blocks:e.show_bulletin===!1?["events"]:di;return o`<ha-card>
      <div @pointerdown=${this.down} @pointermove=${this.move} @pointerup=${this.up} @pointercancel=${this.cancelPress} @pointerleave=${this.cancelPress}
        @contextmenu=${this.noMenu} @keydown=${this.tileKey}>
        ${pi(n,p,{open:this.unfolded,tapTarget:this.tapTarget,holdTarget:m,blocks:u,tab:this.tab,onTab:this.setTab})}</div>
      ${h()}
    </ha-card>`}renderProblem(e){return o`<ha-card><div class="nw-problem" role="status"><ha-icon icon="mdi:weather-partly-cloudy"></ha-icon>
      <div><b>${r(e.title)}</b>${e===Fi.error&&this.failure?o`<p class="failure">« ${this.failure} »</p>`:c}<p>${r(e.text)}</p>${e.links?o`<div class="links">${e.links.map(([n,a],l)=>o`<a class=${l?"second":""} href=${a}
        target=${a.startsWith("/")?c:"_blank"} rel="noopener noreferrer" @click=${this.follow}>${r(n)}</a>`)}</div>`:c}</div></div></ha-card>`}go(e){history.pushState(null,"",e),window.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0}))}get holdTarget(){return this.target(this.config?.hold_action??(this.weatherPath?"page":"popup"))}get tapTarget(){return this.target(this.config?.tap_action??"toggle")}target(e){return e==="none"?"none":e==="toggle"?this.tile?"toggle":"card":e==="page"&&this.weatherPath?"page":"card"}get weatherPath(){let e=this.config?.weather_path;return e?.startsWith("/")&&!e.startsWith("//")?e:void 0}tileCard(){return this.renderRoot.querySelector(".nw-tilecard")}stopRing(){this.press&&(clearTimeout(this.press.timer),cancelAnimationFrame(this.press.frame),this.tileCard()?.classList.remove("pressing"))}toggle(){this.open=!this.open;try{localStorage.setItem(this.key(),this.open?"1":"0")}catch{}}act(e){let n=this.weatherPath;e==="toggle"?this.toggle():e==="page"&&n?this.go(n):e==="card"&&(this.dialogOpen=!0)}};O.styles=[Qt,Jt,Oe,ci,_i,Ci,Mi,vi,ui,Ti,A`
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
  `],y([E({attribute:!1})],O.prototype,"hass",2),y([E({attribute:!1})],O.prototype,"editMode",2),y([E({attribute:!1})],O.prototype,"preview",2),y([M()],O.prototype,"config",2),y([M()],O.prototype,"tab",2),y([M()],O.prototype,"view",2),y([M()],O.prototype,"problem",2),y([M()],O.prototype,"open",2),y([M()],O.prototype,"dialogOpen",2),y([M()],O.prototype,"folded",2),O=y([D("niak-weather-card")],O);var Hn=[["full",g("Niak Weather"),g("La page m\xE9t\xE9o : synth\xE8se, mesures, pr\xE9visions, air et pollens.")],["tile",g("Niak Weather \xB7 Tuile"),g("Une bande qui se d\xE9plie d\u2019un appui ; son contenu se choisit.")],["intermediate",g("Niak Weather \xB7 Tuile d\xE9pli\xE9e"),g("La tuile, ouverte au d\xE9part : bulletin, \xE9v\xE9nements, moments ou pr\xE9visions.")],["mini",g("Niak Weather \xB7 Mini"),g("Une seule ligne : le ciel, la temp\xE9rature et la vigilance.")],["forecast",g("Niak Weather \xB7 Pr\xE9visions"),g("Les 18 prochaines heures ou les 7 prochains jours.")],["rain",g("Niak Weather \xB7 Pluie"),g("La pluie \xE0 venir, celle qui tombe et celle qui est tomb\xE9e.")],["alert",g("Niak Weather \xB7 Alerte"),g("Visible seulement en cas de vigilance ou d\u2019alerte.")]];Xt();for(let[t,i,e]of Hn){let n=t==="full"?"niak-weather-card":`niak-weather-${t==="intermediate"?"tile-open":t}-card`;t!=="full"&&!customElements.get(n)&&customElements.define(n,class extends O{static getStubConfig(){return{type:"custom:niak-weather-card",format:t}}setConfig(a){super.setConfig({format:t,...a})}}),window.customCards=window.customCards||[],window.customCards.some(a=>a.type===n)||window.customCards.push({type:n,name:r(i),description:r(e),preview:!0})}})();
