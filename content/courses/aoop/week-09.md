---
title: "Two cars, one spot: concurrency as design"
week: 9
co: "CO5"
description: "By Thursday 100 threads racing for the last free spot produce exactly one booking, every mutable field is classified as immutable, confined or guarded, and each team has chosen a locking approach from measured evidence."
requirements: "NFR5, plus closing Week 7's known gap (the idempotency map was not thread‑safe)"
lecture_topics: ["Immutable, confined, and guarded state; check-then-act errors.", "Locks, atomics, executors, and deadlock prevention."]
skill_focus: "Audit mutable fields: immutable, confined, or guarded."
labs: [{"number": 11, "title": "Thread Safety with synchronized", "aim": "Allow only one of two threads to reserve the same parking spot.", "tasks": ["Create a shared ParkingSpot object with a synchronized reserve method.", "Start two threads that attempt to reserve the same spot.", "Remove synchronized, run the program several times, and discuss why shared state needs protection."]}]
---

**Thread:** Monday's practical reproduces the double‑allocation race and fixes it → Tuesday's skill block audits every mutable field and turns the audit into a test → Wednesday's lecture explains the three safe states, check‑then‑act, and the tool kit (locks, atomics, executors, deadlock ordering) → Thursday's skill block measures alternative mechanisms and picks one from the numbers.

### Practical — P9: concurrency and race‑condition correction

