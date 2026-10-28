---
title: The JVM Explained Simply
description: A plain-language introduction to the JVM's main components and class-loading and execution processes.
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: JVM fundamentals,class loading,method area,heap and stack,program counter,runtime data areas
---

> Contributed by [说出你的愿望吧丷](https://juejin.im/user/5c2400afe51d45451758aa96). [Original article](https://juejin.im/post/5e1505d0f265da5d5d744050).

## Introduction

Please point out any errors in terminology or explanation. This article provides a brief overview rather than an in-depth treatment, but aims to cover the key concepts efficiently.

## 1. JVM Basics

JVM stands for Java Virtual Machine. It is an abstract machine defined by a specification. A JVM implementation emulates the required machine functions on a real computer.

Put simply, you can think of the JVM as a small computer running on an operating system such as Windows or Linux. It interacts with the operating system rather than directly with the hardware; the operating system handles hardware interactions.

![](https://static001.geekbang.org/infoq/da/da0380a04d9c04facd2add5f6dba06fa.png)

### 1.1 How Does Java Run a Source File?

Suppose we write `HelloWorld.java`. At its simplest, it is a text file containing source code written with a defined syntax and indentation.

The **JVM** does not execute source text directly. The source must be **compiled** into a binary **`HelloWorld.class`** file that the JVM can read.

#### 1. Class Loader

For the **JVM** to execute a **`.class`** file, a **class loader** loads it into the JVM. You can think of the loader as a worker that brings class files into the runtime.

![](https://static001.geekbang.org/infoq/2f/2f012fde94376f43a25dbe1dd07e0dd8.png)

#### 2. Method Area

The **method area** stores class metadata, such as class information, constants, static fields, and compiled code.

The class loader places the loaded class information here.

#### 3. Heap

The **heap** primarily stores object instances and arrays. Like the method area, it is a **shared area** that multiple threads can access. Sharing does not automatically make an area thread-unsafe; data races depend on how the program accesses the data.

#### 4. Stack

The **stack** is the runtime space for method calls. Each method call uses a stack frame on the stack.

You may also encounter the terms native method stack and Java Native Interface (JNI). Native methods are implemented in code outside Java, commonly C or C++. The exact implementation depends on the JVM and native libraries.

#### 5. Program Counter

The program counter records the address of the JVM instruction currently being executed by a thread. The JVM uses it to resume execution after branches, loops, exception handling, or thread switches. Like the stack, it is **thread-private**. The specification does not define its value while a native method is running.

![](https://static001.geekbang.org/infoq/c6/c602f57ea9297f50bbc265f1821d6263.png)

#### Summary

1. The Java source file is compiled into a `.class` bytecode file.
2. A class loader loads the bytecode into the JVM.
3. In the runtime data areas, the method area and heap are shared, while each thread has its own JVM stack, native method stack, and program counter. Whether an area is shared describes its visibility; it does not by itself determine thread safety.

### 1.2 A Simple Code Example

A simple `Student` class:

![](https://static001.geekbang.org/infoq/12/12f0b239db65b8a95f0ce90e9a580e4d.png)

A `main` method:

![](https://static001.geekbang.org/infoq/0c/0c6d94ab88a9f2b923f5fea3f95bc2eb.png)

The JVM runs `main` in these steps:

1. Compile `App.java` to `App.class`. When `App.class` is run, the system starts a JVM process, finds the binary file on the classpath, and loads the class information into the method area. This is class loading.
2. The JVM finds the entry point and runs `App.main()`.
3. The first statement creates a `Student`: `Student student = new Student("tellUrDream")`. If `Student` has not been loaded, the JVM loads its class information into the method area.
4. After loading `Student`, the JVM allocates memory for an instance on the heap and calls its constructor. The instance has a reference to the type information for `Student` in the method area.
5. When `student.sayName()` runs, the JVM uses `student` to locate the instance and its class information, then resolves the bytecode for `sayName()`.
6. The JVM executes `sayName()`.

The key idea is that object creation uses the class information loaded into the method area, while method calls execute using stack frames. The JVM resolves methods through class metadata.

## 2. Class Loaders

A class loader loads `.class` files. It reads their bytecode and makes the class information available to the JVM. A `ClassLoader` is responsible for loading classes; the execution engine runs their bytecode.

### 2.1 Class-Loading Process

From loading a class into JVM memory to unloading it, the lifecycle has seven stages: loading, verification, preparation, resolution, initialization, use, and unloading. **Verification, preparation, and resolution together are called linking.**

#### 2.1.1 Loading

1. Load the `.class` file into memory.
2. Convert its static structures into runtime data structures in the method area.
3. Create a `java.lang.Class` object on the heap as an entry point for accessing the class.

#### 2.1.2 Linking

1. **Verification**: Checks that the class conforms to JVM requirements and safety rules.
2. **Preparation**: Allocates storage for class variables (`static` fields) and assigns default values. For example, `static int a = 3` usually has the default value `0` during preparation and is assigned `3` during initialization. The exact storage location is a JVM implementation detail.
3. **Resolution**: Converts symbolic references in the runtime constant pool into direct references. A source-code `import` is a compile-time name-resolution mechanism, not a constant-pool symbolic reference. A direct reference is not necessarily an object address.

#### 2.1.3 Initialization

Initialization executes the class initialization method, `<clinit>()`. Before a class is initialized, its superclass must be initialized. The compiler generates `<clinit>()` from explicit initializers for class variables (`static` fields) and static initializer blocks, preserving their source order. For `static int a = 3`, the value changes from the default `0` assigned during preparation to `3` during initialization. A later assignment in a static block can overwrite that value.

> Note: Class files have two special initialization methods: `<init>` for instance initialization and `<clinit>` for class initialization. `<clinit>()` is not a class constructor; both are special methods recognized by the JVM.

#### 2.1.4 Unloading

Class unloading reclaims class metadata and related resources that are no longer reachable. It usually requires the class loader that defined the class to become unreachable as well. Unlike ordinary object collection, whether and when classes are unloaded depends on the JVM implementation and garbage collector.

### 2.2 Class-Loader Hierarchy

In JDK 8 HotSpot, the common class-loader hierarchy is shown below. With the module system in JDK 9, `Platform ClassLoader` replaced `Extension ClassLoader`, and `rt.jar` was removed:

1. `Bootstrap ClassLoader`: Loads core classes such as those that were in `rt.jar`.
2. `Extension ClassLoader`: Loads extension JARs.
3. `App ClassLoader`: Loads classes and JARs from the classpath.
4. `Custom ClassLoader`: A user-defined class loader.

### 2.3 Parent Delegation

When a class loader receives a request to load a class, it first delegates the request to its parent. For example, when loading a custom `Person` class, the request is delegated up the hierarchy. The child loader tries to load the class only after its parents cannot find it.

This means that classes in core Java packages are ultimately loaded by the bootstrap loader, regardless of which loader first received the request. This helps ensure a consistent definition of core classes.

Parent delegation also provides isolation and prevents application code from replacing core JDK classes. For example, suppose we define our own `java.lang.String`:

```java
package java.lang;
public class String {
    public static void main(String[] args) {
        System.out.println();
    }
}
```

Running this class's `main` method fails because the class loader finds the JDK's `java.lang.String` first, and that class does not define `main`.

## 3. Runtime Data Areas

### 3.1 Native Method Stack and Program Counter

For example, the `Thread` source contains a `start0` method marked `native` with no Java method body. Such methods are implemented in native code outside Java, commonly C or C++. The JVM uses the native method stack to support their execution.

The program counter records the address of the JVM instruction currently being executed by a thread. It is also the only runtime data area for which the Java Virtual Machine Specification does not define an `OutOfMemoryError` condition. The bytecode interpreter changes the program counter to select the next instruction.

If the thread is executing a native method, the specification does not define the program counter's value.

### 3.2 Method Area

The method area stores class metadata, constants, and static fields. If the JVM cannot allocate enough memory for this data, it may throw an error.

### 3.3 JVM Stack and Heap

In short, the stack handles method execution and the heap stores data.

#### 3.3.1 JVM Stack

The JVM stack is the memory model for Java method execution. Each method call creates a stack frame containing information such as the local-variable table, operand stack, dynamic linking, and return address. Each thread has its own stack, and the local-variable table is part of each frame.

```java
public class Person{
    int a = 1;

    public void doSomething(){
        int b = 2;
    }
}
```

#### 3.3.2 JVM Stack Errors

If a thread's stack depth exceeds the permitted limit, the JVM throws **`StackOverflowError`**, which often occurs with deep or infinite recursion. A JVM may also support stack expansion; if it cannot allocate the required memory, it can throw **`OutOfMemoryError`**.

#### 3.3.3 JVM Stack Lifecycle

The JVM stack is not garbage-collected. Its memory is released when its thread terminates, so the stack's lifecycle matches the thread's.

Method parameters, primitive local variables, and object references are usually stored in the current stack frame's local-variable table. Object instances are usually allocated on the heap. Method bytecode is part of class metadata; an instance method is not allocated on the stack.

#### 3.3.4 Stack-Frame Execution

A stack frame is not the method itself; it is the runtime data structure for one method invocation. It stores information such as the local-variable table, operand stack, and dynamic linking data. Method bytecode and metadata are not stored on the JVM stack.

Stack data is organized into frames, each holding method-specific runtime data. If method `a` calls `b`, which calls `c`, frames A1, B1, and C1 are pushed in that order. They are popped in reverse order: C1, B1, then A1. The stack follows last-in, first-out order.

#### 3.3.5 Reusing Local Variables

The local-variable table stores method parameters and local variables. Its capacity is measured in slots; one slot can hold a value up to 32 bits wide.

The JVM locates slots in the local-variable table by index. If its capacity is `n`, valid indexes range from `[0, n)`. A `long` or `double` uses two consecutive slots. Method parameters are placed in the order specified by the JVM. To save stack-frame space, a slot may be reused after execution leaves a variable's scope. Object references still considered live in the local-variable table participate in GC Root scanning.

#### 3.3.6 JVM Heap

With a generational HotSpot collector, the heap is usually divided into the **young generation** and **old generation**. The young generation may be divided into **Eden** and two **Survivor** areas. During a copying collection, one Survivor area is the from-space and the other is the to-space. The common initial ratio is **8:1:1** for Eden and the two Survivor areas, but actual sizes depend on the collector and adaptive policies. PermGen was one HotSpot implementation of the method area in JDK 7 and earlier; it was not synonymous with all “non-heap memory.”

The heap primarily stores objects, and the garbage collector reclaims unreachable ones. In HotSpot, non-heap memory includes more than the method-area implementation; it also includes areas such as the Code Cache. After PermGen was removed in JDK 8, class metadata moved to Metaspace, which is managed by the JVM and uses native memory rather than the Java heap. Related options include:

```plain
MetaspaceSize: Initial high-water mark that triggers metadata GC; the JVM adjusts it dynamically afterward.
MaxMetaspaceSize: Maximum Metaspace size.
```

After PermGen was removed, exhaustion no longer causes `java.lang.OutOfMemoryError: PermGen space`. Metaspace can still run out if there is too much class metadata or it reaches a limit such as `MaxMetaspaceSize`, resulting in `OutOfMemoryError: Metaspace`.

#### 3.3.7 Eden and the Young Generation

When an object is created, it is often allocated in the Eden area. Although the heap is shared, the JVM can give each thread a private allocation buffer and allocate objects there, reducing contention. This is called a thread-local allocation buffer (TLAB). A thread can request another buffer when the current one is full.

When Eden no longer has room for new objects, the JVM typically runs a Minor GC (a young-generation collection). Surviving objects may be copied to a Survivor area or promoted directly to the old generation. After copying, the from and to Survivor areas switch roles. Objects may be promoted when they reach an age threshold. Although `-XX:MaxTenuringThreshold` is often 15 in common HotSpot collectors, promotion also depends on dynamic age calculations, Survivor capacity, and collector policy; objects do not always undergo exactly 15 Minor GCs.

> 🐛 Correction: A full Eden area can trigger a Minor GC; a full Survivor0 area alone does not trigger one.
>
> **When are objects in Survivor0 collected?**
>
> If Survivor0 is full when a Minor GC occurs, the collector analyzes objects in both Survivor0 and Eden. It copies live objects to Survivor1, reclaims unreachable objects, clears the old areas, and swaps the roles of Survivor0 and Survivor1.

The old generation mainly stores long-lived objects and objects promoted directly from the young generation. If it runs low on space, the JVM may run an old-generation collection or Full GC, depending on the collector. Pause behavior also varies; it is not accurate to say that every collector stops all application threads for the entire collection.

If a Full GC cannot free enough space for an allocation, the JVM may throw an OOM error. The heap may be too small, in which case `-Xms` and `-Xmx` may need adjustment. The application may also create many large objects that remain reachable and cannot be collected.

![](https://static001.geekbang.org/infoq/39/398255141fde8ba208f6c99f4edaa9fe.png)

Note about `-XX:TargetSurvivorRatio`: objects do not always need to reach `-XX:MaxTenuringThreshold` before promotion. For example, if objects of age 5 use 30% of the Survivor space, age 6 use 36%, and age 7 use 34%, adding age 6 would exceed the `TargetSurvivorRatio` target. Objects of age 6 and older may then be promoted without waiting for the threshold of 15. Exact behavior depends on the collector.

#### 3.3.8 How Does the JVM Determine Whether an Object Is Reachable?

![](https://static001.geekbang.org/infoq/1b/1ba7f3cff6e07c6e9c6765cc4ef74997.png)

The program counter, JVM stack, and native method stack live as long as their thread. Their memory is reclaimed when the thread ends, so they are not managed like heap objects. The heap and method area are shared and allocated dynamically, so the garbage collector focuses on reclaiming data in those areas.

Before reclaiming memory, the JVM must determine which objects are still reachable. Two basic approaches are:

1. **Reference counting**: Each object has a counter that increases when a reference is added and decreases when one becomes invalid. An object with a zero count can be reclaimed, but reference counting cannot reclaim cycles of mutually referencing objects.

2. **Reachability analysis**: Start from a set of GC Roots and follow references between objects. The relationships form a graph, not a binary tree. An object is unreachable if no reference path connects it to any GC Root. Languages such as Java and C# use this approach to determine object reachability.

Common GC Roots in Java include:

1. Objects referenced from local variables in JVM stack frames.
2. Objects referenced by static fields.
3. Objects referenced by constants.
4. Objects referenced through JNI from native methods. JNI lets the JVM call native functions such as C functions, which can also create Java objects. JNI local and global references keep their target objects reachable.
5. Started Java threads that have not terminated.

Reachability analysis handles cyclic references. A collector needs a consistent view of object references at certain points, which can require a Stop-The-World pause. Modern concurrent collectors perform much of the marking alongside application threads, so the entire analysis does not stop all application work.

#### 3.3.9 When Is an Object Actually Reclaimed?

First, consider the **`finalize()`** method.

`finalize()` is a method in `Object`. The system automatically calls an object's `finalize()` method at most once. If the object becomes reachable again during finalization, the method is not called again when the object later becomes unreachable.

Do not rely on `finalize()` to rescue an object. Its execution time is unpredictable, it is not guaranteed to run, it has a high cost, and the order of calls is not guaranteed. `finalize()` was deprecated in Java 9 and marked for removal in Java 18. Use `try-with-resources` or `java.lang.ref.Cleaner` to manage off-heap resources, as appropriate; `Cleaner` is not another name for strong, soft, weak, or phantom references.

![](https://static001.geekbang.org/infoq/8d/8d7f0381c7d857c7ceb8ae5a5fef0f4a.png)

Objects that override `finalize()` and have not yet run it are often described as going through a two-stage process:

1. If reachability analysis finds no path from the object to a GC Root, the object is marked and considered for finalization. HotSpot may enqueue a finalization reference for asynchronous processing by the Finalizer thread.
2. If `finalize()` makes the object reachable again, a later collection removes it from the set of objects to reclaim. Otherwise, it can be reclaimed. The collector does not wait synchronously for `finalize()` to run, and the method is not guaranteed to run.

Once an object is determined to be unreachable, how does the JVM reclaim it?

### 3.4 Garbage Collection Algorithms

For an in-depth look at common GC algorithms, see [JVM Garbage Collection](https://javaguide.cn/java/jvm/jvm-garbage-collection.html).

### 3.5 (Overview) Garbage Collectors

Garbage collectors available in HotSpot and their use cases:

![](https://static001.geekbang.org/infoq/9f/9ff72176ab0bf58bc43e142f69427379.png)

In a common JDK 8 Server HotSpot configuration, the default collector pair is usually Parallel Scavenge and Parallel Old. Actual defaults may vary by JVM implementation, runtime mode, and platform.

JDK 9 made G1 the default garbage collector for Server HotSpot. Collectors trade off throughput, latency, memory use, and CPU overhead. No collector can be said to have the shortest pauses without considering the workload and JVM configuration.

### 3.6 (Overview) Common JVM Options

The JVM has many options. This table lists a few important ones; consult the documentation for a complete list.

| Option                       | Meaning                                            | Notes                                                                         |
| ---------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `-Xms`                       | Initial heap size                                  | HotSpot calculates the default based on the runtime environment.              |
| `-Xmx`                       | Maximum heap size                                  | HotSpot calculates the default based on the runtime environment.              |
| `-Xmn`                       | Young-generation size                              | Applies only to collectors with a fixed young generation; limits adaptation.  |
| `-XX:NewSize`                | Initial young-generation size                      | Applies only to generational collectors that support it.                      |
| `-XX:MaxNewSize`             | Maximum young-generation size                      | Applies only to generational collectors that support it.                      |
| `-XX:PermSize`               | Initial PermGen size                               | HotSpot JDK 7 and earlier only; PermGen was removed in JDK 8.                 |
| `-XX:MaxPermSize`            | Maximum PermGen size                               | HotSpot JDK 7 and earlier only; PermGen was removed in JDK 8.                 |
| `-Xss`                       | Stack size per thread                              | Defaults depend on the platform and JVM version.                              |
| `-XX:NewRatio`               | Old-to-young generation size ratio                 | A value of 4 means 4:1; whether it applies depends on the collector.          |
| `-XX:SurvivorRatio`          | Eden-to-single-Survivor size ratio                 | A value of 8 commonly means Eden:From:To = 8:1:1; adaptive sizing may vary.   |
| `-XX:+DisableExplicitGC`     | Ignores explicit GC requests such as `System.gc()` | Does not disable automatic GC; evaluate effects on direct memory.             |
| `-XX:PretenureSizeThreshold` | Threshold for direct old-generation allocation     | Support and behavior depend on the collector.                                 |
| `-XX:ParallelGCThreads`      | GC threads for Stop-The-World parallel phases      | The JVM calculates a default based on available processors and other factors. |
| `-XX:MaxGCPauseMillis`       | Target maximum GC pause                            | A soft target, not a guarantee; behavior depends on the collector.            |

There are other options for logging and CMS, but they are not listed here.

## 4. JVM Tuning

Based on the JVM concepts above, we can look at tuning. This section focuses mainly on the heap.

For collectors with a fixed generational layout, the Java heap can be viewed as the young and old generations combined; PermGen and Metaspace are not part of the Java heap. If total heap size is fixed, increasing the young generation reduces the space available to the old generation. There is no universally optimal ratio; test based on allocation rates, object lifetimes, and the collector in use.

### 4.1 Set the Initial and Maximum Heap Sizes

`-Xmx` and `-Xms` specify the maximum and initial Java heap sizes, respectively. If they are not set, HotSpot calculates defaults based on the JVM version, available memory, container limits, and runtime environment. Do not estimate them as a fixed percentage of physical memory.

HotSpot can adjust committed heap space between `-Xms` and `-Xmx`. Some collectors use `MinHeapFreeRatio` and `MaxHeapFreeRatio` to control the desired free-heap ratio after GC. Resizing behavior and defaults vary by collector, JDK version, and adaptive policy; they cannot be summarized as fixed values of 40% and 70%.

Setting `-Xms` and `-Xmx` to the same value avoids resizing the committed heap at runtime, but reserves a larger heap from startup. Decide based on the deployment environment and workload.

Run the following code:

```java
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M");    // Maximum heap size.
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M");  // Free heap memory.
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M");  // Currently committed heap size.
```

Note: These options set the Java heap size, which includes the young and old generations.

![](https://static001.geekbang.org/infoq/11/114f32ddd295b2e30444f42f6180538c.png)

Set these VM options:

```plain
-Xmx20m -Xms5m -XX:+PrintGCDetails
```

![](https://static001.geekbang.org/infoq/7e/7ea0bf0dec20e44bf95128c571d6ef0e.png)

Run `main()` again.

![](https://static001.geekbang.org/infoq/c8/c89edbd0a147a791cfabdc37923c6836.png)

The GC log reports an allocation failure in `PSYoungGen`, the young generation.

At this point, the committed heap is 18 MB and the free memory is about 4.21 MB.

Now create a byte array:

```java
byte[] b = new byte[1 * 1024 * 1024];
System.out.println("Allocated 1 MB for the array");
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M");  // Maximum heap size.
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M");  // Free heap memory.
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M");
```

![](https://static001.geekbang.org/infoq/db/dbeb6aea0a90949f7d7fe4746ddb11a3.png)

Free memory has decreased, but total memory has not changed. Java tries to keep the committed heap at the initial heap size when possible.

```java
byte[] b = new byte[10 * 1024 * 1024];
System.out.println("Allocated 10 MB for the array");
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M");  // Maximum heap size.
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M");  // Free heap memory.
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M");  // Currently committed heap size.
```

![](https://static001.geekbang.org/infoq/b6/b6a7c522166dbd425dbb06eb56c9b071.png)

Creating a 10 MB byte array exceeds the initial heap size. The committed heap has grown to 15 MB to accommodate it.

Now run this code:

```java
System.gc();
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M");    // Maximum heap size.
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M");  // Free heap memory.
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M");  // Currently committed heap size.
```

![](https://static001.geekbang.org/infoq/8d/8dd6e8fccfd1394b83251c136ee44ceb.png)

Calling `System.gc()` only requests garbage collection; it does not guarantee a Full GC. This run triggered a collection and reduced the committed heap, but results vary with JVM options and the collector.

### 4.2 Set the Young-to-Old Generation Ratio

```plain
-XX:NewRatio --- Ratio of the young generation (Eden + two Survivor areas) to the old generation (excluding PermGen).

For example, `-XX:NewRatio=4` means young:old = 1:4, so the young generation occupies one fifth of the heap. If `-Xms` equals `-Xmx` and `-Xmn` is set, this option is unnecessary.
```

### 4.3 Set the Survivor-to-Eden Ratio

```plain
-XX:SurvivorRatio --- Sets the size ratio between Eden and each Survivor area.

For example, a value of 8 means the two Survivor areas together have a 2:8 ratio to Eden; each Survivor area is one tenth of the young generation.
```

### 4.4 Set Young- and Old-Generation Sizes

```plain
-XX:NewSize --- Sets the young-generation size.
-XX:MaxNewSize --- Sets the maximum young-generation size.
```

You can test different configurations with these options. A common initial ratio for Eden and the two Survivor areas is 8:1:1, but it is not optimal for every application or collector. Having different `-Xms` and `-Xmx` values does not necessarily cause repeated GC.

### 4.5 Summary

Adjust the young generation and Survivor areas based on the workload, collector, and GC logs. There is no fixed ratio that works for every application.

When an OOM occurs, capture a heap dump so you can investigate the state of the application. The following options generate a dump file that can be analyzed with tools such as VisualVM. VisualVM has not been bundled with Oracle JDK since JDK 9 and must be installed separately.

```plain
-Xmx20m -Xms5m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/path/to/dump
```

You can also configure a script to notify you when an OOM occurs, for example by sending an email or restarting the application.

### 4.6 Configure PermGen (HotSpot JDK 7 and Earlier Only)

```plain
-XX:PermSize -XX:MaxPermSize
```

`PermSize` sets the initial PermGen size, and `MaxPermSize` sets its limit. Defaults depend on the JVM version and platform; they are not a fixed percentage of physical memory. For JDK 8 and later, use Metaspace options instead.

Tip: An OOM can occur even when the Java heap is not full. In JDK 7 and earlier, PermGen exhaustion could cause an OOM while heap usage remained low.

### 4.7 Tune JVM Stack Options

#### 4.7.1 Change the Stack Size per Thread

Use `-Xss` to set the stack size for each thread.

The default thread stack size depends on the JVM version, platform, and runtime mode; it has not been a uniform 1 MB since JDK 5. With other factors unchanged, smaller stacks can leave address space for more platform threads, but thread counts are also limited by the operating system, and stacks that are too small increase the risk of `StackOverflowError`.

#### 4.7.2 Set the Thread Stack Size

```plain
-XX:ThreadStackSize=<size>
Set the thread stack size (`0` means use the default stack size).
```

You can test these options with a small program. To keep this article concise, no additional demo is included here.

### 4.8 (Optional) Other JVM Options

There are many JVM options, and this section covers only a few. Most developers do not need to explore every option in detail.

#### 4.8.1 Set the Large-Page Size

```plain
-XX:LargePageSizeInBytes=<size>
```

This option sets the large-page size. Whether it takes effect depends on the operating system, JVM build, and large-page configuration.

#### 4.8.2 Historical Option: `UseFastAccessorMethods`

```plain
-XX:+UseFastAccessorMethods
```

This older HotSpot option optimized reflection accessors; it was not a general optimization for primitive types. Modern JDKs no longer provide it.

#### 4.8.3 Disable Explicit GC Requests

```plain
-XX:+DisableExplicitGC：
Ignore explicit GC requests such as `System.gc()`. Test this option carefully.
```

#### 4.8.4 Set the Maximum Object Age

```plain
-XX:MaxTenuringThreshold
Sets the maximum age before promotion. With a value of 0, generational collectors that support this option promote surviving young-generation objects without passing them through a Survivor area. Increasing the value may keep objects in Survivor longer, but promotion also depends on dynamic age calculations, Survivor capacity, and collector policy.
```

Not all garbage collectors use the same generational and promotion mechanisms. Check the documentation for the collector in use to see whether this option applies.

#### 4.8.5 Historical Option: `AggressiveOpts`

```plain
-XX:+AggressiveOpts
```

This option enabled experimental performance optimizations in older HotSpot releases. It did not simply “speed up compilation” and was removed in JDK 12.

#### 4.8.6 Historical Option: `UseBiasedLocking`

```plain
-XX:+UseBiasedLocking
```

Biased locking was disabled by default and deprecated in JDK 15. Its implementation was later removed from HotSpot, so this is not a general tuning option for modern JDKs.

#### 4.8.7 Disable Class Unloading

```plain
-Xnoclassgc
```

This option disables class unloading, not object garbage collection.

#### 4.8.8 Set the Lifetime of Soft References

```plain
-XX:SoftRefLRUPolicyMSPerMB
Sets the lifetime of a `SoftReference` per megabyte of free heap. The default is 1 second.
```

#### 4.8.9 Set the Threshold for Direct Old-Generation Allocation

```plain
-XX:PretenureSizeThreshold
Sets the size threshold above which objects are allocated directly in the old generation. The default is 0.
```

#### 4.8.10 Set the TLAB Percentage of Eden

```plain
-XX:TLABWasteTargetPercent
Sets the percentage of Eden that TLABs may occupy. The default is 1%.
```

## Final Notes

This article took a long time to put together. It draws on several sources, including _JVM Internals Explained_ and _Java Core Technology Interview Guide_ from Geek Time, online references, and notes from courses. I hope it helps.

<!-- @include: @article-footer.snippet.md -->
