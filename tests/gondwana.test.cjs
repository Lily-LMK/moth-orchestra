'use strict';
// Gondwana — seven bodies that deepen with rank, voiced below the written
// score, sounding into a room of their own. These tests fix the three things
// that separate it from every earlier family: partials that enter late and
// outlive each other, an octave placement that is always exact, and a reverb
// bus that nothing else in the instrument touches.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { loadApp } = require('./harness.cjs');
const { settings } = require('./score.cjs');

const family = ['gond_heartwood', 'gond_bronze', 'gond_bowed', 'gond_column', 'gond_membrane', 'gond_rim', 'gond_drone'];
const CEILINGS = { gond_heartwood: 110, gond_bronze: 220, gond_bowed: 330, gond_column: 330, gond_membrane: 165, gond_drone: 110 };
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
test('the palette is seven bodies and does not grow with rank', () => {
  const c = app('timeline');
  assert.deepEqual(plain(vm.runInContext('Array.from(GONDWANA_INSTRUMENTS)', c)), family);
  for (const toneBy of ['taxon_class_name', 'taxon_family_name', 'taxon_tribe_name', 'taxon_species_name']) {
    c.state.toneBy = toneBy;
    assert.deepEqual(plain(vm.runInContext('Array.from(gondwanaPoolForDepth(currentRankDepth()))', c)), family,
      `${toneBy}: the same seven bodies`);
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
  assert.equal(voices.size, 7);
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
    const identity = seq => plain(seq.events.filter(e => e.kind === 'obs').map(({ instrument, ...e }) => e));
    assert.deepEqual(identity(candidate), identity(baseline), 'the written score is untouched; only the instrument differs');
    assert.ok(candidate.events.filter(e => e.kind === 'obs').every(e => family.includes(e.instrument)));
    assert.deepEqual(plain(candidate.events), plain(c.buildSequencer(c.state.obs).events), 'reproducible');
    assert.deepEqual(plain(candidate.meta.sharedMinutes), plain(baseline.meta.sharedMinutes));
    assert.deepEqual(plain(candidate.events.filter(e => e.kind !== 'obs')),
      plain(baseline.events.filter(e => e.kind !== 'obs')), 'all special gestures and source matches are preserved');
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
