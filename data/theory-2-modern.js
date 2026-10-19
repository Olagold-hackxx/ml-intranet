// Theory track — Pass 2: Modern Learning Theory (Stanford CS229M, Weeks 13–24 of the plan).
// Bodies use the md tag: String.raw semantics (LaTeX backslashes stay intact) and "‵" is turned into a backtick.
const md = (s, ...v) => String.raw(s, ...v).replaceAll("‵", "`");

const TRACK = "theory";
const PHASE = "Pass 2 — Modern Learning Theory";
const REPO = "ml-theory";

const R = {
  notes: { title: "Tengyu Ma — CS229M / STATS214 lecture notes (PDF)", url: "https://raw.githubusercontent.com/tengyuma/cs229m_notes/main/master.pdf" },
  course: { title: "Stanford STATS214 / CS229M — Machine Learning Theory (course page)", url: "https://web.stanford.edu/class/stats214/" },
  hdp: { title: "Vershynin — High-Dimensional Probability (book PDF)", url: "https://www.math.uci.edu/~rvershynin/papers/HDP-book/HDP-book.pdf" },
  bach: { title: "Bach — Learning Theory from First Principles (book PDF)", url: "https://www.di.ens.fr/~fbach/ltfp_book.pdf" },
  ssbd: { title: "Shalev-Shwartz & Ben-David — Understanding Machine Learning (book PDF)", url: "https://www.cs.huji.ac.il/~shais/UnderstandingMachineLearning/understanding-machine-learning-theory-algorithms.pdf" },
};

const WRITTEN_REQ = "Written work goes in written/ of the project directory: PDF, Markdown (with $LaTeX$ math) or LaTeX source accepted. Every theorem you prove must first be STATED precisely (assumptions, quantifiers, constants).";
const CODE_REQ = "Code: Python 3.10+, NumPy only (no SciPy, no scikit-learn); functions are tested in the browser with Pyodide.";

// Task 0 of every project: README with a theorem index (also guarantees a README exists in the dir).
function readmeTask(dir, extra) {
  return {
    title: "README & theorem index",
    type: "mandatory",
    kind: "code",
    points: 1,
    body: md`Create ‵${dir}/README.md‵ in repo ‵ml-theory‵. It is your index for the project and must contain:

1. A one-paragraph summary of what the project is about, in your own words.
2. A section ‵## Theorems‵ with the **precise statement** (in $\LaTeX$) of every theorem / lemma you prove in this project, each tagged with the file that contains its proof (e.g. ‵written/1-delta_method.pdf‵).
3. A section ‵## Files‵ listing every file in the directory with one line each.
${extra}

At least 150 words. Create the ‵written/‵ directory now (an empty ‵written/.gitkeep‵ is fine until the first proof is pushed).`,
    files: ["README.md", "written/"],
    checks: [
      { type: "readme", path: "README.md", minWords: 150 },
      { type: "contains", path: "README.md", pattern: "^#+\\s*Theorems", label: "has a '## Theorems' section" },
      { type: "contains", path: "README.md", pattern: "^#+\\s*Files", label: "has a '## Files' section" },
      { type: "exists", path: "written" },
    ],
  };
}

const IMPORT = (mod) => `import numpy as np\nfrom importlib import import_module\nm = import_module('${mod}')\n`;

