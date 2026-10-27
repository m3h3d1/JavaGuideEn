---
title: Java Generics and Wildcards Explained
description: Learn Java generics, type erasure, bounded wildcards, the PECS principle, and common generic programming techniques.
category: Java
tag:
  - Java Fundamentals
head:
  - - meta
    - name: keywords
      content: Java generics,wildcards,type erasure,generic bounds,PECS principle,generic methods,bounded wildcards,generic interfaces
---

## Generics

### What Are Generics, and Why Use Them?

**Java generics** were introduced in JDK 5. Generic parameters improve code readability and type safety. **Unless noted otherwise, examples assume Java 8.**

The compiler checks generic types and ensures that only the specified type is passed. For example, `ArrayList<Person> persons = new ArrayList<Person>()` means that the list accepts `Person` objects; passing another type causes a compile-time error. Since JDK 7, you can write `new ArrayList<>()` and let the compiler infer the type argument.

```java
ArrayList<E> extends AbstractList<E>
```

The raw `List` type returns elements as `Object`, so you need to cast them before use. With generics, the compiler handles the cast.

### How Can You Use Generics?

Generics are commonly used with **generic classes**, **generic interfaces**, and **generic methods**.

**1. Generic class:**

```java
// T can be any valid identifier. Common type parameter names include T, E, K, and V.
// Specify a type argument when creating an instance of a generic class.
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

Create an instance of a generic class:

```java
Generic<Integer> genericInteger = new Generic<Integer>(123456);
// Since JDK 7, you can write: new Generic<>(123456)
```

**2. Generic interface:**

```java
public interface Generator<T> {
    public T method();
}
```

Implement the generic interface without specifying the type:

```java
class GeneratorImpl<T> implements Generator<T>{
    @Override
    public T method() {
        return null;
    }
}
```

Implement the generic interface with a specific type:

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

### Where Are Generics Used in Projects?

- A generic API response such as `CommonResult<T>` can specify the result type with `T`.
- An Excel utility such as `ExcelUtil<T>` can specify the type of data to export.
- Collection utilities such as `Collections.sort` and `Collections.binarySearch` use generics.
- ……

### What Is Type Erasure, and Why Is It Used?

**Java implements generics with type erasure: generic instances don't retain their concrete type arguments at runtime, though class files can preserve generic declarations in attributes such as `Signature`, which reflection APIs can read.**

During compilation, the compiler erases `T` to `Object`, or erases `T extends SomeType` to its bound, `SomeType`.

Type erasure allows generic code to remain compatible with Java libraries and bytecode from before generics were introduced. The compiler inserts casts and bridge methods as needed to preserve type safety and polymorphism.

Here's an example:

```java
List<Integer> list = new ArrayList<>();

list.add(12);
// 1. Adding this directly fails at compile time.
list.add("a");
Class<? extends List> clazz = list.getClass();
Method add = clazz.getDeclaredMethod("add", Object.class);
// 2. Reflection can add it at runtime.
add.invoke(list, "kl");

System.out.println(list)
```

Here's another example: the following overloads cause a compile-time error because of type erasure.

```java
public void print(List<String> list)  { }
public void print(List<Integer> list) { }
```

![Type erasure in Java generics](https://oss.javaguide.cn/github/javaguide/java/basis/generics-runtime-erasure.png)

After type erasure, both `List<String>` and `List<Integer>` become `List`.

**If the compiler erases generic types, why use generics instead of `Object`?**

This question is really asking what generics provide:

- Generics provide compile-time type checking.

- Using `Object` requires manual casts, which makes code harder to read and easier to get wrong.

- Generics support bounded type parameters, such as `T extends Comparable`.

### What Are Bridge Methods?

The compiler uses **bridge methods** to preserve polymorphism when a generic class is extended.

```java
class Node<T> {
    public T data;
    public Node(T data) { this.data = data; }
    public void setData(T data) {
        System.out.println("Node.setData");
        this.data = data;
    }
}

class MyNode extends Node<Integer> {
    public MyNode(Integer data) { super(data); }

    // Node<T>.setData(T) erases to setData(Object). The compiler generates this bridge method to preserve polymorphism.
   	public void setData(Object data) {
        setData((Integer) data);
    }

    public void setData(Integer data) {
        System.out.println("MyNode.setData");
        super.setData(data);
    }
}
```

⚠️ **Note:** Bridge methods are generated by the compiler; you don't write them yourself.

### What Are the Limitations of Generics, and Why?

Many limitations of generics result from type erasure. Once a type is erased to `Object`, some type information is unavailable at runtime.

- You can declare a variable of type `T`, but you can't instantiate it directly with `new T()`.
- Type arguments can't be primitive types. Use their wrapper types instead.
- You can't create an array of a type parameter or a parameterized type because the erased type doesn't provide enough information for runtime checks.
- You can't use `instanceof` to check a type parameter at runtime. After erasure, `getClass()` also can't distinguish `List<String>` from `List<Integer>`; both return `List.class`.
- A class can't implement the same interface with different type arguments because erasure causes method signature conflicts.
- A class's static context can't refer to its type parameters. A static generic method can declare and use its own type parameters.
- ……

### Will This Code Compile? Why or Why Not?

```java
public final class Algorithm {
    public static <T> T max(T x, T y) {
        return x > y ? x : y;
    }
}
```

It won't compile because `x` and `y` are erased to `Object`, which can't be compared with `>`.

```java
public class Singleton<T> {

