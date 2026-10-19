// "Check your code": fetches the learner's repo through the GitHub API and runs task checks.
import { loadSecrets } from "./state.js";

const api = (path) => {
  const { githubToken } = loadSecrets();
  return fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
    },
  });
};

async function apiError(res, what) {
  if (res.status === 404) return `${what} not found (if the repo is private, add a GitHub token in Settings).`;
  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get("x-ratelimit-reset");
    const when = reset ? ` Try again after ${new Date(reset * 1000).toLocaleTimeString()}.` : "";
    return `GitHub rate limit hit.${when} Add a token in Settings to raise the limit to 5,000/hour.`;
  }
  return `${what}: GitHub returned ${res.status}.`;
}

// Repo snapshot: file list + lazy content fetcher. Cached for 30 s so several checks share it.
const cache = new Map();
export async function repoSnapshot(owner, repo) {
  const k = `${owner}/${repo}`;
  const hit = cache.get(k);
  if (hit && Date.now() - hit.at < 30000) return hit.snap;
  const r = await api(`/repos/${owner}/${repo}`);
  if (!r.ok) throw new Error(await apiError(r, `Repo ${owner}/${repo}`));
  const meta = await r.json();
  const t = await api(`/repos/${owner}/${repo}/git/trees/${encodeURIComponent(meta.default_branch)}?recursive=1`);
  if (t.status === 409) throw new Error(`Repo ${owner}/${repo} is empty — push something first.`);
  if (!t.ok) throw new Error(await apiError(t, "Repo tree"));
  const tree = await t.json();
  const paths = new Map(tree.tree.map((n) => [n.path, n.type]));
  const contents = new Map();
  const snap = {
    branch: meta.default_branch,
    has: (p) => paths.has(p),
    isDir: (p) => paths.get(p) === "tree",
    list: () => [...paths.keys()],
    async read(p) {
      if (contents.has(p)) return contents.get(p);
      const res = await api(`/repos/${owner}/${repo}/contents/${p.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(meta.default_branch)}`);
      if (!res.ok) throw new Error(await apiError(res, p));
      const j = await res.json();
      let text;
      if (j.encoding === "base64" && j.content) {
        const bin = atob(j.content.replace(/\n/g, ""));
        text = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
      } else if (j.download_url) {
        text = await (await fetch(j.download_url)).text();
      } else text = "";
      contents.set(p, text);
      return text;
    },
    async readBase64(p) {
      const res = await api(`/repos/${owner}/${repo}/contents/${p.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(meta.default_branch)}`);
      if (!res.ok) throw new Error(await apiError(res, p));
      const j = await res.json();
      return (j.content || "").replace(/\n/g, "");
    },
  };
  cache.set(k, { at: Date.now(), snap });
  return snap;
}
export const clearRepoCache = () => cache.clear();

// ---- Pyodide worker ----
let worker = null;
let seq = 0;
const pending = new Map();
function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("./pyworker.js", import.meta.url));
    worker.onmessage = (e) => {
      const p = pending.get(e.data.id);
      if (p) { pending.delete(e.data.id); clearTimeout(p.timer); p.resolve(e.data); }
    };
  }
  return worker;
}
let warmed = false;
function runPython(files, code) {
  const id = ++seq;
  // First run downloads Pyodide + NumPy (~15 MB), so it gets longer.
  const limit = warmed ? 60000 : 180000;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      worker.terminate();
      worker = null;
      warmed = false;
      resolve({ ok: false, error: `Timed out after ${limit / 1000}s (infinite loop or very slow code?).` });
    }, limit);
    pending.set(id, { resolve: (r) => { warmed = true; resolve(r); }, timer });
    getWorker().postMessage({ id, files, code });
  });
}

// ---- checks ----
const join = (dir, p) => (dir ? `${dir.replace(/\/$/, "")}/${p}` : p);

