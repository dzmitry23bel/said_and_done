-- Said & Done: likes -> five reactions (like, funny, delusional, trash, hate).
-- Run once:
--   npx wrangler d1 execute said-and-done-likes --remote --file=migrations/0002_reactions.sql
-- Old tables (likes, counts) are kept untouched as a backup.

-- One row per (prediction, reaction kind, network). voter = HMAC(secret, ip|id); the IP is never stored.
CREATE TABLE IF NOT EXISTS reactions (
  pred_id    TEXT    NOT NULL,
  kind       TEXT    NOT NULL,
  voter      TEXT    NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (pred_id, kind, voter)
) WITHOUT ROWID;

-- Cached totals per prediction and kind, recomputed from reactions on every write.
CREATE TABLE IF NOT EXISTS reaction_counts (
  pred_id TEXT    NOT NULL,
  kind    TEXT    NOT NULL,
  n       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (pred_id, kind)
) WITHOUT ROWID;

-- Carry existing likes over as the "like" reaction.
INSERT OR IGNORE INTO reactions (pred_id, kind, voter, created_at)
  SELECT pred_id, 'like', voter, created_at FROM likes;

INSERT OR REPLACE INTO reaction_counts (pred_id, kind, n)
  SELECT pred_id, kind, COUNT(*) FROM reactions GROUP BY pred_id, kind;
