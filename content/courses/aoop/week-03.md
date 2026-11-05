---
title: "Contracts before code: the SpotAllocator"
week: 3
co: "CO2"
description: "By Thursday the system can choose a compatible free spot through a SpotAllocator whose contract is written before its code, and students can say who is at fault when a contract breaks."
requirements: "FR3, NFR2 (started)"
lecture_topics: ["Preconditions, postconditions, invariants, and method contracts.", "Liskov Substitution Principle and caller-side expectations."]
skill_focus: "Write contracts for a method using precondition, postcondition, and invariant."
labs: [{"number": 5, "title": "Interfaces and Polymorphism", "aim": "Allow different strategies to choose a parking spot.", "tasks": ["Define the SpotAllocator interface.", "Implement FirstAvailableAllocator and LastAvailableAllocator.", "Create another allocator while keeping the same interface."]}]
---

**Thread:** Monday's practical writes the allocator contract in Javadoc and three implementations → Tuesday's skill block writes the full contract sheet for allocate and release → Wednesday's lecture formalises pre/postconditions and Liskov, judging Monday's allocators from the caller's side → Thursday's skill block finds override‑rule violations, which become the "saboteurs" in Week 4's contract tests.

### Practical — P3: design by contract and SpotAllocator

Folded in from the lab manual: Lab 5 (`SpotAllocator` interface, `FirstAvailableAllocator`, `LastAvailableAllocator`, one more allocator). The lab manual returns an `int` index or −1; this plan upgrades that to `Optional<ParkingSpot>` and discusses why.

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Build check | — | Build green. |
| 10–20 | Primer | A method has a contract: what the caller must ensure (precondition), what the method promises (postcondition), what stays true (invariant). Show Lab 5 returning −1: "Where is the meaning of −1 written?" | — |
| 20–40 | Step 1: inspect the interface | Give the bare interface `Optional<ParkingSpot> choose(VehicleType type, List<ParkingSpot> spots)`. | List every question the signature does not answer (null list? may it return an occupied spot? may it change spot state? what if none fits?). |
| 40–60 | Step 2: write the contract | Agree the compatibility rule as `VehicleType.fits(SpotType)` (table below). | Write the Javadoc contract (below) before any implementation. |
| 60–90 | Step 3: implement + check | Show a `CheckedAllocator` that wraps any allocator and checks the postcondition after each call (an early Decorator). | Implement First‑available, Last‑available and Nearest‑to‑gate (lowest level, then lowest bay number); wrap each in `CheckedAllocator`; ≥ 6 tests (partly free lot, full lot, no compatible spot, BUS needing LARGE). |
| 90–100 | Recap + submit | Q: "Your allocator returned an occupied spot. Whose bug is it, the caller's or yours?" | Commit `W3-P3`. |

| Vehicle type | Fits spot types |
| --- | --- |
| BIKE | TWO\_WHEELER |
| CAR | COMPACT, LARGE |
| SUV | LARGE |
| BUS | LARGE |
| EV\_CAR | EV, COMPACT, LARGE |

```java
public interface SpotAllocator {
    /**
     * Chooses a spot for a vehicle of the given type.
     * Pre:  type != null; spots != null and contains no null elements.
     * Post: result is empty  <=>  no spot in spots is FREE and fits type.
     *       If present, the spot is (a) an element of spots, (b) FREE, (c) type.fits(spot.type()).
     * Frame: does not change the state of any spot; the caller occupies the chosen spot.
     * Throws: NullPointerException if a precondition is violated (caller's fault).
     */
    Optional<ParkingSpot> choose(VehicleType type, List<ParkingSpot> spots);
}
```

**Acceptance checks:** contract written before the first implementation (check commit order); all three allocators pass the same 6 tests; `CheckedAllocator` throws `IllegalStateException` naming the broken postcondition clause.

**Deliverable (P):** commit `W3-P3`, test screenshot, 3–5 lines comparing `−1` with `Optional`.

### Skill A — S5: preconditions and postconditions for domain services

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Which object occupies the spot: the allocator or the service?" | Answer. |
| 10–20 | Primer | Introduce `AllocationService.allocate(Vehicle) : Optional<ParkingSpot>` (choose + occupy) and `release(SpotId)`. | — |
| 20–40 | Step 1: caller duties and results | List what callers of each method must ensure and what they get back. | Draft pre/post. |
| 40–60 | Step 2: write the contracts | Push for postconditions that mention state change: "after allocate, exactly one more spot is OCCUPIED, by this vehicle". | Write pre/post/invariant for both. |
| 60–90 | Step 3: contract sheet + sequence diagram | Require a table of valid inputs, expected results, failure conditions and the fault owner, plus a UML sequence diagram for `allocate`. | Produce both. |
| 90–100 | Recap + peer check | Swap sheets; each team finds one missing failure condition. | Review. |

**Deliverable (S5):** `docs/week03/contract-sheet.md` (≥ 8 rows) and `allocate-sequence.png` (UML sequence diagram of the week).

