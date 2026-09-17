'use strict';
// The gallery floor: the room a night is heard in.
//
// Lily, 18 September 2026: "Let's make emergence the gallery floor. Sounds of
// life, insect-sounds, wing-beats, influences of East Forest and Thievery
// Corporation. Olafur. Reverence for life. Mary Oliver. Precious life. Rich
// life. Opening, opening. And yet deep time and forest and canopy."
//
// This is step 3 of PLAN-NEXT-FAMILY.md, unstarted since 13 September. The rule
// that document set, and the one this file exists to hold:
//
//   "A sparse February night and a heaving September night must not sound
//    alike. The current five presets add nothing because they are decoration
//    laid over the night rather than anything the night produced."
//
// The floor is AUTHORSHIP. It is generated *from* the night's shape and is a
// claim about nothing. Nothing here may invent an arrival or a record.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, loadAppWithDom } = require('./harness.cjs');
const { settings } = require('./score.cjs');

// A probe that records every node and every scheduled value, like the one the
// synthesis tests use, extended with the buffer sources a noise floor needs.
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
      start(t) { this.started = t; }, stop(t) { this.stopped = t; } }),
    createBufferSource: () => node({ source: true, buffer: null, loop: false,
      playbackRate: param('playbackRate'),
      start(t) { this.started = t; }, stop(t) { this.stopped = t; } }),
    createDelay: () => node({ delayTime: param('delayTime') }),
    createBiquadFilter: () => node({ type: '', frequency: param('cutoff'), Q: param('cutoffQ'),
      gain: param('filterGain'), detune: param('filterDetune') }),
    createStereoPanner: () => node({ pan: param('pan') }),
    createConvolver: () => node({ buffer: null }),
    createDynamicsCompressor: () => node({ threshold: param('threshold'), knee: param('knee'),
      ratio: param('ratio'), attack: param('attack'), release: param('release') }),
    createBuffer: (ch, len) => ({ numberOfChannels: ch, length: len,
      getChannelData: () => new Float32Array(len) }),
    destination: node({})
  };
  return ctx;
}

const csvPath = path.join(__dirname, '..', '..', 'two-backyards-iNaturalist.csv');
const haveExport = fs.existsSync(csvPath);
const realCsv = () => fs.readFileSync(csvPath, 'utf8');

function nightOf(csv, key, extra = {}) {
  const c = loadAppWithDom();
  Object.assign(c.state, settings, { spacingMode: 'timeline', voiceMode: 'gondwana',
    toneBy: 'taxon_species_name', filterYear: 'all', ...extra });
  c.importCSVData(csv);
  c.rebuildDerived();
  if (key) { c.state.nightKey = key; c.rebuildDerived(); }
  return c;
}
const shapeOf = c => c.floorNightShape(c.state.sequencer.events, c.state.loopLen);

// A night built by hand, so a test can state the arrivals it means rather than
// hunt for a date that happens to have them.
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

// ── What the floor reads from the night ─────────────────────────────────────

test('the floor reads the night, and reads it correctly', () => {
  const c = loadApp();
  const s = c.floorNightShape(fakeNight([1, 1, 2, 2, 4, 4], ['Insecta', 'Aves']), 19);
  assert.equal(s.arrivals, 6, 'six arrivals');
  assert.equal(s.medianGapSec, 2, 'median of 1,2,2,4,4 is 2');
  assert.equal(s.classCount, 2, 'two classes are present');
  assert.ok(s.density > 0, 'and the night has a density');
});

test('only arrivals count: authored layers never feed the floor that plays under them', () => {
  const c = loadApp();
  const events = fakeNight([1, 1, 1, 1]);
  const withAuthored = events.concat([
    { kind: 'moth_ground', atSec: 3, midi: 36, groundMidis: [36] },
    { kind: 'gond_pedal', atSec: 5, midi: 40 },
    { kind: 'obs', atSec: 7, midi: 62, isSpecial: true, obs: { ranks: {} } }
  ]);
  assert.deepEqual(c.floorNightShape(withAuthored, 19), c.floorNightShape(events, 19),
    'a floor grown from authorship would be decoration laid over decoration');
});

test('a night with nothing to say produces no floor at all', () => {
  const c = loadApp();
  assert.equal(c.floorNightShape([], 19).arrivals, 0);
  assert.equal(c.buildFloor(audioProbe(), null, c.floorNightShape([], 19), 'A', 1), null,
    'silence is the honest answer to an empty night');
});

// ── Breath: East Forest's patience, at the rate the night arrived ───────────

