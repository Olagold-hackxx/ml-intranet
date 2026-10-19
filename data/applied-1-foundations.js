// Applied track — Phase 1 — Foundations (repo: ml-foundations).
// Weeks 1–8 of the Applied ML study plan: CS229 (Autumn 2018) + CS221, all from scratch in NumPy.
//
// Authoring helpers:
//  - md`...`  : Markdown body written with String.raw (so LaTeX backslashes survive);
//               the character § stands for a backtick (inline code and ``` fences: §§§).
//  - py`...`  : raw Python source for py_test checks.
const md = (s, ...v) => String.raw(s, ...v).replace(/§/g, "`");
const py = String.raw;

const TRACK = "applied";
const PHASE = "Phase 1 — Foundations";
const REPO = "ml-foundations";

// ---- check helpers -------------------------------------------------------
const ex = (path) => ({ type: "exists", path });
const def = (path, ...names) => ({ type: "defines", path, names });
const has = (path, pattern, label) => ({ type: "contains", path, pattern, label });
const lacks = (path, pattern, label) => ({ type: "not_contains", path, pattern, label });
const noLib = (path) => lacks(path, "^\\s*(import|from)\\s+(sklearn|scipy|torch|tensorflow|jax)\\b", "no sklearn / scipy / torch imports (NumPy only)");
const readme = (minWords = 80) => ({ type: "readme", path: "README.md", minWords });
const nb = (path) => ({ type: "notebook_executed", path });
const metric = (path, key, op, value) => ({ type: "json_metric", path, key, op, value });
const pt = (files, label, code) => ({ type: "py_test", files, label, code });

const NUMPY_ONLY = "Implementation files (§*.py§): Python 3.10+, NumPy only — no scikit-learn, SciPy, PyTorch, TensorFlow or JAX";
const NOTEBOOKS = "Notebooks may use matplotlib (and pandas for loading data); they must be committed **executed** (outputs visible)";
const STYLE = "Every function has a docstring; no code runs on import (put demos under §if __name__ == \"__main__\":§)";

