# avnish-singh-site

My personal site. Astro, fully static.

It is designed as a lab notebook: graph paper, a notebook margin, chalk colours and handwritten margin notes,
in a dark "slate board" and a light "engineering pad" theme. Colour carries meaning everywhere: yellow is a number you
can check, mint is something that held, rose is something that failed or went against me, sky is links and other
people's baselines.

A little client-side JavaScript runs the interactive figures (the F1 vs MCC calculator, the mutation explorer, the
temperature slider, the AegisOps pipeline) and the theme toggle. Every page reads fine without it: figures fall back to
static content, and formulas are plain MathML.

## The rule this site enforces

Every highlighted number is defined once, in `src/data/claims.ts`, together with where it came from: a line in a file at a pinned commit, a commit, or a script that recomputes it from committed artifacts.

- `npm run check:claims` downloads each cited file at its pinned commit and fails if the number is not on the cited line.
- CI runs that check before every build, then checks every link with lychee. It also runs every Monday, so dead links show up even when nothing was pushed.

If a project changes, update the value, the line and the sha together, then run the check.

## Run it

```bash
npm install
npm run dev            # http://localhost:4321
npm run check:claims   # needs Node 22.18 or newer
npm run build          # output in dist/
```

## Where things live

| To change | Edit |
|---|---|
| Name, headline, meta description, links, "last updated" date | `src/site.config.ts` |
| Homepage bio and project summaries | `src/pages/index.astro` |
| Case studies | `src/pages/work/*.astro` |
| Papers, posts, earlier projects | `src/data/content.ts` |
| Any number | `src/data/claims.ts`, then `npm run check:claims` |
| Photo | `src/assets/avnish.jpg` (square) |
| Colours, fonts, the grid | `src/styles/global.css` |
| Interactive figures | `src/components/MccPlayground.astro`, `MutationExplorer.astro`, `TemperatureDemo.astro`, `Pipeline.astro` |
| Code blocks | `src/components/CodeBlock.astro` (Shiki, coloured by CSS variables) |
| Link preview cards | `python scripts/og.py` (needs Pillow; numbers in it are copied from claims.ts) |
| Cancer Fusion test metrics | `python scripts/derive/cancer_fusion_metrics.py` (needs numpy) |

The résumé link appears on its own once `public/resume.pdf` exists.

## Deploy on GitHub Pages

This repo is a GitHub *user site* (`avnish1505.github.io`), so it deploys at the root with no `base` path.

1. In the repo's Settings → Pages, set Source to **GitHub Actions**. `.github/workflows/deploy.yml` builds and publishes `dist/` on every push to `main`.
2. Canonical URLs, the sitemap and link previews all come from the `site` value in `astro.config.mjs` — update that one line if the domain changes.
3. Adding a custom domain: add a `public/CNAME` file with the domain, set the new `site` value in `astro.config.mjs` to match, and configure the domain in Settings → Pages.

## Before it goes live

- `public/resume.pdf` still describes the old AegisOps (an LLM allocating units), calls Cancer Fusion "deployed", says
  "132 tests" and "arXiv submission pending". Replace it with a version that matches this site.
- Keep the old URLs alive and redirect them here instead of deleting them.
