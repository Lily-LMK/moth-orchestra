# Plan — reshaping Emergence into something of its own

Lily, 17 September 2026, after hearing it live:

> *"Emergence is fantastic but it's a lesser Gondwana so I think we should
> reshape it into something of its own. I'll leave it for you to brainstorm and
> plan in the next session."*

**Nothing is decided here.** This document exists so the next session starts
from a diagnosis and a set of real choices instead of a blank page. The
brainstorm is still to happen, with her.

---

## She is right, and it is measurable

Measured across 40 offered nights of the two-backyards export, at species rank:

| | Emergence (p10 / median / p90) | Gondwana (p10 / median / p90) |
|---|---|---|
| sounding pitch | 165 / **294** / 440 Hz | 82 / **185** / 440 Hz |
| note length | 0.40 / **1.35** / 3.40 s | 5.20 / **6.80** / 8.00 s |
| attack | 0.009 / 0.038 / 0.165 s | 0.002 / 0.003 / 0.900 s |

**100% of Emergence's notes land inside Gondwana's central register**
(73–494 Hz). Not most. All of them.

And every structural idea in Emergence's sound was Gondwana's first:

| | Gondwana | Emergence |
|---|---|---|
| a convolver room on its own bus | 14 September | 17 September — borrowed on purpose |
| whole-octave folding into a register | `gondwanaVoicing` | `foldIntoRegister` |
| additive sine partials, per-partial decay | yes | yes |
| late-arriving partials | age | tribe |
| an authored harmonic layer | `gond_pedal` | `moth_ground` |
| long tails as the dominant gesture | yes | yes |

So Emergence is Gondwana's sound world, one octave up and five seconds shorter.
That is the definition of a lesser version of something.

## Whose fault it is, precisely

Mine, and traceably so. Lily asked for *"a touch of Gondwana"* and then
described what she meant: soft piano phrases, delicate bell tones, a warm
organ background, wordless vocal textures, slow harmonic movement, lingering
notes. I built each of those things **out of Gondwana's own materials** — its
room, its mass, its low register, its long decay, its authored pedal — because
they were there and they worked.

The mistake is not that she asked for the wrong thing. It is that *"a touch
of Gondwana"* described a **mood**, and I implemented it as an **architecture**.

## The thing worth protecting

**The mapping is the idea, and the mapping is untouched by any of this.**

Eight ranks, each setting one thing, each sized by what that rank measurably
tells apart on a real night — genus 25.0 effective values, kingdom 1.0. That
took the count of nights on which *every* taxon is distinguishable from 17 of
144 to 142 of 144. Nothing about it requires a room, a low register, or a long
tail. It is a mapping from lineage to **parameters**; which parameters those
are is entirely open.

> **The reshape is: keep the mapping, replace the sound world.**

Everything in `MOTH_AXES`, `mothVoicing`, `mothCode` and the entropy reasoning
survives. What changes is `MOTH_SPECTRA`, `MOTH_CLASS_VOICES`, the envelope
tables, the room, and possibly the ground.

## The name is a gift, and it points somewhere

**Emergence** is not a synonym for *arrival*. It is the word for many small
events producing a pattern that none of them contains — which is exactly what
a night at a moth sheet is, and it is a completely different musical idea from
Gondwana's deep time.

Gondwana is **one enormous slow thing**. Emergence could be **thousands of tiny
fast things that add up to one**. That is not a lesser version of Gondwana; it
is its opposite, and the two would sit beside each other rather than one
behind the other.

## Directions to react to — none chosen

Roughly from "closest to now" to "furthest".

### 1. Dry, close and small
Delete the room entirely. Gondwana's whole sound is *distance*; Emergence's
could be *proximity* — a sheet at 2 a.m., things landing near your ear. High
register rather than low, 20–300 ms rather than 1–4 s, articulation instead of
decay. Cheapest to try: it is mostly deletion plus new envelope tables.

### 2. Granular — the name taken literally
Each arrival is a **cloud of grains** rather than a note. Rank sets grain
density, spread, duration and pitch scatter; a well-determined specimen is a
tight, focused cloud and an undetermined one is a diffuse hiss. The
identification-depth rule, which already exists, becomes the family's central
gesture rather than a footnote. Furthest from Gondwana by construction, since
Gondwana has no grains anywhere.

### 3. Articulated rather than sustained
Rank sets **rhythm** — how a record is articulated in time, not what it is made
of. Gondwana already owns "how much a record says" through its figures, so this
would need care not to collide; the difference would be that Gondwana
*elaborates* and Emergence *stutters, repeats, accumulates*.

### 4. Breath and formant
The whole family as filtered noise: vowels, breath, consonants. No struck
bodies at all, which is the one thing every other family in this instrument
already is. Risky — it could read as "the wordless texture, louder" — and
`noct_choir` is nearby.

### Combinations
1 + 2 is the most coherent: **dry, close, granular, high, quick**. A night
would read as a field of small events accumulating, which is what the data is
and what the name says.

## Questions only Lily can answer

1. **High or low?** Gondwana owns low. Is Emergence allowed to be bright and
   small, or does that lose what she likes about it now?
2. **Room or no room?** The room is the single biggest thing they share.
   Removing it is the fastest way to separate them and also the most drastic.
3. **Does the ground stay?** `moth_ground` is the clearest borrowing from
   `gond_pedal`. It could go, or become something that is not a chord bed —
   for instance a noise floor that thickens with the night's count.
4. **Which of the things she asked for on 17 September must survive?** She
   named soft piano phrases, delicate bells, a warm organ background, wordless
   vocals, slow harmony, lingering notes. Several of those *are* the overlap.
   Knowing which one or two are non-negotiable decides the rest.
5. **Is "thousands of small things adding up" the right reading of the name**,
   or does Emergence mean something else to her?

## What must not change

- The mapping, and the entropy reasoning behind it.
- 142 of 144 nights fully distinguishable. **Re-measure after any reshape** —
  a new sound world can quietly destroy the distinguishability the mapping
  buys, and the count is the honest check.
- The written score. Whole-octave folding, or whatever replaces it, must
  preserve the pitch class; `tests/musical-reference.test.cjs` holds it.
- Identification depth stays audible.
- Moth Orchestra stays exactly as it is.

## How to check it

The measurement that decides whether the reshape worked is the one at the top
of this document, run again: **what share of Emergence's notes land inside
Gondwana's register, and how far apart are the two medians.** If it is still
100%, it is still a lesser Gondwana however different the timbres are.

Then her ear, on the same two nights as always — 17 February and 3 September —
and the two families played back to back.
