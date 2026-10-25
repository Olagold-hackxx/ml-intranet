// Core textbooks and the chapters each project reads.
// ESL II  — statistical learning (SLT) + applied methods
// FoML    — computational learning theory (COLT): PAC, Rademacher/VC, margins, online, stability
// SSBD    — both: the main text of the theory track
// `ex` adds an optional "textbook exercises" task: { book, ch, n } = solve n end-of-chapter exercises of chapter ch.

export const BOOKS = {
  ESL: {
    short: "ESL II",
    title: "The Elements of Statistical Learning (2nd ed., 12th printing)",
    authors: "Hastie, Tibshirani & Friedman",
    url: "https://hastie.su.domains/ElemStatLearn/printings/ESLII_print12_toc.pdf.download.html",
    home: "https://hastie.su.domains/ElemStatLearn/",
    role: "SLT · Applied",
    blurb: "The statistician's view of supervised and unsupervised learning: linear methods, model assessment, trees, boosting, kernels, high dimensions.",
  },
  FOML: {
    short: "FoML",
    title: "Foundations of Machine Learning (2nd ed.)",
    authors: "Mohri, Rostamizadeh & Talwalkar",
    url: "https://cs.nyu.edu/~mohri/mlbook/",
    home: "https://cs.nyu.edu/~mohri/mlbook/",
    access: "Book page (MIT Press). Borrow via a library, or use SSBD's matching chapter.",
    role: "COLT",
    blurb: "Computational learning theory with full proofs: PAC, Rademacher & VC bounds, margins, kernels, boosting, online learning, stability, RL.",
  },
  SSBD: {
    short: "SSBD",
    title: "Understanding Machine Learning: From Theory to Algorithms",
    authors: "Shalev-Shwartz & Ben-David",
    url: "https://www.cs.huji.ac.il/~shais/UnderstandingMachineLearning/understanding-machine-learning-theory-algorithms.pdf",
    home: "https://www.cs.huji.ac.il/~shais/UnderstandingMachineLearning/",
    role: "COLT · SLT",
    blurb: "The companion text of Ben-David's lectures: from ERM and PAC to VC, convexity, stability, kernels, online learning and PAC-Bayes.",
  },
};

const r = (book, ch, topic) => ({ book, ch, topic });

