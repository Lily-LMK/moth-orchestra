# Next session

One "Start here", updated in place. This file had grown three competing ones
by 16 September 2026; if it grows a second again, that is the bug.

---

## Standing state — 18 September 2026, end of day

`main` is **published** at <https://lily-lmk.github.io/moth-orchestra/> and is
**unchanged at `11265d1`**. All of today's work is on the branch **`floor`**,
three commits, working tree clean:

```
5d83d96  Give Emergence an on/off, and fix an axis that never varied
3d18fe3  Make Emergence the gallery floor; retire all ambience
d59f85a  Build the gallery floor: three spines, withheld for her ear
```

Suite: **464 tests, 455 pass, 0 fail**, 1 documented skip, 8 gap-remapping
TODOs.

### A push is pending her word

Lily, 18 September: *"Soon we will want to commit and push to live because
you've corrected some important bugs and also replaced the ambience tracks with
something meaningful."* **Soon, not yet.** Do not merge or push until she says
so. What would go live:

- **A real bug fix.** Ambience kept playing after the music stopped. Six code
  paths stop playback; only three stopped the sound. All six now do.
- **All ambience retired** — the five presets in the menu and two builders that
  were never reachable from the interface. 1,085 lines removed.
- **Emergence, the gallery floor**, replacing them. Still behind `?emergence=1`.
- **Emergence withdrawn as a voice family** — withheld, not deleted, and still
  auditionable with `?family=emergence`.

Note that publishing removes five ambience presets that have been live for
weeks. Nothing suggests she wants them kept, but say it plainly before pushing
rather than after.

Read in this order:

1. **[PLAN-WORKBOOK.md](PLAN-WORKBOOK.md)** — the brief for the main task below.
2. **[WHAT-EVERY-SOUND-MEANS.md](WHAT-EVERY-SOUND-MEANS.md)** — every sound, what
   fires it, what it claims. The workbook is largely a hearable version of this.
3. [SESSION-2026-09-18-FLOOR.md](SESSION-2026-09-18-FLOOR.md) — how Emergence
   was built and what was measured.

---

# Start here

## 1. The explainer workbook — read PLAN-WORKBOOK.md

> *"I think we need a total explainer workbook, not just for emergence but for
> at least two sample music families. [...] I'll be demonstrating this soon and
> I think this workbook will be an important part of introducing Moth
> Orchestra."*

**This is for an audience, not for us**, which changes what "good" means: every
claim must be hearable rather than merely written down.

Three content areas, all specified in the plan: *every note is one observation*;
*the three gestures that mark the two observers together*, in her own words; and
*what makes Emergence behave one way versus another*. Two families —
**Gondwana** and **Moth Orchestra** proposed, both published and accepted.

**The finding that shapes the design.** She said she could not hear four of
Emergence's six gestures and guessed the arrivals were covering them. She is
right, by a wide margin: on 3 September the whole room renders **26.6 dB below
the arrivals**, and grain and tones sit around −17 dB even measured generously.
So the workbook must let every sound be heard **alone**, and there is a real
question for her ear — **is Emergence simply too quiet?** Even at 100% the room
stays about 20 dB under. Do not change that level on measurement alone.

Five questions for her are at the foot of the plan; the first two (audience,
and where the workbook lives) shape everything and are worth asking early.

## 2. Fix the `chime` clamp — still outstanding, still decided

Carried from 17 September, untouched since, and still the smallest real task in
this file. `chime`, in Moth Orchestra, uses `Math.min` where it needs a fold:
166 of 526 chime notes across 144 nights are flattened onto B4, giving 56 taxa a
pitch that is not their own. The fix is one entry in `VOICE_REGISTERS` and one
call to `voicedFreq`.

Measured, so it is not left as a guess: **220–494 Hz** is the register to start
from — seven distinct pitches rather than the five that 247–494 gives, fewer
notes moved, median unchanged. The trade-off to put to her rather than decide:
the clamp yields *ten* distinct sounding pitches because it piles 199 notes onto
B4, so folding trades three distinct pitches for the guarantee that no note is
ever given a pitch its taxon did not have.

It changes Moth Orchestra, so it needs her ear, and
`tests/musical-reference.test.cjs` **will fail** when it lands — correct, and the
fixture must not be regenerated to silence it.

## 3. The curated vernacular-name lookup — build-ready, blocked on nothing

Fully specified below under "Ready and fully specified". It is the only
outstanding task that touches **words rather than sound**, which makes it the
one to pick up when her ear is not available.

---

## Still open, in rough order of value

