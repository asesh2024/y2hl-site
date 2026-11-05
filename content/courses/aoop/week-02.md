---
title: "Money, defensive copies and typed IDs"
week: 2
co: "CO1"
description: "By Thursday fees are exact to the paise, no internal list can be changed from outside, and a SpotId can no longer be passed where a VehicleId is expected."
requirements: "FR1, FR6 (fee arithmetic), NFR1"
lecture_topics: ["Money as an immutable value: paise, currency, equality, and identity.", "Defensive copying and typed IDs.", "Illegal states and an overview of collections."]
skill_focus: "Classify examples as entity or value; explain equality and immutable Money."
labs: [{"number": 2, "title": "Encapsulation and Valid State", "aim": "Make sure a parking fee cannot be negative.", "tasks": ["Create a ParkingFee class with a private final amount.", "Validate the amount in the constructor and reject a negative fee.", "Try a negative fee and explain why the object rejects it."]}, {"number": 3, "title": "Immutable Values and Typed IDs", "aim": "Represent a booking ID and vehicle ID as different types.", "tasks": ["Create immutable VehicleId and BookingId classes.", "Validate that IDs are not null or blank.", "Add SpotId and explain why separate ID types are safer than using String for every ID."]}, {"number": 4, "title": "Collections and Generics", "aim": "Maintain a list of vehicles in the parking facility.", "tasks": ["Create a List<Vehicle> using ArrayList.", "Add vehicle objects and display the vehicle number and type.", "Count cars and remove a vehicle by matching its number."]}]
---

**Thread:** Monday's practical hits the `double` fee bug and the leaking spot list, then builds `Money` and safe collections → Tuesday's skill block hunts aliasing hazards across the codebase → Wednesday's lecture explains why `double` cannot hold a fare, entity versus value, the equals/hashCode contract and typed IDs → Thursday's skill block designs typed IDs and a state design with no illegal combinations (used in Weeks 3 and 6).

### Practical — P2: defensive copying and immutable Money

