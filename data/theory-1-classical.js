// Theory track — Pass 1: Classical Statistical Learning Theory (SSBD + Ben-David, UWaterloo 2015).
// Bodies use the `md` tag: String.raw (so LaTeX backslashes survive) with ´ turned into a backtick.

const md = (s, ...v) => String.raw(s, ...v).replace(/´/g, "`");
const py = String.raw;

const PHASE = "Pass 1 — Classical Statistical Learning Theory";
const REPO = "ml-theory";
const SSBD = {
  title: "Shalev-Shwartz & Ben-David — Understanding Machine Learning: From Theory to Algorithms (free PDF)",
  url: "https://www.cs.huji.ac.il/~shais/UnderstandingMachineLearning/understanding-machine-learning-theory-algorithms.pdf",
};
const SSBD_HOME = {
  title: "SSBD book home page (errata, slides)",
  url: "https://www.cs.huji.ac.il/~shais/UnderstandingMachineLearning/",
};
const MOHRI = { title: "Mohri, Rostamizadeh & Talwalkar — Foundations of Machine Learning (book page)", url: "https://cs.nyu.edu/~mohri/mlbook/" };

const WRITTEN_NOTE = md`

**Format.** PDF, Markdown or LaTeX accepted (same base name, extension ´.pdf´, ´.md´ or ´.tex´). Handwritten and scanned is fine if legible. Number every step; name every inequality you use (union bound, Hoeffding, Jensen, …) at the point you use it.`;

const EX_NOTE = md`

**Exercise statements.** Copy the full statement of every exercise verbatim from the free SSBD PDF at the top of its solution (the PDF's numbering is authoritative). One heading per exercise, e.g. ´## Exercise 2.3´, so the portfolio audit in T14 can find it.`;

// Task 0 of every project: README + layout.
function readme(dir, extra = "") {
  return {
    title: "README & repository layout",
    type: "mandatory",
    kind: "code",
    points: 1,
    body: md`Create ´${"README.md"}´ at the root of the project directory with:

- a one-paragraph summary of what this project proves, in your own words;
- a table listing every deliverable file of this project and its status (´todo´ / ´draft´ / ´final´);
- the list of lectures you watched and SSBD sections you read, with dates;
- a short "Where I got stuck" section (be honest — this is for you in Pass 2).

All written solutions go in a ´written/´ sub-directory; code files live at the project root.${extra}

~~~
ml-theory/
  DIR/
    README.md
    written/
    100-*.py
~~~`.replace("DIR", dir),
    files: ["README.md"],
    checks: [
      { type: "readme", path: "README.md", minWords: 120 },
      { type: "exists", path: "written", label: "written/ directory exists" },
    ],
  };
}

// Theorem-sheet summary task.
function sheet(n, items, extraCriteria = []) {
  return {
    title: "Theorem sheet",
    type: "mandatory",
    kind: "written",
    points: 1,
    body: md`Write ´written/${n}-theorem_sheet.md´: a 1–2 page Markdown cheat sheet of this project, written **after** you finish the proofs and **without** copying from the book. For each item give (i) the precise statement in LaTeX with every quantifier, (ii) the one-line proof idea, (iii) where it is used later. Must cover:

${items.map((s) => "- " + s).join("\n")}

End with three "traps" — statements that look true but are false, each with a counterexample.`,
    deliverable: "repo",
    files: [`written/${n}-theorem_sheet.md`],
    rubric: "summary",
    criteria: [
      "Every listed result is stated with all quantifiers in the right order (∀D ∃m vs ∃m ∀D distinctions are correct)",
      "Each proof idea names the key tool (union bound, Hoeffding, Sauer, Markov, …) rather than restating the theorem",
      "Three genuine traps, each with a correct counterexample",
      ...extraCriteria,
    ],
  };
}

