---
title: "Java Fundamentals: Syntax, OOP, Generics, Reflection, Proxies, and Serialization"
description: A Java fundamentals study and interview guide covering syntax, OOP, keywords, pass-by-value, generics, reflection, proxies, serialization, SPI, Unsafe, and syntactic sugar.
category: Java
tag:
  - Java
  - Java Fundamentals
  - Java Interviews
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: Java fundamentals,Java interview questions,Java keywords,Java pass-by-value,Java generics,Java reflection,Java proxies,Java serialization,Java SPI,Java Unsafe,Java syntactic sugar
---

Java fundamentals provide a foundation for collections, concurrency, the JVM, Spring, and middleware. The goal is not just to memorize syntax, but to understand Java's object model, parameter passing, type erasure, reflection, dynamic proxies, serialization limits, and framework extension mechanisms.

## Who This Guide Is For

- Developers who are starting to study Java systematically and want to connect the core concepts.
- Candidates reviewing Java fundamentals for interviews.
- Java developers who want a deeper understanding of reflection, proxies, generics, SPI, or serialization.
- Engineers preparing to study collections, concurrency, the JVM, or Spring internals.

## Key Topics

- Java syntax, object-oriented programming, exceptions, common classes, keywords, and coding details.
- How pass-by-value, reference variables, object mutability, and method calls relate to one another.
- Generics, wildcards, type erasure, and their effects on collections, API design, and reflection.
- Framework mechanisms such as reflection, dynamic proxies, and SPI.
- Common pitfalls involving serialization, `BigDecimal`, `Unsafe`, and syntactic sugar.

## Suggested Reading Order

1. [Common Java Interview Questions (Part 1)](./java-basic-questions-01.md): Review Java syntax, OOP, and common classes.
2. [Common Java Interview Questions (Part 2)](./java-basic-questions-02.md) and [Part 3](./java-basic-questions-03.md): Cover exceptions, generics, reflection, annotations, and common pitfalls.
3. [Java Keywords](./java-keyword-summary.md) and [Pass-by-Value in Java](./why-there-only-value-passing-in-java.md): Clear up common misconceptions.
4. [Generics and Wildcards](./generics-and-wildcards.md), [Java Reflection](./reflection.md), and [Java Proxies](./proxy.md): Learn mechanisms used by frameworks.
5. [Java Serialization](./serialization.md), [Java SPI](./spi.md), and [Unsafe](./unsafe.md): Explore other mechanisms used in production and when reading source code.

## Core Articles

### Interview Questions

- [Common Java Interview Questions (Part 1)](./java-basic-questions-01.md): Language features, syntax, OOP, common classes, and pitfalls.
- [Common Java Interview Questions (Part 2)](./java-basic-questions-02.md): Exceptions, generics, reflection, and annotations.
- [Common Java Interview Questions (Part 3)](./java-basic-questions-03.md): More detailed and advanced fundamentals.

### Language Features

- [Java Keywords](./java-keyword-summary.md): Understand keywords such as `final`, `static`, `this`, and `super`.
- [Pass-by-Value in Java](./why-there-only-value-passing-in-java.md): Learn why Java uses pass-by-value, including when passing references.
- [Generics and Wildcards](./generics-and-wildcards.md): Learn generic syntax, bounded wildcards, type erasure, and common use cases.
- [Java Syntactic Sugar](./syntactic-sugar.md): See how the compiler handles enhanced for loops, boxing and unboxing, enums, lambdas, and more.

### Framework Mechanisms

- [Java Reflection](./reflection.md): Understand `Class` objects, reflective calls, performance costs, and use cases.
- [Java Proxies](./proxy.md): Learn static proxies, JDK dynamic proxies, and CGLIB proxies.
- [Java SPI](./spi.md): Understand service discovery and plugin-based extension mechanisms.
- [Java Serialization](./serialization.md): Learn the process, `serialVersionUID`, security risks, and alternatives.

### Practical Topics

- [BigDecimal](./bigdecimal.md): Learn about precision, rounding modes, construction, and monetary calculations.
- [Should Java Represent Money with `long` or `BigDecimal`?](./money-long-vs-bigdecimal.md): Compare storage and calculation, including minor units, rounding, overflow, and database fields.
- [Unsafe](./unsafe.md): Explore off-heap memory, CAS, object field offsets, and low-level capabilities used in source code.

## Common Questions

- Does Java use pass-by-value or pass-by-reference? Why can a method change fields on an object passed to it?
- What's the difference between `==` and `equals()`? Why should `hashCode()` be overridden when `equals()` is overridden?
- When should you use `String`, `StringBuilder`, or `StringBuffer`?
- What do `final`, `static`, `this`, and `super` do?
- What is type erasure? How do `List<String>` and `List<Integer>` differ at runtime?
- Why can reflection be slow, and when is it useful?
- How do JDK dynamic proxies differ from CGLIB proxies?
- Why is Java's native serialization usually discouraged?
- Why should `BigDecimal` often be constructed from a string?
- Should money be stored in minor units using `long` or represented with `BigDecimal`?

## Related Guides

- [Java Guide](../)
- [Java Collections](../collection/)
- [Java Concurrency](../concurrent/)
- [JVM](../jvm/)
- [Spring](../../system-design/framework/spring/)

<!-- @include: @article-footer.snippet.md -->
