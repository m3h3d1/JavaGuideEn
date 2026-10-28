---
title: Java Thread Pools Explained
description: An in-depth guide to Java thread pools, covering ThreadPoolExecutor parameters, the Executor framework, task queues, rejection policies, how thread pools work, and best practices.
category: Java
tag:
  - Java Concurrency
head:
  - - meta
    - name: keywords
      content: Java thread pools,ThreadPoolExecutor,Executor framework,thread pool parameters,rejection policies,task queues,thread pool internals
---

<!-- markdownlint-disable MD024 -->

Pooling is a familiar technique. Thread pools, database connection pools, and HTTP connection pools all apply the same idea: reduce the cost of acquiring resources and use them more efficiently.

This article explains the basic concepts and core principles of thread pools.

## Introduction to Thread Pools

Pooling is a familiar technique. Thread pools, database connection pools, and HTTP connection pools all apply the same idea: reduce the cost of acquiring resources and use them more efficiently.

Thread pools provide a way to limit and manage resources, including task execution. Each pool also keeps basic statistics, such as the number of completed tasks. Thread pools offer several benefits:

1. **Lower resource use**: Threads can be reused. After finishing a task, a thread returns to the pool instead of being destroyed, avoiding the cost of repeatedly creating and destroying threads.
2. **Faster response**: A thread pool usually keeps a number of core threads ready. New tasks can be assigned to idle threads without waiting for a new thread to be created.
3. **Easier thread management**: You can configure the pool size, task queue, and rejection policy to control concurrency and help prevent resource exhaustion. Thread pools also expose monitoring data, such as active thread and queued task counts, which can help with tuning.

## Introduction to the Executor Framework

The `Executor` framework was introduced in Java 5. Using `Executor` to run tasks is generally preferable to calling `Thread.start()`: it is easier to manage, can reduce overhead through thread reuse, and helps avoid `this` escape.

> `this` escape occurs when another thread obtains a reference to an object before its constructor returns. Calling methods on an object that has not finished construction can lead to confusing errors.

The `Executor` framework covers more than thread pool management. It also provides thread factories, task queues, and rejection policies, making concurrent programming easier.

The `Executor` framework has three main parts:

**1. Tasks (`Runnable` / `Callable`)**

Tasks implement either the **`Runnable`** or **`Callable`** interface. Implementations of either interface can be run by **`ThreadPoolExecutor`** or **`ScheduledThreadPoolExecutor`**.

**2. Task execution (`Executor`)**

As shown below, the core task execution interface is **`Executor`**. **`ExecutorService`** extends it, and the key classes **`ThreadPoolExecutor`** and **`ScheduledThreadPoolExecutor`** implement `ExecutorService`.

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/executor-class-diagram.png)

There are several relationships between these classes, but `ThreadPoolExecutor` is the one you will most often use directly.

**Note:** `ScheduledThreadPoolExecutor` extends `ThreadPoolExecutor` and implements `ScheduledExecutorService`, which in turn extends `ExecutorService`, as shown in the class diagram above.

`ThreadPoolExecutor` declaration:

```java
// AbstractExecutorService implements ExecutorService
public class ThreadPoolExecutor extends AbstractExecutorService
```

`ScheduledThreadPoolExecutor` declaration:

```java
// ScheduledExecutorService extends ExecutorService
public class ScheduledThreadPoolExecutor
        extends ThreadPoolExecutor
        implements ScheduledExecutorService
```

**3. Asynchronous results (`Future`)**

The **`Future`** interface and its implementation **`FutureTask`** can represent the result of an asynchronous computation.

When you submit a **`Runnable`** or **`Callable`** implementation to **`ThreadPoolExecutor`** or **`ScheduledThreadPoolExecutor`**, `submit()` returns an object that implements `Future`. The concrete implementation is not always `FutureTask`; for example, a scheduled thread pool returns a suitable `RunnableScheduledFuture` implementation.

**How to use the `Executor` framework:**

![How to use the Executor framework](./images/java-thread-pool-summary/Executor框架的使用示意图.png)

1. The main thread creates a task object that implements `Runnable` or `Callable`.
2. It passes the task to `ExecutorService.execute(Runnable command)` or submits it with `ExecutorService.submit(Runnable task)` or `ExecutorService.submit(Callable<T> task)`.
3. `ExecutorService.submit(...)` returns an object that implements `Future`. Since `FutureTask` implements both `Runnable` and `Future`, you can also create one yourself and pass it directly to `ExecutorService`.
4. The main thread can call `Future.get()` to wait for the task to finish, or call `Future.cancel(boolean mayInterruptIfRunning)` to try to cancel it.

## The `ThreadPoolExecutor` Class

`ThreadPoolExecutor` is the core thread pool implementation in the `Executor` framework.

### Thread Pool Parameters

`ThreadPoolExecutor` provides four constructors. Here is the one with the most parameters; the other three use it with some default values, such as a default rejection policy.

