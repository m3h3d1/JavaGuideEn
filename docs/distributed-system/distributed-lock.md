---
title: "Distributed Locks: Mutual Exclusion, Lock Scope, Expiration, and Renewal"
category: Distributed Systems
description: "An introduction to distributed locks, including mutual exclusion, lock granularity, owner tokens, safe release, expiration, renewal, fencing tokens, and inventory use cases."
tag:
  - Distributed Locks
head:
  - - meta
    - name: keywords
      content: distributed locks,lock granularity,safe release,fencing token,inventory,overselling,distributed lock interview questions
---

This article uses a service deployed as multiple instances to explain the scope of local locks, the problem distributed locks address, and their limitations.

## Why use a distributed lock?

**When several processes need mutually exclusive access to the same external resource, a local lock cannot coordinate them. A distributed lock can provide mutual exclusion across processes.**

The shared resource might be the same inventory record in a database or the same Redis cache entry. **Separate JVMs normally do not share Java heap memory, but they can access the same external data over a network.** Their operations on that data need coordination.

### Why can't a local lock coordinate multiple service instances?

Suppose an order service processes a purchase by querying inventory, checking availability, decrementing stock, and creating an order. Assume the inventory query is an ordinary read and the decrement has no `count > 0` condition or version check.

With one instance, requests can run serially if they use the same `synchronized` lock object or `ReentrantLock` and perform the whole operation, including the transaction commit, inside the lock. The code requiring mutual exclusion is the **critical section**. A local lock coordinates threads using that lock in the current JVM; the protected data may still live in a database.

Now deploy instances A and B in separate JVMs, connected to the same database. Even with identical code, **their local locks are separate objects** and cannot see each other. A `static` lock field is shared only within its own JVM.

If product `sku_id = 1001` has one item left, this sequence can occur:

| Step | Instance A (JVM A)                                                               | Instance B (JVM B)                                                               |
| ---- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1    | Acquires its local lock.                                                         |                                                                                  |
| 2    |                                                                                  | Acquires its own local lock.                                                     |
| 3    | Reads stock of 1 and passes the check.                                           |                                                                                  |
| 4    |                                                                                  | Reads stock of 1 and passes the check.                                           |
| 5    | Decrements unconditionally, creates and commits an order, and releases its lock. |                                                                                  |
| 6    |                                                                                  | Decrements unconditionally, creates and commits an order, and releases its lock. |

Both requests succeed even though only one item was available: the system oversells. Each local lock coordinates threads in its own JVM, but cannot make the other JVM wait.

### How does a distributed lock coordinate instances?

A and B need to compete for a lock stored in an external system both can access, such as Redis, ZooKeeper, or a database. That system must decide atomically who acquires it.

For example, both instances agree to acquire `lock:stock:1001` before operating on product `1001`. The diagram assumes A acquires the lock first and the lock remains valid throughout its work:

```mermaid
sequenceDiagram
    participant A as Order instance A (JVM A)
    participant B as Order instance B (JVM B)
    participant L as Redis (lock state)
    participant D as Database (stock and orders)
    A->>L: Acquire lock:stock:1001
    L-->>A: Acquired
    B->>L: Acquire lock:stock:1001
    L-->>B: Failed; do not change stock
    A->>D: Check stock, decrement, create order, and commit
    D-->>A: Committed; stock is 0
    A->>L: Verify ownership and release lock
    B->>L: Retry lock:stock:1001
    L-->>B: Acquired
    B->>D: Check stock again
    D-->>B: Stock is 0; do not create an order
    B->>L: Verify ownership and release lock
```

Redis stores the **lock state**; the database stores the **business data**. The instance still accesses the database itself. A Redis lock does not automatically lock database records: every participant requiring mutual exclusion must follow the same locking convention. A request that bypasses the lock is not constrained by it.

The lock must cover the entire critical section, from the inventory check through decrement, order creation, and transaction commit. A request that cannot acquire it can wait, fail, or retry; after acquiring it later, it must recheck the business state. Expiration and client failures affect the mutual exclusion guarantee.

### Does every multi-instance deployment need a distributed lock?

No. **Cross-process mutual exclusion does not always require a separate distributed lock service.** When the database can enforce the business constraint itself, its own mechanisms may be sufficient.

