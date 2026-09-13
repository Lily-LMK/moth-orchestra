# Noctilucent — 13 September 2026

Lily accepted Lantern Glass and explicitly requested a more ambitious family with more voices and broad creative freedom. Delivered Noctilucent as an optional sixth palette in the maintained application, plus a one-minute composition and an audio-linked listening exhibit. Candidate acceptance is pending.

## Listening deliverable

Open http://127.0.0.1:8773/noctilucent/listen.html or `../../sessions/2026-09-13/noctilucent/listen.html`. Local server restart from Moth Orchestra: `python3 work/noctilucent-server.py`. Only loopback is bound. Saved media plays locally; live reference instrument photos retain network dependencies. The WAV/JSON paths are relative and all outputs remain in Moth Orchestra.

Hero: September 3 2026, 136 source records, 48 Family groups, 22 genuine shared minutes. Song, D Dorian, seed 9032026, loop 60 s, note level .55, both observers, Focus off, ambience off. Audio 62.5 s including tail. Its 181 score events include repetitions and composed accompaniment; not 181 observations. All eight new voices appear. Creek appears 46 times, comprising 22 evidence-backed minutes and 24 composed accompaniment gestures; only genuine minutes receive a special halo in the exhibit. This reuse is artistic, not additional shared evidence.

January and September Timeline studies use accepted seed 1/D pentatonic/19 s/Family/.35 note volume settings. Captured ordinary scores and special gestures agree exactly with the original references apart from ordinary instruments. January comparison with accepted Lantern Glass is RMS-adjusted by constant attenuation (Noctilucent -0.0398 dB, Lantern unchanged), not a perceptual-loudness guarantee. Original files retained. Hero mono version included.

## New synthesis

Eight authored voices: velvet root, bowed resonance, halo, prism, wordless choir, spark, tide and wire. Multi-partial sine synthesis uses independently evolving envelopes, formant weighting for choir, and low-index FM on an upper partial for halo/wire. Prism/spark have slight upper-partial inharmonicity, while the scored fundamental is fixed. These are instruments, not organism recordings or inferred biological traits. Max seven oscillators per note; each voice ends within 2.4 s, with cleanup. Brightness eases at high registers; direct partial frequencies stay below .45 sample rate. Low-index FM includes an upper-register guard but is not a formal proof of complete absence of aliasing.

One shared scheduler handles live, audition and offline output. Existing family defaults, special Timeline/Riff gestures, source timing, pitch selection and matching remain unchanged. Song adds its own role pool; voiceMode is part of its existing arrangement seed. No new observer timbre was implemented. App markers remain A filled/B outlined; the separate exhibit uses circle/diamond with explicit names as an intentional presentation choice. No existing family was retired.

## Verification

41 tests written before integration, then green; full application suite 146 pass / 0 fail / 8 pre-existing gap TODOs. Four exhibit behavior tests pass: evidence-only halos, seek reconstruction, single animation loop, reduced-motion geometry. Independent 45-combination source audit also passes. Existing musical fixtures unchanged.

Real WebAudio renders: finite samples, no clipping at stated levels. Float peaks January .14169, September .25691, hero .38499. Output settings/source hash, waveform hashes, actual voice usage and comparison gains in `verification.json`, `manifest.json`, and per-piece JSON. Files produced by the real maintained synthesis code. Existing creek/pad still use random noise: byte reproducibility for full pieces is not guaranteed.

Browser verified hero playback at 62.5 s, animated composition phase and events, no logged console errors/warnings, reduced-motion toggle, 390 px width without horizontal overflow. Desktop playback and mobile viewport screenshots saved. Full-page mobile screenshot had stitching artifacts; use exhibit-mobile-viewport.jpg for the inspected mobile evidence. Not a real phone test. No headphone/speaker/subjective or 30-minute stability acceptance inferred.

Scripts in `work/`: build-noctilucent-preview.py, noctilucent-server.py, verify-noctilucent.py, noctilucent-exhibit.test.cjs. Draft synthesis fragment and notes remain for provenance; maintained implementation is index.html.

## Next

Have Lily hear the complete September composition and judge the emotional trajectory, not merely choose another preset. Record keep/refine/reject and the moment she responds to. Then decide the next bounded improvement around that feedback. Original roadmap precision policy, observer identity, readable circle and composition persistence remain outstanding. Unknown-precision five-second pulses and misleading date diamond are unchanged. No commit, push or release. Prior uncommitted repairs preserved.
