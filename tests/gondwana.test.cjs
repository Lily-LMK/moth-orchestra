'use strict';
// Gondwana — fifteen authored voices built from physical models. These tests
// were written before the synthesis existed. They fix the contract: the family
// must be rank-graded (unlike every earlier family, which is a flat list), must
// be at least as large as the Moth Orchestra palette at every rank, must leave
// the score untouched, and must obey the same Web Audio contract as Noctilucent.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { loadApp } = require('./harness.cjs');
const { settings } = require('./score.cjs');

const BASE = ['gond_stone', 'gond_log', 'gond_skin', 'gond_tube', 'gond_rim', 'gond_vessel', 'gond_bar'];
const SUBFAMILY = [...BASE, 'gond_gourd', 'gond_air'];
const TRIBE = [...SUBFAMILY, 'gond_shell', 'gond_reed'];
const GENUS = [...TRIBE, 'gond_ice', 'gond_sinew'];
const SPECIES = [...GENUS, 'gond_cave', 'gond_thread'];
const family = SPECIES;
const plain = value => JSON.parse(JSON.stringify(value));

// Rank fields, shallowest first, with the palette each must unlock.
const RANKS = [
  ['taxon_class_name', BASE], ['taxon_order_name', BASE], ['taxon_superfamily_name', BASE],
  ['taxon_family_name', BASE], ['taxon_subfamily_name', SUBFAMILY], ['taxon_tribe_name', TRIBE],
  ['taxon_genus_name', GENUS], ['taxon_species_name', SPECIES]
];

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

// The measured finding behind this family: depth of rank buys timbre, and a
// four-voice family has spent everything it has by family rank. Gondwana must
// keep revealing all the way to species.
test('the palette is rank-graded and keeps opening: 7, 9, 11, 13, 15', () => {
  const c = app('timeline');
  for (const [toneBy, expected] of RANKS) {
    c.state.toneBy = toneBy;
    const pool = plain(vm.runInContext('Array.from(gondwanaPoolForDepth(currentRankDepth()))', c));
    assert.deepEqual(pool, expected, `${toneBy} unlocks ${expected.length} voices`);
  }
  assert.equal(SPECIES.length, 15);
  assert.equal(new Set(SPECIES).size, 15, 'no voice is listed twice');
});

test('at every rank Gondwana is at least as large as the Moth Orchestra palette', () => {
  const c = app('timeline');
  for (const [toneBy] of RANKS) {
    c.state.toneBy = toneBy;
    const mixed = vm.runInContext('instrumentPoolForDepth(currentRankDepth()).length', c);
    const gondwana = vm.runInContext('gondwanaPoolForDepth(currentRankDepth()).length', c);
    assert.ok(gondwana >= mixed, `${toneBy}: ${gondwana} against ${mixed}`);
  }
  c.state.toneBy = 'taxon_species_name';
  assert.ok(vm.runInContext('gondwanaPoolForDepth(currentRankDepth()).length', c) >
    vm.runInContext('instrumentPoolForDepth(currentRankDepth()).length', c), 'species rank is strictly richer');
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
  assert.equal(voices.size, 15, 'species rank reaches every voice');
});

test('shallow ranks select only from the shallow palette', () => {
  const c = app('timeline', 'gondwana', 'taxon_class_name');
  const voices = new Set();
  for (let i = 0; i < 200; i++) voices.add(c.pickInstrument(`Group ${i}`, settings.seed));
  assert.deepEqual([...voices].sort(), [...BASE].sort());
});

