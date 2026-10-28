---
title: Design Patterns in Java I/O
description: An in-depth look at design patterns in Java I/O, including Decorator in BufferedInputStream, Adapter in InputStreamReader, and Template Method in InputStream.
category: Java
tag:
  - Java IO
  - Java Fundamentals
head:
  - - meta
    - name: keywords
      content: Java I/O design patterns,Decorator pattern,Adapter pattern,Template Method pattern,FilterInputStream,I/O stream design
---

This article looks at several design patterns used in Java I/O.

## Decorator Pattern

The **Decorator pattern** extends an object's behavior without changing the original object.

The Decorator pattern uses composition instead of inheritance to extend a class. This is especially useful when the inheritance hierarchy is complex, as it is in Java I/O.

For byte streams, `FilterInputStream` and `FilterOutputStream` are the core decorators. They add behavior to `InputStream` and `OutputStream` subclasses, respectively.

Common classes such as `BufferedInputStream` and `DataInputStream` extend `FilterInputStream`; `BufferedOutputStream` and `DataOutputStream` extend `FilterOutputStream`.

For example, you can use `BufferedInputStream` to add buffering to a `FileInputStream`.

The `BufferedInputStream` constructors look like this:

```java
public BufferedInputStream(InputStream in) {
    this(in, DEFAULT_BUFFER_SIZE);
}

public BufferedInputStream(InputStream in, int size) {
    super(in);
    if (size <= 0) {
        throw new IllegalArgumentException("Buffer size <= 0");
    }
    buf = new byte[size];
}
```

One of the `BufferedInputStream` constructor arguments is an `InputStream`.

Example using `BufferedInputStream`:

```java
try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream("input.txt"))) {
    int content;
    long skip = bis.skip(2);
    while ((content = bis.read()) != -1) {
        System.out.print((char) content);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

You might wonder: **Why not create a separate `BufferedFileInputStream` class?**

```java
BufferedFileInputStream bfis = new BufferedFileInputStream("input.txt");
```

That would be reasonable if there were only a few `InputStream` subclasses. But there are many, and their inheritance hierarchy is already complex. Creating a separate buffered stream for every subclass would be cumbersome.

You can also layer `ZipInputStream` and `ZipOutputStream` on top of `BufferedInputStream` and `BufferedOutputStream`:

```java
BufferedInputStream bis = new BufferedInputStream(new FileInputStream(fileName));
ZipInputStream zis = new ZipInputStream(bis);

BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(fileName));
ZipOutputStream zipOut = new ZipOutputStream(bos);
```

`ZipInputStream` and `ZipOutputStream` extend `InflaterInputStream` and `DeflaterOutputStream`, respectively.

```java
public
class InflaterInputStream extends FilterInputStream {
}

public
class DeflaterOutputStream extends FilterOutputStream {
}

```

An important feature of the Decorator pattern is that you can nest multiple decorators around an object.

To do this, decorator classes and the objects they decorate must share an abstract superclass or interface. The I/O decorators above share `InputStream` or `OutputStream` with the objects they wrap.

For character streams, `BufferedReader` adds buffering to `Reader` subclasses, and `BufferedWriter` does the same for `Writer` subclasses.

```java
BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(fileName), "UTF-8"));
```

Java I/O uses the Decorator pattern in many places. You do not need to memorize every example; once you understand the pattern, you will recognize it in the APIs.

## Adapter Pattern

The **Adapter pattern** lets classes with incompatible interfaces work together, much like a power adapter.

In this pattern, the object or class being adapted is the **adaptee**, and the object or class that adapts it is the **adapter**. There are two forms: a class adapter, implemented with inheritance, and an object adapter, implemented with composition.

Character streams and byte streams have different interfaces. Java I/O uses the object form of the Adapter pattern to connect them. An adapter lets a byte stream be used as a character stream, so characters can be read from or written to the underlying byte stream.

`InputStreamReader` and `OutputStreamWriter` are adapters that bridge byte and character streams. `InputStreamReader` uses `StreamDecoder` to decode bytes into characters, while `OutputStreamWriter` uses `StreamEncoder` to encode characters into bytes.

`InputStream` and `OutputStream` subclasses are the adaptees; `InputStreamReader` and `OutputStreamWriter` are the adapters.

```java
// InputStreamReader is the adapter; FileInputStream is the adaptee.
InputStreamReader isr = new InputStreamReader(new FileInputStream(fileName), "UTF-8");
// BufferedReader adds behavior to InputStreamReader (Decorator pattern).
BufferedReader bufferedReader = new BufferedReader(isr);
```

Part of the `java.io.InputStreamReader` source:

```java
public class InputStreamReader extends Reader {
    // Decoder used to convert bytes to characters.
    private final StreamDecoder sd;
    public InputStreamReader(InputStream in) {
        super(in);
        try {
            // Get the StreamDecoder instance.
            sd = StreamDecoder.forInputStreamReader(in, this, (String)null);
        } catch (UnsupportedEncodingException e) {
            throw new Error(e);
        }
    }
    // Delegate the read operation to StreamDecoder.
    public int read() throws IOException {
        return sd.read();
    }
}
```

Part of the `java.io.OutputStreamWriter` source:

```java
public class OutputStreamWriter extends Writer {
    // Encoder used to convert characters to bytes.
    private final StreamEncoder se;
    public OutputStreamWriter(OutputStream out) {
        super(out);
        try {
           // Get the StreamEncoder instance.
            se = StreamEncoder.forOutputStreamWriter(out, this, (String)null);
        } catch (UnsupportedEncodingException e) {
            throw new Error(e);
        }
    }
    // Delegate the write operation to StreamEncoder.
    public void write(int c) throws IOException {
        se.write(c);
    }
}
```

**How does the Adapter pattern differ from the Decorator pattern?**

The **Decorator pattern** focuses on dynamically adding behavior to an object. A decorator shares an abstract class or interface with the object it wraps, and multiple decorators can be nested.

The **Adapter pattern** focuses on making classes with incompatible interfaces work together. When you call an adapter method, it delegates to the adaptee or a related class; this is transparent to the caller. For example, `InputStreamReader` and `OutputStreamWriter` adapt byte streams to character streams and perform the necessary decoding or encoding.

```java
Reader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
Writer writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8);
```

An adapter and its adaptee do not need to share an abstract class or interface.

`FutureTask` also uses the Adapter pattern. The `RunnableAdapter` nested in `Executors` adapts a `Runnable` to a `Callable`.

One `FutureTask` constructor accepts a `Runnable`:

```java
public FutureTask(Runnable runnable, V result) {
    // Call Executors.callable().
    this.callable = Executors.callable(runnable, result);
    this.state = NEW;
}
```

The corresponding method and adapter in `Executors`:

```java
// This calls the RunnableAdapter constructor.
public static <T> Callable<T> callable(Runnable task, T result) {
    if (task == null)
        throw new NullPointerException();
    return new RunnableAdapter<T>(task, result);
}
// Adapter.
static final class RunnableAdapter<T> implements Callable<T> {
    final Runnable task;
    final T result;
    RunnableAdapter(Runnable task, T result) {
        this.task = task;
        this.result = result;
    }
    public T call() {
        task.run();
        return result;
    }
}
```

## Factory Pattern

The Factory pattern creates objects. NIO uses it in several places: `Files.newInputStream()` creates an `InputStream` (static factory), `Paths.get()` creates a `Path` (static factory), and `ZipFileSystem.getPath()` creates a `Path` (simple factory). `ZipFileSystem` is an internal implementation in the `sun.nio` package.

```java
InputStream is = Files.newInputStream(Paths.get(generatorLogoPath))
```

## Observer Pattern

NIO's file and directory watching service uses the Observer pattern.

The NIO file-watching service is based on the `WatchService` and `Watchable` interfaces. `WatchService` is the observer, and `Watchable` is the subject.

The `Watchable` interface defines `register()`, which registers an object with a `WatchService` and specifies the events to monitor.

```java
public interface Path
    extends Comparable<Path>, Iterable<Path>, Watchable{
}

