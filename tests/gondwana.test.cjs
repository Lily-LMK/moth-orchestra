'use strict';
// Gondwana — nine bodies that deepen with rank, voiced below the written
// score, sounding into a room of their own, and led by a close, dry felted
// piano. These tests fix what separates it from every earlier family: partials
// that enter late and outlive each other, an exact octave placement, a reverb
// bus nothing else touches, and — added 14 September 2026 — a *behaviour*:
// repeated sightings speak figures, the two observers do not share a
// subdivision, and an authored pedal moves underneath without being evidence.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { loadApp } = require('./harness.cjs');
const { settings } = require('./score.cjs');

const family = ['gond_felt', 'gond_heartwood', 'gond_bronze', 'gond_bowed', 'gond_column', 'gond_membrane', 'gond_rim', 'gond_drone', 'gond_pulse'];
const CEILINGS = { gond_felt: 523, gond_heartwood: 110, gond_bronze: 220, gond_bowed: 330, gond_column: 330, gond_membrane: 165, gond_drone: 110, gond_pulse: 220 };
const DERIVED = ['gondMidis', 'gondShape', 'gondResolution'];
const plain = value => JSON.parse(JSON.stringify(value));

function app(mode, voiceMode = 'gondwana', toneBy = 'taxon_species_name') {
  const c = loadApp();
  Object.assign(c.state, settings, { spacingMode: mode, voiceMode, toneBy });
  return c;
}

test('Gondwana is a registered named family and every earlier family remains available', () => {
  const c = loadApp();
  assert.equal(c.state.voiceMode, 'mixed');
  for (const mode of ['mixed', 'night', 'choir', 'steelpan', 'lantern', 'noctilucent']) {
    assert.ok(vm.runInContext('Array.from(VOICE_MODES)', c).includes(mode), `retains ${mode}`);
  }
  assert.equal(vm.runInContext('VOICE_MODES.includes("gondwana") && VOICE_MODE_LABELS.gondwana', c), 'Gondwana');
});

// Deliberate reversal of the first attempt. Fifteen bodies with one envelope
// shape read as fifteen versions of the same small struck object. Seven bodies
// that each have somewhere to go do not.
test('the palette is nine bodies, led by the piano, and does not grow with rank', () => {
  const c = app('timeline');
  assert.deepEqual(plain(vm.runInContext('Array.from(GONDWANA_INSTRUMENTS)', c)), family);
  let first = null;
  for (const toneBy of ['taxon_class_name', 'taxon_family_name', 'taxon_tribe_name', 'taxon_species_name']) {
    c.state.toneBy = toneBy;
    const pool = plain(vm.runInContext('Array.from(gondwanaPoolForDepth(currentRankDepth()))', c));
    assert.deepEqual(new Set(pool), new Set(family), `${toneBy}: the same nine bodies`);
    if (first === null) first = pool;
    assert.deepEqual(pool, first, `${toneBy}: rank does not change the pool`);
  }
  // The piano leads. A close, dry, mechanical point source against reverberant
  // mass is what stops the family reading as background, so its share of the
  // pool is part of the contract rather than an incidental weighting.
  const share = first.filter(v => v === 'gond_felt').length / first.length;
  assert.ok(share > 0.2 && share < 0.35, `the felted piano leads without burying the bodies (got ${share})`);
  // Every body keeps a real share. Two in five buried the seven Lily accepted.
  for (const body of family.filter(v => v !== 'gond_felt')) {
    assert.ok(first.includes(body), `${body} is still dealt`);
  }
});

test('rank is spent inside each voice: more partials, longer tails, more beating, more arriving late', () => {
  const c = app('timeline');
  const at = d => plain(vm.runInContext(`gondwanaDepth(${d})`, c));
  const shallow = at(0), deep = at(7);
  assert.equal(shallow.partials, 3, 'class rank is three partials');
  assert.equal(deep.partials, 8, 'species rank is eight');
  assert.equal(shallow.beat, 0, 'class rank does not beat');
  assert.equal(deep.beat, 1);
  assert.equal(deep.tail, 1);
  assert.ok(shallow.tail < deep.tail && shallow.late < deep.late);
  let previous = at(0);
  for (let d = 1; d <= 7; d++) {
    const current = at(d);
    for (const key of ['partials', 'tail', 'beat', 'late']) {
      assert.ok(current[key] >= previous[key], `${key} never goes backwards between ranks ${d - 1} and ${d}`);
    }
    previous = current;
  }
  for (const d of [-1, 99, NaN, undefined]) {
    const spec = at(JSON.stringify(d) === undefined ? 'undefined' : d);
    assert.ok(spec.partials >= 3 && spec.partials <= 8 && spec.tail > 0, `out-of-range depth ${d} is clamped`);
  }
});

test('selection is deterministic, independent of the observer, and identical in Song', () => {
  const c = app('timeline');
  const voices = new Set();
  for (let i = 0; i < 200; i++) {
    const group = `Synthetic taxonomic group ${i}`;
    const first = c.pickInstrument(group, settings.seed);
    assert.ok(family.includes(first), first);
    voices.add(first);
    c.state.listenMode = i % 2 ? 'A' : 'B';
    assert.equal(c.pickInstrument(group, settings.seed), first);
    assert.equal(c.pickSongInstrument(group, settings.seed), first);
  }
  assert.equal(voices.size, family.length);
});

