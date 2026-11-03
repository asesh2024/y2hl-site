---
title: "Objects that keep their promises"
week: 1
co: "CO1"
description: "By Thursday every team has Vehicle, ParkingSpot and Booking classes that reject illegal states, plus a written invariant catalogue."
requirements: "FR1, FR2, FR4, NFR1"
lecture_topics: ["Domain objects and the guarantees they make.", "Writing invariants as plain-language rules.", "The five doorways that break guarantees: public setters, escaping references, mutable elements in collections, constructors without validation, and misleading equality.", "Tell-don't-ask principle."]
skill_focus: "Map Waypoint entities and write invariant sentences."
labs: [{"number": 1, "title": "Classes, Objects, Constructors, and Methods", "aim": "Represent a vehicle entering a parking facility.", "tasks": ["Create the Vehicle class with vehicleNumber and vehicleType.", "Create vehicle objects using a constructor and display their details.", "Extend the program by creating and displaying a bus object."]}]
---

**Thread:** Monday's practical builds the three classes with validated constructors → Tuesday's skill block maps the domain and writes the full invariant catalogue → Wednesday's lecture explains why (an object is a guarantee) and shows the five ways guarantees still break, using the week's code → Thursday's skill block classifies invariants and drafts the booking transition table used in Week 6.

### Practical — P1: project set‑up, core model, sentence invariants

Warm‑up from the lab manual: Lab 1 (`Vehicle` class with constructor and display, extended with a bus object).

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Tool check | — | Run `java -version` (17+), `mvn -v`, `git --version`. |
| 10–20 | Primer | Show the problem statement, FR1/FR2/FR4 and the starter `pom.xml` with JUnit 5. Teach the minimum idea: an invariant is a sentence that must always be true, checked in the constructor. Assign team roles. | Create the team repo `smart-parking`, add your instructor as a collaborator. |
| 20–40 | Step 1: Vehicle | Demonstrate Lab 1, then require validation: registration matches a simplified Indian format `^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$` (for example AP07CD1234); type not null. | Code `Vehicle`, `VehicleType`; create a bus object (lab extension). |
| 40–60 | Step 2: ParkingSpot | Require the invariant sentences as Javadoc before any field. | Code `ParkingSpot`, `SpotType`, `SpotStatus` with `occupy`/`release`. |
| 60–90 | Step 3: Booking + tests | Specify `Booking` (below). Walk the room; check that every invariant has a test. | Code `Booking`; write ≥ 8 JUnit tests using `assertThrows`. |
| 90–100 | Recap + submit | Q: "Which of your tests would fail if someone added a public setter?" | Commit `W1-P1: core model`, push, submit the link. |

**Booking specification (Week 1 version):** fields `bookingId`, `vehicle`, `spot`, `entryTime`, `exitTime` (null until exit), `status` (ACTIVE, COMPLETED for now). `checkOut(LocalDateTime exit)` throws if `exit` is before `entryTime` or if the booking is already COMPLETED. No setters.

**Acceptance checks:** builds with `mvn test`; no public setters; every constructor validates; ≥ 8 tests green, including one for each invariant; `docs/week01/INVARIANTS.md` lists each invariant and the test that checks it.

**Deliverable (P):** repo link at commit `W1-P1`, screenshot of the green test run, and 3–5 lines on why validation belongs in the constructor (lab‑manual submission format).

### Skill A — S1: domain map and invariant catalogue

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "List every noun in: Ravi drives his EV into Facility F1, takes spot L2‑E07, leaves at 11:40 and pays ₹80." | List nouns. |
| 10–20 | Primer | Walk through two full scenarios: walk‑in and advance reservation. | Underline nouns (candidate objects) and verbs (candidate methods). |
| 20–40 | Step 1: relationships | Model on the board: Facility 1–\* Level 1–\* ParkingSpot; Booking \*–1 Vehicle; Booking \*–1 ParkingSpot; Booking has 0..1 fee (Money). | Draw the domain map as a UML class diagram (names and associations, no methods). |
| 40–60 | Step 2: guarantees | For each object ask: "What must never be false?" | Draft invariant sentences per object. |
| 60–90 | Step 3: catalogue | Require ≥ 3 rules per object, each tagged with who enforces it: constructor, method guard, type, or service. | Produce the catalogue table. |
| 90–100 | Recap + peer review | Teams swap catalogues and apply the sentence test. | Mark one weak rule in the other team's catalogue. |

**Deliverable (S1):** `docs/week01/domain-map.png` (UML class diagram of the week) and `invariant-catalogue.md` with ≥ 12 rules and their enforcer.