    public static T getInstance() {
        if (instance == null)
            instance = new Singleton<T>();

        return instance;
    }

    private static T instance = null;
}
```

It won't compile because a class's static fields and methods can't refer to the class's type parameter `T`. A static method can declare its own type parameter, for example, `public static <T> T getInstance()`.

## Wildcards

### What Are Wildcards, and Why Use Them?

Generic types are fixed, which can be restrictive in some cases. Wildcards allow more flexible type arguments and help address the invariance of generic types.

For example:

```java
// Restrict the type to Person or one of its subtypes.
<? extends Person>
// Restrict the type to Manager or one of its supertypes.
<? super Manager>
```

### How Does the Wildcard `?` Differ from a Type Parameter Such as `T`?

- You can use `T` to declare a variable or constant; you can't use `?` this way.
- `T` is commonly used to declare generic classes or methods. `?` is commonly used in type arguments, such as method parameters.
- The compiler erases `T` to its bound or `Object`. Inside a method, the compiler captures `?` as a specific but unknown type. You can't add anything except `null` to a `List<?>`, though a generic method can work with the captured type.

### What Is an Unbounded Wildcard?

An unbounded wildcard accepts any generic type. It's useful for simple methods that don't depend on the specific type argument, or when a generic method can capture and handle that type.

```java
void testMethod(Person<?> p) {
  // The generic method handles the value.
}
```

**Is there a difference between `List<?>` and `List`?** Yes.

- `List<?> list` means the element type is **unknown but fixed** (there is some type `T` such that the list is a `List<T>`). The compiler therefore prevents adding anything except `null` to avoid type errors.
- `List list` is a raw type. It bypasses some generic type checks and isn't the same as `List<Object>`. Adding an element usually produces an unchecked warning and can defer type errors until runtime.

```java
List<?> list = new ArrayList<>();
list.add("sss");// Compile-time error.
List list2 = new ArrayList<>();
list2.add("sss");// Unchecked warning.
```

### What Are Upper-Bounded and Lower-Bounded Wildcards?

You can restrict generic type arguments with upper or lower bounds. For example, an argument may be required to be a subtype or supertype of a particular type.

An **upper-bounded wildcard, `extends`**, means the type argument must be the specified type or one of its subtypes.

For example:

```java
// Restrict the type to Person or one of its subtypes.
<? extends Person>
```

You can specify multiple bounds and also bound a type parameter `T`:

```java
<T extends T1 & T2>
<T extends XXX>
```

A **lower-bounded wildcard, `super`**, means the type argument must be the specified type or one of its supertypes.

For example:

```java
// Restrict the type to Employee or one of its supertypes.
List<? super Employee>
```

**What's the difference between `? extends T` and `? super T`?**

They accept different ranges of type arguments. With `List<? extends T>`, you can read values as `T`, but can't safely add anything except `null`. With `List<? super T>`, you can add `T` and its subtypes, but values can only be safely read as `Object`.

**PECS (Producer Extends, Consumer Super):** Use `extends` when reading from a data structure (a producer) and `super` when writing to one (a consumer). For example, you can read `Number` values from `List<? extends Number>` but can't add values to it. You can add `Integer` values to `List<? super Integer>`, but reads return `Object`. `Collections.copy(List<? super T> dest, List<? extends T> src)` is a typical example: it reads from `src` and writes to `dest`.

**What's the difference between `T extends SomeType` and `? extends SomeType`?**

`T extends SomeType` declares a bounded type parameter, which is erased to `SomeType`. `? extends SomeType` is a wildcard type argument that can be used in fields, local variables, method parameters, and return types.

**What's the difference between `Class<?>` and `Class`?**

Using raw `Class` produces a type warning because `Class` is generic. `Class<?>` avoids that warning.

### Will This Code Compile? Why or Why Not?

```java
class Shape { /* ... */ }
class Circle extends Shape { /* ... */ }
class Rectangle extends Shape { /* ... */ }

class Node<T> { /* ... */ }

Node<Circle> nc = new Node<>();
Node<Shape>  ns = nc;
```

It won't compile because `Node<Circle>` isn't a subtype of `Node<Shape>`.

```java
class Shape { /* ... */ }
class Circle extends Shape { /* ... */ }
class Rectangle extends Shape { /* ... */ }

class Node<T> { /* ... */ }
class ChildNode<T> extends Node<T>{

}
ChildNode<Circle> nc = new ChildNode<>();
Node<Circle>  ns = nc;
```

It compiles because `ChildNode<Circle>` is a subtype of `Node<Circle>`.

```java
public static void print(List<? extends Number> list) {
    for (Number n : list)
        System.out.print(n + " ");
    System.out.println();
}
```

It compiles. You can read values from `List<? extends Number>`, but can't use `add()` to add an element.

## References

- [Java Generics Tutorial](https://docs.oracle.com/javase/tutorial/java/generics/index.html)
- [Java Generics Explained](https://www.cnblogs.com/XiiX/p/14719568.html)