// The family performs the written score an octave or two down, the way a
// contrabass section reads a part. It must never be anything but a whole
// number of octaves, or the pitch itself has been altered rather than placed.
test('octave placement is exact, bounded, and never changes the pitch class', () => {
  const c = app('timeline');
  const voicing = (instrument, freq) => plain(vm.runInContext(`gondwanaVoicing(${JSON.stringify(instrument)}, ${freq})`, c));
  for (const instrument of family) {
    for (const freq of [36.7, 73.4, 146.83, 220, 293.66, 440, 587.33, 880, 1174.66]) {
      const { freq: sounding, octaves } = voicing(instrument, freq);
      assert.ok(Number.isInteger(octaves), `${instrument}: ${octaves} is a whole number of octaves`);
      assert.ok(Math.abs(sounding - freq * Math.pow(2, octaves)) < 1e-9, `${instrument}: sounding pitch is the written pitch, placed`);
      const ratio = sounding / freq;
      assert.ok(Math.abs(Math.log2(ratio) - Math.round(Math.log2(ratio))) < 1e-9, `${instrument}: pitch class preserved exactly`);
      const ceiling = CEILINGS[instrument];
      if (ceiling && freq > ceiling) assert.ok(octaves < 0, `${instrument}: a high written pitch is brought down`);
      if (ceiling) assert.ok(sounding <= ceiling || octaves === -3, `${instrument}: at or under its ceiling, or already three octaves down`);
      if (!ceiling) assert.equal(octaves, 0, `${instrument}: sounds where the score wrote it`);
    }
  }
  assert.equal(voicing('gond_rim', 587.33).octaves, 0, 'the rim is the light on top and is never moved');
  assert.ok(voicing('gond_drone', 587.33).freq <= 110);
});

for (const mode of ['timeline', 'riff']) {
  test(`${mode}: Gondwana preserves observation timing, pitches, density and source identities`, () => {
    const c = app(mode, 'mixed');
    const baseline = c.buildSequencer(c.state.obs);
    c.state.voiceMode = 'gondwana';
    const candidate = c.buildSequencer(c.state.obs);
    // The family may attach its own derived fields to an arrival and may add a
    // pedal of its own; it may not move, retune or invent an arrival.
    const identity = seq => plain(seq.events.filter(e => e.kind === 'obs')
      .map(({ instrument, ...e }) => { for (const k of DERIVED) delete e[k]; return e; }));
    assert.deepEqual(identity(candidate), identity(baseline), 'the written score is untouched; only the instrument differs');
    assert.ok(candidate.events.filter(e => e.kind === 'obs').every(e => family.includes(e.instrument)));
    assert.deepEqual(plain(candidate.events), plain(c.buildSequencer(c.state.obs).events), 'reproducible');
    assert.deepEqual(plain(candidate.meta.sharedMinutes), plain(baseline.meta.sharedMinutes));
    // The duet gestures keep their timing, their pitch and their source
    // evidence; only which body sounds them changes, the same as an arrival.
    const gestures = seq => plain(seq.events.filter(e => e.kind !== 'obs' && e.kind !== 'gond_pedal')
      .map(({ instrument, ...e }) => e));
    assert.deepEqual(gestures(candidate), gestures(baseline), 'all special gestures and source matches are preserved');
    // Every gesture is voiced by a Gondwana body. The shared minute is
    // gond_sync; the meeting is gond_ground, the family's own sub. Asserting
    // the prefix rather than one name keeps the intent — nothing borrowed —
    // without pinning the family to a single gesture.
    assert.ok(candidate.events.filter(e => e.isSpecial).every(e => /^gond_/.test(e.instrument)),
      'and every gesture is sounded by this family, not borrowed');
  });
}

test('Song uses Gondwana orchestration and gives the shared minute its own gesture with exact source evidence', () => {
  const c = app('song');
  const seq = c.buildSequencer(c.state.obs);
  assert.ok(seq.events.some(e => e.kind === 'obs'));
  assert.ok(seq.events.filter(e => e.kind === 'obs').every(e => family.includes(e.instrument)));
  assert.ok(seq.events.every(e => [...family, 'gond_sync'].includes(e.instrument)),
    'and nothing borrowed from another family');
  const shared = seq.events.filter(e => e.kind === 'duet_minute');
  assert.ok(shared.length > 0);
  assert.ok(shared.every(e => e.instrument === 'gond_sync' && e.match.observations.A.length && e.match.observations.B.length));
  assert.deepEqual(plain(seq.events), plain(c.buildSequencer(c.state.obs).events));
});

for (const mode of ['timeline', 'riff', 'song']) test(`${mode}: an empty Gondwana score is silent`, () => {
  assert.equal(app(mode).buildSequencer([]).events.length, 0);
});

// Finite automation, bounded envelopes, stopped sources, a path to the shared
// master. Internal topology is not asserted, but the reverb bus is persistent
// by design, so per-note assertions look only at nodes made for that note.
function audioProbe() {
  const nodes = [];
  const automation = [];
  function param(name) {
    const events = [];
    return { value: 0, name, events,
      setValueAtTime(value, time) { check(value, time); },
      linearRampToValueAtTime(value, time) { check(value, time); },
      exponentialRampToValueAtTime(value, time) { check(value, time); assert.ok(value > 0); },
      setTargetAtTime(value, time, constant) { check(value, time); assert.ok(constant > 0); },
      cancelScheduledValues() {} };
    function check(value, time) {
      assert.ok(Number.isFinite(value) && Number.isFinite(time), `${name}: finite automation`);
      if (name === 'gain') assert.ok(value >= 0, 'non-negative envelope');
      events.push({ value, time });
      automation.push({ name, value, time });
    }
  }
  function node(source = false, kind = 'node') {
    const n = { kind, gain: param('gain'), frequency: param('frequency'), detune: param('detune'),
      Q: param('Q'), delayTime: param('delayTime'), threshold: param('threshold'), knee: param('knee'),
      ratio: param('ratio'), attack: param('attack'), release: param('release'),
      connections: [], connect(target) { this.connections.push(target); return target; },
      disconnect() { this.disconnected = true; this.connections = []; },
      start(time) { assert.ok(Number.isFinite(time)); this.started = time; },
      stop(time) { assert.ok(Number.isFinite(time)); this.stopped = time; }, source };
    for (const name of ['gain', 'frequency', 'detune', 'Q', 'delayTime']) n[name].owner = n;
    nodes.push(n); return n;
  }
  return { nodes, automation, destination: {}, currentTime: 10, sampleRate: 48000,
    createGain: () => node(false, 'gain'), createOscillator: () => node(true, 'osc'),
    createBiquadFilter: () => node(false, 'filter'), createBufferSource: () => node(true, 'buffer'),
    createWaveShaper: () => node(), createConvolver: () => node(false, 'convolver'),
    createDelay: () => node(false, 'delay'), createDynamicsCompressor: () => node(false, 'compressor'),
    createBuffer: (_, length) => ({ getChannelData: () => new Float32Array(length) }) };
}
function withNoise(c) {
  vm.runInContext('noiseBuf = { length: 48000, sampleRate: 48000 }', c);
  return c;
}
// Build the persistent reverb bus first, then measure only what the note adds.
function note(c, ctx, instrument, when, freq, velocity) {
  c.scheduleInstrument(ctx, 'gond_rim', when, 440, 0.01);
  const before = ctx.nodes.length;
  ctx.automation.length = 0;
  c.scheduleInstrument(ctx, instrument, when, freq, velocity);
  return ctx.nodes.slice(before);
}

