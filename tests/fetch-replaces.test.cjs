'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadApp} = require('./harness.cjs');

// The reported failure: a fetch from scratch reported success, the new dates
// appeared in the date list, and the loop stayed silent. Two causes, both of
// them about what a fetch inherits from whatever was loaded before it.
//
//  1. The fetch merged into the loaded records instead of replacing them, so
//     the bundled demo survived. The duet pair is the first two distinct
//     observers in chronological order, the demo is older than anything a
//     capped "most recent N" fetch returns, so A and B stayed "Chris Burwell"
//     and "Lily Kumpe". Every fetched record carries a login as its name,
//     failed observerRole(), and was dropped from the sequencer.
//  2. The demo's 19:00-20:40 Brisbane riff window survived, so records outside
//     it were filtered out even once the pair was right.

// An API record, shaped as inatObsToMothObs leaves it: login in both name
// fields, because the API has no display name to offer.
function apiObs({id, login, iso, sci='Nyctemera amicus', family='Erebidae'}){
 return {
  id: String(id), observedOn: iso.slice(0,10), nightKey: iso.slice(0,10), t: new Date(iso),
  taxon: sci, order: 'Lepidoptera', family, iconic: 'Insecta', imageUrl: '', url: '',
  commonName: '', placeGuess: '', userName: login, userLogin: login,
  ranks: {taxon_class_name:'Insecta', taxon_order_name:'Lepidoptera', taxon_family_name:family,
          scientific_name:sci, common_name:'', taxon_genus_name:sci.split(' ')[0], taxon_species_name:''}
 };
}

// One night of two observers, at 03:00-03:29 UTC = 13:00-13:29 Brisbane:
// deliberately outside the demo's inherited 19:00-20:40 window.
function fetchedNight(){
 const out=[];
 for(let i=0;i<12;i++){
  out.push(apiObs({id:900+i,login:'lily_kumpe',iso:`2026-09-10T03:${String(i).padStart(2,'0')}:00Z`}));
  out.push(apiObs({id:950+i,login:'christopherburwell',iso:`2026-09-10T03:${String(i).padStart(2,'0')}:30Z`}));
 }
 return out;
}

// What the Fetch button does to state once the records are in hand.
function applyFetch(c, incoming){
 const loaded=c.applyFetchedObs(c.state.obs,incoming);
 c.state.obs=loaded.obs;
 c.state.riffStartMin=0;
 c.state.riffEndMin=1439;
 c.state.filterYear='all';
 c.state.nightKey=c.preferredOpeningNight(c.state.obs);
 const pair=c.computeDuetUsers(c.state.obs);
 c.state.userAName=pair[0]||'';
 c.state.userBName=pair[1]||'';
 c.state.nights=c.groupByNight(c.state.obs);
 return loaded;
}

test('a fetch replaces the loaded records rather than joining the demo',()=>{
 const c=loadApp();
 const before=c.state.obs.length;
 assert.ok(before>0,'the demo is loaded at start');
 const incoming=fetchedNight();
 const loaded=applyFetch(c,incoming);
 assert.equal(loaded.replaced,before);
 assert.equal(c.state.obs.length,incoming.length);
 const nights=new Set(Array.from(c.state.obs,o=>o.nightKey));
 assert.deepEqual(Array.from(nights),['2026-09-10'],'no demo night survives');
});

test('the duet pair comes from the fetched observers, not the replaced ones',()=>{
 const c=loadApp();
 applyFetch(c,fetchedNight());
 assert.deepEqual(Array.from(c.computeDuetUsers(c.state.obs)),['lily_kumpe','christopherburwell']);
});

test('the fetched night produces notes in every spacing mode',()=>{
 const c=loadApp();
 applyFetch(c,fetchedNight());
 const base=c.state.nights.get(c.state.nightKey);
 assert.equal(base.length,24);
 for(const mode of ['riff','timeline','song']){
  c.state.spacingMode=mode;
  const events=c.buildSequencer(base).events;
  assert.ok(events.length>=24,`${mode} built ${events.length} events from 24 records`);
  assert.ok(events.some(e=>e.kind==='obs'),`${mode} has observation notes`);
 }
});

