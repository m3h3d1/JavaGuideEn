---
title: "Java Locks: Mutexes, Read-Write Locks, Spin Locks, and synchronized Optimizations"
description: A guide to Java locks, from mutexes, read-write locks, and spin locks to synchronized, ReentrantLock, AQS, and StampedLock, with classifications, implementation details, version differences, and selection advice.
category: Java
tag:
  - Java Concurrency
head:
  - - meta
    - name: keywords
      content: Java locks, mutex, read-write lock, spin lock, synchronized, ReentrantLock, AQS, StampedLock, CAS, lock optimization, concurrency
---

When learning Java concurrency, it is easy to mix up the terminology around locks: mutexes, read-write locks, spin locks, pessimistic and optimistic locking, CAS, AQS, `synchronized`, `ReentrantLock`, `StampedLock`, biased locks, lightweight locks, and heavyweight locks.

These terms do not all belong to the same classification.

Some describe who can enter a critical section, such as mutexes and read-write locks. Others describe how a thread waits when it cannot acquire a lock, such as spinning or blocking. Pessimistic and optimistic locking describe whether shared data is locked before modification or checked at commit time. Biased, lightweight, and heavyweight locks describe how HotSpot optimizes `synchronized` under different levels of contention.

This article first lays out the different ways to classify locks, then looks at common Java lock tools. For details about pessimistic locking, optimistic locking, and CAS, see [Optimistic and Pessimistic Locking](./optimistic-lock-and-pessimistic-lock.md) and [CAS Explained](./cas.md). Here, the focus is on how the concepts fit together.

> This article focuses on HotSpot / OpenJDK. The mutual exclusion and memory semantics of `synchronized` are defined by Java and JVM specifications. Object headers, Mark Words, lightweight locks, and lock inflation are HotSpot implementation optimizations; the Java Language Specification does not promise a fixed implementation. Biased locking has been disabled by default and its related options deprecated since JDK 15; those options were obsoleted in JDK 18. Virtual-thread pinning with `synchronized` also differs between JDK 21–23 and JDK 24 and later.

The table below separates the different classification dimensions:

| Dimension               | Examples                                          | Question answered                                       |
| ----------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| Critical-section access | Mutexes, read-write locks                         | Who can enter the critical section?                     |
| Waiting strategy        | Spin locks, blocking locks                        | How does a thread wait for a lock?                      |
| Concurrency approach    | Pessimistic, optimistic locking                   | Lock before changes or validate later?                  |
| Atomic updates          | CAS, Atomic classes                               | How to update one variable atomically without blocking? |
| JVM optimizations       | Lightweight and heavyweight locks, lock inflation | How does HotSpot reduce `synchronized` overhead?        |
| Java lock APIs          | `synchronized`, `ReentrantLock`, `StampedLock`    | Which API should the code use?                          |

## What Does a Lock Protect?

Locks address the critical-section problem. A critical section is code that accesses shared mutable state and must not interleave arbitrarily across multiple execution units.

![Critical-section access protocol: threads use the same lock to access shared state; bypassing the lock or using a different lock object breaks mutual exclusion](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/os-lock-critical-section.png)

For example, consider this increment:

```java
count++;
```

Although it is one line of source code, it is not an indivisible operation. A thread typically reads `count`, adds 1, and writes the result back. If two threads run this at the same time, both may read `0`, calculate `1`, and write `1`. Both threads incremented the value, but the result increased only once.

The approach is straightforward: acquire the lock before entering the code and release it afterward. If all code that accesses the same shared state follows the same locking protocol, potentially interleaved reads and writes become mutually exclusive.

One point is easy to miss: **a lock protects the protocol for accessing an object's state; the object does not become thread-safe just because it is locked**.

`synchronized (account)` does not magically make every field in `account` safe. If other code bypasses this lock and changes `account.balance` directly, thread safety is still broken. MIT 6.005's locks course emphasizes the same point: a lock must protect the representation invariant of a data abstraction. Locking an arbitrary object does not guarantee that the invariant remains true.

## Mutexes: Only One Thread Enters at a Time

The rule for a mutex is simple: at most one thread can hold the lock and enter the critical section at a time.

In Java, both `synchronized` and `ReentrantLock` can be used as mutexes:

```java
class Counter {
    private int count;

    public synchronized void increment() {
        count++;
    }

    public synchronized int get() {
        return count;
    }
}
```

Using `ReentrantLock` takes a little more code but provides more control:

```java
class Counter {
    private final ReentrantLock lock = new ReentrantLock();
    private int count;

    public void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();
        }
    }
}
```

Do not omit `try/finally`. The JVM releases a `synchronized` monitor whether the block exits normally or with an exception. `ReentrantLock` is an explicit API, so calls to `lock` and `unlock` must be paired. Oracle's `ReentrantLock` documentation recommends entering a `try` block immediately after calling `lock`.

The hard part of using mutexes is not the syntax, but choosing the lock granularity.

A single large lock is easy to reason about but limits concurrency. Multiple smaller locks can improve throughput by protecting different data, but lock ordering, deadlocks, and state consistency become harder to manage. OSTEP discusses the same trade-off for POSIX mutexes: separate locks can increase concurrency, but programmers must know exactly which state each lock protects.

## Read-Write Locks: Shared Reads, Exclusive Writes

Mutexes also restrict reads: while one thread is reading, another cannot enter, even to read. But many application objects have a useful property: reads do not change state, so multiple reader threads can run at the same time without interfering.

Read-write locks are designed for this situation.

They divide access into two types:

- Read lock: A shared lock that multiple threads can hold at once.
- Write lock: An exclusive lock that only one thread can hold, and that excludes read locks.

The rules are easy to remember:

- Reads do not exclude other reads.
- Reads and writes exclude one another.
- Writes exclude other writes.

The typical Java implementation is `ReentrantReadWriteLock`:

```java
class ProfileCache {
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final Lock readLock = rwLock.readLock();
    private final Lock writeLock = rwLock.writeLock();
    private final Map<Long, String> cache = new HashMap<>();

    public String get(long userId) {
        readLock.lock();
        try {
            return cache.get(userId);
        } finally {
            readLock.unlock();
        }
    }

    public void put(long userId, String profile) {
        writeLock.lock();
        try {
            cache.put(userId, profile);
        } finally {
            writeLock.unlock();
        }
    }
}
```

Read-write locks suit read-heavy, write-light workloads where reads are short and the data structure remains consistent during concurrent reads. They are not right for every cache and are not always faster than a mutex. Frequent writes can make readers and writers block one another, and the overhead of maintaining read-write state may outweigh the benefits.

Java also provides `StampedLock`, which supports write locks, pessimistic read locks, and optimistic reads. An optimistic read does not hold a traditional read lock. It obtains a stamp, reads the data, then checks whether a write occurred during the read:

```java
class Point {
    private final StampedLock lock = new StampedLock();
    private double x;
    private double y;

    double distanceFromOrigin() {
        long stamp = lock.tryOptimisticRead();
        double currentX = x;
        double currentY = y;
        if (!lock.validate(stamp)) {
            stamp = lock.readLock();
            try {
                currentX = x;
                currentY = y;
            } finally {
                lock.unlockRead(stamp);
            }
        }
        return Math.hypot(currentX, currentY);
    }
}
```

Optimistic reads with `StampedLock` have limits: the data may be temporarily inconsistent. Use them only for short reads that can be completed into local variables and safely retried if `validate` fails. `StampedLock` is not a direct replacement for `ReentrantReadWriteLock`; in particular, it is not reentrant.

## Spin Locks: Wait Briefly Without Blocking

When a thread cannot acquire a lock, it usually waits in one of two ways:

- Blocking: Suspend the current thread and let the operating system wake it later.
- Spinning: Keep the thread running and repeatedly check on the CPU whether the lock is available.

Spin locks suit very short critical sections. If the lock holder is about to release the lock, suspending and waking the waiting thread may cost more than spinning briefly.

The trade-off is CPU usage: spinning continuously consumes CPU time. If the lock is held for a long time or many threads are waiting, spinning wastes CPU cycles.

Here is a small spin-lock example using CAS in Java:

```java
class SpinLock {
    private final AtomicReference<Thread> owner = new AtomicReference<>();

    public void lock() {
        Thread current = Thread.currentThread();
        while (!owner.compareAndSet(null, current)) {
            Thread.onSpinWait();
        }
    }

    public void unlock() {
        Thread current = Thread.currentThread();
        if (!owner.compareAndSet(current, null)) {
            throw new IllegalMonitorStateException();
        }
    }
}
```