export default [
  // ───────────────────────────────────────────────────────────── T15
  {
    id: "T15",
    track: TRACK,
    phase: PHASE,
    title: "Asymptotic Statistics & the MLE",
    days: 5,
    repo: REPO,
    dir: "0x0E-asymptotics_mle",
    sources: [
      { course: "CS229M", lectures: "Lec 1–2", topics: "Course overview; asymptotic statistics recap (CLT, Slutsky, delta method); asymptotic normality of the MLE / ERM; Fisher information" },
    ],
    resources: [
      R.notes,
      R.course,
      R.bach,
    ],
    concepts: ["Convergence in distribution & Slutsky's lemma", "Delta method", "Score function & Fisher information", "Asymptotic normality of the MLE", "Sandwich covariance (misspecified models)", "Asymptotic excess risk of ERM", "Cramér–Rao lower bound"],
    objectives: [
      "State the multivariate CLT, the continuous mapping theorem and Slutsky's lemma, and use them to prove the delta method",
      "Define Fisher information as the variance of the score and as the expected negative Hessian, and prove they coincide under regularity conditions",
      "Derive the asymptotic normality of the MLE, √n(θ̂ − θ*) ⇒ N(0, I(θ*)⁻¹), listing every assumption used",
      "Derive the sandwich covariance H⁻¹ΣH⁻¹ for a misspecified model / general ERM and the asymptotic excess risk tr(H⁻¹Σ)/(2n)",
      "Prove the Cramér–Rao bound and explain why the MLE is asymptotically efficient",
      "Explain why asymptotic results motivate (but cannot replace) the non-asymptotic bounds of the rest of Pass 2",
    ],
    requirements: [WRITTEN_REQ, CODE_REQ],
    quiz: [
      { q: "For a Bernoulli(p) model, the Fisher information of one observation is:", options: ["p(1−p)", "1/(p(1−p))", "1/p", "p/(1−p)"], answer: 1, why: "The score is x/p − (1−x)/(1−p); its variance is 1/(p(1−p))." },
      { q: "If √n(X̄ₙ − μ) ⇒ N(0, σ²) and μ ≠ 0, what is the asymptotic variance of √n(X̄ₙ² − μ²)?", options: ["σ²", "2μσ²", "4μ²σ²", "σ⁴"], answer: 2, why: "Delta method with g(x) = x², g'(μ) = 2μ, so the variance is g'(μ)²σ² = 4μ²σ²." },
      { q: "For a misspecified model, the asymptotic covariance of √n(θ̂ − θ*) for the MLE is:", options: ["I(θ*)⁻¹", "H⁻¹ΣH⁻¹ with H = E∇²ℓ, Σ = Cov(∇ℓ)", "Σ⁻¹", "H⁻²"], answer: 1, why: "Without well-specification, the information identity H = Σ fails and the sandwich form remains." },
      { q: "For a well-specified p-parameter model trained by MLE (log loss), the expected excess risk E[L(θ̂)] − L(θ*) is asymptotically:", options: ["p/n", "p/(2n)", "√(p/n)", "log p / n"], answer: 1, why: "tr(H⁻¹Σ)/(2n) with H = Σ = I(θ*) gives tr(I_p)/(2n) = p/(2n)." },
    ],
    tasks: [
      readmeTask("0x0E-asymptotics_mle", "4. A short ‵## Assumptions‵ section listing the regularity conditions you use for the MLE theorem (identifiability, interior θ*, smoothness, dominated derivatives, invertible information)."),
      {
        title: "The delta method",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`**Theorem (delta method).** Let $X_n \in \mathbb{R}^k$ satisfy $\sqrt{n}(X_n - \mu) \Rightarrow \mathcal{N}(0, \Sigma)$ and let $g:\mathbb{R}^k\to\mathbb{R}^m$ be differentiable at $\mu$ with Jacobian $J = Dg(\mu)$. Then
$$\sqrt{n}\big(g(X_n) - g(\mu)\big) \Rightarrow \mathcal{N}\big(0,\; J\Sigma J^\top\big).$$

Deliverables (‵written/1-delta_method.pdf‵, PDF / Markdown / LaTeX accepted):

1. State (no proof needed) the multivariate CLT, the continuous mapping theorem and **Slutsky's lemma**.
2. Prove the theorem. Handle the remainder carefully: write $g(X_n) - g(\mu) = J(X_n - \mu) + r(X_n)\,\|X_n-\mu\|$ with $r(x)\to 0$ as $x\to\mu$, and show $\sqrt n\, r(X_n)\|X_n - \mu\| \to 0$ in probability (you need $X_n \to \mu$ in probability first — prove it from the hypothesis).
3. Apply it: (a) $X_i \overset{iid}{\sim} \mathrm{Exp}(\lambda)$; find the limit law of $\sqrt n(\log \bar X_n + \log\lambda)$. (b) $X_i \sim \mathrm{Poisson}(\lambda)$; show $g(x) = 2\sqrt{x}$ is variance-stabilising.
4. Give a counter-example showing the conclusion fails (or degenerates) when $Dg(\mu) = 0$, and state the second-order delta method that fixes it.`,
        deliverable: "repo",
        files: ["written/1-delta_method.pdf"],
        rubric: "proof",
        criteria: [
          "States Slutsky's lemma and the continuous mapping theorem correctly (convergence in probability to a constant for Slutsky)",
          "Proves X_n → μ in probability from √n(X_n − μ) = O_P(1) before using differentiability",
          "Controls the Taylor remainder with an o_P(1)·O_P(1) argument and concludes via Slutsky",
          "Exp(λ) application gives asymptotic variance 1 for √n(log X̄_n + log λ); Poisson application gives variance 1 for 2√X̄_n",
          "Gives a valid degenerate example (e.g. g(x)=x² at μ=0) and the χ²-type second-order limit",
        ],
      },
      {
        title: "Fisher information: two definitions agree",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Let $\{p_\theta : \theta \in \Theta \subseteq \mathbb{R}^p\}$ be a parametric family with score $s_\theta(x) = \nabla_\theta \log p_\theta(x)$.

**Theorem.** Under regularity conditions (support independent of $\theta$; $\theta \mapsto p_\theta(x)$ twice continuously differentiable; differentiation under the integral sign allowed twice),
$$\mathbb{E}_\theta[s_\theta(X)] = 0, \qquad I(\theta) := \mathbb{E}_\theta\big[s_\theta(X)s_\theta(X)^\top\big] = -\,\mathbb{E}_\theta\big[\nabla^2_\theta \log p_\theta(X)\big].$$

Deliverables (‵written/2-fisher_information.pdf‵):

1. State precisely which domination condition justifies swapping $\nabla_\theta$ and $\int$, and prove both identities.
2. Compute $I(\theta)$ **both ways** and check equality for: Bernoulli$(p)$, Poisson$(\lambda)$, $\mathcal{N}(\mu,\sigma^2)$ with $\theta = (\mu, \sigma^2)$ (full $2\times 2$ matrix), and a canonical exponential family $p_\eta(x) = h(x)\exp(\eta^\top T(x) - A(\eta))$ (show $I(\eta) = \nabla^2 A(\eta)$).
3. Show the identity **fails** for $\mathrm{Uniform}(0, \theta)$ and explain which assumption breaks.
4. Show that under misspecification ($X \sim q \notin \{p_\theta\}$, evaluated at $\theta^* = \arg\min_\theta \mathrm{KL}(q\|p_\theta)$) the two matrices differ in general; give an explicit example.`,
        deliverable: "repo",
        files: ["written/2-fisher_information.pdf"],
        rubric: "proof",
        criteria: [
          "Proves E[s_θ] = 0 by differentiating ∫p_θ = 1 and states the domination condition used",
          "Proves Var(s_θ) = −E[∇² log p_θ] by differentiating a second time (product rule on ∇p_θ = p_θ s_θ)",
          "All four model computations correct, including the off-diagonal zero and I_σ²σ² = 1/(2σ⁴) for the Gaussian, and I(η) = ∇²A(η)",
          "Uniform(0,θ) counter-example identifies the θ-dependent support",
          "Gives a concrete misspecified example where E[ss^T] ≠ −E[∇² log p] at θ*",
        ],
      },
      {
        title: "Asymptotic normality of the MLE",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`Let $X_1,\dots,X_n \overset{iid}{\sim} p_{\theta^*}$ and $\hat\theta_n \in \arg\max_\theta \sum_i \log p_\theta(X_i)$.

**Theorem.** Assume (i) $\hat\theta_n \to \theta^*$ in probability (consistency), (ii) $\theta^*$ is in the interior of $\Theta$, (iii) $\theta\mapsto \log p_\theta(x)$ is $C^3$ on a neighbourhood $U$ of $\theta^*$ with $\sup_{\theta\in U}\|\nabla^3_\theta \log p_\theta(x)\| \le M(x)$, $\mathbb{E}M(X)<\infty$, (iv) $I(\theta^*)$ is finite and invertible. Then
$$\sqrt n\,(\hat\theta_n - \theta^*) \Rightarrow \mathcal{N}\big(0,\; I(\theta^*)^{-1}\big).$$

Deliverables (‵written/3-mle_normality.pdf‵):

1. Prove the theorem following CS229M Lec 2: Taylor-expand the empirical score $\nabla \hat L_n(\hat\theta_n) = 0$ around $\theta^*$; apply the **CLT** to $\sqrt n\,\nabla \hat L_n(\theta^*)$, the **LLN** to $\nabla^2 \hat L_n(\theta^*)$, bound the third-order term with (iii), and finish with **Slutsky**.
2. State exactly where each of (i)–(iv) is used.
3. Corollary: the Wald confidence interval $\hat\theta_j \pm z_{1-\alpha/2}\sqrt{[I(\hat\theta)^{-1}]_{jj}/n}$ has asymptotic coverage $1-\alpha$ (prove using the delta method / Slutsky and continuity of $I$).
4. One paragraph: what this theorem does **not** tell you (no finite-$n$ guarantee, non-uniform in $\theta^*$, needs consistency as an input).`,
        deliverable: "repo",
        files: ["written/3-mle_normality.pdf"],
        rubric: "proof",
        criteria: [
          "Writes 0 = ∇L̂(θ*) + ∇²L̂(θ*)(θ̂−θ*) + remainder and isolates √n(θ̂−θ*)",
          "Uses CLT on the score (mean 0, covariance I(θ*)) and LLN on the Hessian (limit −I(θ*) for log-likelihood)",
          "Bounds the remainder using the dominating function M(x) and consistency (o_P(1) term)",
          "Concludes with Slutsky and invertibility of I(θ*); cites where every assumption is used",
          "Wald interval coverage argument is correct and the limitations paragraph mentions non-uniformity / finite-sample gap",
        ],
      },
      {
        title: "Asymptotic excess risk of ERM (sandwich formula)",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Generalise the previous task from log-likelihood to an arbitrary smooth loss, as in CS229M Lec 2. Let $L(\theta) = \mathbb{E}\,\ell(Z;\theta)$, $\theta^* = \arg\min L$, $\hat\theta = \arg\min \frac1n\sum_i \ell(Z_i;\theta)$, $H = \nabla^2 L(\theta^*) \succ 0$, $\Sigma = \mathrm{Cov}(\nabla \ell(Z;\theta^*))$.

**Theorem.** Under the analogous regularity conditions,
$$\sqrt n(\hat\theta - \theta^*) \Rightarrow \mathcal{N}(0, H^{-1}\Sigma H^{-1}), \qquad n\big(L(\hat\theta) - L(\theta^*)\big) \Rightarrow \tfrac12 W^\top H W,\quad W\sim\mathcal N(0,H^{-1}\Sigma H^{-1}),$$
and in particular $\lim_{n\to\infty} n\,\mathbb{E}[L(\hat\theta) - L(\theta^*)] = \tfrac12\operatorname{tr}(H^{-1}\Sigma)$ (assume uniform integrability for the expectation).

Deliverables (‵written/4-erm_asymptotics.pdf‵):

1. Prove both limits (second-order Taylor expansion of $L$ at $\theta^*$ plus continuous mapping).
2. Show that for a **well-specified** MLE $H = \Sigma = I(\theta^*)$ and the excess risk is $\frac{p}{2n}$.
3. Compute $H$, $\Sigma$ and $\operatorname{tr}(H^{-1}\Sigma)/(2n)$ for linear regression $y = x^\top\theta^* + \varepsilon$ with squared loss, $\mathbb{E}xx^\top = \Sigma_x$, $\mathrm{Var}(\varepsilon \mid x) = \sigma^2$; then redo it with heteroscedastic noise $\mathrm{Var}(\varepsilon\mid x) = \sigma^2(x)$.
4. Compare the $1/n$ asymptotic rate to the $1/\sqrt n$ rate given by the uniform-convergence bounds of Pass 1 — why the difference? (one paragraph)`,
        deliverable: "repo",
        files: ["written/4-erm_asymptotics.pdf"],
        rubric: "derivation",
        criteria: [
          "Derives √n(θ̂−θ*) ⇒ N(0, H⁻¹ΣH⁻¹) from the first-order condition",
          "Expands L(θ̂) − L(θ*) = ½(θ̂−θ*)ᵀH(θ̂−θ*) + o_P(1/n) and gets the limiting mean ½ tr(H⁻¹Σ)",
          "Shows the information identity H = Σ in the well-specified case and obtains p/(2n)",
          "Linear-regression computation gives σ²p/(2n) (homoscedastic) and the sandwich form for heteroscedastic noise",
          "Explains the 1/n vs 1/√n gap (local quadratic curvature / fast rates vs worst-case uniform deviations)",
        ],
      },
      {
        title: "Cramér–Rao and asymptotic efficiency",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`**Theorem (Cramér–Rao).** Let $T(X)$ be an unbiased estimator of $\psi(\theta)\in\mathbb{R}$ based on $n$ i.i.d. observations from a regular family. Then
$$\mathrm{Var}_\theta(T) \;\ge\; \frac{\nabla\psi(\theta)^\top I(\theta)^{-1}\nabla\psi(\theta)}{n}.$$

Deliverables (‵written/5-cramer_rao.pdf‵): (1) prove it with the covariance inequality (Cauchy–Schwarz between $T$ and the total score); (2) show the MLE of the previous task attains the bound asymptotically; (3) give one example where an unbiased estimator attains it exactly for finite $n$ and one where no unbiased estimator does (or where a biased estimator has lower MSE — e.g. James–Stein or shrinkage for a 1-D Gaussian with prior knowledge).`,
        deliverable: "repo",
        files: ["written/5-cramer_rao.pdf"],
        rubric: "proof",
        criteria: [
          "Shows Cov(T, S_n) = ∇ψ(θ) by differentiating E_θ[T] under the integral",
          "Applies Cauchy–Schwarz / covariance inequality with the total score S_n whose covariance is nI(θ)",
          "Connects the bound to the asymptotic covariance I(θ*)⁻¹ of the MLE",
          "Gives a correct finite-n attaining example (e.g. X̄ for a Gaussian mean) and a valid biased-estimator / non-attaining example",
        ],
      },
      {
        title: "Monte Carlo check: Fisher information & MLE normality",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File ‵100-fisher_mc.py‵ (NumPy only). For the **Poisson($\lambda$)** model, write:

- ‵score_variance(x, lam)‵ — ‵x‵ is a 1-D array of observations. Return the empirical mean of the squared score $\big(\frac{x}{\lambda} - 1\big)^2$ as a Python float.
- ‵neg_hessian_mean(x, lam)‵ — return the empirical mean of $-\partial^2_\lambda \log p_\lambda(x) = x/\lambda^2$ as a float.
- ‵mle_z_scores(lam, n, n_trials, rng)‵ — simulate ‵n_trials‵ independent data sets of size ‵n‵ with ‵rng.poisson(lam, size=(n_trials, n))‵, compute the MLE $\hat\lambda$ of each, and return the 1-D array (shape ‵(n_trials,)‵) of standardised errors $\sqrt{n\,I(\lambda)}\,(\hat\lambda - \lambda)$ where $I(\lambda)$ is the Fisher information of **one** observation.

No loops over samples (a loop over nothing at all is expected: everything is vectorised). In ‵README.md‵, add a short paragraph with the numbers you observe for $\lambda = 4$, $n = 50$: mean and standard deviation of the z-scores, and both Fisher estimates.

‵‵‵python
import numpy as np
from importlib import import_module
m = import_module('100-fisher_mc')
x = np.random.default_rng(0).poisson(3.0, 100000)
print(m.score_variance(x, 3.0), m.neg_hessian_mean(x, 3.0))   # both ≈ 1/3
z = m.mle_z_scores(4.0, 50, 4000, np.random.default_rng(1))
print(z.shape, z.mean(), z.std())                               # (4000,) ≈ 0 ≈ 1
‵‵‵`,
        files: ["100-fisher_mc.py"],
        checks: [
          { type: "exists", path: "100-fisher_mc.py" },
          { type: "defines", path: "100-fisher_mc.py", names: ["score_variance", "neg_hessian_mean", "mle_z_scores"] },
          { type: "not_contains", path: "100-fisher_mc.py", pattern: "import\\s+scipy|from\\s+scipy|sklearn", label: "NumPy only" },
          {
            type: "py_test", files: ["100-fisher_mc.py"], label: "both Fisher definitions match the formulas and ≈ 1/λ",
            code: IMPORT("100-fisher_mc") + md`rng = np.random.default_rng(0)
x = rng.poisson(3.0, 200000)
sv = float(m.score_variance(x, 3.0))
nh = float(m.neg_hessian_mean(x, 3.0))
assert np.isclose(sv, np.mean((x / 3.0 - 1.0) ** 2), rtol=1e-8), sv
assert np.isclose(nh, np.mean(x / 9.0), rtol=1e-8), nh
assert abs(sv - 1 / 3) < 0.01 and abs(nh - 1 / 3) < 0.01, (sv, nh)
x2 = rng.poisson(0.7, 5)
assert np.isclose(float(m.score_variance(x2, 0.7)), np.mean((x2 / 0.7 - 1) ** 2))`,
          },
          {
            type: "py_test", files: ["100-fisher_mc.py"], label: "MLE z-scores are approximately N(0, 1)",
            code: IMPORT("100-fisher_mc") + md`z = np.asarray(m.mle_z_scores(4.0, 50, 4000, np.random.default_rng(1)), dtype=float)
assert z.shape == (4000,), z.shape
assert abs(z.mean()) < 0.08, z.mean()
assert 0.9 < z.std() < 1.1, z.std()
z2 = np.asarray(m.mle_z_scores(0.5, 200, 3000, np.random.default_rng(2)), dtype=float)
assert abs(z2.mean()) < 0.1 and 0.9 < z2.std() < 1.1, (z2.mean(), z2.std())`,
          },
        ],
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── T16
  {
    id: "T16",
    track: TRACK,
    phase: PHASE,
    title: "Concentration Inequalities",
    days: 7,
    repo: REPO,
    dir: "0x0F-concentration",
    sources: [
      { course: "CS229M", lectures: "Lec 3", topics: "Concentration: Chernoff recipe, sub-Gaussian and sub-exponential variables, Hoeffding, Bernstein, McDiarmid" },
    ],
    resources: [
      R.notes,
      { title: "Vershynin — High-Dimensional Probability, Ch. 2 (book PDF)", url: R.hdp.url },
      R.bach,
      R.course,
    ],
    concepts: ["Chernoff bound (MGF recipe)", "Sub-Gaussian random variables & ψ₂ norm", "Hoeffding's lemma & inequality", "Sub-exponential random variables & ψ₁ norm", "Bernstein & Bennett inequalities", "Bounded differences / McDiarmid", "Maximal inequality for sub-Gaussians"],
    objectives: [
      "Apply the Chernoff recipe (Markov on e^{λX}, bound the MGF, optimise λ) to derive a tail bound from any MGF bound",
      "Prove Hoeffding's lemma and Hoeffding's inequality with explicit constants",
      "Explain the equivalent characterisations of sub-Gaussianity (tails, moments, MGF) and prove at least one direction",
      "Prove Bernstein's and Bennett's inequalities and explain the two regimes (Gaussian vs exponential tail)",
      "Prove McDiarmid's inequality via the Doob martingale and Azuma–Hoeffding",
      "Bound E max of N sub-Gaussian variables by σ√(2 log N)",
    ],
    requirements: [WRITTEN_REQ, CODE_REQ, "Vershynin exercises: cite the exercise numbers from the version of the book you use (the PDF linked in resources)."],
    quiz: [
      { q: "A Rademacher variable (±1 with probability ½) is sub-Gaussian with variance proxy:", options: ["1/4", "1/2", "1", "2"], answer: 2, why: "cosh(λ) ≤ e^{λ²/2}, so σ² = 1 (Hoeffding's lemma on [−1, 1] also gives (b−a)²/4 = 1)." },
      { q: "Hoeffding's lemma: a mean-zero X ∈ [a, b] satisfies E e^{λX} ≤ ?", options: ["e^{λ²(b−a)²/2}", "e^{λ²(b−a)²/8}", "e^{λ(b−a)}", "e^{λ²(b−a)/4}"], answer: 1, why: "The variance proxy is (b−a)²/4, so the MGF bound is e^{λ²(b−a)²/8}." },
      { q: "Why can Bernstein's inequality be much tighter than Hoeffding's for averages of Bernoulli(p) with small p?", options: ["It uses the range instead of the variance", "For small deviations its exponent scales like n t²/(2σ²) with σ² = p(1−p) ≪ (b−a)²/4", "It needs fewer samples to hold", "It applies to dependent data"], answer: 1, why: "Bernstein adapts to the variance; Hoeffding only sees the range." },
      { q: "McDiarmid: if changing the i-th argument changes f by at most cᵢ, then P(f − Ef ≥ t) ≤", options: ["exp(−t²/Σcᵢ²)", "exp(−2t²/Σcᵢ²)", "exp(−2t²/(Σcᵢ)²)", "Σcᵢ²/t²"], answer: 1, why: "Azuma–Hoeffding on the Doob martingale whose increments lie in intervals of length cᵢ." },
      { q: "If g ~ N(0,1), then g² − 1 is:", options: ["sub-Gaussian", "sub-exponential but not sub-Gaussian", "neither", "bounded"], answer: 1, why: "Its MGF is finite only for λ < 1/2 and its tail decays like e^{−t/2}, the hallmark of sub-exponential variables." },
    ],
    tasks: [
      readmeTask("0x0F-concentration", "4. A table ‵| inequality | assumptions | bound |‵ with every inequality of this project (this is the seed of your T26 cheat sheet)."),
      {
        title: "Chernoff recipe, Hoeffding's lemma and Hoeffding's inequality",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`**Definition.** $X$ is $\sigma$-sub-Gaussian if $\mathbb{E}\,e^{\lambda(X-\mathbb{E}X)} \le e^{\lambda^2\sigma^2/2}$ for all $\lambda\in\mathbb{R}$.

**Theorem (Hoeffding).** If $X_1,\dots,X_n$ are independent with $X_i\in[a_i,b_i]$ a.s., then for all $t\ge0$
$$\mathbb{P}\Big(\sum_{i=1}^n (X_i - \mathbb{E}X_i) \ge t\Big) \le \exp\Big(-\frac{2t^2}{\sum_i (b_i-a_i)^2}\Big).$$

Deliverables (‵written/1-hoeffding.pdf‵):

1. **Chernoff recipe**: prove $\mathbb{P}(X - \mathbb{E}X \ge t) \le \inf_{\lambda>0} e^{-\lambda t}\,\mathbb{E}e^{\lambda(X-\mathbb{E}X)}$ and deduce the tail $e^{-t^2/(2\sigma^2)}$ for $\sigma$-sub-Gaussian $X$.
2. **Hoeffding's lemma**: prove that a mean-zero $X\in[a,b]$ is $\frac{b-a}{2}$-sub-Gaussian. Use $\psi(\lambda) = \log\mathbb{E}e^{\lambda X}$, show $\psi(0)=\psi'(0)=0$ and $\psi''(\lambda) \le (b-a)^2/4$ (variance of a tilted distribution supported on $[a,b]$), then Taylor.
3. Sums: if $X_i$ independent and $\sigma_i$-sub-Gaussian then $\sum_i X_i$ is $\sqrt{\sum\sigma_i^2}$-sub-Gaussian. Conclude Hoeffding.
4. **Equivalences** (Vershynin Prop. 2.5.2): prove that the MGF condition implies $\mathbb{P}(|X|\ge t)\le 2e^{-t^2/(2\sigma^2)}$ and that this tail bound implies $(\mathbb{E}|X|^p)^{1/p} \le C\sigma\sqrt p$ for all $p\ge1$ (compute the integral $\int_0^\infty p t^{p-1}\mathbb{P}(|X|\ge t)\,dt$ with the Gamma function).
5. Two-sided version and the sample-complexity statement: $n \ge \frac{(b-a)^2\log(2/\delta)}{2\varepsilon^2}$ suffices for $|\bar X_n - \mu|\le\varepsilon$ w.p. $1-\delta$.`,
        deliverable: "repo",
        files: ["written/1-hoeffding.pdf"],
        rubric: "proof",
        criteria: [
          "Chernoff bound derived from Markov applied to e^{λ(X−EX)} and optimised at λ = t/σ²",
          "Hoeffding's lemma: shows ψ''(λ) is the variance of the exponentially tilted law and bounds it by (b−a)²/4",
          "Uses independence to factor the MGF of the sum (variance proxies add)",
          "Tail ⇒ moment direction computed via the layer-cake formula with a Γ(p/2) bound giving C√p growth",
          "Correct two-sided bound with factor 2 and correct sample-complexity inversion",
        ],
      },
      {
        title: "Sub-exponential variables, Bernstein and Bennett",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`**Definition.** $X$ is $(\nu,\alpha)$-sub-exponential if $\mathbb{E}\,e^{\lambda(X-\mathbb{E}X)}\le e^{\lambda^2\nu^2/2}$ for all $|\lambda| < 1/\alpha$.

**Theorem (Bernstein).** If $X_1,\dots,X_n$ are independent, $|X_i - \mathbb{E}X_i|\le b$ a.s. and $\frac1n\sum_i\mathrm{Var}(X_i) = \sigma^2$, then
$$\mathbb{P}\Big(\frac1n\sum_i (X_i-\mathbb{E}X_i)\ge t\Big)\le \exp\Big(-\frac{n t^2}{2(\sigma^2 + bt/3)}\Big).$$

**Theorem (Bennett).** Under the same assumptions, with $h(u) = (1+u)\log(1+u) - u$,
$$\mathbb{P}\Big(\sum_i (X_i-\mathbb{E}X_i)\ge t\Big)\le \exp\Big(-\frac{n\sigma^2}{b^2}\,h\Big(\frac{bt}{n\sigma^2}\Big)\Big).$$

Deliverables (‵written/2-bernstein_bennett.pdf‵):

1. Prove the sub-exponential tail bound $\mathbb{P}(X-\mathbb{E}X\ge t)\le \exp\!\big(-\tfrac12\min(t^2/\nu^2,\, t/\alpha)\big)$ via the Chernoff recipe restricted to $|\lambda|<1/\alpha$ (two cases).
2. Show $g^2$ is sub-exponential for $g\sim\mathcal N(0,1)$ (compute the MGF exactly and find valid $(\nu,\alpha)$), and that it is **not** sub-Gaussian.
3. Prove **Bennett**: bound $\mathbb{E}e^{\lambda Y}\le \exp\big(\mathrm{Var}(Y)\,\frac{e^{\lambda b}-1-\lambda b}{b^2}\big)$ for $Y\le b$ mean zero (use that $(e^{u}-1-u)/u^2$ is increasing), then optimise $\lambda$ exactly.
4. Derive **Bernstein** from Bennett using $h(u)\ge \frac{u^2}{2(1+u/3)}$ (prove this inequality).
5. Discuss the two regimes: for $t\lesssim \sigma^2/b$ Bernstein behaves like a Gaussian tail with variance $\sigma^2$; for large $t$ like an exponential tail. Compare numerically with Hoeffding for Bernoulli$(0.01)$ averages, $n = 1000$, $t = 0.01$.`,
        deliverable: "repo",
        files: ["written/2-bernstein_bennett.pdf"],
        rubric: "proof",
        criteria: [
          "Sub-exponential tail: optimal λ = t/ν² when t ≤ ν²/α and λ = 1/α otherwise, giving the min(·,·) exponent",
          "Computes E e^{λ(g²−1)} = e^{−λ}/√(1−2λ) and gives valid parameters (e.g. ν = 2, α = 4)",
          "Bennett: MGF bound via monotonicity of (e^u − 1 − u)/u², then exact optimisation λ = log(1 + bt/(nσ²))/b",
          "Proves h(u) ≥ u²/(2(1+u/3)) (e.g. by comparing derivatives) and deduces Bernstein",
          "Numerical comparison shows Bernstein/Bennett orders of magnitude tighter than Hoeffding in the low-variance case",
        ],
      },
      {
        title: "McDiarmid's inequality (bounded differences)",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`**Theorem (McDiarmid).** Let $X_1,\dots,X_n$ be independent and $f$ satisfy $|f(x_1,\dots,x_i,\dots,x_n) - f(x_1,\dots,x_i',\dots,x_n)|\le c_i$ for all $i$ and all arguments. Then
$$\mathbb{P}\big(f(X) - \mathbb{E}f(X)\ge t\big)\le \exp\Big(-\frac{2t^2}{\sum_i c_i^2}\Big).$$

Deliverables (‵written/3-mcdiarmid.pdf‵):

1. Define the Doob martingale $Z_k = \mathbb{E}[f(X)\mid X_1,\dots,X_k]$ and the increments $D_k = Z_k - Z_{k-1}$.
2. Show that conditionally on $X_{1:k-1}$, $D_k$ lies in an interval of length $\le c_k$ (where exactly is independence used?).
3. Prove **Azuma–Hoeffding** by iterated conditioning + conditional Hoeffding's lemma, and conclude.
4. Application (needed in T17): for a class $\mathcal F$ of functions $[0,1]$-valued, show $\Phi(S) = \sup_{f\in\mathcal F}\big(\mathbb{E}f - \frac1n\sum_i f(Z_i)\big)$ satisfies bounded differences with $c_i = 1/n$, and write the resulting high-probability bound.
5. Show the bound is tight up to constants for $f = \frac1n\sum X_i$ with Rademacher $X_i$ (compare with the CLT).`,
        deliverable: "repo",
        files: ["written/3-mcdiarmid.pdf"],
        rubric: "proof",
        criteria: [
          "Correct Doob martingale construction with Z_0 = Ef and Z_n = f(X)",
          "Shows D_k ∈ [L_k, U_k] with U_k − L_k ≤ c_k using independence of X_k from X_{1:k−1}",
          "Azuma–Hoeffding via tower property: E[e^{λ Z_n}] ≤ e^{λ²Σc_k²/8} e^{λ Z_0}",
          "Applies McDiarmid to the supremum of the empirical process with c_i = 1/n and gets sqrt(log(1/δ)/(2n))",
        ],
      },
      {
        title: "Three exercises from Vershynin, Chapter 2",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Solve **at least three** exercises from Vershynin, *High-Dimensional Probability*, Chapter 2 (Sections 2.5–2.8). They must cover the three themes below; cite the exercise / proposition numbers from the linked PDF.

1. **Maximal inequality.** If $X_1,\dots,X_N$ are (not necessarily independent) mean-zero $\sigma$-sub-Gaussian, then $\mathbb{E}\max_{i\le N} X_i \le \sigma\sqrt{2\log N}$; and if they are i.i.d. $\mathcal{N}(0,1)$, $\mathbb{E}\max_i X_i \ge c\sqrt{\log N}$.
2. **Centering / ψ₂-norm calculus.** $\|X - \mathbb{E}X\|_{\psi_2}\le C\|X\|_{\psi_2}$; and $\|\cdot\|_{\psi_2}$ is a norm (prove the triangle inequality).
3. **Products.** If $X,Y$ are sub-Gaussian then $XY$ is sub-exponential with $\|XY\|_{\psi_1}\le\|X\|_{\psi_2}\|Y\|_{\psi_2}$; deduce a Bernstein-type bound for $\frac1n\sum_i (g_i^2 - 1)$, $g_i$ i.i.d. $\mathcal N(0,1)$.

File ‵written/4-vershynin_ch2.pdf‵. Full solutions, not sketches.`,
        deliverable: "repo",
        files: ["written/4-vershynin_ch2.pdf"],
        rubric: "proof",
        criteria: [
          "Maximal inequality via Jensen on exp(λ E max) ≤ Σ E e^{λX_i} ≤ N e^{λ²σ²/2} and optimising λ",
          "Gaussian lower bound for E max argued correctly (e.g. via P(g ≥ t) ≥ c e^{−t²/2}/t and independence)",
          "ψ₂ triangle inequality uses convexity of x ↦ e^{x²} (or an equivalent valid argument)",
          "Product bound uses ab ≤ (a² + b²)/2 after normalisation and yields the ψ₁ bound",
          "Exercise numbers are cited from the linked edition",
        ],
      },
      {
        title: "Tail bounds vs simulation",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File ‵100-concentration.py‵ (NumPy only, standard library ‵math‵ allowed). All bounds are **one-sided** tail bounds for the sample mean.

- ‵hoeffding_bound(n, t, a, b)‵ → $\exp(-2nt^2/(b-a)^2)$
- ‵bernstein_bound(n, t, sigma2, M)‵ → $\exp\big(-\frac{nt^2}{2(\sigma^2 + Mt/3)}\big)$ where $|X_i - \mu|\le M$
- ‵bennett_bound(n, t, sigma2, M)‵ → $\exp\big(-\frac{n\sigma^2}{M^2}h(\frac{Mt}{\sigma^2})\big)$, $h(u) = (1+u)\log(1+u)-u$
- ‵empirical_tail(X, mu, t)‵ — ‵X‵ has shape ‵(trials, n)‵ (each row one sample of size ‵n‵); return the fraction of rows whose mean satisfies $\bar X - \mu \ge t$, as a float.

Scalars in, float out for the three bounds. In ‵README.md‵, add a table comparing the three bounds with the empirical tail for Bernoulli$(0.05)$ averages, $n = 100$, $t \in \{0.02, 0.05, 0.1\}$.

‵‵‵python
m = import_module('100-concentration')
p = 0.05
print(m.hoeffding_bound(100, 0.05, 0, 1), m.bernstein_bound(100, 0.05, p*(1-p), 1-p), m.bennett_bound(100, 0.05, p*(1-p), 1-p))
X = (np.random.default_rng(0).random((20000, 100)) < p).astype(float)
print(m.empirical_tail(X, p, 0.05))     # ≈ 0.03
‵‵‵`,
        files: ["100-concentration.py"],
        checks: [
          { type: "exists", path: "100-concentration.py" },
          { type: "defines", path: "100-concentration.py", names: ["hoeffding_bound", "bernstein_bound", "bennett_bound", "empirical_tail"] },
          { type: "not_contains", path: "100-concentration.py", pattern: "import\\s+scipy|from\\s+scipy", label: "no SciPy" },
          {
            type: "py_test", files: ["100-concentration.py"], label: "bound formulas are exact",
            code: IMPORT("100-concentration") + md`import math
for (n, t, a, b) in [(100, 0.05, 0.0, 1.0), (10, 0.3, -1.0, 2.0), (1000, 0.01, 0.0, 1.0)]:
    assert np.isclose(float(m.hoeffding_bound(n, t, a, b)), math.exp(-2 * n * t * t / (b - a) ** 2), rtol=1e-9)
h = lambda u: (1 + u) * math.log(1 + u) - u
for (n, t, s2, M) in [(100, 0.05, 0.0475, 0.95), (50, 0.2, 0.25, 0.5), (1000, 0.01, 0.0099, 0.99)]:
    assert np.isclose(float(m.bernstein_bound(n, t, s2, M)), math.exp(-n * t * t / (2 * (s2 + M * t / 3))), rtol=1e-9)
    assert np.isclose(float(m.bennett_bound(n, t, s2, M)), math.exp(-n * s2 / M ** 2 * h(M * t / s2)), rtol=1e-9)
    assert float(m.bennett_bound(n, t, s2, M)) <= float(m.bernstein_bound(n, t, s2, M)) + 1e-15`,
          },
          {
            type: "py_test", files: ["100-concentration.py"], label: "empirical tail is correct and below the bounds",
            code: IMPORT("100-concentration") + md`p = 0.05
X = (np.random.default_rng(0).random((20000, 100)) < p).astype(float)
for t in (0.02, 0.05, 0.1):
    e = float(m.empirical_tail(X, p, t))
    ref = float(np.mean(X.mean(axis=1) - p >= t))
    assert abs(e - ref) < 1e-12, (t, e, ref)
    assert e <= float(m.bennett_bound(100, t, p * (1 - p), 1 - p)) + 0.005
    assert e <= float(m.hoeffding_bound(100, t, 0.0, 1.0)) + 0.005`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── T17
  {
    id: "T17",
    track: TRACK,
    phase: PHASE,
    title: "Uniform Convergence & Rademacher Complexity",
    days: 6,
    repo: REPO,
    dir: "0x10-rademacher",
    sources: [
      { course: "CS229M", lectures: "Lec 4", topics: "Uniform convergence, symmetrization, Rademacher complexity, generalization bounds, linear classes" },
    ],
    resources: [
      R.notes,
      { title: "SSBD Ch. 26 — Rademacher complexities (book PDF)", url: R.ssbd.url },
      { title: "Bartlett & Mendelson (2002) — Rademacher and Gaussian Complexities (JMLR)", url: "https://www.jmlr.org/papers/volume3/bartlett02a/bartlett02a.pdf" },
      R.bach,
    ],
    concepts: ["Empirical process sup_f (E f − Ê_n f)", "Symmetrization with a ghost sample", "Empirical vs expected Rademacher complexity", "Rademacher generalization bound", "Massart's finite-class lemma", "Rademacher complexity of ℓ2 / ℓ1 linear classes", "Khintchine's inequality"],
    objectives: [
      "Prove the symmetrization inequality E sup_f (E f − Ê_n f) ≤ 2 R_n(F) step by step",
      "Combine symmetrization with McDiarmid to prove the Rademacher generalization bound (expected and empirical versions)",
      "Prove Massart's lemma and use it with Sauer's lemma to recover the VC bound of Pass 1",
      "Compute the Rademacher complexity of ℓ2- and ℓ1-constrained linear classes and explain the √d vs log d contrast",
      "Use Rademacher calculus (scaling, sums, convex hulls) without re-deriving it",
      "Estimate empirical Rademacher complexity numerically and compare with the closed-form bounds",
    ],
    requirements: [WRITTEN_REQ, CODE_REQ],
    quiz: [
      { q: "The symmetrization inequality bounds E sup_f (E f − Ê_n f) by:", options: ["R_n(F)", "2 R_n(F)", "R_n(F)/2", "√(R_n(F))"], answer: 1, why: "The ghost sample plus sign swapping gives a factor 2." },
      { q: "Massart's lemma for a finite set A ⊂ ℝⁿ of N vectors gives R_S(A) ≤", options: ["max‖a‖₂ √(2 log N)/n", "max‖a‖₁ log N/n", "√(N/n)", "max‖a‖∞ N/n"], answer: 0, why: "Maximal inequality for sub-Gaussian variables ⟨σ, a⟩ with variance proxy ‖a‖₂²." },
      { q: "For F = {x ↦ ⟨w, x⟩ : ‖w‖₂ ≤ B}, the empirical Rademacher complexity is at most:", options: ["B max‖xᵢ‖/n", "B √(Σ‖xᵢ‖₂²)/n", "B d/n", "B √(d log n / n)"], answer: 1, why: "Cauchy–Schwarz then Jensen: (B/n) E‖Σσᵢxᵢ‖ ≤ (B/n) √(Σ‖xᵢ‖²)." },
      { q: "R_S(conv F) compared with R_S(F):", options: ["It is larger by a factor log|F|", "It is equal", "It is smaller", "It is undefined for infinite F"], answer: 1, why: "A linear function's supremum over a convex hull is attained at the extreme points." },
    ],
    tasks: [
      readmeTask("0x10-rademacher", "4. A paragraph comparing the VC bound of Pass 1 (Weeks 5–6, SSBD Ch. 6) with the Rademacher bound of this project: which is tighter for linear classes with bounded norm and why."),
      {
        title: "The symmetrization argument",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Let $\mathcal F$ be a class of functions $\mathcal Z\to\mathbb R$, $Z_1,\dots,Z_n$ i.i.d., $\hat{\mathbb E}_n f = \frac1n\sum_i f(Z_i)$, and
$$R_n(\mathcal F) = \mathbb{E}_{Z,\sigma}\Big[\sup_{f\in\mathcal F}\frac1n\sum_{i=1}^n\sigma_i f(Z_i)\Big].$$

**Theorem.** $\displaystyle \mathbb{E}\Big[\sup_{f\in\mathcal F}\big(\mathbb{E}f - \hat{\mathbb E}_n f\big)\Big]\le 2R_n(\mathcal F)$ and $\displaystyle \mathbb{E}\Big[\sup_{f\in\mathcal F}\big|\mathbb{E}f - \hat{\mathbb E}_n f\big|\Big]\ge \tfrac12 R_n(\mathcal F) - \sup_f\frac{|\mathbb E f|}{2\sqrt n}$.

Deliverables (‵written/1-symmetrization.pdf‵): prove the upper bound with a ghost sample $Z'$ — justify (a) $\mathbb Ef = \mathbb E_{Z'}\hat{\mathbb E}'_n f$, (b) $\sup\mathbb E\le\mathbb E\sup$ (Jensen), (c) the **exchangeability** step that inserts $\sigma_i$, (d) splitting the supremum. Then prove the lower bound (desymmetrization) and explain in two sentences why it shows Rademacher complexity is the "right" quantity. Address measurability by assuming $\mathcal F$ countable or say how you handle it.`,
        deliverable: "repo",
        files: ["written/1-symmetrization.pdf"],
        rubric: "proof",
        criteria: [
          "Introduces an independent ghost sample and moves the expectation over Z' outside the sup via Jensen",
          "Justifies that (f(Z_i) − f(Z'_i)) and σ_i(f(Z_i) − f(Z'_i)) have the same joint law (swapping Z_i ↔ Z'_i)",
          "Splits sup of a sum into a sum of sups and uses −σ =ᵈ σ to obtain 2R_n",
          "Lower bound proof is correct, including the centring term",
          "Mentions how measurability of the supremum is handled",
        ],
      },
      {
        title: "Generalization bound via Rademacher complexity",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`**Theorem.** Let $\mathcal F$ be a class of functions $\mathcal Z\to[0,1]$. For any $\delta\in(0,1)$, with probability at least $1-\delta$ over $S = (Z_1,\dots,Z_n)$, for all $f\in\mathcal F$:
$$\mathbb Ef \le \hat{\mathbb E}_n f + 2R_n(\mathcal F) + \sqrt{\frac{\log(1/\delta)}{2n}}, \qquad \mathbb Ef \le \hat{\mathbb E}_n f + 2R_S(\mathcal F) + 3\sqrt{\frac{\log(2/\delta)}{2n}},$$
where $R_S(\mathcal F) = \mathbb E_\sigma\sup_f\frac1n\sum_i\sigma_i f(Z_i)$ is the empirical Rademacher complexity.

Deliverables (‵written/2-rademacher_bound.pdf‵):

1. Prove the first inequality: McDiarmid on $\Phi(S) = \sup_f(\mathbb Ef - \hat{\mathbb E}_nf)$ + symmetrization.
2. Prove the second: McDiarmid a second time on $S\mapsto R_S(\mathcal F)$ (bounded differences $1/n$), union bound with $\delta/2$ each.
3. Corollary for classification: with $\mathcal F = \{(x,y)\mapsto \mathbf 1[h(x)\ne y] : h\in\mathcal H\}$, show $R_n(\mathcal F) = \frac12 R_n(\mathcal H)$ for $\pm1$-valued $\mathcal H$ and write the excess-risk bound for ERM: $L(\hat h) - \min_h L(h)\le 4R_n(\mathcal F) + \sqrt{2\log(2/\delta)/n}$.
4. Recover the Pass 1 VC bound: Massart + Sauer ⇒ $R_n(\mathcal H)\le\sqrt{2d\log(en/d)/n}$.`,
        deliverable: "repo",
        files: ["written/2-rademacher_bound.pdf"],
        rubric: "proof",
        criteria: [
          "Verifies the bounded-difference constant 1/n for Φ(S) explicitly (changing one Z_i)",
          "Combines E Φ ≤ 2R_n with McDiarmid to get the sqrt(log(1/δ)/(2n)) term",
          "Second McDiarmid on R_S and a correct union bound producing 3·sqrt(log(2/δ)/(2n))",
          "Correctly relates 0-1 loss class to H (R_n(F) = R_n(H)/2) and derives the ERM excess-risk bound",
          "VC recovery uses Massart with |H_S| ≤ (en/d)^d",
        ],
      },
      {
        title: "Rademacher calculus & Massart's lemma",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Prove, for the empirical Rademacher complexity $R_S$:

1. $R_S(c\mathcal F) = |c|\,R_S(\mathcal F)$ and $R_S(\mathcal F + g) = R_S(\mathcal F)$ for a fixed function $g$.
2. $R_S(\mathcal F+\mathcal G) = R_S(\mathcal F) + R_S(\mathcal G)$ (Minkowski sum).
3. $R_S(\mathrm{conv}\,\mathcal F) = R_S(\mathcal F)$.
4. **Massart's lemma.** For a finite $A\subset\mathbb R^n$, $\displaystyle \mathbb E_\sigma\max_{a\in A}\frac1n\sum_i\sigma_ia_i\le\frac{\max_{a\in A}\|a\|_2\sqrt{2\log|A|}}{n}$.
5. Show by an explicit example that $R_S(\mathcal F\cup\mathcal G)\le R_S(\mathcal F)+R_S(\mathcal G)$ can fail if the classes do not contain a common function / zero — and state the correct statement.

File ‵written/3-rademacher_calculus.pdf‵.`,
        deliverable: "repo",
        files: ["written/3-rademacher_calculus.pdf"],
        rubric: "proof",
        criteria: [
          "Scaling proof handles c < 0 using symmetry of σ",
          "Convex-hull proof: the supremum of a linear functional over conv F equals that over F",
          "Massart proof: exponentiate, Jensen, bound E e^{λ⟨σ,a⟩} ≤ e^{λ²‖a‖²/2}, optimise λ",
          "Union counter-example / corrected statement is valid",
        ],
      },
      {
        title: "Rademacher complexity of linear classes",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Let $x_1,\dots,x_n\in\mathbb R^d$.

**Proposition.** (a) For $\mathcal F_2 = \{x\mapsto\langle w,x\rangle:\|w\|_2\le B\}$: $\;R_S(\mathcal F_2)\le \frac{B}{n}\sqrt{\sum_i\|x_i\|_2^2}\le\frac{BC}{\sqrt n}$ if $\|x_i\|_2\le C$; moreover $R_S(\mathcal F_2)\ge\frac{B}{\sqrt2\,n}\sqrt{\sum_i\|x_i\|_2^2}$.
(b) For $\mathcal F_1 = \{x\mapsto\langle w,x\rangle:\|w\|_1\le B\}$ and $\|x_i\|_\infty\le C$: $\;R_S(\mathcal F_1)\le BC\sqrt{\frac{2\log(2d)}{n}}$.

Deliverables (‵written/4-linear_classes.pdf‵): prove (a) upper bound (duality + Jensen), (a) lower bound (Khintchine–Kahane with constant $1/\sqrt2$ — you may cite the inequality, but state it precisely), (b) via the convex hull of $\{\pm Be_j\}$ and Massart. Then discuss: when is (b) better than (a) (sparse $w$, dense $x$)? Plug (a) into the previous theorem to get a generalization bound for bounded-norm linear regression with a Lipschitz loss (you may state the contraction lemma; it is proved in T19).`,
        deliverable: "repo",
        files: ["written/4-linear_classes.pdf"],
        rubric: "derivation",
        criteria: [
          "Uses sup_{‖w‖≤B}⟨w, v⟩ = B‖v‖_* (dual norm) correctly for both ℓ2 and ℓ1",
          "Jensen step E‖Σσ_i x_i‖ ≤ sqrt(E‖Σσ_i x_i‖²) = sqrt(Σ‖x_i‖²) with cross terms vanishing",
          "ℓ1 case reduces to 2d extreme points and applies Massart with max‖a‖₂ ≤ C√n",
          "States Khintchine–Kahane precisely for the lower bound",
          "Discussion compares B₂C₂ vs B₁C∞√(log d) regimes with an example",
        ],
      },
      {
        title: "Empirical Rademacher complexity, numerically",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File ‵100-rademacher.py‵ (NumPy + standard library only).

- ‵rademacher_finite_exact(A)‵ — ‵A‵ has shape ‵(k, n)‵ with $n\le16$: row $j$ is the vector $(f_j(z_1),\dots,f_j(z_n))$. Return the **exact** empirical Rademacher complexity $\frac{1}{2^n}\sum_{\sigma\in\{\pm1\}^n}\max_j\frac1n\langle\sigma,A_j\rangle$ by enumerating all sign vectors (vectorise over $\sigma$; ‵itertools.product‵ allowed to build the sign matrix).
- ‵rademacher_linear_mc(X, B, n_draws, rng)‵ — Monte Carlo estimate of $R_S(\mathcal F_2) = \frac Bn\mathbb E_\sigma\|\sum_i\sigma_ix_i\|_2$ for ‵X‵ of shape ‵(n, d)‵, drawing ‵n_draws‵ sign vectors with ‵rng.choice([-1.0, 1.0], size=(n_draws, n))‵ (or ‵rng.integers‵). Return a float.
- ‵linear_upper_bound(X, B)‵ — return $\frac Bn\sqrt{\sum_i\|x_i\|_2^2}$.

In ‵README.md‵, report a plot or table of the MC estimate vs the bound as $n$ grows ($n = 10, 100, 1000$, $d = 20$).

‵‵‵python
m = import_module('100-rademacher')
A = np.random.default_rng(0).normal(size=(5, 10))
print(m.rademacher_finite_exact(A))
X = np.random.default_rng(1).normal(size=(200, 20))
print(m.rademacher_linear_mc(X, 1.0, 4000, np.random.default_rng(2)), m.linear_upper_bound(X, 1.0))
‵‵‵`,
        files: ["100-rademacher.py"],
        checks: [
          { type: "exists", path: "100-rademacher.py" },
          { type: "defines", path: "100-rademacher.py", names: ["rademacher_finite_exact", "rademacher_linear_mc", "linear_upper_bound"] },
          {
            type: "py_test", files: ["100-rademacher.py"], label: "exact finite-class value matches enumeration and Massart",
            code: IMPORT("100-rademacher") + md`import itertools
rng = np.random.default_rng(0)
for (k, n) in [(5, 10), (1, 6), (30, 12)]:
    A = rng.normal(size=(k, n))
    S = np.array(list(itertools.product([-1.0, 1.0], repeat=n)))
    ref = np.mean(np.max(S @ A.T, axis=1)) / n
    got = float(m.rademacher_finite_exact(A))
    assert np.isclose(got, ref, rtol=1e-9, atol=1e-12), (k, n, got, ref)
    if k > 1:
        massart = np.max(np.linalg.norm(A, axis=1)) * np.sqrt(2 * np.log(k)) / n
        assert got <= massart + 1e-12
A = rng.normal(size=(1, 8))
assert abs(float(m.rademacher_finite_exact(A))) < 1e-12`,
          },
          {
            type: "py_test", files: ["100-rademacher.py"], label: "linear-class MC estimate is accurate and within [bound/√2, bound]",
            code: IMPORT("100-rademacher") + md`X = np.random.default_rng(1).normal(size=(200, 20))
B = 2.5
ub = float(m.linear_upper_bound(X, B))
assert np.isclose(ub, B * np.sqrt((X ** 2).sum()) / 200, rtol=1e-9)
est = float(m.rademacher_linear_mc(X, B, 4000, np.random.default_rng(2)))
S = np.random.default_rng(123).choice([-1.0, 1.0], size=(20000, 200))
ref = B * np.mean(np.linalg.norm(S @ X, axis=1)) / 200
assert abs(est - ref) / ref < 0.03, (est, ref)
assert ub / np.sqrt(2) - 1e-9 <= est <= ub + 1e-9, (est, ub)`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── T18
  {
    id: "T18",
    track: TRACK,
    phase: PHASE,
    title: "Covering Numbers & Dudley's Chaining",
    days: 6,
    repo: REPO,
    dir: "0x11-covering_chaining",
    sources: [
      { course: "CS229M", lectures: "Lec 5", topics: "Covering and packing numbers, discretization bound, chaining, Dudley's entropy integral" },
    ],
    resources: [
      R.notes,
      { title: "Vershynin — High-Dimensional Probability, Ch. 4.2 (nets) & Ch. 8 (chaining) (book PDF)", url: R.hdp.url },
      R.bach,
    ],
    concepts: ["ε-cover, ε-net, ε-packing", "Volumetric argument", "Metric entropy log N(ε)", "Single-scale discretization bound", "Chaining", "Dudley's entropy integral", "Rates from entropy exponents"],
    objectives: [
      "Prove M(2ε) ≤ N(ε) ≤ M(ε) relating packing and covering numbers",
      "Use the volumetric argument to show (1/ε)^d ≤ N(B₂ᵈ, ε) ≤ (1 + 2/ε)^d",
      "Prove the one-scale bound R_S(F) ≤ inf_ε (ε + √(2 log N(ε)/n)) using Massart",
      "Prove Dudley's entropy integral bound by chaining and explain why it removes the log factor",
      "Translate a metric-entropy exponent log N(ε) ≍ ε^{−p} into a Rademacher rate",
      "Implement a greedy ε-net and check it against the volumetric bounds",
    ],
    requirements: [WRITTEN_REQ, CODE_REQ],
    quiz: [
      { q: "For the unit Euclidean ball in ℝᵈ, the volumetric argument gives N(B, ε) ≤", options: ["(1/ε)^d", "(1 + 2/ε)^d", "d/ε", "e^{d/ε²}"], answer: 1, why: "Disjoint ε/2-balls around a maximal packing fit inside a (1 + ε/2)-ball." },
      { q: "Why does Dudley's integral beat the single-scale discretization bound for d-dimensional linear classes?", options: ["It uses a finer metric", "It sums contributions over geometric scales, removing the extra √(log n) factor", "It uses Bernstein instead of Hoeffding", "It needs fewer samples"], answer: 1, why: "Each chaining link uses a small diameter at its own scale; the single-scale bound pays log N at the finest scale." },
      { q: "If log N(F, ε, L2(Pₙ)) ≍ ε^{−p} with p < 2, Dudley gives R_S(F) of order:", options: ["n^{−1/p}", "n^{−1/2}", "n^{−1/4}", "log n / n"], answer: 1, why: "The integral ∫₀ ε^{−p/2} dε converges at 0 when p < 2, giving a 1/√n rate." },
      { q: "A maximal ε-packing is always:", options: ["an ε-cover", "a 2ε-packing", "of size at most N(ε)", "a subset of every cover"], answer: 0, why: "If some point were > ε from all packing points it could be added, contradicting maximality." },
    ],
    tasks: [
      readmeTask("0x11-covering_chaining", "4. A table of metric entropies you derived (ℓ2 ball, ℓ1 ball if attempted, Lipschitz functions on [0,1]) with the resulting Rademacher rates."),
      {
        title: "Covering, packing and the volumetric argument",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Let $(T,\rho)$ be a metric space, $N(T,\rho,\varepsilon)$ its covering number and $M(T,\rho,\varepsilon)$ its packing number.

**Lemma.** $M(T,\rho,2\varepsilon)\le N(T,\rho,\varepsilon)\le M(T,\rho,\varepsilon)$.

**Proposition (volumetric).** For the unit Euclidean ball $B_2^d$ and $\varepsilon\in(0,1]$: $\;(1/\varepsilon)^d\le N(B_2^d,\|\cdot\|_2,\varepsilon)\le(1+2/\varepsilon)^d\le(3/\varepsilon)^d$.

Deliverables (‵written/1-volumetric.pdf‵): prove the lemma and the proposition. Then (a) extend to any norm ball $K$ in $\mathbb R^d$ with $N(K,\|\cdot\|_K,\varepsilon)\le(1+2/\varepsilon)^d$; (b) bound the $L_2(P_n)$ covering number of $\{x\mapsto\langle w,x\rangle:\|w\|_2\le B\}$ when $\|x_i\|_2\le C$; (c) prove the classical application: for a symmetric matrix $A$ and a $\frac14$-net $\mathcal N$ of the sphere, $\|A\|_{op}\le 2\max_{x\in\mathcal N}|x^\top Ax|$.`,
        deliverable: "repo",
        files: ["written/1-volumetric.pdf"],
        rubric: "proof",
        criteria: [
          "Maximal packing ⇒ cover argument and 2ε-packing vs ε-cover pigeonhole argument both given",
          "Upper bound: disjoint ε/2-balls inside (1+ε/2)B, volume ratio (1+2/ε)^d",
          "Lower bound: N balls of radius ε must cover B, so N ε^d ≥ 1",
          "L2(P_n) cover of the linear class reduces to a cover of the parameter ball with scale ε/C",
          "Net argument for the operator norm handles the approximation error correctly",
        ],
      },
      {
        title: "Single-scale discretization bound",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`**Proposition.** Let $\mathcal F$ be a class with $\sup_{f}\|f\|_{L_2(P_n)}\le 1$, where $\|f\|_{L_2(P_n)}^2 = \frac1n\sum_i f(z_i)^2$. Then
$$R_S(\mathcal F)\le\inf_{\varepsilon>0}\Big(\varepsilon + \sqrt{\frac{2\log N(\mathcal F,L_2(P_n),\varepsilon)}{n}}\Big).$$

Deliverables (‵written/2-discretization.pdf‵): prove it (approximate each $f$ by its nearest net point, Cauchy–Schwarz for the approximation term, Massart for the finite net). Apply it to the linear class of the previous task and show it gives $R_S\lesssim BC\sqrt{d\log n/n}$; explain where the $\log n$ comes from.`,
        deliverable: "repo",
        files: ["written/2-discretization.pdf"],
        rubric: "proof",
        criteria: [
          "Bounds (1/n)Σσ_i(f − f_ε)(z_i) ≤ ‖f − f_ε‖_{L2(Pn)} ≤ ε by Cauchy–Schwarz",
          "Applies Massart to the finite net with vector norm ≤ √n",
          "Optimises ε ≍ 1/√n to obtain the √(d log n / n) rate and identifies the log n source",
        ],
      },
      {
        title: "Dudley's entropy integral",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`**Theorem (Dudley).** Under the same normalisation,
$$R_S(\mathcal F)\le 12\int_0^{\infty}\sqrt{\frac{\log N(\mathcal F,L_2(P_n),\varepsilon)}{n}}\,d\varepsilon,$$
and the truncated version: for every $\alpha\ge0$, $\;R_S(\mathcal F)\le 4\alpha + 12\int_\alpha^{\infty}\sqrt{\log N(\mathcal F,L_2(P_n),\varepsilon)/n}\,d\varepsilon$.

Deliverables (‵written/3-dudley.pdf‵), following CS229M Lec 5:

1. Set $\varepsilon_j = 2^{-j}$, choose $\varepsilon_j$-covers $\mathcal C_j$, nearest-point maps $\pi_j$, and write the **telescoping** decomposition $f = \pi_0 f + \sum_{j=1}^{J}(\pi_jf - \pi_{j-1}f) + (f - \pi_Jf)$.
2. Bound each link: $\|\pi_jf - \pi_{j-1}f\|_{L_2(P_n)}\le 3\varepsilon_j$ and the number of distinct links by $|\mathcal C_j||\mathcal C_{j-1}|\le|\mathcal C_j|^2$; apply Massart.
3. Sum the series and compare it to the integral (each term $\varepsilon_j\sqrt{\log N(\varepsilon_j)}$ is $\le 2\int_{\varepsilon_{j+1}}^{\varepsilon_j}\sqrt{\log N(\varepsilon)}\,d\varepsilon$), letting $J\to\infty$ (or stopping at $\alpha$).
4. Track the constants to obtain 12 (or state the constant you get and why it differs).`,
        deliverable: "repo",
        files: ["written/3-dudley.pdf"],
        rubric: "proof",
        criteria: [
          "Correct telescoping chain with geometric scales and nearest-point projections",
          "Link diameter bound 3ε_j via the triangle inequality and link count ≤ |C_j|²",
          "Massart applied per scale giving ε_j √(2 log |C_j|² / n) terms",
          "Sum-to-integral comparison uses monotonicity of N(ε) correctly",
          "Truncated version handles the residual f − π_J f with the 4α term (or an explicit constant)",
        ],
      },
      {
        title: "Rates from metric entropy",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Use Dudley (truncated where needed) to derive Rademacher rates for:

1. The $d$-dimensional linear class of task 1: show $R_S\lesssim BC\sqrt{d/n}$ (no $\log n$).
2. A class with $\log N(\varepsilon)\le(c/\varepsilon)^p$: show the rate is $n^{-1/2}$ for $p<2$, $n^{-1/2}\log n$ for $p=2$ and $n^{-1/p}$ for $p>2$ (choose $\alpha$ optimally).
3. 1-Lipschitz functions $[0,1]\to[0,1]$ under $\|\cdot\|_\infty$: prove $\log N(\varepsilon)\lesssim 1/\varepsilon$ by an explicit construction and deduce the rate.

File ‵written/4-entropy_rates.pdf‵. End with a paragraph on why $p>2$ classes (e.g. Lipschitz functions in dimension $d>2$) are "too large" for $1/\sqrt n$ rates via this method.`,
        deliverable: "repo",
        files: ["written/4-entropy_rates.pdf"],
        rubric: "derivation",
        criteria: [
          "Linear class: computes ∫₀^1 √(d log(3/ε)) dε = O(√d) and gets √(d/n)",
          "Entropy-exponent case analysis with optimal α ≍ n^{−1/p} for p > 2",
          "Explicit grid/piecewise-linear construction for Lipschitz functions with log N ≲ 1/ε",
          "Discussion links p > 2 to the curse of dimensionality for nonparametric classes",
        ],
      },
      {
        title: "Greedy ε-nets and the volumetric bound",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File ‵100-covering.py‵ (NumPy only).

- ‵greedy_net(P, eps)‵ — ‵P‵ has shape ‵(N, d)‵. Scan the points **in index order**; point $i$ becomes a centre iff its Euclidean distance to every centre chosen so far is **strictly greater** than ‵eps‵. Return the 1-D integer array of chosen indices (increasing). The result is simultaneously an ε-cover of the set (every point within distance ≤ ε of a centre) and an ε-packing.
- ‵volumetric_bounds(d, eps)‵ — return the tuple ‵(lower, upper)‵ $=\big((1/\varepsilon)^d,\,(1+2/\varepsilon)^d\big)$ for the unit ball.

Vectorise the distance computation to the current centres (a Python loop over the ‵N‵ points is fine). In ‵README.md‵, plot or tabulate ‵len(greedy_net)‵ for 5000 uniform points in $B_2^2$ against the two bounds for $\varepsilon\in\{0.5, 0.25, 0.1\}$.

‵‵‵python
m = import_module('100-covering')
P = np.random.default_rng(0).normal(size=(500, 2))
idx = m.greedy_net(P, 0.5)
print(len(idx), m.volumetric_bounds(2, 0.5))
‵‵‵`,
        files: ["100-covering.py"],
        checks: [
          { type: "exists", path: "100-covering.py" },
          { type: "defines", path: "100-covering.py", names: ["greedy_net", "volumetric_bounds"] },
          {
            type: "py_test", files: ["100-covering.py"], label: "greedy net = reference, covers and packs",
            code: IMPORT("100-covering") + md`rng = np.random.default_rng(0)
def ref_net(P, eps):
    C = []
    for i in range(len(P)):
        if not C or np.min(np.linalg.norm(P[C] - P[i], axis=1)) > eps:
            C.append(i)
    return np.array(C)
for (N, d, eps) in [(400, 2, 0.5), (300, 5, 1.5), (50, 1, 0.1)]:
    P = rng.normal(size=(N, d))
    got = np.asarray(m.greedy_net(P, eps)).astype(int).ravel()
    assert np.array_equal(got, ref_net(P, eps)), (N, d, eps)
    D = np.linalg.norm(P[:, None, :] - P[None, got, :], axis=2)
    assert np.all(D.min(axis=1) <= eps + 1e-12)
    G = D[got]
    np.fill_diagonal(G, np.inf)
    assert np.all(G > eps)`,
          },
          {
            type: "py_test", files: ["100-covering.py"], label: "volumetric bounds and net size in the unit disc",
            code: IMPORT("100-covering") + md`lo, up = m.volumetric_bounds(3, 0.2)
assert np.isclose(lo, 5.0 ** 3) and np.isclose(up, 11.0 ** 3), (lo, up)
rng = np.random.default_rng(1)
r = np.sqrt(rng.random(3000)); th = 2 * np.pi * rng.random(3000)
P = np.c_[r * np.cos(th), r * np.sin(th)]
for eps in (0.5, 0.3):
    k = len(np.asarray(m.greedy_net(P, eps)).ravel())
    lo, up = m.volumetric_bounds(2, eps)
    assert 0.5 * lo <= k <= up, (eps, k, lo, up)`,
          },
        ],
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── T19
  {
    id: "T19",
    track: TRACK,
    phase: PHASE,
    title: "Margin Theory",
    days: 5,
    repo: REPO,
    dir: "0x12-margin_theory",
    sources: [
      { course: "CS229M", lectures: "Lec 6", topics: "Margin-based generalization bounds, Talagrand's contraction lemma, Rademacher complexity of linear classes and two-layer networks" },
      { course: "BD", lectures: "Lec 16", topics: "Recap: SVM margin bound (SSBD Ch. 15) from Pass 1" },
    ],
    resources: [
      R.notes,
      { title: "SSBD Ch. 15 (SVM) & Ch. 26 (Rademacher, margin) (book PDF)", url: R.ssbd.url },
      { title: "Bartlett, Foster & Telgarsky (2017) — Spectrally-normalized margin bounds for neural networks", url: "https://arxiv.org/abs/1706.08498" },
      { title: "Golowich, Rakhlin & Shamir (2017) — Size-independent sample complexity of neural networks", url: "https://arxiv.org/abs/1712.06541" },
    ],
    concepts: ["Ramp / margin loss", "Talagrand's contraction lemma", "Margin-based generalization bound", "Scale-sensitive vs dimension-dependent capacity", "Uniformity over the margin parameter", "Rademacher complexity of 2-layer networks"],
    objectives: [
      "Prove Talagrand's contraction lemma for Lipschitz functions coordinate by coordinate",
      "Derive the margin bound L₀₋₁(f) ≤ L̂_γ(f) + (2/γ)R_S(F) + 3√(log(2/δ)/(2n))",
      "Make the margin bound hold uniformly over γ with a union bound over a geometric grid",
      "Re-derive the SSBD Ch. 15 SVM bound from the margin theorem and explain the differences in constants",
      "Bound the Rademacher complexity of two-layer ReLU networks with a path-norm constraint",
      "Compute a numerical margin bound for a trained linear classifier",
    ],
    requirements: [WRITTEN_REQ, CODE_REQ],
    quiz: [
      { q: "The ramp loss ℓ_γ(t) = min(1, max(0, 1 − t/γ)) is Lipschitz with constant:", options: ["1", "γ", "1/γ", "2/γ"], answer: 2, why: "It is linear with slope −1/γ on [0, γ] and constant elsewhere." },
      { q: "Why does multiplying by labels yᵢ ∈ {±1} not change the Rademacher complexity of x ↦ f(x)?", options: ["Because the labels are deterministic", "Because σᵢyᵢ has the same distribution as σᵢ", "Because f is linear", "It does change it by a factor 2"], answer: 1, why: "Conditioned on the sample, σᵢyᵢ are again i.i.d. Rademacher." },
      { q: "The margin bound for {x ↦ ⟨w, x⟩ : ‖w‖₂ ≤ B} with ‖x‖₂ ≤ C depends on the dimension d:", options: ["linearly", "as √d", "as log d", "not at all"], answer: 3, why: "The capacity term is 2BC/(γ√n), dimension-free." },
      { q: "Making the margin bound uniform over γ ∈ (0, 1] via a grid γₖ = 2^{−k} costs an extra term of order:", options: ["√(log k / n) ≈ √(log log(1/γ)/n)", "1/γ", "√(d/n)", "nothing"], answer: 0, why: "A union bound with δₖ = δ/(k(k+1)) adds √(log(k(k+1))/n)." },
    ],
    tasks: [
      readmeTask("0x12-margin_theory", "4. A side-by-side box: the margin bound of this project vs the SSBD Ch. 15 / Ch. 26 bound you used in Pass 1 (Week 12)."),
      {
        title: "Talagrand's contraction lemma",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`**Lemma (contraction).** Let $\phi_1,\dots,\phi_n:\mathbb R\to\mathbb R$ be $L$-Lipschitz and $T\subseteq\mathbb R^n$. Then
$$\mathbb E_\sigma\sup_{t\in T}\sum_{i=1}^n\sigma_i\phi_i(t_i)\;\le\;L\,\mathbb E_\sigma\sup_{t\in T}\sum_{i=1}^n\sigma_it_i.$$
Consequently $R_S(\phi\circ\mathcal F)\le L\,R_S(\mathcal F)$.

Deliverables (‵written/1-contraction.pdf‵): prove it by peeling off one coordinate at a time — condition on $\sigma_2,\dots,\sigma_n$, write the expectation over $\sigma_1$ as $\frac12\sup_{t,t'}[\phi_1(t_1)-\phi_1(t'_1) + \dots]$ and use $|\phi_1(t_1)-\phi_1(t'_1)|\le L|t_1-t'_1|$ (handle the absolute value carefully: explain why you can drop it). Then give an example showing the version with an absolute value inside the supremum needs an extra factor 2 (or $\phi(0)=0$).`,
        deliverable: "repo",
        files: ["written/1-contraction.pdf"],
        rubric: "proof",
        criteria: [
          "Reduces to one coordinate by conditioning on σ_{2:n} and an induction",
          "Writes E_{σ₁} sup as ½ sup_{t,t'}[(φ(t₁) − φ(t'₁)) + A(t) + A(t')] and swaps t, t' to remove the absolute value",
          "Uses the Lipschitz property and re-introduces σ₁ to conclude",
          "Discusses the absolute-value variant correctly (factor 2 or φ(0)=0)",
        ],
      },
      {
        title: "The margin bound",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`For real-valued $f$ and $\gamma>0$ let $\hat L_\gamma(f)=\frac1n\sum_i\ell_\gamma(y_if(x_i))$ with the ramp loss $\ell_\gamma(t)=\min(1,\max(0,1-t/\gamma))$, and $L_{0\text-1}(f)=\mathbb P(yf(x)\le0)$.

**Theorem.** For any class $\mathcal F$ of real functions, $\gamma>0$, $\delta\in(0,1)$, with probability $\ge1-\delta$, for all $f\in\mathcal F$:
$$L_{0\text-1}(f)\le\hat L_\gamma(f)+\frac{2}{\gamma}R_S(\mathcal F)+3\sqrt{\frac{\log(2/\delta)}{2n}}.$$
For $\mathcal F=\{x\mapsto\langle w,x\rangle:\|w\|_2\le B\}$, $\|x\|_2\le C$: $\;L_{0\text-1}(f)\le\hat L_\gamma(f)+\frac{2BC}{\gamma\sqrt n}+3\sqrt{\frac{\log(2/\delta)}{2n}}$.

Deliverables (‵written/2-margin_bound.pdf‵):

1. Prove the theorem: $\mathbf 1[t\le0]\le\ell_\gamma(t)\le\mathbf 1[t<\gamma]$; apply the T17 theorem to $\ell_\gamma\circ\mathcal G$ with $\mathcal G=\{(x,y)\mapsto yf(x)\}$; contraction; $R_S(\mathcal G)=R_S(\mathcal F)$.
2. **Uniform in γ**: show that w.p. $\ge1-\delta$, simultaneously for all $f$ and all $\gamma\in(0,1]$, the bound holds with $\gamma$ replaced by $\gamma/2$ in the capacity term and an extra $\sqrt{\log\log_2(2/\gamma)/n}$-type term (grid $\gamma_k=2^{-k}$, $\delta_k=\delta/(k(k+1))$).
3. Explain why this bound can be non-vacuous for $d\gg n$ while the VC bound for halfspaces cannot.`,
        deliverable: "repo",
        files: ["written/2-margin_bound.pdf"],
        rubric: "proof",
        criteria: [
          "Sandwich 1[t ≤ 0] ≤ ℓ_γ(t) and application of the Rademacher bound to the [0,1]-valued class ℓ_γ ∘ G",
          "Contraction with Lipschitz constant 1/γ and the σ_i y_i =ᵈ σ_i argument",
          "Linear specialisation uses R_S ≤ BC/√n from T17",
          "Union bound over the geometric grid with summable δ_k, and monotonicity of ℓ_γ in γ to cover γ between grid points",
          "Dimension-free discussion contrasts with VC dimension d+1",
        ],
      },
      {
        title: "Same result, different proof: the SSBD SVM bound",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`In Pass 1 (Week 12) you met the SVM generalization bound of SSBD Ch. 15 (proved in SSBD Ch. 26 through Rademacher complexity of the hinge/ramp loss).

Deliverables (‵written/3-ssbd_connection.pdf‵):

1. Restate the SSBD bound for Hard-SVM / Soft-SVM exactly as in the book (cite theorem numbers), including the normalisation (margin 1, $\|w\|\le B$, $\|x\|\le\rho$).
2. Derive it from the margin theorem of task 2: choose $\gamma$, rescale $w$, and match each term.
3. Make a table of the differences: loss used (hinge vs ramp), constants, whether the bound is data-dependent, uniformity over $B$ (SRM step), realizable vs agnostic.
4. One paragraph: which proof generalises to neural networks, and why?`,
        deliverable: "repo",
        files: ["written/3-ssbd_connection.pdf"],
        rubric: "derivation",
        criteria: [
          "SSBD statement quoted correctly with theorem numbers and normalisation",
          "Explicit reduction from the margin theorem (γ = 1 after rescaling, B ↔ ‖w‖) recovering the same rate ρB/√m",
          "Comparison table covers loss, constants, data-dependence and uniformity over B",
          "Argues why the Rademacher + contraction route extends to compositions/networks",
        ],
      },
      {
        title: "Rademacher complexity of two-layer networks",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Let $\sigma(z)=\max(z,0)$ and
$$\mathcal F_B=\Big\{x\mapsto\sum_{j=1}^m u_j\,\sigma(w_j^\top x)\;:\;\sum_{j=1}^m|u_j|\,\|w_j\|_2\le B\Big\}\quad(m\text{ arbitrary}).$$

**Proposition.** If $\|x_i\|_2\le C$ then $R_S(\mathcal F_B)\le\frac{2BC}{\sqrt n}$.

Deliverables (‵written/4-two_layer.pdf‵): (1) use positive homogeneity of ReLU to rewrite $\mathcal F_B\subseteq B\cdot\mathrm{conv}\{\pm\sigma(\bar w^\top x):\|\bar w\|_2\le1\}$; (2) convex hull invariance; (3) contraction (ReLU is 1-Lipschitz, $\sigma(0)=0$) with the factor 2 from the $\pm$; (4) the linear-class bound. Then write the resulting margin bound and comment: the bound does not depend on the width $m$ — what does it depend on instead, and is the path-norm small for networks trained in practice?`,
        deliverable: "repo",
        files: ["written/4-two_layer.pdf"],
        rubric: "derivation",
        criteria: [
          "Rescaling u_j σ(w_jᵀx) = (u_j‖w_j‖) σ(w̄_jᵀx) using positive homogeneity",
          "Inclusion in B·conv(±σ∘linear) and use of convex hull invariance",
          "Correct handling of the ± (absolute value) giving the factor 2 with contraction",
          "Final width-independent margin bound and an informed comment on path-norm in practice",
        ],
      },
      {
        title: "A numerical margin bound",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File ‵100-margin_bound.py‵ (NumPy only).

- ‵ramp_loss(margins, gamma)‵ — elementwise $\ell_\gamma(t)=\min(1,\max(0,1-t/\gamma))$ on a NumPy array; returns an array of the same shape.
- ‵empirical_margin_loss(X, y, w, gamma)‵ — ‵X‵ ‵(n, d)‵, ‵y‵ ‵(n,)‵ in $\{-1,+1\}$, ‵w‵ ‵(d,)‵: mean ramp loss of $y_i\langle w,x_i\rangle$ (float).
- ‵margin_bound(X, y, w, gamma, delta)‵ — return the float
$$\hat L_\gamma(w)+\frac{2}{\gamma}\cdot\frac{\|w\|_2\sqrt{\sum_i\|x_i\|_2^2}}{n}+3\sqrt{\frac{\log(2/\delta)}{2n}}.$$

(Using $B=\|w\|_2$ makes the bound valid only after the union bound over $B$ — mention this in ‵README.md‵ together with the bound you obtain for a classifier of your choice on a synthetic separable data set, for several γ.)

‵‵‵python
m = import_module('100-margin_bound')
print(m.ramp_loss(np.array([-1., 0., 0.5, 1., 2.]), 1.0))   # [1. 1. 0.5 0. 0.]
‵‵‵`,
        files: ["100-margin_bound.py"],
        checks: [
          { type: "exists", path: "100-margin_bound.py" },
          { type: "defines", path: "100-margin_bound.py", names: ["ramp_loss", "empirical_margin_loss", "margin_bound"] },
          {
            type: "py_test", files: ["100-margin_bound.py"], label: "ramp loss and empirical margin loss",
            code: IMPORT("100-margin_bound") + md`t = np.array([-1.0, 0.0, 0.25, 0.5, 1.0, 2.0])
assert np.allclose(m.ramp_loss(t, 1.0), [1, 1, 0.75, 0.5, 0, 0])
assert np.allclose(m.ramp_loss(t, 0.5), [1, 1, 0.5, 0, 0, 0])
rng = np.random.default_rng(0)
X = rng.normal(size=(300, 7)); w = rng.normal(size=7); y = np.sign(X @ rng.normal(size=7))
mg = y * (X @ w)
ref = np.mean(np.clip(1 - mg / 0.7, 0, 1))
assert np.isclose(float(m.empirical_margin_loss(X, y, w, 0.7)), ref, rtol=1e-9)`,
          },
          {
            type: "py_test", files: ["100-margin_bound.py"], label: "margin bound matches the formula",
            code: IMPORT("100-margin_bound") + md`rng = np.random.default_rng(1)
for (n, d, g, dl) in [(200, 5, 0.5, 0.05), (1000, 50, 2.0, 0.01)]:
    X = rng.normal(size=(n, d)); w = rng.normal(size=d); y = np.sign(X @ rng.normal(size=d))
    Lg = np.mean(np.clip(1 - y * (X @ w) / g, 0, 1))
    ref = Lg + (2 / g) * np.linalg.norm(w) * np.sqrt((X ** 2).sum()) / n + 3 * np.sqrt(np.log(2 / dl) / (2 * n))
    assert np.isclose(float(m.margin_bound(X, y, w, g, dl)), ref, rtol=1e-9), (n, d)`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── T20
  {
    id: "T20",
    track: TRACK,
    phase: PHASE,
    title: "Kernel Methods & RKHS Generalization",
    days: 5,
    repo: REPO,
    dir: "0x13-rkhs",
    sources: [
      { course: "CS229M", lectures: "Lec 7", topics: "Kernel methods, reproducing kernel Hilbert spaces, representer theorem, Rademacher complexity of kernel classes" },
    ],
    resources: [
      R.notes,
      { title: "Bach — Learning Theory from First Principles, kernel methods chapter (book PDF)", url: R.bach.url },
      { title: "SSBD Ch. 16 — Kernel methods (book PDF)", url: R.ssbd.url },
    ],
    concepts: ["Positive semi-definite kernels", "Reproducing property", "RKHS (Moore–Aronszajn)", "Representer theorem", "Kernel ridge regression", "Rademacher complexity of RKHS balls", "Random Fourier features (Bochner)"],
    objectives: [
      "Construct the RKHS of a PSD kernel and prove the reproducing property and |f(x)| ≤ ‖f‖ √k(x,x)",
      "Prove the representer theorem by orthogonal decomposition in the RKHS",
      "Contrast the RKHS proof with the feature-map proof of SSBD Ch. 16",
      "Prove R_S({‖f‖_H ≤ B}) ≤ B √(tr K)/n and derive a kernel SVM generalization bound",
      "Derive the kernel ridge solution α = (K + nλI)⁻¹ y",
      "Explain random Fourier features via Bochner's theorem",
    ],
    requirements: [WRITTEN_REQ, CODE_REQ],
    quiz: [
      { q: "The reproducing property of an RKHS H with kernel k states that for all f ∈ H and x:", options: ["f(x) = k(x, x)", "f(x) = ⟨f, k(x, ·)⟩_H", "‖f‖_H = f(x)", "k(x, ·) = f"], answer: 1, why: "Evaluation is the inner product with the kernel section k(x, ·)." },
      { q: "For the objective (1/n)Σ(f(xᵢ) − yᵢ)² + λ‖f‖²_H, the representer coefficients are:", options: ["α = K⁻¹y", "α = (K + λI)⁻¹y", "α = (K + nλI)⁻¹y", "α = (K² + λI)⁻¹Ky"], answer: 2, why: "Substituting f = Σαᵢk(xᵢ,·) and setting the gradient to zero gives K((K + nλI)α − y) = 0." },
      { q: "The empirical Rademacher complexity of {f : ‖f‖_H ≤ B} satisfies:", options: ["≤ B √(tr K)/n", "≤ B tr K / n", "≤ B λ_max(K)/n", "= 0"], answer: 0, why: "Reproducing property + Cauchy–Schwarz + Jensen: (B/n) E√(σᵀKσ) ≤ (B/n)√(tr K)." },
      { q: "For the Gaussian (RBF) kernel, k(x, x) = 1, so the bound above becomes:", options: ["B/n", "B/√n", "B√d/√n", "B log n/n"], answer: 1, why: "tr K = n." },
    ],
    tasks: [
      readmeTask("0x13-rkhs", ""),
      {
        title: "Constructing the RKHS",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Let $k:\mathcal X\times\mathcal X\to\mathbb R$ be symmetric and positive semi-definite ($\sum_{i,j}c_ic_jk(x_i,x_j)\ge0$).

**Theorem (Moore–Aronszajn).** There is a unique Hilbert space $\mathcal H$ of functions on $\mathcal X$ with $k(x,\cdot)\in\mathcal H$ for all $x$ and $f(x)=\langle f,k(x,\cdot)\rangle_{\mathcal H}$ for all $f\in\mathcal H$.

Deliverables (‵written/1-rkhs.pdf‵): (1) define $\mathcal H_0=\mathrm{span}\{k(x,\cdot)\}$ with $\langle\sum_i a_ik(x_i,\cdot),\sum_j b_jk(z_j,\cdot)\rangle=\sum_{i,j}a_ib_jk(x_i,z_j)$, prove it is **well defined** (independent of the representation) and **positive definite** (use the reproducing property + Cauchy–Schwarz for semi-inner products to show $\langle f,f\rangle=0\Rightarrow f\equiv0$); (2) prove $|f(x)|\le\|f\|_{\mathcal H}\sqrt{k(x,x)}$ and that norm convergence implies pointwise convergence; (3) sketch the completion and uniqueness; (4) show a function is in the RKHS of the linear kernel $k(x,z)=x^\top z$ iff it is linear, and compute its RKHS norm.`,
        deliverable: "repo",
        files: ["written/1-rkhs.pdf"],
        rubric: "proof",
        criteria: [
          "Well-definedness: ⟨f, g⟩ = Σ_j b_j f(z_j) shows independence of the representation of f (and symmetrically g)",
          "Positive definiteness via |f(x)|² = |⟨f, k(x,·)⟩|² ≤ ⟨f,f⟩ k(x,x)",
          "Proves the evaluation bound and pointwise convergence from norm convergence",
          "Completion sketched with Cauchy sequences converging pointwise; uniqueness argued",
          "Linear kernel RKHS identified with ‖x ↦ wᵀx‖_H = ‖w‖₂",
        ],
      },
      {
        title: "The representer theorem, the RKHS way",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`**Theorem (representer).** Let $\Omega:[0,\infty)\to\mathbb R$ be strictly increasing and $\mathcal L:\mathbb R^n\to\mathbb R\cup\{\infty\}$ arbitrary. Every minimiser of
$$J(f)=\mathcal L\big(f(x_1),\dots,f(x_n)\big)+\Omega(\|f\|_{\mathcal H})$$
over $\mathcal H$ (if one exists) has the form $f^\star=\sum_{i=1}^n\alpha_ik(x_i,\cdot)$.

Deliverables (‵written/2-representer.pdf‵): (1) prove it by decomposing $f=f_\parallel+f_\perp$ with $f_\parallel\in\mathrm{span}\{k(x_i,\cdot)\}$, showing $f_\perp(x_i)=0$ and $\|f\|^2=\|f_\parallel\|^2+\|f_\perp\|^2$; (2) **contrast** with the SSBD Thm 16.1 proof that works with an explicit feature map $\psi$ — what does the RKHS view buy (infinite-dimensional $\psi$, no need to pick a feature map, uniqueness)?; (3) derive kernel ridge regression $\alpha=(K+n\lambda I)^{-1}y$ for $J(f)=\frac1n\sum_i(f(x_i)-y_i)^2+\lambda\|f\|^2$, and the dual of kernel SVM; (4) give an example of a regulariser that is not strictly increasing where the conclusion fails.`,
        deliverable: "repo",
        files: ["written/2-representer.pdf"],
        rubric: "proof",
        criteria: [
          "Orthogonal decomposition with f_⊥(x_i) = ⟨f_⊥, k(x_i,·)⟩ = 0 via the reproducing property",
          "Strict monotonicity of Ω used to show f_⊥ = 0 at any minimiser",
          "Clear contrast with the SSBD feature-map proof (two or more concrete differences)",
          "Kernel ridge derivation handles a possibly singular K (any solution of K((K + nλI)α − y) = 0)",
          "Valid counter-example for non-strictly-increasing Ω",
        ],
      },
      {
        title: "Generalization of kernel classes",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`**Proposition.** For $\mathcal F_B=\{f\in\mathcal H:\|f\|_{\mathcal H}\le B\}$ and a sample $x_1,\dots,x_n$ with Gram matrix $K$,
$$\frac{B}{\sqrt2\,n}\sqrt{\operatorname{tr}K}\;\le\;R_S(\mathcal F_B)=\frac Bn\,\mathbb E_\sigma\sqrt{\sigma^\top K\sigma}\;\le\;\frac Bn\sqrt{\operatorname{tr}K}.$$

Deliverables (‵written/3-kernel_rademacher.pdf‵): prove the equality (reproducing property + equality case of Cauchy–Schwarz) and both inequalities. Combine with T19 to state a margin bound for kernel SVM with $\sup_xk(x,x)\le\kappa^2$. Then answer: why is this bound **independent of the (possibly infinite) feature dimension**, and how does it compare with the bound you would get from the VC dimension of the RBF-kernel classifier class?`,
        deliverable: "repo",
        files: ["written/3-kernel_rademacher.pdf"],
        rubric: "proof",
        criteria: [
          "sup_{‖f‖≤B} Σσ_i f(x_i) = B‖Σσ_i k(x_i,·)‖_H = B√(σᵀKσ)",
          "Upper bound by Jensen with E σᵀKσ = tr K",
          "Lower bound by Khintchine–Kahane (stated precisely)",
          "Kernel SVM margin bound with 2Bκ/(γ√n) capacity term",
          "Notes the RBF-kernel classifier class has infinite VC dimension, so VC gives nothing",
        ],
      },
      {
        title: "Bochner's theorem and random Fourier features",
        type: "advanced",
        kind: "written",
        points: 1,
        body: md`**Theorem (Bochner).** A continuous shift-invariant kernel $k(x,z)=\kappa(x-z)$ on $\mathbb R^d$ is PSD iff $\kappa$ is the Fourier transform of a finite non-negative measure $\mu$.

Deliverables (‵written/4-random_features.pdf‵): (1) state Bochner precisely and prove the easy direction; (2) compute $\mu$ for the Gaussian kernel $\exp(-\|x-z\|^2/(2s^2))$; (3) show $z(x)=\sqrt{2/D}\,[\cos(\omega_j^\top x+b_j)]_{j\le D}$ with $\omega_j\sim\mu$, $b_j\sim U[0,2\pi]$ gives $\mathbb E\,z(x)^\top z(x')=k(x,x')$; (4) use Hoeffding to bound $|z(x)^\top z(x')-k(x,x')|$ for a fixed pair, and explain what is needed for a uniform bound over a compact set (covering argument from T18).`,
        deliverable: "repo",
        files: ["written/4-random_features.pdf"],
        rubric: "derivation",
        criteria: [
          "Easy direction of Bochner proved (Σ c_i c_j κ(x_i − x_j) = ∫|Σ c_j e^{iωᵀx_j}|² dμ ≥ 0)",
          "Gaussian kernel spectral measure N(0, s⁻²I) computed correctly",
          "Unbiasedness of the random feature inner product via the product-to-sum identity and integrating out b",
          "Pointwise Hoeffding bound with range 4/D per term, and a sketch of the ε-net union bound for uniformity",
        ],
      },
      {
        title: "Kernel ridge & kernel Rademacher bound",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File ‵100-kernels.py‵ (NumPy only, no loops over samples).

- ‵rbf_kernel(X, Z, gamma)‵ — ‵X‵ ‵(n, d)‵, ‵Z‵ ‵(m, d)‵ → ‵(n, m)‵ matrix $\exp(-\gamma\|x_i-z_j\|_2^2)$.
- ‵kernel_ridge(K, y, lam)‵ — return $\alpha=(K+n\lambda I)^{-1}y$ (use ‵np.linalg.solve‵, never an explicit inverse).
- ‵rkhs_norm(K, alpha)‵ — $\|\sum_i\alpha_ik(x_i,\cdot)\|_{\mathcal H}=\sqrt{\alpha^\top K\alpha}$.
- ‵kernel_rademacher_bound(K, B)‵ — $\frac Bn\sqrt{\operatorname{tr}K}$.

In ‵README.md‵, fit kernel ridge on a 1-D toy regression problem and report how $\|f\|_{\mathcal H}$ and the resulting bound change with $\lambda$.

‵‵‵python
m = import_module('100-kernels')
X = np.random.default_rng(0).uniform(-3, 3, size=(50, 1)); y = np.sin(X[:, 0])
K = m.rbf_kernel(X, X, 0.5); a = m.kernel_ridge(K, y, 1e-3)
print(m.rkhs_norm(K, a), m.kernel_rademacher_bound(K, m.rkhs_norm(K, a)))
‵‵‵`,
        files: ["100-kernels.py"],
        checks: [
          { type: "exists", path: "100-kernels.py" },
          { type: "defines", path: "100-kernels.py", names: ["rbf_kernel", "kernel_ridge", "rkhs_norm", "kernel_rademacher_bound"] },
          { type: "not_contains", path: "100-kernels.py", pattern: "linalg\\.inv\\s*\\(", label: "no explicit matrix inverse" },
          {
            type: "py_test", files: ["100-kernels.py"], label: "RBF kernel, kernel ridge and RKHS norm are correct",
            code: IMPORT("100-kernels") + md`rng = np.random.default_rng(0)
X = rng.normal(size=(40, 3)); Z = rng.normal(size=(25, 3))
D2 = ((X[:, None, :] - Z[None, :, :]) ** 2).sum(-1)
assert np.allclose(m.rbf_kernel(X, Z, 0.3), np.exp(-0.3 * D2), atol=1e-10)
K = m.rbf_kernel(X, X, 0.3)
assert np.allclose(K, K.T) and np.allclose(np.diag(K), 1.0)
y = rng.normal(size=40)
a = np.asarray(m.kernel_ridge(K, y, 0.01))
assert np.allclose((K + 40 * 0.01 * np.eye(40)) @ a, y, atol=1e-8)
assert np.isclose(float(m.rkhs_norm(K, a)), np.sqrt(a @ K @ a), rtol=1e-9)`,
          },
          {
            type: "py_test", files: ["100-kernels.py"], label: "Rademacher bound formula and it dominates the MC value",
            code: IMPORT("100-kernels") + md`rng = np.random.default_rng(1)
X = rng.normal(size=(60, 2))
K = m.rbf_kernel(X, X, 1.0) + 0.5 * (X @ X.T)
B = 3.0
ub = float(m.kernel_rademacher_bound(K, B))
assert np.isclose(ub, B * np.sqrt(np.trace(K)) / 60, rtol=1e-9)
S = rng.choice([-1.0, 1.0], size=(5000, 60))
mc = B * np.mean(np.sqrt(np.einsum('ij,jk,ik->i', S, K, S))) / 60
assert mc <= ub + 1e-9 and mc >= ub / np.sqrt(2) - 1e-9, (mc, ub)`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── T21
  {
    id: "T21",
    track: TRACK,
    phase: PHASE,
    title: "Non-convex Optimization Landscapes",
    days: 5,
    repo: REPO,
    dir: "0x14-nonconvex",
    sources: [
      { course: "CS229M", lectures: "Lec 8", topics: "Non-convex optimization: local minima vs saddle points, strict-saddle property, all local minima are global (PCA, matrix completion), escaping saddles" },
    ],
    resources: [
      R.notes,
      { title: "Ge, Huang, Jin & Yuan (2015) — Escaping From Saddle Points: Online SGD for Tensor Decomposition", url: "https://arxiv.org/abs/1503.02101" },
      { title: "Ge, Lee & Ma (2016) — Matrix Completion has No Spurious Local Minimum", url: "https://arxiv.org/abs/1605.07272" },
      { title: "Jin, Ge, Netrapalli, Kakade & Jordan (2017) — How to Escape Saddle Points Efficiently", url: "https://arxiv.org/abs/1703.00887" },
    ],
    concepts: ["First- and second-order stationary points", "Strict saddle property", "All local minima are global", "Landscape of PCA / rank-1 factorization", "Noisy / perturbed gradient descent", "Stable manifolds of saddles"],
    objectives: [
      "State first- and second-order necessary optimality conditions and the (α, γ, ε, δ)-strict-saddle property",
      "Prove that GD on a quadratic with a negative-curvature direction escapes the saddle from almost every initialisation",
      "Characterise all critical points of the PCA objective ¼‖xxᵀ − M‖²_F and classify them",
      "Prove that rank-1 matrix factorization has no spurious local minima",
      "Summarise the Ge et al. (2015) escaping-saddles result and compare with Jin et al. (2017)",
      "Simulate perturbed GD escaping a strict saddle",
    ],
    requirements: [WRITTEN_REQ, CODE_REQ],
    quiz: [
      { q: "At a strict saddle point x of a smooth f:", options: ["∇f(x) = 0 and ∇²f(x) ⪰ 0", "∇f(x) = 0 and λ_min(∇²f(x)) < 0", "∇f(x) ≠ 0", "∇²f(x) = 0"], answer: 1, why: "A strict saddle is a stationary point with a direction of strictly negative curvature." },
      { q: "For f(x) = ¼‖xxᵀ − M‖²_F with M ⪰ 0, eigenvalues λ₁ > λ₂ ≥ …, the local minima are:", options: ["x = 0", "x = ±√λ₁ v₁", "x = ±√λᵢ vᵢ for every i", "there are none"], answer: 1, why: "The other critical points ±√λᵢ vᵢ (i ≥ 2) and 0 have negative curvature along v₁." },
      { q: "Why does randomly initialised GD almost surely avoid strict saddles (for small step size)?", options: ["Saddles have zero gradient norm", "The stable manifold of a strict saddle has measure zero", "GD has momentum", "The Hessian is always PSD"], answer: 1, why: "Center–stable manifold theorem (Lee et al. 2016)." },
      { q: "f(x₁, x₂) = x₁² − x₂² at the origin is:", options: ["a local minimum", "a local maximum", "a strict saddle", "a degenerate saddle"], answer: 2, why: "Gradient 0 and Hessian diag(2, −2) has a negative eigenvalue." },
    ],
    tasks: [
      readmeTask("0x14-nonconvex", ""),
      {
        title: "Strict saddles and why GD escapes them",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`**Definition.** A twice-differentiable $f$ is $(\alpha,\gamma,\varepsilon,\delta)$-strict saddle if every $x$ satisfies at least one of: $\|\nabla f(x)\|\ge\varepsilon$; $\lambda_{\min}(\nabla^2f(x))\le-\gamma$; or $x$ is $\delta$-close to a local minimum around which $f$ is $\alpha$-strongly convex.

Deliverables (‵written/1-strict_saddle.pdf‵):

1. Prove the first- and second-order necessary conditions for a local minimum ($\nabla f=0$, $\nabla^2f\succeq0$) and give an example showing they are not sufficient.
2. **Escape for quadratics.** Let $f(x)=\frac12x^\top Hx$ with $H$ symmetric, $\lambda_{\min}(H)<0$, and GD $x_{t+1}=x_t-\eta\nabla f(x_t)$ with $0<\eta<1/\|H\|_{op}$. Prove that $f(x_t)\to-\infty$ for every $x_0$ outside a subspace of measure zero (identify the subspace), and compute the escape time from distance $r$ to distance 1 along the negative direction.
3. State (no proof) the Lee–Simchowitz–Jordan–Recht result that GD with random initialisation converges to local minimisers of strict-saddle functions almost surely, and the role of the stable-manifold theorem.
4. Explain why a non-strict saddle (e.g. $x_1^3$ or $x_1^2x_2$-type degenerate points) can trap first- and second-order methods.`,
        deliverable: "repo",
        files: ["written/1-strict_saddle.pdf"],
        rubric: "proof",
        criteria: [
          "Correct proofs of the necessary conditions via Taylor expansion along directions",
          "Diagonalises H: component along each eigenvector evolves as (1 − ηλ_i)^t, negative λ ⇒ geometric growth",
          "Identifies the measure-zero set as the span of eigenvectors with λ_i ≥ 0 and computes escape time ≈ log(1/r)/(η|λ_min|)",
          "States the Lee et al. almost-sure result with its assumptions (smoothness, step size < 1/L)",
          "Valid degenerate-saddle example and explanation",
        ],
      },
      {
        title: "The PCA landscape: all local minima are global",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`Let $M\in\mathbb R^{d\times d}$ be symmetric PSD with eigen-decomposition $M=\sum_i\lambda_iv_iv_i^\top$, $\lambda_1>\lambda_2\ge\dots\ge\lambda_d\ge0$, and
$$f(x)=\tfrac14\|xx^\top-M\|_F^2.$$

**Theorem.** The critical points of $f$ are $x=0$ and $x=\pm\sqrt{\lambda_i}\,v_i$ for each $i$ with $\lambda_i>0$. The only local minima are $\pm\sqrt{\lambda_1}v_1$ (which are global); every other critical point is a strict saddle (or a local maximum).

Deliverables (‵written/2-pca_landscape.pdf‵): (1) compute $\nabla f(x)=(\|x\|^2I-M)x$ and $\nabla^2f(x)=\|x\|^2I+2xx^\top-M$; (2) solve $\nabla f=0$ (eigenvector equation); (3) at $x=\pm\sqrt{\lambda_i}v_i$, $i\ge2$, exhibit $v_1$ as a direction with $v_1^\top\nabla^2fv_1=\lambda_i-\lambda_1<0$; at $0$ the Hessian is $-M$; (4) show the Hessian at $\pm\sqrt{\lambda_1}v_1$ is PSD and compute its smallest eigenvalue (relate to the eigengap); (5) what changes if $\lambda_1=\lambda_2$?`,
        deliverable: "repo",
        files: ["written/2-pca_landscape.pdf"],
        rubric: "proof",
        criteria: [
          "Correct gradient and Hessian of the quartic objective",
          "Critical points derived as Mx = ‖x‖²x ⇒ x = 0 or x an eigenvector with ‖x‖² = λ_i",
          "Negative curvature v₁ᵀ∇²f v₁ = λ_i − λ₁ at the non-top critical points; −M at 0",
          "Hessian at ±√λ₁v₁ has eigenvalues 2λ₁ and λ₁ − λ_j (j ≥ 2): smallest is the eigengap (or λ₁ if d = 1)",
          "Degenerate eigenvalue case discussed (a whole circle of global minima, still no spurious minima)",
        ],
      },
      {
        title: "No spurious local minima for rank-1 matrix factorization",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Following CS229M Lec 8 (warm-up for matrix completion), let $z\in\mathbb R^d\setminus\{0\}$ and
$$g(x)=\|xx^\top-zz^\top\|_F^2.$$

**Theorem.** Every local minimum of $g$ is global, i.e. equals $\pm z$.

Deliverables (‵written/3-matrix_factorization.pdf‵): (1) prove it using only first- and second-order conditions: from $\nabla g=0$ derive $x\in\{0\}\cup\{\pm z\}$ or $x\perp z$ cases; use the second-order condition in direction $z$ to rule out $x=0$ and $x\perp z$; (2) state (no proof) the Ge–Lee–Ma (2016) theorem for **matrix completion** with a regulariser: assumptions (incoherence $\mu$, sampling probability $p$), conclusion (all local minima global w.h.p.), and explain in a paragraph what the incoherence regulariser is for; (3) explain why "no spurious local minima + strict saddle" ⇒ polynomial-time convergence of perturbed GD.`,
        deliverable: "repo",
        files: ["written/3-matrix_factorization.pdf"],
        rubric: "proof",
        criteria: [
          "Computes ∇g(x) = 4(‖x‖²x − (zᵀx)z) and solves the stationarity equation case by case",
          "Second-order test in direction z shows negative curvature at x = 0 and at x ⊥ z",
          "Concludes ‖x‖ = ‖z‖ and x = ±z for the remaining case",
          "States the matrix completion theorem with incoherence and sample-complexity assumptions",
          "Links landscape properties to convergence guarantees of saddle-escaping methods",
        ],
      },
      {
        title: "Paper summary: Ge, Huang, Jin & Yuan (2015)",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Write a public blog post (Medium or similar, 1200–2000 words) summarising **"Escaping From Saddle Points — Online Stochastic Gradient for Tensor Decomposition"** (arXiv:1503.02101). Submit the link.

Required sections: (1) problem & motivation (why saddle points, not local minima, are the obstacle); (2) the strict-saddle property exactly as defined in the paper; (3) the algorithm (noisy SGD: what noise, why); (4) main theorem: assumptions and the iteration complexity (polynomial in $d$, $1/\varepsilon$, …), with a proof idea in your words (progress via gradient, via negative curvature, or local strong convexity); (5) the orthogonal tensor decomposition application and why its objective is strict saddle; (6) comparison with Jin et al. 2017 (perturbed GD, $\tilde O(\varepsilon^{-2})$ iterations, polylog $d$ dependence) and an honest limitations paragraph.`,
        deliverable: "link",
        rubric: "summary",
        criteria: [
          "States the strict-saddle definition with all its parameters correctly",
          "Explains the three-case progress argument behind the main theorem",
          "Reports the tensor decomposition application and why its landscape is strict saddle",
          "Correct comparison with Jin et al. (2017): dimension dependence and iteration complexity",
          "Has a critical limitations paragraph (e.g. polynomial degree, strict-saddle verification for real nets)",
        ],
      },
      {
        title: "Perturbed gradient descent on the PCA landscape",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File ‵100-pca_landscape.py‵ (NumPy only), for $f(x)=\frac14\|xx^\top-M\|_F^2$:

- ‵grad(M, x)‵ → $\nabla f(x)=(x^\top x)x-Mx$, shape ‵(d,)‵.
- ‵hessian(M, x)‵ → $\|x\|^2I+2xx^\top-M$, shape ‵(d, d)‵.
- ‵perturbed_gd(M, x0, eta, steps, noise, rng)‵ — starting from ‵x0‵ (do not modify it in place), run ‵steps‵ iterations of
  $x\leftarrow x-\eta\nabla f(x)+\texttt{noise}\cdot\xi$, $\xi=$ ‵rng.standard_normal(d)‵, and return the final $x$.

In ‵README.md‵: start exactly at the saddle $\sqrt{\lambda_2}v_2$, show that plain GD (‵noise=0‵) stays there forever while ‵noise=1e-3‵ escapes, and report the escape time vs. the eigengap.

‵‵‵python
m = import_module('100-pca_landscape')
M = np.diag([3.0, 2.0, 1.0])
x = m.perturbed_gd(M, np.array([0.0, np.sqrt(2.0), 0.0]), 0.05, 2000, 1e-3, np.random.default_rng(0))
print(x)          # ≈ ±(√3, 0, 0)
‵‵‵`,
        files: ["100-pca_landscape.py"],
        checks: [
          { type: "exists", path: "100-pca_landscape.py" },
          { type: "defines", path: "100-pca_landscape.py", names: ["grad", "hessian", "perturbed_gd"] },
          {
            type: "py_test", files: ["100-pca_landscape.py"], label: "gradient (finite differences) and Hessian are correct",
            code: IMPORT("100-pca_landscape") + md`rng = np.random.default_rng(0)
d = 5
Q, _ = np.linalg.qr(rng.normal(size=(d, d)))
lam = np.array([3.0, 2.0, 1.0, 0.5, 0.2])
M = Q @ np.diag(lam) @ Q.T
f = lambda x: 0.25 * np.sum((np.outer(x, x) - M) ** 2)
x = rng.normal(size=d)
g = np.asarray(m.grad(M, x))
num = np.array([(f(x + 1e-6 * e) - f(x - 1e-6 * e)) / 2e-6 for e in np.eye(d)])
assert np.allclose(g, num, atol=1e-5), (g, num)
H = np.asarray(m.hessian(M, x))
assert np.allclose(H, (x @ x) * np.eye(d) + 2 * np.outer(x, x) - M, atol=1e-10)
s = np.sqrt(lam[1]) * Q[:, 1]
assert np.allclose(m.grad(M, s), 0, atol=1e-10)
assert np.linalg.eigvalsh(m.hessian(M, s)).min() < -0.9`,
          },
          {
            type: "py_test", files: ["100-pca_landscape.py"], label: "noise escapes the saddle, no noise stays",
            code: IMPORT("100-pca_landscape") + md`rng = np.random.default_rng(0)
d = 5
Q, _ = np.linalg.qr(rng.normal(size=(d, d)))
lam = np.array([3.0, 2.0, 1.0, 0.5, 0.2])
M = Q @ np.diag(lam) @ Q.T
s = np.sqrt(lam[1]) * Q[:, 1]
x0 = s.copy()
x = np.asarray(m.perturbed_gd(M, x0, 0.05, 2000, 1e-3, np.random.default_rng(1)))
assert np.allclose(x0, s), "x0 was modified in place"
err = np.linalg.norm(np.outer(x, x) - lam[0] * np.outer(Q[:, 0], Q[:, 0]))
assert err < 0.1, err
y = np.asarray(m.perturbed_gd(M, s, 0.05, 100, 0.0, np.random.default_rng(1)))
assert np.allclose(y, s, atol=1e-8)`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── T22
  {
    id: "T22",
    track: TRACK,
    phase: PHASE,
    title: "Implicit Regularization of Gradient Descent",
    days: 8,
    repo: REPO,
    dir: "0x15-implicit_bias",
    sources: [
      { course: "CS229M", lectures: "Lec 9", topics: "Implicit regularization: GD on underdetermined least squares → minimum norm; GD on separable logistic regression → max-margin direction" },
    ],
    resources: [
      R.notes,
      { title: "Soudry, Hoffer, Nacson, Gunasekar & Srebro (2018) — The Implicit Bias of Gradient Descent on Separable Data", url: "https://arxiv.org/abs/1710.10345" },
      { title: "Ji & Telgarsky (2018) — Risk and parameter convergence of logistic regression", url: "https://arxiv.org/abs/1803.07300" },
      { title: "Gunasekar, Lee, Soudry & Srebro (2018) — Characterizing Implicit Bias in Terms of Optimization Geometry", url: "https://arxiv.org/abs/1802.08246" },
      { title: "Gunasekar et al. (2017) — Implicit Regularization in Matrix Factorization", url: "https://arxiv.org/abs/1705.09280" },
    ],
    concepts: ["Implicit vs explicit regularization", "Minimum-norm interpolation", "Separable logistic regression has no finite minimiser", "Hard-margin SVM and its KKT conditions", "Convergence in direction at rate 1/log t", "Exponential-tailed losses", "Steepest descent geometry"],
    objectives: [
      "Prove that GD from zero on underdetermined least squares converges to the minimum-ℓ2-norm interpolant",
      "Prove that GD on separable logistic regression drives the loss to 0 and ‖w_t‖ to ∞",
      "State and prove (Soudry et al. 2018, or the gradient-flow variant) that w_t/‖w_t‖ converges to the hard-margin SVM direction",
      "Explain the w_t = ŵ log t + ρ_t decomposition and derive the 1/log t rate",
      "Explain why validation loss can increase while validation error stays flat during long training",
      "Verify the implicit bias numerically on a dataset with a known max-margin direction",
    ],
    requirements: [WRITTEN_REQ, CODE_REQ, "This project is a single deep proof. Budget ≥ 25 of the ~40 hours for tasks 2–3."],
    quiz: [
      { q: "GD initialised at 0 on min ½‖Xw − y‖² with more parameters than samples (full row rank) converges to:", options: ["any interpolating solution", "the minimum ℓ2-norm interpolant X⁺y", "the minimum ℓ1-norm interpolant", "it diverges"], answer: 1, why: "Iterates stay in the row space of X; the only interpolant in the row space is X⁺y." },
      { q: "On linearly separable data, GD on the logistic loss makes ‖w_t‖ grow like:", options: ["t", "√t", "log t", "it stays bounded"], answer: 2, why: "w_t = ŵ log t + O(1) (Soudry et al.)." },
      { q: "The direction w_t/‖w_t‖ converges to the max-margin direction at rate:", options: ["O(1/t)", "O(1/√t)", "O(1/log t)", "exponentially fast"], answer: 2, why: "The bounded residual ρ_t is divided by ‖ŵ‖ log t." },
      { q: "If least-squares GD is initialised at w₀ ≠ 0 (underdetermined case), it converges to:", options: ["X⁺y", "argmin {‖w − w₀‖ : Xw = y}", "w₀", "argmin {‖w‖ : Xw = y} + w₀"], answer: 1, why: "The component of w₀ orthogonal to the row space never changes." },
    ],
    tasks: [
      readmeTask("0x15-implicit_bias", "4. A section ‵## Proof roadmap‵: the list of lemmas of your Soudry proof (task 3) with one line each, in the order they are used."),
      {
        title: "GD on underdetermined least squares → minimum norm",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Let $X\in\mathbb R^{n\times d}$ with $n<d$ and $\mathrm{rank}(X)=n$, $y\in\mathbb R^n$, $L(w)=\frac1{2n}\|Xw-y\|_2^2$, and GD $w_{t+1}=w_t-\eta\nabla L(w_t)$.

**Theorem.** If $w_0=0$ and $0<\eta<2/\lambda_{\max}(X^\top X/n)$, then $w_t\to X^+y=X^\top(XX^\top)^{-1}y=\arg\min\{\|w\|_2:Xw=y\}$, at a linear rate $\|w_t-X^+y\|\le(1-\eta\lambda_{\min}^+)^t\|X^+y\|$ with $\lambda_{\min}^+$ the smallest non-zero eigenvalue of $X^\top X/n$.

Deliverables (‵written/1-min_norm.pdf‵): (1) prove $w_t\in\mathrm{row}(X)$ for all $t$; (2) prove convergence to an interpolant and the rate; (3) prove that $X^+y$ is the unique interpolant in $\mathrm{row}(X)$ and that it minimises the norm; (4) general $w_0$: identify the limit; (5) show that SGD and GD with momentum (heavy ball) have the same limit, but Adam (coordinate-wise scaling) need not — give a 2-D counter-example or a clear argument.`,
        deliverable: "repo",
        files: ["written/1-min_norm.pdf"],
        rubric: "proof",
        criteria: [
          "Invariant: ∇L(w) = Xᵀ(Xw − y)/n ∈ row(X), hence w_t ∈ row(X) by induction",
          "Linear-rate proof restricted to row(X) using λ⁺_min and the step-size condition",
          "Uniqueness of the interpolant in row(X) and minimum-norm characterisation (Pythagoras with null(X))",
          "Correct limit for general w₀: projection of w₀ onto the affine set {Xw = y}",
          "Momentum/SGD stay in row(X); argument why diagonal preconditioning (Adam) breaks this",
        ],
      },
      {
        title: "Separable logistic regression: loss → 0, norm → ∞",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Let $\{(x_i,y_i)\}_{i=1}^n$ be linearly separable through the origin ($\exists w:\,y_iw^\top x_i>0\ \forall i$), $\ell(u)=\log(1+e^{-u})$, $L(w)=\sum_i\ell(y_iw^\top x_i)$, and GD $w_{t+1}=w_t-\eta\nabla L(w_t)$.

**Lemma.** (a) $L$ is $\beta$-smooth with $\beta\le\frac14\sigma_{\max}^2(X)$. (b) $L$ has no finite minimiser and $\inf L=0$. (c) If $\eta<2/\beta$, then $L(w_{t+1})\le L(w_t)-\eta(1-\frac{\eta\beta}{2})\|\nabla L(w_t)\|^2$, $\sum_t\|\nabla L(w_t)\|^2<\infty$, $L(w_t)\to0$, $\|w_t\|\to\infty$ and $y_iw_t^\top x_i\to\infty$ for every $i$.

Deliverables (‵written/2-logistic_divergence.pdf‵): prove all parts. For $L(w_t)\to0$ you must use separability (hint: $\langle\nabla L(w),w^\star\rangle<0$ for a separator $w^\star$, so $\nabla L\ne0$ everywhere; combine with the descent lemma and show $\|\nabla L(w)\|$ is bounded below on sublevel sets bounded away from 0 — or use the convex-analysis argument of Ji & Telgarsky). Finish by showing $L(w_t)=O(1/t)$.`,
        deliverable: "repo",
        files: ["written/2-logistic_divergence.pdf"],
        rubric: "proof",
        criteria: [
          "Smoothness via ℓ''(u) ≤ 1/4 and ∇²L = Σℓ''·x_ix_iᵀ ⪯ ¼XᵀX",
          "No finite minimiser: L(c w*) → 0 as c → ∞ while L > 0 everywhere",
          "Descent lemma inequality and summability of squared gradient norms",
          "Rigorous argument that L(w_t) → 0 using separability (not just ∇L → 0)",
          "O(1/t) loss rate derived (e.g. via convexity with comparator w* log t / γ)",
        ],
      },
      {
        title: "Convergence in direction to the max-margin solution (Soudry et al.)",
        type: "mandatory",
        kind: "written",
        points: 5,
        body: md`Let $\hat w=\arg\min_w\{\|w\|_2:\;y_iw^\top x_i\ge1\ \forall i\}$ (hard-margin SVM through the origin) with support set $\mathcal S=\{i:y_i\hat w^\top x_i=1\}$.

**Theorem (Soudry, Hoffer, Nacson, Gunasekar, Srebro 2018).** For almost every linearly separable data set, any $w_0$ and any $\eta<2\beta^{-1}$, the GD iterates on the logistic loss satisfy
$$w_t=\hat w\log t+\rho_t,\qquad \sup_t\|\rho_t\|<\infty,\qquad\text{hence}\qquad\lim_{t\to\infty}\frac{w_t}{\|w_t\|}=\frac{\hat w}{\|\hat w\|}.$$

Deliverables (‵written/3-soudry.pdf‵, 6–12 pages). Choose **one** route and say which:

**Route A — the paper's discrete-time proof.** (1) KKT: $\hat w=\sum_{i\in\mathcal S}\alpha_iy_ix_i$, $\alpha_i>0$ (where is "almost every data set" used?). (2) Define $\tilde w$ by $\eta\exp(-y_ix_i^\top\tilde w)=\alpha_i$ for $i\in\mathcal S$ and $r_t=w_t-\hat w\log t-\tilde w$. (3) Show $\|r_{t+1}\|^2-\|r_t\|^2\le C_t$ with $\sum_tC_t<\infty$ by splitting the gradient into support and non-support contributions: non-support terms decay like $t^{-\theta}$ with $\theta=\min_{i\notin\mathcal S}y_i\hat w^\top x_i>1$; support terms are controlled by the sign structure of $r_t$. (4) Conclude boundedness of $r_t$ and the direction limit.

**Route B — gradient flow and the normalised margin** (as in the CS229M notes / Ji–Telgarsky). For $\dot w=-\nabla L(w)$, show the smoothed margin $\tilde\gamma(w)=-\log L(w)/\|w\|$ is (eventually) non-decreasing, $\tilde\gamma(w)\le\gamma(w):=\min_iy_iw^\top x_i/\|w\|\le\tilde\gamma(w)+\frac{\log n}{\|w\|}$, and $\gamma(w_t)\to\gamma^\star=1/\|\hat w\|$; then deduce the direction converges to $\hat w/\|\hat w\|$ by uniqueness of the max-margin direction (strong convexity of $\|\cdot\|^2$).

Either route must end with: the precise statement you proved (any extra assumptions, e.g. "support vectors linearly independent" or "gradient flow" stated explicitly), a discussion of what was hardest, and a 1-page **proof sketch** suitable for the final self-test (blank paper, no references).`,
        deliverable: "repo",
        files: ["written/3-soudry.pdf"],
        rubric: "proof",
        criteria: [
          "Precise theorem statement with every assumption used (separability, step size / gradient flow, non-degeneracy)",
          "KKT characterisation of ŵ with support vectors and positive dual variables (Route A) or the log-sum-exp sandwich γ̃ ≤ γ ≤ γ̃ + log n/‖w‖ (Route B)",
          "Core argument complete: summable increments of ‖r_t‖² with non-support terms O(t^{−θ}), θ > 1 (A) or monotonicity of the smoothed margin and γ(w_t) → γ* (B)",
          "Correct deduction of direction convergence from bounded residual (A) or margin convergence + uniqueness of the SVM direction (B)",
          "Includes a one-page closed-book proof sketch",
        ],
      },
      {
        title: "Rates and consequences",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Deliverables (‵written/4-rates.pdf‵), building on task 3:

1. Show $\Big\|\frac{w_t}{\|w_t\|}-\frac{\hat w}{\|\hat w\|}\Big\|=O\!\big(\frac1{\log t}\big)$ and that the margin gap $\gamma^\star-\gamma(w_t)$ is also $O(1/\log t)$ in general; explain why this is *slow* (how many iterations for a $1\%$ gap?).
2. Show that on separable data the **test logistic loss** can increase for large $t$ even while the test 0-1 error is constant (consider a misclassified test point and the growth of $\|w_t\|$) — relate to the "validation loss goes up" phenomenon and to early stopping.
3. Contrast with the **squared loss** on the same data: where does GD converge and why is there no max-margin bias?
4. Explain what changes for losses with polynomial tails (e.g. $\ell(u)=u^{-k}$ for $u>0$-type tails) vs exponential tails.`,
        deliverable: "repo",
        files: ["written/4-rates.pdf"],
        rubric: "derivation",
        criteria: [
          "Derives the 1/log t direction rate from w_t = ŵ log t + ρ_t with bounded ρ_t",
          "Quantifies slowness (e.g. 1% gap requires t ≈ e^{100·C} iterations)",
          "Shows test log-loss on a misclassified point grows like ‖w_t‖ ∝ log t while the 0-1 error is unchanged",
          "Squared loss converges to the min-norm least-squares solution (no margin maximisation)",
          "Explains the role of exponential tails (only support vectors dominate the gradient asymptotically)",
        ],
      },
      {
        title: "Beyond ℓ2: optimization geometry and matrix factorization",
        type: "advanced",
        kind: "written",
        points: 1,
        body: md`Write a 2–3 page note (‵written/5-geometry.pdf‵) summarising: (1) Gunasekar, Lee, Soudry & Srebro 2018 (arXiv:1802.08246): steepest descent w.r.t. a norm $\|\cdot\|$ on separable data with exponential loss converges in direction to the $\|\cdot\|$-max-margin solution — state it, and work out the $\ell_1$ case (coordinate descent / AdaBoost connection from Pass 1, Week 9); (2) mirror descent on underdetermined regression converges to the minimum-Bregman-divergence interpolant (state & prove for the least-squares case); (3) the matrix-factorization conjecture of Gunasekar et al. 2017 (arXiv:1705.09280): GD on $U U^\top$ with small init → minimum nuclear norm — state it and mention its status.`,
        deliverable: "repo",
        files: ["written/5-geometry.pdf"],
        rubric: "summary",
        criteria: [
          "Correct statement of the steepest-descent implicit-bias theorem and the ℓ1 / AdaBoost connection",
          "Mirror-descent minimum-Bregman interpolant statement with a valid proof for least squares",
          "Matrix factorization conjecture stated with small-initialisation assumption and its known status",
        ],
      },
      {
        title: "Watching the implicit bias happen",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File ‵100-implicit_bias.py‵ (NumPy only).

- ‵gd_least_squares(X, y, eta, steps)‵ — GD from $w_0=0$ on $L(w)=\frac1{2n}\|Xw-y\|^2$; return the final $w$ ‵(d,)‵.
- ‵gd_logistic(X, y, eta, steps)‵ — GD from $w_0=0$ on the **mean** logistic loss $L(w)=\frac1n\sum_i\log(1+e^{-y_ix_i^\top w})$, $y_i\in\{\pm1\}$; return the final $w$. Use a numerically stable sigmoid (e.g. via ‵np.exp(-np.logaddexp(0, m))‵) — margins become large.
- ‵normalized_margin(X, y, w)‵ — $\min_iy_ix_i^\top w/\|w\|_2$.

No loops over samples (the loop over ‵steps‵ is expected). In ‵README.md‵: on the 2-D data set of the example, plot $\cos\angle(w_t,\hat w)$ and the normalised margin vs $\log t$ (they should creep to 1 slowly), and the training loss vs $t$ on a log-log scale.

‵‵‵python
m = import_module('100-implicit_bias')
X = np.array([[1, 0], [4, 4], [5, 3], [3, 5], [-1, 0], [-4, -4], [-5, -3], [-3, -5]], float)
y = np.array([1, 1, 1, 1, -1, -1, -1, -1], float)
w = m.gd_logistic(X, y, 0.1, 20000)
print(w / np.linalg.norm(w), m.normalized_margin(X, y, w))   # → (1, 0) and → 1 (the max margin)
‵‵‵`,
        files: ["100-implicit_bias.py"],
        checks: [
          { type: "exists", path: "100-implicit_bias.py" },
          { type: "defines", path: "100-implicit_bias.py", names: ["gd_least_squares", "gd_logistic", "normalized_margin"] },
          {
            type: "py_test", files: ["100-implicit_bias.py"], label: "least-squares GD converges to the min-norm solution",
            code: IMPORT("100-implicit_bias") + md`rng = np.random.default_rng(0)
X = rng.normal(size=(8, 30)); y = rng.normal(size=8)
eta = 1.0 / np.linalg.eigvalsh(X.T @ X / 8).max()
w = np.asarray(m.gd_least_squares(X, y, eta, 5000))
assert np.allclose(w, np.linalg.pinv(X) @ y, atol=1e-6), np.abs(w - np.linalg.pinv(X) @ y).max()
w5 = np.asarray(m.gd_least_squares(X, y, eta, 5))
ref = np.zeros(30)
for _ in range(5):
    ref = ref - eta * X.T @ (X @ ref - y) / 8
assert np.allclose(w5, ref, atol=1e-10)`,
          },
          {
            type: "py_test", files: ["100-implicit_bias.py"], label: "logistic GD matches reference and approaches the max-margin direction",
            code: IMPORT("100-implicit_bias") + md`X = np.array([[1, 0], [4, 4], [5, 3], [3, 5], [-1, 0], [-4, -4], [-5, -3], [-3, -5]], float)
y = np.array([1, 1, 1, 1, -1, -1, -1, -1], float)
def ref_gd(eta, steps):
    w = np.zeros(2)
    for _ in range(steps):
        mg = y * (X @ w)
        w = w + eta * (X * (y * np.exp(-np.logaddexp(0, mg)))[:, None]).mean(0)
    return w
w = np.asarray(m.gd_logistic(X, y, 0.1, 20000), dtype=float)
assert np.allclose(w, ref_gd(0.1, 20000), rtol=1e-6, atol=1e-8), w
early = np.asarray(m.gd_logistic(X, y, 0.1, 50), dtype=float)
c_late = w[0] / np.linalg.norm(w); c_early = early[0] / np.linalg.norm(early)
assert c_late > 0.99 and c_late > c_early + 0.05, (c_early, c_late)
nm = float(m.normalized_margin(X, y, w))
assert np.isclose(nm, np.min(y * (X @ w)) / np.linalg.norm(w)) and nm > 0.99`,
          },
        ],
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── T23
  {
    id: "T23",
    track: TRACK,
    phase: PHASE,
    title: "Neural Tangent Kernel & Lazy Training",
    days: 7,
    repo: REPO,
    dir: "0x16-ntk",
    sources: [
      { course: "CS229M", lectures: "Lec 10", topics: "Neural tangent kernel, linearization around initialization, lazy training, infinite-width limit, global convergence of over-parameterized 2-layer nets" },
    ],
    resources: [
      R.notes,
      { title: "Jacot, Gabriel & Hongler (2018) — Neural Tangent Kernel: Convergence and Generalization in Neural Networks", url: "https://arxiv.org/abs/1806.07572" },
      { title: "Du, Zhai, Poczos & Singh (2018) — Gradient Descent Provably Optimizes Over-parameterized Neural Networks", url: "https://arxiv.org/abs/1810.02054" },
      { title: "Chizat, Oyallon & Bach (2018) — On Lazy Training in Differentiable Programming", url: "https://arxiv.org/abs/1812.07956" },
      { title: "Arora et al. (2019) — On Exact Computation with an Infinitely Wide Neural Net", url: "https://arxiv.org/abs/1904.11955" },
    ],
    concepts: ["Linearization f(θ) ≈ f(θ₀) + ⟨∇f(θ₀), θ − θ₀⟩", "Neural tangent kernel", "NTK parametrization (1/√m scaling)", "Kernel gradient flow", "Arc-cosine kernels", "Lazy training regime", "Feature learning vs kernel regime"],
    objectives: [
      "Derive the function-space dynamics du/dt = −K(t)(u − y) of gradient flow on the squared loss",
      "Prove linear convergence when the tangent kernel stays close to a positive-definite kernel",
      "Derive by hand the infinite-width NTK of a 2-layer ReLU network (both layers trained), in closed form",
      "Explain why weights move O(1/√m) per neuron and why the kernel stays nearly constant (lazy training)",
      "Summarise Jacot et al. (2018) and its limitations (no feature learning)",
      "Verify numerically that the empirical NTK converges to the analytic one as width grows",
    ],
    requirements: [WRITTEN_REQ, CODE_REQ],
    quiz: [
      { q: "In the NTK parametrization f(x) = (1/√m) Σᵣ aᵣ σ(wᵣᵀx), how far does each wᵣ move during training (to reach zero loss) as m → ∞?", options: ["O(1)", "O(1/√m)", "O(√m)", "O(log m)"], answer: 1, why: "The total change needed is O(1) in function space, spread over m neurons each scaled by 1/√m." },
      { q: "If the tangent kernel matrix stays constant with λ_min(K) = λ₀ > 0, gradient flow on ½‖u − y‖² gives:", options: ["‖u(t) − y‖ ≤ e^{−λ₀t}‖u(0) − y‖", "‖u(t) − y‖ ≤ ‖u(0) − y‖/t", "no convergence guarantee", "convergence only for linear models"], answer: 0, why: "d/dt‖u − y‖² = −2(u − y)ᵀK(u − y) ≤ −2λ₀‖u − y‖²." },
      { q: "For x = z with ‖x‖ = 1, the 2-layer ReLU NTK (both layers, standard Gaussian init) equals:", options: ["1/2", "1", "1/π", "2"], answer: 1, why: "Each of the two terms contributes ‖x‖²/2 at angle θ = 0." },
      { q: "The main conceptual limitation of the NTK regime is that:", options: ["it needs infinite data", "features (first-layer representations) essentially do not change, so there is no feature learning", "it only works for ReLU", "it cannot interpolate"], answer: 1, why: "Training is equivalent to kernel regression with a fixed kernel." },
    ],
    tasks: [
      readmeTask("0x16-ntk", ""),
      {
        title: "Linearization and kernel gradient flow",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Let $f(\theta,x)$ be a model, $u(t)=(f(\theta(t),x_i))_{i\le n}$, and gradient flow $\dot\theta=-\nabla_\theta\frac12\|u-y\|^2$.

**Proposition.** (a) $\dot u(t)=-K(t)(u(t)-y)$ with $K(t)_{ij}=\langle\nabla_\theta f(\theta(t),x_i),\nabla_\theta f(\theta(t),x_j)\rangle$. (b) If $\lambda_{\min}(K(t))\ge\lambda_0/2>0$ for all $t\le T$, then $\|u(t)-y\|^2\le e^{-\lambda_0t}\|u(0)-y\|^2$ for $t\le T$. (c) For the linearised model $f^{\rm lin}(\theta,x)=f(\theta_0,x)+\langle\nabla f(\theta_0,x),\theta-\theta_0\rangle$, the prediction at a test point is the kernel-regression interpolant with kernel $K_0$ (plus the initial function).

Deliverables (‵written/1-linearization.pdf‵): prove (a)–(c); for (c) solve the linear ODE explicitly and take $t\to\infty$. Then explain, with the Chizat–Oyallon–Bach scaling $f_\alpha=\alpha f$, why a large output scale $\alpha$ forces lazy training: show the relative change of the Jacobian needed to fit the data scales like $1/\alpha$ (heuristic computation is fine, but be explicit).`,
        deliverable: "repo",
        files: ["written/1-linearization.pdf"],
        rubric: "derivation",
        criteria: [
          "Chain rule derivation of u̇ = −K(u − y) with the correct Gram matrix of Jacobians",
          "Grönwall-style argument for exponential decay from the λ_min lower bound",
          "Explicit solution of the linearised dynamics and identification of the kernel-regression predictor at t → ∞",
          "Chizat–Oyallon–Bach scaling argument: parameter movement O(1/α) while Jacobian is fixed at O(1)",
        ],
      },
      {
        title: "The NTK of a two-layer ReLU network, by hand",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`Consider $f(x)=\frac1{\sqrt m}\sum_{r=1}^ma_r\,\sigma(w_r^\top x)$, $\sigma(z)=\max(z,0)$, with i.i.d. $w_r\sim\mathcal N(0,I_d)$ and $a_r\sim\mathcal N(0,1)$, both layers trained.

**Theorem.** As $m\to\infty$, for fixed $x,z\in\mathbb R^d\setminus\{0\}$ with angle $\theta=\arccos\frac{x^\top z}{\|x\|\|z\|}$, the empirical NTK at initialisation converges almost surely to
$$K^\infty(x,z)=\underbrace{\frac{\|x\|\|z\|}{2\pi}\big(\sin\theta+(\pi-\theta)\cos\theta\big)}_{\mathbb E[\sigma(w^\top x)\sigma(w^\top z)]}\;+\;\underbrace{x^\top z\,\frac{\pi-\theta}{2\pi}}_{x^\top z\,\mathbb E[\mathbf 1\{w^\top x>0\}\mathbf 1\{w^\top z>0\}]}.$$

Deliverables (‵written/2-ntk_relu.pdf‵):

1. Compute $\partial f/\partial a_r$ and $\partial f/\partial w_r$ and write the empirical NTK $K_m(x,z)$ as an average over neurons.
2. Derive $\mathbb E[\mathbf 1\{w^\top x>0\}\mathbf 1\{w^\top z>0\}]=\frac{\pi-\theta}{2\pi}$ (reduce to the 2-D plane spanned by $x,z$; rotational invariance).
3. Derive the arc-cosine kernel $\mathbb E[\sigma(w^\top x)\sigma(w^\top z)]$ in closed form (polar coordinates in that plane — show the integral).
4. Prove the a.s. convergence and a finite-$m$ concentration bound $|K_m(x,z)-K^\infty(x,z)|\lesssim\|x\|\|z\|\sqrt{\log(1/\delta)/m}$ (which terms are sub-exponential, which bounded?).
5. Show $K^\infty$ restricted to the unit sphere is positive definite on any set of pairwise non-parallel points (sketch, citing Jacot et al. / Du et al.).`,
        deliverable: "repo",
        files: ["written/2-ntk_relu.pdf"],
        rubric: "derivation",
        criteria: [
          "Correct gradients: ∂f/∂a_r = σ(w_rᵀx)/√m, ∂f/∂w_r = a_r 1{w_rᵀx > 0} x/√m, and K_m as a neuron average",
          "Indicator expectation (π − θ)/(2π) via the 2-D reduction",
          "Arc-cosine integral computed explicitly to (‖x‖‖z‖/2π)(sin θ + (π − θ)cos θ)",
          "Concentration argument identifies sub-exponential terms (a_r², products of Gaussians) and uses Bernstein",
          "Positive-definiteness statement with correct assumptions",
        ],
      },
      {
        title: "Lazy training: global convergence of wide two-layer nets",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`Train only the first layer of $f(x)=\frac1{\sqrt m}\sum_ra_r\sigma(w_r^\top x)$ with $a_r\sim\mathrm{Unif}\{\pm1\}$ fixed, $\|x_i\|=1$, by gradient flow on $\frac12\sum_i(f(x_i)-y_i)^2$. Let $H^\infty_{ij}=x_i^\top x_j\,\mathbb E[\mathbf 1\{w^\top x_i>0,\,w^\top x_j>0\}]$ and $\lambda_0=\lambda_{\min}(H^\infty)>0$.

**Theorem (Du, Zhai, Poczos, Singh 2018).** If $m=\Omega\big(\frac{n^6}{\lambda_0^4\delta^3}\big)$, then w.p. $\ge1-\delta$ over the initialisation, $\|u(t)-y\|^2\le e^{-\lambda_0t}\|u(0)-y\|^2$ for all $t\ge0$, and $\|w_r(t)-w_r(0)\|\le R':=\frac{4\sqrt n\,\|y-u(0)\|}{\sqrt m\,\lambda_0}$ for every $r$ and all $t$.

Deliverables (‵written/3-lazy_training.pdf‵): prove the four key lemmas (constants may be loose): (i) $\|H(0)-H^\infty\|$ small w.h.p. (Hoeffding per entry + union bound); (ii) w.h.p., for all weights with $\|w_r-w_r(0)\|\le R=\frac{c\,\delta\lambda_0}{n^2}$ one has $\|H(w)-H(0)\|_2<\lambda_0/4$ — the fraction of neurons whose activation pattern on some $x_i$ can flip is small (anti-concentration of $w_r(0)^\top x_i$ near 0); (iii) while $\lambda_{\min}(H(t))\ge\lambda_0/2$, the weights move at most $R'$; (iv) the **continuous induction** argument that closes the loop when $R'<R$. Finish with a paragraph on why this regime does **not** explain feature learning.`,
        deliverable: "repo",
        files: ["written/3-lazy_training.pdf"],
        rubric: "proof",
        criteria: [
          "Initial-kernel concentration with entry-wise Hoeffding and a union bound over n² entries",
          "Activation-flip argument: P(|w_r(0)ᵀx_i| ≤ R) ≤ 2R/√(2π) and its consequence for ‖H(t) − H(0)‖",
          "Weight-movement bound by integrating ‖ẇ_r‖ ≤ (√n/√m)‖u − y‖ against the exponential decay",
          "Continuous-induction / first-exit-time argument that keeps λ_min(H(t)) ≥ λ₀/2 for all t",
          "Explains the absence of feature learning in this regime",
        ],
      },
      {
        title: "Reading notes: Jacot, Gabriel & Hongler (2018)",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Publish a blog post (Medium or similar, 1200–2000 words) on **"Neural Tangent Kernel: Convergence and Generalization in Neural Networks"** (arXiv:1806.07572) and submit the link.

Required: (1) the NTK parametrization and why it differs from standard parametrization; (2) Theorem 1 (convergence of the NTK at initialisation to a deterministic limit, layer-wise recursion) and Theorem 2 (stability during training) — state both precisely; (3) kernel gradient descent in function space and the positive-definiteness result; (4) the consequence for least-squares training (convergence along kernel principal components, early stopping interpretation); (5) a critical section: lazy vs feature-learning regimes (Chizat et al. 2018), empirical gap between finite nets and NTK (cite Arora et al. 2019 numbers), and your own view.`,
        deliverable: "link",
        rubric: "summary",
        criteria: [
          "NTK parametrization explained with the 1/√n_l scaling per layer",
          "Both main theorems stated precisely with their assumptions (Lipschitz σ, infinite-width sequential limit, bounded training time integral)",
          "Explains kernel gradient descent and convergence along kernel eigen-directions",
          "Critical section discusses the lazy/feature-learning distinction with references",
        ],
      },
      {
        title: "Analytic vs empirical NTK",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File ‵100-ntk.py‵ (NumPy only, no loops over samples or neurons).

- ‵ntk_relu(X, Z)‵ — analytic infinite-width NTK $K^\infty$ of task 2 for ‵X‵ ‵(n, d)‵, ‵Z‵ ‵(p, d)‵ (non-zero rows) → ‵(n, p)‵. Clip cosines to $[-1,1]$ before ‵arccos‵.
- ‵empirical_ntk(X, Z, W, a)‵ — finite-width NTK at parameters ‵W‵ ‵(m, d)‵ (rows $w_r$), ‵a‵ ‵(m,)‵ for $f(x)=\frac1{\sqrt m}\sum_ra_r\max(w_r^\top x,0)$, both layers:
  $$K_m(x,z)=\frac1m\sum_r\sigma(w_r^\top x)\sigma(w_r^\top z)+\frac{x^\top z}{m}\sum_ra_r^2\,\mathbf 1\{w_r^\top x>0\}\mathbf 1\{w_r^\top z>0\}.$$

In ‵README.md‵: plot $\max_{ij}|K_m-K^\infty|$ vs $m\in\{10,100,10^3,10^4,10^5\}$ on log-log axes and check the $m^{-1/2}$ slope.

‵‵‵python
m_ = import_module('100-ntk')
X = np.random.default_rng(0).normal(size=(4, 3))
rng = np.random.default_rng(1); W = rng.normal(size=(100000, 3)); a = rng.normal(size=100000)
print(np.abs(m_.empirical_ntk(X, X, W, a) - m_.ntk_relu(X, X)).max())   # small, ~1e-2
‵‵‵`,
        files: ["100-ntk.py"],
        checks: [
          { type: "exists", path: "100-ntk.py" },
          { type: "defines", path: "100-ntk.py", names: ["ntk_relu", "empirical_ntk"] },
          {
            type: "py_test", files: ["100-ntk.py"], label: "empirical NTK matches the Jacobian Gram matrix",
            code: IMPORT("100-ntk") + md`rng = np.random.default_rng(0)
X = rng.normal(size=(5, 3)); Z = rng.normal(size=(4, 3))
W = rng.normal(size=(64, 3)); a = rng.normal(size=64)
def jac(x):
    pre = W @ x
    return np.concatenate([np.maximum(pre, 0), ((a * (pre > 0))[:, None] * x[None, :]).ravel()]) / np.sqrt(64)
JX = np.stack([jac(x) for x in X]); JZ = np.stack([jac(z) for z in Z])
assert np.allclose(m.empirical_ntk(X, Z, W, a), JX @ JZ.T, atol=1e-10)`,
          },
          {
            type: "py_test", files: ["100-ntk.py"], label: "analytic NTK: diagonal, symmetry and infinite-width limit",
            code: IMPORT("100-ntk") + md`rng = np.random.default_rng(0)
X = rng.normal(size=(4, 3))
K = np.asarray(m.ntk_relu(X, X))
assert K.shape == (4, 4) and np.allclose(K, K.T, atol=1e-10)
assert np.allclose(np.diag(K), (X ** 2).sum(1), atol=1e-8)
nx = np.linalg.norm(X, axis=1); C = np.clip((X @ X.T) / np.outer(nx, nx), -1, 1); th = np.arccos(C)
ref = np.outer(nx, nx) / (2 * np.pi) * (np.sin(th) + (np.pi - th) * C) + (X @ X.T) * (np.pi - th) / (2 * np.pi)
assert np.allclose(K, ref, atol=1e-8)
assert np.allclose(m.ntk_relu(X[:1], -X[:1]), 0.0, atol=1e-8)
r = np.random.default_rng(1); W = r.normal(size=(200000, 3)); a = r.normal(size=200000)
E = np.asarray(m.empirical_ntk(X, X, W, a))
assert np.abs(E - K).max() < 0.05 * max(1.0, np.abs(K).max()), np.abs(E - K).max()`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── T24
  {
    id: "T24",
    track: TRACK,
    phase: PHASE,
    title: "Double Descent & Benign Overfitting",
    days: 5,
    repo: REPO,
    dir: "0x17-double_descent",
    sources: [
      { course: "CS229M", lectures: "Lec 11", topics: "Double descent, interpolation, benign overfitting, minimum-norm estimators in the over-parameterized regime" },
      { course: "BD", lectures: "Lec 6", topics: "Recap: bias–complexity tradeoff (SSBD Ch. 5) from Pass 1" },
    ],
    resources: [
      R.notes,
      { title: "Belkin, Hsu, Ma & Mandal (2019) — Reconciling modern machine learning practice and the bias-variance trade-off", url: "https://arxiv.org/abs/1812.11118" },
      { title: "Bartlett, Long, Lugosi & Tsigler (2019) — Benign Overfitting in Linear Regression", url: "https://arxiv.org/abs/1906.11300" },
      { title: "Hastie, Montanari, Rosset & Tibshirani (2019) — Surprises in High-Dimensional Ridgeless Least Squares Interpolation", url: "https://arxiv.org/abs/1903.08560" },
      { title: "Belkin, Hsu & Xu (2019) — Two models of double descent for weak features", url: "https://arxiv.org/abs/1903.07571" },
      { title: "Nakkiran et al. (2019) — Deep Double Descent", url: "https://arxiv.org/abs/1912.02292" },
    ],
    concepts: ["Interpolation threshold", "Minimum-norm least squares", "Inverse-Wishart moments", "Double-descent risk curve", "Effective ranks r₀(Σ), R_k(Σ)", "Benign vs catastrophic overfitting", "Capacity as norm vs parameter count"],
    objectives: [
      "Derive the exact risk of minimum-norm least squares with isotropic Gaussian features on both sides of p = n",
      "Explain why the variance blows up at the interpolation threshold",
      "Summarise Belkin et al. (2019) and its experiments",
      "State the Bartlett–Long–Lugosi–Tsigler benign-overfitting theorem in terms of effective ranks",
      "Reconcile double descent with the classical bias–complexity tradeoff of Pass 1",
      "Reproduce a double-descent curve with random ReLU features",
    ],
    requirements: [WRITTEN_REQ, CODE_REQ],
    quiz: [
      { q: "For min-norm least squares with p random features and n samples, the test error typically peaks at:", options: ["p ≈ n/2", "p ≈ n", "p ≈ 2n", "p → ∞"], answer: 1, why: "At p = n the design matrix is square and badly conditioned, so the interpolant has a huge norm." },
      { q: "With isotropic Gaussian x ∈ ℝᵖ, p > n + 1, noise variance σ², the variance term of the min-norm estimator equals:", options: ["σ² p/(n − p − 1)", "σ² n/(p − n − 1)", "σ² p/n", "σ²"], answer: 1, why: "E tr((XXᵀ)⁻¹) = n/(p − n − 1) for X with i.i.d. N(0,1) entries." },
      { q: "Benign overfitting in linear regression (Bartlett et al.) requires, roughly:", options: ["Σ = I with p ≫ n", "a few strong directions plus many weak directions whose total variance (effective rank) is large compared to n", "p < n", "noise-free labels"], answer: 1, why: "The tail of the spectrum absorbs the noise without hurting the prediction." },
      { q: "The classical U-shaped curve of Pass 1 describes which regime of the double-descent plot?", options: ["The under-parameterized regime p < n", "The over-parameterized regime p > n", "Only p = n", "Neither"], answer: 0, why: "Capacity measured by parameter count is meaningful until interpolation; beyond it the min-norm bias takes over." },
    ],
    tasks: [
      readmeTask("0x17-double_descent", ""),
      {
        title: "Exact risk of minimum-norm least squares",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`Let $x\sim\mathcal N(0,I_p)$, $y=x^\top\beta+\varepsilon$, $\varepsilon\sim\mathcal N(0,\sigma^2)$ independent, $n$ i.i.d. samples $X\in\mathbb R^{n\times p}$, and $\hat\beta=X^+y$ (minimum-norm least squares). Let $R(\hat\beta)=\mathbb E_{x}(x^\top\hat\beta-x^\top\beta)^2=\|\hat\beta-\beta\|^2$.

**Theorem.** (i) If $p<n-1$: $\;\mathbb E\,R(\hat\beta)=\sigma^2\frac{p}{n-p-1}$. (ii) If $p>n+1$: $\;\mathbb E\,R(\hat\beta)=\|\beta\|^2\Big(1-\frac np\Big)+\sigma^2\frac{n}{p-n-1}$.

Deliverables (‵written/1-minnorm_risk.pdf‵): (1) bias–variance decomposition of $R$ conditional on $X$; (2) for (i) use $\mathbb E[(X^\top X)^{-1}]=\frac{I}{n-p-1}$ (inverse-Wishart — state it; prove it if you can); (3) for (ii) show the bias is $\|(I-P_X)\beta\|^2$ with $P_X$ the projection onto $\mathrm{row}(X)$ and use rotational invariance to get $\mathbb E\|(I-P_X)\beta\|^2=(1-n/p)\|\beta\|^2$; for the variance use $\mathbb E\operatorname{tr}((XX^\top)^{-1})=\frac{n}{p-n-1}$; (4) plot the curve for $n=100$, $\sigma^2=0.25$, $\|\beta\|=1$ and identify the minimum on each side and the peak; (5) explain why ridge with optimal $\lambda$ removes the peak.`,
        deliverable: "repo",
        files: ["written/1-minnorm_risk.pdf"],
        rubric: "derivation",
        criteria: [
          "Conditional decomposition into bias ‖(I − P_X)β‖² and variance σ² tr((XᵀX)⁺)",
          "Underparameterized formula σ²p/(n − p − 1) via the inverse-Wishart mean",
          "Overparameterized bias (1 − n/p)‖β‖² via rotational invariance of the random n-dim row space",
          "Overparameterized variance σ²n/(p − n − 1)",
          "Plot with the blow-up at p ≈ n and correct discussion of ridge regularisation",
        ],
      },
      {
        title: "Paper summary: Belkin, Hsu, Ma & Mandal (2019)",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Publish a blog post (Medium or similar, 1000–1800 words) on **"Reconciling modern machine learning practice and the bias-variance trade-off"** (arXiv:1812.11118) and submit the link.

Cover: (1) the classical U-curve and what "capacity" means there; (2) the double-descent curve and the interpolation threshold; (3) the experiments — random Fourier features on MNIST, two-layer networks, decision trees / random forests: what is the capacity axis in each?; (4) the proposed mechanism (minimum-norm / smoothest interpolant as inductive bias); (5) critique: what the paper does **not** prove, and how later theory (Hastie et al., Bartlett et al.) made it precise.`,
        deliverable: "link",
        rubric: "summary",
        criteria: [
          "Defines the interpolation threshold and the two regimes precisely",
          "Describes all three experimental families with their capacity axes",
          "Explains the minimum-norm inductive bias mechanism",
          "Critique connects to subsequent rigorous results",
        ],
      },
      {
        title: "Reconciling double descent with the bias–complexity tradeoff",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Essay (‵written/3-reconciliation.pdf‵, 3–4 pages) answering: **is double descent a contradiction of Pass 1 (T05: bias–complexity tradeoff, No Free Lunch)?**

Must address: (1) the SSBD decomposition $L_{\mathcal D}(h_S)=\varepsilon_{\rm app}+\varepsilon_{\rm est}$ and which hypothesis class is *actually* being searched when GD returns the min-norm interpolant (connect to T22); (2) why parameter count is the wrong complexity measure past the threshold and why a norm-based Rademacher bound (T17/T19) is the right one — compute $\|\hat\beta\|$ as a function of $p$ from task 1 and show it peaks at $p=n$; (3) why uniform-convergence bounds alone cannot explain interpolating predictors with noisy labels (Nagarajan–Kolter style argument; state the claim); (4) the benign-overfitting picture (task 4). Conclude with a precise one-paragraph statement of what *does* remain true from Pass 1.`,
        deliverable: "repo",
        files: ["written/3-reconciliation.pdf"],
        rubric: "essay",
        criteria: [
          "Identifies the effective hypothesis class as a norm ball selected implicitly by the algorithm",
          "Computes or plots E‖β̂‖² vs p and links its peak to the risk peak",
          "Explains the limitation of uniform convergence for interpolators with label noise",
          "Integrates benign overfitting and states clearly what of Pass 1 remains valid (NFL, estimation/approximation tradeoff in the right capacity measure)",
        ],
      },
      {
        title: "Benign overfitting: the effective-rank conditions",
        type: "advanced",
        kind: "written",
        points: 2,
        body: md`Let $x=\Sigma^{1/2}z$ with sub-Gaussian $z$, eigenvalues $\lambda_1\ge\lambda_2\ge\dots$ of $\Sigma$, and define $r_k(\Sigma)=\frac{\sum_{i>k}\lambda_i}{\lambda_{k+1}}$, $R_k(\Sigma)=\frac{(\sum_{i>k}\lambda_i)^2}{\sum_{i>k}\lambda_i^2}$, $k^*=\min\{k:r_k(\Sigma)\ge bn\}$.

**Theorem (Bartlett, Long, Lugosi, Tsigler 2020, informal).** The excess risk of the min-norm interpolator satisfies, w.h.p.,
$$R(\hat\beta)\lesssim\|\beta\|^2\|\Sigma\|\max\Big\{\sqrt{\tfrac{r_0(\Sigma)}{n}},\tfrac{r_0(\Sigma)}{n}\Big\}+\sigma^2\Big(\frac{k^*}{n}+\frac{n}{R_{k^*}(\Sigma)}\Big),$$
with a matching lower bound for the variance term. Overfitting is benign iff $r_0(\Sigma)=o(n)$, $k^*/n\to0$, $n/R_{k^*}(\Sigma)\to0$.

Deliverables (‵written/4-benign.pdf‵): (1) derive the conditional variance $\sigma^2\operatorname{tr}\big((XX^\top)^{-2}X\Sigma X^\top\big)$; (2) explain each term of the bound; (3) check the conditions for $\Sigma=I_p$ (show it is **not** benign for $p\asymp n$, and also fails as $p/n\to\infty$ because the bias term does not vanish) and for a two-scale spectrum $\lambda_i=1$ for $i\le s$, $\lambda_i=\epsilon$ for $s<i\le p$ — find scalings of $(s,p,\epsilon)$ in $n$ that make it benign.`,
        deliverable: "repo",
        files: ["written/4-benign.pdf"],
        rubric: "derivation",
        criteria: [
          "Correct conditional variance formula for the min-norm estimator",
          "Interprets k*/n (few strong directions) and n/R_{k*} (many weak directions absorbing noise)",
          "Isotropic case analysed correctly in both regimes",
          "Two-scale example with explicit scalings satisfying all conditions (s = o(n), p = ω(n), pε = o(n))",
        ],
      },
      {
        title: "Double descent with random ReLU features",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File ‵100-double_descent.py‵ (NumPy only).

- ‵relu_features(X, W)‵ — ‵X‵ ‵(n, d)‵, ‵W‵ ‵(p, d)‵ → $\Phi=\max(XW^\top,0)$, shape ‵(n, p)‵ (no scaling).
- ‵min_norm_fit(Phi, y)‵ — minimum-norm least-squares coefficients $\Phi^+y$ (valid for both $p<n$ and $p>n$; ‵np.linalg.pinv‵ or ‵np.linalg.lstsq‵ are fine).
- ‵double_descent_curve(X_tr, y_tr, X_te, y_te, widths, n_repeats, rng)‵ — for each ‵p‵ in ‵widths‵, average over ‵n_repeats‵ draws of ‵W = rng.standard_normal((p, d)) / np.sqrt(d)‵ the test MSE $\frac1{n_{te}}\|\Phi_{te}\hat\theta-y_{te}\|^2$; return a 1-D array of length ‵len(widths)‵.

In ‵README.md‵: plot the curve (log-scale y) for $n=40$, $d=10$, noise std $0.3$, widths from 2 to 2000, mark $p=n$, and add the training error curve.

‵‵‵python
m = import_module('100-double_descent')
rng = np.random.default_rng(0)
beta = rng.normal(size=10) / np.sqrt(10)
Xtr = rng.normal(size=(40, 10)); ytr = Xtr @ beta + 0.3 * rng.normal(size=40)
Xte = rng.normal(size=(1000, 10)); yte = Xte @ beta
print(m.double_descent_curve(Xtr, ytr, Xte, yte, [10, 40, 400], 5, rng))   # peak in the middle
‵‵‵`,
        files: ["100-double_descent.py"],
        checks: [
          { type: "exists", path: "100-double_descent.py" },
          { type: "defines", path: "100-double_descent.py", names: ["relu_features", "min_norm_fit", "double_descent_curve"] },
          {
            type: "py_test", files: ["100-double_descent.py"], label: "features and min-norm fit are correct in both regimes",
            code: IMPORT("100-double_descent") + md`rng = np.random.default_rng(0)
X = rng.normal(size=(30, 4))
for p in (10, 30, 90):
    W = rng.normal(size=(p, 4))
    F = np.asarray(m.relu_features(X, W))
    assert F.shape == (30, p) and np.allclose(F, np.maximum(X @ W.T, 0))
    y = rng.normal(size=30)
    th = np.asarray(m.min_norm_fit(F, y)).ravel()
    assert np.allclose(th, np.linalg.pinv(F) @ y, atol=1e-6), p
    if p > 30:
        assert np.allclose(F @ th, y, atol=1e-6)`,
          },
          {
            type: "py_test", files: ["100-double_descent.py"], label: "test error peaks at the interpolation threshold",
            code: IMPORT("100-double_descent") + md`rng = np.random.default_rng(0)
beta = rng.normal(size=10) / np.sqrt(10)
Xtr = rng.normal(size=(40, 10)); ytr = Xtr @ beta + 0.3 * rng.normal(size=40)
Xte = rng.normal(size=(1000, 10)); yte = Xte @ beta
c = np.asarray(m.double_descent_curve(Xtr, ytr, Xte, yte, [10, 40, 400], 5, np.random.default_rng(1)), dtype=float)
assert c.shape == (3,), c.shape
assert c[1] > 3 * c[2] and c[1] > c[0], c`,
          },
        ],
      },
    ],
  },
  // ───────────────────────────────────────────────────────────── T25
  {
    id: "T25",
    track: TRACK,
    phase: PHASE,
    title: "Online Learning & Regret Minimization",
    days: 7,
    repo: REPO,
    dir: "0x18-online_learning",
    sources: [
      { course: "CS229M", lectures: "Lec 12", topics: "Online learning, regret, follow-the-leader / follow-the-regularized-leader, online gradient descent, exponentiated gradient / Hedge, online-to-batch conversion" },
    ],
    resources: [
      R.notes,
      { title: "Hazan — Introduction to Online Convex Optimization", url: "https://arxiv.org/abs/1909.05207" },
      { title: "Orabona — A Modern Introduction to Online Learning", url: "https://arxiv.org/abs/1912.13213" },
      { title: "Shalev-Shwartz — Online Learning and Online Convex Optimization (survey PDF)", url: "https://www.cs.huji.ac.il/~shais/papers/OLsurvey.pdf" },
    ],
    concepts: ["Regret against the best fixed comparator", "Follow-the-leader and its failure", "Follow-the-regularized-leader (FTRL)", "Online (projected) gradient descent", "Hedge / exponential weights / exponentiated gradient", "Strong convexity w.r.t. a norm and dual norms", "Online-to-batch conversion"],
    objectives: [
      "Define regret and show follow-the-leader can suffer linear regret",
      "Prove the regret bound of projected OGD (DG√T) and the log T bound for strongly convex losses",
      "Prove the FTRL regret bound for a strongly convex regularizer via the FTL–BTL lemma",
      "Derive Hedge as FTRL with negative entropy on the simplex and prove the √(T log K / 2) bound",
      "Prove the online-to-batch conversion and recover the SGD rate of Pass 1",
      "Implement Hedge and OGD and verify their regret bounds numerically",
    ],
    requirements: [WRITTEN_REQ, CODE_REQ],
    quiz: [
      { q: "Projected OGD on a domain of diameter D with G-Lipschitz convex losses and tuned constant step size has regret:", options: ["O(DG log T)", "O(DG√T)", "O(DGT)", "O(D²G²)"], answer: 1, why: "Regret ≤ D²/(2η) + ηG²T/2, minimised at η = D/(G√T)." },
      { q: "Hedge with K experts and losses in [0, 1] (tuned η) has regret:", options: ["O(√(T log K))", "O(√(TK))", "O(K log T)", "O(T/K)"], answer: 0, why: "Regret ≤ ln K/η + ηT/8, minimised to √(T ln K / 2)." },
      { q: "FTRL with the negative-entropy regularizer on the probability simplex and linear losses is exactly:", options: ["projected OGD", "exponential weights (Hedge / EG)", "follow-the-leader", "Newton's method"], answer: 1, why: "The minimiser of η⟨Σg_s, p⟩ + Σpᵢ log pᵢ over the simplex is pᵢ ∝ exp(−ηΣg_{s,i})." },
      { q: "In online-to-batch conversion for i.i.d. convex losses, which predictor inherits the bound E[L(w̄)] − L(u) ≤ E[Regret_T(u)]/T?", options: ["the last iterate", "the average iterate w̄ = (1/T)Σw_t", "the best iterate on training data", "w₁"], answer: 1, why: "Jensen's inequality applied to the average of the iterates." },
    ],
    tasks: [
      readmeTask("0x18-online_learning", ""),
      {
        title: "Online gradient descent",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Let $\mathcal K\subset\mathbb R^d$ be convex and closed with diameter $D$, and $f_1,\dots,f_T$ convex with $\|\nabla f_t\|\le G$ on $\mathcal K$. Projected OGD: $w_{t+1}=\Pi_{\mathcal K}(w_t-\eta_t\nabla f_t(w_t))$; $\mathrm{Regret}_T(u)=\sum_t f_t(w_t)-\sum_t f_t(u)$.

**Theorem.** (a) With constant $\eta$: $\mathrm{Regret}_T(u)\le\frac{D^2}{2\eta}+\frac{\eta G^2T}{2}$, so $\eta=\frac{D}{G\sqrt T}$ gives $DG\sqrt T$. (b) With $\eta_t=\frac{D}{G\sqrt t}$: $\mathrm{Regret}_T\le\frac32DG\sqrt T$. (c) If every $f_t$ is $\mu$-strongly convex and $\eta_t=\frac1{\mu t}$: $\mathrm{Regret}_T\le\frac{G^2}{2\mu}(1+\log T)$.

Deliverables (‵written/1-ogd.pdf‵): prove (a)–(c) (non-expansiveness of projection, the three-term identity $\|w_{t+1}-u\|^2\le\|w_t-u\|^2-2\eta_t\langle g_t,w_t-u\rangle+\eta_t^2G^2$, telescoping). Then prove that **follow-the-leader** suffers linear regret on the 1-D linear losses $g_1=-\frac12$, $g_t=(-1)^t$ on $[-1,1]$, and give the matching $\Omega(DG\sqrt T)$ lower bound statement (random signs argument, sketched).`,
        deliverable: "repo",
        files: ["written/1-ogd.pdf"],
        rubric: "proof",
        criteria: [
          "Uses convexity f_t(w_t) − f_t(u) ≤ ⟨g_t, w_t − u⟩ and non-expansiveness of the projection",
          "Correct telescoping for constant and decreasing step sizes (Σ 1/√t ≤ 2√T)",
          "Strongly convex case: uses the μ/2‖w_t − u‖² term to cancel the telescoping and obtains (G²/2μ)(1 + log T)",
          "FTL counter-example computed explicitly with linear regret",
          "Lower bound sketch with random ±G losses and E|Σε_t| ≍ √T",
        ],
      },
      {
        title: "Follow-the-regularized-leader",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`Linear losses $f_t(w)=\langle g_t,w\rangle$ on convex $\mathcal K$; regularizer $\psi$ that is $1$-strongly convex w.r.t. a norm $\|\cdot\|$ on $\mathcal K$; FTRL $w_t=\arg\min_{w\in\mathcal K}\big\{\eta\sum_{s<t}\langle g_s,w\rangle+\psi(w)\big\}$.

**Theorem.** For every $u\in\mathcal K$:
$$\mathrm{Regret}_T(u)\le\frac{\psi(u)-\min_{\mathcal K}\psi}{\eta}+\eta\sum_{t=1}^T\|g_t\|_*^2.$$

Deliverables (‵written/2-ftrl.pdf‵):

1. Prove the **FTL–BTL lemma**: $\sum_t\langle g_t,w_{t+1}\rangle+\psi(w_1)/\eta\le\sum_t\langle g_t,u\rangle+\psi(u)/\eta$ (induction).
2. Prove the **stability** bound $\|w_t-w_{t+1}\|\le\eta\|g_t\|_*$ from strong convexity (compare the optimality conditions of two consecutive problems).
3. Combine: regret $\le\frac{\psi(u)-\psi(w_1)}{\eta}+\sum_t\langle g_t,w_t-w_{t+1}\rangle$ and conclude.
4. Reduce convex (non-linear) losses to linear ones by linearisation at $w_t$.
5. Instantiate: $\psi=\frac12\|w\|_2^2$ on a ball (lazy projected OGD, $DG\sqrt T$-type bound) and $\psi=$ negative entropy on the simplex, which is 1-strongly convex w.r.t. $\|\cdot\|_1$ (**Pinsker** — state it), giving $O(\sqrt{T\log K})$ for $\|g_t\|_\infty\le1$.`,
        deliverable: "repo",
        files: ["written/2-ftrl.pdf"],
        rubric: "proof",
        criteria: [
          "FTL–BTL lemma proved by induction on T",
          "Stability ‖w_t − w_{t+1}‖ ≤ η‖g_t‖_* derived from strong convexity and first-order optimality",
          "Combination step gives the stated bound with the dual norm",
          "Linearisation reduction for convex losses justified by the gradient inequality",
          "Both instantiations correct, with Pinsker giving 1-strong convexity of negative entropy w.r.t. ℓ1 and the √(T log K) rate after tuning η",
        ],
      },
      {
        title: "Hedge and exponentiated gradient",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Hedge with $K$ experts: $p_t(i)\propto\exp(-\eta\sum_{s<t}\ell_s(i))$, losses $\ell_t\in[0,1]^K$.

**Theorem.** $\displaystyle\sum_t\langle p_t,\ell_t\rangle-\min_i\sum_t\ell_t(i)\le\frac{\ln K}{\eta}+\frac{\eta T}{8}$; with $\eta=\sqrt{8\ln K/T}$ the regret is $\le\sqrt{\frac{T\ln K}2}$.

Deliverables (‵written/3-hedge.pdf‵): (1) prove it directly with the potential $\Phi_t=\ln\sum_i\exp(-\eta L_t(i))$ and **Hoeffding's lemma** (T16); (2) show Hedge = FTRL with negative entropy; (3) derive **exponentiated gradient** for convex losses on the simplex and its regret bound; (4) remove the need to know $T$ with the doubling trick (prove the constant-factor loss); (5) state the $\Omega(\sqrt{T\ln K})$ lower bound and the intuition behind it.`,
        deliverable: "repo",
        files: ["written/3-hedge.pdf"],
        rubric: "proof",
        criteria: [
          "Upper bound on Φ_T − Φ_0 via Hoeffding's lemma per round: −η⟨p_t, ℓ_t⟩ + η²/8",
          "Lower bound Φ_T ≥ −η min_i L_T(i) and Φ_0 = ln K, combined correctly",
          "Equivalence with entropic FTRL shown by solving the constrained minimisation",
          "Doubling-trick analysis yields a constant-factor (√2/(√2 − 1)) overhead",
        ],
      },
      {
        title: "Online-to-batch conversion",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Let $z_1,\dots,z_T$ be i.i.d., $f_t(w)=\ell(w;z_t)$ convex in $w$, $L(w)=\mathbb E\,\ell(w;z)$, and let an online algorithm produce $w_t$ depending only on $z_{1:t-1}$.

**Theorem.** For $\bar w=\frac1T\sum_tw_t$ and any fixed $u$: $\;\mathbb E[L(\bar w)]-L(u)\le\frac{\mathbb E[\mathrm{Regret}_T(u)]}{T}$. Moreover, if $\ell\in[0,1]$, w.p. $\ge1-\delta$: $L(\bar w)\le L(u)+\frac{\mathrm{Regret}_T(u)}T+\sqrt{\frac{2\log(1/\delta)}{T}}$ (for a fixed $u$; state carefully what is random).

Deliverables (‵written/4-online_to_batch.pdf‵): prove both statements — the first via $\mathbb E[f_t(w_t)\mid z_{1:t-1}]=L(w_t)$ and Jensen; the second via **Azuma–Hoeffding** applied to the martingale differences $L(w_t)-f_t(w_t)$. Then recover the SGD guarantee for convex $G$-Lipschitz losses on a ball of radius $B$ (SSBD Ch. 14, Pass 1 Week 11): $\mathbb E[L(\bar w)]-\min_{\|u\|\le B}L(u)\le\frac{BG}{\sqrt T}$-type rate; and explain why the **last** iterate is harder to analyse.`,
        deliverable: "repo",
        files: ["written/4-online_to_batch.pdf"],
        rubric: "proof",
        criteria: [
          "Uses that w_t is measurable w.r.t. z_{1:t−1} so E[f_t(w_t) | z_{1:t−1}] = L(w_t)",
          "Jensen on the convex L for the averaged iterate",
          "Martingale difference sequence identified and Azuma–Hoeffding applied with bounded increments",
          "Recovers the SSBD SGD rate with explicit constants and comments on the last iterate",
        ],
      },
      {
        title: "Hedge and OGD in code",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File ‵100-online_learning.py‵ (NumPy only).

- ‵hedge_weights(losses, eta)‵ — ‵losses‵ ‵(T, K)‵ in $[0,1]$. Return ‵P‵ ‵(T, K)‵ where row $t$ (0-indexed) is the distribution played at round $t$ **before** seeing ‵losses[t]‵: $P_0$ uniform, $P_t(i)\propto\exp(-\eta\sum_{s<t}\ell_s(i))$. Must be numerically stable (subtract the max exponent).
- ‵hedge_regret(losses, eta)‵ — $\sum_t\langle P_t,\ell_t\rangle-\min_i\sum_t\ell_t(i)$, float.
- ‵ogd_ball(Z, B, eta)‵ — online quadratic losses $f_t(w)=\frac12\|w-z_t\|^2$, ‵Z‵ ‵(T, d)‵. Start at $w_1=0$; play $w_t$, then $w_{t+1}=\Pi_{\{\|w\|\le B\}}(w_t-\eta(w_t-z_t))$. Return ‵W‵ ‵(T, d)‵, the points **played**.

In ‵README.md‵: plot Hedge regret vs $T$ against $\sqrt{T\ln K/2}$ for an adversarial-looking loss sequence of your choice.

‵‵‵python
m = import_module('100-online_learning')
L = np.random.default_rng(0).random((1000, 10))
eta = np.sqrt(8 * np.log(10) / 1000)
print(m.hedge_regret(L, eta), np.sqrt(1000 * np.log(10) / 2))
‵‵‵`,
        files: ["100-online_learning.py"],
        checks: [
          { type: "exists", path: "100-online_learning.py" },
          { type: "defines", path: "100-online_learning.py", names: ["hedge_weights", "hedge_regret", "ogd_ball"] },
          {
            type: "py_test", files: ["100-online_learning.py"], label: "Hedge weights, regret and the ln K/η + ηT/8 bound",
            code: IMPORT("100-online_learning") + md`rng = np.random.default_rng(0)
T, K = 500, 8
L = rng.random((T, K)); L[:, 3] *= 0.8
eta = np.sqrt(8 * np.log(K) / T)
P = np.asarray(m.hedge_weights(L, eta))
cum = np.vstack([np.zeros(K), np.cumsum(L, axis=0)[:-1]])
E = np.exp(-eta * (cum - cum.min(axis=1, keepdims=True)))
ref = E / E.sum(axis=1, keepdims=True)
assert P.shape == (T, K) and np.allclose(P, ref, atol=1e-10)
assert np.allclose(P[0], 1 / K)
reg = float(m.hedge_regret(L, eta))
assert np.isclose(reg, np.sum(ref * L) - L.sum(0).min(), atol=1e-8)
assert reg <= np.log(K) / eta + eta * T / 8
Pbig = np.asarray(m.hedge_weights(np.ones((3000, 2)) * [1.0, 0.9], 5.0))
assert np.all(np.isfinite(Pbig)) and Pbig[-1, 1] > 0.999`,
          },
          {
            type: "py_test", files: ["100-online_learning.py"], label: "OGD on the ball matches reference and satisfies its regret bound",
            code: IMPORT("100-online_learning") + md`rng = np.random.default_rng(1)
T, d, B = 400, 3, 1.0
Z = rng.normal(size=(T, d)) * 0.7 + np.array([0.5, -0.2, 0.1])
eta = 0.05
W = np.asarray(m.ogd_ball(Z, B, eta))
w = np.zeros(d); ref = []
for z in Z:
    ref.append(w.copy())
    w = w - eta * (w - z)
    n = np.linalg.norm(w)
    if n > B:
        w = w * (B / n)
ref = np.array(ref)
assert W.shape == (T, d) and np.allclose(W, ref, atol=1e-10)
u = Z.mean(0); u = u if np.linalg.norm(u) <= B else u * B / np.linalg.norm(u)
regret = 0.5 * np.sum((W - Z) ** 2) - 0.5 * np.sum((u - Z) ** 2)
G = B + np.linalg.norm(Z, axis=1).max()
assert regret <= (2 * B) ** 2 / (2 * eta) + eta * G ** 2 * T / 2`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── T26
  {
    id: "T26",
    track: TRACK,
    phase: PHASE,
    title: "Proof Portfolio & Concentration Cheat Sheet",
    days: 5,
    repo: REPO,
    dir: "0x19-proof_portfolio",
    sources: [
      { course: "CS229M", lectures: "Lec 3–12 (review)", topics: "Re-derive the core results of Pass 2 from memory: concentration, Rademacher bounds, implicit bias, NTK, online regret" },
      { course: "BD", lectures: "Lec 9", topics: "Review: the Fundamental Theorem of Statistical Learning (SSBD Ch. 6)" },
    ],
    resources: [
      R.notes,
      { title: "SSBD Ch. 6 & Ch. 28 — Fundamental Theorem and its proof (book PDF)", url: R.ssbd.url },
      R.hdp,
      R.bach,
    ],
    concepts: ["Fundamental Theorem of Statistical Learning (quantitative form)", "Rademacher generalization bound", "Implicit bias of GD on separable data", "Neural tangent kernel", "FTRL regret", "Concentration toolbox"],
    objectives: [
      "Write five publication-quality, self-contained proofs of the central theorems of Pass 2",
      "Restate the Fundamental Theorem with Pass 2 tools (Massart + Sauer + symmetrization + McDiarmid)",
      "Condense every concentration inequality of the track into a one-page cheat sheet with proof sketches",
      "Typeset mathematics cleanly in LaTeX with consistent notation across proofs",
      "Optimise Chernoff bounds numerically and compare them with closed forms",
    ],
    requirements: [WRITTEN_REQ, "The portfolio proofs must be typeset in LaTeX (commit both .tex and the compiled .pdf). Each proof is written from memory first; note in the README which steps needed a peek.", CODE_REQ],
    quiz: [
      { q: "In the agnostic setting, the sample complexity of a class with VC dimension d is of order:", options: ["(d + log(1/δ))/ε", "(d + log(1/δ))/ε²", "d log d", "2^d/ε"], answer: 1, why: "Fundamental Theorem, quantitative form: Θ((d + log(1/δ))/ε²) in the agnostic case." },
      { q: "The Chernoff bound for the sum of n i.i.d. Bernoulli(p), threshold n(p + t), optimised exactly over λ gives:", options: ["exp(−2nt²)", "exp(−n KL(p + t ‖ p))", "exp(−nt)", "exp(−nt²/p)"], answer: 1, why: "The Legendre transform of the Bernoulli log-MGF is the binary KL divergence; Pinsker then gives Hoeffding's exp(−2nt²)." },
      { q: "Which inequality would you use to bound the deviation of sup_f (E f − Ê f) from its mean?", options: ["Markov", "McDiarmid", "Massart", "Cauchy–Schwarz"], answer: 1, why: "The supremum has bounded differences 1/n for [0,1]-valued classes." },
    ],
    tasks: [
      readmeTask("0x19-proof_portfolio", "4. A notation table shared by all five proofs, and for each proof the list of steps for which you needed to consult a reference."),
      {
        title: "Portfolio 1 — The Fundamental Theorem, restated with Pass 2 tools",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`**Theorem (Fundamental Theorem, quantitative).** Let $\mathcal H\subseteq\{\pm1\}^{\mathcal X}$ with $\mathrm{VCdim}(\mathcal H)=d<\infty$ and the 0-1 loss. There are absolute constants $C_1,C_2$ such that $\mathcal H$ has the uniform convergence property and is agnostic PAC learnable by ERM with
$$C_1\frac{d+\log(1/\delta)}{\varepsilon^2}\le m_{\mathcal H}(\varepsilon,\delta)\le C_2\frac{d+\log(1/\delta)}{\varepsilon^2},$$
and if $\mathrm{VCdim}(\mathcal H)=\infty$ then $\mathcal H$ is not PAC learnable.

Deliverables (‵written/1-fundamental_theorem.tex‵ + ‵.pdf‵): a complete proof of the upper bound **up to a $\log(m/d)$ factor** using Sauer–Shelah + Massart + symmetrization + McDiarmid (and, optionally, the sharp bound via Dudley + Haussler's packing bound — state it); the lower bound via a No-Free-Lunch / two-point argument (sketch acceptable, but state the construction); and the "VC = ∞ ⇒ not learnable" direction. Must be self-contained (lemmas proved or precisely cited from earlier projects).`,
        deliverable: "repo",
        files: ["written/1-fundamental_theorem.pdf", "written/1-fundamental_theorem.tex"],
        rubric: "proof",
        criteria: [
          "Precise statement with all six equivalences or the quantitative version as given",
          "Upper bound chain: Sauer–Shelah ⇒ |H_S| ≤ (em/d)^d ⇒ Massart ⇒ R_m ≤ √(2d log(em/d)/m) ⇒ symmetrization + McDiarmid",
          "Solves for m(ε, δ) correctly (with the log factor or the sharp version)",
          "Lower bound construction on a shattered set with a valid probabilistic argument",
          "Typeset in LaTeX, self-contained, consistent notation",
        ],
      },
      {
        title: "Portfolio 2 — The Rademacher generalization bound",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Typeset (‵written/2-rademacher.tex‵ + ‵.pdf‵) a fully self-contained proof — **including** proofs of Hoeffding's lemma, McDiarmid's inequality and symmetrization — of:

**Theorem.** For $\mathcal F\subseteq[0,1]^{\mathcal Z}$, w.p. $\ge1-\delta$, $\forall f\in\mathcal F$: $\;\mathbb Ef\le\hat{\mathbb E}_nf+2R_S(\mathcal F)+3\sqrt{\frac{\log(2/\delta)}{2n}}$,

followed by the corollary for linear classifiers with margin: $L_{0\text-1}(w)\le\hat L_\gamma(w)+\frac{2BC}{\gamma\sqrt n}+3\sqrt{\frac{\log(2/\delta)}{2n}}$ (contraction lemma proved too). Target: ≤ 5 pages.`,
        deliverable: "repo",
        files: ["written/2-rademacher.pdf", "written/2-rademacher.tex"],
        rubric: "proof",
        criteria: [
          "Self-contained: Hoeffding's lemma, Azuma/McDiarmid and symmetrization all proved",
          "Two applications of McDiarmid with a correct union bound",
          "Contraction lemma proved and margin corollary derived with R_S ≤ BC/√n",
          "Constants consistent with the statement throughout",
        ],
      },
      {
        title: "Portfolio 3 — Implicit bias of GD for logistic regression",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Typeset (‵written/3-implicit_bias.tex‵ + ‵.pdf‵) a polished version of your T22 proof that GD on separable logistic regression converges in direction to $\hat w/\|\hat w\|$, $\hat w=\arg\min\{\|w\|:y_iw^\top x_i\ge1\}$. It must start with a precise theorem statement (route A or B of T22, stating extra assumptions), include all supporting lemmas (smoothness, $L(w_t)\to0$, $\|w_t\|\to\infty$), and end with the rate $O(1/\log t)$. Rewrite it from memory first — the README must list what you had to look up.`,
        deliverable: "repo",
        files: ["written/3-implicit_bias.pdf", "written/3-implicit_bias.tex"],
        rubric: "proof",
        criteria: [
          "Precise statement with assumptions (separability, step size or gradient flow, non-degeneracy)",
          "Supporting lemmas included (smoothness, loss → 0, norm → ∞)",
          "Core argument complete (bounded residual or smoothed-margin monotonicity) and direction limit deduced",
          "Rate O(1/log t) derived",
        ],
      },
      {
        title: "Portfolio 4 — NTK derivation",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Typeset (‵written/4-ntk.tex‵ + ‵.pdf‵): (1) the derivation of the infinite-width NTK of the 2-layer ReLU network $f(x)=\frac1{\sqrt m}\sum_ra_r\sigma(w_r^\top x)$ (both layers trained) in closed form — both arc-cosine integrals computed in full; (2) the kernel gradient-flow equation and the exponential convergence under $\lambda_{\min}(K)\ge\lambda_0/2$; (3) the statement of the Du et al. lazy-training theorem with a one-page proof sketch.`,
        deliverable: "repo",
        files: ["written/4-ntk.pdf", "written/4-ntk.tex"],
        rubric: "derivation",
        criteria: [
          "Both expectations E[σσ] and E[1·1] computed in full via the 2-D reduction",
          "Final closed form (‖x‖‖z‖/2π)(sin θ + (π − θ)cos θ) + xᵀz(π − θ)/(2π)",
          "Function-space dynamics and exponential convergence proved",
          "Lazy-training theorem stated precisely with a coherent sketch",
        ],
      },
      {
        title: "Portfolio 5 — An online learning regret bound",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Typeset (‵written/5-ftrl.tex‵ + ‵.pdf‵) the FTRL regret theorem for a regularizer that is 1-strongly convex w.r.t. $\|\cdot\|$: $\mathrm{Regret}_T(u)\le\frac{\psi(u)-\min\psi}{\eta}+\eta\sum_t\|g_t\|_*^2$, with the FTL–BTL lemma and stability lemma proved, both instantiations (Euclidean ⇒ OGD-type $DG\sqrt T$; entropy ⇒ Hedge $\sqrt{T\log K}$) and the online-to-batch corollary.`,
        deliverable: "repo",
        files: ["written/5-ftrl.pdf", "written/5-ftrl.tex"],
        rubric: "proof",
        criteria: [
          "FTL–BTL lemma and stability lemma both proved",
          "Final bound with dual norms and correct η tuning",
          "Euclidean and entropic instantiations correct (Pinsker cited for entropy)",
          "Online-to-batch corollary included",
        ],
      },
      {
        title: "One-page concentration cheat sheet",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`A single A4/Letter page (‵written/6-cheatsheet.pdf‵, LaTeX source ‵written/6-cheatsheet.tex‵) — small font allowed, but **one page** — listing for each inequality: assumptions, precise statement, and a one-line proof sketch. Must include at least: Markov, Chebyshev, Chernoff recipe, Hoeffding's lemma, Hoeffding, sub-Gaussian (MGF/tail/moment equivalences), sub-exponential tail, Bernstein, Bennett, Azuma–Hoeffding, McDiarmid, maximal inequality $\mathbb E\max\le\sigma\sqrt{2\log N}$, Massart, symmetrization, contraction, Dudley, Gaussian concentration for Lipschitz functions (statement), and matrix Bernstein (statement).`,
        deliverable: "repo",
        files: ["written/6-cheatsheet.pdf", "written/6-cheatsheet.tex"],
        rubric: "summary",
        criteria: [
          "Fits on exactly one page",
          "Contains every listed inequality with correct constants and assumptions",
          "Each entry has a correct one-line proof sketch (e.g. 'Chernoff + Hoeffding's lemma + independence')",
          "Gaussian Lipschitz concentration and matrix Bernstein stated correctly (dimension factor in matrix Bernstein)",
        ],
      },
      {
        title: "A Chernoff-bound machine",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File ‵100-chernoff.py‵ (NumPy only).

- ‵chernoff_bound(log_mgf, t, lambdas)‵ — ‵log_mgf‵ is a vectorised callable giving $\psi(\lambda)=\log\mathbb Ee^{\lambda(X-\mathbb EX)}$ on a 1-D array; ‵lambdas‵ a 1-D grid of $\lambda\ge0$. Return $\min\big(1,\ \min_{\lambda\in\text{grid}}\exp(\psi(\lambda)-\lambda t)\big)$ as a float. Evaluate in log space to avoid overflow.
- ‵bernoulli_kl(q, p)‵ — binary KL divergence $q\log\frac qp+(1-q)\log\frac{1-q}{1-p}$ (with $0\log0=0$).

In ‵README.md‵: for $S_n=\sum_{i\le n}X_i$, $X_i\sim$ Bernoulli$(0.2)$, $n=50$, plot the numerical Chernoff bound on $\mathbb P(S_n-np\ge nt)$ vs $t$ together with $e^{-n\,\mathrm{KL}(p+t\|p)}$, Hoeffding, Bernstein and the exact binomial tail.

‵‵‵python
m = import_module('100-chernoff')
lam = np.linspace(0, 5, 5001)
print(m.chernoff_bound(lambda l: 2.0 * l**2, 3.0, lam), np.exp(-9 / 8))   # Gaussian σ=2
‵‵‵`,
        files: ["100-chernoff.py"],
        checks: [
          { type: "exists", path: "100-chernoff.py" },
          { type: "defines", path: "100-chernoff.py", names: ["chernoff_bound", "bernoulli_kl"] },
          {
            type: "py_test", files: ["100-chernoff.py"], label: "Gaussian and Bernoulli Chernoff bounds match closed forms",
            code: IMPORT("100-chernoff") + md`lam = np.linspace(0, 5, 5001)
g = float(m.chernoff_bound(lambda l: 0.5 * 4.0 * l ** 2, 3.0, lam))
assert np.isclose(g, np.exp(-9 / 8), rtol=1e-4), g
assert float(m.chernoff_bound(lambda l: 0.5 * l ** 2, -1.0, lam)) == 1.0
assert np.isclose(float(m.bernoulli_kl(0.3, 0.2)), 0.3 * np.log(1.5) + 0.7 * np.log(0.7 / 0.8))
assert np.isclose(float(m.bernoulli_kl(0.0, 0.2)), np.log(1 / 0.8))
n, p = 50, 0.2
for t in (0.05, 0.1, 0.2):
    psi = lambda l: n * np.log(1 - p + p * np.exp(l)) - l * n * p
    b = float(m.chernoff_bound(psi, n * t, np.linspace(0, 6, 60001)))
    assert np.isclose(b, np.exp(-n * float(m.bernoulli_kl(p + t, p))), rtol=1e-3), (t, b)
    assert b <= np.exp(-2 * n * t * t) + 1e-12`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── T27
  {
    id: "T27",
    track: TRACK,
    phase: PHASE,
    title: "Capstone: Critique of a Recent Theory Paper",
    days: 10,
    repo: REPO,
    dir: "0x1A-capstone_critique",
    sources: [
      { course: "CS229M", lectures: "Lec 13+", topics: "Remaining lectures: covariate shift, domain adaptation, minimax lower bounds; then the capstone critique" },
    ],
    resources: [
      R.notes,
      R.course,
      R.bach,
      { title: "arXiv — Machine Learning (stat.ML) listing, to find candidate papers", url: "https://arxiv.org/list/stat.ML/recent" },
      { title: "Proceedings of Machine Learning Research (COLT / ICML volumes)", url: "https://proceedings.mlr.press/" },
    ],
    concepts: ["Covariate shift & importance weighting", "Density ratio and effective sample size", "Domain adaptation bound with HΔH-divergence", "Minimax risk", "Le Cam's two-point method", "Fano's inequality", "Critical reading of theory papers"],
    objectives: [
      "Prove that importance-weighted ERM is unbiased under covariate shift and quantify its variance cost",
      "Prove the Ben-David et al. domain-adaptation bound ε_T(h) ≤ ε_S(h) + ½ d_{HΔH} + λ*",
      "Prove a minimax lower bound with Le Cam's two-point method and state Fano's method",
      "Read a 2023–2026 NeurIPS/ICML/COLT theory paper and map each proof step to the tools of Pass 2",
      "Write a 4-page publication-style critique",
      "Pass the closed-book final self-test of the plan",
    ],
    requirements: [WRITTEN_REQ, CODE_REQ, "Capstone paper: a theoretical paper published at NeurIPS, ICML or COLT between 2023 and 2026 (main track). Get it approved by stating the choice in README.md before writing the critique."],
    quiz: [
      { q: "Under covariate shift with density ratio w(x) = p_T(x)/p_S(x), the importance-weighted source risk E_S[w(x)ℓ(h(x), y)] equals:", options: ["the source risk", "the target risk", "the target risk times E_S[w]", "nothing in general"], answer: 1, why: "Change of measure; the conditional p(y|x) is shared under covariate shift." },
      { q: "The effective sample size (Σwᵢ)²/Σwᵢ² of an importance-weighted sample is small when:", options: ["the weights are nearly uniform", "the weights are highly variable (source and target far apart)", "n is large", "the loss is bounded"], answer: 1, why: "It equals n/(1 + CV²) where CV is the coefficient of variation of the weights." },
      { q: "Le Cam's two-point method lower-bounds the minimax risk using:", options: ["the VC dimension", "the total variation (or KL) distance between two hypotheses' data distributions", "Rademacher complexity", "the Hessian of the loss"], answer: 1, why: "If two parameters far apart induce close distributions, no estimator can distinguish them." },
      { q: "In the Ben-David et al. domain adaptation bound, λ* is:", options: ["the source error of the ERM", "the combined error of the best single hypothesis on source and target", "the HΔH-divergence", "the VC dimension"], answer: 1, why: "λ* = min_h (ε_S(h) + ε_T(h)) — if no hypothesis does well on both, adaptation is hopeless." },
    ],
    tasks: [
      readmeTask("0x1A-capstone_critique", "4. A section ‵## Capstone paper‵ with the full citation (authors, title, venue, year) and a link (arXiv abs page or proceedings page) of the paper you critique."),
      {
        title: "Covariate shift and importance weighting",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Source $P_S(x,y)=p_S(x)p(y\mid x)$, target $P_T(x,y)=p_T(x)p(y\mid x)$, $w(x)=p_T(x)/p_S(x)$, $\|w\|_\infty\le W$, loss in $[0,1]$.

**Proposition.** (a) $\mathbb E_{S}[w(x)\ell(h(x),y)]=\mathbb E_T[\ell(h(x),y)]$. (b) For a finite class $\mathcal H$, w.p. $\ge1-\delta$, $\forall h$: $\;|\hat L_w(h)-L_T(h)|\le\sqrt{\frac{2\,d_2(P_T\|P_S)\log(2|\mathcal H|/\delta)}{n}}+\frac{2W\log(2|\mathcal H|/\delta)}{3n}$, where $\hat L_w$ is the importance-weighted empirical risk and $d_2(P_T\|P_S)=\mathbb E_S[w^2]$.

Deliverables (‵written/1-covariate_shift.pdf‵): prove (a), then (b) via **Bernstein** (T16) + union bound; compute $d_2$ for two Gaussians $\mathcal N(\mu_S,I)$, $\mathcal N(\mu_T,I)$ and show it grows like $e^{\|\mu_S-\mu_T\|^2}$; explain the effective sample size $n_e=(\sum w_i)^2/\sum w_i^2$; discuss what happens when $p_S$ has lighter tails than $p_T$ (infinite variance).`,
        deliverable: "repo",
        files: ["written/1-covariate_shift.pdf"],
        rubric: "proof",
        criteria: [
          "Change-of-measure proof using the shared conditional p(y|x)",
          "Bernstein applied with variance ≤ E_S[w²] and range ≤ W, then union bound over H",
          "Gaussian d₂ computed: exp(‖μ_S − μ_T‖²)",
          "Effective sample size interpreted and the heavy-tail failure mode discussed",
        ],
      },
      {
        title: "Domain adaptation bound",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`For binary $\mathcal H$, define $d_{\mathcal H\Delta\mathcal H}(\mathcal D_S,\mathcal D_T)=2\sup_{h,h'\in\mathcal H}\big|\mathbb P_S(h\ne h')-\mathbb P_T(h\ne h')\big|$ and $\lambda^*=\min_{h\in\mathcal H}\big(\varepsilon_S(h)+\varepsilon_T(h)\big)$.

**Theorem (Ben-David, Blitzer, Crammer, Kulesza, Pereira, Vaughan 2010).** For every $h\in\mathcal H$: $\;\varepsilon_T(h)\le\varepsilon_S(h)+\frac12d_{\mathcal H\Delta\mathcal H}(\mathcal D_S,\mathcal D_T)+\lambda^*$.

Deliverables (‵written/2-domain_adaptation.pdf‵): prove it (triangle inequality for disagreement $\varepsilon(h,h')$), then add the finite-sample version (estimate $d_{\mathcal H\Delta\mathcal H}$ from unlabeled samples; VC-based deviation). Give an example where $d_{\mathcal H\Delta\mathcal H}$ is small but $\lambda^*$ is large (adaptation impossible), and explain the link to domain-adversarial training.`,
        deliverable: "repo",
        files: ["written/2-domain_adaptation.pdf"],
        rubric: "proof",
        criteria: [
          "Triangle inequality ε_T(h) ≤ ε_T(h*) + ε_T(h, h*) and the swap to ε_S(h, h*) via the HΔH definition",
          "Final bound with the factor ½ and λ* correctly identified",
          "Finite-sample version with an empirical divergence estimate and a VC deviation term",
          "Valid example where λ* is large; correct link to domain-adversarial methods",
        ],
      },
      {
        title: "Minimax lower bounds: Le Cam and Fano",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Minimax risk $\mathfrak M_n=\inf_{\hat\theta}\sup_{\theta\in\Theta}\mathbb E_\theta[d(\hat\theta,\theta)]$.

**Lemma (Le Cam).** If $d(\theta_0,\theta_1)\ge2s$ then $\mathfrak M_n\ge\frac s2\big(1-\mathrm{TV}(P_{\theta_0}^n,P_{\theta_1}^n)\big)$.

Deliverables (‵written/3-minimax.pdf‵): (1) prove Le Cam's lemma (reduction to testing); (2) use it with Pinsker ($\mathrm{TV}\le\sqrt{\mathrm{KL}/2}$) to show $\mathfrak M_n\ge c\,\sigma/\sqrt n$ for estimating a Gaussian mean in absolute error, and $\ge c\sqrt{p(1-p)/n}$ for a Bernoulli mean; (3) state **Fano's inequality** and use it with a packing of the hypercube (Varshamov–Gilbert, stated) to show the $d$-dimensional Gaussian mean has squared-error minimax rate $\gtrsim\sigma^2d/n$; (4) one paragraph: why matching upper and lower bounds is the standard of a "complete" theory result — you will look for this in your capstone paper.`,
        deliverable: "repo",
        files: ["written/3-minimax.pdf"],
        rubric: "proof",
        criteria: [
          "Reduction from estimation to testing with the triangle inequality on d",
          "Optimal test error equals (1 − TV)/2 (Neyman–Pearson / TV characterisation)",
          "Gaussian and Bernoulli two-point constructions with KL computed and θ separation ≍ 1/√n",
          "Fano statement correct and the d/n lower bound via a Varshamov–Gilbert packing",
        ],
      },
      {
        title: "Capstone paper: tool map",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Choose one **theoretical** paper published at NeurIPS, ICML or COLT between 2023 and 2026. Deliverable ‵written/4-tool_map.pdf‵ (2 pages):

1. Full citation and link (arXiv abs page or proceedings page).
2. The main theorem restated in your notation, in $\LaTeX$, with every assumption made explicit.
3. A **tool map**: a table with one row per step of the main proof (as you reconstruct it) and the column "Pass 1 / Pass 2 tool used" (e.g. symmetrization, Bernstein, chaining, NTK linearization, FTRL, Le Cam…), pointing to the project (T15–T25) where you proved that tool.
4. The steps you could **not** map to a known tool (new techniques) — these will be the focus of your critique.

This is the final self-test item "Read a new COLT paper and identify which of the tools above it relies on".`,
        deliverable: "repo",
        files: ["written/4-tool_map.pdf"],
        rubric: "summary",
        criteria: [
          "Paper is a 2023–2026 NeurIPS/ICML/COLT theory paper with a valid link",
          "Main theorem restated precisely with all assumptions",
          "Tool map covers every major proof step and points to the correct earlier projects",
          "New techniques identified and explained",
        ],
      },
      {
        title: "Capstone: 4-page publication-style critique",
        type: "mandatory",
        kind: "written",
        points: 5,
        body: md`Publish a 4-page (≈ 2500–3500 words + math) critique of your chosen paper as a public blog post (Medium or similar) and submit the link. Write it as a referee report crossed with a survey section, in publication style (precise, cited, no hype).

Required structure:
1. **Summary** — problem, setting, main contributions in 1–2 paragraphs.
2. **Setting & assumptions** — formal model; for each assumption, is it standard, strong, or unverifiable? Give one concrete example where an assumption fails.
3. **Main results** — theorem statements, rates, and **comparison with prior bounds** (a table: prior work vs this paper, rate, assumptions).
4. **Proof technique** — the key idea in ≤ 1 page, with the tools of Pass 2 named.
5. **Tightness** — are there matching lower bounds (Le Cam / Fano style)? If not, what is the gap?
6. **Critique** — correctness concerns (check at least one lemma in full detail and report what you verified), relevance of constants, empirical relevance, missing comparisons.
7. **Open questions** — 2–3 concrete follow-up problems.`,
        deliverable: "link",
        rubric: "report",
        criteria: [
          "All seven sections present, with precise theorem statements and assumptions",
          "Comparison table with prior work (rates and assumptions) that is accurate",
          "At least one lemma checked line by line, with the verification reported",
          "Discusses tightness / lower bounds explicitly",
          "Critique is substantive and specific (not generic praise), with 2–3 concrete open questions",
        ],
      },
      {
        title: "Final self-test (closed book)",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`The plan's final self-test. On blank paper, with **no references**, in a single sitting of at most 3 hours, write:

1. The statement and proof of the **Fundamental Theorem of Statistical Learning** (finite VC ⇔ uniform convergence ⇔ agnostic PAC learnable, with sample complexity).
2. A derivation of a **generalization bound for linear classifiers using Rademacher complexity** (margin version, all steps).
3. An explanation, with a **proof sketch**, of why gradient descent on logistic regression implicitly regularizes toward the max-margin solution.

Scan your pages into ‵written/6-self_test.pdf‵. First page: start and end time and the honour statement "Written closed-book, no references". Afterwards (separately, in ‵written/6-self_test_review.md‵) grade yourself against your T26 portfolio and list every gap.`,
        deliverable: "repo",
        files: ["written/6-self_test.pdf", "written/6-self_test_review.md"],
        rubric: "proof",
        criteria: [
          "Fundamental Theorem: correct statement and a complete proof skeleton (growth function, Sauer, uniform convergence, NFL for the converse)",
          "Rademacher margin bound derived with symmetrization, McDiarmid, contraction and the linear-class computation",
          "Implicit bias sketch: loss → 0, norm → ∞, support vectors dominate, direction → hard-margin SVM",
          "Timed, closed-book statement present, and a candid self-review listing gaps",
        ],
      },
      {
        title: "Importance-weighted ERM under covariate shift",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`File ‵100-covariate_shift.py‵ (NumPy only).

- ‵gaussian_density_ratio(X, mu_s, cov_s, mu_t, cov_t)‵ — ‵X‵ ‵(n, d)‵; return the 1-D array $w(x_i)=\mathcal N(x_i;\mu_T,\Sigma_T)/\mathcal N(x_i;\mu_S,\Sigma_S)$, computed in log space (‵np.linalg.slogdet‵, ‵np.linalg.solve‵).
- ‵weighted_ridge(X, y, weights, lam)‵ — $\hat\theta=\arg\min_\theta\frac1n\sum_iw_i(x_i^\top\theta-y_i)^2+\lambda\|\theta\|^2$, i.e. $\big(\frac1nX^\top WX+\lambda I\big)^{-1}\frac1nX^\top Wy$ via ‵np.linalg.solve‵.
- ‵effective_sample_size(weights)‵ — $(\sum_iw_i)^2/\sum_iw_i^2$.

In ‵README.md‵: a misspecified 1-D experiment (fit a line to $y=\sin x$ with source $\mathcal N(0,1)$ and target $\mathcal N(1.5,0.5^2)$) comparing target MSE of unweighted vs importance-weighted ridge, with the effective sample size.

‵‵‵python
m = import_module('100-covariate_shift')
X = np.random.default_rng(0).normal(size=(5, 2))
print(m.gaussian_density_ratio(X, np.zeros(2), np.eye(2), np.ones(2), 0.5 * np.eye(2)))
‵‵‵`,
        files: ["100-covariate_shift.py"],
        checks: [
          { type: "exists", path: "100-covariate_shift.py" },
          { type: "defines", path: "100-covariate_shift.py", names: ["gaussian_density_ratio", "weighted_ridge", "effective_sample_size"] },
          { type: "not_contains", path: "100-covariate_shift.py", pattern: "import\\s+scipy|from\\s+scipy|sklearn", label: "NumPy only" },
          {
            type: "py_test", files: ["100-covariate_shift.py"], label: "density ratio, weighted ridge and ESS are correct",
            code: IMPORT("100-covariate_shift") + md`rng = np.random.default_rng(0)
d = 3
X = rng.normal(size=(50, d))
mu_s, mu_t = np.zeros(d), np.array([0.5, -0.3, 0.2])
A = rng.normal(size=(d, d)); cov_s = A @ A.T + d * np.eye(d); cov_t = 0.7 * np.eye(d)
def logpdf(X, mu, C):
    D = X - mu
    return -0.5 * np.sum(D * np.linalg.solve(C, D.T).T, axis=1) - 0.5 * np.linalg.slogdet(2 * np.pi * C)[1]
w_ref = np.exp(logpdf(X, mu_t, cov_t) - logpdf(X, mu_s, cov_s))
w = np.asarray(m.gaussian_density_ratio(X, mu_s, cov_s, mu_t, cov_t)).ravel()
assert np.allclose(w, w_ref, rtol=1e-8)
y = X @ np.array([1.0, -2.0, 0.5]) + 0.1 * rng.normal(size=50)
th = np.asarray(m.weighted_ridge(X, y, w, 0.1)).ravel()
ref = np.linalg.solve(X.T @ (w[:, None] * X) / 50 + 0.1 * np.eye(d), X.T @ (w * y) / 50)
assert np.allclose(th, ref, atol=1e-8)
assert np.isclose(float(m.effective_sample_size(np.ones(20))), 20.0)
assert np.isclose(float(m.effective_sample_size(w)), w.sum() ** 2 / (w ** 2).sum())`,
          },
          {
            type: "py_test", files: ["100-covariate_shift.py"], label: "importance weights correct the source average to the target mean",
            code: IMPORT("100-covariate_shift") + md`rng = np.random.default_rng(3)
Xs = rng.normal(size=(200000, 1))
w = np.asarray(m.gaussian_density_ratio(Xs, np.zeros(1), np.eye(1), np.array([0.5]), np.eye(1))).ravel()
assert abs(np.mean(w) - 1.0) < 0.02, np.mean(w)
assert abs(np.mean(w * Xs[:, 0]) - 0.5) < 0.03, np.mean(w * Xs[:, 0])`,
          },
        ],
      },
    ],
  },
];
