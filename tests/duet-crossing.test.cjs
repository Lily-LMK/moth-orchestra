'use strict';
// The crossing — one of you recorded, then the other, within two minutes.
//
// This restores the deep pad and the wide tan ring that V2 played, on a rule
// that says what it means. V2's version compared positions IN THE LOOP:
//
//     const d = Math.abs(b.atSec - a.atSec);   // loop seconds
//     if(d > win) break;                        // "within 5 seconds"
//
// A twelve-hour night compressed into nineteen seconds makes five loop seconds
// about three hours of real time, so the gesture was not marking simultaneity
// at all, and how often it fired changed with the loop length. Repairing that
// to real seconds collapsed it onto the shared-minute bell (311 of 311, same
// instant) and it was removed.
//
// What V2 was accidentally detecting is real and worth keeping: the two of them
// working in the same stretch of the night. Said honestly, at minute
// resolution, that is a crossing — two records adjacent in time, from different
// observers, close together.
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
function obs(c, id, user, time, taxon = 'Moth ' + id) {
  return c.rowToObs({ id, user_name: user, time_observed_at: time, observed_on: '2026-01-28',
    scientific_name: taxon, taxon_order_name: 'Lepidoptera', taxon_family_name: 'Noctuidae' });
}
const crossings = (seq) => seq.events.filter(e => e.kind === 'duet_cross');

test('one of you recorded, then the other, close together: that is a crossing', () => {
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z'),
    obs(c, 'b', 'B', '2026-01-28T09:01:00Z')
  ]);
  assert.equal(crossings(seq).length, 1);
});

test('the same observer twice is not a crossing, however fast', () => {
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a1', 'A', '2026-01-28T09:00:00Z'),
    obs(c, 'a2', 'A', '2026-01-28T09:00:30Z'),
    obs(c, 'a3', 'A', '2026-01-28T09:01:00Z')
  ]);
  assert.equal(crossings(seq).length, 0);
});

test('a gap beyond the window is not a crossing', () => {
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z'),
    obs(c, 'b', 'B', '2026-01-28T09:30:00Z')
  ]);
  assert.equal(crossings(seq).length, 0);
});

test('the window is DUET_CROSS_WINDOW_MIN and its boundary counts', () => {
  const c = app();
  assert.equal(typeof c.DUET_CROSS_WINDOW_MIN, 'number');
  const at = (sec) => c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z'),
    obs(c, 'b', 'B', new Date(Date.parse('2026-01-28T09:00:00Z') + sec * 1000).toISOString())
  ]);
  const w = c.DUET_CROSS_WINDOW_MIN * 60;
  assert.equal(crossings(at(w)).length, 1, 'exactly the window qualifies');
  assert.equal(crossings(at(w + 1)).length, 0, 'a second past it does not');
});

test('it sounds between the two records, and carries both as evidence', () => {
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z'),
    obs(c, 'b', 'B', '2026-01-28T09:02:00Z'),
    obs(c, 'z', 'A', '2026-01-28T10:00:00Z')
  ]);
  const x = crossings(seq)[0];
  const notes = seq.events.filter(e => e.kind === 'obs' && ['a', 'b'].includes(e.obs.id))
    .sort((p, q) => p.atSec - q.atSec);
  assert.ok(x.atSec > notes[0].atSec && x.atSec < notes[1].atSec, 'between them');
  assert.ok(x.match, 'it is never without evidence');
  assert.equal(x.match.observations.A[0].id, 'a');
  assert.equal(x.match.observations.B[0].id, 'b');
  assert.equal(x.isSpecial, true);
  assert.equal(x.obs, null);
});

test('each adjacent pair crosses once; they do not stack', () => {
  // A B A B alternating gives three crossings, not six.
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a1', 'A', '2026-01-28T09:00:00Z'),
    obs(c, 'b1', 'B', '2026-01-28T09:01:00Z'),
    obs(c, 'a2', 'A', '2026-01-28T09:02:00Z'),
    obs(c, 'b2', 'B', '2026-01-28T09:03:00Z')
  ]);
  assert.equal(crossings(seq).length, 3);
});

test('a crossing inside one minute reinforces the bell rather than replacing it', () => {
  // 40% of crossings on Lily's export fall inside a shared minute. That is the
  // composite she accepted: a low bell with a pad over it.
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:10Z'),
    obs(c, 'b', 'B', '2026-01-28T09:00:40Z')
  ]);
  assert.equal(seq.events.filter(e => e.kind === 'duet_minute').length, 1, 'the bell still rings');
  assert.equal(crossings(seq).length, 1, 'and the pad sounds with it');
});

