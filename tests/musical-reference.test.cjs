'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./harness.cjs');
const { score } = require('./score.cjs');
const fixture = require('./fixtures/original-scores.json');
for (const mode of ['timeline', 'riff', 'song']) test(`${mode}: fixed seed preserves ${mode === 'song' ? 'complete audible score' : 'ordinary observation notes'} from baseline`, () => {
  const c = loadApp();
  Object.assign(c.state, fixture.settings, { spacingMode: mode });
  assert.deepEqual(score(c.buildSequencer(c.state.obs).events, mode), fixture.scores[mode]);
});
