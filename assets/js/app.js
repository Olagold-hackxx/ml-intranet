import ALL_PROJECTS from "../../data/index.js";
import { BOOKS } from "../../data/books.js";
import { RULES, PROGRAMS, COURSES, playlistUrl, GENERAL_REQUIREMENTS } from "./config.js";
import { loadState, saveState, loadSecrets, saveSecrets, exportState, importState, pushGist, pullGist, findGist, emptyState } from "./state.js";
import {
  DAY, layout, programLength, slotTimes, slotStatus, multiplierAt, breakBank, validateBreak,
  currentBreak, timeToActive, activeToTime, toDateStr, dateToTime, startTime,
} from "./schedule.js";
import { overview, projectScore, taskResult, taskKey } from "./scoring.js";
import { checkTask, countChecks, clearRepoCache, repoSnapshot } from "./checker.js";
import { RUBRICS, LEVELS, rubricScore } from "./rubrics.js";
import { aiReview, peerLink, decodePeerPayload, makePeerCode, readPeerCode } from "./reviewer.js";
import { icon, esc, pct, ring, zoneBar, fmt, fmtShort, fmtDay, fmtDayShort, countdown, md, mdInline, typeset } from "./ui.js";

let state = loadState();
let slots = new Map();
let projects = [];
const byId = new Map(ALL_PROJECTS.map((p) => [p.id, p]));
const ui = { filter: "all", track: "all", q: "" };

function recompute() {
  if (!state.profile) { slots = new Map(); projects = []; return; }
  slots = layout(state.profile.program, ALL_PROJECTS);
  projects = ALL_PROJECTS.filter((p) => slots.has(p.id))
    .sort((a, b) => slots.get(a.id).release - slots.get(b.id).release || slots.get(a.id).lane - slots.get(b.id).lane);
}
function commit() { saveState(state); recompute(); }

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function toast(msg, ms = 2800) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), ms);
}

const STATUS = {
  upcoming: ["Upcoming", "p-mute"],
  open: ["In progress", "p-info"],
  second: ["2nd deadline", "p-warn"],
  closed: ["Closed", "p-mute"],
};
const statusPill = (st) => `<span class="pill ${STATUS[st][1]}"><span class="dot"></span>${STATUS[st][0]}</span>`;
function scorePill(score) {
  if (score == null) return `<span class="pill p-mute">—</span>`;
  const cls = score >= 100 ? "p-ok" : score >= RULES.threshold ? "p-accent" : score > 0 ? "p-warn" : "p-bad";
  return `<span class="pill ${cls}">${score.toFixed(1)}%</span>`;
}
const LEVEL = { good: ["Good standing", "p-ok", "ok"], warning: ["Warning", "p-warn", "warn"], probation: ["Probation", "p-bad", "bad"] };
const trackName = (t) => (t === "applied" ? "Applied" : "Theory");
const trackPill = (t) => `<span class="pill ${t === "applied" ? "p-accent" : "p-theory"}">${trackName(t)}</span>`;
const multLabel = (m) => `${Math.round(m * 100)}%`;
const started = () => state.profile && Date.now() >= startTime(state.profile.startDate);
const banner = (kind, ic, html) => `<div class="banner ${kind}">${icon(ic)}<div>${html}</div></div>`;

// ---------------- chrome ----------------
const NAV = [
  ["dashboard", "#/", "home", "Dashboard"],
  ["projects", "#/projects", "grid", "Projects"],
  ["planning", "#/planning", "calendar", "Planning"],
  ["library", "#/library", "book", "Library"],
  ["breaks", "#/breaks", "coffee", "Breaks"],
  ["rules", "#/rules", "scale", "Rules & grading"],
  ["settings", "#/settings", "gear", "Settings"],
];

function setChrome(route) {
  const ov = state.profile ? overview(state, projects, slots) : null;
  const openCount = ov ? ov.rows.filter((r) => r.status === "open" || r.status === "second").length : 0;
  const bank = state.profile ? breakBank(state).available : 0;
  $("#nav").innerHTML = state.profile ? `<div class="nav-label">Learn</div>` + NAV.map(([k, href, ic, label], i) =>
    `${i === 5 ? `<div class="nav-label">Program</div>` : ""}<a href="${href}" class="${route === k || (route === "project" && k === "projects") ? "active" : ""}">${icon(ic)}<span>${label}</span>${k === "projects" && openCount ? `<span class="count">${openCount}</span>` : ""}${k === "breaks" && bank ? `<span class="count">${bank}d</span>` : ""}</a>`).join("") : "";
  $("#menu-btn").innerHTML = icon("menu");
  $("#search-btn").innerHTML = `${icon("search", "sm")}<span class="lbl">Search projects</span><kbd>⌘K</kbd>`;
  $("#search-btn").hidden = !state.profile;
  const theme = (() => { try { return localStorage.getItem("mli.theme") || "system"; } catch { return "system"; } })();
  const themeSwitch = `<div class="theme-switch" role="group" aria-label="Theme">${[["light", "sun"], ["system", "monitor"], ["dark", "moon"]].map(([k, ic]) => `<button data-theme-set="${k}" class="${theme === k ? "on" : ""}" title="${k}">${icon(ic, "sm")}</button>`).join("")}</div>`;
  if (!state.profile) { $("#side-foot").innerHTML = themeSwitch; $("#top-right").innerHTML = ""; $("#crumbs").innerHTML = ""; return; }
  const P = PROGRAMS[state.profile.program];
  const total = programLength(state.profile.program);
  const active = Math.max(0, timeToActive(state, Date.now()));
  const prog = Math.min(100, (active / total) * 100);
  $("#side-foot").innerHTML = `<div class="me"><img src="https://github.com/${encodeURIComponent(state.profile.github)}.png?size=80" alt="" onerror="this.style.visibility='hidden'">
      <div class="who"><b>${esc(state.profile.name || state.profile.github)}</b><span>${esc(P.short)} · ${started() ? `day ${Math.min(total, Math.floor(active) + 1)}/${total}` : "not started"}</span></div></div>
    <div class="me-prog"><div class="bar"><span style="width:${prog}%"></span></div></div>${themeSwitch}`;
  const brk = currentBreak(state);
  const lv = LEVEL[ov.standing.level];
  $("#top-right").innerHTML = `${brk ? `<span class="pill p-warn">${icon("coffee", "sm")} On break</span>` : ""}<span class="pill ${lv[1]}"><span class="dot"></span>${lv[0]}</span><span class="pill p-outline keep">Avg <b>${pct(ov.average)}</b></span>`;
  const names = { library: "Library", dashboard: "Dashboard", projects: "Projects", planning: "Planning", breaks: "Breaks", rules: "Rules & grading", settings: "Settings", peer: "Peer review" };
  let crumb = names[route] || "";
  if (route === "project") {
    const id = location.hash.split("/")[2];
    crumb = `<a href="#/projects">Projects</a> <span>/</span> <b>${esc(id)}</b>`;
  } else crumb = `<b>${crumb}</b>`;
  $("#crumbs").innerHTML = crumb;
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-theme-set]");
  if (!t) return;
  const v = t.dataset.themeSet;
  try { v === "system" ? localStorage.removeItem("mli.theme") : localStorage.setItem("mli.theme", v); } catch {}
  if (v === "system") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = v;
  setChrome(currentRoute());
});

// ---------------- router ----------------
const routes = { "": viewDashboard, library: viewLibrary, projects: viewProjects, project: viewProject, planning: viewPlanning, breaks: viewBreaks, rules: viewRules, settings: viewSettings, peer: viewPeer };
const currentRoute = () => location.hash.replace(/^#\/?/, "").split("/")[0] || "dashboard";

function render() {
  const hash = location.hash.replace(/^#\/?/, "");
  const [name, ...rest] = hash.split("/");
  const view = $("#view");
  closeMenu();
  if (name !== "peer" && !state.profile) {
    setChrome("onboarding");
    view.innerHTML = viewOnboarding();
    typeset(view);
    bindOnboarding();
    return;
  }
  const fn = routes[name] ?? viewNotFound;
  setChrome(name || "dashboard");
  try {
    view.innerHTML = fn(...rest);
    typeset(view);
    if (fn.bind_) fn.bind_(...rest);
  } catch (e) {
    console.error(e);
    view.innerHTML = banner("bad", "alert", `<b>Something broke:</b> ${esc(e.message)}`);
  }
}
let lastHash = location.hash;
window.addEventListener("hashchange", () => {
  const sameProject = lastHash.split("/")[1] === "project" && location.hash.split("/")[1] === "project" && lastHash.split("/")[2] === location.hash.split("/")[2];
  lastHash = location.hash;
  render();
  if (!sameProject) window.scrollTo(0, 0);
});
function closeMenu() { $("#sidebar").classList.remove("open"); $("#scrim").classList.remove("show"); }
$("#menu-btn").addEventListener("click", () => { $("#sidebar").classList.add("open"); $("#scrim").classList.add("show"); });
$("#scrim").addEventListener("click", closeMenu);
setInterval(() => {
  const a = document.activeElement;
  if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return;
  if (document.querySelector("[data-busy]") || !$("#palette").hidden) return;
  if (document.querySelector(".subpanel")) return;
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
}, 60000);

// ---------------- command palette ----------------
function paletteItems() {
  const pages = NAV.map(([k, href, ic, label]) => ({ href, label, sub: "Page", ic }));
  const ps = projects.map((p) => ({ href: `#/project/${p.id}`, id: p.id, label: p.title, sub: `${trackName(p.track)} · ${p.phase.split("—")[0].trim()}`, hay: `${p.id} ${p.title} ${(p.concepts || []).join(" ")} ${(p.sources || []).map((s) => s.course).join(" ")}`.toLowerCase() }));
  return [...ps, ...pages];
}
function openPalette() {
  if (!state.profile) return;
  const pal = $("#palette");
  pal.hidden = false;
  const input = $("#palette-input");
  input.value = "";
  let sel = 0;
  const items = paletteItems();
  const draw = () => {
    const q = input.value.trim().toLowerCase();
    const list = (q ? items.filter((it) => (it.hay || it.label.toLowerCase()).includes(q)) : items).slice(0, 40);
    sel = Math.min(sel, Math.max(0, list.length - 1));
    $("#palette-list").innerHTML = list.map((it, i) => `<a href="${it.href}" class="${i === sel ? "sel" : ""}">${it.id ? `<span class="mono">${it.id}</span>` : icon(it.ic, "sm")}<span>${esc(it.label)}</span><small>${esc(it.sub)}</small></a>`).join("") || `<div class="empty">No matches</div>`;
    return list;
  };
  let list = draw();
  input.oninput = () => { sel = 0; list = draw(); };
  input.onkeydown = (e) => {
    if (e.key === "ArrowDown") { sel = Math.min(list.length - 1, sel + 1); draw(); e.preventDefault(); }
    else if (e.key === "ArrowUp") { sel = Math.max(0, sel - 1); draw(); e.preventDefault(); }
    else if (e.key === "Enter" && list[sel]) { location.hash = list[sel].href; closePalette(); }
    else if (e.key === "Escape") closePalette();
  };
  setTimeout(() => input.focus(), 0);
}
function closePalette() { $("#palette").hidden = true; }
$("#palette").addEventListener("click", (e) => { if (e.target.id === "palette" || e.target.closest("a")) closePalette(); });
$("#search-btn").addEventListener("click", openPalette);
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#palette").hidden ? openPalette() : closePalette(); }
  else if (e.key === "Escape" && !$("#palette").hidden) closePalette();
});

