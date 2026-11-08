-- Said & Done: messages from visitors ("Report a problem" on a card, and the Contact form).
-- Run once:
--   npx wrangler d1 execute said-and-done-likes --remote --file=migrations/0003_messages.sql

-- voter = HMAC(secret, ip|msg|day): a one-way code that changes every day, used only to cap
-- how many messages one network can send per day. The IP is never stored. No email, no name.
CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at INTEGER NOT NULL,
  pred_id    TEXT,                       -- card the message is about; NULL for the Contact form
  topic      TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  link       TEXT,
  voter      TEXT    NOT NULL,
  status     TEXT    NOT NULL DEFAULT 'new'  -- 'new' | 'done'
);
CREATE INDEX IF NOT EXISTS messages_voter_time ON messages (voter, created_at);
CREATE INDEX IF NOT EXISTS messages_time ON messages (created_at);
