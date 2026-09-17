# Session — Emergence becomes the gallery floor

18 September 2026. Branch `floor`, off `main` at `11265d1`. **Nothing merged,
nothing pushed. Three spines are waiting for Lily's ear.**

---

## What she asked for

Emergence shipped on 17 September as a seventh family, deliberately unsettled.
She heard it live: *"a lesser Gondwana"*. Measurably true — 100% of its notes
land inside Gondwana's central register, and all six structural ideas in its
sound were Gondwana's first.

Asked to reshape it, she redirected instead:

> *"Let's make emergence the gallery floor. Forget everything we've ever made.
> What I want you to consider is sounds of life, insect-sounds, wing-beats,
> influences of East Forest and Thievery Corporation. Olafur. A woman who made
> this believes in 'reverence for life'. She reads Mary Oliver. Precious life.
> Rich life. Gallery floor. Opening, opening. And yet deep time and forest and
> canopy."*

**Why this resolves the problem rather than patching it.** Gondwana is *figure*
— it decides how much a record says. A floor is *ground* — it says nothing
about any record and everything about the night entire. They cannot compete, so
"a lesser Gondwana" becomes impossible by construction rather than by effort.

It also fills the oldest unstarted gap in the project: **step 3 of
PLAN-NEXT-FAMILY.md**, waiting since 13 September.

Her words landed on this project's own vocabulary — floor, canopy, deep time
are already the three strata in that document.

### Decided by her this session

1. The floor goes **under everything**, not just Gondwana. Emergence stops
   being a selectable family.
2. She **chooses the spine by ear**, from auditions, not from a description.
3. The felt piano stays — *"it's the reverence"*.
4. The five ambience presets are **retired**.

---

## Two corrections made before any code

### The 142-of-144 figure cannot check this work

`PLAN-EMERGENCE.md` named it as the honest check to re-run after any reshape.
It is not one. `mothCode` is a pure concatenation of the eight axis indices and
`mothVoicing` reads only ranks, depth and seed. Neither touches a sonic table,
so the figure — and "1,977 distinct sounds" — is a property of **the mapping
alone** and reports identically however the instrument sounds.

This is the fifth instance of the lesson `NEXT-SESSION.md` keeps recording: a
number that fires on something real and describes itself as something else.

### The offline renderer does not include ambience

`PLAN-NEXT-FAMILY.md` §4 left this as an open measurement gap. It is now
closed by reading: `renderOfflineBuffer` builds its own master chain and never
creates an ambience bus or calls any ambience builder in the offline context.

**That is the safety argument for a floor under every family.** Moth Orchestra
and Gondwana render byte-for-byte what they rendered before, and
`musical-reference.test.cjs` still holds against a fixture that has never been
regenerated.

---

## What was built

`FLOOR`, `FLOOR_STRATA` and five functions in `index.html`, plus
`tests/floor.test.cjs`. Four gestures, each driven by a different measured
property of the night:

| gesture | what it is | driven by | influence |
|---|---|---|---|
| **breath** | the room swells and opens | median gap between arrivals | East Forest |
| **memory** | long filtered feedback delay, each pass darker | elapsed time, free of the loop | Thievery |
| **height** | one band of the room, or up to four | how many classes the night holds | forest, canopy |
| **flutter** | amplitude modulation, 8–60 Hz | arrival density | insect-sound |
| **felt piano** | one note every 15–25 s, all the room in the world | the night's own pitch classes | Ólafur |

### The three spines

| | gestures | |
|---|---|---|
| **A** | breath + memory + height + flutter | the full proposal |
| **B** | breath + memory, one stratum, no flutter | the lean one |
| **C** | flutter-led, dry, no memory | the insect one |

The felt piano is **constant across all three**, deliberately: she has settled
it, so it is not the variable.

---

## Measured, not guessed

### The archive, 144 offered nights

| | p10 | median | p90 | range |
|---|---|---|---|---|
| median gap between arrivals | 0.026 s | 0.260 s | 0.713 s | 0.017–1.118 |
| arrival density | 1.00 /s | 1.63 /s | 3.26 /s | 1.00–7.16 |

Class count: **64 nights hold one class, 33 hold two, 23 three, 15 four, 2
five, 4 six, 3 seven.** So 80 of 144 nights open a taller room and 24 open a
tall one. That rarity is the point — class is worth 1.1 effective values on a
median night, so when it differs it must be unmistakable.