// ---------------- onboarding ----------------
function viewOnboarding() {
  const today = toDateStr(Date.now());
  const counts = (track) => ALL_PROJECTS.filter((p) => p.track === track).length;
  const tasks = (track) => ALL_PROJECTS.filter((p) => p.track === track).reduce((s, p) => s + p.tasks.length, 0);
  return `<div class="onb">
  <div class="onb-hero">
    <div class="logo"><svg viewBox="0 0 32 32"><path d="M8 22 L14 14 L18 18 L24 9" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <h1>Learn ML on a deadline</h1>
    <p>Stanford-level courses turned into time-boxed projects. Code is checked straight from your GitHub, written work is graded against a rubric, and every deadline you miss costs you.</p>
  </div>
  <div class="rules-strip">
    <div><b>${Math.round(RULES.firstDeadlineMultiplier * 100)}%</b>before the 1st deadline</div>
    <div><b>${Math.round(RULES.secondDeadlineMultiplier * 100)}%</b>before the 2nd deadline</div>
    <div><b>${Math.round(RULES.lateMultiplier * 100)}%</b>after that</div>
    <div><b>${RULES.breakDays}d</b>break every ~2 months, banked</div>
  </div>
  <form id="onb" class="card section">
    <div class="field"><label>Choose your program</label>
      <div class="program-pick">
        ${Object.entries(PROGRAMS).map(([k, p]) => `
          <label><input type="radio" name="prog" value="${k}" ${k === "combined" ? "checked" : ""}>
            <span class="pp-big">${k === "combined" ? "12" : "6"} <span style="font-size:1rem">months</span></span>
            <span class="pp-title">${esc(p.short === "Combined" ? "Applied + Theory" : p.short + " ML")}</span>
            <span class="small soft">${p.lanes.map((l) => `${counts(l.track)} ${trackName(l.track).toLowerCase()} projects`).join(" + ")}, ${p.lanes.reduce((s, l) => s + tasks(l.track), 0)} tasks</span>
            <span class="xs muted">${programLength(k)} active days · ≈${p.hoursPerWeek} h/week${k === "combined" ? " · both tracks interleaved" : ""}</span>
          </label>`).join("")}
      </div>
    </div>
    <div class="grid g3">
      <div class="field"><label for="o-name">Name</label><input id="o-name" required placeholder="Ada Lovelace" autocomplete="name"></div>
      <div class="field"><label for="o-gh">GitHub username</label><input id="o-gh" required placeholder="octocat" pattern="[A-Za-z0-9-]+" autocomplete="username"></div>
      <div class="field"><label for="o-start">Start date</label><input id="o-start" type="date" min="${today}" value="${today}" required></div>
    </div>
    <p class="hint" style="margin-top:-6px">Your work is checked in repos under this GitHub account (ml-foundations, ml-theory, …). Projects release at ${String(RULES.releaseHour).padStart(2, "0")}:00 local time. Program and start date lock once you begin.</p>
    <label class="check-label section"><input type="checkbox" id="o-ok" required> I accept the deadlines. No extensions — only banked breaks pause the clock.</label>
    <div class="row section"><button class="btn primary" type="submit">Start my program ${icon("arrow", "sm")}</button>
      <span class="spacer"></span><a href="#" id="o-restore" class="small">Restore progress from another device</a></div>
  </form>
  <div id="restore" class="section" hidden>${restoreBlock()}</div></div>`;
}
function restoreBlock() {
  return `<div class="grid g2">
    <div class="card"><h3>${icon("github", "sm")} From a GitHub Gist</h3>
      <div class="field"><label for="r-token">GitHub token with gist access</label><input id="r-token" type="password" placeholder="github_pat_…"></div>
      <button class="btn" id="r-gist">Find and restore</button></div>
    <div class="card"><h3>${icon("file", "sm")} From a backup file</h3><p class="small muted">Use a file from Settings → Download backup.</p>
      <input type="file" id="r-file" accept="application/json"></div></div>`;
}
function bindOnboarding() {
  $("#onb").addEventListener("submit", (e) => {
    e.preventDefault();
    const start = $("#o-start").value;
    if (dateToTime(start) < dateToTime(toDateStr(Date.now()))) return toast("Start date can't be in the past.");
    state = { ...emptyState(), profile: {
      name: $("#o-name").value.trim(), github: $("#o-gh").value.trim(),
      program: $("input[name=prog]:checked").value, startDate: start, createdAt: Date.now(),
    } };
    commit();
    location.hash = "#/";
    render();
  });
  $("#o-restore").addEventListener("click", (e) => { e.preventDefault(); $("#restore").hidden = false; $("#restore").scrollIntoView({ behavior: "smooth" }); });
  bindRestore();
}
function bindRestore() {
  const g = $("#r-gist");
  if (g) g.addEventListener("click", async () => {
    const tok = $("#r-token").value.trim();
    if (!tok) return toast("Paste a token first.");
    saveSecrets({ ...loadSecrets(), githubToken: tok });
    try {
      const id = await findGist();
      if (!id) return toast("No Gradient gist found for this token.");
      state = await pullGist(id);
      commit(); toast("Restored from gist."); location.hash = "#/"; render();
    } catch (err) { toast(err.message, 5000); }
  });
  const f = $("#r-file");
  if (f) f.addEventListener("change", async () => {
    try { state = importState(await f.files[0].text()); commit(); toast("Restored from file."); location.hash = "#/"; render(); } catch (err) { toast(err.message, 5000); }
  });
}

