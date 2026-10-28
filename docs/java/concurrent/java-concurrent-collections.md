---
title: Java Concurrent Collections
description: An overview of thread-safe collections in JUC, including ConcurrentHashMap, CopyOnWriteArrayList, and BlockingQueue, with their characteristics, use cases, and performance trade-offs.
category: Java
tag:
  - Java Concurrency
head:
  - - meta
    - name: keywords
      content: Java concurrent collections, ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue, ConcurrentLinkedQueue, thread-safe collections
---

Most of these collections are provided in the `java.util.concurrent` package.

- **`ConcurrentHashMap`**: A thread-safe `HashMap`.
- **`CopyOnWriteArrayList`**: A thread-safe `List` that performs well in read-heavy workloads and can outperform `Vector` in those cases.
- **`ConcurrentLinkedQueue`**: An efficient, non-blocking concurrent queue implemented as a linked list. It can be viewed as a thread-safe `LinkedList`.
- **`BlockingQueue`**: An interface with JDK implementations based on linked lists, arrays, and other structures. Blocking queues are useful as channels for sharing data between threads.
- **`ConcurrentSkipListMap`**: A map implemented with a skip list for fast lookups.

## ConcurrentHashMap

`HashMap` is not thread-safe. One common way to use it in concurrent code is to wrap it with `Collections.synchronizedMap()`. This wrapper uses a single lock to synchronize access from different threads, which can become a performance bottleneck under high concurrency.

`ConcurrentHashMap` addresses this problem by providing a thread-safe map with more efficient concurrent access.

In JDK 7, `ConcurrentHashMap` divided its table into segments protected by separate locks. Each lock protected only part of the collection (see the diagram below), so threads accessing different segments could update the map without contending for the same lock.

