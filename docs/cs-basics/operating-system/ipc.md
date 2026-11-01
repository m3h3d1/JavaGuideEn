---
title: "Interprocess Communication (IPC): Pipes, Message Queues, Shared Memory, Sockets, and Binder"
description: Common IPC topics, from process address-space isolation to pipes, message queues, shared memory, semaphores, signals, sockets, Android Binder, and microkernel IPC tradeoffs.
category: Computer Science Fundamentals
tag:
  - Operating Systems
  - Linux
  - IPC
head:
  - - meta
    - name: keywords
      content: interprocess communication,IPC,Linux IPC,pipes,FIFO,message queues,shared memory,semaphores,signals,sockets,Unix Domain Socket,Android Binder,microkernel IPC,operating system interview questions
---

Suppose two processes want to exchange data. The simplest idea is for process A to write the data to its memory and process B to read it directly.

Operating systems do not work that way. Each process has its own virtual address space, so address `0x7f...` in process A is not the same memory as `0x7f...` in process B. User-mode processes cannot freely access one another's memory; doing so would defeat isolation.

That is why **IPC (Inter-Process Communication)** relies on mechanisms provided by the operating system.

It helps to think of IPC in terms of three questions: **how data is transferred, how execution is synchronized, and how endpoints are named and access-controlled**. Memorizing names such as pipes, message queues, and shared memory without these roles makes the topic harder to remember.

