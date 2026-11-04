---
title: "Java Guide: Fundamentals, Collections, Concurrency, JVM, I/O, and New Features"
description: A Java learning path for interviews and backend development, covering fundamentals, collections, concurrency, the JVM, I/O and NIO, and Java features.
category: Java
tag:
  - Java
  - Java Fundamentals
  - Java Interviews
sitemap:
  changefreq: weekly
  priority: 0.95
head:
  - - meta
    - name: keywords
      content: Java,Java fundamentals,Java collections,Java concurrency,JVM,Java IO,Java NIO,Java features,Java interview questions,Java backend interviews
---

<!-- @include: @small-advertisement.snippet.md -->

This **Java guide** is for backend developers studying Java and preparing for interviews. It organizes the site's Java articles in this order: fundamentals, collections, concurrency, I/O and NIO, the JVM, and new features.

If you have limited time, start with the interview guides for Java fundamentals, collections, concurrency, and the JVM. To build a broader foundation, follow the topic order below.

## Who Should Read This?

- Backend developers learning Java systematically.
- Candidates preparing for new-graduate or experienced-hire interviews at Java backend teams, including larger companies.
- Readers reviewing Java fundamentals, collections, concurrency, the JVM, I/O, and new features together.
- Engineers with Java project experience who want a more systematic understanding of internals, source-code design, and engineering practices.

## Key Topics

- Core Java mechanisms: syntax, object-oriented programming, exceptions, generics, reflection, proxies, and serialization.
- Usage, implementation, and interview questions for `List`, `Map`, `Queue`, and concurrent collections.
- Java threads, locks, the Java Memory Model (JMM), CAS, AQS, thread pools, `CompletableFuture`, and virtual threads.
- JVM memory areas, class loading, garbage collection, configuration, diagnostic tools, and production troubleshooting.
- BIO, NIO, AIO, I/O models, and I/O design patterns such as Decorator and Adapter.
- Important Java features from Java 8 through Java 26, and how they affect day-to-day development.

## Suggested Reading Order

1. [Java Fundamentals](./basis/): Learn syntax, object-oriented programming, generics, reflection, proxies, and serialization.
2. [Java Collections](./collection/): Study common collections such as `ArrayList`, `LinkedList`, `HashMap`, and `ConcurrentHashMap`, including their implementations.
3. [Java Concurrency](./concurrent/): Learn threads, locks, the JMM, CAS, AQS, thread pools, and concurrency utilities.
4. [JVM](./jvm/): Study memory areas, class loading, garbage collection, JVM options, and production troubleshooting.
5. [Java I/O](./io/): Learn BIO, NIO, AIO, Reactor, I/O multiplexing, and I/O design patterns.
6. [Java New Features](./new-features/): Review key features by release, including lambdas, streams, modules, `var`, records, and virtual threads.

## Core Guides

### Java Fundamentals

- [Java Fundamentals](./basis/): An overview of core Java mechanisms and common interview topics.
- [Common Java Interview Questions, Part 1](./basis/java-basic-questions-01.md): Java's characteristics, syntax, object-oriented programming, and common classes.
- [Common Java Interview Questions, Part 2](./basis/java-basic-questions-02.md): Exceptions, generics, reflection, annotations, and related details.
- [Common Java Interview Questions, Part 3](./basis/java-basic-questions-03.md): Advanced fundamentals and common pitfalls.
- [A Detailed Look at Pass-by-Value in Java](./basis/why-there-only-value-passing-in-java.md): How pass-by-value, reference variables, and object mutation relate.
- [Java Serialization](./basis/serialization.md): Serialization, `serialVersionUID`, security risks, and alternatives.
- [Java Reflection](./basis/reflection.md) and [Java Proxies](./basis/proxy.md): Common mechanisms used by frameworks.

### Java Collections

