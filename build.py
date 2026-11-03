"""Build the Y2HL website from content/ into site/.

    pip install -r requirements.txt
    python build.py            # build once into site/
    python build.py --serve    # build, then preview at http://localhost:8000

Everything you edit lives in site.json, content/ and static/. Never edit site/: it is
deleted and regenerated on every build.
"""
import json
import os
import re
import shutil
import sys
from datetime import date
from pathlib import Path

import markdown
from jinja2 import Environment, FileSystemLoader, select_autoescape

ROOT = Path(__file__).resolve().parent
CONTENT = ROOT / "content"
OUT = ROOT / "site"

SITE = json.loads((ROOT / "site.json").read_text(encoding="utf-8"))
# Set BASE_PATH (e.g. "/y2hl-site") when the site is served from a sub-folder, such as a
# GitHub Pages preview before the custom domain is connected. Empty for www.y2hl.in.
BASE_PATH = os.environ.get("BASE_PATH", "").rstrip("/")
env = Environment(loader=FileSystemLoader(ROOT / "templates"), autoescape=select_autoescape(["html"]))
env.globals.update(site=SITE, year=date.today().year)

pages_built = []


def slugify(value, separator="-"):
    value = re.sub(r"[‐-―]", "-", value.lower())
    value = re.sub(r"[^\w\s-]", "", value)
    return re.sub(r"[\s_-]+", separator, value).strip(separator)


def read_page(path):
    """Return (meta, html, toc) for a Markdown file with JSON-valued front matter."""
    text = path.read_text(encoding="utf-8")
    meta = {}
    if text.startswith("---\n"):
        head, _, text = text[4:].partition("\n---\n")
        for line in head.splitlines():
            key, _, value = line.partition(":")
            meta[key.strip()] = json.loads(value.strip())
    md = markdown.Markdown(
        extensions=["tables", "fenced_code", "toc", "sane_lists", "attr_list"],
        extension_configs={"toc": {"slugify": slugify, "toc_depth": "3"}},
    )
    html = md.convert(text)
    html = re.sub(r"<table>", '<div class="table-wrap"><table>', html).replace("</table>", "</table></div>")
    html = re.sub(r'<code class="language-text">', '<code class="language-plaintext">', html)
    toc = [c for t in md.toc_tokens for c in ([t] if t["level"] == 3 else t["children"]) if c["level"] == 3]
    return meta, html, [{"id": t["id"], "name": t["name"]} for t in toc]


def write(rel, template, **ctx):
    dest = OUT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    url = "/" + rel.replace("index.html", "")
    html = env.get_template(template).render(url=url, **ctx)
    if BASE_PATH:
        html = re.sub(r'(href|src)="/(?!/)', rf'\1="{BASE_PATH}/', html)
    dest.write_text(html, encoding="utf-8")
    if not rel.startswith("404"):
        pages_built.append(url)


def load_quiz(path):
    """Load and check a quiz bank. Stops the build on any mistake, so a broken answer key never ships."""
    questions = json.loads(path.read_text(encoding="utf-8"))
    errors = []
    for i, q in enumerate(questions, 1):
        where = f"{path.name} question {i}"
        kind, options, answer = q.get("type", "single"), q.get("options", []), q.get("answer")
        if kind == "tf":
            options = q["options"] = ["True", "False"]
        if kind not in ("single", "multi", "tf"):
            errors.append(f"{where}: unknown type {kind!r}")
        if not q.get("q") or not q.get("explain"):
            errors.append(f"{where}: needs both 'q' and 'explain'")
        if len(options) < 2 or len(set(options)) != len(options):
            errors.append(f"{where}: needs at least 2 options, all different")
        answers = answer if isinstance(answer, list) else [answer]
        if kind != "multi" and isinstance(answer, list):
            errors.append(f"{where}: only 'multi' questions may have a list of answers")
        if not answers or any(not isinstance(a, int) or not 0 <= a < len(options) for a in answers):
            errors.append(f"{where}: answer {answer!r} is not a valid option index")
    if errors:
        sys.exit("Quiz errors:\n  " + "\n  ".join(errors))
    return questions


def quiz_json(questions):
    """Quiz data for a <script type="application/json"> block."""
    return json.dumps(questions, ensure_ascii=False).replace("</", "<\\/")


