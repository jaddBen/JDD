HEAD
# FitTrack — Fitness Tracker Web App

A **100% free, static** fitness tracking web app hosted on GitHub Pages. No server, no database, no cost.

## ✨ Features

- 📊 **Dashboard** — daily calorie ring, TDEE, burned vs consumed balance
- 👤 **Profile** — BMR/TDEE calculator (Mifflin-St Jeor), goal setting, weight log
- 🏋️ **Workouts** — log by activity type (MET formula) or walking/running distance
- 🥗 **Nutrition** — manual food entry + live search via Open Food Facts API
- 📈 **History** — Chart.js charts: calories, workout minutes, weight trend, activity breakdown
- 🍎 **Apple Health** — import `export.xml` file OR auto-sync via iOS Shortcuts → GitHub API

## 🏗️ Architecture

```
Pure static HTML/CSS/JS → GitHub Pages (free)
     ↓
localStorage (all user data stored in browser — private, no server)
     ↓
Apple Health Bridge:
  Option A: upload export.xml → parsed in-browser
  Option B: iOS Shortcuts → GitHub API push → data/health.json → auto-read
```

## 🚀 Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source: Deploy from branch → main / root**
3. Your app is live at `https://<username>.github.io/<repo>/`

## 📱 Apple Health Sync (Free)

### Method 1 — Manual Import (easiest)
1. Health app → Profile photo → Export All Health Data
2. Extract zip → upload `export.xml` on the **Apple Health** page

### Method 2 — Automatic Daily Sync via iOS Shortcuts
1. Create a GitHub PAT (fine-grained, repo contents write)
2. Build an iOS Shortcut:
   - Get Health Samples (Steps, Active Energy, Distance, Exercise Minutes)
   - PUT request to `https://api.github.com/repos/YOUR_USER/YOUR_REPO/contents/data/health.json`
   - Set as nightly automation
3. FitTrack auto-reads `data/health.json` on the Apple Health page

## 🧮 Calorie Engine

| Formula | Description |
|---|---|
| **BMR** | Mifflin-St Jeor (10×W + 6.25×H - 5×A ± 5/161) |
| **TDEE** | BMR × activity multiplier (1.2 – 1.9) |
| **Exercise burn** | MET × weight(kg) × hours |
| **Distance burn** | Weight-adjusted kcal/km factor |
| **Net balance** | TDEE + burned - consumed |

## 📦 Tech Stack

- Vanilla JS (no framework, no build step)
- Tailwind CSS via CDN
- Chart.js v4 via CDN
- Open Food Facts API (free, no key)
- `localStorage` for all persistence

## 📄 License

MIT
=======
# PLP — Push · Legs · Pull

A 3-day training app. Open it, pick Day 1, 2 or 3, and work through the
exercises. Every exercise shows a **3D animation of the movement with the
working muscles shaded red**, a front-and-back body diagram, sets, reps, rest,
tempo and form cues. Five exercises also have a short filmed demo you can
switch to.

It runs entirely offline. Nothing is fetched from the internet at any point.

---

## Put it on your phone

**`PLP.html` is the whole app in one file** (4.5 MB) — every animation, diagram
and image is built into it, so there is no folder to keep together and no path
can break.

1. Copy `PLP.html` to your phone — USB cable, WhatsApp to yourself, Google
   Drive, or the OneDrive app (this folder is already inside OneDrive).
2. Open it with Chrome (Android) or Safari (iPhone).
3. Worth doing — **add it to your home screen**, so it opens like a normal app:
   - Android / Chrome: ⋮ menu → *Add to Home screen*
   - iPhone / Safari: Share → *Add to Home Screen*

If you also want the filmed demos on your phone, copy the whole folder instead
and open `index.html`. Without them the app still works — those exercises just
show the animation.

On a computer, double-click either file.

---

## The vertical pull

Day 3 opens with the **lat pulldown** — the machine every gym has. It is the
same movement as a pull-up, the same muscles, except you pick the weight
instead of lifting all of yourself. No assisted machine, no bodyweight
requirement, nothing to set up.

Keep adding to the stack. Once you can pull down roughly your own bodyweight
for 8 clean reps, a real chin-up is usually there waiting. The advice page has
the full plan — pulldowns, negatives and dead hangs — plus what to do if your
gym has no pull-up bar at all.

---

## Machines and cables where they win

The program uses the machine or the cable whenever it does the job better than
the free-weight version, and free weights everywhere else:

- The chest fly is a **machine fly (pec deck)** — the weight rides on a track,
  so nothing has to be balanced and all of the effort goes into the chest.
