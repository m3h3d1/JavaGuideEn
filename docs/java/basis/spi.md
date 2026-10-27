---
title: Java SPI Explained
description: Learn the Java SPI mechanism, ServiceLoader, SPI use in JDBC, Dubbo, and Spring, and how SPI differs from API.
category: Java
tag:
  - Java Fundamentals
head:
  - - meta
    - name: keywords
      content: Java SPI,SPI mechanism,ServiceLoader,service discovery,plugins,JDBC driver loading,Dubbo extensions
---

> Contributed by [Kingshion](https://github.com/jjx0708). Contributions to JavaGuide are welcome. See the [contribution guide](https://javaguide.cn/javaguide/contribution-guideline.html) for details.

Object-oriented design encourages modules to depend on interfaces rather than concrete implementations. This reduces coupling, follows the dependency inversion principle, and supports the open-closed principle: open for extension, closed for modification. If code depends directly on an implementation, replacing it requires code changes. SPI addresses this with a service discovery mechanism that lets you specify implementations outside the program. This is similar to inversion of control (IoC), which moves component assembly outside the component itself.

SPI also addresses a limitation of Java's parent delegation model. The [parent delegation model](https://javaguide.cn/java/jvm/classloader.html) helps keep core libraries secure and consistent, but makes it difficult for core or extension libraries to load application classes, which are often provided by third parties. SPI lets core and extension libraries define service interfaces while third parties provide and deploy implementations. The service loader discovers and loads those implementations at runtime. For example, JDBC 4.0 and later use SPI to discover database drivers automatically; developers only need to put the driver JAR on the classpath instead of explicitly loading the driver with `Class.forName()`.

## Introduction to SPI

### What Is SPI?

SPI stands for **Service Provider Interface**. It's an interface intended for service providers or developers who extend a framework.

SPI separates the service interface from its implementation and decouples callers from providers. This improves extensibility and maintainability: you can replace or update a provider without changing the caller.

Many frameworks use Java SPI, including Spring, database driver loading, logging APIs, and Dubbo extensions.

<img src="https://oss.javaguide.cn/github/javaguide/java/basis/spi/22e1830e0b0e4115a882751f6c417857tplv-k3u1fbpfcp-zoom-1.jpeg" style="zoom:50%;" />

### How Do SPI and API Differ?

**What's the difference between SPI and API?**

API stands for **Application Programming Interface**. Both SPI and API are interfaces in a broad sense and can be easy to confuse. The diagram below illustrates the difference:

![SPI VS API](https://oss.javaguide.cn/github/javaguide/java/basis/spi-vs-api.png)

Modules usually communicate through interfaces, so an interface sits between the service caller and the service implementation, also called the provider.

- If the implementation side provides both the interface and implementation, the caller uses the interface to access its capabilities. This is an **API**. Both the interface and implementation belong to the implementation provider, and callers don't need to know the implementation details.
- If the interface belongs to the caller, it's an **SPI**. The caller defines the interface, and different vendors implement it to provide the service.

For example, suppose company H designs a chip and needs to manufacture it at scale. If H defines the manufacturing standards, different chip manufacturers (service providers) can build their own versions that follow those standards and provide the same expected result.

## A Practical Example

SLF4J (Simple Logging Facade for Java) is a logging facade, or interface. It has several implementations, including Logback, Log4j, and Log4j2. You can switch implementations without changing project code; just update the Maven dependencies.

![](https://oss.javaguide.cn/github/javaguide/java/basis/spi/image-20220723213306039-165858318917813.png)

This is enabled by SPI. Let's build a simple logging framework to see how it works.

### Service Provider Interface

Create a Java project named `service-provider-interface` with the following structure. Use a plain Java project rather than a Maven project for this example; Maven introduces additional build configuration and can cause issues if you don't have a private repository.

```plain
│  service-provider-interface.iml
│
├─.idea
│  │  .gitignore
│  │  misc.xml
│  │  modules.xml
│  └─ workspace.xml
│
└─src
    └─edu
        └─jiangxuan
            └─up
                └─spi
                        Logger.java
                        LoggerService.java
                        Main.class
```

Create the `Logger` interface. This is the SPI, or service provider interface, that providers will implement.

```java
package edu.jiangxuan.up.spi;

public interface Logger {
    void info(String msg);
    void debug(String msg);
}
```

Next, create the `LoggerService` class, which provides functionality to service consumers (callers). This class is key to the Java SPI mechanism; continue reading if its purpose isn't clear yet.

```java
package edu.jiangxuan.up.spi;

import java.util.ArrayList;
import java.util.List;
import java.util.ServiceLoader;

public class LoggerService {
    private static final LoggerService SERVICE = new LoggerService();

    private final Logger logger;

    private final List<Logger> loggerList;

    private LoggerService() {
        ServiceLoader<Logger> loader = ServiceLoader.load(Logger.class);
        List<Logger> list = new ArrayList<>();
        for (Logger log : loader) {
            list.add(log);
        }
        // loggerList contains all service providers.
        loggerList = list;
        if (!list.isEmpty()) {
            // Use only the first Logger.
            logger = list.get(0);
        } else {
            logger = null;
        }
    }

    public static LoggerService getService() {
        return SERVICE;
    }

    public void info(String msg) {
        if (logger == null) {
            System.out.println("No Logger provider found for info.");
        } else {
            logger.info(msg);
        }
    }

    public void debug(String msg) {
        if (loggerList.isEmpty()) {
            System.out.println("No Logger provider found for debug.");
        }
        loggerList.forEach(log -> log.debug(msg));
    }
}
```

Create a `Main` class (the service consumer) and run it to see the result.

```java
package org.spi.service;

public class Main {
    public static void main(String[] args) {
        LoggerService service = LoggerService.getService();

        service.info("Hello SPI");
        service.debug("Hello SPI");
    }
}
```

Output:

> No Logger provider found for info.
> No Logger provider found for debug.

At this point, we have an interface but no implementation of `Logger`, so the expected log messages aren't printed.

Package the project as a JAR using a command or your IDE.

### Service Provider

Next, create a project that implements the `Logger` interface.

Create a project named `service-provider` with the following structure:

```plain
│  service-provider.iml
│
├─.idea
│  │  .gitignore
│  │  misc.xml
│  │  modules.xml
│  └─ workspace.xml
│
├─lib
│      service-provider-interface.jar
|
└─src
    ├─edu
    │  └─jiangxuan
    │      └─up
    │          └─spi
    │              └─service
    │                      Logback.java
    │
    └─META-INF
        └─services
                edu.jiangxuan.up.spi.Logger

```

Create the `Logback` class:

```java
package edu.jiangxuan.up.spi.service;

import edu.jiangxuan.up.spi.Logger;

public class Logback implements Logger {
    @Override
    public void info(String s) {
        System.out.println("Logback info: " + s);
    }

    @Override
    public void debug(String s) {
        System.out.println("Logback debug: " + s);
    }
}

```

Add the `service-provider-interface` JAR to the project.

Create a `lib` directory, copy the JAR into it, and add it to the project.

![](https://oss.javaguide.cn/github/javaguide/java/basis/spi/523d5e25198444d3b112baf68ce49daetplv-k3u1fbpfcp-watermark.png)

Then click **OK**.

![](https://oss.javaguide.cn/github/javaguide/java/basis/spi/f4ba0aa71e9b4d509b9159892a220850tplv-k3u1fbpfcp-watermark.png)

You can now import classes and methods from the JAR, just as you would use a JDK library.

Implement `Logger`, then create a `META-INF/services` directory under `src`. Inside it, create a file named `edu.jiangxuan.up.spi.Logger` (the SPI's fully qualified name). Put `edu.jiangxuan.up.spi.service.Logback` in the file (the provider's fully qualified name: package plus class name).

**This is the convention used by the JDK SPI mechanism and `ServiceLoader`.**

Here's a brief explanation: `ServiceLoader.load()` creates a service loader. Iterating over it locates and instantiates providers as needed. Calling `stream()` returns a stream of `ServiceLoader.Provider` objects; you can inspect a provider's type with `type()` and create its instance with `Provider.get()`. `ServiceLoader` caches providers it has loaded. Classpath providers are declared in `META-INF/services`; named modules in Java 9 and later can declare services with `uses` and `provides ... with ...` in their module descriptors.

The configuration file must be named after the interface's fully qualified name and contain the fully qualified names of its implementations. It can list multiple implementations, one per line, which are loaded one at a time during iteration.

Package the `service-provider` project as a JAR. This JAR contains the provider implementation. Adding a Maven dependency works similarly, but since this JAR isn't published to a public Maven repository, add it to the project manually.

### See It in Action

To make the result clearer, create a separate test project named `java-spi-test`.

Add the JAR containing the `Logger` interface, then add the provider implementation JAR.

![](https://oss.javaguide.cn/github/javaguide/java/basis/spi/image-20220723215812708-165858469599214.png)

Create a `main` method to test it:

```java
package edu.jiangxuan.up.service;

import edu.jiangxuan.up.spi.LoggerService;

public class TestJavaSPI {
    public static void main(String[] args) {
        LoggerService loggerService = LoggerService.getService();
        loggerService.info("Hello");
        loggerService.debug("Testing Java SPI");
    }
}
```

Output:

> Logback info: Hello
> Logback debug: Testing Java SPI

This shows that the implementation from the JAR is working.

If you don't add the provider JAR, the program prints:

> No Logger provider found for info.
> No Logger provider found for debug.

SPI keeps the service (`LoggerService`) and provider loosely coupled. To switch implementations, change the provider in the `service-provider` project or replace its JAR. A project can also include multiple providers. This is similar to how SLF4J works.

If requirements change—for example, to send logs to a message queue—you don't need to change the Logback implementation. Add another provider in the project or bring in a new provider JAR, then select the implementation in `LoggerService`.

Next, let's look more closely at **`ServiceLoader`**, the core of Java SPI.

## ServiceLoader

### How ServiceLoader Works

> The following is the JDK 8 implementation of `ServiceLoader`. Java 9 and later added the module layer, `stream()`, `findFirst()`, and provider methods, so the current source is different.

Java SPI relies on `ServiceLoader`. Here's how it works:

`ServiceLoader` is a utility class in the JDK's `java.util` package.

```plain
A facility to load implementations of a service.
```

The JDK describes it as **a facility to load implementations of a service.**

`ServiceLoader` is a `final` class, so it can't be subclassed. It implements `Iterable` so you can retrieve service implementations by iterating over it.

```java
public final class ServiceLoader<S> implements Iterable<S>{ xxx...}
```

Notice this familiar constant:

`private static final String PREFIX = "META-INF/services/";`

Here's the `load` method, which has two overloads:

```java
public static <S> ServiceLoader<S> load(Class<S> service) {
    ClassLoader cl = Thread.currentThread().getContextClassLoader();
    return ServiceLoader.load(service, cl);
}

public static <S> ServiceLoader<S> load(Class<S> service,
                                        ClassLoader loader) {
    return new ServiceLoader<>(service, loader);
}

private ServiceLoader(Class<S> svc, ClassLoader cl) {
    service = Objects.requireNonNull(svc, "Service interface cannot be null");
    loader = (cl == null) ? ClassLoader.getSystemClassLoader() : cl;
    acc = (System.getSecurityManager() != null) ? AccessController.getContext() : null;
    reload();
}

public void reload() {
    providers.clear();
    lookupIterator = new LazyIterator(service, loader);
}
```

The mechanism for loading third-party classes is in `ClassLoader cl = Thread.currentThread().getContextClassLoader();`. The `cl` is the **thread context class loader**, which is held by each thread. The JDK allows applications and containers, such as Web application servers, to set it so core libraries can load application classes.

By default, the thread context class loader is the application class loader, which loads classes from the classpath. When a core library needs to load an application-provided class, it can use the thread context class loader. This lets core library code loaded by the bootstrap class loader load and use classes loaded by the application class loader.

In this implementation, `reload()` creates a `LazyIterator`. Let's continue.

Because `ServiceLoader` implements `Iterable`, it can be iterated over. When `iterator()` is called, it first checks the provider cache. If there are no cached providers, it looks for implementations through `LazyIterator`.

```java

public Iterator<S> iterator() {
    return new Iterator<S>() {

        Iterator<Map.Entry<String, S>> knownProviders
                = providers.entrySet().iterator();

        public boolean hasNext() {
            if (knownProviders.hasNext())
                return true;
            return lookupIterator.hasNext(); // Calls LazyIterator.
        }

        public S next() {
            if (knownProviders.hasNext())
                return knownProviders.next().getValue();
            return lookupIterator.next(); // Calls LazyIterator.
        }

        public void remove() {
            throw new UnsupportedOperationException();
        }

    };
}
```

Here's how `LazyIterator` works:

```java

public boolean hasNext() {
    if (acc == null) {
        return hasNextService();
    } else {
        PrivilegedAction<Boolean> action = new PrivilegedAction<Boolean>() {
            public Boolean run() {
                return hasNextService();
            }
        };
        return AccessController.doPrivileged(action, acc);
    }
}

private boolean hasNextService() {
    if (nextName != null) {
        return true;
    }
    if (configs == null) {
        try {
            // Find the configuration file using PREFIX (META-INF/services/) and the service name.
            String fullName = PREFIX + service.getName();
            if (loader == null)
                configs = ClassLoader.getSystemResources(fullName);
            else
                configs = loader.getResources(fullName);
        } catch (IOException x) {
            fail(service, "Error locating configuration files", x);
        }
    }
    while ((pending == null) || !pending.hasNext()) {
        if (!configs.hasMoreElements()) {
            return false;
        }
        pending = parse(service, configs.nextElement());
    }
    nextName = pending.next();
    return true;
}


public S next() {
    if (acc == null) {
        return nextService();
    } else {
        PrivilegedAction<S> action = new PrivilegedAction<S>() {
            public S run() {
                return nextService();
            }
        };
        return AccessController.doPrivileged(action, acc);
    }
}

private S nextService() {
    if (!hasNextService())
        throw new NoSuchElementException();
    String cn = nextName;
    nextName = null;
    Class<?> c = null;
    try {
        c = Class.forName(cn, false, loader);
    } catch (ClassNotFoundException x) {
        fail(service,
                "Provider " + cn + " not found");
    }
    if (!service.isAssignableFrom(c)) {
        fail(service,
                "Provider " + cn + " not a subtype");
    }
    try {
        S p = service.cast(c.newInstance());
        providers.put(cn, p);
        return p;
    } catch (Throwable x) {
        fail(service,
                "Provider " + cn + " could not be instantiated",
                x);
    }
    throw new Error();          // This cannot happen
}
```

This may look complicated, so here's a simplified `ServiceLoader` model that demonstrates reading provider names from classpath configuration files and creating instances. It doesn't implement all JDK behavior, such as lazy loading, deduplication, error handling, or module providers.

### Implementing a Simple ServiceLoader

Here's the code:

```java
package edu.jiangxuan.up.service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Constructor;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

public class MyServiceLoader<S> {

    // The Class object for the service interface.
    private final Class<S> service;

    // The provider instances; there can be more than one.
    private final List<S> providers = new ArrayList<>();

    // The class loader.
    private final ClassLoader classLoader;

    // Public entry point for loading providers.
    public static <S> MyServiceLoader<S> load(Class<S> service) {
        return new MyServiceLoader<>(service);
    }

    // Keep the constructor private.
    private MyServiceLoader(Class<S> service) {
        this.service = service;
        this.classLoader = Thread.currentThread().getContextClassLoader();
        doLoad();
    }

    // Load the provider implementations.
    private void doLoad() {
        try {
            // Read the META-INF/services file from each JAR. The filename is the
            // service interface name, and its contents are provider class names.
            Enumeration<URL> urls = classLoader.getResources("META-INF/services/" + service.getName());
            // Iterate over the configuration files.
            while (urls.hasMoreElements()) {
                // Get the current file.
                URL url = urls.nextElement();
                System.out.println("File = " + url.getPath());
                // Open a connection.
                URLConnection urlConnection = url.openConnection();
                urlConnection.setUseCaches(false);
                // Get the file's input stream.
                InputStream inputStream = urlConnection.getInputStream();
                // Wrap the stream in a buffered reader.
                BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
                // Read a provider's fully qualified class name.
                String className = bufferedReader.readLine();

                while (className != null) {
                    // Load the provider class using reflection.
                    Class<?> clazz = Class.forName(className, false, classLoader);
                    // Create an instance if the class implements the service interface.
                    if (service.isAssignableFrom(clazz)) {
                        Constructor<? extends S> constructor = (Constructor<? extends S>) clazz.getConstructor();
                        S instance = constructor.newInstance();
                        // Add the instance to the provider list.
                        providers.add(instance);
                    }
                    // Read the next provider class name. Each provider goes on a new line.
                    className = bufferedReader.readLine();
                }
            }
        } catch (Exception e) {
            System.out.println("Error reading the configuration file.");
        }
    }

    // Return the implementations of the SPI.
    public List<S> getProviders() {
        return providers;
    }
}
```

The code comments explain the key details. The main steps are:

1. Use the URL utilities to find the corresponding file under `/META-INF/services` in each JAR.
2. Use the filename to identify the SPI interface.
3. Read the provider class names from the file using an `InputStream`.
4. Check that each class implements the SPI interface, then use reflection to create an instance.
5. Add each instance to the provider list.

## Summary

SPI dynamically locates and creates service providers. Classpath providers are declared in `META-INF/services/` configuration files. Providers in named modules are declared with `provides ... with ...` in the module descriptor.

SPI is used by many frameworks. Spring uses a similar approach, and Dubbo provides its own SPI extension mechanism. Their implementations differ from the JDK's, but the general idea is similar. Understanding JDK SPI can help you understand these frameworks.

SPI can make interface design more flexible, but it also has drawbacks:

1. `ServiceLoader` loads providers lazily. If the caller iterates over all providers to choose one, this can add overhead.
2. A `ServiceLoader` instance isn't guaranteed to be thread-safe. Callers must synchronize if they share one across threads. Concurrent calls to `load` on separate `ServiceLoader` instances don't necessarily cause conflicts.

<!-- @include: @article-footer.snippet.md -->
