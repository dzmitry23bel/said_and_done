/**
 * Said & Done reactions API (Cloudflare Worker + D1).
 *
 *   GET  /reactions                 -> { counts: { "<id>": { like: n, funny: n, ... }, ... } }
 *   POST /react { id, kind, action, turnstile? }
 *        kind:   "like" | "funny" | "delusional" | "trash" | "hate"
 *        action: "add" | "remove"   -> { id, kind, count, active }
 *
 * Kept for pages cached before the switch:
 *   GET  /likes                     -> { counts: { "<id>": n } }      (the "like" reaction)
 *   POST /like { id, action: "like" | "unlike" } -> { id, count, liked }
 *
 * Visitor messages ("Report a problem" on a card, Contact form). Stored in D1, read by the admin
 * with wrangler (see README). No email or name is collected.
 *   POST /message { id?, topic, text, link?, website?, turnstile? } -> { ok: true }
 *        topic: "wrong_quote" | "outcome" | "dates" | "suggest" | "site" | "other"
 *        text: 10-2000 characters; link: optional http(s) URL; website: honeypot, must be empty
 *   Limits: 3 per IP per minute (MSG_LIMITER), 5 per network per day, 300 in total per day.
 *
 * Visit counter (the page sends it once per browser tab; the owner's browser opts out with #me):
 *   POST /visit { ref }  -> { ok: true }
 *        ref: host of document.referrer, or "" for a direct visit
 *   Stores per day: page opens by source site and country, and the number of different networks
 *   (a one-way code HMAC(secret, ip|visit|day) that changes daily, deleted after a day).
 *
 * Paid-version poll (one answer per network; answering again replaces it):
 *   POST /poll { answer, wants, other?, website? } -> { ok: true }
 *        answer: "month5" | "year48" | "less" | "no"
 *        wants:  array of "database" | "analysis" | "alerts" | "other"; other: up to 200 characters
 *   Limits: MSG_LIMITER per IP; voter = HMAC(secret, ip|poll), the IP is never stored.
 *
 * Spam protection:
 *   - only ids that exist in the published predictions.js are accepted;
 *   - one reaction of each kind per network per prediction: we store HMAC(secret, ip|id),
 *     never the IP itself;
 *   - rate limit per IP (LIKE_LIMITER binding);
 *   - only ALLOWED_ORIGINS may call the API from a browser;
 *   - LIKES_FROZEN="true" turns writes off;
 *   - optional Cloudflare Turnstile check when TURNSTILE_SECRET is set.
 */

const KINDS = ["like", "funny", "delusional", "trash", "hate"];
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const IDS_TTL_MS = 5 * 60 * 1000;
let idsCache = { at: 0, ids: null };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const cors = corsHeaders(origin, allowed);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    // Browsers on other sites are refused. (Scripts can fake Origin; the other layers handle them.)
    if (origin && !allowed.includes(origin)) return json({ error: "origin_not_allowed" }, 403, cors);

    try {
      if (request.method === "GET" && url.pathname === "/reactions") {
        const { results } = await env.DB.prepare("SELECT pred_id, kind, n FROM reaction_counts WHERE n > 0").all();
        const counts = {};
        for (const r of results) (counts[r.pred_id] = counts[r.pred_id] || {})[r.kind] = r.n;
        return json({ counts }, 200, { ...cors, "Cache-Control": "no-store" });
      }

      if (request.method === "POST" && url.pathname === "/react") {
        return await handleReact(request, env, cors, false);
      }

      if (request.method === "POST" && url.pathname === "/message") {
        return await handleMessage(request, env, cors);
      }

      if (request.method === "POST" && url.pathname === "/visit") {
        return await handleVisit(request, env, cors, origin, allowed);
      }

      if (request.method === "POST" && url.pathname === "/poll") {
        return await handlePoll(request, env, cors, origin, allowed);
      }

      // Legacy endpoints for the old like button.
      if (request.method === "GET" && url.pathname === "/likes") {
        const { results } = await env.DB.prepare("SELECT pred_id, n FROM reaction_counts WHERE kind = 'like' AND n > 0").all();
        const counts = {};
        for (const r of results) counts[r.pred_id] = r.n;
        return json({ counts }, 200, { ...cors, "Cache-Control": "no-store" });
      }
      if (request.method === "POST" && url.pathname === "/like") {
        return await handleReact(request, env, cors, true);
      }

      return json({ error: "not_found" }, 404, cors);
    } catch (err) {
      console.error(err);
      return json({ error: "server_error" }, 500, cors);
    }
  },
};

