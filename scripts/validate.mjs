// Validates curriculum data files. Usage: node scripts/validate.mjs [data/file.js ...]
// With no arguments it validates data/index.js (the whole curriculum).
// Also extracts every py_test into scratch files when --emit-tests <dir> is given.
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
let emitDir = null;
const files = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--emit-tests") emitDir = args[++i];
  else files.push(args[i]);
}

const CHECKS = {
  exists: ["path"], nonempty: ["path"], defines: ["path", "names"],
  contains: ["path", "pattern"], not_contains: ["path", "pattern"],
  readme: ["path"], notebook_executed: ["path"],
  json_metric: ["path", "key", "op", "value"], py_test: ["files", "code"],
};
const RUBRICS = ["proof", "derivation", "essay", "summary", "report", "reproduction"];
const errors = [];
const warn = [];
const err = (p, m) => errors.push(`${p}: ${m}`);

async function load(f) {
  const mod = await import(pathToFileURL(path.resolve(f)).href);
  return mod.default;
}

const projects = [];
if (files.length === 0) {
  const { default: all } = await import(pathToFileURL(path.resolve("data/index.js")).href);
  projects.push(...all);
} else {
  for (const f of files) projects.push(...(await load(f)));
}

const ids = new Set();
const { BOOKS, READINGS } = await import(pathToFileURL(path.resolve("data/books.js")).href);
if (files.length === 0) {
  const all = new Set(projects.map((p) => p.id));
  for (const [id, spec] of Object.entries(READINGS)) {
    if (!all.has(id)) err(`books.js`, `unknown project ${id}`);
    for (const rd of spec.read) if (!BOOKS[rd.book]) err(`books.js ${id}`, `unknown book ${rd.book}`);
    if (spec.ex && !BOOKS[spec.ex.book]) err(`books.js ${id}`, `unknown book ${spec.ex.book}`);
  }
}
for (const p of projects) {
  const at = p.id || "(no id)";
  for (const k of ["id", "track", "phase", "title", "days", "sources", "resources", "concepts", "objectives", "tasks"]) {
    if (p[k] === undefined) err(at, `missing ${k}`);
  }
  if (ids.has(p.id)) err(at, "duplicate id");
  ids.add(p.id);
  if (!/^[AT]\d{2}$/.test(p.id || "")) err(at, "id must look like A01 / T01");
  if (!["applied", "theory"].includes(p.track)) err(at, "bad track");
  if (!Number.isInteger(p.days) || p.days < 1) err(at, "days must be a positive integer");
  if (!Array.isArray(p.tasks) || p.tasks.length < 3) err(at, "needs at least 3 tasks");
  const hasCode = (p.tasks || []).some((t) => t.kind === "code" || (t.kind === "written" && t.deliverable === "repo"));
  if (hasCode && (!p.repo || !p.dir)) err(at, "tasks need repo + dir");
  (p.quiz || []).forEach((q, i) => {
    if (!q.q || !Array.isArray(q.options) || q.options.length < 2) err(`${at} quiz ${i}`, "bad question");
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options || []).length) err(`${at} quiz ${i}`, "answer index out of range");
  });
  (p.resources || []).forEach((r, i) => { if (!r.title || !/^https?:\/\//.test(r.url || "")) err(`${at} resource ${i}`, "needs title + http url"); });
  if (!(p.tasks || []).some((t) => t.type === "mandatory")) err(at, "no mandatory task");
  (p.tasks || []).forEach((t, i) => {
    const tp = `${at} task ${i}`;
    if (!t.title || !t.body) err(tp, "needs title + body");
    if (!["mandatory", "advanced"].includes(t.type)) err(tp, "type must be mandatory|advanced");
    if (t.points !== undefined && !(t.points > 0)) err(tp, "points must be > 0");
    if (t.kind === "code") {
      if (!Array.isArray(t.checks) || t.checks.length === 0) err(tp, "code task needs checks");
      (t.checks || []).forEach((c, j) => {
        const req = CHECKS[c.type];
        if (!req) return err(`${tp} check ${j}`, `unknown check type ${c.type}`);
        for (const k of req) if (c[k] === undefined) err(`${tp} check ${j}`, `${c.type} needs ${k}`);
        if (c.pattern) { try { new RegExp(c.pattern, "m"); } catch (e) { err(`${tp} check ${j}`, "bad regex " + e.message); } }
        if (c.type === "py_test" && emitDir) {
          fs.mkdirSync(emitDir, { recursive: true });
          const name = `${p.id}_t${i}_c${j}.py`;
          fs.writeFileSync(path.join(emitDir, name), `# files: ${c.files.join(", ")}\n` + c.code + "\n");
        }
      });
    } else if (t.kind === "written") {
      if (!["repo", "link"].includes(t.deliverable)) err(tp, "written needs deliverable repo|link");
      if (t.deliverable === "repo" && !(t.files && t.files.length)) err(tp, "repo deliverable needs files");
      if (!RUBRICS.includes(t.rubric)) err(tp, `rubric must be one of ${RUBRICS.join("/")}`);
      if (!Array.isArray(t.criteria) || t.criteria.length < 2) err(tp, "written needs >= 2 criteria");
    } else err(tp, "kind must be code|written");
  });
}

const byTrack = {};
for (const p of projects) byTrack[p.track] = (byTrack[p.track] || 0) + p.days;
console.log(`projects: ${projects.length}, tasks: ${projects.reduce((s, p) => s + (p.tasks || []).length, 0)}`);
console.log("days per track:", byTrack);
warn.forEach((w) => console.log("warn:", w));
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  errors.forEach((e) => console.log(" -", e));
  process.exit(1);
}
console.log("OK");
