# CLAUDE.md — PLP

Everything needed to edit this app without reading it end to end.

## What it is

A single-page, fully offline gym app for one person's Push / Legs / Pull split.
No dependencies, no framework, no network calls at any point. Vanilla HTML + CSS
+ JS in one file.

## The two files are one file

| file | role |
|---|---|
| `index.html` | **the source. Always edit this.** Loads images from `media/` |
| `PLP.html` | generated. `index.html` with every asset inlined as a data URI |
| `media/` | the assets: `.gif` animations, `-thumb.jpg`, `.webm` demos, `mus/*.svg` |
| `build.py` | regenerates `PLP.html` |

`PLP.html` is byte-for-byte `index.html` except that this one line

```
const MEDIA = {}; /* MEDIA-MAP */
```

is replaced by a `const MEDIA = { "<filename>": "data:...", … };` literal.
`asset()` reads `MEDIA` first and falls back to `media/<name>`, so the same code
runs in both. `.webm` files are **not** inlined (too big) — in `PLP.html` the
video `src` 404s and `renderDemo`'s error handler falls back to the animation.

### Rebuilding

Never hand-edit `PLP.html`. After any change to `index.html` or `media/`:

```bash
python build.py
```

It reads `MUS` and `DAYS` out of `index.html` via node, works out exactly which
files the program can ask for, base64s those and nothing else, and prints what it
inlined plus any files in `media/` that are now unused. It **fails loudly** if an
exercise references a file that isn't there, which makes it the fastest check
that a program edit is sound.

## Layout of index.html

| lines (approx) | what |
|---|---|
| 1–318 | `<style>` — CSS custom properties, light/dark, every component |
| 320–644 | markup: `#home`, `#day`, `#advice`, `#map`, the `#sheet`, `#nav`, `#timer` |
| 646–650 | `<script>` opens |
| 651–671 | `MUS` — muscle name → `[wger overlay id, "f" or "b"]` |
| 674–841 | **`DAYS`** — the whole program. Almost all edits land here |
| 843–1240 | state, rendering, rest timer, wiring |

These drift whenever the program changes. Grep for `const DAYS` rather than
trusting the numbers.

Views are `<section class="view">`; `show(id)` toggles `.on`. The exercise sheet
is a bottom sheet over whichever view is showing.

## The data model

```js
{ id:"machine-fly",          // unique; also the media basename and the save key
  video:true,                // optional — media/<id>.webm exists
  name:"Machine Chest Fly",
  target:"Chest",            // the grey line in the day list
  sets:3, reps:"12–15", rest:90, tempo:"3-1-1",
  primary:["Chest"],         // solid red on the body diagram
  secondary:["Front delts"], // lighter red
  cues:[ "…", "…", "…" ] }   // exactly three, HTML allowed (<em> only)
```

- **`id`** is the media basename *and* the localStorage save key. Every exercise
  needs `media/<id>.gif` and `media/<id>-thumb.jpg`. Changing an id resets that
  exercise's logged sets and weight — usually correct, since a different exercise
  deserves a fresh log.
- **`name`** is written to `#sheetTitle` with `textContent`, so use real
  characters (`—`, `&`), never HTML entities.
- **Muscle names** must match `MUS` keys to light up the body diagram. Names
  outside `MUS` (`Forearms`, `Lower back`, `Rear delts`) still render as chips
  and still count in the advice table — they just have no overlay SVG.
- **`reps`** is a string, so `"10/leg"` and `"12–15/arm"` are fine. Use the en
  dash `–` in ranges, matching the rest of the file.
- **`rest`** is seconds; `fmtRest` prints `< 120` as seconds and above as minutes.

State lives in `localStorage["plp.v3"]` as `{sets:{id:n}, wt:{id:"kg"}}`.
Don't bump the key for an exercise swap — unchanged exercises keep their log,
and orphaned entries are ignored.

## Adding or swapping an exercise

The animations come from
[`hasaneyldrm/exercises-dataset`](https://github.com/hasaneyldrm/exercises-dataset)
(pinned at commit `7455efae`) — 1,324 Gym visual renders at 180×180, the same
source as every clip already here. `data/exercises.json` maps names to ids;
`videos/<id>-<hash>.gif` is the animation and `images/<id>-<hash>.jpg` the thumb.
Copy them in as `media/<new-id>.gif` and `media/<new-id>-thumb.jpg`, at the
original 180×180 — the licence in `media/CREDITS.md` allows no other size — and
record the dataset id in the table in that file.

**Never ship an exercise whose animation shows a different movement.** If no
matching clip exists, change the exercise rather than the label.

## Things that must stay in sync when the program changes

`build.py` catches missing media. The advice page's per-muscle table
(`buildCoverage`) and the day progress rings compute themselves from `DAYS`.
**These are hand-written and do not update themselves:**

1. **Day `tags`** — the three muscle chips and the `~NN min` estimate. Roughly
   2 min per working set including rest.
2. **Home `.sub`** — "Five of them also have a filmed demo". Count `video:true`.
3. **Home `.foot`** — the paragraph naming which exercises are machines/cables.
4. **Advice item 10** — the "deliberately assistance-only" paragraph and the
   optional add-ons list. Any muscle that drops to 0 direct sets belongs there.
5. **`README.md`** — the program table, the three exercise lists, working-set
   counts, the `PLP.html` size, and the "Machines and cables where they win"
   section.
6. **`media/CREDITS.md`** — the dataset-id table for animations, and the webm
   table if a filmed demo is added or dropped.

## Checking a change

```bash
python build.py && python -m http.server 8731 --bind 127.0.0.1
```

Relative `media/` paths need http, not `file://`. At
`http://127.0.0.1:8731/index.html` confirm: home rings, each day list, an
exercise sheet, the Animation/Video toggle on a `video:true` exercise, dark mode,
and no console errors.

To check every animation against its exercise name at once, build a labelled
contact sheet of `media/<id>-thumb.jpg` for the ids in `DAYS` and look at it.
Still frames can be ambiguous (a lunge's first frame is someone standing), so
pull a mid-rep frame out of the `.gif` with PIL for anything unclear.

## House style

- Prose is plain, direct, second person, British spelling. No exclamation marks,
  no hype, no emoji.
- Cues are always three, ordered setup → the thing people get wrong → the detail
  that makes it work. `<em>` for emphasis inside them; nothing else.
- Every claim in the copy has to be true of the actual program. When copy and
  program disagree, fix the copy — the program is the source of truth.
- Attribution stays: Gym visual for animations, Wikimedia Commons for the filmed
  demos, wger for the body overlays, OpenStax for the muscle map.