### Part 1 of PLAN-SYNCHRONY-AND-TRUTH — something beautiful in each family
Unstarted and still fully specified. Four of seven published families play a
generic `creek`/`pad` for their flourishes, and Gondwana plays one timbre for
*both* layers where every other family plays two. Read
[PLAN-SYNCHRONY-AND-TRUTH.md](PLAN-SYNCHRONY-AND-TRUTH.md); Part 2 is done.

### Read the status lines on screen
Part 2 shipped and its strings are tested, but **nobody has read them on a
screen**. The plan asked for it explicitly, and the failure being fixed was a
true sentence that told Lily the wrong thing — only reading one catches the
next. One judgement inside the plan's latitude is most likely to want changing:
the omitted-row count is kept but only when non-zero, and that is one `if`.

### ~~The gallery family's floor — step 3 of PLAN-NEXT-FAMILY.md~~
**Done 18 September 2026**, on the `floor` branch, as Emergence. The five
presets are retired. Unheard in a gallery, like everything else here.

### Noctilucent has never been heard
Built, tested, withheld. Audition with `?family=noctilucent`, or at
`../../sessions/2026-09-13/noctilucent-warm/listen.html`. It leaves
`WITHHELD_VOICE_MODES` only when Lily has listened and said so.

### Smaller, and worth doing when nearby
- **The date diamond** still means "both observed on this date", not shared
  minutes, and still reads as though it means the latter.
- **"Class voices: 1"** still tells a viewer nothing.
- **Present/demo mode and the gallery fullscreen view** have not been
  re-examined since the September interface rebuild.
- **Photo preload on a slow connection** — never watched from a cold cache on
  anything but a fast link. See [PLAN-PHOTOS.md](PLAN-PHOTOS.md).
- **Is Emergence too quiet?** Measured: the whole room renders 26.6 dB below
  the arrivals, and grain and tones sit around −17 dB. Four of its six gestures
  may be inaudible in context. Her ear, with isolated clips — see
  [PLAN-WORKBOOK.md](PLAN-WORKBOOK.md).
- **`moth_ground`** belongs to the withheld Emergence *family* now, and its
  level (0.115) is still the guess it always was. Only reachable via
  `?family=emergence`.

---

## Standing obligations

**No real-device test of anything, ever.** Every judgement to date is
headphones and a laptop. Say so rather than implying otherwise.

**Emergence is live and not settled.** That is Lily's decision, taken
explicitly, with Moth Orchestra left intact as the safeguard. Do not treat it
as accepted.

Observer sound identity (Milestone 2), composition save/reopen (Milestone 4)
and gap shortening (Milestone 5) are unstarted.

### The lesson that keeps recurring

Four gestures have now been wrong in the same way: **a rule that fires on
something real but describes itself as something else.** V2's pulse claimed
seconds and measured loop position. `duet_sync` claimed rarity and fired on
every shared minute. The meeting claimed a moment and delivered a volume.
`chime` says "capped at octave 4" and changes which moth you are hearing.

> Before adding a gesture, measure how often it fires on real data, and check
> that the thing it fires on is the thing its name says.

A fifth, from 17 September:

> Measure where a new family sits **relative to the families that already
> exist**, not only against its own intentions. Emergence measured beautifully
> on every axis it was designed against, and was still a lesser Gondwana.

Two more, both from 18 September, and both cheap to apply:

> **Sweep the whole archive, not the two nights that get auditioned.** The
> Emergence `tones` axis read 2 against 3 on the two test nights and looked
> like it worked. Across all 144 nights it was 3 every time — dead, because it
> keyed on pitch-class count and the scale is pentatonic, so 140 of 144 nights
> use all five. `tests/emergence.test.cjs` now sweeps the archive and fails any
> axis that takes only one value.

> **A passing test is not a working feature.** The first fix for "the room does
> not stop when the music stops" passed every test and did not work: the tests
> proved `stop()` released its nodes, and nothing proved anything *called* it on
> pause. Pressing the real button in a real browser caught it. Where a change is
> about *when* something happens rather than *what* it does, drive the real
> control.

---

## Ready and fully specified — the curated vernacular-name lookup

Agreed with Lily on 16 September 2026 after the import repair
([SESSION-2026-09-16-IMPORT.md](SESSION-2026-09-16-IMPORT.md)), refined by her
the same day, and deferred by her so the night-display rules could go first.
Those are done. **This is build-ready and blocked on nothing** — it is below
the two tasks above only because she set those, not because it is less
finished. It is an afternoon of careful naming and no new machinery.

It is also the only outstanding task in this file that touches **words rather
than sound**, which makes it the natural one to pick up when her ear is not
available.