```java
    /**
     * Creates a ThreadPoolExecutor with the given initial parameters.
     */
    public ThreadPoolExecutor(int corePoolSize,// Number of core threads
                              int maximumPoolSize,// Maximum number of threads
                              long keepAliveTime,// Maximum idle time for threads beyond the core size
                              TimeUnit unit,// Time unit
                              BlockingQueue<Runnable> workQueue,// Queue for tasks waiting to run
                              ThreadFactory threadFactory,// Factory used to create threads
                              RejectedExecutionHandler handler// Policy for handling tasks that cannot be accepted
                               ) {
        if (corePoolSize < 0 ||
            maximumPoolSize <= 0 ||
            maximumPoolSize < corePoolSize ||
            keepAliveTime < 0)
            throw new IllegalArgumentException();
        if (workQueue == null || threadFactory == null || handler == null)
            throw new NullPointerException();
        this.corePoolSize = corePoolSize;
        this.maximumPoolSize = maximumPoolSize;
        this.workQueue = workQueue;
        this.keepAliveTime = unit.toNanos(keepAliveTime);
        this.threadFactory = threadFactory;
        this.handler = handler;
    }
```

These parameters are important when working with thread pools:

The three most important `ThreadPoolExecutor` parameters are:

- `corePoolSize`: The preferred number of worker threads. By default, threads are created as needed. Once this number is reached, new tasks are usually queued first.
- `maximumPoolSize`: The maximum number of threads that can run at once when the task queue is full.
- `workQueue`: When a new task arrives and the worker count has reached `corePoolSize`, the task is added to this queue.

Other common `ThreadPoolExecutor` parameters:

- `keepAliveTime`: When the pool has more than `corePoolSize` threads and no new tasks arrive, threads beyond the core size remain idle until this time expires, then are reclaimed.
- `unit`: The time unit for `keepAliveTime`.
- `threadFactory`: Used by the executor when it creates a thread.
- `handler`: The rejection policy, discussed below.

The diagram below shows how these thread pool parameters relate to each other (source: _Java Performance Tuning in Practice_):

![How thread pool parameters relate to each other](https://oss.javaguide.cn/github/javaguide/java/concurrent/relationship-between-thread-pool-parameters.png)

### Thread Pool Lifecycle States

`ThreadPoolExecutor` uses the `ctl` variable (an `AtomicInteger`) to track both the pool state and worker count. It has five states:

- **Running (`RUNNING`)**: Accepts new tasks and processes queued tasks. This is the initial state.
- **Shutting down (`SHUTDOWN`)**: Rejects new tasks but continues processing queued tasks. Entered after `shutdown()` is called.
- **Stopped (`STOP`)**: Rejects new tasks, does not process queued tasks, and attempts to interrupt running tasks. Entered after `shutdownNow()` is called.
- **Tidying up (`TIDYING`)**: All tasks have terminated and the worker count is zero. The `terminated()` hook is about to run.
- **Terminated (`TERMINATED`)**: The `terminated()` method has finished, and the pool is fully shut down.

States move in one direction: `RUNNING` → `SHUTDOWN` → `TIDYING` → `TERMINATED`, or `RUNNING` → `STOP` → `TIDYING` → `TERMINATED`. Calling `shutdownNow()` while in `SHUTDOWN` moves the pool to `STOP`.

`shutdown()` initiates an orderly shutdown: it interrupts idle workers, while queued tasks are allowed to finish. `shutdownNow()` attempts to interrupt running workers and returns queued tasks that have not started as a `List<Runnable>`. `terminated()` is an empty hook that subclasses can override to perform cleanup after the pool terminates.

### Worker Threads

`ThreadPoolExecutor` wraps each worker thread in an internal `Worker` class. `Worker` extends AQS and implements `Runnable`.

**Why does `Worker` extend AQS?** `Worker` implements a **non-reentrant exclusive lock**. This lets `shutdown()` distinguish idle workers from busy ones: a worker holds the lock while running a task, so if `shutdown()` cannot acquire it with `tryLock()`, the worker is busy and is not interrupted.

**Worker lifecycle:**

1. **Creation**: When `execute()` needs another thread, it calls `addWorker()` to create a `Worker`, which uses `ThreadFactory` to create the thread.
2. **Execution**: After starting, the thread enters the `runWorker()` loop and repeatedly calls `getTask()` to fetch work from the queue. A worker is not permanently classified as core or non-core. `getTask()` uses timed `workQueue.poll(keepAliveTime, unit)` when core thread timeout is enabled or the worker count exceeds `corePoolSize`; otherwise, it waits with `workQueue.take()`.
3. **Exit**: When `getTask()` returns `null`, the worker exits the loop and is cleaned up. This can happen when the pool is in `STOP`, when it is in `SHUTDOWN` and the queue is empty, when a timed wait expires, or when `maximumPoolSize` has been reduced. If the worker count falls below the core size, the pool may add another worker.

**`ThreadPoolExecutor` rejection policies:**

`ThreadPoolExecutor` invokes a rejection policy if the pool has shut down, or if it has reached its thread limit and the queue cannot accept another task:

- `ThreadPoolExecutor.AbortPolicy`: Rejects the task by throwing `RejectedExecutionException`.
- `ThreadPoolExecutor.CallerRunsPolicy`: Runs the rejected task on the thread that called `execute()`. If the executor has shut down, it discards the task. Running tasks on the caller thread slows task submission and can affect overall performance. Use this policy when the application can tolerate the delay and every task must be handled.
- `ThreadPoolExecutor.DiscardPolicy`: Discards the new task without handling it.
- `ThreadPoolExecutor.DiscardOldestPolicy`: Discards the oldest queued task.

For example:

For example, when Spring's `ThreadPoolTaskExecutor` or a `ThreadPoolExecutor` is created without an explicit `RejectedExecutionHandler`, the default policy is `AbortPolicy`. If the queue is full, it rejects new tasks by throwing `RejectedExecutionException`, so the task is not processed. While the pool is running, `CallerRunsPolicy` runs a rejected task on the calling thread; after shutdown, it discards the task.

```java
public static class CallerRunsPolicy implements RejectedExecutionHandler {

        public CallerRunsPolicy() { }

        public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
            if (!e.isShutdown()) {
                // Run on the calling thread instead of a pool thread
                r.run();
            }
        }
    }
```

### When to Use the Four Rejection Policies

The four built-in policies behave as described above. Here are some situations where each may be useful:

**`AbortPolicy`**: Suitable for critical operations where losing a task is unacceptable, such as payments or transfers. The caller receives `RejectedExecutionException` and must handle it, for example by retrying or saving the task for later execution. The _Alibaba Java Development Guidelines_ also note that developers must explicitly handle the exception when the default policy rejects a task because the queue is full.

**`CallerRunsPolicy`**: Suitable when tasks must not be discarded and task submission can slow down. Because the caller runs the task, it cannot submit another task until that work is done, creating natural **back pressure**. Meituan's technical team describes using this policy in production. Keep in mind that if a web server request thread, such as a Tomcat worker, submits the task, the request may take much longer to respond.

**`DiscardPolicy`**: Suitable for non-critical work that can be lost, such as asynchronous log writes or metrics reporting. It silently discards rejected tasks, which can make task loss hard to diagnose.

**`DiscardOldestPolicy`**: Suitable when only the latest data matters and older tasks can be replaced, such as real-time market updates or sensor readings. With a `PriorityBlockingQueue`, `poll()` removes the highest-priority task, not necessarily the oldest one, so an important task could be discarded.

**Common production practices**: The built-in policies may not meet every need. Dubbo provides a custom `AbortPolicyWithReport` policy that records rejected task details in a local file as well as throwing an exception. Meituan recommends monitoring and alerting on rejection counts. Other options include saving rejected tasks to a database or message queue for later processing, reporting a counter to Prometheus, or blocking with `workQueue.put(r)` until space is available (Netty has a similar approach).

### Two Ways to Create a Thread Pool

There are two common ways to create a thread pool in Java:

**Option 1: Create one directly with the `ThreadPoolExecutor` constructor (recommended)**

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/threadpoolexecutor-construtors.png)

