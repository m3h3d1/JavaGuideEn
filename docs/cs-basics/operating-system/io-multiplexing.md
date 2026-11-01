---
title: "I/O Multiplexing: How select, poll, and epoll Work"
description: Common I/O multiplexing interview topics, from the two stages of network reads to select, poll, epoll, their data structures and performance, LT/ET modes, and use in Redis, Nginx, Java NIO, and Netty.
category: Computer Science Fundamentals
tag:
  - Operating Systems
  - Network Programming
  - Linux
head:
  - - meta
    - name: keywords
      content: I/O multiplexing,select,poll,epoll,Linux epoll,LT,ET,Java NIO,Netty,Redis,Nginx,operating system interview questions
---

A straightforward TCP server might accept a connection and start a new thread to `read`, process, and `write`. This works well with a small number of connections.

At tens of thousands of connections, problems appear. On many Linux distributions, a new thread reserves several megabytes of stack address space; 8 MB is common, though the actual value depends on `ulimit -s`, the runtime, and thread attributes. Even with stack pages committed on demand, the reserved address space, used stack pages, and thread metadata add up. Thousands of threads competing for a handful of CPU cores also spend significant time in context switches instead of doing useful work. Most connections are idle, each occupying a thread that waits for data.

This is the classic C10K problem: **how can one or a few threads watch thousands of connections and handle whichever receives data?**

The answer is **I/O multiplexing**.

This article follows `select`, `poll`, and `epoll`. They address the same problem, with different designs and tradeoffs.

## What Is I/O Multiplexing?

To understand it, first split a network read into two stages:

1. **Wait for data to become ready:** Data is still arriving from the network. The kernel waits for it and copies it into a kernel buffer. This can take a long time.
2. **Copy the data:** Once the data is in the kernel buffer, it is copied into the application's user-space buffer. This is usually quick.

![Network reads first wait for data in the kernel buffer, then copy it to the user buffer with copy_to_user](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/io-multiplexing-io-two-phases.png)

In a blocking model with one thread per connection, the thread gets stuck in the first stage after calling `recv`. It waits for that connection and cannot do other work while waiting.

I/O multiplexing takes a different approach: give the kernel the file descriptors (fds) to watch, then block in a dedicated system call. When any fd becomes ready, the call returns and reports which fds can be read or written. The application then handles those ready fds.

Imagine a server watching ten tables in a restaurant. It does not stand beside the first table until someone is ready to order; it checks them all and goes to the table that signals.

**Multiplexing** refers to many connections; **reuse** refers to handling them with the same thread.

One point is easy to confuse: I/O multiplexing is still **synchronous I/O**. A call such as `select` reports that an fd is ready; the application must still call `recv` to read it. Synchronous does not mean blocking in every case: whether `recv` waits depends on whether the fd is nonblocking and whether the ready state changes before the read. Event loops commonly use nonblocking fds.

## Where Does Multiplexing Fit Among the Five I/O Models?

UNP describes five Unix I/O models. Their differences make the role of multiplexing clearer:

- **Blocking I/O:** The thread sleeps in `recv`; it blocks while waiting for readiness and during the copy. It is simple but ties up a thread.
- **Nonblocking I/O:** `recv` returns `EWOULDBLOCK` immediately when no data is ready. The thread stays active but must poll repeatedly, wasting CPU.
- **I/O multiplexing:** One thread waits for multiple fds in `select`, `poll`, or `epoll`, then handles the ones that are ready. This is the subject of this article.
- **Signal-driven I/O:** Register for `SIGIO`, and the kernel sends a signal when data is ready. It is uncommon.
- **Asynchronous I/O:** Submit a request and return immediately; the application is notified when I/O completes. This describes an API model, while implementation depends on platform and API. For example, Linux glibc's POSIX `aio_read` is mainly implemented with user-space worker threads and is not the same as native kernel asynchronous I/O.

![Comparison of blocking, nonblocking, multiplexed, signal-driven, and asynchronous I/O](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/io-multiplexing-five-io-models.png)

The key question is who performs the final copy from the kernel buffer to the user buffer. In the first four models, the application calls `read` or `recv` to perform it and uses the data after that call returns; these are synchronous models. Whether that call actually sleeps depends on the fd and the data's current state. Asynchronous I/O delegates both waiting and copying to the kernel, then notifies the application on completion. Multiplexing does not make an individual read faster; it lets one thread wait on several connections at once.

## How Does `select` Work?

`select` is an early implementation supported on nearly every platform. Its signature is:

```c
#include <sys/select.h>

int select(int nfds, fd_set *readfds, fd_set *writefds,
           fd_set *exceptfds, struct timeval *timeout);
```

The core data structure, `fd_set`, is a **bitmap**. Each bit represents an fd; a set bit means the application is interested in it. Four macros manipulate the set:

```c
void FD_ZERO(fd_set *set);          // Clear every bit
void FD_SET(int fd, fd_set *set);   // Set the bit for fd
void FD_CLR(int fd, fd_set *set);   // Clear the bit for fd
int  FD_ISSET(int fd, fd_set *set); // Test the bit for fd
```

A simplified echo-server loop looks like this:

```c
fd_set rset;
int maxfd = listenfd;

while (1) {
    FD_ZERO(&rset);                       // Rebuild the set on each iteration
    FD_SET(listenfd, &rset);              // Add the fds to watch again
    for (int i = 0; i < n; i++)
        if (conns[i] >= 0) FD_SET(conns[i], &rset);

    // Ignore write and exception sets; the last NULL means wait indefinitely.
    int ready = select(maxfd + 1, &rset, NULL, NULL, NULL);

    if (FD_ISSET(listenfd, &rset)) {      // Listening fd is ready: a new connection
        int connfd = accept(listenfd, NULL, NULL);
        // Store in conns[], update maxfd
    }
    for (int i = 0; i < n; i++)           // Check each fd: is it ready?
        if (conns[i] >= 0 && FD_ISSET(conns[i], &rset)) {
            // Handle a read event on this connection
        }
}
```

The code reveals several limitations that explain what `poll` and `epoll` improve.

**First, there is a limit on fd numbers.** With Linux/glibc, the `fd_set` bitmap size is determined by glibc's `FD_SETSIZE`, which defaults to 1024 and can safely represent only fds 0 through 1023. This comes from the fixed-size user-space data structure and `FD_*` macros, not a limit in the Linux kernel itself. Using these macros with a larger fd is undefined behavior. Redefining `FD_SETSIZE` or rebuilding the kernel is not a reliable workaround; use `poll` or `epoll` to monitor more connections.

**Second, every call copies the bitmap between user and kernel space.** The application fills it in user space, and `select` copies it into the kernel. On return, the kernel clears bits for fds that are not ready and copies the bitmap back. The kernel's check and writeback range depends on `nfds`, so higher fd numbers and larger sets increase this cost.

**Third, the fd sets are value-result arguments.** The kernel clears bits that are not ready before returning. The application must run `FD_ZERO` and `FD_SET` again for every iteration; it cannot reuse the previous interest set unchanged.

**Fourth, the application still scans O(N) fds.** The return value gives the number of ready fds. Their identities are indicated in the modified `fd_set`, so the application must still walk the candidate range and call `FD_ISSET`. Even if only one of ten thousand connections has data, it may have to check all ten thousand.

The `timeout` parameter supports a few modes: `NULL` waits indefinitely; a zero `timeval` returns immediately for polling; and a positive value sets the maximum wait.

## What Does `poll` Improve?

`poll` has a similar model to `select` but uses an array of `pollfd` structures instead of a bitmap:

```c
#include <poll.h>

struct pollfd {
    int   fd;       // File descriptor to watch
    short events;   // Events of interest, such as POLLIN
    short revents;  // Events that occurred; filled by the kernel
};

int poll(struct pollfd *fds, nfds_t nfds, int timeout);
```

A simplified loop looks like this:

```c
struct pollfd fds[MAX];
fds[0].fd = listenfd;
fds[0].events = POLLIN;
// For other fds: fds[i].fd = connfd; fds[i].events = POLLIN;

while (1) {
    int ready = poll(fds, nfds, -1);      // -1 waits indefinitely
    for (int i = 0; i < nfds; i++) {
        if (fds[i].revents & POLLIN) {    // Kernel writes results to revents
            // Handle a read event
        }
    }
}
```

Compared with `select`, `poll` improves two things:

**There is no 1024-fd limit.** The number of fds depends on the size of the array, rather than `FD_SETSIZE`. The main limits are the process's open-fd limit and available memory.

**Interest and result fields are separate.** The application fills `events`; the kernel writes `revents`. The next iteration does not need to rebuild the interest set as `select` does.

But `poll` does not fix the two main performance costs of `select`: each call still copies the whole array from user space to kernel space, and the application still scans O(N) entries to find the ready fds. The cost remains linear as connection count grows.

In short, `poll` cleans up the `select` interface but not its performance model. `epoll` changes the model.

## Why Is `epoll` a Major Change?

