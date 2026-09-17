# Session — Emergence, the hero family

> **Read this first.** The work below was built inside Moth Orchestra and then
> split out. Lily, 17 September 2026: *"I want to push it live as 'Emergence'
> and leave the original moth orchestra family intact for a while."* So
> everything described here is **Emergence**, a seventh published family.
> **Moth Orchestra is unchanged** and is held to the original reference score
> note for note. Gondwana leads the list and opens the instrument.
>
> Emergence went live **before Lily was settled on it** — her words: "I'm not
> entirely set just yet." That is the reason the original family stays.

## The original brief

17 September 2026, after the registers work was accepted by ear. Lily: *"It
needs to be our hero model. I truly want it to be the most strict when it comes
to taxa sounding differently … It can also be a little high and all notes seem
to be short. A touch of Gondwana, but different."*

**Nothing has been heard.** 423 tests, 414 passing, 0 failing. Audition at
`sessions/2026-09-17/hero/listen.html`.

---

## A correction, first

Early in the session I told Lily that all 954 Lepidoptera taxa played `chime`.
**That was wrong.** It was my measuring script keeping only the last instrument
seen per order, not the instrument's behaviour. Lepidoptera used all eleven.

The correct diagnosis, measured properly, is better than the wrong one:

1. **Relatedness was inaudible.** Five species of *Idaea* — one genus of
   geometer moths — were given bell, creek, creek, pad and ember. Five
   *Polyrhachis* ants got pluck, creek, hat, creek, ember. Two of each pair
   collided outright, and nothing said they were relatives.
2. **The timbre was not a property of the animal.** It was
   `hash(the value of whichever rank Tone by is set to)`. Moving Tone by from
   species to genus moved *Nyctemera amicus* from a bell to a pad. The moth had
   not changed; a dropdown had. This repository's recurring defect, in new
   clothes.
3. The ceiling was **165 sounds** — 11 instruments × 15 pitches — for 2,338
   distinct taxa.

## The measurement that decided the design

The obvious design is one rank per axis, coarse to fine. It is wrong here.
Across the 144 offered nights, the **effective** number of values each rank
shows on a median night — exp(Shannon entropy), so a rank that is 99% one value
scores about 1.0 — is:

| kingdom | phylum | class | order | superfamily | family | subfamily | tribe | genus | species |
|---|---|---|---|---|---|---|---|---|---|
| 1.0 | 1.0 | 1.1 | 3.1 | 9.2 | 14.4 | 18.6 | 14.0 | **25.0** | 21.0 |

A median night holds 30 distinct taxa; **genus alone separates 25 of them**.
Kingdom separates none. The export is 90.6% Insecta and 57.8% Lepidoptera, so
the shallow ranks are nearly constant where it matters.

So every axis is sized by what its rank actually tells apart, and the most
audible axis — how long a note lasts — goes to genus. Class, worth 1.1, gets
the rarest and largest contrast: what the note is made of. Full table in
[WHAT-EVERY-SOUND-MEANS.md](WHAT-EVERY-SOUND-MEANS.md).

## What it achieves

| | before | after |
|---|---|---|
| nights where **every** taxon is distinguishable | 17 of 144 | **142 of 144** |
| distinct sounds across the archive | 165 | 1,977 |
| sounding pitch, min / median / max | 147 / 370 / 988 Hz | 123 / 294 / 880 Hz |
| note length | 0.25–0.9 s, fixed per instrument | 0.4–4.3 s, median 1.35 s |

All three of Lily's asks are addressed by one mechanism rather than three
patches: strictness by eight axes instead of two; "a little high" by class
bands that stop at 440 Hz for insects; "notes seem short" by giving length to
the rank that carries the most information.

## Two designs measurement threw out

Both looked right on paper. Written down so they are not tried again.

- **Order held a register shift first.** Folding moves by whole octaves, so a
  shift smaller than an octave changes a note only when its written pitch
  straddles the moved edge — silent for most notes. A test caught it
  (`axis 1 (register) is audible` failed). **Stretch** replaced it: how far the
  partials run sharp of a pure series, audible on every note.
- **Each class had a one-octave band first.** The score spans 147–988 Hz, so a
  one-octave band left nine records in ten sharing five pitches. It told taxa
  apart beautifully and had stopped having a melody. Bands are ~two octaves.

