# Research Report: ALX/Holberton Intranet Mechanics and ML Course Grading at Top Universities

*Prepared 2026-10-18. Legend:* **[V]** = I saw the fact in the cited source, through search-result excerpts. **[V-old]** = verified, but the source is dated or the policy differs by cohort/term. **[I]** = inferred from my own knowledge of the platform or from general convention, with no source in hand. Treat **[I]** items as design choices you can tune.

> Method note: the sandbox's network blocked direct page fetches, so I couldn't open any page myself. Every [V] fact comes from search-engine excerpts of the URL listed. Re-check the [V-old] items before you rely on them.

---

## A. ALX / Holberton intranet mechanics

### A1. Project page anatomy
| Element | Status | Notes / source |
|---|---|---|
| Header: title, author, weight, level (e.g. "Novice"), section ("Onboarding"), start/end dates, "Checker was released at…", "An auto review will be launched at the deadline" | [V-old] | "Deep dive into the Intranet" project copy: ~24 h window (21→22 Feb 2023), "Novice", Onboarding. https://www.studypool.com/documents/25374296/project-deep-dive-into-the-intranet-alx-africa-intranet-100009 |
| **Concepts** (links to concept pages) → **Resources ("Read or watch")** → **Learning Objectives** ("At the end of this project, you are expected to be able to explain to anyone, without the help of Google: …") → **Requirements** → **Tasks** | [V-old] for objectives text ("how the checker works, how projects are graded, how the sandbox works, how to submit a manual review, how to review others", PLD); [I] for exact ordering | same source; https://medium.com/@Dillibe001/deep-dive-into-the-intranet-day-2-of-my-journey-with-alx-software-engineering-program-ce0497a03940 |
| **Requirements → General** (ML track): allowed editors `vi`, `vim`, `emacs`; interpreted on Ubuntu (16.04/Python 3.5/numpy 1.15 in old cohorts; 20.04/Python 3.9/numpy 1.25.2 in newer); every file ends with a newline; first line exactly `#!/usr/bin/env python3`; `README.md` at the project-folder root is mandatory; pycodestyle (2.5 → 2.11.1); all modules/classes/functions documented; all files executable; `import numpy as np` only, unless told otherwise | [V-old] (pinned versions differ between cohorts) | https://github.com/mecomonteshbtn/holbertonschool-machine_learning , https://github.com/evisp/holbertonschool-machine_learning , https://github.com/izzooooooo/holbertonschool-web_back_end |
| Python (higher-level) track used `#!/usr/bin/python3` and pep8 1.7 in older cohorts | [V-old] | https://github.com/ntuthukojr/holbertonschool-higher_level_programming-3/blob/master/README.md |
| **Task card**: number + title, label `mandatory` or `#advanced`, prompt, example `main` file with expected terminal output, then **Repo / Directory / File** box (e.g. `GitHub repository: holbertonschool-machine_learning`, `Directory: math/linear_algebra`, `File: 0-slice_me_up.py`), then buttons **Done? / Check your code / Ask for a new correction / Get a sandbox / QA Review** | [V-old] for the "Check your code", "Get a sandbox", "QA Review" buttons; [I] for the exact layout and the "Ask for a new correction" label | https://www.coursehero.com/file/207313926/Project-0x07-C-Even-more-pointers-arrays-and-strings-ALX-Africa-Intranet.pdf |
| Short **quiz** before the project unlocks (onboarding "Deep dive" had a quiz) | [V-old] that quizzes exist; [I] that each project is gated on one | https://www.youtube.com/watch?v=AIerN4usESs (title only) |

