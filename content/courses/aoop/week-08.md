---
title: "Surviving a bad gateway: retries, breakers, sagas and the outbox"
week: 8
co: "CO4"
description: "By Thursday the payment call retries within limits, a circuit breaker stops calls to a dead gateway, cancellations refund through compensation, notifications go through an outbox, and a chaos test with 30% injected failures shows zero double charges."
requirements: "FR7, FR8, FR9, NFR4"
lecture_topics: ["Retries, backoff, jitter, budgets, and circuit breakers.", "Compensation, sagas, dual writes, outbox, and chaos testing."]
skill_focus: "Draw idempotent retry and compensation flows for booking/payment."
labs: []
---

**Thread:** Monday's practical implements last Thursday's retry policy, a circuit breaker and an outbox → Tuesday's skill block designs the compensation sequence for reserve‑and‑prepay and cancellation → Wednesday's lecture explains retry storms, breaker states, sagas and the dual‑write problem → Thursday's skill block runs the chaos test and records the evidence.

### Practical — P8: retry strategy and recovery mechanism

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Build check | — | Build green. |
| 10–20 | Primer | Configure `FakePaymentGateway` (starter) with three failure modes: FAIL\_BEFORE\_CHARGE (503), CHARGE\_THEN\_TIMEOUT (charges, then times out), SLOW. Run 20 payments with 30% failures and count charges per key. | Observe the double charges. |
| 20–40 | Step 1: retry limit and backoff | Implement last Thursday's policy. Inject `Sleeper` and a seeded `Random` so tests run instantly and repeatably. Retries must reuse the same idempotency key. | Code `RetryPolicy` (sketch below); test attempts and delays. |
| 40–60 | Step 2: circuit breaker | States CLOSED → OPEN after 5 consecutive failures; OPEN for 30 s (from the injected `Clock`); then HALF\_OPEN; success closes, failure re‑opens. | Code `CircuitBreaker`; test every transition with `Clock` moved forward. |
| 60–90 | Step 3: outbox and recovery | Dual write: save booking, then send SMS. A crash between them loses or invents a message. Outbox: write the booking and an `OutboxMessage(PENDING)` in the same save; a relay sends PENDING messages and marks them SENT; the SMS adapter ignores message IDs it has already sent. | Code `Outbox`, `OutboxRelay`; test "crash after save, before send" by stopping the relay and restarting it. |
| 90–100 | Recap + record behaviour | Q: "Your retry generated a new idempotency key per attempt. What happens on CHARGE\_THEN\_TIMEOUT?" (Double charge.) | Record expected behaviour per failure mode; commit `W8-P8`. |

```java
public <T> T call(Supplier<T> op, Predicate<Throwable> retryable) {
    for (int attempt = 0; ; attempt++) {
        try { return op.get(); }
        catch (RuntimeException e) {
            if (!retryable.test(e) || attempt + 1 >= maxAttempts || !budget.tryAcquire()) throw e;
            long ceiling = Math.min(capMs, baseMs << attempt);
            sleeper.sleep(random.nextLong(ceiling + 1));          // full jitter
        }
    }
}

public final class CircuitBreaker {           // simplified: HALF_OPEN lets calls through until one result arrives
    enum State { CLOSED, OPEN, HALF_OPEN }
    private State state = State.CLOSED; private int failures; private Instant openedAt;
    public synchronized boolean allowRequest() {
        if (state == State.OPEN && !clock.instant().isBefore(openedAt.plus(openFor))) state = State.HALF_OPEN;
        return state != State.OPEN;
    }
    public synchronized void onSuccess() { failures = 0; state = State.CLOSED; }
    public synchronized void onFailure() {
        if (state == State.HALF_OPEN || ++failures >= threshold) { state = State.OPEN; openedAt = clock.instant(); }
    }
}
```

**Acceptance checks:** retry tests run in under 1 second (no real sleeping); breaker test covers all 4 transitions; same key on every attempt; outbox test proves no message is lost after a simulated crash.

**Deliverable (P):** commit `W8-P8`, expected‑behaviour table per failure mode, test screenshot.

### Skill A — S15: compensating transactions and sagas

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "List the steps of a prepaid reservation." | List them. |
| 10–20 | Primer | Transaction (all or nothing in one store) vs saga (many stores, undo by compensation). | — |
| 20–40 | Step 1: steps and compensations | For reserve‑and‑prepay: hold spot (undo: release hold); charge (undo: refund); confirm booking (undo: cancel booking); notify (no undo; retry via outbox). | Fill a step × compensation table. |
| 40–60 | Step 2: failure at each step | Walk through failure after each step: which compensations run, in what order? Include the timeout case (charge outcome unknown: reconcile before compensating). | Write one row per failure point. |
| 60–90 | Step 3: draw the saga | Require a UML sequence or activity diagram (diagram of the week) for success, failure after charge, and cancellation (FR8). | Draw; code `CancellationService` that refunds through `PaymentGateway.refund(key)`. |
| 90–100 | Recap + present | One team walks through "confirm fails after a successful charge". | Present. |

**Deliverable (S15):** `docs/week08/saga.md` with the compensation table and diagram; `CancellationService` with tests.

