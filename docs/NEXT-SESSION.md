# Next session

The roadmap asks that this file be updated in place rather than accumulating
opening instructions. It had grown three competing "Start here" sections. This
one has one, decided by Lily on 16 September 2026.

Note that "family" means two different things below. The vernacular-name
section concerns **taxonomic** families; everything from "A new instrument
family" onward concerns **instrument** families — voices. Unrelated work.

---

## Standing state — 16 September 2026

`main` is published at <https://lily-lmk.github.io/moth-orchestra/> and carries
the import repair. **The working tree is ahead of it**: the night-display rules
are built and tested but not committed and not released. Lily has not yet said
to commit.

Suite: **298 pass, 0 fail**, 1 documented skip, 8 gap-remapping TODOs.

Two pieces of work stand behind that number, neither heard:

- The import repair, released. Fetch, Import CSV and Top up all reported
  success and then showed something else.
  [SESSION-2026-09-16-FETCH.md](SESSION-2026-09-16-FETCH.md),
  [SESSION-2026-09-16-ARRIVALS.md](SESSION-2026-09-16-ARRIVALS.md).
- The night-display rules, uncommitted.
  [SESSION-2026-09-16-NIGHTS.md](SESSION-2026-09-16-NIGHTS.md).

Both are recorded in the README. Outstanding on both: **no listening review and
no real-device test.**

---

## Done — rules for which nights are worth offering

Settled and built on 16 September 2026. Read
[SESSION-2026-09-16-NIGHTS.md](SESSION-2026-09-16-NIGHTS.md); the rule itself is
in the README under "Which nights are offered".

Lily decided: **more than fifteen records**, and **hidden rather than set
aside**. She chose hiding against the recommendation, with the cost stated
twice — 284 of 428 dates leave the list, and every night of 2020–2023 leaves the
instrument entirely, because no night in those four years reaches sixteen
records. That is her decision and it is implemented as she asked.

The rule is one constant and two functions used in exactly one place. Two
exceptions stop it recreating the bug it follows: the **selected** night is
always offered (Top up lands on a night that may hold three records), and a rule
that would silence every date does not apply (a capped fetch, judged within the
year filter).

Measured once so it is not re-guessed: a **time-spread** rule is unnecessary.
All 92 zero-span nights hold exactly one record. Do not add a second axis
without re-measuring.

### What this left open

1. **Commit and release.** The work is not on `main`. Lily's call.
2. **A status line says "across 428 nights" while the list offers 144.** True,
   but a reader can find the gap. The honest fix is close to the set-aside line
   Lily declined, so it was left alone rather than reintroduced quietly. Worth
   a minute of her judgement — the last section of the session doc.
3. **The threshold is a slider.** `OFFERABLE_NIGHT_MIN_RECORDS`, one line. If
   sixteen proves too severe in use — particularly the loss of the early
   years — changing it is a one-word edit and the tests will follow.

---

## Start here — the oldest debt: nobody has listened

This is now the longest-standing gap in the project and it is not a build task.

**Nothing released since 13 September has been judged by ear, and nothing has
been seen on a phone or an exhibition screen.** Two sessions of import repair
and one of night rules all end with the same two sentences. The suite has grown
from 200 to 298 tests across that stretch; the number of times anyone has
listened to the result is zero.

The withheld work has been waiting longer still. **Gondwana** — seven bodies, a
synthesised room, the first reverb this instrument has ever had — has never been
heard by anyone. It sits in `WITHHELD_VOICE_MODES` with **Noctilucent**, which
is also unjudged. Both were built, measured, tested and shelved. A palette was
already rejected by ear once, on the day it was built, as *"a child's xylophone
or panhand"* — which is the strongest evidence in this repository that
measurement does not substitute for listening here.

Concretely, in order:

1. Open the published page and play a night. Then play one on a phone.
2. Audition Gondwana: `../../sessions/2026-09-13/gondwana-2/listen.html`, after
   `python3 serve.py` in that folder. Headphones. The first attempt is kept
   alongside at `gondwana/` for comparison. Two questions the measurements
   raise but cannot answer: whether this is a wise voice or merely a slower
   one, and whether `gond_rim` survives the mass underneath.
3. Audition warm Noctilucent:
   `../../sessions/2026-09-13/noctilucent-warm/listen.html`.
4. Decide what is released and what stays withheld.

Building more before this happens adds to a pile nobody has checked. If Lily
would rather build, the vernacular-name lookup below is the ready task — but it
should be a deliberate choice to defer listening again, not a default.

---

## A future session — a curated vernacular-name lookup

Agreed with Lily on 16 September 2026 and deferred by her the same day so the
night-display rules could go first. Those are now done, so this is the ready
build task — but see "the oldest debt" above before starting it. Agreed after
the import repair
([SESSION-2026-09-16-IMPORT.md](SESSION-2026-09-16-IMPORT.md)), and refined by
her the same day.

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

# Carried forward

Everything below predates 16 September 2026 and is **not** this session's brief.
It is kept because it records decisions and unjudged work that would otherwise
be lost, not because it is next. Nothing here has been re-verified against the
released build.

## Carried forward — a new instrument family for the gallery

Read [PLAN-NEXT-FAMILY.md](PLAN-NEXT-FAMILY.md) first. It carries the measured
case for a large palette, the naming question to settle with Lily before
building, the three-strata proposal, the headroom problem that must be
measured before any sub-bass is added, and the four answers needed from Lily to
start.

---

## Carried forward — Gondwana, second attempt, unheard
<!-- Referenced from "the oldest debt" above; this is the detail behind it. -->

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

**Nothing has been judged by ear.** Gondwana stays in `WITHHELD_VOICE_MODES`
alongside Noctilucent; no visitor can reach it. Two questions the measurements
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

## Standing obligations

Precision policy is still only a proposal, but it now has a number. Measured on
16 September against the two-backyards export: **97.7% of records carry
`:00` seconds** (6,636 of 6,794). The roadmap's caution that "the export
includes both zero and nonzero seconds; neither proves measurement precision on
its own" resolves in the direction it feared — the data is effectively
minute-precision, and the five-second near-simultaneous pulse rule is reading
detail that is mostly not there. That is evidence for the proposed suppression,
not a decision; the genuine shared-*minute* flourish is unaffected either way,
since it works at minute resolution by construction.

The date diamond still means
"both observed on this date", not shared minutes, and still reads as though it
means the latter. Observer sound identity (Milestone 2), composition
save/reopen (Milestone 4) and gap shortening (Milestone 5) are unstarted.

No listening review, real-device test or long rehearsal has been performed on
the released build. Say so rather than implying otherwise. Warm Noctilucent
remains an unjudged audition at
`../../sessions/2026-09-13/noctilucent-warm/listen.html`.
