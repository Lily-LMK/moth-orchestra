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

**Proposal:** build from physical models, name the voices for what they
physically are, and drop "tribal" as the internal vocabulary. Lily to confirm
or push back — this is her call and there may be a relationship or permission
context I do not know about.

## 3. The proposal — three strata

A name for the family, to choose from: **Gondwana**, **Old Growth**, or
**Stone Chorus**. Gondwana is the recommendation: it carries deep time, forest
and Australian specificity honestly, it is a term Lily uses professionally, and
the remnant Gondwanan rainforest is literally in the D'Aguilar Range where the
moth sheet is.

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

**There is no limiter on the note path.** `masterGain` connects straight to
`destination` plus a delay send. Only the ambience bus has a
`DynamicsCompressor`. Adding sub-bass to an unlimited path will eat headroom
and can clip on dense passages. Fixing this means touching the master chain,
which changes the accepted sound of every existing family — so it must be
measured, compared and decided, not slipped in. **Step 0 of the session is to
measure current headroom before adding anything.**

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

0. **Measure headroom.** Offline render of a dense Song at full volume on the
   current build. Establish what we have before spending it. Decide whether a
   master limiter is needed, and if so treat it as its own comparison against
   the accepted sound.
1. **The palette.** Fourteen to sixteen voices. Audition at species rank
   against Moth Orchestra, same night, same seed, gain-matched. Pass: the new
   family is at least as rich at species and clearly its own thing.
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

## 7. What I need from Lily before starting

- The name: Gondwana, Old Growth, Stone Chorus, or hers.
- Whether "tribal" as a design vocabulary should stand, be replaced with the
  physical-models framing, or something else she has in mind.
- Which night to build against — 3 September 2026 is the densest and shows the
  shared-minute sub best.
- Whether she can get time on the actual gallery system, or whether the
  large-speaker case has to be designed blind and verified later. This changes
  how much we commit to before hearing it in the room.