This code illustrates the relationship between spinning and CAS; it is not recommended as an application lock. A production lock must consider reentrancy, fairness, interruption, timeouts, releasing after exceptions, monitoring, and wait queues. The JDK already handles this complexity in `synchronized`, `ReentrantLock`, AQS synchronizers, and Atomic classes.

## Pessimistic Locking, Optimistic Locking, and CAS

Pessimistic and optimistic locking describe two approaches to concurrency control, not specific Java classes.

Pessimistic locking assumes conflicts are likely, so it locks the resource before using it. Common examples include `synchronized`, `ReentrantLock`, and database `SELECT ... FOR UPDATE`.

Optimistic locking assumes conflicts are uncommon. It does not block other threads in advance; instead, it checks whether the data changed when committing an update. A database `version` field and CAS in Java Atomic classes follow this approach.

CAS (compare-and-swap) is an atomic update operation supported by hardware: it changes a value only if the current value still matches the expected old value. Otherwise, another thread changed it first, and the current thread can retry, give up, or use a fallback.

CAS has three common limitations:

- Retrying after failure consumes CPU, especially under heavy contention.
- CAS naturally handles one variable at a time; consistency across multiple variables requires additional design.
- The ABA problem: a value changes from A to B and back to A, making it appear unchanged if only the value is checked.

Version numbers, timestamps, or marked references can address ABA. Java provides tools such as `AtomicStampedReference` and `AtomicMarkableReference`, though application code more commonly includes a version in the data model itself.

For implementation details, versioning examples, ABA handling, and Atomic class source code, see:

- [Optimistic and Pessimistic Locking](./optimistic-lock-and-pessimistic-lock.md)
- [CAS Explained](./cas.md)
- [Java Atomic Classes](./atomic-classes.md)

## How synchronized Works: Monitors, Bytecode, and Memory Semantics

`synchronized` is built into the Java language. It can be applied to instance methods, static methods, or code blocks.

```java
class Account {
    private long balance;

    public synchronized void deposit(long amount) {
        balance += amount;
    }

    public long balance() {
        synchronized (this) {
            return balance;
        }
    }
}
```

Synchronized methods and blocks are represented differently in bytecode:

- Synchronized methods use the method access flag `ACC_SYNCHRONIZED`.
- Synchronized blocks generate `monitorenter` and `monitorexit` instructions.

Regardless of the representation, the semantics are to enter and exit a monitor. The Java Language Specification also defines a happens-before relationship between releasing a lock and a later acquisition of the same lock: writes made before release are visible to the thread that subsequently acquires it.

This is one way `synchronized` differs from a lock that provides mutual exclusion alone: it also provides memory visibility. Without visibility guarantees, another thread could still read a stale value even if access to a critical section is protected.

`synchronized` is also reentrant. A thread that already holds an object's monitor can enter code protected by the same lock again. The JVM tracks the reentrancy count and decrements it as the thread exits each level.

```java
class ReentrantDemo {
    public synchronized void outer() {
        inner();
    }

    public synchronized void inner() {
        // The same thread can enter this object's monitor again
    }
}
```

## synchronized Optimizations: Lock States Are Not a Fixed Progression

Many resources describe `synchronized` as progressing through “unlocked -> biased -> lightweight -> heavyweight” states. This can help explain early HotSpot optimizations, but the details depend on the JDK version.

Since JDK 6, HotSpot has made many optimizations to `synchronized`. Biased locking targeted cases where the same thread repeatedly entered the same lock. Lightweight locking targeted low-contention cases where threads entered at different times. Heavyweight locking uses an `ObjectMonitor`, and contending threads may be blocked and awakened.

Keep these version differences in mind:

- JDK 6–14: Biased locking was a common HotSpot optimization.
- JDK 15: JEP 374 disabled biased locking by default and deprecated the related options.
- JDK 18: The biased-locking options became obsolete. If provided, they are ignored and a warning is issued.
- JDK 21–23: A virtual thread blocked in `synchronized` may pin its carrier platform thread.
- JDK 24: JEP 491 improved virtual-thread interaction with `synchronized`, allowing a virtual thread blocked on a monitor to release its underlying platform thread and reducing pinning.