// ---------------- dashboard ----------------
function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Burning the midnight oil" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
function viewDashboard() {
  const now = Date.now();
  const ov = overview(state, projects, slots, now);
  const bank = breakBank(state, now);
  const brk = currentBreak(state, now);
  const total = programLength(state.profile.program);
  const active = Math.max(0, timeToActive(state, now));
  const lv = LEVEL[ov.standing.level];
  const cur = ov.rows.filter((r) => r.status === "open" || r.status === "second")
    .sort((a, b) => (a.status === "open" ? a.times.d1 : a.times.d2) - (b.status === "open" ? b.times.d1 : b.times.d2));
  const next = ov.rows.filter((r) => r.status === "upcoming").slice(0, 6);
  const curMonth = ov.standing.months[ov.standing.months.length - 1];
  const streak = logStreak();
  const name = (state.profile.name || state.profile.github).split(" ")[0];
  const focus = cur.find((r) => !r.ps.mandatoryDone) || cur[0];

  let banners = "";
  if (!started()) banners += banner("info", "clock", `Your program starts <b>${fmt(startTime(state.profile.startDate))}</b>, in ${countdown(startTime(state.profile.startDate) - now)}. Skim the first projects now.`);
  if (brk) banners += banner("warn", "coffee", `You're on a break until <b>${fmt(brk.t + brk.len)}</b>. Every deadline is paused. <a href="#/breaks">Manage</a>`);
  if (ov.standing.level === "probation") banners += banner("bad", "alert", `<b>Probation.</b> Two finished months in a row below the bar. Finish every mandatory task before the 1st deadline from now on.`);
  else if (ov.standing.level === "warning") banners += banner("warn", "alert", `<b>Warning.</b> Month ${curMonth ? curMonth.month : ""} is below ${curMonth ? curMonth.need : RULES.threshold}%. Fix it before the month ends or it counts toward probation.`);
  if (ov.laxity.overdue.length) banners += banner("bad", "clock", `<b>${ov.laxity.overdue.length} project(s) past the 1st deadline</b> with mandatory work left. They're now worth ${Math.round(RULES.secondDeadlineMultiplier * 100)}% at most: ${ov.laxity.overdue.map((r) => `<a href="#/project/${r.project.id}">${r.project.id}</a>`).join(", ")}`);
  if (started() && !brk && ov.laxity.idleDays !== null && ov.laxity.idleDays >= 2) banners += banner("warn", "flame", `No checks or submissions for <b>${ov.laxity.idleDays} days</b>. Laxity is expensive here.`);

  const focusHtml = focus ? (() => {
    const dl = focus.status === "open" ? focus.times.d1 : focus.times.d2;
    return `<div class="focus"><div class="row"><span class="eyebrow">Focus now</span>${statusPill(focus.status)}<span class="spacer"></span><span class="small soft">${focus.ps.results.filter((r) => r.raw >= 0.999).length}/${focus.project.tasks.length} tasks done</span></div>
      <div class="row" style="margin-top:8px;align-items:flex-end"><div style="flex:1;min-width:200px"><div class="focus-title">${focus.project.id} · ${esc(focus.project.title)}</div><div class="small muted">${trackName(focus.project.track)} · ${esc(focus.project.phase)}</div></div>
        <div style="text-align:right"><div class="countdown">${countdown(dl - now)}</div><div class="xs muted">until ${focus.status === "open" ? "1st" : "2nd"} deadline</div></div></div>
      ${zoneBar(focus.times, now)}
      <div class="row section"><a class="btn primary" href="#/project/${focus.project.id}">Continue ${icon("arrow", "sm")}</a><span class="small muted">Anything you pass now earns ${multLabel(multiplierAt(state, focus.slot, now))}.</span></div></div>`;
  })() : `<div class="focus"><span class="eyebrow">Focus now</span><p class="soft" style="margin:6px 0 0">Nothing open.${next[0] ? ` Next up: <a href="#/project/${next[0].project.id}">${next[0].project.id} ${esc(next[0].project.title)}</a> on ${fmt(next[0].times.release)}.` : ""}</p></div>`;

  const counted = ov.rows.filter((r) => r.counted).length;
  return `${banners}
  <div class="grid g-hero">
    <div class="card hero">
      <div class="eyebrow">${started() ? `Day ${Math.min(total, Math.floor(active) + 1)} of ${total} · Month ${curMonth ? curMonth.month : 1}` : "Not started yet"}</div>
      <h1>${greeting()}, ${esc(name)}.</h1>
      <p class="soft" style="margin:0">${cur.length ? `You have ${cur.length} project${cur.length > 1 ? "s" : ""} open.` : "No projects open right now."} ${PROGRAMS[state.profile.program].name}.</p>
      ${focusHtml}
    </div>
    <div class="card avg-card">
      <div class="eyebrow">Average</div>
      ${ring(ov.average, { size: 150, stroke: 12, label: ov.average == null ? "—" : `${ov.average.toFixed(1)}%`, sub: `${counted} project${counted === 1 ? "" : "s"} counted` })}
      <span class="pill ${lv[1]}"><span class="dot"></span>${lv[0]}</span>
      <div class="xs muted">Month ${curMonth ? curMonth.month : 1}: ${pct(curMonth?.average ?? null)} · need ≥ ${curMonth ? curMonth.need : RULES.firstMonthThreshold}%</div>
    </div>
  </div>

  <div class="grid g4 section">
    <div class="card tile"><div class="k"><span class="ic">${icon("trend", "sm")}</span>Progress</div><div class="v">${Math.min(100, (active / total) * 100).toFixed(0)}<small>%</small></div><div class="bar"><span style="width:${Math.min(100, (active / total) * 100)}%"></span></div><div class="s">${Math.max(0, Math.ceil(total - active))} active days to go</div></div>
    <div class="card tile"><div class="k"><span class="ic info">${icon("coffee", "sm")}</span>Break bank</div><div class="v">${bank.available}<small> days</small></div><div class="s">+${RULES.breakDays} in ${bank.nextInDays} active day${bank.nextInDays === 1 ? "" : "s"}</div></div>
    <div class="card tile"><div class="k"><span class="ic ok">${icon("flame", "sm")}</span>Log streak</div><div class="v">${streak}<small> day${streak === 1 ? "" : "s"}</small></div><div class="s">${ov.laxity.idleDays == null ? "No activity yet" : ov.laxity.idleDays === 0 ? "Active today" : `Last activity ${ov.laxity.idleDays}d ago`}</div></div>
    <div class="card tile"><div class="k"><span class="ic ${ov.laxity.lost > 0 || ov.laxity.missed > 0 ? "bad" : "warn"}">${icon("alert", "sm")}</span>Cost of laxity</div><div class="v">${ov.laxity.lost.toFixed(1)}<small> pts lost</small></div><div class="s">${ov.laxity.missed} mandatory task${ov.laxity.missed === 1 ? "" : "s"} missed</div></div>
  </div>

  <div class="grid g2 section">
    <div class="card">
      <div class="card-head"><h2>Open projects</h2><span class="spacer"></span><a class="small" href="#/projects">All projects</a></div>
      ${cur.length ? `<div class="plist">${cur.map((r) => {
        const dl = r.status === "open" ? r.times.d1 : r.times.d2;
        return `<a class="pitem" href="#/project/${r.project.id}"><span class="trackdot ${r.project.track}"></span><span class="pid">${r.project.id}</span>
          <span class="pt"><b>${esc(r.project.title)}</b><span>${r.status === "open" ? "1st" : "2nd"} deadline in ${countdown(dl - now)} · ×${multLabel(multiplierAt(state, r.slot, now))}</span></span>
          ${ring(r.ps.score, { size: 40, stroke: 4, max: 200, label: Math.round(r.ps.score), cls: "sm" })}</a>`;
      }).join("")}</div>` : `<div class="empty">Nothing open right now.</div>`}
    </div>
    <div class="card">
      <div class="card-head"><h2>Coming up</h2><span class="spacer"></span><a class="small" href="#/planning">Planning</a></div>
      ${next.length ? `<div class="plist">${next.map((r) => `<a class="pitem" href="#/project/${r.project.id}"><span class="trackdot ${r.project.track}"></span><span class="pid">${r.project.id}</span>
        <span class="pt"><b>${esc(r.project.title)}</b><span>${r.slot.days} day${r.slot.days > 1 ? "s" : ""} · ${r.project.tasks.length} tasks</span></span><span class="pr">${fmtDayShort(r.times.release)}</span></a>`).join("")}</div>` : `<div class="empty">No more releases. Finish strong.</div>`}
    </div>
  </div>

  <div class="grid g2 section">
    <div class="card">
      <div class="card-head"><h2>Captain's log</h2><span class="spacer"></span><span class="xs muted">One line a day</span></div>
      <form id="log-form" class="row"><input id="log-text" placeholder="What did you do, what blocked you, what's next?" maxlength="500" style="flex:1;min-width:200px"><button class="btn primary">Log</button></form>
      <div class="section">${state.log.slice(-6).reverse().map((l) => `<div class="log-item"><time>${fmtShort(l.at)}</time><span>${esc(l.text)}</span></div>`).join("") || `<div class="empty">No entries yet. Start today.</div>`}</div>
    </div>
    <div class="card">
      <div class="card-head"><h2>Monthly standing</h2><span class="spacer"></span><span class="xs muted">28 active days per month</span></div>
      ${monthChart(ov.standing.months)}
    </div>
  </div>`;
}
function monthChart(months) {
  const max = 150;
  const h = (v) => `${Math.min(100, (v / max) * 100)}%`;
  return `<div class="months"><div class="plot">
      <div class="thr" style="bottom:${h(RULES.threshold)}"><span>${RULES.threshold}%</span></div>
      ${months.map((m) => `<div class="m" title="Month ${m.month}: ${pct(m.average)} (need ${m.need}%)">
        <span class="val">${m.average == null ? "" : Math.round(m.average) + "%"}</span>
        <div class="col ${m.average == null ? "none" : m.below ? "below" : ""}" style="height:${m.average == null ? "3px" : h(m.average)}"></div></div>`).join("")}
    </div><div class="mlabels">${months.map((m) => `<span>M${m.month}</span>`).join("")}</div></div>
    <div class="xs muted" style="margin-top:10px">Dashed line: the ${RULES.threshold}% bar (month 1 needs ${RULES.firstMonthThreshold}%). Two finished months below it in a row means probation.</div>`;
}
viewDashboard.bind_ = () => {
  const f = $("#log-form");
  if (f) f.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = $("#log-text").value.trim();
    if (!text) return;
    state.log.push({ at: Date.now(), text });
    commit(); render();
  });
};
function logStreak() {
  const days = new Set(state.log.map((l) => toDateStr(l.at)));
  let n = 0;
  let t = Date.now();
  if (!days.has(toDateStr(t))) t -= DAY;
  while (days.has(toDateStr(t))) { n++; t -= DAY; }
  return n;
}

// ---------------- projects list ----------------
function viewProjects() {
  const now = Date.now();
  const ov = overview(state, projects, slots, now);
  const P = PROGRAMS[state.profile.program];
  const q = ui.q.toLowerCase();
  const match = (r) =>
    (ui.filter === "all" || (ui.filter === "open" ? r.status === "open" || r.status === "second" : r.status === ui.filter)) &&
    (ui.track === "all" || r.project.track === ui.track) &&
    (!q || `${r.project.id} ${r.project.title} ${(r.project.concepts || []).join(" ")}`.toLowerCase().includes(q));
  const rows = ov.rows.filter(match);
  const phases = [...new Set(rows.map((r) => `${r.project.track}|${r.project.phase}`))];
  const count = (f) => ov.rows.filter((r) => (f === "open" ? r.status === "open" || r.status === "second" : r.status === f)).length;
  const seg = (k, label, n) => `<button data-filter="${k}" class="${ui.filter === k ? "on" : ""}">${label}${n != null ? ` <span class="muted">${n}</span>` : ""}</button>`;
  return `<div class="page-head"><div><h1>Projects</h1><p>${esc(P.name)} · ${projects.length} projects · ${projects.reduce((s, p) => s + p.tasks.length, 0)} tasks</p></div><span class="spacer"></span>${ring(ov.average, { size: 64, stroke: 6, label: ov.average == null ? "—" : Math.round(ov.average) + "%", cls: "sm" })}</div>
  <div class="toolbar">
    <div class="seg">${seg("all", "All")}${seg("open", "Open", count("open"))}${seg("upcoming", "Upcoming", count("upcoming"))}${seg("closed", "Closed", count("closed"))}</div>
    ${P.lanes.length > 1 ? `<div class="seg">${["all", "applied", "theory"].map((t) => `<button data-track="${t}" class="${ui.track === t ? "on" : ""}">${t === "all" ? "Both tracks" : trackName(t)}</button>`).join("")}</div>` : ""}
    <span class="spacer"></span><input id="p-search" type="search" placeholder="Filter by name or concept…" value="${esc(ui.q)}">
  </div>
  ${phases.length ? phases.map((key) => {
    const [track, ph] = key.split("|");
    const list = rows.filter((r) => r.project.track === track && r.project.phase === ph);
    return `<div class="phase"><div class="phase-head">${trackPill(track)}<h2>${esc(ph)}</h2><span class="xs muted">${list.length} project${list.length > 1 ? "s" : ""}</span></div>
    <div class="card list-card">${list.map((r) => `<a class="prow" href="#/project/${r.project.id}">
      <span class="mono xs muted">${r.project.id}</span>
      <span class="pt"><b>${esc(r.project.title)}</b><span>${r.slot.days}d · ${r.project.tasks.length} tasks${r.project.tasks.some((t) => t.kind === "written") ? ` · ${r.project.tasks.filter((t) => t.kind === "written").length} written` : ""}</span></span>
      <span class="dates">${fmtDayShort(r.times.release)} → ${fmtDayShort(r.times.d1)}</span>
      <span class="st">${statusPill(r.status)}</span>
      <span style="justify-self:end">${r.status === "upcoming" ? `<span class="xs muted">${countdown(r.times.release - now)}</span>` : ring(r.ps.score, { size: 40, stroke: 4, max: 200, label: Math.round(r.ps.score), cls: "sm" })}</span>
    </a>`).join("")}</div></div>`;
  }).join("") : `<div class="card empty">No projects match.</div>`}`;
}
viewProjects.bind_ = () => {
  $$("[data-filter]").forEach((b) => b.onclick = () => { ui.filter = b.dataset.filter; render(); });
  $$("[data-track]").forEach((b) => b.onclick = () => { ui.track = b.dataset.track; render(); });
  const s = $("#p-search");
  s.oninput = () => { ui.q = s.value; const pos = s.selectionStart; render(); const s2 = $("#p-search"); s2.focus(); s2.setSelectionRange(pos, pos); };
};

