---
title: JVM Garbage Collection Explained (Key Topic)
description: A detailed guide to GC algorithms, generational collection, common collectors such as Serial, Parallel, CMS, G1, ZGC, and Shenandoah, and GC tuning.
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: JVM garbage collection,GC algorithms,garbage collectors,generational collection,mark-sweep,copying algorithm,G1 GC,ZGC,Shenandoah,GC tuning
---

> Unless stated otherwise, this article refers to the HotSpot VM.
>
> This article summarizes and expands on _Understanding the Java Virtual Machine: Advanced Features and Best Practices_.
>
> Common interview questions:
>
> - How can you determine whether an object is dead? What are the two methods?
> - Briefly explain strong, soft, weak, and phantom references. How do phantom references differ from soft and weak references? What are the benefits of soft references?
> - How can you tell whether a constant is obsolete?
> - How can you tell whether a class is unused?
> - What garbage collection algorithms are there, and what are their characteristics?
> - Why does HotSpot divide the heap into young and old generations?
> - What are the common garbage collectors?
> - Explain the CMS and G1 collectors.
> - How do Minor GC and Full GC differ?

## Introduction

When diagnosing memory overflows or when garbage collection limits a system's ability to handle more concurrency, these "automatic" mechanisms need to be monitored and tuned.

## Basic Heap Structure

Java's automatic memory management mainly handles object allocation and reclamation. Its core function is allocating and reclaiming objects in the **heap**.

The Java heap is the main area managed by garbage collectors, so it is also called the **GC heap (Garbage Collected Heap)**.

Most current collectors use generational collection, so the Java heap is divided into different areas. This lets the collector use algorithms suited to the characteristics of each area.

In HotSpot JDK 7 and earlier, GC-managed memory is commonly described in three parts. PermGen is an implementation of the method area and is not part of the Java heap:

1. Young generation
2. Old generation
3. Permanent generation (PermGen)

In the diagram below, Eden and the two Survivor spaces, S0 and S1, belong to the young generation. The middle layer is the old generation, and the bottom layer is PermGen.