## A touch of Gondwana, and deliberately not Gondwana

Borrowed: a room, and long layered decays with late-arriving partials.
Gondwana's room is 3.9 s, dark and vast. This one is **1.6 s, brighter, 14 ms
pre-delay** — a room with walls rather than a cathedral — on its own bus with
its own limiter.

Not borrowed: Gondwana's nine authored bodies, and its figures. Gondwana
decides *how much a record says*. This family decides *what a record is*.

## How the written score is protected

The baseline reference fixture was **not regenerated**. `musical-reference`
now holds it field by field and asserts that every time, pitch, density,
velocity and source identity is byte-identical to the original — the only field
that changed is `instrument`. A second test asserts what it changed to, and
that Song's composed accompaniment keeps its own neutral voice, because the
lineage voice is for evidence only.

## Not done

- **Nothing has been heard.** Not one note.
- **No real-device test.**
- **Nothing is pushed.** Branch `moth-orchestra-hero`; `main` holds the
  accepted registers work, also unpushed.
- **Levels are matched by peak, not loudness.** Sparse night 0.233 → 0.162.
  Long tails overlap differently from short ones; worth Lily's ear.
- **`chime`'s clamp is overtaken, not removed.** It no longer reaches any
  arrival in Moth Orchestra, but survives in Song's pooled `lead` role, which
  is authorship. Tidying, not a repair.
- **"Distinct" is a count of parameter sets**, not a claim that 1,977 sounds
  are tellable apart by ear. The per-night numbers are the honest ones.

## The question for Lily's ear

Whether 118 genuinely different sounds in one loop reads as **an orchestra** or
as **a heap**. Measurement cannot answer that.


---

# Second pass — the nasality, the sweetness, and the ground

Lily heard the first draft: *"The new set sounds nasal. Perhaps too different —
although the rules and differentiations are certainly improved. There was a
sweet voice introduced at the genus or perhaps species level that gave
tenderness to Moth Orchestra and that is now lost."*

**The rules are unchanged.** Everything above about the eight axes and the
entropy measurement stands. This pass is entirely about the sound they make.

## The nasality had an exact cause

The sweet voice Lily remembered is real and I can name it: **`harp`**, which
the old family unlocked at genus rank, and **`bowl`**, at species rank. Both
carry two or three partials behind a **closing lowpass** — `harp` sweeps
3,000 Hz down to 1,200 Hz over 0.35 s, which is the entire reason it sounds
tender.

The first draft carried **up to eight bare sine partials, no filter at all**,
and a stretch that ran them sharp. At the brightest tilt, partial eight was
still at a third of full weight on every note. That is a reed.

| | draft | now |
|---|---|---|
| partials | 3–8 | 2–6 |
| roll-off exponent | 0.55–2.35 | 1.00–2.62 |
| weight in the top half of the spectrum, worst case | 35% | 25% |
| filter | none | opens 1,250–3,200 Hz, closes to 450–1,050 |
| sharpest attack | 2 ms | 5 ms |
| stretch, worst case | 0.0030 | 0.0014 |

The axes still tell taxa apart — the 142-of-144 figure is unchanged, because
none of the rules moved. They now tell them apart between shades of a tender
voice rather than between sweet and nasal.

## Touch and timing

*"Soft piano phrases with natural variations in timing and touch."* Each
arrival carries a `lag` and a `touch` derived from **the record's own id**, so
the same record is always played the same way.

`lag` is bounded by the data's own precision: iNaturalist stores minutes, so a
nudge under half a minute of real time cannot move a note off anything the
record claims. On a twelve-hour night at a nineteen-second loop that is
**±13 ms**, capped at 30 ms absolutely so a narrow Riff window cannot magnify
it. `touch` only ever takes weight away.

**Moth Orchestra only.** Lantern Glass and Frog Yawn were accepted by ear as
they are, and an accepted family is not quietly rephrased because a different
one wanted it. A test holds that.

## The ground — `MOTH_GROUND`

*"A warm sustained organ-like background, and barely audible wordless vocal
textures. Maybe slow harmonic movement, open chord voicings, lingering
notes."*

