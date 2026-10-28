---
title: "Java 21 Features: Virtual Threads, Generational ZGC, and Sequenced Collections"
description: An overview of Java 21 features, including virtual threads, generational ZGC, Sequenced Collections, record patterns, switch pattern matching, LTS support, and the withdrawn String Templates preview.
category: Java
tag:
  - Java New Features
head:
  - - meta
    - name: keywords
      content: Java 21,JDK 21,LTS,virtual threads,Sequenced Collections,generational ZGC,record patterns,switch pattern matching,String Templates,Foreign Function and Memory API
---

Java 21 was released on September 19, 2023. Oracle designated it as a Long-Term Support (LTS) release.

According to Oracle's Java SE support roadmap, updated in April 2026, Premier Support for Oracle JDK 21 runs through September 2028, and Extended Support through September 2031. Free updates and commercial support may vary by JDK distribution.

JDK 21 includes 15 new features. This article covers some of the more notable ones:

- [JEP 430: String Templates (Preview)](https://openjdk.org/jeps/430)
- [JEP 431: Sequenced Collections](https://openjdk.org/jeps/431)
- [JEP 439: Generational ZGC](https://openjdk.org/jeps/439)
- [JEP 440: Record Patterns](https://openjdk.org/jeps/440)
- [JEP 441: Pattern Matching for `switch`](https://openjdk.org/jeps/441)
- [JEP 442: Foreign Function & Memory API (Third Preview)](https://openjdk.org/jeps/442)
- [JEP 443: Unnamed Patterns and Variables (Preview)](https://openjdk.org/jeps/443)
- [JEP 444: Virtual Threads](https://openjdk.org/jeps/444)
- [JEP 445: Unnamed Classes and Instance Main Methods (Preview)](https://openjdk.org/jeps/445)

For production upgrades, start with Sequenced Collections, generational ZGC, and virtual threads. String Templates were previewed only in JDK 21 and 22. The proposal was later withdrawn, so current JDKs no longer provide this API or syntax.

The chart below shows the number of features and release dates for each update from JDK 8 through JDK 24:

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 430: String Templates (Preview)

String Templates were a preview feature in JDK 21 and received a second preview in JDK 22. The proposal was later withdrawn, so current JDKs no longer provide this API or syntax.

String Templates provide a concise and intuitive way to build strings dynamically. The JDK 21 preview syntax used `\{expression}` for embedded expressions, which were processed by a template processor. Expressions could include local variables, static or instance fields, method calls, and computations.

String templates are available in many programming languages:

```typescript
"Greetings {{ name }}!";  //Angular
`Greetings ${ name }!`;    //Typescript
$"Greetings { name }!"    //Visual basic
f"Greetings { name }!"    //Python
```

Before String Templates, Java developers usually built strings with concatenation or formatting methods:

```java
// Concatenation
message = "Greetings " + name + "!";

// String.format()
message = String.format("Greetings %s!", name);

// MessageFormat
message = new MessageFormat("Greetings {0}!").format(name);

// StringBuilder
message = new StringBuilder().append("Greetings ").append(name).append("!").toString();
```

These approaches can be hard to read, verbose, or complex.

With String Templates, expressions could be embedded directly in a string:

```java
String message = STR."Greetings \{name}!";
```

In the template expression above:

- `STR` is the template processor.
- `\{name}` is an expression that is replaced with the variable's value at runtime.

The preview provided three template processors:

- **STR:** Interpolates each embedded expression by converting its value to a string.
- **FMT:** Like `STR`, but also accepts format specifiers before embedded expressions to control the output format.
- **RAW:** Returns a `StringTemplate` object with the template text and expressions instead of processing them automatically like `STR` and `FMT`.

```java
String name = "Lokesh";

//STR
String message = STR."Greetings \{name}.";

//FMT
String message = FMT."Greetings %-12s\{name}.";

//RAW
StringTemplate st = RAW."Greetings \{name}.";
String message = STR.process(st);
```

You could also implement `StringTemplate.Processor` and its `process` method to create a custom template processor.

Embedded expressions could use local variables, static or instance fields, and method calls:

```java
// Variable
message = STR."Greetings \{name}!";

// Method
message = STR."Greetings \{getName()}!";

// Field
message = STR."Greetings \{this.name}!";
```

Expressions could also perform calculations:

```java
int x = 10, y = 20;
String s = STR."\{x} + \{y} = \{x + y}";  //"10 + 20 = 30"
```

For readability, an embedded expression could span multiple lines:

```java
String time = STR."The current time is \{
    // Sample comment: current time in HH:mm:ss.
    DateTimeFormatter
      .ofPattern("HH:mm:ss")
      .format(LocalTime.now())
  }.";
```

## JEP 431: Sequenced Collections

JDK 21 introduced a set of collection interfaces called **Sequenced Collections**. These collections have a defined encounter order and provide methods to access their first and last elements and obtain a reversed view.

Sequenced Collections includes three interfaces:

- [`SequencedCollection`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html)
- [`SequencedSet`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedSet.html)
- [`SequencedMap`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedMap.html)

`SequencedCollection` extends `Collection`. It provides methods to access, add, and remove elements at either end of the collection, as well as to get a reversed view.

```java
interface SequencedCollection<E> extends Collection<E> {

  // New method

  SequencedCollection<E> reversed();

  // Methods promoted from Deque<E>

  void addFirst(E);
  void addLast(E);

  E getFirst();
  E getLast();

  E removeFirst();
  E removeLast();
}
```

The `List` and `Deque` interfaces extend `SequencedCollection`.

Here is an example using `ArrayList`:

```java
ArrayList<Integer> arrayList = new ArrayList<>();

arrayList.add(1);   // List contains: [1]

arrayList.addFirst(0);  // List contains: [0, 1]
arrayList.addLast(2);   // List contains: [0, 1, 2]

Integer firstElement = arrayList.getFirst();  // 0
Integer lastElement = arrayList.getLast();  // 2

List<Integer> reversed = arrayList.reversed();
System.out.println(reversed); // Prints [2, 1, 0]
```

`SequencedSet` directly extends `SequencedCollection` and overrides `reversed()`.

```java
interface SequencedSet<E> extends SequencedCollection<E>, Set<E> {

    SequencedSet<E> reversed();
}
```

`SortedSet` extends `SequencedSet`, and `LinkedHashSet` implements it.

Here is an example using `LinkedHashSet`:

```java
LinkedHashSet<Integer> linkedHashSet = new LinkedHashSet<>(List.of(1, 2, 3));

Integer firstElement = linkedHashSet.getFirst();   // 1
Integer lastElement = linkedHashSet.getLast();    // 3

linkedHashSet.addFirst(0);  //List contains: [0, 1, 2, 3]
linkedHashSet.addLast(4);   //List contains: [0, 1, 2, 3, 4]

System.out.println(linkedHashSet.reversed());   //Prints [4, 3, 2, 1, 0]
```

`SequencedMap` extends `Map`. It provides methods to access, add, and remove entries at either end, get a `SequencedSet` of keys, a `SequencedCollection` of values, a `SequencedSet` of entries, and obtain a reversed view.

```java
interface SequencedMap<K,V> extends Map<K,V> {

  // New methods

  SequencedMap<K,V> reversed();

  SequencedSet<K> sequencedKeySet();
  SequencedCollection<V> sequencedValues();
  SequencedSet<Entry<K,V>> sequencedEntrySet();

  V putFirst(K, V);
  V putLast(K, V);


  // Methods promoted from NavigableMap<K, V>

  Entry<K, V> firstEntry();
  Entry<K, V> lastEntry();

  Entry<K, V> pollFirstEntry();
  Entry<K, V> pollLastEntry();
}
```

`SortedMap` extends `SequencedMap`, and `LinkedHashMap` implements it.

Here is an example using `LinkedHashMap`:

```java
LinkedHashMap<Integer, String> map = new LinkedHashMap<>();

map.put(1, "One");
map.put(2, "Two");
map.put(3, "Three");

map.firstEntry();   //1=One
map.lastEntry();    //3=Three

System.out.println(map);  //{1=One, 2=Two, 3=Three}

Map.Entry<Integer, String> first = map.pollFirstEntry();   //1=One
Map.Entry<Integer, String> last = map.pollLastEntry();    //3=Three

System.out.println(map);  //{2=Two}

map.putFirst(1, "One");     //{1=One, 2=Two}
map.putLast(3, "Three");    //{1=One, 2=Two, 3=Three}

System.out.println(map);  //{1=One, 2=Two, 3=Three}
System.out.println(map.reversed());   //{3=Three, 2=Two, 1=One}
```

## JEP 439: Generational ZGC

JDK 21 extended ZGC with generational collection. It is disabled by default and must be enabled with an option:

```bash
# Enable generational ZGC in JDK 21.
java -XX:+UseZGC -XX:+ZGenerational ...
```

Later releases completed these changes: JDK 23 made generational mode the default for ZGC through [JEP 474](https://openjdk.org/jeps/474), and JDK 24 removed non-generational mode through [JEP 490](https://openjdk.org/jeps/490). So in JDK 23 and later, `-XX:+UseZGC` enables generational ZGC; `-XX:+ZGenerational` is no longer needed. This does not mean ZGC is the JVM's default collector. In JDK 21 and 22, use the command above to explicitly enable generational mode.

Generational ZGC retains ZGC's low-pause goal while reclaiming young objects more frequently to reduce allocation-stall risk, lower heap requirements, and improve throughput.

## JEP 440: Record Patterns

Record patterns were first previewed in Java 19 through [JEP 405](https://openjdk.org/jeps/405), then previewed again in JDK 20 through [JEP 432](https://openjdk.org/jeps/432). They became a standard feature in JDK 21.

For details on record patterns, see [Java 20 New Features](./java20.md).

## JEP 441: Pattern Matching for `switch`

This enhancement allows patterns in `case` labels in Java `switch` expressions and statements. When a pattern matches, the corresponding case runs.

The `switch` expression below uses type patterns to match values.

```java
static String formatterPatternSwitch(Object obj) {
    return switch (obj) {
        case Integer i -> String.format("int %d", i);
        case Long l    -> String.format("long %d", l);
        case Double d  -> String.format("double %f", d);
        case String s  -> String.format("String %s", s);
        default        -> obj.toString();
    };
}
```

## JEP 442: Foreign Function & Memory API (Third Preview)

This API lets Java programs interoperate with code and data outside the Java runtime. It can call foreign functions (code outside the JVM) efficiently and access foreign memory (memory not managed by the JVM) safely, allowing Java programs to use native libraries and data without JNI's risks and fragility.

The Foreign Function and Memory API was incubated in Java 17 through [JEP 412](https://openjdk.java.net/jeps/412), incubated again in Java 18 through [JEP 419](https://openjdk.org/jeps/419), and previewed in Java 19 through [JEP 424](https://openjdk.org/jeps/424). It received a second preview in JDK 20 through [JEP 434](https://openjdk.org/jeps/434) and a third in JDK 21 through [JEP 442](https://openjdk.org/jeps/442).

For details on the Foreign Function and Memory API, see [Java 19 New Features](./java19.md).

## JEP 443: Unnamed Patterns and Variables (Preview)

Unnamed patterns and variables let you use an underscore (`_`) for variables that are not needed and components ignored during pattern matching. This can improve readability and maintainability.

Typical uses for unnamed variables include `try-with-resources` statements, exception variables in `catch` clauses, and `for` loops. Use `_` when the variable is not needed; it clearly marks the variable as unused.

```java
try (var _ = ScopedContext.acquire()) {
  // No use of acquired resource
}
try { ... }
catch (Exception _) { ... }
catch (Throwable _) { ... }

for (int i = 0, _ = runOnce(); i < arr.length; i++) {
  ...
}
```

An unnamed pattern is an unconditional pattern that does not bind a value. Unnamed pattern variables can appear in type patterns.

```java
if (r instanceof ColoredPoint(_, Color c)) { ... c ... }

switch (b) {
    case Box(RedBall _), Box(BlueBall _) -> processBox(b);
    case Box(GreenBall _)                -> stopProcessing();
    case Box(_)                          -> pickAnotherBox();
}
```

## JEP 444: Virtual Threads

Virtual threads are a major update and deserve close attention.

Virtual threads were previewed for the first time in Java 19 through [JEP 425](https://openjdk.org/jeps/425), then previewed again in JDK 20. They became a standard feature in JDK 21.

For details on virtual threads, see [Java 20 New Features](./java20.md).

## JEP 445: Unnamed Classes and Instance Main Methods (Preview)

This feature simplifies the `main` method declaration. The traditional declaration introduces many Java syntax concepts at once, which can make the language harder for beginners to learn.

Before this feature, you would declare `main` like this:

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

With the preview feature:

```java
class HelloWorld {
    void main() {
        System.out.println("Hello, World!");
    }
}
```

You can simplify it further because an unnamed class does not need a name:

```java
void main() {
   System.out.println("Hello, World!");
}
```

## References

- Java 21 String Templates: <https://howtodoinjava.com/java/java-string-templates/>
- Java 21 Sequenced Collections: <https://howtodoinjava.com/java/sequenced-collections/>
