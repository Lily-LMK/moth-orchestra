# Next session

One "Start here", updated in place. This file had grown three competing ones by
16 September 2026; if it grows a second again, that is the bug. On 19 September
it had instead grown a 120-line tail it called "not a brief" — that tail is now
[HISTORY.md](HISTORY.md), and this file is meant to stay about a screen long.

---

## Standing state — 19 September 2026

**`main` is published at <https://lily-lmk.github.io/moth-orchestra/> and now
carries the Emergence floor.** Pushed at `d049fdd` and confirmed live: the
ambience code is gone from the served build and `setEmergence` is present.

Four branches, each with one job:

| Branch | What it is |
|---|---|
| **`main`** | `d049fdd`, published and live |
| **`frog-yawn`** | The active work. The nested voice mapping and SSAATTBB. Carries `PLAN-FROG-YAWN.md` and `tools/measure-voice-mapping.cjs` and **no workbook audio** |
| **`workbook`** | Parked, **ON HOLD**, never pushed. The explainer, and the 35MB of committed WAV |
| **`emergence-floor`** | Merged into `main`; safe to delete once the live build is accepted |

Six older branches (`voice-registers`, `restore-the-crossing`,
`restore-the-flourishes`, `repair/synchrony-reference`, `moth-orchestra-hero`,
`fix/fetch-replaces-loaded-records`) were fully merged into `main` and were
deleted locally on 19 September. `repair/synchrony-reference` still exists on
`origin` and can go whenever Lily says.

Suite: **470 tests, 461 pass, 0 fail**, 1 documented skip, 8 gap-remapping
TODOs. Run it with `node --test tests/*.test.cjs` from `repository/`.

### What went live on 19 September

- **A real bug fix.** Ambience kept playing after the music stopped. Six code
  paths stop playback; only three stopped the sound. All six now do.
- **All ambience retired** — the five presets and two builders never reachable
  from the interface. 1,085 lines. Five mentions survive, all comments.
- **Emergence, the gallery floor**, in their place, behind `?emergence=1`.
- **Emergence withdrawn as a voice family** — withheld, not deleted, still
  auditionable with `?family=emergence`.

Verified before pushing: the suite, and **the real Play/Pause button driven in a
real browser** — the room starts with the music and is null again after the
teardown. Not verified: anything by ear, on any device.

---

## Settled by Lily, 19 September 2026 — do not reopen these

Three things this repository has repeatedly proposed "fixing" are now decided,
and none of them is a bug:

- **Emergence does not appear in exported audio, and that is intended.** Do not
  wire `buildEmergence()` into `renderOfflineBuffer()`. Earlier notes in this
  file called the omission a gap; she has said plainly that she does not want
  Emergence to export.
- **The default listening rank stays at `taxon_class_name`.** *"We all love that
  it starts at Class and then we can build enrichment by traveling deeper into
  the taxonomy. Class often sounds fabulous too."* Measurements showing that
  class reaches only 2 instruments and 4 pitches on a busy night are not an
  argument against it — depth is the enrichment, not the default.
- **The echo stays loyal to species** and will not follow the rank being listened
  at. Whether its *wording* is accurate is a separate question, deliberately
  deferred: she noted the interface wording is as much mine as hers and wants to
  look at it in a session of its own.

---

# Start here

## 1. The mapping, and Frog Yawn — this is the work

Branch `frog-yawn`. Read **[PLAN-FROG-YAWN.md](PLAN-FROG-YAWN.md)**; its line
references were checked against the current `index.html` on 19 September and are
accurate.

Writing the explainer forced the central mapping to be described honestly, and it
did not survive the description. `hash32(name) % poolSize` discards the taxonomic
tree at the one moment it could be heard. **Measured across 2,344 distinct taxa:
two moths of the same family sit 2.65 voices apart in an 8-voice ensemble, and a
moth and a beetle sit 2.66 apart.** The mapping carries no taxonomic information
whatsoever. `tools/measure-voice-mapping.cjs` produces that table.

Lily: *"Let's bring this into being in the next session with Frog Yawn. Let's put
the explainer on hold until we have something we can defend as data driven."*

The replacement, chosen by measurement over five candidates: each rank in turn
chooses one half of what remains of the ensemble — **order → family → genus**.
Same family lands adjacent 100% of the time, different orders 2.92 voices apart,
a monotonic gradient. It costs a little variety (6.70 of 8 voices on a typical
night against 7.77) and it uses only ranks at or above the listening rank, so
depth still unlocks the ensemble.

