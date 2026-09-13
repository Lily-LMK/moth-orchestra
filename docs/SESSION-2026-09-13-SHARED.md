# Shared minutes, the minimal view, and the control column — 13 September 2026

Three requests from Lily: a toggle for the centre card so the view can be
minimal; shared minutes were showing only one observation; and the left-hand
column still looked old fashioned.

## Shared minutes were never reaching the card — a real bug

`scheduleSelectionOverlay` began `if(!e || !e.obs || e.isEcho) return;`. A
shared-minute event carries its evidence in `e.match.observations`, with
`obs:null`, so every shared minute was dropped before it could be shown. What
appeared instead was whichever ordinary arrival sounded nearest to it. The one
moment the instrument exists to show was the one moment it never showed.

The card now takes shared minutes and renders the pair: both photographs side
by side, each observer's name in their own accent, each species beneath, and
between them a thread with a node at the join. Under it, the minute itself and
"Shared minute", then "Both recorded inside this minute" and — kept, because
it is the truth and the roadmap protects it — "Same minute, not the same
instant". Where a minute holds more than one record per observer, the count of
the remainder is stated rather than hidden.

Nothing here is inferred. The observations, the observers and the minute all
come from the match the sequencer already built from original timestamps.

**Given room to be felt.** A shared minute holds the card for 1.6 seconds
against ordinary arrivals, so the next moth does not wipe it in 200ms. On the
ring, a pulse now opens outward from the exact point on the clock where the
two coincided and fades over 1.5s, and both observers' thumbnails flash in the
gallery together. The audible creek flourish is unchanged.

## The centre card can be switched off

A switch under **View**, and **C** on the keyboard. Off leaves the circle, the
clock and the sweep alone — the minimal reading of the night.

## The control column

Rebuilt as a specification sheet. The reference points are Swiss typographic
practice and the conventions of an instrument colophon: one alignment grid,
label left and value right, the value carrying the weight; hairlines instead
of boxes; a single accent colour used exactly once, on Play.

The significant move is that the control is no longer drawn. Each row *is* the
control — the native select is laid transparently across the whole row — so
what you read is the setting rather than a widget containing the setting.
`syncSpecRows` mirrors each select's chosen option into the value beside its
label, and runs after every rebuild so programmatic changes stay in step.

Secondary actions (Remix, Restart, Key) are tracked uppercase text with an
underline on hover, not buttons. Sliders are a hairline and a dot. Both/A/B is
three words with the live one underlined in that observer's accent. The
night's figures are set as type — 48 records, 45 taxa — not in tiles.

A soft radial ground sits behind the centre card so it separates from the
arrivals at finer taxonomic ranks, where the inner ring comes closer, without
drawing a panel around it.

## Checks

155 pass, zero fail, one documented skip, eight pre-existing gap TODOs.
Verified in a browser at 1440x900 and 390x844: the shared-minute card renders
both observers and both species from a real match on the demo night (8:05 PM,
Chris Burwell / Epicoma contristis and Lily Kumpe / Maliattha ferrugina), every
spec row shows its live value, and the toggle hides and restores the card.

Not verified: anything by ear, on physical hardware, or on the exhibition
display. The gallery fullscreen view is still untouched and unchecked under the
new design layer.
