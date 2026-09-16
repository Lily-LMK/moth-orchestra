'use strict';
// A status line reports what you now have and can play.
//
// Lily: "It will claim to be returning 24,000 records even when I've set a cap
// of 1k. I'd like it to say the truth of what it is presenting and what it is
// fetching. I don't need a count of what was there and skipped."
//
// Four lines described somewhere else, and every word of all four was true.
// "The most recent 1,000 of 24,000" is a fact about iNaturalist's archive.
// "Across 428 nights" is a fact about the dataset when the date list offers
// 144. That is the defect: a true sentence about the wrong subject.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, loadAppWithDom } = require('./harness.cjs');

// A dataset of known shape: `thick` nights clear the offering threshold and
// `thin` nights do not, so the offered count is not the night count.
function csv(thick, thin) {
  const head = 'id,user_name,user_login,scientific_name,observed_on,time_observed_at,' +
    'taxon_class_name,taxon_order_name,taxon_family_name';
  const rows = [];
  let id = 0;
  const night = (day, n, login) => {
    for (let i = 0; i < n; i++) {
      const date = `2026-03-${String(day).padStart(2, '0')}`;
      rows.push([++id, login === 'lily_kumpe' ? 'Lily Kumpe' : 'Chris Burwell', login,
        `Taxon ${i % 7}`, date, `${date}T${String(10 + (i % 8)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00+10:00`,
        'Insecta', 'Lepidoptera', 'Erebidae'].join(','));
    }
  };
  for (let d = 0; d < thick; d++) { night(1 + d, 12, 'lily_kumpe'); night(1 + d, 12, 'christopherburwell'); }
  for (let d = 0; d < thin; d++) night(20 + d, 3, 'lily_kumpe');
  return [head, ...rows].join('\n');
}

test('loadedSummary counts what is held and what the date list will offer', () => {
  const c = loadApp();
  c.document.getElementById = () => ({ textContent: '' });
  c.importCSVData(csv(3, 5));
  const s = c.loadedSummary(c.state.obs, c.groupByNight(c.state.obs), c.state.nightKey);
  assert.equal(s.records, 3 * 24 + 5 * 3);
  assert.equal(s.nights, 8, 'eight dates hold records');
  assert.ok(s.offered < s.nights, 'the thin nights are not offered');
  assert.ok(s.offered >= 3, 'the thick nights are');
});

test('the offered count comes from the same rule the date list uses', () => {
  const c = loadAppWithDom();
  Object.assign(c.state, { filterYear: 'all' });
  c.importCSVData(csv(3, 5));
  c.rebuildDerived();
  const keys = Array.from(c.state.nights.keys()).sort((a, b) => (a < b ? 1 : -1));
  assert.deepEqual(Array.from(c.state.offeredNightKeys),
    Array.from(c.offerableNightKeys(keys, c.state.nights, c.state.nightKey)),
    'rebuildDerived keeps the list it built instead of discarding it');
  const summary = c.loadedSummary(c.state.obs, c.state.nights, c.state.nightKey);
  assert.equal(summary.offered, c.state.offeredNightKeys.length,
    'the number in the sentence cannot drift from the list on screen');
});

test('the sentence names the records, the nights and the playable dates', () => {
  const c = loadApp();
  assert.equal(c.loadedSentence('Imported', { records: 6794, nights: 428, offered: 144 }),
    'Imported 6,794 observations across 428 nights. 144 dates are long enough to play.');
  assert.equal(c.loadedSentence('Fetched', { records: 1, nights: 1, offered: 1 }),
    'Fetched 1 observation across 1 night.');
  assert.equal(c.loadedSentence('Imported', { records: 40, nights: 2, offered: 1 }),
    'Imported 40 observations across 2 nights. 1 date is long enough to play.');
});

test('a sentence never claims every night plays, and never claims none does', () => {
  const c = loadApp();
  // Nothing hidden: the clause would be saying nothing, so it is not said.
  assert.equal(c.loadedSentence('Imported', { records: 100, nights: 5, offered: 5 }),
    'Imported 100 observations across 5 nights.');
  // Unknown is not zero. A missing count drops the clause rather than
  // reporting a date list of none over one that is working.
  for (const offered of [undefined, null, 0, NaN]) {
    const line = c.loadedSentence('Fetched', { records: 100, nights: 5, offered });
    assert.equal(line, 'Fetched 100 observations across 5 nights.', String(offered));
  }
});

test('no status line quotes the archive it came from', () => {
  const c = loadApp();
  const status = { textContent: '' };
  c.document.getElementById = () => status;
  c.importCSVData(csv(3, 5));
  assert.match(status.textContent, /^Imported 87 observations across 8 nights\. \d+ dates are long enough to play\./);
  assert.equal(/omitted|skipped|of \d+ —/.test(status.textContent), false,
    'nothing about what was left behind, when nothing was');
});

test('rows the file could not date are still reported, because that is about this file', () => {
  const c = loadApp();
  const status = { textContent: '' };
  c.document.getElementById = () => status;
  // Lily does not want a count of what was skipped elsewhere. A row her own
  // file could not supply a time for is a fault in the import she just ran,
  // and a silent drop of half a dataset would be worse than a number nobody
  // reads. Said only when it happened.
  c.importCSVData(csv(3, 0) + '\n9999,Lily Kumpe,lily_kumpe,No date moth,,,Insecta,Lepidoptera,Erebidae');
  assert.match(status.textContent, /1 row had no usable observation time or date and was left out\./);
});

test('the fetch progress line counts against the cap, not against the archive', () => {
  const fs = require('node:fs'), path = require('node:path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const block = html.slice(html.indexOf('  const INAT_API = '),
    html.indexOf('\n  // ── Top up: add only what has happened since the loaded records end ──'));
  assert.match(block, /Fetched \$\{done\.toLocaleString\(\)\} of up to \$\{capVal\.toLocaleString\(\)\} observations/);
  assert.equal(/of ~\$\{total\}/.test(block), false, 'the archive total is gone from the progress line');
  assert.equal(/fetched\.total/.test(block), false, 'and from the finished line');
});

test('a capped fetch says it is a slice without quoting how much more exists', () => {
  const fs = require('node:fs'), path = require('node:path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const block = html.slice(html.indexOf('  const INAT_API = '),
    html.indexOf('\n  // ── Top up: add only what has happened since the loaded records end ──'));
  // The README documented the archive total as the guard against a capped
  // fetch looking complete. Removing the total removes that guard, so the
  // replacement has to carry the same warning by construction.
  assert.match(block, /const capped = !fetched\.error && obs\.length >= capVal;/);
  assert.match(block, /your cap — raise Cap for more/);
});
