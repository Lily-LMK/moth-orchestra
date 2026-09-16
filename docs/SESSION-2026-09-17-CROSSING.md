# Session — the crossing restored, and the explainer rewritten

17 September 2026. Released to `main`.

## What happened

Lily sent a screenshot from `moth_orchestra_V2.html` — 2026-09-08, species
rank — showing wide brown rings around the outer edge, and asked: *"Those brown
circles are gone. We've also lost the fabulous sound they make. Was this the
five second pulse that you removed? Is there a rules-based way to bring it
back?"*

Yes, and the history is the useful part. **V2 was run directly** to settle it
rather than reasoning from the diff.

### The gesture was lost in two steps, and only the second was this project's doing

| | Tan rings on 2026-09-08 |
|---|---|
| V2, March 2026 — loop-seconds rule | **32** |
| After the repair to real observation seconds | **6** |
| After `duet_sync` was removed, 16 September | **0** |

**V2 compared positions in the loop, not in the night:**

```js
const d = Math.abs(b.atSec - a.atSec);   // loop seconds
if(d > win) break;                        // "within 5 seconds"
```

A twelve-hour night compressed into nineteen seconds makes five loop seconds
about **three hours** of real time. The gesture never marked simultaneity, and
how often it fired changed with the loop length. It was beautiful, and it was
detecting something real — the two of them working the same stretch of the
night — but not what its name or its code claimed.

Repairing it to real seconds was correct and killed it: minute precision
collapsed it onto the shared-minute rule. Removing the remainder went **too
far**, and that was this project's error: the plan for that session said the
bell-and-pad composite "is the sound Lily enjoys … and should be kept exactly
as it is", and only the *doubling* was inexplicable.

### The crossing

> Two records **adjacent in time**, from **different observers**, within
> `DUET_CROSS_WINDOW_MIN` (2) minutes.

Adjacent-in-time makes it symmetric — a pair has no direction — and
self-deduplicating, since each adjacent pair is considered exactly once. Real
minutes make it independent of loop length, which is V2's defect and now has
its own test.

Measured: **790 crossings across 55 nights.** 315 (40%) fall inside a shared
minute, restoring the composite; **475 are moments nothing marked before**,
where the two alternated across a clock-minute boundary. On 2026-09-08: 17
against V2's 32, the same pad at 164.8 Hz, the same ring at radius 10.5 and
weight 3.0, identical at loop lengths 3, 19 and 120.

**Accepted by ear by Lily and released.**

Fixed in passing: the written pitch now equals the sounding pitch. `duet_sync`
recorded `midi:pitch.midi` while sounding an octave below, so an exported score
stated two pitches for one note.

### The explainer

The "Shared minute evidence" disclosure described rules that had changed and
listed every observation with a link to iNaturalist. Lily asked for prose: the
rules in one paragraph, an overview of the night in another, no links.

It is now **"What you are hearing"** — all three gestures explained in plain
sentences with their real windows, the limit of what they claim, and then the
night itself: records, observers, the span of the evening, the counts of each
gesture, and the species both of them found. Solo, Song and Riff each change
what it says. Eleven tests drive the real function and read the composed text.

Observation ids are not lost — they remain on every event and in the CSV
export. They are simply not what that panel is for.

## Verification

Suite **378 pass, 0 fail**, 1 skip, 8 TODO.

Heard and seen by Lily before release: the crossing, and the explainer.
Unheard: `GROUND.mixes.gallery`. No real-device test.

## The lesson worth carrying

Three gestures have now been got wrong in the same way: a rule that fires on
something real but describes itself as something else. V2's pulse claimed
seconds and measured loop position. `duet_sync` claimed rarity and fired on
every shared minute. The meeting claimed a moment and delivered a volume.

**Before adding a gesture, measure how often it fires on real data, and check
that the thing it fires on is the thing its name says.**
[WHAT-EVERY-SOUND-MEANS.md](WHAT-EVERY-SOUND-MEANS.md) exists to make that
cheap, and is the first page to update when a sound changes.
