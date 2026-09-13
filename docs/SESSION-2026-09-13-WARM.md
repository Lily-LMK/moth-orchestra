# Noctilucent warm revision — 13 September 2026

User feedback: Radiance sweet, remaining sound a little nasal; prefers deep brass, cello not saxophone, warm resonance and male/baritone-like voice rather than female-like timbre.

Delivered a separate audition at http://127.0.0.1:8774/noctilucent-warm/listen.html, saved under `../../sessions/2026-09-13/noctilucent-warm/`. Server: from Moth Orchestra run `python3 work/noctilucent-warm-server.py`. Original Noctilucent and maintained application unchanged. No release or commit.

## Changes

Radiance (37.5–45 seconds) is dominated by prism/spark: 28/22 attacks. Those synthesis definitions and score events are preserved. Other voices gain stronger fundamental/lower harmonic weighting and less upper resonance. Choir formant weighting moves from 650/1250 Hz to 380/760 Hz with far less upper boost. Halo/wire FM is removed. These are approximate synthesized cello/brass/baritone colours, not acoustic samples or a singer model.

The audition lowers choir notes by octaves until <=220 Hz, bow <=330 Hz, tide <=220 Hz. 21 of 181 arranged events change by one or two octaves. Original score MIDI/frequency fields are retained on changed events. All timing, source observation material, grouping, density, special gestures and 22 shared-minute evidence objects remain identical. Settings remain D Dorian, seed9032026, 60s, both, Family, note .55, ambience off/Focus off.

## Listening comparison and checks

Original and warm full pieces use constant gain to match whole-file RMS; warm attenuated 1.4639 dB, original unchanged. Approximate listening level, not perceptual certification; no limiter/compressor. Original and warm 35–48-second Radiance-in-context excerpts have 10ms fades at cuts. Raw files retained.

Actual WebAudio capture: peak .53825, RMS .02151, zero nonfinite samples; unclipped at audition level. `verification.json` records all octave changes, score equality after reversing only those changes, unchanged prism/spark and source SHA. Maintained application SHA agrees with input snapshot. Browser captured audio successfully with no logged warning/error; listening document opened. Four reused exhibit behavior tests pass. No broad app rerun because maintained source unchanged; last app suite was 146 pass/8 TODO. No human listening verdict or real-device check asserted.

Reproduce preview: work/build-noctilucent-warm.py. Verify/render comparison assets: work/finish-noctilucent-warm.py. In-page capture button writes only local warm WAV/JSON. The preview wraps buildSequencer to apply documented octave voicing, so live and export agree. This is deliberately audition-only; do not silently promote it to maintained synthesis.

Next: Lily compares the warm full piece and Radiance excerpts. Ask whether the cello/low brass/baritone direction is closer, and preserve Radiance's sweetness. If accepted, implement a versioned/explicit register treatment with behavior tests in maintained source and retain originals. Previous palette acceptances (original reference and Lantern Glass) remain.
