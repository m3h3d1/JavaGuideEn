---
title: Java Proxy Pattern Explained
description: Learn the Java proxy pattern, including static and dynamic proxies, JDK dynamic proxies, CGLIB, and their use in AOP.
category: Java
tag:
  - Java Fundamentals
head:
  - - meta
    - name: keywords
      content: Java proxy pattern,static proxies,dynamic proxies,JDK dynamic proxies,CGLIB,AOP,design patterns
---

## 1. The Proxy Pattern

The proxy pattern is a straightforward design pattern. **A proxy object stands in for a real object, adding functionality without changing the original target.**

**A proxy extends the target's behavior, for example, by running custom operations before or after a method call.**

For example, a bride might ask her aunt to handle questions from the groom. The aunt filters the questions before passing them along. Here, the aunt acts as a proxy, and handling questions is the proxy's behavior.

![Understanding the Proxy Design Pattern | by Mithun Sasidharan | Medium](https://oss.javaguide.cn/2020-8/1*DjWCgTFm-xqbhbNQVsaWQw.png)

<p style="text-align:right;font-size:13px;color:gray">https://medium.com/@mithunsasidharan/understanding-the-proxy-design-pattern-5e63fe38052a</p>

There are two common ways to implement the proxy pattern: static and dynamic proxies. Let's start with static proxies.

## 2. Static Proxies

With a static proxy, you manually add behavior for each target method, as shown below. This is inflexible: adding a method to the interface requires changes to both the target and proxy. You also need a separate proxy class for each target class, so static proxies are uncommon in day-to-day development.

From the JVM's perspective, **the interface, implementation, and proxy are compiled into separate class files at compile time.**

Steps to implement a static proxy:

1. Define an interface and an implementation.
2. Create a proxy class that implements the same interface.
3. Inject the target into the proxy and call the corresponding target method from the proxy method. This lets the proxy control access to the target and run custom behavior before or after the call.

Here's an example.

**1. Define an interface for sending messages.**

```java
public interface SmsService {
    String send(String message);
}
```

**2. Implement the interface.**

```java
public class SmsServiceImpl implements SmsService {
    public String send(String message) {
        System.out.println("send message:" + message);
        return message;
    }
}
```

**3. Create a proxy that implements the same interface.**

```java
public class SmsProxy implements SmsService {

    private final SmsService smsService;

    public SmsProxy(SmsService smsService) {
        this.smsService = smsService;
    }

    @Override
    public String send(String message) {
        // Add custom behavior before calling the method.
        System.out.println("before method send()");
        smsService.send(message);
        // Add custom behavior after calling the method.
        System.out.println("after method send()");
        return null;
    }
}
```

**4. Use the proxy.**

```java
public class Main {
    public static void main(String[] args) {
        SmsService smsService = new SmsServiceImpl();
        SmsProxy smsProxy = new SmsProxy(smsService);
        smsProxy.send("java");
    }
}
```

The code prints:

```bash
before method send()
send message:java
after method send()
```

The output shows that the proxy has added behavior around `SmsServiceImpl.send()`.

## 3. Dynamic Proxies

Dynamic proxies are more flexible than static proxies. You don't need a separate proxy class for every target. CGLIB can also proxy a concrete class without requiring it to implement an interface.

**From the JVM's perspective, a dynamic proxy generates class bytecode at runtime and loads it into the JVM.**

Spring AOP and RPC frameworks are two common examples that rely on dynamic proxies.

**Dynamic proxies are less common in everyday application code but are widely used in frameworks. Understanding them also helps explain how frameworks work.**

Java has several dynamic proxy implementations, including **JDK dynamic proxies** and **CGLIB**.

[guide-rpc-framework](https://github.com/Snailclimb/guide-rpc-framework) uses JDK dynamic proxies. Let's look at how they work.

The project doesn't use **CGLIB**, but this guide also introduces it and compares it with JDK dynamic proxies.

### 3.1. JDK Dynamic Proxies

#### 3.1.1. Overview

**The `InvocationHandler` interface and `Proxy` class are central to Java dynamic proxies.**

The `Proxy` class's most commonly used method is `newProxyInstance()`, which creates a proxy object.

```java
    public static Object newProxyInstance(ClassLoader loader,
                                          Class<?>[] interfaces,
                                          InvocationHandler h)
        throws IllegalArgumentException
    {
        ......
    }
```

This method takes three arguments:

1. **loader:** The class loader used to load the proxy.
2. **interfaces:** The interfaces implemented by the proxy.
3. **h:** An object that implements `InvocationHandler`.

To create a dynamic proxy, implement `InvocationHandler` to define the behavior. When a method is called on the proxy, the call is forwarded to the handler's `invoke` method.

```java
public interface InvocationHandler {

    /**
     * Called when a method is invoked on the proxy.
     */
    public Object invoke(Object proxy, Method method, Object[] args)
        throws Throwable;
}
```

The `invoke()` method takes three arguments:

1. **proxy:** The generated proxy object.
2. **method:** The method invoked on the proxy.
3. **args:** The method's arguments.

In other words, **calling a method on a proxy created with `Proxy.newProxyInstance()` invokes the `invoke()` method of its `InvocationHandler`.** You can define custom behavior there, such as actions before or after the target method runs.

#### 3.1.2. Steps to Create a JDK Dynamic Proxy

1. Define an interface and its implementation.
2. Implement `InvocationHandler` and override `invoke`. Call the target method there and add any custom behavior.
3. Create the proxy with `Proxy.newProxyInstance(ClassLoader loader, Class<?>[] interfaces, InvocationHandler h)`.

#### 3.1.3. Example

Here's a complete example.

**1. Define an interface for sending messages.**

```java
public interface SmsService {
    String send(String message);
}
```

**2. Implement the interface.**

```java
public class SmsServiceImpl implements SmsService {
    public String send(String message) {
        System.out.println("send message:" + message);
        return message;
    }
}
```

**3. Define a JDK invocation handler.**

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * @author shuang.kou
 * @createTime 2020-05-11 11:23:00
 */
public class DebugInvocationHandler implements InvocationHandler {
    /**
     * The target object wrapped by the proxy.
     */
    private final Object target;

    public DebugInvocationHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws InvocationTargetException, IllegalAccessException {
        // Add custom behavior before calling the method.
        System.out.println("before method " + method.getName());
        Object result = method.invoke(target, args);
        // Add custom behavior after calling the method.
        System.out.println("after method " + method.getName());
        return result;
    }
}

```

When the proxy calls a target method, the call first reaches `invoke()`. The handler then calls the target's original method.

**4. Create a proxy factory.**

```java
public class JdkProxyFactory {
    public static Object getProxy(Object target) {
        return Proxy.newProxyInstance(
                target.getClass().getClassLoader(), // The target class's class loader.
                target.getClass().getInterfaces(),  // Interfaces the proxy should implement.
                new DebugInvocationHandler(target)   // The handler for the proxy.
        );
    }
}
```

`getProxy()` uses `Proxy.newProxyInstance()` to create a proxy for a target object.

**5. Use the proxy.**

```java
SmsService smsService = (SmsService) JdkProxyFactory.getProxy(new SmsServiceImpl());
smsService.send("java");
```

The code prints:

```plain
before method send
send message:java
after method send
```

### 3.2. CGLIB Dynamic Proxies

#### 3.2.1. Overview

**One limitation of JDK dynamic proxies is that they proxy interfaces.**

**CGLIB can proxy classes directly.**

[CGLIB](https://github.com/cglib/cglib) (_Code Generation Library_) is a bytecode generation library based on [ASM](http://www.baeldung.com/java-asm). It can modify and generate bytecode at runtime and creates proxies through subclassing. Many open-source frameworks use CGLIB. For example, Spring AOP traditionally uses JDK dynamic proxies when the target implements an interface and CGLIB otherwise.

**The `MethodInterceptor` interface and `Enhancer` class are central to CGLIB proxies.**

Implement `MethodInterceptor` and override `intercept` to intercept and enhance methods on the proxied class.

```java
public interface MethodInterceptor
extends Callback{
    // Intercept a method on the proxied class.
    public Object intercept(Object obj, java.lang.reflect.Method method, Object[] args, MethodProxy proxy) throws Throwable;
}

```

1. **obj:** The proxy object.
2. **method:** The intercepted method.
3. **args:** The method arguments.
4. **proxy:** Used to invoke the original method.

Use `Enhancer` to create a proxy. When a method is called on it, CGLIB invokes `MethodInterceptor.intercept()`.

#### 3.2.2. Steps to Create a CGLIB Proxy

1. Define a class.
2. Implement `MethodInterceptor` and override `intercept`, similar to `InvocationHandler.invoke()` in JDK dynamic proxies.
3. Create the proxy with `Enhancer.create()`.

#### 3.2.3. Example

Unlike JDK dynamic proxies, CGLIB requires an additional dependency. Add it to your project to use the library.

```xml
<dependency>
  <groupId>cglib</groupId>
  <artifactId>cglib</artifactId>
  <version>3.3.0</version>
</dependency>
```

**1. Define a class that sends messages using Alibaba Cloud.**

```java
package github.javaguide.dynamicProxy.cglibDynamicProxy;

public class AliSmsService {
    public String send(String message) {
        System.out.println("send message:" + message);
        return message;
    }
}
```

**2. Implement `MethodInterceptor`.**

```java
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;

import java.lang.reflect.Method;

/**
 * Custom MethodInterceptor.
 */
public class DebugMethodInterceptor implements MethodInterceptor {


    /**
     * @param o           the proxy object, not the original object; calling method.invoke(o, args) would recurse
     * @param method      the intercepted method
     * @param args        the method arguments
     * @param methodProxy a method invocation mechanism that avoids reflection overhead
     */
    @Override
    public Object intercept(Object o, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
        // Add custom behavior before calling the method.
        System.out.println("before method " + method.getName());
        Object object = methodProxy.invokeSuper(o, args);
        // Add custom behavior after calling the method.
        System.out.println("after method " + method.getName());
        return object;
    }

}
```

**3. Create a proxy factory.**

```java
import net.sf.cglib.proxy.Enhancer;

public class CglibProxyFactory {

    public static Object getProxy(Class<?> clazz) {
        // Create the proxy enhancer.
        Enhancer enhancer = new Enhancer();
        // Set the class loader.
        enhancer.setClassLoader(clazz.getClassLoader());
        // Set the class to proxy.
        enhancer.setSuperclass(clazz);
        // Set the method interceptor.
        enhancer.setCallback(new DebugMethodInterceptor());
        // Create the proxy.
        return enhancer.create();
    }
}
```

**4. Use the proxy.**

```java
AliSmsService aliSmsService = (AliSmsService) CglibProxyFactory.getProxy(AliSmsService.class);
aliSmsService.send("java");
```

The code prints:

```bash
before method send
send message:java
after method send
```

### 3.3. Comparing JDK and CGLIB Dynamic Proxies

1. JDK dynamic proxies are built into Java and proxy interfaces by generating an implementation at runtime. CGLIB is a third-party library and doesn't require an interface; it creates a subclass of the target. Because it uses inheritance, it can't proxy `final` classes or `final` and `private` methods.
2. In most cases, JDK dynamic proxies perform better, and this advantage has grown with newer JDK versions.

## 4. Static vs. Dynamic Proxies

The main differences are **when the proxy is created, implementation flexibility, and maintenance cost**.

| Comparison            | Static proxy                                                                                       | Dynamic proxy                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| When it's created     | At compile time as a fixed `.class` file                                                           | At runtime, when proxy bytecode is generated and loaded into the JVM                              |
| Implementation        | Write the proxy class manually, typically using composition and delegation                         | No concrete proxy class is needed; a handler or interceptor holds the enhancement logic           |
| Interface requirement | Optional; interface-based proxies usually share an interface with the target                       | JDK proxies implement interfaces; CGLIB and similar libraries create subclasses                   |
| Code and maintenance  | More code and higher maintenance cost; both target and proxy must change when an interface changes | Less code because enhancement logic can be reused; interface changes don't affect the proxy logic |
| Main advantage        | Simple implementation and straightforward behavior, with no extra framework dependency             | Flexible and reusable, reducing duplication for more complex cases                                |
| Typical uses          | Simple decorators and a few fixed classes                                                          | Spring AOP, RPC frameworks such as Dubbo, and ORM frameworks                                      |

## 5. Summary

This article covered static and dynamic proxies, including examples and comparisons of static proxies, JDK dynamic proxies, and CGLIB proxies.

Find the source code used in this article in the [guide-rpc-framework-learning repository](https://github.com/Snailclimb/guide-rpc-framework-learning/tree/master/src/main/java/github/javaguide/proxy).

<!-- @include: @article-footer.snippet.md -->