![Java 7 ConcurrentHashMap data structure](https://oss.javaguide.cn/github/javaguide/java/collection/java7_concurrenthashmap.png)

JDK 8 removed `Segment` locks and instead uses `Node`, CAS, and `synchronized` to ensure thread safety. Its data structure is similar to Java 8 `HashMap`: an array of linked lists or red-black trees. When a list exceeds a threshold of 8, Java 8 converts it from a linked list (lookup complexity O(n)) to a red-black tree (O(log n)).

In Java 8, updates use finer-grained locking: when a lock is needed, `synchronized` locks the first node in the relevant bin. Updates to different bins can usually proceed concurrently. Reads generally do not need a lock and can run alongside updates.

![Java 8 ConcurrentHashMap data structure](https://oss.javaguide.cn/github/javaguide/java/collection/java8_concurrenthashmap.png)

For details, see [ConcurrentHashMap Source Code Analysis](./../collection/concurrent-hash-map-source-code.md).

## CopyOnWriteArrayList

Before JDK 1.5 introduced `CopyOnWriteArrayList`, thread-safe list options included the older `Vector` and wrapping a regular `List` with `Collections.synchronizedList()`. Most `Vector` methods are synchronized, making individual calls thread-safe, but compound operations still require additional synchronization.

JDK 1.5 introduced the `java.util.concurrent` (JUC) package, which provides many thread-safe collections designed for concurrent use. `CopyOnWriteArrayList` is its thread-safe `List` implementation that uses copy-on-write.

In many applications, reads are much more frequent than writes. Since reads do not modify the data, locking on every read can waste resources. Multiple threads can safely read the list's internal data at the same time.

This resembles the idea behind `ReentrantReadWriteLock`: reads can run together, while writes exclude other reads and writes. `CopyOnWriteArrayList` takes this further: reads do not acquire a lock, and writes do not block reads. Only concurrent writes contend with one another, which can improve read performance.

`CopyOnWriteArrayList` is thread-safe because it uses a **copy-on-write (COW)** strategy, as its name suggests.

Operations such as `add`, `set`, and `remove` do not modify the original array. They copy the backing array, apply the change to the copy, and then publish the new array. A write therefore does not affect readers already using the old array.

For details, see [CopyOnWriteArrayList Source Code Analysis](./../collection/copyonwritearraylist-source-code.md).

## ConcurrentLinkedQueue

Java's thread-safe queues can be divided into **blocking** and **non-blocking** queues. `BlockingQueue` is a common blocking queue, while `ConcurrentLinkedQueue` is a common non-blocking queue. Choose between them based on the requirements. **Blocking queues can use locks, while non-blocking queues can use CAS operations.**

As its name suggests, `ConcurrentLinkedQueue` uses a linked list. Its implementation is complex, which helps it perform well under high concurrency.

We will not examine its implementation in detail here. The key point is that `ConcurrentLinkedQueue` primarily uses a non-blocking CAS algorithm to ensure thread safety.

`ConcurrentLinkedQueue` is suitable when performance matters and multiple threads access the queue concurrently, especially when the cost of locking would be high.

## BlockingQueue

### Introduction to BlockingQueue

We have already mentioned `ConcurrentLinkedQueue` as a high-performance non-blocking queue. Next is `BlockingQueue`, which is widely used for the producer-consumer pattern. It provides blocking insertion and removal methods: producers block while the queue is full, and consumers block while it is empty.

`BlockingQueue` is an interface that extends `Queue`, so its implementations can also be used as queues. `Queue` in turn extends `Collection`. The diagram below shows some `BlockingQueue` implementations:

![BlockingQueue implementations](https://oss.javaguide.cn/github/javaguide/java/51622268.jpg)

The following sections introduce three common implementations: `ArrayBlockingQueue`, `LinkedBlockingQueue`, and `PriorityBlockingQueue`.

### ArrayBlockingQueue

`ArrayBlockingQueue` is a bounded array-based implementation of the `BlockingQueue` interface.

```java
public class ArrayBlockingQueue<E>
extends AbstractQueue<E>
implements BlockingQueue<E>, Serializable{}
```

Its capacity is fixed at construction. `ArrayBlockingQueue` uses a `ReentrantLock` to coordinate concurrent access, so insertion and retrieval both acquire the lock. Inserting into a full queue or retrieving from an empty queue blocks.

By default, `ArrayBlockingQueue` does not guarantee fairness among waiting threads. With the fair policy enabled, access is granted to waiting producers or consumers in FIFO order when there is contention. This describes the queue's waiting order; it does not mean the operating system schedules threads strictly by wall-clock time. Under the non-fair policy, a thread that has waited a long time may still not access the queue promptly. Fairness usually reduces throughput. To enable it:

```java
private static ArrayBlockingQueue<Integer> blockingQueue = new ArrayBlockingQueue<Integer>(10,true);
```

### LinkedBlockingQueue

`LinkedBlockingQueue` is a blocking queue based on a **singly linked list**. It can be bounded or unbounded and follows FIFO order. It can provide higher throughput than `ArrayBlockingQueue`, but to avoid rapid growth and excessive memory use, applications often specify a capacity. If omitted, the capacity is `Integer.MAX_VALUE`.

**Relevant constructors:**

```java
    /**
     * Effectively unbounded queue
     * Creates a {@code LinkedBlockingQueue} with a capacity of
     * {@link Integer#MAX_VALUE}.
     */
    public LinkedBlockingQueue() {
        this(Integer.MAX_VALUE);
    }

    /**
     * Bounded queue
     * Creates a {@code LinkedBlockingQueue} with the given (fixed) capacity.
     *
     * @param capacity the capacity of this queue
     * @throws IllegalArgumentException if {@code capacity} is not greater
     *         than zero
     */
    public LinkedBlockingQueue(int capacity) {
        if (capacity <= 0) throw new IllegalArgumentException();
        this.capacity = capacity;
        last = head = new Node<E>(null);
    }
```

### PriorityBlockingQueue

`PriorityBlockingQueue` is an unbounded blocking queue that orders elements by priority. By default, it uses the elements' natural ordering. You can define another ordering by implementing `compareTo()` or by passing a `Comparator` to the constructor.

`PriorityBlockingQueue` uses a `ReentrantLock` for concurrent access and is unbounded. `ArrayBlockingQueue` is bounded, and `LinkedBlockingQueue` can be bounded by passing a capacity to its constructor. `PriorityBlockingQueue` accepts an initial capacity, but **grows automatically** when more space is needed.

In short, it is a thread-safe version of `PriorityQueue`. It does not allow `null`, and its elements must be comparable or insertion throws `ClassCastException`. Since it is unbounded, `put` does not block. `take` blocks when the queue is empty.

**Recommended reading:** [Java Concurrent Queues: BlockingQueue](https://javadoop.com/post/java-concurrent-queue)

## ConcurrentSkipListMap

> The following section draws on the GeekTime column [Beauty of Data Structures and Algorithms](https://time.geekbang.org/column/intro/126?code=zl3GYeAsRI4rEJIBNu5B/km7LSZsPDlGWQEpAYw5Vu0=&utm_term=SPoster) and _Practical Java High-Concurrency Programming_.

To introduce `ConcurrentSkipListMap`, let's first look briefly at skip lists.

In a sorted singly linked list, finding an element still requires traversing from the head, which is inefficient. A skip list is a data structure for faster searches, somewhat like a balanced tree. Both support fast lookups, but insertions and deletions in a balanced tree can require global rebalancing, while skip lists can update only a local part of the structure. Under high concurrency, a balanced tree may require a global lock for thread safety, while a skip list can use finer-grained locking and perform better. Skip list lookup is **O(log n)**, so the JDK uses one to implement a concurrent map.

In essence, a skip list maintains multiple linked lists in layers.

![Skip list with two index levels](https://oss.javaguide.cn/github/javaguide/java/93666217.jpg)

The bottom-level list contains every element. Each higher-level list is a subset of the level below it.

The elements in every list are sorted. A search starts at the top level. When the target is smaller than the current node's successor, or there is no successor, the search drops down one level and continues. The search therefore skips through the list. The diagram below shows a search for 18.

![Searching for 18 in a skip list](https://oss.javaguide.cn/github/javaguide/java/32005738.jpg)

The search for 18 takes 7 steps instead of 18. Index levels can greatly improve lookup efficiency in long lists.

As the example shows, **a skip list trades space for time.**

Another difference between a map implemented with a skip list and one implemented with hashing is ordering: hashing does not preserve element order, while skip list elements remain sorted. Iterating over a skip list therefore produces ordered results. If an application needs ordering, `ConcurrentSkipListMap` is a suitable choice in the JDK.

## References

- _Practical Java High-Concurrency Programming_
- <https://javadoop.com/post/java-concurrent-queue>
- <https://juejin.im/post/5aeebd02518825672f19c546>

<!-- @include: @article-footer.snippet.md -->
