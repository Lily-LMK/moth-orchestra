'use strict';
// Emergence — the gallery floor. The room a night is heard in.
//
// Lily, 18 September 2026, after hearing the three spines: *"spine B is best,
// but the ambience track doesn't stop when the music stops. It keeps playing in
// the background. On second thought, we drop all ambience tracks. We make
// Emergence for the gallery floor. Start anew. Keep the best of what we've
// learned and the direction I provided."*
//
// Her direction: *"sounds of life, insect-sounds, wing-beats, influences of
// East Forest and Thievery Corporation. Olafur. A woman who made this believes
// in 'reverence for life'. She reads Mary Oliver. Precious life. Rich life.
// Gallery floor. Opening, opening. And yet deep time and forest and canopy."*
//
// She chose the spine WITHOUT the flutter and WITHOUT the added strata — the
// patient half. So the insect-sound returns as grain rather than as a pulse on
// the bus, and the canopy returns as the band opening rather than as layers.
//
// Two rules this file exists to hold:
//
//   1. **It stops when the music stops.** The bug she found by ear. Every
//      preset had it; nothing but listening caught it.
//   2. **Two nights must not sound alike.** The condition PLAN-NEXT-FAMILY.md
//      set for the floor, and the one the presets could not meet. Spine B was
//      the weakest of the three at this, so its own gestures now carry it.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, loadAppWithDom } = require('./harness.cjs');
const { settings } = require('./score.cjs');

function audioProbe(sampleRate = 48000) {
  const automation = [], nodes = [];
  const param = (name) => ({
    value: 0,
    setValueAtTime(v, t) { automation.push({ name, kind: 'set', value: v, at: t }); return this; },
    linearRampToValueAtTime(v, t) { automation.push({ name, kind: 'lin', value: v, at: t }); return this; },
    exponentialRampToValueAtTime(v, t) { automation.push({ name, kind: 'exp', value: v, at: t }); return this; },
    setTargetAtTime(v, t) { automation.push({ name, kind: 'target', value: v, at: t }); return this; }
  });
  const node = (extra) => {
    const n = { connect() {}, disconnect() { n.disconnected = true; }, ...extra };
    nodes.push(n); return n;
  };
  const ctx = {
    sampleRate, currentTime: 0, automation, nodes,
    createGain: () => node({ gain: param('gain') }),
    createOscillator: () => node({ source: true, type: 'sine',
      frequency: param('frequency'), detune: param('detune'),
      start(t) { this.started = t; }, stop(t) { this.stopped = t; this.stopCalled = true; } }),
    createBufferSource: () => node({ source: true, buffer: null, loop: false,
      playbackRate: param('playbackRate'),
      start(t) { this.started = t; this.startCalled = true; },
      stop(t) { this.stopped = t; this.stopCalled = true; } }),
    createDelay: () => node({ delayTime: param('delayTime') }),
    createBiquadFilter: () => node({ type: '', frequency: param('cutoff'), Q: param('cutoffQ'),
      gain: param('filterGain'), detune: param('filterDetune') }),
    createStereoPanner: () => node({ pan: param('pan') }),
    createBuffer: (ch, len) => ({ numberOfChannels: ch, length: len,
      getChannelData: () => new Float32Array(len) }),
    destination: node({})
  };
  return ctx;
}

const csvPath = path.join(__dirname, '..', '..', 'two-backyards-iNaturalist.csv');
const haveExport = fs.existsSync(csvPath);

function nightOf(csv, key, extra = {}) {
  const c = loadAppWithDom();
  Object.assign(c.state, settings, { spacingMode: 'timeline', voiceMode: 'gondwana',
    toneBy: 'taxon_species_name', filterYear: 'all', ...extra });
  c.importCSVData(csv);
  c.rebuildDerived();
  if (key) { c.state.nightKey = key; c.rebuildDerived(); }
  return c;
}
const shapeOf = c => c.emergenceNightShape(c.state.sequencer.events, c.state.loopLen);

