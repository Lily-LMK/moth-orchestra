'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadApp, loadAppWithDom} = require('./harness.cjs');

// Which nights are worth offering.
//
// Landing on the right date (SESSION-2026-09-16-ARRIVALS) fixed the symptom;
// the date list itself was still 428 entries long and half of them could not
// become music. Measured against two-backyards-iNaturalist.csv: 6,794 records
// across 428 dates, median 8 a night, range 1 to 136.
//
// Lily decided on 16 September 2026: a night needs more than 15 records to be
// offered, and nights below that are hidden rather than set aside. She chose
// hiding over set-aside knowing the cost, and chose 16 knowing that it removes
// 2020-2023 from the instrument entirely — no night in those four years
// reaches 16 records. 144 of 428 dates remain, holding 79.8% of the records.
//
// One axis, not two. A span rule looks obviously necessary and is not: all 92
// zero-span nights in the export hold exactly one record, and there is no
// multi-record night with a zero span. Thin nights are short because they are
// thin. Do not add a span rule without re-measuring.

// A night of `count` records on `date`, spread a minute apart.
function nightRows(date, count, logins, startId) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const lg = logins[i % logins.length];
    const hh = String(19 + Math.floor(i / 60)).padStart(2, '0');
    const mm = String(i % 60).padStart(2, '0');
    out.push(`${startId + i},${lg},${lg},Agape chloropyga,${date},${date}T${hh}:${mm}:00Z,Insecta,Lepidoptera,Erebidae`);
  }
  return out;
}
const CSV_HEAD = 'id,user_name,user_login,scientific_name,observed_on,time_observed_at,taxon_class_name,taxon_order_name,taxon_family_name';
function csvOf(nights) {
  const rows = [CSV_HEAD];
  let id = 1000;
  for (const n of nights) { rows.push(...nightRows(n.date, n.count, n.logins || ['lily_kumpe'], id)); id += 1000; }
  return rows.join('\n');
}
// The dates the app is currently offering, read off the real control.
function offeredDates(c) {
  return c.elements.get('nightSelect').children.map(o => o.value).filter(Boolean);
}
function withDataset(nights, selected) {
  const c = loadAppWithDom();
  c.state.obs = c.parseCSVText(csvOf(nights));
  if (selected) c.state.nightKey = selected;
  c.rebuildDerived();
  return c;
}

/* ───────────────────────── The rule, named once ───────────────────────── */

test('the threshold is named once, and it is more than fifteen records', () => {
  // Asserted through the rule rather than the constant: what matters is where
  // the boundary actually falls for a caller.
  const c = loadApp();
  let smallest = null;
  for (let n = 0; n <= 24 && smallest === null; n++) {
    if (c.isOfferableNight(new Array(n).fill({}))) smallest = n;
  }
  assert.equal(smallest, 16, 'the smallest night worth offering');
});

test('a shared date always clears the offering threshold', () => {
  // isSharedDate and the offering rule are separate numbers that must not
  // drift apart: the night a fresh dataset opens on has to be offerable.
  const c = loadApp();
  const shared = c.parseCSVText(csvOf([
    {date: '2026-01-10', count: 20, logins: ['lily_kumpe', 'christopherburwell']}
  ]));
  assert.equal(c.isSharedDate(shared), true, 'the fixture must be a shared date');
  assert.equal(c.isOfferableNight(shared), true);
  // And one record fewer must fail both, so this is a boundary, not a coincidence.
  assert.equal(c.isSharedDate(shared.slice(0, 19)), false);
});

test('the rule rejects nothing it was not given', () => {
  const c = loadApp();
  assert.equal(c.isOfferableNight(null), false);
  assert.equal(c.isOfferableNight(undefined), false);
  assert.equal(c.isOfferableNight([]), false);
});

/* ─────────────────── What the date list actually offers ─────────────────── */

test('a night too thin to compose is not offered', () => {
  const c = withDataset([
    {date: '2026-03-10', count: 20},
    {date: '2026-02-10', count: 3},
    {date: '2026-01-10', count: 30}
  ], '2026-03-10');
  assert.deepEqual(offeredDates(c), ['2026-03-10', '2026-01-10']);
});

test('fifteen records is thin and sixteen is not', () => {
  const c = withDataset([
    {date: '2026-03-10', count: 30},
    {date: '2026-02-10', count: 16},
    {date: '2026-01-10', count: 15}
  ], '2026-03-10');
  assert.deepEqual(offeredDates(c), ['2026-03-10', '2026-02-10']);
});

test('the offered dates stay in recent-first order', () => {
  const c = withDataset([
    {date: '2026-01-10', count: 20},
    {date: '2026-05-10', count: 20},
    {date: '2026-03-10', count: 20}
  ], '2026-05-10');
  assert.deepEqual(offeredDates(c), ['2026-05-10', '2026-03-10', '2026-01-10']);
});

/* ───────────── The night you were deliberately sent to ───────────── */

test('the selected night is offered even when it is thin', () => {
  // Top up lands on the newest night that arrived, which at 9pm may hold
  // three records. Hiding it would bounce the selection elsewhere and
  // recreate the bug SESSION-2026-09-16-ARRIVALS repaired.
  const c = withDataset([
    {date: '2026-03-10', count: 3},
    {date: '2026-01-10', count: 30}
  ], '2026-03-10');
  assert.deepEqual(offeredDates(c), ['2026-03-10', '2026-01-10']);
  assert.equal(c.state.nightKey, '2026-03-10', 'the selection must not move');
  assert.equal(c.state.nightObs.length, 3, 'and it must play what it holds');
});