In the diagram, “default thread factory” and “default rejection policy” mean that `ThreadPoolExecutor` uses its default implementation when the constructor does not receive those arguments.

This is the recommended approach because it lets you set the key parameters and control the pool's behavior, helping avoid resource exhaustion.

**Option 2: Create one with the `Executors` utility class (not recommended for production)**

The diagram below shows the thread pool factory methods provided by `Executors`:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/executors-new-thread-pool-methods.png)

The `Executors` utility class can create several types of thread pools:

- `FixedThreadPool`: Uses a fixed maximum number of worker threads during normal operation. A thread that terminates due to an exception can be replaced, and all threads exit when the pool shuts down. New tasks run immediately if a thread is idle; otherwise, they wait in the task queue.
- `SingleThreadExecutor`: Uses a single thread. Additional tasks wait in a queue and run in FIFO order when the thread becomes available.
- `CachedThreadPool`: Adjusts its thread count as needed. It reuses idle threads when possible and creates new ones when all existing threads are busy. Threads return to the pool after completing a task.
- `ScheduledThreadPool`: Runs tasks after a delay or on a schedule.

The _Alibaba Java Development Guidelines_ prohibit creating thread pools with `Executors` and recommend using the `ThreadPoolExecutor` constructor instead. This makes the pool's behavior explicit and helps avoid resource exhaustion.

The thread pools returned by `Executors` have the following drawbacks, discussed in more detail below:

- `FixedThreadPool` and `SingleThreadExecutor` use an unbounded `LinkedBlockingQueue` with a maximum capacity of `Integer.MAX_VALUE`. A large backlog can lead to OOM.
- `CachedThreadPool` uses a `SynchronousQueue` and can create up to `Integer.MAX_VALUE` threads. A large number of slow tasks can cause it to create too many threads and run out of memory.
- `ScheduledThreadPool` and `SingleThreadScheduledExecutor` use an unbounded `DelayedWorkQueue` with a maximum capacity of `Integer.MAX_VALUE`. A large backlog can lead to OOM.

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
    // LinkedBlockingQueue defaults to Integer.MAX_VALUE, so it is effectively unbounded
    return new ThreadPoolExecutor(nThreads, nThreads,0L, TimeUnit.MILLISECONDS,new LinkedBlockingQueue<Runnable>());

}

