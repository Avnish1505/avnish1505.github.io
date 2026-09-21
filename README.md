# avnish-singh-site

My personal site. Astro, fully static, no client-side JavaScript.

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
| Link preview cards | `python scripts/og.py` (needs Pillow) |
| Cancer Fusion test metrics | `python scripts/derive/cancer_fusion_metrics.py` (needs numpy) |

The résumé link appears on its own once `public/resume.pdf` exists.

## Deploy on Vercel

1. Push this folder to a new GitHub repository.
2. Import the repository in Vercel. It detects Astro. Build command `npm run build`, output directory `dist`.
3. Add your domain in the project's domain settings.

Canonical URLs, the sitemap and link previews use the production domain automatically through `VERCEL_PROJECT_PRODUCTION_URL`. Set `SITE_URL` to override it.

## Before it goes live

- Replace resume v6 with a version whose numbers match this site, then add it as `public/resume.pdf`.
- Keep the old URLs alive and redirect them here instead of deleting them.
