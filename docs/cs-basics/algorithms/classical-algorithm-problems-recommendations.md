---
title: "Classic Algorithmic Techniques: LeetCode Problem Recommendations"
description: A guide to common algorithm patterns, including binary search, two pointers, sliding windows, DFS/BFS, backtracking, dynamic programming, greedy algorithms, divide and conquer, topological sorting, union-find, and bit manipulation.
category: Computer Science Fundamentals
tag:
  - Algorithms
  - LeetCode
  - Interviews
head:
  - - meta
    - name: keywords
      content: algorithm patterns,binary search,two pointers,sliding window,DFS,BFS,backtracking,dynamic programming,greedy,divide and conquer,topological sort,union-find,bit manipulation,LeetCode recommendations
---

Don't memorize algorithm patterns in isolation. In interviews, the more useful questions are: What clues suggest this pattern? Which parts of the template are easy to get wrong? If the interviewer changes a condition, which variable or state should you adjust first?

This problem list is organized by pattern. Each section covers recognition clues, common templates, representative problems, and review points. The list is intentionally focused: understanding these patterns is more useful than mechanically solving a larger number of problems.

## How to Use This Problem List

Don't try to solve every problem in order. First read the relevant template guide and make sure you can write the core code yourself. Then solve the core problems and use the advanced problems to check your handling of edge cases and variations.

| Goal                     | Suggested action                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build core templates     | Read the guides to [binary search](./binary-search.md), [two pointers and sliding windows](./two-pointers-and-sliding-window.md), and [DFS/BFS](./dfs-bfs.md).    |
| Strengthen search and DP | Read [backtracking](./backtracking.md) and [dynamic programming](./dynamic-programming.md), then write solutions to at least two basic problems for each.         |
| Review before interviews | Use [greedy algorithms](./greedy.md), [Top K problems](./top-k.md), and [union-find](../data-structure/union-find.md) to cover common variations.                 |
| Review your solutions    | Write down the pattern clues, the meaning of each key variable, the complexity, and edge cases. If you can't explain these, you haven't mastered the problem yet. |

## Binary Search

