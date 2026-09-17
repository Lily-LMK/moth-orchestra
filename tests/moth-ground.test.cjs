'use strict';
// The ground: Moth Orchestra's warm sustained background.
//
// Lily, 17 September 2026, on what she meant by a touch of Gondwana: "a warm
// sustained organ-like background, and barely audible wordless vocal textures.
// Maybe slow harmonic movement, open chord voicings, lingering notes."
//
// It is authorship, and the rule this file exists to hold is that it is
// authorship *grown from the night* rather than a preset. This project already
// has five ambience presets and has wanted them gone for weeks, because they
// are decoration laid over a night rather than anything the night produced.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, loadAppWithDom } = require('./harness.cjs');
const { settings } = require('./score.cjs');

function nightOf(csv, key, extra = {}) {
  const c = loadAppWithDom();
  Object.assign(c.state, settings, { spacingMode: 'timeline', voiceMode: 'emergence',
    toneBy: 'taxon_species_name', filterYear: 'all', ...extra });
  c.importCSVData(csv);
  if (key) c.state.nightKey = key;
  c.rebuildDerived();
  return c;
}
const ground = c => c.state.sequencer.events.filter(e => e.kind === 'moth_ground');
const demo = extra => nightOf(loadApp().DEMO_CSV, null, extra);

test('the ground sounds, and only for Emergence', () => {
  assert.ok(ground(demo()).length > 0, 'Emergence lays a ground');
  // Moth Orchestra above all: Lily asked for it to be left exactly as it was.
  for (const voiceMode of ['mixed', 'gondwana', 'lantern', 'choir', 'steelpan', 'night'])
    assert.equal(ground(demo({ voiceMode })).length, 0, `${voiceMode} does not`);
});

test('it is harmony, not a record: no glow, no thumbnail, no arrival', () => {
  for (const e of ground(demo())) {
    assert.equal(e.obs, null, 'it carries no observation');
    assert.equal(e.isSpecial, false, 'it is not a duet gesture');
    assert.equal(e.isEcho, false);
    assert.equal(e.derived, true, 'and it is marked as derived');
    assert.notEqual(e.kind, 'obs', 'so no arrival is invented');
  }
});

test('the harmony is the night\'s own pitches, not a key or a preset', () => {
  const c = demo();
  const arrivals = c.state.sequencer.events.filter(e => e.kind === 'obs');
  const nightClasses = new Set(arrivals.map(e => ((e.midi % 12) + 12) % 12));
  for (const chord of ground(c))
    for (const midi of chord.groundMidis)
      assert.ok(nightClasses.has(((midi % 12) + 12) % 12),
        `${midi} is a pitch class this night actually contains`);
});

test('two different nights cannot sound alike unless they hold the same creatures', () => {
  // The condition PLAN-NEXT-FAMILY.md set for the gallery floor, and the one
  // the ambience presets could not meet.
  const fs = require('node:fs'), path = require('node:path');
  const csvPath = path.join(__dirname, '..', '..', 'two-backyards-iNaturalist.csv');
  if (!fs.existsSync(csvPath)) return; // the export is not in the repository
  const csv = fs.readFileSync(csvPath, 'utf8');
  const sparse = ground(nightOf(csv, '2026-02-17')).map(e => e.groundMidis.join(','));
  const dense = ground(nightOf(csv, '2026-09-03')).map(e => e.groundMidis.join(','));
  assert.ok(sparse.length && dense.length, 'both nights are voiced');
  assert.notDeepEqual(sparse, dense, '17 February and 3 September do not sound alike');
});

