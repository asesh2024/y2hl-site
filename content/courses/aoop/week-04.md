---
title: "One contract, many implementations"
week: 4
co: "CO2"
description: "By Thursday one shared test suite judges every allocator, a deliberately broken \"saboteur\" allocator is caught by it, and the fat parking interface is split into role interfaces."
requirements: "FR3, NFR2"
lecture_topics: ["Interfaces, abstract classes, sealed types, and role interfaces.", "Shared contract tests and the SpotAllocator example."]
skill_focus: "Spot substitutability violations and propose a safer interface."
labs: [{"number": 6, "title": "Method Contracts and Contract Testing", "aim": "Test that every allocator returns an available spot, or -1 when the parking lot is full.", "tasks": ["Document the SpotAllocator method contract.", "Implement the contract-checking method for partly free and full parking arrays.", "Write a second allocator and run the same contract test without changing the test."]}]
---

**Thread:** Monday's practical turns last week's contract into a reusable contract test and runs last Thursday's five LSP violators against it → Tuesday's skill block splits a fat interface into role interfaces and builds a contract checklist → Wednesday's lecture explains when to use an interface, an abstract class or a sealed type, and why contract tests work → Thursday's skill block reads real JDK errors and names the broken clause.

### Practical — P4: Liskov substitution and contract testing

Folded in from the lab manual: Lab 6 (document the `SpotAllocator` contract, a contract‑checking method for partly free and full arrays, a second allocator run through the same test).

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Build check | — | Build green. |
| 10–20 | Primer | "If three allocators share one contract, why write three test classes?" Show the shape below: one contract checker, one abstract test, one subclass per implementation. | — |
| 20–40 | Step 1: identify violations | Give the 5 classes from last Thursday's worksheet as code. | Predict which contract clause each breaks. |
| 40–60 | Step 2: design the contract checks | List the 8 cases below; each maps to one clause of the Javadoc contract. | Write `SpotAllocatorContract.verify(...)` returning a list of violations. |
| 60–90 | Step 3: write and repair | Real allocators must return no violations; each saboteur must return at least one. | Run all; fix any real allocator that fails; record which case caught which saboteur. |
| 90–100 | Recap + submit | Q: "A new allocator arrives next month. How many new test methods must you write?" (Zero: one subclass.) | Commit `W4-P4`. |

| # | Contract case | Clause checked |
| --- | --- | --- |
| 1 | Full lot returns empty | Post: empty ⇔ nothing fits |
| 2 | Only incompatible spots free (BIKE, all COMPACT) returns empty | Post: fits type |
| 3 | Partly free lot returns a FREE spot | Post (b) |
| 4 | Returned spot fits the vehicle type | Post (c) |
| 5 | Returned spot is the same object as one in the input | Post (a) |
| 6 | No spot's status changes during `choose` | Frame |
| 7 | `type == null` throws `NullPointerException` | Pre |
| 8 | Empty list returns empty | Post |

```java
public abstract class SpotAllocatorContractTest {
    protected abstract SpotAllocator create();

    @Test void satisfiesContract() {
        assertEquals(List.of(), SpotAllocatorContract.verify(create()));
    }
}
class FirstAvailableAllocatorTest extends SpotAllocatorContractTest {
    protected SpotAllocator create() { return new FirstAvailableAllocator(); }
}
class SaboteurTest {
    @Test void contractCatchesReservedFirstAllocator() {
        assertFalse(SpotAllocatorContract.verify(new ReservedFirstAllocator()).isEmpty());
    }
}
```

**Acceptance checks:** one abstract test, ≥ 3 real subclasses, all green; ≥ 3 saboteurs each caught; `docs/week04/saboteur-log.md` says which case caught which saboteur.

**Deliverable (P):** commit `W4-P4`, test report screenshot, saboteur log.

### Skill A — S7: role interfaces and shared contract‑test suites

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "List the methods a gate kiosk actually calls." | List them. |
| 10–20 | Primer | Same system, three callers: gate kiosk, mobile app, admin dashboard. Each needs a different slice. | — |
| 20–40 | Step 1: role interfaces | Map each caller to the methods it uses. | Draw a caller × method matrix; derive role interfaces. |
| 40–60 | Step 2: contract cases | For `FeeCalculator` and `SpotAllocator`, list cases every implementation must pass. | Write the checklist. |
| 60–90 | Step 3: apply to two implementations | Teams apply the `FeeCalculator` checklist to two pricing ideas (flat hourly; first 30 minutes free) on paper, then code one. | Record pass/fail; commit the `FeeCalculator` contract test. |
| 90–100 | Recap + review | Each team names one case the other team missed. | Review. |