![Heap memory layout](https://oss.javaguide.cn/github/javaguide/java/jvm/hotspot-heap-structure.png)

**JDK 8 removed PermGen and moved class metadata to Metaspace, which uses native memory.**

For more detail on the heap structure, see [Java Memory Areas Explained](./memory-area.md).

## Memory Allocation and Reclamation

### Allocate Objects in Eden First

Most objects are allocated in Eden in the young generation. If Eden does not have enough space, the VM starts a Minor GC. Let's test this behavior.

Test code:

```java
public class GCTest {
  public static void main(String[] args) {
    byte[] allocation1, allocation2;
    allocation1 = new byte[30900*1024];
  }
}
```

Run it as follows:
![](https://oss.javaguide.cn/github/javaguide/java/jvm/25178350.png)

Add the option `-XX:+PrintGCDetails`.
![](https://oss.javaguide.cn/github/javaguide/java/jvm/run-with-PrintGCDetails.png)

Output (the red label is incorrect; it refers to PermGen in JDK 7):

![](https://oss.javaguide.cn/github/javaguide/java/jvm/28954286.jpg)

The diagram shows that Eden is almost full. Even when the program does nothing, the young generation uses more than 2,000 KB.

What happens if we allocate memory for `allocation2` as well?

```java
allocation2 = new byte[900*1024];
```

![](https://oss.javaguide.cn/github/javaguide/java/jvm/28128785.jpg)

When allocating `allocation2`, Eden is almost full.

When Eden has insufficient space, the VM starts a Minor GC. During collection, it finds that `allocation1` cannot fit in a Survivor space, so the **promotion guarantee mechanism** moves it early to the old generation. There is enough room there, so no Full GC occurs. After the Minor GC, later objects are still allocated in Eden if there is enough room. Verify this with the following code:

```java
public class GCTest {

  public static void main(String[] args) {
    byte[] allocation1, allocation2,allocation3,allocation4,allocation5;
    allocation1 = new byte[32000*1024];
    allocation2 = new byte[1000*1024];
    allocation3 = new byte[1000*1024];
    allocation4 = new byte[1000*1024];
    allocation5 = new byte[1000*1024];
  }
}

```

### Large Objects May Go Directly to the Old Generation

Large objects require a large, contiguous block of memory, such as some strings and arrays.

Whether large objects go directly to the old generation is determined by the VM, collector, and relevant options. This optimization avoids placing large objects in the young generation, which can reduce young-generation collection frequency and cost.

- G1 treats objects at least half the size of a Region as Humongous Objects and allocates them directly in contiguous Humongous Regions that belong to the old generation. Set the Region size with `-XX:G1HeapRegionSize`.
- Whether other collectors allocate large objects directly in the old generation, and under what conditions, depends on the collector and JDK version. There is no universal threshold.

### Long-Lived Objects Move to the Old Generation

Because generational collection separates memory by object lifetime, the VM needs to identify which objects belong in the young and old generations. It tracks each object's age with an age counter.

Most objects are first allocated in Eden. If an object survives its first Minor GC and fits in a Survivor space, it is moved to S0 or S1 and its age is set to 1.

Each time an object survives a Minor GC in a Survivor space, its age increases by one. When it reaches the promotion threshold, it moves to the old generation. `-XX:MaxTenuringThreshold` sets the maximum age threshold. Its default depends on the collector: in JDK 8, it is 15 for Parallel GC and 6 for CMS. The JVM may adjust the actual threshold dynamically.

> Correction ([issue 552](https://github.com/Snailclimb/JavaGuide/issues/552)): "HotSpot traverses objects in ascending age order and adds up their sizes. When the total size for an age exceeds 50% of the Survivor space (the default, configurable with `-XX:TargetSurvivorRatio=percent`; see [issue 1199](https://github.com/Snailclimb/JavaGuide/issues/1199)), the smaller of that age and `MaxTenuringThreshold` becomes the new promotion threshold."
>
> JDK 8 documentation: <https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html>.
>
> ![](https://oss.javaguide.cn/java-guide-blog/image-20210523201742303.png)
>
> **The dynamic age calculation is implemented as follows:**
>
> ```c++
> uint ageTable::compute_tenuring_threshold(size_t survivor_capacity) {
> // survivor_capacity is the size of the Survivor space.
> size_t desired_survivor_size = (size_t)((((double)survivor_capacity)*TargetSurvivorRatio)/100);
> size_t total = 0;
> uint age = 1;
> while (age < table_size) {
> // sizes contains the size of objects at each age.
> total += sizes[age];
> if (total > desired_survivor_size) {
> break;
> }
> age++;
> }
> uint result = age < MaxTenuringThreshold ? age : MaxTenuringThreshold;
> ...
> }
>
> ```
>
> Additional note ([issue 672](https://github.com/Snailclimb/JavaGuide/issues/672)): **The claim that the default promotion age is 15 mostly comes from _Understanding the Java Virtual Machine_.**
> Oracle's documentation for [VM options](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html) includes this note for `-XX:MaxTenuringThreshold=threshold`:
>
> **Sets the maximum tenuring threshold for use in adaptive GC sizing. The largest value is 15. The default value is 15 for the parallel (throughput) collector, and 6 for the CMS collector. The default promotion age is not always 15; it depends on the collector. For example, it is 6 for CMS.**

### GC Types and Collection Areas

In the second edition of _Understanding the Java Virtual Machine_, Zhou Zhiming wrote on page 92:

> ~~_“Old-generation GC (Major GC/Full GC) refers to GC that occurs in the old generation...”_~~

This statement was corrected in the third edition of _Understanding the Java Virtual Machine_. Thanks to R's answer:

![R's answer](https://oss.javaguide.cn/github/javaguide/java/jvm/rf-hotspot-vm-gc.png)

**Summary:**

In HotSpot VM, GC types can be divided into two broad categories:

Partial GC:

- Young-generation collection (Minor GC / Young GC): Collects only the young generation.
- Old-generation collection (Major GC / Old GC): Collects only the old generation. Note that some sources use Major GC to mean a full-heap collection.
- Mixed GC: Collects the entire young generation and part of the old generation.

Full GC: Collects the entire Java heap. Whether it also reclaims class metadata in the method area depends on the collector, JDK version, and class unloading conditions.

### Allocation Guarantee

The allocation guarantee checks whether the old generation has enough free space to hold all objects from the young generation before a Minor GC.

Chapter 3 of _Understanding the Java Virtual Machine_ describes the allocation guarantee as follows:

> Before JDK 6 Update 24, before a Minor GC the VM checked whether the largest available contiguous block in the old generation was larger than the total space occupied by all objects in the young generation. If so, the Minor GC was considered safe. Otherwise, the VM checked whether `-XX:HandlePromotionFailure` allowed a promotion failure. If so, it compared the largest contiguous block in the old generation with the average size of objects promoted in previous collections. If the block was larger, it attempted a potentially risky Minor GC; otherwise, or if promotion failure was not allowed, it ran a Full GC.
>
> Starting with JDK 6 Update 24, the VM runs a Minor GC if the old generation's contiguous free space is larger than either the total size of young-generation objects or the average size of objects promoted in previous collections. Otherwise, it runs a Full GC.

## Determining Whether an Object Is Dead

The heap contains nearly all object instances. Before reclaiming heap memory, the GC must determine which objects are dead (that is, can no longer be used).

### Reference Counting

Add a reference counter to each object:

- Increment the counter whenever a reference to the object is created.
- Decrement it when a reference is no longer valid.
- An object with a counter of 0 cannot be used.

**This method is simple to implement, but mainstream Java VMs do not use it to manage object lifecycles. One important reason is that it cannot handle circular references between objects on its own.**

![Circular references between objects](https://oss.javaguide.cn/github/javaguide/java/jvm/object-circular-reference.png)

The following code illustrates the circular reference problem. Apart from referring to each other, `objA` and `objB` have no other references. But because they refer to one another, their counters are not 0, so reference counting cannot tell the GC to reclaim them.

```java
public class ReferenceCountingGc {
    Object instance = null;
    public static void main(String[] args) {
        ReferenceCountingGc objA = new ReferenceCountingGc();
        ReferenceCountingGc objB = new ReferenceCountingGc();
        objA.instance = objB;
        objB.instance = objA;
        objA = null;
        objB = null;
    }
}
```

### Reachability Analysis

This algorithm starts from a set of objects called **GC Roots** and searches downward from them. The paths traversed are called reference chains. If no reference chain connects an object to a GC Root, the object is unreachable and can be reclaimed.

In the diagram below, `Object 6` through `Object 10` refer to one another, but none is reachable from a GC Root, so they can be reclaimed.

![Reachability analysis](https://oss.javaguide.cn/github/javaguide/java/jvm/jvm-gc-roots.png)

**Which objects can act as GC Roots?**

- Objects referenced from local variable tables in JVM stack frames.
- Objects referenced from native method stacks.
- Objects referenced by static fields of classes in the method area.
- Objects referenced by constants in the method area.
- Objects held by synchronization locks.
- Objects referenced through JNI (Java Native Interface).

**Does an object that can be reclaimed always get reclaimed?**

For an object that overrides `finalize()` and has not yet run it, HotSpot may enqueue its finalization reference after determining that the object is unreachable. The Finalizer thread processes it asynchronously. If the object becomes reachable again from the reference graph in `finalize()`, it can temporarily avoid collection; otherwise, a later GC will confirm that it is reclaimable. This process is often summarized as "two marking passes," but the collector does not wait for `finalize()` to finish, and the method is not guaranteed to run.

> `Object.finalize()` has long been considered a poor design that burdens Java and affects its security and GC performance. It was deprecated in JDK 9, and JEP 421 marked finalization for removal in JDK 18. New code should not depend on it.
>
> References:
>
> - [JEP 421: Deprecate Finalization for Removal](https://openjdk.java.net/jeps/421)
> - [It's time to forget the `finalize` method](https://mp.weixin.qq.com/s/LW-paZAMD08DP_3-XCUxmg)

### Summary of Reference Types

Both reference counting and reachability analysis determine whether an object is alive by examining references: the number of references or whether a reference chain reaches the object.

Before JDK 1.2, a reference in Java had a traditional definition: if a value stored in a reference-type variable represented the starting address of another memory area, that value was considered a reference.

Since JDK 1.2, Java has expanded the concept of references into four kinds, in decreasing order of strength: strong, soft, weak, and phantom. Strong references are ordinary references used throughout Java code. The JDK classes for the other three kinds are `SoftReference`, `WeakReference`, and `PhantomReference`.

![Java reference types](https://oss.javaguide.cn/github/javaguide/java/jvm/java-reference-type.png)

**1. Strong References**

Strong references are ordinary references commonly assigned in Java code:

```java
String strongReference = new String("abc");
```

If an object is still reachable through a strong reference, it is like an **essential item** and the garbage collector will not reclaim it. If memory runs out, the JVM throws `OutOfMemoryError` and the program terminates abnormally rather than reclaiming an object that is strongly reachable.

**2. Soft References (`SoftReference`)**

An object reachable only through soft references is like a **nonessential item**. Example:

```java
// --- Example 1 ---
String str = new String("abc");
SoftReference<String> softReference1 = new SoftReference<>(str);
str = null; // Remove the strong reference.

// --- Example 2 ---
SoftReference<String> softReference2 = new SoftReference<>(new String("def")); // Anonymous object.
```

Objects reachable only through soft references may be reclaimed under memory pressure, but the JVM does not guarantee that they are cleared only when memory is low. The guarantee is that all objects reachable only through soft references will be cleared before `OutOfMemoryError` is thrown. An object can still be used as long as the collector has not reclaimed it. Soft references can be used for memory-sensitive caches.

Soft references can be used with a reference queue (`ReferenceQueue`). When the garbage collector clears a soft reference, it enqueues that reference in its registered queue at the same time or later. Enqueueing means the collector detected the corresponding reachability change; it does not prove that the object's memory has been physically released.

**3. Weak References (`WeakReference`)**

An object reachable only through weak references is also like a **nonessential item**. Example:

```java
// --- Example 1 ---
String str = new String("abc");
WeakReference<String> weakReference1 = new WeakReference<>(str);
str = null; // Remove the strong reference.

// --- Example 2 ---
WeakReference<String> weakReference2 = new WeakReference<>(new String("abc")); // Anonymous object.
```

The difference between weak and soft references is that objects reachable only through weak references have a shorter lifetime. When the garbage collector determines that an object is weakly reachable, it atomically clears the weak references to it. This happens during garbage collection, so the object is not necessarily reclaimed immediately after becoming weakly reachable.

Weak references can be used with a reference queue (`ReferenceQueue`). When the garbage collector clears a weak reference, it enqueues the reference in its registered queue at the same time or later.

**4. Phantom References (`PhantomReference`)**

As the name suggests, phantom references are fundamentally different from the other kinds: they do not prevent the garbage collector from reclaiming their referents. Example:

```java
// --- Example 1 ---
String str = new String("abc");
ReferenceQueue queue = new ReferenceQueue();
// Create a phantom reference; it must be associated with a reference queue.
PhantomReference phantomReference1 = new PhantomReference(str, queue);
str = null; // Remove the strong reference.

// --- Example 2 ---
PhantomReference phantomReference2 = new PhantomReference(new String("abc"), queue); // Anonymous object.
```

**Phantom references are mainly used to receive notifications about changes in an object's reachability and to coordinate cleanup through a reference queue.**

**One difference between phantom references and soft or weak references is that** phantom references are usually used with a reference queue (`ReferenceQueue`). When the garbage collector determines that an object is phantom reachable, it clears the associated phantom references and enqueues registered references at the same time or later. `PhantomReference.get()` always returns `null`, so the program cannot retrieve the object through the phantom reference. Phantom references are mainly used to schedule cleanup after an object can no longer be accessed.

Note that soft references are mainly used for memory-sensitive caches, but they do not guarantee that an application will avoid `OutOfMemoryError`. An OOM can also be caused by exhausted resources outside the heap.

### How Can You Tell Whether a Constant Is Obsolete?

The string pool mainly reclaims obsolete constants. How can you tell whether a constant is obsolete?

~~**Starting with JDK 7, the JVM moved the runtime constant pool out of the method area and into a region of the Java heap.**~~

> **🐛 Correction (see [issue 747](https://github.com/Snailclimb/JavaGuide/issues/747) and [reference](https://blog.csdn.net/q5706503/article/details/84640762)):**
>
> 1. **Before JDK 7, the runtime constant pool logically included the string pool in the method area, which HotSpot implemented as PermGen.**
> 2. **In JDK 7, the string pool moved from the method area to the heap. The runtime constant pool was not moved; its remaining contents stayed in the method area, which HotSpot implemented as PermGen.**
> 3. **In JDK 8, HotSpot removed PermGen and replaced it with Metaspace. The string pool remained on the heap, while the runtime constant pool remained in the method area, now implemented as Metaspace.**

Suppose the string pool contains the string literal `"abc"`, but no `String` object currently refers to it. The constant `"abc"` is then obsolete and may be removed from the pool during garbage collection if needed.

### How Can You Tell Whether a Class Is Unused?

The method area mainly reclaims unused classes. How can you determine whether a class is unused?

Determining whether a constant is obsolete is relatively simple. The conditions for a class to be considered **unused** are stricter; all three of the following must be true:

- All instances of the class have been reclaimed; no instance remains on the Java heap.
- The `ClassLoader` that loaded the class has been reclaimed.
- The `java.lang.Class` object for the class is not referenced anywhere, so the class's methods cannot be accessed through reflection.

> Pay special attention to the third condition when using JNI: a global `jclass` reference created with `NewGlobalRef` also prevents class unloading. A common pitfall is caching reflection results in JNI. A `jmethodID` or `jfieldID` is guaranteed to remain valid only while the class stays loaded, so long-running programs often create a global reference to the `jclass` to keep it alive. As a result, the class cannot be unloaded until that global reference is released (see [issue 2908](https://github.com/Snailclimb/JavaGuide/issues/2908)).

The VM may reclaim a class that meets all three conditions. "May" is important: unlike objects, unused classes are not necessarily reclaimed.

## Garbage Collection Algorithms

### Mark-Sweep Algorithm

The mark-sweep algorithm has two phases: **mark** and **sweep**. It first marks all objects that should remain, then reclaims all unmarked objects.

This is the most basic collection algorithm. Later algorithms were developed to address its limitations. Mark-sweep has two notable drawbacks:

1. **Efficiency:** Neither the marking nor the sweeping phase is very efficient.
2. **Space:** It leaves many noncontiguous memory fragments.

![Mark-sweep algorithm](https://oss.javaguide.cn/github/javaguide/java/jvm/mark-and-sweep-garbage-collection-algorithm.png)

There are different descriptions of what gets marked: reclaimable (unreachable) objects or objects to keep (reachable). Both descriptions can work; I prefer the latter.

Using the latter approach, mark-sweep works roughly as follows:

1. When an object is created, initialize its mark bit to 0 (`false`).
2. During marking, set the mark bit to 1 (`true`) for all reachable objects (objects the program can reference).
3. During sweeping, reclaim objects whose mark bit is 0 (`false`).

### Copying Algorithm

The copying algorithm was developed to address the efficiency and fragmentation problems of mark-sweep. It divides memory into two equal spaces and uses one at a time. When the active space fills up, it copies live objects to the other space and clears the entire space it just used. Each collection therefore reclaims half of the memory area.

![Copying algorithm](https://oss.javaguide.cn/github/javaguide/java/jvm/copying-garbage-collection-algorithm.png)

Although it improves on mark-sweep, it still has these limitations:

- **Less usable memory:** Only half of the memory is available at a time.
- **Poor fit for the old generation:** Copying is inefficient when many objects survive.

### Mark-Compact Algorithm

Mark-compact was designed for the characteristics of the old generation. It marks objects like mark-sweep, but instead of immediately reclaiming dead objects, it moves all live objects toward one end of the memory area and clears everything beyond that boundary.

![Mark-compact algorithm](https://oss.javaguide.cn/github/javaguide/java/jvm/mark-and-compact-garbage-collection-algorithm.png)

The additional compaction step makes it less efficient, so it suits areas such as the old generation, which are collected less frequently.

### Generational Collection

Classic generational collectors divide memory according to object lifetimes. The Java heap is usually split into young and old generations, allowing each generation to use an appropriate collection algorithm. Collectors are not always generational; for example, early versions of ZGC were non-generational.

For example, many objects in the young generation die during each collection, so copying can collect them at the cost of copying only a small number of survivors. Objects in the old generation are more likely to survive, and there is no extra space available to guarantee a copy, so mark-sweep or mark-compact is used instead.

**Follow-up interview question:** Why does HotSpot divide the heap into young and old generations?

Answer using the explanation of generational collection above.

## Garbage Collectors

**Collection algorithms are the theory of memory reclamation; garbage collectors are their concrete implementations.**

This comparison is not about finding a single best collector. There is no universally best collector, so **choose one that suits the specific application and workload**. If a perfect collector worked for every scenario, HotSpot would not need so many different collectors.

The default collector for Oracle/OpenJDK HotSpot in a typical Server VM environment (the actual choice can depend on the platform and runtime environment; check it with `java -XX:+PrintCommandLineFlags -version`):

- JDK 8: Parallel Scavenge (young generation) + Parallel Old (old generation)
- JDK 9 and later: G1

### Serial Collector

The Serial collector is the most basic and oldest garbage collector. As its name suggests, it is single-threaded. **Single-threaded** means not only that it uses one GC thread, but also that it must pause all other application threads (**stop-the-world**, or STW) until collection is complete.

**It uses copying in the young generation and mark-compact in the old generation.**

![Serial collector](https://oss.javaguide.cn/github/javaguide/java/jvm/serial-garbage-collector.png)

VM designers are aware of the poor user experience caused by stop-the-world pauses, so later collectors have focused on reducing pause times. Pauses still occur, and collector designs continue to evolve.

Does the Serial collector have advantages over other collectors? Yes. It is **simple and efficient compared with other single-threaded collectors**. Without thread coordination overhead, it can achieve high single-threaded collection efficiency. It can be a good choice for VMs running in Client mode.

### ParNew Collector

The ParNew collector is the multithreaded version of Serial. Apart from using multiple threads for collection, its behavior is the same, including its options, algorithms, and collection policy.

ParNew handles only the young generation and uses a copying algorithm. It was commonly paired with CMS, which handled the old generation.

![ParNew collector](https://oss.javaguide.cn/github/javaguide/java/jvm/parnew-garbage-collector.png)

In JDK versions that still support CMS, ParNew is its young-generation partner. CMS was removed in JDK 14, so this pairing applies only to older HotSpot versions.

**Parallel and concurrent are different concepts:**

- **Parallel:** Multiple GC threads work at the same time, while application threads are paused.

- **Concurrent:** Application threads and GC threads run at the same time. This does not necessarily mean they run in parallel; they may take turns. The application continues while the collector works, potentially on another CPU.

### Parallel Scavenge Collector

Parallel Scavenge is also a multithreaded collector that uses a copying algorithm, so it looks much like ParNew. **What sets it apart?**

```bash
-XX:+UseParallelGC

    Use the Parallel collector (paired with Parallel Old by default in JDK 8).

-XX:+UseParallelOldGC

    Use Parallel Old for parallel collection in the old generation.
```

Parallel Scavenge focuses on throughput, or using CPU time efficiently. Collectors such as CMS focus more on application pause times and user experience. Throughput is the proportion of total CPU time spent running application code. Parallel Scavenge provides options for tuning pause times and throughput. If you are unfamiliar with collector tuning, its adaptive sizing policy can let the VM handle much of the memory-management optimization.

**It uses copying in the young generation and mark-compact in the old generation.**

![Parallel Scavenge collector](https://oss.javaguide.cn/github/javaguide/java/jvm/parallel-scavenge-garbage-collector.png)

**This is the default collector in JDK 8.**

Run `java -XX:+PrintCommandLineFlags -version` to check the collector:

```bash
-XX:InitialHeapSize=262921408 -XX:MaxHeapSize=4206742528 -XX:+PrintCommandLineFlags -XX:+UseCompressedClassPointers -XX:+UseCompressedOops -XX:+UseParallelGC
java version "1.8.0_211"
Java(TM) SE Runtime Environment (build 1.8.0_211-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.211-b12, mixed mode)
```

JDK 8 uses Parallel Scavenge and Parallel Old by default. Specifying `-XX:+UseParallelGC` also enables `-XX:+UseParallelOldGC`; use `-XX:-UseParallelOldGC` to disable it.

### Serial Old Collector

**Serial Old is the old-generation version of the Serial collector.** It is also single-threaded. It was paired with Parallel Scavenge in JDK 5 and earlier, and it can serve as a fallback for CMS.

![Serial Old collector](https://oss.javaguide.cn/github/javaguide/java/jvm/serial-garbage-collector.png)

### Parallel Old Collector

**Parallel Old is the old-generation version of Parallel Scavenge.** It uses multiple threads and mark-compact. Consider pairing it with Parallel Scavenge when throughput and CPU utilization are priorities.

![Parallel Old collector](https://oss.javaguide.cn/github/javaguide/java/jvm/parallel-scavenge-garbage-collector.png)

### CMS Collector

**CMS (Concurrent Mark Sweep) is designed to minimize GC pause times, making it suitable for applications where user experience matters.**

**CMS was HotSpot's first truly concurrent collector: it allowed GC threads and application threads to run at roughly the same time.**

As its name suggests, CMS uses the **mark-sweep algorithm**. Its process is more complex than those of the collectors covered above and has four phases:

- **Initial mark:** Briefly pauses application threads to mark objects directly reachable from GC Roots.
- **Concurrent mark:** Runs GC and application threads together to trace reachable objects. Because application threads can update references during this phase, the collector tracks those changes and may need to revisit some objects.
- **Remark:** Briefly pauses application threads to correct marks affected by reference updates during concurrent marking. This pause is usually longer than the initial mark, but much shorter than concurrent marking.
- **Concurrent sweep:** Resumes application threads while GC threads reclaim unmarked objects.

![CMS collector](https://oss.javaguide.cn/github/javaguide/java/jvm/cms-garbage-collector.png)

CMS offers **concurrent collection and short pauses**, but it has three notable drawbacks:

- **It is sensitive to CPU availability.**
- **It cannot collect floating garbage.**
- **Its mark-sweep algorithm can leave significant memory fragmentation.**

**CMS was deprecated in Java 9 and removed in Java 14.**

### G1 Collector

**G1 (Garbage-First) is a server-oriented collector designed for machines with multiple processors and large amounts of memory. It aims to meet pause-time targets with high probability while maintaining good throughput.**

G1 was a major addition to HotSpot in JDK 7. It has the following characteristics:

- **Parallel and concurrent:** G1 uses multiple CPUs or cores to shorten stop-the-world pauses. Some GC work that requires pauses in other collectors can run concurrently with the application.
- **Generational:** G1 can manage the entire heap on its own while retaining the concept of generations.
- **Compaction:** G1 uses mark-compact across the heap and copying within individual regions, unlike CMS's mark-sweep approach.
- **Predictable pauses:** G1 builds a prediction model from the pause-time target and selects regions to collect. This target is a soft goal; a pause may exceed it.

G1 collection roughly consists of these phases:

- **Initial mark:** Briefly pauses application threads to mark objects directly reachable from GC Roots.
- **Concurrent mark:** Runs alongside the application and marks reachable objects. This phase can take a while, depending on the heap size and number of objects.
- **Remark:** Briefly pauses application threads to process the remaining reference updates from concurrent marking.
- **Evacuation:** Selects valuable regions, copies their live objects to new regions, and reclaims the old ones. This phase includes one or more pauses, depending on the work required.

![G1 collector](https://oss.javaguide.cn/github/javaguide/java/jvm/g1-garbage-collector.png)

**G1 maintains a priority list and, within the available collection time, prioritizes regions with the most reclaimable space.** This is where the name Garbage-First comes from. Dividing the heap into regions lets G1 focus collection work where it can reclaim the most memory.

**G1 became the default garbage collector in JDK 9.**

### ZGC Collector

ZGC is a low-latency garbage collector. It performs most work, including marking and relocating objects, concurrently with application threads. Colored pointers and barriers ensure that objects remain accessible after relocation. ZGC still has stop-the-world (STW) phases, but aims to keep pauses short regardless of heap size, live-object count, or thread count.

ZGC behavior depends on the JDK version. In early versions, processing thread stacks affected pause times. [JEP 376](https://openjdk.org/jeps/376) moved this work to a concurrent phase in JDK 16, so descriptions of JDK 17 ZGC should not use the pause model of earlier versions.

#### ZGC Versions and How to Enable Them

| JDK version | ZGC changes                                                                     | Enable option                                          |
| ----------- | ------------------------------------------------------------------------------- | ------------------------------------------------------ |
| JDK 11–14   | Introduced as an experimental feature ([JEP 333](https://openjdk.org/jeps/333)) | `-XX:+UnlockExperimentalVMOptions -XX:+UseZGC`         |
| JDK 15–20   | Became a standard feature; non-generational mode                                | `-XX:+UseZGC`                                          |
| JDK 21–22   | Generational mode added; non-generational mode remained the default             | `-XX:+UseZGC -XX:+ZGenerational` for generational mode |
| JDK 23      | Generational mode became the default when ZGC is enabled                        | `-XX:+UseZGC`                                          |
| JDK 24+     | Non-generational mode removed                                                   | `-XX:+UseZGC`                                          |

**ZGC using generational mode by default does not mean that the JVM uses ZGC by default.** In typical server-class environments, HotSpot still selects G1 by default. You must enable ZGC explicitly. For example, on JDK 17:

```bash
java -XX:+UseZGC -jar app.jar
```

JDK 17 does not support `-XX:+ZGenerational`, so tuning advice for generational ZGC does not apply. For the evolution of generational mode, see [JEP 439](https://openjdk.org/jeps/439), [JEP 474](https://openjdk.org/jeps/474), and [JEP 490](https://openjdk.org/jeps/490).

#### Do Shorter Pauses Always Mean Faster Responses?

Not necessarily. GC pauses are only one part of request latency. If slow requests are mainly caused by database access, lock contention, downstream services, or CPU saturation, switching to ZGC may have little effect on P99 latency. Concurrent GC also uses CPU, which can affect throughput and response times when a service has a tight CPU quota.

Also, **short STW pauses do not mean application threads will never wait for memory**. ZGC may encounter an allocation stall if objects are allocated too quickly, the heap is too small, or concurrent collection cannot keep up. The heap must hold live objects and leave room for new allocations during concurrent collection.

To evaluate the collector's impact, first compare G1 and ZGC on the same JDK, then assess any JDK upgrade separately. This helps distinguish the effects of a version upgrade, code changes, and a collector change. During a rollout, monitor:

- **Application metrics:** Throughput, P99/P999 latency, timeout rate, and error rate under the same load.
- **GC metrics:** Pause distribution, collection cycles, allocation rate, post-GC live-set size, and allocation stalls.
- **Resource metrics:** CPU usage and container throttling, process and off-heap memory, and headroom at peak load.

For options and common pitfalls, see [JDK 17 ZGC options in JVM Parameters](./jvm-parameters-intro.md#jdk-17-zgc-options). Before switching in production, keep the validated collector configuration and application version available, and define which application metrics should trigger a rollback.

For more detail on ZGC, see these articles:

- [An Analysis of ZGC Through the Evolution of GC Algorithms - JD Technology](https://mp.weixin.qq.com/s/ExkB40cq1_Z0ooDzXn7CVw)
- [Exploring and Applying the Next-Generation ZGC - Meituan Technical Team](https://tech.meituan.com/2020/08/06/ZGC-in-Meituan.html)
- [A Detailed Guide to G1 and ZGC - Alibaba Cloud](https://mp.weixin.qq.com/s/Ywj3XMws0IIK-kiUllN87Q)

### Shenandoah Collector

Like ZGC, Shenandoah is a low-latency collector led by Red Hat. It was introduced as an experimental feature in Java 12 through [JEP 189](https://openjdk.org/jeps/189) and became a standard feature in Java 15 ([JEP 379](https://openjdk.org/jeps/379)).

Shenandoah's key idea is **concurrent compaction**: most heap compaction runs alongside application threads, keeping pauses in the sub-millisecond range regardless of heap size. It uses **forwarding pointers (Brooks pointers)** and **read barriers** to make object movement transparent to application threads.

Early Shenandoah, like early ZGC, was non-generational and had some throughput overhead. Generational Shenandoah is still evolving; see [JEP 535](https://openjdk.org/jeps/535) and [JEP 521](https://openjdk.org/jeps/521).

Enable Shenandoah with this option:

```bash
java -XX:+UseShenandoahGC className
```

> Note: Shenandoah is not included in Oracle JDK's default support list. It is mainly available in OpenJDK distributions such as Red Hat builds and Amazon Corretto. Check whether your JDK distribution includes Shenandoah and whether it is enabled by default with `-XX:+PrintFlagsFinal -version | grep UseShenandoahGC`.

## References

- _Understanding the Java Virtual Machine: Advanced Features and Best Practices_, 2nd edition.
- The Java® Virtual Machine Specification - Java SE 8 Edition：<https://docs.oracle.com/javase/specs/jvms/se8/html/index.html>

<!-- @include: @article-footer.snippet.md -->