async function handleReact(request, env, cors, legacy) {
  if (env.LIKES_FROZEN === "true") return json({ error: "frozen" }, 503, cors);

  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (!ip) return json({ error: "no_ip" }, 400, cors);

  if (env.LIKE_LIMITER) {
    const { success } = await env.LIKE_LIMITER.limit({ key: ip });
    if (!success) return json({ error: "rate_limited" }, 429, cors);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_json" }, 400, cors); }
  const id = typeof body.id === "string" ? body.id : "";
  let kind, add;
  if (legacy) {
    kind = "like";
    add = body.action === "like" ? true : body.action === "unlike" ? false : null;
  } else {
    kind = KINDS.includes(body.kind) ? body.kind : "";
    add = body.action === "add" ? true : body.action === "remove" ? false : null;
  }
  if (!ID_RE.test(id) || !kind || add === null) return json({ error: "bad_request" }, 400, cors);

  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, body.turnstile, ip);
    if (!ok) return json({ error: "turnstile_failed" }, 403, cors);
  }

  const ids = await validIds(env);
  if (!ids) return json({ error: "ids_unavailable" }, 503, cors);
  if (!ids.has(id)) return json({ error: "unknown_id" }, 404, cors);

  if (!env.LIKE_SECRET) return json({ error: "not_configured" }, 500, cors);
  const voter = await hmac(env.LIKE_SECRET, ip + "|" + id);

  const write = add
    ? env.DB.prepare("INSERT OR IGNORE INTO reactions (pred_id, kind, voter, created_at) VALUES (?1, ?2, ?3, ?4)").bind(id, kind, voter, Date.now())
    : env.DB.prepare("DELETE FROM reactions WHERE pred_id = ?1 AND kind = ?2 AND voter = ?3").bind(id, kind, voter);
  const recount = env.DB.prepare(
    "INSERT INTO reaction_counts (pred_id, kind, n) VALUES (?1, ?2, (SELECT COUNT(*) FROM reactions WHERE pred_id = ?1 AND kind = ?2)) " +
    "ON CONFLICT(pred_id, kind) DO UPDATE SET n = excluded.n"
  ).bind(id, kind);
  const read = env.DB.prepare("SELECT n FROM reaction_counts WHERE pred_id = ?1 AND kind = ?2").bind(id, kind);

  const res = await env.DB.batch([write, recount, read]); // one transaction
  const count = res[2].results[0] ? res[2].results[0].n : 0;
  return legacy
    ? json({ id, count, liked: add }, 200, cors)
    : json({ id, kind, count, active: add }, 200, cors);
}

// ---------- visitor messages ----------
const TOPICS = ["wrong_quote", "outcome", "dates", "suggest", "site", "other"];
const MSG_MIN = 10, MSG_MAX = 2000, LINK_MAX = 500;
const PER_NETWORK_PER_DAY = 5, ALL_PER_DAY = 300;
const DAY_MS = 24 * 60 * 60 * 1000;