test('the demo riff window does not survive a fetch and silence a daytime night',()=>{
 const c=loadApp();
 // The pre-fix state: demo window inherited, records at 13:00 Brisbane.
 assert.equal(c.state.riffStartMin,19*60);
 assert.equal(c.state.riffEndMin,20*60+40);
 applyFetch(c,fetchedNight());
 assert.equal(c.state.riffStartMin,0);
 assert.equal(c.state.riffEndMin,1439);
 c.state.spacingMode='riff';
 assert.ok(c.buildSequencer(c.state.nights.get(c.state.nightKey)).events.length>0);
});

test('the selected date leaves a date only the replaced records reached',()=>{
 const c=loadApp();
 c.state.nightKey='2026-01-28'; // the demo night, valid before the fetch
 applyFetch(c,fetchedNight().concat([apiObs({id:800,login:'lily_kumpe',iso:'2026-08-01T03:00:00Z'})]));
 assert.equal(c.state.nightKey,'2026-09-10');
});

// Lily's choice: a fresh dataset opens on the newest night both people worked
// at length, not on tonight's first solitary arrival. The real case is a fetch
// run in the evening, where the newest night holds one record so far.
test('a fresh fetch opens on the newest shared night, not on a night of one record',()=>{
 const c=loadApp();
 const incoming=[];
 for(let i=0;i<12;i++){
  incoming.push(apiObs({id:700+i,login:'lily_kumpe',iso:`2026-09-08T03:${String(i).padStart(2,'0')}:00Z`}));
  incoming.push(apiObs({id:750+i,login:'christopherburwell',iso:`2026-09-08T03:${String(i).padStart(2,'0')}:30Z`}));
 }
 // Tonight: one arrival so far, and a middle night too short to count.
 incoming.push(apiObs({id:800,login:'lily_kumpe',iso:'2026-09-10T09:00:00Z'}));
 for(let i=0;i<4;i++) incoming.push(apiObs({id:810+i,login:'christopherburwell',iso:`2026-09-09T09:0${i}:00Z`}));

 applyFetch(c,incoming);
 assert.equal(c.state.nightKey,'2026-09-08','the 24-record night both people worked');
 const seq=c.buildSequencer(c.state.nights.get(c.state.nightKey));
 assert.ok(seq.events.length>=24,'the opening night plays');
 // The other dates are still there to choose.
 assert.deepEqual(Array.from(c.state.nights.keys()).sort(),['2026-09-08','2026-09-09','2026-09-10']);
});

test('with no shared night at all, the fetch still opens on the newest night it has',()=>{
 const c=loadApp();
 const solo=[];
 for(let i=0;i<5;i++) solo.push(apiObs({id:600+i,login:'lily_kumpe',iso:`2026-09-08T03:0${i}:00Z`}));
 solo.push(apiObs({id:610,login:'lily_kumpe',iso:'2026-09-11T03:00:00Z'}));
 applyFetch(c,solo);
 assert.equal(c.state.nightKey,'2026-09-11');
 // Arrivals, not events: Moth Orchestra also lays a harmonic ground, which is
 // authorship and belongs to no record.
 assert.equal(c.buildSequencer(c.state.nights.get('2026-09-11')).events
   .filter(e=>e.kind==='obs').length,1);
});

test('the shared-date rule needs both a second observer and twenty records',()=>{
 const c=loadApp();
 const both=[],oneShort=[],soloLong=[];
 for(let i=0;i<10;i++){
  both.push(apiObs({id:1+i,login:'a',iso:`2026-09-08T03:${String(i).padStart(2,'0')}:00Z`}));
  both.push(apiObs({id:100+i,login:'b',iso:`2026-09-08T03:${String(i).padStart(2,'0')}:30Z`}));
 }
 for(let i=0;i<19;i++) soloLong.push(apiObs({id:200+i,login:'a',iso:`2026-09-08T03:${String(i).padStart(2,'0')}:00Z`}));
 oneShort.push(...both.slice(0,19));
 assert.equal(c.isSharedDate(both),true,'20 records, two observers');
 assert.equal(c.isSharedDate(oneShort),false,'19 records is one short');
 assert.equal(c.isSharedDate(soloLong.concat(soloLong)),false,'one observer, however long');
 assert.equal(c.isSharedDate([]),false);
 assert.equal(c.isSharedDate(null),false);
});

