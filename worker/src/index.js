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
