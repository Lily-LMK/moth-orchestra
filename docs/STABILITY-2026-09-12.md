# Playback and rendering stability — 12 September 2026

Lily approved the sound of the first synchrony repairs but reported incorrectly rendered notes, worsening sound during continued playback or repeated remixes, and flashes of the dark background. This pass preserves that musical score and repairs reproduced timing/rendering failures. It is not a full aesthetic redesign or a claim of festival readiness.

## Reproduced causes

1. Resuming after the score's last event left the scheduler at event zero in the old cycle. It sent earlier notes to the synthesizer with timestamps in the past; the synthesizer moved those notes into the present, creating a burst. Keyboard remixes and other soft transitions can resume in that gap.
2. A delayed scheduler tick replayed every missed cycle in an unbounded catch-up loop. It now seeks the current window and skips obsolete history.
3. A pending rebuild callback could restart playback after a hard reset. Reset/close now cancels that transition; pressing the play control during a transition cancels it.
4. Particles changed canvas global opacity without restoring it. The next frame's background inherited the final fading particle's opacity. The background is now explicitly opaque and particle drawing restores its paint state.
5. Present mode painted at display scale 1 but pointer hit testing resized the canvas using physical screen density. Pointer movement could repeatedly clear the backing store. Drawing, hit testing and ring offsets now share one scale policy.
6. Modulo playhead traversal skipped events at the loop's exact endpoint. Absolute-time event crossing now handles outgoing endpoint and incoming zero events once each. It drops visual history older than 250ms after stalls rather than replaying it in a burst.
7. The visual playhead formerly advanced on wall-clock time independently of the audio clock. It now follows the audio scheduler clock; dragging it realigns the scheduler as well.

## Tests and evidence

- Nine failing playback/rendering regressions were recorded before repairs: three playback failures and six rendering failures. Red TAP files are in `../stability-2026-09-12`.
- Final automated suite: **72 pass, zero fail, eight TODOs** for the separate future long-gap feature.
- Additional tests cover paused/running seek, audio/wall-clock divergence, suspended audio, exact endpoint scheduling, repeated scheduler starts, rapid transitions, empty scores, and reset during transition.
- Existing synchrony and musical-reference suites still pass. No instruments, pitches, event-score timing or original Song velocities were changed.
- Instrumented browser, embedded sample, Song, default mixed voice family, no ambience, 19s loop: 40 keyboard remixes through the existing R shortcut.

| Measurement | Before repair | After repair |
|---|---:|---:|
| Keyboard remixes completed | 40 | 40 |
| Notes submitted late (>1ms) | 82 | 0 |
| Worst early-version note lateness | 18.46 seconds | No late notes |
| Background draws with unintended transparency | 2,542 | 0 |
| Recorded page errors | 0 | 0 |

The original snapshot was read at approximately 21 seconds of audio-context time. The repaired run remained clean through a later 88-second reading (352 scheduled notes and 10,564 opaque background draws). Counts reflect those particular runs, not a deterministic benchmark. Separate raw JSON reports preserve the readings. The first exploratory test used the on-screen Remix button and therefore stopped playback; it confirms background opacity leakage but is **not** the live-remix comparison. The valid comparison uses keyboard R for both versions.

Saved test HTML includes a visible diagnostics panel and no third-party telemetry. `before.html` preserves the app at the start of this pass. Browser screenshots and longer-playback readings are in the same stability folder.

## Limits and next direction

These changes address concrete reproduced causes; they do not prove that every reported sound problem is resolved on Lily's device/settings. No real iPhone test, device-specific memory profile, exhaustive voice/ambience soak, or subjective listening acceptance was performed. Existing full-volume Song export headroom/clipping remains a separate known issue. No accumulating audio-node leak was established, so this pass does not claim to repair one.

If degradation persists, capture the exact mode, voice family, ambience, data/date, device/browser and time-to-failure; test those settings next. A useful next architectural step is to separate the observation matcher, score builder, transport/audio engine and renderer behind explicit contracts while retaining the portable single-file delivery. A framework or aesthetic rewrite is not supported by the current evidence.

All work stays in Moth Orchestra. Nothing is pushed or deployed. Original reference WAVs remain unchanged; the preview at `repository/index.html` contains the stability repair.
