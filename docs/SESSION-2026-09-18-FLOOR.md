# Session — Emergence becomes the gallery floor

18 September 2026. Branch `floor`, off `main` at `11265d1`. **Nothing merged,
nothing pushed.** One room, withheld, waiting for Lily's ear.

---

## How the day went

Emergence shipped on 17 September as a seventh family, deliberately unsettled.
She heard it live: *"a lesser Gondwana"* — measurably true, since 100% of its
notes landed inside Gondwana's central register and all six structural ideas in
its sound were Gondwana's first.

Asked to reshape it, she redirected: make it the **gallery floor**. Three
candidate rooms were built and auditioned. Then:

> *"spine B is best, but the ambience track doesn't stop when the music stops.
> It keeps playing in the background. On second thought, we drop all ambience
> tracks. We make Emergence for the gallery floor. Start anew. Keep the best of
> what we've learned and the direction I provided."*

Her direction, given at the outset: *"sounds of life, insect-sounds, wing-beats,
influences of East Forest and Thievery Corporation. Olafur. A woman who made
this believes in 'reverence for life'. She reads Mary Oliver. Precious life.
Rich life. Gallery floor. Opening, opening. And yet deep time and forest and
canopy."*

**Why the floor resolves the problem rather than patching it.** Gondwana is
*figure* — it decides how much a record says. A floor is *ground* — it says
nothing about any record and everything about the night entire. They cannot
compete, so "a lesser Gondwana" becomes impossible by construction. It also
fills step 3 of `PLAN-NEXT-FAMILY.md`, unstarted since 13 September.

**Her choice is the interesting part.** Spine B was the one *without* the
8–60 Hz flutter and *without* added strata — the patient half of her own
direction, East Forest and Ólafur rather than Thievery and insect-sound. It was
also the spine that measured *worst* at telling two nights apart. Both facts
shaped the rebuild.

---

## What was built

### The bug she found by ear — fixed, and it was real

`stopScheduler()` clears the note-scheduling interval. Every ambience preset ran
on a graph of its own that **nothing ever told to stop**, so the sound outlived
the music. Six code paths stop playback; only three stopped the sound.

The first fix **passed every test and did not work.** Unit tests proved `stop()`
releases its nodes; nothing proved anything *called* it on pause. Driving the
real play button in a real browser caught it. All six paths now stop the room,
and a browser check asserts it plays with the music and stops with it.

This is the clearest instance yet of the standing rule: the tests are a gate,
never evidence that a change is good.

### All ambience retired

Seven builders deleted — the five in the menu (Spore Cloud, Lumen strings, Silk
thread, Firefly field, Pollen drift) and two, `buildRelaxingHum` and
`buildCosmicBreath`, that were never reachable from the interface at all. With
the select, the Spore Cloud breathing-circle visualisation and the dead state
that fed it: **1,085 lines removed, 383 added.**

### Emergence, the room

Six gestures, each driven by a different measured property of the night:

| gesture | what it is | driven by | influence |
|---|---|---|---|
| **breath** | the room swells, and the band opens as it swells | median gap between arrivals | East Forest |
| **memory** | long filtered feedback delay, each pass darker, free of the loop | density — a fuller night holds more of itself | Thievery |
| **band** | how tall the room is, as *width* rather than layers | how many classes the night holds | forest, canopy |
| **felt piano** | one note, all the room in the world around it | the night's pitch classes; spacing from density | Ólafur |
| **grain** | short, quiet sounds of life, irregularly spaced | density | insect-sound |
| **tones** | how much of the night's harmony is stated | how many pitch classes the night holds | — |

**The rejected gestures returned in her chosen spine's own language.** The
flutter was a tremolo on the bus and she turned it down, so insect-sound came
back as *grain* — irregular by construction, so it can never read as a pulse.
The canopy came back as the band *opening* rather than as layers stacked on top.