// A year chosen for the replaced dataset must not survive to hide the new one.
test('a fetch clears a year filter left over from the replaced dataset',()=>{
 const c=loadApp();
 c.state.filterYear='2024';
 applyFetch(c,fetchedNight());
 assert.equal(c.state.filterYear,'all');
 assert.equal(c.state.nightKey,'2026-09-10');
});

test('the shared minutes of a fetched night are genuine and present',()=>{
 const c=loadApp();
 applyFetch(c,fetchedNight());
 c.state.spacingMode='timeline';
 const shared=c.buildSequencer(c.state.nights.get(c.state.nightKey)).meta.sharedMinutes;
 assert.equal(shared.length,12,'each minute holds one record from each observer');
 for(const m of shared){
  assert.ok(m.observations.A.length&&m.observations.B.length);
 }
});

test('a display name already held is carried onto the login it belongs to',()=>{
 const c=loadApp();
 // An iNaturalist CSV export: display name and login in separate columns.
 c.state.obs=c.parseCSVText([
  'id,user_name,user_login,scientific_name,observed_on,time_observed_at,taxon_class_name,taxon_order_name,taxon_family_name',
  '1,Lily Kumpe,lily_kumpe,Agape chloropyga,2026-09-08,2026-09-08T11:00:01Z,Insecta,Lepidoptera,Erebidae'
 ].join('\n'));
 applyFetch(c,fetchedNight());
 const names=new Set(Array.from(c.state.obs,o=>o.userName));
 assert.ok(names.has('Lily Kumpe'),'the known login keeps its display name');
 assert.ok(names.has('christopherburwell'),'an unknown login stands as its login');
 assert.equal(c.state.obs.length,24,'the CSV records themselves are still replaced');
});

test('a single-observer fetch plays as a solo, with no duet gestures invented',()=>{
 const c=loadApp();
 const solo=fetchedNight().filter(o=>o.userLogin==='lily_kumpe');
 applyFetch(c,solo);
 assert.equal(c.state.userAName,'lily_kumpe');
 assert.equal(c.state.userBName,'');
 c.state.spacingMode='timeline';
 const seq=c.buildSequencer(c.state.nights.get(c.state.nightKey));
 assert.equal(seq.events.filter(e=>e.kind==='obs').length,12);
 assert.equal(seq.events.filter(e=>e.isSpecial).length,0);
 assert.equal(seq.events.filter(e=>e.kind!=='obs'&&e.kind!=='moth_ground').length,0,
  'a solo invents no gesture; the ground is harmony and is not one');
 assert.deepEqual(Array.from(seq.meta.sharedMinutes),[]);
});

test('applyFetchedObs drops untimed and unidentified rows and keeps observation order',()=>{
 const c=loadApp();
 const r=c.applyFetchedObs([],[
  apiObs({id:3,login:'lily_kumpe',iso:'2026-09-10T03:02:00Z'}),
  apiObs({id:1,login:'lily_kumpe',iso:'2026-09-10T03:00:00Z'}),
  Object.assign(apiObs({id:2,login:'lily_kumpe',iso:'2026-09-10T03:01:00Z'}),{t:null}),
  Object.assign(apiObs({id:'',login:'lily_kumpe',iso:'2026-09-10T03:03:00Z'}),{id:''}),
  null
 ]);
 assert.deepEqual(Array.from(r.obs,o=>o.id),['1','3']);
 assert.equal(r.replaced,0);
});

test('a re-fetch of the same records is idempotent',()=>{
 const c=loadApp();
 applyFetch(c,fetchedNight());
 const first=c.state.obs.length;
 applyFetch(c,fetchedNight());
 assert.equal(c.state.obs.length,first);
 assert.deepEqual(Array.from(c.computeDuetUsers(c.state.obs)),['lily_kumpe','christopherburwell']);
});

