'use strict';
// The two restored synchronicity gestures.
//
// The five-second pulse that used to mark an exceptional moment cannot work:
// iNaturalist stores minute precision, so every record carries :00, and the
// pulse fired on 311 of 311 shared minutes at exactly the bell's instant. It
// stopped being an event. These two gestures replace it with rules that
// survive the loss of seconds and say something about the night rather than
// about the file.
//
//   the meeting — the first shared minute of the night. One per duet night.
//   the echo    — the same taxon, recorded by both observers, close in time.
//
// Both are symmetric between observers. That is the property the old rule
// lacked: duet_sync paired each A record to its nearest B record, so which
// minutes fired depended on who happened to appear first in the file.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./harness.cjs');

function app(settings = {}) {
  const c = loadApp();
  Object.assign(c.state, {
    seed: 28012026, userAName: 'A', userBName: 'B', spacingMode: 'timeline',
    listenMode: 'both', riffStartMin: 0, riffEndMin: 1439, loopLen: 19,
    voiceMode: 'mixed', toneBy: 'taxon_family_name'
  }, settings);
  return c;
}
// `taxon` is what the echo matches on, so it is a first-class argument here.
function obs(c, id, user, time, taxon = 'Test moth ' + id) {
  return c.rowToObs({
    id, user_name: user, time_observed_at: time, observed_on: '2026-01-28',
    scientific_name: taxon, taxon_order_name: 'Lepidoptera',
    taxon_family_name: 'Noctuidae', taxon_class_name: 'Insecta'
  });
}
// The meeting is parked (Lily, 16 September 2026: "it's too strong"). Its rule
// is still built and still tested — the tests below switch it on deliberately,
// which is also what proves the parking flag is the only thing silencing it.
function withMeeting(c) { c.DUET_GESTURES.meeting = true; return c; }
const echoes = (seq) => seq.meta.duetEchoes || [];
const marked = (seq) => seq.events.filter(e => e.kind === 'obs' && e.duetEcho);
const meetings = (seq) => seq.events.filter(e => e.kind === 'duet_meeting');

// ── The echo ────────────────────────────────────────────────────────────────

test('echo: the same taxon from both observers, close in time, is a call and an answer', () => {
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z', 'Agrotis munda'),
    obs(c, 'b', 'B', '2026-01-28T09:20:00Z', 'Agrotis munda')
  ]);
  assert.equal(echoes(seq).length, 1, 'one echo');
  const e = echoes(seq)[0];
  assert.equal(e.taxon, 'Agrotis munda');
  assert.equal(e.call.id, 'a', 'the earlier record calls');
  assert.equal(e.answer.id, 'b', 'the later record answers');
  assert.equal(e.gapSec, 1200);
  const roles = marked(seq).map(ev => `${ev.obs.id}:${ev.duetEcho.role}`).sort().join(' ');
  assert.equal(roles, 'a:call b:answer');
});

test('echo: the answer returns at the pitch and on the instrument of the call', () => {
  // Not a new sound. Two records of one taxon already produce one pitch on one
  // instrument — measured true on all 55 such pairs in the two-backyards
  // export. The gesture reveals what the score already contains.
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z', 'Agrotis munda'),
    obs(c, 'b', 'B', '2026-01-28T09:20:00Z', 'Agrotis munda')
  ]);
  const [call, answer] = marked(seq).sort((x, y) => x.atSec - y.atSec);
  assert.equal(call.midi, answer.midi, 'same pitch');
  assert.equal(call.instrument, answer.instrument, 'same instrument');
  assert.equal(call.freq, answer.freq);
});

test('echo: each side carries its partner and the gap, as evidence', () => {
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z', 'Agrotis munda'),
    obs(c, 'b', 'B', '2026-01-28T09:20:00Z', 'Agrotis munda')
  ]);
  for (const ev of marked(seq)) {
    assert.ok(ev.duetEcho.partnerId, 'names the other observation');
    assert.notEqual(ev.duetEcho.partnerId, ev.obs.id, 'and it is not itself');
    assert.equal(ev.duetEcho.gapSec, 1200);
    assert.equal(ev.duetEcho.taxon, 'Agrotis munda');
  }
});

