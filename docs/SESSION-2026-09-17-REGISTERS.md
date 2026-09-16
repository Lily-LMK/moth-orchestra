# Session — the registers, and saying what is loaded

17 September 2026. Two pieces of work, both from
[NEXT-SESSION.md](NEXT-SESSION.md): the two pitch faults Lily heard on
16 September, and Part 2 of
[PLAN-SYNCHRONY-AND-TRUTH.md](PLAN-SYNCHRONY-AND-TRUTH.md).

**Nothing has been heard yet.** The suite is 400 tests, 391 passing, 0 failing,
1 documented skip, 8 gap-remapping TODOs — and the suite is a gate, not
evidence that any of this sounds good. Audition below.

---

## 1. One rule for which octave a voice sings in

### What was actually wrong

Both faults were the same fault. Pitch comes from the taxon, so **every voice
of a family is handed the same range** — 147 Hz to 988 Hz, measured across all
6,794 records on the 144 offered nights. Nothing but the octave can separate
four voices into a consort, and two families were not using it.

Three ways of doing this already existed in the file:

- `gondwanaVoicing` — a per-voice `ceiling`, whole-octave folding, tested.
- Three inline copies inside `bass_voice`, `tenor` and `alto`, each four lines,
  each with its own literals.
- `soprano` and all four Lantern voices — nothing at all.

There is now one: `VOICE_REGISTERS`, a floor and a ceiling per voice, and
`voicedFreq`, which folds by whole octaves. Gondwana still has its own, because
its clamp at three octaves is part of how that family sounds and this was not
the session to touch it.

### The measurement that changed the plan

The diagnosis suggested **ceilings** for Lantern — bloom 262, felt 330, reed
392, glass 494. Measured against the real export, ceilings alone are not
enough: a fold only ever comes down, so every voice keeps resting on the
score's own 147 Hz floor, all four still share a bottom, and bloom is squeezed
into 147–247 Hz — under a sixth, five pitches.

Each voice therefore has a **floor an octave below its ceiling**. Lily's
ceilings are unchanged; they are now the top of an octave rather than the top
of everything.

### What it does, as shipped

| | register | sounding min … median … max | highest partial |
|---|---|---|---|
| lantern_bloom | 131–262 | 146 … 184 … 246 | 987 Hz |
| lantern_felt | 165–330 | 184 … 246 … 329 | 1,318 Hz |
| lantern_reed | 196–392 | 220 … 293 … 369 | 1,479 Hz |
| lantern_glass | 247–494 | 293 … 369 … 493 | **1,975 Hz**, was 3,951 |
| bass_voice | 65–200 | 110 … 146 … 184 | unchanged |
| tenor | 120–350 | 146 … 220 … 329 | unchanged |
| alto | 165–440 | 184 … 293 … 440 | unchanged |
| soprano | 262–660 | 293 … **440** … 659 | was 147 … 329 … 987 |

### What it costs

Folding narrows a voice, and pitch is how a listener tells one taxon from
another. Measured **per night**, because a night is what anybody hears, not
across the archive:

| | median distinct sounds per night | taxa sharing a sound | worst pile-up |
|---|---|---|---|
| Lantern Glass, before | 23 | 43% | 4 |
| Lantern Glass, after | 16 | 77% | 4 |
| Frog Yawn, before | 19 | 67% | 4 |
| Frog Yawn, after | 17 | 73% | 4 |

Lantern Glass lands where Frog Yawn's **already-accepted** voices sit, and the
worst pile-up on one sound does not move. That is the argument that the cost is
the right one. It is an argument, not proof.

### What protects the sounds Lily has already accepted

`bass_voice`, `tenor` and `alto` were folding before this change and must sound
identical after it. A test runs the replaced inline code and the new shared rule
over every pitch the score can produce and asserts they agree note for note:

> `bass_voice, tenor and alto sound exactly where their own code put them`

A tidier version of a sound she has accepted is worth nothing if it moves it.

