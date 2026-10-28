---
title: Java I/O Basics
description: An overview of Java I/O, including byte and character streams, InputStream and OutputStream, Reader and Writer, buffering, and file operations.
category: Java
tag:
  - Java IO
  - Java Fundamentals
head:
  - - meta
    - name: keywords
      content: Java I/O,byte streams,character streams,InputStream,OutputStream,Reader,Writer,file operations,buffered streams
---

## Introduction to I/O Streams

I/O stands for `Input/Output`. Input is the process of bringing data into computer memory; output sends data to an external destination such as a database, file, or remote host. Because data flows from one place to another, these APIs are called I/O streams. Java streams are either input or output streams, and are further classified as byte or character streams based on how they process data.

Java's more than 40 I/O stream classes derive from these four abstract base classes:

- `InputStream` / `Reader`: Base classes for input streams. The former handles bytes; the latter handles characters.
- `OutputStream` / `Writer`: Base classes for output streams. The former handles bytes; the latter handles characters.

## Byte Streams

### InputStream (Byte Input Stream)

`InputStream` reads data (bytes) from a source, usually a file, into memory. The abstract class `java.io.InputStream` is the base class for all byte input streams.

Common `InputStream` methods:

- `read()`: Returns the next byte as a value from 0 to 255, or `-1` if the end of the stream is reached.
- `read(byte[] b)`: Reads bytes into `b` and returns the number read, up to `b.length`. Returns `-1` if no bytes are available because the stream has ended. Equivalent to `read(b, 0, b.length)`.
- `read(byte[] b, int off, int len)`: Like `read(byte[] b)`, but specifies the array offset and maximum number of bytes to read.
- `skip(long n)`: Skips up to `n` bytes and returns the actual number skipped.
- `available()`: Estimates how many bytes can be read or skipped without blocking. Do not use it to determine the stream's total length.
- `close()`: Closes the input stream and releases associated system resources.

Java 9 added several useful methods to `InputStream`:

- `readAllBytes()`: Reads all bytes from the input stream and returns them as a byte array.
- `readNBytes(byte[] b, int off, int len)`: Tries to read up to `len` bytes and returns when that many bytes have been read or the stream ends. The operation may block or throw an exception.
- `transferTo(OutputStream out)`: Transfers all bytes from this input stream to an output stream.

`FileInputStream` is a commonly used byte input stream. You can specify a file path and read either one byte at a time or into a byte array.

Example using `FileInputStream`:

```java
try (InputStream fis = new FileInputStream("input.txt")) {
    System.out.println("Number of remaining bytes:"
            + fis.available());
    int content;
    long skip = fis.skip(2);
    System.out.println("The actual number of bytes skipped:" + skip);
    System.out.print("The content read from file:");
    while ((content = fis.read()) != -1) {
        System.out.print((char) content);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

Contents of `input.txt`:

![](https://oss.javaguide.cn/github/javaguide/java/image-20220419155214614.png)

Output:

```plain
Number of remaining bytes:11
The actual number of bytes skipped:2
The content read from file:JavaGuide
```

In practice, `FileInputStream` is usually wrapped in a `BufferedInputStream` (a buffered byte input stream, described below).

This pattern is common in applications: `readAllBytes()` reads all bytes from the input stream, which are then passed directly to a `String` constructor.

```java
// Create a BufferedInputStream.
BufferedInputStream bufferedInputStream = new BufferedInputStream(new FileInputStream("input.txt"));
// Read the file contents into a String.
String result = new String(bufferedInputStream.readAllBytes());
System.out.println(result);
```

`DataInputStream` reads values of specific types. It must be combined with another stream, such as `FileInputStream`.

```java
FileInputStream fileInputStream = new FileInputStream("input.txt");
// Pass fileInputStream to the constructor.
DataInputStream dataInputStream = new DataInputStream(fileInputStream);
// Read values of different types.
dataInputStream.readBoolean();
dataInputStream.readInt();
dataInputStream.readUTF();
```

`ObjectInputStream` reads Java objects from an input stream (deserialization), while `ObjectOutputStream` writes objects to an output stream (serialization).

```java
ObjectInputStream input = new ObjectInputStream(new FileInputStream("object.data"));
MyClass object = (MyClass) input.readObject();
input.close();
```

Classes used for serialization and deserialization must implement `Serializable`. Mark fields that should not be serialized with `transient`.

### OutputStream (Byte Output Stream)

`OutputStream` writes data (bytes) to a destination, usually a file. The abstract class `java.io.OutputStream` is the base class for all byte output streams.

Common `OutputStream` methods:

- `write(int b)`: Writes one byte to the output stream.
- `write(byte[] b)`: Writes the byte array `b` to the output stream. Equivalent to `write(b, 0, b.length)`.
- `write(byte[] b, int off, int len)`: Like `write(byte[] b)`, but specifies the array offset and number of bytes to write.
- `flush()`: Flushes the stream and forces buffered bytes to be written.
- `close()`: Closes the output stream and releases associated system resources.

`FileOutputStream` is a commonly used byte output stream. You can specify a file path and write either one byte at a time or a byte array.

Example using `FileOutputStream`:

```java
try (FileOutputStream output = new FileOutputStream("output.txt")) {
    byte[] array = "JavaGuide".getBytes();
    output.write(array);
} catch (IOException e) {
    e.printStackTrace();
}
```

Result:

![](https://oss.javaguide.cn/github/javaguide/java/image-20220419155514392.png)

Like `FileInputStream`, `FileOutputStream` is usually wrapped in a `BufferedOutputStream` (a buffered byte output stream, described below).

```java
FileOutputStream fileOutputStream = new FileOutputStream("output.txt");
BufferedOutputStream bos = new BufferedOutputStream(fileOutputStream);
```

**`DataOutputStream`** writes values of specific types. It must be combined with another stream, such as `FileOutputStream`.

```java
// Output stream.
FileOutputStream fileOutputStream = new FileOutputStream("out.txt");
DataOutputStream dataOutputStream = new DataOutputStream(fileOutputStream);
// Write values of different types.
dataOutputStream.writeBoolean(true);
dataOutputStream.writeByte(1);
```

`ObjectInputStream` reads Java objects from an input stream (deserialization), while `ObjectOutputStream` writes objects to an output stream (serialization).

```java
ObjectOutputStream output = new ObjectOutputStream(new FileOutputStream("file.txt"));
Person person = new Person("Guide", "JavaGuide author");
output.writeObject(person);
```

## Character Streams

Whether reading files or sending and receiving data over a network, the smallest unit of stored information is a byte. **Why, then, does Java I/O provide both byte and character streams?**

There are two main reasons:

- Character streams convert bytes into characters, which adds processing overhead.
- If the character encoding is unknown, the data can be decoded incorrectly.

You can reproduce an encoding problem by putting non-ASCII text in `input.txt` from the `FileInputStream` example above. The code itself does not need to change.

![](https://oss.javaguide.cn/github/javaguide/java/image-20220419154632551.png)

Output:

```java
Number of remaining bytes:9
The actual number of bytes skipped:2
The content read from file:§å®¶å¥½
```

The text is clearly garbled.

For convenience, Java I/O provides APIs that operate directly on characters. Byte streams are better for media files such as audio and images; use character streams for text.

`Reader` and `Writer` operate on characters. When converting between byte and character streams, specify the encoding with `Charset`. Conversion classes that do not specify an encoding use the JVM's default charset.

Unicode is a character set that assigns a unique number to each character; it does not define how characters are stored. UTF-8, UTF-16, and UTF-32 are Unicode encodings that use different numbers of bytes. For example, UTF-8 uses one byte for basic English characters and typically three bytes for Chinese characters.

### Reader (Character Input Stream)

`Reader` reads character data from a source, usually a file, into memory. The abstract class `java.io.Reader` is the base class for all character input streams.

Use `Reader` to read text and `InputStream` to read raw bytes.

Common `Reader` methods:

- `read()`: Reads one character from the input stream.
- `read(char[] cbuf)`: Reads characters into `cbuf`. Equivalent to `read(cbuf, 0, cbuf.length)`.
- `read(char[] cbuf, int off, int len)`: Like `read(char[] cbuf)`, but specifies the array offset and maximum number of characters to read.
- `skip(long n)`: Skips up to `n` characters and returns the number actually skipped.
- `close()`: Closes the input stream and releases associated system resources.

`InputStreamReader` bridges byte streams and character streams. Its subclass `FileReader` is a wrapper that can read character files directly.

```java
// Bridge from byte streams to character streams.
public class InputStreamReader extends Reader {
}
// Reads character files.
public class FileReader extends InputStreamReader {
}
```

Example using `FileReader`:

```java
try (FileReader fileReader = new FileReader("input.txt");) {
    int content;
    long skip = fileReader.skip(3);
    System.out.println("The actual number of characters skipped:" + skip);
    System.out.print("The content read from file:");
    while ((content = fileReader.read()) != -1) {
        System.out.print((char) content);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

Contents of `input.txt`:

![](https://oss.javaguide.cn/github/javaguide/java/image-20220419154632551.png)

Output:

```plain
The actual number of characters skipped:3
The content read from file:我是Guide。
```

### Writer (Character Output Stream)

`Writer` writes character data to a destination, usually a file. The abstract class `java.io.Writer` is the base class for all character output streams.

Common `Writer` methods:

- `write(int c)`: Writes one character.
- `write(char[] cbuf)`: Writes the character array `cbuf`. Equivalent to `write(cbuf, 0, cbuf.length)`.
- `write(char[] cbuf, int off, int len)`: Like `write(char[] cbuf)`, but specifies the array offset and number of characters to write.
- `write(String str)`: Writes a string. Equivalent to `write(str, 0, str.length())`.
- `write(String str, int off, int len)`: Writes part of a string, starting at offset `off` and writing up to `len` characters.
- `append(CharSequence csq)`: Appends a character sequence and returns this `Writer`.
- `append(char c)`: Appends a character and returns this `Writer`.
- `flush()`: Flushes the stream and forces buffered characters to be written.
- `close()`: Closes the output stream and releases associated system resources.

`OutputStreamWriter` bridges character streams and byte streams. Its subclass `FileWriter` wraps it so characters can be written directly to a file.

```java
// Bridge from character streams to byte streams.
public class OutputStreamWriter extends Writer {
}
// Writes characters to a file.
public class FileWriter extends OutputStreamWriter {
}
```

Example using `FileWriter`:

```java
try (Writer output = new FileWriter("output.txt")) {
    output.write("你好，我是Guide。");
} catch (IOException e) {
    e.printStackTrace();
}
```

Result:

![](https://oss.javaguide.cn/github/javaguide/java/image-20220419155802288.png)

## Buffered Byte Streams

I/O operations can be expensive. Buffered streams load data into a buffer and read or write multiple bytes at once, reducing the number of I/O operations and improving throughput.

Buffered byte streams use the Decorator pattern to add behavior to `InputStream` and `OutputStream` subclasses.

For example, `BufferedInputStream` adds buffering to `FileInputStream`:

```java
// Create a BufferedInputStream.
BufferedInputStream bufferedInputStream = new BufferedInputStream(new FileInputStream("input.txt"));
```

The performance difference between byte streams and buffered byte streams is most apparent when calling `write(int b)` and `read()`, which process one byte at a time. A buffered stream first stores bytes in an internal byte array, greatly reducing the number of I/O operations.

The following timings compare copying a 524.9 MB PDF with byte streams and buffered byte streams using `write(int b)` and `read()`:

```plain
Buffered stream copy time: 15428 ms
Unbuffered byte stream copy time: 2555062 ms
```

The difference is substantial: the buffered stream took about 1/165 as long.

Test code:

```java
@Test
void copy_pdf_to_another_pdf_buffer_stream() {
    // Record the start time.
    long start = System.currentTimeMillis();
    try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream("operating-systems.pdf"));
         BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("operating-systems-copy.pdf"))) {
        int content;
        while ((content = bis.read()) != -1) {
            bos.write(content);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
    // Record the end time.
    long end = System.currentTimeMillis();
    System.out.println("Buffered stream copy time: " + (end - start) + " ms");
}

@Test
void copy_pdf_to_another_pdf_stream() {
    // Record the start time.
    long start = System.currentTimeMillis();
    try (FileInputStream fis = new FileInputStream("operating-systems.pdf");
         FileOutputStream fos = new FileOutputStream("operating-systems-copy.pdf")) {
        int content;
        while ((content = fis.read()) != -1) {
            fos.write(content);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
    // Record the end time.
    long end = System.currentTimeMillis();
    System.out.println("Unbuffered stream copy time: " + (end - start) + " ms");
}
```

When calling `read(byte[] b)` and `write(byte[] b, int off, int len)` to process byte arrays, the performance difference is small if the array is an appropriate size.

The following timings compare copying the same 524.9 MB PDF with byte arrays:

```plain
Buffered stream copy time: 695 ms
Unbuffered byte stream copy time: 989 ms
```

The difference is small, though the buffered stream is slightly faster.

Test code:

```java
@Test
void copy_pdf_to_another_pdf_with_byte_array_buffer_stream() {
    // Record the start time.
    long start = System.currentTimeMillis();
    try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream("operating-systems.pdf"));
         BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("operating-systems-copy.pdf"))) {
        int len;
        byte[] bytes = new byte[4 * 1024];
        while ((len = bis.read(bytes)) != -1) {
            bos.write(bytes, 0, len);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
    // Record the end time.
    long end = System.currentTimeMillis();
    System.out.println("Buffered stream copy time: " + (end - start) + " ms");
}

@Test
void copy_pdf_to_another_pdf_with_byte_array_stream() {
    // Record the start time.
    long start = System.currentTimeMillis();
    try (FileInputStream fis = new FileInputStream("operating-systems.pdf");
         FileOutputStream fos = new FileOutputStream("operating-systems-copy.pdf")) {
        int len;
        byte[] bytes = new byte[4 * 1024];
        while ((len = fis.read(bytes)) != -1) {
            fos.write(bytes, 0, len);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
    // Record the end time.
    long end = System.currentTimeMillis();
    System.out.println("Unbuffered stream copy time: " + (end - start) + " ms");
}
```

### BufferedInputStream (Buffered Byte Input Stream)

When `BufferedInputStream` reads bytes from a source, usually a file, it first stores them in an internal buffer. Reads are then served from that buffer, greatly reducing I/O operations and improving performance.

`BufferedInputStream` maintains an internal buffer implemented as a byte array, as shown in its source code:

```java
public
class BufferedInputStream extends FilterInputStream {
    // Internal buffer array.
    protected volatile byte buf[];
    // Default buffer size.
    private static int DEFAULT_BUFFER_SIZE = 8192;
    // Use the default buffer size.
    public BufferedInputStream(InputStream in) {
        this(in, DEFAULT_BUFFER_SIZE);
    }
    // Use a custom buffer size.
    public BufferedInputStream(InputStream in, int size) {
        super(in);
        if (size <= 0) {
            throw new IllegalArgumentException("Buffer size <= 0");
        }
        buf = new byte[size];
    }
}
```

The default buffer size is **8192** bytes. You can specify a different size with `BufferedInputStream(InputStream in, int size)`.

### BufferedOutputStream (Buffered Byte Output Stream)

When writing bytes to a destination, usually a file, `BufferedOutputStream` first stores them in an internal buffer and writes them out in batches. This greatly reduces I/O operations and improves performance.

```java
try (BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("output.txt"))) {
    byte[] array = "JavaGuide".getBytes();
    bos.write(array);
} catch (IOException e) {
    e.printStackTrace();
}
```

Like `BufferedInputStream`, `BufferedOutputStream` maintains an internal buffer with a default size of **8192** bytes.

## Buffered Character Streams

`BufferedReader` and `BufferedWriter` are the character-stream counterparts of `BufferedInputStream` and `BufferedOutputStream`. They maintain character buffers for processing text.

## Print Streams

You have probably used this code:

```java
System.out.print("Hello！");
System.out.println("Hello！");
```

`System.out` is a `PrintStream` object, and its `print` method ultimately calls `PrintStream.write()`.

`PrintStream` is a byte-oriented print stream; its character-oriented counterpart is `PrintWriter`. `PrintStream` extends `OutputStream`, and `PrintWriter` extends `Writer`.

```java
public class PrintStream extends FilterOutputStream
    implements Appendable, Closeable {
}
public class PrintWriter extends Writer {
}
```

## Random-Access Files

`RandomAccessFile` supports reading from and writing to arbitrary positions in a file.

The `RandomAccessFile` constructor accepts a `mode` that specifies how the file is opened:

```java
// openAndDelete defaults to false, so opening the file does not delete it.
public RandomAccessFile(File file, String mode)
    throws FileNotFoundException {
    this(file, mode, false);
}
// Private constructor.
private RandomAccessFile(File file, String mode, boolean openAndDelete)  throws FileNotFoundException{
  // Most of the code is omitted.
}
```

The four main modes are:

- `r`: Read-only.
- `rw`: Read and write.
- `rws`: Like `rw`, but synchronously updates changes to file contents or metadata on the underlying storage device.
- `rwd`: Like `rw`, but synchronously updates changes to file contents on the underlying storage device.

File contents are the data stored in the file. Metadata describes properties such as file size and creation or modification time.

`RandomAccessFile` maintains a file pointer indicating the position of the next byte to read or write. Use `seek(long pos)` to move it to `pos` bytes from the start of the file, and `getFilePointer()` to retrieve its current position.

Example using `RandomAccessFile`:

```java
RandomAccessFile randomAccessFile = new RandomAccessFile(new File("input.txt"), "rw");
System.out.println("Offset before read: " + randomAccessFile.getFilePointer() + ", character read: " + (char) randomAccessFile.read() + ", offset after read: " + randomAccessFile.getFilePointer());
// Move the file pointer to offset 6.
randomAccessFile.seek(6);
System.out.println("Offset before read: " + randomAccessFile.getFilePointer() + ", character read: " + (char) randomAccessFile.read() + ", offset after read: " + randomAccessFile.getFilePointer());
// Write bytes starting at offset 7.
randomAccessFile.write(new byte[]{'H', 'I', 'J', 'K'});
// Move the file pointer back to offset 0.
randomAccessFile.seek(0);
System.out.println("Offset before read: " + randomAccessFile.getFilePointer() + ", character read: " + (char) randomAccessFile.read() + ", offset after read: " + randomAccessFile.getFilePointer());
```

Contents of `input.txt`:

![](https://oss.javaguide.cn/github/javaguide/java/image-20220421162050158.png)

Output:

```plain
Offset before read: 0, character read: A, offset after read: 1
Offset before read: 6, character read: G, offset after read: 7
Offset before read: 0, character read: A, offset after read: 1
```

The contents of `input.txt` are now `ABCDEFGHIJK`.

If the target position already contains data, `RandomAccessFile.write()` overwrites it.

```java
RandomAccessFile randomAccessFile = new RandomAccessFile(new File("input.txt"), "rw");
randomAccessFile.write(new byte[]{'H', 'I', 'J', 'K'});
```

For example, if `input.txt` contains `ABCD` before running the following code, it contains `HIJK` afterward.

One common use of `RandomAccessFile` is **resumable uploads** of large files. If an upload is paused or fails, for example because of a network issue, it can resume by sending only the chunks that were not uploaded successfully. Splitting the file into chunks is the basis of resumable uploads.

`RandomAccessFile` can also be used to combine file chunks, as shown below:

![](https://oss.javaguide.cn/github/javaguide/java/io/20210609164749122.png)

For more detail about large-file uploads, see [Java Interview Guide](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html).

![](https://oss.javaguide.cn/github/javaguide/java/image-20220428104115362.png)

`RandomAccessFile` relies on `FileDescriptor` and `FileChannel` (for memory-mapped files).

<!-- @include: @article-footer.snippet.md -->
