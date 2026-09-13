'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { loadApp } = require('./harness.cjs');
const { settings } = require('./score.cjs');
const plain = value => JSON.parse(JSON.stringify(value));
const event = (kind, atSec, user = 'AB', extra = {}) => ({ kind, atSec, user,
  instrument: kind === 'obs' ? 'lantern_glass' : 'creek_shared', freq: 220, density: 1,
  isSpecial: kind !== 'obs', isEcho: false, ...extra });
const crossing = [event('obs', 1, 'A'), event('duet_minute', 1.5), event('accompaniment', 1.6),
  event('duet_sync', 1.7), event('obs', 1.8, 'B'), event('obs', 1.9, 'A', { isEcho: true })];

test('wand crossing auditions real shared minutes and observations without arrangement-only gestures or echoes', () => {
  const c = loadApp();
  const result = c.scrubEventsBetween(crossing, 0.5, 2, 'both');
  assert.deepEqual(plain(result).sort((a,b) => a.atSec-b.atSec), [crossing[0], crossing[1], crossing[4]]);
});
for (const user of ['A', 'B']) test(`wand ${user} solo auditions only that observer and no shared flourish`, () => {
  const c = loadApp();
  assert.deepEqual(plain(c.scrubEventsBetween(crossing, 0.5, 2, user)), crossing.filter(e => e.user === user && !e.isEcho));
});

test('wand crossing uses open start and closed end boundaries without repeating stationary notes', () => {
  const c = loadApp();
  assert.deepEqual(plain(c.scrubEventsBetween(crossing, 1, 1.5, 'both')), [crossing[1]]);
  assert.equal(c.scrubEventsBetween(crossing, 1.5, 1.5, 'both').length, 0);
  assert.equal(c.scrubEventsBetween([], 0, 2, 'both').length, 0);
});

test('dense wand crossing stays bounded while giving a genuine minute flourish priority', () => {
  const c = loadApp();
  const dense = Array.from({length: 10}, (_, i) => event('obs', i / 10, 'A'));
  const minute = event('duet_minute', 0.95);
  const result = c.scrubEventsBetween([...dense, minute], -1, 1, 'both');
  assert.equal(result.length, 4);
  assert.ok(result.includes(minute), 'ordinary events cannot exhaust the audition budget before the shared marker');
  assert.equal(c.scrubEventsBetween(dense, -1, 1, 'both', 2).length, 2);
  assert.equal(c.scrubEventsBetween(dense, -1, 1, 'both', 0).length, 0);
});

function scrubHarness(listenMode = 'both') {
  const canvas = { width: 400, height: 300, style: {}, addEventListener() {}, getContext: () => ({}),
    getBoundingClientRect: () => ({width:400,height:300,left:0,top:0}) };
  const c = loadApp(undefined, {document: {getElementById: () => canvas, addEventListener() {}},
    window: {devicePixelRatio:1,innerWidth:1200,addEventListener() {}}});
  const notes = [];
  c.testAudio = {currentTime: 100};
  vm.runInContext('audioCtx = testAudio; _dragPrevSec = 4;', c);
  c.scheduleInstrument = (ctx, instrument, when, freq, velocity) => notes.push({instrument,when,freq,velocity});
  Object.assign(c.state, {isPlaying:false,listenMode,volume:0.5,loopLen:10,
    sequencer:{events:[event('duet_minute',4.5),event('accompaniment',4.6)]}});
  return {c,notes};
}

test('actual wand handler audibly crosses a Song shared-minute marker while paused', async () => {
  const {c,notes} = scrubHarness();
  await c.setPlayheadToAngle(200,250);
  assert.equal(notes.length,1);
  assert.equal(notes[0].instrument,'creek_shared');
  assert.ok(notes[0].velocity > 0 && notes[0].velocity <= 0.5);
  assert.equal(c.state.isPlaying,false);
});

test('actual wand handler honors solo and suppresses large discontinuous seeks', async () => {
  const {c,notes} = scrubHarness('A');
  await c.setPlayheadToAngle(200,250);
  assert.equal(notes.length,0);
  c.state.listenMode = 'both';
  vm.runInContext('_dragPrevSec = 1;',c);
  await c.setPlayheadToAngle(200,250);
  assert.equal(notes.length,0);
});

// TODO: a separate creek_shared voice for genuine shared minutes was drafted
// for Noctilucent but never designed for the other families, and Noctilucent
// itself has not been accepted by ear. Deciding this would change an accepted
// sound, so it belongs to a listening session, not to a green suite.
test('Emergence Song distinguishes genuine shared-minute audio from composed accompaniment', { skip: 'creek_shared voice is an undecided listening question' }, () => {
  const c = loadApp();
  Object.assign(c.state,settings,{spacingMode:'song',voiceMode:'noctilucent'});
  const seq = c.buildSequencer(c.state.obs);
  const shared = seq.events.filter(e => e.kind === 'duet_minute');
  assert.equal(shared.length,8);
  assert.ok(shared.every(e => e.instrument === 'creek_shared' && e.match.observations.A.length && e.match.observations.B.length));
  assert.ok(seq.events.filter(e => e.kind === 'accompaniment').every(e => e.instrument === 'creek'));
  // Captured from the accepted warm score before this repair: prove the change
  // preserves the complete observation arrangement and underlying minute evidence.
  const digest = values => crypto.createHash('sha256').update(JSON.stringify(values)).digest('hex');
  assert.equal(digest(seq.events.filter(e=>e.kind==='obs')), '461253e7dd8267bc20a14b59608efd825afe6533ba3a547554daa33a732be474');
  assert.equal(digest(seq.events.filter(e=>e.kind==='accompaniment')), 'd95ac9723ba1e74a6ab8047aa6eac68cab9591d6568e9b20d8713580f97e2221');
  assert.equal(digest(shared.map(({instrument,...e})=>e)), 'cf0932ef16b172a55713122c081c9e03025863a3bbe875dacf9591b34f1d989d');
});

test('Lantern Glass Song retains its accepted creek shared-minute voice', () => {
  const c = loadApp();
  Object.assign(c.state,settings,{spacingMode:'song',voiceMode:'lantern'});
  const shared = c.buildSequencer(c.state.obs).events.filter(e => e.kind === 'duet_minute');
  assert.equal(shared.length,8);
  assert.ok(shared.every(e => e.instrument === 'creek'));
});
