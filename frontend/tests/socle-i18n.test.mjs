// The hub in English (socle): every French text given to t() or fr() in shell.ts and ui.ts has its English words, and
// the dictionary keeps no word nothing shows. Copied into each brick as frontend/tests/socle-i18n.test.mjs.
import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {build} from 'esbuild';

const socle=fileURLToPath(new URL('../socle/',import.meta.url));
const temp=mkdtempSync(join(tmpdir(),'hestia-i18n-'));
after(()=>rmSync(temp,{recursive:true,force:true}));
await build({entryPoints:[join(socle,'i18n.ts'),join(socle,'i18n-en.ts')],bundle:true,platform:'node',format:'esm',outdir:temp,outExtension:{'.js':'.mjs'},logLevel:'silent'});
const {t,setLanguage}=await import(pathToFileURL(join(temp,'i18n.mjs')).href);
const {SOCLE_EN}=await import(pathToFileURL(join(temp,'i18n-en.mjs')).href);

/** The French literals given to t() and fr(): both sides of a ternary, never a template string. */
function frenchTexts(source){
 const found=[],call=/\b(?:t|fr)\(/g;
 for(let m=call.exec(source);m;m=call.exec(source)){
  let depth=0,i=m.index+m[0].length;
  for(;i<source.length;i++){const c=source[i];
   if(c==="'"||c==='"'){let j=i+1,text='';while(source[j]!==c){if(source[j]==='\\')j++;text+=source[j++];}found.push(text);i=j;}
   else if(c==='`')break;else if('([{'.includes(c))depth++;else if(')]}'.includes(c)){if(!depth--)break;}else if(c===','&&!depth)break;}
 }
 return found;
}
const texts=new Set(['shell.ts','ui.ts'].flatMap(f=>frenchTexts(readFileSync(join(socle,f),'utf8'))).filter(Boolean));
// Sent by the bricks' Python (names, tabs, the catalogue's pitches), translated by the hub where shown.
const fromBricks=['Météo','Confort','Hestia Confort','Hestia Weather','La météo de votre station : prévisions, alertes, qualité de l’air et pollens.',
 'Le confort de chaque pièce et le bon moment pour ouvrir, fermer ou aérer.'];

test('the hub has English words for every French text it shows',()=>{
 assert.ok(texts.size>40);
 assert.deepEqual([...texts].filter(x=>!(x in SOCLE_EN)),[]);
});
test('the dictionary keeps no word nothing shows',()=>{
 assert.deepEqual(Object.keys(SOCLE_EN).filter(x=>!texts.has(x)&&!fromBricks.includes(x)),[]);
});
test('the language follows Home Assistant, English for a language without its words',()=>{
 setLanguage('en');assert.equal(t('Ouvrir {tab}',{tab:'Weather'}),'Open Weather');
 setLanguage('nl');assert.equal(t('Réglages'),'Settings');
 setLanguage('fr');assert.equal(t('Réglages'),'Réglages');
});
