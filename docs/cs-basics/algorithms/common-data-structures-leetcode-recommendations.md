---
title: Recommended LeetCode Problems for Common Data Structures
description: A focused list of common LeetCode problems for arrays, linked lists, stacks, queues, hash tables, trees, graphs, heaps, tries, and union-find, with patterns, interview value, and review points.
category: Computer Science Fundamentals
tag:
  - Algorithms
  - Data Structures
  - LeetCode
head:
  - - meta
    - name: keywords
      content: LeetCode,data structures,arrays,linked lists,stacks,queues,hash tables,binary trees,graphs,heaps,tries,union-find,problem recommendations,study plan
---

Don't work through data structure problems only by difficulty, from Easy to Hard. A steadier approach is to group them by structure: arrays involve indexes and ranges, linked lists involve pointers, stacks and queues enforce ordering, trees and graphs require traversal, heaps manage priority, and hash tables provide fast lookup.

This list focuses on common interview problems and representative templates. Start with the core problems for each structure, then try the advanced ones. After each problem, record its complexity, edge cases, and pattern.

## How to Use This List

Don't memorize answers in isolation. Before solving problems for a structure, review how it stores data, its core operations, and their complexity. This also helps with follow-up questions about Java collections, Redis, MySQL indexes, and caching.

| Structure                                | Read first                                                                                                                                     | What to focus on                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Arrays, linked lists, stacks, and queues | [Linear data structures](../data-structure/linear-data-structure.md), [two pointers and sliding windows](./two-pointers-and-sliding-window.md) | Indexes, pointer updates, and when to push or pop                                |
| Hash tables                              | [Hash table interview questions](../data-structure/hash-table.md)                                                                              | Key design, counting, collisions, and resizing                                   |
| Trees and graphs                         | [Trees](../data-structure/tree.md), [graphs](../data-structure/graph.md), [DFS and BFS](./dfs-bfs.md)                                          | Recursive return values, visited markers, and BFS level counts                   |
| Heaps and Top K                          | [Heaps](../data-structure/heap.md), [Top K interview questions](./top-k.md)                                                                    | Heap size, comparators, and streaming data                                       |
| Tries and union-find                     | [Trie interview questions](../data-structure/trie.md), [union-find interview questions](../data-structure/union-find.md)                       | Node structure, end markers, path compression, and connectivity                  |
| LRU cache                                | [LRU cache interview questions](../data-structure/lru-cache.md)                                                                                | How a hash table and doubly linked list work together to provide O(1) operations |

## Arrays