test('a crossing across a minute boundary is a moment the bell never had', () => {
  // 475 of 790 are these: they alternated within two minutes but not inside one
  // clock minute, so no shared minute exists and nothing used to sound.
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:50Z'),
    obs(c, 'b', 'B', '2026-01-28T09:01:10Z')
  ]);
  assert.equal(seq.events.filter(e => e.kind === 'duet_minute').length, 0, 'no shared minute');
  assert.equal(crossings(seq).length, 1, 'but they did cross');
});

test('IT DOES NOT CHANGE WITH LOOP LENGTH — the defect V2 shipped', () => {
  // V2 compared atSec, so a 3-second loop and a 120-second loop found different
  // crossings on the same night. This is the regression that must never return.
  const rows = (c) => [
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z'),
    obs(c, 'b', 'B', '2026-01-28T09:01:00Z'),
    obs(c, 'c', 'A', '2026-01-28T10:00:00Z'),
    obs(c, 'd', 'B', '2026-01-28T10:20:00Z'),
    obs(c, 'e', 'A', '2026-01-28T11:00:00Z'),
    obs(c, 'f', 'B', '2026-01-28T11:01:30Z')
  ];
  const signatures = [];
  for (const loopLen of [3, 19, 120]) {
    const c = app({ loopLen });
    const seq = c.buildSequencer(rows(c));
    signatures.push(crossings(seq)
      .map(x => `${x.match.observations.A[0].id}|${x.match.observations.B[0].id}`).sort().join(','));
  }
  assert.equal(new Set(signatures).size, 1, 'the same crossings at every loop length');
  assert.equal(signatures[0], 'a|b,e|f', 'the 20-minute pair is not one of them');
});

test('it is identical when the observers swap labels', () => {
  const rows = (c) => [
    obs(c, 'p1', 'P', '2026-01-28T09:00:00Z'),
    obs(c, 'q1', 'Q', '2026-01-28T09:01:00Z'),
    obs(c, 'p2', 'P', '2026-01-28T09:01:30Z'),
    obs(c, 'q2', 'Q', '2026-01-28T09:02:00Z'),
    obs(c, 'q3', 'Q', '2026-01-28T09:02:30Z')
  ];
  const run = (A, B) => {
    const c = app({ userAName: A, userBName: B });
    return crossings(c.buildSequencer(rows(c)))
      .map(x => x.atSec.toFixed(4)).sort().join(',');
  };
  assert.equal(run('P', 'Q'), run('Q', 'P'));
});

test('records sharing a timestamp order deterministically', () => {
  const c = app();
  const build = (order) => {
    const rows = order.map(([id, user]) => obs(c, id, user, '2026-01-28T09:00:00Z'));
    return crossings(c.buildSequencer(rows)).length;
  };
  assert.equal(build([['a', 'A'], ['b', 'B']]), build([['b', 'B'], ['a', 'A']]),
    'row order in the file cannot change the music');
});

test('solo playback has no crossings', () => {
  for (const user of ['A', 'B']) {
    const c = app({ listenMode: user });
    const seq = c.buildSequencer([
      obs(c, 'a', 'A', '2026-01-28T09:00:00Z'),
      obs(c, 'b', 'B', '2026-01-28T09:01:00Z')
    ]);
    assert.equal(crossings(seq).length, 0, user);
  }
});

test('a third observer cannot make a crossing', () => {
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z'),
    obs(c, 'c', 'C', '2026-01-28T09:01:00Z')
  ]);
  assert.equal(crossings(seq).length, 0);
});

test('it is the deep pad and the wide tan ring, in every family', () => {
  for (const [voiceMode, instrument] of [['mixed', 'pad'], ['night', 'pad'],
                                          ['choir', 'choir_chord'], ['gondwana', 'gond_sync']]) {
    const c = app({ voiceMode });
    const seq = c.buildSequencer([
      obs(c, 'a', 'A', '2026-01-28T09:00:00Z'),
      obs(c, 'b', 'B', '2026-01-28T09:01:00Z')
    ]);
    const x = crossings(seq)[0];
    assert.equal(x.instrument, instrument, voiceMode);
    assert.equal(x.color, 'rgba(255,210,175,0.92)', 'the tan ring V2 drew');
  }
});

test('the written pitch is the pitch that sounds', () => {
  // duet_sync recorded midi:pitch.midi while sounding midiToFreq(pitch.midi-12),
  // so an exported score stated two different pitches for one note.
  const c = app();
  const seq = c.buildSequencer([
    obs(c, 'a', 'A', '2026-01-28T09:00:00Z'),
    obs(c, 'b', 'B', '2026-01-28T09:01:00Z')
  ]);
  const x = crossings(seq)[0];
  assert.ok(Math.abs(c.midiToFreq(x.midi) - x.freq) < 0.01,
    `midi ${x.midi} and freq ${x.freq} must describe one note`);
});
