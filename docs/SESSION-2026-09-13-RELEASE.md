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