An organ registration with a quiet wordless texture an octave above it, holding
a chord that changes about every five seconds. It is **authorship** — no glow,
no thumbnail, no arrival, exactly as `gond_pedal` is.

**But it is not a preset, and that is the whole point.** The harmony is the
night's own pitches: the loop is cut into four sections and each is voiced from
the pitch classes the taxa sounding in it actually carry, in open voicing (a
fifth minimum between neighbours), in the register below the arrivals. A chord
identical to the one before it is **held**, not restruck — a swell where the
night has no change is a swell about nothing.

Two nights cannot sound alike unless they hold the same creatures. That is the
condition `PLAN-NEXT-FAMILY.md` set for the gallery floor, and the one the five
ambience presets could not meet; a test holds 17 February against 3 September.

Parked in one place if it is not wanted: `MOTH_GROUND.on = false`.

## What I did not build, and why

**The short melodic motif with subtle variations.** Lily listed it last and
said "might". It is the largest authorship claim of everything asked for — a
composed melody in an instrument whose rule is that every sound is explicable
by the night — and Gondwana's figures already occupy that ground. It is also
the item most likely to be wrong in the way the parked `duet_meeting` was
wrong: an authored gesture that overwhelms what it sits on.

With "perhaps too different" live feedback on the table, adding one more new
voice before she has heard the ground seemed like the wrong order. **It is the
natural next step and nothing blocks it** — the ground's section clock is
exactly the slow harmonic frame a motif would vary against.

## Not done

- **Nothing has been heard.** 431 tests, 422 passing, 0 failing.
- **No real-device test.**
- **Nothing is pushed.**
- **The ground's level is a guess.** 0.115 against arrivals at 0.12–0.65,
  before the volume control. It is one number.


---

# Third pass — the split, and going live

Lily: *"I'm not entirely set just yet but I want to push it live as 'Emergence'
and leave the original moth orchestra family intact for a while. Let's make
Gondwana the default family at the top."*

## The split

Everything the two passes above built moved out of `mixed` and into a new
family, `emergence`. One predicate, `isEmergence()`, gates all eight places it
applies — the two instrument pickers, Song's `emit`, the touch and lag fields,
the ground's events, and the ground's two scheduling branches — so the family
cannot half-apply.

**The proof that Moth Orchestra is intact is the test that was failing before
the split.** `tests/musical-reference.test.cjs` compares the score against a
fixture that has never been regenerated, `instrument` names included. During
the first two passes it had to be relaxed to exclude that field. It is now back
to its original form and passes: every time, pitch, density, velocity, source
identity **and instrument** is byte-identical to the original.

Measured in a browser on 3 September, 136 arrivals:

| family | distinct sounds | ground | pedal | touched | example voices |
|---|---|---|---|---|---|
| Gondwana | 77 | 0 | 6 | 0 | gond_rim, gond_column, gond_bronze |
| Emergence | 118 | 4 | 0 | 136 | moth:2310121-, moth:23153000 |
| **Moth Orchestra** | **88** | **0** | **0** | **0** | **ember, harp, chime, pad** |

## Gondwana at the top

`VOICE_MODES` is reordered — its order is the dropdown, the keyboard cycle and
the swipe, and its first entry is what the instrument opens on. The default
`state.voiceMode` is `"gondwana"`.

Three test files asserted `mixed` as the default while really testing something
else, and `tests/playback.test.cjs` was counting notes through a stub that
Gondwana's own scheduling branch bypasses. Those now pin the family they mean
rather than relying on the default, which they should have done anyway.

## `chime` is live again, and still wrong

The second pass recorded the clamp as "overtaken" because the lineage had
retired `chime` as an arrival voice. The split puts Moth Orchestra back exactly
as it was, so **the clamp is live**: 166 of 526 chime notes, 56 taxa given a
pitch belonging to a different moth. `WHAT-EVERY-SOUND-MEANS.md` is corrected.
Still one entry in `VOICE_REGISTERS`, still Lily's call.

## What went live

The first push of this session, carrying three separate pieces of work:

1. **The registers** — Frog Yawn's soprano and Lantern Glass's consort. Built
   and **accepted by ear** earlier the same day.
2. **Emergence** — published deliberately unsettled.
3. **Gondwana as the default.**
