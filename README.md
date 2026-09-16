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
- The **crossing** marks two records adjacent in time from different observers within `DUET_CROSS_WINDOW_MIN` (2) minutes — one of you recorded, then the other. It sounds a deep pad inside a wide ring. 790 across 55 nights on Lily's export: 315 fall inside a shared minute, where the pad sounds with the bell and restores the two-layer composite; 475 are moments nothing marked before, where the two alternated across a clock-minute boundary. Adjacent-in-time makes it symmetric and self-deduplicating; real minutes make it independent of loop length, which is the defect the V2 version shipped.
- The **echo** marks the same taxon recorded by both observers within 30 minutes on one night: 35 moments across 21 of the 71 nights both worked on Lily's export. It adds no note — two records of one taxon already sound at one pitch on one instrument — so it marks what the score already contains. One per taxon per night, symmetric between observers, and refused for unidentified records, which share a placeholder name and are not the same species. See `docs/WHAT-EVERY-SOUND-MEANS.md`.
- The five-second near-simultaneous pulse was **removed** on 16 September 2026. iNaturalist stores minute precision and 97.7% of records carry `:00`, so it had collapsed onto the shared-minute rule: it fired on 311 of 311 shared minutes at exactly the bell's instant. It was also asymmetric — it paired each A record to its nearest B record, and A is whoever appears first in the file, so it fired on 25 minutes with one observer as A and would have fired on 103 different ones with the other.
- Solo playback contains only that observer's notes, with no duet gestures. Switching players rebuilds sound, visual events and evidence together.

## Photographs

**The instrument opens in the mode that plays without photographs**, so the
first press of Play waits on nothing. The Now playing card is off (`View > Now
playing card`, or `C`) and the gallery starts collapsed, which is `display:none`
and therefore fetches no background images. The opening state requests zero
bytes of photograph.

The night's photographs preload behind that, and both the card and the gallery
report "Preparing photographs, 64 of 136" if you switch to them early.

**A photo is only ever shown once it is held.** The card names a species beside
its photograph, so a lagging photo paired one species' name with another
species' animal — a false statement on screen. Measured: `medium.jpg` is 215 KB
and 1.90 s from the CDN, while the busiest offered night gives each record
140 ms, so one photograph was being painted across fourteen species. The card
now shows the right photo or an empty frame, and that holds even with an empty
cache; the preload is speed, not correctness.

**Each surface asks for the size it draws.** iNaturalist serves variants at one
path — measured square 9.6 KB, small 42 KB, medium 215 KB. `photoSizeForPx`
follows the drawn tile rather than the surface, because gallery fullscreen
binary-searches its own tile size up to 120 px: `square` to 75 px, `small`
above it. The flashing card takes `small` — a record is on screen for about
140 ms, which cannot be examined. On the busiest night the thumbnail grid went
from 27.8 MB to 1.2 MB.

The preload decodes rather than merely loading, is bounded to six in flight,
is cancelled when the night changes so scrubbing dates cannot stack thousands
of requests, and is capped at 800 cached entries so an unattended gallery does
not grow without bound. A URL that is not recognisably an iNaturalist photo
path is left exactly as it is.

## Which nights are offered

A night needs **more than fifteen records** to appear in the date list. Below that there is not enough to compose, and a 428-entry list of which half cannot become music is worse than a shorter one. Thin nights are **hidden**, not set aside: there is no control that brings them back.

The threshold is one constant, `OFFERABLE_NIGHT_MIN_RECORDS`, and the rule is applied in exactly one place — `offerableNightKeys`, called from `rebuildDerived`. On Lily's two-backyards export: 144 of 428 dates remain, holding 79.8% of the records; 284 dates leave the list, **including every night of 2020–2023**, no night of which reaches sixteen records.

That last part is the intended effect rather than a price paid for it. The instrument is mostly used to hear the current or past week, and going further back is for recalling a night already known to be exceptional. A dozen wonderful nights is a better offering than years of unknown quality to scroll and guess at.

Hidden is not deleted. The records stay loaded, grouped by night, counted and exportable; only the date list is shorter. Status lines still report the dataset's true size, so a fetch may say "across 428 nights" while the list offers 144.

Two exceptions keep the rule from recreating the bug it was built after:

- **A rule that would silence everything does not apply.** If no night in the current scope reaches the threshold, every night is offered. A capped fetch, or a first night at the sheet, can hold nothing but thin nights, and an empty date list on a dataset that loaded is exactly the failure the import repair fixed. The escape hatch is judged **within** the year filter, not across the whole dataset.
- **The selected night is always offered.** Top up lands on the newest night it actually added, which at 9pm may hold three records. Hiding it would bounce the selection away from the records you just asked to see. It leaves the list as soon as you move on.

`preferredOpeningNight` follows the same rule: newest shared date, else newest night worth offering, else newest night at all. A shared date needs twenty records and so clears the threshold by construction — the two numbers must not drift apart, and a test holds them together.

