---
title: AQS Explained
description: An in-depth guide to the AbstractQueuedSynchronizer (AQS), covering its core principles, CLH queue, exclusive and shared modes, synchronizers such as ReentrantLock and Semaphore, and thread parking and unparking.
category: Java
tag:
  - Java Concurrency
head:
  - - meta
    - name: keywords
      content: AQS,AbstractQueuedSynchronizer,queue synchronizer,exclusive lock,shared lock,CLH queue,ReentrantLock internals
---

<!-- markdownlint-disable MD024 -->

## Introduction to AQS

The full name of AQS is `AbstractQueuedSynchronizer`. It is an abstract queue synchronizer in the `java.util.concurrent.locks` package.

![](https://oss.javaguide.cn/github/javaguide/AQS.png)

AQS is an abstract class used to build locks and synchronizers.

```java
public abstract class AbstractQueuedSynchronizer extends AbstractOwnableSynchronizer implements java.io.Serializable {
}
```

AQS provides common functionality for building locks and synchronizers. It makes it easier to implement widely used synchronizers such as `ReentrantLock`, `Semaphore`, and `ReentrantReadWriteLock`. `SynchronousQueue` also uses a wait queue and CAS to pair threads, but it is not based on AQS.

## How AQS Works

> Note: The source and node-state analysis below is based mainly on JDK 8. AQS has continued to evolve: JDK 11 still includes fields and methods discussed here, such as `waitStatus`, `addWaiter()`, and `acquireQueued()`, while JDK 17 and later versions have changed the node fields and queueing and waiting implementations substantially. The overall approach of building synchronizers from synchronization state, wait queues, and template methods remains the same.

Concurrency interviews often include a question like, “Can you explain how AQS works?” The overview below can help you prepare. Focus on understanding the ideas and explaining them clearly instead of memorizing an answer.

### A Quick Overview of AQS

Before looking at the source code, it helps to understand AQS at a high level. The questions below explain its role in Java concurrency and how synchronizers build on it.

#### What Is AQS For?

AQS reduces the complexity of implementing synchronizers. It provides a common framework for synchronizers such as **reentrant locks** (`ReentrantLock`), **semaphores** (`Semaphore`), and **countdown latches** (`CountDownLatch`). By encapsulating low-level thread coordination, AQS hides much of the thread management so developers can focus on each synchronizer's rules.

In short, AQS is an abstract class that provides a common **execution framework** for synchronizers. It defines the general flow for **acquiring and releasing resources**, while each synchronizer supplies its resource-specific rules by overriding template methods. AQS is the foundation; synchronizers provide the concrete behavior.

#### Why Does AQS Use a CLH Queue Variant?

A CLH lock is an optimized form of **spin lock**.

Spin locks have a limitation: a thread repeatedly performs `compareAndSet` (or `CAS`) on an atomic variable while trying to acquire the lock. Under heavy contention, many threads compete for the same variable, and one thread's CAS attempts may keep failing. This can cause **starvation**, where a thread may never acquire the lock.

CLH locks improve on spin locks by organizing competing threads in a queue:

- Each thread joins the queue as a node and spins while checking its predecessor's state instead of competing directly for a shared variable.
- Threads wait in queue order, which improves fairness and helps prevent starvation.

AQS (AbstractQueuedSynchronizer) further adapts the CLH lock into an internal **CLH queue variant**, with two main changes:

1. **Spinning and parking**: CLH locks use spinning while waiting for a lock, which can consume significant CPU time. AQS combines spinning with parking:
   - After a failed acquisition, a thread briefly retries.
   - If it still cannot acquire the lock, it parks until another thread unparks it, reducing wasted CPU time.
2. **A doubly linked queue**: A CLH lock uses a singly linked queue, where each node knows its predecessor's state. AQS uses a **doubly linked queue** with a `next` pointer, so a node can also reach its successor. This simplifies queue operations and helps wake successors efficiently.

#### Why Does AQS Perform Well?

AQS makes extensive use of `CAS` operations.

AQS stores waiting threads in a queue. Because the queue is shared, concurrent access to it must be synchronized.

AQS uses `CAS` to coordinate queue access, mainly when initializing the queue and adding thread nodes. CAS can provide good performance, but it also makes the implementation more **complex**.

#### Why Do AQS Nodes Have Different States?

The `waitStatus` field acts like a **state machine**. Its values describe what a node represents, and operations move nodes between these states.

- State `0`: A node starts in this state when it joins the queue.

- State `SIGNAL`: When a node joins the queue, its predecessor's state changes from `0` to `SIGNAL`. This tells the predecessor to unpark the node after releasing the lock. Once the successor has been unparked, the `SIGNAL` state is cleared back to `0`.

- State `CANCELLED`: If a node fails while waiting to acquire the lock, it enters this state to indicate that its acquisition was cancelled. A cancelled node cannot be unparked and cannot unpark its successor.

### Core Ideas Behind AQS

AQS works as follows: if a requested shared resource is available, the requesting thread becomes its active owner and the resource is marked as held. If the resource is already in use, AQS provides a mechanism to park waiting threads and assign the resource when they are unparked. This mechanism is an adaptation of **CLH locks** (Craig, Landin, and Hagersten locks).

**CLH locks** improve on spin locks using a singly linked list. In a multithreaded setting, threads that request the lock form a queue. Each waiting thread spins while checking its predecessor's state, and can acquire the lock after the predecessor releases it. The diagram shows the CLH queue:

![CLH lock queue structure](https://oss.javaguide.cn/github/javaguide/open-source-project/clh-lock-queue-structure.png)

AQS uses a **wait queue** that is a variant of the CLH queue (called the CLH variant queue below).

AQS's CLH variant is a doubly linked queue. Threads that cannot acquire a lock immediately join this queue. It differs from the original CLH queue in two main ways:

- **From spinning to spinning plus parking**: Spinning can be fast, but many spinning threads consume CPU time. The CLH variant first retries acquisition, then parks the thread if the attempt fails.
- **From a singly linked queue to a doubly linked queue**: AQS parks waiting threads and must unpark a successor when the thread ahead releases the lock. The `next` pointer makes this a doubly linked queue.

AQS wraps each thread requesting a shared resource in a CLH variant queue node (`Node`) to manage resource allocation. Each node represents a thread and stores its thread reference (`thread`), state (`waitStatus`), predecessor (`prev`), and successor (`next`).

The diagram shows the structure of AQS's CLH variant queue:

![CLH variant queue structure](https://oss.javaguide.cn/github/javaguide/java/concurrent/clh-queue-structure-bianti.png)

For a detailed explanation of AQS's CLH queue, see [Java AQS Core Data Structure: CLH Lock - Qunar Tech Salon](https://mp.weixin.qq.com/s/jEx-4XhNGOFdCo4Nou5tqg).

A core diagram of AQS (`AbstractQueuedSynchronizer`):

![CLH variant queue](https://oss.javaguide.cn/github/javaguide/java/concurrent/clh-queue-state.png)

AQS uses the **`int` field `state` to represent synchronization state** and an internal **FIFO wait queue** to order threads requesting resources.

The `state` field is `volatile` and represents whether the shared resource is held. In addition to visibility, `volatile` establishes a happens-before relationship: a write to a volatile field happens before a subsequent read. This also prevents compiler and processor reordering that could violate lock semantics.

```java
// Shared state; volatile provides visibility and prevents instruction reordering.
private volatile int state;
```

The `state` field can be accessed through the `protected` methods `getState()`, `setState()`, and `compareAndSetState()`. These methods are `final` and cannot be overridden by subclasses.

```java
// Returns the current synchronization state.
protected final int getState() {
     return state;
}
 // Sets the synchronization state.
protected final void setState(int newState) {
     state = newState;
}
// Atomically sets the state to update if the current state equals expect.
protected final boolean compareAndSetState(int expect, int update) {
      return unsafe.compareAndSwapInt(this, stateOffset, expect, update);
}
```

Consider the reentrant mutual-exclusion lock `ReentrantLock`, which uses `state` to represent whether the lock is held. Initially, `state` is `0`, meaning the lock is free. When thread A calls `lock()`, it attempts to acquire the lock exclusively through `tryAcquire()` and increment `state`. On success, A owns the lock. On failure, A joins the CLH variant wait queue until another thread releases the lock. While holding the lock, A can acquire it again, incrementing `state` each time. This is reentrancy: a thread can acquire the same lock repeatedly without blocking. It must also unlock the same number of times for `state` to return to `0` and release the lock to other waiting threads.

The diagram shows how thread A attempts to acquire the lock (source: [AQS Principles and Applications Through ReentrantLock](./reentrantlock.md)):

![AQS acquiring a lock in exclusive mode](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-exclusive-mode-acquire-lock.png)

For a `CountDownLatch`, `state` can start at N, representing the number of `countDown()` calls required. N counts events, not threads: one thread can call `countDown()` multiple times, or several threads can each call it. When `state` reaches `0`, AQS unparks threads blocked in `await()`, allowing them to continue.

### AQS Node `waitStatus` Values

The `waitStatus` field acts like a **state machine**. Its values describe a node's role and change as operations move the node between states.

| Node state  | Value | Meaning                                                                                                                          |
| ----------- | ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| `CANCELLED` | 1     | The thread cancelled its acquisition, for example because it was interrupted or timed out while waiting.                         |
| `SIGNAL`    | -1    | The current node must unpark its successor after releasing the resource.                                                         |
| `CONDITION` | -2    | The node is waiting on a Condition. After another thread calls `signal()`, it moves to the sync queue to reacquire the resource. |
| `PROPAGATE` | -3    | Used in shared mode to ensure that waiting nodes are not missed during wake-up propagation.                                      |
|             | 0     | The initial state of a node added to the queue.                                                                                  |

The AQS source often checks `waitStatus` using `> 0` and `< 0`.

If `waitStatus > 0`, the node has cancelled its wait to acquire the resource.

If `waitStatus < 0`, the node is in an active state and has not cancelled its wait.

`SIGNAL` is the most important state. The table shows its transitions and the corresponding operations:

| State transition | Operation                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `0`              | A new node starts in state `0` when it joins the queue.                                                                                                |
| `0 -> SIGNAL`    | When a new node joins, its predecessor changes from `0` to `SIGNAL`, indicating that the successor must be unparked.                                   |
| `SIGNAL -> 0`    | The state is cleared when the successor is unparked. This commonly happens on the `head` node and indicates that its successor has been unparked.      |
| `0 -> PROPAGATE` | AQS uses `PROPAGATE` to prevent waiting nodes from being missed in concurrent shared-mode operations, as discussed in the shared acquisition analysis. |

### Custom Synchronizers

A custom synchronizer can be built on AQS by overriding its five template methods. The usual steps are:

1. Extend `AbstractQueuedSynchronizer`.
2. Override the template methods provided by AQS.

**AQS uses the template method pattern. A custom synchronizer can override these hook methods:**

```java
// Exclusive mode: tries to acquire the resource; returns true on success.
protected boolean tryAcquire(int)
// Exclusive mode: tries to release the resource; returns true on success.
protected boolean tryRelease(int)
// Shared mode: tries to acquire the resource; negative means failure, zero means success with none remaining,
// and positive means success with resources remaining.
protected int tryAcquireShared(int)
// Shared mode: tries to release the resource; returns true on success.
protected boolean tryReleaseShared(int)
// Returns whether the current thread holds the resource exclusively; needed when using a Condition.
protected boolean isHeldExclusively()
```

**What is a hook method?** It is a method declared in an abstract class, usually with the `protected` modifier. It can be empty for subclasses to implement or provide a default implementation. The template method pattern uses hooks to control specific steps in a fixed process.

For more on the template method pattern, see [The Template Method Pattern, Updated for Java 8](https://mp.weixin.qq.com/s/zpScSCktFpnSWHWIQem2jg).

Other than these hook methods, AQS methods are `final` and cannot be overridden.

### AQS Resource Modes

AQS defines two resource modes: `Exclusive` (only one thread can proceed, as with `ReentrantLock`) and `Shared` (multiple threads can proceed, as with `Semaphore` or `CountDownLatch`).

Usually, a custom synchronizer uses either exclusive or shared mode and implements only one pair of methods: `tryAcquire`/`tryRelease` or `tryAcquireShared`/`tryReleaseShared`. AQS also allows a synchronizer to support both modes, as `ReentrantReadWriteLock` does.

### Exclusive and Shared Modes Compared

The table below compares AQS's exclusive and shared modes across several dimensions.

#### Feature Comparison

| Dimension               | Exclusive mode                                                 | Shared mode                                                                                                                                                            |
| ----------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Concurrency**         | Only one thread can acquire the resource at a time.            | Multiple threads can acquire the resource at the same time.                                                                                                            |
| **Acquisition entry**   | `acquire(int arg)`                                             | `acquireShared(int arg)`                                                                                                                                               |
| **Release entry**       | `release(int arg)`                                             | `releaseShared(int arg)`                                                                                                                                               |
| **Methods to override** | `tryAcquire(int)` / `tryRelease(int)`                          | `tryAcquireShared(int)` / `tryReleaseShared(int)`                                                                                                                      |
| **Return values**       | `boolean`; `true` means acquisition or release succeeded.      | `int` for acquisition: negative means failure, zero means success with no resources remaining, positive means success with resources remaining; `boolean` for release. |
| **Waking successors**   | Releasing the resource wakes one successor.                    | After successful acquisition, remaining resources may allow wake-up to propagate to more successors.                                                                   |
| **Node mode**           | `Node.EXCLUSIVE` (`null`)                                      | `Node.SHARED` (a static `Node` instance)                                                                                                                               |
| **Examples**            | `ReentrantLock` and the write lock of `ReentrantReadWriteLock` | `Semaphore`, `CountDownLatch`, and the read lock of `ReentrantReadWriteLock`                                                                                           |

#### How Synchronizers Use `state`

In AQS, `state` is a general-purpose synchronization field. Each synchronizer gives it a different meaning:

| Synchronizer             | Mode      | Meaning of `state`                                                                                        |
| ------------------------ | --------- | --------------------------------------------------------------------------------------------------------- |
| `ReentrantLock`          | Exclusive | The reentrant hold count. `state == 0` means free; `state > 0` means held.                                |
| `ReentrantReadWriteLock` | Both      | The upper 16 bits hold the read-lock count; the lower 16 bits hold the write-lock reentrant count.        |
| `Semaphore`              | Shared    | The number of available permits. `acquire()` decreases it and `release()` increases it.                   |
| `CountDownLatch`         | Shared    | The remaining count. Each `countDown()` subtracts 1; when it reaches 0, all waiting threads are unparked. |

The following example illustrates how exclusive and shared modes differ:

```java
import java.util.concurrent.Semaphore;
import java.util.concurrent.locks.ReentrantLock;

public class ExclusiveVsSharedDemo {
    public static void main(String[] args) {
        // Exclusive mode: only one thread can enter the critical section at a time.
        ReentrantLock lock = new ReentrantLock();

        // Shared mode: up to three threads can enter the critical section at a time.
        Semaphore semaphore = new Semaphore(3);

        // Exclusive mode example.
        Runnable exclusiveTask = () -> {
            lock.lock();
            try {
                System.out.println(Thread.currentThread().getName()
                        + " acquired the exclusive lock and is running...");
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                lock.unlock();
            }
        };

        // Shared mode example.
        Runnable sharedTask = () -> {
            boolean acquired = false;
            try {
                semaphore.acquire();
                acquired = true;
                System.out.println(Thread.currentThread().getName()
                        + " acquired a permit and is running...");
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                if (acquired) {
                    semaphore.release();
                }
            }
        };

        System.out.println("=== Exclusive mode (ReentrantLock) ===");
        for (int i = 0; i < 5; i++) {
            new Thread(exclusiveTask, "exclusive-thread-" + i).start();
        }

        try { Thread.sleep(3000); } catch (InterruptedException e) { }

        System.out.println("\n=== Shared mode (Semaphore) ===");
        for (int i = 0; i < 5; i++) {
            new Thread(sharedTask, "shared-thread-" + i).start();
        }
    }
}
```

Running this code shows that only one thread at a time runs in exclusive mode. The default non-fair `ReentrantLock` does not guarantee that threads acquire the lock in start or wait order. In shared mode, up to three threads can run at once.

### AQS Resource Acquisition: Exclusive Mode

In exclusive mode, `acquire()` is the entry point for acquiring a resource:

```JAVA
// AQS
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

In `acquire()`, a thread first tries to acquire the resource. If it fails, AQS wraps it in a `Node` and adds it to the wait queue. The queued thread then retries acquisition and parks if necessary. These steps correspond to three methods:

- `tryAcquire()`: Tries to acquire the lock. AQS leaves this template method for subclasses to implement.
- `addWaiter()`: If acquisition fails, wraps the current thread in a node and adds it to AQS's CLH variant queue.
- `acquireQueued()`: Parks the thread when needed and calls `tryAcquire()` to retry acquisition from the queue.

#### Analyzing `tryAcquire()`

The `tryAcquire()` template method in AQS is:

```JAVA
// AQS
protected boolean tryAcquire(int arg) {
    throw new UnsupportedOperationException();
}
```

`tryAcquire()` is a template method with no default implementation in AQS.

To analyze `tryAcquire()`, consider the non-fair exclusive lock in `ReentrantLock`. Its implementation calls `nonfairTryAcquire()`:

```JAVA
// ReentrantLock
final boolean nonfairTryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    // 1. Read the AQS state.
    int c = getState();
    // 2. If state is 0, no other thread holds the lock.
    if (c == 0) {
        // 2.1. Update state with CAS.
        if (compareAndSetState(0, acquires)) {
            // 2.2. If CAS succeeds, set the current thread as the lock owner.
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    // 3. If the current thread already owns the lock, this is a reentrant acquisition.
    else if (current == getExclusiveOwnerThread()) {
        int nextc = c + acquires;
        if (nextc < 0) // overflow
            throw new Error("Maximum lock count exceeded");
        // 3.1. Increment the reentrant hold count.
        setState(nextc);
        return true;
    }
    // 4. Another thread owns the lock, so acquisition fails.
    return false;
}
```

`nonfairTryAcquire()` acquires the resource through two main operations:

- Update `state` with `CAS`. `state == 0` means the resource is free; `state > 0` means it is held, and the value is the reentrant hold count.
- Set the resource-owning thread with `setExclusiveOwnerThread()`.

If the thread updates `state` successfully, it has acquired the resource. The current thread is then set as its owner.

#### Analyzing `addWaiter()`

If `tryAcquire()` fails, `addWaiter()` wraps the current thread in a `Node` and adds it to AQS's internal queue. The code is shown below:

```JAVA
// AQS
private Node addWaiter(Node mode) {
    // 1. Wrap the current thread in a Node.
    Node node = new Node(Thread.currentThread(), mode);
    Node pred = tail;
    // 2. If pred is not null, tail has been initialized, so add the node to the queue.
    if (pred != null) {
        node.prev = pred;
        // 2.1. Use CAS to ensure thread safety.
        if (compareAndSetTail(pred, node)) {
            pred.next = node;
            return node;
        }
    }
    // 3. Initialize the queue and add the new node.
    enq(node);
    return node;
}
```

**Thread-safe node enqueueing:**

`addWaiter()` must **enqueue** a node in a multithreaded environment, so it uses `CAS` to ensure thread safety.

CAS updates the `tail` pointer to the new node. It ensures that only one thread successfully changes `tail`, making node enqueueing thread-safe.

**Initializing the AQS queue:**

If `addWaiter()` finds `pred == null` (that is, `tail` is null), the queue has not been initialized. It calls `enq()` to initialize the queue and add the node:

```JAVA
// AQS
private Node enq(final Node node) {
    for (;;) {
        Node t = tail;
        if (t == null) {
            // 1. Use CAS to make queue initialization thread-safe.
            if (compareAndSetHead(new Node()))
                tail = head;
        } else {
            // 2. Enqueue the node as in addWaiter().
            node.prev = t;
            if (compareAndSetTail(t, node)) {
                t.next = node;
                return t;
            }
        }
    }
}
```

`enq()` initializes the queue and uses `CAS` to make initialization thread-safe.

Queue initialization has two steps: create the `head` node, then set `tail` to `head`.

**The initialized queue looks like this:**

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/clh-queue-structure-init.png)

#### Analyzing `acquireQueued()`

For reference, here is the AQS `acquire()` method again:

```JAVA
// AQS
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

After `acquire()` adds a `Node` to the queue with `addWaiter()`, it calls `acquireQueued()`:

```JAVA
// AQS: lets queued nodes retry acquisition and parks the thread when needed.
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            // 1. Try to acquire the lock.
            final Node p = node.predecessor();
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }
            // 2. Check whether the thread can park; if so, park it.
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        // 3. If acquisition fails, cancel it and set the node state to CANCELLED.
        if (failed)
            cancelAcquire(node);
    }
}
```

`acquireQueued()` does two main things:

- **Try to acquire the resource:** After joining the queue, if the current thread's predecessor is `head`, it is first in line and calls `tryAcquire()`.

- **Park the current thread:** If acquisition fails, the thread parks and waits to be unparked before trying again.

**1. Try to acquire the resource**

`acquireQueued()` checks two conditions before trying to acquire the resource:

- `p == head`: The current node's predecessor is `head`, so this thread is first in the AQS queue.
- `tryAcquire(arg) == true`: The current thread acquired the resource.

After successful acquisition, the thread's node must **leave the wait queue**. AQS sets it as the new `head`; the head is a dummy node and does not wait to acquire the resource.

**2. Park the current thread**

In AQS, a node's predecessor is responsible for waking it. If the predecessor cancels its acquisition, its state becomes `CANCELLED`. Since that node never acquired the lock, it cannot release it and wake its successor. AQS therefore skips `CANCELLED` nodes before parking the current thread.

`shouldParkAfterFailedAcquire()` checks whether the current thread can park:

```JAVA
// AQS: checks whether the current thread can park.
private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
    int ws = pred.waitStatus;
    // 1. The predecessor is in the expected state, so return true.
    if (ws == Node.SIGNAL)
        return true;
    // 2. ws > 0 means the predecessor is CANCELLED, so skip it.
    if (ws > 0) {
        do {
            node.prev = pred = pred.prev;
        } while (pred.waitStatus > 0);
        pred.next = node;
    } else {
        // 3. If the predecessor is neither SIGNAL nor CANCELLED, set its state to SIGNAL.
        compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
    }
    return false;
}
```

The checks in `shouldParkAfterFailedAcquire()` work as follows:

- If the predecessor is `SIGNAL`, the current thread can park.
- If the predecessor is `CANCELLED`, skip it.
- If the predecessor is neither `SIGNAL` nor `CANCELLED`, set its state to `SIGNAL` so it will unpark its successor.

Once the current thread can park, `parkAndCheckInterrupt()` parks it using `LockSupport`, which uses `Unsafe` internally:

```JAVA
// AQS
private final boolean parkAndCheckInterrupt() {
    // 1. The thread parks here.
    LockSupport.park(this);
    // 2. After being unparked, return the thread's interrupt status.
    return Thread.interrupted();
}
```

**Why return the interrupt status after unparking the thread?**

In `parkAndCheckInterrupt()`, the thread parks when it reaches `LockSupport.park(this)`:

```JAVA
// AQS
private final boolean parkAndCheckInterrupt() {
    LockSupport.park(this);
    // Return the thread's interrupt status after it is unparked.
    return Thread.interrupted();
}
```

Why call `Thread.interrupted()` after the thread is unparked?

Java interruption is cooperative. After a thread wakes up, it cannot tell whether it was interrupted or unparked by `LockSupport.unpark()`, so AQS checks its interrupt status.

**Why does `acquire()` call `selfInterrupt()`?**

The `acquire()` method is:

```JAVA
// AQS
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

When the `if` condition in `acquire()` is `true`, it calls `selfInterrupt()` to restore the current thread's interrupt status. Why is this necessary?

The condition is `true` only if `tryAcquire()` returns `false` and `acquireQueued()` returns `true`.

`acquireQueued()` returns the thread's **interrupt status** after it wakes up. It checks this by calling `Thread.interrupted()`, which also clears the status.

So if the condition is `true`, the thread was interrupted, but `Thread.interrupted()` has cleared its status. `selfInterrupt()` sets the status again.

### AQS Resource Release: Exclusive Mode

In exclusive mode, `release()` is the entry point for releasing a resource:

```JAVA
// AQS
public final boolean release(int arg) {
    // 1. Try to release the lock.
    if (tryRelease(arg)) {
        Node h = head;
        // 2. Unpark the successor.
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }
    return false;
}
```

`release()` does two things: tries to release the lock and unparks a successor. The relevant methods are described below.

**1. Try to release the lock**

`tryRelease()` is a template method implemented by each synchronizer. This section continues to use `ReentrantLock` as an example.

`ReentrantLock` implements `tryRelease()` as follows:

```JAVA
// ReentrantLock
protected final boolean tryRelease(int releases) {
    int c = getState() - releases;
    // 1. Check whether the current thread owns the lock.
    if (Thread.currentThread() != getExclusiveOwnerThread())
        throw new IllegalMonitorStateException();
    boolean free = false;
    // 2. If state is 0, there are no more reentrant holds, so the lock is fully released.
    if (c == 0) {
        free = true;
        // 3. Clear the resource-owning thread.
        setExclusiveOwnerThread(null);
    }
    // 4. Update state.
    setState(c);
    return free;
}
```

`tryRelease()` first calculates the new `state` value and checks whether it is `0`.

- If `state == 0`, there are no more reentrant holds. Set `free = true` and clear the owning thread to indicate that the lock is fully released.
- If `state != 0`, reentrant holds remain. Leave `free` as `false` to indicate that the lock has not been fully released.

It then updates `state` and returns `free`, which indicates whether the thread fully released the lock.

**2. Unpark a successor**

If `tryRelease()` returns `true`, the thread has no remaining reentrant holds and has fully released the lock, so a successor must be unparked.

Before unparking a successor, AQS checks `h != null && h.waitStatus != 0`. Here is why:

- `h == null`: The `head` node has not been initialized, so the AQS queue does not exist and has no thread nodes to unpark.
- `h != null && h.waitStatus == 0`: The head was just initialized and no successor has successfully joined the queue yet. When a successor joins, it sets its predecessor's state to `SIGNAL`.
- `h != null && h.waitStatus != 0`: `waitStatus` can be positive or negative. A value above `0` means the node cancelled its wait; a value below `0` means it is still waiting.

Next, `unparkSuccessor()` shows how AQS unparks a successor:

```JAVA
// AQS: node is the queue's head (a dummy node).
private void unparkSuccessor(Node node) {
    int ws = node.waitStatus;
    // 1. Clear the head state before waking a successor.
    if (ws < 0)
        compareAndSetWaitStatus(node, ws, 0);

    Node s = node.next;
    // 2. If the successor is cancelled, scan backward from tail for an active node.
    if (s == null || s.waitStatus > 0) {
        s = null;
        for (Node t = tail; t != null && t != node; t = t.prev)
            if (t.waitStatus <= 0)
                s = t;
    }
    if (s != null)
        // 3. Unpark the successor.
        LockSupport.unpark(s.thread);
}
```

In `unparkSuccessor()`, if the head state is `< 0`, a successor needs to be unparked. Normally, when a successor exists, the head state is `SIGNAL` (`-1`). AQS clears the head state to `0` to record that it has started waking the successor.

If `s == null` or `s.waitStatus > 0`, the successor is missing or cancelled. AQS must find an active node to unpark instead.

It scans backward from `tail` to find and unpark the first active node (`waitStatus <= 0`).

**Why scan backward from `tail` instead of forward from `head` to find an active node?**

The traversal direction is related to **how nodes are enqueued**:

```JAVA
// AQS: enqueues a node.
private Node addWaiter(Node mode) {
    Node node = new Node(Thread.currentThread(), mode);
    Node pred = tail;
    if (pred != null) {
        // 1. Update prev first.
        node.prev = pred;
        if (compareAndSetTail(pred, node)) {
            // 2. Then update next.
            pred.next = node;
            return node;
        }
    }
    enq(node);
    return node;
}
```

`addWaiter()` updates two pointers when enqueuing a node: `node.prev` and `pred.next`. These are not **atomic operations**; `node.prev` is updated first, followed by `pred.next`.

In an edge case, the node after `head` may be `CANCELLED` while a newly enqueued node has updated `node.prev` but not yet `pred.next`, as shown below:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-addWaiter.png)

In this case, a forward scan from `head` cannot find the new node, so AQS scans backward from `tail`.

### AQS in Exclusive Mode: A Diagram

That covers the AQS source for acquiring and releasing resources in exclusive mode. The following diagrams show how AQS works and how node states change.

Since AQS is a low-level synchronizer and does not implement resource-specific acquisition or release, the diagrams use `ReentrantLock` as an example.

Suppose three threads, `T1`, `T2`, and `T3`, try to acquire the lock.

Suppose `T1` acquires the lock first and `T2` waits in the queue. Before `T2` can join, AQS initializes its internal queue. The initial `head` state is `0`, as shown below:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process.png)

`T2` then tries to acquire the lock, but `T1` still holds it, so `T2` joins the queue. Its predecessor (`head`) changes from `0` to `SIGNAL`, indicating that it must unpark its successor. The queue now looks like this:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-2.png)

`T3` also tries to acquire the lock while `T1` holds it, so it joins the queue. The predecessor node (`T2`) changes from `0` to `SIGNAL`, indicating that it must unpark its successor. The queue now looks like this:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-3.png)

When `T1` releases the lock, it unparks its successor, `T2`. After waking, `T2` acquires the lock and leaves the wait queue.

The `T2` node is not removed directly. Instead, it becomes the new `head`, which marks the end of its wait. The queue now looks like this:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-4.png)

When `T2` releases the lock, it unparks `T3`. After acquiring the lock, `T3` also leaves the wait queue by becoming the new `head` node. The queue now looks like this:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-5.png)

### AQS Resource Acquisition: Shared Mode

In shared mode, `acquireShared()` is the entry point for acquiring a resource:

```JAVA
// AQS
public final void acquireShared(int arg) {
    if (tryAcquireShared(arg) < 0)
        doAcquireShared(arg);
}
```

`acquireShared()` first tries to acquire the resource in shared mode. If it fails, it queues and parks the current thread until it can retry. These steps use `tryAcquireShared()` and `doAcquireShared()`.

`tryAcquireShared()` is a template method whose implementation is supplied by the synchronizer. The examples below use `Semaphore` to show shared-mode acquisition.

#### Analyzing `tryAcquireShared()`

`Semaphore` supports fair and non-fair acquisition. The following analysis uses its non-fair implementation.

`Semaphore` overrides `tryAcquireShared()` to call `nonfairTryAcquireShared()`:

```JAVA
// Semaphore overrides the AQS template method.
protected int tryAcquireShared(int acquires) {
    return nonfairTryAcquireShared(acquires);
}

// Semaphore
final int nonfairTryAcquireShared(int acquires) {
    for (;;) {
        // 1. Get the number of available permits.
        int available = getState();
        // 2. Calculate the number of permits that would remain.
        int remaining = available - acquires;
        // 3. Return if permits are insufficient or CAS successfully updates state.
        if (remaining < 0 ||
            compareAndSetState(available, remaining))
            return remaining;
    }
}
```

In shared mode, AQS's `state` represents the number of available shared resources.

`nonfairTryAcquireShared()` loops until there are not enough resources or the current thread acquires them. It returns the **number of remaining resources**, with three possible outcomes:

- **Remaining resources > 0**: Acquisition succeeded, and another thread may also acquire resources.
- **Remaining resources = 0**: Acquisition succeeded, but no resources remain for another thread.
- **Remaining resources < 0**: Acquisition failed.

#### Analyzing `doAcquireShared()`

For reference, here is the `acquireShared()` entry point again:

```JAVA
// AQS
public final void acquireShared(int arg) {
    if (tryAcquireShared(arg) < 0)
        doAcquireShared(arg);
}
```

`acquireShared()` first calls `tryAcquireShared()` to try to acquire the resource.

If the return value is `< 0`, there are not enough resources and acquisition failed. AQS then calls `doAcquireShared()` to add the current thread to its queue:

```JAVA
// AQS
private void doAcquireShared(int arg) {
    // 1. Add the current thread to the wait queue.
    final Node node = addWaiter(Node.SHARED);
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            final Node p = node.predecessor();
            if (p == head) {
                // 2. If this thread is first in the queue, try to acquire the resource.
                int r = tryAcquireShared(arg);
                if (r >= 0) {
					// 3. Remove this node from the wait queue and wake successors if needed.
                    setHeadAndPropagate(node, r);
                    p.next = null; // help GC
                    if (interrupted)
                        selfInterrupt();
                    failed = false;
                    return;
                }
            }
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        // 3. If acquisition fails, cancel it and set the node state to CANCELLED.
        if (failed)
            cancelAcquire(node);
    }
}
```

Since the current thread has already failed to acquire the resource, `doAcquireShared()` wraps it in a `Node` and adds it to the queue.

The key difference between **shared mode** and **exclusive mode** is that shared mode can have more than one resource available, allowing multiple threads to hold resources at once.

In shared mode, after a thread wakes and acquires the resource, it tries to wake later threads if resources remain. `setHeadAndPropagate()` handles this:

```JAVA
// AQS
private void setHeadAndPropagate(Node node, int propagate) {
    Node h = head;
    // 1. Remove the current thread's node from the wait queue.
    setHead(node);
	// 2. Wake subsequent waiting nodes.
    if (propagate > 0 || h == null || h.waitStatus < 0 ||
        (h = head) == null || h.waitStatus < 0) {
        Node s = node.next;
        if (s == null || s.isShared())
            doReleaseShared();
    }
}
```

`setHeadAndPropagate()` wakes later nodes when the relevant conditions are met:

- `propagate > 0`: `propagate` is the number of resources left after acquisition. If it is positive, later threads may be able to acquire resources too.
- `h.waitStatus < 0`: `h` is the old `head`, saved before calling `setHead()`. A negative status means `SIGNAL` or `PROPAGATE`, either of which can require waking later nodes. `PROPAGATE` handles a concurrency edge case discussed below.

The `if` condition that decides whether to **wake later waiting nodes** is a little complex:

```JAVA
if (propagate > 0 || h == null || h.waitStatus < 0 ||
    (h = head) == null || h.waitStatus < 0)
```

- `h == null || h.waitStatus < 0`: `h == null` prevents a null pointer exception. Normally, `h` is not null because the current node has already joined the initialized queue.

  `h.waitStatus < 0` checks whether the head state is `SIGNAL` or `PROPAGATE`; checking whether it is negative is simpler.

- `(h = head) == null || h.waitStatus < 0`: Reaching this check means the earlier `h.waitStatus < 0` check failed, which may indicate concurrent activity.

  Another thread may be waking a successor and may have changed the `head` state from `SIGNAL` to `0`. The code reads `head` again; it now refers to the current thread's node, set by `setHead()`, and checks its state.

If the condition passes, `doReleaseShared()` wakes later waiting nodes:

```JAVA
private void doReleaseShared() {
    for (;;) {
        Node h = head;
        // 1. The queue must have at least one waiting node.
        if (h != null && h != tail) {
            int ws = h.waitStatus;
            // 2. If head is SIGNAL, a successor can be woken.
            if (ws == Node.SIGNAL) {
                // 2.1 Clear the head's SIGNAL state to 0, marking that its successor is being woken.
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                    continue;
                // 2.2 Wake the successor.
                unparkSuccessor(h);
            }
            // 3. If head is 0, change it to PROPAGATE to handle a concurrency edge case discussed below.
            else if (ws == 0 &&
                     !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                continue;
        }
        if (h == head)
            break;
    }
}
```

`doReleaseShared()` checks the `head` node's `waitStatus` and handles two cases:

- `head` is `SIGNAL`: It has a successor to wake. AQS uses `CAS` to change the state to `0`, marking that the wake-up has been issued.
- `head` is `0`: There may be concurrent activity, so AQS changes the state to `PROPAGATE` to ensure threads are woken correctly.

#### Why Is the `PROPAGATE` State Needed?

Step 3 of `doReleaseShared()` can be confusing: when `head` is `0`, AQS changes its state to `PROPAGATE`.

In AQS, `PROPAGATE` handles a race that could otherwise leave a waiting node unwoken. It is used only in `doReleaseShared()`.

**The following example shows why AQS needs `PROPAGATE`.**

In shared mode, resource acquisition and release follow these call chains:

- Acquisition: `acquireShared() -> tryAcquireShared() -> park and wait to be unparked -> tryAcquireShared() -> setHeadAndPropagate() -> wake successors if resources remain or head.waitStatus < 0`.

- Release: `releaseShared() -> tryReleaseShared() -> doReleaseShared()`.

**What if release does not change the `head` state from `0` to `PROPAGATE`?**

Suppose four threads try to acquire resources in shared mode, and two resources are available. Initially, `T3` and `T4` acquire them, while `T1` and `T2` wait in the queue.

- At time 1, `T1` and `T2` are waiting, while `T3` and `T4` hold resources. The queue and node states (in parentheses) are:

  `head(-1) -> T1(-1) -> T2(0)`。

- At time 2, `T3` releases its resource. `doReleaseShared()` changes the `head` state from `SIGNAL` to `0` and unparks `T1`, then `T3` exits.

  After waking, `T1` acquires a resource through `tryAcquireShared()` but has not yet called `setHeadAndPropagate()` to become the `head`. The queue is now:

  `head(0) -> T1(-1) -> T2(0)`。

- At time 3, `T4` releases its resource while `head` is `0`. If `doReleaseShared()` does nothing when `ws == 0` (that is, without `PROPAGATE`), `T4` cannot wake the successor of `head` and exits.

- At time 4, `T1` continues in `setHeadAndPropagate()`. It saves the old `head` (`waitStatus == 0`), then calls `setHead(T1)` to become the new `head`.

  Now `propagate == 0` and the old `head.waitStatus == 0`, so the first two checks fail. However, `setHead()` does not reset `waitStatus`; the new `head` (the former `T1` node) is still `-1` (`SIGNAL`). The second check, `(h = head).waitStatus < 0`, passes, so `doReleaseShared()` wakes `T2`.

  In this ordering, the second `head` check catches the case. What problem does `PROPAGATE` solve?

- At time 5, consider a more extreme interleaving: after `T1` calls `setHead(T1)` but **before** it checks the new `head.waitStatus`, `T4`'s `doReleaseShared()` calls `unparkSuccessor()` and wakes `T2`. `T2` quickly acquires a resource and calls `setHead(T2)`, becoming the new `head`. Since `T2` was the queue's tail, its `waitStatus` is `0`. When `T1` resumes and reads `head`, it sees `T2` (`waitStatus == 0`), so the second check also fails.

  In this extreme interleaving, `propagate == 0`, the old `head.waitStatus == 0`, and the new `head.waitStatus == 0`. All three checks fail, so `T1` does not call `doReleaseShared()`. If more nodes are waiting, the wake-up signal is lost.

The sequence is summarized below:

| Time   | Thread T1                                                              | Thread T2                                                 | Thread T3         | Thread T4                                                          | Wait queue                    |
| ------ | ---------------------------------------------------------------------- | --------------------------------------------------------- | ----------------- | ------------------------------------------------------------------ | ----------------------------- |
| Time 1 | Waiting                                                                | Waiting                                                   | Holds resource    | Holds resource                                                     | `head(-1) -> T1(-1) -> T2(0)` |
| Time 2 | Wakes and acquires a resource, but has not yet become `head`           | Waiting                                                   | Releases resource | Holds resource                                                     | `head(0) -> T1(-1) -> T2(0)`  |
| Time 3 |                                                                        | Waiting                                                   | Exits             | Releases resource, but cannot wake a successor while `head` is `0` | `head(0) -> T1(-1) -> T2(0)`  |
| Time 4 | Calls `setHead(T1)` but has not checked the new `head.waitStatus`      | Waiting                                                   | Exits             | Exits                                                              | `head(-1, T1 node) -> T2(0)`  |
| Time 5 |                                                                        | Wakes by T4, acquires a resource, and calls `setHead(T2)` | Exits             | Calls `doReleaseShared()` and wakes T2                             | `head(0, T2 node)`            |
| Time 6 | Reads the new `head` as T2 (`waitStatus == 0`); the second check fails | Has acquired a resource                                   | Exits             | Exits                                                              | `head(0, T2 node)`            |

**Changing the `head` state from `0` to `PROPAGATE` during release handles this race:**

The key is that `PROPAGATE` changes the state of the **old `head`**. `setHeadAndPropagate()` saves a reference to that node in local variable `h` at the start, so later concurrent changes do not replace it.

- Times 1 and 2 are the same as in the previous scenario:

  Time 1: `head(-1) -> T1(-1) -> T2(0)`.

  Time 2: `T3` releases its resource, changes the `head` state to `0`, and wakes `T1`.

- At time 3, `T4` releases its resource while `head` is `0`. `doReleaseShared()` changes the `head` state to `PROPAGATE` (`-3`), then `T4` exits. The queue is now:

  `head(PROPAGATE) -> T1(-1) -> T2(0)`。

- At time 4, `T1` continues in `setHeadAndPropagate()`. It saves the old `head` in local variable `h` (`h.waitStatus == PROPAGATE(-3)`), then calls `setHead(T1)` to become the new `head`.

- At time 5, even if the same extreme interleaving occurs (`T4` wakes `T2`, which becomes the new `head`), the checks in `T1` are:

  - `propagate > 0` → `0 > 0` → false
  - `h == null` → false
  - `h.waitStatus < 0` → `PROPAGATE(-3) < 0` → **true**！

  Because `h` still refers to the old `head`, its state is unaffected by later `setHead()` and concurrent operations. `PROPAGATE` ensures that `h.waitStatus < 0` succeeds, so `T1` calls `doReleaseShared()` to wake later nodes.

The `PROPAGATE` state prevents a wake-up signal from being lost in this extreme interleaving. The sequence is summarized below:

| Time   | Thread T1                                                                                       | Thread T2                                              | Thread T3         | Thread T4                                                    | Wait queue                           |
| ------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------- | ------------------------------------------------------------ | ------------------------------------ |
| Time 1 | Waiting                                                                                         | Waiting                                                | Holds resource    | Holds resource                                               | `head(-1) -> T1(-1) -> T2(0)`        |
| Time 2 | Wakes and acquires a resource, but has not yet become `head`                                    | Waiting                                                | Releases resource | Holds resource                                               | `head(0) -> T1(-1) -> T2(0)`         |
| Time 3 | Has not resumed                                                                                 | Waiting                                                | Exits             | Releases resource and changes `head` from `0` to `PROPAGATE` | `head(PROPAGATE) -> T1(-1) -> T2(0)` |
| Time 4 | Saves the old `head` (`waitStatus == PROPAGATE`) and calls `setHead(T1)`                        | Waiting                                                | Exits             | Exits                                                        | `head(-1, T1 node) -> T2(0)`         |
| Time 5 | `h.waitStatus < 0` (`PROPAGATE(-3) < 0`) succeeds; calls `doReleaseShared()` to wake successors | Waiting                                                | Exits             | Exits                                                        | `head(0, T1 node) -> T2(0)`          |
| Time 6 | Exits                                                                                           | Wakes, acquires a resource, and becomes the new `head` | Exits             | Exits                                                        | `head(0, T2 node)`                   |

In short, the `PROPAGATE` state and the second `head` check in `setHeadAndPropagate()` are **two safeguards** from the same JDK 7 bug fix ([JDK-6801020](https://bugs.openjdk.org/browse/JDK-6801020)). `PROPAGATE` is more reliable because it changes the old `head`, whose reference was saved in a local variable and cannot be replaced by a concurrent `setHead()` call.

### AQS Resource Release: Shared Mode

In shared mode, `releaseShared()` is the entry point for releasing a resource:

```JAVA
// AQS
public final boolean releaseShared(int arg) {
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }
    return false;
}
```

`tryReleaseShared()` is a template method provided by AQS. This example again uses `Semaphore`:

```JAVA
// Semaphore
protected final boolean tryReleaseShared(int releases) {
    for (;;) {
        int current = getState();
        int next = current + releases;
        if (next < current) // overflow
            throw new Error("Maximum permit count exceeded");
        if (compareAndSetState(current, next))
            return true;
    }
}
```

`Semaphore`'s `tryReleaseShared()` loops while trying to release resources by updating `state` with `CAS`.

If the update succeeds, the resource has been released and AQS calls `doReleaseShared()`.

`doReleaseShared()` was analyzed in detail in the shared acquisition section, so it is not repeated here.

### How Condition Queues Work

The `waitStatus` table above introduced `CONDITION` (`-2`), which means a node is waiting in a Condition queue. This section explains how that queue works.

#### What Is a Condition?

`Condition` is an interface in `java.util.concurrent.locks`. It provides thread waiting and notification similar to `Object.wait()` and `Object.notify()`, with more flexibility. A `Condition` must be used with a `Lock`, just as `wait()` and `notify()` must be used with `synchronized`.

Compared with `Object`'s `wait()` and `notify()`, `Condition` offers these benefits:

- **Multiple wait queues:** A `Lock` can create multiple `Condition` instances, allowing different threads to wait for different conditions. `synchronized` has only one wait set.
- **Uninterruptible waiting:** `Condition` provides `awaitUninterruptibly()`.
- **Timed waiting:** `awaitNanos(long)` and `await(long, TimeUnit)` let callers set a timeout.

#### The Two AQS Queues

Internally, AQS maintains **two queues**:

1. **Sync queue (CLH variant queue):** The doubly linked queue described above, which holds nodes waiting after a failed resource acquisition.
2. **Condition queue:** A singly linked list of nodes waiting after calling `Condition.await()`. Each `Condition` instance maintains its own queue.

Nodes in a Condition queue are linked through the `Node.nextWaiter` pointer. The queue's head and tail are `firstWaiter` and `lastWaiter`.

#### The Condition Workflow

AQS's inner class `ConditionObject` implements `Condition`. Its core methods are `await()` and `signal()`.

**How `await()` works:**

1. Wrap the current thread in a `Node` (`waitStatus` is set to `CONDITION`) and append it to the Condition queue.
2. Fully release the lock (set `state` to `0`) and save its previous value.
3. Park the current thread until `signal()` unparks it or it is interrupted.
4. After waking, rejoin the sync queue through `acquireQueued()`, compete for the lock, and restore the saved `state` (the reentrant hold count).

**How `signal()` works:**

1. Check that the calling thread holds the lock; otherwise, throw `IllegalMonitorStateException`.
2. Remove the first waiting node from the Condition queue.
3. Change its `waitStatus` from `CONDITION` to `0` and append it to the sync queue with `enq()`.
4. Unpark the thread directly if its predecessor in the sync queue is cancelled or if CAS fails to set the predecessor's state to `SIGNAL`.

`signalAll()` works like `signal()`, but transfers **all** nodes from the Condition queue to the sync queue.

The following example shows a common use of `Condition`: a simple bounded blocking queue.

```java
import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class SimpleBlockingQueue<T> {
    private final Queue<T> queue = new LinkedList<>();
    private final int capacity;
    private final ReentrantLock lock = new ReentrantLock();
    // Two Conditions for the queue-not-full and queue-not-empty states.
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();

    public SimpleBlockingQueue(int capacity) {
        this.capacity = capacity;
    }

    /**
     * Adds an item to the queue, waiting if it is full.
     */
    public void put(T item) throws InterruptedException {
        lock.lock();
        try {
            // Wait on notFull while the queue is full.
            while (queue.size() == capacity) {
                notFull.await();
            }
            queue.offer(item);
            // After adding an item, signal a consumer waiting on notEmpty.
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    /**
     * Removes and returns an item, waiting if the queue is empty.
     */
    public T take() throws InterruptedException {
        lock.lock();
        try {
            // Wait on notEmpty while the queue is empty.
            while (queue.isEmpty()) {
                notEmpty.await();
            }
            T item = queue.poll();
            // After removing an item, signal a producer waiting on notFull.
            notFull.signal();
            return item;
        } finally {
            lock.unlock();
        }
    }

    public static void main(String[] args) {
        SimpleBlockingQueue<Integer> blockingQueue = new SimpleBlockingQueue<>(5);

        // Producer thread.
        Thread producer = new Thread(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    blockingQueue.put(i);
                    System.out.println("Produced: " + i);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Producer");

        // Consumer thread.
        Thread consumer = new Thread(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    int item = blockingQueue.take();
                    System.out.println("Consumed: " + item);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Consumer");

        producer.start();
        consumer.start();
    }
}
```

In this example, `notFull` and `notEmpty` are separate `Condition` instances, each with its own wait queue. Producers wait on `notFull` when the queue is full, and consumers wait on `notEmpty` when it is empty. Separating the conditions avoids unnecessary wake-ups and is more efficient than using `synchronized` with `wait()` and `notifyAll()`.

#### Analyzing the `await()` Source

```java
// AQS inner class ConditionObject.
public final void await() throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    // 1. Wrap the current thread in a Node and add it to the Condition queue.
    Node node = addConditionWaiter();
    // 2. Fully release the lock and save the previous state.
    int savedState = fullyRelease(node);
    int interruptMode = 0;
    // 3. Park the current thread while its node is not in the sync queue.
    while (!isOnSyncQueue(node)) {
        LockSupport.park(this);
        if ((interruptMode = checkInterruptWhileWaiting(node)) != 0)
            break;
    }
    // 4. After waking, rejoin the sync queue and compete for the lock.
    if (acquireQueued(node, savedState) && interruptMode != THROW_IE)
        interruptMode = REINTERRUPT;
    if (node.nextWaiter != null)
        unlinkCancelledWaiters();
    if (interruptMode != 0)
        reportInterruptAfterWait(interruptMode);
}
```

`await()` has two key operations:

- `fullyRelease(node)`: Fully releases the lock rather than releasing it only once. This lets another thread acquire the lock while the current thread waits, even if it held the lock reentrantly. After waking, `acquireQueued(node, savedState)` restores the previous hold count.
- `isOnSyncQueue(node)`: Checks whether the node has moved to the sync queue. When another thread calls `signal()`, the node moves from the Condition queue to the sync queue. `isOnSyncQueue()` then returns `true`, and the thread exits the loop to compete for the lock.

### Fair and Non-Fair Lock Performance

The source analysis above used the non-fair `ReentrantLock` to explain `tryAcquire()`. `ReentrantLock` supports both fair and non-fair modes. This section compares their implementations and performance.

#### Differences in the Source

`ReentrantLock` uses a non-fair lock by default. Pass a constructor argument to use a fair lock:

```java
// Non-fair lock (default).
ReentrantLock unfairLock = new ReentrantLock();
// Fair lock.
ReentrantLock fairLock = new ReentrantLock(true);
```

The main difference is the implementation of `tryAcquire()`. The non-fair `nonfairTryAcquire()` was covered above; here is the fair implementation:

```java
// ReentrantLock.FairSync
protected final boolean tryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    if (c == 0) {
// Key difference: check whether an older thread is waiting in the sync queue.
        if (!hasQueuedPredecessors() &&
            compareAndSetState(0, acquires)) {
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    else if (current == getExclusiveOwnerThread()) {
        int nextc = c + acquires;
        if (nextc < 0)
            throw new Error("Maximum lock count exceeded");
        setState(nextc);
        return true;
    }
    return false;
}
```

The **only difference** is that the fair lock calls `hasQueuedPredecessors()` before using CAS to update `state`:

```java
// AQS
public final boolean hasQueuedPredecessors() {
    Node t = tail;
    Node h = head;
    Node s;
    return h != t &&
        ((s = h.next) == null || s.thread != Thread.currentThread());
}
```

This method checks whether another thread is already queued ahead of the current thread. If so, the current thread must wait in the queue, preserving **FIFO** fairness.

The non-fair lock skips this check. When the lock is released, a newly arriving thread can acquire it with CAS even if other threads are already waiting in the sync queue.

#### Performance Comparison

| Dimension            | Non-fair lock (default)                                                                           | Fair lock                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Throughput**       | Higher. New threads may acquire the lock directly, reducing context switches.                     | Lower. All threads queue, increasing context-switch overhead.                         |
| **Starvation**       | Possible. In extreme cases, a thread may wait a long time for the lock.                           | Less likely, but fair locks do not guarantee fair OS scheduling.                      |
| **Context switches** | Fewer. A newly arriving thread may acquire the lock after release without waking a queued thread. | More. Each release wakes the next thread in the queue.                                |
| **Use cases**        | Most scenarios where response time and throughput matter.                                         | Scenarios with strict fairness needs, such as resource allocation or task scheduling. |

**Why do non-fair locks usually perform better?**

The main reason is that they **reduce the number of context switches**. After thread A releases the lock:

- **Non-fair lock:** If thread B is trying to acquire the lock but has not joined the sync queue, it can acquire the lock with CAS and run immediately. This avoids waking a queued thread. A queued thread may wake, find the lock held, and park again, but overall there are fewer context switches.
- **Fair lock:** Thread B must join the queue, and the thread at the head is woken. There is **scheduling latency** between a thread being unparked and actually running. During that time, the lock is idle, reducing utilization.

Doug Lea notes in the `ReentrantLock` documentation that fair locks usually have lower throughput than non-fair locks under contention, which is why `ReentrantLock` defaults to non-fair mode. A fair lock may be a better choice when request order matters or starvation must be reduced, such as when assigning connections from a pool.

The following example demonstrates the difference in behavior between fair and non-fair locks:

```java
import java.util.concurrent.locks.ReentrantLock;

public class FairVsUnfairLockDemo {
    // Test fair and non-fair locks.
    private static void testLock(ReentrantLock lock, String lockType) {
        System.out.println("=== " + lockType + " ===");
        Runnable task = () -> {
            for (int i = 0; i < 2; i++) {
                lock.lock();
                try {
                    System.out.println(Thread.currentThread().getName() + " acquired the lock");
                } finally {
                    lock.unlock();
                }
            }
        };

        Thread[] threads = new Thread[5];
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(task, lockType + "-thread-" + i);
        }
        for (Thread t : threads) {
            t.start();
        }
        for (Thread t : threads) {
            try { t.join(); } catch (InterruptedException e) { }
        }
        System.out.println();
    }

    public static void main(String[] args) {
        // Non-fair lock: the same thread may acquire the lock repeatedly.
        testLock(new ReentrantLock(false), "non-fair lock");

        // Fair lock: when there is contention, threads that waited longer tend to acquire first.
        testLock(new ReentrantLock(true), "fair lock");
    }
}
```

Running the code usually shows that the same thread is more likely to acquire the lock repeatedly in non-fair mode because it can compete again before a queued thread wakes. In fair mode, the lock tends to go to waiting threads in queue order. However, lock fairness does not guarantee fair OS scheduling: a thread may still acquire repeatedly if other threads have not yet started waiting.

## Common Synchronizers

### Semaphore

#### Overview

`synchronized` and `ReentrantLock` allow only one thread at a time to access a resource. A `Semaphore` controls how many threads can access a resource concurrently.

Suppose `N` threads (`N > 5`) try to acquire resources from a `Semaphore`. The example below allows at most five threads to acquire a permit at once. The remaining threads block until a permit is released.

```java
// Initial number of shared permits.
final Semaphore semaphore = new Semaphore(5);
// Acquire one permit.
semaphore.acquire();
// Release one permit.
semaphore.release();
```

With one initial permit, a `Semaphore` behaves like an exclusive lock.

`Semaphore` supports two modes:

- **Fair mode:** When there is contention, blocking `acquire()` queues threads and selects them in FIFO order. This does not guarantee strict ordering by wall-clock call time. The no-argument `tryAcquire()` does not honor the fairness setting and may still barge ahead.
- **Non-fair mode:** Threads may acquire a permit without waiting for their turn in the queue.

`Semaphore` provides these two constructors:

```java
public Semaphore(int permits) {
    sync = new NonfairSync(permits);
}

public Semaphore(int permits, boolean fair) {
    sync = fair ? new FairSync(permits) : new NonfairSync(permits);
}
```

**Both constructors require the number of permits. The second also lets you choose fair or non-fair mode; the default is non-fair.**

`Semaphore` is often used when access to a resource has a fixed limit, such as rate limiting within a single process. Distributed rate limiting generally requires a shared system such as Redis.

#### How It Works

`Semaphore` is a shared synchronizer. It initializes AQS `state` to `permits`, the number of available permits. A thread must acquire a permit before proceeding.

For example, when a thread calls `semaphore.acquire()`, it tries to get a permit. If `state > 0`, a permit may be available; if `state <= 0`, no permit is available.

If acquisition may succeed (`state > 0`), the thread uses CAS to decrement `state`. If it cannot acquire a permit, AQS adds a node to the wait queue and parks the thread.

```java
// Acquire one permit.
public void acquire() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}

// Acquire one or more permits.
public void acquire(int permits) throws InterruptedException {
    if (permits < 0) throw new IllegalArgumentException();
    sync.acquireSharedInterruptibly(permits);
}
```

`acquireSharedInterruptibly()` is implemented by `AbstractQueuedSynchronizer`:

```java
// Acquires permits in shared mode. Returns on success; otherwise queues and parks the thread.
public final void acquireSharedInterruptibly(int arg)
    throws InterruptedException {
    if (Thread.interrupted())
      throw new InterruptedException();
        // Try to acquire arg permits. If acquisition fails, enqueue a node and park the current thread.
    if (tryAcquireShared(arg) < 0)
      doAcquireSharedInterruptibly(arg);
}
```

Here is how `tryAcquireShared()` works in non-fair mode (`NonfairSync`):

```java
// Tries to acquire a resource in shared mode (a permit in Semaphore).
protected int tryAcquireShared(int acquires) {
    return nonfairTryAcquireShared(acquires);
}

// Acquires permits in non-fair shared mode.
final int nonfairTryAcquireShared(int acquires) {
    for (;;) {
        // Number of permits currently available.
        int available = getState();
        /*
         * Try to acquire permits. If none are available, return a negative value.
         * Otherwise, try again with the latest value if the CAS operation fails.
         */
        int remaining = available - acquires;
        if (remaining < 0 ||
            compareAndSetState(available, remaining))
            return remaining;
    }
}
```

When a thread calls `semaphore.release()`, it uses CAS to increment `state`. After a permit is released, a waiting thread may be unparked and retry acquisition. If a permit is available, it decrements `state` and proceeds; otherwise, it waits again.

```java
// Release one permit.
public void release() {
    sync.releaseShared(1);
}

// Release one or more permits.
public void release(int permits) {
    if (permits < 0) throw new IllegalArgumentException();
    sync.releaseShared(permits);
}
```

`releaseShared()` is implemented by `AbstractQueuedSynchronizer`:

```java
// Releases the shared resource.
// If tryReleaseShared returns true, wakes one or more threads in the wait queue.
public final boolean releaseShared(int arg) {
    // Release the shared resource.
    if (tryReleaseShared(arg)) {
      // Wake successors waiting after the current node.
      doReleaseShared();
      return true;
    }
    return false;
}
```

`Semaphore`'s inner `Sync` class overrides `tryReleaseShared()`. The default implementation in `AbstractQueuedSynchronizer` throws `UnsupportedOperationException`.

```java
// Overridden in the inner Sync class.
// Tries to release the resource.
protected final boolean tryReleaseShared(int releases) {
    for (;;) {
        int current = getState();
        // Increase the number of available permits.
        int next = current + releases;
        if (next < current) // overflow
            throw new Error("Maximum permit count exceeded");
         // Update state with CAS.
        if (compareAndSetState(current, next))
            return true;
    }
}
```

The methods above are implemented through the `sync` synchronizer. `Sync` extends `AbstractQueuedSynchronizer` and overrides some of its methods. It has two subclasses: `NonfairSync` and `FairSync`.

```java
private static final class Sync extends AbstractQueuedSynchronizer {
  // ...
}
static final class NonfairSync extends Sync {
  // ...
}
static final class FairSync extends Sync {
  // ...
}
```

#### Example

```java
public class SemaphoreExample {
  // Number of requests.
  private static final int threadCount = 550;

  public static void main(String[] args) throws InterruptedException {
    // Create a fixed-size thread pool. Too few threads can slow this example down.
    ExecutorService threadPool = Executors.newFixedThreadPool(300);
    // Initial number of permits.
    final Semaphore semaphore = new Semaphore(20);

    for (int i = 0; i < threadCount; i++) {
      final int threadnum = i;
      threadPool.execute(() -> { // Lambda expression.
        try {
          semaphore.acquire(); // Acquire one permit, allowing up to 20 tasks to run at once.
          test(threadnum);
          semaphore.release(); // Release one permit.
        } catch (InterruptedException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }

      });
    }
    threadPool.shutdown();
    System.out.println("finish");
  }

  public static void test(int threadnum) throws InterruptedException {
    Thread.sleep(1000); // Simulate request processing time.
    System.out.println("threadnum:" + threadnum);
    Thread.sleep(1000); // Simulate request processing time.
  }
}
```

`acquire()` blocks until a permit is available, then takes one. Each call to `release()` adds a permit and may unblock an `acquire()` call. A `Semaphore` does not create permit objects; it tracks only the number of available permits. It is often used to limit how many threads can access a resource.

You can also acquire and release multiple permits at once:

```java
semaphore.acquire(5); // Acquire five permits, allowing up to four tasks to run at once.
test(threadnum);
semaphore.release(5); // Release five permits.
```

Another commonly used method is `tryAcquire()`, which returns `false` immediately if no permit is available.

[Additional details in issue 645](https://github.com/Snailclimb/JavaGuide/issues/645):

> `Semaphore` is based on AQS and controls how many threads can access a resource concurrently. Its constructor uses `permits` to initialize AQS `state`, which represents the available permits. A thread calling `acquire()` attempts to decrement `state` atomically. If the result is nonnegative, acquisition succeeds and the thread can proceed. If the result is negative, the thread has reached the permit limit and is parked in the AQS wait queue, **rather than spinning**. When another thread finishes and calls `release()`, `state` is incremented atomically and one or more waiting threads are unparked. Those threads retry `acquire()` and compete for available permits. Thus, `Semaphore` limits concurrent access by tracking permits, not by spinning or using an exclusive lock.

### CountDownLatch

#### Overview

`CountDownLatch` lets threads wait until a count reaches zero, usually after a set of tasks has completed.

`CountDownLatch` is one-shot. Its count is initialized in the constructor and cannot be reset, so it cannot be reused after the count reaches zero.

#### How It Works

`CountDownLatch` is a shared synchronizer. Its constructor initializes AQS `state` to `count`, as shown in the constructor below.

```java
public CountDownLatch(int count) {
    if (count < 0) throw new IllegalArgumentException("count < 0");
    this.sync = new Sync(count);
}

private static final class Sync extends AbstractQueuedSynchronizer {
    Sync(int count) {
        setState(count);
    }
  //...
}
```

When a thread calls `countDown()`, it uses `tryReleaseShared()` to decrement `state` with CAS until it reaches `0`. At that point, waiting threads are unparked and can continue.

```java
public void countDown() {
    // Sync is an inner class of CountDownLatch that extends AbstractQueuedSynchronizer.
    sync.releaseShared(1);
}
```

`releaseShared()` is implemented by `AbstractQueuedSynchronizer`:

```java
// Releases the shared resource.
// If tryReleaseShared returns true, wakes one or more threads in the wait queue.
public final boolean releaseShared(int arg) {
    // Release the shared resource.
    if (tryReleaseShared(arg)) {
      // Wake successors waiting after the current node.
      doReleaseShared();
      return true;
    }
    return false;
}
```

`CountDownLatch`'s inner `Sync` class overrides `tryReleaseShared()`. The default implementation in `AbstractQueuedSynchronizer` throws `UnsupportedOperationException`.

```java
// Decrements state until it reaches 0.
// countDown returns true only when the count reaches 0.
protected boolean tryReleaseShared(int releases) {
    // Repeatedly check whether state is 0.
    for (;;) {
        int c = getState();
        // If state is already 0, return false.
        if (c == 0)
            return false;
        // Decrement state.
        int nextc = c-1;
        // Update state with CAS.
        if (compareAndSetState(c, nextc))
            return nextc == 0;
    }
}
```

When `await()` is called, a nonzero `state` means the tasks are not complete, so the calling thread blocks and does not continue past `await()`. The main thread joins AQS's CLH variant queue. Each `countDown()` checks and updates `state` with CAS; when it reaches `0`, all waiting threads are released and can continue.

```java
// Wait (sometimes described as acquiring the synchronizer).
public void await() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}
// Wait with a timeout.
public boolean await(long timeout, TimeUnit unit)
    throws InterruptedException {
    return sync.tryAcquireSharedNanos(1, unit.toNanos(timeout));
}
```

`acquireSharedInterruptibly()` is implemented by `AbstractQueuedSynchronizer`:

```java
// Tries to acquire the synchronizer. Returns on success; otherwise queues and parks the thread.
public final void acquireSharedInterruptibly(int arg)
    throws InterruptedException {
    if (Thread.interrupted())
      throw new InterruptedException();
        // Try to acquire the synchronizer; return on success.
    if (tryAcquireShared(arg) < 0)
      // On failure, join the wait queue and park.
      doAcquireSharedInterruptibly(arg);
}
```

`CountDownLatch`'s inner `Sync` class overrides `tryAcquireShared()`. It returns `1` if `state` is `0`, and `-1` otherwise.

```java
protected int tryAcquireShared(int acquires) {
    return (getState() == 0) ? 1 : -1;
}
```

#### Examples

**Two common uses of `CountDownLatch`:**

1. **Wait for tasks to finish before proceeding:** Initialize the latch to `n` with `new CountDownLatch(n)`. Each task calls `countDown()` when it finishes. When the count reaches zero, the thread waiting in `await()` is unparked. For example, a service's main thread can wait for several components to finish loading.
2. **Start several threads together:** Initialize a shared latch to `1` with `new CountDownLatch(1)`. Each thread calls `await()` before starting its task. When the main thread calls `countDown()`, all waiting threads are unparked together, like runners waiting for a starting signal.

**`CountDownLatch` example:**

```java
public class CountDownLatchExample {
  // Number of requests.
  private static final int THREAD_COUNT = 550;

  public static void main(String[] args) throws InterruptedException {
    // Create a fixed-size thread pool. Too few threads can slow this example down.
    // For real use, configure the pool size for your workload.
    ExecutorService threadPool = Executors.newFixedThreadPool(300);
    final CountDownLatch countDownLatch = new CountDownLatch(THREAD_COUNT);
    for (int i = 0; i < THREAD_COUNT; i++) {
      final int threadNum = i;
      threadPool.execute(() -> {
        try {
          test(threadNum);
        } catch (InterruptedException e) {
          e.printStackTrace();
        } finally {
          // Mark this request as complete.
          countDownLatch.countDown();
        }

      });
    }
    countDownLatch.await();
    threadPool.shutdown();
    System.out.println("finish");
  }

  public static void test(int threadnum) throws InterruptedException {
    Thread.sleep(1000);
    System.out.println("threadNum:" + threadnum);
    Thread.sleep(1000);
  }
}
```

The example submits 550 requests. It prints `finish` only after all 550 requests have completed.

The main thread first waits for the other threads. After starting them, it calls `CountDownLatch.await()` and blocks until they finish their tasks.

The other N threads need a reference to the latch so they can signal completion with `CountDownLatch.countDown()`. Each call decrements the count initialized by the constructor. When all N threads have called it, the count reaches zero and the main thread resumes from `await()`.

Using `CountDownLatch.await()` incorrectly can cause a deadlock. For example, if the loop above is changed to:

```java
for (int i = 0; i < threadCount-1; i++) {
.......
}
```

The count can then never reach zero, so the main thread waits indefinitely.

### CyclicBarrier

#### Overview

`CyclicBarrier` is similar to `CountDownLatch`: it lets threads wait for one another, with a more flexible feature set. Their use cases are also similar.

> `CountDownLatch` is based on AQS. `CyclicBarrier` uses `ReentrantLock` (which is also an AQS synchronizer) and `Condition`.

`CyclicBarrier` is a reusable barrier. It blocks a group of threads when they reach a synchronization point. Once the last thread arrives, the barrier opens and all waiting threads continue.

#### How It Works

`CyclicBarrier` uses `count` as a counter, initialized to the value of `parties`. Each arriving thread decrements it. When it reaches zero, the last thread has arrived, and the barrier runs the action supplied to the constructor, if any.

```java
// Number of threads required at each barrier.
private final int parties;
// Counter.
private int count;
```

Here is a brief look at the source.

1. The default constructor is `CyclicBarrier(int parties)`. `parties` is the number of threads that must reach the barrier. Each thread calls `await()` to signal that it has arrived, then blocks.

```java
public CyclicBarrier(int parties) {
    this(parties, null);
}

public CyclicBarrier(int parties, Runnable barrierAction) {
    if (parties <= 0) throw new IllegalArgumentException();
    this.parties = parties;
    this.count = parties;
    this.barrierCommand = barrierAction;
}
```

`parties` is the required number of threads. Once that many threads arrive, the barrier opens and they all proceed.

2. Calling `await()` on a `CyclicBarrier` invokes `dowait(false, 0L)`. The barrier blocks each thread until the number of arrivals reaches `parties`, then lets them proceed.

```java
public int await() throws InterruptedException, BrokenBarrierException {
  try {
      return dowait(false, 0L);
  } catch (TimeoutException toe) {
      throw new Error(toe); // cannot happen
  }
}
```

Here is the `dowait(false, 0L)` implementation:

```java
    // Code after await runs when the number of arriving threads reaches count.
    private int count;
    /**
     * Main barrier code, covering the various policies.
     */
    private int dowait(boolean timed, long nanos)
        throws InterruptedException, BrokenBarrierException,
               TimeoutException {
        final ReentrantLock lock = this.lock;
        // Acquire the lock.
        lock.lock();
        try {
            final Generation g = generation;

            if (g.broken)
                throw new BrokenBarrierException();

            // Throw if the thread was interrupted.
            if (Thread.interrupted()) {
                breakBarrier();
                throw new InterruptedException();
            }
            // Decrement count.
            int index = --count;
            // When count reaches 0, the last thread has arrived and the barrier can open.
            if (index == 0) {  // tripped
                boolean ranAction = false;
                try {
                    final Runnable command = barrierCommand;
                    if (command != null)
                        command.run();
                    ranAction = true;
                    // Reset count to the initial parties value.
                    // Wake the threads that were waiting.
                    // Start the next generation.
                    nextGeneration();
                    return 0;
                } finally {
                    if (!ranAction)
                        breakBarrier();
                }
            }

            // loop until tripped, broken, interrupted, or timed out
            for (;;) {
                try {
                    if (!timed)
                        trip.await();
                    else if (nanos > 0L)
                        nanos = trip.awaitNanos(nanos);
                } catch (InterruptedException ie) {
                    if (g == generation && ! g.broken) {
                        breakBarrier();
                        throw ie;
                    } else {
                        // We're about to finish waiting even if we had not
                        // been interrupted, so this interrupt is deemed to
                        // "belong" to subsequent execution.
                        Thread.currentThread().interrupt();
                    }
                }

                if (g.broken)
                    throw new BrokenBarrierException();

                if (g != generation)
                    return index;

                if (timed && nanos <= 0L) {
                    breakBarrier();
                    throw new TimeoutException();
                }
            }
        } finally {
            lock.unlock();
        }
    }
```

#### Examples

Example 1:

```java
public class CyclicBarrierExample1 {
  // Number of requests.
  private static final int threadCount = 550;
  // Number of threads that must synchronize.
  private static final CyclicBarrier cyclicBarrier = new CyclicBarrier(5);

  public static void main(String[] args) throws InterruptedException {
    // Create a thread pool.
    ExecutorService threadPool = Executors.newFixedThreadPool(10);

    for (int i = 0; i < threadCount; i++) {
      final int threadNum = i;
      Thread.sleep(1000);
      threadPool.execute(() -> {
        try {
          test(threadNum);
        } catch (InterruptedException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        } catch (BrokenBarrierException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
      });
    }
    threadPool.shutdown();
  }

  public static void test(int threadnum) throws InterruptedException, BrokenBarrierException {
    System.out.println("threadnum:" + threadnum + "is ready");
    try {
      /** Wait up to 60 seconds for the worker threads to arrive. */
      cyclicBarrier.await(60, TimeUnit.SECONDS);
    } catch (Exception e) {
      System.out.println("-----CyclicBarrierException------");
    }
    System.out.println("threadnum:" + threadnum + "is finish");
  }

}
```

The output looks like this:

```plain
threadnum:0is ready
threadnum:1is ready
threadnum:2is ready
threadnum:3is ready
threadnum:4is ready
threadnum:4is finish
threadnum:0is finish
threadnum:1is finish
threadnum:2is finish
threadnum:3is finish
threadnum:5is ready
threadnum:6is ready
threadnum:7is ready
threadnum:8is ready
threadnum:9is ready
threadnum:9is finish
threadnum:5is finish
threadnum:8is finish
threadnum:7is finish
threadnum:6is finish
......
```

The code after `await()` runs once the five required threads have arrived.

`CyclicBarrier` also provides `CyclicBarrier(int parties, Runnable barrierAction)`. It runs `barrierAction` when the threads reach the barrier, which can be useful for more complex tasks.

Example 2:

```java
public class CyclicBarrierExample2 {
  // Number of requests.
  private static final int threadCount = 550;
  // Number of threads that must synchronize.
  private static final CyclicBarrier cyclicBarrier = new CyclicBarrier(5, () -> {
    System.out.println("------Barrier action runs after all threads arrive------");
  });

  public static void main(String[] args) throws InterruptedException {
    // Create a thread pool.
    ExecutorService threadPool = Executors.newFixedThreadPool(10);

    for (int i = 0; i < threadCount; i++) {
      final int threadNum = i;
      Thread.sleep(1000);
      threadPool.execute(() -> {
        try {
          test(threadNum);
        } catch (InterruptedException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        } catch (BrokenBarrierException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
      });
    }
    threadPool.shutdown();
  }

  public static void test(int threadnum) throws InterruptedException, BrokenBarrierException {
    System.out.println("threadnum:" + threadnum + "is ready");
    cyclicBarrier.await();
    System.out.println("threadnum:" + threadnum + "is finish");
  }

}
```

The output looks like this:

```plain
threadnum:0is ready
threadnum:1is ready
threadnum:2is ready
threadnum:3is ready
threadnum:4is ready
------Barrier action runs after all threads arrive------
threadnum:4is finish
threadnum:0is finish
threadnum:2is finish
threadnum:1is finish
threadnum:3is finish
threadnum:5is ready
threadnum:6is ready
threadnum:7is ready
threadnum:8is ready
threadnum:9is ready
------Barrier action runs after all threads arrive------
threadnum:9is finish
threadnum:5is finish
threadnum:6is finish
threadnum:8is finish
threadnum:7is finish
......
```

## References

- A Detailed Guide to AQS: <https://www.cnblogs.com/waterystone/p/4920797.html>
- AQS Principles and Applications Through ReentrantLock: <https://tech.meituan.com/2019/12/05/aqs-theory-and-apply.html>

<!-- @include: @article-footer.snippet.md -->

```

```
