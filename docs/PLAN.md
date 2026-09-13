> Historical plan, retained for context. The active session order is now SESSION-ROADMAP.md, with immediate instructions in NEXT-SESSION.md. Status counts and priorities below describe the earlier checkpoint.

# Moth Orchestra — agreed direction and implementation plan

Updated 12 September 2026 after implementation and Lily's listening review. This remains the overall first-release direction; the status below distinguishes completed work from remaining scope.

## Current status

Lily approved the synchrony repairs, then reported playback degradation and background flashing. Those problems were reproduced and repaired; Lily's subsequent feedback was “this is good.” Preserve this accepted musical and visual direction.

Completed locally: reference HTML/audio/scores/screenshots for all modes; genuine shared-minute evidence and display; original-time near-simultaneous detection; observer and solo fixes; Brisbane filtering; scheduler, canvas-opacity, display-scale and loop-boundary repairs. The current suite has 72 passing tests and eight explicit future gap-remapping TODOs. Song's reference score remains unchanged. The instrumented repaired browser completed 40 live remixes and more than two minutes of playback without late-scheduled notes, unintended background transparency or recorded page errors. These checks do not establish real-iPhone or all-settings reliability.

Implementation is committed on `repair/synchrony-reference`; latest application commit is `945405e`. Nothing has been pushed or published. Original HTML versions and local reference artifacts remain preserved in the surrounding Moth Orchestra folder. See `SESSION-2026-09-12.md`, `STABILITY-2026-09-12.md` and `NEXT-SESSION.md` for evidence and continuation instructions.

Still pending: optional Timeline gap shortening; visible CSV omission feedback; real-device/longer stress checks; export headroom; any manual observer/timezone choices; separate V2 review; licence/attribution and release decisions. A user-facing fixed-seed/settings control is not yet implemented; reproducibility currently uses reference tooling.

## Creative direction

Preserve the current musical personality. Lily already enjoys its combination of recognition, release, and connection across two places. Riff is her usual choice because it avoids long pauses; Song is also a valued part of the experience. This is an improvement and reliability project, not a reinvention of its aesthetic.

The intended destination is a compelling, dependable World Science Festival demonstration in 2027 that communicates the possibilities of AI-assisted work with natural history observations. Exact event dates and equipment remain to be established; they do not block the first development phase.

## Agreed first release

### 1. Protect the existing experience

- Maintain the GitHub version as the initial implementation baseline, preserving all historical standalone HTML files.
- Capture a reproducible reference using the bundled 28 January sample, musical seed, settings, and each mode. Use it to compare sound and visuals before and after changes.
- Review the unpublished local V2 differences separately. Do not overwrite the deployed app wholesale with V2.
- Preserve Riff's selected-window behavior and Song's composition and accompaniment wherever possible.

### 2. Repair synchrony

- Determine genuine shared minutes from original observation timestamps and the two explicitly selected observers.
- Use one matching result across modes, applying each mode's documented observation filters. A Song arrangement may present a match differently in musical time but must retain its evidence.
- Keep Song's existing accompaniment musically intact while distinguishing it from genuine synchrony in event types and presentation.
- Correct the near-simultaneous detector to use observation time rather than compressed playback seconds. Audit its contribution to the current musical feel before altering its presentation.
- Retain the observation IDs and timestamps behind genuine matches.
- Make solo behavior consistent between sound and visuals. Exclude additional observers from an A/B match.

### 3. Make Timeline comfortable for whole-night listening

- Add an optional “Shorten long gaps” control.
- Close observation gaps strictly longer than one hour into a brief pause; keep original observation order and proportional spacing inside active stretches before fitting the result to the chosen loop duration.
- Show a subtle indication where time was shortened.
- Store original and performance time separately. Gap shortening must never change which observations genuinely match.
- Keep the ordinary Timeline available with the option off, and keep Riff unchanged.
- Implementation detail to prototype: how much musical breathing room a shortened gap receives. Evaluate using sparse and busy nights rather than choosing a permanent duration prematurely.

### 4. Make the result explainable and repeatable

- Add a concise count of genuine shared minutes and a way to inspect the observations behind them.
- Document observer identity, timestamp requirements, timezone handling, filtering, and the difference between real coincidence and composed accompaniment.
- Support a fixed seed/settings reference for testing and rehearsing. Full saved-performance and video-export features are later possibilities, not requirements for this first release.

## Verification and release gates

Write meaningful regression tests before the repairs. Cover same-minute matches, zero matches, adjacent-minute boundaries, timestamp offsets, missing timestamps, duplicate observations, third observers, solo modes, Riff filtering, Song accompaniment, and loop-length changes.

For gap shortening, test gaps below, exactly at, and above one hour; multiple gaps; midnight crossings; empty and single-record inputs; ordering; and unchanged synchrony before/after time remapping. Resolve the timezone used for Riff explicitly so device timezone does not silently change an intended reference performance.

The existing bundled sample has eight genuine shared minutes in Timeline and the default Riff window in Brisbane time. Preserve that acceptance fixture. Song must retain those underlying matches without labelling ordinary accompaniment as additional genuine matches.

Check rendered flourishes, audio scheduling, loop boundaries, and control changes in a browser. Review musical feel with Lily before treating the creative work as accepted. Test iPhone behavior on an available real device; do not imply desktop simulation proves it.

Completion requires passing automated checks, a reviewable preview, documentation, and a before/after explanation of any intentional musical change.

## GitHub and workspace readiness

Maintained checkout: `Moth Orchestra/repository`.
Repository: https://github.com/Lily-LMK/moth-orchestra
Live site: https://lily-lmk.github.io/moth-orchestra/
Baseline: b6663f11531e42593b149685d3c454975cd61a18 (8 March 2026).

Verified 12 September 2026: the authenticated account has push and administrative permissions, and a non-mutating Git push dry run to a proposed new branch succeeded using GitHub CLI authentication. No remote branch was created by this check. The default system credential helper emitted a storage warning on the first attempt; the GitHub CLI helper completed the repeat cleanly and is the verified path for future pushes.

Develop on a feature branch, keep commits focused, and use a pull request for review. GitHub Pages publishes from main, so merging changes there is the release step. The user has requested readiness to update GitHub; no publication or merge has been performed as part of this planning task. Present a concrete, tested result before the release decision.

## Later festival work

After the first release feels right, prioritise a prepared performance, locally available demonstration assets, graceful recovery from interrupted audio, reduced-motion support, photo credits and reuse permissions, and rehearsal on the actual screen and sound equipment. Saved performances, audiovisual exports, and a guided introduction remain candidates to discuss rather than an expanding compulsory feature list.

## Immediate next action

Continue from the committed feature branch using `NEXT-SESSION.md`. The recommended next deliverable is optional Timeline long-gap shortening, with executable failing tests before implementation and original synchrony evidence unchanged. Do not restart the completed assessment, recapture the historical baseline, or expand into an aesthetic/framework rewrite.