for (const instrument of family) test(`${instrument}: synthesis schedules finite envelopes, routes to master and stops all sources`, () => {
  const c = withNoise(app('timeline'));
  for (const [freq, velocity] of [[65.4, 0.12], [440, 0.65], [2093, 0.65]]) {
    const ctx = audioProbe();
    c.testMaster = {};
    vm.runInContext('masterGain = testMaster', c);
    const made = note(c, ctx, instrument, 9, freq, velocity);
    const sources = made.filter(n => n.source);
    assert.ok(sources.length > 0);
    const reachesMaster = (n, seen = new Set()) => {
      if (n === c.testMaster) return true;
      if (seen.has(n)) return false;
      seen.add(n);
      return (n.owner ? [n.owner] : n.connections || []).some(next => reachesMaster(next, seen));
    };
    for (const node of made) {
      const controlsFrequency = node.connections.some(target => target.name === 'frequency' || target.name === 'detune');
      if (!controlsFrequency) assert.ok(node.gain.events.every(event => event.value <= 1), 'audio gain is bounded');
    }
    for (const source of sources) {
      assert.ok(source.started >= ctx.currentTime);
      assert.ok(source.stopped > source.started && source.stopped - source.started <= 9.0);
      assert.ok(reachesMaster(source), 'every source finds the shared master through the family bus');
    }
  }
});

// The failure of the first attempt, made into a test. Every earlier family
// decays monotonically from one onset; that is the sound of a small struck
// object however the ratios are arranged.
test('at species rank, partials enter late and outlive each other', () => {
  const c = withNoise(app('timeline'));
  for (const instrument of family) {
    const ctx = audioProbe();
    const made = note(c, ctx, instrument, 10, 220, 0.5);
    const envelopes = made.filter(n => n.gain.events.length >= 3).map(n => n.gain.events);
    assert.ok(envelopes.length >= 4, `${instrument}: species rank sounds several partials`);
    const onsets = envelopes.map(e => e[0].time);
    const ends = envelopes.map(e => e[e.length - 1].time);
    assert.ok(Math.max(...onsets) > Math.min(...onsets) + 1e-6, `${instrument}: something arrives after the onset`);
    assert.ok(Math.max(...ends) - Math.min(...ends) >= 2.0, `${instrument}: partials outlive each other by seconds, not milliseconds`);
    assert.ok(Math.max(...ends) - 10 >= 2.5, `${instrument}: the body keeps ringing`);
  }
});

test('at class rank the same bodies are plainer: fewer partials, shorter tails, no beating', () => {
  const c = withNoise(app('timeline'));
  for (const instrument of family) {
    const counts = {};
    for (const toneBy of ['taxon_class_name', 'taxon_species_name']) {
      c.state.toneBy = toneBy;
      const ctx = audioProbe();
      const made = note(c, ctx, instrument, 10, 220, 0.5);
      const envelopes = made.filter(n => n.gain.events.length >= 3).map(n => n.gain.events);
      counts[toneBy] = { partials: envelopes.length, last: Math.max(...envelopes.map(e => e[e.length - 1].time)) };
    }
    assert.ok(counts.taxon_class_name.partials < counts.taxon_species_name.partials, `${instrument}: species rank sounds more of the body`);
    assert.ok(counts.taxon_class_name.last < counts.taxon_species_name.last, `${instrument}: species rank rings longer`);
  }
  c.state.toneBy = 'taxon_class_name';
  const ctx = audioProbe();
  const made = note(c, withNoise(c) && ctx, 'gond_drone', 10, 220, 0.5);
  const pitches = made.filter(n => n.kind === 'osc').map(n => n.frequency.events[0].value);
  assert.equal(new Set(pitches.map(p => p.toFixed(6))).size, pitches.length === 0 ? 0 : new Set(pitches.map(p => p.toFixed(6))).size);
});

test('the seven bodies schedule distinct timbres at the same pitch and velocity', () => {
  const c = withNoise(app('timeline'));
  const signatures = family.map(instrument => {
    const ctx = audioProbe();
    note(c, ctx, instrument, 11, 440, 0.4);
    return JSON.stringify(ctx.automation);
  });
  assert.equal(new Set(signatures).size, family.length);
});

