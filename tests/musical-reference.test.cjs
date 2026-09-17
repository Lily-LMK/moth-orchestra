'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./harness.cjs');
const { score, settings } = require('./score.cjs');
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

// Emergence was split out of Moth Orchestra on 17 September 2026, at Lily's
// asking: "push it live as 'Emergence' and leave the original moth orchestra
// family intact for a while." The test above is the proof that it was left
// intact — it holds Moth Orchestra against the original reference note for
// note, instrument names included, and that fixture has never been
// regenerated. These hold the seam itself.
// Timeline and Riff only, as the Gondwana and Noctilucent tests also do: Song's
// arrangement is seeded on the family name, so every family arranges a night
// differently and always has. Song's own check is below.
for (const mode of ['timeline', 'riff']) {
  test(`${mode}: Emergence changes which voice speaks and nothing else`, () => {
    const c = loadApp();
    Object.assign(c.state, fixture.settings, { spacingMode: mode });
    const baseline = c.buildSequencer(c.state.obs).events;
    c.state.voiceMode = 'emergence';
    const candidate = c.buildSequencer(c.state.obs).events;
    const arrivals = es => es.filter(e => e.kind === 'obs');
    const bare = es => JSON.parse(JSON.stringify(arrivals(es)
      .map(({ instrument, lag, touch, ...e }) => e)));
    assert.deepEqual(bare(candidate), bare(baseline),
      'every time, pitch, density and source identity is the original');
    assert.ok(arrivals(candidate).every(e => String(e.instrument).startsWith('moth:')),
      'every arrival speaks its lineage');
    assert.ok(arrivals(baseline).every(e => !String(e.instrument).startsWith('moth:')),
      'and Moth Orchestra speaks none of it');
  });
}

test('song: Emergence voices the arrivals and leaves the composed rhythm alone', () => {
  const c = loadApp();
  Object.assign(c.state, settings, { spacingMode: 'song', voiceMode: 'emergence' });
  const events = c.buildSequencer(c.state.obs).events;
  const arrivals = events.filter(e => e.kind === 'obs');
  assert.ok(arrivals.length > 0);
  assert.ok(arrivals.every(e => String(e.instrument).startsWith('moth:')),
    'every arrival speaks its lineage, even when Song arranges it');
  // Composed rhythm is authorship and must never be given a creature's voice.
  for (const e of events.filter(e => e.kind !== 'obs' && e.kind !== 'moth_ground'))
    assert.equal(String(e.instrument).startsWith('moth:'), false,
      `${e.kind} is not evidence and keeps its own voice`);
});

test('Moth Orchestra carries no trace of Emergence', () => {
  const c = loadApp();
  Object.assign(c.state, settings, { spacingMode: 'timeline', voiceMode: 'mixed' });
  const events = c.buildSequencer(c.state.obs).events;
  assert.ok(events.length > 0);
  assert.equal(events.filter(e => e.kind === 'moth_ground').length, 0, 'no ground');
  for (const e of events.filter(e => e.kind === 'obs')) {
    assert.equal(e.lag, undefined, 'no timing nudge');
    assert.equal(e.touch, undefined, 'no touch variation');
    assert.equal(String(e.instrument).startsWith('moth:'), false, 'no lineage voice');
  }
});