![Process address-space isolation means processes need operating-system IPC mechanisms to communicate](https://oss.javaguide.cn/github/javaguide/java/new-features/ipc-why-ipc.png)

## What Problems Does IPC Solve?

![IPC addresses data transfer, synchronization, naming, and permission checks](https://oss.javaguide.cn/github/javaguide/java/new-features/what-problem-does-ipc-solve.png)

**First, IPC transfers data.** Pipes and byte-stream sockets carry a continuous sequence of bytes; the application defines message boundaries. Message queues, datagram sockets, and Binder transactions carry messages with boundaries. Shared memory maps the same physical memory into multiple processes, so once the mapping exists, each read or write does not need to enter the kernel.

**IPC also needs synchronization.** Shared memory lets processes see the same data, but does not decide who writes first or when another process may read. If several processes modify a shared ring buffer without a mutex, semaphore, futex, or condition variable, the data can quickly become inconsistent.

**Naming and permissions matter too.** An anonymous pipe is usually set up by inheriting file descriptors after `fork`; a FIFO is named by a filesystem path; System V IPC uses a key and kernel object ID; Unix Domain Sockets can bind to a path or, on Linux, an abstract namespace; Android Binder uses the Service Manager to map service names to Binder references.

## Pipes: Simple Byte Streams With Few Boundaries

A pipe is one of the most familiar IPC mechanisms. In a Shell command such as `ps aux | grep java`, the `|` connects the first process's standard output to the second process's standard input.

On Linux, `pipe()` returns two file descriptors: a read end and a write end. If a parent creates a pipe and then calls `fork()`, the child inherits those descriptors, allowing the parent and child to communicate through the same pipe. An anonymous pipe has no name and is usually used between related processes.

![A pipe passes a one-way byte stream between parent and child through a kernel buffer](https://oss.javaguide.cn/github/javaguide/java/new-features/ipc-pipe-flow.png)

A pipe is a one-way byte stream. POSIX requires only one-way communication; two-way communication usually uses two pipes. It does not preserve message boundaries: three writes by the sender do not guarantee three reads by the receiver. The buffer is in the kernel. A blocking write sleeps when the buffer is full, while a nonblocking write may return `EAGAIN`. A pipe is not a regular file, so `lseek()` cannot reposition within it.

One Linux detail that often comes up in interviews is `PIPE_BUF`, which is 4096 bytes. For a pipe or FIFO, a single `write()` of no more than `PIPE_BUF` bytes is guaranteed not to interleave with data from other writers. In blocking mode, the call may wait for buffer space; in nonblocking mode, insufficient space can result in `EAGAIN`. Larger writes may be split or interleaved with other writers. This guarantee does not give the pipe message boundaries.

A named pipe (FIFO) is a special file created with `mkfifo`. Unrelated processes can open it by path and communicate. The FIFO has a pathname, but its data is not written to disk: the path names the endpoint, while data remains in a kernel buffer.

Pipes are useful for connecting command-line tools or passing a small amount of data between parent and child processes. They are less suitable for complex protocols or large objects. For framed messages with lengths, checksums, and sequence numbers, a Socket or message queue may be a better fit.

## Message Queues: The Kernel Stores Messages

A message queue stores data as separate messages in a kernel object. A sender uses `msgsnd()` or `mq_send()` to enqueue a message; a receiver uses `msgrcv()` or `mq_receive()` to retrieve one. System V and POSIX message queues have different APIs, but both let processes exchange messages through a queue managed by the kernel.

The main advantage over pipes is that **message boundaries are preserved**. System V queues support receiving messages by type. POSIX queues support priorities; `sysconf(_SC_MQ_PRIO_MAX)` commonly returns 32768 on Linux, while POSIX requires support for at least priorities 0 through 31.

The tradeoff is copying: sending copies data from the application buffer into the kernel queue, and receiving copies it back to the receiver's user-space buffer. Queue size is also limited by kernel settings such as `/proc/sys/fs/mqueue/msg_max` and `msgsize_max` for POSIX queues.

Message queues suit small structured messages such as task notifications, state events, and control commands. They are not ideal for large images, audio/video frames, or very large serialized objects. Linux IPC message queues are also different from Kafka or RocketMQ: they do not provide a persistent log, consumer groups, or cross-machine replication.

## Shared Memory: Fewer Copies, More Synchronization Work

Shared memory maps the same physical memory into the virtual address spaces of multiple processes. Once the mapping is established, process A can write to the region and process B can see the update.

Linux commonly provides two interfaces. System V shared memory uses `shmget()`, `shmat()`, `shmdt()`, and `shmctl()`. POSIX shared memory uses `shm_open()` to create an object, `ftruncate()` to set its size, and `mmap()` to map it into each process.

![Shared memory maps the same physical memory into several processes, but still needs semaphores, futexes, or other synchronization](https://oss.javaguide.cn/github/javaguide/java/new-features/ipc-shared-memory.png)

Shared memory can be fast because its data path is short. Pipes, message queues, and sockets typically pass data to the kernel, which then passes it to another process. With shared memory, processes access the same physical pages after mapping, so the data does not need to be copied between user and kernel space for every exchange. It can suit large local data transfers such as log collection, audio/video processing, or database caches.

However, mapping the same memory only solves “can the processes see it?” It does not solve “when is it safe to read?” or “who can write?”

Consider a shared ring buffer. A producer writes data and updates `tail`; the consumer checks `head` and `tail` to see whether data is available. If the producer updates `tail` before a record is fully written, the consumer may read a partial record. Shared memory does not prevent this. The design must define write ordering, visibility, and wakeups. A simple implementation might use a process-shared mutex and POSIX semaphore; a performance-focused one might use `eventfd`, `futex`, atomic variables, and memory barriers.

Avoid storing process-local pointers in shared memory. The same region might map at `0x7000...` in process A and `0x5000...` in process B, so an address written by A is unlikely to be meaningful in B. Shared layouts more often use offsets, array indexes, or a fixed agreed-upon structure.

Do not judge shared memory only by the number of copies. Overall performance also depends on cache coherence, lock contention, memory barriers, wakeups, and data layout. It is a good fit for large local transfers when both sides can manage synchronization and memory layout carefully. For a few status fields or a control command, a message queue, pipe, or Unix Domain Socket is often simpler.

## How Do Semaphores and Signals Differ?

A semaphore often accompanies shared memory, but it does not carry application data. It acts like a counter that controls how many processes may enter a critical section or notifies another process that data is available. POSIX semaphores may be named or unnamed. `sem_post()` increments the count; `sem_wait()` attempts to decrement it and blocks when the count is zero.

A **signal** is more like an asynchronous event notification. `SIGINT` represents a terminal interrupt, `SIGTERM` requests process termination, and `SIGCHLD` reports a child-process state change. Linux supports standard and real-time signals. Signals carry little information, and handlers are restricted to async-signal-safe operations. Production code often has a handler set a `volatile sig_atomic_t` flag, or use async-signal-safe `write(2)` to send a byte to a self-pipe or write a `uint64_t` value to an eventfd, then handle the event in the main loop.

## Sockets: For Local and Network Communication

Sockets are used for local IPC as well as network communication.

Processes on different machines generally use network sockets such as TCP or UDP. Processes on the same machine can use Unix Domain Sockets, with address family `AF_UNIX` or `AF_LOCAL` and types such as `SOCK_STREAM`, `SOCK_DGRAM`, or `SOCK_SEQPACKET`.

Unix Domain Sockets have an interface similar to network sockets and support communication between unrelated processes. On Linux, they can bind to a filesystem path or use an abstract namespace. They can also pass file descriptors with `sendmsg()` ancillary data and `SCM_RIGHTS`. For peer identity, connection-oriented Unix sockets can use `SO_PEERCRED` to get the peer's PID, UID, and GID. Datagram sockets can use `SO_PASSCRED` and `SCM_CREDENTIALS` to attach credentials to messages.

If asked to choose between a pipe and a Unix Domain Socket: a pipe is enough for a simple byte stream between parent and child; a Unix Domain Socket is better for bidirectional request/response, fd passing, or a listening server; use TCP/UDP or a higher-level RPC framework for communication across machines.

## Android Binder: IPC as a System-Service Call

![Android Binder uses AIDL, Parcel, the Binder driver, and Service Manager to expose IPC as system-service calls](https://oss.javaguide.cn/github/javaguide/java/new-features/android-binder-turning-ipc-into-system-service-calls.png)

Binder is the primary IPC mechanism in Android. Applications use it to call system services, communicate with services in other processes, and invoke remote interfaces generated from AIDL.

AIDL defines an interface shared by client and server, and Android's toolchain generates parameter-encoding and proxy code. A client appears to call a local method, but the arguments are packed into a Parcel and sent through the Binder driver as a cross-process transaction. The system's Service Manager registers as the Binder driver's context manager and maps service names to Binder references.

Binder transactions can carry special objects such as Binder objects, handles, and file descriptors. Passing an fd lets Binder work with shared memory: Binder carries control messages and handles, while shared memory carries large data. Android's AIDL documentation also notes that remote calls are dispatched to the service process through a platform-managed Binder thread pool, so service implementations must be thread-safe.

Binder is not designed for large objects. Android's `TransactionTooLargeException` documentation states that the Binder transaction buffer is currently 1 MB and is shared among in-flight transactions in a process. The exception is heuristic: the client cannot know whether failure occurred while sending the request or receiving the response. Prefer small Binder requests, paginated results, fds, or resource identifiers. For large payloads, split the data or use shared memory.

## Why Does IPC Matter So Much in Microkernels?

A monolithic kernel such as Linux keeps many services, including filesystems, network stacks, and drivers, in the kernel. A microkernel moves as many services as possible into user-space processes, such as filesystem, driver, and network services. This can improve isolation, but makes IPC frequent.

Reading a file in a monolithic kernel may require mainly one system call into the kernel. In a microkernel, the request may need several exchanges with a filesystem service and a block-device service. If IPC is slow, the whole system slows down.

That is why IPC optimization has long been a focus of microkernel papers and implementations.

Mach's representative design uses ports. A port can be viewed as a kernel-protected message queue and capability handle: a task needs the appropriate port right to send or receive messages. The L4 family tries to make common IPC paths short. Short messages can use registers, synchronous IPC uses rendezvous-style communication, and a direct process switch can avoid routing through parts of the scheduler. LRPC (Lightweight Remote Procedure Call) pursues the same goal: reducing thread, buffer, and scheduling overhead for calls across protection domains on the same machine.

## How Should You Choose an IPC Mechanism?

Do not ask only “Which one is fastest?” Ask: How large is the data? Are message boundaries needed? Are the processes related? Is bidirectional request/response needed? Does communication cross machines? Are permission and identity checks required?

| IPC mechanism      | Data form                            | Preserves message boundaries? | Suitable for large data?               | Cross-machine?        | Typical use                                      |
| ------------------ | ------------------------------------ | ----------------------------- | -------------------------------------- | --------------------- | ------------------------------------------------ |
| Anonymous pipe     | Byte stream                          | No                            | No                                     | No                    | Parent/child processes, Shell pipelines          |
| FIFO               | Byte stream                          | No                            | No                                     | No                    | Simple communication between unrelated processes |
| Message queue      | Messages                             | Yes                           | No                                     | No                    | Control commands, state events                   |
| Shared memory      | Shared region                        | Defined by the application    | Yes                                    | No                    | Large local data transfers                       |
| Unix Domain Socket | Stream, datagram, sequenced packet   | Depends on type               | Moderate                               | No                    | Local services, fd passing                       |
| TCP/UDP socket     | Stream or datagram                   | Depends on protocol           | Depends on protocol and implementation | Yes                   | Communication across machines                    |
| Binder             | Transactions, object references, fds | Yes                           | Not for large objects directly         | No, Android local IPC | Android system-service calls                     |

![Comparison of common IPC mechanisms by data form, message boundaries, large-data support, and network scope](https://oss.javaguide.cn/github/javaguide/java/new-features/ipc-ipc-comparison.png)

For a small byte stream between parent and child, use a pipe. For bidirectional request/response between unrelated local processes, use a Unix Domain Socket. Message queues suit small structured events. For large data, consider shared memory plus a synchronization notification. Use TCP/UDP or higher-level RPC across machines. Android applications generally use Binder for cross-process service calls.

![Choose IPC based on data size, message boundaries, network scope, and process relationship](https://oss.javaguide.cn/github/javaguide/java/new-features/ipc-ipc-selection.png)

## How to Explain IPC in an Interview

Processes normally cannot access one another's user-space address spaces, so IPC either has the kernel transfer data or asks the kernel to create a shared object or memory mapping.

Pipes, FIFOs, and stream sockets mainly carry bytes, so the application protocol usually defines message boundaries. Message queues preserve boundaries and suit smaller task messages, state changes, and control commands. Shared memory maps the same physical pages into several processes and works well for large local transfers, but the application must handle synchronization and memory layout. Signals are event notifications; semaphores, mutexes, and `futex` are more often used to synchronize access to shared data. Android Binder is a local RPC/transaction mechanism for cross-process service calls.

Choose based on data size, message boundaries, communication scope, process relationship, and permission checks. A pipe is enough to connect parent/child commands; a Unix Domain Socket suits local request/response and fd passing; TCP/UDP or higher-level RPC is appropriate across machines.

If asked why shared memory still needs a semaphore, explain that shared memory only lets two processes see the same data; it does not define access order. Semaphores, process-shared mutexes, `futex`, or `eventfd` can coordinate who writes, who reads, and when partially written data becomes visible.

If asked why Binder is not suitable for large objects, mention Android's 1 MB transaction-buffer limit, shared by in-flight transactions in a process. Binder is better for method arguments, return values, object references, and fds. Split large data into pages or use shared memory.

Rather than memorizing a list, ask: Is the data large? Must message boundaries be preserved? Are the processes on the same machine? Is bidirectional request/response needed? Who handles synchronization and permissions? The answers usually point to the right IPC mechanism.