### Lecture — L15 + L16: retries and circuit breakers; compensation, sagas, outbox, chaos testing

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "The gateway is slow. 2,000 gates each retry 3 times. What load does the gateway now see?" | Estimate. |
| 10–15 | Hook | Up to 4× the load at the worst moment: retries turn a slow dependency into a dead one (a retry storm). | — |
| 15–30 | Concept A: retries and breakers | Retry only transient failures, at one layer, with backoff, jitter and a budget. Circuit breaker: CLOSED (calls pass, failures counted) → OPEN (fail fast, no calls) → HALF\_OPEN (trial call) → CLOSED or OPEN. Fix order when a dependency degrades: stop retrying first (budget), then fail fast (breaker), then serve a degraded mode (accept cash/UPI at the gate, collect payment later). | Draw the breaker state diagram. |
| 30–50 | Apply A | Review one team's Monday `RetryPolicy` and breaker on screen. Ask: what does the gate show the driver while the breaker is OPEN? | Propose the degraded mode. |
| 50–55 | Bridge | "The driver cancels a prepaid reservation. Can you delete the payment?" | Answer. |
| 55–70 | Concept B: undoing what cannot be undone | No: you refund (compensate). Saga = a sequence of local steps, each with a compensating step, run in reverse on failure. Put the hardest‑to‑undo step last. Dual write and the outbox: the outbox guarantees a message is sent at least once, so its consumer must be idempotent. Chaos test: 30% injected failure across three modes must produce zero double charges without slowing the happy path. | Notes. |
| 70–90 | Apply B | On the board: saga for reserve‑and‑prepay (hold spot → charge → confirm → notify) with a compensation for each step. Mark which step is the point of no return. | Draw and annotate. |
| 90–100 | Recap | Q1: The three breaker states and what triggers each move. Q2: Why must an outbox consumer be idempotent? Q3: Compensation for a successful charge? | Answer. |

**Deliverable (L):** breaker state diagram and the annotated saga.

### Try it: retry with backoff and a circuit breaker

A fake sleeper and a fake clock keep this instant and repeatable. Watch the wait double on each retry, then watch the breaker open, wait and recover.

```java
import java.util.*;
import java.util.function.*;

public class Main {
    static <T> T retry(Supplier<T> op, int maxAttempts, long baseMs, List<Long> waits) {
        for (int attempt = 0; ; attempt++) {
            try {
                return op.get();
            } catch (RuntimeException e) {
                if (attempt + 1 >= maxAttempts) throw e;
                waits.add(baseMs << attempt);      // real code sleeps a random time up to this ceiling
            }
        }
    }

    static final class CircuitBreaker {
        enum State { CLOSED, OPEN, HALF_OPEN }
        private State state = State.CLOSED;
        private int failures;
        private long openedAt;
        private final int threshold;
        private final long openForMs;

        CircuitBreaker(int threshold, long openForMs) { this.threshold = threshold; this.openForMs = openForMs; }

        boolean allowRequest(long now) {
            if (state == State.OPEN && now - openedAt >= openForMs) state = State.HALF_OPEN;
            return state != State.OPEN;
        }
        void onSuccess() { failures = 0; state = State.CLOSED; }
        void onFailure(long now) {
            if (state == State.HALF_OPEN || ++failures >= threshold) { state = State.OPEN; openedAt = now; }
        }
        State state() { return state; }
    }

    public static void main(String[] args) {
        int[] calls = {0};
        List<Long> waits = new ArrayList<>();
        String paid = retry(() -> {
            if (++calls[0] < 4) throw new RuntimeException("gateway timeout");
            return "paid";
        }, 5, 100, waits);
        System.out.println(paid + " after " + calls[0] + " calls");   // paid after 4 calls
        System.out.println(waits);                                    // [100, 200, 400]

        CircuitBreaker breaker = new CircuitBreaker(2, 1000);
        breaker.onFailure(0);
        breaker.onFailure(10);
        System.out.println(breaker.state());                          // OPEN
        System.out.println(breaker.allowRequest(500));                // false
        System.out.println(breaker.allowRequest(1010));               // true
        breaker.onSuccess();
        System.out.println(breaker.state());                          // CLOSED
    }
}
```

**Now change it:** Change the threshold to 3. What does the breaker's first printed state become, and why?

### Skill B — S16: chaos injection and duplicate‑charge prevention

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "What number proves we never double‑charge?" | Answer. |
| 10–20 | Primer | Chaos test design: 1,000 payments, fixed seed, 30% failures (10% per mode). Invariants checked at the end: charges per key ≤ 1; every booking is COMPLETED, CANCELLED or PAYMENT\_PENDING; reconciliation resolves every PAYMENT\_PENDING. | — |
| 20–40 | Step 1: failure points | Add notification failure as a fourth mode for the outbox. | List expected outcomes per mode. |
| 40–60 | Step 2: idempotent consumer | Show that the SMS adapter receiving the same outbox message twice sends once. | Write that test. |
| 60–90 | Step 3: run and record | Run the chaos test 5 times with different seeds; run once with failures off to get the happy‑path time. | Fill the expected vs observed table; fix any double charge found. |
| 90–100 | Recap + present | Teams report max charges per key and happy‑path time with and without the resilience code. | Present numbers. |

**Deliverable (S16):** `ChaosPaymentTest` committed, `docs/week08/chaos-report.md` with the expected vs observed table for 5 seeds. Report the seeds; these runs are repeated executions of one test, not independent experiments.
