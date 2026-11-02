---
title: "Algorithms: Interview Roadmap, Core Patterns, and Common LeetCode Problems"
description: An algorithm interview roadmap covering complexity, binary search, two pointers, sliding windows, DFS/BFS, backtracking, dynamic programming, greedy algorithms, Top K, strings, linked lists, sorting, and common LeetCode problems.
category: Computer Science Basics
tag:
  - Algorithms
  - LeetCode
  - Interview Preparation
sidebar: false
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: algorithms,algorithm interview questions,LeetCode,problem-solving roadmap,binary search,two pointers,sliding window,DFS,BFS,backtracking,dynamic programming,greedy,Top K,sorting,string algorithms,linked list algorithms,backend interviews
---

This **algorithms guide** follows a practical interview-preparation path rather than the order of a textbook. Start with complexity, then learn common patterns such as binary search, two pointers, sliding windows, DFS/BFS, backtracking, dynamic programming, greedy algorithms, and Top K. Finish with focused reviews of strings, linked lists, sorting, and LeetCode problem sets.

It is easy to solve many problems but get stuck when one condition changes. Usually, the issue is not a lack of practice; it is failing to recognize the underlying pattern. In an interview, it helps to identify the problem type, write a working solution, then explain its complexity and edge cases.

## Who Should Read This?

- Candidates preparing for internship, new-graduate, or experienced-hire interviews who want a structured LeetCode plan.
- Developers who have solved problems but struggle to explain why a solution works.
- Backend developers with a data structures foundation who want more practice with algorithm patterns and edge cases.
- Engineers with 7 to 30 days before an interview who want to refresh their problem-solving skills.

## What Do Algorithm Interviews Test?

Algorithm interviews are about more than whether you can get one problem accepted. They usually assess four things:

| Skill               | What it looks like in an interview                                                    | How to prepare                                                 |
| ------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Pattern recognition | Can you identify binary search, sliding window, backtracking, or dynamic programming? | Practice by pattern instead of picking problems at random.     |
| Reliable code       | Are edge cases, nulls, indexes, and loop conditions handled correctly?                | Prepare two or three edge cases for each template.             |
| Complexity analysis | Can you explain time and space complexity?                                            | Write down the complexity after solving each problem.          |
| Adaptability        | Can you adjust the pattern when the conditions change?                                | Solve both introductory and variant problems for each pattern. |

If you remember one thing: **learn patterns first, then use representative problems to practice adapting them.**

## Suggested Reading Order

1. [Time and Space Complexity Interview Guide](./complexity-analysis.md): Review Big O, recursive complexity, and common mistakes.
2. [Binary Search Interview Questions](./binary-search.md): Practice basic binary search, boundary searches, and binary search on the answer.
3. [Two Pointers and Sliding Window Interview Questions](./two-pointers-and-sliding-window.md): Solve common array, string, and linked list problems.
4. [DFS and BFS Interview Questions](./dfs-bfs.md): Learn tree and graph traversal, matrix search, and level-order traversal.
5. [Backtracking Interview Questions](./backtracking.md): Practice combinations, permutations, subsets, and board problems.
6. [Dynamic Programming Interview Questions](./dynamic-programming.md): Start with state definitions and transitions instead of memorizing solutions.
7. [Greedy Algorithm Interview Questions](./greedy.md) and [Top K Interview Questions](./top-k.md): Review sorting-based greedy approaches, heaps, quicksort partitioning, and bucket counting.
8. [Common String Algorithm Problems](./string-algorithm-problems.md), [Common Linked List Algorithm Problems](./linkedlist-algorithm-problems.md), and [Ten Classic Sorting Algorithms](./10-classical-sorting-algorithms.md): Review each topic before an interview.

## Core Patterns

