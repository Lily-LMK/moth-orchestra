'use strict';
// The ground — the sub that makes the meeting felt rather than heard.
//
// It cannot be judged by ear here and it cannot be judged in a gallery that
// does not exist yet, so what is testable is the structure the design plan
// requires: that it is contained on its own bus, that it never touches the
// master chain the six accepted families share, that it lands in the register
// it claims, and that it carries something audible on a laptop.
//
// The audio graph is recorded through a stub rather than rendered. That is a
// weaker claim than a render and it is stated as such: this establishes what
// is connected and with what values, not what it sounds like.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./harness.cjs');

// A recording AudioContext. Only the surface the ground actually touches.
function recorder(currentTime = 0) {
  const nodes = [];
  // The application assigns osc.type = "sine" and filter.type = "highpass",
  // so the stub records its own kind under a name the app will not overwrite.
  const track = (kind, extra = {}) => {
    const node = {
      kind, connectedTo: [], started: null, stopped: null,
      connect(t) { node.connectedTo.push(t); return t; },
      disconnect() {}, start(w) { node.started = w; }, stop(w) { node.stopped = w; },
      ...extra
    };
    nodes.push(node);
    return node;
  };
  const param = (name, owner) => {
    const p = {
      value: 0, events: [],
      setValueAtTime(v, t) { p.value = v; p.events.push(['set', v, t]); return p; },
      linearRampToValueAtTime(v, t) { p.events.push(['lin', v, t]); return p; },
      exponentialRampToValueAtTime(v, t) { p.events.push(['exp', v, t]); return p; }
    };
    owner[name] = p;
    return p;
  };
  const ctx = {
    currentTime, sampleRate: 48000, destination: { kind: 'destination', connectedTo: [] },
    createGain() { const n = track('gain'); param('gain', n); return n; },
    createOscillator() { const n = track('osc'); param('frequency', n); param('detune', n); return n; },
    createBiquadFilter() { const n = track('filter'); param('frequency', n); param('Q', n); return n; },
    createDynamicsCompressor() {
      const n = track('compressor');
      for (const k of ['threshold', 'knee', 'ratio', 'attack', 'release']) param(k, n);
      return n;
    },
    createDelay() { const n = track('delay'); param('delayTime', n); return n; },
    createConvolver() { return track('convolver'); },
    createBuffer() { return { getChannelData: () => new Float32Array(8) }; },
    createBufferSource() { const n = track('bufferSource'); param('playbackRate', n); return n; }
  };
  return { ctx, nodes };
}

function app(settings = {}) {
  const c = loadApp();
  Object.assign(c.state, {
    seed: 28012026, userAName: 'A', userBName: 'B', spacingMode: 'timeline',
    listenMode: 'both', riffStartMin: 0, riffEndMin: 1439, loopLen: 19,
    voiceMode: 'gondwana', toneBy: 'taxon_family_name', volume: 1
  }, settings);
  return c;
}
// Drive the real routing entry point, exactly as the scheduler does.
function play(c, instrument, { when = 5, freq = 41.2, velocity = 0.55, currentTime = 0 } = {}) {
  const { ctx, nodes } = recorder(currentTime);
  c.scheduleInstrument(ctx, instrument, when, freq, velocity);
  return { ctx, nodes, oscs: nodes.filter(n => n.kind ===  'osc') };
}

