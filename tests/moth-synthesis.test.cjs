'use strict';
// The eight numbers, as sound. What is asserted here is what a listener could
// in principle tell apart — not that they will, which only Lily's ear settles.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./harness.cjs');

// A probe that records every node and every scheduled value, like the one the
// Lantern tests use, so the graph can be inspected without an audio device.
function audioProbe(sampleRate = 48000) {
  const automation = [], nodes = [];
  const param = (name) => ({
    value: 0,
    setValueAtTime(v, t) { automation.push({ name, kind: 'set', value: v, at: t }); return this; },
    linearRampToValueAtTime(v, t) { automation.push({ name, kind: 'lin', value: v, at: t }); return this; },
    exponentialRampToValueAtTime(v, t) { automation.push({ name, kind: 'exp', value: v, at: t }); return this; }
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
    createDelay: () => node({ delayTime: param('delayTime') }),
    createConvolver: () => node({ buffer: null }),
    createDynamicsCompressor: () => node({ threshold: param('threshold'), knee: param('knee'),
      ratio: param('ratio'), attack: param('attack'), release: param('release') }),
    createBuffer: (ch, len) => ({ numberOfChannels: ch, length: len,
      getChannelData: () => new Float32Array(len) }),
    destination: node({})
  };
  return ctx;
}
const app = () => loadApp();
// Codes are built from the axis table rather than typed, so a test can never
// assert against a digit the decoder is right to refuse.
const codeOf = (c, picks) => 'moth:' + c.MOTH_AXES.map((a, i) => {
  const v = picks[i];
  if (v === null || v === undefined) return '-';
  return String(Math.min(a.steps - 1, v));
}).join('');
const mid = c => codeOf(c, c.MOTH_AXES.map(a => Math.floor((a.steps - 1) / 2)));
const top = c => codeOf(c, c.MOTH_AXES.map(a => a.steps - 1));
const play = (c, code, freq = 440, ctx = audioProbe()) => {
  c.scheduleMothVoice(ctx, code, 1, freq, 0.5, ctx.destination);
  return ctx;
};
const partials = ctx => ctx.automation.filter(a => a.name === 'frequency').map(a => a.value);
const stopsAt = ctx => Math.max(0, ...ctx.nodes.filter(n => n.source).map(n => n.stopped || 0));

test('a moth code is handled and anything else is passed on untouched', () => {
  const c = app();
  assert.equal(c.scheduleMothVoice(audioProbe(), mid(c), 1, 440, 0.5, null), true);
  for (const other of ['pluck', 'bell', 'gond_felt', 'lantern_glass', '', 'moth:bad'])
    assert.equal(c.scheduleMothVoice(audioProbe(), other, 1, 440, 0.5, null), false, other);
});

test('nothing that is not a note allocates an audio graph', () => {
  const c = app();
  for (const [freq, vel, when] of [[0, .5, 1], [-1, .5, 1], [NaN, .5, 1], [440, 0, 1],
                                   [440, NaN, 1], [440, .5, NaN], [Infinity, .5, 1]]) {
    const ctx = audioProbe();
    assert.equal(c.scheduleMothVoice(ctx, mid(c), when, freq, vel, ctx.destination), true,
      'the request is handled');
    assert.equal(ctx.nodes.filter(n => n.source).length, 0,
      `freq=${freq} vel=${vel} when=${when} made no sound`);
  }
});

test('an out-of-band pitch is refused before folding, never folded into audibility', () => {
  const c = app();
  for (const rate of [22050, 44100, 48000]) {
    const ctx = audioProbe(rate);
    c.scheduleMothVoice(ctx, mid(c), 1, rate, 0.5, ctx.destination);
    assert.equal(ctx.nodes.filter(n => n.source).length, 0, `${rate} Hz stayed silent`);
  }
});

test('no partial is ever scheduled at or above the Nyquist limit', () => {
  const c = app();
  for (const rate of [22050, 44100, 96000])
    for (const freq of [65.4, 440, rate * 0.2, rate * 0.44]) {
      const ctx = audioProbe(rate);
      c.scheduleMothVoice(ctx, top(c), 1, freq, 0.5, ctx.destination);
      for (const f of partials(ctx))
        assert.ok(f > 0 && f < rate * 0.45, `${f} Hz at ${rate}`);
    }
});

test('the written pitch moves by whole octaves only, so the score still stands', () => {
  const c = app();
  for (let midi = 45; midi <= 90; midi++) {
    const freq = c.midiToFreq(midi);
    for (const code of [mid(c), top(c), codeOf(c, [0,0,0,0,0,0,0,0]), codeOf(c, [2])]) {
      const ctx = play(c, code, freq);
      const fundamental = Math.min(...partials(ctx));
      const octaves = Math.log2(fundamental / freq);
      assert.ok(Math.abs(octaves - Math.round(octaves)) < 1e-9,
        `${code} moved ${freq.toFixed(1)} Hz by ${octaves} octaves`);
    }
  }
});

test('genus decides how long a note lasts, and the range is the point', () => {
  const c = app();
  // Lily: "all notes seem to be short." Every instrument in the old family
  // decayed inside 0.9 s. Length is now what genus says.
  const lengths = [];
  const steps = c.MOTH_AXES[6].steps;
  for (let d = 0; d < steps; d++)
    lengths.push(stopsAt(play(c, codeOf(c, [2,0,3,5,4,1,d,4]))) - 1);
  for (let i = 1; i < lengths.length; i++)
    assert.ok(lengths[i] > lengths[i - 1], `decay step ${i} is longer than ${i - 1}`);
  assert.ok(lengths[0] < 0.8, `the shortest is still short (${lengths[0].toFixed(2)}s)`);
  const last = lengths[lengths.length - 1];
  assert.ok(last > 3.5, `the longest genuinely rings (${last.toFixed(2)}s)`);
});

test('each axis changes the sound, and an axis nobody lit changes nothing', () => {
  const c = app();
  const shape = code => {
    const ctx = play(c, code);
    return JSON.stringify({
      partials: partials(ctx).map(f => Math.round(f * 100)),
      stops: ctx.nodes.filter(n => n.source).map(n => Math.round((n.stopped || 0) * 1000)),
      gains: ctx.automation.filter(a => a.name === 'gain').map(a => Math.round(a.value * 1e4)),
      // Shimmer is a detune on a twin oscillator, so it is only visible here.
      detune: ctx.automation.filter(a => a.name === 'detune').map(a => a.value)
    });
  };
  const basePicks = c.MOTH_AXES.map(a => Math.floor((a.steps - 1) / 2));
  const base = codeOf(c, basePicks);
  // Changing any one axis must change the note. If an axis cannot be heard at
  // all it is not carrying the rank assigned to it, which is the whole design.
  for (let i = 0; i < c.MOTH_AXES.length; i++) {
    const picks = basePicks.slice();
    picks[i] = (picks[i] + 1) % c.MOTH_AXES[i].steps;
    assert.notEqual(shape(codeOf(c, picks)), shape(base),
      `axis ${i} (${c.MOTH_AXES[i].axis}) is audible`);
  }
});

test('an undetermined record is a plain member of what it is known to be', () => {
  const c = app();
  const plain = play(c, codeOf(c, [2]));
  const full = play(c, mid(c));
  assert.ok(partials(plain).length > 0, 'it still sounds');
  assert.ok(partials(plain).length <= partials(full).length,
    'with no more elaboration than a fully determined relative');
  // Nothing is invented: the unlit axes take the plain default, so the note is
  // simpler rather than differently wrong.
  assert.equal(new Set(partials(plain)).size, 3, 'three partials, the plainest body');
});

test('the room is the family\'s own, with its own limiter', () => {
  const c = app();
  const ctx = play(c, mid(c));
  const convolvers = ctx.nodes.filter(n => 'buffer' in n && n.buffer);
  assert.equal(convolvers.length, 1, 'one room');
  const guard = ctx.nodes.find(n => n.threshold && n.ratio);
  assert.ok(guard, 'and its own limiter, so the family\'s headroom is its own');
  // Not Gondwana's: shorter, so this is a room and not a cathedral.
  assert.ok(convolvers[0].buffer.length / ctx.sampleRate < 2.5,
    'the tail is a room, not a cavern');
});

test('every oscillator ends, and the graph it built is disconnected', () => {
  const c = app();
  const ctx = play(c, top(c));
  const sources = ctx.nodes.filter(n => n.source);
  assert.ok(sources.length > 0);
  for (const s of sources) {
    assert.equal(typeof s.onended, 'function');
    assert.ok(Number.isFinite(s.stopped) && s.stopped > s.started);
  }
  for (const s of sources) s.onended();
  // The room is shared and persistent, so "everything disconnected" is the
  // wrong test. The right one is that a finished note leaves nothing behind:
  // play another and the count of still-connected nodes must not grow.
  const live = () => ctx.nodes.filter(n => n.gain && !n.disconnected).length;
  const afterFirst = live();
  const second = c.scheduleMothVoice(ctx, top(c), 2, 440, 0.5, ctx.destination);
  assert.equal(second, true);
  for (const s of ctx.nodes.filter(n => n.source && !n.ended)) { s.ended = true; if (s.onended) s.onended(); }
  assert.equal(live(), afterFirst, 'a finished note leaves nothing connected behind it');
});
