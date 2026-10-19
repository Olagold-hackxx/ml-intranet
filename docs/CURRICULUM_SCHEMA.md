# Curriculum data format

Every project lives in a JS module under `data/` that does
`export default [ ...projects ]`. `data/index.js` joins them.
Order in the array is the order of release.

```js
{
  id: "A01",                       // unique. A = applied, T = theory. Two digits.
  track: "applied",                // "applied" | "theory"
  phase: "Phase 1 — Foundations",  // group heading in the curriculum view
  title: "Linear Regression & Gradient Descent",
  days: 3,                         // duration (release → 1st deadline) in the 6-month solo track
  repo: "ml-foundations",          // GitHub repo the learner pushes to (code tasks)
  dir: "0x00-linear_regression",   // directory inside the repo
  sources: [                       // lectures to watch (link to playlist; lecture numbers from the plan)
    { course: "CS229", lectures: "Lec 1–2", topics: "Intro, linear regression, GD, normal equations" }
  ],
  resources: [                     // "Read or watch" — real, well-known URLs only
    { title: "CS229 main notes, Ch. 1", url: "https://cs229.stanford.edu/main_notes.pdf" }
  ],
  concepts: ["Gradient descent", "Normal equations"],
  objectives: [                    // "explain to anyone, without the help of Google"
    "Derive the normal equations from the least-squares objective"
  ],
  requirements: [                  // project-specific; general ones are added automatically
    "Python 3.10+, NumPy only (no scikit-learn)"
  ],
  quiz: [                          // optional, 3–5 MCQs, gate before tasks (ALX-style)
    { q: "…", options: ["…","…","…","…"], answer: 1, why: "…" }
  ],
  tasks: [
    {
      title: "Normal equations",
      type: "mandatory",           // "mandatory" | "advanced"
      kind: "code",                // "code" (auto-checked) | "written" (reviewed)
      points: 1,                   // relative weight inside the project
      body: "Markdown. $LaTeX$ allowed. Exact spec: function signature, inputs, outputs, edge cases.",
      files: ["0-normal_equations.py"],
      checks: [                    // code tasks; paths are relative to repo/dir
        { type: "exists", path: "0-normal_equations.py" },
        { type: "defines", path: "0-normal_equations.py", names: ["normal_equations"] },
        { type: "contains", path: "0-normal_equations.py", pattern: "np\\.linalg\\.(solve|pinv)", label: "uses a stable solver" },
        { type: "not_contains", path: "0-normal_equations.py", pattern: "sklearn", label: "no scikit-learn" },
        { type: "readme", path: "README.md", minWords: 80 },
        { type: "notebook_executed", path: "analysis.ipynb" },
        { type: "json_metric", path: "results.json", key: "test_accuracy", op: ">=", value: 0.97 },
        { type: "py_test", files: ["0-normal_equations.py"], label: "matches closed form on random data",
          code: "import numpy as np\nfrom importlib import import_module\nm = import_module('0-normal_equations')\n..." }
      ]
    },
    {
      title: "Exercise 2.1–2.3",
      type: "mandatory",
      kind: "written",
      points: 2,
      body: "Markdown problem statement.",
      deliverable: "repo",          // "repo" (file in repo/dir) | "link" (Medium / blog post URL)
      files: ["written/2-exercises.pdf"], // for deliverable "repo": accepted file (pdf, md or tex)
      rubric: "proof",              // preset: proof | derivation | essay | summary | report | reproduction
      criteria: [                   // specific things a grader must see (used by AI, peer and self review)
        "States the realizability assumption explicitly",
        "Bounds P(L_D(h_S) > ε) by |H|(1-ε)^m and solves for m"
      ]
    }
  ]
}
```

## Check types

| type | passes when |
|---|---|
| `exists` | file or directory exists |
| `nonempty` | file has at least `minLines` (default 1) non-blank lines |
| `defines` | Python file defines every name in `names` (`def` or `class`, top level) |
| `contains` / `not_contains` | regex `pattern` matches / does not match the file |
| `readme` | README.md exists, has ≥ `minWords` words (default 50) |
| `notebook_executed` | `.ipynb` has at least one code cell with outputs |
| `json_metric` | JSON file value at `key` (dot path) satisfies `op` (`>=`,`<=`,`>`,`<`,`==`) `value` |
| `py_test` | `code` runs without exception in Pyodide (Python + NumPy only). `files` are loaded into the working dir first; import with `importlib.import_module` because file names start with digits. |

`py_test` runs in the browser, so only NumPy (plus the standard library) is available.
Anything that needs PyTorch is checked with static checks plus a `results.json` the learner's own
training script writes.

## Written work rubrics

Presets are defined in `assets/js/rubrics.js`. Each criterion is scored on a 0–4 scale
(Missing / Poor / Fair / Good / Excellent) and weighted. `criteria` on the task are the
task-specific "must see" items; each missing item caps the Correctness criterion.
