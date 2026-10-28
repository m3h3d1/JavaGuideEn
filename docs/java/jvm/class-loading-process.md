---
title: JVM Class Loading Process
description: An overview of the JVM class loading stages, including verification, preparation, resolution, and initialization.
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: class loading, loading, verification, preparation, resolution, initialization, clinit, constant pool
---

## Class lifecycle

From the time a class is loaded into the JVM until it is unloaded, its lifecycle has seven stages: loading, verification, preparation, resolution, initialization, use, and unloading. Verification, preparation, and resolution together are called linking.

The seven stages are shown below:

![The complete lifecycle of a class](https://oss.javaguide.cn/github/javaguide/java/jvm/lifecycle-of-a-class.png)

## Class loading process

**A class file must be loaded into the JVM before it can be used. How does the JVM load class files?**

The JVM loads a class file in three main steps: **loading → linking → initialization**. Linking consists of **verification → preparation → resolution**.

![The class loading process](https://oss.javaguide.cn/github/javaguide/java/jvm/class-loading-procedure.png)

See [Java Virtual Machine Specification - 5.3. Creation and Loading](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-5.html#jvms-5.3 "Java Virtual Machine Specification - 5.3. Creation and Loading").

### Loading

The first step of class loading performs three main tasks:

1. Obtain the binary byte stream that defines the class, given its fully qualified name.
2. Convert the static structure represented by that byte stream into runtime data structures in the method area.
3. Create a `Class` object in memory to serve as the access point to the class data in the method area.

The JVM specification does not prescribe exactly how these tasks are performed, so implementations have considerable flexibility. For example, it does not specify where or how the byte stream is obtained. It might come from a `ZIP`, `JAR`, `EAR`, or `WAR` file, a network source, runtime generation such as a dynamic proxy, or another source such as a `JSP` file.

Loading is primarily performed by **class loaders**, which are covered later. There are several kinds of class loaders. The **parent delegation model** determines which loader is asked to load a class, though applications can override that behavior.

> Class loaders and the parent delegation model are important topics covered in [JVM Class Loaders](https://javaguide.cn/java/jvm/classloader.html). For now, it is enough to know that they exist.

Every non-array class or interface is created by a class loader. Array classes are not created through `ClassLoader`; the JVM creates them as needed. The defining loader of an array of reference types is the defining loader of its component type. For an array of primitive types, `getClassLoader()` returns `null`.

The loading stage of a non-array class, specifically how its byte stream is obtained, is highly customizable. You can usually extend `ClassLoader` and override `findClass()` to control where the byte stream comes from while preserving the parent delegation behavior in `loadClass()`. Override `loadClass()` only when you need to change the delegation rules.

Some loading and linking activities can overlap. For example, certain class-file format checks may begin before the loading stage has finished.

### Verification

**Verification is the first linking stage. It ensures that the information in the class-file byte stream meets the requirements of the Java Virtual Machine Specification and will not compromise the JVM when executed as code.**

Verification uses a relatively large share of the resources spent during class loading, but it is necessary to help prevent malicious code from executing. Program safety should always come first.

HotSpot once provided `-Xverify:none` and `-noverify` to disable most class verification, but doing so weakens bytecode safety checks and should not be used as a general production optimization. These options were deprecated in JDK 13 and may be ignored or removed in modern JDKs.

Verification consists of four main checks:

1. File format verification (class-file format checks)
2. Metadata verification (bytecode semantic checks)
3. Bytecode verification (program semantic checks)
4. Symbolic reference verification (class correctness checks)

![Verification stage diagram](https://oss.javaguide.cn/github/javaguide/java/jvm/class-loading-process-verification.png)

File format verification checks the class's binary byte stream. Its main purpose is to ensure the stream can be parsed and stored in the method area and follows the format required to describe a Java type. The other three checks use the data structures in the method area rather than reading or operating on the byte stream directly.

> The method area is a logical part of the JVM runtime data areas and is shared by all threads. When the JVM uses a class, it reads and parses the class file, then stores the relevant information in the method area. This area stores **class, field, and method information; constants; static variables; and code caches produced by the just-in-time compiler**, among other data.
>
> For details, see [JVM Runtime Memory Areas](https://javaguide.cn/java/jvm/memory-area.html).

Symbolic reference verification occurs during resolution, when the JVM converts symbolic references into direct references. Symbolic and direct references are explained in the resolution section.

The main purpose of symbolic reference verification is to ensure that resolution can proceed. If verification fails, the JVM throws an error such as:

- `java.lang.IllegalAccessError`: Thrown when a class tries to access or modify a field, or call a method, that it does not have permission to access.
- `java.lang.NoSuchFieldError`: Thrown when a class tries to access or modify a specified field that is no longer present.
- `java.lang.NoSuchMethodError`: Thrown when a class tries to call a specified method that no longer exists.
- ……

### Preparation

**During preparation, the JVM allocates memory for class variables and assigns their initial values.** The specification describes this memory as belonging to the method area. Note the following:

1. Only class variables (static variables declared with the `static` keyword) are allocated at this stage. Instance variables are allocated on the Java heap as part of their objects when those objects are created.
2. Conceptually, class variables belong to the **method area**. Before JDK 7, HotSpot implemented the method area using PermGen, which matched this model. In JDK 7 and later, HotSpot moved the string pool, static variables, and some other data out of PermGen and onto the heap; class variables are stored on the Java heap alongside their `Class` objects. See [errata #75 for _Understanding the JVM (3rd Edition)_](https://github.com/fenixsoft/jvm_book/issues/75).
3. The initial value is usually the type's default zero value, such as `0`, `0L`, `null`, or `false`. For example, `public static int value = 111` typically receives `0` during preparation and `111` during initialization. If a field has a `ConstantValue` attribute, preparation assigns the value specified by that attribute directly. A compile-time constant such as `public static final int value = 111` is a typical example, but not every `static final` field has a `ConstantValue` attribute.

**Default values of primitive types** (image from section 7.3.3 of _Understanding the JVM_, 3rd edition):

![Default values of primitive types](https://oss.javaguide.cn/github/javaguide/java/%E5%9F%BA%E6%9C%AC%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B%E7%9A%84%E9%9B%B6%E5%80%BC.png)

### Resolution

**During resolution, the JVM dynamically determines concrete targets for symbolic references in the runtime constant pool.** The specification covers references to classes and interfaces, fields, methods, interface methods, method types, method handles, dynamic call sites, and dynamic constants.

Section 7.3.4 of the third edition of _Understanding the JVM_ explains symbolic and direct references as follows:

![Symbolic and direct references](https://oss.javaguide.cn/github/javaguide/java/jvm/symbol-reference-and-direct-reference.png)

For example, when a program calls a method, the JVM uses the method's symbolic reference to determine which method to invoke. HotSpot and other JVMs may use method tables, entry points, or other internal structures to speed up calls. These are implementation details; the Java Virtual Machine Specification does not prescribe a single method-table offset format.

In short, resolution uses symbolic references in the runtime constant pool to determine concrete targets such as classes, fields, methods, and dynamic call sites. The internal representation of a direct reference is not necessarily a memory pointer or fixed offset.

### Initialization

**During initialization, the JVM executes a class or interface's `<clinit>()` method, if the compiler generated one. This is the final stage of class loading.**

> The compiler generates `<clinit>()` from static field initializers and static initializer blocks. A class file may omit this method if there is no class initialization code to run.

The JVM synchronizes class and interface initialization so that only one thread executes the initializer at a time. This does not mean that `<clinit>()` itself has a Java lock. Other threads may block while waiting for initialization to finish.

The specification lists these main cases of active use that trigger initialization:

1. When one of these four bytecode instructions is encountered:
   - `new`: Create an instance of a class.
   - `getstatic` and `putstatic`: Read or assign a static field, except for compile-time constants whose values are already inlined into the constant pool.
   - `invokestatic`: Invoke a static method.
2. Reflectively use methods from `java.lang.reflect`, such as `Class.forName("...")` or `newInstance()`. If the class has not been initialized, it must be initialized.
3. Initialize a class whose superclass has not yet been initialized; the superclass is initialized first.
4. When the JVM starts, it initializes the main class containing the `main` method that will be run.
5. The first invocation of a `MethodHandle` whose resolved reference is `REF_getStatic`, `REF_putStatic`, `REF_invokeStatic`, or `REF_newInvokeSpecial` initializes the class or interface that declares the target.
6. **Added in [issue #745](https://github.com/Snailclimb/JavaGuide/issues/745):** If an interface declares a default method (introduced in JDK 8), the interface is initialized before a class that implements it is initialized.

## Class unloading

> This section on unloading was contributed in [issue #662](https://github.com/Snailclimb/JavaGuide/issues/662) by **[guang19](https://github.com/guang19 "guang19")**.

Class unloading is the process of reclaiming a class or interface's representation in the method area and its associated resources. According to the Java Language Specification, a class or interface can be unloaded only when its defining class loader can be garbage-collected. Classes and interfaces defined by the bootstrap class loader cannot be unloaded. In typical HotSpot applications, unloading usually applies to classes defined by reclaimable custom class loaders.

In HotSpot, the following three conditions are commonly used to understand whether a class may be unloaded:

1. All instances of the class have been collected; no instance remains on the heap.
2. The class is not referenced anywhere else.
3. The class loader instance has been collected.

Meeting these conditions only makes a class eligible for unloading; it does not guarantee that the JVM will unload it immediately or at all. Classes defined by the bootstrap class loader cannot be unloaded, while classes defined by custom class loaders may be.

The JDK's bootstrap, platform, and application class loaders usually live as long as the JVM. A custom class loader can become unreachable, making its classes eligible for unloading. Starting with JDK 9, the platform class loader replaced the former extension class loader.

**References**

- _Understanding the Java Virtual Machine_
- _Hands-On Java Virtual Machine_
- Chapter 5. Loading, Linking, and Initializing - Java Virtual Machine Specification: <https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-5.html#jvms-5.4>

<!-- @include: @article-footer.snippet.md -->