Common names now come from iNaturalist alone. The third-party enrichment that
used to fill the gaps was removed: it cost about 65 minutes per import and
walked up the ranks as far as kingdom, so a record could be labelled "Animals".
Nothing fills the gap now, by design.

### The rule

**Prefer the taxonomic family. Climb to superfamily when the family has no
honest vernacular name. Stop there.**

This is Lily's rule and it is a better one than "family only", which is what
this document said first. Her reasoning: *"Even if an owlet moth has a species
name, it is still an owlet moth."* A superfamily name is a true statement about
the specimen, not a guess. She would be glad to photograph an unidentified
moth and see "owlet moth".

The floor matters more than the ceiling. Family and superfamily are the ranks
where Lepidoptera actually carry vernacular names. Above them the names stop
informing — order gives "moths and butterflies", class "insects", kingdom
"animals". That emptiness, not the climbing itself, is what made the removed
behaviour dishonest.

### Names must sound vernacular, and be singular

"Owlet moth", not "owlet moths". Not "Erebid moths" — a latinate coinage
wearing a vernacular coat, and the mistake this document made on its first
pass. If there is no name a person would actually say, climb; if there is
still none, leave the scientific name alone.

### Why climbing earns its place — measured, not assumed

Against the two-backyards export. 4,153 records carry no common name; all but 7
have a family, and 3,972 have a superfamily.

| Level | Curated entries | Records covered | Share of gap |
|---|---|---|---|
| Family | 10 | 2,345 | 56% |
| Family | 25 | 3,051 | 73% |
| Family | 50 | 3,539 | 85% |
| **Superfamily** | **10** | **2,888** | **69%** |
| **Superfamily** | **20** | **3,350** | **80%** |

Superfamily is often both fewer entries and truer names:

| Superfamily | Records | Families beneath | Vernacular |
|---|---|---|---|
| Noctuoidea | 762 | 6 — Erebidae, Noctuidae, Nolidae, Notodontidae… | owlet moth |
| Pyraloidea | 534 | 2 — Crambidae, Pyralidae | snout moth |
| Gelechioidea | 488 | 10 — Oecophoridae, Depressariidae, Xyloryctidae… | curved-horn moth |
| Geometroidea | 452 | 2 — Geometridae, Uraniidae | — prefer family |
| Tortricoidea | 164 | 1 — Tortricidae | leafroller moth |

Noctuoidea is the case that proves the rule: one entry covers 762 records, and
covers them better than three family entries would, because Erebidae is exactly
the family with no honest vernacular.

Names in that last column are **suggestions for Lily to judge**, not decided.
Vernacular naming is her expertise, and the first pass of this document got
Erebidae wrong precisely by not deferring to it.

Where the family has the better name, use it: Formicidae → "ant",
Cerambycidae → "longhorn beetle", Geometridae → "geometer moth". 174 records
have a family but no superfamily, so family entries remain necessary either way.

**Start with roughly 20 entries across both levels.** That reaches about 80% of
the gap and is an afternoon of careful naming.

### Constraints

- **No network access.** The point is that it is local, instant and inspectable.
- **Never climb above superfamily.** Order, class and kingdom carry no name
  worth showing.
- **Record where the name came from.** Lily is content for a superfamily name
  to appear as the record's name, so this is not a display constraint. But the
  data model should keep the rank the name came from — a record should know it
  is showing a Noctuoidea name rather than its own — so provenance survives
  into exports and the presentation can change later without re-deriving
  anything. Cheap now, impossible to add retrospectively.
- Keep the table as **data, not code**, so Lily can extend it without touching
  logic.
- Applied **only** where iNaturalist supplies no common name. It never
  overrides a real one.

Settled: where neither family nor superfamily has an entry, the scientific name
stands alone, as now.

---


---

# Carried forward

Everything below predates 17 September 2026 and is **not** a brief. It is kept
because it records decisions and reasoning that would otherwise be lost.
Nothing here has been re-verified against the released build.

## Carried forward — a new instrument family for the gallery

Read [PLAN-NEXT-FAMILY.md](PLAN-NEXT-FAMILY.md) first. It carries the measured
case for a large palette, the naming question to settle with Lily before
building, the three-strata proposal, the headroom problem that must be
measured before any sub-bass is added, and the four answers needed from Lily to
start.

---

## Carried forward — Gondwana, second attempt (since released and loved)

**Superseded in its conclusion, kept for its reasoning.** Gondwana was released
as the sixth published family and Lily has heard it many times; it sounds
beautiful. Everything below describes the state before that release, including
its "nothing has been judged by ear" framing. Read it for why the *first*
palette failed, which is still the sharpest lesson in this repository.

