---
title: "Data Structures: Arrays, Linked Lists, Hash Tables, Trees, Graphs, Heaps, and Interview Prep"
description: A data structures interview review covering arrays, linked lists, stacks, queues, hash tables, trees, graphs, heaps, tries, union-find, skip lists, red-black trees, Bloom filters, LRU caches, complexity analysis, and Java backend use cases.
category: Computer Science Basics
tag:
  - Data Structures
  - Algorithms
  - Interview Preparation
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: data structures,data structure interview questions,review roadmap,arrays,linked lists,stacks,queues,hash tables,HashMap,trees,graphs,heaps,tries,union-find,skip lists,red-black trees,Bloom filters,LRU,Java collections,Redis,MySQL indexes,backend interviews
---

This **data structures guide** is organized around interviews and Java backend work. Start with how data is stored, review the complexity of common operations, then connect each structure to practical topics such as Java collections, MySQL indexes, Redis, caches, and message queues.

Data structure interviews rarely stop at “What is an array?” Common follow-up questions include: Why are arrays fast to query while linked lists can be easier to insert into and delete from? Why does `HashMap` resize? Why are B+ trees useful for indexes? Why can a Bloom filter produce false positives? These questions test whether you understand the complexity and tradeoffs behind choosing a structure.

Do not just memorize definitions. For each structure, ask four questions: How is data stored? How is it queried? How is it updated? What is it suited for? Once you can answer those, practice related algorithm problems.

## Who Should Read This?

- Developers reviewing data structure fundamentals for entry-level or experienced backend interviews.
- Readers who struggle with arrays, linked lists, trees, graphs, heaps, or other structures while solving algorithm problems.
- Engineers who want to connect data structures to Java collections, Redis, MySQL, and caching systems.
- Developers who know the definitions but want to give more complete interview answers.

## What Do Data Structure Interviews Cover?

| Topic       | Common question                                                                         | Review focus                                             |
| ----------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Storage     | How do sequential and linked storage differ?                                            | Contiguous memory, pointers, and cache locality          |
| Complexity  | Why is array lookup `O(1)` while linked-list lookup is `O(n)`?                          | Complexity of lookup, insertion, deletion, and traversal |
| Comparisons | When would you choose a red-black tree or AVL tree? How do B-trees and B+ trees differ? | Compare properties and use cases                         |
| Engineering | Which structures do `HashMap`, `TreeMap`, `PriorityQueue`, and Redis ZSet use?          | Real uses in Java, databases, and caches                 |
| Algorithms  | How do you implement tree traversal, graph search, Top K, or LRU?                       | Review alongside algorithm patterns                      |

## A Framework for Interview Answers

Do not stop at defining a data structure. A clear answer can follow this sequence:

```text
Definition -> storage method -> common operation complexity -> tradeoffs -> use cases -> applications in Java, Redis, and MySQL
```

For example, a complete answer about hash tables might cover:

1. A hash table uses a hash function to map a key to an array index.
2. Lookup, insertion, and deletion are `O(1)` on average, but performance can degrade when collisions are frequent.
3. Collisions can be handled with techniques such as chaining or open addressing.
4. Java `HashMap` uses an array, linked lists, and red-black trees. It resizes to control the load factor.
5. Hash tables are useful for fast lookup, counting, deduplication, and cache indexes, but use additional memory.

This answer is more robust than simply saying “hash table lookup is `O(1)`” because it explains the mechanism, complexity, and practical use.

## Suggested Reading Order

1. [Linear Data Structures](./linear-data-structure.md): Start with arrays, linked lists, stacks, and queues; compare sequential and linked storage.
2. [Hash Table Interview Questions](./hash-table.md): Learn about hash functions, collisions, resizing, and `HashMap`.
3. [Trees](./tree.md): Review binary trees, binary search trees, AVL trees, B-trees, B+ trees, and MySQL indexes.
4. [Heaps](./heap.md): Study priority queues, Top K, heap sort, and `PriorityQueue`.
5. [Graphs](./graph.md): Learn graph representations, DFS, BFS, topological sorting, and shortest paths.
6. [Tries](./trie.md) and [Union-Find](./union-find.md): Cover string collections and connectivity problems.
7. [Skip Lists](./skip-list.md), [Red-Black Trees](./red-black-tree.md), [Bloom Filters](./bloom-filter.md), and [LRU Caches](./lru-cache.md): Review structures used in Java collections, Redis, caches, and databases.

## Core Articles

