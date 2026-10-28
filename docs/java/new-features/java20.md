---
title: Java 20 New Features
description: An overview of JDK 20 language and concurrency updates, including further work on virtual threads and pattern matching.
category: Java
tag:
  - Java New Features
head:
  - - meta
    - name: keywords
      content: Java 20,JDK 20,record patterns preview,virtual thread updates,language enhancements,JEP
---

JDK 20 was released on March 21, 2023. It was a non-LTS release.

Its successor, JDK 21, was released in September 2023 as an LTS version.

JDK 20 included seven new features. This article covers some of the more notable ones:

- [JEP 429: Scoped Values (First Incubator)](https://openjdk.org/jeps/429)
- [JEP 432: Record Patterns (Second Preview)](https://openjdk.org/jeps/432)
- [JEP 433: Pattern Matching for `switch` (Fourth Preview)](https://openjdk.org/jeps/433)
- [JEP 434: Foreign Function & Memory API (Second Preview)](https://openjdk.org/jeps/434)
- [JEP 436: Virtual Threads (Second Preview)](https://openjdk.org/jeps/436)
- [JEP 437: Structured Concurrency (Second Incubator)](https://openjdk.org/jeps/437)
- [JEP 438: Vector API (Fifth Incubator)](https://openjdk.org/jeps/438)

The chart below shows the number of features and release dates for each update from JDK 8 through JDK 25:

![Feature counts and release dates for JDK 8 through JDK 25](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 429: Scoped Values (First Incubator)

Scoped values let you share immutable data within and across threads. They can be more efficient than thread-local variables, especially when using many virtual threads.

```java
final static ScopedValue<...> V = ScopedValue.newInstance();

// In some method
ScopedValue.where(V, <value>)
           .run(() -> { ... V.get() ... call methods ... });

// In a method called directly or indirectly from the lambda expression
... V.get() ...
```

Scoped values provide a safe and efficient way to share data between components in a large program without passing it through method parameters.

For more about scoped values, see [Scoped Values: Frequently Asked Questions](https://www.happycoders.eu/java/scoped-values/).

## JEP 432: Record Patterns (Second Preview)

Record patterns deconstruct record values, making it easier to extract data from record classes. They can also be nested and combined with type patterns for expressive, declarative, and composable data processing.

Record patterns are used with `instanceof` or `switch` pattern matching.

Here is a simple example using `instanceof`.

First, define a record:

```java
record Shape(String type, long unit){}
```

Before record patterns:

```java
Shape circle = new Shape("Circle", 10);
if (circle instanceof Shape shape) {

  System.out.println("Area of " + shape.type() + " is : " + Math.PI * Math.pow(shape.unit(), 2));
}
```

With record patterns:

```java
Shape circle = new Shape("Circle", 10);
if (circle instanceof Shape(String type, long unit)) {
  System.out.println("Area of " + type + " is : " + Math.PI * Math.pow(unit, 2));
}
```

Record patterns can also be used with `switch`.

Define a few types:

```java
interface Shape {}
record Circle(double radius) implements Shape { }
record Square(double side) implements Shape { }
record Rectangle(double length, double width) implements Shape { }
```

Before record patterns:

```java
Shape shape = new Circle(10);
switch (shape) {
    case Circle c:
        System.out.println("The shape is Circle with area: " + Math.PI * c.radius() * c.radius());
        break;

    case Square s:
        System.out.println("The shape is Square with area: " + s.side() * s.side());
        break;

    case Rectangle r:
        System.out.println("The shape is Rectangle with area: " + r.length() * r.width());
        break;

    default:
        System.out.println("Unknown Shape");
        break;
}
```

With record patterns:

```java
Shape shape = new Circle(10);
switch(shape) {

  case Circle(double radius):
    System.out.println("The shape is Circle with area: " + Math.PI * radius * radius);
    break;

  case Square(double side):
    System.out.println("The shape is Square with area: " + side * side);
    break;

  case Rectangle(double length, double width):
    System.out.println("The shape is Rectangle with area: " + length * width);
    break;

  default:
    System.out.println("Unknown Shape");
    break;
}
```

Record patterns avoid unnecessary casts and make code shorter and easier to read. They do not eliminate all `null` or `NullPointerException` risks: `null` does not match a record pattern, and reference components may still be `null`.

Record patterns were previewed for the first time in Java 19 through [JEP 405](https://openjdk.org/jeps/405), and for the second time in JDK 20 through [JEP 432](https://openjdk.org/jeps/432). The updates included:

- Support for inferring type arguments in generic record patterns.
- Support for record patterns in the header of an enhanced `for` statement.
- Removal of support for named record patterns.

**Note:** Do not confuse record patterns with record classes, which became a standard feature in [JDK 16](./java16.md).

## JEP 433: Pattern Matching for `switch` (Fourth Preview)

Like `instanceof`, `switch` gained pattern matching with automatic type conversion.

`instanceof` example:

```java
// Old code
if (o instanceof String) {
    String s = (String)o;
    ... use s ...
}

// New code
if (o instanceof String s) {
    ... use s ...
}
```

`switch` example:

```java
// Old code
static String formatter(Object o) {
    String formatted = "unknown";
    if (o instanceof Integer i) {
        formatted = String.format("int %d", i);
    } else if (o instanceof Long l) {
        formatted = String.format("long %d", l);
    } else if (o instanceof Double d) {
        formatted = String.format("double %f", d);
    } else if (o instanceof String s) {
        formatted = String.format("String %s", s);
    }
    return formatted;
}

// New code
static String formatterPatternSwitch(Object o) {
    return switch (o) {
        case Integer i -> String.format("int %d", i);
        case Long l    -> String.format("long %d", l);
        case Double d  -> String.format("double %f", d);
        case String s  -> String.format("String %s", s);
        default        -> o.toString();
    };
}
```

Pattern matching for `switch` was previewed in Java 17, 18, and 19, then previewed for a fourth time in Java 20. Each preview included minor updates, which are not covered here.

## JEP 434: Foreign Function & Memory API (Second Preview)

This API lets Java programs interoperate with code and data outside the Java runtime. It can call foreign functions (code outside the JVM) efficiently and access foreign memory (memory not managed by the JVM) safely, allowing Java programs to use native libraries and data without JNI's risks and fragility.

The Foreign Function and Memory API was incubated in Java 17 through [JEP 412](https://openjdk.java.net/jeps/412), incubated again in Java 18 through [JEP 419](https://openjdk.org/jeps/419), and previewed for the first time in Java 19 through [JEP 424](https://openjdk.org/jeps/424).

It was previewed for the second time in JDK 20 through [JEP 434](https://openjdk.org/jeps/434), with these updates:

- A unified abstraction for `MemorySegment` and `MemoryAddress`.
- An enhanced `MemoryLayout` hierarchy.
- `MemorySession` split into `Arena` and `SegmentScope` to support sharing segments across maintenance boundaries.

For more about the Foreign Function and Memory API, see [Java 19 New Features](./java19.md).

## JEP 436: Virtual Threads (Second Preview)

Virtual threads are lightweight threads implemented by the JDK rather than the OS and scheduled by the JDK. Many virtual threads share an operating-system thread, so an application can have far more virtual threads than OS threads.

Before virtual threads, `java.lang.Thread` supported what are now called platform threads. The JVM scheduler runs virtual threads on platform threads, also called carrier threads. A platform thread can run different virtual threads over time; when one is blocked or waiting, the platform thread can run another.

The diagram below shows the relationship between virtual threads, platform threads, and OS threads. Source: [How to Use Java 19 Virtual Threads](https://medium.com/javarevisited/how-to-use-java-19-virtual-threads-c16a32bad5f7).

![Relationship between virtual threads, platform threads, and OS threads](https://oss.javaguide.cn/github/javaguide/java/new-features/virtual-threads-platform-threads-kernel-threads-relationship.png)

On mainstream operating systems such as Windows and Linux, Java uses a one-to-one thread model: each platform thread maps to one OS thread. Solaris is an exception; HotSpot VM supports both many-to-many and one-to-one models there. See [Is the JVM's thread model user-level?](https://www.zhihu.com/question/23096638/answer/29617153) for details.

Virtual threads are cheaper and lighter than platform threads. They can be discarded after use, so they do not need to be reused or pooled; each task can have its own virtual thread. Suspending and resuming virtual threads usually avoids creating or switching OS threads for each task, reducing thread-resource and scheduling overhead for workloads with many blocking tasks.

Similar constructs have proved useful in other languages, such as goroutines in Go and processes in Erlang.

For a discussion of Java 19 virtual threads, see <https://www.zhihu.com/question/536743167>.

For more about how Java virtual threads work, see:

- [A Short Introduction to Virtual Threads](https://javaguide.cn/java/concurrent/virtual-thread.html)
- [Java 19 GA: How Virtual Threads Can Increase System Throughput](https://mp.weixin.qq.com/s/yyApBXxpXxVwttr01Hld6Q)
- [Virtual Threads: A Look at the VirtualThread Source Code](https://www.cnblogs.com/throwable/p/16758997.html)

Virtual threads were previewed for the first time in Java 19 through [JEP 425](https://openjdk.org/jeps/425), then previewed again in JDK 20 with minor changes.

Here are four ways to create virtual threads:

```java
// 1. Create one with Thread.ofVirtual().
Runnable fn = () -> {
  // your code here
};

Thread thread = Thread.ofVirtual()
                      .start(fn);

// 2. Create one with Thread.startVirtualThread().
Thread thread = Thread.startVirtualThread(() -> {
  // your code here
});

// 3. Create an executor with Executors.newVirtualThreadPerTaskExecutor().
var executorService = Executors.newVirtualThreadPerTaskExecutor();

executorService.submit(() -> {
  // your code here
});

class CustomThread implements Runnable {
  @Override
  public void run() {
    System.out.println("CustomThread run");
  }
}

// 4. Create one with a ThreadFactory.
CustomThread customThread = new CustomThread();
// Get the thread factory.
ThreadFactory factory = Thread.ofVirtual().factory();
// Create a virtual thread.
Thread thread = factory.newThread(customThread);
// Start the thread.
thread.start();
```

These four approaches show how the JDK reuses the existing `Thread` API to make virtual threads easier to adopt.

## JEP 437: Structured Concurrency (Second Incubator)

Java 19 introduced structured concurrency as an incubator feature. This approach aims to simplify multithreaded programming through a structured concurrency API; it is not intended to replace `java.util.concurrent`.

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

The only change to structured concurrency in JDK 20 was support for inheriting scoped values in threads created within a `StructuredTaskScope`. This simplifies sharing immutable data across threads; see [JEP 429](https://openjdk.org/jeps/429).

## JEP 438: Vector API (Fifth Incubator)

Vector computations consist of a series of operations on vectors. The Vector API expresses these computations so they can be reliably compiled at runtime to optimal vector instructions for supported CPU architectures, outperforming equivalent scalar computations.

The API aims to provide a concise, easy-to-use, platform-independent way to express a wide range of vector computations.

The Vector API was proposed in [JEP 338](https://openjdk.java.net/jeps/338) and added to Java 16 as an [incubator API](http://openjdk.java.net/jeps/11). It was incubated again in Java 17 through [JEP 414](https://openjdk.java.net/jeps/414), Java 18 through [JEP 417](https://openjdk.java.net/jeps/417), and Java 19 through [JEP 426](https://openjdk.java.net/jeps/426).

The fifth incubation in Java 20 made no major API changes, but included bug fixes and performance improvements. See [JEP 438](https://openjdk.org/jeps/438).

<!-- @include: @article-footer.snippet.md -->