In an interview or article, it is fair to say that HotSpot has used biased, lightweight, and heavyweight locking to reduce the cost of `synchronized`. Do not describe biased locking as a default path in modern JDKs.

The practical takeaway is that the old advice to “avoid `synchronized` whenever possible” no longer applies. For ordinary mutual exclusion, it has simple syntax, safely releases the monitor after exceptions, and benefits from mature JIT optimizations. Consider `ReentrantLock` when you need fairness, interruptible or timed acquisition, or multiple condition queues.

## How ReentrantLock, Condition, and AQS Fit Together

`ReentrantLock` offers more control than `synchronized`:

- Choose between fair and non-fair locking.
- Use `lockInterruptibly()` to respond to interruption.
- Use `tryLock()` or `tryLock(timeout, unit)` to avoid waiting indefinitely.
- Create multiple `Condition` instances to manage different wait conditions separately.

Here is a typical example:

```java
class BoundedBuffer<E> {
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();
    private final Queue<E> queue = new ArrayDeque<>();
    private final int capacity;

    BoundedBuffer(int capacity) {
        this.capacity = capacity;
    }

    public void put(E item) throws InterruptedException {
        lock.lockInterruptibly();
        try {
            while (queue.size() == capacity) {
                notFull.await();
            }
            queue.add(item);
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    public E take() throws InterruptedException {
        lock.lockInterruptibly();
        try {
            while (queue.isEmpty()) {
                notEmpty.await();
            }
            E item = queue.remove();
            notFull.signal();
            return item;
        } finally {
            lock.unlock();
        }
    }
}
```

Do not casually replace `while` with `if`. Waking up only means that a thread can compete for the lock again and check the condition; it does not guarantee that the condition is true. Spurious wakeups, competition among waiting threads, or another thread consuming the resource first all make it necessary to check again.

`ReentrantLock` is built on AQS (AbstractQueuedSynchronizer). At a high level, AQS is a synchronizer framework: it uses a `state` value to represent synchronization state, a FIFO queue to manage threads that could not acquire the resource, and CAS plus `LockSupport.park/unpark` to queue, block, and wake threads.

Many concurrency utilities are built on AQS, including `ReentrantLock`, `Semaphore`, `CountDownLatch`, and `ReentrantReadWriteLock`. To explore the queue, `state`, CAS, and blocking and signaling in more detail, see [AQS Explained](./aqs.md) and [AQS in ReentrantLock](./reentrantlock.md).

## Choosing a Java Lock

Do not start by asking which lock is fastest. Performance depends on the critical-section length, contention, thread count, and what happens when an operation fails. First ask: what shared state does this code protect? How long is the lock held? Can a thread wait if it cannot acquire the lock? If waiting fails, should it return, retry, or throw an error?

For a small piece of state inside one JVM, such as updating a few fields, maintaining an in-memory map, or changing an object's state, `synchronized` is often enough. It is concise, releases the lock automatically when the block exits, and avoids forgetting to call `unlock()`. Use `ReentrantLock` when you need timed or interruptible acquisition, fairness, or multiple `Condition` queues.

For read-heavy workloads, consider `ReentrantReadWriteLock`. The key is that writes must be infrequent; simply having read methods is not enough. Frequent writes make readers and writers block one another, and tracking read-write state adds overhead, so a mutex may be more efficient. Optimistic reads with `StampedLock` are suited to narrower cases: keep the read logic short, tolerate a potentially inconsistent intermediate value, and be prepared to read again if validation fails.

For a counter, flag, or reference update, first consider Atomic classes, `LongAdder`, or `LongAccumulator`. These tools suit short atomic updates, not entire business workflows inside a CAS retry loop. Longer workflows make retries more likely to waste CPU and make side effects harder to handle.

If the problem crosses JVM boundaries, such as multiple application instances updating the same database row, Java locks cannot coordinate them. For infrequent conflicts, use a version field for optimistic locking. For frequent conflicts or updates that require strong consistency, use database mechanisms such as row locks, `SELECT ... FOR UPDATE`, or unique constraints. Cross-service mutual exclusion requires an external system such as Redis, ZooKeeper, or a database; `synchronized` and `ReentrantLock` cannot provide it.