async function handleMessage(request, env, cors) {
  if (env.MESSAGES_FROZEN === "true") return json({ error: "frozen" }, 503, cors);

  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (!ip) return json({ error: "no_ip" }, 400, cors);

  if (env.MSG_LIMITER) {
    const { success } = await env.MSG_LIMITER.limit({ key: ip });
    if (!success) return json({ error: "rate_limited" }, 429, cors);
  }

  const raw = await request.text();
  if (raw.length > 8000) return json({ error: "too_large" }, 413, cors);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: "bad_json" }, 400, cors); }
  if (!body || typeof body !== "object") return json({ error: "bad_json" }, 400, cors);

  // Honeypot: a field people never see. Bots that fill it get a normal-looking reply, nothing is stored.
  if (typeof body.website === "string" && body.website.trim()) return json({ ok: true }, 200, cors);

  const topic = TOPICS.includes(body.topic) ? body.topic : "";
  const text = clean(body.text);
  const link = clean(body.link);
  const id = typeof body.id === "string" && body.id ? body.id : "";
  if (!topic) return json({ error: "bad_topic" }, 400, cors);
  if (text.length < MSG_MIN || text.length > MSG_MAX) return json({ error: "bad_length" }, 400, cors);
  if (link && (link.length > LINK_MAX || !/^https?:\/\/[^\s]+$/i.test(link))) return json({ error: "bad_link" }, 400, cors);
  if (id && !ID_RE.test(id)) return json({ error: "bad_request" }, 400, cors);

  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, body.turnstile, ip);
    if (!ok) return json({ error: "turnstile_failed" }, 403, cors);
  }

  if (id) {
    const ids = await validIds(env);
    if (!ids) return json({ error: "ids_unavailable" }, 503, cors);
    if (!ids.has(id)) return json({ error: "unknown_id" }, 404, cors);
  }

  if (!env.LIKE_SECRET) return json({ error: "not_configured" }, 500, cors);
  const now = Date.now();
  // The day is part of the code, so the same network gets a different code every day.
  const voter = await hmac(env.LIKE_SECRET, ip + "|msg|" + Math.floor(now / DAY_MS));

  const [mine, all] = await env.DB.batch([
    env.DB.prepare("SELECT COUNT(*) AS n FROM messages WHERE voter = ?1 AND created_at > ?2").bind(voter, now - DAY_MS),
    env.DB.prepare("SELECT COUNT(*) AS n FROM messages WHERE created_at > ?1").bind(now - DAY_MS),
  ]);
  if (mine.results[0].n >= PER_NETWORK_PER_DAY) return json({ error: "daily_limit" }, 429, cors);
  if (all.results[0].n >= ALL_PER_DAY) return json({ error: "busy" }, 503, cors);

  await env.DB.prepare(
    "INSERT INTO messages (created_at, pred_id, topic, body, link, voter) VALUES (?1, ?2, ?3, ?4, ?5, ?6)"
  ).bind(now, id || null, topic, text, link || null, voter).run();
  return json({ ok: true }, 200, cors);
}

// ---------- visit counter ----------
// Where a visitor came from, by the referring site's host. Anything else is "other".
const SOURCES = [
  ["x", /(^|\.)(x\.com|twitter\.com|t\.co)$/],
  ["bluesky", /(^|\.)(bsky\.app|bsky\.social)$/],
  ["youtube", /(^|\.)(youtube\.com|youtu\.be)$/],
  ["reddit", /(^|\.)reddit\.com$/],
  ["hackernews", /(^|\.)ycombinator\.com$/],
  ["linkedin", /(^|\.)(linkedin\.com|lnkd\.in)$/],
  ["threads", /(^|\.)threads\.(net|com)$/],
  ["facebook", /(^|\.)(facebook\.com|fb\.com|instagram\.com)$/],
  ["telegram", /(^|\.)(t\.me|telegram\.org)$/],
  ["github", /(^|\.)github\.(com|io)$/],
  ["search", /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|yandex\.[a-z.]+|search\.brave\.com|ecosia\.org|yahoo\.com)$/],
];

function sourceOf(ref) {
  const host = typeof ref === "string" ? ref.trim().toLowerCase().slice(0, 253) : "";
  if (!host) return "direct";
  for (const [name, re] of SOURCES) if (re.test(host)) return name;
  return "other";
}

async function handleVisit(request, env, cors, origin, allowed) {
  // Only the site itself reports visits.
  if (!origin || !allowed.includes(origin)) return json({ error: "origin_not_allowed" }, 403, cors);
  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (!ip) return json({ error: "no_ip" }, 400, cors);
  if (env.LIKE_LIMITER) {
    const { success } = await env.LIKE_LIMITER.limit({ key: ip + "|visit" });
    if (!success) return json({ ok: true }, 200, cors); // over the limit: not counted
  }
  if (!env.LIKE_SECRET) return json({ error: "not_configured" }, 500, cors);

  const raw = await request.text();
  if (raw.length > 1000) return json({ error: "too_large" }, 413, cors);
  let body = {};
  try { body = JSON.parse(raw) || {}; } catch { body = {}; }

  const source = sourceOf(body.ref);
  const c = request.cf && request.cf.country;
  const cc = typeof c === "string" && /^[A-Z0-9]{2}$/.test(c) ? c : "XX";
  const now = Date.now();
  const day = new Date(now).toISOString().slice(0, 10);
  const yesterday = new Date(now - DAY_MS).toISOString().slice(0, 10);
  const visitor = await hmac(env.LIKE_SECRET, ip + "|visit|" + day);

  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO visits (day, source, country, n) VALUES (?1, ?2, ?3, 1) " +
      "ON CONFLICT(day, source, country) DO UPDATE SET n = n + 1"
    ).bind(day, source, cc),
    env.DB.prepare("INSERT OR IGNORE INTO visitors (day, visitor) VALUES (?1, ?2)").bind(day, visitor),
    env.DB.prepare(
      "INSERT INTO uniques (day, n) VALUES (?1, (SELECT COUNT(*) FROM visitors WHERE day = ?1)) " +
      "ON CONFLICT(day) DO UPDATE SET n = excluded.n"
    ).bind(day),
    env.DB.prepare("DELETE FROM visitors WHERE day < ?1").bind(yesterday),
  ]);
  return json({ ok: true }, 200, cors);
}

