---
title: Java 19 New Features
description: An overview of JDK 19 preview features and concurrency updates, including the evolution of virtual threads.
category: Java
tag:
  - Java New Features
head:
  - - meta
    - name: keywords
      content: Java 19,JDK 19,virtual threads preview,structured concurrency,Foreign Function API,JEP
---

JDK 19 was released on September 20, 2022. It was a non-LTS release.

JDK 19 included seven new features. This article covers some of the more notable ones:

- [JEP 424: Foreign Function & Memory API (Preview)](https://openjdk.org/jeps/424)
- [JEP 425: Virtual Threads (Preview)](https://openjdk.org/jeps/425)
- [JEP 426: Vector API (Fourth Incubator)](https://openjdk.java.net/jeps/426)
- [JEP 428: Structured Concurrency (Incubator)](https://openjdk.org/jeps/428)

The chart below shows the number of features and release dates for each update from JDK 8 through JDK 25:

![Feature counts and release dates for JDK 8 through JDK 25](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 424: Foreign Function & Memory API (Preview)

This API lets Java programs interoperate with code and data outside the Java runtime. It can call foreign functions (code outside the JVM) efficiently and access foreign memory (memory not managed by the JVM) safely, allowing Java programs to use native libraries and data without JNI's risks and fragility.

The Foreign Function and Memory API was incubated in Java 17 through [JEP 412](https://openjdk.java.net/jeps/412), incubated again in Java 18 through [JEP 419](https://openjdk.org/jeps/419), and previewed in Java 19 through [JEP 424](https://openjdk.org/jeps/424).

Before the Foreign Function and Memory API:

- Java provides low-level, unsafe operations through [`sun.misc.Unsafe`](https://hg.openjdk.java.net/jdk/jdk/file/tip/src/jdk.unsupported/share/classes/sun/misc/Unsafe.java), such as direct access to system memory and manual memory management. `Unsafe` gives Java capabilities similar to C pointers, but incorrect use can lead to errors and reduces safety.
- Java has supported native method calls through the Java Native Interface (JNI) since Java 1.1, but JNI can be difficult to use. It is complex to implement, outside the JVM's language safety mechanisms, and can affect Java's portability. JNI calls also cannot benefit from many common JIT optimizations, such as inlining. Frameworks such as [JNA](https://github.com/java-native-access/jna), [JNR](https://github.com/jnr/jnr-ffi), and [JavaCPP](https://github.com/bytedeco/javacpp) improve on JNI, but still have limitations. See [Guide to JNI (Java Native Interface)](https://www.baeldung.com/jni) for details.

The Foreign Function and Memory API addresses these difficulties when accessing foreign functions and memory from Java.

The Foreign Function and Memory API (FFM API) defines classes and interfaces for:

- Allocating foreign memory: `MemorySegment`, `MemoryAddress`, and `SegmentAllocator`
- Working with structured foreign memory: `MemoryLayout` and `VarHandle`
- Managing foreign-memory allocation and release: `MemorySession`
- Calling foreign functions: `Linker`, `FunctionDescriptor`, and `SymbolLookup`

This FFM API example gets a method handle for the C library function `radixsort`, then uses it to sort four strings from a Java array.

```java
// 1. Find the foreign function in the C library.
Linker linker = Linker.nativeLinker();
SymbolLookup stdlib = linker.defaultLookup();
MethodHandle radixSort = linker.downcallHandle(
                             stdlib.lookup("radixsort"), ...);
// 2. Allocate heap memory for the four strings.
String[] javaStrings   = { "mouse", "cat", "dog", "car" };
// 3. Allocate off-heap memory for four pointers.
SegmentAllocator allocator = implicitAllocator();
MemorySegment offHeap  = allocator.allocateArray(ValueLayout.ADDRESS, javaStrings.length);
// 4. Copy the strings from the heap to off-heap memory.
for (int i = 0; i < javaStrings.length; i++) {
    // Allocate a string off-heap and store a pointer to it.
    MemorySegment cString = allocator.allocateUtf8String(javaStrings[i]);
    offHeap.setAtIndex(ValueLayout.ADDRESS, i, cString);
}
// 5. Sort the off-heap data by calling the foreign function.
radixSort.invoke(offHeap, javaStrings.length, MemoryAddress.NULL, '\0');
// 6. Copy the (reordered) strings from off-heap memory back to the heap.
for (int i = 0; i < javaStrings.length; i++) {
    MemoryAddress cStringPtr = offHeap.getAtIndex(ValueLayout.ADDRESS, i);
    javaStrings[i] = cStringPtr.getUtf8String(0);
}
assert Arrays.equals(javaStrings, new String[] {"car", "cat", "dog", "mouse"});  // true
```

## JEP 425: Virtual Threads (Preview)

Virtual threads are lightweight threads implemented by the JDK rather than the OS. Many virtual threads share an operating-system thread, so an application can have far more virtual threads than OS threads.

Similar constructs have proved useful in other languages, such as goroutines in Go and processes in Erlang.

Virtual threads avoid creating or switching an OS thread for every task. This reduces thread-resource and scheduling overhead for workloads with many blocking tasks, and makes high-throughput concurrent applications easier to write, maintain, and observe.

For a discussion of Java 19 virtual threads, see <https://www.zhihu.com/question/536743167>.

For more about how Java virtual threads work, see:

- [Virtual Thread Internals and Performance Analysis - Dewu Technology](https://mp.weixin.qq.com/s/vdLXhZdWyxc6K-D3Aj03LA)
- [Java 19 GA: How Virtual Threads Can Increase System Throughput](https://mp.weixin.qq.com/s/yyApBXxpXxVwttr01Hld6Q)
- [Virtual Threads: A Look at the VirtualThread Source Code](https://www.cnblogs.com/throwable/p/16758997.html)

## JEP 426: Vector API (Fourth Incubator)

The Vector API was proposed in [JEP 338](https://openjdk.java.net/jeps/338) and added to Java 16 as an [incubator API](http://openjdk.java.net/jeps/11). It was incubated again in Java 17 through [JEP 414](https://openjdk.java.net/jeps/414), Java 18 through [JEP 417](https://openjdk.java.net/jeps/417), and Java 19 through [JEP 426](https://openjdk.java.net/jeps/426).

For more about the Vector API, see [Java 18 New Features](./java18.md).

## JEP 428: Structured Concurrency (Incubator)

JDK 19 introduced structured concurrency as an incubator feature. This approach aims to simplify multithreaded programming through a structured concurrency API; it is not intended to replace `java.util.concurrent`.

Structured concurrency treats multiple tasks running in different threads as a single unit of work. This simplifies error handling, improves reliability and observability, and preserves the readability and maintainability of single-threaded code.

The basic API is [`StructuredTaskScope`](https://download.java.net/java/early_access/loom/docs/api/jdk.incubator.concurrent/jdk/incubator/concurrent/StructuredTaskScope.html). It lets you split a task into concurrent subtasks that run in their own threads. The subtasks must finish before the main task can continue.

Here is a basic example of `StructuredTaskScope`:

```java
    try (var scope = new StructuredTaskScope<Object>()) {
        // Fork threads to run subtasks.
        Future<Integer> future1 = scope.fork(task1);
        Future<String> future2 = scope.fork(task2);
        // Wait for the threads to finish.
        scope.join();
        // Process results or rethrow exceptions.
        ... process results/exceptions ...
    } // close
```

Structured concurrency works well with virtual threads, which are lightweight threads implemented by the JDK. Many virtual threads can share an operating-system thread.

<!-- @include: @article-footer.snippet.md -->