| Pattern          | Core problems                                                                                                | Advanced problems                                                                                                                                    | Interview value                      | Review points                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------- |
| Binary search    | [704. Binary Search](https://leetcode.cn/problems/binary-search/)                                            | [34. Find First and Last Position of Element in Sorted Array](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/) | Tests loop conditions and boundaries | `left <= right`, boundary updates             |
| In-place changes | [26. Remove Duplicates from Sorted Array](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/) | [80. Remove Duplicates from Sorted Array II](https://leetcode.cn/problems/remove-duplicates-from-sorted-array-ii/)                                   | Tests two-pointer technique          | Slow pointer meaning, when to overwrite       |
| Two pointers     | [977. Squares of a Sorted Array](https://leetcode.cn/problems/squares-of-a-sorted-array/)                    | [15. 3Sum](https://leetcode.cn/problems/3sum/)                                                                                                       | Common array problems                | Deduplication after sorting, pointer movement |
| Prefix sums      | [303. Range Sum Query - Immutable](https://leetcode.cn/problems/range-sum-query-immutable/)                  | [560. Subarray Sum Equals K](https://leetcode.cn/problems/subarray-sum-equals-k/)                                                                    | A common subarray pattern            | Prefix sum meaning, hash table counts         |

## Linked Lists

| Pattern                | Core problems                                                                                          | Advanced problems                                                                  | Interview value            | Review points                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------ |
| Basic operations       | [707. Design Linked List](https://leetcode.cn/problems/design-linked-list/)                            | [24. Swap Nodes in Pairs](https://leetcode.cn/problems/swap-nodes-in-pairs/)       | Tests pointer manipulation | Dummy head, insertion and deletion order   |
| Reversal               | [206. Reverse Linked List](https://leetcode.cn/problems/reverse-linked-list/)                          | [92. Reverse Linked List II](https://leetcode.cn/problems/reverse-linked-list-ii/) | Common live-coding problem | Update order for `prev`, `cur`, and `next` |
| Fast and slow pointers | [141. Linked List Cycle](https://leetcode.cn/problems/linked-list-cycle/)                              | [142. Linked List Cycle II](https://leetcode.cn/problems/linked-list-cycle-ii/)    | Common follow-up problem   | Derive the meeting point and cycle entry   |
| Deleting nodes         | [19. Remove Nth Node From End of List](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/) | [61. Rotate List](https://leetcode.cn/problems/rotate-list/)                       | Tests edge-case handling   | List length, deleting the head             |

## Stacks and Queues

| Pattern               | Core problems                                                                                   | Advanced problems                                                                                                 | Interview value                       | Review points                                                |
| --------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------ |
| Simulating structures | [232. Implement Queue using Stacks](https://leetcode.cn/problems/implement-queue-using-stacks/) | [225. Implement Stack using Queues](https://leetcode.cn/problems/implement-stack-using-queues/)                   | Tests understanding of the structures | Roles of the input and output stacks                         |
| Matching parentheses  | [20. Valid Parentheses](https://leetcode.cn/problems/valid-parentheses/)                        | [394. Decode String](https://leetcode.cn/problems/decode-string/)                                                 | A common string-and-stack pattern     | When to push and pop                                         |
| Monotonic stack       | [739. Daily Temperatures](https://leetcode.cn/problems/daily-temperatures/)                     | [84. Largest Rectangle in Histogram](https://leetcode.cn/problems/largest-rectangle-in-histogram/)                | Common medium and hard pattern        | Whether the stack is increasing or decreasing                |
| Monotonic queue       | [239. Sliding Window Maximum](https://leetcode.cn/problems/sliding-window-maximum/)             | [862. Shortest Subarray with Sum at Least K](https://leetcode.cn/problems/shortest-subarray-with-sum-at-least-k/) | Common template for hard problems     | Expire items at the front; preserve monotonicity at the back |

## Hash Tables

| Pattern             | Core problems                                                                     | Advanced problems                                                                               | Interview value             | Review points                                           |
| ------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------- |
| Fast lookup         | [1. Two Sum](https://leetcode.cn/problems/two-sum/)                               | [49. Group Anagrams](https://leetcode.cn/problems/group-anagrams/)                              | Introduction to hash tables | Key design                                              |
| Counting            | [242. Valid Anagram](https://leetcode.cn/problems/valid-anagram/)                 | [347. Top K Frequent Elements](https://leetcode.cn/problems/top-k-frequent-elements/)           | Common frequency counting   | When to use an array or a map                           |
| Prefix sum and hash | [560. Subarray Sum Equals K](https://leetcode.cn/problems/subarray-sum-equals-k/) | [974. Subarray Sums Divisible by K](https://leetcode.cn/problems/subarray-sums-divisible-by-k/) | Common subarray question    | Look up before adding the current prefix                |
| Cache design        | [146. LRU Cache](https://leetcode.cn/problems/lru-cache/)                         | [460. LFU Cache](https://leetcode.cn/problems/lfu-cache/)                                       | Common design exercise      | How the hash table and doubly linked list work together |

## Binary Trees

| Pattern                | Core problems                                                                                                                                             | Advanced problems                                                                                                                                           | Interview value        | Review points                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------- |
| Traversal              | [144. Binary Tree Preorder Traversal](https://leetcode.cn/problems/binary-tree-preorder-traversal/)                                                       | [102. Binary Tree Level Order Traversal](https://leetcode.cn/problems/binary-tree-level-order-traversal/)                                                   | Tree fundamentals      | Recursive base cases, queue levels            |
| Path problems          | [112. Path Sum](https://leetcode.cn/problems/path-sum/)                                                                                                   | [124. Binary Tree Maximum Path Sum](https://leetcode.cn/problems/binary-tree-maximum-path-sum/)                                                             | Common DFS pattern     | Separate return values from the global answer |
| Building a tree        | [105. Construct Binary Tree from Preorder and Inorder Traversal](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) | [106. Construct Binary Tree from Inorder and Postorder Traversal](https://leetcode.cn/problems/construct-binary-tree-from-inorder-and-postorder-traversal/) | Tests recursive ranges | Keep index ranges correct                     |
| Lowest common ancestor | [236. Lowest Common Ancestor of a Binary Tree](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/)                                     | [235. Lowest Common Ancestor of a Binary Search Tree](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-search-tree/)                         | Common follow-up       | Differences between a general tree and a BST  |

## Graphs

| Pattern          | Core problems                                                                 | Advanced problems                                                               | Interview value              | Review points                |
| ---------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------- | ---------------------------- |
| Grid DFS/BFS     | [200. Number of Islands](https://leetcode.cn/problems/number-of-islands/)     | [695. Max Area of Island](https://leetcode.cn/problems/max-area-of-island/)     | Introduction to graph search | Boundaries, visited markers  |
| Topological sort | [207. Course Schedule](https://leetcode.cn/problems/course-schedule/)         | [210. Course Schedule II](https://leetcode.cn/problems/course-schedule-ii/)     | Dependency problems          | Indegree array, queue        |
| Shortest path    | [994. Rotting Oranges](https://leetcode.cn/problems/rotting-oranges/)         | [127. Word Ladder](https://leetcode.cn/problems/word-ladder/)                   | BFS by levels                | Count steps per level        |
| Connectivity     | [547. Number of Provinces](https://leetcode.cn/problems/number-of-provinces/) | [684. Redundant Connection](https://leetcode.cn/problems/redundant-connection/) | Introduction to union-find   | `find` and `union` templates |

## Heaps

| Pattern          | Core problems                                                                                         | Advanced problems                                                                                     | Interview value         | Review points                     |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------- | --------------------------------- |
| Kth largest      | [215. Kth Largest Element in an Array](https://leetcode.cn/problems/kth-largest-element-in-an-array/) | [703. Kth Largest Element in a Stream](https://leetcode.cn/problems/kth-largest-element-in-a-stream/) | Common Top K pattern    | Keep the min-heap size at K       |
| Frequency counts | [347. Top K Frequent Elements](https://leetcode.cn/problems/top-k-frequent-elements/)                 | [692. Top K Frequent Words](https://leetcode.cn/problems/top-k-frequent-words/)                       | Hash table and heap     | Comparator implementation         |
| Two heaps        | [295. Find Median from Data Stream](https://leetcode.cn/problems/find-median-from-data-stream/)       | [480. Sliding Window Median](https://leetcode.cn/problems/sliding-window-median/)                     | Advanced design problem | Balance the max-heap and min-heap |

## Tries and Union-Find

| Structure                  | Core problems                                                                                 | Advanced problems                                                                                                                    | Interview value                | Review points                                    |
| -------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ------------------------------------------------ |
| Trie                       | [208. Implement Trie (Prefix Tree)](https://leetcode.cn/problems/implement-trie-prefix-tree/) | [211. Design Add and Search Words Data Structure](https://leetcode.cn/problems/design-add-and-search-words-data-structure/)          | String set problems            | Node structure, end marker                       |
| Trie and DFS               | [212. Word Search II](https://leetcode.cn/problems/word-search-ii/)                           | [648. Replace Words](https://leetcode.cn/problems/replace-words/)                                                                    | Common medium and hard pattern | Prune by prefix                                  |
| Union-find                 | [547. Number of Provinces](https://leetcode.cn/problems/number-of-provinces/)                 | [1319. Number of Operations to Make Network Connected](https://leetcode.cn/problems/number-of-operations-to-make-network-connected/) | Connectivity template          | Path compression                                 |
| Union-find cycle detection | [684. Redundant Connection](https://leetcode.cn/problems/redundant-connection/)               | [990. Satisfiability of Equality Equations](https://leetcode.cn/problems/satisfiability-of-equality-equations/)                      | Common graph variation         | Merge equalities first, then check for conflicts |

## Review Roadmap

This page contains only data structure problems. The [data structure review guide](../data-structure/README.md) contains the 7-day and 30-day study plans, so the same plan doesn't need to be maintained in multiple problem lists.

<!-- @include: @article-footer.snippet.md -->