function getPath(obj, dotted) {
  return dotted.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function implicitChecks(task) {
  // ALX-style requirement checks for every Python file the task asks for.
  const out = [];
  for (const f of task.files || []) {
    if (!f.endsWith(".py")) continue;
    out.push({ type: "exists", path: f, implicit: true });
    out.push({ type: "shebang", path: f, implicit: true });
    out.push({ type: "newline", path: f, implicit: true });
  }
  return out;
}

export function describe(c) {
  if (c.label) return c.label;
  switch (c.type) {
    case "exists": return `${c.path} exists`;
    case "shebang": return `${c.path}: first line is #!/usr/bin/env python3`;
    case "newline": return `${c.path}: ends with a new line`;
    case "nonempty": return `${c.path} has at least ${c.minLines || 1} non-empty line(s)`;
    case "defines": return `${c.path} defines ${c.names.join(", ")}`;
    case "contains": return `${c.path} matches /${c.pattern}/`;
    case "not_contains": return `${c.path} does not match /${c.pattern}/`;
    case "readme": return `${c.path} exists with ≥ ${c.minWords || 50} words`;
    case "notebook_executed": return `${c.path} is executed (cells have outputs)`;
    case "json_metric": return `${c.path}: ${c.key} ${c.op} ${c.value}`;
    case "py_test": return "Python test";
    default: return c.type;
  }
}

const weight = (c) => (c.implicit || c.type === "exists" ? 1 : c.type === "py_test" || c.type === "json_metric" ? 3 : 2);

async function runOne(c, snap, dir) {
  const p = c.path ? join(dir, c.path) : null;
  const need = async () => {
    if (!snap.has(p)) throw new Error(`${c.path} not found in ${dir || "repo root"}`);
    return snap.read(p);
  };
  switch (c.type) {
    case "exists":
      return snap.has(p) ? { ok: true } : { ok: false, msg: `${c.path} not found` };
    case "shebang": {
      const s = await need();
      return s.split("\n")[0].trim() === "#!/usr/bin/env python3" ? { ok: true } : { ok: false, msg: "first line must be #!/usr/bin/env python3" };
    }
    case "newline": {
      const s = await need();
      return s.endsWith("\n") ? { ok: true } : { ok: false, msg: "file must end with a new line" };
    }
    case "nonempty": {
      const s = await need();
      const n = s.split("\n").filter((l) => l.trim()).length;
      return n >= (c.minLines || 1) ? { ok: true } : { ok: false, msg: `${n} non-empty line(s), need ${c.minLines || 1}` };
    }
    case "defines": {
      const s = await need();
      const missing = c.names.filter((n) => !new RegExp(`^(def|class)\\s+${n}\\b`, "m").test(s));
      return missing.length ? { ok: false, msg: `missing: ${missing.join(", ")}` } : { ok: true };
    }
    case "contains": {
      const s = await need();
      return new RegExp(c.pattern, "m").test(s) ? { ok: true } : { ok: false, msg: "pattern not found" };
    }
    case "not_contains": {
      const s = await need();
      return new RegExp(c.pattern, "m").test(s) ? { ok: false, msg: "forbidden pattern found" } : { ok: true };
    }
    case "readme": {
      const s = await need();
      const words = s.replace(/[#*`>_\-|]/g, " ").split(/\s+/).filter(Boolean).length;
      return words >= (c.minWords || 50) ? { ok: true } : { ok: false, msg: `${words} words, need ${c.minWords || 50}` };
    }
    case "notebook_executed": {
      const s = await need();
      let nb;
      try { nb = JSON.parse(s); } catch { return { ok: false, msg: "not valid notebook JSON" }; }
      const ran = (nb.cells || []).some((cell) => cell.cell_type === "code" && (cell.outputs || []).length > 0);
      return ran ? { ok: true } : { ok: false, msg: "no code cell has outputs — run it and save before pushing" };
    }
    case "json_metric": {
      const s = await need();
      let j;
      try { j = JSON.parse(s); } catch { return { ok: false, msg: "invalid JSON" }; }
      const v = getPath(j, c.key);
      if (typeof v !== "number") return { ok: false, msg: `${c.key} missing or not a number` };
      const ok = { ">=": v >= c.value, "<=": v <= c.value, ">": v > c.value, "<": v < c.value, "==": v === c.value }[c.op];
      return ok ? { ok: true, msg: `${c.key} = ${v}` } : { ok: false, msg: `${c.key} = ${v}, need ${c.op} ${c.value}` };
    }
    case "py_test": {
      const files = {};
      for (const f of c.files) {
        const fp = join(dir, f);
        if (!snap.has(fp)) return { ok: false, msg: `${f} not found` };
        files[f] = await snap.read(fp);
      }
      const r = await runPython(files, c.code);
      return r.ok ? { ok: true } : { ok: false, msg: r.error || "test failed", out: r.out };
    }
    default:
      return { ok: false, msg: `unknown check ${c.type}` };
  }
}

// Runs all checks of a task. onProgress(i, result) fires as each check finishes.
export async function checkTask({ owner, project, task, onProgress }) {
  const snap = await repoSnapshot(owner, project.repo);
  const checks = [...implicitChecks(task), ...(task.checks || [])];
  // Drop duplicate "exists" checks the task already lists.
  const seen = new Set();
  const list = checks.filter((c) => {
    const k = `${c.type}|${c.path || ""}|${c.label || ""}|${c.code || ""}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const results = [];
  for (const [i, c] of list.entries()) {
    let r;
    try { r = await runOne(c, snap, project.dir); } catch (e) { r = { ok: false, msg: e.message }; }
    const row = { label: describe(c), ok: r.ok, msg: r.msg || "", out: r.out || "", points: weight(c), type: c.type };
    results.push(row);
    onProgress && onProgress(i, row, list.length);
  }
  const total = results.reduce((s, r) => s + r.points, 0);
  const got = results.filter((r) => r.ok).reduce((s, r) => s + r.points, 0);
  return { frac: total ? got / total : 0, checks: results };
}

export function countChecks(task) {
  return implicitChecks(task).length + (task.checks || []).length;
}
