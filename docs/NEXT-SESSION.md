# Next session

The roadmap asks that this file be updated in place rather than accumulating
opening instructions. It had grown three competing "Start here" sections. This
one has one, decided by Lily on 16 September 2026.

Note that "family" means two different things below. The vernacular-name
section concerns **taxonomic** families; everything from "A new instrument
family" onward concerns **instrument** families — voices. Unrelated work.

---

## Standing state — 16 September 2026, after the flourish release

`main` is published at <https://lily-lmk.github.io/moth-orchestra/> and carries
the restored synchrony gestures and the photograph work. Suite: **352 pass, 0
fail**, 1 documented skip, 8 gap-remapping TODOs.

Read [SESSION-2026-09-16-FLOURISHES.md](SESSION-2026-09-16-FLOURISHES.md) and
[WHAT-EVERY-SOUND-MEANS.md](WHAT-EVERY-SOUND-MEANS.md) first. The second is the
inventory of every sound the instrument makes and is the page to keep current.

**Heard and accepted by Lily before release:** the echo, the photographs, the
gallery, the left column.

**Parked by Lily on first hearing:** the meeting, and the ground beneath it.
Behind `DUET_GESTURES.meeting`, with tests. When it returns it needs a
different *kind* of sound, not a quieter one.

**Still unheard:** `GROUND.mixes.gallery`, which needs a room. No real-device
test of anything.

### Ready and diagnosed, not built

Both were named by Lily on 16 September and both have a measured cause:

1. **Lantern Glass is too high pitched.** All four voices run to 988 Hz with
   medians of 220-494 and none folds; `lantern_glass` has a partial at 4x the
   fundamental, so a top note puts strong energy at 3,952 Hz with a 1.1 s
   decay. Gondwana already solves this: per-voice `ceiling` plus whole-octave
   folding in `gondwanaVoicing`, which preserves pitch class so the score is
   untouched. Suggested ceilings: bloom 262, felt 330, reed 392, glass 494.
2. **Frog Yawn needs work**, and one voice is measurably the problem. Three of
   the four choir voices fold into a range — bass_voice 65-200, tenor 120-350,
   alto 165-440. **Soprano does not fold at all**: median 440 Hz, maximum 988,
   on 377 notes across 40 nights. In a four-part choir one singer is
   unanchored, an octave above alto's ceiling.

3. **The gallery family's floor** — the room generated from the night's own
   shape — remains step 3 of [PLAN-NEXT-FAMILY.md](PLAN-NEXT-FAMILY.md). The
   ground (step 2) is built but parked.

4. **Part 2 of [PLAN-SYNCHRONY-AND-TRUTH.md](PLAN-SYNCHRONY-AND-TRUTH.md)** —
   three status lines that describe an archive instead of what is loaded — is
   still unbuilt and still fully specified.

5. **The curated vernacular-name lookup**, below, is unchanged and ready.

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

1. **Released.** Committed as `bd88553` and live.
2. **Answered.** The "across 428 nights" line was flagged for Lily's judgement;
   she has ruled on it and it is Part 2 of
   [PLAN-SYNCHRONY-AND-TRUTH.md](PLAN-SYNCHRONY-AND-TRUTH.md).
3. **The threshold lands as intended.** Lily, on the loss of 2020-2023: the
   instrument is mostly used to hear the current or past week, and she would
   rather a dozen wonderful nights appeared than scroll years of unknown quality
   guessing which ones play. It is still one constant if that ever changes.

---

## Start here — the flourishes, and telling the truth about what is loaded

Read **[PLAN-SYNCHRONY-AND-TRUTH.md](PLAN-SYNCHRONY-AND-TRUTH.md)**. It carries
the measured diagnosis, the candidate rules with their firing rates, the
per-family gap, and a suggested order. Set by Lily on 16 September 2026.

Two pieces of work.

**One of the flourish layers fires on a rule that means nothing.** The two duet
gestures now always coincide — iNaturalist stores minute precision, so the
five-second window can only be satisfied inside a shared minute — and together
they make a two-layer composite, a low bell with a pad, on every shared minute.
**That composite is the sound Lily likes and the rate is right; neither may
change.** The defect is that 25 of 311 shared minutes get a *second* pad, and
which ones depends on an arbitrary internal labelling: A is whoever appears
first in the file. With Chris as A it fires on 25 minutes; with Lily as A it
would fire on 103 different ones. The fix is not to delete the second pad but to
give it a reason: change the condition from "A holds 2+ records" to "the minute
holds 3+ records". Measured, this loses nothing at all — all 25 currently-doubled
minutes hold 3+ records, so the current set is a strict *subset*. **Zero minutes
lose the fuller sound; 97 gain it**, and duet nights get richer rather than
thinner. A first draft proposed making the flourishes rarer and is withdrawn;
read the plan for why. Then: four of six published families play a generic
`creek`/`pad`, and Gondwana plays one timbre for *both* layers where every other
family plays two.

**Three status lines describe an archive instead of what is loaded.** A fetch
capped at 1,000 reports the API's `total_results` — "the most recent 1,000 of
24,000" — and the line above it says "across 428 nights" when 144 are offered.
Lily: *"I'd like it to say the truth of what it is presenting and what it is
fetching. I don't need a count of what was there and skipped."* This also
settles the open question left by the night-display work.

**Do Part 2 first.** It is small, fully specified, and actively misleading.

The measure of success for Part 1's first step: **nothing is lost, nothing
sounds unfamiliar, and more minutes carry a sound that already exists.** No
minute goes quiet, no new timbre appears, and every sound becomes explicable.
If a duet night sounds thinner after the change, the change is wrong.

---

## Corrected on 16 September 2026 — Gondwana is live

Earlier versions of this file said Gondwana was withheld and unheard. **That was
wrong**, and it was wrong in the file rather than in the code: `ca1b258`
released Gondwana as the sixth published family, and `WITHHELD_VOICE_MODES`
holds only `noctilucent`. Lily has listened to Gondwana many times and it sounds
beautiful.

The carried-forward section below still describes the pre-release state. It is
kept for the design reasoning, which remains the best record of why the first
palette failed, but its "nothing has been judged by ear" framing no longer
applies to Gondwana.

**Noctilucent is the one that is withheld and genuinely unheard.** Lily has not
listened to it, so nothing is known about it. Audition at
`../../sessions/2026-09-13/noctilucent-warm/listen.html`, or in the app with
`?family=noctilucent`. It stays withheld until it has been accepted by ear —
and Part 1 gives it a flourish voice only if it is released.

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

## Standing obligations

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
