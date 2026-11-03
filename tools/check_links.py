"""Report broken internal links and #anchors in the built site/ folder.

    python build.py && python tools/check_links.py
"""
import os
import re
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent / "site"
BASE_PATH = os.environ.get("BASE_PATH", "").rstrip("/")


def ids(path):
    return set(re.findall(r'id="([^"]+)"', path.read_text(encoding="utf-8")))


def main():
    broken = set()
    for page in SITE.rglob("*.html"):
        for href in re.findall(r'href="([^"]+)"', page.read_text(encoding="utf-8")):
            if href.startswith(("http:", "https:", "mailto:")):
                continue
            path, _, frag = href.partition("#")
            path = path.split("?")[0]                      # ignore ?v=… cache-busting queries
            if BASE_PATH and path.startswith(BASE_PATH + "/"):
                path = path[len(BASE_PATH):]
            target = page if not path else (SITE / path.lstrip("/") if path.startswith("/") else page.parent / path)
            if target.is_dir():
                target = target / "index.html"
            if not target.exists() or (frag and target.suffix == ".html" and frag not in ids(target)):
                broken.add((str(page.relative_to(SITE)), href))
    for page, href in sorted(broken):
        print(f"{page}: {href}")
    print(f"{len(broken)} broken link(s)")
    sys.exit(1 if broken else 0)


if __name__ == "__main__":
    main()
