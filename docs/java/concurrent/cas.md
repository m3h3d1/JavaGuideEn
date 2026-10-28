---
title: CAS Explained
description: An in-depth look at compare-and-swap, its implementation with Unsafe, the ABA problem, spin loops, and how CAS compares with pessimistic locking.
category: Java
tag:
  - Java Concurrency
head:
  - - meta
    - name: keywords
      content: CAS, compare-and-swap, atomic operations, ABA problem, spin loop, optimistic locking, Unsafe, CAS implementation
---

For an introduction to optimistic and pessimistic locking and common optimistic locking techniques, see [Optimistic and Pessimistic Locking](https://javaguide.cn/java/concurrent/optimistic-lock-and-pessimistic-lock.html).

This article explains how CAS is implemented in Java and discusses some of its limitations.

## How Is CAS Implemented in Java?

One key class used to implement CAS (compare-and-swap) operations in Java is `Unsafe`.

`Unsafe` is in the `sun.misc` package and provides low-level operations that can be unsafe. Because of its power and risks, it is mainly used inside the JVM and in libraries that need high performance or low-level access. Application developers are generally discouraged from using it directly. See 📌[The Unsafe Class](https://javaguide.cn/java/basis/unsafe.html) for details.

The `Unsafe` class in `sun.misc` provides `compareAndSwapObject`, `compareAndSwapInt`, and `compareAndSwapLong` methods for CAS operations on `Object`, `int`, and `long` values:

```java
/**
 * Atomically updates an object field.
 *
 * @param o        the object to operate on
 * @param offset   the memory offset of the object field
 * @param expected the expected old value
 * @param x        the new value to set
 * @return true if the value was updated; otherwise, false
 */
boolean compareAndSwapObject(Object o, long offset, Object expected, Object x);

/**
 * Atomically updates an int field in an object.
 */
boolean compareAndSwapInt(Object o, long offset, int expected, int x);

/**
 * Atomically updates a long field in an object.
 */
boolean compareAndSwapLong(Object o, long offset, long expected, long x);
```

These CAS methods in JDK 8's `Unsafe` are `native` methods. Java code uses them to express atomic compare-and-swap semantics. HotSpot typically recognizes these calls as intrinsics and maps them to atomic instructions supported by the target processor, or to an equivalent implementation. The details depend on the JVM and CPU architecture; they cannot be accurately reduced to “calling C++ inline assembly through JNI.”

The `java.util.concurrent.atomic` package provides classes for atomic operations.

![Overview of JUC atomic classes](https://oss.javaguide.cn/github/javaguide/java/JUC%E5%8E%9F%E5%AD%90%E7%B1%BB%E6%A6%82%E8%A7%88.png)

For an introduction to these Atomic classes and examples, see [Java Atomic Classes](https://javaguide.cn/java/concurrent/atomic-classes.html).

Atomic classes use optimistic locking with CAS to make their methods atomic, without traditional locks such as `synchronized` blocks or `ReentrantLock`.

`AtomicInteger` is an atomic class for operations on `int` values. The JDK 8 implementation below uses low-level atomic operations from `Unsafe`. Newer JDK versions may use different APIs and implementation details; application code can also use the standard `VarHandle` API to express atomic access.

The following walkthrough of the JDK 8 `AtomicInteger` source shows how Java uses `Unsafe` methods to implement atomic operations.

Here is the core `AtomicInteger` source:

```java
// Get an Unsafe instance
private static final Unsafe unsafe = Unsafe.getUnsafe();
private static final long valueOffset;

static {
    try {
        // Get the memory offset of the value field in AtomicInteger
        valueOffset = unsafe.objectFieldOffset
            (AtomicInteger.class.getDeclaredField("value"));
    } catch (Exception ex) { throw new Error(ex); }
}
// Ensure visibility of the value field
private volatile int value;

// Atomically set the value to update if the current value equals expect
// Uses Unsafe#compareAndSwapInt for the CAS operation
public final boolean compareAndSet(int expect, int update) {
    return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
}

// Atomically add delta to the current value and return the old value
public final int getAndAdd(int delta) {
    return unsafe.getAndAddInt(this, valueOffset, delta);
}

// Atomically increment the current value and return the old value
// Uses Unsafe#getAndAddInt for the CAS operation
public final int getAndIncrement() {
    return unsafe.getAndAddInt(this, valueOffset, 1);
}

// Atomically decrement the current value and return the old value
public final int getAndDecrement() {
    return unsafe.getAndAddInt(this, valueOffset, -1);
}
```

Here is the source for `Unsafe#getAndAddInt`:

```java
// Atomically get and add to an integer value
public final int getAndAddInt(Object o, long offset, int delta) {
    int v;
    do {
        // Read the int at offset from object o with volatile semantics
        v = getIntVolatile(o, offset);
    } while (!compareAndSwapInt(o, offset, v, v + delta));
    // Return the old value
    return v;
}
```

`getAndAddInt` uses a `do-while` loop and retries until `compareAndSwapInt` succeeds. If another thread changes the current value and the update fails, the method reads the latest value and tries again.

Because contention can cause a CAS operation to fail, it is often used in a loop that retries until the operation succeeds. This is called **spinning**.

## What Are the Limitations of CAS?

The ABA problem is one of the most common limitations of CAS.

### The ABA Problem

If a variable `V` is `A` when first read and is still `A` when checked before an update, can we conclude that no other thread changed it? No. It may have changed to another value and then back to `A`, causing CAS to assume it was never modified. This is known as the **ABA problem**.

One way to address the ABA problem is to associate a **version number or timestamp** with the value. `AtomicStampedReference`, available since JDK 1.5, checks both the current reference and its stamp against the expected values. If both match, it atomically updates the reference and stamp.

```java
public boolean compareAndSet(V   expectedReference,
                             V   newReference,
                             int expectedStamp,
                             int newStamp) {
    Pair<V> current = pair;
    return
        expectedReference == current.reference &&
        expectedStamp == current.stamp &&
        ((newReference == current.reference &&
          newStamp == current.stamp) ||
         casPair(current, Pair.of(newReference, newStamp)));
}
```

### Long Spin Loops Are Expensive

CAS often retries by spinning until an operation succeeds. If it keeps failing for a long time, the loop can consume significant CPU resources.

If the JVM supports the processor's `pause` instruction, it can make spin loops more efficient. The instruction has two important effects:

1. **Delay instruction execution:** `pause` can delay execution and reduce CPU resource use. The delay depends on the processor and may be zero on some processors.
2. **Reduce memory-order penalties:** `pause` can help avoid pipeline flushes caused by memory-order conflicts when leaving a loop, improving CPU efficiency.

### CAS Applies to One Shared Variable at a Time

CAS operates on one shared variable at a time. To atomically update multiple values, you can group them in an object and use `AtomicReference`, available since JDK 1.5, to compare and update the reference.

Alternatively, use a lock.

## Summary

In Java, atomic classes and APIs such as `VarHandle` express CAS operations. The JVM implements them with atomic instructions supported by the target platform or an equivalent mechanism. The details depend on the JVM and CPU architecture; the Java specification does not require JNI or a particular assembly implementation.

CAS can provide efficient lock-free operations, but be aware of the ABA problem and the cost of long spin loops.
