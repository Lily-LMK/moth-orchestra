# Plan — a new instrument family for the gallery

Prepared 13 September 2026, at Lily's request, for the next session.

Brief, in her words: a family that "creates a room ambience — think big
speakers, a large museum gallery space — but also a felt through the body bass
at synchronous moments. Something that recreates a feeling of awe. Forest
ambience meets tribal meets deep time." Plus the observation that Moth
Orchestra is sweeter because it brings in more instruments at greater
taxonomic specificity, and that species feels richer than tribe.

---

## 1. The specificity hypothesis is correct, and the numbers say why

Measured on the 28 January 2026 demo night, Timeline, seed 1, 48 records:

| Rank    | Voice groups | Distinct instruments | Distinct pitches |
|---------|--------------|----------------------|------------------|
| Class   | 1            | 1                    | 3                |
| Order   | 6            | 5                    | 9                |
| Family  | 25           | 7                    | 15               |
| Tribe   | 39           | 8                    | 15               |
| Species | 45           | 11                   | 14               |

And the palette size of each existing family, measured at species rank:

| Family          | Distinct instruments |
|-----------------|----------------------|
| Moth Orchestra  | 11                   |
| Boobook         | 7                    |
| Frog Yawn       | 4                    |
| Fireflies       | 4                    |
| Lantern Glass   | 4                    |

Two findings.

**Moth Orchestra is sweeter because it has nearly three times the palette of
Lantern Glass.** Eleven instruments against four. That is the whole difference.

**Depth of rank buys timbre, not pitch.** Instruments climb 1 → 5 → 7 → 8 → 11
as the rank deepens, while pitch variety peaks around family and tribe at 15
and actually falls slightly at species. So the richness Lily hears at species
level is the palette opening, not the melody widening. A four-voice family
cannot get richer at species rank no matter how specific the data is — it has
already spent everything it has by family.

On this night, the instruments that appear **only** at species rank are
`bowl` (5 notes), `harp` (1 note) and `hat` (8 notes). Bowl and harp are the
sweetness Lily is hearing; hat is percussive. Two sustaining resonant voices,
arriving only when the data is specific enough to ask for them, are doing that
work — which is a useful thing to know when choosing the new palette.

**Design rule for the new family:** the palette must be large enough that
species rank keeps revealing. Target fourteen to sixteen voices, and consider
making the selected rank a parameter of the synthesis itself — deeper rank
producing more articulate attacks and more distinct resonant bodies — rather
than only widening the hash that picks from a fixed list.

## 2. One thing to settle before we build: the word "tribal"

Said plainly and once, because it matters more here than it would elsewhere.

This instrument is being shown at the Queensland Museum and may go to the World
Science Festival. Sound designed and described as "tribal" will be heard by an
Australian gallery audience as referencing Aboriginal and Torres Strait
Islander music, whether or not that is intended, and the museum carries
obligations about that which a sound design decision should not quietly create.
Some of the instruments the brief evokes are culturally specific here — a
yidaki-like drone or a bullroarer would be read as a direct reference.

What the brief is actually describing musically is available without any of
that: communal rather than solo, percussive and entrained, weight and
repetition, bodies struck rather than notes played. All of it can be built from
physical first principles — struck wood, struck stone, tensioned skin, blown
resonant tube, bowed metal, rotated air — and named by its physics rather than
by any culture. Nothing is lost. The awe comes from scale, register and
patience, not from allusion.

**Settled, 13 September 2026:** Lily confirms "tribal" was thinking aloud and
nothing in the system depends on it. Voices will be built from physical models
and named for what they physically are.

## 3. The proposal — three strata

The family is **Gondwana** — Lily's choice, 13 September 2026.

### Floor — the room
A continuous bed **generated from the night's own shape**: record density, how
the arrivals are spread, how long the lulls run. Very low filtered noise and
slow partials, evolving over minutes rather than seconds. A sparse February
night and a heaving September night must not sound alike.

This is the answer to the Ambience question Lily raised: the current five
presets add nothing because they are decoration laid over the night rather than
anything the night produced. Everything else in this instrument earns its place
by coming from the data. The floor should too.