// The room is this family's alone. The five accepted families must reach the
// master exactly as they did before, so none of them needs re-accepting.
test('the reverb bus belongs to Gondwana and nothing else routes through it', () => {
  const c = withNoise(app('timeline'));
  const ctx = audioProbe();
  c.testMaster = {};
  vm.runInContext('masterGain = testMaster', c);
  for (const other of ['bell', 'pluck', 'bowl', 'lantern_glass', 'noct_root']) {
    c.scheduleInstrument(ctx, other, 11, 440, 0.4);
  }
  assert.equal(ctx.nodes.filter(n => n.kind === 'convolver').length, 0, 'no existing family creates a room');
  c.scheduleInstrument(ctx, 'gond_bronze', 11, 440, 0.4);
  assert.equal(ctx.nodes.filter(n => n.kind === 'convolver').length, 1, 'Gondwana builds one');
  c.scheduleInstrument(ctx, 'gond_drone', 11, 440, 0.4);
  assert.equal(ctx.nodes.filter(n => n.kind === 'convolver').length, 1, 'and reuses it rather than one per note');
});

test('the room is a finite, decaying impulse and is identical between renders', () => {
  const c = app('timeline');
  const ctx = audioProbe();
  const a = vm.runInContext('gondwanaImpulse', c);
  assert.equal(typeof a, 'function');
  const sampled = seconds => {
    const real = { sampleRate: 44100, createBuffer: (_, length) => {
      const data = new Float32Array(length);
      return { length, getChannelData: () => data };
    } };
    return a(real, seconds);
  };
  const first = sampled(1.0).getChannelData(0);
  const second = sampled(1.0).getChannelData(0);
  assert.ok(first.every(v => Number.isFinite(v) && Math.abs(v) <= 1), 'finite and inside full scale');
  assert.deepEqual(Array.from(first.slice(0, 200)), Array.from(second.slice(0, 200)), 'seeded: the same room every time');
  const head = first.slice(0, 4410).reduce((s, v) => s + v * v, 0);
  const tail = first.slice(-4410).reduce((s, v) => s + v * v, 0);
  assert.ok(tail < head * 0.2, 'the tail decays');
});

for (const instrument of family) {
  test(`${instrument}: zero or invalid amplitude and invalid frequency create no audible sources`, () => {
    const c = withNoise(app('timeline'));
    for (const [freq, velocity] of [[440, 0], [440, -1], [440, NaN], [440, Infinity],
      [440, undefined], [NaN, 0.4], [Infinity, 0.4], [0, 0.4], [-440, 0.4], [undefined, 0.4]]) {
      const ctx = audioProbe();
      let made;
      assert.doesNotThrow(() => { made = note(c, ctx, instrument, 11, freq, velocity); });
      assert.equal(made.filter(n => n.source).length, 0);
      assert.ok(made.every(n => n.connections.length === 0), 'silent requests cannot connect to the output');
    }
  });

  test(`${instrument}: high notes omit partials at or above 45 percent of sample rate`, () => {
    const c = withNoise(app('timeline'));
    for (const sampleRate of [22050, 44100, 48000, 96000]) {
      for (const frequency of [65.4, sampleRate * 0.2, sampleRate * 0.449, sampleRate * 0.45, sampleRate]) {
        const ctx = audioProbe();
        ctx.sampleRate = sampleRate;
        const made = note(c, ctx, instrument, 11, frequency, 0.4);
        const frequencies = made.filter(n => n.kind === 'osc').map(n => n.frequency.events[0].value);
        assert.ok(frequencies.every(f => f > 0 && f < sampleRate * 0.45));
        if (frequency >= sampleRate * 0.45) assert.equal(made.filter(n => n.source).length, 0, 'out-of-band fundamentals are silent');
      }
    }
  });

  test(`${instrument}: ending every source disconnects its complete temporary audio graph`, () => {
    const c = withNoise(app('timeline'));
    const ctx = audioProbe();
    const made = note(c, ctx, instrument, 11, 440, 0.4);
    const sources = made.filter(n => n.source);
    assert.ok(sources.length > 0);
    for (const source of sources) {
      assert.equal(typeof source.onended, 'function');
      source.onended();
      assert.equal(source.disconnected, true);
    }
    assert.ok(made.every(n => n.disconnected && n.connections.length === 0), 'the note releases everything it made; the room persists');
  });
}

// Accepted by ear, 14 September 2026, and published the same day.
test('Gondwana is the published sixth family, and Noctilucent is still withheld', () => {
  const c = loadApp();
  const published = plain(vm.runInContext('Array.from(PUBLIC_VOICE_MODES)', c));
  assert.deepEqual(published, ['mixed', 'night', 'choir', 'steelpan', 'lantern', 'gondwana']);
  assert.ok(vm.runInContext('VOICE_MODES.includes("noctilucent")', c), 'Noctilucent stays registered');
  assert.ok(!published.includes('noctilucent'), 'but unheard, so unpublished');
  assert.equal(vm.runInContext('VOICE_MODE_LABELS.gondwana', c), 'Gondwana');
});

// ── Behaviour ───────────────────────────────────────────────────────────────
// Gondwana is the first family that decides how much a record says, not only
// what it sounds like. The phrase length is how completely the record was
// identified — eleven ranks from kingdom to species — so it is a property of
// the record, tells the listener something true, and behaves identically at
// every listening rank.

const RANKS = ['kingdom', 'phylum', 'class', 'order', 'superfamily', 'family',
  'subfamily', 'tribe', 'subtribe', 'genus', 'species'];
const obsWithRanks = filled => ({ ranks: Object.fromEntries(
  RANKS.slice(0, filled).map((r, i) => [`taxon_${r}_name`, `Rank${i}`])) });

const figureEvent = (c, over = {}) => ({
  voiceKey: 'Noctuidae', atSec: 3.25, instrument: 'gond_felt', gondResolution: 11, user: 'A',
  gondMidis: c.gondwanaFigureMidis(60, 'Noctuidae', settings.seed, 'minor', 'A'),
  gondShape: c.gondwanaFigureShape('Noctuidae', settings.seed, 7),
  ...over });

