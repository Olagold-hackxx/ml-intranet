// Reviews for written work: Claude (your own API key), a peer (shareable link), or yourself (capped).
import { RUBRICS, LEVELS, rubricScore } from "./rubrics.js";
import { loadSecrets } from "./state.js";
import { repoSnapshot } from "./checker.js";

const SDK_URL = "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.129.0/+esm";
const MODEL = "claude-opus-5-5";

function rubricText(task) {
  const r = RUBRICS[task.rubric];
  const crit = r.criteria
    .map((c) => `- ${c.key} — ${c.name} (${c.weight}%): ${c.guide}`)
    .join("\n");
  const levels = LEVELS.map((l) => `${l.v} = ${l.label}`).join(", ");
  const must = (task.criteria || []).map((c, i) => `${i + 1}. ${c}`).join("\n");
  return { crit, levels, must };
}

function schemaFor(task) {
  const r = RUBRICS[task.rubric];
  const levelProps = Object.fromEntries(r.criteria.map((c) => [c.key, { type: "integer", enum: [0, 1, 2, 3, 4] }]));
  return {
    type: "object",
    properties: {
      levels: { type: "object", properties: levelProps, required: r.criteria.map((c) => c.key), additionalProperties: false },
      must_see: {
        type: "array",
        items: {
          type: "object",
          properties: { present: { type: "boolean" }, note: { type: "string" } },
          required: ["present", "note"],
          additionalProperties: false,
        },
      },
      feedback: { type: "string" },
      could_not_read: { type: "boolean" },
    },
    required: ["levels", "must_see", "feedback", "could_not_read"],
    additionalProperties: false,
  };
}

function systemPrompt() {
  return `You are a strict teaching assistant for Stanford-level machine learning courses (CS229, CS224N, CS229M/STATS214), grading one learner's written submission against a fixed rubric, the way a careful grader works on Gradescope.

How to grade:
- Deduct from full marks. Excellent means you would not take off a single point; Good means minor slips only; Fair means a real gap or an unjustified key step; Poor means the main idea is wrong or mostly missing; Missing means absent.
- For each numbered "must see" item, decide whether the submission actually contains it. Be literal: an item counts as present only when the work states or proves it, not when it is merely implied.
- Never reward length, confidence or formatting on their own. Check every equation you can.
- If the content is unreadable, empty, or isn't the assigned work, set could_not_read to true and give every level 0.
- Feedback is Markdown for the learner: the score-relevant problems first (quote the exact line or step), then what to fix, then one strength. Keep it under 350 words. Use $...$ for math.`;
}

function userPrompt(project, task, rt, sourceNote) {
  return `Project: ${project.id} — ${project.title}
Task: ${task.title}

Assignment given to the learner:
<assignment>
${task.body}
</assignment>

Rubric criteria (level for each: ${rt.levels}):
${rt.crit}

"Must see" items, in order:
${rt.must || "(none)"}

${sourceNote}

Grade the submission. Reply with only a JSON object: {"levels": {criterion key: 0-4}, "must_see": [{"present": bool, "note": string}] (one per numbered item, same order), "feedback": string, "could_not_read": bool}.`;
}

// Build the content blocks for the submission.
async function submissionContent(owner, project, task, sub) {
  if (sub.pasted) return { blocks: [{ type: "text", text: `<submission>\n${sub.pasted}\n</submission>` }], note: "The submission text is below.", useFetch: false };
  if (sub.kind === "link") {
    return { blocks: [], note: `The submission is published at this URL. Fetch it with the web_fetch tool and grade its content: ${sub.url}`, useFetch: true };
  }
  const snap = await repoSnapshot(owner, project.repo);
  const path = `${project.dir}/${sub.url}`;
  if (!snap.has(path)) throw new Error(`${sub.url} isn't in ${project.repo}/${project.dir} anymore.`);
  if (path.toLowerCase().endsWith(".pdf")) {
    const data = await snap.readBase64(path);
    return {
      blocks: [{ type: "document", source: { type: "base64", media_type: "application/pdf", data } }],
      note: "The submission is the attached PDF.",
      useFetch: false,
    };
  }
  const text = await snap.read(path);
  return { blocks: [{ type: "text", text: `<submission file="${sub.url}">\n${text}\n</submission>` }], note: "The submission text is below.", useFetch: false };
}

