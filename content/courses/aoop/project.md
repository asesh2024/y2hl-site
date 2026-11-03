---
title: "The Smart Parking System project"
description: "Problem statement, functional and non-functional requirements, domain model and the 12-week build roadmap."
---

Students build the smart‑parking slice of Waypoint, the urban mobility and payments platform used across the course. A city operator runs several multi‑level parking facilities. Drivers find, reserve, enter, pay and exit. Spot sensors and number‑plate cameras report occupancy, and an external payment gateway takes the money. The system starts in Week 1 as 4 classes and ends in Week 12 as a modular monolith with an architecture dossier.

### Problem statement

> Design and build a Smart Parking System for a city operator with multi‑level facilities. A driver can reserve a compatible spot in advance or get one at the gate, enter, park, and exit after paying an exact fee. The system must never give one spot to two vehicles at the same time, must never charge a driver twice for one session, must keep working when the payment gateway is slow or down, and must be extendable (new vehicle types, new pricing rules, new allocation strategies) without editing unrelated code.

### Functional requirements

| ID | Requirement | First built in |
| --- | --- | --- |
| FR1 | Model facilities, levels and spots. Spot types: TWO\_WHEELER, COMPACT, LARGE, EV, ACCESSIBLE. | Week 1 |
| FR2 | Identify a vehicle by its registration number and type (BIKE, CAR, SUV, BUS, EV\_CAR). | Week 1 |
| FR3 | Allocate a compatible free spot using a replaceable allocation strategy. | Week 3 |
| FR4 | Create a booking: RESERVED (advance) or ACTIVE (walk‑in), with an entry time and a ticket. | Week 1 |
| FR5 | Move a booking through its life cycle: RESERVED → ACTIVE → COMPLETED, or RESERVED → CANCELLED / EXPIRED. | Week 6 |
| FR6 | Calculate the exit fee exactly (paise), using pluggable pricing rules: hourly slabs, EV rate, weekend discount, student discount. | Week 2, Week 6 |
| FR7 | Take payment through an external gateway; a repeated request must not charge twice. | Week 7 |
| FR8 | Cancel a reservation and refund (compensation). | Week 8 |
| FR9 | Notify drivers (SMS/e‑mail) without losing or duplicating messages. | Week 8 |
| FR10 | Report occupancy and revenue per facility and day. | Week 6 |

### Non‑functional requirements (the design drivers)

| ID | Requirement | Verified in |
| --- | --- | --- |
| NFR1 | Correctness: no object can exist in an illegal state (negative fee, booking without vehicle, exit before entry). | Weeks 1–2 |
| NFR2 | Substitutability: every allocator passes one shared contract‑test suite. | Week 4 |
| NFR3 | Changeability: adding a new vehicle type or pricing rule touches at most 2 files. | Weeks 5–6 |
| NFR4 | Reliability: with 30% injected gateway failures, zero double charges. | Week 8 |
| NFR5 | Concurrency: 100 concurrent requests for the last free spot produce exactly 1 booking. | Week 9 |
| NFR6 | Consistency: a vehicle never holds two active bookings, even across two JVMs or transactions. | Week 10 |
| NFR7 | Scalability: a capacity plan for 50× today's load, with the arithmetic shown. | Week 11 |
| NFR8 | Modularity: architecture tests fail the build if a module boundary is crossed. | Week 11 |

### Domain model (Week 1 version, extended each week)

| Type | Kind | Key invariants (written as sentences in Week 1) |
| --- | --- | --- |
| `Vehicle` | Entity (identity = `VehicleId`) | A vehicle always has a valid registration number and a type. |
| `ParkingSpot` | Entity (`SpotId`) | A spot has one type; it is either FREE, RESERVED, OCCUPIED or OUT\_OF\_SERVICE, never two at once. |
| `Level`, `Facility` | Entities | A facility's spot list cannot be changed from outside the facility. |
| `Booking` | Entity (`BookingId`), later the aggregate root | A booking always refers to one vehicle and one spot; exit time is never before entry time; a COMPLETED booking has a fee. |
| `Money` | Value object | Amount is in paise (`long`), currency is never null, Money is immutable. |
| `VehicleId`, `SpotId`, `BookingId`, `TicketId` | Value objects (typed IDs) | Never null or blank; a `SpotId` cannot be passed where a `VehicleId` is expected. |
| `TimeWindow` | Value object | start < end. |

