'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadApp} = require('./harness.cjs');
const csv = 'id,user_login,scientific_name,observed_on,time_observed_at,taxon_class_name,taxon_order_name,taxon_family_name\n1,alice,Agape chloropyga,2026-09-08,2026-09-08T11:00:01Z,Insecta,Lepidoptera,Erebidae\n2,bob,Agape chloropyga,2026-09-08,2026-09-08T11:00:59Z,Insecta,Lepidoptera,Erebidae';
test('CSV usernames without display names retain both observers',()=>{
 const c=loadApp();const obs=c.parseCSVText(csv);
 assert.deepEqual(Array.from(c.computeDuetUsers(obs)),['alice','bob']);
});
test('new CSV clears the demo Riff window before sequencing shared arrivals',()=>{
 const c=loadApp(); c.importCSVData(csv);
 const pair=c.computeDuetUsers(c.state.obs);
 Object.assign(c.state,{userAName:pair[0],userBName:pair[1]});
 const seq=c.buildSequencer(c.state.obs);
 assert.equal(seq.meta.sharedMinutes.length,1);
 assert.equal(seq.events.filter(e=>e.kind==='duet_minute').length,1);
 assert.equal(c.state.riffStartMin,0);assert.equal(c.state.riffEndMin,1439);
});
test('missing family never masquerades as a species-level voice',()=>{
 const c=loadApp();c.state.toneBy='taxon_family_name';
 const obs=c.parseCSVText(csv)[0];obs.ranks.taxon_family_name='';obs.family='';
 assert.equal(c.toneKeyForObs(obs),'Unknown family · order: Lepidoptera');
});
test('same rank shares fill and instrument across observers; rank change changes grouping',()=>{
 const c=loadApp(); const obs=c.parseCSVText(csv.replace('user_login','user_name'));
 Object.assign(c.state,{userAName:'alice',userBName:'bob',spacingMode:'timeline',toneBy:'taxon_family_name'});
 const e=c.buildSequencer(obs).events.filter(e=>e.obs);
 assert.equal(e[0].color,e[1].color);assert.equal(e[0].instrument,e[1].instrument);
 assert.equal(e[0].voiceKey,'Erebidae');
 c.state.toneBy='taxon_order_name';assert.equal(c.buildSequencer(obs).events.find(e=>e.obs).voiceKey,'Lepidoptera');
});
for(const method of ['picker','drop']) test(`${method}: actual import handler rebuilds the new full-window score`,async()=>{
 const fs=require('node:fs'), vm=require('node:vm');
 const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 const marker=method==='picker'?'  $("csvFile").addEventListener("change",':'  window.addEventListener("drop",';
 const start=html.indexOf(marker), end=html.indexOf('\n  });',start)+6;
 const c=loadApp(); let handler;
 c.document.getElementById=()=>({addEventListener:(type,fn)=>handler=fn});
 c.window.addEventListener=(type,fn)=>handler=fn;
 c.clearSelection=()=>{};c.hardResetPlayback=()=>{};c.refreshTopUpBtn=()=>{};
 c.rebuildDerived=()=>{const pair=c.computeDuetUsers(c.state.obs);Object.assign(c.state,{userAName:pair[0],userBName:pair[1]});c.state.sequencer=c.buildSequencer(c.state.obs);};
 vm.runInContext(html.slice(start,end),c);
 const file={name:'arrivals.csv',text:async()=>csv};
 await handler({target:{files:[file],value:'file'},dataTransfer:{files:[file]},preventDefault(){}});
 assert.equal(c.state.sequencer.meta.sharedMinutes.length,1);
 assert.equal(c.state.sequencer.events.filter(e=>e.obs).length,2);
});
test('import reports omitted rows and preserves explicit solo and musical choices',()=>{
 const c=loadApp();const status={};c.document.getElementById=()=>status;
 Object.assign(c.state,{listenMode:'B',seed:42,toneBy:'taxon_family_name'});
 c.importCSVData(csv+'\n3,alice,Test moth,2026-09-08,,Insecta,Lepidoptera,');
 assert.equal(c.state.obs.length,2);
 assert.match(status.textContent,/1 row had no usable observation time or date/);
 assert.equal(c.state.listenMode,'B');assert.equal(c.state.seed,42);assert.equal(c.state.toneBy,'taxon_family_name');
});
// This test must name the thing it forbids; that is the only mention left
// outside the dated session notes. The application file carries none.
test('the application contains no GBIF reference of any kind',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const hits=html.split('\n').map((l,i)=>[i+1,l]).filter(([,l])=>/gbif/i.test(l));
 assert.deepEqual(hits,[],'no GBIF reference may remain, in code, markup or comment');
 const c=loadApp();
 assert.equal(typeof c.enrichCommonNamesGbif,'undefined');
 assert.equal(typeof c.enrichCommonNames,'undefined');
});
test('the import panel offers only Fetch, Top up, Import CSV and Load demo',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const panel=html.slice(html.indexOf('<summary>Import</summary>'),html.indexOf('<summary>Export</summary>'));
 const ids=Array.from(panel.matchAll(/<button[^>]*id="([^"]+)"/g),m=>m[1]).sort();
 assert.deepEqual(ids,['inatFetchBtn','inatTopUpBtn','loadDemoBtn']);
 assert.equal(/gbif/i.test(panel),false);
});
test('a record iNaturalist has no common name for keeps its scientific name and no invented one',()=>{
 const c=loadApp();
 const o=c.parseCSVText('id,user_login,scientific_name,observed_on,time_observed_at,taxon_family_name,common_name\n9,alice,Hypochrysops ignitus,2026-09-08,2026-09-08T11:00:01Z,Lycaenidae,')[0];
 assert.equal(o.commonName,'');
 assert.equal(o.ranks.common_name,'');
 assert.equal(o.taxon,'Hypochrysops ignitus');
});
test('observer identity and display name are carried separately from a CSV',()=>{
 const c=loadApp();
 const rows='id,user_name,user_login,scientific_name,observed_on,time_observed_at\n'+
  '1,Lily Kumpe,lily_kumpe,Agape chloropyga,2026-09-08,2026-09-08T11:00:01Z\n'+
  '2,Chris Burwell,christopherburwell,Agape chloropyga,2026-09-08,2026-09-08T11:00:59Z';
 const obs=c.parseCSVText(rows);
 assert.deepEqual(Array.from(obs,o=>o.userName),['Lily Kumpe','Chris Burwell']);
 assert.deepEqual(Array.from(obs,o=>o.userLogin),['lily_kumpe','christopherburwell']);
 // Display names still decide the duet, so existing scores are unaffected.
 assert.deepEqual(Array.from(c.computeDuetUsers(obs)),['Lily Kumpe','Chris Burwell']);
});
test('the bundled demo has no logins and still resolves two observers',()=>{
 const c=loadApp();const obs=c.parseCSVText(c.DEMO_CSV);
 assert.deepEqual(Array.from(obs,o=>o.userLogin).filter(Boolean),[]);
 assert.equal(c.computeDuetUsers(obs).length,2);
});