export const READINGS = {
  // ---------- Applied · Phase 1 ----------
  A01: { read: [r("ESL", "§2.3.1, §3.1–3.2", "Least squares, the normal equations, Gauss–Markov"), r("FOML", "§11.3.1", "Linear regression as an ERM problem")], ex: { book: "ESL", ch: 3, n: 3 } },
  A02: { read: [r("ESL", "§4.4–4.4.1", "Logistic regression, Newton–Raphson / IRLS"), r("SSBD", "§9.3", "Logistic regression as ERM with the log-loss")], ex: { book: "ESL", ch: 4, n: 2 } },
  A03: { read: [r("ESL", "§4.3, §4.4.5, §6.6.3", "LDA/GDA, logistic regression vs LDA, naive Bayes"), r("SSBD", "Ch 24.1–24.3", "Generative models: MLE, naive Bayes, LDA")], ex: { book: "ESL", ch: 4, n: 2 } },
  A04: { read: [r("ESL", "§4.5, §12.1–12.3", "Separating hyperplanes, support vector classifier, kernels"), r("FOML", "Ch 5–6", "SVMs and kernel methods"), r("SSBD", "Ch 15–16", "SVM and kernel methods")], ex: { book: "FOML", ch: 5, n: 2 } },
  A05: { read: [r("ESL", "§2.9, §3.4, §7.1–7.3, §7.10", "Bias–variance, ridge & lasso, model assessment, cross-validation"), r("FOML", "Ch 4", "Model selection: estimation vs approximation error, SRM, CV"), r("SSBD", "Ch 5, 11", "Bias–complexity tradeoff, model selection & validation")], ex: { book: "ESL", ch: 7, n: 2 } },
  A06: { read: [r("ESL", "§9.2, §8.7, §10.1, Ch 15", "CART, bagging, AdaBoost, random forests"), r("SSBD", "Ch 18, 10", "Decision trees, boosting"), r("FOML", "Ch 7", "Boosting: AdaBoost and its margin analysis")], ex: { book: "ESL", ch: 10, n: 2 } },
  A07: { read: [r("ESL", "§11.3–11.5", "Neural networks, back-propagation, fitting issues"), r("SSBD", "Ch 20", "Neural networks: expressivity, sample complexity, SGD/backprop")], ex: { book: "ESL", ch: 11, n: 2 } },
  A08: { read: [r("ESL", "§8.5, §13.2.1, §14.3, §14.5.1", "EM, k-means, cluster analysis, principal components"), r("SSBD", "Ch 22–23, §24.4", "Clustering, dimensionality reduction, EM"), r("FOML", "Ch 15", "Dimensionality reduction: PCA, kernel PCA")], ex: { book: "ESL", ch: 14, n: 2 } },
  A09: { read: [r("FOML", "§17.1–17.4", "MDPs, policies, value & policy iteration"), r("ESL", "§14.7", "Independent component analysis (advanced task)")], ex: { book: "FOML", ch: 17, n: 2 } },
  A10: { read: [r("ESL", "§7.10–7.11, Ch 15", "Cross-validation, bootstrap, random forests in practice")] },
  // ---------- Applied · Phase 2 ----------
  A11: { read: [r("ESL", "§11.4–11.5", "Fitting neural networks: starting values, weight decay, input scaling")] },
  A12: { read: [r("ESL", "§4.4", "Multinomial logistic (softmax) regression"), r("FOML", "Ch 9", "Multi-class classification: losses and bounds"), r("SSBD", "§17.1–17.2", "Multiclass reductions and linear multiclass predictors")] },
  A13: { read: [r("ESL", "§11.4", "Back-propagation"), r("SSBD", "§20.6", "SGD and backpropagation")] },
  A14: { read: [r("ESL", "§11.5", "Training issues: initialization, overfitting, scaling"), r("SSBD", "Ch 14", "Stochastic gradient descent")] },
  A19: { read: [r("ESL", "§7.10–7.11", "Honest evaluation: cross-validation and the bootstrap")] },
  // ---------- Applied · Phase 3 ----------
  A27: { read: [r("FOML", "Ch 10", "Ranking: score-based ranking, metrics, bipartite ranking")] },
  A28: { read: [r("FOML", "Ch 10", "Ranking losses and generalization")] },
  // ---------- Applied · Phase 4 ----------
  A30: { read: [r("SSBD", "§24.1", "Maximum likelihood estimation")] },
  A31: { read: [r("ESL", "§8.5", "The EM algorithm — the ancestor of the ELBO"), r("SSBD", "§24.4", "Latent variables and EM")] },
  A35: { read: [r("FOML", "§17.4–17.5", "Planning, TD(0), Q-learning, SARSA, TD(λ)")], ex: { book: "FOML", ch: 17, n: 2 } },
  A36: { read: [r("FOML", "§17.5", "Large state spaces and function approximation")] },
  A37: { read: [r("FOML", "Ch 17", "RL review: what changes when you parameterize the policy")] },
  A38: { read: [r("FOML", "Ch 10", "Learning from pairwise preferences (ranking)")] },
  A39: { read: [r("FOML", "Ch 10, 13", "Pairwise preferences; conditional maximum-entropy / logistic models")] },
  // ---------- Applied · Phase 5 ----------
  A45: { read: [r("ESL", "§7.11", "The bootstrap for confidence intervals on benchmark scores")] },
  // ---------- Theory · Pass 1 ----------
  T01: { read: [r("SSBD", "App. B–C", "Measure concentration; linear algebra"), r("FOML", "App. A, C, D", "Linear algebra, probability, concentration inequalities")] },
  T02: { read: [r("SSBD", "Ch 1–2", "A gentle start: ERM, finite classes"), r("FOML", "§2.1–2.2", "The PAC model; finite consistent hypothesis sets")], ex: { book: "FOML", ch: 2, n: 2 } },
  T03: { read: [r("SSBD", "Ch 3", "PAC learning, agnostic PAC"), r("FOML", "§2.3–2.4", "The inconsistent case; Bayes error and noise")], ex: { book: "FOML", ch: 2, n: 2 } },
  T04: { read: [r("SSBD", "Ch 4", "Uniform convergence"), r("FOML", "§2.3", "Uniform convergence bound for finite classes")] },
  T05: { read: [r("SSBD", "Ch 5", "No free lunch; error decomposition"), r("FOML", "§4.1", "Estimation vs approximation error"), r("ESL", "§2.9, §7.3", "The statistical bias–variance decomposition")], ex: { book: "FOML", ch: 4, n: 1 } },
  T06: { read: [r("SSBD", "Ch 6", "VC dimension"), r("FOML", "§3.2–3.3", "Growth function, VC dimension, Sauer's lemma"), r("ESL", "§7.9", "VC dimension from the statistician's side")], ex: { book: "FOML", ch: 3, n: 3 } },
  T07: { read: [r("SSBD", "§6.4–6.5, Ch 28", "The fundamental theorem and its full proof"), r("FOML", "§3.4", "Lower bounds (realizable and agnostic)")], ex: { book: "FOML", ch: 3, n: 2 } },
  T08: { read: [r("SSBD", "Ch 7", "Nonuniform learnability, SRM, MDL"), r("FOML", "§4.2–4.3", "ERM vs SRM")], ex: { book: "FOML", ch: 4, n: 2 } },
  T09: { read: [r("SSBD", "Ch 8", "The runtime of learning"), r("FOML", "Ch 16", "Learning automata and languages: computational hardness")], ex: { book: "FOML", ch: 16, n: 1 } },
  T10: { read: [r("SSBD", "Ch 9–10", "Linear predictors, perceptron, boosting"), r("FOML", "Ch 7, §8.3.1", "AdaBoost analysis; the perceptron mistake bound"), r("ESL", "§10.1–10.6", "Boosting as forward stagewise additive modeling")], ex: { book: "FOML", ch: 7, n: 2 } },
  T11: { read: [r("SSBD", "Ch 11–12", "Validation; convex learning problems"), r("FOML", "§4.4–4.7", "Cross-validation, regularization, convex surrogate losses"), r("ESL", "§7.10", "Cross-validation done right and wrong")], ex: { book: "FOML", ch: 4, n: 2 } },
  T12: { read: [r("SSBD", "Ch 13–14", "Regularization & stability; SGD"), r("FOML", "Ch 14", "Algorithmic stability")], ex: { book: "FOML", ch: 14, n: 2 } },
  T13: { read: [r("SSBD", "Ch 15–16", "SVM; kernel methods"), r("FOML", "Ch 5–6", "SVMs, margin theory, PDS kernels, RKHS"), r("ESL", "§5.8, §12.2–12.3", "RKHS regularization; SVMs and kernels")], ex: { book: "FOML", ch: 6, n: 3 } },
  T14: { read: [r("SSBD", "Ch 28", "Proof of the fundamental theorem — reread before writing"), r("FOML", "Ch 2–3", "The same story in the COLT dialect")] },
  // ---------- Theory · Pass 2 ----------
  T15: { read: [r("ESL", "§8.2–8.3", "Bootstrap and maximum likelihood; Fisher information"), r("FOML", "Ch 12", "Maximum-entropy models and MLE duality")], ex: { book: "ESL", ch: 8, n: 2 } },
  T16: { read: [r("SSBD", "App. B", "Measure concentration"), r("FOML", "App. D", "Concentration inequalities: Hoeffding, McDiarmid, Bernstein")] },
  T17: { read: [r("SSBD", "Ch 26", "Rademacher complexities"), r("FOML", "§3.1", "Rademacher complexity and generalization bounds")], ex: { book: "FOML", ch: 3, n: 2 } },
  T18: { read: [r("SSBD", "Ch 27", "Covering numbers and chaining")] },
  T19: { read: [r("SSBD", "§26.3–26.4", "Rademacher of linear classes; bounds for SVM"), r("FOML", "§5.4", "Margin theory")], ex: { book: "FOML", ch: 5, n: 2 } },
  T20: { read: [r("SSBD", "Ch 16", "Kernel methods, representer theorem"), r("FOML", "§6.2–6.3", "PDS kernels, RKHS, kernel-based algorithms"), r("ESL", "§5.8", "Regularization and reproducing kernel Hilbert spaces")], ex: { book: "FOML", ch: 6, n: 2 } },
  T21: { read: [r("FOML", "App. B", "Convex optimization — what you lose without convexity")] },
  T22: { read: [r("SSBD", "§9.1, §15.1", "Halfspaces and hard-SVM: the max-margin target"), r("FOML", "§5.2", "Separable case: the max-margin solution")] },
  T23: { read: [r("SSBD", "Ch 16", "Kernels — the NTK is one"), r("ESL", "§5.8", "Kernel regression in an RKHS")] },
  T24: { read: [r("ESL", "§2.9, §3.4.1, §18.1", "Bias–variance, ridge (min-norm as its limit), p ≫ N"), r("SSBD", "Ch 5", "The classical tradeoff you are reconciling")] },
  T25: { read: [r("SSBD", "Ch 21", "Online learning: Littlestone dimension, OGD"), r("FOML", "Ch 8", "On-line learning: weighted majority, Hedge, perceptron, online-to-batch")], ex: { book: "FOML", ch: 8, n: 3 } },
  T26: { read: [r("SSBD", "Ch 26, 28", "Rademacher bounds; fundamental theorem"), r("FOML", "Ch 3, 8", "Bounds and regret in one notation")] },
  T27: { read: [r("SSBD", "Ch 30–31", "Compression bounds; PAC-Bayes"), r("FOML", "Ch 14", "Stability — another tool to recognize in papers")] },
};

