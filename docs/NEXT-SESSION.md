# Next session — useful improvements without losing the music

## Starting point

Lily's latest feedback: **“this is good. let's commit and plan for a new session where we work on useful next steps.”** She approved the repaired sound and then the stability improvements. Treat the present musical character as accepted; real-device acceptance and release remain separate.

Project folder: `/Users/lilykumpe/Documents/Claude/Moth Orchestra`
Maintained checkout: `/Users/lilykumpe/Documents/Claude/Moth Orchestra/repository`
Branch: `repair/synchrony-reference`
Application checkpoint: `945405e` — Prevent playback catch-up bursts and stabilize canvas rendering.
Earlier commits: `172d01f` synchrony/evidence; `e7362ca` initial tests/reference tooling.

All work belongs in this project folder. No push, merge or deployment has been requested. The local preview server on port 8767 may no longer be running; do not assume its URL works in a new session. The app can be opened directly or served locally from the checkout.

Before editing: read this file, README, PLAN and STABILITY notes; inspect branch/status and run `node --test tests/*.test.cjs`. Expected checkpoint: 72 pass, eight TODOs. Preserve unrelated changes if any have appeared.

## Recommended next deliverable: shorten long Timeline gaps

Make whole-night listening more useful while preserving the current Riff and Song experience. Keep this session focused on one reviewable feature.

1. Select a sparse and a busy date from `../observations-780797.csv` as listening examples. Keep the raw export unchanged. It has 6,760 records, including four without timestamps; 6,756 timed records span 427 dates. Do not invent the missing times.
2. Turn the eight gap-remapping TODOs into executable failing tests. Cover below/exactly/above one hour, multiple gaps, midnight crossings, empty/single inputs, order, disabled behavior, Riff unchanged and invariant shared-minute evidence.
3. Add a small pure time-mapping function with separate original and performance timestamps. Gaps strictly greater than one hour receive a brief pause; preserve proportional spacing inside active stretches before fitting to the loop. Matching must continue to use original timestamps and selected observers.
4. Add an optional **Shorten long gaps** control for Timeline, off by default. Provide a subtle indication where time was shortened. Make labels, keyboard operation and narrow-screen layout clear. Keep Riff and Song behavior intact.
5. Prototype the retained pause duration using those two listening examples; document the provisional choice rather than treating it as permanently settled. Check both sparse and busy nights with Lily.
6. Run the full suite, verify original mode with the option off, exercise controls during playback, inspect loop boundaries and compare sound. Save a concise before/after note and commit the feature separately.

A useful implementation boundary is a pure observation-to-performance-time mapper, separate from matching, composition and rendering. Introduce only the structure this feature needs. A large module/framework conversion would add risk before delivering this benefit.

## Following priorities

- **Make imports explain themselves.** Show imported/omitted counts and reasons, especially the four records without timestamps. Clearly distinguish raw date/gallery counts from playable records. Validate the actual CSV import UI, not only the parser/builders.
- **Broaden stability checks.** Use Lily's actual browser/device and preferred Riff/voice/ambience settings, the new export and longer sessions. Test rapid changes, pause/restart, seeking, tab suspension, Present mode and real iPhone behavior. The previous browser stress run was embedded sample + Song + mixed voices + no ambience; it is not comprehensive.
- **Check export headroom.** Original and repaired Song WAVs reached the PCM limit at full master volume. Isolate export and live-output behavior, test a conservative fix, and compare timbre/loudness before changing the accepted sound.
- **Prepare a release review.** Review the feature branch, decide on pushing/PR, then decide separately about merging main (which publishes Pages). Handle licence/photo attribution and any useful V2 changes deliberately.

Manual observer selection, configurable session timezone, a rehearsal seed/settings control and deeper separation of the audio engine are candidates after the focused next deliverable. Do not bundle them into a mandatory rewrite.

## Reference locations and guardrails

- `../reference-2026-09-12/`: untouched initial baseline, original WAVs/scores/screenshots, first red results and export profile.
- `../comparison-2026-09-12/`: first synchrony-repair recordings and validation.
- `../stability-2026-09-12/`: pre-stability app copy, reproduction reports, stress tooling outputs and current test results.
- `../reference-comparison.html`: listening comparison page; its WAVs preserve the first repair comparison, while its app link opens the current checkout.
- `tests/fixtures/original-scores.json`: self-contained regression reference; do not regenerate merely to make a changed musical score pass.

Do not overwrite historical captures when creating new ones. No aesthetic redesign is agreed. The original parent-folder vision and assessment documents remain historical context; this tracked plan supplies the current status.

## Suggested opening request

Continue Moth Orchestra from `repository/docs/NEXT-SESSION.md`. Implement the optional Timeline “Shorten long gaps” feature with tests first, preserve the accepted sound and original synchrony evidence, and save all work in the Moth Orchestra folder. Keep this session focused and provide a listening preview before considering release.
