# Moth Orchestra

Start with [the sonification design reference](docs/SONIFICATION-DESIGN.md) for the purpose, data-to-music rules, current limitations and proposed next steps.

A portable, single-file biodiversity sonification instrument built around iNaturalist observations. Open `index.html` in a modern browser, load the demo or import a CSV, choose a date and press Play. Internet access is needed for remote observation photographs and API imports; the embedded demo and synthesis are local.

## Development and checks

Node.js 18+ is sufficient for the dependency-free automated suite:

```sh
node --test tests/*.test.cjs
```

The suite executes the actual application functions, checks synchrony and player-control transitions, and compares the musical score to a fixed original reference. Future long-gap-remapping cases are explicitly TODOs, not passing coverage. Browser and listening checks are still required.

For a local preview, run `python3 -m http.server 8000 --bind 127.0.0.1` from this folder and visit http://127.0.0.1:8000. No build step is needed.

## Observation and synchrony rules

- CSV uses `id`, `time_observed_at`, `observed_on`, observer `user_name` (falling back to `user_login` or `user_id`), and taxonomic fields. Timestamps should contain an explicit UTC offset or `Z`; offset-free timestamps retain the legacy browser-local parsing behavior and are unsuitable for portable references. Rows without a parseable timestamp or date are omitted by the importer.
- Observer **identity** and observer **display name** are separate. `user_login` is read into `userLogin` and is what merging matches on; `userName` remains the display name and still decides the A/B pair. An iNaturalist export carries "Lily Kumpe" in `user_name` and "lily_kumpe" in `user_login`, and the API reports only the login, so collapsing the two would split one observer in two. The bundled demo has no login column and therefore cannot be topped up.
- A/B are selected automatically: `User_A` / `User_B` when present, otherwise the first two distinct named observers in chronological order. There is no manual pair picker yet. Other named observers are excluded from the sequencer; the gallery and raw counts can still include them. Unnamed data remains playable without duet gestures.
- A genuine shared minute contains observations from both selected people in the same absolute UTC minute bucket. It does not mean the observations occurred at exactly the same instant. Evidence retains original observation IDs and timestamps, deduplicated by ID within each observer/minute.
- Timeline uses the selected date; Riff applies its inclusive selected clock window, including windows that cross midnight. Riff, focus filtering and displayed times use **Australia/Brisbane (AEST, UTC+10)** independently of the viewer's timezone. Other session timezones are not configurable yet. CSV `observed_on` supplies the date grouping; a cross-midnight Riff window still works within that selected date, not an inferred multi-date night.
- Every mode exposes the same shared-minute evidence after its filters. Song arranges genuine matches in musical time and preserves the original matching accents. Its ordinary accompaniment has a separate event type and neutral dot; it is not evidence of synchrony.
- Timeline/Riff near-simultaneous pulses require original observations within five seconds. They use the nearest B observation for each A observation and deduplicate identical pairs. This rule is independent of loop duration and distinct from same-minute matching.
- Solo playback contains only that observer's notes, with no duet gestures. Switching players rebuilds sound, visual events and evidence together.

## Importing: CSV, Fetch and Top up

Three ways in, meant to be used together.

- **Import CSV** replaces the loaded records with an iNaturalist export and resets the Riff window to 00:00–23:59 Brisbane, so a new dataset never inherits the demo's narrow window.
- **Fetch** pulls from the API for one or two usernames, newest first, up to **Cap**. The cap is a deliberate choice — lowering it to 1,000 is how you hear the current week rather than a whole history — so the status line reports the fetched count against the true total and never implies completeness.
- **Top up** extends what is already loaded. It reads each observer's login from the records, finds how far that observer's data reaches, and fetches only from two days before that point. It is enabled only when the loaded records carry logins.

Why two days: iNaturalist filters by whole observation dates (`d1`), and the newest record held on a night is rarely that night's last arrival, so an exact boundary would drop the rest of a part-imported night. The overlap reconciles by observation id, so re-fetched records cost a little time and change nothing.

Records already held are refreshed, so identifications corrected upstream since the export arrive. Observer identity is taken from the record already held, not from the API, which knows only the login.

A top-up **does not** reset the Riff window; unlike a fresh import it extends a dataset already chosen and framed. It reports what it added, what it refreshed, and any observer it did not recognise.

**Common names come from iNaturalist alone**, and no import path contacts any other service. Where iNaturalist offers none, the scientific name stands alone. Roughly 4,200 records in the two-backyards export are in this position.