`epoll` is Linux-specific. Implemented by Davide Libenzi, it was introduced in kernel **2.5.44**, with glibc wrappers available starting in glibc 2.3.2. It divides “do everything in one system call” into three operations:

```c
#include <sys/epoll.h>

int epoll_create1(int flags);  // Create an epoll instance and return an fd
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event); // Change watched fds
int epoll_wait(int epfd, struct epoll_event *events,
               int maxevents, int timeout); // Wait for ready events
```

`epoll_ctl` accepts three operations: `EPOLL_CTL_ADD`, `EPOLL_CTL_MOD`, and `EPOLL_CTL_DEL`. An `epoll_event` describes the event:

```c
typedef union epoll_data {
    void     *ptr;
    int       fd;
    uint32_t  u32;
    uint64_t  u64;
} epoll_data_t;

struct epoll_event {
    uint32_t     events;   // Event types, such as EPOLLIN, EPOLLOUT, EPOLLET
    epoll_data_t data;     // User data returned unchanged by epoll_wait, often an fd
};
```

A simplified use looks like this:

```c
int epfd = epoll_create1(0);              // Create the instance

struct epoll_event ev;
ev.events = EPOLLIN;                       // Watch for readability; LT by default
ev.data.fd = listenfd;
epoll_ctl(epfd, EPOLL_CTL_ADD, listenfd, &ev); // Register once

struct epoll_event events[MAX_EVENTS];
while (1) {
    // Return only ready fds; n is the number of ready events.
    int n = epoll_wait(epfd, events, MAX_EVENTS, -1);
    for (int i = 0; i < n; i++) {          // Visit ready fds only
        int fd = events[i].data.fd;
        if (fd == listenfd) {
            int connfd = accept(listenfd, NULL, NULL);
            ev.events = EPOLLIN;
            ev.data.fd = connfd;
            epoll_ctl(epfd, EPOLL_CTL_ADD, connfd, &ev); // Register new connection
        } else {
            // Handle a read event on fd
        }
    }
}
```

Compared with the `select` example, registration and waiting are separate. The `events` array returned by `epoll_wait` contains only ready fds, so the application does not need to check every fd.

This is more than an interface change; it reflects a different internal data structure. An epoll instance corresponds to an `eventpoll` structure in the kernel, with two important components:

- **Red-black tree (`rbr`):** Stores fds registered with `epoll_ctl`, with an `epitem` node for each. Add, remove, and update operations are O(log N). Each fd is registered once and remains in the kernel, rather than having the full list copied on every wait as with `select` or `poll`.
- **Ready list (`rdllist`):** A doubly linked list of fds that are ready.

![epoll maintains an interest list; callbacks add ready fds to a ready list that epoll_wait returns](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/io-multiplexing-epoll-architecture.png)

Callbacks are central to the design. When `epoll_ctl` registers an fd, the kernel installs a callback for it. When data arrives or the fd becomes readable, the callback adds the ready item to the ready list and wakes threads blocked in `epoll_wait`. The wait call checks whether the ready list has entries: it copies ready events to user space if it does, or sleeps until a callback wakes it. (The red-black tree and ready list describe the current implementation. The user-space contract is the abstraction of a registered set and a ready list; the tree is not a stable ABI.)

This is why epoll is efficient when there are many connections but few active ones. If 100,000 fds are registered and only three receive data, `epoll_wait` handles those three instead of scanning the full set as `select` and `poll` do. The overall cost still includes registration changes (`epoll_ctl`), callbacks, lock contention, and copying ready events to user space. Its advantage also shrinks when nearly every connection is active. In short: `select` and `poll` pass the full set to the kernel and scan it on every wait; `epoll` keeps the set in the kernel and returns ready events, making it a good fit for many fds with a low active proportion.

Epoll also avoids repeatedly copying the registration set. Fds are registered in the tree through `epoll_ctl` once, and later `epoll_wait` calls do not resend the whole list.

One common claim is wrong: “epoll is fast because it uses `mmap` to share memory between user and kernel space.” The kernel implementation copies ready events to the user-space `events` array with `__put_user`; there is no mmap shared region. The copy it avoids is the repeated transfer of the full fd list required by `select` and `poll`, not the copy of ready events on return. These are different costs.

## What Is the Difference Between Level- and Edge-Triggered Modes?

Epoll supports two triggering modes, one of its differences from `select` and `poll` and a common source of mistakes.

**Level-triggered (LT)** is the default. As long as data remains unread (or buffer space remains writable), each `epoll_wait` continues to report the fd. `select` and `poll` support only this mode.