Frog Yawn is its first home because **register is a continuum**, so "adjacent
voice" means something to the ear. It goes to **SSAATTBB** by divisi rather than
four invented timbres, after a sound-neutral table refactor (`CHOIR_VOICES`).

**Know before starting: "Frog Yawn" does not exist in the code.** The family's
key is `"choir"` (`index.html:2494`); "Frog Yawn" is only a display label
(`:2514`). Same for `night` → "Boobook" and `steelpan` → "Fireflies".

Two standing decisions: **organum** implemented but defaulting off, for audition;
**no reverb in the first build**, so she hears the voices dry first. Two things
need her word rather than a measurement — the roster weighting she chose on 19
September is **superseded** by the new mapping (there is no pool left to weight),
and at class rank the mapping yields **one** choir voice where today it reaches
about two.

It stops at a listening gate. Frog Yawn is published, so the dry eight voices go
to her ear before the room, before organum, and before any merge.

## 2. The explainer is ON HOLD

`workbook/index.html` is committed, working and accurate about everything except
the thing it most needs to be right about. **Do not show it, publish it or extend
it** until the mapping above exists. Her reason is the correct one: it should not
teach an arbitrary assignment as though it were meaningful. It is paused, not
wrong — see `SESSION-2026-09-19-WORKBOOK-DRAFT.md` on the `workbook` branch.

**Its 35MB of committed WAV is an open question**, deliberately kept off every
other branch until Lily decides. Every other large file in this project lives
outside the git tree. It costs nothing while `workbook` stays unpushed.

## 3. Fix the `chime` clamp — still outstanding, still decided

Carried from 17 September and still the smallest real task in this file. `chime`,
in Moth Orchestra, uses `Math.min` where it needs a fold: 166 of 526 chime notes
across 144 nights are flattened onto B4, giving 56 taxa a pitch that is not their
own. The fix is one entry in `VOICE_REGISTERS` and one call to `voicedFreq`.

Measured, so it is not left as a guess: **220–494 Hz** is the register to start
from — seven distinct pitches rather than the five that 247–494 gives, fewer
notes moved, median unchanged. The trade-off to put to her rather than decide:
the clamp yields *ten* distinct sounding pitches because it piles 199 notes onto
B4, so folding trades three distinct pitches for the guarantee that no note is
ever given a pitch its taxon did not have.

It changes Moth Orchestra, so it needs her ear, and
`tests/musical-reference.test.cjs` **will fail** when it lands — correct, and the
fixture must not be regenerated to silence it.

## 4. The curated vernacular-name lookup — build-ready, blocked on nothing

The only outstanding task that touches **words rather than sound**, which makes
it the one to pick up when her ear is not available. Fully specified below.

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
  may be inaudible in context. Her ear, with isolated clips. Do not change that
  level on measurement alone.
- **`moth_ground`** belongs to the withheld Emergence *family* now, and its
  level (0.115) is still the guess it always was. Only reachable via
  `?family=emergence`.
- **The offline render has no limiter.** Rendering the class-rank loop peaked at
  1.245 — the live chain limits, `renderOfflineBuffer` does not, so an export can
  clip where playback does not.

---

## Standing obligations

**No real-device test of anything, ever.** Every judgement to date is
headphones and a laptop. Say so rather than implying otherwise.

**Emergence is live and not settled.** That is Lily's decision, taken
explicitly, with Moth Orchestra left intact as the safeguard. Do not treat it
as accepted.

**Lily writes the copy, or approves it.** She has corrected interface sentences
for sounding machine-written. Hand prose over as a draft and expect it to change.

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

And one from 19 September:

> **Pin what varies between the script that finds an example and the script that
> renders it.** `state.seed` defaults to `Date.now()`. An unpinned render script
> silently broke its own "same instrument" claim between finding an example and
> rendering it — the pipeline worked, the audio was valid, and the caption was
> false. Caught by rereading the manifest, not by ear.

---

## Ready and fully specified — the curated vernacular-name lookup

Agreed with Lily on 16 September 2026 after the import repair
([SESSION-2026-09-16-IMPORT.md](SESSION-2026-09-16-IMPORT.md)), refined by her
the same day. **Build-ready and blocked on nothing** — it is below the tasks
above only because she set those, not because it is less finished. It is an
afternoon of careful naming and no new machinery.

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

Older, finished briefs and superseded reasoning: [HISTORY.md](HISTORY.md).
