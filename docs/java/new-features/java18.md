---
title: Java 18 New Features
description: An overview of JDK 18 updates and preview features, including improvements to new APIs.
category: Java
tag:
  - Java New Features
head:
  - - meta
    - name: keywords
      content: Java 18,JDK 18,preview features,API updates,JEP
---

Java 18 was released on March 22, 2022. It was a non-LTS release.

JDK 18 included eight new features. This article covers some of the more notable ones:

- [JEP 400: UTF-8 by Default](https://openjdk.java.net/jeps/400)
- [JEP 408: Simple Web Server](https://openjdk.java.net/jeps/408)
- [JEP 413: Code Snippets in Java API Documentation](https://openjdk.java.net/jeps/413)
- [JEP 416: Reimplement Core Reflection with Method Handles](https://openjdk.java.net/jeps/416)
- [JEP 417: Vector API (Third Incubator)](https://openjdk.java.net/jeps/417)
- [JEP 418: Internet-Address Resolution SPI](https://openjdk.java.net/jeps/418)
- [JEP 419: Foreign Function & Memory API (Second Incubator)](https://openjdk.java.net/jeps/419)

The chart below shows the number of features and release dates for each update from JDK 8 through JDK 25:

![Feature counts and release dates for JDK 8 through JDK 25](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

Related reading:

- [OpenJDK Java 18 Documentation](https://openjdk.java.net/projects/jdk/18/)
- [IntelliJ IDEA: Java 18 Feature Support](https://mp.weixin.qq.com/s/PocFKR9z9u7-YCZHsrA5kQ)

## JEP 400: UTF-8 by Default

JDK 18 made UTF-8 the default charset.

In Java 17 and earlier, the default charset was determined at JVM startup and depended on factors such as the operating system and locale. This could cause problems: for example, a Java program that printed text correctly on a Mac might display garbled text on Windows unless you changed the charset manually.

## JEP 408: Simple Web Server

Starting with Java 18, you can run `jwebserver` to start a simple static web server.

```bash
$ jwebserver
Binding to loopback by default. For all interfaces use "-b 0.0.0.0" or "-b ::".
Serving /cwd and subdirectories on 127.0.0.1 port 8000
URL: http://127.0.0.1:8000/
```

The server supports only static files; it does not support CGI or servlets.

## JEP 413: Code Snippets in Java API Documentation

Before Java 18, you could include a code snippet in Javadoc with `<pre>{@code ...}</pre>`.

```java
<pre>{@code
    lines of source code
}</pre>
```

The result produced by `<pre>{@code ...}</pre>` was fairly limited.

Starting with Java 18, you can use the `@snippet` tag instead.

```java
/**
 * The following code shows how to use {@code Optional.isPresent}:
 * {@snippet :
 * if (v.isPresent()) {
 *     System.out.println("v: " + v.get());
 * }
 * }
 */
```

The `@snippet` tag produces better results and is easier to use.

## JEP 416: Reimplement Core Reflection with Method Handles

Java 18 reimplemented `java.lang.reflect.Method` and `Constructor` using method handles to improve performance. The APIs did not change, so applications can benefit without changes to their reflection code.

OpenJDK published benchmark results comparing the old and new reflection implementations.

![Reflection benchmark results for the old and new implementations](https://oss.javaguide.cn/github/javaguide/java/new-features/JEP416Benchmark.png)

## JEP 417: Vector API (Third Incubator)

The Vector API was proposed in [JEP 338](https://openjdk.java.net/jeps/338) and added to Java 16 as an [incubator API](http://openjdk.java.net/jeps/11). It was incubated again in Java 17 through [JEP 414](https://openjdk.java.net/jeps/414), Java 18 through [JEP 417](https://openjdk.java.net/jeps/417), and Java 19 through [JEP 426](https://openjdk.java.net/jeps/426).

Vector computations consist of a series of operations on vectors. The Vector API expresses these computations so they can be reliably compiled at runtime to optimal vector instructions for supported CPU architectures, outperforming equivalent scalar computations.

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

JDK 18 further improved the Vector API's performance.

## JEP 418: Internet-Address Resolution SPI

Java 18 defined a new service-provider interface (SPI) for host name and address resolution, allowing `java.net.InetAddress` to use third-party resolvers outside the platform.

## JEP 419: Foreign Function & Memory API (Second Incubator)

This API lets Java programs interoperate with code and data outside the Java runtime. It can call foreign functions (code outside the JVM) efficiently and access foreign memory (memory not managed by the JVM) safely, allowing Java programs to use native libraries and data without JNI's risks and fragility.

The Foreign Function and Memory API was incubated in Java 17 through [JEP 412](https://openjdk.java.net/jeps/412), incubated again in Java 18 through [JEP 419](https://openjdk.org/jeps/419), and previewed in Java 19 through [JEP 424](https://openjdk.org/jeps/424).

For more about the Foreign Function and Memory API, see [Java 19 New Features](./java19.md).

<!-- @include: @article-footer.snippet.md -->
