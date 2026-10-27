---
title: Java Keywords Explained
description: A guide to common Java keywords, including final, static, this, super, volatile, transient, and synchronized.
category: Java
tag:
  - Java Fundamentals
head:
  - - meta
    - name: keywords
      content: Java keywords,final,static,this,super,volatile,transient,synchronized
---

# Java Keywords: final, static, this, and super

## The final Keyword

**The `final` keyword marks a class, method, or variable as non-modifiable in specific ways:**

1. A `final` class can't be extended. Its methods are implicitly final.

2. A `final` method can't be overridden.

3. A `final` variable can be assigned only once. A primitive's value can't change after initialization. A reference can't point to a different object after initialization, though the referenced object may still be mutable. Only `final` variables that meet the JLS definition of a constant variable are compile-time constants.

There are two historical reasons for using `final` methods:

1. To prevent subclasses from changing the method's behavior.
2. For performance. Early Java implementations could inline final methods, but this offered little benefit for large methods. Modern Java doesn't require `final` methods for this optimization.

## The static Keyword

**The `static` keyword is commonly used in four ways:**

1. **Static fields and methods:** A static member belongs to the class and is shared by its instances. Access it through the class name, for example, `ClassName.field` or `ClassName.method()`. Its storage location is a JVM implementation detail. In HotSpot JDK 8 and later, class metadata is stored in metaspace in native memory, while static fields are stored on the Java heap.
2. **Static initializer blocks:** These are declared outside methods. They run during class initialization, before instance initializers and constructors, and run only once for that class.
3. **Static nested classes:** Only nested classes can be declared static. Unlike a non-static inner class, a static nested class has no implicit reference to an instance of the enclosing class. It can be created without an enclosing instance and can't access the enclosing class's instance members directly.
4. **Static imports:** Introduced in Java 5, `import static` lets you use selected static members without qualifying them with the class name.

## The this Keyword

The `this` keyword refers to the current instance of a class. For example:

```java
class Manager {
    Employees[] employees;
    void manageEmployees() {
        int totalEmp = this.employees.length;
        System.out.println("Total employees: " + totalEmp);
        this.report();
    }
    void report() { }
}
```

In this example, `this` is used in two places:

- `this.employees.length` accesses a field on the current `Manager` instance.
- `this.report()` calls a method on the current `Manager` instance.

`this` is optional when the meaning is unambiguous, but using it can make code easier to read.

## The super Keyword

The `super` keyword lets a subclass access superclass fields and methods. For example:

```java
public class Super {
    protected int number;
    protected void showNumber() {
        System.out.println("number = " + number);
    }
}
public class Sub extends Super {
    void bar() {
        super.number = 10;
        super.showNumber();
    }
}
```

Here, `Sub` accesses the `number` field and calls the `showNumber()` method declared in `Super`.

**Keep the following points in mind when using `this` and `super`:**

- In Java 8, a `super()` or `this()` constructor invocation must be the first statement in a constructor. A `this()` invocation calls another constructor in the same class.
- `this` and `super` can't be used in a static context.

Why?

Static members belong to the class, and there is no current instance in a static context, so `this` isn't available. `super` is syntax for accessing superclass members or calling a superclass constructor, not an independent reference to a superclass object, so it also isn't available in a static context.

## References

- <https://www.codejava.net/java-core/the-java-language/java-keywords>
- <https://blog.csdn.net/u013393958/article/details/79881037>

# The static Keyword in Detail

## Four Common Uses of static

1. Static fields and methods.
2. Static initializer blocks.
3. Static nested classes. Only nested classes can be static.
4. Static imports, introduced in Java 5, for importing static members.

### Static Fields and Methods

Static members belong to the class rather than an individual instance and are shared by all instances. Access them through the class name. The exact storage location of static fields is a JVM implementation detail.

Like the Java heap, the method area is a runtime data area shared by all threads. The JVM specification says it stores per-class structures such as the runtime constant pool, field and method data, and method and constructor code. The exact layout depends on the JVM implementation.

In HotSpot JDK 7 and earlier, the method area was mainly implemented by the permanent generation, though the method area and permanent generation were not equivalent. JDK 8 removed the permanent generation: class metadata moved to metaspace in native memory, while string constants and static fields are stored on the Java heap.

Access static members using:

- `ClassName.field`
- `ClassName.method()`

If a field or method is `private`, it can only be accessed from within its class.

Example:

```java
public class StaticBean {
    String name;
    // Static field.
    static int age;
    public StaticBean(String name) {
        this.name = name;
    }
    // Static method.
    static void sayHello() {
        System.out.println("Hello, I am Java.");
    }
    @Override
    public String toString() {
        return "StaticBean{"+
                "name=" + name + ",age=" + age +
                "}";
    }
}
```

```java
public class StaticDemo {
    public static void main(String[] args) {
        StaticBean staticBean = new StaticBean("1");
        StaticBean staticBean2 = new StaticBean("2");
        StaticBean staticBean3 = new StaticBean("3");
        StaticBean staticBean4 = new StaticBean("4");
        StaticBean.age = 33;
        System.out.println(staticBean + " " + staticBean2 + " " + staticBean3 + " " + staticBean4);
        // StaticBean{name=1,age=33} StaticBean{name=2,age=33} StaticBean{name=3,age=33} StaticBean{name=4,age=33}
        StaticBean.sayHello(); // Hello, I am Java.
    }
}
```