**Edge-triggered (ET)** requires the `EPOLLET` flag. It reports an event when the state changes.

Suppose the peer writes 2 KB to a socket, as in the classic Linux man-page example:

- In LT mode, `epoll_wait` reports readability. If the application reads only 1 KB, the remaining 1 KB causes another notification on the next `epoll_wait`, until all data is read.
- In ET mode, `epoll_wait` reports the change once. If the application reads only 1 KB and returns, the remaining 1 KB may sit in the buffer without another notification unless the peer writes more data and causes another state change.

![LT continues notifying while data remains; ET notifies when the state changes](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/io-multiplexing-lt-vs-et.png)

ET requires two rules: **set the fd to nonblocking**, and **keep reading in a loop until `EAGAIN` or `EWOULDBLOCK`** so the buffer is drained. A typical ET read loop is:

```c
// connfd is nonblocking and was registered with EPOLLET.
while (1) {
    ssize_t n = read(connfd, buf, sizeof(buf));
    if (n > 0) {
        // Process this batch and continue draining the buffer.
    } else if (n == 0) {
        close(connfd);                 // Peer closed the connection
        break;
    } else {  // n < 0
        if (errno == EAGAIN || errno == EWOULDBLOCK)
            break;                      // No more data: normal exit point
        if (errno == EINTR)
            continue;                   // Interrupted by a signal; retry
        close(connfd);                  // A real error occurred
        break;
    }
}
```

With a blocking fd, the final `read` after the buffer is empty can block the whole thread. This is why ET and nonblocking fds go together.

ET can reduce `epoll_wait` wakeups and suits high-throughput systems with careful read/write logic. Its programming burden is higher; failing to drain to `EAGAIN` can leave a connection stalled. Conversely, repeatedly draining one busy fd without a limit can starve others. Production loops often set a per-fd processing budget and rotate through an application-level ready queue. LT is simpler and less error-prone, and is enough for most applications. Performance-sensitive servers such as Nginx may use ET.

A production event loop must handle more than reads. Retry `epoll_wait` if it returns `EINTR`; in ET mode, loop on `accept` until `EAGAIN`; check `EPOLLERR`, `EPOLLHUP`, and `EPOLLRDHUP` alongside read/write events; treat `read` returning 0 as a peer closing its write side; handle short writes by buffering unsent data and enabling `EPOLLOUT` as needed; and consider `EPOLLONESHOT` plus rearming when multiple threads process the same fd.

## Comparing `select`, `poll`, and `epoll`

| Dimension            | `select`                                                             | `poll`                                                                              | `epoll`                                                                                                        |
| -------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Platforms            | Broadly portable; Unix and Windows (mainly sockets on Windows)       | Mainly Unix-like systems                                                            | Linux-specific (Linux 2.6+)                                                                                    |
| Kernel-side tracking | Temporarily checks the fd set on every call                          | Temporarily checks the fd array on every call                                       | Maintains interest and ready lists; current Linux implementation commonly uses a red-black tree and ready list |
| fd limit             | `FD_SETSIZE`; commonly 1024 in Linux/glibc, safely covers fds 0–1023 | No `FD_SETSIZE` limit; constrained by `RLIMIT_NOFILE` and memory                    | No `FD_SETSIZE` limit; constrained by fds, memory, and limits such as `max_user_watches`                       |
| Data passed per wait | Full bitmap each time; kernel modifies it, so it must be rebuilt     | Full `pollfd` array each time; kernel fills `revents`, while `events` can be reused | `epoll_ctl` maintains registrations; `epoll_wait` returns ready events                                         |
| Finding ready fds    | Scan through `nfds - 1`, usually O(N)                                | Scan the full array, O(N)                                                           | Wait does not scan the full set; return cost mainly depends on ready events                                    |
| Trigger modes        | LT only                                                              | LT only                                                                             | LT by default; also ET with `EPOLLET`                                                                          |

![Comparison of select, poll, and epoll data structures, fd limits, wait arguments, scan costs, and trigger modes](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/io-multiplexing-select-poll-epoll.png)

## epoll Is Not a Silver Bullet

It is tempting to conclude that epoll always wins, but there are important limits.

**With few connections that are all active, epoll may not be faster.** Maintaining the tree, callbacks, and ready list has a fixed cost. For dozens of fds that are almost always ready, the straightforward scan used by `select` or `poll` may be cheaper. Epoll is best for **many connections with most idle**, such as tens of thousands of long-lived connections with only a few active at a time.