These numbers set every constant. The breath clamp is a **safety net that never
fires on real data**: the whole archive lands at 5.4–29.6 s inside a 5–30 s
range, and a test holds it to that across all 144 nights.

### Levelling, against the presets it replaces

Demo night, 10 s offline renders, through the real chain:

| preset | peak | rms | | floor, raw | peak | rms |
|---|---|---|---|---|---|---|
| spore_cloud | 0.038 | 0.0065 | | spine A | 0.070 | 0.0195 |
| quiet_beat | 0.011 | 0.0045 | | spine B | 0.060 | 0.0192 |
| silk_thread | 0.046 | 0.0128 | | spine C | 0.073 | 0.0180 |
| firefly_field | 0.044 | 0.0168 | | | | |
| pollen_drift | 0.067 | 0.0135 | | | | |

At the 0.22 every preset shares, the floor would have sat at rms 0.004 —
quieter than four of the five things it replaces, and too quiet to judge.
`FLOOR.busGain = 0.70` lands it at peak 0.040–0.051, rms ~0.0128, among them
rather than above them.

### The pass condition, on rendered audio

`PLAN-NEXT-FAMILY.md` §6 step 3: *17 February and 3 September must not sound
alike, and neither may sound like a preset.* Measured on 12 s renders in a real
browser, app defaults:

| | 17 Feb (sparse) | 3 Sept (dense) |
|---|---|---|
| arrivals | 12 | 118 |
| classes | Insecta | Arachnida, Insecta |
| breath period | **24.4 s** | **9.2 s** |
| flutter | **8 Hz** | **55.4 Hz** |
| strata | trunk | trunk, canopy |

Spectral distance between the two nights, on the audio rather than on the
parameters that made it:

| spine | distance |
|---|---|
| A | **0.384** |
| C | **0.344** |
| B | **0.106** |

**Spine B separates the two nights about 3.5× less than A or C.** With no
flutter and a single stratum, the breath is the only thing that differs — and
a 12 s render captures barely half a cycle of a 24 s breath, so the figure
understates B somewhat. It remains the spine most at risk of the exact failure
the presets were rejected for. Worth saying plainly rather than letting her
discover it after choosing.

No non-finite samples in any render. Everything sits 25 dB below full scale.

---

## What has NOT been verified

- **Nothing has been heard by Lily.** Every number above is measurement, and
  this project's record is that measurement repeatedly said a gesture was fine
  when her ear said it was not.
- **No gallery system, ever.** Every judgement in this project is headphones
  and a laptop. The floor is the component most damaged by that gap, because
  it is the one designed for a large room.
- **No real-device test of anything.**
- Whether a floor survives an hour in a gallery. These renders are seconds.
- The flutter modulates the whole bus, so the piano flutters too. That is a
  design choice, not an accident, and it is a question for her ear.

## Deferred until she has chosen

Retiring the five presets, removing Emergence from `VOICE_MODES`, and the
release decision. **Emergence stays selectable and unchanged until the floor
is accepted**, so nothing is lost in between.

**Keep the eight-axis mapping when Emergence stops being a family.**
`MOTH_AXES`, `mothVoicing`, `mothCode` and `tests/moth-voicing.test.cjs` — the
entropy reasoning, 142 of 144 nights — will have nothing to play. It is the
best design work in this project and it is what a future **canopy** family
should be built on. Park it with its tests intact; do not delete it.

## How to hear it

Serve `repository/` and open one spine at a time. The floor does not exist
without the parameter.

```
python3 -m http.server 8000 --bind 127.0.0.1
```

- <http://127.0.0.1:8000/index.html?floor=A> — breath, memory, height, flutter
- <http://127.0.0.1:8000/index.html?floor=B> — breath and memory only
- <http://127.0.0.1:8000/index.html?floor=C> — flutter-led, dry

It selects itself in the Ambience control. Switch nights with the date list —
the room rebuilds from whichever night is loaded, which is the whole claim.
Try both 17 February 2026 and 3 September 2026, and try it under Gondwana as
well as alone.

## Tests

**462 tests, 453 pass, 0 fail**, 1 documented skip, 8 gap-remapping TODOs — up
from 443/434 with 19 new, and nothing broken. `musical-reference.test.cjs`
holds Moth Orchestra to the original fixture, unregenerated.
