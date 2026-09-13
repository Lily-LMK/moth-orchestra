# The Moth Orchestra — sonification design reference

13 September 2026. This is the entry point for understanding the instrument. It separates Lily's stated intention, verified implementation, and proposals that still need listening review. Older plans are historical context; they do not override her current request.

## North star

Turn a night of backyard observations into a legible, intimate musical encounter. Arrivals emerge from darkness in their recorded sequence. Taxonomy gives the ensemble structure. Two observers remain recognisable within it, and a minute they share releases a special musical response. Different nights sound different because their observations differ.

This is a designed translation of records, not a claim that taxa naturally have particular notes or that a photograph's timestamp proves the instant an animal arrived. Use “recorded observation time” when explaining the evidence. “Arrival” is the performance metaphor unless the source records actual arrivals.

## Intended rules

| Evidence or choice | Musical expression | Visual expression |
| --- | --- | --- |
| Original observation timestamp | When an arrival plays, compressed proportionally in Timeline/Riff | Position around the circle |
| Selected taxonomic rank | The level at which observations share a voice | One ring for each distinct group present at that rank |
| Taxon within that grouping | A related pitch variation | A point on its group's ring |
| Observer | A subtle, consistent sound signature, still recognisably the same taxonomic voice | A plain filled dot for A; the same taxonomic fill with an outline for B |
| Both observers in the same original minute | One recognisable shared-minute flourish | A distinct shared event, separate from ordinary observer outlines |
| Recorded repetition | Controlled musical emphasis | Emphasis must not masquerade as additional records |
| Seed, scale, key and instrument palette | A repeatable interpretation of the data | Colours remain consistent within that interpretation |

The observer sound signature is an intended rule, **not implemented yet**. A suitable prototype would give the same instrument a subtly different envelope or timbre for each observer. Stereo separation can support this, but must not be the only cue because playback may be mono. Lily supports this approach. The exact sound still needs an A/B listening comparison before acceptance.

## Reading the rings

“Family” means a ring for Erebidae, another for Geometridae, another for any other family present. It does not mean one ring called Family. “Order” groups those moth families together in Lepidoptera. “Species” separates identified species into their own rings. The number follows the actual distinct groups in the filtered records; finer ranks usually produce more rings, but missing identifications and the data itself matter.

The implementation already builds this list from the selected rank. It currently orders rings by record count, so a taxon's radial position can change between dates. Point fills are generated from the taxonomic group and remix seed. At Class, a night dominated by Insecta can correctly look almost one-coloured. Different groups are not guaranteed perfectly distinct colours or instruments: a finite palette can collide.

B's points currently sit slightly outside their group's ring to distinguish coincident records. That is an observer offset, not an additional taxonomic group. Large special-event halos are also not extra taxonomic rings. Ring labels and an always-visible legend are worthwhile next improvements; this document does not claim they are already present.

## How the current build makes music

### Timeline and Riff

Timeline takes the selected calendar date after filters. The first eligible record maps to the start of the loop and the last to its endpoint. Every intermediate timestamp keeps its proportional spacing. A three-hour span can therefore become a 13-second loop. Long gaps are still long proportionally; automatic gap shortening is not implemented.

Riff first takes the chosen Brisbane clock window, then applies the same mapping to the first and last records within it. It does not pad empty time to the window's boundaries. New CSV imports now start with the full-day window, avoiding the old demo window silently hiding records. Subsequent manual window choices remain meaningful filters.

The selected rank's group name and seed select an instrument from the chosen palette. The group establishes a pitch region, and the observation's taxon adds a small scale-step variation. Key and scale constrain those pitches. More specific rank selections unlock additional instruments in the mixed palette. These are authored musical rules, not biological properties.

Repeated taxon records increase event density, affecting dot size and loudness. This measures recorded repetition, not a reliable count of animals. A and B currently use the same synthesis path: identical taxa and settings can sound identical. Different collected taxa may make their parts sound different incidentally, but that is not an observer signature.

### Song

Song is a composed interpretation: an eight-bar arrangement built from the night's observer/group units, abundance, seed and musical settings. It repeats units and assigns bass, lead and accompaniment roles. Ordinary notes do not preserve the original arrival sequence, and an event may represent a group of records rather than a one-to-one arrival. Its genuine shared-minute events still retain original matching evidence.