**And B's weakness was answered in the same language.** Where only the breath
varied with the night before, the piano's spacing, the memory's length, the
band's width, the grain's rate and the harmony's breadth all vary now.

### Emergence withdrawn as a family — withheld, not deleted

The name is now the floor's, so the family left the published list. It stays
registered, tested and auditionable with `?family=emergence`, because the
eight-rank mapping it carries — `MOTH_AXES`, `mothVoicing`, sized by measured
per-night entropy, 142 of 144 nights fully distinguishable — is the best design
work in this repository and is what a future **canopy** family should be built
on. Two tests that asserted the published list were updated to say so.

---

## Measured

Across the 144 offered nights: median gaps 0.017–1.118 s, density 1.00–7.16/s,
class counts of 1 (64 nights) through 7 (3 nights). Every constant is sized from
those, and **the breath clamp never fires on real data** — a test holds it
across the whole archive.

17 February against 3 September, rendered 40 s in a browser:

| | 17 Feb (sparse) | 3 Sept (dense) |
|---|---|---|
| breath | 24.4 s | 9.2 s |
| piano notes per 10 min | 22 | 56 |
| grains per 2 min | 12 | 45 |
| memory feedback | 0.50 | 0.70 |
| band | 110–300 Hz | 101–402 Hz |
| tones voiced | 2 | 3 |
| peak / rms | 0.117 / 0.0149 | 0.122 / 0.0173 |
| memory tail over 40 s | 0.86× | 1.02× — settles, no runaway |

No non-finite samples. Levelled against the presets it replaced: they peaked
0.011–0.067 at rms 0.0045–0.0168, and at the 0.22 gain they shared this room
sat at rms 0.004 — quieter than four of the five. `EMERGENCE.busGain = 0.70`
puts it among them.

### The measure that lied, recorded so nobody trusts it later

A coarse spectral fingerprint rated the two nights **0.017** apart, against
0.34–0.38 for the earlier, worse candidates. Making the harmony genuinely more
night-dependent moved that number the **wrong way**.

It measures long-term frequency balance — the one thing that *should* be similar,
because two nights in the same family share a palette. Spines A and C scored
well on it because flutter and strata changed the *timbre*; B keeps one palette
and varies *what happens in it*. That is two nights in the same room rather than
two different rooms, and it is the better kind of difference.

The six axes above are the honest account. This is the sixth instance of the
lesson this repository keeps recording: a number that fires on something real
and describes itself as something else.

---

## What has NOT been verified

- **Nothing has been heard by Lily.** Every figure above is measurement, and
  this project's record is that measurement repeatedly said a gesture was fine
  when her ear said otherwise.
- **No gallery system, ever.** Every judgement in this project is headphones and
  a laptop. A floor is the component most damaged by that gap, being the one
  designed for a large room.
- **No real-device test of anything.**
- Whether a room survives an hour in a gallery. These renders are seconds.
- Whether the grain reads as life or as noise. It is the newest gesture and the
  one with no precedent in this instrument.

## How to hear it

```
python3 -m http.server 8000 --bind 127.0.0.1
```

<http://127.0.0.1:8000/index.html?emergence=1>

The room is under the **Emergence** control in the sidebar, with its own level.
It sounds only while the music is playing — that is the fix. Switch nights with
the date list and the room rebuilds from whichever night is loaded, which is the
whole claim. Try 17 February 2026 against 3 September 2026.

`?family=emergence` still auditions the withdrawn note-family, separately.

## Tests

**462 tests, 453 pass, 0 fail**, 1 documented skip, 8 gap-remapping TODOs.
`musical-reference.test.cjs` holds Moth Orchestra to the original fixture,
which has never been regenerated.

## Next

- Her ear, on both nights. Then the release decision.
- If accepted: `EMERGENCE.on` defaults true and the `?emergence=1` gate goes.
- The `chime` clamp fix is still outstanding — decided, measured, one entry in a
  table. See `NEXT-SESSION.md`.
- The curated vernacular-name lookup remains build-ready and blocked on nothing.
