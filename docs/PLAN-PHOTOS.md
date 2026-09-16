# Plan — photographs that arrive when their note does

Raised by Lily, 16 September 2026:

> We need to look at how photos are loading. They're not loading fast enough
> and so we often see the same species appearing to sound out. We need to
> reload or download these images before first play and have them ready to
> flash up when it's their turn. In some instances a loop might last 10 seconds
> but expect 100 species to flash in quick succession. We need to make this
> possible.

Measured before proposing anything.

---

## The cause, measured

The centre card assigns the photograph **at the moment the note sounds**:

```
const img = $("selImg");
img.src = url;            // index.html, applySelectionFromEvent
```

A browser keeps painting the previous image until the new one has been fetched
and decoded. So the card shows the *previous* animal for as long as the next
one takes to arrive.

How long that is, measured against the real iNaturalist CDN:

| | |
|---|---|
| `medium.jpg`, one photo | **215 KB, 1.90 s** |
| `square.jpg`, same photo | **9.6 KB, 0.76 s** |

And how long a note lasts:

| Case | Records | Per record |
|---|---|---|
| Busiest offered night (2026-09-03), 19 s loop | 136 | **140 ms** |
| Lily's stated case, 10 s loop | 100 | **100 ms** |

> **A photograph takes between 14 and 19 times longer to arrive than the note
> it belongs to lasts.**

That is the entire defect. In 1.9 seconds at 140 ms a note, **thirteen further
records sound** while the card still shows the first one's animal. It is not
that the same species is sounding repeatedly — it is that one photograph is
being held across fourteen different species.

99.8% of records on offered nights carry a photo (5,408 of 5,420), so this is
not an edge case; it is what the instrument looks like.

## Why this is worse than a cosmetic lag

The centre card shows a photograph **beside a species name**. When the photo
lags, the card pairs one species' name with another species' animal. For an
instrument whose whole discipline is that derived data must be inspectable and
true, that is a false claim on screen, not a slow frame.

**Rule: the card must never show a photograph that does not belong to the
record it names.** If the right photo is not ready, show no photo. An empty
frame is honest; the wrong animal is not.

## The fix, in three parts

### 1. Ask for the right size

iNaturalist serves size variants at the same path — `square` (75 px), `small`
(240 px), `medium` (500 px), `large` (1024 px). The app requests `medium`
everywhere, including for 48-pixel thumbnails.

| Surface | Now | Should be | Per-photo |
|---|---|---|---|
| Thumbnail grid (48–52 px) | `medium` | `square` | 215 KB → **9.6 KB** |
| Centre card | `medium` | `medium` | unchanged |

For the busiest night that is **29 MB → 1.3 MB** for the grid. This alone is
most of the win, and it is a URL substitution.

Guard it: only rewrite URLs that match the known iNaturalist photo pattern,
and fall back to the original string otherwise. A CSV can carry any URL.

### 2. Preload the night, before first play

On night change, fetch and **decode** every photo for that night into an
in-memory cache, so that assignment at play time is a paint and not a network
round trip. `img.decode()` rather than `onload`: decode guarantees the frame
can be painted on the next tick, which is the actual requirement.

- Bounded concurrency (6–8 in flight). 136 images at full parallelism is
  hostile to the CDN and slower in practice.
- **Cancellable.** Changing night mid-preload must abandon the old queue, or a
  fast scrub through dates queues thousands of fetches.
- Cache keyed by URL and shared across nights, with a cap (say 400 entries,
  evicted oldest-first) so a long unattended gallery session does not grow
  without bound.
- Progress reported, because 136 photos on a slow connection is not instant
  and the Play button should be able to say so.

### 3. Never paint a stale frame

The centre card reads from the cache only:

- Hit, decoded → assign and show.
- Miss → show the no-photo state, and let the preload fill it in for next time.

This is what makes part 2 a performance improvement rather than a correctness
fix: even with an empty cache the card is never *wrong*, only sometimes empty.

## What to decide before building

1. **Does Play wait?** Either the Play button reports "Preparing photographs,
   64 of 136" and enables when ready, or playback starts immediately with
   empty frames that fill in. For an exhibition running unattended the first
   is better; for Lily at the moth sheet the second is. Probably: start
   immediately, but preload on night selection so it is usually done by the
   time she presses Play.
2. **How much to hold.** 136 `medium` photos is ~29 MB. On a gallery machine
   that is nothing; on a phone it is not. A cap, or `square` on small screens.
3. **Offline.** A gallery machine that loses its network shows no photographs
   at all. Worth knowing whether the exhibition will be online before deciding
   whether that matters.

## How to check it

- A test that the URL rewrite produces `square` for thumbnails and leaves
  non-iNaturalist URLs alone.
- A test that the centre card, given a cache miss, shows the no-photo state
  rather than the previous record's photograph. This is the honesty rule, and
  it is the one that must not regress.
- A test that changing night cancels the outstanding queue.
- Then **watch a dense night play** — 2026-09-03, 136 records — and confirm the
  animal on the card changes with every note. That is the thing that is wrong
  now, and only watching it proves it fixed.
