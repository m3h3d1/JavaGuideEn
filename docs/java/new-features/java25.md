---
title: Java 25 New Features
description: An overview of key features and preview changes in JDK 25, including concurrency, garbage collection, and language and platform updates.
category: Java
tag:
  - Java New Features
head:
  - - meta
    - name: keywords
      content: Java 25,JDK 25,LTS,scoped values,compact object headers,generational Shenandoah,module imports,structured concurrency
---

JDK 25 was released on September 16, 2025. It is a significant milestone for Java.

Most JDK vendors, including Oracle, designate JDK 25 as an LTS release. Oracle's LTS releases include JDK 8, 11, 17, 21, and 25.

JDK 25 includes 18 new features. This article covers some of the key ones:

- [JEP 506: Scoped Values](https://openjdk.org/jeps/506)
- [JEP 512: Compact Source Files and Instance Main Methods](https://openjdk.org/jeps/512)
- [JEP 519: Compact Object Headers](https://openjdk.org/jeps/519)
- [JEP 521: Generational Shenandoah](https://openjdk.org/jeps/521)
- [JEP 507: Primitive Types in Patterns, `instanceof`, and `switch` (Third Preview)](https://openjdk.org/jeps/507)
- [JEP 505: Structured Concurrency (Fifth Preview)](https://openjdk.org/jeps/505)
- [JEP 511: Module Import Declarations](https://openjdk.org/jeps/511)
- [JEP 513: Flexible Constructor Bodies](https://openjdk.org/jeps/513)
- [JEP 508: Vector API (Tenth Incubator)](https://openjdk.org/jeps/508)

The chart below shows the number of features and release dates for each update from JDK 8 through JDK 25:

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

## JDK 25

### JEP 506: Scoped Values

Scoped values let threads share immutable data, and can be a better fit than thread-local variables (`ThreadLocal`), especially when using many virtual threads.

```java
final static ScopedValue<...> V = ScopedValue.newInstance();

// In some method
ScopedValue.where(V, <value>)
           .run(() -> { ... V.get() ... call methods ... });

// In a method called directly or indirectly from the lambda expression
... V.get() ...
```

Scoped values provide one-way, immutable data transfer from callers to callees. Child threads created through structured concurrency can inherit bindings from their parent without copying them, reducing the time and memory costs of sharing context across many threads.

### JEP 512: Compact Source Files and Instance Main Methods

This feature was first previewed in JDK 21 through [JEP 445](https://openjdk.org/jeps/445 "JEP 445"), then refined in JDK 22, 23, and 24 before becoming permanent in JDK 25.

This feature simplifies writing small Java programs. A class and its main method can be placed in one file without a top-level `public` class, and `main` can be a non-static instance method.

```java
class HelloWorld {
    void main() {
        System.out.println("Hello, World!");
    }
}
```

It can be simplified further:

```java
void main() {
    System.out.println("Hello, World!");
}
```

This lowers the learning curve and makes small programs and scripts quicker to write. Beginners no longer need to start with the full `public static void main(String[] args)` declaration. It also makes Java more convenient for prototyping and scripting.

### JEP 519: Compact Object Headers

This feature was introduced as an experimental feature in JDK 24 through [JEP 450](https://openjdk.org/jeps/450 "JEP 450") and became permanent in JDK 25.

By optimizing the object header layout, HotSpot on 64-bit systems reduces object headers from 96–128 bits (12–16 bytes) to 64 bits (8 bytes). This can reduce heap usage, increase deployment density, and improve data locality.

Compact object headers are not enabled by default. Enable them explicitly:

- In JDK 24, use this combination of command-line options:
  `$ java -XX:+UnlockExperimentalVMOptions -XX:+UseCompactObjectHeaders ...`；
- In JDK 25 and later, use `-XX:+UseCompactObjectHeaders`.

### JEP 521: Generational Shenandoah

Shenandoah GC was introduced as an experimental feature in JDK 12 and became a product feature in JDK 15. It is disabled by default and can be enabled with `-XX:+UseShenandoahGC`.

Shenandoah is a low-pause garbage collector led by Red Hat. It aims to keep pauses short and relatively independent of heap size, even with large heaps.

Traditional Shenandoah concurrently marks and compacts the whole heap. Although pauses are very short, it is less efficient than a generational collector when handling young objects. Generational Shenandoah can reclaim short-lived young objects more often and efficiently, improving throughput and reducing CPU overhead while keeping pauses very short.

Enable generational Shenandoah with these options:

- In JDK 24: `-XX:+UseShenandoahGC -XX:+UnlockExperimentalVMOptions -XX:ShenandoahGCMode=generational`
- In JDK 25 and later: `-XX:+UseShenandoahGC -XX:ShenandoahGCMode=generational`

### JEP 507: Primitive Types in Patterns, `instanceof`, and `switch` (Third Preview)

This feature was first previewed in JDK 23 through [JEP 455](https://openjdk.org/jeps/455 "JEP 455").

Pattern matching can handle all primitive types (`int`, `double`, `boolean`, and others) in `switch` and `instanceof` statements.

```java
static void test(Object obj) {
    if (obj instanceof int i) {
        System.out.println("This is an int: " + i);
    }
}
```

This allows safer and simpler pattern matching and conversions for primitive types, just as for reference types, and reduces boilerplate in Java.

### JEP 505: Structured Concurrency (Fifth Preview)

Structured concurrency was introduced as an incubating API in JDK 19. In JDK 25, it is in its fifth preview. It aims to simplify multithreaded programming, not replace `java.util.concurrent`.

Structured concurrency treats multiple tasks running in different threads as a single unit of work. This simplifies error handling, improves reliability and observability, and preserves the readability and maintainability of single-threaded code.

The core API, `StructuredTaskScope`, splits a task into concurrent subtasks that run in their own threads. The subtasks must finish before the parent task continues.

Here is a basic example of `StructuredTaskScope`:

```java
    try (var scope = StructuredTaskScope.open()) {
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

### JEP 511: Module Import Declarations

This feature was first previewed in JDK 23 through [JEP 476](https://openjdk.org/jeps/476 "JEP 476"), refined in JDK 24 through [JEP 494](https://openjdk.org/jeps/494 "JEP 494"), and became permanent in JDK 25.

Module import declarations let Java code import all exported packages from a module without listing each package. This simplifies reuse of modular libraries and makes third-party libraries and core Java classes easier to access.

This feature is especially useful for beginners and prototyping. It avoids requiring developers to modularize their own code, remains compatible with traditional imports, and can make code easier to write and read.

```java
// Import java.base to use types such as List, Map, and Stream without separate imports.
import module java.base;

public class Example {
    public static void main(String[] args) {
        String[] fruits = { "apple", "berry", "citrus" };
        Map<String, String> fruitMap = Stream.of(fruits)
            .collect(Collectors.toMap(
                s -> s.toUpperCase().substring(0, 1),
                Function.identity()));

        System.out.println(fruitMap);
    }
}
```

### JEP 513: Flexible Constructor Bodies

This feature was first previewed in JDK 22 through [JEP 447](https://openjdk.org/jeps/447 "JEP 447"), then previewed in JDK 23 through [JEP 482](https://openjdk.org/jeps/482 "JEP 482") and JDK 24 through [JEP 492](https://openjdk.org/jeps/492 "JEP 492"), before becoming permanent in JDK 25.

Java requires a `super(...)` or `this(...)` call to be the first statement in a constructor. This prevents a subclass constructor from initializing fields before calling its superclass constructor.

Flexible constructor bodies address this limitation by allowing statements before `super(...)` or `this(...)`. These statements can initialize fields but cannot reference the instance under construction. This helps prevent superclass constructors from calling subclass methods before the subclass fields are initialized.

This feature gives developers more flexibility in organizing constructors. For example, they can validate, prepare, and share data directly in a constructor without relying on helper methods or constructors.

```java
class Person {
    private final String name;
    private int age;

    public Person(String name, int age) {
        if (age < 0) {
            throw new IllegalArgumentException("Age cannot be negative.");
        }
        this.name = name; // Initialize the field before calling the superclass constructor.
        this.age = age;
        // ... other initialization code
    }
}

class Employee extends Person {
    private final int employeeId;

    public Employee(String name, int age, int employeeId) {
        this.employeeId = employeeId; // Initialize the field before calling the superclass constructor.
        super(name, age); // Call the superclass constructor.
        // ... other initialization code
    }
}
```

### JEP 508: Vector API (Tenth Incubator)

Vector computations consist of a series of operations on vectors. The Vector API expresses these computations so they can be compiled at runtime to optimal vector instructions for supported CPU architectures, outperforming equivalent scalar computations.

The API aims to provide a concise, easy-to-use, platform-independent way to express a wide range of vector computations.

Here is a simple scalar computation over array elements:

```java
void scalarComputation(float[] a, float[] b, float[] c) {
   for (int i = 0; i < a.length; i++) {
        c[i] = (a[i] * a[i] + b[i] * b[i]) * -1.0f;
   }
}
```

Here is the equivalent vector computation using the Vector API:

```java
static final VectorSpecies<Float> SPECIES = FloatVector.SPECIES_PREFERRED;

void vectorComputation(float[] a, float[] b, float[] c) {
    int i = 0;
    int upperBound = SPECIES.loopBound(a.length);
    for (; i < upperBound; i += SPECIES.length()) {
        // FloatVector va, vb, vc;
        var va = FloatVector.fromArray(SPECIES, a, i);
        var vb = FloatVector.fromArray(SPECIES, b, i);
        var vc = va.mul(va)
                   .add(vb.mul(vb))
                   .neg();
        vc.intoArray(c, i);
    }
    for (; i < a.length; i++) {
        c[i] = (a[i] * a[i] + b[i] * b[i]) * -1.0f;
    }
}
```

Although it is still incubating, its tenth iteration shows its importance. It helps Java remain competitive in performance-sensitive areas such as scientific computing, machine learning, and big data processing.
