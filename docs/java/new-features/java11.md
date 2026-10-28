---
title: Java 11 New Features (Important)
description: An overview of JDK 11, including the HTTP Client API and useful String enhancements.
category: Java
tag:
  - Java New Features
head:
  - - meta
    - name: keywords
      content: Java 11,JDK 11,LTS,HTTP Client,String API,removed features
---

Java 11 was released on September 25, 2018. It was an important release and the first Long-Term Support (LTS) version after Java 8. According to Oracle's current support roadmap, extended support for Java 11 continues through January 2032.

The chart below shows Oracle's support timeline for Oracle JDK.

![Oracle JDK support timeline](https://oss.javaguide.cn/github/javaguide/java/new-features/4c1611fad59449edbbd6e233690e9fa7.png)

The chart below shows the number of features and release dates for each update from JDK 8 through JDK 25:

![Feature counts and release dates for JDK 8 through JDK 25](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

This article covers some of the more notable features:

- [JEP 321: HTTP Client (Standard)](https://openjdk.org/jeps/321)
- [JEP 323: Local-Variable Syntax for Lambda Parameters](https://openjdk.org/jeps/323)
- [JEP 330: Launch Single-File Source-Code Programs](https://openjdk.org/jeps/330)
- [JEP 333: ZGC: A Scalable Low-Latency Garbage Collector (Experimental)](https://openjdk.org/jeps/333)

## JEP 321: HTTP Client (Standard)

Java 11 standardized the HTTP Client API, which was introduced in Java 9 and updated in Java 10. During incubation, the API was almost completely rewritten and gained full support for asynchronous, non-blocking operations.

In Java 11, the package name changed from `jdk.incubator.http` to `java.net.http`. The API uses `CompletableFuture` for non-blocking requests and responses. Here is a simple example:

```java
var request = HttpRequest.newBuilder()
    .uri(URI.create("https://javastack.cn"))
    .GET()
    .build();
var client = HttpClient.newHttpClient();

// Synchronous request
HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());

// Asynchronous request
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
    .thenApply(HttpResponse::body)
    .thenAccept(System.out::println);
```

## JEP 333: ZGC, a Scalable Low-Latency Garbage Collector (Experimental)

**ZGC stands for Z Garbage Collector.** It is a scalable, low-latency garbage collector.

ZGC was designed with these goals:

- GC pauses under 10 ms
- Support for heaps ranging from a few hundred MB to several TB
- No more than a 15% reduction in application throughput compared with G1
- A foundation for new GC features and optimizations using colored pointers and load barriers
- Support for Linux/x64 only at the time

At the time, ZGC was **experimental** and supported only Linux/x64. ZGC became a standard feature in Java 15, and generational ZGC was introduced in Java 21.

Like ParNew and G1, ZGC uses a copying algorithm, but with significant changes to the algorithm.

ZGC has fewer stop-the-world pauses.

For more details, see [Exploring and Applying the Next-Generation ZGC](https://tech.meituan.com/2020/08/06/new-zgc-practice-in-meituan.html).

## JEP 323: Local-Variable Syntax for Lambda Parameters

Java 10 introduced local variable type inference. It lets you use `var` instead of an explicit local variable type, which the compiler infers from the assigned value.

In Java 10, `var` had several restrictions:

- It could be used only for local variables.
- The variable had to be initialized where it was declared.
- It could not be used for method parameters.
- It could not be used in lambda expressions.

Java 11 allowed developers to use `var` in lambda parameter declarations.

```java
// These declarations are equivalent.
Consumer<String> consumer = (var i) -> System.out.println(i);
Consumer<String> consumer = (String i) -> System.out.println(i);
```

## JEP 330: Launch Single-File Source-Code Programs

This feature lets you run a single Java source file directly with the Java launcher. The source is compiled in memory and then executed, so no `.class` file is written to disk. All related classes must be defined in the same Java file.

This is useful for beginners and anyone who wants to try a small program. Along with JShell, it also makes Java more practical for scripting.

## API Enhancements

Not every API change is delivered through a JEP (Java Enhancement Proposal).

In JDK development, **JEPs** are generally used for major changes, such as new language features (`var`), JVM mechanisms (ZGC), or large library refactors. Adding a few methods to an existing class, such as `String.isBlank()`, is usually routine library maintenance. JDK developers submit and review these changes through **JBS (JDK Bug System)** tickets, and they ship with a release.

### String Enhancements

Java 11 added several String methods:

```java
// Check whether the string is blank.
" ".isBlank();//true
// Remove leading and trailing whitespace.
" Java ".strip();// "Java"
// Remove leading whitespace.
" Java ".stripLeading();   // "Java "
// Remove trailing whitespace.
" Java ".stripTrailing();  // "Java"
// Repeat the string three times.
"Java".repeat(3);             // "JavaJavaJava"
// Return a stream of lines separated by line terminators.
"A\nB\nC".lines().count();    // 3
"A\nB\nC".lines().collect(Collectors.toList());
```

### Optional Enhancements

`Optional` gained an `isEmpty()` method to check whether it contains a value.

```java
var op = Optional.empty();
System.out.println(op.isEmpty());// Check whether the Optional is empty.
```

## Other Features

- **Epsilon GC:** A no-op garbage collector that allocates from a fixed amount of memory, minimizing memory footprint and GC overhead.
- **Low-overhead heap profiling:** Java 11 added low-overhead sampling of Java heap allocations. It can report allocated objects and expose heap information through JVMTI.
- **TLS 1.3:** Java 11 added an implementation of the TLS 1.3 specification (RFC 8446) alongside earlier TLS versions, including TLS 1.2. It also improved other TLS features, such as the OCSP stapling extensions (RFC 6066 and RFC 6961) and the Extended Master Secret extension (RFC 7627), improving security and performance.
- **Java Flight Recorder (JFR):** Previously a profiling tool in commercial JDKs, JFR's source code was added to the public repository in Java 11, making it available to everyone.
- ...

## References

- JDK 11 Release Notes：<https://www.oracle.com/java/technologies/javase/11-relnote-issues.html>
- Java 11 – Features and Comparison：<https://www.geeksforgeeks.org/java-11-features-and-comparison/>

<!-- @include: @article-footer.snippet.md -->
