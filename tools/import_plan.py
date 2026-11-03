"""One-time import: turn the faculty delivery plan into student-facing Markdown pages.

Usage:
    python tools/import_plan.py PLAN.md LAB.txt LECTURE.txt SKILL.txt

PLAN.md is the Markdown export of "AOOP PBL - Smart Parking System: 12-Week Session
Delivery Plan"; the three .txt files are text dumps of the week-wise Lab, Lecture and
Skill plan .docx files. Output goes to content/courses/aoop/. After the import, the
Markdown files in content/ are the source of truth: edit those, not this script.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "content" / "courses" / "aoop"

FILL = '<span class="fill"></span>'

# Worksheet tables: header signature -> columns students fill in (blanked on the site).
WORKSHEETS = {
    ("#", "Rule", "Answer"): {"Answer"},
    ("#", "Code", "Doorway", "Attack line", "Fix"): {"Attack line", "Fix"},
    ("#", "Subtype", "Caller expected", "What breaks", "Signal"): {"What breaks", "Signal"},
    ("#", "Broken code (inside an allocator)", "What the JDK reports (abbreviated)", "Who is at fault"):
        {"What the JDK reports (abbreviated)", "Who is at fault"},
    ("#", "Event", "Species", "Response"): {"Species", "Response"},
    ("#", "Program", "Visible?"): {"Visible?"},
    ("State \\\\ Event", "checkIn", "checkOut", "cancel", "expire"): {"checkIn", "checkOut", "cancel", "expire"},
}

TEXT_RULES = [
    (r"Practical block \((?:Mon|Tue|Wed|Thu|Fri|Sat)\) — Handout ", "Practical — "),
    (r"Lecture block \((?:Mon|Tue|Wed|Thu|Fri|Sat)\) — Handout ", "Lecture — "),
    (r"Skill block ([AB]) \((?:Mon|Tue|Wed|Thu|Fri|Sat)\) — Handout ", r"Skill \1 — "),
    (r"\*\*Acceptance checks \(faculty ticks\):\*\*", "**Acceptance checks:**"),
    (r"\*\*Content to teach\*\*", "**Key ideas**"),
    (r"; record each against its own session number in ERP\.", "."),
    (r"\s*\(\d+% weight in the handout\)", ""),
    (r"^Answer:.*$", ""),
    (r"^Run each snippet once before class.*$", ""),
    (r"\| Faculty does \| Students do \|", "| In class | Your task |"),
    (r"\| Attendance \+ (?:do‑now|do-now) \|", "| Do‑now |"),
    (r"\| Attendance \+ ([^|]+?) \|", lambda m: "| " + m.group(1)[0].upper() + m.group(1)[1:] + " |"),
    (r"\| Mark attendance\.[ \t]*", "| "),
    (r"Answer: .*?\.(?=\s+[A-Z`]|\s*\|)", ""),
    (r"The only correct answer is [^|]*?\.(?=\s*\|)", "Discuss in pairs."),
    (r"Answer \([^)]*\)\.?", "Answer."),
    (r"Reveal the answer key; discuss", "Discuss"),
    (r"Faculty circulates and scores", "The instructor scores"),
    (r"add the faculty as collaborator", "add your instructor as a collaborator"),
    (r"\bfaculty\b", "instructor"),
    (r"\bFaculty\b", "Instructor"),
    (r"\\~", "~"),
]


def clean_text(text):
    for pattern, repl in TEXT_RULES:
        text = re.sub(pattern, repl, text, flags=re.M)
    # Empty "In class" cells left behind by the rules above.
    text = re.sub(r"\|[ \t]+\|", "| — |", text)
    return re.sub(r"\n{3,}", "\n\n", text)


def split_row(line):
    cells = re.split(r"(?<!\\)\|", line.strip())[1:-1]
    return [c.strip() for c in cells]


def blank_worksheets(text):
    lines = text.split("\n")
    out, i = [], 0
    while i < len(lines):
        line = lines[i]
        if line.startswith("|") and i + 1 < len(lines) and lines[i + 1].startswith("| ---"):
            header = tuple(split_row(line))
            cols = WORKSHEETS.get(header)
            if cols:
                idx = {n for n, h in enumerate(header) if h in cols}
                out.append('<p class="worksheet-note">Worksheet: fill in the blank cells yourself, then compare with your team.</p>')
                out.append("")
                out += [line, lines[i + 1]]
                i += 2
                while i < len(lines) and lines[i].startswith("|"):
                    cells = split_row(lines[i])
                    cells = [FILL if n in idx else c for n, c in enumerate(cells)]
                    out.append("| " + " | ".join(cells) + " |")
                    i += 1
                continue
        out.append(line)
        i += 1
    return "\n".join(out)


def sections(md, level):
    """Split Markdown into (heading, body) pairs at the given heading level."""
    marker = "#" * level + " "
    parts, head, buf = [], None, []
    for line in md.split("\n"):
        if line.startswith(marker):
            parts.append((head, "\n".join(buf).strip()))
            head, buf = line[len(marker):].strip(), []
        else:
            buf.append(line)
    parts.append((head, "\n".join(buf).strip()))
    return parts


def front_matter(meta):
    return "---\n" + "\n".join(f"{k}: {json.dumps(v, ensure_ascii=False)}" for k, v in meta.items()) + "\n---\n\n"


def parse_labs(text):
    labs = {}
    for block in re.split(r"\n(?=Week \d+ — )", text)[1:]:
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        m = re.match(r"Lab (\d+): (.+)", lines[1])
        num = int(m.group(1))
        aim = next(l[len("Aim: "):] for l in lines if l.startswith("Aim: "))
        start = lines.index("Lab work / student tasks:") + 1
        end = next(n for n, l in enumerate(lines) if l.startswith("Submission:"))
        labs[num] = {"title": m.group(2), "aim": aim, "tasks": lines[start:end]}
    return labs


def parse_lectures(text):
    rows = re.findall(r"Lecture [12] \(1 hour\) \| (.*?) \| ", text, flags=re.S)
    topics = []
    for cell in rows:
        topics += [t.strip("• ").strip() for t in cell.split("\n") if t.strip()]
    # Two rows per week, in week order.
    per_week, i = [], 0
    for r in range(0, len(rows), 2):
        n = len([t for t in rows[r].split("\n") if t.strip()]) + len([t for t in rows[r + 1].split("\n") if t.strip()])
        per_week.append(topics[i:i + n])
        i += n
    return per_week


def parse_skills(text):
    acts = re.findall(r"Skill activity: (.+)", text)
    acts[11] = "Capstone architecture walkthrough using the Waypoint model, UML, architecture decisions and a final review checklist."
    return acts


def main(plan_path, lab_path, lecture_path, skill_path):
    md = Path(plan_path).read_text(encoding="utf-8")
    labs = parse_labs(Path(lab_path).read_text(encoding="utf-8"))
    lectures = parse_lectures(Path(lecture_path).read_text(encoding="utf-8"))
    skills = parse_skills(Path(skill_path).read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)

    top = dict(sections(md, 2)[1:])

    # Project page: the shared problem, requirements, domain model and roadmap.
    project = top["Smart Parking System: the one project for all 12 weeks"]
    project = project.split("**Mismatch to settle before Week 1.**")[0].strip()
    project = project.replace("### Problem statement (give this to students in Week 1)", "### Problem statement")
    project = project.replace('the platform the handout names ("Waypoint Smart Parking core model")', "the urban mobility and payments platform used across the course")
    project = (project.replace("| Lecture (handout sessions) |", "| Lecture |")
                      .replace("| Practical (handout P#) |", "| Practical |")
                      .replace("| Skill A / Skill B (handout S#) |", "| Skill A / Skill B |"))
    (OUT / "project.md").write_text(front_matter({
        "title": "The Smart Parking System project",
        "description": "Problem statement, functional and non-functional requirements, domain model and the 12-week build roadmap.",
    }) + clean_text(project) + "\n", encoding="utf-8")

    # Deliverables page: the weekly tracker without the institution-specific mapping.
    tracker = top["Deliverables tracker and assessment mapping"].split("### Mapping")[0].strip()
    tracker = re.sub(r" \((?:Mon|Tue|Wed|Thu|Fri|Sat)\)", "", tracker)
    tracker = tracker.replace("| Practical | Lecture | Skill A | Skill B |", "| Practical | Skill A | Lecture | Skill B |")
    rows = []
    for line in tracker.split("\n"):
        c = split_row(line) if line.startswith("|") and not line.startswith("| ---") and not line.startswith("| Week") else None
        rows.append("| " + " | ".join([c[0], c[1], c[3], c[2], c[4]]) + " |" if c else line)
    (OUT / "deliverables.md").write_text(front_matter({
        "title": "Weekly deliverables",
        "description": "Every week produces four deliverables, all committed to your team repository.",
    }) + clean_text("\n".join(rows)) + "\n", encoding="utf-8")

    # Week pages.
    for head, body in top.items():
        m = re.match(r"Week (\d+) — (.+) \((CO\d)\)", head)
        if not m:
            continue
        n = int(m.group(1))
        summary, _, rest = body.partition("\n\n")
        lab_nums = sorted({int(x) for x in re.findall(r"\bLab (\d+)\b", body)})
        meta = {
            "title": m.group(2),
            "week": n,
            "co": m.group(3),
            "description": clean_text(re.sub(r"`", "", summary.split(" Requirements addressed")[0])).strip(),
            "requirements": (re.search(r"Requirements addressed: ([^.]+)\.", summary) or [None, ""])[1],
            "lecture_topics": lectures[n - 1],
            "skill_focus": skills[n - 1],
            "labs": [{"number": k, **labs[k]} for k in lab_nums if k in labs],
        }
        text = blank_worksheets(clean_text(rest))
        (OUT / f"week-{n:02d}.md").write_text(front_matter(meta) + text + "\n", encoding="utf-8")
        print(f"week {n:2d}: labs {lab_nums}, {len(text):6d} chars")


if __name__ == "__main__":
    main(*sys.argv[1:5])
