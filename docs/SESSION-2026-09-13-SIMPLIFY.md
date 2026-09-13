# Simplification and the masthead — 13 September 2026

Lily: remove season filtering and the Both/A/B listening control; move the
night's figures to the top; the title, subtitle and Play need real design
work; and Ambience is not adding anything and needs rethinking at some point.

## Removed

**Season filtering** is gone from the interface and from the code — the
control, its listener, `syncSeasonSelect`, `seasonFromMonth`, `state
.filterSeason` and the branch in the date filter. Nothing references it.

**Both / A / B** is gone from the interface. Lily's reasoning is right and
worth recording: if you want one observer, you import one observer's records.
A filter that silently changes what "the night" means is a worse answer than
choosing what to load.

Solo remains an engine capability. `setListenMode` and the solo paths in the
sequencer, the wand and the duet gestures are untouched and still tested,
because removing them would rewrite accepted musical behaviour to serve an
interface decision. The interface simply stops offering the choice, and the
mode stays "both".

`tests/controls.test.cjs` extracts `setListenMode` from source between two
function declarations, and the second one no longer exists. Its slice now ends
at `setListenMode`'s own closing brace. The seam moved; the expectations did
not.

The per-observer order hint ("Orders — A: 4 • B: 5") went with the control.

## The night's figures lead

Records, taxa, voices and shared minutes now sit directly under the masthead,
headed by the date spelled out — "28 January 2026" — so the figures belong to
an evening rather than floating free. The shared count joins them, so the
disclosure below no longer repeats it and is titled "Shared minute evidence".

The Date control follows the figures it describes, and the "The night" heading
is gone: a heading over a single row is wasted structure.

## Masthead and Play

The wordmark was green uppercase over a second tracked uppercase line — two
competing voices, and the accent spent twice, since Play is also green. The
title is now mixed case at 21px in weight 200, near-white, with one tracked
descriptor beneath and a rule to close it. The accent belongs to the single
action that does something.

Play is the only filled element in the column: full width, 44px, a 3px radius
so it reads as a switch rather than a web button, uppercase and widely tracked,
in a deeper green (#0d8f5c) that sits on near-black without shouting.

The gallery header, which was still wearing pill buttons, now speaks the same
language as the rest of the column.

## Ambience, parked

Ambience is not removed — that is a decision about the sound, and Lily has
said she wants to rethink it rather than drop it. It is demoted from two
top-level rows to a closed disclosure, so it stops occupying the attention of
a feature that is currently earning none. The synthesis is untouched.

## Checks

155 pass, zero fail, one documented skip, eight pre-existing gap TODOs.
Verified in a browser at 1440 wide: the figures populate (48 records, 45 taxa,
1 class voice, 8 shared), the date heading reads "28 January 2026", no season
or listening control exists in the DOM, listenMode is "both", and the six
remaining settings rows are Date, Voice family, Key, Scale, Tone by, Ambience.

Not verified: anything by ear, on hardware, or on the exhibition display.
