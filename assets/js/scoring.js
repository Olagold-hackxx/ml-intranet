// Scoring engine (ALX/Holberton formula + deadline multipliers + rubric reviews).
//
//   task earned   = best over attempts of (fraction of check points passed × deadline multiplier at that time)
//                   written: latest review score of a submission × multiplier at submission time
//   project score = M × (1 + A)      M, A = point-weighted mean earned over mandatory / advanced tasks
//                   → 0–200%, exactly like the intranet ("100% + 100% × 41.18% = 141.18%")
//   average       = Σ weight·score / Σ weight over counted projects (weight = project days)
import { RULES } from "./config.js";
import { multiplierAt, slotStatus, slotTimes, timeToActive } from "./schedule.js";

export const taskKey = (pid, i) => `${pid}:${i}`;

export function taskResult(state, project, i, slot) {
  const task = project.tasks[i];
  const key = taskKey(project.id, i);
  if (task.kind === "code") {
    const attempts = state.attempts[key] || [];
    let best = { earned: 0, raw: 0, mult: 1, at: null };
    for (const a of attempts) {
      const mult = multiplierAt(state, slot, a.at);
      const earned = a.frac * mult;
      if (earned > best.earned || (earned === best.earned && a.frac > best.raw)) best = { earned, raw: a.frac, mult, at: a.at };
    }
    const last = attempts[attempts.length - 1] || null;
    return { ...best, last, status: attempts.length ? (best.raw === 1 ? "done" : "partial") : "todo" };
  }
  // written
  const subs = state.submissions[key] || [];
  let best = { earned: 0, raw: 0, mult: 1, at: null, review: null };
  let pending = false;
  subs.forEach((s, si) => {
    const reviews = (state.reviews[key] || []).filter((r) => r.sub === si);
    const latest = reviews[reviews.length - 1];
    if (!latest) { pending = true; return; }
    const mult = multiplierAt(state, slot, s.at);
    const earned = latest.score * mult;
    if (earned >= best.earned) best = { earned, raw: latest.score, mult, at: s.at, review: latest };
  });
  const lastSub = subs[subs.length - 1] || null;
  const lastReviewed = lastSub && (state.reviews[key] || []).some((r) => r.sub === subs.length - 1);
  return {
    ...best,
    submission: lastSub,
    pendingReview: !!lastSub && !lastReviewed,
    status: !subs.length ? "todo" : pending && !lastReviewed ? "pending" : best.raw >= 0.999 ? "done" : "partial",
  };
}

export function projectScore(state, project, slot) {
  const results = project.tasks.map((_, i) => taskResult(state, project, i, slot));
  const agg = (type) => {
    let pts = 0, got = 0;
    project.tasks.forEach((t, i) => {
      if (t.type !== type) return;
      const w = t.points || 1;
      pts += w;
      got += w * results[i].earned;
    });
    return pts ? got / pts : 0;
  };
  const M = agg("mandatory");
  const A = agg("advanced");
  const score = M * (1 + A) * 100;
  const mandatoryDone = project.tasks.every((t, i) => t.type !== "mandatory" || results[i].raw >= 0.999);
  return { M, A, score, results, mandatoryDone };
}

// Which projects count toward the average right now.
export function counts(state, slot, ps, now = Date.now()) {
  const st = slotStatus(state, slot, now);
  return st === "second" || st === "closed" || (st === "open" && ps.M >= 0.999);
}

export function overview(state, projects, slots, now = Date.now()) {
  let w = 0, s = 0;
  const rows = [];
  for (const p of projects) {
    const slot = slots.get(p.id);
    if (!slot) continue;
    const ps = projectScore(state, p, slot);
    const status = slotStatus(state, slot, now);
    const counted = counts(state, slot, ps, now);
    rows.push({ project: p, slot, ps, status, counted, times: slotTimes(state, slot) });
    if (counted) { w += p.days; s += p.days * ps.score; }
  }
  const average = w ? s / w : null;
  return { average, rows, standing: standing(state, rows, now), laxity: laxity(state, rows, now) };
}

// Monthly standing (28 active days per month). Month 1 needs ≥ 80%, later months ≥ 70%.
export function standing(state, rows, now = Date.now()) {
  const nowActive = timeToActive(state, now);
  const months = [];
  for (const r of rows) {
    if (!r.counted) continue;
    const m = Math.floor(r.slot.d1 / 28);
    (months[m] ||= { w: 0, s: 0 });
    months[m].w += r.project.days;
    months[m].s += r.project.days * r.ps.score;
  }
  const list = [];
  const currentMonth = Math.max(0, Math.floor(nowActive / 28));
  for (let m = 0; m <= currentMonth; m++) {
    const mm = months[m];
    const avg = mm ? mm.s / mm.w : null;
    const need = m === 0 ? RULES.firstMonthThreshold : RULES.threshold;
    list.push({ month: m + 1, average: avg, need, below: avg !== null && avg < need });
  }
  // Finished months only drive probation; current month can still be fixed.
  const done = list.filter((x) => x.month - 1 < currentMonth && x.average !== null);
  let streak = 0;
  for (let i = done.length - 1; i >= 0 && done[i].below; i--) streak++;
  const cur = list[list.length - 1];
  let level = "good";
  if (streak >= 2) level = "probation";
  else if (streak === 1 || (cur && cur.below)) level = "warning";
  return { months: list, level, streak };
}

// Laxity signals: things that cost points or show drift.
export function laxity(state, rows, now = Date.now()) {
  let lost = 0;      // percentage points lost to late multipliers so far (weighted by days)
  let missed = 0;    // mandatory tasks left unfinished in closed projects
  const overdue = []; // projects in their 2nd-deadline window with mandatory work left
  for (const r of rows) {
    r.project.tasks.forEach((t, i) => {
      const res = r.ps.results[i];
      if (res.raw > 0 && res.mult < 1) lost += (res.raw - res.earned) * (t.points || 1);
      if (r.status === "closed" && t.type === "mandatory" && res.raw < 0.999) missed++;
    });
    if (r.status === "second" && !r.ps.mandatoryDone) overdue.push(r);
  }
  const times = [];
  for (const list of Object.values(state.attempts)) for (const a of list) times.push(a.at);
  for (const list of Object.values(state.submissions)) for (const s of list) times.push(s.at);
  const lastActivity = times.length ? Math.max(...times) : null;
  const idleDays = lastActivity ? Math.floor((now - lastActivity) / 86400000) : null;
  return { lost, missed, overdue, lastActivity, idleDays };
}
