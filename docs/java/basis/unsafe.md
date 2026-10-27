---
title: Java Unsafe Explained
description: Learn about the low-level capabilities of Java's Unsafe class, including direct memory access, CAS, object instantiation, and risks of use.
category: Java
tag:
  - Java Fundamentals
head:
  - - meta
    - name: keywords
      content: Unsafe,memory operations,CAS,off-heap memory,direct memory,sun.misc.Unsafe,JUC internals
---

> This article is based on and expands on the following articles:
>
> - [Java's Magic Class: Analyzing Unsafe Applications — Meituan Technical Team, 2019](https://tech.meituan.com/2019/02/14/talk-about-java-magic-class-unsafe.html)
> - [Unsafe: A Double-Edged Sword in Java — Coder's Ascent, 2021](https://xie.infoq.cn/article/8b6ed4195e475bfb32dacc5cb)

<!-- markdownlint-disable MD024 -->

If you've read JUC source code, you've probably seen many concurrency utilities call a class named `Unsafe`.

What does this class do, and when is it used? This article explains.

## Introduction to Unsafe

`Unsafe`, in the `sun.misc` package, provides methods for low-level, unsafe operations such as direct access to system memory and manual memory management. These methods can improve performance and give Java access to low-level resources. But they also give Java capabilities similar to C pointers, increasing the risk of memory errors. Excessive or incorrect use of `Unsafe` can make programs unreliable and undermine Java's safety, so use it with caution.

The functions provided by `Unsafe` rely on native methods. Think of a native method as a Java method implemented in another programming language. It is declared in Java with the **`native`** keyword, while its implementation is provided by **native code**.

![](https://oss.javaguide.cn/github/javaguide/java/basis/unsafe/image-20220717115231125.png)

**Why use native methods?**

1. To use operating system features that Java doesn't provide directly. Native code can provide low-level control while Java remains portable.
2. To call existing functionality implemented in another language.
3. To use a lower-level language such as C, C++, or assembly when timing or performance is critical.

Many concurrency utilities in the JUC package use native methods to access some operating system features beyond the Java runtime. The implementation of a native method can differ across operating systems, but this is transparent to the caller and should produce the same result.

## Obtaining Unsafe

Here is a portion of the `sun.misc.Unsafe` source:

```java
public final class Unsafe {
  // Singleton instance.
  private static final Unsafe theUnsafe;
  ......
  private Unsafe() {
  }
  @CallerSensitive
  public static Unsafe getUnsafe() {
    Class var0 = Reflection.getCallerClass();
    // Only classes loaded by the bootstrap class loader can call this method.
    if(!VM.isSystemDomainLoader(var0.getClassLoader())) {
      throw new SecurityException("Unsafe");
    } else {
      return theUnsafe;
    }
  }
}
```

`Unsafe` is a singleton and provides the static `getUnsafe` method to retrieve its instance. However, calling this method directly throws a `SecurityException`:

```bash
Exception in thread "main" java.lang.SecurityException: Unsafe
 at sun.misc.Unsafe.getUnsafe(Unsafe.java:90)
 at com.cn.test.GetUnsafeTest.main(GetUnsafeTest.java:12)
```

**Why can't this `public static` method be called directly?**

`getUnsafe` checks the caller's class loader. If the caller wasn't loaded by the bootstrap class loader, it throws a `SecurityException`. This limits access to `Unsafe` methods and prevents untrusted code from calling them.

**Why does Unsafe have such strict access restrictions?**

`Unsafe` provides very low-level capabilities, such as direct access to system memory and manual memory management. Misuse can cause serious problems.

**How can you get an `Unsafe` instance?**

Here are two possible approaches:

1. Use reflection to access the already-created singleton instance, `theUnsafe`.

```java
private static Unsafe reflectGetUnsafe() {
    try {
      Field field = Unsafe.class.getDeclaredField("theUnsafe");
      field.setAccessible(true);
      return (Unsafe) field.get(null);
    } catch (Exception e) {
      log.error(e.getMessage(), e);
      return null;
    }
}
```

2. Work around the access restriction by using the Java command-line option `-Xbootclasspath/a` to append the JAR containing class A to the bootstrap class path. The bootstrap class loader can then load A, allowing it to call `Unsafe.getUnsafe`.

```bash
java -Xbootclasspath/a: ${path}   // path is the JAR containing the class that calls Unsafe.
```

## Unsafe Capabilities

The capabilities of `Unsafe` can be grouped into eight categories:

1. Memory operations
2. Memory barriers
3. Object operations
4. Array operations
5. CAS operations
6. Thread scheduling
7. Class operations
8. System information

### Memory Operations

#### Overview

If you've programmed in C or C++, you're familiar with memory operations. Java doesn't normally allow direct memory access; the JVM allocates and reclaims object memory. `Unsafe` provides the following methods for direct memory operations:

```java
// Allocate a new block of native memory.
public native long allocateMemory(long bytes);
// Resize a block of memory.
public native long reallocateMemory(long address, long bytes);
// Set memory to a specified value.
public native void setMemory(Object o, long offset, long bytes, byte value);
// Copy memory.
public native void copyMemory(Object srcBase, long srcOffset,Object destBase, long destOffset,long bytes);
// Free memory.
public native void freeMemory(long address);
```

Test these methods with the following code:

```java
private void memoryTest() {
    int size = 4;
    // 1. Allocate the initial memory block.
    long oldAddr = unsafe.allocateMemory(size);
    System.out.println("Initial address: " + oldAddr);

    // 2. Write data to the initial block.
    unsafe.putInt(oldAddr, 16843009); // Writes 0x01010101.
    System.out.println("Value at oldAddr: " + unsafe.getInt(oldAddr));

    // 3. Reallocate the memory.
    long newAddr = unsafe.reallocateMemory(oldAddr, size * 2);
    System.out.println("New address: " + newAddr);

    // 4. reallocateMemory copies the data from oldAddr to newAddr,
    // so the first 4 bytes at newAddr should match the old data.
    System.out.println("Value at newAddr (first 4 bytes): " + unsafe.getInt(newAddr));

    // Important: use newAddr for all further operations; oldAddr is no longer valid.
    try {
        // 5. Write new data to the second half of the block.
        unsafe.putInt(newAddr + size, 33686018); // Writes 0x02020202.

        // 6. Read the full 8-byte long value.
        System.out.println("Value at newAddr (full 8 bytes): " + unsafe.getLong(newAddr));

    } finally {
        // 7. Free only the last valid address.
        unsafe.freeMemory(newAddr);
        // Calling freeMemory(oldAddr) would cause a double free.
    }
}
```

Output:

```plain
Initial address: 140467048086752
Value at oldAddr: 16843009
New address: 140467048086752
Value at newAddr (first 4 bytes): 16843009
Value at newAddr (full 8 bytes): 144680345659310337
```

`reallocateMemory` behaves like C's `realloc` function. It attempts to expand or shrink a block without moving its data. There are two possible outcomes:

1. **In-place expansion:** If there's enough contiguous free space after the block, `reallocateMemory` expands it at the same address and returns the original address.
2. **Expansion at a new address:** If there's not enough space, it finds a large enough block, copies the old data, frees the old block, and returns the new address.

**We can analyze the output as follows:**

**Step 1: Allocate memory and write a value**

- `unsafe.allocateMemory(size)` allocates 4 bytes of off-heap memory at address `140467048086752`.
- `unsafe.putInt(oldAddr, 16843009)` writes the int value `16843009` (`0x01010101` in hexadecimal) to that address. `getInt` reads it back, confirming the write succeeded.

**Step 2: Expand the memory block in place**

- `long newAddr = unsafe.reallocateMemory(oldAddr, size * 2)` attempts to expand the block to 8 bytes.
- The output shows `New address: 140467048086752`, so `newAddr` is **the same as** `oldAddr`.
- This indicates an in-place expansion: the system found enough space after the original address and expanded the block to 8 bytes without moving it. In this run, `oldAddr` and `newAddr` are equal.

**Step 3: Verify the original value and write new data**

- `unsafe.getInt(newAddr)` reads the first 4 bytes again and returns `16843009`, confirming the original value is intact.
- `unsafe.putInt(newAddr + size, 33686018)` writes `33686018` (`0x02020202`) to the newly allocated 4 bytes at offset 4.

**Step 4: Read the full value**

- `unsafe.getLong(newAddr)` reads 8 bytes from the start address. They contain `0x01010101` at the lower address followed by `0x02020202` at the higher address.
- On a little-endian machine, the bytes are interpreted as `0x0202020201010101`.
- The decimal value is `144680345659310337`, matching the output.

**Step 5: Free the memory safely**

- The `finally` block calls `unsafe.freeMemory(newAddr)` to free the 8-byte block.
- Since this run expanded the block in place (`oldAddr == newAddr`), calling `freeMemory(oldAddr)` as well would cause a double free.

#### Common Uses

`DirectByteBuffer` is an important Java class for working with off-heap memory. It's commonly used as a buffer during network communication and appears in NIO frameworks such as Netty and MINA. `Unsafe` provides the APIs used by `DirectByteBuffer` to allocate, use, and free off-heap memory.

**Why use off-heap memory?**

- **Reduce GC pauses:** Off-heap memory is managed by the operating system rather than the JVM. Keeping the Java heap smaller can reduce the impact of garbage collection pauses.
- **Improve I/O performance:** I/O often copies data between heap and off-heap memory. Frequently copied temporary data may benefit from being stored off-heap.

The following is the `DirectByteBuffer` constructor. It allocates memory with `Unsafe.allocateMemory`, initializes it with `Unsafe.setMemory`, and creates a `Cleaner` to track garbage collection of the `DirectByteBuffer`, so its off-heap memory is freed when the buffer is collected.

```java
DirectByteBuffer(int cap) {                   // package-private

    super(-1, 0, cap, cap);
    boolean pa = VM.isDirectMemoryPageAligned();
    int ps = Bits.pageSize();
    long size = Math.max(1L, (long)cap + (pa ? ps : 0));
    Bits.reserveMemory(size, cap);

    long base = 0;
    try {
        // Allocate memory and return the base address.
        base = unsafe.allocateMemory(size);
    } catch (OutOfMemoryError x) {
        Bits.unreserveMemory(size, cap);
        throw x;
    }
    // Initialize the memory.
    unsafe.setMemory(base, size, (byte) 0);
    if (pa && (base % ps != 0)) {
        // Round up to page boundary
        address = base + ps - (base & (ps - 1));
    } else {
        address = base;
    }
    // Track DirectByteBuffer collection so its off-heap memory can be freed.
    cleaner = Cleaner.create(this, new Deallocator(base, size, cap));
    att = null;
}
```

### Memory Barriers

#### Overview

Compilers and CPUs may reorder instructions to improve performance, as long as the program's single-threaded results remain the same. Reordering can cause threads to observe inconsistent values between CPU caches and memory. A memory barrier prevents instructions on either side of the barrier from being reordered across it, avoiding incorrect compiler or hardware optimizations.

At the hardware level, a memory barrier is an instruction that prevents reordering. Implementations vary across hardware platforms. Java 8 introduced three memory barrier methods, allowing code to specify the required barriers while the JVM handles platform-specific instructions.

`Unsafe` provides these three memory barrier methods:

```java
// Prevent load operations from being reordered across this barrier.
public native void loadFence();
// Prevent store operations from being reordered across this barrier.
public native void storeFence();
// Prevent load and store operations from being reordered across this barrier.
public native void fullFence();
```

A memory barrier constrains reordering and visibility for specific memory accesses. It doesn't “flush the CPU cache” or force all data to be reloaded from main memory. `loadFence()` only provides read-side ordering; by itself, it doesn't establish a Java Memory Model `happens-before` relationship between two ordinary field accesses.

Therefore, don't replace `volatile` with an ordinary `boolean` field and `loadFence()` to provide cross-thread visibility. Use `volatile`, a lock, or a synchronization mechanism such as a `VarHandle` with matching access modes for shared flags. Otherwise, the code still has a data race, and a reading thread isn't guaranteed to observe the write.

#### Common Uses

Java 8 introduced `StampedLock`, an alternative to read-write locks. Its optimistic read doesn't block a writer from acquiring a write lock, which can help prevent writer starvation when reads are frequent. Since optimistic reads don't block writers, they need to detect whether shared data changed during the read.

To do this, `StampedLock.validate()` uses `Unsafe.loadFence()` to add a load barrier.

```java
public boolean validate(long stamp) {
   U.loadFence();
   return (stamp & SBITS) == (state & SBITS);
}
```

### Object Operations

#### Overview

**Example**

```java
import sun.misc.Unsafe;
import java.lang.reflect.Field;

public class Main {

    private int value;

    public static void main(String[] args) throws Exception{
        Unsafe unsafe = reflectGetUnsafe();
        assert unsafe != null;
        long offset = unsafe.objectFieldOffset(Main.class.getDeclaredField("value"));
        Main main = new Main();
        System.out.println("value before putInt: " + main.value);
        unsafe.putInt(main, offset, 42);
        System.out.println("value after putInt: " + main.value);
  System.out.println("value after putInt: " + unsafe.getInt(main, offset));
    }

    private static Unsafe reflectGetUnsafe() {
        try {
            Field field = Unsafe.class.getDeclaredField("theUnsafe");
            field.setAccessible(true);
            return (Unsafe) field.get(null);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

}
```

Output:

```plain
value before putInt: 0
value after putInt: 42
value after putInt: 42
```

**Object Fields**

The previous example showed how to get an object's field offset and modify its value. In addition to `putInt` and `getInt`, `Unsafe` provides `put` and `get` methods for all eight primitive types and for `Object`. The `put` methods can bypass access controls and directly modify memory. The OpenJDK source comments note a difference: primitive operations access field values directly, while `Object` operations use reference values. Here are the `Object` access methods:

```java
// Get an object reference at the specified offset.
public native Object getObject(Object o, long offset);
// Write an object reference at the specified offset.
public native void putObject(Object o, long offset, Object x);
```

In addition to ordinary field access, `Unsafe` provides **volatile reads and writes** and **ordered writes**. Volatile access is available for all primitive types and `Object`. Here's an example using `int`:

```java
// Read an int at the specified object offset with volatile load semantics.
public native int getIntVolatile(Object o, long offset);
// Write an int at the specified object offset with volatile store semantics.
public native void putIntVolatile(Object o, long offset, int x);
```

Volatile reads and writes cost more than ordinary access because they provide visibility and ordering guarantees. A volatile read observes writes made visible through the memory model, and a volatile write makes its update visible to other threads.

The three ordered write methods are:

```java
public native void putOrderedObject(Object o, long offset, Object x);
public native void putOrderedInt(Object o, long offset, int x);
public native void putOrderedLong(Object o, long offset, long x);
```

Ordered writes have lower overhead than volatile writes because they provide ordering guarantees but not the full volatile visibility semantics. To understand the difference, first consider two operations:

- `Load`: Copy data from main memory into a processor cache.
- `Store`: Write data from a processor cache back to main memory.

The difference is that an ordered write uses a `StoreStore` barrier, while a volatile write uses a `StoreLoad` barrier, as shown below:

![](https://oss.javaguide.cn/github/javaguide/java/basis/unsafe/image-20220717144834132.png)

An ordered write uses a `StoreStore` barrier to ensure that `Store1` happens before `Store2` and later store operations. A volatile write uses a `StoreLoad` barrier, which orders `Store1` before `Load2` and subsequent loads. A `StoreLoad` barrier also ensures that all memory accesses before it complete before accesses after it run.

In terms of write performance, the methods generally become more expensive in this order: `put`, `putOrdered`, then `putVolatile`.

**Object Instantiation**

The `Unsafe.allocateInstance` method provides an unconventional way to create an object. First, define a class that assigns a value to a field in its constructor:

```java
@Data
public class A {
    private int b;
    public A(){
        this.b =1;
    }
}
```

Compare creating an object with a constructor, reflection, and `Unsafe`:

```java
public void objTest() throws Exception{
    A a1=new A();
    System.out.println(a1.getB());
    A a2 = A.class.newInstance();
    System.out.println(a2.getB());
    A a3= (A) unsafe.allocateInstance(A.class);
    System.out.println(a3.getB());
}
```

The outputs are 1, 1, and 0. This shows that `allocateInstance` doesn't call the class constructor. It only needs the `Class` object, so it can bypass object initialization and constructor access checks. In this example, if class A's constructor were `private`, normal construction and reflection couldn't use it unless access checks were disabled on the constructor; `allocateInstance` would still work.

#### Common Uses

- **Ordinary instantiation:** Objects are usually created with `new`. If a class declares only constructors with parameters and no no-argument constructor, you must call one of the parameterized constructors and pass the required arguments.
- **Unconventional instantiation:** `Unsafe.allocateInstance` creates an instance using only its `Class` object, without running constructors or initialization code and without checking constructor access. This capability has been used by libraries such as Objenesis and Gson during deserialization.

### Array Operations

#### Overview

The `arrayBaseOffset` and `arrayIndexScale` methods work together to locate each array element in memory.

```java
// Return the offset of the first array element.
public native int arrayBaseOffset(Class<?> arrayClass);
// Return the size of one array element.
public native int arrayIndexScale(Class<?> arrayClass);
```

#### Common Uses

These methods are used by `AtomicIntegerArray` in `java.util.concurrent.atomic`, which supports atomic operations on individual array elements. As shown in the source below, it uses `Unsafe.arrayBaseOffset` and `arrayIndexScale` to get the first element's offset (`base`) and the size of each element (`scale`). Atomic operations use these values to locate array elements. For example, `getAndAdd` calls `checkedByteOffset` to find an element's offset, then uses CAS to update it atomically.

![](https://oss.javaguide.cn/github/javaguide/java/basis/unsafe/image-20220717144927257.png)

### CAS Operations

#### Overview

The following methods perform CAS operations.

```java
/**
  * CAS operation.
  * @param o         object containing the field to update
  * @param offset    offset of the field in the object
  * @param expected  expected value
  * @param update    new value
  * @return          true if the value was updated; otherwise false
  */
public final native boolean compareAndSwapObject(Object o, long offset,  Object expected, Object update);

public final native boolean compareAndSwapInt(Object o, long offset, int expected,int update);

public final native boolean compareAndSwapLong(Object o, long offset, long expected, long update);
```

**What is CAS?** CAS (compare-and-swap) is commonly used to implement concurrent algorithms. It takes three operands: a memory location, an expected value, and a new value. If the value at that location matches the expected value, CAS atomically replaces it with the new value; otherwise, it leaves it unchanged. HotSpot maps CAS operations to atomic primitives provided by the target platform. On x86, it typically uses `cmpxchg`; other processor architectures may use different instructions or instruction sequences.

#### Common Uses

CAS is widely used by concurrency utilities in JUC and has been discussed in the guides to `synchronized` and AQS. It acts as an optimistic locking mechanism. `Unsafe` provides `compareAndSwapObject`, `compareAndSwapInt`, and `compareAndSwapLong` for CAS on `Object`, `int`, and `long` values. Here's `compareAndSwapInt`:

```java
public final native boolean compareAndSwapInt(Object o, long offset,int expected,int x);
```

Here, `o` is the object to update, and `offset` is the offset of an integer field in `o`. If the field's value matches `expected`, it is atomically replaced with `x`. Here's an example using `compareAndSwapInt`:

```java
private volatile int a;
public static void main(String[] args){
    CasTest casTest=new CasTest();
    new Thread(()->{
        for (int i = 1; i < 5; i++) {
            casTest.increment(i);
            System.out.print(casTest.a+" ");
        }
    }).start();
    new Thread(()->{
        for (int i = 5 ; i <10 ; i++) {
            casTest.increment(i);
            System.out.print(casTest.a+" ");
        }
    }).start();
}

private void increment(int x){
    while (true){
        try {
            long fieldOffset = unsafe.objectFieldOffset(CasTest.class.getDeclaredField("a"));
            if (unsafe.compareAndSwapInt(this,fieldOffset,x-1,x))
                break;
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }
    }
}
```

The code is intended to print:

```plain
1 2 3 4 5 6 7 8 9
```

If you run the code above in an IDE, you may not get the intended output. This issue was reported on GitHub: [issue #2650](https://github.com/Snailclimb/JavaGuide/issues/2650). Here's a corrected version:

```java
// Put incrementing and printing in a method with stronger atomicity guarantees.
private void incrementAndPrint(int targetValue) {
    while (true) {
        int currentValue = a; // Read the current value of a.
        // Skip if another thread has already reached or passed the target.
        if (currentValue >= targetValue) {
            return;
        }
        // Try CAS: if the current value is targetValue - 1, set it to targetValue.
        if (currentValue == targetValue - 1) {
          if (unsafe.compareAndSwapInt(this, fieldOffset, currentValue, targetValue)) {
              // Print immediately after a successful CAS to print the value just set.
              System.out.print(targetValue + " ");
              return;
          }
        }
        // CAS failed; read again and retry.
    }
}
```

In the example, two threads try to update the shared variable `a`. Each thread calls `incrementAndPrint(targetValue)` and:

1. Read the current value of `a` into `currentValue`.
2. Check whether `currentValue` equals `targetValue - 1`.
3. If it does, call `unsafe.compareAndSwapInt()` to update `a` from `currentValue` to `targetValue`.
4. If CAS succeeds, print `targetValue` and exit the loop.
5. If CAS fails because another thread is competing, read `currentValue` again and retry until the update succeeds.

This mechanism ensures that each number from 1 to 9 is set and printed once, in order.

![](https://oss.javaguide.cn/github/javaguide/java/basis/unsafe/image-20220717144939826.png)

Keep these points in mind:

1. **Spin loops:** `compareAndSwapInt` performs one compare-and-swap operation and returns immediately. To retry until the expected condition is met, implement a loop such as `while (true)`.
2. **`AtomicInteger`:** The JDK's `java.util.concurrent.atomic.AtomicInteger` uses similar CAS and retry logic for methods such as `getAndIncrement()` and `compareAndSet()`. Using `AtomicInteger` is usually safer because it encapsulates the low-level details.
3. **ABA problem:** A value can change from A to B and back to A, causing CAS to treat it as unchanged. If the history of changes matters, `AtomicStampedReference` can help. This usually doesn't matter in the simple increment example.
4. **CPU usage:** Long spin loops consume CPU. Under heavy contention or when a condition is unlikely to become true soon, consider a backoff strategy such as `Thread.sleep()` or `LockSupport.parkNanos()`.

### Thread Scheduling

#### Overview

The main `Unsafe` methods for thread scheduling are `park` and `unpark`. The historical methods `monitorEnter`, `monitorExit`, and `tryMonitorEnter` were removed in JDK 9.

```java
// Unblock a thread.
public native void unpark(Object thread);
// Block a thread.
public native void park(boolean isAbsolute, long time);
```

The `park` and `unpark` methods suspend and resume threads. Calling `park` blocks a thread until it is unparked, interrupted, or times out. `unpark` makes a parked thread eligible to resume.

The three `monitor` methods are relevant only to older implementations and can't be called in current JDK code. Use Java's `synchronized` statement or locks and synchronizers from `java.util.concurrent` when you need an object monitor.

#### Common Uses

The core Java lock and synchronizer class `AbstractQueuedSynchronizer` (AQS) blocks and wakes threads using `LockSupport.park()` and `LockSupport.unpark()`. These `LockSupport` methods call `Unsafe.park()` and `Unsafe.unpark()`.

```java
public static void park(Object blocker) {
    Thread t = Thread.currentThread();
    setBlocker(t, blocker);
    UNSAFE.park(false, 0L);
    setBlocker(t, null);
}
public static void unpark(Thread thread) {
    if (thread != null)
        UNSAFE.unpark(thread);
}
```

`LockSupport.park()` calls `Unsafe.park()` internally. A thread may return from `park` because a permit is available, another thread called `unpark`, the thread was interrupted, or for no apparent reason. Timed variants also return when the timeout expires. Blocking code should therefore recheck its condition in a loop. The following example shows another thread calling `unpark`:

```java
public static void main(String[] args) {
    Thread mainThread = Thread.currentThread();
    new Thread(()->{
        try {
            TimeUnit.SECONDS.sleep(5);
            System.out.println("subThread try to unpark mainThread");
            unsafe.unpark(mainThread);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }).start();

    System.out.println("park main mainThread");
    unsafe.park(false,0L);
    System.out.println("unpark mainThread success");
}
```

Output:

```plain
park main mainThread
subThread try to unpark mainThread
unpark mainThread success
```

The flow is straightforward: the child thread sleeps so the main thread can call `park` and block. After five seconds, the child calls `unpark` to wake the main thread, which then continues. The diagram below illustrates the flow:

![](https://oss.javaguide.cn/github/javaguide/java/basis/unsafe/image-20220717144950116.png)

### Class Operations

#### Overview

The `Unsafe` methods for `Class` mainly support class loading and access to static fields.

**Methods for reading static fields**

> Version note: `shouldBeInitialized` and `ensureClassInitialized` were removed from `sun.misc.Unsafe` in JDK 22. The standard replacement is `MethodHandles.Lookup.ensureInitialized`, introduced in JDK 15. The following code applies only to older JDK versions.

```java
// Get the offset of a static field.
public native long staticFieldOffset(Field f);
// Get the base object for a static field.
public native Object staticFieldBase(Field f);
// Check whether a class needs initialization before accessing its static fields.
public native boolean shouldBeInitialized(Class<?> c);
```

Create a class with a static field to test:

```java
@Data
public class User {
    public static String name="Hydra";
    int age;
}
private void staticTest() throws Exception {
    User user=new User();
    // Either of the following statements can also initialize the class.
    // 1.
    // unsafe.ensureClassInitialized(User.class);
    // 2.
    // System.out.println(User.name);
    System.out.println(unsafe.shouldBeInitialized(User.class));
    Field sexField = User.class.getDeclaredField("name");
    long fieldOffset = unsafe.staticFieldOffset(sexField);
    Object fieldBase = unsafe.staticFieldBase(sexField);
    Object object = unsafe.getObject(fieldBase, fieldOffset);
    System.out.println(object);
}
```

Output:

```plain
false
Hydra
```

In the object operations section, we used `objectFieldOffset` to get the offset of an instance field and read or write its value. That method doesn't apply to static fields; use `staticFieldOffset` instead. The code above uses `Class` to get the `Field` object, but it doesn't use the `Class` object to access the static field itself.

The code first creates a `User` object, which initializes the class and its static fields. If the class isn't initialized, the static field may still be `null`. Before reading a static field, `shouldBeInitialized` can check whether the class needs initialization. If you remove the line that creates the `User` object, the output becomes:

```plain
true
null
```

**The `defineClass` method lets a program create a class dynamically at runtime.**

> Version note: `sun.misc.Unsafe.defineClass` was removed in JDK 11. In JDK 9 and later, use `MethodHandles.Lookup.defineClass` depending on the access control requirements.

```java
public native Class<?> defineClass(String name, byte[] b, int off, int len, ClassLoader loader,ProtectionDomain protectionDomain);
```

In practice, you can pass the byte array, its starting index, and the number of bytes to read. By default, the class loader (`ClassLoader`) and protection domain (`ProtectionDomain`) come from the instance calling this method. The following example reads a compiled class file:

```java
private static void defineTest() {
    String fileName="F:\\workspace\\unsafe-test\\target\\classes\\com\\cn\\model\\User.class";
    File file = new File(fileName);
    try(FileInputStream fis = new FileInputStream(file)) {
        byte[] content=new byte[(int)file.length()];
        fis.read(content);
        Class clazz = unsafe.defineClass(null, content, 0, content.length, null, null);
        Object o = clazz.getDeclaredConstructor().newInstance();
        Object age = clazz.getMethod("getAge").invoke(o, null);
        System.out.println(age);
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

This historical code reads a `.class` file into a byte array, then uses `defineClass` to create and instantiate the class. The JVM still checks the class file format, verifies the bytecode, and enforces loading constraints; this method doesn't bypass all security checks.

![](https://oss.javaguide.cn/github/javaguide/java/basis/unsafe/image-20220717145000710.png)

Older versions of Unsafe also provided the `defineAnonymousClass` method:

```java
public native Class<?> defineAnonymousClass(Class<?> hostClass, byte[] data, Object[] cpPatches);
```

This method could dynamically create anonymous classes, but it was removed in JDK 17. `MethodHandles.Lookup.defineHiddenClass`, introduced in JDK 15, is the supported alternative. Lambda implementation details are specific to the JDK; current versions shouldn't be described as relying on the removed `Unsafe.defineAnonymousClass` method.

#### Common Uses

Older JDK versions used `Unsafe.defineAnonymousClass` to support some dynamic language implementations. Current JDK versions use mechanisms such as hidden classes and no longer provide this Unsafe method.

### System Information

#### Overview

This section covers two methods for retrieving system information.

```java
// Return the system pointer size: 4 on a 32-bit system or 8 on a 64-bit system.
public native int addressSize();
// Return the memory page size, which is a power of two.
public native int pageSize();
```

#### Common Uses

These methods have few use cases. In `java.nio.Bits`, `pageSize` is used by `pageCount` to calculate the number of memory pages required. `addressSize` is used by `copySwapMemory` to check for 32-bit systems.

## Summary

This article covered the basic concepts, behavior, and some historical APIs of `Unsafe`. Note that `sun.misc.Unsafe` is an unsupported internal API, and several methods have been removed in different JDK versions. JDK 23 marked its memory access methods for removal; starting with JDK 24, the first call produces a runtime warning by default. For new code, prefer standard APIs: use `VarHandle` for heap fields and arrays, the Foreign Function and Memory API (such as `MemorySegment`) for off-heap memory, and `java.util.concurrent` for thread synchronization.

<!-- @include: @article-footer.snippet.md -->
