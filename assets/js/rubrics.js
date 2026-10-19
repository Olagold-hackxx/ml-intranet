// Rubrics for written work. Weights are percentages. Each criterion is scored on 5 levels,
// deducting from full marks (the Gradescope default). The task's "must see" items cap
// the first criterion (correctness / accuracy): you can't get more of it than the share of items present.
// Sources: UIUC CS374 standard proof rubrics, CS224N/CS231N project grading, Gradescope rubric conventions.

export const LEVELS = [
  { v: 0, label: "Missing", value: 0 },
  { v: 1, label: "Poor", value: 0.3 },
  { v: 2, label: "Fair", value: 0.6 },
  { v: 3, label: "Good", value: 0.85 },
  { v: 4, label: "Excellent", value: 1 },
];

export const RUBRICS = {
  proof: {
    name: "Proof",
    criteria: [
      { key: "correctness", name: "Correctness", weight: 50, guide: "Every step is valid; the argument proves exactly the stated claim. A major logical gap is at most Fair; a false key step is Poor." },
      { key: "completeness", name: "Completeness", weight: 20, guide: "All cases handled; all assumptions used and stated; nothing hand-waved with 'clearly' or 'similarly'." },
      { key: "rigor", name: "Rigor", weight: 20, guide: "Inequalities, quantifiers, limits and probability statements are justified; lemmas are cited by name." },
      { key: "clarity", name: "Clarity", weight: 10, guide: "A reader can follow it: structure, notation defined, a one-line idea of the proof before the details." },
    ],
  },
  derivation: {
    name: "Derivation",
    criteria: [
      { key: "correctness", name: "Correct result", weight: 50, guide: "Final expression is right, including constants, signs, shapes." },
      { key: "steps", name: "Steps shown", weight: 25, guide: "Each transformation is shown and justified; no unexplained jumps." },
      { key: "precision", name: "Notation & precision", weight: 15, guide: "Dimensions/shapes, indices and conventions are consistent and defined." },
      { key: "clarity", name: "Clarity & interpretation", weight: 10, guide: "Says what the result means and checks it (special case, sanity check)." },
    ],
  },
  essay: {
    name: "Essay",
    criteria: [
      { key: "accuracy", name: "Technical accuracy", weight: 30, guide: "No technical errors; claims are precise." },
      { key: "depth", name: "Depth & insight", weight: 25, guide: "Goes beyond restating sources: connections, consequences, limitations." },
      { key: "structure", name: "Clarity & structure", weight: 20, guide: "Clear thesis, logical flow, readable by a strong undergraduate." },
      { key: "evidence", name: "Evidence & sources", weight: 15, guide: "Claims are backed by equations, experiments or cited papers." },
      { key: "originality", name: "Own voice", weight: 10, guide: "Written in your own words with your own examples, not paraphrased notes." },
    ],
  },
  summary: {
    name: "Summary / notes",
    criteria: [
      { key: "accuracy", name: "Accuracy", weight: 40, guide: "Everything stated is correct." },
      { key: "coverage", name: "Coverage of key ideas", weight: 30, guide: "The main definitions, results and intuitions are all there." },
      { key: "concision", name: "Concision & clarity", weight: 20, guide: "Tight, organized, easy to revise from." },
      { key: "intuition", name: "Own intuition", weight: 10, guide: "Includes your own explanation, example or picture for the hardest idea." },
    ],
  },
  report: {
    name: "Project report",
    criteria: [
      { key: "technical", name: "Technical quality", weight: 30, guide: "Methods are sound and correctly implemented; choices are justified." },
      { key: "experiments", name: "Experiments", weight: 25, guide: "Baselines, ablations, error analysis; numbers are honest and reproducible." },
      { key: "originality", name: "Originality", weight: 15, guide: "A new variant, application or insight — not a cloned repo." },
      { key: "clarity", name: "Clarity of write-up", weight: 15, guide: "Abstract, method, data, experiments, conclusion; figures are readable." },
      { key: "results", name: "Strength of results", weight: 10, guide: "Results are meaningful relative to the baselines and to the effort." },
      { key: "related", name: "Related work", weight: 5, guide: "Positions the work against the right prior papers." },
    ],
  },
  reproduction: {
    name: "Reproduction report",
    criteria: [
      { key: "fidelity", name: "Fidelity", weight: 30, guide: "Reproduces the paper's main claim at a stated scale; setup matches the paper or deviations are listed." },
      { key: "experiments", name: "Experiments & ablations", weight: 25, guide: "At least one ablation that tests why the method works." },
      { key: "analysis", name: "Analysis of gaps", weight: 20, guide: "Explains discrepancies with evidence instead of guesses." },
      { key: "clarity", name: "Clarity", weight: 15, guide: "Readable, with figures and tables." },
      { key: "code", name: "Reproducibility", weight: 10, guide: "Code, configs and seeds released; one command reproduces the main table." },
    ],
  },
};

// levels: { criterionKey: 0..4 }, present: [bool] for task.criteria.
export function rubricScore(rubricKey, levels, present = []) {
  const r = RUBRICS[rubricKey] || RUBRICS.summary;
  const frac = present.length ? present.filter(Boolean).length / present.length : 1;
  let total = 0, got = 0;
  r.criteria.forEach((c, i) => {
    let v = LEVELS[Math.max(0, Math.min(4, levels[c.key] ?? 0))].value;
    if (i === 0) v = Math.min(v, frac);
    total += c.weight;
    got += c.weight * v;
  });
  return total ? got / total : 0;
}
