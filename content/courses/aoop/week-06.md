---
title: "Patterns with a price tag: God‑class teardown and the booking state machine"
week: 6
co: "CO3"
description: "By Thursday pricing rules are pluggable strategies, a booking can only move through legal states, revenue and occupancy reports run on streams, and a design rule fails the build when broken."
requirements: "FR5, FR6, FR10, NFR3"
lecture_topics: ["SOLID principles.", "Inheritance versus composition.", "Useful design patterns, state machines, and common anti-patterns."]
skill_focus: "Identify a SOLID/design smell and justify a refactoring or pattern."
labs: [{"number": 8, "title": "Stream API: filter, map, and reduce", "aim": "Find cars and calculate the total parking fees using streams.", "tasks": ["Create a list of ParkingRecord objects.", "Use filter and map to display car records.", "Use reduce to calculate total fees; extend the program to filter fees greater than Rs. 75 and calculate car-only fees."]}, {"number": 9, "title": "Functional Interfaces and Lambda Expressions", "aim": "Calculate fees using different pricing rules.", "tasks": ["Define the FeePolicy functional interface.", "Implement normal, weekend-discount, and electric-vehicle fee policies using lambdas.", "Add a student discount policy that charges 70% of the normal fee."]}]
---

**Thread:** Monday's practical tears down a God class and introduces `FeePolicy` strategies → Tuesday's skill block redoes the teardown safely under characterisation tests → Wednesday's lecture names the behavioural patterns and the anti‑patterns teams just removed, and turns the Week 1 transition table into code → Thursday's skill block writes reports with lambdas and streams and enforces a design rule with an annotation.

### Practical — P6: God‑class teardown and a behavioural pattern

Folded in from the lab manual: Lab 9 (`FeePolicy` functional interface; normal, weekend‑discount and EV policies as lambdas; student discount at 70% of normal).

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Build check | — | Build green. |
| 10–20 | Primer | Starter `ParkingManager` (~250 lines): allocation, an if/else fee ladder on type/weekend/student flags, booking status as 4 booleans, SMS and reporting in one class. "Who asks for changes to this class?" | Name the actors. |
| 20–40 | Step 1: responsibilities | Mark each method with the actor who would request a change to it. | Colour‑code methods by actor; list candidate classes. |
| 40–60 | Step 2: design smaller classes | Sketch the target: `SpotRegistry`, `PricingService` + `FeePolicy`, `Booking` with `BookingStatus`, `Notifier`, `ReportService`. | Draw the target class diagram. |
| 60–90 | Step 3: refactor + Strategy | Rates and rules below. Each policy is a lambda; the composition root picks the policy. | Extract classes; implement 4 policies; ≥ 6 fee tests (2 h 10 min car on Saturday, EV, student, bus). |
| 90–100 | Recap + compare | Compare before/after: lines per class, LCOM1, files touched to add a "festival 50% off" rule. | Commit `W6-P6`. |

Fee rules for the practical: hourly rate BIKE ₹10, CAR ₹40, SUV ₹50, BUS ₹100, EV\_CAR ₹30; duration rounded up to whole hours; weekend = 20% off; student = 70% of normal. Add `Money.percent(int pct)` with half‑up rounding: `(paise × pct + 50) / 100`.

```java
@FunctionalInterface
public interface FeePolicy { Money feeFor(ParkingSession s); }   // record ParkingSession(VehicleType type, LocalDateTime entry, LocalDateTime exit)

FeePolicy normal  = s -> Rates.hourly(s.type()).times(Durations.hoursRoundedUp(s.entry(), s.exit()));
FeePolicy weekend = s -> Durations.isWeekend(s.entry()) ? normal.feeFor(s).percent(80) : normal.feeFor(s);
FeePolicy student = s -> normal.feeFor(s).percent(70);
```

**Acceptance checks:** no class over ~120 lines; no boolean status flags; adding the festival rule touches at most 2 files (new policy + composition root); fee tests green.

**Deliverable (P):** commit `W6-P6`, before/after class diagrams, the comparison table.

### Skill A — S11: refactoring with characterisation tests green at every step

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "How do you know a refactoring did not change behaviour?" | Answer. |
| 10–20 | Primer | A characterisation test records what the code does now, even if odd, so any change in behaviour is visible. | — |
| 20–40 | Step 1: pin behaviour | Give legacy `LegacyFeeCalculator.compute(type, minutes, isWeekend, isStudent)`. | Write a parameterised test of ≥ 12 input rows with today's outputs (`@CsvSource`). |
| 40–60 | Step 2: plan five commits | Teardown in five commits: 1 extract allocation; 2 extract pricing; 3 replace flags with `BookingStatus`; 4 extract notifier; 5 extract reporting. | Write the plan and the tests that guard each step. |
| 60–90 | Step 3: refactor | Rule: run the tests after every commit; a red test means revert, not patch. | Execute the five commits. |
| 90–100 | Recap + review | Show `git log --oneline`; teams compare the original and refactored designs. | Review. |

**Deliverable (S11):** five commits each with green tests (`git log` screenshot), the characterisation test, `docs/week06/refactoring-log.md`.

