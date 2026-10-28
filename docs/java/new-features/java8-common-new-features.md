---
title: Java 8 Features in Practice
description: A practical guide to Java 8 features, including Lambda, Stream, Optional, the Date-Time API, and interface default methods.
category: Java
tag:
  - Java New Features
head:
  - - meta
    - name: keywords
      content: Java 8,Lambda,Stream API,Optional,Date-Time API,default methods,functional interfaces
---

> Contributed by [cowbi](https://github.com/cowbi).

<!-- markdownlint-disable MD024 -->

JDK 8 was released on March 18, 2014. It is an LTS (Long-Term Support) release and remains widely used in the Java ecosystem. Oracle's listed LTS releases are JDK 8, 11, 17, 21, and 25.

JDK 8 introduced many important features. This article covers some of the key ones:

- Lambda expressions
- Stream API
- The Optional class
- The Date-Time API
- Interface default methods
- Functional interfaces

The chart below shows the number of features and release dates for each update from JDK 8 through JDK 24:

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

Oracle released Java 8 (JDK 1.8) in 2014, and it has remained widely used in the Java ecosystem. Many developers, especially those used to earlier versions, are still unfamiliar with some of its features.

It is useful to review these changes. Compared with JDK 7, Java 8 introduced many updates: interfaces can have static and default methods with bodies, `java.util.HashMap` added red-black tree bins, and Lambda expressions arrived. This article focuses on commonly used features. For the full list, see [Oracle's overview of Java 8 features](https://www.oracle.com/java/technologies/javase/8-whats-new.html).

## Interfaces

Interfaces provide abstraction and extensibility. However, changing an interface used to require changing every class that implemented it.

To preserve compatibility with existing implementations, Java 8 allows interface methods to use `default` or `static` and have a method body. Implementing classes do not have to override these methods.

An interface can declare multiple methods with these modifiers. Their main difference is the same as that between instance methods and static methods:

1. A `default` method is an instance method. It can use `this` and can be inherited or overridden by implementing classes.
2. A `static` method works like a static method in a class. It is not inherited and must be called through the interface.

Here is an example:

```java
public interface InterfaceNew {
    static void sm() {
        System.out.println("Implemented in the interface");
    }
    static void sm2() {
        System.out.println("Implemented in the interface");
    }

    default void def() {
        System.out.println("Interface default method");
    }
    default void def2() {
        System.out.println("Second interface default method");
    }
    // Must be implemented by implementing classes.
    void f();
}

public interface InterfaceNew1 {
    default void def() {
        System.out.println("InterfaceNew1 default method");
    }
}
```

If a class implements both `InterfaceNew` and `InterfaceNew1`, and both define `def()` without either interface extending the other, the class must override `def()`. Otherwise, compilation fails.

```java
public class InterfaceNewImpl implements InterfaceNew , InterfaceNew1{
    public static void main(String[] args) {
        InterfaceNewImpl interfaceNew = new InterfaceNewImpl();
        interfaceNew.def();
    }

    @Override
    public void def() {
        InterfaceNew1.super.def();
    }

    @Override
    public void f() {
    }
}
```

**In Java 8, how do interfaces differ from abstract classes?**

Some developers may think that interfaces are now much like abstract classes because they can provide method implementations.

They still differ:

1. The main differences between interfaces and classes are:

   - A class can implement multiple interfaces but extend only one class.
   - Interface instance methods without a body are implicitly `public abstract`, and fields are implicitly `public static final`. Interfaces can also declare `default` and `static` methods. Abstract classes support more member modifiers.

2. Interface methods act more like extension points, while abstract class methods are inherited as part of a class hierarchy.

As noted above, `default` and `static` methods were added to interfaces to preserve compatibility when interfaces change, not to replace abstract classes. Use an abstract class when it fits the design; these interface features are not a reason to replace one.

**Remember that interfaces and classes are different.**

## Functional Interfaces

**Definition:** A functional interface, also called a SAM (Single Abstract Method) interface, has exactly one abstract method. It can also have multiple non-abstract methods.

Java 8 provides the `java.util.function` package for functional interfaces. Its interfaces use the `@FunctionalInterface` annotation and support functional programming.

Other packages also contain functional interfaces, some without the `@FunctionalInterface` annotation. An interface is functional if it meets the definition, whether or not it has the annotation. The annotation lets the compiler enforce that definition. Functional interfaces are widely used with Lambda expressions.

## Lambda Expressions

Lambda expressions were one of the most important features in Java 8 and a major change after generics and annotations.

Lambda expressions make code more concise and let Java support basic _functional programming_.

> A Lambda expression is an anonymous function. Java 8 lets you pass functions as method arguments.

### Syntax

```java
(parameters) -> expression or
(parameters) ->{ statements; }
```

### Lambda in Practice

These common examples show how Lambda expressions can simplify code.

#### Replacing Anonymous Inner Classes

Anonymous inner classes were the usual way to pass behavior to a method. For example:

**1. `Runnable` interface**

```java
new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("The runable now is using!");
            }
}).start();
// With a Lambda expression.
new Thread(() -> System.out.println("It's a lambda function!")).start();
```

**2. `Comparator` interface**

```java
List<Integer> strings = Arrays.asList(1, 2, 3);

Collections.sort(strings, new Comparator<Integer>() {
@Override
public int compare(Integer o1, Integer o2) {
    return Integer.compare(o1, o2);}
});

// Lambda expression.
Collections.sort(strings, (Integer o1, Integer o2) -> Integer.compare(o1, o2));
// Split into separate statements.
Comparator<Integer> comparator = (Integer o1, Integer o2) -> Integer.compare(o1, o2);
Collections.sort(strings, comparator);
```

**3. `Listener` interface**

```java
JButton button = new JButton();
button.addItemListener(new ItemListener() {
@Override
public void itemStateChanged(ItemEvent e) {
   e.getItem();
}
});
// Lambda expression.
button.addItemListener(e -> e.getItem());
```

**4. Custom interfaces**

The three examples above are common in application development. Lambda expressions keep the code that matters and remove boilerplate. They work when the parameter type is a **functional interface**: an interface with one abstract method, which is why each anonymous inner class above overrides only one method.

```java
@FunctionalInterface
public interface Comparator<T>{
    int compare(T o1, T o2);
}

@FunctionalInterface
public interface Runnable{
    void run();
}
```

Here is a custom functional interface:

```java
@FunctionalInterface
public interface LambdaInterface {
 void f();
}
// Usage.
public class LambdaClass {
    public static void forEg() {
        lambdaInterfaceDemo(()-> System.out.println("Custom functional interface"));
    }
    // Takes a functional interface as an argument.
    static void lambdaInterfaceDemo(LambdaInterface i){
        i.f();
    }
}
```

#### Iterating Over Collections

```java
void lamndaFor() {
        List<String> strings = Arrays.asList("1", "2", "3");
        // Traditional for-each loop.
        for (String s : strings) {
            System.out.println(s);
        }
        // forEach with a Lambda expression.
        strings.forEach((s) -> System.out.println(s));
        // Or use a method reference.
        strings.forEach(System.out::println);
     // Map.
        Map<Integer, String> map = new HashMap<>();
        map.forEach((k,v)->System.out.println(v));
}
```

#### Method References

Java 8 lets you pass method or constructor references with the `::` operator. The expression must match a functional interface.

```java
public class LambdaClassSuper {
    LambdaInterface sf(){
        return null;
    }
}

public class LambdaClass extends LambdaClassSuper {
    public static LambdaInterface staticF() {
        return null;
    }

    public LambdaInterface f() {
        return null;
    }

    void show() {
        // 1. Reference a static method; the target type must be a functional interface.
        LambdaInterface t = LambdaClass::staticF;

        // 2. Reference an instance method.
        LambdaClass lambdaClass = new LambdaClass();
        LambdaInterface lambdaInterface = lambdaClass::f;

        // 3. Reference a superclass method.
        LambdaInterface superf = super::sf;

        // 4. Reference a constructor.
        LambdaInterface tt = LambdaClassSuper::new;
    }
}
```

#### Accessing Variables

```java
int i = 0;
Collections.sort(strings, (Integer o1, Integer o2) -> o1 - i);
//i =3;
```

Lambda expressions can reference local variables from the enclosing scope, but those variables must be `final` or effectively final (not reassigned after initialization). The compiler does not add the `final` modifier automatically.

## Stream API

Java added the `java.util.stream` package. Unlike resource streams such as `java.io.FileInputStream`, which move data from one place to another without operating on its contents, the Stream API processes data.

`Stream` does not store data. It retrieves and processes collection data through operations such as filtering, sorting, statistics, and counting. You can think of it as similar to an SQL query.

Its source can be a `Collection`, an array, and more. Since many methods take functional interfaces, Streams are often used with Lambda expressions.

### Stream Types

1. `stream`: a sequential stream.
2. `parallelStream`: a parallel stream that can use multiple threads.

### Common Methods

Here are some commonly used methods in `java.util.stream.Stream`:

```java
/**
* Returns a sequential stream.
*/
default Stream<E> stream()

/**
* Returns a parallel stream.
*/
default Stream<E> parallelStream()

/**
* Returns a stream containing the given value.
*/
public static<T> Stream<T> of(T t)

/**
* Returns a sequential stream containing the specified values.
*/
public static<T> Stream<T> of(T... values) {
    return Arrays.stream(values);
}


/**
* Filters this stream to elements that match the given predicate.
*/
Stream<T> filter(Predicate<? super T> predicate);

/**
* Returns whether all elements in this stream match the given predicate.
*/
boolean allMatch(Predicate<? super T> predicate)

/**
* Returns whether any element in this stream matches the given predicate.
*/
boolean anyMatch(Predicate<? super T> predicate);

/**
* Returns a Stream builder.
*/
public static<T> Builder<T> builder();

/**
* Reduces this stream's elements using a Collector.
*/
<R, A> R collect(Collector<? super T, A, R> collector);

/**
 * Returns the number of elements in this stream.
*/
long count();

/**
* Returns a stream containing the distinct elements, based on `Object.equals(Object)`.
*/
Stream<T> distinct();

/**
* Performs an action for each element.
*/
void forEach(Consumer<? super T> action);

/**
* Returns a stream truncated to at most `maxSize` elements.
*/
Stream<T> limit(long maxSize);

/**
* Maps each element to a corresponding result.
*/
<R> Stream<R> map(Function<? super T, ? extends R> mapper);

/**
* Sorts elements using the given Comparator.
*/
Stream<T> sorted(Comparator<? super T> comparator);

/**
* Skips the first `n` elements and returns a stream of the remaining elements.
*/
Stream<T> skip(long n);

/**
* Returns an array containing this stream's elements.
*/
Object[] toArray();

/**
* Uses the given generator to return an array containing this stream's elements.
*/
<A> A[] toArray(IntFunction<A[]> generator);

/**
* Concatenates two streams.
*/
public static <T> Stream<T> concat(Stream<? extends T> a, Stream<? extends T> b)
```

### Examples

These examples demonstrate representative `Stream` methods. See the API documentation for more.

```java
@Test
public void test() {
  List<String> strings = Arrays.asList("abc", "def", "gkh", "abc");
    // Return a stream that matches the condition.
    Stream<String> stringStream = strings.stream().filter(s -> "abc".equals(s));
    // Count the matching elements.
    long count = stringStream.count();

    // Print each element.
    strings.stream().forEach(System.out::println);

    // Limit the stream to one element.
    Stream<String> limit = strings.stream().limit(1);
    // Convert the limited stream to a String array.
    String[] array = limit.toArray(String[]::new);

    // Apply an operation to each element and return a new stream.
    Stream<String> map = strings.stream().map(s -> s + "22");

    // Sort and print the elements.
    strings.stream().sorted().forEach(System.out::println);

    // Collect matching elements into a list.
    List<String> collect = strings.stream().filter(string -> "abc".equals(string)).collect(Collectors.toList());
    // Join non-empty elements with commas.
    String mergedString = strings.stream().filter(string -> !string.isEmpty()).collect(Collectors.joining(","));

    // Summarize the numbers in the list.
    List<Integer> number = Arrays.asList(1, 2, 5, 4);

    IntSummaryStatistics statistics = number.stream().mapToInt((x) -> x).summaryStatistics();
    System.out.println("Maximum: " + statistics.getMax());
    System.out.println("Minimum: " + statistics.getMin());
    System.out.println("Average: " + statistics.getAverage());
    System.out.println("Sum: " + statistics.getSum());

    // Concatenate streams.
    List<String> strings2 = Arrays.asList("xyz", "jqx");
    Stream.concat(strings2.stream(),strings.stream()).count();

    // A stream can be operated on only once.
    Stream stream = strings.stream();
    // First operation.
    stream.limit(2);
    // Second operation.
    stream.forEach(System.out::println);
    // Throws java.lang.IllegalStateException: stream has already been operated upon or closed.

    // Chain operations in one pipeline.
    strings.stream().limit(2).forEach(System.out::println);
}
```

### Lazy Evaluation

Methods that return a `Stream` do not execute the pipeline immediately. Execution begins when a terminal operation returns a non-`Stream` result. A `Stream` describes a sequence of operations; it is not itself the final result.

Here is an example using `filter`:

```java
@Test
public void laziness(){
  List<String> strings = Arrays.asList("abc", "def", "gkh", "abc");
  Stream<Integer> stream = strings.stream().filter(new Predicate() {
      @Override
      public boolean test(Object o) {
        System.out.println("Predicate.test called");
        return true;
        }
      });

   System.out.println("count called");
   stream.count();
}
/*-------Output--------*/
count called
Predicate.test called
Predicate.test called
Predicate.test called
Predicate.test called
```

You might expect `Predicate.test` to print four times before `count`, but the output is the other way around. This shows that the predicate passed to `filter` is not evaluated until the terminal `count()` operation runs.

The examples above use sequential streams. `parallelStream` has a similar API but can use multiple threads. It is built on the Fork/Join framework; see `ForkJoin` and `ForkJoinPool` for details. Parallel streams use a thread pool, so consider thread safety and thread overhead. The example below shows a parallel stream in action.

```java
@Test
public void parallelStreamTest(){
   List<Integer> numbers = Arrays.asList(1, 2, 5, 4);
   numbers.parallelStream() .forEach(num->System.out.println(Thread.currentThread().getName()+">>"+num));
}
// Output
main>>5
ForkJoinPool.commonPool-worker-2>>4
ForkJoinPool.commonPool-worker-11>>1
ForkJoinPool.commonPool-worker-9>>2
```

The output shows that `forEach` runs on multiple threads.

### Summary

The examples and source API show several characteristics of streams:

1. Chained operations make it easy to process data after traversing it.
2. Many methods take functional interface arguments.
3. A stream can be operated on only once. Reusing it after a terminal operation causes an error.
4. A stream does not store data or modify its source.

## Optional

The [Alibaba Java Development Manual](https://share.weiyun.com/ThuqEbD5) notes the following common sources of `NullPointerException` (NPE):

> Preventing NPEs is a basic programming practice. Common sources include:
>
> 1. Returning a wrapper object from a method with a primitive return type can cause an NPE during automatic unboxing.
>
> For example, `public int f() { return integerObject; }` throws an NPE during unboxing if `integerObject` is `null`.
>
> 2. A database query may return `null`.
> 3. A collection may contain `null` elements even when it is not empty.
> 4. Check for `null` in objects returned by remote calls.
> 5. Check data retrieved from a session for `null`.
> 6. Chained calls such as `obj.getA().getB().getC()` can cause an NPE.
>
> One approach is to use the JDK 8 `Optional` class to handle potentially absent values.

Use `Optional` to express explicitly that a result may be absent. It can reduce some `NullPointerException` risks. An `Optional` either contains a non-`null` value or is empty; it does not contain `null`. The following examples explore how `Optional` works.

Suppose a `Zoo` has a `Dog` field, and you need to get the dog's `age`:

```java
class Zoo {
   private Dog dog;
}

class Dog {
   private int age;
}
```

One traditional way to avoid an NPE is to check each reference:

```java
Zoo zoo = getZoo();
if(zoo != null){
   Dog dog = zoo.getDog();
   if(dog != null){
      int age = dog.getAge();
      System.out.println(age);
   }
}
```

Some consider these nested null checks inelegant, but they can be clear and easy to read.

The same logic can use `Optional`:

```java
Optional.ofNullable(zoo).map(o -> o.getDog()).map(d -> d.getAge()).ifPresent(age ->
    System.out.println(age)
);
```

This is more concise.

### Creating an Optional

The previous example uses `Optional.ofNullable`. Here are its behavior and other factory methods:

```java
/**
* Common instance returned by {@code empty()}.
*/
private static final Optional<?> EMPTY = new Optional<>();

/**
* Value held by the Optional.
*/
private final T value;

/**
* Returns EMPTY if the value is null; otherwise, returns {@code of(T)}.
*/
public static <T> Optional<T> ofNullable(T value) {
   return value == null ? empty() : of(value);
}
/**
* Returns the EMPTY object.
*/
public static<T> Optional<T> empty() {
   Optional<T> t = (Optional<T>) EMPTY;
   return t;
}
/**
* Returns an Optional containing the value.
*/
public static <T> Optional<T> of(T value) {
    return new Optional<>(value);
}
/**
* Private constructor that assigns the value.
*/
private Optional(T value) {
  this.value = Objects.requireNonNull(value);
}
/**
* If {@code of(T value)} receives null, it throws NullPointerException.
*/
public static <T> T requireNonNull(T obj) {
  if (obj == null)
         throw new NullPointerException();
  return obj;
}
```

The main difference between `ofNullable` and `of` is how they handle `null`: `ofNullable` returns an empty `Optional`, while `of` throws `NullPointerException`. Use `ofNullable` when absence is valid; use `of` when the argument is required to be non-null so errors surface early.

**What is the difference between `map()` and `flatMap()`?**

Both `map` and `flatMap` apply a function to each element. `map` returns a new collection of mapped values; `flatMap` maps each element to a collection and then flattens the result.

If `map` returns an array for each element, the result is a nested collection. `flatMap` flattens it into a single collection.

```java
public class MapAndFlatMapExample {
    public static void main(String[] args) {
        List<String[]> listOfArrays = Arrays.asList(
                new String[]{"apple", "banana", "cherry"},
                new String[]{"orange", "grape", "pear"},
                new String[]{"kiwi", "melon", "pineapple"}
        );

        List<String[]> mapResult = listOfArrays.stream()
                .map(array -> Arrays.stream(array).map(String::toUpperCase).toArray(String[]::new))
                .collect(Collectors.toList());

        System.out.println("Using map:");
        mapResult.forEach(arrays-> System.out.println(Arrays.toString(arrays)));

        List<String> flatMapResult = listOfArrays.stream()
                .flatMap(array -> Arrays.stream(array).map(String::toUpperCase))
                .collect(Collectors.toList());

        System.out.println("Using flatMap:");
        System.out.println(flatMapResult);
    }
}

```

Output:

```plain
Using map:
[[APPLE, BANANA, CHERRY], [ORANGE, GRAPE, PEAR], [KIWI, MELON, PINEAPPLE]]

Using flatMap:
[APPLE, BANANA, CHERRY, ORANGE, GRAPE, PEAR, KIWI, MELON, PINEAPPLE]
```

In short, `flatMap()` flattens the result of `map()`.

With `Optional`, `map()` wraps a regular value returned by the mapping function in a new `Optional`. `flatMap()` expects the function to return an `Optional` and avoids wrapping it in a nested `Optional`.

Here is a comparison:

```java
public static void main(String[] args) {
        int userId = 1;

        // Using flatMap.
        String cityUsingFlatMap = getUserById(userId)
                .flatMap(OptionalExample::getAddressByUser)
                .map(Address::getCity)
                .orElse("Unknown");

        System.out.println("User's city using flatMap: " + cityUsingFlatMap);

        // Without flatMap.
        Optional<Optional<Address>> optionalAddress = getUserById(userId)
                .map(OptionalExample::getAddressByUser);

        String cityWithoutFlatMap;
        if (optionalAddress.isPresent()) {
            Optional<Address> addressOptional = optionalAddress.get();
            if (addressOptional.isPresent()) {
                Address address = addressOptional.get();
                cityWithoutFlatMap = address.getCity();
            } else {
                cityWithoutFlatMap = "Unknown";
            }
        } else {
            cityWithoutFlatMap = "Unknown";
        }

        System.out.println("User's city without flatMap: " + cityWithoutFlatMap);
    }
```

Using `flatMap` appropriately with `Stream` and `Optional` can eliminate unnecessary code.

### Checking Whether a Value Is Present

```java
/**
* Returns whether a value is present.
*/
public boolean isPresent() {
    return value != null;
}
/**
* If a value is present, passes it to the consumer.
*/
public void ifPresent(Consumer<? super T> consumer) {
   if (value != null)
    consumer.accept(value);
}
```

### Getting a Value

```java
/**
* Return the value if present, otherwise invoke {@code other} and return
* the result of that invocation.
* Returns the value if present; otherwise, invokes `other` and returns its result.
*/
public T orElseGet(Supplier<? extends T> other) {
    return value != null ? value : other.get();
}

/**
* Returns the value if present; otherwise, returns `other`.
*/
public T orElse(T other) {
    return value != null ? value : other;
}

/**
* Returns the value if present; otherwise, throws the exception supplied by the argument.
*/
public <X extends Throwable> T orElseThrow(Supplier<? extends X> exceptionSupplier) throws X {
        if (value != null) {
            return value;
        } else {
            throw exceptionSupplier.get();
        }
}
/**
* Throws `NoSuchElementException` if the value is absent; otherwise, returns it.
*/
public T get() {
  if (value == null) {
      throw new NoSuchElementException("No value present");
  }
  return value;
}
```

### Filtering a Value

```java
/**
* 1. If empty, returns empty.
* 2. Returns this if `predicate.test(value)` is true; otherwise, returns empty.
*/
public Optional<T> filter(Predicate<? super T> predicate) {
        Objects.requireNonNull(predicate);
        if (!isPresent())
            return this;
        else
            return predicate.test(value) ? this : empty();
}
```

### Summary

The `Optional` implementation shows that `of()` requires a non-`null` argument, `get()` throws `NoSuchElementException` when empty, and `flatMap()` flattens mapped `Optional` values. It is not a method to avoid. Choose `of()` or `ofNullable()` based on whether the value may be absent, and use methods such as `orElse`, `orElseGet`, and `orElseThrow` to handle empty values.

```java
Optional.ofNullable(zoo).map(o -> o.getDog()).map(d -> d.getAge()).filter(v->v==1).orElse(3);
```

## Date-Time API

The Date-Time API addresses many of the shortcomings of `java.util.Date`:

1. It is not thread-safe.
2. Time zone handling is difficult.
3. Formatting and date calculations are cumbersome.
4. `Date` combines date and time, and `java.sql.Date` has a similar name but a different purpose.

The examples below compare common operations with `java.util.Date` and the newer date-time types.

### Main `java.time` Types

`java.util.Date` represents both a date and a time, while `java.time` provides separate types:

```java
LocalDateTime.class // Date and time: yyyy-MM-ddTHH:mm:ss.SSS
LocalDate.class // Date: yyyy-MM-dd
LocalTime.class // Time: HH:mm:ss
```

### Formatting

**Before Java 8:**

```java
public void oldFormat(){
    Date now = new Date();
    //format yyyy-MM-dd
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    String date  = sdf.format(now);
    System.out.println(String.format("date format : %s", date));

    //format HH:mm:ss
    SimpleDateFormat sdft = new SimpleDateFormat("HH:mm:ss");
    String time = sdft.format(now);
    System.out.println(String.format("time format : %s", time));

    //format yyyy-MM-dd HH:mm:ss
    SimpleDateFormat sdfdt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    String datetime = sdfdt.format(now);
    System.out.println(String.format("dateTime format : %s", datetime));
}
```

**Since Java 8:**

```java
public void newFormat(){
    //format yyyy-MM-dd
    LocalDate date = LocalDate.now();
    System.out.println(String.format("date format : %s", date));

    //format HH:mm:ss
    LocalTime time = LocalTime.now().withNano(0);
    System.out.println(String.format("time format : %s", time));

    //format yyyy-MM-dd HH:mm:ss
    LocalDateTime dateTime = LocalDateTime.now();
    DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    String dateTimeStr = dateTime.format(dateTimeFormatter);
    System.out.println(String.format("dateTime format : %s", dateTimeStr));
}
```

### Parsing Dates from Strings

**Before Java 8:**

```java
// Deprecated.
Date date = new Date("2021-01-26");
// Use this instead.
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
Date date1 = sdf.parse("2021-01-26");
```

**Since Java 8:**

```java
LocalDate date = LocalDate.of(2021, 1, 26);
LocalDate.parse("2021-01-26");

LocalDateTime dateTime = LocalDateTime.of(2021, 1, 26, 12, 12, 22);
LocalDateTime.parse("2021-01-26T12:12:22");

LocalTime time = LocalTime.of(12, 12, 22);
LocalTime.parse("12:12:22");
```

**Before Java 8**, parsing required `SimpleDateFormat`. **Since Java 8**, use the `of` or `parse` methods on `LocalDate`, `LocalTime`, or `LocalDateTime`.

### Date Calculations

The example below calculates the date one week from now. Other units, such as years, months, days, half-days, and hours, work similarly. These units are defined in `java.time.temporal.ChronoUnit`.

**Before Java 8:**

```java
public void afterDay(){
     // Date one week from now.
     SimpleDateFormat formatDate = new SimpleDateFormat("yyyy-MM-dd");
     Calendar ca = Calendar.getInstance();
     ca.add(Calendar.DATE, 7);
     Date d = ca.getTime();
     String after = formatDate.format(d);
     System.out.println("Date one week from now: " + after);

   // Calculate the number of days between two dates. Years and months work similarly.
     String dates1 = "2021-12-23";
   String dates2 = "2021-02-26";
     SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
     Date date1 = format.parse(dates1);
     Date date2 = format.parse(dates2);
     int day = (int) ((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24));
     System.out.println(dates1 + " and " + dates2 + " are " + day + " days apart");
     // Output: 2021-02-26 and 2021-12-23 are 300 days apart.
}
```

**Since Java 8:**

```java
public void pushWeek(){
     // Date one week from now.
     LocalDate localDate = LocalDate.now();
     // Option 1.
     LocalDate after = localDate.plus(1, ChronoUnit.WEEKS);
     // Option 2.
     LocalDate after2 = localDate.plusWeeks(1);
     System.out.println("Date one week from now: " + after);

     // Calculate the difference in years, months, and days.
     LocalDate date1 = LocalDate.parse("2021-02-26");
     LocalDate date2 = LocalDate.parse("2021-12-23");
     Period period = Period.between(date1, date2);
     System.out.println("Time between date1 and date2: "
                + period.getYears() + " years, "
                + period.getMonths() + " months, "
                + period.getDays() + " days");
   // Output: 0 years, 9 months, 27 days.
     // period.getDays() returns the remaining days after years and months, not the total number of days.
     // Use the following method to get the total number of days.
     long day = date2.toEpochDay() - date1.toEpochDay();
     System.out.println(date1 + " and " + date2 + " are " + day + " days apart");
     // Output: 2021-02-26 and 2021-12-23 are 300 days apart.
}
```

### Getting Specific Dates

Getting a specific date, such as the first or last day of the current month, can also be cumbersome.

**Before Java 8:**

```java
public void getDay() {

        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        // Get the first day of the current month.
        Calendar c = Calendar.getInstance();
        c.set(Calendar.DAY_OF_MONTH, 1);
        String first = format.format(c.getTime());
        System.out.println("first day:" + first);

        // Get the last day of the current month.
        Calendar ca = Calendar.getInstance();
        ca.set(Calendar.DAY_OF_MONTH, ca.getActualMaximum(Calendar.DAY_OF_MONTH));
        String last = format.format(ca.getTime());
        System.out.println("last day:" + last);

        // Get the last day of the current year.
        Calendar currCal = Calendar.getInstance();
        Calendar calendar = Calendar.getInstance();
        calendar.clear();
        calendar.set(Calendar.YEAR, currCal.get(Calendar.YEAR));
        calendar.roll(Calendar.DAY_OF_YEAR, -1);
        Date time = calendar.getTime();
        System.out.println("last day:" + format.format(time));
}
```

**Since Java 8:**

```java
public void getDayNew() {
    LocalDate today = LocalDate.now();
    // Get the first day of the current month.
    LocalDate firstDayOfThisMonth = today.with(TemporalAdjusters.firstDayOfMonth());
    // Get the last day of the current month.
    LocalDate lastDayOfThisMonth = today.with(TemporalAdjusters.lastDayOfMonth());
    // Get the next day.
    LocalDate nextDay = lastDayOfThisMonth.plusDays(1);
    // Get the last day of the current year.
    LocalDate lastday = today.with(TemporalAdjusters.lastDayOfYear());
    // Get the last Sunday of 2021.
    LocalDate lastMondayOf2021 = LocalDate.parse("2021-12-31").with(TemporalAdjusters.lastInMonth(DayOfWeek.SUNDAY));
}
```

`java.time.temporal.TemporalAdjusters` provides many other useful date adjustments. See the API documentation for details.

### JDBC and Java 8

The JDBC and Java 8 date-time types correspond as follows:

1. `Date` ---> `LocalDate`
2. `Time` ---> `LocalTime`
3. `Timestamp` ---> `LocalDateTime`

Before JDBC 4.2, `java.sql.Date`, `java.sql.Time`, and `java.sql.Timestamp` were commonly used to represent these SQL time types.

### Time Zones

> In theory, time zones are divided every 15 degrees of longitude, giving 24 zones with a one-hour difference between them. For administrative convenience, countries and regions may use a single time zone. For example, China spans roughly five theoretical time zones but uses China Standard Time (UTC+8).

`java.util.Date` stores the number of milliseconds since midnight on January 1, 1970 (GMT). A `Date` created in any time zone represents the same instant; its value is independent of the time zone. To display it as local time, use `TimeZone`, since `java.util.Date` does not handle time zones itself.

```java
// Beijing time: Wed Jan 27 14:05:29 CST 2021.
Date date = new Date();

SimpleDateFormat bjSdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
// Beijing time zone.
bjSdf.setTimeZone(TimeZone.getTimeZone("Asia/Shanghai"));
System.out.println("Milliseconds: " + date.getTime() + ", Beijing time: " + bjSdf.format(date));

// Tokyo time zone.
SimpleDateFormat tokyoSdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
tokyoSdf.setTimeZone(TimeZone.getTimeZone("Asia/Tokyo"));  // Set the Tokyo time zone.
System.out.println("Milliseconds: " + date.getTime() + ", Tokyo time: " + tokyoSdf.format(date));

// Printing the Date directly uses the current time zone.
System.out.println(date);
//Wed Jan 27 14:05:29 CST 2021
```

Java 8 introduced `java.time.ZonedDateTime` to represent a date and time with a time zone. You can think of it as `LocalDateTime + ZoneId`.

```java
// Current time zone.
ZonedDateTime zonedDateTime = ZonedDateTime.now();
System.out.println("Current time: " + zonedDateTime);

// Tokyo time.
ZoneId zoneId = ZoneId.of(ZoneId.SHORT_IDS.get("JST"));
ZonedDateTime tokyoTime = zonedDateTime.withZoneSameInstant(zoneId);
System.out.println("Tokyo time: " + tokyoTime);

// Convert ZonedDateTime to LocalDateTime.
LocalDateTime localDateTime = tokyoTime.toLocalDateTime();
System.out.println("Tokyo time as a local date-time: " + localDateTime);

// Convert LocalDateTime to ZonedDateTime.
ZonedDateTime localZoned = localDateTime.atZone(ZoneId.systemDefault());
System.out.println("Local time with zone: " + localZoned);

// Output
Current time: 2021-01-27T14:43:58.735+08:00[Asia/Shanghai]
Tokyo time: 2021-01-27T15:43:58.735+09:00[Asia/Tokyo]
Tokyo time as a local date-time: 2021-01-27T15:43:58.735
Local time with zone: 2021-01-27T15:43:58.735+08:00[Asia/Shanghai]
```

### Summary

These examples cover only some differences between the old and new date-time APIs. The Date-Time API makes date operations easier. Prefer it for date and time work, and use the older `Date` API only when needed.

## Summary

The Java 8 features covered in this article are:

- Interfaces and functional interfaces
- Lambda
- Stream
- Optional
- The Date-Time API

These features are common in everyday development and can improve productivity once learned. They may take a few days to get familiar with, but are well worth adopting over older approaches.

<!-- @include: @article-footer.snippet.md -->
