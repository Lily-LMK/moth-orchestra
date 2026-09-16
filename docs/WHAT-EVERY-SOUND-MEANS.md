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
| `duet_echo` | both recorded the **same taxon** within 30 minutes | both identified the same species that night, close in time | **evidence** |
| `accompaniment` | Song mode's composed rhythm, on non-matching slots | nothing — it is rhythm | **authorship**, and marked so |
| `gond_pedal` | Gondwana's authored harmony on a slow clock | nothing — it is harmony | **authorship**, and marked so |
| `duet_meeting` | the first shared minute of the night | **parked — does not sound** | authorship over evidence |

### `obs` — an arrival

Pitch comes from the taxon, instrument from the voice family and the selected
rank. One note per record, always. This is the instrument.

### `duet_minute` — a shared minute

A low bell, once per minute in which both selected observers recorded. It does
**not** claim simultaneity: iNaturalist stores minute precision, so "the same
minute" is the finest true statement available. 311 of them on the
two-backyards export.

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

### `duet_sync` — the five-second pulse

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

## The rule this page exists to enforce

> Every sound must be explicable by a rule about the night, not by an accident
> of how the data was stored or ordered.

Two tests that hold this, and should not be deleted:

- `both gestures are identical when the observers swap labels`
- `the five-second pulse and its dead dial are gone`