| Article                                              | Focus                                      | Related topics                               |
| ---------------------------------------------------- | ------------------------------------------ | -------------------------------------------- |
| [Linear Data Structures](./linear-data-structure.md) | Arrays, linked lists, stacks, queues       | `ArrayList`, `LinkedList`, message queues    |
| [Hash Table Interview Questions](./hash-table.md)    | Hash functions, collisions, resizing       | `HashMap`, caching, deduplication            |
| [Trees](./tree.md)                                   | Binary trees, BSTs, AVL, B-trees, B+ trees | MySQL indexes, expression trees              |
| [Graphs](./graph.md)                                 | Adjacency lists and matrices, DFS, BFS     | Dependencies, routing, recommendations       |
| [Heaps](./heap.md)                                   | Max-heaps, min-heaps, heap sort            | `PriorityQueue`, Top K, delay queues         |
| [Red-Black Trees](./red-black-tree.md)               | Balance, rotations, recoloring             | `TreeMap`, tree bins in `HashMap`            |
| [Bloom Filters](./bloom-filter.md)                   | Bit arrays, hashing, false positives       | Cache penetration, deduplication, blocklists |
| [Skip Lists](./skip-list.md)                         | Multi-level indexes, range queries         | Redis ZSet                                   |
| [LRU Cache Interview Questions](./lru-cache.md)      | Hash table and doubly linked list          | Local caches, page replacement               |

## Quick Guide to Choosing a Structure

Many data structure questions are really asking why one structure fits a scenario better than another. Use this table for a quick review before an interview:

| Scenario                                   | Consider                           | Tradeoff                                                                                         |
| ------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| Frequent random access by index            | Array, `ArrayList`                 | Fast lookup; inserting or deleting in the middle is costly                                       |
| Frequent insertion or removal at both ends | Deque, linked list                 | Flexible pointer updates; slow random access                                                     |
| Fast membership checks                     | Hash table, Bloom filter           | Hash tables are exact but use more memory; Bloom filters save space but can have false positives |
| Ordered collections and range queries      | Red-black tree, skip list, B+ tree | Red-black trees suit in-memory ordering; skip lists are practical for range queries              |
| Maximum, minimum, or Top K                 | Heap, priority queue               | Efficient for selected extrema, not for fully ordered traversal                                  |
| Connectivity and grouping                  | Union-Find                         | Fast union and lookup; not suited to frequent edge deletion                                      |
| Prefix matching and autocomplete           | Trie                               | Lookup depends on string length, but the structure may use many nodes                            |
| Cache eviction                             | LRU, LFU                           | LRU tracks recency; LFU tracks frequency                                                         |

As you review, ask: What would become slower without this structure? How much extra space does it use? What are its edge cases? Answering these questions helps with interview follow-ups.

## 7-Day Review Plan

| Day | Focus                                          | Suggested practice                                                        |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | Arrays and linked lists                        | Make a complexity table; implement list reversal and node deletion        |
| 2   | Stacks, queues, and hash tables                | Solve valid parentheses, implement a queue with stacks, and solve Two Sum |
| 3   | Trees                                          | Implement traversals and lowest common ancestor; review B+ trees          |
| 4   | Heaps                                          | Solve Top K and K most frequent elements; study `PriorityQueue`           |
| 5   | Graphs                                         | Implement DFS/BFS; solve Number of Islands and Course Schedule            |
| 6   | Red-black trees, skip lists, and Bloom filters | Focus on engineering use cases                                            |
| 7   | LRU and review                                 | Implement LRU; summarize complexity and use cases for each structure      |

## 30-Day Review Plan

| Phase | Schedule   | Goal                                                                                                 |
| ----- | ---------- | ---------------------------------------------------------------------------------------------------- |
| 1     | Days 1–6   | Review linear structures and hash tables; explain complexity and Java collection use cases           |
| 2     | Days 7–13  | Study trees, heaps, and graphs; practice DFS/BFS and Top K problems                                  |
| 3     | Days 14–20 | Cover tries, union-find, skip lists, and red-black trees                                             |
| 4     | Days 21–25 | Review Bloom filters, LRU, and engineering scenarios involving Redis, MySQL, and caches              |
| 5     | Days 26–30 | Review mistakes and practice verbal explanations; prepare two follow-up questions for each structure |

## Self-Test: Common Interview Questions

- How do arrays and linked lists differ in memory layout? Why are arrays fast for random access?
- When should you choose `ArrayList` or `LinkedList` in Java?
- What are stacks and queues suited for? What problems do monotonic stacks and queues solve?
- How can hash collisions be handled? Why does `HashMap` resize?
- How do binary search trees, AVL trees, and red-black trees differ?
- Why are B-trees and B+ trees used for database indexes?
- How does a heap differ from a regular binary tree? Why are heaps common for Top K problems?
- When should you use an adjacency list or matrix? What are the complexities of DFS and BFS?
- Why are skip lists useful for range queries? Why does Redis use one?
- Why can Bloom filters produce false positives? Why is deletion difficult?
- Why is LRU commonly implemented with a hash table and doubly linked list?

## Related Topics

- [Computer Science Basics](../)
- [Algorithms](../algorithms/)
- [Recommended LeetCode Problems for Common Data Structures](../algorithms/common-data-structures-leetcode-recommendations.md)
- [Java Collections](../../java/collection/java-collection-questions-01.md)
- [MySQL Indexes](../../database/mysql/mysql-index.md)
- [Redis Interview Questions](../../database/redis/redis-questions-01.md)
- [Interview Preparation](../../interview-preparation/)

<!-- @include: @article-footer.snippet.md -->
