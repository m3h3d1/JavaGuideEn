---
title: "Java Virtual Threads: Common Questions"
description: A guide to Java 21 virtual threads, including their purpose, scheduling, differences from platform threads, use cases, creation APIs, performance limits, Spring Boot integration, and practical considerations.
category: Java
tag:
  - Java Concurrency
head:
  - - meta
    - name: keywords
      content: Java virtual threads,Virtual Threads,Project Loom,Java 21 features,lightweight threads,coroutines,virtual thread internals
---

<!-- @include: @article-header.snippet.md -->

When a web request arrives, the application may query a database, call a remote service, and read or write files. With traditional synchronous code, the request occupies a platform thread even while it is waiting for I/O.

Thread pools reduce the cost of creating threads, but platform thread counts are still limited by operating system threads, memory, and scheduling overhead. As concurrent requests increase, queued work can fill the pool and limit throughput.

Virtual threads address this problem. They let us keep simple, synchronous blocking code without making tasks occupy expensive platform threads while waiting for I/O.

## What Is a Virtual Thread?

A virtual thread is a lightweight thread finalized in Java 21 and an implementation of `java.lang.Thread`. The JDK manages and schedules it; it is not permanently bound to a single operating system thread.

A platform thread is usually a thin wrapper around an operating system thread. It occupies that OS thread for its lifetime. A virtual thread works differently: it runs Java code while mounted on a platform thread. When it reaches a supported blocking operation, the JDK can unmount it and let the platform thread run another virtual thread.

This allows the number of virtual threads to greatly exceed the number of platform threads. The official documentation compares this to virtual memory: an operating system maps many virtual addresses to limited physical memory, while the Java runtime maps many virtual threads to fewer platform threads.

Key points about virtual threads:

- A virtual thread is still a `Thread`. It supports `ThreadLocal`, interruption, stack traces, debugging, and JFR monitoring.
- Virtual threads suit workloads with many blocking tasks, such as HTTP calls, database queries, message queue access, and file or network I/O.
- A virtual thread is not a faster CPU execution unit; it does not make compute-bound code run faster.
- Virtual threads are cheap, so the usual pattern is one virtual thread per task, rather than pooling and reusing them like platform threads.

## How Do Virtual Threads and Platform Threads Relate?

In Java, virtual threads, platform threads, and operating system threads relate roughly as follows:

