-- Said & Done: daily visit counter. Run once:
--   npx wrangler d1 execute said-and-done-likes --remote --file=migrations/0004_visits.sql

-- Page opens per day, by where the visitor came from and their country. No IP, no per-visitor rows.
CREATE TABLE IF NOT EXISTS visits (
  day     TEXT    NOT NULL,              -- YYYY-MM-DD, UTC
  source  TEXT    NOT NULL,              -- x, bluesky, youtube, search, ..., direct, other
  country TEXT    NOT NULL,              -- two-letter code from Cloudflare, XX if unknown
  n       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, source, country)
) WITHOUT ROWID;

-- Different networks per day. visitor = HMAC(secret, ip|visit|day): a one-way code that changes
-- every day, so days can't be linked. Rows older than yesterday are deleted on the next visit;
-- only the daily total in uniques is kept.
CREATE TABLE IF NOT EXISTS visitors (
  day     TEXT NOT NULL,
  visitor TEXT NOT NULL,
  PRIMARY KEY (day, visitor)
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS uniques (
  day TEXT PRIMARY KEY,
  n   INTEGER NOT NULL DEFAULT 0
);