### Canopy — the arrivals
The taxonomic voices: fourteen to sixteen struck, blown and bowed resonant
bodies spread across registers. This is where the species-rank richness lives.

### Ground — the shared minutes
The body-felt sub. A 32–45 Hz swell with a long attack of roughly 400–700 ms
and a long decay, so it arrives as a pressure change rather than a thump —
awe rather than impact. Fired **only** on genuine shared minutes, never on
composed accompaniment.

## 4. Technical constraints the design must respect

### Headroom — measured, and the answer is "no master limiter"

Measured on the current build, 19 s offline renders, seed 1, Moth Orchestra:

| Case | Peak | dBFS | Samples at or over full scale |
|---|---|---|---|
| Song, Class, note level .55 | 0.695 | −3.16 | 0 |
| Song, Species, note level .55 | 0.308 | −10.23 | 0 |
| Song, Species, note level 1.0 | 0.550 | −5.19 | 0 |
| Timeline, Species, note level 1.0 | 0.603 | −4.39 | 0 |

**Nothing clips today.** The worst case sits about 3 dB below full scale and
no sample reaches it. So the missing limiter is not a defect to repair; it is
a fact to design around.

Why it still matters for this family: low frequencies carry far more energy
than high ones for the same perceived loudness, and the proposed sub is a long
slow swell rather than a short ping — it sits underneath everything else for a
second or more, and peaks add. The risk is not "the sub is loud". The risk is
the sub plus a dense passage plus a shared-minute flourish arriving together
at gallery level, against three decibels of margin.

**Recommendation: do not fit a master limiter.** One across the whole mix would
compress the dynamic range that makes the quiet arrivals quiet, and would
change the accepted sound of all five existing families, requiring Lily to
re-accept every one of them. That is a large musical cost to solve a problem
that only the new family creates.

Instead: **give the sub its own bus with its own limiter**, exactly as the
ambience bus already does. The new risk is contained to the new thing, every
existing family stays bit-for-bit unchanged, nothing needs re-accepting, and
gain staging can be tuned on the sub alone. Step 0 becomes "measure again with
the sub in, on its own bus" rather than a decision about the master chain.

**Measurement gap to close:** the offline render returned identical figures
with ambience off and ambience at full, so the renderer appears not to include
the ambience bus. Nothing above accounts for ambience, and that must be
established before any claim about combined headroom.

**The low end is empty and clean.** Existing voices are high-passed at 55 Hz.
The sub is additive rather than competing, and there is nothing to unmask.

**Sub-bass is inaudible on a phone and most laptops.** The shared-minute event
needs an audible mid-register component so the moment is not silent on small
speakers, and the family likely needs a gallery / personal mix choice. Design
for both, verify on both.

**Deep time versus a 19–60 second loop.** Material that obviously repeats
inside the loop will not feel old. The floor's modulation should be
incommensurate with the loop length, or the floor should run free of the loop
entirely — it is room, not evidence, so it does not have to be loop-locked.

**Verification is by offline render.** There is no true-peak metering in Web
Audio; `tools/reference-player.py` and the existing offline renderer are how we
check that renders are finite and below full scale.

## 5. The honesty rule this family must not break

The floor and the sub are authored, and must be named as such. The floor is
generated *from* the night's shape but is not evidence of anything. The sub
fires on genuine shared minutes only — the distinction between a real
coincidence and composed accompaniment is the thing this whole instrument
protects, and a body-felt cue is the most persuasive signal in the piece. It
must never fire on something that did not happen.

## 6. Session sequence

Bounded steps, each ending in something Lily can hear.

0. ~~**Measure headroom.**~~ **Done 13 September 2026** — see §4. Nothing clips;
   no master limiter; the sub gets its own bus.
0. **Measure headroom.** Offline render of a dense Song at full volume on the
   current build. Establish what we have before spending it. Decide whether a
   master limiter is needed, and if so treat it as its own comparison against
   the accepted sound.
