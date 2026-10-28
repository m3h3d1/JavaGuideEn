---
title: "JVM Interview Questions: Memory, Class Loading, Garbage Collection, and Production Troubleshooting"
category: Java
description: A JVM interview review covering runtime memory areas, object creation, class files and loading, garbage collection, JVM options, JDK diagnostic tools, OOM, frequent Full GC, and high CPU usage.
tag:
  - Java
  - JVM
  - Interview Questions
head:
  - - meta
    - name: keywords
      content: JVM interview questions,Java memory areas,object creation,class loading,parent delegation,garbage collection,G1,ZGC,JVM options,OOM,Full GC,high CPU,JVM tuning
---

JVM interviews rarely stop at "What's the difference between the heap and the stack?" After asking about memory areas, interviewers often ask how objects are allocated, which objects can be reclaimed, why a GC pause occurs, and how to investigate OOM, frequent Full GC, or high CPU usage in production.

This article is a review guide for the JavaGuide JVM section. It groups questions into five areas: memory and objects, class files and loading, garbage collection, JVM options and diagnostic tools, and production troubleshooting. The corresponding guides contain detailed answers.

If you're short on time, start with the [JVM interview question summary](https://interview.javaguide.cn/java/java-jvm.html). Mark questions you cannot answer fully, then use this article and the related guides to review the details.

## What Should You Focus on When Reviewing the JVM?

| Topic                      | What to explain                                                                  | Common follow-up questions                                                        |
| -------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Memory and objects         | How runtime areas are divided, and how objects are created, stored, and accessed | Heap, stack, method area, direct memory, object headers, TLAB, OOM                |
| Class files and loading    | How `.class` files enter the JVM and when classes are initialized                | Constant pool, loading process, class loaders, parent delegation, class isolation |
| Garbage collection         | How object liveness is determined, memory is reclaimed, and pauses occur         | GC Roots, reference types, collection algorithms, CMS, G1, ZGC, Full GC           |
| Options and tools          | How to choose options for a JDK version, collector, and observed behavior        | `-Xms`, `-Xmx`, GC logs, Heap Dump, jstat, jstack, JFR                            |
| Production troubleshooting | How to preserve evidence, narrow down a problem, and verify a fix                | CPU, Load, OOM, memory leaks, frequent GC, blocked threads                        |

Most object instances are allocated on the heap. Active threads, static fields, and other locations may hold references to them. The GC checks reachability from GC Roots, then the collector reclaims objects. When memory use rises or pauses occur, use GC logs, thread stacks, heap dumps, and system metrics to find the cause instead of increasing the heap as soon as you see Full GC.

## JVM Memory Areas and Objects

Naming the runtime areas is not enough. Follow-up questions may cover which threads share each area, what it stores, its lifetime, and which errors it can throw. The method area is a logical area defined by the JVM specification; PermGen and Metaspace are HotSpot implementations from different versions. Keep these concepts distinct.

Related guide: [Java Memory Areas Explained](./memory-area.md)

Common questions:

- What areas make up the JVM runtime data area? Which ones are thread-private?
- What are the roles of the program counter, JVM stack, and native method stack?
- What happens to a stack frame between a Java method call and its return?
- What can cause `StackOverflowError` and `OutOfMemoryError`?
- What does the Java heap mainly store? Are all objects allocated there?
- How are the method area, PermGen, and Metaspace related? Why was PermGen removed?
- How do the runtime constant pool and string pool differ? How have their locations changed?
- Is direct memory part of the JVM runtime data area? Why can it also cause OOM?
- What steps does HotSpot take to create an object?
- When are bump-pointer allocation and free lists used? What do CAS and TLAB address during concurrent allocation?
- What do the object header, instance data, and padding store?
- How do handle-based and direct-pointer object access differ? Which does HotSpot mainly use?

For an OOM question, first identify whether the exhausted resource is the Java heap, Metaspace, direct memory, or the native memory needed to create threads. Saying only "increase `-Xmx`" overlooks causes such as unbounded collections, class loader leaks, unreleased direct memory, and too many threads.

