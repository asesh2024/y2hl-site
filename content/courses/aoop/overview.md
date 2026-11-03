---
title: "Course overview"
description: "What the course teaches, the six course outcomes, the module syllabus and the reading list."
---

Advanced Object‑Oriented Programming is a twelve‑week, project‑based course in software design (low‑level and high‑level design), not in Java syntax. Its motto: **"Design is what you can change on a Tuesday."** You learn the decisions that decide whether next quarter's requirement costs two files or two weeks, and you practise pricing every decision out loud.

Every week is a full build on one repository: the [Smart Parking System](project.html), a slice of *Waypoint*, an urban mobility and payments platform. Language topics such as generics, lambdas and streams, reflection, serialization and JVM behaviour are taught when a design problem needs them, not as separate chapters.

### Before you start

- **You should know:** Java 17+, classes and interfaces, using generics, collections and exceptions.
- **Tools:** JDK 17 or later (JDK 21 recommended), Eclipse or IntelliJ IDEA, Maven, JUnit 5 and Git. Basic SQL helps from Week 10.
- **Not assumed:** concurrency. It is taught from scratch in Weeks 9–10.
- **Out of scope:** data structures and algorithms, frameworks, front‑end work and DevOps tooling.

### Course outcomes

| CO | By the end you can… | Weeks |
| --- | --- | --- |
| CO1 | Model a domain as objects that enforce their own invariants, telling entities from values and eliminating illegal states. | 1–2 |
| CO2 | Specify and verify behavioural contracts (preconditions, postconditions, invariants) and detect substitutability violations. | 3–4 |
| CO3 | Measure and reduce the blast radius of change, and justify each abstraction by a named axis and a stated cost. | 5–6 |
| CO4 | Design systems that survive failure by classifying failures and applying idempotency, retries, breakers and compensation. | 7–8 |
| CO5 | Reason about correctness under concurrency and across processes, choosing a contention regime from evidence. | 9–10 |
| CO6 | Compose a system from bounded modules, derive its architecture from capacity estimates, and defend it under questioning. | 11–12 |

### Modules

**M1. Modelling I: objects that hold their shape (CO1).** What an object guarantees and how to write invariants as sentences. The five doorways that break guarantees (public setters, escaping references, mutable elements in "immutable" collections, constructors that validate nothing, equality that lies). Money as an exact, immutable value. Identity, equality and the hash contract. Defensive copying. Typed IDs and sealed hierarchies that make illegal states unrepresentable. Generics, variance and choosing collections by workload.

**M2. Modelling II: contracts before code (CO2).** Design by contract. The Liskov substitution principle stated precisely, and its four violation signals: throwing override, empty override, added precondition, `instanceof`. Interface, abstract class or sealed type. Role interfaces and shared contract tests with a saboteur that must be caught. Reading real JDK error messages as broken contract clauses.

**M3. The cost of change: coupling, SOLID and patterns (CO3).** Blast radius as a measurable design property. Coupling and cohesion. Dependency inversion, ports and adapters, and the composition root. SOLID applied rather than recited. Creational, structural and behavioural patterns, each chosen by problem shape and costed. Honest state machines. Anti‑patterns, YAGNI and refactoring under characterisation tests. Lambdas, streams, reflection and annotations where design needs them.

**M4. Failure as a design concern (CO4).** A sealed failure taxonomy: expected outcome, programmer error, transient infrastructure. Result types. Timeouts as unknown outcomes. Idempotency. Retries, backoff, jitter, budgets and circuit breakers. Compensation, sagas, the dual write and the outbox. A chaos test with 30% injected failures and zero double charges.

**M5. Runtime: concurrency, persistence and transactions (CO5).** The three safe states (immutable, confined, guarded). Check‑then‑act in all its forms. Locks, atomics, executors, `CompletableFuture` and deadlock ordering. The Java Memory Model and safe publication. Aggregates as transaction boundaries, isolation anomalies and write skew. Serialization as a published contract.

**M6. Architecture at scale: the capstone (CO6).** Bounded contexts and anti‑corruption layers. The modular monolith. Capacity estimation at 50× load, caching and sharding. Architecture tests. The high‑level design (HLD) dossier, architecture decision records (ADRs), UML, CI, security, data protection and a mock design review.

### Reading list

| # | Book | Author(s) |
| --- | --- | --- |
| 1 | *Effective Java* (3rd ed.) | Joshua Bloch |
| 2 | *A Philosophy of Software Design* (2nd ed.) | John Ousterhout |
| 3 | *Domain‑Driven Design* | Eric Evans |
| 4 | *Implementing Domain‑Driven Design* | Vaughn Vernon |
| 5 | *Design Patterns* | Gamma, Helm, Johnson and Vlissides |
| 6 | *Refactoring* (2nd ed.) | Martin Fowler |
| 7 | *Java Concurrency in Practice* | Brian Goetz et al. |
| 8 | *Release It!* | Michael T. Nygard |
| 9 | *Designing Data‑Intensive Applications* | Martin Kleppmann |

### Free online courses

- [Software Design and Architecture (Coursera specialization)](https://www.coursera.org/specializations/software-design-architecture)
- [Object‑Oriented Design (Coursera)](https://www.coursera.org/learn/object-oriented-design)
- [Design Patterns (Coursera)](https://www.coursera.org/learn/design-patterns)
- [Software Architecture (Coursera)](https://www.coursera.org/learn/software-architecture)
- [NPTEL course 106105153](https://nptel.ac.in/courses/106105153)
