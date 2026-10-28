---
title: A Guide to Common JVM Parameters
description: An overview of common JVM parameters and configuration, with practical advice on memory and GC tuning.
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: JVM parameters, heap size, stack size, GC settings, performance tuning, XX options
---

> JavaGuide translated this article from [https://www.baeldung.com/jvm-parameters](https://www.baeldung.com/jvm-parameters) and expanded it with additional material.
> Parameter reference: [https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html)
>
> JDK versions: Primarily JDK 8, with commonly used options from newer releases where relevant.

This guide covers some of the most commonly used Java Virtual Machine (JVM) options and explains how to use them to understand and tune a Java application's runtime environment.

## Heap memory

> The Java heap is the largest memory area managed by the JVM. It is **shared by all threads** and created when the virtual machine starts. **Its only purpose is to store object instances; nearly all object instances and arrays are allocated on the heap.**

![Common memory configuration options](./pictures/内存区域常见配置参数.png)

### Set the heap size (`-Xms` and `-Xmx`)

Setting the initial and maximum heap sizes to match an application's needs is one of the most common performance tuning practices. Setting them to the same value can avoid the cost of resizing the heap at runtime. If you want unused heap memory returned during periods of low load, leave room for the heap to shrink. For example, ZGC cannot return heap memory through uncommit when `-Xms` equals `-Xmx`; choose values based on latency goals and memory costs.

Use these options to set the heap size:

```bash
-Xms<heap size>[unit]  # Set the JVM's initial heap size
-Xmx<heap size>[unit]  # Set the JVM's maximum heap size
```

- `<heap size>`: The memory amount.
- `[unit]`: The unit, such as `g` (GB), `m` (MB), or `k` (KB).

**Example:** Set both the initial and maximum heap sizes to 4 GB:

```bash
-Xms4G -Xmx4G
```

### Set the young generation size

According to the [Oracle documentation](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/sizing.html), after setting the total available heap, the next major factor is the proportion of the heap occupied by the young generation. Its default size depends on the JVM implementation, platform, collector, heap size, and adaptive policies. There is no fixed “minimum 1310 MB” that applies to every environment. `NewSize` and `MaxNewSize` set lower and upper bounds for the young generation, respectively.

For generational collectors that support fixed young-generation sizing, use either of these methods:

**1. Use `-XX:NewSize` and `-XX:MaxNewSize`**

```bash
-XX:NewSize=<young size>[unit]    # Set the initial young generation size
-XX:MaxNewSize=<young size>[unit] # Set the maximum young generation size
```

**Example:** Set the young generation size to a minimum of 512 MB and a maximum of 1024 MB:

```bash
-XX:NewSize=512m -XX:MaxNewSize=1024m
```

**2. Use `-Xmn<young size>[unit]`**

**Example:** Fix the young generation size at 512 MB:

```bash
-Xmn512m
```

Explicitly setting the young generation size limits the collector's ability to adapt. The [Oracle documentation](https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html#extra-options-for-java) specifically advises against setting `-Xmn` with G1. Use the collector's behavior and GC logs to decide whether any tuning is needed.

One useful GC tuning guideline is:

> Let newly created objects be allocated and collected in the young generation where possible, because a Minor GC usually costs much less than a Full GC. Use GC logs to check whether the young generation is sized appropriately. If many new objects are promoted to the old generation too early, consider adjusting its size with `-Xmn` or `-XX:NewSize`/`-XX:MaxNewSize` to reduce direct promotion.

You can also use **`-XX:NewRatio=<int>`** to set the **ratio of the old generation to the entire young generation, including Eden and both Survivor spaces**.

For example, `-XX:NewRatio=2` means old generation : young generation = 2 : 1, so the young generation occupies one-third of the heap. The default depends on the JVM, collector, and platform.

```bash
-XX:NewRatio=2
```

### Set the PermGen or Metaspace size

**Starting with Java 8, class metadata uses native memory. Without a limit set by `-XX:MaxMetaspaceSize`, growing class metadata can consume substantial native memory. PermGen, by contrast, was bounded by `-XX:MaxPermSize`.**

Before PermGen was removed in JDK 8, these options were commonly used to adjust its size:

```bash
-XX:PermSize=N # Initial method area (PermGen) size
-XX:MaxPermSize=N # Maximum method area (PermGen) size; exceeding it throws java.lang.OutOfMemoryError: PermGen
```

Garbage collection in this area was relatively infrequent, but data was not necessarily retained there permanently.

**In JDK 8, the method area implementation in HotSpot (PermGen) was removed and replaced with Metaspace, which uses native memory. The transition had begun in JDK 7.**

Common options include:

```bash
-XX:MetaspaceSize=N # Set the Metaspace threshold for triggering metadata GC (explained below)
-XX:MaxMetaspaceSize=N # Set the maximum Metaspace size
```

**🐛 Correction (see [issue #1947](https://github.com/Snailclimb/JavaGuide/issues/1947)):**

**1. `-XX:MetaspaceSize` does not set the initial capacity:** The initial Metaspace capacity is not set by `-XX:MetaspaceSize`. Regardless of its value, a 64-bit JVM typically starts with a small fixed capacity. Oracle's documentation gives a range of about 12–20 MB; measurements have shown about 20.8 MB.

See the Oracle documentation under [Other Considerations](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/considerations.html):

> Specify a higher value for the option MetaspaceSize to avoid early garbage collections induced for class metadata. The amount of class metadata allocated for an application is application-dependent and general guidelines do not exist for the selection of MetaspaceSize. The default size of MetaspaceSize is platform-dependent and ranges from 12 MB to about 20 MB.
>
> The default MetaspaceSize is platform-dependent and ranges from 12 MB to about 20 MB.

For a practical demonstration, see [A common misconception about the JVM MetaspaceSize option](https://mp.weixin.qq.com/s/jqfppqqd98DfAJHZhFbmxA).

**2. Growth and metadata GC:** When committed Metaspace reaches the high-water mark associated with `-XX:MetaspaceSize`, the JVM triggers garbage collection to try to unload classes and reclaim their metadata. The JVM then adjusts the threshold for the next GC based on how much memory was reclaimed. The type of collection depends on the collector and JDK version, so it should not always be described as a Full GC. Internally, the collector checks whether Metaspace has reached the threshold using `_capacity_until_GC`. Its initialization looks like this:

```c
void MetaspaceGC::initialize() {
  // Set the high-water mark to MaxMetapaceSize during VM initialization since
  // we can't do a GC during initialization.
  _capacity_until_GC = MaxMetaspaceSize;
}
```

**3. What `-XX:MaxMetaspaceSize` does:** If you do not set `-XX:MaxMetaspaceSize`, Metaspace has no fixed upper limit by default, so growing class metadata can consume substantial native memory. Decide whether to set this option, and choose a value, based on metadata usage and the process's native memory budget. A value that is too low can increase metadata GC frequency and trigger `OutOfMemoryError: Metaspace` earlier. There is no recommended value for every application.

Related discussion: [Correction: Not setting MaxMetaspaceSize does not mean memory will be exhausted (issue #1204)](https://github.com/Snailclimb/JavaGuide/issues/1204).

## Garbage collection

### Choose a garbage collector

Choosing the right garbage collector (GC) is important for an application's throughput and latency. For an overview of GC algorithms and collectors, see [JVM Garbage Collection](https://javaguide.cn/java/jvm/jvm-garbage-collection.html).

The JVM provides several GC implementations for different workloads:

- **Serial GC:** Runs GC on a single thread and is suited to client mode or single-core environments. Option: `-XX:+UseSerialGC`.
- **Parallel GC:** Uses multiple threads for young and old generation collection and prioritizes throughput. It is the default GC for the JDK 8 Server VM; in JDK 8, enabling `-XX:+UseParallelGC` also selects Parallel Old by default. Option: `-XX:+UseParallelGC`.
- **CMS GC (Concurrent Mark Sweep):** Aimed at short pauses, with most GC phases running concurrently with application threads. It was deprecated in JDK 9 and removed in JDK 14. Option: `-XX:+UseConcMarkSweepGC`.
- **G1 GC (Garbage-First):** The default GC in HotSpot on typical server-class machines from JDK 9 onward; the default can differ in other environments. It divides the heap into regions and balances throughput with pause-time goals. Option: `-XX:+UseG1GC`.
- **ZGC:** A low-latency collector available in newer JDK releases. Option: `-XX:+UseZGC`.
- **Shenandoah GC:** Another low-pause collector; availability depends on the JDK distribution. Option: `-XX:+UseShenandoahGC`.

### JDK 17 ZGC options

JDK 17 ZGC is non-generational and is enabled with `-XX:+UseZGC`. When tuning, first determine heap and CPU budgets from the workload, then adjust options based on GC logs. Avoid copying another service's entire configuration.

| Option                                 | Meaning and notes                                                                                                                                                                                                                             |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-Xmx`, `-Xms`                         | Maximum and initial/minimum heap size. The heap must hold live objects and leave room for allocations during concurrent collection. `-Xmx` is not the memory limit for the entire Java process.                                               |
| `-XX:ConcGCThreads`                    | Number of concurrent GC threads. Too few may delay collection; too many compete with application threads for CPU. Start with the JVM's adaptive choice and use allocation stalls, CPU limits, and workload data to decide whether to tune it. |
| `-XX:ZAllocationSpikeTolerance`        | Tolerance for sudden increases in allocation rate. The JDK 17 default is `2.0`; it affects predictions about when to collect. It is not a heap growth ratio and does not replace adequate memory headroom.                                    |
| `-XX:ZCollectionInterval`              | Maximum interval between GC cycles, in seconds. The default `0` means this interval does not trigger GC; **it does not disable GC**. It is not a minimum wait time between collections.                                                       |
| `-XX:+ZUncommit`, `-XX:ZUncommitDelay` | Allow unused heap memory to be returned. This is enabled by default in JDK 17, with a default delay of `300` seconds. The heap will not shrink below `-Xms`; this mechanism has no effect when `-Xms` equals `-Xmx`.                          |

For these option semantics, see the [JDK 17 `java` command documentation](https://docs.oracle.com/en/java/javase/17/docs/specs/man/java.html) and the [OpenJDK 17 ZGC option definitions](https://github.com/openjdk/jdk17u/blob/master/src/hotspot/share/gc/z/z_globals.hpp). Options can change between JDK releases; in particular, do not add the generational ZGC option `-XX:+ZGenerational` to JDK 17.

For example, this command records both GC and safepoint logs. Set the heap size separately based on the application's resource budget:

```bash
java -XX:+UseZGC \
  '-Xlog:gc*,safepoint:file=gc.log:time,uptime,level,tags:filecount=5,filesize=20M' \
  -jar app.jar
```

If the logs show an Allocation Stall, investigate allocation rate, live data, available heap, and CPU resources for concurrent GC. Simply shortening the collection interval may not help and can increase CPU usage. A container's memory budget must also account for Metaspace, thread stacks, direct memory, and JVM native overhead; do not set its limit based only on `-Xmx`.

### GC logging

In production and when troubleshooting GC issues, **enable GC logging**. Detailed logs are essential for analyzing and resolving GC problems.

The following are GC logging options for JDK 8:

```bash
# --- Recommended basic configuration ---
# Print detailed GC information
-XX:+PrintGCDetails
# Print timestamps relative to JVM startup
# -XX:+PrintGCTimeStamps
# Print the date and time of each GC (more commonly used)
-XX:+PrintGCDateStamps
# Set the GC log file path; %t expands to a timestamp
-Xloggc:/path/to/gc-%t.log

# --- Recommended advanced configuration ---
# Print object age distribution (useful for checking promotion to the old generation)
-XX:+PrintTenuringDistribution
# Print heap information before and after GC
-XX:+PrintHeapAtGC
# Print processing information for strong, soft, weak, and phantom references
-XX:+PrintReferenceGC
# Print application pause times (Stop-The-World, STW)
-XX:+PrintGCApplicationStoppedTime

# --- GC log rotation ---
# Enable GC log rotation
-XX:+UseGCLogFileRotation
# Set the number of rotated log files to keep (for example, the latest 14)
-XX:NumberOfGCLogFiles=14
# Set the maximum size of each log file (for example, 50 MB)
-XX:GCLogFileSize=50M

# --- Optional diagnostic settings ---
# Print safepoint statistics (useful for analyzing STW causes)
# -XX:+PrintSafepointStatistics
# -XX:PrintSafepointStatisticsCount=1
```

Use the unified JVM logging framework, `-Xlog`, in JDK 9 and later. For example, this configuration records detailed GC information and rotates logs by size:

```bash
-Xlog:gc*:file=/path/to/gc-%t.log:time,uptime,level,tags:filecount=14,filesize=50M
```

Not all legacy options remain available: some are mapped, deprecated, or no longer recognized. For example, `PrintGCDetails` maps to `-Xlog:gc*`, `PrintTenuringDistribution` to `-Xlog:gc+age*=debug`, and `PrintGCApplicationStoppedTime` to `-Xlog:safepoint`. Check the target JDK's `java` command documentation and the output of `java -Xlog:help`.

## Handle out-of-memory errors

Large applications can encounter out-of-memory errors that cause them to crash. Diagnosing these issues can be difficult, and copying another application's settings is unlikely to solve them.

The JVM provides options to write a heap dump to a file, which you can analyze later to look for memory leaks:

```bash
# Write a heap dump when the Java heap is exhausted and an OOME is thrown
-XX:+HeapDumpOnOutOfMemoryError

# Set the heap dump file or directory. For a directory, the JVM uses java_pid<pid>.hprof by default.
-XX:HeapDumpPath=/data/dumps/

# (Optional) Run a command or script when an OOM occurs
# For example, send an alert or attempt to restart the service (use with care)
# -XX:OnOutOfMemoryError="<command> <args>"
# Example: -XX:OnOutOfMemoryError="sh /path/to/notify.sh"

# (Optional) Enable the GC overhead limit check
# If GC takes too much of the total runtime (98% by default) and reclaims very little
# (less than 2% of the heap by default), an OOM is thrown to prevent prolonged GC thrashing.
-XX:+UseGCOverheadLimit
```

## Other useful options

- `-server`: Explicitly enable the HotSpot Server VM. This is usually the default on 64-bit JVMs.
- `-XX:+UseStringDeduplication`: (JDK 8u20+) Try to identify equal `String` objects and share their backing character data to reduce memory use. The backing array is `char[]` in JDK 8 and is usually `byte[]` in modern JDKs with Compact Strings enabled. This option also requires a collector that supports string deduplication, such as G1.
- `-XX:SurvivorRatio=<ratio>`: Set the size ratio between Eden and one Survivor space. For example, `-XX:SurvivorRatio=8` means Eden:Survivor = 8:1.
- `-XX:MaxTenuringThreshold=<threshold>`: Set the maximum age at which an object is promoted from the young to the old generation. An object's age increases by one each time it survives a Minor GC. The default depends on the collector and JDK version; for example, the JDK 8 documentation lists 15 for Parallel GC and 6 for CMS.
- `-XX:+DisableExplicitGC`: Make the JVM ignore explicit GC requests such as `System.gc()`. The JVM can still perform GC when needed. An explicit request does not guarantee a Full GC; evaluate this option in light of direct memory cleanup, framework behavior, and the collector in use.
- `-XX:+UseLargePages`: (Requires OS support) Try to use large memory pages, such as 2 MB instead of 4 KB. This may improve performance for memory-intensive applications, but should be tested carefully.
- `-XX:MinHeapFreeRatio=<percent>` / `-XX:MaxHeapFreeRatio=<percent>`: For collectors that support these options, set the desired heap free-space ratios after GC and influence heap resizing. Behavior depends on the collector; these options do not replace ZGC's sizing and uncommit policies.

**Note:** The following options may be **deprecated, removed, or enabled by default and no longer need to be set manually** in modern JVM releases:

- `-XX:+UseLWPSynchronization`: An older synchronization option; modern JVMs generally use more optimized implementations.
- `-XX:LargePageSizeInBytes`: Usually determined automatically by `-XX:+UseLargePages` or configured through the OS.
- `-XX:+UseStringCache`: Removed.
- `-XX:+UseCompressedStrings`: An old experimental option that has been removed. Compact Strings, introduced in JDK 9, use a different implementation.
- `-XX:+OptimizeStringConcat`: An option for string concatenation optimization in older HotSpot C2 versions. Since JDK 9, concatenation primarily uses `invokedynamic` and `StringConcatFactory`; these are not the same switch.

## Summary

This guide introduces commonly used JVM options to help Java developers understand and improve application performance and stability. The main points are:

1. **Heap sizing:** Set the initial and maximum heap sizes (`-Xms`, `-Xmx`) based on the deployment environment, balancing the performance benefits of a fixed heap against the need to return unused memory. Decide whether to set the young generation size based on the collector and GC logs. `-Xmn` is generally not recommended with G1, and JDK 17's non-generational ZGC has no young generation.
2. **Metaspace management (Java 8+):** `-XX:MetaspaceSize` sets the initial high-water mark that can trigger metadata GC; it does not set Metaspace's initial capacity. `-XX:MaxMetaspaceSize` can limit native memory used by class metadata, but the limit should reflect the application.
3. **Collector choice and logging:** The guide describes when to use different GC algorithms and why detailed GC logs help with troubleshooting in production and test environments. Use legacy GC logging options in JDK 8 and `-Xlog` in JDK 9 and later.
4. **OOM troubleshooting:** Options such as `-XX:+HeapDumpOnOutOfMemoryError` can automatically write a heap dump when an OOM occurs, allowing later analysis for memory leaks.
5. **Other options:** The guide briefly covers useful options such as string deduplication and explains the status of some legacy options.

For troubleshooting and tuning examples, see [JVM Production Troubleshooting and Performance Tuning](https://javaguide.cn/java/jvm/jvm-in-action.html).

<!-- @include: @article-footer.snippet.md -->
