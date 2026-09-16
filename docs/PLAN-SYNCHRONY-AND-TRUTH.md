# Plan — the lost flourishes, and telling the truth about what is loaded

Written 16 September 2026, from Lily's brief. Two pieces of work. The second is
small and well-defined; the first is a design problem with a measured cause.

Everything below was measured against `two-backyards-iNaturalist.csv` through
the application's own functions, on the **144 offered nights**, of which **71
have both observers**.

---

# Part 1 — The synchrony flourishes

## What Lily said

> The extra synchronicity flourishes were built in to be exceptionally
> beautiful moments and we've lost them because the seconds are not stored by
> iNaturalist. We need to figure out a different activation measurement for
> these flourishes (three records in a minute?) and ensure that something
> beautiful happens with each musical family.

## The diagnosis — measured, not assumed

Two gestures were built as a hierarchy:

| Gesture | Rule | Intent |
|---|---|---|
| `duet_minute` | both observers in the same UTC minute | ordinary co-presence |
| `duet_sync` | two records within **5 seconds** | the exceptional moment |

iNaturalist stores minute precision: **97.7% of records carry `:00` seconds**
(6,636 of 6,794). So "within five seconds" can only be satisfied by records in
the same minute, both at `:00` — which is the shared-minute rule. **The two
rules became one rule.**

The measurements:

- **56 of 71** two-observer nights fire `duet_sync` exactly as many times as
  `duet_minute`. In the other 15, `duet_sync` fires **more**, because the
  pairing is per-A-record and several A records pair to the same B.
- On 2026-09-03 (136 records), **all 24** `duet_sync` events land **within
  50 ms** of a `duet_minute` event. They are stacked on the same instant.
- On that night the two flourishes together are **25.3% of all events** — 46 of
  182 — and 22 shared-minute bells fall inside a 19-second loop, one every
  0.86 seconds through the back half.

So the loss is not that the exceptional gesture stopped firing. It is that the
exceptional gesture became **indistinguishable from the ordinary one, doubled
onto the same instant, and then both became constant**. Nothing is exceptional
at twelve times a night.

Note what is *not* broken: the shared-**minute** gesture is honest and works at
the resolution the data actually has. Song mode is unaffected — it uses
`findSharedMinutes` only and has no near-sync path.

## The principle for the rebuild

The hierarchy must be rebuilt on an axis the data actually carries. Seconds are
gone. Two axes survive at minute resolution:

- **density within a minute** — how much happened at once
- **rarity across the night** — whether this is the most of it

And one rule, learned directly from the failure:

> **The tiers must be exclusive. A minute is Tier 3, or Tier 2, or Tier 1 —
> never two at once.** Stacking is what destroyed the hierarchy. Whatever is
> built, a minute that earns a higher tier must *not* also fire the lower one.

## The measured candidates

Across the 71 two-observer offered nights:

| Rule | Total | Per night | Nights firing | Max on a night |
|---|---|---|---|---|
| shared minute (current) | 311 | 4.4 | 54 | 22 |
| ≥3 records in a minute, any observer | 190 | 2.7 | 52 | 14 |
| **≥3 in a minute, both present** | 122 | 1.7 | 42 | 9 |
| **≥4 in a minute, both present** | 32 | 0.5 | 21 | 3 |
| ≥5 in a minute, both present | 5 | 0.1 | 5 | 1 |
| both observers ≥2 in one minute | 6 | 0.1 | 5 | 2 |
| densest shared minute (one per night) | 54 | 0.8 | 54 | 1 |

Lily's guess — three in a minute — is a good one and lands in the right region.
At "≥3, both present" it fires 1.7 times a night on 42 of 71 nights, which is
rare enough to notice. Its weakness is the tail: up to 9 on a busy night.

## The proposal — three tiers

### Tier 1 · Together — the quiet marker

Both observers in the same minute, as now, but **thinned**. Currently 5.8 a
night and up to 22 in a 19-second loop, which is a wash rather than a marker.

| Minimum gap between markers | Per night |
|---|---|
| none (current) | 5.8 |
| 2 minutes | 4.7 |
| **5 minutes** | **3.2** |
| 10 minutes | 2.3 |

Recommend a **5-minute minimum gap**. It nearly halves the count while keeping
every night that has any. An alternative worth considering is thinning relative
to **loop length** rather than clock minutes, since the wash is a function of
events-per-second in the loop, not of the night. Measure before choosing.

### Tier 2 · A burst together — the rare accent

**Four or more records in one minute with both observers present.** 0.5 a
night, on 21 of 71 nights, and **never more than 3**. That ceiling is the
argument for 4 over Lily's 3: at ≥3 the tail reaches 9, and a gesture that can
fire nine times is not an exceptional moment.

If it proves too rare in listening, ≥3 is the fallback and is a one-number
change. Decide by ear, not from this table.

### Tier 3 · The moment of the night — guaranteed, exactly one

**The densest shared minute of the night**, tie-broken to the earliest.

This is the direct answer to "ensure that something beautiful happens". It is a
guarantee rather than a probability: **every night with any shared minute gets
exactly one**, and never more. It fires on all **54** of the 71 nights that have
a shared minute at all.

