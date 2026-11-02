---
title: "Time and Space Complexity Interview Guide: Big O, Recursion, and Common Mistakes"
description: A guide to time and space complexity covering Big O, loop and recursive complexity, auxiliary space, input size, and common mistakes in algorithm interviews.
category: Computer Science Fundamentals
tag:
  - Algorithms
head:
  - - meta
    - name: keywords
      content: time complexity,space complexity,Big O,recursive complexity,loop complexity,algorithm complexity,complexity analysis,algorithm interviews,LeetCode complexity
---

Complexity analysis is often the first checkpoint in an algorithm interview. The interviewer may not expect a formal proof, but they do expect you to explain how many times the code runs, how much extra space it uses, and what happens as the input grows.

One point to keep in mind: complexity analysis describes how resource use grows as the input size gets large; it doesn't give the exact runtime. `O(n)` isn't always faster than `O(nlogn)`. Constants, input size, cache behavior, and implementation details all affect real performance. In an interview, state the Big O growth rate first, then mention practical limits if relevant.

## What Interviewers Look For

- Determine time complexity from loops, recursion, and data structure operations.
- Distinguish auxiliary space from space used by the input itself.
- Explain when best-case, worst-case, and average-case complexity apply.
- Analyze recursive code with a recursion tree or by tracking subproblem sizes.
- Avoid assuming that `HashMap` operations, sorting, or heap operations are always `O(1)`.

## How to Explain Complexity in an Interview

Don't just state the result. Explain what the code does and how that leads to the complexity.

For example, consider Two Sum:

```text
Traverse the array once. For each element, query and update a HashMap. HashMap operations take O(1) on average, so the time complexity is O(n). The map stores up to n elements, so the extra space complexity is O(n) in the worst case.
```

This is a stronger answer than saying only `O(n)` because it shows how you reached the result. It also leaves room to discuss the worst case for a hash table if the interviewer asks.

## Common Complexity Classes

| Complexity | Common examples                                                        | Interview note                                    |
| ---------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| `O(1)`     | Array access by index, stack top operations, average hash table lookup | Hash tables can have a worse worst case           |
| `O(logn)`  | Binary search, heap sift-up or sift-down, balanced tree lookup         | Each step reduces the problem size                |
| `O(n)`     | One pass over an array, linked list, or string                         | Check whether the code really makes just one pass |
| `O(nlogn)` | Average quicksort, merge sort, heap sort                               | Common complexity for sorting                     |
| `O(n^2)`   | Nested loops, checking all pairs                                       | Consider whether it can be optimized              |
| `O(2^n)`   | Enumerating subsets, some backtracking problems                        | The search space grows exponentially              |
| `O(n!)`    | Permutations, brute-force traveling salesperson                        | Only suitable for small inputs                    |

Input size often hints at the complexity an algorithm can afford:

| Input size  | Usually acceptable complexity                |
| ----------- | -------------------------------------------- |
| `n <= 20`   | Exponential search, backtracking, bitmask DP |
| `n <= 100`  | Sometimes `O(n^3)`                           |
| `n <= 1000` | Often `O(n^2)`                               |
| `n <= 10^5` | `O(nlogn)` or `O(n)`                         |
| `n >= 10^6` | Usually close to `O(n)`                      |

These are guidelines, not strict rules. They can help you decide whether a brute-force approach is likely to time out.

## How to Analyze Loop Complexity

For a simple loop, count the number of iterations:

```java
for (int i = 0; i < n; i++) {
    // O(1)
}
```

This is `O(n)`.

For nested loops, count the actual iterations instead of just counting the levels:

```java
for (int i = 0; i < n; i++) {
    for (int j = i; j < n; j++) {
        // O(1)
    }
}
```

The inner loop runs `n + (n - 1) + ... + 1` times, or `n(n + 1) / 2`, so the complexity is `O(n^2)`.

If a loop variable doubles each time, the complexity is usually `O(logn)`:

```java
for (int i = 1; i < n; i *= 2) {
    // O(1)
}
```

Two-pointer loops are easy to misread:

```java
while (left < n && right < n) {
    if (needMoveRight()) {
        right++;
    } else {
        left++;
    }
}
```

Although this loop contains a condition, `left` and `right` only move forward. Each moves at most `n` times, so the total complexity is `O(n)`, not `O(n^2)`.

## How to Analyze Recursive Complexity

Start with two questions:

1. How many recursive subproblems are there at each level?
2. How much work happens at each level outside the recursive calls?

Binary search makes one recursive call on a problem half the size:

```java
int binarySearch(int[] nums, int target, int left, int right) {
    if (left > right) {
        return -1;
    }
    int mid = left + (right - left) / 2;
    if (nums[mid] == target) {
        return mid;
    }
    if (nums[mid] < target) {
        return binarySearch(nums, target, mid + 1, right);
    }
    return binarySearch(nums, target, left, mid - 1);
}
```

The recursion depth is `logn`, and each level does `O(1)` work. The time complexity is `O(logn)`, and the call stack uses `O(logn)` space.

Merge sort splits the input into two subproblems at each level. Merging takes `O(n)` total work per level, and there are `logn` levels, so its time complexity is `O(nlogn)`. The temporary array uses `O(n)` extra space.

Now consider ordinary recursive Fibonacci:

```java
int fib(int n) {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}
```

This is not `O(n)`: each call creates two more calls, and many subproblems are computed repeatedly. Its time complexity is close to `O(2^n)`. With memoization, each state is computed once, reducing the time complexity to `O(n)` and using `O(n)` space.

## What Counts as Space Complexity?

Space complexity measures extra space used while the algorithm runs. Common sources include:

- New arrays, hash tables, queues, or stacks.
- The recursive call stack.
- Temporary space for sorting or merging.
- The result set, depending on the problem requirements. You can clarify whether you're counting it in an interview.

An iterative linked list reversal uses only a few pointers, so its space complexity is `O(1)`. A recursive reversal doesn't create an explicit array, but its call stack can reach a depth of `n`, so its space complexity is `O(n)`.

## Common Mistakes

- Sorting isn't free. Sorting before a two-pointer scan usually makes the total time at least `O(nlogn)`.
- `HashMap` lookup is `O(1)` on average, but not necessarily in the worst case.
- Recursion can use call stack space even when it doesn't create a collection.
- Traversing an `m` by `n` matrix is usually `O(mn)`, not `O(n)`.
- A BFS queue isn't constant space; in the worst case it may hold many nodes from a level.
- Backtracking complexity often depends on the number of results, not just the recursion depth.

## Questions to Review

- Why does complexity analysis usually ignore constant factors?
- Is `O(n)` always faster than `O(nlogn)`?
- What are quicksort's average and worst-case time complexities?
- How do you calculate the space complexity of a recursive algorithm?
- Why are DFS and BFS usually `O(V + E)`?
- Why is hash table lookup `O(1)` on average?

## Recommended Practice Problems

- [704. Binary Search](https://leetcode.cn/problems/binary-search/)
- [912. Sort an Array](https://leetcode.cn/problems/sort-an-array/)
- [206. Reverse Linked List](https://leetcode.cn/problems/reverse-linked-list/)
- [200. Number of Islands](https://leetcode.cn/problems/number-of-islands/)

<!-- @include: @article-footer.snippet.md -->