// ---------------- project page ----------------
function quizState(p) {
  const tries = state.quizzes[p.id] || [];
  const passed = !p.quiz || !p.quiz.length || tries.some((t) => t.score >= RULES.quizPassMark);
  const last = tries[tries.length - 1];
  const waitUntil = last && !passed ? last.at + RULES.quizRetryMinutes * 60000 : 0;
  return { passed, tries, waitUntil };
}

function viewProject(id) {
  const p = byId.get(id);
  if (!p || !slots.has(id)) return viewNotFound();
  const now = Date.now();
  const slot = slots.get(id);
  const t = slotTimes(state, slot);
  const st = slotStatus(state, slot, now);
  const ps = projectScore(state, p, slot);
  const q = quizState(p);
  const mult = multiplierAt(state, slot, now);
  const gh = state.profile.github;
  const idx = projects.findIndex((x) => x.id === id);
  const prev = projects[idx - 1], next = projects[idx + 1];
  const doneCount = ps.results.filter((r) => r.raw >= 0.999).length;

  const lectures = (p.sources || []).map((s) => {
    const url = playlistUrl(s.course);
    return `<a href="${url || COURSES[s.course]?.site || "#"}" target="_blank" rel="noopener">${icon("play")}<span><b>${esc(s.course)}</b> ${esc(s.lectures || "")}${s.topics ? ` <span class="muted">— ${esc(s.topics)}</span>` : ""}</span></a>`;
  }).join("");
  const resources = (p.resources || []).map((r) => `<a href="${esc(r.url)}" target="_blank" rel="noopener">${icon(/arxiv|\.pdf/.test(r.url) ? "file" : "book")}<span>${esc(r.title)}</span></a>`).join("");

  const statusLine = st === "upcoming" ? `Opens in <b>${countdown(t.release - now)}</b>`
    : st === "closed" ? `Closed. Checks still run, but now earn ${multLabel(RULES.lateMultiplier)}.`
    : `Worth <b>${multLabel(mult)}</b> now · ${st === "open" ? `1st deadline in <b>${countdown(t.d1 - now)}</b>` : `closes in <b>${countdown(t.d2 - now)}</b>`}`;

  return `<div class="proj-grid">
  <div>
    <div class="row">${trackPill(p.track)}<span class="pill p-mute">${esc(p.phase)}</span>${statusPill(st)}</div>
    <h1 class="proj-title"><span class="muted" style="font-weight:600">${p.id}</span> ${esc(p.title)}</h1>
    <p class="soft" style="margin:0">${statusLine}</p>
    ${st !== "upcoming" ? zoneBar(t, now) : ""}

    <div class="card section">
      <div class="grid g2">
        <div><div class="eyebrow" style="margin-bottom:8px">Watch</div><div class="res">${lectures || `<span class="muted small">—</span>`}</div></div>
        <div><div class="eyebrow" style="margin-bottom:8px">Read</div><div class="res">${resources || `<span class="muted small">—</span>`}</div></div>
      </div>
      ${(p.books || []).length ? `<div class="section"><div class="eyebrow" style="margin-bottom:8px">Textbooks</div><div class="books">${p.books.map((b) => `<a class="bookref" href="${BOOKS[b.book].url}" target="_blank" rel="noopener"><span class="pill ${b.book === "ESL" ? "p-accent" : b.book === "FOML" ? "p-theory" : "p-info"}">${BOOKS[b.book].short}</span><span><b>${esc(b.ch)}</b> <span class="muted">— ${esc(b.topic)}</span></span></a>`).join("")}</div></div>` : ""}
      <div class="section"><div class="eyebrow" style="margin-bottom:8px">Concepts</div><div class="chips">${(p.concepts || []).map((c) => `<span class="pill p-outline">${esc(c)}</span>`).join("")}</div></div>
      <details class="fold" ${doneCount === 0 ? "open" : ""}><summary>Learning objectives</summary>
        <p class="small muted" style="margin:8px 0 4px">By the end of this project you should be able to explain to anyone, without looking anything up:</p>
        <ul class="list md">${(p.objectives || []).map((o) => `<li>${mdInline(o)}</li>`).join("")}</ul></details>
      <details class="fold"><summary>Requirements</summary>
        <ul class="list md small" style="margin-top:8px">${GENERAL_REQUIREMENTS[p.track].map((r) => `<li>${mdInline(r)}</li>`).join("")}${(p.requirements || []).map((r) => `<li><b>${mdInline(r)}</b></li>`).join("")}</ul></details>
    </div>

    ${p.quiz && p.quiz.length ? quizBlock(p, q, st) : ""}

    <div class="tasks-head"><h2>Tasks</h2><span class="pill p-mute">${doneCount}/${p.tasks.length} done</span><span class="spacer"></span><span class="xs muted">${p.tasks.filter((x) => x.type === "mandatory").length} mandatory · ${p.tasks.filter((x) => x.type === "advanced").length} advanced</span></div>
    ${p.tasks.map((task, i) => taskCard(p, slot, i, st, q.passed)).join("")}

    <div class="row section" style="margin-top:28px">${prev ? `<a class="btn ghost pn" href="#/project/${prev.id}">← ${prev.id} ${esc(prev.title)}</a>` : ""}<span class="spacer"></span>${next ? `<a class="btn ghost pn" href="#/project/${next.id}">${next.id} ${esc(next.title)} →</a>` : ""}</div>
  </div>

  <aside class="proj-side">
    <div class="card" style="text-align:center">
      <div class="eyebrow">Project score</div>
      <div style="margin:10px 0 2px">${ring(ps.score, { size: 132, stroke: 11, max: 200, label: `${ps.score.toFixed(1)}%`, sub: "of 200% max" })}</div>
      <div class="split"><div><div class="eyebrow">Mandatory</div><b>${(ps.M * 100).toFixed(0)}%</b></div><div><div class="eyebrow">Advanced</div><b>${(ps.A * 100).toFixed(0)}%</b></div></div>
      <div class="calc">${(ps.M * 100).toFixed(1)} + ${(ps.M * 100).toFixed(1)} × ${(ps.A * 100).toFixed(1)}% = ${ps.score.toFixed(1)}%</div>
    </div>
    <div class="card">
      <div class="eyebrow" style="margin-bottom:10px">Timeline</div>
      <dl class="facts">
        <dt>Starts</dt><dd>${fmt(t.release)}</dd>
        <dt>1st deadline</dt><dd>${fmt(t.d1)}</dd>
        <dt>2nd deadline</dt><dd>${fmt(t.d2)}</dd>
        <dt>Duration</dt><dd>${slot.days} day${slot.days > 1 ? "s" : ""}</dd>
        <dt>Weight</dt><dd>${p.days}</dd>
      </dl>
    </div>
    ${p.repo ? `<div class="card"><div class="eyebrow" style="margin-bottom:10px">Where your work goes</div>
      <dl class="facts"><dt>Repo</dt><dd><a href="https://github.com/${esc(gh)}/${esc(p.repo)}" target="_blank" rel="noopener">${esc(p.repo)}</a></dd><dt>Directory</dt><dd><code>${esc(p.dir)}</code></dd></dl>
      <p class="xs muted" style="margin:10px 0 0">Every directory needs a README.md. ${p.track === "applied" ? "Python files start with <code>#!/usr/bin/env python3</code>." : "Typeset solutions go in <code>written/</code>."}</p></div>` : ""}
  </aside></div>`;
}

function quizBlock(p, q, st) {
  if (q.passed) {
    const best = q.tries.length ? Math.max(...q.tries.map((x) => x.score)) : 100;
    return `<div class="card section row">${icon("check")}<b>Quiz passed</b><span class="pill p-ok">${best.toFixed(0)}%</span><span class="spacer"></span><span class="xs muted">${p.quiz.length} questions</span></div>`;
  }
  const locked = st === "upcoming";
  const wait = q.waitUntil > Date.now();
  return `<div class="card section quiz"><div class="card-head">${icon("target")}<h2>Warm-up quiz</h2><span class="spacer"></span><span class="pill p-warn">Score ≥ ${RULES.quizPassMark}% to unlock tasks</span></div>
    ${locked ? `<p class="muted small" style="margin:0">Opens when the project starts.</p>` : wait ? `<p class="soft small" style="margin:0">Last attempt: <b>${q.tries[q.tries.length - 1].score.toFixed(0)}%</b>. You can try again in ${countdown(q.waitUntil - Date.now())}. Use the time to rewatch the lecture.</p>` : `
    <form id="quiz-form">${p.quiz.map((it, qi) => `<div class="qitem"><div class="qtext md">${qi + 1}. ${mdInline(it.q)}</div>
      ${it.options.map((o, oi) => `<label class="opt"><input type="radio" name="q${qi}" value="${oi}" required> <span class="md">${mdInline(o)}</span></label>`).join("")}</div>`).join("")}
      <div class="row section"><button class="btn primary">Submit answers</button></div></form>`}</div>`;
}

function taskCard(p, slot, i, st, quizPassed) {
  const task = p.tasks[i];
  const r = taskResult(state, p, i, slot);
  const key = taskKey(p.id, i);
  const pts = task.points || 1;
  const cls = r.status === "done" ? "done" : r.status === "partial" ? "partial" : r.status === "pending" ? "pending" : "";
  const gotPts = (r.earned * pts).toFixed(2).replace(/\.?0+$/, "") || "0";
  const open = r.status !== "done";
  const head = `<summary><span class="tstate">${r.status === "done" ? icon("check", "sm") : i}</span>
    <span class="ttitle">${esc(task.title)}</span>
    <span class="pill ${task.type === "mandatory" ? "p-accent" : "p-outline"}">${task.type === "mandatory" ? "Mandatory" : "Advanced"}</span>
    <span class="pill p-mute">${task.kind === "code" ? `${icon("code", "sm")} ${countChecks(task)} checks` : `${icon("pen", "sm")} ${RUBRICS[task.rubric]?.name || "Written"}`}</span>
    <span class="tpts">${gotPts}/${pts} pt${pts > 1 ? "s" : ""}${r.mult < 1 && r.raw > 0 ? ` · ×${multLabel(r.mult)}` : ""}</span></summary>`;
  const files = task.files || [];
  const deliver = `<div class="deliver">${p.repo && (task.kind === "code" || task.deliverable === "repo") ? `
    <div>${icon("github", "sm")} <code>${esc(p.repo)}</code></div><div>${icon("folder", "sm")} <code>${esc(p.dir)}</code></div>
    ${files.length ? `<div>${icon("file", "sm")} ${files.map((f) => `<code>${esc(f)}</code>`).join(" ")}</div>` : ""}` : `<div>${icon("link", "sm")} Public link: a Medium or blog post</div>`}</div>`;
  let actions = "";
  if (st === "upcoming") actions = `<div class="lock-note">${icon("lock", "sm")} Opens ${fmt(slotTimes(state, slot).release)}.</div>`;
  else if (!quizPassed) actions = `<div class="lock-note">${icon("lock", "sm")} Pass the warm-up quiz to unlock this task.</div>`;
  else if (task.kind === "code") actions = codeActions(p, i, r);
  else actions = writtenActions(p, i, r, key, slot);
  return `<details class="task ${cls}" id="task-${i}" ${open ? "open" : ""}>${head}<div class="task-body"><div class="md">${md(task.body)}</div>${deliver}${actions}</div></details>`;
}

