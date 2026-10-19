// Applied track — Phase 3: Sequence Models & NLP (Weeks 17–26 of the source plan).
// Repo: ml-nlp. Bodies use the `md` tag: write § for a backtick (String.raw semantics otherwise).
const md = (s, ...v) => String.raw({ raw: s.raw }, ...v).replace(/§/g, "`");
// Common prelude for every py_test (files start with digits -> importlib).
const py = (code) =>
  "import sys, os\nsys.path.insert(0, os.getcwd())\nimport numpy as np\nfrom importlib import import_module\n" + code;

const PHASE = "Phase 3 — Sequence Models & NLP";
const REPO = "ml-nlp";

export default [
  // ───────────────────────────────────────────────────────────── A20
  {
    id: "A20",
    track: "applied",
    phase: PHASE,
    title: "Word Vectors: word2vec from Scratch",
    days: 3,
    repo: REPO,
    dir: "0x00-word2vec",
    sources: [
      { course: "CS224N", lectures: "Lec 1–2", topics: "Intro & word vectors, word2vec details (skip-gram, negative sampling), GloVe, evaluation of word vectors" }
    ],
    resources: [
      { title: "CS224N course site (notes, assignments)", url: "https://web.stanford.edu/class/cs224n/" },
      { title: "Mikolov et al. 2013 — Efficient Estimation of Word Representations in Vector Space", url: "https://arxiv.org/abs/1301.3781" },
      { title: "Mikolov et al. 2013 — Distributed Representations of Words and Phrases (negative sampling, subsampling)", url: "https://arxiv.org/abs/1310.4546" },
      { title: "Goldberg & Levy — word2vec Explained: deriving the negative-sampling objective", url: "https://arxiv.org/abs/1402.3722" },
      { title: "D2L — Word Embedding (word2vec) & Approximate Training", url: "https://d2l.ai/chapter_natural-language-processing-pretraining/word2vec.html" }
    ],
    concepts: [
      "Distributional hypothesis",
      "Skip-gram vs CBOW",
      "Naive softmax and its O(|V|) cost",
      "Negative sampling and the unigram^0.75 noise distribution",
      "Subsampling of frequent words",
      "Center vs outside vectors",
      "3CosAdd word analogies and cosine similarity"
    ],
    objectives: [
      "Explain why the naive softmax skip-gram objective is expensive and how negative sampling approximates it",
      "Derive the gradients of the naive-softmax and negative-sampling losses w.r.t. the center and outside vectors",
      "Explain why word2vec keeps two vectors per word and what you do with them after training",
      "Explain the role of the 3/4 power in the noise distribution and of frequent-word subsampling",
      "Solve analogies of the form a : b :: c : ? with cosine similarity and explain why a, b, c are excluded",
      "Read a 2-D projection of embeddings critically (what PCA preserves and what it hides)"
    ],
    requirements: [
      "Python 3.10+, NumPy only for tasks 0–4 and 7 (no PyTorch, TensorFlow, gensim or scikit-learn in those files)",
      "Matplotlib and scikit-learn are allowed only in the visualization notebook",
      "All randomness seeded (np.random.default_rng(seed))"
    ],
    quiz: [
      {
        q: "In skip-gram with negative sampling, what is the loss for one (center c, outside o) pair with K negatives w_1..w_K?",
        options: [
          "$-\\log \\sigma(u_o^\\top v_c) - \\sum_k \\log \\sigma(-u_{w_k}^\\top v_c)$",
          "$-\\log \\mathrm{softmax}(U v_c)_o$",
          "$-\\log \\sigma(u_o^\\top v_c) + \\sum_k \\log \\sigma(u_{w_k}^\\top v_c)$",
          "$\\|u_o - v_c\\|^2 - \\sum_k \\|u_{w_k} - v_c\\|^2$"
        ],
        answer: 0,
        why: "Positive pair pushed towards σ(·)=1, each negative towards σ(−·)=1; this replaces the |V|-way softmax with K+1 binary logistic terms."
      },
      {
        q: "Why is the unigram distribution raised to the power 3/4 to sample negatives?",
        options: [
          "It makes sampling exact",
          "It flattens the distribution, sampling rare words more often than their raw frequency",
          "It removes stop words entirely",
          "It guarantees the positive word is never sampled"
        ],
        answer: 1,
        why: "p^{3/4} renormalised boosts low-frequency words relative to very frequent ones; it was found empirically to work best."
      },
      {
        q: "The gradient of the naive-softmax loss $J=-\\log \\hat y_o$ w.r.t. the center vector $v_c$ is:",
        options: [
          "$U^\\top(\\hat y - y)$",
          "$(\\hat y - y)v_c^\\top$",
          "$-u_o$",
          "$U^\\top \\hat y$"
        ],
        answer: 0,
        why: "With scores $s=Uv_c$, $\\partial J/\\partial s = \\hat y - y$, then chain rule through $s=Uv_c$ gives $U^\\top(\\hat y - y)$ (observed minus expected outside vector, negated)."
      },
      {
        q: "For the analogy man : king :: woman : ?, which vector do you compare candidates to (3CosAdd, unit-normalised embeddings)?",
        options: [
          "$e_{man} - e_{king} + e_{woman}$",
          "$e_{king} - e_{man} + e_{woman}$",
          "$e_{king} + e_{man} - e_{woman}$",
          "$e_{woman} - e_{king}$"
        ],
        answer: 1,
        why: "b − a + c: king − man + woman ≈ queen; the three query words are excluded from the candidates."
      }
    ],
    tasks: [
      {
        title: "Softmax and the naive-softmax skip-gram loss",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §0-softmax_loss.py§ with three functions (NumPy only):

- §sigmoid(x)§ — element-wise logistic function on an ndarray of any shape.
- §softmax(x)§ — softmax along the **last axis**, numerically stable (subtract the max). Works on 1-D and 2-D arrays; must not produce §nan§/§inf§ for inputs like §[1000, 1001, 1002]§.
- §naive_softmax_loss_and_gradient(center_vec, outside_idx, outside_vectors)§

  - §center_vec§: §(d,)§ — the center word vector $v_c$
  - §outside_idx§: §int§ — index $o$ of the observed outside word
  - §outside_vectors§: §(V, d)§ — matrix $U$ whose rows are outside vectors $u_w$
  - returns §(loss, grad_center_vec, grad_outside_vecs)§ with shapes §()§ (Python float or 0-d), §(d,)§, §(V, d)§

$$J_{\text{naive}}(v_c, o, U) = -\log \frac{\exp(u_o^\top v_c)}{\sum_{w=1}^{V} \exp(u_w^\top v_c)}$$

No Python loops over the vocabulary. Also create the project §README.md§ (≥ 150 words): what word2vec is, the files in this directory, and how to reproduce your training run.

§§§python
>>> import numpy as np
>>> from importlib import import_module
>>> m = import_module('0-softmax_loss')
>>> U = np.eye(3); v = np.array([1., 0., 0.])
>>> loss, gv, gU = m.naive_softmax_loss_and_gradient(v, 0, U)
>>> round(float(loss), 4)
0.5514
§§§`,
        files: ["0-softmax_loss.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 150 },
          { type: "defines", path: "0-softmax_loss.py", names: ["sigmoid", "softmax", "naive_softmax_loss_and_gradient"] },
          { type: "not_contains", path: "0-softmax_loss.py", pattern: "import (torch|tensorflow|gensim)|from (torch|sklearn|gensim)", label: "NumPy only" },
          {
            type: "py_test", files: ["0-softmax_loss.py"], label: "loss, gradients and stable softmax match reference",
            code: py(String.raw`m = import_module('0-softmax_loss')
rng = np.random.default_rng(0)
s = m.sigmoid(np.array([0.0, 2.0, -3.0]))
assert np.allclose(s, 1/(1+np.exp(-np.array([0.0, 2.0, -3.0])))), "sigmoid wrong"
x = np.array([[1000., 1001., 1002.], [-5., 0., 5.]])
out = m.softmax(x)
assert out.shape == (2, 3) and np.all(np.isfinite(out)), "softmax not stable"
ref = np.exp(x - x.max(axis=1, keepdims=True)); ref /= ref.sum(axis=1, keepdims=True)
assert np.allclose(out, ref), "softmax wrong (last axis)"
assert np.allclose(m.softmax(np.array([1., 2., 3.])), ref[0]), "softmax 1-D wrong"
for trial in range(5):
    V, d = 15, 6
    U = rng.normal(size=(V, d)); v = rng.normal(size=d); o = int(rng.integers(V))
    sc = U @ v; p = np.exp(sc - sc.max()); p /= p.sum()
    y = np.zeros(V); y[o] = 1
    loss, gv, gU = m.naive_softmax_loss_and_gradient(v, o, U)
    assert np.isclose(float(loss), -np.log(p[o])), "loss wrong"
    assert np.asarray(gv).shape == (d,) and np.asarray(gU).shape == (V, d), "bad gradient shapes"
    assert np.allclose(gv, U.T @ (p - y), atol=1e-8), "grad wrt center wrong"
    assert np.allclose(gU, np.outer(p - y, v), atol=1e-8), "grad wrt outside vectors wrong"
print("ok")`)
          }
        ]
      },
      {
        title: "Negative-sampling loss and gradients",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Create §1-neg_sampling.py§ with

§neg_sampling_loss_and_gradient(center_vec, outside_idx, outside_vectors, neg_indices)§

- §center_vec§ §(d,)§, §outside_idx§ §int§, §outside_vectors§ §(V, d)§ as in task 0
- §neg_indices§: 1-D int array of length $K$ — indices of the negative samples. It **may contain repeated indices** and never contains §outside_idx§.
- returns §(loss, grad_center_vec, grad_outside_vecs)§ with shapes §()§, §(d,)§, §(V, d)§

$$J_{\text{neg}}(v_c, o, U) = -\log \sigma(u_o^\top v_c) - \sum_{k=1}^{K} \log \sigma(-u_{w_k}^\top v_c)$$

A negative that is drawn twice contributes twice — to the loss **and** to the gradient of its row (use §np.add.at§ or equivalent; fancy-index assignment §G[idx] += ...§ silently drops duplicates). Only rows $o$ and $w_k$ of §grad_outside_vecs§ may be non-zero. Vectorise over the $K$ negatives (no Python loop over them). You may import §sigmoid§ from §0-softmax_loss.py§ with §importlib§.`,
        files: ["1-neg_sampling.py"],
        checks: [
          { type: "defines", path: "1-neg_sampling.py", names: ["neg_sampling_loss_and_gradient"] },
          { type: "not_contains", path: "1-neg_sampling.py", pattern: "import (torch|tensorflow|gensim)|from (torch|sklearn|gensim)", label: "NumPy only" },
          {
            type: "py_test", files: ["0-softmax_loss.py", "1-neg_sampling.py"], label: "matches reference, handles repeated negatives, passes a numerical gradient check",
            code: py(String.raw`m = import_module('1-neg_sampling')
sig = lambda z: 1/(1+np.exp(-z))
def ref(v, o, U, neg):
    uo = U[o]; Un = U[neg]
    loss = -np.log(sig(uo @ v)) - np.sum(np.log(sig(-(Un @ v))))
    gv = (sig(uo @ v) - 1) * uo + (sig(Un @ v)[:, None] * Un).sum(0)
    gU = np.zeros_like(U); gU[o] += (sig(uo @ v) - 1) * v
    np.add.at(gU, neg, sig(Un @ v)[:, None] * v[None, :])
    return loss, gv, gU
rng = np.random.default_rng(0)
V, d = 12, 5
U = rng.normal(size=(V, d)) * 0.5; v = rng.normal(size=d) * 0.5; o = 3
neg = np.array([1, 1, 5, 7, 1, 9, 2, 2, 0, 11])
loss, gv, gU = m.neg_sampling_loss_and_gradient(v, o, U, neg)
rl, rgv, rgU = ref(v, o, U, neg)
assert np.isclose(float(loss), rl), "loss wrong (did you count repeated negatives?)"
assert np.allclose(gv, rgv, atol=1e-8), "grad wrt center wrong"
assert np.allclose(gU, rgU, atol=1e-8), "grad wrt outside vectors wrong (repeated indices must accumulate)"
untouched = [i for i in range(V) if i != o and i not in set(neg.tolist())]
assert np.allclose(np.asarray(gU)[untouched], 0), "rows of unused words must be zero"
eps = 1e-6; num = np.zeros(d)
for i in range(d):
    e = np.zeros(d); e[i] = eps
    lp = m.neg_sampling_loss_and_gradient(v + e, o, U, neg)[0]
    lm = m.neg_sampling_loss_and_gradient(v - e, o, U, neg)[0]
    num[i] = (float(lp) - float(lm)) / (2 * eps)
assert np.allclose(num, gv, atol=1e-5), "numerical gradient check failed"
print("ok")`)
          }
        ]
      },
      {
        title: "Skip-gram over a context window",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §2-skipgram.py§ with

§skipgram(center_idx, outside_indices, center_vectors, outside_vectors, neg_samples)§

- §center_idx§: §int§ — index of the center word
- §outside_indices§: list/1-D array of length $m$ — the words in the window (may contain repeats and may even contain §center_idx§)
- §center_vectors§: §(V, d)§ — matrix of center vectors (rows $v_w$)
- §outside_vectors§: §(V, d)§ — matrix of outside vectors (rows $u_w$)
- §neg_samples§: int array §(m, K)§ — row $j$ holds the negatives for the pair (§center_idx§, §outside_indices[j]§)
- returns §(loss, grad_center_vectors, grad_outside_vectors)§, shapes §()§, §(V, d)§, §(V, d)§

The loss is the **sum** over $j$ of §neg_sampling_loss_and_gradient§ for each pair. Only row §center_idx§ of §grad_center_vectors§ may be non-zero. Import task 1's function with §importlib.import_module('1-neg_sampling')§ — do not copy-paste it.`,
        files: ["2-skipgram.py"],
        checks: [
          { type: "defines", path: "2-skipgram.py", names: ["skipgram"] },
          { type: "contains", path: "2-skipgram.py", pattern: "1-neg_sampling", label: "reuses task 1 via importlib" },
          {
            type: "py_test", files: ["0-softmax_loss.py", "1-neg_sampling.py", "2-skipgram.py"], label: "window loss and gradients match reference",
            code: py(String.raw`m = import_module('2-skipgram')
sig = lambda z: 1/(1+np.exp(-z))
rng = np.random.default_rng(0)
V, d, K = 10, 4, 4
C = rng.normal(size=(V, d)) * 0.5; U = rng.normal(size=(V, d)) * 0.5
c = 2; outs = [3, 5, 3, 2, 9]
neg = np.stack([rng.choice([w for w in range(V) if w != o], size=K) for o in outs])
L = 0.0; gC = np.zeros_like(C); gU = np.zeros_like(U); v = C[c]
for j, o in enumerate(outs):
    n = neg[j]; Un = U[n]
    L += -np.log(sig(U[o] @ v)) - np.sum(np.log(sig(-(Un @ v))))
    gC[c] += (sig(U[o] @ v) - 1) * U[o] + (sig(Un @ v)[:, None] * Un).sum(0)
    gU[o] += (sig(U[o] @ v) - 1) * v
    np.add.at(gU, n, sig(Un @ v)[:, None] * v[None, :])
loss, gc, gu = m.skipgram(c, outs, C, U, neg)
assert np.isclose(float(loss), L), "loss must be the sum over the window"
assert np.asarray(gc).shape == (V, d) and np.asarray(gu).shape == (V, d)
assert np.allclose(gc, gC, atol=1e-8), "grad wrt center vectors wrong"
assert np.allclose(gu, gU, atol=1e-8), "grad wrt outside vectors wrong"
mask = np.ones(V, bool); mask[c] = False
assert np.allclose(np.asarray(gc)[mask], 0), "only the center row may be non-zero"
print("ok")`)
          }
        ]
      },
      {
        title: "Analogies and nearest neighbours",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §3-analogy.py§ with two functions. In both, **first L2-normalise every row** of §embeddings§ (shape §(V, d)§); §word2idx§ is a §dict§ word→row and §idx2word§ a list (or dict) row→word.

- §nearest_neighbors(word, embeddings, word2idx, idx2word, k=10)§ → list of the §k§ words with the highest cosine similarity to §word§, best first, **excluding** §word§ itself.
- §analogy(a, b, c, embeddings, word2idx, idx2word, k=1)§ → list of §k§ words solving "§a§ is to §b§ as §c§ is to ?" by 3CosAdd: rank candidates $x$ by $\cos(\hat e_x, \hat e_b - \hat e_a + \hat e_c)$, best first, excluding §a§, §b§ and §c§.

Vectorised: one matrix–vector product per query, no loop over the vocabulary. Raise §KeyError§ for an out-of-vocabulary word.

§§§python
>>> analogy('man', 'king', 'woman', E, w2i, i2w, k=3)
['queen', 'princess', 'monarch']   # with good embeddings
§§§`,
        files: ["3-analogy.py"],
        checks: [
          { type: "defines", path: "3-analogy.py", names: ["nearest_neighbors", "analogy"] },
          {
            type: "py_test", files: ["3-analogy.py"], label: "3CosAdd ranking and exclusions match reference",
            code: py(String.raw`m = import_module('3-analogy')
rng = np.random.default_rng(0)
V, d = 60, 8
E = rng.normal(size=(V, d)) * rng.uniform(0.5, 3.0, size=(V, 1))
words = ['w%d' % i for i in range(V)]; w2i = {w: i for i, w in enumerate(words)}
En = E / np.linalg.norm(E, axis=1, keepdims=True)
for (a, b, c) in [(0, 1, 2), (5, 9, 13), (40, 3, 22)]:
    t = En[b] - En[a] + En[c]
    s = En @ t / np.linalg.norm(t); s[[a, b, c]] = -np.inf
    exp = [words[i] for i in np.argsort(-s)[:5]]
    got = list(m.analogy(words[a], words[b], words[c], E, w2i, words, k=5))
    assert got == exp, "analogy ranking wrong (normalise rows first, exclude a, b, c)"
s = En @ En[7]; s[7] = -np.inf
exp = [words[i] for i in np.argsort(-s)[:6]]
got = list(m.nearest_neighbors('w7', E, w2i, words, k=6))
assert got == exp, "nearest_neighbors wrong"
try:
    m.analogy('nope', 'w1', 'w2', E, w2i, words)
    raise AssertionError("expected KeyError for OOV word")
except KeyError:
    pass
print("ok")`)
          }
        ]
      },
      {
        title: "Train word2vec on a real corpus",
        type: "mandatory",
        kind: "code",
        points: 4,
        body: md`Write §4-train.py§ that trains skip-gram with negative sampling **using your own gradients from tasks 1–2** (you may batch/vectorise them; no autograd).

Requirements:
- Corpus: at least **1,000,000 tokens** of English (the first 1–5 M words of [text8](http://mattmahoney.net/dc/text8.zip) are recommended). Lower-case, keep words with count ≥ 5.
- $d = 100$, window size 5 (each side), $K \ge 5$ negatives drawn from the unigram$^{0.75}$ distribution, plain SGD with a linearly decaying learning rate, ≥ 1 epoch, fixed seed.
- Evaluate on the Google analogy test set (§questions-words.txt§, 19,544 questions) restricted to questions whose 4 words are all in your vocabulary, using your §analogy§ function with §k=10§.
- Save the final embeddings (§embeddings.npy§ + §vocab.txt§, git-LFS or a release if > 50 MB — or commit only the top-10k rows) and write §results.json§:

§§§json
{"corpus_tokens": 5000000, "vocab_size": 30000, "epochs": 1,
 "final_avg_loss": 2.4, "analogy_questions_evaluated": 9000,
 "analogy_top10_accuracy": 0.21}
§§§

Thresholds: §corpus_tokens ≥ 1e6§, §vocab_size ≥ 5000§, §final_avg_loss < 3.0§ (average $J_{neg}$ per (center, outside) pair over the last 10% of training), §analogy_top10_accuracy ≥ 0.08§. Expect several CPU hours on 5 M tokens with a naive loop — vectorise over mini-batches of pairs.`,
        files: ["4-train.py", "results.json"],
        checks: [
          { type: "exists", path: "4-train.py" },
          { type: "not_contains", path: "4-train.py", pattern: "import (torch|tensorflow|gensim)|from (torch|tensorflow|gensim)", label: "no autograd / gensim" },
          { type: "contains", path: "4-train.py", pattern: "0\\.75", label: "unigram^0.75 noise distribution" },
          { type: "json_metric", path: "results.json", key: "corpus_tokens", op: ">=", value: 1000000 },
          { type: "json_metric", path: "results.json", key: "final_avg_loss", op: "<", value: 3.0 },
          { type: "json_metric", path: "results.json", key: "analogy_top10_accuracy", op: ">=", value: 0.08 }
        ]
      },
      {
        title: "Visualise the embedding space",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Create §5-visualize.ipynb§ (committed **with outputs**) that loads your trained embeddings and:

1. Prints the 10 nearest neighbours of at least 8 probe words (e.g. §france§, §king§, §computer§, §good§, §three§, §walked§, …).
2. Projects the vectors of ≥ 6 analogy quadruples (§man/woman/king/queen§, §france/paris/italy/rome§, §walk/walked/swim/swam§, …) to 2-D with PCA **fitted on the 10k most frequent words** and draws arrows a→b and c→d. Save the figure as §analogies.png§.
3. Ends with a markdown cell (≥ 100 words) discussing at least one failure case and what PCA hides.`,
        files: ["5-visualize.ipynb", "analogies.png"],
        checks: [
          { type: "notebook_executed", path: "5-visualize.ipynb" },
          { type: "exists", path: "analogies.png" }
        ]
      },
      {
        title: "Derivation: word2vec gradients",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`Write §written/6-word2vec_gradients.pdf§ (PDF, Markdown or LaTeX accepted) answering, by hand:

1. Show that the naive-softmax loss equals the cross-entropy between the one-hot $y$ and $\hat y = \mathrm{softmax}(Uv_c)$.
2. Derive $\partial J_{\text{naive}}/\partial v_c$ and $\partial J_{\text{naive}}/\partial u_w$ for both $w = o$ and $w \neq o$, and write them in vectorised form.
3. Derive the gradients of $J_{\text{neg}}$ w.r.t. $v_c$, $u_o$ and $u_{w_k}$, **including the case where the same word is drawn twice**. Use $\sigma'(x) = \sigma(x)(1-\sigma(x))$ and $1-\sigma(x) = \sigma(-x)$.
4. Compare the cost of one gradient step under both losses as a function of $V$, $d$, $K$, and explain why negative sampling is much cheaper.
5. Explain in one paragraph why the dot product $u_o^\top v_c$ is a sensible "compatibility" score and what happens to frequent words without subsampling.`,
        deliverable: "repo",
        files: ["written/6-word2vec_gradients.pdf"],
        rubric: "derivation",
        criteria: [
          "Shows cross-entropy with a one-hot target reduces to −log ŷ_o",
          "Obtains ∂J/∂v_c = U^T(ŷ − y) and ∂J/∂U = (ŷ − y)v_c^T with the w = o / w ≠ o cases",
          "Obtains the three negative-sampling gradients with (σ(u_o^T v_c) − 1) and σ(u_k^T v_c) factors",
          "Explicitly handles repeated negative samples (gradients add up)",
          "Gives O(Vd) vs O(Kd) per-pair cost comparison"
        ]
      },
      {
        title: "Noise distribution and frequent-word subsampling",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`Create §100-sampling.py§ (NumPy only) with:

- §noise_distribution(counts, power=0.75)§ — §counts§: 1-D array of non-negative word counts. Returns the probability vector $P_n(w) = c_w^{p} / \sum_{w'} c_{w'}^{p}$.
- §keep_probabilities(counts, t=1e-5)§ — with $f_w = c_w / \sum c$, return $P_{\text{keep}}(w) = \min\left(1, \sqrt{t / f_w}\right)$ (Mikolov et al. 2013b; words with count 0 get keep probability 1).
- §sample_negatives(probs, shape, rng)§ — draw an int array of the given §shape§ from §probs§ using the §np.random.Generator§ §rng§ (§rng.choice§ or inverse-CDF with §np.searchsorted§).

Then use them in §4-train.py§ and report in your README how much subsampling shortened the corpus.`,
        files: ["100-sampling.py"],
        checks: [
          { type: "defines", path: "100-sampling.py", names: ["noise_distribution", "keep_probabilities", "sample_negatives"] },
          {
            type: "py_test", files: ["100-sampling.py"], label: "noise distribution, keep probabilities and sampler are correct",
            code: py(String.raw`m = import_module('100-sampling')
counts = np.array([1000000, 50000, 3000, 200, 10, 0], dtype=float)
p = np.asarray(m.noise_distribution(counts))
ref = counts ** 0.75; ref /= ref.sum()
assert np.allclose(p, ref) and np.isclose(p.sum(), 1.0), "noise distribution wrong"
assert np.allclose(m.noise_distribution(counts, power=1.0), counts / counts.sum())
k = np.asarray(m.keep_probabilities(counts, t=1e-3))
f = counts / counts.sum()
with np.errstate(divide='ignore'):
    rk = np.where(f > 0, np.minimum(1.0, np.sqrt(1e-3 / np.where(f > 0, f, 1))), 1.0)
assert np.allclose(k, rk), "keep probabilities wrong"
rng = np.random.default_rng(0)
s = np.asarray(m.sample_negatives(ref, (200, 100), rng))
assert s.shape == (200, 100) and s.min() >= 0 and s.max() < len(counts)
freq = np.bincount(s.ravel(), minlength=len(counts)) / s.size
assert np.allclose(freq, ref, atol=0.01), "sampler does not follow probs"
print("ok")`)
          }
        ]
      }
    ]
  },

  // ───────────────────────────────────────────────────────────── A21
  {
    id: "A21",
    track: "applied",
    phase: PHASE,
    title: "Neural Dependency Parsing (Arc-Standard)",
    days: 3,
    repo: REPO,
    dir: "0x01-dependency_parsing",
    sources: [
      { course: "CS224N", lectures: "Lec 3–4", topics: "Backprop & neural nets for NLP, dependency grammar, transition-based parsing, neural dependency parsing" }
    ],
    resources: [
      { title: "CS224N course site (Assignment on neural dependency parsing)", url: "https://web.stanford.edu/class/cs224n/" },
      { title: "Chen & Manning 2014 — A Fast and Accurate Dependency Parser using Neural Networks", url: "https://aclanthology.org/D14-1082/" },
      { title: "Nivre 2008 — Algorithms for Deterministic Incremental Dependency Parsing", url: "https://aclanthology.org/J08-4003/" },
      { title: "Universal Dependencies (treebanks & guidelines)", url: "https://universaldependencies.org/" },
      { title: "Kingma & Ba — Adam: A Method for Stochastic Optimization", url: "https://arxiv.org/abs/1412.6980" }
    ],
    concepts: [
      "Dependency trees, heads and dependents",
      "Projectivity",
      "Arc-standard transition system (SHIFT, LEFT-ARC, RIGHT-ARC)",
      "Static oracle",
      "Feature templates from stack/buffer configurations",
      "Embedding lookup as matrix indexing",
      "Unlabeled attachment score (UAS)"
    ],
    objectives: [
      "Run the arc-standard system by hand on a sentence and explain why it needs exactly 2n transitions",
      "Write a static oracle that turns a projective gold tree into a transition sequence",
      "Explain why arc-standard cannot produce non-projective trees",
      "Describe the Chen & Manning feature set and network (embeddings → hidden ReLU → softmax over transitions)",
      "Explain how minibatching works when parses finish at different times",
      "Compute and interpret UAS, and classify common parsing errors (PP attachment, coordination, …)"
    ],
    requirements: [
      "Tasks 0–2, 4 and 7: pure Python 3.10+ (NumPy allowed), no parsing libraries (no spaCy, Stanza, NLTK parsers)",
      "Tasks 3 and 5: PyTorch; nn.Linear and nn.Embedding are forbidden in the model (use nn.Parameter)"
    ],
    quiz: [
      {
        q: "In the arc-standard system with stack [ROOT, he, ate] and buffer [fish], what does LEFT-ARC do?",
        options: [
          "Adds ate → he and removes 'he' from the stack",
          "Adds he → ate and removes 'ate' from the stack",
          "Moves 'fish' to the stack",
          "Adds ate → fish"
        ],
        answer: 0,
        why: "LEFT-ARC makes the second item (he) a dependent of the top item (ate) and pops the dependent."
      },
      {
        q: "How many transitions does arc-standard need to parse a sentence of n words?",
        options: ["n", "2n", "n²", "It depends on the tree"],
        answer: 1,
        why: "Each word is shifted exactly once (n SHIFTs) and attached exactly once (n arcs), so 2n transitions."
      },
      {
        q: "Which trees can the arc-standard system produce?",
        options: [
          "Any dependency tree",
          "Only projective trees",
          "Only trees where every head precedes its dependents",
          "Only binary trees"
        ],
        answer: 1,
        why: "Arcs are only created between adjacent stack items, which can never create crossing arcs."
      },
      {
        q: "UAS is",
        options: [
          "The fraction of sentences parsed exactly right",
          "The fraction of tokens whose predicted head is correct (labels ignored)",
          "The fraction of tokens with correct head and label",
          "The F1 of predicted arcs vs gold arcs per sentence, averaged over sentences"
        ],
        answer: 1,
        why: "Unlabeled attachment score counts tokens with the correct head; LAS additionally requires the correct label."
      }
    ],
    tasks: [
      {
        title: "Arc-standard partial parse",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §0-partial_parse.py§ with a class §PartialParse§:

- §__init__(self, sentence)§: §sentence§ is a list of words (strings). Store §self.sentence§ and initialise **lists** §self.stack = ["ROOT"]§, §self.buffer§ = a copy of the sentence, §self.dependencies = []§. Must not mutate the caller's list.
- §parse_step(self, transition)§: apply one transition:
  - §"S"§ (SHIFT): move the first buffer word to the top of the stack;
  - §"LA"§ (LEFT-ARC): the **second** stack item becomes a dependent of the **top** item; append §(head, dependent)§ to §dependencies§ and remove the dependent from the stack;
  - §"RA"§ (RIGHT-ARC): the **top** item becomes a dependent of the **second**; append §(head, dependent)§ and remove the dependent.
  - Any other string → §raise ValueError§.
- §parse(self, transitions)§: apply a list of transitions, return §self.dependencies§.

Also create §README.md§ (≥ 120 words) for the directory.

§§§python
>>> PartialParse(["parse", "this", "sentence"]).parse(["S", "S", "S", "LA", "RA", "RA"])
[('sentence', 'this'), ('parse', 'sentence'), ('ROOT', 'parse')]
§§§`,
        files: ["0-partial_parse.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 120 },
          { type: "defines", path: "0-partial_parse.py", names: ["PartialParse"] },
          {
            type: "py_test", files: ["0-partial_parse.py"], label: "transitions update stack/buffer/dependencies correctly",
            code: py(String.raw`m = import_module('0-partial_parse')
PP = m.PartialParse
s = ["parse", "this", "sentence"]
pp = PP(s)
assert pp.stack == ["ROOT"] and pp.buffer == s and pp.dependencies == []
pp.parse_step("S")
assert s == ["parse", "this", "sentence"], "caller's sentence was mutated"
assert pp.stack == ["ROOT", "parse"] and pp.buffer == ["this", "sentence"]
p2 = PP(["a", "b", "c"]); p2.parse_step("S"); p2.parse_step("S"); p2.parse_step("LA")
assert p2.stack == ["ROOT", "b"] and p2.buffer == ["c"] and p2.dependencies == [("b", "a")], "LEFT-ARC wrong"
p2.parse_step("S"); p2.parse_step("RA")
assert p2.stack == ["ROOT", "b"] and p2.dependencies[-1] == ("b", "c"), "RIGHT-ARC wrong"
deps = PP(["parse", "this", "sentence"]).parse(["S", "S", "S", "LA", "RA", "RA"])
assert sorted(map(tuple, deps)) == sorted([("sentence", "this"), ("parse", "sentence"), ("ROOT", "parse")])
try:
    PP(["x"]).parse_step("X"); raise AssertionError("expected ValueError")
except ValueError:
    pass
print("ok")`)
          }
        ]
      },
      {
        title: "Minibatch parsing",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §1-minibatch_parse.py§ with §minibatch_parse(sentences, model, batch_size)§:

- §sentences§: list of sentences (lists of words); §model§: any object with §model.predict(partial_parses) -> list[str]§ returning one transition per partial parse; §batch_size§: int ≥ 1.
- Algorithm: create one §PartialParse§ per sentence (import it from §0-partial_parse.py§ via §importlib§); keep a queue of **unfinished** parses; repeatedly take the first §batch_size§ unfinished parses, call §model.predict§ **once** on that minibatch, apply each transition, and remove parses that are finished (empty buffer and stack of size 1). Never pass a finished parse to the model.
- Return §dependencies§: a list where §dependencies[i]§ is the list of §(head, dependent)§ tuples for §sentences[i]§ (same order as the input, even though sentences finish at different times).`,
        files: ["1-minibatch_parse.py"],
        checks: [
          { type: "defines", path: "1-minibatch_parse.py", names: ["minibatch_parse"] },
          {
            type: "py_test", files: ["0-partial_parse.py", "1-minibatch_parse.py"], label: "batched parsing with a dummy model",
            code: py(String.raw`m = import_module('1-minibatch_parse')
class Dummy:
    def __init__(self): self.sizes = []
    def predict(self, pps):
        self.sizes.append(len(pps))
        out = []
        for pp in pps:
            assert not (len(pp.buffer) == 0 and len(pp.stack) == 1), "finished parse passed to model"
            if pp.buffer: out.append("S")
            elif len(pp.stack) == 2 or pp.stack[1] == "right": out.append("RA")
            else: out.append("LA")
        return out
def ref_parse(sent):
    st, buf, deps = ["ROOT"], list(sent), []
    while buf or len(st) > 1:
        if buf: st.append(buf.pop(0))
        elif len(st) == 2 or st[1] == "right": deps.append((st[-2], st[-1])); st.pop()
        else: deps.append((st[-1], st[-2])); st.pop(-2)
    return deps
sents = [["right", "arcs", "only"], ["right", "arcs", "only", "again"], ["left", "arcs", "only"],
         ["left", "arcs", "only", "again"], ["x"], ["right", "a", "b", "c", "d", "e"]]
d = Dummy()
deps = m.minibatch_parse(sents, d, 2)
assert len(deps) == len(sents)
for s, got in zip(sents, deps):
    assert sorted(map(tuple, got)) == sorted(ref_parse(s)), "wrong dependencies (or wrong order) for %s" % s
assert max(d.sizes) <= 2 and max(d.sizes) == 2, "minibatches must have at most batch_size parses"
d3 = Dummy(); m.minibatch_parse(sents, d3, 4)
assert max(d3.sizes) == 4 and len(d3.sizes) < sum(2 * len(s) for s in sents), "model must be called on batches"
print("ok")`)
          }
        ]
      },
      {
        title: "Static oracle",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`To train the parser you need gold transition sequences. Create §2-oracle.py§ with §get_oracle(heads)§:

- §heads§: list of length $n$; §heads[i]§ is the head of word §i+1§ (words are numbered §1..n§, §0§ is ROOT). The tree is guaranteed **projective** with exactly one word attached to ROOT.
- Return the list of transitions (§"S"§, §"LA"§, §"RA"§) that makes the arc-standard system (stack §[0]§, buffer §[1..n]§) produce exactly the gold arcs. Use the standard rule: LEFT-ARC if the second stack item's head is the top; RIGHT-ARC if the top's head is the second **and the top has already collected all its dependents**; otherwise SHIFT.
- Never apply LEFT-ARC when the second item is ROOT. Must run in $O(n)$ transitions (exactly $2n$).

Pure Python. The test simulates your transitions on randomly generated projective trees.`,
        files: ["2-oracle.py"],
        checks: [
          { type: "defines", path: "2-oracle.py", names: ["get_oracle"] },
          {
            type: "py_test", files: ["2-oracle.py"], label: "oracle reproduces random projective trees",
            code: py(String.raw`import random
m = import_module('2-oracle')
def simulate(n, trans):
    st, buf, arcs = [0], list(range(1, n + 1)), set()
    for t in trans:
        if t == "S":
            assert buf, "SHIFT on empty buffer"; st.append(buf.pop(0))
        elif t == "LA":
            assert len(st) >= 2 and st[-2] != 0, "illegal LEFT-ARC"; arcs.add((st[-1], st[-2])); st.pop(-2)
        elif t == "RA":
            assert len(st) >= 2, "illegal RIGHT-ARC"; arcs.add((st[-2], st[-1])); st.pop()
        else:
            raise AssertionError("unknown transition %r" % t)
    assert not buf and st == [0], "parse not finished"
    return arcs
def rand_tree(n, rnd):
    heads = [None] * (n + 1)
    def build(lo, hi, parent):
        if lo > hi: return
        r = rnd.randint(lo, hi); heads[r] = parent
        for a, b in ((lo, r - 1), (r + 1, hi)):
            cuts = sorted(rnd.sample(range(a, b + 1), k=min(rnd.randint(0, 2), max(0, b - a + 1)))) if b >= a else []
            starts = [a] + [c for c in cuts if c > a]
            for i, st_ in enumerate(starts):
                en = (starts[i + 1] - 1) if i + 1 < len(starts) else b
                build(st_, en, r)
    build(1, n, 0)
    return heads[1:]
assert simulate(3, m.get_oracle([2, 0, 2])) == {(2, 1), (0, 2), (2, 3)}
rnd = random.Random(0)
for _ in range(300):
    n = rnd.randint(1, 14)
    h = rand_tree(n, rnd)
    tr = list(m.get_oracle(list(h)))
    assert len(tr) == 2 * n, "need exactly 2n transitions"
    assert simulate(n, tr) == {(h[i], i + 1) for i in range(n)}, "arcs differ from gold for heads=%s" % h
print("ok")`)
          }
        ]
      },
      {
        title: "Neural parser model (PyTorch)",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Create §3-parser_model.py§ with §class ParserModel(torch.nn.Module)§ following Chen & Manning (2014) / CS224N:

- §__init__(self, embeddings, n_features=36, hidden_size=200, n_classes=3, dropout_prob=0.5)§ — §embeddings§ is a §(num_words, embed_size)§ NumPy array of pretrained vectors (word + POS tokens) that becomes a trainable §nn.Parameter§.
- §embedding_lookup(self, w)§: §w§ is a §(batch, n_features)§ LongTensor of token ids → returns §(batch, n_features * embed_size)§ by **indexing** the embedding matrix and reshaping (no §nn.Embedding§).
- §forward(self, w)§ → logits §(batch, n_classes)§: $h = \mathrm{ReLU}(xW + b_1)$, dropout, $\text{logits} = hU + b_2$. Weights are §nn.Parameter§s initialised with §nn.init.xavier_uniform_§ (no §nn.Linear§).
- Feature extraction: 18 word + 18 POS features — top 3 stack words, top 3 buffer words, the first and second left-/right-most children of the top two stack words, and the left-most-of-left-most / right-most-of-right-most children (see the paper). Put it in §parser_utils.py§ (you may adapt the CS224N starter code; credit it in the README).`,
        files: ["3-parser_model.py", "parser_utils.py"],
        checks: [
          { type: "defines", path: "3-parser_model.py", names: ["ParserModel"] },
          { type: "contains", path: "3-parser_model.py", pattern: "import torch", label: "uses PyTorch" },
          { type: "contains", path: "3-parser_model.py", pattern: "xavier_uniform_", label: "Xavier initialisation" },
          { type: "contains", path: "3-parser_model.py", pattern: "def embedding_lookup", label: "defines embedding_lookup" },
          { type: "not_contains", path: "3-parser_model.py", pattern: "nn\\.(Linear|Embedding)\\b", label: "no nn.Linear / nn.Embedding" },
          { type: "exists", path: "parser_utils.py" }
        ]
      },
      {
        title: "Unlabeled attachment score",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Create §4-uas.py§ with §uas(pred_heads, gold_heads, ignore=None)§:

- §pred_heads§, §gold_heads§: lists of sentences, each a list of head indices (§0§ = ROOT) of equal length.
- §ignore§: optional list of lists of booleans; §True§ marks a token excluded from scoring (e.g. punctuation).
- Return the **micro-averaged** fraction (over all scored tokens of all sentences, not the mean of per-sentence scores) of tokens whose predicted head equals the gold head, as a float in $[0, 1]$. Raise §ValueError§ if two aligned sentences have different lengths.`,
        files: ["4-uas.py"],
        checks: [
          { type: "defines", path: "4-uas.py", names: ["uas"] },
          {
            type: "py_test", files: ["4-uas.py"], label: "micro-averaged UAS with ignore mask",
            code: py(String.raw`m = import_module('4-uas')
pred = [[2, 0, 2], [0, 1]]
gold = [[2, 0, 1], [0, 1]]
assert np.isclose(m.uas(pred, gold), 4 / 5), "UAS must be micro-averaged over tokens"
assert np.isclose(m.uas(pred, gold, ignore=[[False, False, True], [False, False]]), 1.0)
rng = np.random.default_rng(0)
P, G, I = [], [], []
for _ in range(50):
    n = int(rng.integers(1, 20))
    g = rng.integers(0, n + 1, size=n); p = np.where(rng.random(n) < 0.7, g, rng.integers(0, n + 1, size=n))
    ig = rng.random(n) < 0.1
    P.append(p.tolist()); G.append(g.tolist()); I.append(ig.tolist())
fp, fg, fi = (np.concatenate([np.array(x) for x in L]) for L in (P, G, I))
assert np.isclose(m.uas(P, G), np.mean(fp == fg))
assert np.isclose(m.uas(P, G, ignore=I), np.mean((fp == fg)[~fi.astype(bool)]))
try:
    m.uas([[1, 0]], [[0]]); raise AssertionError("expected ValueError")
except ValueError:
    pass
print("ok")`)
          }
        ]
      },
      {
        title: "Train and evaluate the parser",
        type: "mandatory",
        kind: "code",
        points: 4,
        body: md`Write §5-run.py§ that trains §ParserModel§ on the CS224N English Penn Treebank data (Stanford-dependencies conversion, as distributed with the CS224N parser assignment) using your oracle from task 2, Adam (lr ≈ 5e-4), cross-entropy, ~10 epochs, and selects the checkpoint with the best dev UAS. Parse dev and test with your §minibatch_parse§ and score with your §uas§ (punctuation included, as in the assignment).

Write §results.json§:

§§§json
{"dev_uas": 0.881, "test_uas": 0.886, "epochs": 10, "train_minutes": 42}
§§§

Thresholds: §dev_uas ≥ 0.85§ and §test_uas ≥ 0.85§ (as fractions, not percentages). Also commit §train_log.txt§ with per-epoch train loss and dev UAS.`,
        files: ["5-run.py", "results.json", "train_log.txt"],
        checks: [
          { type: "exists", path: "5-run.py" },
          { type: "contains", path: "5-run.py", pattern: "Adam", label: "uses Adam" },
          { type: "nonempty", path: "train_log.txt", minLines: 5 },
          { type: "json_metric", path: "results.json", key: "dev_uas", op: ">=", value: 0.85 },
          { type: "json_metric", path: "results.json", key: "test_uas", op: ">=", value: 0.85 }
        ]
      },
      {
        title: "Written: transitions, dropout, Adam and error analysis",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`Write §written/6-parsing.pdf§ (PDF, Markdown or LaTeX accepted):

1. Write the full configuration table (stack, buffer, new arc, transition) for parsing *"I attended lectures in the NLP class"* with its gold tree (attended→I, attended→lectures, attended→class, class→in, class→the, class→NLP, ROOT→attended). Prove that any sentence of $n$ words takes exactly $2n$ steps.
2. Dropout: with $h_{\text{drop}} = \gamma\, d \odot h$, $d_i \sim \text{Bernoulli}(1-p)$, derive $\gamma$ so that $\mathbb{E}[h_{\text{drop}}] = h$, and explain why dropout is off at evaluation time.
3. Adam: explain how the first moment $m$ reduces update variance and how dividing by $\sqrt{v}$ adapts per-parameter step sizes; which parameters get larger updates?
4. Error analysis: from your dev-set output, show **four** wrongly parsed sentences, one each for PP attachment, verb-phrase attachment, modifier attachment and coordination errors: give the wrong arc, the correct arc and why the parser might have chosen it.`,
        deliverable: "repo",
        files: ["written/6-parsing.pdf"],
        rubric: "derivation",
        criteria: [
          "Complete, correct 14-step configuration table for the example sentence",
          "Argument for exactly 2n transitions (each word shifted once and reduced once)",
          "Derives γ = 1/(1−p) from the expectation",
          "Explains momentum as variance reduction and v as per-parameter adaptive learning rate",
          "Four real dev-set errors, each with wrong arc, correct arc and error type"
        ]
      },
      {
        title: "Projectivity check",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`Real treebanks contain non-projective trees that arc-standard cannot produce. Create §100-projective.py§ with §is_projective(heads)§ (same §heads§ format as task 2, any valid tree, possibly non-projective) returning §True§ iff no two arcs cross when drawn above the sentence — the arc from ROOT (position 0) to its dependent counts. Then report in your README the percentage of non-projective training sentences and how your training script handles them.`,
        files: ["100-projective.py"],
        checks: [
          { type: "defines", path: "100-projective.py", names: ["is_projective"] },
          {
            type: "py_test", files: ["100-projective.py"], label: "agrees with a brute-force crossing check",
            code: py(String.raw`import random
m = import_module('100-projective')
def crossing(heads):
    arcs = [tuple(sorted((h, i + 1))) for i, h in enumerate(heads)]
    for a, b in arcs:
        for c, d in arcs:
            if a < c < b < d: return True
    return False
assert m.is_projective([2, 0, 2]) is True or m.is_projective([2, 0, 2]) == True
assert not m.is_projective([3, 4, 0, 3]), "arcs 3-1 and 4-2 cross"
rnd = random.Random(0); seen = {True: 0, False: 0}
for _ in range(400):
    n = rnd.randint(1, 9)
    order = list(range(1, n + 1)); rnd.shuffle(order)
    heads = [0] * n
    for j, w in enumerate(order):
        heads[w - 1] = 0 if j == 0 else order[rnd.randrange(j)]
    exp = not crossing(heads)
    assert bool(m.is_projective(heads)) == exp, "wrong answer for heads=%s" % heads
    seen[exp] += 1
assert seen[True] > 20 and seen[False] > 20
print("ok")`)
          }
        ]
      }
    ]
  },

  // ───────────────────────────────────────────────────────────── A22
  {
    id: "A22",
    track: "applied",
    phase: PHASE,
    title: "RNN & LSTM Language Models",
    days: 3,
    repo: REPO,
    dir: "0x02-rnn_lstm",
    sources: [
      { course: "CS224N", lectures: "Lec 5–6", topics: "Language models & RNNs, perplexity, LSTMs, vanishing/exploding gradients, gradient clipping" }
    ],
    resources: [
      { title: "CS224N course site (RNN & LSTM lecture notes)", url: "https://web.stanford.edu/class/cs224n/" },
      { title: "Karpathy — The Unreasonable Effectiveness of Recurrent Neural Networks", url: "https://karpathy.github.io/2015/05/21/rnn-effectiveness/" },
      { title: "Olah — Understanding LSTM Networks", url: "https://colah.github.io/posts/2015-08-Understanding-LSTMs/" },
      { title: "Pascanu, Mikolov & Bengio — On the difficulty of training recurrent neural networks", url: "https://arxiv.org/abs/1211.5063" },
      { title: "D2L — Long Short-Term Memory (LSTM)", url: "https://d2l.ai/chapter_recurrent-modern/lstm.html" }
    ],
    concepts: [
      "Autoregressive language modelling",
      "Perplexity and bits-per-character",
      "Backpropagation through time",
      "Vanishing and exploding gradients",
      "LSTM gates and the additive cell-state path",
      "Gradient clipping",
      "Temperature sampling"
    ],
    objectives: [
      "Write the LSTM equations from memory and explain the role of each gate",
      "Derive why gradients vanish or explode in a vanilla RNN in terms of the recurrent Jacobian",
      "Explain why the LSTM cell state mitigates vanishing gradients (and why it does not fully solve it)",
      "Compute perplexity from per-token log-probabilities and relate it to cross-entropy and bits-per-character",
      "Train a character-level LSTM language model and sample from it at different temperatures",
      "Explain truncated BPTT and gradient-norm clipping"
    ],
    requirements: [
      "Tasks 0–2 and 5: NumPy only",
      "Task 3: PyTorch (torch.nn.LSTM is allowed there)"
    ],
    quiz: [
      {
        q: "A character-level model has validation cross-entropy 1.386 nats per character. Its perplexity is about",
        options: ["1.39", "2.0", "4.0", "8.0"],
        answer: 2,
        why: "Perplexity = exp(cross-entropy in nats) = e^{1.386} ≈ 4.0, i.e. 2 bits per character."
      },
      {
        q: "In an LSTM, which equation provides the 'gradient highway'?",
        options: [
          "$h_t = o_t \\odot \\tanh(c_t)$",
          "$c_t = f_t \\odot c_{t-1} + i_t \\odot g_t$",
          "$i_t = \\sigma(W_i [x_t, h_{t-1}] + b_i)$",
          "$g_t = \\tanh(W_g [x_t, h_{t-1}] + b_g)$"
        ],
        answer: 1,
        why: "∂c_t/∂c_{t−1} = diag(f_t) — no repeated multiplication by a weight matrix, so with f ≈ 1 the gradient survives many steps."
      },
      {
        q: "In a vanilla RNN $h_t = \\tanh(W_h h_{t-1} + W_x x_t)$, gradients vanish over long ranges when",
        options: [
          "The largest singular value of $W_h$ (times the tanh' bound) is below 1",
          "The learning rate is too large",
          "The input dimension is large",
          "The vocabulary is large"
        ],
        answer: 0,
        why: "∂h_t/∂h_k is a product of t−k Jacobians diag(tanh')W_h; its norm is bounded by (γ σ_max(W_h))^{t−k} → 0."
      },
      {
        q: "Sampling with temperature T → 0 is equivalent to",
        options: ["Uniform sampling", "Greedy (argmax) decoding", "Beam search", "Sampling from the unmodified softmax"],
        answer: 1,
        why: "softmax(z/T) concentrates all mass on the argmax as T → 0; T = 1 is the model distribution, T → ∞ uniform."
      }
    ],
    tasks: [
      {
        title: "LSTM cell forward (NumPy)",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §0-lstm_cell.py§ with §lstm_cell_forward(x, h_prev, c_prev, W, b)§:

- §x§ §(N, D)§, §h_prev§ §(N, H)§, §c_prev§ §(N, H)§
- §W§ §(D + H, 4H)§ applied to the concatenation §[x, h_prev]§ **in that order**; §b§ §(4H,)§
- $z = [x, h_{t-1}]\,W + b$ is split into four consecutive chunks of width $H$, **in the order $i, f, o, g$**:

$$i=\sigma(z_i),\quad f=\sigma(z_f),\quad o=\sigma(z_o),\quad g=\tanh(z_g),\quad c_t = f\odot c_{t-1} + i \odot g,\quad h_t = o \odot \tanh(c_t)$$

- returns §(h_next, c_next)§, both §(N, H)§. NumPy only, no loops. Also create §README.md§ (≥ 120 words).`,
        files: ["0-lstm_cell.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 120 },
          { type: "defines", path: "0-lstm_cell.py", names: ["lstm_cell_forward"] },
          {
            type: "py_test", files: ["0-lstm_cell.py"], label: "matches reference LSTM cell",
            code: py(String.raw`m = import_module('0-lstm_cell')
sig = lambda z: 1/(1+np.exp(-z))
rng = np.random.default_rng(0)
N, D, H = 4, 5, 3
x = rng.normal(size=(N, D)); h = rng.normal(size=(N, H)); c = rng.normal(size=(N, H))
W = rng.normal(size=(D + H, 4 * H)) * 0.5; b = rng.normal(size=4 * H)
z = np.concatenate([x, h], 1) @ W + b
i, f, o, g = sig(z[:, :H]), sig(z[:, H:2*H]), sig(z[:, 2*H:3*H]), np.tanh(z[:, 3*H:])
c2 = f * c + i * g; h2 = o * np.tanh(c2)
hn, cn = m.lstm_cell_forward(x, h, c, W, b)
assert np.asarray(hn).shape == (N, H) and np.asarray(cn).shape == (N, H)
assert np.allclose(cn, c2), "cell state wrong (check gate order i, f, o, g and concat order [x, h])"
assert np.allclose(hn, h2), "hidden state wrong"
print("ok")`)
          }
        ]
      },
      {
        title: "LSTM over a sequence",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Create §1-lstm_forward.py§ with §lstm_forward(X, h0, c0, W, b)§:

- §X§ §(T, N, D)§ (time-major), §h0§, §c0§ §(N, H)§, §W§, §b§ as in task 0
- returns §(H_all, h_T, c_T)§ where §H_all§ is §(T, N, H)§ holding $h_1, \dots, h_T$.

Reuse task 0 via §importlib.import_module('0-lstm_cell')§. A loop over time is expected (and unavoidable); no loop over the batch.`,
        files: ["1-lstm_forward.py"],
        checks: [
          { type: "defines", path: "1-lstm_forward.py", names: ["lstm_forward"] },
          { type: "contains", path: "1-lstm_forward.py", pattern: "0-lstm_cell", label: "reuses task 0" },
          {
            type: "py_test", files: ["0-lstm_cell.py", "1-lstm_forward.py"], label: "unrolled LSTM matches reference",
            code: py(String.raw`m = import_module('1-lstm_forward')
sig = lambda z: 1/(1+np.exp(-z))
rng = np.random.default_rng(1)
T, N, D, H = 6, 3, 4, 5
X = rng.normal(size=(T, N, D)); h0 = rng.normal(size=(N, H)); c0 = rng.normal(size=(N, H)); h, c = h0.copy(), c0.copy()
W = rng.normal(size=(D + H, 4 * H)) * 0.4; b = rng.normal(size=4 * H) * 0.1
outs = []
for t in range(T):
    z = np.concatenate([X[t], h], 1) @ W + b
    i, f, o, g = sig(z[:, :H]), sig(z[:, H:2*H]), sig(z[:, 2*H:3*H]), np.tanh(z[:, 3*H:])
    c = f * c + i * g; h = o * np.tanh(c); outs.append(h)
Hall, hT, cT = m.lstm_forward(X, h0, c0, W, b)
assert np.asarray(Hall).shape == (T, N, H)
assert np.allclose(Hall, np.stack(outs)), "hidden states wrong"
assert np.allclose(hT, outs[-1]) and np.allclose(cT, c), "final states wrong"
print("ok")`)
          }
        ]
      },
      {
        title: "Perplexity and temperature sampling",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §2-lm_utils.py§ (NumPy only) with:

- §perplexity(log_probs, targets, mask=None)§ — §log_probs§ §(N, T, V)§ natural-log probabilities (already log-softmaxed), §targets§ §(N, T)§ int, §mask§ optional §(N, T)§ bool/0-1 (1 = real token). Return $\exp\left(\frac{\sum_{n,t} m_{nt}\,(-\log p_{nt}[y_{nt}])}{\sum_{n,t} m_{nt}}\right)$ as a float.
- §softmax_with_temperature(logits, temperature)§ — softmax of §logits / temperature§ along the last axis, numerically stable for any §temperature > 0§ (including §1e-3§).
- §sample_next(logits, temperature, rng)§ — §logits§ §(N, V)§; return an int array §(N,)§, one index per row sampled from §softmax_with_temperature§ using the §np.random.Generator§ §rng§ (vectorised: e.g. inverse CDF with one §rng.random(N)§ call — no per-row Python loop needed).`,
        files: ["2-lm_utils.py"],
        checks: [
          { type: "defines", path: "2-lm_utils.py", names: ["perplexity", "softmax_with_temperature", "sample_next"] },
          {
            type: "py_test", files: ["2-lm_utils.py"], label: "perplexity with mask, stable temperature softmax, correct sampling frequencies",
            code: py(String.raw`m = import_module('2-lm_utils')
rng = np.random.default_rng(0)
N, T, V = 3, 7, 11
z = rng.normal(size=(N, T, V)); lp = z - np.log(np.exp(z).sum(-1, keepdims=True))
y = rng.integers(V, size=(N, T)); mask = rng.random((N, T)) < 0.7; mask[0, 0] = True
nll = -np.take_along_axis(lp, y[..., None], -1)[..., 0]
assert np.isclose(m.perplexity(lp, y), np.exp(nll.mean())), "perplexity wrong"
assert np.isclose(m.perplexity(lp, y, mask), np.exp(nll[mask].sum() / mask.sum())), "masked perplexity wrong"
uni = np.log(np.full((2, 5, V), 1.0 / V))
assert np.isclose(m.perplexity(uni, rng.integers(V, size=(2, 5))), V), "uniform model must have perplexity V"
lg = np.array([[1.0, 2.0, 3.0, 50.0], [0.0, 0.0, 0.0, 0.0]])
p = m.softmax_with_temperature(lg, 1e-3)
assert np.all(np.isfinite(p)) and np.allclose(p[0], [0, 0, 0, 1]), "low temperature must approach argmax"
for Tm in (0.5, 1.0, 2.0):
    q = np.exp(lg / Tm - (lg / Tm).max(1, keepdims=True)); q /= q.sum(1, keepdims=True)
    assert np.allclose(m.softmax_with_temperature(lg, Tm), q)
base = np.array([0.5, -1.0, 2.0, 0.0, 1.0])
L = np.tile(base, (40000, 1))
s = np.asarray(m.sample_next(L, 0.8, np.random.default_rng(1)))
assert s.shape == (40000,) and s.min() >= 0 and s.max() < 5
q = np.exp(base / 0.8); q /= q.sum()
assert np.allclose(np.bincount(s, minlength=5) / 40000, q, atol=0.01), "samples do not follow softmax(logits/T)"
print("ok")`)
          }
        ]
      },
      {
        title: "Character-level LSTM on Shakespeare",
        type: "mandatory",
        kind: "code",
        points: 4,
        body: md`Write §3-char_lstm.py§ (PyTorch) that trains a character-level LSTM language model on [Tiny Shakespeare](https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt) (≈1.1 M characters; first 90% train, last 10% validation, split by position).

Requirements:
- Embedding → 2- or 3-layer §nn.LSTM§ (hidden ≥ 256) → linear over the character vocabulary; truncated BPTT with sequence length ≥ 100, carrying (detached) hidden state across consecutive batches **or** random windows (state which in the README).
- Gradient-norm clipping (§torch.nn.utils.clip_grad_norm_§), dropout between layers, Adam/AdamW, fixed seed.
- Evaluate validation cross-entropy over the **whole** validation split; compute perplexity with your §perplexity§ from task 2 (or an identical formula).
- Generate §samples.txt§: three samples of ≥ 500 characters each from the prompt §"ROMEO:"§ at temperatures 0.5, 0.8 and 1.0, each preceded by a header line with the temperature (use §sample_next§ from task 2 logic).

§results.json§ keys: §val_perplexity§ (≤ **5.0**), §val_bits_per_char§, §train_perplexity§, §n_params§, §train_minutes§. Commit a training-curve plot §loss_curve.png§ (train & val loss vs step).`,
        files: ["3-char_lstm.py", "results.json", "samples.txt", "loss_curve.png"],
        checks: [
          { type: "contains", path: "3-char_lstm.py", pattern: "import torch", label: "uses PyTorch" },
          { type: "contains", path: "3-char_lstm.py", pattern: "clip_grad_norm_", label: "gradient clipping" },
          { type: "nonempty", path: "samples.txt", minLines: 30 },
          { type: "exists", path: "loss_curve.png" },
          { type: "json_metric", path: "results.json", key: "val_perplexity", op: "<=", value: 5.0 },
          { type: "json_metric", path: "results.json", key: "val_bits_per_char", op: "<=", value: 2.33 }
        ]
      },
      {
        title: "Derivation: vanishing gradients in RNNs",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`Write §written/4-vanishing_gradients.pdf§ (PDF, Markdown or LaTeX accepted):

1. For $h_t = \tanh(W_h h_{t-1} + W_x x_t + b)$ and loss $J = \sum_t J_t$, write $\frac{\partial J_t}{\partial h_k}$ for $k < t$ as a product of Jacobians and prove $\left\|\frac{\partial h_t}{\partial h_k}\right\| \le (\gamma\,\sigma_{\max}(W_h))^{t-k}$ with $\gamma$ the bound on $|\tanh'|$.
2. Conclude when gradients vanish and when they **may** explode; explain why clipping fixes exploding but not vanishing gradients.
3. For the LSTM of task 0, compute $\partial c_t / \partial c_{t-1}$ along the direct path, and explain the role of the forget gate (and of initialising $b_f$ to a positive value).
4. Include one figure from your own experiment: the norm $\|\partial \mathcal L / \partial h_0\|$ vs. sequence length (10–200) for a randomly initialised vanilla RNN and LSTM of the same width (PyTorch autograd is fine), with 2–3 sentences of interpretation.`,
        deliverable: "repo",
        files: ["written/4-vanishing_gradients.pdf"],
        rubric: "derivation",
        criteria: [
          "Writes ∂h_t/∂h_k = ∏ diag(tanh'(a_j)) W_h and bounds its norm by (γσ_max)^{t−k} using submultiplicativity",
          "States vanishing when γσ_max < 1 and that σ_max > 1 is necessary but not sufficient for explosion",
          "Explains gradient-norm clipping and why it cannot restore vanished signal",
          "Derives ∂c_t/∂c_{t−1} = diag(f_t) on the direct path and discusses forget-gate bias",
          "Includes an own experimental plot comparing RNN vs LSTM gradient norms with interpretation"
        ]
      },
      {
        title: "LSTM cell backward (NumPy)",
        type: "advanced",
        kind: "code",
        points: 3,
        body: md`Create §100-lstm_backward.py§ with

§lstm_cell_backward(dh_next, dc_next, x, h_prev, c_prev, W, b)§

which recomputes the forward pass of task 0 internally and returns the tuple §(dx, dh_prev, dc_prev, dW, db)§, where §dh_next§ and §dc_next§ (both §(N, H)§) are the upstream gradients of a scalar loss w.r.t. $h_t$ and $c_t$ (the $c_t$ gradient **excludes** the path through $h_t$, which you must add). Shapes match the corresponding inputs. NumPy only. The test checks you against central finite differences.`,
        files: ["100-lstm_backward.py"],
        checks: [
          { type: "defines", path: "100-lstm_backward.py", names: ["lstm_cell_backward"] },
          {
            type: "py_test", files: ["0-lstm_cell.py", "100-lstm_backward.py"], label: "analytic gradients match finite differences",
            code: py(String.raw`m = import_module('100-lstm_backward')
sig = lambda z: 1/(1+np.exp(-z))
def fwd(x, h, c, W, b):
    H = h.shape[1]; z = np.concatenate([x, h], 1) @ W + b
    i, f, o, g = sig(z[:, :H]), sig(z[:, H:2*H]), sig(z[:, 2*H:3*H]), np.tanh(z[:, 3*H:])
    c2 = f * c + i * g; return o * np.tanh(c2), c2
rng = np.random.default_rng(0)
N, D, H = 3, 4, 5
x = rng.normal(size=(N, D)); h = rng.normal(size=(N, H)); c = rng.normal(size=(N, H))
W = rng.normal(size=(D + H, 4 * H)) * 0.5; b = rng.normal(size=4 * H) * 0.3
A = rng.normal(size=(N, H)); B = rng.normal(size=(N, H))
loss = lambda x, h, c, W, b: float(np.sum(fwd(x, h, c, W, b)[0] * A) + np.sum(fwd(x, h, c, W, b)[1] * B))
grads = m.lstm_cell_backward(A, B, x, h, c, W, b)
args = [x, h, c, W, b]
for k, name in enumerate(["dx", "dh_prev", "dc_prev", "dW", "db"]):
    P = args[k]; num = np.zeros_like(P); it = np.nditer(P, flags=['multi_index'])
    for _ in it:
        idx = it.multi_index; old = P[idx]
        P[idx] = old + 1e-6; lp = loss(*args)
        P[idx] = old - 1e-6; lm = loss(*args)
        P[idx] = old; num[idx] = (lp - lm) / 2e-6
    g = np.asarray(grads[k])
    assert g.shape == P.shape, name + " has wrong shape"
    assert np.allclose(g, num, atol=1e-5), name + " does not match finite differences"
print("ok")`)
          }
        ]
      }
    ]
  },

  // ───────────────────────────────────────────────────────────── A23
  {
    id: "A23",
    track: "applied",
    phase: PHASE,
    title: "Seq2Seq with Attention",
    days: 3,
    repo: REPO,
    dir: "0x03-seq2seq_attention",
    sources: [
      { course: "CS224N", lectures: "Lec 7–8", topics: "Machine translation, sequence-to-sequence, the bottleneck problem, attention, BLEU, beam search" }
    ],
    resources: [
      { title: "Sutskever, Vinyals & Le — Sequence to Sequence Learning with Neural Networks", url: "https://arxiv.org/abs/1409.3215" },
      { title: "Bahdanau, Cho & Bengio — Neural Machine Translation by Jointly Learning to Align and Translate", url: "https://arxiv.org/abs/1409.0473" },
      { title: "Luong, Pham & Manning — Effective Approaches to Attention-based NMT", url: "https://arxiv.org/abs/1508.04025" },
      { title: "Papineni et al. — BLEU: a Method for Automatic Evaluation of Machine Translation", url: "https://aclanthology.org/P02-1040/" },
      { title: "D2L — Attention Mechanisms and Transformers (Bahdanau attention)", url: "https://d2l.ai/chapter_attention-mechanisms-and-transformers/bahdanau-attention.html" }
    ],
    concepts: [
      "Encoder–decoder architecture",
      "Information bottleneck of a fixed context vector",
      "Dot-product (Luong) vs additive (Bahdanau) attention",
      "Masking padded positions",
      "Teacher forcing and exposure bias",
      "Greedy vs beam search decoding",
      "Corpus BLEU: clipped n-gram precision and brevity penalty"
    ],
    objectives: [
      "Explain the bottleneck problem and how attention removes it",
      "Implement dot-product and additive attention with masking, and state their cost",
      "Compute corpus-level BLEU by hand and explain clipping and the brevity penalty",
      "Train an attention-based seq2seq model and compare it to the same model without attention",
      "Interpret an attention heatmap as a soft alignment",
      "Explain beam search, its stopping criteria and why it is not exact"
    ],
    requirements: [
      "Tasks 0–3 and 6: NumPy / standard library only",
      "Task 4: PyTorch; attention must be your own code (no nn.MultiheadAttention, no F.scaled_dot_product_attention)"
    ],
    quiz: [
      {
        q: "What problem of the vanilla seq2seq model does attention address most directly?",
        options: [
          "The vocabulary is too large",
          "The whole source sentence must be squeezed into one fixed-size vector",
          "The decoder cannot use teacher forcing",
          "LSTMs cannot be bidirectional"
        ],
        answer: 1,
        why: "Attention lets every decoder step read a weighted combination of all encoder states instead of only the final one."
      },
      {
        q: "Bahdanau (additive) attention scores an encoder state $h_j$ against decoder state $s$ as",
        options: [
          "$s^\\top h_j$",
          "$v^\\top \\tanh(W_1 s + W_2 h_j)$",
          "$s^\\top W h_j / \\sqrt{d}$",
          "$\\|s - h_j\\|^2$"
        ],
        answer: 1,
        why: "Additive attention uses a one-hidden-layer MLP; Luong's 'dot' and 'general' use bilinear forms."
      },
      {
        q: "Candidate: 'the the the the', reference: 'the cat is on the mat'. Clipped unigram precision is",
        options: ["1", "2/4", "4/6", "1/4"],
        answer: 1,
        why: "'the' appears 4 times in the candidate but at most 2 times in the reference, so clipped count is 2 out of 4 candidate unigrams."
      },
      {
        q: "Why is the brevity penalty needed in BLEU?",
        options: [
          "Because modified precision alone rewards very short candidates",
          "Because long sentences are harder to translate",
          "To penalise repeated n-grams",
          "To normalise across languages"
        ],
        answer: 0,
        why: "Precision-only metrics can be gamed by outputting a few safe words; BP = exp(1 − r/c) when c < r."
      }
    ],
    tasks: [
      {
        title: "Dot-product attention with masking",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §0-dot_attention.py§ with §dot_attention(query, keys, values, mask=None)§:

- §query§ §(N, H)§ — one decoder state per example; §keys§ §(N, T, H)§; §values§ §(N, T, Dv)§
- §mask§: optional bool §(N, T)§, §True§ = real (attendable) position. Masked positions must receive weight **exactly 0** (or < 1e-12). Every row has at least one §True§.
- Scores $e_{nt} = \text{keys}_{nt} \cdot \text{query}_n$ (no scaling), weights $\alpha = \mathrm{softmax}_t(e)$, context $= \sum_t \alpha_{nt}\,\text{values}_{nt}$.
- returns §(context, weights)§ of shapes §(N, Dv)§ and §(N, T)§. Numerically stable, vectorised (§np.einsum§ or batched §@§). Also create §README.md§ (≥ 120 words).`,
        files: ["0-dot_attention.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 120 },
          { type: "defines", path: "0-dot_attention.py", names: ["dot_attention"] },
          {
            type: "py_test", files: ["0-dot_attention.py"], label: "context and weights match reference; masking and stability",
            code: py(String.raw`m = import_module('0-dot_attention')
rng = np.random.default_rng(0)
N, T, H, Dv = 4, 7, 5, 3
q = rng.normal(size=(N, H)); K = rng.normal(size=(N, T, H)); V = rng.normal(size=(N, T, Dv))
mask = rng.random((N, T)) < 0.6; mask[:, 0] = True
def ref(q, K, V, mask):
    e = np.einsum('nth,nh->nt', K, q)
    if mask is not None: e = np.where(mask, e, -np.inf)
    a = np.exp(e - e.max(1, keepdims=True)); a /= a.sum(1, keepdims=True)
    return np.einsum('nt,ntd->nd', a, V), a
for mk in (None, mask):
    c, w = m.dot_attention(q, K, V, mk)
    rc, rw = ref(q, K, V, mk)
    assert np.asarray(c).shape == (N, Dv) and np.asarray(w).shape == (N, T)
    assert np.allclose(w, rw, atol=1e-10) and np.allclose(c, rc), "attention output wrong"
c, w = m.dot_attention(q, K, V, mask)
assert np.all(np.asarray(w)[~mask] < 1e-12), "masked weights must be 0"
c, w = m.dot_attention(q * 100, K * 100, V, mask)
assert np.all(np.isfinite(c)) and np.allclose(np.asarray(w).sum(1), 1), "not numerically stable"
print("ok")`)
          }
        ]
      },
      {
        title: "Additive (Bahdanau) attention",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §1-additive_attention.py§ with §additive_attention(query, keys, values, W_q, W_k, v, mask=None)§:

- §query§ §(N, Hq)§, §keys§ §(N, T, Hk)§, §values§ §(N, T, Dv)§, §W_q§ §(Hq, A)§, §W_k§ §(Hk, A)§, §v§ §(A,)§, §mask§ as in task 0.
- $e_{nt} = v^\top \tanh(\text{query}_n W_q + \text{keys}_{nt} W_k)$, then softmax over $t$ with masking and a weighted sum of values.
- returns §(context (N, Dv), weights (N, T))§. Vectorised; compute §keys @ W_k§ once for all $t$ (in a real decoder this projection is cached across decoding steps — mention why in a comment).`,
        files: ["1-additive_attention.py"],
        checks: [
          { type: "defines", path: "1-additive_attention.py", names: ["additive_attention"] },
          {
            type: "py_test", files: ["1-additive_attention.py"], label: "matches reference additive attention",
            code: py(String.raw`m = import_module('1-additive_attention')
rng = np.random.default_rng(0)
N, T, Hq, Hk, A, Dv = 3, 6, 4, 5, 7, 2
q = rng.normal(size=(N, Hq)); K = rng.normal(size=(N, T, Hk)); V = rng.normal(size=(N, T, Dv))
Wq = rng.normal(size=(Hq, A)); Wk = rng.normal(size=(Hk, A)); v = rng.normal(size=A)
mask = rng.random((N, T)) < 0.5; mask[:, -1] = True
for mk in (None, mask):
    e = np.tanh((q @ Wq)[:, None, :] + K @ Wk) @ v
    if mk is not None: e = np.where(mk, e, -np.inf)
    a = np.exp(e - e.max(1, keepdims=True)); a /= a.sum(1, keepdims=True)
    c, w = m.additive_attention(q, K, V, Wq, Wk, v, mk)
    assert np.allclose(w, a, atol=1e-10), "weights wrong"
    assert np.allclose(c, np.einsum('nt,ntd->nd', a, V)), "context wrong"
print("ok")`)
          }
        ]
      },
      {
        title: "Corpus BLEU",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §2-bleu.py§ with §corpus_bleu(candidates, references, max_n=4)§ (pure Python; NumPy allowed; **no nltk / sacrebleu**):

- §candidates§: list of token lists; §references§: list (same length) of lists of reference token lists (one or more references per candidate).
- Modified precision $p_n$ for $n = 1..\text{max\_n}$: for each candidate, every n-gram count is clipped by its **maximum** count in any single reference; sum clipped counts and total candidate n-gram counts **over the whole corpus**, then divide.
- $c$ = total candidate length; $r$ = sum over sentences of the reference length closest to the candidate length (ties → the shorter reference). $BP = 1$ if $c > r$ else $e^{1 - r/c}$.
- $\text{BLEU} = BP \cdot \exp\left(\frac{1}{N}\sum_{n=1}^{N} \log p_n\right)$ with uniform weights; return §0.0§ if any $p_n = 0$ (no smoothing). Returns a float in $[0, 1]$.`,
        files: ["2-bleu.py"],
        checks: [
          { type: "defines", path: "2-bleu.py", names: ["corpus_bleu"] },
          { type: "not_contains", path: "2-bleu.py", pattern: "nltk|sacrebleu", label: "no BLEU libraries" },
          {
            type: "py_test", files: ["2-bleu.py"], label: "matches a reference corpus BLEU on random corpora",
            code: py(String.raw`import math, random
from collections import Counter
m = import_module('2-bleu')
def ng(s, n): return Counter(tuple(s[i:i+n]) for i in range(len(s) - n + 1))
def ref_bleu(C, R, N=4):
    num = [0]*N; den = [0]*N; c = r = 0
    for cand, refs in zip(C, R):
        c += len(cand)
        r += min((abs(len(x) - len(cand)), len(x)) for x in refs)[1]
        for n in range(1, N + 1):
            cc = ng(cand, n); mx = Counter()
            for x in refs:
                for g, k in ng(x, n).items(): mx[g] = max(mx[g], k)
            num[n-1] += sum(min(k, mx[g]) for g, k in cc.items()); den[n-1] += max(0, len(cand) - n + 1)
    if min(num) == 0: return 0.0
    bp = 1.0 if c > r else math.exp(1 - r / c)
    return bp * math.exp(sum(math.log(a / b) for a, b in zip(num, den)) / N)
s = "the cat is on the mat".split()
assert abs(m.corpus_bleu([s], [[s]]) - 1.0) < 1e-12
assert m.corpus_bleu([["a", "b"]], [[["c", "d"]]]) == 0.0
rnd = random.Random(0)
for trial in range(40):
    C, R = [], []
    for _ in range(rnd.randint(1, 6)):
        base = [rnd.choice("abcde") for _ in range(rnd.randint(4, 12))]
        cand = [t if rnd.random() < 0.8 else rnd.choice("abcde") for t in base][: rnd.randint(4, len(base))]
        refs = [[t if rnd.random() < 0.85 else rnd.choice("abcde") for t in base] + [rnd.choice("ab")] * rnd.randint(0, 3) for _ in range(rnd.randint(1, 3))]
        C.append(cand); R.append(refs)
    for N in (2, 4):
        assert abs(m.corpus_bleu(C, R, max_n=N) - ref_bleu(C, R, N)) < 1e-9, "BLEU differs from reference (trial %d)" % trial
print("ok")`)
          }
        ]
      },
      {
        title: "Date-normalisation dataset",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Create §3-dates.py§ with §generate_dates(n, seed=0)§ (standard library only) returning a list of §n§ pairs §(source, target)§:

- §target§: ISO date §"YYYY-MM-DD"§ for a uniformly random date between 1950-01-01 and 2049-12-31.
- §source§: the same date in a randomly chosen human format. Use **at least 6 structurally different formats**, e.g. §"3 May 1998"§, §"May 3, 1998"§, §"Sunday, May 3, 1998"§, §"3rd of May 1998"§, §"1998/05/03"§, §"03.05.1998"§, with random casing / abbreviated month names. Every format must contain the **4-digit year** and be unambiguous (one fixed day/month order per format).
- Deterministic given §seed§ (use §random.Random(seed)§, never the global RNG).

The test parses your targets and checks diversity of formats (digit runs → §9§, letter runs → §A§).`,
        files: ["3-dates.py"],
        checks: [
          { type: "defines", path: "3-dates.py", names: ["generate_dates"] },
          {
            type: "py_test", files: ["3-dates.py"], label: "valid ISO targets, deterministic, ≥ 6 formats, year present",
            code: py(String.raw`import re, datetime
m = import_module('3-dates')
D = m.generate_dates(2000, seed=0)
assert len(D) == 2000
assert D == m.generate_dates(2000, seed=0), "must be deterministic for a seed"
assert D != m.generate_dates(2000, seed=1), "different seeds should differ"
lo, hi = datetime.date(1950, 1, 1), datetime.date(2049, 12, 31)
sigs = set()
for s, t in D:
    assert re.fullmatch(r"\d{4}-\d{2}-\d{2}", t), "bad target %r" % t
    d = datetime.date.fromisoformat(t)
    assert lo <= d <= hi, "date out of range"
    assert t[:4] in s, "source %r must contain the 4-digit year" % s
    sigs.add(re.sub(r"[A-Za-z]+", "A", re.sub(r"\d+", "9", s)))
assert len(sigs) >= 6, "need at least 6 structurally different formats, got %d" % len(sigs)
assert len({t for _, t in D}) > 1500, "dates are not diverse enough"
print("ok")`)
          }
        ]
      },
      {
        title: "Train seq2seq with and without attention",
        type: "mandatory",
        kind: "code",
        points: 4,
        body: md`Write §4-seq2seq.py§ (PyTorch), character-level:

- Data: 50k train / 2k dev / 5k test pairs from §generate_dates§ (different seeds, no target overlap between test and train).
- Encoder: bidirectional LSTM or GRU over source characters. Decoder: unidirectional LSTM/GRU with **your own** attention (dot/general or additive, as in tasks 0–1, in PyTorch with masking of padded source positions); concatenate context and decoder state before the output layer (Luong) or feed it into the RNN (Bahdanau).
- Teacher forcing during training; greedy decoding for evaluation.
- Train the **same** model with attention disabled (decoder sees only the final encoder state) as a baseline.
- Save an attention heatmap for 3 test examples as §attention.png§ (rows = output chars, columns = input chars).

§results.json§: §test_exact_match§ (≥ **0.97**), §test_exact_match_no_attention§, §test_char_bleu§ (your §corpus_bleu§ over character tokens, ≥ **0.95**), §n_params§.`,
        files: ["4-seq2seq.py", "results.json", "attention.png"],
        checks: [
          { type: "contains", path: "4-seq2seq.py", pattern: "import torch", label: "uses PyTorch" },
          { type: "not_contains", path: "4-seq2seq.py", pattern: "MultiheadAttention|scaled_dot_product_attention", label: "own attention implementation" },
          { type: "contains", path: "4-seq2seq.py", pattern: "masked_fill|where", label: "masks padded positions" },
          { type: "exists", path: "attention.png" },
          { type: "json_metric", path: "results.json", key: "test_exact_match", op: ">=", value: 0.97 },
          { type: "json_metric", path: "results.json", key: "test_char_bleu", op: ">=", value: 0.95 }
        ]
      },
      {
        title: "Report: what attention buys you",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Write §written/5-report.md§ (PDF, Markdown or LaTeX accepted; ≈ 1–2 pages):

1. Table: exact match and char-BLEU with vs without attention, parameters, training time.
2. Exact match vs **source length** bucket for both models (plot) — does the no-attention model degrade on longer inputs?
3. Interpret your heatmaps: which source characters does the model attend to when emitting the year, month and day? Is the alignment monotonic? What happens for month names?
4. Explain teacher forcing and exposure bias, and one thing you observed (or tried, e.g. scheduled sampling) about it.`,
        deliverable: "repo",
        files: ["written/5-report.md"],
        rubric: "report",
        criteria: [
          "Quantitative comparison table with and without attention from own runs",
          "Accuracy-vs-source-length analysis with a plot and correct interpretation",
          "Heatmap interpretation linking output fields to the source characters attended",
          "Correct explanation of teacher forcing and exposure bias"
        ]
      },
      {
        title: "Beam search",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`Create §100-beam_search.py§ with §beam_search(step_fn, bos, eos, beam_size, max_len)§ (NumPy / standard library):

- §step_fn(prefix)§ takes a **tuple** of token ids starting with §bos§ and returns a 1-D array of log-probabilities over the vocabulary.
- Keep at most §beam_size§ live hypotheses; at each step expand every live hypothesis with every token, score = sum of log-probs, keep the best §beam_size§ expansions. A hypothesis that emits §eos§ is finished; a live hypothesis that reaches §max_len§ generated tokens is also finished. Stop when no live hypothesis remains.
- Return §(tokens, score)§ for the best finished hypothesis: §tokens§ is the list of generated ids **without** §bos§ (including the final §eos§ if emitted), §score§ its total log-prob. No length normalisation.

The test checks that §beam_size=1§ equals greedy decoding and that a very large beam finds the exact optimum (brute force). Then add beam search to task 4 and report its effect in the README.`,
        files: ["100-beam_search.py"],
        checks: [
          { type: "defines", path: "100-beam_search.py", names: ["beam_search"] },
          {
            type: "py_test", files: ["100-beam_search.py"], label: "greedy for beam 1, exact for huge beams",
            code: py(String.raw`import itertools
m = import_module('100-beam_search')
V, EOS, BOS, L = 4, 3, 0, 4
for seed in range(5):
    rng = np.random.default_rng(seed); table = {}
    def step(prefix):
        assert isinstance(prefix, tuple) and prefix[0] == BOS
        if prefix not in table:
            z = rng.normal(size=V) * 2; table[prefix] = z - np.log(np.exp(z).sum())
        return table[prefix]
    best, bests = None, -np.inf
    for n in range(1, L + 1):
        for seq in itertools.product(range(V), repeat=n):
            if EOS in seq[:-1]: continue
            if seq[-1] != EOS and n < L: continue
            s = sum(step((BOS,) + seq[:i])[seq[i]] for i in range(n))
            if s > bests: best, bests = list(seq), s
    toks, sc = m.beam_search(step, BOS, EOS, 500, L)
    assert list(toks) == best and abs(sc - bests) < 1e-9, "large beam must find the exact optimum"
    g, gs = [], 0.0
    while len(g) < L:
        lp = step((BOS,) + tuple(g)); t = int(np.argmax(lp)); g.append(t); gs += lp[t]
        if t == EOS: break
    toks, sc = m.beam_search(step, BOS, EOS, 1, L)
    assert list(toks) == g and abs(sc - gs) < 1e-9, "beam_size=1 must equal greedy decoding"
print("ok")`)
          }
        ]
      }
    ]
  },

  // ───────────────────────────────────────────────────────────── A24
  {
    id: "A24",
    track: "applied",
    phase: PHASE,
    title: "The Transformer from Scratch",
    days: 5,
    repo: REPO,
    dir: "0x04-transformer",
    sources: [
      { course: "CS224N", lectures: "Lec 9", topics: "Self-attention and Transformers" },
      { course: "CME295", lectures: "Lec 1–2", topics: "Transformer architecture deep-dive: attention, multi-head attention, positional encodings, encoder/decoder, layer norm, residuals" }
    ],
    resources: [
      { title: "Vaswani et al. 2017 — Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762" },
      { title: "The Annotated Transformer (Harvard NLP)", url: "https://nlp.seas.harvard.edu/annotated-transformer/" },
      { title: "Alammar — The Illustrated Transformer", url: "https://jalammar.github.io/illustrated-transformer/" },
      { title: "D2L — The Transformer Architecture", url: "https://d2l.ai/chapter_attention-mechanisms-and-transformers/transformer.html" },
      { title: "Xiong et al. 2020 — On Layer Normalization in the Transformer Architecture (Pre-LN vs Post-LN)", url: "https://arxiv.org/abs/2002.04745" },
      { title: "Ba, Kiros & Hinton — Layer Normalization", url: "https://arxiv.org/abs/1607.06450" }
    ],
    concepts: [
      "Queries, keys and values",
      "Scaled dot-product attention and the 1/√d_k factor",
      "Causal and padding masks",
      "Multi-head attention (split / combine heads)",
      "Sinusoidal positional encodings",
      "Residual connections and layer normalisation (Post-LN vs Pre-LN)",
      "Position-wise feed-forward network",
      "Label smoothing and the warm-up (Noam) learning-rate schedule"
    ],
    objectives: [
      "Derive scaled dot-product attention as a differentiable soft dictionary lookup and justify the 1/√d_k scaling with a variance argument",
      "Implement causal and padding masks and prove that a causal decoder cannot see the future",
      "Explain what multiple heads buy compared to one head of the same total width, and count the parameters of every sub-layer",
      "Build a complete encoder–decoder Transformer in PyTorch without nn.Transformer / nn.MultiheadAttention",
      "Explain the O(T²·d) cost of self-attention and when it dominates the O(T·d²) cost of the FFN",
      "Explain why the Transformer needs positional information and how sinusoidal encodings make relative offsets linear",
      "Train the model to a competitive BLEU on Multi30k and debug it with unit tests"
    ],
    requirements: [
      "Tasks 0–3 and 8: NumPy only",
      "Tasks 4–5: PyTorch ≥ 2.0; forbidden: nn.Transformer*, nn.MultiheadAttention, F.scaled_dot_product_attention, nn.LayerNorm (write your own)",
      "A single consumer GPU or Colab T4 is enough for task 5 (≈ 1–2 h of training)"
    ],
    quiz: [
      {
        q: "If the entries of $q, k \\in \\mathbb{R}^{d_k}$ are independent with mean 0 and variance 1, the variance of $q^\\top k$ is",
        options: ["1", "$\\sqrt{d_k}$", "$d_k$", "$d_k^2$"],
        answer: 2,
        why: "A sum of d_k independent products each with variance 1; dividing by √d_k restores unit variance and keeps the softmax out of its saturated regime."
      },
      {
        q: "What is the shape of the attention-weight tensor in multi-head self-attention for batch N, h heads, sequence length T?",
        options: ["(N, T, d_model)", "(N, h, T, T)", "(N, T, h)", "(N, h, T, d_k)"],
        answer: 1,
        why: "Every head has its own T×T matrix of weights (one row per query position)."
      },
      {
        q: "In the decoder of an encoder–decoder Transformer, which sub-layer uses the causal mask?",
        options: [
          "Cross-attention (queries from the decoder, keys/values from the encoder)",
          "Decoder self-attention",
          "The feed-forward network",
          "Encoder self-attention"
        ],
        answer: 1,
        why: "Only decoder self-attention must not look at future target tokens; cross-attention may see the whole source (except padding)."
      },
      {
        q: "Ignoring biases and layer norms, how many parameters does one multi-head attention block with model width d have?",
        options: ["$3d^2$", "$4d^2$", "$4d^2/h$", "$d^2 h$"],
        answer: 1,
        why: "W_Q, W_K, W_V and W_O are each d×d regardless of the number of heads h."
      },
      {
        q: "Why does the original Transformer add (not concatenate) positional encodings to token embeddings?",
        options: [
          "Concatenation is impossible in PyTorch",
          "Adding keeps the width d_model and the projections can still separate content and position subspaces",
          "Adding makes the model translation-invariant",
          "Adding removes the need for attention masks"
        ],
        answer: 1,
        why: "In high dimension, content and position can occupy nearly orthogonal subspaces; the linear projections can read either."
      }
    ],
    tasks: [
      {
        title: "Scaled dot-product attention",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §0-attention.py§ with §scaled_dot_product_attention(Q, K, V, mask=None)§ (NumPy only):

- §Q§ §(..., T_q, d_k)§, §K§ §(..., T_k, d_k)§, §V§ §(..., T_k, d_v)§ — any number of leading batch dims (e.g. §(N, h, T, d)§).
- §mask§: optional bool array **broadcastable** to §(..., T_q, T_k)§; §True§ = may attend. You may assume no row is fully masked.

$$\mathrm{Attention}(Q,K,V) = \mathrm{softmax}\left(\frac{QK^\top}{\sqrt{d_k}} + M\right)V,\qquad M_{ij} = 0 \text{ if allowed else } -\infty$$

- Returns §(output, weights)§ with shapes §(..., T_q, d_v)§ and §(..., T_q, T_k)§. Masked weights must be exactly 0 (< 1e-12). Numerically stable for large logits. No loops.

Also create §README.md§ — it will hold your derivation (task 6); for now ≥ 100 words describing the directory.`,
        files: ["0-attention.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 100 },
          { type: "defines", path: "0-attention.py", names: ["scaled_dot_product_attention"] },
          {
            type: "py_test", files: ["0-attention.py"], label: "batched, masked, stable attention matches reference",
            code: py(String.raw`m = import_module('0-attention')
rng = np.random.default_rng(0)
def ref(Q, K, V, mask=None):
    s = Q @ np.swapaxes(K, -1, -2) / np.sqrt(Q.shape[-1])
    if mask is not None: s = np.where(mask, s, -np.inf)
    w = np.exp(s - s.max(-1, keepdims=True)); w /= w.sum(-1, keepdims=True)
    return w @ V, w
Q = rng.normal(size=(2, 3, 5, 8)); K = rng.normal(size=(2, 3, 7, 8)); V = rng.normal(size=(2, 3, 7, 4))
o, w = m.scaled_dot_product_attention(Q, K, V)
ro, rw = ref(Q, K, V)
assert np.asarray(o).shape == (2, 3, 5, 4) and np.asarray(w).shape == (2, 3, 5, 7)
assert np.allclose(o, ro) and np.allclose(w, rw), "unmasked attention wrong (did you scale by sqrt(d_k)?)"
mask = rng.random((2, 1, 1, 7)) < 0.6; mask[..., 0] = True
o, w = m.scaled_dot_product_attention(Q, K, V, mask)
ro, rw = ref(Q, K, V, mask)
assert np.allclose(o, ro) and np.allclose(w, rw, atol=1e-12), "broadcast mask wrong"
assert np.all(np.asarray(w)[np.broadcast_to(~mask, w.shape)] < 1e-12), "masked weights must be 0"
o2, _ = m.scaled_dot_product_attention(rng.normal(size=(4, 6)), rng.normal(size=(9, 6)), rng.normal(size=(9, 3)))
assert np.asarray(o2).shape == (4, 3), "must also work without batch dims"
o3, w3 = m.scaled_dot_product_attention(Q * 300, K * 300, V)
assert np.all(np.isfinite(o3)) and np.allclose(np.asarray(w3).sum(-1), 1), "not numerically stable"
print("ok")`)
          }
        ]
      },
      {
        title: "Causal and padding masks",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Create §1-masks.py§ with:

- §causal_mask(T)§ → bool array §(T, T)§, §True§ where key position $j \le$ query position $i$.
- §padding_mask(lengths, T)§ → bool array §(N, 1, 1, T)§ with §True§ for real tokens, given §lengths§ (§(N,)§ ints, each ≤ T). Broadcastable against attention scores §(N, h, T_q, T)§.
- §decoder_self_mask(lengths, T)§ → §(N, 1, T, T)§ = causal **and** padding.

No loops. The test also verifies, using your task 0 attention, that outputs at position $t$ do not change when keys/values at positions $> t$ are modified.`,
        files: ["1-masks.py"],
        checks: [
          { type: "defines", path: "1-masks.py", names: ["causal_mask", "padding_mask", "decoder_self_mask"] },
          {
            type: "py_test", files: ["0-attention.py", "1-masks.py"], label: "masks are correct and causal attention cannot see the future",
            code: py(String.raw`m = import_module('1-masks'); a = import_module('0-attention')
assert np.array_equal(m.causal_mask(4), np.tril(np.ones((4, 4), bool)))
lens = np.array([3, 5, 1])
pm = np.asarray(m.padding_mask(lens, 5))
assert pm.shape == (3, 1, 1, 5) and pm.dtype == bool
assert np.array_equal(pm[:, 0, 0], np.arange(5)[None, :] < lens[:, None])
dm = np.asarray(m.decoder_self_mask(lens, 5))
assert dm.shape == (3, 1, 5, 5)
assert np.array_equal(dm, np.tril(np.ones((5, 5), bool))[None, None] & pm)
rng = np.random.default_rng(0)
T = 6; X = rng.normal(size=(2, T, 8))
o1, _ = a.scaled_dot_product_attention(X, X, X, m.causal_mask(T))
for t in range(T - 1):
    Y = X.copy(); Y[:, t + 1:] = rng.normal(size=Y[:, t + 1:].shape) * 5
    o2, _ = a.scaled_dot_product_attention(Y, Y, Y, m.causal_mask(T))
    assert np.allclose(o1[:, :t + 1], o2[:, :t + 1]), "future tokens leaked into position %d" % t
print("ok")`)
          }
        ]
      },
      {
        title: "Multi-head attention (NumPy)",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Create §2-multi_head_attention.py§ with:

- §split_heads(X, n_heads)§: §(N, T, d)§ → §(N, h, T, d/h)§ where head $i$ takes columns §i*d_k:(i+1)*d_k§.
- §combine_heads(X)§: inverse of §split_heads§.
- §multi_head_attention(X_q, X_kv, W_q, W_k, W_v, W_o, n_heads, mask=None)§ — §X_q§ §(N, T_q, d)§, §X_kv§ §(N, T_k, d)§, all §W§ §(d, d)§ applied on the right (§X @ W§), §mask§ broadcastable to §(N, h, T_q, T_k)§. Project, split, attend with your task 0 function (import it with §importlib§), combine, apply §W_o§. Returns §(N, T_q, d)§. Raise §ValueError§ if §d % n_heads != 0§.

No loop over heads or batch — use reshapes/transposes.`,
        files: ["2-multi_head_attention.py"],
        checks: [
          { type: "defines", path: "2-multi_head_attention.py", names: ["split_heads", "combine_heads", "multi_head_attention"] },
          { type: "contains", path: "2-multi_head_attention.py", pattern: "0-attention", label: "reuses task 0" },
          {
            type: "py_test", files: ["0-attention.py", "2-multi_head_attention.py"], label: "matches a per-head loop reference (self- and cross-attention)",
            code: py(String.raw`m = import_module('2-multi_head_attention')
rng = np.random.default_rng(0)
N, Tq, Tk, d, h = 2, 5, 7, 12, 3; dk = d // h
Xq = rng.normal(size=(N, Tq, d)); Xkv = rng.normal(size=(N, Tk, d))
Wq, Wk, Wv, Wo = (rng.normal(size=(d, d)) / np.sqrt(d) for _ in range(4))
S = m.split_heads(Xq, h)
assert np.asarray(S).shape == (N, h, Tq, dk) and np.allclose(S[:, 1], Xq[:, :, dk:2*dk]), "split_heads layout wrong"
assert np.allclose(m.combine_heads(S), Xq), "combine_heads is not the inverse"
def ref(Xq, Xkv, mask):
    Q, K, V = Xq @ Wq, Xkv @ Wk, Xkv @ Wv; outs = []
    for i in range(h):
        sl = slice(i * dk, (i + 1) * dk)
        s = Q[..., sl] @ np.swapaxes(K[..., sl], -1, -2) / np.sqrt(dk)
        if mask is not None: s = np.where(mask[:, 0] if mask.ndim == 4 else mask, s, -np.inf)
        w = np.exp(s - s.max(-1, keepdims=True)); w /= w.sum(-1, keepdims=True)
        outs.append(w @ V[..., sl])
    return np.concatenate(outs, -1) @ Wo
out = m.multi_head_attention(Xq, Xkv, Wq, Wk, Wv, Wo, h)
assert np.asarray(out).shape == (N, Tq, d) and np.allclose(out, ref(Xq, Xkv, None)), "cross-attention wrong"
mask = np.tril(np.ones((Tq, Tq), bool))[None, None]
out = m.multi_head_attention(Xq, Xq, Wq, Wk, Wv, Wo, h, mask)
assert np.allclose(out, ref(Xq, Xq, np.broadcast_to(mask, (N, 1, Tq, Tq)))), "masked self-attention wrong"
try:
    m.multi_head_attention(Xq, Xq, Wq, Wk, Wv, Wo, 5); raise AssertionError("expected ValueError")
except ValueError:
    pass
print("ok")`)
          }
        ]
      },
      {
        title: "LayerNorm, positional encoding, FFN and the Noam schedule",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §3-components.py§ (NumPy only) with:

- §layer_norm(x, gamma, beta, eps=1e-5)§ — normalise over the **last** axis with the biased variance: $\gamma \odot \frac{x-\mu}{\sqrt{\sigma^2+\epsilon}} + \beta$.
- §positional_encoding(T, d_model)§ → §(T, d_model)§ with $PE_{pos,2i} = \sin(pos/10000^{2i/d})$, $PE_{pos,2i+1} = \cos(pos/10000^{2i/d})$ (§d_model§ even).
- §feed_forward(x, W1, b1, W2, b2)§ → $\max(0, xW_1 + b_1)W_2 + b_2$.
- §noam_lr(step, d_model, warmup_steps)§ → $d^{-0.5}\min(\text{step}^{-0.5}, \text{step}\cdot\text{warmup}^{-1.5})$ for integer §step ≥ 1§; must also accept a NumPy array of steps.`,
        files: ["3-components.py"],
        checks: [
          { type: "defines", path: "3-components.py", names: ["layer_norm", "positional_encoding", "feed_forward", "noam_lr"] },
          {
            type: "py_test", files: ["3-components.py"], label: "components match the paper's formulas",
            code: py(String.raw`m = import_module('3-components')
rng = np.random.default_rng(0)
x = rng.normal(size=(2, 4, 6)) * 3 + 1; g = rng.normal(size=6); b = rng.normal(size=6)
mu = x.mean(-1, keepdims=True); var = x.var(-1, keepdims=True)
assert np.allclose(m.layer_norm(x, g, b), g * (x - mu) / np.sqrt(var + 1e-5) + b), "layer_norm wrong"
pe = np.asarray(m.positional_encoding(50, 16))
pos = np.arange(50)[:, None]; i = np.arange(8)[None, :]
ang = pos / 10000 ** (2 * i / 16)
assert pe.shape == (50, 16) and np.allclose(pe[:, 0::2], np.sin(ang)) and np.allclose(pe[:, 1::2], np.cos(ang)), "positional encoding wrong"
W1 = rng.normal(size=(6, 10)); b1 = rng.normal(size=10); W2 = rng.normal(size=(10, 6)); b2 = rng.normal(size=6)
assert np.allclose(m.feed_forward(x, W1, b1, W2, b2), np.maximum(0, x @ W1 + b1) @ W2 + b2)
steps = np.arange(1, 10001)
ref = 512 ** -0.5 * np.minimum(steps ** -0.5, steps * 4000 ** -1.5)
assert np.allclose(m.noam_lr(steps, 512, 4000), ref), "noam_lr wrong"
assert np.isclose(float(m.noam_lr(4000, 512, 4000)), ref[3999]) and int(np.argmax(ref)) == 3999
print("ok")`)
          }
        ]
      },
      {
        title: "The full Transformer in PyTorch",
        type: "mandatory",
        kind: "code",
        points: 6,
        body: md`Create §4-transformer.py§: a complete encoder–decoder Transformer (≈ 300 lines) with the following classes, all subclasses of §nn.Module§:

| class | contents |
|---|---|
| §LayerNorm§ | your own (learnable §gamma§, §beta§) |
| §MultiHeadAttention§ | §d_model, n_heads, dropout§; one fused or four separate projections; returns output **and** attention weights; accepts a bool mask broadcastable to §(N, h, T_q, T_k)§ |
| §PositionwiseFeedForward§ | §d_model → d_ff → d_model§, ReLU, dropout |
| §PositionalEncoding§ | sinusoidal, registered as a buffer, + dropout |
| §EncoderLayer§, §DecoderLayer§ | residual + LayerNorm around each sub-layer; a §pre_norm: bool§ flag switches Post-LN (paper) / Pre-LN |
| §Transformer§ | embeddings scaled by $\sqrt{d_{model}}$, $N$ encoder and $N$ decoder layers, final projection to the target vocabulary with optional weight tying; methods §encode(src, src_mask)§, §decode(tgt, memory, src_mask, tgt_mask)§, §forward(src, tgt)§ building masks from a §pad_id§ |

Also write §test_transformer.py§ (pytest) with at least: output shape test; a **causality test** (changing future target tokens does not change earlier logits, in §eval()§ mode); a **padding test** (appending extra pad tokens to the source does not change the logits); and a parameter-count test comparing §sum(p.numel())§ to your closed-form count for the base configuration ($d=512$, $h=8$, $d_{ff}=2048$, $N=6$).`,
        files: ["4-transformer.py", "test_transformer.py"],
        checks: [
          { type: "defines", path: "4-transformer.py", names: ["LayerNorm", "MultiHeadAttention", "PositionwiseFeedForward", "PositionalEncoding", "EncoderLayer", "DecoderLayer", "Transformer"] },
          { type: "contains", path: "4-transformer.py", pattern: "import torch", label: "uses PyTorch" },
          { type: "not_contains", path: "4-transformer.py", pattern: "nn\\.Transformer|nn\\.MultiheadAttention|scaled_dot_product_attention|nn\\.LayerNorm", label: "no built-in transformer / attention / LayerNorm" },
          { type: "contains", path: "test_transformer.py", pattern: "def test_\\w*(causal|future)", label: "has a causality test" },
          { type: "contains", path: "test_transformer.py", pattern: "def test_\\w*pad", label: "has a padding test" },
          { type: "contains", path: "test_transformer.py", pattern: "numel", label: "has a parameter-count test" }
        ]
      },
      {
        title: "Train on Multi30k (German → English)",
        type: "mandatory",
        kind: "code",
        points: 6,
        body: md`Write §5-train.py§ that trains your Transformer on **Multi30k** (de→en, ~29k training pairs; e.g. the Hugging Face dataset §bentrevett/multi30k§) and evaluates on the 2016 test split (1,000 sentences).

- Tokenisation: a shared or separate BPE/SentencePiece vocabulary (≤ 10k each) **or** spaCy word tokens — state which.
- Model: e.g. $N=3$, $d=256$–$512$, $h=8$, $d_{ff}=4d$, dropout 0.1; label smoothing $\epsilon=0.1$; Adam($\beta_2=0.98$) with your Noam schedule; batches by token count if you can.
- Decode test sentences with greedy or beam search (beam ≤ 5) and compute detokenised **sacreBLEU**.
- Sanity check first: train a tiny model on a synthetic **sequence-reversal** task (random token strings of length 5–20) and report its exact-match accuracy.

§results.json§ keys: §test_bleu§ (≥ **30.0**), §reverse_task_accuracy§ (≥ **0.99**), §n_params§, §train_minutes§, §pre_norm§ (bool). Commit §loss_curve.png§ and 10 test translations in §samples.txt§ (source / reference / hypothesis).`,
        files: ["5-train.py", "results.json", "loss_curve.png", "samples.txt"],
        checks: [
          { type: "contains", path: "5-train.py", pattern: "4-transformer", label: "uses your task 4 model" },
          { type: "contains", path: "5-train.py", pattern: "label_smoothing|smooth", label: "label smoothing" },
          { type: "nonempty", path: "samples.txt", minLines: 30 },
          { type: "exists", path: "loss_curve.png" },
          { type: "json_metric", path: "results.json", key: "test_bleu", op: ">=", value: 30.0 },
          { type: "json_metric", path: "results.json", key: "reverse_task_accuracy", op: ">=", value: 0.99 }
        ]
      },
      {
        title: "README: derive attention",
        type: "mandatory",
        kind: "written",
        points: 4,
        body: md`Turn §README.md§ into a self-contained derivation of the Transformer (≈ 1,500–2,500 words, with equations; this is the Phase 3 portfolio piece):

1. Start from a hard key–value dictionary lookup and derive soft attention as its differentiable relaxation; arrive at $\mathrm{softmax}(QK^\top/\sqrt{d_k})V$ in matrix form with all shapes annotated.
2. Prove $\mathrm{Var}(q^\top k) = d_k$ under the unit-variance i.i.d. assumption and explain what happens to the softmax and its gradient without the scaling.
3. Show why self-attention is permutation-**equivariant** (so positions must be injected) and show that for sinusoidal encodings $PE_{pos+k}$ is a linear function of $PE_{pos}$.
4. Derive the FLOPs and memory of self-attention vs the FFN as functions of $T$ and $d$, and the crossover sequence length.
5. Count the parameters of your base model sub-layer by sub-layer and check against §test_transformer.py§.
6. Explain Post-LN vs Pre-LN and which one you used for task 5 and why.`,
        deliverable: "repo",
        files: ["README.md"],
        rubric: "derivation",
        criteria: [
          "Derives attention from a soft dictionary lookup with all matrix shapes stated",
          "Correct variance proof Var(q·k) = d_k and the softmax-saturation / vanishing-gradient consequence",
          "Proves permutation equivariance and the linear relation PE(pos+k) = M_k PE(pos) via rotation matrices",
          "Correct O(T²d) vs O(Td²) cost analysis with crossover T ≈ d (up to constants)",
          "Parameter count that matches the code's numel test",
          "Explains Post-LN vs Pre-LN (gradient behaviour at init, warm-up dependence)"
        ]
      },
      {
        title: "Annotated notes: Attention Is All You Need",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Write §notes/attention_is_all_you_need.md§ (PDF, Markdown or LaTeX accepted): section-by-section annotated notes on Vaswani et al. (2017). For each section, a summary in your own words **plus** at least one "annotation" that links the text to your implementation (file + class/function) or questions it. Cover: Table 1 (complexity per layer, sequential operations, path length) and why it matters; the training setup (§5) and which parts you reproduced; Table 3 ablations (heads, $d_k$, dropout, positional encoding) and what each says; and three things the paper leaves unexplained.`,
        deliverable: "repo",
        files: ["notes/attention_is_all_you_need.md"],
        rubric: "summary",
        criteria: [
          "Covers every section (architecture, why self-attention, training, results, ablations) in own words",
          "Explains Table 1 rows: complexity, sequential ops, maximum path length",
          "Interprets at least three Table 3 ablation rows",
          "Links annotations to concrete parts of own code",
          "Lists three genuine open questions / unexplained choices"
        ]
      },
      {
        title: "Label-smoothed cross-entropy",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`Create §100-label_smoothing.py§ with §label_smoothed_nll(log_probs, targets, epsilon, ignore_index=-100)§ (NumPy only):

- §log_probs§ §(N, T, V)§ log-softmax outputs; §targets§ §(N, T)§ ints, positions equal to §ignore_index§ are excluded.
- Smoothed target distribution (PyTorch convention): $q = (1-\epsilon)\,\text{onehot}(y) + \epsilon / V$ over **all** $V$ classes.
- Return the mean over non-ignored positions of $-\sum_v q_v \log p_v$ (a float). With §epsilon=0§ it must equal the usual NLL.

Then explain in your README why label smoothing hurts perplexity but improves BLEU.`,
        files: ["100-label_smoothing.py"],
        checks: [
          { type: "defines", path: "100-label_smoothing.py", names: ["label_smoothed_nll"] },
          {
            type: "py_test", files: ["100-label_smoothing.py"], label: "matches reference smoothing with ignore_index",
            code: py(String.raw`m = import_module('100-label_smoothing')
rng = np.random.default_rng(0)
N, T, V = 3, 5, 9
z = rng.normal(size=(N, T, V)); lp = z - np.log(np.exp(z).sum(-1, keepdims=True))
y = rng.integers(V, size=(N, T)); y[0, 1] = -100; y[2, 4] = -100
keep = y != -100
for eps in (0.0, 0.1, 0.3):
    q = np.full((N, T, V), eps / V); yy = np.where(keep, y, 0)
    np.put_along_axis(q, yy[..., None], (1 - eps) + eps / V, -1)
    ref = (-(q * lp).sum(-1))[keep].mean()
    assert np.isclose(m.label_smoothed_nll(lp, y, eps), ref), "wrong for epsilon=%s" % eps
print("ok")`)
          }
        ]
      }
    ]
  },

  // ───────────────────────────────────────────────────────────── A25
  {
    id: "A25",
    track: "applied",
    phase: PHASE,
    title: "Pretraining & Fine-tuning: BERT, GPT, T5",
    days: 3,
    repo: REPO,
    dir: "0x05-pretraining_finetuning",
    sources: [
      { course: "CS224N", lectures: "Lec 10–11", topics: "Pretraining (encoders, decoders, encoder–decoders: BERT, GPT, T5), fine-tuning, prompting & RLHF preview" }
    ],
    resources: [
      { title: "Devlin et al. — BERT: Pre-training of Deep Bidirectional Transformers", url: "https://arxiv.org/abs/1810.04805" },
      { title: "Radford et al. — Language Models are Unsupervised Multitask Learners (GPT-2)", url: "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf" },
      { title: "Raffel et al. — Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer (T5)", url: "https://arxiv.org/abs/1910.10683" },
      { title: "Sanh et al. — DistilBERT, a distilled version of BERT", url: "https://arxiv.org/abs/1910.01108" },
      { title: "Hugging Face Transformers — Fine-tuning a pretrained model", url: "https://huggingface.co/docs/transformers/training" }
    ],
    concepts: [
      "Masked language modelling (80/10/10 corruption)",
      "Causal language modelling",
      "Span corruption with sentinel tokens (T5)",
      "Encoder-only vs decoder-only vs encoder–decoder",
      "Subword tokenisation (WordPiece, BPE, SentencePiece)",
      "Fine-tuning vs training from scratch: sample efficiency",
      "Knowledge distillation (DistilBERT)",
      "In-context (few-shot) learning"
    ],
    objectives: [
      "Explain the MLM objective and why BERT replaces only 80% of selected tokens with [MASK]",
      "Implement T5-style span corruption and explain why it shortens targets",
      "Compare encoder-only, decoder-only and encoder–decoder pretraining objectives and what each is good at",
      "Fine-tune DistilBERT for text classification with the Hugging Face stack",
      "Measure the benefit of pretraining against a from-scratch Transformer at several training-set sizes",
      "Read and summarise the BERT, GPT-2 and T5 papers critically"
    ],
    requirements: [
      "Tasks 0–1: NumPy / standard library only",
      "Tasks 2–3 and 6: PyTorch + Hugging Face transformers/datasets; dataset: AG News or IMDb (pick one, use the official test split)"
    ],
    quiz: [
      {
        q: "In BERT's MLM, of the 15% of tokens selected for prediction, what happens to them?",
        options: [
          "100% replaced by [MASK]",
          "80% [MASK], 10% random token, 10% unchanged",
          "50% [MASK], 50% random token",
          "They are deleted from the input"
        ],
        answer: 1,
        why: "The 10%/10% part reduces the pretrain–finetune mismatch ([MASK] never appears downstream) and forces a representation for every token."
      },
      {
        q: "Why can't a vanilla BERT encoder be used directly for left-to-right text generation?",
        options: [
          "It has no positional encodings",
          "It is trained with bidirectional attention, so it never learned p(x_t | x_<t)",
          "Its vocabulary is too small",
          "It has no output layer"
        ],
        answer: 1,
        why: "MLM conditions on both sides; generation needs a causal factorisation."
      },
      {
        q: "T5 input: 'Thank you <X> me to your party <Y> week.' Target: '<X> for inviting <Y> last <Z>'. This objective is",
        options: ["Causal LM", "Span corruption", "Next sentence prediction", "Replaced-token detection"],
        answer: 1,
        why: "Contiguous spans are replaced by sentinel tokens and the target lists each sentinel followed by the dropped span."
      },
      {
        q: "DistilBERT is trained with a loss combining",
        options: [
          "MLM loss, distillation (soft-target) loss and a cosine embedding loss",
          "Only next-sentence prediction",
          "Contrastive loss on image–text pairs",
          "RLHF reward model loss"
        ],
        answer: 0,
        why: "A triple loss: MLM, KL/cross-entropy to the teacher's soft targets, and cosine alignment of hidden states."
      }
    ],
    tasks: [
      {
        title: "BERT masked-LM corruption",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Create §0-mlm_masking.py§ with

§mask_tokens(input_ids, mask_token_id, vocab_size, special_tokens_mask, rng, mlm_probability=0.15)§

- §input_ids§: int array of any shape (e.g. §(N, T)§); §special_tokens_mask§: bool array of the same shape (§True§ for [CLS], [SEP], [PAD] … which must **never** be selected); §rng§: §np.random.Generator§.
- Select each non-special position independently with probability §mlm_probability§ (Bernoulli). Of the selected positions: 80% → §mask_token_id§, 10% → a token drawn uniformly from §[0, vocab_size)§, 10% → left unchanged (decide per position, independently).
- Return §(inputs, labels)§: §inputs§ is a **new** array (do not modify §input_ids§ in place); §labels§ equals the original id at selected positions and §-100§ elsewhere.
- Use only §rng§ for randomness (same seed ⇒ same output). Vectorised. Also create §README.md§ (≥ 120 words).`,
        files: ["0-mlm_masking.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 120 },
          { type: "defines", path: "0-mlm_masking.py", names: ["mask_tokens"] },
          {
            type: "py_test", files: ["0-mlm_masking.py"], label: "15% selection with 80/10/10 split, specials untouched, deterministic",
            code: py(String.raw`m = import_module('0-mlm_masking')
rng0 = np.random.default_rng(123)
N, T, V, MASK = 400, 500, 30000, 103
ids = rng0.integers(1000, V, size=(N, T))
special = np.zeros((N, T), bool); special[:, 0] = True; special[:, -1] = True; special[::7, -60:] = True
orig = ids.copy()
inp, lab = m.mask_tokens(ids, MASK, V, special, np.random.default_rng(0))
inp, lab = np.asarray(inp), np.asarray(lab)
assert np.array_equal(ids, orig), "input_ids modified in place"
assert inp.shape == ids.shape and lab.shape == ids.shape
sel = lab != -100
assert not np.any(sel & special), "special tokens must never be selected"
assert np.array_equal(lab[sel], orig[sel]), "labels must hold the original ids"
assert np.array_equal(inp[~sel], orig[~sel]), "unselected tokens must be unchanged"
frac = sel.sum() / (~special).sum()
assert abs(frac - 0.15) < 0.01, "selection rate %.3f != 0.15" % frac
msk = (inp == MASK) & sel; same = (inp == orig) & sel; rnd = sel & ~msk & ~same
ns = sel.sum()
assert abs(msk.sum() / ns - 0.8) < 0.02, "expected ~80% [MASK]"
assert abs(rnd.sum() / ns - 0.1) < 0.02, "expected ~10% random tokens"
assert abs(same.sum() / ns - 0.1) < 0.02, "expected ~10% unchanged"
assert inp[rnd].min() >= 0 and inp[rnd].max() < V and len(np.unique(inp[rnd])) > 1000, "random tokens must be uniform over the vocabulary"
inp2, lab2 = m.mask_tokens(ids, MASK, V, special, np.random.default_rng(0))
assert np.array_equal(inp, inp2) and np.array_equal(lab, lab2), "must be deterministic given rng"
_, lab3 = m.mask_tokens(ids, MASK, V, special, np.random.default_rng(1), mlm_probability=0.3)
assert abs((np.asarray(lab3) != -100).sum() / (~special).sum() - 0.3) < 0.01, "mlm_probability ignored"
print("ok")`)
          }
        ]
      },
      {
        title: "T5 span corruption",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Create §1-span_corruption.py§ (NumPy / standard library) with:

- §random_spans_noise_mask(length, noise_density, mean_span_length, rng)§ → bool array §(length,)§ following T5: §num_noise = round(length * noise_density)§ clipped to §[1, length - 1]§; §num_spans = max(1, round(num_noise / mean_span_length))§, then clipped to at most §min(num_noise, length - num_noise)§ (use Python's built-in §round§, i.e. round-half-to-even, for both); split the noise tokens into §num_spans§ non-empty spans and the non-noise tokens into §num_spans§ non-empty spans (random partitions using §rng§), and interleave them **starting with non-noise**. Requires §length ≥ 2§.
- §span_corrupt(tokens, noise_mask, sentinel_start)§ → §(inputs, targets)§ as Python lists of int. Each maximal run of noise tokens is replaced in §inputs§ by one sentinel; sentinels are §sentinel_start, sentinel_start - 1, …§ in order (like §<extra_id_0>§ = 32099, §<extra_id_1>§ = 32098). §targets§ = for each span, its sentinel followed by the span's tokens, then one **final** sentinel (the next id). With no noise: §inputs = tokens§, §targets = [sentinel_start]§.

§§§python
>>> span_corrupt([10, 11, 12, 13, 14, 15, 16], [0, 1, 1, 0, 0, 1, 0], 99)
([10, 99, 13, 14, 98, 16], [99, 11, 12, 98, 15, 97])
§§§`,
        files: ["1-span_corruption.py"],
        checks: [
          { type: "defines", path: "1-span_corruption.py", names: ["random_spans_noise_mask", "span_corrupt"] },
          {
            type: "py_test", files: ["1-span_corruption.py"], label: "span corruption is invertible; noise mask has exact counts",
            code: py(String.raw`m = import_module('1-span_corruption')
inp, tgt = m.span_corrupt([10, 11, 12, 13, 14, 15, 16], np.array([0, 1, 1, 0, 0, 1, 0], bool), 99)
assert list(inp) == [10, 99, 13, 14, 98, 16] and list(tgt) == [99, 11, 12, 98, 15, 97]
inp, tgt = m.span_corrupt([5, 6, 7], np.zeros(3, bool), 99)
assert list(inp) == [5, 6, 7] and list(tgt) == [99]
inp, tgt = m.span_corrupt([5, 6, 7], np.array([1, 1, 0], bool), 99)
assert list(inp) == [99, 7] and list(tgt) == [99, 5, 6, 98]
def reconstruct(inp, tgt, S):
    segs, cur = {}, None
    for t in tgt:
        if S - 200 < t <= S: cur = t; segs[cur] = []
        else: segs[cur].append(t)
    out = []
    for t in inp:
        out.extend(segs[t] if S - 200 < t <= S else [t])
    return out
rng = np.random.default_rng(0)
for _ in range(200):
    L = int(rng.integers(2, 120)); dens = float(rng.choice([0.15, 0.3, 0.5])); msl = float(rng.choice([1.0, 3.0, 5.0]))
    mk = np.asarray(m.random_spans_noise_mask(L, dens, msl, rng)).astype(bool)
    nn_ = int(min(max(round(L * dens), 1), L - 1)); ns = max(1, int(round(nn_ / msl)))
    ns = min(ns, nn_, L - nn_)
    assert mk.shape == (L,) and mk.sum() == nn_, "wrong number of noise tokens"
    assert not mk[0], "must start with a non-noise span"
    starts = int(np.sum(mk[1:] & ~mk[:-1]))
    assert starts == ns, "wrong number of noise spans (got %d, expected %d)" % (starts, ns)
    toks = rng.integers(0, 1000, size=L).tolist()
    inp, tgt = m.span_corrupt(toks, mk, 32099)
    assert reconstruct(list(inp), list(tgt), 32099) == toks, "inputs+targets must reconstruct the original"
    assert list(tgt)[-1] == 32099 - ns, "missing final sentinel"
print("ok")`)
          }
        ]
      },
      {
        title: "Fine-tune DistilBERT",
        type: "mandatory",
        kind: "code",
        points: 4,
        body: md`Write §2-finetune_distilbert.py§ that fine-tunes §distilbert-base-uncased§ (Hugging Face §transformers§, §AutoModelForSequenceClassification§) on **AG News** (4 classes) or **IMDb** (2 classes): max length 256, AdamW, lr ∈ {2e-5, 3e-5, 5e-5} chosen on a held-out 10% of the training set, linear warm-up/decay, 2–3 epochs, fixed seed, mixed precision if available.

Also train on **1%** and **10%** of the training set (same hyper-parameters, stratified subsample) to get a learning curve.

Write (or merge into) §results.json§:
§§§json
{"dataset": "ag_news", "distilbert_test_accuracy": 0.944,
 "learning_curve": {"distilbert_1pct": 0.87, "distilbert_10pct": 0.92, "distilbert_100pct": 0.944},
 "distilbert_train_minutes": 35}
§§§
Threshold: §distilbert_test_accuracy ≥ 0.91§ on the full official test split.`,
        files: ["2-finetune_distilbert.py", "results.json"],
        checks: [
          { type: "contains", path: "2-finetune_distilbert.py", pattern: "distilbert-base-uncased", label: "uses DistilBERT" },
          { type: "contains", path: "2-finetune_distilbert.py", pattern: "transformers", label: "uses Hugging Face transformers" },
          { type: "json_metric", path: "results.json", key: "distilbert_test_accuracy", op: ">=", value: 0.91 },
          { type: "json_metric", path: "results.json", key: "learning_curve.distilbert_1pct", op: ">", value: 0 }
        ]
      },
      {
        title: "From-scratch Transformer baseline",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Write §3-scratch_baseline.py§: a Transformer **encoder** classifier built from your A24 modules (copy §4-transformer.py§ into this directory or import it), randomly initialised, with mean-pooling or a [CLS] token, trained on the same dataset, splits and tokenizer (the DistilBERT WordPiece tokenizer is allowed — only the weights must be random). Suggested: 4 layers, $d=256$, 4 heads, 10 epochs, AdamW, warm-up.

Run it on 1%, 10% and 100% of the training set. Add to §results.json§: §scratch_test_accuracy§ (100% data, ≥ **0.80**), §learning_curve.scratch_1pct§, §learning_curve.scratch_10pct§, §learning_curve.scratch_100pct§, §scratch_n_params§. This file must not load pretrained weights.`,
        files: ["3-scratch_baseline.py", "results.json"],
        checks: [
          { type: "contains", path: "3-scratch_baseline.py", pattern: "import torch", label: "uses PyTorch" },
          { type: "not_contains", path: "3-scratch_baseline.py", pattern: "AutoModel|from_pretrained\\([^)]*(bert|gpt|t5)", label: "no pretrained weights" },
          { type: "not_contains", path: "3-scratch_baseline.py", pattern: "nn\\.Transformer|nn\\.MultiheadAttention", label: "uses your own Transformer" },
          { type: "json_metric", path: "results.json", key: "scratch_test_accuracy", op: ">=", value: 0.80 },
          { type: "json_metric", path: "results.json", key: "learning_curve.scratch_1pct", op: ">", value: 0 }
        ]
      },
      {
        title: "Report: is pretraining worth it?",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Write §written/4-pretraining_report.md§ (PDF, Markdown or LaTeX accepted; 1–2 pages):

1. Plot test accuracy vs training-set size (1%, 10%, 100%, log-x) for DistilBERT and the scratch model; table with accuracy, parameters, wall-clock training time and GPU.
2. Quantify the sample efficiency gain: how much data does the scratch model need to match DistilBERT-at-1%?
3. Show 5 test examples DistilBERT gets right and the scratch model gets wrong, and hypothesise why (world knowledge, rare words, negation, …).
4. Discuss compute: what did pretraining DistilBERT cost (look it up) vs your fine-tune, and when would training from scratch still be the right call?`,
        deliverable: "repo",
        files: ["written/4-pretraining_report.md"],
        rubric: "report",
        criteria: [
          "Learning-curve plot with both models at 3 data sizes from own results.json",
          "Explicit sample-efficiency statement backed by the numbers",
          "Five concrete qualitative examples with plausible explanations",
          "Compute discussion citing DistilBERT's pretraining cost and a reasoned from-scratch use case"
        ]
      },
      {
        title: "Annotated notes: BERT, GPT-2, T5",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Write three annotated paper notes (PDF, Markdown or LaTeX accepted), §notes/bert.md§, §notes/gpt2.md§, §notes/t5.md§. For each: problem and contribution in 3 sentences; architecture and pretraining objective (with the exact corruption / factorisation as an equation or worked example); data and scale; the key experiment or table and what it shows; one limitation and one thing later work changed. In §notes/t5.md§ also summarise the objective-comparison study (prefix LM vs BERT-style vs span corruption) and the encoder–decoder vs decoder-only comparison.`,
        deliverable: "repo",
        files: ["notes/bert.md", "notes/gpt2.md", "notes/t5.md"],
        rubric: "summary",
        criteria: [
          "BERT: MLM 80/10/10 and NSP described correctly, plus the NSP ablation result",
          "GPT-2: causal LM factorisation, WebText, zero-shot task framing and scaling across 4 model sizes",
          "T5: text-to-text framing, span corruption with sentinels and C4",
          "T5 objective/architecture comparison summarised with the winning configuration",
          "One limitation and one later improvement per paper"
        ]
      },
      {
        title: "Few-shot prompting baseline",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`Write §100-fewshot.py§: classify **500** stratified test examples of your dataset with an open instruction-tuned LLM ≤ 8B parameters (e.g. Qwen2.5-1.5B/7B-Instruct, Llama-3.2-3B-Instruct) using a $k$-shot prompt ($k \in \{0, 4\}$) and constrained label scoring (compare the log-likelihood of each label word rather than parsing free text). Add §fewshot_test_accuracy_k0§ and §fewshot_test_accuracy_k4§ to §results.json§ and discuss in the report where prompting sits relative to fine-tuning.`,
        files: ["100-fewshot.py", "results.json"],
        checks: [
          { type: "exists", path: "100-fewshot.py" },
          { type: "contains", path: "100-fewshot.py", pattern: "log_softmax|logprob|log_prob|logits", label: "scores labels by likelihood" },
          { type: "json_metric", path: "results.json", key: "fewshot_test_accuracy_k4", op: ">", value: 0 }
        ]
      }
    ]
  },

  // ───────────────────────────────────────────────────────────── A26
  {
    id: "A26",
    track: "applied",
    phase: PHASE,
    title: "Modern Transformer Internals: RoPE, KV-Cache, Efficient Attention",
    days: 3,
    repo: REPO,
    dir: "0x06-rope_kvcache",
    sources: [
      { course: "CME295", lectures: "Lec 3–4", topics: "Scaling, positional encodings deep-dive (absolute, relative, RoPE), KV-cache, MQA/GQA, efficient attention (FlashAttention)" }
    ],
    resources: [
      { title: "Su et al. — RoFormer: Enhanced Transformer with Rotary Position Embedding", url: "https://arxiv.org/abs/2104.09864" },
      { title: "Dao et al. — FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness", url: "https://arxiv.org/abs/2205.14135" },
      { title: "Milakov & Gimelshein — Online normalizer calculation for softmax", url: "https://arxiv.org/abs/1805.02867" },
      { title: "Shazeer — Fast Transformer Decoding: One Write-Head is All You Need (MQA)", url: "https://arxiv.org/abs/1911.02150" },
      { title: "Ainslie et al. — GQA: Training Generalized Multi-Query Transformer Models", url: "https://arxiv.org/abs/2305.13245" }
    ],
    concepts: [
      "Absolute vs relative position information",
      "Rotary position embeddings (complex-number view)",
      "Interleaved vs rotate-half RoPE conventions",
      "Prefill vs decode phases of inference",
      "KV-cache memory footprint",
      "Online (streaming) softmax",
      "IO-aware tiled attention",
      "Multi-query and grouped-query attention"
    ],
    objectives: [
      "Prove that RoPE makes the query–key dot product depend only on the relative offset m − n",
      "Implement both RoPE conventions and show they are the same up to a fixed permutation of dimensions",
      "Explain why autoregressive decoding without a cache costs O(T²) per token and with a cache O(T)",
      "Compute the KV-cache size of a real model from its config and explain how GQA shrinks it",
      "Derive the online-softmax recurrence and implement exact attention in blocks without materialising the T×T matrix",
      "Measure the speed-up of cached generation and verify that it is numerically equivalent"
    ],
    requirements: [
      "Tasks 0–2 and 5: NumPy only",
      "Task 3: PyTorch, building on your A24 code (decoder-only variant)"
    ],
    quiz: [
      {
        q: "RoPE rotates query and key vectors by angles proportional to their positions m and n. Their dot product then depends on",
        options: ["m + n", "m − n only (plus the vectors' content)", "max(m, n)", "Neither position"],
        answer: 1,
        why: "⟨R_m q, R_n k⟩ = ⟨q, R_{n−m} k⟩ because rotation matrices are orthogonal and compose additively."
      },
      {
        q: "A model has 32 layers, 32 KV heads of size 128, fp16. KV-cache bytes per token are",
        options: ["256 KiB", "512 KiB", "128 KiB", "8 KiB"],
        answer: 1,
        why: "2 (K and V) × 32 layers × 32 heads × 128 dims × 2 bytes = 524,288 B = 512 KiB per token."
      },
      {
        q: "In the online softmax, when a new block raises the running max from m to m', the running sum l must be",
        options: ["Left unchanged", "Multiplied by exp(m − m')", "Multiplied by exp(m' − m)", "Reset to 0"],
        answer: 1,
        why: "l was accumulated as Σ exp(x − m); rescaling by exp(m − m') expresses it relative to the new max. The output accumulator is rescaled the same way."
      },
      {
        q: "FlashAttention is faster than standard attention mainly because it",
        options: [
          "Uses fewer FLOPs by approximating softmax",
          "Reduces reads/writes between GPU HBM and on-chip SRAM by tiling and never storing the T×T matrix",
          "Uses sparse attention patterns",
          "Runs attention on the CPU"
        ],
        answer: 1,
        why: "It is exact; the win is IO: attention is memory-bound, and tiling plus recomputation in the backward pass cuts HBM traffic."
      }
    ],
    tasks: [
      {
        title: "Rotary position embeddings",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Create §0-rope.py§ (NumPy only) with two functions; §x§ has shape §(..., T, d)§ with §d§ even, §positions§ is a 1-D array of length §T§ (ints or floats), and $\theta_i = \text{base}^{-2i/d}$ for $i = 0, \dots, d/2 - 1$.

- §apply_rope(x, positions, base=10000.0)§ — **interleaved** convention (RoFormer): pairs $(x_{2i}, x_{2i+1})$ are rotated by angle $p\,\theta_i$:
$$x'_{2i} = x_{2i}\cos p\theta_i - x_{2i+1}\sin p\theta_i,\qquad x'_{2i+1} = x_{2i}\sin p\theta_i + x_{2i+1}\cos p\theta_i$$
- §apply_rope_half(x, positions, base=10000.0)§ — **rotate-half** convention (GPT-NeoX / LLaMA in Hugging Face): pairs are $(x_i, x_{i + d/2})$ with the same $\theta_i$.

No loops over positions or dimensions. Also create §README.md§ (≥ 150 words) explaining both conventions and why mixing them up silently breaks a pretrained checkpoint.`,
        files: ["0-rope.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 150 },
          { type: "defines", path: "0-rope.py", names: ["apply_rope", "apply_rope_half"] },
          {
            type: "py_test", files: ["0-rope.py"], label: "reference values, norm preservation, relative-position property, convention equivalence",
            code: py(String.raw`m = import_module('0-rope')
rng = np.random.default_rng(0)
def ref(x, pos, base=10000.0):
    d = x.shape[-1]; th = base ** (-np.arange(0, d, 2) / d); a = np.asarray(pos, float)[:, None] * th[None, :]
    x1, x2 = x[..., 0::2], x[..., 1::2]; out = np.empty_like(x)
    out[..., 0::2] = x1 * np.cos(a) - x2 * np.sin(a); out[..., 1::2] = x1 * np.sin(a) + x2 * np.cos(a)
    return out
x = rng.normal(size=(2, 3, 10, 16)); pos = np.arange(10)
y = np.asarray(m.apply_rope(x, pos))
assert y.shape == x.shape and np.allclose(y, ref(x, pos)), "interleaved RoPE wrong"
assert np.allclose(m.apply_rope(x, pos, base=500.0), ref(x, pos, 500.0)), "base ignored"
assert np.allclose(np.linalg.norm(y, axis=-1), np.linalg.norm(x, axis=-1)), "RoPE must preserve norms"
assert np.allclose(np.asarray(m.apply_rope(x[..., :1, :], np.array([0])))[..., 0, :], x[..., 0, :]), "position 0 must be identity"
d = 32; q = rng.normal(size=(1, d)); k = rng.normal(size=(1, d))
def dot(mq, nk): return float(np.asarray(m.apply_rope(q, np.array([mq])))[0] @ np.asarray(m.apply_rope(k, np.array([nk])))[0])
for (a, b, s) in [(3, 7, 11), (20, 2, 100), (0, 0, 57), (5, 9, 1000)]:
    assert np.isclose(dot(a, b), dot(a + s, b + s)), "dot product must depend only on m - n"
perm = np.concatenate([np.arange(0, 16, 2), np.arange(1, 16, 2)])
yh = np.asarray(m.apply_rope_half(x[..., perm], pos))
assert np.allclose(yh, y[..., perm]), "rotate-half must equal interleaved up to the even/odd permutation"
print("ok")`)
          }
        ]
      },
      {
        title: "KV-cache: prefill and incremental decoding",
        type: "mandatory",
        kind: "code",
        points: 4,
        body: md`Create §1-kv_cache.py§ (NumPy only). §params§ is a dict with §"W_q", "W_k", "W_v", "W_o"§, each §(d, d)§ applied on the right; heads are split as in A24 (head $i$ = columns §i*d_h:(i+1)*d_h§, §d_h§ even). RoPE (§apply_rope§ from §0-rope.py§, interleaved, imported with §importlib§) is applied per head to queries and keys using **absolute** positions.

- §class KVCache§: starts empty; §update(k_new, v_new)§ appends tensors of shape §(N, h, t_new, d_h)§ along the time axis and returns the full §(k, v)§; §len(cache)§ = number of cached positions. Store keys **after** RoPE.
- §prefill(X, cache, params, n_heads, base=10000.0)§ — §X§ §(N, T0, d)§ at positions §len(cache) … len(cache)+T0-1§: computes Q/K/V, applies RoPE, updates the cache, and returns the causal multi-head attention output §(N, T0, d)§ (after §W_o§).
- §decode_step(x_t, cache, params, n_heads, base=10000.0)§ — §x_t§ §(N, d)§ is the token at position §len(cache)§; returns §(N, d)§. Must cost $O(t \cdot d)$ attention work (no recomputation of past keys/values).

The test checks that prefill + decode reproduces full causal attention exactly.`,
        files: ["1-kv_cache.py"],
        checks: [
          { type: "defines", path: "1-kv_cache.py", names: ["KVCache", "prefill", "decode_step"] },
          { type: "contains", path: "1-kv_cache.py", pattern: "0-rope", label: "reuses task 0" },
          {
            type: "py_test", files: ["0-rope.py", "1-kv_cache.py"], label: "cached decoding equals full causal RoPE attention",
            code: py(String.raw`m = import_module('1-kv_cache')
rng = np.random.default_rng(0)
N, T, d, h = 2, 9, 16, 2; dh = d // h
P = {k: rng.normal(size=(d, d)) / np.sqrt(d) for k in ("W_q", "W_k", "W_v", "W_o")}
X = rng.normal(size=(N, T, d))
def rope(x, pos):
    D = x.shape[-1]; th = 10000.0 ** (-np.arange(0, D, 2) / D); a = pos[:, None] * th[None, :]
    o = np.empty_like(x); o[..., 0::2] = x[..., 0::2] * np.cos(a) - x[..., 1::2] * np.sin(a)
    o[..., 1::2] = x[..., 0::2] * np.sin(a) + x[..., 1::2] * np.cos(a); return o
def split(Z): return Z.reshape(N, -1, h, dh).transpose(0, 2, 1, 3)
pos = np.arange(T, dtype=float)
Q = rope(split(X @ P["W_q"]), pos); K = rope(split(X @ P["W_k"]), pos); V = split(X @ P["W_v"])
s = Q @ K.transpose(0, 1, 3, 2) / np.sqrt(dh); s = np.where(np.tril(np.ones((T, T), bool)), s, -np.inf)
w = np.exp(s - s.max(-1, keepdims=True)); w /= w.sum(-1, keepdims=True)
full = (w @ V).transpose(0, 2, 1, 3).reshape(N, T, d) @ P["W_o"]
c = m.KVCache(); outs = []
for t in range(T):
    outs.append(np.asarray(m.decode_step(X[:, t], c, P, h)))
    assert len(c) == t + 1, "cache length must grow by one per step"
assert np.allclose(np.stack(outs, 1), full, atol=1e-10), "decode_step from an empty cache differs from full attention"
c2 = m.KVCache(); pre = np.asarray(m.prefill(X[:, :5], c2, P, h))
assert pre.shape == (N, 5, d) and np.allclose(pre, full[:, :5], atol=1e-10), "prefill wrong"
rest = np.stack([np.asarray(m.decode_step(X[:, t], c2, P, h)) for t in range(5, T)], 1)
assert np.allclose(rest, full[:, 5:], atol=1e-10), "decode after prefill wrong (positions must continue from len(cache))"
k, v = c2.update(np.zeros((N, h, 0, dh)), np.zeros((N, h, 0, dh)))
assert np.asarray(k).shape == (N, h, T, dh) and np.allclose(k, K, atol=1e-10), "cache must store RoPE-rotated keys"
print("ok")`)
          }
        ]
      },
      {
        title: "Tiled attention with online softmax",
        type: "mandatory",
        kind: "code",
        points: 4,
        body: md`Create §2-tiled_attention.py§ with §tiled_attention(Q, K, V, block_size, causal=False, scale=None)§ (NumPy only) computing exact attention $\mathrm{softmax}(QK^\top \cdot \text{scale})V$ **FlashAttention-style**:

- §Q§ §(T_q, d)§ is a normal array. §K§ §(T_k, d)§ and §V§ §(T_k, d_v)§ must be accessed **only** through §K.shape§ / §len(K)§ and slices §K[start:end]§ with §end - start <= block_size§ (same for §V§). The test passes wrapper objects that raise on anything else, so you cannot materialise the full $T_q \times T_k$ score matrix.
- Keep per-query running statistics: max $m$, normaliser $\ell$ and un-normalised output accumulator $O$; for each key block compute scores, update $m' = \max(m, \text{rowmax})$, rescale $\ell$ and $O$ by $e^{m - m'}$, add the block's contribution; divide by $\ell$ at the end.
- §scale§ defaults to $1/\sqrt{d}$. §causal=True§ requires §T_q == T_k§ and masks keys $j > i$ (skip blocks that are entirely masked).
- Returns §(T_q, d_v)§. Must be stable for large logits.`,
        files: ["2-tiled_attention.py"],
        checks: [
          { type: "defines", path: "2-tiled_attention.py", names: ["tiled_attention"] },
          {
            type: "py_test", files: ["2-tiled_attention.py"], label: "exact for all block sizes, causal, stable; only block-sized slices of K/V",
            code: py(String.raw`m = import_module('2-tiled_attention')
class BlockOnly:
    def __init__(self, a, bs):
        self._a = a; self.shape = a.shape; self.dtype = a.dtype; self.ndim = a.ndim; self.bs = bs; self.calls = 0
    def __len__(self): return self._a.shape[0]
    def __getitem__(self, idx):
        if not isinstance(idx, slice) or idx.step not in (None, 1):
            raise TypeError("only K[start:end] slicing is allowed")
        out = self._a[idx]
        if out.shape[0] > self.bs: raise AssertionError("slice of length %d > block_size %d" % (out.shape[0], self.bs))
        self.calls += 1
        return out
    def __array__(self, *a, **k): raise AssertionError("K/V must not be converted to a full array")
def ref(Q, K, V, causal=False, scale=None):
    sc = (1 / np.sqrt(Q.shape[1])) if scale is None else scale
    s = Q @ K.T * sc
    if causal: s = np.where(np.tril(np.ones(s.shape, bool)), s, -np.inf)
    w = np.exp(s - s.max(1, keepdims=True)); w /= w.sum(1, keepdims=True); return w @ V
rng = np.random.default_rng(0)
Q = rng.normal(size=(37, 16)); K = rng.normal(size=(53, 16)); V = rng.normal(size=(53, 8))
for bs in (1, 7, 16, 53, 64):
    Kw, Vw = BlockOnly(K, bs), BlockOnly(V, bs)
    out = np.asarray(m.tiled_attention(Q, Kw, Vw, bs))
    assert out.shape == (37, 8) and np.allclose(out, ref(Q, K, V)), "wrong result for block_size=%d" % bs
    assert Kw.calls >= -(-53 // bs), "K must be read block by block"
X = rng.normal(size=(40, 16)); Vc = rng.normal(size=(40, 4))
for bs in (5, 8, 40):
    out = np.asarray(m.tiled_attention(X, BlockOnly(X, bs), BlockOnly(Vc, bs), bs, causal=True))
    assert np.allclose(out, ref(X, X, Vc, causal=True)), "causal result wrong for block_size=%d" % bs
out = np.asarray(m.tiled_attention(Q * 40, BlockOnly(K * 40, 8), BlockOnly(V, 8), 8))
assert np.all(np.isfinite(out)) and np.allclose(out, ref(Q * 40, K * 40, V)), "not numerically stable"
assert np.allclose(m.tiled_attention(Q, BlockOnly(K, 8), BlockOnly(V, 8), 8, scale=0.3), ref(Q, K, V, scale=0.3))
print("ok")`)
          }
        ]
      },
      {
        title: "RoPE + KV-cache in your PyTorch Transformer",
        type: "mandatory",
        kind: "code",
        points: 4,
        body: md`Turn your A24 decoder into a **decoder-only** character-level LM in §3-model.py§ with RoPE in every attention layer (replacing sinusoidal encodings) and a KV-cache (§past_key_values§ or your own cache object, one per layer). Write §3-generate.py§ that:

1. Trains the model on Tiny Shakespeare (e.g. 6 layers, $d=384$, 6 heads, context 256) — once with RoPE and once with sinusoidal absolute encodings, same budget — and reports validation loss for both.
2. Generates 512 new tokens from the same prompt **with and without** the cache (greedy), checking that the logits at every step agree, and times both (batch 1, after warm-up, §torch.cuda.synchronize()§ if on GPU).

§results.json§: §val_loss_rope§ (nats/char, ≤ **1.60**), §val_loss_sinusoidal§, §max_abs_logit_diff§ (≤ **1e-3**, fp32), §tokens_per_sec_cache§, §tokens_per_sec_nocache§, §speedup§ (≥ **2.0**).`,
        files: ["3-model.py", "3-generate.py", "results.json"],
        checks: [
          { type: "contains", path: "3-model.py", pattern: "import torch", label: "uses PyTorch" },
          { type: "contains", path: "3-model.py", pattern: "[Rr][Oo][Pp][Ee]|[Rr]otary", label: "implements RoPE" },
          { type: "contains", path: "3-model.py", pattern: "[Cc]ache|past_key", label: "implements a KV-cache" },
          { type: "not_contains", path: "3-model.py", pattern: "nn\\.MultiheadAttention|nn\\.Transformer", label: "own attention" },
          { type: "json_metric", path: "results.json", key: "val_loss_rope", op: "<=", value: 1.6 },
          { type: "json_metric", path: "results.json", key: "max_abs_logit_diff", op: "<=", value: 0.001 },
          { type: "json_metric", path: "results.json", key: "speedup", op: ">=", value: 2.0 }
        ]
      },
      {
        title: "Derivation: RoPE, KV-cache memory and IO complexity",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`Write §written/4-rope_kvcache.pdf§ (PDF, Markdown or LaTeX accepted):

1. **RoPE.** In 2-D, write the rotation as multiplication by $e^{i m\theta}$ and prove $\langle R_m q, R_n k\rangle = \mathrm{Re}[q\,\bar k\, e^{i(m-n)\theta}]$; extend to $d$ dimensions block-diagonally. Explain the long-term decay argument from the RoFormer paper and why high-frequency pairs encode local and low-frequency pairs global position.
2. **KV-cache.** Derive the per-token cache size formula and compute total cache memory for (a) Llama-2-7B at 4,096 tokens, batch 1, fp16 (32 layers, 32 heads, $d_h=128$) and (b) the same with 8 KV heads (GQA, as in Llama-3-8B). Compare with the weights' memory.
3. **Decoding cost.** Count attention FLOPs to generate $T$ tokens with and without a cache; explain why decoding is memory-bandwidth-bound and how your measured speed-up compares.
4. **Online softmax.** Prove by induction that your block recurrence for $(m, \ell, O)$ yields exactly $\mathrm{softmax}(s)V$, and state the HBM-access complexity of standard vs FlashAttention from the paper.`,
        deliverable: "repo",
        files: ["written/4-rope_kvcache.pdf"],
        rubric: "derivation",
        criteria: [
          "Complex-number proof that the RoPE score depends only on m − n, extended block-diagonally",
          "Correct cache-size formula 2·L·H_kv·d_h·bytes per token and both numerical answers",
          "Correct O(T²) vs O(T) per-token argument (or O(T³) vs O(T²) total) and memory-bound discussion",
          "Inductive proof of the online-softmax recurrence including the rescaling factor e^{m−m'}",
          "States FlashAttention's O(N²d²/M) HBM accesses vs Θ(Nd + N²) for standard attention"
        ]
      },
      {
        title: "Grouped-query attention",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`Create §100-gqa.py§ with §grouped_query_attention(X, W_q, W_k, W_v, W_o, n_heads, n_kv_heads, causal=True)§ (NumPy only):

- §X§ §(N, T, d)§; §W_q§, §W_o§ §(d, d)§; §W_k§, §W_v§ §(d, n_kv_heads * d_h)§ with §d_h = d // n_heads§; §n_heads§ divisible by §n_kv_heads§.
- Query head $j$ uses KV head §j // (n_heads // n_kv_heads)§. Do **not** materialise repeated K/V copies with §np.repeat§/§np.tile§ — reshape the queries into groups instead.
- Returns §(N, T, d)§. With §n_kv_heads == n_heads§ it is standard MHA; with §n_kv_heads == 1§ it is MQA.`,
        files: ["100-gqa.py"],
        checks: [
          { type: "defines", path: "100-gqa.py", names: ["grouped_query_attention"] },
          { type: "not_contains", path: "100-gqa.py", pattern: "np\\.(repeat|tile)\\(", label: "no repeated K/V copies" },
          {
            type: "py_test", files: ["100-gqa.py"], label: "matches a per-head loop for MHA, GQA and MQA",
            code: py(String.raw`m = import_module('100-gqa')
rng = np.random.default_rng(0)
N, T, d, h = 2, 6, 24, 6; dh = d // h
X = rng.normal(size=(N, T, d)); Wq = rng.normal(size=(d, d)) / 5; Wo = rng.normal(size=(d, d)) / 5
for hkv in (6, 3, 2, 1):
    Wk = rng.normal(size=(d, hkv * dh)) / 5; Wv = rng.normal(size=(d, hkv * dh)) / 5
    Q, K, V = X @ Wq, X @ Wk, X @ Wv; outs = []
    for causal in (True, False):
        outs = []
        for j in range(h):
            g = j // (h // hkv)
            s = Q[..., j*dh:(j+1)*dh] @ np.swapaxes(K[..., g*dh:(g+1)*dh], 1, 2) / np.sqrt(dh)
            if causal: s = np.where(np.tril(np.ones((T, T), bool)), s, -np.inf)
            w = np.exp(s - s.max(-1, keepdims=True)); w /= w.sum(-1, keepdims=True)
            outs.append(w @ V[..., g*dh:(g+1)*dh])
        ref = np.concatenate(outs, -1) @ Wo
        got = np.asarray(m.grouped_query_attention(X, Wq, Wk, Wv, Wo, h, hkv, causal=causal))
        assert got.shape == (N, T, d) and np.allclose(got, ref), "wrong for n_kv_heads=%d causal=%s" % (hkv, causal)
print("ok")`)
          }
        ]
      }
    ]
  },

  // ───────────────────────────────────────────────────────────── A27
  {
    id: "A27",
    track: "applied",
    phase: PHASE,
    title: "Retrieval-Augmented Question Answering",
    days: 3,
    repo: REPO,
    dir: "0x07-rag_qa",
    sources: [
      { course: "CS224N", lectures: "Lec 12–13", topics: "Question answering, natural language generation" },
      { course: "CS224U", lectures: "Intro lectures", topics: "Course overview, NLU tasks, retrieval-augmented in-context learning" }
    ],
    resources: [
      { title: "Lewis et al. — Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", url: "https://arxiv.org/abs/2005.11401" },
      { title: "Karpukhin et al. — Dense Passage Retrieval for Open-Domain QA", url: "https://arxiv.org/abs/2004.04906" },
      { title: "Rajpurkar et al. — SQuAD: 100,000+ Questions for Machine Comprehension of Text", url: "https://arxiv.org/abs/1606.05250" },
      { title: "Khattab & Zaharia — ColBERT: Efficient and Effective Passage Search", url: "https://arxiv.org/abs/2004.12832" },
      { title: "CS224U course site", url: "https://web.stanford.edu/class/cs224u/" }
    ],
    concepts: [
      "Sparse retrieval: TF-IDF and BM25 (term saturation k1, length normalisation b)",
      "Dense bi-encoder retrieval",
      "Chunking with overlap",
      "Recall@k as the ceiling for the reader",
      "Hybrid retrieval and reciprocal rank fusion",
      "Closed-book vs open-book (retrieval-augmented) QA",
      "SQuAD exact match and token F1"
    ],
    objectives: [
      "Write the BM25 scoring function from memory and explain the role of k1 and b",
      "Implement and evaluate sparse and dense retrievers with recall@k",
      "Build a RAG pipeline (chunk → retrieve → prompt → generate) around an open LLM",
      "Evaluate generated answers with SQuAD EM/F1 and compare against closed-book generation",
      "Attribute errors to retrieval vs generation and propose fixes",
      "Explain when hybrid (sparse + dense) retrieval helps"
    ],
    requirements: [
      "Tasks 0–2 and 6: pure Python (NumPy allowed); no rank_bm25, Pyserini, scikit-learn or LangChain in those files",
      "Tasks 3–4: sentence-transformers / transformers allowed; any open-weights LLM ≤ 8B parameters (no closed APIs)"
    ],
    quiz: [
      {
        q: "In BM25, increasing k1 does what?",
        options: [
          "Makes term frequency saturate more slowly (repeated terms keep adding score longer)",
          "Increases the penalty for long documents",
          "Increases IDF of rare terms",
          "Removes stop words"
        ],
        answer: 0,
        why: "The tf part tf(k1+1)/(tf+k1·norm) approaches k1+1 as tf grows; larger k1 = slower saturation. b controls length normalisation."
      },
      {
        q: "If the retriever's recall@5 is 0.70 and the reader only sees the top-5 passages, the best achievable answer accuracy (on questions answerable only from the corpus) is roughly",
        options: ["1.0", "0.70", "0.35", "It is unrelated to recall"],
        answer: 1,
        why: "Retrieval recall upper-bounds the end-to-end accuracy when the answer must come from retrieved text."
      },
      {
        q: "Reciprocal rank fusion scores a document as",
        options: [
          "The maximum of its normalised scores",
          "$\\sum_r 1/(k + \\mathrm{rank}_r(d))$ over rankers r",
          "The product of its ranks",
          "The average cosine similarity"
        ],
        answer: 1,
        why: "RRF only needs ranks, so it combines incomparable score scales (BM25 vs cosine) robustly; k ≈ 60 by default."
      },
      {
        q: "Why do dense bi-encoders allow fast retrieval over millions of passages?",
        options: [
          "They cross-attend the query and every passage",
          "Passages are embedded once offline; a query needs one encoder pass plus a (approximate) maximum inner-product search",
          "They use inverted indices",
          "They don't need GPUs"
        ],
        answer: 1,
        why: "Independence of query and passage encoders enables precomputation; cross-encoders are more accurate but cost one forward pass per pair."
      }
    ],
    tasks: [
      {
        title: "BM25 from scratch",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Create §0-bm25.py§ with §class BM25§:

- §__init__(self, corpus, k1=1.5, b=0.75)§ — §corpus§: list of documents, each a list of tokens (already tokenised).
- §scores(self, query)§ → NumPy array §(N,)§ of BM25 scores for a token list §query§:
$$\text{score}(D, Q) = \sum_{t \in Q} \mathrm{idf}(t)\,\frac{f(t,D)\,(k_1+1)}{f(t,D) + k_1\left(1 - b + b\,\frac{|D|}{\text{avgdl}}\right)},\qquad \mathrm{idf}(t) = \ln\!\left(1 + \frac{N - n_t + 0.5}{n_t + 0.5}\right)$$
  where the sum runs over query tokens **including duplicates**, $n_t$ = number of documents containing $t$; unseen terms contribute 0.
- §top_k(self, query, k)§ → list of the §k§ best document indices, highest score first, ties broken by smaller index.

Build an inverted index in §__init__§ so that §scores§ only touches documents that contain a query term. Also create §README.md§ (≥ 150 words).`,
        files: ["0-bm25.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 150 },
          { type: "defines", path: "0-bm25.py", names: ["BM25"] },
          { type: "not_contains", path: "0-bm25.py", pattern: "rank_bm25|pyserini|sklearn", label: "no retrieval libraries" },
          {
            type: "py_test", files: ["0-bm25.py"], label: "scores and ranking match the reference formula",
            code: py(String.raw`import math, random
from collections import Counter
m = import_module('0-bm25')
rnd = random.Random(0); vocab = ["w%d" % i for i in range(40)]
corpus = [[rnd.choice(vocab[: rnd.randint(5, 40)]) for _ in range(rnd.randint(1, 30))] for _ in range(60)]
def ref(corpus, q, k1, b):
    N = len(corpus); avg = sum(map(len, corpus)) / N; df = Counter(t for d in corpus for t in set(d))
    out = np.zeros(N)
    for i, d in enumerate(corpus):
        tf = Counter(d)
        for t in q:
            if df[t] == 0: continue
            idf = math.log(1 + (N - df[t] + 0.5) / (df[t] + 0.5))
            out[i] += idf * tf[t] * (k1 + 1) / (tf[t] + k1 * (1 - b + b * len(d) / avg))
    return out
for k1, b in ((1.5, 0.75), (1.2, 0.0), (2.0, 1.0)):
    bm = m.BM25(corpus, k1=k1, b=b)
    for _ in range(10):
        q = [rnd.choice(vocab) for _ in range(rnd.randint(1, 5))] + ["unseen_term"]
        s = np.asarray(bm.scores(q), float); r = ref(corpus, q, k1, b)
        assert s.shape == (60,) and np.allclose(s, r), "BM25 scores differ from reference (k1=%s, b=%s)" % (k1, b)
        exp = sorted(range(60), key=lambda i: (-round(r[i], 9), i))[:7]
        assert list(bm.top_k(q, 7)) == exp, "top_k ranking/tie-break wrong"
bm = m.BM25(corpus)
assert np.allclose(bm.scores(["w1", "w1"]), 2 * np.asarray(bm.scores(["w1"]))), "duplicate query terms must count twice"
print("ok")`)
          }
        ]
      },
      {
        title: "Retrieval and QA metrics",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §1-metrics.py§ (standard library + NumPy) with:

- §recall_at_k(ranked, relevant, k)§ — §ranked§: list (one per query) of ranked doc-id lists; §relevant§: list of sets of relevant ids. Return the mean over queries of $|\text{top-}k \cap \text{rel}| / |\text{rel}|$ (queries with empty §rel§ are skipped).
- §normalize_answer(s)§ — the official SQuAD normalisation: lower-case, remove punctuation (§string.punctuation§), remove the articles *a, an, the* as whole words, collapse whitespace.
- §exact_match(prediction, ground_truths)§ → §1.0§ or §0.0§: max over ground truths of normalised string equality.
- §token_f1(prediction, ground_truths)§ → max over ground truths of the token-level F1 between normalised strings (bag-of-tokens overlap with multiplicity; F1 = 0 if no overlap).`,
        files: ["1-metrics.py"],
        checks: [
          { type: "defines", path: "1-metrics.py", names: ["recall_at_k", "normalize_answer", "exact_match", "token_f1"] },
          {
            type: "py_test", files: ["1-metrics.py"], label: "recall@k and SQuAD EM/F1 match reference",
            code: py(String.raw`m = import_module('1-metrics')
ranked = [[3, 1, 2, 9], [5, 6, 7, 8], [1, 2, 3, 4]]
rel = [{1, 9}, {8}, {4, 2}]
assert np.isclose(m.recall_at_k(ranked, rel, 2), (0.5 + 0 + 0.5) / 3)
assert np.isclose(m.recall_at_k(ranked, rel, 4), 1.0)
assert np.isclose(m.recall_at_k(ranked + [[1]], rel + [set()], 1), (0 + 0 + 0) / 3), "skip queries with no relevant docs"
assert m.normalize_answer("The  Eiffel-Tower, in Paris!") == "eiffeltower in paris"
assert m.normalize_answer("An apple a day") == "apple day"
assert m.normalize_answer("theatre") == "theatre", "remove articles only as whole words"
assert m.exact_match("the Eiffel Tower", ["Eiffel Tower", "tower"]) == 1.0
assert m.exact_match("Eiffel", ["Eiffel Tower"]) == 0.0
assert np.isclose(m.token_f1("Eiffel", ["Eiffel Tower"]), 2 * (1 * 0.5) / 1.5)
assert np.isclose(m.token_f1("in Paris France", ["Paris", "Paris, France"]), 2 * (2/3 * 1) / (2/3 + 1))
assert m.token_f1("London", ["Paris"]) == 0.0
assert np.isclose(m.token_f1("x x y", ["x y y"]), 2 * (2/3 * 2/3) / (4/3)), "count tokens with multiplicity"
print("ok")`)
          }
        ]
      },
      {
        title: "Chunking with overlap",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Create §2-chunk.py§ with §chunk_words(text, chunk_size, overlap)§:

- Split §text§ on whitespace (§text.split()§). Windows start at word $0, s, 2s, \dots$ with stride $s = \text{chunk\_size} - \text{overlap}$; each chunk is the next §chunk_size§ words joined by single spaces (the last may be shorter). Stop after the first chunk that reaches the end of the text (never emit a chunk fully contained in the previous one).
- Return a list of strings (§[]§ for empty text). Raise §ValueError§ if §chunk_size <= 0§, §overlap < 0§ or §overlap >= chunk_size§.`,
        files: ["2-chunk.py"],
        checks: [
          { type: "defines", path: "2-chunk.py", names: ["chunk_words"] },
          {
            type: "py_test", files: ["2-chunk.py"], label: "chunk boundaries, overlap and edge cases",
            code: py(String.raw`m = import_module('2-chunk')
def ref(text, n, o):
    w = text.split(); out = []; i = 0
    while i < len(w):
        out.append(" ".join(w[i:i+n]))
        if i + n >= len(w): break
        i += n - o
    return out
t = " ".join("w%d" % i for i in range(23))
assert m.chunk_words(t, 10, 3) == ref(t, 10, 3)
assert m.chunk_words(t, 10, 3)[1].split()[0] == "w7"
for L in range(0, 30):
    tx = "  \n ".join("t%d" % i for i in range(L))
    for n, o in ((5, 0), (5, 2), (7, 6), (1, 0), (30, 10)):
        assert m.chunk_words(tx, n, o) == ref(tx, n, o), "wrong chunks for %d words, size=%d, overlap=%d" % (L, n, o)
for bad in ((0, 0), (5, 5), (5, 7), (5, -1)):
    try:
        m.chunk_words(t, *bad); raise AssertionError("expected ValueError for %s" % (bad,))
    except ValueError:
        pass
print("ok")`)
          }
        ]
      },
      {
        title: "Sparse vs dense retrieval on SQuAD",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Write §3-retrieval_eval.py§:

- Corpus: **all unique context paragraphs** of the SQuAD v1.1 dev set (≈ 2,067); queries: **1,000** dev questions sampled with seed 0; the relevant document of a question is its source paragraph.
- Retrievers: (a) your §BM25§ (lower-cased, simple regex tokenisation, optional stop-word removal); (b) a dense bi-encoder from §sentence-transformers§ (e.g. §all-MiniLM-L6-v2§ or §BAAI/bge-small-en-v1.5§) with normalised embeddings and exact inner-product search in NumPy or FAISS.
- Evaluate recall@1, @5, @20 with your §recall_at_k§ and plot recall vs k for both (§recall_at_k.png§).

§results.json§ keys: §n_queries§ (≥ 1000), §bm25_recall_at_5§ (≥ **0.65**), §dense_recall_at_5§ (≥ **0.70**), plus the @1/@20 values.`,
        files: ["3-retrieval_eval.py", "results.json", "recall_at_k.png"],
        checks: [
          { type: "contains", path: "3-retrieval_eval.py", pattern: "0-bm25", label: "uses your BM25" },
          { type: "contains", path: "3-retrieval_eval.py", pattern: "sentence_transformers|SentenceTransformer|AutoModel", label: "dense encoder" },
          { type: "exists", path: "recall_at_k.png" },
          { type: "json_metric", path: "results.json", key: "n_queries", op: ">=", value: 1000 },
          { type: "json_metric", path: "results.json", key: "bm25_recall_at_5", op: ">=", value: 0.65 },
          { type: "json_metric", path: "results.json", key: "dense_recall_at_5", op: ">=", value: 0.70 }
        ]
      },
      {
        title: "RAG pipeline with an open LLM",
        type: "mandatory",
        kind: "code",
        points: 4,
        body: md`Write §4-rag.py§: a retrieval-augmented QA pipeline over the same corpus.

- Chunk paragraphs with §chunk_words§ (state size/overlap), retrieve the top-$k$ chunks ($k \le 5$) with your best retriever, and build a prompt that includes the numbered passages and instructs the model to answer with a **short span** (or "unanswerable").
- Generator: an open instruction-tuned LLM ≤ 8B (e.g. §Qwen/Qwen2.5-1.5B-Instruct§, §meta-llama/Llama-3.2-3B-Instruct§) via §transformers§, vLLM, llama.cpp or Ollama; greedy decoding, ≤ 32 new tokens.
- Evaluate on **200** dev questions (seed 0) with your §exact_match§ / §token_f1§ against all gold answers. Run the same model **closed-book** (no passages) as a baseline.
- Save every prediction to §predictions.jsonl§ (§question, gold, retrieved_ids, rag_answer, closedbook_answer§).

Add to §results.json§: §n_eval§ (≥ 200), §rag_em§, §rag_f1§ (≥ **0.50**), §closedbook_em§, §closedbook_f1§, §generator§ (model name).`,
        files: ["4-rag.py", "results.json", "predictions.jsonl"],
        checks: [
          { type: "contains", path: "4-rag.py", pattern: "2-chunk|chunk_words", label: "uses your chunker" },
          { type: "contains", path: "4-rag.py", pattern: "1-metrics|token_f1", label: "uses your metrics" },
          { type: "nonempty", path: "predictions.jsonl", minLines: 200 },
          { type: "json_metric", path: "results.json", key: "n_eval", op: ">=", value: 200 },
          { type: "json_metric", path: "results.json", key: "rag_f1", op: ">=", value: 0.5 }
        ]
      },
      {
        title: "Error analysis report",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Write §written/5-error_analysis.md§ (PDF, Markdown or LaTeX accepted; 1–2 pages):

1. Results table: BM25 vs dense recall@k; RAG vs closed-book EM/F1.
2. Take **30** RAG failures (F1 < 0.5) and label each as *retrieval miss* (gold paragraph not retrieved), *reader error* (retrieved but wrong answer), *correct-but-penalised* (paraphrase/longer span), or *gold issue*. Give counts and two examples per category.
3. How much of the closed-book → RAG gain is explained by recall? What would you change first (k, chunk size, reranker, prompt) and why — back it with one small extra experiment.`,
        deliverable: "repo",
        files: ["written/5-error_analysis.md"],
        rubric: "report",
        criteria: [
          "Results table consistent with results.json",
          "30 failures categorised into the four types with counts and examples",
          "Separates retrieval errors from generation errors quantitatively",
          "One additional experiment supporting the proposed improvement"
        ]
      },
      {
        title: "Hybrid retrieval with reciprocal rank fusion",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`Create §100-rrf.py§ with §reciprocal_rank_fusion(rankings, k=60, top_n=None)§:

- §rankings§: list of ranked lists of (integer) doc ids, best first (lists may have different lengths and need not contain the same ids).
- $\text{RRF}(d) = \sum_{r} \frac{1}{k + \text{rank}_r(d)}$ with ranks starting at **1**; a ranker that does not list $d$ contributes 0.
- Return the list of doc ids sorted by RRF score (descending), ties broken by smaller doc id; truncate to §top_n§ if given.

Use it to fuse BM25 and dense rankings in §3-retrieval_eval.py§ and add §hybrid_recall_at_5§ to §results.json§.`,
        files: ["100-rrf.py"],
        checks: [
          { type: "defines", path: "100-rrf.py", names: ["reciprocal_rank_fusion"] },
          {
            type: "py_test", files: ["100-rrf.py"], label: "fused ranking matches reference",
            code: py(String.raw`import random
m = import_module('100-rrf')
assert list(m.reciprocal_rank_fusion([[1, 2, 3], [3, 1, 2]], k=1)) == [1, 3, 2]
def ref(R, k, n=None):
    sc = {}
    for r in R:
        for i, d in enumerate(r): sc[d] = sc.get(d, 0.0) + 1.0 / (k + i + 1)
    out = sorted(sc, key=lambda d: (-sc[d], d))
    return out[:n] if n else out
rnd = random.Random(0)
for _ in range(200):
    R = [rnd.sample(range(30), rnd.randint(1, 15)) for _ in range(rnd.randint(1, 3))]
    k = rnd.choice([1, 10, 60]); n = rnd.choice([None, 5])
    assert list(m.reciprocal_rank_fusion(R, k=k, top_n=n)) == ref(R, k, n), "RRF differs for %s" % R
print("ok")`)
          }
        ]
      }
    ]
  },

  // ───────────────────────────────────────────────────────────── A28
  {
    id: "A28",
    track: "applied",
    phase: PHASE,
    title: "Sentence Embeddings & Semantic Search",
    days: 2,
    repo: REPO,
    dir: "0x08-semantic_search",
    sources: [
      { course: "CS224U", lectures: "Sentence meaning, grounded language, retrieval & embeddings lectures", topics: "Sentence representations, contrastive learning, neural IR, evaluation of retrieval" }
    ],
    resources: [
      { title: "Reimers & Gurevych — Sentence-BERT", url: "https://arxiv.org/abs/1908.10084" },
      { title: "Sentence-Transformers documentation (training, losses, evaluation)", url: "https://www.sbert.net/" },
      { title: "Henderson et al. — Efficient Natural Language Response Suggestion (in-batch negatives)", url: "https://arxiv.org/abs/1705.00652" },
      { title: "Thakur et al. — BEIR: a Heterogeneous Benchmark for Zero-shot IR", url: "https://arxiv.org/abs/2104.08663" },
      { title: "Gao, Yao & Chen — SimCSE: Simple Contrastive Learning of Sentence Embeddings", url: "https://arxiv.org/abs/2104.08821" }
    ],
    concepts: [
      "Bi-encoders and mean pooling",
      "Cosine similarity and normalised embeddings",
      "Contrastive (InfoNCE / multiple-negatives ranking) loss",
      "In-batch and hard negatives",
      "MRR@k and nDCG@k",
      "Domain adaptation of embedding models"
    ],
    objectives: [
      "Explain why raw BERT [CLS] vectors are poor sentence embeddings and how SBERT fixes it",
      "Implement top-k cosine search and the MRR/nDCG metrics",
      "Derive the multiple-negatives ranking loss as a softmax over in-batch candidates",
      "Fine-tune a sentence-embedding model on your own corpus and measure the gain over the off-the-shelf model",
      "Explain the risk of false negatives in hard-negative mining"
    ],
    requirements: [
      "Tasks 0–2 and 6: NumPy only",
      "Task 3–4: sentence-transformers / PyTorch"
    ],
    quiz: [
      {
        q: "With L2-normalised embeddings, ranking by cosine similarity is equivalent to ranking by",
        options: ["Euclidean distance (ascending) and dot product (descending)", "Manhattan distance", "Vector norm", "Number of shared tokens"],
        answer: 0,
        why: "For unit vectors ‖a − b‖² = 2 − 2a·b, so dot product, cosine and Euclidean distance all induce the same ranking."
      },
      {
        q: "In the multiple-negatives ranking loss with batch size B, each query is scored against",
        options: ["Only its positive", "Its positive and the other B − 1 positives in the batch (as negatives)", "All documents in the corpus", "B random words"],
        answer: 1,
        why: "It is a B-way softmax cross-entropy where the diagonal entries are the targets; bigger batches give more negatives for free."
      },
      {
        q: "A query's single relevant document is ranked 4th. Its reciprocal rank is",
        options: ["4", "0.25", "1/log2(5)", "0.75"],
        answer: 1,
        why: "RR = 1/rank of the first relevant result; MRR averages this over queries."
      },
      {
        q: "Why skip the very top-ranked non-positive documents when mining hard negatives?",
        options: [
          "They are too easy",
          "They are often unlabelled true positives (false negatives) that would teach the model the wrong thing",
          "They are duplicates of the query",
          "It makes training faster"
        ],
        answer: 1,
        why: "Relevance labels are incomplete; the highest-scoring 'negatives' are disproportionately actually relevant."
      }
    ],
    tasks: [
      {
        title: "Cosine top-k search",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §0-cosine_top_k.py§ with §cosine_top_k(queries, corpus, k)§ (NumPy only):

- §queries§ §(Q, D)§, §corpus§ §(N, D)§ (non-zero rows, not necessarily normalised), §1 ≤ k ≤ N§.
- Return §(indices, scores)§, both §(Q, k)§: for each query, the §k§ corpus rows with highest cosine similarity, sorted by score descending; §indices§ is an integer array.
- No Python loop over queries; use §np.argpartition§ before sorting so the cost is $O(N)$ per query rather than $O(N \log N)$.

Also create §README.md§ (≥ 150 words) describing your corpus and how to run the search.`,
        files: ["0-cosine_top_k.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 150 },
          { type: "defines", path: "0-cosine_top_k.py", names: ["cosine_top_k"] },
          { type: "contains", path: "0-cosine_top_k.py", pattern: "argpartition", label: "uses argpartition" },
          {
            type: "py_test", files: ["0-cosine_top_k.py"], label: "top-k indices and scores match a full sort",
            code: py(String.raw`m = import_module('0-cosine_top_k')
rng = np.random.default_rng(0)
Qm = rng.normal(size=(13, 20)); C = rng.normal(size=(300, 20)) * rng.uniform(0.1, 10, size=(300, 1))
S = (Qm / np.linalg.norm(Qm, axis=1, keepdims=True)) @ (C / np.linalg.norm(C, axis=1, keepdims=True)).T
for k in (1, 5, 300):
    idx, sc = m.cosine_top_k(Qm, C, k)
    idx, sc = np.asarray(idx), np.asarray(sc)
    assert idx.shape == (13, k) and sc.shape == (13, k) and np.issubdtype(idx.dtype, np.integer)
    ref = np.argsort(-S, axis=1)[:, :k]
    assert np.array_equal(idx, ref), "indices wrong for k=%d" % k
    assert np.allclose(sc, np.take_along_axis(S, ref, 1)), "scores wrong"
print("ok")`)
          }
        ]
      },
      {
        title: "MRR@k and nDCG@k",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §1-ranking_metrics.py§ with:

- §mrr_at_k(ranked, relevant, k=10)§ — §ranked§: list of ranked doc-id lists; §relevant§: list of sets. Reciprocal rank of the first relevant doc within the top §k§ (0 if none), averaged over queries.
- §ndcg_at_k(ranked, qrels, k=10)§ — §qrels§: list of dicts §{doc_id: grade}§ (grades are ints ≥ 0, missing = 0).
$$\mathrm{DCG@k} = \sum_{i=1}^{k} \frac{2^{\text{rel}_i} - 1}{\log_2(i+1)},\qquad \mathrm{nDCG@k} = \frac{\mathrm{DCG@k}}{\mathrm{IDCG@k}}$$
  where IDCG uses the **k largest grades in qrels** (not only those retrieved). Queries with IDCG = 0 score 0. Return the mean over queries.`,
        files: ["1-ranking_metrics.py"],
        checks: [
          { type: "defines", path: "1-ranking_metrics.py", names: ["mrr_at_k", "ndcg_at_k"] },
          {
            type: "py_test", files: ["1-ranking_metrics.py"], label: "MRR and graded nDCG match reference",
            code: py(String.raw`import random
m = import_module('1-ranking_metrics')
assert np.isclose(m.mrr_at_k([[5, 3, 9, 1]], [{1, 9}], k=10), 1 / 3)
assert np.isclose(m.mrr_at_k([[5, 3, 9, 1]], [{1}], k=3), 0.0)
assert np.isclose(m.ndcg_at_k([[1, 2, 3]], [{3: 2, 7: 1}], k=3), (3 / 2) / (3 + 1 / np.log2(3)))
def ref_ndcg(R, G, k):
    out = []
    for r, g in zip(R, G):
        dcg = sum((2 ** g.get(d, 0) - 1) / np.log2(i + 2) for i, d in enumerate(r[:k]))
        ideal = sorted(g.values(), reverse=True)[:k]
        idcg = sum((2 ** x - 1) / np.log2(i + 2) for i, x in enumerate(ideal))
        out.append(dcg / idcg if idcg > 0 else 0.0)
    return np.mean(out)
rnd = random.Random(0)
R = [rnd.sample(range(50), 20) for _ in range(30)]
G = [{d: rnd.randint(0, 3) for d in rnd.sample(range(50), rnd.randint(0, 8))} for _ in range(30)]
for k in (1, 5, 10, 20):
    assert np.isclose(m.ndcg_at_k(R, G, k), ref_ndcg(R, G, k)), "nDCG@%d wrong" % k
    rel = [{d for d, x in g.items() if x > 0} for g in G]
    rr = [next((1 / (i + 1) for i, d in enumerate(r[:k]) if d in s), 0.0) for r, s in zip(R, rel)]
    assert np.isclose(m.mrr_at_k(R, rel, k), np.mean(rr)), "MRR@%d wrong" % k
print("ok")`)
          }
        ]
      },
      {
        title: "Multiple-negatives ranking loss",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §2-contrastive_loss.py§ with §mnrl_loss(q, d, scale=20.0, d_neg=None)§ (NumPy only):

- §q§, §d§ §(B, D)§ — row $i$ of §d§ is the positive for query $i$; §d_neg§ optional §(B, D)§ hard negatives (one per query, shared as candidates for all queries).
- $S = \text{scale}\cdot \cos(q_i, c_j)$ where the candidates are the rows of §d§ (then §d_neg§ if given), so $S$ is §(B, B)§ or §(B, 2B)§.
- Return the mean over $i$ of the cross-entropy $-\log \mathrm{softmax}(S_i)_i$ as a float. Must be stable for §scale=1000§.

Then write in a docstring why this equals InfoNCE with temperature §1/scale§.`,
        files: ["2-contrastive_loss.py"],
        checks: [
          { type: "defines", path: "2-contrastive_loss.py", names: ["mnrl_loss"] },
          {
            type: "py_test", files: ["2-contrastive_loss.py"], label: "in-batch and hard-negative losses match reference, stable",
            code: py(String.raw`m = import_module('2-contrastive_loss')
rng = np.random.default_rng(0)
B, D = 8, 16
q = rng.normal(size=(B, D)); d = q + 0.5 * rng.normal(size=(B, D)); dn = rng.normal(size=(B, D)) * 3
nz = lambda x: x / np.linalg.norm(x, axis=1, keepdims=True)
def ref(q, c, s):
    S = s * nz(q) @ nz(c).T
    lse = S.max(1) + np.log(np.exp(S - S.max(1, keepdims=True)).sum(1))
    return float(np.mean(lse - S[np.arange(len(q)), np.arange(len(q))]))
for s in (1.0, 20.0, 1000.0):
    v = float(m.mnrl_loss(q, d, scale=s))
    assert np.isfinite(v) and np.isclose(v, ref(q, d, s)), "in-batch loss wrong (scale=%s)" % s
    v2 = float(m.mnrl_loss(q, d, scale=s, d_neg=dn))
    assert np.isclose(v2, ref(q, np.vstack([d, dn]), s)), "hard-negative loss wrong (scale=%s)" % s
assert float(m.mnrl_loss(q, d)) < float(m.mnrl_loss(q, d[::-1].copy())), "aligned pairs must give lower loss"
print("ok")`)
          }
        ]
      },
      {
        title: "Fine-tune SBERT on your own corpus",
        type: "mandatory",
        kind: "code",
        points: 4,
        body: md`Pick a corpus **you care about** (your notes, a documentation site, papers' abstracts in a subfield, Stack Exchange dump of one site, …) with **≥ 1,000 documents**. Write §3-finetune.py§:

1. Build (query, positive) training pairs: real titles/questions if available, otherwise synthetic queries generated with an open LLM (doc2query) — document the method in the README. **Split by document**: test documents and their queries are never seen in training.
2. Create a test set of **≥ 100 queries** with graded relevance judgements (at least the source document = grade 2; optionally others you labelled by hand = 1).
3. Baseline: an off-the-shelf model (e.g. §all-MiniLM-L6-v2§). Fine-tune it with §MultipleNegativesRankingLoss§ (in-batch negatives; optionally your hard negatives from task 6), batch ≥ 32, 1–3 epochs.
4. Evaluate baseline and fine-tuned models with **your** §cosine_top_k§, §mrr_at_k§ and §ndcg_at_k§.

§results.json§: §n_corpus_docs§ (≥ 1000), §n_test_queries§ (≥ 100), §baseline_ndcg_at_10§, §finetuned_ndcg_at_10§, §ndcg_gain§ (= fine-tuned − baseline, ≥ **0.02**), §baseline_mrr_at_10§, §finetuned_mrr_at_10§.`,
        files: ["3-finetune.py", "results.json"],
        checks: [
          { type: "contains", path: "3-finetune.py", pattern: "sentence_transformers", label: "uses sentence-transformers" },
          { type: "contains", path: "3-finetune.py", pattern: "MultipleNegativesRankingLoss|mnrl_loss", label: "contrastive loss" },
          { type: "contains", path: "3-finetune.py", pattern: "ndcg_at_k", label: "evaluates with your nDCG" },
          { type: "json_metric", path: "results.json", key: "n_corpus_docs", op: ">=", value: 1000 },
          { type: "json_metric", path: "results.json", key: "n_test_queries", op: ">=", value: 100 },
          { type: "json_metric", path: "results.json", key: "ndcg_gain", op: ">=", value: 0.02 }
        ]
      },
      {
        title: "Search interface",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §4-search.py§: a command-line (§argparse§) or Gradio/Streamlit app that loads the fine-tuned model and a precomputed embedding matrix (§embeddings.npy§, built once by a §--build§ flag), and prints/shows the top-§k§ documents (title + score + 200-character snippet) for a query using your §cosine_top_k§. Example: §python3 4-search.py "how do I reset a git branch" --k 5§. Put 3 example queries with their outputs in the README.`,
        files: ["4-search.py"],
        checks: [
          { type: "contains", path: "4-search.py", pattern: "argparse|gradio|streamlit", label: "has a CLI or UI" },
          { type: "contains", path: "4-search.py", pattern: "cosine_top_k", label: "uses your search function" },
          { type: "contains", path: "4-search.py", pattern: "\\.encode\\(", label: "encodes queries" }
        ]
      },
      {
        title: "Report: what did fine-tuning change?",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Write §written/5-report.md§ (PDF, Markdown or LaTeX accepted; ≈ 1 page): corpus and pair-construction method; metrics table (baseline vs fine-tuned, MRR@10, nDCG@10, plus recall@10); **3 queries** where fine-tuning helped and **2** where it hurt, with the top-3 results before/after; a short discussion of overfitting risk with synthetic queries and how your split guards against leakage.`,
        deliverable: "repo",
        files: ["written/5-report.md"],
        rubric: "report",
        criteria: [
          "Describes corpus, pair construction and the document-level train/test split",
          "Metrics table matching results.json",
          "Before/after examples: 3 improvements and 2 regressions with top-3 lists",
          "Discusses leakage / overfitting to synthetic queries"
        ]
      },
      {
        title: "Hard-negative mining",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`Create §100-hard_negatives.py§ with §mine_hard_negatives(q_emb, d_emb, positives, n_neg, skip_top=0)§ (NumPy only):

- §q_emb§ §(Q, D)§, §d_emb§ §(N, D)§; §positives§: list of sets of positive doc indices per query.
- For each query, rank all documents by cosine similarity (descending, ties by smaller index), drop the positives, drop the next §skip_top§ documents (likely false negatives), and return the following §n_neg§ indices.
- Return an int array §(Q, n_neg)§. Use it to add hard negatives in task 3 and report the effect.`,
        files: ["100-hard_negatives.py"],
        checks: [
          { type: "defines", path: "100-hard_negatives.py", names: ["mine_hard_negatives"] },
          {
            type: "py_test", files: ["100-hard_negatives.py"], label: "mined negatives match reference",
            code: py(String.raw`m = import_module('100-hard_negatives')
rng = np.random.default_rng(0)
Qe = rng.normal(size=(10, 8)); De = rng.normal(size=(80, 8))
pos = [set(rng.choice(80, size=int(rng.integers(1, 4)), replace=False).tolist()) for _ in range(10)]
S = (Qe / np.linalg.norm(Qe, axis=1, keepdims=True)) @ (De / np.linalg.norm(De, axis=1, keepdims=True)).T
for skip, n in ((0, 5), (3, 4), (10, 10)):
    got = np.asarray(m.mine_hard_negatives(Qe, De, pos, n, skip_top=skip))
    assert got.shape == (10, n) and np.issubdtype(got.dtype, np.integer)
    for i in range(10):
        order = [j for j in np.argsort(-S[i], kind='stable') if j not in pos[i]]
        assert got[i].tolist() == order[skip:skip + n], "wrong negatives for query %d (skip_top=%d)" % (i, skip)
print("ok")`)
          }
        ]
      }
    ]
  },

  // ───────────────────────────────────────────────────────────── A29
  {
    id: "A29",
    track: "applied",
    phase: PHASE,
    title: "LLM Agents & Tool Use",
    days: 3,
    repo: REPO,
    dir: "0x09-agents",
    sources: [
      { course: "CME295", lectures: "Agents, tool use & multimodal lectures", topics: "Tool calling, ReAct, planning, retrieval as a tool, agent evaluation, vision–language models" }
    ],
    resources: [
      { title: "Yao et al. — ReAct: Synergizing Reasoning and Acting in Language Models", url: "https://arxiv.org/abs/2210.03629" },
      { title: "Schick et al. — Toolformer: Language Models Can Teach Themselves to Use Tools", url: "https://arxiv.org/abs/2302.04761" },
      { title: "Gao et al. — PAL: Program-aided Language Models", url: "https://arxiv.org/abs/2211.10435" },
      { title: "Anthropic — Building effective agents", url: "https://www.anthropic.com/research/building-effective-agents" },
      { title: "Weng — LLM Powered Autonomous Agents", url: "https://lilianweng.github.io/posts/2023-06-23-agent/" }
    ],
    concepts: [
      "Chat templates and tool-calling formats",
      "The ReAct loop (thought → action → observation)",
      "Structured output parsing and error recovery",
      "Sandboxing tool execution",
      "Step budgets and termination",
      "Agent evaluation: task success, steps, failure taxonomy",
      "Workflows vs autonomous agents"
    ],
    objectives: [
      "Explain the ReAct pattern and how tool observations are fed back into the context",
      "Write a robust parser for model-emitted tool calls and final answers",
      "Implement an agent loop with a step budget and graceful handling of malformed calls, unknown tools and tool exceptions",
      "Run Python code from an LLM safely enough for local experiments (subprocess, timeout, output limits) and explain what is still unsafe",
      "Design a small evaluation set and measure the effect of tools on accuracy",
      "Communicate results and failure modes in a public write-up"
    ],
    requirements: [
      "Tasks 0 and 2: pure Python standard library; 2-agent.py must not import any LLM library at module level",
      "Tasks 3 and 5: an open-weights LLM ≤ 8B with tool-calling ability (e.g. Qwen2.5-7B-Instruct, Llama-3.1-8B-Instruct) via transformers, vLLM, llama.cpp or Ollama — no closed APIs"
    ],
    quiz: [
      {
        q: "In a ReAct agent, what is appended to the context after a tool runs?",
        options: [
          "Nothing; the model must remember the call",
          "The tool's output as an observation message, before the model's next turn",
          "Only the final answer",
          "The model's weights are updated"
        ],
        answer: 1,
        why: "The loop alternates model actions with environment observations; the observation conditions the next thought/action."
      },
      {
        q: "Why should an agent loop have a maximum number of steps?",
        options: [
          "Because LLMs cannot count",
          "To bound cost and latency and to stop loops where the model repeats the same failing action",
          "To make the parser simpler",
          "Because tools are stateless"
        ],
        answer: 1,
        why: "Without a budget, a confused model can loop forever; the budget turns that into a measurable failure."
      },
      {
        q: "Running model-generated Python with subprocess + timeout is",
        options: [
          "Fully secure",
          "A minimal guard against hangs, not a security sandbox (it still has file-system and network access)",
          "Equivalent to a Docker container",
          "Unnecessary for local models"
        ],
        answer: 1,
        why: "Real isolation needs containers/VMs, no network, resource limits and a read-only filesystem."
      },
      {
        q: "PAL / program-aided reasoning improves arithmetic accuracy mainly because",
        options: [
          "The model is fine-tuned on code",
          "Computation is offloaded to an interpreter, so the model only has to write a correct program",
          "Programs are shorter than text",
          "It uses retrieval"
        ],
        answer: 1,
        why: "LLMs are unreliable calculators but decent programmers; the interpreter executes exactly."
      }
    ],
    tasks: [
      {
        title: "Tool-call and final-answer parser",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Your agent uses the Hermes/Qwen tool-call format: the model writes one or more blocks

§§§text
<tool_call>
{"name": "python", "arguments": {"code": "print(2**10)"}}
</tool_call>
§§§

Create §0-tool_parser.py§ (standard library only) with:

- §parse_tool_calls(text)§ → §(calls, errors)§. §calls§: list (in order) of §{"name": str, "arguments": dict}§; §errors§: list of strings, one per malformed block. A block is the text between §<tool_call>§ and the next §</tool_call>§. It is valid if it is a JSON object with a string §"name"§ and §"arguments"§ that is either a dict, a JSON **string** that decodes to a dict, or missing (→ §{}§). Anything else (bad JSON, missing name, non-dict arguments) is an error. JSON strings inside arguments may contain braces, newlines and quotes.
- §parse_final_answer(text)§ → the text after the **last** occurrence of §"Final Answer:"§, stripped, or §None§ if absent.

Also create §README.md§ (≥ 150 words).`,
        files: ["0-tool_parser.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 150 },
          { type: "defines", path: "0-tool_parser.py", names: ["parse_tool_calls", "parse_final_answer"] },
          {
            type: "py_test", files: ["0-tool_parser.py"], label: "parses valid calls, reports malformed ones, extracts final answers",
            code: py(String.raw`m = import_module('0-tool_parser')
t1 = 'Thought: compute.\n<tool_call>\n' + r'{"name": "python", "arguments": {"code": "d = {1: 2}\nprint(d[1], \"}\")"}}' + '\n</tool_call>'
calls, errs = m.parse_tool_calls(t1)
assert errs == [] and len(calls) == 1 and calls[0]["name"] == "python"
assert calls[0]["arguments"]["code"] == 'd = {1: 2}\nprint(d[1], "}")', "string arguments must be preserved exactly"
t2 = (r'<tool_call>{"name": "add", "arguments": {"a": 1, "b": 2}}</tool_call> then '
      r'<tool_call>{"name": python}</tool_call>' + '\n' +
      r'<tool_call>{"name": "search", "arguments": "{\"q\": \"rope\"}"}</tool_call>'
      r'<tool_call>{"arguments": {}}</tool_call>'
      r'<tool_call>{"name": "x", "arguments": "[1, 2]"}</tool_call>'
      r'<tool_call>{"name": "now"}</tool_call>')
calls, errs = m.parse_tool_calls(t2)
assert [c["name"] for c in calls] == ["add", "search", "now"], "wrong valid calls: %s" % calls
assert calls[0]["arguments"] == {"a": 1, "b": 2} and calls[1]["arguments"] == {"q": "rope"} and calls[2]["arguments"] == {}
assert len(errs) == 3 and all(isinstance(e, str) and e for e in errs), "expected 3 error messages"
assert m.parse_tool_calls("no tools here") == ([], [])
assert m.parse_final_answer("Thought: done\nFinal Answer: 42\n") == "42"
assert m.parse_final_answer("Final Answer: 1\nwait\nFinal Answer:  line1\nline2  ") == "line1\nline2"
assert m.parse_final_answer("I think it's 42") is None
print("ok")`)
          }
        ]
      },
      {
        title: "Python tool with timeout",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Create §1-python_tool.py§ with §run_python(code, timeout=10, max_output_chars=2000)§ → §str§:

- Executes §code§ in a **separate** Python process (§subprocess.run([sys.executable, "-I", "-c", code], ...)§ or a temp file) with a fresh temporary working directory, capturing stdout and stderr.
- On timeout, kill the process and return a string starting with §"TimeoutError"§. On a non-zero exit, return the captured stderr (traceback) so the model can fix its code.
- Truncate the returned text to §max_output_chars§ (keep the head and tail with §"...[truncated]..."§ in between).
- In the README, list what this does **not** protect against (filesystem, network, fork bombs, memory) and how you would sandbox it properly.`,
        files: ["1-python_tool.py"],
        checks: [
          { type: "defines", path: "1-python_tool.py", names: ["run_python"] },
          { type: "contains", path: "1-python_tool.py", pattern: "subprocess", label: "separate process" },
          { type: "contains", path: "1-python_tool.py", pattern: "timeout", label: "timeout" },
          { type: "contains", path: "1-python_tool.py", pattern: "TimeoutError", label: "reports timeouts" },
          { type: "contains", path: "1-python_tool.py", pattern: "max_output_chars", label: "truncates output" }
        ]
      },
      {
        title: "The ReAct agent loop",
        type: "mandatory",
        kind: "code",
        points: 4,
        body: md`Create §2-agent.py§ with §run_agent(question, llm, tools, max_steps=6, system_prompt=None)§. The LLM and tools are injected so the loop is testable without a model:

- §llm(messages) -> str§ where §messages§ is a list of §{"role": ..., "content": ...}§ dicts; §tools§: dict name → callable taking keyword arguments and returning a string.
- §messages§ starts with a §"system"§ message (your default prompt describing the format and the tool names, or §system_prompt§) followed by §{"role": "user", "content": question}§.
- Each step: call §llm(messages)§ once (one step = one call) and append its reply as §"assistant"§. Then, using the parser from §0-tool_parser.py§ (via §importlib§):
  - if the reply contains tool calls (valid or malformed), execute the valid ones in order and append one §{"role": "tool", "content": ...}§ message per call holding the tool's output; unknown tools, tool exceptions and malformed blocks produce a tool message containing §"Error"§ and the details (exception message included). Tool calls take precedence over a final answer in the same reply.
  - else if it contains §Final Answer:§, stop and return.
  - else append a §"user"§ message reminding the model of the format, and continue.
- Return §{"answer": str | None, "steps": int, "messages": list}§; §answer§ is §None§ when §max_steps§ is exhausted.`,
        files: ["2-agent.py"],
        checks: [
          { type: "defines", path: "2-agent.py", names: ["run_agent"] },
          { type: "contains", path: "2-agent.py", pattern: "0-tool_parser", label: "reuses the parser" },
          { type: "not_contains", path: "2-agent.py", pattern: "^(import|from) (torch|transformers|vllm|ollama|llama_cpp)", label: "no LLM imports at module level" },
          {
            type: "py_test", files: ["0-tool_parser.py", "2-agent.py"], label: "loop with a scripted fake LLM: observations, errors, budget",
            code: py(String.raw`m = import_module('2-agent')
def scripted(replies):
    log = []
    def llm(messages):
        log.append([dict(x) for x in messages])
        return replies[min(len(log) - 1, len(replies) - 1)]
    return llm, log
llm, log = scripted(['Thought: add\n<tool_call>{"name": "add", "arguments": {"a": 2, "b": 40}}</tool_call>', 'Final Answer: 42'])
res = m.run_agent("what is 2+40?", llm, {"add": lambda a, b: str(a + b)})
assert res["answer"] == "42" and res["steps"] == 2, "basic loop failed: %s" % res
assert log[0][0]["role"] == "system" and log[0][-1]["role"] == "user" and "2+40" in log[0][-1]["content"]
assert any(x["role"] == "tool" and "42" in x["content"] for x in log[1]), "tool output must be fed back"
assert log[1][-2]["role"] == "assistant", "assistant reply must be appended before the observation"
llm, log = scripted(['<tool_call>{"name": "nope", "arguments": {}}</tool_call>', 'Final Answer: ok'])
res = m.run_agent("q", llm, {})
assert res["answer"] == "ok" and any(x["role"] == "tool" and "Error" in x["content"] for x in log[1]), "unknown tool must produce an Error observation"
def boom(**kw): raise ValueError("kaboom")
llm, log = scripted(['<tool_call>{"name": "boom", "arguments": {}}</tool_call>', 'Final Answer: done'])
res = m.run_agent("q", llm, {"boom": boom})
assert res["answer"] == "done" and any(x["role"] == "tool" and "kaboom" in x["content"] for x in log[1]), "tool exceptions must be reported"
llm, log = scripted(['<tool_call>{"name": broken</tool_call>', 'Final Answer: fixed'])
res = m.run_agent("q", llm, {})
assert res["answer"] == "fixed" and any(x["role"] == "tool" and "Error" in x["content"] for x in log[1]), "malformed calls must be reported"
llm, log = scripted(['<tool_call>{"name": "add", "arguments": {"a": 1, "b": 1}}</tool_call>'])
res = m.run_agent("q", llm, {"add": lambda a, b: str(a + b)}, max_steps=3)
assert res["answer"] is None and res["steps"] == 3 and len(log) == 3, "max_steps not enforced"
llm, log = scripted(['I am not sure.', 'Final Answer: 7'])
res = m.run_agent("q", llm, {})
assert res["answer"] == "7" and res["steps"] == 2 and log[1][-1]["role"] == "user", "replies without action need a format reminder"
llm, log = scripted(['<tool_call>{"name": "add", "arguments": {"a": 3, "b": 4}}</tool_call>\nFinal Answer: 99', 'Final Answer: 7'])
res = m.run_agent("q", llm, {"add": lambda a, b: str(a + b)})
assert res["answer"] == "7", "tool calls take precedence over a final answer in the same reply"
print("ok")`)
          }
        ]
      },
      {
        title: "Evaluate the agent on 20 tasks",
        type: "mandatory",
        kind: "code",
        points: 4,
        body: md`Create §tasks.jsonl§ with **20** tasks (one JSON object per line: §{"id", "question", "answer", "type"}§) that you wrote yourself, of which **at least 10 require exact computation** a model cannot reliably do in its head (big-integer arithmetic, date differences, string manipulation on long inputs, simple simulations, numerical integration…) and the rest test when **not** to use a tool. Answers must be checkable by exact match after normalisation (or a numeric tolerance you state).

Write §3-eval.py§ that runs §run_agent§ with your open LLM (chat template + tool schema for §python§ = §run_python§) on every task, and the same model **without tools** (single answer). Log full traces to §traces.jsonl§.

§results.json§: §model§, §n_tasks§ (= **20**), §agent_accuracy§ (≥ **0.60**), §no_tool_accuracy§, §avg_steps§, §n_malformed_calls§.`,
        files: ["tasks.jsonl", "3-eval.py", "results.json", "traces.jsonl"],
        checks: [
          { type: "nonempty", path: "tasks.jsonl", minLines: 20 },
          { type: "contains", path: "3-eval.py", pattern: "2-agent|run_agent", label: "uses your agent loop" },
          { type: "exists", path: "traces.jsonl" },
          { type: "json_metric", path: "results.json", key: "n_tasks", op: "==", value: 20 },
          { type: "json_metric", path: "results.json", key: "agent_accuracy", op: ">=", value: 0.6 }
        ]
      },
      {
        title: "Medium write-up: building a small agent",
        type: "mandatory",
        kind: "written",
        points: 3,
        body: md`Publish a Medium (or personal blog) post, 1,200–2,000 words, *"Building a ReAct agent with an open-source LLM from scratch"*:

1. The ReAct idea in your own words with a diagram of your loop.
2. Your tool-call format, parser and the failure cases you had to handle (with real snippets from §traces.jsonl§).
3. Results: agent vs no-tool accuracy table, average steps, and a failure taxonomy over all failed tasks (wrong tool use, bad code, loop/budget exhausted, parse errors, wrong reasoning).
4. Safety: what your Python tool does not protect against.
5. What you would build next (e.g. retrieval tool from A27, planning, multimodal input). Link the GitHub directory.`,
        deliverable: "link",
        rubric: "report",
        criteria: [
          "Explains ReAct with a diagram of the implemented loop",
          "Shows real traces including at least one recovered error",
          "Agent vs no-tool results table consistent with results.json",
          "Failure taxonomy covering every failed task",
          "Honest safety discussion of executing model-written code"
        ]
      },
      {
        title: "Second tool: retrieval",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`Add a §search(query: str, k: int = 3)§ tool in §100-search_tool.py§ backed by your A27/A28 retriever over a document collection, extend §tasks.jsonl§ with **5** questions that need both lookup and computation (e.g. "how many years between the founding dates of X and Y?"), and evaluate with both tools. Add §agent_accuracy_two_tools§ (on the 5 new tasks) and §tool_choice_accuracy§ (fraction of tasks where the agent called the right tool first) to §results.json§.`,
        files: ["100-search_tool.py", "results.json"],
        checks: [
          { type: "defines", path: "100-search_tool.py", names: ["search"] },
          { type: "json_metric", path: "results.json", key: "agent_accuracy_two_tools", op: ">=", value: 0 },
          { type: "json_metric", path: "results.json", key: "tool_choice_accuracy", op: ">=", value: 0 }
        ]
      }
    ]
  }
];
