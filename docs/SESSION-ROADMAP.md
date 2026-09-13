# Moth Orchestra — a roadmap for exceptional sessions

13 September 2026. Prepared at Lily's request for a directive co-creative lead. This is the active delivery sequence, replacing the earlier gap-shortening-first sequence. SONIFICATION-DESIGN.md explains the instrument; this file governs the work ahead. The milestones below are outcomes, not promises that each will fit into one chat session.

## The outcome we are building towards

An intimate, beautiful instrument that makes a real night understandable through sound and motion. A newcomer can read the circle, distinguish the two observers, recognise a shared minute, and save a piece that can be replayed. Lily can trust its explanation and enjoy performing with it.

Success requires three kinds of evidence: correct data-to-score behaviour, a convincing listening experience, and dependable interaction on the actual device. Passing automated tests establishes only the first part and some of the third.

## Creative commitments

Preserve the lower creek shared-minute flourish. Keep A's ordinary observations plain and B's outlined. Keep taxonomy recognisable through ring grouping and related musical voices. Give observers subtle timbral identities within those voices. Keep original-time evidence separate from performance timing. Keep Timeline/Riff faithful to recorded sequence, and describe Song as an arrangement. Never infer timing precision or missing taxonomy merely because it would make the music easier to generate.

Continue with shared taxonomic ring positions as the working design. Independently packed observer rings are a candidate only if a measured crowding problem justifies their extra interpretive cost. Do not change this silently.

## How we will collaborate

Codex leads investigation, engineering, testing, documentation and recommendations. Make routine reversible decisions autonomously; expose consequential tradeoffs in plain language. Keep a short parking list for ideas outside the current milestone.

Lily supplies artistic judgement and field context. Ask her for one focused decision at a time when possible. Bring a concrete comparison and a recommendation, rather than a menu of abstract possibilities. Do not ask her to diagnose technical failures.

For sound decisions, hold records, seed, loop length, key, scale, rank and master level constant. Keep the accepted reference beside one or two candidates. Match perceived loudness reasonably so louder does not automatically win. Compare headphones, ordinary speakers and mono when relevant. Save the exact settings and her decision. A musical change can intentionally alter a reference score; document why, retain the old fixture, and do not rewrite the expectation merely to make a test pass.

## Milestone 1 — Establish a trustworthy rehearsal set

**Purpose:** know exactly what we are hearing and ensure current claims are true before changing timbre.

First reconcile the current uncommitted repairs with the maintained checkout. Run the existing suite, inspect the restored observer markers in a working browser, and establish an accessible local preview. If browser access needs an environment permission, request that narrowly; do not bypass a blocked browser route. Mark any unperformed browser or listening check as outstanding.

Build a small fixed-settings rehearsal set from supplied data: bundled 28 January sample; 3 September 2026 dense shared night; 17 February 2026 with its single shared minute; a verified no-shared-minute example; and a sparse example. Use synthetic fixtures only for controlled edge cases, clearly labelled. Independently derive expected counts from raw rows, retaining observation IDs. Do not rely only on the application matcher to certify itself.

Audit timestamp precision, duplicate records, selected observers and filters. The export includes both zero and nonzero seconds; neither proves measurement precision on its own. The proposed policy is to suppress evidence-based five-second pulses where source precision is unknown. Compare any resulting musical change explicitly; preserve the genuine shared-minute creek flourish. Decide and record the policy before changing it. Also distinguish “both observed on this date” from “both observed in the same minute”; the existing 20-record date marker must not imply the latter.

**Deliverables:** fixed settings manifest, small local audio/visual references, independently checked match counts, precision policy, and a concise known-issues list.

**Pass:** expected records, ring groups and shared-minute evidence agree; compressed loop length cannot create matches; the lower creek and A/B markers are confirmed in playback. Any remaining blocker has an exact reproduction.

**Lily's review:** a short reference playback, checking that this is the sound we should protect.

## Milestone 2 — Make the two observers audibly recognisable

