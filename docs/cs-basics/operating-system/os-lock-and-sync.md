---
title: "Operating System Locks and Synchronization: Mutexes, Semaphores, Condition Variables, Spinlocks, and Futexes"
description: Common operating system synchronization topics, including critical sections, mutexes, spinlocks, semaphores, condition variables, futexes, atomic instructions, memory ordering, priority inversion, and the differences between user-space and Linux kernel locks.
category: Computer Science Fundamentals
tag:
  - Operating Systems
  - Linux
  - Concurrency
head:
  - - meta
    - name: keywords
      content: operating system locks,synchronization,critical section,mutex,spinlock,semaphore,condition variable,futex,atomic instruction,memory barrier,priority inversion,Linux kernel locks,operating system interview questions,concurrency
---

Two threads increment the same counter at the same time. It looks simple, but the final value may be one too low.

The reason is that `count++` is one line of source code but usually takes several machine steps: read, calculate, and write. Thread A may read the old value and pause before writing it back. Thread B then reads the same old value. Both calculate the same new value and write it, so one increment is lost.

Operating systems provide locks and synchronization mechanisms to prevent these races. They address more than whether two code paths can run at once: they also determine whether a thread should block, how to limit resource counts, and how to wait for a condition. Kernel code must additionally account for interrupts, preemption, multiple CPUs, real-time behavior, and scheduling latency.

This article focuses on synchronization from the operating system's perspective. Java `synchronized`, `ReentrantLock`, AQS, CAS, and lock optimizations are covered in [Java Locks](../../java/concurrent/java-lock.md). Here we focus on the roles of mutexes, semaphores, condition variables, spinlocks, and futexes. Once these primitives are clear, [Deadlocks](./dead-lock.md) is easier to follow.

| Mechanism          | Main purpose                                        | Waiting behavior                                       | Common use                                                     |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| Mutex              | Mutual exclusion in a critical section              | Wait until available; implementation may spin or block | Protect a shared data structure                                |
| Spinlock           | Mutual exclusion for a very short critical section  | Busy-wait                                              | Kernel path that cannot sleep                                  |
| Semaphore          | Count resources and limit concurrency               | Wait when the count is zero                            | Buffer slots, connection limits, concurrent task limits        |
| Condition variable | Wait for shared state to become true                | Atomically release a mutex and wait                    | Nonempty queue, task completion, nonfull buffer                |
| Futex              | Foundation for blocking and waking user-space locks | User-space fast path, kernel slow path                 | Pthread mutexes and runtime synchronizers                      |
| Memory barrier     | Constrain memory access order and visibility        | Usually does not block                                 | Lock-free structures, kernel synchronization, device registers |

## What Does a Critical Section Protect?

A **critical section** is code that accesses shared mutable state and must not be interleaved arbitrarily with other execution flows. It could be a counter update in an application or kernel code that updates a scheduler queue, file descriptor table, page table, or device state.

![A shared-state access protocol uses a common lock; bypassing the lock or using a different lock breaks mutual exclusion](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/os-lock-critical-section.png)

Evaluate a lock or synchronization mechanism from four angles: correctness, progress, fairness, and performance.

**Correctness:** Multiple execution flows must not arbitrarily interleave changes to shared state. On a multicore machine, synchronization must also ensure that a thread acquiring a lock sees the state written before another thread released that same lock.

**Progress:** The synchronization mechanism must not trap all waiters so that nobody can move forward.

**Fairness:** When several threads wait for a lock, a thread should not be denied access indefinitely. Systems are not always strictly FIFO, but starvation must be considered.

**Performance:** With no contention, lock and unlock should be lightweight. Under heavy contention, waiting threads should not waste large amounts of CPU in useless loops.

OSTEP discusses similar questions: Does a lock provide mutual exclusion? Can a waiter starve? What does the uncontended path cost? How does it behave on one CPU versus many? Asking only “Which lock is fastest?” is not useful; the answer changes with hardware, critical-section length, and contention.

## Mutex: Lock the Gate Before Updating Shared State

For the earlier `count++` example, the direct fix is a **mutex** around the read, increment, and write. The thread that acquires the mutex enters the critical section; others wait outside.

With POSIX threads:

```c
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
int count = 0;

void increase(void) {
    pthread_mutex_lock(&mutex);
    count++;
    pthread_mutex_unlock(&mutex);
}
```

`pthread_mutex_lock()` does more than set a flag. Under POSIX semantics, if another thread holds the mutex, the caller waits until it becomes available and proceeds only after successfully acquiring it.