def load_course(folder):
    course = json.loads((folder / "course.json").read_text(encoding="utf-8"))
    course["base"] = f"/courses/{folder.name}/"
    course["slug"] = folder.name
    # A course is split into numbered units: "Week" for AOOP, "Topic" for TOC.
    prefix = course.setdefault("unit_prefix", "week")
    course.setdefault("unit", "Week")
    course.setdefault("unit_plural", "weeks")
    course["pages"] = []
    for slug in course["guide_pages"]:
        meta, html, toc = read_page(folder / f"{slug}.md")
        course["pages"].append({"slug": slug, "meta": meta, "html": html, "toc": toc})
    course["weeks"] = []
    for path in sorted(folder.glob(f"{prefix}-*.md")):
        meta, html, toc = read_page(path)
        unit = {"slug": path.stem, "num": meta[prefix], "meta": meta, "html": html, "toc": toc}
        quiz = folder / "quizzes" / f"{path.stem}.json"
        if quiz.exists():
            unit["quiz"] = load_quiz(quiz)
        course["weeks"].append(unit)
    course["has_quizzes"] = any("quiz" in w for w in course["weeks"])
    # CO tests draw from the quizzes of every published unit under that CO.
    course["tests"] = []
    for co, label in course["outcomes"].items():
        pool = [dict(q, topic=w["slug"]) for w in course["weeks"] if w["meta"]["co"] == co for q in w.get("quiz", [])]
        if pool and course.get("co_test_size"):
            course["tests"].append({"slug": f"{co.lower()}-test", "co": co, "label": label, "pool": pool,
                                    "size": min(course["co_test_size"], len(pool))})
    return course


def build():
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(ROOT / "static", OUT / "static")
    # Files in public/ are copied unchanged to the site root (e.g. Google verification files).
    shutil.copytree(ROOT / "public", OUT, dirs_exist_ok=True)

    courses = [load_course(p) for p in sorted((CONTENT / "courses").iterdir()) if (p / "course.json").exists()]

    write("index.html", "home.html", courses=courses, page={"title": SITE["name"], "description": SITE["description"]})

    about_meta, about_html, _ = read_page(CONTENT / "about.md")
    write("about/index.html", "page.html", page=about_meta, body=about_html, section="about")

    research_meta, research_html, _ = read_page(CONTENT / "research.md")
    write("research/index.html", "page.html", page=research_meta, body=research_html, section="research")

    write("courses/index.html", "courses.html", courses=courses,
          page={"title": "Courses", "description": "Free, open course materials for students at any university."})

    for course in courses:
        root = course["base"].strip("/")
        overview = next(p for p in course["pages"] if p["slug"] == "overview")
        write(f"{root}/index.html", "course.html", course=course, page={
            "title": course["title"], "description": course["summary"]}, body=overview["html"], current="overview")
        for p in course["pages"]:
            if p["slug"] == "overview":
                continue
            write(f"{root}/{p['slug']}.html", "course_page.html", course=course, page=p["meta"],
                  body=p["html"], toc=p["toc"], current=p["slug"])
        weeks = course["weeks"]
        for i, w in enumerate(weeks):
            write(f"{root}/{w['slug']}.html", course.get("unit_template", "week.html"), course=course, week=w, page={
                "title": f"{course['unit']} {w['num']}: {w['meta']['title']}",
                "description": w["meta"]["description"]},
                prev=weeks[i - 1] if i else None, next=weeks[i + 1] if i + 1 < len(weeks) else None,
                current=w["slug"], quiz=quiz_json(w["quiz"]) if "quiz" in w else None)
        for t in course["tests"]:
            write(f"{root}/{t['slug']}.html", "quiz_test.html", course=course, test=t, quiz=quiz_json(t["pool"]),
                  current=t["slug"], page={"title": f"{t['co']} test: {t['label']}",
                                           "description": f"A {t['size']}-question test on {t['co']}, drawn at random from its topic quizzes."})
        if course["has_quizzes"]:
            marks = {"topics": [{"slug": w["slug"], "num": w["num"], "title": w["meta"]["title"], "co": w["meta"]["co"],
                                 "total": len(w["quiz"])} for w in weeks if "quiz" in w],
                     "tests": [{"slug": t["slug"], "co": t["co"], "total": t["size"]} for t in course["tests"]],
                     "outcomes": course["outcomes"], "course": course["title"]}
            write(f"{root}/marks.html", "marks.html", course=course, marks=quiz_json(marks), current="marks",
                  page={"title": f"My marks: {course['short']}",
                        "description": "Your quiz and CO test marks for this course, saved in this browser."})

    write("404.html", "404.html", page={"title": "Page not found", "description": ""})

    base = SITE["url"].rstrip("/")
    urls = "\n".join(f"  <url><loc>{base}{u}</loc></url>" for u in pages_built)
    (OUT / "sitemap.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n',
        encoding="utf-8")
    (OUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {base}/sitemap.xml\n", encoding="utf-8")
    (OUT / "CNAME").write_text(SITE["domain"] + "\n", encoding="utf-8")
    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    print(f"Built {len(pages_built)} pages into {OUT}")


def serve():
    import functools
    import http.server

    port = int(os.environ.get("PORT", 8000))
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(OUT))
    print(f"Preview: http://localhost:{port}/  (Ctrl+C to stop)")
    http.server.ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()


if __name__ == "__main__":
    build()
    if "--serve" in sys.argv:
        serve()
