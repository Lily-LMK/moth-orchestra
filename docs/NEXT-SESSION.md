# Next session

Note that "family" means two different things in these notes. The section
immediately below concerns **taxonomic** families. Everything from "A new
instrument family" onward concerns **instrument** families — voices. They are
unrelated pieces of work.

---

## Start here — a curated common-name lookup for taxonomic families

Agreed with Lily on 16 September 2026, after the import repair
([SESSION-2026-09-16-IMPORT.md](SESSION-2026-09-16-IMPORT.md)).

Common names now come from iNaturalist alone. The third-party enrichment that
used to fill the gaps was removed: it cost about 65 minutes per import and,
because it walked up the ranks as far as kingdom, could label a family-level
record "Animals" and present that beside genuine vernacular names. Nothing
fills the gap now, by design.

The gap is large and worth filling **locally**. Measured against the
two-backyards export: **4,153 of 6,798** records carry no common name, across
roughly 1,500 distinct taxa. All but **7** of those records do have a taxonomic
family, so a family-level lookup reaches almost the whole gap.

It is also far smaller work than it sounds. 259 distinct families account for
all 4,146, but they are steeply distributed:

| Curated entries | Records covered | Share of the gap |
|---|---|---|
| 10 | 2,345 | 56% |
| 25 | 3,051 | 73% |
| 50 | 3,539 | 85% |
| 100 | 3,887 | 93% |
| 259 (all) | 4,146 | 100% |

The first dozen, by frequency: Erebidae (454), Geometridae (440), Crambidae
(335), Oecophoridae (257), Pyralidae (199), Tortricidae (164), Noctuidae (149),
Formicidae (138), Nolidae (116), Chrysomelidae (93), Cerambycidae (86),
Pentatomidae (71).

**Start with about 25 entries.** That is an afternoon of careful naming for
three-quarters of the benefit, and the table can grow afterwards without
touching any logic.

What to build: a small curated table, embedded in `index.html`, mapping
taxonomic family to a common name — Erebidae → "Erebid moths", Geometridae →
"Geometer moths", and so on. Applied only where iNaturalist supplies no common
name, and only at family level.

Constraints that matter, drawn from why the last attempt was removed:

- **Never present a borrowed name as the record's own.** A family-level name
  describes the family, not the specimen. It must be visibly distinguishable
  from a true vernacular name — a separate field, or a clear presentation
  difference. Decide this with Lily before writing the table.
- **No network access.** The point is that it is local, instant and inspectable.
- **Family level only.** Do not climb to order, class or kingdom. That climb is
  precisely what made the old behaviour dishonest.
- Coverage is better measured than guessed. Count the distinct families among
  the ~1,500 unmatched taxa first; a few dozen entries may cover most records.
- Keep it as data, not code, so Lily can extend it without touching logic.

Open question for Lily: what should a record show when its family is not in the
table — the scientific name alone, as now?

---

## A new instrument family for the gallery

Read [PLAN-NEXT-FAMILY.md](PLAN-NEXT-FAMILY.md) first. It carries the measured
case for a large palette, the naming question to settle with Lily before
building, the three-strata proposal, the headroom problem that must be
measured before any sub-bass is added, and the four answers needed from Lily to
start.

---

## Start here — Gondwana, second attempt, unheard

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

## Standing state — the interface

Lantern Glass is published. `main` carries it; GitHub Pages serves the root of
`main`. Noctilucent is built, tested and deliberately withheld from the
listener. Suite: 200 pass, zero fail, one documented skip, eight gap TODOs.

Read SESSION-ROADMAP.md and SESSION-2026-09-13-RELEASE.md first. This session
is stage two of the interface work Lily asked for: the shell around the
instrument, not the instrument. Protect the sound, the score, the creek
flourish, A-plain/B-outlined and shared taxonomic ring positions.

## The concrete outcome

One interface that genuinely resolves at three sizes rather than shrinking:
an exhibition screen read at a distance and running unattended, Lily's laptop
while she performs it in front of a room, and a phone held one-handed in the
dark at the moth sheet. Lily chose all three, properly responsive.

## Start here — Lily's eyes on the shared minute

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

Precision policy is still only a proposal. The date diamond still means
"both observed on this date", not shared minutes, and still reads as though it
means the latter. Observer sound identity (Milestone 2), composition
save/reopen (Milestone 4) and gap shortening (Milestone 5) are unstarted.

No listening review, real-device test or long rehearsal has been performed on
the released build. Say so rather than implying otherwise. Warm Noctilucent
remains an unjudged audition at
`../../sessions/2026-09-13/noctilucent-warm/listen.html`.
