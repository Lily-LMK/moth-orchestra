# Session — Moth Orchestra, the hero family

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