export default [
  // ───────────────────────────────────────────────────────────────── T01
  {
    id: "T01",
    track: "theory",
    phase: PHASE,
    title: "Prerequisites: Probability, Concentration & Linear Algebra",
    days: 5,
    repo: REPO,
    dir: "0x00-prerequisites",
    sources: [
      { course: "BD", lectures: "Lec 1", topics: "Preview only — course overview & motivation (watch after the self-check)" },
    ],
    resources: [
      { title: "Vershynin — High-Dimensional Probability, Ch. 2 (concentration of sums)", url: "https://www.math.uci.edu/~rvershyn/papers/HDP-book/HDP-book.pdf" },
      { title: "Axler — Linear Algebra Done Right (free online edition)", url: "https://linear.axler.net/" },
      { title: "SSBD Appendix B (measure concentration) & Appendix C (linear algebra)", url: SSBD.url },
      { title: "Hoeffding's inequality (overview & proof sketch)", url: "https://en.wikipedia.org/wiki/Hoeffding%27s_inequality" },
      { title: "Spectral theorem (overview)", url: "https://en.wikipedia.org/wiki/Spectral_theorem" },
    ],
    concepts: ["Markov & Chebyshev inequalities", "Chernoff method & Hoeffding's lemma", "Weak & strong laws of large numbers", "Moment generating functions", "Spectral theorem for symmetric matrices", "Positive semidefinite matrices & Rayleigh quotients"],
    objectives: [
      "State and prove Markov's, Chebyshev's and Hoeffding's inequalities without notes",
      "Explain the Chernoff recipe: exponentiate, apply Markov, bound the MGF, optimise λ",
      "State the weak and strong laws of large numbers and sketch a proof of each",
      "Compute means, variances and MGFs of Bernoulli, Binomial and Gaussian variables",
      "State the spectral theorem and diagonalise a symmetric matrix by hand",
      "Explain why concentration (not just convergence) is what learning theory needs",
    ],
    requirements: [
      "Ross, A First Course in Probability (Ch. 4–8) and Axler, Linear Algebra Done Right (Ch. 7) are the reference books — read them if any proof here takes you more than 2 hours",
      "Python 3.10+, NumPy only for code tasks",
    ],
    quiz: [
      { q: "X ≥ 0 with E[X] = 2. What is the best bound Markov gives on P(X ≥ 10)?", options: ["0.02", "0.2", "0.04", "No bound without the variance"], answer: 1, why: "Markov: P(X ≥ a) ≤ E[X]/a = 2/10." },
      { q: "X̄ is the mean of n i.i.d. variables in [0,1]. How does Hoeffding's bound on P(|X̄ − μ| ≥ ε) scale with n?", options: ["1/n", "1/√n", "exp(−2nε²)", "exp(−nε)"], answer: 2, why: "P(|X̄ − μ| ≥ ε) ≤ 2exp(−2nε²/(b−a)²) — exponential in n, versus 1/n for Chebyshev." },
      { q: "Which statement is the spectral theorem for real matrices?", options: ["Every square matrix is diagonalisable", "Every symmetric matrix has an orthonormal eigenbasis with real eigenvalues", "Every invertible matrix is orthogonally diagonalisable", "Every PSD matrix has distinct eigenvalues"], answer: 1, why: "A = QΛQᵀ with Q orthogonal and Λ real diagonal holds exactly for symmetric A." },
      { q: "The WLLN via Chebyshev needs which assumption beyond i.i.d.?", options: ["Bounded support", "Finite variance", "Finite fourth moment", "Continuity of the distribution"], answer: 1, why: "P(|X̄−μ| ≥ ε) ≤ σ²/(nε²) → 0 needs σ² < ∞ (finite mean alone suffices via other proofs)." },
    ],
    tasks: [
      readme("0x00-prerequisites", "\n\nAlso include a self-assessment table: for each item of the plan's self-check (Markov, Chebyshev, Hoeffding, WLLN/SLLN, standard distributions, spectral theorem, ε–δ analysis) rate yourself 1–5 before and after this project."),
      {
        title: "Markov and Chebyshev",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/1-markov_chebyshev.pdf´.

Prove, from the definition of expectation:

**Markov.** If $X \ge 0$ and $a > 0$ then $$\Pr[X \ge a] \le \frac{\mathbb{E}[X]}{a}.$$

**Chebyshev.** If $\mathrm{Var}(X) = \sigma^2 < \infty$ and $a > 0$ then $$\Pr[|X - \mathbb{E}X| \ge a] \le \frac{\sigma^2}{a^2}.$$

Then:
1. Show Markov is tight: for every $a > 0$ and $\mu \in (0, a]$ construct $X \ge 0$ with $\mathbb{E}X = \mu$ and $\Pr[X \ge a] = \mu / a$.
2. Prove the "reverse Markov" used in SSBD Lemma B.1: if $Z \in [0,1]$ then for $a \in (0,1)$, $\Pr[Z > 1 - a] \ge \frac{\mathbb{E}[Z] - (1-a)}{a}$.
3. Apply Chebyshev to $\bar X_n = \frac1n\sum_{i=1}^n X_i$ (i.i.d., variance $\sigma^2$) and deduce how many samples guarantee $\Pr[|\bar X_n - \mu| \ge \varepsilon] \le \delta$.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/1-markov_chebyshev.pdf"],
        rubric: "proof",
        criteria: [
          "Markov proved via X ≥ a·1[X ≥ a] (or the integral split), with the non-negativity assumption used explicitly",
          "Chebyshev obtained by applying Markov to (X − EX)² with threshold a²",
          "Tightness example is a two-point distribution on {0, a} with the right masses",
          "Reverse-Markov proof applies Markov to 1 − Z (or splits the expectation) correctly",
          "Sample size n ≥ σ²/(δε²) derived, with Var(X̄) = σ²/n justified by independence",
        ],
      },
      {
        title: "Hoeffding's lemma and inequality",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`File: ´written/2-hoeffding.pdf´. This inequality is used in almost every proof of Pass 1 — prove it completely.

**Hoeffding's lemma.** If $\mathbb{E}[X] = 0$ and $a \le X \le b$ a.s., then for all $\lambda \in \mathbb{R}$:
$$\mathbb{E}\big[e^{\lambda X}\big] \le \exp\!\Big(\frac{\lambda^2 (b-a)^2}{8}\Big).$$

**Hoeffding's inequality.** If $X_1,\dots,X_m$ are i.i.d. with $\mathbb{E}X_i = \mu$ and $a \le X_i \le b$, then for every $\varepsilon > 0$:
$$\Pr\Big[\Big|\frac1m\sum_{i=1}^m X_i - \mu\Big| \ge \varepsilon\Big] \le 2\exp\!\Big(-\frac{2m\varepsilon^2}{(b-a)^2}\Big).$$

Requirements:
1. Prove the lemma: use convexity of $x \mapsto e^{\lambda x}$ on $[a,b]$, rewrite the bound as $e^{L(h)}$ with $h = \lambda(b-a)$, and show $L(0) = L'(0) = 0$, $L''(h) \le 1/4$, then use Taylor's theorem.
2. Prove the inequality by the Chernoff method (Markov on $e^{\lambda \sum (X_i - \mu)}$, independence, lemma, optimise $\lambda$), then handle the other tail.
3. Compare with Chebyshev: for $[0,1]$-valued variables, $\varepsilon = 0.05$, $\delta = 0.01$, compute the $m$ each inequality requires.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/2-hoeffding.pdf"],
        rubric: "proof",
        criteria: [
          "Convexity bound e^{λx} ≤ ((b−x)/(b−a))e^{λa} + ((x−a)/(b−a))e^{λb} stated and used with E[X]=0",
          "Function L(h) defined; L(0)=0, L'(0)=0 and L''(h) ≤ 1/4 all verified (the last via p(1−p) ≤ 1/4)",
          "Chernoff step: Markov applied to exp(λ·sum), independence factorises the MGF",
          "Optimal λ = 4mε/(b−a)² (or equivalent for the mean) found, giving exp(−2mε²/(b−a)²); two tails combined by a union bound",
          "Numerical comparison: Chebyshev needs m = 10,000 (with σ² ≤ 1/4) vs Hoeffding ≈ 1,060",
        ],
      },
      {
        title: "Moments and the laws of large numbers",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/3-moments_lln.pdf´.

1. Derive mean, variance and MGF $M(\lambda) = \mathbb{E}e^{\lambda X}$ of $\mathrm{Bernoulli}(p)$, $\mathrm{Binomial}(n,p)$ and $\mathcal{N}(\mu, \sigma^2)$ (complete the square for the Gaussian). Use the MGFs to re-derive the variances.
2. **WLLN.** State: for i.i.d. $X_i$ with finite variance, $\bar X_n \to \mu$ in probability. Prove it.
3. **SLLN (sketch).** State: for i.i.d. $X_i$ with $\mathbb{E}|X_1| < \infty$, $\bar X_n \to \mu$ almost surely. Prove the weaker version assuming $\mathbb{E}[X_1^4] < \infty$: bound $\mathbb{E}[(\sum_i (X_i-\mu))^4] \le C n^2$, apply Markov, then Borel–Cantelli.
4. One paragraph: why does learning theory need *non-asymptotic* tail bounds (Hoeffding) rather than the LLN?${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/3-moments_lln.pdf"],
        rubric: "derivation",
        criteria: [
          "Correct mean/variance/MGF for all three distributions; Gaussian MGF exp(μλ + σ²λ²/2) via completing the square",
          "WLLN proof via Chebyshev with Var(X̄)=σ²/n",
          "Fourth-moment expansion counts only the n terms E[Y⁴] and the 3n(n−1) terms E[Y²]²",
          "Borel–Cantelli applied to Σ P(|X̄_n − μ| > ε) < ∞ to conclude almost-sure convergence",
          "Explains that sample-complexity statements need a bound for a finite m, uniform over distributions",
        ],
      },
      {
        title: "Spectral theorem and PSD matrices",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/4-spectral.pdf´.

**Spectral theorem.** If $A \in \mathbb{R}^{d\times d}$ is symmetric, there is an orthogonal $Q$ and a real diagonal $\Lambda$ with $A = Q\Lambda Q^\top$.

1. Prove: (a) every eigenvalue of a real symmetric matrix is real; (b) eigenvectors for distinct eigenvalues are orthogonal; (c) the full theorem by induction on $d$ (restrict $A$ to $v^\perp$ for an eigenvector $v$).
2. Diagonalise by hand $A = \begin{pmatrix} 2 & 1 & 0\\ 1 & 2 & 0 \\ 0 & 0 & 3\end{pmatrix}$, giving $Q$ and $\Lambda$ explicitly, and verify $Q^\top Q = I$.
3. Prove: $A$ symmetric is PSD $\iff$ all eigenvalues are $\ge 0$ $\iff$ $A = B^\top B$ for some $B$.
4. Prove $\max_{\|x\|=1} x^\top A x = \lambda_{\max}(A)$ (Rayleigh quotient).
5. ε–δ warm-up: prove that if $a_n \to a$ then $\frac1n \sum_{k=1}^n a_k \to a$ (Cesàro).${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/4-spectral.pdf"],
        rubric: "proof",
        criteria: [
          "Real eigenvalues via conjugate-transpose argument v̄ᵀAv = λ‖v‖² = λ̄‖v‖²",
          "Induction step shows v^⊥ is A-invariant using symmetry",
          "Correct eigenvalues {1, 3, 3} with an orthonormal eigenbasis (handles the repeated eigenvalue)",
          "PSD equivalences proved in both directions, B = Λ^{1/2}Qᵀ constructed",
          "Cesàro proof splits the sum at an index N(ε) and controls both parts",
        ],
      },
      sheet(5, [
        "Markov, Chebyshev, reverse Markov (SSBD Lemma B.1)",
        "Hoeffding's lemma and inequality (two-sided)",
        "WLLN and SLLN (hypotheses!)",
        "MGFs of Bernoulli, Binomial, Gaussian",
        "Spectral theorem, PSD characterisations, Rayleigh quotient",
      ]),
      {
        title: "Concentration, empirically",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File: ´100-concentration.py´. NumPy only, no loops over samples.

~~~python
def hoeffding_bound(n, eps, a=0.0, b=1.0):
    """Return 2 * exp(-2 n eps^2 / (b - a)^2) (do not clip at 1)."""

def chebyshev_bound(var, n, eps):
    """Return var / (n * eps^2) for the mean of n i.i.d. variables (do not clip)."""

def empirical_deviation_prob(X, mu, eps):
    """X: array (trials, n). Return the fraction of rows whose mean m_r
    satisfies |m_r - mu| >= eps, as a Python float."""
~~~

Example:
~~~python
>>> hb = __import__('100-concentration')
>>> round(hb.hoeffding_bound(100, 0.1), 4)
0.2707
~~~

In your README, add a plot (or table) of the empirical deviation probability for Bernoulli(1/2) sample means versus both bounds for $n \in \{10, 50, 100, 500\}$ and comment on which bound is tighter and when.`,
        files: ["100-concentration.py"],
        checks: [
          { type: "exists", path: "100-concentration.py" },
          { type: "defines", path: "100-concentration.py", names: ["hoeffding_bound", "chebyshev_bound", "empirical_deviation_prob"] },
          { type: "not_contains", path: "100-concentration.py", pattern: "scipy|sklearn", label: "NumPy only" },
          {
            type: "py_test",
            files: ["100-concentration.py"],
            label: "bounds are exact and dominate the simulation",
            code: py`import numpy as np
from importlib import import_module
m = import_module('100-concentration')
assert np.isclose(m.hoeffding_bound(100, 0.1), 2*np.exp(-2*100*0.01))
assert np.isclose(m.hoeffding_bound(50, 0.5, a=-1.0, b=3.0), 2*np.exp(-2*50*0.25/16))
assert np.isclose(m.chebyshev_bound(0.25, 100, 0.1), 0.25)
assert np.isclose(m.chebyshev_bound(2.0, 10, 0.5), 0.8)
rng = np.random.default_rng(0)
X = rng.integers(0, 2, size=(4000, 200)).astype(float)
p = float(m.empirical_deviation_prob(X, 0.5, 0.0775))
ref = float(np.mean(np.abs(X.mean(axis=1) - 0.5) >= 0.0775))
assert np.isclose(p, ref), (p, ref)
assert p <= m.hoeffding_bound(200, 0.0775)
Y = rng.uniform(-1, 1, size=(3000, 50))
q = float(m.empirical_deviation_prob(Y, 0.0, 0.2))
assert np.isclose(q, np.mean(np.abs(Y.mean(axis=1)) >= 0.2))
print("ok")`,
          },
        ],
      },
      {
        title: "Stretch: Bernstein's inequality",
        type: "advanced",
        kind: "written",
        points: 1,
        body: md`File: ´written/101-bernstein.pdf´.

Prove **Bernstein's inequality**: if $X_1,\dots,X_m$ are i.i.d., $|X_i - \mu| \le M$ a.s. and $\mathrm{Var}(X_i) = \sigma^2$, then
$$\Pr\Big[\frac1m\sum_i X_i - \mu \ge \varepsilon\Big] \le \exp\!\Big(-\frac{m\varepsilon^2}{2\sigma^2 + \tfrac{2}{3}M\varepsilon}\Big).$$
Then explain in one paragraph when Bernstein beats Hoeffding, and why this matters for realizable ($L_{\mathcal{D}} \approx 0$) learning rates.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/101-bernstein.pdf"],
        rubric: "proof",
        criteria: [
          "MGF bound E[e^{λY}] ≤ exp(λ²σ² g(λM)) with an explicit g via the series of e^x",
          "Chernoff step and optimisation over λ carried out (or a valid sub-optimal choice of λ giving the stated constants)",
          "Explains that for small variance the bound is exp(−Θ(mε)) instead of exp(−Θ(mε²)), linking to 1/m vs 1/√m rates",
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── T02
  {
    id: "T02",
    track: "theory",
    phase: PHASE,
    title: "A Gentle Start: ERM & Finite Hypothesis Classes",
    days: 4,
    repo: REPO,
    dir: "0x01-erm_finite_classes",
    sources: [
      { course: "BD", lectures: "Lec 1–2", topics: "Formal learning model, ERM, overfitting, inductive bias, finite hypothesis classes" },
    ],
    resources: [
      { title: "SSBD Ch. 1–2 (Introduction; A Gentle Start)", url: SSBD.url },
      SSBD_HOME,
      { title: "Valiant (1984) — A Theory of the Learnable", url: "https://dl.acm.org/doi/10.1145/1968.1972" },
      { title: "Probably approximately correct learning (overview)", url: "https://en.wikipedia.org/wiki/Probably_approximately_correct_learning" },
    ],
    concepts: ["Statistical learning framework (X, Y, D, f, S)", "True risk vs empirical risk", "Empirical Risk Minimisation", "Overfitting & memorisation", "Inductive bias", "Realizability assumption", "Finite-class sample complexity"],
    objectives: [
      "Define L_{D,f}(h) and L_S(h) and explain why E_S[L_S(h)] = L_{D,f}(h) for a fixed h",
      "Explain why unrestricted ERM overfits and how restricting to H is an inductive bias",
      "State the realizability assumption and the i.i.d. assumption precisely",
      "Prove that a finite class is PAC learnable by ERM with m ≥ log(|H|/δ)/ε",
      "Identify the 'bad hypotheses' and 'misleading samples' sets in the proof",
    ],
    requirements: ["Solutions must be self-contained: define every symbol before using it"],
    quiz: [
      { q: "For a FIXED hypothesis h and S ~ Dᵐ, what is E_S[L_S(h)]?", options: ["0", "L_D(h)", "L_D(h)/m", "It depends on the ERM rule"], answer: 1, why: "L_S(h) is an average of m i.i.d. indicators with mean L_D(h). This fails for h = h_S, which depends on S." },
      { q: "With |H| = 1000, ε = 0.01, δ = 0.05, the finite-class realizable bound requires m ≥ …", options: ["≈ 991", "≈ 69", "≈ 99,000", "≈ 9,900"], answer: 0, why: "log(1000/0.05)/0.01 = log(20000)/0.01 ≈ 9.90/0.01 ≈ 991." },
      { q: "In the proof of the finite-class bound, which tool turns 'some bad h looks perfect on S' into a sum?", options: ["Hoeffding", "Markov", "The union bound", "Jensen"], answer: 2, why: "Dᵐ(∪_{h∈H_B} M_h) ≤ Σ_{h∈H_B} Dᵐ(M_h)." },
      { q: "The memorising predictor (returns y_i on seen x_i, 0 elsewhere) has …", options: ["L_S = 0 but possibly L_D = 1/2", "L_S = L_D always", "L_D = 0 whenever realizable", "L_S > 0 on separable data"], answer: 0, why: "SSBD §2.2.1: zero empirical risk, but true risk 1/2 on the 'papayas' example — overfitting." },
    ],
    tasks: [
      readme("0x01-erm_finite_classes"),
      {
        title: "Finite classes are PAC learnable",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`File: ´written/1-finite_classes.pdf´. Watch BD Lec 1–2, read SSBD §2.1–2.3, close the book, then prove:

**Theorem (SSBD Corollary 2.3).** Let $\mathcal{H}$ be a finite hypothesis class, $\delta \in (0,1)$, $\varepsilon > 0$ and
$$m \ge \frac{\log(|\mathcal{H}|/\delta)}{\varepsilon}.$$
Then for every labelling function $f$ and every distribution $\mathcal{D}$ for which realizability holds (some $h^\star \in \mathcal{H}$ has $L_{(\mathcal{D},f)}(h^\star) = 0$), with probability at least $1-\delta$ over an i.i.d. sample $S$ of size $m$, every ERM hypothesis $h_S$ satisfies $L_{(\mathcal{D},f)}(h_S) \le \varepsilon$.

Your proof must define the set of bad hypotheses $\mathcal{H}_B = \{h : L_{(\mathcal{D},f)}(h) > \varepsilon\}$ and the set of misleading samples $M = \{S|_x : \exists h \in \mathcal{H}_B, L_S(h) = 0\}$, and justify every inequality. Finally, answer: which step breaks if realizability fails? Which step breaks if the sample is not i.i.d.?${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/1-finite_classes.pdf"],
        rubric: "proof",
        criteria: [
          "Uses realizability to get L_S(h_S) = 0, hence {bad h_S} ⊆ M = ∪_{h∈H_B} M_h",
          "Union bound over H_B, then independence: Dᵐ(M_h) = (1 − L(h))ᵐ ≤ (1−ε)ᵐ",
          "Uses 1 − ε ≤ e^{−ε} to get |H_B| e^{−εm} ≤ |H| e^{−εm} and solves for m",
          "Correctly identifies where realizability and i.i.d. are used",
        ],
      },
      {
        title: "Exercise 2.1 — Overfitting of polynomial matching",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`File: ´written/2-ex_2_1.pdf´. Solve **SSBD Exercise 2.1**: given a training set $S$, exhibit a polynomial $p_S$ such that $h_S(x) = 1 \iff p_S(x) \ge 0$, where $h_S$ is the memorising predictor of SSBD Eq. (2.3). Conclude that ERM over the class of all polynomial threshold functions can overfit.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/2-ex_2_1.pdf"],
        rubric: "proof",
        criteria: [
          "Explicit p_S given (e.g. p_S(x) = −∏_{i: y_i=1} ‖x − x_i‖²), with the zero set equal to the positive training points",
          "Verifies both directions of the equivalence, including points off the training set",
          "Draws the conclusion about overfitting / the need for inductive bias",
        ],
      },
      {
        title: "Exercise 2.2 — Expected empirical risk",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`File: ´written/3-ex_2_2.pdf´. Solve **SSBD Exercise 2.2**: for every fixed $h \in \mathcal{H}$, show
$$\mathbb{E}_{S|_x \sim \mathcal{D}^m}\big[L_{S}(h)\big] = L_{(\mathcal{D},f)}(h).$$
Then give a concrete example (distribution + class) where $\mathbb{E}_S[L_S(h_S)] < L_{\mathcal{D}}(h_S)$ in expectation for ERM, and explain why the identity does not apply to $h_S$.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/3-ex_2_2.pdf"],
        rubric: "proof",
        criteria: [
          "Linearity of expectation over the m indicator terms, each with expectation L_{(D,f)}(h)",
          "Uses that x_i ~ D marginally (identically distributed) — independence is not even needed",
          "Valid counterexample for h = h_S (e.g. memoriser) and explanation that h_S depends on S",
        ],
      },
      {
        title: "Exercise 2.3 — Axis-aligned rectangles",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`File: ´written/4-ex_2_3.pdf´. Solve **SSBD Exercise 2.3** in full (all parts):

1. Show that the algorithm $A$ returning the tightest axis-aligned rectangle containing all positive examples is an ERM in the realizable case.
2. Show that if $A$ receives $m \ge \frac{4\log(4/\delta)}{\varepsilon}$ examples, then with probability at least $1-\delta$ it returns a rectangle with error at most $\varepsilon$ (use the four strips $R_1,\dots,R_4$ of mass $\varepsilon/4$ each).
3. Repeat for axis-aligned boxes in $\mathbb{R}^d$: derive the bound $m \ge \frac{2d\log(2d/\delta)}{\varepsilon}$.
4. Show the runtime of $A$ is polynomial in $d, 1/\varepsilon, \log(1/\delta)$.

Careful: the strips must be defined so that each has probability mass **exactly** (or at least) $\varepsilon/4$ — handle distributions with atoms.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/4-ex_2_3.pdf"],
        rubric: "proof",
        criteria: [
          "ERM claim: output contains every positive and lies inside the target rectangle, so it has zero empirical error",
          "Error region ⊆ R* \\ R(S); if S hits every strip R_i then the error is ≤ ε",
          "P(S misses R_i) ≤ (1 − ε/4)ᵐ ≤ e^{−εm/4}, union bound over 4 strips, solved for m",
          "Generalisation to 2d strips in ℝᵈ with the correct constant",
          "Runtime O(md) argued",
        ],
      },
      sheet(5, [
        "The statistical learning framework (domain, labels, D, f, S, L_D, L_S)",
        "ERM and ERM_H; the memorising predictor",
        "Realizability assumption",
        "Corollary 2.3 (finite classes, realizable) with the exact sample size",
        "Rectangles sample complexity (Ex. 2.3)",
      ]),
      {
        title: "ERM over a finite class",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File: ´100-erm_finite.py´. NumPy only. A finite class over $m$ points is represented by its prediction matrix ´H_preds´ of shape ´(k, m)´ with entries in $\{0,1\}$: row $j$ is $(h_j(x_1),\dots,h_j(x_m))$.

~~~python
def empirical_risks(H_preds, y):
    """Return an array (k,) with the 0-1 empirical risk of each hypothesis. No Python loops."""

def erm_finite(H_preds, y):
    """Return the index (int) of an empirical risk minimiser; break ties by the smallest index."""

def realizable_sample_complexity(H_size, eps, delta):
    """Return the smallest integer m with m >= log(H_size / delta) / eps (natural log)."""
~~~

Example:
~~~python
>>> e = __import__('100-erm_finite')
>>> e.realizable_sample_complexity(1000, 0.01, 0.05)
991
~~~

The checker also runs a PAC simulation: thresholds $h_a(x) = \mathbb{1}[x \ge a]$ on a grid of 101 values of $a$, $x \sim U[0,1]$, realizable target — at $m$ given by your sample complexity the failure frequency must be below $\delta$.`,
        files: ["100-erm_finite.py"],
        checks: [
          { type: "exists", path: "100-erm_finite.py" },
          { type: "defines", path: "100-erm_finite.py", names: ["empirical_risks", "erm_finite", "realizable_sample_complexity"] },
          {
            type: "py_test",
            files: ["100-erm_finite.py"],
            label: "ERM, tie-breaking and sample complexity",
            code: py`import numpy as np
from importlib import import_module
e = import_module('100-erm_finite')
rng = np.random.default_rng(0)
H = rng.integers(0, 2, size=(50, 30))
y = rng.integers(0, 2, size=30)
r = np.asarray(e.empirical_risks(H, y), dtype=float)
assert r.shape == (50,)
assert np.allclose(r, (H != y).mean(axis=1))
H2 = np.vstack([H, H[int(np.argmin(r))]])
assert int(e.erm_finite(H2, y)) == int(np.argmin(r))
assert int(e.realizable_sample_complexity(1000, 0.01, 0.05)) == int(np.ceil(np.log(1000/0.05)/0.01))
assert int(e.realizable_sample_complexity(10, 0.1, 0.1)) == 47
print("ok")`,
          },
          {
            type: "py_test",
            files: ["100-erm_finite.py"],
            label: "PAC guarantee holds in simulation (thresholds)",
            code: py`import numpy as np
from importlib import import_module
e = import_module('100-erm_finite')
rng = np.random.default_rng(1)
grid = np.linspace(0, 1, 101)
a_star = grid[37]
eps, delta = 0.05, 0.1
m = int(e.realizable_sample_complexity(len(grid), eps, delta))
fails = 0
trials = 300
for _ in range(trials):
    x = rng.uniform(0, 1, m)
    y = (x >= a_star).astype(int)
    H = (x[None, :] >= grid[:, None]).astype(int)
    j = int(e.erm_finite(H, y))
    assert (H[j] == y).all(), "ERM must be consistent in the realizable case"
    fails += abs(grid[j] - a_star) > eps
assert fails / trials <= delta, fails / trials
print("ok")`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── T03
  {
    id: "T03",
    track: "theory",
    phase: PHASE,
    title: "PAC Learning: Realizable & Agnostic",
    days: 5,
    repo: REPO,
    dir: "0x02-pac_learning",
    sources: [
      { course: "BD", lectures: "Lec 3–4", topics: "PAC learning, agnostic PAC, general loss functions, Bayes optimal predictor" },
    ],
    resources: [
      { title: "SSBD Ch. 3 (A Formal Learning Model)", url: SSBD.url },
      { title: "Valiant (1984) — A Theory of the Learnable", url: "https://dl.acm.org/doi/10.1145/1968.1972" },
      MOHRI,
      { title: "Probably approximately correct learning (overview)", url: "https://en.wikipedia.org/wiki/Probably_approximately_correct_learning" },
    ],
    concepts: ["PAC learnability & sample complexity function", "Agnostic PAC learnability", "Bayes optimal predictor", "General loss functions & risk", "Improper vs proper learning", "Monotonicity of m_H(ε, δ)"],
    objectives: [
      "State the definitions of PAC and agnostic PAC learnability with all quantifiers in the right order",
      "Explain why agnostic learning compares to min_{h∈H} L_D(h) rather than to 0",
      "Prove that the Bayes predictor is optimal for 0-1 loss",
      "Prove that finite classes are agnostic PAC learnable with m ≤ ⌈2 log(2|H|/δ)/ε²⌉",
      "Explain the role of ε (accuracy) and δ (confidence) and why m depends on log(1/δ)",
    ],
    requirements: ["Every definition must quantify over all distributions D — say so explicitly"],
    quiz: [
      { q: "In the definition of PAC learnability, the sample complexity m_H(ε, δ) may depend on …", options: ["ε, δ and D", "ε, δ only (and H)", "ε, δ and the target f", "Only on |H|"], answer: 1, why: "m_H must work uniformly for every D and every realizable f — it depends only on ε, δ (and the class)." },
      { q: "The agnostic guarantee for finite H scales as …", options: ["log(|H|/δ)/ε", "log(|H|/δ)/ε²", "|H|/ε²", "log(1/δ)/ε"], answer: 1, why: "m ≤ ⌈2 log(2|H|/δ)/ε²⌉ — the 1/ε² (vs 1/ε realizable) comes from Hoeffding." },
      { q: "For 0-1 loss, the Bayes optimal predictor is …", options: ["argmin_{h∈H} L_S(h)", "1[P(y=1|x) ≥ 1/2]", "Always the constant majority label", "Undefined without realizability"], answer: 1, why: "Pointwise, predicting the more likely label minimises conditional error." },
      { q: "A learner that may output h ∉ H is called …", options: ["Agnostic", "Improper (representation independent)", "Consistent", "Nonuniform"], answer: 1, why: "Proper learners output h ∈ H; improper ones may output anything." },
    ],
    tasks: [
      readme("0x02-pac_learning"),
      {
        title: "Finite classes are agnostic PAC learnable",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`File: ´written/1-agnostic_finite.pdf´. This is the plan's "Thm 3.3 (AP-learnability of finite classes)" — in the book the pieces are Definition 3.4 and Corollary 4.6. Prove it here directly, in one self-contained argument:

**Theorem.** Let $\mathcal{H}$ be finite and $\ell : \mathcal{H}\times Z \to [0,1]$. Then $\mathcal{H}$ is agnostic PAC learnable using $\mathrm{ERM}_{\mathcal{H}}$ with sample complexity
$$m_{\mathcal{H}}(\varepsilon,\delta) \le \Big\lceil \frac{2\log(2|\mathcal{H}|/\delta)}{\varepsilon^2} \Big\rceil,$$
i.e. for every distribution $\mathcal{D}$ over $Z$, with probability $\ge 1-\delta$ over $S \sim \mathcal{D}^m$: $L_{\mathcal{D}}(h_S) \le \min_{h\in\mathcal{H}} L_{\mathcal{D}}(h) + \varepsilon$.

Steps your proof must contain: (i) the definition of agnostic PAC learnability (SSBD Def. 3.4, general loss version); (ii) Hoeffding for a fixed $h$; (iii) union bound over $\mathcal{H}$ giving $\varepsilon/2$-representativeness; (iv) the three-line chain from representativeness to the ERM guarantee. Then explain where the constant 2 and the $\varepsilon/2$ come from, and why the realizable rate $1/\varepsilon$ becomes $1/\varepsilon^2$.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/1-agnostic_finite.pdf"],
        rubric: "proof",
        criteria: [
          "States the agnostic PAC definition with ∀ε,δ ∃m ∀D and the min over H on the right-hand side",
          "Hoeffding applied to the m i.i.d. losses ℓ(h, z_i) ∈ [0,1] for a fixed h, giving 2exp(−2mε'²)",
          "Union bound over |H| hypotheses with ε' = ε/2, solved for m = 2 log(2|H|/δ)/ε²",
          "Chain L_D(h_S) ≤ L_S(h_S) + ε/2 ≤ L_S(h) + ε/2 ≤ L_D(h) + ε for every h",
          "Explains the 1/ε vs 1/ε² difference (zero-error event vs two-sided deviation)",
        ],
      },
      {
        title: "Bayes optimality",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`File: ´written/2-bayes_optimal.pdf´.

Let $\mathcal{D}$ be any distribution over $\mathcal{X}\times\{0,1\}$ and $\eta(x) = \Pr[y = 1 \mid x]$. Prove that the Bayes predictor $f_{\mathcal{D}}(x) = \mathbb{1}[\eta(x) \ge 1/2]$ satisfies $L_{\mathcal{D}}(f_{\mathcal{D}}) \le L_{\mathcal{D}}(g)$ for **every** $g : \mathcal{X}\to\{0,1\}$, and show
$$L_{\mathcal{D}}(g) - L_{\mathcal{D}}(f_{\mathcal{D}}) = \mathbb{E}_x\big[\,|2\eta(x) - 1|\;\mathbb{1}[g(x) \ne f_{\mathcal{D}}(x)]\,\big].$$
Explain why we cannot simply "learn the Bayes predictor" (what is unknown?).${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/2-bayes_optimal.pdf"],
        rubric: "proof",
        criteria: [
          "Conditions on x: P(g(x) ≠ y | x) = η(x)1[g(x)=0] + (1−η(x))1[g(x)=1]",
          "Pointwise comparison shows f_D minimises the conditional error",
          "Excess-risk identity derived exactly with |2η(x) − 1|",
          "Notes that η is unknown since D is unknown — motivates restricting to H",
        ],
      },
      {
        title: "Exercise 3.1 — Monotonicity of sample complexity",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`File: ´written/3-ex_3_1.pdf´. Solve **SSBD Exercise 3.1**: let $\mathcal{H}$ be PAC learnable with sample complexity $m_{\mathcal{H}}(\cdot,\cdot)$ (the *minimal* function). Show that $m_{\mathcal{H}}$ is monotonically non-increasing in each of its parameters: for $0 < \varepsilon_1 \le \varepsilon_2 < 1$ and fixed $\delta$, $m_{\mathcal{H}}(\varepsilon_1,\delta) \ge m_{\mathcal{H}}(\varepsilon_2,\delta)$, and similarly in $\delta$.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/3-ex_3_1.pdf"],
        rubric: "proof",
        criteria: [
          "Uses minimality of m_H explicitly",
          "Argues that any m that works for (ε₁, δ) also works for (ε₂, δ) since the event L ≤ ε₁ ⊆ L ≤ ε₂",
          "Symmetric argument for δ written out, not just 'similarly'",
        ],
      },
      {
        title: "Exercises 3.2–3.3 — Singletons and concentric circles",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/4-ex_3_2-3_3.pdf´.

- **SSBD Exercise 3.2** — $\mathcal{H}_{\text{Singleton}} = \{h_z : z\in\mathcal{X}\} \cup \{h^-\}$ on a discrete domain: describe an algorithm implementing ERM in the realizable setting, and show that $\mathcal{H}_{\text{Singleton}}$ is PAC learnable with an explicit upper bound on its sample complexity. (Note: $\mathcal{X}$ may be infinite, so you cannot use the finite-class bound.)
- **SSBD Exercise 3.3** — $\mathcal{X} = \mathbb{R}^2$, $\mathcal{H}$ = concentric circles $h_r(x) = \mathbb{1}[\|x\| \le r]$: prove $\mathcal{H}$ is PAC learnable in the realizable case with $m_{\mathcal{H}}(\varepsilon,\delta) \le \lceil \log(1/\delta)/\varepsilon \rceil$.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/4-ex_3_2-3_3.pdf"],
        rubric: "proof",
        criteria: [
          "Singleton ERM: output h_z for an observed positive z, else h^-; correctness in all realizable cases",
          "Singleton bound handles the case where the target is h_z with tiny P(z), giving m ≥ log(1/δ)/ε",
          "Circles: learner returns the radius of the farthest positive example (tightest circle)",
          "Defines the annulus of mass ε (radius r_ε) and bounds P(no sample in it) ≤ (1−ε)ᵐ ≤ e^{−εm}",
          "Handles atoms / the case where no such r_ε exists",
        ],
      },
      sheet(5, [
        "PAC learnability (Def. 3.1) and agnostic PAC learnability (Def. 3.4) with general loss",
        "Bayes optimal predictor and excess-risk identity",
        "Agnostic finite-class bound ⌈2 log(2|H|/δ)/ε²⌉",
        "Realizable bounds for singletons and circles",
        "Proper vs improper learning",
      ]),
      {
        title: "Concentric circles, empirically",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File: ´100-circles.py´. NumPy only, vectorised.

~~~python
def fit_circle(X, y):
    """X: (m, 2) floats, y: (m,) in {0,1}. Return the radius r (float) of the tightest
    concentric circle h_r(x) = 1[||x|| <= r] containing all positives; 0.0 if there are none."""

def predict_circle(r, X):
    """Return an int array (m,) with entries 1[||x_i|| <= r]."""

def agnostic_sample_complexity(H_size, eps, delta):
    """Return ceil(2 * log(2 * H_size / delta) / eps**2) as an int (natural log)."""
~~~

Example:
~~~python
>>> c = __import__('100-circles')
>>> c.agnostic_sample_complexity(10, 0.1, 0.05)
1199
~~~

The checker runs a realizable simulation: $x = \rho\cdot u$ with $\rho\sim U[0,2]$ and $u$ uniform on the circle, target radius 1, $m = \lceil\log(1/\delta)/\varepsilon\rceil$; the failure frequency of your learner must be close to (at most slightly above, due to sampling) $\delta$.`,
        files: ["100-circles.py"],
        checks: [
          { type: "exists", path: "100-circles.py" },
          { type: "defines", path: "100-circles.py", names: ["fit_circle", "predict_circle", "agnostic_sample_complexity"] },
          {
            type: "py_test",
            files: ["100-circles.py"],
            label: "tightest circle, consistency and PAC simulation",
            code: py`import numpy as np
from importlib import import_module
c = import_module('100-circles')
rng = np.random.default_rng(0)
def sample(m):
    rho = rng.uniform(0, 2, m)
    th = rng.uniform(0, 2*np.pi, m)
    return np.c_[rho*np.cos(th), rho*np.sin(th)], rho
X, rho = sample(40)
y = (rho <= 1.0).astype(int)
r = float(c.fit_circle(X, y))
assert np.isclose(r, np.linalg.norm(X[y == 1], axis=1).max())
p = np.asarray(c.predict_circle(r, X))
assert p.shape == (40,) and (p == y).all()
assert float(c.fit_circle(X, np.zeros(40, dtype=int))) == 0.0
assert int(c.agnostic_sample_complexity(10, 0.1, 0.05)) == int(np.ceil(2*np.log(2*10/0.05)/0.01))
eps, delta = 0.1, 0.1
m = int(np.ceil(np.log(1/delta)/eps))
fails = 0
for _ in range(500):
    X, rho = sample(m)
    y = (rho <= 1.0).astype(int)
    r = float(c.fit_circle(X, y))
    fails += (1.0 - r)/2 > eps
assert fails/500 <= delta + 0.03, fails/500
print("ok")`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── T04
  {
    id: "T04",
    track: "theory",
    phase: PHASE,
    title: "Learning via Uniform Convergence",
    days: 4,
    repo: REPO,
    dir: "0x03-uniform_convergence",
    sources: [
      { course: "BD", lectures: "Lec 5", topics: "ε-representative samples, uniform convergence property, finite classes" },
    ],
    resources: [
      { title: "SSBD Ch. 4 (Learning via Uniform Convergence)", url: SSBD.url },
      { title: "SSBD Appendix B.4 (Hoeffding's inequality)", url: SSBD.url },
      MOHRI,
      { title: "Hoeffding's inequality (overview)", url: "https://en.wikipedia.org/wiki/Hoeffding%27s_inequality" },
    ],
    concepts: ["ε-representative sample", "Uniform convergence property", "m_H^UC(ε, δ)", "UC ⇒ agnostic PAC via ERM", "Discretisation trick", "Bounded losses in [a, b]"],
    objectives: [
      "Define an ε-representative sample and the uniform convergence property",
      "Prove Lemma 4.2: ε/2-representative ⇒ ERM output is ε-close to the best in class",
      "Prove that UC with m^UC(ε,δ) implies agnostic PAC with m ≤ m^UC(ε/2, δ)",
      "Prove finite classes have UC with m^UC ≤ ⌈log(2|H|/δ)/(2ε²)⌉",
      "Explain the discretisation trick and why it is a heuristic, not a theorem about ℝᵈ",
    ],
    requirements: ["Prove every lemma of SSBD Ch. 4 — the plan is explicit about this"],
    quiz: [
      { q: "S is ε-representative w.r.t. (H, ℓ, D) when …", options: ["L_S(h_S) ≤ ε", "∀h∈H: |L_S(h) − L_D(h)| ≤ ε", "∃h∈H: L_D(h) ≤ ε", "L_D(h_S) ≤ min_h L_D(h) + ε"], answer: 1, why: "Representativeness is a uniform (sup over H) statement." },
      { q: "If S is ε/2-representative, then for the ERM output h_S …", options: ["L_D(h_S) ≤ ε", "L_D(h_S) ≤ min_h L_D(h) + ε", "L_S(h_S) = L_D(h_S)", "Nothing can be said"], answer: 1, why: "Lemma 4.2: L_D(h_S) ≤ L_S(h_S)+ε/2 ≤ L_S(h)+ε/2 ≤ L_D(h)+ε." },
      { q: "Losses in [a, b] instead of [0, 1] change the finite-class UC sample size by a factor …", options: ["(b − a)", "(b − a)²", "log(b − a)", "None"], answer: 1, why: "Hoeffding's exponent is −2mε²/(b−a)² (SSBD Ex. 4.2)." },
    ],
    tasks: [
      readme("0x03-uniform_convergence"),
      {
        title: "All lemmas of Chapter 4",
        type: "mandatory",
        kind: "written",
        points: 4,
        body: md`File: ´written/1-ch4_lemmas.pdf´. Prove each of the following, in order, with full detail.

**Definition 4.1 / 4.3.** State the definitions of an $\varepsilon$-representative sample and of the uniform convergence property with function $m^{UC}_{\mathcal{H}}:(0,1)^2\to\mathbb{N}$.

**Lemma 4.2.** If $S$ is $\frac{\varepsilon}{2}$-representative then any $h_S \in \mathrm{argmin}_{h\in\mathcal{H}} L_S(h)$ satisfies $L_{\mathcal{D}}(h_S) \le \min_{h\in\mathcal{H}} L_{\mathcal{D}}(h) + \varepsilon$.

**Corollary 4.4.** If $\mathcal{H}$ has the UC property with $m^{UC}_{\mathcal{H}}$ then it is agnostic PAC learnable with $m_{\mathcal{H}}(\varepsilon,\delta) \le m^{UC}_{\mathcal{H}}(\varepsilon/2,\delta)$, and $\mathrm{ERM}_{\mathcal{H}}$ is a successful learner.

**Corollary 4.6.** Finite $\mathcal{H}$ with $\ell\in[0,1]$ has UC with
$$m^{UC}_{\mathcal{H}}(\varepsilon,\delta) \le \Big\lceil\frac{\log(2|\mathcal{H}|/\delta)}{2\varepsilon^2}\Big\rceil, \qquad m_{\mathcal{H}}(\varepsilon,\delta) \le \Big\lceil\frac{2\log(2|\mathcal{H}|/\delta)}{\varepsilon^2}\Big\rceil.$$

**Remark 4.1 (discretisation trick).** If $\mathcal{H}$ is parameterised by $d$ numbers each stored in $b = 64$ bits, derive $m_{\mathcal{H}}(\varepsilon,\delta) \le \frac{128 d + 2\log(2/\delta)}{\varepsilon^2}$ and explain in 3–5 sentences why this is useful but not a proof that infinite classes are learnable.

For each statement, mark explicitly where you use (a) i.i.d. sampling, (b) boundedness of the loss, (c) finiteness of $\mathcal{H}$.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/1-ch4_lemmas.pdf"],
        rubric: "proof",
        criteria: [
          "Definitions of ε-representative and UC stated with ∀D and 'with probability ≥ 1−δ over S ~ Dᵐ'",
          "Lemma 4.2 proved by the 3-inequality chain, with the ERM step identified",
          "Cor 4.4 combines UC at ε/2 with Lemma 4.2",
          "Cor 4.6: Hoeffding per h gives 2exp(−2mε²), union bound over H, solved for m",
          "Discretisation: |H| ≤ 2^{64d} plugged in, constant 128d obtained, limitations discussed",
          "Uses of i.i.d., boundedness and finiteness are each located",
        ],
      },
      {
        title: "Exercise 4.1 — Expected-risk formulation",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/2-ex_4_1.pdf´. Solve **SSBD Exercise 4.1** (the $(\varepsilon,\delta)$ requirement versus a requirement on expected excess risk). Prove both directions: for a learning rule $A$ and a loss bounded in $[0,1]$, the following are equivalent:
1. for every $\varepsilon,\delta>0$ there is $m(\varepsilon,\delta)$ such that $\forall m \ge m(\varepsilon,\delta)$: $\Pr_{S\sim\mathcal{D}^m}[L_{\mathcal{D}}(A(S)) > \varepsilon] < \delta$;
2. $\lim_{m\to\infty}\mathbb{E}_{S\sim\mathcal{D}^m}[L_{\mathcal{D}}(A(S))] = 0$.

Follow the exact formulation in the book (it may phrase things with a general $\lambda_m$); state which direction uses Markov and which uses boundedness.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/2-ex_4_1.pdf"],
        rubric: "proof",
        criteria: [
          "(2 ⇒ 1) via Markov's inequality on the non-negative random variable L_D(A(S))",
          "(1 ⇒ 2) splits the expectation on the event {L > ε}: E ≤ ε + δ·sup ℓ, using boundedness",
          "Handles the limit / quantifiers correctly (choose ε, δ as functions of a target η)",
        ],
      },
      {
        title: "Exercise 4.2 — Bounded loss functions",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`File: ´written/3-ex_4_2.pdf´. Solve **SSBD Exercise 4.2**: in Corollary 4.6 the loss has range $[0,1]$. Prove that if the range is $[a,b]$ then
$$m_{\mathcal{H}}(\varepsilon,\delta) \le m^{UC}_{\mathcal{H}}(\varepsilon/2,\delta) \le \Big\lceil\frac{2\log(2|\mathcal{H}|/\delta)\,(b-a)^2}{\varepsilon^2}\Big\rceil.$$${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/3-ex_4_2.pdf"],
        rubric: "proof",
        criteria: [
          "Hoeffding with range (b − a) applied to each fixed h",
          "Union bound and correct algebra at accuracy ε/2, producing the (b − a)² factor",
          "Alternatively rescales the loss to [0,1] and rescales ε correctly",
        ],
      },
      sheet(4, [
        "ε-representative sample; uniform convergence property",
        "Lemma 4.2, Corollary 4.4, Corollary 4.6",
        "Ex. 4.1 equivalence and Ex. 4.2 [a,b] version",
        "Discretisation trick and its caveat",
      ]),
      {
        title: "Representativeness, empirically",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File: ´100-uniform_convergence.py´. NumPy only, no Python loops over hypotheses or samples.

~~~python
def empirical_risks(H_preds, y):
    """H_preds: (k, m) in {0,1}, y: (m,) in {0,1}. Return (k,) 0-1 empirical risks."""

def representativeness(H_preds, y, true_risks):
    """Return sup_h |L_S(h) - L_D(h)| (float), given the true risks as an array (k,)."""

def uc_sample_size(H_size, eps, delta):
    """Return ceil(log(2 * H_size / delta) / (2 * eps**2)) as an int."""
~~~

Example:
~~~python
>>> u = __import__('100-uniform_convergence')
>>> u.uc_sample_size(101, 0.1, 0.1)
381
~~~

In your README, plot the empirical distribution of ´representativeness´ for thresholds on a grid as $m$ grows and overlay $\varepsilon$ at $m^{UC}$.`,
        files: ["100-uniform_convergence.py"],
        checks: [
          { type: "exists", path: "100-uniform_convergence.py" },
          { type: "defines", path: "100-uniform_convergence.py", names: ["empirical_risks", "representativeness", "uc_sample_size"] },
          {
            type: "py_test",
            files: ["100-uniform_convergence.py"],
            label: "representativeness matches reference; UC holds at m^UC",
            code: py`import numpy as np
from importlib import import_module
u = import_module('100-uniform_convergence')
rng = np.random.default_rng(0)
H = rng.integers(0, 2, size=(20, 64)); y = rng.integers(0, 2, size=64)
tr = rng.uniform(0, 1, 20)
assert np.allclose(np.asarray(u.empirical_risks(H, y), float), (H != y).mean(axis=1))
assert np.isclose(float(u.representativeness(H, y, tr)), np.abs((H != y).mean(axis=1) - tr).max())
assert int(u.uc_sample_size(101, 0.1, 0.1)) == int(np.ceil(np.log(2*101/0.1)/(2*0.01)))
grid = np.linspace(0, 1, 101); a_star = 0.3
true = np.abs(grid - a_star)
eps, delta = 0.1, 0.1
m = int(u.uc_sample_size(len(grid), eps, delta))
bad = 0
for _ in range(200):
    x = rng.uniform(0, 1, m)
    yy = (x >= a_star).astype(int)
    Hp = (x[None, :] >= grid[:, None]).astype(int)
    bad += float(u.representativeness(Hp, yy, true)) > eps
assert bad/200 <= delta, bad/200
print("ok")`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── T05
  {
    id: "T05",
    track: "theory",
    phase: PHASE,
    title: "Bias–Complexity Tradeoff & No Free Lunch",
    days: 5,
    repo: REPO,
    dir: "0x04-no_free_lunch",
    sources: [
      { course: "BD", lectures: "Lec 6", topics: "No-Free-Lunch theorem, prior knowledge, approximation vs estimation error" },
    ],
    resources: [
      { title: "SSBD Ch. 5 (The Bias-Complexity Tradeoff)", url: SSBD.url },
      { title: "Wolpert & Macready (1997) — No Free Lunch Theorems for Optimization", url: "https://doi.org/10.1109/4235.585893" },
      { title: "No free lunch theorem (overview)", url: "https://en.wikipedia.org/wiki/No_free_lunch_theorem" },
      MOHRI,
    ],
    concepts: ["No-Free-Lunch theorem", "Prior knowledge as inductive bias", "Approximation error ε_app", "Estimation error ε_est", "Bias–complexity tradeoff", "Averaging argument (max ≥ average)"],
    objectives: [
      "State the No-Free-Lunch theorem (Thm 5.1) precisely, including m < |X|/2 and the constants 1/7 and 1/8",
      "Reproduce the proof: 2m points, 2^{2m} labellings, max ≥ average, unseen points",
      "Prove that the class of all functions over an infinite domain is not PAC learnable",
      "Decompose L_D(h_S) = ε_app + ε_est and explain how each depends on H and m",
      "Explain why NFL does not contradict the success of ERM on finite classes",
    ],
    requirements: ["Write the NFL proof before reading SSBD §5.1 a second time"],
    quiz: [
      { q: "NFL (SSBD Thm 5.1) requires the training-set size m to satisfy …", options: ["m < |X|", "m < |X|/2", "m < log|X|", "m ≥ |X|/2"], answer: 1, why: "The proof uses a set C ⊆ X of size 2m, so half of C is unseen." },
      { q: "In the NFL proof, the key inequality on the average over labellings is …", options: ["max_i E[L] ≥ (1/4)", "min_i E[L] ≥ 1/4", "E[L] ≤ 1/8", "max_i E[L] ≤ 1/2"], answer: 0, why: "max_i E_S[L_{D_i}(A(S))] ≥ 1/4, then Ex. 5.1 converts it into P(L ≥ 1/8) ≥ 1/7." },
      { q: "Enlarging H (with m fixed) typically …", options: ["Increases ε_app, decreases ε_est", "Decreases ε_app, increases ε_est", "Decreases both", "Changes neither"], answer: 1, why: "A richer class approximates better but is harder to estimate." },
      { q: "The approximation error ε_app = min_{h∈H} L_D(h) depends on …", options: ["The sample S", "m", "H and D only", "The ERM tie-breaking rule"], answer: 2, why: "It does not depend on the sample at all." },
    ],
    tasks: [
      readme("0x04-no_free_lunch"),
      {
        title: "The No-Free-Lunch theorem",
        type: "mandatory",
        kind: "written",
        points: 4,
        body: md`File: ´written/1-nfl.pdf´. Prove from scratch:

**Theorem 5.1 (No-Free-Lunch).** Let $A$ be any learning algorithm for binary classification with the 0-1 loss over a domain $\mathcal{X}$, and let $m < |\mathcal{X}|/2$ be a training-set size. Then there exists a distribution $\mathcal{D}$ over $\mathcal{X}\times\{0,1\}$ such that:
1. there exists $f:\mathcal{X}\to\{0,1\}$ with $L_{\mathcal{D}}(f) = 0$;
2. with probability at least $1/7$ over $S\sim\mathcal{D}^m$: $L_{\mathcal{D}}(A(S)) \ge 1/8$.

Your proof must: (i) fix $C\subseteq\mathcal{X}$ with $|C| = 2m$, enumerate the $T = 2^{2m}$ functions $f_1,\dots,f_T$ on $C$ and define $\mathcal{D}_i$; (ii) show
$$\max_{i\in[T]}\ \mathbb{E}_{S\sim\mathcal{D}_i^m}\big[L_{\mathcal{D}_i}(A(S))\big] \ge \frac14$$
by enumerating the $k = (2m)^m$ sequences, exchanging max/average/min, and pairing $f_i$ with the $f_{i'}$ that differs only on an unseen point $v_r$; (iii) conclude using the lemma of Exercise 5.1.

Then (iv) one paragraph: why does this not contradict Corollary 2.3?${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/1-nfl.pdf"],
        rubric: "proof",
        criteria: [
          "Construction of C (|C| = 2m), the T = 2^{2m} labellings and D_i uniform over {(x, f_i(x)) : x ∈ C}",
          "Chain max_i (1/k)Σ_j L ≥ (1/T)Σ_i (1/k)Σ_j L ≥ min_j (1/T)Σ_i L",
          "Uses that at least p ≥ m points v_1..v_p of C are absent from each sequence, and L ≥ (1/2p)Σ_r 1[A(S)(v_r) ≠ f_i(v_r)]",
          "Pairing argument: for each r, the partition of labellings into pairs differing only at v_r gives average 1/2 ⇒ 1/4",
          "Final step uses Ex. 5.1 (P[θ ≥ 1/8] ≥ 1/7 when E θ ≥ 1/4, θ ∈ [0,1])",
        ],
      },
      {
        title: "Corollary 5.2 and the error decomposition",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/2-decomposition.pdf´.

1. **Corollary 5.2.** Let $\mathcal{X}$ be infinite and $\mathcal{H}$ the set of all functions $\mathcal{X}\to\{0,1\}$. Prove $\mathcal{H}$ is not PAC learnable (assume a sample complexity exists and reach a contradiction with Thm 5.1 for $\varepsilon < 1/8$, $\delta < 1/7$).
2. **Error decomposition.** For $h_S = \mathrm{ERM}_{\mathcal{H}}(S)$ show
$$L_{\mathcal{D}}(h_S) = \underbrace{\min_{h\in\mathcal{H}} L_{\mathcal{D}}(h)}_{\varepsilon_{\text{app}}} + \underbrace{\Big(L_{\mathcal{D}}(h_S) - \min_{h\in\mathcal{H}} L_{\mathcal{D}}(h)\Big)}_{\varepsilon_{\text{est}}},$$
bound $\varepsilon_{\text{est}}$ for finite $\mathcal{H}$ in terms of $|\mathcal{H}|, m, \delta$ (from T03), and describe what happens to both terms along a nested sequence $\mathcal{H}_1\subset\mathcal{H}_2\subset\cdots$.
3. Contrast this decomposition with the bias–variance decomposition of squared loss (one paragraph — you will revisit this in Pass 2's double descent project).${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/2-decomposition.pdf"],
        rubric: "derivation",
        criteria: [
          "Contradiction argument picks ε < 1/8, δ < 1/7 and a realizable D from Thm 5.1 with m < |X|/2 (always possible as X is infinite)",
          "Decomposition written correctly; ε_app independent of S, ε_est random",
          "ε_est ≤ 2√(log(2|H|/δ)/(2m)) (or equivalent) derived from uniform convergence",
          "Nested-class discussion: ε_app non-increasing, estimation bound increasing in |H_k|",
        ],
      },
      {
        title: "Exercise 5.1 — The 1/7 lemma",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`File: ´written/3-ex_5_1.pdf´. Solve **SSBD Exercise 5.1**: prove that Eq. (5.2) suffices for showing that $\Pr[L_{\mathcal{D}}(A(S)) \ge 1/8] \ge 1/7$. That is, show: if $\theta$ is a random variable taking values in $[0,1]$ with $\mathbb{E}[\theta] \ge 1/4$, then $\Pr[\theta \ge 1/8] \ge 1/7$ (use the reverse-Markov lemma, SSBD Lemma B.1).${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/3-ex_5_1.pdf"],
        rubric: "proof",
        criteria: [
          "Splits E[θ] ≤ (1/8)·P(θ < 1/8) + 1·P(θ ≥ 1/8) (or applies Lemma B.1 with a = 7/8)",
          "Solves to get P(θ ≥ 1/8) ≥ (1/4 − 1/8)/(7/8) = 1/7",
        ],
      },
      {
        title: "Exercise 5.2 — Choosing a hypothesis class",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`File: ´written/4-ex_5_2.pdf´. Solve **SSBD Exercise 5.2** (designing a predictor of heart attacks from a set of patient attributes, choosing between two hypothesis classes / feature sets). Your answer must be framed explicitly in terms of $\varepsilon_{\text{app}}$, $\varepsilon_{\text{est}}$ and the sample size, and say concretely which choice you would make for a small vs a large number of patients.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/4-ex_5_2.pdf"],
        rubric: "report",
        criteria: [
          "Identifies which option has lower approximation error and which has lower estimation error",
          "Uses a quantitative bound (e.g. log|H| or VC-type) to compare estimation errors",
          "Gives a decision that depends on m, with a justification",
        ],
      },
      {
        title: "Exercise 5.3 — Sharper NFL constant",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`File: ´written/5-ex_5_3.pdf´. Solve **SSBD Exercise 5.3**: prove that if $|\mathcal{X}| \ge km$ for a positive integer $k \ge 2$, then the lower bound of $1/4$ in the NFL proof can be replaced by
$$\frac{k-1}{2k} = \frac12 - \frac{1}{2k}.$$
Identify exactly which line of your T05 NFL proof changes.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/5-ex_5_3.pdf"],
        rubric: "proof",
        criteria: [
          "Uses |C| = km so at least (k − 1)m points are unseen",
          "Replaces the factor p/(2m) ≥ 1/2 by p/(km) ≥ (k−1)/k, giving (k−1)/(2k)",
          "Points to the single changed line of the original proof",
        ],
      },
      sheet(6, [
        "Theorem 5.1 (NFL) with all constants and the condition m < |X|/2",
        "Corollary 5.2",
        "Error decomposition ε_app + ε_est and the bias–complexity tradeoff",
        "Ex. 5.1 lemma and Ex. 5.3 sharper constant",
      ]),
      {
        title: "No-Free-Lunch by exhaustive enumeration",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File: ´100-no_free_lunch.py´. NumPy + ´itertools´ only.

Fix $C = \{0,1,\dots,2m-1\}$, $\mathcal{D}_f$ uniform over $\{(x, f(x)) : x\in C\}$, and the **memorising** learner $A$: on a training sequence it predicts the observed label on seen points and $0$ elsewhere.

~~~python
def expected_risk(m, f):
    """f: tuple/array of length 2m with entries in {0,1}. Return E_{S ~ D_f^m}[L_{D_f}(A(S))]
    computed EXACTLY by enumerating all (2m)^m training sequences (each has probability (2m)^-m)."""

def nfl_exact(m):
    """Enumerate all 2^(2m) labellings f of C. Return (average, worst) where
    average = mean_f expected_risk(m, f) and worst = max_f expected_risk(m, f)."""
~~~

Example:
~~~python
>>> n = __import__('100-no_free_lunch')
>>> n.nfl_exact(1)
(0.25, 0.5)
~~~

Checker: compares with closed forms computed independently and verifies the NFL guarantee ´worst >= 1/4´ for $m = 1, 2, 3$. In your README, derive the closed form of ´expected_risk´ as a function of the number of ones in $f$.`,
        files: ["100-no_free_lunch.py"],
        checks: [
          { type: "exists", path: "100-no_free_lunch.py" },
          { type: "defines", path: "100-no_free_lunch.py", names: ["expected_risk", "nfl_exact"] },
          {
            type: "py_test",
            files: ["100-no_free_lunch.py"],
            label: "exact NFL risks for m = 1, 2, 3",
            code: py`import numpy as np
from importlib import import_module
n = import_module('100-no_free_lunch')
for m in (1, 2, 3):
    q = (1 - 1/(2*m))**m
    f = tuple([1]*m + [0]*m)
    assert np.isclose(float(n.expected_risk(m, f)), (m/(2*m))*q)
    assert np.isclose(float(n.expected_risk(m, tuple([0]*(2*m)))), 0.0)
    avg, worst = n.nfl_exact(m)
    assert np.isclose(float(avg), 0.5*q), (m, avg)
    assert np.isclose(float(worst), q), (m, worst)
    assert float(worst) >= 0.25
assert np.isclose(float(n.expected_risk(2, (1, 0, 1, 1))), 0.75*(0.75**2))
print("ok")`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── T06
  {
    id: "T06",
    track: "theory",
    phase: PHASE,
    title: "VC Dimension & the Sauer–Shelah Lemma",
    days: 6,
    repo: REPO,
    dir: "0x05-vc_dimension",
    sources: [
      { course: "BD", lectures: "Lec 7–8", topics: "Infinite classes can be learnable, restrictions, shattering, VC dimension, growth function, Sauer's lemma" },
    ],
    resources: [
      { title: "SSBD Ch. 6 (The VC-Dimension), §6.1–6.5", url: SSBD.url },
      { title: "Vapnik–Chervonenkis dimension (overview)", url: "https://en.wikipedia.org/wiki/Vapnik%E2%80%93Chervonenkis_dimension" },
      { title: "Sauer–Shelah lemma (overview)", url: "https://en.wikipedia.org/wiki/Sauer%E2%80%93Shelah_lemma" },
      { title: "Blumer, Ehrenfeucht, Haussler & Warmuth (1989) — Learnability and the Vapnik–Chervonenkis dimension", url: "https://doi.org/10.1145/76359.76371" },
    ],
    concepts: ["Restriction H_C", "Shattering", "VC dimension", "Growth function τ_H(m)", "Sauer–Shelah lemma", "Polynomial vs exponential growth"],
    objectives: [
      "Define shattering and the VC dimension; explain the two halves of a VC proof (≥ d and < d+1)",
      "Compute the VC dimension of thresholds, intervals, axis-aligned rectangles and finite classes",
      "Prove the Sauer–Shelah lemma via the 'shattered subsets' induction",
      "Bound Σ_{i≤d} C(m,i) ≤ (em/d)^d for m ≥ d",
      "Explain why polynomial growth of τ_H is what makes infinite classes learnable",
    ],
    requirements: ["Every 'VCdim = d' claim needs both a shattered set of size d and an argument that NO set of size d+1 is shattered"],
    quiz: [
      { q: "VCdim of intervals {1[a ≤ x ≤ b]} on ℝ is …", options: ["1", "2", "3", "∞"], answer: 1, why: "Two points are shattered; for x₁<x₂<x₃ the labelling (1,0,1) is impossible." },
      { q: "To prove VCdim(H) ≥ d you must show …", options: ["Every set of size d is shattered", "Some set of size d is shattered", "No set of size d+1 is shattered", "τ_H(d) < 2^d"], answer: 1, why: "Lower bound: exhibit one shattered set. Upper bound: show no set of size d+1 is shattered." },
      { q: "Sauer's lemma: if VCdim(H) ≤ d < ∞ then τ_H(m) ≤ …", options: ["2^m", "Σ_{i=0}^d C(m,i)", "m^{d+1}/d!", "d·m"], answer: 1, why: "And Σ_{i≤d} C(m,i) ≤ (em/d)^d for m ≥ d." },
      { q: "VCdim of axis-aligned rectangles in ℝ² is …", options: ["2", "3", "4", "5"], answer: 2, why: "4 points in a 'diamond' are shattered; among 5 points the one not extreme in any coordinate can't be excluded." },
    ],
    tasks: [
      readme("0x05-vc_dimension"),
      {
        title: "VC dimension of classic classes",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`File: ´written/1-classic_vc.pdf´. Compute and **prove** (both directions) the VC dimension of:

1. Thresholds $\mathcal{H} = \{x\mapsto \mathbb{1}[x < a] : a\in\mathbb{R}\}$.
2. Intervals $\mathcal{H} = \{x\mapsto\mathbb{1}[a \le x \le b] : a\le b\}$.
3. Axis-aligned rectangles in $\mathbb{R}^2$.
4. Any finite class: prove $\mathrm{VCdim}(\mathcal{H}) \le \lfloor\log_2|\mathcal{H}|\rfloor$ and give a class where the gap is arbitrarily large.
5. Closed balls in $\mathbb{R}^2$ $\{x\mapsto\mathbb{1}[\|x-c\|\le r]\}$ — show the VC dimension is at least 3 and argue it is exactly 3 (you may use the fact that two distinct circles meet in at most two points).

For each, compute the growth function $\tau_{\mathcal{H}}(m)$ exactly for items 1–2.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/1-classic_vc.pdf"],
        rubric: "proof",
        criteria: [
          "Each case has an explicit shattered set AND an argument that no set of size d+1 is shattered",
          "Rectangles upper bound: among 5 points, the point not attaining any of the 4 extremes cannot be excluded",
          "Finite class: 2^d ≤ |H| since shattering needs 2^d distinct restrictions; large-gap example given",
          "Growth functions τ(m) = m+1 (thresholds) and m(m+1)/2 + 1 (intervals) derived",
          "Balls: explicit shattered triangle and a convincing upper-bound argument",
        ],
      },
      {
        title: "The Sauer–Shelah lemma",
        type: "mandatory",
        kind: "written",
        points: 4,
        body: md`File: ´written/2-sauer_shelah.pdf´. Prove from memory:

**Lemma 6.10 (Sauer–Shelah–Perles).** Let $\mathcal{H}$ have $\mathrm{VCdim}(\mathcal{H}) \le d < \infty$. Then for all $m$:
$$\tau_{\mathcal{H}}(m) \le \sum_{i=0}^{d}\binom{m}{i}.$$
In particular, if $m > d+1$ then $\tau_{\mathcal{H}}(m) \le (em/d)^d$.

Proof structure required:
1. Prove the stronger claim: for every finite $C$, $|\mathcal{H}_C| \le |\{B\subseteq C : \mathcal{H}\text{ shatters } B\}|$.
2. Induction on $|C|$: write $C = \{c_1,\dots,c_m\}$, $C' = \{c_2,\dots,c_m\}$; define $Y_0 = \{(y_2,\dots,y_m) : (0,y_2,\dots)\in\mathcal{H}_C \lor (1,y_2,\dots)\in\mathcal{H}_C\}$ and $Y_1 = \{(y_2,\dots,y_m) : (0,y_2,\dots)\in\mathcal{H}_C \land (1,y_2,\dots)\in\mathcal{H}_C\}$; show $|\mathcal{H}_C| = |Y_0| + |Y_1|$.
3. Bound $|Y_0|$ by induction directly and $|Y_1|$ via the auxiliary class $\mathcal{H}'$ of pairs that agree on $C'$ and differ on $c_1$; show $\mathcal{H}'$ shatters $B \subseteq C'$ $\Rightarrow$ $\mathcal{H}$ shatters $B\cup\{c_1\}$.
4. Deduce the binomial bound, then prove $\sum_{i\le d}\binom{m}{i} \le (em/d)^d$ for $m \ge d$ (multiply by $(d/m)^d$ and use the binomial theorem).${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/2-sauer_shelah.pdf"],
        rubric: "proof",
        criteria: [
          "Stronger claim stated and the base case |C| = 1 checked",
          "|H_C| = |Y_0| + |Y_1| justified (each y' counted once in Y_0, twice-occurring ones once more in Y_1)",
          "|Y_0| = |H_{C'}| ≤ #{B ⊆ C' shattered} = #{B ⊆ C shattered, c_1 ∉ B}",
          "H' shatters B ⇒ H shatters B ∪ {c_1}; so |Y_1| ≤ #{B ⊆ C shattered, c_1 ∈ B}",
          "Shattered sets have size ≤ d, giving Σ_{i≤d} C(m,i); (d/m)^d Σ C(m,i) ≤ Σ C(m,i)(d/m)^i ≤ (1 + d/m)^m ≤ e^d",
        ],
      },
      {
        title: "Exercises 6.1–6.2",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/3-ex_6_1-6_2.pdf´.

- **SSBD Exercise 6.1** — monotonicity: if $\mathcal{H}' \subseteq \mathcal{H}$ then $\mathrm{VCdim}(\mathcal{H}') \le \mathrm{VCdim}(\mathcal{H})$.
- **SSBD Exercise 6.2** — for a finite domain $\mathcal{X}$ and a number $k \le |\mathcal{X}|$, compute the VC dimension of each class in the exercise (functions assigning 1 to exactly $k$ elements; to at most $k$ elements; and any further part in your copy). Handle the cases $k \le |\mathcal{X}|/2$ and $k > |\mathcal{X}|/2$ separately where the answer differs.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/3-ex_6_1-6_2.pdf"],
        rubric: "proof",
        criteria: [
          "6.1: any set shattered by H' is shattered by H",
          "6.2 'at most k': VCdim = k with matching lower and upper bounds",
          "6.2 'exactly k': VCdim = min(k, |X| − k) with both directions proved",
        ],
      },
      {
        title: "Exercise 6.3 — Parity functions",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`File: ´written/4-ex_6_3.pdf´. Solve **SSBD Exercise 6.3**: for $\mathcal{X} = \{0,1\}^n$ and $J\subseteq[n]$ let $h_J(x) = \big(\sum_{i\in J} x_i\big) \bmod 2$. Compute the VC dimension of $\mathcal{H}_{\text{n-parity}} = \{h_J : J\subseteq[n]\}$ (prove both directions; for the upper bound use $|\mathcal{H}|$, for the lower bound exhibit a shattered set and the $J$ realising each labelling).${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/4-ex_6_3.pdf"],
        rubric: "proof",
        criteria: [
          "Upper bound VCdim ≤ log₂(2ⁿ) = n via the finite-class bound",
          "Standard basis vectors e_1..e_n shattered: labelling b realised by J = {i : b_i = 1}",
        ],
      },
      {
        title: "Exercises 6.4–6.5 — Tightness of Sauer and boxes in ℝᵈ",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/5-ex_6_4-6_5.pdf´.

- **SSBD Exercise 6.4** — we proved $|\mathcal{H}_A| \le |\{B\subseteq A : \mathcal{H}\text{ shatters }B\}| \le \sum_{i=0}^{d}\binom{|A|}{i}$. Show there are cases where both inequalities are strict, and cases where both are equalities (give explicit $\mathcal{H}$, $A$).
- **SSBD Exercise 6.5** — prove that the VC dimension of axis-aligned rectangles (boxes) in $\mathbb{R}^d$ is $2d$.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/5-ex_6_4-6_5.pdf"],
        rubric: "proof",
        criteria: [
          "Explicit examples for strict and for equal cases, with the counts computed",
          "Boxes lower bound: the 2d points ±e_i shattered",
          "Boxes upper bound: among 2d+1 points one is not extreme in any coordinate direction and cannot be excluded",
        ],
      },
      sheet(6, [
        "Restriction, shattering, VC dimension, growth function",
        "VCdim of thresholds, intervals, rectangles, boxes in ℝᵈ, parities, finite classes",
        "Sauer–Shelah lemma and the (em/d)^d bound",
        "Ex. 6.4: when Sauer is tight",
      ]),
      {
        title: "Shattering checker",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File: ´100-shattering.py´. NumPy + ´itertools´ + ´math´ only.

A class restricted to $n$ points is given by a prediction matrix ´H_preds´ of shape ´(k, n)´ with entries in $\{0,1\}$ (rows may repeat).

~~~python
def is_shattered(H_preds):
    """True iff all 2**n labellings of the n points (columns) appear among the rows."""

def vc_dimension(H_preds):
    """Largest d such that SOME subset of d columns is shattered (0 if only the empty set)."""

def sauer_bound(d, m):
    """Return sum_{i=0}^{d} C(m, i) as an int (C(m, i) = 0 for i > m)."""
~~~

Example:
~~~python
>>> s = __import__('100-shattering')
>>> import numpy as np
>>> x = np.arange(5)
>>> ints = np.array([[int(a <= t <= b) for t in x] for a in range(5) for b in range(a, 5)] + [[0]*5])
>>> s.vc_dimension(ints)
2
~~~

Checker: thresholds (VC 1), intervals (VC 2), all functions on 4 points (VC 4), random classes against a brute-force reference, and Sauer's inequality $|\mathcal{H}_C| \le$ ´sauer_bound(vc, n)´.`,
        files: ["100-shattering.py"],
        checks: [
          { type: "exists", path: "100-shattering.py" },
          { type: "defines", path: "100-shattering.py", names: ["is_shattered", "vc_dimension", "sauer_bound"] },
          {
            type: "py_test",
            files: ["100-shattering.py"],
            label: "VC dimensions of known classes + Sauer",
            code: py`import numpy as np, itertools, math
from importlib import import_module
s = import_module('100-shattering')
x = np.arange(6)
thr = np.array([[int(t < a) for t in x] for a in range(7)])
ints = np.array([[int(a <= t <= b) for t in x] for a in range(6) for b in range(a, 6)] + [[0]*6])
allf = np.array(list(itertools.product([0, 1], repeat=4)))
assert int(s.vc_dimension(thr)) == 1
assert int(s.vc_dimension(ints)) == 2
assert int(s.vc_dimension(allf)) == 4
assert bool(s.is_shattered(allf)) and not bool(s.is_shattered(thr))
assert bool(s.is_shattered(np.array([[0, 1], [1, 0], [0, 0], [1, 1], [1, 1]])))
def ref_vc(H):
    n = H.shape[1]; best = 0
    for d in range(1, n+1):
        if any(len({tuple(r) for r in H[:, list(c)]}) == 2**d for c in itertools.combinations(range(n), d)):
            best = d
    return best
rng = np.random.default_rng(0)
for _ in range(30):
    H = rng.integers(0, 2, size=(int(rng.integers(1, 20)), 6))
    d = ref_vc(H)
    assert int(s.vc_dimension(H)) == d
    assert len({tuple(r) for r in H}) <= int(s.sauer_bound(d, 6))
assert int(s.sauer_bound(2, 10)) == 1 + 10 + 45
assert int(s.sauer_bound(5, 3)) == 8
assert all(int(s.sauer_bound(d, m)) == sum(math.comb(m, i) for i in range(d+1)) for d in range(5) for m in range(9))
print("ok")`,
          },
        ],
      },
      {
        title: "Stretch: a one-parameter class of infinite VC dimension",
        type: "advanced",
        kind: "written",
        points: 1,
        body: md`File: ´written/101-sine_vc.pdf´.

Prove that $\mathcal{H} = \{x\mapsto\lceil \sin(\theta x)\rceil : \theta\in\mathbb{R}\}$ over $\mathcal{X} = \mathbb{R}$ has infinite VC dimension (SSBD mentions this example in §6.5's remarks). Hint: use the points $x_i = 2^{-i}$ (or $10^{-i}$), encode the labelling in the binary expansion of $\theta/\pi$. Then explain in one paragraph why "number of parameters" is not the right measure of complexity.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/101-sine_vc.pdf"],
        rubric: "proof",
        criteria: [
          "Explicit choice of θ for an arbitrary labelling of x_1..x_d, with the binary-expansion argument made rigorous",
          "Shows sin(θ x_i) has the right sign for every i (handles the fractional-part computation)",
          "Parameter-count discussion contrasts with halfspaces (d+1 parameters, VC d+1)",
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── T07
  {
    id: "T07",
    track: "theory",
    phase: PHASE,
    title: "The Fundamental Theorem of Statistical Learning",
    days: 8,
    repo: REPO,
    dir: "0x06-fundamental_theorem",
    sources: [
      { course: "BD", lectures: "Lec 9", topics: "Fundamental theorem: finite VC ⇔ uniform convergence ⇔ PAC learnable; growth-function uniform convergence" },
    ],
    resources: [
      { title: "SSBD Ch. 6 §6.4–6.5 (Fundamental Theorem, proof of Thm 6.7)", url: SSBD.url },
      { title: "SSBD Ch. 28 (Proof of the Fundamental Theorem of Learning Theory)", url: SSBD.url },
      { title: "Blumer, Ehrenfeucht, Haussler & Warmuth (1989) — Learnability and the VC dimension", url: "https://doi.org/10.1145/76359.76371" },
      MOHRI,
    ],
    concepts: ["Fundamental theorem (qualitative, Thm 6.7)", "Quantitative version (Thm 6.8)", "Uniform convergence via growth function (Thm 6.11)", "Symmetrisation / ghost sample", "Rademacher signs swap argument", "Lower bounds via NFL", "ε-nets (realizable rate)"],
    objectives: [
      "State all six equivalent conditions of Theorem 6.7 and the implication graph used to prove them",
      "Prove Theorem 6.11 (UC from the growth function) including the ghost-sample symmetrisation",
      "Prove that infinite VC dimension implies non-learnability via NFL",
      "State Theorem 6.8 with the correct rates: d/ε² agnostic, d log(1/ε)/ε realizable (upper), d/ε lower",
      "Rewrite the whole proof from memory in under 3 hours",
      "Explain why the theorem fails beyond binary classification with 0-1 loss",
    ],
    requirements: [
      "This is the single most important theorem of Pass 1: budget ≈ 40 h; do not move on until the closed-book rewrite passes review",
      "The closed-book task must be done without notes, book or internet — be honest, the point is retrieval practice",
    ],
    quiz: [
      { q: "Which implication of the fundamental theorem uses the No-Free-Lunch theorem?", options: ["UC ⇒ ERM succeeds", "PAC learnable ⇒ finite VC", "Finite VC ⇒ UC", "Agnostic PAC ⇒ PAC"], answer: 1, why: "If VCdim = ∞, any size-2m shattered set gives a hard distribution, so H is not PAC learnable." },
      { q: "The quantitative agnostic sample complexity is Θ(…)", options: ["(d + log(1/δ))/ε", "(d + log(1/δ))/ε²", "d log(1/ε)/ε²", "2^d/ε²"], answer: 1, why: "Thm 6.8: C₁(d + log(1/δ))/ε² ≤ m ≤ C₂(d + log(1/δ))/ε²." },
      { q: "In the proof of Thm 6.11, why does the growth function τ_H(2m) appear?", options: ["Because |H| ≤ τ_H(2m)", "Because after symmetrisation only the restriction of H to the 2m points of S ∪ S' matters", "Because of Sauer's lemma with m points", "Because of the union bound over m hypotheses"], answer: 1, why: "Conditioned on the double sample C, the sup is over H_C, which has at most τ_H(2m) elements." },
      { q: "Thm 6.11's bound has δ in the denominator (not log(1/δ)) because …", options: ["Hoeffding is applied twice", "The expectation bound is converted to a probability bound by Markov", "Of the union bound", "Of Sauer's lemma"], answer: 1, why: "SSBD bounds E[sup|L_D − L_S|] and then uses Markov; Ch. 28 gives the log(1/δ) version." },
      { q: "The fundamental theorem's equivalences hold for …", options: ["Any loss and any label space", "Binary classification with 0-1 loss", "Regression with squared loss", "Multiclass with any number of labels"], answer: 1, why: "SSBD stresses it is for binary classification; it fails e.g. for general learning problems (Ch. 13 remarks)." },
    ],
    tasks: [
      readme("0x06-fundamental_theorem", "\n\nAlso include a dependency graph (ASCII or image) of every lemma you use in this project and where it was proved (T02–T06)."),
      {
        title: "Theorem 6.7 — the equivalences",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`File: ´written/1-thm_6_7.pdf´.

**Theorem 6.7 (Fundamental Theorem of Statistical Learning).** Let $\mathcal{H}$ be a class of functions $\mathcal{X}\to\{0,1\}$ and the loss be 0-1. The following are equivalent:
1. $\mathcal{H}$ has the uniform convergence property.
2. Any ERM rule is a successful agnostic PAC learner for $\mathcal{H}$.
3. $\mathcal{H}$ is agnostic PAC learnable.
4. $\mathcal{H}$ is PAC learnable.
5. Any ERM rule is a successful PAC learner for $\mathcal{H}$.
6. $\mathcal{H}$ has finite VC dimension.

Write the full proof as a chain $1\Rightarrow2\Rightarrow3\Rightarrow4$, $2\Rightarrow5\Rightarrow4$, $4\Rightarrow6$, $6\Rightarrow1$. For each implication, either prove it or cite the precise result you proved in earlier projects (T03/T04/T05) **and restate it**. The two non-trivial implications ($4\Rightarrow6$ and $6\Rightarrow1$) get their own tasks below — here, state exactly which lemmas they need and why the chain closes. Finally, answer: which of the six conditions would you check first for a new class, and why?${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/1-thm_6_7.pdf"],
        rubric: "proof",
        criteria: [
          "All six conditions stated precisely (agnostic vs realizable, 'any ERM' vs 'some learner')",
          "1 ⇒ 2 via Cor 4.4 / Lemma 4.2 restated; 2 ⇒ 3, 3 ⇒ 4, 2 ⇒ 5, 5 ⇒ 4 justified (realizable is a special case)",
          "4 ⇒ 6 and 6 ⇒ 1 identified as the deep steps with their ingredients (NFL; Sauer + Thm 6.11)",
          "The implication graph is strongly connected — every statement reaches every other",
        ],
      },
      {
        title: "Infinite VC dimension ⇒ not PAC learnable",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/2-infinite_vc.pdf´.

**Theorem.** If $\mathrm{VCdim}(\mathcal{H}) = \infty$ then $\mathcal{H}$ is not PAC learnable.

Prove it carefully from Theorem 5.1: for any learner $A$ and any $m$, take a set $C$ of size $2m$ shattered by $\mathcal{H}$, apply the NFL construction **with $\mathcal{X}$ replaced by $C$**, and verify that the distribution produced is realizable **by $\mathcal{H}$** (not just by some $f$). Also prove the quantitative version: if $\mathrm{VCdim}(\mathcal{H}) \ge 2m$ then no learner achieves $(\varepsilon,\delta) = (1/8, 1/7)$ with $m$ samples.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/2-infinite_vc.pdf"],
        rubric: "proof",
        criteria: [
          "Uses a shattered set C with |C| = 2m and runs NFL on distributions supported on C",
          "Argues realizability by H: since C is shattered, every f_i on C equals some h ∈ H on C",
          "Correct quantifier handling: for every A and every m there is a bad D",
        ],
      },
      {
        title: "Theorem 6.11 — uniform convergence from the growth function",
        type: "mandatory",
        kind: "written",
        points: 5,
        body: md`File: ´written/3-thm_6_11.pdf´. This is the technical heart of Pass 1.

**Theorem 6.11.** Let $\mathcal{H}$ be a class and $\tau_{\mathcal{H}}$ its growth function. For every $\mathcal{D}$ and $\delta\in(0,1)$, with probability at least $1-\delta$ over $S\sim\mathcal{D}^m$, for all $h\in\mathcal{H}$:
$$|L_{\mathcal{D}}(h) - L_S(h)| \le \frac{4 + \sqrt{\log(\tau_{\mathcal{H}}(2m))}}{\delta\sqrt{2m}}.$$

Prove it following SSBD §6.5.2, in this order:
1. Reduce to bounding $\mathbb{E}_{S}\big[\sup_{h}|L_{\mathcal{D}}(h) - L_S(h)|\big]$ and apply Markov at the end.
2. **Ghost sample:** write $L_{\mathcal{D}}(h) = \mathbb{E}_{S'}[L_{S'}(h)]$ and use Jensen / $\sup\mathbb{E}\le\mathbb{E}\sup$ to get $\mathbb{E}_{S,S'}\big[\sup_h |L_{S'}(h) - L_S(h)|\big]$.
3. **Symmetrisation:** introduce i.i.d. Rademacher signs $\sigma_i$ and justify that swapping $z_i \leftrightarrow z'_i$ leaves the distribution unchanged.
4. **Condition on $C = S\cup S'$**: the sup becomes a max over $\mathcal{H}_C$, with $|\mathcal{H}_C|\le\tau_{\mathcal{H}}(2m)$.
5. Hoeffding for each fixed $h$ plus the expected-maximum lemma (SSBD Lemma A.4) to bound $\mathbb{E}_\sigma\max_{h\in\mathcal{H}_C}|\cdot|$ by $\frac{4+\sqrt{\log|\mathcal{H}_C|}}{\sqrt{2m}}$.
6. Combine with Sauer's lemma: show that for $\mathrm{VCdim}(\mathcal{H}) = d$ the UC sample complexity satisfies $m^{UC}_{\mathcal{H}}(\varepsilon,\delta) \le 4\frac{16d}{(\delta\varepsilon)^2}\log\!\big(\frac{16d}{(\delta\varepsilon)^2}\big) + \frac{16 d\log(2e/d)}{(\delta\varepsilon)^2}$ (or an equivalent explicit bound — derive yours, using SSBD Lemma A.1 for $x \ge 4a\log(2a) + 2b \Rightarrow x \ge a\log x + b$).

Also prove Lemma A.4 (expected max of sub-Gaussian-tailed variables) yourself.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/3-thm_6_11.pdf"],
        rubric: "proof",
        criteria: [
          "Ghost sample step: sup_h |E_{S'} L_{S'}(h) − L_S(h)| ≤ E_{S'} sup_h |L_{S'}(h) − L_S(h)| justified",
          "Symmetrisation: exchangeability of (z_i, z'_i) argued; Rademacher variables introduced correctly",
          "Conditioning on the 2m points; sup replaced by max over H_C with |H_C| ≤ τ_H(2m)",
          "Hoeffding on Σσ_i(ℓ(h,z'_i) − ℓ(h,z_i))/m for fixed h and C, plus the expected-max lemma (Lemma A.4) proved",
          "Markov converts the expectation bound into the δ-in-the-denominator statement",
          "Explicit m^UC in terms of d, ε, δ via Sauer's lemma and Lemma A.1",
        ],
      },
      {
        title: "Chapter 28 — agnostic upper bound with log(1/δ)",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`File: ´written/4-ch28_upper.pdf´.

**Theorem 6.8 (quantitative fundamental theorem, agnostic upper bound).** There is a constant $C$ such that if $\mathrm{VCdim}(\mathcal{H}) = d < \infty$ then
$$m_{\mathcal{H}}(\varepsilon,\delta) \le C\,\frac{d + \log(1/\delta)}{\varepsilon^2}.$$

Prove the upper bound following SSBD §28.1: the improved bound replaces Markov by a high-probability argument (the probability that the ghost-sample deviation exceeds $\varepsilon$, a union bound over $\mathcal{H}_C$ with Hoeffding conditioned on $C$, then Sauer). Track the constants — you may end with a slightly worse rate such as $\frac{d\log(d/\varepsilon) + \log(1/\delta)}{\varepsilon^2}$, but then explain precisely which extra tool (chaining, Pass 2 week 16) removes the log factor.

Then state Theorem 6.8 in full — all four bounds (agnostic/realizable × upper/lower) — and fill in this table in your file: for $d = 10$, $\varepsilon = 0.05$, $\delta = 0.01$, the order of magnitude of $m$ in each regime (constants set to 1).${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/4-ch28_upper.pdf"],
        rubric: "proof",
        criteria: [
          "Symmetrisation inequality P[sup|L_D − L_S| > ε] ≤ 2P[sup|L_{S'} − L_S| > ε/2] proved (needs m ≳ 1/ε² for Chebyshev on the ghost sample)",
          "Conditional on C, Hoeffding for the signed difference and union bound over τ_H(2m) restrictions",
          "Sauer's lemma plugged in and solved for m with log(1/δ) (not 1/δ)",
          "Full Thm 6.8 stated with all four rates; numeric table filled consistently",
        ],
      },
      {
        title: "The proof, from memory",
        type: "mandatory",
        kind: "written",
        points: 4,
        body: md`File: ´written/5-from_memory.pdf´ (handwritten scan strongly preferred).

At least **48 hours** after finishing the tasks above, with no notes, book, or internet, set a 3-hour timer and write:

1. The statement of Theorem 6.7 and the implication graph.
2. A complete proof of $6\Rightarrow1$: Sauer's lemma **and** Theorem 6.11 (symmetrisation included).
3. A complete proof of $4\Rightarrow6$ from NFL (including the NFL averaging argument itself, compressed).
4. The statement of Theorem 6.8 with all four rates.

Write the start and end time at the top. Afterwards (in a different colour or a separate page titled "Post-mortem"), open the book and list every gap, wrong constant and wrong quantifier. If the post-mortem lists a missing *idea* (not just a constant), redo the exercise 48 hours later and submit both attempts.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/5-from_memory.pdf"],
        rubric: "proof",
        criteria: [
          "Timed (≤ 3 h, start/end times stated) and visibly written without reference material",
          "Sauer's lemma proof complete (stronger claim + induction with Y_0/Y_1)",
          "Thm 6.11 proof contains ghost sample, symmetrisation with signs, conditioning on 2m points, union/expected-max over H_C",
          "NFL argument reproduced well enough to yield 4 ⇒ 6",
          "Honest post-mortem listing gaps; second attempt included if an idea was missing",
        ],
      },
      sheet(6, [
        "Theorem 6.7 with the implication graph",
        "Theorem 6.8 — all four rates",
        "Theorem 6.11 and its proof skeleton (6 steps)",
        "Lemma A.1 and Lemma A.4",
        "Why the theorem is specific to binary classification with 0-1 loss",
      ], ["Proof skeletons are in the right order and each step names its tool"]),
      {
        title: "Uniform convergence for thresholds, exactly",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File: ´100-uc_thresholds.py´. NumPy only.

Setting: $x\sim U[0,1]$, $y = \mathbb{1}[x\ge 1/2]$ flipped independently with probability $\eta < 1/2$. Class $h_a(x) = \mathbb{1}[x \ge a]$ for $a\in[0,1]$, so $L_{\mathcal{D}}(h_a) = \eta + (1-2\eta)|a - 1/2|$.

~~~python
def true_risk(a, eta):
    """eta + (1 - 2*eta) * |a - 1/2|; works elementwise on arrays."""

def sup_deviation(x, y, eta):
    """EXACT sup over a in [0, 1] of |L_S(h_a) - L_D(h_a)| (float) for the sample (x, y),
    x in (0,1) distinct, y in {0,1}. No grid search: L_S is piecewise constant between
    sorted sample points and L_D is piecewise linear, so check the right finite candidate set."""

def vc_uc_bound(m, d, delta):
    """Theorem 6.11 bound (4 + sqrt(log_tau)) / (delta * sqrt(2m)) with Sauer:
    log_tau = d * log(2 e m / d) if 2m > d + 1 else 2m * log(2)."""
~~~

Example:
~~~python
>>> u = __import__('100-uc_thresholds')
>>> round(u.vc_uc_bound(1000, 1, 0.1), 4)
1.5502
~~~

In your README: plot the mean of ´sup_deviation´ against $m$ on log–log axes for $m\in\{10,\dots,10^4\}$, fit the slope, compare with $1/\sqrt{m}$ and with ´vc_uc_bound´ (how loose is it?).`,
        files: ["100-uc_thresholds.py"],
        checks: [
          { type: "exists", path: "100-uc_thresholds.py" },
          { type: "defines", path: "100-uc_thresholds.py", names: ["true_risk", "sup_deviation", "vc_uc_bound"] },
          {
            type: "py_test",
            files: ["100-uc_thresholds.py"],
            label: "exact supremum and Thm 6.11 bound",
            code: py`import numpy as np
from importlib import import_module
u = import_module('100-uc_thresholds')
def ref_sup(x, y, eta):
    o = np.argsort(x); xs = x[o]; ys = y[o]; m = len(x)
    ones = np.concatenate([[0], np.cumsum(ys == 1)])
    zeros = np.concatenate([np.cumsum((ys == 0)[::-1])[::-1], [0]])
    err = (ones + zeros) / m
    bp = np.concatenate([[0.0], xs, [1.0]])
    LD = lambda a: eta + (1 - 2*eta)*abs(a - 0.5)
    best = 0.0
    for i in range(m + 1):
        l, r = bp[i], bp[i+1]
        cands = [l, r] + ([0.5] if l <= 0.5 <= r else [])
        best = max(best, max(abs(err[i] - LD(a)) for a in cands))
    return best
rng = np.random.default_rng(0)
assert np.allclose(u.true_risk(np.array([0.0, 0.5, 0.8]), 0.1), [0.5, 0.1, 0.1 + 0.8*0.3])
for m, eta in [(5, 0.0), (20, 0.1), (100, 0.25), (37, 0.4)]:
    for _ in range(5):
        x = rng.uniform(0, 1, m)
        y = (x >= 0.5).astype(int)
        y = np.where(rng.uniform(size=m) < eta, 1 - y, y)
        got = float(u.sup_deviation(x, y, eta))
        ref = ref_sup(x, y, eta)
        assert abs(got - ref) < 1e-9, (m, eta, got, ref)
        grid = np.linspace(0, 1, 2001)
        LS = ((x[None, :] >= grid[:, None]).astype(int) != y).mean(axis=1)
        assert got >= np.abs(LS - u.true_risk(grid, eta)).max() - 1e-12
assert np.isclose(float(u.vc_uc_bound(1000, 1, 0.1)), (4 + np.sqrt(np.log(2*np.e*1000)))/(0.1*np.sqrt(2000)))
assert np.isclose(float(u.vc_uc_bound(2, 5, 0.5)), (4 + np.sqrt(4*np.log(2)))/(0.5*np.sqrt(4)))
print("ok")`,
          },
        ],
      },
      {
        title: "Stretch: lower bounds and the realizable rate (Ch. 28)",
        type: "advanced",
        kind: "written",
        points: 2,
        body: md`File: ´written/101-ch28_lower_realizable.pdf´.

1. **Agnostic lower bound** (SSBD §28.2): prove $m_{\mathcal{H}}(\varepsilon,\delta) \ge C_1\frac{d + \log(1/\delta)}{\varepsilon^2}$ — both the $\log(1/\delta)/\varepsilon^2$ part (two distributions on a single point with biases $1/2\pm\varepsilon$) and the $d/\varepsilon^2$ part (product over a shattered set).
2. **Realizable upper bound** (SSBD §28.3): prove $m_{\mathcal{H}}(\varepsilon,\delta) \le C_2\frac{d\log(1/\varepsilon) + \log(1/\delta)}{\varepsilon}$ via $\varepsilon$-nets: define an $\varepsilon$-net, prove the $\varepsilon$-net theorem with the double-sampling trick, and conclude that ERM succeeds.

Both proofs must be in your own words with all constants tracked (they need not match the book's).${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/101-ch28_lower_realizable.pdf"],
        rubric: "proof",
        criteria: [
          "Two-point lower bound uses a binomial/KL or Slud-type tail lower bound and gets log(1/δ)/ε²",
          "d/ε² part reduces to d independent biased-coin problems on a shattered set",
          "ε-net definition and theorem stated; double-sampling + permutation argument with Sauer gives the d log(1/ε)/ε rate",
          "Shows that any ERM output (consistent hypothesis) lies outside the 'bad' set when S is an ε-net for the error regions",
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── T08
  {
    id: "T08",
    track: "theory",
    phase: PHASE,
    title: "Nonuniform Learnability, SRM & MDL",
    days: 5,
    repo: REPO,
    dir: "0x07-srm_mdl",
    sources: [
      { course: "BD", lectures: "Lec 10", topics: "Nonuniform learnability, structural risk minimisation, MDL & Occam's razor, consistency" },
    ],
    resources: [
      { title: "SSBD Ch. 7 (Nonuniform Learnability)", url: SSBD.url },
      { title: "Structural risk minimization (overview)", url: "https://en.wikipedia.org/wiki/Structural_risk_minimization" },
      { title: "Minimum description length (overview)", url: "https://en.wikipedia.org/wiki/Minimum_description_length" },
      { title: "Kraft–McMillan inequality (overview)", url: "https://en.wikipedia.org/wiki/Kraft%E2%80%93McMillan_inequality" },
    ],
    concepts: ["Nonuniform learnability", "Structural Risk Minimisation", "Weight functions w(n) with Σ w(n) ≤ 1", "Minimum Description Length & Occam's razor", "Prefix-free languages & Kraft's inequality", "Consistency (universal consistency)", "Hierarchy: PAC ⊂ nonuniform ⊂ consistent"],
    objectives: [
      "Define nonuniform learnability and contrast its quantifiers with PAC learnability",
      "Prove that H is nonuniformly learnable iff it is a countable union of classes with finite VC dimension",
      "Prove the SRM bound L_D(h) ≤ L_S(h) + ε_{n(h)}(m, w(n(h))δ) and that SRM is a nonuniform learner",
      "Derive the MDL bound from Kraft's inequality",
      "Explain why consistency alone is too weak to be useful (Memorize is consistent on countable domains)",
    ],
    requirements: ["Keep track of whether m may depend on h (nonuniform) or on D (consistency) — state it at every theorem"],
    quiz: [
      { q: "In nonuniform learnability the sample complexity may depend on …", options: ["ε, δ only", "ε, δ and the competitor h", "ε, δ and D", "Nothing"], answer: 1, why: "m^NUL_H(ε, δ, h): uniform over D, but may depend on the hypothesis h we compete with." },
      { q: "SRM with weights w(n) = 6/(π²n²) is valid because …", options: ["Σ 1/n² = π²/6", "w(n) is decreasing", "Each H_n is finite", "The VC dimensions grow"], answer: 0, why: "The weights must sum to at most 1 for the union bound over classes." },
      { q: "The MDL bound penalises each hypothesis h by roughly …", options: ["√(VCdim/m)", "√((|d(h)| + ln(2/δ))/(2m))", "|d(h)|/m²", "log|H|/m"], answer: 1, why: "Weights w(h) = 2^{−|d(h)|} (valid by Kraft) in the weighted union bound." },
      { q: "The class of all functions on ℕ is …", options: ["PAC learnable", "Nonuniformly learnable but not PAC", "Not nonuniformly learnable", "Learnable with m independent of everything"], answer: 2, why: "Countable unions of finite-VC classes are not enough to cover it (SSBD §7.1 discussion / NFL). Memorize is still consistent." },
    ],
    tasks: [
      readme("0x07-srm_mdl"),
      {
        title: "Characterising nonuniform learnability",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`File: ´written/1-nonuniform.pdf´.

**Definition 7.1.** $\mathcal{H}$ is nonuniformly learnable if there exist $A$ and $m^{NUL}_{\mathcal{H}}:(0,1)^2\times\mathcal{H}\to\mathbb{N}$ such that for every $\varepsilon,\delta$, every $h\in\mathcal{H}$, every $m\ge m^{NUL}_{\mathcal{H}}(\varepsilon,\delta,h)$ and every $\mathcal{D}$: with probability $\ge 1-\delta$, $L_{\mathcal{D}}(A(S)) \le L_{\mathcal{D}}(h) + \varepsilon$.

Prove:
- **Theorem 7.2.** A class of binary classifiers is nonuniformly learnable iff it is a countable union of agnostic PAC learnable classes.
- **Theorem 7.3.** Equivalently, iff it is a countable union of classes with finite VC dimension.

The "$\Rightarrow$" direction: define $\mathcal{H}_n = \{h : m^{NUL}_{\mathcal{H}}(1/8, 1/7, h) \le n\}$ and use the fundamental theorem. The "$\Leftarrow$" direction follows from the SRM task below — state it here and refer to it. Finally, give a class that is nonuniformly learnable but not PAC learnable (with proof).${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/1-nonuniform.pdf"],
        rubric: "proof",
        criteria: [
          "Definition stated with quantifiers ∀h ∃m ∀D (m independent of D)",
          "⇒: H_n defined via m^NUL(1/8, 1/7, h) ≤ n; argues each H_n has finite VC (else contradiction with NFL)",
          "⇐ obtained from SRM with weights; links Thm 7.2 and 7.3 via the fundamental theorem",
          "Example: polynomial threshold classifiers on ℝ (H = ∪ H_n, each VCdim n+1, union infinite VC) proved",
        ],
      },
      {
        title: "SRM is a nonuniform learner",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`File: ´written/2-srm.pdf´. The plan's "consistency of SRM".

Let $\mathcal{H} = \bigcup_{n\in\mathbb{N}}\mathcal{H}_n$, each $\mathcal{H}_n$ with uniform convergence function $m^{UC}_{\mathcal{H}_n}$; set $\varepsilon_n(m,\delta) = \min\{\varepsilon : m^{UC}_{\mathcal{H}_n}(\varepsilon,\delta)\le m\}$, and let $w:\mathbb{N}\to[0,1]$ with $\sum_n w(n)\le 1$.

**Theorem 7.4.** For every $\delta$ and $\mathcal{D}$, with probability $\ge 1-\delta$ over $S\sim\mathcal{D}^m$: $\forall n,\ \forall h\in\mathcal{H}_n$: $|L_{\mathcal{D}}(h) - L_S(h)| \le \varepsilon_n(m, w(n)\delta)$.

**SRM rule:** output $h\in\mathrm{argmin}_{h\in\mathcal{H}}\big[L_S(h) + \varepsilon_{n(h)}(m, w(n(h))\delta)\big]$ with $n(h) = \min\{n : h\in\mathcal{H}_n\}$.

**Theorem 7.5.** With $w(n) = \frac{6}{\pi^2 n^2}$, SRM is a nonuniform learner with
$$m^{NUL}_{\mathcal{H}}(\varepsilon,\delta,h) \le m^{UC}_{\mathcal{H}_{n(h)}}\Big(\frac{\varepsilon}{2}, \frac{6\delta}{(\pi n(h))^2}\Big).$$

Prove both theorems. Then (i) instantiate for finite classes $|\mathcal{H}_n|$ to get an explicit penalty; (ii) explain the price of nonuniformity — compare the sample size to compete with $h\in\mathcal{H}_n$ when you know $n$ in advance vs. when you use SRM; (iii) SSBD §7.4: define consistency, prove that Memorize is consistent on a countable domain, and explain why consistency is too weak a guarantee.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/2-srm.pdf"],
        rubric: "proof",
        criteria: [
          "Thm 7.4: UC for each H_n at confidence w(n)δ, union bound Σ w(n)δ ≤ δ",
          "Thm 7.5 chain: L_D(A(S)) ≤ L_S(A(S)) + ε_{n(A(S))} ≤ L_S(h) + ε_{n(h)}(m, w(n(h))δ) ≤ L_D(h) + 2ε_{n(h)}(…)",
          "Sample size requirement translated to ε_{n(h)}(m, w δ) ≤ ε/2",
          "Finite-class penalty √(log(2|H_n|/(w(n)δ))/(2m)) written; price of nonuniformity is the additive log(1/w(n)) = O(log n)",
          "Consistency defined (m may depend on D); Memorize consistent on countable X; discussion of why it's weak",
        ],
      },
      {
        title: "MDL and Occam's razor",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/3-mdl.pdf´.

1. Prove **Kraft's inequality**: if $S\subseteq\{0,1\}^*$ is prefix-free then $\sum_{\sigma\in S} 2^{-|\sigma|}\le 1$ (probabilistic proof: random infinite bit string).
2. **Theorem 7.7 (Occam bound).** Let $\mathcal{H}$ be countable, $d:\mathcal{H}\to\{0,1\}^*$ a prefix-free description language. For every $m,\delta$, $\mathcal{D}$, with probability $\ge 1-\delta$, for all $h\in\mathcal{H}$:
$$L_{\mathcal{D}}(h) \le L_S(h) + \sqrt{\frac{|h| + \ln(2/\delta)}{2m}},\qquad |h| := |d(h)|.$$
Prove it (weights $w(h) = 2^{-|h|}$ and singleton classes) and note where you can sharpen $|h|$ to $|h|\ln 2$.
3. Discuss (one page): is Occam's razor "true"? Address the dependence on the description language (fix the language *before* seeing the data), and connect MDL to SRM.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/3-mdl.pdf"],
        rubric: "proof",
        criteria: [
          "Kraft proof: events 'random string starts with σ' are disjoint for prefix-free S",
          "Weighted union bound with w(h) = 2^{−|h|} and Hoeffding for each singleton class",
          "Algebra: ln(2/(w(h)δ)) = |h| ln 2 + ln(2/δ) ≤ |h| + ln(2/δ)",
          "Discussion: language must be chosen independently of S; MDL = SRM with singleton classes",
        ],
      },
      {
        title: "Exercises 7.1–7.2",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/4-ex_7_1-7_2.pdf´.

- **SSBD Exercise 7.1** — for a finite class $\mathcal{H}$ and any description language $d:\mathcal{H}\to\{0,1\}^*$, bound the VC dimension of $\mathcal{H}$ in terms of $\sup_h |d(h)|$ (and the sharper bound when $d$ is prefix-free), as stated in the book.
- **SSBD Exercise 7.2** — for an infinite countable class $\mathcal{H} = \{h_n : n\in\mathbb{N}\}$, show that it is impossible to assign weights $w(h_n)$ with $\sum w \le 1$ that are monotonically non-decreasing in $n$ (and answer the remaining parts in your copy, e.g. which weightings are possible for a countable union of finite classes).${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/4-ex_7_1-7_2.pdf"],
        rubric: "proof",
        criteria: [
          "7.1: counts the number of strings of length ≤ k (2^{k+1} − 1) to bound |H|, then VCdim ≤ log₂|H|",
          "7.1 prefix-free sharpening uses Kraft (|H| ≤ 2^k when all descriptions have length ≤ k)",
          "7.2: a non-decreasing positive sequence has divergent sum (w(h_n) ≥ w(h_1) > 0 for all n), contradiction",
        ],
      },
      sheet(5, [
        "Definitions: PAC vs nonuniform vs consistent (quantifier order!)",
        "Theorems 7.2/7.3 characterisation",
        "Theorems 7.4/7.5 and the SRM rule",
        "Kraft's inequality and Theorem 7.7",
      ]),
      {
        title: "Structural Risk Minimisation in code",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File: ´100-srm.py´. NumPy + ´math´ only.

~~~python
def srm_select(emp_risks, sizes, m, delta):
    """Nested/countable union of FINITE classes H_1, H_2, ..., H_N.
    emp_risks[n-1] = min_{h in H_n} L_S(h); sizes[n-1] = |H_n|.
    Weights w(n) = 6 / (pi^2 n^2); penalty eps_n = sqrt(log(2 |H_n| / (w(n) delta)) / (2 m)).
    Return (n_star, bound): n_star (1-based int) minimises emp_risks[n-1] + eps_n
    (smallest n on ties), bound = that minimal value (float)."""

def mdl_bound(emp_risk, length_bits, m, delta):
    """Return emp_risk + sqrt((length_bits * ln 2 + ln(2/delta)) / (2 m))."""
~~~

Example:
~~~python
>>> s = __import__('100-srm')
>>> s.srm_select([0.30, 0.10, 0.09], [10, 1000, 10**6], 500, 0.05)[0]
2
~~~

In your README: simulate polynomial-threshold classes of degree $n$ on noisy 1-D data, compute ´emp_risks´ by brute-force ERM over a grid, and show how ´n_star´ changes with $m$.`,
        files: ["100-srm.py"],
        checks: [
          { type: "exists", path: "100-srm.py" },
          { type: "defines", path: "100-srm.py", names: ["srm_select", "mdl_bound"] },
          {
            type: "py_test",
            files: ["100-srm.py"],
            label: "SRM selection and MDL bound",
            code: py`import numpy as np
from importlib import import_module
s = import_module('100-srm')
def ref(er, sz, m, d):
    n = np.arange(1, len(er)+1)
    w = 6/(np.pi**2 * n**2)
    v = np.asarray(er) + np.sqrt(np.log(2*np.asarray(sz, float)/(w*d))/(2*m))
    i = int(np.argmin(v)); return i+1, float(v[i])
cases = [([0.30, 0.10, 0.09], [10, 1000, 10**6], 500, 0.05),
         ([0.30, 0.10, 0.09], [10, 1000, 10**6], 50, 0.05),
         ([0.4, 0.2, 0.05, 0.0], [2, 2**10, 2**20, 2**40], 10000, 0.01)]
for er, sz, m, d in cases:
    n_star, b = s.srm_select(er, sz, m, d)
    rn, rb = ref(er, sz, m, d)
    assert int(n_star) == rn and np.isclose(float(b), rb), (n_star, b, rn, rb)
assert int(s.srm_select([0.2, 0.2], [5, 5], 100, 0.1)[0]) == 1
assert np.isclose(float(s.mdl_bound(0.1, 20, 1000, 0.05)), 0.1 + np.sqrt((20*np.log(2) + np.log(40))/2000))
print("ok")`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── T09
  {
    id: "T09",
    track: "theory",
    phase: PHASE,
    title: "Computational Complexity of Learning",
    days: 4,
    repo: REPO,
    dir: "0x08-computational_complexity",
    sources: [
      { course: "BD", lectures: "Lec 11", topics: "Efficient PAC learning, ERM in poly time, hardness of proper learning, improper learning, cryptographic hardness" },
    ],
    resources: [
      { title: "SSBD Ch. 8 (The Runtime of Learning)", url: SSBD.url },
      { title: "Valiant (1984) — A Theory of the Learnable", url: "https://dl.acm.org/doi/10.1145/1968.1972" },
      { title: "Pitt & Valiant (1988) — Computational limitations on learning from examples", url: "https://doi.org/10.1145/48014.63140" },
      { title: "Kearns & Valiant (1994) — Cryptographic limitations on learning Boolean formulae and finite automata", url: "https://doi.org/10.1145/174644.174647" },
    ],
    concepts: ["Efficient PAC learning (poly in 1/ε, 1/δ, n, size)", "ERM for conjunctions (elimination algorithm)", "Axis-aligned rectangles in poly time", "Proper vs representation-independent learning", "3-term DNF via 3-CNF", "NP-hardness of proper learning", "Cryptographic hardness of improper learning"],
    objectives: [
      "Define efficient PAC learnability and the role of the representation size",
      "Prove that Boolean conjunctions are efficiently PAC learnable via the elimination algorithm",
      "Explain why properly learning 3-term DNF is hard but improperly learning it is easy",
      "Explain the cryptographic argument that some PAC-learnable classes are not efficiently learnable by any algorithm",
      "Explain why agnostic ERM for halfspaces is computationally hard",
    ],
    requirements: ["Runtime claims must specify the model (bit complexity vs arithmetic operations) and all parameters"],
    quiz: [
      { q: "The elimination algorithm for conjunctions starts from …", options: ["The empty conjunction", "All 2n literals, removing those violated by positive examples", "All 2n literals, removing those satisfied by negative examples", "A random conjunction"], answer: 1, why: "It keeps the most specific conjunction consistent with the positives." },
      { q: "Properly learning 3-term DNF is NP-hard, yet it is efficiently PAC learnable because …", options: ["Its VC dimension is infinite", "Every 3-term DNF is a 3-CNF, which is learnable by elimination over O(n³) meta-variables", "Boosting solves it", "DNF formulas are linearly separable"], answer: 1, why: "Representation-independent learning: output a 3-CNF instead of a 3-term DNF." },
      { q: "Cryptographic hardness results show that …", options: ["Some classes have infinite VC dimension", "Some classes with small VC dimension can't be learned efficiently even improperly (under crypto assumptions)", "ERM is always NP-hard", "PAC learnability implies efficient learnability"], answer: 1, why: "E.g. via one-way trapdoor permutations (SSBD §8.2.3)." },
    ],
    tasks: [
      readme("0x08-computational_complexity"),
      {
        title: "Efficiently learnable classes",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`File: ´written/1-efficient.pdf´.

1. State SSBD's definition of efficient (realizable) PAC learning: runtime $\mathrm{poly}(1/\varepsilon, 1/\delta, n)$ (and the size of the target's representation where relevant).
2. **Boolean conjunctions** over $\{0,1\}^n$: prove that the elimination algorithm (start with $x_1\land\bar x_1\land\cdots\land x_n\land\bar x_n$, delete every literal falsified by a positive example) is an ERM in the realizable case, runs in $O(nm)$, and that $|\mathcal{H}_{\text{conj}}| \le 3^n + 1$. Conclude efficient PAC learnability with an explicit $m(\varepsilon,\delta)$.
3. **Axis-aligned rectangles in $\mathbb{R}^n$**: realizable ERM in $O(nm)$; agnostic ERM by enumeration — give the runtime $O(n\,m^{O(n)})$ and explain why it is polynomial in $m$ for fixed $n$ but exponential in $n$.
4. Explain the difference between "ERM is efficient" and "the class is efficiently learnable".${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/1-efficient.pdf"],
        rubric: "proof",
        criteria: [
          "Efficient learnability defined with all parameters",
          "Elimination keeps every literal of the target (target is satisfied by all positives) ⇒ never errs on negatives; consistent on positives by construction",
          "|H| ≤ 3ⁿ + 1 and m ≥ (n log 3 + log(1/δ))/ε derived",
          "Rectangle agnostic ERM: enumerate boxes determined by ≤ 2n sample coordinates, giving m^{O(n)} candidates",
        ],
      },
      {
        title: "3-term DNF: hard properly, easy improperly",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/2-dnf.pdf´.

1. State the hardness result for properly learning 3-term DNF (Pitt–Valiant; SSBD §8.2.2): unless $RP = NP$, no poly-time proper learner exists. Sketch the reduction idea (graph 3-colourability) in half a page.
2. Prove: every 3-term DNF $T_1\lor T_2\lor T_3$ equals the 3-CNF $\bigwedge_{u\in T_1, v\in T_2, w\in T_3}(u\lor v\lor w)$.
3. Show 3-CNFs over $n$ variables are efficiently learnable: introduce one meta-variable per 3-clause ($(2n)^3$ of them), reduce to learning conjunctions, and give the sample complexity and runtime.
4. Explain why this is not a contradiction with part 1.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/2-dnf.pdf"],
        rubric: "derivation",
        criteria: [
          "Distributivity proof of the DNF ⇒ 3-CNF identity, both directions",
          "Meta-variable reduction with (2n)³ variables and the induced conjunction learner",
          "Sample complexity O((n³ + log(1/δ))/ε) and polynomial runtime stated",
          "Resolution: the learner outputs a 3-CNF, not a 3-term DNF (representation independence)",
        ],
      },
      {
        title: "Hardness beyond NP: cryptography and agnostic halfspaces",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/3-hardness.pdf´ (≈ 2 pages).

Explain, in your own words and with precise statements:
1. SSBD §8.2.3: how one-way trapdoor permutations yield a class (of small VC dimension) that is not efficiently learnable **even improperly**. Spell out what the learner would be able to compute if it succeeded.
2. Why agnostic ERM for halfspaces with 0-1 loss is NP-hard, and how this motivates convex surrogate losses (preview of T11/T13).
3. A table: class × {sample complexity, proper realizable ERM runtime, improper learnability} for conjunctions, 3-term DNF, halfspaces (realizable & agnostic), small Boolean circuits.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/3-hardness.pdf"],
        rubric: "summary",
        criteria: [
          "Trapdoor permutation definition stated; the learned hypothesis would invert the permutation on random inputs without the trapdoor",
          "Distinguishes statistical vs computational barriers clearly",
          "Agnostic halfspace hardness linked to the use of hinge/logistic surrogates",
          "Table entries are correct and consistent with the text",
        ],
      },
      {
        title: "Two Chapter 8 exercises",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/4-ch8_exercises.pdf´.

Solve **any two** end-of-chapter exercises of SSBD Chapter 8 (§8.5). Prefer exercises with a proof component (e.g. an efficient ERM or a hardness/reduction argument). These count towards the ≥ 30-exercise portfolio audited in T14.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/4-ch8_exercises.pdf"],
        rubric: "proof",
        criteria: [
          "Both statements copied verbatim with exercise numbers",
          "Each solution is complete, including runtime analysis where the exercise asks for an algorithm",
          "Every reduction states its direction (which problem reduces to which) correctly",
        ],
      },
      sheet(5, [
        "Efficient PAC learnability definition",
        "Conjunctions (elimination), rectangles (realizable/agnostic ERM runtime)",
        "3-term DNF: proper hardness vs 3-CNF improper learner",
        "Cryptographic hardness; agnostic halfspaces",
      ]),
      {
        title: "Elimination algorithm for conjunctions",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File: ´100-conjunctions.py´. NumPy only, vectorised over samples.

A conjunction over $n$ variables is represented by a boolean array ´L´ of shape ´(2, n)´: ´L[0, j]´ = literal $x_j$ is included, ´L[1, j]´ = literal $\bar x_j$ is included.

~~~python
def learn_conjunction(X, y):
    """X: (m, n) in {0,1}, y: (m,) in {0,1}. Elimination algorithm: start with all 2n literals,
    remove every literal falsified by some POSITIVE example. Return L (bool, shape (2, n))."""

def predict_conjunction(L, X):
    """Return int array (m,): 1 iff every included literal is satisfied by the row."""
~~~

Example:
~~~python
>>> c = __import__('100-conjunctions')
>>> import numpy as np
>>> X = np.array([[1, 0, 1], [1, 1, 1], [0, 1, 0]]); y = np.array([1, 1, 0])
>>> c.learn_conjunction(X, y).astype(int)
array([[1, 0, 1],
       [0, 0, 0]])
~~~

In your README, plot test error vs $m$ for $n = 30$ and a random target with 5 literals, and overlay the bound from your written task.`,
        files: ["100-conjunctions.py"],
        checks: [
          { type: "exists", path: "100-conjunctions.py" },
          { type: "defines", path: "100-conjunctions.py", names: ["learn_conjunction", "predict_conjunction"] },
          {
            type: "py_test",
            files: ["100-conjunctions.py"],
            label: "elimination is the most specific consistent conjunction",
            code: py`import numpy as np
from importlib import import_module
c = import_module('100-conjunctions')
rng = np.random.default_rng(0)
n = 12
T = np.zeros((2, n), bool); T[0, [1, 4]] = True; T[1, [7]] = True
def pred(L, X):
    return (np.all(X[:, L[0]] == 1, axis=1) & np.all(X[:, L[1]] == 0, axis=1)).astype(int)
X = rng.integers(0, 2, size=(400, n))
X[:150, [1, 4]] = 1; X[:150, 7] = 0
y = pred(T, X)
L = np.asarray(c.learn_conjunction(X, y)).astype(bool)
P = X[y == 1]
ref = np.vstack([np.all(P == 1, axis=0), np.all(P == 0, axis=0)])
assert L.shape == (2, n) and (L == ref).all()
assert (L[T]).all(), "target literals must survive"
assert (np.asarray(c.predict_conjunction(L, X)) == y).all()
Xt = rng.integers(0, 2, size=(2000, n))
assert (np.asarray(c.predict_conjunction(L, Xt)) == pred(L, Xt)).all()
Lall = np.asarray(c.learn_conjunction(X[y == 0][:5], np.zeros(5, int))).astype(bool)
assert Lall.all() and (np.asarray(c.predict_conjunction(Lall, Xt)) == 0).all()
print("ok")`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── T10
  {
    id: "T10",
    track: "theory",
    phase: PHASE,
    title: "Linear Predictors & Boosting",
    days: 6,
    repo: REPO,
    dir: "0x09-linear_boosting",
    sources: [
      { course: "BD", lectures: "Lec 12–13", topics: "Halfspaces, LP for ERM, Perceptron, VC of halfspaces, linear regression; weak learnability, AdaBoost" },
    ],
    resources: [
      { title: "SSBD Ch. 9 (Linear Predictors) & Ch. 10 (Boosting)", url: SSBD.url },
      { title: "Freund & Schapire (1997) — A decision-theoretic generalization of on-line learning and an application to boosting", url: "https://doi.org/10.1006/jcss.1997.1504" },
      { title: "Perceptron (overview)", url: "https://en.wikipedia.org/wiki/Perceptron" },
      { title: "AdaBoost (overview)", url: "https://en.wikipedia.org/wiki/AdaBoost" },
    ],
    concepts: ["Halfspaces (homogeneous & non-homogeneous)", "ERM for halfspaces as a linear program", "Batch Perceptron & mistake bound", "VC dimension of halfspaces", "Least squares & normal equations", "Weak learnability (γ-weak learner)", "AdaBoost & its training-error bound", "Decision stumps"],
    objectives: [
      "Prove the Perceptron mistake bound (RB)² and explain its geometric meaning",
      "Prove VCdim of homogeneous halfspaces in ℝᵈ is d and of non-homogeneous ones is d+1",
      "Cast realizable halfspace ERM and absolute-loss regression as linear programs",
      "Define γ-weak learnability and explain why it is equivalent to strong learnability (boosting)",
      "Prove AdaBoost's training error bound exp(−2γ²T) (Thm 10.2)",
      "Explain the bias-complexity tradeoff controlled by T in AdaBoost",
    ],
    requirements: ["Code: NumPy only, no scikit-learn"],
    quiz: [
      { q: "The Perceptron makes at most (RB)² updates where B is …", options: ["max ‖x_i‖", "min{‖w‖ : y_i⟨w, x_i⟩ ≥ 1 ∀i}", "The number of samples", "The margin γ"], answer: 1, why: "B is the norm of the smallest separator with functional margin 1; RB = R/γ for the max-margin γ." },
      { q: "VCdim of non-homogeneous halfspaces in ℝᵈ is …", options: ["d − 1", "d", "d + 1", "2d"], answer: 2, why: "Add a constant feature: homogeneous halfspaces in ℝ^{d+1}." },
      { q: "AdaBoost's weight for weak hypothesis h_t is …", options: ["ε_t", "log(1/ε_t)", "½ log(1/ε_t − 1)", "1/T"], answer: 2, why: "w_t = ½ log((1 − ε_t)/ε_t)." },
      { q: "After each AdaBoost update, the error of h_t w.r.t. the NEW distribution D^{(t+1)} is …", options: ["0", "ε_t", "Exactly 1/2", "1 − ε_t"], answer: 2, why: "SSBD Ex. 10.3 — the reweighting makes the last hypothesis useless, forcing the next one to be different." },
    ],
    tasks: [
      readme("0x09-linear_boosting"),
      {
        title: "Perceptron mistake bound",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/1-perceptron.pdf´.

**Theorem 9.1.** Let $(x_1,y_1),\dots,(x_m,y_m)$ be separable, $B = \min\{\|w\| : \forall i,\ y_i\langle w,x_i\rangle\ge 1\}$ and $R = \max_i\|x_i\|$. Then the Batch Perceptron (start at $w^{(1)} = 0$; while some $i$ has $y_i\langle w^{(t)},x_i\rangle \le 0$, set $w^{(t+1)} = w^{(t)} + y_ix_i$) stops after at most $(RB)^2$ iterations, and when it stops, $y_i\langle w^{(t)},x_i\rangle > 0$ for all $i$.

Prove it by showing $\langle w^\star, w^{(T+1)}\rangle \ge T$ and $\|w^{(T+1)}\|^2 \le TR^2$ and applying Cauchy–Schwarz. Then: (a) show the bound is invariant to rescaling the data; (b) rewrite it as $(R/\gamma)^2$ for the geometric margin $\gamma$; (c) give an example where the Perceptron needs exponentially many (in $d$) updates — or explain why $B$ can be exponentially large in $d$ for points in $\{\pm1\}^d$.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/1-perceptron.pdf"],
        rubric: "proof",
        criteria: [
          "⟨w*, w^{(t+1)}⟩ − ⟨w*, w^{(t)}⟩ = y_i⟨w*, x_i⟩ ≥ 1 for every update",
          "‖w^{(t+1)}‖² = ‖w^{(t)}‖² + 2y_i⟨w^{(t)}, x_i⟩ + ‖x_i‖² ≤ ‖w^{(t)}‖² + R² using the update condition",
          "Cauchy–Schwarz: T ≤ ‖w*‖ ‖w^{(T+1)}‖ ≤ B√T R ⇒ T ≤ (RB)²",
          "Margin reformulation B = 1/γ for unit-norm separator, with the scaling argument",
        ],
      },
      {
        title: "VC dimension of halfspaces",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/2-vc_halfspaces.pdf´.

**Theorem 9.2.** The VC dimension of homogeneous halfspaces $\{x\mapsto\mathrm{sign}(\langle w,x\rangle)\}$ in $\mathbb{R}^d$ is $d$.
**Theorem 9.3.** The VC dimension of non-homogeneous halfspaces $\{x\mapsto\mathrm{sign}(\langle w,x\rangle + b)\}$ in $\mathbb{R}^d$ is $d+1$.

Prove both. For the upper bound of 9.2: any $d+1$ vectors are linearly dependent; split the dependence coefficients into positive and negative index sets $I, J$ and derive a contradiction with the labelling that is $+1$ on $I$ and $-1$ on $J$ (handle $J = \emptyset$). Then state the consequence for the sample complexity of learning halfspaces via ERM.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/2-vc_halfspaces.pdf"],
        rubric: "proof",
        criteria: [
          "Lower bound: e_1,…,e_d shattered with w = (y_1,…,y_d)",
          "Upper bound: linear dependence Σ a_i x_i = 0 split into I = {a_i > 0}, J = {a_i < 0}, contradiction via ⟨w, ·⟩",
          "Case J = ∅ (or I = ∅) handled",
          "Non-homogeneous case reduced to homogeneous in ℝ^{d+1} for both bounds",
        ],
      },
      {
        title: "Exercises 9.1–9.2",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/3-ex_9_1-9_2.pdf´.

- **SSBD Exercise 9.1** — show how to cast the ERM problem of linear regression with respect to the absolute-value loss $\ell(h,(x,y)) = |h(x) - y|$ as a linear program (write the LP explicitly in standard form: variables, objective, constraints).
- **SSBD Exercise 9.2** — show that the matrix $A = \sum_{i=1}^m x_ix_i^\top$ is invertible if and only if $x_1,\dots,x_m$ span $\mathbb{R}^d$.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/3-ex_9_1-9_2.pdf"],
        rubric: "proof",
        criteria: [
          "9.1: slack variables s_i ≥ |⟨w, x_i⟩ − y_i| via two linear constraints, objective Σ s_i, and argument that the optimum has equality",
          "9.2 (⇐): vᵀAv = Σ⟨v, x_i⟩² = 0 ⇒ v ⊥ span = ℝᵈ ⇒ v = 0",
          "9.2 (⇒): if the span is a proper subspace, a nonzero v ⊥ span is in the kernel of A",
        ],
      },
      {
        title: "AdaBoost training error (Theorem 10.2)",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`File: ´written/4-adaboost.pdf´.

**Theorem 10.2.** Let $S$ be a training set and assume that at each iteration of AdaBoost the weak learner returns $h_t$ with $\varepsilon_t \le 1/2 - \gamma$. Then the training error of the output $h_s(x) = \mathrm{sign}\big(\sum_{t=1}^T w_t h_t(x)\big)$ satisfies
$$L_S(h_s) = \frac1m\sum_{i=1}^m\mathbb{1}[h_s(x_i)\ne y_i] \le \exp(-2\gamma^2T).$$

Prove it: define $f_t = \sum_{p\le t} w_ph_p$ and $Z_t = \frac1m\sum_i e^{-y_if_t(x_i)}$; show $L_S(h_s)\le Z_T$; show $Z_{t+1}/Z_t = 2\sqrt{\varepsilon_{t+1}(1-\varepsilon_{t+1})}$ using the AdaBoost distribution $D^{(t+1)}$; bound $2\sqrt{\varepsilon(1-\varepsilon)} \le \sqrt{1-4\gamma^2} \le e^{-2\gamma^2}$. Then explain why the *generalisation* of AdaBoost is controlled by $\mathrm{VCdim}(L(B,T))$ (Lemma 10.3: $\tilde O(Td)$ for base class VC $d$) and what this says about choosing $T$.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/4-adaboost.pdf"],
        rubric: "proof",
        criteria: [
          "1[h_s(x) ≠ y] ≤ e^{−y f_T(x)} gives L_S(h_s) ≤ Z_T, with Z_0 = 1",
          "D^{(t+1)}_i ∝ e^{−y_i f_t(x_i)} identified so that Z_{t+1}/Z_t = Σ_i D^{(t+1)}_i e^{−y_i w h(x_i)}",
          "Evaluates to e^{−w}(1 − ε) + e^{w}ε and the optimal w gives 2√(ε(1−ε))",
          "Monotonicity of ε(1−ε) on [0, 1/2] used to plug in ε ≤ 1/2 − γ; 1 − a ≤ e^{−a} used",
          "Discussion of VCdim(L(B,T)) and the tradeoff in T",
        ],
      },
      {
        title: "Exercises 10.1–10.3",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/5-ex_10_1-10_3.pdf´.

- **SSBD Exercise 10.1** — boosting the confidence: from an algorithm that succeeds with probability $\ge 3/4$ (for $m\ge m_{\mathcal{H}}(\varepsilon)$), construct a procedure that succeeds with probability $\ge 1-\delta$, and bound its sample complexity (repeat + validate).
- **SSBD Exercise 10.2** — prove the identity about the function in Eq. (10.5) as stated in the book (piecewise-constant representation).
- **SSBD Exercise 10.3** — show that the error of $h_t$ with respect to the distribution $D^{(t+1)}$ is exactly $1/2$.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/5-ex_10_1-10_3.pdf"],
        rubric: "proof",
        criteria: [
          "10.1: run A on ⌈log₂(2/δ)⌉ (or similar) independent samples, P(all fail) ≤ (1/4)^k, then select by a validation set with a Hoeffding + union bound; total sample size given",
          "10.2: proof matches the statement in the book and handles the threshold boundaries",
          "10.3: Σ_{i: h_t(x_i) ≠ y_i} D^{(t+1)}_i = ε_t e^{w_t} / Z = 1/2 computed explicitly",
        ],
      },
      sheet(6, [
        "Halfspaces, LP for realizable ERM, VC dimension d / d+1",
        "Perceptron mistake bound (RB)²",
        "Least squares & normal equations (Ex. 9.2)",
        "γ-weak learnability, AdaBoost algorithm and Theorem 10.2",
        "VCdim of L(B,T) and the role of T",
      ]),
      {
        title: "AdaBoost with decision stumps",
        type: "advanced",
        kind: "code",
        points: 3,
        body: md`File: ´100-adaboost.py´. NumPy only.

Decision stump: $h_{j,\theta,b}(x) = b$ if $x_j\le\theta$ else $-b$, with $b\in\{\pm1\}$. The weak learner is **exact weighted ERM over all stumps** (all features $j$, thresholds between consecutive sorted values plus one below the minimum, both signs $b$), e.g. via SSBD's $O(dm)$ sweep after sorting.

~~~python
def adaboost_stumps(X, y, T):
    """X: (m, d) floats, y: (m,) in {-1, +1}. Run T rounds of AdaBoost from D^(1) = uniform.
    Return a dict with:
      "stumps": list of T tuples (j, theta, b),
      "eps":    array (T,), weighted error of stump t under D^(t),
      "alphas": array (T,), w_t = 0.5 * log(1/eps_t - 1),
      "train_errors": array (T,), 0-1 training error of sign(sum_{s<=t} w_s h_s) after round t
                      (use sign(0) = +1)."""

def adaboost_predict(model, X):
    """Return sign(sum_t w_t h_t(x)) in {-1, +1} for each row of X (sign(0) = +1)."""
~~~

Example:
~~~python
>>> a = __import__('100-adaboost')
>>> model = a.adaboost_stumps(X, y, 50)
>>> model["train_errors"][-1] <= np.prod(2*np.sqrt(model["eps"]*(1 - model["eps"])))
True
~~~

The checker replays your stumps and weights: it recomputes every $D^{(t)}$, checks that ´eps[t]´ is the weighted error of your stump **and** equals the minimum over all stumps, and checks Theorem 10.2's product bound at every round.`,
        files: ["100-adaboost.py"],
        checks: [
          { type: "exists", path: "100-adaboost.py" },
          { type: "defines", path: "100-adaboost.py", names: ["adaboost_stumps", "adaboost_predict"] },
          { type: "not_contains", path: "100-adaboost.py", pattern: "sklearn", label: "no scikit-learn" },
          {
            type: "py_test",
            files: ["100-adaboost.py"],
            label: "replayed AdaBoost: weak learner is exact ERM, weights and bound correct",
            code: py`import numpy as np
from importlib import import_module
a = import_module('100-adaboost')
rng = np.random.default_rng(0)
m, d, T = 120, 2, 25
X = rng.uniform(-1, 1, size=(m, d))
y = np.where(X[:, 0] + X[:, 1] + 0.3*np.sin(4*X[:, 0]) > 0, 1, -1)
model = a.adaboost_stumps(X, y, T)
eps = np.asarray(model["eps"], float); al = np.asarray(model["alphas"], float)
tr = np.asarray(model["train_errors"], float); st = model["stumps"]
assert len(st) == T and eps.shape == (T,) and al.shape == (T,) and tr.shape == (T,)
def stump(j, th, b, Z):
    return np.where(Z[:, j] <= th, b, -b)
def best_err(D):
    best = 1.0
    for j in range(d):
        xs = np.sort(X[:, j]); ths = np.concatenate([[xs[0] - 1], (xs[:-1] + xs[1:])/2, [xs[-1] + 1]])
        P = np.where(X[:, j][None, :] <= ths[:, None], 1, -1)
        e = ((P != y[None, :]) * D[None, :]).sum(axis=1)
        best = min(best, e.min(), (1 - e).min())
    return best
D = np.full(m, 1.0/m); F = np.zeros(m); bound = 1.0
for t in range(T):
    j, th, b = st[t]
    h = stump(int(j), float(th), float(b), X)
    e = float(D[h != y].sum())
    assert np.isclose(e, eps[t], atol=1e-9), (t, e, eps[t])
    assert np.isclose(e, best_err(D), atol=1e-9), (t, e, best_err(D))
    assert 0 < e < 0.5
    assert np.isclose(al[t], 0.5*np.log(1/e - 1), atol=1e-9)
    F += al[t]*h
    err = float(np.mean(np.where(F >= 0, 1, -1) != y))
    assert np.isclose(tr[t], err, atol=1e-12), (t, tr[t], err)
    bound *= 2*np.sqrt(e*(1 - e))
    assert tr[t] <= bound + 1e-12
    D = D*np.exp(-al[t]*y*h); D /= D.sum()
p = np.asarray(a.adaboost_predict(model, X))
assert np.isclose(np.mean(p != y), tr[-1])
print("ok")`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── T11
  {
    id: "T11",
    track: "theory",
    phase: PHASE,
    title: "Model Selection, Validation & Convex Learning Problems",
    days: 5,
    repo: REPO,
    dir: "0x0A-validation_convexity",
    sources: [
      { course: "BD", lectures: "Lec 14", topics: "Validation & model selection; convexity, Lipschitzness, smoothness; convex learning problems & surrogate losses" },
    ],
    resources: [
      { title: "SSBD Ch. 11 (Model Selection and Validation) & Ch. 12 (Convex Learning Problems)", url: SSBD.url },
      { title: "Boyd & Vandenberghe — Convex Optimization (free PDF)", url: "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf" },
      { title: "Cross-validation (overview)", url: "https://en.wikipedia.org/wiki/Cross-validation_(statistics)" },
      MOHRI,
    ],
    concepts: ["Hold-out validation bound", "Model selection over a finite set of candidates", "k-fold cross-validation", "Convex sets & functions", "Lipschitzness", "Smoothness & self-boundedness", "Convex-Lipschitz-bounded and convex-smooth-bounded problems", "Surrogate losses (hinge)"],
    objectives: [
      "Prove the validation bound L_D(h) ≤ L_V(h) + √(log(2/δ)/(2m_v)) and its finite-candidate version",
      "Explain when to trust k-fold cross-validation and why it lacks a clean general guarantee",
      "Prove that local minima of convex functions are global and the first-order characterisation",
      "Derive Lipschitz and smoothness constants of compositions with linear maps",
      "Define convex-Lipschitz-bounded and convex-smooth-bounded learning problems",
      "Explain why convexity alone does not guarantee learnability (SSBD Example 12.8-type construction)",
    ],
    requirements: ["Every Lipschitz/smoothness constant must be derived, not quoted"],
    quiz: [
      { q: "With r candidate models and a validation set of size m_v, the selection bound adds …", options: ["√(log(2/δ)/(2m_v))", "√(log(2r/δ)/(2m_v))", "r/m_v", "√(r/m_v)"], answer: 1, why: "Union bound over the r candidates on the independent validation set (Thm 11.2)." },
      { q: "f(w) = g(⟨w, x⟩ + b) with g β-smooth is …", options: ["β-smooth", "β‖x‖²-smooth", "β‖x‖-smooth", "Not smooth in general"], answer: 1, why: "∇²f = g''(·) x xᵀ, operator norm ≤ β‖x‖²." },
      { q: "A nonnegative β-smooth function satisfies …", options: ["‖∇f(w)‖² ≤ 2βf(w)", "f(w) ≤ β", "‖∇f(w)‖ ≤ β", "f is strongly convex"], answer: 0, why: "Self-boundedness (SSBD Lemma 12.5)." },
      { q: "The hinge loss max{0, 1 − y⟨w, x⟩} with ‖x‖ ≤ R is …", options: ["Smooth but not Lipschitz", "Convex and R-Lipschitz but not smooth", "Neither convex nor Lipschitz", "Strongly convex"], answer: 1, why: "Piecewise linear in w with slope bounded by ‖x‖; the kink breaks smoothness." },
    ],
    tasks: [
      readme("0x0A-validation_convexity"),
      {
        title: "Validation bounds",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/1-validation.pdf´.

**Theorem 11.1.** Let $h$ be a fixed predictor and $\ell\in[0,1]$. For a validation set $V\sim\mathcal{D}^{m_v}$ independent of $h$, with probability $\ge 1-\delta$:
$$|L_V(h) - L_{\mathcal{D}}(h)| \le \sqrt{\frac{\log(2/\delta)}{2m_v}}.$$
**Theorem 11.2.** For $\mathcal{H} = \{h_1,\dots,h_r\}$ fixed before seeing $V$, with probability $\ge 1-\delta$, for all $h\in\mathcal{H}$: $|L_{\mathcal{D}}(h) - L_V(h)| \le \sqrt{\frac{\log(2r/\delta)}{2m_v}}$.

Prove both. Then: (a) explain precisely why Thm 11.1 fails if $V$ was used to select $h$ among infinitely many candidates; (b) describe k-fold CV and leave-one-out and explain why no general guarantee as clean as 11.1 holds; (c) SSBD §11.3: write the decision procedure "what to do if learning fails" (diagnose approximation vs estimation error with learning curves) as a flowchart.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/1-validation.pdf"],
        rubric: "proof",
        criteria: [
          "Hoeffding applied to the m_v i.i.d. losses with h fixed (independence from V stressed)",
          "Union bound over r candidates for Thm 11.2",
          "Explains the adaptivity problem (V is no longer independent of the selected h)",
          "Learning-curve diagnosis distinguishes high train error (approximation) from large train–validation gap (estimation)",
        ],
      },
      {
        title: "Convexity, Lipschitzness, smoothness",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`File: ´written/2-convexity.pdf´. Prove:

1. A local minimum of a convex function is a global minimum.
2. For differentiable $f$: $f$ convex $\iff$ $f(u)\ge f(w) + \langle\nabla f(w), u-w\rangle$ for all $u,w$; and for twice-differentiable scalar $f$, convex $\iff f''\ge 0$.
3. A convex $f$ is $\rho$-Lipschitz over an open convex set iff all its subgradients have norm $\le\rho$.
4. If $g:\mathbb{R}\to\mathbb{R}$ is $\rho$-Lipschitz (resp. $\beta$-smooth), then $f(w) = g(\langle w,x\rangle + b)$ is $\rho\|x\|$-Lipschitz (resp. $\beta\|x\|^2$-smooth).
5. **Self-boundedness:** if $f$ is $\beta$-smooth and non-negative then $\|\nabla f(w)\|^2\le 2\beta f(w)$.
6. Define convex-Lipschitz-bounded and convex-smooth-bounded learning problems (SSBD Def. 12.12–12.13) and reproduce SSBD's example showing that convexity alone does **not** imply learnability (one-dimensional squared loss with an unbounded hypothesis set).${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/2-convexity.pdf"],
        rubric: "proof",
        criteria: [
          "Local ⇒ global via the convex combination w + t(u − w) argument",
          "First-order characterisation proved in both directions",
          "Subgradient bound ⇔ Lipschitz proved (mean-value / supporting hyperplane argument)",
          "Composition constants derived via chain rule; self-boundedness via f(w − ∇f/β) ≥ 0 and the smoothness upper bound",
          "Non-learnability example correct: for any algorithm, two distributions force large excess risk",
        ],
      },
      {
        title: "Exercise 12.1 — Local minima of the 0-1 loss",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`File: ´written/3-ex_12_1.pdf´. Solve **SSBD Exercise 12.1**: construct a training sample $S\in(\mathbb{R}^2\times\{\pm1\})^m$ for which the empirical 0-1 risk of halfspaces has a strict local minimum $w$ (for some $\varepsilon>0$, $L_S(w)\le L_S(w')$ for all $\|w-w'\|\le\varepsilon$) that is not global (some $w^\star$ has $L_S(w^\star) < L_S(w)$). Draw the configuration.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/3-ex_12_1.pdf"],
        rubric: "proof",
        criteria: [
          "Explicit points and labels given, with a figure",
          "Shows no small perturbation of w decreases the empirical risk (margin argument)",
          "Exhibits w* with strictly smaller empirical risk",
        ],
      },
      {
        title: "Exercises 12.2–12.3 — Logistic and hinge losses",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/4-ex_12_2-12_3.pdf´.

- **SSBD Exercise 12.2** — logistic regression with $\mathcal{H} = \mathcal{X} = \{x\in\mathbb{R}^d : \|x\|\le B\}$, $\mathcal{Y}=\{\pm1\}$, $\ell(w,(x,y)) = \log(1+\exp(-y\langle w,x\rangle))$: show the problem is both convex-Lipschitz-bounded and convex-smooth-bounded and specify the parameters.
- **SSBD Exercise 12.3** — halfspaces with the hinge loss on a bounded domain: prove the properties asked in the book (convexity, Lipschitzness with the right constant, and that it is not smooth), as stated in your copy.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/4-ex_12_2-12_3.pdf"],
        rubric: "derivation",
        criteria: [
          "Logistic: g(a) = log(1 + e^{−a}) has |g'| ≤ 1 and g'' ≤ 1/4; constants ρ = B and β = B²/4 via the composition rule",
          "Boundedness parameter of the hypothesis set stated",
          "Hinge: convex as max of affine functions, ‖x‖-Lipschitz, non-differentiable at the kink ⇒ not smooth",
        ],
      },
      sheet(5, [
        "Theorems 11.1, 11.2; k-fold CV; learning-curve diagnosis",
        "Convexity facts (local = global, first-order, subgradients)",
        "Lipschitz & smoothness of compositions; self-boundedness",
        "Convex-Lipschitz-bounded / convex-smooth-bounded problems; surrogate losses",
      ]),
      {
        title: "Validation and model selection in code",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File: ´100-validation.py´. NumPy only.

~~~python
def validation_bound(val_loss, m_v, delta, a=0.0, b=1.0):
    """Upper confidence bound val_loss + (b - a) * sqrt(log(2/delta) / (2 m_v))."""

def holdout_select(val_losses, m_v, delta):
    """val_losses: array (r,) of validation losses of r fixed candidates (loss in [0,1]).
    Return (idx, bound): idx = argmin (smallest index on ties, int),
    bound = val_losses[idx] + sqrt(log(2 r / delta) / (2 m_v))."""

def kfold_indices(m, k):
    """Return a list of k NumPy int arrays partitioning range(m) into CONTIGUOUS folds
    in order, with sizes differing by at most 1 (larger folds first)."""
~~~

Example:
~~~python
>>> v = __import__('100-validation')
>>> [f.tolist() for f in v.kfold_indices(7, 3)]
[[0, 1, 2], [3, 4], [5, 6]]
~~~

The checker also runs a coverage simulation: Bernoulli($p$) validation losses, the true $p$ must exceed ´validation_bound´ in at most a $\delta$ fraction of trials.`,
        files: ["100-validation.py"],
        checks: [
          { type: "exists", path: "100-validation.py" },
          { type: "defines", path: "100-validation.py", names: ["validation_bound", "holdout_select", "kfold_indices"] },
          {
            type: "py_test",
            files: ["100-validation.py"],
            label: "bounds, selection, folds and coverage",
            code: py`import numpy as np
from importlib import import_module
v = import_module('100-validation')
assert np.isclose(float(v.validation_bound(0.2, 1000, 0.05)), 0.2 + np.sqrt(np.log(40)/2000))
assert np.isclose(float(v.validation_bound(1.0, 100, 0.1, a=-1, b=3)), 1.0 + 4*np.sqrt(np.log(20)/200))
idx, b = v.holdout_select(np.array([0.3, 0.1, 0.1, 0.5]), 500, 0.05)
assert int(idx) == 1 and np.isclose(float(b), 0.1 + np.sqrt(np.log(2*4/0.05)/1000))
for m, k in [(7, 3), (10, 5), (11, 4), (100, 7)]:
    folds = [np.asarray(f) for f in v.kfold_indices(m, k)]
    ref = np.array_split(np.arange(m), k)
    assert len(folds) == k and all((f == r).all() for f, r in zip(folds, ref))
rng = np.random.default_rng(0)
p, m_v, delta = 0.3, 200, 0.1
L = rng.uniform(size=(5000, m_v)) < p
ub = np.array([float(v.validation_bound(float(l.mean()), m_v, delta)) for l in L])
assert np.mean(p > ub) <= delta / 2
print("ok")`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── T12
  {
    id: "T12",
    track: "theory",
    phase: PHASE,
    title: "Regularization, Stability & SGD",
    days: 6,
    repo: REPO,
    dir: "0x0B-stability_sgd",
    sources: [
      { course: "BD", lectures: "Lec 15", topics: "Regularized loss minimisation, algorithmic stability, strong convexity; (stochastic) gradient descent for convex-Lipschitz problems" },
    ],
    resources: [
      { title: "SSBD Ch. 13 (Regularization and Stability) & Ch. 14 (Stochastic Gradient Descent)", url: SSBD.url },
      { title: "Bousquet & Elisseeff (2002) — Stability and Generalization (JMLR)", url: "https://www.jmlr.org/papers/v2/bousquet02a.html" },
      { title: "Shalev-Shwartz, Shamir, Srebro & Sridharan (2010) — Learnability, Stability and Uniform Convergence (JMLR)", url: "https://www.jmlr.org/papers/v11/shalev-shwartz10a.html" },
      { title: "Hardt, Recht & Singer (2015) — Train faster, generalize better: Stability of SGD", url: "https://arxiv.org/abs/1509.01240" },
    ],
    concepts: ["Regularized Loss Minimisation (RLM)", "On-average-replace-one stability", "Strong convexity", "Stability ⇒ generalisation", "Fitting–stability tradeoff", "Gradient descent with averaging", "Subgradients", "SGD for risk minimisation & projection"],
    objectives: [
      "Prove Theorem 13.2: expected generalisation gap equals expected replace-one instability",
      "Prove that Tikhonov-regularised RLM with a convex ρ-Lipschitz loss is 2ρ²/(λm)-stable",
      "Derive the oracle inequality E[L_D(A(S))] ≤ min_{‖w‖≤B} L_D(w) + ρB√(8/m) by tuning λ",
      "Prove GD/SGD with step size B/(ρ√T) achieves Bρ/√T suboptimality for the averaged iterate",
      "Explain why SGD directly minimises the true risk L_D and what that implies for sample complexity",
      "Contrast the stability route with the uniform-convergence route to generalisation",
    ],
    requirements: ["Expectations must say what they are over (S, z', i, the SGD randomness)"],
    quiz: [
      { q: "λ‖w‖² is …", options: ["λ-strongly convex", "2λ-strongly convex", "Not strongly convex", "λ²-strongly convex"], answer: 1, why: "Its Hessian is 2λI." },
      { q: "For RLM with a convex ρ-Lipschitz loss, the replace-one stability is bounded by …", options: ["ρ/(λm)", "2ρ²/(λm)", "ρ²λ/m", "√(ρ²/(λm))"], answer: 1, why: "SSBD §13.3.1: E[ℓ(A(S^{(i)}), z_i) − ℓ(A(S), z_i)] ≤ 2ρ²/(λm)." },
      { q: "GD on a convex ρ-Lipschitz f over {‖w‖ ≤ B} with η = B/(ρ√T) guarantees, for the averaged iterate w̄, …", options: ["f(w̄) − f(w*) ≤ Bρ/√T", "f(w̄) − f(w*) ≤ Bρ/T", "‖w̄ − w*‖ ≤ 1/T", "Linear convergence"], answer: 0, why: "SSBD Thm 14.8 (and its GD special case)." },
      { q: "Why can SGD be analysed as minimising L_D directly?", options: ["Because it uses the full gradient", "Because a fresh sample z_t ~ D gives an unbiased subgradient of L_D at w^{(t)}", "Because L_S = L_D", "Because the loss is smooth"], answer: 1, why: "With one pass over fresh samples, E[∇ℓ(w, z_t) | w] ∈ ∂L_D(w)." },
    ],
    tasks: [
      readme("0x0B-stability_sgd"),
      {
        title: "Stability ⇒ generalisation (Theorem 13.2)",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/1-stability.pdf´.

Let $S = (z_1,\dots,z_m)\sim\mathcal{D}^m$, $z'\sim\mathcal{D}$, $i\sim U[m]$, and $S^{(i)}$ = $S$ with $z_i$ replaced by $z'$.

**Theorem 13.2.** For any learning algorithm $A$:
$$\mathbb{E}_{S\sim\mathcal{D}^m}\big[L_{\mathcal{D}}(A(S)) - L_S(A(S))\big] = \mathbb{E}_{(S,z')\sim\mathcal{D}^{m+1},\,i\sim U(m)}\big[\ell(A(S^{(i)}), z_i) - \ell(A(S), z_i)\big].$$

Prove it (renaming argument: $z_i$ and $z'$ are exchangeable). Then define on-average-replace-one stability with rate $\epsilon(m)$ and state the corollary. Finally, write one paragraph comparing this to uniform convergence: which classes/algorithms does stability handle that VC theory does not?${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/1-stability.pdf"],
        rubric: "proof",
        criteria: [
          "E[L_D(A(S))] = E[ℓ(A(S), z')] = E[ℓ(A(S^{(i)}), z_i)] justified by exchangeability of z_i and z'",
          "E[L_S(A(S))] = E[ℓ(A(S), z_i)] with i uniform",
          "Stability definition stated with the expectation over S, z', i",
          "Comparison mentions that stability is algorithm-dependent and can handle infinite-dimensional / unbounded-VC settings (e.g. RLM in Hilbert space)",
        ],
      },
      {
        title: "Stability of RLM and the fitting–stability tradeoff",
        type: "mandatory",
        kind: "written",
        points: 4,
        body: md`File: ´written/2-rlm_stability.pdf´.

RLM: $A(S) = \mathrm{argmin}_w\big(L_S(w) + \lambda\|w\|^2\big)$.

1. **Lemma 13.5.** If $f$ is $\lambda$-strongly convex and $u$ minimises $f$, then $f(w) - f(u)\ge\frac{\lambda}{2}\|w-u\|^2$. Prove it, and prove that $\lambda\|w\|^2$ is $2\lambda$-strongly convex and that a sum of a convex and a $\lambda$-strongly convex function is $\lambda$-strongly convex.
2. **Lipschitz losses.** If $\ell(\cdot,z)$ is convex and $\rho$-Lipschitz, prove
$$\mathbb{E}\big[\ell(A(S^{(i)}), z_i) - \ell(A(S), z_i)\big] \le \frac{2\rho^2}{\lambda m}.$$
(Compare $f_S(A(S^{(i)})) - f_S(A(S))$ two ways; get $\|A(S^{(i)}) - A(S)\|\le\frac{2\rho}{\lambda m}$.)
3. **Oracle inequality.** Deduce, for every $w^\star$, $\mathbb{E}[L_{\mathcal{D}}(A(S))]\le L_{\mathcal{D}}(w^\star) + \lambda\|w^\star\|^2 + \frac{2\rho^2}{\lambda m}$, and with $\lambda = \sqrt{2\rho^2/(B^2m)}$:
$$\mathbb{E}[L_{\mathcal{D}}(A(S))]\le\min_{\|w\|\le B}L_{\mathcal{D}}(w) + \rho B\sqrt{\frac{8}{m}}.$$
4. Explain the fitting–stability tradeoff in $\lambda$ in one paragraph, and state (without proof) the analogous result for smooth non-negative losses.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/2-rlm_stability.pdf"],
        rubric: "proof",
        criteria: [
          "Lemma 13.5 proved from the definition of strong convexity (limit t → 0 argument or first-order condition)",
          "Two-sided comparison: f_S(v) − f_S(u) ≥ λ‖v − u‖² and ≤ (ℓ(v, z_i) − ℓ(u, z_i) + ℓ(u, z') − ℓ(v, z'))/m",
          "Lipschitzness gives ‖v − u‖ ≤ 2ρ/(λm) and the stability rate 2ρ²/(λm)",
          "Oracle inequality uses L_S(A(S)) ≤ L_S(A(S)) + λ‖A(S)‖² ≤ L_S(w*) + λ‖w*‖² and E L_S(w*) = L_D(w*)",
          "Optimal λ computed and ρB√(8/m) obtained",
        ],
      },
      {
        title: "Convergence of (S)GD for convex-Lipschitz functions",
        type: "mandatory",
        kind: "written",
        points: 4,
        body: md`File: ´written/3-sgd.pdf´.

1. **Lemma 14.1.** For any $w^\star$ and vectors $v_1,\dots,v_T$, the update $w^{(1)} = 0$, $w^{(t+1)} = w^{(t)} - \eta v_t$ satisfies
$$\sum_{t=1}^T\langle w^{(t)} - w^\star, v_t\rangle\le\frac{\|w^\star\|^2}{2\eta} + \frac{\eta}{2}\sum_{t=1}^T\|v_t\|^2.$$
Prove it (expand $\|w^{(t+1)} - w^\star\|^2$ and telescope).
2. **GD.** For convex $\rho$-Lipschitz $f$, $\|w^\star\|\le B$, $v_t\in\partial f(w^{(t)})$ and $\eta = \frac{B}{\rho\sqrt T}$, prove $f(\bar w) - f(w^\star)\le\frac{B\rho}{\sqrt T}$ for $\bar w = \frac1T\sum_{t=1}^T w^{(t)}$.
3. **Theorem 14.8 (SGD).** If $\mathbb{E}[v_t\mid w^{(t)}]\in\partial f(w^{(t)})$ and $\|v_t\|\le\rho$ a.s., the same bound holds in expectation. Prove it (law of total expectation applied term by term).
4. **Projection.** Show the bound survives the projection step onto $\{\|w\|\le B\}$ (projection is non-expansive towards points in the set).
5. **SGD for learning.** Using a fresh sample per step, show $T\ge\frac{B^2\rho^2}{\varepsilon^2}$ samples give $\mathbb{E}[L_{\mathcal{D}}(\bar w)]\le\min_{\|w\|\le B}L_{\mathcal{D}}(w) + \varepsilon$, and compare with the RLM rate above.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/3-sgd.pdf"],
        rubric: "proof",
        criteria: [
          "Lemma 14.1: ⟨w^{(t)} − w*, v_t⟩ = (‖w^{(t)} − w*‖² − ‖w^{(t+1)} − w*‖²)/(2η) + η‖v_t‖²/2, telescoped",
          "Jensen: f(w̄) − f(w*) ≤ (1/T)Σ(f(w^{(t)}) − f(w*)) ≤ (1/T)Σ⟨w^{(t)} − w*, v_t⟩; step size optimised",
          "SGD: conditional expectation step E⟨w^{(t)} − w*, v_t⟩ = E⟨w^{(t)} − w*, ∇f(w^{(t)})⟩ justified",
          "Projection: ‖Π(w) − w*‖ ≤ ‖w − w*‖ for w* in the ball, inserted in the telescoping",
          "Sample complexity B²ρ²/ε² and comparison with RLM (same order)",
        ],
      },
      {
        title: "Two exercises from Chapters 13–14",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/4-ch13_14_exercises.pdf´.

Solve **two** end-of-chapter exercises: one from SSBD §13.6 and one from SSBD §14.6 (or two from either if your copy differs). Prefer ones that extend the theorems above (e.g. stability for smooth losses, strongly convex SGD rates, or variants of the step size). These count towards the T14 portfolio.${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/4-ch13_14_exercises.pdf"],
        rubric: "proof",
        criteria: [
          "Statements copied verbatim with numbers; one from each chapter (or justified otherwise)",
          "Complete proofs with every expectation's randomness specified",
          "Constants derived, not asserted",
        ],
      },
      sheet(5, [
        "RLM, strong convexity, Lemma 13.5",
        "Theorem 13.2 and on-average-replace-one stability",
        "Stability rate 2ρ²/(λm) and the oracle inequality ρB√(8/m)",
        "Lemma 14.1, GD/SGD rate Bρ/√T, projection, SGD for risk minimisation",
      ]),
      {
        title: "Projected (stochastic) subgradient descent",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File: ´100-sgd.py´. NumPy only.

~~~python
def sgd(subgrad, d, B, rho, T):
    """Projected SGD on the ball {||w|| <= B} exactly as in SSBD Ch. 14:
      eta = B / (rho * sqrt(T)); w^(1) = 0 (shape (d,));
      for t = 1..T: v_t = subgrad(w^(t), t)          # t is 1-based
                    w^(t+1/2) = w^(t) - eta * v_t
                    w^(t+1)   = projection of w^(t+1/2) onto the ball of radius B
    Return w_bar = mean(w^(1), ..., w^(T)) (NOT including w^(T+1)), shape (d,)."""
~~~

Example:
~~~python
>>> s = __import__('100-sgd')
>>> w_star = np.array([0.6, -0.3])
>>> g = lambda w, t: np.sign(w - w_star)        # subgradient of ||w - w_star||_1
>>> s.sgd(g, 2, 1.0, np.sqrt(2), 10000)          # close to w_star
~~~

The checker replays the iterates against a reference with deterministic and stochastic oracles and checks the $B\rho/\sqrt T$ guarantee for $f(w) = \rho\|w - w^\star\|_2$.`,
        files: ["100-sgd.py"],
        checks: [
          { type: "exists", path: "100-sgd.py" },
          { type: "defines", path: "100-sgd.py", names: ["sgd"] },
          {
            type: "py_test",
            files: ["100-sgd.py"],
            label: "exact iterates, projection and Bρ/√T guarantee",
            code: py`import numpy as np
from importlib import import_module
s = import_module('100-sgd')
def ref(subgrad, d, B, rho, T):
    eta = B/(rho*np.sqrt(T)); w = np.zeros(d); acc = np.zeros(d)
    for t in range(1, T+1):
        acc += w
        w = w - eta*np.asarray(subgrad(w, t), float)
        n = np.linalg.norm(w)
        if n > B: w = w*(B/n)
    return acc/T
rng = np.random.default_rng(0)
w_star = np.array([0.5, -0.4, 0.2]); rho = 2.0; B = 1.0
def g(w, t):
    r = w - w_star; n = np.linalg.norm(r)
    return np.zeros(3) if n == 0 else rho*r/n
for T in (1, 10, 400):
    wb = np.asarray(s.sgd(g, 3, B, rho, T), float)
    assert wb.shape == (3,)
    assert np.allclose(wb, ref(g, 3, B, rho, T), atol=1e-9)
    assert rho*np.linalg.norm(wb - w_star) <= B*rho/np.sqrt(T) + 1e-9
noise = rng.normal(size=(500, 2))
far = np.array([3.0, 4.0])
h = lambda w, t: (w - far) / max(np.linalg.norm(w - far), 1e-12) + 0.5*noise[t-1]
wb = np.asarray(s.sgd(h, 2, 1.0, 1.5, 500), float)
assert np.allclose(wb, ref(h, 2, 1.0, 1.5, 500), atol=1e-9)
assert np.linalg.norm(wb) <= 1.0 + 1e-9
print("ok")`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── T13
  {
    id: "T13",
    track: "theory",
    phase: PHASE,
    title: "SVMs & Kernel Methods",
    days: 5,
    repo: REPO,
    dir: "0x0C-svm_kernels",
    sources: [
      { course: "BD", lectures: "Lec 16", topics: "Margin, hard/soft SVM, margin-based generalisation, kernels, representer theorem" },
    ],
    resources: [
      { title: "SSBD Ch. 15 (Support Vector Machines) & Ch. 16 (Kernel Methods)", url: SSBD.url },
      { title: "Cortes & Vapnik (1995) — Support-vector networks", url: "https://doi.org/10.1007/BF00994018" },
      { title: "Representer theorem (overview)", url: "https://en.wikipedia.org/wiki/Representer_theorem" },
      { title: "CS229 lecture notes (SVMs & kernels chapters)", url: "https://cs229.stanford.edu/main_notes.pdf" },
    ],
    concepts: ["Geometric margin", "Hard-SVM & its quadratic program", "Soft-SVM as RLM with hinge loss", "Margin-based (dimension-free) generalisation", "Feature maps & the kernel trick", "Positive semidefinite kernels (Mercer)", "Representer theorem", "Kernel Perceptron"],
    objectives: [
      "Derive the hard-SVM quadratic program from the max-margin formulation",
      "State the margin-based generalisation bound and explain why it is dimension-free",
      "Bound the soft-SVM risk via the stability results of T12",
      "Prove the representer theorem",
      "Characterise valid kernels via PSD Gram matrices and prove closure under sums and products",
      "Relate the Perceptron's (R/γ)² mistake bound to the margin bound",
    ],
    requirements: ["Code: NumPy only, no scikit-learn"],
    quiz: [
      { q: "Hard-SVM is equivalent to …", options: ["min ‖w‖² s.t. y_i⟨w, x_i⟩ ≥ 1 ∀i", "max ‖w‖ s.t. y_i⟨w, x_i⟩ ≥ 0", "min Σ hinge losses", "min ‖w‖₁ s.t. y_i⟨w, x_i⟩ ≥ 1"], answer: 0, why: "Rescale so that the minimal functional margin is 1; maximising the margin = minimising ‖w‖." },
      { q: "The margin bound for hard-SVM depends on …", options: ["The dimension d", "(ρ/γ)² and m, not on d", "The number of support vectors only", "log|H|"], answer: 1, why: "Sample complexity ≈ (ρ/γ)²/ε² — dimension-free." },
      { q: "The representer theorem says an optimal w can be written as …", options: ["Σ_i α_i ψ(x_i)", "A sparse vector", "The mean of the data", "An eigenvector of the Gram matrix"], answer: 0, why: "For objectives f(⟨w, ψ(x_1)⟩, …) + R(‖w‖) with R non-decreasing." },
      { q: "Which is NOT necessarily a valid kernel when K₁, K₂ are?", options: ["K₁ + K₂", "K₁ · K₂", "K₁ − K₂", "c·K₁ for c > 0"], answer: 2, why: "Differences can have negative eigenvalues." },
    ],
    tasks: [
      readme("0x0C-svm_kernels"),
      {
        title: "Hard/soft SVM and margin-based generalisation",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`File: ´written/1-svm_margin.pdf´.

1. Show that the distance from $x$ to the hyperplane $\{v:\langle w,v\rangle + b = 0\}$ with $\|w\|=1$ is $|\langle w,x\rangle + b|$, and that hard-SVM $\mathrm{argmax}_{\|w\|=1}\min_i y_i(\langle w,x_i\rangle + b)$ is equivalent to the QP $\min_{w,b}\|w\|^2$ s.t. $y_i(\langle w,x_i\rangle + b)\ge 1$ (map solutions both ways).
2. Soft-SVM: show $\min_{w,\xi}\lambda\|w\|^2 + \frac1m\sum\xi_i$ s.t. $y_i\langle w,x_i\rangle\ge 1-\xi_i$, $\xi_i\ge 0$ equals RLM with the hinge loss.
3. **Margin bound (state precisely, prove modulo one black box).** If $\mathcal{D}$ is supported on $\|x\|\le\rho$ and separable with margin $\gamma$ by a unit vector (homogeneous), then with probability $\ge 1-\delta$ the hard-SVM output satisfies
$$L^{0-1}_{\mathcal{D}}(w_S)\le\sqrt{\frac{4(\rho/\gamma)^2}{m}} + \sqrt{\frac{2\log(2/\delta)}{m}}.$$
You may use the Rademacher bound for the ramp/hinge loss of $\{\|w\|\le B\}$ (SSBD Ch. 26) as a black box — state it exactly.
4. **Soft-SVM via stability.** Using T12, prove: for $\|x\|\le\rho$ and every $u$,
$\mathbb{E}[L^{0-1}_{\mathcal{D}}(A(S))]\le\mathbb{E}[L^{\text{hinge}}_{\mathcal{D}}(A(S))]\le L^{\text{hinge}}_{\mathcal{D}}(u) + \lambda\|u\|^2 + \frac{2\rho^2}{\lambda m}$, and optimise $\lambda$.
5. Explain why these bounds are dimension-free and why that matters for kernels.${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/1-svm_margin.pdf"],
        rubric: "proof",
        criteria: [
          "Distance formula and the rescaling map between max-margin and min-norm formulations, both directions",
          "Soft-SVM ↔ hinge RLM: optimal ξ_i = max{0, 1 − y_i⟨w, x_i⟩}",
          "Margin bound: black box stated precisely; reduction uses ‖w_S‖ ≤ 1/γ and the 0-1 ≤ ramp ≤ hinge comparison",
          "Stability argument instantiated with hinge (ρ-Lipschitz when ‖x‖ ≤ ρ) and 0-1 ≤ hinge",
          "Optimal λ and the resulting rate stated; dimension-free discussion",
        ],
      },
      {
        title: "Kernels and the representer theorem",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`File: ´written/2-kernels.pdf´.

**Theorem 16.1 (Representer theorem).** Let $\psi:\mathcal{X}\to\mathcal{H}$ (Hilbert space) and consider
$$\min_{w\in\mathcal{H}}\ f\big(\langle w,\psi(x_1)\rangle,\dots,\langle w,\psi(x_m)\rangle\big) + R(\|w\|)$$
with $f:\mathbb{R}^m\to\mathbb{R}$ arbitrary and $R:\mathbb{R}_+\to\mathbb{R}$ non-decreasing. Then there exists $\alpha\in\mathbb{R}^m$ such that $w = \sum_i\alpha_i\psi(x_i)$ is an optimal solution (and if $R$ is strictly increasing, every optimum has this form).

1. Prove it (orthogonal decomposition $w^\star = w + u$, $u\perp\mathrm{span}\{\psi(x_i)\}$).
2. Rewrite soft-SVM in terms of $\alpha$ and the Gram matrix $G_{ij} = K(x_i,x_j)$.
3. **Lemma 16.2 (Mercer, finite version).** $K$ is a valid kernel iff every Gram matrix is PSD. Prove the "only if" direction and sketch the "if" direction (RKHS construction).
4. Prove sums, positive multiples and products of kernels are kernels; show $(1+\langle x,x'\rangle)^k$ is a kernel and write its feature map for $k=2$, $d=2$; show the Gaussian kernel is a kernel (via the Taylor series of $e^{\langle x,x'\rangle/\sigma^2}$ and products).${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/2-kernels.pdf"],
        rubric: "proof",
        criteria: [
          "Decomposition: ⟨w*, ψ(x_i)⟩ = ⟨w, ψ(x_i)⟩ and ‖w‖ ≤ ‖w*‖ so the objective doesn't increase",
          "Kernelised soft-SVM objective written with Gα and αᵀGα",
          "Gram PSD shown via Σ c_i c_j K(x_i, x_j) = ‖Σ c_i ψ(x_i)‖² ≥ 0",
          "Product closure proved (Schur product theorem or tensor features)",
          "Explicit degree-2 feature map and Gaussian kernel validity argument",
        ],
      },
      {
        title: "Exercise 15.1 — Equivalent hard-SVM formulations",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`File: ´written/3-ex_15_1.pdf´. Solve **SSBD Exercise 15.1**: show that the hard-SVM rule
$$\mathrm{argmax}_{(w,b):\|w\|=1}\ \min_{i\in[m]}|\langle w,x_i\rangle + b|\quad\text{s.t.}\quad\forall i,\ y_i(\langle w,x_i\rangle + b) > 0$$
is equivalent to
$$\mathrm{argmax}_{(w,b):\|w\|=1}\ \min_{i\in[m]} y_i(\langle w,x_i\rangle + b).$$${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/3-ex_15_1.pdf"],
        rubric: "proof",
        criteria: [
          "On the feasible set |⟨w, x_i⟩ + b| = y_i(⟨w, x_i⟩ + b)",
          "For separable data the second problem's optimum is positive, hence feasible for the first — both directions argued",
        ],
      },
      {
        title: "Exercises 15.2–15.3 — Perceptron margin; hard vs soft SVM",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/4-ex_15_2-15_3.pdf´.

- **SSBD Exercise 15.2** — margin and the Perceptron: for data separable with margin $\gamma$ and $\|x\|\le\rho$, relate the Perceptron's number of updates to $(\rho/\gamma)^2$, and answer the question about the margin of the Perceptron's output as stated in the book (can it be much smaller than $\gamma$? give an example).
- **SSBD Exercise 15.3** — hard versus soft SVM: prove or refute the claim stated in the book (whether a single $\lambda>0$ makes soft-SVM return the hard-SVM solution on every separable sample).${EX_NOTE}${WRITTEN_NOTE}`,
        deliverable: "repo",
        files: ["written/4-ex_15_2-15_3.pdf"],
        rubric: "proof",
        criteria: [
          "15.2: reduction to Theorem 9.1 with B = 1/γ, R = ρ; explicit example where the output margin is small",
          "15.3: clear verdict; a counterexample (or proof) that handles 'for every sample' quantifier correctly",
          "Counterexample computed concretely (e.g. scaling the sample so the hinge term dominates differently)",
        ],
      },
      sheet(5, [
        "Hard-SVM / soft-SVM formulations and their equivalences",
        "Margin bound and the soft-SVM stability bound",
        "Representer theorem, kernel trick, Mercer (finite)",
        "Kernel closure properties; polynomial & Gaussian kernels",
      ]),
      {
        title: "Perceptron mistakes and Gaussian kernels",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File: ´100-perceptron_kernels.py´. NumPy only.

~~~python
def perceptron(X, y, max_updates=100000):
    """Batch Perceptron (homogeneous): w = 0; while some i has y_i <w, x_i> <= 0 and
    fewer than max_updates updates were made: w += y_i x_i. Any rule for picking the
    violated i is allowed. Return (w, n_updates) with w shape (d,) and n_updates an int."""

def gaussian_kernel(X, Z, sigma):
    """Return the (n, k) matrix exp(-||x_i - z_j||^2 / (2 sigma^2)). No Python loops."""
~~~

Example:
~~~python
>>> p = __import__('100-perceptron_kernels')
>>> w, k = p.perceptron(X, y)
>>> bool(np.all(y * (X @ w) > 0)), k <= (R * B) ** 2
(True, True)
~~~

The checker verifies separation, the Theorem 9.1 bound $(RB)^2$ computed from a known separator, and PSD-ness and exactness of your Gram matrices. In your README, show how the number of updates grows as the margin shrinks.`,
        files: ["100-perceptron_kernels.py"],
        checks: [
          { type: "exists", path: "100-perceptron_kernels.py" },
          { type: "defines", path: "100-perceptron_kernels.py", names: ["perceptron", "gaussian_kernel"] },
          {
            type: "py_test",
            files: ["100-perceptron_kernels.py"],
            label: "Perceptron obeys (RB)²; Gaussian Gram matrix is exact and PSD",
            code: py`import numpy as np
from importlib import import_module
p = import_module('100-perceptron_kernels')
rng = np.random.default_rng(0)
for gamma in (0.3, 0.1, 0.05):
    w_star = rng.normal(size=5); w_star /= np.linalg.norm(w_star)
    X = rng.normal(size=(2000, 5))
    X = X[np.abs(X @ w_star) >= gamma][:300]
    y = np.sign(X @ w_star)
    w, k = p.perceptron(X, y)
    w = np.asarray(w, float)
    assert np.all(y*(X @ w) > 0), "must separate"
    R = np.linalg.norm(X, axis=1).max()
    B = 1.0/np.min(y*(X @ w_star))
    assert 1 <= int(k) <= (R*B)**2, (k, (R*B)**2)
X = rng.normal(size=(40, 3)); Z = rng.normal(size=(7, 3))
K = np.asarray(p.gaussian_kernel(X, Z, 0.7))
ref = np.exp(-((X[:, None, :] - Z[None, :, :])**2).sum(-1)/(2*0.49))
assert K.shape == (40, 7) and np.allclose(K, ref)
G = np.asarray(p.gaussian_kernel(X, X, 1.3))
assert np.allclose(G, G.T) and np.allclose(np.diag(G), 1.0)
assert np.linalg.eigvalsh(G).min() > -1e-8
print("ok")`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── T14
  {
    id: "T14",
    track: "theory",
    phase: PHASE,
    title: "Pass 1 Synthesis: What Is the Fundamental Theorem Really Saying?",
    days: 5,
    repo: REPO,
    dir: "0x0D-pass1_synthesis",
    sources: [
      { course: "BD", lectures: "Lec 9", topics: "Re-watch: the fundamental theorem (no notes) before writing the essay" },
      { course: "BD", lectures: "Lec 16", topics: "Re-watch the last lecture's wrap-up while drafting the one-page summary" },
    ],
    resources: [
      SSBD,
      { title: "Zhang, Bengio, Hardt, Recht & Vinyals (2016) — Understanding deep learning requires rethinking generalization", url: "https://arxiv.org/abs/1611.03530" },
      { title: "Belkin, Hsu, Ma & Mandal (2018) — Reconciling modern machine learning practice and the bias-variance trade-off", url: "https://arxiv.org/abs/1812.11118" },
      { title: "Blumer, Ehrenfeucht, Haussler & Warmuth (1989) — Learnability and the VC dimension", url: "https://doi.org/10.1145/76359.76371" },
    ],
    concepts: ["Learnability as a property of the class", "Uniform convergence vs stability vs compression", "Sample complexity rates (1/ε vs 1/ε²)", "Statistical vs computational barriers", "Limits of the classical theory (overparameterised models)"],
    objectives: [
      "Explain in plain words what each of the six equivalent conditions of the fundamental theorem means and why they coincide",
      "Explain what the theorem does NOT say (distribution-dependent rates, computation, multiclass/regression, algorithms other than ERM)",
      "Place every Pass 1 result (NFL, SRM, boosting, stability, margins, kernels) relative to the fundamental theorem",
      "Audit your own portfolio: at least 30 SSBD exercises solved, every major theorem re-proved",
      "Formulate the open questions that Pass 2 (CS229M) will address",
    ],
    requirements: [
      "The essay is written entirely from memory — no book, notes or internet while drafting; you may fact-check afterwards and list corrections in an appendix",
      "Publish the essay publicly (Medium or a personal blog)",
    ],
    quiz: [
      { q: "Which result shows that SOME prior knowledge (a restricted H) is necessary for learning?", options: ["Sauer's lemma", "No-Free-Lunch", "The representer theorem", "AdaBoost's training bound"], answer: 1, why: "NFL: no universal learner exists over an infinite domain." },
      { q: "Which Pass 1 guarantee does NOT go through uniform convergence over a fixed class?", options: ["Finite-class agnostic bound", "Fundamental theorem (6 ⇒ 1)", "Stability of RLM", "Hold-out validation"], answer: 2, why: "Stability bounds the generalisation gap of a specific algorithm directly." },
      { q: "The fundamental theorem is silent about …", options: ["Whether finite VC suffices for learnability", "The computational cost of ERM", "The agnostic sample complexity", "Whether ERM is a successful learner"], answer: 1, why: "Ch. 8: some PAC-learnable classes are not efficiently learnable." },
    ],
    tasks: [
      readme("0x0D-pass1_synthesis", "\n\nThe README of this project is the index of Pass 1: link every project directory 0x00–0x0C with a one-line summary each."),
      {
        title: "Exercise portfolio audit (≥ 30 SSBD exercises)",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`The plan's minimum to claim mastery is **30 solved SSBD exercises**. Create ´written/EXERCISES.md´ with **one line per solved exercise**, exactly in this format:

~~~
- 2.1 | 0x01-erm_finite_classes/written/2-ex_2_1.pdf | solved
- 2.2 | 0x01-erm_finite_classes/written/3-ex_2_2.pdf | solved
...
~~~

i.e. ´- <chapter>.<number> | <path relative to the repo root> | solved´. Only list exercises whose solution file actually exists and contains a heading for that exercise. The exercises assigned in T02–T13 add up to 29 named ones (2.1–2.3, 3.1–3.3, 4.1–4.2, 5.1–5.3, 6.1–6.5, 7.1–7.2, 9.1–9.2, 10.1–10.3, 12.1–12.3, 15.1–15.3) plus the 2 + 2 of your choice from Ch. 8 and Ch. 13–14 — that gives 33; you need at least 30 lines. Lines for exercises you did not finish must not appear.

Add a final section ´## Gaps´ listing assigned exercises you skipped and your plan to close them.`,
        files: ["written/EXERCISES.md"],
        checks: [
          { type: "exists", path: "written/EXERCISES.md" },
          { type: "nonempty", path: "written/EXERCISES.md", minLines: 30, label: "at least 30 lines" },
          { type: "contains", path: "written/EXERCISES.md", pattern: "^- \\d{1,2}\\.\\d{1,2} \\| \\S+ \\| solved\\s*$", label: "uses the required line format" },
          { type: "contains", path: "written/EXERCISES.md", pattern: "^- 6\\.5 \\|", label: "includes the VC exercises (6.5)" },
          { type: "contains", path: "written/EXERCISES.md", pattern: "^## Gaps", label: "has a Gaps section" },
        ],
      },
      {
        title: "Theorem notebook index",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Pass 1 deliverable: "a handwritten (or LaTeX) notebook with every major theorem re-proved in your own words". Create ´written/THEOREMS.md´ with **one line per theorem** you re-proved, in the format

~~~
- Thm 6.7 (Fundamental theorem) | 0x06-fundamental_theorem/written/1-thm_6_7.pdf
~~~

It must include at least: Hoeffding, Cor. 2.3, the agnostic finite-class bound, Lemma 4.2, Thm 5.1, Lemma 6.10, Thm 6.7, Thm 6.11, Thm 7.5, Thm 7.7, Thm 9.1, Thm 10.2, Thm 11.1, Thm 13.2, the RLM stability rate, Thm 14.8 and Thm 16.1 (≥ 17 lines).`,
        files: ["written/THEOREMS.md"],
        checks: [
          { type: "exists", path: "written/THEOREMS.md" },
          { type: "nonempty", path: "written/THEOREMS.md", minLines: 17, label: "at least 17 theorems listed" },
          { type: "contains", path: "written/THEOREMS.md", pattern: "6\\.11", label: "includes Theorem 6.11" },
          { type: "contains", path: "written/THEOREMS.md", pattern: "[Hh]oeffding", label: "includes Hoeffding" },
        ],
      },
      {
        title: "Essay: What is the Fundamental Theorem of Statistical Learning really saying?",
        type: "mandatory",
        kind: "written",
        points: 5,
        body: md`Write a **5-page** (≈ 2,500–3,000 words) essay, entirely from memory, and publish it on Medium or your blog. Submit the URL.

It must:
1. State the theorem (Thm 6.7 and the rates of Thm 6.8) precisely — LaTeX or clean notation.
2. Explain each equivalence in words a strong undergraduate can follow, including *why* finite VC dimension controls uniform convergence (Sauer + symmetrisation) and *why* infinite VC dimension kills learnability (NFL).
3. Discuss what the theorem does **not** say: computation (Ch. 8), distribution-dependent behaviour, non-ERM algorithms, settings beyond binary 0-1 loss, nonuniform learnability (Ch. 7).
4. Relate it to the algorithmic chapters: why do boosting, SVMs with kernels (infinite-dimensional!) and regularised SGD still generalise? (margins, stability.)
5. Close with an honest section: does the theorem explain why overparameterised neural networks generalise? (Zhang et al. 2016 — preview of Pass 2.)

Append (after the essay) a "Fact-check" section listing anything you corrected after consulting the book.`,
        deliverable: "link",
        rubric: "essay",
        criteria: [
          "Precise statement of Thm 6.7 (all six conditions) and the four rates of Thm 6.8",
          "Correct intuitive explanation of both deep directions (Sauer + symmetrisation; NFL on a shattered set)",
          "At least four distinct limitations of the theorem discussed correctly",
          "Connects margins/stability to generalisation of kernel SVMs and RLM, which have infinite-VC hypothesis spaces",
          "Overparameterisation discussion cites the random-label experiment and states what classical theory predicts",
          "Fact-check appendix present",
        ],
      },
      {
        title: "One-page Pass 1 summary",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File: ´written/pass1_summary.md´. The plan's week-12 deliverable: **one page** tying all of Pass 1 together.

Structure (strict): a dependency diagram (Mermaid or ASCII) from the probability tools (Markov → Hoeffding → union bound) through ERM / UC / VC / fundamental theorem to SRM, boosting, convex learning, stability, SGD and SVMs; then a table "result → rate → assumption → proof tool"; then five sentences: the five ideas you would keep if you forgot everything else.`,
        deliverable: "repo",
        files: ["written/pass1_summary.md"],
        rubric: "summary",
        criteria: [
          "Fits on one page and contains the dependency diagram",
          "Table rates are correct (log|H|/ε, log|H|/ε², d/ε², (d log(1/ε))/ε, Bρ/√T, ρB√(8/m), (ρ/γ)²/m-type margin rate)",
          "Each row names the true assumption (realizable/agnostic, bounded/Lipschitz loss, separability with margin)",
          "Five key ideas are genuinely distinct and non-trivial",
        ],
      },
      {
        title: "Closed-book Pass 1 exam",
        type: "advanced",
        kind: "written",
        points: 3,
        body: md`File: ´written/101-closed_book_exam.pdf´ (handwritten scan).

Write the 17 theorems of ´THEOREMS.md´ on cards, shuffle, draw **four**, and prove them in a single 3-hour closed-book sitting. Record which four you drew and the start/end times at the top. Afterwards add a post-mortem page with corrections. Repeat the draw if any of your four were from the same project.`,
        deliverable: "repo",
        files: ["written/101-closed_book_exam.pdf"],
        rubric: "proof",
        criteria: [
          "Four theorems from four different projects, drawn randomly, times recorded (≤ 3 h)",
          "Each proof complete at the level of the corresponding project's criteria",
          "Honest post-mortem with concrete corrections",
        ],
      },
    ],
  },
];