// The tests above exercise the pure function and the state rules. This one
// runs the real button handler, with the network stubbed, so the handler
// itself cannot drift away from them.
test('the actual Fetch handler replaces, reframes and sequences the fetched night',async()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const start=html.indexOf('  const INAT_API = ');
 const end=html.indexOf('\n  // ── Top up: add only what has happened since the loaded records end ──');
 assert.ok(start>0&&end>start,'the iNaturalist block boundaries must be findable');

 const c=loadApp();
 const before=c.state.obs.length;

 // The evening case, as the API returns it: a shared night of 24 records at
 // 03:00-03:11 UTC = 13:00-13:11 Brisbane (outside the demo window the pre-fix
 // handler left in place), and tonight, holding one arrival so far.
 const apiRow=(id,login,iso)=>({
  id, uri:`https://www.inaturalist.org/observations/${id}`,
  observed_on:iso.slice(0,10), time_observed_at:iso,
  user:{login}, place_guess:'Mount Nebo, QLD', photos:[],
  taxon:{id:1,name:'Nyctemera amicus',rank:'species',preferred_common_name:'Magpie Moth',
         iconic_taxon_name:'Insecta',
         ancestors:[{rank:'kingdom',name:'Animalia'},{rank:'phylum',name:'Arthropoda'},
                    {rank:'class',name:'Insecta'},{rank:'order',name:'Lepidoptera'},
                    {rank:'family',name:'Erebidae'},{rank:'genus',name:'Nyctemera'}]}
 });
 const results=[apiRow(999,'lily_kumpe','2026-09-11T09:30:00Z')];
 for(let i=0;i<12;i++){
  results.push(apiRow(900+i,'lily_kumpe',`2026-09-10T03:${String(i).padStart(2,'0')}:00Z`));
  results.push(apiRow(950+i,'christopherburwell',`2026-09-10T03:${String(i).padStart(2,'0')}:30Z`));
 }

 // Stubs: one page of observations, no second page, no taxon top-up needed.
 const calls=[];
 c.fetch=async(url)=>{calls.push(String(url));return{ok:true,status:200,
  async json(){return String(url).includes('/taxa')
   ? {results:[]}
   : {total_results:results.length,total_pages:1,page:1,results};}};};
 c.navigator={userAgent:'node',platform:'node',maxTouchPoints:0};

 const status={textContent:''};
 const els={inatUsers:{value:'lily_kumpe,christopherburwell',addEventListener(){}},
            inatStatus:status,
            inatFetchBtn:{disabled:false,addEventListener(t,fn){this._fn=fn;}},
            inatTopUpBtn:{disabled:false,addEventListener(){}},
            inatTotals:{textContent:''},
            inatCap:{value:'1000'}};
 c.document.getElementById=(id)=>els[id]||{addEventListener(){},style:{},value:'',textContent:''};
 c.$=(id)=>c.document.getElementById(id);
 c.clearSelection=()=>{};
 c.hardResetPlayback=()=>{};
 c.rebuildDerived=()=>{
  const pair=c.computeDuetUsers(c.state.obs);
  Object.assign(c.state,{userAName:pair[0]||'',userBName:pair[1]||''});
  c.state.nights=c.groupByNight(c.state.obs);
  const keys=Array.from(c.state.nights.keys()).sort((a,b)=>(a<b?1:-1));
  if(!keys.includes(c.state.nightKey)) c.state.nightKey=keys[0]||'';
  c.state.nightObs=c.state.nights.get(c.state.nightKey)||[];
  // The status line reports what the date list offers, so the stub must build
  // that list with the real rule rather than leave it unset.
  c.state.offeredNightKeys=c.offerableNightKeys(keys,c.state.nights,c.state.nightKey);
  c.state.sequencer=c.buildSequencer(c.state.nightObs);
 };

 vm.runInContext(html.slice(start,end),c);
 await els.inatFetchBtn._fn();

 assert.ok(calls.some(u=>u.includes('user_id=lily_kumpe%2Cchristopherburwell')),
  'both usernames go to the API in one query');
 assert.equal(c.state.obs.length,25,'the demo is replaced, not joined');
 assert.notEqual(before,25);
 assert.equal(c.state.riffStartMin,0);
 assert.equal(c.state.riffEndMin,1439);
 assert.equal(c.state.filterYear,'all');
 assert.equal(c.state.nightKey,'2026-09-10','opens on the shared night, not on tonight\'s single arrival');
 assert.deepEqual(Array.from(c.computeDuetUsers(c.state.obs)),['lily_kumpe','christopherburwell']);
 const notes=c.state.sequencer.events.filter(e=>e.kind==='obs').length;
 assert.equal(notes,24,`the loop holds every record of the opening night (got ${notes})`);
 assert.equal(c.state.sequencer.meta.sharedMinutes.length,12);
 // What is now loaded, then what it cost. Not the archive it came from.
 assert.match(status.textContent,/^Fetched 25 observations across 2 nights\./);
 assert.match(status.textContent,/previously loaded observations were replaced/);
 assert.equal(/of 24,000|total_results|raise Cap for more/.test(status.textContent),false,
  'an uncapped fetch quotes no archive total and offers no cap advice');
 assert.match(status.textContent,/Showing 2026-09-10 \(24 records\)/);
 assert.match(status.textContent,/Riff window reset/);
 assert.equal(els.inatFetchBtn.disabled,false,'the button is released again');
});

