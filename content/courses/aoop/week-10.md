---
title: "Correct across threads, transactions and two JVMs"
week: 10
co: "CO5"
description: "By Thursday the system enforces \"one vehicle, one active booking\" even when two transactions race, aggregates are drawn as transaction boundaries, and students can prove or disprove visibility between threads with happens‑before."
requirements: "NFR6"
lecture_topics: ["Java Memory Model, happens-before, and safe publication.", "Aggregates, transaction boundaries, isolation anomalies, and write skew."]
skill_focus: "Analyze a race/double-booking example and explain the fix."
labs: []
---

**Thread:** Monday's practical maps aggregates and shows a real isolation anomaly in a database → Tuesday's skill block analyses write skew and chooses a safeguard → Wednesday's lecture covers the Java Memory Model (correctness inside one JVM) and why it stops helping across two JVMs, where the database must hold the invariant → Thursday's skill block traces happens‑before timelines. This week the two skill sessions run in swapped order (S20 on Tuesday, S19 on Thursday), so write skew follows Monday's database work and happens‑before follows the JMM lecture.

### Practical — P10: transaction boundaries and isolation anomalies

Tooling: H2 in‑memory database via Maven (`com.h2database:h2`) and plain JDBC. If the lab cannot add the dependency, use the in‑memory fallback: a repository that stores a version per booking and rejects a save whose expected version is stale.

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Build check | — | Build green with H2 added. |
| 10–20 | Primer | A transaction groups changes that must succeed or fail together. Two gate kiosks in two JVMs share no Java locks, so Week 9's `synchronized` does not help them. | — |
| 20–40 | Step 1: related data changes | Which data must change together at check‑in? (Booking row, spot status, outbox message.) Which can lag? (Reports.) | List them. |
| 40–60 | Step 2: aggregate and repository mapping | Draw aggregates: `Booking` (root; refers to spot and vehicle by ID, not object), `SpotOccupancy` (per spot). Repository as a collection: `bookings.add(b)`, `bookings.byId(id)`. | Create the schema (below) and `JdbcBookingRepository`. |
| 60–90 | Step 3: transaction scenario | Two connections, auto‑commit off, READ COMMITTED, interleaved by hand in one test: both read "active bookings for KA01AB1234 = 0", both insert, both commit. | Write the test; observe 2 active bookings. Then add the `active_booking` table (vehicle as primary key) and show the second insert now fails. |
| 90–100 | Recap + present | Q: "Why did the database not stop this at READ COMMITTED?" (The two transactions wrote different rows.) | Commit `W10-P10`. |

```sql
CREATE TABLE booking (
  booking_id VARCHAR(40) PRIMARY KEY,
  vehicle_id VARCHAR(12) NOT NULL,
  spot_id    VARCHAR(8)  NOT NULL,
  status     VARCHAR(12) NOT NULL,
  version    INT         NOT NULL
);
-- Materialises the rule "one active booking per vehicle": the conflict becomes a key clash
CREATE TABLE active_booking (
  vehicle_id VARCHAR(12) PRIMARY KEY,
  booking_id VARCHAR(40) NOT NULL REFERENCES booking(booking_id)
);
CREATE TABLE spot (spot_id VARCHAR(8) PRIMARY KEY, status VARCHAR(16) NOT NULL, version INT NOT NULL);
-- Optimistic concurrency on a spot: succeeds only if nobody changed it since we read it
UPDATE spot SET status = 'OCCUPIED', version = version + 1 WHERE spot_id = ? AND version = ?;  -- expect 1 row
```

**Acceptance checks:** anomaly test shows 2 active bookings without the safeguard and a constraint violation with it; booking and outbox message are written in one transaction; the optimistic update returns 0 rows on a stale version and the service reports a conflict.

**Deliverable (P):** commit `W10-P10`, aggregate diagram (diagram of the week), the anomaly test output before and after.

### Skill A — S20: isolation anomalies and write skew

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Two transactions write different rows. Can they still break a rule together?" | Answer. |
| 10–20 | Primer | Business rule: each level keeps at least 2 ACCESSIBLE spots unreserved for walk‑ins. | — |
| 20–40 | Step 1: trace | Level 1 has 3 free ACCESSIBLE spots. T1 and T2 each read 3, each check 3 − 1 ≥ 2, each reserve a different spot, both commit. 1 is left. | Draw the two‑transaction timeline. |
| 40–60 | Step 2: name it | Same pattern as Monday's double booking per vehicle: read a set, decide, write to different rows. | Classify both as write skew; explain why row locks on the written rows do not help. |
| 60–90 | Step 3: choose a safeguard | Options: materialise the conflict in a `level_quota` row with a conditional `UPDATE ... SET accessible_free = accessible_free - 1 WHERE level_id = ? AND accessible_free > 2` (expect 1 row); `SELECT ... FOR UPDATE` on the level row; SERIALIZABLE. | Pick one, write the SQL and a test, justify the cost. |
| 90–100 | Recap + present | Teams present the timeline and the chosen safeguard. | Present. |

**Deliverable (S20):** `docs/week10/write-skew.md` with both timelines, the chosen safeguard and its cost, plus the committed test.

