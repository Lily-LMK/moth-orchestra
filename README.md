# Moth Orchestra

A portable, single-file biodiversity sonification instrument built around iNaturalist observations. Open `index.html` in a modern browser, load the demo or import a CSV, choose a date and press Play. Internet access is needed for remote observation photographs and API imports; the embedded demo and synthesis are local.

## Development and checks

Node.js 18+ is sufficient for the dependency-free automated suite:

```sh
node --test tests/*.test.cjs
```

The suite executes the actual application functions, checks synchrony and player-control transitions, and compares the musical score to a fixed original reference. Future long-gap-remapping cases are explicitly TODOs, not passing coverage. Browser and listening checks are still required.

For a local preview, run `python3 -m http.server 8000 --bind 127.0.0.1` from this folder and visit http://127.0.0.1:8000. No build step is needed.

## Observation and synchrony rules

- CSV uses `id`, `time_observed_at`, `observed_on`, observer `user_name`, and taxonomic fields. Timestamps should contain an explicit UTC offset or `Z`; offset-free timestamps retain the legacy browser-local parsing behavior and are unsuitable for portable references. Rows without a parseable timestamp or date are omitted by the importer.
- A/B are selected automatically: `User_A` / `User_B` when present, otherwise the first two distinct named observers in chronological order. There is no manual pair picker yet. Other named observers are excluded from the sequencer; the gallery and raw counts can still include them. Unnamed data remains playable without duet gestures.
- A genuine shared minute contains observations from both selected people in the same absolute UTC minute bucket. It does not mean the observations occurred at exactly the same instant. Evidence retains original observation IDs and timestamps, deduplicated by ID within each observer/minute.
- Timeline uses the selected date; Riff applies its inclusive selected clock window, including windows that cross midnight. Riff, focus filtering and displayed times use **Australia/Brisbane (AEST, UTC+10)** independently of the viewer's timezone. Other session timezones are not configurable yet. CSV `observed_on` supplies the date grouping; a cross-midnight Riff window still works within that selected date, not an inferred multi-date night.
- Every mode exposes the same shared-minute evidence after its filters. Song arranges genuine matches in musical time and preserves the original matching accents. Its ordinary accompaniment has a separate event type and neutral dot; it is not evidence of synchrony.
- Timeline/Riff near-simultaneous pulses require original observations within five seconds. They use the nearest B observation for each A observation and deduplicate identical pairs. This rule is independent of loop duration and distinct from same-minute matching.
- Solo playback contains only that observer's notes, with no duet gestures. Switching players rebuilds sound, visual events and evidence together.

## Reference and current work

See `docs/SESSION-2026-09-12.md`. The local project's sibling `reference-2026-09-12` folder holds the untouched baseline HTML, fixed-seed scores, WAVs and screenshots. `comparison-2026-09-12` holds repaired recordings and validation reports. These large local artifacts and the user's CSV export are not part of this repository.

`tools/reference-player.py INPUT_HTML OUTPUT_HTML` creates a test-only player with seed 1, the embedded 28 January sample, 19-second loops, Both players, D pentatonic, Class voices, mixed instruments and no ambience. The capture button renders one loop plus a 2.5-second tail through the app's existing offline audio renderer. `tools/reference-server.py ROOT OUTPUT_DIRECTORY` serves it on loopback port 8767 and saves captures into the explicit output directory. Use separate original/repaired output directories to avoid overwriting a reference.

The score is reproducible. Waveform bytes and animated particle positions are not guaranteed identical because synthesis noise and visual randomness are not fully seeded. Capture files are listening references, not audiovisual recordings or proof of real-device behavior.

## Release

Work on a feature branch and review changes before merging. GitHub Pages publishes the root of `main`; merging there releases the app. This session did not push or publish. Preserve historical standalone HTML files and review unpublished V2 layout changes separately.

Remaining gates include a listening review, real iPhone testing, gap-shortening implementation, broader browser scheduling checks, explicit import omission feedback, and a code licence/data-attribution decision. The API importer is capped and must not be treated as complete observation history. Photos and observation data retain their source licensing requirements.

## Playback stability repair

The second repair pass uses the audio clock for the playhead and visual note crossings, skips obsolete notes after delayed scheduler ticks, and advances to the next cycle when resuming after the last note. Loop-end visual events are now included. Cancelling a pending rebuild prevents it from restarting playback later. Background drawing is explicitly opaque; drawing and pointer hit testing use one display scale, including Present mode.

See `docs/STABILITY-2026-09-12.md` for reproduction measurements and remaining limits. `tools/stability-player.py INPUT_HTML OUTPUT_HTML` produces an instrumented local test copy with a 40-keyboard-remix stress button. It is test tooling, not part of the published app. The existing on-screen Remix button stops/reset playback; the R keyboard shortcut performs a transition during playback. Both behaviors remain unchanged.

## Continue in a new session

Read `docs/NEXT-SESSION.md` for the accepted checkpoint, recommended next deliverable, test expectations and remaining release gates. The next proposed feature is optional Timeline gap shortening, with tests first and original synchrony evidence preserved.
