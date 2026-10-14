import { css, html, LitElement, nothing, svg } from 'lit';
import { property, state } from 'lit/decorators.js';
import { define } from './define';

/** Bolt artwork and phase offset in the 6 s storm cycle. Offsets keep successive strikes ≥ 1.8 s apart. */
const BOLTS=[
  {d:'M58 0 43 40 61 52 35 88 49 97 24 144 37 151 12 217M43 40 23 56 34 67 17 91M35 88 72 107 64 121 88 147',delay:0},
  {d:'M42 0 62 35 48 52 81 87 67 102 92 153 80 171 104 216M62 35 85 40 81 58 105 80',delay:-2.1},
  {d:'M70 0 52 30 66 44 40 78 58 86 30 130 44 136 26 190M52 30 34 42 40 56M40 78 18 96',delay:-4.2},
];

/** Original vector/CSS weather scene. All artwork is bundled; no remote assets. */
@define('niak-weather-sky')
export class NiakWeatherSky extends LitElement {
  @property() condition='unknown';
  @property() phase='unknown';
  @property() quality:'low'|'standard'='standard';
  @property({type:Boolean}) animated=true;
  @property({type:Number}) wind=0;
  /** spring | summer | autumn | winter: small seasonal touches that never contradict the weather. */
  @property() season='';
  @state() private visible=false;
  @state() private pageVisible=true;
  private observer?:IntersectionObserver;
  private visibility=()=>{this.pageVisible=!document.hidden;};
  connectedCallback() {
    super.connectedCallback();this.visibility();document.addEventListener('visibilitychange',this.visibility);
    if(typeof IntersectionObserver!=='undefined') {
      this.observer=new IntersectionObserver(entries=>{this.visible=entries.some(e=>e.isIntersecting);});this.observer.observe(this);
    } else this.visible=true;
  }
  disconnectedCallback() {super.disconnectedCallback();this.observer?.disconnect();document.removeEventListener('visibilitychange',this.visibility);}
  private cloud(layer:string) {
    return html`<div class=${`cloud ${layer}`}><svg viewBox="0 0 180 112" aria-hidden="true">
      <path class="cloud-rear" d="M42 103C21 103 7 90 7 70C7 53 17 40 33 36C35 16 50 5 69 5C91 5 107 19 109 40C116 37 123 36 130 36C154 36 172 51 172 73C172 92 157 103 137 103Z"/>
      <path class="cloud-near" d="M38 103C26 103 19 95 19 84C19 73 27 65 36 64C38 52 47 45 59 45C72 45 82 54 83 65C99 62 116 72 116 85C116 96 108 103 94 103Z"/>
    </svg></div>`;
  }
  /** Deterministic star field over the artwork side; each star twinkles on its own rhythm. */
  private stars(count:number) {
    return Array.from({length:count},(_,i)=>{
      const duration=2.2+(i*7%10)*.26;
      return html`<i class=${`star${i%6===0?' bright':''}`} style=${`--sx:${48+(i*37)%50}%;--sy:${4+(i*53)%62}%;--ss:${1.2+(i%4)*.5}px;--st:${duration}s;--sd:${-((i*.73)%duration)}s`}></i>`;
    });
  }
  /** Fog: drifting bands of mist at several depths, instead of clouds. */
  private fog() {
    const bands=this.quality==='low'?3:5;
    return html`${this.phase==='day'||this.phase==='twilight'?html`<div class="fog-sun"></div>`:nothing}
      ${Array.from({length:bands},(_,i)=>html`<div class=${`fog-band depth-${i%3}`} style=${`--fy:${6+i*16}%;--fl:${[-10,18,-25,30,0][i]}%;--fw:${[120,95,140,85,130][i]}%;--fd:${13+i*3}s;--fdelay:${-i*2.7}s;--dir:${i%2?-1:1}`}><svg viewBox="0 0 600 60" preserveAspectRatio="none"><path d="M0 34C60 16 130 20 190 30S330 48 400 32 520 14 600 28V60H0Z"/></svg></div>`)}`;
  }
  /** Six-armed snowflake centred on 0,0: main arms, two pairs of side branches and an inner star. */
  private static flake(r:number):string {
    let d='';
    for(let k=0;k<6;k++){
      const a=k*Math.PI/3,c=Math.cos(a),n=Math.sin(a),p=(t:number)=>[c*t,n*t];
      const [ex,ey]=p(r);d+=`M0 0L${ex.toFixed(1)} ${ey.toFixed(1)}`;
      for(const [t,len] of [[.42,.3],[.68,.22]] as const){
        const [bx,by]=p(r*t);
        for(const side of [-1,1]){const b=a+side*Math.PI/4;d+=`M${bx.toFixed(1)} ${by.toFixed(1)}l${(Math.cos(b)*r*len).toFixed(1)} ${(Math.sin(b)*r*len).toFixed(1)}`;}
      }
      const [ix,iy]=p(r*.24),[jx,jy]=[Math.cos(a+Math.PI/3)*r*.24,Math.sin(a+Math.PI/3)*r*.24];
      d+=`M${ix.toFixed(1)} ${iy.toFixed(1)}L${(Math.cos(a+Math.PI/6)*r*.36).toFixed(1)} ${(Math.sin(a+Math.PI/6)*r*.36).toFixed(1)}L${jx.toFixed(1)} ${jy.toFixed(1)}`;
    }
    return d;
  }
  /** Plane-tree autumn shades: golden, green turning orange, red-brown. The gradient runs from the stem to the tip. */
  private static planeTint(k:number) {
    const stops=[['#d9a531','#e8b84a','#c76a26'],['#8f9e3e','#e29a34','#b5502a'],['#b64a2b','#c9572f','#7f2c1f']][k];
    return svg`<linearGradient id=${`nw-plane-${k}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color=${stops[0]}/><stop offset=".55" stop-color=${stops[1]}/><stop offset="1" stop-color=${stops[2]}/></linearGradient>`;
  }
  /** Winter in the top-right corner: snowflakes of every size gather, glow and sparkle, then fade, on a 16 s cycle. */
  private frostPane() {
    // [x, y, radius, opacity, rotation, delay s] in a 420 × 170 corner
    const flakes=[[372,34,58,.9,8,0],[300,18,34,.75,-12,.8],[404,112,30,.7,20,1.6],[246,52,22,.55,4,2.2],[330,88,18,.6,-6,1.2],[214,16,15,.45,14,2.8],
      [388,158,13,.45,-10,3.2],[270,108,11,.4,0,2],[176,40,12,.35,22,3.6],[140,12,9,.3,-14,4]];
    const bokeh=[[350,70,16],[262,30,10],[396,60,9],[220,78,7]], sparks=[[318,52],[244,10],[402,22],[286,74],[196,58]];
    return html`<svg class="frost-pane" viewBox="0 0 420 170" preserveAspectRatio="xMaxYMin meet" aria-hidden="true">
      <defs><radialGradient id="nw-bokeh"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      ${bokeh.map(([x,y,r],k)=>svg`<circle class="frost-bokeh" fill="url(#nw-bokeh)" cx=${x} cy=${y} r=${r} style=${`--fd:${k*1.1}s`}/>`)}
      ${flakes.map(([x,y,r,o,rot,d])=>svg`<g transform=${`translate(${x} ${y}) rotate(${rot})`}><path class="frost-flake" style=${`--fo:${o};--fd:${d}s;stroke-width:${Math.max(1.2,r*.11)}`} d=${NiakWeatherSky.flake(r)}/></g>`)}
      ${sparks.map(([x,y],k)=>svg`<path class="frost-spark" style=${`--fd:${k*.7}s`} transform=${`translate(${x} ${y})`} d="M0 -6L1.2 -1.2L6 0L1.2 1.2L0 6L-1.2 1.2L-6 0L-1.2 -1.2Z"/>`)}
    </svg>`;
  }
  /** Seasonal touches, layered over the weather: petals, rising heat, falling leaves, winter snowflakes. */
  private seasonal(precip:boolean,storm:boolean,fog:boolean) {
    const few=this.quality==='low';
    // Storms and strong wind carry leaves and petals faster.
    const gusty=storm||['windy','windy-variant'].includes(this.condition)||this.wind>=30;
    const drift=(count:number,art:(i:number)=>unknown)=>Array.from({length:few?2:count},(_,i)=>html`<div class=${`drift${gusty?' drift--gusty':''}`} style=${`--dx:${46+(i*23)%50}%;--dt:${(gusty?5:11)+(i*7)%(gusty?4:7)}s;--dd:${-(i*3.1)%11}s;--rest:${12+(i*29)%70}%;--sw:${2.6+(i%3)*.5}s`}><i>${art(i)}</i></div>`);
    if(this.season==='spring'&&!precip&&!storm&&!fog) return drift(6,i=>html`<svg class=${`petal petal-${i%2}`} viewBox="0 0 12 12"><path d="M6 0C10 3 10 9 6 12C2 9 2 3 6 0Z"/></svg>`);
    // Autumn leaves fly in rain and storms too; only snow and hail hide them.
    if(this.season==='autumn'&&!['snowy','snowy-rainy','hail'].includes(this.condition)) return drift(5,i=>html`<svg class=${`plane plane-${i%3}`} viewBox="0 0 44 44"><defs>${NiakWeatherSky.planeTint(i%3)}</defs>
      <path class="stem" d="M22 30.5Q23 37 21 42.5"/><path class="blade" fill=${`url(#nw-plane-${i%3})`} d="M22 32Q14 34 8 31L4 28.5L7.5 27Q11 25.5 10 22.5L4.5 21L6.5 19.5L1 13L4.5 12.5L3 9Q8 9 10.5 12L11.5 10Q14.5 13 16 16Q15.3 11 16.8 7.6L15.4 6.2L18.8 5.3Q20.8 3.6 22 1Q23.2 3.6 25.2 5.3L28.6 6.2L27.2 7.6Q28.7 11 28 16Q29.5 13 32.5 10L33.5 12Q36 9 41 9L39.5 12.5L43 13L37.5 19.5L39.5 21L34 22.5Q33 25.5 36.5 27L40 28.5L36 31Q30 34 22 32Z"/><path class="veins" d="M22 31V4M22 31Q14 22 3.5 10M22 31Q30 22 40.5 10M22 31Q14 29 5 28.5M22 31Q30 29 39 28.5M22 19L17 13.5M22 19L27 13.5M22 12L19 8.5M22 12L25 8.5M13.5 21.5L8.5 18.5M30.5 21.5L35.5 18.5M10 17L6.5 12.5M34 17L37.5 12.5"/></svg>`);
    if(this.season==='summer'&&this.phase==='day'&&['sunny','partlycloudy'].includes(this.condition)) return html`<div class="heat">${Array.from({length:few?3:7},(_,i)=>html`<div class="heat-plume" style=${`--hx:${47+(i*13)%46}%;--hh:${70+(i*17)%45}px;--hd:${-(i*.9)%4.2}s;--hs:${1.6+(i%3)*.35}s`}><svg viewBox="0 0 24 120" preserveAspectRatio="none"><defs><linearGradient id=${`nw-heat-${i}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" class="heat-stop" stop-opacity="0"/><stop offset=".35" class="heat-stop" stop-opacity=".6"/><stop offset="1" class="heat-stop" stop-opacity="0"/></linearGradient></defs><path stroke=${`url(#nw-heat-${i})`} d="M12 120C4 104 20 92 12 76S4 48 12 32S20 10 12 0"/></svg></div>`)}</div>`;
    if(this.season==='winter') return this.frostPane();
    return nothing;
  }
  protected render() {
    const rain=['rainy','pouring','lightning-rainy','snowy-rainy','hail'].includes(this.condition);
    const snow=['snowy','snowy-rainy','hail'].includes(this.condition);
    const storm=['lightning','lightning-rainy'].includes(this.condition);
    const hail=this.condition==='hail';
    const fog=this.condition==='fog';
    const cloudy=!fog&&!['sunny','clear-night','unknown','exceptional'].includes(this.condition);
    const clearSky=['sunny','clear-night','partlycloudy','windy'].includes(this.condition);
    const windy=['windy','windy-variant'].includes(this.condition);
    const heavy=this.condition==='pouring';
    const low=this.quality==='low';
    const n=low ? 8 : heavy ? 80 : hail ? 18 : rain ? 44 : snow ? 90 : 20;
    const particles=(kind:string,count=n)=>Array.from({length:count},(_,i)=>{
      // Snow has a fourth depth: big flakes in the foreground, one in four (one in two on a lightened sky, so they still show).
      const depth=kind==='snow' ? (low ? [1,3][i%2] : i%4) : i%3;
      // Snow falls straight and slowly, each flake swaying on its own rhythm; far flakes are smaller, paler and slower.
      const duration=kind==='rain' ? (heavy ? .45 : .8)+depth*.22 : kind==='snow' ? [13,10.5,8.5,7][depth]+(i*7%5)*.5 : kind==='hailstone' ? 1.9+(i*37%8)/10 : 3+depth;
      const size=kind==='snow' ? [3,5,7,11][depth] : kind==='hailstone' ? 4+i%3 : 2+depth;
      return html`<i class=${`particle ${kind} depth-${depth}`} style=${`--x:${(i*37+7)%100}%;--delay:${-((i*13)%37)/37*duration}s;--duration:${duration}s;--size:${size}px;--rest:${(i*19+8)%88}%;--drift:${heavy ? -85 : -38}px;--amp:${[4,7,10,14][depth]}px;--sw:${2.6+(i*5%20)/10}s;--dx:${(i%2?1:-1)*(5+(i*5*37+11)%8)}px`}></i>`;
    });
    // Water on the ground: a shimmering film, and splashes (two droplets and a widening ripple) here and there.
    const ground=(count:number)=>html`<div class="wet"></div>${Array.from({length:low?Math.min(count,5):count},(_,i)=>html`<i class="splash" style=${`--x:${4+(i*11*37+11)%92}%;--d:${1.1+(i*37+11)%7/10}s;--dl:-${((i*3*37+11)%150)/100}s`}></i>`)}`;
    return html`<div class=${`scene ${this.phase} ${this.condition}${this.season?` season-${this.season}`:''}`} style=${`--play:${this.animated&&this.visible&&this.pageVisible?'running':'paused'};--cloud-duration:${windy?6:Math.max(11,28-Math.min(Math.max(this.wind,0),60)/2.5)}s`} ?data-still=${!this.animated}>
      <div class="weather-art">${this.condition!=='unknown'&&this.condition!=='exceptional' ? html`
        ${this.phase==='night'&&clearSky?this.stars(this.quality==='low'?8:this.condition==='partlycloudy'?12:24):nothing}
        ${clearSky?(this.phase==='night'?html`<div class="orb moon"><i></i><b></b></div>`:html`<div class="orb sun"><i></i></div>`):nothing}
        ${heavy||storm||hail?html`<div class="overcast"></div>${this.cloud('heavy-left')}${low?nothing:this.cloud('heavy-right')}`
          :cloudy?html`${this.cloud('back')}${this.cloud('front')}${low?nothing:this.cloud('small')}`:nothing}
        ${fog?this.fog():nothing}
        ${this.condition!=='unknown'?this.seasonal(rain||snow,storm,fog):nothing}
        ${rain?particles('rain',hail&&!low?18:n):nothing}${snow?particles(hail?'hailstone':'snow',hail&&!low?30:n):nothing}
        ${rain?ground(heavy?18:hail?8:14):nothing}
        ${this.condition==='snowy'?html`<div class="snowbank"><svg viewBox="0 0 400 20" preserveAspectRatio="none"><defs><linearGradient id="nw-snowbank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#dfe9f4"/></linearGradient></defs>
          <path d="M0 20V11C22 6 40 13 66 9S112 4 140 9 190 14 222 8 276 4 306 10 360 13 400 8V20Z"/></svg>
          ${Array.from({length:low?3:8},(_,i)=>html`<i style=${`--x:${6+(i*13*37+11)%88}%;--dl:-${(i*37+11)%26/10}s`}></i>`)}</div>`:nothing}
        ${windy?html`
          <div class="gust"><svg viewBox="0 0 420 100"><path d="M0 32h270c50 0 50-28 18-28M65 59h290c48 0 50 33 18 33M130 80h90"/></svg></div>
          <div class="gust second"><svg viewBox="0 0 420 100"><path d="M0 28h300c40 0 40-24 15-24M50 58h210c48 0 48 33 17 33"/></svg></div>
          ${Array.from({length:this.quality==='low'?2:5},(_,i)=>html`<div class="leaf-track" style=${`--leaf-top:${28+i*12}%;--leaf-delay:${-i*1.3}s;--leaf-time:${3.8+i*.5}s`}><div class="leaf"><svg viewBox="0 0 28 18"><path d="M2 9C8-2 21 1 27 4C23 17 9 20 2 9Z"/><path d="M0 10 22 6"/></svg></div></div>`)}
        `:nothing}
        ${storm?html`${BOLTS.map((b,i)=>html`<div class=${`bolt b${i+1}`} style=${`animation-delay:${b.delay}s`}><svg viewBox="0 0 120 220"><path d=${b.d}/></svg></div>`)}
          ${BOLTS.map((b,i)=>html`<div class=${`flash f${i+1}`} style=${`animation-delay:${b.delay}s`}></div>`)}`:nothing}
      `:nothing}</div>
    </div>`;
  }
  static styles=css`
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
  `;
}
