/**
 * Said & Done likes API (Cloudflare Worker + D1).
 *
 *   GET  /likes                     -> { counts: { "<id>": n, ... } }
 *   POST /like  { id, action, turnstile? }
 *        action: "like" | "unlike"  -> { id, count, liked }
 *
 * Spam protection:
 *   - only ids that exist in the published predictions.js are accepted;
 *   - one like per network per prediction: we store HMAC(secret, ip|id),
 *     never the IP itself;
 *   - rate limit per IP (LIKE_LIMITER binding);
 *   - only ALLOWED_ORIGINS may call the API from a browser;
 *   - LIKES_FROZEN="true" turns writes off;
 *   - optional Cloudflare Turnstile check when TURNSTILE_SECRET is set.
 */

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
      if (request.method === "GET" && url.pathname === "/likes") {
        const { results } = await env.DB.prepare("SELECT pred_id, n FROM counts WHERE n > 0").all();
        const counts = {};
        for (const r of results) counts[r.pred_id] = r.n;
        return json({ counts }, 200, { ...cors, "Cache-Control": "no-store" });
      }

      if (request.method === "POST" && url.pathname === "/like") {
        return await handleLike(request, env, cors);
      }

      return json({ error: "not_found" }, 404, cors);
    } catch (err) {
      console.error(err);
      return json({ error: "server_error" }, 500, cors);
    }
  },
};

async function handleLike(request, env, cors) {
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
  const action = body.action === "unlike" ? "unlike" : body.action === "like" ? "like" : "";
  if (!ID_RE.test(id) || !action) return json({ error: "bad_request" }, 400, cors);

  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, body.turnstile, ip);
    if (!ok) return json({ error: "turnstile_failed" }, 403, cors);
  }

  const ids = await validIds(env);
  if (!ids) return json({ error: "ids_unavailable" }, 503, cors);
  if (!ids.has(id)) return json({ error: "unknown_id" }, 404, cors);

  if (!env.LIKE_SECRET) return json({ error: "not_configured" }, 500, cors);
  const voter = await hmac(env.LIKE_SECRET, ip + "|" + id);

  const write = action === "like"
    ? env.DB.prepare("INSERT OR IGNORE INTO likes (pred_id, voter, created_at) VALUES (?1, ?2, ?3)").bind(id, voter, Date.now())
    : env.DB.prepare("DELETE FROM likes WHERE pred_id = ?1 AND voter = ?2").bind(id, voter);
  const recount = env.DB.prepare(
    "INSERT INTO counts (pred_id, n) VALUES (?1, (SELECT COUNT(*) FROM likes WHERE pred_id = ?1)) " +
    "ON CONFLICT(pred_id) DO UPDATE SET n = excluded.n"
  ).bind(id);
  const read = env.DB.prepare("SELECT n FROM counts WHERE pred_id = ?1").bind(id);

  const res = await env.DB.batch([write, recount, read]); // one transaction
  const count = res[2].results[0] ? res[2].results[0].n : 0;
  return json({ id, count, liked: action === "like" }, 200, cors);
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