Measured once, so it is not re-guessed: a **time-spread** rule looks obviously necessary and is not. All 92 zero-span nights in the export hold exactly one record, and there is no multi-record night with a zero span — thin nights are short because they are thin. Taxonomic variety is likewise a non-problem: of the 128 nights with twenty or more records, none has a single family and none has two or fewer distinct taxa. Count alone is sufficient. Do not add a second axis without re-measuring.

## Importing: CSV, Fetch and Top up

Three ways in, meant to be used together.

- **Import CSV** replaces the loaded records with an iNaturalist export, resets the Riff window to 00:00–23:59 Brisbane and the year filter, and opens on a night that plays, so a new dataset never inherits the demo's framing.
- **Fetch** pulls from the API for one or two usernames, newest first, up to **Cap**. The cap is a deliberate choice — lowering it to 1,000 is how you hear the current week rather than a whole history — so the status line reports the fetched count against the true total and never implies completeness. Like a CSV import and unlike a top-up, a fetch **replaces** what is loaded: it resets the Riff window and any year filter, and opens on a night that plays. Use Top up to extend instead.
- **Top up** extends what is already loaded. It reads each observer's login from the records, finds how far that observer's data reaches, and fetches only from two days before that point. It is enabled only when the loaded records carry logins. It then moves to the newest night it **actually added** — you pressed it to see what arrived, and several hundred dates will not show you otherwise.

A fetch must replace rather than merge, and the reason is the duet pair. A and B are the first two distinct observers in chronological order, and the API supplies a **login** where a CSV supplies a display name. Merging a September fetch into the January demo left A and B as the demo's two display names, so every fetched record failed `observerRole()` and was dropped before the sequencer: the dates appeared, the status line said success, and the loop was silent. A fetch does carry across the display name of a login already held, so `Import CSV` then `Fetch` still reads "Lily Kumpe" rather than "lily_kumpe". See `docs/SESSION-2026-09-16-FETCH.md`.

All three paths are different intentions, and they differ. What they share is one obligation: land you where the records you just asked for are.

| | replaces | resets Riff window | resets year filter | date lands on |
|---|---|---|---|---|
| **Import CSV** | yes | yes | yes | newest shared date |
| **Fetch** | yes | yes | yes | newest shared date |
| **Top up** | no | no | only if it would hide the arrival | newest night it actually added |

A freshly **loaded** dataset — imported or fetched — opens on the newest **shared date**: two distinct observers and at least twenty records, the same `isSharedDate` rule that marks dates in the date list. When no date qualifies it falls back to the newest night **worth offering**, and only then to the newest night at all. Strictly-newest is the wrong default there: a load run in the evening lands on tonight, which may hold a single record so far, and one lonely note is indistinguishable from a failed load.

This matters more than it looks on the CSV path. The demo's night, 28 January 2026, is a real night in the two-backyards export, so the "is the selected date still valid?" check passes and the date does not move on its own: importing 6,794 records spanning 2020–2026 used to leave the app showing that one January night, with 428 dates listed and no status message at all, because the status element had been removed from the panel while the code kept writing to it.

A **top-up** uses a different rule on purpose. It goes to the newest night that genuinely *gained* a record — a refreshed record is not an arrival, and a top-up that only refreshes moves nothing. Its Riff window is deliberately kept, because a top-up extends a dataset already chosen and framed. Its year filter is cleared only when it would hide the arrival, since jumping to a night the filter then hides is a lie.

Every other date always stays one selection away, and every status line names the night it chose and how many records are on it. See `docs/SESSION-2026-09-16-ARRIVALS.md`.

Why two days: iNaturalist filters by whole observation dates (`d1`), and the newest record held on a night is rarely that night's last arrival, so an exact boundary would drop the rest of a part-imported night. The overlap reconciles by observation id, so re-fetched records cost a little time and change nothing.

Records already held are refreshed, so identifications corrected upstream since the export arrive. Observer identity is taken from the record already held, not from the API, which knows only the login.

A top-up **does not** reset the Riff window; unlike a fresh import it extends a dataset already chosen and framed. It reports what it added, what it refreshed, and any observer it did not recognise.

**Common names come from iNaturalist alone**, and no import path contacts any other service. Where iNaturalist offers none, the scientific name stands alone. Roughly 4,200 records in the two-backyards export are in this position.

The intended replacement — planned, not yet built — is a curated local lookup giving a vernacular name at **taxonomic family, or superfamily where the family has no honest vernacular**, and never above that. A superfamily name is a true statement about the specimen: an unidentified noctuoid is still an owlet moth. The removed third-party enrichment climbed as far as kingdom, where names stop informing ("Animals"); that emptiness, not the climbing, was the problem. See `docs/NEXT-SESSION.md` for the rule and the measured coverage, and `docs/SESSION-2026-09-16-IMPORT.md` for what the removal cost.

## What the night panel says

The disclosure beside the date is **"What you are hearing"**: one paragraph of
rules and one of the night itself. The rules paragraph names all three duet
gestures with their real windows and states the limit of what any of them
claims — iNaturalist records whole minutes, so the minute is the finest true
statement available, and none of them asserts that a shutter was pressed at the
same instant. The night paragraph gives the records, the observers, the span of
the evening, the counts of each gesture, and the species both observers found.
Solo, Song and Riff each change what it says.

