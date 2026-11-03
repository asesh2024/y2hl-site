---
title: "The cost of change: dependencies, DIP and SOLID"
week: 5
co: "CO3"
description: "By Thursday BookingService depends only on interfaces (ports), all wiring happens in one composition root, and every team can predict a change's cost in numbers before making it."
requirements: "FR4 (check‑in/check‑out service), NFR3"
lecture_topics: ["Blast radius, coupling types, and cohesion.", "Dependency inversion, ports and adapters, and the composition root."]
skill_focus: "Draw a dependency map and estimate the blast radius of a change."
labs: [{"number": 12, "title": "Mini Project Integration: Booking Service and Repository", "aim": "Connect a booking service to a repository interface using dependency inversion.", "tasks": ["Define BookingRepository and implement InMemoryBookingRepository.", "Inject the repository interface into BookingService and create a booking.", "Verify repeated requests and retrieval by ID; extend the service with booking cancellation."]}]
---

**Thread:** Monday's practical untangles a tightly coupled `BookingService` and tests it with no database or SMS → Tuesday's skill block measures cohesion and change cost → Wednesday's lecture names the principles (blast radius, coupling, DIP, SOLID) and the patterns teams already used (Decorator in Week 3) → Thursday's skill block applies the delete‑the‑infrastructure test and the Law of Demeter, producing the dependency diagram used in Week 11.

### Practical — P5: dependency mapping and dependency inversion

Folded in from the lab manual: the first half of Lab 12 (`BookingRepository` interface, `InMemoryBookingRepository`, repository injected into `BookingService`).

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Build check | — | Build green. |
| 10–20 | Primer | Starter `BookingService` (below) creates its own database store, SMS sender and allocator, and reads the system clock. "Write a test that checks a 2‑hour stay costs ₹80. What stops you?" | Try for 3 minutes. |
| 20–40 | Step 1: inspect and trace | Every `new`, static call and `now()` is a dependency. | List them; draw the dependency graph (arrows from user to used). |
| 40–60 | Step 2: compare designs | Show design B on the board: the service depends on 4 interfaces it owns. Compare coupling and the number of classes a test must construct. | Fill a 2‑column comparison (A vs B). |
| 60–90 | Step 3: apply DIP | Ports in `booking`/`payment`/`notification`; adapters in `infrastructure`; wiring only in `app.SmartParkingApp`. Use the JDK's `java.time.Clock` as the time port. | Refactor; write 4 tests using `InMemoryBookingRepository`, `Clock.fixed(...)` and a fake notifier. |
| 90–100 | Recap + submit | Q: "Which class is now the only one allowed to say `new InMemoryBookingRepository()`?" | Commit `W5-P5`. |

```java
// BEFORE (starter): untestable without a database, an SMS account and a real clock
public class BookingService {
    private final MySqlBookingStore store = new MySqlBookingStore("jdbc:mysql://...");
    private final SmsSender sms = new SmsSender("api-key");
    public Booking checkIn(Vehicle v) {
        ParkingSpot s = new FirstAvailableAllocator().choose(v.type(), store.loadSpots()).orElseThrow();
        Booking b = Booking.start(v, s, LocalDateTime.now());
        store.save(b); sms.send(v.ownerPhone(), "Parked at " + s.id());
        return b;
    }
}
// AFTER: the service owns the interfaces; infrastructure implements them
public final class BookingService {
    private final BookingRepository bookings;  private final SpotAllocator allocator;
    private final Notifier notifier;           private final Clock clock;
    public BookingService(BookingRepository b, SpotAllocator a, Notifier n, Clock c) { ... }
}
// app/SmartParkingApp.java: the composition root, the only place that wires concrete classes
```

**Acceptance checks:** `BookingService` has no `new` of infrastructure classes and no `LocalDateTime.now()`; 4 service tests run in under 1 second with no network or database; `infrastructure` depends on `booking`, never the reverse.

**Deliverable (P):** commit `W5-P5`, before/after dependency graphs (photo is fine), 3–5 lines on why the clock is a dependency.

