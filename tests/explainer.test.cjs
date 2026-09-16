'use strict';
// The explainer beside the night. Lily asked for prose rather than a list of
// observation links: the rules in one paragraph, the night in another.
//
// Status text is exactly the kind of thing that gets asserted in a test and
// never read by a person, so these check the composed sentences through the
// real function and the real DOM elements.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadAppWithDom } = require('./harness.cjs');

function app(settings = {}) {
  const c = loadAppWithDom();
  Object.assign(c.state, {
    seed: 28012026, userAName: 'Chris Burwell', userBName: 'Lily Kumpe',
    spacingMode: 'timeline', listenMode: 'both', riffStartMin: 0, riffEndMin: 1439,
    loopLen: 19, voiceMode: 'mixed', toneBy: 'taxon_family_name', nightKey: '2026-01-28'
  }, settings);
  return c;
}
function obs(c, id, user, time, taxon = 'Moth ' + id) {
  return c.rowToObs({ id, user_name: user, time_observed_at: time, observed_on: '2026-01-28',
    scientific_name: taxon, taxon_order_name: 'Lepidoptera', taxon_family_name: 'Noctuidae' });
}
function render(c, rows) {
  c.state.nightObs = rows;
  c.state.sequencer = c.buildSequencer(rows);
  c.updateSharedMinuteDetails();
  return {
    summary: c.elements.get('sharedMinuteSummary').textContent,
    rules: c.elements.get('sharedMinuteRules').textContent,
    night: c.elements.get('sharedMinuteContext').textContent
  };
}

test('no iNaturalist links, and no list, are built', () => {
  // Lily: "I don't need a link to those iNaturalist records in the explainer."
  const c = app();
  const out = render(c, [
    obs(c, 'a', 'Chris Burwell', '2026-01-28T09:00:00Z'),
    obs(c, 'b', 'Lily Kumpe', '2026-01-28T09:00:30Z')
  ]);
  const all = out.rules + ' ' + out.night;
  assert.ok(!/inaturalist\.org/i.test(all), 'no links');
  assert.ok(!/observation \d/i.test(all), 'no observation ids recited');
  assert.equal(c.elements.has('sharedMinuteList'), false, 'the list element is gone from the markup');
});

test('the rules paragraph explains all three gestures, in prose', () => {
  const c = app();
  const out = render(c, [
    obs(c, 'a', 'Chris Burwell', '2026-01-28T09:00:00Z'),
    obs(c, 'b', 'Lily Kumpe', '2026-01-28T09:00:30Z')
  ]);
  assert.match(out.rules, /shared minute/i);
  assert.match(out.rules, /crossing/i);
  assert.match(out.rules, /echo/i);
  assert.match(out.rules, new RegExp(`${c.DUET_CROSS_WINDOW_MIN} minutes`));
  assert.match(out.rules, new RegExp(`${c.DUET_ECHO_WINDOW_MIN} minutes`));
});

test('it states the limit of what the gestures claim', () => {
  // The instrument must never imply exact simultaneity. iNaturalist stores
  // whole minutes and the panel has to say so.
  const c = app();
  const out = render(c, [
    obs(c, 'a', 'Chris Burwell', '2026-01-28T09:00:00Z'),
    obs(c, 'b', 'Lily Kumpe', '2026-01-28T09:00:30Z')
  ]);
  assert.match(out.rules, /whole minutes|same instant/i);
});

test('the night paragraph counts what actually fired', () => {
  const c = app();
  const out = render(c, [
    obs(c, 'a1', 'Chris Burwell', '2026-01-28T09:00:00Z', 'Agrotis munda'),
    obs(c, 'b1', 'Lily Kumpe', '2026-01-28T09:00:30Z', 'Other moth'),
    obs(c, 'a2', 'Chris Burwell', '2026-01-28T10:00:00Z', 'Third moth'),
    obs(c, 'b2', 'Lily Kumpe', '2026-01-28T10:20:00Z', 'Agrotis munda')
  ]);
  assert.match(out.night, /2026-01-28/);
  assert.match(out.night, /4 records/);
  assert.match(out.night, /Chris Burwell and Lily Kumpe/);
  assert.match(out.night, /1 shared minute\b/, 'singular, not "1 shared minutes"');
  assert.match(out.night, /crossings?/);
  assert.match(out.night, /echo/);
});

test('it names the species both of them found', () => {
  const c = app();
  const out = render(c, [
    obs(c, 'a', 'Chris Burwell', '2026-01-28T09:00:00Z', 'Agrotis munda'),
    obs(c, 'b', 'Lily Kumpe', '2026-01-28T09:20:00Z', 'Agrotis munda')
  ]);
  assert.match(out.night, /Both of you found Agrotis munda/);
});

test('it reports the shape of the evening', () => {
  const c = app();
  const out = render(c, [
    obs(c, 'a', 'Chris Burwell', '2026-01-28T09:00:00Z'),
    obs(c, 'b', 'Lily Kumpe', '2026-01-28T12:30:00Z')
  ]);
  assert.match(out.night, /From \d{1,2}:\d{2}.* to \d{1,2}:\d{2}/, 'first record to last');
  assert.match(out.night, /Brisbane/);
});

test('solo playback says the duet gestures are off', () => {
  const c = app({ listenMode: 'A' });
  const out = render(c, [
    obs(c, 'a', 'Chris Burwell', '2026-01-28T09:00:00Z'),
    obs(c, 'b', 'Lily Kumpe', '2026-01-28T09:00:30Z')
  ]);
  assert.match(out.rules, /switched off|Solo/i);
  assert.ok(!/shared minutes,/.test(out.night), 'and does not count gestures that cannot fire');
});

test('Song mode says its accompaniment is not evidence', () => {
  const c = app({ spacingMode: 'song' });
  const out = render(c, [
    obs(c, 'a', 'Chris Burwell', '2026-01-28T09:00:00Z'),
    obs(c, 'b', 'Lily Kumpe', '2026-01-28T09:00:30Z')
  ]);
  assert.match(out.night, /composed rhythm/i);
  assert.match(out.night, /not evidence/i);
});

test('Riff mode says the counts are within the window', () => {
  const c = app({ spacingMode: 'riff' });
  const out = render(c, [
    obs(c, 'a', 'Chris Burwell', '2026-01-28T09:00:00Z'),
    obs(c, 'b', 'Lily Kumpe', '2026-01-28T09:00:30Z')
  ]);
  assert.match(out.night, /Riff window/);
});

test('an empty night does not throw or invent a shape', () => {
  const c = app();
  const out = render(c, []);
  assert.match(out.night, /0 records/);
  assert.ok(!/From .* to /.test(out.night));
});

test('a single record reports one time, not a span', () => {
  const c = app();
  const out = render(c, [obs(c, 'a', 'Chris Burwell', '2026-01-28T09:00:00Z')]);
  assert.match(out.night, /1 record\b/);
  assert.match(out.night, /^.*At \d{1,2}:\d{2}/m);
});
