'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { loadApp } = require('./harness.cjs');

function playback(times = [0, 2]) {
  const canvas = { width: 400, height: 300, style: {}, addEventListener() {}, getContext: () => ({}),
    getBoundingClientRect: () => ({ width: 400, height: 300, left: 0, top: 0 }) };
  const c = loadApp(undefined, { document: { getElementById: () => canvas, addEventListener() {} },
    window: { devicePixelRatio: 1, innerWidth: 1200, addEventListener() {} } });
  const intervals = new Map();
  const timeouts = new Map();
  let timerId = 0;
  const clock = { currentTime: 100 };
  const notes = [], glows = [], overlays = [];
  c.setInterval = callback => { intervals.set(++timerId, callback); return timerId; };
  c.clearInterval = id => intervals.delete(id);
  c.setTimeout = callback => { timeouts.set(++timerId, callback); return timerId; };
  c.clearTimeout = id => timeouts.delete(id);
  c.performance.now = () => clock.currentTime * 1000;
  c.testAudio = clock;
  vm.runInContext('audioCtx = testAudio; masterGain = {gain:{setTargetAtTime() {}}};', c);
  // These tests are about the scheduler, not about a family, and Gondwana —
  // the default since 17 September 2026 — takes its own scheduling branch.
  // Pin the family so the stub below is the path under test.
  c.state.voiceMode = 'mixed';
  c.scheduleInstrument = (ctx, instrument, when, freq, velocity) => notes.push({ when, freq, velocity });
  c.scheduleThumbGlow = (event, when) => glows.push({ event, when });
  c.scheduleSelectionOverlay = (event, when) => overlays.push({ event, when });
  c.updateCornerStatus = () => {};
  c.setAmbience = () => {};
  c.rebuildSequencerOnly = () => {};
  c.rebuildDerived = () => {};
  Object.assign(c.state, { isPlaying: true, listenMode: 'both', loopLen: 10, perfStart: 100000,
    sequencer: { events: times.map((atSec, index) => ({ atSec, kind: 'obs', user: 'A', instrument: 'pad',
      freq: 220 + index, density: 1, isSpecial: false, isEcho: false })) } });
  return { c, clock, notes, glows, overlays, intervals, timeouts,
    tick() { for (const callback of [...intervals.values()]) callback(); },
    transition() { const callbacks = [...timeouts.values()]; timeouts.clear(); for (const callback of callbacks) callback(); } };
}

test('resuming after the final note waits for the next loop without replaying earlier notes', () => {
  const p = playback();
  p.c.startScheduler(8);
  p.tick();
  assert.equal(p.notes.length, 0);
  assert.equal(p.glows.length, 0);
  p.clock.currentTime = 101.8;
  p.tick();
  assert.equal(p.notes.length, 1);
  assert.equal(p.notes[0].when, 102);
});

test('late scheduler ticks skip missed history and queue only the current lookahead window', () => {
  const p = playback();
  p.c.startScheduler();
  p.clock.currentTime = 1100;
  p.tick();
  assert.equal(p.notes.length, 1, 'one upcoming note instead of 100 loops of stale notes');
  assert.ok(p.notes.every(n => n.when >= p.clock.currentTime && n.when <= p.clock.currentTime + 0.30));
  assert.equal(p.glows.length, 1);
  assert.equal(p.overlays.length, 1);
});

test('normal scheduler ticks schedule once, including the next loop boundary', () => {
  const p = playback();
  p.c.startScheduler();
  p.tick(); p.tick();
  assert.equal(p.notes.length, 1);
  assert.equal(p.notes[0].when, 100.03);
  p.clock.currentTime = 101.8; p.tick(); p.tick();
  assert.equal(p.notes.length, 2);
  p.clock.currentTime = 109.8; p.tick(); p.tick();
  assert.equal(p.notes.length, 3);
  assert.equal(p.notes[2].when, 110.03);
});

test('repeated scheduler starts retain exactly one active interval; stopping prevents audio', () => {
  const p = playback();
  for (let i = 0; i < 20; i++) p.c.startScheduler();
  assert.equal(p.intervals.size, 1);
  p.c.stopScheduler();
  p.tick();
  assert.equal(p.intervals.size, 0);
  assert.equal(p.notes.length, 0);
});

test('stopping during remix transition cannot restart playback from a stale timeout', () => {
  const p = playback();
  p.c.softRebuild(false);
  assert.equal(p.c.state.isPlaying, false);
  p.c.hardResetPlayback('user stop');
  p.transition();
  assert.equal(p.c.state.isPlaying, false);
  assert.equal(p.intervals.size, 0);
});

test('rapid consecutive remixes keep one transition and restart one scheduler', () => {
  const p = playback();
  for (let i = 0; i < 20; i++) p.c.softRebuild(false);
  assert.equal(p.timeouts.size, 1);
  p.transition();
  assert.equal(p.c.state.isPlaying, true);
  assert.equal(p.intervals.size, 1);
});

test('empty score stays silent even after a delayed timer', () => {
  const p = playback([]);
  p.c.startScheduler();
  p.clock.currentTime += 1000;
  p.tick();
  assert.equal(p.notes.length, 0);
  assert.equal(p.glows.length, 0);
});

test('playing visuals and playhead follow audio clock even when performance clock drifts', () => {
  const p = playback();
  p.c.startScheduler();
  p.c.performance.now = () => 99999999;
  p.clock.currentTime = 112.03;
  assert.ok(Math.abs(p.c.getPlaybackAbsoluteSec() - 12) < 1e-10);
  assert.ok(Math.abs(p.c.getPlayheadSec() - 2) < 1e-10);
});

test('suspended audio clock holds playing playhead still', () => {
  const p = playback();
  p.c.startScheduler();
  p.clock.currentTime = 102.03;
  const first = p.c.getPlayheadSec();
  p.c.performance.now = () => 99999999;
  assert.equal(p.c.getPlayheadSec(), first);
});

test('seeking while playing realigns scheduled notes and displayed playhead', async () => {
  const p = playback([0, 6]);
  p.c.startScheduler();
  // Bottom of circular dial is halfway through this ten-second loop.
  await p.c.setPlayheadToAngle(200, 250);
  assert.ok(Math.abs(p.c.getPlayheadSec() - 5) < 1e-10);
  assert.equal(p.intervals.size, 1);
  p.tick();
  assert.equal(p.notes.length, 0);
  p.clock.currentTime = 100.8;
  p.tick();
  assert.equal(p.notes.length, 1);
  assert.ok(Math.abs(p.notes[0].when - 101) < 1e-10);
});

test('seeking while paused updates visual cursor without starting playback', async () => {
  const p = playback([0, 6]);
  p.c.state.isPlaying = false;
  await p.c.setPlayheadToAngle(200, 250);
  assert.equal(p.c.getPlayheadSec(), 5);
  assert.equal(p.c.state.visAbsoluteSec, 5);
  assert.equal(p.intervals.size, 0);
});

test('stall at an exact loop endpoint retains endpoint and next-cycle zero once each', () => {
  const p = playback([0, 10]);
  p.c.startScheduler();
  p.clock.currentTime = p.c.state.schedLoopStart + 100;
  p.tick(); p.tick();
  assert.equal(p.notes.length, 2);
  assert.deepEqual(p.notes.map(n => n.freq).sort(), [220, 221]);
  assert.ok(p.notes.every(n => n.when === p.clock.currentTime));
});
