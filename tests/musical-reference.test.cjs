'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./harness.cjs');
const { score } = require('./score.cjs');
const fixture = require('./fixtures/original-scores.json');
// Math.pow is implementation-approximated in ECMAScript, so midiToFreq can
// differ by one unit in the last place between JavaScript engines. That is
// about 1e-13 Hz - far below any audible or measurable difference, and the
// exact midi number is still compared. Rounding frequencies to a micro-hertz
// keeps this a real score-parity check while making it portable across
// engines. Nothing else in the score is relaxed.
const portable = notes => notes.map(n => ({ ...n, freq: Number(n.freq.toFixed(6)) }));
// The baseline fixture is the anchor this project measures drift against, so
// it is not regenerated when a family changes how it sounds. On 17 September
// 2026 Moth Orchestra stopped naming a shared instrument and started naming
// the record's own lineage, which changes exactly one field. The anchor still
// holds every other field to the original, and the change itself is asserted
// below rather than absorbed.
const withoutInstrument = notes => notes.map(({ instrument, ...rest }) => rest);

for (const mode of ['timeline', 'riff', 'song']) {
  test(`${mode}: fixed seed preserves ${mode === 'song' ? 'complete audible score' : 'ordinary observation notes'} from baseline`, () => {
    const c = loadApp();
    Object.assign(c.state, fixture.settings, { spacingMode: mode });
    const got = portable(score(c.buildSequencer(c.state.obs).events, mode));
    const want = portable(fixture.scores[mode]);
    assert.equal(got.length, want.length, 'the same notes, in the same number');
    assert.deepEqual(withoutInstrument(got), withoutInstrument(want),
      'every time, pitch, density, velocity and source identity is the original');
  });

  test(`${mode}: the only thing Moth Orchestra changed is which voice speaks`, () => {
    const c = loadApp();
    Object.assign(c.state, fixture.settings, { spacingMode: mode });
    const events = c.buildSequencer(c.state.obs).events;
    // The fixture is at class rank, where the lineage has one thing to say:
    // Insecta. Every arrival is therefore the same voice, which is exactly
    // what "Class voices: 1" has always meant.
    const arrivals = events.filter(e => e.kind === 'obs');
    assert.deepEqual([...new Set(arrivals.map(e => e.instrument))], ['moth:2-------'],
      'class rank, one voice, and its material is the authored Insecta one');
    // The lineage voice is for evidence. Song's composed rhythm is authorship
    // and says so, so it keeps its own neutral instrument and must never be
    // given a creature's voice.
    for (const e of events.filter(e => e.kind !== 'obs'))
      assert.equal(String(e.instrument).startsWith('moth:'), false,
        `${e.kind} is not evidence and keeps its own voice`);
    assert.ok(fixture.scores[mode].some(n => !String(n.instrument).startsWith('moth:')),
      'the baseline it replaced named a shared instrument for the arrivals too');
  });
}
