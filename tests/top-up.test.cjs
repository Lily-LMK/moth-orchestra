'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadApp} = require('./harness.cjs');

// A CSV export as iNaturalist writes one: display name and login in separate
// columns. Lily's records end a week after Chris's, which is the case a single
// global cutoff would get wrong.
const CSV = [
 'id,user_name,user_login,scientific_name,observed_on,time_observed_at,taxon_class_name,taxon_order_name,taxon_family_name',
 '101,Lily Kumpe,lily_kumpe,Agape chloropyga,2026-09-08,2026-09-08T11:00:01Z,Insecta,Lepidoptera,Erebidae',
 '102,Chris Burwell,christopherburwell,Agape chloropyga,2026-09-08,2026-09-08T11:00:59Z,Insecta,Lepidoptera,Erebidae',
 '103,Lily Kumpe,lily_kumpe,Utetheisa pulchelloides,2026-09-15,2026-09-15T12:30:00Z,Insecta,Lepidoptera,Erebidae'
].join('\n');

// An API record, shaped as inatObsToMothObs leaves it: login in both fields,
// because the API has no display name to offer.
function apiObs(c, {id, login, iso, sci='Nyctemera amicus', family='Erebidae'}){
 const t = new Date(iso);
 return {
  id: String(id), observedOn: iso.slice(0,10), nightKey: iso.slice(0,10), t,
  taxon: sci, order: 'Lepidoptera', family, iconic: 'Insecta', imageUrl: '', url: '',
  commonName: '', placeGuess: '', userName: login, userLogin: login,
  ranks: {taxon_class_name:'Insecta', taxon_order_name:'Lepidoptera', taxon_family_name:family,
          scientific_name:sci, common_name:'', taxon_genus_name:sci.split(' ')[0], taxon_species_name:''}
 };
}

test('each observer is topped up from its own cutoff, not a global one',()=>{
 const c=loadApp();
 const plan=Array.from(c.planTopUp(c.parseCSVText(CSV),{overlapDays:2}));
 assert.equal(plan.length,2);
 const byLogin=Object.fromEntries(plan.map(p=>[p.login,p]));
 // Chris's newest record is a week older; his cutoff must reflect that.
 assert.equal(byLogin.lily_kumpe.latest.toISOString(),'2026-09-15T12:30:00.000Z');
 assert.equal(byLogin.christopherburwell.latest.toISOString(),'2026-09-08T11:00:59.000Z');
 assert.notEqual(byLogin.lily_kumpe.sinceDate,byLogin.christopherburwell.sinceDate);
});

test('the cutoff sits before the newest record held, so a part-imported night is not lost',()=>{
 const c=loadApp();
 for(const p of Array.from(c.planTopUp(c.parseCSVText(CSV),{overlapDays:2}))){
  assert.ok(p.since.getTime() < p.latest.getTime(),'overlap must reach back');
  assert.equal(Math.round((p.latest-p.since)/86400000),2);
 }
});

test('the display name survives a top-up; the observer does not split in two',()=>{
 const c=loadApp();
 const held=c.parseCSVText(CSV);
 const incoming=[apiObs(c,{id:104,login:'lily_kumpe',iso:'2026-09-20T11:15:00Z'}),
                 apiObs(c,{id:105,login:'christopherburwell',iso:'2026-09-20T11:15:30Z'})];
 const r=c.mergeTopUp(held,incoming);
 assert.equal(r.added,2);
 assert.equal(r.refreshed,0);
 const names=new Set(Array.from(r.obs,o=>o.userName));
 assert.deepEqual(Array.from(names).sort(),['Chris Burwell','Lily Kumpe']);
 assert.deepEqual(Array.from(r.newObservers),[]);
});

test('re-fetched overlap records refresh in place rather than duplicating',()=>{
 const c=loadApp();
 const held=c.parseCSVText(CSV);
 // id 103 is already held; the API returns it again with a corrected identification.
 const incoming=[apiObs(c,{id:103,login:'lily_kumpe',iso:'2026-09-15T12:30:00Z',sci:'Utetheisa lotrix',family:'Erebidae'})];
 const r=c.mergeTopUp(held,incoming);
 assert.equal(r.added,0);
 assert.equal(r.refreshed,1);
 assert.equal(r.obs.length,3,'the overlap must not duplicate the record');
 const row=Array.from(r.obs).find(o=>o.id==='103');
 assert.equal(row.taxon,'Utetheisa lotrix','identification corrections arrive');
 assert.equal(row.userName,'Lily Kumpe','identity is taken from the record already held');
});

test('an observer not already present is added and reported rather than absorbed',()=>{
 const c=loadApp();
 const r=c.mergeTopUp(c.parseCSVText(CSV),[apiObs(c,{id:106,login:'a_stranger',iso:'2026-09-21T11:00:00Z'})]);
 assert.deepEqual(Array.from(r.newObservers),['a_stranger']);
 assert.equal(Array.from(r.obs).find(o=>o.id==='106').userName,'a_stranger');
});

test('a top-up that brings nothing new leaves the score untouched',()=>{
 const c=loadApp();
 const held=c.parseCSVText(CSV);
 const pair=c.computeDuetUsers(held);
 Object.assign(c.state,{userAName:pair[0],userBName:pair[1],spacingMode:'timeline'});
 const before=c.buildSequencer(held).meta.sharedMinutes.length;
 const r=c.mergeTopUp(held,[]);
 assert.equal(r.added,0);assert.equal(r.refreshed,0);
 assert.equal(c.buildSequencer(r.obs).meta.sharedMinutes.length,before);
});

test('a top-up preserves the genuine shared minute the CSV already held',()=>{
 const c=loadApp();
 const held=c.parseCSVText(CSV);
 // 101 and 102 fall in the same minute: one genuine shared minute.
 const r=c.mergeTopUp(held,[apiObs(c,{id:107,login:'lily_kumpe',iso:'2026-09-22T11:00:00Z'})]);
 const pair=c.computeDuetUsers(r.obs);
 Object.assign(c.state,{userAName:pair[0],userBName:pair[1],spacingMode:'timeline',
                        filterYear:'all',nightKey:'2026-09-08'});
 assert.deepEqual(Array.from(pair),['Lily Kumpe','Chris Burwell']);
 const shared=c.buildSequencer(Array.from(r.obs).filter(o=>o.nightKey==='2026-09-08')).meta.sharedMinutes;
 assert.equal(shared.length,1);
});

test('merged records stay in observation order',()=>{
 const c=loadApp();
 const r=c.mergeTopUp(c.parseCSVText(CSV),[
  apiObs(c,{id:108,login:'lily_kumpe',iso:'2026-09-10T11:00:00Z'}),
  apiObs(c,{id:109,login:'lily_kumpe',iso:'2026-09-09T11:00:00Z'})]);
 const times=Array.from(r.obs,o=>o.t.getTime());
 assert.deepEqual(times,Array.from(times).sort((a,b)=>a-b));
});

test('records without a login cannot be topped up and are reported as such',()=>{
 const c=loadApp();
 // The bundled demo carries display names only.
 assert.deepEqual(Array.from(c.planTopUp(c.parseCSVText(c.DEMO_CSV))),[]);
 assert.deepEqual(Array.from(c.planTopUp([])),[]);
 assert.deepEqual(Array.from(c.planTopUp(null)),[]);
});

test('a record with no timestamp cannot set a cutoff',()=>{
 const c=loadApp();
 const plan=Array.from(c.planTopUp([{id:'1',userLogin:'lily_kumpe',userName:'Lily Kumpe',t:null}]));
 assert.deepEqual(plan,[]);
});
