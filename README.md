# Said & Done

*What was said. What happened.*

A static page that lists public statements about the future, each with a link to its source and a status checked against public evidence. Two files: `index.html` (layout, styles, rendering) and `predictions.js` (the data). No server, no libraries, no tracking.

## Add a record

Open `predictions.js` and add an object to the `PREDICTIONS` array. The comment at the top of that file describes every field.

```js
const PREDICTIONS = [
  {
    id: "jh-2025-example",
    speaker: "Jensen Huang",
    claim: "Exact words from the source.",
    said_on: "2025-01-07",
    source_url: "https://…",
    source_time: "",
    deadline: "",
    status: "pending",
    evidence_url: "",
    checked_on: "2025-01-08",
    notes: "Timestamp unknown."
  }
];
```

Rules:

- Add a record only when you have the quote and the source in front of you.
- `happened`, `partial` and `not_happened` need a public `evidence_url`. Without one, use `pending` or `too_early`.
- If it came true only after the deadline, use `partial` and say in `notes` when it happened.
- When the speaker gives no exact date ("a few months", "about to"), pick one, and say in `notes` how you read it.
- Don't guess dates, timestamps or links. Leave the field as `""` and say so in `notes`.
- Set `checked_on` to the current date whenever you set or change `status`.
- Keep `notes` to what the sources show, with no judgements about the speaker.

### Repeated promises (chains)

When a speaker makes the same promise at different times, give those records the same optional `chain` id and add its title to `CHAINS` at the top of `predictions.js`:

```js
const CHAINS = {
  "fsd-driverless": "Self-driving with no one at the wheel"
};
// in each record of that promise:
chain: "fsd-driverless",
```

Each card in a chain gets a "Repeated promise · said N times" button. It opens a view with every statement of that promise, oldest first, at `#chain=<id>`; that link can be shared. Only link records that repeat the same promise, not just the same topic.

### What the page shows

The summary above the list counts, for all speakers or the selected one, how many predictions were checked and how they turned out, and how many are overdue (deadline passed, still `pending` or `too_early`). The **Overdue** chip and status option list those. Each card also shows a bar for the time between the statement and its deadline, and YouTube source links open at `source_time`.

The Speaker filter is built from the data, so a speaker appears there once they have at least one record. The page logs a console warning (and shows a red note on the card) for a duplicate id, an unknown status, an unknown chain, a bad date format, a non-http link, or an outcome status with no evidence link.

## Check locally

```bash
node --check predictions.js
```

Then open `index.html` in a browser, either by double-clicking it or through a local server:

```bash
python -m http.server 8000
```

and go to http://localhost:8000. Open the developer console and confirm there are no errors or warnings.

## Publish on GitHub Pages

1. Create a public repository and put `index.html`, `predictions.js` and this README at its root.
2. In the repository go to **Settings → Pages**, set **Source** to *Deploy from a branch*, pick `main` and `/ (root)`, and save.
3. After a minute the site is live at `https://<user>.github.io/<repo>/`.

Every commit to `predictions.js` updates the site. Pick a neutral repository name; don't use any speaker's name in it.

## Brand

The same name, logo and colours are used on the site and on every channel.

**Logo**: a speech bubble (said) holding a check mark (done). Files in `brand/`:

- `logo-mark.svg`: lime mark on a transparent background, for dark surfaces.
- `avatar.svg`: lime mark on ink, square. Works as a round avatar too (YouTube, X).

The site's favicon is the same mark, embedded in `index.html`.

**Palette "Ink and lime"** (dark first):

| Role | Dark (default) | Light |
| --- | --- | --- |
| Background | `#0E0F11` | `#F6F7F2` |
| Surface / cards | `#17191C` | `#FFFFFF` |
| Border | `#2A2D31` | `#E1E3DA` |
| Text | `#F2F3F0` | `#111312` |
| Muted text | `#9A9EA3` | `#5A5E57` |
| Accent | `#C6F432` lime | `#4A6B00` olive |

