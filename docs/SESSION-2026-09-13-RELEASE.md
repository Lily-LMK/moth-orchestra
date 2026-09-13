# Release pass — Lantern Glass goes live, 13 September 2026

Lily's decision this session: publish Lantern Glass only; hold Noctilucent
back until it has been accepted by ear. Interface work is deliberately split
in two — blocking faults repaired and released now, a designed interface as a
separate reviewable pass. Sound and score behaviour are unchanged.

## What changed

**Lantern Glass is the published fifth family.** `PUBLIC_VOICE_MODES` now
drives the dropdown, keyboard cycling and swipe cycling; `VOICE_MODES` remains
the full registry. Noctilucent's eight voices and their 41 tests are untouched
and still reachable — it is withheld from the listener, not removed.

**The wand now auditions genuine shared minutes.** `scrubEventsBetween` was
specified by the previous session's tests and never written; the drag handler
was doing its own filtered loop that skipped every special event, so dragging
the playhead across a shared minute was silent. It now auditions real arrivals
and genuine shared minutes, excludes composed accompaniment, arrangement-only
sync gestures and echoes, respects solo, keeps an open-start/closed-end window
so a stationary playhead is silent, suppresses jumps over a quarter of the
loop as seeks rather than sweeps, and caps a sweep at four notes with genuine
shared minutes kept first. Velocity, timing and the discontinuity guard are
the previous behaviour, unchanged.

**Riff controls no longer collide with the Full screen button.** Both were
absolutely positioned in the same top-right corner at the same z-index. On a
1440px desktop the Out field was underneath the button; at 390px the whole bar
sat on top of the mode pills. Riff now sits below that row, wraps, and is
bounded to the viewport. Verified in a real browser at 1440x900 and 390x844:
no overlap with the button or the pills, nothing past the right edge.

## Checks

155 pass, zero fail, one documented skip, eight pre-existing gap TODOs.

Two failures inherited from the previous session were repaired rather than
carried:

- The fixed-seed baseline scores failed on a one-unit-in-the-last-place
  frequency difference (739.9888454232689 against ...688). `Math.pow` is
  implementation-approximated in ECMAScript, so this varies by engine; it is
  about 1e-13 Hz. Frequencies are now compared to a micro-hertz and the midi
  number is still compared exactly. The fixture is unchanged and nothing else
  in the score is relaxed.
- `Emergence Song distinguishes genuine shared-minute audio from composed
  accompaniment` is skipped with its reason recorded. It expects a separate
  `creek_shared` voice for genuine minutes in Noctilucent while Lantern keeps
  `creek`. That was never designed for the other families and it would change
  an accepted sound, so it is a listening decision, not a test to force green.

## Not done, and known

No listening review was performed this session and none is claimed. No real
device testing. The exhibit and interface redesign is the next pass.

One visual fault found and deliberately left alone: shared-minute markers are
drawn at a fixed 0.93 of the base radius while ordinary notes sit between 0.55
and 0.93 by voice index. At Class rank on the demo night there is one voice
group, so every arrival collapses onto the inner ring and the shared-minute
markers float far outside it, reading as unrelated debris rather than as the
moment two people saw something in the same minute. Repairing this changes a
ring convention the roadmap says not to change silently, so it belongs to the
interface pass with Lily's eyes on it.

Precision policy, the coarse date diamond, observer sound identity, composition
save/reopen and gap shortening all remain as the roadmap has them.

---

# Interface pass — same day

Lily's brief: one interface that resolves at three sizes rather than shrinking
— an exhibition screen read at a distance, her laptop while she performs it,
and a phone held one-handed in the dark at the moth sheet. Sound and score
untouched; 155 pass, zero fail, throughout.

## The circle

`ringRadius()` and `baseRadius()` are now the single source of ring geometry.
The formula was previously written out in six places across drawing and
hit-testing, which is how they were free to disagree.

Two deliberate visual changes, both departures from the previous convention
and both recorded here rather than made quietly:

- Voice groups now spread between 0.58 and 0.95 of the base radius, and a
  **single** group sits on the outer ring instead of collapsing to 0.55. At
  Class rank on the demo night there is one group, so every arrival used to
  land on a small inner ring while the shared-minute markers sat at a fixed
  0.93 far outside it — reading as unrelated debris rather than as the moment
  two people saw something in the same minute.
- Shared minutes now ride at 1.04, just outside the arrivals, so the halo
  reads as enclosing the night. The sweep line was extended to 1.09 to pass
  beyond them.

The base radius is `min(w*0.42, h*0.35)`. On a wide screen height is the
constraint and this is exactly the previous rule; on a portrait phone the
width becomes the constraint and the ring grows by about a sixth instead of
staying pinned to the short-side rule.

## The legend

A new, always-available key names the two observers, the plain and outlined
dot, the shared-minute halo, and the colour-and-distance rule, using the rank
actually selected. Its swatches are neutral because the app colours dots by
taxonomic group — an earlier draft of this legend showed fixed colours and was
simply lying about what was on screen. Open by default at 768px and above
where an audience reads it; collapsed to a one-word tab on a phone, one tap
from open.

This is part of Milestone 3, arriving early because it is also what most made
the screen look accidental.

## The control column

Rebuilt as six named groups — the night, play, tuning, atmosphere, what you
are hearing, records — in the order the decisions are actually made. Every
inline style in that markup is gone; a design layer at the end of the
stylesheet carries it. Play is a primary action in the QM green rather than
another grey rectangle among nine. Both/A/B is a real segmented control with
the observer accent under the active side. Loop length gained the value
readout the volume slider already had. Stats are tabular and legible. The
wordmark is no longer printed twice in one column.

Riff's window controls and the Full screen button no longer occupy the same
corner, and on a phone the window is a compact two-up block instead of a
130px stack sitting over the mode pills.

Focus rings, 44px touch targets on small screens, and a reduced-motion rule
were added along the way.

## Verified, and not

Rendered and measured in a real browser at 1920x1080, 1440x900 and 390x844:
no element overlap, no horizontal scroll, legend and readouts populating from
live state, no console or page errors. That is layout evidence.

Not verified: any of this on physical hardware, on the actual exhibition
display, or by anyone's ear. No listening review was performed. The gallery
and Present mode were not re-examined under the new layer.
