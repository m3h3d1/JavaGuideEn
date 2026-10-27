---
title: Java Reflection Explained
description: Learn Java reflection and its core Class, Method, and Field APIs, and see how frameworks such as Spring and MyBatis use reflection and dynamic proxies.
category: Java
tag:
  - Java Fundamentals
head:
  - - meta
    - name: keywords
      content: Java reflection,reflection mechanism,Class,Method,Field,dynamic proxies,framework internals,runtime operations
---

## What Is Reflection?

If you've studied framework internals or written a framework, you're probably familiar with reflection.

Reflection is often called the soul of a framework because it lets a program inspect classes and invoke their methods at runtime.

Reflection can retrieve information about a class's fields, methods, and constructors, and can invoke or access them when access controls and module boundaries allow it. APIs also differ in scope: for example, `getMethods()` returns accessible public methods, while `getDeclaredMethods()` returns methods declared by the current class, excluding inherited methods.

## Where Is Reflection Used?

Most application developers rarely use reflection directly in business code.

That doesn't mean reflection isn't useful. It's widely used by frameworks such as Spring, Spring Boot, and MyBatis, making them easier to use.

**These frameworks also use dynamic proxies, which rely on reflection.**

The following JDK dynamic proxy example uses the reflection class `Method` to invoke a specific method.

```java
public class DebugInvocationHandler implements InvocationHandler {
    /**
     * The target object wrapped by the proxy.
     */
    private final Object target;

    public DebugInvocationHandler(Object target) {
        this.target = target;
    }


    public Object invoke(Object proxy, Method method, Object[] args) throws InvocationTargetException, IllegalAccessException {
        System.out.println("before method " + method.getName());
        Object result = method.invoke(target, args);
        System.out.println("after method " + method.getName());
        return result;
    }
}

```

Java's powerful **annotations** also rely on reflection.

How does Spring use `@Component` to register a class as a Spring bean? How does `@Value` read a value from a configuration file?

Reflection lets a framework inspect a class and retrieve annotations on the class, its fields and methods, and method parameters. The framework can then process those annotations.

## Pros and Cons of Reflection

**Pros:** Reflection makes code more flexible and helps frameworks provide convenient features.

**Cons:** Runtime access to classes can introduce security risks. For example, reflection can bypass generic type checks, which happen at compile time. Reflection can also be slower, though the impact is often small for frameworks. See [Java Reflection: Why Is It So Slow?](https://stackoverflow.com/questions/1392351/java-reflection-why-is-it-so-slow).

## Reflection in Practice

### Four Ways to Get a Class Object

To inspect a class dynamically, you need its `Class` object. It provides runtime information about the class, such as its methods and fields. Java offers four ways to get one:

**1. If the class is known at compile time:**

```java
Class alunbarClass = TargetObject.class;
```

Use this when the type is known at compile time. Accessing a class literal doesn't initialize the class.

**2. Pass the fully qualified class name to `Class.forName()`:**

```java
Class alunbarClass1 = Class.forName("cn.javaguide.TargetObject");
```

**3. Get it from an object with `instance.getClass()`:**

```java
TargetObject o = new TargetObject();
Class alunbarClass2 = o.getClass();
```

**4. Pass the class name to a class loader's `loadClass()`:**

```java
ClassLoader.getSystemClassLoader().loadClass("cn.javaguide.TargetObject");
```

Loading a class with a class loader doesn't initialize it, so static initializer blocks and static field initializers don't run at that point.

### Basic Reflection Operations

1. Create a `TargetObject` class to inspect with reflection.

```java
package cn.javaguide;

public class TargetObject {
    private String value;

    public TargetObject() {
        value = "JavaGuide";
    }

    public void publicMethod(String s) {
        System.out.println("I love " + s);
    }

    private void privateMethod() {
        System.out.println("value is " + value);
    }
}
```

2. Use reflection to inspect and invoke its methods and access its fields.

```java
package cn.javaguide;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class Main {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchMethodException, IllegalAccessException, InstantiationException, InvocationTargetException, NoSuchFieldException {
        /**
         * Get the Class object for TargetObject and create an instance.
         */
        Class<?> targetClass = Class.forName("cn.javaguide.TargetObject");
        TargetObject targetObject = (TargetObject) targetClass.getDeclaredConstructor().newInstance();
        /**
         * Get all methods declared in TargetObject.
         */
        Method[] methods = targetClass.getDeclaredMethods();
        for (Method method : methods) {
            System.out.println(method.getName());
        }

        /**
         * Get and invoke a specific method.
         */
        Method publicMethod = targetClass.getDeclaredMethod("publicMethod",
                String.class);

        publicMethod.invoke(targetObject, "JavaGuide");

        /**
         * Get and modify a specific field.
         */
        Field field = targetClass.getDeclaredField("value");
        // Disable access checks so the private field can be modified.
        field.setAccessible(true);
        field.set(targetObject, "JavaGuide");

        /**
         * Invoke a private method.
         */
        Method privateMethod = targetClass.getDeclaredMethod("privateMethod");
        // Disable access checks so the private method can be invoked.
        privateMethod.setAccessible(true);
        privateMethod.invoke(targetObject);
    }
}

```

Output:

```plain
publicMethod
privateMethod
I love JavaGuide
value is JavaGuide
```

**Note:** The code above may throw `ClassNotFoundException` if you don't replace the package name in the class path below with the package containing your `TargetObject` class. See [this article](https://www.cnblogs.com/chanshuyi/p/head_first_of_reflection.html) for details.

```java
Class<?> targetClass = Class.forName("cn.javaguide.TargetObject");
```

<!-- @include: @article-footer.snippet.md -->