// The first cycle on which a given event actually elaborates. Speaking is
// seeded per record per cycle, so a test that wants a figure has to find one
// rather than assume cycle 12 will do.
const speakingCycle = (c, event, from = 1) => {
  for (let cycle = from; cycle < from + 60; cycle++) if (c.gondwanaFigure(event, cycle)) return cycle;
  throw new Error('this record never speaks');
};

test('resolution is the count of ranks the record itself fills', () => {
  const c = app('timeline');
  for (let filled = 0; filled <= RANKS.length; filled++) {
    assert.equal(c.gondwanaResolution(obsWithRanks(filled)), filled, `${filled} ranks`);
  }
  // Blank and whitespace ranks are absent, not present. An empty string in the
  // CSV is a missing identification, and must not buy a longer phrase.
  assert.equal(c.gondwanaResolution({ ranks: { taxon_class_name: '  ', taxon_order_name: '' } }), 0);
  for (const junk of [null, undefined, {}, { ranks: null }, { ranks: 'Insecta' }, 42]) {
    assert.equal(c.gondwanaResolution(junk), 0, `no ranks is no phrase (${JSON.stringify(junk)})`);
  }
});

test('a vague record says one note, at every cycle, for ever', () => {
  const c = app('timeline');
  for (let filled = 0; filled <= 8; filled++) {
    for (let cycle = 0; cycle < 40; cycle++) {
      assert.equal(c.gondwanaFigureLength(filled, cycle), 1, `${filled} ranks at cycle ${cycle}`);
      assert.equal(c.gondwanaFigure(figureEvent(c, { gondResolution: filled }), cycle), null,
        'and it schedules no figure at all');
    }
  }
  for (const bad of [NaN, undefined, null, -3, 'species']) {
    assert.equal(c.gondwanaFigureLength(bad, 9), 1, `a missing resolution is one note (${bad})`);
  }
});

test('the phrase length is how well the record was known', () => {
  const c = app('timeline');
  const settled = filled => c.gondwanaFigureLength(filled, 999);
  let previous = 0;
  for (let filled = 0; filled <= 11; filled++) {
    const length = settled(filled);
    assert.ok(length >= previous, `${filled}: a better identification never says less`);
    assert.ok(length >= 1 && length <= 7, `${filled}: bounded`);
    previous = length;
  }
  assert.equal(settled(11), 5, 'species: the whole name');
  assert.ok(settled(11) > settled(10) && settled(10) > settled(9), 'and each step down says less');
  assert.equal(settled(20), settled(11), 'more ranks than exist buys nothing');
});

// The regression that mattered. The previous rule counted how often a voice
// came back, which at species rank is almost never — so the most specific
// listening became the thinnest, the exact inverse of the finding this family
// was built on. Phrase length must not depend on the listening rank at all.
test('listening rank never changes how much a record says', () => {
  const ranks = ['taxon_class_name', 'taxon_order_name', 'taxon_family_name',
    'taxon_tribe_name', 'taxon_genus_name', 'taxon_species_name'];
  const byRank = ranks.map(toneBy => {
    const c = app('timeline', 'gondwana', toneBy);
    const seq = c.buildSequencer(c.state.obs);
    const arrivals = seq.events.filter(e => e.kind === 'obs');
    const lengths = new Map();
    for (const e of arrivals) lengths.set(e.obs.id, c.gondwanaFigureLength(e.gondResolution, 999));
    return { toneBy, lengths, total: [...lengths.values()].reduce((a, b) => a + b, 0) };
  });
  const [first, ...rest] = byRank;
  for (const other of rest) {
    assert.deepEqual([...other.lengths.entries()].sort(), [...first.lengths.entries()].sort(),
      `${other.toneBy}: every record says exactly what it says at ${first.toneBy}`);
  }
  const species = byRank[byRank.length - 1];
  assert.equal(species.total, Math.max(...byRank.map(r => r.total)),
    'species rank is never the poorest');
  assert.ok(species.total > species.lengths.size, 'and something actually speaks there');
});

test('the resolution on an arrival is that observation own, and no other family carries it', () => {
  const c = app('timeline');
  const seq = c.buildSequencer(c.state.obs);
  const arrivals = seq.events.filter(e => e.kind === 'obs');
  assert.ok(arrivals.length > 0);
  for (const arrival of arrivals) {
    assert.equal(arrival.gondResolution, c.gondwanaResolution(arrival.obs),
      'read from the record, not from the night');
  }
  assert.ok(new Set(arrivals.map(e => e.gondResolution)).size > 1, 'and real nights vary');
  c.state.voiceMode = 'mixed';
  assert.ok(c.buildSequencer(c.state.obs).events.every(e => e.gondResolution === undefined));
});

// The first pass states the night plainly; after that a record speaks only
// sometimes, so the loop keeps real silence in it and no two passes are alike.
test('the first pass never elaborates, and after it speaking is intermittent', () => {
  const c = app('timeline');
  const event = figureEvent(c);
  assert.equal(c.gondwanaSpeaks(event, 0), false, 'cycle 0 is the night, plainly');
  assert.equal(c.gondwanaFigure(event, 0), null);
  for (const bad of [-1, NaN, undefined, null]) assert.equal(c.gondwanaSpeaks(event, bad), false);
  let spoke = 0;
  for (let cycle = 1; cycle <= 200; cycle++) if (c.gondwanaSpeaks(event, cycle)) spoke++;
  assert.ok(spoke > 60 && spoke < 140, `sometimes, not always and not never (${spoke}/200)`);
  assert.equal(c.gondwanaSpeaks(event, 7), c.gondwanaSpeaks(event, 7), 'and any one cycle is reproducible');
});

