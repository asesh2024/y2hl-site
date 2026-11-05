---
title: "Bounded modules and numbers before boxes"
week: 11
co: "CO6"
description: "By Thursday the codebase is a modular monolith whose boundaries are enforced by failing tests, the payment gateway sits behind an anti‑corruption layer, and each team has a capacity plan for 50× load with its arithmetic shown."
requirements: "NFR7, NFR8"
lecture_topics: ["Bounded contexts, anti-corruption layers, and modular monoliths.", "Capacity estimation, caching, sharding, and operational metrics."]
skill_focus: "Draw bounded contexts and an anti-corruption layer for Waypoint."
labs: []
---

**Thread:** Monday's practical writes module dependency rules as tests and watches them fail on a planted violation → Tuesday's skill block builds the payment and sensor ACLs → Wednesday's lecture explains bounded contexts and anti‑corruption layers, then derives architecture from capacity numbers → Thursday's skill block produces the 50× capacity plan that feeds the Week 12 dossier.

### Practical — P11: architecture rules and dependency testing

Tooling: ArchUnit (`com.tngtech.archunit:archunit-junit5`, a current 1.x release) reads compiled bytecode. If the lab cannot add it, use the no‑library fallback below, which scans `import` lines and is weaker (it misses fully qualified names).

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Build check | — | Build green. |
| 10–20 | Primer | A boundary that is not tested will erode. Show the target layout: one top‑level package per context (`operations`, `booking`, `pricing`, `payment`, `notification`), each with a public `api` sub‑package and package‑private internals; `infrastructure` and `app` outside. | — |
| 20–40 | Step 1: review modules | Move classes into contexts; draw the package dependency graph from Week 5's diagram. | Move and redraw. |
| 40–60 | Step 2: define rules | Write the rules as sentences first: R1 domain code never depends on infrastructure. R2 contexts call each other only through `..api..`. R3 no cycles between contexts. R4 only `app` names infrastructure classes. | Agree 4–6 rules. |
| 60–90 | Step 3: implement the tests | Code below. Plant one violation per rule on a branch to prove each test can fail, then revert. | Implement; record each planted failure message. |
| 90–100 | Recap + evidence | Q: "Which rule would have caught the Week 5 starter `BookingService`?" | Commit `W11-P11`; save the evidence log. |

```java
@AnalyzeClasses(packages = "edu.klef.aoop.parking")
class ArchitectureTest {
    @ArchTest static final ArchRule domainIsPure = noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAPackage("..infrastructure..");
    @ArchTest static final ArchRule noCyclesBetweenContexts = slices()
            .matching("edu.klef.aoop.parking.(*)..").should().beFreeOfCycles();
}

// Fallback without libraries (weaker: checks import lines only)
@Test void domainDoesNotImportInfrastructure() throws IOException {
    try (Stream<Path> files = Files.walk(Path.of("src/main/java/edu/klef/aoop/parking"))) {
        List<Path> bad = files.filter(p -> p.toString().contains("domain") && p.toString().endsWith(".java"))
                              .filter(p -> read(p).contains("import edu.klef.aoop.parking.infrastructure"))
                              .toList();
        assertEquals(List.of(), bad);
    }
}
```

**Acceptance checks:** ≥ 4 rules, each shown to fail on a planted violation; main branch green; each context's tables carry its prefix (`booking_`, `pricing_`, `billing_`) and no context reads another's tables.

**Deliverable (P):** commit `W11-P11`, `docs/week11/architecture-rules.md` with each rule, its test, and the planted‑failure message.

