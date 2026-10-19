# Gradient: an ML intranet that grades you on a deadline

A personal learning platform for a Stanford-level machine learning curriculum. Every topic is a
time-boxed **project** (from 24 hours to two weeks) made of **tasks**:
- **Code tasks** are auto-checked straight from your GitHub repo.
- **Written tasks** (proofs, derivations, essays) are graded against a rubric.

The deadlines cost you points when you miss them. It reverse-engineers the ALX / Holberton intranet's mechanics,
combines them with how Stanford, MIT, CMU and Berkeley grade ML courses, and adds its own UI.

**Purpose: speed up learning and punish laxity.**

| | |
|---|---|
| **Programs** | Applied ML (6 months) · Theoretical ML (6 months) · **Applied + Theory, interleaved (12 months)** |
| **Content** | 77 projects · 517 tasks (321 auto-checked code, 196 reviewed written) · 297 quiz questions · 242 Python tests |
| **Courses** | CS229 · CS221 · CS230 · CS231N · CS224N · CS224U · CS236 · CS234 · CS329H · CS336 · CME295 · CME296 · LLM Evaluation & Scaling · Ben-David's *Understanding ML* · CS229M |
| **Deadlines** | 100% before the 1st deadline · 65% before the 2nd · 0% after |
| **Score** | ALX formula: `Mandatory × (1 + Advanced)`, up to 200% |
| **Breaks** | 2 weeks earned every ~2 months, banked and deferrable; a break pauses every deadline |

## How it works

- **Projects release on a schedule.** Each one has lectures to watch (from your playlists), resources, learning
  objectives, a warm-up quiz that gates the tasks, and tasks tagged *mandatory* or *advanced*.
- **Check your code.** The checker reads your repo through the GitHub API and runs three kinds of check:
  - ALX-style requirement checks: file exists, `#!/usr/bin/env python3`, newline at the end of the file.
  - Static checks: required functions, banned imports, README, executed notebooks.
  - **Python tests that run in your browser** (Pyodide, Python + NumPy), and metric thresholds read from the `results.json` your training script writes.
- **Written work.** Submit a PDF/Markdown/LaTeX file in your repo or a Medium link. The submission time sets the deadline multiplier.
  Then get reviewed against a fixed rubric by **Claude** (your own API key), a **peer** (shareable link with a tamper-evident return code)
  or **yourself** (capped at 80%).
- **Standing.** Your average is weighted by project size. Month 1 needs ≥ 80%, later months ≥ 70%.
  Falling below gives a *Warning*; two finished months below in a row means *Probation*.
- **Laxity report.** The dashboard shows points lost to late multipliers, mandatory tasks missed, days idle, and a Captain's-log streak.

All of it is detailed in [docs/GRADING.md](docs/GRADING.md), with the research behind every rule in
[docs/research/grading-research.md](docs/research/grading-research.md).

## Using it

1. Open the site (GitHub Pages; see *Deploy* below), choose a program and a start date, and enter your GitHub username.
2. Create the project repos: `ml-foundations`, `ml-deep-learning`, `ml-nlp`, `ml-generative-rl`, `ml-frontier`, `ml-capstone`, `ml-theory`.
3. Optional: in **Settings**, add a GitHub token (higher rate limit, private repos, cross-device sync through a private Gist) and an Anthropic API key (Claude reviews).

The full walkthrough is in [docs/LEARNER_GUIDE.md](docs/LEARNER_GUIDE.md), and the project list is in [docs/CURRICULUM.md](docs/CURRICULUM.md).

## Deploy

It's a static site with no build step and no backend.

- **GitHub Pages:** Settings → Pages → Source: *GitHub Actions*. The included workflow validates the curriculum data and deploys on every push to `main`.
- **Locally:** run `python3 -m http.server` in the repo root and open http://localhost:8000.

Progress is stored in your browser (`localStorage`). You can sync it to a private Gist and export or import it as JSON.
API keys stay in the browser; requests go directly to `api.github.com` and `api.anthropic.com`.

## Repository layout

```
index.html                 app shell
assets/js/app.js           views and router
assets/js/schedule.js      active-day clock, breaks, project layout (two lanes for the combined year)
assets/js/scoring.js       ALX formula, deadline multipliers, average, standing, laxity
assets/js/checker.js       GitHub API checker + Pyodide test runner (pyworker.js)
assets/js/reviewer.js      Claude / peer review; rubrics.js holds the rubrics
assets/js/config.js        RULES (deadlines, breaks, thresholds), programs, course playlists
data/*.js                  the curriculum (one file per phase)
scripts/validate.mjs       curriculum validator (runs in CI)
docs/                      grading policy, learner guide, curriculum, schema, research
```

## Editing the curriculum

Projects are plain JS objects; the format is in [docs/CURRICULUM_SCHEMA.md](docs/CURRICULUM_SCHEMA.md).
After editing, run `node scripts/validate.mjs`. Each 6-month track must still add up to 154 days.
Every `py_test` was checked against a reference solution (it must pass) and a stub that returns 0 (it must fail).
The reference solutions aren't in this repo, so you can't peek.

## Known limits

- Lecture references use the lecture numbers and topics from the study plans. YouTube couldn't be reached while this was built,
  so videos link to the playlist rather than to individual lectures, and some lecture numbers may be off by one.
- Some SSBD exercise and theorem numbers were written from memory. Each theory task tells you to copy the exact statement from the free
  book PDF, and the book's numbering counts as correct.
- `results.json` metrics are self-reported by your own training scripts. The honor code applies.