### One behaviour deliberately changed

Lantern's aliasing guard used to fall out of the partial filter: an absurd
fundamental produced no partials under the Nyquist limit and went silent.
Folding would have brought it back down into audibility, so the guard is now
explicit and runs **before** folding — the same order, and for the same reason,
as `scheduleGondwana`. Four tests in `lantern.test.cjs` were updated from
"retains scored fundamental" to "retains the scored pitch class", which is what
is now true.

### Found, measured, not changed: `chime` clamps

`chime` — in **Moth Orchestra**, the default family — does
`Math.min(freq, 494)`. A clamp is not a fold: it collapses everything above B4
onto B4, so two different moths sound like the same moth at a pitch neither was
given. 526 chime notes on the offered nights, **166 of them clamped (32%)**,
five distinct pitches flattened into one, **56 taxa given a pitch not their
own**.

This is the recurring defect of this repository in a new place. The fix is one
entry in `VOICE_REGISTERS`. It is **not done**: it changes the default sound of
the instrument and was not asked for. Written up in
[WHAT-EVERY-SOUND-MEANS.md](WHAT-EVERY-SOUND-MEANS.md) so it is not
rediscovered a fourth time.

---

## 2. Say what is actually loaded

Part 2 of PLAN-SYNCHRONY-AND-TRUTH.md, built as specified. The plan named three
status lines; there were **four**. The fourth is the one Lily watches while the
fetch runs:

```
Fetched 412 of ~24,000 observations…        →  Fetched 412 of up to 1,000 observations…
```

It counted against the archive for the whole run, on its way to stopping at
1,000.

All four now come from `loadedSentence` over `loadedSummary`. The offered count
comes from `offerableNightKeys` — the same function that builds the date list —
so the number in the sentence cannot drift from the list on screen.
`rebuildDerived` now keeps what it built in `state.offeredNightKeys` instead of
computing it into a local and discarding it, which is the one structural change
the plan said this needed.

Three judgements the plan left open:

- **The cap still warns.** Removing the archive total removed the guard the
  README documented. `That is the most recent 1,000, your cap — raise Cap for
  more` carries the same warning by construction, decided from the cap and the
  count rather than by asking the archive how much more of itself there is.
- **Clauses that say nothing are not said.** The playable-dates clause is
  dropped when every night is offered — and dropped when the count is unknown.
  Unknown is not zero: a line reading "0 dates are long enough to play" over a
  working date list would be this same defect again.
- **The omitted-row count stays**, but only when it is not zero. Lily asked not
  to be told what was skipped; that was about the archive. A row her own file
  could not supply a time for is a fault in the import she just ran, and a
  silent drop of half a dataset would be worse than a number nobody reads.
  **If she disagrees, it is one `if`.**

`tests/fetch-replaces.test.cjs` drives the real Fetch button at a cap of 40
against a stubbed archive of 24,000 and asserts that neither the finished line
nor the progress line mentions it.

---

## How to hear it, and what has not been done

```sh
cd sessions/2026-09-17/registers && python3 serve.py
```

- `listen.html` — the eight rendered excerpts, before and after, dense night
  and sparse night, in both families.
- `before.html` and `after.html` — the whole instrument, either side of the
  change, so any night and any family can be compared.

**Not done, and it matters:**

- **Nothing has been heard.** Not one note of this.
- **The status strings have not been read on screen.** The failure they fix was
  a true sentence that told Lily the wrong thing, and only reading one catches
  the next.
- **No real-device test**, as before.
- **Nothing is pushed.** The work is on the `voice-registers` branch. `main` is
  untouched.

### The question for Lily's ear

Lantern Glass now spans 146–493 Hz where it spanned 146–988. That is a
deliberately large move, made because "too high pitched" was the complaint. If
it has gone too far the whole family widens by changing four floors, and each
voice regains pitches as it widens. **The numbers are eight pairs in one table
and nothing else reads them.**