test('the voicing is open: nothing closer than a fifth', () => {
  const c = loadApp();
  const gap = c.MOTH_GROUND.minGapSemitones;
  for (const pcs of [[0,1,2],[0,4,7],[11,0,1],[3,3,3],[0,6],[5]]) {
    const midis = c.mothGroundVoicing(pcs);
    for (let i = 1; i < midis.length; i++)
      assert.ok(midis[i] - midis[i-1] >= gap,
        `${midis.join(',')} keeps a fifth between neighbours`);
    for (const m of midis)
      assert.ok(m >= c.MOTH_GROUND.lowMidi &&
                m <= c.MOTH_GROUND.lowMidi + c.MOTH_GROUND.spanMidi,
        `${m} stays inside the ground's own register`);
  }
});

test('it moves slowly, and a chord that does not change is held rather than restruck', () => {
  const c = demo();
  const chords = ground(c);
  assert.ok(chords.length <= c.MOTH_GROUND.sections, 'never more changes than sections');
  for (let i = 1; i < chords.length; i++) {
    assert.ok(chords[i].atSec > chords[i-1].atSec, 'in order');
    assert.notEqual(chords[i].groundMidis.join(','), chords[i-1].groundMidis.join(','),
      'a repeat is a hold, not a new swell');
  }
  const total = chords.reduce((n, e) => n + e.holdSec, 0);
  assert.ok(Math.abs(total - c.state.loopLen) < 0.01, 'and together they cover the loop');
});

test('a night with nothing to say voices nothing at all', () => {
  const c = loadApp();
  assert.equal(c.mothGroundEvents([], 19, 'D', 'pentatonic').length, 0);
  assert.equal(c.mothGroundEvents([{ kind:'obs' }], 19, 'D', 'pentatonic').length, 0,
    'an arrival with no pitch is nothing to voice');
});

test('MOTH_GROUND.on is the one flag that parks it', () => {
  const c = demo();
  assert.ok(ground(c).length > 0);
  c.MOTH_GROUND.on = false;
  c.rebuildDerived();
  assert.equal(ground(c).length, 0, 'parked, with its rule and its tests intact');
});

test('it stays behind the arrivals', () => {
  const c = loadApp();
  // Arrivals are scheduled between about 0.12 and 0.65 before the volume
  // control; the ground must sit well under the quietest of them.
  assert.ok(c.MOTH_GROUND.level < 0.12, `level ${c.MOTH_GROUND.level}`);
  assert.ok(c.MOTH_GROUND.voice < c.MOTH_GROUND.level / 2,
    'and the wordless texture is barely there, as asked');
  assert.ok(c.MOTH_GROUND.attackSec > 0.8, 'it swells rather than strikes');
  assert.ok(c.MOTH_GROUND.releaseSec > 2, 'and lingers into what follows');
});

test('the ground leaves no visual trace, the same way the pedal does not', () => {
  const fs = require('node:fs'), path = require('node:path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  // Both the live player and the offline renderer must take the ground out of
  // the stream before anything that draws sees it. `gond_pedal` established
  // that shape; a ground that fell through would paint an arrival for a chord
  // that belongs to no record.
  const branches = html.split('e.kind === "moth_ground"').length - 1;
  assert.ok(branches >= 2, `handled in both scheduling paths (found ${branches})`);
  for (const site of ['scheduleThumbGlow', 'scheduleSelectionOverlay']) {
    const before = html.slice(0, html.indexOf(`      ${site}(e, tEvent);`));
    const guard = before.lastIndexOf('e.kind === "moth_ground"');
    const loop = before.lastIndexOf('e.kind === "gond_pedal"');
    assert.ok(guard > 0 && guard > loop - 400,
      `${site} is reached only after the ground has continued out of the loop`);
  }
});

test('an arrival is still an arrival: the ground adds none and removes none', () => {
  const c = demo();
  const arrivals = c.state.sequencer.events.filter(e => e.kind === 'obs');
  const ids = new Set(arrivals.map(e => e.obs.id));
  assert.equal(ids.size, arrivals.length, 'one event per record, still');
  c.MOTH_GROUND.on = false;
  c.rebuildDerived();
  const without = c.state.sequencer.events.filter(e => e.kind === 'obs');
  assert.equal(without.length, arrivals.length, 'and the same number either way');
});
