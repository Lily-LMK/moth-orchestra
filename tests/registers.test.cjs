'use strict';
// One rule for which octave a voice sings in.
//
// Written pitch comes from the taxon and is the same for every voice of a
// family, so the only thing that can separate four voices into a consort is
// the octave each one folds into. Three of Frog Yawn's four voices have done
// this since the family was written, each with its own inline copy of the
// logic; Gondwana does it properly with a per-voice ceiling. Lantern Glass did
// not do it at all, which is why all four of its voices ran to 988 Hz.
//
// The tests that matter most here are the ones that prove the three accepted
// Frog Yawn voices did not move. Lily has heard those. A refactor that changes
// a sound she has accepted is a failure however tidy it is.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { loadApp, loadAppWithDom } = require('./harness.cjs');

const app = () => loadApp();
const run = (c, src) => vm.runInContext(src, c);

// Every pitch the score can actually produce: octave 3..5 of the chosen scale,
// which on the real export measures as 147 Hz to 988 Hz.
function writtenPitches(c) {
  const out = [];
  for (let midi = 45; midi <= 90; midi++) out.push(run(c, `midiToFreq(${midi})`));
  return out;
}

test('the register table gives every choir and Lantern voice a floor and a ceiling', () => {
  const c = app();
  const table = run(c, 'JSON.parse(JSON.stringify(VOICE_REGISTERS))');
  for (const voice of ['bass_voice', 'tenor', 'alto', 'soprano',
                       'lantern_bloom', 'lantern_felt', 'lantern_reed', 'lantern_glass']) {
    const reg = table[voice];
    assert.ok(reg, `${voice} has a register`);
    assert.ok(Number.isFinite(reg.floor) && Number.isFinite(reg.ceiling), `${voice} is two numbers`);
    assert.ok(reg.floor > 0 && reg.ceiling >= reg.floor * 2,
      `${voice} has at least an octave to fold into`);
  }
});

test('folding moves by whole octaves only, so the pitch class is never altered', () => {
  const c = app();
  const table = run(c, 'JSON.parse(JSON.stringify(VOICE_REGISTERS))');
  for (const voice of Object.keys(table)) {
    for (const freq of writtenPitches(c)) {
      const sounding = run(c, `voicedFreq(${JSON.stringify(voice)}, ${freq})`);
      const octaves = Math.log2(sounding / freq);
      assert.ok(Math.abs(octaves - Math.round(octaves)) < 1e-9,
        `${voice} moved ${freq.toFixed(1)} Hz by ${octaves} octaves, which is not a whole number`);
    }
  }
});

test('folding lands inside the register, or leaves the note alone when it cannot', () => {
  const c = app();
  const table = run(c, 'JSON.parse(JSON.stringify(VOICE_REGISTERS))');
  for (const [voice, reg] of Object.entries(table)) {
    for (const freq of writtenPitches(c)) {
      const sounding = run(c, `voicedFreq(${JSON.stringify(voice)}, ${freq})`);
      assert.ok(sounding >= reg.floor && sounding <= reg.ceiling,
        `${voice}: ${freq.toFixed(1)} Hz sounded at ${sounding.toFixed(1)}, outside ${reg.floor}–${reg.ceiling}`);
    }
  }
});

test('folding is idempotent — a folded note stays where it landed', () => {
  const c = app();
  for (const voice of Object.keys(run(c, 'JSON.parse(JSON.stringify(VOICE_REGISTERS))'))) {
    for (const freq of writtenPitches(c)) {
      const once = run(c, `voicedFreq(${JSON.stringify(voice)}, ${freq})`);
      const twice = run(c, `voicedFreq(${JSON.stringify(voice)}, ${once})`);
      assert.equal(twice, once, `${voice} moved ${freq.toFixed(1)} Hz twice`);
    }
  }
});

test('a voice with no register is left exactly as written', () => {
  const c = app();
  for (const voice of ['pluck', 'bell', 'creek', 'gecko', 'lead_pan', '', 'not_a_voice']) {
    for (const freq of writtenPitches(c)) {
      assert.equal(run(c, `voicedFreq(${JSON.stringify(voice)}, ${freq})`), freq, voice);
    }
  }
});

test('nothing that is not a pitch is turned into one', () => {
  const c = app();
  for (const bad of [0, -1, NaN, Infinity, -Infinity]) {
    const got = run(c, `voicedFreq("soprano", ${JSON.stringify(bad)})`);
    assert.ok(!(got > 0) || got === bad, `voicedFreq refused ${bad} cleanly, got ${got}`);
  }
  assert.equal(run(c, 'voicedFreq("soprano", null)'), null);
  assert.equal(run(c, 'voicedFreq("soprano", undefined)'), undefined);
});

