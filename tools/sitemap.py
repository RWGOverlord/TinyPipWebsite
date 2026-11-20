#!/usr/bin/env python3
"""Write sitemap.xml from the pages in the repo.

    python3 tools/sitemap.py

- A page is listed when it has a canonical URL and no "noindex".
- lastmod is the date of the last commit that changed the page, or today if
  it has changes that aren't committed yet. So a deploy alone never moves a
  date: run this before committing a page change, then commit both.
- The page's images (its <img> sources in /assets/img/) are listed as image
  entries, so the app screenshots can be found in image search.
"""

import datetime
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://heytinypip.com"
SKIP_DIRS = {"partials", "tools", "assets", ".git", ".preview", "node_modules", "docs"}


def git(*args: str) -> str:
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True).stdout.strip()


def lastmod(page: pathlib.Path) -> str:
    rel = page.relative_to(ROOT).as_posix()
    if git("status", "--porcelain", "--", rel):
        return datetime.date.today().isoformat()
    return git("log", "-1", "--format=%cs", "--", rel) or datetime.date.today().isoformat()


def main() -> None:
    entries = []
    for page in sorted(ROOT.rglob("*.html")):
        if SKIP_DIRS & set(page.relative_to(ROOT).parts):
            continue
        html = page.read_text()
        canonical = re.search(r'<link rel="canonical" href="([^"]+)"', html)
        if not canonical or re.search(r'<meta name="robots" content="[^"]*noindex', html):
            continue
        main_html = html.split("<main", 1)[-1]
        images = []
        for src in re.findall(r'<img[^>]+src="([^"]+)"', main_html):
            if "/assets/img/" not in "/" + src.lstrip("./"):
                continue
            url = SITE + "/" + src.lstrip("./").lstrip("/")
            if url not in images:
                images.append(url)
        entries.append((canonical.group(1), lastmod(page), images))

    # Home first, then by URL
    entries.sort(key=lambda e: (e[0] != SITE + "/", e[0]))
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ]
    for url, date, images in entries:
        lines += ["  <url>", f"    <loc>{url}</loc>", f"    <lastmod>{date}</lastmod>"]
        for image in images:
            lines += ["    <image:image>", f"      <image:loc>{image}</image:loc>", "    </image:image>"]
        lines.append("  </url>")
    lines.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(lines) + "\n")
    print(f"sitemap.xml: {len(entries)} pages")


if __name__ == "__main__":
    main()
