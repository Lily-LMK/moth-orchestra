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
for (const mode of ['timeline', 'riff', 'song']) test(`${mode}: fixed seed preserves ${mode === 'song' ? 'complete audible score' : 'ordinary observation notes'} from baseline`, () => {
  const c = loadApp();
  Object.assign(c.state, fixture.settings, { spacingMode: mode });
  assert.deepEqual(portable(score(c.buildSequencer(c.state.obs).events, mode)), portable(fixture.scores[mode]));
});
