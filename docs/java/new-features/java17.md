---
title: "Java 17 Features: Sealed Classes, Switch Pattern Matching, and Random Number APIs"
description: An overview of Java 17 features, including sealed classes, switch pattern matching, new random number APIs, the Foreign Function and Memory API, LTS support, and upgrade considerations.
category: Java
tag:
  - Java New Features
head:
  - - meta
    - name: keywords
      content: Java 17,JDK 17,LTS,sealed classes,switch pattern matching,random number API,Foreign Function and Memory API,JEP
---

Java 17 was released on September 14, 2021. Oracle designated it as a Long-Term Support (LTS) release.

According to Oracle's Java SE support roadmap, updated in April 2026, Premier Support for Oracle JDK 17 runs through September 2026, and Extended Support through September 2029. Free updates and commercial support vary by JDK distribution, so check the policy for the distribution used in production.

![](https://oss.javaguide.cn/github/javaguide/java/new-features/4c1611fad59449edbbd6e233690e9fa7.png)

When upgrading from JDK 11 to JDK 17, pay attention to sealed classes, switch pattern matching, the new pseudorandom number APIs, and compatibility changes caused by stronger encapsulation of JDK internals. Spring 6.x and Spring Boot 3.x also require Java 17 or later.

JDK 17 includes 14 new features. This article covers some of the more notable ones:

- [JEP 356: Enhanced Pseudo-Random Number Generators](https://openjdk.java.net/jeps/356)
- [JEP 398: Deprecate the Applet API for Removal](https://openjdk.java.net/jeps/398)
- [JEP 403: Strongly Encapsulate JDK Internals](https://openjdk.org/jeps/403)
- [JEP 406: Pattern Matching for `switch` (Preview)](https://openjdk.java.net/jeps/406)
- [JEP 407: Remove RMI Activation](https://openjdk.java.net/jeps/407)
- [JEP 409: Sealed Classes](https://openjdk.java.net/jeps/409)
- [JEP 410: Remove the Experimental AOT and JIT Compiler](https://openjdk.java.net/jeps/410)
- [JEP 411: Deprecate the Security Manager for Removal](https://openjdk.java.net/jeps/411)
- [JEP 412: Foreign Function & Memory API (Incubator)](https://openjdk.java.net/jeps/412)
- [JEP 414: Vector API (Second Incubator)](https://openjdk.java.net/jeps/414)

The chart below shows the number of features and release dates for each update from JDK 8 through JDK 16:

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

Related reading: [OpenJDK Java 17 documentation](https://openjdk.java.net/projects/jdk/17/).

## JEP 356: Enhanced Pseudo-Random Number Generators

Before JDK 17, Java provided `Random`, `ThreadLocalRandom`, and `SplittableRandom` for generating random numbers. Each had limitations, and common pseudorandom algorithms were missing.

Java 17 added new interfaces and implementations for pseudorandom number generators (PRNGs), also called deterministic random bit generators. This makes it easier to switch between PRNG algorithms in an application.

> A [PRNG](https://ctf-wiki.org/crypto/streamcipher/prng/intro/) generates a sequence of numbers that approximates a truly random sequence. It usually starts from an initial value called a seed. Given the same seed, a PRNG produces the same sequence, so its output is not truly random.

Example:

```java
RandomGeneratorFactory<RandomGenerator> l128X256MixRandom = RandomGeneratorFactory.of("L128X256MixRandom");
// Use the current timestamp as the seed.
RandomGenerator randomGenerator = l128X256MixRandom.create(System.currentTimeMillis());
// Generate a random number.
randomGenerator.nextInt(10);
```

## JEP 398: Deprecate the Applet API for Removal

The Applet API was used to write Java applets that ran in web browsers. Applets were phased out years ago, and there is little reason to use the API.

The Applet API was deprecated in Java 9 ([JEP 289](https://openjdk.java.net/jeps/289)), but not yet marked for removal.

## JEP 403: Strongly Encapsulate JDK Internals

JDK 17 further encapsulates internal JDK APIs. Older frameworks, serialization libraries, bytecode tools, or Java agents may use reflection to access internal members and throw `InaccessibleObjectException` after an upgrade. Checking only that application code compiles is not enough.

Before upgrading, use `jdeps --jdk-internals` to help find static dependencies on internal APIs. It cannot detect every reflective access, so also test application startup, core workflows, scheduled jobs, and monitoring agents. If you find incompatibilities, first upgrade the dependency or switch to a supported public API. See [Oracle's JDK 17 migration preparation guide](https://docs.oracle.com/en/java/javase/17/migrate/preparing-migration.html) for details.

**In JDK 17, `--illegal-access=permit` no longer restores the previous relaxed access behavior.** For a dependency that cannot yet be upgraded, use the exception details to selectively open the required package with `--add-opens`. For example, this option allows class-path code to use deep reflection on the `java.lang` package in the `java.base` module:

```bash
--add-opens java.base/java.lang=ALL-UNNAMED
```

This is a compatibility workaround for a specific access issue. It should not be a default startup option for every application, and it does not address all JDK upgrade issues. See [JEP 403](https://openjdk.org/jeps/403) for its limits. If you also plan to switch to ZGC, assess dependency compatibility separately from collector performance; see [ZGC Collector](../jvm/jvm-garbage-collection.md#zgc-collector).

## JEP 406: Pattern Matching for `switch` (Preview)

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

Handling of `null` values was also improved.

```java
// Old code
static void testFooBar(String s) {
    if (s == null) {
        System.out.println("oops!");
        return;
    }
    switch (s) {
        case "Foo", "Bar" -> System.out.println("Great");
        default           -> System.out.println("Ok");
    }
}

// New code
static void testFooBar(String s) {
    switch (s) {
        case null         -> System.out.println("Oops");
        case "Foo", "Bar" -> System.out.println("Great");
        default           -> System.out.println("Ok");
    }
}
```

## JEP 407: Remove RMI Activation

This JEP removed the Remote Method Invocation (RMI) Activation mechanism while retaining the rest of RMI. RMI Activation was obsolete and no longer used.

## JEP 409: Sealed Classes

Sealed classes were proposed in [JEP 360](https://openjdk.java.net/jeps/360) and previewed in Java 15. JDK 16 refined them with stricter checks on permitted subclasses and inheritance, then previewed them again through [JEP 397](https://openjdk.java.net/jeps/397).

For more about sealed classes, see [Java 14 and 15 New Features](./java14-15.md).

## JEP 410: Remove the Experimental AOT and JIT Compiler

Java 9 introduced an experimental Ahead-of-Time (AOT) compiler through [JEP 295](https://openjdk.java.net/jeps/295). It compiled Java classes to native code before the VM started.

Java 17 removed the experimental AOT and JIT compilers because they were rarely used and costly to maintain. It retained the experimental Java-level JVM Compiler Interface (JVMCI), so developers can continue using externally built compilers for JIT compilation.

## JEP 411: Deprecate the Security Manager for Removal

The Security Manager was deprecated with the intent to remove it in a future release.

The Security Manager dates back to Java 1.0. For years, it had not been the main way to protect client-side Java code and was rarely used to protect server-side code. Java 17 deprecated it, paving the way for removal alongside the legacy Applet API ([JEP 398](https://openjdk.java.net/jeps/398)).

## JEP 412: Foreign Function & Memory API (Incubator)

This API lets Java programs interoperate with code and data outside the Java runtime. It can call foreign functions (code outside the JVM) efficiently and access foreign memory (memory not managed by the JVM) safely, allowing Java programs to use native libraries and data without JNI's risks and fragility.

The Foreign Function and Memory API was incubated in Java 17 through [JEP 412](https://openjdk.java.net/jeps/412), incubated again in Java 18 through [JEP 419](https://openjdk.org/jeps/419), and previewed in Java 19 through [JEP 424](https://openjdk.org/jeps/424).

For more about the Foreign Function and Memory API, see [Java 19 New Features](./java19.md).

## JEP 414: Vector API (Second Incubator)

The Vector API was proposed in [JEP 338](https://openjdk.java.net/jeps/338) and added to Java 16 as an [incubator API](http://openjdk.java.net/jeps/11). It was incubated again in Java 17 through [JEP 414](https://openjdk.java.net/jeps/414), Java 18 through [JEP 417](https://openjdk.java.net/jeps/417), and Java 19 through [JEP 426](https://openjdk.java.net/jeps/426).

This incubator API provides an initial way to express vector computations. At runtime, these computations can be compiled to optimal vector instructions for supported CPU architectures, outperforming equivalent scalar computations and taking advantage of Single Instruction, Multiple Data (SIMD) instructions available on most modern CPUs. HotSpot supports auto-vectorization, but the set of scalar operations it can convert is limited and sensitive to code changes. The API makes it easier to write portable, high-performance vector algorithms in Java.

For more about the Vector API, see [Java 18 New Features](./java18.md).

<!-- @include: @article-footer.snippet.md -->
