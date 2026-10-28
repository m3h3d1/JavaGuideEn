---
title: JDK Monitoring and Troubleshooting Tools
description: A summary of commonly used JDK monitoring and troubleshooting tools, with examples for diagnosing JVM problems.
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: JDK tools,jps,jstat,jmap,jstack,VisualVM,diagnostics,monitoring
---

## JDK Command-Line Tools

These commands are located in the `bin` directory of the JDK installation:

- **`jps`** (JVM Process Status): Similar to the UNIX `ps` command. It lists Java processes and information such as their main classes and JVM arguments.
- **`jstat`** (JVM Statistics Monitoring Tool): Collects runtime data from different parts of the HotSpot VM.
- **`jinfo`** (Configuration Info for Java): Displays VM configuration information.
- **`jmap`** (Memory Map for Java): Creates heap dump snapshots.
- **`jhat`** (JVM Heap Dump Browser): Analyzes heap dump files by starting an HTTP/HTML server that displays results in a browser. JDK 9 removed `jhat`.
- **`jstack`** (Stack Trace for Java): Creates a snapshot of the thread stacks and methods executing in the VM at a given time.

### `jps`: List Java Processes

The `jps` (JVM Process Status) command is similar to UNIX `ps`. It lists JVM processes the current user can access and the tool can detect; it does not guarantee that it will find every Java process on the system.

`jps` displays the main class name and each process's local VM identifier (LVMID). `jps -q` prints only the LVMIDs.

```powershell
C:\Users\SnailClimb>jps
7360 NettyClient2
17396
7972 Launcher
16504 Jps
17340 NettyServer
```

`jps -l` prints the fully qualified main class name, or the JAR path if the process was started from a JAR file.

```powershell
C:\Users\SnailClimb>jps -l
7360 firstNettyDemo.NettyClient2
17396
7972 org.jetbrains.jps.cmdline.Launcher
16492 sun.tools.jps.Jps
17340 firstNettyDemo.NettyServer
```

`jps -v` prints the JVM arguments used to start each process.

`jps -m` prints the arguments passed to the Java process's `main()` method.

### `jstat`: Monitor VM Runtime Statistics

`jstat` (JVM Statistics Monitoring Tool) is a command-line utility for monitoring VM runtime statistics. It can display class, memory, garbage collection, and JIT compilation data for local or remote VM processes (remote monitoring requires RMI support on the remote host). On servers without a GUI, it is a useful first tool for diagnosing VM performance problems at runtime.

**Command syntax:**

```powershell
jstat -<option> [-t] [-h<lines>] <vmid> [<interval> [<count>]]
```

For example, `jstat -gc -h3 31736 1000 10` reports GC statistics for process 31736 every 1,000 ms, stops after 10 reports, and prints a header every three lines.

**Common options include:**

- `jstat -class vmid`: Displays class loader statistics.
- `jstat -compiler vmid`: Displays JIT compilation statistics.
- `jstat -gc vmid`: Displays GC-related heap statistics.
- `jstat -gccapacity vmid`: Displays the capacity and usage of each generation.
- `jstat -gcnew vmid`: Displays young-generation statistics.
- `jstat -gcnewcapacity vmid`: Displays young-generation size and usage.
- `jstat -gcold vmid`: Displays old-generation statistics. On modern JDKs, the output also includes Metaspace and compressed class space statistics.
- `jstat -gcoldcapacity vmid`: Displays old-generation capacity.
- `jstat -gcpermcapacity vmid`: Displays PermGen capacity. This option was removed in JDK 8; use `-gcmetacapacity` on modern JDKs to view Metaspace capacity statistics.
- `jstat -gcutil vmid`: Displays GC utilization statistics.

Add `-t` to include a `Timestamp` column showing the process's uptime.

### `jinfo`: View and Adjust VM Options at Runtime

`jinfo vmid` prints all options and system properties for the current JVM process. The first section contains system properties; the second contains JVM options.

`jinfo -flag name vmid` prints the value of the named option, such as `MaxHeapSize`. The examples below for viewing and changing `PrintGC` apply to JDK 8. For GC logging in JDK 9 and later, use unified logging with `-Xlog`; `jcmd VM.log` can adjust it at runtime.

```powershell
C:\Users\SnailClimb>jinfo  -flag MaxHeapSize 17340
-XX:MaxHeapSize=2124414976
C:\Users\SnailClimb>jinfo  -flag PrintGC 17340
-XX:-PrintGC
```

`jinfo` can change some JVM options marked as manageable without restarting the VM. Not all options support runtime changes. The following example is for JDK 8:

`jinfo -flag [+|-]name vmid` enables or disables the named option.

```powershell
C:\Users\SnailClimb>jinfo  -flag  PrintGC 17340
-XX:-PrintGC

C:\Users\SnailClimb>jinfo  -flag  +PrintGC 17340

C:\Users\SnailClimb>jinfo  -flag  PrintGC 17340
-XX:+PrintGC
```

