// Applied track — Phase 4: Generative Models & Reinforcement Learning (CS236, CME296, CS234, CS329H).
// Bodies use the `md` tag: String.raw, with \` -> backtick and ~~~ -> ``` (so Markdown code survives).
const md = (s, ...v) => String.raw(s, ...v).replace(/\\`/g, "`").replace(/~~~/g, "```");
const py = String.raw;

const TRACK = "applied";
const PHASE = "Phase 4 — Generative Models & RL";
const REPO = "ml-generative-rl";

export default [
  // ───────────────────────────────────────────────────────────── A30
  {
    id: "A30",
    track: TRACK,
    phase: PHASE,
    title: "Autoregressive Models: PixelCNN",
    days: 3,
    repo: REPO,
    dir: "0x00-pixelcnn",
    sources: [
      { course: "CS236", lectures: "Lec 1–2", topics: "Introduction to generative modeling; autoregressive models (FVSBN, NADE, PixelRNN/PixelCNN, RNN language models)" },
    ],
    resources: [
      { title: "CS236 course site & lecture notes (Ermon)", url: "https://deepgenerativemodels.github.io/" },
      { title: "van den Oord et al. 2016 — Pixel Recurrent Neural Networks (PixelCNN, masks A/B)", url: "https://arxiv.org/abs/1601.06759" },
      { title: "van den Oord et al. 2016 — Conditional Image Generation with PixelCNN Decoders (gated PixelCNN)", url: "https://arxiv.org/abs/1606.05328" },
      { title: "Larochelle & Murray 2011 / Uria et al. 2016 — Neural Autoregressive Distribution Estimation (NADE)", url: "https://arxiv.org/abs/1605.02226" },
      { title: "PyTorch docs — torch.nn.Conv2d", url: "https://pytorch.org/docs/stable/generated/torch.nn.Conv2d.html" },
    ],
    concepts: [
      "Chain rule factorization p(x) = Π p(x_i | x_<i)",
      "Raster-scan ordering and the receptive field of masked convolutions",
      "Mask type A (first layer, excludes centre) vs type B (later layers, includes centre)",
      "Blind spot of stacked masked convolutions",
      "Negative log-likelihood in nats vs bits per dimension",
      "Teacher forcing (parallel training) vs sequential sampling",
    ],
    objectives: [
      "Write the autoregressive factorization of an image distribution and explain why it gives an exact likelihood",
      "Construct mask A and mask B for a k×k convolution and explain why the first layer must use A",
      "Explain why training is parallel over pixels but sampling costs one forward pass per pixel",
      "Convert a per-image NLL in nats to bits/dim and compare it with published numbers",
      "Describe the blind-spot problem and how gated PixelCNN's vertical/horizontal stacks fix it",
    ],
    requirements: [
      "Python 3.10+, NumPy for tasks 0–1 (no torch import in those files)",
      "PyTorch for the model; a single consumer GPU or Colab is enough",
      "Binarized MNIST: pixel = 1 if intensity > 0.5 else 0 (fixed binarization)",
    ],
    quiz: [
      { q: "Why does the FIRST masked convolution of a PixelCNN use mask type A?",
        options: ["It is cheaper to compute", "The output at pixel i must not see input pixel i itself, otherwise p(x_i|x_<i) would cheat", "Type B masks cannot be used on single-channel images", "It enlarges the receptive field"],
        answer: 1, why: "Later layers may include the centre (type B) because their centre feature already only depends on x_<i." },
      { q: "A model reaches 86 nats per binarized MNIST image (784 pixels). Roughly how many bits/dim is that?",
        options: ["0.11", "0.158", "0.86", "1.58"], answer: 1, why: "86 / (784 · ln 2) ≈ 0.158." },
      { q: "Sampling a 28×28 image from a PixelCNN requires…",
        options: ["one forward pass", "28 forward passes", "784 forward passes (one per pixel, in raster order)", "a Markov chain run to convergence"],
        answer: 2, why: "Each pixel's conditional depends on the previously sampled pixels." },
      { q: "What is the 'blind spot' of a plain stack of masked 3×3 convolutions?",
        options: ["Pixels to the upper-right of the current pixel that are never in the receptive field", "The first row of the image", "The centre pixel", "Pixels below the current pixel"],
        answer: 0, why: "The triangular growth of the masked receptive field misses a wedge above-right; gated PixelCNN splits vertical/horizontal stacks to fix it." },
    ],
    tasks: [
      {
        title: "Masked convolution kernels (type A / type B)",
        type: "mandatory", kind: "code", points: 2,
        body: md`Write a function \`def masked_conv_mask(kernel_size, in_channels, out_channels, mask_type):\` that returns the binary mask applied to a PixelCNN convolution weight.

- Output: \`np.ndarray\` of shape \`(out_channels, in_channels, kernel_size, kernel_size)\` (PyTorch \`Conv2d.weight\` layout), dtype float, entries in $\{0, 1\}$.
- Let $c = \lfloor k/2 \rfloor$. Every row **above** the centre row is 1; in the centre row, columns **left** of the centre are 1; the centre itself is **0 for \`"A"\`** and **1 for \`"B"\`**; everything else is 0.
- Single-channel-group masks (no R/G/B channel splitting — MNIST is grayscale): every (out, in) pair gets the same spatial mask.
- Raise \`ValueError\` if \`kernel_size\` is even or \`mask_type\` is not \`"A"\`/\`"B"\`.
- NumPy only.

~~~python
>>> m = __import__('0-masked_conv_mask').masked_conv_mask(3, 1, 1, "A")
>>> m[0, 0]
array([[1., 1., 1.],
       [1., 0., 0.],
       [0., 0., 0.]])
~~~

Also create the project \`README.md\` (≥ 100 words): what an autoregressive model is, the mask rule, and a results table you will fill in.`,
        files: ["0-masked_conv_mask.py", "README.md"],
        checks: [
          { type: "exists", path: "0-masked_conv_mask.py" },
          { type: "defines", path: "0-masked_conv_mask.py", names: ["masked_conv_mask"] },
          { type: "not_contains", path: "0-masked_conv_mask.py", pattern: "import torch", label: "NumPy only" },
          { type: "readme", path: "README.md", minWords: 100 },
          { type: "py_test", files: ["0-masked_conv_mask.py"], label: "masks A/B match the raster-order rule for k = 1, 3, 5, 7",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-masked_conv_mask')

def ref(k, cin, cout, t):
    c = k // 2
    s = np.zeros((k, k))
    s[:c, :] = 1
    s[c, :c] = 1
    if t == "B":
        s[c, c] = 1
    return np.broadcast_to(s, (cout, cin, k, k))

for k in (1, 3, 5, 7):
    for t in ("A", "B"):
        out = np.asarray(m.masked_conv_mask(k, 2, 4, t), dtype=float)
        assert out.shape == (4, 2, k, k), f"shape {out.shape} for k={k}"
        assert np.array_equal(out, ref(k, 2, 4, t)), f"wrong mask for k={k}, type {t}"
for bad in [(4, 1, 1, "A"), (3, 1, 1, "C")]:
    try:
        m.masked_conv_mask(*bad)
    except ValueError:
        pass
    else:
        raise AssertionError(f"expected ValueError for {bad}")
print("ok")` },
        ],
      },
      {
        title: "Likelihood bookkeeping: Bernoulli NLL and bits/dim",
        type: "mandatory", kind: "code", points: 1,
        body: md`In \`1-likelihood.py\` write:

1. \`def bernoulli_nll(logits, x):\` — \`logits\`, \`x\` arrays of shape \`(N, D)\` (\`x\` in $\{0,1\}$). Return shape \`(N,)\`: the negative log-likelihood **in nats** of each image under independent Bernoulli conditionals $p(x_i=1 \mid x_{<i}) = \sigma(\ell_i)$, i.e. $-\sum_i [x_i \log\sigma(\ell_i) + (1-x_i)\log(1-\sigma(\ell_i))]$.
   Must be numerically stable for $|\ell| \ge 500$ (no \`inf\`/\`nan\`): use the softplus form, never \`np.log(sigmoid(...))\`.
2. \`def bits_per_dim(nll_nats, num_dims):\` — mean over images of the NLL, converted to bits per dimension: $\overline{\text{NLL}} / (D \ln 2)$. Returns a Python float.

NumPy only, no loops over samples.

~~~python
>>> lk = __import__('1-likelihood')
>>> lk.bits_per_dim(np.array([86.0]), 784)
0.1582...
~~~`,
        files: ["1-likelihood.py"],
        checks: [
          { type: "defines", path: "1-likelihood.py", names: ["bernoulli_nll", "bits_per_dim"] },
          { type: "not_contains", path: "1-likelihood.py", pattern: "import torch", label: "NumPy only" },
          { type: "py_test", files: ["1-likelihood.py"], label: "stable Bernoulli NLL and correct bits/dim",
            code: py`import numpy as np
from importlib import import_module
m = import_module('1-likelihood')
rng = np.random.default_rng(0)
N, D = 6, 50
logits = rng.normal(0, 3, (N, D))
x = (rng.random((N, D)) < 0.4).astype(float)
p = 1 / (1 + np.exp(-logits))
ref = -(x * np.log(p) + (1 - x) * np.log(1 - p)).sum(1)
out = np.asarray(m.bernoulli_nll(logits, x))
assert out.shape == (N,), out.shape
assert np.allclose(out, ref, rtol=1e-6, atol=1e-8)
big = np.array([[800.0, -800.0, 800.0, -800.0]])
xb = np.array([[1.0, 0.0, 0.0, 1.0]])
ob = np.asarray(m.bernoulli_nll(big, xb))
assert np.all(np.isfinite(ob)), "not stable for large logits"
assert np.allclose(ob, [1600.0], rtol=1e-6)
bpd = m.bits_per_dim(np.array([80.0, 92.0]), 784)
assert abs(float(bpd) - 86.0 / (784 * np.log(2))) < 1e-9
print("ok")` },
        ],
      },
      {
        title: "PixelCNN on binarized MNIST",
        type: "mandatory", kind: "code", points: 3,
        body: md`In \`2-pixelcnn.py\` implement and train a PixelCNN in PyTorch.

- \`class MaskedConv2d(nn.Conv2d)\` that multiplies its weight by a registered buffer mask built from **your** \`masked_conv_mask\` (import it with \`importlib\`) on every forward.
- \`class PixelCNN(nn.Module)\`: one 7×7 type-A layer, ≥ 6 residual blocks of type-B 3×3 masked convs (≥ 64 channels), two 1×1 layers, output 1 logit per pixel.
- Train with \`BCEWithLogitsLoss(reduction="sum")\` (= your Bernoulli NLL) on fixed-binarized MNIST (threshold 0.5), Adam, ≥ 10 epochs.
- After training, evaluate on the 10 000 test images and write \`results.json\`:

~~~json
{"test_nll_nats": 86.4, "test_bits_per_dim": 0.159, "epochs": 15, "params": 412000}
~~~

**Target:** \`test_bits_per_dim <= 0.175\` (≈ 95 nats/image). Published PixelCNN-class models reach ≈ 80–88 nats.
Do not use any third-party PixelCNN implementation.`,
        files: ["2-pixelcnn.py", "results.json"],
        checks: [
          { type: "defines", path: "2-pixelcnn.py", names: ["MaskedConv2d", "PixelCNN"] },
          { type: "contains", path: "2-pixelcnn.py", pattern: "import torch", label: "uses PyTorch" },
          { type: "contains", path: "2-pixelcnn.py", pattern: "masked_conv_mask", label: "reuses your mask function" },
          { type: "not_contains", path: "2-pixelcnn.py", pattern: "pixelcnn_pp|from\\s+pixel_cnn|pip install", label: "no third-party PixelCNN" },
          { type: "json_metric", path: "results.json", key: "test_bits_per_dim", op: "<=", value: 0.175 },
          { type: "json_metric", path: "results.json", key: "epochs", op: ">=", value: 10 },
        ],
      },
      {
        title: "Sampling in raster order",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`3-sample.py\` write \`def sample(model, n, device="cpu"):\` returning a \`(n, 1, 28, 28)\` tensor of binary samples generated **pixel by pixel in raster order** (784 forward passes under \`torch.no_grad()\`).

- Save an 8×8 grid of 64 samples as \`samples.png\`.
- In the README, add the sample grid, the wall-clock time of sampling 64 images, and one paragraph comparing that time to one training forward pass.`,
        files: ["3-sample.py", "samples.png"],
        checks: [
          { type: "defines", path: "3-sample.py", names: ["sample"] },
          { type: "contains", path: "3-sample.py", pattern: "no_grad", label: "sampling under torch.no_grad()" },
          { type: "contains", path: "3-sample.py", pattern: "for\\s+\\w+\\s+in\\s+range", label: "explicit loop over pixels" },
          { type: "exists", path: "samples.png" },
        ],
      },
      {
        title: "Short write-up: what the likelihood does and doesn't tell you",
        type: "mandatory", kind: "written", points: 1,
        body: md`One page (PDF, Markdown or LaTeX accepted) in \`written/4-pixelcnn_notes.md\`:

1. Write the autoregressive factorization and explain why masked convolutions implement it exactly.
2. Draw (ASCII or image) the receptive field of the centre pixel after three 3×3 masked layers and mark the blind spot.
3. Report your test NLL in nats and bits/dim next to the PixelCNN paper's number, and explain the conversion.
4. Give one reason a model can have good likelihood but poor-looking samples (or vice versa).`,
        deliverable: "repo",
        files: ["written/4-pixelcnn_notes.md"],
        rubric: "report",
        criteria: [
          "States p(x) = Π_i p(x_i | x_<i) and connects mask A/B to it",
          "Receptive-field drawing shows the blind spot after stacked layers",
          "Reports own NLL in both nats and bits/dim with the conversion formula",
          "Gives a concrete likelihood-vs-sample-quality argument (e.g. Theis et al. 2016)",
        ],
      },
      {
        title: "Gated PixelCNN (vertical + horizontal stacks)",
        type: "advanced", kind: "code", points: 2,
        body: md`In \`100-gated_pixelcnn.py\` implement the gated PixelCNN of van den Oord et al. (2016b): separate vertical and horizontal stacks (no blind spot) and gated activations $\tanh(W_f * x) \odot \sigma(W_g * x)$, optionally class-conditional.
Train it with the same protocol and add \`"gated_test_bits_per_dim"\` to \`results.json\`; it must beat your plain PixelCNN.`,
        files: ["100-gated_pixelcnn.py"],
        checks: [
          { type: "exists", path: "100-gated_pixelcnn.py" },
          { type: "contains", path: "100-gated_pixelcnn.py", pattern: "tanh", label: "gated activation" },
          { type: "contains", path: "100-gated_pixelcnn.py", pattern: "sigmoid", label: "gated activation" },
          { type: "json_metric", path: "results.json", key: "gated_test_bits_per_dim", op: "<=", value: 0.17 },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A31
  {
    id: "A31",
    track: TRACK,
    phase: PHASE,
    title: "Variational Autoencoders",
    days: 3,
    repo: REPO,
    dir: "0x01-vae",
    sources: [
      { course: "CS236", lectures: "Lec 3–4", topics: "Latent variable models, variational inference, the ELBO, amortization, reparameterization trick, VAEs" },
    ],
    resources: [
      { title: "Kingma & Welling 2013 — Auto-Encoding Variational Bayes", url: "https://arxiv.org/abs/1312.6114" },
      { title: "Kingma & Welling 2019 — An Introduction to Variational Autoencoders", url: "https://arxiv.org/abs/1906.02691" },
      { title: "Doersch 2016 — Tutorial on Variational Autoencoders", url: "https://arxiv.org/abs/1606.05908" },
      { title: "Burda et al. 2015 — Importance Weighted Autoencoders", url: "https://arxiv.org/abs/1509.00519" },
      { title: "CS236 course site & lecture notes", url: "https://deepgenerativemodels.github.io/" },
    ],
    concepts: [
      "Latent variable model p(x) = ∫ p(x|z) p(z) dz",
      "Evidence lower bound (ELBO) and its gap KL(q(z|x) || p(z|x))",
      "Amortized inference with an encoder q_φ(z|x)",
      "Reparameterization trick z = μ + σ ⊙ ε",
      "Closed-form KL between diagonal Gaussians",
      "Posterior collapse and β-VAE",
      "Importance-weighted bounds (IWAE)",
    ],
    objectives: [
      "Derive the ELBO from log p(x) twice: with Jensen's inequality and with the KL decomposition",
      "Derive KL(N(μ, σ²) || N(0, 1)) in closed form",
      "Explain why the reparameterization trick gives low-variance gradients compared with the score-function estimator",
      "Train a VAE on MNIST and report the negative ELBO in nats",
      "Explain linear vs spherical interpolation in a Gaussian latent space",
      "Explain posterior collapse and one mitigation",
    ],
    requirements: [
      "NumPy only for tasks 0, 1, 2, 5 and 100",
      "PyTorch for the VAE; binarized MNIST (threshold 0.5)",
    ],
    quiz: [
      { q: "log p(x) − ELBO(x) equals…",
        options: ["KL(p(z) || q(z|x))", "KL(q(z|x) || p(z|x))", "the reconstruction loss", "zero for any encoder"],
        answer: 1, why: "log p(x) = ELBO + KL(q(z|x) || p(z|x)) ≥ ELBO." },
      { q: "The closed form of KL(N(μ, σ²) || N(0,1)) for one dimension is…",
        options: ["½(σ² + μ² − 1 − log σ²)", "½(μ² − log σ²)", "log σ + (1+μ²)/(2σ²)", "½(σ² − μ² + 1 + log σ²)"],
        answer: 0, why: "Sum this over latent dimensions for a diagonal Gaussian." },
      { q: "Why is z = μ + σ·ε (ε ~ N(0, I)) useful?",
        options: ["It makes q(z|x) a mixture", "It moves the randomness out of the parameters so gradients flow through μ and σ by backprop", "It makes the KL term vanish", "It removes the need for a decoder"],
        answer: 1, why: "Pathwise (reparameterized) gradients have much lower variance than REINFORCE-style estimators." },
      { q: "An IWAE bound with K samples, compared with the ELBO (K=1), is…",
        options: ["always looser", "equal", "at least as tight and approaches log p(x) as K → ∞", "not a bound"],
        answer: 2, why: "log (1/K) Σ w_k is a tighter lower bound as K grows (Burda et al.)." },
    ],
    tasks: [
      {
        title: "Closed-form Gaussian KL",
        type: "mandatory", kind: "code", points: 1,
        body: md`Write \`def gaussian_kl(mu, logvar):\` in \`0-gaussian_kl.py\`.

- \`mu\`, \`logvar\`: arrays of shape \`(N, d)\` — the encoder outputs, with $\sigma^2 = e^{\text{logvar}}$.
- Return shape \`(N,)\`: $\mathrm{KL}(\mathcal N(\mu, \mathrm{diag}\,\sigma^2)\,\|\,\mathcal N(0, I))$ for each row.
- NumPy only, vectorised.

Also create \`README.md\` (≥ 100 words) explaining the VAE objective and the files in this directory.

~~~python
>>> gaussian_kl(np.zeros((2, 3)), np.zeros((2, 3)))
array([0., 0.])
~~~`,
        files: ["0-gaussian_kl.py", "README.md"],
        checks: [
          { type: "defines", path: "0-gaussian_kl.py", names: ["gaussian_kl"] },
          { type: "readme", path: "README.md", minWords: 100 },
          { type: "py_test", files: ["0-gaussian_kl.py"], label: "matches the closed form and a Monte-Carlo estimate",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-gaussian_kl')
rng = np.random.default_rng(0)
mu = rng.normal(0, 1, (5, 4))
lv = rng.normal(0, 0.5, (5, 4))
ref = 0.5 * (np.exp(lv) + mu**2 - 1 - lv).sum(1)
out = np.asarray(m.gaussian_kl(mu, lv))
assert out.shape == (5,), out.shape
assert np.allclose(out, ref, rtol=1e-8, atol=1e-10)
# Monte-Carlo sanity check on one row
s = np.exp(0.5 * lv[0])
z = mu[0] + s * rng.standard_normal((200000, 4))
logq = (-0.5 * ((z - mu[0]) / s) ** 2 - np.log(s) - 0.5 * np.log(2 * np.pi)).sum(1)
logp = (-0.5 * z**2 - 0.5 * np.log(2 * np.pi)).sum(1)
assert abs((logq - logp).mean() - out[0]) < 0.03
assert np.allclose(m.gaussian_kl(np.zeros((2, 3)), np.zeros((2, 3))), 0)
print("ok")` },
        ],
      },
      {
        title: "Reparameterization and a stable ELBO",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`1-elbo.py\` write:

1. \`def reparameterize(mu, logvar, eps):\` → \`mu + exp(0.5 * logvar) * eps\` (all shape \`(N, d)\`). The noise is passed in so the function is deterministic.
2. \`def bernoulli_elbo(x, logits, mu, logvar):\` → shape \`(N,)\`, the single-sample ELBO in nats:
   $$\mathrm{ELBO} = \sum_{i=1}^{D}\big[x_i \log\sigma(\ell_i) + (1-x_i)\log(1-\sigma(\ell_i))\big] - \mathrm{KL}(q(z|x)\,\|\,p(z))$$
   \`x\`, \`logits\`: \`(N, D)\`; \`mu\`, \`logvar\`: \`(N, d)\`. Must stay finite for $|\ell| \ge 500$ (softplus form). You may import your \`gaussian_kl\` with \`importlib\` or re-implement it.

NumPy only.`,
        files: ["1-elbo.py"],
        checks: [
          { type: "defines", path: "1-elbo.py", names: ["reparameterize", "bernoulli_elbo"] },
          { type: "not_contains", path: "1-elbo.py", pattern: "import torch", label: "NumPy only" },
          { type: "py_test", files: ["1-elbo.py", "0-gaussian_kl.py"], label: "reparameterization and ELBO are exact and stable",
            code: py`import numpy as np
from importlib import import_module
m = import_module('1-elbo')
rng = np.random.default_rng(0)
N, D, d = 4, 30, 3
mu = rng.normal(size=(N, d)); lv = rng.normal(0, 0.3, (N, d)); eps = rng.standard_normal((N, d))
z = np.asarray(m.reparameterize(mu, lv, eps))
assert np.allclose(z, mu + np.exp(0.5 * lv) * eps)
x = (rng.random((N, D)) < 0.3).astype(float)
lg = rng.normal(0, 2, (N, D))
p = 1 / (1 + np.exp(-lg))
rec = (x * np.log(p) + (1 - x) * np.log(1 - p)).sum(1)
kl = 0.5 * (np.exp(lv) + mu**2 - 1 - lv).sum(1)
out = np.asarray(m.bernoulli_elbo(x, lg, mu, lv))
assert out.shape == (N,), out.shape
assert np.allclose(out, rec - kl, rtol=1e-7, atol=1e-8)
big = np.array([[600.0, -600.0]]); xb = np.array([[0.0, 1.0]])
ob = np.asarray(m.bernoulli_elbo(xb, big, np.zeros((1, 1)), np.zeros((1, 1))))
assert np.all(np.isfinite(ob)) and np.allclose(ob, [-1200.0], rtol=1e-6)
print("ok")` },
        ],
      },
      {
        title: "Derive the ELBO and the Gaussian KL",
        type: "mandatory", kind: "written", points: 2,
        body: md`In \`written/2-elbo_derivation.pdf\` (PDF, Markdown or LaTeX accepted):

1. Starting from $\log p_\theta(x) = \log \int p_\theta(x|z)p(z)\,dz$, derive the ELBO using Jensen's inequality.
2. Derive it again via $\log p_\theta(x) = \mathrm{ELBO}(x;\theta,\phi) + \mathrm{KL}(q_\phi(z|x)\,\|\,p_\theta(z|x))$ and state when the bound is tight.
3. Rewrite the ELBO as reconstruction − KL(q(z|x) ‖ p(z)).
4. Derive $\mathrm{KL}(\mathcal N(\mu,\sigma^2)\|\mathcal N(0,1)) = \tfrac12(\sigma^2+\mu^2-1-\log\sigma^2)$ and extend it to diagonal $d$-dimensional Gaussians.
5. Write the score-function (REINFORCE) gradient estimator of $\nabla_\phi \mathbb E_{q_\phi}[f(z)]$ and the reparameterized one; explain which has lower variance and why.`,
        deliverable: "repo",
        files: ["written/2-elbo_derivation.pdf"],
        rubric: "derivation",
        criteria: [
          "Jensen derivation with the inequality direction justified (log is concave)",
          "KL decomposition derived and tightness condition q(z|x) = p(z|x) stated",
          "Reconstruction − KL(q||prior) form obtained algebraically",
          "Gaussian KL derived step by step (expectations of log densities), not just quoted",
          "Both gradient estimators written explicitly with a variance argument",
        ],
      },
      {
        title: "VAE on MNIST",
        type: "mandatory", kind: "code", points: 3,
        body: md`In \`3-vae.py\` implement a VAE in PyTorch (MLP or conv encoder/decoder, latent dim 2 **and** 20 — two runs).

- Encoder outputs \`mu, logvar\`; decoder outputs Bernoulli logits over 784 pixels.
- Loss = negative ELBO with \`reduction="sum"\`-style per-image nats (reconstruction + analytic KL). No \`torch.distributions.kl_divergence\` shortcut — write the KL.
- Train ≥ 20 epochs on binarized MNIST. Write \`results.json\`:

~~~json
{"test_neg_elbo_z20": 98.7, "test_neg_elbo_z2": 141.2, "test_kl_z20": 25.1, "epochs": 30}
~~~

**Target:** \`test_neg_elbo_z20 <= 110\` nats. Save \`reconstructions.png\` (originals vs reconstructions) and, for the 2-D model, \`latent_scatter.png\` (test means coloured by digit).`,
        files: ["3-vae.py", "results.json", "reconstructions.png", "latent_scatter.png"],
        checks: [
          { type: "contains", path: "3-vae.py", pattern: "import torch", label: "uses PyTorch" },
          { type: "contains", path: "3-vae.py", pattern: "logvar", label: "encoder outputs a log-variance" },
          { type: "not_contains", path: "3-vae.py", pattern: "kl_divergence", label: "KL written by hand" },
          { type: "json_metric", path: "results.json", key: "test_neg_elbo_z20", op: "<=", value: 110 },
          { type: "exists", path: "reconstructions.png" },
          { type: "exists", path: "latent_scatter.png" },
        ],
      },
      {
        title: "Latent interpolation: linear vs spherical",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`4-interpolate.py\` write \`def interpolate(z0, z1, n_steps, method="linear"):\`

- \`z0\`, \`z1\`: shape \`(d,)\`; return shape \`(n_steps, d)\` including both endpoints (\`out[0] == z0\`, \`out[-1] == z1\`), $t$ evenly spaced in $[0,1]$.
- \`"linear"\`: $(1-t)z_0 + t z_1$.
- \`"slerp"\`: $\frac{\sin((1-t)\Omega)}{\sin\Omega} z_0 + \frac{\sin(t\Omega)}{\sin\Omega} z_1$ with $\cos\Omega = \frac{z_0\cdot z_1}{\|z_0\|\|z_1\|}$; fall back to linear when $\sin\Omega < 10^{-6}$.
- Raise \`ValueError\` for any other method. NumPy only.

Then use it with your z=20 VAE: decode 10-step interpolations between 5 pairs of test digits with both methods and save \`interpolations.png\`. In the README explain why slerp keeps samples in the typical set of a high-dimensional Gaussian.`,
        files: ["4-interpolate.py", "interpolations.png"],
        checks: [
          { type: "defines", path: "4-interpolate.py", names: ["interpolate"] },
          { type: "exists", path: "interpolations.png" },
          { type: "py_test", files: ["4-interpolate.py"], label: "linear and slerp paths are correct",
            code: py`import numpy as np
from importlib import import_module
m = import_module('4-interpolate')
rng = np.random.default_rng(0)
z0 = rng.standard_normal(16); z1 = rng.standard_normal(16)
lin = np.asarray(m.interpolate(z0, z1, 7, "linear"))
t = np.linspace(0, 1, 7)[:, None]
assert lin.shape == (7, 16)
assert np.allclose(lin, (1 - t) * z0 + t * z1)
z1n = z1 / np.linalg.norm(z1) * np.linalg.norm(z0)
sl = np.asarray(m.interpolate(z0, z1n, 9, "slerp"))
assert sl.shape == (9, 16)
assert np.allclose(sl[0], z0) and np.allclose(sl[-1], z1n)
assert np.allclose(np.linalg.norm(sl, axis=1), np.linalg.norm(z0), rtol=1e-8), "slerp must preserve norm for equal-norm endpoints"
om = np.arccos(np.dot(z0, z1n) / (np.linalg.norm(z0) * np.linalg.norm(z1n)))
tt = np.linspace(0, 1, 9)[:, None]
refs = (np.sin((1 - tt) * om) * z0 + np.sin(tt * om) * z1n) / np.sin(om)
assert np.allclose(sl, refs, atol=1e-8)
par = np.asarray(m.interpolate(z0, 2 * z0, 5, "slerp"))
assert np.all(np.isfinite(par)) and np.allclose(par[-1], 2 * z0)
try:
    m.interpolate(z0, z1, 3, "cubic")
except ValueError:
    pass
else:
    raise AssertionError("expected ValueError")
print("ok")` },
        ],
      },
      {
        title: "Importance-weighted bound (IWAE)",
        type: "advanced", kind: "code", points: 2,
        body: md`In \`100-iwae_bound.py\` write \`def iwae_bound(log_w):\` where \`log_w\` has shape \`(N, K)\` with $\log w_k = \log p(x, z_k) - \log q(z_k|x)$. Return shape \`(N,)\`: $\log \frac1K \sum_k w_k$, computed with a numerically stable log-sum-exp (must work for \`log_w\` around $\pm 1000$).

Then estimate $\log p(x)$ on the test set with $K = 1, 10, 100, 1000$ for your z=20 VAE and add \`"test_iwae_k1000"\` (a negative log-likelihood in nats, positive number) to \`results.json\`; plot the bound vs $K$ in the README.`,
        files: ["100-iwae_bound.py"],
        checks: [
          { type: "defines", path: "100-iwae_bound.py", names: ["iwae_bound"] },
          { type: "json_metric", path: "results.json", key: "test_iwae_k1000", op: "<=", value: 105 },
          { type: "py_test", files: ["100-iwae_bound.py"], label: "stable log-mean-exp",
            code: py`import numpy as np
from importlib import import_module
m = import_module('100-iwae_bound')
rng = np.random.default_rng(0)
lw = rng.normal(-90, 3, (5, 50))
ref = np.log(np.exp(lw - lw.max(1, keepdims=True)).mean(1)) + lw.max(1)
out = np.asarray(m.iwae_bound(lw))
assert out.shape == (5,) and np.allclose(out, ref)
big = np.array([[-1000.0, -1001.0, -999.0], [1000.0, 1000.0, 1000.0]])
ob = np.asarray(m.iwae_bound(big))
assert np.all(np.isfinite(ob))
assert np.allclose(ob[1], 1000.0)
assert np.allclose(ob[0], -999.0 + np.log((np.exp(-1) + np.exp(-2) + 1) / 3))
print("ok")` },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A32
  {
    id: "A32",
    track: TRACK,
    phase: PHASE,
    title: "Normalizing Flows & GANs",
    days: 3,
    repo: REPO,
    dir: "0x02-flows_gans",
    sources: [
      { course: "CS236", lectures: "Lec 5–6", topics: "Normalizing flows (change of variables, NICE, RealNVP, autoregressive flows); GANs (two-sample tests, minimax objective, f-divergences, training pathologies)" },
    ],
    resources: [
      { title: "Dinh, Krueger & Bengio 2014 — NICE: Non-linear Independent Components Estimation", url: "https://arxiv.org/abs/1410.8516" },
      { title: "Dinh, Sohl-Dickstein & Bengio 2016 — Density estimation using Real NVP", url: "https://arxiv.org/abs/1605.08803" },
      { title: "Goodfellow et al. 2014 — Generative Adversarial Networks", url: "https://arxiv.org/abs/1406.2661" },
      { title: "Radford, Metz & Chintala 2015 — DCGAN", url: "https://arxiv.org/abs/1511.06434" },
      { title: "Papamakarios et al. 2019 — Normalizing Flows for Probabilistic Modeling and Inference", url: "https://arxiv.org/abs/1912.02762" },
    ],
    concepts: [
      "Change of variables: log p_X(x) = log p_Z(f(x)) + log |det ∂f/∂x|",
      "Coupling layers: triangular Jacobians, cheap inverse and log-determinant",
      "Additive (NICE) vs affine (RealNVP) coupling",
      "GAN minimax game and the optimal discriminator D* = p_data / (p_data + p_g)",
      "Saturating vs non-saturating generator loss",
      "Mode collapse and training instability",
    ],
    objectives: [
      "Implement an affine coupling layer with exact inverse and log-determinant",
      "Explain why a coupling layer's Jacobian is triangular and what its determinant is",
      "Derive the optimal discriminator and show the generator then minimizes 2·JSD − log 4",
      "Explain why the non-saturating generator loss is used in practice",
      "Train a DCGAN and diagnose mode collapse from samples",
    ],
    requirements: [
      "NumPy only for tasks 0, 1, 3",
      "PyTorch for the DCGAN and the advanced RealNVP",
    ],
    quiz: [
      { q: "For an affine coupling layer y_B = x_B ⊙ exp(s(x_A)) + t(x_A), y_A = x_A, log|det J| equals…",
        options: ["Σ t(x_A)", "Σ s(x_A)", "Σ exp(s(x_A))", "0"], answer: 1,
        why: "The Jacobian is triangular with diagonal 1 (for A) and exp(s) (for B)." },
      { q: "NICE's additive coupling has log|det J| equal to…", options: ["0 (volume preserving)", "Σ t", "1", "it is not invertible"], answer: 0,
        why: "y_B = x_B + m(x_A) has unit diagonal; NICE adds a final diagonal scaling layer." },
      { q: "With a fixed generator, the optimal discriminator is…",
        options: ["p_g / (p_data + p_g)", "p_data / (p_data + p_g)", "1/2 everywhere", "p_data / p_g"], answer: 1,
        why: "Maximize p_data log D + p_g log(1−D) pointwise." },
      { q: "Why train G with −log D(G(z)) instead of log(1 − D(G(z)))?",
        options: ["It has a different fixed point", "It gives strong gradients early in training when D confidently rejects fakes", "It removes the need for D", "It is a lower bound on the likelihood"], answer: 1,
        why: "log(1−D) saturates when D(G(z)) ≈ 0; the non-saturating loss has the same fixed point but large gradients there." },
    ],
    tasks: [
      {
        title: "Affine coupling layer: forward, inverse, log-det",
        type: "mandatory", kind: "code", points: 3,
        body: md`In \`0-affine_coupling.py\` write

~~~python
def coupling_forward(x, mask, s_fn, t_fn):   # -> (y, log_det)
def coupling_inverse(y, mask, s_fn, t_fn):   # -> x
~~~

- \`x\`, \`y\`: \`(N, D)\`; \`mask\`: \`(D,)\` of 0/1 floats (1 = passed through unchanged); \`s_fn\`, \`t_fn\`: callables \`(N, D) -> (N, D)\`.
- Forward (RealNVP): with $x_m = x \odot m$, $s = s_\text{fn}(x_m)\odot(1-m)$, $t = t_\text{fn}(x_m)\odot(1-m)$:
  $$y = x_m + (1-m)\odot\big(x \odot e^{s} + t\big),\qquad \log|\det J| = \textstyle\sum_j s_j \;\;(\text{shape } (N,))$$
- Inverse must recover \`x\` exactly (up to float error) using only \`y\`.
- NumPy only, vectorised.

Also create \`README.md\` (≥ 100 words) explaining change of variables and coupling layers.`,
        files: ["0-affine_coupling.py", "README.md"],
        checks: [
          { type: "defines", path: "0-affine_coupling.py", names: ["coupling_forward", "coupling_inverse"] },
          { type: "readme", path: "README.md", minWords: 100 },
          { type: "py_test", files: ["0-affine_coupling.py"], label: "inverse(forward(x)) = x and log-det matches a numerical Jacobian",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-affine_coupling')
rng = np.random.default_rng(0)
D = 4
W1 = rng.normal(0, 0.7, (D, D)); W2 = rng.normal(0, 0.7, (D, D))
s_fn = lambda h: np.tanh(h @ W1)
t_fn = lambda h: h @ W2 + 0.3
mask = np.array([1.0, 0.0, 1.0, 0.0])
x = rng.normal(size=(5, D))
y, ld = m.coupling_forward(x, mask, s_fn, t_fn)
y = np.asarray(y); ld = np.asarray(ld)
assert y.shape == (5, D) and ld.shape == (5,)
assert np.allclose(y[:, mask == 1], x[:, mask == 1]), "masked dims must pass through"
xr = np.asarray(m.coupling_inverse(y, mask, s_fn, t_fn))
assert np.allclose(xr, x, atol=1e-10), "inverse does not recover x"
h = 1e-6
for n in range(5):
    J = np.zeros((D, D))
    for j in range(D):
        e = np.zeros(D); e[j] = h
        yp, _ = m.coupling_forward((x[n] + e)[None], mask, s_fn, t_fn)
        ym, _ = m.coupling_forward((x[n] - e)[None], mask, s_fn, t_fn)
        J[:, j] = (np.asarray(yp)[0] - np.asarray(ym)[0]) / (2 * h)
    assert abs(np.linalg.slogdet(J)[1] - ld[n]) < 1e-5, "log-det does not match Jacobian"
print("ok")` },
        ],
      },
      {
        title: "Flow log-likelihood",
        type: "mandatory", kind: "code", points: 1,
        body: md`In \`1-flow_logprob.py\` write

- \`def standard_normal_logprob(z):\` — \`z\` \`(N, D)\` → \`(N,)\`, $\sum_j \log\mathcal N(z_j; 0, 1)$.
- \`def flow_logprob(z, log_det):\` — $\log p_X(x) = \log p_Z(z) + \log|\det \partial z/\partial x|$ where \`z = f(x)\` and \`log_det\` is the summed log-determinant of all layers (shape \`(N,)\`).
- \`def bits_per_dim(logprob, D):\` — $-\overline{\log p}/(D\ln 2)$ for continuous data (Python float).`,
        files: ["1-flow_logprob.py"],
        checks: [
          { type: "defines", path: "1-flow_logprob.py", names: ["standard_normal_logprob", "flow_logprob", "bits_per_dim"] },
          { type: "py_test", files: ["1-flow_logprob.py"], label: "change-of-variables log-density on a known linear flow",
            code: py`import numpy as np
from importlib import import_module
m = import_module('1-flow_logprob')
rng = np.random.default_rng(0)
z = rng.normal(size=(6, 3))
ref = (-0.5 * z**2 - 0.5 * np.log(2 * np.pi)).sum(1)
assert np.allclose(m.standard_normal_logprob(z), ref)
# x ~ N(0, diag(a^2)); flow z = x / a has log|det| = -sum log a
a = np.array([0.5, 2.0, 3.0])
x = rng.normal(size=(6, 3)) * a
zz = x / a
ld = np.full(6, -np.log(a).sum())
lp = np.asarray(m.flow_logprob(zz, ld))
true = (-0.5 * (x / a) ** 2 - np.log(a) - 0.5 * np.log(2 * np.pi)).sum(1)
assert np.allclose(lp, true)
assert abs(m.bits_per_dim(np.array([-10.0, -20.0]), 5) - 15.0 / (5 * np.log(2))) < 1e-12
print("ok")` },
        ],
      },
      {
        title: "Reading notes: NICE and RealNVP",
        type: "mandatory", kind: "written", points: 2,
        body: md`Write \`written/2-flow_papers.md\` (PDF, Markdown or LaTeX accepted), 1–2 pages:

1. NICE: additive coupling, why it is volume preserving, the diagonal scaling layer, the logistic prior.
2. RealNVP: affine coupling, checkerboard vs channel-wise masks, squeeze operation, multi-scale architecture, batch norm as a flow layer (its log-det).
3. A comparison table: NICE vs RealNVP vs your VAE (A31) vs PixelCNN (A30) — exact likelihood? fast sampling? latent space? dimension constraints?
4. One limitation of coupling flows that later work (Glow, autoregressive flows, continuous flows) addresses.`,
        deliverable: "repo",
        files: ["written/2-flow_papers.md"],
        rubric: "summary",
        criteria: [
          "Explains why additive coupling has unit Jacobian determinant and how NICE recovers scale",
          "Describes RealNVP masks, squeeze and multi-scale factor-out correctly",
          "Comparison table covers likelihood, sampling cost and latent structure for all four model families",
          "Names a concrete limitation (e.g. dimension preservation, expressivity per layer) and a follow-up method",
        ],
      },
      {
        title: "GAN losses with logits",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`3-gan_losses.py\` write numerically stable losses that take **raw discriminator logits** (never probabilities):

- \`def d_loss(real_logits, fake_logits):\` → scalar $-\mathbb E[\log D(x)] - \mathbb E[\log(1-D(G(z)))]$ (mean over each batch, then add).
- \`def g_loss_minimax(fake_logits):\` → scalar $\mathbb E[\log(1-D(G(z)))]$ (the saturating loss G minimizes).
- \`def g_loss_nonsaturating(fake_logits):\` → scalar $-\mathbb E[\log D(G(z))]$.
- \`def optimal_discriminator(p_data, p_g):\` → elementwise $p_\text{data}/(p_\text{data}+p_g)$.

All must stay finite for logits around $\pm 1000$. NumPy only.`,
        files: ["3-gan_losses.py"],
        checks: [
          { type: "defines", path: "3-gan_losses.py", names: ["d_loss", "g_loss_minimax", "g_loss_nonsaturating", "optimal_discriminator"] },
          { type: "not_contains", path: "3-gan_losses.py", pattern: "import torch", label: "NumPy only" },
          { type: "py_test", files: ["3-gan_losses.py"], label: "losses match BCE definitions and are stable",
            code: py`import numpy as np
from importlib import import_module
m = import_module('3-gan_losses')
rng = np.random.default_rng(0)
r = rng.normal(1, 2, 32); f = rng.normal(-1, 2, 32)
sig = lambda u: 1 / (1 + np.exp(-u))
assert np.isclose(m.d_loss(r, f), -np.log(sig(r)).mean() - np.log(1 - sig(f)).mean())
assert np.isclose(m.g_loss_minimax(f), np.log(1 - sig(f)).mean())
assert np.isclose(m.g_loss_nonsaturating(f), -np.log(sig(f)).mean())
big_r = np.array([1000.0, -1000.0]); big_f = np.array([-1000.0, 1000.0])
for v in (m.d_loss(big_r, big_f), m.g_loss_minimax(big_f), m.g_loss_nonsaturating(big_f)):
    assert np.isfinite(v), "not stable"
assert np.isclose(m.d_loss(big_r, big_f), 500.0 + 500.0)
assert np.isclose(m.g_loss_nonsaturating(np.array([-1000.0])), 1000.0)
assert np.isclose(m.g_loss_minimax(np.array([1000.0])), -1000.0)
pd = rng.random(10); pg = rng.random(10)
assert np.allclose(m.optimal_discriminator(pd, pg), pd / (pd + pg))
print("ok")` },
        ],
      },
      {
        title: "Train a small DCGAN",
        type: "mandatory", kind: "code", points: 3,
        body: md`In \`4-dcgan.py\` train a DCGAN (Radford et al. guidelines: strided convs, batch norm, ReLU/LeakyReLU, no FC hidden layers, Adam lr 2e-4, β₁ = 0.5) on MNIST or Fashion-MNIST at 28×28 (or 32×32).

- Use the non-saturating generator loss (via \`BCEWithLogitsLoss\`).
- Log D and G losses and $D(x)$, $D(G(z))$ every N steps; save \`gan_losses.png\`.
- Save \`gan_samples.png\` (8×8 grid from a fixed noise vector) at the end, plus a grid every few epochs to show progress.
- Write \`results.json\` with at least \`{"epochs": 20, "final_d_real": 0.7, "final_d_fake": 0.3}\` (means over the last epoch).

In the README describe one failure you hit (mode collapse, D overpowering G, …) and what fixed it.`,
        files: ["4-dcgan.py", "gan_samples.png", "gan_losses.png", "results.json"],
        checks: [
          { type: "contains", path: "4-dcgan.py", pattern: "ConvTranspose2d", label: "transposed-conv generator" },
          { type: "contains", path: "4-dcgan.py", pattern: "BatchNorm2d", label: "batch norm" },
          { type: "exists", path: "gan_samples.png" },
          { type: "exists", path: "gan_losses.png" },
          { type: "json_metric", path: "results.json", key: "epochs", op: ">=", value: 20 },
        ],
      },
      {
        title: "RealNVP on 2-D data",
        type: "advanced", kind: "code", points: 2,
        body: md`In \`100-realnvp_2d.py\` stack ≥ 6 affine coupling layers (alternating masks, MLP \`s\`/\`t\` nets) in PyTorch and fit two-moons data by maximum likelihood. Save \`flow_density.png\` (learned density heat-map + samples) and add \`"moons_test_logprob"\` (mean test log-density, nats) to \`results.json\`. Verify numerically that your PyTorch layer matches your NumPy \`coupling_forward\` on the same weights.`,
        files: ["100-realnvp_2d.py", "flow_density.png"],
        checks: [
          { type: "exists", path: "100-realnvp_2d.py" },
          { type: "contains", path: "100-realnvp_2d.py", pattern: "make_moons|moons", label: "two-moons data" },
          { type: "exists", path: "flow_density.png" },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A33
  {
    id: "A33",
    track: TRACK,
    phase: PHASE,
    title: "Diffusion Models: DDPM from Scratch",
    days: 4,
    repo: REPO,
    dir: "0x03-ddpm",
    sources: [
      { course: "CS236", lectures: "Lec 7–9", topics: "Energy-based models, score matching, score-based models, denoising diffusion models" },
      { course: "CME296", lectures: "Lec 1–2", topics: "Diffusion foundations: forward/reverse processes, DDPM training objective, sampling" },
    ],
    resources: [
      { title: "Ho, Jain & Abbeel 2020 — Denoising Diffusion Probabilistic Models", url: "https://arxiv.org/abs/2006.11239" },
      { title: "Song & Ermon 2019 — Generative Modeling by Estimating Gradients of the Data Distribution", url: "https://arxiv.org/abs/1907.05600" },
      { title: "Song et al. 2020 — Score-Based Generative Modeling through SDEs", url: "https://arxiv.org/abs/2011.13456" },
      { title: "Nichol & Dhariwal 2021 — Improved DDPM (cosine schedule)", url: "https://arxiv.org/abs/2102.09672" },
      { title: "Lilian Weng — What are Diffusion Models?", url: "https://lilianweng.github.io/posts/2021-07-11-diffusion-models/" },
      { title: "Heusel et al. 2017 — GANs trained by a two time-scale update rule (FID)", url: "https://arxiv.org/abs/1706.08500" },
    ],
    concepts: [
      "Forward noising process q(x_t | x_{t−1}) and noise schedules β_t",
      "Closed form q(x_t | x_0) = N(√ᾱ_t x_0, (1−ᾱ_t) I)",
      "Posterior q(x_{t−1} | x_t, x_0) mean and variance",
      "ε-prediction and the simplified loss L_simple",
      "Ancestral sampling",
      "Denoising score matching: ε_θ(x_t, t) ≈ −√(1−ᾱ_t) ∇ log q(x_t)",
      "Sample quality metrics (FID)",
    ],
    objectives: [
      "Derive q(x_t | x_0) from the single-step forward process",
      "Derive the posterior q(x_{t−1} | x_t, x_0) by completing the square",
      "Explain why predicting ε is equivalent (up to weighting) to predicting x_0 or the score",
      "Implement DDPM training and ancestral sampling from scratch and train it on MNIST",
      "Compare linear and cosine noise schedules",
      "Connect DDPM to denoising score matching and Langevin dynamics",
    ],
    requirements: [
      "NumPy only for tasks 0–3 (they are tested in the browser)",
      "PyTorch for the U-Net; no diffusers / denoising-diffusion-pytorch for the model or sampler",
      "Timesteps are 0-indexed: t ∈ {0, …, T−1}, betas[t] = β_{t+1} of the paper, and ᾱ_{−1} := 1",
    ],
    quiz: [
      { q: "Given α_t = 1 − β_t and ᾱ_t = Π_{s≤t} α_s, q(x_t | x_0) is…",
        options: ["N(ᾱ_t x_0, β_t I)", "N(√ᾱ_t x_0, (1 − ᾱ_t) I)", "N(x_0, ᾱ_t I)", "N(√α_t x_0, β_t I)"], answer: 1,
        why: "Composition of Gaussian steps; variances add after scaling." },
      { q: "L_simple trains ε_θ by…",
        options: ["maximizing the exact log-likelihood", "MSE between the true added noise ε and ε_θ(√ᾱ_t x_0 + √(1−ᾱ_t) ε, t) for random t", "adversarial training", "KL between two consecutive x_t"], answer: 1,
        why: "It is a reweighted ELBO; Ho et al. found the unweighted version gives better samples." },
      { q: "The trained noise predictor relates to the score by…",
        options: ["∇ log q(x_t) ≈ −ε_θ / √(1 − ᾱ_t)", "∇ log q(x_t) ≈ ε_θ", "∇ log q(x_t) ≈ −√ᾱ_t ε_θ", "no relation"], answer: 0,
        why: "Denoising score matching: the score of N(√ᾱ x_0, (1−ᾱ)I) at x_t is −ε/√(1−ᾱ)." },
      { q: "Why was the cosine schedule introduced?",
        options: ["It makes sampling 10× faster", "The linear schedule destroys information too quickly at low resolution, wasting late timesteps on near-pure noise", "It removes the need for a U-Net", "It makes the loss convex"], answer: 1,
        why: "Nichol & Dhariwal: ᾱ_t decays more gently with the cosine schedule." },
    ],
    tasks: [
      {
        title: "Noise schedules",
        type: "mandatory", kind: "code", points: 1,
        body: md`In \`0-schedules.py\` write

- \`def linear_beta_schedule(T, beta_start=1e-4, beta_end=0.02):\` → \`(T,)\`, evenly spaced (inclusive, like \`np.linspace\`).
- \`def cosine_beta_schedule(T, s=0.008):\` → \`(T,)\` (Nichol & Dhariwal): with $f(u) = \cos^2\!\big(\frac{u/T + s}{1+s}\cdot\frac\pi2\big)$ for $u = 0,\dots,T$, $\bar\alpha_u = f(u)/f(0)$, $\beta_t = 1 - \bar\alpha_{t+1}/\bar\alpha_t$, then clip to at most \`0.999\`.
- \`def alpha_bars(betas):\` → \`(T,)\`, $\bar\alpha_t = \prod_{s\le t}(1-\beta_s)$.

Also create \`README.md\` (≥ 150 words): forward process, training objective, sampling algorithm, results.

Plot $\bar\alpha_t$ for both schedules (T = 1000) into \`schedules.png\`.`,
        files: ["0-schedules.py", "README.md", "schedules.png"],
        checks: [
          { type: "defines", path: "0-schedules.py", names: ["linear_beta_schedule", "cosine_beta_schedule", "alpha_bars"] },
          { type: "readme", path: "README.md", minWords: 150 },
          { type: "exists", path: "schedules.png" },
          { type: "py_test", files: ["0-schedules.py"], label: "linear and cosine schedules match the papers",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-schedules')
b = np.asarray(m.linear_beta_schedule(1000))
assert b.shape == (1000,) and np.isclose(b[0], 1e-4) and np.isclose(b[-1], 0.02)
assert np.allclose(b, np.linspace(1e-4, 0.02, 1000))
T, s = 1000, 0.008
u = np.arange(T + 1)
f = np.cos((u / T + s) / (1 + s) * np.pi / 2) ** 2
ab = f / f[0]
ref = np.clip(1 - ab[1:] / ab[:-1], None, 0.999)
c = np.asarray(m.cosine_beta_schedule(T))
assert c.shape == (T,) and np.allclose(c, ref, rtol=1e-6, atol=1e-10)
assert c.max() <= 0.999 + 1e-12
a = np.asarray(m.alpha_bars(b))
assert np.allclose(a, np.cumprod(1 - b))
assert np.allclose(m.alpha_bars(c)[:-1], ab[1:-1], rtol=1e-6)
print("ok")` },
        ],
      },
      {
        title: "Forward process q(x_t | x_0) and the posterior",
        type: "mandatory", kind: "code", points: 3,
        body: md`In \`1-forward.py\` write (\`t\` is an integer array of shape \`(N,)\`, one timestep per example; \`x0\`, \`xt\`, \`noise\`, \`eps\` have shape \`(N, ...)\`, e.g. \`(N, 1, 28, 28)\`; broadcast per-example scalars over the trailing axes):

1. \`def q_sample(x0, t, alpha_bars, noise):\` → $x_t = \sqrt{\bar\alpha_t}\,x_0 + \sqrt{1-\bar\alpha_t}\,\varepsilon$.
2. \`def predict_x0_from_eps(xt, t, eps, alpha_bars):\` → $\hat x_0 = (x_t - \sqrt{1-\bar\alpha_t}\,\varepsilon)/\sqrt{\bar\alpha_t}$.
3. \`def q_posterior(x0, xt, t, betas):\` → \`(mean, var)\` of $q(x_{t-1}\mid x_t, x_0)$, \`mean\` shaped like \`xt\`, \`var\` shape \`(N,)\`:
   $$\tilde\mu_t = \frac{\sqrt{\bar\alpha_{t-1}}\,\beta_t}{1-\bar\alpha_t}x_0 + \frac{\sqrt{\alpha_t}(1-\bar\alpha_{t-1})}{1-\bar\alpha_t}x_t,\qquad \tilde\beta_t = \frac{1-\bar\alpha_{t-1}}{1-\bar\alpha_t}\beta_t$$
   with the convention $\bar\alpha_{-1} = 1$ (so at \`t = 0\` the variance is 0 and the mean is \`x0\`).

NumPy only, no Python loops over examples.`,
        files: ["1-forward.py"],
        checks: [
          { type: "defines", path: "1-forward.py", names: ["q_sample", "predict_x0_from_eps", "q_posterior"] },
          { type: "not_contains", path: "1-forward.py", pattern: "import torch", label: "NumPy only" },
          { type: "py_test", files: ["1-forward.py"], label: "q_sample, x0-prediction and posterior match Gaussian Bayes",
            code: py`import numpy as np
from importlib import import_module
m = import_module('1-forward')
rng = np.random.default_rng(0)
T = 50
betas = np.linspace(1e-3, 0.2, T)
alphas = 1 - betas
ab = np.cumprod(alphas)
N = 6
x0 = rng.normal(size=(N, 1, 3, 3)); eps = rng.normal(size=(N, 1, 3, 3))
t = np.array([0, 1, 7, 20, 33, 49])
xt = np.asarray(m.q_sample(x0, t, ab, eps))
s = lambda v: v[:, None, None, None]
assert xt.shape == x0.shape
assert np.allclose(xt, s(np.sqrt(ab[t])) * x0 + s(np.sqrt(1 - ab[t])) * eps)
x0h = np.asarray(m.predict_x0_from_eps(xt, t, eps, ab))
assert np.allclose(x0h, x0)
mean, var = m.q_posterior(x0, xt, t, betas)
mean = np.asarray(mean); var = np.asarray(var).reshape(N)
abp = np.concatenate([[1.0], ab[:-1]])[t]
for i in range(N):
    ti = t[i]
    if ti == 0:
        assert abs(var[i]) < 1e-12 and np.allclose(mean[i], x0[i])
        continue
    prec = 1 / (1 - abp[i]) + alphas[ti] / betas[ti]
    v = 1 / prec
    mu = v * (np.sqrt(abp[i]) * x0[i] / (1 - abp[i]) + np.sqrt(alphas[ti]) * xt[i] / betas[ti])
    assert np.isclose(var[i], v, rtol=1e-8), f"variance wrong at t={ti}"
    assert np.allclose(mean[i], mu, rtol=1e-7, atol=1e-10), f"mean wrong at t={ti}"
print("ok")` },
        ],
      },
      {
        title: "Ancestral sampling step",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`2-p_sample.py\` write \`def p_sample_step(xt, t, eps_pred, betas, noise):\` — one reverse step of DDPM (Algorithm 2 of Ho et al.) for a batch that shares the same **integer** timestep \`t\`:
$$x_{t-1} = \frac{1}{\sqrt{\alpha_t}}\Big(x_t - \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\,\varepsilon_\theta\Big) + \sigma_t z,\qquad \sigma_t^2 = \beta_t,$$
with **no noise added when \`t == 0\`** (\`noise\` is ignored then). Compute $\bar\alpha_t$ from \`betas\` inside the function. NumPy only.

In the README, explain the two choices $\sigma_t^2 = \beta_t$ vs $\sigma_t^2 = \tilde\beta_t$ from the paper.`,
        files: ["2-p_sample.py"],
        checks: [
          { type: "defines", path: "2-p_sample.py", names: ["p_sample_step"] },
          { type: "py_test", files: ["2-p_sample.py"], label: "reverse step matches Algorithm 2 (no noise at t = 0)",
            code: py`import numpy as np
from importlib import import_module
m = import_module('2-p_sample')
rng = np.random.default_rng(0)
T = 100
betas = np.linspace(1e-4, 0.02, T)
ab = np.cumprod(1 - betas)
xt = rng.normal(size=(4, 1, 5, 5)); ep = rng.normal(size=xt.shape); z = rng.normal(size=xt.shape)
for t in (99, 42, 1):
    ref = (xt - betas[t] / np.sqrt(1 - ab[t]) * ep) / np.sqrt(1 - betas[t]) + np.sqrt(betas[t]) * z
    out = np.asarray(m.p_sample_step(xt, t, ep, betas, z))
    assert out.shape == xt.shape and np.allclose(out, ref), f"wrong at t={t}"
ref0 = (xt - betas[0] / np.sqrt(1 - ab[0]) * ep) / np.sqrt(1 - betas[0])
assert np.allclose(m.p_sample_step(xt, 0, ep, betas, z), ref0), "t=0 must not add noise"
print("ok")` },
        ],
      },
      {
        title: "Train DDPM on MNIST",
        type: "mandatory", kind: "code", points: 4,
        body: md`In \`3-ddpm.py\` implement DDPM end-to-end in PyTorch:

- A small U-Net (≥ 2 resolutions, residual blocks, sinusoidal timestep embedding added in every block; self-attention at 7×7 optional). Write it yourself — **no \`diffusers\`, no \`denoising_diffusion_pytorch\`**.
- Linear schedule, $T = 1000$, data scaled to $[-1, 1]$, loss $L_\text{simple} = \|\varepsilon - \varepsilon_\theta(x_t, t)\|^2$ with uniformly sampled \`t\`. EMA of weights (decay 0.999) recommended.
- Port your NumPy formulas (\`q_sample\`, \`p_sample_step\`) to torch; sample 64 images with the full 1000-step ancestral sampler and save \`samples.png\` (8×8 grid) and \`denoising.png\` (one chain shown at ~10 timesteps).
- Write \`results.json\`:

~~~json
{"num_timesteps": 1000, "final_train_loss": 0.031, "train_steps": 40000, "sampling_seconds_64": 95.2}
~~~

**Targets:** \`num_timesteps >= 1000\`, \`final_train_loss <= 0.05\` (mean over the last 1 000 steps).`,
        files: ["3-ddpm.py", "results.json", "samples.png", "denoising.png"],
        checks: [
          { type: "contains", path: "3-ddpm.py", pattern: "import torch", label: "uses PyTorch" },
          { type: "not_contains", path: "3-ddpm.py", pattern: "diffusers|denoising_diffusion_pytorch", label: "no diffusion libraries" },
          { type: "contains", path: "3-ddpm.py", pattern: "sin|cos", label: "sinusoidal time embedding" },
          { type: "json_metric", path: "results.json", key: "num_timesteps", op: ">=", value: 1000 },
          { type: "json_metric", path: "results.json", key: "final_train_loss", op: "<=", value: 0.05 },
          { type: "exists", path: "samples.png" },
        ],
      },
      {
        title: "From DDPM to score matching",
        type: "mandatory", kind: "written", points: 2,
        body: md`In \`written/4-diffusion_derivations.pdf\` (PDF, Markdown or LaTeX accepted):

1. Derive $q(x_t|x_0)$ from $q(x_t|x_{t-1}) = \mathcal N(\sqrt{\alpha_t}x_{t-1}, \beta_t I)$ by induction.
2. Derive $\tilde\mu_t$ and $\tilde\beta_t$ of $q(x_{t-1}|x_t,x_0)$ by completing the square, then rewrite $\tilde\mu_t$ in terms of $x_t$ and $\varepsilon$.
3. Show how the ELBO's $L_{t-1}$ term reduces (up to a weight) to $\|\varepsilon - \varepsilon_\theta\|^2$, and state the weight that $L_\text{simple}$ drops.
4. Show $\nabla_{x_t}\log q(x_t|x_0) = -\varepsilon/\sqrt{1-\bar\alpha_t}$ and explain why minimizing $L_\text{simple}$ is denoising score matching (Vincent 2011; Song & Ermon 2019).
5. Compare linear vs cosine schedule using your \`schedules.png\` and your samples.`,
        deliverable: "repo",
        files: ["written/4-diffusion_derivations.pdf"],
        rubric: "derivation",
        criteria: [
          "q(x_t|x_0) derived with variance bookkeeping, not quoted",
          "Posterior mean and variance obtained by completing the square, matching the paper",
          "Reduction of L_{t−1} to ε-MSE with the explicit dropped weight β_t² / (2σ_t² α_t (1−ᾱ_t))",
          "Score identity derived and the link to denoising score matching / Langevin sampling explained",
          "Schedule comparison references own plots or samples",
        ],
      },
      {
        title: "FID of your samples",
        type: "advanced", kind: "code", points: 2,
        body: md`In \`100-fid.py\` generate 10 000 samples and compute FID against the MNIST test set (\`pytorch-fid\` or \`torchmetrics\` is allowed here; replicate grayscale to 3 channels and resize as the library requires). Add \`"fid"\` to \`results.json\`. **Target:** \`fid <= 30\`. Report the FID of 10 000 *training* images vs the test set as a floor.`,
        files: ["100-fid.py"],
        checks: [
          { type: "exists", path: "100-fid.py" },
          { type: "contains", path: "100-fid.py", pattern: "fid|FID|FrechetInceptionDistance", label: "computes FID" },
          { type: "json_metric", path: "results.json", key: "fid", op: "<=", value: 30 },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A34
  {
    id: "A34",
    track: TRACK,
    phase: PHASE,
    title: "Latent Diffusion & Guidance",
    days: 2,
    repo: REPO,
    dir: "0x04-latent_diffusion",
    sources: [
      { course: "CME296", lectures: "Lec 3–5", topics: "Guidance (classifier and classifier-free), fast samplers (DDIM), latent diffusion & large vision models" },
    ],
    resources: [
      { title: "Ho & Salimans 2022 — Classifier-Free Diffusion Guidance", url: "https://arxiv.org/abs/2207.12598" },
      { title: "Song, Meng & Ermon 2020 — Denoising Diffusion Implicit Models (DDIM)", url: "https://arxiv.org/abs/2010.02502" },
      { title: "Rombach et al. 2021 — High-Resolution Image Synthesis with Latent Diffusion Models", url: "https://arxiv.org/abs/2112.10752" },
      { title: "Dhariwal & Nichol 2021 — Diffusion Models Beat GANs on Image Synthesis (classifier guidance)", url: "https://arxiv.org/abs/2105.05233" },
      { title: "Hugging Face diffusers documentation", url: "https://huggingface.co/docs/diffusers/index" },
    ],
    concepts: [
      "Classifier guidance vs classifier-free guidance",
      "Guidance scale and the diversity–fidelity trade-off",
      "Condition dropout during training (null token)",
      "DDIM: non-Markovian forward process, deterministic sampling (η = 0)",
      "Latent diffusion: autoencoder compression + diffusion in latent space",
      "Cross-attention text conditioning",
    ],
    objectives: [
      "Write the classifier-free guidance formula and explain it as sampling from p(x) p(c|x)^w",
      "Implement one DDIM update for any η and explain why η = 0 is deterministic",
      "Explain why latent diffusion is cheaper than pixel diffusion and what the VAE's downsampling factor trades off",
      "Run a pretrained latent diffusion model and measure the effect of guidance scale and number of steps",
    ],
    requirements: [
      "NumPy only for tasks 0–1",
      "diffusers + a pretrained latent diffusion checkpoint (Colab GPU is fine) for task 2",
    ],
    quiz: [
      { q: "Classifier-free guidance with scale w computes ε̂ = …",
        options: ["ε(x, c)", "ε(x, ∅) + w (ε(x, c) − ε(x, ∅))", "w ε(x, c)", "(ε(x, c) + ε(x, ∅)) / 2"], answer: 1,
        why: "w = 1 recovers the conditional model; w > 1 extrapolates away from the unconditional prediction." },
      { q: "How is a single network trained to give both ε(x, c) and ε(x, ∅)?",
        options: ["Two separate training runs", "Randomly replacing the condition by a null token with probability ~10–20% during training", "Using a pretrained classifier", "It cannot"], answer: 1,
        why: "Condition dropout makes the model learn the unconditional score too." },
      { q: "DDIM with η = 0…",
        options: ["is stochastic like DDPM", "is a deterministic map from x_T to x_0 and works with the same trained ε-model", "requires retraining with a new loss", "only works for T = 50"], answer: 1,
        why: "DDIM shares DDPM's marginals q(x_t|x_0), so any ε-model trained with L_simple can be used." },
      { q: "The main computational win of latent diffusion is…",
        options: ["fewer parameters in the VAE", "running the U-Net on a spatially downsampled latent (e.g. 64×64×4 instead of 512×512×3)", "no need for noise", "using GAN losses"], answer: 1,
        why: "Compute scales with the spatial size the denoiser operates on." },
    ],
    tasks: [
      {
        title: "Classifier-free guidance",
        type: "mandatory", kind: "code", points: 1,
        body: md`In \`0-cfg.py\` write

- \`def cfg_noise(eps_uncond, eps_cond, guidance_scale):\` → $\hat\varepsilon = \varepsilon_\varnothing + w(\varepsilon_c - \varepsilon_\varnothing)$ (diffusers convention: \`w = 1\` is plain conditional, \`w = 0\` unconditional).
- \`def drop_condition(labels, drop_mask, null_label):\` → copy of integer \`labels\` \`(N,)\` with entries where boolean \`drop_mask\` is True replaced by \`null_label\` (must not modify the input array).

Also create \`README.md\` (≥ 100 words): guidance, DDIM, latent diffusion in your own words, and your experiment results.`,
        files: ["0-cfg.py", "README.md"],
        checks: [
          { type: "defines", path: "0-cfg.py", names: ["cfg_noise", "drop_condition"] },
          { type: "readme", path: "README.md", minWords: 100 },
          { type: "py_test", files: ["0-cfg.py"], label: "guidance formula and condition dropout",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-cfg')
rng = np.random.default_rng(0)
eu = rng.normal(size=(3, 4, 8, 8)); ec = rng.normal(size=(3, 4, 8, 8))
for w in (0.0, 1.0, 3.0, 7.5):
    assert np.allclose(m.cfg_noise(eu, ec, w), eu + w * (ec - eu))
assert np.allclose(m.cfg_noise(eu, ec, 1.0), ec)
labels = np.array([3, 1, 4, 1, 5])
mask = np.array([True, False, False, True, False])
out = np.asarray(m.drop_condition(labels, mask, 10))
assert np.array_equal(out, [10, 1, 4, 10, 5])
assert np.array_equal(labels, [3, 1, 4, 1, 5]), "input must not be modified"
print("ok")` },
        ],
      },
      {
        title: "DDIM sampler step",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`1-ddim.py\` write

1. \`def ddim_timesteps(T, num_steps):\` → descending int array: \`np.arange(num_steps) * (T // num_steps)\` reversed (e.g. \`T=1000, num_steps=4\` → \`[750, 500, 250, 0]\`).
2. \`def ddim_step(xt, eps, alpha_bar_t, alpha_bar_prev, eta=0.0, noise=None):\` → $x_{t_\text{prev}}$ (Song et al., Eq. 12):
   $$\hat x_0 = \frac{x_t - \sqrt{1-\bar\alpha_t}\,\varepsilon}{\sqrt{\bar\alpha_t}},\quad \sigma = \eta\sqrt{\frac{1-\bar\alpha_\text{prev}}{1-\bar\alpha_t}}\sqrt{1-\frac{\bar\alpha_t}{\bar\alpha_\text{prev}}},$$
   $$x_\text{prev} = \sqrt{\bar\alpha_\text{prev}}\,\hat x_0 + \sqrt{1-\bar\alpha_\text{prev}-\sigma^2}\,\varepsilon + \sigma z.$$
   \`alpha_bar_t\`, \`alpha_bar_prev\` are floats (use \`alpha_bar_prev = 1.0\` for the last step). When \`eta == 0\` the result must not depend on \`noise\` (which may be \`None\`).

NumPy only.`,
        files: ["1-ddim.py"],
        checks: [
          { type: "defines", path: "1-ddim.py", names: ["ddim_timesteps", "ddim_step"] },
          { type: "py_test", files: ["1-ddim.py"], label: "DDIM update for η = 0 and η = 1",
            code: py`import numpy as np
from importlib import import_module
m = import_module('1-ddim')
assert np.array_equal(np.asarray(m.ddim_timesteps(1000, 4)), [750, 500, 250, 0])
assert np.array_equal(np.asarray(m.ddim_timesteps(1000, 50))[:3], [980, 960, 940])
rng = np.random.default_rng(0)
x0 = rng.normal(size=(2, 3, 4, 4)); e = rng.normal(size=x0.shape); z = rng.normal(size=x0.shape)
a_t, a_p = 0.3, 0.7
xt = np.sqrt(a_t) * x0 + np.sqrt(1 - a_t) * e
out = np.asarray(m.ddim_step(xt, e, a_t, a_p, eta=0.0))
assert np.allclose(out, np.sqrt(a_p) * x0 + np.sqrt(1 - a_p) * e), "eta=0 must follow the deterministic DDIM path"
x0h = (xt - np.sqrt(1 - a_t) * e) / np.sqrt(a_t)
sig = np.sqrt((1 - a_p) / (1 - a_t)) * np.sqrt(1 - a_t / a_p)
ref = np.sqrt(a_p) * x0h + np.sqrt(1 - a_p - sig**2) * e + sig * z
assert np.allclose(m.ddim_step(xt, e, a_t, a_p, eta=1.0, noise=z), ref)
last = np.asarray(m.ddim_step(xt, e, a_t, 1.0, eta=0.0))
assert np.allclose(last, x0), "final step with alpha_bar_prev=1 must return x0_hat"
print("ok")` },
        ],
      },
      {
        title: "Experiment with a pretrained latent diffusion model",
        type: "mandatory", kind: "code", points: 3,
        body: md`In \`2-latent_diffusion.ipynb\` (executed, outputs saved) use \`diffusers\` with a pretrained latent diffusion checkpoint (e.g. a Stable Diffusion 1.x/2.x or SD-Turbo model that fits a Colab T4):

1. Encode a real image with the pipeline's VAE, decode it back, and report the latent shape and the downsampling factor; measure reconstruction PSNR.
2. Fix a prompt and seed; sweep guidance scale $w \in \{1, 3, 7.5, 12\}$ × DDIM steps $\in \{10, 25, 50\}$ (swap in \`DDIMScheduler\`); save the grid as \`guidance_grid.png\`.
3. **Write your own denoising loop** (UNet → your \`cfg_noise\` → your \`ddim_step\` ported to torch) instead of calling \`pipe(...)\`, and show it reproduces the pipeline's output for the same seed (report max abs pixel difference).
4. Time each configuration and save \`results.json\` with \`{"latent_downsample_factor": 8, "own_loop_max_abs_diff": 0.01, "seconds_50_steps": 6.1}\`.`,
        files: ["2-latent_diffusion.ipynb", "guidance_grid.png", "results.json"],
        checks: [
          { type: "notebook_executed", path: "2-latent_diffusion.ipynb" },
          { type: "contains", path: "2-latent_diffusion.ipynb", pattern: "diffusers", label: "uses diffusers" },
          { type: "contains", path: "2-latent_diffusion.ipynb", pattern: "DDIMScheduler", label: "DDIM scheduler" },
          { type: "exists", path: "guidance_grid.png" },
          { type: "json_metric", path: "results.json", key: "latent_downsample_factor", op: ">=", value: 4 },
          { type: "json_metric", path: "results.json", key: "own_loop_max_abs_diff", op: "<=", value: 0.05 },
        ],
      },
      {
        title: "Report: guidance and steps",
        type: "mandatory", kind: "written", points: 1,
        body: md`\`written/3-guidance_report.md\` (PDF, Markdown or LaTeX accepted), 1 page: what happens to fidelity, diversity and saturation as $w$ grows; how few DDIM steps you can use before quality collapses; why CFG doubles the per-step cost; and the probabilistic interpretation $\tilde p(x|c) \propto p(x)\,p(c|x)^{w}$.`,
        deliverable: "repo",
        files: ["written/3-guidance_report.md"],
        rubric: "report",
        criteria: [
          "Describes observed effects of guidance scale with references to the grid",
          "States the step count where quality degrades, with timings",
          "Explains the 2× cost (conditional + unconditional forward) and the batching trick",
          "Derives or explains p(x) p(c|x)^w from the CFG formula via Bayes on scores",
        ],
      },
      {
        title: "Class-conditional MNIST diffusion with CFG",
        type: "advanced", kind: "code", points: 2,
        body: md`Extend your A33 U-Net with a label embedding (11 classes: 10 digits + null), train with 15% condition dropout, and sample each digit with $w \in \{0, 1, 3, 5\}$. Score samples with a pretrained MNIST classifier you train yourself; add \`"cfg_w3_classifier_acc"\` to \`results.json\` (**target ≥ 0.95**). File: \`100-cfg_mnist.py\`.`,
        files: ["100-cfg_mnist.py"],
        checks: [
          { type: "exists", path: "100-cfg_mnist.py" },
          { type: "contains", path: "100-cfg_mnist.py", pattern: "Embedding", label: "label embedding" },
          { type: "json_metric", path: "results.json", key: "cfg_w3_classifier_acc", op: ">=", value: 0.95 },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A35
  {
    id: "A35",
    track: TRACK,
    phase: PHASE,
    title: "Tabular RL: Policy Iteration, MC, TD & Q-learning",
    days: 3,
    repo: REPO,
    dir: "0x05-tabular_rl",
    sources: [
      { course: "CS234", lectures: "Lec 1–2", topics: "Introduction, Markov decision processes, policy evaluation, value iteration and policy iteration" },
      { course: "CS234", lectures: "Lec 3–4", topics: "Model-free policy evaluation (Monte Carlo, TD(0)), model-free control: SARSA, Q-learning, ε-greedy exploration" },
    ],
    resources: [
      { title: "Sutton & Barto — Reinforcement Learning: An Introduction (2nd ed.), Ch. 3–6", url: "http://incompleteideas.net/book/the-book-2nd.html" },
      { title: "CS234 course site (Stanford)", url: "https://web.stanford.edu/class/cs234/" },
      { title: "Gymnasium — CliffWalking environment", url: "https://gymnasium.farama.org/environments/toy_text/cliff_walking/" },
      { title: "OpenAI Spinning Up — Key concepts in RL", url: "https://spinningup.openai.com/en/latest/spinningup/rl_intro.html" },
    ],
    concepts: [
      "MDP (S, A, P, R, γ); Bellman expectation and optimality equations",
      "Policy evaluation, policy improvement theorem, policy iteration",
      "Monte Carlo vs temporal-difference (TD(0)) prediction; bias–variance",
      "On-policy (SARSA) vs off-policy (Q-learning) control",
      "ε-greedy exploration",
      "Sample efficiency of model-based vs model-free methods",
    ],
    objectives: [
      "Write the Bellman expectation equation in matrix form and solve it exactly",
      "Implement policy iteration and explain why it terminates in finitely many iterations",
      "Implement an environment's step function and its transition model consistently",
      "Implement Q-learning and SARSA and explain why they learn different paths on CliffWalking",
      "Compare value iteration (Phase 1) and policy iteration in iterations and sweeps",
    ],
    requirements: [
      "NumPy only for every file (no gymnasium import in tested files)",
      "Use the given seed argument for all randomness (np.random.default_rng(seed))",
    ],
    quiz: [
      { q: "For a fixed policy π, V^π satisfies V = R_π + γ P_π V. Its exact solution is…",
        options: ["V = R_π / (1 − γ)", "V = (I − γ P_π)^{-1} R_π", "V = P_π R_π", "V = max_a Q(·, a)"], answer: 1,
        why: "Linear system, invertible for γ < 1." },
      { q: "On CliffWalking with ε-greedy (ε = 0.1), which path does SARSA's greedy policy typically take?",
        options: ["The optimal path along the cliff edge", "A safer path further from the cliff", "It never reaches the goal", "The same as Q-learning"], answer: 1,
        why: "SARSA evaluates the ε-greedy behaviour policy, which occasionally steps into the cliff near the edge." },
      { q: "Q-learning is off-policy because…",
        options: ["it uses a replay buffer", "its target uses max_a' Q(s', a') regardless of the action actually taken next", "it uses Monte Carlo returns", "it needs a model"], answer: 1,
        why: "It learns Q* while following an exploratory behaviour policy." },
      { q: "TD(0) compared with Monte Carlo prediction has…",
        options: ["higher variance, no bias", "lower variance but bootstrapping bias", "both higher variance and higher bias", "identical estimates"], answer: 1,
        why: "TD targets depend on one reward plus the current estimate." },
    ],
    tasks: [
      {
        title: "Exact and iterative policy evaluation",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`0-policy_evaluation.py\` write \`def policy_evaluation(P, R, policy, gamma, theta=1e-10):\`

- \`P\`: \`(S, A, S)\` transition probabilities; \`R\`: \`(S, A)\` expected rewards; \`policy\`: \`(S, A)\` stochastic policy (rows sum to 1).
- Return \`V\` \`(S,)\` with $V = R_\pi + \gamma P_\pi V$, computed by **iterative** synchronous sweeps until $\max|V_{k+1}-V_k| < \theta$ (no \`np.linalg.solve\` inside this function).

Also create \`README.md\` (≥ 120 words) describing the MDP notation and every file.`,
        files: ["0-policy_evaluation.py", "README.md"],
        checks: [
          { type: "defines", path: "0-policy_evaluation.py", names: ["policy_evaluation"] },
          { type: "not_contains", path: "0-policy_evaluation.py", pattern: "linalg\\.(solve|inv)", label: "iterative, not a linear solve" },
          { type: "readme", path: "README.md", minWords: 120 },
          { type: "py_test", files: ["0-policy_evaluation.py"], label: "matches (I − γP_π)^{-1} R_π",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-policy_evaluation')
rng = np.random.default_rng(0)
S, A = 8, 3
P = rng.random((S, A, S)); P /= P.sum(2, keepdims=True)
R = rng.normal(size=(S, A))
pi = rng.random((S, A)); pi /= pi.sum(1, keepdims=True)
for g in (0.5, 0.9):
    Pp = np.einsum('sa,sat->st', pi, P); Rp = (pi * R).sum(1)
    ref = np.linalg.solve(np.eye(S) - g * Pp, Rp)
    V = np.asarray(m.policy_evaluation(P, R, pi, g))
    assert V.shape == (S,) and np.allclose(V, ref, atol=1e-7), f"gamma={g}"
print("ok")` },
        ],
      },
      {
        title: "Policy iteration",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`1-policy_iteration.py\` write \`def policy_iteration(P, R, gamma, max_iter=1000):\` → \`(policy, V, n_iter)\`

- Start from the policy that always takes action 0; alternate full policy evaluation (reuse your \`policy_evaluation\` via \`importlib\`) and greedy improvement; stop when the policy is stable.
- \`policy\`: int array \`(S,)\` (deterministic); \`V\`: \`(S,)\` value of that policy; \`n_iter\`: number of improvement steps performed.
- Break ties in the greedy step toward the **current** action to guarantee termination.`,
        files: ["1-policy_iteration.py"],
        checks: [
          { type: "defines", path: "1-policy_iteration.py", names: ["policy_iteration"] },
          { type: "py_test", files: ["1-policy_iteration.py", "0-policy_evaluation.py"], label: "reaches V* and a greedy-optimal policy",
            code: py`import numpy as np
from importlib import import_module
m = import_module('1-policy_iteration')
rng = np.random.default_rng(1)
S, A, g = 12, 4, 0.9
P = rng.random((S, A, S)) ** 3; P /= P.sum(2, keepdims=True)
R = rng.normal(size=(S, A))
V = np.zeros(S)
for _ in range(5000):
    V = (R + g * P @ V).max(1)
pol, Vp, n = m.policy_iteration(P, R, g)
pol = np.asarray(pol).astype(int); Vp = np.asarray(Vp)
assert pol.shape == (S,)
assert np.allclose(Vp, V, atol=1e-6), "V is not optimal"
Q = R + g * P @ V
assert np.all(Q[np.arange(S), pol] >= Q.max(1) - 1e-6), "policy is not greedy w.r.t. V*"
assert 1 <= int(n) <= 50
print("ok")` },
        ],
      },
      {
        title: "CliffWalking environment in NumPy",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`2-cliff_walking.py\` implement Sutton & Barto's Example 6.6 (same layout as Gymnasium's \`CliffWalking-v0\`):

- 4×12 grid, state \`s = row * 12 + col\`; start 36 = (3, 0); goal 47 = (3, 11); cliff = 37…46.
- Actions: 0 = up, 1 = right, 2 = down, 3 = left. Moves off the grid leave the agent in place.
- Every step gives reward −1, except stepping into the cliff: reward −100 and the agent is sent back to 36 (**episode does not end**). Reaching 47 ends the episode (reward −1).

Write \`class CliffWalking\` with attributes \`n_states = 48\`, \`n_actions = 4\`, methods \`reset() -> int\` (returns 36) and \`step(action) -> (next_state, reward, done)\`; and \`def cliff_walking_model():\` → \`(P, R)\` with \`P\` \`(48, 4, 48)\` and \`R\` \`(48, 4)\` describing the same dynamics, where the goal is absorbing with reward 0 (\`P[47, a, 47] = 1\`, \`R[47, a] = 0\`).`,
        files: ["2-cliff_walking.py"],
        checks: [
          { type: "defines", path: "2-cliff_walking.py", names: ["CliffWalking", "cliff_walking_model"] },
          { type: "not_contains", path: "2-cliff_walking.py", pattern: "gymnasium|import gym", label: "no gym dependency" },
          { type: "py_test", files: ["2-cliff_walking.py"], label: "dynamics and model agree with Example 6.6",
            code: py`import numpy as np
from importlib import import_module
m = import_module('2-cliff_walking')
env = m.CliffWalking()
assert env.n_states == 48 and env.n_actions == 4
assert env.reset() == 36
env.reset()
s, r, d = env.step(1)
assert (int(s), float(r), bool(d)) == (36, -100.0, False), "stepping right from start enters the cliff"
env.reset()
s, r, d = env.step(3); assert (int(s), float(r), bool(d)) == (36, -1.0, False)
s, r, d = env.step(0); assert (int(s), float(r)) == (24, -1.0)
for _ in range(11):
    s, r, d = env.step(1)
assert int(s) == 35
s, r, d = env.step(2); assert (int(s), float(r), bool(d)) == (47, -1.0, True)
P, R = m.cliff_walking_model()
P = np.asarray(P); R = np.asarray(R)
assert P.shape == (48, 4, 48) and R.shape == (48, 4)
assert np.allclose(P.sum(2), 1)
assert P[36, 1, 36] == 1 and R[36, 1] == -100
assert P[35, 2, 47] == 1 and R[35, 2] == -1
assert np.all(P[47, :, 47] == 1) and np.all(R[47] == 0)
assert P[0, 0, 0] == 1 and P[11, 1, 11] == 1
print("ok")` },
        ],
      },
      {
        title: "Q-learning and SARSA on CliffWalking",
        type: "mandatory", kind: "code", points: 3,
        body: md`In \`3-td_control.py\` write

~~~python
def q_learning(env, n_episodes, alpha=0.5, gamma=1.0, epsilon=0.1, seed=0):  # -> (Q, episode_returns)
def sarsa(env, n_episodes, alpha=0.5, gamma=1.0, epsilon=0.1, seed=0):       # -> (Q, episode_returns)
~~~

- \`Q\`: \`(n_states, n_actions)\`; \`episode_returns\`: \`(n_episodes,)\`, the undiscounted sum of rewards collected (while exploring) in each training episode.
- \`env\` follows the \`CliffWalking\` interface (\`reset\`, \`step\`, \`n_states\`, \`n_actions\`). Q starts at zeros. ε-greedy behaviour with \`rng = np.random.default_rng(seed)\`; terminal transitions bootstrap with 0.
- Q-learning target: $r + \gamma\max_{a'}Q(s',a')$; SARSA target: $r + \gamma Q(s', a')$ with $a'$ the next ε-greedy action actually taken.
- Also write \`def greedy_rollout(env, Q, max_steps=100):\` → \`(n_steps, total_reward, reached_goal)\` following $\arg\max_a Q$ (ties → lowest index).

The check trains each method for 500 episodes on 3 seeds: Q-learning's greedy policy must walk the optimal 13-step path, and SARSA's **online** return (mean of the last 200 episodes) must beat Q-learning's — the classic on-policy vs off-policy result. Plot the sum of rewards per episode for both (smoothed, 10 seeds) into \`cliff_rewards.png\` — reproduce Figure 6.4 of Sutton & Barto.`,
        files: ["3-td_control.py", "cliff_rewards.png"],
        checks: [
          { type: "defines", path: "3-td_control.py", names: ["q_learning", "sarsa", "greedy_rollout"] },
          { type: "exists", path: "cliff_rewards.png" },
          { type: "py_test", files: ["3-td_control.py", "2-cliff_walking.py"], label: "Q-learning finds the cliff-edge path; SARSA earns more online reward",
            code: py`import numpy as np
from importlib import import_module
cw = import_module('2-cliff_walking'); m = import_module('3-td_control')
okq = 0; q_on = []; s_on = []
for seed in range(3):
    Q, rq = m.q_learning(cw.CliffWalking(), 500, alpha=0.5, gamma=1.0, epsilon=0.1, seed=seed)
    Q = np.asarray(Q); rq = np.asarray(rq, dtype=float)
    assert Q.shape == (48, 4) and rq.shape == (500,)
    n, tot, goal = m.greedy_rollout(cw.CliffWalking(), Q)
    okq += bool(goal) and int(n) == 13 and float(tot) == -13.0
    Qs, rs = m.sarsa(cw.CliffWalking(), 500, alpha=0.5, gamma=1.0, epsilon=0.1, seed=seed)
    rs = np.asarray(rs, dtype=float)
    assert np.asarray(Qs).shape == (48, 4) and rs.shape == (500,)
    q_on.append(rq[-200:].mean()); s_on.append(rs[-200:].mean())
assert okq >= 2, f"Q-learning greedy path optimal in only {okq}/3 seeds"
assert np.mean(s_on) > np.mean(q_on) + 5, f"SARSA online return {np.mean(s_on):.1f} should beat Q-learning {np.mean(q_on):.1f}"
assert np.mean(s_on) > -40, f"SARSA online return too low: {np.mean(s_on):.1f}"
print("ok")` },
        ],
      },
      {
        title: "Report: policy iteration vs value iteration vs model-free",
        type: "mandatory", kind: "written", points: 2,
        body: md`\`written/4-tabular_report.md\` (PDF, Markdown or LaTeX accepted):

1. Run your Phase 1 value iteration and your policy iteration on \`cliff_walking_model()\` with $\gamma = 0.99$ (and on the Phase 1 gridworld). Table: iterations, total Bellman backups (sweeps × |S| × |A|), wall time, final $\max|V - V^*|$.
2. Sample efficiency: how many environment transitions did Q-learning need to find the optimal path vs the zero transitions a model-based planner needs (given the model)? Discuss what the model costs in practice.
3. Explain, with your \`cliff_rewards.png\`, why SARSA gets a higher online return but Q-learning learns the optimal greedy path. What happens as ε → 0?`,
        deliverable: "repo",
        files: ["written/4-tabular_report.md"],
        rubric: "report",
        criteria: [
          "Table comparing value iteration and policy iteration iterations, backups and time on at least one MDP",
          "Quantifies Q-learning's sample count and contrasts it with model-based planning",
          "Explains the on-policy vs off-policy difference using the reward curves",
          "Discusses the ε → 0 limit (both converge to the optimal policy under GLIE)",
        ],
      },
      {
        title: "Expected SARSA and n-step TD",
        type: "advanced", kind: "code", points: 2,
        body: md`In \`100-expected_sarsa.py\` implement \`expected_sarsa(env, n_episodes, alpha, gamma, epsilon, seed)\` and \`n_step_sarsa(env, n_episodes, n, alpha, gamma, epsilon, seed)\`. Reproduce the interim/asymptotic performance comparison of Sutton & Barto Fig. 6.3 over $\alpha \in \{0.1, …, 1.0\}$ and save \`expected_sarsa.png\`.`,
        files: ["100-expected_sarsa.py", "expected_sarsa.png"],
        checks: [
          { type: "defines", path: "100-expected_sarsa.py", names: ["expected_sarsa", "n_step_sarsa"] },
          { type: "exists", path: "expected_sarsa.png" },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A36
  {
    id: "A36",
    track: TRACK,
    phase: PHASE,
    title: "Deep Q-Networks",
    days: 3,
    repo: REPO,
    dir: "0x06-dqn",
    sources: [
      { course: "CS234", lectures: "Lec 5–7", topics: "Value function approximation, the deadly triad, DQN (experience replay, target networks), Double DQN, dueling networks" },
    ],
    resources: [
      { title: "Mnih et al. 2013 — Playing Atari with Deep Reinforcement Learning", url: "https://arxiv.org/abs/1312.5602" },
      { title: "van Hasselt, Guez & Silver 2015 — Deep RL with Double Q-learning", url: "https://arxiv.org/abs/1509.06461" },
      { title: "Wang et al. 2015 — Dueling Network Architectures", url: "https://arxiv.org/abs/1511.06581" },
      { title: "Sutton & Barto — RL: An Introduction, Ch. 9–11 (function approximation)", url: "http://incompleteideas.net/book/the-book-2nd.html" },
      { title: "Gymnasium — CartPole-v1", url: "https://gymnasium.farama.org/environments/classic_control/cart_pole/" },
    ],
    concepts: [
      "Q-function approximation and semi-gradient TD",
      "The deadly triad: function approximation + bootstrapping + off-policy",
      "Experience replay (decorrelation, data reuse)",
      "Target networks",
      "Maximization bias and Double DQN",
      "Huber loss and reward clipping",
    ],
    objectives: [
      "Explain why naive Q-learning with a neural network diverges and how replay + target networks help",
      "Implement a circular replay buffer and DQN / Double-DQN targets",
      "Train DQN to solve CartPole-v1 (mean return ≥ 475 over 100 evaluation episodes)",
      "Explain maximization bias with a concrete example",
      "Run ablations and interpret learning curves across seeds",
    ],
    requirements: [
      "NumPy only for tasks 0–1",
      "PyTorch + gymnasium for training (CPU is enough for CartPole)",
    ],
    quiz: [
      { q: "Why does DQN use a target network?",
        options: ["To reduce memory", "To keep the regression target fixed for many steps, so the network isn't chasing a target that moves with every update", "To explore more", "To compute the Huber loss"], answer: 1,
        why: "Bootstrapped targets computed from the online net change after every gradient step and can diverge." },
      { q: "The Double DQN target is…",
        options: ["r + γ max_a Q_target(s', a)", "r + γ Q_target(s', argmax_a Q_online(s', a))", "r + γ Q_online(s', argmax_a Q_target(s', a)) · 2", "r + γ mean_a Q(s', a)"], answer: 1,
        why: "Select with the online net, evaluate with the target net, decoupling selection from evaluation." },
      { q: "Maximization bias arises because…",
        options: ["E[max_a Q̂(s,a)] ≥ max_a E[Q̂(s,a)] for noisy estimates", "rewards are clipped", "γ < 1", "the replay buffer is too small"], answer: 0,
        why: "The max of noisy estimates is biased upward (Jensen)." },
      { q: "Which is NOT part of the deadly triad?",
        options: ["Function approximation", "Bootstrapping", "Off-policy learning", "Experience replay"], answer: 3,
        why: "Replay is a mitigation; the triad is FA + bootstrapping + off-policy." },
    ],
    tasks: [
      {
        title: "Circular replay buffer",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`0-replay_buffer.py\` write \`class ReplayBuffer\`:

- \`__init__(self, capacity, obs_dim, seed=0)\`: preallocated NumPy arrays (no Python lists of transitions), \`rng = np.random.default_rng(seed)\`.
- \`add(self, obs, action, reward, next_obs, done)\`: overwrite the oldest transition when full.
- \`sample(self, batch_size)\` → dict with keys \`"obs"\` \`(B, obs_dim)\`, \`"actions"\` \`(B,)\` int, \`"rewards"\` \`(B,)\` float, \`"next_obs"\` \`(B, obs_dim)\`, \`"dones"\` \`(B,)\` float in {0, 1}; uniformly sampled (with replacement) from stored transitions only.
- \`__len__\` → number of stored transitions.

Also create \`README.md\` (≥ 120 words) explaining DQN's components and your results.`,
        files: ["0-replay_buffer.py", "README.md"],
        checks: [
          { type: "defines", path: "0-replay_buffer.py", names: ["ReplayBuffer"] },
          { type: "readme", path: "README.md", minWords: 120 },
          { type: "py_test", files: ["0-replay_buffer.py"], label: "overwrites oldest, samples consistent transitions",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-replay_buffer')
buf = m.ReplayBuffer(5, 3, seed=0)
assert len(buf) == 0
for i in range(8):
    buf.add(np.full(3, float(i)), i % 2, float(i), np.full(3, float(i + 1)), i == 7)
    assert len(buf) == min(i + 1, 5)
b = buf.sample(200)
o = np.asarray(b["obs"]); a = np.asarray(b["actions"]); r = np.asarray(b["rewards"])
no = np.asarray(b["next_obs"]); d = np.asarray(b["dones"]).astype(float)
assert o.shape == (200, 3) and no.shape == (200, 3) and a.shape == (200,) and r.shape == (200,) and d.shape == (200,)
ids = o[:, 0]
assert set(np.unique(ids)) <= {3.0, 4.0, 5.0, 6.0, 7.0}, "old transitions were not overwritten"
assert len(np.unique(ids)) >= 4, "sampling is not uniform over the buffer"
assert np.allclose(no, o + 1) and np.allclose(r, ids)
assert np.array_equal(a.astype(int), ids.astype(int) % 2)
assert np.array_equal(d, (ids == 7).astype(float))
print("ok")` },
        ],
      },
      {
        title: "TD targets: DQN, Double DQN, Huber loss",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`1-targets.py\` write (all inputs NumPy; \`rewards\`, \`dones\` \`(B,)\`, \`q_next_*\` \`(B, A)\`):

- \`def dqn_targets(rewards, dones, q_next_target, gamma):\` → $y = r + \gamma(1-d)\max_{a'}Q_\text{tgt}(s',a')$.
- \`def double_dqn_targets(rewards, dones, q_next_online, q_next_target, gamma):\` → $y = r + \gamma(1-d)\,Q_\text{tgt}(s', \arg\max_{a'}Q_\text{online}(s',a'))$.
- \`def huber_loss(pred, target, delta=1.0):\` → scalar mean of $\tfrac12 u^2$ if $|u|\le\delta$ else $\delta(|u| - \tfrac12\delta)$, $u = \text{pred} - \text{target}$.

No loops over the batch.`,
        files: ["1-targets.py"],
        checks: [
          { type: "defines", path: "1-targets.py", names: ["dqn_targets", "double_dqn_targets", "huber_loss"] },
          { type: "py_test", files: ["1-targets.py"], label: "targets and Huber loss match definitions",
            code: py`import numpy as np
from importlib import import_module
m = import_module('1-targets')
rng = np.random.default_rng(0)
B, A, g = 16, 4, 0.99
r = rng.normal(size=B); d = (rng.random(B) < 0.3).astype(float)
qt = rng.normal(size=(B, A)); qo = rng.normal(size=(B, A))
assert np.allclose(m.dqn_targets(r, d, qt, g), r + g * (1 - d) * qt.max(1))
dd = np.asarray(m.double_dqn_targets(r, d, qo, qt, g))
assert np.allclose(dd, r + g * (1 - d) * qt[np.arange(B), qo.argmax(1)])
assert not np.allclose(dd, m.dqn_targets(r, d, qt, g)), "double DQN must use the online argmax"
p = np.array([0.0, 0.5, 3.0, -2.0]); t = np.zeros(4)
assert np.isclose(m.huber_loss(p, t), np.mean([0.0, 0.125, 2.5, 1.5]))
assert np.isclose(m.huber_loss(p, t, delta=2.0), np.mean([0.0, 0.125, 4.0, 2.0]))
print("ok")` },
        ],
      },
      {
        title: "DQN on CartPole-v1",
        type: "mandatory", kind: "code", points: 4,
        body: md`In \`2-dqn_cartpole.py\` train DQN (MLP Q-network, your \`ReplayBuffer\`, target network with hard or Polyak updates, ε-greedy decay, Huber loss, Double-DQN targets optional but recommended) on \`gymnasium\`'s \`CartPole-v1\`.

- Evaluate the final greedy policy for 100 episodes (no exploration) and write \`results.json\`:

~~~json
{"eval_mean_reward": 492.3, "eval_episodes": 100, "train_env_steps": 80000, "seeds": 3}
~~~

**Targets:** \`eval_mean_reward >= 475\`, \`eval_episodes >= 100\`. Save \`dqn_curve.png\`: episode return vs env steps for ≥ 3 seeds (mean ± std band). No Stable-Baselines / RLlib.`,
        files: ["2-dqn_cartpole.py", "results.json", "dqn_curve.png"],
        checks: [
          { type: "contains", path: "2-dqn_cartpole.py", pattern: "import torch", label: "uses PyTorch" },
          { type: "contains", path: "2-dqn_cartpole.py", pattern: "CartPole-v1", label: "CartPole-v1" },
          { type: "not_contains", path: "2-dqn_cartpole.py", pattern: "stable_baselines|rllib", label: "no RL libraries" },
          { type: "json_metric", path: "results.json", key: "eval_mean_reward", op: ">=", value: 475 },
          { type: "json_metric", path: "results.json", key: "eval_episodes", op: ">=", value: 100 },
          { type: "exists", path: "dqn_curve.png" },
        ],
      },
      {
        title: "Ablation report",
        type: "mandatory", kind: "written", points: 2,
        body: md`\`written/3-dqn_ablations.md\` (PDF, Markdown or LaTeX accepted): train 3 seeds each of (a) full DQN, (b) no target network, (c) replay buffer of size 1 000 vs 50 000, (d) DQN vs Double DQN. Plot learning curves, report steps-to-solve, and log the mean max-Q estimate over training to show over-estimation in (d). Explain each result with the deadly-triad / maximization-bias concepts.`,
        deliverable: "repo",
        files: ["written/3-dqn_ablations.md"],
        rubric: "report",
        criteria: [
          "All four ablations run with ≥ 3 seeds and plotted with variability",
          "Reports steps-to-solve (or failure) for each variant",
          "Shows Q-value over-estimation for DQN vs Double DQN with a plot or table",
          "Interprets results using the deadly triad and maximization bias",
        ],
      },
      {
        title: "Scale to Atari",
        type: "advanced", kind: "code", points: 3,
        body: md`In \`100-dqn_atari.py\` train DQN with the Nature preprocessing (frame skip 4, 84×84 grayscale, 4-frame stack, reward clipping, conv net) on \`ALE/Pong-v5\` (or Breakout). Add \`"atari_eval_mean_reward"\` (10 evaluation episodes, ε = 0.05) to \`results.json\`. Target for Pong: ≥ 10.`,
        files: ["100-dqn_atari.py"],
        checks: [
          { type: "contains", path: "100-dqn_atari.py", pattern: "ALE/|Atari|NoFrameskip", label: "Atari environment" },
          { type: "contains", path: "100-dqn_atari.py", pattern: "Conv2d", label: "convolutional Q-network" },
          { type: "json_metric", path: "results.json", key: "atari_eval_mean_reward", op: ">=", value: 10 },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A37
  {
    id: "A37",
    track: TRACK,
    phase: PHASE,
    title: "Policy Gradients, Actor-Critic & PPO",
    days: 4,
    repo: REPO,
    dir: "0x07-policy_gradients",
    sources: [
      { course: "CS234", lectures: "Lec 8–10", topics: "Policy gradient theorem, REINFORCE, baselines, actor-critic, advantage estimation, trust regions, PPO" },
    ],
    resources: [
      { title: "OpenAI Spinning Up — Intro to Policy Optimization", url: "https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html" },
      { title: "Schulman et al. 2017 — Proximal Policy Optimization Algorithms", url: "https://arxiv.org/abs/1707.06347" },
      { title: "Schulman et al. 2015 — High-Dimensional Continuous Control Using GAE", url: "https://arxiv.org/abs/1506.02438" },
      { title: "Mnih et al. 2016 — Asynchronous Methods for Deep RL (A3C/A2C)", url: "https://arxiv.org/abs/1602.01783" },
      { title: "Sutton & Barto — RL: An Introduction, Ch. 13 (policy gradient methods)", url: "http://incompleteideas.net/book/the-book-2nd.html" },
      { title: "Henderson et al. 2017 — Deep Reinforcement Learning that Matters", url: "https://arxiv.org/abs/1709.06560" },
    ],
    concepts: [
      "Policy gradient theorem and the log-derivative trick",
      "Reward-to-go and causality",
      "Baselines and advantage functions (variance reduction without bias)",
      "Actor-critic and bootstrapped critics",
      "Generalized Advantage Estimation (λ trades bias for variance)",
      "PPO clipped surrogate objective and trust regions",
    ],
    objectives: [
      "Derive the REINFORCE gradient estimator from J(θ) = E_τ[R(τ)]",
      "Prove that subtracting a state-dependent baseline leaves the gradient unbiased",
      "Implement reward-to-go, GAE and the PPO clipped objective and test them against references",
      "Implement REINFORCE, A2C and PPO on CartPole and measure gradient variance",
      "Explain what the PPO clip does when the advantage is positive vs negative",
    ],
    requirements: [
      "NumPy only for tasks 0–2",
      "PyTorch + gymnasium for the agents; no RL libraries",
    ],
    quiz: [
      { q: "Why does subtracting a baseline b(s_t) keep the policy gradient unbiased?",
        options: ["Because b is learned", "Because E_{a~π}[∇ log π(a|s) b(s)] = b(s) ∇ Σ_a π(a|s) = 0", "Because rewards are normalized", "It doesn't; it introduces bias"], answer: 1,
        why: "The score function has zero mean under the policy." },
      { q: "GAE with λ = 0 gives the advantage estimate…",
        options: ["the Monte Carlo return minus V(s_t)", "the one-step TD error δ_t = r_t + γV(s_{t+1}) − V(s_t)", "zero", "the discounted sum of rewards"], answer: 1,
        why: "λ = 1 recovers the MC advantage (high variance), λ = 0 the TD error (high bias)." },
      { q: "In PPO, for a positive advantage, the clipped objective…",
        options: ["stops rewarding increases of the ratio above 1 + ε", "stops rewarding decreases of the ratio below 1 − ε", "is unclipped", "is always zero"], answer: 0,
        why: "min(rA, clip(r, 1−ε, 1+ε)A) flattens once r > 1 + ε when A > 0." },
      { q: "Reward-to-go replaces R(τ) by Σ_{t' ≥ t} r_{t'} because…",
        options: ["future actions cannot affect past rewards, so past rewards only add variance", "it is biased but faster", "it equals the Q-function exactly", "PPO requires it"], answer: 0,
        why: "Causality: dropping past rewards keeps the estimator unbiased and reduces variance." },
    ],
    tasks: [
      {
        title: "Reward-to-go with episode boundaries",
        type: "mandatory", kind: "code", points: 1,
        body: md`In \`0-returns.py\` write \`def reward_to_go(rewards, dones, gamma):\` for a batch of **concatenated** episodes.

- \`rewards\`, \`dones\`: 1-D arrays of length \`T\`; \`dones[t] = 1\` if the episode ended after step \`t\`.
- Return \`G\` \`(T,)\` with $G_t = r_t + \gamma(1-d_t)G_{t+1}$ and $G_T := 0$ (an unfinished last episode is simply truncated, no bootstrap).

Also create \`README.md\` (≥ 150 words): the policy gradient theorem, the three algorithms, and your results table.`,
        files: ["0-returns.py", "README.md"],
        checks: [
          { type: "defines", path: "0-returns.py", names: ["reward_to_go"] },
          { type: "readme", path: "README.md", minWords: 150 },
          { type: "py_test", files: ["0-returns.py"], label: "discounted reward-to-go resets at episode ends",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-returns')
r = np.array([1.0, 1.0, 1.0, 2.0, 0.0, 3.0])
d = np.array([0, 0, 1, 0, 1, 0], dtype=float)
g = 0.5
ref = np.array([1 + 0.5 + 0.25, 1.5, 1.0, 2.0, 0.0, 3.0])
assert np.allclose(m.reward_to_go(r, d, g), ref)
rng = np.random.default_rng(0)
r = rng.normal(size=300); d = (rng.random(300) < 0.05).astype(float)
G = np.zeros(300); run = 0.0
for t in reversed(range(300)):
    run = r[t] + 0.99 * (1 - d[t]) * run
    G[t] = run
assert np.allclose(m.reward_to_go(r, d, 0.99), G)
print("ok")` },
        ],
      },
      {
        title: "Generalized Advantage Estimation",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`1-gae.py\` write \`def gae(rewards, values, dones, last_value, gamma=0.99, lam=0.95):\` → \`(advantages, returns)\`

- \`rewards\`, \`values\`, \`dones\`: \`(T,)\` with \`values[t]\` $= V(s_t)$; \`last_value\` $= V(s_T)$ bootstraps the step after the rollout.
- $\delta_t = r_t + \gamma(1-d_t)V(s_{t+1}) - V(s_t)$, $\hat A_t = \delta_t + \gamma\lambda(1-d_t)\hat A_{t+1}$, \`returns = advantages + values\`.

NumPy only (a single reverse loop over time is fine).`,
        files: ["1-gae.py"],
        checks: [
          { type: "defines", path: "1-gae.py", names: ["gae"] },
          { type: "py_test", files: ["1-gae.py"], label: "GAE matches reference; λ=0 is TD error, λ=1 is MC advantage",
            code: py`import numpy as np
from importlib import import_module
m = import_module('1-gae')
rng = np.random.default_rng(0)
T = 64
r = rng.normal(size=T); v = rng.normal(size=T); d = (rng.random(T) < 0.1).astype(float); lv = 0.7
def ref(g, l):
    adv = np.zeros(T); last = 0.0
    for t in reversed(range(T)):
        nv = lv if t == T - 1 else v[t + 1]
        delta = r[t] + g * (1 - d[t]) * nv - v[t]
        last = delta + g * l * (1 - d[t]) * last
        adv[t] = last
    return adv
A, R = m.gae(r, v, d, lv, 0.99, 0.95)
assert np.allclose(A, ref(0.99, 0.95)) and np.allclose(R, ref(0.99, 0.95) + v)
A0, _ = m.gae(r, v, d, lv, 0.9, 0.0)
nv = np.append(v[1:], lv)
assert np.allclose(A0, r + 0.9 * (1 - d) * nv - v)
A1, R1 = m.gae(r, v, d, lv, 0.9, 1.0)
assert np.allclose(A1, ref(0.9, 1.0))
print("ok")` },
        ],
      },
      {
        title: "PPO clipped surrogate",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`2-ppo_objective.py\` write

- \`def ppo_clip_objective(logp_new, logp_old, advantages, clip_eps=0.2):\` → scalar $L^\text{CLIP} = \mathbb E_t[\min(\rho_t\hat A_t,\ \mathrm{clip}(\rho_t, 1-\epsilon, 1+\epsilon)\hat A_t)]$ with $\rho_t = \exp(\log\pi_\text{new} - \log\pi_\text{old})$ (the objective to **maximize**).
- \`def clip_fraction(logp_new, logp_old, clip_eps=0.2):\` → fraction of samples with $|\rho_t - 1| > \epsilon$.
- \`def normalize_advantages(adv, eps=1e-8):\` → $(A - \bar A)/(\mathrm{std}(A) + \epsilon)$ (population std).`,
        files: ["2-ppo_objective.py"],
        checks: [
          { type: "defines", path: "2-ppo_objective.py", names: ["ppo_clip_objective", "clip_fraction", "normalize_advantages"] },
          { type: "py_test", files: ["2-ppo_objective.py"], label: "clipped objective, clip fraction, normalization",
            code: py`import numpy as np
from importlib import import_module
m = import_module('2-ppo_objective')
rng = np.random.default_rng(0)
lo = rng.normal(-1, 0.3, 500); ln = lo + rng.normal(0, 0.3, 500); A = rng.normal(size=500)
rho = np.exp(ln - lo)
ref = np.minimum(rho * A, np.clip(rho, 0.8, 1.2) * A).mean()
assert np.isclose(m.ppo_clip_objective(ln, lo, A, 0.2), ref)
assert np.isclose(m.clip_fraction(ln, lo, 0.2), (np.abs(rho - 1) > 0.2).mean())
# positive advantage: ratio 2 is clipped to 1.2; negative advantage: ratio 2 is NOT clipped
assert np.isclose(m.ppo_clip_objective(np.log([2.0]), np.zeros(1), np.array([1.0])), 1.2)
assert np.isclose(m.ppo_clip_objective(np.log([2.0]), np.zeros(1), np.array([-1.0])), -2.0)
n = np.asarray(m.normalize_advantages(A * 5 + 3))
assert abs(n.mean()) < 1e-10 and abs(n.std() - 1) < 1e-6
print("ok")` },
        ],
      },
      {
        title: "REINFORCE → A2C → PPO on CartPole",
        type: "mandatory", kind: "code", points: 5,
        body: md`Implement three agents in PyTorch for \`CartPole-v1\` (categorical MLP policies), reusing your NumPy functions (ported or called on detached arrays):

- \`3-reinforce.py\`: REINFORCE with reward-to-go and a learned value baseline.
- \`4-a2c.py\`: synchronous advantage actor-critic (n-step or GAE advantages, entropy bonus, ≥ 4 parallel envs via \`gymnasium.vector\`).
- \`5-ppo.py\`: PPO-clip with GAE (λ = 0.95), several epochs of minibatch updates per rollout, value loss + entropy bonus.

Evaluate each final greedy policy for 100 episodes. Also measure **gradient variance**: at a fixed policy checkpoint, compute the policy-gradient estimate from 50 independent batches of 1 000 env steps and report the mean per-parameter variance for (i) REINFORCE without baseline, (ii) with baseline, (iii) GAE advantages. Write \`results.json\`:

~~~json
{"reinforce_eval_mean_reward": 480.0, "a2c_eval_mean_reward": 495.0, "ppo_eval_mean_reward": 500.0,
 "grad_var_no_baseline": 3.1e-2, "grad_var_baseline": 8.0e-3, "grad_var_gae": 2.2e-3}
~~~

**Targets:** REINFORCE ≥ 300, A2C ≥ 400, PPO ≥ 475. Save \`pg_curves.png\` (all three, ≥ 3 seeds, return vs env steps).`,
        files: ["3-reinforce.py", "4-a2c.py", "5-ppo.py", "results.json", "pg_curves.png"],
        checks: [
          { type: "contains", path: "3-reinforce.py", pattern: "log_prob", label: "uses log-probabilities" },
          { type: "contains", path: "5-ppo.py", pattern: "clamp|clip", label: "PPO clipping" },
          { type: "not_contains", path: "5-ppo.py", pattern: "stable_baselines|rllib|cleanrl", label: "no RL libraries" },
          { type: "json_metric", path: "results.json", key: "reinforce_eval_mean_reward", op: ">=", value: 300 },
          { type: "json_metric", path: "results.json", key: "a2c_eval_mean_reward", op: ">=", value: 400 },
          { type: "json_metric", path: "results.json", key: "ppo_eval_mean_reward", op: ">=", value: 475 },
        ],
      },
      {
        title: "Variance write-up",
        type: "mandatory", kind: "written", points: 2,
        body: md`\`written/6-variance.pdf\` (PDF, Markdown or LaTeX accepted), 2 pages:

1. Derive the REINFORCE estimator $\nabla_\theta J = \mathbb E_\tau[\sum_t \nabla_\theta\log\pi_\theta(a_t|s_t)\,G_t]$.
2. Prove a state-dependent baseline keeps it unbiased.
3. Present your gradient-variance measurements and learning curves; explain the ordering you observed.
4. Explain the bias–variance role of λ in GAE and of the PPO clip in limiting policy change; relate PPO to the TRPO KL constraint.`,
        deliverable: "repo",
        files: ["written/6-variance.pdf"],
        rubric: "derivation",
        criteria: [
          "Log-derivative trick derivation with reward-to-go justified by causality",
          "Baseline unbiasedness proof (E[∇log π · b(s)] = 0)",
          "Uses own measured variances (three settings) and curves, with an explanation of the ordering",
          "Explains λ's bias–variance trade-off and PPO's clip vs TRPO's KL trust region",
        ],
      },
      {
        title: "PPO on LunarLander",
        type: "advanced", kind: "code", points: 2,
        body: md`Run your PPO unchanged except hyper-parameters on \`LunarLander-v3\` (or v2). Add \`"lunar_eval_mean_reward"\` (100 episodes) to \`results.json\`; target ≥ 200. File \`100-ppo_lunar.py\`.`,
        files: ["100-ppo_lunar.py"],
        checks: [
          { type: "contains", path: "100-ppo_lunar.py", pattern: "LunarLander", label: "LunarLander" },
          { type: "json_metric", path: "results.json", key: "lunar_eval_mean_reward", op: ">=", value: 200 },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A38
  {
    id: "A38",
    track: TRACK,
    phase: PHASE,
    title: "RLHF: Preference Learning & Reward Models",
    days: 2,
    repo: REPO,
    dir: "0x08-rlhf_reward_models",
    sources: [
      { course: "CS329H", lectures: "Lec 1–3", topics: "Learning from human preferences, choice models (Bradley–Terry), reward modeling, the RLHF pipeline" },
    ],
    resources: [
      { title: "Ouyang et al. 2022 — Training language models to follow instructions with human feedback (InstructGPT)", url: "https://arxiv.org/abs/2203.02155" },
      { title: "Christiano et al. 2017 — Deep RL from Human Preferences", url: "https://arxiv.org/abs/1706.03741" },
      { title: "Stiennon et al. 2020 — Learning to summarize from human feedback", url: "https://arxiv.org/abs/2009.01325" },
      { title: "Bai et al. 2022 — Training a Helpful and Harmless Assistant with RLHF (Anthropic HH)", url: "https://arxiv.org/abs/2204.05862" },
      { title: "CS329H course site (Stanford)", url: "https://web.stanford.edu/class/cs329h/" },
    ],
    concepts: [
      "Pairwise preferences and the Bradley–Terry model P(y_w ≻ y_l) = σ(r_w − r_l)",
      "Reward model training as logistic regression on reward differences",
      "SFT → RM → PPO pipeline",
      "KL penalty to the reference (SFT) policy",
      "Reward hacking / over-optimization",
      "Annotator agreement and label noise",
    ],
    objectives: [
      "Write the Bradley–Terry likelihood and derive its gradient",
      "Fit a reward model from synthetic preferences and recover the true reward direction",
      "Describe each stage of InstructGPT, including data sizes and the KL-regularized objective",
      "Explain why the RM's reward is only defined up to a constant and why that's fine",
      "Explain reward over-optimization and the role of the KL penalty",
    ],
    requirements: ["NumPy only for tasks 0–1"],
    quiz: [
      { q: "Under Bradley–Terry, adding the same constant c to every reward…",
        options: ["changes all preference probabilities", "leaves all preference probabilities unchanged", "makes the loss infinite", "doubles the KL penalty"], answer: 1,
        why: "Only reward differences enter σ(r_w − r_l)." },
      { q: "The RL objective in InstructGPT's PPO stage is roughly…",
        options: ["E[r_φ(x, y)]", "E[r_φ(x, y)] − β KL(π_θ(·|x) || π_SFT(·|x))", "−log π_θ(y|x)", "E[r_φ] + β H(π_θ)"], answer: 1,
        why: "(Plus an optional pretraining-mix term, 'PPO-ptx'.)" },
      { q: "Why is the KL penalty needed?",
        options: ["To speed up training", "To keep the policy near the SFT model where the reward model is accurate, limiting reward hacking", "To make the RM convex", "It is not needed"], answer: 1,
        why: "The RM is only trustworthy near its training distribution." },
    ],
    tasks: [
      {
        title: "Bradley–Terry loss and gradient",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`0-bradley_terry.py\` write

- \`def bt_loss(r_chosen, r_rejected):\` → scalar $\mathcal L = -\frac1N\sum_i \log\sigma(r^{(i)}_w - r^{(i)}_l)$, stable for differences of $\pm 1000$ (softplus form).
- \`def bt_grad(r_chosen, r_rejected):\` → \`(g_chosen, g_rejected)\`, each \`(N,)\`: gradients of the **mean** loss w.r.t. each reward.

Also create \`README.md\` (≥ 100 words) summarizing the RLHF pipeline and this directory's files.`,
        files: ["0-bradley_terry.py", "README.md"],
        checks: [
          { type: "defines", path: "0-bradley_terry.py", names: ["bt_loss", "bt_grad"] },
          { type: "readme", path: "README.md", minWords: 100 },
          { type: "py_test", files: ["0-bradley_terry.py"], label: "loss, finite-difference gradient, stability",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-bradley_terry')
rng = np.random.default_rng(0)
rc = rng.normal(size=10); rr = rng.normal(size=10)
ref = np.mean(np.log1p(np.exp(-(rc - rr))))
assert np.isclose(m.bt_loss(rc, rr), ref)
gc, gr = m.bt_grad(rc, rr)
gc = np.asarray(gc); gr = np.asarray(gr)
h = 1e-6
for i in range(10):
    e = np.zeros(10); e[i] = h
    assert np.isclose(gc[i], (m.bt_loss(rc + e, rr) - m.bt_loss(rc - e, rr)) / (2 * h), atol=1e-6)
    assert np.isclose(gr[i], (m.bt_loss(rc, rr + e) - m.bt_loss(rc, rr - e)) / (2 * h), atol=1e-6)
assert np.isfinite(m.bt_loss(np.array([-1000.0, 1000.0]), np.array([1000.0, -1000.0])))
assert np.isclose(m.bt_loss(np.array([-1000.0]), np.array([0.0])), 1000.0)
print("ok")` },
        ],
      },
      {
        title: "Fit a linear reward model from preferences",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`1-linear_reward_model.py\` write \`def fit_linear_reward(phi_chosen, phi_rejected, lr=0.5, n_steps=2000):\` → \`w\` \`(d,)\`

- \`phi_chosen\`, \`phi_rejected\`: \`(N, d)\` feature vectors of the preferred / dispreferred responses; reward $r(y) = w^\top\phi(y)$.
- Minimize the Bradley–Terry loss by full-batch gradient descent from $w = 0$ (reuse your \`bt_grad\` via the chain rule, or derive it directly).
- Also write \`def preference_accuracy(w, phi_chosen, phi_rejected):\` → fraction of pairs with $r_w > r_l$.

The check samples preferences from a hidden true reward and requires your \`w\` to point in the same direction (cosine ≥ 0.9) and to match the true reward's held-out accuracy within 3 points.`,
        files: ["1-linear_reward_model.py"],
        checks: [
          { type: "defines", path: "1-linear_reward_model.py", names: ["fit_linear_reward", "preference_accuracy"] },
          { type: "py_test", files: ["1-linear_reward_model.py", "0-bradley_terry.py"], label: "recovers the hidden reward direction",
            code: py`import numpy as np
from importlib import import_module
m = import_module('1-linear_reward_model')
rng = np.random.default_rng(0)
d, N = 6, 3000
w_true = rng.normal(size=d)
a = rng.normal(size=(N, d)); b = rng.normal(size=(N, d))
p = 1 / (1 + np.exp(-(a - b) @ w_true))
pick = rng.random(N) < p
ch = np.where(pick[:, None], a, b); rj = np.where(pick[:, None], b, a)
tr, te = slice(0, 2000), slice(2000, None)
w = np.asarray(m.fit_linear_reward(ch[tr], rj[tr]))
assert w.shape == (d,)
cos = w @ w_true / (np.linalg.norm(w) * np.linalg.norm(w_true))
assert cos >= 0.9, f"cosine {cos:.3f}"
acc = m.preference_accuracy(w, ch[te], rj[te])
acc_true = np.mean((ch[te] - rj[te]) @ w_true > 0)
assert acc >= acc_true - 0.03, f"{acc:.3f} vs {acc_true:.3f}"
print("ok")` },
        ],
      },
      {
        title: "InstructGPT reading notes",
        type: "mandatory", kind: "written", points: 2,
        body: md`\`written/2-instructgpt_notes.md\` (PDF, Markdown or LaTeX accepted), 1–2 pages: data collection (prompt sources, labeler counts, dataset sizes for SFT/RM/PPO), the RM loss with $K$ ranked responses ($\binom K2$ comparisons per prompt), the PPO-ptx objective, the main human-eval results (1.3B InstructGPT vs 175B GPT-3), the alignment tax, and three limitations the authors acknowledge. Also connect to Christiano et al. (2017): what changed between Atari preference learning and LMs?`,
        deliverable: "repo",
        files: ["written/2-instructgpt_notes.md"],
        rubric: "summary",
        criteria: [
          "Reports the three datasets and their approximate sizes",
          "Writes the RM loss with K-wise comparisons and the PPO-ptx objective including the KL term",
          "States the 1.3B vs 175B preference result and explains the alignment tax",
          "Lists three acknowledged limitations and compares with Christiano et al. 2017",
        ],
      },
      {
        title: "One-page SFT → RM → PPO diagram",
        type: "mandatory", kind: "written", points: 1,
        body: md`\`written/3-rlhf_pipeline.pdf\` (PDF or PNG embedded in Markdown accepted): a single-page diagram of the full pipeline. Show each model (pretrained LM, SFT policy, reward model, reference policy, value head, PPO policy), what data flows into each (demonstrations, comparisons, prompts), each loss, the per-token KL penalty, and which models are frozen at each stage.`,
        deliverable: "repo",
        files: ["written/3-rlhf_pipeline.pdf"],
        rubric: "report",
        criteria: [
          "All three stages with their datasets and losses",
          "Shows frozen reference policy and KL penalty inside the PPO reward",
          "Shows reward model initialization (from SFT) and value-head/critic",
          "Fits on one page and is readable without the paper",
        ],
      },
      {
        title: "Train a neural reward model",
        type: "advanced", kind: "code", points: 2,
        body: md`In \`100-reward_model.py\` fine-tune a small transformer (e.g. DistilBERT / GPT-2 small with a scalar head) as a Bradley–Terry reward model on ≥ 5 000 pairs of Anthropic HH-RLHF; report held-out preference accuracy as \`"rm_val_accuracy"\` in \`results.json\` (target ≥ 0.60).`,
        files: ["100-reward_model.py"],
        checks: [
          { type: "contains", path: "100-reward_model.py", pattern: "logsigmoid|log_sigmoid|softplus", label: "Bradley–Terry loss" },
          { type: "json_metric", path: "results.json", key: "rm_val_accuracy", op: ">=", value: 0.6 },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A39
  {
    id: "A39",
    track: TRACK,
    phase: PHASE,
    title: "Direct Preference Optimization",
    days: 3,
    repo: REPO,
    dir: "0x09-dpo",
    sources: [
      { course: "CS329H", lectures: "Lec 4–6", topics: "DPO and other alternatives to RLHF (IPO, KTO, rejection sampling), alignment challenges" },
    ],
    resources: [
      { title: "Rafailov et al. 2023 — Direct Preference Optimization", url: "https://arxiv.org/abs/2305.18290" },
      { title: "Azar et al. 2023 — A General Theoretical Paradigm to Understand Learning from Human Preferences (IPO)", url: "https://arxiv.org/abs/2310.12036" },
      { title: "Ethayarajh et al. 2024 — KTO: Model Alignment as Prospect Theoretic Optimization", url: "https://arxiv.org/abs/2402.01306" },
      { title: "Hugging Face TRL documentation (reference only — implement your own loss)", url: "https://huggingface.co/docs/trl/index" },
      { title: "Bai et al. 2022 — Anthropic HH-RLHF", url: "https://arxiv.org/abs/2204.05862" },
    ],
    concepts: [
      "Closed-form optimum of the KL-regularized objective π* ∝ π_ref exp(r/β)",
      "Implicit reward r(x, y) = β log π_θ(y|x) / π_ref(y|x) + β log Z(x)",
      "DPO loss as Bradley–Terry on implicit rewards",
      "Sequence log-probabilities with response-only masking",
      "β as the strength of the KL constraint",
      "Reward accuracy and margin as training diagnostics",
    ],
    objectives: [
      "Derive the DPO loss from the KL-regularized RL objective",
      "Implement sequence log-probabilities and the DPO loss and test them",
      "Fine-tune a small LM with DPO on a tiny preference dataset and report reward accuracy",
      "Explain the effect of β and of a bad reference model",
      "Write a synthesis connecting MLE, VAEs, policy gradients, RLHF and DPO",
    ],
    requirements: [
      "NumPy only for tasks 0–1",
      "PyTorch + transformers for task 2; write the DPO loss yourself (no trl.DPOTrainer)",
    ],
    quiz: [
      { q: "The optimal policy of max_π E[r] − β KL(π || π_ref) is…",
        options: ["π_ref", "π*(y|x) = π_ref(y|x) exp(r(x,y)/β) / Z(x)", "argmax_y r(x, y)", "uniform"], answer: 1,
        why: "Standard Gibbs-variational result; DPO inverts it to express r in terms of π*." },
      { q: "Why does the partition function Z(x) disappear from the DPO loss?",
        options: ["It is approximated by sampling", "Bradley–Terry depends only on reward differences for the same prompt x, so β log Z(x) cancels", "It is set to 1", "It doesn't disappear"], answer: 1,
        why: "Both responses share the prompt." },
      { q: "DPO's per-example gradient weights an example by σ(r̂_l − r̂_w). This means…",
        options: ["examples the implicit reward already ranks correctly get small weight", "all examples get equal weight", "wrongly ranked examples are ignored", "β has no effect"], answer: 0,
        why: "It focuses on pairs the model currently gets wrong." },
      { q: "Increasing β in DPO…",
        options: ["lets the policy move further from π_ref", "keeps the policy closer to π_ref (stronger KL)", "has no effect", "removes the need for a reference model"], answer: 1,
        why: "β is the KL coefficient of the implied RL problem." },
    ],
    tasks: [
      {
        title: "DPO loss from log-probabilities",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`0-dpo_loss.py\` write \`def dpo_loss(policy_chosen_logps, policy_rejected_logps, ref_chosen_logps, ref_rejected_logps, beta=0.1):\` → \`(loss, chosen_rewards, rejected_rewards)\`

- Inputs: \`(N,)\` summed log-probabilities of each full response.
- \`chosen_rewards\` $= \beta(\log\pi_\theta(y_w|x) - \log\pi_\text{ref}(y_w|x))$, likewise \`rejected_rewards\`.
- \`loss\` $= -\frac1N\sum\log\sigma(\text{chosen} - \text{rejected})$ (scalar), stable for large margins.

Also create \`README.md\` (≥ 120 words): the DPO derivation sketch, your dataset, results.`,
        files: ["0-dpo_loss.py", "README.md"],
        checks: [
          { type: "defines", path: "0-dpo_loss.py", names: ["dpo_loss"] },
          { type: "readme", path: "README.md", minWords: 120 },
          { type: "py_test", files: ["0-dpo_loss.py"], label: "implicit rewards and DPO loss",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-dpo_loss')
rng = np.random.default_rng(0)
pc, pr, rc, rr = (rng.normal(-50, 5, 8) for _ in range(4))
for beta in (0.1, 0.5):
    loss, cr, rj = m.dpo_loss(pc, pr, rc, rr, beta)
    ecr = beta * (pc - rc); err = beta * (pr - rr)
    assert np.allclose(cr, ecr) and np.allclose(rj, err)
    assert np.isclose(loss, np.mean(np.log1p(np.exp(-(ecr - err)))))
loss, _, _ = m.dpo_loss(pc, pr, pc, pr, 0.1)
assert np.isclose(loss, np.log(2)), "policy == reference must give log 2"
big, _, _ = m.dpo_loss(np.array([0.0]), np.array([-1e5]), np.array([-1e5]), np.array([0.0]), 0.1)
assert np.isfinite(big) and big < 1e-6
big2, _, _ = m.dpo_loss(np.array([-1e5]), np.array([0.0]), np.array([0.0]), np.array([-1e5]), 0.1)
assert np.isclose(big2, 2e4)
print("ok")` },
        ],
      },
      {
        title: "Masked sequence log-probabilities",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`1-sequence_logps.py\` write \`def sequence_logps(logits, labels, mask):\` → \`(B,)\`

- \`logits\` \`(B, T, V)\` already aligned so that \`logits[b, t]\` predicts \`labels[b, t]\` (the caller has done the shift); \`labels\` \`(B, T)\` int; \`mask\` \`(B, T)\` 0/1 (1 = response token, 0 = prompt or padding).
- Return $\sum_t \text{mask}_{bt}\,\log\mathrm{softmax}(\text{logits}_{bt})[\text{labels}_{bt}]$, using a stable log-softmax (logits up to $10^3$ must not overflow). No loops over the batch.`,
        files: ["1-sequence_logps.py"],
        checks: [
          { type: "defines", path: "1-sequence_logps.py", names: ["sequence_logps"] },
          { type: "py_test", files: ["1-sequence_logps.py"], label: "masked gather of log-softmax",
            code: py`import numpy as np
from importlib import import_module
m = import_module('1-sequence_logps')
rng = np.random.default_rng(0)
B, T, V = 3, 7, 11
lg = rng.normal(0, 3, (B, T, V)); lab = rng.integers(0, V, (B, T))
mask = (rng.random((B, T)) < 0.6).astype(float)
ls = lg - lg.max(-1, keepdims=True); ls = ls - np.log(np.exp(ls).sum(-1, keepdims=True))
ref = (np.take_along_axis(ls, lab[..., None], -1)[..., 0] * mask).sum(1)
out = np.asarray(m.sequence_logps(lg, lab, mask))
assert out.shape == (B,) and np.allclose(out, ref)
out2 = np.asarray(m.sequence_logps(lg * 400, lab, mask))
assert np.all(np.isfinite(out2))
assert np.allclose(m.sequence_logps(lg, lab, np.zeros((B, T))), 0)
print("ok")` },
        ],
      },
      {
        title: "DPO on a tiny preference dataset",
        type: "mandatory", kind: "code", points: 4,
        body: md`In \`2-dpo_train.py\` fine-tune a small causal LM (GPT-2 small, Pythia-160M or SmolLM-135M) with **your** DPO loss:

1. SFT the model briefly on the chosen responses (or use an instruct checkpoint) → this is $\pi_\text{ref}$ (frozen copy).
2. DPO on 2 000–10 000 pairs from Anthropic HH-RLHF (or the dataset released with the DPO paper); hold out 500 pairs. Mask prompt tokens out of the log-probs.
3. Log reward accuracy, reward margin, chosen/rejected log-probs every N steps; save \`dpo_curves.png\`. Try two values of β.

Write \`results.json\`:

~~~json
{"beta": 0.1, "val_reward_accuracy": 0.64, "val_reward_margin": 0.42, "train_pairs": 5000}
~~~

**Targets:** \`val_reward_accuracy >= 0.6\`, \`val_reward_margin > 0\`. No \`trl.DPOTrainer\`.`,
        files: ["2-dpo_train.py", "results.json", "dpo_curves.png"],
        checks: [
          { type: "contains", path: "2-dpo_train.py", pattern: "import torch", label: "uses PyTorch" },
          { type: "not_contains", path: "2-dpo_train.py", pattern: "DPOTrainer", label: "own DPO loop" },
          { type: "json_metric", path: "results.json", key: "val_reward_accuracy", op: ">=", value: 0.6 },
          { type: "json_metric", path: "results.json", key: "val_reward_margin", op: ">", value: 0 },
          { type: "exists", path: "dpo_curves.png" },
        ],
      },
      {
        title: "Derive DPO",
        type: "mandatory", kind: "written", points: 1,
        body: md`\`written/3-dpo_derivation.pdf\` (PDF, Markdown or LaTeX accepted): (1) solve $\max_\pi \mathbb E_{y\sim\pi}[r(x,y)] - \beta\,\mathrm{KL}(\pi\|\pi_\text{ref})$ for $\pi^*$; (2) invert to get $r$ in terms of $\pi^*$; (3) substitute into Bradley–Terry and show $Z(x)$ cancels; (4) derive the gradient and interpret its weighting term.`,
        deliverable: "repo",
        files: ["written/3-dpo_derivation.pdf"],
        rubric: "derivation",
        criteria: [
          "Obtains π* ∝ π_ref exp(r/β) with the normalizer Z(x)",
          "Inverts to r = β log(π*/π_ref) + β log Z(x)",
          "Shows Z(x) cancels inside the Bradley–Terry likelihood",
          "Derives the gradient with the σ(r̂_l − r̂_w) weighting and interprets it",
        ],
      },
      {
        title: "Synthesis essay: MLE → VAE → PG → RLHF → DPO",
        type: "mandatory", kind: "written", points: 3,
        body: md`Publish a ~1 500-word essay on Medium (or your blog) tracing **one thread** through Phase 4: maximum likelihood (PixelCNN), the ELBO as a bound on likelihood (VAE), the score-function gradient (REINFORCE) vs the reparameterization gradient, KL-regularized policy optimization (RLHF) and its closed-form shortcut (DPO). Use at least three equations and at least two of your own experimental results from this phase. Submit the URL.`,
        deliverable: "link",
        rubric: "essay",
        criteria: [
          "Identifies a single unifying thread (e.g. optimizing expectations of log-probabilities under different distributions / KL terms)",
          "Contrasts score-function vs reparameterization gradients explicitly",
          "Explains how DPO removes the explicit reward model and RL loop",
          "Includes ≥ 3 equations and ≥ 2 of the author's own results",
          "≈ 1 500 words, publicly accessible, with references",
        ],
      },
      {
        title: "IPO vs DPO",
        type: "advanced", kind: "code", points: 2,
        body: md`In \`100-ipo.py\` implement the IPO loss $\big(h - \frac{1}{2\tau}\big)^2$ with $h = \log\frac{\pi(y_w)\pi_\text{ref}(y_l)}{\pi(y_l)\pi_\text{ref}(y_w)}$, train with the same data, and compare reward accuracy and KL to the reference against DPO. Add \`"ipo_val_reward_accuracy"\` to \`results.json\`.`,
        files: ["100-ipo.py"],
        checks: [
          { type: "exists", path: "100-ipo.py" },
          { type: "json_metric", path: "results.json", key: "ipo_val_reward_accuracy", op: ">=", value: 0.55 },
        ],
      },
    ],
  },
];