Lime is for marks, links and highlights on dark backgrounds only. It isn't readable as text on white, so light surfaces use the olive.

Status colours are separate from the brand and keep their meaning everywhere: pending (grey-blue), happened (mint), partial (amber), did not happen (red), too early (violet). "Happened" is mint rather than green so it doesn't merge with the lime accent.

## Reactions

Visitors can react to a prediction with five reactions: 👍 Like, 😂 Funny, 🤡 Delusional, 💩 Trash, 😡 Hate. Each one is a separate toggle; a visitor can use several on the same card. Counts are shared and stored by a small Cloudflare Worker with a D1 database in `worker/`. The site itself stays static: if `LIKES_API` in `index.html` is empty, or the Worker is unreachable, the reaction buttons are hidden and everything else works. The **Hottest** sort orders cards by total reactions. Reactions never change a prediction's status.

**What is stored:** a count per prediction and reaction, plus one row per (prediction, reaction, network) holding `HMAC(secret, ip|id)`. That one-way code can't be turned back into an IP. No cookies, accounts or analytics. The visitor's own reactions are remembered in their browser (`localStorage`).

**Spam protection:**

- only ids found in the published `predictions.js` can be reacted to;
- each reaction counts once per network per prediction;
- 20 reaction requests per IP per minute;
- browsers on other sites are refused (`ALLOWED_ORIGINS`);
- on the free plan the worst case is the daily quota running out: reactions pause until midnight UTC, no bill.

**API:** `GET /reactions` returns all counts; `POST /react` with `{id, kind, action: "add" | "remove"}`. The old `GET /likes` and `POST /like` still work and map to the 👍 reaction. Reactions replaced the single like in `migrations/0002_reactions.sql`, which copied existing likes over and left the old `likes` and `counts` tables as a backup.

### First-time setup

**Already done for this repo:** the Worker runs at `https://said-and-done-likes.saidanddone.workers.dev` and `LIKES_API` points to it. The steps below are for setting it up again from scratch.

Needs Node.js 18+ (`winget install OpenJS.NodeJS.LTS` on Windows) and a free Cloudflare account. Run in `worker/`:

```bash
npx wrangler login
npx wrangler d1 create said-and-done-likes
```

Copy the printed `database_id` into `wrangler.toml`, then:

```bash
npx wrangler d1 execute said-and-done-likes --remote --file=schema.sql
npx wrangler secret put LIKE_SECRET
npx wrangler deploy
```

For `LIKE_SECRET` paste any long random string and don't share it. On Windows, `worker\set-secret.cmd` generates one and uploads it without showing it. Wrangler is a local dependency of `worker/` (`npm install` there first); `npx wrangler` uses it. `deploy` prints the Worker URL, like `https://said-and-done-likes.<name>.workers.dev`. Put it in `index.html` as `LIKES_API` (no trailing slash) and push.

GitHub Pages must be on: the Worker reads ids from `PREDICTIONS_URL`.

### Admin

```bash
# pause all reactions: set LIKES_FROZEN = "true" in wrangler.toml, then
npx wrangler deploy

# reset all reactions on one prediction
npx wrangler d1 execute said-and-done-likes --remote --command "DELETE FROM reactions WHERE pred_id='ID'; DELETE FROM reaction_counts WHERE pred_id='ID';"

# see counts
npx wrangler d1 execute said-and-done-likes --remote --command "SELECT * FROM reaction_counts ORDER BY n DESC;"
```

### If spam gets through: Turnstile (off by default)

1. In the Cloudflare dashboard create a Turnstile widget for `dzmitry23bel.github.io` (mode: Invisible or Managed).
2. `npx wrangler secret put TURNSTILE_SECRET` with its secret key.
3. Put its site key in `index.html` as `TURNSTILE_SITEKEY` and push.

This loads a script from `challenges.cloudflare.com`, so keep it off unless needed. To turn it off again: `npx wrangler secret delete TURNSTILE_SECRET` and empty `TURNSTILE_SITEKEY`.
