---
title: Java Concurrency Interview Questions (Part 1)
description: Core Java concurrency interview questions covering threads and processes, thread creation, thread lifecycle, deadlock conditions and prevention, and concurrency versus parallelism.
category: Java
tag:
  - Java Concurrency
head:
  - - meta
    - name: keywords
      content: Java concurrency,threads and processes,multithreading,deadlock,thread lifecycle,concurrent programming,Java interview questions,thread creation
---

## Threads

### ⭐️ What Are Threads and Processes?

#### What Is a Process?

A process is an instance of a program in execution and the basic unit for running a program. It is dynamic: it goes through creation, execution, and termination.

In Java, starting the `main` method starts a JVM process. The thread that runs `main` is one of the process's threads, called the main thread.

As shown below, you can use Windows Task Manager to view running processes, including active `.exe` files.

![Example of a process in Windows](https://oss.javaguide.cn/github/javaguide/java/%E8%BF%9B%E7%A8%8B%E7%A4%BA%E4%BE%8B%E5%9B%BE%E7%89%87-Windows.png)

#### What Is a Thread?

A thread is a smaller unit of execution than a process, and a process can create multiple threads. Unlike processes, threads in the same process share the **heap** and **method area**, while each thread has its own **program counter**, **JVM stack**, and **native method stack**. Creating and switching between threads has less overhead than doing so for processes, which is why threads are sometimes called lightweight processes.

Java programs are multithreaded by default. The following code uses JMX to list the threads in a simple Java program:

```java
public class MultiThread {
	public static void main(String[] args) {
		// Get the Java thread management MXBean
	ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
		// Get thread and stack information without monitor or synchronizer details
		ThreadInfo[] threadInfos = threadMXBean.dumpAllThreads(false, false);
		// Print each thread's ID and name
		for (ThreadInfo threadInfo : threadInfos) {
			System.out.println("[" + threadInfo.getThreadId() + "] " + threadInfo.getThreadName());
		}
	}
}
```

The program prints output similar to this (the output may differ; the key point is that the main thread runs `main`):

```plain
[5] Attach Listener // Handles attach events
[4] Signal Dispatcher // Dispatches signals to the JVM
[3] Finalizer // Calls object finalize methods
[2] Reference Handler // Handles references
[1] main // Main thread and program entry point
```

This output shows that **a Java program runs the main thread alongside several other threads**.

### How Do Java Threads Differ from Operating System Threads?

Early JDK versions used green threads to implement user-level threads. Later, HotSpot used platform threads for traditional threads created with `new Thread()`. A platform thread usually maps 1:1 to an OS thread and is scheduled by the operating system. Virtual threads, finalized in Java 21, are scheduled by the JVM. Many virtual threads can share a smaller number of platform threads, so Java threads should not all be equated with OS threads.

The terms user thread and kernel thread were mentioned above. Here is a brief explanation:

- User thread: A thread managed and scheduled by a user-space program. It runs in user space, which is reserved for applications.
- Kernel thread: A thread managed and scheduled by the operating system kernel. It runs in kernel space, which only kernel code can access.

In brief, user-level threads are usually scheduled in user space by a runtime, so they are cheaper to create and switch. Whether they can use multiple cores depends on how they map to kernel threads: a many-to-one model cannot use multiple cores in parallel, while a many-to-many model can. The operating system schedules kernel threads. They usually cost more to create and switch, but can run on multiple cores.

In short: **platform threads usually map to operating system threads, while the JVM schedules virtual threads and runs them on platform threads**.

Thread models describe how user threads map to kernel threads. The three common models are:

1. One-to-one: One user thread maps to one kernel thread.
2. Many-to-one: Multiple user threads map to one kernel thread.
3. Many-to-many: Multiple user threads map to multiple kernel threads.

![Three common thread models](https://oss.javaguide.cn/github/javaguide/java/concurrent/three-types-of-thread-models.png)

On mainstream operating systems such as Windows and Linux, HotSpot platform threads usually use a one-to-one model: each platform thread maps to one OS thread. Virtual threads do not use this mapping; the JVM schedules them across a set of platform threads.

### ⭐️ Briefly Describe the Relationship Between Threads and Processes, and Their Differences and Trade-offs

The diagram below shows the Java memory areas and the relationship between threads and processes from the JVM's perspective.

![Java runtime data areas since JDK 8](https://oss.javaguide.cn/github/javaguide/java/jvm/java-runtime-data-areas-jdk1.8.png)

As the diagram shows, a process can contain multiple threads. They share the process's **heap** and **method area (metaspace since JDK 8)**, while each thread has its own **program counter**, **JVM stack**, and **native method stack**.

**Summary:** A thread is a smaller unit of execution within a process. Processes are generally isolated, while threads in the same process can affect each other. Threads have lower execution overhead but provide less resource isolation and protection; processes have the opposite trade-off.

Here is some additional detail.

Consider this question: why are the **program counter**, **JVM stack**, and **native method stack** thread-local, while the heap and method area are shared?

#### Why Is the Program Counter Thread-Local?

The program counter has two main purposes:

1. The bytecode interpreter updates the program counter as it reads instructions, controlling the flow of execution, such as sequencing, branching, loops, and exception handling.
2. In a multithreaded program, it records each thread's current position so that the thread can resume where it left off after a context switch.

When a thread runs a native method, the program counter is undefined. It points to the next instruction only while the thread runs Java code.

The program counter is thread-local so that **each thread can resume at the correct position after a context switch**.

#### Why Are the JVM Stack and Native Method Stack Thread-Local?

- **JVM stack:** Before a Java method runs, a stack frame is created to store its local variables, operand stack, and references to the runtime constant pool. Method calls and returns correspond to pushing and popping frames on the JVM stack.
- **Native method stack:** It serves a similar purpose, but the **JVM stack supports Java methods (bytecode), while the native method stack supports native methods used by the JVM.** In HotSpot, the two stacks are combined.

The JVM and native method stacks are thread-local to **keep one thread's local variables from being accessed by other threads**.

#### The Heap and Method Area in Brief

The heap and method area are shared by all threads. The heap is the largest memory area in a process and is mainly used for newly created objects. The method area stores loaded class metadata, constants, static variables, and code compiled by the JIT compiler.

### How Do You Create a Thread?

There are several common ways to work with threads, such as extending `Thread`, implementing `Runnable` or `Callable`, using a thread pool, or using `CompletableFuture`.

However, these are ways to use concurrency in Java; they do not all create a thread directly.

Strictly speaking, the direct way to create and start a platform thread is `new Thread().start()`. Higher-level APIs ultimately rely on thread creation as well, though virtual threads use their own JDK-managed scheduling.

### ⭐️ What Are the Thread Lifecycle and States?

A Java thread can be in one of six states at a time during its lifecycle:

- `NEW`: The thread has been created but `start()` has not been called.
- `RUNNABLE`: The thread has been started and is ready to run or is running.
- `BLOCKED`: The thread is waiting for a monitor lock.
- `WAITING`: The thread is waiting for another thread to perform a particular action, such as notifying or interrupting it.
- `TIMED_WAITING`: The thread is waiting for a specified period and can resume when the timeout expires.
- `TERMINATED`: The thread has finished running.

A thread moves between states as its code runs; it does not remain in one state throughout its lifecycle.

Java thread state diagram (source: [Corrections to three thread-state errors in _The Art of Java Concurrency Programming_](https://mp.weixin.qq.com/s/0UTyrJpRKaKhkhHcQtXAiA)):

![Java thread state transitions](https://oss.javaguide.cn/github/javaguide/java/concurrent/640.png)

As shown above, a thread starts in **NEW**. Calling `start()` makes it **READY**. Once it receives a CPU time slice, it is **RUNNING**.

> At the operating system level, a thread can be READY or RUNNING. At the JVM level, both are represented by `RUNNABLE` (source: [HowToDoInJava](https://howtodoinJava.com/ "HowToDoInJava"): [Java Thread Life Cycle and Thread States](https://howtodoinJava.com/Java/multi-threading/Java-thread-life-cycle-and-thread-states/ "Java Thread Life Cycle and Thread States")).
>
> **Why does the JVM not distinguish these states?** `Thread.State` describes thread states at the JVM level; it does not expose every internal state of the OS scheduler. Scheduling policy, time slice length, and whether round-robin scheduling is used depend on the operating system and its configuration. They cannot be summarized as a fixed 10–20 ms time slice.

![RUNNABLE vs. RUNNING](https://oss.javaguide.cn/github/javaguide/java/RUNNABLE-VS-RUNNING.png)

- After calling `wait()`, a thread enters **WAITING**. It needs another thread to notify it before it can resume.
- **TIMED_WAITING** is waiting with a time limit. For example, `sleep(long millis)` or `wait(long millis)` puts a thread in this state until the timeout expires, after which it returns to `RUNNABLE`.
- A thread enters **BLOCKED** when it tries to enter a `synchronized` method or block but the monitor is held by another thread. The same applies after it is notified from `wait()` and tries to reacquire the monitor.
- A thread enters **TERMINATED** after its `run()` method finishes.

### What Is a Thread Context Switch?

While running, a thread has its own execution state, or context, including the program counter and stack. It may stop using the CPU in these situations:

- It yields the CPU, for example by calling `sleep()` or `wait()`.
- Its time slice expires, so the operating system can prevent one thread or process from starving others.
- It makes a blocking system call, such as an I/O request.
- It is terminated or finishes running.

The first three cases can cause a context switch. The system saves the current thread's context so it can resume later, then loads the context of the next thread to use the CPU. This is called a **context switch**.

Context switching is a basic operating system function, but saving and restoring state uses CPU, memory, and other resources. Frequent context switches can reduce overall efficiency.

### `Thread.sleep()` vs. `Object.wait()`

**Similarities:** Both pause the current thread.

**Differences:**

- **`sleep()` does not release a lock, while `wait()` does.**
- `wait()` is usually used for thread communication; `sleep()` is usually used to pause execution.
- After `wait()` is called, the thread does not wake up on its own. Another thread must call `notify()` or `notifyAll()` on the same object. A thread wakes automatically when `sleep()` finishes or a timed `wait(long timeout)` expires.
- `sleep()` is a static native method in `Thread`, while `wait()` is a native method in `Object`. The next question explains why.

### Why Is `wait()` Defined in `Object`, Not `Thread`?

`wait()` makes a thread that holds an object's monitor wait and releases that monitor. Since every object has a monitor, the method operates on the object whose monitor must be released, not on the current thread.

A related question: **Why is `sleep()` defined in `Thread`?**

Because `sleep()` pauses the current thread. It does not operate on an object or require an object monitor.

### Can You Call `Thread.run()` Directly?

This is a classic Java concurrency interview question.

Creating a `Thread` puts it in the `NEW` state. Calling `start()` starts a new thread and makes it ready to run; it begins execution once scheduled. `start()` performs the necessary setup and then invokes `run()` on the new thread. Calling `run()` directly is just an ordinary method call on the current thread, so it does not start concurrent execution.

**In short, call `start()` to start a thread. Calling `run()` directly does not run it on a separate thread.**

## Multithreading

### Concurrency vs. Parallelism

- **Concurrency**: Two or more tasks make progress during the same **period of time**.
- **Parallelism**: Two or more tasks execute at the same **instant**.

The key distinction is whether tasks execute **at the same time**.

### Synchronous vs. Asynchronous Execution

- **Synchronous**: A call waits for its result before it returns.
- **Asynchronous**: A call returns without waiting for its result.

### ⭐️ Why Use Multiple Threads?

At a high level:

- **At the system level:** Threads are lightweight units of execution. Switching and scheduling them is usually cheaper than doing so for processes. On multicore CPUs, multiple threads can also run in parallel.
- **For modern internet services:** Systems may need to handle millions of concurrent operations. Multithreaded programming is one foundation for building systems with high concurrency and throughput.

More specifically:

- **Single-core systems:** Multithreading can improve how a process uses the CPU and I/O devices. If a process has only one thread, an I/O wait blocks that thread. With multiple threads, another thread can use the CPU while the first waits for I/O.
- **Multicore systems:** Multiple threads can use multiple CPU cores. A compute-heavy task that uses only one thread can use only one core, regardless of how many cores are available. If its threads do not contend for resources, splitting the work across cores can improve execution time.

### ⭐️ Does a Single-Core CPU Support Java Multithreading?

A single-core CPU supports Java multithreading. The operating system shares CPU time among threads. Although only one task can run at a time on a single core, fast context switching makes multiple tasks appear to run concurrently.

Java uses the following thread scheduling model.

Operating systems mainly use two approaches to schedule threads:

- **Preemptive scheduling**: The operating system decides when to pause a running thread and switch to another. A timer interrupt or a higher-priority event, such as I/O completion, may trigger the switch. This has context-switching overhead, but generally provides better fairness and CPU utilization.
- **Cooperative scheduling**: A thread voluntarily yields control so another thread can run. This can reduce context-switching overhead, but fairness is weaker and a thread that does not yield can block others.

Java uses preemptive scheduling for platform threads. The JVM delegates their scheduling to the operating system, which typically considers thread priority and time slices. Higher-priority threads may receive more opportunities to use the CPU.

### ⭐️ Do Multiple Threads Always Improve Performance on a Single-Core CPU?

It depends on the workload. Threads generally fall into two categories:

1. **CPU-bound**: Performs computation and logic, using substantial CPU resources.
2. **I/O-bound**: Performs input and output, such as file or network operations, and spends time waiting for I/O devices rather than using the CPU.

On a single-core CPU, only one thread runs at a time, while the others wait for a time slice. Multiple CPU-bound threads can cause frequent context switches and reduce efficiency. Multiple I/O-bound threads can use CPU time that would otherwise be idle while another thread waits for I/O.

So, on a single-core CPU, many threads can hurt CPU-bound work and help I/O-bound work. In either case, the number of threads should stay within what the system can handle.

### What Problems Can Multithreading Cause?

Concurrency is often used to improve throughput and execution time, but it does not always make a program faster. It can also introduce issues such as memory leaks, deadlocks, and thread-safety bugs.

### What Do Thread-Safe and Thread-Unsafe Mean?

Thread safety describes whether concurrent access to shared data preserves its correctness and consistency.

- Thread-safe code preserves the correctness and consistency of shared data, regardless of how many threads access it concurrently.
- Thread-unsafe code may produce inconsistent, incorrect, or lost data when multiple threads access it at the same time.

## ⭐️ Deadlocks

### What Is a Thread Deadlock?

A deadlock occurs when multiple threads are blocked, each waiting for a resource to be released by another. Since they remain blocked indefinitely, the program cannot finish normally.

In the diagram below, Thread A holds resource 1 and waits for resource 2, while Thread B holds resource 2 and waits for resource 1. They wait on each other, creating a deadlock.

![Deadlock scenario: Thread A holds resource1 and waits for resource2, while Thread B holds resource2 and waits for resource1, forming a cycle](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/dead-lock-deadlock-scenario.png)

The following example reproduces the deadlock shown above (from _Beautiful Concurrency_):

```java
public class DeadLockDemo {
    private static Object resource1 = new Object(); // Resource 1
    private static Object resource2 = new Object(); // Resource 2

    public static void main(String[] args) {
        new Thread(() -> {
            synchronized (resource1) {
                System.out.println(Thread.currentThread() + "get resource1");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread() + "waiting get resource2");
                synchronized (resource2) {
                    System.out.println(Thread.currentThread() + "get resource2");
                }
            }
        }, "Thread 1").start();

        new Thread(() -> {
            synchronized (resource2) {
                System.out.println(Thread.currentThread() + "get resource2");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread() + "waiting get resource1");
                synchronized (resource1) {
                    System.out.println(Thread.currentThread() + "get resource1");
                }
            }
        }, "Thread 2").start();
    }
}
```

Output

```plain
Thread[Thread 1,5,main]get resource1
Thread[Thread 2,5,main]get resource2
Thread[Thread 1,5,main]waiting get resource2
Thread[Thread 2,5,main]waiting get resource1
```

Thread A acquires the monitor for `resource1` with `synchronized (resource1)`, then calls `Thread.sleep(1000)` to give Thread B time to acquire the monitor for `resource2`. After both threads wake, each tries to acquire the resource held by the other. They wait indefinitely, causing a deadlock.

The example meets the four necessary conditions for deadlock:

1. **Mutual exclusion**: Only one thread can hold a resource at a time.
2. **Hold and wait**: A thread holds its current resources while waiting for additional ones.
3. **No preemption**: A resource cannot be forcibly taken from a thread; the thread releases it after use.
4. **Circular wait**: Threads form a cycle in which each waits for a resource held by the next.

### How Do You Detect a Deadlock?

- Use `jstack <pid>` or `jcmd <pid> Thread.print -l` to inspect thread stacks and lock information. If a Java-level deadlock is detected, the output lists the threads involved and the locks they hold or await. `jmap` is mainly used to inspect heap information or create a heap dump; it is not a thread deadlock diagnostic tool.
- Use tools such as VisualVM or JConsole to investigate.

The following steps use JConsole as an example.

First, find the JDK `bin` directory and open `jconsole`.

![jconsole](https://oss.javaguide.cn/github/javaguide/java/concurrent/jdk-home-bin-jconsole.png)

On macOS, run `/usr/libexec/java_home -V` to find the JDK installation directory, then open it with `open . <directory>`. For example:

```bash
 open . /Users/guide/Library/Java/JavaVirtualMachines/corretto-1.8.0_252/Contents/Home
```

After opening JConsole, connect to the target process, open the Threads tab, and select **Detect Deadlock**.

![Detecting a deadlock with JConsole](https://oss.javaguide.cn/github/javaguide/java/concurrent/jconsole-check-deadlock.png)

![JConsole detects a deadlock](https://oss.javaguide.cn/github/javaguide/java/concurrent/jconsole-check-deadlock-done.png)

### How Can You Prevent and Avoid Deadlocks?

**How can you prevent deadlocks?** Break one of the necessary conditions:

1. **Break hold and wait**: Acquire all required resources at once.
2. **Break no preemption**: If a thread holding some resources cannot acquire another, have it release the resources it already holds.
3. **Break circular wait**: Acquire resources in a fixed order and release them in reverse order.

**How can you avoid deadlocks?**

Avoid deadlocks by using an algorithm, such as the Banker's algorithm, to evaluate resource allocation and keep the system in a safe state.

> **Safe state** means the system can allocate resources to threads in some order (`P1`, `P2`, `P3`, …, `Pn`) until each thread can meet its maximum resource needs and finish. The sequence `<P1, P2, P3, ..., Pn>` is called a safe sequence.

Changing Thread 2's code as follows avoids the deadlock:

```java
new Thread(() -> {
            synchronized (resource1) {
                System.out.println(Thread.currentThread() + "get resource1");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread() + "waiting get resource2");
                synchronized (resource2) {
                    System.out.println(Thread.currentThread() + "get resource2");
                }
            }
        }, "Thread 2").start();
```

Output:

```plain
Thread[Thread 1,5,main]get resource1
Thread[Thread 1,5,main]waiting get resource2
Thread[Thread 1,5,main]get resource2
Thread[Thread 2,5,main]get resource1
Thread[Thread 2,5,main]waiting get resource2
Thread[Thread 2,5,main]get resource2

Process finished with exit code 0
```

Why does this code avoid deadlock?

Thread 1 acquires the monitor for `resource1`, so Thread 2 cannot acquire it. Thread 1 then acquires the monitor for `resource2`. After Thread 1 releases both monitors, Thread 2 can acquire them and continue. This breaks the circular wait condition and avoids deadlock.

<!-- @include: @article-footer.snippet.md -->
