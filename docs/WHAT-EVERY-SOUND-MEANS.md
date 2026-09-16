# What every sound means

Lily: *"Each sound should be a thing I can explain with logic and rules."*

The instrument makes a small, closed set of sounds. This is all of them, what
makes each one fire, what it claims about the data, and whether it is
**evidence** (something happened) or **authorship** (something was composed).

Written 16 September 2026, when the synchrony gestures were rebuilt. Keeping
this page current is cheap; not having it is what let a rule that fired on
100% of shared minutes go unnoticed while it was described as rare.

---

## The sounds

| Sound | Fires when | Claims | Evidence or authorship |
|---|---|---|---|
| `obs` | one per observation | this person recorded this taxon at this time | **evidence** |
| `duet_minute` | both observers recorded in the same UTC minute | they were both working in the same minute | **evidence** |
| `duet_cross` | two records **adjacent in time**, different observers, within 2 minutes | they were taking turns — both working the same stretch of the night | **evidence** |
| `duet_echo` | both recorded the **same taxon** within 30 minutes | both identified the same species that night, close in time | **evidence** |
| `accompaniment` | Song mode's composed rhythm, on non-matching slots | nothing — it is rhythm | **authorship**, and marked so |
| `gond_pedal` | Gondwana's authored harmony on a slow clock | nothing — it is harmony | **authorship**, and marked so |
| `duet_meeting` | the first shared minute of the night | **parked — does not sound** | authorship over evidence |

### `obs` — an arrival

Pitch comes from the taxon, instrument from the voice family and the selected
rank. One note per record, always. This is the instrument.

**In Moth Orchestra the note is built from the record's own lineage.** Eight
ranks each set one thing about the sound, so relatedness is audible: two
species of one genus differ in one thing, a moth and a beetle differ in
several, a bird and a moth differ in everything. See "The lineage is the
instrument" below. Every other family picks one of its authored bodies by hash.

**Which octave it sounds in is the voice's, not the taxon's.** The taxon
chooses a pitch between 147 Hz and 988 Hz, and every voice of a family is
handed the same range — so nothing but the octave can separate four voices into
a consort. `VOICE_REGISTERS` gives each voice a floor and a ceiling, and
`voicedFreq` folds the written pitch by **whole octaves** until it fits.

Whole octaves are the whole point: the pitch class is exact, `ev.midi` and
`ev.freq` still say what the taxon chose, and the circle still draws the
written score. A contrabass reading a treble line sounds it low; it does not
sound a different note.

| Family | Voices with a register | Added |
|---|---|---|
| Gondwana | all seven, via `gondwanaVoicing` | 13 September 2026 |
| Frog Yawn | bass_voice, tenor, alto — and **soprano** | soprano 17 September 2026 |
| Lantern Glass | all four | 17 September 2026 |
| Moth Orchestra, Boobook, Fireflies | none | — |

**Frog Yawn's soprano did not fold**, so it sat an octave above alto's ceiling
with a sounding median of 440 Hz and a maximum of 988 — one singer of four
unanchored, measured across 377 notes on 40 nights. It now sings C4–E5.

**Lantern Glass did not fold at all.** All four voices ran to 988 Hz, and
`lantern_glass` carries a partial at 4× the fundamental with a 1.1 s decay, so
a top note put 3,952 Hz over a shared-minute bell at 92 Hz with nothing in the
middle. The four now stack in thirds — C4, E4, G4, B4 ceilings, an octave each.

**What it costs, measured on a night rather than on the archive, because a
night is what anybody hears.** Folding narrows a voice, and pitch is how a
listener tells one taxon from another, so this is not free:

| | median distinct sounds per night | taxa sharing a sound | worst pile-up |
|---|---|---|---|
| Lantern Glass, before | 23 | 43% | 4 |
| Lantern Glass, after | 16 | 77% | 4 |
| Frog Yawn, before | 19 | 67% | 4 |
| Frog Yawn, after | 17 | 73% | 4 |

Lantern Glass lands where Frog Yawn's accepted voices already sit, and the
worst pile-up does not move. That is the argument for the cost being the right
one; it is not proof, and only Lily's ear settles it.

### `duet_minute` — a shared minute

A low bell, once per minute in which both selected observers recorded. It does
**not** claim simultaneity: iNaturalist stores minute precision, so "the same
minute" is the finest true statement available. 311 of them on the
two-backyards export.

