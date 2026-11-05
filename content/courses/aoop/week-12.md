---
title: "Ship it and defend it: the HLD dossier"
week: 12
co: "CO6"
description: "By Thursday each team has a complete architecture dossier for the Smart Parking System (six artefacts, twelve ADRs, an evidence pack) and has rehearsed defending it under questioning. This week rehearses the term‑end Project Defence & Demonstration."
requirements: ""
lecture_topics: ["Architecture tests, HLD dossier, and architecture decision records.", "UML, CI/security/cost practices, and capstone review."]
skill_focus: "Capstone architecture walkthrough using the Waypoint model, UML, architecture decisions and a final review checklist."
labs: []
---

**Thread:** Monday's practical assembles the dossier from eleven weeks of `docs/` folders and finds the gaps → Tuesday's skill block writes the twelve ADRs → Wednesday's lecture reviews the ADR drafts and runs one live mock review → Thursday's skill block runs the mock defences.

### The dossier: six artefacts (built from earlier weeks)

| # | Artefact | Comes from |
| --- | --- | --- |
| 1 | Context map and module diagram, with the architecture rules | Weeks 5, 11 |
| 2 | UML set: class diagram (domain), sequence diagrams (allocate, pay with retry, saga), state diagram (Booking) | Weeks 1–10 (one diagram per week) |
| 3 | Capacity plan for 50× with arithmetic | Week 11 |
| 4 | ADR log: twelve ADRs, each naming a rejected alternative and a cost | Tuesday's skill block (one per week, list below) |
| 5 | Evidence pack: contract, chaos, race, anomaly and architecture test reports | Weeks 4, 8, 9, 10, 11 |
| 6 | Operations and safety sheet: SLOs, four key metrics, degraded modes, security and data protection | Weeks 8, 11, Wednesday |

Plus a 10‑minute recorded walkthrough, submitted before the term‑end defence.

### Practical — P12: architecture dossier and defence

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Build check | — | `mvn verify` green, including architecture tests. |
| 10–20 | Primer: dossier checklist | Hand out the six‑artefact checklist above, with "evidence link" as a required column. | Copy into `docs/week12/dossier-checklist.md`. |
| 20–40 | Step 1: UML and component mapping | Every box in the module diagram must map to a package, and every class in the class diagram must exist in code. | Tick or fix each diagram against the code. |
| 40–60 | Step 2: review architecture decisions | List the decision made in each week (ADR list below); mark which ones lack a rejected alternative or a cost. | Draft ADR titles and gaps. |
| 60–90 | Step 3: present and defend (pairs of teams) | Team A presents for 7 minutes; Team B asks 3 questions from the question bank; swap. The instructor scores with the rubric. | Present, question, note weak answers. |
| 90–100 | Recap + feedback | Name the three most common gaps seen today. | List improvements; commit `W12-P12`. |

**Deliverable (P):** dossier checklist with evidence links, ADR draft list, peer‑review notes, commit `W12-P12`.

### Skill A — S23: ADRs with alternatives, trade‑offs and rejected options

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Name one alternative you rejected this term." | Answer. |
| 10–20 | Primer | An ADR without a rejected option and a cost is a claim, not a decision. | — |
| 20–40 | Step 1: ADRs 1–4 | List below. | Write them. |
| 40–60 | Step 2: ADRs 5–8 | Check each has a cost in numbers where possible. | Write them. |
| 60–90 | Step 3: ADRs 9–12 | Each ADR links to its evidence. | Write them; peer‑check two. |
| 90–100 | Recap + present | One team defends its weakest ADR. | Present. |

| ADR | Decision | Typical rejected alternative |
| --- | --- | --- |
| 1 | Invariants validated in constructors and methods | A separate validation service |
| 2 | Money as `long` paise | `double` |
| 3 | Allocator returns `Optional` | −1 sentinel or exception |
| 4 | One shared contract‑test suite with saboteurs | A test class per implementation |
| 5 | Ports with a composition root | Service locator or global singletons |
| 6 | Booking status as enum + total transition table | Boolean flags |
| 7 | `Result` for expected failures; client idempotency keys | Exceptions for everything; server‑generated keys |
| 8 | Retry at one layer with budget and breaker; outbox for notifications | Retry at every layer; send SMS inline |
| 9 | Chosen locking regime (from Week 9 measurements) | The other measured variant |
| 10 | Materialised conflict table for one active booking | SERIALIZABLE isolation everywhere |
| 11 | Modular monolith with architecture tests | Microservices from day one |
| 12 | Availability cache with 5 s TTL; shard by facility | No cache; shard by vehicle |

**Deliverable (S23):** `docs/adr/ADR-01.md` to `ADR-12.md`, each with the 8 template parts and an evidence link.