| Pattern             | Clues                                                                                 | Guide                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Binary search       | Sorted or monotonic data; minimum or maximum feasible value                           | [Binary Search Interview Questions](./binary-search.md)                                     |
| Two pointers        | In-place updates, narrowing from both ends, fast/slow pointers, linked list positions | [Two Pointers and Sliding Window Interview Questions](./two-pointers-and-sliding-window.md) |
| Sliding window      | Contiguous subarrays or substrings; longest or shortest window                        | [Two Pointers and Sliding Window Interview Questions](./two-pointers-and-sliding-window.md) |
| DFS/BFS             | Tree or graph traversal, matrix components, shortest path by levels                   | [DFS and BFS Interview Questions](./dfs-bfs.md)                                             |
| Backtracking        | Enumerate solutions, choose paths, combinations, permutations, or board constraints   | [Backtracking Interview Questions](./backtracking.md)                                       |
| Dynamic programming | Optimization, counting, reachability, subsequences, or knapsack                       | [Dynamic Programming Interview Questions](./dynamic-programming.md)                         |
| Greedy              | Choose the locally best option at each step, often combined with sorting              | [Greedy Algorithm Interview Questions](./greedy.md)                                         |
| Top K               | Kth largest, K most frequent, streams, or priorities                                  | [Top K Interview Questions](./top-k.md)                                                     |

## 7-Day Review Plan

When time is short, start with core patterns instead of difficult problems. This 7-day plan focuses on refreshing templates and writing them reliably:

| Day | Focus                                | Suggested practice                                                                                          |
| --- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| 1   | Complexity and sorting               | Review Big O, quicksort, mergesort, heapsort, and stability.                                                |
| 2   | Binary search and two pointers       | Write boundary-search templates; solve Two Sum, 3Sum, and Remove Duplicates.                                |
| 3   | Sliding windows and strings          | Practice Longest Substring Without Repeating Characters, Minimum Window Substring, and palindrome problems. |
| 4   | Linked lists                         | Practice list reversal, cycle detection, and removing the Nth node from the end.                            |
| 5   | Trees and BFS                        | Practice preorder, inorder, postorder, level-order traversal, and lowest common ancestor.                   |
| 6   | Backtracking and dynamic programming | Practice subsets, combinations, Coin Change, and Longest Increasing Subsequence.                            |
| 7   | Top K and review                     | Practice Kth Largest and Top K Frequent Elements; review mistakes and edge cases.                           |

## 30-Day Study Plan

You do not need to solve many problems every day. A more sustainable pace is one to three representative problems, followed by a brief review of each.

| Phase   | Days       | Goal                                                                                         |
| ------- | ---------- | -------------------------------------------------------------------------------------------- |
| Phase 1 | Days 1–5   | Complexity, arrays, linked lists, stacks, and queues; write the basic templates from memory. |
| Phase 2 | Days 6–12  | Binary search, two pointers, sliding windows, and strings; focus on edge cases.              |
| Phase 3 | Days 13–18 | Trees, graphs, DFS/BFS, and union-find; build a framework for search problems.               |
| Phase 4 | Days 19–24 | Backtracking, dynamic programming, and greedy algorithms; focus on states and pruning.       |
| Phase 5 | Days 25–30 | Top K, sorting, mixed problems, and review; practice explaining solutions.                   |

## Review Questions

- Why does time complexity focus on the highest-order term, and how is recursive complexity calculated?
- When should binary search use `left < right` versus `left <= right`?
- How do two pointers differ from a sliding window?
- Which problems suit DFS or BFS, and when is a `visited` set needed?
- How are backtracking and DFS related, and where should pruning happen?
- Why is dynamic programming difficult, and how do you define states and traversal order?
- Why does a greedy algorithm need a proof, and how much should you explain in an interview?
- When should Top K use a heap, quicksort partitioning, or bucket counting?
- How do sorting algorithms compare in stability, in-place behavior, and best- and worst-case complexity?

## Related Topics

- [Computer Science Fundamentals](../)
- [Data Structures](../data-structure/)
- [Recommended LeetCode Problems for Common Data Structures](./common-data-structures-leetcode-recommendations.md)
- [Classic Algorithmic Techniques](./classical-algorithm-problems-recommendations.md)
- [Java Collections](../../java/collection/java-collection-questions-01.md)
- [Interview Preparation](../../interview-preparation/)
- [Recommended Computer Science Books](../../books/cs-basics.md)

<!-- @include: @article-footer.snippet.md -->
