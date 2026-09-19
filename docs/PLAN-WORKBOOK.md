# Plan — the explainer workbook

Set by Lily, 18 September 2026:

> *"I think we need a total explainer workbook, not just for emergence but for
> at least two sample music families. [...] I'll be demonstrating this soon and
> I think this workbook will be an important part of introducing Moth
> Orchestra."*

**This is for an audience, not for us.** It is the thing that introduces Moth
Orchestra to people who have never heard it. That changes what "good" means:
every claim must be hearable, not merely written down.

---

## The finding that should shape the whole design

Lily, on hearing Emergence in the instrument:

> *"I'm not convinced Emergence shows all of those things (grain, memory, band,
> tones). Maybe the arrivals sounding over the top made it difficult to pick up
> in a few sample nights."*

**She is right, and it is a large margin.** Measured on 3 September 2026,
Gondwana, 20 s offline renders at the levels the app actually plays:

| | rms | relative to the arrivals |
|---|---|---|
| the arrivals | 0.133 | — |
| **Emergence, whole** | **0.0062** | **−26.6 dB** |

And within the room, measured at peak gain — which flatters them, since grains
are short bursts occupying a sliver of the time:

| part | level | vs arrivals |
|---|---|---|
| bed | 0.095 | −2.9 dB |
| felt piano | 0.063 | −6.5 dB |
| tones | 0.021 | −16.1 dB |
| grain | 0.017 | −17.7 dB |

So on a dense night she was listening for things buried roughly 17–27 dB under
the music. Her ear found a real defect in the demonstration, not in her
attention.

**Two consequences.**

1. **The workbook must let every sound be heard alone.** Solo each gesture,
   mute the arrivals, A/B a sparse night against a dense one. A workbook that
   only describes these gestures would reproduce exactly the problem she hit.
2. **A real question for her ear, which measurement cannot settle:** is
   Emergence simply too quiet by default? The level sits at 45%; even at 100%
   the room stays about 20 dB under the arrivals. That may be correct for a
   floor, or it may be why four of its six gestures are inaudible. **Do not
   change the level on my judgement** — put it to her with the isolated
   examples in hand.

---

## What the workbook must cover

Her three asks, verbatim where she gave words.

### 1. Every note is one observation

> *"Every note is one observation: its pitch comes from the taxon, its
> instrument from the voice family."*

The single most important idea in the instrument, and the easiest to
demonstrate: **play the same record in two families.** Same pitch, different
instrument. Then play two different taxa in one family: different pitch, same
instrument. Two examples and the rule is obvious without a paragraph.

### 2. The three gestures that mark the two of you together

> *"A shared minute is a minute in which you both recorded, and rings a low
> bell. A crossing is one of you recording and then the other within 2 minutes,
> and sounds a deep pad inside a wide ring. An echo is the same species found by
> both of you within 30 minutes, and marks the two notes, which already share a
> pitch because pitch comes from the taxon."*

Her wording is better than the repository's and should be kept close to
verbatim. Real figures from `WHAT-EVERY-SOUND-MEANS.md`, already verified
against the export:

| gesture | what it is | how often |
|---|---|---|
| shared minute | both recorded in the same UTC minute | 311 across the export |
| crossing | adjacent records, different observers, within 2 min | 790 across 55 nights |
| echo | same taxon, both observers, within 30 min | 35 across 21 of 71 nights |

The echo is the one worth dwelling on, because it **adds no note** — it marks
two notes that already share a pitch, since pitch comes from the taxon. That is
the whole design in one gesture.

**Say what they do not claim.** A shared minute is not simultaneity;
iNaturalist stores minute precision. An echo is not one animal visiting both
houses; it is two records identified as the same species.

### 3. Emergence, and what makes it behave one way versus another

Two properties of the night drive all six gestures. Ranges measured across the
144 offered nights; 140 of them produce a distinct room.

| what you hear | driven by | range |
|---|---|---|
| **breath** — how often the room swells | typical gap between arrivals | 5.4 s → 29.6 s |
| **piano** — how often one note falls | how busy the night was | 22 → 60 per 10 min |
| **grain** — small sounds of life | how busy the night was | 11 → 48 per 2 min |
| **memory** — how long an echo is held | how busy the night was | 50% → 71% fed back |
| **band** — how wide the room opens | how many classes of creature | 110–300 Hz → 83–1737 Hz |
| **tones** — how many notes it holds | how many classes of creature | 1 → 3 |

The palette does not change. It is one room answering different nights, not a
different room each time.

### Which two families

**Gondwana** and **Moth Orchestra** — the default and the original, both
published and both accepted by ear. They also make the cleanest contrast:
Moth Orchestra picks an authored body by hash; **Gondwana is the only family
that decides how much a record says**, through phrase length keyed to how
completely the record was identified. That contrast is worth hearing.

Lantern Glass, Frog Yawn, Boobook and Fireflies are also published if more are
wanted. **Emergence-the-family and Noctilucent are withheld** and must not
appear in something built to introduce the instrument.

---

## How to build it

**Recommendation: pre-render the audio from the real code, and build a static
page around it.**

- It cannot fail live in front of an audience — no audio context to resume, no
  browser autoplay policy, no dependency on the app booting.
- It is the established pattern here (`sessions/2026-09-13/*/listen.html` with
  `.wav` beside them).
- **Drift is the danger**, and it is answerable: generate every clip with a
  committed script that drives `index.html`'s own synthesis, so regenerating is
  one command and a test can assert the clips match the code that made them.

Rejected: building the workbook to run the live app. Truer to the code, and one
autoplay policy away from silence during a demonstration.

**Each claim gets a clip.** Roughly: one record in two families; two taxa in one
family; each of the three duet gestures alone, then in context; Emergence solo
with each gesture isolated; Emergence on a sparse night against a dense one;
Emergence under Gondwana at the level the app actually uses.

**Accessibility is part of this, not decoration.** It will be shown publicly.
Keyboard-operable players, visible focus, real labels, captions carrying the
same information as the audio, and it must read on a laptop and a phone.

---

## What must be true

- **Nothing invented.** Every figure comes from the export or a render, and the
  page says which night and which settings produced each clip.
- **Say what each sound does not claim**, as `WHAT-EVERY-SOUND-MEANS.md` does.
  This is the document most likely to be believed, so it carries the most
  responsibility.
- **Withheld families stay withheld.**
- **Lily writes the prose, or approves it.** She has already corrected one
  interface sentence for sounding like a machine wrote it — *"It is authorship,
  not evidence: grown from how the night arrived, a claim about nothing"* — and
  she was right. Draft plainly, hand it to her, expect it to change.

## Open questions for her

1. **Who is the audience** — a gallery visitor, a naturalist, a museum
   colleague, a conference room? It decides the vocabulary.
2. **Where does it live** — a page in the repository, published beside the
   instrument, or a local file she carries to the demonstration?
3. **Is Emergence too quiet?** See the finding above. Needs her ear, with the
   isolated clips in hand.
4. **Two families, or more?**
5. **Does the workbook need a visual** — the circle, a waveform, a ring diagram
   — or is text plus audio enough?