For example, prevent stock from falling below zero with a conditional update:

```sql
UPDATE stock SET count = count - 1 WHERE sku_id = ? AND count > 0;
```

MySQL InnoDB coordinates concurrent updates to the same row with row locks. Continue creating the order only if one row was affected. The decrement and order insert should be in the same local transaction and roll back together on failure. Multiple service instances do not require an additional Redis lock for this decrement.

Similarly, a unique constraint on `user_id + activity_id` can limit each user to one item per promotion, and an idempotency key can handle duplicate order submissions. These constraints must be designed separately; an inventory lock alone does not cover them all.

Consider a distributed lock when logic across processes really must run serially and conditional updates, unique constraints, and similar database mechanisms do not fit. A distributed lock adds network calls and failure-handling complexity and limits concurrency for the protected resource.

## What properties should a distributed lock have?

The basic requirements are:

- **Mutual exclusion:** Only one valid owner may hold a given lock key for a resource at a time. Choose keys at the appropriate granularity, such as `stock:{skuId}` or `order:{orderId}`, instead of putting unrelated resources behind one global lock.
- **Availability and deadlock prevention:** The lock service should remain available, and expiration, sessions, or leases should prevent a crashed client from holding a lock forever. Set expiration together with expected execution time and renewal; an early expiration may let two clients enter the critical section.
- **Safe release:** Verify ownership before releasing a lock. For Redis, write a random value when acquiring it, then use a Lua script to compare the value and delete the key atomically.

Additional properties may be useful:

- **Reentrancy:** If a thread or request chain can re-enter the same critical section, track the owner and reentry count to avoid blocking itself. Not every use case needs this.
- **Performance:** Acquisition and release should be fast and impose limited overhead.
- **Clear acquisition semantics:** Specify whether acquisition blocks, waits for a limited time, or fails immediately. In production, use a maximum wait and retry backoff rather than waiting forever.
- **Renewal:** Set the lock TTL with the critical section's P99 duration in mind. If execution can exceed the TTL, use a watchdog or lease renewal, or shorten the critical section.
- **Fencing token:** For stricter requirements, issue a monotonically increasing token on each acquisition. The downstream resource accepts only newer tokens, rejecting late writes from an expired owner.

## Common implementations

Distributed locks can be implemented using:

- A relational database such as MySQL.
- A coordination service such as ZooKeeper.
- A high-performance key-value store such as Redis, or a consistent distributed key-value store such as etcd.

Database approaches include inserting into a lock table with a unique index, transaction-based `SELECT ... FOR UPDATE` row locks, and named locks such as MySQL `GET_LOCK()`. Their performance, release timing, timeout semantics, and recovery behavior differ.

A database lock table can have an expiration field, but then it must handle claiming expired locks, clock consistency, cleanup, and transaction isolation. `GET_LOCK()` depends on MySQL connection and session semantics, which do not suit every workflow.

Redis locks are common for short, performance-sensitive critical sections where business idempotency provides a safeguard. ZooKeeper and etcd are often better suited to coordination requiring session semantics, sequential nodes, leases, or stronger consistency, although throughput, latency, and operational costs may be higher. See [Distributed Lock Implementations](./distributed-lock-implementations.md) for Redis and ZooKeeper examples.

**A distributed lock is not a distributed transaction.** It controls concurrent entry into a critical section; it does not guarantee that a database commit succeeds or that sending a message and writing an order happen atomically. Business consistency still depends on local transactions, idempotency, state machines, compensation, and related mechanisms.

For the relationship among Leader/Quorum, Lease, and Fencing Token, see [Distributed Coordination](./protocol/centralized-and-decentralized.md).

## Summary

- Distributed locks coordinate mutually exclusive access by multiple processes to an external resource. A local lock only coordinates threads using the same lock within one JVM. If conditional updates or unique constraints enforce the business rule, a separate lock service may be unnecessary.
- Consider mutual exclusion, availability, deadlock prevention, safe release, reentrancy, performance, acquisition semantics, and renewal. Stricter cases also require fencing tokens.
- Common implementations use MySQL, ZooKeeper, Redis, or etcd.

<!-- @include: @article-footer.snippet.md -->