public static ExecutorService newSingleThreadExecutor() {
    // LinkedBlockingQueue defaults to Integer.MAX_VALUE, so it is effectively unbounded
    return new FinalizableDelegatedExecutorService (new ThreadPoolExecutor(1, 1,0L, TimeUnit.MILLISECONDS,new LinkedBlockingQueue<Runnable>()));

}

// SynchronousQueue has no capacity; the maximum thread count is Integer.MAX_VALUE
public static ExecutorService newCachedThreadPool() {

    return new ThreadPoolExecutor(0, Integer.MAX_VALUE,60L, TimeUnit.SECONDS,new SynchronousQueue<Runnable>());

}

// DelayedWorkQueue (delay queue)
public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {
    return new ScheduledThreadPoolExecutor(corePoolSize);
}
public ScheduledThreadPoolExecutor(int corePoolSize) {
    super(corePoolSize, Integer.MAX_VALUE, 0, NANOSECONDS,
          new DelayedWorkQueue());
}
```

### Common Thread Pool Queues

When a new task arrives, the pool checks whether the worker count has reached the core size. If it has, the task is placed in the queue.

Different thread pools use different queues. The built-in pools provide useful examples:

- `LinkedBlockingQueue` with capacity `Integer.MAX_VALUE` (effectively unbounded): Used by `FixedThreadPool` and `SingleThreadExecutor`. `FixedThreadPool` creates at most `corePoolSize` threads because its core and maximum sizes are equal. `SingleThreadExecutor` creates one thread. In practice, these queues are unlikely to fill up.
- `SynchronousQueue` (a handoff queue): Used by `CachedThreadPool`. It has no capacity and stores no elements. Each task is handed to an idle thread, or a new thread is created to handle it. Since `CachedThreadPool` can create up to `Integer.MAX_VALUE` threads, it can create a large number of threads and cause OOM.
- `DelayedWorkQueue` (a delay queue): Used by `ScheduledThreadPool` and `SingleThreadScheduledExecutor`. It orders tasks by delay, using a heap so that the next task to run is at the head of the queue. The queue grows by half its current capacity when full and does not block when adding tasks. It can grow up to `Integer.MAX_VALUE`, so the pool generally creates only its core number of threads.

## How Thread Pools Work

We have covered the `Executor` framework and `ThreadPoolExecutor`. Let's review them by writing a small `ThreadPoolExecutor` demo.

### Thread Pool Example

First, create a class that implements `Runnable`. You could also use `Callable`; we will compare them later.

`MyRunnable.java`

```java
import java.util.Date;

/**
 * A simple Runnable that takes about five seconds to run.
 * @author shuang.kou
 */
public class MyRunnable implements Runnable {

    private String command;

    public MyRunnable(String s) {
        this.command = s;
    }

    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() + " Start. Time = " + new Date());
        processCommand();
        System.out.println(Thread.currentThread().getName() + " End. Time = " + new Date());
    }

    private void processCommand() {
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Override
    public String toString() {
        return this.command;
    }
}

```

Now write a test program. This example creates a thread pool with custom parameters using the `ThreadPoolExecutor` constructor, as recommended by Alibaba.

`ThreadPoolExecutorDemo.java`

```java
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public class ThreadPoolExecutorDemo {

    private static final int CORE_POOL_SIZE = 5;
    private static final int MAX_POOL_SIZE = 10;
    private static final int QUEUE_CAPACITY = 100;
    private static final Long KEEP_ALIVE_TIME = 1L;
    public static void main(String[] args) {

        // Create a thread pool as recommended by Alibaba
        // Set custom parameters with the ThreadPoolExecutor constructor
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                CORE_POOL_SIZE,
                MAX_POOL_SIZE,
                KEEP_ALIVE_TIME,
                TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(QUEUE_CAPACITY),
                new ThreadPoolExecutor.CallerRunsPolicy());

        for (int i = 0; i < 10; i++) {
            // Create a WorkerThread object (WorkerThread implements Runnable)
            Runnable worker = new MyRunnable("" + i);
            // Run the Runnable
            executor.execute(worker);
        }
        // Shut down the thread pool
        executor.shutdown();
        while (!executor.isTerminated()) {
        }
        System.out.println("Finished all threads");
    }
}