### Skill A — S21: anti‑corruption layers for bounded‑context integration

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "The vendor sends amounts as `\"120.50\"` rupees in a string. Where should that be converted?" | Answer. |
| 10–20 | Primer | Two external models (fictional vendors): payment gateway "PayFast" \`{ "txn\_ref", "amt": "120.50", "state": "SUCCESS | FAILED |
| 20–40 | Step 1: compare models | Table: their term → our term (amt → `Money`; state → `PaymentOutcome`; bay → `SpotId` via lookup; occ → `SpotStatus`). | Fill the translation table. |
| 40–60 | Step 2: design the ACL | Translator lives in `infrastructure`, implements our port, and is the only class that imports vendor types. Amount: `new BigDecimal(amt).movePointRight(2).longValueExact()` → paise; PENDING → `Unknown` (Week 7). | Write the ACL class diagram. |
| 60–90 | Step 3: build and test | Tests for valid input, unknown state, amount with 3 decimals (reject), unknown bay code (reject and alert). | Implement `PayFastGatewayAdapter` and `SensorEventTranslator`; add an architecture rule: only these classes may import vendor packages. |
| 90–100 | Recap + present | One team shows how a vendor format change touches only the ACL. | Present. |

**Deliverable (S21):** context map (UML package diagram of the week), both ACL classes with ≥ 6 translation tests, the new architecture rule.

### Lecture — L21 + L22: bounded contexts, ACLs, modular monolith; capacity, caching, sharding, SLOs

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "What does 'spot' mean to the sensor team, and to the booking team?" | Answer. |
| 10–15 | Hook | Sensor team: a bay with a device, battery and occupancy flag. Booking team: an ID you hold for a time window. Same word, different models. | — |
| 15–30 | Concept A: contexts and boundaries | Bounded context = where a vocabulary is consistent. Our contexts: Parking Operations, Booking, Pricing, Payment/Billing, Notification, Customer. Context map relationships: customer/supplier (Booking uses Pricing), anti‑corruption layer (our side translates an external model so it cannot leak in). Modular monolith: one deployable, hard internal boundaries, each module owns its schema. Extract a module into a service only when a measured trigger is met (for example, it needs to scale separately, deploy on a different cadence, or its failure must be isolated); state the number that triggers it. | Draw the context map. |
| 30–50 | Apply A | Teams draw the context map for Smart Parking with relationship labels and mark where translation happens. | Draw. |
| 50–55 | Bridge | "The city wants 50 facilities, not 1. Which box breaks first?" | Guess. |
| 55–70 | Concept B: numbers first, then boxes | Worked estimate (table below). Consistency per operation: availability shown to drivers may be up to 5 s stale (cache); taking a spot must be strongly consistent (conditional update). Caching availability per facility; sharding bookings by `facility_id`; hotspot risk at a stadium facility. Observability: structured logs with `requestId` and `bookingId`; metrics on four decisions (allocation success rate, payment outcome mix, breaker state, outbox lag); SLOs such as 99.9% monthly availability (≈ 43 minutes of downtime in a 30‑day month) and p95 allocation latency under 200 ms. | Work through the table. |
| 70–90 | Apply B | Teams redo the estimate with their own assumptions, then name the first component that must change at 50×. | Compute. |
| 90–100 | Recap | Q1: Define a bounded context in one sentence. Q2: What does an ACL protect? Q3: Which load dominates in our system, and why? | Answer. |

| Quantity | Assumption / arithmetic | 1× | 50× |
| --- | --- | --- | --- |
| Spots | 40 facilities × 500 spots | 20,000 | 1,000,000 |
| Sessions per day | 4 per spot per day | 80,000 | 4,000,000 |
| User requests per day | ≈ 11 per session (5 searches, book, entry, exit, pay, 2 notifications) | 880,000 | 44,000,000 |
| User requests per second, average | per day ÷ 86,400 | ≈ 10 | ≈ 509 |
| User requests per second, peak hour | 20% of daily traffic in 1 hour ÷ 3,600 | ≈ 49 | ≈ 2,444 |
| Sensor heartbeats per second | 1 per spot per minute ÷ 60 | ≈ 333 | ≈ 16,667 |
| Booking storage per year | 300 bytes × sessions × 365 | ≈ 8.8 GB | ≈ 438 GB |

Reading: sensor traffic, not drivers, dominates at 50×, so the first box to add is a buffered ingestion queue that stores only status changes. All numbers are illustrative assumptions for teaching; teams must state and defend their own.

**Deliverable (L):** the context map and the team's own capacity table.

### Try it: numbers before boxes, and a module rule

Capacity arithmetic decides whether you need a bigger design at all, and a small graph check turns a module rule into something that can fail a build.

```java
import java.util.*;

public class Main {
    static long peakPerSecond(long facilities, long spotsEach, long turnsPerDay, long peakFactor) {
        long perDay = facilities * spotsEach * turnsPerDay;
        return Math.round(Math.ceil((double) perDay / 86_400 * peakFactor));
    }

    static boolean hasCycle(Map<String, List<String>> deps) {
        Set<String> done = new HashSet<>();
        for (String module : deps.keySet())
            if (visit(module, deps, new HashSet<>(), done)) return true;
        return false;
    }

    private static boolean visit(String m, Map<String, List<String>> deps, Set<String> path, Set<String> done) {
        if (path.contains(m)) return true;
        if (!done.add(m)) return false;
        path.add(m);
        for (String next : deps.getOrDefault(m, List.of()))
            if (visit(next, deps, path, done)) return true;
        path.remove(m);
        return false;
    }

    public static void main(String[] args) {
        System.out.println(peakPerSecond(200, 500, 4, 10));       // 47
        System.out.println(peakPerSecond(200 * 50, 500, 4, 10));  // 2315

        Map<String, List<String>> clean = Map.of(
                "booking", List.of("payment"), "payment", List.of("notification"));
        System.out.println(hasCycle(clean));                      // false

        Map<String, List<String>> tangled = Map.of(
                "booking", List.of("payment"), "payment", List.of("notification"),
                "notification", List.of("booking"));
        System.out.println(hasCycle(tangled));                    // true
    }
}
```

**Now change it:** Change the turnover to 8 cars a day. At what peak rate would one database stop being enough for you? Write down your assumption and its cost.

### Skill B — S22: capacity for 50× load, caching and sharding trade‑offs

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "At 2,444 requests per second, how many availability reads hit the database if we cache each facility's count for 5 s?" | Estimate. |
| 10–20 | Primer | 50× means 50 times today's assumed load; every number must trace back to a stated assumption. | — |
| 20–40 | Step 1: workload | Teams fix their own assumptions (facilities, spots, turnover, peak share, request mix). | Fill the workload sheet. |
| 40–60 | Step 2: caching and sharding options | Cache availability (TTL vs staleness); shard bookings by facility vs by vehicle (which queries become cross‑shard?); read replica for reports. | List benefit and cost of each. |
| 60–90 | Step 3: scaling plan | Require: peak RPS, storage per year, the bottleneck, the components added and why, consistency per operation, and the 4 metrics with alert thresholds. | Write the one‑page plan. |
| 90–100 | Recap + present | Teams present one assumption and its effect on the plan. | Present. |

**Deliverable (S22):** `docs/week11/capacity-plan.md` (worksheet + plan), reused as one of the six dossier artefacts in Week 12.