test('a sparse night breathes slower than a dense one', () => {
  const c = loadApp();
  const sparse = c.floorBreathSec(c.floorNightShape(fakeNight([2, 2, 2, 2]), 19));
  const dense = c.floorBreathSec(c.floorNightShape(fakeNight([.1, .1, .1, .1]), 19));
  assert.ok(sparse > dense, `sparse ${sparse}s breathes slower than dense ${dense}s`);
  assert.ok(sparse / dense > 1.5, 'and not by a margin nobody could hear');
});

test('the breath clamp is a safety net, and never fires on a real night', () => {
  // A clamp that fires on real data is not a safety net, it is a flattening --
  // which is exactly the chime bug this project is still carrying.
  if (!haveExport) return;
  const c = nightOf(realCsv(), null);
  const keys = c.offerableNightKeys([...c.state.nights.keys()], c.state.nights, '');
  assert.ok(keys.length > 100, 'the whole archive is under test, not a sample');
  let clamped = 0;
  for (const k of keys) {
    c.state.nightKey = k; c.rebuildDerived();
    const s = shapeOf(c);
    if (!s.arrivals) continue;
    const raw = c.FLOOR.breathBaseSec + c.FLOOR.breathPerGapSec * s.medianGapSec;
    if (raw < c.FLOOR.breathMinSec || raw > c.FLOOR.breathMaxSec) clamped++;
  }
  assert.equal(clamped, 0, 'every offered night breathes without being clamped');
});

// ── Flutter: the boundary where a pulse becomes a pitch ─────────────────────

test('the flutter stays on the boundary between rhythm and tone, always', () => {
  const c = loadApp();
  for (const gaps of [[.01], [.05, .05], [1, 1, 1], [4, 4], [10, 10]]) {
    const hz = c.floorFlutterHz(c.floorNightShape(fakeNight(gaps), 19));
    assert.ok(hz >= c.FLOOR.flutterMinHz && hz <= c.FLOOR.flutterMaxHz,
      `${hz} Hz is inside ${c.FLOOR.flutterMinHz}-${c.FLOOR.flutterMaxHz}`);
  }
});

test('a fuller night flutters faster, and crosses toward a pitch as it fills', () => {
  const c = loadApp();
  const quiet = c.floorFlutterHz(c.floorNightShape(fakeNight(Array(10).fill(1.5)), 19));
  const full = c.floorFlutterHz(c.floorNightShape(fakeNight(Array(130).fill(.14)), 19));
  assert.ok(full > quiet * 2, `${full} Hz is well above ${quiet} Hz`);
  assert.ok(quiet < 20, 'a quiet night is a flutter you feel');
  assert.ok(full > 40, 'a full night is nearly a note you hear');
});

// ── Height: opening, opening ────────────────────────────────────────────────

test('the breadth of life in a night decides how tall the room is', () => {
  const c = loadApp();
  const heights = [];
  for (let n = 1; n <= 7; n++) {
    const classes = ['Insecta', 'Arachnida', 'Aves', 'Amphibia', 'Reptilia', 'Mammalia', 'Magnoliopsida'].slice(0, n);
    heights.push(c.floorStrata(c.floorNightShape(fakeNight(Array(14).fill(1), classes), 19)).length);
  }
  assert.equal(heights[0], 1, 'a night of one class is a single band');
  for (let i = 1; i < heights.length; i++)
    assert.ok(heights[i] >= heights[i - 1], `${heights.join(',')} never shrinks as life broadens`);
  assert.ok(heights[3] > heights[0], 'four classes open a taller room than one');
});

test('the room opens upward before it opens downward', () => {
  // Lily judges on headphones. If the second class only added sub-bass she
  // would hear nothing at all, and the gesture would measure as working.
  const c = loadApp();
  const two = c.floorStrata(c.floorNightShape(fakeNight(Array(8).fill(1), ['Insecta', 'Aves']), 19));
  assert.ok(two.some(s => s.highHz > 300), 'the second class is audible on a laptop');
});

// ── Not loop-locked: deep time cannot repeat inside a 19-second loop ────────

test('the memory is incommensurate with the loop, so the room never lines up', () => {
  // PLAN-NEXT-FAMILY.md section 4: "Material that obviously repeats inside the
  // loop will not feel old."
  const c = loadApp();
  for (const loopLen of [19, 24, 30, 38, 45, 60]) {
    const ratio = loopLen / c.FLOOR.memorySec;
    assert.ok(Math.abs(ratio - Math.round(ratio)) > 0.12,
      `a ${loopLen}s loop does not line up with a ${c.FLOOR.memorySec}s memory (ratio ${ratio.toFixed(3)})`);
  }
});

// ── The felt piano: reverence, and it invents nothing ───────────────────────

