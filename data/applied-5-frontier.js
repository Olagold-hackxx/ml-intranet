// Applied track — Phase 5: Frontier & Systems (CS336, LLM Evaluation & Scaling, Capstone).
// Bodies use the `md` tag: String.raw, with \` -> backtick and ~~~ -> ``` (so Markdown code survives).
const md = (s, ...v) => String.raw(s, ...v).replace(/\\`/g, "`").replace(/~~~/g, "```");
const py = String.raw;

const TRACK = "applied";
const PHASE = "Phase 5 — Frontier & Systems";
const REPO = "ml-frontier";
const CAP = "ml-capstone";

export default [
  // ───────────────────────────────────────────────────────────── A40
  {
    id: "A40",
    track: TRACK,
    phase: PHASE,
    title: "Byte-Pair Encoding Tokenizer from Scratch",
    days: 3,
    repo: REPO,
    dir: "0x00-bpe_tokenizer",
    sources: [
      { course: "CS336", lectures: "Lec 1–2", topics: "Course overview, tokenization (characters, bytes, words, BPE), data pipelines, PyTorch & resource accounting" },
    ],
    resources: [
      { title: "CS336 Spring 2025 course site (assignment 1: BPE tokenizer)", url: "https://stanford-cs336.github.io/spring2025/" },
      { title: "Sennrich, Haddow & Birch 2015 — Neural Machine Translation of Rare Words with Subword Units", url: "https://arxiv.org/abs/1508.07909" },
      { title: "Karpathy — minbpe (minimal byte-level BPE)", url: "https://github.com/karpathy/minbpe" },
      { title: "OpenAI tiktoken", url: "https://github.com/openai/tiktoken" },
      { title: "Eldan & Li 2023 — TinyStories", url: "https://arxiv.org/abs/2305.07759" },
    ],
    concepts: [
      "Byte-level vocabularies: 256 base tokens, no unknown token",
      "BPE training: iteratively merge the most frequent adjacent pair",
      "Merge ranks and greedy encoding in merge order",
      "Round-trip property decode(encode(s)) == s",
      "Pre-tokenization (GPT-2 regex) and special tokens",
      "Compression ratio (bytes per token) and throughput",
    ],
    objectives: [
      "Implement byte-level BPE training, encoding and decoding in pure Python",
      "Explain why byte-level BPE never produces an unknown token",
      "Explain why encoding must apply merges in rank order",
      "Tokenize a 100 MB corpus efficiently and report compression and throughput",
      "Compare your tokenizer with GPT-2's tiktoken encoding",
    ],
    requirements: [
      "Pure Python (standard library only) for 0-bpe.py and 100-special_tokens.py — no tokenizers/tiktoken/sentencepiece inside them",
      "tiktoken allowed only in the comparison script",
    ],
    quiz: [
      { q: "A byte-level BPE vocabulary of size 10 000 contains…",
        options: ["10 000 merges", "256 byte tokens + 9 744 merged tokens (+ any special tokens if counted separately)", "only whole words", "10 000 Unicode characters"], answer: 1,
        why: "Each merge adds exactly one token on top of the 256 bytes." },
      { q: "Why must encoding apply merges in the order they were learned?",
        options: ["For speed only", "Later merges were learned on text where earlier merges were already applied; a different order can produce token sequences never seen in training", "Decoding requires it", "It doesn't matter"], answer: 1,
        why: "Greedy rank-order merging reproduces the training-time segmentation." },
      { q: "Why does GPT-2 pre-tokenize with a regex before BPE?",
        options: ["To remove punctuation", "So merges never cross word/category boundaries (e.g. 'dog.' vs 'dog!' share 'dog')", "To lowercase text", "To make decoding lossy"], answer: 1,
        why: "It prevents wasting vocabulary on punctuation-word combinations." },
      { q: "Can decoding an arbitrary token-id sequence fail to produce valid UTF-8?",
        options: ["No, never", "Yes — tokens can split a multi-byte character, so decode with errors='replace'", "Only for ASCII text", "Only with special tokens"], answer: 1,
        why: "Byte-level tokens need not align with character boundaries." },
    ],
    tasks: [
      {
        title: "Byte-level BPE: train, encode, decode",
        type: "mandatory", kind: "code", points: 4,
        body: md`In \`0-bpe.py\` (pure Python, standard library only) write:

~~~python
def train_bpe(text: str, vocab_size: int) -> tuple[list[tuple[int, int]], dict[int, bytes]]:
def encode(text: str, merges: list[tuple[int, int]]) -> list[int]:
def decode(ids: list[int], vocab: dict[int, bytes]) -> str:
~~~

- Training starts from the UTF-8 bytes of \`text\` (no pre-tokenization in this function) and the 256 byte tokens \`vocab[i] = bytes([i])\`.
- Repeat \`vocab_size - 256\` times: count adjacent pairs (plain overlapping count), pick the most frequent pair (break ties by the lexicographically greatest \`(vocab[a], vocab[b])\`), assign it id \`256 + k\`, set \`vocab[256 + k] = vocab[a] + vocab[b]\`, and replace every non-overlapping occurrence left to right. Stop early if no pair occurs twice.
- \`encode\` applies merges in **rank order** (lowest id first) to the bytes of \`text\`; \`decode\` joins bytes and decodes UTF-8 with \`errors="replace"\`.
- Round-trip must hold for any string, including non-ASCII and \`""\`.

~~~python
>>> merges, vocab = train_bpe("low lower lowest " * 50, 260)
>>> decode(encode("lowest", merges), vocab)
'lowest'
~~~

Also create \`README.md\` (≥ 120 words) explaining the algorithm and your results.`,
        files: ["0-bpe.py", "README.md"],
        checks: [
          { type: "defines", path: "0-bpe.py", names: ["train_bpe", "encode", "decode"] },
          { type: "not_contains", path: "0-bpe.py", pattern: "tiktoken|sentencepiece|from tokenizers|import tokenizers", label: "from scratch" },
          { type: "readme", path: "README.md", minWords: 120 },
          { type: "py_test", files: ["0-bpe.py"], label: "valid merges, rank-order encoding, round-trip on Unicode",
            code: py`from importlib import import_module
from collections import Counter
import random
m = import_module('0-bpe')
base = ("the quick brown fox jumps over the lazy dog. the dog sleeps; the fox runs! "
        "héllo wörld — naïve café, 日本語のテキスト, emoji 🙂🙂 ") * 12
merges, vocab = m.train_bpe(base, 300)
assert len(merges) == 44 and len(vocab) == 300, (len(merges), len(vocab))
for i in range(256):
    assert vocab[i] == bytes([i])
for k, (a, b) in enumerate(merges):
    assert vocab[256 + k] == vocab[a] + vocab[b], f"vocab[{256 + k}] inconsistent"
    assert a < 256 + k and b < 256 + k
seq = list(base.encode('utf-8'))
cnt = Counter(zip(seq, seq[1:]))
assert cnt[tuple(merges[0])] == max(cnt.values()), "first merge is not the most frequent pair"
def ref_encode(text):
    ids = list(text.encode('utf-8'))
    for k, (a, b) in enumerate(merges):
        out, i = [], 0
        while i < len(ids):
            if i + 1 < len(ids) and ids[i] == a and ids[i + 1] == b:
                out.append(256 + k); i += 2
            else:
                out.append(ids[i]); i += 1
        ids = out
    return ids
for s in ["the lazy fox", "héllo café 🙂", base[:200], "zzz unseen QQQ", ""]:
    e = m.encode(s, merges)
    assert list(e) == ref_encode(s), f"encode differs from rank-order merging on {s!r}"
    assert m.decode(e, vocab) == s
rnd = random.Random(0)
for _ in range(20):
    s = ''.join(chr(rnd.choice([rnd.randint(32, 126), rnd.randint(160, 3000), rnd.randint(0x1F600, 0x1F64F)])) for _ in range(rnd.randint(1, 40)))
    assert m.decode(m.encode(s, merges), vocab) == s
assert len(m.encode(base, merges)) < 0.6 * len(base.encode('utf-8')), "poor compression on training text"
print("ok")` },
        ],
      },
      {
        title: "Tokenize a 100 MB corpus",
        type: "mandatory", kind: "code", points: 3,
        body: md`In \`1-tokenize_corpus.py\`:

1. Train a 10 000-token vocabulary on ≥ 20 MB of TinyStories (or OpenWebText). For speed you may pre-tokenize on whitespace/regex and count pair frequencies over unique pre-tokens weighted by their count, updating counts incrementally after each merge (document your approach). Save \`merges.json\`.
2. Encode a ≥ 100 MB corpus to a \`uint16\` NumPy memmap (\`tokens.bin\`, not committed) using multiprocessing and a pre-token cache.
3. Write \`results.json\`:

~~~json
{"vocab_size": 10000, "corpus_mb": 104.2, "train_seconds": 610.0, "encode_mb_per_s": 1.4, "bytes_per_token": 4.1}
~~~

**Targets:** \`corpus_mb >= 100\`, \`bytes_per_token >= 3.0\`, \`encode_mb_per_s >= 0.2\`. Add \`tokens.bin\` to \`.gitignore\`.`,
        files: ["1-tokenize_corpus.py", "merges.json", "results.json"],
        checks: [
          { type: "exists", path: "1-tokenize_corpus.py" },
          { type: "contains", path: "1-tokenize_corpus.py", pattern: "multiprocessing|concurrent\\.futures", label: "parallel encoding" },
          { type: "contains", path: "1-tokenize_corpus.py", pattern: "uint16", label: "compact uint16 token storage" },
          { type: "json_metric", path: "results.json", key: "corpus_mb", op: ">=", value: 100 },
          { type: "json_metric", path: "results.json", key: "bytes_per_token", op: ">=", value: 3.0 },
          { type: "json_metric", path: "results.json", key: "encode_mb_per_s", op: ">=", value: 0.2 },
        ],
      },
      {
        title: "Compare with GPT-2's tokenizer",
        type: "mandatory", kind: "written", points: 2,
        body: md`\`written/2-tokenizer_comparison.md\` (PDF, Markdown or LaTeX accepted): on 10 MB of held-out TinyStories and 1 MB of code or non-English text, compare your tokenizer with \`tiktoken.get_encoding("gpt2")\`: bytes/token, longest tokens, how numbers, whitespace and rare words are split (show examples), and throughput. Explain the differences (vocab size, training data, pre-tokenization) and what they would mean for an LM's context length and compute.`,
        deliverable: "repo",
        files: ["written/2-tokenizer_comparison.md"],
        rubric: "report",
        criteria: [
          "Table of bytes/token for both tokenizers on in-domain and out-of-domain text",
          "Concrete tokenization examples for numbers, whitespace and rare words",
          "Explains differences via vocab size, training corpus and pre-tokenization",
          "Discusses consequences for context length / compute",
        ],
      },
      {
        title: "Special tokens",
        type: "advanced", kind: "code", points: 2,
        body: md`In \`100-special_tokens.py\` write \`encode_with_special(text, merges, special_tokens)\` and \`decode_with_special(ids, vocab, special_tokens)\` (import your \`encode\`/\`decode\` from \`0-bpe.py\`).

- Special token \`special_tokens[i]\` gets id \`256 + len(merges) + i\` and is never split; text between special tokens is BPE-encoded normally.
- When special tokens overlap (e.g. \`"<|a|>"\` and \`"<|a|><|a|>"\`), prefer the longest match.
- Round-trip must hold.`,
        files: ["100-special_tokens.py"],
        checks: [
          { type: "defines", path: "100-special_tokens.py", names: ["encode_with_special", "decode_with_special"] },
          { type: "py_test", files: ["100-special_tokens.py", "0-bpe.py"], label: "special tokens are atomic and round-trip",
            code: py`from importlib import import_module
b = import_module('0-bpe'); m = import_module('100-special_tokens')
merges, vocab = b.train_bpe("once upon a time there was a cat. " * 30, 280)
sp = ["<|endoftext|>", "<|pad|>"]
eot = 256 + len(merges)
s = "once upon a time<|endoftext|>there was<|pad|><|endoftext|> a cat."
ids = list(m.encode_with_special(s, merges, sp))
assert ids.count(eot) == 2 and ids.count(eot + 1) == 1
assert m.decode_with_special(ids, vocab, sp) == s
assert list(m.encode_with_special("<|endoftext|>", merges, sp)) == [eot]
sp2 = ["<|a|>", "<|a|><|a|>"]
e2 = list(m.encode_with_special("x<|a|><|a|>y", merges, sp2))
assert e2.count(256 + len(merges) + 1) == 1 and (256 + len(merges)) not in e2, "longest special token must win"
print("ok")` },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A41
  {
    id: "A41",
    track: TRACK,
    phase: PHASE,
    title: "Modern LM Architecture & Mixed Precision",
    days: 3,
    repo: REPO,
    dir: "0x01-modern_lm",
    sources: [
      { course: "CS336", lectures: "Lec 3–4", topics: "Architecture & hyper-parameter choices (pre-norm, RMSNorm, SwiGLU, RoPE, GQA/MQA), mixture of experts, mixed precision" },
    ],
    resources: [
      { title: "Zhang & Sennrich 2019 — Root Mean Square Layer Normalization", url: "https://arxiv.org/abs/1910.07467" },
      { title: "Shazeer 2020 — GLU Variants Improve Transformer", url: "https://arxiv.org/abs/2002.05202" },
      { title: "Su et al. 2021 — RoFormer: Rotary Position Embedding", url: "https://arxiv.org/abs/2104.09864" },
      { title: "Ainslie et al. 2023 — GQA: Training Generalized Multi-Query Transformer Models", url: "https://arxiv.org/abs/2305.13245" },
      { title: "Touvron et al. 2023 — LLaMA", url: "https://arxiv.org/abs/2302.13971" },
      { title: "Micikevicius et al. 2017 — Mixed Precision Training", url: "https://arxiv.org/abs/1710.03740" },
    ],
    concepts: [
      "Pre-norm vs post-norm residual blocks",
      "RMSNorm (no mean subtraction, no bias)",
      "SwiGLU feed-forward and the 8/3·d hidden size",
      "Rotary position embeddings and relative-position dot products",
      "Grouped-query attention and the KV-cache",
      "fp32 vs fp16 vs bf16: range, precision, loss scaling",
    ],
    objectives: [
      "Implement RMSNorm, SwiGLU, RoPE and GQA in NumPy and verify them",
      "Prove that RoPE makes q·k depend only on the relative position",
      "Explain why GQA shrinks the KV-cache and by how much",
      "Refactor a Phase 3 transformer to a LLaMA-style block",
      "Benchmark fp32 vs bf16 autocast and explain the speed-up",
    ],
    requirements: [
      "NumPy only for tasks 0–3",
      "PyTorch for the refactor; no nn.Transformer / nn.MultiheadAttention",
    ],
    quiz: [
      { q: "RMSNorm differs from LayerNorm by…",
        options: ["normalizing over the batch", "not subtracting the mean (and typically no bias)", "using the median", "being applied after the residual add"], answer: 1,
        why: "y = x / sqrt(mean(x²) + ε) · g." },
      { q: "With RoPE, ⟨R_m q, R_n k⟩ depends on…",
        options: ["m and n separately", "only m − n", "only m + n", "neither"], answer: 1,
        why: "R_mᵀ R_n = R_{n−m} since rotations compose." },
      { q: "A model has 32 query heads and 8 KV heads (GQA). Compared to MHA, its KV-cache is…",
        options: ["the same", "4× smaller", "8× smaller", "32× smaller"], answer: 1,
        why: "KV-cache size scales with the number of KV heads." },
      { q: "Why is bf16 usually preferred over fp16 for training?",
        options: ["More mantissa bits", "Same exponent range as fp32, so no loss scaling is needed", "It uses less memory than fp16", "It is exact"], answer: 1,
        why: "bf16 has 8 exponent bits (like fp32) but only 7 mantissa bits." },
    ],
    tasks: [
      {
        title: "RMSNorm and SwiGLU",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`0-rmsnorm_swiglu.py\` (NumPy only):

- \`def rms_norm(x, weight, eps=1e-6):\` → $x / \sqrt{\mathrm{mean}(x^2) + \epsilon} \odot g$ over the **last** axis; \`x\` \`(..., d)\`, \`weight\` \`(d,)\`.
- \`def silu(x):\` → $x\,\sigma(x)$ (stable for large $|x|$).
- \`def swiglu(x, W1, W3, W2):\` → $(\mathrm{SiLU}(xW_1) \odot xW_3)W_2$ with \`W1\`, \`W3\` \`(d, h)\`, \`W2\` \`(h, d)\`.

Also create \`README.md\` (≥ 150 words): each architectural change, why it is used, and your benchmark table.`,
        files: ["0-rmsnorm_swiglu.py", "README.md"],
        checks: [
          { type: "defines", path: "0-rmsnorm_swiglu.py", names: ["rms_norm", "silu", "swiglu"] },
          { type: "readme", path: "README.md", minWords: 150 },
          { type: "py_test", files: ["0-rmsnorm_swiglu.py"], label: "RMSNorm, SiLU and SwiGLU match definitions",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-rmsnorm_swiglu')
rng = np.random.default_rng(0)
x = rng.normal(0, 3, (2, 5, 8)); g = rng.normal(size=8)
ref = x / np.sqrt((x**2).mean(-1, keepdims=True) + 1e-6) * g
assert np.allclose(m.rms_norm(x, g), ref)
assert np.allclose(m.rms_norm(x, g, eps=1.0), x / np.sqrt((x**2).mean(-1, keepdims=True) + 1.0) * g)
u = np.array([-800.0, -1.0, 0.0, 2.0, 800.0])
s = np.asarray(m.silu(u))
assert np.all(np.isfinite(s)) and np.allclose(s, [0.0, -1 / (1 + np.e), 0.0, 2 / (1 + np.exp(-2)), 800.0])
W1 = rng.normal(size=(8, 12)); W3 = rng.normal(size=(8, 12)); W2 = rng.normal(size=(12, 8))
a = x @ W1
ref2 = (a / (1 + np.exp(-a)) * (x @ W3)) @ W2
out = np.asarray(m.swiglu(x, W1, W3, W2))
assert out.shape == (2, 5, 8) and np.allclose(out, ref2)
print("ok")` },
        ],
      },
      {
        title: "Rotary position embeddings",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`1-rope.py\` write \`def apply_rope(x, positions, base=10000.0):\`

- \`x\` \`(..., T, d)\` with \`d\` even; \`positions\` int array \`(T,)\`. Rotate each pair of features $(x_{2i}, x_{2i+1})$ — or the "half-split" pairing $(x_i, x_{i+d/2})$ used by LLaMA/GPT-NeoX; document which — by angle $p\,\theta_i$ with $\theta_i = \text{base}^{-2i/d}$.
- NumPy only, no loops over positions.

The check is convention-agnostic: norms are preserved, position 0 is the identity, and $\langle\mathrm{rope}(q, m), \mathrm{rope}(k, n)\rangle$ depends only on $m - n$.`,
        files: ["1-rope.py"],
        checks: [
          { type: "defines", path: "1-rope.py", names: ["apply_rope"] },
          { type: "py_test", files: ["1-rope.py"], label: "rotation: norm-preserving, identity at 0, relative-position dot products",
            code: py`import numpy as np
from importlib import import_module
m = import_module('1-rope')
rng = np.random.default_rng(0)
d, T = 16, 10
x = rng.normal(size=(2, T, d)); pos = np.arange(T)
y = np.asarray(m.apply_rope(x, pos))
assert y.shape == x.shape
assert np.allclose(np.linalg.norm(y, axis=-1), np.linalg.norm(x, axis=-1)), "must preserve norms"
assert np.allclose(y[:, 0], x[:, 0]), "position 0 must be the identity"
q = rng.normal(size=(1, 1, d)); k = rng.normal(size=(1, 1, d))
def dot(mq, nk):
    a = np.asarray(m.apply_rope(q, np.array([mq])))[0, 0]
    b = np.asarray(m.apply_rope(k, np.array([nk])))[0, 0]
    return a @ b
for (a, b), s in [((3, 1), 7), ((10, 4), 25), ((0, 5), 100)]:
    assert np.isclose(dot(a, b), dot(a + s, b + s)), "dot product must depend only on m - n"
assert not np.isclose(dot(3, 1), dot(3, 2)), "rotation must change with relative position"
e = np.asarray(m.apply_rope(np.array([[[1.0, 0.0]]]), np.array([2]), base=10000.0))[0, 0]
assert np.isclose(e[0], np.cos(2.0)) and np.isclose(abs(e[1]), np.sin(2.0)), "d=2 rotates by angle = position"
print("ok")` },
        ],
      },
      {
        title: "Grouped-query attention",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`2-gqa.py\` (NumPy only):

- \`def kv_head_for_query_head(n_q_heads, n_kv_heads):\` → int array \`(n_q_heads,)\` mapping query head \`h\` to KV head \`h // (n_q_heads // n_kv_heads)\`; raise \`ValueError\` if not divisible.
- \`def gqa_attention(q, k, v, causal=True):\` → \`(B, Hq, T, dh)\` with \`q\` \`(B, Hq, T, dh)\`, \`k\`, \`v\` \`(B, Hkv, T, dh)\`: scaled dot-product attention ($1/\sqrt{d_h}$) where each query head uses its mapped KV head; causal mask when \`causal\`; stable softmax.
- \`def kv_cache_bytes(n_layers, n_kv_heads, head_dim, seq_len, batch, bytes_per_el=2):\` → $2 \cdot L \cdot H_{kv} \cdot d_h \cdot T \cdot B \cdot \text{bytes}$.`,
        files: ["2-gqa.py"],
        checks: [
          { type: "defines", path: "2-gqa.py", names: ["kv_head_for_query_head", "gqa_attention", "kv_cache_bytes"] },
          { type: "py_test", files: ["2-gqa.py"], label: "head mapping, attention vs repeat-KV reference, cache size",
            code: py`import numpy as np
from importlib import import_module
m = import_module('2-gqa')
assert np.array_equal(m.kv_head_for_query_head(8, 2), [0, 0, 0, 0, 1, 1, 1, 1])
assert np.array_equal(m.kv_head_for_query_head(4, 4), [0, 1, 2, 3])
try:
    m.kv_head_for_query_head(6, 4)
except ValueError:
    pass
else:
    raise AssertionError("expected ValueError")
rng = np.random.default_rng(0)
B, Hq, Hk, T, dh = 2, 6, 2, 5, 4
q = rng.normal(size=(B, Hq, T, dh)); k = rng.normal(size=(B, Hk, T, dh)); v = rng.normal(size=(B, Hk, T, dh))
kr = np.repeat(k, Hq // Hk, axis=1); vr = np.repeat(v, Hq // Hk, axis=1)
def ref(causal):
    s = q @ kr.transpose(0, 1, 3, 2) / np.sqrt(dh)
    if causal:
        s = np.where(np.tril(np.ones((T, T), bool)), s, -np.inf)
    s = np.exp(s - s.max(-1, keepdims=True)); s /= s.sum(-1, keepdims=True)
    return s @ vr
for c in (True, False):
    out = np.asarray(m.gqa_attention(q, k, v, causal=c))
    assert out.shape == (B, Hq, T, dh) and np.allclose(out, ref(c)), f"causal={c}"
assert m.kv_cache_bytes(32, 8, 128, 4096, 1) == 2 * 32 * 8 * 128 * 4096 * 2
print("ok")` },
        ],
      },
      {
        title: "Refactor your Phase 3 transformer to a modern block",
        type: "mandatory", kind: "code", points: 4,
        body: md`In \`3-modern_transformer.py\` take your Phase 3 decoder-only transformer and produce a LLaMA-style variant: **pre-norm with RMSNorm**, **SwiGLU** FFN (hidden ≈ 8/3·d rounded to a multiple of 64), **RoPE** on q/k (no learned absolute positions), optional GQA, no biases, tied embeddings. Write the modules yourself (\`nn.Linear\`, \`nn.Embedding\` allowed; \`nn.Transformer*\` and \`nn.MultiheadAttention\` are not; \`F.scaled_dot_product_attention\` allowed only behind a flag next to your own attention).

Train both the original and the modern model at the same parameter count (±10%) on the same TinyStories tokens (your A40 tokenizer) for the same number of steps, and record validation loss into \`results.json\` (keys \`val_loss_original\`, \`val_loss_modern\`). **Target:** \`val_loss_modern <= 2.5\` after your budget.`,
        files: ["3-modern_transformer.py", "results.json"],
        checks: [
          { type: "contains", path: "3-modern_transformer.py", pattern: "class\\s+RMSNorm", label: "RMSNorm module" },
          { type: "contains", path: "3-modern_transformer.py", pattern: "silu|SiLU", label: "SwiGLU uses SiLU" },
          { type: "contains", path: "3-modern_transformer.py", pattern: "rope|rotary|RoPE|Rotary", label: "rotary embeddings" },
          { type: "not_contains", path: "3-modern_transformer.py", pattern: "nn\\.Transformer|nn\\.MultiheadAttention", label: "attention written from scratch" },
          { type: "json_metric", path: "results.json", key: "val_loss_modern", op: "<=", value: 2.5 },
        ],
      },
      {
        title: "Mixed-precision speed benchmark",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`4-benchmark.py\` time forward+backward+optimizer steps (after warm-up, with \`torch.cuda.synchronize()\`) for the modern model in fp32 and under \`torch.autocast(dtype=torch.bfloat16)\` (fp16 + \`GradScaler\` if your GPU lacks bf16, e.g. a T4 — say so). Also time original vs modern architecture at fp32. Add to \`results.json\`: \`tokens_per_sec_fp32\`, \`tokens_per_sec_bf16\`, \`speedup_bf16\` (= ratio), \`peak_mem_mb_fp32\`, \`peak_mem_mb_bf16\`, \`gpu_name\`. **Target:** \`speedup_bf16 >= 1.2\`. Explain in the README where the speed-up comes from (tensor cores, memory bandwidth) and why it is not 2× everywhere.`,
        files: ["4-benchmark.py", "results.json"],
        checks: [
          { type: "contains", path: "4-benchmark.py", pattern: "autocast", label: "uses autocast" },
          { type: "contains", path: "4-benchmark.py", pattern: "synchronize", label: "synchronizes before timing" },
          { type: "json_metric", path: "results.json", key: "speedup_bf16", op: ">=", value: 1.2 },
          { type: "json_metric", path: "results.json", key: "tokens_per_sec_fp32", op: ">", value: 0 },
        ],
      },
      {
        title: "Mixture-of-Experts FFN",
        type: "advanced", kind: "code", points: 2,
        body: md`In \`100-moe.py\` replace the SwiGLU FFN with a top-2 routed MoE (8 experts, load-balancing auxiliary loss as in Switch/Mixtral). Train at equal *active* parameters and report \`val_loss_moe\` and the expert-load histogram (\`moe_load.png\`).`,
        files: ["100-moe.py", "moe_load.png"],
        checks: [
          { type: "contains", path: "100-moe.py", pattern: "topk", label: "top-k routing" },
          { type: "exists", path: "moe_load.png" },
          { type: "json_metric", path: "results.json", key: "val_loss_moe", op: ">", value: 0 },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A42
  {
    id: "A42",
    track: TRACK,
    phase: PHASE,
    title: "Training Systems: Memory, Kernels & Parallelism",
    days: 2,
    repo: REPO,
    dir: "0x02-training_systems",
    sources: [
      { course: "CS336", lectures: "Lec 5–6", topics: "GPUs and kernels (memory hierarchy, FlashAttention, Triton), parallelism (data, tensor, pipeline, ZeRO/FSDP), activation checkpointing" },
    ],
    resources: [
      { title: "Rajbhandari et al. 2019 — ZeRO: Memory Optimizations Toward Training Trillion Parameter Models", url: "https://arxiv.org/abs/1910.02054" },
      { title: "Zhao et al. 2023 — PyTorch FSDP: Experiences on Scaling Fully Sharded Data Parallel", url: "https://arxiv.org/abs/2304.11277" },
      { title: "Chen et al. 2016 — Training Deep Nets with Sublinear Memory Cost", url: "https://arxiv.org/abs/1604.06174" },
      { title: "Korthikanti et al. 2022 — Reducing Activation Recomputation in Large Transformer Models", url: "https://arxiv.org/abs/2205.05198" },
      { title: "Dao et al. 2022 — FlashAttention", url: "https://arxiv.org/abs/2205.14135" },
      { title: "PyTorch docs — torch.utils.checkpoint", url: "https://pytorch.org/docs/stable/checkpoint.html" },
    ],
    concepts: [
      "Model-state memory: parameters, gradients, optimizer states (16 bytes/param for mixed-precision Adam)",
      "Activation memory and its dependence on sequence length and batch",
      "Activation (gradient) checkpointing: compute ↔ memory trade-off",
      "Gradient accumulation",
      "ZeRO stages 1/2/3 and FSDP",
      "Arithmetic intensity, memory-bound vs compute-bound kernels, kernel fusion",
    ],
    objectives: [
      "Compute the memory footprint of training a transformer from its shape",
      "Explain the per-GPU memory of ZeRO stages 1–3",
      "Measure the memory saved and time lost by activation checkpointing",
      "Verify that gradient accumulation reproduces large-batch gradients",
      "Explain why FlashAttention is faster despite doing more FLOPs",
    ],
    requirements: ["NumPy / pure Python for task 0", "PyTorch on a single GPU for task 1"],
    quiz: [
      { q: "Mixed-precision Adam needs roughly how many bytes of model state per parameter (ZeRO paper accounting)?",
        options: ["4", "8", "16", "32"], answer: 2,
        why: "2 (fp16 params) + 2 (fp16 grads) + 4 + 4 + 4 (fp32 master params, m, v)." },
      { q: "ZeRO stage 2 partitions…",
        options: ["only optimizer states", "optimizer states and gradients", "optimizer states, gradients and parameters", "activations"], answer: 1,
        why: "Stage 1: optimizer; stage 2: + gradients; stage 3: + parameters." },
      { q: "Full activation checkpointing of every transformer layer typically costs…",
        options: ["no extra compute", "about one extra forward pass (~33% more compute)", "2× backward cost", "10× compute"], answer: 1,
        why: "Each layer's forward is recomputed during backward." },
      { q: "FlashAttention is faster mainly because it…",
        options: ["uses fewer FLOPs", "avoids materializing the T×T attention matrix in HBM, reducing memory traffic", "approximates softmax", "uses int8"], answer: 1,
        why: "Attention is memory-bound; tiling keeps blocks in SRAM." },
    ],
    tasks: [
      {
        title: "Memory accounting calculator",
        type: "mandatory", kind: "code", points: 3,
        body: md`In \`0-memory.py\` implement these exact accounting rules (bytes):

1. \`def transformer_params(n_layers, d_model, vocab_size, d_ff=None):\` → $L(4d^2 + 2\,d\,d_\text{ff}) + V d$ (attention Q,K,V,O + 2-matrix MLP, tied embeddings, ignore biases/norms); \`d_ff\` defaults to \`4 * d_model\`.
2. \`def model_state_bytes(n_params, mixed_precision=True):\` → dict \`{"params", "grads", "optimizer", "total"}\` for Adam: mixed → $2\Phi, 2\Phi, 12\Phi$ (fp32 master + m + v); fp32 → $4\Phi, 4\Phi, 8\Phi$.
3. \`def zero_bytes_per_gpu(n_params, n_gpus, stage):\` → mixed-precision model state per GPU: stage 0 $16\Phi$; 1 $4\Phi + 12\Phi/N$; 2 $2\Phi + 14\Phi/N$; 3 $16\Phi/N$. Raise \`ValueError\` for other stages.
4. \`def activation_bytes(n_layers, seq_len, batch, d_model, n_heads, checkpointing=False):\` → Korthikanti et al. (16-bit activations, no recomputation): $L \cdot s b h (34 + 5 a s / h)$; with full checkpointing only each layer's input is kept: $L \cdot 2 s b h$.

Also create \`README.md\` (≥ 120 words) with a worked example: a 1.3 B-parameter model on one 24 GB GPU.`,
        files: ["0-memory.py", "README.md"],
        checks: [
          { type: "defines", path: "0-memory.py", names: ["transformer_params", "model_state_bytes", "zero_bytes_per_gpu", "activation_bytes"] },
          { type: "readme", path: "README.md", minWords: 120 },
          { type: "py_test", files: ["0-memory.py"], label: "accounting formulas",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-memory')
assert m.transformer_params(12, 768, 50257) == 12 * 12 * 768**2 + 50257 * 768
assert m.transformer_params(2, 64, 100, d_ff=128) == 2 * (4 * 64**2 + 2 * 64 * 128) + 100 * 64
P = 1_000_000
ms = m.model_state_bytes(P, mixed_precision=True)
assert (ms["params"], ms["grads"], ms["optimizer"], ms["total"]) == (2 * P, 2 * P, 12 * P, 16 * P)
fs = m.model_state_bytes(P, mixed_precision=False)
assert (fs["params"], fs["grads"], fs["optimizer"], fs["total"]) == (4 * P, 4 * P, 8 * P, 16 * P)
N = 8
for st, ref in [(0, 16 * P), (1, 4 * P + 12 * P / N), (2, 2 * P + 14 * P / N), (3, 16 * P / N)]:
    assert np.isclose(m.zero_bytes_per_gpu(P, N, st), ref), f"stage {st}"
try:
    m.zero_bytes_per_gpu(P, N, 4)
except ValueError:
    pass
else:
    raise AssertionError("expected ValueError")
L, s, b, h, a = 24, 2048, 4, 2048, 16
assert np.isclose(m.activation_bytes(L, s, b, h, a), L * s * b * h * (34 + 5 * a * s / h))
assert np.isclose(m.activation_bytes(L, s, b, h, a, checkpointing=True), L * 2 * s * b * h)
print("ok")` },
        ],
      },
      {
        title: "Checkpointing and gradient accumulation experiment",
        type: "mandatory", kind: "code", points: 3,
        body: md`In \`1-memory_experiment.py\` use your A41 model on one GPU:

1. Measure peak memory (\`torch.cuda.max_memory_allocated\`) and step time with and without \`torch.utils.checkpoint\` on every block, at a fixed batch/sequence length; find the largest batch that fits in each mode.
2. Show gradient accumulation is exact: compute gradients for one batch of 32 sequences, and for 4 micro-batches of 8 with loss scaled by 1/4; report the max absolute difference over all parameters (fp32, dropout off).
3. Compare measured memory with your \`0-memory.py\` prediction.

Write \`results.json\` with \`peak_mem_mb_baseline\`, \`peak_mem_mb_checkpointing\`, \`ckpt_memory_reduction\` (= 1 − ckpt/baseline), \`ckpt_time_overhead\` (= ckpt_time/baseline_time − 1), \`max_batch_baseline\`, \`max_batch_checkpointing\`, \`grad_accum_max_abs_diff\`.
**Targets:** \`ckpt_memory_reduction >= 0.3\`, \`grad_accum_max_abs_diff <= 1e-4\`.`,
        files: ["1-memory_experiment.py", "results.json"],
        checks: [
          { type: "contains", path: "1-memory_experiment.py", pattern: "checkpoint", label: "activation checkpointing" },
          { type: "contains", path: "1-memory_experiment.py", pattern: "max_memory_allocated", label: "measures peak memory" },
          { type: "json_metric", path: "results.json", key: "ckpt_memory_reduction", op: ">=", value: 0.3 },
          { type: "json_metric", path: "results.json", key: "grad_accum_max_abs_diff", op: "<=", value: 0.0001 },
        ],
      },
      {
        title: "Paper notes: ZeRO and FSDP",
        type: "mandatory", kind: "written", points: 2,
        body: md`\`written/2-zero_fsdp_notes.md\` (PDF, Markdown or LaTeX accepted), 1–2 pages: the memory redundancy of data parallelism, ZeRO stages 1–3 with per-GPU memory formulas and communication cost (vs all-reduce), how FSDP implements stage 3 (units, all-gather before forward/backward, reduce-scatter of gradients, prefetching), and when tensor/pipeline parallelism is needed instead. End with a paragraph on what you can and cannot do on a single GPU (CPU offload, 8-bit optimizers, checkpointing).`,
        deliverable: "repo",
        files: ["written/2-zero_fsdp_notes.md"],
        rubric: "summary",
        criteria: [
          "States per-GPU memory for ZeRO-1/2/3 consistent with the paper",
          "Compares communication volume of ZeRO-3 with standard data parallel (1.5×)",
          "Explains FSDP's all-gather / reduce-scatter schedule",
          "Distinguishes when tensor or pipeline parallelism is required",
          "Gives concrete single-GPU strategies",
        ],
      },
      {
        title: "A fused kernel",
        type: "advanced", kind: "code", points: 2,
        body: md`In \`100-fused_rmsnorm.py\` write a Triton (or \`torch.compile\`) fused RMSNorm forward, verify it against your PyTorch version (max abs diff ≤ 1e-3 in bf16) and benchmark it; add \`"fused_rmsnorm_speedup"\` to \`results.json\`.`,
        files: ["100-fused_rmsnorm.py"],
        checks: [
          { type: "contains", path: "100-fused_rmsnorm.py", pattern: "triton|torch\\.compile", label: "fused kernel" },
          { type: "json_metric", path: "results.json", key: "fused_rmsnorm_speedup", op: ">", value: 1.0 },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A43
  {
    id: "A43",
    track: TRACK,
    phase: PHASE,
    title: "Scaling Laws: Train a Small LM",
    days: 4,
    repo: REPO,
    dir: "0x03-scaling_laws",
    sources: [
      { course: "CS336", lectures: "Lec 7–8", topics: "Scaling laws (Kaplan, Chinchilla, IsoFLOP fits), data sources, filtering, deduplication, curriculum" },
    ],
    resources: [
      { title: "Kaplan et al. 2020 — Scaling Laws for Neural Language Models", url: "https://arxiv.org/abs/2001.08361" },
      { title: "Hoffmann et al. 2022 — Training Compute-Optimal LLMs (Chinchilla)", url: "https://arxiv.org/abs/2203.15556" },
      { title: "Eldan & Li 2023 — TinyStories", url: "https://arxiv.org/abs/2305.07759" },
      { title: "Penedo et al. 2024 — The FineWeb Datasets", url: "https://arxiv.org/abs/2406.17557" },
      { title: "Loshchilov & Hutter 2017 — Decoupled Weight Decay Regularization (AdamW)", url: "https://arxiv.org/abs/1711.05101" },
    ],
    concepts: [
      "Power laws L(N) = a N^{−α} and saturating forms L = E + a N^{−α}",
      "Log–log linear regression",
      "Non-embedding parameter counts",
      "Learning-rate warm-up and cosine decay",
      "Data curation: deduplication and filtering",
      "Extrapolation risk of fitted scaling curves",
    ],
    objectives: [
      "Fit pure and saturating power laws and explain the role of the irreducible loss E",
      "Implement a warm-up + cosine learning-rate schedule",
      "Train decoder-only LMs at ≥ 3 sizes with a controlled recipe",
      "Plot and interpret a small scaling curve, including its uncertainty",
      "Explain why Kaplan and Chinchilla reached different conclusions",
    ],
    requirements: [
      "NumPy only for tasks 0–1",
      "PyTorch; one consumer GPU / Colab (A100 hours optional)",
    ],
    quiz: [
      { q: "Fitting log L = log a − α log N by least squares assumes…",
        options: ["an irreducible loss E > 0", "a pure power law with no offset", "exponential decay", "nothing"], answer: 1,
        why: "With an irreducible term the log–log plot curves; fit E + aN^{−α} instead." },
      { q: "Kaplan et al. recommended scaling parameters faster than data; Chinchilla found roughly equal scaling. A key reason was…",
        options: ["different tokenizers", "Kaplan used a fixed LR schedule length that did not match each run's token budget", "Chinchilla used RNNs", "Kaplan used larger models"], answer: 1,
        why: "Not tuning the cosine schedule to the training length penalized longer runs." },
      { q: "In a cosine schedule with warm-up, the learning rate at the final step equals…",
        options: ["max_lr", "0 always", "min_lr", "max_lr / 2"], answer: 2,
        why: "Cosine decays from max_lr to min_lr over (total − warmup) steps." },
    ],
    tasks: [
      {
        title: "Power-law fits",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`0-power_law.py\` (NumPy only):

- \`def fit_power_law(N, L):\` → \`(a, alpha)\` for $L = a N^{-\alpha}$ via least squares in log–log space.
- \`def fit_power_law_offset(N, L):\` → \`(E, a, alpha)\` for $L = E + a N^{-\alpha}$ with $0 \le E < \min L$ (e.g. grid/golden-section search over E with a log–log fit inside, or Gauss–Newton). No SciPy.
- \`def predict(N, E, a, alpha):\` → $E + a N^{-\alpha}$.

Also create \`README.md\` (≥ 150 words) with your scaling plot and fitted law.`,
        files: ["0-power_law.py", "README.md"],
        checks: [
          { type: "defines", path: "0-power_law.py", names: ["fit_power_law", "fit_power_law_offset", "predict"] },
          { type: "not_contains", path: "0-power_law.py", pattern: "scipy", label: "no SciPy" },
          { type: "readme", path: "README.md", minWords: 150 },
          { type: "py_test", files: ["0-power_law.py"], label: "recovers known power laws",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-power_law')
N = np.logspace(6, 9, 8)
a, al = m.fit_power_law(N, 50.0 * N ** -0.3)
assert np.isclose(a, 50.0, rtol=1e-6) and np.isclose(al, 0.3, rtol=1e-6)
E0, a0, al0 = 1.7, 400.0, 0.34
L = E0 + a0 * N ** -al0
E, a, al = m.fit_power_law_offset(N, L)
assert abs(E - E0) < 0.05 and abs(al - al0) / al0 < 0.05, (E, a, al)
assert np.allclose(m.predict(N, E, a, al), L, rtol=0.01)
rng = np.random.default_rng(0)
Ln = L * np.exp(rng.normal(0, 0.003, L.shape))
E2, a2, al2 = m.fit_power_law_offset(N, Ln)
assert 0 <= E2 < Ln.min() and abs(al2 - al0) / al0 < 0.25
print("ok")` },
        ],
      },
      {
        title: "Warm-up + cosine LR schedule",
        type: "mandatory", kind: "code", points: 1,
        body: md`In \`1-lr_schedule.py\` write \`def cosine_lr(step, max_lr, min_lr, warmup_steps, total_steps):\` (CS336 convention):

- \`step < warmup_steps\`: \`max_lr * step / warmup_steps\`
- \`warmup_steps <= step <= total_steps\`: $\text{min} + \tfrac12\big(1 + \cos(\pi\frac{\text{step} - \text{warmup}}{\text{total} - \text{warmup}})\big)(\text{max} - \text{min})$
- \`step > total_steps\`: \`min_lr\`

Returns a Python float.`,
        files: ["1-lr_schedule.py"],
        checks: [
          { type: "defines", path: "1-lr_schedule.py", names: ["cosine_lr"] },
          { type: "py_test", files: ["1-lr_schedule.py"], label: "warm-up, cosine decay and floor",
            code: py`import math
from importlib import import_module
m = import_module('1-lr_schedule')
f = lambda s: m.cosine_lr(s, 1e-3, 1e-4, 100, 1100)
assert math.isclose(f(0), 0.0, abs_tol=1e-15)
assert math.isclose(f(50), 5e-4)
assert math.isclose(f(100), 1e-3)
assert math.isclose(f(600), 1e-4 + 0.5 * (1e-3 - 1e-4))
assert math.isclose(f(1100), 1e-4)
assert math.isclose(f(5000), 1e-4)
assert math.isclose(f(350), 1e-4 + 0.5 * (1 + math.cos(math.pi * 0.25)) * 9e-4)
print("ok")` },
        ],
      },
      {
        title: "Train LMs at three or more sizes on TinyStories",
        type: "mandatory", kind: "code", points: 5,
        body: md`In \`2-train_lm.py\` train your A41 modern LM (A40 tokenizer, AdamW, your \`cosine_lr\`, bf16 autocast, gradient clipping 1.0) at **≥ 3 sizes spanning ≥ 4× in non-embedding parameters**, largest ≈ 10–50 M parameters, each on the same token budget (or with tokens ∝ params — state which). Hold out the TinyStories validation split.

- Log train/val loss to a CSV per run; save \`loss_curves.png\`.
- Write \`results.json\`:

~~~json
{"runs": [{"name": "S", "params_non_emb": 3.1e6, "tokens": 2.0e8, "val_loss": 1.92}, "…"],
 "val_loss_large": 1.55, "params_large": 3.0e7, "n_sizes": 3}
~~~

**Targets:** \`n_sizes >= 3\`, \`params_large >= 1e7\`, \`val_loss_large <= 1.8\` (CS336's TinyStories reference reaches ≈ 1.45 with a 17 M non-embedding model).`,
        files: ["2-train_lm.py", "results.json", "loss_curves.png"],
        checks: [
          { type: "contains", path: "2-train_lm.py", pattern: "cosine_lr", label: "uses your LR schedule" },
          { type: "contains", path: "2-train_lm.py", pattern: "clip_grad_norm_", label: "gradient clipping" },
          { type: "json_metric", path: "results.json", key: "n_sizes", op: ">=", value: 3 },
          { type: "json_metric", path: "results.json", key: "params_large", op: ">=", value: 10000000 },
          { type: "json_metric", path: "results.json", key: "val_loss_large", op: "<=", value: 1.8 },
          { type: "exists", path: "loss_curves.png" },
        ],
      },
      {
        title: "Scaling plot and report",
        type: "mandatory", kind: "written", points: 2,
        body: md`\`written/3-scaling_report.md\` (PDF, Markdown or LaTeX accepted) with \`scaling.png\`: final val loss vs non-embedding parameters on log–log axes, your fitted $L = E + aN^{-\alpha}$ (from \`0-power_law.py\`), and an extrapolation to 10× your largest model with an honest uncertainty statement (e.g. leave-one-out refits). Discuss: are your runs compute-optimal? how does your $\alpha$ compare with Kaplan's 0.076? what confounds (LR tuning, token budget, tokenizer, data repetition) affect it?`,
        deliverable: "repo",
        files: ["written/3-scaling_report.md"],
        rubric: "report",
        criteria: [
          "Log–log plot with ≥ 3 sizes and the fitted curve",
          "Reports fitted E, a, α and compares α with published values",
          "Extrapolation with an explicit uncertainty estimate",
          "Discusses at least three confounds of a small-scale scaling study",
        ],
      },
      {
        title: "Mini IsoFLOP study",
        type: "advanced", kind: "code", points: 3,
        body: md`In \`100-isoflop.py\` pick 2 compute budgets and train ≥ 4 model sizes per budget with $D = C/(6N)$ tokens; fit a parabola to loss vs $\log N$ per budget, find $N_\text{opt}(C)$, and compare the tokens-per-parameter ratio with Chinchilla's ≈ 20. Add \`"isoflop_tokens_per_param"\` to \`results.json\`.`,
        files: ["100-isoflop.py"],
        checks: [
          { type: "exists", path: "100-isoflop.py" },
          { type: "json_metric", path: "results.json", key: "isoflop_tokens_per_param", op: ">", value: 0 },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A44
  {
    id: "A44",
    track: TRACK,
    phase: PHASE,
    title: "Post-training at LM Scale: SFT & DPO",
    days: 3,
    repo: REPO,
    dir: "0x04-post_training",
    sources: [
      { course: "CS336", lectures: "Lec 9–10", topics: "Post-training: instruction tuning / SFT, RLHF, DPO and verifiable-reward RL at LM scale" },
    ],
    resources: [
      { title: "Ouyang et al. 2022 — InstructGPT", url: "https://arxiv.org/abs/2203.02155" },
      { title: "Rafailov et al. 2023 — Direct Preference Optimization", url: "https://arxiv.org/abs/2305.18290" },
      { title: "Zhou et al. 2023 — LIMA: Less Is More for Alignment", url: "https://arxiv.org/abs/2305.11206" },
      { title: "Zheng et al. 2023 — Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena", url: "https://arxiv.org/abs/2306.05685" },
      { title: "CS336 Spring 2025 course site (alignment assignment)", url: "https://stanford-cs336.github.io/spring2025/" },
    ],
    concepts: [
      "Chat/instruction templates",
      "Loss masking: train only on response tokens",
      "SFT as maximum likelihood on demonstrations",
      "Constructing preference pairs (rejection sampling, perturbations, AI feedback)",
      "DPO at LM scale with a frozen reference",
      "Pairwise win-rate evaluation with confidence intervals",
    ],
    objectives: [
      "Build SFT examples with prompt-token masking and compute the masked next-token loss",
      "Supervised-fine-tune your own small LM on instruction data",
      "Construct a preference dataset for your model and run DPO on it",
      "Evaluate SFT vs DPO with a pairwise win rate and a standard error",
      "Identify failure modes: verbosity bias, reward hacking of the judge, over-optimization",
    ],
    requirements: [
      "NumPy only for tasks 0 and 3",
      "PyTorch; start from your A43 largest model",
    ],
    quiz: [
      { q: "Why are prompt tokens masked out of the SFT loss?",
        options: ["To save memory", "We want the model to learn to produce responses, not to model the distribution of user prompts", "Prompts are too short", "Because of RoPE"], answer: 1,
        why: "Including them spends capacity on modeling prompts and can bias behaviour." },
      { q: "With HF-style unshifted labels, logits at position t are compared with…",
        options: ["labels[t]", "labels[t + 1]", "labels[t − 1]", "the mean label"], answer: 1,
        why: "Next-token prediction: shift logits[:, :-1] against labels[:, 1:]." },
      { q: "Model B beats A in 60 of 100 comparisons (no ties). The standard error of the win rate is about…",
        options: ["0.01", "0.05", "0.10", "0.25"], answer: 1,
        why: "sqrt(0.6 · 0.4 / 100) ≈ 0.049 — so 60% is only ~2 SE from 50%." },
    ],
    tasks: [
      {
        title: "SFT example construction and masked loss",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`0-sft_data.py\` (NumPy only):

- \`def build_sft_example(prompt_ids, response_ids, eos_id, ignore_index=-100):\` → \`(input_ids, labels)\` as int arrays: \`input_ids = prompt + response + [eos]\`; \`labels\` is the same sequence with every **prompt** position set to \`ignore_index\` (labels are *unshifted*, HF-style).
- \`def masked_next_token_loss(logits, labels, ignore_index=-100):\` → scalar: with \`logits\` \`(B, T, V)\` and \`labels\` \`(B, T)\`, the mean over all positions with \`labels[:, t+1] != ignore_index\` of $-\log\mathrm{softmax}(\text{logits}[:, t])[\text{labels}[:, t+1]]$ for $t = 0..T-2$ (stable log-softmax; mean over unmasked tokens across the whole batch).

Also create \`README.md\` (≥ 150 words): chat template, data, and results.`,
        files: ["0-sft_data.py", "README.md"],
        checks: [
          { type: "defines", path: "0-sft_data.py", names: ["build_sft_example", "masked_next_token_loss"] },
          { type: "readme", path: "README.md", minWords: 150 },
          { type: "py_test", files: ["0-sft_data.py"], label: "prompt masking and shifted masked loss",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-sft_data')
inp, lab = m.build_sft_example([5, 6, 7], [8, 9], 2)
assert list(np.asarray(inp)) == [5, 6, 7, 8, 9, 2]
assert list(np.asarray(lab)) == [-100, -100, -100, 8, 9, 2]
rng = np.random.default_rng(0)
B, T, V = 2, 6, 10
lg = rng.normal(0, 2, (B, T, V))
labels = np.array([[-100, -100, -100, 8, 9, 2], [-100, 3, 4, 5, -100, -100]])
ls = lg - lg.max(-1, keepdims=True); ls -= np.log(np.exp(ls).sum(-1, keepdims=True))
tot, cnt = 0.0, 0
for b in range(B):
    for t in range(T - 1):
        y = labels[b, t + 1]
        if y != -100:
            tot -= ls[b, t, y]; cnt += 1
assert np.isclose(m.masked_next_token_loss(lg, labels), tot / cnt)
assert np.isfinite(m.masked_next_token_loss(lg * 500, labels))
print("ok")` },
        ],
      },
      {
        title: "SFT your small LM",
        type: "mandatory", kind: "code", points: 3,
        body: md`In \`1-sft.py\` fine-tune your A43 model on instruction-style data built from TinyStoriesInstruct (or a small instruction dataset you convert to your tokenizer), using a fixed chat template and your masked loss. Hold out 5% for validation. Write \`results.json\` keys \`sft_val_loss\`, \`sft_train_examples\` and save 10 sample generations to \`sft_samples.md\`. **Target:** \`sft_train_examples >= 10000\`.`,
        files: ["1-sft.py", "results.json", "sft_samples.md"],
        checks: [
          { type: "contains", path: "1-sft.py", pattern: "-100|ignore_index", label: "masks prompt tokens" },
          { type: "json_metric", path: "results.json", key: "sft_train_examples", op: ">=", value: 10000 },
          { type: "json_metric", path: "results.json", key: "sft_val_loss", op: ">", value: 0 },
          { type: "nonempty", path: "sft_samples.md", minLines: 10 },
        ],
      },
      {
        title: "Construct preferences and run DPO",
        type: "mandatory", kind: "code", points: 4,
        body: md`In \`2-dpo.py\`:

1. Build ≥ 2 000 preference pairs for **your** SFT model: sample 2–4 responses per prompt and rank them with a rule you can defend (e.g. constraint satisfaction — "story must contain the words X, Y, Z", length limits, a stronger open model as judge). Save a sample of 50 pairs to \`preference_sample.jsonl\` and document the rule in the README.
2. Run DPO (your A39 loss) with the SFT model as frozen reference; sweep β ∈ {0.05, 0.1, 0.5}.
3. Add \`dpo_val_reward_accuracy\`, \`dpo_pairs\`, \`best_beta\` to \`results.json\`. **Targets:** \`dpo_pairs >= 2000\`, \`dpo_val_reward_accuracy >= 0.65\`.`,
        files: ["2-dpo.py", "preference_sample.jsonl", "results.json"],
        checks: [
          { type: "contains", path: "2-dpo.py", pattern: "logsigmoid|log_sigmoid|softplus", label: "DPO loss" },
          { type: "not_contains", path: "2-dpo.py", pattern: "DPOTrainer", label: "own DPO loop" },
          { type: "nonempty", path: "preference_sample.jsonl", minLines: 50 },
          { type: "json_metric", path: "results.json", key: "dpo_pairs", op: ">=", value: 2000 },
          { type: "json_metric", path: "results.json", key: "dpo_val_reward_accuracy", op: ">=", value: 0.65 },
        ],
      },
      {
        title: "Win-rate evaluation",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`3-win_rate.py\` write \`def win_rate(outcomes):\` → \`(rate, stderr)\` where \`outcomes\` contains 1 (win), 0 (loss), 0.5 (tie): \`rate\` is the mean and \`stderr = std(outcomes, ddof=1) / sqrt(n)\`.

Then compare DPO vs SFT on ≥ 200 held-out prompts with your preference rule (and, if possible, an LLM judge with randomized order). Add \`dpo_win_rate_vs_sft\` and \`dpo_win_rate_stderr\` to \`results.json\`. **Target:** \`dpo_win_rate_vs_sft >= 0.55\`.`,
        files: ["3-win_rate.py", "results.json"],
        checks: [
          { type: "defines", path: "3-win_rate.py", names: ["win_rate"] },
          { type: "json_metric", path: "results.json", key: "dpo_win_rate_vs_sft", op: ">=", value: 0.55 },
          { type: "py_test", files: ["3-win_rate.py"], label: "win rate with ties and standard error",
            code: py`import numpy as np
from importlib import import_module
m = import_module('3-win_rate')
o = np.array([1, 1, 0, 0.5, 1, 0, 1, 0.5, 1, 1])
r, se = m.win_rate(o)
assert np.isclose(r, 0.7)
assert np.isclose(se, o.std(ddof=1) / np.sqrt(10))
r2, se2 = m.win_rate([1] * 60 + [0] * 40)
assert np.isclose(r2, 0.6) and abs(se2 - 0.049) < 0.002
print("ok")` },
        ],
      },
      {
        title: "Post-training report",
        type: "mandatory", kind: "written", points: 2,
        body: md`\`written/4-post_training_report.md\` (PDF, Markdown or LaTeX accepted): pipeline diagram, data statistics, SFT and DPO curves, the β sweep, win rate with confidence interval, 5 side-by-side examples (good and bad), and an honest discussion of failure modes (length exploitation, degenerate repetition, judge bias).`,
        deliverable: "repo",
        files: ["written/4-post_training_report.md"],
        rubric: "report",
        criteria: [
          "Describes the preference-construction rule and its weaknesses",
          "Reports win rate with a confidence interval, not just a point estimate",
          "Shows the β sweep and its effect on reward accuracy / KL / sample quality",
          "Includes qualitative examples including failures",
        ],
      },
      {
        title: "RL with a verifiable reward",
        type: "advanced", kind: "code", points: 3,
        body: md`In \`100-grpo.py\` implement GRPO-style policy-gradient fine-tuning (group-normalized advantages, KL to reference) with a programmatic reward (e.g. "story contains all 3 required words"). Report \`"grpo_constraint_success"\` (fraction of held-out prompts satisfied) vs SFT in \`results.json\`.`,
        files: ["100-grpo.py"],
        checks: [
          { type: "exists", path: "100-grpo.py" },
          { type: "json_metric", path: "results.json", key: "grpo_constraint_success", op: ">", value: 0 },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A45
  {
    id: "A45",
    track: TRACK,
    phase: PHASE,
    title: "LLM Evaluation: Benchmarks & Contamination",
    days: 3,
    repo: REPO,
    dir: "0x05-llm_evaluation",
    sources: [
      { course: "EVAL", lectures: "Evaluation fundamentals", topics: "Why evaluation is hard; MMLU, HellaSwag, BIG-bench; log-likelihood vs generative scoring; test-set contamination" },
    ],
    resources: [
      { title: "Hendrycks et al. 2020 — Measuring Massive Multitask Language Understanding (MMLU)", url: "https://arxiv.org/abs/2009.03300" },
      { title: "Zellers et al. 2019 — HellaSwag", url: "https://arxiv.org/abs/1905.07830" },
      { title: "Srivastava et al. 2022 — Beyond the Imitation Game (BIG-bench)", url: "https://arxiv.org/abs/2206.04615" },
      { title: "Brown et al. 2020 — Language Models are Few-Shot Learners (13-gram contamination analysis)", url: "https://arxiv.org/abs/2005.14165" },
      { title: "EleutherAI lm-evaluation-harness", url: "https://github.com/EleutherAI/lm-evaluation-harness" },
      { title: "Miller 2024 — Adding Error Bars to Evals", url: "https://arxiv.org/abs/2411.00640" },
    ],
    concepts: [
      "Multiple-choice scoring by log-likelihood (raw vs length-normalized)",
      "Accuracy, chance level, and bootstrap confidence intervals",
      "Prompt format sensitivity and few-shot examples",
      "n-gram overlap contamination detection",
      "Benchmark saturation and construct validity",
    ],
    objectives: [
      "Score multiple-choice benchmarks with log-likelihoods and length normalization",
      "Compute bootstrap confidence intervals and decide whether a difference is significant",
      "Implement an n-gram contamination check against training data",
      "Evaluate your own LM on 2–3 benchmarks and report honestly against chance",
    ],
    requirements: ["NumPy / standard library only for tasks 0–1", "PyTorch for evaluating your LM"],
    quiz: [
      { q: "Why is length normalization used when scoring multiple-choice answers by log-likelihood?",
        options: ["Longer answers have more tokens and thus lower total log-probability, biasing toward short answers", "It speeds up evaluation", "It is required by MMLU", "It removes contamination"], answer: 0,
        why: "Summed log-probs penalize long continuations (HellaSwag uses acc_norm)." },
      { q: "A model scores 27% on 4-way MMLU with n = 1000. What should you conclude?",
        options: ["It has learned a lot", "It is near chance (25%); the 95% CI (~±2.8 pts) barely excludes it", "It is contaminated", "MMLU is broken"], answer: 1,
        why: "Always compare with chance and report CIs." },
      { q: "GPT-3's contamination analysis flagged an example as dirty if…",
        options: ["its label appeared in training", "it shared a 13-gram with the training set", "it was older than 2019", "perplexity was low"], answer: 1,
        why: "Long n-gram overlap is a cheap, conservative proxy." },
    ],
    tasks: [
      {
        title: "Multiple-choice accuracy with bootstrap CIs",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`0-mc_eval.py\` (NumPy only):

- \`def mc_predict(choice_logprobs, choice_lengths=None):\` → int predictions \`(N,)\`: argmax over \`K\` choices of summed log-prob \`(N, K)\`; if \`choice_lengths\` \`(N, K)\` is given, argmax of log-prob / length.
- \`def accuracy(preds, labels):\` → float.
- \`def bootstrap_ci(correct, n_boot=10000, alpha=0.05, seed=0):\` → \`(low, high)\` percentile bootstrap CI of the mean of a 0/1 array, resampling with \`np.random.default_rng(seed)\`.

Also create \`README.md\` (≥ 150 words) with your benchmark table (accuracy ± CI, chance level).`,
        files: ["0-mc_eval.py", "README.md"],
        checks: [
          { type: "defines", path: "0-mc_eval.py", names: ["mc_predict", "accuracy", "bootstrap_ci"] },
          { type: "readme", path: "README.md", minWords: 150 },
          { type: "py_test", files: ["0-mc_eval.py"], label: "raw vs length-normalized argmax and a sensible bootstrap CI",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-mc_eval')
lp = np.array([[-10.0, -12.0, -30.0], [-5.0, -4.0, -6.0]])
ln = np.array([[2, 4, 15], [1, 1, 1]])
assert list(np.asarray(m.mc_predict(lp))) == [0, 1]
assert list(np.asarray(m.mc_predict(lp, ln))) == [2, 1]
assert np.isclose(m.accuracy(np.array([0, 1, 2]), np.array([0, 2, 2])), 2 / 3)
rng = np.random.default_rng(1)
c = (rng.random(400) < 0.6).astype(float)
lo, hi = m.bootstrap_ci(c, n_boot=4000, alpha=0.05, seed=0)
p = c.mean(); se = np.sqrt(p * (1 - p) / 400)
assert lo < p < hi
assert abs((hi - lo) - 2 * 1.96 * se) < 0.25 * 2 * 1.96 * se, (lo, hi)
lo9, hi9 = m.bootstrap_ci(c, n_boot=4000, alpha=0.5, seed=0)
assert hi9 - lo9 < hi - lo
print("ok")` },
        ],
      },
      {
        title: "n-gram contamination check",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`1-contamination.py\` (standard library + NumPy):

- \`def normalize(text):\` → list of tokens: lowercase, replace every non-alphanumeric character with a space, split on whitespace.
- \`def ngrams(tokens, n):\` → \`set\` of \`n\`-tuples (empty if \`len(tokens) < n\`).
- \`def contaminated(test_docs, train_docs, n=13):\` → boolean NumPy array, True for each test doc sharing ≥ 1 normalized \`n\`-gram with any train doc. Build the train n-gram set once (no quadratic doc-vs-doc loop).
- \`def contamination_rate(test_docs, train_docs, n=13):\` → fraction of contaminated test docs.

Run it between the benchmarks you use in task 2 and your TinyStories training data (and between TinyStories train/validation) and report the numbers.`,
        files: ["1-contamination.py"],
        checks: [
          { type: "defines", path: "1-contamination.py", names: ["normalize", "ngrams", "contaminated", "contamination_rate"] },
          { type: "py_test", files: ["1-contamination.py"], label: "normalization and n-gram overlap",
            code: py`import numpy as np
from importlib import import_module
m = import_module('1-contamination')
assert m.normalize("Hello, World!  It's 2024.") == ["hello", "world", "it", "s", "2024"]
assert m.ngrams(["a", "b", "c", "d"], 3) == {("a", "b", "c"), ("b", "c", "d")}
assert m.ngrams(["a", "b"], 3) == set()
train = ["The cat sat on the mat and looked at the dog.", "Completely unrelated sentence about rockets and fuel."]
test = ["Yesterday THE CAT sat on the mat, and then it slept.",
        "Rockets need fuel; unrelated sentence.",
        "Nothing in common here at all."]
c = np.asarray(m.contaminated(test, train, n=5))
assert c.dtype == bool and list(c) == [True, False, False]
assert list(np.asarray(m.contaminated(test, train, n=2))) == [True, True, False]
assert np.isclose(m.contamination_rate(test, train, n=5), 1 / 3)
print("ok")` },
        ],
      },
      {
        title: "Evaluate your LM on 2–3 benchmarks",
        type: "mandatory", kind: "code", points: 4,
        body: md`In \`2-evaluate.py\` evaluate your A43 base model and A44 DPO model on 2–3 benchmarks appropriate to its scale (e.g. HellaSwag, ARC-Easy, BLiMP, LAMBADA, a TinyStories cloze set you build), using your \`mc_predict\` (both raw and length-normalized) on ≥ 1 000 examples per benchmark, zero-shot. Optionally cross-check one benchmark with \`lm-evaluation-harness\` via a custom model wrapper.

Write \`results.json\` with \`n_benchmarks\`, \`total_examples\`, and per-benchmark \`<name>_acc\`, \`<name>_acc_norm\`, \`<name>_ci_low\`, \`<name>_ci_high\`, \`<name>_chance\`. **Targets:** \`n_benchmarks >= 2\`, \`total_examples >= 2000\`.`,
        files: ["2-evaluate.py", "results.json"],
        checks: [
          { type: "contains", path: "2-evaluate.py", pattern: "mc_predict", label: "uses your scorer" },
          { type: "contains", path: "2-evaluate.py", pattern: "bootstrap_ci", label: "reports CIs" },
          { type: "json_metric", path: "results.json", key: "n_benchmarks", op: ">=", value: 2 },
          { type: "json_metric", path: "results.json", key: "total_examples", op: ">=", value: 2000 },
        ],
      },
      {
        title: "Honest evaluation report",
        type: "mandatory", kind: "written", points: 2,
        body: md`\`written/3-eval_report.md\` (PDF, Markdown or LaTeX accepted): table of accuracy ± 95% CI vs chance for every benchmark and model; whether base vs DPO differences are significant (paired bootstrap); the effect of length normalization and of prompt format (try 2 formats on one benchmark); contamination rates; and a paragraph on which benchmarks are meaningless at your model's scale and why.`,
        deliverable: "repo",
        files: ["written/3-eval_report.md"],
        rubric: "report",
        criteria: [
          "Every number has a CI and is compared with chance",
          "Significance test for base vs DPO (paired)",
          "Shows sensitivity to length normalization and prompt format",
          "Reports contamination rates from the n-gram check",
          "Argues which benchmarks are informative at this scale",
        ],
      },
      {
        title: "Embedding-based contamination",
        type: "advanced", kind: "code", points: 2,
        body: md`In \`100-semantic_contamination.py\` detect paraphrased contamination with sentence embeddings (cosine ≥ τ against a FAISS/NumPy index of training chunks); compare with 13-gram overlap on 200 hand-checked examples and report precision/recall in the README.`,
        files: ["100-semantic_contamination.py"],
        checks: [
          { type: "exists", path: "100-semantic_contamination.py" },
          { type: "contains", path: "100-semantic_contamination.py", pattern: "cos|normalize|faiss", label: "similarity search" },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A46
  {
    id: "A46",
    track: TRACK,
    phase: PHASE,
    title: "LLM-as-Judge, Reliability & Red-Teaming",
    days: 2,
    repo: REPO,
    dir: "0x06-llm_judge",
    sources: [
      { course: "EVAL", lectures: "LLM-as-judge & reliability", topics: "LLM-as-judge, position/verbosity/self-preference bias, inter-rater agreement, red-teaming, designing capability evals" },
    ],
    resources: [
      { title: "Zheng et al. 2023 — Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena", url: "https://arxiv.org/abs/2306.05685" },
      { title: "Perez et al. 2022 — Red Teaming Language Models with Language Models", url: "https://arxiv.org/abs/2202.03286" },
      { title: "Ganguli et al. 2022 — Red Teaming Language Models to Reduce Harms", url: "https://arxiv.org/abs/2209.07858" },
      { title: "Wang et al. 2023 — Large Language Models are not Fair Evaluators (position bias)", url: "https://arxiv.org/abs/2305.17926" },
      { title: "Chiang et al. 2024 — Chatbot Arena", url: "https://arxiv.org/abs/2403.04132" },
    ],
    concepts: [
      "Pairwise vs single-answer grading",
      "Position, verbosity and self-preference bias",
      "Order swapping and consistency",
      "Cohen's κ vs raw agreement",
      "Designing an eval: capability definition, item writing, grading rubric, validity",
      "Red-teaming: manual and model-generated attacks",
    ],
    objectives: [
      "Compute Cohen's κ and explain why it corrects raw agreement for chance",
      "Measure position bias of an LLM judge by swapping order",
      "Validate a judge against your own human labels",
      "Design and run an eval for a capability your model plausibly has",
    ],
    requirements: ["NumPy / standard library only for tasks 0–1", "Any open LLM (local or API) as judge"],
    quiz: [
      { q: "Two raters agree on 90% of items, but 90% of items are 'pass' for both. κ is…",
        options: ["0.9", "close to 0 or lower — agreement is what chance predicts", "1.0", "undefined"], answer: 1,
        why: "κ = (p_o − p_e)/(1 − p_e); with p_e ≈ 0.82 agreement barely exceeds chance." },
      { q: "The standard mitigation for position bias in pairwise judging is…",
        options: ["use a bigger judge", "evaluate both orders and count only consistent verdicts (or average)", "always put the baseline first", "ask for a score 1–10"], answer: 1,
        why: "Swap the order and treat inconsistent pairs as ties." },
      { q: "Red-teaming with a language model (Perez et al.) means…",
        options: ["fine-tuning on harmful data", "using an LM to generate test inputs that elicit failures, then classifying the outputs", "hiding the system prompt", "removing safety filters"], answer: 1,
        why: "Automated test-case generation scales failure discovery." },
    ],
    tasks: [
      {
        title: "Agreement statistics",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`0-agreement.py\`:

- \`def percent_agreement(a, b):\` → fraction of items where the two label sequences agree.
- \`def cohen_kappa(a, b):\` → $\kappa = (p_o - p_e)/(1 - p_e)$ for arbitrary hashable labels (strings or ints), with $p_e = \sum_k p_a(k)p_b(k)$; return \`1.0\` when $p_e = 1$.

Also create \`README.md\` (≥ 120 words) summarizing your judge and eval results.`,
        files: ["0-agreement.py", "README.md"],
        checks: [
          { type: "defines", path: "0-agreement.py", names: ["percent_agreement", "cohen_kappa"] },
          { type: "readme", path: "README.md", minWords: 120 },
          { type: "py_test", files: ["0-agreement.py"], label: "κ matches the confusion-matrix formula",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-agreement')
a = ["y", "y", "n", "y", "n", "y", "y", "n", "y", "y"]
b = ["y", "n", "n", "y", "n", "y", "y", "y", "y", "n"]
po = 7 / 10
pe = 0.7 * 0.6 + 0.3 * 0.4
assert np.isclose(m.percent_agreement(a, b), po)
assert np.isclose(m.cohen_kappa(a, b), (po - pe) / (1 - pe))
rng = np.random.default_rng(0)
x = rng.integers(0, 3, 500); y = np.where(rng.random(500) < 0.7, x, rng.integers(0, 3, 500))
C = np.zeros((3, 3))
for i, j in zip(x, y):
    C[i, j] += 1
C /= C.sum(); po2 = np.trace(C); pe2 = C.sum(1) @ C.sum(0)
assert np.isclose(m.cohen_kappa(list(x), list(y)), (po2 - pe2) / (1 - pe2))
assert np.isclose(m.cohen_kappa(["a"] * 5, ["a"] * 5), 1.0)
assert np.isclose(m.cohen_kappa(["a", "b"] * 5, ["b", "a"] * 5), -1.0)
print("ok")` },
        ],
      },
      {
        title: "Position-bias statistics",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`1-position_bias.py\` write \`def position_bias(verdicts_xy, verdicts_yx):\` → dict.

- \`verdicts_xy[i]\` ∈ {\`"A"\`, \`"B"\`, \`"tie"\`} is the judge's verdict when response $x_i$ is shown first (as A) and $y_i$ second; \`verdicts_yx[i]\` when the order is swapped ($y_i$ as A).
- A pair is **consistent** if (\`"A"\`, \`"B"\`), (\`"B"\`, \`"A"\`) or (\`"tie"\`, \`"tie"\`).
- Return \`{"consistency": …, "first_position_rate": …, "x_win_rate": …}\` where \`first_position_rate\` = fraction of all $2n$ verdicts that are \`"A"\`, and \`x_win_rate\` = over consistent pairs, fraction where $x$ wins, counting consistent ties as 0.5 (\`nan\` if no consistent pairs).`,
        files: ["1-position_bias.py"],
        checks: [
          { type: "defines", path: "1-position_bias.py", names: ["position_bias"] },
          { type: "py_test", files: ["1-position_bias.py"], label: "consistency, first-position rate, debiased win rate",
            code: py`import numpy as np
from importlib import import_module
m = import_module('1-position_bias')
xy = ["A", "A", "B", "tie", "A", "B"]
yx = ["B", "A", "A", "tie", "tie", "B"]
r = m.position_bias(xy, yx)
assert np.isclose(r["consistency"], 3 / 6)
assert np.isclose(r["first_position_rate"], 5 / 12)
assert np.isclose(r["x_win_rate"], (1 + 0 + 0.5) / 3)
r2 = m.position_bias(["A", "A"], ["A", "A"])
assert np.isclose(r2["consistency"], 0) and np.isclose(r2["first_position_rate"], 1.0)
assert np.isnan(r2["x_win_rate"])
print("ok")` },
        ],
      },
      {
        title: "Judge reliability experiment",
        type: "mandatory", kind: "code", points: 3,
        body: md`In \`2-judge_experiment.py\` use an open LLM judge (e.g. a 7–8B instruct model locally, or an API model) to compare pairs of responses from your A44 SFT and DPO models (or any two models) on ≥ 100 prompts, **in both orders**. Label 50 pairs yourself blind. Write \`results.json\` with \`n_pairs\`, \`consistency\`, \`first_position_rate\`, \`kappa_judge_vs_human\`, \`judge_human_agreement\`, \`length_win_correlation\` (correlation between length difference and verdict). **Targets:** \`n_pairs >= 100\`, \`kappa_judge_vs_human\` present (any value — report honestly).`,
        files: ["2-judge_experiment.py", "results.json"],
        checks: [
          { type: "contains", path: "2-judge_experiment.py", pattern: "position_bias", label: "uses your bias statistic" },
          { type: "contains", path: "2-judge_experiment.py", pattern: "cohen_kappa", label: "uses your κ" },
          { type: "json_metric", path: "results.json", key: "n_pairs", op: ">=", value: 100 },
          { type: "json_metric", path: "results.json", key: "kappa_judge_vs_human", op: ">=", value: -1 },
        ],
      },
      {
        title: "Design and run your own capability eval",
        type: "mandatory", kind: "written", points: 3,
        body: md`\`written/3-capability_eval.md\` (PDF, Markdown or LaTeX accepted) plus the eval items in \`eval_items.jsonl\` (≥ 100 items). Pick a capability your own small LM plausibly has (e.g. keeping a character's name consistent across a story, following a word-inclusion constraint, simple counting in stories). Document: capability definition, item construction (and how you avoided leakage from training data), automatic grading rule and its validation against your own labels, results for your base / SFT / DPO models with CIs, and a short red-teaming section: 20 adversarial prompts and what broke.`,
        deliverable: "repo",
        files: ["written/3-capability_eval.md"],
        rubric: "report",
        criteria: [
          "Precise capability definition with ≥ 100 items and a leakage argument",
          "Grading rule validated against human labels (agreement or κ reported)",
          "Results for ≥ 2 models with confidence intervals",
          "Red-teaming section with concrete failures and categories",
          "Discusses validity threats of the eval",
        ],
      },
      {
        title: "Automated red-teaming",
        type: "advanced", kind: "code", points: 2,
        body: md`In \`100-red_team.py\` use an LM to generate ≥ 500 test prompts targeting one failure (e.g. breaking the story-constraint, toxic continuations), run them on your model, classify outputs automatically, and report the failure rate and the top-5 failure clusters in the README.`,
        files: ["100-red_team.py"],
        checks: [
          { type: "exists", path: "100-red_team.py" },
          { type: "contains", path: "100-red_team.py", pattern: "generate", label: "generates test prompts" },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A47
  {
    id: "A47",
    track: TRACK,
    phase: PHASE,
    title: "Compute-Optimal Training: Chinchilla",
    days: 2,
    repo: REPO,
    dir: "0x07-chinchilla",
    sources: [
      { course: "EVAL", lectures: "Scaling laws in depth", topics: "Compute-optimal training, Chinchilla approaches 1–3, C ≈ 6ND, IsoFLOP curves, over-training for inference" },
    ],
    resources: [
      { title: "Hoffmann et al. 2022 — Training Compute-Optimal Large Language Models (Chinchilla)", url: "https://arxiv.org/abs/2203.15556" },
      { title: "Besiroglu et al. 2024 — Chinchilla Scaling: A Replication Attempt", url: "https://arxiv.org/abs/2404.10102" },
      { title: "Kaplan et al. 2020 — Scaling Laws for Neural Language Models", url: "https://arxiv.org/abs/2001.08361" },
      { title: "Sardana et al. 2023 — Beyond Chinchilla-Optimal: Accounting for Inference", url: "https://arxiv.org/abs/2401.00448" },
    ],
    concepts: [
      "Training FLOPs C ≈ 6ND",
      "Parametric loss L(N, D) = E + A/N^α + B/D^β",
      "Compute-optimal frontier N_opt ∝ C^a, D_opt ∝ C^b",
      "≈ 20 tokens per parameter rule of thumb",
      "Over-training smaller models for cheaper inference",
    ],
    objectives: [
      "Derive C ≈ 6ND from forward/backward FLOP counting",
      "Solve the constrained minimization of L(N, D) subject to 6ND = C in closed form",
      "Compute the compute-optimal model size and tokens for a given budget",
      "Explain the three Chinchilla estimation approaches and why they disagree slightly",
    ],
    requirements: ["NumPy only"],
    quiz: [
      { q: "Where does the 6 in C ≈ 6ND come from?",
        options: ["6 layers", "2 FLOPs per parameter per token forward (multiply-add) + 4 backward", "6 bytes per parameter", "Adam's 6 states"], answer: 1,
        why: "Backward costs about twice the forward." },
      { q: "Chinchilla's main finding is that for compute-optimal training…",
        options: ["model size should grow much faster than data", "parameters and tokens should be scaled in roughly equal proportion (~20 tokens/param)", "data doesn't matter", "smaller models are always better"], answer: 1,
        why: "N_opt ∝ C^~0.5 and D_opt ∝ C^~0.5." },
      { q: "Why do practitioners often train far past Chinchilla-optimal (e.g. LLaMA)?",
        options: ["It lowers training loss per FLOP", "Inference cost depends on N, so a smaller model trained longer is cheaper to serve", "Chinchilla was wrong", "To reduce data needs"], answer: 1,
        why: "Total cost = training + inference over the model's lifetime." },
    ],
    tasks: [
      {
        title: "Compute-optimal allocation solver",
        type: "mandatory", kind: "code", points: 3,
        body: md`In \`0-chinchilla.py\` (NumPy only):

- \`def training_flops(N, D):\` → $6ND$.
- \`def chinchilla_loss(N, D, E=1.69, A=406.4, B=410.7, alpha=0.34, beta=0.28):\` → $E + A/N^\alpha + B/D^\beta$ (Approach 3 fit).
- \`def compute_optimal(C, E=1.69, A=406.4, B=410.7, alpha=0.34, beta=0.28):\` → \`(N_opt, D_opt)\` minimizing the loss subject to $6ND = C$, **in closed form**: $N_\text{opt} = G\,(C/6)^{\beta/(\alpha+\beta)}$, $D_\text{opt} = G^{-1}(C/6)^{\alpha/(\alpha+\beta)}$, $G = \big(\frac{\alpha A}{\beta B}\big)^{1/(\alpha+\beta)}$.
- \`def twenty_tokens_rule(C):\` → \`(N, D)\` with $D = 20N$ and $6ND = C$.

Also create \`README.md\` (≥ 100 words) with a table of $N_\text{opt}, D_\text{opt}$ for $C \in \{10^{18}, 10^{20}, 10^{22}, 10^{24}\}$ under both rules.`,
        files: ["0-chinchilla.py", "README.md"],
        checks: [
          { type: "defines", path: "0-chinchilla.py", names: ["training_flops", "chinchilla_loss", "compute_optimal", "twenty_tokens_rule"] },
          { type: "readme", path: "README.md", minWords: 100 },
          { type: "py_test", files: ["0-chinchilla.py"], label: "closed form agrees with brute-force search on the budget constraint",
            code: py`import numpy as np
from importlib import import_module
m = import_module('0-chinchilla')
assert np.isclose(m.training_flops(1e9, 2e10), 1.2e20)
assert np.isclose(m.chinchilla_loss(1e9, 1e10), 1.69 + 406.4 / 1e9**0.34 + 410.7 / 1e10**0.28)
for C in (1e19, 5.76e23):
    N, D = m.compute_optimal(C)
    assert np.isclose(6 * N * D, C, rtol=1e-8), "must satisfy the budget"
    Ns = np.logspace(np.log10(N) - 1, np.log10(N) + 1, 20001)
    Ls = m.chinchilla_loss(Ns, C / (6 * Ns))
    Nb = Ns[np.argmin(Ls)]
    assert abs(np.log(N / Nb)) < 0.01, (N, Nb)
N70, D70 = m.compute_optimal(5.76e23)
assert 2e10 < N70 < 6e10, N70
N, D = m.twenty_tokens_rule(1.2e22)
assert np.isclose(D, 20 * N) and np.isclose(6 * N * D, 1.2e22) and np.isclose(N, 1e10)
print("ok")` },
        ],
      },
      {
        title: "Two-page Chinchilla summary",
        type: "mandatory", kind: "written", points: 3,
        body: md`Publish a 2-page (~1 000 words) summary of the Chinchilla paper on Medium or your blog and submit the URL. Cover: the question, the three approaches (fixed model sizes with varying tokens; IsoFLOP profiles; parametric fit) and their estimated exponents, the Chinchilla vs Gopher result, why Kaplan et al. got different exponents, the replication critique (Besiroglu et al. 2024), and implications for inference-heavy deployment. Include one figure you produce with your solver.`,
        deliverable: "link",
        rubric: "summary",
        criteria: [
          "Explains all three approaches and their exponent estimates (a ≈ 0.5)",
          "States the Chinchilla (70B, 1.4T tokens) vs Gopher (280B, 300B tokens) comparison",
          "Explains the Kaplan discrepancy (LR schedule / embedding params / small models)",
          "Mentions the replication critique of Approach 3",
          "Includes an original figure made with the author's solver",
        ],
      },
      {
        title: "Were your A43 runs compute-optimal?",
        type: "mandatory", kind: "written", points: 1,
        body: md`\`written/2-my_runs.md\` (PDF, Markdown or LaTeX accepted): for each A43 run compute $C = 6ND$, the Chinchilla-optimal $(N, D)$ for that $C$ (both rules), and your tokens-per-parameter ratio. Fit $L(N, D)$'s $E$ and one exponent to your own runs if you can. Conclude what model you *should* train with your remaining GPU budget.`,
        deliverable: "repo",
        files: ["written/2-my_runs.md"],
        rubric: "report",
        criteria: [
          "Table with C, N, D, tokens/param for every A43 run",
          "Compares each run with both optimal allocations",
          "Gives a concrete, justified recommendation for the next run",
        ],
      },
      {
        title: "Fit Approach 3 on synthetic data",
        type: "advanced", kind: "code", points: 2,
        body: md`In \`100-fit_approach3.py\` generate noisy synthetic $(N, D, L)$ from the published law, then fit $(E, A, B, \alpha, \beta)$ with the Huber-loss + L-BFGS procedure of the paper (log-space parameterization, grid of initializations). Report recovered parameters and their bootstrap spread in the README.`,
        files: ["100-fit_approach3.py"],
        checks: [
          { type: "exists", path: "100-fit_approach3.py" },
          { type: "contains", path: "100-fit_approach3.py", pattern: "[Hh]uber", label: "Huber loss" },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A48
  {
    id: "A48",
    track: TRACK,
    phase: PHASE,
    title: "Capstone I: Proposal",
    days: 2,
    repo: CAP,
    dir: "0x00-proposal",
    sources: [
      { course: "CS336", lectures: "Review", topics: "Re-watch the lectures that match your chosen track (Track A: Lec 1–10; Track B: the paper's topic; Track C: evaluation lectures)" },
      { course: "EVAL", lectures: "Review", topics: "Evaluation design and reliability for your capstone's metric" },
    ],
    resources: [
      { title: "Karpathy — A Recipe for Training Neural Networks", url: "http://karpathy.github.io/2019/04/25/recipe/" },
      { title: "Gu & Dao 2023 — Mamba (example Track B paper)", url: "https://arxiv.org/abs/2312.00752" },
      { title: "Lewis et al. 2020 — Retrieval-Augmented Generation (example Track C foundation)", url: "https://arxiv.org/abs/2005.11401" },
      { title: "Henderson et al. 2017 — Deep RL that Matters (reproducibility lessons)", url: "https://arxiv.org/abs/1709.06560" },
    ],
    concepts: [
      "Scoping: a question you can answer in 4 weeks on one GPU",
      "Track A (training), B (reproduction), C (applied systems)",
      "Baselines and success criteria defined before experiments",
      "Compute and data budgets",
      "Risk register and fallback plans",
    ],
    objectives: [
      "Choose a capstone track and a precise, falsifiable goal",
      "Define baselines, metrics, and success thresholds in advance",
      "Estimate compute, memory and data requirements with your Phase 5 calculators",
      "Write a proposal that another engineer could execute",
    ],
    requirements: ["Repo: ml-capstone (public)", "Proposal before any large-scale experiment"],
    quiz: [
      { q: "Which is the best capstone goal statement?",
        options: ["Explore LLMs for law", "Train a 50M-param LM on 2B tokens of US case law and beat GPT-2-small's perplexity on a held-out legal set by ≥ 10%", "Make the best legal chatbot", "Learn about transformers"], answer: 1,
        why: "Specific, measurable, bounded, and has a baseline." },
      { q: "Why fix the evaluation metric and baseline before running experiments?",
        options: ["It is faster", "To avoid choosing metrics post hoc that flatter the result (garden of forking paths)", "Reviewers require it", "Baselines are irrelevant"], answer: 1,
        why: "Pre-registration keeps results honest." },
      { q: "A reproduction (Track B) is successful when…",
        options: ["numbers match exactly", "the main claim is tested, deviations are explained, and ablations probe why it works", "the code runs", "you use the authors' code unchanged"], answer: 1,
        why: "The value is in understanding and honest reporting." },
    ],
    tasks: [
      {
        title: "Capstone repository skeleton",
        type: "mandatory", kind: "code", points: 1,
        body: md`Create the public \`ml-capstone\` repo with \`0x00-proposal/README.md\` (≥ 200 words: track, one-sentence goal, success criterion, timeline), \`0x00-proposal/requirements.txt\`, and a \`.gitignore\` that excludes checkpoints and data. The README must contain the headings \`## Goal\`, \`## Baseline\`, \`## Metric\`, \`## Timeline\`.`,
        files: ["README.md", "requirements.txt"],
        checks: [
          { type: "readme", path: "README.md", minWords: 200 },
          { type: "contains", path: "README.md", pattern: "^##\\s*Goal", label: "Goal section" },
          { type: "contains", path: "README.md", pattern: "^##\\s*Baseline", label: "Baseline section" },
          { type: "contains", path: "README.md", pattern: "^##\\s*Metric", label: "Metric section" },
          { type: "exists", path: "requirements.txt" },
        ],
      },
      {
        title: "Written proposal",
        type: "mandatory", kind: "written", points: 4,
        body: md`\`written/proposal.pdf\` (PDF, Markdown or LaTeX accepted), 2–3 pages. Choose one:

- **Track A — Training:** domain-specific small LM end-to-end (data collection, tokenizer, pretraining, SFT, evaluation).
- **Track B — Reproduction:** a recent paper (e.g. DPO, Mamba, an MoE) with ablations.
- **Track C — Applied systems:** a production-grade agent or RAG system with retrieval, evaluation harness and monitoring.

Sections: motivation; precise goal and hypothesis; data (source, size, license, cleaning); method; baselines; metrics and success thresholds; compute plan (use your \`0-memory.py\` and \`0-chinchilla.py\`: params, tokens, FLOPs, GPU-hours); 4-week timeline with milestone deliverables; risks and fallbacks.`,
        deliverable: "repo",
        files: ["written/proposal.pdf"],
        rubric: "report",
        criteria: [
          "Track chosen with a specific, falsifiable goal",
          "Data source, size and license specified",
          "At least one concrete baseline and a pre-declared success threshold",
          "Compute estimate in FLOPs / GPU-hours using the Phase 5 calculators",
          "Week-by-week plan with a risk register and fallback scope",
        ],
      },
      {
        title: "Related-work notes",
        type: "mandatory", kind: "written", points: 2,
        body: md`\`written/related_work.md\` (PDF, Markdown or LaTeX accepted): 4–6 papers or systems closest to your project, each with a 5-line summary (problem, method, key result, what you reuse, what you do differently), and a paragraph positioning your project.`,
        deliverable: "repo",
        files: ["written/related_work.md"],
        rubric: "summary",
        criteria: [
          "4–6 relevant works with accurate summaries",
          "Each states what is reused vs what differs",
          "Positioning paragraph identifies the gap or reproduction target",
        ],
      },
      {
        title: "Evaluation plan",
        type: "mandatory", kind: "written", points: 2,
        body: md`\`written/eval_plan.md\` (PDF, Markdown or LaTeX accepted): every metric with its exact computation, datasets/splits (with a contamination check plan from A45), number of seeds, confidence-interval method, and the ablations you will run. State in advance what result would count as failure.`,
        deliverable: "repo",
        files: ["written/eval_plan.md"],
        rubric: "report",
        criteria: [
          "Exact metric definitions and splits",
          "Seeds and CI method specified",
          "Planned ablations listed",
          "Failure condition stated in advance",
        ],
      },
      {
        title: "Data card",
        type: "advanced", kind: "written", points: 1,
        body: md`\`written/data_card.md\`: provenance, licensing, PII handling, known biases, and intended/unintended uses of your capstone data (follow the "Datasheets for Datasets" questions).`,
        deliverable: "repo",
        files: ["written/data_card.md"],
        rubric: "report",
        criteria: [
          "Provenance and license documented",
          "PII and bias risks addressed",
          "Intended and out-of-scope uses stated",
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A49
  {
    id: "A49",
    track: TRACK,
    phase: PHASE,
    title: "Capstone II: Milestone",
    days: 6,
    repo: CAP,
    dir: "0x01-milestone",
    sources: [
      { course: "CS336", lectures: "As needed", topics: "Lectures relevant to your track's open problems (data, systems, scaling, alignment)" },
      { course: "EVAL", lectures: "As needed", topics: "Evaluation harness design, error bars, judge reliability" },
    ],
    resources: [
      { title: "Karpathy — A Recipe for Training Neural Networks", url: "http://karpathy.github.io/2019/04/25/recipe/" },
      { title: "EleutherAI lm-evaluation-harness", url: "https://github.com/EleutherAI/lm-evaluation-harness" },
      { title: "Miller 2024 — Adding Error Bars to Evals", url: "https://arxiv.org/abs/2411.00640" },
      { title: "PyTorch docs — Reproducibility", url: "https://pytorch.org/docs/stable/notes/randomness.html" },
    ],
    concepts: [
      "Working end-to-end baseline before optimization",
      "Evaluation harness as a reusable, tested component",
      "Experiment tracking and seeds",
      "Overfitting a tiny batch as a sanity check",
      "Scope adjustment at the midpoint",
    ],
    objectives: [
      "Deliver a working baseline end-to-end on real data",
      "Build an automated, tested evaluation harness with confidence intervals",
      "Log every experiment reproducibly",
      "Write a milestone report and re-scope honestly",
    ],
    requirements: ["Repo: ml-capstone, directory 0x01-milestone", "Every result reproducible from a committed config + seed"],
    quiz: [
      { q: "Your loss won't go down. The first thing to try is…",
        options: ["a bigger model", "overfit a single small batch to near-zero loss to check the pipeline", "a new optimizer", "more data"], answer: 1,
        why: "If you can't overfit one batch, there's a bug." },
      { q: "Why unit-test the evaluation harness?",
        options: ["Coverage metrics", "A silent bug in the metric invalidates every experiment that follows", "It's faster", "Graders ask for it"], answer: 1,
        why: "The metric is the one component every result depends on." },
      { q: "At the midpoint your main approach is 3 weeks behind schedule. The right move is…",
        options: ["work harder and keep the scope", "invoke the fallback from your risk register and document the change", "abandon the project", "skip evaluation"], answer: 1,
        why: "Planned re-scoping keeps a deliverable." },
    ],
    tasks: [
      {
        title: "Data pipeline",
        type: "mandatory", kind: "code", points: 2,
        body: md`In \`0x01-milestone/data/\` commit the scripts (not the data) that download, clean, deduplicate and split your data deterministically (\`prepare_data.py\`), plus \`data/README.md\` with counts per split and a 20-example sample. Write \`README.md\` (≥ 200 words) for the milestone directory.`,
        files: ["data/prepare_data.py", "data/README.md", "README.md"],
        checks: [
          { type: "exists", path: "data/prepare_data.py" },
          { type: "contains", path: "data/prepare_data.py", pattern: "seed", label: "deterministic split" },
          { type: "readme", path: "data/README.md", minWords: 80 },
          { type: "readme", path: "README.md", minWords: 200 },
        ],
      },
      {
        title: "Working baseline",
        type: "mandatory", kind: "code", points: 4,
        body: md`\`baseline.py\` runs your baseline end-to-end (Track A: a trained small LM; Track B: the paper's main setting at reduced scale; Track C: a minimal retrieval + generation pipeline). Config in \`configs/baseline.yaml\` (or .json). Write \`results.json\`:

~~~json
{"track": "A", "metric_name": "val_ppl", "baseline_value": 18.4, "n_eval_examples": 2000, "seeds": 2}
~~~

**Targets:** \`n_eval_examples >= 200\`, \`seeds >= 2\`.`,
        files: ["baseline.py", "results.json"],
        checks: [
          { type: "exists", path: "baseline.py" },
          { type: "exists", path: "configs" },
          { type: "json_metric", path: "results.json", key: "n_eval_examples", op: ">=", value: 200 },
          { type: "json_metric", path: "results.json", key: "seeds", op: ">=", value: 2 },
        ],
      },
      {
        title: "Evaluation harness with tests",
        type: "mandatory", kind: "code", points: 4,
        body: md`\`eval_harness.py\` exposes \`def evaluate(predictions, references, **kwargs) -> dict\` returning every metric from your eval plan **with bootstrap CIs**, and \`metrics.py\` defines \`def bootstrap_mean_ci(scores, n_boot=2000, alpha=0.05, seed=0) -> (low, high)\` (NumPy only, percentile bootstrap). Unit tests in \`tests/test_eval.py\` (pytest) cover edge cases (empty input, perfect/zero scores, known values).`,
        files: ["eval_harness.py", "metrics.py", "tests/test_eval.py"],
        checks: [
          { type: "defines", path: "eval_harness.py", names: ["evaluate"] },
          { type: "defines", path: "metrics.py", names: ["bootstrap_mean_ci"] },
          { type: "contains", path: "tests/test_eval.py", pattern: "def test_", label: "pytest tests" },
          { type: "py_test", files: ["metrics.py"], label: "bootstrap CI brackets the mean with sensible width",
            code: py`import numpy as np
from importlib import import_module
m = import_module('metrics')
rng = np.random.default_rng(3)
s = rng.normal(0.5, 0.2, 500)
lo, hi = m.bootstrap_mean_ci(s, n_boot=2000, alpha=0.05, seed=0)
se = s.std(ddof=1) / np.sqrt(500)
assert lo < s.mean() < hi
assert abs((hi - lo) - 2 * 1.96 * se) < 0.3 * 2 * 1.96 * se
lo2, hi2 = m.bootstrap_mean_ci(np.ones(50), seed=0)
assert np.isclose(lo2, 1.0) and np.isclose(hi2, 1.0)
print("ok")` },
        ],
      },
      {
        title: "Experiment log",
        type: "mandatory", kind: "code", points: 1,
        body: md`\`experiments.md\`: one entry per run (date, git commit, config, seed, hardware, wall time, metric ± CI, one-line conclusion). At least 8 runs including the overfit-one-batch sanity check.`,
        files: ["experiments.md"],
        checks: [
          { type: "nonempty", path: "experiments.md", minLines: 20 },
          { type: "contains", path: "experiments.md", pattern: "[Oo]verfit", label: "overfit-one-batch sanity check" },
        ],
      },
      {
        title: "Milestone report",
        type: "mandatory", kind: "written", points: 4,
        body: md`\`written/milestone.pdf\` (PDF, Markdown or LaTeX accepted), 3–4 pages: what's done vs the proposal, baseline results with CIs, one error analysis (20+ failure cases categorized), what didn't work, and a re-scoped plan for the final 2 weeks with explicit cuts.`,
        deliverable: "repo",
        files: ["written/milestone.pdf"],
        rubric: "report",
        criteria: [
          "Compares progress against the proposal timeline honestly",
          "Baseline results with confidence intervals and seeds",
          "Categorized error analysis of ≥ 20 failures",
          "Concrete re-scoped plan with what is cut and why",
        ],
      },
      {
        title: "First ablation",
        type: "advanced", kind: "code", points: 2,
        body: md`Run one ablation from your eval plan with ≥ 2 seeds and add \`"ablation_1_value"\` and \`"ablation_1_name"\` to \`results.json\`; discuss in the milestone report.`,
        files: ["results.json"],
        checks: [
          { type: "json_metric", path: "results.json", key: "ablation_1_value", op: ">=", value: -1e12 },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── A50
  {
    id: "A50",
    track: TRACK,
    phase: PHASE,
    title: "Capstone III: Final Report & Portfolio",
    days: 7,
    repo: CAP,
    dir: "0x02-final",
    sources: [
      { course: "CS336", lectures: "As needed", topics: "Final experiments for your track" },
      { course: "EVAL", lectures: "As needed", topics: "Final evaluation, error bars, honest reporting" },
    ],
    resources: [
      { title: "Karpathy — A Recipe for Training Neural Networks", url: "http://karpathy.github.io/2019/04/25/recipe/" },
      { title: "Mitchell et al. 2018 — Model Cards for Model Reporting", url: "https://arxiv.org/abs/1810.03993" },
      { title: "Gebru et al. 2018 — Datasheets for Datasets", url: "https://arxiv.org/abs/1803.09010" },
      { title: "Pineau et al. 2020 — Improving Reproducibility in ML Research (NeurIPS 2019 program)", url: "https://arxiv.org/abs/2003.12206" },
    ],
    concepts: [
      "Ablations that isolate causes",
      "Reproducible code release (pinned environment, one-command reproduction)",
      "Model cards and limitations sections",
      "Technical writing for a public audience",
      "Portfolio narrative and research direction",
    ],
    objectives: [
      "Finish final experiments with ablations and multiple seeds",
      "Release code that reproduces the headline result with one command",
      "Publish a 5–10 page public write-up",
      "Write a portfolio README that tells the story of the year",
      "Articulate 5 open research questions raised by the year",
    ],
    requirements: ["Repo: ml-capstone, directory 0x02-final", "Public write-up and public repos"],
    quiz: [
      { q: "An ablation is informative when…",
        options: ["it removes one component while holding everything else fixed, with enough seeds to see the effect", "it changes many things at once", "it uses a different dataset", "it is run once"], answer: 0,
        why: "Isolate one variable; quantify noise across seeds." },
      { q: "A good limitations section…",
        options: ["is omitted to look stronger", "states concrete conditions where the results may not hold and why", "lists generic ML caveats", "only mentions compute"], answer: 1,
        why: "Specific limitations build credibility and guide future work." },
      { q: "A one-command reproduction script should…",
        options: ["require manual edits", "pin dependencies, fetch data, set seeds, and regenerate the headline table/figure", "only train", "assume a specific cluster"], answer: 1,
        why: "Anyone should be able to verify the main claim." },
    ],
    tasks: [
      {
        title: "Final experiments and ablations",
        type: "mandatory", kind: "code", points: 5,
        body: md`Run your final method plus ≥ 3 ablations with ≥ 3 seeds each. Write \`results.json\`:

~~~json
{"metric_name": "…", "final_value": 0.0, "final_ci_low": 0.0, "final_ci_high": 0.0,
 "baseline_value": 0.0, "n_ablations": 3, "seeds": 3}
~~~

**Targets:** \`n_ablations >= 3\`, \`seeds >= 3\`. Produce \`figures/\` with the headline figure and ablation table. Write \`README.md\` (≥ 400 words) for the release: what it does, results table, how to reproduce, hardware, limitations.`,
        files: ["results.json", "README.md"],
        checks: [
          { type: "json_metric", path: "results.json", key: "n_ablations", op: ">=", value: 3 },
          { type: "json_metric", path: "results.json", key: "seeds", op: ">=", value: 3 },
          { type: "exists", path: "figures" },
          { type: "readme", path: "README.md", minWords: 400 },
        ],
      },
      {
        title: "Reproducible code release",
        type: "mandatory", kind: "code", points: 3,
        body: md`Add \`reproduce.sh\` (one command: environment check, data download/prep, train or load checkpoint, evaluate, regenerate the headline table), a pinned \`requirements.txt\` (exact versions), a \`LICENSE\`, and \`MODEL_CARD.md\` (or \`SYSTEM_CARD.md\` for Track C) following Mitchell et al.`,
        files: ["reproduce.sh", "requirements.txt", "LICENSE", "MODEL_CARD.md"],
        checks: [
          { type: "nonempty", path: "reproduce.sh", minLines: 5 },
          { type: "contains", path: "requirements.txt", pattern: "==", label: "pinned versions" },
          { type: "exists", path: "LICENSE" },
          { type: "nonempty", path: "MODEL_CARD.md", minLines: 20 },
        ],
      },
      {
        title: "Public capstone write-up (5–10 pages)",
        type: "mandatory", kind: "written", points: 8,
        body: md`Publish a 5–10 page write-up (blog, Medium, or arXiv-style PDF on GitHub Pages) and submit the URL. Structure: abstract; motivation; related work; method; experimental setup (data, compute, seeds); results with CIs; ablations; error analysis; limitations and ethical considerations; conclusion; link to code. For Track B, include a "differences from the paper" table.`,
        deliverable: "link",
        rubric: "reproduction",
        criteria: [
          "Clear claim supported by results with confidence intervals and a baseline",
          "≥ 3 ablations that isolate the contribution of components",
          "Error analysis with categorized failure cases",
          "Specific limitations and ethical considerations",
          "Reproducibility details: data, compute, seeds, code link (Track B: differences-from-paper table)",
        ],
      },
      {
        title: "Portfolio README: the story of the year",
        type: "mandatory", kind: "written", points: 4,
        body: md`Create (or update) your portfolio repository's top-level README and submit its URL. It must link every phase's repo (ml-foundations → … → ml-generative-rl, ml-frontier, ml-capstone), show 1 headline result per phase (figure or number), explain how each phase built on the previous one, and end with the capstone. Write it for a hiring manager or PhD admissions reader: concise, visual, honest.`,
        deliverable: "link",
        rubric: "report",
        criteria: [
          "Links every phase's repository and the capstone write-up",
          "One concrete headline result per phase",
          "Narrative connecting the phases (what each enabled next)",
          "Readable in under 5 minutes, with figures",
        ],
      },
      {
        title: "Five open research questions",
        type: "mandatory", kind: "written", points: 2,
        body: md`\`written/open_questions.md\` (PDF, Markdown or LaTeX accepted): five research questions the year raised for you. For each: the question, why it matters, what is known (cite 1–2 papers), a concrete first experiment you could run with your current skills and compute, and what result would change your mind.`,
        deliverable: "repo",
        files: ["written/open_questions.md"],
        rubric: "essay",
        criteria: [
          "Five distinct, specific questions (not generic 'how do LLMs work')",
          "Each grounded in literature with citations",
          "Each has a feasible first experiment",
          "Each states what evidence would change the author's view",
        ],
      },
      {
        title: "Talk or video",
        type: "advanced", kind: "written", points: 2,
        body: md`Record a 10–15 minute talk (slides + voice) presenting your capstone and post it publicly; submit the URL.`,
        deliverable: "link",
        rubric: "report",
        criteria: [
          "Explains the problem and claim in the first two minutes",
          "Shows results with uncertainty and at least one ablation",
          "Ends with limitations and next steps",
        ],
      },
    ],
  },
];
