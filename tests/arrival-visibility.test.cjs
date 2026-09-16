'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadApp} = require('./harness.cjs');

// Fetch, Import CSV and Top up all reported success and then left the app
// showing something else. The three paths differ in what they mean, but they
// share one obligation: land the person where the records they just asked for
// actually are.
//
// The CSV case is not hypothetical. 28 January 2026 — the bundled demo's night
// — is a real night in Lily's own export, 49 records of it. So importing 6,794
// records spanning 2020-2026 left rebuildDerived's "is the selected date still
// valid?" check satisfied, and the app sat on January with 428 dates listed.

function apiObs({id, login, iso, sci='Nyctemera amicus', family='Erebidae'}){
 return {
  id: String(id), observedOn: iso.slice(0,10), nightKey: iso.slice(0,10), t: new Date(iso),
  taxon: sci, order: 'Lepidoptera', family, iconic: 'Insecta', imageUrl: '', url: '',
  commonName: '', placeGuess: '', userName: login, userLogin: login,
  ranks: {taxon_class_name:'Insecta', taxon_order_name:'Lepidoptera', taxon_family_name:family,
          scientific_name:sci, common_name:'', taxon_genus_name:sci.split(' ')[0], taxon_species_name:''}
 };
}

// A CSV in iNaturalist's export shape: display name and login in separate
// columns, spanning several dates including the demo's own night.
function exportCsv(){
 const head='id,user_name,user_login,scientific_name,observed_on,time_observed_at,taxon_class_name,taxon_order_name,taxon_family_name';
 const rows=[head];
 const night=(date,base)=>{
  for(let i=0;i<12;i++){
   rows.push(`${base+i},Lily Kumpe,lily_kumpe,Agape chloropyga,${date},${date}T03:${String(i).padStart(2,'0')}:00Z,Insecta,Lepidoptera,Erebidae`);
   rows.push(`${base+50+i},Chris Burwell,christopherburwell,Utetheisa pulchelloides,${date},${date}T03:${String(i).padStart(2,'0')}:30Z,Insecta,Lepidoptera,Erebidae`);
  }
 };
 night('2026-01-28',1000);  // the demo's night, genuinely present in the export
 night('2026-09-12',2000);  // where the export actually ends
 return rows.join('\n');
}

/* ───────────────────────── Import CSV ───────────────────────── */

test('an import leaves the demo night even though the export contains it',()=>{
 const c=loadApp();
 c.state.nightKey='2026-01-28';
 const status={textContent:''};
 c.document.getElementById=()=>status;
 c.importCSVData(exportCsv());
 // The bug this guards: 2026-01-28 stays valid, so the old check never fired.
 assert.ok(Array.from(c.groupByNight(c.state.obs).keys()).includes('2026-01-28'),
  'the demo night really is in the export; that is what made the date stick');
 assert.equal(c.state.nightKey,'2026-09-12','the import must still move to where the data ends');
});

test('an import resets window, year filter and date together',()=>{
 const c=loadApp();
 Object.assign(c.state,{filterYear:'2024',nightKey:'2026-01-28'});
 c.document.getElementById=()=>({textContent:''});
 c.importCSVData(exportCsv());
 assert.equal(c.state.riffStartMin,0);
 assert.equal(c.state.riffEndMin,1439);
 assert.equal(c.state.filterYear,'all');
 assert.equal(c.state.nightKey,'2026-09-12');
});

test('the import status line is written to an element that exists in the page',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 // Removed by the interface rebuild while the code kept writing to it, which
 // made every CSV import silent.
 assert.match(html,/id="csvImportStatus"/,'the status element must be in the markup');
 const panel=html.slice(html.indexOf('<summary>Import</summary>'),html.indexOf('<summary>Export</summary>'));
 assert.match(panel,/id="csvImportStatus"/,'and in the Import panel, beside the button it reports on');
});

test('the import status names the counts, the chosen night and the window',()=>{
 const c=loadApp();
 const status={textContent:''};
 c.document.getElementById=()=>status;
 c.importCSVData(exportCsv()+'\n9999,Lily Kumpe,lily_kumpe,Test moth,2026-09-12,,Insecta,Lepidoptera,');
 // The line leads with what is now loaded and playable, not with what the
 // file held and not with an archive elsewhere. See loadedSentence.
 assert.match(status.textContent,/Imported 48 observations across \d+ nights/);
 assert.match(status.textContent,/1 row had no usable observation time or date/);
 assert.match(status.textContent,/Showing 2026-09-12 \(24 records\)/);
 assert.match(status.textContent,/Riff window reset/);
});