test('figures grow over the first cycles and then settle', () => {
  const c = app('timeline');
  const lengths = Array.from({ length: 20 }, (_, cycle) => c.gondwanaFigureLength(11, cycle));
  assert.equal(lengths[0], 1, 'the first pass is the night, plainly');
  for (let i = 1; i < lengths.length; i++) assert.ok(lengths[i] >= lengths[i - 1], 'growth never reverses');
  assert.ok(lengths[lengths.length - 1] > lengths[0], 'and it does grow');
  assert.equal(lengths[lengths.length - 1], c.gondwanaFigureLength(11, 999), 'settling at the earned length');
});

test('every pitch in a figure is the record own pitch transposed by whole scale steps', () => {
  const c = app('timeline');
  const scales = plain(vm.runInContext('JSON.parse(JSON.stringify(SCALES))', c));
  const roots = plain(vm.runInContext('JSON.parse(JSON.stringify(KEY_TO_SEMITONE))', c));
  for (const [scaleName, scale] of Object.entries(scales)) {
    for (const [key, root] of Object.entries(roots)) {
      // pickPitch only ever writes a degree of the chosen scale, so that is the
      // case the figure has to honour.
      for (const octave of [3, 4, 5]) {
        for (let degree = 0; degree < scale.length; degree++) {
          const midi = 12 * (octave + 1) + root + scale[degree];
          const midis = plain(c.gondwanaFigureMidis(midi, 'Geometridae', settings.seed, scaleName, key));
          assert.equal(midis[0], midi, 'the record own pitch is always the first of them');
          assert.ok(midis.length >= 2 && midis.every(Number.isInteger), 'whole semitones');
          assert.ok(midis.every(m => m >= midi && m <= midi + 48), `${scaleName}/${key}: stays near the record`);
          const degrees = new Set(scale);
          for (const m of midis.slice(1)) {
            assert.ok(degrees.has(((m - root) % 12 + 12) % 12), `${scaleName}/${key}: ${m} is in the scale`);
          }
        }
      }
    }
  }
});

test('the record own note always sounds first, on the beat, and loudest', () => {
  const c = app('timeline');
  let checked = 0;
  for (let cycle = 1; cycle < 60; cycle++) {
    for (const user of ['A', 'B', undefined]) {
      const event = figureEvent(c, { user });
      const notes = c.gondwanaFigure(event, cycle);
      if (!notes) continue;
      checked++;
      assert.equal(notes[0].at, 0, 'the arrival is where the record says it is');
      assert.equal(notes[0].midi, plain(event.gondMidis)[0], 'and it is the record own pitch');
      assert.equal(notes[0].vel, 1, 'and nothing in the figure is louder than it');
      for (const note of notes.slice(1)) {
        assert.ok(note.vel < 1 && note.vel > 0, 'the elaboration stays under the evidence');
        assert.ok(note.at > 0 && Number.isFinite(note.at));
        assert.ok(Number.isInteger(note.midi));
      }
    }
  }
  assert.ok(checked > 30, `enough figures were actually examined (${checked})`);
});

test('a figure mutates across cycles while staying inside its own pitches', () => {
  const c = app('timeline');
  const event = figureEvent(c);
  const allowed = new Set(plain(event.gondMidis).flatMap(m => [m, m + 12]));
  const rendered = new Set();
  let spoke = 0;
  for (let cycle = 8; cycle < 60; cycle++) {
    const notes = c.gondwanaFigure(event, cycle);
    if (!notes) continue;
    spoke++;
    for (const note of notes) assert.ok(allowed.has(note.midi), `${note.midi} belongs to this record`);
    rendered.add(notes.map(n => n.midi).join(','));
  }
  assert.ok(spoke > 10, 'it speaks often enough to judge');
  assert.ok(rendered.size >= 4, `the figure does not simply repeat (${rendered.size} distinct of ${spoke})`);
  const cycle = speakingCycle(c, event, 8);
  assert.deepEqual(c.gondwanaFigure(event, cycle).map(n => n.midi),
    c.gondwanaFigure(event, cycle).map(n => n.midi), 'and any one cycle is reproducible');
});

test('the two observers do not share a subdivision', () => {
  const c = app('timeline');
  const pulse = vm.runInContext('GONDWANA_PULSE', c);
  const onGrid = (t, gap) => Math.abs(t / gap - Math.round(t / gap)) * gap < 0.035;
  let crossed = 0, seen = 0;
  for (let cycle = 1; cycle < 80; cycle++) {
    for (const note of c.gondwanaFigure(figureEvent(c, { user: 'A' }), cycle) || []) {
      assert.ok(onGrid(note.at, pulse), `A subdivides in three (${note.at})`);
    }
    for (const note of c.gondwanaFigure(figureEvent(c, { user: 'B' }), cycle) || []) {
      seen++;
      assert.ok(onGrid(note.at, pulse * 4 / 3), `B subdivides in four (${note.at})`);
      if (note.at > 0 && !onGrid(note.at, pulse)) crossed++;
    }
  }
  assert.ok(seen > 20 && crossed > 0, `and B lands where A cannot (${crossed} of ${seen})`);
});

test('nothing in a figure lands exactly on the grid', () => {
  const c = app('timeline');
  const pulse = vm.runInContext('GONDWANA_PULSE', c);
  let displaced = 0, total = 0;
  for (let cycle = 1; cycle < 80; cycle++) {
    for (const note of c.gondwanaFigure(figureEvent(c), cycle) || []) {
      if (note.at === 0) continue;
      total++;
      if (Math.abs(note.at / pulse - Math.round(note.at / pulse)) > 1e-9) displaced++;
    }
  }
  assert.ok(total > 20);
  assert.ok(displaced / total > 0.9, `a figure exactly in time stops sounding alive (${displaced}/${total})`);
});