![How virtual threads, platform threads, and OS threads relate](https://oss.javaguide.cn/github/javaguide/java/new-features/virtual-threads-platform-threads-kernel-threads-relationship.png)

On mainstream operating systems such as Windows and Linux, HotSpot JVM platform threads usually use a one-to-one model: each platform thread maps to an OS thread. Virtual threads add another scheduling layer on top:

- A virtual thread represents the task. In application code, `Thread.currentThread()` returns the virtual thread itself.
- A platform thread is a virtual thread's carrier and executes its Java code.
- The operating system schedules platform threads and does not know about virtual threads.

When a virtual thread starts running, the JDK scheduler mounts it on a platform thread. At a supported blocking point, such as blocking I/O, `BlockingQueue.take()`, or `Future.get()`, it can unmount and free the platform thread to run another virtual thread. When the blocking operation is ready, the virtual thread is resubmitted to the scheduler and mounted on a platform thread to continue.

This mounting and unmounting is transparent to application code. You still write ordinary synchronous code:

```java
String body = httpClient.send(request, BodyHandlers.ofString()).body();
Result result = repository.query(body);
return service.handle(result);
```

If these calls block internally, a virtual thread can suspend itself. A platform thread would continue to occupy its operating system thread while blocked.

## How Are Project Loom and Virtual Threads Related?

Project Loom is an OpenJDK project to improve Java's concurrency model. Virtual threads are one of its main results. They were previewed in JDK 19 and JDK 20, then finalized in JDK 21 through [JEP 444](https://openjdk.org/jeps/444).

Loom did more than add a lightweight thread API. It also led to changes in blocking I/O, debugging, JFR, and thread dumps, making the traditional thread-per-request style scalable again for highly concurrent I/O workloads.

This is one important difference between virtual threads and typical coroutine libraries: virtual threads are part of Java's thread model. Debuggers, profilers, JFR, and thread dumps can work with them as threads instead of seeing application call chains split into callback stages.

## What Problem Do Virtual Threads Solve?

Many server applications fit the thread-per-request model. Its benefits are straightforward: code runs sequentially, exceptions propagate through the call stack, debuggers can step through the code, and thread dumps show where a request is stuck.

The problem is that platform threads are expensive.

Suppose an endpoint takes 50 ms on average and the system needs to serve 2,000 QPS. A rough estimate using Little's Law is that about 100 requests must be in flight at once. If the average request takes 500 ms, the same throughput requires about 1,000 concurrent requests. When each request occupies a platform thread, the thread count can become a bottleneck before CPU, network bandwidth, or database connections do.

Asynchronous and reactive programming can free threads while they wait for I/O, but they also split call chains into callbacks, `CompletableFuture` chains, or reactive pipelines. This can complicate exception handling, debugging, flame graphs, and thread context.

Virtual threads aim to preserve the readability of synchronous code while reducing the platform thread cost of blocking waits. They mainly improve throughput and concurrency capacity, not the speed of an individual request.

## When Are Virtual Threads a Good Fit?

Virtual threads are a good fit for tasks that:

- Run at high concurrency, often in the thousands or more.
- Spend most of their time waiting for I/O, such as database, Redis, HTTP/RPC, message queue, file, or network operations.
- Use a synchronous blocking model that you want to keep instead of converting to complex asynchronous chains.
- Benefit from a traditional call stack for debugging, load testing, and production troubleshooting.

Typical use cases include:

- Spring MVC or Servlet endpoints that call databases and external HTTP services.
- Background jobs that call third-party services in batches.
- Gateways or aggregation services that call several downstream services concurrently.
- Message consumers that perform blocking database writes or remote calls.

Virtual threads do not make CPU-bound tasks faster. If a task mainly computes hashes, compresses images, sorts large arrays, or runs a complex rules engine, throughput usually stops improving once the thread count exceeds the number of CPU cores. For CPU-bound work, focus on algorithms, data structures, batching, parallel streams, dedicated compute pools, or native optimizations.

## How to Create Virtual Threads

JDK 21 provides four common ways to create virtual threads.

### Using `Thread.startVirtualThread()`

Use this to start a simple virtual thread:

```java
public class VirtualThreadDemo {
  public static void main(String[] args) throws InterruptedException {
    Thread thread = Thread.startVirtualThread(() -> {
      System.out.println(Thread.currentThread());
    });

    thread.join();
  }
}
```

Virtual threads are daemon threads. If `main` does not wait for one to finish, the JVM may exit before the task completes.

### Using `Thread.ofVirtual()`

`Thread.ofVirtual()` returns a `Thread.Builder.OfVirtual`. You can set a thread name and choose whether to start the thread immediately or create it without starting it:

```java
public class VirtualThreadDemo {
  public static void main(String[] args) throws InterruptedException {
    Thread unstarted = Thread.ofVirtual()
        .name("order-query")
        .unstarted(() -> System.out.println("query order"));

    unstarted.start();
    unstarted.join();

    Thread started = Thread.ofVirtual()
        .name("payment-query")
        .start(() -> System.out.println("query payment"));

    started.join();
  }
}
```

### Using `ThreadFactory`

Use a `ThreadFactory` to standardize thread names or provide a thread factory to a framework:

```java
import java.util.concurrent.ThreadFactory;

public class VirtualThreadDemo {
  public static void main(String[] args) throws InterruptedException {
    ThreadFactory factory = Thread.ofVirtual()
        .name("worker-", 0)
        .factory();

    Thread thread = factory.newThread(() -> {
      System.out.println(Thread.currentThread().getName());
    });

    thread.start();
    thread.join();
  }
}
```

### Using `Executors.newVirtualThreadPerTaskExecutor()`

This is the most common option in application code. It creates a new virtual thread for each submitted task:

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class VirtualThreadDemo {
  public static void main(String[] args) throws Exception {
    try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
      Future<String> future = executor.submit(() -> {
        return "hello virtual thread";
      });

      System.out.println(future.get());
    }
  }
}
```

This `ExecutorService` is not a traditional thread pool. It does not keep a fixed set of virtual threads for reuse; it creates a new virtual thread for each task. When the `try-with-resources` block ends, `close()` waits for submitted tasks to finish.

## Should You Pool Virtual Threads?

Do not pool virtual threads.

Thread pools mainly reuse expensive platform threads and limit concurrency. Virtual threads are not scarce, so pooling them is usually pointless and works against the one-thread-per-task model.

If your goal is to limit concurrent access to a resource, limit access to that resource rather than limiting the number of virtual threads. For example, if a legacy service can handle at most 20 concurrent requests, use a `Semaphore`:

```java
import java.util.concurrent.Semaphore;

