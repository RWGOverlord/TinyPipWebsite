# Tiny Pip website

The landing page and privacy policy for [Tiny Pip](https://heytinypip.com). Plain HTML, CSS and a little vanilla JS, with no build step. Served by GitHub Pages from the root of `main`.

## Files

- `index.html`: the landing page (hero, features, screenshots, joining the beta, questions).
- `features/index.html`: everything the app does, grouped by what you're struggling with. Served at `/features/`.
- Topic pages, each a folder with an `index.html`, served at `/<folder>/`: `procrastination-app`, `task-paralysis`, `task-breakdown`, `adhd-friendly-task-app`, `gentle-productivity`, `self-care-companion`, `virtual-pet-productivity-app`.
- `privacy.html`: the privacy policy. It mirrors the app's `docs/privacy-policy.md` in the TinyPip repo and adds a section for the website.
- `partials/`: the shared header (with the Features menu), footer and beta card. See below.
- `css/style.css`: all styles. Colors and shapes follow the app's "meadow" theme.
- `js/main.js`: analytics events, showreel play/pause, the Features menu, and the footer year.
- `assets/`: self-hosted fonts (Fredoka, Nunito; OFL), images and the showreel loop. Every image is cut from the app's real art (the icon and the showreel); nothing is redrawn.
- `assets/img/app/`: real screenshots from the app (600×1182, JPEG and WebP), taken on an Android phone with the app's demo save (`tinypip://demo`), so they show made-up tasks, never anyone's real data.
- `docs/benchmark-queries.md`: the search and AI-assistant questions we re-run to see whether Tiny Pip shows up.

## Shared header and footer

Every page carries the same header, footer and beta card, pasted in between marker comments such as `<!-- partial:header -->` and `<!-- /partial:header -->`. Edit them in `partials/`, then run:

```sh
python3 tools/sync_partials.py
```

It copies them into every page (and marks the link to the current page). Pages stay plain HTML: there's still no build step for GitHub Pages. `--check` reports pages that are out of date without changing them.

## Writing about the app

Only describe what the current app does. The app repo (TinyPip) is the source of truth: check its code, not just its plans, before adding a feature claim. Some things are built but only open at launch (Candy Meadow, the Pirate Ship, the Crystal Cave, buying Plus); say "at launch" for those. Tiny Pip is a productivity and self-care app: never say it treats or improves ADHD, anxiety, depression or anything else.
- `CNAME`: the custom domain, `heytinypip.com`.
- `sitemap.xml` and `robots.txt`: for search engines. When you add a page, add it to the sitemap and update the `lastmod` dates of pages you change.

## Preview locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Turning on GitHub Pages

1. Push `main` to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, then choose **Branch:** `main` and the **/ (root)** folder, and click **Save**.
4. After a minute or so, the site appears at the address shown on that page.

## Custom domain (heytinypip.com)

The `CNAME` file already names `heytinypip.com`. At your domain registrar's DNS settings, add:

| Type | Host | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `rwgoverlord.github.io` |

Then, in **Settings → Pages**, check that the custom domain reads `heytinypip.com` and wait for the DNS check to pass. Once the certificate is ready, tick **Enforce HTTPS**. DNS changes can take up to a day.

Optional but recommended: verify the domain under your GitHub account (**Settings → Pages → Verified domains**), so no one else can claim it for their Pages site.