// The case Lily reported: a cap of 1,000 against an archive of 24,000. The old
// line said "the most recent 1,000 of 24,000", which is true about iNaturalist
// and says nothing about what is now loaded and playable.
test('a capped fetch reports its own slice, never the archive behind it',async()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const start=html.indexOf('  const INAT_API = ');
 const end=html.indexOf('\n  // ── Top up: add only what has happened since the loaded records end ──');
 const c=loadApp();

 const apiRow=(id,login,iso)=>({
  id, uri:`https://www.inaturalist.org/observations/${id}`,
  observed_on:iso.slice(0,10), time_observed_at:iso,
  user:{login}, place_guess:'Mount Nebo, QLD', photos:[],
  taxon:{id:1,name:'Nyctemera amicus',rank:'species',preferred_common_name:'Magpie Moth',
         iconic_taxon_name:'Insecta',
         ancestors:[{rank:'class',name:'Insecta'},{rank:'order',name:'Lepidoptera'},
                    {rank:'family',name:'Erebidae'},{rank:'genus',name:'Nyctemera'}]}});
 // Forty records over two nights; the cap stops the fetch at forty, and the
 // archive claims twenty-four thousand more.
 const results=[];
 for(let i=0;i<20;i++){
  results.push(apiRow(100+i,'lily_kumpe',`2026-09-10T03:${String(i).padStart(2,'0')}:00Z`));
  results.push(apiRow(200+i,'lily_kumpe',`2026-09-09T03:${String(i).padStart(2,'0')}:00Z`));
 }
 const progress=[];
 c.fetch=async(url)=>{return{ok:true,status:200,async json(){
   return String(url).includes('/taxa')?{results:[]}
     :{total_results:24000,total_pages:600,page:1,results};}};};
 c.navigator={userAgent:'node',platform:'node',maxTouchPoints:0};
 const status={get textContent(){return this._t||'';},set textContent(v){this._t=v;progress.push(v);}};
 const els={inatUsers:{value:'lily_kumpe',addEventListener(){}},inatStatus:status,
            inatFetchBtn:{disabled:false,addEventListener(t,fn){this._fn=fn;}},
            inatTopUpBtn:{disabled:false,addEventListener(){}},
            inatTotals:{textContent:''},inatCap:{value:'40'}};
 c.document.getElementById=(id)=>els[id]||{addEventListener(){},style:{},value:'',textContent:''};
 c.$=(id)=>c.document.getElementById(id);
 c.clearSelection=()=>{};c.hardResetPlayback=()=>{};
 c.rebuildDerived=()=>{
  c.state.nights=c.groupByNight(c.state.obs);
  const keys=Array.from(c.state.nights.keys()).sort((a,b)=>(a<b?1:-1));
  if(!keys.includes(c.state.nightKey)) c.state.nightKey=keys[0]||'';
  c.state.nightObs=c.state.nights.get(c.state.nightKey)||[];
  c.state.offeredNightKeys=c.offerableNightKeys(keys,c.state.nights,c.state.nightKey);
  c.state.sequencer=c.buildSequencer(c.state.nightObs);
 };
 vm.runInContext(html.slice(start,end),c);
 await els.inatFetchBtn._fn();

 const line=status.textContent;
 assert.match(line,/^Fetched 40 observations across 2 nights\./,'what is now loaded');
 assert.match(line,/That is the most recent 40, your cap — raise Cap for more\./,
  'it still says plainly that this is a slice');
 assert.equal(/24,000|24000/.test(line),false,'and never says how much more exists');
 assert.equal(/of 24,000/.test(progress.join(' ')),false,
  'nor does the line shown while it runs');
 assert.ok(progress.some(p=>/of up to 40 observations/.test(p)),
  'progress counts against the cap, which is what this fetch will return');
});