public class OldServiceClient {
  private static final Semaphore LIMIT = new Semaphore(20);

  public String call() throws InterruptedException {
    LIMIT.acquire();
    try {
      return doCall();
    } finally {
      LIMIT.release();
    }
  }

  private String doCall() {
    return "ok";
  }
}
```

If database connections are the bottleneck, adjust the connection pool. If a downstream service is rate-limited, use rate limiting, circuit breaking, and retry backoff. Virtual threads make waiting cheaper, but they do not make database connections, downstream capacity, CPU, or memory unlimited.

## Virtual Threads and Platform Thread Performance

In short, virtual threads are not faster threads. They are inexpensive to create and have a lower cost when blocked. They can improve throughput in I/O-bound services, but do not make an individual database query or HTTP call faster.

The following example simulates 10,000 tasks that block for one second:

```java
import java.time.Duration;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.IntStream;

public class VirtualThreadCompareDemo {
  public static void main(String[] args) {
    long start = System.currentTimeMillis();

    try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
      IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
          Thread.sleep(Duration.ofSeconds(1));
          return i;
        });
      });
    }

    System.out.println("cost: " + (System.currentTimeMillis() - start) + "ms");
  }
}
```

If you replace it with `Executors.newFixedThreadPool(200)`, at most 200 tasks run at a time, so the 10,000 tasks are processed in batches. At roughly one second per batch, the total takes close to 50 seconds. With virtual threads, all 10,000 tasks can enter a waiting state at nearly the same time, freeing platform threads while they wait. The total time is closer to the wait time of one task.

This example only illustrates that virtual threads handle blocking waits well; it is not a rigorous benchmark. Real services are also affected by database and HTTP client connection pools, downstream rate limits, GC, object allocation, lock contention, and container CPU limits.

## How Do Virtual Threads Work Internally?

The execution model has three main parts: scheduling, mounting and unmounting, and stack management.

### Scheduling

The operating system schedules platform threads. The JDK scheduler schedules virtual threads, which then run on platform threads. JEP 444 describes the virtual thread scheduler as a FIFO-mode work-stealing `ForkJoinPool`. It is separate from the common pool used by parallel streams.

By default, scheduler parallelism is related to the number of available processors. You can adjust it with these system properties:

- `jdk.virtualThreadScheduler.parallelism`: The scheduler's target parallelism.
- `jdk.virtualThreadScheduler.maxPoolSize`: The maximum number of platform threads the scheduler can use.

Most applications do not need to change these properties. Checking connection pools, rate limits, locks, and blocking points is usually more useful.

### Mounting and Unmounting

While running Java code, a virtual thread is mounted on a platform thread. At a supported blocking operation, it can save its execution state and unmount, allowing the platform thread to run another virtual thread.

Common JDK blocking operations have been adapted for virtual threads. Network I/O, `BlockingQueue`, and `Future.get()`, for example, usually do not hold the underlying platform thread while a virtual thread is blocked.

Not every blocking operation can unmount. In JDK 21 through JDK 23, a virtual thread that blocks inside a `synchronized` block or method can be pinned to its carrier thread. [JEP 491](https://openjdk.org/jeps/491) in JDK 24 improved this behavior, allowing virtual threads blocked inside `synchronized` to release the underlying platform thread and eliminating most `synchronized`-related pinning. Pinning can still occur when calling native methods or code related to the Foreign Function & Memory API.

### Stack Management

Platform threads usually use fixed-size operating system stacks. Virtual thread stacks are stored as stack chunk objects on the Java heap and can grow or shrink during execution. This is one reason why many virtual threads can be created.

Virtual threads still use memory. Each one is an object with stack chunks, local variables, `ThreadLocal` values, and other overhead. A million virtual threads are not free, but are much more practical than a million platform threads.

## What Is Pinning?

Pinning means that a virtual thread cannot unmount from its carrier thread. While pinned and blocked, it also occupies the underlying OS thread, which can reduce scalability.

In JDK 21 through JDK 23, the most common pinning case is blocking I/O inside a `synchronized` block or method:

```java
public synchronized String load() throws IOException {
  return remoteClient.get("/config"); // In JDK 21-23, blocking here may pin the carrier thread
}
```

Short `synchronized` sections that only access memory are usually fine. Pay attention to slow I/O while holding a lock on a hot path, such as querying a database, calling a remote service, or reading a large file while holding an object lock.

If you use JDK 21 through JDK 23, consider:

- Avoid slow I/O inside `synchronized` blocks.
- Consider `ReentrantLock` for frequently contended blocking locks, and release it in a `try/finally` block.
- Use JFR to monitor `jdk.VirtualThreadPinned` events.
- Temporarily use `-Djdk.tracePinnedThreads=full` to locate pinned call stacks.

With JDK 24 or later, JEP 491 has addressed the main pinning issue caused by `synchronized`. Choose between `synchronized` and `java.util.concurrent.locks` based on code semantics, maintainability, and the locking features you need.

## What Should You Keep in Mind When Using Virtual Threads?

### Do Not Use Virtual Threads to Speed Up CPU-Bound Work

Virtual threads improve concurrency for tasks that spend time waiting. CPU-bound tasks still compete for CPU time, and adding virtual threads cannot overcome the physical limit imposed by the number of CPU cores.

### Do Not Apply Thread Pool Limits to Virtual Threads

Do not create a fixed-size pool of virtual threads. To limit concurrency, use a `Semaphore`, connection pool, rate limiter, or bounded queue to limit access to the resource itself.

### Be Careful About Caching Large Objects in `ThreadLocal`

The Java 21 release supports `ThreadLocal` in virtual threads, which helps with compatibility with existing code and frameworks. However, avoid using `ThreadLocal` to cache large objects in every virtual thread.

With a platform thread pool, a `ThreadLocal<SimpleDateFormat>` might be associated with only dozens or hundreds of platform threads. With one virtual thread per task, the same pattern may create a cached object for every task, increasing memory use and allocation pressure.

Using `ThreadLocal` for request context, user IDs, or trace IDs is usually fine. Reassess its use for caching database connections, large arrays, complex formatters, or client objects. JEP 506 finalized Scoped Values in JDK 25; they are better suited to passing immutable context across many virtual threads.

### Virtual Threads Do Not Eliminate Thread Safety Issues

Virtual threads are cheap to create, so it is easier to run many concurrent tasks. Data races that were hidden by a small thread pool may become more likely after migrating.

Continue to follow basic concurrency rules: protect or isolate shared mutable state, and do not let multiple virtual threads misuse database connections, session objects, or non-thread-safe clients concurrently.

### Watch Connection Pools and Downstream Capacity

After migrating to virtual threads, many services find that their first bottleneck is no longer the application thread pool. It is the database or HTTP connection pool, Redis connection limit, or a downstream rate limit.

This is not a virtual thread problem. Virtual threads simply let more tasks make progress concurrently; shared resources still need capacity limits. During load testing, monitor:

- Application QPS, response time, and error rate.
- Active database connections, connection wait queue, and timeouts.
- HTTP client pool usage and downstream 429/5xx responses.
- CPU, heap, GC, and object allocation rate.
- Virtual thread events and lock contention in JFR.

### Avoid Mixing Too Many Asynchronous Models

Virtual threads work best with synchronous blocking code. A system already built around an end-to-end asynchronous stack such as Reactive, WebFlux, or Netty may not gain much by enabling virtual threads.

Mixing models can make troubleshooting harder. A virtual thread at the outer layer may call into asynchronous callbacks and thread pools, leaving you to reason about virtual threads, event loops, application pools, and connection pools at once. Start by migrating a synchronous blocking path instead of switching the whole system at once.

## How to Migrate from a Traditional Thread Pool to Virtual Threads

For existing synchronous blocking code, you can usually keep calls such as `submit()` and `Future.get()`. During migration, check what other jobs the old thread pool was doing, such as limiting downstream concurrency, bounding queued tasks, or rejecting excess load.

Oracle's [virtual thread migration guide](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html) recommends creating one virtual thread per task and using tools such as `Semaphore` to limit concurrency when accessing a constrained resource.

### Before Migration: Use a Platform Thread Pool for HTTP Calls

Suppose the application shares a thread pool dedicated to calling a downstream service. It uses at most 20 platform threads and queues up to 100 tasks. The example shows only task submission and result retrieval; imports, HTTP client setup, exception handling, and resource cleanup at application shutdown are omitted:

```java
ExecutorService executor = new ThreadPoolExecutor(
    20, 20,
    0L, TimeUnit.MILLISECONDS,
    new ArrayBlockingQueue<>(100),
    Thread.ofPlatform().name("remote-call-", 0).factory(),
    new ThreadPoolExecutor.AbortPolicy());

