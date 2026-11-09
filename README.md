# Drum Practice Tracker

A lightweight, dark-themed practice dashboard for a structured drumming program: daily checklists,
practice log, BPM benchmarks (max vs. sustainable speed), baseline/final assessments and stats.

No build step and no dependencies — plain HTML, CSS and ES modules. Data lives in the browser's
`localStorage`; use **Settings → Export JSON** for backups and to move between devices.

## Run locally

```sh
npm start        # serves the folder at http://localhost:3000
```

(ES modules don't load from `file://`, so open it through a local server.)

## Structure

| Path | Purpose |
| --- | --- |
| `js/data/` | Training content: exercise library and the 14-day program (no logic) |
| `js/storage.js` | `Store` + `LocalStorageAdapter` — swap the adapter for a backend later |
| `js/schedule.js` | Maps program days onto the user's start/end dates and rest days |
| `js/stats.js` | Consistency, totals, weekly minutes |
| `js/views/` | One module per page; each returns HTML plus an optional `mount` |
| `js/models.js` | JSDoc types (`// @ts-check` gives editor type-checking) |

## Deploy

Pushing to `main` runs `.github/workflows/pages.yml`, which publishes the site to GitHub Pages.
In the repo settings, set **Pages → Source** to **GitHub Actions** if it isn't already.
