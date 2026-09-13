# The circle view rebuilt — 13 September 2026

Lily's verdict on the first interface pass: the key I added was never asked
for and sat on top of the observation photograph; the whole interface needed
to reach modern standards; the gallery fullscreen view is the one that already
looks right. Three concrete requirements: fold the left-hand controls away,
truly experience the record that is sounding, and get a feel for the night —
"7:03PM versus 7:04PM".

The gallery view is the design reference. It works because nothing is fenced:
photographs on near-black, thin widely-tracked type, no panels or outlines.

## The key is gone from the canvas

Removed entirely as a floating panel. Its content now lives in the help
overlay under "Reading the circle", alongside the shortcuts, and names the two
observers and the selected rank from live state. It is one tap away and never
covers a photograph.

## The record that is sounding

The ring now frames the observation instead of describing one in a corner.
`updateSelectionOverlay` already fired at the exact moment a note sounded; the
card it filled was a 52px thumbnail wedged into the bottom-left. It is now the
centre of the circle:

- the photograph at up to 126px, collapsing cleanly when a record has none
- **the recorded clock time**, large and light — 8:06 PM
- how long the sheet was quiet before it: "a minute later", "12 minutes
  later", "first of the night"
- species, order and family, and which observer, with their accent

The clock is the observation's own timestamp, not the playhead's position, so
it stays true however the loop is compressed or the window moved. In Song the
card reads "arranged" and says plainly that Song is a composition, not a
recorded sequence — there is no real clock to show and inventing one would
misrepresent the data.

The sweep line was shortened to start at half radius so it no longer crosses
the centre. On a phone the card becomes a bottom strip rather than shrinking
into the ring.

## The night has a clock

The 48 evenly spaced decorative ticks are replaced by the actual clock of the
night, drawn outside the arrivals. Tick spacing adapts: minute marks and
ten-minute labels on any window under two hours, coarsening to three-hourly
on a whole night. Labels are clamped inside the canvas so a narrow phone
cannot push them off the edge. Brisbane has no daylight saving, so minute
boundaries align on absolute epoch minutes and no per-tick timezone maths is
needed. Song keeps neutral loop divisions.

The demo night now reads 8:00, 8:10, 8:20, 8:30 PM around the ring with
minute marks between them.

## The controls fold away

A tab on the canvas edge folds the sidebar out of the way; **H** toggles it;
hovering the tab peeks it back without committing. The circle then has the
whole screen, which is the exhibition case.

The first attempt used an invisible 14px hot strip, which swallowed clicks on
the toggle because `.canvasCard` establishes its own stacking context and the
strip's higher z-index sat above the whole card. Folded into the tab instead.

Folding the sidebar also exposed a real bug: `fitCanvasFast` caches the canvas
rect and only invalidated it on window resize, so a layout change that resized
the canvas without resizing the window left the drawing stretched across a
backing store of the wrong width. A ResizeObserver on the canvas now handles
that, and fullscreen, and anything similar in future.

## Less box, more air

Stat tiles, disclosures and the segmented control lost their outlines;
hairlines and spacing carry the structure. Mode tabs, the Riff window, the
Full screen button and the status line lost their slabs and blurs and read as
captions on the work rather than a toolbar in front of it.

## Checks

155 pass, zero fail, one documented skip, eight pre-existing gap TODOs.
Rendered and measured at 1920x1080, 1440x900 and 390x844, folded and unfolded:
canvas backing store correct after folding, no horizontal scroll, no page or
console errors, clock and gap text populating from live state.

Not verified: anything by ear, on physical hardware, or on the exhibition
display. The gallery fullscreen view was not modified and was not re-checked
under the new design layer. Photographs could not load in the headless render,
so the no-photo path was exercised but a real image was only simulated.