**Epoll is Linux-specific.** macOS and BSD systems use `kqueue`; Windows uses IOCP. Cross-platform network applications generally use libraries such as libevent or libuv, which select epoll on Linux and the platform equivalent elsewhere.

**Thundering herd:** If multiple processes or threads wait on the same listening fd, one new connection can wake them all even though only one can successfully `accept`. Linux 4.5+ offers `EPOLLEXCLUSIVE` to reduce this, waking one or fewer exclusive waiters. It does not guarantee “exactly one wakeup” in every deployment, such as multiple epoll instances or mixed exclusive and nonexclusive registrations.

**ET can cause correctness bugs.** If the application does not read until `EAGAIN`, remaining data may not trigger another notification and the connection can stall. If in doubt, use LT.

## Where Are These Mechanisms Used?

High-performance components commonly rely on I/O multiplexing.

**Redis** is a classic example of a single-threaded event loop with I/O multiplexing. Rather than starting one thread per client, one thread watches many sockets and invokes the handler for whichever becomes ready. Redis wraps this in `ae.c` and selects epoll, kqueue, or select on different platforms. This is one reason it can handle high concurrency without the context switching and lock contention of a multithreaded design.

![Redis file event handler](https://oss.javaguide.cn/github/javaguide/database/redis/redis-event-handler.png)

Redis 6.0 introduced multithreading, but only for network I/O and protocol parsing; command execution remains single-threaded. The multiplexed event loop is still the core. The added threads distribute the work of reading sockets and parsing requests so it does not become a single-thread bottleneck.

For more detail, see [Common Redis Interview Questions (Part 1)](https://javaguide.cn/database/redis/redis-questions-01.html).

**Nginx** uses multiple processes with epoll and ET mode. Nonblocking sockets keep each wakeup's work small, helping a relatively small number of processes handle many connections.

**Java NIO `Selector`** is Java's multiplexing abstraction. On Linux it uses epoll through `EPollSelectorImpl`; on other operating systems it uses the corresponding implementation. This platform choice is transparent to application code.

![Java NIO Selector selects channels and selection keys](https://oss.javaguide.cn/github/javaguide/java/nio/selector-channel-selectionkey.png)

Netty provides a native epoll transport in addition to standard NIO through `EpollEventLoop`, bypassing the JDK wrapper to improve Linux performance. Behavior differs by version: Netty 4.0's native epoll transport emphasized edge-triggered mode; in Netty 4.2, `EpollMode` is deprecated and the documentation says the transport always uses level-triggered mode. For Netty 4.1, check the source and API for the exact version in use.

For an introduction to Java I/O models, see [Java I/O Models](https://javaguide.cn/java/io/io-model.html).

## How to Explain This in an Interview

If asked what I/O multiplexing solves, do not say it makes one `read` faster. It solves the waiting problem: one thread does not have to block on one connection. It gives a set of fds to `select`, `poll`, or `epoll`, then handles whichever is ready. The application still calls `read`/`recv` to copy data from the kernel buffer to the user buffer, so this remains synchronous I/O.

Explain `select`, `poll`, and `epoll` in three parts. First, the data structures: `select` uses a fixed-size `fd_set` bitmap, commonly limited to 1024 fds in Linux/glibc; `poll` uses a `pollfd` array and avoids `FD_SETSIZE`, but passes the array on every call; `epoll` keeps registrations in the kernel and uses `epoll_ctl` to add, change, and remove fds while `epoll_wait` returns ready events.

Second, the performance model: `select` and `poll` pass the full set on every wait and scan linearly after returning, which is costly with many mostly idle connections. Epoll suits many fds with few active connections because it does not scan the full set during a wait. It is not always faster; tree, callback, and ready-list maintenance has a fixed cost when there are few active fds.

Third, LT and ET: LT is the default and reports the fd again while unread data remains. ET reports a state change once, so it requires nonblocking fds and reads in a loop until `EAGAIN`. Mentioning `EINTR`, short writes, and `EPOLLHUP`/`EPOLLERR` shows awareness of production edge cases.

## References

- [W. Richard Stevens, UNIX Network Programming, Chapter 6: select/poll and the five I/O models](https://notes.shichao.io/unp/ch6/)
- [epoll(7) - Linux manual page](https://man7.org/linux/man-pages/man7/epoll.7.html)
- [epoll_create(2), epoll_ctl(2), and epoll_wait(2) - Linux manual pages](https://man7.org/linux/man-pages/man2/epoll_ctl.2.html)
- [epoll final interface (LWN: epoll's introduction in 2.5.44)](https://lwn.net/Articles/16026/)