test('echo: a gap beyond the window is not an echo', () => {
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z', 'Agrotis munda'),
    obs(c, 'b', 'B', '2026-01-28T10:30:00Z', 'Agrotis munda')
  ]);
  assert.equal(echoes(seq).length, 0);
  assert.equal(marked(seq).length, 0);
});

test('echo: the window is exactly DUET_ECHO_WINDOW_MIN and is inclusive', () => {
  const c = app();
  assert.equal(typeof c.DUET_ECHO_WINDOW_MIN, 'number');
  const at = (min) => {
    const t = new Date(Date.parse('2026-01-28T09:00:00Z') + min * 60000).toISOString();
    return c.buildSequencer([
      obs(c, 'a', 'A', '2026-01-28T09:00:00Z', 'Agrotis munda'),
      obs(c, 'b', 'B', t, 'Agrotis munda')
    ]);
  };
  assert.equal(echoes(at(c.DUET_ECHO_WINDOW_MIN)).length, 1, 'the boundary qualifies');
  assert.equal(echoes(at(c.DUET_ECHO_WINDOW_MIN + 1)).length, 0, 'a minute past it does not');
});

test('echo: one observer recording a taxon twice is not an echo', () => {
  // The whole point is that it took two people. A single observer photographing
  // the same moth twice is not the forest answering itself.
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z', 'Agrotis munda'),
    obs(c, 'b', 'A', '2026-01-28T09:10:00Z', 'Agrotis munda'),
    obs(c, 'c', 'B', '2026-01-28T09:05:00Z', 'Different moth')
  ]);
  assert.equal(echoes(seq).length, 0);
});

test('echo: a taxon sounds once a night however many times it is recorded', () => {
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a1', 'A', '2026-01-28T09:00:00Z', 'Agrotis munda'),
    obs(c, 'a2', 'A', '2026-01-28T09:05:00Z', 'Agrotis munda'),
    obs(c, 'a3', 'A', '2026-01-28T09:08:00Z', 'Agrotis munda'),
    obs(c, 'b1', 'B', '2026-01-28T09:10:00Z', 'Agrotis munda'),
    obs(c, 'b2', 'B', '2026-01-28T09:12:00Z', 'Agrotis munda')
  ]);
  assert.equal(echoes(seq).length, 1, 'one echo, not six pairings');
  assert.equal(marked(seq).length, 2, 'and exactly two notes carry it');
});

test('echo: the closest pair across the pair of observers is the one that sounds', () => {
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'far', 'A', '2026-01-28T09:00:00Z', 'Agrotis munda'),
    obs(c, 'near', 'A', '2026-01-28T09:28:00Z', 'Agrotis munda'),
    obs(c, 'b', 'B', '2026-01-28T09:30:00Z', 'Agrotis munda')
  ]);
  assert.equal(echoes(seq).length, 1);
  assert.equal(echoes(seq)[0].call.id, 'near', 'the two-minute gap, not the thirty-minute one');
  assert.equal(echoes(seq)[0].gapSec, 120);
});

test('echo: no note is added or removed to make one', () => {
  const c = app();
  const rows = [
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z', 'Agrotis munda'),
    obs(c, 'b', 'B', '2026-01-28T09:20:00Z', 'Agrotis munda'),
    obs(c, 'c', 'B', '2026-01-28T09:40:00Z', 'Other moth')
  ];
  const withEcho = c.buildSequencer(rows).events.filter(e => e.kind === 'obs').length;
  assert.equal(withEcho, 3, 'three records, three notes');
});

test('echo: two unidentified records are not the same species', () => {
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z', ''),
    obs(c, 'b', 'B', '2026-01-28T09:10:00Z', '')
  ]);
  assert.equal(echoes(seq).length, 0);
});

