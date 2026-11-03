---
title: "Closest pair of points"
topic: 22
co: "CO3"
description: "Find the two nearest points among n points in the plane in O(n log n), instead of checking all n²/2 pairs: split by x, solve each half, then check only a thin strip around the dividing line."
outcomes: ["Explain the brute-force O(n²) method and why it is too slow", "Trace the divide-and-conquer algorithm: split, recurse, strip check", "Explain why each strip point needs to be compared with at most 7 others", "Derive the O(n log n) running time"]
reading: ["Textbook 1, §33.4 Finding the closest pair of points", "Reference book 1, §17.x (computational geometry)", "Textbook 5, Ch. on divide and conquer"]
videos: [{"title": "Coursera: Algorithmic Toolbox (divide and conquer)", "url": "https://www.coursera.org/learn/algorithmic-toolbox"}]
---

### Intuition

An air-traffic system tracks 10,000 aircraft and must find the two closest ones every second. Checking every pair is about 50 million distance calculations. Divide and conquer cuts this to roughly n log n ≈ 130,000.

1. Sort the points by x and draw a vertical line through the middle.
2. Find the closest pair in the left half and in the right half (recursively). Let δ be the smaller of the two distances.
3. The only pairs that could beat δ **cross the line** — and both points must lie within distance δ of it. Check just that narrow **strip**.

### How it works

**Strip check.** Take the points with |x − line| < δ, sorted by y. For each point, compare it only with the next points whose y is less than δ above it. A geometric packing argument shows that a δ × 2δ rectangle can hold at most 8 points that are δ apart, so **each point is compared with at most 7 others** — the strip costs O(n), not O(n²).

**Example:** points (2, 3), (12, 30), (40, 50), (5, 1), (12, 10), (3, 4).

| Step | Detail |
| --- | --- |
| sort by x | (2,3) (3,4) (5,1) (12,10) (12,30) (40,50) |
| split | left {(2,3), (3,4), (5,1)}, right {(12,10), (12,30), (40,50)}; the line is x = 12 (first point of the right half) |
| left best | (2,3)–(3,4), distance √2 ≈ 1.414 |
| right best | (12,10)–(12,30), distance 20 |
| δ | 1.414 |
| strip | points with \|x − 12\| < 1.414: (12,10) and (12,30); they are 20 apart (≥ δ), so no crossing pair is closer |
| answer | **(2, 3) and (3, 4), distance ≈ 1.414** |

### Python implementation

```python
from math import dist, inf


def brute(pts):
    best = (inf, None)
    for i in range(len(pts)):
        for j in range(i + 1, len(pts)):
            best = min(best, (dist(pts[i], pts[j]), (pts[i], pts[j])))
    return best


def closest_pair(points):
    """Return (distance, (p, q)) for the closest pair, in O(n log n)."""
    px = sorted(points)                              # by x
    py = sorted(points, key=lambda p: p[1])          # by y

    def solve(px, py):
        n = len(px)
        if n <= 3:
            return brute(px)
        mid = n // 2
        mid_x = px[mid][0]
        left = set(px[:mid])
        lpy = [p for p in py if p in left]           # keep both halves sorted by y
        rpy = [p for p in py if p not in left]
        best = min(solve(px[:mid], lpy), solve(px[mid:], rpy))
        strip = [p for p in py if abs(p[0] - mid_x) < best[0]]
        for i, p in enumerate(strip):                # each point vs. the next few above it
            for q in strip[i + 1:i + 8]:
                if q[1] - p[1] >= best[0]:
                    break
                best = min(best, (dist(p, q), (p, q)))
        return best

    return solve(px, py)


if __name__ == "__main__":
    pts = [(2, 3), (12, 30), (40, 50), (5, 1), (12, 10), (3, 4)]
    d, pair = closest_pair(pts)
    print(round(d, 3), pair)        # 1.414 ((2, 3), (3, 4))
```

(The code assumes distinct points; it keeps both halves sorted by y so each level costs O(n).)

### Complexity

| Method | Time |
| --- | --- |
| brute force (all pairs) | Θ(n²) |
| divide and conquer, re-sorting the strip at every level | T(n) = 2T(n/2) + O(n log n) = O(n log² n) |
| divide and conquer with presorting (as above) | T(n) = 2T(n/2) + O(n) = **O(n log n)** |

### Common mistakes

- **Comparing every pair in the strip.** The strip can contain all n points; only the next ≤ 7 by y are needed.
- **Strip width.** Include points within δ of the line on **both** sides (total width 2δ).
- **Sorting inside every call.** That adds a log factor; presort once and split the y-sorted list.
- **Forgetting the base case.** For 2 or 3 points, use brute force.

### Problems

1. Find the closest pair of (1, 1), (4, 5), (7, 7), (8, 2), (2, 9), (6, 3), (3, 4), (9, 8) by the divide-and-conquer method, showing δ and the strip at the top level.
2. **Lab:** generate 10⁵ random points and compare the running times of `brute` and `closest_pair` (try 10³ points for brute).
3. Explain with a picture why at most 8 points can sit in a δ × 2δ rectangle when every pair is at least δ apart.
4. Adapt the algorithm to points on a line (1-D). What is the simplest O(n log n) method there?
5. **Lab:** given cities with coordinates, report the two cities closest to each other.
