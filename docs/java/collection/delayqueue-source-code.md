---
title: DelayQueue Source Code Analysis
description: An in-depth look at DelayQueue, the Delayed interface, scheduled tasks, timeout handling, and its thread-safe PriorityQueue-based design.
category: Java
tag:
  - Java Collections
head:
  - - meta
    - name: keywords
      content: DelayQueue source code, delayed queue, Delayed interface, delayed tasks, scheduled tasks, order timeout, PriorityQueue implementation
---

## Introduction to DelayQueue

`DelayQueue`, part of `java.util.concurrent` (JUC), is a thread-safe, unbounded `BlockingQueue` backed by a `PriorityQueue`. It is useful for delayed tasks, such as canceling an order that remains unpaid for 15 minutes. See [PriorityQueue Source Code Analysis](./priorityqueue-source-code.md) for details about `PriorityQueue`.

![BlockingQueue implementations](https://oss.javaguide.cn/github/javaguide/java/collection/blocking-queue-hierarchy.png)

Elements stored in a `DelayQueue` must implement the `Delayed` interface and its `getDelay()` method, which reports the remaining delay.

```java
public interface Delayed extends Comparable<Delayed> {
    long getDelay(TimeUnit unit);
}
```

By default, `DelayQueue` orders tasks by their expiration time. An element can be retrieved only after it expires, when `getDelay()` returns zero or less.

`DelayQueue` was introduced in Java 5. It is a thread-safe, unbounded blocking queue.

## A Common DelayQueue Use Case

Suppose we submit three tasks with delays of 1, 2, and 3 seconds. Even if they are added out of order, the task with the earliest expiration becomes available first.

![Delayed tasks](https://oss.javaguide.cn/github/javaguide/java/collection/delayed-task.png)

We can implement this with `DelayQueue`. First, define a `DelayedTask` that implements `Delayed` and provides `getDelay` and `compareTo`:

```java
/**
 * A delayed task
 */
public class DelayedTask implements Delayed {
    /**
     * Task expiration time
     */
    private long executeTime;
    /**
     * Task to run
     */
    private Runnable task;

    public DelayedTask(long delay, Runnable task) {
        this.executeTime = System.currentTimeMillis() + delay;
        this.task = task;
    }

    /**
     * Get the time remaining until this task expires
     * @param unit
     * @return
     */
    @Override
    public long getDelay(TimeUnit unit) {
        return unit.convert(executeTime - System.currentTimeMillis(), TimeUnit.MILLISECONDS);
    }

    /**
     * Order tasks by expiration time in the delay queue
     * @param o
     * @return
     */
    @Override
    public int compareTo(Delayed o) {
        return Long.compare(this.executeTime, ((DelayedTask) o).executeTime);
    }

    public void execute() {
        task.run();
    }
}
```

Once the task is wrapped, set its delay and add it to the queue:

```java
// Create a delay queue and add tasks
DelayQueue < DelayedTask > delayQueue = new DelayQueue < > ();

// Add tasks with delays of 1, 2, and 3 seconds
delayQueue.add(new DelayedTask(2000, () -> System.out.println("Task 2")));
delayQueue.add(new DelayedTask(1000, () -> System.out.println("Task 1")));
delayQueue.add(new DelayedTask(3000, () -> System.out.println("Task 3")));

// Retrieve and run tasks
while (!delayQueue.isEmpty()) {
  // Block until the earliest task expires
  DelayedTask task = delayQueue.take();
  if (task != null) {
    task.execute();
  }
}
```

Although the 2-second task was added first, the 1-second task runs first.

```java
Task 1
Task 2
Task 3
```

## DelayQueue Source Code

This walkthrough examines the core `DelayQueue` implementation in JDK 8.

The class is declared as follows:

```java
public class DelayQueue<E extends Delayed> extends AbstractQueue<E> implements BlockingQueue<E>
{
  //...
}
```

`DelayQueue` extends `AbstractQueue` and implements `BlockingQueue`.

![DelayQueue class diagram](https://oss.javaguide.cn/github/javaguide/java/collection/delayqueue-class-diagram.png)

### Core Fields

The four core fields in `DelayQueue` are:

```java
// Reentrant lock; key to thread safety
private final transient ReentrantLock lock = new ReentrantLock();
// Backing priority queue, which orders elements by expiration time
private final PriorityQueue<E> q = new PriorityQueue<E>();

// Thread waiting for the highest-priority task
private Thread leader = null;
// Coordinates waiting and signaling between threads
private final Condition available = lock.newCondition();
```

- `lock`: A `ReentrantLock` protects queue operations so that only one thread accesses the queue at a time.
- `q`: The `PriorityQueue` stores and orders elements by expiration time.
- `leader`: Only the leader thread waits for the next task's delay to expire. Other waiting threads wait indefinitely until the leader retrieves a task and signals them.
- `available`: This `Condition` coordinates waiting threads. For example, a thread calling `take` on an empty queue waits here until another thread adds a task and signals it.

### Constructors

`DelayQueue` has two simple constructors. Its fields are initialized when the object is created, so the no-argument constructor does nothing. The other constructor accepts a `Collection` and adds its elements to the priority queue through `addAll()`.

```java
public DelayQueue() {}

public DelayQueue(Collection<? extends E> c) {
    this.addAll(c);
}
```

### Adding Elements

The `add`, `put`, and `offer` methods all rely on `offer`, so we can understand insertion by looking at that method.

The `offer` method works as follows:

1. Acquire `lock`.
2. Add the element to the priority queue with `q.offer`.
3. Check whether the new element is now at the head with `peek`. If so, clear `leader` and signal a thread blocked while retrieving an element, since the new head may expire sooner.
4. Release `lock`.
5. Return `true`.

Here is the implementation:

```java
public boolean offer(E e) {
    // Acquire the lock
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // Add the element to the priority queue
        q.offer(e);
        // Check whether the new element is now at the head of the queue
        if (q.peek() == e) {
            // Clear leader and wake a thread waiting to retrieve a task
            leader = null;
            available.signal();
        }
        return true;
    } finally {
        // Release the lock
        lock.unlock();
    }
}
```

### Retrieving Elements

`DelayQueue` provides blocking and non-blocking retrieval methods. First, consider the more complex blocking method, `take`. The following walkthrough uses three threads that call `take` concurrently.

> Understanding the following flow requires some knowledge of AQS. These articles provide background:
>
> - [A Visual Guide to AQS](https://xie.infoq.cn/article/5a3cc0b709012d40cb9f41986)
> - [How Condition Works](https://xie.infoq.cn/article/0223d5e5f19726b36b084b10d)

1. First, three threads try to acquire the reentrant `lock`. Suppose `t1` gets it while `t2` and `t3` enter the lock's wait queue.

![](https://oss.javaguide.cn/github/javaguide/java/collection/delayqueue-take-0.png)

2. `t1` begins retrieving an element.

3. `t1` checks whether the head of the `DelayQueue` is empty.

4. If the queue is empty, `t1` blocks in the `conditionWaiter` queue.

![](https://oss.javaguide.cn/github/javaguide/java/collection/delayqueue-take-1.png)

After calling `await`, `t1` releases the `lock`. If the `DelayQueue` remains empty, `t2` and `t3` follow the same steps and also enter `conditionWaiter`.

![](https://oss.javaguide.cn/github/javaguide/java/collection/delayqueue-take-2.png)

If the queue is not empty, the thread checks whether the head task has expired. If it has, the task is returned immediately. Otherwise, the thread checks whether `leader` is already set. If so, another thread is waiting for a task that expires sooner, so `t1` waits indefinitely until the leader retrieves that task and signals it. If there is no leader, `t1` becomes the leader and waits for the head task's remaining delay. It then retrieves the task when it expires.

The `take` implementation is shown below:

```java
public E take() throws InterruptedException {
    // Acquire the reentrant lock interruptibly
    final ReentrantLock lock = this.lock;
    lock.lockInterruptibly();
    try {
        for (;;) {
            // Check the head of the queue
            E first = q.peek();
            // If empty, wait on the condition and release the lock
            if (first == null)
                available.await();
            else {
                // Check how long until the head element expires
                long delay = first.getDelay(NANOSECONDS);
                // If expired, return it
                if (delay <= 0)
                    return q.poll();
                // The task has not expired; do not retain its reference while waiting
                first = null; // don't retain ref while waiting
                // If another thread is leader, wait until it signals this thread
                if (leader != null)
                    available.await();
                else {
                    // Otherwise, become the leader
                    Thread thisThread = Thread.currentThread();
                    leader = thisThread;
                    try {
                        // Wait for the task's remaining delay
                        available.awaitNanos(delay);
                    } finally {
                        // Clear the leader reference before checking the queue again
                        if (leader == thisThread)
                            leader = null;
                    }
                }
            }
        }
    } finally {
        // Wake a waiting retrieval thread if there is no leader and the queue is not empty
        if (leader == null && q.peek() != null)
            available.signal();
        // Release the lock
        lock.unlock();
    }
}
```

The non-blocking `poll` method is simpler:

1. Acquire the reentrant lock.
2. Check the head of the queue.
3. Return `null` if the queue is empty or the head has not expired.
4. Otherwise, remove and return the expired head with `poll`.
5. Release the lock.

Here is the implementation:

```java
public E poll() {
    // Acquire the reentrant lock
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // Check the head of the queue
        E first = q.peek();

        // Return null if the queue is empty or the task has not expired
        if (first == null || first.getDelay(NANOSECONDS) > 0)
            return null;
        else
            // Remove and return the expired task
            return q.poll();
    } finally {
        // Release the lock
        lock.unlock();
    }
}
```

### Inspecting the Head Element

Retrieval methods use `peek` to inspect the queue without removing its head. It takes four steps:

1. Acquire the lock.
2. Call `peek` on the priority queue to inspect the element at index 0.
3. Release the lock.
4. Return the element.

```java
public E peek() {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        return q.peek();
    } finally {
        lock.unlock();
    }
}
```

## Common DelayQueue Interview Questions

### How Is DelayQueue Implemented?

`DelayQueue` stores elements in a `PriorityQueue`, a binary min-heap that places the smallest element at the head. This makes it easy to select the next delayed task. A `ReentrantLock` protects queue operations, and a `Condition` coordinates waiting and signaling between threads through `await` and `signal`.

### Is DelayQueue Thread-Safe?

Yes. `DelayQueue` uses a `ReentrantLock` to serialize access and a `Condition` to coordinate waiting and signaling between threads.

### What Is DelayQueue Used For?

Common uses include scheduling tasks and removing expired cache entries. For scheduling, wrap each task in a delayed element and add it to the queue. An expired head can then be retrieved, though the consumer thread determines when the task actually runs. For cache expiration, add a delayed removal task containing the cache key, then remove that key from memory when the task expires.

### What Does the Delayed Interface Do?

`Delayed` defines how to get an element's remaining delay with `getDelay`. It also extends `Comparable`, so elements can be ordered with `compareTo`. A class must implement both methods to be stored in a `DelayQueue`.

### How Does DelayQueue Differ from Timer/TimerTask?

Both can be used for scheduling, but they work differently. `DelayQueue` stores delayed elements in a priority queue and makes them available for retrieval after they expire. `Timer/TimerTask` runs tasks sequentially on a single background thread, so a long-running task can delay the others. Both support adding tasks while running, and `DelayQueue` also allows delayed elements to be removed directly.

## References

- _In-Depth Understanding of High-Concurrency Programming: JDK Core Technologies_.
- Six Ways to Implement Delayed Queues in Java: <https://www.jb51.net/article/186192.htm>
- A Visual Guide to the DelayQueue Source Code (Java 8): <https://blog.csdn.net/every__day/article/details/113810985>
<!-- @include: @article-footer.snippet.md -->