public interface Watchable {
    WatchKey register(WatchService watcher,
                      WatchEvent.Kind<?>[] events,
                      WatchEvent.Modifier... modifiers)
        throws IOException;
}
```

`WatchService` monitors changes to directories. A single `WatchService` can monitor multiple directories.

```java
// Create a WatchService.
WatchService watchService = FileSystems.getDefault().newWatchService();

// Get the path of the directory to watch.
Path path = Paths.get("workingDirectory");
// Register the path with the WatchService.
WatchKey watchKey = path.register(
watchService, StandardWatchEventKinds...);
```

The `events` argument of `Path.register()` is a varargs parameter, so you can monitor multiple event types at once.

```java
WatchKey register(WatchService watcher,
                  WatchEvent.Kind<?>... events)
    throws IOException;
```

Three commonly used event types are:

- `StandardWatchEventKinds.ENTRY_CREATE`: A file was created.
- `StandardWatchEventKinds.ENTRY_DELETE`: A file was deleted.
- `StandardWatchEventKinds.ENTRY_MODIFY`: A file was modified.

The `register()` method returns a `WatchKey`. Use it to retrieve event details, such as whether a file was created, deleted, or modified, and the file's name.

```java
WatchKey key;
while ((key = watchService.take()) != null) {
    for (WatchEvent<?> event : key.pollEvents()) {
      // Use WatchEvent methods to inspect or report the event context.
    }
    key.reset();
}
```

The `WatchService` implementation depends on the file system and its provider. It may use native file-event mechanisms or fall back to periodic polling. The following is a simplified polling implementation.

```java
class PollingWatchService
    extends AbstractWatchService
{
    // A daemon thread polls for file changes.
    private final ScheduledExecutorService scheduledExecutor;

    PollingWatchService() {
        scheduledExecutor = Executors
            .newSingleThreadScheduledExecutor(new ThreadFactory() {
                 @Override
                 public Thread newThread(Runnable r) {
                     Thread t = new Thread(r);
                     t.setDaemon(true);
                     return t;
                 }});
    }

  void enable(Set<? extends WatchEvent.Kind<?>> events, long period) {
    synchronized (this) {
      // Update the events to monitor.
      this.events = events;

        // Start periodic polling.
      Runnable thunk = new Runnable() { public void run() { poll(); }};
      this.poller = scheduledExecutor
        .scheduleAtFixedRate(thunk, period, period, TimeUnit.SECONDS);
    }
  }
}
```

## References

- Patterns in Java APIs：<http://cecs.wright.edu/~tkprasad/courses/ceg860/paper/node26.html>
- Decorator Pattern: Learning from the Java I/O Library Source Code: <https://time.geekbang.org/column/article/204845>
- What Is the sun.nio Package, and Is It Java Code? — RednaxelaFX: <https://www.zhihu.com/question/29237781/answer/43653953>

<!-- @include: @article-footer.snippet.md -->
