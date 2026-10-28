---
title: Java NIO Basics
description: An overview of Java NIO, including Channel, Buffer, and Selector, non-blocking I/O, zero-copy techniques, and comparisons with traditional I/O.
category: Java
tag:
  - Java IO
  - Java Fundamentals
head:
  - - meta
    - name: keywords
      content: Java NIO,Channel,Buffer,Selector,non-blocking I/O,I/O multiplexing,zero-copy,NIO components
---

Before studying NIO, learn the basics of computer I/O models. See [Java I/O Models Explained](https://javaguide.cn/java/io/io-model.html) if you are not familiar with them.

## Introduction to NIO

In the traditional Java I/O model (BIO), I/O operations block the calling thread until they complete. This can create a performance bottleneck when handling many concurrent connections, since each connection needs a thread and creating and switching threads has a cost.

To address this, Java 1.4 introduced **NIO** (“New I/O,” also known as non-blocking I/O). NIO provides non-blocking, buffer-oriented, channel-based I/O in the standard Java library. A small number of threads can handle multiple connections, improving I/O efficiency and concurrency.

The diagram below compares how BIO, NIO, and AIO handle client requests. For more about AIO, see [Java I/O Models Explained](https://javaguide.cn/java/io/io-model.html); a basic understanding is enough here.

![BIO, NIO, and AIO compared](https://oss.javaguide.cn/github/javaguide/java/nio/bio-aio-nio.png)

⚠️ Note: Using NIO does not automatically mean better performance. Its advantages are most noticeable in high-concurrency, high-latency network environments. With few connections, low concurrency, or fast network transfers, NIO may not outperform traditional BIO.

## Core NIO Components

NIO has three main components:

- **Buffer**: NIO reads and writes data through buffers. A read fills a buffer with data from a channel; a write sends buffered data to a channel.
- **Channel**: Represents an open connection to an entity such as a file or socket. Depending on its interface, it may support reading, writing, or both.
- **Selector**: Lets one thread monitor readiness events on multiple selectable channels (`SelectableChannel`), enabling I/O multiplexing. A selector reports ready events; it does not assign worker threads.

The diagram below shows how these components relate. The details will become clearer in the sections that follow.

![How Buffer, Channel, and Selector work together](https://oss.javaguide.cn/github/javaguide/java/nio/channel-buffer-selector.png)

The following sections explain each component in more detail.

### Buffer

Traditional BIO reads and writes data as streams: byte streams or character streams.

In the Java 1.4 NIO library, all data is processed through buffers. This is a key difference from BIO and is somewhat similar to BIO's buffered streams. NIO reads data directly into a buffer and writes data from a buffer.

The diagram shows the `Buffer` subclasses. The most common is `ByteBuffer`, which stores and manipulates byte data.

![Buffer subclasses](https://oss.javaguide.cn/github/javaguide/java/nio/buffer-subclasses.png)

You can think of a `Buffer` as a finite, linear sequence of values of the same type. Some buffers are backed by arrays, but implementations such as direct buffers do not necessarily expose an accessible backing array.

To understand buffers, start with the four fields defined in `Buffer`:

```java
public abstract class Buffer {
    // Invariants: mark <= position <= limit <= capacity
    private int mark = -1;
    private int position = 0;
    private int limit;
    private int capacity;
}
```

The fields mean the following:

1. **Capacity** (`capacity`): The maximum amount of data the buffer can hold. It is set when the buffer is created and cannot be changed.
2. **Limit** (`limit`): The boundary for reading or writing. In write mode, it is the maximum amount that can be written and usually equals `capacity`; you can change it with `limit(int newLimit)`. In read mode, it is the amount of data currently in the buffer.
3. **Position** (`position`): The index of the next value to read or write. Calling `flip()` to switch from writing to reading resets `position` to zero.
4. **Mark** (`mark`): An optional position to which the buffer can return directly.

When `mark` is set, these fields satisfy **0 <= mark <= position <= limit <= capacity**. If no mark has been set, calling `reset()` throws `InvalidMarkException`.

Buffers have read and write modes. A new buffer starts in write mode; call `flip()` to switch to read mode. Call `clear()` or `compact()` to switch back to write mode.

![Relationship between position, limit, and capacity](https://oss.javaguide.cn/github/javaguide/java/nio/JavaNIOBuffer.png)

![Relationship between position, limit, and capacity](https://oss.javaguide.cn/github/javaguide/java/nio/NIOBufferClassAttributes.png)

You cannot instantiate a `Buffer` with `new`; use a static factory method instead.

The following examples use `ByteBuffer`:

```java
// Allocate a heap buffer.
public static ByteBuffer allocate(int capacity);
// Allocate a direct buffer.
public static ByteBuffer allocateDirect(int capacity);
```

The two core `Buffer` operations are:

1. `get`: Read data from the buffer.
2. `put`: Write data to the buffer.

Other important methods include:

- `flip`: Switches the buffer from write mode to read mode by setting `limit` to the current `position` and `position` to 0.
- `clear`: Switches the buffer from read mode to write mode by setting `position` to 0 and `limit` to `capacity`. It does not erase the underlying data.
- ……

The following example shows how a buffer's state changes:

```java
import java.nio.*;

public class CharBufferDemo {
    public static void main(String[] args) {
        // Allocate a CharBuffer with a capacity of 8.
        CharBuffer buffer = CharBuffer.allocate(8);
        System.out.println("Initial state:");
        printState(buffer);

        // Write three characters to the buffer.
        buffer.put('a').put('b').put('c');
        System.out.println("State after writing three characters:");
        printState(buffer);

        // Prepare to read: flip() sets position to 0 and limit to 3.
        buffer.flip();
        System.out.println("State after calling flip():");
        printState(buffer);

        // Read the characters.
        while (buffer.hasRemaining()) {
            System.out.print(buffer.get());
        }

        // Call clear(): position becomes 0 and limit becomes capacity.
        buffer.clear();
        System.out.println("State after calling clear():");
        printState(buffer);

    }

    // Print the buffer's capacity, limit, and position.
    private static void printState(CharBuffer buffer) {
        System.out.print("capacity: " + buffer.capacity());
        System.out.print(", limit: " + buffer.limit());
        System.out.print(", position: " + buffer.position());
        System.out.println("\n");
    }
}
```

Output:

```bash
Initial state:
capacity: 8, limit: 8, position: 0

State after writing three characters:
capacity: 8, limit: 8, position: 3

Ready to read the buffer.

State after calling flip():
capacity: 8, limit: 3, position: 0

Data read: abc

State after calling clear():
capacity: 8, limit: 8, position: 0
```

The diagram below shows how `capacity`, `limit`, and `position` change at each stage.

![Changes to capacity, limit, and position at each stage](https://oss.javaguide.cn/github/javaguide/java/nio/NIOBufferClassAttributesDataChanges.png)

### Channel

A `Channel` connects to a data source such as a file or network socket. You can read and write data through it, much like water flowing through a pipe.

BIO streams are unidirectional: `InputStream` reads and `OutputStream` writes. Channels may be read-only, write-only, or support both, depending on their type and how they are opened. For example, `FileChannel` capabilities depend on how the file was opened, while `SocketChannel` supports both reading and writing.

Channels work with the `Buffer` described above. A read fills a buffer with data from the channel; a write sends buffered data to the channel.

![Relationship between Channel and Buffer](https://oss.javaguide.cn/github/javaguide/java/nio/channel-buffer.png)

Some channels, such as `SocketChannel`, support both reading and writing, directly reflecting the operating system's bidirectional communication capabilities.

The diagram below shows the `Channel` subclasses.

![Channel subclasses](https://oss.javaguide.cn/github/javaguide/java/nio/channel-subclasses.png)

The most commonly used channel types are:

- `FileChannel`: File access.
- `SocketChannel` and `ServerSocketChannel`: TCP communication.
- `DatagramChannel`: UDP communication.

![Channel inheritance hierarchy](https://oss.javaguide.cn/github/javaguide/java/nio/channel-inheritance-relationship.png)

The two core `Channel` methods are:

1. `read`: Reads data into a `Buffer`.
2. `write`: Writes data from a `Buffer` to the channel.

The following example reads file data with `FileChannel`:

```java
RandomAccessFile reader = new RandomAccessFile("/Users/guide/Documents/test_read.in", "r");
FileChannel channel = reader.getChannel();
ByteBuffer buffer = ByteBuffer.allocate(1024);
channel.read(buffer);
```

### Selector

`Selector` is a key NIO component that lets one thread handle multiple channels. It provides event-driven I/O multiplexing: register channel events with the selector, which monitors the channels for readiness. When a channel is ready—for example, when a TCP connection arrives or data can be read or written—the selector makes it available in the selected-key set. Use the corresponding `SelectionKey` to retrieve the ready channel and perform I/O.

![How Selector works](https://oss.javaguide.cn/github/javaguide/java/nio/selector-channel-selectionkey.png)

A `Selector` can monitor multiple channels at once. Its implementation depends on the platform's `SelectorProvider`; for example, Linux may use `epoll`, while other platforms use their own mechanisms. The number of connections is still limited by resources such as file descriptors, memory, and system settings.

A selector can monitor four event types:

1. `SelectionKey.OP_ACCEPT`: The channel is ready to accept a connection, usually on a `ServerSocketChannel`.
2. `SelectionKey.OP_CONNECT`: The channel has completed a connection, usually on a `SocketChannel`.
3. `SelectionKey.OP_READ`: The channel is ready to be read; data is available.
4. `SelectionKey.OP_WRITE`: The channel is ready to be written.

`Selector` is an abstract class. Call its static `open()` method to create an instance. A selector can monitor multiple `SelectableChannel` instances and is central to non-blocking I/O.

Each selector has three `SelectionKey` sets:

1. **All keys**: The channels registered with the selector. Retrieve this set with `keys()`.
2. **Selected keys**: The channels ready for I/O, as reported by `select()`. Retrieve this set with `selectedKeys()`.
3. **Cancelled keys**: Keys for channels whose registrations have been cancelled. They are removed on the next `select()` call. Applications usually do not need to access this set, and no method exposes it.

The following example iterates over the selected keys and handles each event:

```java
Set<SelectionKey> selectedKeys = selector.selectedKeys();
Iterator<SelectionKey> keyIterator = selectedKeys.iterator();
while (keyIterator.hasNext()) {
    SelectionKey key = keyIterator.next();
    if (key != null) {
        if (key.isAcceptable()) {
            // ServerSocketChannel accepted a new connection.
        } else if (key.isConnectable()) {
            // A new connection was established.
        } else if (key.isReadable()) {
            // The channel has data ready to read.
        } else if (key.isWritable()) {
            // The channel is ready for writing.
        }
    }
    keyIterator.remove();
}
```

`Selector` also provides these methods related to `select()`:

- `int select()`: Monitors all registered channels and blocks until at least one is ready for I/O. It adds the corresponding keys to the selected-key set and returns the number of keys updated.
- `int select(long timeout)`: Like `select()`, but with a timeout.
- `int selectNow()`: Checks for ready channels and returns immediately without blocking.
- `Selector wakeup()`: Causes a `select()` call that has not yet returned to return immediately.
- ……

The following example uses a selector for network I/O:

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;
import java.util.Set;

public class NioSelectorExample {

  public static void main(String[] args) {
    try {
      ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
      serverSocketChannel.configureBlocking(false);
      serverSocketChannel.socket().bind(new InetSocketAddress(8080));

      Selector selector = Selector.open();
      // Register the ServerSocketChannel with the selector for OP_ACCEPT events.
      serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);

      while (true) {
        int readyChannels = selector.select();

        if (readyChannels == 0) {
          continue;
        }

        Set<SelectionKey> selectedKeys = selector.selectedKeys();
        Iterator<SelectionKey> keyIterator = selectedKeys.iterator();

        while (keyIterator.hasNext()) {
          SelectionKey key = keyIterator.next();

          if (key.isAcceptable()) {
            // Handle a connection event.
            ServerSocketChannel server = (ServerSocketChannel) key.channel();
            SocketChannel client = server.accept();
            client.configureBlocking(false);

            // Register the client channel with the selector for OP_READ events.
            client.register(selector, SelectionKey.OP_READ);
          } else if (key.isReadable()) {
            // Handle a read event.
            SocketChannel client = (SocketChannel) key.channel();
            ByteBuffer buffer = ByteBuffer.allocate(1024);
            int bytesRead = client.read(buffer);

            if (bytesRead > 0) {
              buffer.flip();
              System.out.println("Received data: " + new String(buffer.array(), 0, bytesRead));
              // Store the response and listen for OP_WRITE events.
              key.attach(ByteBuffer.wrap("Hello, Client!".getBytes()));
              key.interestOps(SelectionKey.OP_WRITE);
            } else if (bytesRead < 0) {
              // The client disconnected.
              client.close();
            }
          } else if (key.isWritable()) {
            // Handle a write event.
            SocketChannel client = (SocketChannel) key.channel();
            ByteBuffer buffer = (ByteBuffer) key.attachment();
            client.write(buffer);

            // A non-blocking write may write only part of the data. Switch back to OP_READ when it is all written.
            if (!buffer.hasRemaining()) {
              key.attach(null);
              key.interestOps(SelectionKey.OP_READ);
            }
          }

          keyIterator.remove();
        }
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
```

This example creates a simple server listening on port 8080 and uses a selector to handle connection, read, and write events. When client data arrives, the server reads it, prints it to the console, and replies with "Hello, Client!".

## NIO Zero-Copy

Zero-copy is a common way to improve I/O performance. Open-source projects such as ActiveMQ, Kafka, RocketMQ, QMQ, and Netty use it.

Zero-copy refers to I/O techniques that avoid copying data between storage regions with the CPU, reducing CPU copy work and context switching. It mainly addresses repeated data copies in the operating system's I/O path. Common techniques include `mmap+write`, `sendfile`, and `sendfile + DMA gather copy`.

The table compares several zero-copy techniques:

|                            | CPU copies | DMA copies | System calls | Context switches |
| -------------------------- | ---------- | ---------- | ------------ | ---------------- |
| Traditional approach       | 2          | 2          | read+write   | 4                |
| mmap+write                 | 1          | 2          | mmap+write   | 4                |
| sendfile                   | 1          | 2          | sendfile     | 2                |
| sendfile + DMA gather copy | 0          | 2          | sendfile     | 2                |

As shown, both traditional I/O and zero-copy techniques still require two DMA (Direct Memory Access) transfers, which are performed by hardware. Zero-copy mainly reduces CPU copies and context switches.

Java supports zero-copy through these APIs:

- `MappedByteBuffer` maps part of a file into memory. The underlying mechanism depends on the operating system; on Linux, it is typically based on `mmap`.
- `FileChannel.transferTo()` and `transferFrom()` transfer bytes between channels. Many operating systems can optimize this transfer; Linux may use `sendfile`. The exact implementation depends on the JDK and operating system. See [Using Java NIO FileChannel](https://www.cnblogs.com/robothy/p/14235598.html) for more details.

Example:

```java
private void loadFileIntoMemory(File xmlFile) throws IOException {
  FileInputStream fis = new FileInputStream(xmlFile);
  // Create a FileChannel.
  FileChannel fc = fis.getChannel();
  // Map the file to memory and return a MappedByteBuffer.
  MappedByteBuffer mmb = fc.map(FileChannel.MapMode.READ_ONLY, 0, fc.size());
  xmlFileBuffer = new byte[(int)fc.size()];
  mmb.get(xmlFileBuffer);
  fis.close();
}
```

## Summary

This article covered the core concepts of NIO, including its main components and zero-copy.

For network applications, using raw NIO directly can be complex and provide too few features. Consider a mature NIO-based networking framework such as Netty, which builds on NIO with optimizations and support for multiple protocols, SSL/TLS, and more.

## References

- An Introduction to Java NIO: <https://tech.meituan.com/2016/11/04/nio.html>

- Interviewer: How Well Do You Know Java NIO? <https://mp.weixin.qq.com/s/mZobf-U8OSYQfHfYBEB6KA>

- Java NIO: Buffer, Channel, and Selector: <https://www.javadoop.com/post/java-nio>

<!-- @include: @article-footer.snippet.md -->
