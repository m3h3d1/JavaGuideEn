---
title: Java Serialization Explained
description: Learn Java serialization and deserialization, including Serializable, transient, serialVersionUID, serialization formats, and use in RPC and caching.
category: Java
tag:
  - Java Fundamentals
head:
  - - meta
    - name: keywords
      content: Java serialization,deserialization,Serializable,transient,serialVersionUID,serialization formats,object persistence
---

## What Are Serialization and Deserialization?

Serialization is needed when you want to persist Java objects, such as saving them to a file or sending them over a network.

In simple terms:

- **Serialization:** Converts a data structure or object into a storable or transferable format, usually a binary byte stream, but also possibly a text format such as JSON or XML.
- **Deserialization:** Converts serialized data back into the original data structure or object.

In Java, serialization applies to objects, or instances of classes. In C++, a `struct` defines a data structure, while a `class` defines an object type.

Common use cases include:

- Serialize an object before sending it over a network, such as during a remote procedure call (RPC), and deserialize it after receipt.
- Serialize an object before saving it to a file, and deserialize it when reading it back.
- Serialize an object before storing it in a database or cache such as Redis, and deserialize it when retrieving it.
- Serialize an object when converting it to bytes for long-term storage or transfer between components. Ordinary Java objects don't need to be serialized to be used in JVM memory.

Wikipedia describes serialization as follows:

> **Serialization** is the process of converting a data structure or object state into a format that can be stored or transmitted, such as in a file, a buffer, or over a network, so it can later be restored in the same or another computing environment. Deserializing the data can produce a copy with the same meaning as the original object. Reconstructing complex objects with many references can be difficult. Object serialization doesn't include the functions associated with the original object. This process is also called marshalling. The reverse operation, extracting a data structure from a sequence of bytes, is deserialization or unmarshalling.

In short, **serialization converts objects to a representation suitable for network transmission or storage in files, databases, caches, and other media.**