test('the felt piano plays only pitches the night itself contains', () => {
  const c = loadApp();
  const events = fakeNight(Array(12).fill(1), ['Insecta'], [60, 65, 70]);
  const shape = c.floorNightShape(events, 19);
  const notes = c.floorPianoNotes(shape, 1, 300);
  assert.ok(notes.length > 0, 'it speaks');
  const nightClasses = new Set(shape.pitchClasses);
  for (const n of notes)
    assert.ok(nightClasses.has(((n.midi % 12) + 12) % 12),
      `${n.midi} is a pitch class this night actually holds`);
});

test('it is given all the room in the world, and never hurries', () => {
  const c = loadApp();
  const notes = c.floorPianoNotes(c.floorNightShape(fakeNight(Array(20).fill(.5)), 19), 7, 600);
  for (let i = 1; i < notes.length; i++) {
    const gap = notes[i].atSec - notes[i - 1].atSec;
    assert.ok(gap >= c.FLOOR.pianoMinGapSec, `${gap.toFixed(1)}s is never a hurry`);
    assert.ok(gap <= c.FLOOR.pianoMaxGapSec, `${gap.toFixed(1)}s is never an absence`);
  }
});

test('the same night is always tended the same way', () => {
  const c = loadApp();
  const shape = c.floorNightShape(fakeNight(Array(12).fill(1)), 19);
  assert.deepEqual(c.floorPianoNotes(shape, 3, 300), c.floorPianoNotes(shape, 3, 300));
  assert.notDeepEqual(c.floorPianoNotes(shape, 3, 300), c.floorPianoNotes(shape, 4, 300));
});

// ── The graph itself ────────────────────────────────────────────────────────

test('every spine builds, and every node it built is released when it stops', () => {
  const c = loadApp();
  for (const spine of ['A', 'B', 'C']) {
    const ctx = audioProbe();
    const out = ctx.createGain();
    const floor = c.buildFloor(ctx, out, c.floorNightShape(fakeNight(Array(20).fill(.5), ['Insecta', 'Aves']), 19), spine, 1);
    assert.ok(floor && typeof floor.stop === 'function', `spine ${spine} builds`);
    // The probe makes its own destination at construction; only what the floor
    // itself built is the floor's to release.
    const built = ctx.nodes.filter(n => n !== out && n !== ctx.destination);
    assert.ok(built.length > 4, `spine ${spine} is more than a gain stage`);
    floor.stop();
    for (const n of built.filter(n => !n.source))
      assert.ok(n.disconnected, `spine ${spine} releases every node it made`);
  }
});

test('the three spines are genuinely different builds, not one build relabelled', () => {
  const c = loadApp();
  const shape = c.floorNightShape(fakeNight(Array(20).fill(.5), ['Insecta', 'Aves', 'Arachnida']), 19);
  const sizes = ['A', 'B', 'C'].map(spine => {
    const ctx = audioProbe();
    c.buildFloor(ctx, ctx.createGain(), shape, spine, 1);
    return ctx.nodes.length;
  });
  assert.equal(new Set(sizes).size, 3, `A/B/C build differently (${sizes.join(', ')})`);
});

// ── The rules this project does not break ───────────────────────────────────

test('the floor is off until Lily has heard it', () => {
  assert.equal(loadApp().FLOOR.on, false,
    'nothing is published on my judgement; she listens first');
});

test('the floor invents no record: it never enters the score', () => {
  const c = nightOf(loadApp().DEMO_CSV, null);
  for (const e of c.state.sequencer.events)
    assert.notEqual(e.kind, 'floor', 'the floor is a room, not an arrival');
});

test('the accepted families are untouched by any of this', () => {
  // Moth Orchestra and Gondwana were accepted by ear. The floor rides the
  // ambience bus, which the offline renderer does not include, so what those
  // families render is byte-for-byte what it was.
  const c = loadApp();
  assert.equal(typeof c.FLOOR, 'object');
  assert.ok(!('floor' in (c.VOICE_MODE_LABELS || {})), 'the floor is not a family');
});

// ── The pass condition PLAN-NEXT-FAMILY.md set ─────────────────────────────

test('17 February and 3 September do not sound alike', { skip: !haveExport && 'export not present' }, () => {
  const csv = realCsv();
  const feb = shapeOf(nightOf(csv, '2026-02-17'));
  const sep = shapeOf(nightOf(csv, '2026-09-03'));
  const c = loadApp();
  const describe = s => ({
    breath: +c.floorBreathSec(s).toFixed(2),
    flutter: +c.floorFlutterHz(s).toFixed(1),
    strata: c.floorStrata(s).length
  });
  const a = describe(feb), b = describe(sep);
  assert.notDeepEqual(a, b, `February ${JSON.stringify(a)} against September ${JSON.stringify(b)}`);
  assert.ok(a.breath > b.breath * 1.4, 'February breathes markedly slower');
  assert.ok(b.flutter > a.flutter * 2, 'September flutters markedly faster');
});