**Purpose:** deliver the first major creative improvement under controlled conditions.

Prototype two subtle variants of the same taxonomic voice through envelope or timbre. Do not change the taxon's pitch simply to identify the observer. Do not rely on stereo position alone. Start in Timeline/Riff with identical-taxon A/B fixtures; then cover real nights, existing instrument palettes and Song's roles. Keep the creek flourish shared, not owned by either observer.

Use one observer-treatment path for live playback, audition and offline export so they cannot disagree. If small engine separation is needed to achieve that, do it; do not bundle a framework migration. Allow comparison with the accepted unmodified sound during development.

**Deliverables:** one or two short listening candidates, chosen treatment with documented parameters, live/export parity tests, and an unchanged reference.

**Pass:** Lily can hear a useful distinction in a simple same-taxon comparison, including mono; both still sound related; dense nights remain gentle; known scheduling and clipping concerns are not worsened. Record subjective acceptance separately from automated checks.

**Lily's review:** which candidate preserves the intimacy of the instrument while making the duet clearer?

## Milestone 3 — Make the circle understandable

**Purpose:** someone can read the instrument without a long explanation.

Add restrained group labels or inspectable labels and a persistent, accessible legend. Explain taxonomic ring, observer outline and shared-minute halo separately. Keep shared taxonomic positions and test the existing B offset at dense species-level settings. Resolve crowding through spacing, selection and focus before hiding or merging groups. Any aggregation must be explicit and reversible.

Make observer names/selection legible and stable enough to know who A and B mean; imports must not silently switch their identities. Reconcile counts so gallery, playable records and shared-minute evidence have clear meanings. Check mobile, touch, keyboard and contrast. Avoid relying on colour alone.

**Deliverables:** a readable circle, a small explanation layer and a tested dense-night layout.

**Pass:** for a controlled dataset, each selected-rank group has the expected ring; observer identity remains visible; an unfamiliar viewer can identify who, what group and what shared time mean. If no independent viewer is available, record that usability check as pending rather than claiming it.

**Lily's review:** does the explanation reveal the experience without cluttering or flattening it?

## Milestone 4 — Save and return to a composition

**Purpose:** a beautiful night becomes a durable piece, not a temporary browser state.

Define a versioned local composition format that includes source observation evidence and all score-affecting settings: observer identity, date/window and filters, mode, rank, seed, loop duration, key, scale and palette, plus timbre treatment and rules version. Include relevant mix settings. Keep raw evidence separate from arranged events. Validate malformed and incompatible files gracefully.

Provide Save composition and Open composition. Preserve the musical score and matches on reload. Keep audio export distinct from editable composition saving. Document whether synthesis noise is reproducible; guarantee only what is tested. Avoid bundling unnecessary precise location fields into shareable files. Identify required photo/network dependencies and attribution.

**Deliverables:** portable composition file, save/open controls, one sample piece and round-trip tests.

**Pass:** close, reopen and recover the same score, observer mapping and evidence without uploading the CSV again. Export reflects the selected observer treatment and mix. Test opening on a second browser/device when available.

**Lily's review:** save a chosen night, close it, and bring it back.

## Milestone 5 — Shape a whole night without falsifying it

**Purpose:** improve sparse-night listening once the instrument can preserve a piece reliably.

Implement optional Timeline shortening of gaps longer than one hour, with a modest retained pause chosen through listening. Preserve original timestamps and order; calculate synchrony only from originals. Signal where time was shortened. Keep the option off by default and preserve existing Riff behaviour. Fulfil the eight existing gap-remapping test cases.

Separately establish whether the date means a calendar day or an evening continuing past midnight. Do not combine this temporal policy change with gap shortening. Use actual overnight examples and name the boundary explicitly before implementing a night grouping rule.

**Deliverables:** optional gap control and sparse/busy comparison pieces; a separate night-boundary decision if needed.

**Pass:** disabled mode preserves the existing score; enabled mode preserves match IDs and counts, event order and active-stretch proportions. Saved pieces retain the selected rule and replay correctly.

