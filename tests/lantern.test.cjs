'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { loadApp } = require('./harness.cjs');
const { settings } = require('./score.cjs');
const family = ['lantern_felt', 'lantern_glass', 'lantern_reed', 'lantern_bloom'];
const plain = value => JSON.parse(JSON.stringify(value));
function app(mode, voiceMode = 'lantern') {
  const c = loadApp();
  Object.assign(c.state, settings, { spacingMode: mode, voiceMode });
  return c;
}

test('Lantern Glass is an optional named family and existing families remain available', () => {
  const c = loadApp();
  assert.equal(c.state.voiceMode, 'mixed');
  for (const mode of ['mixed', 'night', 'choir', 'steelpan']) {
    assert.ok(vm.runInContext('Array.from(VOICE_MODES)', c).includes(mode), `retains ${mode}`);
  }
  assert.equal(vm.runInContext('VOICE_MODES.includes("lantern") && VOICE_MODE_LABELS.lantern', c), 'Lantern Glass');
});

test('taxonomic selection reaches four Lantern voices deterministically without observer dependence', () => {
  const c = app('timeline');
  const voices = new Set();
  for (let i = 0; i < 100; i++) {
    const group = `Synthetic taxonomic group ${i}`;
    const first = c.pickInstrument(group, settings.seed);
    assert.ok(family.includes(first), first);
    voices.add(first);
    c.state.listenMode = i % 2 ? 'A' : 'B';
    assert.equal(c.pickInstrument(group, settings.seed), first);
    assert.equal(c.pickSongInstrument(group, settings.seed), first);
  }
  assert.equal(voices.size, 4);
});

for (const mode of ['timeline', 'riff']) {
  test(`${mode}: Lantern preserves observation timing, pitches, density and source identities`, () => {
    const c = app(mode, 'mixed');
    const baseline = c.buildSequencer(c.state.obs);
    c.state.voiceMode = 'lantern';
    const candidate = c.buildSequencer(c.state.obs);
    const identity = seq => plain(seq.events.filter(e => e.kind === 'obs').map(e => ({
      id: e.obs.id, user: e.user, atSec: e.atSec, midi: e.midi, freq: e.freq, density: e.density
    })));
    assert.deepEqual(identity(candidate), identity(baseline));
    assert.ok(candidate.events.filter(e => e.kind === 'obs').every(e => family.includes(e.instrument)));
    assert.deepEqual(plain(candidate.events), plain(c.buildSequencer(c.state.obs).events));
    assert.deepEqual(plain(candidate.meta.sharedMinutes), plain(baseline.meta.sharedMinutes));
    assert.deepEqual(plain(candidate.events.filter(e => e.kind === 'duet_minute')),
      plain(baseline.events.filter(e => e.kind === 'duet_minute')));
  });
}

test('Song uses Lantern orchestration and creek shared-minute gestures with exact source evidence', () => {
  const c = app('song');
  const seq = c.buildSequencer(c.state.obs);
  assert.ok(seq.events.some(e => e.kind === 'obs'));
  assert.ok(seq.events.filter(e => e.kind === 'obs').every(e => family.includes(e.instrument)));
  assert.ok(seq.events.every(e => [...family, 'creek'].includes(e.instrument)));
  const shared = seq.events.filter(e => e.kind === 'duet_minute');
  assert.equal(shared.length, 8);
  assert.ok(shared.every(e => e.instrument === 'creek' && e.match.observations.A.length && e.match.observations.B.length));
  assert.deepEqual(plain(seq.events), plain(c.buildSequencer(c.state.obs).events));
});

for (const mode of ['timeline', 'riff', 'song']) test(`${mode}: empty Lantern score is silent`, () => {
  const c = app(mode);
  assert.equal(c.buildSequencer([]).events.length, 0);
});

