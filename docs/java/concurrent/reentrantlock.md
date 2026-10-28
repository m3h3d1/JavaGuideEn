---
title: AQS Principles and Applications Through ReentrantLock
description: An in-depth look at ReentrantLock and AQS, including reentrant locking, fair and non-fair locks, AQS-based acquisition and release, and comparison with synchronized.
category: Java
tag:
  - Java Concurrency
head:
  - - meta
    - name: keywords
      content: ReentrantLock, AQS, fair lock, non-fair lock, reentrant lock, lock and unlock, ReentrantLock principles, synchronized comparison
---

> Reproduced from: <https://tech.meituan.com/2019/12/05/aqs-theory-and-apply.html>
>
> Author: Meituan Technical Team

Most Java synchronizers, including `Semaphore` and `ReentrantLock`, are built on AbstractQueuedSynchronizer (AQS). AQS is a framework that provides atomic management of synchronization state, thread blocking and signaling, and a queue model.

This article moves from practical usage to implementation details. It uses ReentrantLock's features and its relationship with AQS to explain exclusive-mode synchronizers, with questions and answers to aid understanding. Due to space constraints, it focuses on AQS's exclusive mode and synchronization queue; shared mode and condition queues are not covered in detail. The focus is AQS, with only a brief introduction to ReentrantLock.

> The source analysis is based on JDK 8. AQS's implementation has continued to evolve: most fields and methods discussed here are still present in JDK 11, while node fields and queueing and waiting implementations changed substantially in JDK 17 and later. The core ideas of synchronization state, wait queues, and acquiring and releasing resources remain useful for understanding AQS.

## 1 ReentrantLock

### 1.1 ReentrantLock at a Glance

`ReentrantLock` is a reentrant lock: one thread can acquire the same lock repeatedly. To understand its features, let's compare it with the commonly used `synchronized`. The comparison is shown below; the blue sections are the focus of this article.

