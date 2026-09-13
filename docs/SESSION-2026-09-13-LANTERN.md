# Lantern Glass audition — 13 September 2026

Lily accepted all five rehearsal reference recordings and requested a new instrument family. This is a user-directed palette audition ahead of the pending precision-policy work. Existing families remain available and Moth Orchestra remains the default.

## Delivery

Lantern Glass is an optional fifth family in the maintained `index.html` dropdown and existing keyboard/touch cycling. Four new voices use normalized harmonic sine partials with independently decaying envelopes: felt (8 ms attack / 620 ms fundamental decay), glass (18 / 1120), reed (55 / 780), bloom (110 / 1350). Shorter upper-partial tails are an authored choice intended to soften dense passages. No noise, random detune, stereo dependency, pitch remapping or added observation notes in these four voices. Partial frequencies are bounded below 45% of the sample rate; stopped sources disconnect.

Timeline/Riff select voices by the same group/seed hash; original timing, pitches, density, IDs and special gestures remain unchanged against mixed. Song has Lantern role pools and creek sync; its existing mode-dependent seed produces a different arrangement, so Song is explicitly not the timbre-only comparison. The same scheduleInstrument path serves playback, audition and export. No observer-specific sound signature has been added.

## Listening package

`../../sessions/2026-09-13/lantern-glass/listen.html`, served at http://127.0.0.1:8772/lantern-glass/listen.html. Restart from working folder: `python3 work/lantern-server.py`. Server root is the dated session; bound only to loopback. Files and private review copies remain inside Moth Orchestra. Accepted references are untouched.

January and September pairs: same Timeline/Family/D pentatonic/seed 1/19 seconds/both/0.35 note volume/no ambience/Focus off settings. Each file includes a 2.5-second tail. Whole-file RMS gain adjustment is approximate listening matching, not certified perceptual matching: reference January -0.409 dB, reference September -0.376 dB, candidate 0 dB. No limiter/compressor. Mono files supplied. Separate September Song sample included. Manifest, rendered scores, float measurements and comparison-checks.json retain exact settings and source hash.

## Evidence

Tests written first: six expected red failures, then 25 Lantern checks passing. Full suite: 105 pass, zero fail, eight pre-existing gap TODOs. Existing score fixtures unchanged. Tests cover group determinism, reference score parity, shared-minute creek, Song orchestration, silence/invalid inputs, four distinct timbres, frequency limits and source cleanup.

Actual browser renders: January peak 0.14972, September 0.28101, Song 0.22880 (all float < 1, zero nonfinite samples). Captured January/September observation scores, special gestures, shared-minute evidence and groups exactly match accepted reference scores apart from ordinary instruments. Browser showed Lantern Glass and expected counts; dense playback screenshot saved. Song browser reported no console warnings/errors at check time. Independent 45-combination rehearsal score verification still passes.

## Open decisions and limits

Lily has accepted the original rehearsal, not yet this candidate. Ask whether to keep Lantern Glass as an additional family, especially whether September remains clear and inviting. Review mono/headphones/speakers with Lily; no subjective listening verdict is fabricated from the measurements. Full-volume stress, physical mobile and long-session rehearsal remain pending. Existing noise-based special gestures retain waveform randomness. Unknown-precision five-second pulse policy is unchanged, still awaiting comparison. Date diamond labeling remains misleading. No existing family retired, no commit/push/release.