**Deliverable (S7):** `docs/week04/role-interfaces.md` (matrix + interfaces) and the reusable contract checklist; UML class diagram of the allocator hierarchy (diagram of the week).

### Lecture — L7 + L8: interface, abstract class or sealed; role interfaces; contract tests

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Should `BookingState` be an interface, an abstract class, or something else?" | One‑line answer. |
| 10–15 | Hook | Show Monday's saboteur log from one team: the test suite caught bugs nobody hand‑checked. | — |
| 15–30 | Concept A: choose by cost | Interface: any class may implement it; cost: cannot enforce shared invariants or hold state (use for seams such as `SpotAllocator`, `PaymentGateway`). Abstract class: shares code and state; cost: one parent only, subclasses depend on base internals. Sealed: closed, known set; cost: adding a variant edits the declaration (use for domain alternatives such as `BookingState`, `PaymentOutcome`). | Write each cost in one sentence. |
| 30–50 | Apply A | For 6 Smart Parking types (`SpotAllocator`, `FeePolicy`, `BookingState`, `PaymentGateway`, `ParkingSpot` variants, `Notifier`), teams pick interface, abstract or sealed and give the cost they accept. | Decide and justify. |
| 50–55 | Bridge | "Your `ParkingOperations` interface has 6 methods. How big is a fake for a test?" | Answer. |
| 55–70 | Concept B: role interfaces and contract tests | Interface segregation argued as a testing principle: a test double for a role interface implements 1 method, not 6. Contract tests: one suite judges every implementation; a saboteur proves the suite has teeth. | Notes. |
| 70–90 | Apply B | Split `ParkingOperations` (allocate, release, price, pay, notify, report) into role interfaces on the board; write the contract‑test skeleton for `FeeCalculator`. | Draw and write. |
| 90–100 | Recap | Q1: When is sealed better than an interface? Q2: Why does a contract suite need a saboteur? Q3: Name 3 role interfaces in our system. | Answer. |

**Deliverable (L):** the type‑choice table with costs, and the role‑interface split.

### Skill B — S8: diagnosing JDK errors caused by contract violations

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Does `@Override` change what the program does?" | Answer. |
| 10–20 | Primer | Compile‑time errors tell you the signature contract is broken; run‑time exceptions tell you a behavioural clause is broken. The stack trace's top frame in your code shows who broke it. | — |
| 20–40 | Step 1: compile errors | Snippets 1–4 below. | Compile, read the message, name the broken rule. |
| 40–60 | Step 2: run‑time errors | Snippets 5–7. | Run, read the trace, decide caller or implementer. |
| 60–90 | Step 3: fix and rerun | All fixes must pass the shared contract suite from Monday. | Fix each; rerun the suite. |
| 90–100 | Recap + submit | One team explains one error end to end. | Submit. |

<p class="worksheet-note">Worksheet: fill in the blank cells yourself, then compare with your team.</p>

| # | Broken code (inside an allocator) | What the JDK reports (abbreviated) | Who is at fault |
| --- | --- | --- | --- |
| 1 | `choose(VehicleType t, ArrayList<ParkingSpot> s)` | <span class="fill"></span> | <span class="fill"></span> |
| 2 | Method declared without `public` | <span class="fill"></span> | <span class="fill"></span> |
| 3 | `choose(...) throws IOException` | <span class="fill"></span> | <span class="fill"></span> |
| 4 | Returns `List<ParkingSpot>` | <span class="fill"></span> | <span class="fill"></span> |
| 5 | Calls `spots.remove(chosen)` on `List.of(...)` | <span class="fill"></span> | <span class="fill"></span> |
| 6 | Removes from the list inside a for‑each loop | <span class="fill"></span> | <span class="fill"></span> |
| 7 | Caller passes `type = null` | <span class="fill"></span> | <span class="fill"></span> |

**Deliverable (S8):** `docs/week04/error-diagnosis.md` with error, broken clause, fault owner and fix for all 7, plus the corrected code passing the contract suite.