### Lecture — L11 + L12: behavioural patterns and honest state machines; anti‑patterns, YAGNI, annotations

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "`isReserved`, `isActive`, `isPaid`, `isCancelled`: how many combinations? How many make sense?" | Compute. |
| 10–15 | Hook | 2⁴ = 16 combinations; about 5 are legal. Flags are an unnamed state machine. | — |
| 15–30 | Concept A: Strategy, State, Observer | Strategy = Monday's `FeePolicy`. State machine as a total transition table (below): every state × event cell is a next state or "illegal". Choose an implementation by binding time and number of axes: enum + table (simple, data‑driven), State pattern (behaviour differs per state), sealed types + switch (state carries different data, Week 2 design). Observer: `BookingCompleted` event → notifier and revenue report. Four decisions hidden in "publish an event": synchronous or asynchronous, ordering, what a failing subscriber does to the booking, and delivery guarantee. | Notes. |
| 30–50 | Apply A | Fill the transition table, then code `BookingStatus.next(Event)` throwing `IllegalStateException` for illegal moves. | Code on laptops or paper. |
| 50–55 | Bridge | "Monday's `ParkingManager` had a name. What do we call that design?" | Answer. |
| 55–70 | Concept B: anti‑patterns and restraint | God class; anaemic model (`Booking` with only getters/setters while `BookingManager` holds all logic); pattern‑itis (a factory of factories for one allocator); YAGNI (no drone parking). Reflection and annotations used to check code, not to run it: an annotation plus a test turns a design rule into a build failure (code below). | Notes. |
| 70–90 | Apply B | Code review of 4 snippets: label each God class, anaemic, pattern‑itis or fine, with one fix. Then write the `@ValueObject` rule test. | Review and code. |
| 90–100 | Recap | Q1: Why are 4 flags worse than 1 enum? Q2: Name 2 of the 4 event‑publishing decisions. Q3: What does YAGNI stop you building here? | Answer. |

<p class="worksheet-note">Worksheet: fill in the blank cells yourself, then compare with your team.</p>

| State \\ Event | checkIn | checkOut | cancel | expire |
| --- | --- | --- | --- | --- |
| RESERVED | <span class="fill"></span> | <span class="fill"></span> | <span class="fill"></span> | <span class="fill"></span> |
| ACTIVE | <span class="fill"></span> | <span class="fill"></span> | <span class="fill"></span> | <span class="fill"></span> |
| COMPLETED | <span class="fill"></span> | <span class="fill"></span> | <span class="fill"></span> | <span class="fill"></span> |
| CANCELLED | <span class="fill"></span> | <span class="fill"></span> | <span class="fill"></span> | <span class="fill"></span> |
| EXPIRED | <span class="fill"></span> | <span class="fill"></span> | <span class="fill"></span> | <span class="fill"></span> |

Walk‑in bookings start in ACTIVE.

```java
@Retention(RetentionPolicy.RUNTIME) @Target(ElementType.TYPE)
public @interface ValueObject {}

@Test void valueObjectsAreImmutable() {
    for (Class<?> c : List.of(Money.class, SpotId.class, VehicleId.class, TimeWindow.class)) {
        assertTrue(c.isAnnotationPresent(ValueObject.class), c + " must be marked @ValueObject");
        assertTrue(Modifier.isFinal(c.getModifiers()), c + " must be final");
        for (Field f : c.getDeclaredFields())
            if (!Modifier.isStatic(f.getModifiers()))
                assertTrue(Modifier.isFinal(f.getModifiers()), c.getSimpleName() + "." + f.getName() + " must be final");
    }
}
```

**Deliverable (L):** completed transition table, `BookingStatus.next` code, and the 4‑snippet review.

### Skill B — S12: lambdas, streams and annotations for clarity and build‑time rules

Folded in from the lab manual: Lab 8 (`ParkingRecord` list; `filter`/`map` for cars; `reduce` for total fees; fees above ₹75; car‑only total).

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Rewrite an anonymous `Comparator` as a lambda." | Write it. |
| 10–20 | Primer | Lambda vs anonymous class; standard functional interfaces (`Function`, `Predicate`, `Supplier`, `Consumer`, `UnaryOperator`); streams are lazy and single‑use; `parallelStream` is a concurrency decision (Week 9). | — |
| 20–40 | Step 1: Lab 8 on our model | `records.stream().map(ParkingRecord::fee).reduce(Money.ofPaise(0), Money::plus)`. | Cars only; fees > ₹75; car‑only total. |
| 40–60 | Step 2: FR10 reports | `Collectors.groupingBy` for occupancy per facility and revenue per day. | Write `ReportService` with 3 report methods + tests. |
| 60–90 | Step 3: build‑time rules | Extend the `@ValueObject` test to cover all typed IDs; add `@FunctionalInterface` to `FeePolicy` and show the compile error if a second abstract method is added. | Commit rules and reports. |
| 90–100 | Recap + present | One team explains why a reused stream throws `IllegalStateException`. | Present. |

**Deliverable (S12):** commit `W6-S12` with `ReportService`, Lab 8 results, the extended design‑rule test, and the Booking UML state diagram (diagram of the week).
