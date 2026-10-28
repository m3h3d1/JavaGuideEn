---
title: ArrayBlockingQueue Source Code Analysis
description: An in-depth look at ArrayBlockingQueue, a bounded blocking queue, its producer-consumer pattern, ReentrantLock and Condition coordination, and its use in thread pools.
category: Java
tag:
  - Java Collections
head:
  - - meta
    - name: keywords
      content: ArrayBlockingQueue source code, blocking queue, bounded queue, producer-consumer pattern, ReentrantLock, Condition, thread pool work queue
---

## Introduction to Blocking Queues

### A Brief History of Blocking Queues

Java blocking queues date back to JDK 1.5, when the platform introduced `java.util.concurrent`, commonly known as JUC. The package includes concurrency utilities, concurrent collections, atomic classes, and the blocking queues discussed in this article.

`ArrayBlockingQueue` and `LinkedBlockingQueue` were introduced in JDK 1.5 to help threads share data in highly concurrent applications. Both support the producer-consumer pattern. `ArrayBlockingQueue` is bounded: once it reaches capacity, another insertion blocks or fails. `LinkedBlockingQueue` uses a linked list and can be created as bounded or unbounded. “Unbounded” means its default capacity is `Integer.MAX_VALUE`, not that it can hold an unlimited number of elements.

`SynchronousQueue` and `DelayQueue` were also introduced in JDK 1.5. JDK 1.7 added `TransferQueue`, an interface that supports transfer operations.

### How Blocking Queues Work

Blocking queues implement the producer-consumer pattern:

1. If the queue is empty, consumer threads block until it becomes non-empty.
2. When a producer adds data, the queue signals a consumer that an element is available.
3. If producers add elements faster than consumers remove them and the queue fills up, producers block until it becomes non-full.
4. When a consumer removes an element, the queue signals a producer that space is available.

In short, blocking queues coordinate producers and consumers using the non-empty and non-full conditions. Although the waiting and signaling logic is complex, the queue implementation handles those details. Applications can use APIs such as `put`, `take`, `offer`, and `poll` to pass data between threads.

Blocking queues are widely used in concurrent applications. A common example is a thread pool: when core threads cannot process tasks immediately, tasks are placed in the `workQueue`.

```java
public ThreadPoolExecutor(int corePoolSize,
                            int maximumPoolSize,
                            long keepAliveTime,
                            TimeUnit unit,
                            BlockingQueue<Runnable> workQueue,
                            ThreadFactory threadFactory,
                            RejectedExecutionHandler handler) {// ...}
```

## Common ArrayBlockingQueue Operations

Now let's look more closely at `ArrayBlockingQueue`. The following examples show how to use it before we examine its implementation.

In the first example, two threads act as a producer and a consumer. The producer adds 10 elements with `put`. When the queue reaches its capacity of 5, `put` blocks. The consumer retrieves elements with `take`, which blocks while the queue is empty. A `CountDownLatch` lets the consumer finish after it has consumed all 10 elements; the producer adds only 10.

```java
public class ProducerConsumerExample {

    public static void main(String[] args) throws InterruptedException {

        // Create an ArrayBlockingQueue with a capacity of 5
        ArrayBlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5);

        // Create a producer thread
        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 10; i++) {
                    // Add an element; block if the queue is full
                    queue.put(i);
                    System.out.println("Producer added: " + i);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

        });

        CountDownLatch countDownLatch = new CountDownLatch(1);

        // Create a consumer thread
        Thread consumer = new Thread(() -> {
            try {
                int count = 0;
                while (true) {

                    // Retrieve an element; block if the queue is empty
                    int element = queue.take();
                    System.out.println("Consumer retrieved: " + element);
                    ++count;
                    if (count == 10) {
                        break;
                    }
                }

                countDownLatch.countDown();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

        });

        // Start the threads
        producer.start();
        consumer.start();

        // Wait for the threads to finish
        producer.join();
        consumer.join();

        countDownLatch.await();

        producer.interrupt();
        consumer.interrupt();
    }

}
```

The output shows that the consumer can retrieve an element only after the producer adds one. When the queue is empty, the consumer blocks until an element becomes available.

```cpp
Producer added: 1
Producer added: 2
Consumer retrieved: 1
Consumer retrieved: 2
Producer added: 3
Consumer retrieved: 3
Producer added: 4
Producer added: 5
Consumer retrieved: 4
Producer added: 6
Consumer retrieved: 5
Producer added: 7
Producer added: 8
Producer added: 9
Producer added: 10
Consumer retrieved: 6
Consumer retrieved: 7
Consumer retrieved: 8
Consumer retrieved: 9
Consumer retrieved: 10
```