### Static Initializer Blocks

Static initializer blocks are declared outside methods. They run before instance initializer blocks and constructors. A static initializer runs only once when its class is initialized, regardless of how many objects are created.

Syntax:

```plain
static {
statements;
}
```

A class can have multiple static initializer blocks outside its methods. They run once during class initialization, in the order they appear in the source. Class loading can happen before initialization.

![](https://oss.javaguide.cn/github/javaguide/88531075.jpg)

In a static initializer block, you can assign to a static field declared later in the class, but you can't read it before its declaration.

### Static Nested Classes

The main difference between a static nested class and a non-static inner class is that an inner class holds an implicit reference to an instance of its enclosing class. A static nested class doesn't, which means:

1. You can create it without an instance of the enclosing class.
2. It can't directly access the enclosing class's instance fields or methods.

Example: using a static nested class for a singleton.

```java
public class Singleton {
    // Make the constructor private to prevent external instantiation.
    private Singleton() {
    }
   // Keep the nested class private so only Singleton can access it.
    private static class SingletonHolder {
        private static final Singleton INSTANCE = new Singleton();
    }
    public static Singleton getUniqueInstance() {
        return SingletonHolder.INSTANCE;
    }
}
```

When `getUniqueInstance()` first accesses `SingletonHolder.INSTANCE`, the JVM initializes `SingletonHolder` and creates the instance. The JVM may load `SingletonHolder` earlier, but loading alone doesn't trigger its static initialization. The JVM also guarantees that a class is initialized only once.

This approach provides lazy initialization and relies on the JVM for thread safety.

### Static Imports

Syntax: `import static`

Use `import static` to import selected static members from a class so you can refer to them without the class name.

```java
// Import all static members from Math so its methods can be used without the class name.
// To import only one method, replace * with its name.
import static java.lang.Math.*; // For example: import static java.lang.Math.max;
public class Demo {
  public static void main(String[] args) {
    int max = max(1,2);
    System.out.println(max);
  }
}
```

## Additional Notes

### Static and Instance Methods

Static methods belong to the class; instance methods belong to individual objects. Make a method static if its behavior doesn't depend on instance fields or methods.

Example:

```java
class Foo {
    int i;
    public Foo(int i) {
       this.i = i;
    }
    public static String method1() {
       return "An example string that doesn't depend on i (an instance variable)";
    }
    public int method2() {
       return this.i + 1;  // Depends on i.
    }
}
```

Call the static method with `Foo.method1()`. Calling `method2` this way fails, but you can call it on an instance:

```java
Foo bar = new Foo(1);
bar.method2();
```

In summary:

- You can call a static method with either `ClassName.method()` or `instance.method()`. An instance method requires an instance. You don't need to create an object to call a static method.
- A static method can directly access only static members of its class. An instance method can access both static and instance members.

### Static and Instance Initializer Blocks

Both kinds of initializer blocks can appear more than once in a class. Static blocks run in source order during class initialization; instance initializer blocks run in source order during instance initialization.

Static blocks run once during class initialization, which isn't necessarily triggered by the first `new` expression. Instance initializer blocks run each time a new instance is initialized. They run in source order with instance field initializers, after the superclass constructor returns and before the remaining statements in the constructor. If a constructor delegates to another constructor with `this(...)`, the initialization occurs in the constructor that calls the superclass constructor. A bare block inside a method is a local block, not an instance initializer.

> **🐛 Correction (see [issue #677](https://github.com/Snailclimb/JavaGuide/issues/677)):** A static initializer may run when an object is first created, but creating an object isn't the only trigger. For example, `Class.forName("ClassDemo")` also initializes the class and runs its static initializers.
> Static initializer blocks can initialize fields or objects when a class is initialized. Use static methods for operations that should be callable without creating an object, as in classes such as `Arrays`, `Character`, and `String`. A static initializer runs automatically during class initialization; a static method runs when called.

Example：

```java
public class Test {
    public Test() {
        System.out.print("Default constructor -- ");
    }
    // Instance initializer block.
    {
        System.out.print("Instance initializer -- ");
    }
    // Static initializer block.
    static {
        System.out.print("Static initializer -- ");
    }
    private static void test() {
        System.out.print("Inside static method -- ");
        {
            System.out.print("Block inside static method -- ");
        }
    }
    public static void main(String[] args) {
        Test test = new Test();
        Test.test(); // Static initializer -- Inside static method -- Block inside static method --
    }
}
```

The code above outputs:

```plain
Static initializer -- Instance initializer -- Default constructor -- Inside static method -- Block inside static method --
```

When only `Test.test();` is executed, the output is:

```plain
Static initializer -- Inside static method -- Block inside static method --
```

When only `Test test = new Test();` is executed, the output is:

```plain
Static initializer -- Instance initializer -- Default constructor --
```

An instance initializer provides initialization shared by all constructors. A constructor initializes a particular object and may vary between overloads, but the instance initializer runs for each object before the constructor body. Use it for initialization common to all instances.

### References

- <https://blog.csdn.net/chen13579867831/article/details/78995480>
- <https://www.cnblogs.com/chenssy/p/3388487.html>
- <https://www.cnblogs.com/Qian123/p/5713440.html>

<!-- @include: @article-footer.snippet.md -->