const ckIcon = (ok) => `<span class="ck">${ok === undefined ? "" : icon(ok ? "check" : "x")}</span>`;
function checksHtml(list, at) {
  const passed = list.filter((c) => c.ok).length;
  return `<div class="checks"><div class="checks-sum"><span>${passed}/${list.length} checks passed</span>${at ? `<span>${fmtShort(at)}</span>` : ""}</div>${list.map((c) => `<div class="check ${c.ok === undefined ? "run" : c.ok ? "ok" : "ko"}">${ckIcon(c.ok)}
    <div style="min-width:0;flex:1"><div>${esc(c.label)}</div>${c.msg ? `<div class="xs muted">${esc(c.msg)}</div>` : ""}${c.out ? `<pre>${esc(c.out)}</pre>` : ""}</div>${c.points ? `<span class="xs muted">${c.points}pt</span>` : ""}</div>`).join("")}</div>`;
}

function codeActions(p, i, r) {
  const last = r.last;
  return `<div class="task-actions"><button class="btn primary" data-check="${i}">${icon("refresh", "sm")} Check your code</button>
    <span class="xs muted">${last ? `Best: ${(r.raw * 100).toFixed(0)}% of checks` : "Push to GitHub first. Python tests run in your browser; the first run loads Python (~15 MB)."}</span></div>
    <div id="checks-${i}">${last ? checksHtml(last.checks, last.at) : ""}</div>`;
}

function regradeOpen(key, subIdx) {
  const rs = (state.reviews[key] || []).filter((x) => x.sub === subIdx);
  return !rs.length || Date.now() - rs[0].at < RULES.regradeWindowDays * DAY;
}

function writtenActions(p, i, r, key, slot) {
  const task = p.tasks[i];
  const subs = state.submissions[key] || [];
  const lastIdx = subs.length - 1;
  const last = subs[lastIdx];
  const reviews = (state.reviews[key] || []).filter((x) => x.sub === lastIdx);
  const latestReview = reviews[reviews.length - 1];
  const canReview = last && regradeOpen(key, lastIdx);
  const submitForm = `<form class="row section" data-submit="${i}">
    ${task.deliverable === "link"
      ? `<input name="url" type="url" required placeholder="https://medium.com/@you/…" style="flex:1;min-width:220px" aria-label="Post URL">`
      : `<input name="url" required value="${esc(last?.url || files0(task))}" style="flex:1;min-width:220px" aria-label="File path inside the project directory">`}
    <button class="btn ${last ? "" : "primary"}">${last ? "Resubmit" : "Submit"}</button></form>
    <div class="hint">${task.deliverable === "link" ? "The public URL of your post." : `Path inside <code>${esc(p.dir)}</code>. PDF, Markdown or LaTeX, already pushed.`} The time you submit sets the deadline multiplier.</div>`;
  const status = last ? `<div class="row small section">${icon("check", "sm")}<span>Submitted ${fmtShort(last.at)} · <b>${multLabel(multiplierAt(state, slot, last.at))}</b> credit ·
    ${last.kind === "link" ? `<a href="${esc(last.url)}" target="_blank" rel="noopener">${esc(last.url)}</a>` : `<a href="https://github.com/${esc(state.profile.github)}/${esc(p.repo)}/blob/HEAD/${esc(p.dir)}/${esc(last.url)}" target="_blank" rel="noopener">${esc(last.url)}</a>`}</span>
    ${!latestReview ? `<span class="pill p-info">Awaiting review</span>` : ""}</div>` : "";
  const reviewBtns = last ? (canReview ? `<div class="task-actions">
      <button class="btn primary" data-ai="${i}">${icon("sparkle", "sm")} Review with Claude</button>
      <button class="btn" data-peer="${i}">${icon("users", "sm")} Ask a peer</button>
      <button class="btn ghost" data-self="${i}">${icon("user", "sm")} Self-review <span class="muted">(max ${Math.round(RULES.selfReviewCap * 100)}%)</span></button>
    </div>${latestReview ? `<div class="hint">Re-reviews are open for ${RULES.regradeWindowDays} days after the first review. The latest review counts, even if it's lower.</div>` : ""}` : `<div class="lock-note">${icon("lock", "sm")} The ${RULES.regradeWindowDays}-day regrade window has closed. Resubmit to be reviewed again; the new submission time sets the multiplier.</div>`) : "";
  return `${status}${latestReview ? reviewBlock(task, latestReview) : ""}${reviewBtns}<div id="review-panel-${i}"></div>${submitForm}`;
}
const files0 = (task) => (task.files || [])[0] || "";

function reviewBlock(task, rv) {
  const r = RUBRICS[task.rubric];
  const who = { ai: `${icon("sparkle", "sm")} Claude`, peer: `${icon("users", "sm")} ${esc(rv.reviewer || "Peer")}`, self: `${icon("user", "sm")} Self` }[rv.by];
  const lvlCls = (v) => (v >= 4 ? "p-ok" : v === 3 ? "p-accent" : v === 2 ? "p-warn" : "p-bad");
  return `<div class="review"><div class="review-head"><span class="review-score">${(rv.score * 100).toFixed(1)}%</span><span class="pill p-outline">${who}</span><span class="spacer"></span><span class="xs muted">${fmtShort(rv.at)}</span></div>
    <div class="crit-chips">${r.criteria.map((c) => `<span class="pill ${lvlCls(rv.levels[c.key] ?? 0)}">${esc(c.name)}: ${LEVELS[rv.levels[c.key] ?? 0].label}</span>`).join("")}</div>
    ${rv.notes && rv.notes.length ? `<ul class="mustlist">${rv.notes.map((n) => `<li><span class="${n.present ? "y" : "n"}">${icon(n.present ? "check" : "x", "sm")}</span><span>${mdInline(n.item)}${n.note ? ` <span class="muted">— ${esc(n.note)}</span>` : ""}</span></li>`).join("")}</ul>` : ""}
    ${rv.feedback ? `<details class="fold" open><summary>Feedback</summary><div class="md small" style="margin-top:8px">${md(rv.feedback)}</div></details>` : ""}</div>`;
}

function rubricForm(task, idPrefix) {
  const r = RUBRICS[task.rubric];
  return `<div class="rubric">${r.criteria.map((c) => `<div class="crit"><div class="row"><b>${esc(c.name)}</b><span class="pill p-mute">${c.weight}%</span></div><div class="xs muted" style="margin-top:3px">${esc(c.guide)}</div>
      <div class="levels">${LEVELS.map((l) => `<label><input type="radio" name="${idPrefix}-${c.key}" value="${l.v}" required> ${l.label}</label>`).join("")}</div></div>`).join("")}
    <div class="crit"><b>Must see</b><div class="xs muted" style="margin:3px 0 8px">Tick only what is actually there. Missing items cap ${esc(r.criteria[0].name.toLowerCase())}.</div>
      <div class="must">${(task.criteria || []).map((c, k) => `<label class="check-label"><input type="checkbox" name="${idPrefix}-must" value="${k}"> <span class="md">${mdInline(c)}</span></label>`).join("")}</div></div></div>`;
}
function readRubricForm(task, form, idPrefix) {
  const r = RUBRICS[task.rubric];
  const levels = {};
  for (const c of r.criteria) {
    const v = form.querySelector(`input[name="${idPrefix}-${c.key}"]:checked`);
    if (!v) throw new Error(`Pick a level for ${c.name}.`);
    levels[c.key] = +v.value;
  }
  const present = (task.criteria || []).map((_, k) => !!form.querySelector(`input[name="${idPrefix}-must"][value="${k}"]:checked`));
  return { levels, present };
}

function rerenderKeep(i) {
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
  const el = document.getElementById(`task-${i}`);
  if (el) { el.open = true; }
}

viewProject.bind_ = (id) => {
  const p = byId.get(id);
  if (!p || !slots.has(id)) return;
  const slot = slots.get(id);
  const view = $("#view");

  const qf = $("#quiz-form");
  if (qf) qf.addEventListener("submit", (e) => {
    e.preventDefault();
    let right = 0;
    const fb = p.quiz.map((it, qi) => {
      const v = +qf.querySelector(`input[name=q${qi}]:checked`).value;
      if (v === it.answer) right++;
      return { ok: v === it.answer, it };
    });
    const score = (right / p.quiz.length) * 100;
    (state.quizzes[p.id] ||= []).push({ at: Date.now(), score });
    commit();
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
    const passed = score >= RULES.quizPassMark;
    toast(passed ? `Quiz passed with ${score.toFixed(0)}%. Tasks unlocked.` : `${score.toFixed(0)}% isn't enough. Try again in ${RULES.quizRetryMinutes} minutes.`, 4000);
    if (passed) {
      const box = document.createElement("div");
      box.className = "card section md";
      box.innerHTML = `<div class="card-head"><h2>Answers</h2></div>${fb.map((f, k) => `<p><b>${k + 1}.</b> ${f.ok ? "✓" : "✕"} ${mdInline(f.it.options[f.it.answer])}${f.it.why ? `<br><span class="muted small">${mdInline(f.it.why)}</span>` : ""}</p>`).join("")}`;
      $(".tasks-head").before(box);
      typeset(box);
    }
  });

  view.onclick = async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.check !== undefined) return runCheck(p, slot, +b.dataset.check, b);
    if (b.dataset.ai !== undefined) return runAi(p, +b.dataset.ai, b);
    if (b.dataset.peer !== undefined) return openPeer(p, +b.dataset.peer);
    if (b.dataset.self !== undefined) return openSelf(p, +b.dataset.self);
  };
  view.onsubmit = async (e) => {
    const f = e.target.closest("form[data-submit]");
    if (!f) return;
    e.preventDefault();
    const i = +f.dataset.submit;
    const task = p.tasks[i];
    const url = f.url.value.trim();
    const btn = f.querySelector("button");
    btn.disabled = true;
    try {
      if (task.deliverable === "link") {
        if (!/^https:\/\/\S+\.\S+/.test(url)) throw new Error("Use a full https:// link.");
      } else {
        if (!/\.(pdf|md|tex|txt)$/i.test(url)) throw new Error("Submit a .pdf, .md or .tex file.");
        clearRepoCache();
        const snap = await repoSnapshot(state.profile.github, p.repo);
        if (!snap.has(`${p.dir}/${url}`)) throw new Error(`${url} isn't in ${p.repo}/${p.dir} on GitHub yet. Push it first.`);
      }
      (state.submissions[taskKey(p.id, i)] ||= []).push({ at: Date.now(), url, kind: task.deliverable === "link" ? "link" : "repo" });
      commit();
      toast("Submitted. Now get it reviewed.");
      rerenderKeep(i);
    } catch (err) {
      toast(err.message, 5000);
      btn.disabled = false;
    }
  };
};

