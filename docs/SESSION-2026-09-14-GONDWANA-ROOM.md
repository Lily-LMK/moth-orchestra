# Gondwana — the room you pass through

14 September 2026, second pass. Follows
[SESSION-2026-09-14-GONDWANA-FIGURES.md](SESSION-2026-09-14-GONDWANA-FIGURES.md).

**Accepted by ear and published, 14 September 2026.** Lily: *"it sounds good,
I'd love to make it live."* Gondwana is the sixth family in the dropdown. See
[SESSION-2026-09-14-RELEASE.md](SESSION-2026-09-14-RELEASE.md).

Audition: **START HERE.html** at the top of the Moth Orchestra folder now indexes
every audition, sampler and session note in one page. Regenerate it with
`python3 "work/build-index.py"` after any session that makes something to hear.

## What Lily heard, and what was wrong

Four things, three of them faults.

**"The synchronicity sound is exactly the same across all voice families."**
Correct, and it was the worst gap in the instrument. The shared minute is the
entire point of the piece and every family had been sounding it with the same
borrowed `creek` — a bandpass noise wobble. The emotional centre was generic.

**"I don't hear arrivals anymore. The wand passes through but I don't get a
sense that I'm passing through."** Also correct, and the diagnosis is acoustic.
Gondwana had a 4.6-second room and no transient anywhere. In a real space the
direct sound reaches you milliseconds before the room answers, and that gap is
the only cue that something happened *here, now*, rather than somewhere in the
wash. Reverb gives a family size; the transient gives it location. There was
size and no location. Compounding it: the velocity floor had been dropped to
0.06, which is not quiet, it is absent.

**"At species level most moths will only be recorded once in a night. We don't
want rules that make listening at species rank sound less rich."** This is the
design error, and it was mine. The 14 September figure rule made phrase length
a function of how often a voice repeated. At species rank almost nothing
repeats — so the most specific listening became the thinnest. That is the exact
inverse of the finding this whole family was built on (§1 of the plan: species
feels richer than tribe). Measured: species rank ran at 4.0 notes/sec against
7.8 at family rank. The rule was reading the wrong axis.

**"Something gained but also something lost."** The seven bodies are all still
there and untouched in substance — but the piano had been given two arrivals in
five, and a close dry source beats a reverberant one at equal share, so the
piano was winning twice.

## The fix: resolution, not repetition

What actually rises with specificity is not repetition. It is **how completely
the record was identified.** Eleven ranks, kingdom to species. A record that
fills all eleven is fully known; one logged as *Lepidoptera* is barely known at
all. Phrase length is now that count:

| Ranks filled | Phrase |
|---|---|
| ≤ 8 | 1 note |
| 9 | 2 notes |
| 10 (genus) | 3 notes |
| 11 (species) | 5 notes |

A moth identified to species gets to speak its whole name; one logged to family
gets a single syllable. The phrase says something true about the record, and it
is a property of the *record*, so it behaves identically at every listening
rank. Species rank can never again be the thin one — there is a test that fails
if it is.

Measured across the dataset — 6,794 records — this is a genuinely rich signal:

| Deepest rank reached | Share |
|---|---|
| species | 67% |
| genus | 19% |
| family | 6% |
| subfamily | 3% |
| superfamily | 2% |
| tribe | 2% |
| order | 1% |

And it varies *within* a night. On 3 September 2026: 74 species-level records,
22 genus, 19 family, 8 subfamily, 6 superfamily, 5 tribe, 2 order.

Density is held by a second rule rather than by shortening phrases: on any given
cycle a record either speaks its figure or just sounds its note, seeded at about
45%. So the night keeps real silence, no two passes are alike, and the densest
night stays a place rather than a wall. The first pass never elaborates at all.

Notes per second, cycle 0 → cycle 12:

| Night | class | family | species |
|---|---|---|---|
| 28 Jan 2026 (48 records, 19 s) | 2.5 → 4.5 | 2.5 → 3.7 | 2.5 → 3.7 |
| 3 Sep 2026 (136 records, 40 s) | 3.4 → 4.8 | 3.4 → 4.6 | 3.4 → 4.7 |

Flat across rank, and about 40% sparser at family rank than the 14 September
build, which reached 7.8.

## The strike

Every struck body now sends a short bright transient — about 4 ms up, 30 ms
down — down a **direct path that bypasses the convolver entirely**, so it
arrives ahead of its own reverb. Struck bodies get a hard one (heartwood 0.85,
membrane 0.78, bronze 0.70), the piano a moderate one, the blown column barely
any, and the bow, the rim and the drone none at all — a bowed string has no
transient, which is precisely why it reads as atmosphere and a struck body reads
as an event.

Also: the room came back from 4.6 s to 3.9 s, and the velocity floor from 0.06
to 0.10.

## The shared minute

Gondwana's own, at last, and made of the thing it means.

All night the two observers subdivide the pulse differently — A in three, B in
four — and drift apart. At a shared minute, **both hands land on the same note**,
for the only time in the piece. Felted piano at the written pitch and an octave
above, struck together; heartwood two octaves below for weight you feel rather
than hear; the room answering a tenth of a second later in bronze.

The drift resolving *is* the sound of the coincidence. It is not a bell laid on
top to announce that something happened. Every other family keeps `creek`
exactly as it was, and there is a test that says so.

## Rebalanced

The piano is down from 40% to a little over a quarter, and every body keeps a
real share of the pool. On 3 September at species rank: felt 32%, membrane 18%,
heartwood 11%, column 10%, pulse 9%, rim 7%, bowed 7%, bronze 4%, drone 2%.

## Tests

75 Gondwana tests (was 68). Suite total 239, 0 failures, 1 documented skip, 8
gap TODOs. New guards worth naming:

- **listening rank never changes how much a record says** — every record's
  phrase length is compared across all six ranks and must be identical, and
  species rank must not be the poorest. This is the regression that prompted
  the rewrite.
- **resolution is the count of ranks the record itself fills** — and a blank or
  whitespace rank is a missing identification, not a free note.
- **struck bodies arrive by the direct path, bowed ones do not.**
- **the shared minute is Gondwana's own** — several bodies, hands landing
  together, something under 90 Hz — **and every family keeps its own gesture.**
- **the first pass never elaborates, and after it speaking is intermittent.**

## What has not been done

No listening judgement. Song mode still gets the voices, the strike and the new
shared minute, but not figures or the pedal — the cinematic opening is still
unbuilt. The floor and the ground (§3) are still unbuilt. No offline renders.
No new headroom measurement, and the strike adds transient energy that the
§4 figures do not account for.

## Dials

| What | Constant | Now |
|---|---|---|
| How much piano | `GONDWANA_POOL` | 7 of 25 |
| Figure spacing | `GONDWANA_PULSE` | 0.30 s |
| How often a record speaks | `gondwanaSpeaks` | 0.45 |
| Phrase length by resolution | `gondwanaFigureLength` | 1 / 2 / 3 / 5 |
| Strike hardness | per-voice `strike` | 0 – 0.85 |
| Room length | `gondwanaImpulse` | 3.9 s |