### Lecture — L1 + L2: invariants, state space, the five doorways

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | Board: "Write one thing that must always be true about a parking ticket." | Write one sentence. |
| 10–15 | Hook | Story: a ticket printed with exit 09:00 and entry 11:00 produced a fee of −₹60, and the system refunded it. Ask: "Which line of code should have refused this?" | Discuss in pairs. |
| 15–30 | Concept A: object = guarantee | Define invariant: a sentence that is true after construction and after every public method. Show the reachable state space of a naive `Booking` (below). Introduce the sentence test: write the sentence before the field. | Note the definitions. |
| 30–50 | Apply A | Critique one team's Monday `ParkingSpot` (below). Students write 3 invariant sentences for `Vehicle` and 3 for `Booking`; take 3 answers and test each with "is it checkable, is it always true?" | Write and refine sentences. |
| 50–55 | Bridge | "The constructor is safe. Can anyone still break the object?" Add a public setter on screen. | Spot the break. |
| 55–70 | Concept B: five doorways | Teach the five ways guarantees break (table below) and tell‑don't‑ask. | Copy the table. |
| 70–90 | Apply B: invariant‑breaker | Hand out `BadParkingSpot` (all five doorways). Teams have 12 minutes to write one line of client code per doorway that breaks an invariant, then 8 minutes to fix one doorway. | Break, then fix. |
| 90–100 | Recap | Q1: Write one multi‑field invariant of Booking. Q2: Name the five doorways. Q3: Rewrite `if (s.getStatus()==FREE) s.setStatus(OCCUPIED);` as tell‑don't‑ask. | Answer on paper. |

**Key ideas**

- Reachable state space. A naive `Booking` with `status` (5 values), nullable `entryTime`, `exitTime` and `fee` has 5 × 2 × 2 × 2 = 40 field combinations; only about 5 are legal. Design goal: make the other 35 impossible to reach.
- Three kinds of invariant: single‑field (registration not blank), multi‑field (exit ≥ entry), temporal (a COMPLETED booking never changes again).
- The five doorways:

| Doorway | Smart Parking example | Fix |
| --- | --- | --- |
| Public setter | `spot.setStatus(FREE)` while a car is parked | Intention‑named methods: `occupy()`, `release()` |
| Escaping reference | `facility.getSpots().clear()` | Return `List.copyOf(...)` or an unmodifiable view |
| Mutable element inside an "immutable" collection | `List.copyOf(spots).get(0).release()` | Expose IDs or immutable snapshots, not mutable entities |
| Constructor that validates nothing | `new Vehicle("", null)` | Validate every argument in the constructor |
| Equality that lies | `Booking` without `hashCode`, or `equals` on mutable status: it gets lost in a `HashSet` | Entities: equality by ID only; values: equality by all fields |

```java
/** Invariant: status == OCCUPIED  <=>  occupiedBy != null. */
public final class ParkingSpot {
    private final String spotId;          // becomes SpotId in Week 2
    private final SpotType type;
    private SpotStatus status = SpotStatus.FREE;
    private String occupiedBy;            // registration; null when not OCCUPIED

    public ParkingSpot(String spotId, SpotType type) {
        if (spotId == null || spotId.isBlank()) throw new IllegalArgumentException("spotId required");
        this.spotId = spotId;
        this.type = Objects.requireNonNull(type, "type");
    }
    public void occupy(String registration) {           // tell, don't ask
        if (status != SpotStatus.FREE) throw new IllegalStateException(spotId + " is " + status);
        this.status = SpotStatus.OCCUPIED;
        this.occupiedBy = registration;
    }
    public void release() {
        if (status != SpotStatus.OCCUPIED) throw new IllegalStateException(spotId + " is not occupied");
        this.status = SpotStatus.FREE;
        this.occupiedBy = null;
    }
}
```

**Deliverable (L):** exit ticket with three invariants (one of each kind) and the doorway your team broke and fixed.

### Skill B — S2: single‑field, multi‑field and temporal invariants

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Is 'exit time ≥ entry time' about one field or two?" | Answer. |
| 10–20 | Primer | Define the three categories with one Booking example each. | Note them. |
| 20–40 | Step 1: single and multi‑field | Examples: fee ≥ 0; capacity > 0; OCCUPIED ⇔ occupiedBy present; BUS only in a LARGE spot (cross‑object, so enforced by a service, not the class). | Add 2 examples of each to the catalogue. |
| 40–60 | Step 2: temporal | Temporal rules need a transition table. Draft Booking: RESERVED → ACTIVE → COMPLETED; RESERVED → CANCELLED; RESERVED → EXPIRED (no entry within 15 min of start). Every other move is illegal. | Fill a 5 × 5 from/to table (legal = ✓). |
| 60–90 | Step 3: worksheet | Hand out the 10 rules below. | Classify each rule, name its enforcer, add one new rule per category. |
| 90–100 | Recap | Discuss the cross‑object rule (9). | Correct worksheets. |

<p class="worksheet-note">Worksheet: fill in the blank cells yourself, then compare with your team.</p>

| # | Rule | Answer |
| --- | --- | --- |
| 1 | Spot ID is not blank | <span class="fill"></span> |
| 2 | Fee is never negative | <span class="fill"></span> |
| 3 | Exit time ≥ entry time | <span class="fill"></span> |
| 4 | A COMPLETED booking has a fee | <span class="fill"></span> |
| 5 | A COMPLETED booking never changes status | <span class="fill"></span> |
| 6 | OCCUPIED ⇔ occupiedBy present | <span class="fill"></span> |
| 7 | A RESERVED booking with no entry 15 min after start becomes EXPIRED | <span class="fill"></span> |
| 8 | Level capacity > 0 | <span class="fill"></span> |
| 9 | A BUS is parked only in a LARGE spot | <span class="fill"></span> |
| 10 | A booking's ID never changes | <span class="fill"></span> |

**Deliverable (S2):** classified worksheet and the draft Booking transition table in `docs/week01/booking-transitions.md` (input to Week 6).