### Lecture — L5 + L6: preconditions, postconditions, invariants; Liskov substitution

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Write the precondition of `Money.minus(other)`." | Write it. |
| 10–15 | Hook | Show one team's Monday contract. Ask what it leaves unsaid. | Point out gaps. |
| 15–30 | Concept A: design by contract | Precondition = caller's duty; postcondition = method's promise; invariant = class's promise between calls. Precondition broken → caller bug; postcondition broken → implementer bug. A working list of what a contract states that a signature cannot: allowed values (ranges, null), the result's relation to the input, side effects (frame), exceptions and when, thread safety, cost (time/space). | Notes. |
| 30–50 | Apply A | Teams write full contracts for `Booking.checkOut(exit)` and `Money.minus(other)` (pre: same currency, this ≥ other). Take two answers; mark which clause each test would check. | Write contracts. |
| 50–55 | Bridge | "On Monday you wrote 3 allocators. Can any caller tell them apart in a harmful way?" | Discuss. |
| 55–70 | Concept B: Liskov, stated precisely | A subtype may weaken preconditions and strengthen postconditions, never the reverse, and must keep the invariants. Judge from the caller's side. Four violation signals: an override that throws, an override that does nothing, an added precondition, and `instanceof` checks in callers. | Notes. |
| 70–90 | Apply B | Judge the 4 subtypes in the Thursday worksheet table (below) from the caller's side: which clause does each break? | Fill the table. |
| 90–100 | Recap | Q1: Precondition broken: whose bug? Q2: May a subtype accept more inputs? Q3: Name the four LSP signals. | Answer. |

**Deliverable (L):** two written method contracts and the LSP judgement table.

### Try it: checking a contract at run time

A contract is only useful if it can catch a wrong implementation. This program checks the `SpotAllocator` postcondition against a correct allocator and a careless one.

```java
import java.util.*;

public class Main {
    enum Type { CAR, BIKE }
    record Spot(String id, Type type, boolean free) {}

    interface SpotAllocator {
        /** Post: empty <=> no spot is FREE and fits; if present, the spot is in spots, FREE and fits. */
        Optional<Spot> choose(Type type, List<Spot> spots);
    }

    static final SpotAllocator FIRST_AVAILABLE = (type, spots) ->
            spots.stream().filter(s -> s.free() && s.type() == type).findFirst();

    /** Forgets to check that the spot is free. */
    static final SpotAllocator CARELESS = (type, spots) ->
            spots.stream().filter(s -> s.type() == type).findFirst();

    static String check(SpotAllocator allocator, Type type, List<Spot> spots) {
        Optional<Spot> result = allocator.choose(type, spots);
        boolean exists = spots.stream().anyMatch(s -> s.free() && s.type() == type);
        if (result.isEmpty() != !exists) return "VIOLATED: empty must mean no spot fits";
        if (result.isPresent() && !result.get().free()) return "VIOLATED: chose occupied " + result.get().id();
        return "OK";
    }

    public static void main(String[] args) {
        List<Spot> spots = List.of(new Spot("A1", Type.CAR, false), new Spot("A2", Type.CAR, true));
        System.out.println(check(FIRST_AVAILABLE, Type.CAR, spots));  // OK
        System.out.println(check(CARELESS, Type.CAR, spots));         // VIOLATED: chose occupied A1
        System.out.println(check(FIRST_AVAILABLE, Type.BIKE, spots)); // OK
    }
}
```

**Now change it:** Write an allocator that always returns `Optional.empty()`. Does `check` catch it? Which part of the contract does it break?

### Skill B — S6: caller‑side substitutability and override rules

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "A subclass throws `UnsupportedOperationException` for bikes. Is that allowed?" | Answer. |
| 10–20 | Primer | Direction rule recap with a diagram: preconditions may only widen, postconditions may only narrow. | — |
| 20–40 | Step 1: stronger preconditions | Analyse rows 1 and 4 below. | Fill caller expectation and broken clause. |
| 40–60 | Step 2: weaker postconditions | Analyse rows 2, 3 and 5. | Fill the same. |
| 60–90 | Step 3: correct each design | For each, propose a fix that keeps substitutability (separate interface, configuration instead of subclass, return empty instead of throw). | Write the corrected alternative; code one as a class for Monday. |
| 90–100 | Recap + present | Two teams present one violation each. | Present. |

<p class="worksheet-note">Worksheet: fill in the blank cells yourself, then compare with your team.</p>

| # | Subtype | Caller expected | What breaks | Signal |
| --- | --- | --- | --- | --- |
| 1 | `PremiumAllocator` throws for BIKE | Any vehicle type is accepted | <span class="fill"></span> | <span class="fill"></span> |
| 2 | `ReservedFirstAllocator` may return a RESERVED spot | Returned spot is FREE | <span class="fill"></span> | <span class="fill"></span> |
| 3 | `MaintenanceAllocator` always returns empty | Empty only when nothing fits | <span class="fill"></span> | <span class="fill"></span> |
| 4 | `EvOnlyAllocator` requires `type == EV_CAR` | Any type is accepted | <span class="fill"></span> | <span class="fill"></span> |
| 5 | `GateController` does `if (a instanceof EvOnlyAllocator)` | Allocators are interchangeable | <span class="fill"></span> | <span class="fill"></span> |

**Deliverable (S6):** `docs/week03/lsp-violations.md` with the completed table and corrected designs. These five become the saboteurs in Week 4.