Now that we have seen the blocking `put` and `take` methods, let's look at the non-blocking insertion and retrieval methods `offer` and `poll`.

The following example creates a queue with a capacity of 3, tries to add four elements with `offer`, and then calls `poll` four times.

```cpp
public class OfferPollExample {

    public static void main(String[] args) {
        // Create an ArrayBlockingQueue with a capacity of 3
        ArrayBlockingQueue<String> queue = new ArrayBlockingQueue<>(3);

        // Add elements to the queue
        System.out.println(queue.offer("A"));
        System.out.println(queue.offer("B"));
        System.out.println(queue.offer("C"));

        // The queue is full, so this returns false
        System.out.println(queue.offer("D"));

        // Retrieve elements from the queue
        System.out.println(queue.poll());
        System.out.println(queue.poll());
        System.out.println(queue.poll());

        // The queue is empty, so this returns null
        System.out.println(queue.poll());
    }

}
```

The first three calls to `offer` return `true` because the queue has space. The fourth returns `false` because the queue is full. As a result, the four calls to `poll` retrieve only three elements.

```cpp
true
true
true
false
A
B
C
null
```

After seeing blocking and non-blocking operations, let's look at `drainTo`. It transfers queue elements to a collection for batch processing. If elements are transferred, it returns the number moved; if the queue is empty, it returns 0.

```java
public class DrainToExample {

    public static void main(String[] args) {
        // Create an ArrayBlockingQueue with a capacity of 5
        ArrayBlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5);

        // Add elements to the queue
        queue.add(1);
        queue.add(2);
        queue.add(3);
        queue.add(4);
        queue.add(5);

        // Create a list to hold the retrieved elements
        List<Integer> list = new ArrayList<>();

        // Remove all elements from the queue and add them to the list
        queue.drainTo(list);

        // Print the elements in the list
        System.out.println(list);
    }

}
```

Output:

```cpp
[1, 2, 3, 4, 5]
```

## ArrayBlockingQueue Source Code

Now that we have seen the basic operations, let's examine how `ArrayBlockingQueue` works.

### Overall Design

First, let's look at the `ArrayBlockingQueue` class diagram.