![](https://p0.meituan.net/travelcube/412d294ff5535bbcddc0d979b2a339e6102264.png)

The following pseudocode makes the comparison more concrete:

```java
// **************************How to use synchronized**************************
// 1. For a code block
synchronized (this) {}
// 2. For an object
synchronized (object) {}
// 3. For a method
public synchronized void test () {}
// 4. Reentrant
for (int i = 0; i < 100; i++) {
  synchronized (this) {}
}
// **************************How to use ReentrantLock**************************
public void test () throws Exception {
  // 1. Choose a fair or non-fair lock at initialization
  ReentrantLock lock = new ReentrantLock(true);
  // 2. Can be used around a code block
  lock.lock();
  try {
    // 3. Supports flexible acquisition methods and is reentrant
    if (lock.tryLock(100, TimeUnit.MILLISECONDS)) {
      try {
        // Logic executed after acquiring the lock a second time
      } finally {
        // Release the lock once for each successful acquisition
        lock.unlock();
      }
    }
  } finally {
    lock.unlock();
  }
}
```

### 1.2 How ReentrantLock Relates to AQS

As discussed above, ReentrantLock supports both fair and non-fair locks, and is built on AQS. For an explanation of fair and non-fair lock behavior, see [Java Locks](https://mp.weixin.qq.com/s?__biz=MjM5NjQ5MTI5OA==&mid=2651749434&idx=3&sn=5ffa63ad47fe166f2f1a9f604ed10091&chksm=bd12a5778a652c61509d9e718ab086ff27ad8768586ea9b38c3dcf9e017a8e49bcae3df9bcc8&scene=38#wechat_redirect). Let's trace how the fair and non-fair acquisition paths connect to AQS. Their relationship is especially clear during acquisition; release is covered later.

The non-fair lock's acquisition flow is:

```java
// java.util.concurrent.locks.ReentrantLock#NonfairSync

// Non-fair lock
static final class NonfairSync extends Sync {
  ...
  final void lock() {
    if (compareAndSetState(0, 1))
      setExclusiveOwnerThread(Thread.currentThread());
    else
      acquire(1);
    }
  ...
}
```

This code means:

- If CAS successfully updates `state` (the synchronization state), the thread has acquired the lock and becomes the exclusive owner.
- If CAS fails to update `state`, the thread did not acquire the lock and proceeds to `acquire` for further handling.

The first step is straightforward, but what happens after acquisition fails? Consider these questions:

- What happens after a thread fails to acquire the lock? There are two possibilities:

(1) Mark the acquisition as failed and end the process. This would greatly reduce concurrency and does not meet practical needs, so AQS uses the second approach.

(2) Use a queueing mechanism. The thread continues waiting and retains the possibility of acquiring the lock.

- If threads wait in a queue, what data structure is used?
- When can a queued thread get a chance to acquire the lock?
- If a queued thread cannot acquire the lock, must it wait indefinitely, or is there another strategy?

With these questions in mind, let's look at how the fair lock acquires the lock:

```java
// java.util.concurrent.locks.ReentrantLock#FairSync

static final class FairSync extends Sync {
  ...
  final void lock() {
    acquire(1);
  }
  ...
}
```

This code raises a question: `lock` calls `acquire`, but how does `acquire` actually obtain the lock?

Although the fair and non-fair acquisition paths differ, both call `acquire`, a core method in AQS, the parent class of `FairSync` and `NonfairSync`.

The answers to the questions above are not in ReentrantLock's source; they are in AbstractQueuedSynchronizer, which defines `acquire`. AQS is the focus of this article. The following sections explain AQS and its relationship with ReentrantLock in more detail; the questions are answered in Section 2.3.5.

## 2 AQS

First, the diagram below gives an overview of the AQS framework:

![](https://p1.meituan.net/travelcube/82077ccf14127a87b77cefd1ccf562d3253591.png)

- Colored items in the diagram are methods; uncolored items are attributes.
- The AQS framework has five layers, from the public API at the top to the underlying data at the bottom.
- A custom synchronizer only needs to override the required methods in the first layer; it does not need to manage the lower-level implementation. When it acquires or releases a lock, it enters AQS through the first-layer API, proceeds to lock acquisition in the second layer, and, if acquisition fails, uses the wait-queue handling in the third and fourth layers. Those operations rely on the underlying data in the fifth layer.

The following walkthrough examines AQS from the overall flow down to individual methods:

![](https://p1.meituan.net/travelcube/d2f7f7fffdc30d85d17b44266c3ab05323338.png)

### 2.1 Principles at a Glance

The core idea of AQS is to make the requesting thread the active worker and mark the shared resource as locked when it is available. If the resource is already occupied, a blocking and signaling mechanism manages lock allocation. AQS implements this primarily with a variant of a CLH queue, adding threads that cannot acquire the lock to a wait queue.

CLH (Craig, Landin, and Hagersten) is a singly linked queue. AQS uses a variant implemented as a virtual FIFO doubly linked queue. It represents each thread requesting a shared resource as a node to manage lock allocation.

The main idea is illustrated below:

![](https://p0.meituan.net/travelcube/7132e4cef44c26f62835b197b239147b18062.png)

AQS uses a `volatile int` field to represent synchronization state, an internal FIFO queue to manage threads waiting to acquire resources, and CAS to update `state`.

#### 2.1.1 AQS Data Structure

The most basic AQS data structure is `Node`, a node in the CLH queue variant shown above.

![](https://p1.meituan.net/travelcube/960271cf2b5c8a185eed23e98b72c75538637.png)

The following table explains the methods and fields:

| Method or field | Meaning                                                                                          |
| :-------------- | :----------------------------------------------------------------------------------------------- |
| `waitStatus`    | The node's state in the queue.                                                                   |
| `thread`        | The thread associated with the node.                                                             |
| `prev`          | Pointer to the predecessor.                                                                      |
| `predecessor`   | Returns the predecessor, or throws `NullPointerException` if there is none.                      |
| `nextWaiter`    | Points to the next node in `CONDITION` state. Condition queues are outside this article's scope. |
| `next`          | Pointer to the successor.                                                                        |

The two lock modes for threads are:

| Mode        | Meaning                                          |
| :---------- | :----------------------------------------------- |
| `SHARED`    | The thread waits for the lock in shared mode.    |
| `EXCLUSIVE` | The thread waits for the lock in exclusive mode. |

`waitStatus` has these values:

| Value       | Meaning                                                                          |
| :---------- | :------------------------------------------------------------------------------- |
| `0`         | Default value when a node is initialized.                                        |
| `CANCELLED` | `1`: The thread's acquisition request was cancelled.                             |
| `CONDITION` | `-2`: The node is in a condition queue and its thread is waiting to be signaled. |
| `PROPAGATE` | `-3`: Used when the current thread is in shared mode.                            |
| `SIGNAL`    | `-1`: The thread is ready and waiting for the resource to be released.           |

#### 2.1.2 Synchronization State

Next is AQS's synchronization state. AQS maintains a `volatile` field named `state` to represent whether the critical resource is held.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private volatile int state;
```

The following methods access this field:

| Method                                                               | Description                |
| :------------------------------------------------------------------- | :------------------------- |
| `protected final int getState()`                                     | Gets the value of `state`. |
| `protected final void setState(int newState)`                        | Sets the value of `state`. |
| `protected final boolean compareAndSetState(int expect, int update)` | Updates `state` with CAS.  |

These methods are `final`, so subclasses cannot override them. Custom synchronizers implement exclusive or shared locking by changing the synchronization state represented by `state`.

![](https://p0.meituan.net/travelcube/27605d483e8935da683a93be015713f331378.png)

![](https://p0.meituan.net/travelcube/3f1e1a44f5b7d77000ba4f9476189b2e32806.png)

Custom synchronizers define how to acquire and release synchronization state in the first layer of the AQS architecture: the API layer.

### 2.2 Key AQS Methods and Their Relationship to ReentrantLock

As shown in the architecture diagram, AQS provides protected methods for custom synchronizers. A synchronizer implements the relevant methods to provide exclusive or shared access by changing `state`. The following methods are available; ReentrantLock implements only those it needs:

| Method                                        | Description                                                                                                                                                       |
| :-------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `protected boolean isHeldExclusively()`       | Whether the current thread exclusively holds the resource. Implement this only when using `Condition`.                                                            |
| `protected boolean tryAcquire(int arg)`       | Exclusive mode. Attempts to acquire the resource; returns `true` on success and `false` on failure.                                                               |
| `protected boolean tryRelease(int arg)`       | Exclusive mode. Attempts to release the resource; returns `true` on success and `false` on failure.                                                               |
| `protected int tryAcquireShared(int arg)`     | Shared mode. A negative value indicates failure; zero indicates success with no remaining resources; a positive value indicates success with resources remaining. |
| `protected boolean tryReleaseShared(int arg)` | Shared mode. Attempts to release the resource; returns `true` if the release may allow waiting nodes to wake, otherwise `false`.                                  |

Typically, a custom synchronizer uses either exclusive or shared mode and implements only one pair: `tryAcquire`/`tryRelease` or `tryAcquireShared`/`tryReleaseShared`. AQS also supports synchronizers that implement both modes, such as `ReentrantReadWriteLock`. ReentrantLock is exclusive, so it implements `tryAcquire` and `tryRelease`.

Using the non-fair lock as an example, the following section outlines how its methods connect to AQS. Each core method is explained in detail later.

![](https://p1.meituan.net/travelcube/b8b53a70984668bc68653efe9531573e78636.png)

> 🐛 Correction (see [issue #1761](https://github.com/Snailclimb/JavaGuide/issues/1761)): The diagram contains a small error. After CAS successfully updates the shared `state`, the non-fair lock has been acquired.
>
> The corresponding source code is:
>
> ```java
> final boolean nonfairTryAcquire(int acquires) {
>          final Thread current = Thread.currentThread();// Get the current thread
>          int c = getState();
>          if (c == 0) {
>              if (compareAndSetState(0, acquires)) {// Try to acquire the lock with CAS
>                  setExclusiveOwnerThread(current);// Set the current thread as the exclusive owner
>                  return true;// Lock acquired
>              }
>          }
>          else if (current == getExclusiveOwnerThread()) {
>              int nextc = c + acquires;
>              if (nextc < 0) // overflow
>                  throw new Error("Maximum lock count exceeded");
>              setState(nextc);
>              return true;
>          }
>          return false;
>      }
> ```

To clarify how ReentrantLock and AQS methods interact, the following walkthrough separates the acquisition and release flows for a non-fair lock.

![](https://p1.meituan.net/travelcube/7aadb272069d871bdee8bf3a218eed8136919.png)

Acquisition:

- Call ReentrantLock's `lock` method to acquire the lock.
- This calls `lock` on the inner `Sync` class. Since `Sync.lock` is abstract, the fair or non-fair implementation selected at construction is used. Both paths ultimately call AQS's `acquire` method.
- AQS's `acquire` calls `tryAcquire`. Because a custom synchronizer must implement `tryAcquire`, ReentrantLock provides this method in its fair and non-fair inner classes. The implementation depends on the lock type.
- `tryAcquire` handles lock acquisition. If it fails, AQS handles the remaining queueing and waiting logic.

Release:

- Call ReentrantLock's `unlock` method to release the lock.
- `unlock` calls `release` on the inner `Sync` class, inherited from AQS.
- `release` calls `tryRelease`, which a custom synchronizer must implement. ReentrantLock implements it in `Sync`, so release does not differ between fair and non-fair locks.
- After a successful release, AQS handles the remaining processing.

The description above summarizes the API-level method mapping for ReentrantLock acquisition and release.

![](https://p0.meituan.net/travelcube/f30c631c8ebbf820d3e8fcb6eee3c0ef18748.png)

## 3 Understanding AQS Through ReentrantLock

Fair and non-fair ReentrantLock implementations share most of their underlying logic. This section uses the non-fair lock as an example.

The non-fair lock contains this code:

```java
// java.util.concurrent.locks.ReentrantLock

static final class NonfairSync extends Sync {
  ...
  final void lock() {
    if (compareAndSetState(0, 1))
      setExclusiveOwnerThread(Thread.currentThread());
    else
      acquire(1);
  }
  ...
}
```

Here is the implementation of `acquire`:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

public final void acquire(int arg) {
  if (!tryAcquire(arg) && acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
    selfInterrupt();
}
```

Now look at `tryAcquire`:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

protected boolean tryAcquire(int arg) {
  throw new UnsupportedOperationException();
}
```

This is a basic AQS implementation. The fair and non-fair synchronizers provide the actual acquisition logic. If `tryAcquire` returns `true`, the thread acquired the lock and no further work is needed. If it fails, the thread must join the wait queue. The following sections explain when and how that happens.

### 3.1 Adding Threads to the Wait Queue

#### 3.1.1 When a Thread Joins the Queue

When `acquire(1)` runs, it attempts to obtain the lock through `tryAcquire`. If that fails, it calls `addWaiter` to add the thread to the wait queue.

#### 3.1.2 How a Thread Joins the Queue

After acquisition fails, `addWaiter(Node.EXCLUSIVE)` adds the thread to the wait queue:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private Node addWaiter(Node mode) {
  Node node = new Node(Thread.currentThread(), mode);
  // Try the fast path of enq; backup to full enq on failure
  Node pred = tail;
  if (pred != null) {
    node.prev = pred;
    if (compareAndSetTail(pred, node)) {
      pred.next = node;
      return node;
    }
  }
  enq(node);
  return node;
}
private final boolean compareAndSetTail(Node expect, Node update) {
  return unsafe.compareAndSwapObject(this, tailOffset, expect, update);
}
```

The main steps are:

- Create a node for the current thread and lock mode.
- Set `pred` to the tail node.
- Set the new node's `prev` pointer to `pred`.
- Set the new tail with `compareAndSetTail`. The method compares the node at `tailOffset` with `expect`; if they are the same object, it sets the tail to `update`.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

static {
  try {
    stateOffset = unsafe.objectFieldOffset(AbstractQueuedSynchronizer.class.getDeclaredField("state"));
    headOffset = unsafe.objectFieldOffset(AbstractQueuedSynchronizer.class.getDeclaredField("head"));
    tailOffset = unsafe.objectFieldOffset(AbstractQueuedSynchronizer.class.getDeclaredField("tail"));
    waitStatusOffset = unsafe.objectFieldOffset(Node.class.getDeclaredField("waitStatus"));
    nextOffset = unsafe.objectFieldOffset(Node.class.getDeclaredField("next"));
  } catch (Exception ex) {
    throw new Error(ex);
  }
}
```

The AQS static initializer obtains each field's memory offset within its object. The offset lets the code locate the field in memory. `tailOffset` is the offset of `tail`, so the new node can become the queue's tail. Because this is a doubly linked list, the previous node's `next` pointer must also be updated.

- If `pred` is null (the wait queue is empty), or `pred` no longer matches `tail` (another thread changed the tail), the code falls back to `enq`.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private Node enq(final Node node) {
  for (;;) {
    Node t = tail;
    if (t == null) { // Must initialize
      if (compareAndSetHead(new Node()))
        tail = head;
    } else {
      node.prev = t;
      if (compareAndSetTail(t, node)) {
        t.next = node;
        return t;
      }
    }
  }
}
```

If the queue is not initialized, AQS creates a head node. This head is not the current thread's node; it is created with the no-argument constructor. After initialization, or if another thread has already added a node, the same process as above applies. In effect, `addWaiter` appends a node to the tail of a doubly linked list whose head is a sentinel node created with the no-argument constructor.

To summarize, lock acquisition roughly proceeds as follows:

1. When no thread holds the lock, Thread 1 acquires it.

2. Thread 2 requests the lock, but Thread 1 holds it.

![img](https://p0.meituan.net/travelcube/e9e385c3c68f62c67c8d62ab0adb613921117.png)

3. Any additional threads requesting the lock queue up in order.

Returning to the code above, `hasQueuedPredecessors` checks whether the wait queue has a valid node ahead of the current thread when a fair lock is acquired. If it returns `false`, the current thread may compete for the resource. If it returns `true`, a valid node is already queued ahead, so the current thread must join the queue.

```java
// java.util.concurrent.locks.ReentrantLock

public final boolean hasQueuedPredecessors() {
  // The correctness of this depends on head being initialized
  // before tail and on head.next being accurate if the current
  // thread is first in queue.
  Node t = tail; // Read fields in reverse initialization order
  Node h = head;
  Node s;
  return h != t && ((s = h.next) == null || s.thread != Thread.currentThread());
}
```

Why does the condition `h != t && ((s = h.next) == null || s.thread != Thread.currentThread())` examine the head's next node? What data does the first node store?

> The first node in the doubly linked list is a sentinel; it stores no thread information. The first node containing data is the second node. When `h != t`, if `(s = h.next) == null`, a thread may be initializing the queue: `tail` points to the new node, but `head` does not yet point to `tail`. The queue already contains a node, so the method must return `true` (see the source walkthrough below). If `s != null`, the queue has at least one valid node. If `s.thread == Thread.currentThread()`, the first valid node belongs to the current thread, so it may acquire the resource. Otherwise, the current thread must join the wait queue.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer#enq

if (t == null) { // Must initialize
  if (compareAndSetHead(new Node()))
    tail = head;
} else {
  node.prev = t;
  if (compareAndSetTail(t, node)) {
    t.next = node;
    return t;
  }
}
```

Enqueueing a node is not atomic, so `head != tail` can occur briefly while `tail` points to the last node but `head` has not yet been linked to it. In this case, the thread still needs to join the queue (see lines 5–7 in the example). This code handles a rare race condition.

#### 3.1.3 When a Thread Leaves the Wait Queue

Return to the original source:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

public final void acquire(int arg) {
  if (!tryAcquire(arg) && acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
    selfInterrupt();
}
```

The `addWaiter` method adds the current thread to the doubly linked queue as a `Node`, then returns that node. The node is passed to `acquireQueued`, which lets queued threads try to acquire the lock.

In short, a thread that fails to acquire the lock is added to the wait queue. `acquireQueued` keeps it waiting and retrying until it succeeds. `acquire(int)` is uninterruptible: if an interruption occurs while waiting, it records the interrupt status and restores it with `selfInterrupt()` after acquiring the lock, rather than cancelling the acquisition.

Let's examine `acquireQueued` from two angles: when a thread leaves the queue and how it does so.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

final boolean acquireQueued(final Node node, int arg) {
  // Tracks whether the resource was acquired successfully
  boolean failed = true;
  try {
    // Tracks whether interruption occurred while waiting
    boolean interrupted = false;
    // Spin until the lock is acquired or interruption is recorded
    for (;;) {
      // Get the predecessor of the current node
      final Node p = node.predecessor();
      // If p is the head, this node is first in the data queue; try to acquire the lock
      if (p == head && tryAcquire(arg)) {
        // Lock acquired; move the head pointer to the current node
        setHead(node);
        p.next = null; // help GC
        failed = false;
        return interrupted;
      }
      // If p is the head but acquisition failed (perhaps a non-fair thread barged in), or p is not the head, check whether this node should block. It blocks when its predecessor's waitStatus is -1. This avoids wasting resources in a busy loop; the two methods are explained below.
      if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
        interrupted = true;
    }
  } finally {
    if (failed)
      cancelAcquire(node);
  }
}
```

Note: `setHead` turns the current node into the sentinel head but does not change `waitStatus`, which is still needed.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private void setHead(Node node) {
  head = node;
  node.thread = null;
  node.prev = null;
}

// java.util.concurrent.locks.AbstractQueuedSynchronizer

// Use the predecessor to determine whether the current thread should block
private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
  // Get the predecessor's state
  int ws = pred.waitStatus;
  // The predecessor is in the signaling state
  if (ws == Node.SIGNAL)
    return true;
  // A positive waitStatus indicates a cancelled node
  if (ws > 0) {
    do {
      // Skip cancelled nodes while moving backward through the queue
      node.prev = pred = pred.prev;
    } while (pred.waitStatus > 0);
    pred.next = node;
  } else {
    // Set the predecessor's waitStatus to SIGNAL
    compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
  }
  return false;
}
```

`parkAndCheckInterrupt` parks the current thread and blocks its call stack, then returns the thread's interrupt status.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private final boolean parkAndCheckInterrupt() {
    LockSupport.park(this);
    return Thread.interrupted();
}
```

The flow is illustrated below:

![](https://p0.meituan.net/travelcube/c124b76dcbefb9bdc778458064703d1135485.png)

As shown, the loop exits when the predecessor is the head and the current thread acquires the lock. To avoid wasting CPU in a busy loop, AQS checks the predecessor's state to decide whether to park the current thread. The `shouldParkAfterFailedAcquire` flow is shown below:

![](https://p0.meituan.net/travelcube/9af16e2481ad85f38ca322a225ae737535740.png)

This explains when a node leaves the queue, but raises two more questions:

- How are cancelled nodes created in `shouldParkAfterFailedAcquire`? When is a node's `waitStatus` set to -1?
- When does releasing a node signal a parked thread?

### 3.2 Creating Nodes in the CANCELLED State

The `finally` block in `acquireQueued`:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

final boolean acquireQueued(final Node node, int arg) {
  boolean failed = true;
  try {
    ...
    for (;;) {
      final Node p = node.predecessor();
      if (p == head && tryAcquire(arg)) {
        ...
        failed = false;
        ...
      }
      ...
  } finally {
    if (failed)
      cancelAcquire(node);
    }
}
```

The `cancelAcquire` method marks the node as `CANCELLED`. Let's examine how it works:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private void cancelAcquire(Node node) {
  // Ignore an invalid node
  if (node == null)
    return;
  // Detach the node from its thread
  node.thread = null;
  Node pred = node.prev;
  // Skip cancelled nodes by following predecessor links
  while (pred.waitStatus > 0)
    node.prev = pred = pred.prev;
  // Get the successor of the filtered predecessor
  Node predNext = pred.next;
  // Mark the current node as CANCELLED
  node.waitStatus = Node.CANCELLED;
  // If this is the tail, move tail to the first non-cancelled predecessor
  // If the update succeeds, clear the new tail's next pointer
  if (node == tail && compareAndSetTail(node, pred)) {
    compareAndSetNext(pred, predNext, null);
  } else {
    int ws;
    // If this is not the head's successor, check whether the predecessor is SIGNAL;
    // if not, try to set it to SIGNAL
    // If either check succeeds, verify that the predecessor still has a thread
    // If all checks pass, link the predecessor to this node's successor
    if (pred != head && ((ws = pred.waitStatus) == Node.SIGNAL || (ws <= 0 && compareAndSetWaitStatus(pred, ws, Node.SIGNAL))) && pred.thread != null) {
      Node next = node.next;
      if (next != null && next.waitStatus <= 0)
        compareAndSetNext(pred, predNext, next);
    } else {
      // If this is the head's successor or the checks above fail, wake its successor
      unparkSuccessor(node);
    }
    node.next = node; // help GC
  }
}
```

The flow is:

- Get the current node's predecessor. If it is `CANCELLED`, continue traversing backward until finding the first node with `waitStatus <= 0`. Link that predecessor to the current node, then mark the current node `CANCELLED`.
- Depending on the current node's position, handle one of three cases:

(1) The current node is the tail.

(2) The current node is the head's successor.

(3) The current node is neither the head's successor nor the tail.

The diagrams below show the flow for each case.

The current node is the tail.

![](https://p1.meituan.net/travelcube/b845211ced57561c24f79d56194949e822049.png)

The current node is the head's successor.

![](https://p1.meituan.net/travelcube/ab89bfec875846e5028a4f8fead32b7117975.png)

The current node is neither the head's successor nor the tail.

![](https://p0.meituan.net/travelcube/45d0d9e4a6897eddadc4397cf53d6cd522452.png)

The flow above shows how nodes enter and leave the `CANCELLED` state. Why does it update `next` pointers but not `prev` pointers? When are `prev` pointers updated?

> When `cancelAcquire` runs, the current node's predecessor may already have left the queue after executing `shouldParkAfterFailedAcquire` in the `try` block. Updating `prev` at this point could make it point to a node that has already been removed, so it would be unsafe. `shouldParkAfterFailedAcquire` updates `prev` with the code below. It runs after lock acquisition fails; at that point, earlier nodes are stable, so changing `prev` is safe.
>
> ```java
> do {
>   node.prev = pred = pred.prev;
> } while (pred.waitStatus > 0);
> ```

### 3.3 Releasing the Lock

Having examined acquisition, let's look at release. ReentrantLock's release process is the same for fair and non-fair locks, so we can go straight to the source:

```java
// java.util.concurrent.locks.ReentrantLock

public void unlock() {
  sync.release(1);
}
```

The framework handles the core release operation.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

public final boolean release(int arg) {
  if (tryRelease(arg)) {
    Node h = head;
    if (h != null && h.waitStatus != 0)
      unparkSuccessor(h);
    return true;
  }
  return false;
}
```

In ReentrantLock, the `Sync` superclass of the fair and non-fair locks defines how the reentrant lock is released.

```java
// java.util.concurrent.locks.ReentrantLock.Sync

// Returns whether the current thread has fully released the lock
protected final boolean tryRelease(int releases) {
  // Decrement the reentrancy count
  int c = getState() - releases;
  // Throw if the current thread does not hold the lock
  if (Thread.currentThread() != getExclusiveOwnerThread())
    throw new IllegalMonitorStateException();
  boolean free = false;
  // If all holds are released, clear the owner and update state
  if (c == 0) {
    free = true;
    setExclusiveOwnerThread(null);
  }
  setState(c);
  return free;
}
```

The following source explains the release flow:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

public final boolean release(int arg) {
  // If the custom tryRelease above returns true, no thread holds the lock
  if (tryRelease(arg)) {
    // Get the head node
    Node h = head;
    // If the head exists and is not in its initial state, unpark a waiting thread
    if (h != null && h.waitStatus != 0)
      unparkSuccessor(h);
    return true;
  }
  return false;
}
```

Why does the condition check `h != null && h.waitStatus != 0`?

> `h == null` means the head has not been initialized. Initially, `head == null`. When the first node is enqueued, AQS initializes the head with a sentinel node. If no thread has enqueued yet, `head` remains null.
>
> `h != null && waitStatus == 0` means the thread associated with the successor is still running and does not need to be awakened.
>
> `h != null && waitStatus < 0` means the successor may be blocked and needs to be awakened.

Next, look at `unparkSuccessor`:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private void unparkSuccessor(Node node) {
  // Get the head node's waitStatus
  int ws = node.waitStatus;
  if (ws < 0)
    compareAndSetWaitStatus(node, ws, 0);
  // Get the current node's successor
  Node s = node.next;
  // If the successor is null or cancelled, find the first non-cancelled node
  if (s == null || s.waitStatus > 0) {
    s = null;
    // Search backward from the tail for the first node with waitStatus < 0
    for (Node t = tail; t != null && t != node; t = t.prev)
      if (t.waitStatus <= 0)
        s = t;
  }
  // Unpark the successor if it exists and its status is <= 0
  if (s != null)
    LockSupport.unpark(s.thread);
}
```

Why search backward for the first non-cancelled node? Consider the following:

Recall the earlier `addWaiter` method:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private Node addWaiter(Node mode) {
  Node node = new Node(Thread.currentThread(), mode);
  // Try the fast path of enq; backup to full enq on failure
  Node pred = tail;
  if (pred != null) {
    node.prev = pred;
    if (compareAndSetTail(pred, node)) {
      pred.next = node;
      return node;
    }
  }
  enq(node);
  return node;
}
```

Enqueueing a node is not atomic. `node.prev = pred` and `compareAndSetTail(pred, node)` make the node the tail, but `pred.next = node` may not have run yet. If `unparkSuccessor` runs at that point, it cannot find the new node by traversing forward, so it must search backward. Also, cancellation first disconnects `next` pointers while leaving `prev` pointers intact, making backward traversal necessary to reach every node.

In short, a forward traversal may miss nodes because enqueueing is not atomic and cancellation disconnects `next` pointers. After the relevant thread is awakened, it continues execution in `acquireQueued`. How is interruption handled there?

### 3.4 How Interrupts Are Restored

After the thread is unparked, `return Thread.interrupted();` runs. It returns the current thread's interrupt status and clears it.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private final boolean parkAndCheckInterrupt() {
  LockSupport.park(this);
  return Thread.interrupted();
}
```

Returning to `acquireQueued`, `interrupted` has a different value depending on whether `parkAndCheckInterrupt` returns `true` or `false`, but the loop continues either way. If the thread acquires the lock, the method returns the current value of `interrupted`.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

final boolean acquireQueued(final Node node, int arg) {
  boolean failed = true;
  try {
    boolean interrupted = false;
    for (;;) {
      final Node p = node.predecessor();
      if (p == head && tryAcquire(arg)) {
        setHead(node);
        p.next = null; // help GC
        failed = false;
        return interrupted;
      }
      if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
        interrupted = true;
      }
  } finally {
    if (failed)
      cancelAcquire(node);
  }
}
```

If `acquireQueued` returns `true`, `selfInterrupt` runs.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

static void selfInterrupt() {
  Thread.currentThread().interrupt();
}
```

This method restores the thread's interrupt status. Why restore it after acquiring the lock? Java uses cooperative interruption. Here is a brief explanation:

1. When an interrupted thread is unparked, it cannot tell why. It may have been interrupted while waiting, or unparked after another thread released the lock. `Thread.interrupted()` checks and clears the interrupt status, so the thread can record whether it was interrupted and restore the status later.
2. After waking while waiting for the lock, the thread keeps trying to acquire it. Interruption does not cancel this process; the thread only records the interrupt. Once it acquires the lock, it restores the interrupt status if needed.

`ThreadPoolExecutor` uses a similar approach in `Worker.runWorker`, with an additional check through `Thread.interrupted()`.

### 3.5 Summary

Here are answers to the questions raised in Section 1.3.

> Q: What happens after a thread fails to acquire the lock?
>
> A: The thread waits in a queue and can still acquire the lock later; the acquisition process continues.
>
> Q: What data structure does the wait queue use?
>
> A: It is a FIFO, doubly linked queue based on a CLH variant.
>
> Q: When can a thread in the queue try to acquire the lock?
>
> A: See Section 2.3.1.3 for details.
>
> Q: If a queued thread cannot acquire the lock, must it wait indefinitely?
>
> A: Its node can enter the cancelled state and be removed from the queue. See Section 2.3.2.
>
> Q: `Lock` acquires the lock through `acquire`, but how does that work?
>
> A: AQS's `acquire` calls `tryAcquire`, which each synchronizer implements to define how the lock is acquired.

## 4 AQS Applications

### 4.1 Reentrancy in ReentrantLock

ReentrantLock's reentrancy is one example of how AQS is used. Both its fair and non-fair implementations use the following logic:

Fair lock:

```java
// java.util.concurrent.locks.ReentrantLock.FairSync#tryAcquire

if (c == 0) {
  if (!hasQueuedPredecessors() && compareAndSetState(0, acquires)) {
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
```

Non-fair lock:

```java
// java.util.concurrent.locks.ReentrantLock.Sync#nonfairTryAcquire

if (c == 0) {
  if (compareAndSetState(0, acquires)){
    setExclusiveOwnerThread(current);
    return true;
  }
}
else if (current == getExclusiveOwnerThread()) {
  int nextc = c + acquires;
  if (nextc < 0) // overflow
    throw new Error("Maximum lock count exceeded");
  setState(nextc);
  return true;
}
```

Both snippets use the synchronization state, `state`, to track reentrant holds. It is `volatile`, which provides visibility and ordering guarantees.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private volatile int state;
```

The state changes as follows:

1. `state` starts at `0`, meaning no thread holds the lock.
2. When a thread acquires the lock, the value increases by `1`. The same thread can acquire it multiple times, increasing the value each time. This is reentrancy.
3. Each unlock decreases the value by `1`. When it reaches `0`, the thread has fully released the lock.

### 4.2 How JUC Uses AQS

Besides ReentrantLock's reentrancy, AQS provides a framework for many synchronization tools. The table below summarizes how several JUC classes use it:

| Synchronizer           | How it uses AQS                                                                                                                                                  |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ReentrantLock          | Uses AQS state to track the reentrant hold count. It also records the owning thread to detect reentrant acquisition and reject unlock attempts by other threads. |
| Semaphore              | Uses AQS state to store the current permit count. `tryRelease` increases it, and `acquireShared` decreases it.                                                   |
| CountDownLatch         | Uses AQS state as the count. `await()` can proceed only when the count reaches `0`.                                                                              |
| ReentrantReadWriteLock | Uses 16 bits of AQS state for the write lock hold count and the remaining 16 bits for the read lock count.                                                       |
| ThreadPoolExecutor     | `Worker` uses AQS state to control exclusive access to the worker thread, through `tryAcquire` and `tryRelease`.                                                 |

### 4.3 A Custom Synchronizer

With the basic AQS concepts in place, we can implement a simple synchronizer:

```java
public class LeeLock  {

    private static class Sync extends AbstractQueuedSynchronizer {
        @Override
        protected boolean tryAcquire (int arg) {
            if (compareAndSetState(0, 1)) {
                setExclusiveOwnerThread(Thread.currentThread());
                return true;
            }
            return false;
        }

        @Override
        protected boolean tryRelease (int arg) {
            if (getState() == 0 || getExclusiveOwnerThread() != Thread.currentThread()) {
                throw new IllegalMonitorStateException();
            }
            setExclusiveOwnerThread(null);
            setState(0);
            return true;
        }

        @Override
        protected boolean isHeldExclusively () {
            return getState() == 1 && getExclusiveOwnerThread() == Thread.currentThread();
        }
    }

    private final Sync sync = new Sync();

    public void lock () {
        sync.acquire(1);
    }

    public void unlock () {
        sync.release(1);
    }
}
```

The custom `Lock` provides the synchronization:

```java
public class LeeMain {

    static int count = 0;
    static LeeLock leeLock = new LeeLock();

    public static void main (String[] args) throws InterruptedException {

        Runnable runnable = new Runnable() {
            @Override
            public void run () {
                try {
                    leeLock.lock();
                    for (int i = 0; i < 10000; i++) {
                        count++;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    leeLock.unlock();
                }

            }
        };
        Thread thread1 = new Thread(runnable);
        Thread thread2 = new Thread(runnable);
        thread1.start();
        thread2.start();
        thread1.join();
        thread2.join();
        System.out.println(count);
    }
}
```

This code prints `20000` each time. AQS makes it possible to implement synchronization with only a few lines of code.

## 5 Summary

Concurrency is common in day-to-day development, but its underlying framework is less familiar to many developers. This article covered the basics of ReentrantLock and AQS as a starting point for understanding these synchronizers.

## References

- Lea D. The java. util. concurrent synchronizer framework\[J]. Science of Computer Programming, 2005, 58(3): 293-309.
- _Java Concurrency in Practice_
- [An Introduction to Java Locks](https://tech.meituan.com/2018/11/15/java-lock.html)

<!-- @include: @article-footer.snippet.md -->
