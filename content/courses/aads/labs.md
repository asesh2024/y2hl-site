---
title: "Lab programs"
description: "A companion to the 15 lab sessions (CO5): what each Pre-Lab, In-Lab and Post-Lab task asks, the topic pages to read first, hints on the approach, test cases checked by program, and viva practice."
---

### How to use this page

Each session in your lab workbook has three parts: a **Pre-Lab** task to finish before you come, an **In-Lab** task done in the session, and a **Post-Lab** task to finish afterwards, followed by a short **viva**. This page goes with the workbook. For every task it gives:

- **Read first:** the topic pages whose ideas and code you need;
- **Hint:** the approach, without the full program, so the thinking is still yours;
- **Test:** small inputs with answers that were checked by running code. Run your program on these before you submit.

The hints use Python, the language of the topic pages; the ideas carry over unchanged to C or Java. Where a test below differs from a sample in the workbook, the value here is the one confirmed by program; ask in the lab if you are unsure.

**A good habit for every lab:** for small inputs, also write a slow program that tries every possibility, and compare its answers with your fast one on a few hundred random inputs.

### At a glance

| Session | Theme | Read first |
| --- | --- | --- |
| 1 | Binary search trees | [1](topic-01.html) |
| 2 | AVL and red-black trees | [2](topic-02.html), [3](topic-03.html) |
| 3 | B-trees and hash tables | [5](topic-05.html) |
| 4 | String matching, scenario 1 | [9](topic-09.html), [10](topic-10.html) |
| 5 | String matching, scenario 2 | [9](topic-09.html) |
| 6 | Graph algorithms, scenario 1 | [12](topic-12.html), [13](topic-13.html), [15](topic-15.html), [16](topic-16.html) |
| 7 | Graph algorithms, scenario 2 | [13](topic-13.html), [15](topic-15.html)–[17](topic-17.html) |
| 8 | Network flow | [18](topic-18.html), [19](topic-19.html) |
| 9 | Divide and conquer, scenario 1 | [20](topic-20.html), [22](topic-22.html) |
| 10 | Divide and conquer, scenario 2 | [20](topic-20.html), [21](topic-21.html) |
| 11 | Greedy, scenario 1 | [23](topic-23.html) |
| 12 | Greedy, scenario 2 | [23](topic-23.html), [24](topic-24.html) |
| 13 | Dynamic programming, scenario 1 | [25](topic-25.html) |
| 14 | Dynamic programming, scenario 2 | [26](topic-26.html), [27](topic-27.html) |
| 15 | Backtracking and branch and bound | [28](topic-28.html)–[31](topic-31.html) |

### Session 1: Binary search trees

**Read first:** [Topic 1](topic-01.html).

**Pre-Lab: is this tree a BST?** Given the root of a binary tree, decide whether every node is larger than everything in its left subtree and smaller than everything in its right subtree.

