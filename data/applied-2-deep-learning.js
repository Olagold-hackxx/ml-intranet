// Applied track — Phase 2: Deep Learning Core (CS230 + CS231N interleaved, weeks 9–16).
// Bodies use the `md` tag: String.raw semantics (no escaping of LaTeX backslashes) and
// "§" stands for a backtick, so inline code / fences can live inside template literals.
const md = (s, ...v) => String.raw(s, ...v).replace(/§/g, "`");

const PHASE = "Phase 2 — Deep Learning Core";
const REPO = "ml-deep-learning";
const NO_LOOP = { pattern: "^\\s*(for|while)\\s", label: "no Python loops (fully vectorized)" };

export default [
  // ───────────────────────────────────────────────────────────────── A11
  {
    id: "A11",
    track: "applied",
    phase: PHASE,
    title: "PyTorch Fundamentals: MLP on Fashion-MNIST",
    days: 2,
    repo: REPO,
    dir: "0x00-pytorch_mlp",
    sources: [
      { course: "CS230", lectures: "Lec 1–2", topics: "Deep learning intuition, the full-cycle deep learning project" },
    ],
    resources: [
      { title: "PyTorch — Learn the Basics (tensors, datasets, autograd, optimization)", url: "https://pytorch.org/tutorials/beginner/basics/intro.html" },
      { title: "PyTorch — A Gentle Introduction to torch.autograd", url: "https://pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html" },
      { title: "PyTorch docs — torch.utils.data (Dataset, DataLoader)", url: "https://pytorch.org/docs/stable/data.html" },
      { title: "PyTorch docs — Extending PyTorch (custom autograd Functions)", url: "https://pytorch.org/docs/stable/notes/extending.html" },
      { title: "Xiao et al., Fashion-MNIST (2017)", url: "https://arxiv.org/abs/1708.07747" },
    ],
    concepts: [
      "Tensors, dtypes, devices and broadcasting",
      "Dynamic computation graphs and reverse-mode autograd",
      "Dataset / DataLoader / transforms",
      "nn.Module, parameters and state_dict",
      "The canonical training loop (zero_grad → forward → loss → backward → step)",
      "train() vs eval() mode and torch.no_grad()",
      "Numerically stable log-softmax / cross-entropy",
    ],
    objectives: [
      "Explain what autograd records during a forward pass and what .backward() computes",
      "Explain why gradients must be zeroed between optimizer steps",
      "Build a Dataset/DataLoader pipeline with a reproducible train/validation split",
      "Write a training loop and an evaluation loop from memory, with correct mode switching",
      "Show that nn.CrossEntropyLoss expects raw logits and why that is numerically better",
      "Verify a PyTorch model against an independent NumPy implementation",
    ],
    requirements: [
      "Python 3.10+, PyTorch 2.x, torchvision; NumPy only for 4-numpy_parity.py",
      "All randomness seeded (torch.manual_seed, numpy default_rng) so results are reproducible",
      "No high-level trainers (no PyTorch Lightning, no Keras, no skorch)",
    ],
    quiz: [
      {
        q: "You forget to call optimizer.zero_grad() in your training loop. What happens?",
        options: ["Nothing, PyTorch zeroes gradients automatically after step()", "Gradients from every previous iteration accumulate into .grad, so updates become wrong", "An error is raised at the next backward()", "Only the bias gradients accumulate"],
        answer: 1,
        why: "backward() adds into .grad; without zeroing, each step uses the sum of all past gradients.",
      },
      {
        q: "Your model ends with nn.Softmax and you train with nn.CrossEntropyLoss. What is the problem?",
        options: ["None, that is the recommended setup", "CrossEntropyLoss already applies log-softmax, so you apply softmax twice and get flat gradients", "CrossEntropyLoss requires one-hot targets", "Softmax is not differentiable"],
        answer: 1,
        why: "nn.CrossEntropyLoss = LogSoftmax + NLLLoss on raw logits; an extra softmax squashes the logits and slows learning.",
      },
      {
        q: "What does model.eval() change?",
        options: ["It disables gradient computation", "It switches layers such as Dropout and BatchNorm to inference behaviour", "It moves the model to the CPU", "It freezes the parameters"],
        answer: 1,
        why: "eval() only flips the training flag. Gradient tracking is disabled separately with torch.no_grad() / inference_mode().",
      },
      {
        q: "Why compute log-sum-exp as m + log Σ exp(z − m) with m = max(z)?",
        options: ["It is faster", "It avoids overflow of exp for large logits without changing the result", "It makes the loss convex", "It is required by autograd"],
        answer: 1,
        why: "Subtracting the max keeps every exponent ≤ 0, so exp never overflows, and the shift cancels exactly.",
      },
    ],
    tasks: [
      {
        title: "Autograd warm-up",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Create the repo **ml-deep-learning** and the directory **0x00-pytorch_mlp** with a §README.md§ (≥ 80 words: what the project does, how to run each script, final test accuracy).

Write §0-autograd.py§ with two functions:

1. §def poly_grad(x):§ — given a 1-D float tensor §x§, compute $f(x) = \sum_i (3x_i^3 - 2x_i + 1)$ and return the gradient $\nabla_x f$ **computed with autograd** (§requires_grad§ + §.backward()§). Must return a tensor with the same shape as §x§ and must not modify the caller's tensor.
2. §def logistic_grads(w, b, X, y):§ — §X§ is §(N, D)§, §y§ is §(N,)§ in {0,1}, §w§ is §(D,)§, §b§ a scalar tensor. Compute the mean binary cross-entropy of §sigmoid(X @ w + b)§ using §torch.nn.functional.binary_cross_entropy_with_logits§ and return §(loss, dw, db)§ computed with autograd.

In the §if __name__ == "__main__":§ block, compare §poly_grad§ against the analytic derivative $9x^2 - 2$ and print the max absolute error.

§§§python
>>> import torch; from importlib import import_module
>>> m = import_module("0-autograd")
>>> m.poly_grad(torch.tensor([0.0, 1.0, 2.0]))
tensor([-2.,  7., 34.])
§§§`,
        files: ["0-autograd.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 80 },
          { type: "defines", path: "0-autograd.py", names: ["poly_grad", "logistic_grads"] },
          { type: "contains", path: "0-autograd.py", pattern: "import torch", label: "uses PyTorch" },
          { type: "contains", path: "0-autograd.py", pattern: "\\.backward\\(", label: "uses autograd (.backward())" },
          { type: "contains", path: "0-autograd.py", pattern: "binary_cross_entropy_with_logits", label: "uses the logits-based BCE" },
        ],
      },
      {
        title: "Dataset and DataLoaders",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §1-data.py§ with:

§def get_loaders(root="data", batch_size=128, val_size=5000, seed=0, num_workers=2):§

- Downloads Fashion-MNIST with §torchvision.datasets.FashionMNIST§.
- Transforms: §ToTensor()§ followed by §Normalize§ with the **training-set** mean and std (compute them once, hard-code the two numbers with a comment showing how you got them — ≈ 0.2860 / 0.3530).
- Splits the 60 000 training images into §60000 - val_size§ train / §val_size§ validation with §torch.utils.data.random_split§ and a §torch.Generator().manual_seed(seed)§ — the split must be identical across runs.
- Returns §(train_loader, val_loader, test_loader)§. Only the train loader shuffles.

Also define a §class FlattenedFashionMNIST(torch.utils.data.Dataset)§ that wraps any image dataset and returns §(x.view(-1), y)§ — i.e. you write §__len__§ and §__getitem__§ yourself at least once.`,
        files: ["1-data.py"],
        checks: [
          { type: "defines", path: "1-data.py", names: ["get_loaders", "FlattenedFashionMNIST"] },
          { type: "contains", path: "1-data.py", pattern: "FashionMNIST", label: "uses torchvision FashionMNIST" },
          { type: "contains", path: "1-data.py", pattern: "random_split", label: "uses random_split" },
          { type: "contains", path: "1-data.py", pattern: "manual_seed", label: "seeded split generator" },
          { type: "contains", path: "1-data.py", pattern: "def __getitem__", label: "implements __getitem__" },
        ],
      },
      {
        title: "The MLP as an nn.Module",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Re-implement your Phase 1 NumPy MLP in PyTorch. Write §2-mlp.py§ with:

§class MLP(nn.Module):§ with §__init__(self, in_dim=784, hidden=(256, 128), n_classes=10, p_drop=0.0)§

- Builds §len(hidden)§ hidden blocks §Linear → ReLU → Dropout(p_drop)§ followed by a final §Linear§ that outputs **raw logits** (no softmax).
- Uses Kaiming (He) initialisation for hidden Linear weights (§nn.init.kaiming_normal_§ or §kaiming_uniform_§ with §nonlinearity="relu"§) and zeros for biases.
- §forward(x)§ accepts §(N, 1, 28, 28)§ **or** §(N, 784)§ inputs (flatten inside).

Also write §def count_params(model):§ returning the number of trainable parameters (an §int§). For the default MLP this is 235 146.`,
        files: ["2-mlp.py"],
        checks: [
          { type: "defines", path: "2-mlp.py", names: ["MLP", "count_params"] },
          { type: "contains", path: "2-mlp.py", pattern: "nn\\.Module", label: "subclasses nn.Module" },
          { type: "contains", path: "2-mlp.py", pattern: "kaiming_(normal|uniform)_", label: "He initialisation" },
          { type: "not_contains", path: "2-mlp.py", pattern: "Softmax\\(|softmax\\(", label: "forward returns raw logits (no softmax)" },
        ],
      },
      {
        title: "Training loop and results.json",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §3-train.py§ with:

- §def train_one_epoch(model, loader, optimizer, loss_fn, device):§ → returns §(mean_loss, accuracy)§ over the epoch. Calls §model.train()§.
- §def evaluate(model, loader, loss_fn, device):§ → returns §(mean_loss, accuracy)§. Calls §model.eval()§ and runs under §torch.no_grad()§ (or §torch.inference_mode()§).
- A §main()§ that trains the default §MLP§ (import your files with §importlib.import_module§) with §nn.CrossEntropyLoss§ and §torch.optim.SGD§ (momentum 0.9) **or** §Adam§ for 15–30 epochs, keeps the checkpoint with the best **validation** accuracy (§torch.save(model.state_dict(), ...)§), reloads it, evaluates once on the test set, saves §curves.png§ (train/val loss and accuracy per epoch) and writes §results.json§:

§§§json
{"test_accuracy": 0.893, "best_val_accuracy": 0.901, "epochs": 20,
 "num_params": 235146, "optimizer": "adam", "lr": 0.001, "seed": 0}
§§§

**Target:** §test_accuracy >= 0.88§ (an MLP reaches ~0.89–0.90; this runs in minutes on CPU). The test set must be touched **once**, after model selection.`,
        files: ["3-train.py", "results.json", "curves.png"],
        checks: [
          { type: "defines", path: "3-train.py", names: ["train_one_epoch", "evaluate", "main"] },
          { type: "contains", path: "3-train.py", pattern: "zero_grad\\(", label: "zeroes gradients" },
          { type: "contains", path: "3-train.py", pattern: "\\.eval\\(\\)", label: "switches to eval mode" },
          { type: "contains", path: "3-train.py", pattern: "no_grad|inference_mode", label: "evaluation without autograd" },
          { type: "exists", path: "curves.png" },
          { type: "json_metric", path: "results.json", key: "test_accuracy", op: ">=", value: 0.88 },
        ],
      },
      {
        title: "NumPy parity check",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Prove your PyTorch model computes what you think it computes. Write §4-numpy_parity.py§ (**NumPy only** — must not import torch):

1. §def mlp_forward_np(X, params):§ — §X§ is §(N, D)§; §params§ is a list of §(W, b)§ tuples in **PyTorch Linear convention** (§W§ has shape §(out, in)§, §b§ has shape §(out,)§). Apply §h = h @ W.T + b§ for every layer with ReLU between layers and **no** activation after the last. Return the logits §(N, C)§.
2. §def cross_entropy_np(logits, y):§ — mean cross-entropy for integer labels §y§ of shape §(N,)§, computed with a **numerically stable** log-sum-exp (must return a finite value for logits of magnitude 1e4). Returns a Python float or 0-d array.

In your README, show that §mlp_forward_np§ fed with the trained §state_dict§ (converted with §.numpy()§) reproduces the PyTorch logits to §1e-5§.

§§§python
>>> m = import_module("4-numpy_parity")
>>> m.cross_entropy_np(np.array([[1000.0, 0.0]]), np.array([0]))
0.0
§§§`,
        files: ["4-numpy_parity.py"],
        checks: [
          { type: "defines", path: "4-numpy_parity.py", names: ["mlp_forward_np", "cross_entropy_np"] },
          { type: "not_contains", path: "4-numpy_parity.py", pattern: "import torch|from torch", label: "NumPy only" },
          {
            type: "py_test", files: ["4-numpy_parity.py"], label: "forward pass matches reference MLP (3 layers)",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('4-numpy_parity')
rng = np.random.default_rng(0)
X = rng.normal(size=(16, 20))
sizes = [20, 32, 24, 10]
params = [(rng.normal(size=(o, i)) * 0.3, rng.normal(size=o) * 0.1) for i, o in zip(sizes[:-1], sizes[1:])]
def ref(X, params):
    h = X
    for k, (W, b) in enumerate(params):
        h = h @ W.T + b
        if k < len(params) - 1:
            h = np.maximum(h, 0)
    return h
out = np.asarray(m.mlp_forward_np(X, params))
assert out.shape == (16, 10), out.shape
assert np.allclose(out, ref(X, params), atol=1e-8), "logits differ from reference"
one = [(params[0][0][:10], params[0][1][:10])]
assert np.allclose(m.mlp_forward_np(X, one), X @ one[0][0].T + one[0][1]), "single layer must have no activation"`,
          },
          {
            type: "py_test", files: ["4-numpy_parity.py"], label: "stable cross-entropy",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('4-numpy_parity')
rng = np.random.default_rng(0)
def ref(z, y):
    z = z - z.max(axis=1, keepdims=True)
    lse = np.log(np.exp(z).sum(axis=1))
    return np.mean(lse - z[np.arange(len(y)), y])
logits = rng.normal(size=(8, 10)); y = rng.integers(0, 10, size=8)
assert np.isclose(float(m.cross_entropy_np(logits, y)), ref(logits, y), atol=1e-10)
big = logits * 1e4
v = float(m.cross_entropy_np(big, y))
assert np.isfinite(v), "overflow: use log-sum-exp with max subtraction"
assert np.isclose(v, ref(big, y), rtol=1e-8)
assert np.isclose(float(m.cross_entropy_np(np.array([[1000.0, 0.0]]), np.array([0]))), 0.0, atol=1e-12)`,
          },
        ],
      },
      {
        title: "Report: NumPy MLP vs PyTorch MLP",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`Write §written/0-pytorch_report.md§ (PDF, Markdown or LaTeX accepted; ~1 page) comparing your Phase 1 NumPy MLP with the PyTorch version on Fashion-MNIST.

Include: the learning curves (§curves.png§), the final validation/test accuracy, wall-clock time per epoch for both implementations on the same hardware, and a short list of the lines of NumPy code that autograd replaced. End with three things that went wrong while building the PyTorch version and how you found them.`,
        deliverable: "repo",
        files: ["written/0-pytorch_report.md"],
        rubric: "report",
        criteria: [
          "Includes train and validation curves and reports test accuracy ≥ 0.88 matching results.json",
          "Reports time per epoch for both the NumPy and PyTorch implementations on stated hardware",
          "Identifies concretely which manual backprop code autograd replaced",
          "Names at least three real bugs/pitfalls encountered and how each was diagnosed",
          "States how the validation split was made and that the test set was used once",
        ],
      },
      {
        title: "Custom autograd Function",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`Write §100-custom_linear.py§ with §class LinearFunction(torch.autograd.Function)§ implementing §forward(ctx, x, W, b)§ → §x @ W.T + b§ and a hand-written §backward(ctx, grad_out)§ returning §(dx, dW, db)§. Wrap it in §class CustomLinear(nn.Module)§.

In §__main__§, verify the gradients with §torch.autograd.gradcheck§ on **double** tensors, then swap every §nn.Linear§ of your MLP for §CustomLinear§ and show (in the README) that training for one epoch gives the same loss as §nn.Linear§ to 1e-5 with the same seed.`,
        files: ["100-custom_linear.py"],
        checks: [
          { type: "defines", path: "100-custom_linear.py", names: ["LinearFunction", "CustomLinear"] },
          { type: "contains", path: "100-custom_linear.py", pattern: "torch\\.autograd\\.Function|autograd\\.Function", label: "subclasses autograd.Function" },
          { type: "contains", path: "100-custom_linear.py", pattern: "def backward", label: "hand-written backward" },
          { type: "contains", path: "100-custom_linear.py", pattern: "gradcheck", label: "verified with gradcheck" },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── A12
  {
    id: "A12",
    track: "applied",
    phase: PHASE,
    title: "Linear Classifiers: Softmax & SVM Loss on CIFAR-10",
    days: 3,
    repo: REPO,
    dir: "0x01-linear_classifiers",
    sources: [
      { course: "CS231N", lectures: "Lec 1–3", topics: "Image classification, kNN, linear classifiers, loss functions & optimization" },
    ],
    resources: [
      { title: "CS231n notes — Image Classification (kNN, data-driven approach)", url: "https://cs231n.github.io/classification/" },
      { title: "CS231n notes — Linear classification (SVM & Softmax)", url: "https://cs231n.github.io/linear-classify/" },
      { title: "CS231n notes — Optimization: Stochastic Gradient Descent", url: "https://cs231n.github.io/optimization-1/" },
      { title: "CIFAR-10 dataset (Krizhevsky)", url: "https://www.cs.toronto.edu/~kriz/cifar.html" },
    ],
    concepts: [
      "Data-driven image classification and the train/val/test protocol",
      "k-nearest neighbours and vectorized distance matrices",
      "Score function f(x; W) = Wx + b and the bias trick",
      "Multiclass SVM (hinge) loss",
      "Softmax / cross-entropy loss",
      "L2 regularization",
      "Analytic vs numerical gradients",
      "Minibatch SGD and hyperparameter search",
    ],
    objectives: [
      "Derive the gradient of the multiclass SVM loss with respect to W",
      "Derive the gradient of the softmax cross-entropy loss with respect to W",
      "Vectorize a loss and gradient with no loops over samples or classes",
      "Explain the expected initial loss of each classifier with small random weights (log C for softmax, C−1 for SVM)",
      "Run a principled hyperparameter search on a validation set",
      "Interpret learned linear weights as class templates",
    ],
    requirements: [
      "Python 3.10+, NumPy only for all loss / classifier files (no scikit-learn, no PyTorch)",
      "Matplotlib allowed for plots",
      "CIFAR-10 python version from the official page (do not commit the dataset — add it to .gitignore)",
    ],
    quiz: [
      {
        q: "With W initialized to tiny random values, what is the expected softmax loss on CIFAR-10 (10 classes)?",
        options: ["0", "1", "ln 10 ≈ 2.303", "9"],
        answer: 2,
        why: "All scores ≈ 0 so every class has probability 1/10 and the loss is −ln(1/10).",
      },
      {
        q: "With tiny random W and margin Δ = 1, what is the expected multiclass SVM data loss with 10 classes?",
        options: ["0", "1", "9", "10"],
        answer: 2,
        why: "Each of the C − 1 = 9 incorrect classes contributes max(0, 0 − 0 + 1) = 1.",
      },
      {
        q: "Why is a numerical gradient used only as a check, not for training?",
        options: ["It is biased", "It needs O(#parameters) loss evaluations per step and is approximate", "It does not work with regularization", "It only works for convex losses"],
        answer: 1,
        why: "Finite differences cost one or two full forward passes per parameter — far too slow — but are great for verifying analytic gradients.",
      },
      {
        q: "kNN with k = 1 gets 100% training accuracy. What does this tell you?",
        options: ["The model generalizes perfectly", "Nothing useful: each training point is its own nearest neighbour", "The distance metric is wrong", "The data is linearly separable"],
        answer: 1,
        why: "Training accuracy is trivially 100% for 1-NN; k and the metric must be chosen on validation data.",
      },
    ],
    tasks: [
      {
        title: "Preprocessing and the bias trick",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Create §0x01-linear_classifiers/README.md§ (≥ 100 words: setup, how to download CIFAR-10, final accuracies).

Write §0-preprocess.py§ with §def preprocess(X_train, X_val, X_test):§

- Inputs are image arrays of shape §(N, H, W, C)§ (any dtype, e.g. §uint8§; CIFAR-10 is §(N, 32, 32, 3)§).
- Flatten each set to §(N, H*W*C)§ as **float64**.
- Subtract the **mean image of the training set** from all three sets (never use val/test statistics).
- Append a column of ones as the **last** column (bias trick).
- Return §(X_train_p, X_val_p, X_test_p)§ with shapes §(N, D+1)§. Must not modify the inputs.

§§§python
>>> Xtr, Xva, Xte = import_module("0-preprocess").preprocess(Xtr_raw, Xva_raw, Xte_raw)
>>> Xtr.shape, Xtr[:, -1].min()
((49000, 3073), 1.0)
§§§`,
        files: ["0-preprocess.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 100 },
          { type: "defines", path: "0-preprocess.py", names: ["preprocess"] },
          { type: "not_contains", path: "0-preprocess.py", pattern: "sklearn|torch", label: "NumPy only" },
          {
            type: "py_test", files: ["0-preprocess.py"], label: "train-mean centering + bias column",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('0-preprocess')
rng = np.random.default_rng(0)
Xtr = rng.integers(0, 256, size=(20, 32, 32, 3)).astype(np.uint8)
Xva = rng.integers(0, 256, size=(5, 32, 32, 3)).astype(np.uint8)
Xte = rng.integers(0, 256, size=(7, 32, 32, 3)).astype(np.uint8)
copy = Xtr.copy()
a, b, c = m.preprocess(Xtr, Xva, Xte)
assert np.array_equal(Xtr, copy), "inputs must not be modified"
assert a.shape == (20, 3073) and b.shape == (5, 3073) and c.shape == (7, 3073)
assert a.dtype == np.float64
mu = Xtr.reshape(20, -1).astype(np.float64).mean(axis=0)
for got, X in ((a, Xtr), (b, Xva), (c, Xte)):
    exp = np.hstack([X.reshape(len(X), -1).astype(np.float64) - mu, np.ones((len(X), 1))])
    assert np.allclose(got, exp), "must subtract the TRAIN mean image and append ones as last column"`,
          },
        ],
      },
      {
        title: "Multiclass SVM loss — naive",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §1-svm_loss_naive.py§ with §def svm_loss_naive(W, X, y, reg):§ (loops allowed here).

- §W§: §(D, C)§ weights, §X§: §(N, D)§ data, §y§: §(N,)§ integer labels in §[0, C)§, §reg§: float.
- Scores $s = x_i W$. Loss with margin $\Delta = 1$:
$$L = \frac{1}{N}\sum_{i}\sum_{j \ne y_i} \max(0,\ s_j - s_{y_i} + 1) \;+\; \text{reg}\,\sum_{k,l} W_{kl}^2$$
- Return §(loss, dW)§ where §dW§ has the shape of §W§ and is the **exact** gradient of §L§ (note the regularization gradient is $2\,\text{reg}\,W$).

Verify your gradient against a centered finite-difference estimate before moving on.`,
        files: ["1-svm_loss_naive.py"],
        checks: [
          { type: "defines", path: "1-svm_loss_naive.py", names: ["svm_loss_naive"] },
          { type: "not_contains", path: "1-svm_loss_naive.py", pattern: "sklearn|torch", label: "NumPy only" },
          {
            type: "py_test", files: ["1-svm_loss_naive.py"], label: "loss and gradient match reference",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('1-svm_loss_naive')
rng = np.random.default_rng(0)
def ref(W, X, y, reg):
    N = X.shape[0]; s = X @ W
    mg = np.maximum(0, s - s[np.arange(N), y][:, None] + 1); mg[np.arange(N), y] = 0
    loss = mg.sum() / N + reg * np.sum(W * W)
    B = (mg > 0).astype(float); B[np.arange(N), y] = -B.sum(axis=1)
    return loss, X.T @ B / N + 2 * reg * W
for reg in (0.0, 0.5):
    W = rng.normal(size=(30, 10)) * 0.01; X = rng.normal(size=(50, 30)); y = rng.integers(0, 10, 50)
    loss, dW = m.svm_loss_naive(W, X, y, reg)
    rl, rdW = ref(W, X, y, reg)
    assert np.isclose(loss, rl, rtol=1e-7), (loss, rl)
    assert np.asarray(dW).shape == W.shape
    assert np.allclose(dW, rdW, atol=1e-8), "gradient mismatch"`,
          },
        ],
      },
      {
        title: "Multiclass SVM loss — vectorized",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §2-svm_loss_vectorized.py§ with §def svm_loss_vectorized(W, X, y, reg):§ — same contract and same result as task 1, but **no Python §for§/§while§ loops at all** (use fancy indexing, boolean masks and matrix products).

In your README, report the speed-up over the naive version on 500 CIFAR-10 examples (§time.perf_counter§).`,
        files: ["2-svm_loss_vectorized.py"],
        checks: [
          { type: "defines", path: "2-svm_loss_vectorized.py", names: ["svm_loss_vectorized"] },
          { type: "not_contains", path: "2-svm_loss_vectorized.py", ...NO_LOOP },
          {
            type: "py_test", files: ["2-svm_loss_vectorized.py"], label: "matches reference loss and gradient",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('2-svm_loss_vectorized')
rng = np.random.default_rng(1)
def ref(W, X, y, reg):
    N = X.shape[0]; s = X @ W
    mg = np.maximum(0, s - s[np.arange(N), y][:, None] + 1); mg[np.arange(N), y] = 0
    loss = mg.sum() / N + reg * np.sum(W * W)
    B = (mg > 0).astype(float); B[np.arange(N), y] = -B.sum(axis=1)
    return loss, X.T @ B / N + 2 * reg * W
for reg, N in ((0.0, 64), (2.5, 200)):
    W = rng.normal(size=(40, 7)) * 0.01; X = rng.normal(size=(N, 40)); y = rng.integers(0, 7, N)
    loss, dW = m.svm_loss_vectorized(W, X, y, reg)
    rl, rdW = ref(W, X, y, reg)
    assert np.isclose(loss, rl, rtol=1e-7), (loss, rl)
    assert np.allclose(dW, rdW, atol=1e-8), "gradient mismatch"
W = np.zeros((40, 7)) + 1e-9; X = rng.normal(size=(30, 40)); y = rng.integers(0, 7, 30)
assert np.isclose(m.svm_loss_vectorized(W, X, y, 0.0)[0], 6.0, atol=1e-5), "initial loss should be C-1"`,
          },
        ],
      },
      {
        title: "Softmax loss — vectorized",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §3-softmax_loss.py§ with §def softmax_loss_vectorized(W, X, y, reg):§ — same arguments as the SVM loss, no Python loops.

$$L = \frac{1}{N}\sum_i -\log \frac{e^{s_{y_i}}}{\sum_j e^{s_j}} \;+\; \text{reg}\sum W^2,\qquad s = XW$$

Return §(loss, dW)§. Must be numerically stable: it has to return finite values when scores are of order §1e4§ (subtract the row max before exponentiating).

Explain in your README why the loss with $W \approx 0$ is $\ln C$.`,
        files: ["3-softmax_loss.py"],
        checks: [
          { type: "defines", path: "3-softmax_loss.py", names: ["softmax_loss_vectorized"] },
          { type: "not_contains", path: "3-softmax_loss.py", ...NO_LOOP },
          {
            type: "py_test", files: ["3-softmax_loss.py"], label: "matches reference and is numerically stable",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('3-softmax_loss')
rng = np.random.default_rng(2)
def ref(W, X, y, reg):
    N = X.shape[0]; s = X @ W; s = s - s.max(axis=1, keepdims=True)
    lse = np.log(np.exp(s).sum(axis=1))
    loss = np.mean(lse - s[np.arange(N), y]) + reg * np.sum(W * W)
    p = np.exp(s - lse[:, None]); p[np.arange(N), y] -= 1
    return loss, X.T @ p / N + 2 * reg * W
for reg in (0.0, 1.0):
    W = rng.normal(size=(25, 10)) * 0.01; X = rng.normal(size=(80, 25)); y = rng.integers(0, 10, 80)
    loss, dW = m.softmax_loss_vectorized(W, X, y, reg)
    rl, rdW = ref(W, X, y, reg)
    assert np.isclose(loss, rl, rtol=1e-7), (loss, rl)
    assert np.allclose(dW, rdW, atol=1e-8), "gradient mismatch"
W = rng.normal(size=(25, 10)) * 100; X = rng.normal(size=(20, 25)) * 10; y = rng.integers(0, 10, 20)
loss, dW = m.softmax_loss_vectorized(W, X, y, 0.0)
assert np.isfinite(loss) and np.all(np.isfinite(dW)), "overflow: subtract the row max"
assert np.isclose(loss, ref(W, X, y, 0.0)[0], rtol=1e-6)`,
          },
        ],
      },
      {
        title: "LinearClassifier with minibatch SGD",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §4-linear_classifier.py§ with §class LinearClassifier:§

- §__init__(self, loss_fn)§ — §loss_fn(W, X, y, reg) -> (loss, dW)§ (e.g. your SVM or softmax loss). Sets §self.W = None§.
- §train(self, X, y, learning_rate=1e-3, reg=1e-5, num_iters=100, batch_size=200, seed=0)§
  - On the first call, initialise §self.W = 0.001 * rng.standard_normal((D, C))§ with §rng = np.random.default_rng(seed)§ and §C = y.max() + 1§.
  - Each iteration samples a minibatch of §batch_size§ indices (with replacement), computes §loss, dW§ and does a vanilla SGD step.
  - Returns the list of §num_iters§ minibatch losses.
- §predict(self, X)§ → integer array §(N,)§ of argmax scores.

NumPy only. A training run on CIFAR-10 should take seconds, not minutes.`,
        files: ["4-linear_classifier.py"],
        checks: [
          { type: "defines", path: "4-linear_classifier.py", names: ["LinearClassifier"] },
          { type: "not_contains", path: "4-linear_classifier.py", pattern: "sklearn|torch", label: "NumPy only" },
          {
            type: "py_test", files: ["4-linear_classifier.py"], label: "learns separable blobs with a provided softmax loss",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('4-linear_classifier')
rng = np.random.default_rng(0)
def softmax_loss(W, X, y, reg):
    N = X.shape[0]; s = X @ W; s = s - s.max(axis=1, keepdims=True)
    p = np.exp(s); p /= p.sum(axis=1, keepdims=True)
    loss = -np.log(p[np.arange(N), y]).mean() + reg * np.sum(W * W)
    p[np.arange(N), y] -= 1
    return loss, X.T @ p / N + 2 * reg * W
means = rng.normal(size=(3, 5)) * 4
y = rng.integers(0, 3, 600)
X = means[y] + rng.normal(size=(600, 5))
X = np.hstack([X, np.ones((600, 1))])
clf = m.LinearClassifier(softmax_loss)
hist = clf.train(X, y, learning_rate=0.1, reg=1e-4, num_iters=300, batch_size=64, seed=0)
assert len(hist) == 300, "train must return one loss per iteration"
assert clf.W.shape == (6, 3)
assert np.mean(hist[-20:]) < 0.5 * hist[0], "loss should drop substantially"
pred = np.asarray(clf.predict(X))
assert pred.shape == (600,)
assert (pred == y).mean() > 0.9, (pred == y).mean()`,
          },
        ],
      },
      {
        title: "Hyperparameter search on CIFAR-10",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §5-tune.py§ that loads CIFAR-10 (49 000 train / 1 000 val / 10 000 test), preprocesses with task 0, and runs a grid or random search over learning rate and regularization strength for **both** losses (≥ 12 configurations each, ≥ 1 500 iterations per run), selects each best model on **validation** accuracy, then evaluates each once on test.

Save §weights.png§ (the 10 learned softmax weight templates reshaped to 32×32×3, rescaled to [0, 255]) and write §results.json§:

§§§json
{"svm_val_accuracy": 0.39, "svm_test_accuracy": 0.38,
 "softmax_val_accuracy": 0.40, "softmax_test_accuracy": 0.39,
 "svm_best": {"lr": 1e-7, "reg": 2.5e4}, "softmax_best": {"lr": 1e-7, "reg": 2.5e4},
 "num_configs": 24}
§§§

**Targets:** §svm_test_accuracy >= 0.36§ and §softmax_test_accuracy >= 0.37§.`,
        files: ["5-tune.py", "results.json", "weights.png"],
        checks: [
          { type: "exists", path: "5-tune.py" },
          { type: "exists", path: "weights.png" },
          { type: "json_metric", path: "results.json", key: "svm_test_accuracy", op: ">=", value: 0.36 },
          { type: "json_metric", path: "results.json", key: "softmax_test_accuracy", op: ">=", value: 0.37 },
          { type: "json_metric", path: "results.json", key: "num_configs", op: ">=", value: 24 },
        ],
      },
      {
        title: "Write-up: SVM vs Softmax",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`Write §written/0-svm_vs_softmax.md§ (PDF, Markdown or LaTeX accepted; 1–2 pages):

1. Derive the gradient of the SVM loss and of the softmax loss with respect to a column $w_j$ of $W$ (both cases $j = y_i$ and $j \ne y_i$).
2. Explain why the SVM loss is "satisfied" once margins exceed $\Delta$ while softmax always wants more, and what that means for the learned scores.
3. Show and interpret §weights.png§: what does each template look like and why?
4. Explain the role of the validation set in your search and why the chosen $\text{reg}$ is so large.`,
        deliverable: "repo",
        files: ["written/0-svm_vs_softmax.md"],
        rubric: "derivation",
        criteria: [
          "Correct SVM gradient: −(number of violating classes)·x_i for the correct class column, +x_i for each violating class",
          "Correct softmax gradient (p_j − 1[j = y_i])·x_i, including the 2·reg·W term",
          "Explains the margin-saturation difference between hinge and cross-entropy",
          "Includes weights.png and interprets at least three class templates",
          "Justifies hyperparameter selection using validation, not test, accuracy",
        ],
      },
      {
        title: "kNN baseline, fully vectorized",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`Write §100-knn.py§ (NumPy only):

1. §def compute_distances_no_loops(X_test, X_train):§ → §(num_test, num_train)§ Euclidean distances with **no loops**, using $\|a-b\|^2 = \|a\|^2 + \|b\|^2 - 2a^\top b$. Clip negative squared distances (round-off) to 0 before §np.sqrt§.
2. §def predict_labels(dists, y_train, k=1):§ → §(num_test,)§ integer predictions by majority vote among the §k§ nearest; break ties in favour of the **smallest** label.

Add 5-fold cross-validation over §k ∈ {1, 3, 5, 8, 10, 12, 15, 20, 50, 100}§ on 5 000 training images to your README with a plot.`,
        files: ["100-knn.py"],
        checks: [
          { type: "defines", path: "100-knn.py", names: ["compute_distances_no_loops", "predict_labels"] },
          {
            type: "py_test", files: ["100-knn.py"], label: "distances and votes match reference",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('100-knn')
rng = np.random.default_rng(0)
Xtr = rng.normal(size=(60, 12)); Xte = rng.normal(size=(15, 12))
d = np.asarray(m.compute_distances_no_loops(Xte, Xtr))
ref = np.sqrt(((Xte[:, None, :] - Xtr[None, :, :]) ** 2).sum(-1))
assert d.shape == (15, 60)
assert np.allclose(d, ref, atol=1e-6)
same = np.asarray(m.compute_distances_no_loops(Xtr[:5], Xtr[:5]))
assert np.all(np.isfinite(same)) and np.allclose(np.diag(same), 0, atol=1e-6)
ytr = rng.integers(0, 4, 60)
for k in (1, 3, 5, 10):
    pred = np.asarray(m.predict_labels(ref, ytr, k=k))
    exp = []
    for row in ref:
        votes = np.bincount(ytr[np.argsort(row, kind='stable')[:k]], minlength=4)
        exp.append(np.argmax(votes))
    assert np.array_equal(pred, np.array(exp)), f"k={k}"
d2 = np.array([[0.1, 0.2, 5.0, 6.0]]); y2 = np.array([3, 1, 0, 0])
assert int(np.asarray(m.predict_labels(d2, y2, k=2))[0]) == 1, "ties go to the smallest label"`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── A13
  {
    id: "A13",
    track: "applied",
    phase: PHASE,
    title: "Backprop & CNN Layers from Scratch",
    days: 4,
    repo: REPO,
    dir: "0x02-cnn_from_scratch",
    sources: [
      { course: "CS231N", lectures: "Lec 4–5", topics: "Backpropagation & neural networks, convolutional networks" },
    ],
    resources: [
      { title: "CS231n notes — Backpropagation, Intuitions", url: "https://cs231n.github.io/optimization-2/" },
      { title: "CS231n notes — Convolutional Neural Networks", url: "https://cs231n.github.io/convolutional-networks/" },
      { title: "CS231n — Derivatives, Backpropagation, and Vectorization (handout)", url: "https://cs231n.stanford.edu/handouts/derivatives.pdf" },
      { title: "Dive into Deep Learning — Ch. 7: Convolutional Neural Networks", url: "https://d2l.ai/chapter_convolutional-neural-networks/index.html" },
      { title: "Dumoulin & Visin, A guide to convolution arithmetic for deep learning", url: "https://arxiv.org/abs/1603.07285" },
    ],
    concepts: [
      "Computational graphs and the chain rule (upstream × local gradient)",
      "Modular layer API: forward returns (out, cache), backward consumes cache",
      "Affine and ReLU layers",
      "Convolution: stride, zero padding, output size, parameter sharing",
      "Max pooling and gradient routing",
      "Centered finite differences and relative error",
      "im2col: convolution as matrix multiplication",
    ],
    objectives: [
      "Backpropagate through any staged computation by hand",
      "Compute a convolution's output size for given H, W, kernel, stride, padding",
      "Derive dx, dw, db for a convolutional layer and show dx is a 'full' convolution with flipped filters",
      "Explain why max-pool backward routes the gradient only to the argmax",
      "Gradient-check a layer and interpret relative errors (1e-7 good, 1e-2 broken)",
      "Assemble layers into a small CNN with a correct loss and gradients",
    ],
    requirements: [
      "Python 3.10+, NumPy only (no PyTorch, no SciPy convolution routines, no scikit-learn)",
      "Every layer follows the API: `*_forward(...) -> (out, cache)` and `*_backward(dout, cache) -> grads`",
      "Work in float64 so gradient checks are meaningful",
    ],
    quiz: [
      {
        q: "Input 32×32, kernel 5×5, stride 1, padding 2. Output spatial size?",
        options: ["28×28", "30×30", "32×32", "36×36"],
        answer: 2,
        why: "(32 + 2·2 − 5)/1 + 1 = 32.",
      },
      {
        q: "A conv layer has 64 filters of size 3×3 over a 32-channel input. How many parameters (with biases)?",
        options: ["576", "18 432", "18 496", "65 536"],
        answer: 2,
        why: "64·32·3·3 = 18 432 weights + 64 biases = 18 496.",
      },
      {
        q: "During backprop through a max gate max(x, y) with x > y, the upstream gradient goes to…",
        options: ["both inputs equally", "only x", "only y", "neither"],
        answer: 1,
        why: "The max gate is a gradient router: the local gradient is 1 for the winning input and 0 for the other.",
      },
      {
        q: "Gradient check gives relative error 3e-2 for your conv dw. Most likely…",
        options: ["The implementation is correct", "Float32 round-off", "There is a bug in the backward pass", "h is too small"],
        answer: 2,
        why: "In float64 with smooth functions, correct gradients give ~1e-7 or less; 1e-2 indicates a bug.",
      },
    ],
    tasks: [
      {
        title: "Affine layer",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Create §0x02-cnn_from_scratch/README.md§ (≥ 100 words, including a table of your gradient-check relative errors per layer).

Write §0-affine.py§:

- §def affine_forward(x, w, b):§ — §x§ has shape §(N, d_1, ..., d_k)§ and is reshaped to §(N, D)§ with §D = d_1···d_k§; §w§ is §(D, M)§, §b§ is §(M,)§. Return §(out, cache)§ with §out§ of shape §(N, M)§.
- §def affine_backward(dout, cache):§ — return §(dx, dw, db)§ with §dx§ in the **original** shape of §x§.`,
        files: ["0-affine.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 100 },
          { type: "defines", path: "0-affine.py", names: ["affine_forward", "affine_backward"] },
          {
            type: "py_test", files: ["0-affine.py"], label: "forward + numerical gradient check",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('0-affine')
rng = np.random.default_rng(0)
def num_grad(f, x, df, h=1e-6):
    g = np.zeros_like(x)
    for idx in np.ndindex(x.shape):
        old = x[idx]; x[idx] = old + h; p = f(x).copy(); x[idx] = old - h; q = f(x).copy(); x[idx] = old
        g[idx] = np.sum((p - q) * df) / (2 * h)
    return g
def rel(a, b): return np.max(np.abs(a - b) / np.maximum(1e-8, np.abs(a) + np.abs(b)))
x = rng.normal(size=(4, 2, 3)); w = rng.normal(size=(6, 5)); b = rng.normal(size=5)
out, cache = m.affine_forward(x, w, b)
assert out.shape == (4, 5)
assert np.allclose(out, x.reshape(4, -1) @ w + b)
dout = rng.normal(size=(4, 5))
dx, dw, db = m.affine_backward(dout, cache)
assert dx.shape == x.shape, "dx must have the original shape of x"
assert rel(dx, num_grad(lambda v: m.affine_forward(v, w, b)[0], x, dout)) < 1e-7
assert rel(dw, num_grad(lambda v: m.affine_forward(x, v, b)[0], w, dout)) < 1e-7
assert rel(db, num_grad(lambda v: m.affine_forward(x, w, v)[0], b, dout)) < 1e-7`,
          },
        ],
      },
      {
        title: "ReLU layer",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §1-relu.py§ with §def relu_forward(x):§ → §(out, cache)§ and §def relu_backward(dout, cache):§ → §dx§. Works for any input shape. Convention: the gradient at exactly §x == 0§ is 0.`,
        files: ["1-relu.py"],
        checks: [
          { type: "defines", path: "1-relu.py", names: ["relu_forward", "relu_backward"] },
          {
            type: "py_test", files: ["1-relu.py"], label: "forward/backward on 4-D input",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('1-relu')
rng = np.random.default_rng(0)
x = rng.normal(size=(3, 2, 4, 5)); x[0, 0, 0, 0] = 0.0
out, cache = m.relu_forward(x)
assert out.shape == x.shape and np.allclose(out, np.maximum(x, 0))
dout = rng.normal(size=x.shape)
dx = m.relu_backward(dout, cache)
assert dx.shape == x.shape
assert np.allclose(dx, dout * (x > 0)), "gradient must be dout where x > 0 and 0 elsewhere"`,
          },
        ],
      },
      {
        title: "Numerical gradient utilities",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §2-gradient_check.py§:

- §def eval_numerical_gradient_array(f, x, df, h=1e-5):§ — §f§ maps an array to an array; §df§ is the upstream gradient (same shape as §f(x)§). Return the centered-difference estimate of $\partial\, \text{sum}(f(x)\odot df) / \partial x$ with the shape of §x§. You perturb §x§ **in place**, so restore every entry; §x§ must be unchanged on return.
- §def rel_error(a, b):§ — return §max(|a − b| / max(1e-8, |a| + |b|))§ (elementwise, then max) as a float.`,
        files: ["2-gradient_check.py"],
        checks: [
          { type: "defines", path: "2-gradient_check.py", names: ["eval_numerical_gradient_array", "rel_error"] },
          {
            type: "py_test", files: ["2-gradient_check.py"], label: "centered differences + restores x",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('2-gradient_check')
rng = np.random.default_rng(0)
x = rng.normal(size=(3, 4)); x0 = x.copy()
df = rng.normal(size=(3, 4))
g = m.eval_numerical_gradient_array(lambda v: np.sin(v) * v, x, df)
assert np.array_equal(x, x0), "x must be restored"
assert g.shape == x.shape
assert np.allclose(g, (np.cos(x) * x + np.sin(x)) * df, atol=1e-7)
A = rng.normal(size=(2, 3))
g2 = m.eval_numerical_gradient_array(lambda v: A @ v, x, rng.normal(size=(2, 4)))
assert g2.shape == (3, 4)
assert np.isclose(m.rel_error(np.array([1.0, 2.0]), np.array([1.0, 2.0])), 0.0)
assert np.isclose(m.rel_error(np.array([1.0, 0.0]), np.array([3.0, 0.0])), 0.5)`,
          },
        ],
      },
      {
        title: "Convolution layer (naive)",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Write §3-conv_naive.py§:

§def conv_forward_naive(x, w, b, conv_param):§

- §x§: §(N, C, H, W)§, §w§: §(F, C, HH, WW)§, §b§: §(F,)§, §conv_param§: dict with §"stride"§ and §"pad"§ (zero padding on both sides of H and W).
- Output §(N, F, H', W')§ with $H' = 1 + (H + 2p - HH)/s$, $W' = 1 + (W + 2p - WW)/s$ (assert the divisions are exact). This is cross-correlation (no kernel flip), as in every DL framework.
- Return §(out, cache)§. Loops are allowed; §np.pad§ is allowed; no §scipy§.

§def conv_backward_naive(dout, cache):§ → §(dx, dw, db)§.

§§§python
>>> x = np.ones((1, 1, 4, 4)); w = np.ones((1, 1, 3, 3)); b = np.zeros(1)
>>> conv_forward_naive(x, w, b, {"stride": 1, "pad": 1})[0][0, 0]
array([[4., 6., 6., 4.],
       [6., 9., 9., 6.],
       [6., 9., 9., 6.],
       [4., 6., 6., 4.]])
§§§`,
        files: ["3-conv_naive.py"],
        checks: [
          { type: "defines", path: "3-conv_naive.py", names: ["conv_forward_naive", "conv_backward_naive"] },
          { type: "not_contains", path: "3-conv_naive.py", pattern: "scipy|torch", label: "NumPy only" },
          {
            type: "py_test", files: ["3-conv_naive.py"], label: "forward matches reference (stride 1 and 2)",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('3-conv_naive')
rng = np.random.default_rng(0)
def ref(x, w, b, s, p):
    N, C, H, W = x.shape; F, _, HH, WW = w.shape
    xp = np.pad(x, ((0, 0), (0, 0), (p, p), (p, p)))
    Ho = 1 + (H + 2 * p - HH) // s; Wo = 1 + (W + 2 * p - WW) // s
    out = np.zeros((N, F, Ho, Wo))
    for i in range(Ho):
        for j in range(Wo):
            patch = xp[:, :, i * s:i * s + HH, j * s:j * s + WW]
            out[:, :, i, j] = np.tensordot(patch, w, axes=([1, 2, 3], [1, 2, 3])) + b
    return out
for (shape, wshape, s, p) in (((2, 3, 5, 5), (4, 3, 3, 3), 1, 1), ((2, 3, 7, 7), (2, 3, 3, 3), 2, 1), ((1, 2, 6, 6), (3, 2, 2, 2), 2, 0)):
    x = rng.normal(size=shape); w = rng.normal(size=wshape); b = rng.normal(size=wshape[0])
    out, _ = m.conv_forward_naive(x, w, b, {'stride': s, 'pad': p})
    r = ref(x, w, b, s, p)
    assert out.shape == r.shape, (out.shape, r.shape)
    assert np.allclose(out, r, atol=1e-10)
o = m.conv_forward_naive(np.ones((1, 1, 4, 4)), np.ones((1, 1, 3, 3)), np.zeros(1), {'stride': 1, 'pad': 1})[0][0, 0]
assert np.allclose(o[0], [4, 6, 6, 4]) and np.allclose(o[1], [6, 9, 9, 6])`,
          },
          {
            type: "py_test", files: ["3-conv_naive.py"], label: "backward passes numerical gradient check",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('3-conv_naive')
rng = np.random.default_rng(1)
def num_grad(f, x, df, h=1e-6):
    g = np.zeros_like(x)
    for idx in np.ndindex(x.shape):
        old = x[idx]; x[idx] = old + h; p = f(x).copy(); x[idx] = old - h; q = f(x).copy(); x[idx] = old
        g[idx] = np.sum((p - q) * df) / (2 * h)
    return g
def rel(a, b): return np.max(np.abs(a - b) / np.maximum(1e-8, np.abs(a) + np.abs(b)))
for s, p in ((1, 1), (2, 1)):
    x = rng.normal(size=(2, 3, 5, 5)); w = rng.normal(size=(2, 3, 3, 3)); b = rng.normal(size=2)
    cp = {'stride': s, 'pad': p}
    out, cache = m.conv_forward_naive(x, w, b, cp)
    dout = rng.normal(size=out.shape)
    dx, dw, db = m.conv_backward_naive(dout, cache)
    assert dx.shape == x.shape and dw.shape == w.shape and db.shape == b.shape
    assert rel(dx, num_grad(lambda v: m.conv_forward_naive(v, w, b, cp)[0], x, dout)) < 1e-6, "dx wrong"
    assert rel(dw, num_grad(lambda v: m.conv_forward_naive(x, v, b, cp)[0], w, dout)) < 1e-6, "dw wrong"
    assert rel(db, num_grad(lambda v: m.conv_forward_naive(x, w, v, cp)[0], b, dout)) < 1e-6, "db wrong"`,
          },
        ],
      },
      {
        title: "Max-pooling layer (naive)",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §4-max_pool.py§:

- §def max_pool_forward_naive(x, pool_param):§ — §x§ is §(N, C, H, W)§; §pool_param§ has §"pool_height"§, §"pool_width"§, §"stride"§; no padding. Output §(N, C, H', W')§ with $H' = 1 + (H - ph)/s$. Return §(out, cache)§.
- §def max_pool_backward_naive(dout, cache):§ → §dx§ (route each upstream gradient to the argmax of its window; overlapping windows accumulate).`,
        files: ["4-max_pool.py"],
        checks: [
          { type: "defines", path: "4-max_pool.py", names: ["max_pool_forward_naive", "max_pool_backward_naive"] },
          {
            type: "py_test", files: ["4-max_pool.py"], label: "forward matches reference, backward passes gradient check",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('4-max_pool')
rng = np.random.default_rng(0)
def num_grad(f, x, df, h=1e-6):
    g = np.zeros_like(x)
    for idx in np.ndindex(x.shape):
        old = x[idx]; x[idx] = old + h; p = f(x).copy(); x[idx] = old - h; q = f(x).copy(); x[idx] = old
        g[idx] = np.sum((p - q) * df) / (2 * h)
    return g
def rel(a, b): return np.max(np.abs(a - b) / np.maximum(1e-8, np.abs(a) + np.abs(b)))
x = rng.normal(size=(2, 3, 4, 4))
pp = {'pool_height': 2, 'pool_width': 2, 'stride': 2}
out, cache = m.max_pool_forward_naive(x, pp)
assert out.shape == (2, 3, 2, 2)
assert np.allclose(out, x.reshape(2, 3, 2, 2, 2, 2).max(axis=(3, 5)))
dout = rng.normal(size=out.shape)
dx = m.max_pool_backward_naive(dout, cache)
assert dx.shape == x.shape
assert rel(dx, num_grad(lambda v: m.max_pool_forward_naive(v, pp)[0], x, dout)) < 1e-7
x = rng.normal(size=(1, 2, 5, 5)); pp = {'pool_height': 3, 'pool_width': 3, 'stride': 1}
out, cache = m.max_pool_forward_naive(x, pp)
assert out.shape == (1, 2, 3, 3)
dout = rng.normal(size=out.shape)
assert rel(m.max_pool_backward_naive(dout, cache), num_grad(lambda v: m.max_pool_forward_naive(v, pp)[0], x, dout)) < 1e-7, "overlapping windows must accumulate"`,
          },
        ],
      },
      {
        title: "Softmax loss layer",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §5-softmax_loss.py§ with §def softmax_loss(x, y):§ — §x§ is §(N, C)§ class scores, §y§ is §(N,)§ labels. Return §(loss, dx)§: the mean cross-entropy and its gradient with respect to §x§. Numerically stable.`,
        files: ["5-softmax_loss.py"],
        checks: [
          { type: "defines", path: "5-softmax_loss.py", names: ["softmax_loss"] },
          {
            type: "py_test", files: ["5-softmax_loss.py"], label: "loss + gradient check",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('5-softmax_loss')
rng = np.random.default_rng(0)
x = rng.normal(size=(10, 6)); y = rng.integers(0, 6, 10)
z = x - x.max(1, keepdims=True); lp = z - np.log(np.exp(z).sum(1, keepdims=True))
loss, dx = m.softmax_loss(x, y)
assert np.isclose(loss, -lp[np.arange(10), y].mean())
g = np.zeros_like(x); h = 1e-6
for idx in np.ndindex(x.shape):
    o = x[idx]; x[idx] = o + h; a = m.softmax_loss(x, y)[0]; x[idx] = o - h; b = m.softmax_loss(x, y)[0]; x[idx] = o
    g[idx] = (a - b) / (2 * h)
assert np.allclose(dx, g, atol=1e-7)
assert np.isfinite(m.softmax_loss(x * 1e4, y)[0])`,
          },
        ],
      },
      {
        title: "Three-layer ConvNet",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Write §6-three_layer_convnet.py§ with §class ThreeLayerConvNet:§ implementing

**conv → ReLU → 2×2 max-pool (stride 2) → affine → ReLU → affine → softmax**

§__init__(self, input_dim=(3, 32, 32), num_filters=32, filter_size=7, hidden_dim=100, num_classes=10, weight_scale=1e-3, reg=0.0, seed=0)§

- §self.params§ is a dict with keys §W1, b1, W2, b2, W3, b3§. Weights ~ §weight_scale * rng.standard_normal(...)§ with §rng = np.random.default_rng(seed)§, biases zero, all float64.
- Conv uses stride 1 and pad §(filter_size - 1) // 2§ (spatial size preserved). Shapes: §W1 (F, C, fs, fs)§, §W2 (F·H/2·W/2, hidden_dim)§, §W3 (hidden_dim, num_classes)§.

§loss(self, X, y=None)§: if §y is None§ return the scores §(N, num_classes)§; otherwise return §(loss, grads)§ where §grads§ has the same keys as §params§ and the loss includes §0.5 * reg * (ΣW1² + ΣW2² + ΣW3²)§ (no bias regularization).

Import your layers with §importlib.import_module("0-affine")§ etc. Finally, in §6-overfit.py§, show the net can overfit 100 CIFAR-10 images (train accuracy ≥ 0.9) and paste the curve into the README.`,
        files: ["6-three_layer_convnet.py", "6-overfit.py"],
        checks: [
          { type: "defines", path: "6-three_layer_convnet.py", names: ["ThreeLayerConvNet"] },
          { type: "exists", path: "6-overfit.py" },
          {
            type: "py_test", files: ["0-affine.py", "1-relu.py", "3-conv_naive.py", "4-max_pool.py", "5-softmax_loss.py", "6-three_layer_convnet.py"],
            label: "shapes, regularization and full numerical gradient check",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('6-three_layer_convnet')
rng = np.random.default_rng(0)
X = rng.normal(size=(2, 3, 6, 6)); y = np.array([1, 4])
kw = dict(input_dim=(3, 6, 6), num_filters=2, filter_size=3, hidden_dim=6, num_classes=5, weight_scale=1e-1, seed=0)
net = m.ThreeLayerConvNet(reg=0.3, **kw)
P = net.params
assert P['W1'].shape == (2, 3, 3, 3) and P['W2'].shape == (2 * 3 * 3, 6) and P['W3'].shape == (6, 5)
assert P['b1'].shape == (2,) and P['b2'].shape == (6,) and P['b3'].shape == (5,)
assert net.loss(X).shape == (2, 5)
net0 = m.ThreeLayerConvNet(reg=0.0, **kw)
l0, _ = net0.loss(X, y); l1, grads = net.loss(X, y)
sq = sum(np.sum(P[k] ** 2) for k in ('W1', 'W2', 'W3'))
assert np.isclose(l1 - l0, 0.5 * 0.3 * sq), "loss must include 0.5*reg*sum(W^2) for W1..W3"
h = 1e-6
for k in sorted(P):
    g = np.zeros_like(P[k])
    for idx in np.ndindex(P[k].shape):
        o = P[k][idx]; P[k][idx] = o + h; a = net.loss(X, y)[0]; P[k][idx] = o - h; b = net.loss(X, y)[0]; P[k][idx] = o
        g[idx] = (a - b) / (2 * h)
    err = np.max(np.abs(g - grads[k]) / np.maximum(1e-8, np.abs(g) + np.abs(grads[k])))
    assert err < 1e-4, f"{k}: relative error {err:.2e}"`,
          },
        ],
      },
      {
        title: "Derivation: backprop through convolution",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`Write §written/0-conv_backprop.pdf§ (PDF, Markdown or LaTeX accepted). For a single-channel input $x \in \mathbb{R}^{H\times W}$, one filter $w \in \mathbb{R}^{k\times k}$, stride 1, no padding, $y = x \star w + b$ (cross-correlation):

1. Derive $\partial L/\partial w_{ab}$, $\partial L/\partial b$ and $\partial L/\partial x_{ij}$ in index form from upstream $\partial L/\partial y$.
2. Show $\partial L/\partial w = x \star \frac{\partial L}{\partial y}$ and $\partial L/\partial x$ is a **full** convolution of the zero-padded upstream gradient with the 180°-rotated filter.
3. Explain what changes with stride $s > 1$ (dilating the upstream gradient).
4. Derive the max-pool backward rule and explain the tie-breaking issue.`,
        deliverable: "repo",
        files: ["written/0-conv_backprop.pdf"],
        rubric: "derivation",
        criteria: [
          "Index-form gradient for w: sum over output positions of upstream gradient times the corresponding input entry",
          "db equals the sum of all upstream gradient entries",
          "Shows dx is a full convolution with the flipped kernel, with correct padding k−1",
          "Correctly describes the stride > 1 case (zeros inserted between upstream gradient entries)",
          "Max-pool backward routes gradient only to the argmax, ties discussed",
        ],
      },
      {
        title: "Fast convolution with im2col",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`Write §100-conv_im2col.py§ with §conv_forward_im2col(x, w, b, conv_param)§ → §(out, cache)§ and §conv_backward_im2col(dout, cache)§ → §(dx, dw, db)§. Same contract as task 3, but the core computation is **one matrix multiplication** over an im2col matrix (loops only over kernel offsets §HH × WW§ are allowed, never over §N§, §F§ or output positions). Use §np.add.at§ (or equivalent) for col2im.

Report the speed-up over the naive version for §x (50, 3, 32, 32)§, §w (32, 3, 5, 5)§ in your README.`,
        files: ["100-conv_im2col.py"],
        checks: [
          { type: "defines", path: "100-conv_im2col.py", names: ["conv_forward_im2col", "conv_backward_im2col"] },
          {
            type: "py_test", files: ["100-conv_im2col.py"], label: "matches loop reference forward and backward",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('100-conv_im2col')
rng = np.random.default_rng(0)
def ref(x, w, b, s, p):
    N, C, H, W = x.shape; F, _, HH, WW = w.shape
    xp = np.pad(x, ((0, 0), (0, 0), (p, p), (p, p)))
    Ho = 1 + (H + 2 * p - HH) // s; Wo = 1 + (W + 2 * p - WW) // s
    out = np.zeros((N, F, Ho, Wo))
    for i in range(Ho):
        for j in range(Wo):
            out[:, :, i, j] = np.tensordot(xp[:, :, i*s:i*s+HH, j*s:j*s+WW], w, axes=([1, 2, 3], [1, 2, 3])) + b
    return out
def ref_bwd(dout, x, w, s, p):
    N, C, H, W = x.shape; F, _, HH, WW = w.shape
    xp = np.pad(x, ((0, 0), (0, 0), (p, p), (p, p))); dxp = np.zeros_like(xp); dw = np.zeros_like(w)
    for i in range(dout.shape[2]):
        for j in range(dout.shape[3]):
            patch = xp[:, :, i*s:i*s+HH, j*s:j*s+WW]
            dw += np.tensordot(dout[:, :, i, j], patch, axes=([0], [0]))
            dxp[:, :, i*s:i*s+HH, j*s:j*s+WW] += np.tensordot(dout[:, :, i, j], w, axes=([1], [0]))
    return dxp[:, :, p:p+H, p:p+W], dw, dout.sum(axis=(0, 2, 3))
for shape, wsh, s, p in (((3, 3, 8, 8), (4, 3, 3, 3), 1, 1), ((2, 2, 9, 9), (3, 2, 3, 3), 2, 1), ((2, 3, 8, 8), (5, 3, 5, 5), 1, 2)):
    x = rng.normal(size=shape); w = rng.normal(size=wsh); b = rng.normal(size=wsh[0])
    out, cache = m.conv_forward_im2col(x, w, b, {'stride': s, 'pad': p})
    assert np.allclose(out, ref(x, w, b, s, p), atol=1e-9)
    dout = rng.normal(size=out.shape)
    dx, dw, db = m.conv_backward_im2col(dout, cache)
    rdx, rdw, rdb = ref_bwd(dout, x, w, s, p)
    assert np.allclose(dx, rdx, atol=1e-9) and np.allclose(dw, rdw, atol=1e-9) and np.allclose(db, rdb, atol=1e-9)`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── A14
  {
    id: "A14",
    track: "applied",
    phase: PHASE,
    title: "Training Neural Networks: Init, Normalization, Optimizers",
    days: 3,
    repo: REPO,
    dir: "0x03-training_nns",
    sources: [
      { course: "CS231N", lectures: "Lec 6–7", topics: "Training neural networks I & II: activations, initialization, batch norm, optimizers, regularization, LR schedules" },
      { course: "CS230", lectures: "Lec 3", topics: "Hyperparameter tuning and practical training advice" },
    ],
    resources: [
      { title: "CS231n notes — Setting up the data and the model (init, BN, regularization)", url: "https://cs231n.github.io/neural-networks-2/" },
      { title: "CS231n notes — Learning and evaluation (babysitting, optimizers, schedules)", url: "https://cs231n.github.io/neural-networks-3/" },
      { title: "Ioffe & Szegedy, Batch Normalization (2015)", url: "https://arxiv.org/abs/1502.03167" },
      { title: "Kingma & Ba, Adam (2014)", url: "https://arxiv.org/abs/1412.6980" },
      { title: "He et al., Delving Deep into Rectifiers (He init, 2015)", url: "https://arxiv.org/abs/1502.01852" },
      { title: "Google Research — Deep Learning Tuning Playbook", url: "https://github.com/google-research/tuning_playbook" },
    ],
    concepts: [
      "Activation statistics and vanishing/exploding signals",
      "Xavier/Glorot and He initialization",
      "Batch normalization (train vs test behaviour, running statistics)",
      "Layer normalization",
      "Inverted dropout",
      "SGD with momentum, RMSProp, Adam (with bias correction)",
      "Learning-rate schedules: step decay, cosine annealing, linear warm-up",
      "Hyperparameter search strategy (random > grid, log scale)",
    ],
    objectives: [
      "Explain why naive small-random initialization kills deep networks and how He init fixes it for ReLU",
      "Derive the batch-norm backward pass in a compact form",
      "Explain the difference between batch-norm behaviour at training and test time",
      "Write the update rules of momentum, RMSProp and Adam from memory and explain bias correction",
      "Choose and implement a learning-rate schedule with warm-up",
      "Maintain a personal checklist for diagnosing a training run",
    ],
    requirements: [
      "Python 3.10+, NumPy only for files 0- to 4- and 100- (no PyTorch, no scikit-learn)",
      "PyTorch allowed for the experiment notebook (task 5)",
    ],
    quiz: [
      {
        q: "For a ReLU layer with fan-in n, He initialization draws weights with variance…",
        options: ["1/n", "2/n", "1/(n_in + n_out)", "0.01²"],
        answer: 1,
        why: "ReLU zeroes half the inputs, halving the variance; 2/n compensates so activations keep constant variance.",
      },
      {
        q: "At test time, batch normalization normalizes using…",
        options: ["the statistics of the current test batch", "running averages of mean and variance accumulated during training", "mean 0 and variance 1 always", "the statistics of the full test set"],
        answer: 1,
        why: "Using running statistics makes the output for an example independent of the rest of the batch.",
      },
      {
        q: "Why does Adam divide by (1 − β₁ᵗ) and (1 − β₂ᵗ)?",
        options: ["To decay the learning rate", "To correct the bias toward zero of moment estimates initialized at zero", "To normalize gradients to unit norm", "To implement weight decay"],
        answer: 1,
        why: "m and v start at 0, so early estimates are biased toward 0; dividing by 1 − βᵗ unbiases them.",
      },
      {
        q: "With inverted dropout and keep probability p, what happens at test time?",
        options: ["Multiply activations by p", "Divide activations by p", "Nothing — the scaling by 1/p was done during training", "Randomly drop with probability 1 − p"],
        answer: 2,
        why: "Inverted dropout scales kept activations by 1/p at train time, so the test-time forward pass is unchanged.",
      },
    ],
    tasks: [
      {
        title: "Batch normalization",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Create §0x03-training_nns/README.md§ (≥ 100 words).

Write §0-batchnorm.py§:

§def batchnorm_forward(x, gamma, beta, bn_param):§

- §x§: §(N, D)§; §gamma§, §beta§: §(D,)§; §bn_param§ dict with keys §"mode"§ (§"train"§ or §"test"§), optional §"eps"§ (default §1e-5§), §"momentum"§ (default §0.9§), §"running_mean"§ / §"running_var"§ (default zeros of shape §(D,)§).
- Train mode: normalize with the **batch** mean and the **biased** batch variance, $\hat{x} = (x-\mu)/\sqrt{\sigma^2+\epsilon}$, output $\gamma\hat{x}+\beta$, and update **in the dict**: §running_mean = momentum * running_mean + (1 - momentum) * mu§ (same for §running_var§ with §var§).
- Test mode: normalize with the running statistics.
- Return §(out, cache)§.

§def batchnorm_backward(dout, cache):§ → §(dx, dgamma, dbeta)§ for a train-mode forward. Derive the compact form on paper first (no loops).`,
        files: ["0-batchnorm.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 100 },
          { type: "defines", path: "0-batchnorm.py", names: ["batchnorm_forward", "batchnorm_backward"] },
          {
            type: "py_test", files: ["0-batchnorm.py"], label: "train/test forward and running statistics",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('0-batchnorm')
rng = np.random.default_rng(0)
x = rng.normal(loc=5.0, scale=3.0, size=(200, 4))
gamma = np.array([1.0, 2.0, 3.0, 4.0]); beta = np.array([0.0, -1.0, 1.0, 2.0])
bp = {'mode': 'train'}
out, _ = m.batchnorm_forward(x, gamma, beta, bp)
assert np.allclose(out.mean(axis=0), beta, atol=1e-7)
assert np.allclose(out.std(axis=0), gamma, rtol=1e-3)
assert np.allclose(bp['running_mean'], 0.1 * x.mean(axis=0)), "running_mean = 0.9*0 + 0.1*mu"
assert np.allclose(bp['running_var'], 0.1 * x.var(axis=0)), "running_var uses the biased variance"
rm = rng.normal(size=4); rv = rng.uniform(0.5, 2.0, size=4)
tp = {'mode': 'test', 'running_mean': rm, 'running_var': rv, 'eps': 1e-5}
out, _ = m.batchnorm_forward(x, gamma, beta, tp)
assert np.allclose(out, gamma * (x - rm) / np.sqrt(rv + 1e-5) + beta), "test mode must use running stats"`,
          },
          {
            type: "py_test", files: ["0-batchnorm.py"], label: "backward passes numerical gradient check",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('0-batchnorm')
rng = np.random.default_rng(1)
def num_grad(f, x, df, h=1e-6):
    g = np.zeros_like(x)
    for idx in np.ndindex(x.shape):
        old = x[idx]; x[idx] = old + h; p = f(x).copy(); x[idx] = old - h; q = f(x).copy(); x[idx] = old
        g[idx] = np.sum((p - q) * df) / (2 * h)
    return g
def rel(a, b): return np.max(np.abs(a - b) / np.maximum(1e-8, np.abs(a) + np.abs(b)))
x = rng.normal(size=(6, 5)) * 2 + 1; gamma = rng.normal(size=5); beta = rng.normal(size=5)
fwd = lambda xx, gg, bb: m.batchnorm_forward(xx, gg, bb, {'mode': 'train'})[0]
out, cache = m.batchnorm_forward(x, gamma, beta, {'mode': 'train'})
dout = rng.normal(size=out.shape)
dx, dg, db = m.batchnorm_backward(dout, cache)
assert rel(dx, num_grad(lambda v: fwd(v, gamma, beta), x, dout)) < 1e-6, "dx wrong"
assert rel(dg, num_grad(lambda v: fwd(x, v, beta), gamma, dout)) < 1e-6, "dgamma wrong"
assert rel(db, num_grad(lambda v: fwd(x, gamma, v), beta, dout)) < 1e-6, "dbeta wrong"`,
          },
        ],
      },
      {
        title: "Inverted dropout",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §1-dropout.py§:

- §def dropout_forward(x, dropout_param):§ — §dropout_param§ has §"p"§ = probability of **keeping** a unit, §"mode"§ (§"train"§/§"test"§) and optional §"seed"§. In train mode build §mask = (rng.random(x.shape) < p) / p§ with §rng = np.random.default_rng(seed)§ (same seed ⇒ same mask) and return §x * mask§; in test mode return §x§ unchanged. Return §(out, cache)§.
- §def dropout_backward(dout, cache):§ → §dx§ (§dout * mask§ in train mode, §dout§ in test mode).`,
        files: ["1-dropout.py"],
        checks: [
          { type: "defines", path: "1-dropout.py", names: ["dropout_forward", "dropout_backward"] },
          {
            type: "py_test", files: ["1-dropout.py"], label: "keep rate, scaling, determinism, backward",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('1-dropout')
rng = np.random.default_rng(0)
x = rng.uniform(1.0, 2.0, size=(400, 400))
for p in (0.3, 0.75):
    dp = {'p': p, 'mode': 'train', 'seed': 123}
    out, cache = m.dropout_forward(x, dp)
    keep = (out != 0).mean()
    assert abs(keep - p) < 0.01, f"keep fraction {keep:.3f} should be ~{p}"
    assert np.isclose(out.mean(), x.mean(), rtol=0.02), "inverted dropout preserves the mean"
    nz = out != 0
    assert np.allclose(out[nz], x[nz] / p), "kept units must be scaled by 1/p"
    out2, _ = m.dropout_forward(x, dict(dp))
    assert np.array_equal(out, out2), "same seed must give the same mask"
    dout = rng.normal(size=x.shape)
    assert np.allclose(m.dropout_backward(dout, cache), dout * out / x)
out, cache = m.dropout_forward(x, {'p': 0.5, 'mode': 'test'})
assert np.array_equal(out, x)
d = rng.normal(size=x.shape)
assert np.allclose(m.dropout_backward(d, cache), d)`,
          },
        ],
      },
      {
        title: "Update rules: SGD-momentum, RMSProp, Adam",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §2-optimizers.py§ with three functions of the form §def rule(w, dw, config=None) -> (next_w, config)§. When §config is None§ create a dict with the defaults; missing keys must also be filled with §config.setdefault§. Do not modify §w§ in place.

| function | defaults | update |
|---|---|---|
| §sgd_momentum§ | §learning_rate=1e-2§, §momentum=0.9§, §velocity=zeros_like(w)§ | $v \leftarrow \mu v - \alpha\, dw;\ w \leftarrow w + v$ |
| §rmsprop§ | §learning_rate=1e-2§, §decay_rate=0.99§, §epsilon=1e-8§, §cache=zeros§ | $c \leftarrow \rho c + (1-\rho)\,dw^2;\ w \leftarrow w - \alpha\, dw/(\sqrt{c}+\epsilon)$ |
| §adam§ | §learning_rate=1e-3§, §beta1=0.9§, §beta2=0.999§, §epsilon=1e-8§, §m=zeros§, §v=zeros§, §t=0§ | $t \leftarrow t+1$; $m \leftarrow \beta_1 m + (1-\beta_1)dw$; $v \leftarrow \beta_2 v + (1-\beta_2)dw^2$; $\hat m = m/(1-\beta_1^t)$, $\hat v = v/(1-\beta_2^t)$; $w \leftarrow w - \alpha \hat m/(\sqrt{\hat v}+\epsilon)$ |

The state (§velocity§, §cache§, §m§, §v§, §t§) lives in the returned §config§ under exactly these keys.`,
        files: ["2-optimizers.py"],
        checks: [
          { type: "defines", path: "2-optimizers.py", names: ["sgd_momentum", "rmsprop", "adam"] },
          {
            type: "py_test", files: ["2-optimizers.py"], label: "5 steps of each rule match reference",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('2-optimizers')
rng = np.random.default_rng(0)
w0 = rng.normal(size=(4, 5)); grads = [rng.normal(size=(4, 5)) for _ in range(5)]
def run(rule, cfg):
    w = w0.copy(); c = cfg
    for g in grads:
        w_in = w.copy()
        w, c = rule(w_in, g.copy(), c)
    return w, c
w, c = run(m.sgd_momentum, None)
rw = w0.copy(); v = np.zeros_like(w0)
for g in grads: v = 0.9 * v - 1e-2 * g; rw = rw + v
assert np.allclose(w, rw) and np.allclose(c['velocity'], v), "sgd_momentum"
w, c = run(m.rmsprop, {'learning_rate': 0.05})
rw = w0.copy(); ca = np.zeros_like(w0)
for g in grads: ca = 0.99 * ca + 0.01 * g * g; rw = rw - 0.05 * g / (np.sqrt(ca) + 1e-8)
assert np.allclose(w, rw) and np.allclose(c['cache'], ca), "rmsprop"
w, c = run(m.adam, {'learning_rate': 0.01, 'beta1': 0.8})
rw = w0.copy(); mm = np.zeros_like(w0); vv = np.zeros_like(w0)
for t, g in enumerate(grads, 1):
    mm = 0.8 * mm + 0.2 * g; vv = 0.999 * vv + 0.001 * g * g
    rw = rw - 0.01 * (mm / (1 - 0.8 ** t)) / (np.sqrt(vv / (1 - 0.999 ** t)) + 1e-8)
assert np.allclose(w, rw), "adam update (check bias correction and when t is incremented)"
assert c['t'] == 5 and np.allclose(c['m'], mm) and np.allclose(c['v'], vv)`,
          },
        ],
      },
      {
        title: "Initialization and activation statistics",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §3-init.py§ (NumPy only):

- §def xavier_init(fan_in, fan_out, rng):§ → §(fan_in, fan_out)§ array from $\mathcal{N}(0,\ 2/(n_{in}+n_{out}))$.
- §def he_init(fan_in, fan_out, rng):§ → §(fan_in, fan_out)§ array from $\mathcal{N}(0,\ 2/n_{in})$.
- §def activation_stds(X, layer_sizes, init, activation="relu", seed=0):§ — forward §X§ through a bias-free MLP whose layer §k§ has §layer_sizes[k]§ units, weights from §init(fan_in, fan_out, rng)§ with §rng = np.random.default_rng(seed)§ shared across layers, and §activation§ in §{"relu", "tanh"}§ after **every** layer. Return a list with the std of each layer's activations.

All randomness must come from the §rng§ argument. In the README, plot the per-layer activation histograms for a 10-layer tanh and ReLU net under §0.01·N(0,1)§, Xavier and He init, and explain what you see.`,
        files: ["3-init.py"],
        checks: [
          { type: "defines", path: "3-init.py", names: ["xavier_init", "he_init", "activation_stds"] },
          {
            type: "py_test", files: ["3-init.py"], label: "variances, determinism and signal propagation",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('3-init')
W = m.he_init(500, 400, np.random.default_rng(0))
assert W.shape == (500, 400)
assert abs(W.std() / np.sqrt(2 / 500) - 1) < 0.03 and abs(W.mean()) < 0.01
W = m.xavier_init(500, 400, np.random.default_rng(0))
assert abs(W.std() / np.sqrt(2 / 900) - 1) < 0.03
assert np.array_equal(m.he_init(30, 20, np.random.default_rng(5)), m.he_init(30, 20, np.random.default_rng(5))), "use the rng argument"
X = np.random.default_rng(1).normal(size=(1000, 500))
s = m.activation_stds(X, [500] * 10, m.he_init, activation='relu', seed=0)
assert len(s) == 10
assert 0.5 < s[-1] / s[0] < 2.0, f"He + ReLU should keep the scale, got {s[0]:.3f} -> {s[-1]:.3f}"
small = lambda i, o, rng: 0.01 * rng.standard_normal((i, o))
s = m.activation_stds(X, [500] * 10, small, activation='tanh', seed=0)
assert s[-1] < 1e-3 * s[0], "small init must make tanh activations collapse"`,
          },
        ],
      },
      {
        title: "Learning-rate schedules",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §4-lr_schedules.py§ (pure Python/NumPy, all return a float):

- §def step_decay(lr0, epoch, drop=0.5, every=10):§ → $\text{lr}_0 \cdot \text{drop}^{\lfloor \text{epoch}/\text{every} \rfloor}$
- §def cosine_annealing(lr0, t, T, lr_min=0.0):§ → $\text{lr}_{min} + \tfrac12(\text{lr}_0-\text{lr}_{min})(1+\cos(\pi t/T))$ for $0 \le t \le T$, and §lr_min§ for $t > T$.
- §def warmup_cosine(lr0, t, warmup, T, lr_min=0.0):§ → for $t < \text{warmup}$: $\text{lr}_0 (t+1)/\text{warmup}$; otherwise §cosine_annealing(lr0, t - warmup, T - warmup, lr_min)§.

Plot all three for §T = 100§ in the README.`,
        files: ["4-lr_schedules.py"],
        checks: [
          { type: "defines", path: "4-lr_schedules.py", names: ["step_decay", "cosine_annealing", "warmup_cosine"] },
          {
            type: "py_test", files: ["4-lr_schedules.py"], label: "exact schedule values",
            code: String.raw`import math
from importlib import import_module
m = import_module('4-lr_schedules')
c = lambda a, b: math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-12)
assert c(m.step_decay(0.1, 0), 0.1) and c(m.step_decay(0.1, 9), 0.1) and c(m.step_decay(0.1, 10), 0.05)
assert c(m.step_decay(1.0, 25, drop=0.1, every=5), 1e-5)
assert c(m.cosine_annealing(0.1, 0, 100), 0.1) and c(m.cosine_annealing(0.1, 50, 100), 0.05)
assert c(m.cosine_annealing(0.1, 100, 100, lr_min=0.001), 0.001) and c(m.cosine_annealing(0.1, 150, 100, lr_min=0.001), 0.001)
assert c(m.cosine_annealing(0.2, 25, 100, lr_min=0.0), 0.1 * (1 + math.cos(math.pi / 4)))
assert c(m.warmup_cosine(0.1, 0, 5, 105), 0.02) and c(m.warmup_cosine(0.1, 4, 5, 105), 0.1)
assert c(m.warmup_cosine(0.1, 5, 5, 105), 0.1) and c(m.warmup_cosine(0.1, 55, 5, 105), 0.05)`,
          },
        ],
      },
      {
        title: "Experiments: what actually helps",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`In §5-experiments.ipynb§ (PyTorch allowed), train a 5-hidden-layer fully connected net (100 units per layer) on CIFAR-10 and run these controlled comparisons with the **same** budget and seeds:

1. Init: §0.01·N(0,1)§ vs He — plot per-layer gradient norms after 1 iteration.
2. With vs without batch norm (at 3 learning rates spanning 2 orders of magnitude).
3. SGD vs SGD-momentum vs RMSProp vs Adam — training loss curves on one plot.
4. Dropout §p_keep ∈ {1.0, 0.75, 0.5}§ — train/val gap.

The notebook must be committed **executed**. Write §results.json§ with at least:

§§§json
{"best_val_accuracy": 0.53, "best_config": {"optimizer": "adam", "lr": 0.001, "batchnorm": true, "p_keep": 0.75},
 "bn_val_accuracy": 0.52, "no_bn_val_accuracy": 0.47}
§§§

**Target:** §best_val_accuracy >= 0.50§ (a well-tuned FC net on CIFAR-10 reaches 0.50–0.58).`,
        files: ["5-experiments.ipynb", "results.json"],
        checks: [
          { type: "notebook_executed", path: "5-experiments.ipynb" },
          { type: "contains", path: "5-experiments.ipynb", pattern: "BatchNorm1d|batchnorm", label: "batch-norm comparison present" },
          { type: "contains", path: "5-experiments.ipynb", pattern: "RMSprop|rmsprop", label: "optimizer comparison present" },
          { type: "json_metric", path: "results.json", key: "best_val_accuracy", op: ">=", value: 0.5 },
          { type: "json_metric", path: "results.json", key: "bn_val_accuracy", op: ">", value: 0 },
        ],
      },
      {
        title: "My neural-network training checklist",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Write §written/0-training_checklist.md§ (PDF, Markdown or LaTeX accepted): your personal, ordered checklist for starting and debugging a training run. It is the seed of the **deep learning debugging playbook** you will maintain for the rest of the program (Phase 2 deliverable).

It must cover: data sanity checks, the initial-loss check, overfitting a single batch, initialization, normalization, learning-rate finding and schedules, regularization, optimizer choice, and the symptoms → causes table (loss NaN, loss flat, val ≫ train loss, dead ReLUs, exploding gradients). Every item must link to evidence from **your** experiments in this project (a plot or number).`,
        deliverable: "repo",
        files: ["written/0-training_checklist.md"],
        rubric: "report",
        criteria: [
          "Ordered pre-training checks including expected initial loss and overfitting a tiny batch",
          "Covers init, normalization, LR schedule, regularization and optimizer choice with concrete defaults",
          "Contains a symptoms → likely causes → fixes table with at least 5 rows",
          "Each recommendation is backed by a plot or number from the learner's own experiments",
          "Written in the learner's own words (not a copy of Karpathy's recipe or CS231n notes)",
        ],
      },
      {
        title: "Layer normalization",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`Write §100-layernorm.py§ with §layernorm_forward(x, gamma, beta, ln_param)§ → §(out, cache)§ and §layernorm_backward(dout, cache)§ → §(dx, dgamma, dbeta)§. §x§ is §(N, D)§; statistics are computed **per example** over the §D§ features (biased variance), §eps = ln_param.get("eps", 1e-5)§; same behaviour in train and test. Explain in the README why layer norm, not batch norm, is used in Transformers.`,
        files: ["100-layernorm.py"],
        checks: [
          { type: "defines", path: "100-layernorm.py", names: ["layernorm_forward", "layernorm_backward"] },
          {
            type: "py_test", files: ["100-layernorm.py"], label: "per-example statistics + gradient check",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('100-layernorm')
rng = np.random.default_rng(0)
def num_grad(f, x, df, h=1e-6):
    g = np.zeros_like(x)
    for idx in np.ndindex(x.shape):
        old = x[idx]; x[idx] = old + h; p = f(x).copy(); x[idx] = old - h; q = f(x).copy(); x[idx] = old
        g[idx] = np.sum((p - q) * df) / (2 * h)
    return g
def rel(a, b): return np.max(np.abs(a - b) / np.maximum(1e-8, np.abs(a) + np.abs(b)))
x = rng.normal(size=(4, 7)) * 3 + 2; g = rng.normal(size=7); b = rng.normal(size=7)
out, cache = m.layernorm_forward(x, np.ones(7), np.zeros(7), {})
assert np.allclose(out.mean(axis=1), 0, atol=1e-7) and np.allclose(out.std(axis=1), 1, rtol=1e-3)
f = lambda xx, gg, bb: m.layernorm_forward(xx, gg, bb, {})[0]
out, cache = m.layernorm_forward(x, g, b, {})
dout = rng.normal(size=out.shape)
dx, dg, db = m.layernorm_backward(dout, cache)
assert rel(dx, num_grad(lambda v: f(v, g, b), x, dout)) < 1e-6
assert rel(dg, num_grad(lambda v: f(x, v, b), g, dout)) < 1e-6
assert rel(db, num_grad(lambda v: f(x, g, v), b, dout)) < 1e-6`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── A15
  {
    id: "A15",
    track: "applied",
    phase: PHASE,
    title: "CNN Architectures: Reproduce ResNet-18 on CIFAR-10",
    days: 4,
    repo: REPO,
    dir: "0x04-resnet",
    sources: [
      { course: "CS231N", lectures: "Lec 8–9", topics: "Deep learning software; CNN architectures (AlexNet → VGG → GoogLeNet → ResNet → ViT)" },
    ],
    resources: [
      { title: "He et al., Deep Residual Learning for Image Recognition (2015)", url: "https://arxiv.org/abs/1512.03385" },
      { title: "He et al., Identity Mappings in Deep Residual Networks (2016)", url: "https://arxiv.org/abs/1603.05027" },
      { title: "Dive into Deep Learning — Residual Networks (ResNet)", url: "https://d2l.ai/chapter_convolutional-modern/resnet.html" },
      { title: "He et al., Bag of Tricks for Image Classification with CNNs (2018)", url: "https://arxiv.org/abs/1812.01187" },
      { title: "PyTorch — TensorBoard with PyTorch tutorial", url: "https://pytorch.org/tutorials/recipes/recipes/tensorboard_with_pytorch.html" },
      { title: "Weights & Biases documentation", url: "https://docs.wandb.ai/" },
    ],
    concepts: [
      "Architecture evolution: AlexNet, VGG, GoogLeNet, ResNet",
      "Residual connections and the degradation problem",
      "BasicBlock vs Bottleneck, projection shortcuts",
      "Receptive field growth with depth and stride",
      "Data augmentation for CIFAR (random crop + flip)",
      "SGD + momentum + weight decay with cosine / one-cycle schedules",
      "Mixed precision training and experiment tracking",
    ],
    objectives: [
      "Explain why plain deep networks train worse than shallower ones and how residuals fix it",
      "Implement BasicBlock and ResNet-18 (CIFAR variant) from a blank file",
      "Count the parameters of a CNN by hand and match the framework's count",
      "Compute output sizes and receptive fields through a stack of conv layers",
      "Reach ≥ 93% CIFAR-10 test accuracy with a reproducible training script",
      "Track and compare experiments with W&B or TensorBoard",
    ],
    requirements: [
      "PyTorch 2.x + torchvision; a single GPU (Colab T4 or better) is enough",
      "You may NOT use torchvision.models, timm or any pretrained weights — the network is written by you",
      "4-arch_math.py is pure Python/NumPy",
    ],
    quiz: [
      {
        q: "What problem did He et al. observe that motivated residual connections?",
        options: ["Overfitting of deep nets", "Deeper plain nets had higher TRAINING error than shallower ones (degradation)", "GPU memory limits", "Vanishing activations only at test time"],
        answer: 1,
        why: "The degradation problem is an optimization difficulty: training error rises with depth in plain nets.",
      },
      {
        q: "When does a BasicBlock need a projection (1×1 conv) shortcut?",
        options: ["Always", "When the stride ≠ 1 or the number of channels changes", "Only in the first block", "Never in ResNet-18"],
        answer: 1,
        why: "The identity can only be added if the shapes match; otherwise a strided 1×1 conv (+BN) projects x.",
      },
      {
        q: "Two stacked 3×3 convolutions (stride 1) have the receptive field of a single…",
        options: ["3×3 conv", "5×5 conv", "7×7 conv", "9×9 conv"],
        answer: 1,
        why: "Each extra 3×3 layer adds 2 pixels: 3 + 2 = 5, with fewer parameters and more non-linearity than one 5×5.",
      },
      {
        q: "Why do the CIFAR ResNet variants replace the 7×7 stride-2 stem and max-pool with a 3×3 stride-1 conv?",
        options: ["To reduce parameters", "32×32 images are too small to downsample 4× immediately", "Because CIFAR is grayscale", "It is required by batch norm"],
        answer: 1,
        why: "The ImageNet stem would reduce a 32×32 image to 8×8 before any residual block, destroying spatial detail.",
      },
    ],
    tasks: [
      {
        title: "BasicBlock",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Create §0x04-resnet/README.md§ (≥ 150 words: architecture diagram/table, training recipe, final accuracy, link to your W&B project or TensorBoard screenshots).

Write §0-basic_block.py§ with §class BasicBlock(nn.Module)§:

- §expansion = 1§ class attribute; §__init__(self, in_planes, planes, stride=1)§.
- Main path: §conv3x3(stride) → BN → ReLU → conv3x3(1) → BN§, convs with §bias=False§.
- Shortcut: identity if §stride == 1 and in_planes == planes§, otherwise §1×1 conv(stride, bias=False) → BN§.
- §forward§: §relu(main(x) + shortcut(x))§.

§§§python
>>> blk = BasicBlock(64, 128, stride=2)
>>> blk(torch.randn(2, 64, 32, 32)).shape
torch.Size([2, 128, 16, 16])
§§§`,
        files: ["0-basic_block.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 150 },
          { type: "defines", path: "0-basic_block.py", names: ["BasicBlock"] },
          { type: "contains", path: "0-basic_block.py", pattern: "BatchNorm2d", label: "uses BatchNorm2d" },
          { type: "contains", path: "0-basic_block.py", pattern: "kernel_size\\s*=\\s*1|Conv2d\\([^)]*,\\s*1\\s*,", label: "1×1 projection shortcut" },
          { type: "not_contains", path: "0-basic_block.py", pattern: "torchvision\\.models|timm", label: "no library ResNet" },
        ],
      },
      {
        title: "ResNet-18 for CIFAR-10",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §1-resnet18.py§ with §class ResNet18(nn.Module)§, §__init__(self, num_classes=10)§:

- Stem: §conv3x3(3→64, stride 1, bias=False) → BN → ReLU§ (no max-pool).
- Four stages of 2 BasicBlocks with widths 64, 128, 256, 512 and first-block strides 1, 2, 2, 2.
- §AdaptiveAvgPool2d(1) → flatten → Linear(512, num_classes)§.

Also define §def count_parameters(model):§ (trainable parameters). The correct count is **11 173 962**; your training script must write it to §results.json§ as §num_params§.`,
        files: ["1-resnet18.py"],
        checks: [
          { type: "defines", path: "1-resnet18.py", names: ["ResNet18", "count_parameters"] },
          { type: "contains", path: "1-resnet18.py", pattern: "AdaptiveAvgPool2d|adaptive_avg_pool2d", label: "global average pooling" },
          { type: "not_contains", path: "1-resnet18.py", pattern: "torchvision\\.models|timm", label: "no library ResNet" },
          { type: "json_metric", path: "results.json", key: "num_params", op: "==", value: 11173962 },
        ],
      },
      {
        title: "Data pipeline with augmentation",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §2-data.py§ with §def get_cifar10_loaders(root="data", batch_size=128, num_workers=4):§ → §(train_loader, test_loader)§.

- Train transform: §RandomCrop(32, padding=4)§, §RandomHorizontalFlip()§, §ToTensor()§, §Normalize§ with the CIFAR-10 per-channel mean/std (≈ §(0.4914, 0.4822, 0.4465)§ / §(0.2470, 0.2435, 0.2616)§).
- Test transform: §ToTensor()§ + the same §Normalize§ only.
- §pin_memory=True§, §shuffle=True§ for train only.`,
        files: ["2-data.py"],
        checks: [
          { type: "defines", path: "2-data.py", names: ["get_cifar10_loaders"] },
          { type: "contains", path: "2-data.py", pattern: "RandomCrop\\(\\s*32\\s*,\\s*padding\\s*=\\s*4", label: "random crop with 4-px padding" },
          { type: "contains", path: "2-data.py", pattern: "RandomHorizontalFlip", label: "horizontal flips" },
          { type: "contains", path: "2-data.py", pattern: "Normalize", label: "per-channel normalization" },
        ],
      },
      {
        title: "Train to ≥ 93% with experiment tracking",
        type: "mandatory",
        kind: "code",
        points: 4,
        body: md`Write §3-train.py§ that trains your ResNet-18 from scratch:

- SGD (§momentum=0.9§, §nesterov§ optional, §weight_decay=5e-4§), initial LR ≈ 0.1 with a cosine or one-cycle schedule, label smoothing optional, batch size 128–512, mixed precision (§torch.autocast§ + §GradScaler§) recommended. Budget: ≤ ~2 GPU-hours on a T4.
- Logs train loss, train/test accuracy and LR every epoch to **Weights & Biases** (§wandb.log§) **or** **TensorBoard** (§SummaryWriter§). Commit the run screenshots under §figures/§.
- Seeds everything, saves §best.pt§ (do not commit it if > 50 MB) and writes §results.json§:

§§§json
{"test_accuracy": 0.946, "epochs": 40, "best_epoch": 39, "num_params": 11173962,
 "train_time_minutes": 85.0, "gpu": "Tesla T4", "lr_schedule": "onecycle", "seed": 0}
§§§

**Target:** §test_accuracy >= 0.93§ (Phase 2 deliverable: match published CIFAR ResNet-18 reproductions, ~93–95%, within 1%).`,
        files: ["3-train.py", "results.json", "figures/"],
        checks: [
          { type: "exists", path: "3-train.py" },
          { type: "contains", path: "3-train.py", pattern: "wandb|SummaryWriter", label: "experiment tracking (W&B or TensorBoard)" },
          { type: "contains", path: "3-train.py", pattern: "weight_decay", label: "weight decay" },
          { type: "contains", path: "3-train.py", pattern: "lr_scheduler|OneCycleLR|CosineAnnealing", label: "learning-rate schedule" },
          { type: "exists", path: "figures" },
          { type: "json_metric", path: "results.json", key: "test_accuracy", op: ">=", value: 0.93 },
        ],
      },
      {
        title: "Architecture arithmetic",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §4-arch_math.py§ (pure Python / NumPy; must not import torch):

- §def conv_output_size(n, kernel, stride=1, padding=0):§ → §int§, $\lfloor (n + 2p - k)/s \rfloor + 1$.
- §def receptive_field(layers):§ — §layers§ is a list of §(kernel, stride)§ tuples applied in order; return the receptive field (in input pixels) of one unit of the last layer. Use $r \leftarrow r + (k-1)\,j$, $j \leftarrow j\cdot s$, starting from $r = 1, j = 1$. Empty list → 1.
- §def resnet18_cifar_param_count(num_classes=10):§ — compute the number of trainable parameters of the task-1 architecture **analytically** (conv weights, BN γ and β, FC weight and bias). Must not hard-code the answer: it has to be correct for any §num_classes§.`,
        files: ["4-arch_math.py"],
        checks: [
          { type: "defines", path: "4-arch_math.py", names: ["conv_output_size", "receptive_field", "resnet18_cifar_param_count"] },
          { type: "not_contains", path: "4-arch_math.py", pattern: "import torch|from torch", label: "no PyTorch" },
          {
            type: "py_test", files: ["4-arch_math.py"], label: "sizes, receptive fields and parameter count",
            code: String.raw`from importlib import import_module
m = import_module('4-arch_math')
assert m.conv_output_size(32, 3, 1, 1) == 32
assert m.conv_output_size(32, 3, 2, 1) == 16
assert m.conv_output_size(224, 7, 2, 3) == 112
assert m.conv_output_size(7, 2, 2, 0) == 3
assert m.receptive_field([]) == 1
assert m.receptive_field([(3, 1), (3, 1)]) == 5
assert m.receptive_field([(3, 1)] * 3) == 7
assert m.receptive_field([(3, 2), (3, 1)]) == 7
assert m.receptive_field([(7, 2), (3, 2), (3, 1)]) == 19
assert m.resnet18_cifar_param_count(10) == 11173962, m.resnet18_cifar_param_count(10)
assert m.resnet18_cifar_param_count(100) == 11173962 + 90 * 513, "count must depend on num_classes"`,
          },
        ],
      },
      {
        title: "Reproduction report",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Write §written/0-resnet_reproduction.md§ (PDF, Markdown or LaTeX accepted; 2–3 pages):

1. The architecture table of your ResNet-18 (layer, output shape, #params) and how it differs from the ImageNet ResNet-18 and from the paper's CIFAR ResNet-20/56.
2. Your full training recipe and compute budget; training curves from W&B/TensorBoard.
3. Your test accuracy vs reference numbers (paper: CIFAR ResNet-56 ≈ 93.0%, ResNet-110 ≈ 93.6%; common ResNet-18 reproductions ≈ 93–95%) and whether you are within 1%.
4. What mattered most: at least two things you changed between runs and their measured effect.
5. A short section summarizing the architecture evolution from AlexNet to ResNet in one table (depth, params, top-5 error, key idea).`,
        deliverable: "repo",
        files: ["written/0-resnet_reproduction.md"],
        rubric: "reproduction",
        criteria: [
          "Architecture table with output shapes per stage and total parameters 11 173 962",
          "Complete, reproducible training recipe (optimizer, LR schedule, epochs, augmentation, batch size, hardware, seed)",
          "Reports final test accuracy consistent with results.json and compares to published numbers",
          "At least two ablated or changed settings with measured accuracy impact",
          "AlexNet → VGG → GoogLeNet → ResNet comparison table with the key idea of each",
        ],
      },
      {
        title: "Ablation: does the skip connection matter?",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`Write §100-ablation.py§ that trains (same recipe, same seed, shorter budget allowed, e.g. 15 epochs) three networks: your ResNet-18, a **plain-18** (identical but with the shortcuts removed), and a **plain-34 vs ResNet-34** pair (add §[3, 4, 6, 3]§ support). Plot training loss for all four on one figure (§figures/ablation.png§) and add to §results.json§:

§§§json
{"ablation": {"resnet18_test_accuracy": 0.92, "plain18_test_accuracy": 0.90,
              "resnet34_test_accuracy": 0.925, "plain34_test_accuracy": 0.87, "epochs": 15}}
§§§

Discuss in the README whether you reproduced the degradation problem (plain-34 worse than plain-18).`,
        files: ["100-ablation.py", "figures/ablation.png"],
        checks: [
          { type: "exists", path: "100-ablation.py" },
          { type: "exists", path: "figures/ablation.png" },
          { type: "json_metric", path: "results.json", key: "ablation.plain18_test_accuracy", op: ">", value: 0 },
          { type: "json_metric", path: "results.json", key: "ablation.plain34_test_accuracy", op: ">", value: 0 },
          { type: "json_metric", path: "results.json", key: "ablation.resnet34_test_accuracy", op: ">", value: 0 },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── A16
  {
    id: "A16",
    track: "applied",
    phase: PHASE,
    title: "Detection & Segmentation",
    days: 3,
    repo: REPO,
    dir: "0x05-detection_segmentation",
    sources: [
      { course: "CS231N", lectures: "Lec 10", topics: "RNNs intro — legacy material, SKIM ONLY (deep coverage in Phase 3)" },
      { course: "CS231N", lectures: "Lec 11", topics: "Detection & segmentation: R-CNN family, Faster R-CNN, Mask R-CNN, DETR, semantic/instance segmentation" },
    ],
    resources: [
      { title: "Ren et al., Faster R-CNN (2015)", url: "https://arxiv.org/abs/1506.01497" },
      { title: "He et al., Mask R-CNN (2017)", url: "https://arxiv.org/abs/1703.06870" },
      { title: "Carion et al., End-to-End Object Detection with Transformers (DETR, 2020)", url: "https://arxiv.org/abs/2005.12872" },
      { title: "Long et al., Fully Convolutional Networks for Semantic Segmentation (2014)", url: "https://arxiv.org/abs/1411.4038" },
      { title: "torchvision — Models and pre-trained weights (detection & segmentation)", url: "https://pytorch.org/vision/stable/models.html" },
      { title: "COCO — Detection evaluation", url: "https://cocodataset.org/#detection-eval" },
    ],
    concepts: [
      "Classification vs localization vs detection vs semantic/instance segmentation",
      "Intersection over Union (IoU)",
      "Non-maximum suppression (NMS) and Soft-NMS",
      "Precision–recall curves, AP and mAP (VOC vs COCO)",
      "Anchors and box-regression parametrization",
      "Two-stage (Faster R-CNN), one-stage (YOLO/RetinaNet) and set-prediction (DETR) detectors",
      "Mean IoU for segmentation",
    ],
    objectives: [
      "Compute IoU, NMS and mAP by hand and in vectorized NumPy",
      "Explain the Faster R-CNN pipeline: backbone, RPN, RoI pooling/align, heads",
      "Explain why DETR needs no NMS (Hungarian matching)",
      "Encode/decode bounding boxes relative to anchors",
      "Evaluate a pretrained detector on real data with your own metric code",
      "Explain the difference between semantic and instance segmentation and how each is evaluated",
    ],
    requirements: [
      "Files 0- to 4- and 100-: NumPy only (no torchvision.ops, no pycocotools)",
      "Task 5: PyTorch + torchvision pretrained detectors allowed",
    ],
    quiz: [
      {
        q: "Box A = [0,0,2,2], box B = [1,1,3,3] (x1,y1,x2,y2). IoU?",
        options: ["1/4", "1/7", "1/3", "1/2"],
        answer: 1,
        why: "Intersection 1, union 4 + 4 − 1 = 7.",
      },
      {
        q: "What problem does non-maximum suppression solve?",
        options: ["Class imbalance", "Multiple overlapping detections of the same object", "Small objects", "Slow inference"],
        answer: 1,
        why: "Detectors fire many overlapping boxes per object; NMS keeps the highest-scoring one and suppresses overlaps.",
      },
      {
        q: "Why does DETR not require NMS?",
        options: ["It uses anchors", "It predicts a fixed set and is trained with one-to-one Hungarian matching, so duplicates are penalised", "It uses a higher IoU threshold", "It only detects one object per image"],
        answer: 1,
        why: "The bipartite matching loss assigns each ground-truth object to exactly one prediction.",
      },
      {
        q: "COCO's primary metric 'AP' is…",
        options: ["AP at IoU 0.5", "AP averaged over IoU thresholds 0.50:0.05:0.95 and over classes", "Accuracy of the top-1 box", "Recall at 100 detections"],
        answer: 1,
        why: "COCO AP averages over 10 IoU thresholds, rewarding precise localization; AP50 is the VOC-style metric.",
      },
    ],
    tasks: [
      {
        title: "Vectorized IoU",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Create §0x05-detection_segmentation/README.md§ (≥ 120 words). Note in it that you skimmed the CS231N RNN lecture (Phase 3 covers RNNs properly).

Write §0-iou.py§ with §def iou(boxes_a, boxes_b):§ — §boxes_a§ §(N, 4)§, §boxes_b§ §(M, 4)§ in §[x1, y1, x2, y2]§ format with §x2 > x1§, §y2 > y1§ (continuous coordinates: area = §(x2 - x1) * (y2 - y1)§, no +1). Return the §(N, M)§ IoU matrix using broadcasting — **no Python loops**.`,
        files: ["0-iou.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 120 },
          { type: "defines", path: "0-iou.py", names: ["iou"] },
          { type: "not_contains", path: "0-iou.py", ...NO_LOOP },
          {
            type: "py_test", files: ["0-iou.py"], label: "matches pairwise reference",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('0-iou')
rng = np.random.default_rng(0)
def rand_boxes(n):
    xy = rng.uniform(0, 50, size=(n, 2)); wh = rng.uniform(1, 30, size=(n, 2))
    return np.hstack([xy, xy + wh])
A, B = rand_boxes(7), rand_boxes(9)
def ref(a, b):
    iw = max(0, min(a[2], b[2]) - max(a[0], b[0])); ih = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = iw * ih; u = (a[2]-a[0])*(a[3]-a[1]) + (b[2]-b[0])*(b[3]-b[1]) - inter
    return inter / u
R = np.array([[ref(a, b) for b in B] for a in A])
got = np.asarray(m.iou(A, B))
assert got.shape == (7, 9)
assert np.allclose(got, R)
assert np.isclose(m.iou(np.array([[0., 0, 2, 2]]), np.array([[1., 1, 3, 3]]))[0, 0], 1 / 7)
assert np.allclose(np.diag(m.iou(A, A)), 1.0)
assert m.iou(np.array([[0., 0, 1, 1]]), np.array([[2., 2, 3, 3]]))[0, 0] == 0`,
          },
        ],
      },
      {
        title: "Non-maximum suppression",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §1-nms.py§ with §def nms(boxes, scores, iou_threshold=0.5):§

- §boxes§ §(N, 4)§ xyxy, §scores§ §(N,)§. Greedy NMS: repeatedly take the highest-scoring remaining box, keep it, and discard every remaining box whose IoU with it is **strictly greater** than §iou_threshold§.
- Ties in score: lower original index first (use a stable sort).
- Return an integer NumPy array of kept indices, in the order they were kept (descending score). §N = 0§ → empty array.
- You may loop over kept boxes but each IoU computation must be vectorized against all remaining boxes. NumPy only.`,
        files: ["1-nms.py"],
        checks: [
          { type: "defines", path: "1-nms.py", names: ["nms"] },
          { type: "not_contains", path: "1-nms.py", pattern: "torchvision|torch", label: "NumPy only" },
          {
            type: "py_test", files: ["1-nms.py"], label: "matches reference greedy NMS",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('1-nms')
rng = np.random.default_rng(0)
def iou1(b, B):
    iw = np.clip(np.minimum(b[2], B[:, 2]) - np.maximum(b[0], B[:, 0]), 0, None)
    ih = np.clip(np.minimum(b[3], B[:, 3]) - np.maximum(b[1], B[:, 1]), 0, None)
    inter = iw * ih
    return inter / ((b[2]-b[0])*(b[3]-b[1]) + (B[:, 2]-B[:, 0])*(B[:, 3]-B[:, 1]) - inter)
def ref(boxes, scores, t):
    order = list(np.argsort(-scores, kind='stable')); keep = []
    while order:
        i = order.pop(0); keep.append(i)
        if order:
            o = np.array(order); order = list(o[iou1(boxes[i], boxes[o]) <= t])
    return np.array(keep, dtype=int)
for t in (0.3, 0.5, 0.7):
    xy = rng.uniform(0, 40, size=(60, 2)); wh = rng.uniform(5, 20, size=(60, 2))
    boxes = np.hstack([xy, xy + wh]); scores = rng.random(60)
    got = np.asarray(m.nms(boxes, scores, t)).astype(int)
    assert np.array_equal(got, ref(boxes, scores, t)), f"threshold {t}"
b = np.array([[0., 0, 10, 10], [1, 1, 11, 11], [20, 20, 30, 30]]); s = np.array([0.9, 0.9, 0.5])
assert list(np.asarray(m.nms(b, s, 0.5))) == [0, 2], "ties: lower index first"
eq = np.array([[0., 0, 2, 1], [0, 0, 1, 1]])
assert list(np.asarray(m.nms(eq, np.array([0.9, 0.8]), 0.5))) == [0, 1], "IoU exactly at the threshold must NOT suppress (strictly greater)"
assert len(m.nms(np.zeros((0, 4)), np.zeros(0), 0.5)) == 0`,
          },
        ],
      },
      {
        title: "Average precision and mAP",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Write §2-average_precision.py§ (NumPy only):

§def average_precision(detections, ground_truths, iou_threshold=0.5):§ — one class.

- §detections§: list of §(image_id, score, box)§ tuples (§box§ = 4 floats, xyxy). §ground_truths§: dict §image_id → (G, 4) array§.
- Sort detections by descending score (stable). For each, find the ground-truth box **in the same image** with highest IoU. If that IoU §>= iou_threshold§ and that ground truth is not already matched → TP and mark it matched; otherwise FP (do **not** fall back to the second-best ground truth).
- Precision/recall from cumulative TP/FP; recall denominator = total number of ground-truth boxes. If there are none, return §0.0§.
- AP = area under the interpolated PR curve, **all-point interpolation** (VOC 2010+): pad recall with 0 and 1 and precision with 0 and 0, make precision monotonically non-increasing from the right, sum $(r_{k+1} - r_k)\,p_{k+1}$ over points where recall changes.

§def mean_average_precision(dets_by_class, gts_by_class, iou_threshold=0.5):§ → mean of §average_precision§ over the classes in §gts_by_class§ (a class with no detections has AP 0).`,
        files: ["2-average_precision.py"],
        checks: [
          { type: "defines", path: "2-average_precision.py", names: ["average_precision", "mean_average_precision"] },
          {
            type: "py_test", files: ["2-average_precision.py"], label: "hand-computed and randomized reference",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('2-average_precision')
rng = np.random.default_rng(0)
def iou1(b, B):
    iw = np.clip(np.minimum(b[2], B[:, 2]) - np.maximum(b[0], B[:, 0]), 0, None)
    ih = np.clip(np.minimum(b[3], B[:, 3]) - np.maximum(b[1], B[:, 1]), 0, None)
    inter = iw * ih
    return inter / ((b[2]-b[0])*(b[3]-b[1]) + (B[:, 2]-B[:, 0])*(B[:, 3]-B[:, 1]) - inter)
def ref(dets, gts, t):
    npos = sum(len(g) for g in gts.values())
    if npos == 0: return 0.0
    order = sorted(range(len(dets)), key=lambda i: -dets[i][1])
    used = {k: np.zeros(len(v), bool) for k, v in gts.items()}; tp = []
    for i in order:
        img, s, box = dets[i]; g = gts.get(img, np.zeros((0, 4)))
        if len(g) == 0: tp.append(0); continue
        o = iou1(np.asarray(box, float), g); j = int(np.argmax(o))
        if o[j] >= t and not used[img][j]: used[img][j] = True; tp.append(1)
        else: tp.append(0)
    tp = np.array(tp, float); fp = 1 - tp
    rec = np.cumsum(tp) / npos; prec = np.cumsum(tp) / np.maximum(np.cumsum(tp) + np.cumsum(fp), 1e-12)
    mrec = np.concatenate([[0], rec, [1]]); mpre = np.concatenate([[0], prec, [0]])
    for k in range(len(mpre) - 2, -1, -1): mpre[k] = max(mpre[k], mpre[k + 1])
    idx = np.where(mrec[1:] != mrec[:-1])[0]
    return float(np.sum((mrec[idx + 1] - mrec[idx]) * mpre[idx + 1]))
gts = {0: np.array([[0., 0, 10, 10], [20, 20, 30, 30]])}
dets = [(0, 0.9, [0, 0, 10, 10]), (0, 0.8, [50, 50, 60, 60]), (0, 0.7, [20, 20, 30, 31])]
assert np.isclose(m.average_precision(dets, gts, 0.5), 0.5 + 0.5 * (2 / 3)), m.average_precision(dets, gts, 0.5)
dup = [(0, 0.9, [0, 0, 10, 10]), (0, 0.8, [0, 0, 10, 10.5])]
assert np.isclose(m.average_precision(dup, gts, 0.5), 0.5), "a duplicate detection is a FP"
for trial in range(5):
    gts = {}; dets = []
    for img in range(6):
        n = int(rng.integers(0, 5)); xy = rng.uniform(0, 80, (n, 2)); g = np.hstack([xy, xy + rng.uniform(8, 25, (n, 2))]); gts[img] = g
        for b in g:
            if rng.random() < 0.8: dets.append((img, float(rng.random()), list(b + rng.normal(0, 2, 4))))
        for _ in range(int(rng.integers(0, 4))):
            p = rng.uniform(0, 80, 2); dets.append((img, float(rng.random()), list(np.r_[p, p + rng.uniform(8, 25, 2)])))
    for t in (0.5, 0.75):
        assert np.isclose(m.average_precision(dets, gts, t), ref(dets, gts, t)), (trial, t)
mp = m.mean_average_precision({'a': dets, 'b': []}, {'a': gts, 'b': gts}, 0.5)
assert np.isclose(mp, ref(dets, gts, 0.5) / 2), "class with no detections has AP 0"`,
          },
        ],
      },
      {
        title: "Anchor box encoding",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §3-box_coding.py§ with the Faster R-CNN parametrization (NumPy only, vectorized):

- §def encode_boxes(anchors, boxes):§ — both §(N, 4)§ xyxy. With centers/sizes $(x_a, y_a, w_a, h_a)$ and $(x, y, w, h)$ (§w = x2 − x1§, center §= x1 + w/2§), return §(N, 4)§ deltas $t_x = (x - x_a)/w_a$, $t_y = (y-y_a)/h_a$, $t_w = \log(w/w_a)$, $t_h = \log(h/h_a)$.
- §def decode_boxes(anchors, deltas):§ — the exact inverse, returning xyxy boxes.`,
        files: ["3-box_coding.py"],
        checks: [
          { type: "defines", path: "3-box_coding.py", names: ["encode_boxes", "decode_boxes"] },
          {
            type: "py_test", files: ["3-box_coding.py"], label: "encode matches reference, decode inverts it",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('3-box_coding')
rng = np.random.default_rng(0)
def mk(n):
    xy = rng.uniform(0, 100, (n, 2)); return np.hstack([xy, xy + rng.uniform(5, 50, (n, 2))])
A, B = mk(20), mk(20)
wa, ha = A[:, 2] - A[:, 0], A[:, 3] - A[:, 1]; xa, ya = A[:, 0] + wa / 2, A[:, 1] + ha / 2
w, h = B[:, 2] - B[:, 0], B[:, 3] - B[:, 1]; x, y = B[:, 0] + w / 2, B[:, 1] + h / 2
exp = np.stack([(x - xa) / wa, (y - ya) / ha, np.log(w / wa), np.log(h / ha)], axis=1)
d = np.asarray(m.encode_boxes(A, B))
assert d.shape == (20, 4) and np.allclose(d, exp)
assert np.allclose(m.decode_boxes(A, d), B)
assert np.allclose(m.encode_boxes(A, A), 0)`,
          },
        ],
      },
      {
        title: "Segmentation metrics",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §4-seg_metrics.py§ (NumPy only, no loops over pixels):

- §def confusion_matrix(pred, target, num_classes, ignore_index=255):§ — §pred§, §target§ integer arrays of the same shape (any shape). Return §(K, K)§ int array with §cm[t, p]§ = number of pixels with target §t§ and prediction §p§; pixels with §target == ignore_index§ are ignored. (Hint: §np.bincount§.)
- §def mean_iou(pred, target, num_classes, ignore_index=255):§ → §(miou, per_class)§ where §per_class[k] = TP / (TP + FP + FN)§, §np.nan§ for classes with an empty union, and §miou = np.nanmean(per_class)§.`,
        files: ["4-seg_metrics.py"],
        checks: [
          { type: "defines", path: "4-seg_metrics.py", names: ["confusion_matrix", "mean_iou"] },
          {
            type: "py_test", files: ["4-seg_metrics.py"], label: "confusion matrix and mIoU with ignore index",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('4-seg_metrics')
rng = np.random.default_rng(0)
K = 5
t = rng.integers(0, 4, size=(3, 16, 16)); p = rng.integers(0, 4, size=(3, 16, 16))
t[0, :4] = 255
cm = np.asarray(m.confusion_matrix(p, t, K))
ref = np.zeros((K, K), int)
for a, b in zip(t.ravel(), p.ravel()):
    if a != 255: ref[a, b] += 1
assert cm.shape == (K, K) and np.array_equal(cm, ref)
miou, pc = m.mean_iou(p, t, K)
inter = np.diag(ref).astype(float); union = ref.sum(0) + ref.sum(1) - np.diag(ref)
exp = np.where(union > 0, inter / np.maximum(union, 1), np.nan)
assert np.isnan(pc[4]), "class absent from pred and target must be nan"
assert np.allclose(pc[:4], exp[:4]) and np.isclose(miou, np.nanmean(exp))
assert np.isclose(m.mean_iou(t[1], t[1], K)[0], 1.0)`,
          },
        ],
      },
      {
        title: "Mini-project: evaluate a pretrained detector",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Write §5-detect.py§ that runs a pretrained torchvision detector (§fasterrcnn_resnet50_fpn_v2§, §fasterrcnn_resnet50_fpn§ or §retinanet_resnet50_fpn§ with COCO weights) on **at least 300 images of COCO val2017** (or a Pascal VOC 2007 test subset), and evaluates it with **your own** §mean_average_precision§ (task 2) at IoU 0.5 over all classes present. Also run your NMS with three thresholds (0.3 / 0.5 / 0.7) on the raw pre-NMS boxes of a few images and save the visualizations to §figures/nms_*.png§, plus 6 success/failure examples to §figures/examples_*.png§.

Write §results.json§:

§§§json
{"model": "fasterrcnn_resnet50_fpn_v2", "dataset": "coco_val2017", "num_images": 500,
 "map50_own": 0.62, "score_threshold": 0.05, "nms_iou": 0.5}
§§§

**Targets:** §num_images >= 300§ and §map50_own >= 0.45§ (COCO AP50 of these models is ≈ 0.55–0.66). If you also compute the official number with §pycocotools§, report it as §map50_pycocotools§ and comment on any gap in the README.`,
        files: ["5-detect.py", "results.json", "figures/"],
        checks: [
          { type: "exists", path: "5-detect.py" },
          { type: "contains", path: "5-detect.py", pattern: "torchvision\\.models\\.detection|from torchvision\\.models import detection", label: "uses a torchvision detector" },
          { type: "contains", path: "5-detect.py", pattern: "2-average_precision", label: "evaluates with your own mAP code" },
          { type: "json_metric", path: "results.json", key: "num_images", op: ">=", value: 300 },
          { type: "json_metric", path: "results.json", key: "map50_own", op: ">=", value: 0.45 },
        ],
      },
      {
        title: "Report: detection landscape and failure analysis",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`Write §written/0-detection_report.md§ (PDF, Markdown or LaTeX accepted; ~2 pages):

1. A diagram/description of Faster R-CNN (backbone, RPN, RoIAlign, heads) and how Mask R-CNN extends it.
2. One paragraph each on one-stage detectors (YOLO/RetinaNet, focal loss) and DETR (set prediction, Hungarian matching).
3. Your mini-project results: mAP@0.5 vs reference, effect of the NMS threshold, and a failure analysis of at least 6 examples grouped into categories (small objects, occlusion, duplicates, localization, confusion).
4. Semantic vs instance vs panoptic segmentation and their metrics.`,
        deliverable: "repo",
        files: ["written/0-detection_report.md"],
        rubric: "report",
        criteria: [
          "Correctly describes the two-stage pipeline including the RPN and RoIAlign",
          "Explains why DETR needs no NMS (one-to-one matching loss)",
          "Reports own mAP@0.5 consistent with results.json and compares to the model's published AP50",
          "Shows the visual effect of three NMS thresholds and explains the trade-off",
          "Failure analysis with ≥ 6 examples grouped into error categories",
        ],
      },
      {
        title: "Soft-NMS",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`Write §100-soft_nms.py§ with §def soft_nms(boxes, scores, sigma=0.5, score_threshold=0.001):§ (Gaussian Soft-NMS, Bodla et al. 2017, arXiv:1704.04503):

- Work on a copy of §scores§. Repeatedly select the remaining box with the highest current score (ties → lower index), append its index and current score to the output, remove it, multiply every other remaining score by $\exp(-\text{IoU}^2/\sigma)$, then drop remaining boxes whose score is below §score_threshold§.
- Return §(keep, kept_scores)§ as NumPy arrays in selection order.

Compare NMS vs Soft-NMS mAP on your mini-project in the README.`,
        files: ["100-soft_nms.py"],
        checks: [
          { type: "defines", path: "100-soft_nms.py", names: ["soft_nms"] },
          {
            type: "py_test", files: ["100-soft_nms.py"], label: "matches reference Gaussian Soft-NMS",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('100-soft_nms')
rng = np.random.default_rng(0)
def iou1(b, B):
    iw = np.clip(np.minimum(b[2], B[:, 2]) - np.maximum(b[0], B[:, 0]), 0, None)
    ih = np.clip(np.minimum(b[3], B[:, 3]) - np.maximum(b[1], B[:, 1]), 0, None)
    inter = iw * ih
    return inter / ((b[2]-b[0])*(b[3]-b[1]) + (B[:, 2]-B[:, 0])*(B[:, 3]-B[:, 1]) - inter)
def ref(boxes, scores, sigma, thr):
    s = scores.astype(float).copy(); rem = np.arange(len(s)); keep = []; ks = []
    while len(rem):
        j = rem[np.argmax(s[rem])]; keep.append(j); ks.append(s[j]); rem = rem[rem != j]
        if len(rem):
            s[rem] *= np.exp(-iou1(boxes[j], boxes[rem]) ** 2 / sigma); rem = rem[s[rem] >= thr]
    return np.array(keep, int), np.array(ks)
xy = rng.uniform(0, 30, (40, 2)); boxes = np.hstack([xy, xy + rng.uniform(5, 20, (40, 2))]); scores = rng.random(40)
s0 = scores.copy()
for sigma, thr in ((0.5, 0.001), (0.3, 0.1)):
    k, ks = m.soft_nms(boxes, scores, sigma, thr)
    rk, rks = ref(boxes, scores, sigma, thr)
    assert np.array_equal(np.asarray(k).astype(int), rk), (sigma, thr)
    assert np.allclose(ks, rks)
assert np.array_equal(scores, s0), "input scores must not be modified"`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── A17
  {
    id: "A17",
    track: "applied",
    phase: PHASE,
    title: "Visualizing & Understanding CNNs",
    days: 2,
    repo: REPO,
    dir: "0x06-visualizing_cnns",
    sources: [
      { course: "CS231N", lectures: "Lec 12–13", topics: "Visualizing and understanding CNNs; generative models preview" },
      { course: "CS230", lectures: "Case-study lectures", topics: "Interpretability and real-world deep learning case studies" },
    ],
    resources: [
      { title: "CS231n notes — Visualizing what ConvNets learn", url: "https://cs231n.github.io/understanding-cnn/" },
      { title: "Zeiler & Fergus, Visualizing and Understanding Convolutional Networks (2013)", url: "https://arxiv.org/abs/1311.2901" },
      { title: "Simonyan et al., Deep Inside Convolutional Networks: saliency maps (2013)", url: "https://arxiv.org/abs/1312.6034" },
      { title: "Selvaraju et al., Grad-CAM (2016)", url: "https://arxiv.org/abs/1610.02391" },
      { title: "Olah et al., Feature Visualization (Distill, 2017)", url: "https://distill.pub/2017/feature-visualization/" },
    ],
    concepts: [
      "First-layer filter visualization",
      "Vanilla gradient saliency maps",
      "Class activation mapping and Grad-CAM",
      "Occlusion sensitivity",
      "Activation maximization / class visualization with regularization",
      "Forward and backward hooks in PyTorch",
    ],
    objectives: [
      "Visualize first-layer filters and explain why they look like Gabor/color-blob detectors",
      "Compute a saliency map as the gradient of a class score w.r.t. input pixels",
      "Derive Grad-CAM from activations and gradients of a convolutional layer",
      "Use forward/backward hooks to capture intermediate activations and gradients",
      "Explain the limitations of saliency methods (sanity checks, noise)",
      "Describe the feature hierarchy of a trained CNN in plain language",
    ],
    requirements: [
      "PyTorch + torchvision; use a pretrained ImageNet model (e.g. resnet18 / vgg16) and your A15 ResNet-18",
      "Files 2- and 100- are NumPy only",
    ],
    quiz: [
      {
        q: "A vanilla saliency map is…",
        options: ["The activations of the last conv layer", "The absolute gradient of the class score w.r.t. the input pixels, max over channels", "The softmax output upsampled", "The first-layer filters"],
        answer: 1,
        why: "Simonyan et al. take |∂S_c/∂x| and reduce over the color channels.",
      },
      {
        q: "In Grad-CAM, the weight α_k of feature map k is…",
        options: ["The max activation of map k", "The spatial average of ∂y_c/∂A^k", "Learned by an extra layer", "1/K for every map"],
        answer: 1,
        why: "Global-average-pooled gradients give the importance of each channel for class c.",
      },
      {
        q: "Why apply ReLU to the Grad-CAM weighted sum?",
        options: ["To make it differentiable", "To keep only features with a positive influence on the class", "To normalize it", "Because activations can be negative"],
        answer: 1,
        why: "Negative regions likely belong to other classes; ReLU keeps the evidence for the target class.",
      },
    ],
    tasks: [
      {
        title: "Saliency maps",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Create §0x06-visualizing_cnns/README.md§ (≥ 100 words, embed your best figures).

Write §0-saliency.py§ with §def saliency_map(model, X, y):§ — §X§ is §(N, 3, H, W)§, §y§ is §(N,)§. Put the model in eval mode, compute the **unnormalized** class scores, backpropagate the sum of the correct-class scores, and return §(N, H, W)§ = max over channels of §|∂s_y/∂X|§. Must not modify the model's parameters or their §.grad§.`,
        files: ["0-saliency.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 100 },
          { type: "defines", path: "0-saliency.py", names: ["saliency_map"] },
          { type: "contains", path: "0-saliency.py", pattern: "requires_grad", label: "enables input gradients" },
          { type: "contains", path: "0-saliency.py", pattern: "\\.backward\\(|torch\\.autograd\\.grad", label: "backpropagates to the input" },
          { type: "contains", path: "0-saliency.py", pattern: "\\.abs\\(|torch\\.abs", label: "absolute value of gradients" },
        ],
      },
      {
        title: "Grad-CAM with hooks",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §1-gradcam.py§ with §def grad_cam(model, target_layer, X, class_idx=None):§

- Register a forward hook on §target_layer§ (e.g. §model.layer4§) to capture activations §A§ §(N, K, h, w)§ and a **full backward hook** (or §tensor.register_hook§) to capture §∂y_c/∂A§. Remove both hooks before returning.
- §class_idx=None§ means the predicted class per image.
- Compute the CAM per image with your NumPy core (task 2) or the equivalent torch ops, upsample to the input size with bilinear interpolation and return a §(N, H, W)§ tensor/array in [0, 1].

Produce §figures/gradcam_*.png§ overlays for ≥ 6 ImageNet images, including two where the model is right for the wrong reason (or wrong).`,
        files: ["1-gradcam.py", "figures/"],
        checks: [
          { type: "defines", path: "1-gradcam.py", names: ["grad_cam"] },
          { type: "contains", path: "1-gradcam.py", pattern: "register_forward_hook", label: "forward hook" },
          { type: "contains", path: "1-gradcam.py", pattern: "register_full_backward_hook|register_hook", label: "backward hook" },
          { type: "contains", path: "1-gradcam.py", pattern: "\\.remove\\(\\)", label: "removes hooks" },
          { type: "exists", path: "figures" },
        ],
      },
      {
        title: "NumPy core: Grad-CAM and filter grids",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §2-viz_np.py§ (NumPy only):

1. §def gradcam_from_activations(activations, gradients):§ — both §(K, h, w)§. Compute $\alpha_k = \frac{1}{hw}\sum_{ij} \partial y/\partial A^k_{ij}$, $\text{cam} = \text{ReLU}(\sum_k \alpha_k A^k)$, then divide by its max so values lie in [0, 1]. If the max is 0, return all zeros. Returns §(h, w)§.
2. §def make_filter_grid(w, pad=1):§ — §w§ is §(F, C, kh, kw)§ conv weights. Min–max normalize **each filter independently** to [0, 1] (a constant filter becomes all zeros), lay filters out row-major on a grid with §cols = ceil(sqrt(F))§, §rows = ceil(F / cols)§, separated by §pad§ zero pixels (no outer border). Return an array of shape §(rows·kh + (rows−1)·pad, cols·kw + (cols−1)·pad, C)§; empty cells are 0.

Use §make_filter_grid§ to visualize the first conv layer of a pretrained ImageNet ResNet and of your A15 CIFAR ResNet-18 side by side (§figures/filters.png§).`,
        files: ["2-viz_np.py", "figures/filters.png"],
        checks: [
          { type: "defines", path: "2-viz_np.py", names: ["gradcam_from_activations", "make_filter_grid"] },
          { type: "exists", path: "figures/filters.png" },
          {
            type: "py_test", files: ["2-viz_np.py"], label: "Grad-CAM core matches reference",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('2-viz_np')
rng = np.random.default_rng(0)
A = rng.random((8, 7, 7)); G = rng.normal(size=(8, 7, 7))
cam = np.maximum(np.tensordot(G.mean(axis=(1, 2)), A, axes=1), 0)
cam = cam / cam.max()
got = np.asarray(m.gradcam_from_activations(A, G))
assert got.shape == (7, 7) and np.allclose(got, cam)
assert got.min() >= 0 and np.isclose(got.max(), 1.0)
z = np.asarray(m.gradcam_from_activations(A, -np.abs(G) - 0.1))
assert z.shape == (7, 7) and np.all(z == 0), "all-negative evidence must give zeros, not NaN"`,
          },
          {
            type: "py_test", files: ["2-viz_np.py"], label: "filter grid layout and per-filter normalization",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('2-viz_np')
rng = np.random.default_rng(1)
w = rng.normal(size=(10, 3, 5, 5)); w[3] = 2.0
g = np.asarray(m.make_filter_grid(w, pad=1))
assert g.shape == (3 * 5 + 2, 4 * 5 + 3, 3), g.shape
for f in range(10):
    r, c = divmod(f, 4)
    tile = g[r * 6:r * 6 + 5, c * 6:c * 6 + 5]
    x = w[f].transpose(1, 2, 0)
    rng_ = x.max() - x.min()
    exp = (x - x.min()) / rng_ if rng_ > 0 else np.zeros_like(x)
    assert np.allclose(tile, exp), f"filter {f}"
assert np.all(g[5, :] == 0) and np.all(g[:, 5] == 0), "padding must be zeros"
assert np.all(g[12:, 12:] == 0), "empty cells must be zeros"
assert np.asarray(m.make_filter_grid(rng.normal(size=(4, 1, 3, 3)), pad=0)).shape == (6, 6, 1)`,
          },
        ],
      },
      {
        title: "Class visualization by gradient ascent",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §3-class_visualization.py§ with §def class_visualization(model, target_class, steps=200, lr=25.0, l2_reg=1e-3, blur_every=10, max_jitter=16, seed=0):§ that starts from a random image and performs gradient **ascent** on $s_c(I) - \lambda\|I\|_2^2$, with random jitter (§torch.roll§) and periodic Gaussian blur as regularizers, clamping pixels to the valid normalized range. Return the final image tensor §(1, 3, 224, 224)§. Save §figures/classviz_*.png§ for ≥ 4 ImageNet classes.`,
        files: ["3-class_visualization.py"],
        checks: [
          { type: "defines", path: "3-class_visualization.py", names: ["class_visualization"] },
          { type: "contains", path: "3-class_visualization.py", pattern: "torch\\.roll", label: "jitter regularization" },
          { type: "contains", path: "3-class_visualization.py", pattern: "\\.backward\\(|autograd\\.grad", label: "gradient w.r.t. the image" },
          { type: "contains", path: "3-class_visualization.py", pattern: "clamp", label: "clamps pixel values" },
        ],
      },
      {
        title: "Executed notebook",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Commit §4-visualize.ipynb§, **executed**, that reproduces every figure of this project end-to-end: first-layer filters (ImageNet vs your CIFAR model), saliency maps, Grad-CAM for layers §layer2§, §layer3§ and §layer4§ of the same image (comment on resolution vs semantics), class visualizations, and the top-9 image patches that maximally activate 4 chosen channels of §layer3§ on 1 000 validation images.`,
        files: ["4-visualize.ipynb"],
        checks: [
          { type: "notebook_executed", path: "4-visualize.ipynb" },
          { type: "contains", path: "4-visualize.ipynb", pattern: "layer2", label: "multi-layer Grad-CAM" },
          { type: "contains", path: "4-visualize.ipynb", pattern: "saliency", label: "saliency maps" },
        ],
      },
      {
        title: "Medium post: what do CNN filters actually learn?",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Publish a one-page post (Medium or your blog, ~800–1 200 words) titled along the lines of *"What do the filters in a trained CNN actually learn?"*, illustrated **only with figures you produced** in this project. Submit the URL.

Walk from layer 1 to the classifier: what early filters detect, how features become more abstract and invariant with depth, what saliency/Grad-CAM reveal and where they mislead (cite Adebayo et al., "Sanity Checks for Saliency Maps", arXiv:1810.03292), and one surprising finding from your own experiments.`,
        deliverable: "link",
        rubric: "summary",
        criteria: [
          "Uses the learner's own figures for filters, saliency, Grad-CAM and class visualizations",
          "Correctly explains the low → high level feature hierarchy with concrete examples",
          "Explains how Grad-CAM is computed in one or two accurate sentences",
          "Discusses at least one limitation of saliency methods, citing the sanity-checks paper",
          "Reports one non-obvious observation from the learner's own experiments",
        ],
      },
      {
        title: "Occlusion sensitivity",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`Write §100-occlusion.py§ (NumPy only) with §def occlusion_sensitivity(predict_fn, image, target, patch=8, stride=8, fill=0.0):§

- §image§ is §(C, H, W)§; §predict_fn§ maps a batch §(B, C, H, W)§ to probabilities §(B, K)§.
- For every patch position $(i, j)$ on the grid with top-left corner §(i*stride, j*stride)§, §H' = (H − patch)//stride + 1§ rows and §W'§ columns, set that §patch × patch§ square (all channels) to §fill§.
- Return the §(H', W')§ map of §p(target | original) − p(target | occluded)§. Evaluate all occluded images in **one** batched call to §predict_fn§.

Wrap your PyTorch model as §predict_fn§ and compare occlusion maps with Grad-CAM in the README (Zeiler & Fergus, 2013).`,
        files: ["100-occlusion.py"],
        checks: [
          { type: "defines", path: "100-occlusion.py", names: ["occlusion_sensitivity"] },
          {
            type: "py_test", files: ["100-occlusion.py"], label: "matches reference occlusion map, single batched call",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('100-occlusion')
rng = np.random.default_rng(0)
C, H, W, K = 2, 12, 16, 4
Wt = rng.normal(size=(C * H * W, K)) * 0.1
calls = []
def predict(batch):
    calls.append(len(batch))
    z = batch.reshape(len(batch), -1) @ Wt; z -= z.max(1, keepdims=True)
    p = np.exp(z); return p / p.sum(1, keepdims=True)
img = rng.normal(size=(C, H, W))
got = np.asarray(m.occlusion_sensitivity(predict, img, 2, patch=4, stride=4, fill=0.0))
assert len(calls) <= 2, "evaluate occluded images in one batched call"
p0 = predict(img[None])[0, 2]
Ho, Wo = (H - 4) // 4 + 1, (W - 4) // 4 + 1
exp = np.zeros((Ho, Wo))
for i in range(Ho):
    for j in range(Wo):
        x = img.copy(); x[:, i*4:i*4+4, j*4:j*4+4] = 0.0
        exp[i, j] = p0 - predict(x[None])[0, 2]
assert got.shape == (Ho, Wo) and np.allclose(got, exp)
got2 = np.asarray(m.occlusion_sensitivity(predict, img, 1, patch=6, stride=3, fill=0.5))
assert got2.shape == ((H - 6) // 3 + 1, (W - 6) // 3 + 1)`,
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── A18
  {
    id: "A18",
    track: "applied",
    phase: PHASE,
    title: "Vision Transformers & Self-Supervised Learning",
    days: 2,
    repo: REPO,
    dir: "0x07-vit_ssl",
    sources: [
      { course: "CS231N", lectures: "Later lectures (Attention & Transformers, Self-supervised learning)", topics: "Self-attention for vision, ViT, contrastive and masked self-supervised learning" },
    ],
    resources: [
      { title: "Dosovitskiy et al., An Image is Worth 16x16 Words (ViT, 2020)", url: "https://arxiv.org/abs/2010.11929" },
      { title: "Vaswani et al., Attention Is All You Need (2017)", url: "https://arxiv.org/abs/1706.03762" },
      { title: "Chen et al., A Simple Framework for Contrastive Learning (SimCLR, 2020)", url: "https://arxiv.org/abs/2002.05709" },
      { title: "van den Oord et al., Representation Learning with Contrastive Predictive Coding (InfoNCE, 2018)", url: "https://arxiv.org/abs/1807.03748" },
      { title: "He et al., Masked Autoencoders Are Scalable Vision Learners (2021)", url: "https://arxiv.org/abs/2111.06377" },
      { title: "Dive into Deep Learning — Transformers for Vision", url: "https://d2l.ai/chapter_attention-mechanisms-and-transformers/vision-transformer.html" },
    ],
    concepts: [
      "Patch embedding and the [CLS] token",
      "Scaled dot-product and multi-head self-attention",
      "Learned positional embeddings",
      "Inductive bias: CNNs vs ViTs and the role of data scale",
      "Contrastive learning: positives, negatives, temperature",
      "InfoNCE / NT-Xent loss",
      "Linear probing as an evaluation of representations",
    ],
    objectives: [
      "Turn an image into a sequence of patch tokens and explain the resulting sequence length",
      "Implement multi-head self-attention and explain the 1/√d scaling",
      "Explain why ViTs need more data or stronger augmentation than CNNs",
      "Write the InfoNCE loss and explain the role of the temperature",
      "Evaluate learned representations with a linear probe",
    ],
    requirements: [
      "Files 0-, 1-, 2- NumPy only",
      "3-vit.py: PyTorch; attention written by you (no nn.MultiheadAttention, nn.Transformer*, timm, or F.scaled_dot_product_attention)",
    ],
    quiz: [
      {
        q: "A 32×32 RGB image split into 4×4 patches gives how many tokens (before adding [CLS])?",
        options: ["16", "48", "64", "256"],
        answer: 2,
        why: "(32/4)² = 64 patches, each a 4·4·3 = 48-dim vector.",
      },
      {
        q: "Why are attention logits divided by √d_k?",
        options: ["To make attention sparse", "To keep the variance of dot products ~1 so softmax does not saturate", "To normalize the values", "It is required for causality"],
        answer: 1,
        why: "Dot products of d_k-dim random vectors have variance ~d_k; scaling avoids tiny gradients from a saturated softmax.",
      },
      {
        q: "In SimCLR's NT-Xent loss with batch size N, how many negatives does each anchor have?",
        options: ["1", "N − 1", "2N − 2", "2N"],
        answer: 2,
        why: "2N augmented views; excluding the anchor itself and its positive leaves 2N − 2 negatives.",
      },
      {
        q: "Lowering the InfoNCE temperature τ…",
        options: ["Makes the softmax flatter", "Sharpens the distribution and puts more weight on hard negatives", "Has no effect after normalization", "Removes the need for negatives"],
        answer: 1,
        why: "Smaller τ scales up similarities, so the hardest negatives dominate the gradient.",
      },
    ],
    tasks: [
      {
        title: "Patchify",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Create §0x07-vit_ssl/README.md§ (≥ 100 words).

Write §0-patchify.py§ with §def patchify(images, patch_size):§ (NumPy only, no loops):

- §images§: §(N, C, H, W)§ with §H§ and §W§ divisible by §patch_size§ (raise §ValueError§ otherwise).
- Return §(N, (H/p)·(W/p), C·p·p)§. Patches are ordered **row-major** over the grid (left→right, then top→bottom) and each patch is flattened in §(C, p, p)§ order — i.e. exactly what a §Conv2d(C, D, kernel_size=p, stride=p)§ sees.

§§§python
>>> patchify(np.zeros((8, 3, 32, 32)), 4).shape
(8, 64, 48)
§§§`,
        files: ["0-patchify.py", "README.md"],
        checks: [
          { type: "readme", path: "README.md", minWords: 100 },
          { type: "defines", path: "0-patchify.py", names: ["patchify"] },
          { type: "not_contains", path: "0-patchify.py", ...NO_LOOP },
          {
            type: "py_test", files: ["0-patchify.py"], label: "patch order and flattening",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('0-patchify')
rng = np.random.default_rng(0)
x = rng.normal(size=(2, 3, 8, 12)); p = 4
out = np.asarray(m.patchify(x, p))
assert out.shape == (2, 6, 48), out.shape
k = 0
for i in range(2):
    for j in range(3):
        assert np.allclose(out[:, k], x[:, :, i*p:(i+1)*p, j*p:(j+1)*p].reshape(2, -1)), f"patch {k}"
        k += 1
w = rng.normal(size=(5, 3, p, p))
conv = np.einsum('ncpq,dcpq->nd', x[:, :, 4:8, 8:12], w)
assert np.allclose(out[:, 5] @ w.reshape(5, -1).T, conv), "must match a stride-p conv patch embedding"
try:
    m.patchify(x, 5); raise AssertionError("expected ValueError")
except ValueError:
    pass`,
          },
        ],
      },
      {
        title: "Multi-head self-attention in NumPy",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §1-attention_np.py§ with §def multi_head_self_attention(x, Wq, Wk, Wv, Wo, num_heads):§ (NumPy only, no loops over batch, heads or tokens):

- §x§: §(N, T, D)§; all four weight matrices §(D, D)§, no biases; §D % num_heads == 0§, §d_h = D / num_heads§.
- $Q = xW_q$, $K = xW_k$, $V = xW_v$; split the last dimension into heads (head §h§ uses columns §h·d_h:(h+1)·d_h§); per head $\text{softmax}(QK^\top/\sqrt{d_h})V$ with a numerically stable softmax over keys; concatenate heads in order and multiply by $W_o$.
- Return §(out, attn)§ with §out§ §(N, T, D)§ and §attn§ §(N, num_heads, T, T)§ (rows sum to 1).`,
        files: ["1-attention_np.py"],
        checks: [
          { type: "defines", path: "1-attention_np.py", names: ["multi_head_self_attention"] },
          { type: "not_contains", path: "1-attention_np.py", ...NO_LOOP },
          {
            type: "py_test", files: ["1-attention_np.py"], label: "matches per-head loop reference",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('1-attention_np')
rng = np.random.default_rng(0)
N, T, D, H = 2, 5, 12, 3; dh = D // H
x = rng.normal(size=(N, T, D)); Wq, Wk, Wv, Wo = (rng.normal(size=(D, D)) / np.sqrt(D) for _ in range(4))
out, attn = m.multi_head_self_attention(x, Wq, Wk, Wv, Wo, H)
Q, K, V = x @ Wq, x @ Wk, x @ Wv
heads = []; A = np.zeros((N, H, T, T))
for h in range(H):
    q, k, v = Q[..., h*dh:(h+1)*dh], K[..., h*dh:(h+1)*dh], V[..., h*dh:(h+1)*dh]
    s = q @ k.transpose(0, 2, 1) / np.sqrt(dh); s -= s.max(-1, keepdims=True)
    a = np.exp(s); a /= a.sum(-1, keepdims=True); A[:, h] = a; heads.append(a @ v)
ref = np.concatenate(heads, -1) @ Wo
assert out.shape == (N, T, D) and attn.shape == (N, H, T, T)
assert np.allclose(attn, A) and np.allclose(out, ref)
o2, a2 = m.multi_head_self_attention(x * 100, Wq, Wk, Wv, Wo, H)
assert np.all(np.isfinite(o2)) and np.allclose(a2.sum(-1), 1), "softmax must be numerically stable"`,
          },
        ],
      },
      {
        title: "InfoNCE / NT-Xent loss",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §2-info_nce.py§ with §def info_nce_loss(z1, z2, temperature=0.1):§ (NumPy only, vectorized) — the SimCLR NT-Xent loss:

- §z1§, §z2§: §(N, d)§ embeddings of two augmented views; row §i§ of §z1§ and row §i§ of §z2§ form a positive pair.
- L2-normalize each row, stack into §z§ §(2N, d)§ (§z1§ first), compute §sim = z @ z.T / temperature§, exclude self-similarity (diagonal) from the softmax denominator.
- For anchor §k§ the positive is §(k + N) mod 2N§; loss = mean over all §2N§ anchors of $-\log \frac{\exp(\text{sim}_{k,pos})}{\sum_{j \ne k}\exp(\text{sim}_{kj})}$, computed with a stable log-sum-exp.
- Return a Python float.`,
        files: ["2-info_nce.py"],
        checks: [
          { type: "defines", path: "2-info_nce.py", names: ["info_nce_loss"] },
          {
            type: "py_test", files: ["2-info_nce.py"], label: "matches reference and behaves sensibly",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('2-info_nce')
rng = np.random.default_rng(0)
def ref(z1, z2, t):
    z = np.concatenate([z1, z2]); z = z / np.linalg.norm(z, axis=1, keepdims=True)
    n = len(z1); s = z @ z.T / t; np.fill_diagonal(s, -np.inf)
    mx = s.max(1, keepdims=True); lse = mx[:, 0] + np.log(np.exp(s - mx).sum(1))
    pos = s[np.arange(2 * n), (np.arange(2 * n) + n) % (2 * n)]
    return float(np.mean(lse - pos))
z1 = rng.normal(size=(8, 16)); z2 = z1 + 0.3 * rng.normal(size=(8, 16))
for t in (0.1, 0.5, 1.0):
    assert np.isclose(m.info_nce_loss(z1, z2, t), ref(z1, z2, t), rtol=1e-7), t
assert np.isclose(m.info_nce_loss(3 * z1, 0.5 * z2, 0.2), ref(z1, z2, 0.2)), "rows must be L2-normalized"
assert m.info_nce_loss(z1, z1, 0.1) < m.info_nce_loss(z1, rng.normal(size=(8, 16)), 0.1)
v = m.info_nce_loss(z1, z2, 0.01)
assert np.isfinite(v), "use a stable log-sum-exp"
assert np.isclose(v, ref(z1, z2, 0.01), rtol=1e-6)`,
          },
        ],
      },
      {
        title: "ViT from scratch on CIFAR-10",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Write §3-vit.py§ (PyTorch) with §class PatchEmbed(nn.Module)§, §class Attention(nn.Module)§ (your own Q/K/V projections, scaling and softmax), §class Block(nn.Module)§ (pre-norm: §x + attn(LN(x))§, §x + MLP(LN(x))§ with GELU) and §class ViT(nn.Module)§ (§[CLS]§ token, learned positional embeddings, final LN, linear head).

Suggested small config for 32×32 inputs: patch 4, dim 192–256, depth 6–8, heads 4–8, MLP ratio 2–4; train with AdamW, warm-up + cosine, label smoothing and RandAugment/random crop+flip; ≤ ~1.5 GPU-hours.

Write §results.json§:

§§§json
{"vit_test_accuracy": 0.80, "vit_num_params": 4800000, "epochs": 100,
 "config": {"patch": 4, "dim": 256, "depth": 6, "heads": 8}, "resnet18_test_accuracy": 0.946}
§§§

**Target:** §vit_test_accuracy >= 0.72§. Copy your A15 ResNet-18 accuracy for comparison.`,
        files: ["3-vit.py", "results.json"],
        checks: [
          { type: "defines", path: "3-vit.py", names: ["PatchEmbed", "Attention", "Block", "ViT"] },
          { type: "not_contains", path: "3-vit.py", pattern: "nn\\.MultiheadAttention|nn\\.Transformer|scaled_dot_product_attention|import timm", label: "attention written from scratch" },
          { type: "contains", path: "3-vit.py", pattern: "softmax", label: "explicit softmax over attention logits" },
          { type: "contains", path: "3-vit.py", pattern: "cls_token|cls", label: "[CLS] token" },
          { type: "json_metric", path: "results.json", key: "vit_test_accuracy", op: ">=", value: 0.72 },
        ],
      },
      {
        title: "Note: CNN vs ViT inductive bias and SSL",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`Write §written/0-vit_ssl_notes.md§ (PDF, Markdown or LaTeX accepted; ~1 page): compare the inductive biases of CNNs and ViTs (locality, translation equivariance, global receptive field) using your ResNet-18 vs ViT results; explain the ViT paper's finding about data scale (ImageNet vs JFT-300M); and summarize contrastive (SimCLR/MoCo) vs masked (MAE) self-supervised learning, including what the InfoNCE loss optimizes and the role of temperature.`,
        deliverable: "repo",
        files: ["written/0-vit_ssl_notes.md"],
        rubric: "summary",
        criteria: [
          "Contrasts locality/translation equivariance of convolutions with global attention",
          "Uses the learner's own ResNet-18 vs ViT numbers to support the argument",
          "Correctly states the ViT data-scale result (ViT beats CNNs only with large-scale pre-training)",
          "Explains InfoNCE as classifying the positive among negatives and the effect of temperature",
          "Distinguishes contrastive from masked-image-modeling SSL",
        ],
      },
      {
        title: "SimCLR pre-training + linear probe",
        type: "advanced",
        kind: "code",
        points: 2,
        body: md`Write §100-simclr.py§: pre-train a small ResNet (e.g. your ResNet-18 with the FC removed + 2-layer projection head) on CIFAR-10 **without labels** using SimCLR augmentations (random resized crop, flip, color jitter, grayscale) and the NT-Xent loss (port your NumPy version to torch), then freeze the encoder and train a linear classifier on the features. Add to §results.json§:

§§§json
{"simclr": {"pretrain_epochs": 100, "batch_size": 512, "temperature": 0.5,
            "linear_probe_accuracy": 0.80, "random_init_probe_accuracy": 0.35}}
§§§

**Target:** §simclr.linear_probe_accuracy >= 0.65§, with the random-init encoder probe as a baseline.`,
        files: ["100-simclr.py"],
        checks: [
          { type: "exists", path: "100-simclr.py" },
          { type: "contains", path: "100-simclr.py", pattern: "ColorJitter", label: "SimCLR augmentations" },
          { type: "json_metric", path: "results.json", key: "simclr.linear_probe_accuracy", op: ">=", value: 0.65 },
          { type: "json_metric", path: "results.json", key: "simclr.random_init_probe_accuracy", op: ">", value: 0 },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────── A19
  {
    id: "A19",
    track: "applied",
    phase: PHASE,
    title: "Phase 2 Project: End-to-End Deployed Vision App",
    days: 4,
    repo: REPO,
    dir: "0x08-vision_app",
    sources: [
      { course: "CS230", lectures: "Full-cycle deep learning project lecture + remaining case studies", topics: "Problem framing, data, iteration, error analysis, deployment" },
    ],
    resources: [
      { title: "CS231n notes — Transfer Learning", url: "https://cs231n.github.io/transfer-learning/" },
      { title: "Andrej Karpathy — A Recipe for Training Neural Networks", url: "http://karpathy.github.io/2019/04/25/recipe/" },
      { title: "Gradio documentation", url: "https://www.gradio.app/docs" },
      { title: "FastAPI documentation", url: "https://fastapi.tiangolo.com/" },
      { title: "Hugging Face Spaces documentation", url: "https://huggingface.co/docs/hub/spaces" },
      { title: "Guo et al., On Calibration of Modern Neural Networks (2017)", url: "https://arxiv.org/abs/1706.04599" },
    ],
    concepts: [
      "Problem framing and choosing a single evaluation metric",
      "Dataset curation, stratified splits and leakage",
      "Transfer learning: feature extraction vs fine-tuning",
      "Error analysis and confusion matrices",
      "Macro-F1 and calibration (ECE)",
      "Model serving (FastAPI / Gradio), latency and packaging",
      "Debugging playbook as a living document",
    ],
    objectives: [
      "Frame a real image task with a clear metric and a baseline",
      "Build leak-free stratified splits and document the dataset",
      "Fine-tune a pretrained CNN/ViT and beat a simple baseline by a measured margin",
      "Run a structured error analysis and decide what to fix next",
      "Serve the model behind an HTTP endpoint or Gradio demo with a public URL",
      "Maintain a deep-learning debugging playbook",
    ],
    requirements: [
      "PyTorch + torchvision (or timm) for training; pretrained weights allowed",
      "Dataset of your choice with ≥ 3 classes and ≥ 500 test images (no MNIST / CIFAR / Fashion-MNIST)",
      "1-splits.py and 3-metrics.py are NumPy only",
      "The deployed URL must stay live until the project is reviewed",
    ],
    quiz: [
      {
        q: "Your dataset has near-duplicate photos of the same object. Splitting images uniformly at random will most likely…",
        options: ["Reduce variance", "Leak information and overestimate test accuracy", "Make training slower", "Have no effect"],
        answer: 1,
        why: "Near-duplicates across train and test let the model memorize; split by group (object, user, session) instead.",
      },
      {
        q: "With a small dataset similar to ImageNet, the best first approach is usually…",
        options: ["Train a big model from scratch", "Freeze a pretrained backbone and train a linear head, then fine-tune with a small LR", "Use kNN on raw pixels", "Fine-tune all layers with a large LR"],
        answer: 1,
        why: "Pretrained features transfer well; full fine-tuning with a small LR comes after the head is trained.",
      },
      {
        q: "Why report macro-F1 instead of accuracy on an imbalanced dataset?",
        options: ["It is always higher", "It weights every class equally, so poor minority-class performance is visible", "It ignores false positives", "It is easier to compute"],
        answer: 1,
        why: "Accuracy is dominated by majority classes; macro-F1 averages per-class F1.",
      },
      {
        q: "A model has 90% accuracy but its average confidence on test is 99%. It is…",
        options: ["Well calibrated", "Over-confident (high ECE)", "Under-confident", "Overfitting the test set"],
        answer: 1,
        why: "Confidence exceeds accuracy; temperature scaling is a standard fix.",
      },
    ],
    tasks: [
      {
        title: "Project README with live deployment URL",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §0x08-vision_app/README.md§ (≥ 400 words) with these exact second-level sections:

- §## Problem§ — the task, users, the single metric you optimize and why.
- §## Dataset§ — source, license, size per split and per class, how splits were made.
- §## Results§ — baseline vs final model table (macro-F1, accuracy, ECE, latency).
- §## Error analysis§ — confusion matrix and top error categories.
- §## Demo§ — the **public URL** of your deployed app (Hugging Face Spaces, Render, Fly.io, Railway, ...), plus a screenshot §figures/demo.png§.`,
        files: ["README.md", "figures/demo.png"],
        checks: [
          { type: "readme", path: "README.md", minWords: 400 },
          { type: "contains", path: "README.md", pattern: "^## Dataset", label: "Dataset section" },
          { type: "contains", path: "README.md", pattern: "^## Error analysis", label: "Error analysis section" },
          { type: "contains", path: "README.md", pattern: "^## Demo[\\s\\S]*https?://\\S+", label: "Demo section with a public URL" },
          { type: "exists", path: "figures/demo.png" },
        ],
      },
      {
        title: "Stratified, leak-free splits",
        type: "mandatory",
        kind: "code",
        points: 1,
        body: md`Write §1-splits.py§ (NumPy only) with §def stratified_split(labels, val_frac=0.15, test_frac=0.15, seed=0):§

- §labels§: §(N,)§ integer array. For each class with §n_c§ examples, put §round(n_c * test_frac)§ in test, §round(n_c * val_frac)§ in val and the rest in train, choosing which examples go where with §np.random.default_rng(seed)§.
- Return §(train_idx, val_idx, test_idx)§: disjoint sorted integer arrays covering §range(N)§. Same seed ⇒ same split.

Use it (or a group-aware variant if your data has near-duplicates — explain in the README) to build your splits, and save them to §splits.json§.`,
        files: ["1-splits.py", "splits.json"],
        checks: [
          { type: "defines", path: "1-splits.py", names: ["stratified_split"] },
          { type: "exists", path: "splits.json" },
          {
            type: "py_test", files: ["1-splits.py"], label: "disjoint, complete, stratified, deterministic",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('1-splits')
rng = np.random.default_rng(0)
labels = np.repeat(np.arange(4), [400, 100, 37, 63]); rng.shuffle(labels)
tr, va, te = (np.asarray(a).astype(int) for a in m.stratified_split(labels, 0.15, 0.2, seed=3))
allidx = np.concatenate([tr, va, te])
assert len(allidx) == len(labels) and len(np.unique(allidx)) == len(labels), "splits must be disjoint and complete"
for a in (tr, va, te): assert np.array_equal(a, np.sort(a)), "indices must be sorted"
for c, n in zip(range(4), (400, 100, 37, 63)):
    assert abs((labels[te] == c).sum() - n * 0.2) <= 1, f"class {c} test count"
    assert abs((labels[va] == c).sum() - n * 0.15) <= 1, f"class {c} val count"
tr2, va2, te2 = m.stratified_split(labels, 0.15, 0.2, seed=3)
assert np.array_equal(te, te2) and np.array_equal(va, va2), "same seed must give the same split"
te3 = np.asarray(m.stratified_split(labels, 0.15, 0.2, seed=4)[2])
assert not np.array_equal(te, te3), "seed must change the split"`,
          },
        ],
      },
      {
        title: "Training with transfer learning",
        type: "mandatory",
        kind: "code",
        points: 3,
        body: md`Write §2-train.py§ that

1. trains a **baseline** (linear probe on frozen pretrained features, or a small CNN from scratch),
2. fine-tunes a pretrained backbone (ResNet / EfficientNet / ConvNeXt / ViT) with augmentation, a validation-based early stop and a LR schedule,
3. optionally fits a temperature on the validation set (temperature scaling),
4. evaluates **once** on the test split with your §3-metrics.py§ and writes §results.json§:

§§§json
{"test_macro_f1": 0.87, "test_accuracy": 0.89, "baseline_macro_f1": 0.71,
 "test_ece": 0.03, "num_test_examples": 812, "num_classes": 6, "backbone": "convnext_tiny"}
§§§

**Targets:** §num_test_examples >= 500§, §test_macro_f1 >= 0.75§, and the fine-tuned model must beat the baseline (state the gap in the README).`,
        files: ["2-train.py", "results.json"],
        checks: [
          { type: "exists", path: "2-train.py" },
          { type: "contains", path: "2-train.py", pattern: "3-metrics", label: "uses your metrics module" },
          { type: "json_metric", path: "results.json", key: "num_test_examples", op: ">=", value: 500 },
          { type: "json_metric", path: "results.json", key: "test_macro_f1", op: ">=", value: 0.75 },
          { type: "json_metric", path: "results.json", key: "baseline_macro_f1", op: ">", value: 0 },
        ],
      },
      {
        title: "Evaluation metrics in NumPy",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §3-metrics.py§ (NumPy only, no loops over samples):

- §def confusion_matrix(y_true, y_pred, num_classes):§ → §(K, K)§ int array, rows = true class, columns = predicted.
- §def macro_f1(y_true, y_pred, num_classes):§ → float: mean over **all** §num_classes§ of per-class $F_1 = 2PR/(P+R)$, with $F_1 = 0$ when $P + R = 0$ (including classes with no support and no predictions).
- §def expected_calibration_error(probs, labels, n_bins=15):§ — §probs§ §(N, K)§. Confidence = max probability, prediction = argmax. Bins are equal-width on (0, 1]: bin §b§ holds confidences in §(b/n_bins, (b+1)/n_bins]§. Return $\sum_b \frac{|B_b|}{N}\,|\text{acc}(B_b) - \text{conf}(B_b)|$ over non-empty bins.`,
        files: ["3-metrics.py"],
        checks: [
          { type: "defines", path: "3-metrics.py", names: ["confusion_matrix", "macro_f1", "expected_calibration_error"] },
          { type: "not_contains", path: "3-metrics.py", pattern: "sklearn|torch", label: "NumPy only" },
          {
            type: "py_test", files: ["3-metrics.py"], label: "confusion matrix, macro-F1 and ECE match reference",
            code: String.raw`import numpy as np
from importlib import import_module
m = import_module('3-metrics')
rng = np.random.default_rng(0)
K = 5; yt = rng.integers(0, 4, 300); yp = np.where(rng.random(300) < 0.7, yt, rng.integers(0, 4, 300))
cm = np.asarray(m.confusion_matrix(yt, yp, K))
ref = np.zeros((K, K), int)
for a, b in zip(yt, yp): ref[a, b] += 1
assert np.array_equal(cm, ref)
f1s = []
for k in range(K):
    tp = ref[k, k]; P = tp / ref[:, k].sum() if ref[:, k].sum() else 0.0; R = tp / ref[k].sum() if ref[k].sum() else 0.0
    f1s.append(2 * P * R / (P + R) if P + R > 0 else 0.0)
assert np.isclose(m.macro_f1(yt, yp, K), np.mean(f1s)), "average over all num_classes, F1=0 for empty classes"
assert np.isclose(m.macro_f1(yt, yt, 4), 1.0)
logits = rng.normal(size=(500, 4)) * 2; probs = np.exp(logits); probs /= probs.sum(1, keepdims=True)
labels = rng.integers(0, 4, 500)
conf = probs.max(1); pred = probs.argmax(1); ece = 0.0
for b in range(10):
    sel = (conf > b / 10) & (conf <= (b + 1) / 10)
    if sel.any(): ece += sel.mean() * abs((pred[sel] == labels[sel]).mean() - conf[sel].mean())
assert np.isclose(m.expected_calibration_error(probs, labels, n_bins=10), ece)
onehot = np.eye(4)[labels]
assert np.isclose(m.expected_calibration_error(onehot, labels), 0.0)`,
          },
        ],
      },
      {
        title: "Serving: FastAPI or Gradio app",
        type: "mandatory",
        kind: "code",
        points: 2,
        body: md`Write §app.py§ that loads the trained weights once at start-up and exposes §def predict(image)§ returning the top-3 classes with calibrated probabilities, served either as

- a **FastAPI** app with §POST /predict§ (multipart image upload → JSON) and §GET /health§, or
- a **Gradio** §Interface§/§Blocks§ demo (with 3+ example images).

Pin dependencies in §requirements.txt§ (§torch§, §torchvision§, §fastapi§/§gradio§ ...). Measure latency over 100 requests on the deployed CPU hardware and add §p50_latency_ms§ and §p95_latency_ms§ to §results.json§ (**target:** §p50_latency_ms <= 500§). Deploy it and put the URL in the README.`,
        files: ["app.py", "requirements.txt"],
        checks: [
          { type: "defines", path: "app.py", names: ["predict"] },
          { type: "contains", path: "app.py", pattern: "fastapi|FastAPI|gradio", label: "FastAPI or Gradio" },
          { type: "contains", path: "requirements.txt", pattern: "torch", label: "pins torch" },
          { type: "contains", path: "requirements.txt", pattern: "fastapi|gradio", label: "pins the serving framework" },
          { type: "json_metric", path: "results.json", key: "p50_latency_ms", op: "<=", value: 500 },
        ],
      },
      {
        title: "Deep learning debugging playbook",
        type: "mandatory",
        kind: "written",
        points: 2,
        body: md`Write §written/debugging_playbook.md§ (Markdown preferred; PDF or LaTeX accepted). Start from your A14 checklist and turn it into the **living debugging playbook** you will keep updating in Phases 3–5 (Phase 2 deliverable).

Structure: (1) pre-flight checks, (2) a symptom → diagnosis → fix table, (3) data bugs, (4) optimization bugs, (5) generalization issues, (6) deployment issues (preprocessing mismatch between training and serving, dtype/device, eval mode). Each section must contain at least one **war story from Phase 2** (A11–A19) with the plot/number that revealed the bug.`,
        deliverable: "repo",
        files: ["written/debugging_playbook.md"],
        rubric: "report",
        criteria: [
          "Contains all six sections, including deployment-specific issues such as train/serve preprocessing skew",
          "Symptom → diagnosis → fix table with at least 8 rows",
          "At least four concrete war stories from A11–A19 with evidence (plot or metric)",
          "Recommendations are actionable (specific checks, commands or thresholds), not generic advice",
          "Clearly extends, not merely copies, the A14 training checklist",
        ],
      },
      {
        title: "Project write-up (Medium)",
        type: "mandatory",
        kind: "written",
        points: 1,
        body: md`Publish a post (Medium or blog, 1 000–1 500 words) about your project as a full-cycle deep learning case study in the style of the CS230 project lecture: problem framing, data, baseline, iterations (what you tried, in order, and the metric after each), error analysis, deployment, and what you'd do with 10× more time. Link the live demo. Submit the URL.`,
        deliverable: "link",
        rubric: "report",
        criteria: [
          "States the metric, the baseline and the final number consistently with results.json",
          "Describes at least three iterations in order with their measured effect",
          "Includes a confusion matrix or error-category breakdown and draws a decision from it",
          "Links the working demo and describes the serving setup",
          "Discusses limitations, dataset bias or failure modes honestly",
        ],
      },
      {
        title: "ONNX export and quantization",
        type: "advanced",
        kind: "code",
        points: 1,
        body: md`Write §100-export.py§ that exports the model to ONNX (§torch.onnx.export§, dynamic batch axis), verifies ONNX Runtime outputs match PyTorch (max abs diff < 1e-4 on 32 test images), applies dynamic or static INT8 quantization (ONNX Runtime quantization tools), and benchmarks CPU latency and accuracy for all three variants. Add to §results.json§:

§§§json
{"onnx": {"max_abs_diff": 2e-6, "fp32_p50_ms": 38.0, "int8_p50_ms": 15.0,
          "int8_test_macro_f1": 0.86}}
§§§`,
        files: ["100-export.py"],
        checks: [
          { type: "contains", path: "100-export.py", pattern: "torch\\.onnx\\.export", label: "exports to ONNX" },
          { type: "contains", path: "100-export.py", pattern: "onnxruntime", label: "verifies with ONNX Runtime" },
          { type: "json_metric", path: "results.json", key: "onnx.max_abs_diff", op: "<", value: 0.0001 },
          { type: "json_metric", path: "results.json", key: "onnx.int8_test_macro_f1", op: ">", value: 0 },
        ],
      },
    ],
  },
];