// ---------- paid-version poll ----------
const POLL_ANSWERS = ["month5", "year48", "less", "no"];
const POLL_WANTS = ["database", "analysis", "alerts", "other"];
const POLL_OTHER_MAX = 200;

async function handlePoll(request, env, cors, origin, allowed) {
  if (!origin || !allowed.includes(origin)) return json({ error: "origin_not_allowed" }, 403, cors);
  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (!ip) return json({ error: "no_ip" }, 400, cors);
  if (env.MSG_LIMITER) {
    const { success } = await env.MSG_LIMITER.limit({ key: ip + "|poll" });
    if (!success) return json({ error: "rate_limited" }, 429, cors);
  }
  if (!env.LIKE_SECRET) return json({ error: "not_configured" }, 500, cors);

  const raw = await request.text();
  if (raw.length > 2000) return json({ error: "too_large" }, 413, cors);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: "bad_json" }, 400, cors); }
  if (!body || typeof body !== "object") return json({ error: "bad_json" }, 400, cors);
  if (typeof body.website === "string" && body.website.trim()) return json({ ok: true }, 200, cors); // honeypot

  const answer = POLL_ANSWERS.includes(body.answer) ? body.answer : "";
  if (!answer) return json({ error: "bad_answer" }, 400, cors);
  const wants = Array.isArray(body.wants) ? [...new Set(body.wants.filter((w) => POLL_WANTS.includes(w)))] : [];
  let other = wants.includes("other") ? clean(body.other) : "";
  if (other.length > POLL_OTHER_MAX) other = other.slice(0, POLL_OTHER_MAX);

  const voter = await hmac(env.LIKE_SECRET, ip + "|poll");
  await env.DB.prepare(
    "INSERT INTO poll_votes (voter, created_at, answer, wants, other) VALUES (?1, ?2, ?3, ?4, ?5) " +
    "ON CONFLICT(voter) DO UPDATE SET created_at = excluded.created_at, answer = excluded.answer, wants = excluded.wants, other = excluded.other"
  ).bind(voter, Date.now(), answer, wants.join(","), other || null).run();
  return json({ ok: true }, 200, cors);
}

// Trim, drop control characters except newlines and tabs.
function clean(v) {
  return typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim() : "";
}

// Ids from the published predictions.js, cached for a few minutes per isolate.
async function validIds(env) {
  const now = Date.now();
  if (idsCache.ids && now - idsCache.at < IDS_TTL_MS) return idsCache.ids;
  try {
    const r = await fetch(env.PREDICTIONS_URL, { cf: { cacheTtl: 300 } });
    if (!r.ok) throw new Error("predictions.js HTTP " + r.status);
    // Drop comments first so the example in the header comment doesn't count as a real id.
    const text = (await r.text()).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    const ids = new Set();
    for (const m of text.matchAll(/\bid\s*:\s*["']([A-Za-z0-9_-]{1,64})["']/g)) ids.add(m[1]);
    idsCache = { at: now, ids };
    return ids;
  } catch (err) {
    console.error(err);
    return idsCache.ids; // stale list is better than none
  }
}

async function hmac(secret, msg) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyTurnstile(secret, token, ip) {
  if (typeof token !== "string" || !token) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  form.append("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const data = await r.json().catch(() => ({}));
  return data.success === true;
}

function corsHeaders(origin, allowed) {
  const h = { "Vary": "Origin" };
  if (origin && allowed.includes(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type";
    h["Access-Control-Max-Age"] = "86400";
  }
  return h;
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}
