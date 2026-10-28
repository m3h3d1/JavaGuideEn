---
title: Optimistic and Pessimistic Locking
description: A detailed comparison of optimistic and pessimistic locking, including synchronized and ReentrantLock, CAS and versioning, use cases, performance, and selection guidance.
category: Java
tag:
  - Java Concurrency
head:
  - - meta
    - name: keywords
      content: optimistic locking, pessimistic locking, synchronized, ReentrantLock, CAS, versioning, concurrency control, lock optimization
---

Think of pessimistic and optimistic locking in terms of everyday behavior. A pessimistic approach assumes the worst and tries to prevent problems in advance. An optimistic approach assumes things will work and checks for problems when they arise.

## What Is Pessimistic Locking?

Pessimistic locking assumes that a conflict may occur whenever a shared resource is accessed. It acquires a lock before operating on the resource, so other threads block until the lock is released. In other words, **only one thread can use the shared resource at a time; other threads wait until it is available**.

Exclusive locks such as Java's `synchronized` and `ReentrantLock` follow the pessimistic locking approach.

```java
public void performSynchronisedTask() {
    synchronized (this) {
        // Operation that needs synchronization
    }
}

private Lock lock = new ReentrantLock();
lock.lock();
try {
   // Operation that needs synchronization
} finally {
    lock.unlock();
}
```

Under high concurrency, intense lock contention blocks threads. A large number of blocked threads can cause context switches and add overhead. Pessimistic locking can also lead to deadlocks if threads acquire locks in an inconsistent order.

## What Is Optimistic Locking?

Optimistic locking assumes that conflicts are uncommon. Threads proceed without acquiring a lock or waiting, then check at commit time whether another thread changed the data. Common approaches include versioning and CAS.

In Java, atomic variable classes such as `AtomicInteger` use **CAS**, one form of optimistic locking. `LongAdder` also uses atomic updates, while spreading updates across internal cells under contention.
![Overview of JUC atomic classes](https://oss.javaguide.cn/github/javaguide/java/JUC%E5%8E%9F%E5%AD%90%E7%B1%BB%E6%A6%82%E8%A7%88-20230814005211968.png)

```java
// LongAdder can perform better than AtomicInteger and AtomicLong under high contention
// It uses more memory to achieve this improvement
LongAdder sum = new LongAdder();
sum.increment();
```

Under high concurrency, optimistic locking avoids blocking caused by lock contention and does not cause lock-based deadlocks, so it can perform better. However, frequent conflicts, such as in write-heavy workloads, cause repeated failures and retries, which can also hurt performance and drive up CPU usage.

Under contention, `LongAdder` spreads updates across multiple internal cells, reducing the chance that all threads contend on the same value. Its updates may still use CAS and retry, so contention is not eliminated. Also, `sum()` does not return an atomic snapshot consistent with concurrent updates.

As a general guideline:

- Pessimistic locking is often used in write-heavy workloads with high contention, where frequent failures and retries would be costly. However, approaches such as `LongAdder`, which spread contention, may work well for specific operations such as accumulation. Choose based on the actual requirements.
- Optimistic locking is often used in read-heavy workloads with fewer conflicts, where it can avoid frequent lock acquisition. Many optimistic approaches, including Java's atomic variable classes, focus on a single shared variable.

## How Is Optimistic Locking Implemented?

Optimistic locking is commonly implemented with versioning or CAS. CAS is more widely used in Java concurrency, so it deserves particular attention.

### Versioning

Typically, a table includes a `version` field that tracks changes to a row. Each update increments the version. When thread A reads a value, it also reads the version. At commit time, the update succeeds only if the version it read still matches the current database version; otherwise, the operation must retry or report a conflict.

**For example**, suppose an account table has a `version` field with the value 1, and the account balance (`balance`) is $100.

1. Operator A reads the account (`version` = 1) and subtracts $50 from the balance ($100 - $50).
2. While A is working, operator B also reads the account (`version` = 1) and subtracts $20 ($100 - $20).
3. A submits the new balance ($50) with the version it read (1). Because the database row still has version 1, the update succeeds and the stored version becomes 2.
4. B submits a balance of $80 with version 1. The database row is now at version 2, so B's update is rejected because the submitted version no longer matches.

This prevents B's update, based on stale version 1 data, from overwriting A's result.

### CAS

CAS stands for **compare-and-swap** and is widely used to implement optimistic updates. It compares the current value with an expected value and performs the update only if they match.

CAS is an atomic operation, typically implemented with processor support.

> An **atomic operation** is indivisible: once it starts, it cannot be interrupted before completion.

CAS uses three operands:

- **V**: The variable to update.
- **E**: The expected value.
- **N**: The new value to write.

CAS atomically updates V to N only if V equals E. If they differ, another thread has updated V, so the current thread does not perform the update.

**For example**, thread A wants to change `i` from 1 to 6 (V = 1, E = 1, N = 6; assume there is no ABA problem).

1. Compare `i` with 1. If they match, no other thread has changed it, so CAS sets it to 6.
2. If they do not match, another thread changed it, so this CAS operation fails.

When multiple threads use CAS on the same variable, one can succeed while the others fail. Failed threads are not suspended; they can retry or abandon the operation.

For more about Java's CAS implementation and its limitations, see [CAS Explained](./cas.md).

## Summary

This article introduced optimistic and pessimistic locking and common ways to implement optimistic locking:

- Pessimistic locking assumes conflicts may occur and acquires a lock before each operation, blocking other threads until it is released. Java's `synchronized` and `ReentrantLock` are common examples. This approach prevents data races, but under high concurrency it can increase blocking and context switching, affect performance, and lead to deadlocks.
- Optimistic locking assumes conflicts are uncommon. It does not acquire a lock in advance; it checks for changes when committing an update. Classes such as `AtomicInteger` use CAS. Optimistic locking avoids blocking and lock-based deadlocks, and can perform well when reads are frequent and writes are rare. Frequent writes may cause many retries and failures.
- Common implementations include versioning and CAS. Versioning checks a data version, while CAS atomically compares and swaps a value.

Pessimistic and optimistic locking each have trade-offs and suit different situations. Choosing the right approach can improve concurrency and system stability.

## References

- _78 Core Lessons in Java Concurrency_
- Pessimistic, Optimistic, Reentrant, Spin, Biased, Lightweight, and Read-Write Locks in Java: <https://zhuanlan.zhihu.com/p/71156910>

<!-- @include: @article-footer.snippet.md -->