- [Java Collections](./collection/): The Collections Framework, usage guidance, and source-code analysis.
- [Common Java Collections Interview Questions, Part 1](./collection/java-collection-questions-01.md) and [Part 2](./collection/java-collection-questions-02.md): Common questions about `List`, `Set`, `Map`, `Queue`, and concurrent collections.
- [Java Collection Usage Guidelines](./collection/java-collection-precautions-for-use.md): Null checks, iteration, resizing, thread safety, and performance.
- [ArrayList](./collection/arraylist-source-code.md), [HashMap](./collection/hashmap-source-code.md), and [ConcurrentHashMap](./collection/concurrent-hash-map-source-code.md): Understand common collection design choices through source code.

### Java Concurrency

- [Java Concurrency](./concurrent/): Threads, locks, the memory model, thread pools, and concurrency utilities.
- [Common Java Concurrency Interview Questions, Part 1](./concurrent/java-concurrent-questions-01.md), [Part 2](./concurrent/java-concurrent-questions-02.md), and [Part 3](./concurrent/java-concurrent-questions-03.md): Review common concurrency questions.
- [Java Memory Model (JMM)](./concurrent/jmm.md): Visibility, atomicity, ordering, and happens-before.
- [CAS](./concurrent/cas.md), [AQS](./concurrent/aqs.md), and [Java Thread Pools](./concurrent/java-thread-pool-summary.md): Core topics in Java concurrency.
- [Java Virtual Threads](./concurrent/virtual-thread.md): How Project Loom affects the concurrency model.

### JVM and I/O

- [JVM](./jvm/): Memory, class loading, garbage collection, options, diagnostic tools, and production troubleshooting.
- [Java Memory Areas](./jvm/memory-area.md): The program counter, JVM stack, native method stack, heap, and method area.
- [JVM Garbage Collection](./jvm/jvm-garbage-collection.md): Object reachability, garbage-collection algorithms, and major collectors.
- [Class Loading](./jvm/class-loading-process.md) and [Class Loaders](./jvm/classloader.md): The class lifecycle and parent delegation.
- [Java I/O](./io/): BIO, NIO, AIO, I/O models, and design patterns.
- [Java I/O Basics](./io/io-basis.md), [Java NIO Basics](./io/nio-basis.md), and [Java I/O Models](./io/io-model.md): Foundations for network programming and middleware.

### Java New Features

- [Java New Features](./new-features/): Language, standard library, and JVM features by release since Java 8.
- [Practical Java 8 Features](./new-features/java8-common-new-features.md): Lambdas, streams, `Optional`, default methods, and the new date and time API.
- [Java 11 Features](./new-features/java11.md), [Java 17 Features](./new-features/java17.md), and [Java 21 Features](./new-features/java21.md): Start with the long-term support releases.

## Common Questions

- Why is Java pass-by-value? What happens when an object reference is passed as an argument?
- How do `String`, `StringBuilder`, and `StringBuffer` differ?
- How are `equals()` and `hashCode()` related?
- When should you choose `ArrayList` or `LinkedList`? Why is `HashMap` not thread-safe?
- How did `ConcurrentHashMap` change between JDK 7 and JDK 8?
- How do `synchronized` and `ReentrantLock` differ?
- How does the JMM ensure visibility, ordering, and atomicity?
- How should thread-pool parameters be configured? Why should you avoid using `Executors` directly?
- How is JVM memory divided? Which areas can cause an `OutOfMemoryError`?
- Which use cases suit G1, ZGC, and Shenandoah?
- How do BIO, NIO, and AIO differ? What problem does the Reactor pattern solve?
- Which Java 8, 11, 17, and 21 features are most useful to know?

## Related Topics

- [Computer Science Fundamentals](../cs-basics/)
- [System Design](../system-design/)
- [Databases](../database/)
- [Distributed Systems](../distributed-system/)
- [High-Performance Systems](../high-performance/)

<!-- @include: @article-footer.snippet.md -->
