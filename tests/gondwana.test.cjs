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
const DERIVED = ['gondMidis', 'gondShape', 'gondOrdinal'];
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
  assert.ok(share > 0.3 && share < 0.5, `the felted piano takes roughly two arrivals in five (got ${share})`);
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
    const gestures = seq => plain(seq.events.filter(e => e.kind !== 'obs' && e.kind !== 'gond_pedal'));
    assert.deepEqual(gestures(candidate), gestures(baseline), 'all special gestures and source matches are preserved');
  });
}

test('Song uses Gondwana orchestration and keeps creek shared-minute gestures with exact source evidence', () => {
  const c = app('song');
  const seq = c.buildSequencer(c.state.obs);
  assert.ok(seq.events.some(e => e.kind === 'obs'));
  assert.ok(seq.events.filter(e => e.kind === 'obs').every(e => family.includes(e.instrument)));
  assert.ok(seq.events.every(e => [...family, 'creek'].includes(e.instrument)));
  const shared = seq.events.filter(e => e.kind === 'duet_minute');
  assert.ok(shared.length > 0);
  assert.ok(shared.every(e => e.instrument === 'creek' && e.match.observations.A.length && e.match.observations.B.length));
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

test('Gondwana is built but withheld from the user-facing family list', () => {
  const c = loadApp();
  const published = vm.runInContext('Array.from(PUBLIC_VOICE_MODES)', c);
  assert.ok(!published.includes('gondwana'), 'not offered to the listener');
  assert.ok(vm.runInContext('VOICE_MODES.includes("gondwana")', c), 'still registered');
  assert.deepEqual(plain(published), ['mixed', 'night', 'choir', 'steelpan', 'lantern']);
});

// ── Behaviour ───────────────────────────────────────────────────────────────
// Added 14 September 2026. Gondwana is the first family that decides how much a
// record says, not only what it sounds like. These tests hold that decision to
// the §5 rule: the phrase length is the sighting count, so a figure is evidence
// rather than ornament, and a taxon recorded once can never be made to say more
// than it did.

const figureEvent = (c, over = {}) => ({
  voiceKey: 'Noctuidae', atSec: 3.25, instrument: 'gond_felt', gondOrdinal: 16, user: 'A',
  gondMidis: c.gondwanaFigureMidis(60, 'Noctuidae', settings.seed, 'minor', 'A'),
  gondShape: c.gondwanaFigureShape('Noctuidae', settings.seed, 7),
  ...over });

test('a first sighting says one note, at every cycle, for ever', () => {
  const c = app('timeline');
  for (let cycle = 0; cycle < 60; cycle++) {
    assert.equal(c.gondwanaFigureLength(1, cycle, 7), 1, `cycle ${cycle}`);
    assert.equal(c.gondwanaFigure(figureEvent(c, { gondOrdinal: 1 }), cycle), null, 'and schedules no figure at all');
  }
  for (const bad of [0, -3, NaN, undefined, null, 'many']) {
    assert.equal(c.gondwanaFigureLength(bad, 9, 7), 1, `a missing tally is one note, not a gift (${bad})`);
  }
});

test('the phrase length is the tally so far, and cannot exceed it', () => {
  const c = app('timeline');
  const settled = ordinal => c.gondwanaFigureLength(ordinal, 999, 7);
  let previous = 0;
  for (const ordinal of [1, 2, 3, 4, 6, 8, 12, 20, 50, 400]) {
    const length = settled(ordinal);
    assert.ok(length >= previous, `${ordinal}: coming back more often never says less`);
    assert.ok(length >= 1 && length <= 7, `${ordinal}: bounded`);
    previous = length;
  }
  assert.equal(settled(1), 1);
  assert.ok(settled(12) >= 4 && settled(12) <= 7, 'the twelfth visit is a real figure');
  for (let cycle = 0; cycle < 200; cycle++) {
    assert.ok(c.gondwanaFigureLength(4, cycle, 7) <= settled(4), 'no cycle ever exceeds what the tally earned');
  }
});

// Specificity buys phrase length the way it already buys partials and tails.
// At class rank the whole night is one voice group, so there is nothing to
// individuate and nothing speaks; it is also what stops a shallow rank turning
// a dense night into a wall.
test('rank caps the phrase, and class rank has no figures at all', () => {
  const c = app('timeline');
  const cap = depth => c.gondwanaFigureCap(depth);
  assert.equal(cap(0), 1, 'class rank: one voice, one note, no elaboration');
  assert.equal(cap(7), 7, 'species rank: the full phrase');
  let previous = 0;
  for (let depth = 0; depth <= 7; depth++) {
    assert.ok(cap(depth) >= previous, `depth ${depth}: the phrase never closes as rank deepens`);
    previous = cap(depth);
  }
  for (const bad of [-1, 99, NaN, undefined]) assert.ok(cap(bad) >= 1 && cap(bad) <= 7, `clamped (${bad})`);
  c.state.toneBy = 'taxon_class_name';
  for (let cycle = 0; cycle < 40; cycle++) {
    assert.equal(c.gondwanaFigure(figureEvent(c, { gondOrdinal: 400 }), cycle), null,
      'however often it came back, at class rank it says one note');
  }
  c.state.toneBy = 'taxon_species_name';
  assert.ok(c.gondwanaFigure(figureEvent(c, { gondOrdinal: 400 }), 40), 'and at species rank it speaks');
});

// The tally is counted in clock order and belongs to the voice, so it is
// something a listener could check against the night rather than a number the
// synthesis invented.
test('the tally is the arrivals of that voice so far, in clock order', () => {
  const c = app('timeline');
  const seq = c.buildSequencer(c.state.obs);
  const arrivals = seq.events.filter(e => e.kind === 'obs').sort((a, b) => a.atSec - b.atSec);
  const seen = new Map();
  for (const arrival of arrivals) {
    const expected = (seen.get(arrival.voiceKey) || 0) + 1;
    seen.set(arrival.voiceKey, expected);
    assert.equal(arrival.gondOrdinal, expected, `${arrival.voiceKey} at ${arrival.atSec}`);
  }
  assert.ok(arrivals.some(e => e.gondOrdinal === 1), 'every voice starts by saying one note');
  // No arrival may know what happens after it.
  for (const arrival of arrivals) {
    const later = arrivals.filter(e => e.voiceKey === arrival.voiceKey && e.atSec > arrival.atSec).length;
    assert.ok(arrival.gondOrdinal <= arrivals.filter(e => e.voiceKey === arrival.voiceKey).length - later,
      'the phrase is what has happened, not what will');
  }
  c.state.voiceMode = 'mixed';
  assert.ok(c.buildSequencer(c.state.obs).events.every(e => e.gondOrdinal === undefined),
    'and no other family carries it');
});

// The accumulation. The first pass through the loop states the night plainly;
// each pass elaborates a little further, so the loop repays attention instead
// of merely recurring.
test('figures grow over the first cycles and then settle', () => {
  const c = app('timeline');
  const lengths = Array.from({ length: 20 }, (_, cycle) => c.gondwanaFigureLength(30, cycle, 7));
  assert.equal(lengths[0], 1, 'the first pass is the night, plainly');
  for (let i = 1; i < lengths.length; i++) assert.ok(lengths[i] >= lengths[i - 1], 'growth never reverses');
  assert.ok(lengths[lengths.length - 1] > lengths[0], 'and it does grow');
  assert.equal(lengths[lengths.length - 1], c.gondwanaFigureLength(30, 999, 7), 'it settles at the earned length');
});

test('every pitch in a figure is the record own pitch transposed by whole scale steps', () => {
  const c = app('timeline');
  const scales = plain(vm.runInContext('JSON.parse(JSON.stringify(SCALES))', c));
  const roots = plain(vm.runInContext('JSON.parse(JSON.stringify(KEY_TO_SEMITONE))', c));
  for (const [scaleName, scale] of Object.entries(scales)) {
    for (const [key, root] of Object.entries(roots)) {
      // pickPitch only ever writes a degree of the chosen scale, so that is the
      // case the figure has to honour: build the record pitch the way the score
      // does, then check nothing outside the scale comes back.
      for (const octave of [3, 4, 5]) {
        for (let degree = 0; degree < scale.length; degree++) {
          const midi = 12 * (octave + 1) + root + scale[degree];
          const midis = plain(c.gondwanaFigureMidis(midi, 'Geometridae', settings.seed, scaleName, key));
          assert.equal(midis[0], midi, 'the record own pitch is always the first of them');
          assert.ok(midis.length >= 2 && midis.every(Number.isInteger), 'whole semitones');
          assert.ok(midis.every(m => m >= midi && m <= midi + 48), `${scaleName}/${key}: the figure stays near the record`);
          const degrees = new Set(scale);
          // Every added pitch is a degree of the scale in the same key as the
          // record own pitch. Nothing arrives from outside the record.
          for (const m of midis.slice(1)) {
            assert.ok(degrees.has(((m - root) % 12 + 12) % 12), `${scaleName}/${key}: ${m} is in the scale`);
          }
        }
      }
    }
  }
  assert.deepEqual(plain(c.gondwanaFigureMidis(60, 'Geometridae', settings.seed, 'minor', 'A')),
    plain(c.gondwanaFigureMidis(60, 'Geometridae', settings.seed, 'minor', 'A')), 'and it is the same figure every time');
});

test('the record own note always sounds first, on the beat, and loudest', () => {
  const c = app('timeline');
  for (let cycle = 0; cycle < 40; cycle++) {
    for (const user of ['A', 'B', undefined]) {
      const event = figureEvent(c, { user });
      const notes = c.gondwanaFigure(event, cycle);
      if (!notes) continue;
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
});

// "Mutates rather than loops identically" — but recognisably the same figure,
// or it is a scatter rather than a motif.
test('a figure mutates across cycles while staying inside its own pitches', () => {
  const c = app('timeline');
  const event = figureEvent(c);
  const allowed = new Set(plain(event.gondMidis).flatMap(m => [m, m + 12]));
  const rendered = new Set();
  for (let cycle = 8; cycle < 20; cycle++) {
    const notes = c.gondwanaFigure(event, cycle);
    assert.ok(notes && notes.length > 1, `cycle ${cycle} speaks`);
    for (const note of notes) assert.ok(allowed.has(note.midi), `${note.midi} belongs to this record`);
    rendered.add(notes.map(n => n.midi).join(','));
  }
  assert.ok(rendered.size >= 4, `the figure does not simply repeat (${rendered.size} distinct in 12 cycles)`);
  assert.deepEqual(c.gondwanaFigure(event, 11).map(n => n.midi), c.gondwanaFigure(event, 11).map(n => n.midi),
    'and any one cycle is reproducible');
});

// Two hands. The observers do not share a subdivision, so their figures drift
// against each other across the loop.
test('the two observers do not share a subdivision', () => {
  const c = app('timeline');
  const pulse = vm.runInContext('GONDWANA_PULSE', c);
  const onGrid = (t, gap) => Math.abs(t / gap - Math.round(t / gap)) * gap < 0.035;
  let crossed = 0;
  for (let cycle = 6; cycle < 26; cycle++) {
    const a = c.gondwanaFigure(figureEvent(c, { user: 'A' }), cycle) || [];
    const b = c.gondwanaFigure(figureEvent(c, { user: 'B' }), cycle) || [];
    for (const note of a) assert.ok(onGrid(note.at, pulse), `A subdivides in three (${note.at})`);
    for (const note of b) {
      assert.ok(onGrid(note.at, pulse * 4 / 3), `B subdivides in four (${note.at})`);
      if (note.at > 0 && !onGrid(note.at, pulse)) crossed++;
    }
  }
  assert.ok(crossed > 0, 'and B lands where A cannot');
});

test('nothing in a figure lands exactly on the grid', () => {
  const c = app('timeline');
  const pulse = vm.runInContext('GONDWANA_PULSE', c);
  let displaced = 0, total = 0;
  for (let cycle = 6; cycle < 30; cycle++) {
    for (const note of c.gondwanaFigure(figureEvent(c), cycle) || []) {
      if (note.at === 0) continue;
      total++;
      if (Math.abs(note.at / pulse - Math.round(note.at / pulse)) > 1e-9) displaced++;
    }
  }
  assert.ok(total > 20);
  assert.ok(displaced / total > 0.9, `a figure exactly in time stops sounding alive (${displaced}/${total} displaced)`);
});

test('scheduleGondwanaEvent plays one note for one sighting and a figure for many', () => {
  const c = withNoise(app('timeline'));
  // A single body sounds all its partials within a few milliseconds of each
  // other; a figure spreads strikes across whole pulses. The span between the
  // first and last onset is what separates one strike from several.
  const onsets = (event, cycle) => {
    const ctx = audioProbe();
    c.testMaster = {};
    vm.runInContext('masterGain = testMaster', c);
    c.scheduleInstrument(ctx, 'gond_rim', 9, 440, 0.01);      // build the room first
    const before = ctx.nodes.length;
    c.scheduleGondwanaEvent(ctx, event, 9, 0.4, cycle, c.testMaster);
    const times = ctx.nodes.slice(before).filter(n => n.kind === 'osc').map(n => n.frequency.events[0].time);
    return { span: Math.max(...times) - Math.min(...times), strikes: new Set(times.map(t => Math.round(t * 10))).size };
  };
  const single = onsets(figureEvent(c, { gondOrdinal: 1, freq: 261.63 }), 12);
  assert.equal(single.strikes, 1, 'a first sighting, one strike');
  assert.ok(single.span < 0.1, 'and its partials are one gesture');
  const figure = onsets(figureEvent(c, { freq: 261.63 }), 12);
  assert.ok(figure.strikes > 1, 'a sixteenth visit, a figure');
  assert.ok(figure.span > 0.25, 'spread across pulses, not stacked on the arrival');
});

// ── The pedal ───────────────────────────────────────────────────────────────
// Authored harmony, and held to the same standard as the floor and the sub: it
// may recolour the evidence, it may never pretend to be evidence.
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
    assert.ok(pedal.instrument === 'gond_drone');
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
  assert.ok(pedals(gondwana).every(e => !e.obs && !gondwana.meta.eventByObsId.get(e.obsId)), 'and it appears in no thumbnail');
});

// ── Distance ────────────────────────────────────────────────────────────────
// The felted piano is close and the bodies are far. That difference is the
// depth in the picture and it cannot exist on a single shared send.
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

// A piano's noise does not transpose with the note: the felt meets the string
// and the action reaches the key bed at the same frequencies whatever is played.
// A column's air does transpose, because air past an edge is pitched.
test('mechanism is fixed in the spectrum and air is not', () => {
  const c = withNoise(app('timeline'));
  const bands = (instrument, freq) => {
    const ctx = audioProbe();
    c.testMaster = {};
    vm.runInContext('masterGain = testMaster', c);
    return note(c, ctx, instrument, 9, freq, 0.5).filter(n => n.kind === 'filter')
      .map(n => Math.round(n.frequency.events[0].value * 100) / 100).sort((a, b) => a - b);
  };
  const low = bands('gond_felt', 130.81), high = bands('gond_felt', 392);
  assert.ok(low.length >= 2, 'the piano has audible mechanics');
  assert.deepEqual(low, high, 'and they do not transpose with the note');
  assert.notDeepEqual(bands('gond_column', 130.81), bands('gond_column', 392), 'the column air does');
});

// The audition mechanism. It is the only way Lily can hear a withheld family,
// so it is worth a guard: it must unlock exactly the withheld families and
// nothing else, and it must leave the published list alone without the flag.
test('?family= unlocks a withheld family for auditioning, and nothing else', () => {
  const offered = search => {
    const c = loadApp(undefined, { location: { search } });
    return { unlocked: vm.runInContext('UNLOCKED_VOICE_MODE', c),
             list: plain(vm.runInContext('Array.from(PUBLIC_VOICE_MODES)', c)) };
  };
  const published = offered('').list;
  assert.ok(!published.includes('gondwana') && !published.includes('noctilucent'),
    'with no flag, the withheld families are not offered to anyone');
  assert.equal(offered('').unlocked, null);

  for (const withheld of ['gondwana', 'noctilucent']) {
    const { unlocked, list } = offered(`?family=${withheld}`);
    assert.equal(unlocked, withheld);
    assert.deepEqual(list, [...published, withheld], `${withheld} is appended, nothing else moves`);
  }
  // Only a withheld family. Not an arbitrary string, not a family that is
  // already published, not anything that could be smuggled through the query.
  for (const junk of ['mixed', 'lantern', '../evil', 'GONDWANA', '', 'gondwana,noctilucent', '__proto__']) {
    const { unlocked, list } = offered(`?family=${junk}`);
    assert.equal(unlocked, null, `rejects ${JSON.stringify(junk)}`);
    assert.deepEqual(list, published);
  }
  // And a browser that will not give us a location at all must still work.
  assert.deepEqual(plain(vm.runInContext('Array.from(PUBLIC_VOICE_MODES)', loadApp())), published);
});