Keep Song clearly described as an arrangement. Timeline/Riff are the reference modes for explaining observation timing. Do not silently impose Song's freedoms on those modes.

## Shared time: evidence versus flourish

A genuine shared minute contains at least one eligible record from A and one from B in the same absolute minute. 19:00:01 and 19:00:59 qualify; 19:00:59 and 19:01:00 do not. Matching uses original timestamps, never proximity created by compressing the loop. Observation IDs and timestamps remain inspectable. Duplicate IDs do not inflate the matching evidence, although general duplicate-row import handling remains a separate concern.

Timeline/Riff also have a separate near-simultaneous pulse, currently within five original seconds. This can overlap a shared-minute flourish or cross a minute boundary. Song has ordinary composed accompaniment too. Neither should be mistaken for another genuine shared minute.

The old duet build used a high bell for the shared-minute event. Current Timeline/Riff use creek one octave below the generated duet pitch, or choir unison in choir mode. Song uses its chosen sync instrument. Lily confirmed that she prefers the lower creek flourish: preserve it. The matching logic and the audible character are separate questions; a passing match-count test alone does not verify playback.

## What the older build contributes

Verified against `../the-moth-orchestra-duet-v1-2.html`:

- Order-based rings and fill; instrument chosen by order; pitch shaped by family and taxon.
- A plain dot and B's outlined, offset dot. Restored in the maintained build after the unintended both-outlined change.
- A high bell shared-minute accent, plus a warm pulse.
- Abundance echoes and optional time quantisation: useful artistic ideas, but additional gestures must remain distinguishable from recorded arrivals.
- Its near-simultaneous calculation used compressed performance seconds, which could create false apparent coincidence. Do not restore that defect.
- No consistent observer-specific instrument/pitch identity in its ordinary event generation and scheduling.

The current build expands the fixed order grouping to selectable ranks. The old version is evidence of earlier choices, not a specification to copy wholesale.

## Data, repeatability and sharing limits

The current importer needs parseable times and groups dates using `observed_on`. Display/filter time is Brisbane. A cross-midnight clock window does not yet combine two calendar dates into a biological night. Missing times are omitted and counted, not invented. Missing ranks are labelled unknown with a supplied ancestor where possible; this does not fill in the missing taxonomy.

A/B are automatically chosen from the first two distinct observers in chronological order (or explicit User_A/User_B names). Additional people are excluded from the sequencer. Stable observer selection across arbitrary imports needs improvement. Filters and solo mode can intentionally remove shared events. The date selector's shared-date decoration is a separate coarse two-observer/20-record heuristic, not proof of shared minutes; it should be replaced or relabelled.

The seed currently changes on reload/remix. Same records and settings can reproduce the event score, but noise synthesis is not fully seeded, so exported waveform bytes are not guaranteed identical. Export ZIP provides a rendered audio file and score CSV; ringtone export also exists. These are not a complete save-and-reopen composition system. A portable saved composition should preserve source observations, selected observers/date, filters/window, rank, seed, loop duration, key, scale, mode, palette and a rules-version identifier.

A README exists in the local Git checkout and tracked history. This review does not establish which README revision is currently on GitHub; no remote publication was performed.

## Small next steps and acceptance checks

1. **Restore marker convention** — done: A plain, B outlined. Automated canvas check verifies only B receives the observer outline. Audio unchanged.
2. **Make the explanation visible** — label rings/groups and provide a compact legend that works on mobile. At a fixed rank, the displayed groups must match the eligible records.
3. **Preserve the accepted lower creek flourish** — verify match count and visual/audio timing on a known shared night. Do not replace it with the old high bell.
4. **Prototype observer sound identity** — same taxon, same timestamp, different observer; distinguish by a gentle repeatable timbral cue, including in mono and exported audio. Preserve taxonomic kinship.
5. **Save a complete composition** — reload a saved piece and recover the same event score and evidence. Clearly state any remaining audio randomness.

Do not bundle these into an aesthetic or framework rewrite. Keep the data-to-score rules testable and the listening decisions explicit. Current automated suite: 80 pass and eight pre-existing future gap-remapping TODOs. This marker correction has not received a fresh browser or listening check.

## Clarifications from Lily — 13 September

The lower creek flourish is the preferred sound. Subtle observer timbre within the taxonomic voice is the approved direction, awaiting implementation and audition.

