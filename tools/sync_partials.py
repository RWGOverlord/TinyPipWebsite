#!/usr/bin/env python3
"""Copy the shared header and footer into every page.

The site has no build step: each page is plain HTML that GitHub Pages serves
as is. Shared pieces live in partials/ and are pasted into each page between
marker comments:

    <!-- partial:header -->  ...  <!-- /partial:header -->

Run this after editing anything in partials/ (or adding a page):

    python3 tools/sync_partials.py

Links in a partial that point at the page being written get
aria-current="page". Pass --check to fail (exit 1) instead of writing when a
page is out of date.
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PARTIALS = ROOT / "partials"
SKIP_DIRS = {"partials", "tools", "assets", ".git", ".preview", "node_modules"}

BLOCK = re.compile(
    r"(?P<indent>[ \t]*)<!-- partial:(?P<name>[\w-]+) -->.*?<!-- /partial:(?P=name) -->",
    re.S,
)


def url_path(page: pathlib.Path) -> str:
    rel = page.relative_to(ROOT).as_posix()
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[: -len("index.html")]
    return "/" + rel


def render(name: str, here: str, indent: str) -> str:
    source = PARTIALS / f"{name}.html"
    if not source.exists():
        sys.exit(f"Missing partial: {source}")
    html = source.read_text().strip("\n")
    # Mark links to this page. Only exact paths: "/features/", not "/features/#focus".
    html = html.replace(f'href="{here}"', f'href="{here}" aria-current="page"')
    lines = [f"<!-- partial:{name} -->", *html.split("\n"), f"<!-- /partial:{name} -->"]
    return "\n".join((indent + line) if line else line for line in lines)


def main() -> int:
    check = "--check" in sys.argv
    stale = []
    for page in sorted(ROOT.rglob("*.html")):
        if SKIP_DIRS & set(page.relative_to(ROOT).parts):
            continue
        text = page.read_text()
        here = url_path(page)
        new = BLOCK.sub(lambda m: render(m["name"], here, m["indent"]), text)
        if new != text:
            stale.append(page.relative_to(ROOT).as_posix())
            if not check:
                page.write_text(new)
    if stale:
        print(("Out of date: " if check else "Updated: ") + ", ".join(stale))
    return 1 if (check and stale) else 0


if __name__ == "__main__":
    sys.exit(main())
