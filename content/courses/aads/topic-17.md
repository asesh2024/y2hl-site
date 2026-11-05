---
title: "Kruskal's minimum spanning tree"
keywords: "mst"
topic: 17
co: "CO2"
description: "Sort all edges by weight and take each one unless it would close a cycle. A union–find structure makes the cycle test almost free."
outcomes: ["Trace Kruskal's algorithm, listing accepted and rejected edges", "Implement union–find with union by rank and path compression", "State the running time O(E log E) and where it comes from", "Choose between Prim and Kruskal for a given graph"]
reading: ["Textbook 1, §23.2 Kruskal's algorithm and §21.1–21.3 Disjoint sets", "Textbook 2, §4.5 Minimum-cost spanning trees", "Textbook 3, §8 The disjoint set class and §9.5.2 Kruskal's algorithm"]
videos: [{"title": "NPTEL: Data Structures and Algorithms, IIT Delhi (minimum spanning trees)", "url": "https://archive.nptel.ac.in/courses/106/102/106102064/"}]
---

### Intuition

Prim grows one tree. **Kruskal** looks at the whole graph at once: sort every edge from cheapest to most expensive, and **accept an edge unless it connects two vertices that are already connected** (which would close a cycle). Early on you get many small pieces (a *forest*); accepted edges merge pieces until one tree remains.

The question "are u and v already connected?" is answered by a **union–find** (disjoint-set) structure: each piece is a set; `find(x)` names x's set, `union(a, b)` merges two sets.

### How it works

Same graph as topic 16 (A–B 4, A–C 3, B–C 1, B–D 2, C–D 4, C–E 5, D–E 7, D–F 6, E–F 2, E–G 3, F–G 4). Edges in sorted order:

| Edge | Weight | Same set already? | Action | Sets afterwards |
| --- | --- | --- | --- | --- |
| B–C | 1 | no | **accept** | {B,C} |
| B–D | 2 | no | **accept** | {B,C,D} |
| E–F | 2 | no | **accept** | {B,C,D}, {E,F} |
| A–C | 3 | no | **accept** | {A,B,C,D}, {E,F} |
| E–G | 3 | no | **accept** | {A,B,C,D}, {E,F,G} |
| A–B | 4 | yes | reject (cycle) | |
| C–D | 4 | yes | reject (cycle) | |
| F–G | 4 | yes | reject (cycle) | |
| C–E | 5 | no | **accept** | {A,…,G} — done |

Six edges accepted, total **1 + 2 + 2 + 3 + 3 + 5 = 16** — the same MST that Prim found. The remaining edges (D–F 6, D–E 7) are never needed; you can stop once V − 1 edges are accepted.

**Union–find tricks:**

- **union by rank:** attach the shorter tree under the taller one, so trees stay shallow;
- **path compression:** during `find`, point every visited node straight at the root.

Together they make each operation run in **α(n)** amortised time — the inverse Ackermann function, which is at most 4 for any input that fits in the universe.

### Python implementation

```python
class DisjointSet:
    def __init__(self, items):
        self.parent = {x: x for x in items}
        self.rank = {x: 0 for x in items}

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])   # path compression
        return self.parent[x]

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                                  # already in the same set
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra                              # union by rank
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        return True


def kruskal(vertices, edges):
    ds, mst, total = DisjointSet(vertices), [], 0
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        if ds.union(u, v):                                # accept unless it closes a cycle
            mst.append((u, v, w))
            total += w
            if len(mst) == len(vertices) - 1:
                break
    return mst, total


if __name__ == "__main__":
    edges = [("A", "B", 4), ("A", "C", 3), ("B", "C", 1), ("B", "D", 2), ("C", "D", 4), ("C", "E", 5),
             ("D", "E", 7), ("D", "F", 6), ("E", "F", 2), ("E", "G", 3), ("F", "G", 4)]
    mst, total = kruskal("ABCDEFG", edges)
    print(mst)     # [('B', 'C', 1), ('B', 'D', 2), ('E', 'F', 2), ('A', 'C', 3), ('E', 'G', 3), ('C', 'E', 5)]
    print(total)   # 16
```

### Complexity

| Step | Time |
| --- | --- |
| sort the edges | **O(E log E)** = O(E log V) |
| E union–find operations | O(E · α(V)) — practically linear |
| total | **O(E log E)** |

**Prim or Kruskal?** Both give an MST. Kruskal is simple and great when the edges come as a list or the graph is sparse; Prim with a heap (or the O(V²) array version) suits dense graphs and adjacency structures.

### Common mistakes

- **Rejecting an edge just because one endpoint is already "used".** Reject only when **both** endpoints are in the **same** set.
- **Union without find.** Always union the **roots** returned by find, not the vertices themselves.
- **Forgetting ties.** Equal weights can be taken in any order; different orders may give different (but equally cheap) MSTs.
- **Running Kruskal on a directed graph.** MSTs are for undirected graphs; the directed version (arborescence) needs a different algorithm.

### Problems

1. Run Kruskal on the graph with edges P–Q 6, P–R 1, Q–R 5, Q–S 3, R–S 5, R–T 6, S–T 4, S–U 2, T–U 6, list accepted and rejected edges, and give the MST weight.
2. **Lab:** implement `DisjointSet` and use it to count the connected components after reading a list of friendships.
3. **Lab:** clustering — run Kruskal but stop when k sets remain; the result groups points into k clusters with maximum spacing.
4. Show that the heaviest edge on any cycle of a graph (if strictly heaviest) is in **no** MST.
5. Compare the number of union–find operations Kruskal performs with the number of heap operations Prim performs on the example graph.
