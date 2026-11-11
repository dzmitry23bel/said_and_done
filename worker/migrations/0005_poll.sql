-- Said & Done: "would you pay for a paid version?" poll. Run once:
--   npx wrangler d1 execute said-and-done-likes --remote --file=migrations/0005_poll.sql

-- One answer per network: voter = HMAC(secret, ip|poll), a one-way code; the IP is never stored.
-- Answering again replaces the earlier answer.
CREATE TABLE IF NOT EXISTS poll_votes (
  voter      TEXT    PRIMARY KEY,
  created_at INTEGER NOT NULL,
  answer     TEXT    NOT NULL,   -- 'month5' | 'year48' | 'less' | 'no'
  wants      TEXT    NOT NULL,   -- comma-separated: database, analysis, alerts, other
  other      TEXT                -- free text when 'other' is picked, up to 200 characters
) WITHOUT ROWID;
