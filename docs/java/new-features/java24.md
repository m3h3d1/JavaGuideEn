---
title: Java 24 New Features
description: An overview of key features and changes in JDK 24.
category: Java
tag:
  - Java New Features
head:
  - - meta
    - name: keywords
      content: Java 24,JDK 24,JEPs,language features,GC improvements,platform enhancements
---

JDK 24 was released in March 2025 as a non-LTS release. Its successor, **JDK 25**, was released in September 2025 as an LTS release.

JDK 24 includes 24 new features. This article covers some of the key ones:

- [JEP 478: Key Derivation Function API (Preview)](https://openjdk.org/jeps/478)
- [JEP 483: Early Class-File Loading and Linking](https://openjdk.org/jeps/483)
- [JEP 484: Class-File API](https://openjdk.org/jeps/484)
- [JEP 485: Stream Gatherers](https://openjdk.org/jeps/485)
- [JEP 486: Permanently Disable the Security Manager](https://openjdk.org/jeps/486)
- [JEP 487: Scoped Values (Fourth Preview)](https://openjdk.org/jeps/487)
- [JEP 495: Simple Source Files and Instance Main Methods (Fourth Preview)](https://openjdk.org/jeps/495)
- [JEP 497: Quantum-Resistant Module-Lattice-Based Digital Signature Algorithm (ML-DSA)](https://openjdk.org/jeps/497)
- [JEP 499: Structured Concurrency (Fourth Preview)](https://openjdk.org/jeps/499)

The chart below shows the number of features and release dates for each update from JDK 8 through JDK 25:

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 478: Key Derivation Function API (Preview)

The Key Derivation Function API provides a standard interface for deriving additional keys from an initial key and other data. It can generate separate keys for different cryptographic purposes, such as encryption and authentication, instead of reusing the same key. The API is in preview in JDK 24.

The API lets developers use key derivation algorithms such as HKDF, implemented by security providers:

```java
// Create a KDF object using the HKDF-SHA256 algorithm.
KDF hkdf = KDF.getInstance("HKDF-SHA256");

// Create the Extract and Expand parameters.
AlgorithmParameterSpec params =
    HKDFParameterSpec.ofExtract()
                     .addIKM(initialKeyMaterial) // Set the initial key material.
                     .addSalt(salt)              // Set the salt.
                     .thenExpand(info, 32);      // Set the info and output length.

// Derive a 32-byte AES key.
SecretKey key = hkdf.deriveKey("AES", params);

// Reuse the KDF object to derive other keys.
```

## JEP 483: Early Class-File Loading and Linking

Traditionally, the JVM loads and links classes dynamically each time an application starts. This feature caches loaded and linked classes to reduce repeated work on later starts. In the Spring PetClinic benchmark cited by JEP 483, an AOT cache reduced startup time by up to about 42%; actual gains depend on the application and environment.

This optimization requires no changes to application, library, or framework code. You first record a training run and create an AOT cache, then load that cache at startup. Relevant options include `-XX:AOTMode=record`, `-XX:AOTConfiguration`, `-XX:AOTMode=create`, and `-XX:AOTCache`.

## JEP 484: Class-File API

The Class-File API was first previewed in JDK 22 ([JEP 457](https://openjdk.org/jeps/457)) and improved in a second preview in JDK 23 ([JEP 466](https://openjdk.org/jeps/466)). It became a permanent feature in JDK 24.

The Class-File API provides a standard way to parse, generate, and transform Java class files, reducing reliance on third-party libraries such as ASM.

```java
// Create a ClassFile object, the entry point for working with class files.
ClassFile cf = ClassFile.of();
// Parse the byte array into a ClassModel.
ClassModel classModel = cf.parse(bytes);

// Build a new class file without methods whose names start with "debug".
byte[] newBytes = cf.build(classModel.thisClass().asSymbol(),
        classBuilder -> {
            // Iterate over all class elements.
            for (ClassElement ce : classModel) {
                // Check whether this is a method whose name starts with "debug".
                if (!(ce instanceof MethodModel mm
                        && mm.methodName().stringValue().startsWith("debug"))) {
                    // Add the element to the new class file.
                    classBuilder.with(ce);
                }
            }
        });
```

## JEP 485: Stream Gatherers

`Stream::gather(Gatherer)` lets developers define custom intermediate operations for more flexible data transformations. The `Gatherer` interface defines how to consume stream elements, maintain intermediate state, and produce results.

Unlike built-in operations such as `filter`, `map`, and `distinct`, `Stream::gather` can handle tasks that are difficult to express with standard Stream operations. Examples include sliding windows, custom deduplication, and stateful transformations or aggregation.

This example uses `Stream::gather(Gatherer)` to keep strings with unique lengths:

```java
var result = Stream.of("foo", "bar", "baz", "quux")
                   .gather(Gatherer.ofSequential(
                       HashSet::new, // Track string lengths seen so far.
                       (set, str, downstream) -> {
                           if (set.add(str.length())) {
                               return downstream.push(str);
                           }
                           return true; // Continue processing the stream.
                       }
                   ))
                   .toList(); // Convert the result to a list.

// Output: [foo, quux]
```

## JEP 486: Permanently Disable the Security Manager

JDK 24 no longer allows the `Security Manager` to be enabled, including with `java -Djava.security.manager`. This is a key step toward removing the feature. The `Security Manager` once limited code permissions, such as access to files, networks, and system commands. The Java community decided to remove it because it was complex, rarely used, and costly to maintain.

## JEP 487: Scoped Values (Fourth Preview)

Scoped values let threads share immutable data, and can be a better fit than thread-local variables, especially when using many virtual threads.

```java
final static ScopedValue<...> V = ScopedValue.newInstance();

// In some method
ScopedValue.where(V, <value>)
           .run(() -> { ... V.get() ... call methods ... });

// In a method called directly or indirectly from the lambda expression
... V.get() ...
```

Scoped values let components in a large program share data safely and efficiently without passing it through method parameters.

## JEP 491: Synchronize Virtual Threads Without Pinning

This update improves how virtual threads work with `synchronized`. When a virtual thread blocks in a `synchronized` method or block, it can usually release its underlying operating system thread (platform thread). This avoids pinning, where a virtual thread holds a platform thread and prevents it from serving other virtual threads.

Existing Java code that uses `synchronized` can benefit without changes. In an I/O-heavy application, blocking platform threads can limit concurrency. With virtual threads, blocking inside a `synchronized` block usually does not pin the platform thread, so it can serve other virtual threads.

## JEP 493: Link Run-Time Images Without JMOD Files

By default, the JDK includes both a run-time image (the modules needed at run time) and JMOD files. This feature lets `jlink` create custom run-time images without JMOD files, reducing the JDK installation size by about 25%.

Notes:

- `jlink` is a command-line tool introduced in Java 9. It creates lightweight, custom run-time images for modular Java applications.
- JMOD files are modular archives that can contain class files, native libraries, configuration files, header files, and legal notices.

## JEP 495: Simple Source Files and Instance Main Methods (Fourth Preview)

This feature simplifies the `main` method declaration. The traditional form introduces several Java syntax concepts that can make it harder for beginners to get started.

Without this feature, a `main` method looks like this:

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

With this feature, it can be written as:

```java
class HelloWorld {
    void main() {
        System.out.println("Hello, World!");
    }
}
```

It can be simplified further by omitting the class name:

```java
void main() {
   System.out.println("Hello, World!");
}
```

## JEP 497: Quantum-Resistant Module-Lattice-Based Digital Signature Algorithm (ML-DSA)

JDK 24 adds support for the Module-Lattice-Based Digital Signature Algorithm (**ML-DSA**), a quantum-resistant digital signature algorithm designed to address threats from future quantum computers.

ML-DSA is a quantum-resistant algorithm standardized by the U.S. National Institute of Standards and Technology (NIST) in FIPS 204 for digital signatures and authentication.

## JEP 498: Warnings When Using `sun.misc.Unsafe` Memory-Access Methods

JDK 23 ([JEP 471](https://openjdk.org/jeps/471)) deprecated the memory-access methods in `sun.misc.Unsafe` for removal. In JDK 24, the runtime warns the first time any of these methods is called.

Safe and efficient alternatives are available:

- `java.lang.invoke.VarHandle`, introduced in JDK 9 (JEP 193), provides safe and efficient access to heap memory, including object fields, static fields, and array elements.
- `java.lang.foreign.MemorySegment`, introduced in JDK 22 (JEP 454), provides safe and efficient access to off-heap memory and can work with `VarHandle`.

`MemorySegment` is a core type in the Foreign Function & Memory API for safely accessing heap and off-heap memory. `VarHandle` is a separate standard API for accessing fields, array elements, or data through a memory layout. The Foreign Function & Memory API became a permanent feature in JDK 22.

```java
import java.lang.foreign.*;
import java.lang.invoke.VarHandle;

// Manages an off-heap integer array.
class OffHeapIntBuffer {

    // VarHandle for accessing integer elements.
    private static final VarHandle ELEM_VH = ValueLayout.JAVA_INT.arrayElementVarHandle();

    // Memory arena.
    private final Arena arena;

    // Off-heap memory segment.
    private final MemorySegment buffer;

    // Allocates space for the specified number of integers.
    public OffHeapIntBuffer(long size) {
        this.arena  = Arena.ofShared();
        this.buffer = arena.allocate(ValueLayout.JAVA_INT, size);
    }

    // Releases the memory.
    public void deallocate() {
        arena.close();
    }

    // Sets the value at the specified index with volatile semantics.
    public void setVolatile(long index, int value) {
        ELEM_VH.setVolatile(buffer, 0L, index, value);
    }

    // Initializes the specified range to zero.
    public void initialize(long start, long n) {
        buffer.asSlice(ValueLayout.JAVA_INT.byteSize() * start,
                       ValueLayout.JAVA_INT.byteSize() * n)
              .fill((byte) 0);
    }

    // Copies the specified range into a new array.
    public int[] copyToNewArray(long start, int n) {
        return buffer.asSlice(ValueLayout.JAVA_INT.byteSize() * start,
                              ValueLayout.JAVA_INT.byteSize() * n)
                     .toArray(ValueLayout.JAVA_INT);
    }
}
```

## JEP 499: Structured Concurrency (Fourth Preview)

Structured concurrency was introduced as an incubating API in JDK 19. In JDK 24, it is in its fourth preview. It aims to simplify multithreaded programming, not replace `java.util.concurrent`.

Structured concurrency treats multiple tasks running in different threads as a single unit of work. This simplifies error handling, improves reliability and observability, and preserves the readability and maintainability of single-threaded code.

The core API, `StructuredTaskScope`, splits a task into concurrent subtasks that run in their own threads. The subtasks must finish before the parent task continues.

Here is a basic example of `StructuredTaskScope`:

```java
    try (var scope = new StructuredTaskScope<Object>()) {
        // Fork threads to run subtasks.
        Subtask<Integer> subtask1 = scope.fork(task1);
        Subtask<String> subtask2 = scope.fork(task2);
        // Wait for the threads to finish.
        scope.join();
        // Process results or rethrow exceptions.
        ... process results/exceptions ...
    } // close
```

Structured concurrency works well with virtual threads, which are lightweight threads implemented by the JDK. Many virtual threads can share an operating system thread, allowing applications to create large numbers of them.