test('echo: solo playback has no echoes', () => {
  for (const user of ['A', 'B']) {
    const c = app({ listenMode: user });
    const seq = c.buildSequencer([
      obs(c, 'a', 'A', '2026-01-28T09:00:00Z', 'Agrotis munda'),
      obs(c, 'b', 'B', '2026-01-28T09:20:00Z', 'Agrotis munda')
    ]);
    assert.equal(echoes(seq).length, 0, user);
    assert.equal(marked(seq).length, 0, user);
  }
});

test('echo: a third observer cannot answer', () => {
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z', 'Agrotis munda'),
    obs(c, 'c', 'C', '2026-01-28T09:10:00Z', 'Agrotis munda')
  ]);
  assert.equal(echoes(seq).length, 0);
});

// ── The meeting ─────────────────────────────────────────────────────────────

test('meeting: exactly one per duet night, on the earliest shared minute', () => {
  const c = withMeeting(app());
  const seq = c.buildSequencer([
    obs(c, 'a0', 'A', '2026-01-28T09:00:00Z'),
    obs(c, 'a1', 'A', '2026-01-28T09:30:00Z'),
    obs(c, 'b1', 'B', '2026-01-28T09:30:00Z'),
    obs(c, 'a2', 'A', '2026-01-28T10:00:00Z'),
    obs(c, 'b2', 'B', '2026-01-28T10:00:00Z')
  ]);
  assert.equal(meetings(seq).length, 1, 'one meeting');
  assert.equal(seq.events.filter(e => e.kind === 'duet_minute').length, 2, 'both bells remain');
  const first = seq.meta.sharedMinutes[0];
  assert.equal(meetings(seq)[0].match.minuteKey, first.minuteKey, 'the first shared minute');
});

test('meeting: it sounds at the instant of the shared minute it marks', () => {
  const c = withMeeting(app());
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:30:00Z'),
    obs(c, 'b', 'B', '2026-01-28T09:30:00Z'),
    obs(c, 'a2', 'A', '2026-01-28T10:00:00Z')
  ]);
  const bell = seq.events.find(e => e.kind === 'duet_minute');
  assert.equal(meetings(seq)[0].atSec, bell.atSec);
});

test('meeting: it carries the shared minute as evidence', () => {
  const c = withMeeting(app());
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:30:00Z'),
    obs(c, 'b', 'B', '2026-01-28T09:30:00Z')
  ]);
  const m = meetings(seq)[0].match;
  assert.ok(Number.isFinite(m.minuteKey));
  assert.equal(m.observations.A[0].id, 'a');
  assert.equal(m.observations.B[0].id, 'b');
});

test('meeting: a night with no shared minute has none', () => {
  const c = withMeeting(app());
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z'),
    obs(c, 'b', 'B', '2026-01-28T10:00:00Z')
  ]);
  assert.equal(meetings(seq).length, 0);
});

test('meeting: solo playback has none', () => {
  const c = withMeeting(app({ listenMode: 'A' }));
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:30:00Z'),
    obs(c, 'b', 'B', '2026-01-28T09:30:00Z')
  ]);
  assert.equal(meetings(seq).length, 0);
});

test('meeting: it is authored emphasis on real evidence, and marked special', () => {
  const c = withMeeting(app());
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:30:00Z'),
    obs(c, 'b', 'B', '2026-01-28T09:30:00Z')
  ]);
  const m = meetings(seq)[0];
  assert.equal(m.isSpecial, true);
  assert.equal(m.obs, null, 'it is not one observation');
  assert.ok(m.match, 'but it is never without evidence');
});

// ── Symmetry: the property the old rule lacked ──────────────────────────────