// ── The three voices Lily has already accepted ──────────────────────────────
// bass_voice, tenor and alto each carried their own inline fold. The shared
// rule must reproduce them exactly, for every pitch the score can produce.
test('bass_voice, tenor and alto sound exactly where their own code put them', () => {
  const c = app();
  const inline = {
    bass_voice: f => { let x = f; while (x > 200) x /= 2; if (x < 65) x *= 2; return x; },
    tenor:      f => { let x = f; while (x > 350) x /= 2; if (x < 120) x *= 2; return x; },
    alto:       f => { let x = f; while (x > 440) x /= 2; if (x < 165) x *= 2; return x; }
  };
  for (const [voice, was] of Object.entries(inline)) {
    for (const freq of writtenPitches(c)) {
      assert.equal(run(c, `voicedFreq(${JSON.stringify(voice)}, ${freq})`), was(freq),
        `${voice} moved at ${freq.toFixed(1)} Hz — a sound Lily has accepted must not change`);
    }
  }
});

// ── Soprano, the voice that did not fold ────────────────────────────────────
test('soprano folds, and sits above alto instead of an octave above its ceiling', () => {
  const c = app();
  const table = run(c, 'JSON.parse(JSON.stringify(VOICE_REGISTERS))');
  const sounding = voice => writtenPitches(c)
    .map(f => run(c, `voicedFreq(${JSON.stringify(voice)}, ${f})`));
  const sop = sounding('soprano');
  const alto = sounding('alto');
  assert.ok(Math.max(...sop) < 988, 'soprano no longer reaches the top of the written score');
  assert.ok(Math.min(...sop) > Math.min(...alto), 'soprano sits above alto at the bottom');
  assert.ok(Math.max(...sop) > Math.max(...alto), 'soprano sits above alto at the top');
  assert.ok(table.soprano.floor >= table.alto.floor,
    'soprano is anchored to the choir rather than floating above it');
});

test('the four choir voices are a consort: each floor and ceiling rises', () => {
  const c = app();
  const table = run(c, 'JSON.parse(JSON.stringify(VOICE_REGISTERS))');
  const parts = ['bass_voice', 'tenor', 'alto', 'soprano'].map(v => table[v]);
  for (let i = 1; i < parts.length; i++) {
    assert.ok(parts[i].floor > parts[i - 1].floor, `part ${i} floor rises`);
    assert.ok(parts[i].ceiling > parts[i - 1].ceiling, `part ${i} ceiling rises`);
  }
});

// ── Lantern Glass, the family Lily called too high pitched ──────────────────
test('the four Lantern voices are a consort rather than four voices at one height', () => {
  const c = app();
  const table = run(c, 'JSON.parse(JSON.stringify(VOICE_REGISTERS))');
  const parts = ['lantern_bloom', 'lantern_felt', 'lantern_reed', 'lantern_glass'].map(v => table[v]);
  for (let i = 1; i < parts.length; i++) {
    assert.ok(parts[i].floor > parts[i - 1].floor, `Lantern part ${i} floor rises`);
    assert.ok(parts[i].ceiling > parts[i - 1].ceiling, `Lantern part ${i} ceiling rises`);
  }
});

test('lantern_glass no longer puts a 1.1 second partial near 4 kHz', () => {
  const c = app();
  const table = run(c, 'JSON.parse(JSON.stringify(VOICE_REGISTERS))');
  // lantern_glass carries a partial at 4× the fundamental with a long decay.
  // That is what made a top note piercing: 988 × 4 = 3,952 Hz.
  const top = Math.max(...writtenPitches(c).map(f => run(c, `voicedFreq("lantern_glass", ${f})`)));
  // The ceiling is a bound, not a pitch the score has to contain: B4 is
  // 493.88 Hz. The voice must reach it within a semitone and never pass it.
  assert.ok(top <= table.lantern_glass.ceiling, `${top} is within the ceiling`);
  assert.ok(top > table.lantern_glass.ceiling / 1.06, `${top} reaches the ceiling`);
  assert.ok(top * 4 < 2500, `highest partial is ${(top * 4).toFixed(0)} Hz, was 3,952 Hz`);
});

test('every Lantern voice occupies the middle the shared-minute bell leaves empty', () => {
  const c = app();
  // The bell sits at about 92 Hz. Nothing sang between it and the top before.
  for (const voice of ['lantern_bloom', 'lantern_felt', 'lantern_reed', 'lantern_glass']) {
    const sounding = writtenPitches(c).map(f => run(c, `voicedFreq(${JSON.stringify(voice)}, ${f})`));
    assert.ok(Math.min(...sounding) < 400, `${voice} reaches down into the middle`);
    assert.ok(Math.max(...sounding) <= 494, `${voice} stops short of the top`);
  }
});

test('the written score is untouched: events still carry the pitch the taxon chose', () => {
  const c = loadAppWithDom();
  const { settings } = require('./score.cjs');
  const before = [];
  Object.assign(c.state, settings, { voiceMode: 'mixed' });
  c.importCSVData(c.DEMO_CSV);
  c.rebuildDerived();
  for (const e of c.state.sequencer.events) if (e.kind === 'obs') before.push([e.obs.id, e.midi, e.freq]);
  for (const voiceMode of ['lantern', 'choir']) {
    Object.assign(c.state, { voiceMode });
    c.rebuildDerived();
    const after = c.state.sequencer.events.filter(e => e.kind === 'obs').map(e => [e.obs.id, e.midi, e.freq]);
    assert.deepEqual(new Map(after.map(r => [r[0], r[1]])),
      new Map(before.map(r => [r[0], r[1]])), `${voiceMode} leaves the written score alone`);
  }
});