async function runCheck(p, slot, i, btn) {
  const box = $(`#checks-${i}`);
  btn.disabled = true;
  btn.dataset.busy = "1";
  btn.innerHTML = `<span class="spin"></span> Checking…`;
  const rows = [];
  clearRepoCache();
  try {
    const res = await checkTask({
      owner: state.profile.github, project: p, task: p.tasks[i],
      onProgress: (k, row, n) => {
        rows[k] = row;
        const shown = Array.from({ length: n }, (_, j) => rows[j] || { label: j === k + 1 ? "Running…" : "Waiting…", ok: undefined });
        box.innerHTML = checksHtml(shown);
      },
    });
    const list = (state.attempts[taskKey(p.id, i)] ||= []);
    list.push({ at: Date.now(), frac: res.frac, checks: res.checks });
    if (list.length > 15) list.splice(0, list.length - 15);
    commit();
    toast(res.frac === 1 ? "All checks passed." : `${Math.round(res.frac * 100)}% of checks passed.`);
    rerenderKeep(i);
  } catch (err) {
    box.innerHTML = `<div class="checks"><div class="check ko">${ckIcon(false)}<div>${esc(err.message)}</div></div></div>`;
    btn.disabled = false;
    delete btn.dataset.busy;
    btn.innerHTML = `${icon("refresh", "sm")} Check your code`;
  }
}

function lastSub(p, i) {
  const key = taskKey(p.id, i);
  const subs = state.submissions[key] || [];
  return { key, idx: subs.length - 1, sub: subs[subs.length - 1] };
}

async function runAi(p, i, btn) {
  const { key, idx, sub } = lastSub(p, i);
  const panel = $(`#review-panel-${i}`);
  if (!loadSecrets().anthropicKey) {
    panel.innerHTML = `<div class="lock-note">${icon("info", "sm")} Add your Anthropic API key in <a href="#/settings">Settings</a> first. Reviews go straight from your browser to the Anthropic API, and the key never leaves this device.</div>`;
    return;
  }
  const pasteBox = (open) => sub.kind === "link" ? `<details class="fold" ${open ? "open" : ""}><summary>Medium blocking the fetch? Paste the post text instead</summary><textarea id="paste-${i}" placeholder="Paste the full text" style="margin-top:8px"></textarea></details>` : "";
  const prevPaste = $(`#paste-${i}`)?.value?.trim();
  panel.innerHTML = `<div class="subpanel"><div class="row"><span class="spin" style="width:16px;height:16px;border:2px solid var(--accent);border-right-color:transparent;border-radius:50%;animation:spin .7s linear infinite"></span><b>Claude is grading against the rubric…</b></div><p class="xs muted" style="margin:6px 0 0">This usually takes 30–90 seconds.</p></div>`;
  btn.disabled = true;
  btn.dataset.busy = "1";
  try {
    const rv = await aiReview({ owner: state.profile.github, project: p, task: p.tasks[i], sub: prevPaste ? { ...sub, pasted: prevPaste } : sub });
    (state.reviews[key] ||= []).push({ ...rv, at: Date.now(), sub: idx });
    commit();
    toast(`Reviewed: ${(rv.score * 100).toFixed(1)}%`);
    rerenderKeep(i);
  } catch (err) {
    panel.innerHTML = `<div class="banner bad">${icon("alert")}<div>${esc(err.message)}</div></div>${pasteBox(true)}`;
    btn.disabled = false;
    delete btn.dataset.busy;
  }
}

function openPeer(p, i) {
  const { key, idx, sub } = lastSub(p, i);
  const link = peerLink({ owner: state.profile.github, project: p, taskIndex: i, sub });
  const panel = $(`#review-panel-${i}`);
  panel.innerHTML = `<div class="subpanel"><div class="card-head" style="margin-bottom:6px">${icon("users")}<h3 style="margin:0">Peer review</h3></div>
    <p class="small soft" style="margin-top:0">Send this link to a classmate or mentor. They grade with the same rubric and send you back a review code.</p>
    <div class="row"><input readonly value="${esc(link)}" id="peer-link-${i}" style="flex:1"><button class="btn" id="peer-copy-${i}">${icon("copy", "sm")} Copy</button></div>
    <form class="row section" id="peer-code-${i}"><input name="code" required placeholder="Paste the code: MLI-REVIEW.…" style="flex:1"><button class="btn primary">Record review</button></form></div>`;
  $(`#peer-copy-${i}`).onclick = async () => { try { await navigator.clipboard.writeText(link); toast("Link copied."); } catch { $(`#peer-link-${i}`).select(); } };
  $(`#peer-code-${i}`).onsubmit = (e) => {
    e.preventDefault();
    try {
      const body = readPeerCode(e.target.code.value);
      if (body.pid !== p.id || body.ti !== i) throw new Error("That code is for a different task.");
      if (body.at !== sub.at) throw new Error("That code reviews an older submission.");
      const task = p.tasks[i];
      const score = rubricScore(task.rubric, body.levels, body.present || []);
      const notes = (task.criteria || []).map((c, k) => ({ item: c, present: !!(body.present || [])[k], note: "" }));
      (state.reviews[key] ||= []).push({ at: Date.now(), sub: idx, by: "peer", reviewer: body.reviewer || "peer", levels: body.levels, present: body.present, notes, feedback: body.feedback || "", score });
      commit();
      toast(`Peer review recorded: ${(score * 100).toFixed(1)}%`);
      rerenderKeep(i);
    } catch (err) { toast(err.message, 5000); }
  };
}

function openSelf(p, i) {
  const { key, idx } = lastSub(p, i);
  const task = p.tasks[i];
  const panel = $(`#review-panel-${i}`);
  panel.innerHTML = `<form class="subpanel" id="self-${i}"><div class="card-head" style="margin-bottom:6px">${icon("user")}<h3 style="margin:0">Self-review</h3></div>
    <p class="small soft" style="margin-top:0">Grade yourself like a strict TA. Self-reviews are capped at ${Math.round(RULES.selfReviewCap * 100)}%; a peer or Claude review can earn more.</p>
    ${rubricForm(task, `s${i}`)}
    <div class="field section"><label>Notes to future you</label><textarea name="fb" placeholder="What is weak and how will you fix it?"></textarea></div>
    <button class="btn primary">Record self-review</button></form>`;
  typeset(panel);
  $(`#self-${i}`).onsubmit = (e) => {
    e.preventDefault();
    try {
      const { levels, present } = readRubricForm(task, e.target, `s${i}`);
      const score = Math.min(RULES.selfReviewCap, rubricScore(task.rubric, levels, present));
      const notes = (task.criteria || []).map((c, k) => ({ item: c, present: present[k], note: "" }));
      (state.reviews[key] ||= []).push({ at: Date.now(), sub: idx, by: "self", levels, present, notes, feedback: e.target.fb.value.trim(), score });
      commit();
      toast(`Self-review recorded: ${(score * 100).toFixed(1)}%`);
      rerenderKeep(i);
    } catch (err) { toast(err.message, 4000); }
  };
}

// ---------------- peer review page (for the reviewer) ----------------
function viewPeer(payload) {
  let data;
  try { data = decodePeerPayload(payload); } catch { return banner("bad", "alert", "This review link is broken."); }
  const p = byId.get(data.pid);
  const task = p && p.tasks[data.ti];
  if (!task || task.kind !== "written") return banner("bad", "alert", "This link points to a task that doesn't exist.");
  return `<div style="max-width:860px;margin:0 auto">
  <div class="page-head"><div><span class="pill p-accent">${icon("users", "sm")} Peer review</span><h1 style="margin-top:10px">${esc(task.title)}</h1>
    <p>${esc(p.id)} · ${esc(p.title)} — submitted by <b>${esc(data.learner)}</b>, ${fmt(data.at)}</p></div>
    <span class="spacer"></span><a class="btn primary" href="${esc(data.where)}" target="_blank" rel="noopener">Open submission ↗</a></div>
  <div class="card"><div class="eyebrow" style="margin-bottom:8px">The assignment</div><div class="md">${md(task.body)}</div></div>
  <form class="card section" id="peer-form"><div class="card-head"><h2>Your grade</h2></div>
    <p class="small soft" style="margin-top:0">Deduct from full marks: Excellent means you wouldn't take off a single point. Tick a "must see" item only if the work actually contains it.</p>
    ${rubricForm(task, "p")}
    <div class="grid g2 section"><div class="field"><label>Your name</label><input name="who" required></div></div>
    <div class="field"><label>Feedback (Markdown)</label><textarea name="fb" required placeholder="The main problems first, quoting the exact step. Then one strength."></textarea></div>
    <button class="btn primary">Generate review code</button>
    <div id="peer-out" class="section"></div></form></div>`;
}
viewPeer.bind_ = (payload) => {
  const f = $("#peer-form");
  if (!f) return;
  const data = decodePeerPayload(payload);
  const task = byId.get(data.pid).tasks[data.ti];
  f.onsubmit = (e) => {
    e.preventDefault();
    try {
      const { levels, present } = readRubricForm(task, f, "p");
      const code = makePeerCode(data, { levels, present, reviewer: f.who.value.trim(), feedback: f.fb.value.trim() });
      const score = rubricScore(task.rubric, levels, present);
      $("#peer-out").innerHTML = `${banner("ok", "check", `Score: <b>${(score * 100).toFixed(1)}%</b>. Send this code back to ${esc(data.learner)}:`)}<textarea readonly style="min-height:110px" onclick="this.select()">${esc(code)}</textarea>`;
    } catch (err) { toast(err.message, 4000); }
  };
};

