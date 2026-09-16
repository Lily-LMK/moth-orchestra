# Plan — the lost flourishes, and telling the truth about what is loaded

Written 16 September 2026, from Lily's brief. Two pieces of work. The second is
small and well-defined; the first is a design problem with a measured cause.

Everything below was measured against `two-backyards-iNaturalist.csv` through
the application's own functions, on the **144 offered nights**, of which **71
have both observers**.

---

# Part 1 — The synchrony flourishes

## What Lily said

First:

> The extra synchronicity flourishes were built in to be exceptionally
> beautiful moments and we've lost them because the seconds are not stored by
> iNaturalist. We need to figure out a different activation measurement.

Then, on reading the first draft of this plan — which is the constraint that
matters:

> Right now, whatever is firing, is absolutely excellent. I enjoy the current
> frequency. It's what makes a duet night sound so much more enriched than a
> solo night. I don't want to make it more rare but I want to make sure that a
> rule is applying. Each sound should be a thing I can explain with logic and
> rules.

**The first draft of this plan proposed making the flourishes rarer. That was
wrong and is withdrawn.** It read "fires more often than intended" as the
defect. The defect is not the rate. The rate is good. The defect is that part
of what fires cannot be explained by any rule about the night.

## What is actually happening

Every shared minute currently produces a **two-layer composite**:

| Layer | Event | Instrument (most families) | Sounds at |
|---|---|---|---|
| low | `duet_minute` | `creek` | `pitch.midi − 12` |
| high | `duet_sync` | `pad` | `pitch.midi − 12` of its own pitch |

That composite — a low bell with a pad under it — is the sound Lily enjoys, and
it is what makes a duet night richer than a solo night. **It is already ruled
for 92% of shared minutes**, and it should be kept exactly as it is.

## The defect, measured

Across the 311 shared minutes on offered two-observer nights:

| | Shared minutes | Share |
|---|---|---|
| bell + **one** pad — the composite | 286 | 92.0% |
| bell + **two** pads | 25 | 8.0% |

The doubling happens when observer **A** holds two or more records in the
minute, because `duet_sync` pairs each A record to its nearest B record. And A
is simply whoever appears first in the file.

> **A = Chris Burwell. 25 shared minutes have A ≥ 2 and get the extra pad.
> 103 shared minutes have B ≥ 2 and get nothing. If the two observers swapped
> labels, the extra pad would fire on 103 minutes instead of 25 — four times as
> many, on entirely different minutes.**

That is the sound that cannot be explained. Its presence depends on an
arbitrary internal labelling, not on anything that happened in the backyard.
This is exactly what Lily is asking to remove — and removing it changes 8% of
minutes, not the rate.

### A second, smaller defect: the pitch disagrees with itself

`duet_sync` is written with `midi: pitch.midi` but `freq: midiToFreq(pitch.midi
- 12)`. Playback uses `freq`, so the note **sounds** an octave below the pitch
it **records**. The export writes both columns side by side —
`midi_note: e.midi` and `frequency_hz: e.freq` at `index.html:8887` — so an
exported score states two different pitches for the same note.

Nothing is audibly wrong today, because `freq` is what sounds. But the recorded
score does not describe the music, which fails the project's own rule that
derived data must be inspectable and true. Fix it whichever way sounds right —
the octave is a musical choice, the disagreement is not.

## The fix — keep the sound, keep the rate, make it a rule

**One gesture per shared minute, both layers, always.**

- The number of moments where a flourish happens: **311 — unchanged.**
- The sound of each: **unchanged**, the composite that already occurs on 92%.
- What goes: the 25 arbitrary extra pads, and the five-second window that has
  not meant anything since it was written.

Say the rule in one sentence, which is the test of whether it is a rule:

> **Both of you recorded in this minute, so the minute sounds — a low bell with
> a pad, once, however many records it holds.**

The five-second window (`state.duetSyncWindowSec`) should go rather than remain
a dial that does nothing. `duet_sync` as a *kind* may be worth keeping as the
name of the upper layer, since tests, the score reference and the export all
know it; that is an implementation choice, not a design one.

**This is not a reduction.** If anything in the build makes a duet night sound
less rich than it does today, the build has gone wrong.

## Optional, if the rule should say more — decided by ear, not here

Two honest axes exist that do **not** change how often anything fires. Both are
symmetric between the observers, unlike the defect above. Neither is required.