Folded in from the lab manual: Lab 11 (shared `ParkingSpot` with a `synchronized` reserve method; two threads; remove `synchronized` and rerun several times).

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Build check | — | Build green. |
| 10–20 | Primer | Run Lab 11 with and without `synchronized`. Output order varies between runs (the manual's caution); the question is whether two threads can both succeed. | Run 10 times; record results. |
| 20–40 | Step 1: inspect shared mutable fields | Which objects are shared between gate threads? (`ParkingSpot.status`, the idempotency map, the outbox list, breaker counters.) | List them with the threads that touch each. |
| 40–60 | Step 2: reproduce check‑then‑act | Test harness: 1 free spot, 100 threads released together by a `CountDownLatch`, each calls `allocate(car)`; count successes. Repeat 50 times. | Write the test; see success counts above 1. |
| 60–90 | Step 3: apply protection | Make the check and the act one atomic step: `ParkingSpot.tryOccupy(vehicleId)` that returns false if not FREE (synchronized, or `AtomicReference.compareAndSet`); the allocator tries the next candidate on false. Make the idempotency map safe (code below). | Fix both; the race test must show exactly 1 success in all 50 repetitions. |
| 90–100 | Recap + test | Q: "50 green runs. Does that prove the code is correct?" (No: tests can show a race, not its absence; the argument is the atomic step.) | Commit `W9-P9`. |

```java
// Week 7's idempotency map, made safe: first caller computes, the rest wait for the same result
private final ConcurrentMap<RequestId, CompletableFuture<Result<Booking>>> inFlight = new ConcurrentHashMap<>();

public Result<Booking> book(BookingRequest req) {
    CompletableFuture<Result<Booking>> mine = new CompletableFuture<>();
    CompletableFuture<Result<Booking>> existing = inFlight.putIfAbsent(req.requestId(), mine);
    if (existing != null) return existing.join();
    try { mine.complete(doBook(req)); }
    catch (RuntimeException e) { mine.completeExceptionally(e); }
    return mine.join();
}
```

**Acceptance checks:** race test with exactly 1 success in 50 repetitions; duplicate‑request test with 20 threads returns one `BookingId`; no `synchronized` on methods that call the payment gateway (never hold a lock across a network call).

**Deliverable (P):** commit `W9-P9`, success counts before and after the fix, 3–5 lines on why shared state needs protection.

### Skill A — S17: mutable‑field audit (immutable, confined, guarded)

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Is a local variable inside a method shared between threads?" | Answer. |
| 10–20 | Primer | The audit makes the safe‑state rule checkable. Three annotations: `@Immutable`, `@Confined`, `@GuardedBy("lockName")`. | — |
| 20–40 | Step 1: inventory | List every non‑final, non‑static field in `src/main`. | Fill the audit sheet: class, field, threads that touch it. |
| 40–60 | Step 2: classify | For each field: which state, and why. Mark any field that fits none. | Classify. |
| 60–90 | Step 3: scan test | Extend the Week 6 reflection test: every non‑final field must carry one of the three annotations, or the build fails. Fix every unclassified field. | Write the scan test; fix fields until green. |
| 90–100 | Recap + present | One team explains one concurrency risk found. | Present. |

**Deliverable (S17):** `docs/week09/field-audit.md` (table), the scan test committed and green, and a UML sequence diagram of two threads racing for one spot (diagram of the week).

### Lecture — L17 + L18: the three safe states and check‑then‑act; locks, atomics, executors, deadlock

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "`if (spot.isFree()) spot.occupy(v);` Two threads run this. List one bad interleaving." | Write the interleaving. |
| 10–15 | Hook | Show Monday's success counts before the fix. | — |
| 15–30 | Concept A: three safe states | Every mutable field is immutable, confined to one thread, or guarded by a named lock, and every access respects that category. Check‑then‑act in its disguises: `if (!map.containsKey(k)) map.put(k, v)`, lazy initialisation, "read count, then write count + 1", and its database form (SELECT then INSERT, Week 10). The fix is always to make the check and the act one atomic operation. | Notes. |
| 30–50 | Apply A | Classify 8 fields from the codebase into the three states on the board; for each guarded field, name the lock. | Classify. |
| 50–55 | Bridge | "Atomic fixes one spot. What if one operation needs two spots?" | — |
| 55–70 | Concept B: tool kit | `synchronized` (simple, reentrant); `ReentrantLock` (`tryLock` with timeout); atomics (`AtomicReference.compareAndSet`, lock‑free, retry on conflict); executors with bounded queues as back‑pressure (`ThreadPoolExecutor` + `ArrayBlockingQueue(1000)` + `CallerRunsPolicy`); `CompletableFuture` for parallel independent calls (price quote and availability for the app). Deadlock: moving a car from spot A to B locks A then B while another move locks B then A; fix by always locking in `SpotId` order. Contention regime from evidence: rare collisions → optimistic (CAS, retry); a hot spot at peak → pessimistic lock or a single‑writer queue. | Notes. |
| 70–90 | Apply B | Code `moveVehicle(SpotId from, SpotId to)` with ordered locking; then a 2‑thread scenario on paper proving the unordered version can deadlock. | Code and trace. |
| 90–100 | Recap | Q1: Name the three safe states. Q2: Rewrite `if (!map.containsKey(k)) map.put(k, v)` atomically. Q3: How does lock ordering prevent deadlock? | Answer. |

**Deliverable (L):** field classification and `moveVehicle` with ordered locking.

### Try it: two cars, one spot

The race is forced with a barrier so it happens on every run: both threads pass the check before either one writes. The safe version makes the check and the write one atomic step.

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    static int unsafeWinners() throws Exception {
        ConcurrentMap<String, String> taken = new ConcurrentHashMap<>();
        AtomicInteger winners = new AtomicInteger();
        CyclicBarrier bothChecked = new CyclicBarrier(2);
        Runnable car = () -> {
            try {
                if (!taken.containsKey("L2-E07")) {   // check
                    bothChecked.await();              // both cars have now seen the spot as free
                    taken.put("L2-E07", "car");       // then act
                    winners.incrementAndGet();
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        };
        runBoth(car);
        return winners.get();
    }

    static int safeWinners() throws Exception {
        ConcurrentMap<String, String> taken = new ConcurrentHashMap<>();
        AtomicInteger winners = new AtomicInteger();
        Runnable car = () -> {
            if (taken.putIfAbsent("L2-E07", "car") == null) winners.incrementAndGet();
        };
        runBoth(car);
        return winners.get();
    }

    static void runBoth(Runnable car) throws Exception {
        Thread a = new Thread(car), b = new Thread(car);
        a.start();
        b.start();
        a.join();
        b.join();
    }

    public static void main(String[] args) throws Exception {
        System.out.println("check-then-act winners: " + unsafeWinners());  // check-then-act winners: 2
        System.out.println("putIfAbsent winners: " + safeWinners());       // putIfAbsent winners: 1
    }
}
```

**Now change it:** Would adding `synchronized` around the check and the write fix the unsafe version? Work out what the barrier would then do. Try it; if the program hangs, press **Stop** and explain why.

### Skill B — S18: contention with atomics, locks and CompletableFuture

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Which is faster, a lock or an atomic? Guess." | Guess. |
| 10–20 | Primer | It depends on the collision rate, so measure. Caveats: warm up first, repeat runs, report the median; laptop timings are rough and only valid for comparing on the same machine. | — |
| 20–40 | Step 1: implement 3 variants | `tryOccupy` with `synchronized`, `ReentrantLock`, `AtomicReference` CAS. | Code all three behind one interface. |
| 40–60 | Step 2: two scenarios | Scenario A: 8 threads, 400 spots, 10,000 allocations (low collision). Scenario B: 8 threads, 1 spot released and re‑taken 10,000 times (high collision). Record correctness, time and CAS failure rate. | Run each variant 5 times per scenario. |
| 60–90 | Step 3: decide | Pick a regime for the real system and write the decision with the numbers. Add a `CompletableFuture` example: fetch availability and price quote in parallel. | Write the comparison and decision. |
| 90–100 | Recap + present | Teams present the choice and one limitation of their measurement. | Present. |

**Deliverable (S18):** `docs/week09/contention.md` with the table (variant × scenario: correct?, median time, CAS failure rate) and the chosen regime with its justification.