function parseJSON(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Claude didn't return a JSON review.");
  return JSON.parse(m[0]);
}

export async function aiReview({ owner, project, task, sub }) {
  const { anthropicKey } = loadSecrets();
  if (!anthropicKey) throw new Error("Add your Anthropic API key in Settings to use AI review.");
  const { default: Anthropic } = await import(SDK_URL);
  const client = new Anthropic({ apiKey: anthropicKey, dangerouslyAllowBrowser: true });
  const rt = rubricText(task);
  const content = await submissionContent(owner, project, task, sub);
  const params = {
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "high", format: { type: "json_schema", schema: schemaFor(task) } },
    system: systemPrompt(),
    messages: [
      { role: "user", content: [...content.blocks, { type: "text", text: userPrompt(project, task, rt, content.note) }] },
    ],
  };
  if (content.useFetch) params.tools = [{ type: "web_fetch_20260209", name: "web_fetch", max_uses: 3 }];

  let msg;
  try {
    msg = await client.beta.messages.create(params);
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error("Anthropic rejected the API key (401). Check it in Settings.");
    if (e instanceof Anthropic.RateLimitError) throw new Error("Rate limited by the Anthropic API — wait a minute and retry.");
    if (e instanceof Anthropic.BadRequestError && content.useFetch) {
      // Some feature combinations may be rejected; retry without the structured-output constraint.
      const { output_config, ...rest } = params;
      msg = await client.beta.messages.create({ ...rest, output_config: { effort: "high" } });
    } else throw e;
  }
  if (msg.stop_reason === "refusal") throw new Error("The model declined to review this submission.");
  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  const out = parseJSON(text);
  if (out.could_not_read) throw new Error("Claude couldn't read the submission (blocked page or empty file). Paste the text instead.");
  const present = (task.criteria || []).map((_, i) => !!(out.must_see[i] && out.must_see[i].present));
  const notes = (task.criteria || []).map((c, i) => ({ item: c, present: present[i], note: out.must_see[i]?.note || "" }));
  return {
    by: "ai",
    reviewer: msg.model,
    levels: out.levels,
    present,
    notes,
    feedback: out.feedback,
    score: rubricScore(task.rubric, out.levels, present),
  };
}

// ---------- Peer review links ----------
// The link carries the assignment + rubric; the reviewer's verdict comes back as a code to paste.
const enc = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const dec = (s) => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/")))));

function checksum(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}

export function peerLink({ owner, project, taskIndex, sub }) {
  const task = project.tasks[taskIndex];
  const where = sub.kind === "link" ? sub.url : `https://github.com/${owner}/${project.repo}/blob/HEAD/${project.dir}/${sub.url}`;
  const payload = { v: 1, pid: project.id, ti: taskIndex, at: sub.at, learner: owner, title: `${project.title} — ${task.title}`, where };
  const base = location.href.split("#")[0];
  return `${base}#/peer/${enc(payload)}`;
}

export function decodePeerPayload(s) { return dec(s); }

export function makePeerCode(payload, review) {
  const body = { pid: payload.pid, ti: payload.ti, at: payload.at, ...review };
  const raw = JSON.stringify(body);
  return `MLI-REVIEW.${enc(body)}.${checksum(raw)}`;
}

export function readPeerCode(code) {
  const m = code.trim().match(/^MLI-REVIEW\.([A-Za-z0-9_-]+)\.([a-z0-9]+)$/);
  if (!m) throw new Error("That doesn't look like a review code.");
  const body = dec(m[1]);
  if (checksum(JSON.stringify(body)) !== m[2]) throw new Error("Review code is corrupted or was edited.");
  return body;
}