```

The code above sets these parameters:

- `corePoolSize`: The core thread count is 5.
- `maximumPoolSize`: The maximum thread count is 10.
- `keepAliveTime`: The idle wait time is `1L`.
- `unit`: The time unit is `TimeUnit.SECONDS`.
- `workQueue`: The task queue is an `ArrayBlockingQueue` with a capacity of 100.
- `handler`: The rejection policy is `CallerRunsPolicy`.

**Sample output:**

```plain
pool-1-thread-3 Start. Time = Sun Apr 12 11:14:37 CST 2020
pool-1-thread-5 Start. Time = Sun Apr 12 11:14:37 CST 2020
pool-1-thread-2 Start. Time = Sun Apr 12 11:14:37 CST 2020
pool-1-thread-1 Start. Time = Sun Apr 12 11:14:37 CST 2020
pool-1-thread-4 Start. Time = Sun Apr 12 11:14:37 CST 2020
pool-1-thread-3 End. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-4 End. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-1 End. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-5 End. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-1 Start. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-2 End. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-5 Start. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-4 Start. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-3 Start. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-2 Start. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-1 End. Time = Sun Apr 12 11:14:47 CST 2020
pool-1-thread-4 End. Time = Sun Apr 12 11:14:47 CST 2020
pool-1-thread-5 End. Time = Sun Apr 12 11:14:47 CST 2020
pool-1-thread-3 End. Time = Sun Apr 12 11:14:47 CST 2020
pool-1-thread-2 End. Time = Sun Apr 12 11:14:47 CST 2020
Finished all threads  // Printed after all tasks finish: isTerminated() becomes true only after shutdown() is called and all submitted tasks have completed.

```

### How the Thread Pool Works

The output shows that **the pool starts by running five tasks, then starts another task whenever one finishes.** Before reading on, try to explain why this happens using what we have covered so far.

Let's use the output to walk through how the pool works.

To understand the pool, start with the `execute` method. In the example, `executor.execute(worker)` submits a task to the pool.

Here is a simplified view of its source code:

```java
   // Stores the pool state (runState) and the number of active workers (workerCount)
   private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));

    private static int workerCountOf(int c) {
        return c & CAPACITY;
    }
    // Task queue
    private final BlockingQueue<Runnable> workQueue;

    public void execute(Runnable command) {
        // Throw an exception if the task is null.
        if (command == null)
            throw new NullPointerException();
        // ctl stores the pool's current state
        int c = ctl.get();

        // The following logic has three steps.
        // 1. Check whether the worker count is below corePoolSize.
        // If so, addWorker(command, true) creates and starts a worker for this task.
        if (workerCountOf(c) < corePoolSize) {
            if (addWorker(command, true))
                return;
            c = ctl.get();
        }
        // 2. The worker count is at least corePoolSize, so the core-worker branch was not taken.
        // Add the task to the queue only if the pool is RUNNING and the queue accepts it.
        if (isRunning(c) && workQueue.offer(command)) {
            int recheck = ctl.get();
            // Recheck the pool state. If it is no longer RUNNING, remove the task and apply the rejection policy.
            if (!isRunning(recheck) && remove(command))
                reject(command);
                // If there are no workers, start one.
            else if (workerCountOf(recheck) == 0)
                addWorker(null, false);
        }
        // 3. Create a worker for this task, up to maxPoolSize.
        // If addWorker(command, false) fails, apply the rejection policy.
        else if (!addWorker(command, false))
            reject(command);
    }
```

In simplified terms, the process is:

1. If the worker count is below the core size, create a worker to run the task.
2. If the worker count has reached the core size, try to put the task in the queue.
3. If the queue is full and the worker count is below the maximum, create a non-core worker to run the task.
4. If the worker count has reached the maximum and the queue cannot accept the task, reject it by calling `RejectedExecutionHandler.rejectedExecution()`.

> **Note:** Non-core workers are not created only to sit idle after the queue fills up. After finishing their first task, they also fetch work from the queue through `getTask()`. Core workers usually wait with `workQueue.take()`, while workers eligible for timeout use `workQueue.poll(keepAliveTime, unit)`. If a task arrives before the timeout, they keep working; otherwise, the worker is reclaimed. An idle non-core worker can therefore take a newly queued task before the queue fills up.

![How a thread pool works](https://oss.javaguide.cn/github/javaguide/java/concurrent/thread-pool-principle.png)

The `execute` method calls `addWorker` several times. This method creates a worker thread and returns `true` if the worker was created and started successfully; otherwise, it returns `false`.

```java
    // Global lock for concurrent operations
    private final ReentrantLock mainLock = new ReentrantLock();
    // Tracks the pool's largest size; access only while holding mainLock
    private int largestPoolSize;
    // Active workers; access only while holding mainLock
    private final HashSet<Worker> workers = new HashSet<>();
    // Get the pool state
    private static int runStateOf(int c)     { return c & ~CAPACITY; }
    // Check whether the pool is running
    private static boolean isRunning(int c) {
        return c < SHUTDOWN;
    }


    /**
     * Adds a worker thread to the pool.
     * @param firstTask the task to run
     * @param core if true, use the core size as the limit; otherwise, use the maximum size
     * @return true if the worker was added successfully; otherwise, false
     */
   private boolean addWorker(Runnable firstTask, boolean core) {
        retry:
        for (;;) {
            // Read the pool state.
            int c = ctl.get();
            int rs = runStateOf(c);

            // Check if queue empty only if necessary.
            if (rs >= SHUTDOWN &&
                ! (rs == SHUTDOWN &&
                   firstTask == null &&
                   ! workQueue.isEmpty()))
                return false;

            for (;;) {
               // Get the worker count.
                int wc = workerCountOf(c);
                // When core is false, the queue is full and the limit is maximumPoolSize.
                if (wc >= CAPACITY ||
                    wc >= (core ? corePoolSize : maximumPoolSize))
                    return false;
               // Atomically increment workerCount.
                if (compareAndIncrementWorkerCount(c))
                    break retry;
                // Retry if the pool state changed.
                c = ctl.get();
                if (runStateOf(c) != rs)
                    continue retry;
                // else CAS failed due to workerCount change; retry inner loop
            }
        }
        // Whether the worker started successfully
        boolean workerStarted = false;
        // Whether the worker was added successfully
        boolean workerAdded = false;
        Worker w = null;
        try {

            w = new Worker(firstTask);
            final Thread t = w.thread;
            if (t != null) {
              // Acquire the lock
                final ReentrantLock mainLock = this.mainLock;
                mainLock.lock();
                try {
                   // Get the pool state
                    int rs = runStateOf(ctl.get());
                   // If the pool is RUNNING, add the worker. During SHUTDOWN, add one only when firstTask is null.
                   // A null firstTask means this worker starts without an initial task.
                    if (rs < SHUTDOWN ||
                        (rs == SHUTDOWN && firstTask == null)) {
                        if (t.isAlive()) // precheck that t is startable
                            throw new IllegalThreadStateException();
                        workers.add(w);
                       // Update the largest worker count.
                        int s = workers.size();
                        if (s > largestPoolSize)
                            largestPoolSize = s;
                      // Mark the worker as added.
                        workerAdded = true;
                    }
                } finally {
                    // Release the lock
                    mainLock.unlock();
                }
                // Start the thread if the worker was added successfully.
                if (workerAdded) {
                    t.start();
                  // Mark the thread as started.
                    workerStarted = true;
                }
            }
        } finally {
           // Remove the worker if its thread did not start.
            if (! workerStarted)
                addWorkerFailed(w);
        }
        return workerStarted;
    }
