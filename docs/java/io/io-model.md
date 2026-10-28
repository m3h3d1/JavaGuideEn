---
title: Java I/O Models Explained
description: A detailed look at BIO, NIO, and AIO, I/O multiplexing, Reactor and Proactor patterns, and the differences between synchronous, asynchronous, blocking, and non-blocking I/O.
category: Java
tag:
  - Java IO
  - Java Fundamentals
head:
  - - meta
    - name: keywords
      content: Java I/O models,BIO,NIO,AIO,blocking I/O,non-blocking I/O,I/O multiplexing,Reactor pattern,Proactor pattern
---

I/O models can be difficult to understand because they involve many low-level operating system concepts. This article took a while to write, and I hope it helps make the topic clearer. I also consulted _UNIX Network Programming_ while preparing it; that book is a challenging read.

_This article may need corrections or additions. Please point them out in the comments so we can improve it together._

## Introduction

I/O is a difficult topic for many developers. This article explains it as I understand it, and I hope it helps.

## I/O

### What Is I/O?

I/O stands for **input/output**.

**Let's start with I/O from the perspective of computer architecture.**

The von Neumann architecture divides a computer into five parts: the arithmetic logic unit, control unit, memory, input devices, and output devices.

![Von Neumann architecture](https://oss.javaguide.cn/github/javaguide/java/io/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9pcy1jbG91ZC5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70.jpeg)

Input devices, such as keyboards, and output devices, such as displays, are peripherals. A network card or disk can act as either an input or an output device.

Input devices send data to the computer; output devices receive data from it.

**From the perspective of computer architecture, I/O describes communication between a computer system and its peripherals.**

**Now let's look at I/O from an application's perspective.**

To maintain stability and security, an operating system divides a process's address space into **user space** and **kernel space**.

Applications normally run in user space. Operations that require privileged access, such as file management, interprocess communication, and memory management, are handled in kernel space. I/O operations therefore depend on the kernel.

Programs in user space cannot access kernel space directly.

To perform I/O, a program makes a system call and asks the operating system to do the work on its behalf.

Therefore, a user process must access kernel space indirectly through a **system call** to perform I/O.

The I/O developers encounter most often is **disk I/O** (reading and writing files) and **network I/O** (sending and receiving requests).

**From an application's perspective, it makes an I/O call (a system call) to the operating system's kernel, which performs the actual I/O operation. The application requests the operation; the kernel carries it out.**

For a traditional read operation, the following two steps typically occur after the application makes an I/O call:

1. The kernel waits for the I/O device to provide data.
2. The kernel copies the data from kernel space to user space.

### What Are the Common I/O Models?

UNIX systems have five I/O models: **synchronous blocking I/O**, **synchronous non-blocking I/O**, **I/O multiplexing**, **signal-driven I/O**, and **asynchronous I/O**.

These are the five I/O models commonly discussed.

## Three Common I/O Models in Java

### BIO (Blocking I/O)

**BIO is a synchronous, blocking I/O model.**

In synchronous blocking I/O, the application blocks after calling `read()` until the kernel has copied the data into user space.

![Source: *Tomcat and Jetty Internals Explained*](https://oss.javaguide.cn/p3-juejin/6a9e704af49b4380bb686f0c96d33b81~tplv-k3u1fbpfcp-watermark.png)

BIO works well when the number of client connections is small. It does not scale well to hundreds of thousands or millions of connections, so higher concurrency calls for a more efficient I/O model.

### NIO (New I/O)

Java NIO was introduced in Java 1.4 in the `java.nio` package. It provides abstractions such as `Channel`, `Selector`, and `Buffer`. The N stands for “New.” NIO supports both blocking and non-blocking channels; selectable channels (`SelectableChannel`) can be configured for non-blocking mode. NIO provides buffer-oriented, channel-based I/O.

In Java NIO, network programming with non-blocking `SelectableChannel` and `Selector` corresponds to the **I/O multiplexing model**. However, the entire `java.nio` package is not synonymous with I/O multiplexing; it also includes file I/O and blocking-channel APIs.

Let's continue to see how these models differ.

First, consider **synchronous non-blocking I/O**.

![Source: *Tomcat and Jetty Internals Explained*](https://oss.javaguide.cn/p3-juejin/bb174e22dbe04bb79fe3fc126aed0c61~tplv-k3u1fbpfcp-watermark.png)

In synchronous non-blocking I/O, the application repeatedly calls `read()`. Although it does not block while waiting for data to become available, the thread blocks while the kernel copies data from kernel space to user space.

Synchronous non-blocking I/O improves on synchronous blocking I/O by polling instead of blocking continuously while waiting for data.

> With synchronous non-blocking I/O, if data is not ready when `read()` is called, the application does not have to wait. It can do a small amount of other work, then call `read()` again to poll. These calls are not necessarily continuous; the application can use the gaps to do useful work.

This model still has a problem: **repeatedly polling with I/O system calls to check whether data is ready consumes CPU resources.**

This is where the **I/O multiplexing model** helps.

![](https://oss.javaguide.cn/github/javaguide/java/io/88ff862764024c3b8567367df11df6ab~tplv-k3u1fbpfcp-watermark.png)

With I/O multiplexing, a thread first calls `select()` to ask the kernel whether data is ready. Once the kernel reports that it is ready, the user thread calls `read()`. The `read()` call can still block while copying data from kernel space to user space.

> System calls for I/O multiplexing include `select` and `epoll`. `select` is supported by nearly all operating systems.
>
> - **`select`**: A kernel system call that checks the readiness of multiple file descriptors at once. It is supported by nearly all operating systems.
> - **`epoll`**: Introduced in the Linux 2.6 kernel, it is a more scalable alternative to `select` that improves I/O event handling.

**I/O multiplexing reduces CPU use by avoiding repeated, unnecessary system calls.**

Java NIO has an important **selector** abstraction, also called a **multiplexer**. A single thread can use it to manage multiple client connections and handle a connection when data becomes available.

![How Buffer, Channel, and Selector work together](https://oss.javaguide.cn/github/javaguide/java/nio/channel-buffer-selector.png)

### AIO (Asynchronous I/O)

AIO usually refers to the asynchronous channel APIs introduced by NIO.2 in Java 7. NIO.2 also includes a new file-system API.

Asynchronous channel operations return immediately. Callers can retrieve the result through a `Future` or provide a `CompletionHandler` to run a callback when the operation completes.

![](https://oss.javaguide.cn/github/javaguide/java/io/3077e72a1af049559e81d18205b56fd7~tplv-k3u1fbpfcp-watermark.png)

AIO is not widely used today. Netty experimented with it but later dropped it because it did not provide much of a performance improvement on Linux.

The following diagram summarizes BIO, NIO, and AIO in Java.

![BIO, NIO, and AIO compared](https://oss.javaguide.cn/github/javaguide/java/nio/bio-aio-nio.png)

## References

- _Tomcat and Jetty Internals Explained_
- How an I/O Operation Works: <https://llc687.top/126.html>
- How Developers Should Understand I/O: <https://www.jianshu.com/p/fa7bdc4f3de7>
- Java NIO Internals Explained in 10 Minutes: <https://www.cnblogs.com/crazymakercircle/p/10225159.html>
- A Guide to I/O Models: Theory: <https://www.cnblogs.com/sheng-jie/p/how-much-you-know-about-io-models.html>
- _UNIX Network Programming, Volume 1: The Sockets Networking API_, section 6.2, “I/O Models”

<!-- @include: @article-footer.snippet.md -->