// ---------------- library ----------------
function viewLibrary() {
  const uses = (k) => projects.filter((p) => (p.books || []).some((b) => b.book === k));
  const exCount = (k) => projects.reduce((s, p) => s + p.tasks.filter((t) => t.source === "book" && t.title.includes(BOOKS[k].short + " ")).length, 0);
  const cls = { ESL: "p-accent", FOML: "p-theory", SSBD: "p-info" };
  return `<div class="page-head"><div><h1>Library</h1><p>The three core textbooks, all free from their authors. Every project lists the exact chapters to read; many add optional end-of-chapter exercises.</p></div></div>
  <div class="grid g3">${Object.entries(BOOKS).map(([k, b]) => `<div class="card book-card">
      <div class="book-spine ${k.toLowerCase()}"><span>${b.short}</span></div>
      <div class="row" style="margin-top:14px"><span class="pill ${cls[k]}">${b.role}</span><span class="spacer"></span><span class="xs muted">${uses(k).length} projects · ${exCount(k) ? `${exCount(k)} exercise sets` : "exercises built into theory tasks"}</span></div>
      <h2 style="margin:10px 0 2px">${esc(b.title)}</h2><div class="small soft">${esc(b.authors)}</div>
      <p class="small soft">${esc(b.blurb)}</p>
      <div class="row"><a class="btn primary" href="${b.url}" target="_blank" rel="noopener">${icon("book", "sm")} Open PDF</a><a class="btn ghost" href="${b.home}" target="_blank" rel="noopener">Book site</a></div></div>`).join("")}</div>
  ${Object.entries(BOOKS).map(([k, b]) => {
    const list = uses(k);
    if (!list.length) return "";
    return `<div class="phase"><div class="phase-head"><span class="pill ${cls[k]}">${b.short}</span><h2>Reading plan</h2><span class="xs muted">in release order</span></div>
    <div class="card list-card">${list.map((p) => {
      const rd = p.books.filter((x) => x.book === k);
      const t = slotTimes(state, slots.get(p.id));
      const ex = p.tasks.find((x) => x.source === "book" && x.title.includes(b.short + " "));
      return `<a class="prow lib" href="#/project/${p.id}"><span class="mono xs muted">${p.id}</span>
        <span class="pt"><b>${rd.map((x) => esc(x.ch)).join(" · ")}</b><span>${rd.map((x) => esc(x.topic)).join(" · ")}</span></span>
        <span class="dates">${esc(p.title)}</span>
        <span class="st">${ex ? `<span class="pill p-outline">${icon("pen", "sm")} exercises</span>` : ""}</span>
        <span class="xs muted" style="justify-self:end">${fmtDayShort(t.release)}</span></a>`;
    }).join("")}</div></div>`;
  }).join("")}`;
}

// ---------------- planning ----------------
function viewPlanning() {
  const now = Date.now();
  const total = programLength(state.profile.program);
  const s0 = startTime(state.profile.startDate);
  const end = activeToTime(state, total + 3);
  const span = end - s0;
  const x = (t) => `${Math.max(0, Math.min(100, ((t - s0) / span) * 100))}%`;
  const w = (a, b) => `${Math.max(0.25, ((b - a) / span) * 100)}%`;
  const months = [];
  const d = new Date(s0); d.setDate(1); d.setMonth(d.getMonth() + 1);
  for (; d.getTime() < end; d.setMonth(d.getMonth() + 1)) months.push(d.getTime());
  const grid = months.map((m) => `<i class="g-grid" style="left:${x(m)}"></i>`).join("");
  const breaks = (state.breaks || []).map((b) => { const t = dateToTime(b.start); return `<div class="g-break" style="left:${x(t)};width:${w(t, t + b.days * DAY)}"></div>`; }).join("");
  const nowLine = now > s0 && now < end ? `<div class="g-now" style="left:${x(now)}"></div>` : "";
  const rows = projects.map((p) => {
    const slot = slots.get(p.id);
    const t = slotTimes(state, slot);
    const done = projectScore(state, p, slot).mandatoryDone;
    return `<div class="g-row"><div class="g-label"><span class="mono xs">${p.id}</span><a href="#/project/${p.id}">${esc(p.title)}</a></div>
      <div class="g-track">${grid}${breaks}<div class="g-bar ${p.track} ${done ? "done" : ""}" style="left:${x(t.release)};width:${w(t.release, t.d1)}" title="${esc(p.title)}: ${fmtDay(t.release)} → ${fmtDay(t.d1)}"></div>
      <div class="g-bar second ${p.track}" style="left:${x(t.d1)};width:${w(t.d1, t.d2)}"></div>${nowLine}</div></div>`;
  }).join("");
  const breakDays = state.breaks.reduce((s, b) => s + b.days, 0);
  const allBreaks = Math.floor(total / RULES.breakEveryActiveDays) * RULES.breakDays;
  const projected = activeToTime(state, total) + Math.max(0, allBreaks - breakDays) * DAY;
  return `<div class="page-head"><div><h1>Planning</h1><p>${fmtDay(s0)} → ${fmtDay(activeToTime(state, total))} · ${total} active days${breakDays ? ` + ${breakDays} break days taken` : ""}. Taking all ${allBreaks} earnable break days moves the finish to about <b>${fmtDay(projected)}</b>. A break pushes everything after it back.</p></div></div>
  <div class="card"><div class="legend"><span><i style="background:var(--accent)"></i>Applied</span><span><i style="background:var(--theory)"></i>Theory</span><span><i style="background:var(--accent);opacity:.3"></i>2nd-deadline window</span><span><i style="box-shadow:inset 0 0 0 2px var(--ok)"></i>Mandatory done</span><span><i style="background:repeating-linear-gradient(45deg,var(--warn-soft),var(--warn-soft) 3px,transparent 3px,transparent 6px);border:1px solid var(--warn)"></i>Break</span><span><i style="background:var(--bad);width:3px"></i>Today</span></div>
    <div class="gantt-wrap"><div class="gantt">
      <div class="g-row"><div></div><div class="g-months">${months.map((m) => `<span style="left:${x(m)}">${new Date(m).toLocaleDateString(undefined, { month: "short" })}</span>`).join("")}</div></div>
      ${rows}</div></div></div>`;
}