### A2. Checker and reviews
- **Check your code** runs a list of numbered checks for the task. Each check turns green or red. [V-old] a Chrome extension advertises "launch all checks at once or select specific checks" (https://chromewebstore.google.com/detail/alx-intranet/eagnmhadjdelkimfjbelmndejpepgmef). Students describe running the checker on every task and checking that all checks pass (https://medium.com/alx-africa/how-i-tackle-my-software-engineering-projects-at-alx-610f3f5a6448).
- **Check categories** [I, consistent with the requirement lists]: (1) *requirement checks*: file exists, shebang, newline at EOF, pycodestyle clean, module/function docstrings, README exists; (2) *output checks*: run a hidden `main` and compare stdout exactly (byte-for-byte); (3) *edge-case/hidden checks*. Many projects show "Correct output – case: …" checks. The checker pulls the student's GitHub repo at the commit it runs on.
- **Get a sandbox**: an on-demand container (Ubuntu image matching the requirements) with a web terminal. [V-old] "if the checker fails, you might have to destroy your sandbox and start all over" (https://www.nairaland.com/7106890/software-engineering-journey-alx-africa/4).
- **Auto QA review**: launched automatically at the deadline and produces the official score. [V-old] (studypool source above). The project score panel shows "Auto QA review: X/Y mandatory checks, Z/W optional". [V-old] for the mandatory/optional split (CourseHero source); [I] for the exact wording.
- **Manual QA review**: on some projects (e.g. web infrastructure design, write-ups, blog posts), a staff member or peer grades against a checklist instead of the checker. Students submit with a "Ready for manual review" action. [V-old] for "how to submit a manual review / how to review others" as an onboarding objective; [I] for the mechanics.
- **Ask for a new correction**: re-runs the auto review after the deadline. Late penalties apply to the new score. [I]

### A3. Scoring formula (verified from a real intranet printout)
From an ALX project page [V-old] (https://www.coursehero.com/file/207313926/…):
```
Mandatory: 100.0%   Optional: 41.18%
Calculation: 100.0% + (100.0% * 41.18%) == 141.18%
```
So the formula is:
```
mandatory% = passed_mandatory_checks / total_mandatory_checks
optional%  = passed_advanced_checks  / total_advanced_checks
project_score = mandatory% + mandatory% × optional%   = mandatory% × (1 + optional%)   (max 200%)
```
- Your belief, mandatory% × (1 + advanced%) with a 200% cap, is **correct**. Advanced work scales with mandatory completion: 50% mandatory and 100% advanced gives 100%, not 150%.
- The 200% maximum is also confirmed by a student guide ("100% done, or sometimes 200%") [V-old] https://medium.com/alx-africa/how-i-tackle-my-software-engineering-projects-at-alx-610f3f5a6448.
- Percentages are counted **per check**, not per task [I, matches the fractional values like 41.18% = 7/17].

### A4. Deadlines and late multipliers
- **What ALX did** [V-old, several student sources and a PreALX guide]: submit before the 1st deadline for up to **100%**. Between the 1st and 2nd deadlines the score is capped at **65%**. After the 2nd deadline the cap is **50%**. Sources: https://prealxse.com/introduction/pbl/ , https://medium.com/@ehoneahobed/the-alx-software-engineering-program-insider-tips-and-tricks-96577a8cc11 , https://medium.com/@victor_brian/alx-software-engineering-se-programme-the-first-trimester-experience-e67772b371de . The 2nd-deadline window was meant for peer discussion and catching up.
- **Your spec (100% / 65%)** matches ALX's first two tiers. ALX's third tier (50%, and still open) is a design choice. Use 0% if you want a hard stop.
- **Cap or multiplier?** Sources say "maximum score you can receive is 65%". [I] Implement it as `final = raw × 0.65`, which is how the intranet displays late scores (e.g. 141% → ~92%). Avoid `min(raw, 65%)`, which would wipe out advanced credit. Treat this as a flagged ambiguity.
- **Durations** [V-old]: most onboarding and early tasks had **24 h** first deadlines (https://medium.com/@Dillibe001/…). [I] Typical project lengths are 1, 2, 3 days or 1 week. The 2nd deadline usually lands about 24–48 h after the 1st, or a few days later for weekly projects. Projects release on weekday mornings. Statuses: *upcoming → in progress (checker released) → 1st deadline passed → project over*.

### A5. Averages, thresholds, consequences
- **Probation month**: overall score **≥ 80%** in Month 1, then **≥ 70%** in each later month. Accounts below the line were disabled [V-old, official PreALX FAQ plus forums]: https://prealxse.com/introduction/faqs/ , https://learningwithbanele.hashnode.dev/my-journey-into-becoming-a-software-engineer-with-alx , https://www.nairaland.com/7106890/software-engineering-journey-alx-africa
- **Graduation** (one regional program page): **≥ 60%** overall average across projects **and** evaluation quizzes, peer reviews done, and a capstone with video demo [V]: https://tech.alxafrica.com/intro-to-software-engineering-programme-casablanca
- **Average** [I]: a weighted mean of project scores, using the project "weight" shown in each header. Scores above 100% count, so advanced work can offset weak projects. The intranet shows a current-average gauge. Suggested engine rule: `avg = Σ wᵢ·scoreᵢ / Σ wᵢ` over released projects whose 1st deadline has passed.
- **Warnings** [I]: no official source found. A reasonable rule is a warning when the rolling monthly average falls below the threshold, and probation or removal at month end.

### A6. Other mechanics
- **Peer Learning Day (PLD)**: mandatory group sessions on the current project, run as student-led whiteboarding [V-old]: https://assets.holbertonschool.com/media_images/files/000/001/178/original/2020_SF_Holberton_School_Student_Catalog.pdf (mandatory 9am–3pm, schedule posted weekly on the intranet), https://www.coursereport.com/schools/holberton-school
- **Sprints / months**: one guide describes 3 sprints of about 3 months, plus a 3-month specialization and 2-week onboarding. Older guides say 5 sprints [V-old]: https://alx-feb-resources.notion.site/ALX-Resources-1660799bece74b2f9afb1bcc24dff313
- **Streaks, "Captain's log", break weeks**: no source found. [I] Captain's log is a weekly self-reflection form. Break weeks fall between sprints. Model these as optional.
- **Legacy points / graded boosts** (current ALX): only on-time graded deliverables earn boosts [V]: https://www.alxafrica.com/wp-content/uploads/2026/04/ALX-Legacy-Points-Guidelines.pdf

---

## B. How top universities grade ML coursework

### B1. Weights and late policies
| Course | Grade weights | Late policy | Status / source |
|---|---|---|---|
| **CS229** (Stanford) | ~40% psets (4 × 10%), 20% midterm, 40% project. Up to 3% extra credit for participation | 7 free late days (for psets, proposal, milestone). None on the final report or poster. Nothing accepted >3 days late. 20%/day beyond free days in some terms | [V-old] https://cs229.stanford.edu/Handout2017.pdf , https://cs229.stanford.edu/materials/handout.pdf |
| **CS229** regrades | Gradescope, **3-day window** per assignment, per question | — | [V-old] same |
| **CS230** | Project 40% (proposal, milestone, report, poster), midterm 25%, programming assignments 25%, quizzes 8%, attendance 2% | 10 free late days (assignments, quizzes, proposal, milestone). None on the final project. Max 3 days late | [V] https://web.stanford.edu/class/cs230/ |
| **CS231n** | Assignments 45% (10+20+15), midterm 20%, project 35% (proposal 1%, milestone 2%, report 29%, poster 3%) | **4 free late days, max 2 per assignment**. Usable on assignments, proposal, milestone. None on the final report. **−25% per extra day** | [V] 2025 site https://cs231n.stanford.edu/2025/ ; weights [V-old] https://cs231n.stanford.edu/slides/2022/lecture_1_2_ruohan.pdf |
| **CS224N** (2025) | Assignments 48% (6% + 3 × 14%), project 49% (proposal 8%, milestone 6%, poster 3%, report 32%), participation 3% | **6 late days, max 3 per assignment** (also per project deliverable). After that, **−1% of final course grade per extra day**. Late days are per student, not pooled across a team | [V] https://web.stanford.edu/class/cs224n/ , https://web.stanford.edu/class/cs224n/slides_w25/cs224n-2025-lecture07-final-project.pdf , report 32% confirmed in https://web.stanford.edu/class/cs224n/project/Project_Report_Instructions.pdf |
| **CS336** (2026) | 5 large implementation assignments (weights not found) | **6 late days, max 3 per assignment**. Gradescope, unlimited resubmits, **last submission graded** | [V] https://cs336.stanford.edu/ |
| **STATS214/CS229M** (F22) | Homework 30% (HW0 10 pts, HW1–3 30 pts each). **Pset reflections 20%**: students self-grade against the solutions and explain the differences | Collaboration allowed, solutions written individually | [V-old] https://tselilschramm.org/mltheory/syllabus-stats214-f22.pdf |
| **MIT 6.7900** (F25) | HW 20%, mini-projects 20%, midterm 25%, final 35%. **Lowest 2 HWs dropped** | 1 day −5%, 2 days −10%, 3 days −20%, ≥4 days not accepted | [V-old] https://gradml.mit.edu/info/class_policy/ |
| **Berkeley EECS189** (F25) | (weights not found) | **10 slip days** for 10 HWs, **max 4 per HW**. Applied automatically and rounded up by the hour. Nothing accepted >4 days late. No drops | [V] https://eecs189.org/fa25/syllabus/ |
| **CMU 10-601** | (weights not found) | **6 grace days** (not on HW1), max 3 per HW. Without grace days: 75% / 50% / 25% credit for 1 / 2 / 3 days late. Nothing after 3 days | [V] https://www.cs.cmu.edu/~mgormley/courses/10601/ , https://www.cs.cmu.edu/~mgormley/courses/10601-f23/syllabus.html |
| **CMU 10-701** | — | 4 grace days, max 2 per HW. None on project deliverables | [V-old] https://machinelearningcmu.github.io/F23-10701/ |
| MIT 6.036, CMU 10-715, MIT 18.657 | not found | — | 18.657 OCW has 3 psets plus solutions only: https://ocw.mit.edu/courses/18-657-mathematics-of-machine-learning-fall-2015/ |

**Consensus late model you can encode:** a per-student pool of free late days (4–10), a per-assignment cap (2–4), 24 h granularity rounded up, a penalty after the pool runs out (−20 to −25% per day, or −1% of the course grade per day), a hard stop at 3–4 days, and no late days on the final report or poster.

### B2. Autograders
- **Gradescope `results.json`** [V] https://gradescope-autograders.readthedocs.io/en/latest/specs/ : top-level `score` (optional, overrides the sum), `tests[]` each with `score`, `max_score`, `name`, `output`, and `visibility` ∈ {`visible`, `hidden`, `after_due_date`, `after_published`}. Hidden tests contribute to the score but are not shown. Otter-Grader notes the summary can read "All tests passed" while a hidden test failed [V] https://otter-grader.readthedocs.io/en/latest/workflow/executing_submissions/gradescope.html .
- **Partial credit** is the sum of per-test `score`, so each test is worth points. Tolerance-based numeric checks (`np.allclose`, relative error < 1e-6 to 1e-9) are standard in CS231n/CS224N/CS336. [I for tolerances; CS231n notebooks print a relative error]
- **Unlimited resubmission before the deadline, last one graded** [V] CS336.
- Engine mapping: ALX checks map to Gradescope tests. Give each check `points`, `visibility`, and `kind ∈ {requirement, output, hidden}`.

### B3. Written work, proofs, rubrics
- **Gradescope rubrics** [V via university guides]: the default is **negative scoring** (start at full marks, items deduct). **Positive scoring** starts at 0 and items add. Settable per question. Optional floor (min 0) and ceiling (max points). https://lms.unimelb.edu.au/staff/guides/gradescope/marking-in-gradescope , https://elearning.uq.edu.au/guides/turnitin/create-gradescope-assignment-homework-problem-set?p=4 , https://help.jmu.edu/TDClient/277/Portal/KB/ArticleDet?ID=20577
- **Regrades** [V]: submitted through Gradescope with written justification citing the rubric, within a 3-day (CS229) to 2-week window. The whole question may be regraded and the score can go down. https://courses.grainger.illinois.edu/cs374/sp2021/grading.html , https://cs.brown.edu/courses/csci1660/old/2022/regrades.html
- **Proof rubric pattern**: UIUC CS374 publishes standard 10-point rubrics that split points among correct statement/structure, correctness, and clear English proof/explanation (2–4 pts). Rubrics are never changed retroactively [V] https://courses.grainger.illinois.edu/cs374al1/fa2026/misc/rubrics.pdf . CS473 has an "I don't know" policy (partial credit for honestly declining). It doesn't apply to extra credit, and wrong answers need to be "at least partially correct" for credit [V-old] https://courses.grainger.illinois.edu/cs473/sp2017/grading.html . (The well-known value is 25% for IDK. **[I]** I couldn't confirm it.)
- **LaTeX**: CS229 psets require typeset submissions in LaTeX [V-old per search excerpt].
- **Suggested proof rubric (per problem, 10 pts)** [I, synthesized]: Correctness of the main argument 5. Completeness (all cases, assumptions used, every claimed bound proved) 2. Rigor (no hand-waving, correct quantifiers/inequalities, cited lemmas stated) 2. Clarity/presentation (structure, notation, LaTeX) 1. Deductions: major logical gap −3 to −5, unjustified step −1 to −2, algebra slip with correct method −0.5 to −1. IDK gives 2.5 pts (optional). STATS214-style self-grade reflection can be a separate 20% component.

### B4. Final projects
- **CS224N** grades holistically on: creativity, complexity, and technical correctness of the approach; thoroughness of exploring alternatives; strength of results; effort; write-up quality. There is no accuracy threshold that guarantees a grade [V] https://web.stanford.edu/class/archive/cs/cs224n/cs224n.1246/project/default-final-project-handout-minbert-spr2024-updated.pdf . Milestone ≤ 2 pages, graded by the mentor for custom projects [V] http://web.stanford.edu/class/cs224n//project_w25/CS224N_Final_Project_Milestone_Instructions__Winter_2025_.pdf . The proposal was historically credit/no-credit for on-time submission [V-old] https://web.stanford.edu/class/archive/cs/cs224n/cs224n.1174/project.html
- **CS231n**: teams of 1–3, with higher expectations for larger teams. Strong projects propose a novel variant or a new application. Weak ones clone a repo or spend the time on data collection. Report sections: abstract, related work, methods, data, experiments/results, conclusion [V] https://cs231n.stanford.edu/slides/2025/section_3.pdf
- **Suggested encodable report rubric** [I, synthesized from the above]: Technical quality/correctness 30. Experiments (baselines, ablations, error analysis) 25. Originality/ambition (scaled by team size) 15. Results 10. Clarity of write-up and figures 15. Related work/context 5. Deliverable weights following CS224N/CS231n: proposal ≈ 1–8%, milestone ≈ 2–6%, poster ≈ 3%, report ≈ 29–32% of the course.

### B5. Honor code
Stanford courses allow collaboration on psets but require individually written solutions and listing collaborators [V-old for STATS214, I as general Stanford practice]. CS336 (2026) adds guidance limiting AI coding assistants on implementation [V-old, secondary] https://trend.hulryung.com/en/posts/2026-06-02-1400-stanford-cs336-language-modeling-from-scratch-ai-agent-coding-guidelines-claudemd/

---

## C. Quick encoding cheat-sheet
```
project_raw   = M * (1 + A)                     # M, A in [0,1] (per-check); max 2.0   [V]
late_factor   = 1.00 if t <= D1 else 0.65 if t <= D2 else 0.50 (ALX) | 0.0 (strict)   [V-old]
project_score = project_raw * late_factor       # multiplier interpretation            [I]
average       = Σ w_i * score_i / Σ w_i                                               [I]
thresholds    : month1 >= 80%, later months >= 70%, graduation >= 60%                [V-old]
uni-style alt : late_pool=4..6, per_assign_cap=2..3, penalty=25%/day after pool, hard stop 3 days
written Q     : Gradescope-style rubric, negative scoring default, floor 0, regrade window 3-7 days
```