- All three triceps movements are on the cable: an **overhead cable extension**
  for the long head in its stretched position, a **two-hand pushdown** as the
  heavy one, and a **single-arm pushdown** as the finisher, so neither arm can
  cover for the other.
- The ab work is the **captain's chair leg raise** — same movement as a hanging
  leg raise, but your grip no longer decides when the set ends.
- The unilateral row is a **machine row** with your chest on a pad. Most of them
  let you work one arm at a time or both together.
- The barbell curl is an **EZ-bar curl, wide then narrow**: sets 1–2 wide for
  the short head, sets 3–4 narrow for the long head.

Every one of those has its own animation, pulled from the same Gym visual
dataset as the rest — the machine you will actually stand in front of, not a
free-weight stand-in.

### No direct rear-delt work

The dumbbell reverse fly is gone. Rear delts still take a share of all four
pulls on Day 3 plus the band pull-aparts in that day's warm-up — 14 assisting
sets a week. If your shoulders sit rolled forward and you want direct work
anyway, the advice page lists it as an optional add-on (reverse pec deck or face
pulls, 3 × 15–20 at the end of Day 3).

---

## The program

| | Day 1 | Day 2 | Day 3 |
|---|---|---|---|
| | **Push** | **Legs** | **Pull** |
| Trains | Chest, shoulders, triceps | Quads, hamstrings, glutes, calves | Back, traps, biceps |
| Exercises | 8 | 8 | 7 |
| Working sets | 26 | 27 | 24 |

**Day 1 — Push.** Bench press · incline dumbbell press · seated dumbbell
shoulder press · machine chest fly · lateral raise · overhead cable extension ·
triceps pushdown · single-arm cable pushdown

**Day 2 — Legs.** Back squat · Romanian deadlift · leg press · dumbbell lunge ·
lying leg curl · leg extension · standing calf raise · captain's chair leg raise

**Day 3 — Pull.** Lat pulldown · bent-over barbell row · seated cable row ·
machine row · dumbbell shrug · EZ-bar curl (wide, then narrow) · hammer curl

Train on three non-consecutive days — Monday / Wednesday / Friday, or
Tuesday / Thursday / Saturday. Never all three back to back.

**Progression.** Log your working weight in the app. When you hit the top of the
rep range on every set of an exercise, add a small amount of weight next session
and start again at the bottom of the range.

---

## What the app does

- **Three day buttons** on the home screen, each with a progress ring.
- **Animated demo** for every exercise — a 3D figure running the rep with the
  muscles it works shaded red, looping.
- **Animation / Video toggle** on the five exercises that have a filmed demo.
- **Muscle diagram** under each exercise: front and back body, primary muscles
  in solid red, secondary in a lighter shade, all named underneath.
- **Muscle map** on the home screen — the full labelled muscular system.
- **Advice page** — ten things that actually matter, in order, including a plan
  for getting your first pull-up and a live table of weekly sets per muscle,
  counted straight off the program.
- **Set tracker.** Tap a set as you finish it; saved on the device.
- **Rest timer** starts by itself when you log a set, and beeps and vibrates
  when the rest is up. `+30` adds half a minute.
- **Swipe left or right** inside an exercise to move between exercises.
- **Light and dark**, following your phone, with a manual toggle.

---

## Files

| file | what it is |
|---|---|
| `PLP.html` | the app, self-contained — **put this on your phone** |
| `index.html` | the same app, loading from `media/` (adds the filmed demos) |
| `media/` | animations, thumbnails, videos, muscle diagrams, `CREDITS.md` |
| `build.py` | regenerates `PLP.html` from `index.html` + `media/` |
| `CLAUDE.md` | how the app is built, for editing it later |
| `README.md` | this file |

`index.html` is the source. `PLP.html` is generated from it by `python build.py`,
which inlines only the assets the program actually references.

---

## Where it came from

The **PLP split** — Push / Legs / Pull, trained naturally — comes from the
Instagram reel by **@bigg_bosse_casa**. That reel names the split and nothing
more, so the exercise selection, sets, reps, rest and cues here were written for
this app rather than taken from the video.

The **animations are © Gym visual** (gymvisual.com), used here at the 180×180
resolution and with the attribution their redistribution permission requires.
**This is for your own private training only** — if you ever want to publish or
sell anything built on them, get a licence from Gym visual first. Full details
and the other sources are in `media/CREDITS.md`.

---

## A note on training

This is a general program, not medical advice. If you have an injury or a health
condition, get it checked before starting. Leave a rep or two in the tank on the
heavy compound lifts rather than grinding to failure on every set — that is how
most people get hurt.
8e9a0096f3989f08cde37e9373bb8ce19cd37108