### Lecture — L23 + L24: architecture tests, HLD dossier, ADRs; UML, CI, security, cost, mock review

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Which decision in your project would you most hate to defend?" | Write it. |
| 10–15 | Hook | That decision needs the best ADR. | — |
| 15–30 | Concept A: ADRs and evidence | ADR template: Title; Status; Context; Decision; Alternatives considered (≥ 2); Rejected option and why; Consequences and cost; Evidence (link to test or document). Architecture tests as living documentation. An evidence pack proves claims ("no double charge" → chaos report). | Note the template. |
| 30–50 | Apply A | Review two teams' Tuesday ADR drafts against the template, then rewrite ADR‑2 (Money as `long` paise) with the class: alternatives `double` and `BigDecimal`; rejected `double` because of binary rounding; cost: manual rounding rules and conversion at the ACL. | Contribute. |
| 50–55 | Bridge | "A reviewer asks: is driver data safe? What do you show?" | — |
| 55–70 | Concept B: engineering practice | CI as a design instrument: every push runs `mvn verify` (unit, contract, architecture tests). Security by design: validate at the ACL; never store card data (gateway tokens only); secrets outside the repo; least privilege for admin. Data protection: registration numbers and phone numbers are personal data; mask them in logs, limit retention, and check obligations under India's Digital Personal Data Protection Act, 2023. Cost as an axis (SMS per message, cache vs database). SLOs and error budgets; blameless postmortems. When a model writes the first draft of code: it must pass the contract and architecture tests, and the team must be able to explain every line. | Notes. |
| 70–90 | Apply B: live mock review | One volunteer team presents for 8 minutes; instructor asks 4 questions from the bank; class scores with the rubric. | Observe and score. |
| 90–100 | Recap | Q1: The 8 parts of an ADR. Q2: Two personal‑data items in our system. Q3: What does CI prove on every push? | Answer. |

**Deliverable (L):** ADR‑2 written together, and each student's rubric sheet from the live review.

**Question bank for reviews:** What happens if the gateway times out after charging? Show the test that proves no double booking. Why a modular monolith and not microservices? Add a new vehicle type: how many files change? What breaks first at 50×? Which field in `BookingService` is guarded, and by what? What would you change if bookings had to work across two cities' databases?

### Try it: the whole slice, and a decision record check

A tiny end-to-end slice wired from a composition root, plus the rule this week's dossier depends on: a decision record is incomplete until it names a rejected alternative and a cost.

```java
import java.time.*;
import java.util.*;

public class Main {
    record Money(long paise) {
        @Override public String toString() { return String.format("₹%d.%02d", paise / 100, paise % 100); }
    }
    interface FeePolicy { Money feeFor(Duration stay); }

    static final class ParkingDesk {
        private final Map<String, Instant> entered = new HashMap<>();
        private final FeePolicy fees;
        private final Clock clock;

        ParkingDesk(FeePolicy fees, Clock clock) { this.fees = fees; this.clock = clock; }

        void enter(String vehicle, Instant at) { entered.put(vehicle, at); }
        Money exit(String vehicle) {
            Instant start = entered.remove(vehicle);
            if (start == null) throw new IllegalStateException(vehicle + " is not parked");
            return fees.feeFor(Duration.between(start, clock.instant()));
        }
    }

    record Adr(String title, String rejected, String cost) {
        boolean complete() { return !rejected.isBlank() && !cost.isBlank(); }
    }

    public static void main(String[] args) {
        Instant now = Instant.parse("2026-11-05T13:00:00Z");
        FeePolicy hourly = stay -> new Money((stay.toMinutes() + 59) / 60 * 4000);
        ParkingDesk desk = new ParkingDesk(hourly, Clock.fixed(now, ZoneOffset.UTC));

        desk.enter("AP07AB1234", now.minus(Duration.ofMinutes(130)));
        System.out.println(desk.exit("AP07AB1234"));                 // ₹120.00
        try {
            desk.exit("AP07AB1234");
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage());                      // AP07AB1234 is not parked
        }

        Adr good = new Adr("Modular monolith", "Microservices", "One deployable, so one release train");
        Adr weak = new Adr("Use Redis", "", "");
        System.out.println(good.complete());                         // true
        System.out.println(weak.complete());                         // false
    }
}
```

**Now change it:** Write an `Adr` for one real decision in your own project. If you can't fill in `rejected` and `cost`, what does that tell you?

### Skill B — S24: HLD/UML evidence pack and mock defence

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Set‑up | Publish the defence order; teams load their dossier. | Laptop ready, repo open at the tagged commit. |
| 10–20 | Primer | Rules: 4 minutes presenting, 2 minutes questions, strict timing. Rubric shown. | — |
| 20–90 | Mock defences | Run 6‑minute slots: about 11 teams fit in 70 minutes. With more teams, run two panels in parallel (instructor + teaching assistant) or move the rest into the next available slot. Ask at least one LLD question (code) and one HLD question (architecture) per team. | Present and answer; waiting teams score with the rubric. |
| 90–100 | Recap + feedback | Read out the three strongest answers and the three most common gaps. | Record improvements in `docs/week12/defence-feedback.md`. |

**Mock defence rubric (10 points, rehearsal only):** domain model and invariants (2); contracts and tests (2); failure handling and concurrency evidence (2); architecture and capacity reasoning (2); answers under questioning (2).

**Deliverable (S24):** final evidence pack tagged `v1.0` in the repo, defence feedback file, and the 10‑minute recorded walkthrough (due before the term‑end defence).