```

For a deeper source code analysis, see [A 40,000-word analysis of the JUC ThreadPoolExecutor implementation](https://www.cnblogs.com/throwable/p/13574306.html).

Now return to the example. The pool's behavior should be easier to understand.

If anything is still unclear, here is another way to look at it:

> The example submits 10 tasks, with a core size of 5 and a queue capacity of 100. At most five tasks run at once, while the other five wait in the queue. Whenever a running task finishes, its worker takes another task from the queue.

### Common Comparisons

#### `Runnable` vs `Callable`

`Runnable` has been available since Java 1.0. `Callable` was added in Java 1.5 for cases that `Runnable` does not cover. A `Runnable` does not return a result or throw checked exceptions, while a `Callable` can do both. Use `Runnable` when a task needs neither a result nor checked exceptions; it keeps the code simpler.

The `Executors` utility class can wrap a `Runnable` as a `Callable` with `Executors.callable(Runnable task)` or `Executors.callable(Runnable task, Object result)`.

`Runnable.java`

```java
@FunctionalInterface
public interface Runnable {
   /**
    * Runs on a thread; returns no value and cannot throw checked exceptions.
    */
    public abstract void run();
}
```

`Callable.java`

```java
@FunctionalInterface
public interface Callable<V> {
    /**
     * Computes a result, or throws an exception if unable to do so.
     * @return the computed result
     * @throws Exception if the result cannot be computed
     */
    V call() throws Exception;
}

```

#### `execute()` vs `submit()`

`execute()` and `submit()` both submit tasks to a thread pool, but they differ in a few ways:

- **Return value**: `execute()` submits a `Runnable` task without a result. `submit()` accepts a `Runnable` or `Callable` and returns a `Future`. `Future.isDone()` only indicates that the task completed, failed, or was cancelled. Call `get()` to obtain its result or learn about an exception. If `get(long timeout, TimeUnit unit)` times out before completion, it throws `TimeoutException`.
- **Exception handling**: With `submit()`, use the returned `Future` to handle exceptions thrown by the task. With `execute()`, handle exceptions through a custom `ThreadFactory` that sets an `UncaughtExceptionHandler`, or through `ThreadPoolExecutor.afterExecute()`.

Example 1: Use `get()` to retrieve the result.

```java
// For demonstration only. Prefer creating a pool with the ThreadPoolExecutor constructor.
ExecutorService executorService = Executors.newFixedThreadPool(3);