| Aspect            | Details                                                                                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recognition clues | Sorted arrays, monotonic conditions, boundary searches, or finding the smallest or largest feasible value                                                                                                               |
| Common templates  | Basic binary search, left boundary, right boundary, binary search on the answer                                                                                                                                         |
| Core problems     | [704. Binary Search](https://leetcode.cn/problems/binary-search/), [34. Find First and Last Position of Element in Sorted Array](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/) |
| Advanced problems | [35. Search Insert Position](https://leetcode.cn/problems/search-insert-position/), [875. Koko Eating Bananas](https://leetcode.cn/problems/koko-eating-bananas/)                                                       |
| Review points     | Loop condition, calculating `mid`, and whether boundary updates can cause an infinite loop                                                                                                                              |

## Two Pointers

| Aspect            | Details                                                                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recognition clues | Sorted arrays, in-place changes, pointers moving inward, or fast and slow pointers on a linked list                                                                                                     |
| Common templates  | Left and right pointers, fast and slow pointers, read and write pointers                                                                                                                                |
| Core problems     | [26. Remove Duplicates from Sorted Array](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/), [977. Squares of a Sorted Array](https://leetcode.cn/problems/squares-of-a-sorted-array/) |
| Advanced problems | [15. 3Sum](https://leetcode.cn/problems/3sum/), [142. Linked List Cycle II](https://leetcode.cn/problems/linked-list-cycle-ii/)                                                                         |
| Review points     | Keep each pointer's role clear, handle duplicate values, and sketch linked lists before changing pointers.                                                                                              |

## Sliding Window

| Aspect            | Details                                                                                                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recognition clues | Contiguous subarrays or substrings, longest or shortest ranges, or a condition on the current window                                                                                                                         |
| Common templates  | Fixed-size window, variable-size window, frequency map                                                                                                                                                                       |
| Core problems     | [3. Longest Substring Without Repeating Characters](https://leetcode.cn/problems/longest-substring-without-repeating-characters/), [209. Minimum Size Subarray Sum](https://leetcode.cn/problems/minimum-size-subarray-sum/) |
| Advanced problems | [76. Minimum Window Substring](https://leetcode.cn/problems/minimum-window-substring/), [438. Find All Anagrams in a String](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)                                    |
| Review points     | Know when to expand or shrink the window and how to maintain its state.                                                                                                                                                      |

## DFS and BFS

| Aspect            | Details                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Recognition clues | Tree or graph traversal, connected regions in a matrix, shortest number of steps, or level-order traversal                                                                           |
| Common templates  | Recursive DFS, iterative DFS with a stack, BFS with a queue, level-order BFS                                                                                                         |
| Core problems     | [102. Binary Tree Level Order Traversal](https://leetcode.cn/problems/binary-tree-level-order-traversal/), [200. Number of Islands](https://leetcode.cn/problems/number-of-islands/) |
| Advanced problems | [994. Rotting Oranges](https://leetcode.cn/problems/rotting-oranges/), [127. Word Ladder](https://leetcode.cn/problems/word-ladder/)                                                 |
| Review points     | Visited markers, boundary checks, and BFS level counting                                                                                                                             |

## Backtracking

| Aspect            | Details                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Recognition clues | Enumerating all solutions, choosing paths, combinations, permutations, subsets, or board constraints                         |
| Common templates  | A `path`, a set of choices, recursive levels, and undoing each choice                                                        |
| Core problems     | [77. Combinations](https://leetcode.cn/problems/combinations/), [78. Subsets](https://leetcode.cn/problems/subsets/)         |
| Advanced problems | [39. Combination Sum](https://leetcode.cn/problems/combination-sum/), [51. N-Queens](https://leetcode.cn/problems/n-queens/) |
| Review points     | Know what each recursive argument represents and whether pruning belongs before or inside the loop.                          |

## Dynamic Programming

| Aspect            | Details                                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Recognition clues | Finding an optimum, counting solutions, reachability, subsequences, knapsack problems, or merging intervals                                                                                      |
| Common templates  | One-dimensional DP, two-dimensional DP, rolling arrays, knapsack DP                                                                                                                              |
| Core problems     | [70. Climbing Stairs](https://leetcode.cn/problems/climbing-stairs/), [322. Coin Change](https://leetcode.cn/problems/coin-change/)                                                              |
| Advanced problems | [300. Longest Increasing Subsequence](https://leetcode.cn/problems/longest-increasing-subsequence/), [416. Partition Equal Subset Sum](https://leetcode.cn/problems/partition-equal-subset-sum/) |
| Review points     | Define `dp[i]`, initialization, iteration order, and whether the space can be reduced.                                                                                                           |

## Greedy Algorithms

| Aspect            | Details                                                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recognition clues | Choosing the locally best option at each step, often involving sorting, intervals, jumps, or buying and selling                                           |
| Common templates  | Select after sorting, track the farthest boundary, merge or cover intervals                                                                               |
| Core problems     | [455. Assign Cookies](https://leetcode.cn/problems/assign-cookies/), [55. Jump Game](https://leetcode.cn/problems/jump-game/)                             |
| Advanced problems | [45. Jump Game II](https://leetcode.cn/problems/jump-game-ii/), [435. Non-overlapping Intervals](https://leetcode.cn/problems/non-overlapping-intervals/) |
| Review points     | Explain why the greedy choice works and whether a counterexample disproves it.                                                                            |

## Divide and Conquer

| Aspect            | Details                                                                                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recognition clues | The problem can be split into smaller problems of the same kind, and their results can be combined                                                                                     |
| Common templates  | Split recursively, solve subproblems, combine results                                                                                                                                  |
| Core problems     | [108. Convert Sorted Array to Binary Search Tree](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/), [148. Sort List](https://leetcode.cn/problems/sort-list/) |
| Advanced problems | [23. Merge k Sorted Lists](https://leetcode.cn/problems/merge-k-sorted-lists/), [215. Kth Largest Element in an Array](https://leetcode.cn/problems/kth-largest-element-in-an-array/)  |
| Review points     | Base cases, whether the left and right ranges overlap, and merge complexity                                                                                                            |

## Topological Sort

| Aspect            | Details                                                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recognition clues | Course or task dependencies, directed acyclic graphs, or checking whether all tasks can be completed                                                 |
| Common templates  | Indegree array and queue, or three-color DFS                                                                                                         |
| Core problems     | [207. Course Schedule](https://leetcode.cn/problems/course-schedule/)                                                                                |
| Advanced problems | [210. Course Schedule II](https://leetcode.cn/problems/course-schedule-ii/), [269. Alien Dictionary](https://leetcode.cn/problems/alien-dictionary/) |
| Review points     | When to decrease the indegree and whether the result includes every node                                                                             |

## Union-Find

| Aspect            | Details                                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Recognition clues | Connectivity, grouping, friend circles, redundant edges, or equality relationships                                                                                                               |
| Common templates  | `find`, `union`, path compression, union by size                                                                                                                                                 |
| Core problems     | [547. Number of Provinces](https://leetcode.cn/problems/number-of-provinces/)                                                                                                                    |
| Advanced problems | [684. Redundant Connection](https://leetcode.cn/problems/redundant-connection/), [990. Satisfiability of Equality Equations](https://leetcode.cn/problems/satisfiability-of-equality-equations/) |
| Review points     | Whether `find` compresses paths and when to detect a conflict                                                                                                                                    |

## Bit Manipulation

| Aspect            | Details                                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Recognition clues | Odd or even checks, powers of two, single occurrences, or state compression                                                        |
| Common templates  | XOR, clearing the lowest set bit, bitmask enumeration                                                                              |
| Core problems     | [136. Single Number](https://leetcode.cn/problems/single-number/), [231. Power of Two](https://leetcode.cn/problems/power-of-two/) |
| Advanced problems | [191. Number of 1 Bits](https://leetcode.cn/problems/number-of-1-bits/), [78. Subsets](https://leetcode.cn/problems/subsets/)      |
| Review points     | XOR properties, what `n & (n - 1)` does, and how negative numbers are represented                                                  |

## Review Roadmap

This page lists classic patterns and recommended problems. The [algorithm interview review guide](./README.md) contains the 7-day and 30-day study plans. Keeping those plans in one place avoids inconsistencies between problem lists.

<!-- @include: @article-footer.snippet.md -->