The first palette (fifteen physical-model bodies, rank-graded) was built and
rejected by ear the same day: *"a child's xylophone or panhand"*. The diagnosis
and the rebuild are both in
[SESSION-2026-09-13-GONDWANA.md](SESSION-2026-09-13-GONDWANA.md) — read it
before touching this family, because the failure is more instructive than the
fix.

What stands now: seven bodies, not fifteen. Rank is spent *inside* each voice
rather than on more voices. The family performs the written score an octave or
two below where it was written, always by whole octaves. And it sounds into a
synthesised room on its own bus — the first reverb this instrument has ever had.

Audition: `../../sessions/2026-09-13/gondwana-2/listen.html` — run
`python3 serve.py` in that folder first. The first attempt is kept at
`../../sessions/2026-09-13/gondwana/` for comparison.

**Superseded — this paragraph described the state before release.** Gondwana
left `WITHHELD_VOICE_MODES` on 14 September 2026, is published, and is Lily's
favourite family. Noctilucent is the only withheld one. Kept only because the
reasoning above it is the sharpest lesson in this repository. Two questions the measurements
raise but cannot answer: whether this is a wise voice or merely a slower one,
and whether `gond_rim` — the only light left on top, and among the quietest —
survives the mass underneath.

Steps 2 to 5 — the ground, the floor, the gallery/personal mix, the release
decision — are unstarted. Playback is headphones only.

## Carried forward — the interface work

Written 13 September, when it was the active session. Its suite count (200) and
"this session" framing are both superseded; the current state is at the top of
this file. Kept for the protected behaviours it names, which still hold:
the sound, the score, the creek flourish, A-plain/B-outlined, and shared
taxonomic ring positions.

Lantern Glass is published. Noctilucent is built, tested and deliberately
withheld from the listener. Read SESSION-ROADMAP.md and
SESSION-2026-09-13-RELEASE.md before resuming interface work.

## Carried forward — the three-size interface outcome

One interface that genuinely resolves at three sizes rather than shrinking:
an exhibition screen read at a distance and running unattended, Lily's laptop
while she performs it in front of a room, and a phone held one-handed in the
dark at the moth sheet. Lily chose all three, properly responsive.

## Carried forward — Lily's eyes on the shared minute

See SESSION-2026-09-13-SHARED.md. Shared minutes now show both records; they
never reached the card at all before. The centre card has an off switch (C),
and the control column was rebuilt as a specification sheet.

Still unchecked: the gallery fullscreen view under the new design layer, and
Present/demo mode. Nothing has been judged by ear or on hardware.

## Earlier — the rebuilt circle

See SESSION-2026-09-13-CIRCLE.md. The circle view was rebuilt around the
sounding record and a real clock of the night, the floating key was removed,
and the controls now fold away with the tab or H. None of it has been seen on
real hardware or judged by ear.

Known gaps: the gallery fullscreen view was not touched and has not been
re-checked under the new design layer; "Class voices: 1" still tells a viewer
nothing; Present/demo mode was not re-examined.

## Earlier — the first interface pass

The interface pass is built and measured but nobody has looked at it. Two ring
conventions changed deliberately (single-group arrivals moved to the outer
ring; shared-minute halos moved from a fixed 0.93 to just outside the
arrivals at 1.04) and a legend was added. SESSION-2026-09-13-RELEASE.md has
the reasoning. Show her the circle before building anything on top of it.

Then: the gallery and Present mode were not re-examined under the new design
layer, and "Class voices: 1" still tells a viewer nothing.

## Carried forward — standing obligations, as written before 17 September

**Settled.** The precision question is closed and acted on. 97.7% of records
carry `:00` seconds (6,636 of 6,794), so the five-second near-simultaneous rule
was reading detail that is not there; measurement then showed it had collapsed
onto the shared-minute rule entirely. Lily has called for its replacement — see
[PLAN-SYNCHRONY-AND-TRUTH.md](PLAN-SYNCHRONY-AND-TRUTH.md), which is the active
brief. The genuine shared-*minute* flourish was never affected, since it works
at minute resolution by construction.

The date diamond still means
"both observed on this date", not shared minutes, and still reads as though it
means the latter. Observer sound identity (Milestone 2), composition
save/reopen (Milestone 4) and gap shortening (Milestone 5) are unstarted.

No listening review, real-device test or long rehearsal has been performed on
the released build. Say so rather than implying otherwise. Warm Noctilucent
remains an unjudged audition at
`../../sessions/2026-09-13/noctilucent-warm/listen.html`.