Future<String> submit = executorService.submit(() -> {
    try {
        Thread.sleep(5000L);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    return "abc";
});

String s = submit.get();
System.out.println(s);
executorService.shutdown();
```

Output:

```plain
abc
```

Example 2: Use `get(long timeout, TimeUnit unit)` to retrieve the result with a timeout.

```java
ExecutorService executorService = Executors.newFixedThreadPool(3);

Future<String> submit = executorService.submit(() -> {
    try {
        Thread.sleep(5000L);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    return "abc";
});

String s = submit.get(3, TimeUnit.SECONDS);
System.out.println(s);
executorService.shutdown();
```

Output:

```plain
Exception in thread "main" java.util.concurrent.TimeoutException
  at java.util.concurrent.FutureTask.get(FutureTask.java:205)
```

#### `shutdown()` vs `shutdownNow()`

- **`shutdown()`**: Shuts down the pool and moves it to `SHUTDOWN`. The pool stops accepting new tasks but finishes tasks already in the queue.
- **`shutdownNow()`**: Moves the pool to `STOP`, attempts to interrupt running tasks, stops processing queued tasks, and returns tasks that have not started. Tasks that ignore interruption may continue running.

#### `isTerminated()` vs `isShutdown()`

- **`isShutdown()`** returns `true` after `shutdown()` has been called.
- **`isTerminated()`** returns `true` after `shutdown()` has been called and all submitted tasks have completed.

## Common Built-in Thread Pools

### FixedThreadPool

#### Overview

`FixedThreadPool` is a thread pool with a fixed, reusable number of threads. Here is the relevant implementation from `Executors`:

```java
   /**
     * Creates a pool with a fixed number of reusable threads.
     */
    public static ExecutorService newFixedThreadPool(int nThreads, ThreadFactory threadFactory) {
        return new ThreadPoolExecutor(nThreads, nThreads,
                                      0L, TimeUnit.MILLISECONDS,
                                      new LinkedBlockingQueue<Runnable>(),
                                      threadFactory);
    }
```

There is another `FixedThreadPool` factory method with a similar implementation:

```java
    public static ExecutorService newFixedThreadPool(int nThreads) {
        return new ThreadPoolExecutor(nThreads, nThreads,
                                      0L, TimeUnit.MILLISECONDS,
                                      new LinkedBlockingQueue<Runnable>());
    }
```

The source shows that both `corePoolSize` and `maximumPoolSize` are set to `nThreads`, the value passed by the caller.

Even if `maximumPoolSize` is greater than `corePoolSize`, the pool creates at most `corePoolSize` threads. `FixedThreadPool` uses a `LinkedBlockingQueue` with a capacity of `Integer.MAX_VALUE`, so the queue is effectively unbounded and will not fill up.

#### How Tasks Run

The diagram below shows how `FixedThreadPool.execute()` works (from _The Art of Java Concurrency Programming_):

![How FixedThreadPool.execute() works](./images/java-thread-pool-summary/FixedThreadPool.png)

**The diagram shows:**

1. If the worker count is below `corePoolSize`, a new task causes the pool to create a worker.
2. Once the worker count reaches `corePoolSize`, new tasks are added to the `LinkedBlockingQueue`.
3. After finishing a task, each worker repeatedly fetches another task from the `LinkedBlockingQueue`.

#### Why `FixedThreadPool` Is Not Recommended

Using an unbounded `LinkedBlockingQueue` (capacity `Integer.MAX_VALUE`) as the work queue has these effects:

1. Once the worker count reaches `corePoolSize`, new tasks wait in the unbounded queue, so the pool does not grow beyond `corePoolSize`.
2. With an unbounded queue, `maximumPoolSize` has no effect because the queue cannot fill up. The `FixedThreadPool` factory sets `corePoolSize` and `maximumPoolSize` to the same value.
3. For the same reason, `keepAliveTime` has no effect when using an unbounded queue.
4. A running `FixedThreadPool` does not reject tasks unless it is shut down. A large backlog can lead to OOM (out of memory).

### SingleThreadExecutor

#### Overview

`SingleThreadExecutor` is a thread pool with a single thread. Here is its implementation:

```java
   /**
     * Returns a thread pool with a single thread.
     */
    public static ExecutorService newSingleThreadExecutor(ThreadFactory threadFactory) {
        return new FinalizableDelegatedExecutorService
            (new ThreadPoolExecutor(1, 1,
                                    0L, TimeUnit.MILLISECONDS,
                                    new LinkedBlockingQueue<Runnable>(),
                                    threadFactory));
    }
```

```java
   public static ExecutorService newSingleThreadExecutor() {
        return new FinalizableDelegatedExecutorService
            (new ThreadPoolExecutor(1, 1,
                                    0L, TimeUnit.MILLISECONDS,
                                    new LinkedBlockingQueue<Runnable>()));
    }
```

The source shows that both `corePoolSize` and `maximumPoolSize` are set to 1. The other parameters are the same as in `FixedThreadPool`.

#### How Tasks Run

The diagram below shows how `SingleThreadExecutor` works (from _The Art of Java Concurrency Programming_):

![How SingleThreadExecutor works](./images/java-thread-pool-summary/SingleThreadExecutor.png)

**The diagram shows:**

1. If the worker count is below `corePoolSize`, the pool creates a thread to run the task.
2. Once the pool has a running thread, new tasks are added to the `LinkedBlockingQueue`.
3. After finishing a task, the thread repeatedly fetches another task from the `LinkedBlockingQueue`.

#### Why `SingleThreadExecutor` Is Not Recommended

Like `FixedThreadPool`, `SingleThreadExecutor` uses an effectively unbounded `LinkedBlockingQueue` with a capacity of `Integer.MAX_VALUE`. This has the same drawbacks and can lead to OOM.

### CachedThreadPool

#### Overview

`CachedThreadPool` creates new threads as needed. Here is its implementation:

```java
    /**
     * Creates new threads as needed and reuses previously created threads when available.
     */
    public static ExecutorService newCachedThreadPool(ThreadFactory threadFactory) {
        return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                      60L, TimeUnit.SECONDS,
                                      new SynchronousQueue<Runnable>(),
                                      threadFactory);
    }

```

```java
    public static ExecutorService newCachedThreadPool() {
        return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                      60L, TimeUnit.SECONDS,
                                      new SynchronousQueue<Runnable>());
    }
