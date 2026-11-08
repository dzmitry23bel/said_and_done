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
- Don't guess dates, timestamps or links. Leave the field as `""` and say so in `notes`.
- Set `checked_on` to the current date whenever you set or change `status`.
- Keep `notes` to what the sources show, with no judgements about the speaker.

The Speaker filter is built from the data, so a speaker appears there once they have at least one record. The page logs a console warning (and shows a red note on the card) for a duplicate id, an unknown status, a bad date format, a non-http link, or an outcome status with no evidence link.

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
