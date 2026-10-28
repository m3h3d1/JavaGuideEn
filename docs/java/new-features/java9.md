---
title: Java 9 New Features
description: An overview of the Java 9 module system, jlink, and other changes to run-time images and libraries.
category: Java
tag:
  - Java New Features
head:
  - - meta
    - name: keywords
      content: Java 9,JDK 9,modules,JPMS,jlink,collection factory methods,new APIs
---

**Java 9** was released on September 21, 2017, three and a half years after Java 8. It introduced many significant changes, most notably the Java Platform Module System, along with updates to collections, `Stream`, and more.

JDK 9 is not an LTS release. Oracle's listed LTS releases are JDK 8, 11, 17, 21, and 25.

This article covers some of the key features:

- [JEP 222: Java Shell Tool (JShell)](https://openjdk.org/jeps/222)
- [JEP 261: Module System](https://openjdk.org/jeps/261)
- [JEP 248: G1 Becomes the Default Garbage Collector](https://openjdk.org/jeps/248)
- [JEP 254: Compact Strings](https://openjdk.org/jeps/254)
- [JEP 193: Variable Handles](https://openjdk.org/jeps/193)

The chart below shows the number of features and release dates for each update from JDK 8 through JDK 25:

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 222: Java Shell Tool (JShell)

JShell is a command-line tool introduced in Java 9. It provides an interactive shell for Java, similar to the Python REPL.

You can enter expressions directly in JShell and see their results immediately.

![](https://oss.javaguide.cn/java-guide-blog/image-20210816083417616.png)

**What are the benefits of JShell?**

1. It makes it easier to print your first Java "Hello, World!" and can help beginners get started.
2. It is often faster than an IDE for small experiments and quick checks. It complements an IDE, which is better suited to testing more complex logic.
3. ……

**How does JShell differ from regular Java source code?**

1. Once you enter a statement, JShell compiles and runs it in the background, then returns the result without requiring you to run `javac` or `java`.
2. You can redeclare variables; a later declaration replaces the earlier one.
3. You can enter standalone expressions such as `1 + 1`.
4. ……

## JEP 261: Module System

The module system is part of [Project Jigsaw](https://openjdk.java.net/projects/jigsaw/), which brought modular development to the Java platform and improved code reuse.

**What is the module system?** The official definition is:

> A uniquely named, reusable group of related packages, as well as resources (such as images and XML files) and a module descriptor。

In simple terms, a module is a uniquely named, reusable group of packages and resources, described by a module descriptor (`module-info.java`).

Any JAR file can become a module by adding a module descriptor (`module-info.java`).

![](https://oss.javaguide.cn/java-guide-blog/module-structure.png)

With the module system, the JDK was reorganized into 94 modules. Java applications can use the **[jlink tool](http://openjdk.java.net/jeps/282)**, introduced with Java 9, to create custom run-time images containing only the JDK modules they need. This can significantly reduce the size of the Java runtime environment.

Use the `exports` keyword to control which packages are accessible and which modules can access them.

```java
module my.module {
    // Export all public members in the specified package.
    exports com.my.package.name;
}

module my.module {
    // Export the package only to the specified module.
    exports com.my.package.name to com.specific.module;
}
```

For more about Java 9 modules, see:

- [《Project Jigsaw: Module System Quick-Start Guide》](https://openjdk.java.net/projects/jigsaw/quick-start)
- [《Java 9 Modules: part 1》](https://stacktraceguru.com/java9/module-introduction)
- [Java 9 Explained (2. The Module System)](http://www.cnblogs.com/IcanFixIt/p/6947763.html)

## JEP 248: G1 Becomes the Default Garbage Collector

In Java 8, the default garbage collectors were Parallel Scavenge for the young generation and Parallel Old for the old generation. In Java 9, CMS was deprecated and **G1 (Garbage-First Garbage Collector)** became the default collector.

G1 was introduced in Java 7 and became the default after performing well across two releases.

## JEP 193: Variable Handles

A variable handle is a reference to one or more variables, such as static or instance fields, array elements, and components of off-heap data structures.

Variable handles are similar to the existing method handles (`MethodHandle`). They are represented by `java.lang.invoke.VarHandle` and can be created using lookup methods on a `java.lang.invoke.MethodHandles.Lookup` instance.

`VarHandle` replaces some operations from `java.util.concurrent.atomic` and `sun.misc.Unsafe`. It also provides standard memory fence operations for finer control over memory ordering, with improved safety, usability, and performance compared with older APIs.

## API Updates

Not every API change is delivered through a JEP (Java Enhancement Proposal).

In the JDK development process, **JEPs** are usually used for major changes, such as new language features, JVM mechanisms, or large library refactorings. Adding factory methods such as `List.of()` is usually routine library maintenance. JDK developers submit and review these changes through **JBS (JDK Bug System)** tickets, and they ship with the release.

### Collection Updates

Factory methods such as `List.of()`, `Set.of()`, `Map.of()`, and `Map.ofEntries()` create immutable collections, similar to those in Guava:

```java
List.of("Java", "C++");
Set.of("Java", "C++");
Map.of("Java", 1, "C++", 2);
```

Collections created with `of()` are immutable. Attempts to add, remove, replace, or sort elements throw `java.lang.UnsupportedOperationException`.

### Stream Updates

`Stream` adds `ofNullable()`, `dropWhile()`, `takeWhile()`, and an overloaded `iterate()` method.

In Java 9, `ofNullable()` creates a one-element or empty `Stream` from a value that may be `null`. Java 8 already had `Stream.empty()`, but no convenient way to turn a nullable value directly into a stream.

```java
Stream<String> stringStream = Stream.ofNullable("Java");
System.out.println(stringStream.count());// 1
Stream<String> nullStream = Stream.ofNullable(null);
System.out.println(nullStream.count());//0
```

`takeWhile()` takes elements from a `Stream` in order until one fails the predicate.

```java
List<Integer> integerList = List.of(11, 33, 66, 8, 9, 13);
integerList.stream().takeWhile(x -> x < 50).forEach(System.out::println);// 11 33
```

`dropWhile()` does the opposite of `takeWhile()`.

```java
List<Integer> integerList2 = List.of(11, 33, 66, 8, 9, 13);
integerList2.stream().dropWhile(x -> x < 50).forEach(System.out::println);// 66 8 9 13
```

The new `iterate()` overload takes a `Predicate` that determines when iteration should stop.

```java
public static<T> Stream<T> iterate(final T seed, final UnaryOperator<T> f) {
}
// New overload.
public static<T> Stream<T> iterate(T seed, Predicate<? super T> hasNext, UnaryOperator<T> next) {

}
```

Here is a comparison. The new `iterate()` overload is more flexible:

```java
// Print numbers 1 through 10 with the original iterate() method.
Stream.iterate(1, i -> i + 1).limit(10).forEach(System.out::println);
// Print numbers 1 through 10 with the new iterate() overload.
Stream.iterate(1, i -> i <= 10, i -> i + 1).forEach(System.out::println);
```

### Optional Updates

The `Optional` class adds methods such as `ifPresentOrElse()`, `or()`, and `stream()`.

`ifPresentOrElse()` takes a `Consumer` and a `Runnable`. It calls the `Consumer` when the `Optional` is present, and the `Runnable` when it is empty.

```java
public void ifPresentOrElse(Consumer<? super T> action, Runnable emptyAction)

Optional<Object> objectOptional = Optional.empty();
objectOptional.ifPresentOrElse(System.out::println, () -> System.out.println("Empty!!!"));// Empty!!!
```

`or()` takes a `Supplier` and returns the `Optional` it provides if the current `Optional` is empty.

```java
public Optional<T> or(Supplier<? extends Optional<? extends T>> supplier)

Optional<Object> objectOptional = Optional.empty();
objectOptional.or(() -> Optional.of("java")).ifPresent(System.out::println);//java
```

### String Updates

Through Java 8, `String` stored its contents in a `char[]`. Starting in Java 9, it uses a `byte[]`, which can save space.

```java
public final class String implements java.io.Serializable,Comparable<String>, CharSequence {
    // @Stable indicates that this variable is assigned at most once.
    @Stable
    private final byte[] value;
}
```

### Interface Updates

Java 9 allows private methods in interfaces, giving them more flexibility and some of the capabilities of abstract classes.

```java
public interface MyInterface {
    private void methodPrivate(){
    }
}
```

### I/O Updates

Before Java 9, resources had to be declared inside the `try-with-resources` statement:

```java
try (Scanner scanner = new Scanner(new File("testRead.txt"));
    PrintWriter writer = new PrintWriter(new File("testWrite.txt"))) {
    // omitted
}
```

Since Java 9, effectively final variables can be used in a `try-with-resources` statement.

```java
final Scanner scanner = new Scanner(new File("testRead.txt"));
PrintWriter writer = new PrintWriter(new File("testWrite.txt"));
try (scanner; writer) {
    // omitted
}
```

**What is an effectively final variable?** It is a variable that is not declared `final` but is never reassigned after initialization.

As the example shows, `writer` is not explicitly declared `final`, but it is never reassigned after initialization, so it is effectively final.

### Process API

Java 9 adds the `java.lang.ProcessHandle` interface for managing native processes, especially long-running ones.

```java
// Get the process for the current JVM.
ProcessHandle currentProcess = ProcessHandle.current();
// Print the process ID.
System.out.println(currentProcess.pid());
// Print information about the process.
System.out.println(currentProcess.info());
```

Overview of the `ProcessHandle` interface:

![](https://oss.javaguide.cn/java-guide-blog/image-20210816104614414.png)

### Other API Updates

**Reactive Streams**

Java 9 adds the core Reactive Streams interfaces in `java.util.concurrent.Flow`.

`Flow` contains four core interfaces: `Flow.Publisher`, `Flow.Subscriber`, `Flow.Subscription`, and `Flow.Processor`. Java 9 also provides `SubmissionPublisher`, an implementation of `Flow.Publisher`.

For a detailed explanation of Reactive Streams in Java 9, see [Java 9 Explained (17. Reactive Streams) by Lin Bento](https://www.cnblogs.com/IcanFixIt/p/7245377.html).

## Other Changes

- **Platform Logging API:** Java 9 lets the JDK and applications use the same logging implementation. `System.LoggerFinder` manages the logging implementation used by the JDK. The JVM has one system-wide `LoggerFinder` instance at run time. Providing a custom implementation lets both the JDK and applications use frameworks such as SLF4J.
- **`CompletableFuture` updates:** Adds methods such as `completeAsync()` and `orTimeout()`.
- **Nashorn updates:** Java 9 adds some ES6 features to the Nashorn JavaScript engine, which was introduced in Java 8 and deprecated in Java 11.
- **I/O stream updates:** Adds methods for reading and copying data from an `InputStream`.
- **Security updates:** Adds four SHA-3 hash algorithms: SHA3-224, SHA3-256, SHA3-384, and SHA3-512.
- **Method handle updates:** Adds static methods to `java.lang.invoke.MethodHandles` for creating different types of method handles. Method handles were introduced in Java 7.
- ……

## References

- Java version history：<https://en.wikipedia.org/wiki/Java_version_history>
- Release Notes for JDK 9 and JDK 9 Update Releases : <https://www.oracle.com/java/technologies/javase/9-all-relnotes.html>
- _A Deep Dive into Java Features_, Geek Time: “JShell: How to Quickly Verify Small Questions?”
- New Features in Java 9: <https://www.baeldung.com/new-java-9>
- Java – Try with Resources：<https://www.baeldung.com/java-try-with-resources>

<!-- @include: @article-footer.snippet.md -->