```

`CachedThreadPool` sets `corePoolSize` to 0 and `maximumPoolSize` to `Integer.MAX_VALUE`, so its maximum is effectively unbounded. If tasks arrive faster than the pool can process them, it keeps creating threads. In extreme cases, this can exhaust CPU and memory resources.

#### How Tasks Run

The diagram below shows how `CachedThreadPool.execute()` works (from _The Art of Java Concurrency Programming_):

![How CachedThreadPool.execute() works](./images/java-thread-pool-summary/CachedThreadPool-execute.png)

**The diagram shows:**

1. The pool first calls `SynchronousQueue.offer(Runnable task)` to hand off the task. If an idle worker is waiting in `SynchronousQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS)`, the handoff succeeds and that worker runs the task. Otherwise, the pool proceeds to step 2.
2. If the pool has no workers yet, or none are idle, no worker is waiting in `poll()`. The handoff in step 1 fails, so `CachedThreadPool` creates a new thread to run the task.

#### Why `CachedThreadPool` Is Not Recommended

`CachedThreadPool` uses a `SynchronousQueue` and can create up to `Integer.MAX_VALUE` threads. Under heavy load, it can create too many threads and cause OOM.

### ScheduledThreadPool

#### Overview

`ScheduledThreadPool` runs tasks after a delay or on a schedule. It is not recommended for use in most projects, so a brief overview is enough.

```java
public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {
    return new ScheduledThreadPoolExecutor(corePoolSize);
}
public ScheduledThreadPoolExecutor(int corePoolSize) {
    super(corePoolSize, Integer.MAX_VALUE, 0, NANOSECONDS,
          new DelayedWorkQueue());
}
```

`ScheduledThreadPool` is created through `ScheduledThreadPoolExecutor` and uses a `DelayedWorkQueue` as its task queue.

`DelayedWorkQueue` orders tasks by delay rather than insertion time. It uses a heap to keep the next task to run at the head of the queue. When full, it grows by half its current capacity, so adding tasks does not block. It can grow up to `Integer.MAX_VALUE`, so the pool generally creates only its core number of threads.

`ScheduledThreadPoolExecutor` extends `ThreadPoolExecutor`, so creating a scheduled pool is essentially creating a `ThreadPoolExecutor` with different parameters.

```java
public class ScheduledThreadPoolExecutor
        extends ThreadPoolExecutor
        implements ScheduledExecutorService
```

#### `ScheduledThreadPoolExecutor` vs `Timer`

- `Timer` is sensitive to changes in the system clock; `ScheduledThreadPoolExecutor` is not.
- `Timer` uses a single thread, so a long-running task can delay other tasks. `ScheduledThreadPoolExecutor` can use any configured number of threads. You can also control how they are created by providing a `ThreadFactory`.
- An unchecked exception in a `TimerTask` terminates `Timer`'s only thread, preventing later scheduled tasks from running. An exception in one `ScheduledThreadPoolExecutor` task does not stop other tasks, but a periodic task will not run again after it throws. Tasks submitted with `submit()` or a scheduling method usually store exceptions in a `Future`, which the caller can inspect with `Future.get()`. If you inspect exceptions in `afterExecute()`, you also need to read them from the `Future` passed to that method.

For more about scheduled tasks, see [Java Scheduled Tasks Explained](https://javaguide.cn/system-design/schedule-task.html).

## Thread Pool Best Practices

The article [Java Thread Pool Best Practices](https://javaguide.cn/java/concurrent/java-thread-pool-best-practices.html) covers points to consider when using thread pools in a project.

## References

- _The Art of Java Concurrency Programming_
- [Java Scheduler ScheduledExecutorService ScheduledThreadPoolExecutor Example](https://www.journaldev.com/2340/java-scheduler-scheduledexecutorservice-scheduledthreadpoolexecutor-example "Java Scheduler ScheduledExecutorService ScheduledThreadPoolExecutor Example")
- [java.util.concurrent.ScheduledThreadPoolExecutor Example](https://examples.javacodegeeks.com/core-java/util/concurrent/scheduledthreadpoolexecutor/java-util-concurrent-scheduledthreadpoolexecutor-example/ "java.util.concurrent.ScheduledThreadPoolExecutor Example")
- [ThreadPoolExecutor – Java Thread Pool Example](https://www.journaldev.com/1069/threadpoolexecutor-java-thread-pool-example-executorservice "ThreadPoolExecutor – Java Thread Pool Example")

<!-- @include: @article-footer.snippet.md -->
