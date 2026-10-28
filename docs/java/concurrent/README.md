---
title: "Java Concurrency: Threads, Locks, JMM, CAS, AQS, Thread Pools, and Virtual Threads"
description: A Java concurrency learning and interview guide covering threads, locks, synchronized, ReentrantLock, JMM, CAS, AQS, ThreadLocal, thread pools, CompletableFuture, and virtual threads.
category: Java
tag:
  - Java
  - Java Concurrency
  - Java Interviews
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: Java concurrency, Java locks, synchronized, ReentrantLock, JMM, CAS, AQS, ThreadLocal, thread pools, CompletableFuture, concurrent collections, Atomic, virtual threads
---

Concurrency is one of the most important and confusing topics in backend development and technical interviews. Learning it takes more than memorizing APIs: understand thread lifecycles, locks, the memory model, atomic operations, thread pools, and concurrency utilities as connected concepts.

## Who This Guide Is For

- Backend developers who want to study Java concurrency systematically.
- Candidates preparing for interview questions about threads, locks, JMM, CAS, AQS, and thread pools.
- Developers who use threads at work but want to better understand deadlocks, thread pool settings, or ThreadLocal leaks.
- Engineers looking to apply concurrent collections, CompletableFuture, and virtual threads in practice.

## Key Topics

- Thread creation, lifecycles, context switching, thread safety, and common concurrency issues.
- When to use `synchronized`, `volatile`, `ReentrantLock`, mutexes, read-write locks, optimistic locking, and pessimistic locking.
- JMM, happens-before, instruction reordering, visibility, atomicity, and ordering.
- How CAS, Atomic classes, AQS, concurrent collections, and blocking queues work.
- Thread pool parameters, rejection policies, task queues, configuration, and production practices.
- How to use CompletableFuture, ThreadLocal, and virtual threads in real projects, along with their risks.

## Suggested Reading Order

1. [Common Java Concurrency Interview Questions (Part 1)](./java-concurrent-questions-01.md): Start with threads, locks, and thread safety.
2. Continue with [Part 2](./java-concurrent-questions-02.md) and [Part 3](./java-concurrent-questions-03.md), covering JMM, CAS, AQS, thread pools, and concurrency utilities.
3. Read [Java Locks](./java-lock.md), [Optimistic and Pessimistic Locking](./optimistic-lock-and-pessimistic-lock.md), [CAS](./cas.md), and [The Java Memory Model (JMM)](./jmm.md) to understand lock types and concurrency semantics.
4. Study [AQS](./aqs.md) and [AQS in ReentrantLock](./reentrantlock.md) to learn how Java locks and synchronizers work.
5. Read [Java Thread Pools](./java-thread-pool-summary.md) and [Java Thread Pool Best Practices](./java-thread-pool-best-practices.md) to learn about common production infrastructure.

## Core Guides

### Concurrency Interview Questions

- [Common Java Concurrency Interview Questions (Part 1)](./java-concurrent-questions-01.md): Threads, thread safety, locks, and common concurrency issues.
- [Part 2](./java-concurrent-questions-02.md): JMM, volatile, CAS, AQS, and other core topics.
- [Part 3](./java-concurrent-questions-03.md): Thread pools, concurrency utilities, CompletableFuture, and virtual threads.

### Locks, the Memory Model, and Synchronizers

- [Java Locks](./java-lock.md): From mutexes, read-write locks, and spin locks to `synchronized`, `ReentrantLock`, and AQS.
- [Optimistic and Pessimistic Locking](./optimistic-lock-and-pessimistic-lock.md): Compare strategies for handling contention.
- [CAS](./cas.md): Compare-and-swap, the ABA problem, and spin-loop costs.
- [The Java Memory Model (JMM)](./jmm.md): Visibility, atomicity, ordering, and happens-before.
- [AQS](./aqs.md): Synchronization queues, exclusive and shared modes, and common synchronizers.
- [AQS in ReentrantLock](./reentrantlock.md): Learn AQS through the ReentrantLock implementation.

### Concurrency Tools and Engineering Practices

- [Java Thread Pools](./java-thread-pool-summary.md): Core parameters, task queues, rejection policies, and execution flow.
- [Java Thread Pool Best Practices](./java-thread-pool-best-practices.md): Pool isolation, configuration, and monitoring in production.
- [Java Concurrent Collections](./java-concurrent-collections.md): An overview of ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue, and other collections.
- [Atomic Classes](./atomic-classes.md): Atomic updates to primitive values, arrays, references, and fields.
- [ThreadLocal](./threadlocal.md): Thread-local variables, ThreadLocalMap, and memory leak risks.
- [CompletableFuture](./completablefuture-intro.md): Asynchronous workflows, exception handling, and executor usage.
- [Virtual Threads: Common Questions](./virtual-thread.md): Purpose, use cases, and limitations.

## Frequently Asked Questions

- How do threads differ from processes? What states can a thread have?
- What is thread safety, and how can you diagnose a deadlock?
- How do mutexes, read-write locks, and spin locks differ?
- How do `synchronized` and `ReentrantLock` differ?
- Does `volatile` guarantee atomicity? What problem does it solve?
- What is the JMM, and what are happens-before rules for?
- What are the advantages and drawbacks of CAS? How can the ABA problem be addressed?
- What is the core idea behind AQS, and which utilities use it?
- How should you configure a thread pool and choose a rejection policy?
- Why should you avoid creating thread pools directly with `Executors`?
- Why can `ThreadLocal` cause memory leaks?
- What risks come with CompletableFuture's default executor?
- Are virtual threads suitable for CPU-bound tasks?

## Related Topics

- [Java Guide](../)
- [Java Collections](../collection/)
- [JVM](../jvm/)
- [Java I/O](../io/)
- [Operating Systems](../../cs-basics/operating-system/)

<!-- @include: @article-footer.snippet.md -->
