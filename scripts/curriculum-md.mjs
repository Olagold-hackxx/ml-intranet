// Regenerates docs/CURRICULUM.md from the data files: node scripts/curriculum-md.mjs
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
const { default: all } = await import(pathToFileURL(path.resolve("data/index.js")).href);
const out = ["# Curriculum", "", "Generated from `data/` by `scripts/curriculum-md.mjs`. Days are the 6-month solo-track durations; the 12-month combined program stretches each track to run in parallel.", ""];
for (const track of ["applied", "theory"]) {
  const ps = all.filter((p) => p.track === track);
  out.push(`## ${track === "applied" ? "Applied ML" : "Theoretical ML"} — ${ps.length} projects, ${ps.reduce((s, p) => s + p.tasks.length, 0)} tasks, ${ps.reduce((s, p) => s + p.days, 0)} days`, "");
  let phase = "";
  for (const p of ps) {
    if (p.phase !== phase) { phase = p.phase; out.push("", `### ${phase}`, "", "| ID | Project | Days | Lectures | Textbooks | Tasks (mandatory / advanced / written) | Repo / dir |", "|---|---|---|---|---|---|---|"); }
    const m = p.tasks.filter((t) => t.type === "mandatory").length;
    const a = p.tasks.length - m;
    const w = p.tasks.filter((t) => t.kind === "written").length;
    const src = (p.sources || []).map((s) => `${s.course} ${s.lectures || ""}`.trim()).join("; ");
    const bk = (p.books || []).map((b) => `${b.book === "FOML" ? "FoML" : b.book === "ESL" ? "ESL" : "SSBD"} ${b.ch}`).join("; ") || "—";
    out.push(`| ${p.id} | ${p.title} | ${p.days} | ${src} | ${bk} | ${m} / ${a} / ${w} | ${p.repo ? `\`${p.repo}/${p.dir}\`` : "—"} |`);
  }
  out.push("");
}
fs.writeFileSync("docs/CURRICULUM.md", out.join("\n") + "\n");
console.log("wrote docs/CURRICULUM.md");