function fakeNight(gaps, classes = ['Insecta'], midis = [60, 64, 67]) {
  const events = [];
  let at = 0;
  for (let i = 0; i < gaps.length; i++) {
    at += gaps[i];
    events.push({ kind: 'obs', atSec: at, midi: midis[i % midis.length], density: 1,
      obs: { ranks: { taxon_class_name: classes[i % classes.length] } } });
  }
  return events;
}
const sparse = (c, n = 10) => c.emergenceNightShape(fakeNight(Array(n).fill(1.6)), 19);
const dense = (c, n = 130) => c.emergenceNightShape(fakeNight(Array(n).fill(0.14)), 19);

// ── The bug she found by ear ────────────────────────────────────────────────

test('it stops when the music stops', () => {
  // "the ambience track doesn't stop when the music stops. It keeps playing in
  // the background." Every preset had this. Only listening caught it.
  const c = loadApp();
  const ctx = audioProbe();
  // The probe's destination and the gain we hand in are not the room's to
  // release; everything the room itself built is.
  const out = ctx.createGain();
  const room = c.buildEmergence(ctx, out, sparse(c), 1);
  assert.ok(room && typeof room.stop === 'function', 'the room can be told to stop');
  room.stop();
  for (const n of ctx.nodes.filter(n => n !== ctx.destination && n !== out && !n.source))
    assert.ok(n.disconnected, 'every node it built is released');
  for (const s of ctx.nodes.filter(n => n.source))
    assert.ok(s.stopCalled, 'and every source is stopped, not left running');
});

// ── What it reads from the night ────────────────────────────────────────────

test('it reads the night, and reads only the arrivals', () => {
  const c = loadApp();
  const s = c.emergenceNightShape(fakeNight([1, 1, 2, 2, 4, 4], ['Insecta', 'Aves']), 19);
  assert.equal(s.arrivals, 6);
  assert.equal(s.medianGapSec, 2, 'median of 1,2,2,4,4');
  assert.equal(s.classCount, 2);

  const withAuthored = fakeNight([1, 1, 1, 1]).concat([
    { kind: 'gond_pedal', atSec: 5, midi: 40 },
    { kind: 'obs', atSec: 7, midi: 62, isSpecial: true, obs: { ranks: {} } }
  ]);
  assert.deepEqual(c.emergenceNightShape(withAuthored, 19),
                   c.emergenceNightShape(fakeNight([1, 1, 1, 1]), 19),
                   'a room grown from authorship would be decoration over decoration');
});

test('a night with nothing to say is answered with silence', () => {
  const c = loadApp();
  assert.equal(c.emergenceNightShape([], 19).arrivals, 0);
  assert.equal(c.buildEmergence(audioProbe(), null, c.emergenceNightShape([], 19), 1), null);
});

// ── Breath — East Forest's patience, at the night's own rate ────────────────

test('a sparse night breathes slower than a dense one', () => {
  const c = loadApp();
  const a = c.emergenceBreathSec(sparse(c)), b = c.emergenceBreathSec(dense(c));
  assert.ok(a > b * 1.5, `sparse ${a.toFixed(1)}s against dense ${b.toFixed(1)}s`);
});

test('the breath clamp never fires on a real night', { skip: !haveExport && 'export not present' }, () => {
  // A clamp that fires on real data is not a safety net, it is a flattening.
  const c = nightOf(fs.readFileSync(csvPath, 'utf8'), null);
  const keys = c.offerableNightKeys([...c.state.nights.keys()], c.state.nights, '');
  assert.ok(keys.length > 100, 'the whole archive, not a sample');
  for (const k of keys) {
    c.state.nightKey = k; c.rebuildDerived();
    const s = shapeOf(c);
    if (!s.arrivals) continue;
    const raw = c.EMERGENCE.breathBaseSec + c.EMERGENCE.breathPerGapSec * s.medianGapSec;
    assert.ok(raw >= c.EMERGENCE.breathMinSec && raw <= c.EMERGENCE.breathMaxSec,
      `${k} breathes at ${raw.toFixed(1)}s, inside the range without clamping`);
  }
});

