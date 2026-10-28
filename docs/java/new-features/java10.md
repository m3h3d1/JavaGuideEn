---
title: Java 10 New Features
description: An overview of JDK 10, including var type inference and other platform improvements.
category: Java
tag:
  - Java New Features
head:
  - - meta
    - name: keywords
      content: Java 10,JDK 10,var local variable type inference,garbage collection improvements,performance
---

**Java 10** was released on March 20, 2018. It was a non-LTS release, and Oracle provided support for only six months.

The chart below shows the number of features and release dates for each update from JDK 8 through JDK 25:

![Feature counts and release dates for JDK 8 through JDK 25](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

This article covers some of the more notable features:

- [JEP 286: Local-Variable Type Inference](https://openjdk.org/jeps/286)
- [JEP 304: Garbage-Collector Interface](https://openjdk.org/jeps/304)
- [JEP 307: Parallel Full GC for G1](https://openjdk.org/jeps/307)
- [JEP 310: Application Class-Data Sharing](https://openjdk.org/jeps/310)
- [JEP 317: Experimental Java-Based JIT Compiler](https://openjdk.org/jeps/317)

## JEP 286: Local-Variable Type Inference

Many Java developers had asked for local variable type inference. It arrived in Java 10.

Java 10 introduced the `var` keyword for declaring local variables.

```java
var id = 0;
var codefx = new URL("https://mp.weixin.qq.com/");
var list = new ArrayList<>();
var list = List.of(1, 2, 3);
var map = new HashMap<String, String>();
var p = Paths.of("src/test/java/Java9FeaturesTest.java");
var numbers = List.of("a", "b", "c");
for (var n : numbers)
    System.out.print(n+ " ");
```

`var` can be used only for local variables with an initializer. It also works for variables in basic and enhanced `for` loops, and for resources in `try`-with-resources statements. It cannot be used for fields, method parameters, or return types.

```java
var count = null; //❌ Does not compile: cannot infer a type from null
var r = () -> Math.random();//❌ Does not compile: cannot infer a lambda type
var array = {1, 2, 3};//❌ Does not compile: invalid array initializer
```

`var` does not make Java dynamically typed. The compiler still determines the variable's static type.

Scala and Kotlin also have the `val` keyword, which declares an immutable local variable.

## JEP 304: Garbage-Collector Interface

In earlier JDK versions, the components that made up GC implementations were spread across the codebase. Java 10 introduced a cleaner GC interface to separate the source code for different collectors.

## JEP 307: Parallel Full GC for G1

G1 became the default collector in Java 9. It was designed for low latency and to avoid Full GC, but Java 9 still used a single thread for G1 Full GC's mark-sweep phase. A Full GC could occur when the collector could not reclaim enough memory.

Starting with Java 10, G1 Full GC used multiple worker threads to mark, sweep, and compact in parallel, reducing pause times. This change did not directly reduce how often Full GC was triggered.

## JEP 310: Application Class-Data Sharing

Java 5 introduced Class Data Sharing (CDS), which lets the JVM store preprocessed system classes in a shared archive. The JVM can map this archive into memory at runtime, reducing startup time and memory use across multiple JVMs. AppCDS, which adds application classes to the archive, was previously a commercial feature in Oracle JDK.

Java 10 expanded CDS and made AppCDS available, allowing application classes to be stored in a shared archive. A typical workflow generates a list of application classes, creates an archive from that list, and maps the archive into memory at startup. The text file listing the classes is not itself a cache loaded by the JVM on later starts.

## JEP 317: Experimental Java-Based JIT Compiler

Graal is a JIT compiler written in Java. It is the basis of the experimental Ahead-of-Time (AOT) compiler introduced in JDK 9.

Oracle's HotSpot VM includes two JIT compilers written in C++: C1 and C2. In Java 10 on Linux/x64 and macOS/x64, HotSpot still used C2 by default. You could replace it with Graal by passing `-XX:+UnlockExperimentalVMOptions -XX:+UseJVMCICompiler` to the `java` command.

## API Enhancements

Not every API change is delivered through a JEP (Java Enhancement Proposal).

In JDK development, **JEPs** are generally used for major changes, such as new language features (`var`), JVM mechanisms (ZGC), or large library refactors. Adding a few methods to an existing class, such as `List.copyOf()`, is usually routine library maintenance. JDK developers submit and review these changes through **JBS (JDK Bug System)** tickets, and they ship with a release.

### Collection Enhancements

`List`, `Set`, and `Map` provide a static `copyOf()` method that returns an unmodifiable copy of the input collection.

```java
static <E> List<E> copyOf(Collection<? extends E> coll) {
    return ImmutableCollections.listCopy(coll);
}
```

Collections created with `copyOf()` are unmodifiable. Attempts to add, remove, replace, or sort elements throw `java.lang.UnsupportedOperationException`. IntelliJ IDEA also warns about these operations.

![Collections created with `copyOf()` are unmodifiable](https://oss.javaguide.cn/java-guide-blog/image-20210816154125579.png)

`java.util.stream.Collectors` also gained static methods for collecting stream elements into unmodifiable collections.

```java
var list = new ArrayList<>();
list.stream().collect(Collectors.toUnmodifiableList());
list.stream().collect(Collectors.toUnmodifiableSet());
```

### Optional Enhancements

`Optional` gained a no-argument `orElseThrow()` method. It is a shorter version of `orElseThrow(Supplier<? extends X> exceptionSupplier)` and throws `NoSuchElementException` when no value is present.

```java
Optional<String> optional = Optional.empty();
String result = optional.orElseThrow();
```

## Other Features

- **Thread-local handshakes:** Java 10 introduced a mechanism for thread callbacks at JVM safepoints without requiring a global safepoint. The callback runs on the target thread or a JVM thread while the target remains blocked, making it possible to stop a single thread instead of all threads.
- **Heap allocation on alternative memory devices:** Java 10 enabled the JVM to allocate heap memory on optional memory devices suited to different storage technologies.
- ……

## References

- Java 10 Features and Enhancements : <https://howtodoinjava.com/java10/java10-features/>

- Guide to Java10 : <https://www.baeldung.com/java-10-overview>

- 4 Class Data Sharing : <https://docs.oracle.com/javase/10/vm/class-data-sharing.htm#JSJVM-GUID-7EAA3411-8CF0-4D19-BD05-DF5E1780AA91>

<!-- @include: @article-footer.snippet.md -->
