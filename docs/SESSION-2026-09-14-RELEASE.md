# Release — Gondwana goes live, 14 September 2026

Lily heard the second pass and accepted it: *"it sounds good, I'd love to make
it live."* Gondwana is the sixth published family.

## What changed at release

One line. `WITHHELD_VOICE_MODES` drops to `{"noctilucent"}`, so Gondwana now
appears in the dropdown, the keyboard cycle and the swipe list. Nothing about
the sound, the score or any other family changed in this commit — the build
that was released is exactly the build she judged.

`PUBLIC_VOICE_MODES` is now: Moth Orchestra, Boobook, Frog Yawn, Fireflies,
Lantern Glass, **Gondwana**.

Noctilucent stays withheld. It is implemented, tested and reachable with
`?family=noctilucent`, and it has still never been heard. Measurement does not
release a family; only Lily's ear does.

## What Gondwana is, in one paragraph

Nine bodies built from physical models and named for their physics — a
close-miked felted piano leading at a little over a quarter of arrivals, struck
heartwood, struck bronze, a bowed body, a blown stopped column, a large struck
membrane, a rubbed rim, a sustained beating tube, and one honestly electronic
pulse. They sound into a synthesised hall on their own bus, and they are the
first family in the instrument that decides *how much a record says*: phrase
length is how completely the record was identified, kingdom to species. The two
observers subdivide the pulse differently and drift against each other all
night; at a shared minute, both hands land on the same note.

## Tests at release

239 in the suite, 0 failures, 1 documented skip, 8 gap TODOs. 75 of them
Gondwana's. The two that changed for the release are the withheld-list guards
in `gondwana.test.cjs` and `noctilucent.test.cjs`, which now assert the
published six and that Noctilucent is not among them.

## Still open

Steps 2 to 5 of [PLAN-NEXT-FAMILY.md](PLAN-NEXT-FAMILY.md) are unbuilt: the
ground (the body-felt sub on genuine shared minutes), the floor (a bed
generated from the night's own shape), the gallery-versus-personal mix, and the
Song-mode opening where a piano motif breaks into something geological. Song
mode has Gondwana's voices, strike and shared minute but not its figures or
pedal.

No offline renders and no fresh headroom measurement since the strike was
added. The gallery system is still months away, and the large-room case remains
designed blind.