Measured caveat, which needs Lily's judgement: on **12 of those 54 nights the
densest shared minute holds only 2 records** — one each. The peak of a quiet
night is not much of a peak.

| Densest shared minute holds | Nights |
|---|---|
| 2 records | 12 |
| 3 records | 21 |
| 4 records | 16 |
| 5 records | 3 |
| 6 records | 1 |
| 7 records | 1 |

Two options:

- **Always fire it** (54 nights). The guarantee is unconditional; on a quiet
  night the gesture marks "the closest you came", which is honest and still
  true. Recommended, because the guarantee is the point.
- **Require ≥3 records** (42 nights). The moment is always a real peak, but 12
  nights get nothing.

Also settle the ties: 27 of 54 nights have a tied densest minute. Earliest is
the simplest tie-break and is defensible — the first time the night peaked.

### What this replaces

`duet_sync` and its 5-second window go. The window constant
(`state.duetSyncWindowSec`) should go with it rather than being left as a dial
that no longer does anything. The standing roadmap already carried the
suppression of the five-second rule as a proposal with evidence; this is that
decision, made.

### Honesty constraints — non-negotiable

The existing evidence rules must survive the rebuild:

- These gestures are **composed rhythm, not measurement**. A shared minute does
  not establish simultaneity and the interface already says so. Tiers 2 and 3
  make a *stronger-looking* claim, so the wording must get **more** careful, not
  less. Tier 3 in particular must never read as "they were together" — it means
  "this is the minute with the most records from both".
- Evidence must retain original observation IDs and timestamps, as
  `findSharedMinutes` does now.
- The shared-minute evidence panel, `isSharedDate`, the date diamond and the
  offering threshold are all separate rules and none of them changes here.

---

## Part 1b — Something beautiful in each family

This is the larger half of the work and the least specified.

Six families are published — Moth Orchestra, Boobook, Frog Yawn, Fireflies,
Lantern Glass, Gondwana — and Noctilucent is withheld. Here is what each one
currently plays when a flourish fires:

| Family | Tier 1 sound | Tier 2 sound | State |
|---|---|---|---|
| Moth Orchestra (`mixed`) | `creek` | `pad` | generic |
| Boobook (`night`) | `creek` | `pad` | generic |
| Frog Yawn (`choir`) | `choir_unison` | `choir_chord` | has its own |
| Fireflies (`steelpan`) | `creek` | `pad` | generic |
| Lantern Glass (`lantern`) | `creek` | `pad` | generic |
| Gondwana | `gond_sync` | `gond_sync` | **the same sound twice** |
| Noctilucent (withheld) | `creek` | `pad` | generic |

Two problems, both visible in that table.

**Four of six published families play a foreign sound.** `creek` and `pad`
belong to no family in particular. In Lantern Glass or Fireflies they are an
imported object, not a flourish of that instrument.

**Gondwana plays one sound for both tiers.** The family Lily listens to most
has the two gestures collapsed into a single sound *and* stacked on the same
instant — the worst case of the bug, in the most-used voice.

### The rule to build toward

> A family's flourish should be made of that family's own materials, heard in a
> way its ordinary notes never are.

Not a new instrument bolted on: the same bodies, played differently — struck
where they are normally plucked, held where they are normally short, doubled at
an octave, or opened into the room. Gondwana already has the room (its
convolver bus is the only reverb in the instrument), and `gond_rim` is the only
light left on top of that family — a candidate for the moment of the night.

Available materials, for reference when designing:

- `night` — gecko, katydid, bat_click, weta, possum_rustle, boobook, banjo_frog
- `choir` — soprano, alto, tenor, bass_voice (already has `choir_unison`,
  `choir_chord`)
- `steelpan` — lead_pan, double_second, guitar_pan, bass_pan
- `lantern` — lantern_felt, lantern_glass, lantern_reed, lantern_bloom
- `gondwana` — gond_felt, gond_heartwood, gond_bronze, gond_bowed, gond_column,
  gond_membrane, gond_rim, gond_drone, gond_pulse
- `noctilucent` — noct_root, noct_bow, noct_halo, noct_prism, noct_choir,
  noct_spark, noct_tide, noct_wire

Three tiers × seven families is **21 flourish voices**, of which four exist.
That is not one session. Sequence it:

1. **Gondwana first** — most listened to, and currently the most broken.
2. **Lantern Glass** — the other released family with a strong identity.
3. Moth Orchestra, Boobook, Fireflies.
4. Frog Yawn — already has two; it needs a third for Tier 3.
5. Noctilucent last, and only if it is released.

Every one of these is a **listening judgement**. The measurement above can say
how often a gesture fires; it cannot say whether it is beautiful. Build one
family, hear it, then decide whether the shape generalises. The Gondwana
palette was rejected by ear on the day it was built — the precedent is that
building all seven before listening would be a mistake.

---

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

1. Decide the tiers with Lily against the tables above — the Tier 2 number, and
   whether Tier 3 fires on all 54 nights or only the 42 with a real peak.
2. Build the three-tier rule with the exclusivity constraint, tests first, red
   phase against the current file as with the last two sessions.
3. Remove `duet_sync` and its window constant.
4. Voice **Gondwana** only. Stop. Listen.
5. Decide from there whether the shape generalises to the other five.

Do not build seven families before hearing one.
