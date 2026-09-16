# Session — which nights are worth offering

16 September 2026. Follows the import repair
([SESSION-2026-09-16-FETCH.md](SESSION-2026-09-16-FETCH.md),
[SESSION-2026-09-16-ARRIVALS.md](SESSION-2026-09-16-ARRIVALS.md)), which fixed
where a load lands. This session shortens the list it lands in.

## The problem

Landing on the right date fixed the symptom. The date list itself was still 428
entries long and half of them could not become music. Median night: 8 records.

## What was measured

Re-measured independently against `two-backyards-iNaturalist.csv` through the
application's own `parseCSVText` and `groupByNight`. The previous session's
figures held exactly: 6,794 records, 428 dates, median 8, mean 15.9, range
1–136.

| Threshold | Dates kept | of 428 | Records kept | Solo kept | Shared kept |
|---|---|---|---|---|---|
| ≥ 3 | 317 | 74% | 98.1% | 251 | 66 |
| ≥ 5 | 266 | 62% | 95.5% | 200 | 66 |
| ≥ 8 | 215 | 50% | 91.2% | 149 | 66 |
| ≥ 10 | 192 | 45% | 88.3% | 126 | 66 |
| ≥ 15 | 150 | 35% | 81.1% | 84 | 66 |
| **≥ 16** | **144** | **34%** | **79.8%** | **78** | **66** |
| ≥ 20 | 128 | 30% | 75.5% | 62 | 66 |

Two findings this session added.

**All 66 shared dates survive every threshold up to 20.** `isSharedDate`
requires twenty records, so no threshold in the plausible range can endanger the
opening-night rule or the diamonds. The rule only ever trims solo nights. That
removed the roadmap's stated worry that two-observer-ness might leak into what
is offered — it cannot, at any number Lily might pick.

**At 15 or 16, the years 2020–2023 disappear entirely.** Not thinned: every one
of their 69 dates falls below the line. Lily's backyard recording only crosses
fifteen records a night from 2024 onward.

| Year | Dates | Kept at ≥16 |
|---|---|---|
| 2020 | 12 | 0 |
| 2021 | 13 | 0 |
| 2022 | 34 | 0 |
| 2023 | 10 | 0 |
| 2024 | 73 | 15 |
| 2025 | 100 | 51 |
| 2026 | 186 | 78 |

This was put to Lily before building, because it is materially different from
"19% of records" and she did not have it when she first chose. She confirmed 16
with the figures in view.

The single-axis finding also re-confirmed: 92 zero-span nights, **none** with
more than one record. Count alone is sufficient.

## What Lily decided

1. **More than fifteen records.** Literally: sixteen or more.
2. **Hidden, not set aside.** No line saying how many left, no control that
   brings them back. This was recommended against — the recommendation was 8
   with a way back, on the CLAUDE.md principle that a hidden date is a deleted
   fact. She chose otherwise with the trade-off stated, twice, and that is the
   decision the code implements.

## What was built

One constant and two functions, beside `isSharedDate`:

- `OFFERABLE_NIGHT_MIN_RECORDS = 16`
- `isOfferableNight(arr)`
- `offerableNightKeys(keys, nights, selectedKey)`

Called from exactly one place, `rebuildDerived`. `preferredOpeningNight` gained
one clause so a fresh load never opens on a night the list would then hide.

### Two exceptions, and why they are not hedging

A bare threshold would have recreated the bug this work follows.

**Top up lands on the newest night it actually added** — at 9pm that may hold
three records. A bare threshold would hide that night, `rebuildDerived` would
find the selection invalid and bounce it elsewhere, and Top up would once again
report success and show something else. So: **the selected night is always
offered**, and leaves the list as soon as you move on. One clause, and it also
guarantees the `<select>` always contains its own selected value.

**A rule that would silence everything does not apply.** A capped fetch can
return nothing but thin nights. An empty date list on a dataset that loaded is
precisely what the import repair fixed. So if no night in scope reaches the
threshold, every night is offered — judged **within** the year filter, not
across the dataset, or filtering to 2022 would empty the list.

Neither exception softens the rule for browsing. Thin nights are hidden.

## How it was checked

**Tests first.** Red phase against the current file: 7 failing for the absence
of the rule, 9 passing to pin down behaviour that must not change. Green after
implementation. `tests/offerable-nights.test.cjs`, 16 tests.

The tests **drive the real control**. `tests/harness.cjs` gained
`loadAppWithDom`, a DOM stub complete enough to run the actual `rebuildDerived`
and read the actual `<option>` list off the actual `nightSelect`. No test
re-implements the rule.

Two stub bugs were found and fixed while writing them, both of which would have
produced false passes: arrays built in separate `vm` realms never compare
strictly equal, and a plain `innerHTML` property let options accumulate across
rebuilds instead of clearing.

**Suite: 298 pass, 0 fail**, 1 documented skip, 8 gap-remapping TODOs. Was 282
before this session.

**Against the real export**, end to end through `rebuildDerived`: 428 nights
held, 144 offered, every offered night ≥16, opens on 2026-09-12 with 35 records,
oldest offered 2024-08-23 — 2020–2023 gone, as measured.

**Simulated capped fetches** (the most recent N records, which is what a cap
returns):

| Cap | Nights | Offered | Median night | List empty? |
|---|---|---|---|---|
| 100 | 4 | 3 | 29 | no |
| 200 | 6 | 6 | 35 | no |
| 500 | 10 | 10 | 52 | no |
| 1,000 | 59 | 16 | 6 | no |
| 2,000 | 139 | 41 | 7 | no |

The list is never empty and always opens on a night that plays.

**The bundled demo** — what a first-time visitor sees — is one night of 48
records. Offered, selected, unchanged.

**Real browser.** Headless Chrome against a local server: the page loads with no
page JavaScript errors, and the rendered `nightSelect` contains
`2026-01-28  ◆` with 48 records showing. This is the first browser check any
recent session has recorded.

### Protected, and verified

The threshold governs which dates are **offered** and nothing else. A test
builds the score for a night alone, then again with thin nights added to the
dataset, and asserts the event list is identical. `isSharedDate`, the
shared-minute evidence, and where a fresh load lands are untouched except for
the one fallback clause. **No sound or score path was modified.**

## Not done

- **No listening review.** Nothing was judged by ear. Nothing should need to be
   — no sound path was touched — but it has not been heard.
- **No real-device test.** No phone, no exhibition screen.
- **Not deployed.** `main` is unchanged; this is working-tree work awaiting
  Lily's decision to commit and release.
- **No browser check of an import or a fetch.** The browser check covered the
  page loading with the bundled demo. Import CSV, Fetch and Top up under the new
  rule were verified through the application's real functions in Node, not
  through the file input and the network.
- **Not re-measured on a live fetch.** Capped fetches were simulated by slicing
  the export, which is faithful to what a cap returns but is not the API.

## One thing left for Lily's judgement

A fetch status line says "Loaded 6,794 observations across 428 nights" while the
list offers 144. Every word of that is true — it describes the dataset, not the
list — but a person who reads it and then counts the list will find a gap. The
honest fix is a clause saying how many are offered, which is close to the
set-aside line Lily declined. It was left alone rather than quietly
reintroducing a rejected design. Worth a minute of her attention.