![](https://oss.javaguide.cn/github/javaguide/a478c74d-2c48-40ae-9374-87aacf05188c.png)

<p style="text-align:right;font-size:13px;color:gray">https://www.corejavaguru.com/java/serialization/interview-questions-1</p>

**Which layer of the four-layer TCP/IP model does a serialization format belong to?**

Both sides of a network connection must use the same protocol. The four layers of the TCP/IP model are:

1. Application
2. Transport
3. Internet
4. Network access

![Four-layer TCP/IP model](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-ip-4-model.png)

In the OSI seven-layer model, the presentation layer converts application data to a binary stream and back. This corresponds to serialization and deserialization.

The OSI application, presentation, and session layers correspond to the application layer in the TCP/IP model, so serialization formats are part of the TCP/IP application layer.

## Common Serialization Formats

The JDK's built-in serialization is rarely used because it is inefficient and has security risks. Common binary serialization formats include Hessian, Kryo, Protobuf, and Protostuff.

JSON and XML are text-based formats. They're more readable, but generally offer lower performance.

### Built-in JDK Serialization

To use the JDK's built-in serialization, implement the `java.io.Serializable` interface.

```java
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@ToString
public class RpcRequest implements Serializable {
    private static final long serialVersionUID = 1905122041950251207L;
    private String requestId;
    private String interfaceName;
    private String methodName;
    private Object[] parameters;
    private Class<?>[] paramTypes;
    private RpcMessageTypeEnum rpcMessageTypeEnum;
}
```

**What Is serialVersionUID for?**

`serialVersionUID` is used for version control. During deserialization, Java checks whether the value in the stream matches the value in the current class. If they differ, it throws `InvalidClassException`. It's strongly recommended to declare `serialVersionUID` explicitly in every serializable class. If you don't, the serialization runtime computes a default value from the class structure; the compiler doesn't generate a field.

**serialVersionUID is a static field. Why is it still “serialized”?**

~~A field declared `static` belongs to the class and is stored in the method area, so it isn't serialized. After deserialization, the static field's value appears to have been assigned to the object, making it look as if the field was serialized. This is only an illusion.~~

**🐛 Correction (see [issue #2174](https://github.com/Snailclimb/JavaGuide/issues/2174)):**

Normally, `static` fields belong to the class, not to an individual object, so they aren't included in the serialized object data. Serialization stores an object's state, meaning its instance field values. `serialVersionUID` is a special case handled by the serialization mechanism. It isn't serialized as part of the object's state; it is used as a fingerprint or version number.

When an object is serialized, `serialVersionUID` is written to the binary stream as a version number, not as the state of the `static` field. Deserialization reads it and checks for a match. If the values differ, deserialization throws `InvalidClassException`, usually because the class definition has changed and may no longer be compatible.

The official documentation says:

> A serializable class can declare its own serialVersionUID explicitly by declaring a field named `"serialVersionUID"` that must be `static`, `final`, and of type `long`;
>
> To declare `serialVersionUID` explicitly, a class must declare a field named `"serialVersionUID"` with the modifiers `static` and `final` and the type `long`.

In other words, `serialVersionUID` itself isn't serialized as object state, but the Java serialization mechanism reads and writes its value as a version identifier for compatibility checks during deserialization.

**What if you don't want to serialize certain fields?**

Use the `transient` keyword for fields that shouldn't be serialized.

The `transient` keyword prevents an instance field from being serialized. When the object is deserialized, a transient field isn't restored from the stream.

Keep these points in mind about `transient`:

- `transient` can be applied to fields, not classes or methods.
- After deserialization, a transient field has its type's default value. For example, a transient `int` is set to `0`.
- `static` fields aren't serialized, whether or not they are marked `transient`, because they don't belong to an individual object.

**Why Is the JDK's Built-in Serialization Not Recommended?**

The JDK's built-in serialization is rarely used for several reasons:

- **No cross-language support:** It isn't suitable when communicating with services written in other languages.
- **Low performance:** Compared with other serialization frameworks, it can be slower and produce larger byte arrays, increasing transfer costs.
- **Security risks:** Serialization and deserialization aren't inherently unsafe, but untrusted input can be crafted to make deserialization create unexpected objects and execute attacker-controlled code. See [Java Deserialization Vulnerabilities](https://cryin.github.io/blog/secure-development-java-deserialization-vulnerability/) and [What Are Java Deserialization Vulnerabilities?](https://www.zhihu.com/question/37562657/answer/1916596031).

### Kryo

Kryo is a high-performance serialization framework. It uses variable-length storage and bytecode generation to provide high speed and compact output.

Kryo is a mature serialization implementation used at Twitter, Groupon, Yahoo, and in open-source projects such as Hive and Storm.

[guide-rpc-framework](https://github.com/Snailclimb/guide-rpc-framework) uses Kryo for serialization. Here is the related code:

```java
/**
 * Kryo serialization class, Kryo serialization efficiency is very high, but only compatible with Java language
 *
 * @author shuang.kou
 * @createTime 2020-05-13 19:29:00
 */
@Slf4j
public class KryoSerializer implements Serializer {

    /**
     * Because Kryo is not thread safe. So, use ThreadLocal to store Kryo objects
     */
    private final ThreadLocal<Kryo> kryoThreadLocal = ThreadLocal.withInitial(() -> {
        Kryo kryo = new Kryo();
        kryo.register(RpcResponse.class);
        kryo.register(RpcRequest.class);
        return kryo;
    });

    @Override
    public byte[] serialize(Object obj) {
        try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
             Output output = new Output(byteArrayOutputStream)) {
            Kryo kryo = kryoThreadLocal.get();
            // Object to bytes: serialize the object to a byte array.
            kryo.writeObject(output, obj);
            kryoThreadLocal.remove();
            return output.toBytes();
        } catch (Exception e) {
            throw new SerializeException("Serialization failed");
        }
    }

    @Override
    public <T> T deserialize(byte[] bytes, Class<T> clazz) {
        try (ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(bytes);
             Input input = new Input(byteArrayInputStream)) {
            Kryo kryo = kryoThreadLocal.get();
            // Bytes to object: deserialize the byte array.
            Object o = kryo.readObject(input, clazz);
            kryoThreadLocal.remove();
            return clazz.cast(o);
        } catch (Exception e) {
            throw new SerializeException("Deserialization failed");
        }
    }

}
```

GitHub: [EsotericSoftware/kryo](https://github.com/EsotericSoftware/kryo).

### Protobuf

Protobuf was developed by Google. It performs well, supports multiple languages, and is cross-platform. It can be cumbersome to use because you need to define an IDL file and generate serialization code. This is less flexible, but also helps avoid some serialization vulnerabilities.

> Protobuf includes a serialization format, libraries for several languages, and an IDL compiler. Typically, you define a `.proto` file and compile it into code for your target language.

A simple `.proto` file looks like this:

```protobuf
// Protobuf syntax version.
syntax = "proto3";
// Person is compiled into a corresponding type in each language,
// such as a Java class or a Go struct.
message Person {
  // String field.
  string name = 1;
  // Integer field.
  int32 age = 2;
}
```

GitHub: [protocolbuffers/protobuf](https://github.com/protocolbuffers/protobuf).

### Protostuff

Protostuff was created to make Protobuf easier to use.

Protostuff is based on Google Protobuf, but offers more features and a simpler API. Its ease of use doesn't mean lower performance.

GitHub: [protostuff/protostuff](https://github.com/protostuff/protostuff).

### Hessian

Hessian is a lightweight, self-describing binary RPC protocol. It's an older serialization format and supports multiple languages.

![](https://oss.javaguide.cn/github/javaguide/8613ec4c-bde5-47bf-897e-99e0f90b9fa3.png)

Dubbo 2.x uses Hessian2 by default, with some modifications to the implementation.

### Summary

Kryo is designed for Java and performs well. Consider it if your application only needs to support Java. The Dubbo documentation also recommends Kryo for production use: <https://cn.dubbo.apache.org/zh-cn/docsv2.7/user/serialization/>.

![](https://oss.javaguide.cn/github/javaguide/java/569e541a-22b2-4846-aa07-0ad479f07440-20230814090158124.png)

Protobuf, Protostuff, and Hessian support multiple languages and are options when you need cross-language compatibility.

Other serialization formats include Thrift and Avro.

<!-- @include: @article-footer.snippet.md -->