**Lily's review:** does the shorter silence retain breathing room and the feeling of the night?

## Milestone 6 — Make it performance-ready

**Purpose:** reliability and clarity survive real use, not just a short demo.

Run a written rehearsal across CSV import, observer selection, rank/mode changes, repeated remixing, seek, pause, tab suspension, save/open and export. Use a real iPhone and intended desktop/audio setup when available. Include dense Song and ambience combinations. Check export headroom and existing full-volume clipping without treating limiting as permission to change the accepted timbre casually.

Target a documented 30-minute continuous desktop rehearsal, plus a real mobile session. Record device, settings and results. Check error recovery and an offline demonstration using assets that can legitimately be included. Add reduced-motion behaviour where needed. Verify keyboard/touch flows and labels.

**Deliverables:** rehearsal checklist, measured results, repaired reproducible failures, credits and a prepared demonstration composition.

**Pass:** no known unresolved show-stopping failure in the tested setup; no reproduced catch-up bursts or background-opacity faults; exports behave as documented. Clearly list any untested device or remaining limitation.

**Lily's review:** perform a night from start to finish without developer assistance.

## Milestone 7 — Release a coherent instrument

**Purpose:** publish one understandable, recoverable version.

Review the current Git state and remote state, reconcile documentation, check licensing and attribution, and prepare a focused release description, demonstration piece and rollback reference. Confirm hosting behaviour: the recorded project setup publishes GitHub Pages from main, so verify this before merging.

A prepared release does not imply permission to publish. Present the concrete tested version for Lily's release decision. Push, merge and deployment must follow the authorization given at that time.

**Deliverables:** release candidate, understandable README/design guide, change notes and a ready review.

**Pass:** Lily accepts the musical experience and release; technical and device checks are accurately stated; rollback is possible.

## Session protocol

Start by reading NEXT-SESSION.md, this roadmap and the relevant design rules. Inspect the actual working tree; do not assume the previous session committed or published anything. State the current milestone, one concrete outcome and the protected behaviours.

Work in the smallest useful increments. Write meaningful failing tests for data/audio behaviour before implementing it. Pair code changes with actual browser or listening verification where needed. Keep requirements, implementation and verification status distinct. Do not spend an entire session preparing another plan unless discovery establishes that implementation is blocked.

End with a usable result and a short receipt: what changed, where the current preview is, what passed, what was not checked, any artistic decision needed, and the exact next action. Keep commits focused; preserve unrelated edits and do not push without authorization. If work remains, name the next bounded step instead of claiming milestone completion.

Update NEXT-SESSION.md in place, rather than accumulating contradictory opening instructions. Record accepted artistic choices in SONIFICATION-DESIGN.md. Append listening decisions and evidence to a session record when produced. These files must make the project recoverable without rereading chat history.

## Folder discipline

All project outputs belong under `/Users/lilykumpe/Documents/Claude/Moth Orchestra/`.

- `repository/index.html`: authoritative maintained application.
- `repository/docs/SONIFICATION-DESIGN.md`: intended and verified rules.
- `repository/docs/SESSION-ROADMAP.md`: active sequence.
- `repository/docs/NEXT-SESSION.md`: immediate handoff.
- `sessions/YYYY-MM-DD/`: dated listening examples, reports and screenshots when produced.
- `work/`: intermediate scripts and scratch work.

Use a clearly dated review copy only when useful, and identify the maintained source. Do not scatter competing “final” HTML files or overwrite historical builds. Existing outside-folder outputs are historical copies; no new output should be placed there. Keep raw exports unchanged and out of public commits unless explicitly intended.

## Definition of exceptional

Every note we claim comes from data can be traced. Every artistic layer is honestly named. The two people are perceptible without competing with the taxonomy. The creek flourish feels like shared time. A newcomer can read the circle. A saved night comes back intact. Lily can trust the instrument enough to become absorbed in the experience.