test('a thin night that was only passing through leaves the list behind it', () => {
  const c = withDataset([
    {date: '2026-03-10', count: 3},
    {date: '2026-01-10', count: 30}
  ], '2026-03-10');
  c.state.nightKey = '2026-01-10';
  c.rebuildDerived();
  assert.deepEqual(offeredDates(c), ['2026-01-10']);
});

test('a thin selected night is placed in date order, not appended', () => {
  const c = withDataset([
    {date: '2026-05-10', count: 20},
    {date: '2026-03-10', count: 2},
    {date: '2026-01-10', count: 20}
  ], '2026-03-10');
  assert.deepEqual(offeredDates(c), ['2026-05-10', '2026-03-10', '2026-01-10']);
});

/* ─────────── A rule that would silence everything does not apply ─────────── */

test('when no night reaches the threshold every night is offered', () => {
  // A capped fetch, or a first night at the sheet, can hold nothing but thin
  // nights. An empty date list on a dataset that loaded is the exact shape of
  // the bug just repaired, and hiding all but one date is nearly as bad.
  const c = withDataset([
    {date: '2026-03-10', count: 5},
    {date: '2026-02-10', count: 3},
    {date: '2026-01-10', count: 9}
  ], '2026-03-10');
  assert.deepEqual(offeredDates(c), ['2026-03-10', '2026-02-10', '2026-01-10']);
});

test('the escape hatch is judged within the year filter, not across the dataset', () => {
  const c = loadAppWithDom();
  c.state.obs = c.parseCSVText(csvOf([
    {date: '2026-03-10', count: 30},
    {date: '2022-02-10', count: 3},
    {date: '2022-01-10', count: 4}
  ]));
  c.state.filterYear = '2022';
  c.state.nightKey = '2022-02-10';
  c.rebuildDerived();
  assert.deepEqual(offeredDates(c), ['2022-02-10', '2022-01-10'],
    'a year holding only thin nights still offers them rather than emptying');
});

/* ─────────────────── Where a fresh dataset opens ─────────────────── */

test('a fresh load never opens on a night it would then have to hide', () => {
  const obs = loadApp().parseCSVText(csvOf([
    {date: '2026-03-10', count: 3},
    {date: '2026-02-10', count: 20},
    {date: '2026-01-10', count: 40, logins: ['lily_kumpe', 'christopherburwell']}
  ]));
  const c = loadApp();
  // No shared date exists above, so this exercises the fallback rather than
  // the shared-night preference.
  const solo = obs.filter(o => o.nightKey !== '2026-01-10');
  assert.equal(c.preferredOpeningNight(solo), '2026-02-10');
});

test('a fresh load still prefers the newest shared night', () => {
  const c = loadApp();
  const obs = c.parseCSVText(csvOf([
    {date: '2026-03-10', count: 30},
    {date: '2026-02-10', count: 40, logins: ['lily_kumpe', 'christopherburwell']}
  ]));
  assert.equal(c.preferredOpeningNight(obs), '2026-02-10');
});

test('a fresh load of nothing but thin nights opens on the newest of them', () => {
  const c = loadApp();
  const obs = c.parseCSVText(csvOf([
    {date: '2026-03-10', count: 3},
    {date: '2026-01-10', count: 4}
  ]));
  assert.equal(c.preferredOpeningNight(obs), '2026-03-10');
});

/* ───────────────────────────── Protected ───────────────────────────── */

test('hiding a thin night changes nothing about the night that plays', () => {
  // One context, so the two scores are comparable: arrays built in separate
  // vm realms have different prototypes and never compare strictly equal.
  const c = loadAppWithDom();
  c.state.riffStartMin = 0; c.state.riffEndMin = 1439;  // the whole night, so there is a score to compare
  c.state.nightKey = '2026-01-10';

  c.state.obs = c.parseCSVText(csvOf([{date: '2026-01-10', count: 30}]));
  c.rebuildDerived();
  const alone = c.state.sequencer.events.map(e => [e.tSec, e.midi]);
  assert.ok(alone.length >= 30, 'the fixture must actually produce a score');

  c.state.obs = c.parseCSVText(csvOf([
    {date: '2026-03-10', count: 2},
    {date: '2026-02-10', count: 1},
    {date: '2026-01-10', count: 30}
  ]));
  c.rebuildDerived();
  assert.deepEqual(c.state.sequencer.events.map(e => [e.tSec, e.midi]), alone,
    'the threshold governs which dates are offered and nothing else');
  assert.equal(c.state.nightObs.length, 30);
});

test('a thin night is still counted, grouped and available to the data model', () => {
  // Hidden from the date list is not absent from the dataset. The records are
  // still loaded, still grouped by night and still exportable.
  const c = withDataset([
    {date: '2026-03-10', count: 3},
    {date: '2026-01-10', count: 30}
  ], '2026-01-10');
  assert.equal(c.state.obs.length, 33);
  assert.equal(c.state.nights.size, 2);
  assert.equal(c.state.nights.get('2026-03-10').length, 3);
});