for (const mode of ['timeline', 'riff']) {
  test(`${mode}: Gondwana preserves observation timing, pitches, density and source identities`, () => {
    const c = app(mode, 'mixed');
    const baseline = c.buildSequencer(c.state.obs);
    c.state.voiceMode = 'gondwana';
    const candidate = c.buildSequencer(c.state.obs);
    const identity = seq => plain(seq.events.filter(e => e.kind === 'obs').map(({ instrument, ...e }) => e));
    assert.deepEqual(identity(candidate), identity(baseline));
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

// Same probe as the Noctilucent suite: finite automation, bounded envelopes,
// stopped sources, a path to the shared master. Internal topology is not asserted.
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
  function node(source = false) {
    const n = { gain: param('gain'), frequency: param('frequency'), detune: param('detune'),
      Q: param('Q'), connections: [], connect(target) { this.connections.push(target); return target; },
      disconnect() { this.disconnected = true; this.connections = []; }, start(time) { assert.ok(Number.isFinite(time)); this.started = time; },
      stop(time) { assert.ok(Number.isFinite(time)); this.stopped = time; }, source };
    for (const name of ['gain', 'frequency', 'detune', 'Q']) n[name].owner = n;
    nodes.push(n); return n;
  }
  return { nodes, automation, destination: {}, currentTime: 10, sampleRate: 48000,
    createGain: () => node(), createOscillator: () => node(true), createBiquadFilter: () => node(),
    createBufferSource: () => node(true), createWaveShaper: () => node(),
    createBuffer: (_, length) => ({ getChannelData: () => new Float32Array(length) }) };
}
// Voices with a breath or air layer need the shared noise buffer the running
// application always has. Supply one so that layer is actually exercised.
function withNoise(c) {
  vm.runInContext('noiseBuf = { length: 48000, sampleRate: 48000 }', c);
  return c;
}

for (const instrument of family) test(`${instrument}: synthesis schedules finite envelopes, routes to master and stops all sources`, () => {
  const c = withNoise(app('timeline'));
  for (const [freq, velocity] of [[65.4, 0.12], [440, 0.65], [2093, 0.65]]) {
    const ctx = audioProbe();
    c.testMaster = {};
    vm.runInContext('masterGain = testMaster', c);
    c.scheduleInstrument(ctx, instrument, 9, freq, velocity);
    const sources = ctx.nodes.filter(n => n.source);
    assert.ok(sources.length > 0);
    const reachesMaster = (n, seen = new Set()) => {
      if (n === c.testMaster) return true;
      if (seen.has(n)) return false;
      seen.add(n);
      return (n.owner ? [n.owner] : n.connections || []).some(next => reachesMaster(next, seen));
    };
    for (const node of ctx.nodes) {
      const controlsFrequency = node.connections.some(target => target.name === 'frequency' || target.name === 'detune');
      if (!controlsFrequency) assert.ok(node.gain.events.every(event => event.value <= 1), 'audio gain is bounded; frequency modulation depth is measured in Hz');
    }
    for (const source of sources) {
      assert.ok(source.started >= ctx.currentTime);
      assert.ok(source.stopped > source.started && source.stopped - source.started <= 3.2);
      assert.ok(reachesMaster(source));
    }
  }
});

test('the fifteen Gondwana voices schedule distinct timbres at the same pitch and velocity', () => {
  const c = withNoise(app('timeline'));
  const signatures = family.map(instrument => {
    const ctx = audioProbe();
    c.scheduleInstrument(ctx, instrument, 11, 440, 0.4);
    return JSON.stringify(ctx.automation);
  });
  assert.equal(new Set(signatures).size, family.length, 'each named voice must differ audibly from its siblings and from the generic fallback');
});

// The design rule from the plan: depth of rank is a parameter of the synthesis
// itself, not only of which voice is chosen. Deeper rank is more articulate.
// It must never move the scored fundamental.
test('rank articulates the attack without moving the scored pitch', () => {
  const c = withNoise(app('timeline'));
  const shallow = plain(vm.runInContext('gondwanaArticulation(0)', c));
  const deep = plain(vm.runInContext('gondwanaArticulation(7)', c));
  assert.equal(shallow.attack, 1, 'class rank is the unarticulated reference');
  assert.ok(deep.attack < shallow.attack && deep.attack >= 0.7, 'species rank is promptly struck, within a bounded quarter');
  assert.ok(deep.colour > shallow.colour, 'species rank lifts the upper partials');

  for (const instrument of family) {
    const at = toneBy => {
      c.state.toneBy = toneBy;
      const ctx = audioProbe();
      c.scheduleInstrument(ctx, instrument, 11, 440, 0.4);
      return ctx;
    };
    const shallowCtx = at('taxon_class_name');
    const deepCtx = at('taxon_species_name');
    const gains = ctx => ctx.automation.filter(a => a.name === 'gain');
    assert.equal(gains(deepCtx).length, gains(shallowCtx).length, `${instrument}: the same body, differently struck`);
    let strictlyEarlier = 0;
    gains(deepCtx).forEach((event, i) => {
      const reference = gains(shallowCtx)[i];
      assert.ok(event.time <= reference.time + 1e-9, `${instrument}: no envelope point arrives later at species rank`);
      if (event.time < reference.time - 1e-9) strictlyEarlier++;
    });
    assert.ok(strictlyEarlier > 0, `${instrument}: species rank must actually be more articulate, not merely no slower`);
    for (const ctx of [shallowCtx, deepCtx]) {
      assert.ok(ctx.automation.some(a => a.name === 'frequency' && Math.abs(a.value - 440) < 1e-6),
        `${instrument}: the scored fundamental is retained at every rank`);
    }
  }
});

for (const instrument of family) {
  test(`${instrument}: zero or invalid amplitude and invalid frequency create no audible sources`, () => {
    const c = withNoise(app('timeline'));
    for (const [freq, velocity] of [[440, 0], [440, -1], [440, NaN], [440, Infinity],
      [440, undefined], [NaN, 0.4], [Infinity, 0.4], [0, 0.4], [-440, 0.4], [undefined, 0.4]]) {
      const ctx = audioProbe();
      assert.doesNotThrow(() => c.scheduleInstrument(ctx, instrument, 11, freq, velocity));
      assert.equal(ctx.nodes.filter(n => n.source).length, 0);
      assert.ok(ctx.nodes.every(n => n.connections.length === 0), 'silent requests cannot connect to the output');
    }
  });

  test(`${instrument}: high notes omit partials at or above 45 percent of sample rate`, () => {
    const c = withNoise(app('timeline'));
    for (const sampleRate of [22050, 44100, 48000, 96000]) {
      for (const frequency of [65.4, sampleRate * 0.2, sampleRate * 0.449, sampleRate * 0.45, sampleRate]) {
        const ctx = audioProbe();
        ctx.sampleRate = sampleRate;
        c.scheduleInstrument(ctx, instrument, 11, frequency, 0.4);
        const frequencies = ctx.automation.filter(a => a.name === 'frequency').map(a => a.value);
        assert.ok(frequencies.every(f => f > 0 && f < sampleRate * 0.45));
        if (frequency >= sampleRate * 0.45) assert.equal(ctx.nodes.filter(n => n.source).length, 0, 'out-of-band fundamentals are silent');
      }
    }
  });

  test(`${instrument}: ending every source disconnects its complete temporary audio graph`, () => {
    const c = withNoise(app('timeline'));
    const ctx = audioProbe();
    c.scheduleInstrument(ctx, instrument, 11, 440, 0.4);
    const sources = ctx.nodes.filter(n => n.source);
    assert.ok(sources.length > 0);
    for (const source of sources) {
      assert.equal(typeof source.onended, 'function');
      source.onended();
      assert.equal(source.disconnected, true);
    }
    assert.ok(ctx.nodes.every(n => n.disconnected && n.connections.length === 0), 'all sources, filters and gains release their connections');
  });
}

// Gondwana is built and tested but has not been judged by ear. Like Noctilucent
// before it, it stays out of the published dropdown until Lily accepts it.
test('Gondwana is built but withheld from the user-facing family list', () => {
  const c = loadApp();
  const published = vm.runInContext('Array.from(PUBLIC_VOICE_MODES)', c);
  assert.ok(!published.includes('gondwana'), 'not offered to the listener');
  assert.ok(vm.runInContext('VOICE_MODES.includes("gondwana")', c), 'still registered');
  assert.deepEqual(plain(published), ['mixed', 'night', 'choir', 'steelpan', 'lantern']);
});