Implementations can be more flexible. Many pthread mutexes and runtime locks may spin briefly in user space, then use a blocking path such as a futex if contention continues. For the caller, focus on the contract: a thread cannot enter the critical section before acquiring the mutex, and after acquisition it may access the protected state.

Mutexes suit shared-state updates with a clear boundary, such as updating a reference count, changing linked-list pointers, maintaining a process table, or updating a small in-memory cache. First identify exactly which state the lock protects and confirm every access path follows the same rule.

A common mistake is protecting a shared object along four of its five access paths, while one path changes a field directly “for convenience.” The other paths can be perfectly synchronized and still fail because the access protocol has been bypassed. A lock next to a variable is not enough; every access must follow the protocol.

Mutexes also usually have ownership semantics: the thread that acquires the lock releases it. Linux kernel documentation calls this owner semantics; most locks require the context that acquired them to release them. A semaphore differs because it behaves more like a counter.

## Spinlocks: Busy-Wait Briefly Instead of Sleeping

When a mutex is unavailable, a thread can sleep until the kernel wakes it. A **spinlock** does the opposite: the thread keeps running and repeatedly checks whether the lock has been released.

This can make sense when the wait is very short.

![A mutex may sleep in a blocking path; a spinlock briefly busy-waits in a short path that cannot sleep](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/os-lock-mutex-spinlock.png)

If a lock protects only a few instructions and the owner will soon leave the critical section, putting the waiter to sleep may cost more. Sleeping and waking involve the scheduler and may cause a context switch. On a multicore machine, the owner may be running on another CPU and release the lock in a few instructions, so a few spins can be cheaper.

Spinlocks have two important constraints.

**First, the critical section must be short.** If the owner accesses a disk, waits for a network response, or allocates memory that may sleep, the waiter wastes CPU time spinning.

**Second, take care on a single CPU or in preemptible contexts.** If the owner is preempted while a waiter spins on the same CPU, the waiter cannot make progress until the owner runs again.

On a non-PREEMPT_RT Linux kernel, acquiring an ordinary `spinlock_t` implicitly disables preemption. To prevent an interrupt handler from interrupting the critical section on the same CPU, use interfaces such as `spin_lock_irq()` or `spin_lock_irqsave()`. Plain `spin_lock()` does not always disable hard interrupts.

Linux kernel documentation broadly classifies locks as sleeping locks, CPU-local locks, and spinning locks. `mutex`, `semaphore`, and `rw_semaphore` may sleep. `raw_spinlock_t` is a strict spinlock on both regular and PREEMPT_RT kernels. `spinlock_t` changes semantics under PREEMPT_RT: on a non-RT kernel it maps to `raw_spinlock_t`; on PREEMPT_RT it is based on `rt_mutex`, does not implicitly disable preemption, and the `_irq`/`_irqsave` suffixes do not directly change hard-interrupt state.

Application code in user space generally should not implement its own spinlock. Libraries and runtimes may use adaptive spinning for very short paths, but a hand-written `while` loop often just heats up the CPU.

## Semaphores: More Than a Binary Lock

A **semaphore** can be viewed as a counter that does not go below zero. `sem_wait()` attempts to decrement it. If the value is greater than zero, the call proceeds; if the value is zero, the caller blocks. `sem_post()` increments the count and may wake a waiter.

With an initial count of 1, a semaphore can be used like a mutex:

```c
sem_t sem;

sem_init(&sem, 0, 1);

sem_wait(&sem);
// critical section
sem_post(&sem);
```

Its common use, however, is resource counting: a buffer has N free slots, a connection pool allows at most N connections, or no more than N tasks may run at once. The initial semaphore value represents the resource count.

A binary semaphore can imitate mutual exclusion, but it is not the same as a mutex. A mutex emphasizes ownership of a critical section; a semaphore represents a count of permits. A bounded buffer usually separates the concerns: semaphores manage available slots, and a mutex protects the buffer's internal structure.

![Semaphores track empty and filled buffer slots while a mutex protects the buffer structure](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/os-lock-semaphore-buffer.png)

The code below omits the `item_t` and buffer implementation and shows only the synchronization:

