# Learner guide

## 1. Set up once

1. Open the site and choose a program:
   - **Applied ML**: 6 months
   - **Theoretical ML**: 6 months
   - **Applied + Theory**: 12 months, with both tracks interleaved

   Then enter your GitHub username and a start date. The program and start date lock on day 1.
2. Create these **public** GitHub repos, each empty except for a top-level README:

   | Repo | Used by |
   |---|---|
   | `ml-foundations` | Applied Phase 1 (A01–A10) |
   | `ml-deep-learning` | Applied Phase 2 (A11–A19) |
   | `ml-nlp` | Applied Phase 3 (A20–A29) |
   | `ml-generative-rl` | Applied Phase 4 (A30–A39) |
   | `ml-frontier` | Applied Phase 5 (A40–A47) |
   | `ml-capstone` | Capstone (A48–A50) |
   | `ml-theory` | Every theory project (T01–T27) |

   Private repos work too. Add a fine-grained GitHub token with read access to "Contents" in **Settings**.
3. Optional:
   - **GitHub token** (Settings). It raises the checker's rate limit from 60 to 5,000 requests/hour. With "Gists: read & write" it also syncs your progress across devices through a private gist.
   - **Anthropic API key** (Settings). Turns on Claude reviews of written work. The key stays in your browser, and requests go straight to api.anthropic.com.

## 2. Daily loop

1. **Dashboard → Focus now** shows the most urgent project and its multiplier zones.
2. Watch the listed lectures and read the resources.
3. Pass the **warm-up quiz** (≥ 60%) to unlock the tasks.
4. **Code tasks**: write the file exactly as specified, in `repo/dir/file`, then push and press **Check your code**.
   - Python tests run in your browser through Pyodide (Python + NumPy). The first run downloads about 15 MB.
   - Training tasks are graded from the `results.json` your own script writes. Report real numbers. The honor code is the only thing between you and a fake 100%, and faking it only hurts you.
5. **Written tasks**: typeset your solution (LaTeX → PDF preferred; Markdown works too), push it to `repo/dir/written/…`, then press **Submit**. Essays go on Medium or a blog, and you submit the link.
   - Then get a review: **Claude**, a **peer** (send them the link; they return a code), or **self** (capped at 80%).
6. Write one line in the **Captain's log**.

## 3. File conventions (checked automatically)

- Every Python file starts with `#!/usr/bin/env python3` and ends with a newline.
- Every project directory has a `README.md`.
- File names follow the task cards (`0-normal_equations.py`, `100-advanced_thing.py`). Tests import them with `importlib.import_module("0-normal_equations")`.
- "From scratch" means NumPy only. A `not_contains` check flags banned imports such as `sklearn` or `nn.Transformer`.

## 4. When things go wrong

- **"Repo not found"**: check the username in Settings, the repo name, and that it's public (or add a token).
- **"rate limit"**: add a GitHub token.
- **A Python test times out**: look for an infinite loop or a very slow pure-Python loop. Vectorize it.
- **Medium blocks Claude's fetch**: paste the post text into the box that appears and retry.
- **You fall behind**: the 2nd-deadline window is worth 65%, so finish the mandatory tasks first. If you're burnt out, take a banked break *before* the next deadline; a break can't undo a deadline that has already passed.

## 5. Moving devices

Settings → **Create private gist & sync** on device A. On device B, go to onboarding → *Restore progress from another device* and use the same token. A **Download backup** JSON works too.