### `duet_cross` — one of you, then the other

The deep pad and the wide tan ring. Two records **adjacent in time**, from
**different observers**, within `DUET_CROSS_WINDOW_MIN` (2) minutes. 790 of
them across 55 nights on the two-backyards export.

40% fall **inside** a shared minute, where the pad sounds with the bell — that
is the two-layer composite Lily accepted and asked to keep. The other 475 are
moments nothing marked before: they alternated across a clock-minute boundary,
so no shared minute ever existed.

Adjacent-in-time is what makes it symmetric — a pair has no direction — and
self-deduplicating, since each adjacent pair is considered exactly once.

**This is the restoration of a gesture that was lost twice**, and the way it
was lost is the most useful thing on this page. See the retired section below.

### `duet_echo` — both of them found the same creature

The rarest thing in the instrument. Both observers recorded the same taxon,
within `DUET_ECHO_WINDOW_MIN` (30) minutes, on the same night: 35 moments
across 21 of the 71 nights they both worked.

It **adds no note**. Two records of one taxon already sound at one pitch on one
instrument, because both are derived from the taxon — measured true of all 55
such pairs in the export. The call and its answer were always in the score;
this marks them so they can be heard, and rings the circle at both.

One per taxon per night — a moth both of them recorded five times is one
coincidence, not twenty-five. It is symmetric: swapping which observer is A
changes nothing.

**What it does not claim.** A shared taxon means both records were *identified
as* the same species. It is not proof that one animal visited both houses, and
two **unidentified** records are explicitly refused rather than matched on the
`"Unknown taxon"` placeholder.

### `accompaniment` — Song mode's rhythm

Song mode arranges genuine matches in musical time and fills the rest with
composed rhythm. That rhythm is a separate event kind with a neutral dot and is
never evidence of synchrony. Authorship, and it says so.

### `gond_pedal` — Gondwana's harmony

An authored pedal on a slow clock, so a fixed taxon pitch is a root in one
phrase and a ninth in the next. No glow, no thumbnail, no arrival. Gondwana
only. Authorship, and it says so.

### `duet_meeting` — parked

The first shared minute of each night, voiced by **the ground**: a long swell
in the register below the instrument. Built 16 September 2026 and parked the
same day by Lily, on first hearing: *"It's too strong, and an effect that only
happens a single time in a loop needs to certainly sound different than that."*

The rule, the evidence and the synthesis are all kept and tested;
`DUET_GESTURES.meeting` is the one flag that silences it. When it returns it
needs a different **kind** of sound, not a quieter version of this one — a
gesture heard once in a nineteen-second loop is heard against nothing.

---

## Retired

### `duet_sync` — the "five-second pulse" that was never about seconds

Removed 16 September 2026, and **restored in honest form as `duet_cross` on
17 September** after Lily noticed the sound and the wide tan rings were gone.

Its history is the clearest lesson in this repository about a rule that does
not say what it means.

**In V2 it compared positions in the loop, not in the night:**

```js
const d = Math.abs(b.atSec - a.atSec);   // loop seconds, not real seconds
if(d > win) break;                        // "within 5 seconds"
```

A twelve-hour night compressed into nineteen seconds makes five loop seconds
about **three hours** of real time. So the gesture never marked simultaneity,
and how often it fired **changed with the loop length**: 32 gestures on
2026-09-08 at nineteen seconds, a different number at any other setting. It was
beautiful, and it was describing something real — the two of them working the
same stretch of the night — but not the thing its name and its code claimed.

**The repair to real observation seconds was correct and killed it.** Because
iNaturalist stores minute precision and 97.7% of records carry `:00`, five real
seconds collapsed onto the shared-minute rule: 32 gestures became 6, and then
across the whole export it fired on 311 of 311 shared minutes at exactly the
bell's instant, with a maximum difference of 0.000 seconds.

**Then it was removed as redundant, and that went too far.** The plan for that
session said plainly that the bell-and-pad composite "is the sound Lily enjoys
… and it should be kept exactly as it is", and only the *doubling* was
inexplicable. Deleting the whole layer took the pad and the wide tan ring with
it. `duet_cross` restores both on a rule that is symmetric, loop-independent,
and true at the resolution the data actually has.

It was also never symmetric: it paired each A record to its nearest B record,
and A is simply whoever appears first in the file. With Chris as A a second pad
fired on 25 minutes; with Lily as A it would have fired on 103 different ones.

