---
title: The Java Memory Model (JMM)
description: An in-depth guide to the Java Memory Model, covering CPU caches, instruction reordering, happens-before, memory visibility, and the rules behind Java concurrency.
category: Java
tag:
  - Java Concurrency
head:
  - - meta
    - name: keywords
      content: JMM,Java Memory Model,CPU cache,instruction reordering,happens-before,memory visibility,concurrency model
---

The **Java Memory Model (JMM)** is a set of rules Java defines for concurrent programming. It describes the relationship between threads and main memory, and the concurrency rules that apply as Java source code is translated into instructions the CPU can execute. Its main goals are to **make multithreaded programming simpler** and **improve portability**.

The JMM primarily defines when a write to a shared variable by one thread becomes **visible** to other threads.

To understand the JMM, start with the **CPU cache model** and **instruction reordering**.

## The CPU Cache Model

**Why have CPU caches?** Like the caches used in web systems (such as Redis), they help bridge a speed gap. **CPU caches bridge the gap between CPU processing speed and memory access speed.**

You can also think of **memory as a cache for storage**. A program copies data from storage into memory while it runs, improving access speed because memory is much faster.

In short: **CPU caches hold memory data to bridge the CPU-to-memory speed gap; memory holds data from storage to reduce the cost of slow storage access.**

The diagram below illustrates a simple CPU cache model.

