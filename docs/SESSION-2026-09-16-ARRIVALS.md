# Session — 16 September 2026: making arrivals visible

Branch `fix/fetch-replaces-loaded-records`, second commit. Not pushed, not merged.

The fetch repair earlier in this branch fixed one path. Lily asked for the same
treatment on the CSV and top-up paths. Measuring them found that the fetch fix
was the narrow case of a wider fault, and that one of the notes written during
that repair was **wrong**.

## The correction

The fetch write-up called the CSV path's missing opening-night rule *latent*,
on the reasoning that replacing the records usually moves the date anyway. That
is false for Lily's actual data, and the reason is specific:

**28 January 2026 — the bundled demo's night — is a real night in Lily's own
export, 49 records of it.** So `rebuildDerived`'s "is the selected date still
valid?" check passes after the import, and the date never moves.

Measured in a browser, importing `two-backyards-iNaturalist.csv` through the
real file input:

| | records held | date shown | on screen |
|---|---|---|---|
| demo | 48 | 2026-01-28 | 48 |
| after importing 6,794 records spanning 2020–2026 | 6,794 | **2026-01-28** | **49** |

428 dates in the list, newest 12 September, and the app showing January.

## The silent import

`importCSVData` wrote its status to `$("csvImportStatus")`. That element was
removed from the Import panel by commit `ff837a7` ("Rebuild the interface: one
ring rule, a legend, a grouped control column") on 13 September, while the code
kept writing to it. The guard is `if(status)`, so it failed silently.

**Every CSV import since 13 September has reported nothing at all.** The
README's claim that "import status reports playable and omitted row counts" had
been untrue for three days. Traced by walking the element through the history:

```
db4dff2  1  Publish Lantern Glass, repair the wand and the Riff control
ff837a7  0  Rebuild the interface: one ring rule, a legend, a grouped control column
```

## Top up did not show what it brought

Continuing the same browser run, live against the API:

```
Topped up: 97 new observations (6794 → 6891). Asked for Chris Burwell since
2026-09-10, Lily Kumpe since 2026-09-10. 85 already held were refreshed.
```

Four new dates appeared, newest 2026-09-16. The view stayed on its old date
with the same records and the same notes. Ninety-seven records arrived and none
of them were visible without hunting through a 432-entry dropdown.

Observer identity was correct throughout — `mergeTopUp` preserves display
names, and A/B stayed `Chris Burwell` / `Lily Kumpe`. That part was never
broken.

## What the three paths now mean

They are three different intentions, and they should differ. What they share is
one obligation: **land the person where the records they just asked for are.**

| | replaces | resets Riff window | resets year filter | date lands on |
|---|---|---|---|---|
| **Import CSV** | yes | yes | yes | newest shared date |
| **Fetch** | yes | yes | yes | newest shared date |
| **Top up** | **no** | **no** (deliberate) | only if it would hide the arrival | **newest night it actually added** |

Top up's rule is deliberately not the shared-date rule. You press Top up to see
what arrived, so it goes to the newest night that genuinely **gained** a record.
`mergeTopUp` now returns `addedNights`, recent first, counting additions only —
a refreshed record is not an arrival, its night was already visible. A top-up
that only refreshes moves nothing.

The Riff window stays untouched on a top-up, as before: a top-up extends a
dataset already chosen and framed. The year filter is cleared **only** when it
would hide the arrival, because jumping to a night the filter then hides is a
lie; a filter the arrival satisfies is left alone as the framing it is.

## Verification

- `node --test tests/*.test.cjs` — **282 tests, 0 failures** (269 before this
  commit, 254 before the branch). 1 skipped, the 8 gap-remapping TODOs
  unchanged.
- `tests/arrival-visibility.test.cjs`, 13 tests, **all 13 fail against the
  previous commit**. Two of them drive the real Top up handler against a
  stubbed API on top of a real CSV import, through a shared driver so each
  varies one thing.
- **Headless Chrome, the real file input and the real Top up button, the live
  API, Lily's actual 6,798-row export:**

  | | after Import CSV | after Top up |
  |---|---|---|
  | records held | 6,794 | 6,891 |
  | dates listed | 428 | 432 |
  | date shown | **2026-09-12** | **2026-09-16** |
  | records on it | 35 | 1 |
  | notes in the loop | 35 | 1 |
  | riff window | 00:00–23:59 | 00:00–23:59 (kept) |
  | A / B | Chris Burwell / Lily Kumpe | unchanged |
  | JS errors | none | none |

  Import status line, which had been invisible for three days:

  > 6,794 observations imported; 4 omitted without a valid observation
  > time/date. Showing 2026-09-12 (35 records); pick another date to hear it.
  > Riff window reset to 00:00–23:59 (Brisbane).

  Top-up status line:

  > Topped up: 97 new observations (6794 → 6891). Showing 2026-09-16, the newest
  > night that arrived across 4 nights (1 record). Asked for Chris Burwell since
  > 2026-09-10, Lily Kumpe since 2026-09-10. 85 already held were refreshed.

## Worth Lily's attention

**The top-up landed on a night holding one record**, and one note is a thin
loop. That is exactly the rule chosen, and the reasoning holds — you pressed
Top up to see what arrived, and one record is what had arrived by that hour.
It is *not* the same situation as the fetch case, where a fresh load has no
such deliberate question behind it. But it is worth knowing that a top-up run
mid-evening will usually land on a very short night, and worth revisiting if it
grates in practice. The status line names the night and the count, so the
landing is never a mystery.

Fixed on the way: record counts in all three status lines were printing
"1 records".

## Not done

- **Not reviewed by ear**, and no sound or score path was touched.
- **Not tested on a real device.**
- No release, no push, no merge.
- The `<datalist>`-free date dropdown is now 432 entries long after a top-up.
  Landing correctly makes that survivable, but a dataset of several hundred
  dates is a navigation problem this session did not address.
- Nothing was done about `Load demo`, which still leaves whatever date and
  window were in effect. It replaces `state.obs` outright without going through
  `importCSVData`, so it has the same shape of fault; it is one night of data,
  so it resolves itself, but it is inconsistent.
