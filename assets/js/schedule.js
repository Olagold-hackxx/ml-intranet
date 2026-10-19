// Schedule engine.
// Time is measured in "active days" since the start. Breaks pause the clock: every deadline
// that falls after a break's start moves back by the length of the break.
import { RULES, PROGRAMS } from "./config.js";

export const DAY = 86400000;

// Local start-of-program timestamp: start date at RULES.releaseHour.
export function startTime(startDate) {
  const [y, m, d] = startDate.split("-").map(Number);
  return new Date(y, m - 1, d, RULES.releaseHour, 0, 0, 0).getTime();
}

export function dateToTime(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, RULES.releaseHour, 0, 0, 0).getTime();
}

export function toDateStr(t) {
  const d = new Date(t);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function sortedBreaks(breaks) {
  return [...(breaks || [])]
    .map((b) => ({ ...b, t: dateToTime(b.start), len: b.days * DAY }))
    .sort((a, b) => a.t - b.t);
}

// Active day offset (can be fractional) -> wall-clock time.
export function activeToTime(state, active) {
  let t = startTime(state.profile.startDate) + active * DAY;
  for (const b of sortedBreaks(state.breaks)) {
    if (b.t <= t) t += b.len;
    else break;
  }
  return t;
}

// Wall-clock time -> active days elapsed (break time doesn't count).
export function timeToActive(state, t) {
  const s = startTime(state.profile.startDate);
  let paused = 0;
  for (const b of sortedBreaks(state.breaks)) {
    if (b.t >= t) break;
    paused += Math.min(b.len, t - b.t);
  }
  return (t - s - paused) / DAY;
}

export function currentBreak(state, now = Date.now()) {
  return sortedBreaks(state.breaks).find((b) => b.t <= now && now < b.t + b.len) || null;
}

// Break bank: earned from active days worked so far.
export function breakBank(state, now = Date.now()) {
  const active = Math.max(0, timeToActive(state, now));
  const earned = Math.floor(active / RULES.breakEveryActiveDays) * RULES.breakDays;
  const used = (state.breaks || []).reduce((s, b) => s + b.days, 0);
  const nextIn = RULES.breakEveryActiveDays - (active % RULES.breakEveryActiveDays);
  return { earned, used, available: earned - used, nextInDays: Math.ceil(nextIn), active };
}

// Can a break of `days` starting on `start` (YYYY-MM-DD) be scheduled?
export function validateBreak(state, start, days, now = Date.now()) {
  if (!Number.isInteger(days) || days < 1) return "Pick at least 1 day.";
  const t = dateToTime(start);
  const today = dateToTime(toDateStr(now));
  if (t < today) return "Breaks can't start in the past — no retroactive rescues.";
  if (t < startTime(state.profile.startDate)) return "Breaks start after the program starts.";
  const bank = breakBank(state, now);
  if (days > bank.available) return `You only have ${bank.available} break day(s) banked.`;
  for (const b of sortedBreaks(state.breaks)) {
    const end = t + days * DAY;
    if (t < b.t + b.len && b.t < end) return "That overlaps a break you already scheduled.";
  }
  return null;
}

// Layout: assign every project a release and deadlines in active days.
// Returns Map(id -> slot). slot = { id, lane, release, d1, d2, days } (active days).
export function layout(programKey, projects) {
  const program = PROGRAMS[programKey];
  const slots = new Map();
  for (const [laneIdx, lane] of program.lanes.entries()) {
    const list = projects.filter((p) => p.track === lane.track);
    const total = list.reduce((s, p) => s + p.days, 0);
    if (!total) continue;
    let cum = 0;
    let prev = lane.start;
    for (const p of list) {
      cum += p.days;
      let end = lane.start + Math.round((lane.span * cum) / total);
      if (end <= prev) end = prev + 1;
      const days = end - prev;
      slots.set(p.id, {
        id: p.id,
        lane: laneIdx,
        release: prev,
        d1: end,
        d2: end + RULES.secondWindowDays(days),
        days,
      });
      prev = end;
    }
  }
  return slots;
}

export function programLength(programKey) {
  return Math.max(...PROGRAMS[programKey].lanes.map((l) => l.start + l.span));
}

// Concrete timestamps for one slot under the current breaks.
export function slotTimes(state, slot) {
  return {
    release: activeToTime(state, slot.release),
    d1: activeToTime(state, slot.d1),
    d2: activeToTime(state, slot.d2),
  };
}

// Project status at time `now`.
export function slotStatus(state, slot, now = Date.now()) {
  const t = slotTimes(state, slot);
  if (now < t.release) return "upcoming";
  if (now < t.d1) return "open";
  if (now < t.d2) return "second";
  return "closed";
}

// Multiplier for something passed/submitted at time `at`.
export function multiplierAt(state, slot, at) {
  const t = slotTimes(state, slot);
  if (at < t.d1) return RULES.firstDeadlineMultiplier;
  if (at < t.d2) return RULES.secondDeadlineMultiplier;
  return RULES.lateMultiplier;
}