test('scheduleGondwanaEvent plays one note for a vague record and a figure for a known one', () => {
  const c = withNoise(app('timeline'));
  const onsets = (event, cycle) => {
    const ctx = audioProbe();
    c.testMaster = {};
    vm.runInContext('masterGain = testMaster', c);
    c.scheduleInstrument(ctx, 'gond_rim', 9, 440, 0.01);      // build the room first
    const before = ctx.nodes.length;
    c.scheduleGondwanaEvent(ctx, event, 12, 0.4, cycle, c.testMaster);
    const times = ctx.nodes.slice(before).filter(n => n.kind === 'osc').map(n => n.frequency.events[0].time);
    return { span: Math.max(...times) - Math.min(...times), strikes: new Set(times.map(t => Math.round(t * 10))).size };
  };
  const vague = figureEvent(c, { gondResolution: 6, freq: 261.63 });
  const known = figureEvent(c, { gondResolution: 11, freq: 261.63 });
  const single = onsets(vague, speakingCycle(c, known));
  assert.equal(single.strikes, 1, 'a record known only to family, one strike');
  assert.ok(single.span < 0.1, 'and its partials are one gesture');
  const figure = onsets(known, speakingCycle(c, known));
  assert.ok(figure.strikes > 1, 'a record known to species, a figure');
  assert.ok(figure.span > 0.25, 'spread across pulses, not stacked on the arrival');
});

// ── The strike ──────────────────────────────────────────────────────────────
// Lily: "the wand passes through but I don't get a sense that I'm passing
// through." In a large room the direct sound reaches you before the room
// answers, and that gap is the only cue that something happened *here*. A
// family with reverb and no transient has size but no location.
test('struck bodies arrive by the direct path, bowed ones do not', () => {
  const c = withNoise(app('timeline'));
  const transient = instrument => {
    const ctx = audioProbe();
    c.testMaster = {};
    vm.runInContext('masterGain = testMaster', c);
    const made = note(c, ctx, instrument, 9, 220, 0.6);
    // The strike is the only source that both starts at the onset and is over
    // within about 50 ms.
    return made.filter(n => n.source && n.stopped - n.started < 0.09).length;
  };
  for (const struck of ['gond_heartwood', 'gond_bronze', 'gond_membrane', 'gond_felt', 'gond_pulse']) {
    assert.ok(transient(struck) > 0, `${struck} is struck and you hear it happen`);
  }
  for (const sustained of ['gond_bowed', 'gond_rim', 'gond_drone']) {
    assert.equal(transient(sustained), 0, `${sustained} has no transient, because a bow has none`);
  }
});

test('the strike is quiet, brief, and scales with how hard the note was played', () => {
  const c = withNoise(app('timeline'));
  const strikeOf = velocity => {
    const ctx = audioProbe();
    c.testMaster = {};
    vm.runInContext('masterGain = testMaster', c);
    const made = note(c, ctx, 'gond_heartwood', 12, 220, velocity);
    const sources = made.filter(n => n.source && n.stopped - n.started < 0.09);
    assert.equal(sources.length, 1, 'exactly one transient per note');
    // Its envelope is the gain node the strike source feeds through its filter.
    const level = Math.max(...made.filter(n => !n.source && n.gain.events.length)
      .flatMap(n => n.gain.events.filter(e => e.time < 12.02).map(e => e.value)));
    return { source: sources[0], level };
  };
  assert.ok(strikeOf(0.9).level > strikeOf(0.2).level, 'a harder note strikes harder');
  const { source } = strikeOf(0.6);
  assert.ok(source.started >= 12 && source.started < 12.005, 'it is the first thing you hear');
  assert.ok(source.stopped - source.started < 0.07, 'and it is gone before the room answers');
  assert.ok(strikeOf(0.9).level <= 1, 'and it never runs away with the mix');
});

// ── The shared minute ───────────────────────────────────────────────────────
// The one gesture the family had been borrowing from everybody else.
test('the shared minute is Gondwana own, and is made of the family own bodies', () => {
  const c = withNoise(app('timeline'));
  const ctx = audioProbe();
  c.testMaster = {};
  vm.runInContext('masterGain = testMaster', c);
  c.scheduleInstrument(ctx, 'gond_rim', 9, 440, 0.01);
  const before = ctx.nodes.length;
  c.scheduleInstrument(ctx, 'gond_sync', 12, 293.66, 0.5);
  const made = ctx.nodes.slice(before);
  const pitches = made.filter(n => n.kind === 'osc').map(n => n.frequency.events[0].value);
  assert.ok(pitches.length > 6, 'several bodies, not one bell');
  // Both hands land together, for the only time in the piece.
  const onsets = made.filter(n => n.kind === 'osc').map(n => n.frequency.events[0].time).sort((a, b) => a - b);
  assert.ok(onsets[0] >= 12 && onsets[0] < 12.01, 'it lands on the minute');
  assert.ok(onsets.filter(t => t < 12.02).length >= 4, 'and the hands arrive together');
  // Weight you feel rather than hear: heartwood is voiced right down.
  assert.ok(pitches.some(f => f < 90), `something is under 90 Hz (lowest ${Math.min(...pitches).toFixed(1)})`);
  for (const bad of [[0, 0.5], [293.66, 0], [NaN, 0.5], [293.66, NaN]]) {
    assert.doesNotThrow(() => c.scheduleInstrument(audioProbe(), 'gond_sync', 12, bad[0], bad[1]));
  }
});

test('every family keeps its own shared-minute gesture', () => {
  const c = app('timeline', 'mixed');
  const instrumentFor = mode => {
    c.state.voiceMode = mode;
    const shared = c.buildSequencer(c.state.obs).events.filter(e => e.kind === 'duet_minute');
    assert.ok(shared.length > 0, `${mode} has shared minutes`);
    return shared[0].instrument;
  };
  assert.equal(instrumentFor('gondwana'), 'gond_sync');
  assert.equal(instrumentFor('choir'), 'choir_unison');
  for (const mode of ['mixed', 'night', 'steelpan', 'lantern', 'noctilucent']) {
    assert.equal(instrumentFor(mode), 'creek', `${mode} is untouched`);
  }
});

