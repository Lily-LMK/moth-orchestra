# Gondwana — the palette

Step 1 of the five in [PLAN-NEXT-FAMILY.md](PLAN-NEXT-FAMILY.md). Two attempts,
13 September 2026. **Not accepted.** Withheld from the published instrument.

Audition: `../../sessions/2026-09-13/gondwana-2/listen.html`
(`python3 serve.py` in that folder, then http://127.0.0.1:8774/listen.html —
the browser will not load the WAVs over `file://`). The first attempt is kept
at `../../sessions/2026-09-13/gondwana/` for comparison.

## The first attempt, and why it failed

Fifteen bodies with real physical mode ratios — membrane, free-free bar,
stopped pipe, stiff string — rank-graded 7/9/11/13/15. Measured richer than
Moth Orchestra at every rank. Lily's verdict: *"a child's xylophone or
panhand"*, and she was right.

The diagnosis, which is the useful part:

1. **Fifteen bodies, one envelope shape.** Eleven of the fifteen attacked in
   under 10 ms; median decay 1.1 s. The *ratio tables* varied and the *gesture*
   did not. Timbre identity is carried far more by evolution in time than by a
   static spectrum, so varying the ratios was varying the least audible axis.
2. **Nothing evolved.** Every partial began at the same instant and decayed
   monotonically. That is the acoustic signature of a small struck object,
   however the ratios are arranged.
3. **The register was never touched.** The score writes nothing below D3
   (146 Hz) and the family inherited octaves 3–5 whole. Depth was not reachable.
4. **There is no reverb anywhere in the instrument.** Zero convolvers; the
   shared chain is a 220 ms delay with 0.34 feedback. That is an echo, not a
   room. No palette sounds vast inside 220 ms.

## The second attempt

Three decisions, taken with Lily:

**Rank buys depth per voice, not more voices.** Seven bodies, not fifteen. The
first palette in this instrument that deliberately does *not* grow with rank.
`gondwanaDepth(depth)` spends the rank inside each voice: 3 partials at class
rank rising to 8 at species, tails from 55% to 100%, beating from none to full,
late-arriving partials from a quarter weight to full. The same seven bodies,
made older. This reinterprets the January finding rather than contradicting it —
what rises with rank becomes spectral states per voice instead of instrument
count.

**The family performs the score in its own register.** `gondwanaVoicing()`
places each body under a ceiling — heartwood and drone at 110 Hz, membrane 165,
bronze 220, bowed and column 330, rim not moved. The shift is always a whole
number of octaves, so the pitch class is exact; the written score is never
altered, only placed, the way a contrabass section reads a part. The
noctilucent-warm precedent, made structural.

**A room, on this family's bus alone.** A seeded, normalised synthetic impulse
(3.6 s, darkening tail, decorrelated stereo) through a convolver, with a
contained limiter, feeding the shared master. The five accepted families are
bit-for-bit unchanged and need no re-judging — the same containment logic §4
chose for the sub.

And the fix underneath all three: **partials now enter at different times and
outlive each other.** A struck bronze body gives up its transient in
milliseconds and leaves a hum — at half the named pitch, real bell physics —
still swelling four seconds later. A bowed body brightens as it is held, then
the harmonics leave and the fundamental stays.

## The seven bodies

| Voice | Body | Sounds | Centroid | Under 120 Hz | Ring |
|---|---|---|---|---|---|
| `gond_heartwood` | struck heartwood, large | 2 octaves down, 73 Hz | 66 Hz | 99% | 4.5 s |
| `gond_bronze` | struck bronze, true bell partials | 1 octave down, 147 Hz | 84 Hz | 86% | 3.8 s |
| `gond_bowed` | a bowed body, brightening | as written, 294 Hz | 333 Hz | 0% | 5.0 s |
| `gond_column` | blown stopped column, air to pitch to air | as written, 294 Hz | 309 Hz | 0% | 4.5 s |
| `gond_membrane` | large struck skin over its cavity | 1 octave down, 147 Hz | 105 Hz | 58% | 3.7 s |
| `gond_rim` | a rubbed rim — the light on top | as written, 294 Hz | 296 Hz | 0% | 5.5 s |
| `gond_drone` | sustained tube, beating against itself | 2 octaves down, 73 Hz | 73 Hz | 100% | 5.0 s |

Measured from a D4 note at species rank. Ring is time within 40 dB of the
voice's own peak — 3.7 to 5.5 s, against a median of 1.1 s in the first attempt.

## Where the weight went

3 September 2026, species rank, whole-night average:

| Family | 0–60 | 60–120 | 120–250 | 250–500 | 500–1k | 1–4k | Centroid |
|---|---|---|---|---|---|---|---|
| Moth Orchestra | 0.0% | 0.7% | 8.7% | 69.8% | 16.1% | 4.6% | 472 Hz |
| Gondwana | 3.0% | 18.2% | 14.3% | 58.4% | 5.7% | 0.4% | 305 Hz |

About thirty times the energy below 120 Hz, and the centroid falls by 167 Hz.
That is measurement. It says the weight is there; it cannot say the room feels
like awe, and it should not be allowed to stand in for that judgement.

## Audio checks

Offline renders, 40.5 s (two loops plus tail), 44.1 kHz stereo. **No clipped
samples, no non-finite values** in any render. Peaks after RMS matching: 0.300
Moth Orchestra, 0.270 Gondwana, 0.227 palette. Peak spread across the seven
bodies at D4 is 7.1 dB; no voice drops out at any octave.

Two real faults were caught by the tests before anything was rendered:

- `gond_bowed` released every partial within half a second of the others — a
  synth-pad release, not a body. The fundamental now outlasts the harmonics by
  about 3.5 s. The same fault was latent in `gond_column` and `gond_rim`.
- The impulse response ran above full scale, which would have silently
  multiplied the gain of everything routed through the room. It is now
  normalised rather than scaled by a hand-picked constant.

## Tests

`tests/gondwana.test.cjs`, rewritten for the new contract. 45 tests.
Suite total: 209 tests, 200 pass, 0 fail, 1 documented skip, 8 gap TODOs.
Nothing in the existing suite changed.

Beyond the contract the earlier families share, three tests exist because of
this family specifically:

- **octave placement is exact** — the sounding pitch is always the written pitch
  times a whole power of two, at or under the body's ceiling, and the rim is
  never moved.
- **partials enter late and outlive each other** — at species rank something
  starts after the onset, and the spread between first and last envelope end is
  at least two seconds. This is the first attempt's failure turned into a guard.
- **the room belongs to Gondwana** — no existing family creates a convolver,
  Gondwana creates exactly one, and reuses it rather than building one per note.

## What has not been done

No listening judgement. No real hardware. No room. The floor (§3, generated from
the night's own shape) and the ground (§3, the body-felt sub) are unbuilt —
this is the canopy alone. Steps 2 through 5 unstarted.

Lily's playback is headphones only. Four of the seven bodies now sit between 66
and 105 Hz, which headphones can carry; nothing here needs a subwoofer, and the
Gallery mix remains unheard by anyone.

## Open question from the measurements

`gond_rim` and `gond_bowed` are the quietest voices (−22 dB peak against
−15 dB for the drone) and the only ones left in the upper register. Whether the
light on top survives the mass underneath is a listening question, not a
measurement one.

## Tools added

`tools/audition-render.cjs`, `audition-ladder.cjs`, `audition-palette.cjs` —
headless offline renderers driving the application's own `OfflineAudioContext`
path. They need Chromium and Playwright, which the Mac does not have; they ran
in the cloud workspace. They replace the hand-clicked capture button used for
the Lantern Glass and Noctilucent auditions.
