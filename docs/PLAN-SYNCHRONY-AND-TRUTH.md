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

## What the extra pads actually are — measured

This is the part that makes the fix obvious, and it was missing from the first
two drafts.

Every `duet_sync` note in a night is **the same pitch and the same instrument**:
on 2026-09-03, all 24 are `pad` at 329.63 Hz. Every `duet_minute` note is
likewise identical to its siblings — `creek` at 110.00 Hz. And because all
records in a minute carry `:00` seconds, paired events land at an identical
`atSec`.

So the two "extra" events on that night are not extra gestures. They are **the
same note, at the same instant, as the note already there**:

| at | freqs | instruments | identical |
|---|---|---|---|
| 9.3304 | 329.63 / 329.63 | pad / pad | yes |
| 16.7946 | 329.63 / 329.63 | pad / pad | yes |

Two identical notes at one instant sum to roughly double amplitude. **The only
audible effect of the doubling is that those minutes are louder.** Nothing
appears in the timeline that would otherwise be absent.

### Correcting the arithmetic

An earlier draft said the fix leaves "311 moments — identical to now". That is
true of *moments*, and it conflated moments with events, which hid the real
answer. Precisely:

| | Events |
|---|---|
| now | 311 bells + 338 pads = **649** |
| one gesture per shared minute | 311 bells + 311 pads = **622** |
| removed | **27** — every one an exact duplicate stacked on another note |

So plain de-duplication is not quite lossless: **25 shared minutes would get
slightly quieter**, because they would stop being doubled. Small, but real, and
the wrong direction given the brief.

## The fix — give the doubling a rule instead of removing it

The second pad does not need to be deleted. It needs a reason.

Keep the mechanism exactly as it is — same two layers, same doubling, same
pitches, same instruments — and change **only the condition** deciding which
minutes get the second note:

| | Condition | Minutes doubled |
|---|---|---|
| now | observer **A** holds 2+ records in the minute | 25 |
| proposed | **the minute holds 3 or more records** | **122** |

Measured, and this is why it is the answer:

> **All 25 currently-doubled minutes hold 3 or more records.** The current set is
> a strict *subset* of the proposed one. **Zero minutes lose the fuller sound;
> 97 minutes gain it.**

That is provable rather than hopeful: a minute doubles today only when A has ≥2
records, and A ≥ 2 with B ≥ 1 means the minute holds at least 3 by construction.

### What this achieves

- **Nothing is lost.** No minute loses its gesture, and no minute gets quieter.
- **Nothing sounds new.** The doubled sound already exists; 97 more minutes get
  the sound that 25 already have.
- **Duet nights get richer**, which is the direction the brief asks for: 39% of
  shared minutes carry the fuller gesture instead of 8%.
- **It becomes explicable** in one sentence: *both of you recorded in this
  minute, so the minute sounds — and if the minute holds three or more records,
  it sounds fuller.*
- **It stops depending on who is A.** The rule is symmetric, so it says
  something about the night rather than about the file.

The five-second window goes, because "three or more records in the minute" is
the whole condition. `state.duetSyncWindowSec` should go with it rather than
remain a dial that does nothing.

### If a third level is wanted

32 shared minutes hold 4 or more records. A third note there is available and
equally explicable. **Do not build it in the same change** — settle the
two-level version by ear first, since that already quintuples how often the
fuller gesture is heard.

### The one thing to check by ear

Whether 39% is the right share. It is nearly five times the current 8%, and the
brief was "don't make it rarer", not "make it more common". If 122 minutes
proves too many, `≥4 records` gives 32 — still ruled, still a superset of the
current 25, still nothing lost.

**The number is a slider between 25 and 122, and every setting on it is
explicable.** That property is the point of the change; the setting is Lily's.

### The pitch disagreement, fixed in the same change

`duet_sync` records `midi: pitch.midi` but sounds at `midiToFreq(pitch.midi -
12)`. Playback uses `freq`, so the note sounds an octave below the pitch it
records, and the export writes both columns side by side at `index.html:8887`.
Nothing is audibly wrong; the written score is untrue. Keep the sounding pitch
exactly as it is and correct the recorded one, so nothing changes by ear.

## Withdrawn — the rarity proposal

The first draft proposed three tiers with rarity targets: thinning shared
minutes to a five-minute gap, and gating a "moment of the night". **Withdrawn.**
It treated the firing rate as the defect when the rate is the thing Lily values.
Recorded so the reasoning is not repeated — the measurements behind it were
sound, the question they answered was the wrong one.

Two axes it raised are now moot. Density became the condition above rather than
a separate shading. Evenness (62% of shared minutes are even, 8% lopsided)
remains available and unused; it is symmetric and honest, but nothing needs it.

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
| **Gondwana** | `gond_sync` | `gond_sync` | released, and Lily's favourite |
| Noctilucent (withheld — the only one) | `creek` | `pad` | generic |

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

1. **Re-condition the second layer.** Change only which minutes get the second
   pad: from "observer A holds 2+ records" to "the minute holds 3+ records".
   Remove the five-second window and `duetSyncWindowSec`. Fix the `midi`/`freq`
   disagreement in the same change. Tests first, red phase against the current
   file, as with the last two sessions.
2. **Listen to a duet night.** Nothing should sound thinner, and 97 more minutes
   should carry the fuller gesture. If anything sounds thinner, stop.
3. Settle the threshold by ear — 3 records (122 minutes) or 4 (32). Both are
   supersets of today; neither can lose anything.
4. Ask Lily what Gondwana's flourish sounds like today, before touching it. It
   is the one family whose composite is a single timbre twice.
5. Voice one family. Stop. Listen. Decide whether the shape generalises.
6. Write `WHAT-EVERY-SOUND-MEANS.md` as the work settles.

The measure of success for steps 1 and 2: **nothing is lost, nothing sounds
unfamiliar, more minutes carry a sound that already exists, and every sound can
now be explained.** No minute goes quiet and no new timbre appears.

Do not build seven families before hearing one.
