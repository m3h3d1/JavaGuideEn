---
title: "Operating Systems: Processes, Memory, Filesystems, I/O, Linux, and Shell"
description: A study and interview guide to processes, threads, IPC, synchronization, deadlocks, virtual memory, zero-copy, I/O multiplexing, filesystems, Linux, and Shell.
category: Computer Science Fundamentals
tag:
  - Operating Systems
  - Linux
  - Shell
sidebar: false
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: operating systems,operating system interview questions,processes,threads,IPC,synchronization,mutex,semaphore,condition variable,futex,deadlock,memory management,virtual memory,zero-copy,I/O multiplexing,select,poll,epoll,filesystem,Linux,Shell,backend interviews
---

This **operating systems guide** is for backend developers studying the fundamentals or preparing for interviews. It covers processes and threads, IPC, synchronization, memory management, virtual memory, zero-copy, I/O multiplexing, filesystems, Linux, and Shell.

## Who This Guide Is For

- Backend developers studying operating system fundamentals.
- Candidates preparing for entry-level or experienced-hire interviews, including interviews at large technology companies.
- Readers who know isolated facts about processes, threads, deadlocks, memory management, or Linux commands but want a coherent understanding.
- Engineers building a foundation for Java concurrency, the JVM, databases, and network programming.

## Key Topics

- Operating systems manage the CPU, memory, files, I/O, and processes. These concepts help explain how higher-level software runs.
- Processes, threads, and IPC are fundamental to concurrent programming, server performance, and troubleshooting.
- Locks, synchronization, deadlocks, context switching, and scheduling are common interview topics.
- Memory management, virtual memory, paging, and page replacement help explain the JVM, databases, and caches.
- Zero-copy and I/O multiplexing help explain high-performance systems such as Kafka, RocketMQ, Redis, Nginx, and Netty.
- Linux and Shell are useful for backend development, deployment, troubleshooting, and automation.

## Recommended Reading Order

1. [Common Operating System Interview Questions (Part 1)](./operating-system-basic-questions-01.md): Start with operating system fundamentals, processes and threads, deadlocks, and memory management.
2. [Common Operating System Interview Questions (Part 2)](./operating-system-basic-questions-02.md): Continue with filesystems, I/O, Linux, and related topics.
3. [Processes and Threads](./process-and-thread.md): Learn about processes, threads, PCB/TCB, `fork`/`exec`/`wait`, thread models, and context switching.
4. [Interrupts, Exceptions, and System Calls](./interrupt-exception-syscall.md): Follow `read()` through hardware interrupts, synchronous exceptions, system calls, signals, page faults, and thread switching.
5. [CPU Scheduling and System Load](./cpu-scheduling-and-load.md): Learn about scheduling algorithms, CFS/EEVDF, load average, CPU usage, and production troubleshooting.
6. [Interprocess Communication (IPC)](./ipc.md): Compare pipes, message queues, shared memory, semaphores, sockets, and Binder.
7. [Operating System Locks and Synchronization](./os-lock-and-sync.md): Understand critical sections, mutexes, semaphores, condition variables, spinlocks, and futexes.
8. [Deadlocks](./dead-lock.md): Learn the four necessary conditions, Java thread deadlock troubleshooting, and database transaction retries.
9. [Operating System Memory Management](./memory-management.md): Understand allocation, fragmentation, page tables, page reclaim, and OOM.
10. [Virtual Memory](./virtual-memory.md): Connect paging, page tables, TLBs, page faults, and page replacement.
11. [Operating System Filesystems](./file-system.md): Learn about files, directories, inodes, VFS, Page Cache, and journaling.
12. [I/O Multiplexing](./io-multiplexing.md): Understand the kernel mechanisms behind handling many connections with one thread.
13. [Zero-Copy](./zero-copy.md): Compare the copy paths and use cases of traditional I/O, `mmap`, `sendfile`, and `splice`.
14. [Linux Fundamentals](./linux-intro.md): Learn about directory structure, file permissions, common commands, and basic troubleshooting.
15. [Shell Scripting](./shell-intro.md): Learn about variables, conditions, loops, functions, and common script patterns.

## Core Guides

- [Common Operating System Interview Questions (Part 1)](./operating-system-basic-questions-01.md): Covers operating system fundamentals, processes and threads, deadlocks, and memory management.
- [Common Operating System Interview Questions (Part 2)](./operating-system-basic-questions-02.md): Continues with filesystems, I/O, multiplexing, Linux, and related topics.
- [Processes and Threads](./process-and-thread.md): Explains resource boundaries, state transitions, Linux process creation, and Java virtual threads.
- [Interrupts, Exceptions, and System Calls](./interrupt-exception-syscall.md): Explains hardware interrupts, synchronous exceptions, system calls, signals, and page faults.
- [CPU Scheduling and System Load](./cpu-scheduling-and-load.md): Covers scheduling, CFS/EEVDF, load average, CPU usage, and troubleshooting commands.
- [Interprocess Communication (IPC)](./ipc.md): Explains common IPC mechanisms, their tradeoffs, and how to choose between them.
- [Operating System Locks and Synchronization](./os-lock-and-sync.md): Covers critical sections, mutexes, semaphores, condition variables, spinlocks, futexes, memory ordering, and kernel locking.
- [Deadlocks](./dead-lock.md): Covers deadlock conditions, resource-allocation graphs, Java troubleshooting, database detection, and retry strategies.
- [Operating System Memory Management](./memory-management.md): Covers VSZ/RSS/PSS, contiguous allocation, fragmentation, the buddy system, page tables, TLBs, page faults, reclaim, and OOM.
- [Virtual Memory](./virtual-memory.md): Covers virtual and physical addresses, paging, multilevel page tables, TLBs, page faults, and page replacement.
- [Operating System Filesystems](./file-system.md): Covers files, directories, inodes, dentries, file descriptors, VFS, Page Cache, `fsync`, and journaling.
- [I/O Multiplexing](./io-multiplexing.md): Covers the two stages of network I/O, five I/O models, and the differences between `select`, `poll`, and `epoll`.
- [Zero-Copy](./zero-copy.md): Explains what zero-copy avoids and how Java NIO, Kafka, and RocketMQ use it.
- [Linux Fundamentals](./linux-intro.md): Covers the Linux directory tree, file permissions, common commands, users, and process management.
- [Shell Scripting](./shell-intro.md): Covers variables, conditions, loops, functions, text processing, and practical scripts.

## Common Questions

- How do processes and threads differ? Which resources do threads share?
- What IPC mechanisms are available, and when is each useful?
- What is a context switch, and what is the impact of frequent context switching?
- What problems do mutexes, semaphores, condition variables, spinlocks, and futexes solve?
- What are the necessary conditions for deadlock? How do you troubleshoot deadlocks in Java and databases?
- What is virtual memory? How do paging and segmentation differ?
- What do TLBs, page faults, and page replacement solve?
- What page-replacement algorithms are there, and what happens during a page fault?
- Why is zero-copy faster? How do `mmap`, `sendfile`, and `splice` differ?
- What are filesystem inodes, hard links, and symbolic links?
- How do `select`, `poll`, and `epoll` differ?
- How do Linux file permissions work, and which troubleshooting commands are useful?
- What kinds of automation are suited to Shell scripts?

## Related Guides

- [Computer Science Fundamentals](../)
- [Computer Networks](../network/)
- [Data Structures](../data-structure/)
- [Java Concurrency](../../java/concurrent/java-concurrent-questions-01.md)
- [JVM Memory Areas](../../java/jvm/memory-area.md)

<!-- @include: @article-footer.snippet.md -->