### Package structure the repository grows into

```text
smart-parking/
  pom.xml
  docs/week01 … docs/week12        (skill deliverables, UML, ADRs)
  src/main/java/edu/klef/aoop/parking/
    domain/          Money, typed IDs, Vehicle, ParkingSpot, Booking, BookingStatus (W1–W2)
    allocation/      SpotAllocator + strategies (W3–W4)
    pricing/         FeePolicy, PricingService (W5–W6)
    booking/         BookingService, BookingRepository port (W5–W7)
    payment/         PaymentGateway port, Result, failures (W7–W8)
    resilience/      RetryPolicy, CircuitBreaker (W8)
    notification/    Notifier port, Outbox (W8)
    infrastructure/  InMemory*/Jdbc* repositories, FakePaymentGateway, adapters (W5–W11)
    app/             Composition root: SmartParkingApp.main (W5)
  src/test/java/...  contract tests, chaos test, concurrency test, architecture tests
```

### 12‑week build roadmap

| Week | CO | Lecture | Practical | Skill A / Skill B | What the codebase gains |
| --- | --- | --- | --- | --- | --- |
| 1 | CO1 | L1 invariants and state space; L2 five doorways, tell‑don't‑ask | P1 project setup, core model, sentence invariants | S1 domain map and invariant catalogue; S2 single/multi/temporal invariants | `Vehicle`, `ParkingSpot`, `Booking` with validated constructors |
| 2 | CO1 | L3 Money as a value; L4 defensive copying, typed IDs, illegal states, collections | P2 defensive copying and immutable Money | S3 aliasing doorways; S4 typed IDs | `Money`, typed IDs, `Facility` with unmodifiable views |
| 3 | CO2 | L5 design by contract; L6 Liskov | P3 SpotAllocator contract | S5 pre/postconditions for allocate/release; S6 override‑rule violations | `SpotAllocator` + 2 strategies, contract in Javadoc |
| 4 | CO2 | L7 interface vs abstract vs sealed; L8 contract tests | P4 LSP and shared contract tests | S7 role interfaces, shared suites; S8 diagnosing contract errors | Abstract contract test, a saboteur allocator that gets caught |
| 5 | CO3 | L9 blast radius, DIP, composition root; L10 SOLID, creational and structural patterns | P5 dependency mapping and DIP | S9 cohesion matrix, change coupling; S10 delete‑the‑infrastructure test, Law of Demeter | Ports (`BookingRepository`, `PaymentGateway`, `Clock`), composition root |
| 6 | CO3 | L11 Strategy/Observer/State, booking state machine; L12 anti‑patterns, YAGNI, annotations | P6 God‑class teardown + behavioural pattern | S11 refactoring under characterisation tests; S12 lambdas, streams, annotations | `FeePolicy` strategies, `BookingStatus` transition table, reports |
| 7 | CO4 | L13 failure taxonomy, Result; L14 timeouts, idempotency | P7 explicit outcomes and idempotent booking | S13 sealed failure taxonomy; S14 retry policy design | `Result`, `BookingFailure`, idempotency keys |
| 8 | CO4 | L15 retries, backoff, breakers; L16 sagas, outbox, chaos | P8 retry, breaker, outbox | S15 compensation and sagas; S16 chaos test | `RetryPolicy`, `CircuitBreaker`, `Outbox`, chaos test |
| 9 | CO5 | L17 safe states, check‑then‑act; L18 locks, atomics, executors, deadlock | P9 race condition correction | S17 mutable‑field audit; S18 contention mechanisms | Thread‑safe allocation, 100‑thread test |
| 10 | CO5 | L19 Java Memory Model; L20 aggregates, transactions, write skew | P10 transaction boundaries and anomalies | S19 happens‑before; S20 write skew | Versioned repository / SQL constraints, one‑active‑booking rule |
| 11 | CO6 | L21 bounded contexts, ACL, modular monolith; L22 capacity, caching, sharding, SLOs | P11 architecture rules and tests | S21 anti‑corruption layer; S22 50× capacity plan | Module boundaries enforced by tests, payment ACL |
| 12 | CO6 | L23 architecture tests, HLD dossier, ADRs; L24 UML, CI, security, cost, mock review | P12 dossier and defence | S23 ADRs; S24 evidence pack and mock defence | HLD dossier, 6+ ADRs, recorded walkthrough |