const BOOK_NAME = (k) => `${BOOKS[k].short} (${BOOKS[k].authors})`;

function exerciseTask(project, ex) {
  const b = BOOKS[ex.book];
  const theory = project.track === "theory";
  return {
    title: `Textbook exercises: ${b.short} Chapter ${ex.ch}`,
    type: "advanced",
    kind: "written",
    points: 2,
    body:
      `Solve at least **${ex.n}** end-of-chapter exercises from **Chapter ${ex.ch}** of *${b.title}* (${b.authors}) — [${b.access ? "book page" : "free PDF"}](${b.url}). ` +
      `Pick the ones closest to this project's concepts.\n\n` +
      `For each exercise: copy the statement **verbatim** with its book number, then give a complete solution ` +
      `(${theory ? "full proof, every step justified, lemmas cited by name" : "full derivation; where an exercise asks for computation, include the short NumPy script and its output"}). ` +
      `End with one line saying which idea of this project the exercise reinforces.\n\n` +
      `Push \`written/book_exercises.pdf\` (or \`.md\` / \`.tex\`) to this project's directory and submit it.`,
    deliverable: "repo",
    files: ["written/book_exercises.pdf"],
    rubric: theory ? "proof" : "derivation",
    criteria: [
      `At least ${ex.n} distinct exercises from ${b.short} Chapter ${ex.ch}, each copied verbatim with its number`,
      "Every exercise is solved completely — no 'left to the reader', no skipped cases",
      theory ? "Each proof states assumptions, justifies every inequality and names the lemmas it uses" : "Each derivation shows every step and checks the result (special case, dimension check or numerical check)",
      "Each solution ends with the project concept it reinforces",
    ],
    source: "book",
  };
}

// Attach readings and optional exercise tasks. Exercise tasks are appended, so existing task indices never move.
export function applyBooks(projects) {
  return projects.map((p) => {
    const spec = READINGS[p.id];
    if (!spec) return p;
    const out = { ...p, books: spec.read };
    if (spec.ex) out.tasks = [...p.tasks, exerciseTask(p, spec.ex)];
    return out;
  });
}

export { BOOK_NAME };
