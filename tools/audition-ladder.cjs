const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const RANKS = ['taxon_class_name','taxon_order_name','taxon_superfamily_name','taxon_family_name','taxon_subfamily_name','taxon_tribe_name','taxon_genus_name','taxon_species_name'];
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage();
  await p.goto('file://' + path.resolve('index.html'));
  const csv = fs.readFileSync('data.csv','utf8');
  const out = await p.evaluate(({csv, ranks}) => {
    importCSVData(csv);
    Object.assign(state, { seed:1, spacingMode:'timeline', listenMode:'both', loopLen:19,
      scaleName:'pentatonic', keyName:'D', filterYear:'all', filterSeason:'all', riffStartMin:0, riffEndMin:1439 });
    state.nightKey = '2026-09-03';
    const rows = [];
    for (const toneBy of ranks) {
      const row = { rank: toneBy.replace('taxon_','').replace('_name','') };
      for (const voiceMode of ['mixed','gondwana']) {
        Object.assign(state, { toneBy, voiceMode });
        rebuildDerived();
        const obs = state.sequencer.events.filter(e => e.kind === 'obs');
        row[voiceMode] = { instruments: new Set(obs.map(e=>e.instrument)).size,
          pitches: new Set(obs.map(e=>e.midi)).size, groups: state.sequencer.meta.voiceList.length };
      }
      rows.push(row);
    }
    // Which voices appear only at species rank, and when.
    Object.assign(state, { toneBy:'taxon_species_name', voiceMode:'gondwana' }); rebuildDerived();
    const gSpecies = state.sequencer.events.filter(e=>e.kind==='obs');
    Object.assign(state, { toneBy:'taxon_genus_name' }); rebuildDerived();
    const gGenus = new Set(state.sequencer.events.filter(e=>e.kind==='obs').map(e=>e.instrument));
    Object.assign(state, { toneBy:'taxon_species_name', voiceMode:'mixed' }); rebuildDerived();
    const mSpecies = state.sequencer.events.filter(e=>e.kind==='obs');
    Object.assign(state, { toneBy:'taxon_genus_name' }); rebuildDerived();
    const mGenus = new Set(state.sequencer.events.filter(e=>e.kind==='obs').map(e=>e.instrument));
    const newAt = (evts, prior) => {
      const names = [...new Set(evts.map(e=>e.instrument))].filter(n=>!prior.has(n));
      return names.map(n => ({ name:n, notes: evts.filter(e=>e.instrument===n).length,
        at: evts.filter(e=>e.instrument===n).map(e=>+e.atSec.toFixed(2)) }));
    };
    return { rows, gondwanaSpeciesOnly: newAt(gSpecies, gGenus), mixedSpeciesOnly: newAt(mSpecies, mGenus) };
  }, { csv, ranks: RANKS });
  fs.writeFileSync('ladder.json', JSON.stringify(out, null, 2));
  console.log('rank        mixed(instr/pitch)  gondwana(instr/pitch)  groups');
  for (const r of out.rows) console.log(r.rank.padEnd(12), String(r.mixed.instruments).padStart(3)+' /'+String(r.mixed.pitches).padStart(3), '          ', String(r.gondwana.instruments).padStart(3)+' /'+String(r.gondwana.pitches).padStart(3), '        ', r.mixed.groups);
  console.log('\nspecies-only, Gondwana:', JSON.stringify(out.gondwanaSpeciesOnly.map(v=>[v.name,v.notes])));
  console.log('species-only, Moth Orchestra:', JSON.stringify(out.mixedSpeciesOnly.map(v=>[v.name,v.notes])));
  await b.close();
})();
