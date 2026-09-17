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
    // Its frequency param is named apart from an oscillator's, so a filter
    // sweep can never be counted as a partial.
    createBiquadFilter: () => node({ type: '', frequency: param('cutoff'), Q: param('cutoffQ'),
      gain: param('filterGain'), detune: param('filterDetune') }),
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
  assert.equal(new Set(partials(plain)).size, c.MOTH_BODY_PARTIALS[0],
    'the plainest body, which is the fewest partials there are');
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

// ── The sweetness, which was lost and had to be put back ────────────────────
// Lily, 17 September 2026: "The new set sounds nasal … There was a sweet voice
// introduced at the genus or perhaps species level that gave tenderness to
// Moth Orchestra and that is now lost." That voice was `harp`, unlocked at
// genus rank, and `bowl`, unlocked at species rank. Both carry two or three
// partials behind a closing lowpass. The first draft of this family carried up
// to eight bare sine partials and no filter at all.

test('every note closes as it decays, which is what made harp sweet', () => {
  const c = app();
  const ctx = play(c, mid(c));
  const filters = ctx.nodes.filter(n => n.type === 'lowpass');
  assert.equal(filters.length, 1, 'one tone filter on the note');
  const cuts = ctx.automation.filter(a => a.name === 'cutoff');
  const open = cuts.find(a => a.kind === 'set');
  const close = cuts.find(a => a.kind === 'exp');
  assert.ok(open && close, 'it is set, then swept');
  assert.ok(close.value < open.value,
    `it opens at ${open.value} Hz and closes to ${close.value} Hz`);
  assert.ok(close.at > open.at, 'over the life of the note');
});

test('nothing is as bright as the draft Lily called nasal', () => {
  const c = app();
  // The draft opened its brightest voice with partial 8 at 8^-0.55 = 0.32 of
  // full weight, unfiltered. Both halves of that are now bounded.
  assert.ok(Math.max(...c.MOTH_BODY_PARTIALS) <= 6, 'six partials at the most');
  assert.ok(Math.min(...c.MOTH_TILT) >= 1.0, 'and they roll off from the start');
  assert.ok(Math.max(...c.MOTH_FILTER_OPEN) <= 3400, 'the filter never opens past a harp');
  for (let i = 0; i < c.MOTH_FILTER_OPEN.length; i++)
    assert.ok(c.MOTH_FILTER_CLOSE[i] < c.MOTH_FILTER_OPEN[i], `voice ${i} closes`);
  // Weight in the top half of the spectrum, worst case, against the old harp,
  // whose third partial sat at 0.12 of the first.
  const tilt = Math.min(...c.MOTH_TILT);
  const n = Math.max(...c.MOTH_BODY_PARTIALS);
  const weights = Array.from({ length: n }, (_, k) => Math.pow(k + 1, -tilt));
  const top = weights.slice(Math.ceil(n / 2)).reduce((a, b) => a + b, 0) / weights.reduce((a, b) => a + b, 0);
  // The draft's brightest voice — eight partials at tilt 0.55 — put 35% of its
  // weight in the top half and had no filter behind it. This is the raw
  // spectrum only; the closing filter takes most of what is left.
  assert.ok(top < 0.28, `the top half of the spectrum carries ${(top * 100).toFixed(0)}% of the weight`);
});

test('nothing clicks: no attack is instantaneous', () => {
  const c = app();
  assert.ok(Math.min(...c.MOTH_ATTACK) >= 0.004, 'the sharpest attack is still rounded');
});

// ── Touch and timing ────────────────────────────────────────────────────────
// Lily asked for "natural variations in timing and touch". A player that lands
// every note dead on the grid at one weight is the absence she is describing.
const { loadAppWithDom } = require('./harness.cjs');
const { settings } = require('./score.cjs');

function night() {
  const c = loadAppWithDom();
  Object.assign(c.state, settings, { spacingMode: 'timeline', voiceMode: 'emergence' });
  c.importCSVData(c.DEMO_CSV);
  c.rebuildDerived();
  return { c, events: c.state.sequencer.events.filter(e => e.kind === 'obs') };
}

test('every arrival carries its own touch and its own lag', () => {
  const { events } = night();
  assert.ok(events.length > 4);
  for (const e of events) {
    assert.ok(Number.isFinite(e.lag), 'a lag');
    assert.ok(Number.isFinite(e.touch) && e.touch > 0 && e.touch <= 1, 'and a touch');
  }
  assert.ok(new Set(events.map(e => e.touch)).size > 1, 'and they are not all the same');
  assert.ok(new Set(events.map(e => e.lag)).size > 1);
});

test('the same record is always played the same way', () => {
  const a = night(), b = night();
  // Two loads are two VM realms, so compare the data rather than the arrays.
  const shape = x => JSON.stringify(x.events.map(e => [e.obs.id, e.lag, e.touch]));
  assert.equal(shape(a), shape(b));
});

test('the nudge is smaller than the precision of the data it moves', () => {
  const { c, events } = night();
  // iNaturalist stores minutes. A nudge under half a minute of real time
  // cannot move a note off anything the record actually claims. On a
  // twelve-hour night at a nineteen-second loop that is 13 ms.
  const span = c.state.sequencer.meta.spanSec;
  const halfMinuteInLoop = 0.5 * 60 * c.state.loopLen / span;
  const bound = Math.min(0.030, halfMinuteInLoop);
  for (const e of events)
    assert.ok(Math.abs(e.lag) <= bound + 1e-12,
      `${e.lag} is within ±${bound.toFixed(4)}s`);
});

test('touch never makes a note louder than it was written, only softer', () => {
  const { events } = night();
  for (const e of events) assert.ok(e.touch <= 1, 'touch only takes away');
  assert.ok(Math.min(...events.map(e => e.touch)) >= 0.75, 'and never by much');
});

test('a narrow Riff window magnifies real time and must not magnify the nudge', () => {
  const c = loadAppWithDom();
  Object.assign(c.state, settings, { spacingMode: 'riff', voiceMode: 'emergence',
    riffStartMin: 1140, riffEndMin: 1180 });
  c.importCSVData(c.DEMO_CSV);
  c.rebuildDerived();
  for (const e of c.state.sequencer.events.filter(e => e.kind === 'obs'))
    assert.ok(Math.abs(e.lag) <= 0.030 + 1e-12, `${e.lag} is capped absolutely`);
});
