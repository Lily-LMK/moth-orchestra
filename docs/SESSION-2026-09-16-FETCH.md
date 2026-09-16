# Session — 16 September 2026: the silent fetch

Branch `fix/fetch-replaces-loaded-records`. Not pushed, not merged.

Lily reported it precisely: a fetch from scratch, the dates appear in the
dropdown, the status line says it worked, and then nothing. No records visible,
no notes in the loop, no music.

The fetch was working. Everything after it was discarding the result.

## What was actually wrong

Two faults, both of them the same mistake: **a fresh fetch inherited the framing
of whatever was loaded before it.**

### 1. Fetch merged instead of replacing

`inatFetchBtn` ran `mergeTopUp(state.obs, obs)`, joining the fetched records to
the bundled demo. That interacts fatally with how the duet pair is chosen:

- `computeDuetUsers` takes the first two distinct observers **in chronological
  order**.
- The demo is 28 January 2026. A capped "most recent N" fetch returns September.
- So A and B stayed `Chris Burwell` and `Lily Kumpe` — the demo's *display
  names*.
- Every fetched record carries a **login** as its name (`lily_kumpe`), because
  the API has no display name to give.
- `observerRole()` returns `null` for anyone who is neither A nor B, and
  `selectedObservations()` drops those records before the sequencer ever sees
  them.

Measured on the real path, demo + 60 fetched records:

```
night 2026-01-28: 48 records -> 64 events
night 2026-09-10: 60 records -> 0 events
```

Sixty records, zero notes. The dates were in the dropdown because
`groupByNight` runs over every record; the silence came later.

This predates the top-up work. The pre-top-up handler merged by id as well.
What changed on 16 September is that **Top up now exists**, so Fetch has no
remaining reason to merge — the three import paths can finally mean three
different things.

### 2. The demo's riff window survived

`importCSVData` resets the window to 00:00–23:59 for exactly this reason. Fetch
never did. So the demo's 19:00–20:40 Brisbane window silently framed somebody
else's data, and in Riff — the default mode — anything outside it was filtered
out even once the pair was right.

## The fix

Fetch is a fresh dataset, like a CSV import and unlike a top-up. It now:

- **replaces** the loaded records (`applyFetchedObs`, a pure function beside
  `mergeTopUp`), carrying across only the display name of a login already held,
  so `Import CSV` → `Fetch` still reads "Lily Kumpe" and not "lily_kumpe";
- resets the riff window to 00:00–23:59 Brisbane;
- clears a year filter chosen for the replaced dataset;
- opens on a night that plays;
- reports all of it in the status line.

### Which night a fresh dataset opens on

Lily's decision, made against her real data. Strictly-newest is the obvious
rule and the wrong one: a fetch run in the evening lands on tonight, which held
one record at the time of checking —

```
2026-09-16      1 records, 1 observer(s)
2026-09-15     26 records, 2 observer(s)  <- shared
2026-09-14     33 records, 2 observer(s)  <- shared
...
2026-09-07     83 records, 2 observer(s)  <- shared
```

— and one lonely note looks uncomfortably like the bug just fixed.

So a fresh fetch opens on the newest **shared date**: two distinct observers and
at least twenty records. That notion already existed, marking dates in the date
list; it is now the named `isSharedDate` / `SHARED_DATE_MIN_RECORDS` used by
both the list and the opening choice, rather than a loop inlined in
`rebuildDerived`. With no shared date anywhere, it falls back to the newest
night it has. Every other date stays one selection away, and the status line
names the night it chose and how many records it holds.

This rule is applied on **Fetch only**. CSV import and Top up are untouched.

## Verification

- `node --test tests/*.test.cjs` — **269 tests, 0 failures** (254 before), 1
  skipped, the 8 existing gap-remapping TODOs unchanged.
- `tests/fetch-replaces.test.cjs`, 15 tests, **all 15 fail against the pre-fix
  file** and pass after. The last of them slices the real `inatFetchBtn`
  handler out of `index.html` and runs it in the harness context against a
  stubbed API, so the handler cannot drift away from the rules the other tests
  assert. Pre-fix it fails on `the demo is replaced, not joined: 60 !== 12`.
- **Live, against the real iNaturalist API**, both logins, cap 300:

  ```
  Loaded 300 observations across 10 nights, replacing the 48 previously loaded.
  Observers: lily_kumpe, christopherburwell. Showing 2026-09-15 (26 records);
  pick another date to hear it. Riff window reset to 00:00–23:59 (Brisbane).
  This is the most recent 300 of 24,979 — raise Cap for more.

  riff window: 0 - 1439
  duet pair: [ 'lily_kumpe', 'christopherburwell' ]
  demo night 2026-01-28 still present? false
  selected night: 2026-09-15 - 26 records
    riff:     26 events (26 notes)
    timeline: 26 events (26 notes)
    song:     74 events (58 notes)
  nights that sequence nothing: 0 of 10
  ```

  Pre-fix, that last line would have read 10 of 10.

- **Headless Chrome, the real button, the live API.** A test-only copy of the
  page sets the two logins and Cap 300, clicks `inatFetchBtn`, waits for it to
  be released, and reports what the real UI holds. Three runs, same query.

  | | pre-fix, after fetch | pre-fix, then picking 15 Sep | after the fix |
  |---|---|---|---|
  | status line | "Loaded 300 new observations (348 total) across 11 nights." | same | "Loaded 300 observations across 10 nights, replacing the 48 previously loaded… Showing 2026-09-15 (26 records)…" |
  | records held | 348 (demo + fetched) | 348 | **300** |
  | dates in the list | 11 | 11 | 10 |
  | date actually selected | **2026-01-28** — the demo night | 2026-09-15 | **2026-09-15** |
  | records on that night | 48 — the demo's | 26 | 26 |
  | thumbnails rendered | 48 | 26 | 26 |
  | **notes in the loop** | 48 (all demo) | **0** | **26** |
  | A / B | Chris Burwell / Lily Kumpe | same | lily_kumpe / christopherburwell |
  | riff fields | 19:00 – 20:40 | 19:00 – 20:40 | **00:00 – 23:59** |
  | JS errors | none | none | none |

  Column one is "I don't actually see the records": the fetch succeeded, the
  September dates were in the list, and the page was still showing January.
  Column two is "no notes populate the loop": 26 records on screen, zero notes.
  Both halves of the report, reproduced and then gone.

## Not done

- **Not reviewed by ear**, and no audio path was touched.
- **Not tested on a real device.**
- No release, no push, no merge.
- `Import CSV` still does not reset the year filter, and still does not choose
  an opening night. Same latent shape as the bug fixed here; deliberately left
  alone because Lily reported Fetch and replacement usually moves the date
  anyway. Worth settling deliberately rather than by accident.
- `0 shared minutes` on nights both observers worked is correct, not a defect:
  a shared minute needs the same absolute UTC minute, which is rarer than a
  shared night.
- Fetch still accepts at most two usernames, and a third observer would have no
  role. Unchanged, and unrelated.
