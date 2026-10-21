import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const temp=await mkdtemp(join(tmpdir(),'niak-weather-'));
await build({entryPoints:['model.ts'],bundle:true,platform:'node',format:'esm',outfile:join(temp,'model.mjs')});
const {provenance,grouped,enabledKeys,entityLine,sameSet,extensionGroups}=await import(pathToFileURL(join(temp,'model.mjs')));
after(()=>rm(temp,{recursive:true,force:true}));
const sensor=(id,state='1')=>({id,name:id,state,available:true,missing:false});

test('what Niak proposes on top of the saved settings shows as proposed, until it is touched',()=>{
 const saved={temperature_entity:'sensor.a'};
 assert.equal(provenance('temperature_entity','sensor.a',saved,new Set()),'');
 assert.match(provenance('humidity_entity','sensor.h',saved,new Set()),/Proposé par Niak/);
 assert.equal(provenance('humidity_entity','sensor.h',saved,new Set(['humidity_entity'])),'');
 assert.equal(provenance('humidity_entity','sensor.h',undefined,new Set()),'');  // a new place: everything is proposed
});

test('recognised sensors come first, in their own group, only when there are others too',()=>{
 const groups=grouped({options:[sensor('sensor.a'),sensor('sensor.b')],recognized:['sensor.b']});
 assert.deepEqual(groups.map(g=>[g.label,g.options.map(o=>o.id)]),[['Reconnus',['sensor.b']],['Autres capteurs',['sensor.a']]]);
 assert.deepEqual(grouped({options:[sensor('sensor.a')],recognized:['sensor.a']}).map(g=>g.label),['']);
});

test('the entities switched on, and a sensor line that says when it is gone',()=>{
 const view={entities:{new:false,families:[{key:'f',name:'F',entities:[{key:'a',enabled:true},{key:'b',enabled:false}]}]}};
 assert.deepEqual(enabledKeys(view),['a']);
 assert.deepEqual(enabledKeys({entities:{new:true,families:[]}}),[]);
 assert.equal(entityLine({id:'sensor.x',name:'x',state:'',available:false,missing:true}),'sensor.x · introuvable');
 assert.equal(entityLine(sensor('sensor.t','14 °C')),'14 °C · sensor.t');
 assert.ok(sameSet(['a','b'],['b','a'])&&!sameSet(['a'],['a','b']));
});


test('extensions group by use and Atmo keeps separate air and pollen configuration and destinations',()=>{
 const shared={installed:true,configured:true,stage:2,field:'',description:'',name:'Atmo France'};
 const groups=extensionGroups([{...shared,id:'atmo',air_configured:true,pollen_configured:false},{...shared,id:'waqi'},
  {...shared,id:'polleninformation',stage:3},{...shared,id:'vigieau',stage:6},{...shared,id:'blitzortung',stage:6}]);
 assert.deepEqual(groups.map(g=>g.label),['Qualité de l’air','Pollens','Eau et jardin','Orages et éclairs']);
 assert.equal(groups[0].items[0].configured,true);
 assert.equal(groups[1].items[0].configured,false);
 assert.equal(groups[1].items[0].stage,3);
 assert.notEqual(groups[0].items[0].id,groups[1].items[0].id);
});
