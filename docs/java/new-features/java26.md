---
title: Java 26 New Features
description: An overview of key features and preview changes in JDK 26, including HTTP/3, garbage collection, AOT caching, and language and platform updates.
category: Java
tag:
  - Java New Features
head:
  - - meta
    - name: keywords
      content: Java 26,JDK 26,HTTP/3,G1 GC,AOT caching,lazy constants,structured concurrency,Vector API,pattern matching
---

JDK 26 was released on March 17, 2026, as a non-LTS release. The previous LTS release was **JDK 25**, and the next is expected to be **JDK 29**.

JDK 26 includes 10 new features. This article covers some of the key ones:

- [JEP 517: HTTP/3 for the HTTP Client API](https://openjdk.org/jeps/517)
- [JEP 522: G1 GC: Improve Throughput by Reducing Synchronization](https://openjdk.org/jeps/522)
- [JEP 516: Ahead-of-Time Object Caching with Any Garbage Collector](https://openjdk.org/jeps/516)
- [JEP 500: Prepare to Make `final` Mean `final`](https://openjdk.org/jeps/500)
- [JEP 526: Lazy Constants (Second Preview)](https://openjdk.org/jeps/526)
- [JEP 525: Structured Concurrency (Sixth Preview)](https://openjdk.org/jeps/525)
- [JEP 530: Primitive Types in Patterns, `instanceof`, and `switch` (Fourth Preview)](https://openjdk.org/jeps/530)
- [JEP 524: PEM Encodings of Cryptographic Objects (Second Preview)](https://openjdk.org/jeps/524)
- [JEP 529: Vector API (Eleventh Incubator)](https://openjdk.org/jeps/529)
- [JEP 504: Remove the Applet API](https://openjdk.org/jeps/504)

The chart below shows the number of features and release dates for each update from JDK 8 through JDK 25:

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 517: HTTP/3 for the HTTP Client API

JDK 26 adds **HTTP/3** support to the `java.net.http.HttpClient` API.

**Benefits of HTTP/3:**

- **Built on QUIC:** HTTP/2 uses TCP, while HTTP/3 uses QUIC (Quick UDP Internet Connections) for reliable transport. QUIC provides security comparable to TLS and can reduce connection and transport latency. It adds features such as encryption and retransmission on top of UDP.
- **Less head-of-line blocking:** HTTP/2 multiplexes requests over one TCP connection, so packet loss can block all requests on that connection. QUIC carries multiple independent streams, so packet loss on one stream does not block the others.
- **Faster connection setup:** HTTP/2 over HTTPS typically requires TCP and TLS handshakes. QUIC uses TLS 1.3 and supports 1-RTT and 0-RTT handshakes, which can reduce connection setup time.
- **Improved mobile experience:** QUIC supports connection migration. Its connection IDs can remain valid when a device changes networks, such as switching from Wi-Fi to mobile data, after path validation.

For more details, see [Common Computer Networking Interview Questions (Part 1)](https://javaguide.cn/cs-basics/network/other-network-questions.html), which covers network layers, common protocols, HTTP, WebSocket, and DNS.

**Usage:**

In JDK 26, `HttpClient` still uses HTTP/2 by default. To use HTTP/3, specify `HTTP_3` on an `HttpClient` or an individual `HttpRequest`:

```java
HttpClient client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_3)
    .build();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://example.com"))
    .build();

// Prefer HTTP/3; fall back to HTTP/2 or HTTP/1.1 if the server does not support it.
HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());

System.out.println(response.body());
```

To explicitly set HTTP/3 as the preferred version, use the `version()` method:

```java
// Prefer HTTP/3 for all requests.
HttpClient client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_3)  // Specify HTTP/3 explicitly.
    .build();

// Set the preferred protocol version for one HttpRequest.
HttpRequest request = HttpRequest.newBuilder(URI.create("https://javaguide.cn/"))
                         .version(HttpClient.Version.HTTP_3)
                         .GET().build();
```

## JEP 522: Improve G1 GC Throughput

**G1 has been the default garbage collector since JDK 9.** It balances latency and throughput, but that balance can affect application performance. Compared with the throughput-oriented Parallel GC, G1 does more work concurrently with the application to reduce pauses. This means application threads and GC threads must share CPU time and coordinate, which can reduce throughput and increase latency.

JEP 522 introduces a **dual card-table** mechanism:

1. **First card table:** Application-thread write barriers can update this table **without synchronization**, making the barrier code simpler and faster.
2. **Second card table:** The optimizer thread processes this initially empty table in the background.

When G1 detects that scanning the first card table might exceed the pause-time goal, it atomically swaps the tables. Application threads continue updating the now-empty table, while the optimizer processes the full table without further synchronization.

**Performance gains:**

- Throughput improves by **5–15%** in applications that **frequently update object reference fields**.
- Throughput can improve by up to **5%** even in applications that rarely update reference fields, because the write barrier is simpler (about 12 instructions instead of 50 on x64).
- GC pause times also decrease slightly.

**Memory overhead:**

The second card table has the same capacity as the first. Each table uses 0.2% of the Java heap size, so a 1 GB heap requires about 2 MB of additional native memory per table.

## JEP 516: AOT Object Caching with Any Garbage Collector

This is an important milestone for **Project Leyden**: ahead-of-time (AOT) object caching can now work with **any garbage collector**.

The AOT class-data sharing introduced in JDK 24 (JEP 483) supported only G1, not other collectors such as ZGC. The cache stored object references as physical memory addresses, but collectors use different memory layouts and object-movement strategies.

JEP 516 replaces **physical memory addresses** with **logical indexes** for stored object references:

- The cache uses a garbage-collector-independent stream format.
- Any garbage collector can load and parse the cache at run time.
- The JVM converts logical indexes to actual memory addresses when loading the cache.

**Benefits:**

- **Faster startup:** AOT caching can significantly reduce Java application cold-start time.
- **ZGC support:** Low-latency ZGC can also benefit from faster startup.
- **Useful for cloud-native workloads:** This is valuable for startup-sensitive services such as microservices and serverless functions.

## JEP 500: Prepare to Make `final` Mean `final`

This feature advances Java's integrity-by-default principle and prepares to make `final` fields truly immutable.

Since JDK 5, reflection has allowed some `final` fields to be modified through **deep reflection**, partly to support serialization:

```java
import java.lang.reflect.Field;

class Example {
    private final String name;

    Example(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}

// Modify a final field through reflection.
Example example = new Example("Original");
Field field = Example.class.getDeclaredField("name");
field.setAccessible(true);
field.set(example, "Modified");  // Succeeds by default in JDK 26, with a warning.
System.out.println(example.getName());  // Prints "Modified".
```

Although frameworks such as serialization libraries, dependency-injection frameworks, and test tools use this capability, it weakens the immutability guarantee of `final` and limits compiler optimizations.

In JDK 26, the JVM **warns** when deep reflection modifies a `final` field. This prepares for such modifications to be disallowed by default in a future release.

For cases that still require modifying `final` fields, JDK 26 provides an explicit opt-in so developers can continue during the transition to stricter defaults.

## JEP 526: Lazy Constants (Second Preview)

This feature was first previewed in JDK 25 as [JEP 502: Stable Values (Preview)](https://openjdk.org/jeps/502). In JDK 26, JEP 526 renames the API to Lazy Constants and previews it for a second time.

Traditional `static final` fields are usually initialized when the class is initialized. This can:

- Increase startup time.
- Waste memory if the constant is never used.
- Require complex lazy-initialization patterns, such as double-checked locking or the holder class idiom.

JEP 526 introduces `LazyConstant<T>`, an object that holds immutable data. The JVM treats it as a true constant to provide performance similar to a `final` field.

```java
// Traditional approach: initialize when the class is initialized.
static final ExpensiveObject TRADITIONAL = new ExpensiveObject();

// New approach: initialize on first access.
static final LazyConstant<ExpensiveObject> LAZY =
    LazyConstant.of(() -> new ExpensiveObject());

// Use the constant.
ExpensiveObject obj = LAZY.get();  // Initialized on first access.
```

**Benefits:**

- **On-demand initialization:** Initialize only on first access to improve startup performance.
- **Thread safety:** Built-in thread safety without manual synchronization.
- **JVM optimizations:** The JVM can optimize lazy constants like `final` fields.
- **Simpler code:** Avoid complex lazy-initialization patterns such as double-checked locking.

## JEP 525: Structured Concurrency (Sixth Preview)

Structured concurrency was introduced as an incubating API in JDK 19. In JDK 26, it is in its sixth preview. It aims to simplify multithreaded programming, not replace `java.util.concurrent`.

Structured concurrency treats multiple tasks running in different threads as a single unit of work. This simplifies error handling, improves reliability and observability, and preserves the readability and maintainability of single-threaded code.

The core API, `StructuredTaskScope`, splits a task into concurrent subtasks that run in their own threads. The subtasks must finish before the parent task continues, or be cancelled if the parent fails.

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

**Changes in Java 26:**

- **Improved Joiner:** The `Joiner` interface adds `onTimeout()` to return a specific result when a timeout occurs.
- **Updated return type:** `allSuccessfulOrThrow()` now returns a list of results (`List`) instead of a stream of subtasks.
- **Simplified API:** `anySuccessfulResultOrThrow()` is renamed to `anySuccessfulOrThrow()`.

## JEP 530: Primitive Types in Patterns, `instanceof`, and `switch` (Fourth Preview)

This feature was first previewed in JDK 23 through [JEP 455](https://openjdk.org/jeps/455 "JEP 455").

Pattern matching can handle all primitive types (`int`, `double`, `boolean`, and others) in `switch` and `instanceof` statements.

```java
static void test(Object obj) {
    if (obj instanceof int i) {
        System.out.println("This is an int: " + i);
    }
}
```

JDK 26 further enhances this feature:

- Removes several restrictions related to primitive types, making pattern matching, `instanceof`, and `switch` more consistent and expressive.
- Refines the definition of unconditional exactness.
- Applies stricter dominance checks in `switch` constructs so the compiler can detect more coding errors.

This enables safer and simpler matching and conversion for primitive types, much like for reference types, while reducing Java boilerplate.

## JEP 524: PEM Encodings of Cryptographic Objects (Second Preview)

This feature was first previewed in JDK 25 through [JEP 518](https://openjdk.org/jeps/518).

PEM (Privacy-Enhanced Mail) is a widely used text format for storing and transmitting cryptographic objects such as certificates, private keys, and public keys. JEP 524 provides an API to encode cryptographic objects as PEM and decode them from PEM.

```java
// Encode the key as PEM.
KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
kpg.initialize(2048);
KeyPair keyPair = kpg.generateKeyPair();

// Encode as PEM.
String pemEncoded = PEMEncoder.of().encodeToString(keyPair.getPrivate());

// Decode from PEM.
PrivateKey decodedKey = PEMDecoder.of().decode(pemEncoded, PrivateKey.class);
```

This API reduces the risk of errors, simplifies compliance, and improves the portability and interoperability of secure Java applications by making cryptographic setup and integration easier across enterprise, cloud, and regulated environments.

## JEP 529: Vector API (Eleventh Incubator)

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

Although it is still incubating, its eleventh iteration shows its importance. It helps Java remain competitive in performance-sensitive areas such as scientific computing, machine learning, AI inference, and big data processing.

## JEP 504: Remove the Applet API

The Applet API was deprecated in JDK 9 and marked for removal in JDK 17. JDK 26 **removes it**.

This means:

- The `java.applet.Applet` class and related classes are removed.
- The JDK installation and source code are smaller.
- Applications can benefit from improved performance, stability, and security.

Applet technology is obsolete, and modern web development has moved to other platforms. Removing this legacy API is part of modernizing the Java platform.

## Summary

Although JDK 26 is a non-LTS release, it includes several notable features:

| Category        | Features                                                                  |
| --------------- | ------------------------------------------------------------------------- |
| **Networking**  | HTTP/3 support                                                            |
| **Performance** | Improved G1 GC throughput, AOT caching with any garbage collector         |
| **Language**    | Primitive type patterns (fourth preview), lazy constants (second preview) |
| **Concurrency** | Structured concurrency (sixth preview), Vector API (eleventh incubator)   |
| **Security**    | Prepare to make `final` mean `final`, PEM encoding support                |
| **Cleanup**     | Remove the Applet API                                                     |

Oracle will provide updates through September 2026, when Oracle JDK 27 is expected to replace it.