const PROJECTS = [
  // ==========================================================================
  // A01 — Linear regression
  // ==========================================================================
  {
    id: "A01",
    track: TRACK,
    phase: PHASE,
    title: "Linear Regression, Gradient Descent & Normal Equations",
    days: 3,
    repo: REPO,
    dir: "0x00-linear_regression",
    sources: [
      { course: "CS229", lectures: "Lec 1–2", topics: "Intro; linear regression, LMS, batch & stochastic gradient descent, normal equations" },
    ],
    resources: [
      { title: "CS229 main lecture notes — Part I (linear regression, LMS, normal equations, probabilistic interpretation)", url: "https://cs229.stanford.edu/main_notes.pdf" },
      { title: "Dive into Deep Learning — 3.1 Linear Regression", url: "https://d2l.ai/chapter_linear-regression/linear-regression.html" },
      { title: "The Matrix Cookbook (matrix calculus identities)", url: "https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf" },
      { title: "NumPy — numpy.linalg.lstsq", url: "https://numpy.org/doc/stable/reference/generated/numpy.linalg.lstsq.html" },
    ],
    concepts: [
      "Hypothesis $h_\\theta(x)=\\theta^\\top x$ and the least-squares cost $J(\\theta)$",
      "Batch vs stochastic vs mini-batch gradient descent",
      "Learning rate, convergence and divergence",
      "Normal equations $X^\\top X\\theta = X^\\top y$",
      "Feature scaling and the intercept term",
      "Least squares as maximum likelihood under Gaussian noise",
    ],
    objectives: [
      "Derive $\\nabla_\\theta J(\\theta)$ for least squares in vector form without looking anything up",
      "Derive the normal equations and explain why you should solve rather than invert $X^\\top X$",
      "Explain the difference between batch, stochastic and mini-batch gradient descent and the trade-offs of each",
      "Explain why a learning rate that is too large makes gradient descent diverge, and how feature scaling helps",
      "Show that least squares is the MLE of $\\theta$ when $y = \\theta^\\top x + \\epsilon$, $\\epsilon \\sim \\mathcal N(0,\\sigma^2)$",
      "Implement and vectorize all of the above in NumPy with no loops over samples (except where SGD requires it)",
    ],
    requirements: [NUMPY_ONLY, NOTEBOOKS, STYLE, "Vectorize: no Python loops over samples, except the per-sample update inside SGD / mini-batch loops"],
    quiz: [
      {
        q: "For $J(\\theta)=\\frac{1}{2m}\\lVert X\\theta-y\\rVert^2$, what is $\\nabla_\\theta J(\\theta)$?",
        options: ["$\\frac{1}{m}X(X^\\top\\theta-y)$", "$\\frac{1}{m}X^\\top(X\\theta-y)$", "$\\frac{1}{2m}(X\\theta-y)^\\top X$", "$\\frac{1}{m}X^\\top X\\theta$"],
        answer: 1,
        why: "Expand $\\frac{1}{2m}(X\\theta-y)^\\top(X\\theta-y)$ and differentiate: the gradient is $\\frac1m X^\\top(X\\theta-y)$, an $n$-vector.",
      },
      {
        q: "Why is §np.linalg.solve(X.T @ X, X.T @ y)§ (or §lstsq§) preferred over §np.linalg.inv(X.T @ X) @ X.T @ y§?",
        options: ["inv is not available in NumPy", "solve is faster and numerically more stable; explicitly forming the inverse amplifies round-off error", "solve gives a different (regularized) answer", "inv only works for square X"],
        answer: 1,
        why: "Solving the linear system (LU / QR / SVD) avoids forming $(X^\\top X)^{-1}$, which is slower and loses precision when $X^\\top X$ is ill-conditioned.",
      },
      {
        q: "Batch gradient descent on least squares diverges (cost explodes). The most likely cause?",
        options: ["Too few iterations", "The learning rate is larger than $2/\\lambda_{\\max}(X^\\top X/m)$", "The cost is non-convex", "The intercept column is missing"],
        answer: 1,
        why: "For a quadratic, GD is stable iff $\\alpha < 2/L$ where $L$ is the largest eigenvalue of the Hessian $X^\\top X/m$. Unscaled features make $L$ huge.",
      },
      {
        q: "Least squares is the maximum-likelihood estimator of $\\theta$ under which noise model?",
        options: ["Laplace noise", "i.i.d. Gaussian noise with fixed variance", "Uniform noise", "Bernoulli labels"],
        answer: 1,
        why: "With $\\epsilon^{(i)}\\sim\\mathcal N(0,\\sigma^2)$ i.i.d., the log-likelihood is a constant minus $\\frac{1}{2\\sigma^2}\\sum_i (y^{(i)}-\\theta^\\top x^{(i)})^2$.",
      },
    ],
    tasks: [
      {
        title: "0. Normal equations",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write a function §def normal_equations(X, y):§ that returns the least-squares solution $\theta^\star = \arg\min_\theta \lVert X\theta - y\rVert^2$.

* §X§ is a §numpy.ndarray§ of shape §(m, n)§ — the design matrix (if you want an intercept, the caller has already added a column of ones).
* §y§ is a §numpy.ndarray§ of shape §(m,)§.
* Returns a §numpy.ndarray§ of shape §(n,)§.
* You must **not** call §np.linalg.inv§. Use §np.linalg.solve§ on the normal equations $X^\top X\theta = X^\top y$, or §np.linalg.lstsq§ / §np.linalg.pinv§ (which also handle rank-deficient $X$).
* Do not modify the inputs.

Also create the project §README.md§ (at least 80 words): what the directory contains, one line per file, and how to run the examples.

§§§python
$ cat 0-main.py
#!/usr/bin/env python3
import numpy as np
normal_equations = __import__('0-normal_equations').normal_equations

rng = np.random.default_rng(0)
X = np.c_[np.ones(100), rng.normal(size=(100, 2))]
y = X @ np.array([4.0, 3.0, -2.0]) + 0.1 * rng.normal(size=100)
print(normal_equations(X, y).round(2))
$ ./0-main.py
[ 4.  3. -2.]     # approximately
§§§`,
        files: ["0-normal_equations.py", "README.md"],
        checks: [
          def("0-normal_equations.py", "normal_equations"),
          lacks("0-normal_equations.py", "linalg\\.inv\\s*\\(", "does not call np.linalg.inv"),
          noLib("0-normal_equations.py"),
          readme(80),
          pt(["0-normal_equations.py"], "matches np.linalg.lstsq on random problems", py`import numpy as np
from importlib import import_module
normal_equations = import_module('0-normal_equations').normal_equations
rng = np.random.default_rng(0)
for m, n in [(50, 3), (200, 10), (12, 12)]:
    X = rng.normal(size=(m, n))
    y = rng.normal(size=m)
    th = np.asarray(normal_equations(X, y), dtype=float)
    ref = np.linalg.lstsq(X, y, rcond=None)[0]
    assert th.shape == (n,), f"expected shape {(n,)}, got {th.shape}"
    assert np.allclose(th, ref, atol=1e-6), f"theta differs from the least-squares solution for m={m}, n={n}"`),
          pt(["0-normal_equations.py"], "recovers exact parameters and leaves inputs untouched", py`import numpy as np
from importlib import import_module
normal_equations = import_module('0-normal_equations').normal_equations
rng = np.random.default_rng(1)
X = np.c_[np.ones(80), rng.normal(size=(80, 4))]
true = np.array([1.5, -2.0, 0.0, 3.25, 0.5])
y = X @ true
X0, y0 = X.copy(), y.copy()
th = np.asarray(normal_equations(X, y), dtype=float)
assert np.allclose(th, true, atol=1e-8), "noise-free data must be fit exactly"
assert np.array_equal(X, X0) and np.array_equal(y, y0), "inputs were modified"`),
        ],
      },
      {
        title: "1. Cost and gradient",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §1-cost_gradient.py§ write two functions:

* §def mse_cost(X, y, theta):§ returns the scalar $J(\theta) = \frac{1}{2m}\sum_{i=1}^m \left(\theta^\top x^{(i)} - y^{(i)}\right)^2$ as a Python §float§.
* §def mse_gradient(X, y, theta):§ returns $\nabla_\theta J(\theta) = \frac{1}{m}X^\top(X\theta - y)$, shape §(n,)§.

§X§ has shape §(m, n)§, §y§ shape §(m,)§, §theta§ shape §(n,)§. Fully vectorized: no Python loops.

§§§python
>>> X = np.array([[1., 1.], [1., 2.], [1., 3.]]); y = np.array([1., 2., 3.])
>>> mse_cost(X, y, np.zeros(2))
2.3333333333333335
>>> mse_gradient(X, y, np.zeros(2))
array([-2.        , -4.66666667])
§§§`,
        files: ["1-cost_gradient.py"],
        checks: [
          def("1-cost_gradient.py", "mse_cost", "mse_gradient"),
          lacks("1-cost_gradient.py", "^\\s*for\\s+[\\w, ()]+\\s+in\\s.*:\\s*$", "no Python for-loops"),
          noLib("1-cost_gradient.py"),
          pt(["1-cost_gradient.py"], "cost and gradient match the closed-form expressions", py`import numpy as np
from importlib import import_module
mod = import_module('1-cost_gradient')
rng = np.random.default_rng(0)
X = rng.normal(size=(37, 5)); y = rng.normal(size=37); th = rng.normal(size=5)
r = X @ th - y
J = mod.mse_cost(X, y, th)
assert np.ndim(J) == 0, "mse_cost must return a scalar"
assert abs(float(J) - (r @ r) / (2 * 37)) < 1e-10, "wrong cost (did you use 1/(2m)?)"
g = np.asarray(mod.mse_gradient(X, y, th), dtype=float)
assert g.shape == (5,), f"gradient shape should be (5,), got {g.shape}"
assert np.allclose(g, X.T @ r / 37, atol=1e-10), "wrong gradient"
X = np.array([[1., 1.], [1., 2.], [1., 3.]]); y = np.array([1., 2., 3.])
assert abs(float(mod.mse_cost(X, y, np.zeros(2))) - 7 / 3) < 1e-12`),
          pt(["1-cost_gradient.py"], "gradient agrees with finite differences and vanishes at the optimum", py`import numpy as np
from importlib import import_module
mod = import_module('1-cost_gradient')
rng = np.random.default_rng(3)
X = rng.normal(size=(60, 4)); y = rng.normal(size=60); th = rng.normal(size=4)
g = np.asarray(mod.mse_gradient(X, y, th), dtype=float)
assert g.shape == (4,) and np.linalg.norm(g) > 1e-3, "gradient at a random theta should be a non-zero vector of shape (n,)"
eps = 1e-6
num = np.array([(float(mod.mse_cost(X, y, th + eps * e)) - float(mod.mse_cost(X, y, th - eps * e))) / (2 * eps) for e in np.eye(4)])
assert np.allclose(g, num, atol=1e-6), "analytic gradient disagrees with numerical gradient"
opt = np.linalg.lstsq(X, y, rcond=None)[0]
assert np.linalg.norm(mod.mse_gradient(X, y, opt)) < 1e-10, "gradient should be 0 at the least-squares solution"`),
        ],
      },
      {
        title: "2. Batch gradient descent",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §def batch_gradient_descent(X, y, alpha=0.01, iterations=1000, theta0=None):§ in §2-batch_gradient_descent.py§.

* Starts from §theta0§ (shape §(n,)§; zeros if §None§) and performs exactly §iterations§ full-batch updates $\theta \leftarrow \theta - \alpha\,\frac{1}{m}X^\top(X\theta - y)$.
* Returns a tuple §(theta, costs)§: §theta§ of shape §(n,)§ and §costs§, a §numpy.ndarray§ of shape §(iterations + 1,)§ where §costs[0]§ is $J(\theta_0)$ and §costs[t]§ is the cost after §t§ updates ($J = \frac{1}{2m}\lVert X\theta-y\rVert^2$).
* Must not modify §theta0§. You may import your functions from §1-cost_gradient.py§ (with §__import__('1-cost_gradient')§) or re-implement them.

§§§python
theta, costs = batch_gradient_descent(X, y, alpha=0.1, iterations=500)
print(costs[0], costs[-1])   # cost should decrease monotonically for a stable alpha
§§§`,
        files: ["2-batch_gradient_descent.py"],
        checks: [
          def("2-batch_gradient_descent.py", "batch_gradient_descent"),
          noLib("2-batch_gradient_descent.py"),
          pt(["2-batch_gradient_descent.py", "1-cost_gradient.py"], "one update is exactly theta - alpha * grad; costs has length iterations+1", py`import numpy as np
from importlib import import_module
bgd = import_module('2-batch_gradient_descent').batch_gradient_descent
rng = np.random.default_rng(0)
X = rng.normal(size=(40, 3)); y = rng.normal(size=40); th0 = rng.normal(size=3)
keep = th0.copy()
th, costs = bgd(X, y, alpha=0.05, iterations=1, theta0=th0)
expected = keep - 0.05 * X.T @ (X @ keep - y) / 40
assert np.allclose(np.asarray(th), expected, atol=1e-12), "a single update is not theta - alpha/m X^T(X theta - y)"
costs = np.asarray(costs, dtype=float)
assert costs.shape == (2,), f"costs must have shape (iterations+1,), got {costs.shape}"
r = X @ keep - y
assert abs(costs[0] - r @ r / 80) < 1e-10, "costs[0] must be J(theta0)"
assert np.array_equal(th0, keep), "theta0 was modified in place"
th, costs = bgd(X, y, alpha=0.05, iterations=7)
assert np.asarray(costs).shape == (8,)`),
          pt(["2-batch_gradient_descent.py", "1-cost_gradient.py"], "converges to the normal-equation solution with monotone cost", py`import numpy as np
from importlib import import_module
bgd = import_module('2-batch_gradient_descent').batch_gradient_descent
rng = np.random.default_rng(1)
X = np.c_[np.ones(200), rng.normal(size=(200, 3))]
y = X @ np.array([2.0, -1.0, 0.5, 3.0]) + 0.3 * rng.normal(size=200)
th, costs = bgd(X, y, alpha=0.1, iterations=3000)
ref = np.linalg.lstsq(X, y, rcond=None)[0]
assert np.allclose(np.asarray(th), ref, atol=1e-4), "did not converge to the least-squares solution"
c = np.asarray(costs, dtype=float)
assert np.all(np.diff(c) <= 1e-12), "cost must be non-increasing for a stable learning rate"`),
        ],
      },
      {
        title: "3. Stochastic gradient descent",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §def stochastic_gradient_descent(X, y, alpha=0.01, epochs=10, seed=0, theta0=None):§ in §3-stochastic_gradient_descent.py§ (the LMS / Widrow–Hoff rule from Lecture 2).

* Create §rng = np.random.default_rng(seed)§. At the start of **each** epoch visit the samples in the order §rng.permutation(m)§.
* For each sample $i$: $\theta \leftarrow \theta - \alpha\,(\theta^\top x^{(i)} - y^{(i)})\,x^{(i)}$ (one update per sample, so $m$ updates per epoch).
* Returns §(theta, costs)§ where §costs§ has shape §(epochs + 1,)§: §costs[0]§ $=J(\theta_0)$ and §costs[e]§ is the full-dataset cost $\frac{1}{2m}\lVert X\theta-y\rVert^2$ at the end of epoch §e§.
* §theta0§ defaults to zeros and must not be modified.

§§§python
theta, costs = stochastic_gradient_descent(X, y, alpha=0.01, epochs=20)
§§§`,
        files: ["3-stochastic_gradient_descent.py"],
        checks: [
          def("3-stochastic_gradient_descent.py", "stochastic_gradient_descent"),
          has("3-stochastic_gradient_descent.py", "permutation", "shuffles with rng.permutation each epoch"),
          noLib("3-stochastic_gradient_descent.py"),
          pt(["3-stochastic_gradient_descent.py"], "single-sample update is exact; costs has length epochs+1", py`import numpy as np
from importlib import import_module
sgd = import_module('3-stochastic_gradient_descent').stochastic_gradient_descent
x = np.array([[1.0, 2.0, -1.0]]); y = np.array([0.5]); th0 = np.array([0.1, -0.2, 0.3])
th, costs = sgd(x, y, alpha=0.1, epochs=1, theta0=th0.copy())
expected = th0 - 0.1 * (x[0] @ th0 - y[0]) * x[0]
assert np.allclose(np.asarray(th), expected, atol=1e-12), "per-sample LMS update is wrong"
assert np.asarray(costs).shape == (2,), "costs must have shape (epochs+1,)"
th, costs = sgd(x, y, alpha=0.1, epochs=2, theta0=th0.copy())
e1 = expected - 0.1 * (x[0] @ expected - y[0]) * x[0]
assert np.allclose(np.asarray(th), e1, atol=1e-12), "second epoch should apply one more update"`),
          pt(["3-stochastic_gradient_descent.py"], "converges on noise-free data", py`import numpy as np
from importlib import import_module
sgd = import_module('3-stochastic_gradient_descent').stochastic_gradient_descent
rng = np.random.default_rng(2)
X = np.c_[np.ones(150), rng.normal(size=(150, 3))]
true = np.array([1.0, 2.0, -3.0, 0.5])
y = X @ true
th, costs = sgd(X, y, alpha=0.05, epochs=100, seed=0)
assert np.allclose(np.asarray(th), true, atol=1e-3), "SGD should recover the exact parameters on noise-free data"
c = np.asarray(costs, dtype=float)
assert c.shape == (101,), f"costs shape should be (101,), got {c.shape}"
assert c[-1] < 1e-6 * max(c[0], 1.0), "final cost should be ~0"`),
        ],
      },
      {
        title: "4. Feature scaling and intercept",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §4-feature_scaling.py§ write:

* §def standardize(X):§ returns §(X_norm, mu, sigma)§ where §mu§ and §sigma§ are the per-column mean and **population** standard deviation (§ddof=0§), shapes §(n,)§, and §X_norm = (X - mu) / sigma§. For a constant column use §sigma = 1§ for that column (so it becomes all zeros instead of NaN).
* §def add_intercept(X):§ returns a new array of shape §(m, n + 1)§ whose first column is ones.

Neither function may modify its input. Vectorized, no loops.

§§§python
>>> Xn, mu, sigma = standardize(np.array([[1., 5.], [3., 5.]]))
>>> Xn
array([[-1.,  0.],
       [ 1.,  0.]])
>>> add_intercept(np.array([[2.], [3.]]))
array([[1., 2.],
       [1., 3.]])
§§§`,
        files: ["4-feature_scaling.py"],
        checks: [
          def("4-feature_scaling.py", "standardize", "add_intercept"),
          noLib("4-feature_scaling.py"),
          pt(["4-feature_scaling.py"], "standardize returns zero-mean unit-variance columns and correct statistics", py`import numpy as np
from importlib import import_module
mod = import_module('4-feature_scaling')
rng = np.random.default_rng(0)
X = rng.normal(loc=[3.0, -10.0, 100.0], scale=[1.0, 5.0, 40.0], size=(500, 3))
X0 = X.copy()
Xn, mu, sigma = mod.standardize(X)
assert np.allclose(mu, X0.mean(axis=0)) and np.allclose(sigma, X0.std(axis=0)), "mu / sigma wrong (use ddof=0)"
assert np.allclose(np.asarray(Xn).mean(axis=0), 0, atol=1e-10) and np.allclose(np.asarray(Xn).std(axis=0), 1)
assert np.array_equal(X, X0), "input modified"
Xi = np.asarray(mod.add_intercept(X))
assert Xi.shape == (500, 4) and np.all(Xi[:, 0] == 1) and np.array_equal(Xi[:, 1:], X0)
assert np.array_equal(X, X0), "add_intercept modified its input"`),
          pt(["4-feature_scaling.py"], "constant columns do not produce NaN", py`import numpy as np
from importlib import import_module
mod = import_module('4-feature_scaling')
X = np.array([[1., 5.], [3., 5.], [5., 5.]])
Xn, mu, sigma = mod.standardize(X)
Xn = np.asarray(Xn, dtype=float)
assert np.all(np.isfinite(Xn)), "NaN/inf produced for a constant column"
assert np.allclose(Xn[:, 1], 0) and float(np.asarray(sigma)[1]) == 1.0, "constant column must get sigma = 1"
assert np.allclose(Xn[:, 0], [-1.224744871391589, 0.0, 1.224744871391589])`),
        ],
      },
      {
        title: "5. Convergence experiments",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create and commit (executed) the notebook §5-convergence.ipynb§ that uses **your** functions from tasks 0–4 on a toy dataset you generate with §np.random.default_rng(0)§: $m=1000$, 3 features drawn with very different scales (e.g. std 1, 10, 100), $y = \theta^\top x + \epsilon$.

It must show, with plots and one or two sentences of interpretation each:
1. Cost vs iteration for batch GD with at least **three** learning rates on standardized features, including one that **diverges**.
2. The same run on **unscaled** features: what is the largest stable $\alpha$, and why (relate it to $\lambda_{\max}(X^\top X/m)$, which you compute)?
3. Batch GD vs SGD: cost vs **number of samples processed** (not epochs) on one plot.
4. A table comparing $\theta$ from normal equations, batch GD and SGD, plus the wall-clock time of each.

Save the plot of item 3 as §convergence.png§.`,
        files: ["5-convergence.ipynb", "convergence.png"],
        checks: [
          nb("5-convergence.ipynb"),
          has("5-convergence.ipynb", "batch_gradient_descent", "uses your batch GD"),
          has("5-convergence.ipynb", "stochastic_gradient_descent", "uses your SGD"),
          has("5-convergence.ipynb", "eigvals|eigvalsh|svd", "computes the Hessian spectrum"),
          ex("convergence.png"),
        ],
      },
      {
        title: "6. Derivation: normal equations and the probabilistic view",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Write, in your own words and notation (PDF, Markdown or LaTeX accepted, max 2 pages), file §written/0-derivations.pdf§ (or §.md§ / §.tex§):

1. Using matrix calculus (trace trick or differentials), derive $\nabla_\theta J(\theta)$ for $J(\theta) = \frac12\lVert X\theta - y\rVert^2$ and from it the normal equations. State when the solution is unique.
2. Show that $J$ is convex (Hessian argument) so the stationary point is the global minimum.
3. Assume $y^{(i)} = \theta^\top x^{(i)} + \epsilon^{(i)}$ with $\epsilon^{(i)}$ i.i.d. $\mathcal N(0, \sigma^2)$. Write the log-likelihood and show its maximizer is the least-squares solution. Does the answer depend on $\sigma$?
4. One paragraph: the cost per iteration of batch GD vs SGD vs solving the normal equations, as a function of $m$ and $n$. When would you **not** use the normal equations?`,
        deliverable: "repo",
        files: ["written/0-derivations.pdf"],
        rubric: "derivation",
        criteria: [
          "Derives the gradient $X^\\top(X\\theta-y)$ with explicit intermediate steps (not just stated)",
          "Obtains $X^\\top X\\theta = X^\\top y$ and states uniqueness iff $X$ has full column rank",
          "Shows the Hessian $X^\\top X$ is positive semi-definite, hence convexity",
          "Writes the Gaussian log-likelihood and shows maximizing it equals minimizing squared error, independent of $\\sigma$",
          "Gives per-iteration costs: $O(mn)$ for batch GD, $O(n)$ per SGD step, $O(mn^2 + n^3)$ for normal equations",
        ],
      },
      {
        title: "7. Mini-batch gradient descent",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`Write §def minibatch_gradient_descent(X, y, alpha=0.01, epochs=10, batch_size=32, seed=0, theta0=None):§ in §100-minibatch_gradient_descent.py§.

* §rng = np.random.default_rng(seed)§; each epoch shuffles with §rng.permutation(m)§ and splits it into consecutive batches of §batch_size§ (the last one may be smaller).
* For each batch $B$: $\theta \leftarrow \theta - \alpha\,\frac{1}{|B|}X_B^\top(X_B\theta - y_B)$.
* Returns §(theta, costs)§ with §costs§ of shape §(epochs + 1,)§ exactly as in task 3.

With §batch_size >= m§ it must behave exactly like batch gradient descent with §iterations=epochs§; with §batch_size=1§ it is SGD.`,
        files: ["100-minibatch_gradient_descent.py"],
        checks: [
          def("100-minibatch_gradient_descent.py", "minibatch_gradient_descent"),
          noLib("100-minibatch_gradient_descent.py"),
          pt(["100-minibatch_gradient_descent.py"], "batch_size >= m reduces to batch GD", py`import numpy as np
from importlib import import_module
mbgd = import_module('100-minibatch_gradient_descent').minibatch_gradient_descent
rng = np.random.default_rng(0)
X = rng.normal(size=(50, 3)); y = rng.normal(size=50)
th, costs = mbgd(X, y, alpha=0.1, epochs=25, batch_size=50)
ref = np.zeros(3)
for _ in range(25):
    ref = ref - 0.1 * X.T @ (X @ ref - y) / 50
assert np.allclose(np.asarray(th), ref, atol=1e-10), "full-batch case should equal batch GD"
assert np.asarray(costs).shape == (26,)`),
          pt(["100-minibatch_gradient_descent.py"], "converges on noise-free data with small batches", py`import numpy as np
from importlib import import_module
mbgd = import_module('100-minibatch_gradient_descent').minibatch_gradient_descent
rng = np.random.default_rng(5)
X = np.c_[np.ones(203), rng.normal(size=(203, 2))]
true = np.array([-1.0, 0.5, 2.0])
th, costs = mbgd(X, X @ true, alpha=0.1, epochs=200, batch_size=16, seed=3)
assert np.allclose(np.asarray(th), true, atol=1e-4), "mini-batch GD did not converge"`),
        ],
      },
    ],
  },

  // ==========================================================================
  // A02 — Logistic regression & Newton's method
  // ==========================================================================
  {
    id: "A02",
    track: TRACK,
    phase: PHASE,
    title: "Logistic Regression & Newton's Method",
    days: 3,
    repo: REPO,
    dir: "0x01-logistic_regression",
    sources: [
      { course: "CS229", lectures: "Lec 3–4", topics: "Locally weighted regression, logistic regression, Newton's method, perceptron, intro to GLMs" },
    ],
    resources: [
      { title: "CS229 main lecture notes — Part II (classification and logistic regression, Newton's method)", url: "https://cs229.stanford.edu/main_notes.pdf" },
      { title: "MNIST on OpenML (mnist_784) — data source for the 0-vs-1 experiment", url: "https://www.openml.org/d/554" },
      { title: "Boyd & Vandenberghe, Convex Optimization — §9.5 Newton's method (free PDF)", url: "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf" },
      { title: "NumPy — numpy.logaddexp (stable log(1 + e^z))", url: "https://numpy.org/doc/stable/reference/generated/numpy.logaddexp.html" },
    ],
    concepts: [
      "Sigmoid and the Bernoulli likelihood",
      "Cross-entropy / negative log-likelihood and its gradient",
      "Convexity of logistic loss (PSD Hessian)",
      "Newton's method and quadratic convergence",
      "Numerical stability (log-sum-exp, overflow)",
      "Locally weighted regression (non-parametric)",
    ],
    objectives: [
      "Derive the gradient and Hessian of the logistic negative log-likelihood",
      "Explain why the logistic loss is convex and what goes wrong on linearly separable data",
      "Compare gradient descent and Newton's method: cost per iteration, number of iterations, convergence rate",
      "Implement a numerically stable sigmoid and cross-entropy that never overflow",
      "Explain the difference between parametric and non-parametric learning using LWR as the example",
      "Train and evaluate a binary classifier on real image data (MNIST 0 vs 1)",
    ],
    requirements: [NUMPY_ONLY, NOTEBOOKS, STYLE, "Labels are §0/1§ integers or floats, shape §(m,)§; §X§ already contains an intercept column when one is wanted"],
    quiz: [
      {
        q: "For logistic regression with $J(\\theta) = -\\frac1m\\sum_i [y_i\\log h_i + (1-y_i)\\log(1-h_i)]$, the gradient is:",
        options: ["$\\frac1m X^\\top(y - h)$", "$\\frac1m X^\\top(h - y)$", "$\\frac1m X^\\top h(1-h)$", "$\\frac1m X^\\top(h-y)\\,h(1-h)$"],
        answer: 1,
        why: "Using $\\sigma'(z)=\\sigma(z)(1-\\sigma(z))$, the $h(1-h)$ factors cancel and you get the same form as least squares: $\\frac1m X^\\top(h-y)$.",
      },
      {
        q: "The Hessian of the (averaged) logistic loss is:",
        options: ["$\\frac1m X^\\top X$", "$\\frac1m X^\\top S X$ with $S=\\mathrm{diag}(h_i(1-h_i))$", "$\\frac1m X^\\top (h-y)(h-y)^\\top X$", "$-\\frac1m X^\\top S X$"],
        answer: 1,
        why: "Differentiate the gradient again: each sample contributes $h_i(1-h_i)x_ix_i^\\top \\succeq 0$, which also proves convexity.",
      },
      {
        q: "Near the optimum, Newton's method converges…",
        options: ["linearly, like GD", "quadratically: the number of correct digits roughly doubles each iteration", "sub-linearly", "in exactly one step for any smooth function"],
        answer: 1,
        why: "Newton's method has local quadratic convergence for smooth, strongly convex objectives. (It converges in one step only for quadratics.)",
      },
      {
        q: "On linearly separable data, unregularized logistic regression trained to convergence…",
        options: ["converges to the max-margin solution with finite norm", "has no finite minimizer: $\\lVert\\theta\\rVert \\to \\infty$", "always returns $\\theta = 0$", "becomes non-convex"],
        answer: 1,
        why: "Scaling a separating $\\theta$ up always lowers the loss, so the infimum (0) is not attained. That is why we add a little L2 regularization for MNIST 0-vs-1.",
      },
      {
        q: "Locally weighted regression is called non-parametric because…",
        options: ["it has no hyperparameters", "the amount of stuff kept to make predictions grows with the training set size", "it does not use θ", "it cannot overfit"],
        answer: 1,
        why: "LWR must keep the whole training set and solves a new weighted least-squares problem for each query.",
      },
    ],
    tasks: [
      {
        title: "0. Stable sigmoid",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §def sigmoid(z):§ in §0-sigmoid.py§ returning $\sigma(z) = \frac{1}{1+e^{-z}}$ element-wise for a scalar or an array of any shape (same shape out).

It must be **numerically stable**: no overflow / divide / invalid warnings for $|z|$ up to 1000 (test it under §np.errstate(over='raise', divide='raise', invalid='raise')§). Hint: never evaluate §np.exp§ of a large positive number — use $e^{-|z|}$.

Create the project §README.md§ (≥ 80 words) describing each file.

§§§python
>>> sigmoid(np.array([-1000., 0., 1000.]))
array([0. , 0.5, 1. ])
§§§`,
        files: ["0-sigmoid.py", "README.md"],
        checks: [
          def("0-sigmoid.py", "sigmoid"),
          noLib("0-sigmoid.py"),
          readme(80),
          pt(["0-sigmoid.py"], "matches 1/(1+e^-z) and preserves shape", py`import numpy as np
from importlib import import_module
sigmoid = import_module('0-sigmoid').sigmoid
z = np.linspace(-30, 30, 121)
assert np.allclose(np.asarray(sigmoid(z)), 1 / (1 + np.exp(-z)), rtol=1e-10, atol=1e-14), "wrong values"
Z = np.random.default_rng(0).normal(size=(4, 5))
out = np.asarray(sigmoid(Z))
assert out.shape == (4, 5), "output must have the input's shape"
assert abs(float(sigmoid(0.0)) - 0.5) < 1e-15`),
          pt(["0-sigmoid.py"], "no overflow for |z| up to 1000", py`import numpy as np
from importlib import import_module
sigmoid = import_module('0-sigmoid').sigmoid
with np.errstate(over='raise', divide='raise', invalid='raise'):
    out = np.asarray(sigmoid(np.array([-1000.0, -745.0, -40.0, 0.0, 40.0, 745.0, 1000.0])), dtype=float)
assert np.all(np.isfinite(out)), "non-finite output"
assert out[0] >= 0 and out[0] < 1e-300 and out[-1] == 1.0, "extreme values wrong"
assert np.all(np.diff(out) >= 0), "sigmoid must be monotone"`),
        ],
      },
      {
        title: "1. Cross-entropy cost and gradient",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §1-logistic_cost.py§ write:

* §def logistic_cost(X, y, theta):§ returns the average negative log-likelihood
  $$J(\theta) = \frac1m\sum_{i=1}^m \Big[\log\big(1+e^{z_i}\big) - y_i z_i\Big],\qquad z = X\theta,$$
  as a Python §float§. This is algebraically equal to the usual cross-entropy. It must be **exact and finite** even when $|z_i|$ is ~1000 (use §np.logaddexp(0, z)§). Clipping probabilities to §[eps, 1-eps]§ is **not** acceptable: it returns wrong values for confident mistakes.
* §def logistic_gradient(X, y, theta):§ returns $\frac1m X^\top(\sigma(X\theta) - y)$, shape §(n,)§.

§X§: §(m, n)§, §y§: §(m,)§ in §{0, 1}§, §theta§: §(n,)§. No loops.`,
        files: ["1-logistic_cost.py"],
        checks: [
          def("1-logistic_cost.py", "logistic_cost", "logistic_gradient"),
          noLib("1-logistic_cost.py"),
          pt(["1-logistic_cost.py", "0-sigmoid.py"], "cost/gradient match reference and finite differences", py`import numpy as np
from importlib import import_module
mod = import_module('1-logistic_cost')
rng = np.random.default_rng(0)
X = rng.normal(size=(80, 4)); y = (rng.random(80) < 0.5).astype(float); th = rng.normal(size=4)
z = X @ th
ref = np.mean(np.logaddexp(0, z) - y * z)
assert abs(float(mod.logistic_cost(X, y, th)) - ref) < 1e-10, "wrong cost"
g = np.asarray(mod.logistic_gradient(X, y, th), dtype=float)
assert np.allclose(g, X.T @ (1 / (1 + np.exp(-z)) - y) / 80, atol=1e-10), "wrong gradient"
eps = 1e-6
num = np.array([(float(mod.logistic_cost(X, y, th + eps * e)) - float(mod.logistic_cost(X, y, th - eps * e))) / (2 * eps) for e in np.eye(4)])
assert np.allclose(g, num, atol=1e-6), "gradient disagrees with numerical gradient"`),
          pt(["1-logistic_cost.py", "0-sigmoid.py"], "exact and finite for huge margins", py`import numpy as np
from importlib import import_module
mod = import_module('1-logistic_cost')
X = np.array([[1.0], [1.0], [-1.0], [-1.0]]); y = np.array([1.0, 0.0, 0.0, 1.0])
th = np.array([800.0])
with np.errstate(over='raise', divide='raise', invalid='raise'):
    J = float(mod.logistic_cost(X, y, th))
    g = np.asarray(mod.logistic_gradient(X, y, th), dtype=float)
assert np.isfinite(J) and abs(J - 400.0) < 1e-6, f"expected 400.0 (two confident mistakes of margin 800), got {J}"
assert np.allclose(g, [0.5], atol=1e-12), "gradient wrong for saturated sigmoid"`),
        ],
      },
      {
        title: "2. Gradient descent for logistic regression",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §def logistic_gd(X, y, alpha=0.1, iterations=1000, theta0=None):§ in §2-logistic_gd.py§.

* Exactly §iterations§ full-batch updates $\theta \leftarrow \theta - \alpha\,\nabla J(\theta)$ starting from §theta0§ (zeros if §None§, never modified in place).
* Returns §(theta, costs)§, §costs§ of shape §(iterations + 1,)§ with §costs[0] = J(theta0)§ (cost as in task 1).

You may reuse task 1 via §__import__('1-logistic_cost')§.`,
        files: ["2-logistic_gd.py"],
        checks: [
          def("2-logistic_gd.py", "logistic_gd"),
          noLib("2-logistic_gd.py"),
          pt(["2-logistic_gd.py", "1-logistic_cost.py", "0-sigmoid.py"], "one exact step and costs length", py`import numpy as np
from importlib import import_module
gd = import_module('2-logistic_gd').logistic_gd
rng = np.random.default_rng(1)
X = rng.normal(size=(30, 3)); y = (rng.random(30) < 0.4).astype(float); th0 = rng.normal(size=3)
keep = th0.copy()
th, costs = gd(X, y, alpha=0.3, iterations=1, theta0=th0)
p = 1 / (1 + np.exp(-(X @ keep)))
assert np.allclose(np.asarray(th), keep - 0.3 * X.T @ (p - y) / 30, atol=1e-12), "update rule wrong"
assert np.asarray(costs).shape == (2,), "costs must have shape (iterations+1,)"
assert np.array_equal(th0, keep), "theta0 modified in place"`),
          pt(["2-logistic_gd.py", "1-logistic_cost.py", "0-sigmoid.py"], "reaches a stationary point on non-separable data", py`import numpy as np
from importlib import import_module
gd = import_module('2-logistic_gd').logistic_gd
rng = np.random.default_rng(2)
X = np.c_[np.ones(300), rng.normal(size=(300, 2))]
p = 1 / (1 + np.exp(-(X @ np.array([0.5, 2.0, -1.0]))))
y = (rng.random(300) < p).astype(float)
th, costs = gd(X, y, alpha=1.0, iterations=3000)
th = np.asarray(th, dtype=float)
grad = X.T @ (1 / (1 + np.exp(-(X @ th))) - y) / 300
assert np.linalg.norm(grad) < 1e-5, "gradient norm should be ~0 after 3000 iterations"
assert np.all(np.diff(np.asarray(costs, dtype=float)) <= 1e-12), "cost must decrease monotonically"`),
        ],
      },
      {
        title: "3. Newton's method",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §3-newton.py§ write:

* §def logistic_hessian(X, theta):§ returns $H = \frac1m X^\top S X$, $S = \mathrm{diag}\big(\sigma(z_i)(1-\sigma(z_i))\big)$, shape §(n, n)§. Do **not** build the §(m, m)§ diagonal matrix (scale the rows of §X§ instead).
* §def newton_method(X, y, iterations=20, tol=1e-10, theta0=None, reg=0.0):§ minimizes $J(\theta) + \frac{\text{reg}}{2}\lVert\theta\rVert^2$ with updates $\theta \leftarrow \theta - (H + \text{reg}\,I)^{-1}(\nabla J + \text{reg}\,\theta)$.
  * Solve the linear system with §np.linalg.solve§ (no §inv§).
  * Stop after §iterations§ updates or as soon as the step norm is below §tol§.
  * Returns §(theta, costs)§ where §costs[0]§ is the (regularized) objective at §theta0§ and one cost is appended after each update performed (so §len(costs) = updates + 1§).

§reg > 0§ is what makes Newton usable on (nearly) separable data like MNIST 0-vs-1.`,
        files: ["3-newton.py"],
        checks: [
          def("3-newton.py", "logistic_hessian", "newton_method"),
          lacks("3-newton.py", "linalg\\.inv\\s*\\(", "no explicit matrix inverse"),
          lacks("3-newton.py", "np\\.diag\\s*\\(", "does not build the (m, m) diagonal matrix"),
          noLib("3-newton.py"),
          pt(["3-newton.py", "1-logistic_cost.py", "0-sigmoid.py"], "Hessian matches X^T S X / m", py`import numpy as np
from importlib import import_module
mod = import_module('3-newton')
rng = np.random.default_rng(0)
X = rng.normal(size=(64, 5)); th = rng.normal(size=5)
p = 1 / (1 + np.exp(-(X @ th)))
ref = (X * (p * (1 - p))[:, None]).T @ X / 64
H = np.asarray(mod.logistic_hessian(X, th), dtype=float)
assert H.shape == (5, 5) and np.allclose(H, ref, atol=1e-12), "Hessian wrong"
assert np.all(np.linalg.eigvalsh(H) > -1e-12), "Hessian must be PSD"`),
          pt(["3-newton.py", "1-logistic_cost.py", "0-sigmoid.py"], "converges to a stationary point in <= 10 iterations (with and without reg)", py`import numpy as np
from importlib import import_module
newton = import_module('3-newton').newton_method
rng = np.random.default_rng(4)
X = np.c_[np.ones(400), rng.normal(size=(400, 3))]
p = 1 / (1 + np.exp(-(X @ np.array([-0.3, 1.5, -2.0, 0.7]))))
y = (rng.random(400) < p).astype(float)
for reg in (0.0, 0.1):
    th, costs = newton(X, y, iterations=10, reg=reg)
    th = np.asarray(th, dtype=float)
    g = X.T @ (1 / (1 + np.exp(-(X @ th))) - y) / 400 + reg * th
    assert np.linalg.norm(g) < 1e-8, f"not stationary after 10 Newton steps (reg={reg})"
    assert 2 <= len(costs) <= 11, "len(costs) must be number of updates + 1"
    assert abs(float(costs[0]) - np.log(2)) < 1e-10, "costs[0] must be J(0) = log 2"`),
        ],
      },
      {
        title: "4. Predictions and accuracy",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §4-predict.py§ write:

* §def predict_proba(X, theta):§ → $\sigma(X\theta)$, shape §(m,)§.
* §def predict(X, theta, threshold=0.5):§ → integer array of §0/1§, shape §(m,)§; predict 1 when probability §>= threshold§.
* §def accuracy(y_true, y_pred):§ → fraction of equal entries as a Python §float§.`,
        files: ["4-predict.py"],
        checks: [
          def("4-predict.py", "predict_proba", "predict", "accuracy"),
          noLib("4-predict.py"),
          pt(["4-predict.py", "0-sigmoid.py"], "predictions, threshold and accuracy are correct", py`import numpy as np
from importlib import import_module
mod = import_module('4-predict')
rng = np.random.default_rng(0)
X = rng.normal(size=(50, 3)); th = rng.normal(size=3)
p = 1 / (1 + np.exp(-(X @ th)))
assert np.allclose(np.asarray(mod.predict_proba(X, th)), p)
yp = np.asarray(mod.predict(X, th))
assert yp.shape == (50,) and np.issubdtype(yp.dtype, np.integer), "predict must return an integer array"
assert np.array_equal(yp, (p >= 0.5).astype(int))
assert np.array_equal(np.asarray(mod.predict(X, th, threshold=0.8)), (p >= 0.8).astype(int))
assert np.array_equal(np.asarray(mod.predict(np.zeros((1, 3)), th)), [1]), "probability 0.5 must map to 1"
assert abs(mod.accuracy(np.array([1, 0, 1, 1]), np.array([1, 1, 1, 0])) - 0.5) < 1e-12`),
        ],
      },
      {
        title: "5. MNIST 0-vs-1: GD vs Newton",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`In the executed notebook §5-mnist_01.ipynb§:

1. Load MNIST (e.g. §fetch_openml('mnist_784')§ — you may use scikit-learn **only to download data** — or the raw IDX files). Keep digits 0 and 1 only, scale pixels to §[0, 1]§, add an intercept column. Use the standard split (first 60 000 images train, last 10 000 test).
2. Train with **your** §logistic_gd§ and **your** §newton_method§ (use a small §reg§, e.g. §1e-3§, and make GD minimize the same regularized objective or report the difference).
3. Plot the training objective vs iteration for both methods on one figure with a log-scale y-axis of $J(\theta_t) - J^\star$ (estimate $J^\star$ from a long Newton run). Save it as §gd_vs_newton.png§.
4. Write §results.json§ with exactly these keys:

| key | meaning |
|---|---|
| §gd_test_accuracy§ | test accuracy of GD model |
| §newton_test_accuracy§ | test accuracy of Newton model |
| §gd_iterations§ | iterations GD needed to reach $J - J^\star < 10^{-6}$ (or the cap you used) |
| §newton_iterations§ | iterations Newton needed for the same tolerance |
| §gd_seconds§, §newton_seconds§ | wall-clock training time |

Thresholds: both accuracies ≥ 0.99, §newton_iterations§ ≤ 25.`,
        files: ["5-mnist_01.ipynb", "results.json", "gd_vs_newton.png"],
        checks: [
          nb("5-mnist_01.ipynb"),
          lacks("5-mnist_01.ipynb", "LogisticRegression|SGDClassifier", "does not use scikit-learn classifiers"),
          metric("results.json", "gd_test_accuracy", ">=", 0.99),
          metric("results.json", "newton_test_accuracy", ">=", 0.99),
          metric("results.json", "newton_iterations", "<=", 25),
          ex("gd_vs_newton.png"),
        ],
      },
      {
        title: "6. Derivation & report: GD vs Newton",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File §written/1-gd_vs_newton.pdf§ (PDF, Markdown or LaTeX accepted, ≤ 2 pages):

1. Derive by hand the gradient and Hessian of the logistic NLL (start from the Bernoulli likelihood with $p(y\mid x;\theta) = h_\theta(x)^y(1-h_\theta(x))^{1-y}$).
2. Prove the loss is convex. Explain what happens to $\lVert\theta\rVert$ on separable data and why $\text{reg}>0$ fixes it.
3. Using your §results.json§ and §gd_vs_newton.png§: compare iterations, time per iteration (relate to $O(mn)$ vs $O(mn^2 + n^3)$ with $n = 785$) and total time. Identify the linear vs quadratic convergence regimes on the plot.
4. Conclude: when would you pick each method on a dataset with $n = 10^5$ features?`,
        deliverable: "repo",
        files: ["written/1-gd_vs_newton.pdf"],
        rubric: "report",
        criteria: [
          "Gradient $\\frac1m X^\\top(h-y)$ and Hessian $\\frac1m X^\\top S X$ derived step by step from the Bernoulli likelihood",
          "Convexity argued from $x^\\top S x \\ge 0$ (PSD Hessian)",
          "Explains divergence of $\\lVert\\theta\\rVert$ on separable data and the role of L2 regularization",
          "Uses the learner's own measured numbers (iterations, seconds) and identifies linear vs quadratic convergence on the plot",
          "Relates per-iteration cost to $O(mn)$ vs $O(mn^2+n^3)$ and gives a justified recommendation for large $n$",
        ],
      },
      {
        title: "7. Locally weighted linear regression",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`Write §def lwr_predict(X_train, y_train, X_query, tau):§ in §100-locally_weighted.py§.

For each query point $x$ (row of §X_query§), compute weights $w_i = \exp\!\left(-\frac{\lVert x^{(i)} - x\rVert^2}{2\tau^2}\right)$ over all training rows (distances use **all** columns, including an intercept column if present — it contributes 0), solve the weighted normal equations $X^\top W X\,\theta = X^\top W y$ (with §np.linalg.solve§ or §lstsq§) and predict $\theta^\top x$.

Returns predictions, shape §(q,)§. Loop over queries is allowed; vectorize the inner computations. As $\tau \to \infty$ the predictions must approach ordinary least squares.`,
        files: ["100-locally_weighted.py"],
        checks: [
          def("100-locally_weighted.py", "lwr_predict"),
          noLib("100-locally_weighted.py"),
          pt(["100-locally_weighted.py"], "matches weighted least squares per query", py`import numpy as np
from importlib import import_module
lwr = import_module('100-locally_weighted').lwr_predict
rng = np.random.default_rng(0)
x = np.sort(rng.uniform(-3, 3, 60))
Xt = np.c_[np.ones(60), x]; yt = np.sin(x) + 0.1 * rng.normal(size=60)
Xq = np.c_[np.ones(7), np.linspace(-2.5, 2.5, 7)]
pred = np.asarray(lwr(Xt, yt, Xq, 0.5), dtype=float)
ref = []
for q in Xq:
    w = np.exp(-np.sum((Xt - q) ** 2, axis=1) / (2 * 0.5 ** 2))
    th = np.linalg.solve(Xt.T @ (Xt * w[:, None]), Xt.T @ (w * yt))
    ref.append(q @ th)
assert pred.shape == (7,) and np.allclose(pred, ref, atol=1e-8), "LWR predictions wrong"`),
          pt(["100-locally_weighted.py"], "huge tau gives ordinary least squares", py`import numpy as np
from importlib import import_module
lwr = import_module('100-locally_weighted').lwr_predict
rng = np.random.default_rng(1)
Xt = np.c_[np.ones(40), rng.normal(size=(40, 2))]; yt = rng.normal(size=40)
Xq = np.c_[np.ones(5), rng.normal(size=(5, 2))]
ols = Xq @ np.linalg.lstsq(Xt, yt, rcond=None)[0]
assert np.allclose(np.asarray(lwr(Xt, yt, Xq, 1e4), dtype=float), ols, atol=1e-5)`),
        ],
      },
    ],
  },

  // ==========================================================================
  // A03 — GLMs, generative learning, Naive Bayes
  // ==========================================================================
  {
    id: "A03",
    track: TRACK,
    phase: PHASE,
    title: "GLMs, Generative Learning & Naive Bayes",
    days: 3,
    repo: REPO,
    dir: "0x02-generative_learning",
    sources: [
      { course: "CS229", lectures: "Lec 5–6", topics: "Exponential family & GLMs (softmax, Poisson), GDA, Naive Bayes, Laplace smoothing, event models for text" },
      { course: "CS221", lectures: "Lec 1", topics: "Overview: modeling – inference – learning paradigm" },
    ],
    resources: [
      { title: "CS229 main lecture notes — Part III (GLMs) and Part IV (generative learning algorithms)", url: "https://cs229.stanford.edu/main_notes.pdf" },
      { title: "SMS Spam Collection (UCI Machine Learning Repository)", url: "https://archive.ics.uci.edu/dataset/228/sms+spam+collection" },
      { title: "Dive into Deep Learning — 4.1 Softmax Regression", url: "https://d2l.ai/chapter_linear-classification/softmax-regression.html" },
      { title: "Bishop, Pattern Recognition and Machine Learning — §4.2 Probabilistic generative models (free PDF)", url: "https://www.microsoft.com/en-us/research/uploads/prod/2006/01/Bishop-Pattern-Recognition-and-Machine-Learning-2006.pdf" },
      { title: "CS221 course site", url: "https://stanford-cs221.github.io/autumn2023/" },
    ],
    concepts: [
      "Exponential family, natural parameter, canonical link",
      "GLM construction: softmax and Poisson regression",
      "Discriminative $p(y\\mid x)$ vs generative $p(x\\mid y)p(y)$ models",
      "Gaussian Discriminant Analysis and its logistic posterior",
      "Naive Bayes (multinomial event model) and Laplace smoothing",
      "Working in log-space to avoid underflow",
    ],
    objectives: [
      "Write the Bernoulli, Gaussian, Poisson and categorical distributions in exponential-family form",
      "Derive softmax regression and Poisson regression as GLMs and state their gradients",
      "Derive the GDA maximum-likelihood estimates and show that its posterior $p(y=1\\mid x)$ is a logistic function",
      "Explain the Naive Bayes conditional-independence assumption and why Laplace smoothing is needed",
      "Argue when a generative model beats a discriminative one and vice versa",
      "Build a working spam filter from raw text with your own Naive Bayes",
    ],
    requirements: [NUMPY_ONLY, NOTEBOOKS, STYLE],
    quiz: [
      {
        q: "In a GLM with the canonical link, the hypothesis $h_\\theta(x)$ equals…",
        options: ["$\\theta^\\top x$ always", "$E[T(y)\\mid x;\\theta]$ expressed as a function of the natural parameter $\\eta=\\theta^\\top x$", "the mode of $p(y\\mid x)$", "$p(x\\mid y)$"],
        answer: 1,
        why: "GLM assumptions: $y\\mid x$ is exponential family with $\\eta=\\theta^\\top x$, and we predict $E[T(y)\\mid x]$ — e.g. $\\sigma(\\eta)$ for Bernoulli, $e^{\\eta}$ for Poisson.",
      },
      {
        q: "GDA with a shared covariance $\\Sigma$ implies that $p(y=1\\mid x)$ is…",
        options: ["quadratic in $x$", "a logistic function of a linear function of $x$", "Gaussian in $x$", "independent of $\\Sigma$"],
        answer: 1,
        why: "The quadratic terms cancel because both classes share $\\Sigma$, leaving $\\sigma(\\theta^\\top x + \\theta_0)$. The converse does not hold, so GDA makes stronger assumptions.",
      },
      {
        q: "Without Laplace smoothing, a multinomial Naive Bayes spam filter sees a word in a test email that never appeared in training spam. What happens?",
        options: ["The word is ignored", "$p(\\text{word}\\mid\\text{spam}) = 0$ so $p(x\\mid\\text{spam}) = 0$, and the posterior can become 0/0", "The prior dominates", "Nothing, NB handles it"],
        answer: 1,
        why: "A single zero factor kills the product; if it also has zero probability under ham you get 0/0. Adding $\\alpha$ to every count fixes it.",
      },
      {
        q: "Ng & Jordan (2001) found that, compared with logistic regression, Naive Bayes typically…",
        options: ["has lower asymptotic error", "approaches its (higher) asymptotic error with far fewer training examples", "is always better", "needs more data to converge"],
        answer: 1,
        why: "Generative models converge faster (O(log n) vs O(n) samples) but to a worse asymptote when their assumptions are wrong.",
      },
    ],
    tasks: [
      {
        title: "0. Softmax regression (multiclass GLM)",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §0-softmax_regression.py§ write:

* §def softmax(Z):§ row-wise softmax of a §(m, k)§ array. Must be stable for entries up to $10^3$ in magnitude (subtract the row max).
* §def softmax_cost_grad(X, Y, Theta):§ for §X§ §(m, n)§, one-hot §Y§ §(m, k)§, §Theta§ §(n, k)§ returns §(cost, grad)§:
  $$J = -\frac1m\sum_{i}\sum_{c} Y_{ic}\log P_{ic},\quad P=\mathrm{softmax}(X\Theta),\qquad \nabla_\Theta J = \frac1m X^\top(P - Y).$$
  §cost§ is a Python §float§; §grad§ has shape §(n, k)§. Compute $\log P$ stably (log-sum-exp), not §np.log(softmax(...))§ of underflowed values.

Also create the project §README.md§ (≥ 80 words).`,
        files: ["0-softmax_regression.py", "README.md"],
        checks: [
          def("0-softmax_regression.py", "softmax", "softmax_cost_grad"),
          noLib("0-softmax_regression.py"),
          readme(80),
          pt(["0-softmax_regression.py"], "softmax is correct and stable", py`import numpy as np
from importlib import import_module
mod = import_module('0-softmax_regression')
rng = np.random.default_rng(0)
Z = rng.normal(size=(6, 4))
E = np.exp(Z); ref = E / E.sum(axis=1, keepdims=True)
assert np.allclose(np.asarray(mod.softmax(Z)), ref, atol=1e-12), "wrong softmax"
with np.errstate(over='raise', invalid='raise'):
    S = np.asarray(mod.softmax(np.array([[1000.0, 1000.0, -1000.0], [-1000.0, 0.0, 999.0]])), dtype=float)
assert np.all(np.isfinite(S)) and np.allclose(S.sum(axis=1), 1)
assert np.allclose(S[0], [0.5, 0.5, 0.0])`),
          pt(["0-softmax_regression.py"], "cost and gradient match reference and finite differences", py`import numpy as np
from importlib import import_module
mod = import_module('0-softmax_regression')
rng = np.random.default_rng(1)
m, n, k = 40, 3, 4
X = rng.normal(size=(m, n)); Y = np.eye(k)[rng.integers(0, k, m)]; Th = rng.normal(size=(n, k))
Z = X @ Th; Z = Z - Z.max(axis=1, keepdims=True)
logP = Z - np.log(np.exp(Z).sum(axis=1, keepdims=True))
cost, grad = mod.softmax_cost_grad(X, Y, Th)
assert abs(float(cost) + np.sum(Y * logP) / m) < 1e-10, "wrong cost"
grad = np.asarray(grad, dtype=float)
assert grad.shape == (n, k) and np.allclose(grad, X.T @ (np.exp(logP) - Y) / m, atol=1e-10), "wrong gradient"
eps = 1e-6; i, j = 2, 1
E = np.zeros_like(Th); E[i, j] = eps
num = (float(mod.softmax_cost_grad(X, Y, Th + E)[0]) - float(mod.softmax_cost_grad(X, Y, Th - E)[0])) / (2 * eps)
assert abs(num - grad[i, j]) < 1e-6
c_big, _ = mod.softmax_cost_grad(X, Y, 1000 * Th)
assert np.isfinite(float(c_big)), "cost must stay finite for huge logits"`),
        ],
      },
      {
        title: "1. Poisson regression",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §1-poisson_regression.py§ (CS229 PS1 style) write:

* §def poisson_log_likelihood(X, y, theta):§ the average log-likelihood **without** the constant $\log y!$ term: $\ell(\theta) = \frac1m\sum_i \big(y_i\,\theta^\top x^{(i)} - e^{\theta^\top x^{(i)}}\big)$, as a §float§.
* §def poisson_regression(X, y, alpha=0.05, iterations=5000, theta0=None):§ batch gradient **ascent** $\theta \leftarrow \theta + \alpha\,\frac1m X^\top\big(y - e^{X\theta}\big)$, returns §theta§ (shape §(n,)§). You may add a stopping rule on the gradient norm (≤ 1e-8).

§y§ holds non-negative integer counts (shape §(m,)§).`,
        files: ["1-poisson_regression.py"],
        checks: [
          def("1-poisson_regression.py", "poisson_log_likelihood", "poisson_regression"),
          noLib("1-poisson_regression.py"),
          pt(["1-poisson_regression.py"], "log-likelihood formula", py`import numpy as np
from importlib import import_module
mod = import_module('1-poisson_regression')
rng = np.random.default_rng(0)
X = rng.normal(size=(30, 3)); y = rng.poisson(2.0, size=30).astype(float); th = 0.3 * rng.normal(size=3)
eta = X @ th
assert abs(float(mod.poisson_log_likelihood(X, y, th)) - np.mean(y * eta - np.exp(eta))) < 1e-10`),
          pt(["1-poisson_regression.py"], "reaches the MLE (zero gradient) and recovers true parameters", py`import numpy as np
from importlib import import_module
mod = import_module('1-poisson_regression')
rng = np.random.default_rng(1)
X = np.c_[np.ones(4000), 0.5 * rng.normal(size=(4000, 2))]
true = np.array([0.5, 0.3, -0.2])
y = rng.poisson(np.exp(X @ true)).astype(float)
th = np.asarray(mod.poisson_regression(X, y, alpha=0.05, iterations=5000), dtype=float)
g = X.T @ (y - np.exp(X @ th)) / 4000
assert np.linalg.norm(g) < 1e-4, "not at a stationary point of the log-likelihood"
assert np.allclose(th, true, atol=0.1), "estimate far from the generating parameters"`),
        ],
      },
      {
        title: "2. Gaussian Discriminant Analysis",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §2-gda.py§ write:

* §def fit_gda(X, y):§ maximum-likelihood GDA with a **shared** covariance. §X§ §(m, n)§, §y§ §(m,)§ in §{0, 1}§. Returns the tuple §(phi, mu0, mu1, Sigma)§ with
  $\phi = \frac1m\sum 1\{y_i=1\}$, $\mu_c$ the class means (shape §(n,)§), and $\Sigma = \frac1m\sum_i (x^{(i)} - \mu_{y_i})(x^{(i)} - \mu_{y_i})^\top$ (divide by $m$, **not** $m-1$), shape §(n, n)§.
* §def gda_predict_proba(X, phi, mu0, mu1, Sigma):§ returns $p(y=1\mid x)$ for every row, shape §(m,)§, computed via the equivalent logistic form $\sigma(\theta^\top x + \theta_0)$ — derive $\theta$ and $\theta_0$ yourself (task 5). Use §np.linalg.solve§, not §inv§.`,
        files: ["2-gda.py"],
        checks: [
          def("2-gda.py", "fit_gda", "gda_predict_proba"),
          noLib("2-gda.py"),
          pt(["2-gda.py"], "MLE parameters match closed form", py`import numpy as np
from importlib import import_module
mod = import_module('2-gda')
rng = np.random.default_rng(0)
X = np.r_[rng.normal([0, 0], 1.0, size=(70, 2)), rng.normal([2, 1], 1.0, size=(30, 2))]
y = np.r_[np.zeros(70), np.ones(30)]
phi, mu0, mu1, S = mod.fit_gda(X, y)
assert abs(float(phi) - 0.3) < 1e-12
assert np.allclose(mu0, X[:70].mean(0)) and np.allclose(mu1, X[70:].mean(0))
D = np.r_[X[:70] - X[:70].mean(0), X[70:] - X[70:].mean(0)]
assert np.allclose(S, D.T @ D / 100, atol=1e-12), "Sigma must be the pooled MLE (divide by m)"`),
          pt(["2-gda.py"], "posterior equals Bayes rule with Gaussian densities", py`import numpy as np
from importlib import import_module
mod = import_module('2-gda')
rng = np.random.default_rng(2)
phi, mu0, mu1 = 0.35, np.array([0.0, 1.0, -1.0]), np.array([1.0, -0.5, 0.5])
A = rng.normal(size=(3, 3)); S = A @ A.T + 0.5 * np.eye(3)
Xq = rng.normal(size=(25, 3))
Si = np.linalg.inv(S)
def logpdf(x, mu):
    d = x - mu
    return -0.5 * np.sum(d @ Si * d, axis=1)
l1 = np.log(phi) + logpdf(Xq, mu1); l0 = np.log(1 - phi) + logpdf(Xq, mu0)
ref = 1 / (1 + np.exp(l0 - l1))
p = np.asarray(mod.gda_predict_proba(Xq, phi, mu0, mu1, S), dtype=float)
assert p.shape == (25,) and np.allclose(p, ref, atol=1e-10), "posterior p(y=1|x) wrong"`),
        ],
      },
      {
        title: "3. Multinomial Naive Bayes with Laplace smoothing",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §3-naive_bayes.py§ write:

* §def fit_multinomial_nb(X, y, alpha=1.0):§ §X§ is a §(m, V)§ array of word **counts**, §y§ §(m,)§ integer labels in §0..K-1§ with §K = y.max() + 1§. Returns §(log_prior, log_likelihood)§:
  * §log_prior[k]§ $= \log\frac{\#\{i: y_i = k\}}{m}$, shape §(K,)§;
  * §log_likelihood[k, j]§ $= \log\frac{\alpha + \sum_{i: y_i=k} X_{ij}}{\alpha V + \sum_{i: y_i=k}\sum_{j'} X_{ij'}}$, shape §(K, V)§ (multinomial event model, Laplace/additive smoothing).
* §def predict_nb(X, log_prior, log_likelihood):§ returns the MAP class for each row, $\arg\max_k \big(\log\phi_k + \sum_j X_{ij}\log\phi_{j\mid k}\big)$, integer array shape §(m,)§.

Everything in log-space, vectorized (one matrix product for prediction).`,
        files: ["3-naive_bayes.py"],
        checks: [
          def("3-naive_bayes.py", "fit_multinomial_nb", "predict_nb"),
          noLib("3-naive_bayes.py"),
          pt(["3-naive_bayes.py"], "smoothed log-probabilities match the formula and are normalized", py`import numpy as np
from importlib import import_module
mod = import_module('3-naive_bayes')
rng = np.random.default_rng(0)
X = rng.poisson(0.7, size=(50, 12)); X[:, 5] = 0
y = rng.integers(0, 3, 50)
lp, ll = mod.fit_multinomial_nb(X, y, alpha=0.5)
lp, ll = np.asarray(lp, dtype=float), np.asarray(ll, dtype=float)
assert lp.shape == (3,) and ll.shape == (3, 12)
assert np.allclose(lp, np.log(np.bincount(y, minlength=3) / 50))
for k in range(3):
    c = X[y == k].sum(0)
    assert np.allclose(ll[k], np.log((c + 0.5) / (c.sum() + 0.5 * 12))), f"wrong likelihoods for class {k}"
assert np.all(np.isfinite(ll)), "unseen words must not give -inf"
assert np.allclose(np.exp(ll).sum(1), 1), "each class distribution over words must sum to 1"`),
          pt(["3-naive_bayes.py"], "predicts the MAP class", py`import numpy as np
from importlib import import_module
mod = import_module('3-naive_bayes')
rng = np.random.default_rng(1)
V = 20
p0 = rng.dirichlet(np.ones(V)); p1 = rng.dirichlet(np.ones(V))
X = np.r_[rng.multinomial(30, p0, size=200), rng.multinomial(30, p1, size=200)]
y = np.r_[np.zeros(200, int), np.ones(200, int)]
lp, ll = mod.fit_multinomial_nb(X, y)
pred = np.asarray(mod.predict_nb(X, lp, ll))
ref = np.argmax(X @ np.asarray(ll).T + np.asarray(lp), axis=1)
assert pred.shape == (400,) and np.array_equal(pred, ref), "prediction is not the argmax of the log posterior"
assert np.mean(pred == y) > 0.9`),
        ],
      },
      {
        title: "4. Spam filter on SMS Spam Collection",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In the executed notebook §4-spam_filter.ipynb§, build a spam classifier from raw text with **your** Naive Bayes:

1. Load the SMS Spam Collection (5 574 messages). Tokenize yourself: lowercase, split on non-alphanumeric characters. Build the vocabulary from the **training** split only, keeping words that occur in ≥ 5 training messages.
2. Use a stratified 80/20 split with §np.random.default_rng(0)§.
3. Report test accuracy, precision and recall for the spam class, and the 10 tokens with the largest $\log\frac{p(\text{token}\mid\text{spam})}{p(\text{token}\mid\text{ham})}$.
4. Compare against a trivial "always ham" baseline and explain why accuracy alone is misleading here (relate it to spam recall).

Write §results.json§ with keys §test_accuracy§, §spam_precision§, §spam_recall§, §vocab_size§ and §top_spam_tokens§ (list of 10 strings). Thresholds: §test_accuracy§ ≥ 0.96, §spam_recall§ ≥ 0.85.`,
        files: ["4-spam_filter.ipynb", "results.json"],
        checks: [
          nb("4-spam_filter.ipynb"),
          lacks("4-spam_filter.ipynb", "MultinomialNB|CountVectorizer|naive_bayes", "no scikit-learn Naive Bayes / vectorizer"),
          has("4-spam_filter.ipynb", "fit_multinomial_nb", "uses your Naive Bayes"),
          metric("results.json", "test_accuracy", ">=", 0.96),
          metric("results.json", "spam_recall", ">=", 0.85),
        ],
      },
      {
        title: "5. Derivations: exponential family and the GDA posterior",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File §written/0-glm_gda_derivations.pdf§ (PDF, Markdown or LaTeX accepted):

1. Write the Bernoulli and Poisson distributions in exponential-family form $p(y;\eta) = b(y)\exp(\eta^\top T(y) - a(\eta))$; identify $\eta, T, a, b$ and show $a'(\eta) = E[y]$. Conclude the canonical response functions (sigmoid, exponential).
2. Derive the GDA MLEs $\phi, \mu_0, \mu_1, \Sigma$ by maximizing the joint log-likelihood.
3. Show that GDA's posterior is $p(y=1\mid x) = \sigma(\theta^\top x + \theta_0)$ and give $\theta$, $\theta_0$ explicitly in terms of $\phi, \mu_0, \mu_1, \Sigma$.
4. Derive the Laplace-smoothed multinomial NB estimates as the MAP estimate under a symmetric Dirichlet prior (state which Dirichlet parameter gives $\alpha$).`,
        deliverable: "repo",
        files: ["written/0-glm_gda_derivations.pdf"],
        rubric: "derivation",
        criteria: [
          "Correct exponential-family forms for Bernoulli ($\\eta=\\log\\frac{\\phi}{1-\\phi}$) and Poisson ($\\eta = \\log\\lambda$, $a = e^{\\eta}$), with $a'(\\eta)=E[y]$ shown",
          "GDA MLEs derived by setting gradients of the log-likelihood to zero (including $\\Sigma$ via matrix calculus)",
          "Posterior reduced to a sigmoid with $\\theta = \\Sigma^{-1}(\\mu_1-\\mu_0)$ and the correct $\\theta_0$ (including $\\log\\frac{\\phi}{1-\\phi}$)",
          "Laplace smoothing obtained as a MAP estimate under a Dirichlet($\\alpha+1$) prior",
        ],
      },
      {
        title: "6. One-page note: discriminative vs generative",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`One page, §written/1-discriminative_vs_generative.md§ (PDF, Markdown or LaTeX accepted). This is week 3 of your 8-page Phase 1 note.

Answer: **When should you prefer a generative model over a discriminative one?** Use the CS229 Lec 5–6 material and the CS221 Lec 1 "modeling / inference / learning" framing. Ground it in your own experiments (spam filter, GDA) and include at least one concrete example where each approach wins.`,
        deliverable: "repo",
        files: ["written/1-discriminative_vs_generative.md"],
        rubric: "essay",
        criteria: [
          "Defines both model families precisely ($p(y\\mid x)$ vs $p(x\\mid y)p(y)$) and how each predicts",
          "Explains that GDA ⇒ logistic posterior but not conversely, i.e. generative models make stronger assumptions",
          "Discusses the data-efficiency vs asymptotic-error trade-off (Ng & Jordan) and robustness to misspecification",
          "Mentions practical advantages of generative models (missing features, sampling, class priors that shift)",
          "Gives a concrete example for each side, referencing the learner's own results",
        ],
      },
      {
        title: "7. Learning curves: GDA vs logistic regression",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`Reproduce the Ng & Jordan effect in the executed notebook §100-gda_vs_logreg.ipynb§:

* Two synthetic settings: (a) data truly Gaussian with shared covariance; (b) non-Gaussian class conditionals (e.g. a mixture or a heavy-tailed distribution).
* For training sizes $m \in \{10, 20, 50, 100, 200, 500, 1000, 5000\}$, average test error over ≥ 20 random draws for your GDA (task 2) and your logistic regression from §0x01-logistic_regression§.
* Plot both learning curves per setting (§gda_vs_logreg.png§) and explain the crossover in a markdown cell.`,
        files: ["100-gda_vs_logreg.ipynb", "gda_vs_logreg.png"],
        checks: [
          nb("100-gda_vs_logreg.ipynb"),
          has("100-gda_vs_logreg.ipynb", "fit_gda", "uses your GDA"),
          ex("gda_vs_logreg.png"),
        ],
      },
    ],
  },

  // ==========================================================================
  // A04 — Kernels & SVMs
  // ==========================================================================
  {
    id: "A04",
    track: TRACK,
    phase: PHASE,
    title: "Kernels & Support Vector Machines (SMO)",
    days: 4,
    repo: REPO,
    dir: "0x03-svm",
    sources: [
      { course: "CS229", lectures: "Lec 7–8", topics: "Optimal margin classifiers, Lagrange duality & KKT, kernels, soft margin, SMO" },
    ],
    resources: [
      { title: "CS229 main lecture notes — Part VI (kernel methods) and Part VII (SVMs, duality, SMO)", url: "https://cs229.stanford.edu/main_notes.pdf" },
      { title: "CS229 handout: The Simplified SMO Algorithm", url: "https://cs229.stanford.edu/materials/smo.pdf" },
      { title: "Platt (1998), Sequential Minimal Optimization", url: "https://www.microsoft.com/en-us/research/publication/sequential-minimal-optimization-a-fast-algorithm-for-training-support-vector-machines/" },
      { title: "Boyd & Vandenberghe, Convex Optimization — Ch. 5 Duality (free PDF)", url: "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf" },
    ],
    concepts: [
      "Functional vs geometric margin",
      "Lagrangian duality, KKT conditions, complementary slackness",
      "Support vectors",
      "Kernel trick and Mercer's condition (PSD Gram matrices)",
      "Soft margin and the box constraint $0\\le\\alpha_i\\le C$",
      "SMO: coordinate ascent on pairs of dual variables",
      "Hinge loss view of the soft-margin SVM",
    ],
    objectives: [
      "Derive the SVM dual from the primal using the Lagrangian and KKT conditions",
      "Explain why only support vectors have $\\alpha_i > 0$ and how $b$ is recovered",
      "Explain the kernel trick and check whether a function is a valid kernel",
      "Implement the simplified SMO algorithm and verify the KKT conditions on its output",
      "Explain the effect of $C$ and the RBF bandwidth $\\gamma$ on the decision boundary",
      "Relate the soft-margin SVM to L2-regularized hinge loss",
    ],
    requirements: [NUMPY_ONLY, NOTEBOOKS, STYLE, "Labels for SVM code are §-1/+1§ floats, shape §(m,)§"],
    quiz: [
      {
        q: "In the soft-margin SVM dual, the constraints on the multipliers are:",
        options: ["$\\alpha_i \\ge 0$ only", "$0 \\le \\alpha_i \\le C$ and $\\sum_i \\alpha_i y_i = 0$", "$\\sum_i \\alpha_i = 1$", "$\\alpha_i \\in \\{0, C\\}$"],
        answer: 1,
        why: "The slack variables add the upper bound $C$; the equality comes from $\\partial L/\\partial b = 0$.",
      },
      {
        q: "A training point with $0 < \\alpha_i < C$ at the optimum satisfies:",
        options: ["$y_i f(x_i) > 1$", "$y_i f(x_i) = 1$ (it lies exactly on the margin)", "$y_i f(x_i) < 1$", "it is misclassified"],
        answer: 1,
        why: "KKT/complementary slackness: $\\alpha_i=0 \\Rightarrow y_if\\ge1$, $0<\\alpha_i<C \\Rightarrow y_if=1$, $\\alpha_i=C \\Rightarrow y_if\\le1$.",
      },
      {
        q: "Why does SMO update two multipliers at a time rather than one?",
        options: ["It is faster to code", "The constraint $\\sum_i\\alpha_iy_i=0$ fixes any single $\\alpha_i$ given the others", "Two is the number of classes", "To enforce $\\alpha_i \\le C$"],
        answer: 1,
        why: "Changing one $\\alpha$ alone would violate the equality constraint, so the smallest feasible update involves a pair.",
      },
      {
        q: "Increasing $\\gamma$ in the RBF kernel $K(x,z)=\\exp(-\\gamma\\lVert x-z\\rVert^2)$ makes the decision boundary…",
        options: ["smoother (more bias)", "more wiggly / local (more variance)", "linear", "unchanged"],
        answer: 1,
        why: "Larger $\\gamma$ means narrower bumps, so each support vector influences a smaller region and the model can fit noise.",
      },
    ],
    tasks: [
      {
        title: "0. Kernel functions",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §0-kernels.py§ write three **vectorized** Gram-matrix functions (no Python loops), each taking §X1§ §(m1, n)§ and §X2§ §(m2, n)§ and returning §(m1, m2)§:

* §def linear_kernel(X1, X2):§ $K = X_1X_2^\top$
* §def polynomial_kernel(X1, X2, degree=3, c=1.0):§ $K = (X_1X_2^\top + c)^{d}$
* §def rbf_kernel(X1, X2, gamma=1.0):§ $K_{ij} = \exp(-\gamma\lVert x_i - z_j\rVert^2)$ — use $\lVert x-z\rVert^2 = \lVert x\rVert^2 + \lVert z\rVert^2 - 2x^\top z$ and clip tiny negative distances to 0.

Also create the project §README.md§ (≥ 80 words).`,
        files: ["0-kernels.py", "README.md"],
        checks: [
          def("0-kernels.py", "linear_kernel", "polynomial_kernel", "rbf_kernel"),
          noLib("0-kernels.py"),
          readme(80),
          pt(["0-kernels.py"], "Gram matrices match definitions", py`import numpy as np
from importlib import import_module
k = import_module('0-kernels')
rng = np.random.default_rng(0)
A = rng.normal(size=(7, 3)); B = rng.normal(size=(5, 3))
assert np.allclose(k.linear_kernel(A, B), A @ B.T)
assert np.allclose(k.polynomial_kernel(A, B, degree=2, c=0.5), (A @ B.T + 0.5) ** 2)
assert np.allclose(k.polynomial_kernel(A, B), (A @ B.T + 1.0) ** 3)
D = ((A[:, None, :] - B[None, :, :]) ** 2).sum(-1)
K = np.asarray(k.rbf_kernel(A, B, gamma=0.7))
assert K.shape == (7, 5) and np.allclose(K, np.exp(-0.7 * D), atol=1e-12), "RBF kernel wrong"`),
          pt(["0-kernels.py"], "RBF Gram matrix is symmetric PSD with unit diagonal", py`import numpy as np
from importlib import import_module
k = import_module('0-kernels')
X = np.random.default_rng(1).normal(size=(40, 4)) * 3
K = np.asarray(k.rbf_kernel(X, X, gamma=0.2), dtype=float)
assert np.allclose(np.diag(K), 1.0, atol=1e-12), "diagonal must be exactly 1 (clip negative distances)"
assert np.allclose(K, K.T, atol=1e-12) and np.min(np.linalg.eigvalsh(K)) > -1e-8, "Gram matrix must be symmetric PSD"
assert np.all(K <= 1.0 + 1e-12)`),
        ],
      },
      {
        title: "1. Primal soft-margin SVM with subgradient descent",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §1-svm_primal.py§ write:

* §def svm_objective(w, b, X, y, C):§ returns $\frac12\lVert w\rVert^2 + C\sum_i \max(0,\, 1 - y_i(w^\top x_i + b))$ as a §float§.
* §def svm_subgradient(X, y, C=1.0, lr=1e-3, epochs=1000):§ full-batch subgradient descent on that objective from §w = 0, b = 0§, with step size §lr / sqrt(t)§ at step §t = 1, 2, …§ (keep track of the best objective seen and return those parameters). Returns §(w, b)§.

This is the "regularized hinge loss" view of the SVM — you will compare it with SMO.`,
        files: ["1-svm_primal.py"],
        checks: [
          def("1-svm_primal.py", "svm_objective", "svm_subgradient"),
          noLib("1-svm_primal.py"),
          pt(["1-svm_primal.py"], "objective formula", py`import numpy as np
from importlib import import_module
mod = import_module('1-svm_primal')
rng = np.random.default_rng(0)
X = rng.normal(size=(20, 3)); y = np.sign(rng.normal(size=20)); w = rng.normal(size=3); b = 0.3
ref = 0.5 * w @ w + 2.0 * np.maximum(0, 1 - y * (X @ w + b)).sum()
assert abs(float(mod.svm_objective(w, b, X, y, 2.0)) - ref) < 1e-10`),
          pt(["1-svm_primal.py"], "separates well-separated blobs and lowers the objective", py`import numpy as np
from importlib import import_module
mod = import_module('1-svm_primal')
rng = np.random.default_rng(1)
X = np.r_[rng.normal([2, 2], 0.6, size=(50, 2)), rng.normal([-2, -2], 0.6, size=(50, 2))]
y = np.r_[np.ones(50), -np.ones(50)]
w, b = mod.svm_subgradient(X, y, C=1.0, lr=0.01, epochs=2000)
w = np.asarray(w, dtype=float); b = float(b)
assert np.mean(np.sign(X @ w + b) == y) == 1.0, "training data should be perfectly separated"
assert float(mod.svm_objective(w, b, X, y, 1.0)) < 0.5 * float(mod.svm_objective(np.zeros(2), 0.0, X, y, 1.0))`),
        ],
      },
      {
        title: "2. Simplified SMO",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Implement the CS229 **simplified SMO** algorithm (see the handout in Resources) in §2-smo.py§:

§def smo(X, y, C=1.0, kernel=None, tol=1e-3, max_passes=10, seed=0, max_iter=10000):§

* §X§ §(m, n)§, §y§ §(m,)§ in §{-1, +1}§. §kernel§ is a callable §kernel(A, B) -> Gram matrix§; §None§ means linear ($AB^\top$). Precompute the full §(m, m)§ Gram matrix once.
* Decision function convention: $f(x) = \sum_i \alpha_i y_i K(x_i, x) + b$.
* For each $i$ violating the KKT conditions by more than §tol§, pick $j \ne i$ at random with §rng = np.random.default_rng(seed)§, compute the bounds $L, H$, $\eta = 2K_{ij} - K_{ii} - K_{jj}$, clip $\alpha_j$, update $\alpha_i$ and $b$ (with the $b_1/b_2$ rule). If you skip a pair (e.g. $|\alpha_j^{new} - \alpha_j^{old}| < 10^{-5}$), make sure $\alpha_j$ is left at its **old** value — otherwise $\sum_i\alpha_iy_i = 0$ silently breaks. Stop when §max_passes§ consecutive passes change nothing, or after §max_iter§ passes.
* Returns §(alphas, b)§: §alphas§ shape §(m,)§, §b§ a §float§.

Must satisfy, on returned values: $0 \le \alpha_i \le C$, $\sum_i\alpha_iy_i = 0$, and the KKT conditions to within a small tolerance.`,
        files: ["2-smo.py"],
        checks: [
          def("2-smo.py", "smo"),
          noLib("2-smo.py"),
          has("2-smo.py", "default_rng", "uses a seeded Generator"),
          pt(["2-smo.py"], "linear kernel: feasible dual, KKT conditions, perfect separation", py`import numpy as np
from importlib import import_module
smo = import_module('2-smo').smo
rng = np.random.default_rng(0)
X = np.r_[rng.normal([1.5, 1.5], 0.7, size=(40, 2)), rng.normal([-1.5, -1.5], 0.7, size=(40, 2))]
y = np.r_[np.ones(40), -np.ones(40)]
C = 1.0
a, b = smo(X, y, C=C, tol=1e-3, max_passes=20, seed=0)
a = np.asarray(a, dtype=float); b = float(b)
assert a.shape == (80,)
assert np.all(a >= -1e-8) and np.all(a <= C + 1e-8), "box constraint violated"
assert abs(a @ y) < 1e-6, "sum(alpha * y) must be 0"
f = (a * y) @ (X @ X.T) + b
yf = y * f
assert np.mean(np.sign(f) == y) == 1.0, "should separate the training blobs"
assert np.all(yf[a < 1e-6] >= 1 - 0.2), "points with alpha = 0 must have margin >= 1 (up to tolerance)"
free = (a > 1e-6) & (a < C - 1e-6)
assert np.all(np.abs(yf[free] - 1) < 0.2), "free support vectors must lie on the margin (up to tolerance)"
assert np.all(yf[a > C - 1e-6] <= 1 + 0.2), "points with alpha = C must have margin <= 1 (up to tolerance)"
assert (a > 1e-6).sum() < 40, "a good solution is sparse"`),
          pt(["2-smo.py"], "RBF kernel separates concentric circles", py`import numpy as np
from importlib import import_module
smo = import_module('2-smo').smo
rng = np.random.default_rng(1)
t = rng.uniform(0, 2 * np.pi, 120); r = np.r_[rng.uniform(0, 1, 60), rng.uniform(2, 3, 60)]
X = np.c_[r * np.cos(t), r * np.sin(t)]
y = np.r_[np.ones(60), -np.ones(60)]
def rbf(A, B, g=0.5):
    D = (A ** 2).sum(1)[:, None] + (B ** 2).sum(1)[None, :] - 2 * A @ B.T
    return np.exp(-g * np.maximum(D, 0))
a, b = smo(X, y, C=10.0, kernel=rbf, tol=1e-3, max_passes=10, seed=0)
a = np.asarray(a, dtype=float)
f = (a * y) @ rbf(X, X) + float(b)
assert np.mean(np.sign(f) == y) >= 0.97, "RBF SVM should fit the circles"
assert abs(a @ y) < 1e-6 and np.all(a <= 10.0 + 1e-8) and np.all(a >= -1e-8)`),
        ],
      },
      {
        title: "3. Decision function, predictions and w",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §3-svm_predict.py§ write:

* §def decision_function(X_train, y_train, alphas, b, X_test, kernel=None):§ returns $f(x) = \sum_i\alpha_iy_iK(x_i,x) + b$ for each row of §X_test§, shape §(q,)§. Only support vectors ($\alpha_i > 10^{-8}$) need to be used. §kernel=None§ means linear.
* §def svm_predict(X_train, y_train, alphas, b, X_test, kernel=None):§ returns §np.where(f >= 0, 1, -1)§.
* §def linear_weights(X_train, y_train, alphas):§ returns $w = \sum_i\alpha_iy_ix_i$, shape §(n,)§ (valid for the linear kernel).`,
        files: ["3-svm_predict.py"],
        checks: [
          def("3-svm_predict.py", "decision_function", "svm_predict", "linear_weights"),
          noLib("3-svm_predict.py"),
          pt(["3-svm_predict.py"], "decision function, predictions and w match definitions", py`import numpy as np
from importlib import import_module
mod = import_module('3-svm_predict')
rng = np.random.default_rng(0)
Xt = rng.normal(size=(30, 3)); yt = np.sign(rng.normal(size=30)); a = np.maximum(0, rng.normal(size=30)); b = -0.2
Xq = rng.normal(size=(9, 3))
f = np.asarray(mod.decision_function(Xt, yt, a, b, Xq), dtype=float)
assert f.shape == (9,) and np.allclose(f, (a * yt) @ (Xt @ Xq.T) + b), "linear decision function wrong"
w = np.asarray(mod.linear_weights(Xt, yt, a), dtype=float)
assert np.allclose(w, (a * yt) @ Xt) and np.allclose(Xq @ w + b, f)
rbf = lambda A, B: np.exp(-0.3 * ((A[:, None] - B[None]) ** 2).sum(-1))
f2 = np.asarray(mod.decision_function(Xt, yt, a, b, Xq, kernel=rbf), dtype=float)
assert np.allclose(f2, (a * yt) @ rbf(Xt, Xq) + b), "kernel decision function wrong"
p = np.asarray(mod.svm_predict(Xt, yt, a, b, Xq, kernel=rbf))
assert set(np.unique(p)) <= {-1, 1} and np.array_equal(p, np.where(f2 >= 0, 1, -1))`),
        ],
      },
      {
        title: "4. Decision boundaries: linear vs RBF",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Executed notebook §4-decision_boundaries.ipynb§ using **only your code** (tasks 0–3):

1. Two 2-D toy datasets generated with §np.random.default_rng(0)§: (a) two overlapping Gaussian blobs, (b) two concentric circles (or "moons"), 200 points each, 70/30 train/test split.
2. Train SMO with the linear kernel and with the RBF kernel on both. Plot the decision boundary ($f=0$), the margins ($f=\pm1$) and circle the support vectors. Save a 2×2 grid as §boundaries.png§.
3. On (a), compare your SMO $w, b$ with the primal subgradient solution from task 1 (same $C$): report $\lVert w_{smo} - w_{sub}\rVert$.
4. For RBF on (b), sweep $C \in \{0.1, 1, 10, 100\}$ and $\gamma \in \{0.1, 1, 10\}$; show train/test accuracy in a table and comment on over/under-fitting.

Write §results.json§ with keys §linear_blobs_test_accuracy§, §linear_circles_test_accuracy§, §rbf_circles_test_accuracy§, §n_support_vectors_rbf§. Threshold: §rbf_circles_test_accuracy§ ≥ 0.95 and §linear_blobs_test_accuracy§ ≥ 0.85.`,
        files: ["4-decision_boundaries.ipynb", "boundaries.png", "results.json"],
        checks: [
          nb("4-decision_boundaries.ipynb"),
          lacks("4-decision_boundaries.ipynb", "sklearn\\.svm|SVC\\(", "no scikit-learn SVMs"),
          ex("boundaries.png"),
          metric("results.json", "rbf_circles_test_accuracy", ">=", 0.95),
          metric("results.json", "linear_blobs_test_accuracy", ">=", 0.85),
        ],
      },
      {
        title: "5. Derivation: the SVM dual and the SMO update",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File §written/0-svm_dual_smo.pdf§ (PDF, Markdown or LaTeX accepted, ≤ 3 pages):

1. Starting from the soft-margin primal $\min_{w,b,\xi}\frac12\lVert w\rVert^2 + C\sum_i\xi_i$ s.t. $y_i(w^\top x_i+b)\ge1-\xi_i,\ \xi_i\ge0$, write the Lagrangian, derive the dual and all KKT conditions.
2. Show how the dual depends on the data only through inner products, and state the kernelized decision function.
3. Derive the SMO two-variable update: the bounds $L,H$ in both cases $y_i = y_j$ and $y_i\ne y_j$, the unconstrained optimum for $\alpha_j$ in terms of $E_i, E_j, \eta$, and the update for $b$.
4. Show that the soft-margin primal is equivalent to minimizing $\frac{1}{2C}\lVert w\rVert^2 + \sum_i\max(0, 1-y_i f(x_i))$.`,
        deliverable: "repo",
        files: ["written/0-svm_dual_smo.pdf"],
        rubric: "derivation",
        criteria: [
          "Lagrangian with multipliers for both constraint sets; stationarity gives $w=\\sum\\alpha_iy_ix_i$, $\\sum\\alpha_iy_i=0$, $\\alpha_i = C - r_i$",
          "Dual objective $\\sum\\alpha_i - \\frac12\\sum_{ij}\\alpha_i\\alpha_jy_iy_j\\langle x_i,x_j\\rangle$ with $0\\le\\alpha_i\\le C$",
          "All three complementary-slackness cases for $y_if(x_i)$ stated correctly",
          "SMO: correct $L,H$ for both label cases and $\\alpha_j^{new} = \\alpha_j - y_j(E_i-E_j)/\\eta$ with clipping",
          "Hinge-loss equivalence shown by eliminating the slack variables",
        ],
      },
      {
        title: "6. Kernel ridge regression",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`In §100-kernel_ridge.py§ write:

* §def kernel_ridge_fit(K, y, lam):§ given the training Gram matrix §K§ §(m, m)§ returns dual coefficients $\beta = (K + \lambda I)^{-1}y$ (use §np.linalg.solve§).
* §def kernel_ridge_predict(K_test, beta):§ given §K_test§ §(q, m)§ with entries $K(x^{test}_i, x_j)$, returns $K_{test}\beta$, shape §(q,)§.

With a linear kernel this must reproduce ridge regression without intercept, $\hat y = X_{test}(X^\top X + \lambda I)^{-1}X^\top y$ — prove the identity in a docstring comment (push-through identity).`,
        files: ["100-kernel_ridge.py"],
        checks: [
          def("100-kernel_ridge.py", "kernel_ridge_fit", "kernel_ridge_predict"),
          lacks("100-kernel_ridge.py", "linalg\\.inv\\s*\\(", "no explicit inverse"),
          pt(["100-kernel_ridge.py"], "linear kernel reproduces primal ridge regression", py`import numpy as np
from importlib import import_module
mod = import_module('100-kernel_ridge')
rng = np.random.default_rng(0)
X = rng.normal(size=(30, 4)); y = rng.normal(size=30); Xq = rng.normal(size=(6, 4)); lam = 0.7
beta = np.asarray(mod.kernel_ridge_fit(X @ X.T, y, lam), dtype=float)
assert beta.shape == (30,) and np.allclose(beta, np.linalg.solve(X @ X.T + lam * np.eye(30), y))
pred = np.asarray(mod.kernel_ridge_predict(Xq @ X.T, beta), dtype=float)
ridge = Xq @ np.linalg.solve(X.T @ X + lam * np.eye(4), X.T @ y)
assert np.allclose(pred, ridge, atol=1e-10), "kernel ridge with linear kernel must equal ridge regression"`),
        ],
      },
      {
        title: "7. Proof: building valid kernels",
        type: "advanced",
        kind: "written",
        points: 1,
        body: md`File §written/100-kernel_validity.pdf§ (PDF, Markdown or LaTeX accepted). Using Mercer's characterization (every finite Gram matrix is symmetric PSD), prove:

1. If $K_1, K_2$ are kernels then $aK_1 + bK_2$ ($a,b\ge0$) and $K_1K_2$ are kernels (use the Schur product theorem or an explicit feature map).
2. $K(x,z) = f(x)f(z)$ is a kernel for any real $f$; $\exp(K_1)$ is a kernel.
3. Conclude that the RBF kernel is a valid kernel.
4. Give a function that is **not** a kernel and exhibit a Gram matrix with a negative eigenvalue.`,
        deliverable: "repo",
        files: ["written/100-kernel_validity.pdf"],
        rubric: "proof",
        criteria: [
          "Closure under non-negative sums proven via $z^\\top(aK_1+bK_2)z\\ge0$",
          "Closure under products proven (Schur product theorem or tensor feature map)",
          "$\\exp(K)$ handled as a limit of polynomials with non-negative coefficients",
          "RBF decomposed as $f(x)f(z)\\exp(2\\gamma x^\\top z)$ and concluded valid",
          "Counterexample with an explicit Gram matrix and a negative eigenvalue",
        ],
      },
    ],
  },

  // ==========================================================================
  // A05 — Bias/variance, regularization, ML debugging
  // ==========================================================================
  {
    id: "A05",
    track: TRACK,
    phase: PHASE,
    title: "Bias/Variance, Regularization & ML Debugging",
    days: 2,
    repo: REPO,
    dir: "0x04-bias_variance",
    sources: [
      { course: "CS229", lectures: "Lec 9–10", topics: "Bias/variance, regularization, model selection, cross-validation, advice for applying ML" },
    ],
    resources: [
      { title: "CS229 main lecture notes — Part VI (regularization and model selection) and the bias-variance chapter", url: "https://cs229.stanford.edu/main_notes.pdf" },
      { title: "Andrew Ng, Machine Learning Yearning (draft, chapters 1–20)", url: "https://github.com/ajaymache/machine-learning-yearning" },
      { title: "Hastie, Tibshirani & Friedman, The Elements of Statistical Learning — §3.4 (ridge), §7.3 (bias-variance), §7.10 (CV)", url: "https://hastie.su.domains/ElemStatLearn/" },
      { title: "scikit-learn user guide — Cross-validation (concepts and pitfalls; read, don't import)", url: "https://scikit-learn.org/stable/modules/cross_validation.html" },
    ],
    concepts: [
      "Bias–variance decomposition of expected squared error",
      "Under- vs over-fitting; model capacity",
      "Ridge (L2) regularization and its closed form",
      "Hold-out validation and k-fold cross-validation",
      "Learning curves as a diagnostic",
      "Avoidable bias, variance and the dev/test set discipline (MLY)",
    ],
    objectives: [
      "Derive $E[(y-\\hat f(x))^2] = \\text{bias}^2 + \\text{variance} + \\sigma^2$",
      "Read a learning curve and say whether more data, more features or more regularization will help",
      "Derive ridge regression in closed form and explain why the intercept is not penalized",
      "Implement k-fold cross-validation correctly (no leakage between folds)",
      "Set up dev/test sets and a single-number metric following Machine Learning Yearning",
      "Run an error analysis and prioritize the next experiment",
    ],
    requirements: [NUMPY_ONLY, NOTEBOOKS, STYLE],
    quiz: [
      {
        q: "Training error 1%, dev error 11%, human-level error ≈ 0%. The main problem is…",
        options: ["high (avoidable) bias", "high variance", "data mismatch", "irreducible noise"],
        answer: 1,
        why: "Avoidable bias ≈ 1%, variance ≈ 10% (dev − train). Try more data, regularization or a smaller model.",
      },
      {
        q: "In ridge regression the intercept is usually not penalized because…",
        options: ["it makes the closed form impossible", "penalizing it would make predictions depend on the arbitrary origin of $y$", "it is always zero", "it reduces variance too much"],
        answer: 1,
        why: "Shifting all targets by a constant should shift predictions by that constant; penalizing $b$ breaks this invariance.",
      },
      {
        q: "Both training and validation error are high and close to each other, and adding more data barely helps. You should…",
        options: ["collect more data", "increase model capacity / add features / reduce regularization", "increase λ", "use a larger validation set"],
        answer: 1,
        why: "That is the high-bias signature: the learning curves have plateaued together.",
      },
      {
        q: "You standardize features using the mean and std of the **whole** dataset before running 5-fold CV. What is wrong?",
        options: ["Nothing", "Information from the validation fold leaks into training; statistics must be fit on each training fold only", "Standardization is not needed for linear models", "CV requires 10 folds"],
        answer: 1,
        why: "Every preprocessing step that learns from data must be fit inside each fold, otherwise CV estimates are optimistic.",
      },
    ],
    tasks: [
      {
        title: "0. Ridge regression (closed form)",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §0-ridge.py§ write §def ridge_closed_form(X, y, lam, fit_intercept=True):§ minimizing
$$\lVert y - Xw - b\mathbf 1\rVert^2 + \lambda\lVert w\rVert^2$$
(sum of squares, **intercept not penalized**). Returns §(w, b)§ with §w§ shape §(n,)§ and §b§ a §float§ (§b = 0.0§ when §fit_intercept=False§). Hint: center §X§ and §y§, solve for §w§, then recover §b§. Use §np.linalg.solve§.

Also create the project §README.md§ (≥ 80 words).`,
        files: ["0-ridge.py", "README.md"],
        checks: [
          def("0-ridge.py", "ridge_closed_form"),
          lacks("0-ridge.py", "linalg\\.inv\\s*\\(", "no explicit inverse"),
          noLib("0-ridge.py"),
          readme(80),
          pt(["0-ridge.py"], "matches the closed form with an unpenalized intercept", py`import numpy as np
from importlib import import_module
ridge = import_module('0-ridge').ridge_closed_form
rng = np.random.default_rng(0)
X = rng.normal(2.0, 1.5, size=(60, 4)); y = X @ np.array([1.0, -2.0, 0.5, 0.0]) + 7.0 + rng.normal(size=60)
lam = 3.0
xm, ym = X.mean(0), y.mean()
w_ref = np.linalg.solve((X - xm).T @ (X - xm) + lam * np.eye(4), (X - xm).T @ (y - ym))
b_ref = ym - xm @ w_ref
w, b = ridge(X, y, lam)
assert np.allclose(np.asarray(w), w_ref, atol=1e-10) and abs(float(b) - b_ref) < 1e-10, "wrong (w, b)"
w2, b2 = ridge(X, y + 100.0, lam)
assert np.allclose(np.asarray(w2), w_ref, atol=1e-8) and abs(float(b2) - (b_ref + 100)) < 1e-8, "shifting y must only shift b"`),
          pt(["0-ridge.py"], "no-intercept mode and lam = 0 limit", py`import numpy as np
from importlib import import_module
ridge = import_module('0-ridge').ridge_closed_form
rng = np.random.default_rng(1)
X = rng.normal(size=(40, 3)); y = rng.normal(size=40)
w, b = ridge(X, y, 2.0, fit_intercept=False)
assert float(b) == 0.0 and np.allclose(np.asarray(w), np.linalg.solve(X.T @ X + 2.0 * np.eye(3), X.T @ y))
w0, b0 = ridge(X, y, 0.0)
ols = np.linalg.lstsq(np.c_[X, np.ones(40)], y, rcond=None)[0]
assert np.allclose(np.asarray(w0), ols[:3], atol=1e-8) and abs(float(b0) - ols[3]) < 1e-8, "lam=0 must equal OLS"`),
        ],
      },
      {
        title: "1. Polynomial features",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §1-polynomial_features.py§ write §def polynomial_features(x, degree):§ for a 1-D array §x§ §(m,)§ returning the §(m, degree + 1)§ matrix $[1, x, x^2, \dots, x^{degree}]$ (column §j§ is §x**j§). No loops over samples (a loop over powers is fine). §degree = 0§ returns a column of ones.`,
        files: ["1-polynomial_features.py"],
        checks: [
          def("1-polynomial_features.py", "polynomial_features"),
          noLib("1-polynomial_features.py"),
          pt(["1-polynomial_features.py"], "matches the Vandermonde matrix", py`import numpy as np
from importlib import import_module
pf = import_module('1-polynomial_features').polynomial_features
x = np.random.default_rng(0).uniform(-1, 1, 25)
for d in (0, 1, 3, 9):
    P = np.asarray(pf(x, d), dtype=float)
    assert P.shape == (25, d + 1), f"degree {d}: wrong shape {P.shape}"
    assert np.allclose(P, np.vander(x, d + 1, increasing=True)), f"degree {d}: wrong values"`),
        ],
      },
      {
        title: "2. k-fold cross-validation",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §2-kfold.py§ write:

* §def kfold_indices(m, k, shuffle=True, seed=0):§ returns a list of §k§ tuples §(train_idx, val_idx)§ of integer arrays. The validation sets partition §range(m)§, their sizes differ by at most 1 (the first §m % k§ folds get the extra sample), and §train_idx§ is the complement of §val_idx§. With §shuffle=True§, permute with §np.random.default_rng(seed).permutation(m)§ first; with §shuffle=False§ the folds are consecutive blocks in order.
* §def cross_val_mse(X, y, k, fit_fn, predict_fn, seed=0):§ uses §kfold_indices(len(y), k, True, seed)§; for each fold calls §model = fit_fn(X[train], y[train])§ and §predict_fn(model, X[val])§; returns the **unweighted mean of the per-fold MSEs** as a §float§.

§§§python
>>> [v.tolist() for _, v in kfold_indices(7, 3, shuffle=False)]
[[0, 1, 2], [3, 4], [5, 6]]
§§§`,
        files: ["2-kfold.py"],
        checks: [
          def("2-kfold.py", "kfold_indices", "cross_val_mse"),
          noLib("2-kfold.py"),
          pt(["2-kfold.py"], "folds partition the data with balanced sizes", py`import numpy as np
from importlib import import_module
mod = import_module('2-kfold')
for m, k in [(7, 3), (100, 10), (23, 5)]:
    for shuffle in (False, True):
        folds = mod.kfold_indices(m, k, shuffle=shuffle, seed=0)
        assert len(folds) == k
        vals = [np.asarray(v) for _, v in folds]
        allv = np.concatenate(vals)
        assert np.array_equal(np.sort(allv), np.arange(m)), "validation sets must partition range(m)"
        sizes = [len(v) for v in vals]
        assert max(sizes) - min(sizes) <= 1 and sizes == sorted(sizes, reverse=True)
        for tr, v in folds:
            assert np.array_equal(np.sort(np.asarray(tr)), np.setdiff1d(np.arange(m), v)), "train must be the complement"
        if not shuffle:
            assert np.array_equal(allv, np.arange(m)), "shuffle=False must give consecutive blocks"
assert [v.tolist() for _, v in mod.kfold_indices(7, 3, shuffle=False)] == [[0, 1, 2], [3, 4], [5, 6]]
a = np.concatenate([v for _, v in mod.kfold_indices(50, 5, True, 0)])
b = np.concatenate([v for _, v in mod.kfold_indices(50, 5, True, 1)])
assert not np.array_equal(a, b) and not np.array_equal(a, np.arange(50)), "seed must control shuffling"`),
          pt(["2-kfold.py"], "cross_val_mse averages per-fold MSE without leakage", py`import numpy as np
from importlib import import_module
mod = import_module('2-kfold')
rng = np.random.default_rng(3)
X = rng.normal(size=(31, 2)); y = rng.normal(size=31)
seen = []
def fit(Xt, yt):
    seen.append(len(yt))
    return yt.mean()
def pred(model, Xv):
    return np.full(len(Xv), model)
got = float(mod.cross_val_mse(X, y, 4, fit, pred, seed=2))
exp = np.mean([np.mean((y[v] - y[t].mean()) ** 2) for t, v in mod.kfold_indices(31, 4, True, 2)])
assert abs(got - exp) < 1e-12, "cross_val_mse must be the mean of per-fold MSEs"
assert sorted(seen) == [23, 23, 23, 24], "fit_fn must only see the training folds"`),
        ],
      },
      {
        title: "3. Learning curves",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §3-learning_curves.py§ write §def learning_curve(X_train, y_train, X_val, y_val, sizes, fit_fn, predict_fn):§

For each §n§ in §sizes§, fit on the **first** §n§ training samples (§fit_fn(X_train[:n], y_train[:n])§), and record the MSE on those same §n§ samples and on the whole validation set. Returns §(train_errors, val_errors)§, two §numpy§ arrays of shape §(len(sizes),)§.`,
        files: ["3-learning_curves.py"],
        checks: [
          def("3-learning_curves.py", "learning_curve"),
          noLib("3-learning_curves.py"),
          pt(["3-learning_curves.py"], "errors computed on the right subsets", py`import numpy as np
from importlib import import_module
lc = import_module('3-learning_curves').learning_curve
rng = np.random.default_rng(0)
Xt = rng.normal(size=(40, 3)); yt = rng.normal(size=40); Xv = rng.normal(size=(15, 3)); yv = rng.normal(size=15)
fit = lambda X, y: y.mean()
pred = lambda mdl, X: np.full(len(X), mdl)
tr, va = lc(Xt, yt, Xv, yv, [2, 10, 40], fit, pred)
tr, va = np.asarray(tr, dtype=float), np.asarray(va, dtype=float)
assert tr.shape == (3,) and va.shape == (3,)
for i, n in enumerate([2, 10, 40]):
    mu = yt[:n].mean()
    assert abs(tr[i] - np.mean((yt[:n] - mu) ** 2)) < 1e-12 and abs(va[i] - np.mean((yv - mu) ** 2)) < 1e-12
ols_fit = lambda X, y: np.linalg.lstsq(X, y, rcond=None)[0]
ols_pred = lambda w, X: X @ w
tr, va = lc(Xt, yt, Xv, yv, [3, 20], ols_fit, ols_pred)
assert float(np.asarray(tr)[0]) < 1e-20, "with n = number of features, OLS interpolates the training set"`),
        ],
      },
      {
        title: "4. Bias/variance experiment",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Executed notebook §4-bias_variance.ipynb§ using your functions from tasks 0–3. Data (generate exactly this): with §rng = np.random.default_rng(0)§, $x \sim U(0,1)$, $y = \sin(2\pi x) + \epsilon$, $\epsilon\sim\mathcal N(0, 0.3^2)$; 30 training points, 1 000 test points (drawn after the training points).

1. Fit polynomials of degree 0–15 by least squares; plot train and 5-fold CV error vs degree (log y-axis).
2. Fix degree 12 and sweep $\lambda \in 10^{[-8, 2]}$ with ridge (on standardized polynomial features); plot CV error vs $\lambda$.
3. Learning curves for degree 1 (high bias) and degree 12 with $\lambda=0$ (high variance), training sizes 5 → 200 (generate more training data from the same process). Explain what each curve tells you.
4. Pick (degree, $\lambda$) by CV only, then report test MSE once.

Write §results.json§: §best_degree§, §best_lambda§, §cv_mse§, §test_mse§. Threshold: §test_mse§ ≤ 0.13 (the noise variance is 0.09).`,
        files: ["4-bias_variance.ipynb", "results.json"],
        checks: [
          nb("4-bias_variance.ipynb"),
          has("4-bias_variance.ipynb", "cross_val_mse|kfold_indices", "uses your cross-validation"),
          has("4-bias_variance.ipynb", "ridge_closed_form", "uses your ridge"),
          metric("results.json", "test_mse", "<=", 0.13),
          metric("results.json", "best_degree", ">=", 3),
        ],
      },
      {
        title: "5. ML debugging checklist (Machine Learning Yearning ch. 1–20)",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Read *Machine Learning Yearning* chapters 1–20 alongside Lecture 10 ("advice for applying ML"). Write your personal, reusable **debugging checklist** in §written/0-debugging_checklist.md§ (Markdown or PDF), which you will keep updating for the rest of the program (Phase 2 builds on it).

Structure it as decision steps (if you observe X → try Y, because Z), not as a summary of chapters. It must cover set-up (dev/test sets, metrics), diagnosis (bias vs variance, learning curves), error analysis, and the action menu for each diagnosis. Include one worked example using the numbers from your task 4 experiment.`,
        deliverable: "repo",
        files: ["written/0-debugging_checklist.md"],
        rubric: "summary",
        criteria: [
          "Dev/test sets from the same distribution as future data; dev set size guidance; single-number evaluation metric; optimizing vs satisficing metrics",
          "Bias/variance decomposition with avoidable bias relative to optimal (human/Bayes) error, with numeric example",
          "Error analysis procedure: manually inspect ~100 misclassified dev examples, tabulate categories, estimate ceiling of each fix",
          "Concrete action list for high bias vs high variance (and what NOT to do, e.g. more data for high bias)",
          "Worked example uses the learner's own task-4 learning curves / numbers",
        ],
      },
      {
        title: "6. Monte-Carlo bias–variance decomposition",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`In §100-bias_variance_decomposition.py§ write
§def bias_variance_estimate(fit_fn, predict_fn, sample_fn, x_test, f_true, n_trials=200, seed=0):§

* §rng = np.random.default_rng(seed)§; for each of §n_trials§ trials draw a fresh training set §X, y = sample_fn(rng)§, fit §model = fit_fn(X, y)§ and predict §predict_fn(model, x_test)§ (shape §(q,)§).
* With $\bar f(x)$ the average prediction over trials, return §(bias2, variance)§: $\text{bias}^2 = \frac1q\sum_x(\bar f(x) - f_{true}(x))^2$ and $\text{variance} = \frac1q\sum_x \frac{1}{T}\sum_t(\hat f_t(x) - \bar f(x))^2$ (population variance over trials).

Then, in the README, use it to plot bias², variance and their sum vs polynomial degree for the task-4 data-generating process.`,
        files: ["100-bias_variance_decomposition.py"],
        checks: [
          def("100-bias_variance_decomposition.py", "bias_variance_estimate"),
          noLib("100-bias_variance_decomposition.py"),
          pt(["100-bias_variance_decomposition.py"], "constant model has zero variance and known bias", py`import numpy as np
from importlib import import_module
bv = import_module('100-bias_variance_decomposition').bias_variance_estimate
xq = np.linspace(0, 1, 11)[:, None]; f = np.sin(2 * np.pi * xq[:, 0])
sample = lambda rng: (rng.uniform(size=(20, 1)), rng.normal(size=20))
b2, v = bv(lambda X, y: 0.5, lambda mdl, X: np.full(len(X), mdl), sample, xq, f, n_trials=30)
assert abs(float(v)) < 1e-12 and abs(float(b2) - np.mean((0.5 - f) ** 2)) < 1e-12`),
          pt(["100-bias_variance_decomposition.py"], "sample-mean estimator has variance ~ 1/n", py`import numpy as np
from importlib import import_module
bv = import_module('100-bias_variance_decomposition').bias_variance_estimate
xq = np.zeros((5, 1)); f = np.zeros(5)
sample = lambda rng: (np.zeros((10, 1)), rng.normal(size=10))
b2, v = bv(lambda X, y: y.mean(), lambda mdl, X: np.full(len(X), mdl), sample, xq, f, n_trials=4000, seed=1)
assert abs(float(v) - 0.1) < 0.01, f"variance of the mean of 10 N(0,1) should be ~0.1, got {float(v)}"
assert float(b2) < 1e-3`),
        ],
      },
    ],
  },

  // ==========================================================================
  // A06 — Decision trees & ensembles
  // ==========================================================================
  {
    id: "A06",
    track: TRACK,
    phase: PHASE,
    title: "Decision Trees & Ensembles",
    days: 2,
    repo: REPO,
    dir: "0x05-trees_ensembles",
    sources: [
      { course: "CS229", lectures: "Lec 11–12", topics: "Decision trees (greedy splitting, Gini / cross-entropy), bagging, random forests, boosting" },
    ],
    resources: [
      { title: "CS229 notes: Decision Trees & Ensemble Methods (in the main notes / section handouts)", url: "https://cs229.stanford.edu/main_notes.pdf" },
      { title: "Hastie, Tibshirani & Friedman, ESL — §9.2 Trees, §8.7 Bagging, §10 Boosting, §15 Random Forests", url: "https://hastie.su.domains/ElemStatLearn/" },
      { title: "Freund & Schapire, A Short Introduction to Boosting (1999)", url: "https://cseweb.ucsd.edu/~yfreund/papers/IntroToBoosting.pdf" },
      { title: "Breast Cancer Wisconsin (Diagnostic) dataset — UCI", url: "https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic" },
    ],
    concepts: [
      "Recursive binary splitting and impurity (Gini, entropy)",
      "Stopping criteria and tree depth as capacity",
      "Bootstrap aggregation and decorrelation via feature subsampling",
      "Random forests and out-of-bag error",
      "AdaBoost: sample re-weighting and exponential loss",
      "Gradient boosting as functional gradient descent",
    ],
    objectives: [
      "Compute Gini impurity and information gain by hand for a candidate split",
      "Explain why greedy tree growing works and why deep trees have high variance",
      "Derive the variance of an average of correlated predictors and explain why random forests subsample features",
      "Derive the AdaBoost weight update and $\\alpha_t = \\frac12\\log\\frac{1-\\epsilon_t}{\\epsilon_t}$",
      "Contrast bagging (variance reduction) with boosting (bias reduction)",
      "Implement CART, a random forest and AdaBoost from scratch in NumPy",
    ],
    requirements: [NUMPY_ONLY, NOTEBOOKS, STYLE, "§sklearn.datasets§ may be used in notebooks **only** to load data"],
    quiz: [
      {
        q: "A node holds 6 samples of class A and 2 of class B. Its Gini impurity is…",
        options: ["0.25", "0.375", "0.5", "0.8113"],
        answer: 1,
        why: "$1 - (0.75^2 + 0.25^2) = 1 - 0.625 = 0.375$. (0.8113 is the entropy in bits.)",
      },
      {
        q: "Averaging $B$ identically distributed predictors with variance $\\sigma^2$ and pairwise correlation $\\rho$ gives variance…",
        options: ["$\\sigma^2/B$", "$\\rho\\sigma^2 + \\frac{1-\\rho}{B}\\sigma^2$", "$\\rho\\sigma^2/B$", "$\\sigma^2$"],
        answer: 1,
        why: "As $B\\to\\infty$ the variance floors at $\\rho\\sigma^2$, which is why random forests decorrelate trees by subsampling features.",
      },
      {
        q: "In AdaBoost, after round $t$ the weights of misclassified samples are…",
        options: ["set to zero", "multiplied by $e^{\\alpha_t}$ (then all weights renormalized)", "multiplied by $e^{-\\alpha_t}$", "unchanged"],
        answer: 1,
        why: "$w_i \\leftarrow w_i\\exp(-\\alpha_t y_i h_t(x_i))$: mistakes ($y_ih_t=-1$) are up-weighted by $e^{\\alpha_t}$.",
      },
      {
        q: "Boosting with very shallow trees (stumps) mostly reduces…",
        options: ["variance", "bias", "irreducible error", "training time"],
        answer: 1,
        why: "Each stump is a high-bias weak learner; the additive model built by boosting reduces bias. Bagging deep trees reduces variance.",
      },
    ],
    tasks: [
      {
        title: "0. Gini impurity and best split",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §0-gini.py§ write:

* §def gini(y):§ Gini impurity $1 - \sum_c p_c^2$ of an integer label array (any labels, not necessarily §0..K-1§). Returns §0.0§ for an empty array.
* §def best_split(X, y):§ exhaustive search over every feature §j§ and every threshold §t§ equal to the **midpoint between consecutive distinct sorted values** of §X[:, j]§. A sample goes left iff §X[i, j] <= t§. Returns §(feature, threshold, gain)§ maximizing $\text{gain} = G(y) - \frac{n_L}{n}G(y_L) - \frac{n_R}{n}G(y_R)$; returns §(None, None, 0.0)§ if no split is possible.

Also create the project §README.md§ (≥ 80 words).`,
        files: ["0-gini.py", "README.md"],
        checks: [
          def("0-gini.py", "gini", "best_split"),
          noLib("0-gini.py"),
          readme(80),
          pt(["0-gini.py"], "Gini values", py`import numpy as np
from importlib import import_module
mod = import_module('0-gini')
assert abs(float(mod.gini(np.array([0, 0, 0, 0, 0, 0, 1, 1]))) - 0.375) < 1e-12
assert abs(float(mod.gini(np.array([7, 7, 7]))) - 0.0) < 1e-12
assert abs(float(mod.gini(np.array([3, 5, 9]))) - (1 - 3 / 9)) < 1e-12
assert float(mod.gini(np.array([], dtype=int))) == 0.0`),
          pt(["0-gini.py"], "finds the unique best feature, threshold and gain", py`import numpy as np
from importlib import import_module
mod = import_module('0-gini')
rng = np.random.default_rng(0)
x1 = np.arange(10, dtype=float); rng.shuffle(x1)
X = np.c_[rng.uniform(size=10), x1]
y = (x1 > 4.5).astype(int)
j, t, g = mod.best_split(X, y)
assert j == 1 and abs(float(t) - 4.5) < 1e-12 and abs(float(g) - 0.5) < 1e-12, f"got {(j, t, g)}"
X2 = np.array([[1.0, 0.0], [2.0, 0.0], [3.0, 0.0], [4.0, 0.0]]); y2 = np.array([0, 0, 1, 0])
j, t, g = mod.best_split(X2, y2)
assert j == 0 and abs(float(t) - 2.5) < 1e-12 and abs(float(g) - (0.375 - 0.25)) < 1e-12, f"got {(j, t, g)}"
j, t, g = mod.best_split(np.ones((5, 2)), np.array([0, 1, 0, 1, 1]))
assert j is None and t is None and float(g) == 0.0`),
        ],
      },
      {
        title: "1. CART decision tree classifier",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §1-decision_tree.py§ write §class DecisionTreeClassifier§:

* §__init__(self, max_depth=None, min_samples_split=2, max_features=None, seed=0)§ — §max_features§ (int or §None§ = all) is the number of features drawn **without replacement** at each node (needed by the random forest); use §np.random.default_rng(seed)§.
* §fit(self, X, y)§ grows the tree greedily with Gini (you may import §best_split§ from §0-gini.py§). A node becomes a leaf when it is pure, has fewer than §min_samples_split§ samples, reaches §max_depth§ (root has depth 0), or no split has positive gain. Leaves predict their majority class (ties → smallest label). Returns §self§.
* §predict(self, X)§ returns an array of labels (same dtype/values as the training labels), shape §(m,)§.

Represent the tree however you like (nested dicts or node objects).`,
        files: ["1-decision_tree.py"],
        checks: [
          def("1-decision_tree.py", "DecisionTreeClassifier"),
          noLib("1-decision_tree.py"),
          pt(["1-decision_tree.py", "0-gini.py"], "grows to zero training error and respects max_depth", py`import numpy as np
from importlib import import_module
DT = import_module('1-decision_tree').DecisionTreeClassifier
rng = np.random.default_rng(0)
X = rng.uniform(-1, 1, size=(200, 2))
y = np.where((X[:, 0] > 0) ^ (X[:, 1] > 0), 7, 3)
t = DT().fit(X, y)
p = np.asarray(t.predict(X))
assert p.shape == (200,) and np.all(p == y), "a fully grown tree must fit distinct points perfectly"
assert set(np.unique(p)) <= {3, 7}, "predictions must be training labels"
s = DT(max_depth=1).fit(X, y)
assert len(np.unique(s.predict(X))) <= 2
s0 = DT(max_depth=0).fit(X, y)
assert len(np.unique(s0.predict(X))) == 1, "max_depth=0 is a single leaf"`),
          pt(["1-decision_tree.py", "0-gini.py"], "generalizes on an axis-aligned rule", py`import numpy as np
from importlib import import_module
DT = import_module('1-decision_tree').DecisionTreeClassifier
rng = np.random.default_rng(1)
X = rng.uniform(size=(400, 4)); y = ((X[:, 2] > 0.3) & (X[:, 0] < 0.8)).astype(int)
t = DT(max_depth=3).fit(X[:300], y[:300])
acc = np.mean(np.asarray(t.predict(X[300:])) == y[300:])
assert acc >= 0.97, f"test accuracy {acc:.3f} too low for a depth-3 tree on a 2-split rule"`),
        ],
      },
      {
        title: "2. Random forest",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §2-random_forest.py§ write §class RandomForestClassifier§:

* §__init__(self, n_estimators=25, max_depth=None, max_features='sqrt', seed=0)§; §'sqrt'§ means §max(1, int(np.sqrt(n_features)))§; an int is used as is.
* §fit(X, y)§: for each tree draw a bootstrap sample (size §m§, with replacement) with §rng = np.random.default_rng(seed)§ and fit your §DecisionTreeClassifier§ (import it from §1-decision_tree.py§ with §__import__§) with feature subsampling and a distinct seed per tree. Store the out-of-bag indices.
* §predict(X)§: majority vote (ties → smallest label).
* §oob_score(self, X, y)§: out-of-bag accuracy on the training set used in §fit§ (samples never out-of-bag are skipped).`,
        files: ["2-random_forest.py"],
        checks: [
          def("2-random_forest.py", "RandomForestClassifier"),
          noLib("2-random_forest.py"),
          has("2-random_forest.py", "1-decision_tree", "reuses your decision tree"),
          pt(["2-random_forest.py", "1-decision_tree.py", "0-gini.py"], "beats a single tree on noisy data; OOB score is sensible", py`import numpy as np
from importlib import import_module
RF = import_module('2-random_forest').RandomForestClassifier
DT = import_module('1-decision_tree').DecisionTreeClassifier
rng = np.random.default_rng(0)
X = rng.normal(size=(600, 5))
y = (X[:, 0] + X[:, 1] > 0).astype(int)
flip = rng.random(600) < 0.05; y[flip] = 1 - y[flip]
Xtr, ytr, Xte, yte = X[:400], y[:400], X[400:], y[400:]
rf = RF(n_estimators=15, seed=0).fit(Xtr, ytr)
acc_rf = np.mean(np.asarray(rf.predict(Xte)) == yte)
acc_dt = np.mean(np.asarray(DT().fit(Xtr, ytr).predict(Xte)) == yte)
assert acc_rf >= 0.85, f"random forest test accuracy {acc_rf:.3f} too low"
assert acc_rf >= acc_dt - 0.02, f"forest ({acc_rf:.3f}) should not be worse than a single deep tree ({acc_dt:.3f})"
oob = float(rf.oob_score(Xtr, ytr))
assert 0.7 <= oob <= 0.98, f"OOB accuracy {oob:.3f} implausible"`),
        ],
      },
      {
        title: "3. AdaBoost with decision stumps",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §3-adaboost.py§ write §class AdaBoost§ for labels in §{-1, +1}§:

* §__init__(self, n_estimators=50)§
* §fit(X, y)§: start with uniform weights. Each round, find the decision stump $h(x) = s\cdot\mathrm{sign}(x_j - t)$ (with $\mathrm{sign}(0) := -1$, polarity $s\in\{-1,+1\}$, thresholds at midpoints between consecutive distinct values of feature $j$, plus one threshold below the minimum) minimizing the **weighted** error $\epsilon_t$; set $\alpha_t = \frac12\log\frac{1-\epsilon_t}{\epsilon_t}$ (clip $\epsilon_t$ to $[10^{-10}, 1-10^{-10}]$); update $w_i \leftarrow w_i e^{-\alpha_ty_ih_t(x_i)}$ and renormalize. Store §self.alphas_§ (list/array) and §self.stumps_§ (list of §(j, t, s)§).
* §decision_function(X)§ $=\sum_t\alpha_th_t(x)$; §predict(X)§ = its sign (0 → +1), as an int array of ±1.`,
        files: ["3-adaboost.py"],
        checks: [
          def("3-adaboost.py", "AdaBoost"),
          noLib("3-adaboost.py"),
          pt(["3-adaboost.py"], "first alpha comes from the best weighted stump", py`import numpy as np
from importlib import import_module
AB = import_module('3-adaboost').AdaBoost
rng = np.random.default_rng(0)
X = rng.uniform(-1, 1, size=(60, 2)); y = np.where(X[:, 0] + 0.6 * X[:, 1] > 0.1, 1, -1)
best = 1.0
for j in range(2):
    v = np.unique(X[:, j]); ts = np.r_[v[0] - 1, (v[:-1] + v[1:]) / 2]
    for t in ts:
        h = np.where(X[:, j] > t, 1, -1)
        e = np.mean(h != y); best = min(best, e, 1 - e)
model = AB(n_estimators=1).fit(X, y)
a0 = float(np.asarray(model.alphas_)[0])
assert abs(a0 - 0.5 * np.log((1 - best) / best)) < 1e-9, f"alpha_1 should be {0.5*np.log((1-best)/best):.6f}, got {a0:.6f}"`),
          pt(["3-adaboost.py"], "boosting stumps fits a diagonal boundary", py`import numpy as np
from importlib import import_module
AB = import_module('3-adaboost').AdaBoost
rng = np.random.default_rng(1)
X = rng.uniform(-1, 1, size=(200, 2)); y = np.where(X[:, 0] + X[:, 1] > 0, 1, -1)
model = AB(n_estimators=150).fit(X[:150], y[:150])
tr = np.mean(np.asarray(model.predict(X[:150])) == y[:150])
te = np.mean(np.asarray(model.predict(X[150:])) == y[150:])
assert tr >= 0.97, f"train accuracy {tr:.3f}: boosting should fit what a single stump cannot"
assert te >= 0.82, f"test accuracy {te:.3f} too low"
assert np.all(np.asarray(model.alphas_) > 0) and len(model.stumps_) == len(model.alphas_)
p = np.asarray(model.predict(X)); assert set(np.unique(p)) <= {-1, 1}`),
        ],
      },
      {
        title: "4. Ensembles on a real dataset",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Executed notebook §4-ensembles.ipynb§ on the Breast Cancer Wisconsin (Diagnostic) dataset (569 samples, 30 features; §sklearn.datasets.load_breast_cancer§ may be used to load it). Use a stratified 75/25 split with seed 0.

1. Compare your decision tree (depth 1, 3, unlimited), random forest (25, 100 trees) and AdaBoost (50, 200 stumps): test accuracy table and training time.
2. Plot random-forest test accuracy and OOB accuracy vs number of trees (1 → 200).
3. Plot AdaBoost training and test error vs number of rounds — does test error keep dropping after training error hits 0? Relate to margins in one paragraph.

Write §results.json§ with keys §tree_test_accuracy§, §rf_test_accuracy§, §adaboost_test_accuracy§ (best configuration of each). Thresholds: §rf_test_accuracy§ ≥ 0.93, §adaboost_test_accuracy§ ≥ 0.93.`,
        files: ["4-ensembles.ipynb", "results.json"],
        checks: [
          nb("4-ensembles.ipynb"),
          lacks("4-ensembles.ipynb", "sklearn\\.(tree|ensemble)", "no scikit-learn trees or ensembles"),
          metric("results.json", "rf_test_accuracy", ">=", 0.93),
          metric("results.json", "adaboost_test_accuracy", ">=", 0.93),
        ],
      },
      {
        title: "5. Derivation: why bagging and boosting work",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File §written/0-ensembles.pdf§ (PDF, Markdown or LaTeX accepted, ≤ 2 pages):

1. Let $X_1..X_B$ be identically distributed with variance $\sigma^2$ and pairwise correlation $\rho$. Derive $\mathrm{Var}(\frac1B\sum_b X_b) = \rho\sigma^2 + \frac{1-\rho}{B}\sigma^2$ and explain the two levers random forests pull.
2. Show the probability that a given sample is not in a bootstrap sample tends to $1/e$, and explain out-of-bag estimation.
3. Show that AdaBoost is forward stagewise additive modeling with the exponential loss $L(y, f) = e^{-yf}$: derive the weights $w_i^{(t)} \propto e^{-y_if_{t-1}(x_i)}$ and the closed form of $\alpha_t$.
4. Using your notebook results, state which ensemble reduced bias and which reduced variance, with evidence.`,
        deliverable: "repo",
        files: ["written/0-ensembles.pdf"],
        rubric: "derivation",
        criteria: [
          "Variance of the correlated average derived by expanding $\\mathrm{Var}(\\sum X_b)$ into variance and covariance terms",
          "Limit $(1-1/m)^m \\to 1/e$ shown and OOB estimation explained",
          "AdaBoost weights derived from the exponential loss of the previous additive model",
          "$\\alpha_t = \\frac12\\log\\frac{1-\\epsilon_t}{\\epsilon_t}$ obtained by minimizing over $\\alpha$",
          "Bias vs variance claims backed by the learner's own train/test numbers",
        ],
      },
      {
        title: "6. Gradient boosting for regression",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`In §100-gradient_boosting.py§ write §class GradientBoostingRegressor§ with squared loss:

* §__init__(self, n_estimators=100, learning_rate=0.1, max_depth=1)§
* §fit(X, y)§: $F_0 = \bar y$; each round fit a **regression** tree of depth §max_depth§ (variance-reduction splits, leaves predict the mean residual — implement it in this file) to the residuals $r = y - F_{t-1}(X)$ and set $F_t = F_{t-1} + \nu\,h_t$. Store §self.train_losses_§ (MSE after each round, length §n_estimators§).
* §predict(X)§ → shape §(m,)§. With §n_estimators=0§ it predicts $\bar y$ everywhere.`,
        files: ["100-gradient_boosting.py"],
        checks: [
          def("100-gradient_boosting.py", "GradientBoostingRegressor"),
          noLib("100-gradient_boosting.py"),
          pt(["100-gradient_boosting.py"], "fits a smooth function and training loss decreases", py`import numpy as np
from importlib import import_module
GB = import_module('100-gradient_boosting').GradientBoostingRegressor
rng = np.random.default_rng(0)
X = rng.uniform(0, 6, size=(200, 1)); y = np.sin(X[:, 0]) + 0.1 * rng.normal(size=200)
g0 = GB(n_estimators=0).fit(X, y)
assert np.allclose(np.asarray(g0.predict(X[:5])), y.mean()), "n_estimators=0 must predict the mean"
g = GB(n_estimators=150, learning_rate=0.1, max_depth=2).fit(X, y)
mse = np.mean((np.asarray(g.predict(X)) - y) ** 2)
assert mse < 0.1 * np.var(y), f"training MSE {mse:.4f} too high"
L = np.asarray(g.train_losses_, dtype=float)
assert len(L) == 150 and np.all(np.diff(L) <= 1e-10), "squared-loss boosting must never increase training MSE"`),
        ],
      },
    ],
  },

  // ==========================================================================
  // A07 — Neural networks & backprop in NumPy
  // ==========================================================================
  {
    id: "A07",
    track: TRACK,
    phase: PHASE,
    title: "Neural Networks & Backprop in NumPy",
    days: 3,
    repo: REPO,
    dir: "0x06-mlp_numpy",
    sources: [
      { course: "CS229", lectures: "Lec 11–13", topics: "Neural networks intro, vectorization, backpropagation, initialization, optimization" },
    ],
    resources: [
      { title: "CS229 main lecture notes — Deep learning chapter (backpropagation)", url: "https://cs229.stanford.edu/main_notes.pdf" },
      { title: "CS231n notes — Backpropagation, Intuitions", url: "https://cs231n.github.io/optimization-2/" },
      { title: "CS231n notes — Putting it together: minimal neural network case study", url: "https://cs231n.github.io/neural-networks-case-study/" },
      { title: "CS231n notes — Neural Networks Part 3 (gradient checks, learning)", url: "https://cs231n.github.io/neural-networks-3/" },
      { title: "Karpathy — Yes you should understand backprop", url: "https://karpathy.medium.com/yes-you-should-understand-backprop-e2f06eab496b" },
      { title: "Kingma & Ba (2014), Adam: A Method for Stochastic Optimization", url: "https://arxiv.org/abs/1412.6980" },
    ],
    concepts: [
      "Computational graphs and the chain rule",
      "Forward / backward pass and caching",
      "ReLU, sigmoid, softmax + cross-entropy",
      "He / Xavier initialization",
      "Mini-batch SGD, momentum, Adam",
      "Numerical gradient checking",
    ],
    objectives: [
      "Derive the backward pass of a 2-layer MLP with softmax cross-entropy in matrix form",
      "Explain why $\\partial L/\\partial z = p - y$ for softmax + cross-entropy",
      "Explain why weights cannot be initialized to zero and why He initialization scales by $\\sqrt{2/\\text{fan\\_in}}$",
      "Verify an analytic gradient with centered finite differences and interpret the relative error",
      "Train an MLP on MNIST to ≥ 97% test accuracy with NumPy only",
      "Describe the Adam update and the purpose of bias correction",
    ],
    requirements: [NUMPY_ONLY, NOTEBOOKS, STYLE, "Convention: samples are rows. §X§ is §(m, n_x)§, one-hot §Y§ is §(m, n_y)§, §W1§ §(n_x, n_h)§, §b1§ §(n_h,)§, §W2§ §(n_h, n_y)§, §b2§ §(n_y,)§; params / grads are dicts with keys §W1, b1, W2, b2§ / §dW1, db1, dW2, db2§"],
    quiz: [
      {
        q: "For logits $z$, $p = \\mathrm{softmax}(z)$ and one-hot $y$, $\\partial(-\\sum_c y_c\\log p_c)/\\partial z$ equals…",
        options: ["$y - p$", "$p - y$", "$p(1-p)$", "$-y/p$"],
        answer: 1,
        why: "The Jacobian of softmax combined with $-y/p$ collapses to $p - y$ — the same form as logistic regression.",
      },
      {
        q: "If every weight of an MLP is initialized to 0, then…",
        options: ["training is just slower", "all hidden units in a layer compute the same function and receive the same gradient forever (symmetry is never broken)", "the network becomes linear", "gradients explode"],
        answer: 1,
        why: "Identical units get identical updates, so the layer effectively has one unit. Random initialization breaks the symmetry.",
      },
      {
        q: "A centered-difference gradient check gives relative error $10^{-2}$ for a ReLU network. Most likely…",
        options: ["the gradient is correct", "there is a bug (or you are evaluating right at a ReLU kink); correct gradients give ~$10^{-7}$ or smaller in float64", "eps is too small", "float64 is not precise enough"],
        answer: 1,
        why: "Relative errors around 1e-7 or below are good; 1e-2 almost always means a bug, rarely a kink crossing.",
      },
      {
        q: "Adam's bias correction $\\hat m_t = m_t/(1-\\beta_1^t)$ is needed because…",
        options: ["it prevents overflow", "$m_0 = 0$ biases early moment estimates toward zero", "it implements weight decay", "it makes Adam equivalent to SGD"],
        answer: 1,
        why: "Moving averages initialized at zero underestimate the moments for small $t$; dividing by $1-\\beta^t$ removes that bias.",
      },
    ],
    tasks: [
      {
        title: "0. Activations and their derivatives",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §0-activations.py§ write:

* §def relu(Z):§ and §def relu_backward(dA, Z):§ — returns §dA * (Z > 0)§ (derivative at 0 taken as 0).
* §def sigmoid(Z):§ (stable, as in 0x01) and §def sigmoid_backward(dA, Z):§ — returns §dA * s * (1 - s)§.
* §def softmax(Z):§ row-wise, stable.

All functions take arrays of any shape (softmax: 2-D) and return the same shape. Create the project §README.md§ (≥ 80 words).`,
        files: ["0-activations.py", "README.md"],
        checks: [
          def("0-activations.py", "relu", "relu_backward", "sigmoid", "sigmoid_backward", "softmax"),
          noLib("0-activations.py"),
          readme(80),
          pt(["0-activations.py"], "activations and backward functions are correct", py`import numpy as np
from importlib import import_module
a = import_module('0-activations')
rng = np.random.default_rng(0)
Z = rng.normal(size=(5, 4)); dA = rng.normal(size=(5, 4))
assert np.allclose(a.relu(Z), np.maximum(0, Z))
assert np.allclose(a.relu_backward(dA, Z), dA * (Z > 0))
assert np.allclose(a.relu_backward(np.ones(3), np.array([-1.0, 0.0, 2.0])), [0, 0, 1]), "relu'(0) must be 0"
s = 1 / (1 + np.exp(-Z))
assert np.allclose(a.sigmoid(Z), s) and np.allclose(a.sigmoid_backward(dA, Z), dA * s * (1 - s))
E = np.exp(Z - Z.max(1, keepdims=True))
assert np.allclose(a.softmax(Z), E / E.sum(1, keepdims=True))`),
          pt(["0-activations.py"], "stable for large inputs and backward matches finite differences", py`import numpy as np
from importlib import import_module
a = import_module('0-activations')
with np.errstate(over='raise', invalid='raise'):
    S = np.asarray(a.softmax(np.array([[1000.0, 0.0], [-1000.0, -999.0]])), dtype=float)
    sg = np.asarray(a.sigmoid(np.array([-1000.0, 1000.0])), dtype=float)
assert np.all(np.isfinite(S)) and np.allclose(S.sum(1), 1) and np.allclose(sg, [0, 1])
Z = np.random.default_rng(1).normal(size=6); eps = 1e-6
num = (np.asarray(a.sigmoid(Z + eps)) - np.asarray(a.sigmoid(Z - eps))) / (2 * eps)
assert np.allclose(a.sigmoid_backward(np.ones(6), Z), num, atol=1e-8)`),
        ],
      },
      {
        title: "1. Parameter initialization",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §1-init.py§ write §def init_params(n_x, n_h, n_y, seed=0):§ returning a dict with §W1§ §(n_x, n_h)§, §b1§ §(n_h,)§, §W2§ §(n_h, n_y)§, §b2§ §(n_y,)§.

He initialization: §W§ entries drawn from $\mathcal N(0, 2/\text{fan\_in})$ using §np.random.default_rng(seed).standard_normal§ (or §.normal§); biases zero. Same seed → identical parameters; different seeds → different parameters.`,
        files: ["1-init.py"],
        checks: [
          def("1-init.py", "init_params"),
          noLib("1-init.py"),
          pt(["1-init.py"], "shapes, zero biases, He scaling and reproducibility", py`import numpy as np
from importlib import import_module
init = import_module('1-init').init_params
p = init(800, 400, 10, seed=0)
assert p['W1'].shape == (800, 400) and p['b1'].shape == (400,) and p['W2'].shape == (400, 10) and p['b2'].shape == (10,)
assert np.all(p['b1'] == 0) and np.all(p['b2'] == 0), "biases must start at zero"
assert abs(p['W1'].std() - np.sqrt(2 / 800)) < 0.03 * np.sqrt(2 / 800), "W1 std must be sqrt(2/fan_in)"
assert abs(p['W2'].std() - np.sqrt(2 / 400)) < 0.1 * np.sqrt(2 / 400), "W2 std must be sqrt(2/fan_in)"
assert abs(p['W1'].mean()) < 0.01 * np.sqrt(2 / 800) * 10
q = init(800, 400, 10, seed=0); r = init(800, 400, 10, seed=1)
assert np.array_equal(p['W1'], q['W1']) and not np.array_equal(p['W1'], r['W1']), "seed must control the draw"`),
        ],
      },
      {
        title: "2. Forward pass and loss",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §2-forward.py§ write:

* §def forward(X, params):§ computes $Z_1 = XW_1 + b_1$, $A_1 = \mathrm{ReLU}(Z_1)$, $Z_2 = A_1W_2 + b_2$, $P = \mathrm{softmax}(Z_2)$. Returns §(P, cache)§ where §cache§ holds whatever your backward pass needs (e.g. a dict with §Z1, A1, Z2§).
* §def cross_entropy(P, Y):§ mean cross-entropy $-\frac1m\sum_{i,c}Y_{ic}\log P_{ic}$ as a §float§ (guard against §log(0)§ with a tiny floor such as §1e-12§).`,
        files: ["2-forward.py"],
        checks: [
          def("2-forward.py", "forward", "cross_entropy"),
          noLib("2-forward.py"),
          pt(["2-forward.py", "0-activations.py"], "forward pass and loss match a reference", py`import numpy as np
from importlib import import_module
f = import_module('2-forward')
rng = np.random.default_rng(0)
X = rng.normal(size=(8, 5)); Y = np.eye(3)[rng.integers(0, 3, 8)]
p = {'W1': rng.normal(size=(5, 6)), 'b1': rng.normal(size=6), 'W2': rng.normal(size=(6, 3)), 'b2': rng.normal(size=3)}
A1 = np.maximum(0, X @ p['W1'] + p['b1']); Z2 = A1 @ p['W2'] + p['b2']
E = np.exp(Z2 - Z2.max(1, keepdims=True)); P = E / E.sum(1, keepdims=True)
Pg, cache = f.forward(X, p)
assert np.allclose(np.asarray(Pg), P, atol=1e-12), "forward output wrong"
assert abs(float(f.cross_entropy(P, Y)) + np.mean(np.sum(Y * np.log(P), 1))) < 1e-10, "cross-entropy wrong"
assert np.isfinite(float(f.cross_entropy(np.array([[1.0, 0.0]]), np.array([[0.0, 1.0]])))), "log(0) not guarded"`),
        ],
      },
      {
        title: "3. Backward pass",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`In §3-backward.py§ write §def backward(X, Y, params, cache):§ returning a dict §{'dW1', 'db1', 'dW2', 'db2'}§ with the gradients of the **mean** cross-entropy from task 2 with respect to each parameter (same shapes as the parameters). Vectorized over the batch — no loops over samples.

Derive it yourself (task 7). Your §cache§ is the one returned by your own §forward§.`,
        files: ["3-backward.py"],
        checks: [
          def("3-backward.py", "backward"),
          noLib("3-backward.py"),
          lacks("3-backward.py", "^\\s*for\\s+\\w+\\s+in\\s+range\\s*\\(\\s*(m|X\\.shape\\[0\\]|len\\(X\\))", "no loop over samples"),
          pt(["3-backward.py", "2-forward.py", "0-activations.py"], "gradients match numerical gradients of the loss", py`import numpy as np
from importlib import import_module
fwd = import_module('2-forward').forward
bwd = import_module('3-backward').backward
rng = np.random.default_rng(0)
m, nx, nh, ny = 7, 4, 5, 3
X = rng.normal(size=(m, nx)); Y = np.eye(ny)[rng.integers(0, ny, m)]
p = {'W1': rng.normal(size=(nx, nh)), 'b1': 0.1 * rng.normal(size=nh), 'W2': rng.normal(size=(nh, ny)), 'b2': 0.1 * rng.normal(size=ny)}
def loss(q):
    Z1 = X @ q['W1'] + q['b1']; A1 = np.maximum(0, Z1); Z2 = A1 @ q['W2'] + q['b2']
    Z2 = Z2 - Z2.max(1, keepdims=True); lp = Z2 - np.log(np.exp(Z2).sum(1, keepdims=True))
    return -np.mean(np.sum(Y * lp, 1))
P, cache = fwd(X, p)
g = bwd(X, Y, p, cache)
eps = 1e-6
for k in ['W1', 'b1', 'W2', 'b2']:
    num = np.zeros_like(p[k])
    it = np.nditer(p[k], flags=['multi_index'])
    for _ in it:
        idx = it.multi_index
        q = {kk: v.copy() for kk, v in p.items()}; q[k][idx] += eps; lp_ = loss(q)
        q[k][idx] -= 2 * eps; lm_ = loss(q)
        num[idx] = (lp_ - lm_) / (2 * eps)
    an = np.asarray(g['d' + k], dtype=float)
    assert an.shape == p[k].shape, f"d{k} has shape {an.shape}, expected {p[k].shape}"
    rel = np.linalg.norm(an - num) / max(1e-12, np.linalg.norm(an) + np.linalg.norm(num))
    assert rel < 1e-6, f"d{k}: relative error {rel:.2e}"`),
          pt(["3-backward.py", "2-forward.py", "0-activations.py"], "output-layer gradient has the (P - Y) / m form", py`import numpy as np
from importlib import import_module
fwd = import_module('2-forward').forward
bwd = import_module('3-backward').backward
rng = np.random.default_rng(1)
X = rng.normal(size=(20, 3)); Y = np.eye(4)[rng.integers(0, 4, 20)]
p = {'W1': rng.normal(size=(3, 6)), 'b1': np.zeros(6), 'W2': rng.normal(size=(6, 4)), 'b2': np.zeros(4)}
P, cache = fwd(X, p)
g = bwd(X, Y, p, cache)
A1 = np.maximum(0, X @ p['W1'])
assert np.allclose(g['db2'], (np.asarray(P) - Y).mean(0), atol=1e-10)
assert np.allclose(g['dW2'], A1.T @ (np.asarray(P) - Y) / 20, atol=1e-10)`),
        ],
      },
      {
        title: "4. Gradient checking utility",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §4-gradient_check.py§ write §def gradient_check(f, params, grads, eps=1e-5):§

* §f(params)§ returns a scalar loss; §params§ is a dict of arrays; §grads§ maps §'d' + name§ to the analytic gradient of each parameter.
* Compute centered differences $\frac{f(\theta+\epsilon e_i) - f(\theta-\epsilon e_i)}{2\epsilon}$ for **every** entry, restoring each entry afterwards (§params§ must be unchanged on return).
* Return the relative error $\frac{\lVert g_{num} - g\rVert_2}{\lVert g_{num}\rVert_2 + \lVert g\rVert_2}$ over all parameters concatenated, as a §float§.`,
        files: ["4-gradient_check.py"],
        checks: [
          def("4-gradient_check.py", "gradient_check"),
          noLib("4-gradient_check.py"),
          pt(["4-gradient_check.py"], "small error for correct gradients, large for wrong ones; params restored", py`import numpy as np
from importlib import import_module
gc = import_module('4-gradient_check').gradient_check
rng = np.random.default_rng(0)
A = rng.normal(size=(3, 3))
params = {'W': rng.normal(size=(3, 2)), 'b': rng.normal(size=2)}
keep = {k: v.copy() for k, v in params.items()}
f = lambda p: float(np.sum((A @ p['W'] + p['b']) ** 2))
good = {'dW': 2 * A.T @ (A @ params['W'] + params['b']), 'db': 2 * (A @ params['W'] + params['b']).sum(0)}
e = float(gc(f, params, good))
assert e < 1e-7, f"correct gradient should give tiny relative error, got {e:.2e}"
assert all(np.array_equal(params[k], keep[k]) for k in params), "params must be restored"
bad = {'dW': good['dW'] * 1.1, 'db': good['db']}
assert float(gc(f, params, bad)) > 1e-2, "a 10% wrong gradient must be detected"`),
        ],
      },
      {
        title: "5. Training loop",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §5-train.py§ write §def train(X, Y, n_h=64, lr=0.5, epochs=100, batch_size=32, seed=0):§

* Initialize with your §init_params(n_x, n_h, n_y, seed)§; each epoch shuffle with §rng = np.random.default_rng(seed)§ (create it once) and run mini-batch SGD using your §forward§ / §backward§ (import them with §__import__§).
* Returns §(params, losses)§ where §losses§ (length §epochs§) is the full-training-set cross-entropy at the end of each epoch.
* Also write §def predict(X, params):§ returning class indices §(m,)§.`,
        files: ["5-train.py"],
        checks: [
          def("5-train.py", "train", "predict"),
          noLib("5-train.py"),
          pt(["5-train.py", "3-backward.py", "2-forward.py", "1-init.py", "0-activations.py"], "learns a non-linear (circles) dataset", py`import numpy as np
from importlib import import_module
mod = import_module('5-train')
rng = np.random.default_rng(0)
t = rng.uniform(0, 2 * np.pi, 400); r = np.r_[rng.uniform(0, 1, 200), rng.uniform(1.5, 2.5, 200)]
X = np.c_[r * np.cos(t), r * np.sin(t)]; y = np.r_[np.zeros(200, int), np.ones(200, int)]
Y = np.eye(2)[y]
params, losses = mod.train(X, Y, n_h=32, lr=0.5, epochs=60, batch_size=32, seed=0)
L = np.asarray(losses, dtype=float)
assert L.shape == (60,), "losses must have one entry per epoch"
assert L[-1] < 0.5 * L[0], "loss should drop substantially"
acc = np.mean(np.asarray(mod.predict(X, params)) == y)
assert acc >= 0.97, f"training accuracy {acc:.3f} too low (a linear model gets ~0.5)"`),
        ],
      },
      {
        title: "6. MNIST with your NumPy MLP",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Executed notebook §6-mnist_mlp.ipynb§: train your 2-layer MLP on full 10-class MNIST (pixels scaled to §[0, 1]§, 55k train / 5k validation / 10k test). Pick $n_h$, learning rate, batch size and epochs using the **validation** set only.

* Plot training loss and validation accuracy per epoch (§mnist_curves.png§).
* Run §gradient_check§ on a 20-sample batch with a tiny network ($n_h = 8$, a few input pixels) and print the relative error.
* Show 16 misclassified test images with predicted/true labels.

Write §results.json§ with §test_accuracy§, §val_accuracy§, §n_h§, §epochs§, §grad_check_rel_error§. Thresholds: §test_accuracy§ ≥ 0.97, §grad_check_rel_error§ ≤ 1e-6.`,
        files: ["6-mnist_mlp.ipynb", "results.json", "mnist_curves.png"],
        checks: [
          nb("6-mnist_mlp.ipynb"),
          lacks("6-mnist_mlp.ipynb", "import torch|from torch|tensorflow|MLPClassifier", "no deep-learning frameworks"),
          metric("results.json", "test_accuracy", ">=", 0.97),
          metric("results.json", "grad_check_rel_error", "<=", 1e-6),
          ex("mnist_curves.png"),
        ],
      },
      {
        title: "7. Backprop by hand",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File §written/0-backprop_by_hand.pdf§ (PDF, Markdown or LaTeX accepted; a clean photo of handwriting converted to PDF is fine):

1. **Scalar example.** Network $\hat y = \sigma(w_2\,\mathrm{ReLU}(w_1x + b_1) + b_2)$ with loss $L = -[y\log\hat y + (1-y)\log(1-\hat y)]$. Take $x=2,\ y=1,\ w_1=0.5,\ b_1=-0.5,\ w_2=-1.5,\ b_2=0.25$. Draw the computational graph, compute every intermediate value in the forward pass, then every partial derivative in the backward pass (4 decimals). Verify your four parameter gradients numerically with your §gradient_check§ and paste the output.
2. **Matrix form.** Derive §dW1, db1, dW2, db2§ for your batched 2-layer softmax MLP, including $\partial L/\partial Z_2 = (P - Y)/m$ (show the softmax Jacobian step) and the shape of every term.
3. In two sentences each: why zero initialization fails, and what happens to gradients of a deep sigmoid network.`,
        deliverable: "repo",
        files: ["written/0-backprop_by_hand.pdf"],
        rubric: "derivation",
        criteria: [
          "Computational graph with all forward values correct for the given numbers",
          "Backward pass: correct numeric $\\partial L/\\partial w_1, b_1, w_2, b_2$, consistent with the gradient-check output",
          "Softmax-cross-entropy simplification to $P - Y$ shown via the Jacobian",
          "Matrix-form gradients with correct transposes, $1/m$ factors, ReLU mask and shapes",
          "Correct explanations of symmetry breaking and vanishing sigmoid gradients",
        ],
      },
      {
        title: "8. Momentum and Adam",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`In §100-optimizers.py§ write §def adam_update(params, grads, state=None, lr=1e-3, beta1=0.9, beta2=0.999, eps=1e-8):§

* §state§ is §None§ on the first call; otherwise the dict you returned last time (holding §t§ and the first/second moment dicts).
* For each parameter $\theta$ with gradient $g$: $t \leftarrow t+1$ (once per call), $m \leftarrow \beta_1m + (1-\beta_1)g$, $v \leftarrow \beta_2v + (1-\beta_2)g^2$, $\hat m = m/(1-\beta_1^t)$, $\hat v = v/(1-\beta_2^t)$, $\theta \leftarrow \theta - \text{lr}\,\hat m/(\sqrt{\hat v}+\epsilon)$.
* Returns §(new_params, state)§; §grads§ uses keys §'d' + name§. Do not modify §params§ in place.

In your README compare SGD, momentum and Adam on MNIST (loss curves).`,
        files: ["100-optimizers.py"],
        checks: [
          def("100-optimizers.py", "adam_update"),
          noLib("100-optimizers.py"),
          pt(["100-optimizers.py"], "three Adam steps match the reference update", py`import numpy as np
from importlib import import_module
adam = import_module('100-optimizers').adam_update
rng = np.random.default_rng(0)
params = {'W': rng.normal(size=(3, 2)), 'b': rng.normal(size=2)}
orig = {k: v.copy() for k, v in params.items()}
ref = {k: v.copy() for k, v in params.items()}
m = {k: np.zeros_like(v) for k, v in ref.items()}; v2 = {k: np.zeros_like(v) for k, v in ref.items()}
state = None; p = params
for t in range(1, 4):
    grads = {'d' + k: rng.normal(size=val.shape) for k, val in ref.items()}
    for k in ref:
        g = grads['d' + k]
        m[k] = 0.9 * m[k] + 0.1 * g; v2[k] = 0.999 * v2[k] + 0.001 * g * g
        ref[k] = ref[k] - 0.01 * (m[k] / (1 - 0.9 ** t)) / (np.sqrt(v2[k] / (1 - 0.999 ** t)) + 1e-8)
    p, state = adam(p, grads, state, lr=0.01)
for k in ref:
    assert np.allclose(p[k], ref[k], atol=1e-12), f"Adam update wrong for {k}"
assert all(np.array_equal(params[k], orig[k]) for k in params), "params modified in place"`),
        ],
      },
    ],
  },

  // ==========================================================================
  // A08 — Unsupervised learning
  // ==========================================================================
  {
    id: "A08",
    track: TRACK,
    phase: PHASE,
    title: "Unsupervised Learning: k-means, EM & PCA",
    days: 3,
    repo: REPO,
    dir: "0x07-unsupervised",
    sources: [
      { course: "CS229", lectures: "Lec 14–15", topics: "k-means, mixture of Gaussians, EM algorithm (Jensen, ELBO), factor analysis, PCA" },
      { course: "CS221", lectures: "Unsupervised learning / k-means lecture", topics: "k-means as alternating minimization (CS221 framing)" },
    ],
    resources: [
      { title: "CS229 main lecture notes — Part IX–XI (k-means, EM, factor analysis, PCA)", url: "https://cs229.stanford.edu/main_notes.pdf" },
      { title: "Shlens (2014), A Tutorial on Principal Component Analysis", url: "https://arxiv.org/abs/1404.1100" },
      { title: "Arthur & Vassilvitskii (2007), k-means++: The Advantages of Careful Seeding", url: "https://theory.stanford.edu/~sergei/papers/kMeansPP-soda.pdf" },
      { title: "Bishop, PRML — Ch. 9 (mixture models and EM), Ch. 12 (PCA) (free PDF)", url: "https://www.microsoft.com/en-us/research/uploads/prod/2006/01/Bishop-Pattern-Recognition-and-Machine-Learning-2006.pdf" },
    ],
    concepts: [
      "k-means as coordinate descent on the distortion",
      "k-means++ seeding",
      "Gaussian mixture models and latent variables",
      "EM: E-step posteriors, M-step, Jensen's inequality / ELBO",
      "PCA: maximum variance = minimum reconstruction error",
      "Eigendecomposition vs SVD; explained variance",
    ],
    objectives: [
      "Explain why k-means monotonically decreases its objective and why it can get stuck",
      "Derive the EM updates for a GMM and prove that EM never decreases the log-likelihood",
      "Explain k-means as the small-variance limit of EM for a GMM with shared isotropic covariance",
      "Derive PCA from the maximum-variance view and connect it to the SVD of the centered data",
      "Choose the number of components from an explained-variance curve",
      "Apply k-means and PCA to MNIST and interpret the 2-D projection",
    ],
    requirements: [NUMPY_ONLY, NOTEBOOKS, STYLE],
    quiz: [
      {
        q: "Each iteration of Lloyd's k-means algorithm…",
        options: ["can increase the distortion", "never increases the distortion $\\sum_i\\lVert x_i - \\mu_{c_i}\\rVert^2$", "finds the global optimum", "requires a learning rate"],
        answer: 1,
        why: "Both steps (assignment, then mean update) minimize the distortion over one block of variables, so it is non-increasing — but only a local optimum is reached.",
      },
      {
        q: "In EM for a GMM, the E-step computes…",
        options: ["new means", "the posterior responsibilities $w_{ij} = p(z_i = j\\mid x_i;\\theta)$", "the gradient of the log-likelihood", "the number of clusters"],
        answer: 1,
        why: "The E-step sets $Q_i(z) = p(z\\mid x_i;\\theta)$, making Jensen's lower bound tight at the current $\\theta$.",
      },
      {
        q: "The first principal component of centered data $X$ is…",
        options: ["the column of $X$ with largest variance", "the top right-singular vector of $X$ (top eigenvector of $X^\\top X$)", "the mean of $X$", "the top left-singular vector of $X$"],
        answer: 1,
        why: "Maximizing $u^\\top\\Sigma u$ subject to $\\lVert u\\rVert=1$ gives the top eigenvector of $\\Sigma \\propto X^\\top X$, i.e. the first right-singular vector.",
      },
      {
        q: "Why does EM need several random restarts in practice?",
        options: ["It is stochastic", "The log-likelihood is non-concave; EM converges to a local optimum (or a degenerate one with a collapsing component)", "It needs a learning-rate search", "It does not converge"],
        answer: 1,
        why: "EM guarantees monotone improvement, not global optimality. Restarts plus covariance regularization are standard.",
      },
    ],
    tasks: [
      {
        title: "0. k-means (Lloyd's algorithm)",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §0-kmeans.py§ write §def kmeans(X, k, max_iters=100, seed=0, init=None):§

* §init§: optional §(k, n)§ initial centroids; if §None§, choose §k§ distinct rows with §np.random.default_rng(seed).choice(m, k, replace=False)§.
* Alternate: assign every point to its nearest centroid (ties → lowest index; distances vectorized, no loop over samples), then move each centroid to the mean of its points (an empty cluster keeps its previous centroid). Stop when assignments no longer change or after §max_iters§ iterations.
* Returns §(centroids, labels, inertia)§: §(k, n)§, integer §(m,)§, and the float $\sum_i\lVert x_i - \mu_{c_i}\rVert^2$ for the returned centroids/labels.

Create the project §README.md§ (≥ 80 words).`,
        files: ["0-kmeans.py", "README.md"],
        checks: [
          def("0-kmeans.py", "kmeans"),
          noLib("0-kmeans.py"),
          readme(80),
          pt(["0-kmeans.py"], "matches Lloyd's algorithm from a given initialization", py`import numpy as np
from importlib import import_module
kmeans = import_module('0-kmeans').kmeans
rng = np.random.default_rng(0)
X = np.r_[rng.normal([0, 0], 1.0, (60, 2)), rng.normal([4, 0], 1.0, (60, 2)), rng.normal([2, 3.5], 1.0, (60, 2))]
init = X[[0, 1, 2]].copy()
C = init.copy()
for _ in range(100):
    lab = np.argmin(((X[:, None] - C[None]) ** 2).sum(-1), 1)
    newC = np.array([X[lab == j].mean(0) if np.any(lab == j) else C[j] for j in range(3)])
    if np.allclose(newC, C):
        break
    C = newC
lab = np.argmin(((X[:, None] - C[None]) ** 2).sum(-1), 1)
c, l, inertia = kmeans(X, 3, init=init.copy())
assert np.allclose(np.asarray(c), C, atol=1e-8), "centroids differ from Lloyd's algorithm"
assert np.array_equal(np.asarray(l), lab), "labels differ"
assert abs(float(inertia) - ((X - C[lab]) ** 2).sum()) < 1e-6, "inertia wrong"`),
          pt(["0-kmeans.py"], "recovers well-separated clusters with random init", py`import numpy as np
from importlib import import_module
kmeans = import_module('0-kmeans').kmeans
rng = np.random.default_rng(1)
centers = np.array([[0, 0], [10, 0], [0, 10], [10, 10]], float)
X = np.vstack([rng.normal(c, 0.5, (50, 2)) for c in centers])
best = min((kmeans(X, 4, seed=s) for s in range(5)), key=lambda r: float(r[2]))
c = np.asarray(best[0])
for ctr in centers:
    assert np.min(np.linalg.norm(c - ctr, axis=1)) < 0.3, "a true cluster center was not found"
assert np.asarray(best[1]).shape == (200,)`),
        ],
      },
      {
        title: "1. k-means++ initialization",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §1-kmeans_plus_plus.py§ write §def kmeans_plus_plus_init(X, k, seed=0):§ returning §(k, n)§ initial centroids chosen with the k-means++ rule: first centroid uniformly at random, each next one sampled with probability proportional to $D(x)^2$, the squared distance to the nearest centroid chosen so far. Use a single §rng = np.random.default_rng(seed)§. Centroids must be rows of §X§.`,
        files: ["1-kmeans_plus_plus.py"],
        checks: [
          def("1-kmeans_plus_plus.py", "kmeans_plus_plus_init"),
          noLib("1-kmeans_plus_plus.py"),
          pt(["1-kmeans_plus_plus.py"], "returns data rows and nearly always seeds one centroid per far-apart blob", py`import numpy as np
from importlib import import_module
pp = import_module('1-kmeans_plus_plus').kmeans_plus_plus_init
rng = np.random.default_rng(0)
centers = np.array([[0, 0], [100, 0], [0, 100]], float)
X = np.vstack([rng.normal(c, 1.0, (100, 2)) for c in centers])
hits = 0
for s in range(40):
    C = np.asarray(pp(X, 3, seed=s), dtype=float)
    assert C.shape == (3, 2)
    assert all(np.any(np.all(np.isclose(X, row), axis=1)) for row in C), "centroids must be rows of X"
    blobs = {int(np.argmin(np.linalg.norm(centers - row, axis=1))) for row in C}
    hits += len(blobs) == 3
assert hits >= 38, f"k-means++ should cover all 3 blobs almost always, got {hits}/40"
assert not np.array_equal(np.asarray(pp(X, 3, seed=0)), np.asarray(pp(X, 3, seed=1)))`),
        ],
      },
      {
        title: "2. Gaussian mixture model with EM",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`In §2-gmm_em.py§ write:

* §def gmm_log_likelihood(X, pi, mu, Sigma):§ average log-likelihood $\frac1m\sum_i\log\sum_j\pi_j\,\mathcal N(x_i;\mu_j,\Sigma_j)$ for §pi§ §(k,)§, §mu§ §(k, n)§, §Sigma§ §(k, n, n)§. Compute in log-space with log-sum-exp; use §np.linalg.slogdet§ and §solve§/Cholesky, not §inv§ of the density.
* §def gmm_em(X, k, max_iters=200, tol=1e-6, seed=0, init_means=None):§ full-covariance EM. Init: means = §init_means§ or §k§ distinct random rows (§default_rng(seed)§), every covariance = the data covariance, uniform §pi§. Add §1e-6 * I§ to every covariance in the M-step. Record the average log-likelihood after each M-step; stop when the improvement is below §tol§.
  Returns §(pi, mu, Sigma, log_likelihoods)§.`,
        files: ["2-gmm_em.py"],
        checks: [
          def("2-gmm_em.py", "gmm_log_likelihood", "gmm_em"),
          noLib("2-gmm_em.py"),
          pt(["2-gmm_em.py"], "log-likelihood matches explicit Gaussian densities", py`import numpy as np
from importlib import import_module
mod = import_module('2-gmm_em')
rng = np.random.default_rng(0)
X = rng.normal(size=(30, 2)) * 3
pi = np.array([0.2, 0.5, 0.3]); mu = rng.normal(size=(3, 2))
Sig = np.array([np.eye(2) * s for s in (0.5, 1.0, 2.0)]); Sig[1, 0, 1] = Sig[1, 1, 0] = 0.4
dens = np.zeros((30, 3))
for j in range(3):
    d = X - mu[j]; Si = np.linalg.inv(Sig[j])
    dens[:, j] = pi[j] * np.exp(-0.5 * np.sum(d @ Si * d, 1)) / (2 * np.pi * np.sqrt(np.linalg.det(Sig[j])))
ref = np.mean(np.log(dens.sum(1)))
assert abs(float(mod.gmm_log_likelihood(X, pi, mu, Sig)) - ref) < 1e-9, "average log-likelihood wrong"
far = X + 200.0
assert np.isfinite(float(mod.gmm_log_likelihood(far, pi, mu, Sig))), "must be computed in log-space"`),
          pt(["2-gmm_em.py"], "EM is monotone and recovers the mixture", py`import numpy as np
from importlib import import_module
mod = import_module('2-gmm_em')
rng = np.random.default_rng(1)
true_mu = np.array([[0.0, 0.0], [6.0, 0.0], [0.0, 6.0]])
X = np.r_[rng.normal(true_mu[0], 1.0, (200, 2)), rng.normal(true_mu[1], 0.7, (100, 2)), rng.normal(true_mu[2], 1.2, (100, 2))]
pi, mu, Sig, ll = mod.gmm_em(X, 3, init_means=np.array([[1.0, 1.0], [5.0, 1.0], [1.0, 5.0]]))
ll = np.asarray(ll, dtype=float); pi = np.asarray(pi); mu = np.asarray(mu); Sig = np.asarray(Sig)
assert np.all(np.diff(ll) >= -1e-9), "EM must never decrease the log-likelihood"
assert abs(pi.sum() - 1) < 1e-9 and Sig.shape == (3, 2, 2)
order = [int(np.argmin(np.linalg.norm(mu - t, axis=1))) for t in true_mu]
assert sorted(order) == [0, 1, 2] and np.allclose(mu[order], true_mu, atol=0.3), "means not recovered"
assert np.allclose(pi[order], [0.5, 0.25, 0.25], atol=0.05), "mixing weights not recovered"
assert abs(ll[-1] - float(mod.gmm_log_likelihood(X, pi, mu, Sig))) < 1e-3`),
        ],
      },
      {
        title: "3. Principal Component Analysis",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §3-pca.py§ write:

* §def pca(X, k):§ returns §(components, explained_variance, mean)§: §components§ §(k, n)§ with orthonormal rows sorted by decreasing variance, §explained_variance§ §(k,)§ = the top-§k§ eigenvalues of the **sample** covariance (§ddof=1§), §mean§ §(n,)§. Use the SVD of the centered data (§np.linalg.svd(..., full_matrices=False)§).
* §def pca_transform(X, components, mean):§ → §(m, k)§ scores.
* §def pca_inverse_transform(Z, components, mean):§ → §(m, n)§ reconstruction.`,
        files: ["3-pca.py"],
        checks: [
          def("3-pca.py", "pca", "pca_transform", "pca_inverse_transform"),
          noLib("3-pca.py"),
          pt(["3-pca.py"], "components and variances match the covariance eigendecomposition", py`import numpy as np
from importlib import import_module
mod = import_module('3-pca')
rng = np.random.default_rng(0)
A = rng.normal(size=(5, 5))
X = rng.normal(size=(300, 5)) @ A + np.array([1, -2, 3, 0, 5])
comp, var, mean = mod.pca(X, 3)
comp, var = np.asarray(comp), np.asarray(var)
w, V = np.linalg.eigh(np.cov(X, rowvar=False))
w, V = w[::-1], V[:, ::-1]
assert comp.shape == (3, 5) and var.shape == (3,)
assert np.allclose(var, w[:3], rtol=1e-8), "explained variance must be covariance eigenvalues (ddof=1)"
assert np.allclose(np.abs(np.sum(comp * V[:, :3].T, 1)), 1, atol=1e-8), "components must match eigenvectors up to sign"
assert np.allclose(comp @ comp.T, np.eye(3), atol=1e-10) and np.allclose(mean, X.mean(0))`),
          pt(["3-pca.py"], "transform / inverse transform round-trip", py`import numpy as np
from importlib import import_module
mod = import_module('3-pca')
rng = np.random.default_rng(1)
X = rng.normal(size=(100, 4)) @ rng.normal(size=(4, 4)) + 2.0
comp, var, mean = mod.pca(X, 4)
Z = np.asarray(mod.pca_transform(X, comp, mean))
assert Z.shape == (100, 4) and np.allclose(np.asarray(mod.pca_inverse_transform(Z, comp, mean)), X, atol=1e-10), "k = n must reconstruct exactly"
assert np.allclose(Z.var(0, ddof=1), var), "score variances must equal the explained variances"
comp2, var2, mean2 = mod.pca(X, 2)
R = np.asarray(mod.pca_inverse_transform(mod.pca_transform(X, comp2, mean2), comp2, mean2))
err = np.sum((X - R) ** 2) / (100 - 1)
assert abs(err - (var.sum() - var[:2].sum())) < 1e-8, "reconstruction error must equal the discarded variance"`),
        ],
      },
      {
        title: "4. k-means and PCA on MNIST",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Executed notebook §4-mnist_unsupervised.ipynb§ (use the 10 000 MNIST test images, pixels in §[0, 1]§), with **your** functions only:

1. PCA: plot the cumulative explained-variance curve; scatter the first 2 principal components coloured by digit (§pca_2d.png§); show the first 16 components as 28×28 images and reconstructions with $k = 10, 50, 150$.
2. k-means with k-means++ init, $k = 10$, on the 50-dim PCA scores (best of 5 seeds by inertia). Show the 10 centroids projected back to pixel space as images. Compute **cluster purity** (each cluster labelled by its majority digit).
3. GMM (diagonal or full covariance) on the 2-D or 10-D PCA scores: comment on what EM finds compared with k-means.

Write §results.json§ with §pca50_explained_variance_ratio§ (fraction of total variance kept by 50 components), §kmeans_purity§, §kmeans_inertia§. Thresholds: §pca50_explained_variance_ratio§ ≥ 0.8, §kmeans_purity§ ≥ 0.5.`,
        files: ["4-mnist_unsupervised.ipynb", "results.json", "pca_2d.png"],
        checks: [
          nb("4-mnist_unsupervised.ipynb"),
          lacks("4-mnist_unsupervised.ipynb", "sklearn\\.(cluster|decomposition|mixture)", "no scikit-learn clustering / PCA"),
          metric("results.json", "pca50_explained_variance_ratio", ">=", 0.8),
          metric("results.json", "kmeans_purity", ">=", 0.5),
          ex("pca_2d.png"),
        ],
      },
      {
        title: "5. Derivation: EM and PCA",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File §written/0-em_pca.pdf§ (PDF, Markdown or LaTeX accepted, ≤ 3 pages):

1. Using Jensen's inequality, derive the evidence lower bound $\ell(\theta) \ge \sum_i\sum_{z}Q_i(z)\log\frac{p(x_i,z;\theta)}{Q_i(z)}$, show the bound is tight for $Q_i(z) = p(z\mid x_i;\theta)$, and prove EM's monotonicity $\ell(\theta^{(t+1)}) \ge \ell(\theta^{(t)})$.
2. Derive the GMM M-step updates for $\pi_j, \mu_j, \Sigma_j$ (use a Lagrange multiplier for $\sum_j\pi_j=1$).
3. Show that k-means is the limit of EM for a GMM with $\Sigma_j = \sigma^2I$, equal $\pi_j$, as $\sigma\to0$.
4. Show that the unit vector maximizing the projected variance is the top eigenvector of the covariance, and that the same subspace minimizes squared reconstruction error.`,
        deliverable: "repo",
        files: ["written/0-em_pca.pdf"],
        rubric: "derivation",
        criteria: [
          "Jensen applied to the concave log with $Q_i$ a distribution; equality condition derived",
          "Monotonicity chain $\\ell(\\theta^{t+1}) \\ge \\text{ELBO}(Q^t,\\theta^{t+1}) \\ge \\text{ELBO}(Q^t,\\theta^t) = \\ell(\\theta^t)$ written explicitly",
          "Correct M-step formulas with the Lagrange multiplier for $\\pi$",
          "Hard-assignment limit as $\\sigma \\to 0$ argued from the responsibilities",
          "PCA via Lagrangian $u^\\top\\Sigma u - \\lambda(u^\\top u - 1)$ and the variance/reconstruction equivalence",
        ],
      },
      {
        title: "6. Image compression with k-means",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`Executed notebook §100-color_quantization.ipynb§ (CS229 PS3 classic): load any colour photo (commit it, ≤ 1 MB, as §images/original.png§ or §.jpg§), treat each pixel as a point in $\mathbb R^3$ and quantize it to $k \in \{2, 4, 8, 16, 32\}$ colours with your k-means (sub-sample pixels for fitting). Show the reconstructions side by side (§quantized.png§) and compute the compression factor for each $k$ (bits per pixel vs 24).`,
        files: ["100-color_quantization.ipynb", "quantized.png"],
        checks: [
          nb("100-color_quantization.ipynb"),
          has("100-color_quantization.ipynb", "kmeans", "uses your k-means"),
          ex("quantized.png"),
        ],
      },
    ],
  },

  // ==========================================================================
  // A09 — Search, MDPs & value iteration
  // ==========================================================================
  {
    id: "A09",
    track: TRACK,
    phase: PHASE,
    title: "Search, MDPs & Value Iteration",
    days: 3,
    repo: REPO,
    dir: "0x08-mdp_value_iteration",
    sources: [
      { course: "CS221", lectures: "Search I–II, MDPs I–II", topics: "Tree search, uniform cost search, A* and admissible heuristics; MDPs, policy evaluation, value iteration" },
      { course: "CS229", lectures: "Lec 16–18", topics: "ICA (Lec 16, optional), reinforcement learning intro, MDPs, value & policy iteration, continuous-state MDPs" },
    ],
    resources: [
      { title: "CS229 main lecture notes — Reinforcement learning and control (MDPs, value/policy iteration); ICA chapter", url: "https://cs229.stanford.edu/main_notes.pdf" },
      { title: "Sutton & Barto, Reinforcement Learning: An Introduction (2nd ed.) — Ch. 3–4", url: "http://incompleteideas.net/book/the-book-2nd.html" },
      { title: "Red Blob Games — Introduction to the A* algorithm", url: "https://www.redblobgames.com/pathfinding/a-star/introduction.html" },
      { title: "CS221 course site (search & MDP lecture slides)", url: "https://stanford-cs221.github.io/autumn2023/" },
    ],
    concepts: [
      "State-space search, frontier and explored set",
      "Uniform cost search (Dijkstra) and A* with admissible/consistent heuristics",
      "Markov decision processes $(S, A, P, R, \\gamma)$",
      "Bellman expectation and optimality equations",
      "Value iteration, policy evaluation, policy iteration",
      "Contraction mapping and convergence of value iteration",
      "Independent Component Analysis (optional)",
    ],
    objectives: [
      "Implement UCS and A* and explain why A* with a consistent heuristic is optimal and never expands more nodes than UCS",
      "Formalize a gridworld as an MDP with stochastic transitions",
      "Write the Bellman optimality equation and implement value iteration and policy extraction",
      "Prove that the Bellman optimality operator is a $\\gamma$-contraction in the sup norm",
      "Implement policy iteration with exact policy evaluation and compare it with value iteration",
      "Explain how step reward, noise and discount change the optimal gridworld policy",
    ],
    requirements: [NUMPY_ONLY, NOTEBOOKS, STYLE, "MDP convention: §P§ has shape §(S, A, S)§ with §P[s, a, s']§ the transition probability, §R§ has shape §(S, A)§ (expected reward for taking §a§ in §s§); a terminal state has all-zero rows in §P§"],
    quiz: [
      {
        q: "A* is guaranteed to return an optimal path (graph search, no re-expansions) when the heuristic is…",
        options: ["any non-negative function", "consistent: $h(s) \\le c(s,s') + h(s')$ and $h(\\text{goal}) = 0$", "larger than the true cost", "zero only at the start"],
        answer: 1,
        why: "Consistency makes the reduced costs $c'(s,s') = c(s,s') + h(s') - h(s)$ non-negative, so A* is UCS on a modified graph.",
      },
      {
        q: "Value iteration's update is $V_{k+1}(s) = $",
        options: ["$\\sum_a \\pi(a\\mid s)[R(s,a) + \\gamma\\sum_{s'}P(s'\\mid s,a)V_k(s')]$", "$\\max_a [R(s,a) + \\gamma\\sum_{s'}P(s'\\mid s,a)V_k(s')]$", "$R(s) + V_k(s)$", "$\\max_{s'} V_k(s')$"],
        answer: 1,
        why: "It applies the Bellman optimality operator; the first option is policy evaluation for a fixed policy.",
      },
      {
        q: "Why does value iteration converge for $\\gamma < 1$?",
        options: ["Because rewards are bounded by 1", "The Bellman optimality operator is a $\\gamma$-contraction in $\\lVert\\cdot\\rVert_\\infty$, so Banach's fixed-point theorem applies", "Because the state space is finite only", "It does not always converge"],
        answer: 1,
        why: "$\\lVert TV - TU\\rVert_\\infty \\le \\gamma\\lVert V-U\\rVert_\\infty$, so iterates converge geometrically to the unique fixed point $V^*$.",
      },
      {
        q: "In the 4×3 gridworld, making the step reward very negative (e.g. −2) causes the optimal policy to…",
        options: ["avoid the −1 exit at all costs", "head for the nearest exit, even the −1 one, to stop paying the step cost", "stay still", "be unchanged"],
        answer: 1,
        why: "When living is worse than the −1 terminal, ending the episode quickly is optimal.",
      },
    ],
    tasks: [
      {
        title: "0. Uniform cost search",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §0-ucs.py§ write §def uniform_cost_search(graph, start, goal):§

* §graph§ is a dict mapping each node (any hashable) to a list of §(neighbor, cost)§ pairs with §cost > 0§. Nodes may appear only as neighbours (no outgoing edges).
* Use a priority queue (§heapq§) keyed by path cost; break ties safely (nodes may not be comparable — push a counter).
* Returns §(cost, path)§ where §path§ is the list of nodes from §start§ to §goal§ inclusive, or §(float('inf'), None)§ if unreachable. §start == goal§ returns §(0, [start])§.

Create the project §README.md§ (≥ 80 words).`,
        files: ["0-ucs.py", "README.md"],
        checks: [
          def("0-ucs.py", "uniform_cost_search"),
          has("0-ucs.py", "heapq", "uses a priority queue"),
          readme(80),
          pt(["0-ucs.py"], "optimal cost and valid path on random graphs", py`import numpy as np, heapq, math
from importlib import import_module
ucs = import_module('0-ucs').uniform_cost_search
rng = np.random.default_rng(0)
n = 30
graph = {i: [] for i in range(n)}
W = {}
for _ in range(90):
    a, b = (int(v) for v in rng.integers(0, n, 2))
    if a != b and (a, b) not in W:
        W[(a, b)] = float(rng.uniform(0.5, 5.0)); graph[a].append((b, W[(a, b)]))
def dijkstra(s):
    d = {s: 0.0}; pq = [(0.0, s)]
    while pq:
        c, u = heapq.heappop(pq)
        if c > d[u]: continue
        for v, w in graph[u]:
            if c + w < d.get(v, math.inf):
                d[v] = c + w; heapq.heappush(pq, (d[v], v))
    return d
for s in range(5):
    d = dijkstra(s)
    for g in range(n):
        cost, path = ucs(graph, s, g)
        if g not in d:
            assert cost == float('inf') and path is None, "unreachable goal must return (inf, None)"
            continue
        assert abs(cost - d[g]) < 1e-9, f"cost {cost} != optimal {d[g]}"
        assert path[0] == s and path[-1] == g
        assert abs(sum(W[(path[i], path[i + 1])] for i in range(len(path) - 1)) - cost) < 1e-9, "path cost mismatch"
assert ucs(graph, 3, 3) == (0, [3]) or (ucs(graph, 3, 3)[0] == 0 and list(ucs(graph, 3, 3)[1]) == [3])`),
          pt(["0-ucs.py"], "works with non-comparable node labels", py`from importlib import import_module
ucs = import_module('0-ucs').uniform_cost_search
A, B, C, D = ('a', 1), ('b', 2), frozenset({3}), ('d', 4)
graph = {A: [(B, 1.0), (C, 1.0)], B: [(D, 2.0)], C: [(D, 2.0)]}
cost, path = ucs(graph, A, D)
assert cost == 3.0 and path[0] == A and path[-1] == D and len(path) == 3`),
        ],
      },
      {
        title: "1. A* search",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §1-astar.py§ write §def astar(graph, start, goal, heuristic):§ with the same graph format as task 0 and §heuristic(node) -> float§ (assumed consistent).

Returns §(cost, path, expanded)§ where §expanded§ is the number of nodes **popped and expanded** (each node expanded at most once; the goal counts when popped). Same unreachable convention as UCS (§(inf, None, expanded)§).

§§§python
# 4-connected grid, unit costs, Manhattan heuristic
cost, path, expanded = astar(grid_graph, (0, 0), (9, 9), lambda s: abs(s[0] - 9) + abs(s[1] - 9))
§§§`,
        files: ["1-astar.py"],
        checks: [
          def("1-astar.py", "astar"),
          has("1-astar.py", "heapq", "uses a priority queue"),
          pt(["1-astar.py"], "optimal on a maze; Manhattan expands no more nodes than h = 0", py`import numpy as np
from collections import deque
from importlib import import_module
astar = import_module('1-astar').astar
rng = np.random.default_rng(0)
N = 15
walls = rng.random((N, N)) < 0.25; walls[0, 0] = walls[N - 1, N - 1] = False
graph = {}
for r in range(N):
    for c in range(N):
        if walls[r, c]: continue
        graph[(r, c)] = [((r + dr, c + dc), 1.0) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1))
                         if 0 <= r + dr < N and 0 <= c + dc < N and not walls[r + dr, c + dc]]
def bfs(s, g):
    d = {s: 0}; q = deque([s])
    while q:
        u = q.popleft()
        for v, _ in graph[u]:
            if v not in d: d[v] = d[u] + 1; q.append(v)
    return d.get(g)
goal = (N - 1, N - 1)
true = bfs((0, 0), goal)
man = lambda s: abs(s[0] - goal[0]) + abs(s[1] - goal[1])
c1, p1, e1 = astar(graph, (0, 0), goal, man)
c0, p0, e0 = astar(graph, (0, 0), goal, lambda s: 0.0)
if true is None:
    assert c1 == float('inf') and p1 is None
else:
    assert c1 == true and c0 == true, f"costs {c1}, {c0} != BFS distance {true}"
    assert len(p1) == true + 1 and all(abs(a[0] - b[0]) + abs(a[1] - b[1]) == 1 for a, b in zip(p1, p1[1:]))
    assert e1 <= e0, f"Manhattan A* expanded {e1} > UCS {e0}"
    assert e1 < e0, "Manhattan heuristic should strictly reduce expansions on this maze"`),
          pt(["1-astar.py"], "zero heuristic equals UCS cost on a weighted graph", py`from importlib import import_module
astar = import_module('1-astar').astar
g = {'S': [('A', 1.0), ('B', 4.0)], 'A': [('B', 2.0), ('C', 5.0)], 'B': [('C', 1.0)], 'C': [('G', 3.0)], 'D': [('G', 1.0)]}
cost, path, exp_ = astar(g, 'S', 'G', lambda s: 0.0)
assert cost == 7.0 and path == ['S', 'A', 'B', 'C', 'G'], f"got {cost}, {path}"
h = {'S': 6.0, 'A': 5.0, 'B': 4.0, 'C': 3.0, 'G': 0.0, 'D': 1.0}
cost2, path2, exp2 = astar(g, 'S', 'G', lambda s: h[s])
assert cost2 == 7.0 and exp2 <= exp_
c3, p3, _ = astar(g, 'S', 'D', lambda s: 0.0)
assert c3 == float('inf') and p3 is None`),
        ],
      },
      {
        title: "2. Gridworld as an MDP",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §2-gridworld.py§ write §def gridworld_mdp(rows, cols, walls, terminals, step_reward=-0.04, noise=0.2):§ returning §(P, R)§ with §S = rows * cols§ states, §s = r * cols + c§ (row 0 is the **top** row), and 4 actions §0 = up (r-1), 1 = right (c+1), 2 = down (r+1), 3 = left (c-1)§.

* §walls§: list of §(r, c)§ cells; §terminals§: dict §{(r, c): reward}§.
* Non-terminal, non-wall state: the intended move happens with probability §1 - noise§, each of the two perpendicular moves with §noise / 2§. A move into a wall or off the grid leaves the agent in place (probabilities add up). §R[s, a] = step_reward§.
* Terminal state: §P[s, a, :] = 0§ and §R[s, a] = terminals[(r, c)]§ for every action (collect the exit reward, episode ends).
* Wall cell: §P[s, a, :] = 0§, §R[s, a] = 0§.

The classic Russell & Norvig 4×3 world is §gridworld_mdp(3, 4, [(1, 1)], {(0, 3): 1.0, (1, 3): -1.0})§.`,
        files: ["2-gridworld.py"],
        checks: [
          def("2-gridworld.py", "gridworld_mdp"),
          noLib("2-gridworld.py"),
          pt(["2-gridworld.py"], "transition and reward tensors of the 4x3 world", py`import numpy as np
from importlib import import_module
gw = import_module('2-gridworld').gridworld_mdp
P, R = gw(3, 4, [(1, 1)], {(0, 3): 1.0, (1, 3): -1.0}, step_reward=-0.04, noise=0.2)
P, R = np.asarray(P, dtype=float), np.asarray(R, dtype=float)
assert P.shape == (12, 4, 12) and R.shape == (12, 4)
s = lambda r, c: r * 4 + c
for st in range(12):
    if st in (s(1, 1), s(0, 3), s(1, 3)):
        assert np.all(P[st] == 0), "walls and terminals have no outgoing transitions"
    else:
        assert np.allclose(P[st].sum(1), 1), f"rows of state {st} must sum to 1"
assert np.allclose(R[s(0, 3)], 1.0) and np.allclose(R[s(1, 3)], -1.0) and np.allclose(R[s(1, 1)], 0)
assert np.allclose(R[s(2, 0)], -0.04)
# bottom-left corner (2,0), action up: 0.8 to (1,0), 0.1 right to (2,1), 0.1 left -> bump, stay
e = np.zeros(12); e[s(1, 0)] = 0.8; e[s(2, 1)] = 0.1; e[s(2, 0)] = 0.1
assert np.allclose(P[s(2, 0), 0], e), "wrong transitions for (2,0) going up"
# (1,0) right: wall at (1,1) -> stay 0.8; up 0.1 to (0,0); down 0.1 to (2,0)
e = np.zeros(12); e[s(1, 0)] = 0.8; e[s(0, 0)] = 0.1; e[s(2, 0)] = 0.1
assert np.allclose(P[s(1, 0), 1], e), "wrong transitions for (1,0) going right into the wall"
# (0,2) right -> terminal (0,3) with 0.8
assert abs(P[s(0, 2), 1, s(0, 3)] - 0.8) < 1e-12`),
          pt(["2-gridworld.py"], "deterministic world when noise = 0", py`import numpy as np
from importlib import import_module
gw = import_module('2-gridworld').gridworld_mdp
P, R = gw(2, 3, [], {(0, 2): 5.0}, step_reward=-1.0, noise=0.0)
P = np.asarray(P, dtype=float)
assert P[3, 0, 0] == 1.0 and P[3, 1, 4] == 1.0 and P[3, 2, 3] == 1.0 and P[3, 3, 3] == 1.0
assert np.allclose(np.asarray(R)[2], 5.0) and np.all(P[2] == 0)`),
        ],
      },
      {
        title: "3. Value iteration and policy extraction",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §3-value_iteration.py§ write:

* §def value_iteration(P, R, gamma=0.99, tol=1e-8, max_iters=10000):§ synchronous updates $V_{k+1}(s) = \max_a\big[R(s,a) + \gamma\sum_{s'}P(s,a,s')V_k(s')\big]$ starting from $V_0 = 0$, vectorized with §np.einsum§ or §@§ (no loops over states). Stop when $\lVert V_{k+1} - V_k\rVert_\infty < \text{tol}$. Returns §(V, n_iters)§.
* §def extract_policy(P, R, V, gamma=0.99):§ greedy policy $\pi(s) = \arg\max_a Q(s,a)$ (ties → lowest action index), integer array §(S,)§.

Note: with $\gamma = 1$ the 4×3 gridworld still converges because every policy eventually reaches a terminal state with probability 1 (proper policies).`,
        files: ["3-value_iteration.py"],
        checks: [
          def("3-value_iteration.py", "value_iteration", "extract_policy"),
          noLib("3-value_iteration.py"),
          pt(["3-value_iteration.py"], "satisfies the Bellman optimality equation on random MDPs", py`import numpy as np
from importlib import import_module
mod = import_module('3-value_iteration')
rng = np.random.default_rng(0)
S, A, g = 20, 4, 0.9
P = rng.random((S, A, S)) ** 4; P /= P.sum(2, keepdims=True); R = rng.normal(size=(S, A))
V, n = mod.value_iteration(P, R, gamma=g, tol=1e-10)
V = np.asarray(V, dtype=float)
Q = R + g * P @ V
assert np.max(np.abs(V - Q.max(1))) < 1e-8, "V is not a fixed point of the Bellman optimality operator"
pi = np.asarray(mod.extract_policy(P, R, V, gamma=g))
assert pi.shape == (S,) and np.array_equal(pi, Q.argmax(1)), "policy must be greedy w.r.t. V"
Ppi = P[np.arange(S), pi]; Vpi = np.linalg.solve(np.eye(S) - g * Ppi, R[np.arange(S), pi])
assert np.allclose(Vpi, V, atol=1e-7), "the greedy policy's value must equal V*"
assert 50 < int(n) < 10000`),
          pt(["3-value_iteration.py", "2-gridworld.py"], "Russell & Norvig 4x3 gridworld values and policy", py`import numpy as np
from importlib import import_module
gw = import_module('2-gridworld').gridworld_mdp
mod = import_module('3-value_iteration')
P, R = gw(3, 4, [(1, 1)], {(0, 3): 1.0, (1, 3): -1.0}, step_reward=-0.04, noise=0.2)
V, n = mod.value_iteration(np.asarray(P, float), np.asarray(R, float), gamma=1.0, tol=1e-10)
V = np.asarray(V, dtype=float)
assert abs(V[3] - 1.0) < 1e-9 and abs(V[7] + 1.0) < 1e-9, "terminal values must equal their exit rewards"
assert abs(V[8] - 0.7053) < 1e-3, f"V(start) should be about 0.705, got {V[8]:.4f}"
assert abs(V[2] - 0.9178) < 1e-3, f"V(0,2) should be about 0.918, got {V[2]:.4f}"
pi = np.asarray(mod.extract_policy(np.asarray(P, float), np.asarray(R, float), V, gamma=1.0))
assert pi[8] == 0 and pi[2] == 1 and pi[6] == 0, "classic optimal policy: up from start, right next to +1, up at (1,2)"
assert pi[11] == 3, "at (2,3) the optimal action is left (away from the -1 exit)"`),
        ],
      },
      {
        title: "4. Policy iteration",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`In §4-policy_iteration.py§ write:

* §def policy_evaluation(P, R, policy, gamma=0.99):§ **exact** evaluation by solving $(I - \gamma P_\pi)V = R_\pi$ with §np.linalg.solve§. Returns §V§ §(S,)§.
* §def policy_iteration(P, R, gamma=0.99, max_iters=1000):§ start from the all-zeros policy; alternate exact evaluation and greedy improvement (ties → keep the current action if it is among the maximizers, else lowest index) until the policy is stable. Returns §(V, policy, n_iters)§.`,
        files: ["4-policy_iteration.py"],
        checks: [
          def("4-policy_iteration.py", "policy_evaluation", "policy_iteration"),
          noLib("4-policy_iteration.py"),
          pt(["4-policy_iteration.py"], "exact evaluation and convergence to V*", py`import numpy as np
from importlib import import_module
mod = import_module('4-policy_iteration')
rng = np.random.default_rng(1)
S, A, g = 25, 3, 0.95
P = rng.random((S, A, S)) ** 3; P /= P.sum(2, keepdims=True); R = rng.normal(size=(S, A))
pi0 = rng.integers(0, A, S)
V = np.asarray(mod.policy_evaluation(P, R, pi0, gamma=g), dtype=float)
Ppi, Rpi = P[np.arange(S), pi0], R[np.arange(S), pi0]
assert np.allclose(V, Rpi + g * Ppi @ V, atol=1e-10), "V must satisfy the Bellman expectation equation"
V, pi, n = mod.policy_iteration(P, R, gamma=g)
V = np.asarray(V, dtype=float)
W = np.zeros(S)
for _ in range(3000):
    W = (R + g * P @ W).max(1)
assert np.allclose(V, W, atol=1e-6), "policy iteration must reach V*"
assert int(n) < 50, "policy iteration should converge in few iterations"`),
        ],
      },
      {
        title: "5. Gridworld experiments",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Executed notebook §5-gridworld.ipynb§ using your code:

1. Solve the 4×3 world ($\gamma = 1$, noise 0.2, step −0.04). Print the value grid (2 decimals) and draw the policy with arrows (§policy.png§).
2. Plot $\lVert V_{k+1} - V_k\rVert_\infty$ vs $k$ (log scale) for $\gamma \in \{0.5, 0.9, 0.99\}$ and check the slope against the contraction factor.
3. Sweep step reward over $\{-2, -0.4, -0.04, -0.01, 0, +0.1\}$ and noise over $\{0, 0.2, 0.4\}$; show how the policy changes and explain each regime in one sentence.
4. Compare value iteration vs policy iteration: iterations and wall-clock on a 20×20 random-walls gridworld.

Write §results.json§ with §value_start§ (= $V^*$ of the bottom-left cell for item 1), §vi_iterations§, §pi_iterations§. Checks: $0.70 \le$ §value_start§ $\le 0.71$.`,
        files: ["5-gridworld.ipynb", "policy.png", "results.json"],
        checks: [
          nb("5-gridworld.ipynb"),
          ex("policy.png"),
          metric("results.json", "value_start", ">=", 0.70),
          metric("results.json", "value_start", "<=", 0.71),
        ],
      },
      {
        title: "6. Proofs: contraction and A* optimality",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`File §written/0-contraction_astar.pdf§ (PDF, Markdown or LaTeX accepted):

1. Define the Bellman optimality operator $T$ and prove $\lVert TV - TU\rVert_\infty \le \gamma\lVert V - U\rVert_\infty$ (use $|\max_a f(a) - \max_a g(a)| \le \max_a|f(a) - g(a)|$).
2. Conclude that value iteration converges to a unique $V^*$ and that $\lVert V_k - V^*\rVert_\infty \le \gamma^k\lVert V_0 - V^*\rVert_\infty$; give the number of iterations needed for accuracy $\epsilon$ when $|R| \le R_{max}$ and $V_0 = 0$.
3. Prove that A* graph search with a consistent heuristic returns an optimal path (reduce it to UCS on reduced costs).
4. Relate one result to your notebook (e.g. the measured slope in task 5 item 2).`,
        deliverable: "repo",
        files: ["written/0-contraction_astar.pdf"],
        rubric: "proof",
        criteria: [
          "Contraction proven via the max-difference inequality and $\\sum_{s'}P(s'\\mid s,a) = 1$",
          "Banach fixed-point argument for existence/uniqueness and geometric convergence",
          "Iteration bound $k \\ge \\log\\big(\\frac{R_{max}}{\\epsilon(1-\\gamma)}\\big)/\\log(1/\\gamma)$ (or equivalent) derived",
          "A* optimality via non-negative reduced costs $c(s,s') + h(s') - h(s) \\ge 0$ and equivalence with UCS",
          "Connects the theory to the learner's measured convergence rate",
        ],
      },
      {
        title: "7. Independent Component Analysis (optional CS229 Lec 16)",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`In §100-ica.py§ write §def ica(X, lr=0.01, epochs=200, seed=0):§ implementing Bell & Sejnowski ICA as in the CS229 notes, with the sigmoid CDF $g$ as the source model.

* §X§ §(m, n)§ is a **centered** mixture of §n§ sources. Returns the unmixing matrix §W§ §(n, n)§; recovered sources are §X @ W.T§.
* Use the maximum-likelihood gradient $\nabla_W\ell = (1 - 2g(Wx))x^\top + (W^\top)^{-1}$ — stochastic, mini-batch or the natural-gradient form $\Delta W \propto \big(I + \frac1B\sum(1-2g(y))y^\top\big)W$ are all accepted. Initialize §W§ from §np.random.default_rng(seed)§ (or the identity) and choose defaults that converge on the test below in a few seconds.

In the README, unmix the CS229 PS4 "cocktail party" audio (or your own synthetic mixtures) and describe the result.`,
        files: ["100-ica.py"],
        checks: [
          def("100-ica.py", "ica"),
          noLib("100-ica.py"),
          pt(["100-ica.py"], "separates two mixed Laplacian sources", py`import numpy as np
from importlib import import_module
ica = import_module('100-ica').ica
rng = np.random.default_rng(0)
S = rng.laplace(size=(2000, 2))
A = np.array([[1.0, 0.6], [0.4, 1.0]])
X = S @ A.T; X = X - X.mean(0)
W = np.asarray(ica(X), dtype=float)
assert W.shape == (2, 2)
Y = X @ W.T
C = np.abs(np.corrcoef(np.c_[S, Y].T)[:2, 2:])
assert C.max(1).min() > 0.95 and C.max(0).min() > 0.95, f"sources not recovered, |corr| =\n{C.round(3)}"`),
        ],
      },
    ],
  },

  // ==========================================================================
  // A10 — Phase 1 mini-project
  // ==========================================================================
  {
    id: "A10",
    track: TRACK,
    phase: PHASE,
    title: "Phase 1 Mini-project: Three Classical Models on a Kaggle Dataset",
    days: 3,
    repo: REPO,
    dir: "0x09-classical_miniproject",
    sources: [
      { course: "CS229", lectures: "Lec 9–10 (revisit)", topics: "Model selection, cross-validation, error analysis, advice for applying ML" },
    ],
    resources: [
      { title: "Kaggle — Titanic: Machine Learning from Disaster", url: "https://www.kaggle.com/competitions/titanic" },
      { title: "scikit-learn user guide — Cross-validation: evaluating estimator performance", url: "https://scikit-learn.org/stable/modules/cross_validation.html" },
      { title: "scikit-learn user guide — Common pitfalls and recommended practices (data leakage)", url: "https://scikit-learn.org/stable/common_pitfalls.html" },
      { title: "Andrew Ng, Machine Learning Yearning (error analysis chapters)", url: "https://github.com/ajaymache/machine-learning-yearning" },
    ],
    concepts: [
      "End-to-end tabular ML workflow",
      "Feature engineering and missing-value imputation",
      "Leakage-free preprocessing inside cross-validation",
      "Comparing models with mean ± std CV scores",
      "Error analysis on a held-out set",
      "Communicating results in a public write-up",
    ],
    objectives: [
      "Clean and feature-engineer a real tabular dataset without leaking validation information",
      "Train and tune three model families (linear, tree-based, kernel) with k-fold CV",
      "Compare models fairly and pick one using CV only",
      "Run an error analysis and explain where each model fails",
      "Write a clear public report of the results and their limitations",
      "Organize the Phase 1 repository so that every implementation is discoverable",
    ],
    requirements: [
      "Python 3.10+; pandas and matplotlib allowed; scikit-learn allowed **only** for at most two of the three models (at least one model must be your own Phase 1 NumPy implementation) and never for the CV loop (use your §0x04-bias_variance/2-kfold.py§)",
      NOTEBOOKS,
      "Raw data is not committed if the license forbids it — document the download step in the README instead",
    ],
    quiz: [
      {
        q: "You impute missing ages with the median computed on the full training CSV before cross-validation. The problem is…",
        options: ["none", "the validation folds influenced the imputation value, so CV scores are slightly optimistic", "the median is biased", "imputation is not allowed"],
        answer: 1,
        why: "Any statistic learned from data must be computed inside each training fold — the same rule as for scaling.",
      },
      {
        q: "Model A: CV accuracy 0.823 ± 0.020; model B: 0.829 ± 0.025 (5 folds). What can you conclude?",
        options: ["B is clearly better", "The difference is well within fold-to-fold noise; prefer the simpler/more interpretable model or test with repeated CV", "A is better because its std is smaller", "Both are overfitting"],
        answer: 1,
        why: "A 0.6-point gap with ±2-point fold variation is not evidence of a real difference.",
      },
      {
        q: "Why should the Kaggle public leaderboard not be used to choose hyper-parameters?",
        options: ["It is too slow", "Repeatedly selecting on it overfits that small public subset, like tuning on the test set", "Kaggle forbids it", "It uses a different metric"],
        answer: 1,
        why: "The leaderboard is a test set; using it for selection makes it part of training and the score stops being an unbiased estimate.",
      },
    ],
    tasks: [
      {
        title: "0. Project README and EDA",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Pick the Kaggle **Titanic** dataset (or a comparable binary-classification tabular dataset — say which and why in the README).

* §README.md§ (≥ 200 words): problem, dataset link, how to download the data, how to reproduce every result, final table of results, link to your write-up.
* Executed notebook §0-eda.ipynb§: shapes, dtypes, missing values per column, target balance, at least 4 plots of feature vs target, and a markdown cell listing the hypotheses you will turn into features.`,
        files: ["README.md", "0-eda.ipynb"],
        checks: [
          readme(200),
          nb("0-eda.ipynb"),
          has("0-eda.ipynb", "isna|isnull", "inspects missing values"),
        ],
      },
      {
        title: "1. Feature pipeline",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §1-features.py§ write:

* §def fit_preprocessor(df_train):§ learns everything data-dependent (imputation values, category levels, scaling statistics) from the **training rows only** and returns a state object (dict).
* §def transform(df, state):§ returns a NumPy §float§ array of features (no target column, no IDs) using only §state§.
* At least 3 engineered features (e.g. title extracted from name, family size, cabin deck, fare per person), documented in docstrings.

The target column (e.g. §Survived§) must never be used inside §transform§.`,
        files: ["1-features.py"],
        checks: [
          def("1-features.py", "fit_preprocessor", "transform"),
          has("1-features.py", "fillna|isna|isnull|median|mode", "handles missing values"),
          lacks("1-features.py", "Survived", "never touches the target column"),
        ],
      },
      {
        title: "2. Three models",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §2-models.py§ define three model families with a uniform interface §fit(X, y) -> model§ and §predict(model, X) -> labels§:

* §fit_linear§ / §predict_linear§ — logistic regression (your §0x01-logistic_regression§ code, with L2 regularization);
* §fit_tree§ / §predict_tree§ — a tree ensemble (your random forest or AdaBoost from §0x05-trees_ensembles§, or scikit-learn);
* §fit_kernel§ / §predict_kernel§ — an SVM with RBF kernel (your SMO from §0x03-svm§, or scikit-learn).

At least one of the three must import your own Phase 1 implementation (e.g. via §importlib§ and a relative path to the sibling directory).`,
        files: ["2-models.py"],
        checks: [
          def("2-models.py", "fit_linear", "predict_linear", "fit_tree", "predict_tree", "fit_kernel", "predict_kernel"),
          has("2-models.py", "0x0[0-8]-", "reuses at least one Phase 1 implementation"),
        ],
      },
      {
        title: "3. Cross-validated comparison",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Executed notebook §3-evaluate.ipynb§:

1. Hold out 20% of the labelled data (stratified, seed 0) as a final test set; never touch it until step 4.
2. On the remaining 80%, run 5-fold CV **with your §kfold_indices§**, fitting the preprocessor inside each fold. Tune at most 2 hyper-parameters per model with a small grid.
3. Report mean ± std CV accuracy per model in a table and a box plot (§cv_scores.png§).
4. Choose the best model by CV, retrain on the full 80% and evaluate once on the held-out 20%. Show the confusion matrix and inspect 20 misclassified passengers: what do they have in common?

Write §results.json§:
§§§json
{"cv": {"linear_mean": 0.0, "linear_std": 0.0, "tree_mean": 0.0, "tree_std": 0.0, "kernel_mean": 0.0, "kernel_std": 0.0},
 "best_model": "tree", "holdout_accuracy": 0.0}
§§§
Thresholds (Titanic): §cv.linear_mean§ ≥ 0.77, §cv.tree_mean§ ≥ 0.79, §cv.kernel_mean§ ≥ 0.78, §holdout_accuracy§ ≥ 0.78.`,
        files: ["3-evaluate.ipynb", "results.json", "cv_scores.png"],
        checks: [
          nb("3-evaluate.ipynb"),
          has("3-evaluate.ipynb", "kfold_indices", "uses your own k-fold splitter"),
          metric("results.json", "cv.linear_mean", ">=", 0.77),
          metric("results.json", "cv.tree_mean", ">=", 0.79),
          metric("results.json", "cv.kernel_mean", ">=", 0.78),
          metric("results.json", "holdout_accuracy", ">=", 0.78),
        ],
      },
      {
        title: "4. Public write-up",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`Publish a Medium (or personal blog) post, 1 000–1 800 words, titled along the lines of *"Three classical models on Titanic, from scratch"*, and submit the link.

It must explain your features, how you avoided leakage, the three models (one paragraph of intuition each — margin, impurity/ensembling, likelihood), the CV comparison with uncertainty, the error analysis, and what you would try next. Include at least two figures from your notebooks and a link to the repository.`,
        deliverable: "link",
        rubric: "report",
        criteria: [
          "Describes the engineered features and the leakage-free preprocessing (fit inside each fold)",
          "Explains each of the three models' inductive bias in plain language, correctly",
          "Reports CV mean ± std for all three models and the single held-out evaluation, consistent with results.json",
          "Includes a concrete error analysis (what the misclassified examples share) and next steps",
          "Clear structure, at least two figures, link to the GitHub repository",
        ],
      },
      {
        title: "5. Phase 1 repository README",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`The Phase 1 deliverable is a repository with NumPy implementations of linear regression, logistic regression, SVM (linear & kernel), MLP, k-means and PCA. Make it discoverable: write the **repository-level** §README.md§ (at the root of §ml-foundations§, i.e. §../README.md§ from this directory), ≥ 250 words, containing:

* one section per Phase 1 directory (§0x00-linear_regression§ … §0x09-classical_miniproject§), each naming the directory explicitly and listing its main files and what they implement;
* a "How to run" section (Python version, §pip install numpy matplotlib§, how to run a §*-main.py§ or notebook);
* a table "Algorithm → file" covering at least: normal equations, gradient descent, logistic regression, Newton's method, Naive Bayes, GDA, SMO, decision tree, random forest, AdaBoost, MLP/backprop, k-means, GMM/EM, PCA, value iteration.`,
        files: ["../README.md"],
        checks: [
          { type: "readme", path: "../README.md", minWords: 250 },
          has("../README.md", "^(?=[\\s\\S]*0x00-linear_regression)(?=[\\s\\S]*0x01-logistic_regression)(?=[\\s\\S]*0x02-generative_learning)(?=[\\s\\S]*0x03-svm)(?=[\\s\\S]*0x04-bias_variance)", "lists directories 0x00–0x04"),
          has("../README.md", "^(?=[\\s\\S]*0x05-trees_ensembles)(?=[\\s\\S]*0x06-mlp_numpy)(?=[\\s\\S]*0x07-unsupervised)(?=[\\s\\S]*0x08-mdp_value_iteration)(?=[\\s\\S]*0x09-classical_miniproject)", "lists directories 0x05–0x09"),
          has("../README.md", "^(?=[\\s\\S]*[Nn]ormal equation)(?=[\\s\\S]*SMO)(?=[\\s\\S]*[Bb]ackprop)(?=[\\s\\S]*PCA)(?=[\\s\\S]*[Vv]alue iteration)(?=[\\s\\S]*[Kk]-means)", "algorithm table covers the core implementations"),
        ],
      },
      {
        title: "6. The 8-page Phase 1 note",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`Assemble your Phase 1 note: **8 pages, one per week**, summarizing the key derivations and intuitions in your own words (reuse and polish your earlier written tasks; the week-3 page is your discriminative-vs-generative note). File §written/phase1_notes.pdf§ (PDF, Markdown or LaTeX accepted).

Each page: the 2–4 central equations with a one-line meaning for each, one figure or worked example of your own, the one thing that surprised you, and one question you still have. Weeks: 1 linear regression · 2 logistic/Newton · 3 GLMs & generative · 4 SVM/kernels · 5 bias–variance & debugging · 6 trees, ensembles & MLP · 7 unsupervised · 8 search & MDPs.`,
        deliverable: "repo",
        files: ["written/phase1_notes.pdf"],
        rubric: "summary",
        criteria: [
          "Exactly one page per week for all 8 weeks, in the listed order",
          "Each page states its central equations correctly with a plain-language meaning",
          "Contains the learner's own figures/worked examples (not copied from the notes)",
          "Includes a 'surprise' and an 'open question' per page showing genuine reflection",
          "Concise and readable: a peer could revise Phase 1 from it",
        ],
      },
      {
        title: "7. Kaggle submission",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`Retrain your chosen model on **all** labelled data, predict Kaggle's §test.csv§, and commit §submission.csv§ (header §PassengerId,Survived§, 418 rows). Submit it once to Kaggle and add §kaggle_public_score§ to §results.json§. Do not tune on the leaderboard. Target: §kaggle_public_score§ ≥ 0.77.`,
        files: ["submission.csv", "results.json"],
        checks: [
          ex("submission.csv"),
          has("submission.csv", "^PassengerId,Survived", "correct header"),
          { type: "nonempty", path: "submission.csv", minLines: 419 },
          metric("results.json", "kaggle_public_score", ">=", 0.77),
        ],
      },
    ],
  },
];

// Plain (non-template) strings above also use § for backticks: normalize every string.
const fixTicks = (v) =>
  typeof v === "string" ? v.replace(/§/g, "`")
  : Array.isArray(v) ? v.map(fixTicks)
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fixTicks(x)]))
  : v;

export default fixTicks(PROJECTS);
