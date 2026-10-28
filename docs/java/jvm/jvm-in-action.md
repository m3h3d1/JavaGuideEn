---
title: "Troubleshooting Java Production Issues: CPU, Memory, GC, Thread Pools, Databases, and Redis"
description: A guide to Java production troubleshooting, covering alerts, incident containment, evidence collection, high CPU, OOM, frequent GC, exhausted pools, slow SQL, Redis latency, message backlogs, and incident reviews.
category: Java
tag:
  - JVM
  - Production Troubleshooting
  - Performance Tuning
  - Java Interviews
sitemap:
  changefreq: monthly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: Java production troubleshooting,JVM troubleshooting,high CPU,OOM,Full GC,thread pool exhaustion,connection pool exhaustion,slow SQL,Redis issues,message queue backlog
---

When an alert fires, it is easy to chase the most prominent graph on the monitoring dashboard. High CPU prompts a thread dump, Full GC prompts a heap check, and a recent release prompts a rollback. But these symptoms can trigger one another: a slow SQL query holds a database connection, waiting for a connection blocks application threads, and latency, error rates, and CPU may all rise. Any one metric alone may not reveal the root cause.

If the incident is still spreading, contain the impact according to the incident plan. If an instance has enough headroom and collecting evidence will not overload the service, save logs, traces, thread stacks, and memory data. A restart may restore service temporarily, but it also erases evidence. Keeping an unhealthy instance in service just to capture a Heap Dump can make the problem worse. Decide whether to remove traffic, roll back, or collect evidence first based on the situation.

This guide covers common issues in Java applications. If the evidence points to container scheduling, the kernel, network devices, or a cloud platform, continue with the relevant platform monitoring and operations guides; those topics are outside this article's scope.

::: warning Production diagnostics
Before running diagnostic commands in production, check whether the instance is still serving traffic, how much disk space remains, and how much overhead the command may cause. Limit the frequency of thread dumps. Heap Dumps, class histograms, and explicit GC requests can add CPU and I/O load or cause pauses. If an instance is close to becoming unavailable, remove its traffic or contain the impact first. Do not keep serving traffic just to preserve evidence.
:::

## What Should You Check After an Alert?

First check whether users are affected. High CPU on one instance, while other instances still handle requests normally, is different from an increase in errors across the whole service. Also rule out false alarms, delayed metrics, and downstream timeouts that are blocking threads in this service.

Review request volume, error rate, P95/P99 latency, CPU, memory, GC, thread pool, and connection pool metrics together for the 10–15 minutes around the alert. Compare them with release times, configuration changes, scheduled jobs, and traffic spikes. Include alerts from the database, Redis, message queues, and external services. Follow the timeline to identify which endpoints and users were affected, when the issue began, and which metric changed first.

An average response time within the normal range does not mean every request is healthy. A small number of very slow requests may affect critical flows such as login, checkout, or payment. P95/P99 latency, timeout rate, and business success rate are more useful in this case.

## How Should You Balance Containment and Evidence Collection?

If the incident is still spreading, contain it according to the plan. Common actions include rolling back a release, removing unhealthy instances, disabling a problematic scheduled job, applying rate limits or circuit breakers, degrading non-critical features, and scaling out. Each action has trade-offs: scaling out may overload the database, retries increase downstream traffic, and a rollback may not be compatible with data that has already changed.

If conditions allow, preserve this information before restarting or rolling back:

- Monitoring screenshots or time ranges around the alert.
- Application, access, and GC logs, plus change records.
- One to three thread dumps captured a few seconds apart, rather than a single dump.
- Slow and failed calls in traces, including time spent in upstream and downstream services.
- Process CPU, RSS, heap, thread count, file descriptors, and network connections.
- Database slow queries, lock waits, connection pool state, Redis slow commands, and message queue lag.

Even after removing traffic from an instance, do not assume it is safe to capture a Heap Dump. Dumping a large heap requires enough disk space and I/O, and some commands may cause long pauses. A safer approach is to configure automatic OOM dumps at startup and write them to a directory with enough space and appropriate permissions.

```bash
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/path/with/enough/space
```

## How Can You Quickly Identify the Affected Layer?

If there is no trace information yet, use the symptoms to choose where to start. The table is a starting point, not a substitute for verification.