// Observe the Web Audio contract: finite automation, bounded envelopes, stopped
// sources and a path to the shared master. This does not assert internal topology.
function audioProbe() {
  const nodes = [];
  const automation = [];
  function param(name) {
    return { value: 0,
      setValueAtTime(value, time) { check(value, time); },
      linearRampToValueAtTime(value, time) { check(value, time); },
      exponentialRampToValueAtTime(value, time) { check(value, time); assert.ok(value > 0); },
      setTargetAtTime(value, time, constant) { check(value, time); assert.ok(constant > 0); },
      cancelScheduledValues() {} };
    function check(value, time) {
      assert.ok(Number.isFinite(value) && Number.isFinite(time), `${name}: finite automation`);
      if (name === 'gain') assert.ok(value >= 0 && value <= 1, 'bounded gain');
      automation.push({ name, value, time });
    }
  }
  function node(source = false) {
    const n = { gain: param('gain'), frequency: param('frequency'), detune: param('detune'),
      Q: param('Q'), connections: [], connect(target) { this.connections.push(target); return target; },
      disconnect() { this.disconnected = true; this.connections = []; }, start(time) { assert.ok(Number.isFinite(time)); this.started = time; },
      stop(time) { assert.ok(Number.isFinite(time)); this.stopped = time; }, source };
    nodes.push(n); return n;
  }
  const destination = {};
  return { nodes, automation, destination, currentTime: 10, sampleRate: 48000,
    createGain: () => node(), createOscillator: () => node(true), createBiquadFilter: () => node(),
    createBufferSource: () => node(true), createWaveShaper: () => node(),
    createBuffer: (_, length) => ({ getChannelData: () => new Float32Array(length) }) };
}
for (const instrument of family) test(`${instrument}: synthesis schedules finite envelopes, routes to master and stops all sources`, () => {
  const c = app('timeline');
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
      return (n.connections || []).some(next => reachesMaster(next, seen));
    };
    for (const source of sources) {
      assert.ok(source.started >= ctx.currentTime);
      assert.ok(source.stopped > source.started && source.stopped - source.started <= 8);
      assert.ok(reachesMaster(source));
    }
  }
});

test('the four Lantern voices schedule distinct timbres at the same pitch and velocity', () => {
  const c = app('timeline');
  const signatures = family.map(instrument => {
    const ctx = audioProbe();
    c.scheduleInstrument(ctx, instrument, 11, 440, 0.4);
    return JSON.stringify(ctx.automation);
  });
  assert.equal(new Set(signatures).size, family.length, 'each named voice must differ audibly from the generic fallback and its siblings');
});

for (const instrument of family) {
  test(`${instrument}: zero or invalid amplitude and invalid frequency create no audible sources`, () => {
    const c = app('timeline');
    for (const [freq, velocity] of [[440, 0], [440, -1], [440, NaN], [440, Infinity],
      [440, undefined], [NaN, 0.4], [Infinity, 0.4], [0, 0.4], [-440, 0.4], [undefined, 0.4]]) {
      const ctx = audioProbe();
      assert.doesNotThrow(() => c.scheduleInstrument(ctx, instrument, 11, freq, velocity));
      assert.equal(ctx.nodes.filter(n => n.source).length, 0);
      assert.ok(ctx.nodes.every(n => n.connections.length === 0), 'silent requests cannot connect to the output');
    }
  });

  test(`${instrument}: high notes omit partials at or above 45 percent of sample rate`, () => {
    const c = app('timeline');
    for (const sampleRate of [22050, 44100, 48000, 96000]) {
      for (const frequency of [65.4, sampleRate * 0.2, sampleRate * 0.449, sampleRate * 0.45, sampleRate]) {
        const ctx = audioProbe();
        ctx.sampleRate = sampleRate;
        c.scheduleInstrument(ctx, instrument, 11, frequency, 0.4);
        const frequencies = ctx.automation.filter(a => a.name === 'frequency').map(a => a.value);
        assert.ok(frequencies.every(f => f > 0 && f < sampleRate * 0.45));
        if (frequency < sampleRate * 0.45) assert.ok(frequencies.includes(frequency), 'retains scored fundamental');
        else assert.equal(ctx.nodes.filter(n => n.source).length, 0, 'out-of-band fundamentals are silent');
      }
    }
  });

  test(`${instrument}: ending every source disconnects its complete temporary audio graph`, () => {
    const c = app('timeline');
    const ctx = audioProbe();
    c.scheduleInstrument(ctx, instrument, 11, 440, 0.4);
    const sources = ctx.nodes.filter(n => n.source);
    assert.ok(sources.length > 0);
    for (const source of sources) {
      assert.equal(typeof source.onended, 'function');
      source.onended();
      assert.equal(source.disconnected, true);
    }
    assert.ok(ctx.nodes.every(n => n.disconnected && n.connections.length === 0), 'all oscillators and gains release their connections');
  });
}
