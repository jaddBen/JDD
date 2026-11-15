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