Do not pursue the smallest possible lock granularity at all costs. A large lock is easier to get right but may limit throughput. Splitting it into smaller locks can reduce contention, but raises the cost of managing lock order, deadlocks, and debugging. It is often safer to start with one clear lock that protects the invariant, then split it based on load-test results.

## Common Pitfalls

**Changing lock objects.**

Some code appears to use a lock but may actually lock different objects. This can happen when the lock object changes, for example when it is a concatenated string, a boxed value, or a reassignable field. Thread A may lock the old object while thread B locks the new one, so the critical section is no longer protected by a common lock.

```java
private Object lock = new Object();

public void update() {
    synchronized (lock) {
        lock = new Object(); // Later threads may lock a different object
    }
}
```

If you need a dedicated lock object, define it as `private final` and do not expose it to external code.

**Locking externally visible objects.**

`synchronized (this)` and `synchronized (SomeClass.class)` can be appropriate, but external code may also lock those objects, making contention hard to control. Be especially careful in library code; a private final lock object is often preferable.

```java
private final Object lock = new Object();
```

**Performing slow work while holding a lock.**

Database access, RPC calls, or writing large files while holding a lock increases the time it is held. The longer a lock is held, the more threads may wait, increasing the risks of timeouts, thread pool exhaustion, and deadlocks.

**Inconsistent lock ordering.**

If two threads acquire locks in opposite orders (`A -> B` and `B -> A`), they can deadlock. When using multiple locks, define a stable global order for acquiring them. See [Deadlocks Explained](../../cs-basics/operating-system/dead-lock.md) for details.

**Confusing thread-safe classes with compound operations.**

Individual `get` and `put` calls on `ConcurrentHashMap` are thread-safe, but “check whether an entry exists, then insert it” is a compound operation. Use an atomic method such as `computeIfAbsent` or add synchronization.

```java
// Not recommended: another thread may insert between containsKey and put
if (!map.containsKey(key)) {
    map.put(key, createValue());
}

// Recommended: use ConcurrentHashMap's atomic method for the compound operation
map.computeIfAbsent(key, ignored -> createValue());
```

**Checking only locks and ignoring resource pools.**

Many production hangs have nothing to do with Java lock deadlocks. Threads may be waiting for database connections, HTTP connections, thread pool capacity, or an external service. Seeing `WAITING` in a thread dump only shows that a thread is waiting; diagnosing a deadlock requires finding a persistent cycle of waits.

## Summary

“Lock” is an umbrella term for a broad set of concurrency-control tools.

Mutexes and read-write locks answer “who can enter the critical section?” Spin and blocking locks answer “how does a thread wait if it cannot acquire the lock?” Pessimistic and optimistic locking answer “how are conflicts handled?” CAS and Atomic classes support atomic updates to one variable. `synchronized`, `ReentrantLock`, `StampedLock`, and AQS bring these ideas into Java code.

When writing code, first identify the shared state and its invariants. Then decide what the lock protects, how fine-grained it should be, whether waiting can be interrupted, and whether a failed operation can be retried. The tool is only a means; what matters is a consistent synchronization protocol that every access path follows.

## References

- [The Java Language Specification, Chapter 17. Threads and Locks](https://docs.oracle.com/javase/specs/jls/se24/html/jls-17.html)
- [The Java Virtual Machine Specification, monitorenter](https://docs.oracle.com/javase/specs/jvms/se24/html/jvms-6.html#jvms-6.5.monitorenter)
- [Oracle Java API: Lock](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/locks/Lock.html)
- [Oracle Java API: ReentrantLock](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/locks/ReentrantLock.html)
- [Oracle Java API: StampedLock](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/locks/StampedLock.html)
- [OpenJDK JEP 374: Deprecate and Disable Biased Locking](https://openjdk.org/jeps/374)
- [OpenJDK JEP 491: Synchronize Virtual Threads without Pinning](https://openjdk.org/jeps/491)
- [OSTEP, Chinese edition: Locks](https://pages.cs.wisc.edu/~remzi/OSTEP/Chinese/28.pdf)
- [MIT 6.005: Locks and Synchronization](http://web.mit.edu/6.005/www/fa15/classes/23-locks/)
