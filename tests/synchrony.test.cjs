'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { loadApp } = require('./harness.cjs');
const modes = ['timeline', 'riff', 'song'];
function app(mode = 'timeline', settings = {}) {
  const c = loadApp();
  Object.assign(c.state, { seed: 28012026, userAName: 'A', userBName: 'B', spacingMode: mode,
    listenMode: 'both', riffStartMin: 0, riffEndMin: 1439, loopLen: 19 }, settings);
  return c;
}
function obs(c, id, user, time) {
  return c.rowToObs({ id, user_name: user, time_observed_at: time, observed_on: '2026-01-28',
    scientific_name: 'Test moth ' + id, taxon_order_name: 'Lepidoptera', taxon_class_name: 'Insecta' });
}
function shared(seq) {
  assert.ok(Array.isArray(seq.meta.sharedMinutes), 'metadata exposes sharedMinutes array');
  return seq.meta.sharedMinutes;
}
function evidence(match) {
  assert.ok(match && Number.isFinite(match.minuteKey), 'match retains original UTC minute key');
  for (const user of ['A', 'B']) {
    assert.ok(match.observations[user].length > 0);
    for (const o of match.observations[user]) {
      assert.ok(o.id);
      assert.ok(Number.isFinite(o.t.getTime()));
    }
  }
}
for (const mode of modes) {
  test(`${mode}: bundled sample retains eight shared minutes and observation evidence`, () => {
    const c = app(mode, { userAName: 'Chris Burwell', userBName: 'Lily Kumpe', riffStartMin: 1140, riffEndMin: 1240 });
    const seq = c.buildSequencer(c.state.obs);
    assert.equal(shared(seq).length, 8);
    for (const match of shared(seq)) evidence(match);
    assert.equal(seq.events.filter(e => e.kind === 'duet_minute').length, 8);
    for (const event of seq.events.filter(e => ['duet_minute', 'duet_sync'].includes(e.kind))) evidence(event.match);
  });
  test(`${mode}: no shared minute across adjacent minute boundary`, () => {
    const c = app(mode);
    const seq = c.buildSequencer([obs(c, 'a', 'A', '2026-01-28T09:00:59Z'), obs(c, 'b', 'B', '2026-01-28T09:01:00Z')]);
    assert.equal(shared(seq).length, 0);
    assert.equal(seq.events.filter(e => e.kind === 'duet_minute').length, 0);
  });
  test(`${mode}: third observers cannot supply A evidence or observation notes`, () => {
    const c = app(mode);
    const seq = c.buildSequencer([obs(c, 'a', 'A', '2026-01-28T09:10:00Z'), obs(c, 'b', 'B', '2026-01-28T09:00:00Z'), obs(c, 'c', 'C', '2026-01-28T09:00:00Z')]);
    assert.equal(shared(seq).length, 0);
    assert.ok(seq.events.filter(e => e.obs).every(e => ['A', 'B'].includes(e.obs.userName)));
  });
  for (const user of ['A', 'B']) test(`${mode}: solo ${user} includes only selected observer and no special gestures`, () => {
    const c = app(mode, { listenMode: user });
    const seq = c.buildSequencer([obs(c, 'a', 'A', '2026-01-28T09:00:00Z'), obs(c, 'b', 'B', '2026-01-28T09:00:00Z')]);
    assert.equal(shared(seq).length, 0);
    assert.ok(seq.events.length > 0);
    assert.ok(seq.events.every(e => !e.isSpecial && e.obs && e.obs.userName === user));
  });
  test(`${mode}: empty and missing selected observer inputs are valid and have no matches`, () => {
    const c = app(mode);
    for (const rows of [[], [obs(c, 'a', 'A', '2026-01-28T09:00:00Z')]]) {
      const seq = c.buildSequencer(rows);
      assert.equal(shared(seq).length, 0);
      assert.ok(seq.events.every(e => !e.isSpecial));
    }
  });
  test(`${mode}: duplicate records do not inflate shared minutes or their evidence`, () => {
    const c = app(mode);
    const a = obs(c, 'a', 'A', '2026-01-28T09:00:00Z');
    const b = obs(c, 'b', 'B', '2026-01-28T09:00:30Z');
    const seq = c.buildSequencer([a, a, b, b]);
    assert.equal(shared(seq).length, 1);
    assert.equal(shared(seq)[0].observations.A.length, 1);
    assert.equal(shared(seq)[0].observations.B.length, 1);
  });
  test(`${mode}: equivalent timezone offsets produce same original shared minute`, () => {
    const c = app(mode);
    const seq = c.buildSequencer([obs(c, 'a', 'A', '2026-01-28T19:00:00+10:00'), obs(c, 'b', 'B', '2026-01-28T09:00:30Z')]);
    assert.equal(shared(seq).length, 1);
    assert.equal(shared(seq)[0].minuteKey, Date.parse('2026-01-28T09:00:00Z') / 60000);
  });
  test(`${mode}: missing or invalid timestamps cannot fabricate matches or crash build`, () => {
    const c = app(mode);
    const rows = [obs(c, 'a', 'A', ''), obs(c, 'b', 'B', 'not a time'), obs(c, 'c', 'A', '2026-01-28T09:00:00Z')];
    const seq = c.buildSequencer(rows);
    assert.equal(shared(seq).length, 0);
    assert.ok(seq.events.every(e => Number.isFinite(e.atSec)));
    assert.ok(seq.events.filter(e => e.obs).every(e => e.obs.id === 'c'));
  });
  test(`${mode}: unnamed CSVs remain playable without an observer pair`, () => {
    const c = app(mode, { userAName: '', userBName: '' });
    const seq = c.buildSequencer([obs(c, 'a', '', '2026-01-28T09:00:00Z')]);
    assert.ok(seq.events.length > 0);
    assert.equal(shared(seq).length, 0);
  });
}
test('Song: composed accompaniment remains audible without claiming genuine synchrony', () => {
  const c = app('song');
  const seq = c.buildSequencer([obs(c, 'a', 'A', '2026-01-28T09:00:00Z'), obs(c, 'b', 'B', '2026-01-28T10:00:00Z')]);
  assert.ok(seq.events.some(e => e.kind === 'accompaniment'));
  assert.ok(seq.events.filter(e => e.kind === 'accompaniment').every(e => !e.match));
  assert.equal(seq.events.filter(e => ['duet_minute', 'duet_sync'].includes(e.kind)).length, 0);
});
for (const mode of ['timeline', 'riff']) {
  test(`${mode}: near-simultaneous pulses use original seconds and do not change with loop length`, () => {
    const signatures = [];
    for (const loopLen of [3, 19, 120]) {
      const c = app(mode, { loopLen });
      const seq = c.buildSequencer([
        obs(c, 'a', 'A', '2026-01-28T09:00:00Z'), obs(c, 'b', 'B', '2026-01-28T09:00:04Z'),
        obs(c, 'c', 'A', '2026-01-28T09:10:00Z'), obs(c, 'd', 'B', '2026-01-28T09:10:06Z')]);
      const pulses = seq.events.filter(e => e.kind === 'duet_sync');
      assert.equal(pulses.length, 1, 'only four-second pair qualifies for five-second window');
      evidence(pulses[0].match);
      signatures.push(JSON.stringify(pulses.map(e => e.match)));
    }
    assert.equal(new Set(signatures).size, 1);
  });
}
for (const window of [[1140, 1240, ['evening']], [1380, 60, ['late', 'early']]]) {
  test(`Riff: Brisbane clock window ${window[0]}–${window[1]} is host-timezone independent`, () => {
    const script = `const {loadApp}=require(${JSON.stringify(require.resolve('./harness.cjs'))});const c=loadApp();Object.assign(c.state,{spacingMode:'riff',userAName:'A',userBName:'B',riffStartMin:${window[0]},riffEndMin:${window[1]}});const rows=[['evening','2026-01-28T09:30:00Z'],['late','2026-01-28T13:30:00Z'],['early','2026-01-28T14:30:00Z'],['outside','2026-01-28T02:00:00Z']].map(([id,t])=>c.rowToObs({id,user_name:'A',time_observed_at:t,observed_on:'2026-01-28',scientific_name:'Test moth'}));console.log(JSON.stringify(c.buildSequencer(rows).events.filter(e=>e.obs).map(e=>e.obs.id).sort()));`;
    for (const TZ of ['UTC', 'Australia/Brisbane', 'America/New_York']) {
      const ids = JSON.parse(execFileSync(process.execPath, ['-e', script], { env: { ...process.env, TZ }, encoding: 'utf8' }));
      assert.deepEqual(ids, [...window[2]].sort(), TZ);
    }
  });
}
for (const scenario of ['gaps below one hour remain proportional', 'gaps exactly one hour remain proportional', 'gaps above one hour shorten', 'multiple long gaps preserve observation order', 'midnight crossing uses elapsed time', 'empty and single-record inputs are valid', 'shared-minute evidence is unchanged by remapping', 'disabled option preserves original Timeline and Riff is unchanged']) {
  test.todo(`Future gap remapping: ${scenario}`);
}