test('an imported dataset plays on the night it opens on',()=>{
 const c=loadApp();
 c.document.getElementById=()=>({textContent:''});
 c.importCSVData(exportCsv());
 const pair=c.computeDuetUsers(c.state.obs);
 Object.assign(c.state,{userAName:pair[0],userBName:pair[1]});
 const base=c.groupByNight(c.state.obs).get(c.state.nightKey);
 for(const mode of ['riff','timeline','song']){
  c.state.spacingMode=mode;
  assert.ok(c.buildSequencer(base).events.length>=24,`${mode} plays the opening night`);
 }
});

/* ───────────────────────── Top up ───────────────────────── */

test('mergeTopUp reports the nights it added, newest first, and ignores refreshes',()=>{
 const c=loadApp();
 c.document.getElementById=()=>({textContent:''});
 c.importCSVData(exportCsv());
 const held=c.state.obs;
 const r=c.mergeTopUp(held,[
  apiObs({id:'2000',login:'lily_kumpe',iso:'2026-09-12T03:00:00Z',sci:'Corrected name'}), // refresh
  apiObs({id:'7001',login:'lily_kumpe',iso:'2026-09-14T09:00:00Z'}),
  apiObs({id:'7002',login:'lily_kumpe',iso:'2026-09-16T09:00:00Z'}),
  apiObs({id:'7003',login:'christopherburwell',iso:'2026-09-13T09:00:00Z'})
 ]);
 assert.equal(r.added,3);
 assert.equal(r.refreshed,1);
 assert.deepEqual(Array.from(r.addedNights),['2026-09-16','2026-09-14','2026-09-13'],
  'newest first, and 2026-09-12 is absent because it was refreshed, not added');
});

test('a top-up that only refreshes has no arrival and reports none',()=>{
 const c=loadApp();
 c.document.getElementById=()=>({textContent:''});
 c.importCSVData(exportCsv());
 const r=c.mergeTopUp(c.state.obs,[apiObs({id:'2000',login:'lily_kumpe',iso:'2026-09-12T03:00:00Z',sci:'Corrected name'})]);
 assert.equal(r.added,0);
 assert.equal(r.refreshed,1);
 assert.deepEqual(Array.from(r.addedNights),[]);
});

test('an empty top-up adds no nights',()=>{
 const c=loadApp();
 assert.deepEqual(Array.from(c.mergeTopUp([],[]).addedNights),[]);
 assert.deepEqual(Array.from(c.mergeTopUp(null,null).addedNights),[]);
});

