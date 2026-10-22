# Tiny Pip website

The landing page and privacy policy for [Tiny Pip](https://heytinypip.com). Plain HTML, CSS and a little vanilla JS, with no build step. Served by GitHub Pages from the root of `main`.

## Files

- `index.html`: the landing page (hero, features, screenshots, waitlist).
- `privacy.html`: the privacy policy. It mirrors the app's `docs/privacy-policy.md` in the TinyPip repo and adds a section for the website and waitlist.
- `css/style.css`: all styles. Colors and shapes follow the app's "meadow" theme.
- `js/main.js`: showreel play/pause, the Mailchimp waitlist form, and the footer year.
- `assets/`: self-hosted fonts (Fredoka, Nunito; OFL), images and the showreel loop. Every image is cut from the app's real art (the icon and the showreel); nothing is redrawn.
- `CNAME`: the custom domain, `heytinypip.com`.

## Preview locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## To finish

- **Screenshots:** in `index.html`, search for `SCREENSHOTS` and swap each placeholder for a `<picture>`.
- **Tagline:** search for `TAGLINE`.

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
