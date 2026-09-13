# Gondwana — the palette

Step 1 of the five in [PLAN-NEXT-FAMILY.md](PLAN-NEXT-FAMILY.md). Built
13 September 2026. **Not accepted.** Withheld from the published instrument.

Audition: `../../sessions/2026-09-13/gondwana/listen.html`
(`python3 serve.py` in that folder, then http://127.0.0.1:8774/listen.html —
the browser will not load the WAVs over `file://`).

## What was built

Fifteen authored voices, named for their physics. Where a body has real,
measurable mode ratios, those ratios are used rather than approximated:

| Body | Ratios |
|---|---|
| struck skin | circular membrane — 1, 1.593, 2.135, 2.295, 2.653 |
| struck metal bar | free–free bending — 1, 2.756, 5.404, 8.933 |
| blown stopped tube | odd harmonics only — 1, 3, 5, 7, 9 |
| struck stiff string | n·√(1+Bn²), B = 8×10⁻⁴ |

The rest — stone, log, rim, vessel, gourd, air, shell, reed, ice, cave, thread
— are authored stretches in the spirit of those bodies. Nothing is a recording.
Nothing claims anything about the animals in the data.

## The one structural difference from every earlier family

Gondwana is **rank-graded**. Moth Orchestra's palette grows with rank;
Lantern Glass, Boobook, Frog Yawn, Fireflies and Noctilucent are flat lists
that spend everything they have immediately. Gondwana grows: 7 voices at class
through family, then 9, 11, 13, 15.

Rank is also a parameter of the synthesis itself, as §1 of the plan asked.
`gondwanaArticulation(depth)` shortens every attack by up to a quarter and
lifts the upper partials as the rank deepens, so a species-rank night is more
articulate and more clearly struck. It never moves the scored fundamental —
there is a test for exactly that.

## Measured, 3 September 2026, seed 1, Timeline, D pentatonic

136 records, 118 voice groups at species, 22 shared minutes.

| Rank | Voice groups | Moth Orchestra | Gondwana | Distinct pitches |
|---|---|---|---|---|
| class | 2 | 2 | 2 | 4 |
| order | 10 | 6 | 6 | 11 |
| superfamily | 33 | 7 | 7 | 15 |
| family | 48 | 7 | 7 | 15 |
| subfamily | 73 | 8 | **9** | 15 |
| tribe | 87 | 9 | **11** | 15 |
| genus | 113 | 10 | **13** | 15 |
| species | 118 | 11 | **15** | 15 |

Two things fall out of this.

**The January finding reproduces on a different night.** Distinct pitches stop
moving at superfamily and stay at fifteen all the way down. Depth of rank buys
timbre, not melody. That was measured once on 28 January; it now holds twice.

**The palettes are identical until subfamily** — not because the palettes are
the same, but because the night has too few voice groups before then to ask for
more. A palette can only be as rich as the night is specific.

Species-rank-only voices: Gondwana has two (`gond_cave`, 13 notes;
`gond_thread`, 11), against Moth Orchestra's one (`bowl`, 16). Two sustaining
resonant bodies arriving at species rank, which is the shape of the sweetness
identified in §1 of the plan.

## Audio checks

Offline renders, 21.5 s, 44.1 kHz stereo. No non-finite samples anywhere.

| Render | Peak | dBFS |
|---|---|---|
| Moth Orchestra, species, note level as reference | 0.281 | −11.0 |
| Gondwana, species, same | 0.254 | −11.9 |
| Palette walkthrough, 15 voices × D3/D4/D5 | 0.282 | −11.0 |

Per-voice audibility across the register, the failure mode this project has hit
before: **no dropouts.** Every voice holds its level within about 1 dB from D3
to D5; the only drift is `gond_cave` losing 4 dB at D5, which is what a large
cavity should do. Peak spread across the fifteen at D4 is 5.4 dB
(`gond_vessel` −11.0 loudest, `gond_thread` −16.4 quietest). RMS spread is
wider (13.2 dB) because a struck body has less average energy than a sustained
one over a fixed window — that difference is real, not a gain-staging fault.

## Tests

`tests/gondwana.test.cjs`, written before the synthesis existed. 74 tests.
Suite total: 238 tests, 229 pass, 0 fail, 1 documented skip, 8 gap TODOs.
Nothing in the existing suite changed.

Covered: registry and labels; the rank ladder is exactly 7/9/11/13/15; Gondwana
is at least as large as Moth Orchestra at every rank and strictly larger at
species; deterministic selection with no observer dependence; shallow ranks
select only from the shallow palette; score parity with Moth Orchestra in
Timeline and Riff (timing, pitch, density, source identities, shared minutes and
every special gesture preserved); Song orchestration with creek shared minutes
carrying exact source evidence; empty scores silent; and, per voice — finite
envelopes, bounded gain, a path to master, all sources stopped and every
temporary node disconnected, silence on invalid pitch or amplitude, partials
omitted at or above 45% of sample rate, distinct timbres, and rank articulation
that never moves the scored pitch.

## What has not been done

No listening judgement. No real hardware. No room. The floor (§3, generated from
the night's own shape) and the ground (§3, the body-felt sub on its own bus) are
not built — this is the canopy alone. Steps 2 through 5 are unstarted.

Lily's playback for this audition is headphones only, so nothing below about
45 Hz can be judged yet, and the Gallery mix remains unheard by anyone.

## Tools added

`tools/audition-render.cjs`, `audition-ladder.cjs`, `audition-palette.cjs` —
headless offline renderers driving the application's own `OfflineAudioContext`
path. They need Chromium and Playwright, which the Mac does not currently have;
they ran in the cloud workspace. They replace the hand-clicked capture button
used for the Lantern Glass and Noctilucent auditions.
