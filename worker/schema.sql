-- Said & Done likes. Run once:
--   npx wrangler d1 execute said-and-done-likes --remote --file=schema.sql

-- One row per (prediction, network). voter = HMAC(secret, ip|id); the IP itself is never stored.
CREATE TABLE IF NOT EXISTS likes (
  pred_id    TEXT    NOT NULL,
  voter      TEXT    NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (pred_id, voter)
) WITHOUT ROWID;

-- Cached totals, recomputed from likes on every write.
CREATE TABLE IF NOT EXISTS counts (
  pred_id TEXT PRIMARY KEY,
  n       INTEGER NOT NULL DEFAULT 0
);