### Skill A — S9: cohesion matrices and change coupling

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Which fields does `computeFee()` use?" | Answer from the code shown. |
| 10–20 | Primer | Cohesion from a method × field matrix. LCOM1 = max(P − Q, 0), where P = method pairs sharing no field and Q = pairs sharing at least one. | — |
| 20–40 | Step 1: worked example | `ParkingManager` (table below). Compute together. | Fill the matrix; compute LCOM1. |
| 40–60 | Step 2: trace a change | Change request: "SMS must include the fee." Trace every class touched in the God‑class design and in the split design. | Count the four numbers for each. |
| 60–90 | Step 3: measure your own repo | Pick your two largest classes. | Matrix + LCOM1 + one split proposal each. |
| 90–100 | Recap + recommend | Teams recommend the design with lower change cost and justify it in two sentences. | Present. |

| Method \\ Field | spots | bookings | hourlyRate | smsGateway |
| --- | --- | --- | --- | --- |
| `allocate()` | ✓ | ✓ | — |  |
| `release()` | ✓ | ✓ | — |  |
| `computeFee()` | — |  | ✓ | — |
| `sendSms()` | — |  | — | ✓ |

**Deliverable (S9):** `docs/week05/cohesion.md` with the worked example, two matrices from the team's own code, and the change‑cost comparison.

### Lecture — L9 + L10: blast radius, DIP and the composition root; SOLID and creational/structural patterns

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Finance wants weekend pricing. Guess how many files you will edit." | Write a number. |
| 10–15 | Hook | Show Monday's before/after graphs from one team. | — |
| 15–30 | Concept A: blast radius and DIP | Predict a change's cost before coding, in four numbers: files edited, files added, test classes to rerun, packages crossed. Coupling flavours from worst to mildest: content, common, external, control, stamp, data, message. DIP: high‑level policy owns the interface; details implement it. Composition root: one place that knows concrete classes. | Notes. |
| 30–50 | Apply A | Price "add weekend pricing" in the starter design and in Monday's design, using the four numbers. Then check the guesses from the do‑now. | Compute both. |
| 50–55 | Bridge | "DIP is the D in SOLID. What are the other four doing in our code?" | — |
| 55–70 | Concept B: SOLID applied, plus patterns | SRP = one actor per class (finance, operations and marketing all edit `ParkingManager`). OCP = open on the axis that changes most (pricing changes monthly, spot types rarely). L and I = last two weeks. Patterns by problem: Factory (`AllocatorFactory.forFacility(config)`), Builder for rules not parameters (`Facility.builder()...build()` checks every level has an ACCESSIBLE spot), Adapter (vendor payment SDK → our `PaymentGateway`), Facade (`GateKiosk` over allocation, booking and payment), Decorator (Week 3's `CheckedAllocator`; `Retry(Logging(gateway))` logs every attempt, `Logging(Retry(gateway))` logs once, so layer order is observable). Singleton's costs: hidden dependency, global state, test isolation, initialisation under threads. | Notes. |
| 70–90 | Apply B | Give 5 change requests (new EV fast‑charge rate; new gate kiosk; a second payment vendor; a facility with odd level rules; logging every gateway call). Teams match each to a principle and a pattern, with the cost they accept. | Fill the table. |
| 90–100 | Recap | Q1: What are the four blast‑radius numbers? Q2: State SRP using the word "actor". Q3: Adapter vs Facade in one line each. | Answer. |

**Deliverable (L):** change‑request → principle → pattern table with costs.

### Skill B — S10: delete‑the‑infrastructure test and the Law of Demeter

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "If the `infrastructure` package vanished tonight, which of your packages would still compile?" | Guess. |
| 10–20 | Primer | The test: temporarily delete `infrastructure`, compile, and list every error. Each error is a dependency pointing the wrong way. | — |
| 20–40 | Step 1: dependency map | Require a package‑level map with arrows. | Draw it; run the delete test on a branch. |
| 40–60 | Step 2: Law of Demeter | Show `booking.getSpot().getLevel().getFacility().getRates().hourly()`. Each dot reaches a stranger. Fix: `pricing.rateFor(booking)` or ask the booking for what you need. | Find 3 chains in your repo. |
| 60–90 | Step 3: redesign | Fix every delete‑test error and every chain with an interface, constructor injection or a tell‑don't‑ask method. | Commit fixes; redraw the map. |
| 90–100 | Recap + present | One team shows its revised diagram. | Present. |

**Deliverable (S10):** `docs/week05/dependencies.png` (UML component/package diagram of the week, before and after), delete‑test log showing zero errors, commit `W5-S10`.