`state.duetSyncWindowSec` — a dial that had controlled nothing for some time —
went with it.

### The original entry, kept

The five-second pulse

Removed 16 September 2026. It fired when an A record and a B record fell within
five seconds, and it was meant to be the rare, exceptional moment.

It could not survive its data. iNaturalist stores minute precision and 97.7% of
records carry `:00` seconds, so the rule collapsed onto the shared-minute rule
entirely: it fired on **311 of 311** shared minutes, at exactly the bell's
instant — maximum difference 0.000 seconds across every one of them. It had not
become common; it had stopped being a separate event at all.

It was also not symmetric. It paired each A record to its nearest B record, and
A is simply whoever appears first in the file. With Chris as A a second pad
fired on 25 minutes; with Lily as A it would have fired on 103 different ones.

`duet_echo` replaces it, and `state.duetSyncWindowSec` — a dial that had
controlled nothing for some time — went with it.

---

---

## The lineage is the instrument — Moth Orchestra only

Built 17 September 2026, when Lily asked for the hero family to be *"the most
strict when it comes to taxa sounding differently"*.

### What it replaced, and why

The timbre used to be `hash(the value of whichever rank Tone by is set to)`.
Measured on the two-backyards export, that had two consequences:

1. **Relatedness was inaudible.** Five species of *Idaea*, one genus of
   geometer moths, were given bell, creek, creek, pad and ember. Five
   *Polyrhachis* ants were given pluck, creek, hat, creek, ember. Two of each
   pair collided outright, and nothing in either set said they were relatives.
2. **The timbre was not a property of the animal.** Changing Tone by from
   species to genus moved *Nyctemera amicus* from a bell to a pad. The moth had
   not changed; a dropdown had. That is this page's recurring defect in new
   clothes — a sound that claims to be about the night and is about something
   else.

The ceiling was 11 instruments × 15 pitches = **165 possible sounds for 2,338
distinct taxa**.

### How the axes were chosen — measured, not assumed

The obvious design is one rank per axis, coarse to fine. It is wrong here, and
measurably so. Across the 144 offered nights, the **effective** number of
values each rank shows on a median night — exp(Shannon entropy), so a rank that
is 99% one value scores about 1.0 — is:

| kingdom | phylum | class | order | superfamily | family | subfamily | tribe | genus | species |
|---|---|---|---|---|---|---|---|---|---|
| 1.0 | 1.0 | 1.1 | 3.1 | 9.2 | 14.4 | 18.6 | 14.0 | **25.0** | 21.0 |

A median night holds 30 distinct taxa. **Genus alone separates 25 of them.**
Kingdom separates none. Spending the largest axis on kingdom would waste it on
a constant — which is how the old model came to spend its only timbre axis on a
rank worth 3.1.

So each axis is sized by what its rank actually tells apart:

| rank | sets | why that rank |
|---|---|---|
| class | **material and register** — what the note is made of, and the octaves it speaks in | 1.1/night: rare, so it gets the largest contrast. A bird among moths must be unmistakable. |
| order | **stretch** — how far the partials run sharp of a pure series | 3.1/night |
| superfamily | **body** — how many partials | 9.2/night |
| family | **tilt** — brightness | 14.4/night |
| subfamily | **attack** | 18.6/night |
| tribe | **late bloom** — the upper partials arriving after the strike | 14.0/night, 59% filled |
| genus | **decay** — how long the note lasts | 25.0/night: the best rank gets the most audible axis |
| species | **shimmer** — a detuned twin, beating | 21.0/night |

### What it achieves, measured

| | before | after |
|---|---|---|
| nights where **every** taxon is distinguishable | 17 of 144 | **142 of 144** |
| distinct sounds across the archive | 165 | 1,977 |
| sounding pitch, min / median / max | 147 / 370 / 988 Hz | 123 / 294 / 880 Hz |
| note length | 0.25–0.9 s, fixed per instrument | 0.4–4.3 s, median 1.35 s |

Two things measurement threw out along the way, both worth keeping written
down because both looked right on paper:

- **Order held a register shift first.** Folding moves by whole octaves, so a
  shift smaller than an octave changes the note only when the written pitch
  happens to straddle the moved edge. The axis was silent for most notes.
  Stretch replaced it and is audible on every one.
