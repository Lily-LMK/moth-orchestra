# Next session

One "Start here", updated in place. This file had grown three competing ones
by 16 September 2026; if it grows a second again, that is the bug.

---

## Standing state — 17 September 2026, end of day

`main` is **published** at <https://lily-lmk.github.io/moth-orchestra/> and
verified by SHA against the file that was tested. Suite: **443 tests, 434 pass,
0 fail**, 1 documented skip, 8 gap-remapping TODOs.

Three things went live today, in one push:

1. **The registers** — Frog Yawn's soprano folds into C4–E5; Lantern Glass is a
   consort in thirds. Built, measured, and **accepted by ear**: *"Frog Yawn and
   Lantern glass sound better now."*
2. **Emergence**, a seventh published family, whose note is built from the
   record's own lineage. Published **deliberately unsettled** — *"I'm not
   entirely set just yet."*
3. **Gondwana is the default** and leads the family list.

**Moth Orchestra is unchanged** and is held to the original reference score
note for note, instrument names included, by a fixture that has never been
regenerated.

Read in this order:

1. **[WHAT-EVERY-SOUND-MEANS.md](WHAT-EVERY-SOUND-MEANS.md)** — every sound the
   instrument makes, what fires it, what it claims, evidence or authorship.
   Keep it current; it is the cheapest defence this project has.
2. **[PLAN-EMERGENCE.md](PLAN-EMERGENCE.md)** — the brief for the main task
   below.
3. [SESSION-2026-09-17-HERO.md](SESSION-2026-09-17-HERO.md) and
   [SESSION-2026-09-17-REGISTERS.md](SESSION-2026-09-17-REGISTERS.md).

---

# Start here

Two tasks, both set by Lily on 17 September 2026. Do the first one first: it is
small, she has decided it, and it has been outstanding for two sessions. It
carries **one question for her** — flagged below — which is worth asking before
building rather than after.

## 1. Fix the `chime` clamp — decided, measured, one entry in a table

> *"I want what you discovered about moth orchestra to get fixed."*

`chime`, in **Moth Orchestra**, is the one place in this instrument where a note
is moved to a pitch the taxon was never given:

```js
const cappedFreq = Math.min(freq, midiToFreq(12*(4+1) + 11)); // cap at B4
```

`Math.min` is a clamp, not a fold. It does not preserve the pitch class — it
collapses everything above B4 onto B4 itself, so two different moths sound like
the same moth, at a pitch belonging to neither.

**Measured across the 144 offered nights:** 526 chime notes, of which **166
(32%) are clamped**, flattening five distinct written pitches into one and
giving **56 taxa a pitch that is not their own**.

| written | the clamp gives | folding would give |
|---|---|---|
| 587 Hz | 494 | 293 |
| 659 Hz | 494 | 329 |
| 740 Hz | 494 | 370 |
| 880 Hz | 494 | 440 |
| 988 Hz | 494 | 494 |

**The fix** is one entry in `VOICE_REGISTERS` and one call to `voicedFreq`,
exactly as Lantern Glass and Frog Yawn already do — the machinery is built,
released and accepted.

**Which register, measured, so this is not left as a guess.** 526 chime notes,
written 147 … 330 … 988 Hz:

| register | sounding min/med/max | distinct pitches | notes moved | notes at the ceiling |
|---|---|---|---|---|
| the clamp today | 147 / 330 / 494 | 10 | 166 | **199** |
| 247–494 | 294 / 370 / 494 | 5 | 354 | 77 |
| **220–494** | **220 / 330 / 494** | **7** | **268** | **41** |
| 165–330 | 185 / 247 / 330 | 5 | 325 | 77 |

**220–494 is the one to start from**, not the 247 a first pass assumed: it keeps
seven distinct pitches rather than five, moves fewer notes, and leaves the
median exactly where it is today.

**And there is a real trade-off to put to Lily rather than decide.** The clamp
produces *ten* distinct sounding pitches — more than any fold — because it
leaves everything below B4 untouched and piles everything above it onto one
note. 199 of 526 chime notes, 38%, sit on that single pile. Folding trades
three of those distinct pitches for the guarantee that **no note is ever given
a pitch its taxon did not have**. That is the right trade on this project's own
terms, and it is still a trade; say so rather than presenting it as free.

`chime` is scheduled at 2× and 3× the fundamental and never sounds the
fundamental itself, so a 494 Hz ceiling puts its top partial at 1,482 Hz.

**It changes the sound of the default-until-today family, so it needs her ear
before it is pushed.** Build it on a branch, render before/after on 3 September
and 17 February, and follow the rhythm. `tests/musical-reference.test.cjs`
holds Moth Orchestra against the original fixture and **will fail** when this
lands — that is correct, and the fixture must not be regenerated to silence it;
hold every other field and assert this one change, the way the Emergence seam
test does.

Two smaller questions to settle while in there: whether the Song-mode pooled
`lead` role should use the folded chime too (it is authorship, so it may not
matter), and whether any other instrument clamps — nothing else measured as
doing so, but nothing has looked since.

## 2. Reshape Emergence into something of its own

> *"Emergence is fantastic but it's a lesser Gondwana so I think we should
> reshape it into something of its own. I'll leave it for you to brainstorm and
> plan in the next session."*

**Read [PLAN-EMERGENCE.md](PLAN-EMERGENCE.md).** It carries the measured
diagnosis, why it happened, what must be protected, four directions to react
to, and the five questions only Lily can answer.

The diagnosis in one line: **100% of Emergence's notes land inside Gondwana's
central register**, and all six structural ideas in its sound were Gondwana's
first — the room, the folding, the additive partials, the late arrivals, the
authored harmonic layer, and long tails as the dominant gesture. She asked for
*"a touch of Gondwana"*, which described a **mood**, and it was implemented as
an **architecture**.

The thing to protect: **the mapping is the idea and it is untouched by any of
this.** Eight ranks, each sized by what it measurably tells apart. Keep the
mapping, replace the sound world.

**This is a brainstorm with her, not a build.** Bring the directions, ask the
five questions, and do not start until she has answered — the last two sessions
both improved by measuring first and both went wrong where they guessed.

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

### The gallery family's floor — step 3 of PLAN-NEXT-FAMILY.md
The room generated from the night's own shape, replacing the five ambience
presets. **Emergence's `moth_ground` is now a worked example of exactly this
idea** — harmony grown from the night's own pitch classes, 143 distinct
harmonies across 144 nights where a preset gives one — so the floor has a
pattern to follow and a tested one. The parked ground's bus and limiter are
still in place.

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
- **Emergence's ground level** is 0.115 against arrivals at 0.12–0.65, and it
  was a guess. One number.

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

A fifth, from this session, worth adding beside it:

> Measure where a new family sits **relative to the families that already
> exist**, not only against its own intentions. Emergence measured beautifully
> on every axis it was designed against, and was still a lesser Gondwana.

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