| Symptom                                        | Check first                                                                                    |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| High CPU and slow endpoints                    | Hot threads, infinite loops, serialization, lock contention, frequent GC                       |
| Low CPU and high system load                   | Disk I/O, uninterruptible sleep, network storage, container CPU limits                         |
| RSS keeps growing while Java heap stays stable | Direct memory, thread stacks, Metaspace, JNI, native libraries, memory-mapped files            |
| Old generation keeps growing after GC          | Long-lived objects, unbounded caches, retained collections, listeners, or ThreadLocal values   |
| Thread count and queue length rise             | Slow downstream services, lock waits, slow task processing, insufficient thread pool isolation |
| Database connection pool wait rises            | Slow SQL, long transactions, connection leaks, insufficient database capacity                  |
| Redis response time rises                      | Slow commands, large or hot keys, network issues, connection pool waits                        |
| Message queue lag keeps growing                | Slow consumers, uneven partitions, repeated retries, insufficient downstream capacity          |

Problems can also propagate across layers. A slow SQL query holds a database connection, application threads wait for connections, the thread pool queue grows, and upstream timeouts trigger retries. CPU, latency, and error rates may all rise. Use the timeline to determine which metric changed first.

## How Do You Investigate High CPU Usage?

First identify which process is using the CPU, then find the threads consuming CPU within that process. Common Linux commands include:

```bash
# Find Java processes.
jps -l

# Check CPU usage for each thread in the process.
top -H -p <pid>

# Alternatively, check per-thread CPU usage over time.
pidstat -t -p <pid> 1
```

`top -H` displays thread IDs in decimal, while `nid` in a thread dump is usually hexadecimal. Convert the ID, then find the matching thread in the dump:

```bash
printf '%x\n' <tid>
jcmd <pid> Thread.print > /tmp/thread-dump.txt
```

Capture several thread dumps over time. A thread doing JSON serialization in one dump may have been sampled at that moment; if it appears in the same code across several dumps, investigate further. Common causes include:

- Loops or recursion that do not terminate.
- CPU-intensive work such as serializing large objects, regex backtracking, or encryption and decryption.
- Frequent GC caused by a high rate of object allocation.
- Threads contending for a lock and causing context switches.
- Increased traffic or retry amplification, where CPU is simply doing more work.

When CPU is near saturation, avoid running several high-overhead diagnostics at once. Remove some traffic or collect evidence from one unhealthy instance so the diagnostics do not compete for more resources.

## What If CPU Usage Is Low but System Load Is High?

Linux Load Average counts running tasks and tasks in uninterruptible sleep. Severe waits on disk, network storage, or some kernel I/O can cause system load to rise even when CPU usage is low.

```bash
vmstat 1
iostat -xz 1
pidstat -d -p <pid> 1
```

Check the run queue, I/O wait, and blocked tasks in `vmstat`, and device utilization, wait time, and queue length in `iostat`. `iostat` and `pidstat` are usually provided by the `sysstat` package; confirm they are available in the production environment.

## How Do You Investigate Slow Endpoints When CPU Is Low?

These issues often involve waiting: for a database connection, downstream response, lock, thread pool task, or disk I/O.

Start by finding the longest span in the trace. If traces are unavailable, use request durations from access logs, database slow queries, client connection pool metrics, and thread dumps to narrow down the cause. Common thread dump patterns include:

- Many threads are blocked in a database pool's `getConnection()`: check pool wait time, active connections, slow SQL, and long transactions.
- Many threads are waiting for an HTTP client response: check downstream latency, timeout settings, and retry count.
- Many threads are `BLOCKED`: identify the lock owner and slow operations inside the critical section.
- Application threads are idle while the task queue grows: check worker threads, task submission, and executor state.

The total duration of a slow request should add up across its stages. If a trace records only business method time and omits connection pool waits, thread pool queueing, or client DNS/TLS time, there will be an unexplained gap. Add the relevant instrumentation or monitoring.

## How Do You Investigate Growing Memory Use and OOM?

First determine whether Java heap, process RSS, or total container memory is growing. `-Xmx` limits only the Java heap. A process also uses Metaspace, Code Cache, thread stacks, direct memory, GC data structures, and native library memory.

Check both JVM and system-level data:

```bash
jcmd <pid> GC.heap_info
jcmd <pid> VM.flags
jcmd <pid> VM.native_memory summary
```

`VM.native_memory` requires Native Memory Tracking (NMT), which must be enabled when the JVM starts, for example with `-XX:NativeMemoryTracking=summary`. NMT adds overhead and cannot be enabled retroactively after an incident starts.

NMT mainly reports native memory managed by the JVM/HotSpot. It does not cover all allocations made through JNI or third-party native libraries. If RSS keeps rising without a corresponding change in NMT, continue with operating system and native memory analysis tools.

Common OOM messages point to different areas to investigate:

| OOM message                      | Common causes to investigate                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| `Java heap space`                | Large objects, retained objects, unbounded collections or caches, oversized query results   |
| `GC overhead limit exceeded`     | Heap nearly exhausted; GC spends a lot of time reclaiming little memory                     |
| `Metaspace`                      | Dynamic class generation, class loader leaks, or a low Metaspace limit                      |
| `Direct buffer memory`           | NIO direct memory, Netty buffers, delayed cleanup, or an unsuitable limit                   |
| `unable to create native thread` | Too many threads, process limits, insufficient container memory, or oversized thread stacks |

Analyze Heap Dumps with tools such as MAT or VisualVM. Start with the largest objects, the Dominator Tree, paths to GC Roots, and suspicious class loaders. Do not draw conclusions from object counts alone.

To create a dump manually, use:

```bash
jcmd <pid> GC.heap_dump filename=/path/with/enough/space/heap.hprof
```

This command can have a significant impact on the application. Before running it, assess heap size, free disk space, I/O, and pause risk. If a production instance is still serving traffic, prefer an unhealthy instance after removing its traffic. `jmap -dump:live` may trigger Full GC, so do not treat it as risk-free.

## How Can You Distinguish a Memory Leak from Normal Growth?

Observe heap usage after full collections. If traffic and data volume are stable but old-generation usage continues to rise after several full collections, suspect objects that cannot be reclaimed. Cache warm-up, class loading, and increased traffic can also cause heap usage to rise after startup; they are not necessarily leaks.

Also find out why the objects are being retained. A large `Map` only tells you that it consumes memory. Follow the reference chain to an unbounded cache, static collection, listener, ThreadLocal, or incorrectly managed session lifecycle to identify where to fix the problem.

## How Do You Investigate Frequent Young GC?

Frequent Young GC usually means objects are being allocated quickly or the young generation is too small. Check the allocation rate, live data after each collection, and pause time before deciding whether to change the code or tune options.

```bash
jstat -gcutil <pid> 1000 10
jcmd <pid> GC.heap_info
```

Common causes include queries that load many objects at once, endpoints that return oversized results, temporary objects created by logging or serialization, unbounded batch sizes, and young-generation settings that do not match the workload.

Changing the young-generation size only changes GC frequency; it cannot fix unbounded queries or code with a high allocation rate. Use GC logs, JFR, allocation profiling, or load tests to find where objects are created. After changing options, compare throughput, P95/P99 latency, GC count, and total pause time under the same traffic and data conditions.

## How Do You Investigate Frequent Full GC?

Start with the GC logs to identify the trigger, memory use before and after collection, and pause duration. Log fields and triggers differ between collectors, so do not assume that every Full GC means the old generation is full.

Check these points:

- Whether old-generation usage drops after collection.
- Whether too many large objects or promoted objects are being created.
- Whether Metaspace is near its limit.
- Whether `System.gc()` or a diagnostic tool triggered collection.
- Whether heap size, container memory limit, and collector settings are compatible.
- Whether traffic spikes, batch jobs, or cache refreshes occurred before GC.

If usage remains high after collection, investigate object retention. If collection works but the heap quickly fills again, check allocation rate, promotion rate, and heap capacity. Before changing JVM options, understand the application's behavior. Increasing the heap may only delay the next incident and can increase pause times or dump costs.

## How Do You Investigate a Growing Thread Pool Queue?

Do not diagnose a thread pool by looking only at active thread count. Monitor at least:

- `corePoolSize`, `maximumPoolSize`, and current thread count.
- Active thread count, queue length, and queue capacity.
- Task submission and completion rates, wait time, and execution time.
- Rejection count and the configured rejection policy.

If the queue keeps growing, tasks are arriving faster than they are completed. This may be due to a traffic spike or slower tasks, such as those waiting for database connections, timing out downstream, or contending for locks. Increasing the thread count directly also increases concurrent access to databases, Redis, and external services, potentially pushing the problem downstream.

Investigate in this order:

1. Identify which business tasks use the pool and whether unrelated tasks share it.
2. Compare submission and completion rates, queue wait time, and execution time.
3. Capture thread dumps for running tasks to see whether they are computing or waiting.
4. Check whether database, HTTP, and Redis connection pools are also exhausted.
5. Choose rate limiting, degradation, scaling, isolation, or task dropping based on task priority.

`CallerRunsPolicy` makes the thread submitting a task run it, which can temporarily slow task submission. But if a long-running task occupies a web request thread, endpoint latency will rise. Whether this policy suits a pool depends on the caller and task type.

## How Do You Investigate Database Connection Pool Exhaustion?

When a connection pool is exhausted, check active and idle connections, waiting threads, and connection acquisition time. If many application threads are waiting for connections, investigate three common causes:

- Slow SQL that holds connections for too long.
- Transactions that include remote calls, file processing, or extensive computation.
- Connections not closed on every code path, causing leaks.

On the database side, check current sessions, slow queries, lock waits, long transactions, and instance resources. For MySQL, use `SHOW PROCESSLIST`, the slow query log, Performance Schema, `EXPLAIN`, and InnoDB transaction lock information. An execution plan depends on the SQL, parameters, and data distribution; using an index in a test database does not prove the production query will do the same.

Before increasing the pool size, confirm the database can handle more concurrent connections. The maximum connection count is the number of application instances multiplied by each instance's pool limit. Scaling out the service increases this total as well.

Related guides: [MySQL execution plan analysis](../../database/mysql/mysql-query-execution-plan.md) and [SQL optimization](../../high-performance/sql-optimization.md).

## How Do You Investigate Slow Redis Responses?

When Redis calls from an application slow down, distinguish client-side waiting from server-side execution. An exhausted connection pool, network instability, or DNS problems can delay a Redis call even if the command itself executes quickly.

On the Redis server, check:

- Command latency and slow logs.
- CPU, memory, network traffic, and connection count.
- Large keys, hot keys, expiration cleanup, and persistence operations.
- Replication lag, cluster state, and failover activity.

`SLOWLOG GET` records command execution time on the Redis server; it does not include queueing or network time. If the application's total latency is high but the Slow Log looks normal, check connection pool waits, the network, and client-side processing.

Tools such as `redis-cli --bigkeys` can help find large keys, but they scan the key space and add load. In production, run them during off-peak hours, against a replica, or with controlled sampling, after confirming their impact on the current version and cluster. Do not run `KEYS *` directly in production.

Confirm hot keys using access frequency and node load. Key size alone will not reveal a small key that is read very often. Gather evidence from a proxy, client statistics, a monitoring platform, or a controlled hot-key analysis tool.

Related guide: [Common Redis interview questions](../../database/redis/redis-questions-02.md).

## How Do You Investigate a Message Queue Backlog?

Compare production and consumption rates, and identify which topic, queue, or partition has the backlog. Then check whether consumer instances are alive, consumer threads are blocked, per-message processing time has changed, or downstream databases and services are slow.

Common causes include:

- Traffic increases beyond the system's designed capacity.
- A type of message takes longer to process and holds up a partition or queue.
- A failing message is retried repeatedly, causing a retry storm.
- Partitions are unevenly distributed or consumers frequently rebalance.
- Offset commits fail after successful processing, causing duplicate consumption.
- A downstream database, Redis, or external service becomes a bottleneck.

Whether adding consumers helps depends on the queue model. In Kafka, effective parallelism within a consumer group is limited by the number of partitions. Adding consumers when no partitions are available does not increase throughput. Even when adding partitions and consumers, check downstream capacity so that the backlog does not overwhelm the database once consumption resumes.

Keep processing idempotent while handling a backlog, and monitor consumer errors and dead-letter queues. If a problematic message must be skipped, preserve its contents and failure reason for later recovery instead of discarding it.

Related guide: [Common message queue issues](../../high-performance/message-queue/message-queue.md).

## How Do You Investigate Downstream Timeouts?

Break a call into stages: connection pool wait, DNS lookup, TCP connection, TLS handshake, request transmission, server processing, and response reading. Different stages need different timeout settings; a single overall timeout makes it hard to identify where time was spent.

On the caller side, check:

- Connection timeout, read timeout, and the total time budget for the call chain.
- Active connections, wait queue, and connection reuse in the HTTP pool.
- Retry count, backoff policy, and which errors trigger retries.
- Circuit breaker state, fallback results, and first-attempt success rate.

When a downstream service is already slow, retries at multiple layers quickly amplify traffic. If a gateway, application service, and SDK each retry three times, the resulting request count can greatly exceed a single call. Limit retry layers and the total retry budget, then decide whether retries are safe based on whether the endpoint is idempotent.

## Walk Through an Investigation of a Slow Endpoint

Suppose P99 latency and the error rate for an order lookup endpoint rise after a release. Investigate in the following order. This example illustrates the process and does not describe a real production incident.

1. Use monitoring to confirm that the issue started after the release and is concentrated on the new instances and order lookup endpoint.
2. Pause further releases and remove some unhealthy instances from service. The error rate falls, containing the impact.
3. Compare traces from old and new instances. Most of the time is spent acquiring database connections and running a query.
4. Connection pool metrics show more waiting threads, and the database slow query log shows the same SQL statement.
5. Inspect the execution plan with production-equivalent query parameters. A new filter prevents the existing composite index from filtering effectively and adds a sort.
6. Adjust the query and index in a test environment with a similar data distribution. Compare rows scanned, P95/P99, CPU, and connection use.
7. After canarying the change, monitor slow queries, connection pool waits, and business errors, then gradually restore traffic.
8. In the incident review, add performance tests for this query pattern and post-release monitoring.