1. **The palette.** ~~Fourteen to sixteen voices. Audition at species rank
   against Moth Orchestra, same night, same seed, gain-matched. Pass: the new
   family is at least as rich at species and clearly its own thing.~~
   **Attempted twice, 13 September 2026.** The first build followed this step
   literally — fifteen voices, rank-graded, measured richer at every rank — and
   Lily rejected it by ear as a child's xylophone. The design rule in §1 was
   read as "more instruments"; what it should have bought was depth *inside*
   each voice. The second build is seven bodies that deepen with rank, voiced
   an octave or two below the written score, sounding into a room of their own.
   See [SESSION-2026-09-13-GONDWANA.md](SESSION-2026-09-13-GONDWANA.md).
   **Still unheard. The pass condition is Lily's ear.**

   Correction to §1 worth carrying forward: palette *size* is the least audible
   axis available. Fifteen bodies sharing one envelope shape read as one body.
   Evolution in time — late entries, partials that outlive each other, beating —
   is what distinguishes bodies, and it is also what rank should buy.

   **Third pass, 14 September 2026.** Lily heard it: *"it all sounds like
   background."* Diagnosis and build in
   [SESSION-2026-09-14-GONDWANA-FIGURES.md](SESSION-2026-09-14-GONDWANA-FIGURES.md).

   Second correction, and the larger one: **this step was never only a palette
   step.** Every family in the instrument is a timbre substitution over a rhythm
   the data happened to produce — one record, one note, no phrase. No palette
   can escape that, however deep its bodies are, because background music is
   music without agency and the architecture could not produce agency. Eight of
   the eleven things in Lily's brief for this family are score, not synthesis.

   Gondwana is now the first family that also decides *how much a record says*.
   A voice's phrase length is the number of times it has arrived so far that
   night, capped by rank; the pitches are transpositions of the record's own
   pitch; the two observers subdivide the pulse differently and drift against
   each other. Plus a felted piano that leads at about two arrivals in five, an
   electronic pulse voice, per-voice distance in the room, and an authored
   pedal. **Still unheard. The pass condition is still Lily's ear.**
2. **The ground.** Two sub candidates for shared minutes, gain-matched, judged
   on headphones and on speakers. Pass: felt, not heard as a thud; audible as
   *something* on a laptop.
3. **The floor.** Generated from the night's shape. Compare 17 February 2026
   (one shared minute, sparse) against 3 September 2026 (dense, 22 shared
   minutes). Pass: they do not sound alike, and neither sounds like a preset.
4. **Gallery versus personal.** A mix choice, or automatic. Verify both.
5. **Tests, renders, docs.** Behaviour tests written before implementation as
   usual, offline renders finite and below full scale, receipt written, release
   decision put to Lily.

## 7. Settled with Lily, 13 September 2026

- **Name:** Gondwana.
- **Vocabulary:** physical models, named for their physics. "Tribal" dropped.
- **Night:** 3 September 2026 — densest, 22 shared minutes.
- **The gallery system is months away.** Lily will get time on it, but not
  soon. This is the constraint that shapes everything below.

## 8. Building for a room we cannot hear yet

The large-speaker case has to be designed blind and verified later, so the work
must be arranged so that hearing the room *tunes* the family rather than
rebuilds it.

**Make every room-dependent quantity a named, adjustable parameter, not a baked
constant.** Sub centre frequency, sub level relative to the canopy, the swell's
attack and decay, the floor's level and its low-frequency corner, the crossover
between the sub and its audible mid-register companion. A day in the gallery
should be an afternoon of turning those numbers, saved as a preset, not a
session of re-synthesis.

**Ship two mixes from the start.** Personal (headphones and laptop: sub rolled
off, the shared-minute moment carried by its mid-register component) and
Gallery (the sub at full extension). Personal is the default and the one Lily
can actually judge now. Gallery is built, measured, and explicitly marked
unheard until the room happens.

**Verify by measurement in the meantime, and say what measurement cannot tell
us.** Add a render analysis that reports peak, RMS, and the share of energy
below 60 Hz, so we know what we are sending even when we cannot hear it. That
establishes the signal is finite, bounded and carrying the intended low
content. It cannot establish that the room feels like awe. Do not let the
numbers stand in for that judgement.

**Find the best speakers Lily can reach now** — anything with real low
extension beats guessing, even if it is not the gallery. Worth establishing
early what is available to her, because a monitor with a sub gets us most of
the way and a laptop gets us nowhere.