// ── The felt piano — the reverence, and the night's clearest voice ──────────

test('a sparse night is given more room between notes than a dense one', () => {
  // Spine B separated two nights 3.5x less than the others. In B the piano is
  // the main event, so this is where the night has to become audible.
  const c = loadApp();
  const a = c.emergencePianoNotes(sparse(c), 1, 600);
  const b = c.emergencePianoNotes(dense(c), 1, 600);
  assert.ok(b.length > a.length * 1.4,
    `dense places ${b.length} notes where sparse places ${a.length}`);
});

test('the piano plays only pitches the night itself holds', () => {
  const c = loadApp();
  const shape = c.emergenceNightShape(fakeNight(Array(12).fill(1), ['Insecta'], [60, 65, 70]), 19);
  const held = new Set(shape.pitchClasses);
  const notes = c.emergencePianoNotes(shape, 1, 400);
  assert.ok(notes.length > 0, 'it speaks');
  for (const n of notes)
    assert.ok(held.has(((n.midi % 12) + 12) % 12), `${n.midi} is the night's own pitch class`);
});

test('it never hurries and never disappears', () => {
  const c = loadApp();
  for (const shape of [sparse(c), dense(c)]) {
    const notes = c.emergencePianoNotes(shape, 5, 600);
    for (let i = 1; i < notes.length; i++) {
      const gap = notes[i].atSec - notes[i - 1].atSec;
      // The bounds are clamped exactly, so compare with a float tolerance
      // rather than letting accumulated addition decide a behaviour question.
      assert.ok(gap >= c.EMERGENCE.pianoMinGapSec - 1e-9, `${gap.toFixed(1)}s is never a hurry`);
      assert.ok(gap <= c.EMERGENCE.pianoMaxGapSec + 1e-9, `${gap.toFixed(1)}s is never an absence`);
    }
  }
});

test('the same night is always tended the same way', () => {
  const c = loadApp();
  const s = sparse(c);
  assert.deepEqual(c.emergencePianoNotes(s, 3, 300), c.emergencePianoNotes(s, 3, 300));
  assert.notDeepEqual(c.emergencePianoNotes(s, 3, 300), c.emergencePianoNotes(s, 4, 300));
});

// ── Memory — Thievery's dub, and deep time made mechanical ─────────────────

test('a richer night holds its room longer', () => {
  const c = loadApp();
  assert.ok(c.emergenceMemory(dense(c)).feedback > c.emergenceMemory(sparse(c)).feedback);
});

test('the memory is stable, and incommensurate with every loop this instrument uses', () => {
  const c = loadApp();
  for (const loopLen of [19, 24, 30, 38, 45, 60]) {
    const ratio = loopLen / c.EMERGENCE.memorySec;
    assert.ok(Math.abs(ratio - Math.round(ratio)) > 0.12,
      `a ${loopLen}s loop never lines up with the room (ratio ${ratio.toFixed(3)})`);
  }
  for (const shape of [sparse(c), dense(c, 300)])
    assert.ok(c.emergenceMemory(shape).feedback < 1,
      'feedback below unity, or the room never stops growing');
});

// ── Canopy — opening, opening, as width rather than as layers ──────────────

test('the breadth of life in a night opens the band', () => {
  const c = loadApp();
  const all = ['Insecta', 'Arachnida', 'Aves', 'Amphibia', 'Reptilia', 'Mammalia', 'Magnoliopsida'];
  let previous = null;
  for (let n = 1; n <= 7; n++) {
    const band = c.emergenceBand(c.emergenceNightShape(fakeNight(Array(14).fill(1), all.slice(0, n)), 19));
    assert.ok(band.highHz > band.lowHz, 'a band, not an inversion');
    if (previous) {
      assert.ok(band.highHz >= previous.highHz, 'the room never shrinks as life broadens');
      assert.ok(band.lowHz <= previous.lowHz, 'and never rises off the floor');
    }
    previous = band;
  }
  const one = c.emergenceBand(c.emergenceNightShape(fakeNight(Array(14).fill(1), ['Insecta']), 19));
  assert.ok(previous.highHz > one.highHz * 2, 'seven classes is an unmistakably taller room');
});