## Class Files and Class Loading

Class loading questions often start with "How is a class loaded?" Follow-ups cover initialization timing, parent delegation, and isolation between class loaders. These topics include both the lifecycle defined by the JVM specification and implementation details of HotSpot and JDK class loaders, so state which JDK version you're discussing.

Related guides:

- [Class File Structure Explained](./class-file-structure.md)
- [Class Loading Process Explained](./class-loading-process.md)
- [Java Class Loaders Explained](./classloader.md)

Common questions:

- What are the parts of a class file? What are the roles of the magic number, version, and constant pool?
- Where are a method's bytecode instructions stored in a class file?
- What stages does a class go through from loading to unloading?
- What happens during loading, verification, preparation, resolution, and initialization?
- How does assigning a static field during preparation differ from assigning it during initialization?
- What triggers class initialization? Does accessing a compile-time constant trigger it?
- How does `<clinit>` differ from the constructor `<init>`?
- Which classes are loaded by the bootstrap, platform, and application class loaders? How did the JDK 8 extension class loader differ?
- What is the parent delegation model? How does it reduce the risk of core classes being reloaded or replaced?
- How does parent delegation work? What happens if a parent loader cannot load a class?
- Which scenarios break parent delegation? What problem does the thread context class loader solve?
- Do two classes with the same fully qualified name have to be the same class?
- Should a custom class loader usually override `findClass()` or `loadClass()`?

Describing parent delegation as a fixed upward search chain is incomplete. A class's identity depends on both its fully qualified name and its defining class loader. SPI, application server isolation, and hot deployment use different loading strategies for different reasons.

## Garbage Collection

Garbage collection questions cover object allocation and liveness, as well as specific collectors. Throughput, pause time, and memory use involve trade-offs. When choosing a collector, consider the JDK version, heap size, and application latency requirements instead of comparing algorithm names alone.

Related guide: [JVM Garbage Collection Explained](./jvm-garbage-collection.md)

Common questions:

- How are the young and old generations usually divided? How are objects allocated and promoted?
- How can large or long-lived objects enter the old generation?
- What is allocation pretenure?
- Why does reference counting have trouble with cycles between objects?
- How does reachability analysis determine whether an object is live? Which objects can be GC Roots?
- How do strong, soft, weak, and phantom references differ?
- What are the trade-offs of mark-sweep, copying, and mark-compact algorithms?
- Why does generational collection use different algorithms for the young and old generations?
- How do Minor GC, Major GC, and Full GC differ? Why should these terms be understood in the context of a collector and its logs?
- How do Serial, Parallel, CMS, G1, and ZGC differ in goals and use cases?
- Why can CMS produce memory fragmentation and floating garbage?
- How does G1 use regions, collection-set predictions, and mixed collections to manage pauses?
- How does ZGC reduce long pauses? What trade-offs do low-pause collectors make?
- What can trigger Full GC? What data should you check first when Full GC is frequent?

Event names, memory regions, and options in GC logs vary by JDK and collector. In an interview, state the runtime environment first, then explain what triggered a collection, which areas it covered, its pause phases, and its result. Memorizing version-independent claims can lead to contradictions during follow-up questions.

## JVM Options and Diagnostic Tools

Option questions test the reasoning behind a configuration. Discuss heap size, young-generation sizing, collectors, and logging options in the context of deployment memory, allocation rate, latency goals, and JDK version. In particular, avoid blindly copying older configurations centered on a fixed young-generation size when using G1.

Related guides:

- [Common JVM Options](./jvm-parameters-intro.md)
- [JDK Monitoring and Troubleshooting Tools](./jdk-monitoring-and-troubleshooting-tools.md)

Common questions:

- What do `-Xms`, `-Xmx`, `-Xmn`, and `-Xss` control?
- Why do server applications often set `-Xms` and `-Xmx` to the same value?
- How do `-XX:MetaspaceSize` and `-XX:MaxMetaspaceSize` differ?
- How do you choose a garbage collector for an application? What data should you collect before switching?
- How do you configure GC logging in JDK 8 and JDK 9 or later?
- How can you generate a Heap Dump automatically after OOM? Why should you check available disk space first?
- What are `jps`, `jstat`, `jinfo`, `jmap`, `jstack`, and `jcmd` useful for?
- How can `jstat` help you observe GC frequency, region capacity, and object promotion?
- What information can a thread dump provide when threads are blocked, deadlocked, or using high CPU?
- How do Heap Dumps and thread dumps differ? Which one does `kill -3` generate?
- When analyzing a Heap Dump in MAT, what do the Dominator Tree and paths to GC Roots show?
- What runtime information can JFR, JMC, and VisualVM show? What overhead should you consider when collecting data online?

Generating a Heap Dump or class histogram, or sampling frequently, can increase production load. Dump files may also contain business data. Before running diagnostic commands, check their impact, available disk space, and where files will be stored. Before an emergency restart, preserve at least the alert time, key metrics, thread stacks, and relevant GC information.

## JVM Production Troubleshooting

Production incidents rarely have a single command that identifies the cause. After an alert, check the timeline, impact, recent changes, and system resources before deciding whether to collect thread stacks, GC logs, or a heap dump. If users are affected, contain the impact and preserve evidence in parallel; do not let the incident worsen while collecting every possible artifact.

Related guide: [Troubleshooting Java Production Issues](./jvm-in-action.md)

Common questions:

- When CPU usage is high, how do you go from the process to the thread and its stack trace?
- If CPU usage is low but system load is high, which thread states and system metrics should you check?
- If an endpoint is slow but CPU usage is normal, how do you distinguish lock waits, I/O, connection pools, and downstream latency?
- When memory use keeps rising, how do you distinguish cache growth, a high allocation rate, and a memory leak?
- After a Java process runs out of memory, how do you tell whether the problem is in the heap, Metaspace, direct memory, or native memory?
- If Young GC is frequent but each collection is quick, what should you investigate?
- When Full GC is frequent, how do you inspect old-generation growth, object promotion, and collection results?
- When should you generate a Heap Dump? What are the risks of running `jmap -dump` directly in production?
- How are a growing thread pool queue, CPU usage, and thread states related?
- Which metrics should you compare after a JVM fix to confirm it worked?
- How should you answer an interview question about an incident you did not personally handle?

Troubleshooting should build a chain of evidence. For high CPU, identify the Java process and thread using the most CPU, convert the thread ID to the format used in the thread dump, and compare several stack traces to see whether execution remains in the same code. For memory issues, combine GC logs, object histograms, Heap Dumps, and native memory data; JVM heap usage alone cannot explain every OOM.

## Plan Your Review by Available Time

| Time available   | Suggested plan                                                                                                                                                                                    | Goal                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1–2 days         | Review the [JVM interview question summary](https://interview.javaguide.cn/java/java-jvm.html), focusing on memory areas, object creation, class loading, object liveness, and common collectors. | Answer common fundamentals and identify which JDK and collector each claim applies to. |
| 3–7 days         | Review JVM options, GC logs, and JDK diagnostic tools. Practice explaining how you would investigate high CPU, OOM, and frequent Full GC.                                                         | Choose metrics and tools based on an alert, and explain the risks of using them.       |
| More than a week | Read the JVM guides and analyze a GC log, thread dump, or Heap Dump in a local or test environment. Record the project's JDK, collector, heap settings, and runtime metrics.                      | Connect JVM concepts and configuration to observed behavior and verification.          |

Experienced-hire and senior interviews often ask for the reasoning behind JVM options and the evidence used in troubleshooting. If you have not handled a production JVM incident, answer based on what you observed in a test environment and the relevant guides. Explain what you would collect first and how you would narrow down the cause; do not present a study example as a production incident you handled.

<!-- @include: @article-footer.snippet.md -->