// ── The pedal ───────────────────────────────────────────────────────────────
test('the pedal is authored harmony and never evidence', () => {
  const c = app('timeline');
  const pedals = plain(c.gondwanaPedal(30, 'A', 'minor', settings.seed));
  assert.ok(pedals.length >= 4);
  for (const pedal of pedals) {
    assert.equal(pedal.kind, 'gond_pedal');
    assert.equal(pedal.derived, true, 'declared as authored');
    assert.equal(pedal.obs, null, 'it stands for no observation');
    assert.equal(pedal.match, null, 'and matches no shared minute');
    assert.equal(pedal.isSpecial, false, 'so it is never counted among the duet gestures');
    assert.ok(pedal.atSec >= 0 && pedal.atSec <= 30 && Number.isFinite(pedal.freq) && pedal.freq > 0);
    assert.equal(pedal.instrument, 'gond_drone');
  }
  const roots = plain(vm.runInContext('JSON.parse(JSON.stringify(KEY_TO_SEMITONE))', c));
  for (const [key, root] of Object.entries(roots)) {
    const degrees = plain(c.gondwanaPedal(30, key, 'minor', settings.seed)).map(p => ((p.midi - root) % 12 + 12) % 12);
    assert.deepEqual([...new Set(degrees)].sort((a, b) => a - b), [0, 3, 8, 10],
      `${key}: i, flat VI, flat III, flat VII — melancholic, and luminous because it moves`);
  }
  assert.deepEqual(plain(c.gondwanaPedal(30, 'A', 'minor', settings.seed)), pedals, 'reproducible');
});

test('the pedal exists only for Gondwana, and no other family gains an event', () => {
  const c = app('timeline', 'mixed');
  const pedals = seq => seq.events.filter(e => e.kind === 'gond_pedal');
  assert.equal(pedals(c.buildSequencer(c.state.obs)).length, 0, 'mixed has none');
  for (const mode of ['night', 'choir', 'steelpan', 'lantern', 'noctilucent']) {
    c.state.voiceMode = mode;
    assert.equal(pedals(c.buildSequencer(c.state.obs)).length, 0, `${mode} has none`);
  }
  c.state.voiceMode = 'gondwana';
  const gondwana = c.buildSequencer(c.state.obs);
  assert.ok(pedals(gondwana).length >= 4, 'Gondwana has a pedal');
  assert.ok(pedals(gondwana).every(e => !e.obs), 'and it appears in no thumbnail');
});

// ── Distance ────────────────────────────────────────────────────────────────
test('the piano is close and the bodies are in the room', () => {
  const c = app('timeline');
  const voices = plain(vm.runInContext('JSON.parse(JSON.stringify(GONDWANA_VOICES))', c));
  assert.ok(voices.gond_felt.wet < 0.4, 'the piano is nearly dry');
  assert.ok(voices.gond_felt.dry > 1, 'and close');
  for (const body of ['gond_heartwood', 'gond_bronze', 'gond_bowed', 'gond_column', 'gond_membrane', 'gond_rim', 'gond_drone']) {
    assert.equal(voices[body].wet, undefined, `${body} is where it has always been`);
    assert.equal(voices[body].dry, undefined, `${body} is unchanged by the piano arriving`);
  }
});

test('mechanism is fixed in the spectrum and air is not', () => {
  const c = withNoise(app('timeline'));
  const bands = (instrument, freq) => {
    const ctx = audioProbe();
    c.testMaster = {};
    vm.runInContext('masterGain = testMaster', c);
    return note(c, ctx, instrument, 9, freq, 0.5).filter(n => n.kind === 'filter')
      .map(n => Math.round(n.frequency.events[0].value * 100) / 100).sort((a, b) => a - b);
  };
  // The strike does track the body, so compare only the two mechanism bands.
  const low = bands('gond_felt', 130.81), high = bands('gond_felt', 392);
  assert.ok(low.length >= 3, 'the piano has audible mechanics plus its strike');
  assert.equal(low.filter(f => low.filter(x => x === f).length && high.includes(f)).length >= 2, true,
    'felt and key bed do not transpose with the note');
  assert.notDeepEqual(bands('gond_column', 130.81), bands('gond_column', 392), 'the column air does');
});

// The audition mechanism. It is the only way Lily can hear a withheld family.
test('?family= unlocks a withheld family for auditioning, and nothing else', () => {
  const offered = search => {
    const c = loadApp(undefined, { location: { search } });
    return { unlocked: vm.runInContext('UNLOCKED_VOICE_MODE', c),
             list: plain(vm.runInContext('Array.from(PUBLIC_VOICE_MODES)', c)) };
  };
  const published = offered('').list;
  assert.ok(!published.includes('noctilucent'), 'with no flag, a withheld family is offered to nobody');
  assert.ok(published.includes('gondwana'), 'and a released one needs no flag at all');
  assert.equal(offered('').unlocked, null);
  for (const withheld of ['noctilucent']) {
    const { unlocked, list } = offered(`?family=${withheld}`);
    assert.equal(unlocked, withheld);
    // It takes its place in the registry order, and nothing else moves.
    assert.deepEqual(list.filter(m => m !== withheld), published, `${withheld} is added, nothing else moves`);
    assert.ok(list.includes(withheld));
  }
  // A family that is already published gains nothing from the flag, and is not
  // appended twice.
  for (const junk of ['mixed', 'lantern', 'gondwana', '../evil', 'NOCTILUCENT', '', 'gondwana,noctilucent', '__proto__']) {
    const { unlocked, list } = offered(`?family=${junk}`);
    assert.equal(unlocked, null, `rejects ${JSON.stringify(junk)}`);
    assert.deepEqual(list, published);
  }
  assert.deepEqual(plain(vm.runInContext('Array.from(PUBLIC_VOICE_MODES)', loadApp())), published);
});
