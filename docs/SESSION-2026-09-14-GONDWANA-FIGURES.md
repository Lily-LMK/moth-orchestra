# Gondwana — the behaviour

14 September 2026. Still step 1 of the five in [PLAN-NEXT-FAMILY.md](PLAN-NEXT-FAMILY.md).
**Not accepted.** Still withheld from the published family list.

Audition: open `index.html?family=gondwana` — the flag unlocks a withheld family
for that browser session only and selects it on load. Nothing else changes; for
everyone without the flag, the dropdown, the keyboard cycle and the swipe list
are exactly as they were.

## The diagnosis

Lily heard the second attempt and said it all sounds like background. That is
not a palette fault, and it would not have been fixed by better bodies.

Every family in this instrument before today is a *timbre substitution*. One
observation becomes one event; the scheduler calls `scheduleInstrument()` once
per event; the family decides what that one note sounds like and nothing else.
So the rhythm of the piece is entirely the rhythm of when records happened to
land, and the music has no phrase, no line and no intention. Background music is
music without agency, and the architecture could not produce agency.

Of the eleven things in Lily's brief, two were synthesis — a felted piano, and
electronic pulses. **Eight were score.** Arpeggios that mutate, interlocking
patterns, accumulation, silence, irregularity, dynamic space, harmonic colour,
and the song-mode opening are not properties of a voice. They live in a layer
that did not exist.

## What was built

**A ninth and a tenth body, and one of them leads.** `gond_felt` is a felted
piano, close-miked, and it takes roughly two arrivals in five. Its partials
follow real string stiffness — f(n) = n·f₀·√(1 + 5e-4·n²) — which is why a piano
sounds like a piano: the upper partials run sharp of the harmonic series and
beat against everything. The fundamental decays twice, fast then slow, because
the strings of a unison fall out of phase; that is the aftersound. The felt is
modelled as weight rather than as a filter, because hammer felt removes the top
of the spectrum at the source. `gond_pulse` is the one honestly synthetic voice:
a blip that resolves downward into a low swell and stays there.

**Mechanism you can hear.** Noise bands may now be fixed in the spectrum (`hz`)
rather than tracking the fundamental (`centre`). The piano has two: felt meeting
string at 2.3 kHz, and the action reaching the key bed at 150 Hz four
milliseconds later. A piano's noise does not transpose with the note. A blown
column's air does, and still does.

**Distance.** The room now has separate dry and wet entry points, so a voice can
choose how far away it is. The piano is at 0.28 wet and 1.15 dry — close. The
seven original bodies state no preference and therefore sound exactly where they
have always sounded. That difference is the depth in the picture, and it cannot
exist on a single shared send.

**Figures.** A record may now speak a phrase. The length is the number of times
that voice has already arrived *tonight* — the fourth moth of the night says
four notes. Not the night's total: a note at ten past eight cannot know what
turns up at midnight, and a tally so far is something a listener could check.
Every pitch in a figure is that record's own pitch transposed by whole scale
steps, so nothing arrives from outside the record. The contour is fixed per
voice, so a figure is recognisable as the same figure; it rotates and displaces
by loop cycle, so it never repeats identically.

**Two hands.** Observer A subdivides the pulse in three, observer B in four.
They drift against each other across the loop. The interlocking is the duet
itself, not an effect laid over it; in solo the split falls back to the taxon.

**Accumulation, twice over.** Within the night, a voice that keeps returning has
more to say each time. Across the loop, figures start at one note and grow by
about a note every other cycle — the first pass states the night plainly, and
seven minutes in it is elaborating.

**A pedal.** A slow authored bass on the Gondwana bus: i–♭VI–♭III–♭VII in a
minor key, I–vi–IV–ii in a major one, four or six changes across the loop,
never exactly on the division. The taxon pitches do not move; what they are
heard *against* does. That is where "melancholic but luminous" actually lives,
and it costs nothing in honesty because no written pitch is altered.

**Room for silence.** Gondwana's velocity range is 0.06–0.88 against 0.12–0.65
for the other families, and about one note in seven inside a figure is dropped,
with the holes moving between cycles.

## What rank now buys

The family already spent depth of rank inside each voice. It now also spends it
inside the phrase: `gondwanaFigureCap()` runs from 1 at class rank to 7 at
species. At class rank the whole night is a single voice group, so there is
nothing to individuate and nothing speaks — nine plain bodies, exactly as
before. The rank selector has become an expressive control.

Measured, notes per second, timeline mode, cycle 0 against cycle 20:

| Night | Rank | Arrivals | Cycle 0 | Cycle 20 | Voices speaking |
|---|---|---|---|---|---|
| 28 Jan 2026 (48 records, 19 s) | class | 48 | 2.5 | 2.5 | 0 |
| | family | 48 | 2.5 | 4.5 | 23 |
| | species | 48 | 2.5 | 2.6 | 2 |
| 3 Sep 2026 (136 records, 40 s) | class | 136 | 3.4 | 3.4 | 0 |
| | order | 136 | 3.4 | 6.0 | 105 |
| | family | 136 | 3.4 | 7.8 | 83 |
| | tribe | 136 | 3.4 | 5.4 | 46 |
| | species | 136 | 3.4 | 4.0 | 18 |

The honest consequence, stated plainly: **at species rank on a sparse night,
almost nothing repeats, so almost nothing speaks.** On 28 January at species
rank only two voices ever elaborate. That is the data, not a bug, and the fix
is not to loosen the rule — it is to listen at family rank, or to a night that
had something to say. The interlocking texture lives at family rank on a dense
night. Worth knowing before judging it.

Voice distribution, 3 September, species rank: felt 39%, bowed 13%, heartwood
13%, pulse 8%, membrane 7%, column 7%, drone 6%, bronze 4%, rim 4%.

## The honesty position

Settled with Lily before building. A figure is evidence, not ornament, because
its length is a count of real arrivals and its pitches are transpositions of the
record's own pitch. One record still produces one arrival, one glow, one
thumbnail and one selection — the visual layer was not touched, because figures
are expanded at schedule time rather than as extra events.

The pedal is authored and is marked `derived: true`. It stands for no
observation, matches no shared minute, carries no glow, and exists only while
Gondwana is the chosen family. Same status as the floor and the sub in §3 of the
plan.

## Performance

`gondwanaImpulse()` was rebuilt: the tail decays by repeated multiplication
instead of an exponential per sample, and the peak is tracked during the write
rather than in a second pass. At 96 kHz the room is nearly a million samples per
channel and it is built on the family's first note, where a hitch would be
audible. Measured 2.4× faster; the buffer is seeded and normalised as before.

## Tests

`tests/gondwana.test.cjs`, 68 tests (was 45). Suite total: 232 tests, 223 pass,
0 fail, 1 documented skip, 8 gap TODOs. Nothing in the existing suite changed
except the four Gondwana contract tests that described seven bodies.

Fifteen tests exist because of this session:

- **a first sighting says one note, at every cycle, for ever** — the §5 rule as
  a guard. A taxon recorded once can never be made to say more than it did.
- **the tally is the arrivals of that voice so far, in clock order** — and no
  arrival may know what happens after it.
- **rank caps the phrase, and class rank has no figures at all.**
- **every pitch in a figure is the record's own pitch transposed by whole scale
  steps** — across all seven scales and all six keys.
- **the record's own note always sounds first, on the beat, and loudest.**
- **the two observers do not share a subdivision** — every A note falls on the
  pulse, every B note on four-thirds of it, and B lands where A cannot.
- **nothing in a figure lands exactly on the grid.**
- **the pedal is authored harmony and never evidence**, and **exists only for
  Gondwana** — the other five families gain no event.
- **mechanism is fixed in the spectrum and air is not.**
- **the piano is close and the bodies are in the room** — and the seven original
  bodies are unchanged by the piano arriving.

## What has not been done

**No listening judgement.** This is the whole of the pass condition and it has
not happened.

**Song mode gets the voices but not the behaviour.** The felted piano now leads
three of the four registers in Song, and the wider dynamics and the room apply.
Figures and the pedal are Timeline and Riff only, because Song already composes
its own bars, chords and groove and a second harmonic clock underneath it would
fight the first. Lily's "song mode opens into something cinematic and almost
geological" is therefore **not built.** It is a Song-mode arrangement change —
drop to the piano alone for a bar, then bring the drone, heartwood and membrane
in underneath at full weight with the room wetted up — and it is the obvious
next hour of work.

**The floor (§3) and the ground (§3) are still unbuilt.** This is the canopy
with a voice, not the three strata.

**No offline renders this session.** The renderer was patched so that a render
now sounds like the playback, including figures and the pedal, but nothing was
rendered — the audition tools need Chromium and Playwright, which this Mac does
not have. Headphones and the app itself are the faster path to an answer.

**No measurement of the new headroom.** Two extra voices, a wider velocity
range and up to seven notes where there was one. Nothing clips in principle —
the Gondwana bus still has its own limiter and everything routes through it —
but the §4 figures were measured with one note per arrival and are now stale.

## Open questions for the ear

1. Is 39% piano too much? It is one constant, `GONDWANA_POOL`.
2. Is the pulse, at 0.30 s, too slow to interlock or too fast to be sparse? It
   is one constant, `GONDWANA_PULSE`.
3. Does the pedal make the harmony luminous, or does it flatten 118 distinct
   taxon pitches into four chords heard four times?
4. At family rank on 3 September the piece reaches 7.8 notes a second. Is that
   the Reich texture, or is it a wall?