In this hypothetical incident, thread and connection pool queues grow after the slow SQL begins. The execution plan and slow query log point to SQL as the root cause. If step 4 shows that SQL is fast and most time is spent outside the connection pool, revisit other hypotheses.

## How Do You Verify a Fix?

After fixing the code or configuration, confirm that user-facing metrics have recovered, temporary measures can be removed, and no data issues were introduced.

Compare the same metrics before, during, and after the incident: request volume, P95/P99 latency, error rate, business success rate, CPU, memory, GC, thread pools, connection pools, and dependency latency. Reconcile data if the issue involved duplicate consumption, inventory, orders, or financial state.

Compare performance changes under similar data volumes, traffic patterns, machine configuration, and cache state. A single load test of one endpoint does not prove that the whole business flow has recovered. See [Introduction to performance and stress testing](../../high-availability/performance-test.md).

## What Should an Incident Review Record?

An incident review should leave material that can be used during the next incident. At a minimum, record:

- Incident timeline, scope, and user impact.
- Direct cause, trigger, and why the incident spread.
- Evidence used to contain, diagnose, and fix the issue.
- Monitoring, runbooks, or tests that did not help.
- Follow-up actions, owners, and due dates.

"Improve code reviews" is difficult to verify. Make action items concrete, such as alerting on connection pool wait time, limiting batch query size, adding idempotency tests for message consumption, or comparing key endpoints during release checks.

## How Should You Answer Production Troubleshooting Questions in an Interview?

If an interviewer asks, "How would you handle high CPU in production?", give the general steps first, then connect them to an incident you handled:

> First, I would confirm the impact, traffic, and recent changes, then decide whether to remove instances, apply rate limits, or roll back. If conditions allow, I would preserve monitoring data, logs, and several thread dumps. After confirming that the Java process is using the CPU, I would use `top -H` or `pidstat -t` to find hot threads, convert their IDs to hexadecimal, and match them to `nid` values in the thread dump. I would sample repeatedly to see which code the threads remain in, then use GC data, traces, and traffic metrics to distinguish CPU-intensive work, an infinite loop, lock contention, or frequent GC. After the fix, I would verify it under the same conditions and add monitoring and regression tests.

If you have not handled a real production incident, describe scenarios you practiced in a test environment and the cases you studied. Do not present an incident from an article as one you personally handled.

## Common Tools at a Glance

| Tool                        | Common use                                           | Notes                                                          |
| --------------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| `top`, `pidstat`            | Process/thread CPU and I/O                           | Confirm whether metrics are from the container or host         |
| `vmstat`, `iostat`          | System queues, memory, and disk                      | Review trends over time                                        |
| `jcmd`                      | Thread dumps, heap info, JFR, class histograms       | Some commands have significant overhead; assess before running |
| `jstat`                     | GC and memory area changes                           | Repeated samples are more useful than a single reading         |
| JFR, JMC                    | CPU, allocation, locks, and I/O events               | Configure collection with production overhead in mind          |
| MAT, VisualVM               | Heap Dump analysis                                   | Focus on reference paths and GC Roots                          |
| Arthas                      | Method timing, threads, classes, runtime diagnostics | Limit Trace/Watch on high-traffic methods                      |
| Tracing/monitoring platform | Request paths, errors, latency, dependencies         | Consider sampling, redaction, and clock synchronization        |

## Further Reading

- [JDK monitoring and troubleshooting tools](./jdk-monitoring-and-troubleshooting-tools.md)
- [Important JVM options](./jvm-parameters-intro.md)
- [JVM garbage collection explained](./jvm-garbage-collection.md)
- [Java thread pools explained](../concurrent/java-thread-pool-summary.md)
- [Deadlocks explained](../../cs-basics/operating-system/dead-lock.md)
- [Oracle Java troubleshooting guide: Memory leaks](https://docs.oracle.com/en/java/javase/17/troubleshoot/troubleshooting-memory-leaks.html)
- [Redis latency troubleshooting](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/)
- [Redis Slow Log](https://redis.io/docs/latest/commands/slowlog/)
- [Analysis of a production OOM incident](https://juejin.cn/post/7205141492264976445)
- [Analysis and solutions for nine common CMS GC issues in Java](https://tech.meituan.com/2020/11/12/java-9-cms-gc.html)

<!-- @include: @article-footer.snippet.md -->
