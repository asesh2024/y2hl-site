# Y2HL Orbit website (www.y2hl.in)

A static website: plain HTML pages generated from Markdown. There is no database, no plugins and no admin login, so there is nothing for attackers to break into the way they broke into the old WordPress site.

## Where things live

| Path | What it is | Edit it? |
| --- | --- | --- |
| `site.json` | Site name, tagline, your name, role, e‑mail and profile links | Yes |
| `content/about.md` | Your About page | Yes |
| `content/courses/aoop/course.json` | Course title, code, tagline, stats, CO names | Yes |
| `content/courses/aoop/*.md` | Overview, How the course runs, Project, Deliverables and Weeks 1–12 | Yes |
| `static/` | CSS, JavaScript, images (put your photo here) | When needed |
| `public/` | Files copied unchanged to the site root, such as Google's verification file | When needed |
| `templates/` | Page layouts | Rarely |
| `build.py` | Turns everything above into the `site/` folder | No |
| `site/` | The generated website. Deleted and rebuilt on every build | Never |
| `tools/import_plan.py` | One‑time import from the faculty delivery plan (already run) | No |

Week pages start with a small header between `---` lines (title, CO, lecture topics, lab programs). Everything below it is ordinary Markdown: `###` headings, tables, and code blocks fenced with three backticks.

Worksheet cells students should fill in are written as `<span class="fill"></span>`.

## Build and preview on your computer

Needs Python 3.10+ once:

```bash
pip install -r requirements.txt
```

Then build and preview:

```bash
python build.py --serve
```

Open http://localhost:8000. Press Ctrl+C to stop. To check for broken links after a build:

```bash
python tools/check_links.py
```

## Add a new course

1. Copy `content/courses/aoop/` to `content/courses/<short-name>/`.
2. Edit its `course.json` and the Markdown pages; name the week files `week-01.md`, `week-02.md` and so on.
3. Build. The course appears on the home page and on /courses/ automatically.

A course can use topics instead of weeks: set `"unit": "Topic"`, `"unit_prefix": "topic"` and `"unit_template": "topic.html"` in `course.json` (see `content/courses/toc/course.json`), and name the files `topic-01.md`, `topic-02.md` and so on.

## Quizzes and marks

A topic gets a self-marking quiz when `content/courses/<course>/quizzes/<topic-file-name>.json` exists, for example `quizzes/topic-03.json`. Each question looks like this:

```json
{
  "q": "Which strings match (0 + 1)*(00 + 11)(0 + 1)*?",
  "type": "multi",
  "options": ["<code>0110</code>", "<code>0101</code>", "<code>1001</code>"],
  "answer": [0, 2],
  "explain": "The expression means 'contains 00 or 11'."
}
```

- `type` is `single` (the default, one answer), `multi` (several answers, as a list), `tf` (true/false: leave out `options`, and use `answer: 0` for True or `1` for False), or `nat` (GATE numerical answer: leave out `options`, give a number as `answer`, and optionally a `tolerance` such as `0.01`).
- A second file, `quizzes/<topic-file-name>-gate.json`, adds a "GATE-style practice" block under the quiz. It uses the same format; its `explain` can hold a full worked solution in HTML (`<p>`, `<pre>`, `<table>`).
- `"order"` in `course.json` sets the order of courses on the home page and the Courses page.
- `answer` counts options from 0. The site shuffles the options, so their order in the file does not matter.
- An optional `dot` field draws a diagram (Graphviz DOT) above the options. In topic pages, a ```` ```dot ```` code block draws one too.
- The build stops with a clear message if an answer index is out of range, options repeat, or `explain` is missing.

With `"co_test_size": 20` in `course.json`, each course outcome also gets a test of 20 random questions drawn from its topic quizzes. The **My marks** page (`marks.html`) is created automatically. Marks are saved in each student's own browser only.

## Publish (GitHub Pages, free)

1. Create a GitHub repository (for example `y2hl-site`) and push this folder to its `main` branch.
2. On GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**. The workflow in `.github/workflows/deploy.yml` builds and publishes the site on every push.
3. In **Settings → Pages → Custom domain**, enter `www.y2hl.in`. Tick **Enforce HTTPS** once it is offered.
4. At your domain registrar, change the DNS records:
   - `www`: a **CNAME** record pointing to `<your-github-username>.github.io`
   - `@` (the bare y2hl.in): four **A** records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Delete the old A/CNAME records that point to the WordPress host.

DNS changes can take a few hours. Netlify or Cloudflare Pages also work: build command `pip install -r requirements.txt && python build.py`, publish directory `site`.

## Retire the hacked WordPress site

The old site at y2hl.in carries hidden casino links and spam pages for pharma drugs. Do these steps whether or not you publish this site straight away:

1. Download a backup of anything you still want from the WordPress host, then cancel or wipe that hosting.
2. Change the passwords for the hosting control panel, the domain registrar and any e‑mail account linked to them, and turn on two‑factor login where offered.
3. In [Google Search Console](https://search.google.com/search-console), verify y2hl.in, check **Security & Manual actions**, use **Removals** for the spam URLs, and submit `https://www.y2hl.in/sitemap.xml` once the new site is live.