![ArrayBlockingQueue class diagram](https://oss.javaguide.cn/github/javaguide/java/collection/arrayblockingqueue-class-diagram.png)

As shown, `ArrayBlockingQueue` implements the `BlockingQueue` interface, which defines common blocking queue operations.

It also extends `AbstractQueue`, an abstract class that extends `AbstractCollection` and implements `Queue`. This gives `ArrayBlockingQueue` the standard queue operations.

In other words, `AbstractQueue` provides the general queue operation templates, while `ArrayBlockingQueue` implements the blocking operations from `BlockingQueue` and supplies the details required by those templates.

Let's verify this in the source. `AbstractQueue` gets common collection operations from `AbstractCollection` and queue behavior from the `Queue` interface.

```java
public abstract class AbstractQueue<E>
    extends AbstractCollection<E>
    implements Queue<E> {
       //...
}
```

Starting with insertion, `AbstractQueue` implements the `add` method inherited from `AbstractCollection` as follows:

1. Call `offer`, inherited from `Queue`. Return `true` if it succeeds.
2. If `offer` fails, throw an exception because the element could not be added.

```java
public boolean add(E e) {
  if (offer(e))
      return true;
  else
      throw new IllegalStateException("Queue full");
}
```

`AbstractQueue` does not implement `Queue.offer`. It defines the core behavior of `add` and leaves the details of `offer` to its subclass, `ArrayBlockingQueue`.

That covers `AbstractQueue`. Next, let's look at the other important interface implemented by `ArrayBlockingQueue`: `BlockingQueue`.

`BlockingQueue` also extends `Queue`, so it has all standard queue behavior. It additionally declares the following methods:

```java
public interface BlockingQueue<E> extends Queue<E> {

     // Returns true on success; throws IllegalStateException if the queue is full
    boolean add(E e);

     // Returns true on success, or false if the queue is full
    boolean offer(E e);

     // Adds an element, blocking if the queue is full; can be interrupted
    void put(E e) throws InterruptedException;

   // Like put, but waits only for the specified timeout and returns false if it expires
    boolean offer(E e, long timeout, TimeUnit unit)
        throws InterruptedException;

    // Retrieves and removes the head, blocking if the queue is empty; can be interrupted
    E take() throws InterruptedException;

      // Retrieves and removes the head, waiting up to the specified timeout if empty
    E poll(long timeout, TimeUnit unit)
        throws InterruptedException;

     // Returns the remaining queue capacity
    int remainingCapacity();

     // Removes the specified element, if present
    boolean remove(Object o);

    // Checks whether the queue contains the specified element
    public boolean contains(Object o);

     // Transfers all queue elements to the specified collection
    int drainTo(Collection<? super E> c);

    // Transfers up to maxElements elements to the collection
    int drainTo(Collection<? super E> c, int maxElements);
}
```

`ArrayBlockingQueue` implements the methods declared by `BlockingQueue`, including `offer`, which is called by the `AbstractQueue.add` implementation shown earlier.

```java
public boolean add(E e) {
  // offer is implemented by ArrayBlockingQueue from the BlockingQueue interface
  if (offer(e))
      return true;
  else
      throw new IllegalStateException("Queue full");
}
```

### Initialization

Before examining the details, let's look at the constructors. `ArrayBlockingQueue` has three; the one below does the main initialization.

```java
// capacity is the queue's initial capacity; fair controls lock fairness
public ArrayBlockingQueue(int capacity, boolean fair) {
  // Throw IllegalArgumentException if capacity is not positive
  if (capacity <= 0)
      throw new IllegalArgumentException();
  // Create the array that stores queue elements
  this.items = new Object[capacity];
  // Create the lock that coordinates queue operations
  lock = new ReentrantLock(fair);
  // Create conditions for producers and consumers
  notEmpty = lock.newCondition();
  notFull =  lock.newCondition();
}
```

Two important fields here are `notEmpty` and `notFull`. These conditions coordinate producers and consumers; the source walkthrough below explains them in more detail.

The other constructors build on this one. By default, the constructor below uses a non-fair lock, so producers and consumers compete for the lock without a fairness guarantee after being signaled.

```java
 public ArrayBlockingQueue(int capacity) {
        this(capacity, false);
    }
```

The third, less commonly used constructor also accepts a `Collection`. It initializes the queue with the collection's elements.

```java
public ArrayBlockingQueue(int capacity, boolean fair,
                              Collection<? extends E> c) {
  // Initialize the capacity and lock fairness
  this(capacity, fair);

  final ReentrantLock lock = this.lock;
  // Lock and copy the elements from c into the backing array
  lock.lock();
  try {
      int i = 0;
      try {
                // Iterate over the collection and add its elements to the array
          for (E e : c) {
              checkNotNull(e);
              items[i++] = e;
          }
      } catch (ArrayIndexOutOfBoundsException ex) {
          throw new IllegalArgumentException();
      }
      // Record the current queue size
      count = i;
                      // Set the index for the next put, offer, or add operation
      putIndex = (i == capacity) ? 0 : i;
  } finally {
      // Release the lock after iteration
      lock.unlock();
  }
}
```

### Blocking Retrieval and Insertion

Blocking retrieval and insertion in `ArrayBlockingQueue` follow the producer-consumer pattern. It also supports non-blocking operations such as `poll()` and `offer(E e)`, covered later.

The blocking methods are:

- `put(E e)`: Inserts an element, blocking while the queue is full until space is available or the thread is interrupted.
- `take()`: Retrieves and removes the head element, blocking while the queue is empty until an element is available or the thread is interrupted.

These methods rely on the `notEmpty` and `notFull` conditions introduced in the constructor.

The following diagrams show how these conditions work in the queue.

![ArrayBlockingQueue not-empty condition](https://oss.javaguide.cn/github/javaguide/java/collection/ArrayBlockingQueue-notEmpty-take.png)

Suppose the consumer starts first and finds the queue empty. It waits on the `notEmpty` condition. When the producer gets CPU time, it adds an element and signals `notEmpty`. The consumer then wakes and can retrieve the element with `take`.

![ArrayBlockingQueue not-full condition](https://oss.javaguide.cn/github/javaguide/java/collection/ArrayBlockingQueue-notFull-put.png)

If the producer is much faster than the consumer, the queue eventually fills up. The producer then waits on `notFull`. When the consumer removes an element, it signals `notFull`, allowing the producer to try inserting again when it gets CPU time.

Now let's look at the `put` and `take` implementations.

```java
public void put(E e) throws InterruptedException {
    // Ensure the element is not null
    checkNotNull(e);
    // Acquire the lock
    final ReentrantLock lock = this.lock;
    // Use lockInterruptibly so waiting for the lock can be interrupted
    lock.lockInterruptibly();
    try {
            // If count equals the array length, the queue is full; wait on notFull
            // The lock is released while waiting so other threads can use the queue
        while (count == items.length)
            notFull.await();
           // Enqueue the element when space is available
        enqueue(e);
    } finally {
        // Release the lock
        lock.unlock();
    }
}
```

`put` calls `enqueue` to insert the element. Here is how `enqueue` works:

```java
private void enqueue(E x) {
   // Get the backing array
    final Object[] items = this.items;
    // Store x at putIndex
    items[putIndex] = x;
    // Advance putIndex, wrapping to 0 at the end of the array
    if (++putIndex == items.length)
        putIndex = 0;
    // Increment the queue size
    count++;
    // Signal that the queue is non-empty
    notEmpty.signal();
}
```

Insertion appends an element to the backing array. The steps are:

1. Get the backing array, `items`.
2. Store the element at `putIndex`.
3. Advance `putIndex`. If it reaches the end of the array, wrap it to 0. `ArrayBlockingQueue` reuses the array as a circular buffer.
4. Increment `count` to reflect the new queue size.
5. Call `notEmpty.signal()` to notify consumers that an element is available.

With `put` covered, let's look at `take`, which blocks while retrieving an element, to complete the producer-consumer walkthrough.

```java
public E take() throws InterruptedException {
       // Acquire the lock
     final ReentrantLock lock = this.lock;
     lock.lockInterruptibly();
     try {
             // If the queue is empty, wait on notEmpty until an element is available
         while (count == 0)
             notEmpty.await();
            // Remove and return the head element
         return dequeue();
     } finally {
          // Release the lock
         lock.unlock();
     }
}
```

The core logic of `take` is the reverse of `put`: `put` waits for the queue to become non-full before inserting, while `take` waits for it to become non-empty before retrieving and removing an element.

`take` calls `dequeue` to remove an element. Its logic is the reverse of `enqueue`:

```java
private E dequeue() {
  // Get the backing array
  final Object[] items = this.items;
  @SuppressWarnings("unchecked")
  // Get the element at takeIndex
  E x = (E) items[takeIndex];
  // Clear the slot at takeIndex
  items[takeIndex] = null;
  // Advance takeIndex, wrapping to 0 at the end of the array
  if (++takeIndex == items.length)
      takeIndex = 0;
  // Decrement the queue size
  count--;
  if (itrs != null)
      itrs.elementDequeued();
  // Signal that the queue is non-full
  notFull.signal();
  return x;
}
```

The `dequeue` steps mirror those of `enqueue`, so they are not repeated here.

This diagram shows how the `notEmpty` and `notFull` conditions coordinate insertion and retrieval in `ArrayBlockingQueue`.

![ArrayBlockingQueue not-empty and not-full conditions](https://oss.javaguide.cn/github/javaguide/java/collection/ArrayBlockingQueue-notEmpty-notFull.png)

- **Consumer:** After a consumer retrieves an element with `take`, `poll`, or a similar operation, it signals `notFull`. Producers waiting for space can wake and try to insert when scheduled.
- **Producer:** After a producer inserts an element, it signals `notEmpty`. Consumers waiting for data can wake and try to retrieve it when scheduled. Together, the two conditions coordinate reads and writes between threads.

### Non-blocking Retrieval and Insertion

The non-blocking methods are:

- `offer(E e)`: Inserts an element at the tail. Returns `false` immediately if the queue is full.
- `poll()`: Retrieves and removes the head element. Returns `null` immediately if the queue is empty.
- `add(E e)`: Inserts an element at the tail. Throws `IllegalStateException` if the queue is full; it delegates to `offer(E e)`.
- `remove()`: Removes the head element. Throws `NoSuchElementException` if the queue is empty; it delegates to `poll()`.
- `peek()`: Retrieves, but does not remove, the head element. Returns `null` immediately if the queue is empty.

The `offer` method is similar to `put`, except that it returns `false` instead of blocking when the queue is full.

```java
public boolean offer(E e) {
        // Ensure the element is not null
        checkNotNull(e);
        // Acquire the lock
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
             // Return false if the queue is full
            if (count == items.length)
                return false;
            else {
                // Otherwise, enqueue the element and return true
                enqueue(e);
                return true;
            }
        } finally {
            // Release the lock
            lock.unlock();
        }
    }
```

Similarly, `poll` returns `null` when no element is available instead of blocking.

```java
public E poll() {
        final ReentrantLock lock = this.lock;
        // Acquire the lock
        lock.lock();
        try {
            // Return null if the queue is empty; otherwise, dequeue and return the element
            return (count == 0) ? null : dequeue();
        } finally {
            lock.unlock();
        }
    }
```

`add` wraps `offer`. If the element cannot be added, it throws an exception:

```java
public boolean add(E e) {
        return super.add(e);
    }


public boolean add(E e) {
        // Throw an exception if offer fails
        if (offer(e))
            return true;
        else
            throw new IllegalStateException("Queue full");
    }
```

Similarly, `remove` calls `poll` and throws an exception if it returns `null` because the queue is empty.

```java
public E remove() {
        E x = poll();
        if (x != null)
            return x;
        else
            throw new NoSuchElementException();
    }
```

The `peek()` method is also simple; it calls `itemAt`:

```java
public E peek() {
        // Acquire the lock
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            // Return null if the queue is empty
            return itemAt(takeIndex);
        } finally {
            // Release the lock
            lock.unlock();
        }
    }

// Return the element at the specified queue position
@SuppressWarnings("unchecked")
final E itemAt(int i) {
    return (E) items[i];
}
```

### Timed Blocking Retrieval and Insertion

In addition to the non-blocking `offer(E e)` and `poll()` methods, `ArrayBlockingQueue` provides timed variants, `offer(E e, long timeout, TimeUnit unit)` and `poll(long timeout, TimeUnit unit)`. They wait for space or an element up to the specified timeout.

```java
 public boolean offer(E e, long timeout, TimeUnit unit)
        throws InterruptedException {

        checkNotNull(e);
        long nanos = unit.toNanos(timeout);
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
        // Wait while the queue is full
            while (count == items.length) {
            // Return false if the timeout expires while the queue is full
                if (nanos <= 0)
                    return false;
                 // Wait for space for up to nanos
                nanos = notFull.awaitNanos(nanos);
            }
            enqueue(e);
            return true;
        } finally {
            lock.unlock();
        }
    }
```

When the queue is full, timed `offer` waits for the specified duration. If space does not become available in time, it returns `false`.

```java
public E poll(long timeout, TimeUnit unit) throws InterruptedException {
        long nanos = unit.toNanos(timeout);
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
          // Wait while the queue is empty; return null if the timeout expires
            while (count == 0) {
                if (nanos <= 0)
                    return null;
                nanos = notEmpty.awaitNanos(nanos);
            }
            return dequeue();
        } finally {
            lock.unlock();
        }
    }
```

Likewise, timed `poll` waits while the queue is empty and returns `null` if the timeout expires.

### Checking Whether an Element Exists

`ArrayBlockingQueue` provides `contains(Object o)` to check whether the queue contains an element.

```java
public boolean contains(Object o) {
    // Return false if the target element is null
    if (o == null) return false;
    // Get the backing array
    final Object[] items = this.items;
    // Acquire the lock
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // If the queue is not empty
        if (count > 0) {
            final int putIndex = this.putIndex;
            // Traverse from the head of the queue
            int i = takeIndex;
            do {
                if (o.equals(items[i]))
                    return true;
                if (++i == items.length)
                    i = 0;
            } while (i != putIndex);
        }
        return false;
    } finally {
        // Release the lock
        lock.unlock();
    }
}
```

## Comparing ArrayBlockingQueue Retrieval and Insertion Methods

The following tables compare the retrieval and insertion methods discussed above.

Insertion:

| Method                                    | Behavior when the queue is full                           | Return value |
| ----------------------------------------- | --------------------------------------------------------- | ------------ |
| `put(E e)`                                | Blocks until interrupted or space becomes available       | void         |
| `offer(E e)`                              | Returns `false` immediately                               | boolean      |
| `offer(E e, long timeout, TimeUnit unit)` | Waits for the timeout, then returns `false` if still full | boolean      |
| `add(E e)`                                | Throws `IllegalStateException`                            | boolean      |

Retrieval and removal:

| Method                              | Behavior when the queue is empty                          | Return value |
| ----------------------------------- | --------------------------------------------------------- | ------------ |
| `take()`                            | Blocks until interrupted or an element is available       | E            |
| `poll()`                            | Returns `null` immediately                                | E            |
| `poll(long timeout, TimeUnit unit)` | Waits for the timeout, then returns `null` if still empty | E            |
| `peek()`                            | Returns `null` immediately                                | E            |
| `remove()`                          | Throws `NoSuchElementException`                           | boolean      |

![](https://oss.javaguide.cn/github/javaguide/java/collection/ArrayBlockingQueue-get-add-element-methods.png)

## Common ArrayBlockingQueue Interview Questions

### What Is ArrayBlockingQueue, and What Are Its Characteristics?

`ArrayBlockingQueue` is a bounded array-based implementation of the `BlockingQueue` interface, commonly used to share data between threads.

Its capacity is fixed when the queue is created.

To ensure thread safety, `ArrayBlockingQueue` uses a `ReentrantLock` to protect both insertion and retrieval. It supports fair and non-fair locking; the default is non-fair.

Despite being a blocking queue, it also supports non-blocking operations such as `poll()` and `offer(E e)`. `offer(E e)` returns `false` when full, and `poll()` returns `null` when empty.

### How Does ArrayBlockingQueue Differ from LinkedBlockingQueue?

`ArrayBlockingQueue` and `LinkedBlockingQueue` are two commonly used, thread-safe blocking queue implementations. They differ in several ways:

- **Implementation:** `ArrayBlockingQueue` uses an array; `LinkedBlockingQueue` uses a linked list.
- **Capacity:** `ArrayBlockingQueue` requires a capacity at construction. `LinkedBlockingQueue` defaults to `Integer.MAX_VALUE` but can also be given a smaller, bounded capacity.
- **Locks:** `ArrayBlockingQueue` uses the same lock for producers and consumers. `LinkedBlockingQueue` separates them into `putLock` and `takeLock`, reducing contention between producers and consumers.
- **Memory use:** `ArrayBlockingQueue` allocates its array up front. `LinkedBlockingQueue` allocates nodes as elements are added.

### How Does ArrayBlockingQueue Differ from ConcurrentLinkedQueue?

`ArrayBlockingQueue` and `ConcurrentLinkedQueue` are two commonly used, thread-safe queue implementations. They differ in several ways:

- **Implementation:** `ArrayBlockingQueue` uses an array; `ConcurrentLinkedQueue` uses a linked list.
- **Capacity:** `ArrayBlockingQueue` is bounded and requires a capacity at construction. `ConcurrentLinkedQueue` is unbounded and grows dynamically.
- **Blocking:** `ArrayBlockingQueue` supports blocking and non-blocking operations. `ConcurrentLinkedQueue` supports only non-blocking operations.

### How Is ArrayBlockingQueue Implemented?

The implementation can be summarized as follows (using blocking retrieval and insertion as examples):

- It maintains a fixed-size array to store elements.
- A `ReentrantLock` synchronizes reads and writes to ensure thread safety.
- `Condition` objects coordinate waiting and signaling between threads.

The waiting and signaling flow works as follows. In an interview, focus on these key points rather than memorizing every method:

- When the queue is full, a producer calls `notFull.await()` and waits for space.
- When the queue is empty, a consumer calls `notEmpty.await()` and waits for an element.
- When an element is added, the producer calls `notEmpty.signal()` to wake a waiting consumer.
- When an element is removed, the consumer calls `notFull.signal()` to wake a waiting producer.

About the `Condition` interface:

> `Condition` was introduced in JDK 1.5 and provides flexible notification. A `Lock` can have multiple `Condition` instances, allowing threads to wait on specific conditions and enabling selective signaling. With `notify()` and `notifyAll()`, the JVM chooses which waiting thread to notify. A `ReentrantLock` combined with `Condition` instances gives more control. By contrast, `synchronized` has one wait set per monitor, so `notifyAll()` wakes every waiting thread. A `Condition`'s `signalAll()` wakes only the threads waiting on that condition.

## References

- Understanding Java: A Guide to BlockingQueue: <https://juejin.cn/post/6999798721269465102>
- An Introduction to BlockingQueue and ArrayBlockingQueue: <https://zhuanlan.zhihu.com/p/539619957>
- ArrayBlockingQueue: Implementation and Practice: <https://zhuanlan.zhihu.com/p/339662987>
<!-- @include: @article-footer.snippet.md -->
