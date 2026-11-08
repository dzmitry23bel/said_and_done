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

-- Reactions (like, funny, delusional, trash, hate). Same as migrations/0002_reactions.sql.
CREATE TABLE IF NOT EXISTS reactions (
  pred_id    TEXT    NOT NULL,
  kind       TEXT    NOT NULL,
  voter      TEXT    NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (pred_id, kind, voter)
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS reaction_counts (
  pred_id TEXT    NOT NULL,
  kind    TEXT    NOT NULL,
  n       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (pred_id, kind)
) WITHOUT ROWID;

-- Visitor messages. Same as migrations/0003_messages.sql.
CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at INTEGER NOT NULL,
  pred_id    TEXT,
  topic      TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  link       TEXT,
  voter      TEXT    NOT NULL,
  status     TEXT    NOT NULL DEFAULT 'new'
);
CREATE INDEX IF NOT EXISTS messages_voter_time ON messages (voter, created_at);
CREATE INDEX IF NOT EXISTS messages_time ON messages (created_at);
