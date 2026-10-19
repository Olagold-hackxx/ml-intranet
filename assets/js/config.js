// Rules of the game. Change these before you start; they lock once the program begins.

export const RULES = {
  // Score multiplier depending on when a task is passed / submitted.
  firstDeadlineMultiplier: 1.0,   // before the 1st deadline
  secondDeadlineMultiplier: 0.65, // between 1st and 2nd deadline
  lateMultiplier: 0.0,            // after the 2nd deadline (ALX historically used 0.5; we are stricter)

  // Length of the 2nd-deadline window in days, from the project duration.
  secondWindowDays: (days) => Math.min(3, Math.max(1, Math.ceil(days / 2))),

  // Projects release at this local hour; deadlines fall at the same hour.
  releaseHour: 6,

  // Breaks: earn `breakDays` for every `breakEveryActiveDays` days of work. Bank and defer freely.
  breakEveryActiveDays: 56, // ≈ 2 months of work
  breakDays: 14,            // 2 weeks

  // Standing (ALX: ≥80% in month 1, ≥70% afterwards).
  firstMonthThreshold: 80,
  threshold: 70,
  graduationThreshold: 70,

  // Written work: a self-review can't score above this fraction. AI or peer reviews can.
  selfReviewCap: 0.8,
  // Re-review ("regrade") window after a review, in days.
  regradeWindowDays: 7,
  // Quiz must be passed (≥ this %) before tasks unlock. Retakes allowed after 1 hour.
  quizPassMark: 60,
  quizRetryMinutes: 60,
};

// Program shapes. A lane is a stream of projects from one track squeezed or stretched into `span` active days.
// The combined year runs both lanes in parallel: applied from day 0, theory from day 21
// (the plans recommend starting applied first, then layering theory on top).
export const PROGRAMS = {
  applied: {
    name: "Applied ML — 6 months",
    short: "Applied",
    lanes: [{ track: "applied", start: 0, span: 154 }],
    hoursPerWeek: "20–25",
  },
  theory: {
    name: "Theoretical ML — 6 months",
    short: "Theory",
    lanes: [{ track: "theory", start: 0, span: 154 }],
    hoursPerWeek: "18–22",
  },
  combined: {
    name: "Applied + Theory — 12 months, intertwined",
    short: "Combined",
    lanes: [
      { track: "applied", start: 0, span: 294 },
      { track: "theory", start: 21, span: 273 },
    ],
    hoursPerWeek: "20–24",
  },
};

export const COURSES = {
  CS229: { name: "CS229 Machine Learning (Andrew Ng, 2018)", list: "PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU", site: "https://cs229.stanford.edu/" },
  CS221: { name: "CS221 Artificial Intelligence: Principles & Techniques", list: "PLoROMvodv4rOca_Ovz1DvdtWuz8BfSWL2", site: "https://stanford-cs221.github.io/" },
  CS230: { name: "CS230 Deep Learning (Autumn 2025)", list: "PLoROMvodv4rNRRGdS0rBbXOUGA0wjdh1X", site: "https://cs230.stanford.edu/" },
  CS231N: { name: "CS231N Deep Learning for Computer Vision (2025)", list: "PLoROMvodv4rOmsNzYBMe0gJY2XS8AQg16", site: "https://cs231n.stanford.edu/" },
  CS224N: { name: "CS224N NLP with Deep Learning", list: "PLoROMvodv4rOaMFbaqxPDoLWjDaRAdP9D", site: "https://web.stanford.edu/class/cs224n/" },
  CS224U: { name: "CS224U Natural Language Understanding", list: "PLoROMvodv4rPt5D0zs3YhbWSZA8Q_DyiJ", site: "https://web.stanford.edu/class/cs224u/" },
  CS236: { name: "CS236 Deep Generative Models (2023)", list: "PLoROMvodv4rPOWA-omMM6STXaWW4FvJT8", site: "https://deepgenerativemodels.github.io/" },
  CS234: { name: "CS234 Reinforcement Learning (Spring 2024)", list: "PLoROMvodv4rN4wG6Nk6sNpTEbuOSosZdX", site: "https://web.stanford.edu/class/cs234/" },
  CS329H: { name: "CS329H ML from Human Preferences (Autumn 2024)", list: "PLoROMvodv4rNm525zyAObP4al43WAifZz", site: "https://web.stanford.edu/class/cs329h/" },
  CS336: { name: "CS336 Language Modeling from Scratch (2025)", list: "PLoROMvodv4rOY23Y0BoGoBGgQ1zmU_MT_", site: "https://cs336.stanford.edu/" },
  CME295: { name: "CME295 Transformers & LLMs", list: "PLoROMvodv4rPZxxeUFvQHCkZJsaEBdDZj", },
  CME296: { name: "CME296 Diffusion & Large Vision Models", list: "PLoROMvodv4rNdy8rt2rZ4T2xM0OjADnfu" },
  EVAL: { name: "LLM Evaluation & Scaling", list: "PLoROMvodv4rObv1FMizXqumgVVdzX4_05" },
  BD: { name: "Understanding Machine Learning — Shai Ben-David (UWaterloo 2015)", list: "PLPW2keNyw-usgvmR7FTQ3ZRjfLs5jT4BO", site: "https://www.cs.huji.ac.il/~shais/UnderstandingMachineLearning/" },
  CS229M: { name: "CS229M Machine Learning Theory (Fall 2021, Tengyu Ma)", list: "PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh", site: "https://web.stanford.edu/class/stats214/" },
};

export const playlistUrl = (code) =>
  COURSES[code] ? `https://www.youtube.com/playlist?list=${COURSES[code].list}` : null;

// Requirements shown on every project (ALX "General" block), per track.
export const GENERAL_REQUIREMENTS = {
  applied: [
    "Python 3.10+; code must run top to bottom on a clean environment (pin versions in requirements.txt)",
    "Every Python file starts with `#!/usr/bin/env python3` and ends with a new line",
    "A README.md at the root of the project directory is mandatory",
    "Code follows pycodestyle; every module, class and function has a docstring",
    "Use only the libraries the task allows. \"From scratch\" means NumPy only",
    "Seed every random number generator you use so results are reproducible",
    "Commit early and often: your work only counts once it is pushed to GitHub",
  ],
  theory: [
    "Write solutions by hand first, then typeset them (LaTeX preferred; Markdown + MathJax or a clean scanned PDF accepted)",
    "Every proof states what is assumed, what is being shown, and names each lemma it uses",
    "Collaboration on ideas is allowed; write-ups must be your own and list collaborators and sources",
    "A README.md at the root of the project directory indexes every file",
    "Simulation code (advanced tasks) is Python 3.10+ and NumPy only",
  ],
};