Future<String> future = executor.submit(() ->
    httpClient.send(request, HttpResponse.BodyHandlers.ofString()).body());

String body = future.get(3, TimeUnit.SECONDS);
```

The 20 threads also limit the number of calls running at once. When all threads are busy, new tasks enter the queue. If the queue is full, `AbortPolicy` throws `RejectedExecutionException`.

If you replace this pool with `Executors.newVirtualThreadPerTaskExecutor()`, the original concurrency and queue limits are gone. The [`Executors` API documentation](<https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Executors.html#newVirtualThreadPerTaskExecutor()>) states that this executor does not limit the number of virtual threads it creates. The application is still constrained by resources such as CPU and memory.

### After Migration: Use One Virtual Thread per Task and Limit Downstream Concurrency Separately

The example uses the Java 21 API, keeps the synchronous HTTP call and `Future`, and uses a `Semaphore` to limit concurrent downstream calls from this application instance. The 20 permits, 200 ms wait, and other timeouts are examples; configure them based on downstream capacity and request duration. The example returns the response body directly; production code should also handle the HTTP status code.

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class RemoteServiceClient implements AutoCloseable {
  private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
  private final Semaphore limit = new Semaphore(20);
  private final HttpClient httpClient = HttpClient.newBuilder()
      .connectTimeout(Duration.ofSeconds(1))
      .build();

  public String fetch(URI uri)
      throws InterruptedException, ExecutionException, TimeoutException {
    Future<String> future = executor.submit(() -> {
      if (!limit.tryAcquire(200, TimeUnit.MILLISECONDS)) {
        throw new RejectedExecutionException("Timed out waiting for a downstream call permit");
      }

      try {
        HttpRequest request = HttpRequest.newBuilder(uri)
            .timeout(Duration.ofSeconds(2))
            .GET()
            .build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString()).body();
      } finally {
        limit.release();
      }
    });

    try {
      return future.get(3, TimeUnit.SECONDS);
    } catch (TimeoutException | InterruptedException e) {
      future.cancel(true);
      throw e;
    }
  }

  @Override
  public void close() {
    executor.close();
    httpClient.close();
  }
}
```