### `jmap`: Create Heap Dumps

The `jmap` (Memory Map for Java) command creates heap dumps. You can also use `-XX:+HeapDumpOnOutOfMemoryError` to have the VM create a dump file automatically when an OOM occurs. On Linux and macOS, `kill -3 <pid>` sends `SIGQUIT`; HotSpot prints Java thread stacks to standard error, producing a thread dump, not a heap dump.

`jmap` can do more than create dump files; it can also report information about the finalizer queue, Java heap, and class loaders. Available subcommands vary by JDK version. PermGen exists only in older HotSpot versions; modern JDKs report Metaspace or class loader statistics instead. As with `jinfo`, some `jmap` features depend on operating system support and permission to attach to the target process.

Example: write a heap dump for the specified application to the desktop. You can then analyze it with tools such as `jhat` or VisualVM.

```powershell
C:\Users\SnailClimb>jmap -dump:format=b,file=C:\Users\SnailClimb\Desktop\heap.hprof 17340
Dumping heap to C:\Users\SnailClimb\Desktop\heap.hprof ...
Heap dump file created
```

### **`jhat`**: Analyze Heap Dumps

**`jhat`** analyzes heap dump files by starting an HTTP/HTML server that displays the results in a browser.

```powershell
C:\Users\SnailClimb>jhat C:\Users\SnailClimb\Desktop\heap.hprof
Reading from C:\Users\SnailClimb\Desktop\heap.hprof...
Dump file created Sat May 04 12:30:31 CST 2019
Snapshot read, resolving...
Resolving 131419 objects...
Chasing references, expect 26 dots..........................
Eliminating duplicate references..........................
Snapshot resolved.
Started HTTP server on port 7000
Server is ready.
```

Open <http://localhost:7000/>.