for (const instrument of ['ground', 'gond_ground']) {
  test(`${instrument}: is contained on its own bus behind its own limiter`, () => {
    // The mix has about three decibels of margin and no master limiter. Fitting
    // one would change the accepted sound of all six published families; this
    // contains the new risk to the new thing instead.
    const c = app();
    const { ctx, nodes } = play(c, instrument);
    const comp = nodes.find(n => n.kind ===  'compressor');
    assert.ok(comp, 'the ground builds a limiter');
    assert.equal(comp.threshold.value, c.GROUND.limiterThresholdDb);
    assert.ok(comp.connectedTo.includes(ctx.destination),
      'and it is the last thing before the output');
  });

  test(`${instrument}: never touches the chain the accepted families share`, () => {
    const c = app();
    const { nodes } = play(c, instrument);
    const reached = new Set();
    for (const n of nodes) for (const t of n.connectedTo) reached.add(t);
    // masterGain is null until ensureAudio runs; the ground must not need it,
    // and must not route through the master delay that would smear a sub.
    assert.ok(!Array.from(reached).some(t => t && t.kind === 'delay'),
      'no reverb or delay on the ground');
  });

  test(`${instrument}: sounds in the register it claims, and stays there`, () => {
    const c = app();
    const { oscs } = play(c, instrument, { freq: 41.2 });
    const freqs = oscs.map(o => o.frequency.value).sort((a, b) => a - b);
    assert.ok(freqs.length >= 2, 'a sub and at least one partner');
    assert.ok(freqs[0] <= c.GROUND_CEILING_HZ, `sub at ${freqs[0]} Hz is below the ceiling`);
    assert.ok(freqs[0] >= 20, 'and above the bottom of hearing');
  });

  test(`${instrument}: carries something a laptop can reproduce`, () => {
    // Forty hertz does not exist on a phone. The moment must not be silent on
    // the only devices Lily can judge it on today.
    const c = app();
    const { oscs } = play(c, instrument, { freq: 41.2 });
    const audible = oscs.filter(o => o.frequency.value >= 150);
    assert.ok(audible.length >= 1, 'a mid-register companion is present');
    assert.equal(audible[0].frequency.value, 41.2 * c.GROUND.companion.ratio);
  });

  test(`${instrument}: swells rather than strikes`, () => {
    const c = app();
    const { nodes } = play(c, instrument);
    const envs = nodes.filter(n => n.kind ===  'gain' && n.gain.events.some(e => e[0] === 'lin'));
    assert.ok(envs.length >= 2, 'each voice has an envelope');
    for (const env of envs) {
      const rise = env.gain.events.find(e => e[0] === 'lin');
      const start = env.gain.events.find(e => e[0] === 'set');
      const attack = rise[2] - start[2];
      assert.ok(attack >= 0.2, `attack of ${attack.toFixed(3)}s is a swell, not a thump`);
    }
  });

  test(`${instrument}: the swell peaks on the shared minute, not after it`, () => {
    // The gesture marks an instant. A 550ms attack starting at that instant
    // would peak half a second late, against a bell that already rang.
    const c = app();
    const when = 5;
    const { nodes } = play(c, instrument, { when });
    const envs = nodes.filter(n => n.kind ===  'gain' && n.gain.events.some(e => e[0] === 'lin'));
    const peaks = envs.map(e => e.gain.events.find(x => x[0] === 'lin')[2]);
    const subPeak = Math.max(...peaks);
    assert.ok(Math.abs(subPeak - when) < 0.06,
      `the swell peaks at ${subPeak.toFixed(3)}s for an event at ${when}s`);
  });

  test(`${instrument}: never schedules in the past`, () => {
    const c = app();
    const { oscs } = play(c, instrument, { when: 1, currentTime: 10 });
    for (const o of oscs) assert.ok(o.started >= 10, 'starts are clamped to now');
  });

  test(`${instrument}: a silent or impossible request allocates nothing`, () => {
    const c = app();
    for (const bad of [{ velocity: 0 }, { freq: 0 }, { freq: NaN }, { velocity: -1 }]) {
      const { nodes } = play(c, instrument, bad);
      assert.equal(nodes.length, 0, JSON.stringify(bad));
    }
  });
}

test('gallery extends the sub; personal leads with the companion', () => {
  // Both mixes are built. Only Personal can be judged today, and it is default.
  const c = app();
  const level = (mix) => {
    c.GROUND.mix = mix;
    const { nodes } = play(c, 'gond_ground', { freq: 41.2 });
    const peakOf = (hz) => {
      const osc = nodes.find(n => n.kind ===  'osc' && Math.abs(n.frequency.value - hz) < 0.01);
      const env = nodes.find(n => n.kind ===  'gain' && osc && osc.connectedTo.includes(n));
      return env.gain.events.find(e => e[0] === 'lin')[1];
    };
    return { sub: peakOf(41.2), companion: peakOf(41.2 * c.GROUND.companion.ratio) };
  };
  const personal = level('personal');
  const gallery = level('gallery');
  assert.ok(gallery.sub > personal.sub, 'the gallery extends the sub');
  assert.ok(personal.companion > gallery.companion, 'personal leans on the companion');
  assert.equal(c.GROUND.mixes.personal.highpassHz > 0, true,
    'personal rolls off what a laptop cannot reproduce anyway');
});

test('the meeting asks for the ground, and each family answers with its own', () => {
  const rows = (c) => [
    c.rowToObs({ id: 'a', user_name: 'A', time_observed_at: '2026-01-28T09:30:00Z',
      observed_on: '2026-01-28', scientific_name: 'Agrotis munda', taxon_order_name: 'Lepidoptera' }),
    c.rowToObs({ id: 'b', user_name: 'B', time_observed_at: '2026-01-28T09:30:00Z',
      observed_on: '2026-01-28', scientific_name: 'Other moth', taxon_order_name: 'Lepidoptera' })
  ];
  for (const [voiceMode, instrument] of [['gondwana', 'gond_ground'], ['mixed', 'ground'],
                                          ['lantern', 'ground'], ['choir', 'ground']]) {
    const c = app({ voiceMode });
    const seq = c.buildSequencer(rows(c));
    const meeting = seq.events.find(e => e.kind === 'duet_meeting');
    assert.equal(meeting.instrument, instrument, voiceMode);
    assert.ok(meeting.freq <= c.GROUND_CEILING_HZ, `${voiceMode} meeting is in the sub register`);
    assert.equal(meeting.velocity, c.GROUND.eventVelocity, 'struck at the named velocity');
  }
});

test('every room-dependent quantity is a named parameter', () => {
  // A day in the gallery should be an afternoon of turning numbers, not a
  // session of re-synthesis.
  const c = app();
  for (const key of ['level', 'eventVelocity', 'attackSec', 'decaySec',
                     'limiterThresholdDb', 'companion', 'mixes', 'mix']) {
    assert.ok(key in c.GROUND, `GROUND.${key} is adjustable`);
  }
  for (const mix of ['personal', 'gallery']) {
    for (const key of ['sub', 'companion', 'highpassHz']) {
      assert.equal(typeof c.GROUND.mixes[mix][key], 'number', `${mix}.${key}`);
    }
  }
});