```c
#include <errno.h>
#include <pthread.h>
#include <semaphore.h>
#include <stdlib.h>

#define BUFFER_SIZE 1024

sem_t empty_slots;
sem_t filled_slots;
pthread_mutex_t buffer_mutex = PTHREAD_MUTEX_INITIALIZER;

void init_buffer(void) {
    if (sem_init(&empty_slots, 0, BUFFER_SIZE) == -1) {
        abort();
    }
    if (sem_init(&filled_slots, 0, 0) == -1) {
        abort();
    }
}

static void wait_sem(sem_t *sem) {
    while (sem_wait(sem) == -1) {
        if (errno == EINTR) {
            continue;
        }
        abort();
    }
}

void producer(void) {
    item_t item = produce_item();

    wait_sem(&empty_slots);
    pthread_mutex_lock(&buffer_mutex);
    put_item(item);
    pthread_mutex_unlock(&buffer_mutex);
    sem_post(&filled_slots);
}

void consumer(void) {
    wait_sem(&filled_slots);
    pthread_mutex_lock(&buffer_mutex);
    item_t item = take_item();
    pthread_mutex_unlock(&buffer_mutex);
    sem_post(&empty_slots);

    consume(item);
}
```

`empty_slots` counts available slots, and `filled_slots` counts consumable items. A producer consumes an empty slot, inserts an item, then increments the number of filled slots. A consumer does the reverse. `buffer_mutex` only protects changes to the buffer structure in `put_item()` and `take_item()`.

Retrying `EINTR` in `wait_sem()` matters. Linux man-pages specify that a signal handler can interrupt `sem_wait()`, which then returns `-1` with `errno` set to `EINTR`. Omitting that case can create an intermittent bug in copied code.

Linux kernel locking documentation describes semaphores as useful for serialization and waiting. For new code, it recommends separating mutual exclusion and event completion into mechanisms such as mutexes and completions. A semaphore has no explicit owner, so PREEMPT_RT cannot provide priority inheritance for it; blocking on one can cause priority inversion.

## Condition Variables: Wait for a Condition, Not a Lock

A mutex controls who may enter a critical section at a time. But a thread may enter and find that a condition is not yet true.

For example, a consumer acquires the lock and finds the queue empty. It cannot consume data, but it also cannot sleep while holding the lock: then the producer cannot acquire the lock to add data.

A **condition variable** lets a thread wait for a condition, usually together with a mutex:

```c
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t not_empty = PTHREAD_COND_INITIALIZER;
queue_t queue;

void consumer(void) {
    pthread_mutex_lock(&mutex);

    while (queue_empty(&queue)) {
        pthread_cond_wait(&not_empty, &mutex);
    }

    item_t item = queue_pop(&queue);
    pthread_mutex_unlock(&mutex);

    consume(item);
}

void producer(item_t item) {
    pthread_mutex_lock(&mutex);
    queue_push(&queue, item);
    pthread_cond_signal(&not_empty);
    pthread_mutex_unlock(&mutex);
}
```

`pthread_cond_wait()` atomically releases the mutex and waits on the condition variable. Before returning after a wakeup, it reacquires the mutex. These actions must be combined; otherwise, a notification can be lost if the producer signals just before the consumer goes to sleep.

![A thread checks shared state in a while loop, releases the mutex and sleeps if the condition is false, then checks again after being signaled](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/os-lock-condition-variable.png)

Three rules matter when using condition variables.

**First, use `while`, not `if`, to check the condition.** POSIX allows spurious wakeups, where a thread wakes even though the condition is false. Even without them, if several consumers wake together, only one may get the item; the others must check the queue again.

**Second, the condition variable does not store state.** The real state belongs in a shared variable protected by the mutex. `pthread_cond_signal()` is not a permanent ticket placed in a queue. If nobody is waiting when the signal occurs, the notification may be gone. Whether a consumer can proceed depends on the queue length checked by `queue_empty()`.

**Third, while waiters exist, use the same mutex with a given condition variable.** POSIX calls this a dynamic binding. While a thread is blocked on a condition variable with one mutex, waiting on that same condition variable with a different mutex has undefined behavior. This is why code often groups its state variable, mutex, and condition variable in one structure.

Many condition-variable bugs come from treating a signal as state or failing to recheck the condition after waking.

## Futex: Try in User Space, Enter the Kernel on Contention

Linux programmers often hear about futexes (fast userspace mutexes). Despite the name, a futex is more like a building block for locks.

With no contention, a thread uses atomic instructions in user space to change a 32-bit integer. It calls `futex()` only when it needs to sleep or wake waiters. This avoids a system call for every lock and unlock.

A simplified path is:

1. The thread atomically changes the lock word from 0 to 1 in user space.
2. If successful, it enters the critical section without contention.
3. If it fails because another thread holds the lock, it calls `FUTEX_WAIT` so the kernel can suspend it.
4. When the owner releases the lock and sees waiters, it calls `FUTEX_WAKE` to wake one or more threads.

![A futex uses a user-space atomic fast path and kernel FUTEX_WAIT/FUTEX_WAKE paths when contended](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/os-lock-futex.png)