⚠️ Note: JDK 9 removed `jhat` ([JEP 241: Remove the jhat Tool](https://openjdk.org/jeps/241)). Alternatives include the Eclipse Memory Analyzer Tool (MAT) and VisualVM.

### **`jstack`**: Create Thread Dumps

The `jstack` (Stack Trace for Java) command creates a snapshot of the thread stacks in the VM at a given time.

Thread dumps help identify why threads are stalled for a long time. Causes include deadlocks, infinite loops, and long waits for external resources. A `jstack` dump shows what unresponsive threads are doing or which resources they are waiting for.

**The following code uses sleeps to increase the chance that two threads hold locks the other needs. It demonstrates how to detect a deadlock with `jstack`. Thread scheduling is not deterministic, so the deadlock is not guaranteed to occur on every run.**

```java
public class DeadLockDemo {
    private static Object resource1 = new Object(); // Resource 1.
    private static Object resource2 = new Object(); // Resource 2.

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

Output:

```plain
Thread[Thread 1,5,main]get resource1
Thread[Thread 2,5,main]get resource2
Thread[Thread 1,5,main]waiting get resource2
Thread[Thread 2,5,main]waiting get resource1
```

Thread A acquires the monitor lock for `resource1` with `synchronized (resource1)`, then calls `Thread.sleep(1000);` to give Thread B time to run and acquire the monitor lock for `resource2`. After both threads wake up, each tries to acquire the other's resource. They end up waiting on each other, creating a deadlock.

**Inspect the process with `jstack`:**

```powershell
C:\Users\SnailClimb>jps
13792 KotlinCompileDaemon
7360 NettyClient2
17396
7972 Launcher
8932 Launcher
9256 DeadLockDemo
10764 Jps
17340 NettyServer

C:\Users\SnailClimb>jstack 9256
```

Part of the output looks like this:

```powershell
Found one Java-level deadlock:
=============================
"Thread 2":
  waiting to lock monitor 0x000000000333e668 (object 0x00000000d5efe1c0, a java.lang.Object),
  which is held by "Thread 1"
"Thread 1":
  waiting to lock monitor 0x000000000333be88 (object 0x00000000d5efe1d0, a java.lang.Object),
  which is held by "Thread 2"

Java stack information for the threads listed above:
===================================================
"Thread 2":
        at DeadLockDemo.lambda$main$1(DeadLockDemo.java:31)
        - waiting to lock <0x00000000d5efe1c0> (a java.lang.Object)
        - locked <0x00000000d5efe1d0> (a java.lang.Object)
        at DeadLockDemo$$Lambda$2/1078694789.run(Unknown Source)
        at java.lang.Thread.run(Thread.java:748)
"Thread 1":
        at DeadLockDemo.lambda$main$0(DeadLockDemo.java:16)
        - waiting to lock <0x00000000d5efe1d0> (a java.lang.Object)
        - locked <0x00000000d5efe1c0> (a java.lang.Object)
        at DeadLockDemo$$Lambda$1/1324119927.run(Unknown Source)
        at java.lang.Thread.run(Thread.java:748)

Found 1 deadlock.
```

The `jstack` output identifies the threads involved in the deadlock.

## JDK Visual Analysis Tools

### JConsole: Java Monitoring and Management Console

JConsole is a visual monitoring and management tool based on JMX. It can monitor memory usage in local and remote Java processes. Start it by running `jconsole` in a terminal or double-clicking `jconsole.exe` in the JDK's `bin` directory.

#### Connect to JConsole

![Connect to JConsole](./pictures/jdk监控和故障处理工具总结/1JConsole连接.png)

To connect JConsole to a remote process, start the remote Java application with these options:

```properties
-Djava.rmi.server.hostname=your.public.ip.address
-Dcom.sun.management.jmxremote.port=60001   // Monitoring port.
-Dcom.sun.management.jmxremote.authenticate=false   // Disable authentication.
-Dcom.sun.management.jmxremote.ssl=false
```

This example disables both authentication and SSL, so it is suitable only for controlled local development or an isolated test environment. Oracle notes that this configuration lets remote users who can reach the port monitor and control the application. In production, enable authentication and secure transport, and restrict access to the port through network controls.

Use the following address to connect to the remote process in JConsole:

```plain
your.public.ip.address:60001
```

#### View Java Application Overview

![Java application overview](./pictures/jdk监控和故障处理工具总结/2查看Java程序概况.png)

#### Monitor Memory

JConsole displays detailed memory information. It shows overall heap and non-heap usage and can break usage down into areas such as Eden and Survivor spaces, as shown below.

Clicking **Perform GC (G)** sends an explicit garbage collection request through the management interface. This is similar to calling `System.gc()`; the JVM does not guarantee that collection will run or that it will take the form of a Full GC.

> - **Young-generation GC (Minor GC):** A collection of the young generation. Minor GCs are often frequent and usually quick.
> - **Old-generation GC (Major GC/Old GC):** A collection of the old generation. Sources do not use "Major GC" consistently; some use it for a full-heap collection. Check the collector and log event when interpreting GC logs.
> - **Full GC:** A collection of the entire Java heap, often with a longer pause. Its duration depends on factors such as heap size, live objects, and the collector, so it cannot be compared with Minor GC using a fixed multiplier.

![Memory monitoring](./pictures/jdk监控和故障处理工具总结/3内存监控.png)

#### Monitor Threads

This provides a visual alternative to the `jstack` command described above.

The **Detect Deadlock (D)** button at the bottom finds deadlocked threads and displays details about them.

![Thread monitoring](./pictures/jdk监控和故障处理工具总结/4线程监控.png)

### VisualVM: All-in-One Troubleshooting Tool

VisualVM provides details about Java applications running on the Java Virtual Machine (JVM). Its graphical interface makes it easy to inspect multiple applications. See the [VisualVM website](https://visualvm.github.io/) and [documentation](https://visualvm.github.io/documentation.html).

The following description is from _Understanding the Java Virtual Machine_:

> VisualVM (All-in-One Java Troubleshooting Tool) provides runtime monitoring, troubleshooting, and profiling. Java VisualVM was included with Oracle JDK 6 through 8, but has not been bundled with the JDK since Oracle JDK 9. It is now generally downloaded separately. Before profiling in production, assess the overhead of the selected sampling or instrumentation mode.

VisualVM is built on the NetBeans platform and supports plugins. With plugins, it can:

- Display VM processes and their configuration and environment information (`jps`, `jinfo`).
- Monitor application CPU, GC, heap, method area, and thread data (`jstat`, `jstack`).
- Create and analyze heap dumps (`jmap`, `jhat`).
- Profile application performance at the method level to find the most frequently called and longest-running methods.
- Create offline snapshots containing runtime configuration, thread dumps, and memory dumps for sharing with developers when reporting bugs.
- Extend functionality with other plugins.

For more information about using VisualVM, see:

- <https://visualvm.github.io/documentation.html>
- <https://www.ibm.com/developerworks/cn/java/j-lo-visualvm/index.html>

### MAT: Memory Analyzer Tool

MAT (Memory Analyzer Tool) is a powerful tool for offline analysis of JVM heap memory. It displays heap dump snapshots captured during JVM failures, though dumps can also be captured while the JVM is running. This helps identify memory leaks and optimize code that consumes large amounts of memory.

MAT is often a good first choice for analyzing dump files when investigating OOM and GC problems.

For more on MAT, see these two guides:

- [A detailed guide to using MAT for JVM memory analysis: Getting started](https://juejin.cn/post/6908665391136899079)
- [A detailed guide to using MAT for JVM memory analysis: Advanced topics](https://juejin.cn/post/6911624328472133646)

<!-- @include: @article-footer.snippet.md -->
