---
title: Pass-by-Value in Java Explained
description: Learn why Java uses pass-by-value through examples of parameter passing, references, and the difference between arguments and parameters.
category: Java
tag:
  - Java Fundamentals
head:
  - - meta
    - name: keywords
      content: Java pass-by-value,pass-by-reference,parameter passing,arguments and parameters,object references,method calls
---

First, let's clarify two concepts:

- Formal parameters and arguments
- Pass-by-value and pass-by-reference

## Formal Parameters and Arguments

Methods can take **parameters**, which are divided into two kinds:

- **Arguments:** Values passed to a function or method. They must have a value when the call is made.
- **Formal parameters:** Variables declared in a function or method to receive its arguments. They don't need an initial value in the declaration.

```java
String hello = "Hello!";
// hello is the argument.
sayHello(hello);
// str is the formal parameter.
void sayHello(String str) {
    System.out.println(str);
}
```

## Pass-by-Value and Pass-by-Reference

Programming languages generally pass arguments to methods or functions in one of two ways:

- **Pass-by-value:** The method receives a copy of the argument's value.
- **Pass-by-reference:** The method receives a reference to the argument itself, so changes to the parameter, including reassignment, affect the caller's variable.

Some languages, such as C++, support both. Java uses only pass-by-value.

## Why Does Java Use Only Pass-by-Value?

**Why do we say Java uses only pass-by-value?** The following three examples show how it works.

### Example 1: Passing a Primitive

Code:

```java
public static void main(String[] args) {
    int num1 = 10;
    int num2 = 20;
    swap(num1, num2);
    System.out.println("num1 = " + num1);
    System.out.println("num2 = " + num2);
}

public static void swap(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
    System.out.println("a = " + a);
    System.out.println("b = " + b);
}
```

Output:

```plain
a = 20
b = 10
num1 = 10
num2 = 20
```

Explanation:

Swapping `a` and `b` inside `swap()` doesn't affect `num1` and `num2`. The method receives copies of their values, so changing those copies doesn't change the original variables.

![](https://oss.javaguide.cn/github/javaguide/java/basis/java-value-passing-01.png)

The example shows that a method can't change the caller's primitive variable. Object references behave differently; see Example 2.

### Example 2: Passing an Object Reference (Part 1)

Code:

```java
  public static void main(String[] args) {
      int[] arr = { 1, 2, 3, 4, 5 };
      System.out.println(arr[0]);
      change(arr);
      System.out.println(arr[0]);
  }

  public static void change(int[] array) {
      // Set the array's first element to 0.
      array[0] = 0;
  }
```

Output:

```plain
1
0
```

Explanation:

![](https://oss.javaguide.cn/github/javaguide/java/basis/java-value-passing-02.png)

This example may make it seem like Java passes object references by reference.

It doesn't. Java still passes a value; in this case, the value is a copy of the object reference.

The `change` method receives a copy of the reference stored in `arr`. The parameter and `arr` point to the same array, so the caller can observe changes to the array's contents.

The next example makes it clearer that Java doesn't pass object references by reference.

### Example 3: Passing an Object Reference (Part 2)

```java
public class Person {
    private String name;
   // Constructor, getters, and setters omitted.
}

public static void main(String[] args) {
    Person zhang = new Person("Zhang");
    Person li = new Person("Li");
    swap(zhang, li);
    System.out.println("zhang: " + zhang.getName());
    System.out.println("li: " + li.getName());
}

public static void swap(Person person1, Person person2) {
    Person temp = person1;
    person1 = person2;
    person2 = temp;
    System.out.println("person1: " + person1.getName());
    System.out.println("person2: " + person2.getName());
}
```

Output:

```plain
person1: Li
person2: Zhang
zhang: Zhang
li: Li
```

Explanation:

Swapping the two object-reference parameters didn't change the caller's variables.

The `swap` method receives copies of the references stored in `zhang` and `li`. Swapping `person1` and `person2` only swaps those copies; it doesn't change the caller's variables.

![](https://oss.javaguide.cn/github/javaguide/java/basis/java-value-passing-03.png)

## What Does Pass-by-Reference Look Like?

Java uses pass-by-value, not pass-by-reference. The following C++ example shows pass-by-reference:

```C++
#include <iostream>

void incr(int& num)
{
    std::cout << "incr before: " << num << "\n";
    num++;
    std::cout << "incr after: " << num << "\n";
}

int main()
{
    int age = 10;
    std::cout << "invoke before: " << age << "\n";
    incr(age);
    std::cout << "invoke after: " << age << "\n";
}
```

Output:

```plain
invoke before: 10
incr before: 10
incr after: 11
invoke after: 11
```

The change to the `incr` parameter also changes the argument. The parameter uses the `int&` type, which makes it a reference. If it were `int`, the function would receive a copy.

## Why Doesn't Java Use Pass-by-Reference?

Pass-by-reference lets a method directly change an argument. Why doesn't Java use it?

**The following points are my opinion, not an official explanation from the Java team:**

1. **Safety:** Changes made inside a method can be hidden from its callers, especially when the method is called through an interface. Imagine withdrawing $100 and having $200 deducted from your account.
2. **Simplicity:** Java's creator, James Gosling, designed the language with simplicity in mind and left out features from C and C++ that could easily lead to mistakes.

## Summary

Java passes arguments to methods and functions **by value**:

- For a primitive parameter, the method receives a copy of the primitive value.
- For an object-reference parameter, the method receives a copy of the reference. The parameter and argument initially point to the same object, but reassigning the parameter doesn't change the caller's variable.

## References

- _Core Java, Volume I: Fundamentals_, 10th edition, section 4.5.
- [Is Java Pass-by-Value or Pass-by-Reference? — Hollis on Zhihu](https://www.zhihu.com/question/31203609/answer/576030121)
- [Oracle Java Tutorials - Passing Information to a Method or a Constructor](https://docs.oracle.com/javase/tutorial/java/javaOO/arguments.html)
- [Interview with James Gosling, Father of Java](https://mappingthejourney.com/single-post/2017/06/29/episode-3-interview-with-james-gosling-father-of-java/)

<!-- @include: @article-footer.snippet.md -->