- *Hint:* checking each node only against its two children is **not enough**. Pass down an allowed range (low, high) and narrow it as you go left or right. O(n).
- *Test:* the tree 4 with children 2 and 6, where 2 has a right child 5 → **No** (5 is in 4's left subtree).

**In-Lab: height of a BST.** Insert the given keys into a BST and return its height, counted in **edges** from the root to the deepest leaf.

- *Hint:* height(empty) = −1, height(node) = 1 + max(height(left), height(right)).
- *Test:* insert 3, 5, 2, 1, 4, 6, 7 → height **3** (path 3 → 5 → 6 → 7).

**Post-Lab: insert into a BST.** Insert values one by one and return the root.

- *Test:* after inserting, an inorder traversal must print the keys in sorted order.

**Viva practice:** What is the worst-case height of a BST with n keys, and which insertion order causes it? Why do search, insert and delete all cost O(h)? How is a BST different from an ordinary binary tree?

### Session 2: AVL and red-black trees

**Read first:** [Topic 2](topic-02.html), [Topic 3](topic-03.html).

**Pre-Lab.**

1. Return the height of an AVL tree and whether every node has balance factor −1, 0 or +1.
2. Check whether a coloured tree obeys the red-black rules: the root is black, no red node has a red child, and every root-to-leaf path has the same number of black nodes.

- *Hint:* do both in one post-order pass. Return (height, balanced?) or (black height, valid?) from each subtree.

**In-Lab.**

1. Build an AVL tree by inserting keys one at a time, and print the inorder traversal after each insertion.
2. Read keys into a BST and turn it into a valid red-black tree.

- *Hint:* the inorder output is always sorted, so print the **shape** too (preorder or level order) to check that rotations really happen. For task 2, inserting the keys one at a time into a red-black tree takes O(n log n).
- *Test:* inserting 20, 15, 25, 10, 5 causes one rotation (at the fifth insertion); the final preorder is 20 10 5 15 25.

**Post-Lab.**

1. Count the nodes on level k of an AVL tree.
2. Find the maximum depth of a red-black tree.

- *Hint:* use BFS by levels. In a red-black tree, the depth is at most 2 log₂(n + 1).

**Viva practice:** How is the balance factor computed, and which values trigger a rotation? Why does a red-black tree do fewer rotations than an AVL tree? Which of the two is better for lookup-heavy work, and which for insert-heavy work?

### Session 3: B-trees and hash tables

**Read first:** [Topic 5](topic-05.html). Hash tables are revision from your first data structures course.

**Pre-Lab.**

1. Build a B-tree of minimum degree t and answer range queries [l, r] in sorted order.
2. For a lowercase string and queries (X, Y), count the substrings of length ≥ 2 whose two ends are X and Y in either order.

- *Hint (1):* for a range query, go down only into the children whose key range overlaps [l, r].
- *Hint (2):* do not list substrings. Precompute the position lists of each letter; then each pair of positions with letters X and Y (or Y and X) gives one substring.
- *Test (1):* t = 3, keys 50 20 30 40 10 60 80 70 90 100, query [30, 70] → 30 40 50 60 70; query [10, 50] → 10 20 30 40 50.
- *Test (2):* "aacbb": (a, c) → **2**, (a, b) → **4**.

**In-Lab.**

1. A B-tree index for employee IDs that supports INSERT and SEARCH commands.
2. Ransom note: can the note be made from whole words of a magazine, each word used at most as many times as it appears?

- *Hint (2):* count the words of each with a hash table (Python's `collections.Counter`), then compare the counts. Words are case-sensitive. O(m + n).
- *Test (2):* magazine "give me one grand today night", note "give one grand today" → Yes. Magazine "two times three is not four", note "two times two is four" → No ("two" is needed twice). "attack at dawn" vs "Attack at dawn" → No.

**Post-Lab.** A library catalogue by ISBN in a B-tree; a student database in a hash table with your own collision handling (chaining or linear probing).

- *Test:* insert 1,000 random IDs, then check that every inserted ID is found and 1,000 other IDs are not.

**Viva practice:** Why are B-trees used for disk indexes rather than AVL trees? How does the minimum degree t change the height? Compare separate chaining with open addressing. What is the load factor, and when should a hash table grow?

### Session 4: String matching, scenario 1

**Read first:** [Topic 9](topic-09.html) (KMP), [Topic 10](topic-10.html) (Boyer–Moore). Rabin–Karp is described below.

**Pre-Lab.**

1. Validate 6-character codes with a character class for each position (for example, first character 1, 2 or 3).
2. Decide whether a sentence is a pangram (uses all 26 letters, ignoring case).

- *Hint (1):* one regular expression, `^[123][120][xs0][30Aa][xsu][.,]$`, or a loop that checks each position.
- *Test (1):* "12x3x." → valid. "31sA," → **invalid** (only 5 characters). "20u0s." → **invalid** (u is not allowed third). "10xAa." → invalid (a is not allowed fifth).
- *Test (2):* "the quick brown fox jumps over the lazy dog" → pangram. "We promptly judged antique ivory buckles for the prize" → not a pangram (no x).

**In-Lab.**

1. Rabin–Karp: return the first index where pattern P occurs in text T, or −1.
2. The length of the longest common substring of two strings, using KMP.

- *Hint (1):* compute a rolling hash h = (h·b + c) mod q for each window. When the hash equals the pattern's hash, compare the characters to rule out a collision.
- *Hint (2):* for every suffix of the shorter string, run KMP's prefix function on suffix + '#' + other string. The largest prefix value seen after the '#' is the longest match starting there.
- *Test (1):* T = "ababcabcabababd", P = "ababd" → **10**. T = "hello", P = "world" → −1.
- *Test (2):* "zohoinnovations" and "innov" → **5**.

**Post-Lab.** Count occurrences of a word in log text with Boyer–Moore; list all positions of a DNA pattern.

- *Test:* the pattern "ACG" in "ACGTACGTGACG" → [0, 4, 9]. A log with three lines that start with "ERROR" → 3.

**Viva practice:** Why is naive matching O(n·m) in the worst case? What does the KMP failure function store? What makes Boyer–Moore fast on long patterns over large alphabets? What goes wrong in Rabin–Karp if the modulus is small?

### Session 5: String matching, scenario 2

**Read first:** [Topic 9](topic-09.html).

**Pre-Lab: all occurrences with KMP.** Return every starting index (0-based) of the pattern in the text.

- *Test:* "ababcabcabababd" with "ababd" → [10]. "aaaaa" with "aa" → [0, 1, 2, 3] (matches may overlap).

**In-Lab: all occurrences with Rabin–Karp,** using modular arithmetic.

- *Hint:* precompute bᵐ⁻¹ mod q once, so each window update costs O(1).
- *Test:* "abracadabra" with "abra" → [0, 7]. Also test a pattern longer than the text → [].

**Viva practice:** When would you pick KMP over Rabin–Karp? How do repeated characters affect each algorithm? What should happen when the pattern is longer than the text? How would you measure Boyer–Moore's speed on different patterns?

### Session 6: Graph algorithms, scenario 1

**Read first:** [Topic 12](topic-12.html) (BFS, DFS), [Topic 13](topic-13.html) (Dijkstra), [Topic 15](topic-15.html) (Floyd–Warshall), [Topic 16](topic-16.html) (Prim).

**Pre-Lab: nearest exit in a building.** A grid has walls, free cells and exits. Find the fewest steps from the start to any exit.

- *Hint:* BFS from the start over the 4 neighbours of each cell. The first exit taken off the queue is the nearest. O(rows × cols).

**In-Lab.**

1. A minimum spanning tree for a road network between cities.
2. Is there a path between two intersections? Use BFS or DFS.

- *Test:* on the graph of Topic 16 your MST weight must match the one on that page. For path finding, test a disconnected graph too.

**Post-Lab: all-pairs shortest paths with Floyd–Warshall** on the graph in your workbook.

- *Hint:* print the matrix after each value of k and compare with the trace on Topic 15.

**Viva practice:** Why does BFS give shortest paths only when all edges have the same weight? What is the running time of DFS with adjacency lists? How does a priority queue speed up Dijkstra? How do Prim and Kruskal differ?

### Session 7: Graph algorithms, scenario 2

**Read first:** [Topic 13](topic-13.html), [Topic 15](topic-15.html)–[Topic 17](topic-17.html).

**Pre-Lab: railway network with Kruskal.** Print the edges in the order they are accepted or rejected, and the total cost.

- *Hint:* sort the edges by cost; union–find tells you when an edge would close a cycle.

**In-Lab: campus network with Prim** from an adjacency matrix. Print each step and the total cost.

- *Test:* Prim and Kruskal must give the **same total** on the same graph (the edges may differ when costs tie).

**Post-Lab: Dijkstra from a source s.** Print the shortest distances and the order in which vertices are finalised.

- *Test:* use the example graph on Topic 13 and compare the order with its trace table.

**Viva practice:** How does SSSP differ from APSP, and where is each used? How does Prim avoid cycles? Why is union–find the natural structure for Kruskal? How does the choice of data structure change the running time of each algorithm?

### Session 8: Network flow

**Read first:** [Topic 18](topic-18.html), [Topic 19](topic-19.html).

**Pre-Lab: maximum flow with Ford–Fulkerson.**

- *Test:* 4 nodes, edges 1→2 (100), 1→3 (100), 2→3 (1), 2→4 (100), 3→4 (100), s = 1, t = 4 → **200**.

**In-Lab.**

1. Maximum download speed from computer 1 to computer n, a max-flow problem.
2. The most days you can travel from room 1 to room n if each teleporter is used at most once in total. Print the routes.

- *Hint (2):* give every teleporter capacity 1. The max flow is the number of days. Each route comes from following edges with flow 1 from room 1, using each such edge only once.
- *Test (1):* 4 computers, links 1→2 (3), 2→4 (2), 1→3 (4), 3→4 (5), 4→1 (3) → **6**.
- *Test (2):* 6 rooms, teleporters 1→2, 1→3, 2→6, 3→4, 3→5, 4→6, 5→6 → **2** days (for example 1-2-6 and 1-3-4-6).

**Post-Lab: maximum dance pairs.** This is bipartite matching: source → each boy (capacity 1), boy → girl for each allowed pair (1), girl → sink (1).

- *Test:* 3 boys, 2 girls, pairs (1, 1), (1, 2), (2, 1), (3, 1) → **2** pairs, for example (1, 2) and (3, 1).

**Viva practice:** How do you read a minimum cut from the final residual graph? What does Ford–Fulkerson's running time depend on? What is the bottleneck of an augmenting path? Why does Edmonds–Karp use BFS?

### Session 9: Divide and conquer, scenario 1

**Read first:** [Topic 20](topic-20.html), [Topic 22](topic-22.html).

**Pre-Lab.**

1. The maximum subarray sum by divide and conquer.
2. The closest pair of points (topic 22).

- *Hint (1):* the best subarray lies in the left half, in the right half, or **crosses the middle**. The crossing case is the best suffix of the left half plus the best prefix of the right. O(n log n).
- *Test (1):* [−2, 1, −3, 4, −1, 2, 1, −5, 4] → **6** (from 4, −1, 2, 1). All negative, [−3, −1, −2] → −1.

**In-Lab.**

1. Trade union: in how many ways can the union split into two parts by removing one worker? This means counting the **articulation points** of the graph.
2. Flag unusual transactions in a stream by divide and conquer.

- *Hint (1):* a DFS with discovery times and low-links finds all articulation points in O(V + E). Check your answer by removing each vertex and counting components.
- *Hint (2):* there is no single correct rule, so state yours. For example, split the data recursively, compute the median of each part, and flag amounts more than three times the median.
- *Test (1):* 4 workers, links 2–0, 2–1, 2–3, 1–0 → **1** (only worker 2).

**Post-Lab: road segment lookup.** Use binary search on segments sorted by start location to find the segment that starts at a given place.

- *Hint:* define exactly what a query means before coding. Searching for start = "C" in the sample list should return C → D (20).

**Viva practice:** Write the recurrence of merge sort and solve it. What does the "combine" step do in each of today's problems? When is divide and conquer a poor choice? How does the closest-pair algorithm keep the strip check linear?

### Session 10: Divide and conquer, scenario 2

**Read first:** [Topic 20](topic-20.html), [Topic 21](topic-21.html).

**Pre-Lab.**

1. Count inversions with merge sort.
2. The k-th smallest element with median of medians.

- *Test (1):* [2, 4, 1, 3, 5] → **3**.
- *Test (2):* [7, 10, 4, 3, 20, 15], k = 3 → **7**.

**In-Lab.**

1. Quicksort's partition step: put the elements smaller than the pivot (arr[0]), then the pivot, then the larger ones, keeping their original order.
2. Painters: split boards (in order) among k painters so that the longest working time is as small as possible.

- *Hint (2):* binary search on the answer T between max(board) and sum(board). Check whether T is enough by greedily giving each painter consecutive boards until adding one more would exceed T.
- *Test (1):* [4, 5, 3, 7, 2] → 3 2 4 5 7.
- *Test (2):* boards 10 20 30 40, k = 2 → **60**.

**Post-Lab: longest common prefix** of a list of strings, by divide and conquer.

- *Test:* flower, flow, flight → "fl". dog, car → "" (empty).

**Viva practice:** State the Master theorem and apply it to T(n) = 2T(n/2) + n. Why does median of medians give a linear worst case? Compare the extra space of recursive and iterative merge sort.

### Session 11: Greedy, scenario 1

**Read first:** [Topic 23](topic-23.html).

**Pre-Lab.**

1. Rescue boats: each boat can rescue one person within distance D. Maximise the number rescued.
2. The cheapest path from a source to a destination using at most k edges.

- *Hint (1):* sort both lists and use two pointers. Match each boat with the leftmost person it can reach who is still unrescued.
- *Hint (2):* despite the session title, this is not greedy. Run Bellman–Ford for exactly k rounds, each round using the previous round's distances (topic 14).
- *Test (1):* boats 1 5 10, people 2 6 8 11, D = 2 → **3**.
- *Test (2):* edges 0→1 (4), 0→2 (3), 1→3 (2), 2→3 (5), from 0 to 3 with k = 2 → **6**.

**In-Lab.**

1. Flowers: each friend pays (number already bought + 1) × price. Find the minimum total cost.
2. Power plants along a line: suitable cities are marked 1. Find the fewest plants covering every city, or −1.

- *Hint (1):* the most expensive flowers should get the smallest multipliers, so sort in decreasing order and give the i-th flower multiplier ⌊i / k⌋ + 1.
- *Hint (2):* for the leftmost city not yet covered, build at the **farthest** suitable city that still reaches it.
- *Test (1):* k = 3, prices 2 5 6 → **13**.
- *Test (2):* [0, 1, 1, 1, 1, 0], k = 2 → **2**. [0, 1, 1, 1, 0, 0, 0], k = 3 → −1.

**Post-Lab: job sequencing with deadlines.** Unit-time jobs; maximise profit.

- *Hint:* take the jobs in decreasing order of profit and put each in the latest free slot before its deadline.
- *Test:* a (2, 100), b (1, 19), c (2, 27), d (1, 25), e (3, 15) → c, a, e with profit **142**.

**Viva practice:** What two properties must a problem have for greedy to be correct? Why does greedy solve the fractional knapsack but not the 0/1 knapsack? Give a coin system where greedy change-making fails.

### Session 12: Greedy, scenario 2

**Read first:** [Topic 23](topic-23.html), [Topic 24](topic-24.html).

**Pre-Lab.**

1. Candies: each child gets at least one candy, and a child with a higher score than a neighbour gets more candies than that neighbour. Find the minimum total.
2. A shop where a person's i-th purchase costs (i + 1) × price, shared among k friends. This is the same idea as the flowers task in session 11.

- *Hint (1):* two passes. Left to right, fix the left-neighbour rule; right to left, fix the right-neighbour rule, taking the maximum.
- *Test (1):* scores 1 2 3 4 → **10**. Scores 1 0 2 → 5.
- *Test (2):* 4 friends, prices 7 1 3 4 5 6 → **30**. The four dearest items cost 7 + 6 + 5 + 4 = 22 at ×1, then 3 and 1 cost 6 + 2 = 8 at ×2.

**In-Lab.**

1. The minimum absolute difference between any two elements.
2. Movies: the i-th movie watched (counting from 0) costs 2ⁱ × its energy. Find the minimum total energy.

- *Hint (1):* sort, then only neighbours need to be compared. O(n log n).
- *Hint (2):* watch the highest-energy movie first, so that it gets the smallest multiplier.
- *Test (1):* [3, −7, 0] → **3**. [−2, 2, 4] → 2.
- *Test (2):* energies 3, 2, 5 → order 5, 3, 2 → 5·1 + 3·2 + 2·4 = **19**. (With multiplier i + 1 instead of 2ⁱ, the answer would be 17.)

**Post-Lab: age groups.** Put people into groups where all ages in a group are within 2 years, using as few groups as possible.

- *Hint:* sort the ages, start a group at the youngest person not yet placed, and add everyone up to that age + 2.
- *Test:* 25 30 35 32 28 23 40 45 22 → [22, 23], [25], [28, 30], [32], [35], [40], [45] (7 groups).

**Viva practice:** Why is the greedy "start a group at the youngest" choice optimal? How does Huffman coding use the greedy choice? Why is TSP not solved by "always go to the nearest city"?

### Session 13: Dynamic programming, scenario 1

**Read first:** [Topic 25](topic-25.html).

**Pre-Lab and Post-Lab: Lego towers.** Using blocks of height 1, 2 and 5 cm, count the different towers of height N, where the order of blocks does not matter.

- *Hint:* this is coin-change counting. ways[0] = 1; for each block size b (outer loop), for s from b to N: ways[s] += ways[s − b]. Keeping the block loop **outside** is what makes the order not matter.
- *Test:* N = 7 → **6**. N = 8 → **7**: 1×8; 1×6 + 2; 1×4 + 2×2; 1×2 + 2×3; 2×4; 1×3 + 5; 1 + 2 + 5.

**In-Lab: equalise the feed stations.** In one round, add 1, 2 or 5 units to every station except one. Find the fewest rounds that make all stations equal.

- *Hint:* adding to all but one is the same as **taking away** from that one. So bring every station down to a common target, trying targets min, min − 1, …, min − 4, and count each difference with as few 5s, 2s and 1s as possible.
- *Test:* [1, 2, 7] → **3**. [2, 2, 3, 7] → 2. [1, 1, 5] → 2.

**Viva practice:** What are overlapping subproblems and optimal substructure? How do you choose the order of computation in a bottom-up table? Compare DP, greedy and divide and conquer on one example each.

### Session 14: Dynamic programming, scenario 2

**Read first:** [Topic 26](topic-26.html), [Topic 27](topic-27.html).

**Pre-Lab: length of the LCS** of two strings.

- *Test:* "abcde" and "ace" → **3**.

**In-Lab.**

1. Chocolates: the same "give 1, 2 or 5 to all but one" equalising problem as session 13.
2. Can string a become b by capitalising some lowercase letters and deleting all the other lowercase letters?

- *Hint (2):* let ok[i][j] mean that the first i characters of a can become the first j characters of b. A lowercase a[i] may be deleted or capitalised to match b[j]; an uppercase a[i] must match b[j].
- *Test (2):* "daBcd" → "ABC": **YES**. "AbcDE" → "AFDE": NO.

**Post-Lab: 0/1 knapsack.**

- *Test:* W = 5, weights 2 3 4 5, values 3 4 5 6 → **7** (the first two items).

**Viva practice:** Why can plain recursion overflow the stack where a bottom-up table does not? How can the knapsack table be reduced to one row, and why must the loop run downwards? Describe a problem where greedy fails but DP succeeds.

### Session 15: Backtracking and branch and bound

**Read first:** [Topic 28](topic-28.html)–[Topic 31](topic-31.html).

**Pre-Lab: count the N-Queens placements.**

- *Test:* N = 4 → **2**; N = 6 → 4; N = 8 → 92.

**In-Lab: smallest set of artifacts covering all properties.** This is the *set cover* problem, which is NP-hard.

- *Hint:* backtrack over the artifacts with the number chosen so far as the cost. Prune when the cost already equals the best found, or when the properties still missing cannot be covered by the remaining artifacts. Try artifacts with many new properties first.
- *Test:* 6 properties; artifacts {0, 1, 2}, {0, 3}, {0}, {0, 3, 4, 5}, {1, 3, 5} → **2** (the first and the fourth).

**Post-Lab: dice.** Count the ways that k rolls of a six-sided die add up to N.

- *Hint:* backtracking works, with pruning when the running sum is already too large or too small. A DP over (rolls, sum) is faster.
- *Test:* k = 2, N = 10 → **3** (4 + 6, 5 + 5, 6 + 4).

**Viva practice:** What is the general shape of a backtracking procedure? How does a bounding function remove subtrees? How does branch and bound differ from backtracking? What is the state space tree for the dice problem?
