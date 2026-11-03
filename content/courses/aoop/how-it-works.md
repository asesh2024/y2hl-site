---
title: "How the course runs"
description: "The weekly rhythm, team roles, the 100-minute block and how your repository becomes your evidence."
---

Each week has four 100‑minute blocks that all work on the same codebase. Each block feeds the next.

| Order | Block | What happens |
| --- | --- | --- |
| 1 | **Practical** | Build a feature from starter code and meet the week's problem first‑hand. |
| 2 | **Skill A** | Analyse or measure what you built. |
| 3 | **Lecture** | Name the principle behind it and generalise it, using your own code as the examples. |
| 4 | **Skill B** | Apply the principle to design the next increment, which next week's practical builds. |

If you are studying on your own, follow the same order. Each week page lists the blocks in this sequence.

### Teams and roles

Work in teams of four with one Git repository per team. Rotate roles every week so everyone does each job:

- **Driver**: types the code.
- **Navigator**: reads the contract and the requirement aloud and checks the Driver against them.
- **Tester**: writes and runs the tests.
- **Scribe**: writes the deliverable note.

Solo learners can do all four jobs. Do them in the order above, and still write the note.

### Toolchain

JDK 17 or later (JDK 21 recommended for switch pattern matching), Eclipse or IntelliJ IDEA, Maven, JUnit 5 and Git. ArchUnit is optional in Week 11 and H2 is optional in Week 10; each week page gives a no‑library fallback.

### Inside a 100‑minute block

| Minutes | Practical and Skill blocks | Lecture block |
| --- | --- | --- |
| 0–10 | `git pull` and `mvn test`; the build must be green before minute 10. | A "do‑now" question to answer straight away. |
| 10–20 | Primer: the requirement of the day and the idea you need. | Hook: a Smart Parking failure story, then Concept A. |
| 20–40 | Step 1: analyse or inspect. | Concept A applied to Smart Parking code. |
| 40–60 | Step 2: design or specify. | Bridge, then Concept B. |
| 60–90 | Step 3: build, test and produce the artefact. | Concept B applied. |
| 90–100 | Recap and submission. | Recap. |

Every recap has three parts: three questions answered on paper without notes, one team explaining its deliverable in two sentences, and a preview of the next block.

### Your repository is your evidence

Commit every deliverable under `docs/weekNN/` or `src/`. Tag each practical with its commit label (for example `W1-P1`). By Week 12 the repository is your whole evidence pack for the final design review. See the full list on [Weekly deliverables](deliverables.html).

```text
smart-parking/
  pom.xml
  docs/week01 … docs/week12        (skill deliverables, UML, ADRs)
  src/main/java/…/parking/
    domain/  allocation/  pricing/  booking/  payment/
    resilience/  notification/  infrastructure/  app/
  src/test/java/…                  contract, chaos, concurrency and architecture tests
```
