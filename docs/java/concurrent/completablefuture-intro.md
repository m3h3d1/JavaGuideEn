---
title: CompletableFuture Explained
description: A practical guide to CompletableFuture, covering its core APIs, asynchronous composition, thenCompose and thenCombine, allOf and anyOf, executor configuration, and best practices.
category: Java
tag:
  - Java Concurrency
head:
  - - meta
    - name: keywords
      content: CompletableFuture,asynchronous programming,async composition,Future,thenCompose,thenCombine,allOf,parallel tasks
---

In real applications, an endpoint often needs to fetch several kinds of data and combine them into one response. For example, an order request may need user details, product information, shipping status, and recommendations.

Running these tasks serially can make the endpoint slow. Since many tasks have **no ordering dependency**, they can run **in parallel**. For example, the product and shipping calls can run at the same time, reducing response time.

![](https://oss.javaguide.cn/github/javaguide/high-performance/serial-to-parallel.png)

Tasks with dependencies can be composed into an execution flow.

![](https://oss.javaguide.cn/github/javaguide/high-performance/serial-to-parallel2.png)

1. Fetch user information before calling the product and shipping APIs.
2. Fetch recommendations after the product and shipping information has been retrieved.

Here are a few cases where asynchronous task composition may help. These are examples; data may be returned in separate responses or APIs:

1. **Home page:** A developer community may need recommended articles, ads, rankings, and trending topics.
2. **Detail page:** An article page may need the author's profile, article content, and comments.
3. **Analytics:** An admin dashboard may need follower totals and article metrics such as views, comments, and bookmarks.

In Java, `CompletableFuture`, introduced in Java 8, helps compose multiple tasks.

This article introduces `CompletableFuture` and its commonly used APIs.

## Introduction to `Future`

The `Future` interface is a common way to represent asynchronous work. It is useful for long-running tasks because the program does not have to wait idly for them to finish. A task can run on another thread while the current thread does other work, then the result can be retrieved from the `Future` later.

This is the classic **Future pattern** in multithreaded programming. It is a design pattern based on asynchronous calls and is not specific to Java.

In Java, `Future` is a generic interface in `java.util.concurrent`. Its five core methods provide four kinds of functionality. Starting with JDK 19, it also has three default query methods: `resultNow()`, `exceptionNow()`, and `state()`.

- Cancel a task.
- Check whether a task was cancelled.
- Check whether a task has completed.
- Retrieve the task result.

```java
// V is the result type of the task represented by Future.
public interface Future<V> {
    // Attempts to cancel the task; returns true on success.
    boolean cancel(boolean mayInterruptIfRunning);
    // Checks whether the task was cancelled.
    boolean isCancelled();
    // Checks whether the task has completed.
    boolean isDone();
    // Gets the task result.
    V get() throws InterruptedException, ExecutionException;
    // Gets the result or throws TimeoutException if it is not ready in time.
    V get(long timeout, TimeUnit unit)
        throws InterruptedException, ExecutionException, TimeoutException;
}
```

In short, submit a task represented by a `Future`, then do other work while it runs. You can also cancel it or check its status, and retrieve the result later.

## Introduction to `CompletableFuture`

`Future` has some limitations: it does not support composing asynchronous tasks, and its `get()` method blocks while waiting for a result.

Java 8 introduced `CompletableFuture` to address these limitations. It provides the `Future` features in a more flexible form, along with functional programming and asynchronous composition for chaining tasks together.

Here is the `CompletableFuture` class definition:

```java
public class CompletableFuture<T> implements Future<T>, CompletionStage<T> {
}
```

`CompletableFuture` implements both `Future` and `CompletionStage`.

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/completablefuture-class-diagram.jpg)

In addition to `Future` capabilities, `CompletableFuture` supports functional programming.

![](https://oss.javaguide.cn/javaguide/image-20210902092441434.png)

The `Future` interface has five methods:

- `boolean cancel(boolean mayInterruptIfRunning)`: Attempts to cancel the task.
- `boolean isCancelled()`: Checks whether the task was cancelled.
- `boolean isDone()`: Checks whether the task has completed.
- `get()`: Waits for the task to complete and returns its result.
- `get(long timeout, TimeUnit unit)`: Waits for a limited time.

`CompletionStage` represents a stage of an asynchronous computation. A computation can have multiple stages, which can be combined into an asynchronous pipeline.

`CompletionStage` defines many methods and provides much of `CompletableFuture`'s functional API. Its method parameters make extensive use of the functional interfaces introduced in Java 8.

![](https://oss.javaguide.cn/javaguide/image-20210902093026059.png)

There are too many methods to cover individually, so the following sections focus on the most common ones.

## Common `CompletableFuture` Operations

### Creating a `CompletableFuture`

Common ways to create a `CompletableFuture` include:

1. Use the `new` keyword.
2. Use the static factory methods `runAsync()` or `supplyAsync()`.

#### The `new` Keyword

Creating a `CompletableFuture` with `new` is similar to using it as a plain `Future`.

This is how `CompletableFuture` objects are created in my open-source project, [guide-rpc-framework](https://github.com/Snailclimb/guide-rpc-framework).

Here is a simple example.

This creates a `CompletableFuture` whose result type is `RpcResponse<Object>`. Think of `resultFuture` as a container for the asynchronous result.

```java
CompletableFuture<RpcResponse<Object>> resultFuture = new CompletableFuture<>();
```

When the result becomes available, call `complete()` with it to mark `resultFuture` as completed.

```java
// Only the first call to complete() takes effect; later calls are ignored.
resultFuture.complete(rpcResponse);
```

Use `isDone()` to check whether it has completed.

```java
public boolean isDone() {
    return result != null;
}
```

To retrieve the asynchronous result, call `get()`. The calling thread blocks until the `CompletableFuture` completes.

```java
rpcResponse = completableFuture.get();
```

If the result is already known, use the static `completedFuture()` method:

```java
CompletableFuture<String> future = CompletableFuture.completedFuture("hello!");
assertEquals("hello!", future.get());
```

`completedFuture()` internally calls a `CompletableFuture` constructor that accepts a value; that constructor is not public.

```java
public static <U> CompletableFuture<U> completedFuture(U value) {
    return new CompletableFuture<U>((value == null) ? NIL : value);
}
```

#### Static Factory Methods

These methods let you wrap a computation:

```java
static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier);
// Use a custom executor (recommended).
static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier, Executor executor);
static CompletableFuture<Void> runAsync(Runnable runnable);
// Use a custom executor (recommended).
static CompletableFuture<Void> runAsync(Runnable runnable, Executor executor);
```

`runAsync()` accepts a `Runnable`, a functional interface with no return value. Use it for asynchronous work when you do not need a result.

```java
@FunctionalInterface
public interface Runnable {
    public abstract void run();
}
```

`supplyAsync()` accepts a `Supplier<U>`, another functional interface. `U` is the result type.

```java
@FunctionalInterface
public interface Supplier<T> {

    /**
     * Gets a result.
     *
     * @return a result
     */
    T get();
}
```

Use `supplyAsync()` when the asynchronous operation returns a result.

```java
CompletableFuture<Void> future = CompletableFuture.runAsync(() -> System.out.println("hello!"));
future.get(); // Prints "hello!"
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> "hello!");
assertEquals("hello!", future2.get());
```

### Processing Asynchronous Results

After an asynchronous computation completes, its result can be processed further. Common methods include:

- `thenApply()`
- `thenAccept()`
- `thenRun()`
- `whenComplete()`

`thenApply()` accepts a `Function` that processes the result.

```java
// Non-async callback: may run on the thread that completed the previous stage,
// or on the calling thread if that stage has already completed.
public <U> CompletableFuture<U> thenApply(
    Function<? super T,? extends U> fn) {
    return uniApplyStage(null, fn);
}

// Uses the default ForkJoinPool (not recommended).
public <U> CompletableFuture<U> thenApplyAsync(
    Function<? super T,? extends U> fn) {
    return uniApplyStage(defaultExecutor(), fn);
}
// Uses a custom executor (recommended).
public <U> CompletableFuture<U> thenApplyAsync(
    Function<? super T,? extends U> fn, Executor executor) {
    return uniApplyStage(screenExecutor(executor), fn);
}
```

Here is an example of `thenApply()`:

```java
CompletableFuture<String> future = CompletableFuture.completedFuture("hello!")
        .thenApply(s -> s + "world!");
assertEquals("hello!world!", future.get());
// This call is ignored.
future.thenApply(s -> s + "nice!");
assertEquals("hello!world!", future.get());
```

You can also **chain calls**:

```java
CompletableFuture<String> future = CompletableFuture.completedFuture("hello!")
        .thenApply(s -> s + "world!").thenApply(s -> s + "nice!");
assertEquals("hello!world!nice!", future.get());
```

**If the callback does not need to return a result, use `thenAccept()` or `thenRun()`. The difference is that `thenRun()` cannot access the asynchronous result.**

`thenAccept()` accepts a `Consumer<? super T>`.

```java
public CompletableFuture<Void> thenAccept(Consumer<? super T> action) {
    return uniAcceptStage(null, action);
}

public CompletableFuture<Void> thenAcceptAsync(Consumer<? super T> action) {
    return uniAcceptStage(defaultExecutor(), action);
}

public CompletableFuture<Void> thenAcceptAsync(Consumer<? super T> action,
                                               Executor executor) {
    return uniAcceptStage(screenExecutor(executor), action);
}
```

As its name suggests, `Consumer` accepts one input value and consumes it without returning a result.

```java
@FunctionalInterface
public interface Consumer<T> {

    void accept(T t);

    default Consumer<T> andThen(Consumer<? super T> after) {
        Objects.requireNonNull(after);
        return (T t) -> { accept(t); after.accept(t); };
    }
}
```

`thenRun()` accepts a `Runnable`.

```java
public CompletableFuture<Void> thenRun(Runnable action) {
    return uniRunStage(null, action);
}

public CompletableFuture<Void> thenRunAsync(Runnable action) {
    return uniRunStage(defaultExecutor(), action);
}

public CompletableFuture<Void> thenRunAsync(Runnable action,
                                            Executor executor) {
    return uniRunStage(screenExecutor(executor), action);
}
```

Here are examples of `thenAccept()` and `thenRun()`:

```java
CompletableFuture.completedFuture("hello!")
        .thenApply(s -> s + "world!").thenApply(s -> s + "nice!").thenAccept(System.out::println);//hello!world!nice!

CompletableFuture.completedFuture("hello!")
        .thenApply(s -> s + "world!").thenApply(s -> s + "nice!").thenRun(() -> System.out.println("hello!"));//hello!
```

`whenComplete()` accepts a `BiConsumer<? super T, ? super Throwable>`.

```java
public CompletableFuture<T> whenComplete(
    BiConsumer<? super T, ? super Throwable> action) {
    return uniWhenCompleteStage(null, action);
}


public CompletableFuture<T> whenCompleteAsync(
    BiConsumer<? super T, ? super Throwable> action) {
    return uniWhenCompleteStage(defaultExecutor(), action);
}
// Uses a custom executor (recommended).
public CompletableFuture<T> whenCompleteAsync(
    BiConsumer<? super T, ? super Throwable> action, Executor executor) {
    return uniWhenCompleteStage(screenExecutor(executor), action);
}
```

Unlike `Consumer`, `BiConsumer` accepts two input values and consumes them without returning a result.

```java
@FunctionalInterface
public interface BiConsumer<T, U> {
    void accept(T t, U u);

    default BiConsumer<T, U> andThen(BiConsumer<? super T, ? super U> after) {
        Objects.requireNonNull(after);

        return (l, r) -> {
            accept(l, r);
            after.accept(l, r);
        };
    }
}
```

Here is an example of `whenComplete()`:

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> "hello!")
        .whenComplete((res, ex) -> {
            // res is the result.
            // ex is a Throwable representing an exception.
            System.out.println(res);
            // No exception was thrown, so ex is null.
            assertNull(ex);
        });
assertEquals("hello!", future.get());
```

### Exception Handling

Use `handle()` to process either a task result or an exception.

```java
public <U> CompletableFuture<U> handle(
    BiFunction<? super T, Throwable, ? extends U> fn) {
    return uniHandleStage(null, fn);
}

public <U> CompletableFuture<U> handleAsync(
    BiFunction<? super T, Throwable, ? extends U> fn) {
    return uniHandleStage(defaultExecutor(), fn);
}

public <U> CompletableFuture<U> handleAsync(
    BiFunction<? super T, Throwable, ? extends U> fn, Executor executor) {
    return uniHandleStage(screenExecutor(executor), fn);
}
```

For example:

```java
CompletableFuture<String> future
        = CompletableFuture.supplyAsync(() -> {
    if (true) {
        throw new RuntimeException("Computation error!");
    }
    return "hello!";
}).handle((res, ex) -> {
    // res is the result.
    // ex is a Throwable representing an exception.
    return res != null ? res : "world!";
});
assertEquals("world!", future.get());
```

You can also handle exceptions with `exceptionally()`.

```java
CompletableFuture<String> future
        = CompletableFuture.supplyAsync(() -> {
    if (true) {
        throw new RuntimeException("Computation error!");
    }
    return "hello!";
}).exceptionally(ex -> {
    System.out.println(ex.toString());// CompletionException
    return "world!";
});
assertEquals("world!", future.get());
```

To complete a `CompletableFuture` exceptionally, call `completeExceptionally()` with the exception.

```java
CompletableFuture<String> completableFuture = new CompletableFuture<>();
// ...
completableFuture.completeExceptionally(
  new RuntimeException("Calculation failed!"));
// ...
completableFuture.get(); // ExecutionException
```

### Composing `CompletableFuture` Instances

Use `thenCompose()` to chain two `CompletableFuture` instances when the second task depends on the first task's result. It passes that result to the next task.

```java
public <U> CompletableFuture<U> thenCompose(
    Function<? super T, ? extends CompletionStage<U>> fn) {
    return uniComposeStage(null, fn);
}

public <U> CompletableFuture<U> thenComposeAsync(
    Function<? super T, ? extends CompletionStage<U>> fn) {
    return uniComposeStage(defaultExecutor(), fn);
}

public <U> CompletableFuture<U> thenComposeAsync(
    Function<? super T, ? extends CompletionStage<U>> fn,
    Executor executor) {
    return uniComposeStage(screenExecutor(executor), fn);
}
```

Here is an example of `thenCompose()`:

```java
CompletableFuture<String> future
        = CompletableFuture.supplyAsync(() -> "hello!")
        .thenCompose(s -> CompletableFuture.supplyAsync(() -> s + "world!"));
assertEquals("hello!world!", future.get());
```

This is useful when both `task1` and `task2` are asynchronous, but `task2` must wait for the result of `task1` before it can start.

`thenCombine()` is another method for combining two `CompletableFuture` instances.

```java
CompletableFuture<String> completableFuture
        = CompletableFuture.supplyAsync(() -> "hello!")
        .thenCombine(CompletableFuture.supplyAsync(
                () -> "world!"), (s1, s2) -> s1 + s2)
        .thenCompose(s -> CompletableFuture.supplyAsync(() -> s + "nice!"));
assertEquals("hello!world!nice!", completableFuture.get());
```

**What is the difference between `thenCompose()` and `thenCombine()`?**

- `thenCompose()` chains two `CompletableFuture` instances, passing the first task's result to the second. The tasks have a dependency and run in sequence.
- `thenCombine()` combines the results after both stages complete normally. The stages may be independent, but whether they run in parallel depends on how they were created and which executor they use; `thenCombine()` does not start tasks itself.

Other `CompletableFuture` composition methods support different workflows and requirements.

For example, if `task1` and `task2` both complete normally, `acceptEither()` lets `task3` consume the result of whichever stage completes first. It is not a reliable “first successful result” selector: if one stage completes exceptionally, the result follows the `CompletionStage` rules for either-stage composition.

```java
public CompletableFuture<Void> acceptEither(
    CompletionStage<? extends T> other, Consumer<? super T> action) {
    return orAcceptStage(null, other, action);
}

public CompletableFuture<Void> acceptEitherAsync(
    CompletionStage<? extends T> other, Consumer<? super T> action) {
    return orAcceptStage(asyncPool, other, action);
}
```

Here is a simple example:

```java
CompletableFuture<String> task = CompletableFuture.supplyAsync(() -> {
    System.out.println("Task 1 started at: " + System.currentTimeMillis());
    try {
        Thread.sleep(500);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    System.out.println("Task 1 completed at: " + System.currentTimeMillis());
    return "task1";
});

CompletableFuture<String> task2 = CompletableFuture.supplyAsync(() -> {
    System.out.println("Task 2 started at: " + System.currentTimeMillis());
    try {
        Thread.sleep(1000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    System.out.println("Task 2 completed at: " + System.currentTimeMillis());
    return "task2";
});

task.acceptEitherAsync(task2, (res) -> {
    System.out.println("Task 3 started at: " + System.currentTimeMillis());
    System.out.println("Result from the previous task: " + res);
});

// Add a short delay to give the asynchronous tasks time to finish.
try {
    Thread.sleep(2000);
} catch (InterruptedException e) {
    e.printStackTrace();
}
```

Output:

```plain
Task 1 started at: 1695088058520
Task 2 started at: 1695088058521
Task 1 completed at: 1695088059023
Task 3 started at: 1695088059023
Result from the previous task: task1
Task 2 completed at: 1695088059523
```

When both stages complete normally, `acceptEitherAsync()` runs task 3 asynchronously with the result of one completed stage, usually the one that finished first. However, if one stage completes exceptionally while the other is still running or completes normally, the specification does not guarantee whether the returned stage will ultimately complete normally or exceptionally. Do not rely on it to ignore an earlier exception and wait for the other stage to succeed.

### Waiting for Multiple `CompletableFuture` Instances

Use the static `CompletableFuture.allOf()` method to wait for several `CompletableFuture` instances to complete. `allOf()` combines the completion states of existing stages; it does not start the tasks. Whether they run in parallel depends on how they were created and which executor they use.

In real applications, several unrelated tasks often need to run in parallel without depending on one another.

For example, six files may be processed independently, then their results combined before returning a response. This is a good fit for running multiple `CompletableFuture` tasks in parallel.

Example:

```java
CompletableFuture<Void> task1 =
  CompletableFuture.supplyAsync(()->{
    // Custom business operation.
  });
......
CompletableFuture<Void> task6 =
  CompletableFuture.supplyAsync(()->{
    // Custom business operation.
  });
......
 CompletableFuture<Void> headerFuture=CompletableFuture.allOf(task1,.....,task6);

  try {
    headerFuture.join();
  } catch (Exception ex) {
    ......
  }
System.out.println("all done. ");
```

`anyOf()` is often compared with `allOf()`.

**`allOf()` completes after all the `CompletableFuture` instances complete.**

```java
Random rand = new Random();
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> {
    try {
        Thread.sleep(1000 + rand.nextInt(1000));
    } catch (InterruptedException e) {
        e.printStackTrace();
    } finally {
        System.out.println("future1 done...");
    }
    return "abc";
});
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> {
    try {
        Thread.sleep(1000 + rand.nextInt(1000));
    } catch (InterruptedException e) {
        e.printStackTrace();
    } finally {
        System.out.println("future2 done...");
    }
    return "efg";
});
```

Calling `join()` makes the program wait for both `future1` and `future2` to complete before continuing.

```java
CompletableFuture<Void> completableFuture = CompletableFuture.allOf(future1, future2);
completableFuture.join();
assertTrue(completableFuture.isDone());
System.out.println("all futures done...");
```

Output:

```plain
future1 done...
future2 done...
all futures done...
```

**`anyOf()` completes as soon as any one of its `CompletableFuture` instances completes; it does not wait for all of them.**

```java
CompletableFuture<Object> f = CompletableFuture.anyOf(future1, future2);
System.out.println(f.get());
```

The output may be:

```plain
future2 done...
efg
```

Or it may be:

```plain
future1 done...
abc
```

## `CompletableFuture` Best Practices

### Use a Custom Executor

The examples above omit custom executors for simplicity. In production, this is usually not a good choice.

In the default `CompletableFuture` implementation, async methods without an explicit `Executor` usually use the shared `ForkJoinPool.commonPool()`. A subclass can override `defaultExecutor()` to change the default executor for non-static async methods. This means the application and multiple libraries or frameworks may share the same pool when using the default implementation.

`ForkJoinPool` is efficient, but submitting many tasks at once can cause resource contention and thread starvation, affecting system performance.

To avoid these issues, provide a custom executor for `CompletableFuture`. This offers several benefits:

- **Isolation:** Assign separate pools to different workloads instead of competing for a shared pool.
- **Resource control:** Tune pool size and queue type for each workload.
- **Exception handling:** Use a custom `ThreadFactory` to handle thread-level exceptions more effectively.

```java
private ThreadPoolExecutor executor = new ThreadPoolExecutor(10, 10,
        0L, TimeUnit.MILLISECONDS,
        new LinkedBlockingQueue<Runnable>());

CompletableFuture.runAsync(() -> {
     //...
}, executor);
```

### Avoid Blocking on `get()`

`CompletableFuture.get()` blocks, so avoid it when possible. If you must use it, set a timeout; otherwise, the main thread may wait indefinitely and fail to do other work.

```java
    CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
        try {
            Thread.sleep(10_000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return "Hello, world!";
    });

    // Get the asynchronous result with a five-second timeout.
    try {
        String result = future.get(5, TimeUnit.SECONDS);
        System.out.println(result);
    } catch (InterruptedException | ExecutionException | TimeoutException e) {
        // Handle the exception.
        e.printStackTrace();
    }
}
```

The code above throws `TimeoutException` if `get()` exceeds the timeout. The catch block can then cancel or retry the task, or log the event.

### Handle Exceptions Correctly

Handle exceptions carefully when using `CompletableFuture` so they are not lost or left unmanaged.

Here are some guidelines:

- `whenComplete` runs when a stage completes normally or exceptionally. It is useful for observing results and logging errors; it preserves the original result or exception and does not convert an exception into a normal result.
- `exceptionally` runs only when a stage completes exceptionally and can recover with a normal value. To propagate the exception, throw it explicitly from the callback.
- `handle` runs after either normal or exceptional completion and creates a new result from the result and exception.
- `CompletableFuture.allOf` waits for all stages. If any stage completes exceptionally, the returned `CompletableFuture` also completes exceptionally. Check each stage individually to retrieve each task's result or exception.
- ……

### Compose Asynchronous Tasks Appropriately

Use methods such as `thenCompose()`, `thenCombine()`, `acceptEither()`, `allOf()`, and `anyOf()` to compose asynchronous tasks according to the workload and improve performance.

You can also use or learn from existing task-composition frameworks, such as JD.com's [asyncTool](https://gitee.com/jd-platform-opensource/asyncTool).

![asyncTool README](https://oss.javaguide.cn/github/javaguide/java/concurrent/asyncTool-readme.png)

## Further Reading

This article introduced the core concepts and common APIs of `CompletableFuture`. For more detail, see these books and articles:

- [CompletableFuture: Principles and Practice in Asynchronous APIs for Food Delivery Merchants - Meituan Tech](https://tech.meituan.com/2022/05/12/principles-and-practices-of-completablefuture.html): An in-depth look at using `CompletableFuture` in a production system, with examples that may help optimize similar workflows.
- [Learn Concurrency from the RocketMQ Source: Three Useful Tools](https://mp.weixin.qq.com/s/32Ak-WFLynQfpn0Cg0N-0A): Describes RocketMQ's use of `CompletableFuture` for asynchronous message processing, introduced in RocketMQ 4.7.

You can also explore JD.com's concurrency framework [asyncTool](https://gitee.com/jd-platform-opensource/asyncTool), which makes extensive use of `CompletableFuture`.

<!-- @include: @article-footer.snippet.md -->