- **Each class had a one-octave band first.** The written score spans
  147–988 Hz, so a one-octave band left nine records in ten sharing five
  pitches. The instrument told taxa apart beautifully and had stopped having a
  melody. The bands are about two octaves.

### What it claims

| Sound | Claims | Evidence or authorship |
|---|---|---|
| the material and register | this record is in this class | **evidence** — which class it is |
| which material a class gets | nothing about the animal | **authorship**, and it says so |
| stretch, body, tilt, attack, late, decay, shimmer | this record carries these ranks, and these values | **evidence** |
| how much of the note is elaborated | **how well this specimen is identified** | **evidence** |

That last row is a real claim and it is deliberate. A rank the record does not
carry stays dark and nothing is invented to fill it, so an undetermined moth
sounds like a plain member of whatever it *is* known to be, and a specimen
identified to species sounds fully elaborated. **You can hear how well a
specimen is determined.** The Now playing card says the same thing in words:
*"Stretched, mid · lineage 8 of 8"*.

Which material and octave a class receives is **authored** — it is not a claim
that a bird sounds breathy or a spider sounds damped, the same rule every
family in this file follows. The seven named classes cover 99.1% of the export
and Insecta alone is 90.6%, so the dominant sound of the hero family is written
down rather than left to whatever a hash returned.

**Tone by sets how much of the lineage is heard, never what it says.** At class
rank only the material sounds, so every insect is one voice — which is what
"Class voices: 1" has always meant. At species rank the whole lineage sounds.
An axis that is lit says the same thing at every depth, which is exactly the
defect above, fixed.

**Song mode's composed rhythm keeps its own neutral voice.** The lineage voice
is for evidence; accompaniment is authorship and must never be given a
creature's voice. A test holds this.

---

## Known, measured, and deliberately not changed

### `chime` clamps instead of folding — the written score is altered

`chime` is in **Moth Orchestra**, the default family, and it is the one place
in the instrument where a note is moved to a pitch the taxon was never given:

```js
const cappedFreq = Math.min(freq, midiToFreq(12*(4+1) + 11)); // cap at B4
```

`Math.min` is a clamp, not a fold. It does not preserve the pitch class — it
collapses everything above B4 onto B4 itself. Measured across the 144 offered
nights of the two-backyards export: **526 chime notes, of which 166 (32%) are
clamped**, flattening five distinct written pitches into one and giving **56
taxa a pitch that belongs to a different taxon**.

| written | clamp gives | folding would give |
|---|---|---|
| 587 Hz | 494 | 293 |
| 659 Hz | 494 | 329 |
| 740 Hz | 494 | 370 |
| 880 Hz | 494 | 440 |
| 988 Hz | 494 | 494 |

This is the recurring defect of this repository in a new place: a rule whose
comment says "capped at octave 4" and whose effect is that two different moths
sound like the same moth. The fix is one entry in `VOICE_REGISTERS` and one
call to `voicedFreq`, exactly as Lantern Glass now does.

**Overtaken on 17 September 2026.** Moth Orchestra no longer picks `chime` for
an arrival — the lineage builds the voice instead — so the clamp no longer
reaches any evidence in the hero family. It survives in Song mode's pooled
`lead` role, which is **authorship** and adds no taxon claim, and in the
selection fallback. The defect is therefore no longer misdescribing a creature,
and removing the last of it is tidying rather than a repair. Kept here because
the measurement is the clearest example on this page of a rule whose comment
and whose effect disagree.

## The rule this page exists to enforce

> Every sound must be explicable by a rule about the night, not by an accident
> of how the data was stored or ordered.

Two tests that hold this, and should not be deleted:

- `both gestures are identical when the observers swap labels`
- `it is identical when the observers swap labels` (the crossing)
- `IT DOES NOT CHANGE WITH LOOP LENGTH — the defect V2 shipped`
- `the five-second pulse and its dead dial are gone`
- `bass_voice, tenor and alto sound exactly where their own code put them` —
  the registers refactor compared against the three inline folds it replaced,
  note for note, because a sound Lily has accepted must not move
- `folding moves by whole octaves only, so the pitch class is never altered`
- `relatedness is audible: the closer the lineage, the fewer the differences`
- `the sound is a property of the animal, not of the Tone by dropdown`
- `a rank the record does not carry stays dark; nothing is invented to fill it`
- `the only thing Moth Orchestra changed is which voice speaks` — the baseline
  reference score, held field by field, so the written score is provably intact