test('both gestures are identical when the observers swap labels', () => {
  // duet_sync fired on 25 minutes with Chris as A and would have fired on 103
  // different ones with Lily as A. Neither of these gestures may do that.
  const rows = (c) => [
    obs(c, 'p1', 'P', '2026-01-28T09:00:00Z', 'Agrotis munda'),
    obs(c, 'p2', 'P', '2026-01-28T09:30:00Z', 'Other moth'),
    obs(c, 'p3', 'P', '2026-01-28T09:31:00Z', 'Third moth'),
    obs(c, 'q1', 'Q', '2026-01-28T09:20:00Z', 'Agrotis munda'),
    obs(c, 'q2', 'Q', '2026-01-28T09:30:00Z', 'Fourth moth'),
    obs(c, 'q3', 'Q', '2026-01-28T09:31:00Z', 'Fifth moth')
  ];
  const run = (A, B) => {
    const c = withMeeting(app({ userAName: A, userBName: B }));
    const seq = c.buildSequencer(rows(c));
    return {
      echoes: echoes(seq).map(e => [e.taxon, e.call.id, e.answer.id, e.gapSec].join('|')).sort(),
      marked: marked(seq).map(e => `${e.obs.id}:${e.duetEcho.role}`).sort(),
      meetings: meetings(seq).map(e => e.match.minuteKey).sort()
    };
  };
  assert.equal(JSON.stringify(run('P', 'Q')), JSON.stringify(run('Q', 'P')));
});

// ── The rule that is being retired ─────────────────────────────────────────

test('the five-second pulse and its dead dial are gone', () => {
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z'),
    obs(c, 'b', 'B', '2026-01-28T09:00:03Z')
  ]);
  assert.equal(seq.events.filter(e => e.kind === 'duet_sync').length, 0,
    'nothing may fire on seconds that iNaturalist does not store');
  assert.equal(c.state.duetSyncWindowSec, undefined,
    'and the dial that pretended to control it is removed');
});

test('the shared-minute composite is untouched', () => {
  // The sound Lily likes. One bell per shared minute, and nothing about this
  // change may alter how often it fires.
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a1', 'A', '2026-01-28T09:30:00Z'),
    obs(c, 'a2', 'A', '2026-01-28T09:30:30Z'),
    obs(c, 'b1', 'B', '2026-01-28T09:30:10Z'),
    obs(c, 'a3', 'A', '2026-01-28T10:00:00Z'),
    obs(c, 'b2', 'B', '2026-01-28T10:00:00Z')
  ]);
  assert.equal(seq.events.filter(e => e.kind === 'duet_minute').length, 2,
    'one bell per shared minute, regardless of how many records are in it');
});

// ── Parked, and provably silent ─────────────────────────────────────────────

test('the meeting is parked by default and makes no sound', () => {
  // Lily, on first hearing: "It's too strong, and an effect that only happens
  // a single time in a loop needs to certainly sound different than that."
  const c = app();
  assert.equal(c.DUET_GESTURES.meeting, false, 'parked');
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:30:00Z'),
    obs(c, 'b', 'B', '2026-01-28T09:30:00Z')
  ]);
  assert.equal(meetings(seq).length, 0, 'no event, so nothing is scheduled');
  assert.equal(seq.meta.sharedMinutes.length, 1, 'the shared minute is still found');
  assert.equal(seq.events.filter(e => e.kind === 'duet_minute').length, 1,
    'and the bell Lily accepted still rings');
});

test('the echo is not parked with it', () => {
  const c = app();
  assert.equal(c.DUET_GESTURES.echo, true);
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z', 'Agrotis munda'),
    obs(c, 'b', 'B', '2026-01-28T09:20:00Z', 'Agrotis munda')
  ]);
  assert.equal(echoes(seq).length, 1);
});

test('parking is one flag, and unparking restores the gesture exactly', () => {
  // The work is kept alive rather than deleted: the rule, the evidence and the
  // synthesis are all still here and still correct when switched back on.
  const rows = (c) => [
    obs(c, 'a', 'A', '2026-01-28T09:30:00Z'),
    obs(c, 'b', 'B', '2026-01-28T09:30:00Z')
  ];
  const off = app();
  assert.equal(meetings(off.buildSequencer(rows(off))).length, 0);
  const on = withMeeting(app());
  const seq = on.buildSequencer(rows(on));
  assert.equal(meetings(seq).length, 1);
  assert.ok(meetings(seq)[0].freq <= on.GROUND_CEILING_HZ, 'still in its register');
});