// The real Top up button, against a stubbed API, on the real import.
// `before` runs after the import and before the click, so each test varies one
// thing about the state the button is pressed in.
async function runTopUp(before, opts){
 const nights=(opts&&opts.nights)||['2026-09-13','2026-09-14','2026-09-15','2026-09-16'];
 const soloLast=!!(opts&&opts.soloLast);
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const start=html.indexOf('  const INAT_API = ');
 const end=html.indexOf('\n  refreshTopUpBtn();\n\n  // export ZIP');
 assert.ok(start>0&&end>start,'the iNaturalist block boundaries must be findable');

 const c=loadApp();
 c.document.getElementById=()=>({textContent:''});
 c.importCSVData(exportCsv());
 assert.equal(c.state.nightKey,'2026-09-12','the import opens where the export ends');

 // The API answers each observer's since-query with four newer nights.
 const apiRow=(id,login,iso)=>({
  id, uri:'', observed_on:iso.slice(0,10), time_observed_at:iso, user:{login},
  place_guess:'', photos:[],
  taxon:{id:1,name:'Nyctemera amicus',rank:'species',preferred_common_name:'Magpie Moth',
         iconic_taxon_name:'Insecta',
         ancestors:[{rank:'class',name:'Insecta'},{rank:'order',name:'Lepidoptera'},
                    {rank:'family',name:'Erebidae'},{rank:'genus',name:'Nyctemera'}]}
 });
 const asked=[];
 c.fetch=async(url)=>{
  const u=String(url); asked.push(u);
  if(u.includes('/taxa')) return {ok:true,status:200,async json(){return{results:[]};}};
  const login=/user_id=([^&]+)/.exec(u)[1];
  const rows=[];
  for(const d of nights){
   // soloLast: only one observer reaches the final night, as on a night still
   // in progress.
   if(soloLast && d===nights[nights.length-1] && login!=='lily_kumpe') continue;
   rows.push(apiRow(`${login}-${d}`,login,`${d}T09:00:00Z`));
  }
  return {ok:true,status:200,async json(){return{total_results:rows.length,total_pages:1,page:1,results:rows};}};
 };
 c.navigator={userAgent:'node',platform:'node',maxTouchPoints:0};

 const status={textContent:''};
 const els={inatUsers:{value:'',addEventListener(){}},inatStatus:status,
            inatFetchBtn:{disabled:false,addEventListener(){}},
            inatTopUpBtn:{disabled:false,addEventListener(t,fn){this._fn=fn;}},
            inatTotals:{textContent:''},inatCap:{value:'1000'}};
 c.document.getElementById=(id)=>els[id]||{addEventListener(){},style:{},value:'',textContent:''};
 c.$=(id)=>c.document.getElementById(id);
 c.clearSelection=()=>{};c.hardResetPlayback=()=>{};
 c.rebuildDerived=()=>{
  const pair=c.computeDuetUsers(c.state.obs);
  Object.assign(c.state,{userAName:pair[0]||'',userBName:pair[1]||''});
  c.state.nights=c.groupByNight(c.state.obs);
  const keys=Array.from(c.state.nights.keys()).filter(k=>
   c.state.filterYear==='all'||k.slice(0,4)===c.state.filterYear).sort((a,b)=>(a<b?1:-1));
  if(!keys.includes(c.state.nightKey)) c.state.nightKey=keys[0]||'';
  c.state.nightObs=c.state.nights.get(c.state.nightKey)||[];
  c.state.sequencer=c.buildSequencer(c.state.nightObs);
 };
 c._sleep=()=>Promise.resolve();

 vm.runInContext(html.slice(start,end),c);
 if(before) before(c);
 await els.inatTopUpBtn._fn();
 return {ctx:c, status, asked, els};
}

test('the actual Top up handler lands on the newest night it brought in',async()=>{
 const {ctx,status,asked,els}=await runTopUp();
 assert.ok(asked.some(u=>u.includes('d1=')),'the since-filter is used');
 assert.equal(ctx.state.nightKey,'2026-09-16','lands on the newest night that arrived');
 assert.equal(ctx.state.nightObs.length,2,'both observers arrived that night');
 assert.ok(ctx.state.sequencer.events.length>=2,'and it plays');
 assert.match(status.textContent,/Showing 2026-09-16, the newest night that arrived across 4 nights \(2 records\)/);
 // A top-up extends a dataset already framed: the window is deliberately kept.
 assert.equal(ctx.state.riffStartMin,0);
 assert.equal(ctx.state.riffEndMin,1439);
 assert.equal(els.inatFetchBtn.disabled,false);
});

test('a year filter that would hide the arrival is cleared rather than silently winning',async()=>{
 const status=await runTopUp(c=>{ c.state.filterYear='2025'; });
 assert.equal(status.ctx.state.filterYear,'all','the filter that would hide 2026-09-16 is dropped');
 assert.equal(status.ctx.state.nightKey,'2026-09-16');
});

test('a year filter that does not conflict with the arrival is left alone',async()=>{
 const status=await runTopUp(c=>{ c.state.filterYear='2026'; });
 assert.equal(status.ctx.state.filterYear,'2026','a filter the arrival satisfies is the user\'s framing');
 assert.equal(status.ctx.state.nightKey,'2026-09-16');
});

test('a single record is reported as one record, not "1 records"',()=>{
 const c=loadApp();
 assert.equal(c.recordCount(1),'1 record');
 assert.equal(c.recordCount(0),'0 records');
 assert.equal(c.recordCount(2),'2 records');
 assert.equal(c.recordCount(6794),'6,794 records');
 assert.equal(c.recordCount(null),'0 records');
});

test('a top-up whose newest arrival is a single record says so in the singular',async()=>{
 // The real evening case: tonight has one observation so far.
 const {ctx,status}=await runTopUp(null,{nights:['2026-09-13','2026-09-16'],soloLast:true});
 assert.equal(ctx.state.nightKey,'2026-09-16');
 assert.match(status.textContent,/the newest night that arrived across 2 nights \(1 record\)\./);
});
