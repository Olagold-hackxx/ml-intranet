# Grading policy

How Gradient scores you, and where each rule comes from. The values live in
[`assets/js/config.js`](../assets/js/config.js) (`RULES`). Set them before you start and leave them alone afterwards.
The full research notes are in [`docs/research/grading-research.md`](research/grading-research.md). Each claim there is tagged *verified*, *verified-old* or *inferred*.

## 1. Deadlines

| When you pass a check / submit written work | Multiplier | Origin |
|---|---|---|
| Before the 1st deadline | **100%** | ALX intranet |
| Between the 1st and 2nd deadline | **65%** | ALX intranet |
| After the 2nd deadline | **0%** (project closed) | Stricter than ALX's historical 50%. Matches university hard stops: MIT 6.7900 accepts nothing after 3 days late, CS224N/CS231N give no late days on final reports. |

- The 2nd-deadline window is ⌈duration / 2⌉ days, clamped to 1–3 days. ALX's 2nd deadline typically fell 1–2 days after the 1st.
- The multiplier **scales** the score; it doesn't cap it. A late advanced task still adds a little.
- Code: the timestamp is the moment the checker run that passed. Written work: the moment you submitted. A slow review never costs you points.

## 2. Project score: the ALX / Holberton formula

Verified from an intranet printout: `Mandatory 100% · Optional 41.18% → 100% + (100% × 41.18%) = 141.18%`.

```
task earned   = best over attempts of (share of check points passed × multiplier at that time)
M, A          = point-weighted mean of earned over mandatory / advanced tasks
project score = M × (1 + A)              ∈ [0%, 200%]
```

Advanced credit is scaled by mandatory completion. With M = 50% and A = 100% you get 100%, not 150%.

### Check weights (Gradescope-style partial credit)
| Check | Points |
|---|---|
| Requirement checks: file exists, `#!/usr/bin/env python3`, newline at end of file | 1 |
| Static checks: required functions, regex / banned imports, README, executed notebook | 2 |
| Tests (`py_test`, run in the browser through Pyodide) and metrics read from `results.json` | 3 |

## 3. Written work (proofs, derivations, essays, reports)

Rubrics deduct from full marks, which is Gradescope's default. Each criterion is scored on five levels:
Missing 0 · Poor 30 · Fair 60 · Good 85 · Excellent 100.

| Rubric | Criteria (weight %) | Modeled on |
|---|---|---|
| proof | correctness 50 · completeness 20 · rigor 20 · clarity 10 | UIUC CS374 standard proof rubrics |
| derivation | correct result 50 · steps shown 25 · notation 15 · interpretation 10 | CS229 / CS231N written problems |
| essay | accuracy 30 · depth 25 · structure 20 · evidence 15 · own voice 10 | common writing rubrics |
| summary | accuracy 40 · coverage 30 · concision 20 · own intuition 10 | — |
| report | technical 30 · experiments 25 · originality 15 · clarity 15 · results 10 · related work 5 | CS224N / CS231N project grading |
| reproduction | fidelity 30 · ablations 25 · analysis of gaps 20 · clarity 15 · reproducibility 10 | ML Reproducibility Challenge criteria |

**Must-see items.** Every written task lists the key steps a grader must find. The share actually present
caps the first criterion: a proof missing half its key steps can't score above 50% on correctness.

**Reviewers**
- **Claude** (your own API key, called from the browser) acts as a strict TA. It returns the levels, a present/absent verdict for each must-see item, and feedback.
- **A peer** opens a link that carries the assignment and the rubric. They send back a checksummed review code. The score is recomputed from their levels, so the code can't simply claim a number.
- **Yourself**, capped at **80%**. STATS214 makes 20% of the grade self-graded reflections; the cap stops self-review from replacing an external one.

**Regrades.** A re-review is allowed for 7 days after the first review of a submission, and the latest review counts even if it is lower. Stanford and UIUC regrade requests work this way: the whole question is regraded and the score can go down. After 7 days, resubmit with a new timestamp.

## 4. Average and standing

- Average = Σ (project days × score) / Σ project days, over the projects that count. A project counts once its 1st deadline has passed, or as soon as all its mandatory tasks are done.
- A month is 28 active days. **Month 1 needs ≥ 80%**, and every later month **≥ 70%** (ALX thresholds).
- **Warning**: the current month is below the bar. **Probation**: two finished months in a row below the bar.

## 5. Breaks

- 14 days earned for every 56 active days (2 weeks every ~2 months), banked and deferrable.
- A break pauses the clock, so every deadline after its start moves back by its length.
- Breaks can't start in the past, so they can't rescue a missed deadline. Ending one early refunds the unused days.
- With all breaks taken, the 6-month tracks run 154 active days + 28 break days ≈ 26 weeks, and the combined year runs 294 + 70 ≈ 52 weeks.

## 6. Quizzes

Most projects open with a 3–5 question warm-up. Scoring ≥ 60% unlocks the tasks. A failed attempt locks the quiz for 60 minutes.
Quizzes gate the tasks but don't count toward the score, as with ALX's project quizzes.

## 7. Late-policy comparison (for reference)

| Course | Policy |
|---|---|
| ALX | 100% before the 1st deadline, 65% before the 2nd, 50% after |
| Stanford CS231N | 4 free late days (max 2 per assignment), then −25% per day; none on the final report |
| Stanford CS224N (2025) | 6 late days (max 3 each), then −1% of the final grade per day |
| Stanford CS336 | 6 late days (max 3 each) |
| MIT 6.7900 | −5% / −10% / −20% for 1 / 2 / 3 days late; not accepted after that |
| CMU 10-601 | 6 grace days, then 75% / 50% / 25% credit |
| **Gradient** | 100% / 65% / 0%, no late days; banked breaks pause the clock instead |