// ---------------- breaks ----------------
function viewBreaks() {
  const now = Date.now();
  const bank = breakBank(state, now);
  const brk = currentBreak(state, now);
  const list = [...state.breaks].sort((a, b) => a.start.localeCompare(b.start));
  const progress = ((RULES.breakEveryActiveDays - bank.nextInDays) / RULES.breakEveryActiveDays) * 100;
  return `<div class="page-head"><div><h1>Breaks</h1><p>Earn ${RULES.breakDays} days for every ${RULES.breakEveryActiveDays} active days (about 2 months). Bank them and take them whenever you want. A break pauses every deadline, so it never costs you points.</p></div></div>
  ${brk ? banner("warn", "coffee", `You're on a break until <b>${fmt(brk.t + brk.len)}</b>. Rest properly.`) : ""}
  <div class="grid g3">
    <div class="card tile"><div class="k"><span class="ic info">${icon("coffee", "sm")}</span>Available</div><div class="v">${bank.available}<small> days</small></div><div class="s">${bank.earned} earned · ${bank.used} used</div></div>
    <div class="card tile"><div class="k"><span class="ic">${icon("clock", "sm")}</span>Next ${RULES.breakDays} days</div><div class="v">${bank.nextInDays}<small> active days away</small></div><div class="bar"><span style="width:${progress}%"></span></div></div>
    <div class="card tile"><div class="k"><span class="ic warn">${icon("lock", "sm")}</span>Rule</div><div class="s" style="font-size:.86rem">Breaks can't start in the past, so they can't rescue a deadline you already missed. End one early to get the unused days back.</div></div>
  </div>
  <form class="card section" id="brk-form"><div class="card-head"><h2>Schedule a break</h2></div>
    <div class="grid g3"><div class="field"><label for="b-start">Start</label><input id="b-start" type="date" min="${toDateStr(now)}" value="${toDateStr(now)}" required></div>
    <div class="field"><label for="b-days">Days</label><input id="b-days" type="number" min="1" max="${Math.max(1, bank.available)}" value="${Math.max(1, Math.min(bank.available, RULES.breakDays))}" required></div>
    <div class="field"><label>&nbsp;</label><button class="btn primary" style="width:100%" ${bank.available < 1 ? "disabled" : ""}>Schedule break</button></div></div>
    ${bank.available < 1 ? `<p class="small muted" style="margin:0">Nothing banked yet. Keep going.</p>` : ""}</form>
  <div class="card section"><div class="card-head"><h2>Your breaks</h2></div>
    ${list.length ? `<div class="table-wrap"><table><thead><tr><th>Start</th><th>Days</th><th>Ends</th><th></th></tr></thead><tbody>${list.map((b) => {
      const t = dateToTime(b.start), e = t + b.days * DAY;
      const live = t <= now && now < e, future = now < t;
      return `<tr><td>${fmt(t)}</td><td>${b.days}</td><td>${fmt(e)}</td><td class="num">${future ? `<button class="btn sm" data-cancel="${b.start}">Cancel</button>` : live ? `<button class="btn sm" data-end="${b.start}">End early</button>` : `<span class="pill p-mute">Taken</span>`}</td></tr>`;
    }).join("")}</tbody></table></div>` : `<div class="empty">No breaks yet.</div>`}</div>`;
}
viewBreaks.bind_ = () => {
  $("#brk-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const start = $("#b-start").value;
    const days = parseInt($("#b-days").value, 10);
    const err = validateBreak(state, start, days);
    if (err) return toast(err, 4000);
    state.breaks.push({ start, days, takenAt: Date.now() });
    commit(); toast(`Break scheduled: ${days} day(s) from ${start}.`); render();
  });
  $("#view").onclick = (e) => {
    const c = e.target.closest("[data-cancel]");
    const en = e.target.closest("[data-end]");
    if (c) { state.breaks = state.breaks.filter((b) => b.start !== c.dataset.cancel); commit(); render(); }
    else if (en) {
      const b = state.breaks.find((x) => x.start === en.dataset.end);
      b.days = Math.min(b.days, Math.max(1, Math.ceil((Date.now() - dateToTime(b.start)) / DAY)));
      commit(); toast("Welcome back."); render();
    }
  };
};

// ---------------- rules ----------------
function viewRules() {
  const R = RULES;
  return `<div class="page-head"><div><h1>Rules &amp; grading</h1><p>How you're graded. It's modeled on the ALX/Holberton intranet and on how Stanford, MIT, CMU and Berkeley grade ML courses.</p></div></div>
  <div class="grid g4">
    <div class="card tile"><div class="k"><span class="ic ok">${icon("clock", "sm")}</span>Before 1st deadline</div><div class="v">${Math.round(R.firstDeadlineMultiplier * 100)}<small>%</small></div></div>
    <div class="card tile"><div class="k"><span class="ic warn">${icon("clock", "sm")}</span>Before 2nd deadline</div><div class="v">${Math.round(R.secondDeadlineMultiplier * 100)}<small>%</small></div></div>
    <div class="card tile"><div class="k"><span class="ic bad">${icon("lock", "sm")}</span>After</div><div class="v">${Math.round(R.lateMultiplier * 100)}<small>%</small></div></div>
    <div class="card tile"><div class="k"><span class="ic">${icon("target", "sm")}</span>Standing bar</div><div class="v">${R.threshold}<small>% (M1: ${R.firstMonthThreshold}%)</small></div></div>
  </div>
  <div class="card section md">${md(`
### Projects and deadlines
Projects release on a fixed schedule at ${String(R.releaseHour).padStart(2, "0")}:00 and last 1–10 days. Whatever you pass earns a multiplier that depends on **when** you pass it:
- **${Math.round(R.firstDeadlineMultiplier * 100)}%** before the 1st deadline
- **${Math.round(R.secondDeadlineMultiplier * 100)}%** before the 2nd deadline. The window is ⌈duration/2⌉ days long, between 1 and 3.
- **${Math.round(R.lateMultiplier * 100)}%** after that. The project closes: checks still run so you can finish the work, but they earn nothing. ALX historically gave 50% here; this is stricter on purpose.

The multiplier scales your score; it isn't a cap, so a late advanced task still adds something.

### Project score — the ALX / Holberton formula
Each task earns the share of its checks you pass (or its review score), times the multiplier at the moment you passed it. Your best attempt counts.

$$\\text{score} = M \\times (1 + A)$$

$M$ and $A$ are point-weighted averages over **mandatory** and **advanced** tasks. Finishing every mandatory task gives 100%. Advanced work can take you to **200%**, but only on top of the mandatory work: with $M = 0.5$, perfect advanced work adds just 50%.

### Average and standing
- Your **average** weights each project by its size. A project counts once its 1st deadline passes, or earlier if all its mandatory tasks are done.
- A **month** is 28 active days. Month 1 needs **≥ ${R.firstMonthThreshold}%** and every later month **≥ ${R.threshold}%** (the ALX bar).
- Below the bar in the current month → **Warning**. Two finished months below the bar in a row → **Probation**.

### Code: the checker
"Check your code" reads your GitHub repo and runs three kinds of check:
- **Requirement checks** (1 pt each): the file exists, the shebang, a newline at the end.
- **Static checks** (2 pts): required functions, banned imports, README, an executed notebook.
- **Tests** (3 pts): Python + NumPy tests run in your browser (Pyodide), plus metrics read from your \`results.json\`.

As on Gradescope's autograder, partial credit is the sum of the checks you pass.

### Written work: proofs, derivations, essays
1. **Submit** a file in your repo (PDF / Markdown / LaTeX) or a public Medium link. The **submission time** sets the multiplier, so a slow review never costs you.
2. **Review** against a fixed rubric. As on Gradescope, it deducts from full marks: each criterion is Missing / Poor / Fair / Good / Excellent (0 / 30 / 60 / 85 / 100%).
   - **Proofs:** correctness 50, completeness 20, rigor 20, clarity 10. Modeled on UIUC CS374's standard proof rubrics.
   - **Project reports:** technical quality 30, experiments 25, originality 15, clarity 15, results 10, related work 5. Synthesized from how CS224N and CS231N grade projects.
   - Every task lists **must-see items** (the key steps). The share present caps the first criterion: a proof missing half its key steps can't score above 50% on correctness.
3. **Who reviews:** Claude (with your API key and a strict-TA prompt), a peer (shareable link, tamper-evident return code), or yourself (capped at **${Math.round(R.selfReviewCap * 100)}%**).
4. **Regrades:** you can be re-reviewed for **${R.regradeWindowDays} days**. As with Stanford regrade requests, the latest review counts even if it's lower. After that, resubmit with a new timestamp.

### Quizzes
Most projects open with a short warm-up quiz. Score ≥ ${R.quizPassMark}% to unlock the tasks. If you miss, you wait ${R.quizRetryMinutes} minutes before trying again.

### Breaks
You earn ${R.breakDays} break days per ${R.breakEveryActiveDays} active days (2 weeks every ~2 months), banked and deferrable. A break pauses every deadline, so it never touches your score. It can't start in the past, and you can end it early to get the unused days back.

### Honor code
Discuss ideas freely, but write your own code and proofs, and list collaborators and sources in the README. Don't change these rules mid-program.
`)}</div>
  <div class="card section xs muted">Sources: ALX intranet score printouts ("100% + (100% × 41.18%) = 141.18%"); ALX deadline policy (100% / 65%) and monthly thresholds (80% → 70%); Gradescope autograder and rubric conventions; UIUC CS374 proof rubrics; Stanford CS224N / CS231N / CS229 / CS336 late, regrade and project policies; MIT 6.7900 and CMU 10-601 late policies. Details in <code>docs/GRADING.md</code>.</div>`;
}

// ---------------- settings ----------------
function viewSettings() {
  const s = loadSecrets();
  const locked = started();
  return `<div class="page-head"><div><h1>Settings</h1><p>Profile, keys, sync and backups.</p></div></div>
  <div class="stack">
  <form class="card" id="set-profile"><div class="card-head"><h2>Profile</h2></div>
    <div class="grid g2">
      <div class="field"><label>Name</label><input name="name" value="${esc(state.profile.name)}"></div>
      <div class="field"><label>GitHub username</label><input name="github" value="${esc(state.profile.github)}" required></div>
      <div class="field"><label>Program ${locked ? `<span class="pill p-mute">${icon("lock", "sm")} locked</span>` : ""}</label><select name="program" ${locked ? "disabled" : ""}>${Object.entries(PROGRAMS).map(([k, p]) => `<option value="${k}" ${k === state.profile.program ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></div>
      <div class="field"><label>Start date ${locked ? `<span class="pill p-mute">${icon("lock", "sm")} locked</span>` : ""}</label><input name="start" type="date" value="${state.profile.startDate}" min="${toDateStr(Date.now())}" ${locked ? "disabled" : ""}></div>
    </div><button class="btn primary">Save profile</button></form>

  <form class="card" id="set-keys"><div class="card-head"><h2>Access keys</h2><span class="spacer"></span><span class="pill p-ok">${icon("lock", "sm")} stored only on this device</span></div>
    <div class="field"><label>GitHub token</label><input name="gh" type="password" value="${esc(s.githubToken || "")}" placeholder="github_pat_…" autocomplete="off">
      <div class="hint">Optional for public repos: it raises the rate limit from 60 to 5,000 requests/hour. Required for private repos (fine-grained token, "Contents: read") and for Gist sync ("Gists: read & write").</div></div>
    <div class="field"><label>Anthropic API key</label><input name="ak" type="password" value="${esc(s.anthropicKey || "")}" placeholder="sk-ant-…" autocomplete="off">
      <div class="hint">For Claude reviews of written work (Claude Opus 5.5, high effort). Calls go straight from your browser to api.anthropic.com.</div></div>
    <button class="btn primary">Save keys</button></form>

  <div class="card"><div class="card-head"><h2>Sync &amp; backup</h2></div>
    <p class="small soft" style="margin-top:0">Your progress lives in this browser. Sync it to a private GitHub Gist to use more than one device, and download a backup now and then.</p>
    <div class="row"><button class="btn" id="sync-push">${icon("refresh", "sm")} ${state.gistId ? "Sync now" : "Create private gist & sync"}</button>
      <button class="btn" id="sync-pull" ${state.gistId ? "" : "disabled"}>Pull from gist</button>
      <button class="btn" id="exp">${icon("file", "sm")} Download backup</button>
      <label class="btn" style="margin:0">Import backup<input type="file" id="imp" accept="application/json" hidden></label></div>
    ${state.gistId ? `<p class="xs muted">Gist <a href="https://gist.github.com/${esc(state.gistId)}" target="_blank" rel="noopener">${esc(state.gistId)}</a>. Syncs automatically after every change.</p>` : ""}</div>

  <div class="card"><div class="card-head"><h2 style="color:var(--bad)">Danger zone</h2></div>
    <p class="small soft" style="margin-top:0">Deletes all progress on this device. Type RESET to confirm.</p>
    <div class="row"><input id="reset-confirm" placeholder="RESET" style="max-width:160px"><button class="btn danger" id="reset">Reset everything</button></div></div>
  </div>`;
}
viewSettings.bind_ = () => {
  $("#set-profile").onsubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    state.profile.name = f.name.value.trim();
    state.profile.github = f.github.value.trim();
    if (!started()) {
      if (dateToTime(f.start.value) < dateToTime(toDateStr(Date.now()))) return toast("Start date can't be in the past.");
      state.profile.program = f.program.value;
      state.profile.startDate = f.start.value;
    }
    commit(); toast("Saved."); render();
  };
  $("#set-keys").onsubmit = (e) => {
    e.preventDefault();
    saveSecrets({ ...loadSecrets(), githubToken: e.target.gh.value.trim(), anthropicKey: e.target.ak.value.trim() });
    clearRepoCache();
    toast("Keys saved on this device.");
  };
  $("#sync-push").onclick = async () => {
    try {
      if (!loadSecrets().githubToken) throw new Error("Add a GitHub token with Gist access first.");
      if (!state.gistId) { const found = await findGist(); if (found) state.gistId = found; }
      await pushGist(state);
      saveState(state);
      toast("Synced to gist."); render();
    } catch (err) { toast(err.message, 5000); }
  };
  $("#sync-pull").onclick = async () => {
    try {
      const s2 = await pullGist(state.gistId);
      if (s2.updatedAt < state.updatedAt && !confirm("The gist is older than this device's data. Replace anyway?")) return;
      state = s2; commit(); toast("Pulled from gist."); render();
    } catch (err) { toast(err.message, 5000); }
  };
  $("#exp").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(exportState(state));
    a.download = `gradient-backup-${toDateStr(Date.now())}.json`;
    a.click();
  };
  $("#imp").onchange = async (e) => {
    try { state = importState(await e.target.files[0].text()); commit(); toast("Imported."); render(); } catch (err) { toast(err.message, 5000); }
  };
  $("#reset").onclick = () => {
    if ($("#reset-confirm").value !== "RESET") return toast("Type RESET to confirm.");
    state = emptyState(); commit(); location.hash = "#/"; render();
  };
};

function viewNotFound() { return `<div class="card empty"><h2>Not found</h2><p><a href="#/">Back to the dashboard</a></p></div>`; }

// ---------------- boot ----------------
recompute();
render();
