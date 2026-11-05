---
title: "Failure as a design concern: outcomes and idempotency"
week: 7
co: "CO4"
description: "By Thursday every booking operation returns an explicit outcome, each failure is classified with a planned response, and submitting the same booking request twice creates exactly one booking."
requirements: "FR4, FR7 (prepared), NFR4 (started)"
lecture_topics: ["Failure categories and Result-style control flow.", "Timeouts, unknown outcomes, and idempotency."]
skill_focus: "Classify failures and choose retry, return-error, or stop."
labs: [{"number": 7, "title": "Exceptions and Safe Booking", "aim": "Reject booking requests with invalid vehicle numbers or unavailable spots.", "tasks": ["Create a custom BookingException.", "Validate vehicle number, spot number, and spot availability in BookingService.", "Test valid and invalid booking requests and observe the messages."]}, {"number": 10, "title": "Idempotency and Duplicate Booking Requests", "aim": "Return the existing booking when the same request ID is submitted twice.", "tasks": ["Store bookings by request ID using a Map.", "Return the existing booking when a duplicate request ID is received.", "Submit a different request ID and explain why request IDs should be unique."]}]
---

**Thread:** Monday's practical replaces ad‑hoc exceptions with `Result` and makes booking idempotent → Tuesday's skill block classifies 12 Smart Parking failures → Wednesday's lecture gives the theory: three species of failure, why a timeout is an unknown outcome, and four idempotency techniques → Thursday's skill block designs the retry policy that Week 8 implements.

### Practical — P7: explicit outcomes and idempotent booking

Folded in from the lab manual: Lab 7 (custom `BookingException`; validate vehicle number, spot number and availability) as the starting point, and Lab 10 (store bookings by request ID; return the existing booking for a duplicate ID).

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Build check | — | Build green. |
| 10–20 | Primer | Run Lab 7's `BookingException` version. Ask: "Is 'lot full' an error or a normal answer?" Then simulate a driver tapping "Book" twice on a slow network: two bookings appear. | Note both problems. |
| 20–40 | Step 1: success and failure representation | Introduce `Result` and the sealed `BookingFailure` (below). Expected outcomes become `Err`; programmer errors stay unchecked exceptions. | Convert `BookingService.book(...)` to return `Result<Booking>`. |
| 40–60 | Step 2: find duplicates | The client sends a `RequestId` (UUID) with every booking request. | Write a failing test: same `RequestId` twice → two bookings. |
| 60–90 | Step 3: implement idempotency | Store `Map<RequestId, Booking>`; a repeat returns the stored booking; the same ID with a different vehicle is rejected (`IdempotencyKeyReused`). Thread safety comes in Week 9, so note it as a known gap. | Implement; make the failing test pass; add tests for the reuse case and for all `BookingFailure` types. |
| 90–100 | Recap + submit | Q: "Why must the client, not the server, generate the request ID?" | Commit `W7-P7`. |

```java
public sealed interface Result<T> permits Result.Ok, Result.Err {
    record Ok<T>(T value) implements Result<T> {}
    record Err<T>(BookingFailure failure) implements Result<T> {}

    default <R> R fold(Function<T, R> onOk, Function<BookingFailure, R> onErr) {
        if (this instanceof Ok<T> ok) return onOk.apply(ok.value());
        return onErr.apply(((Err<T>) this).failure());
    }
}

public sealed interface BookingFailure
        permits NoSpotAvailable, InvalidVehicle, DuplicateActiveBooking,
                IdempotencyKeyReused, PaymentDeclined, PaymentOutcomeUnknown {}
public record NoSpotAvailable(VehicleType type) implements BookingFailure {}
// ... one record per failure, each carrying only the data the caller needs
```

**Acceptance checks:** no `catch (Exception e)`; lot‑full returns `Err(NoSpotAvailable)`, not an exception; duplicate request returns the same `BookingId`; reused key with a different payload is rejected.

**Deliverable (P):** commit `W7-P7`, test output for duplicate and failure cases, 3–5 lines on why request IDs must be unique.

### Skill A — S13: sealed failure taxonomy and Result control flow

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Should 'SMS provider down' fail a booking?" | Answer. |
| 10–20 | Primer | The skill plan's three responses: retry, return‑error, stop. | — |
| 20–40 | Step 1: classify | Rows 1–6 of the table below. | Fill species and response. |
| 40–60 | Step 2: classify | Rows 7–12. | Fill species and response. |
| 60–90 | Step 3: sealed hierarchy + flow | Map every "return‑error" row to a `BookingFailure` record; draw the control flow of `book()` with each branch (UML sequence diagram with `alt` fragments, diagram of the week). | Update the sealed hierarchy in code; draw the flow. |
| 90–100 | Recap + present | Compare tables across two teams; disagreements are discussed, not marked wrong. | Present. |

<p class="worksheet-note">Worksheet: fill in the blank cells yourself, then compare with your team.</p>

| # | Event | Species | Response |
| --- | --- | --- | --- |
| 1 | No compatible spot free | <span class="fill"></span> | <span class="fill"></span> |
| 2 | Invalid registration number | <span class="fill"></span> | <span class="fill"></span> |
| 3 | Vehicle already has an active booking | <span class="fill"></span> | <span class="fill"></span> |
| 4 | Card declined | <span class="fill"></span> | <span class="fill"></span> |
| 5 | Payment gateway timeout | <span class="fill"></span> | <span class="fill"></span> |
| 6 | Gateway returns 503 | <span class="fill"></span> | <span class="fill"></span> |
| 7 | `NullPointerException` in allocator | <span class="fill"></span> | <span class="fill"></span> |
| 8 | `checkOut` on a COMPLETED booking | <span class="fill"></span> | <span class="fill"></span> |
| 9 | Database connection refused | <span class="fill"></span> | <span class="fill"></span> |
| 10 | SMS provider down | <span class="fill"></span> | <span class="fill"></span> |
| 11 | Disk full on the server | <span class="fill"></span> | <span class="fill"></span> |
| 12 | Sensor says spot occupied, system says free | <span class="fill"></span> | <span class="fill"></span> |