> **🐛 Correction (see [issue #1848](https://github.com/Snailclimb/JavaGuide/issues/1848)):** The CPU cache diagram has been revised for accuracy.

![CPU cache model](https://oss.javaguide.cn/github/javaguide/java/concurrent/cpu-cache.png)

Modern CPUs usually have three cache levels: L1, L2, and L3. Some CPUs also have an L4 cache, which is uncommon and not covered here.

**How CPU caches work:** Data is copied into a CPU cache so the CPU can read it quickly. After an operation, the result is written back to main memory. This can lead to **inconsistent cached values**. For example, if two threads both read `i = 1`, increment it, and write it back, the result may be `i = 2` instead of the expected `i = 3`.

**CPUs can address cache inconsistency with cache-coherence protocols, such as [MESI](https://en.wikipedia.org/wiki/MESI_protocol), or other mechanisms.** A cache-coherence protocol defines rules for interactions between CPU caches and main memory. Different CPUs may use different protocols.

![Cache-coherence protocol](https://oss.javaguide.cn/github/javaguide/java/concurrent/cpu-cache-protocol.png)

CPU cache coherence is implemented jointly by the processor and its memory subsystem. Processor architectures also define the order in which memory operations can appear to other processors; this is called the hardware memory model. The JMM sits at a higher, language level, and the JVM maps its requirements to instructions and barriers provided by the target processor.

## Instruction Reordering

Now that we have covered CPU caches, let's look at another important concept: **instruction reordering**.

To improve performance, a computer may reorder instructions while executing a program.

**What is instruction reordering?** The system may not execute instructions in the same order as they appear in the source code.

There are two common forms of instruction reordering:

- **Compiler reordering:** Compilers, including the JVM's JIT compiler, may rearrange statements as long as single-threaded program behavior is unchanged.
- **Instruction-level parallelism (ILP):** Modern processors overlap the execution of multiple instructions. If there are no data dependencies, they may execute machine instructions in a different order.

The memory system can also appear to reorder operations, though it is not reordering in the same sense. In the JMM, main memory and a thread's local view may differ, which can cause problems in multithreaded programs.

Java source is compiled to bytecode, interpreted or compiled by the JIT, and ultimately executed as machine instructions by the JVM on the target platform. Compiler optimizations, out-of-order processor execution, and memory-system behavior can make the order observed by multiple threads differ from the apparent source order. These are not stages in a fixed, strictly linear “reordering pipeline.”

**Instruction reordering preserves single-threaded behavior, but is not required to preserve behavior across threads**, so it can cause problems in multithreaded programs.

Compiler reordering and processor-level reordering (including instruction-level parallelism and memory-system effects) are controlled in different ways:

- For compilers, prevent reordering by disallowing specific compiler transformations.

- For processors, use memory barriers (also called memory fences) to prevent specific types of processor reordering.

> A memory barrier (also called a memory fence) constrains the ordering and visibility of specific memory accesses. Its implementation varies by processor architecture; it should not be treated as a universal “flush caches to physical memory” or “invalidate all caches” operation. The JVM chooses instructions for the target platform that satisfy the JMM semantics.

## The Java Memory Model (JMM)

### What Is the JMM, and Why Do We Need It?

Java was one of the first programming languages to define a memory model. The early model had shortcomings, such as making compiler optimization difficult. Starting with Java 5, Java adopted a revised model in [JSR-133: Java Memory Model and Thread Specification](http://www.cs.umd.edu/~pugh/java/memoryModel/CommunityReview.pdf).

Programming languages can reuse an operating system's memory model, but operating systems differ. Code that relies directly on one operating system's model may behave differently on another. Java is cross-platform, so it defines its own memory model to abstract away these differences.

That is one reason the JMM exists. It is a set of rules Java defines for concurrent programming. Besides describing the relationship between threads and main memory, it specifies concurrency requirements for the process that translates Java source into instructions the CPU can execute. Its goals are to simplify multithreaded programming and improve portability.

**Why do these rules matter?** CPU caches and instruction reordering can cause problems in concurrent programs. For example, reordering can change what one thread observes from another. The JMM uses the happens-before principle, described below, to define the ordering and visibility guarantees needed to address these issues.

In short, the JMM defines rules that help developers write multithreaded programs. Java developers can use concurrency features such as `volatile`, `synchronized`, and `Lock` implementations without having to manage the underlying hardware details themselves.

### How Does the JMM Model Threads and Main Memory?

The **Java Memory Model (JMM)** abstracts the relationship between threads and main memory. For example, shared variables are modeled as residing in main memory.

Java has had a memory model since its early specifications. Java 5 made major revisions through JSR-133, clarifying and strengthening the semantics of `volatile`, `final`, and happens-before. The JMM allows the JVM to use registers, caches, and compiler optimizations when accessing shared variables. Without the required synchronization, one thread may not see another thread's latest write.

This is similar to the CPU cache model described above.

**What are main memory and local memory?**

- **Main memory:** The JMM uses this concept for variables that can be shared between threads, including instance fields, static fields, and array elements. Method-local variables, parameters, and exception-handler parameters are not shared this way. Main memory is an abstract concept in the specification, not a particular physical memory region.
- **Local memory:** Each thread has a private local view containing copies of shared variables it has read or written. A thread can operate only on its own local view, not another thread's. Threads communicate through main memory. Local memory is an abstraction, not a physical component; it can represent caches, write buffers, registers, and other hardware or compiler optimizations.

The diagram below illustrates the JMM:

![Java Memory Model](https://oss.javaguide.cn/github/javaguide/java/concurrent/jmm.png)

For thread 1 and thread 2 to communicate in this model, two steps are involved:

1. Thread 1 writes its updated copy of the shared variable to main memory.
2. Thread 2 reads the shared variable from main memory.

In other words, communication through shared data must follow the JMM rules. The JMM guarantees visibility for writes when the required happens-before relationship is established, for example through `volatile`, locks, or thread start and termination.

However, accessing a shared variable from multiple threads can still cause thread-safety issues. For example:

1. Thread 1 writes a shared variable while thread 2 reads it.
2. Thread 2 may see either the old or new value if the threads have not established the required synchronization. Each thread may be working with its own copy of the variable.

The JMM defines eight synchronization actions for interactions between main memory and a thread's working memory. They describe how a variable is copied into working memory and written back (understanding the ideas is enough; there is no need to memorize them):

- **lock:** Applies to a main-memory variable and marks it as held by a thread.
- **unlock:** Applies to a main-memory variable and releases it so another thread can lock it.
- **read:** Transfers a variable's value from main memory to working memory for a later `load` action.
- **load:** Places the value obtained by `read` into the working-memory copy of the variable.
- **use:** Passes a working-memory value to the execution engine when an instruction uses that variable.
- **assign:** Assigns a value from the execution engine to a working-memory variable when bytecode assigns to it.
- **store:** Transfers a working-memory value to main memory for a later `write` action.
- **write:** Places the value received by `store` into the main-memory variable.

The JMM also defines these rules for synchronization actions (understanding them is enough; there is no need to memorize them):

- A thread cannot write a value from working memory back to main memory without a preceding `assign` action.
- A new variable is created in main memory. A thread cannot use a variable in working memory before initializing it with `load` or `assign`; `use` and `store` must be preceded by the required `load` and `assign` actions.
- Only one thread may hold a variable's lock at a time. The same thread may lock it repeatedly, but it must unlock it the same number of times before the variable is unlocked.
- Locking a variable clears its working-memory value. Before the execution engine uses it again, the value must be initialized with `load` or `assign`.
- A thread cannot unlock a variable it has not locked, or unlock a variable held by another thread.
- ...

### How Do Java Memory Areas Differ from the JMM?

This is a common question, and the two concepts are easy to confuse. **Java memory areas and the Java Memory Model are different things:**

- JVM memory areas describe how the runtime organizes program data, such as storing object instances on the heap.
- The JMM concerns Java concurrency. It models the relationship between threads and main memory and defines concurrency rules for translating Java source into CPU instructions. Its goals are to simplify multithreaded programming and improve portability.

### What Is the Happens-Before Principle?

The happens-before concept originated in Leslie Lamport's 1978 paper [Time, Clocks, and the Ordering of Events in a Distributed System](https://lamport.azurewebsites.net/pubs/time-clocks.pdf). The paper introduced [logical clocks](https://writings.sh/post/logical-clocks), which provide rules for ordering events in distributed systems. **Logical clocks do not measure time; they distinguish the order in which events occur. At their core, they define a happens-before relationship.**

The history of happens-before is useful context, but it is not essential here.

JSR 133 uses happens-before to describe memory visibility between two operations.

**Why do we need happens-before?** It balances the needs of programmers, compilers, and processors. Programmers want a strong, easy-to-understand memory model: follow its rules and the code behaves predictably. Compilers and processors benefit from a weaker model with fewer constraints, which lets them optimize performance. The idea behind happens-before is simple:

- To minimize constraints, compilers and processors may reorder operations as long as the result of a single-threaded program or a correctly synchronized multithreaded program does not change.
- The JMM requires compilers and processors to prevent reorderings that would change the program's result.

The following diagram is adapted from a JMM illustration in _The Art of Java Concurrency Programming_.

![JMM design](https://oss.javaguide.cn/github/javaguide/java/concurrent/jmm-design-idea.png)

With that design in mind, here is the JSR-133 definition of happens-before:

- If one operation happens-before another, the first operation's result is visible to the second, and the first is ordered before the second.
- A happens-before relationship does not require the Java implementation to execute the operations in that exact order. Reordering is allowed if it produces the same result as an execution that follows the happens-before order.

Consider this code:

```java
int userNum = getUserNum();   // 1
int teacherNum = getTeacherNum();   // 2
int totalNum = userNum + teacherNum;  // 3
```

- 1 happens-before 2
- 2 happens-before 3
- 1 happens-before 3

Although 1 happens-before 2, reordering them does not change the result, so the JMM allows it. Both operations must still happen before 3; that is, 1 and 2 happen-before 3.

**Happens-before does not necessarily mean that one operation literally executes before another, though that is a reasonable shorthand for programmers. More precisely, it means the result of the first operation is visible to the second, whether or not they run in the same thread.**

For example, if operation 1 happens-before operation 2, the JMM guarantees that operation 1's result is visible to operation 2 even if they run in different threads.

### What Are the Common Happens-Before Rules?

Happens-before has several rules. Here are five commonly used ones:

1. **Program order:** Within one thread, an earlier operation in program order happens-before a later operation.
2. **Monitor lock:** An unlock on a monitor happens-before a later lock on the same monitor.
3. **Volatile variable:** A write to a `volatile` variable happens-before a later read of the same variable.
4. **Transitivity:** If A happens-before B and B happens-before C, then A happens-before C.
5. **Thread start:** Calling `start()` on a `Thread` happens-before every action in that thread.

This list is not exhaustive; there are also rules for thread termination and interruption. If the full set of rules does not establish a happens-before relationship between conflicting accesses, they may form a data race, and single-threaded assumptions cannot guarantee their visibility or order. This does not mean the JVM can freely swap any two instructions; execution remains subject to the JMM's consistency and causality requirements.

### How Are Happens-Before and the JMM Related?

The diagram shows how happens-before relates to the JMM:

![jmm-vs-happens-before](https://oss.javaguide.cn/github/javaguide/java/concurrent/jmm-vs-happens-before.png)

- The JMM gives programmers **happens-before rules**, such as program order and volatile-variable rules. These provide the appearance of a **strong memory model**: follow the rules without needing to manage low-level reordering details, and the required visibility is guaranteed.
- At runtime, the JVM maps happens-before rules to platform-specific behavior. To preserve performance while maintaining correctness, the JMM **prevents reorderings that could change the result** while allowing reorderings that do not change single-threaded behavior.
- At the lowest level are the actual **reordering rules** of compilers and processors.

In short, the JMM is an intermediate layer. It gives programmers a simple model through happens-before and lets the JVM use hardware performance by prohibiting only specific reorderings. This design supports multithreaded correctness while making good use of the hardware.

## Three Important Properties of Concurrency

### Atomicity

An operation or group of operations is atomic if it either completes in full without interference or does not happen at all.

In Java, atomicity can be provided by `synchronized`, `Lock` implementations, and atomic classes.

`synchronized` and `Lock` implementations ensure that only one thread at a time enters the protected code, which provides atomicity. Atomic classes use compare-and-swap (CAS), and may also use `volatile` or `final`, to provide atomic operations.

### Visibility

Visibility means that when one thread updates a shared variable, other threads can observe the updated value.

In Java, visibility can be provided by `synchronized`, `volatile`, and `Lock` implementations.

If a variable is declared `volatile`, a write to it happens-before a subsequent read of the same variable. The JVM must preserve the corresponding visibility and ordering semantics, but the implementation does not have to access physical main memory on every read or write.

### Ordering

Because of instruction reordering, code may not execute in the order in which it was written.

As mentioned above:

> **Instruction reordering preserves single-threaded behavior, but is not required to preserve behavior across threads**, so it can cause problems in multithreaded programs.

In Java, `volatile` constrains reorderings around reads and writes of that variable when they could violate its memory semantics. It does not disable all instruction-reordering optimizations.

## Summary

- Java was one of the first languages to define a memory model, with the goals of simplifying multithreaded programming and improving portability.
- CPUs use cache-coherence protocols such as [MESI](https://en.wikipedia.org/wiki/MESI_protocol) to address inconsistent cached values.
- Computers may reorder instructions to improve performance, so code may not execute in source order. **Reordering preserves single-threaded behavior but is not required to preserve unsynchronized behavior across threads**, so it can cause problems in multithreaded programs.
- The JMM defines Java's concurrency rules, models the relationship between threads and main memory, and specifies requirements for translating Java source into CPU instructions.
- JSR 133 uses happens-before to describe memory visibility between operations.

## References

- _The Art of Java Concurrency Programming_, Chapter 3: The Java Memory Model
- _Java Multithreading Explained_: <http://concurrent.redspider.group/RedSpider.html>
- [A Study of Java Memory Access Reordering](https://tech.meituan.com/2014/09/23/java-memory-reordering.html)
- [An Introduction to the Java Memory Model (JMM)](https://xie.infoq.cn/article/739920a92d0d27e2053174ef2)
- [JSR 133 (Java Memory Model) FAQ](https://www.cs.umd.edu/~pugh/java/memoryModel/jsr-133-faq.html)

<!-- @include: @article-footer.snippet.md -->