It does **not** list observations or link to iNaturalist. Those identifiers are
still carried on every event and in the CSV export; the panel is for
understanding the night, not for auditing it.

## Reference and current work

See `docs/SESSION-2026-09-12.md`. The local project's sibling `reference-2026-09-12` folder holds the untouched baseline HTML, fixed-seed scores, WAVs and screenshots. `comparison-2026-09-12` holds repaired recordings and validation reports. These large local artifacts and the user's CSV export are not part of this repository.

`tools/reference-player.py INPUT_HTML OUTPUT_HTML` creates a test-only player with seed 1, the embedded 28 January sample, 19-second loops, Both players, D pentatonic, Class voices, mixed instruments and no ambience. The capture button renders one loop plus a 2.5-second tail through the app's existing offline audio renderer. `tools/reference-server.py ROOT OUTPUT_DIRECTORY` serves it on loopback port 8767 and saves captures into the explicit output directory. Use separate original/repaired output directories to avoid overwriting a reference.

The score is reproducible. Waveform bytes and animated particle positions are not guaranteed identical because synthesis noise and visual randomness are not fully seeded. Capture files are listening references, not audiovisual recordings or proof of real-device behavior.

## Release

Work on a feature branch and review changes before merging. GitHub Pages publishes the root of `main`; merging there releases the app. This session did not push or publish. Preserve historical standalone HTML files and review unpublished V2 layout changes separately.

Remaining gates include a listening review, real iPhone testing, gap-shortening implementation, broader browser scheduling checks, explicit import omission feedback, and a code licence/data-attribution decision. The API importer is capped and must not be treated as complete observation history. Photos and observation data retain their source licensing requirements.

The import and top-up work of 16 September 2026 has passing automated coverage, a live end-to-end check, and a headless-Chrome check in which the Top up button was actually clicked against the live API. It has **not** been tested on a real device, nor reviewed by ear — though no sound or score path was touched.

The silent-fetch repair of the same day carries 15 further tests, all of which fail against the pre-fix file, one of them running the real Fetch handler against a stubbed API. It was verified live against iNaturalist for both logins at cap 300: every one of the ten returned nights sequences notes, where before the fix none of them did.

The arrival-visibility work that followed it carries 13 more, also all failing beforehand, two of them driving the real Top up button against a stubbed API on top of a real CSV import. It was verified in headless Chrome through the genuine file input and the genuine Top up button, against the live API and the real 6,798-row export: the import now lands on 12 September with 35 records and a status line, and the top-up moves to 16 September with what had arrived by then.

Both are unreviewed by ear and untested on a device, and neither touches any sound or score path.

## Playback stability repair

The second repair pass uses the audio clock for the playhead and visual note crossings, skips obsolete notes after delayed scheduler ticks, and advances to the next cycle when resuming after the last note. Loop-end visual events are now included. Cancelling a pending rebuild prevents it from restarting playback later. Background drawing is explicitly opaque; drawing and pointer hit testing use one display scale, including Present mode.

See `docs/STABILITY-2026-09-12.md` for reproduction measurements and remaining limits. `tools/stability-player.py INPUT_HTML OUTPUT_HTML` produces an instrumented local test copy with a 40-keyboard-remix stress button. It is test tooling, not part of the published app. The existing on-screen Remix button stops/reset playback; the R keyboard shortcut performs a transition during playback. Both behaviors remain unchanged.

## Continue in a new session

Follow [the session roadmap](docs/SESSION-ROADMAP.md) and [the immediate handoff](docs/NEXT-SESSION.md). Establish the rehearsal reference first, then develop observer timbre and visual clarity. Gap shortening follows composition saving.

## CSV and visual rule repair — 13 September 2026

New CSV imports, through picker or drag/drop, reset Riff to 00:00–23:59 Brisbane time. This prevents the embedded demo's 19:00–20:40 window silently excluding new arrivals. Import status reports playable and omitted row counts. Explicit solo, focus, year/season and musical settings remain in effect; Both is required for flourishes. The window remains editable after import.

Point fill follows the selected taxonomic voice and remix seed. Observer A is a plain filled dot; only B has a teal outline and radial offset. This restores the original convention after Lily corrected the first repair. At Class, Insecta observations correctly share one fill; Family and Genus yield finer groups. Missing selected ranks now use an explicit unknown label with the nearest supplied ancestor rather than treating a species name as that rank. Known-rank musical reference scores are unchanged. Song still uses composed instrument roles; strict arrival timing and rank-assigned instruments belong to Timeline/Riff.

Validation: 80 passing tests, zero failures, eight existing gap-remapping TODOs. Includes both actual CSV event handlers and canvas outline/fill checks. Real export: 6,756 timed records, four omitted. Full-day versus inherited demo window: 3 September 2026 has 22 versus 17 shared minutes; 17 February has one versus zero. Browser verification was blocked by local-file URL policy, and listening/device acceptance remains outstanding. No release or deployment performed.