**Deliverable (S13):** `docs/week07/failure-taxonomy.md` (table + reasons), updated sealed hierarchy committed, sequence diagram with failure branches.

### Lecture — L13 + L14: failure taxonomy and Result; timeouts, unknown outcomes, idempotency

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "The payment call timed out after 5 s. Was the driver charged?" | Answer yes / no / can't tell. |
| 10–15 | Hook | Discuss in pairs. | — |
| 15–30 | Concept A: three species of failure | (1) Expected outcome (lot full, card declined): part of the domain, return it as a value. (2) Programmer error (null passed, illegal transition): fail fast with an unchecked exception, never retry. (3) Transient infrastructure (timeout, 503, connection refused): may succeed later, so retry with limits. Checked vs unchecked is a design decision: use checked only when the caller can and must recover. | Notes. |
| 30–50 | Apply A | Sort 8 Smart Parking events into the three species on the board; for each, choose return‑value, exception, or retry. | Sort and justify. |
| 50–55 | Bridge | "A timeout belongs to which species?" (None cleanly: it is an unknown outcome.) | — |
| 55–70 | Concept B: unknown outcomes and idempotency | A timeout has three possible states: charged, not charged, unknown. Keep the booking PAYMENT\_PENDING; ask the gateway with the same key, or retry with the same key. Four common techniques to make an operation idempotent: (1) client‑supplied idempotency key with a stored result; (2) natural key or unique constraint (one active booking per vehicle); (3) conditional update ("check out only if ACTIVE", compare‑and‑set on a version); (4) absolute writes instead of increments ("set status = COMPLETED", not "count++"). | Notes. |
| 70–90 | Apply B | Design the idempotent pay‑at‑exit flow on the board: which key, who generates it, what is stored, what the second call returns. Choose a technique for each of `book`, `checkOut`, `pay`, `cancel`. | Draw the flow. |
| 90–100 | Recap | Q1: Name the three species. Q2: Why is a timeout not a failure? Q3: Which technique fits `checkOut`, and why? | Answer. |

**Deliverable (L):** the sorted failure list and the idempotent pay‑at‑exit flow with a technique chosen per operation.

### Try it: explicit outcomes and idempotent booking

A sealed `Result` makes the compiler check that every failure is handled, and an idempotency key means a retried request cannot charge twice.

```java
import java.util.*;

public class Main {
    sealed interface Result permits Ok, NoSpot, Declined {}
    record Ok(String bookingId) implements Result {}
    record NoSpot(String type) implements Result {}
    record Declined(String reason) implements Result {}

    static String describe(Result r) {
        return switch (r) {                 // no default: the compiler checks every case
            case Ok ok -> "booked " + ok.bookingId();
            case NoSpot n -> "no " + n.type() + " spot free";
            case Declined d -> "payment declined: " + d.reason();
        };
    }

    static final class BookingDesk {
        private final Map<String, Result> byKey = new HashMap<>();
        int charges = 0;

        Result book(String idempotencyKey) {
            return byKey.computeIfAbsent(idempotencyKey, key -> {
                charges++;
                return new Ok("B-" + charges);
            });
        }
    }

    public static void main(String[] args) {
        System.out.println(describe(new NoSpot("CAR")));          // no CAR spot free
        System.out.println(describe(new Declined("card")));       // payment declined: card

        BookingDesk desk = new BookingDesk();
        System.out.println(describe(desk.book("req-1")));         // booked B-1
        System.out.println(describe(desk.book("req-1")));         // booked B-1
        System.out.println(desk.charges);                         // 1
    }
}
```

**Now change it:** Add `record Duplicate(String key) implements Result {}` and put `Duplicate` in the `permits` list. Read the compile error. Why is that error a good thing?

### Skill B — S14: retries with exponential backoff, jitter and budgets

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Each of 3 layers retries 3 times. One user tap → how many calls reach the gateway in the worst case?" | Compute. |
| 10–20 | Primer |  Retries multiply; retry at one layer only. | — |
| 20–40 | Step 1: limits and backoff | Base 200 ms, multiplier 2, cap 3 s, 4 attempts. Delays: 200, 400, 800 ms. With a 2 s timeout per attempt the worst case is 4 × 2 + 1.4 = 9.4 s. Is that acceptable at a gate barrier? | Recompute for your own numbers. |
| 40–60 | Step 2: jitter and budgets | Full jitter: delay = random(0, min(cap, base × 2^attempt)), so 1,000 gates do not retry in the same instant after an outage. Retry budget: retries ≤ 10% of requests in a 10 s window; above that, stop retrying. When to stop: expected outcomes and programmer errors are never retried. | Write the stop rules. |
| 60–90 | Step 3: the policy | Require a one‑page policy for the payment call: what is retried, attempts, delays, timeout, budget, what happens when retries run out. | Write `docs/week08/retry-policy.md` and a retry timeline. |
| 90–100 | Recap + review | One team presents; others challenge one number. | Present. |

**Deliverable (S14):** retry policy document with worked numbers, used as the specification for Monday's Week 8 practical.
