---
title: Common Java Interview Questions (Part 3)
description: Java interview questions on exceptions, generics, reflection, annotations, SPI, serialization, I/O models (BIO/NIO/AIO), and syntactic sugar.
category: Java
tag:
  - Java Basics
head:
  - - meta
    - name: keywords
      content: Java exceptions,generics,reflection,annotations,SPI,serialization,I/O streams,syntactic sugar,try-with-resources,BIO,NIO,AIO,Java interview questions
---

## Exceptions

**Overview of the Java exception hierarchy:**

![Java exception hierarchy](https://oss.javaguide.cn/github/javaguide/java/basis/types-of-exceptions-in-java.png)

### What is the difference between `Exception` and `Error`?

In Java, all exceptions and errors share the `Throwable` class in the `java.lang` package as a common superclass. `Throwable` has two important subclasses:

- **`Exception`**: Conditions an application may handle with `catch`. Exceptions can be checked (must be caught or declared) or unchecked (need not be handled explicitly).
- **`Error`**: Serious conditions that applications generally should not try to handle with `catch`. Examples include JVM failures (`VirtualMachineError`), running out of memory (`OutOfMemoryError`), and class definition problems (`NoClassDefFoundError`). The JVM generally terminates the affected thread when these occur.

### What is the difference between `ClassNotFoundException` and `NoClassDefFoundError`?

- `ClassNotFoundException` is an exception raised when a class cannot be found during dynamic loading, such as through reflection. This is an expected condition that can be caught and handled.
- `NoClassDefFoundError` is an error raised when the JVM or class loader cannot find a class definition it needs. It can result from a missing JAR at runtime or from using a class again after its initialization failed. It usually terminates the current thread, but does not necessarily stop the entire JVM.

### ⭐️ What is the difference between checked and unchecked exceptions?

**Checked exceptions** must be caught or declared with `throws`; otherwise, the code will not compile.

For example, the following I/O operation:

![](https://oss.javaguide.cn/github/javaguide/java/basis/checked-exception.png)

Except for `RuntimeException` and its subclasses, `Exception` and its subclasses are checked exceptions. Common examples include I/O exceptions, `ClassNotFoundException`, and `SQLException`.

**Unchecked exceptions** do not have to be handled explicitly for the code to compile.

`RuntimeException` and its subclasses are unchecked. In the JLS classification, `Error` and its subclasses are also unchecked. Common `RuntimeException` subclasses include:

- `NullPointerException` (null reference)
- `IllegalArgumentException` (invalid argument, such as an argument of the wrong type)
- `NumberFormatException` (invalid numeric format; a subclass of `IllegalArgumentException`)
- `ArrayIndexOutOfBoundsException` (array index out of bounds)
- `ClassCastException` (invalid type cast)
- `ArithmeticException` (arithmetic error)
- `SecurityException` (security error, such as insufficient permissions)
- `UnsupportedOperationException` (unsupported operation, such as trying to create a duplicate user)
- ……

![](https://oss.javaguide.cn/github/javaguide/java/basis/unchecked-exception.png)

### Do you prefer checked or unchecked exceptions?

Use unchecked exceptions by default, and use checked exceptions only when needed.

You can think of an unchecked exception such as `NullPointerException` as a code bug. The best approach is to expose the bug and fix the code, rather than hide it with `try-catch`.

In general, use a checked exception when the condition is part of the business logic and the caller must handle it. For example, an insufficient-balance condition is a normal business outcome, not a bug. A checked exception can require the caller to handle it, such as by asking the user to add funds, while keeping the business logic explicit.

### What are some common methods of `Throwable`?

- `String getMessage()`: Returns the detail message for the exception.
- `String toString()`: Returns a brief description of the exception.
- `String getLocalizedMessage()`: Returns a localized message. A `Throwable` subclass can override this method to provide one; otherwise, it returns the same value as `getMessage()`.
- `void printStackTrace()`: Prints the exception information contained in the `Throwable` to the console.

### How do you use `try-catch-finally`?

- `try` block: Contains code that may throw an exception. It can be followed by zero or more `catch` blocks; if there is no `catch`, it must be followed by `finally`.
- `catch` block: Handles an exception thrown in the `try` block.
- `finally` block: Runs whether or not an exception is caught. If `try` or `catch` contains a `return`, `finally` runs before the method returns.

Example:

```java
try {
    System.out.println("Try to do something");
    throw new RuntimeException("RuntimeException");
} catch (Exception e) {
    System.out.println("Catch Exception -> " + e.getMessage());
} finally {
    System.out.println("Finally");
}
```

Output:

```plain
Try to do something
Catch Exception -> RuntimeException
Finally
```

**Do not use `return` in a `finally` block.** If both `try` and `finally` return, the `try` return is discarded. The value from `try` is saved temporarily, but the `return` in `finally` replaces it.

Example:

```java
public static void main(String[] args) {
    System.out.println(f(2));
}

public static int f(int value) {
    try {
        return value * value;
    } finally {
        if (value == 2) {
            return 0;
        }
    }
}
```

Output:

```plain
0
```

### Does code in `finally` always run?

No. In some situations, code in `finally` does not run.

For example, if the JVM terminates before reaching `finally`, the block will not run.

```java
try {
    System.out.println("Try to do something");
    throw new RuntimeException("RuntimeException");
} catch (Exception e) {
    System.out.println("Catch Exception -> " + e.getMessage());
    // Terminate the currently running JVM.
    System.exit(1);
} finally {
    System.out.println("Finally");
}
```

Output:

```plain
Try to do something
Catch Exception -> RuntimeException
```

Also, if the JVM process is forcibly terminated (for example, by calling `Runtime.halt()`, the operating system killing the process, or a power failure), the `finally` block may not run. An ordinary uncaught exception may end the current thread, but `finally` still runs before the thread exits.

Related issue: <https://github.com/Snailclimb/JavaGuide/issues/190>.

🧗🏻 For a deeper look, examine how the `try-catch-finally` syntactic sugar is implemented in bytecode.

### How can you use `try-with-resources` instead of `try-catch-finally`?

1. **Applicable resources:** Any object that implements `java.lang.AutoCloseable` or `java.io.Closeable`.
2. **Order of closing resources and running `finally`:** In a `try-with-resources` statement, resources are closed before any `catch` or `finally` block runs.

_Effective Java_ puts it this way:

> For resources that must be closed, prefer `try-with-resources` over `try-finally`. The resulting code is shorter and clearer, and the exceptions are more useful. `try-with-resources` makes it much easier to write code that correctly closes resources.

Resources such as `InputStream`, `OutputStream`, `Scanner`, and `PrintWriter` need to be closed with `close()`. The usual `try-catch-finally` approach looks like this:

```java
// Read the contents of a text file.
Scanner scanner = null;
try {
    scanner = new Scanner(new File("D://read.txt"));
    while (scanner.hasNext()) {
        System.out.println(scanner.nextLine());
    }
} catch (FileNotFoundException e) {
    e.printStackTrace();
} finally {
    if (scanner != null) {
        scanner.close();
    }
}
```

Rewrite the code above using `try-with-resources` (Java 7 and later):

```java
try (Scanner scanner = new Scanner(new File("test.txt"))) {
    while (scanner.hasNext()) {
        System.out.println(scanner.nextLine());
    }
} catch (FileNotFoundException fnfe) {
    fnfe.printStackTrace();
}
```

`try-with-resources` also makes it simple to close multiple resources. Using `try-catch-finally` for this can introduce unnecessary complexity.

Declare multiple resources in a `try-with-resources` statement by separating them with semicolons.

```java
try (BufferedInputStream bin = new BufferedInputStream(new FileInputStream(new File("test.txt")));
     BufferedOutputStream bout = new BufferedOutputStream(new FileOutputStream(new File("out.txt")))) {
    int b;
    while ((b = bin.read()) != -1) {
        bout.write(b);
    }
}
catch (IOException e) {
    e.printStackTrace();
}
```

### ⭐️ What should you keep in mind when using exceptions?

- Do not store exceptions in static variables; doing so can make stack trace information misleading. Create a new exception object whenever you throw one.
- Include a meaningful message in each exception.
- Prefer specific exception types. For example, use `NumberFormatException` for an invalid numeric string rather than its superclass, `IllegalArgumentException`.
- Avoid duplicate logging. If the catch site has already logged sufficient details (exception type, message, and stack trace), do not log the same information again when rethrowing it. Duplicate logs add noise and can obscure the root cause.
- ……

## Generics

### What are generics, and what are they used for?

**Java generics** were introduced in JDK 5. They improve code readability and type safety by letting you specify types as parameters.

The compiler checks generic type parameters, which let you specify the types an object can accept. For example, `ArrayList<Person> persons = new ArrayList<Person>()` indicates that the list accepts `Person` objects; adding a different type causes a compile-time error.

```java
ArrayList<E> extends AbstractList<E>
```

The raw `List` type returns `Object`, so you need a manual cast before using an element. With generics, the compiler handles the type conversion.

### What are the ways to use generics?

There are three common uses of generics: **generic classes**, **generic interfaces**, and **generic methods**.

**1. Generic class:**

```java
// T can be any valid identifier. Common type parameter names include T, E, K, and V.
// Specify the type argument when creating an instance of the generic class.
public class Generic<T>{

    private T key;

    public Generic(T key) {
        this.key = key;
    }

    public T getKey(){
        return key;
    }
}
```

To instantiate a generic class:

```java
Generic<Integer> genericInteger = new Generic<Integer>(123456);
```

**2. Generic interface:**

```java
public interface Generator<T> {
    public T method();
}
```

Implement the generic interface without specifying a type:

```java
class GeneratorImpl<T> implements Generator<T>{
    @Override
    public T method() {
        return null;
    }
}
```

Implement the generic interface and specify a type:

```java
class GeneratorImpl implements Generator<String> {
    @Override
    public String method() {
        return "hello";
    }
}
```

**3. Generic method:**

```java
   public static < E > void printArray( E[] inputArray )
   {
         for ( E element : inputArray ){
            System.out.printf( "%s ", element );
         }
         System.out.println();
    }
```

Usage:

```java
// Create arrays of different types: Integer, Double, and Character.
Integer[] intArray = { 1, 2, 3 };
String[] stringArray = { "Hello", "World" };
printArray( intArray  );
printArray( stringArray  );
```

> Note: `public static <E> void printArray(E[] inputArray)` is a static generic method. A static context has no current instance, so it cannot refer to the type parameter declared by the class. This is unrelated to static methods being “loaded first.” A static method can declare and use its own type parameter, such as `<E>`.

### Where are generics used in projects?

- A generic response type such as `CommonResult<T>` lets each API specify the type of its result data.
- A class such as `ExcelUtil<T>` can specify the data type to export to Excel.
- Collection utility methods use generics (see `sort()` and `binarySearch()` in `Collections`).
- ……

## ⭐️ Reflection

For a detailed discussion of reflection, see [Java Reflection in Detail](https://javaguide.cn/java/basis/reflection.html).

### What is reflection?

Simply put, Java reflection is the ability to **inspect class information and operate on classes or objects (methods and fields) at runtime**.

Normally, types are known at compile time, as are the methods to call and fields to access. Reflection lets us inspect a class's methods, fields, and constructors at **runtime**, then create objects, call methods, or modify fields when access checks and module boundaries allow it.

This ability to inspect and operate on code at runtime makes reflection a **foundation for many general-purpose frameworks and libraries**. It lets code work with types that were not known at compile time.

### What are the advantages and disadvantages of reflection?

**Advantages:**

1. **Flexibility and dynamism**: Reflection can load classes, create objects, call methods, and access fields at runtime. It can adapt program behavior based on configuration files, user input, annotations, and other runtime information. Frameworks such as Spring, Hibernate, and MyBatis use reflection for dependency injection (DI), aspect-oriented programming (AOP), object-relational mapping (ORM), and annotation processing.
2. **Loose coupling and generality**: Reflection can help create reusable, general-purpose code with fewer dependencies between modules. Examples include generic object-copying, serialization, and bean utilities.

**Disadvantages:**

1. **Performance overhead**: Reflection is usually slower than direct calls due to dynamic type resolution, method lookup, and limitations on JIT optimization. This cost is often acceptable for frameworks, which may also cache reflective lookups.
2. **Security concerns**: When access checks and module openness allow it, reflection can bypass some Java access checks (for example, for `private` fields and methods), weakening encapsulation. It can also bypass compile-time generic checks and create type-safety risks. Java 9 and later module boundaries may reject deep reflective access with `InaccessibleObjectException`.
3. **Readability and maintainability**: Excessive reflection can make code complex and hard to understand or debug. Errors often appear at runtime rather than being caught at compile time.

Related reading: [Java Reflection: Why is it so slow?](https://stackoverflow.com/questions/1392351/java-reflection-why-is-it-so-slow).

### What are some use cases for reflection?

You may rarely use Java reflection directly in business code, but many popular frameworks rely on it. **Spring/Spring Boot and MyBatis use reflection extensively**, which helps make them flexible and powerful.

Here are a few common use cases.

**1. Dependency injection and inversion of control (IoC)**

IoC frameworks such as Spring and Spring Boot scan for classes with annotations such as `@Component`, `@Service`, `@Repository`, and `@Controller` at startup. They use reflection to instantiate objects (beans) and inject dependencies, for example with `@Autowired` or constructor injection.

**2. Annotation processing**

An annotation is just a marker; something must read it to determine what to do. Reflection lets a framework inspect classes, methods, and fields for specific annotations, then act on their values. For example, when it sees `@Value`, it can read the annotation, find the corresponding value in configuration, and use reflection to assign it to a field.

**3. Dynamic proxies and AOP**

Want to add behavior before or after a method call, such as logging, transaction handling, or permission checks? AOP (aspect-oriented programming) is designed for this, and dynamic proxies are a common way to implement it. JDK dynamic proxies (`Proxy` and `InvocationHandler`) rely on reflection. The proxy calls the real object's method through `Method.invoke()`.

```java
public class DebugInvocationHandler implements InvocationHandler {
    private final Object target; // The real object

    public DebugInvocationHandler(Object target) { this.target = target; }

    // proxy: proxy object; method: invoked method; args: method arguments
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("AOP logic: before calling " + method.getName());
        // Call the corresponding method on the real object through reflection.
        Object result = method.invoke(target, args);
        System.out.println("AOP logic: after calling " + method.getName());
        return result;
    }
}
```

**4. Object-relational mapping (ORM)**

Frameworks such as MyBatis and Hibernate turn rows returned by a database into Java objects. They use reflection to inspect a Java class's fields, map query results by name or configuration, and call setters or assign field values. When saving an object, they can also use reflection to read its fields and build SQL statements.

## Proxies

For a detailed introduction to Java proxies, see [Java Proxy Pattern in Detail](https://javaguide.cn/java/basis/proxy.html).

### How do you implement a dynamic proxy?

A dynamic proxy is a design pattern that lets us **add behavior to a class or object's methods without changing the source code**.

The two most common ways to implement dynamic proxies in Java are **JDK dynamic proxies** and **CGLIB proxies**.

**Option 1: JDK dynamic proxies**

This is provided by Java and requires the target class to implement at least one interface. At runtime, JDK dynamic proxies use `Proxy.newProxyInstance()` to create an instance of a proxy class that implements those interfaces. The class is generated in memory, so you will not see its `.java` or `.class` file.

When you call a method on the proxy object, the call is forwarded to the `invoke` method of the `InvocationHandler` you provide. There, you can add behavior before or after calling the original target method.

**Option 2: CGLIB proxies**

CGLIB is a third-party code generation library. Unlike JDK proxies, it does not require the target class to implement an interface. At runtime, it generates a subclass of the target class as the proxy, using ASM bytecode manipulation. It overrides the superclass methods that are not `final`, `private`, or `static`.

When you call a method on the proxy, CGLIB intercepts it through `MethodInterceptor.intercept()`. As with `InvocationHandler.invoke()`, you can add behavior before or after calling the original superclass method.

### What is the difference between static and dynamic proxies?

The main differences between static and dynamic proxies are **when the proxy is created, implementation flexibility, and maintenance cost**.

| Aspect                    | Static proxy                                                                                               | Dynamic proxy                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| When the proxy is created | At compile time; a fixed `.class` file is generated                                                        | At runtime; proxy bytecode is generated and loaded into the JVM                                 |
| Implementation            | Write the proxy class by hand before compilation; it often delegates to the target object                  | No need to write a specific proxy class; put the added behavior in a `Handler` or `Interceptor` |
| Interface requirement     | Not required; interface-based static proxies usually share an interface with the target                    | JDK proxies use interfaces; CGLIB and similar subclass proxies target inheritable classes       |
| Code and maintenance      | More code as the number of target classes grows; changes to an interface may require updating both classes | Less code because shared behavior can be reused; interface changes do not affect proxy logic    |
| Main advantage            | Simple implementation and clear logic, with no extra framework dependency                                  | Flexible and reusable, reducing duplicate code and supporting complex cases                     |
| Common use cases          | Simple decorators and a small number of fixed classes                                                      | Spring AOP, RPC frameworks such as Dubbo, and ORM frameworks                                    |

### ⭐️ How do JDK dynamic proxies differ from CGLIB proxies?

1. JDK dynamic proxies are built into Java and require the target class to implement an interface. They generate a proxy class that implements the interface. CGLIB is a third-party library and does not require an interface; it generates a subclass of the target class. Because it uses inheritance, CGLIB cannot proxy `final` classes, and it cannot override `final` or `private` methods.
2. In many cases, JDK dynamic proxies are more efficient, and this advantage has become more pronounced in newer JDK versions.

### ⭐️ What are some practical uses of dynamic proxies in frameworks?

The most common use of dynamic proxies is **Spring AOP**.

AOP (aspect-oriented programming) encapsulates logic that is shared across business modules but is not part of their core business behavior, such as transaction handling, logging, and access control. This reduces duplicated code and coupling while improving extensibility and maintainability.

Spring AOP uses dynamic proxies. If the target object implements an interface, Spring AOP uses **JDK Proxy** to create the proxy. If it does not implement an interface, Spring AOP cannot use JDK Proxy and instead uses **CGLIB** to generate a subclass as the proxy, as shown below:

![SpringAOPProcess](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/230ae587a322d6e4d09510161987d346.jpeg)

## Annotations

### What are annotations?

`Annotation` was introduced in Java 5. An annotation is a special kind of metadata that can be applied to classes, methods, and variables to provide information for use at compile time or runtime.

An annotation is essentially a special interface that extends `Annotation`:

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.SOURCE)
public @interface Override {

}

public interface Override extends Annotation{

}
```

The JDK provides many built-in annotations, such as `@Override` and `@Deprecated`. You can also define your own annotations.

### How can annotations be processed?

Annotations take effect only when they are processed. There are two common ways to process them:

- **Compile-time scanning**: The compiler scans and processes annotations while compiling Java code. For example, `@Override` makes the compiler check that a method actually overrides a superclass method.
- **Runtime reflection**: Framework annotations such as Spring's `@Value` and `@Component` are often processed through reflection.

## ⭐️ SPI

For a detailed explanation of SPI, see [Java SPI in Detail](https://javaguide.cn/java/basis/spi.html).

### What is SPI?

SPI stands for Service Provider Interface. It is an interface intended for service providers or developers who extend a framework.

SPI separates a service interface from its implementation and decouples callers from providers, improving extensibility and maintainability. Implementations can be changed or replaced without changing the caller.

Many frameworks use Java's SPI mechanism, including Spring, JDBC driver loading, logging APIs, and Dubbo extensions.

<img src="https://oss.javaguide.cn/github/javaguide/java/basis/spi/22e1830e0b0e4115a882751f6c417857tplv-k3u1fbpfcp-zoom-1.jpeg" style="zoom:50%;" />

### What is the difference between SPI and API?

**How do SPI and API differ?**

SPI brings up API (Application Programming Interface). In a broad sense, both are interfaces and can be easy to confuse. The diagram below illustrates the distinction:

![SPI VS API](https://oss.javaguide.cn/github/javaguide/java/basis/spi-vs-api.png)

Modules generally communicate through interfaces, so an interface is used between the service caller and the service implementation (also called the provider).

- When the provider supplies both the interface and implementation, the caller uses the provider's interface to access its capabilities. This is an **API**. The interface and implementation are both in the provider's package, and the caller does not need to know the implementation details.
- When the interface is defined by the caller, it is an **SPI**. The caller defines the contract, and different providers implement it to supply services.

A simple example: Company H designs a chip and needs to manufacture it at scale. Several chip manufacturers are available. Company H defines the production standard (the interface contract), and each manufacturer (service provider) builds its own chip implementation that meets the same standard.

### What are the advantages and disadvantages of SPI?

SPI makes interface design much more flexible, but it also has some drawbacks:

- `ServiceLoader` locates and instantiates providers as needed. Iterating over all providers to choose one triggers loading of every available provider.
- A single `ServiceLoader` instance is not guaranteed to be thread-safe. Separate instances do not necessarily conflict if they call `load` at the same time.

## ⭐️ Serialization and Deserialization

For a detailed explanation of serialization and deserialization, see [Java Serialization in Detail](https://javaguide.cn/java/basis/serialization.html), which covers these topics and related interview questions more fully.

### What are serialization and deserialization?

Serialization is used when you need to persist a Java object, such as saving it to a file, or transmit it over a network.

In short:

- **Serialization** converts a data structure or object into a storable or transmittable format, usually a binary byte stream but sometimes text such as JSON or XML.
- **Deserialization** converts serialized data back into the original data structure or object.

In an object-oriented language such as Java, we serialize objects (instances of classes). In C++, a partially object-oriented language, a `struct` defines a data structure type, while a `class` defines an object type.

Common use cases for serialization and deserialization include:

- Serialize an object before sending it over a network (for example, during a remote procedure call), then deserialize it after receipt.
- Serialize an object before saving it to a file, then deserialize it when reading it back.
- Serialize an object before storing it in a database or cache such as Redis, then deserialize it when retrieving it.
- Serialize an object when converting it to a byte representation for long-term storage or transfer between components. Ordinary Java objects do not need serialization just to be used in JVM memory.

Wikipedia describes serialization as follows:

> **Serialization** is the process of converting a data structure or object state into a format that can be stored or transmitted (for example, in a file, buffer, or network message) so it can later be restored in the same or another computing environment. Deserialization reverses this process by extracting a data structure from a sequence of bytes. Serialization is also called marshalling, and deserialization is also called unmarshalling.

In short, **serialization converts an object into a representation suitable for network transmission or persistence in a file system, database, cache, or other medium.**

![](https://oss.javaguide.cn/github/javaguide/a478c74d-2c48-40ae-9374-87aacf05188c.png)

<p style="text-align:right;font-size:13px;color:gray">https://www.corejavaguru.com/java/serialization/interview-questions-1</p>

**Which layer of the four-layer TCP/IP model does a serialization protocol belong to?**

The two sides of a network connection must use and follow the same protocol. The four layers of the TCP/IP model are listed below. Which layer includes serialization protocols?

1. Application layer
2. Transport layer
3. Internet layer
4. Network interface layer

![The four-layer TCP/IP model](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-ip-4-model.png)

As shown above, the presentation layer in the seven-layer OSI model converts application data to a binary stream and back. This corresponds to serialization and deserialization.

The application, presentation, and session layers of the OSI model all correspond to the application layer of the TCP/IP model. Therefore, serialization protocols are part of the TCP/IP application layer.

### How can you prevent some fields from being serialized?

Mark a variable with the `transient` keyword if you do not want it to be serialized.

The `transient` keyword prevents the marked instance variable from being serialized. When the object is deserialized, the transient field is not restored and has its type's default value.

Keep these points about `transient` in mind:

- `transient` can be applied to variables, but not to classes or methods.
- After deserialization, a transient field has its type's default value. For example, a transient `int` field is `0`.
- `static` fields are not serialized, whether or not they are marked `transient`, because they do not belong to an object instance.

### What are some common serialization protocols?

The JDK's built-in serialization is generally avoided because it is inefficient and has security risks. Common alternatives include Hessian, Kryo, Protobuf, and ProtoStuff, all of which use binary formats.

JSON and XML are text-based serialization formats. They are more readable, but can have lower performance.

### Why is the JDK's built-in serialization not recommended?

The main reasons to avoid using the JDK's built-in serialization directly are:

- **No cross-language support**: It is not suitable when communicating with services written in other languages.
- **Poor performance**: Compared with other serialization frameworks, it can produce larger byte arrays and increase transfer costs.
- **Security risks**: Serialization and deserialization are not inherently unsafe. However, if an attacker can control the input, they may craft data that causes deserialization to create unexpected objects and execute unintended code. Related reading: [Application Security: The Java Deserialization Vulnerability](https://cryin.github.io/blog/secure-development-java-deserialization-vulnerability/).

## I/O

For a detailed discussion of I/O, see the articles below, which cover these topics and related interview questions more fully.

- [Java I/O Basics](https://javaguide.cn/java/io/io-basis.html)
- [Design Patterns in Java I/O](https://javaguide.cn/java/io/io-design-patterns.html)
- [Java I/O Models in Detail](https://javaguide.cn/java/io/io-model.html)

### What do you know about Java I/O streams?

I/O stands for input/output. Input is the process of bringing data into computer memory; output sends it to external storage or a destination such as a database, file, or remote host. Because data flows between sources and destinations, these mechanisms are called streams. Java streams are divided into input and output streams, and into byte and character streams based on how they process data.

Java's more than 40 I/O stream classes derive from these four abstract base classes:

- `InputStream` / `Reader`: Base classes for input streams; the former handles bytes, the latter characters.
- `OutputStream` / `Writer`: Base classes for output streams; the former handles bytes, the latter characters.

### Why are I/O streams divided into byte and character streams?

The question is: **Files and network communication both use bytes as the smallest storage unit, so why does Java provide both byte and character streams?**

There are two main reasons:

- Character streams convert bytes to characters using a charset, which takes some processing.
- Without handling the character encoding correctly, reading text as bytes can easily produce garbled text.

### What design patterns are used in Java I/O?

See [Design Patterns in Java I/O](https://javaguide.cn/java/io/io-design-patterns.html).

### ⭐️ What is the difference between BIO, NIO, and AIO?

See [Java I/O Models in Detail](https://javaguide.cn/java/io/io-model.html).

## Syntactic Sugar

### What is syntactic sugar?

**Syntactic sugar** refers to language syntax designed to make programming more convenient. It does not change what the language can do, but can make code simpler and easier to read.

For example, Java's `for-each` loop is common syntactic sugar. It is compiled using a regular `for` loop and an iterator.

```java
String[] strs = {"JavaGuide", "JavaGuide newsletter", "Blog: https://javaguide.cn/"};
for (String s : strs) {
    System.out.println(s);
}
```

The JVM does not recognize syntactic sugar directly. Before it can run, the compiler desugars it by translating it into basic constructs the JVM understands. This means Java's compiler, not the JVM, provides syntactic sugar. In the source for `com.sun.tools.javac.main.JavaCompiler`, the `compile()` method calls `desugar()` to perform this translation.

### What are some common examples of syntactic sugar in Java?

Common examples of Java syntactic sugar include generics, autoboxing and unboxing, varargs, enums, inner classes, enhanced `for` loops, `try-with-resources`, and lambda expressions.

For a detailed explanation of these features, see [Java Syntactic Sugar in Detail](./syntactic-sugar.md).

<!-- @include: @article-footer.snippet.md -->