**1. Let the gesture's weight follow the minute's density.** Both duet events
hardcode `density: 1`, but `density` drives note velocity
(`0.15 + 0.12·log2(density)`) and already means "how many observations this
represents" on ordinary notes. Setting it from the shared minute's record count
would use the existing vocabulary rather than inventing one.

| Records in the shared minute | Count | Share |
|---|---|---|
| 2 | 189 | 60.8% |
| 3 | 90 | 28.9% |
| 4 | 27 | 8.7% |
| 5–7 | 5 | 1.6% |

Rule: *"a busier minute sounds fuller."* Honest, but note 61% sit in one bucket,
so the effect will be subtle. Measured before proposing, so it is not oversold.

**2. Let the gesture distinguish even from lopsided minutes.**

| Shape | Count | Share |
|---|---|---|
| even — both recorded the same number | 193 | 62.1% |
| uneven | 92 | 29.6% |
| lopsided — one recorded 3× the other | 26 | 8.4% |

Rule: *"you each saw one thing"* against *"one of you was in a burst while the
other passed through."* This is the meaningful version of the distinction the
broken rule was accidentally making — but symmetric, so it does not matter who
is A.

Recommendation: build the core fix first and **listen to it alone**. It should
sound essentially identical to today. Only then decide whether either axis adds
anything, because both are subtle and the current sound is already liked.

## Part 1b — Something beautiful in each family

Unchanged from the first draft, and still the larger half of the work. Six
families are published; here is what each plays when a shared minute fires:

| Family | Low layer | High layer | State |
|---|---|---|---|
| Moth Orchestra (`mixed`) | `creek` | `pad` | generic, two timbres |
| Boobook (`night`) | `creek` | `pad` | generic, two timbres |
| Frog Yawn (`choir`) | `choir_unison` | `choir_chord` | its own, two timbres |
| Fireflies (`steelpan`) | `creek` | `pad` | generic, two timbres |
| Lantern Glass (`lantern`) | `creek` | `pad` | generic, two timbres |
| **Gondwana** | `gond_sync` | `gond_sync` | **one timbre, twice** |
| Noctilucent (withheld) | `creek` | `pad` | generic |

Two problems.

**Four of six published families play a foreign sound.** `creek` and `pad`
belong to no family in particular; in Lantern Glass or Fireflies they are an
imported object rather than a flourish of that instrument.

**Gondwana is the odd one, and it is the most-listened family.** Every other
family's composite is two *different* timbres — a bell and a pad. Gondwana
plays `gond_sync` for both layers, so its composite is one timbre sounding
twice at two pitches. That is a different kind of sound, and it is worth
listening for whether Gondwana's flourish already feels unlike the others.
Lily knows Gondwana by ear better than any measurement here; the question is
hers to answer, and it should be answered before anything is rebuilt.

### The rule to build toward

> A family's flourish should be made of that family's own materials, heard in a
> way its ordinary notes never are.

Not a new instrument bolted on: the same bodies played differently — struck
where they are normally plucked, held where they are normally short, doubled at
an octave, or opened into the room. Gondwana already has the room; its
convolver bus is the only reverb in the instrument.

Available materials:

- `night` — gecko, katydid, bat_click, weta, possum_rustle, boobook, banjo_frog
- `choir` — soprano, alto, tenor, bass_voice (plus `choir_unison`, `choir_chord`)
- `steelpan` — lead_pan, double_second, guitar_pan, bass_pan
- `lantern` — lantern_felt, lantern_glass, lantern_reed, lantern_bloom
- `gondwana` — gond_felt, gond_heartwood, gond_bronze, gond_bowed, gond_column,
  gond_membrane, gond_rim, gond_drone, gond_pulse
- `noctilucent` — noct_root, noct_bow, noct_halo, noct_prism, noct_choir,
  noct_spark, noct_tide, noct_wire

Two layers × seven families is fourteen voices, of which four exist. Sequence
it, and **do not build seven families before hearing one**: the first Gondwana
palette was rejected by ear on the day it was built.

1. Ask Lily what Gondwana's flourish sounds like now, before changing it.
2. Lantern Glass — the other released family with a strong identity.
3. Moth Orchestra, Boobook, Fireflies.
4. Frog Yawn already has its own; confirm it still fits the rebuilt rule.
5. Noctilucent last, and only if it is released.

## Part 1c — The inventory of sounds

Lily: *"Each sound should be a thing I can explain with logic and rules."*

That is a broader ask than the flourishes, and it is a small closed set — the
instrument makes five kinds of event. Writing the inventory down is cheap and
it is the thing that would have caught this defect years earlier.