`FUTEX_WAIT` uses compare-and-block: the kernel first verifies that the futex word still equals the expected value. It blocks the thread only if the value matches. The comparison and blocking step are atomic, connecting the user-space atomic operation to the kernel wait queue.

Linux man-pages likewise describe futex operations around a 32-bit value at a user-space address, with waiting and waking as common operations. Applications usually do not use futexes directly as business locks. Libraries implement higher-level primitives such as pthread mutexes, condition variables, and runtime synchronizers on top of them.

For Linux user-space locks, remember: keep the uncontended fast path in user space; enter the kernel to queue and sleep only on the slow path.

## Atomic Instructions: Locks Need an Indivisible Starting Point

Mutexes, spinlocks, and futexes ultimately rely on hardware-supported atomic operations. Otherwise, another thread could intervene between “check whether the lock is free” and “mark the lock as taken.”

Common atomic instructions include test-and-set, compare-and-swap, and fetch-and-add. They ensure that a read-modify-write operation on a memory location is not observed halfway through by another CPU.

Textbooks also describe implementing locks by disabling interrupts. On a single-CPU kernel, disabling interrupts prevents an interrupt handler from interrupting the current execution flow and can protect some kernel critical sections. But it affects only the current CPU; it cannot stop another CPU from accessing the same memory. On multiprocessor systems, cross-CPU mutual exclusion still needs atomic instructions, cache-coherence protocols, and kernel locking rules.

That is why operating systems courses introduce atomic instructions before lock implementations. The API exposes `lock()` and `unlock()`, but the CPU and kernel provide the underlying indivisible updates.

## Locks Also Define Memory Ordering

A lock does more than queue threads at the entrance to a critical section. On a multicore system, CPUs and compilers may reorder memory accesses. Without synchronization semantics, one CPU may not observe another CPU's writes in source-code order.

Lock acquisition and release therefore usually carry memory-ordering guarantees:

- **Acquire:** Memory accesses after acquiring a lock cannot be reordered before the acquisition.
- **Release:** Memory accesses before releasing a lock cannot be reordered after the release.

Linux kernel memory-barrier documentation associates lock operations with acquire semantics and unlock operations with release semantics. When using mutexes and spinlocks correctly, developers usually do not need to write memory barriers themselves. They matter directly when implementing lock-free structures, drivers, low-level kernel synchronization, or device interactions.

Acquire and release are the minimum guarantees; together they are not a full memory barrier in every situation. Ordinary application code rarely needs these details, but they matter for lock-free queues, RCU, drivers, and MMIO access.

## Priority Inversion: Locks Affect Scheduling Too

Locks can introduce scheduling problems.

A classic issue is **priority inversion**. A low-priority thread L holds a lock that a high-priority thread H needs. A medium-priority thread M keeps running and preempts L. H has the highest priority but cannot proceed until L runs and releases the lock.

One solution is priority inheritance. The low-priority lock owner temporarily inherits the highest priority of its waiters, allowing it to finish the critical section and release the lock sooner.

POSIX mutex protocol attributes include `PTHREAD_PRIO_INHERIT` and `PTHREAD_PRIO_PROTECT`. Linux `rt_mutex` is also designed around priority inheritance and supports PI-futexes and pthread mutexes configured for priority inheritance.

This is one limit of semaphores without owners. If the system cannot identify a lock owner, it cannot raise that owner's priority. Linux kernel locking documentation notes that semaphores cannot provide priority inheritance on PREEMPT_RT, so blocking on one can cause priority inversion.

## How Do User-Space and Kernel Locks Differ?

User-space programs coordinate threads. Pthreads provides mutexes, condition variables, and semaphores; C++, Java, Go, and Rust wrap synchronization in their runtimes and standard libraries.

Kernel locks have additional context constraints. Kernel code can run in ordinary process context, interrupt or softirq context, or a non-preemptible region. Some paths may sleep; others must not. Some locks disable preemption or interrupts while held. Real-time kernels must also control priority inversion and scheduling latency.

When reading kernel-locking code, ask:

- Can this context sleep?
- Can it be preempted while holding the lock?
- Can an interrupt handler re-enter it?
- Does it protect per-CPU data or data shared across CPUs?
- Is this a regular kernel or a PREEMPT_RT kernel?
- Is priority inheritance needed to control real-time latency?

![Kernel locking must account for sleeping, preemption, interrupt context, and cross-CPU sharing in addition to thread coordination](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/os-lock-kernel-context.png)

Some common distinctions:

- A sleeping lock such as a mutex can put a task to sleep and suits a longer critical section, but should not be used casually in interrupt context.
- A spinlock suits a very short kernel path that cannot sleep. Do not call functions that may block while holding it.
- `rw_semaphore` and `rwlock` support multiple readers and one writer, but fairness and real-time behavior depend on kernel configuration.
- Local locks, disabling preemption, and disabling interrupts mainly protect data on the current CPU; they do not naturally replace a cross-CPU lock.

Linux kernel locking documentation describes these rules in detail, especially changes under PREEMPT_RT. Application developers do not need to memorize every rule, but kernel locks are not defined only by names such as mutex, read-write, or spin. Their behavior depends on whether the current context can sleep, be preempted, or handle interrupts.

## How to Choose a Synchronization Primitive

To protect a shared-state update, start with a mutex. Its meaning is clear, and a waiting thread can sleep. It suits most user-space critical sections.

To limit how many threads can use a resource at once, use a semaphore. Examples include limiting downloads to 10 or a connection pool to 50. The key concern is the count, not ownership of a critical section.

To wait for a state change, use a condition variable. A queue becoming nonempty, a task completing, or a buffer becoming nonfull are examples. Keep the state in a shared variable, protect it with a mutex, and wait in a `while` loop.

Use a spinlock only for a very short kernel path that cannot sleep. Long-running spin loops in user-space application code are usually a poor choice.

Futexes are relevant when implementing a language runtime, thread library, or high-performance synchronizer. Ordinary application code should use a standard or well-tested concurrency library rather than call futex system calls directly.

This distinction explains why Java articles group `synchronized`, `ReentrantLock`, AQS, and CAS: Java developers use language-level abstractions, while the operating system handles scheduling, blocking and waking, CPU atomic instructions, and kernel context.

## Common Mistakes

**Treating locks as a performance switch.**

Locks first provide correctness; performance comes after. If shared state can be corrupted, removing a lock only makes the bug depend on scheduling.

**Waiting on a condition variable with `if`.**

A wakeup does not mean the condition is true. Check the condition again after waking; use `while`.

**Using a semaphore as a universal lock.**

Semaphores can do many things, which can make code's intent unclear. Use a mutex for mutual exclusion, a completion for a one-time event where appropriate in the kernel, and a semaphore for resource counts.

**Doing slow work while holding a lock.**

Disk access, network requests, or waits on external systems extend the critical section. With many threads, contention can reduce throughput, build queues, or cause deadlocks.

**Ignoring lock order.**

If one thread acquires A then B and another acquires B then A, a wait cycle can form. This affects operating systems, databases, and Java applications alike. See [Deadlocks](./dead-lock.md).

## Summary

Operating system locks are not just APIs. They are synchronization mechanisms for shared state, wait conditions, resource counts, and scheduling contexts.

A mutex provides mutual exclusion; a spinlock trades CPU time for avoiding sleep and wakeup; a semaphore counts permits and limits concurrency; a condition variable lets a thread sleep until a condition changes; and a futex connects user-space atomics with kernel blocking and wakeups. They all involve waiting, but they wait for different things: entry to a critical section, an available resource, a state change, or a place in the runnable queue.

Java locks hide many details behind the JVM and class libraries. At the operating system level, the questions are when a thread should sleep or spin, who wakes it, which code cannot be preempted, and which contexts cannot block.

## References

- [OSTEP: Locks](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks.pdf)
- [OSTEP: Condition Variables](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-cv.pdf)
- [OSTEP: Semaphores](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-sema.pdf)
- [POSIX Programmer's Manual: pthread_mutex_lock](https://man7.org/linux/man-pages/man3/pthread_mutex_lock.3p.html)
- [POSIX Programmer's Manual: pthread_cond_wait](https://man7.org/linux/man-pages/man3/pthread_cond_wait.3p.html)
- [POSIX Programmer's Manual: pthread_mutexattr_getprotocol](https://man7.org/linux/man-pages/man3/pthread_mutexattr_getprotocol.3p.html)
- [Linux man-pages: sem_wait](https://man7.org/linux/man-pages/man3/sem_wait.3.html)
- [Linux man-pages: futex](https://man7.org/linux/man-pages/man2/futex.2.html)
- [Linux Kernel Documentation: Lock Types and Their Rules](https://docs.kernel.org/locking/locktypes.html)
- [Linux Kernel Documentation: Memory Barriers](https://www.kernel.org/doc/Documentation/memory-barriers.txt)
- [Linux Kernel Documentation: RT-Mutex Subsystem with PI Support](https://docs.kernel.org/locking/rt-mutex.html)
