// Learner state. Saved in localStorage; optionally mirrored to a private GitHub Gist so it
// follows you across devices. Secrets (tokens, API keys) live in a separate key and never sync.
const KEY = "mli.state.v1";
const SECRETS = "mli.secrets.v1";
const GIST_FILE = "ml-intranet-state.json";

export function emptyState() {
  return {
    version: 1,
    profile: null, // { name, github, program, startDate, startedAt }
    breaks: [],    // { start: "YYYY-MM-DD", days, takenAt }
    attempts: {},  // "A01:0" -> [{ at, frac, checks: [{label, ok, msg, points}] }]
    submissions: {}, // "T03:2" -> [{ at, url, kind }]
    reviews: {},   // "T03:2" -> [{ at, sub, by: "ai"|"peer"|"self", score, levels, feedback, reviewer }]
    quizzes: {},   // "A01" -> [{ at, score }]
    log: [],       // { at, text } — captain's log
    gistId: null,
    updatedAt: 0,
  };
}

function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } }

export function loadState() {
  const raw = safeGet(KEY);
  if (!raw) return emptyState();
  try { return { ...emptyState(), ...JSON.parse(raw) }; } catch { return emptyState(); }
}

let syncTimer = null;
export function saveState(state) {
  state.updatedAt = Date.now();
  safeSet(KEY, JSON.stringify(state));
  const s = loadSecrets();
  if (s.githubToken && state.gistId && s.autoSync !== false) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => pushGist(state).catch((e) => console.warn("gist sync", e)), 1500);
  }
}

export function loadSecrets() {
  try { return JSON.parse(safeGet(SECRETS) || "{}"); } catch { return {}; }
}
export function saveSecrets(s) { safeSet(SECRETS, JSON.stringify(s)); }

export function exportState(state) {
  return new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
}

export function importState(text) {
  const parsed = JSON.parse(text);
  if (!parsed || parsed.version !== 1) throw new Error("Not an ML Intranet state file.");
  return { ...emptyState(), ...parsed };
}

function gh(path, opts = {}) {
  const { githubToken } = loadSecrets();
  return fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Accept: "application/vnd.github+json",
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
    },
  });
}

export async function pushGist(state) {
  const body = JSON.stringify({
    description: "ML Intranet progress (auto-synced)",
    public: false,
    files: { [GIST_FILE]: { content: JSON.stringify(state, null, 2) } },
  });
  const res = state.gistId
    ? await gh(`/gists/${state.gistId}`, { method: "PATCH", body })
    : await gh(`/gists`, { method: "POST", body });
  if (!res.ok) throw new Error(`Gist sync failed (${res.status}). Does your token have the "gist" scope?`);
  const j = await res.json();
  if (!state.gistId) { state.gistId = j.id; safeSet(KEY, JSON.stringify(state)); }
  return j.id;
}

export async function pullGist(gistId) {
  const res = await gh(`/gists/${gistId}`);
  if (!res.ok) throw new Error(`Couldn't read gist (${res.status}).`);
  const j = await res.json();
  const f = j.files[GIST_FILE];
  if (!f) throw new Error("That gist has no ML Intranet state.");
  let content = f.content;
  if (f.truncated) content = await (await fetch(f.raw_url)).text();
  const st = importState(content);
  st.gistId = gistId;
  return st;
}

// Find an existing state gist for this token (so a new device can pick up where you left off).
export async function findGist() {
  const res = await gh(`/gists?per_page=100`);
  if (!res.ok) return null;
  const list = await res.json();
  const g = list.find((x) => x.files && x.files[GIST_FILE]);
  return g ? g.id : null;
}