| Kind | Rule | Explicable? |
|---|---|---|
| `obs` | one per observation; pitch from taxon, instrument from voice family and rank | yes |
| `duet_minute` | one per shared minute | yes |
| `duet_sync` | pairs an A record to a B record within five seconds | **no — see above** |
| `accompaniment` | song mode's composed rhythm on non-matching slots; marked as not evidence, neutral dot | yes, as authorship |
| `gond_pedal` | Gondwana's authored harmony on a slow clock; no glow, no thumbnail, no arrival | yes, as authorship |

Proposed deliverable alongside the fix: a short **`docs/WHAT-EVERY-SOUND-MEANS.md`**
— one page, one entry per sound, each stating what makes it fire, what it
claims about the data, and whether it is evidence or authorship. Two of the
five are authorship and already say so, which is the model for the rest. Verify
the echo behaviour while writing it; it was not audited here.

# Part 2 — Say what is actually being presented

## What Lily said

> The fetch should list what it actually returns. The same thing happens with
> the iNaturalist API fetch. It will claim to be returning 24,000 records even
> when I've set a cap of 1k. I'd like it to say the truth of what it is
> presenting and what it is fetching. I don't need a count of what was there
> and skipped.

## The cause

`fetched.total` is the API's `total_results` — the **entire matching archive**
for those observers. It is reported at `index.html:8737`:

```
This is the most recent 1,000 of 24,000 — raise Cap for more.
```

Every word is true and none of it is about what you now have. The same pattern
appears two lines above:

```
Loaded 6,794 observations across 428 nights
```

— the dataset's nights, not the 144 the date list offers. And the CSV import
line has the same shape. **Three status lines describe an archive when the
person wants to know what they are holding.**

## The rule

> A status line reports what you now have and can play. Not what exists
> elsewhere, not what was skipped.

## The changes

1. **Fetch.** Report the fetched count, the nights it covers, and how many
   dates are playable. Drop the archive total.
2. **Import CSV.** Same: records imported, nights, dates offered.
3. **Top up.** Already good — it reports what it added. Check the nights
   phrasing for the same archive/offering confusion.

Proposed shape, to be judged on screen rather than here:

> Fetched 1,000 observations, your cap, across 59 nights. 16 dates are long
> enough to play; showing 2026-09-12 (35 records). Riff window reset to
> 00:00–23:59 (Brisbane).

## One thing to watch

The README currently documents the archive total as a **deliberate guard**: the
status line reports the fetched count against the true total so a capped fetch
"never implies completeness". Removing the total removes that guard, so the
replacement must carry the same protection by construction. **"The most recent
1,000, your cap"** does that — it says plainly that this is a slice — without
quoting a number about somewhere else. Update that README paragraph in the same
change, or the documentation will contradict the code.

Note this also closes the open question left by the night-display work: the
"across 428 nights" line was flagged there for Lily's judgement, and this is her
answer to it.

## How to check it

Cheap and worth doing properly, because status lines are exactly the kind of
thing that gets asserted in a test and never read by a person:

- Tests on the composed strings, driving the real import and fetch handlers.
- Then **read them on screen** at a cap of 1,000 and at no cap. The failure this
  fixes was a true sentence that told Lily the wrong thing; only reading it
  catches the next one of those.

---

# Suggested order for the session

Part 2 first. It is small, it is fully specified, it is the thing that is
actively misleading, and finishing it clears the open question from the last
session. Half a day at most.

Then Part 1, in this order:

1. **Make the composite a rule.** One gesture per shared minute, both layers,
   always; remove the five-second window and the 25 arbitrary extra pads. Tests
   first, red phase against the current file as with the last two sessions.
   Fix the `midi`/`freq` disagreement in the same change.
2. **Listen to it.** It should sound essentially as it does now. A duet night
   must not sound thinner. If it does, stop — the constraint has been broken.
3. Only then decide whether density or evenness should shade the gesture.
   Both are subtle; the current sound is already liked.
4. Ask Lily what Gondwana's flourish sounds like today, before touching it —
   it is the one family whose composite is a single timbre twice.
5. Voice one family. Stop. Listen. Decide whether the shape generalises.
6. Write `WHAT-EVERY-SOUND-MEANS.md` as the work settles.

The measure of success for steps 1 and 2 is that **nothing sounds different**
and every sound can now be explained. That is an unusual brief and it is the
right one here.

Do not build seven families before hearing one.
