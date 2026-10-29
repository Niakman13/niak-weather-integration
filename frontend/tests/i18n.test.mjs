// Weather's panel in English: every French text given to t() or fr() in panel.ts and model.ts has its English words
// (in i18n-en.ts, or in the hub's dictionary), the dictionary keeps no word nothing shows, and a translation keeps the
// same {names} as its French.
import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {build} from 'esbuild';

const root=fileURLToPath(new URL('../',import.meta.url));
const temp=mkdtempSync(join(tmpdir(),'hestia-weather-i18n-'));
after(()=>rmSync(temp,{recursive:true,force:true}));
// One bundle, so that model.ts and the test share the same language.
writeFileSync(join(temp,'entry.ts'),[`export * from ${JSON.stringify(join(root,'model.ts'))};`,
 `export {setLanguage,addDictionary} from ${JSON.stringify(join(root,'socle/i18n.ts'))};`,
 `export {SOCLE_EN} from ${JSON.stringify(join(root,'socle/i18n-en.ts'))};`,`export {PANEL_EN} from ${JSON.stringify(join(root,'i18n-en.ts'))};`].join('\n'));
await build({entryPoints:[join(temp,'entry.ts')],bundle:true,platform:'node',format:'esm',outfile:join(temp,'entry.mjs'),logLevel:'silent'});
const m=await import(pathToFileURL(join(temp,'entry.mjs')).href);
const {PANEL_EN,SOCLE_EN}=m;

/** The French literals given to t() and fr(): both sides of a ternary, never a template string. */
function frenchTexts(source){
 const found=[],call=/\b(?:t|fr)\(/g;
 for(let x=call.exec(source);x;x=call.exec(source)){
  let depth=0,i=x.index+x[0].length;
  for(;i<source.length;i++){const c=source[i];
   if(c==="'"||c==='"'){let j=i+1,text='';while(source[j]!==c){if(source[j]==='\\')j++;text+=source[j++];}found.push(text);i=j;}
   else if(c==='`')break;else if('([{'.includes(c))depth++;else if(')]}'.includes(c)){if(!depth--)break;}else if(c===','&&!depth)break;}
 }
 return found;
}
const texts=new Set(['panel.ts','model.ts'].flatMap(f=>frenchTexts(readFileSync(join(root,f),'utf8'))).filter(Boolean));
const names=text=>[...text.matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort().join();

test('the panel has English words for every French text it shows',()=>{
 assert.ok(texts.size>180);
 assert.deepEqual([...texts].filter(x=>!(x in PANEL_EN)&&!(x in SOCLE_EN)),[]);
});
test('the panel’s dictionary keeps no word nothing shows, nor one the hub already has',()=>{
 assert.deepEqual(Object.keys(PANEL_EN).filter(x=>!texts.has(x)||x in SOCLE_EN),[]);
});
test('a translation keeps the same {names} as its French',()=>{
 assert.deepEqual(Object.entries(PANEL_EN).filter(([french,english])=>names(french)!==names(english)).map(([french])=>french),[]);
});
test('the steps and the sensor groups follow the language, French staying the source',()=>{
 m.addDictionary('en',PANEL_EN);
 m.setLanguage('en');
 try{
  assert.deepEqual(m.grouped({options:[{id:'a'},{id:'b'}],recognized:['a']}).map(g=>g.label),['Recognised','Other sensors']);
  assert.equal(m.entityLine({id:'sensor.x',missing:true}),'sensor.x · not found');
 }finally{m.setLanguage('fr');}
 assert.equal(m.entityLine({id:'sensor.x',missing:true}),'sensor.x · introuvable');
});