test('the room opens upward before it opens downward', () => {
  // She judges on headphones. A second class that only added sub-bass would be
  // a gesture she could not hear that would still measure as working.
  const c = loadApp();
  const one = c.emergenceBand(c.emergenceNightShape(fakeNight(Array(8).fill(1), ['Insecta']), 19));
  const two = c.emergenceBand(c.emergenceNightShape(fakeNight(Array(8).fill(1), ['Insecta', 'Aves']), 19));
  assert.ok(two.highHz - one.highHz > one.lowHz - two.lowHz,
    'the second class is heard, not merely felt');
});

// ── Sounds of life — grain, not a pulse ────────────────────────────────────

test('the grain is irregular, because a regular one is the pulse she turned down', () => {
  const c = loadApp();
  const grains = c.emergenceGrains(dense(c), 1, 120);
  assert.ok(grains.length > 3, 'a night of many small things has many small sounds');
  const gaps = [];
  for (let i = 1; i < grains.length; i++) gaps.push(grains[i].atSec - grains[i - 1].atSec);
  assert.ok(new Set(gaps.map(g => g.toFixed(3))).size > gaps.length * 0.7,
    'the spacing is irregular, so it never reads as a beat');
});

test('a fuller night carries more life than an empty one', () => {
  const c = loadApp();
  assert.ok(c.emergenceGrains(dense(c), 1, 120).length >
            c.emergenceGrains(sparse(c), 1, 120).length);
});

test('the grain stays under the room it lives in', () => {
  const c = loadApp();
  assert.ok(c.EMERGENCE.grainLevel < c.EMERGENCE.pianoLevel * 0.5,
    'sounds of life, not a field recording laid on top');
});

// ── The rules this project does not break ──────────────────────────────────

test('Emergence invents no record: it never enters the score', () => {
  const c = nightOf(loadApp().DEMO_CSV, null);
  for (const e of c.state.sequencer.events)
    assert.notEqual(e.kind, 'emergence', 'the floor is a room, not an arrival');
});

test('nothing is published on my judgement', () => {
  assert.equal(loadApp().EMERGENCE.on, false, 'she listens first, every time');
});

// ── The pass condition ─────────────────────────────────────────────────────

test('17 February and 3 September do not sound alike', { skip: !haveExport && 'export not present' }, () => {
  const csv = fs.readFileSync(csvPath, 'utf8');
  const c = loadApp();
  const describe = s => ({
    breath: +c.emergenceBreathSec(s).toFixed(2),
    pianoNotes: c.emergencePianoNotes(s, 1, 600).length,
    feedback: +c.emergenceMemory(s).feedback.toFixed(3),
    bandHigh: Math.round(c.emergenceBand(s).highHz),
    grains: c.emergenceGrains(s, 1, 120).length
  });
  const feb = describe(shapeOf(nightOf(csv, '2026-02-17')));
  const sep = describe(shapeOf(nightOf(csv, '2026-09-03')));
  assert.notDeepEqual(feb, sep, `February ${JSON.stringify(feb)} against September ${JSON.stringify(sep)}`);
  // Every axis must carry its share; one axis doing all the work is the
  // fragility that made spine B measure weakest of the three.
  assert.ok(feb.breath > sep.breath * 1.4, 'February breathes markedly slower');
  assert.ok(sep.pianoNotes > feb.pianoNotes * 1.3, 'September is tended more often');
  assert.ok(sep.feedback > feb.feedback, 'September holds its room longer');
  assert.ok(sep.grains > feb.grains, 'September carries more life');
});