Calls to the same downstream service should share this `RemoteServiceClient` instance, for example as a Spring singleton bean, and call `close()` when the application shuts down. Creating an instance for every request gives each one 20 permits and does not provide a shared concurrency limit. Permits are also independent across application instances.

If the task cannot acquire a permit, its `RejectedExecutionException` is wrapped in an `ExecutionException`. The caller can inspect the cause with `getCause()`. This exception is handled at a different point from the rejection exception thrown during task submission before migration.

This example limits concurrent calls and times out while waiting for a permit, but it does not preserve the old limit of 100 queued tasks. A sudden burst can still create many virtual threads waiting for permits. If the system relied on a bounded queue to protect memory, also limit in-flight requests at the entry point or handle overload with a bounded queue or fast rejection.

### What Else Should You Know About Timeouts and Cancellation?

[`Future.get(3, TimeUnit.SECONDS)`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Future.html) limits how long the caller waits, starting when `get()` is called. The task may still be running after a timeout. In the example, a timeout or caller interruption triggers `future.cancel(true)` to attempt cancellation before rethrowing the exception. These cases also need handling with a platform thread pool.

Here, propagate `InterruptedException`. If you catch it and cannot rethrow it, restore the interrupt flag with `Thread.currentThread().interrupt()` so callers do not lose the interrupt signal.

