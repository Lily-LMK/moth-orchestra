# Session — the flourishes restored, and the photographs

16 September 2026. Released to `main`.

## What Lily asked for, and what was found

She opened with the plan and one sentence: **"The synchronicity flourishes are
lost."** The plan's diagnosis was that a second pad fired on an arbitrary rule;
its fix was to re-condition that pad on record density.

Measured, both the diagnosis and the fix were aimed at the wrong thing.

**Everything in the plan reproduced exactly** — 6,794 records, 144 offered
nights, 311 shared minutes, 25 doubled today, 122 at a 3-record threshold, the
current set a strict subset. Two things the plan asserted but did not show were
also confirmed: all 27 extra pads are exact duplicates, and every pad already
lands at the bell's instant, maximum delta 0.000 s across all 311.

That last measurement is what redirected the session. `duet_sync` fired on
**311 of 311** shared minutes, at exactly the bell's instant. It had not become
too common — it had stopped being a separate event. And the plan's fix would
have made 122 minutes 6 dB louder (the pad is two phase-aligned sines, so a
duplicate is exactly 2× amplitude), which is a volume change, not a moment.

## What was built

**The echo.** Both observers recording the same taxon within 30 minutes: 35
moments on 21 of the 71 nights they both worked. Never inside one minute —
measured 0 of 311 — so it could not have ridden on the shared-minute rule.

The finding that made it work: two records of one taxon **already sound at one
pitch on one instrument**, true of all 55 such pairs in the export. The answer
was always in the score. The gesture marks it rather than adding anything.

**Accepted by ear by Lily and released.**

**The meeting**, and **the ground** beneath it — the first shared minute of the
night, voiced as a long sub swell. Built, then **parked the same day** on her
first hearing: *"It's too strong, and an effect that only happens a single time
in a loop needs to certainly sound different than that."* Kept behind
`DUET_GESTURES.meeting`, with tests that it is silent by default and restores
exactly when switched on. The lesson is recorded in
[WHAT-EVERY-SOUND-MEANS.md](WHAT-EVERY-SOUND-MEANS.md): a gesture heard once in
a nineteen-second loop is heard against nothing, so it needs a different *kind*
of sound, not a quieter version of the same one.

**The photographs.** See the README section and
[PLAN-PHOTOS.md](PLAN-PHOTOS.md). The instrument now opens without them, they
preload behind it, and a photo is only shown once held. 27.8 MB to 1.2 MB on
the thumbnail grid of the busiest night; zero bytes at open.

**The sidebar.** The controls moved into the left column in an IIFE that ran
once, at load, in one direction. Opening under 768 px left the column empty for
the session; opening wide and narrowing stranded the controls in a column
mobile CSS hides. Now two-way and re-run on resize.

## Three things the tests caught that the design missed

1. **Two unidentified records share the `"Unknown taxon"` placeholder** and
   would have echoed — the instrument claiming a coincidence nobody observed.
   The placeholder is now named and the rule refuses it.
2. **The swell peaked 100 ms late.** `prerollSec` and `attackSec` were separate
   numbers that only agree when equal, so turning the attack in a gallery would
   silently push the gesture off the moment it marks. Preroll is now the attack
   itself, and every voice crests together.
3. `gondwana.test.cjs` asserted every gesture is `gond_sync`. Its intent —
   nothing borrowed — now holds as a prefix test.

## Verification

Suite **352 pass, 0 fail**, 1 skip, 8 TODO — from 298 at the start.

- The echo, the photographs, the gallery and the sidebar were **seen and heard
  by Lily** on a local server before release, and accepted.
- The ground is verified **by structure, not by ear**: 19 tests record the
  audio graph through a stub. That establishes what is connected and with what
  values, not what it sounds like. It is parked, so nothing of it sounds.
- The Gallery photo mix and `GROUND.mixes.gallery` remain **unheard**, as the
  next-family plan requires them to be marked until a room exists.
- No real-device test.

## A note on stale documents

Lily asked mid-session whether an old file was being used, because the docs
still described Gondwana as withheld. The build was current — local `main`,
`origin/main` and the live GitHub Pages page were all verified identical — but
the *documents* carried the old framing in several places. Those have been
corrected. A plan that contradicts the code costs more than it looks: it made a
released, loved family read as unfinished.