### Lecture — L19 + L20: Java Memory Model and safe publication; aggregates, isolation anomalies, write skew

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Thread A sets `stop = true`. Thread B loops `while (!stop)`. Must B ever stop?" | Answer. |
| 10–15 | Hook | Without `volatile` or a lock there is no guarantee: the JIT may hoist the read out of the loop. | — |
| 15–30 | Concept A: JMM and happens‑before | Happens‑before edges: program order; unlock → later lock of the same monitor; volatile write → later read of it; `Thread.start()`; `Thread.join()`; final fields after the constructor ends. No edge, no visibility guarantee. Unsafe publication: a `Facility` assigned to a plain static field may be seen half‑built. Four safe publication routes: static initialiser; volatile field or `AtomicReference`; final field of a properly constructed object; a field guarded by a lock (including concurrent collections). | Draw the edge list. |
| 30–50 | Apply A | Entrance LED board thread shows `freeCount` updated by gate threads and shows stale numbers. Teams diagnose and fix (`AtomicInteger`, or `volatile` only if there is a single writer). | Diagnose and fix. |
| 50–55 | Bridge | "Gate kiosks now run in two JVMs. Does `volatile` still protect us?" (No: the JMM is per JVM.) | — |
| 55–70 | Concept B: aggregates and isolation | Aggregate = consistency boundary = transaction boundary. Draw it with four questions: Which invariant must hold immediately? What changes together? What is the single entry point? Where is the hotspot? Repository = collection illusion; Unit of Work = commit related changes together. Anomalies vs ANSI levels: dirty read (prevented from READ COMMITTED up), non‑repeatable read (from REPEATABLE READ), phantom (SERIALIZABLE). Lost update and write skew: snapshot isolation stops lost update but allows write skew, which is check‑then‑act in SQL. Fixes without SERIALIZABLE: unique constraint, materialised conflict row, `SELECT ... FOR UPDATE`, conditional update. | Notes and the anomaly table. |
| 70–90 | Apply B | Show Monday's anomaly test; teams list three safeguards and the cost of each (contention, schema change, retries). | Compare safeguards. |
| 90–100 | Recap | Q1: Name 3 happens‑before edges. Q2: Why does write skew survive snapshot isolation? Q3: Give one fix that avoids SERIALIZABLE. | Answer. |

**Deliverable (L):** LED‑board fix and the safeguard comparison table.

### Try it: a lost update stopped by a version number

Two transactions read the same row. Without a check, the second write silently overwrites the first. Optimistic locking turns that into a visible conflict.

```java
public class Main {
    static final class SpotRow {
        int version = 0;
        String holder = null;

        /** Like: UPDATE spot SET holder = ?, version = version + 1 WHERE version = ? */
        boolean commitIfUnchanged(int versionRead, String newHolder) {
            if (version != versionRead) return false;
            holder = newHolder;
            version++;
            return true;
        }
    }

    public static void main(String[] args) throws Exception {
        SpotRow blind = new SpotRow();
        blind.holder = "car A";
        blind.holder = "car B";                       // car A's booking has vanished, with no error
        System.out.println(blind.holder);             // car B

        SpotRow row = new SpotRow();
        int readByA = row.version;
        int readByB = row.version;
        System.out.println(row.commitIfUnchanged(readByA, "car A"));  // true
        System.out.println(row.commitIfUnchanged(readByB, "car B"));  // false
        System.out.println(row.holder + " v" + row.version);          // car A v1

        int[] data = {0};
        Thread writer = new Thread(() -> data[0] = 42);
        writer.start();
        writer.join();                                // join() gives a happens-before edge
        System.out.println(data[0]);                  // 42
    }
}
```

**Now change it:** What should car B's code do after `false`? Add a retry that reads the row again. When should it give up?

### Skill B — S19: happens‑before across threads

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Is `i++` on a `volatile int` atomic?" | Answer. |
| 10–20 | Primer | Draw a two‑thread timeline with arrows for each happens‑before edge. | — |
| 20–40 | Step 1: programs 1–3 | Programs below. | Draw timelines; decide guaranteed or not. |
| 40–60 | Step 2: programs 4–6 | Programs below. | Same. |
| 60–90 | Step 3: fix and verify | For every "not guaranteed" program, write the corrected code and the edge that now makes it safe; apply the same review to the team's `OutboxRelay` and `CircuitBreaker`. | Correct and annotate. |
| 90–100 | Recap + present | One team presents program 4. | Present. |

<p class="worksheet-note">Worksheet: fill in the blank cells yourself, then compare with your team.</p>

| # | Program | Visible? |
| --- | --- | --- |
| 1 | Plain `boolean stop`; reader loops `while (!stop)` | <span class="fill"></span> |
| 2 | Same with `volatile boolean stop` | <span class="fill"></span> |
| 3 | Writer: `data = 42; ready = true;` (`ready` volatile). Reader: `if (ready) use(data);` | <span class="fill"></span> |
| 4 | Writer: `ready = true; data = 42;` (`ready` volatile) | <span class="fill"></span> |
| 5 | `Facility` with non‑final fields published through a plain static field | <span class="fill"></span> |
| 6 | Main thread builds the facility, then `t.start()` | <span class="fill"></span> |

**Deliverable (S19):** six annotated timelines, corrected code, and the review notes on `OutboxRelay` and `CircuitBreaker` in `docs/week10/happens-before.md`.