The timeouts in the example start at different points. The 200 ms timeout covers waiting for a permit; the HTTP client handles the connection and request timeouts; and the three-second timeout limits how long the caller waits for the whole task, which may include both permit waiting and the HTTP call. These periods can overlap, so do not simply add them together. For requests involving several downstream calls, allocate timeouts based on the remaining request deadline.

Distinguish the exceptions as well. A timeout while waiting in `get()` throws `TimeoutException` directly. An `HttpTimeoutException` caused by [`HttpRequest.Builder.timeout()`](<https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/HttpRequest.Builder.html#timeout(java.time.Duration)>) occurs inside the task and reaches the caller wrapped in `ExecutionException`. Catching only `TimeoutException` will not handle an HTTP request timeout.

`cancel(true)` relies on the task responding to interruption and cannot guarantee that it stops immediately. The JDK's default [`HttpClient.send()` implementation](<https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/HttpClient.html#send(java.net.http.HttpRequest,java.net.http.HttpResponse.BodyHandler)>) attempts to cancel the HTTP exchange when interrupted, but the request may already have reached the server and the remote operation may continue. Check timeout and interruption behavior when using JDBC drivers or third-party SDKs. For write operations, also consider idempotency.

Also, [`ExecutorService.close()`](<https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ExecutorService.html#close()>) waits for submitted tasks to finish. If you create an executor in a request-scoped `try-with-resources` block, leaving the block may continue waiting even after `get()` times out. The example reuses the executor as a client member and closes it when the application shuts down. `close()` has no timeout, so services with a shutdown deadline need a separate timed shutdown process.

## How to Enable Virtual Threads in Spring Boot

Spring Boot 3.2 introduced a straightforward setting for virtual threads. With Java 21 or later, enable it in the configuration:

```properties
spring.threads.virtual.enabled=true
```

The Spring Boot documentation also notes a few things:

- After virtual threads are enabled, some properties for configuring traditional thread pool sizes no longer work the same way because virtual thread scheduling uses a JVM-wide platform thread pool.
- Virtual threads are daemon threads. If the application relies on background tasks such as `@Scheduled` to keep the JVM alive, set `spring.main.keep-alive=true`.
- Spring Boot currently recommends Java 24 or later for a better virtual thread experience, mainly because of pinning improvements.

A minimal configuration looks like this:

```yaml
spring:
  threads:
    virtual:
      enabled: true
  main:
    keep-alive: true
```

Enabling virtual threads does not make every endpoint faster. They are more likely to help endpoints with synchronous blocking, substantial I/O waits, and high concurrency. If an endpoint is limited by CPU, lock contention, slow SQL, or downstream rate limits, virtual threads may only expose the bottleneck sooner.

## How to Troubleshoot Virtual Thread Issues

The JDK provides several tools for observing virtual threads.

### Export a Thread Dump with `jcmd`

Traditional `jstack` is not ideal when there are thousands of virtual threads. The JDK provides a thread dump command for this case:

```bash
jcmd <pid> Thread.dump_to_file -format=json thread-dump.json
```

You can also export a text format:

```bash
jcmd <pid> Thread.dump_to_file -format=text thread-dump.txt
```

JSON is more suitable for analysis by tools, especially when there are many virtual threads.

### Monitor Virtual Thread Events with JFR

JFR includes these virtual thread events:

- `jdk.VirtualThreadStart`
- `jdk.VirtualThreadEnd`
- `jdk.VirtualThreadPinned`
- `jdk.VirtualThreadSubmitFailed`

The `jdk.VirtualThreadPinned` event is useful for troubleshooting pinning. JDK 24 addressed most `synchronized`-related pinning, but JFR can still help identify remaining cases, such as native or FFM calls.

### Temporarily Enable Pinning Stack Traces

With JDK 21 through JDK 23, you can temporarily use:

```bash
-Djdk.tracePinnedThreads=full
```

This prints the call stack when a virtual thread blocks while pinned, which can help diagnose issues locally or in a test environment. JEP 491 in JDK 24 improved the main `synchronized`-related pinning cases; use JFR and thread dumps to investigate remaining cases involving native or FFM calls.

## Common Virtual Thread Interview Questions

### How Do Virtual Threads Differ from Platform Threads?

Platform threads usually map one-to-one to operating system threads, so they have higher creation and context-switching costs and are limited in number. The JDK schedules virtual threads and maps many of them to a smaller number of platform threads. While a virtual thread waits for I/O, it can usually unmount from its carrier so the platform thread can run another virtual thread.

### Why Are Virtual Threads Suitable for I/O-Bound Tasks?

I/O-bound tasks spend much of their time waiting for external resources. A waiting platform thread still occupies an operating system thread, while a waiting virtual thread can suspend and release its carrier. This lets the same number of platform threads support more concurrent tasks.

### Are Virtual Threads Suitable for CPU-Bound Tasks?

Do not use them as a CPU speedup tool. CPU-bound tasks need CPU time, and adding threads beyond the number of cores only increases scheduling contention. Virtual threads help with highly concurrent waiting; they do not make an individual computation faster.

### Should Virtual Threads Be Pooled?

No. Virtual threads are inexpensive and should be created per task. To limit concurrency, constrain the resource itself, such as with a database or HTTP connection pool, a `Semaphore`, or a rate limiter.

### Are Virtual Threads the Same as Coroutines?

They are both approaches to lightweight concurrency, but Java virtual threads implement `java.lang.Thread` and fit into Java's existing thread model. Application code does not need `async/await` or manual yielding. Compared with Go goroutines, virtual threads emphasize compatibility with Java's existing thread APIs, debugging tools, and blocking code style. To developers, they are more like much cheaper threads.

### Is Reactive Programming Still Useful with Virtual Threads?

It depends on the use case. Many synchronous blocking server endpoints can use virtual threads to keep code readable while achieving sufficient throughput, without complex callback chains just to free threads. Reactive programming remains useful for stream processing, back pressure, event-driven systems, long-lived connections, and systems that are already asynchronous end to end. Virtual threads are not a silver bullet that replaces every asynchronous model.

### Can You Still Use `synchronized` in JDK 21?

Yes, but be aware of the limitations. In JDK 21 through JDK 23, a virtual thread may be pinned if it blocks inside `synchronized`. Short critical sections that only access memory are usually fine, but avoid slow I/O while holding a `synchronized` lock on a hot path. JEP 491 in JDK 24 largely addressed `synchronized`-related pinning.

## References

- [JEP 444: Virtual Threads](https://openjdk.org/jeps/444)
- [Oracle Java 21 Documentation: Virtual Threads](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html)
- [Java 21 API: Executors](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Executors.html)
- [Java 21 API: Future](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Future.html)
- [Java 21 API: ExecutorService](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ExecutorService.html)
- [Java 21 API: HttpClient](https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/HttpClient.html)
- [Java 21 API: HttpRequest.Builder](https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/HttpRequest.Builder.html)
- [JEP 491: Synchronize Virtual Threads without Pinning](https://openjdk.org/jeps/491)
- [JEP 506: Scoped Values](https://openjdk.org/jeps/506)
- [Spring Boot Reference Documentation: Virtual threads](https://docs.spring.io/spring-boot/reference/features/spring-application.html#features.spring-application.virtual-threads)
- [Spring Blog: Embracing Virtual Threads](https://spring.io/blog/2022/10/11/embracing-virtual-threads/)
- [Inside Java: Managing Throughput with Virtual Threads](https://inside.java/2024/02/04/sip094/)
- [Quarkus Blog: When Quarkus meets Virtual Threads](https://quarkus.io/blog/virtual-thread-1/)

<!-- @include: @article-footer.snippet.md -->
