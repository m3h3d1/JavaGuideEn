---
title: Java 16 New Features
description: An overview of JDK 16 language and platform updates, including records and other JEPs.
category: Java
tag:
  - Java New Features
head:
  - - meta
    - name: keywords
      content: Java 16,JDK 16,records,new APIs,JEP,performance
---

Java 16 was released on March 16, 2021. It was a non-LTS release.

JDK 16 included 17 new features. This article covers some of the more notable ones:

- [JEP 338: Vector API (Incubator)](https://openjdk.java.net/jeps/338)
- [JEP 376: ZGC: Concurrent Thread-Stack Processing](https://openjdk.java.net/jeps/376)
- [JEP 387: Elastic Metaspace](https://openjdk.java.net/jeps/387)
- [JEP 390: Warnings for Value-Based Classes](https://openjdk.java.net/jeps/390)
- [JEP 394: Pattern Matching for `instanceof`](https://openjdk.java.net/jeps/394)
- [JEP 395: Records](https://openjdk.java.net/jeps/395)
- [JEP 396: Strongly Encapsulate JDK Internals by Default](https://openjdk.java.net/jeps/396)
- [JEP 397: Sealed Classes (Second Preview)](https://openjdk.java.net/jeps/397)

The chart below shows the number of features and release dates for each update from JDK 8 through JDK 25:

![Feature counts and release dates for JDK 8 through JDK 25](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

Related reading: [OpenJDK Java 16 documentation](https://openjdk.java.net/projects/jdk/16/).

## JEP 338: Vector API (First Incubator)

The Vector API was proposed in [JEP 338](https://openjdk.java.net/jeps/338) and added to Java 16 as an [incubator API](http://openjdk.java.net/jeps/11). It was incubated again in Java 17 through [JEP 414](https://openjdk.java.net/jeps/414), Java 18 through [JEP 417](https://openjdk.java.net/jeps/417), and Java 19 through [JEP 426](https://openjdk.java.net/jeps/426).

This incubator API provides an initial way to express vector computations. At runtime, these computations can be compiled to optimal vector instructions for supported CPU architectures, outperforming equivalent scalar computations and taking advantage of Single Instruction, Multiple Data (SIMD) instructions available on most modern CPUs. HotSpot supports auto-vectorization, but the set of scalar operations it can convert is limited and sensitive to code changes. The API makes it easier to write portable, high-performance vector algorithms in Java.

For more about the Vector API, see [Java 18 New Features](./java18.md).

## JEP 347: Enable C++ 14 Language Features

Java 16 allowed C++14 language features in the JDK's C++ source code and provided guidance on which features could be used in HotSpot.

In Java 15, JDK C++ code was limited to the C++98/03 language standard. This change required raising the minimum supported versions of platform compilers.

## JEP 376: ZGC: Concurrent Thread-Stack Processing

Java 16 moved ZGC thread-stack processing from safepoints to a concurrent phase, allowing GC safepoint pauses to remain in the millisecond range even with large heaps. Removing this last source of latency can improve application performance and efficiency.

## JEP 387: Elastic Metaspace

Since its introduction, Metaspace was often reported to use too much off-heap memory. Elastic Metaspace returns unused HotSpot class metadata memory to the operating system more quickly, reducing Metaspace's footprint.

The proposal also simplified Metaspace's implementation to reduce maintenance costs.

## JEP 390: Warnings for Value-Based Classes

> The following explanation is from [A Practical Look at Java 16 Language Features](https://xie.infoq.cn/article/8304c894c4e38318d38ceb116), which is worth reading.

In Java 9, the `@Deprecated` annotation gained the `since` and `forRemoval` elements. `since` specifies the release in which an API was deprecated. `forRemoval` clarifies the intent: when set to `true`, the API is intended to be removed in a future release, and developers should use a replacement. Before Java 9, deprecation could mean several things, such as a risk in continued use, possible future incompatibility, planned removal, or the availability of a better alternative.

The constructors of primitive wrapper classes such as `java.lang.Integer` and `java.lang.Double` are marked `@Deprecated(since="9", forRemoval = true)`. They are intended for removal, so avoid code such as `new Integer(10)`. Use `Integer a = 10` or `Integer.valueOf()` instead. Otherwise, the compiler reports that `Integer(int)` is deprecated and marked for removal. These wrapper classes, along with `java.util.Optional` and `java.time.LocalDateTime`, are also designated as value-based classes. Do not confuse them with the value types proposed by Project Valhalla.

Using an instance of a value-based class in a `synchronized` block also produces a compiler warning in JDK 16. HotSpot can additionally log or prevent this kind of synchronization at runtime through diagnostic options. Even without runtime diagnostics enabled, do not use value-based class instances as locks. For example:

```java
private Integer count = 0;

public void inc() {
    synchronized (count) {
        count++;
    }
}
```

`Integer` is immutable. `count++` unboxes the value, increments it, boxes it again, and assigns a different `Integer` instance to the field. Different threads may therefore lock different objects, so the lock does not reliably protect this compound operation. Use a stable lock object or `AtomicInteger` for concurrent increments.

## JEP 392: Packaging Tool (Standard)

JEP 343 introduced the `jpackage` tool in Java 14. It continued as an incubator feature in Java 15 and became a standard feature in Java 16.

The tool packages self-contained Java applications in native formats for a more familiar installation experience. Supported formats include MSI and EXE on Windows, PKG and DMG on macOS, and DEB and RPM on Linux. You can specify launch-time options during packaging and invoke the tool from the command line or programmatically through the ToolProvider API. The module name changed from `jdk.incubator.jpackage` to `jdk.jpackage`. This improves the installation experience and simplifies deployment through app stores.

For a practical demonstration, see [Playing with Java 16 jpackage](https://www.youtube.com/watch?v=KahYIVzRIkQ).

## JEP 393: Foreign Memory Access API (Third Incubator)

The Foreign Memory Access API lets Java programs access memory outside the Java heap safely and efficiently.

The API was incubated for the first time in Java 14 ([JEP 370](https://openjdk.org/jeps/370)), for the second time in Java 15 ([JEP 383](https://openjdk.org/jeps/383)), and for the third time in Java 16.

The API was designed to be:

- **General:** A single API should work with different kinds of memory, such as native, persistent, and heap memory.
- **Safe:** It should preserve JVM safety regardless of the memory being accessed.
- **Flexible:** It should let developers choose how memory is released, explicitly or implicitly.
- **Usable:** It should provide an accessible alternative to `sun.misc.Unsafe` for programs that need external memory.

## JEP 394: Pattern Matching for `instanceof` (Standard)

| JDK version | Update type    | JEP                                     | Changes                                             |
| ----------- | -------------- | --------------------------------------- | --------------------------------------------------- |
| Java SE 14  | Preview        | [JEP 305](https://openjdk.org/jeps/305) | Pattern matching for `instanceof` introduced.       |
| Java SE 15  | Second preview | [JEP 375](https://openjdk.org/jeps/375) | No major changes; more feedback was gathered.       |
| Java SE 16  | Standard       | [JEP 394](https://openjdk.org/jeps/394) | Pattern variables are no longer implicitly `final`. |

Starting in Java 16, pattern variables from `instanceof` checks can be reassigned.

```java
// Traditional form
if (o instanceof String) {
    String s = (String)o;
    ... use s ...
}

// Pattern matching form
if (o instanceof String s) {
    ... use s ...
}
```

## JEP 395: Records (Standard)

Record feature history:

| JDK version | Update type    | JEP                                          | Changes                                                           |
| ----------- | -------------- | -------------------------------------------- | ----------------------------------------------------------------- |
| Java SE 14  | Preview        | [JEP 359](https://openjdk.java.net/jeps/359) | Added `record` for concise declarations of immutable data.        |
| Java SE 15  | Second preview | [JEP 384](https://openjdk.org/jeps/384)      | Allowed records in local methods and interfaces.                  |
| Java SE 16  | Standard       | [JEP 395](https://openjdk.org/jeps/395)      | Non-static inner classes can declare non-constant static members. |

Starting in Java SE 16, non-static inner classes can declare non-constant static members.

```java
public class Outer {
  class Inner {
    static int age;
  }
}
```

> Before JDK 16, an IDE would report an error for this code: a static field cannot be declared in a non-static inner class unless it is initialized with a constant expression.

## JEP 396: Strongly Encapsulate JDK Internals by Default

This feature strongly encapsulates JDK internals by default, with exceptions for critical internal APIs such as `sun.misc.Unsafe`. Code that accessed JDK internals and worked on earlier releases may no longer work. Developers are encouraged to migrate to standard APIs so they and their users can upgrade to future Java versions more easily. Strong encapsulation is controlled by the JDK 9 launcher option `--illegal-access`, which changed to `warning` by default in JDK 15 and `deny` in JDK 16. At the time, one command-line option could still relax encapsulation for all packages; future releases would require `--add-opens` for specific packages.

## JEP 397: Sealed Classes (Second Preview)

Sealed classes were proposed in [JEP 360](https://openjdk.java.net/jeps/360) and previewed in Java 15. JDK 16 made them stricter about permitted subclasses and inheritance, then previewed them again through [JEP 397](https://openjdk.java.net/jeps/397).

For more about sealed classes, see [Java 14 and 15 New Features](./java14-15.md).

## Other Optimizations and Improvements

- **JEP 380: Unix-Domain Socket Channels:** Unix-domain sockets, long supported on most Unix platforms, also became available on Windows 10 and Windows Server 2019. The `java.nio.channels` socket and server-socket channel APIs gained support for Unix-domain (AF_UNIX) sockets. These sockets provide interprocess communication (IPC) on the same host. They are similar to TCP/IP sockets, but use filesystem paths instead of IP addresses and port numbers. For local IPC, they can be more secure and efficient than TCP/IP loopback connections.
- **JEP 389: Foreign Linker API (Incubator):** This incubator API provides a statically typed, pure Java way to access native code. It simplifies the complex and error-prone process of binding native libraries. Java has supported native method calls through JNI since Java 1.1, but binding libraries should be easier and should not require JNI glue code.
- **JEP 357: Migrate from Mercurial to Git:** OpenJDK source code was previously managed with Mercurial and moved to Git.
- **JEP 369: Migrate to GitHub:** After moving version control from Mercurial to Git, the OpenJDK community chose GitHub to host its Git repositories. The migration covered JDK 11 and later.
- **JEP 386: Alpine Linux Port:** Alpine Linux is a small, independent, non-commercial Linux distribution. A container can require as little as 8 MB, and a minimal disk installation about 130 MB, while maintaining a focus on security. This JEP ported the JDK to Alpine Linux, which is based on musl libc. It also applies to other x64 and AArch64 Linux distributions that use musl libc.
- **JEP 388: Windows/AArch64 Port:** These JEPs focused on integrating ports into the JDK mainline repository. JEP 386 ported the JDK to Alpine Linux and other distributions that use musl as their primary C library on x64. JEP 388 ported the JDK to Windows on AArch64 (ARM64).

## References

- [Java Language Changes](https://docs.oracle.com/en/java/javase/16/language/java-language-changes.html)
- [Consolidated JDK 16 Release Notes](https://www.oracle.com/java/technologies/javase/16all-relnotes.html)
- [Java 16 Released: A Look at Its New Features](https://www.infoq.cn/article/IAkwhx7i9V7G8zLVEd4L)
- [A Practical Look at Java 16 Language Features](https://xie.infoq.cn/article/8304c894c4e38318d38ceb116)

<!-- @include: @article-footer.snippet.md -->