The intended replacement — planned, not yet built — is a curated local lookup giving a vernacular name at **taxonomic family, or superfamily where the family has no honest vernacular**, and never above that. A superfamily name is a true statement about the specimen: an unidentified noctuoid is still an owlet moth. The removed third-party enrichment climbed as far as kingdom, where names stop informing ("Animals"); that emptiness, not the climbing, was the problem. See `docs/NEXT-SESSION.md` for the rule and the measured coverage, and `docs/SESSION-2026-09-16-IMPORT.md` for what the removal cost.

## Reference and current work

See `docs/SESSION-2026-09-12.md`. The local project's sibling `reference-2026-09-12` folder holds the untouched baseline HTML, fixed-seed scores, WAVs and screenshots. `comparison-2026-09-12` holds repaired recordings and validation reports. These large local artifacts and the user's CSV export are not part of this repository.

`tools/reference-player.py INPUT_HTML OUTPUT_HTML` creates a test-only player with seed 1, the embedded 28 January sample, 19-second loops, Both players, D pentatonic, Class voices, mixed instruments and no ambience. The capture button renders one loop plus a 2.5-second tail through the app's existing offline audio renderer. `tools/reference-server.py ROOT OUTPUT_DIRECTORY` serves it on loopback port 8767 and saves captures into the explicit output directory. Use separate original/repaired output directories to avoid overwriting a reference.

The score is reproducible. Waveform bytes and animated particle positions are not guaranteed identical because synthesis noise and visual randomness are not fully seeded. Capture files are listening references, not audiovisual recordings or proof of real-device behavior.

## Release

Work on a feature branch and review changes before merging. GitHub Pages publishes the root of `main`; merging there releases the app. This session did not push or publish. Preserve historical standalone HTML files and review unpublished V2 layout changes separately.

Remaining gates include a listening review, real iPhone testing, gap-shortening implementation, broader browser scheduling checks, explicit import omission feedback, and a code licence/data-attribution decision. The API importer is capped and must not be treated as complete observation history. Photos and observation data retain their source licensing requirements.

The import and top-up work of 16 September 2026 has passing automated coverage, a live end-to-end check, and a headless-Chrome check in which the Top up button was actually clicked against the live API. It has **not** been tested on a real device, nor reviewed by ear — though no sound or score path was touched.

## Playback stability repair

The second repair pass uses the audio clock for the playhead and visual note crossings, skips obsolete notes after delayed scheduler ticks, and advances to the next cycle when resuming after the last note. Loop-end visual events are now included. Cancelling a pending rebuild prevents it from restarting playback later. Background drawing is explicitly opaque; drawing and pointer hit testing use one display scale, including Present mode.

See `docs/STABILITY-2026-09-12.md` for reproduction measurements and remaining limits. `tools/stability-player.py INPUT_HTML OUTPUT_HTML` produces an instrumented local test copy with a 40-keyboard-remix stress button. It is test tooling, not part of the published app. The existing on-screen Remix button stops/reset playback; the R keyboard shortcut performs a transition during playback. Both behaviors remain unchanged.

## Continue in a new session

Follow [the session roadmap](docs/SESSION-ROADMAP.md) and [the immediate handoff](docs/NEXT-SESSION.md). Establish the rehearsal reference first, then develop observer timbre and visual clarity. Gap shortening follows composition saving.

## CSV and visual rule repair — 13 September 2026

New CSV imports, through picker or drag/drop, reset Riff to 00:00–23:59 Brisbane time. This prevents the embedded demo's 19:00–20:40 window silently excluding new arrivals. Import status reports playable and omitted row counts. Explicit solo, focus, year/season and musical settings remain in effect; Both is required for flourishes. The window remains editable after import.

Point fill follows the selected taxonomic voice and remix seed. Observer A is a plain filled dot; only B has a teal outline and radial offset. This restores the original convention after Lily corrected the first repair. At Class, Insecta observations correctly share one fill; Family and Genus yield finer groups. Missing selected ranks now use an explicit unknown label with the nearest supplied ancestor rather than treating a species name as that rank. Known-rank musical reference scores are unchanged. Song still uses composed instrument roles; strict arrival timing and rank-assigned instruments belong to Timeline/Riff.

Validation: 80 passing tests, zero failures, eight existing gap-remapping TODOs. Includes both actual CSV event handlers and canvas outline/fill checks. Real export: 6,756 timed records, four omitted. Full-day versus inherited demo window: 3 September 2026 has 22 versus 17 shared minutes; 17 February has one versus zero. Browser verification was blocked by local-file URL policy, and listening/device acceptance remains outstanding. No release or deployment performed.