Folded in from the lab manual: Lab 2 (`ParkingFee` must not be negative) as the warm‑up, and Lab 4 (list of vehicles, count cars, remove by number) as the collection task.

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Build check | — | `git pull`, `mvn test` green. |
| 10–20 | Primer | Run Lab 2's `ParkingFee` with `double`. Then show: adding ₹0.10 ten times gives 0.9999999999999999, not 1.0. State the requirement: fees exact to the paise. | Run the snippet and record the output. |
| 20–40 | Step 1: find unsafe access | Give starter `Facility` (returns its internal `List<ParkingSpot>`; stores the caller's list without copying) and `Receipt` (stores the caller's `List<String>` line items). | Write one JUnit test per leak that proves outside code can change internal state. |
| 40–60 | Step 2: defensive copying + collections | Teach copy‑in (`List.copyOf`) and copy‑out (unmodifiable view); validate the copy, not the original. Lab 4 tasks become methods on `Facility`, not loops in `main`. | Fix the leaks; add `countByType(VehicleType)` and `removeVehicle(String registration)` on `Facility`; flip the leak tests to assert the leak is gone. |
| 60–90 | Step 3: Money | Specify `Money` (code below). Check `allocate` and overflow handling at each team. | Implement `Money`; write ≥ 8 tests: equality, immutability, currency mismatch, negative rejected, `allocate` sums back to the original. |
| 90–100 | Recap + submit | Q: "Your `Facility` returns `List.copyOf(spots)`. Can a caller still free an occupied spot?" (Yes: the elements are mutable. Tomorrow's skill topic.) | Commit `W2-P2`, push. |

```java
public final class Money implements Comparable<Money> {
    private static final Currency INR = Currency.getInstance("INR");
    private final long paise;            // never double
    private final Currency currency;

    private Money(long paise, Currency currency) {
        if (paise < 0) throw new IllegalArgumentException("Money cannot be negative: " + paise);
        this.paise = paise;
        this.currency = Objects.requireNonNull(currency, "currency");
    }
    public static Money ofPaise(long paise)   { return new Money(paise, INR); }
    public static Money ofRupees(long rupees) { return new Money(Math.multiplyExact(rupees, 100), INR); }

    public Money plus(Money o)  { same(o); return new Money(Math.addExact(paise, o.paise), currency); }
    public Money minus(Money o) { same(o); return new Money(Math.subtractExact(paise, o.paise), currency); }
    public Money times(long n)  { return new Money(Math.multiplyExact(paise, n), currency); }

    /** Splits into n parts that differ by at most 1 paisa and add up exactly to this amount. */
    public List<Money> allocate(int n) {
        if (n <= 0) throw new IllegalArgumentException("n must be > 0");
        long base = paise / n, extra = paise % n;
        List<Money> parts = new ArrayList<>(n);
        for (int i = 0; i < n; i++) parts.add(new Money(base + (i < extra ? 1 : 0), currency));
        return List.copyOf(parts);
    }
    private void same(Money o) {
        if (!currency.equals(o.currency)) throw new IllegalArgumentException("Currency mismatch");
    }
    @Override public boolean equals(Object x) {
        return x instanceof Money m && paise == m.paise && currency.equals(m.currency);
    }
    @Override public int hashCode() { return Objects.hash(paise, currency); }
    @Override public int compareTo(Money o) { same(o); return Long.compare(paise, o.paise); }
    @Override public String toString() { return String.format("₹%d.%02d", paise / 100, paise % 100); }
}
```

**Acceptance checks:** no `double` anywhere in fee code; `Money.ofPaise(100).allocate(3)` gives 34, 33, 33 paise; every leak test now proves the leak is closed; `Facility` exposes no mutable list.

**Deliverable (P):** commit `W2-P2`, green test screenshot, 3–5 lines on why `long` paise is safer than `double`.

### Skill A — S3: aliasing doorways and escaping references

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Two variables point to the same `ArrayList`. One calls `clear()`. What does the other see?" | Answer. |
| 10–20 | Primer | Draw an object diagram: `Facility.spots` and the caller's variable both pointing at one list. | Copy it. |
| 20–40 | Step 1: setters, escaping references, mutable elements | Walk through hazards 1–3 in the table below. | Fill rows 1–3 of the review sheet. |
| 40–60 | Step 2: attacks on Booking and ParkingSpot | Hazards 4–6. Ask for the one‑line attack for each. | Fill rows 4–6. |
| 60–90 | Step 3: review your own repo | Each team reviews its own Monday code for the same six hazards and fixes at least one with a test. | Complete the sheet; commit the fix. |
| 90–100 | Recap + peer review | One team presents a hazard and its fix. | Present / question. |

<p class="worksheet-note">Worksheet: fill in the blank cells yourself, then compare with your team.</p>

| # | Code | Doorway | Attack line | Fix |
| --- | --- | --- | --- | --- |
| 1 | `return spots;` | Escaping reference | <span class="fill"></span> | <span class="fill"></span> |
| 2 | `this.spots = spots;` in constructor | Aliasing on the way in | <span class="fill"></span> | <span class="fill"></span> |
| 3 | `List.copyOf(spots)` of mutable spots | Mutable element in immutable collection | <span class="fill"></span> | <span class="fill"></span> |
| 4 | `Booking` stores and returns a `java.util.Date` | Mutable field escapes | <span class="fill"></span> | <span class="fill"></span> |
| 5 | `public void setStatus(SpotStatus s)` | Public setter | <span class="fill"></span> | <span class="fill"></span> |
| 6 | Constructor calls `registry.register(this)` | `this` escapes during construction | <span class="fill"></span> | <span class="fill"></span> |

**Deliverable (S3):** completed review sheet in `docs/week02/aliasing-review.md`, one fixed hazard with its test, and a UML object diagram of one aliasing case.

### Lecture — L3 + L4: Money as a value, identity and equality, typed IDs, illegal states

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "What does `System.out.println(0.1 + 0.2)` print?" | Write a guess. |
| 10–15 | Hook |  Put one team's Monday `Money` on screen. | Compare with their own. |
| 15–30 | Concept A: Money is not a number | Binary expansion: 0.1 is 0.000110011… (repeating) in base 2, so a `double` stores the nearest value and errors accumulate. Options: `long` minor units or `BigDecimal`. Currency travels with the amount. Value objects are immutable. | Notes. |
| 30–50 | Apply A: entity vs value, equals/hashCode | Three questions for entity vs value: Does it keep its identity while its attributes change? Are two with the same attributes interchangeable? Do we track its history? Classify Booking, ParkingSpot, Money, TimeWindow. Demo the hash contract break below. | Classify; predict the demo output. |
| 50–55 | Bridge | "On Monday you returned `List.copyOf(spots)`. Who can still change a spot?" | Answer. |
| 55–70 | Concept B: defensive copying, typed IDs, illegal states | Copy in, copy out, validate the copy (time‑of‑check vs time‑of‑use). Typed IDs as records. Make illegal states unrepresentable: enums or sealed types instead of boolean flags. Collections by workload: `List` (order), `Set` (uniqueness), `Map` (lookup), `EnumMap` (count per spot type). One line on generics: `List<? extends ParkingSpot>` is read‑only for adding (PECS preview). | Notes. |
| 70–90 | Apply B: must‑not‑compile list | Show `book(String vehicleId, String spotId)` called with arguments swapped: it compiles and books the wrong thing. Teams write 4 calls that must fail to compile once typed IDs exist, and 2 that compile but must throw at run time. | Write the list. |
| 90–100 | Recap | Q1: Why paise as `long`? Q2: Is `ParkingSpot` an entity or a value, and why? Q3: If `a.equals(b)`, what must be true of their hash codes? | Answer. |

```java
// Equality that lies: equals/hashCode use the mutable status field
Set<Booking> open = new HashSet<>();
open.add(b);                 // stored in the bucket for status ACTIVE
b.checkOut(exitTime);        // status -> COMPLETED, so hashCode changes
open.contains(b);            // false: the booking is "lost" inside the set
// Rule: entities compare by ID only; values compare by all (immutable) fields.
```

**Deliverable (L):** exit ticket with the entity/value classification for 4 types and the team's must‑not‑compile list.

### Try it: exact money and a booking lost in a set

Three of this week's ideas in one program: money that splits exactly, a typed ID that refuses bad input, and an entity whose equality uses a mutable field.

```java
import java.util.*;
import java.util.regex.Pattern;

public class Main {
    record Money(long paise) {
        Money {
            if (paise < 0) throw new IllegalArgumentException("Money cannot be negative: " + paise);
        }
        static Money ofRupees(long rupees) { return new Money(Math.multiplyExact(rupees, 100)); }

        /** Splits into n parts that add up exactly to this amount. */
        List<Money> allocate(int n) {
            long base = paise / n, extra = paise % n;
            List<Money> parts = new ArrayList<>(n);
            for (int i = 0; i < n; i++) parts.add(new Money(base + (i < extra ? 1 : 0)));
            return List.copyOf(parts);
        }
        @Override public String toString() { return String.format("₹%d.%02d", paise / 100, paise % 100); }
    }

    record SpotId(String value) {
        private static final Pattern FORMAT = Pattern.compile("^L\\d{1,2}-[A-Z]\\d{2}$");
        SpotId {
            if (!FORMAT.matcher(value).matches()) throw new IllegalArgumentException("Bad SpotId: " + value);
        }
    }

    /** Wrong on purpose: equality depends on a field that changes. */
    static final class Booking {
        String status = "ACTIVE";
        @Override public boolean equals(Object o) { return o instanceof Booking b && status.equals(b.status); }
        @Override public int hashCode() { return Objects.hash(status); }
    }

    public static void main(String[] args) {
        System.out.println(Money.ofRupees(100).allocate(3));        // [₹33.34, ₹33.33, ₹33.33]
        System.out.println(new Money(150).equals(new Money(150)));  // true
        try {
            new SpotId("banana");
        } catch (IllegalArgumentException e) {
            System.out.println("Refused: " + e.getMessage());       // Refused: Bad SpotId: banana
        }
        Set<Booking> open = new HashSet<>();
        Booking b = new Booking();
        open.add(b);
        b.status = "COMPLETED";
        System.out.println(open.contains(b));                       // false
    }
}
```

**Now change it:** Give `Booking` a final `id` field and base `equals` and `hashCode` on it alone. What does the last line print now?

### Skill B — S4: typed IDs and illegal states made unrepresentable

Folded in from the lab manual: Lab 3 (immutable `VehicleId` and `BookingId`, then `SpotId`).

| Min | Step | In class | Your task |
| --- | --- | --- | --- |
| 0–10 | Do‑now | "Name a bug that happens when every ID is a `String`." | Answer. |
| 10–20 | Primer | Show the swapped‑argument bug from Wednesday. | — |
| 20–40 | Step 1: typed IDs | Show the record pattern below. Agree formats: `SpotId` like L2‑E07, `VehicleId` = registration, `BookingId` = "BK‑" + UUID, `TicketId` = "TK‑" + 8 digits. | Write the 4 records with validation. |
| 40–60 | Step 2: illegal states | Show that a `Booking` with status COMPLETED but no fee is still constructible. Sketch the alternative: `sealed interface BookingState permits Reserved, Active, Completed, Cancelled, Expired`, each a record holding only the data valid in that state (only `Completed` has exit time and fee). | Draw the sealed design as a UML class diagram. |
| 60–90 | Step 3: produce | Require the must‑not‑compile list as a file and the records in the repo. | Commit records + tests; replace `String` IDs in `Vehicle`, `ParkingSpot`, `Booking`. |
| 90–100 | Recap + peer review | Teams present which invalid states their design now prevents. | Present. |

```java
public record SpotId(String value) {
    private static final Pattern FORMAT = Pattern.compile("^L\\d{1,2}-[A-Z]\\d{2}$");   // e.g. L2-E07
    public SpotId {
        Objects.requireNonNull(value, "value");
        if (!FORMAT.matcher(value).matches()) throw new IllegalArgumentException("Bad SpotId: " + value);
    }
}
```

**Deliverable (S4):** commit `W2-S4` with 4 typed‑ID records and tests, `docs/week02/must-not-compile.md`, and the sealed `BookingState` class diagram (input to Week 6).