Ring positions currently use one combined group list across both observers. A Lepidoptera ring is Lepidoptera for both people; B receives a small outward offset. Independent per-observer ring assignments are not implemented. They could reduce the number of radial slots, but would make radius mean different taxa for A and B and require explicit labels. Retaining shared taxonomic positions with paired observer lanes is the clearer proposed default; this is a design recommendation, not a newly implemented layout.

Timestamp precision must not be inferred from the presence of a seconds field. Zero seconds may represent minute-only source precision. The existing five-second pulse must not be described as proven second-level synchrony without evidence of source precision. Shared original clock minutes remain the primary rule.

## Rehearsal evidence — 13 September 2026

Five fixed-settings reference recordings and independent raw-ID audit now exist in `../../sessions/2026-09-13/`; see `listening.html` and `SESSION-2026-09-13-REHEARSAL.md`. Browser playback confirms the restored ordinary marker convention visually. Lower creek remains in actual rendered event scheduling; human listening acceptance is pending. No musical rules changed. Unknown-precision five-second pulse suppression is a documented proposal awaiting a controlled listening comparison, not an accepted or implemented change.

## Lily's listening acceptance and new direction — 13 September 2026

Lily listened to all five reference files and confirmed they sound good. The rehearsal sound is now accepted as the artistic baseline; this does not establish device-specific rehearsal results. She requested a new instrument family, with existing families potentially reconsidered later. This explicitly advances a bounded new-palette audition ahead of the pending precision-policy comparison. Preserve the accepted audio files and existing default; no existing family is retired by this request.

## Lantern Glass candidate — 13 September 2026

Implemented as an optional fifth family; Moth Orchestra remains default. Four harmonic voices vary attack, harmonic weighting and decay: felt, glass, reed and bloom. Timeline/Riff keep the same scored pitches/times, taxonomy mapping, observation identities and special gestures; only ordinary synthesis changes. Song uses its own Lantern role palette, and the existing mode-dependent arrangement seed changes the arrangement. These are designed sounds, not animal recordings. All four use the shared live/export synthesis function. Observer identity remains visual only.

The January/September comparison and a Song example are in `../../sessions/2026-09-13/lantern-glass/listen.html`. Existing references are preserved and accepted; Lantern Glass is awaiting Lily's artistic decision. See SESSION-2026-09-13-LANTERN.md for synthesis parameters, gain matching and checks. This addition neither retires old families nor changes the pending timestamp-precision policy.

## Acceptance and expanded creative brief — 13 September 2026

Lily confirmed she likes Lantern Glass: accepted as an additional family. She requested a more ambitious family with more voices and explicitly gave freedom to depart from prior artistic direction. Noctilucent is the resulting candidate, with an authored demonstration composition. Prior recordings remain preserved. Scientific provenance and the distinction between arrangement and recorded sequence stay explicit.

## Noctilucent candidate — 13 September 2026

Optional sixth family implemented: eight voices combining harmonic envelopes, vocal-formant weighting, softly evolving FM and slight upper-partial inharmonicity. Original scored fundamentals remain fixed. Source evidence and Timeline/Riff score remain unchanged except ordinary instrument assignment. The September Song demonstration uses D Dorian / seed 9032026 / 60 s, with its arrangement honestly labelled. The exhibit visualizes scheduled events and reserves halos for genuine shared minutes, distinct from composed accompaniment. See SESSION-2026-09-13-NOCTILUCENT.md and `../../sessions/2026-09-13/noctilucent/listen.html`. Candidate awaiting Lily's listening response; Lantern Glass and original reference remain accepted.

## Lily's Noctilucent feedback — 13 September 2026

“Radiance is sweet”; the rest sounds a little nasal. Desired direction: deep brass, cello rather than saxophone, warm resonance and a male/baritone-like voice rather than female-like timbre. This is specific feedback, not acceptance of the complete original Noctilucent palette.

A separate warm audition is saved in `../../sessions/2026-09-13/noctilucent-warm/`. Prism and spark remain unchanged (dominant foreground in Radiance). Six supporting timbres have softened upper partials; choir resonances move lower, halo/wire FM is removed. Choir/bow/tide are explicitly voiced down by octaves to register ceilings 220/330/220 Hz in the audition score. This is authored orchestration, not changed source evidence. Maintained index.html is unchanged in this revision; wait for Lily's listening decision before integrating. See SESSION-2026-09-13-WARM.md.
