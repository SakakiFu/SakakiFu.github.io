# SakakiFu.github.io

This repository hosts the static website **蓮ノ空聖地巡禮與外景美食指南** built with plain HTML, CSS, and JavaScript. The site documents shooting locations, food spots, and timestamps for each episode of the *Love Live! 蓮ノ空* series.

## Project structure
- `hasunosora-guide/` – The main web app:
  - `index.html` – Overview page for the *せーはす Plus* series.
  - `sehasu103.html` / `sehasu104.html` / `sehasu105.html` – Dedicated pages for each episode series.
  - `map.html` – Interactive map aggregating all locations.
  - `js/` – Data files (`data-*.js`), application logic (`app.js`, `map.js`).
  - `css/` – Styling.
  - `README.md` – Detailed documentation for the web app.
- `scripts/validate_data.py` – Linter that checks all episode data for required fields (videoId, timeline, coordinates).

## Features
- **Pilgrimage checklist** with `localStorage` (⭐ 想去 / ✅ 已踩點) and export to KML/GeoJSON for Google My Maps.
- **Cross‑episode full‑text search** and filtering by Unit/Member.
- **URL deep linking** (`?ep=...&t=...` or `?loc=...`).
- Complete `videoId` for all 97 episodes; map coordinates for 89 locations.

---

Feel free to explore the `hasunosora-guide` folder for the website source, or open the live demo at the GitHub Pages URL.
