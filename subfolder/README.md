# JDD Fitness — workout, food & calorie tracker (GitHub Pages-hostable PWA)

A self-contained, iPhone-friendly fitness web app. Log **push / pull / legs** workouts, food from a ~190-item database, walking/running/cardio, and let the app compute your **BMR / TDEE / target calories / macros** and how many calories you still need (surplus or deficit). It can also **ingest data from Apple's Shortcuts app**, so your iPhone's Health data (steps, active calories, distance, sleep) flows into the web app for free — no server, no paid API.

Built to drop straight into the existing [jaddBen/JDD](https://github.com/jaddBen/JDD) repo and be hosted on **GitHub Pages**.

---

## Features

- **Push / Pull / Legs** (and Cardio + Manual) workout logger with per-set reps/weight, auto-estimated calories burned via MET × body weight, exercise database of ~75 movements.
- **Food logging** with a built-in **~190-item database** (Protein, Grains, Fruit, Vegetable, Dairy, Nuts, Legume, Soup, Sauce, Snack, FastFood, Drinks), search + category filter, quantity scaling, custom-food entry.
- **Calorie math** — Mifflin-St Jeor BMR, TDEE = BMR × activity, target applies a deficit or surplus; protein g/kg, fat % of calories, carbs from remainder.
- **Dashboard** — calorie ring (eaten / goal / burned), macros with progress bars, today's food + workout lists.
- **Stats** — 7-day bar chart vs goal, 30-day net-surplus/deficit line, all-time totals, BMR/TDEE summary, JSON export, full reset.
- **Apple Shortcuts integration** — URL ingestion of `steps`, `calories`, `distanceKm`, `sleepHours`, `weightKg`, `date`, and a URL-encoded JSON `workouts` array. Full step-by-step guide is in the in-app Settings page.
- **iPhone-first design** — dark theme, safe-area insets (`env(safe-area-inset-*)`), sticky blur header, bottom tab bar above the home indicator, max-width 460px, no zoom jank, "Add to Home Screen" PWA.
- **Offline-ready** — service worker caches the app shell; everything is stored locally (IndexedDB for logs, localStorage for profile). No account, no backend.

---

## Project layout

```
JDD/
├── index.html
├── manifest.webmanifest
├── sw.js
├── .nojekyll
├── .github/workflows/deploy.yml
├── css/styles.css
├── js/
│   ├── foods.js        # ~190-item food database
│   ├── exercises.js    # push/pull/legs/cardio exercises + METs
│   ├── store.js        # IndexedDB log store + profile in localStorage
│   ├── calories.js     # BMR / TDEE / macros / burn math
│   └── app.js         # router + all views + Shortcuts ingestion
├── assets/icon-192.png, icon-512.png
└── README.md
```

---

## Deploy on GitHub Pages (free)

1. **Clone your repo** (you have collaborator rights):
   ```bash
   git clone https://github.com/jaddBen/JDD.git
   cd JDD
   ```
2. **Drop the files in.** Replace/merge the contents of this `jdd-fitness/` folder into the **root of the repo** (so `index.html` is at the top level). If your repo already has other content, put these files in a subfolder such as `docs/` or `fitness/` and use that path below.
3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add JDD Fitness web app"
   git push
   ```
4. **Enable Pages.** Repo → *Settings* → *Pages* → under **Build and deployment** set **Source** to **GitHub Actions**. The included `.github/workflows/deploy.yml` will run on every push and publish the site.
5. **Open it.** After ~1 min, your app is live at `https://<your-username>.github.io/JDD/` (or `/JDD/<subfolder>/` if you used a subfolder). Update the `start_url`/`scope` in `manifest.webmanifest` if you deploy to a subfolder — they default to `./`.
6. **Add to iPhone Home Screen.** Open the URL in Safari → tap the **Share** icon → **Add to Home Screen**. It now opens full-screen like a native app.

> No build step. No dependencies. The whole thing is static HTML/CSS/JS — you can also host it on Netlify, Vercel, Cloudflare Pages, or any static host.

---

## Apple Shortcuts integration (free, no API)

Apple's Shortcuts app can read Health data and pass it to this web app through the URL. The web app reads the URL parameters and writes them to today's log. **No paid Health API, no developer account, no token.**

### Parameters the app understands (in the URL `?...`)

| Param | Meaning | Example |
|---|---|---|
| `steps` | Steps count for the day | `8500` |
| `calories` or `caloriesBurned` | Active energy burned (kcal) | `420` |
| `distanceKm` or `distance` | Walk + run distance (km) | `6.2` |
| `sleepHours` or `sleep` | Hours asleep | `7.5` |
| `weightKg` | Current body weight (updates your profile) | `74.2` |
| `date` | `YYYY-MM-DD` for the day to write into (defaults to today) | `2026-11-15` |
| `workouts` | URL-encoded JSON array of workout objects | `[{"name":"Run","duration":30,"calories":320}]` |

### Build the Shortcut (full version)

1. Open the **Shortcuts** app on iPhone → tap **+** (new shortcut).
2. Add action **Find Health Samples** → set **Type** to **Steps**. Inside the block, set **Limit** to "Today".
3. Add **Get Statistics** (from the previous result) → **Sum**. This is your total steps today.
4. Repeat steps 2–3 for:
   - **Active Energy** → Sum (this is calories burned)
   - **Walking + Running Distance** → Sum
   - **Sleep Analysis** → filter **Asleep** → Sum of **Minutes** (then divide by 60 for hours)
5. Add a **Text** action and construct the URL using **variables** for each value. The final URL is:
   ```
   https://<your-username>.github.io/JDD/?steps=[Sum]&calories=[ActiveEnergy]&distanceKm=[Distance]&sleepHours=[SleepMinutes/60]
   ```
6. Add action **Open URLs** and pass that URL. Save the shortcut as **JDD Sync**.
7. **Automate it.** Go to the **Automation** tab → **+** → trigger:
   - **Time of Day** (e.g. 22:00 daily), **Run Immediately**, shortcut = **JDD Sync**; or
   - **Arrive** home; or after you finish a workout/run.
8. The first run, iOS asks **permission** to read Health data — tap **Allow**.

When the shortcut runs, it opens your site, the URL is ingested, the home indicator shows a **"Health sync received"** banner with your steps, distance, calories and sleep, and those burned calories add to your daily total.

> Tip: in Safari, **Add to Home Screen** the shortcut's resulting page — but the cleaner way is to add the site to your Home Screen, and use the Shortcut just for the data push. The site opens in its own full-screen PWA.

### Testing it without a Shortcut

In the app: **Settings → "Test URL ingestion now"** sends a sample payload (`steps=8500&calories=420&distanceKm=6.2&sleepHours=7.5`) so you can confirm everything is wired up. **Settings → "Read full Shortcuts guide"** shows the same steps in-app.

---

## Pushing workout data from Shortcuts (advanced)

To push structured workouts (not just Health metrics), use the `workouts` param with a URL-encoded JSON array. Example JSON:

```json
[{"name":"Morning Run","duration":32,"calories":380,"distanceKm":5.4,"split":"cardio"}]
```

In your Shortcut, build this text, then `URL Encode` it, then build the final URL:

```
https://<your-username>.github.io/JDD/?date=2026-11-15&workouts=<URL-encoded JSON>
```

Each object supports: `name`, `duration` (min), `calories`, `distanceKm`, `steps`, `split`, `met`, `notes`.

---

## Calorie math used

- **BMR** (Mifflin-St Jeor):
  - Men: `10·kg + 6.25·cm − 5·age + 5`
  - Women: `10·kg + 6.25·cm − 5·age − 161`
- **TDEE** = BMR × activity factor (1.2 sedentary … 1.9 very active)
- **Target** = TDEE × (1 − deficit%) for *lose*, × (1 + surplus%) for *gain*, TDEE for *maintain*
- **Macros**: protein = weight × proteinPerKg (default 1.8 g/kg), fat = target × fatPct% / 9, carbs = (target − protein·4 − fat·9) / 4
- **Workout calories**: MET × 3.5 × bodyweightKg / 200 × duration(min)
- **Net goal** = target + burned − eaten. Positive → still can eat; negative → over.

---

## Privacy

All data lives on your device (IndexedDB + localStorage). Nothing is sent to any server. The only network call is when you open the site from a Shortcut (the URL itself carries your Health data — that's by design). Clearing Safari data wipes the app's data too.

---

## License & source

Built to extend `jaddBen/JDD`. Modify freely.
