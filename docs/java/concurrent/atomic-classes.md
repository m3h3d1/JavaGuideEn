---
title: Java Atomic Classes
description: An overview of the Java atomic classes in JUC, including AtomicInteger, AtomicLong, and AtomicReference, their CAS-based thread safety, use cases, and performance characteristics.
category: Java
tag:
  - Java Concurrency
head:
  - - meta
    - name: keywords
      content: Java atomic classes, AtomicInteger, AtomicLong, AtomicReference, CAS, JUC, atomic operations, usage
---

## Introduction to Atomic Classes

In programming, **atomic** means that an operation is indivisible: it either completes entirely or does not happen, and other threads cannot observe a partially completed operation.

Atomic classes provide operations with these atomicity guarantees.

The atomic classes in `java.util.concurrent.atomic` provide thread-safe operations on individual variables.

Atomic classes use compare-and-swap (CAS) to make their methods atomic, without traditional locks such as `synchronized` blocks or `ReentrantLock`.

This article introduces the atomic classes. For details about their implementation, see [CAS Explained](./cas.md).

![Overview of JUC atomic classes](https://oss.javaguide.cn/github/javaguide/java/JUC%E5%8E%9F%E5%AD%90%E7%B1%BB%E6%A6%82%E8%A7%88.png)

The atomic classes in JUC can be divided into four groups based on the data they operate on:

**1. Primitive types**

Atomically update primitive values:

- `AtomicInteger`: Atomic operations on integers.
- `AtomicLong`: Atomic operations on long values.
- `AtomicBoolean`: Atomic operations on boolean values.

**2. Arrays**

Atomically update individual array elements:

- `AtomicIntegerArray`: Atomic operations on integer arrays.
- `AtomicLongArray`: Atomic operations on long arrays.
- `AtomicReferenceArray`: Atomic operations on reference arrays.

**3. References**

- `AtomicReference`: Atomic operations on a reference.
- `AtomicMarkableReference`: Atomically updates a reference and a boolean mark. The mark can distinguish two application-defined states, but one bit cannot track an arbitrary number of version changes.
- `AtomicStampedReference`: Atomically updates a reference and an integer stamp. The stamp can help detect the ABA problem during CAS updates.

`AtomicStampedReference` uses an integer stamp, making it more suitable for detecting whether a reference changed multiple times between reads.

**4. Field updaters**

- `AtomicIntegerFieldUpdater`: Atomically updates an integer field.
- `AtomicLongFieldUpdater`: Atomically updates a long field.
- `AtomicReferenceFieldUpdater`: Atomically updates a reference field.

## Atomic Classes for Primitive Types

These classes atomically update primitive values:

- `AtomicInteger`: Atomic operations on integers.
- `AtomicLong`: Atomic operations on long values.
- `AtomicBoolean`: Atomic operations on boolean values.

These classes provide similar methods, so the examples use `AtomicInteger`.

**Common `AtomicInteger` methods:**

```java
public final int get() // Get the current value
public final int getAndSet(int newValue) // Get the current value and set a new one
public final int getAndIncrement() // Get the current value and increment it
public final int getAndDecrement() // Get the current value and decrement it
public final int getAndAdd(int delta) // Get the current value and add delta
boolean compareAndSet(int expect, int update) // Atomically set update if the current value equals expect
public final void lazySet(int newValue) // Set newValue with weaker ordering semantics than set; other threads may briefly observe the old value
```

**Example using `AtomicInteger`:**

```java
// Initialize an AtomicInteger with a value of 0
AtomicInteger atomicInt = new AtomicInteger(0);

// Get the current value and set it to 3
int tempValue = atomicInt.getAndSet(3);
System.out.println("tempValue: " + tempValue + "; atomicInt: " + atomicInt);

// Get the current value and increment it
tempValue = atomicInt.getAndIncrement();
System.out.println("tempValue: " + tempValue + "; atomicInt: " + atomicInt);

// Get the current value and add 5
tempValue = atomicInt.getAndAdd(5);
System.out.println("tempValue: " + tempValue + "; atomicInt: " + atomicInt);

// Set the value to 10 only if its current value is 9
boolean updateSuccess = atomicInt.compareAndSet(9, 10);
System.out.println("Update Success: " + updateSuccess + "; atomicInt: " + atomicInt);

// Get the current value
int currentValue = atomicInt.get();
System.out.println("Current value: " + currentValue);

// Set the value to 15 with lazySet
atomicInt.lazySet(15);
System.out.println("After lazySet, atomicInt: " + atomicInt);
```

Output:

```java
tempValue: 0; atomicInt: 3
tempValue: 3; atomicInt: 4
tempValue: 4; atomicInt: 9
Update Success: true; atomicInt: 10
Current value: 10
After lazySet, atomicInt: 15
```

## Atomic Classes for Arrays

These classes atomically update individual array elements:

- `AtomicIntegerArray`: Atomic operations on integer arrays.
- `AtomicLongArray`: Atomic operations on long arrays.
- `AtomicReferenceArray`: Atomic operations on reference arrays.

These classes provide similar methods, so the examples use `AtomicIntegerArray`.

**Common `AtomicIntegerArray` methods:**

```java
public final int get(int i) // Get the value at index i
public final int getAndSet(int i, int newValue) // Return the current value at index i and set it to newValue
public final int getAndIncrement(int i) // Return the value at index i and increment it
public final int getAndDecrement(int i) // Return the value at index i and decrement it
public final int getAndAdd(int i, int delta) // Return the value at index i and add delta
boolean compareAndSet(int i, int expect, int update) // Atomically set the value at index i if it equals expect
public final void lazySet(int i, int newValue) // Set index i to newValue with weaker ordering; other threads may briefly observe the old value
```

**Example using `AtomicIntegerArray`:**

```java
int[] nums = {1, 2, 3, 4, 5, 6};
// Create an AtomicIntegerArray
AtomicIntegerArray atomicArray = new AtomicIntegerArray(nums);

// Print the initial values in the AtomicIntegerArray
System.out.println("Initial values in AtomicIntegerArray:");
for (int j = 0; j < nums.length; j++) {
    System.out.print("Index " + j + ": " + atomicArray.get(j) + " ");
}

// Set index 0 to 2 and return its old value
int tempValue = atomicArray.getAndSet(0, 2);
System.out.println("\nAfter getAndSet(0, 2):");
System.out.println("Returned value: " + tempValue);
for (int j = 0; j < atomicArray.length(); j++) {
    System.out.print("Index " + j + ": " + atomicArray.get(j) + " ");
}

// Increment the value at index 0 and return its old value
tempValue = atomicArray.getAndIncrement(0);
System.out.println("\nAfter getAndIncrement(0):");
System.out.println("Returned value: " + tempValue);
for (int j = 0; j < atomicArray.length(); j++) {
    System.out.print("Index " + j + ": " + atomicArray.get(j) + " ");
}

// Add 5 to the value at index 0 and return its old value
tempValue = atomicArray.getAndAdd(0, 5);
System.out.println("\nAfter getAndAdd(0, 5):");
System.out.println("Returned value: " + tempValue);
for (int j = 0; j < atomicArray.length(); j++) {
    System.out.print("Index " + j + ": " + atomicArray.get(j) + " ");
}
```

Output:

```plain
Initial values in AtomicIntegerArray:
Index 0: 1 Index 1: 2 Index 2: 3 Index 3: 4 Index 4: 5 Index 5: 6
After getAndSet(0, 2):
Returned value: 1
Index 0: 2 Index 1: 2 Index 2: 3 Index 3: 4 Index 4: 5 Index 5: 6
After getAndIncrement(0):
Returned value: 2
Index 0: 3 Index 1: 2 Index 2: 3 Index 3: 4 Index 4: 5 Index 5: 6
After getAndAdd(0, 5):
Returned value: 3
Index 0: 8 Index 1: 2 Index 2: 3 Index 3: 4 Index 4: 5 Index 5: 6
```

## Atomic Classes for References

Atomic classes for primitive values update one variable. To atomically update multiple values together, use an atomic class for references.

- `AtomicReference`: Atomic operations on a reference.
- `AtomicStampedReference`: Atomically updates a reference and an integer stamp. The stamp can help detect the ABA problem during CAS updates.
- `AtomicMarkableReference`: Atomically updates a reference and a boolean mark. ~~It can also solve the ABA problem during CAS updates.~~

These classes provide similar methods, so the example uses `AtomicReference`.

**Example using `AtomicReference`:**

```java
// Person class
class Person {
    private String name;
    private int age;
    // Getters, setters, and toString omitted
}


// Create an AtomicReference with an initial value
AtomicReference<Person> ar = new AtomicReference<>(new Person("SnailClimb", 22));

// Print the initial value
System.out.println("Initial Person: " + ar.get().toString());

// Update the value
Person updatePerson = new Person("Daisy", 20);
ar.compareAndSet(ar.get(), updatePerson);

// Print the updated value
System.out.println("Updated Person: " + ar.get().toString());

// Try another update
Person anotherUpdatePerson = new Person("John", 30);
boolean isUpdated = ar.compareAndSet(updatePerson, anotherUpdatePerson);

// Print whether the update succeeded and the final value
System.out.println("Second Update Success: " + isUpdated);
System.out.println("Final Person: " + ar.get().toString());
```

Output:

```plain
Initial Person: Person{name='SnailClimb', age=22}
Updated Person: Person{name='Daisy', age=20}
Second Update Success: true
Final Person: Person{name='John', age=30}
```

**Example using `AtomicStampedReference`:**

```java
// Create an AtomicStampedReference with an initial value and stamp
AtomicStampedReference<String> asr = new AtomicStampedReference<>("SnailClimb", 1);

// Print the initial reference and stamp
int[] initialStamp = new int[1];
String initialRef = asr.get(initialStamp);
System.out.println("Initial Reference: " + initialRef + ", Initial Stamp: " + initialStamp[0]);

// Update the reference and stamp
int oldStamp = initialStamp[0];
String oldRef = initialRef;
String newRef = "Daisy";
int newStamp = oldStamp + 1;

boolean isUpdated = asr.compareAndSet(oldRef, newRef, oldStamp, newStamp);
System.out.println("Update Success: " + isUpdated);

// Print the updated reference and stamp
int[] updatedStamp = new int[1];
String updatedRef = asr.get(updatedStamp);
System.out.println("Updated Reference: " + updatedRef + ", Updated Stamp: " + updatedStamp[0]);

// Try to update with an incorrect stamp
boolean isUpdatedWithWrongStamp = asr.compareAndSet(newRef, "John", oldStamp, newStamp + 1);
System.out.println("Update with Wrong Stamp Success: " + isUpdatedWithWrongStamp);

// Print the final reference and stamp
int[] finalStamp = new int[1];
String finalRef = asr.get(finalStamp);
System.out.println("Final Reference: " + finalRef + ", Final Stamp: " + finalStamp[0]);
```

Output:

```plain
Initial Reference: SnailClimb, Initial Stamp: 1
Update Success: true
Updated Reference: Daisy, Updated Stamp: 2
Update with Wrong Stamp Success: false
Final Reference: Daisy, Final Stamp: 2
```

**Example using `AtomicMarkableReference`:**

```java
// Create an AtomicMarkableReference with an initial value and mark
AtomicMarkableReference<String> amr = new AtomicMarkableReference<>("SnailClimb", false);

// Print the initial reference and mark
boolean[] initialMark = new boolean[1];
String initialRef = amr.get(initialMark);
System.out.println("Initial Reference: " + initialRef + ", Initial Mark: " + initialMark[0]);

// Update the reference and mark
String oldRef = initialRef;
String newRef = "Daisy";
boolean oldMark = initialMark[0];
boolean newMark = true;

boolean isUpdated = amr.compareAndSet(oldRef, newRef, oldMark, newMark);
System.out.println("Update Success: " + isUpdated);

// Print the updated reference and mark
boolean[] updatedMark = new boolean[1];
String updatedRef = amr.get(updatedMark);
System.out.println("Updated Reference: " + updatedRef + ", Updated Mark: " + updatedMark[0]);

// Try to update with an incorrect mark
boolean isUpdatedWithWrongMark = amr.compareAndSet(newRef, "John", oldMark, !newMark);
System.out.println("Update with Wrong Mark Success: " + isUpdatedWithWrongMark);

// Print the final reference and mark
boolean[] finalMark = new boolean[1];
String finalRef = amr.get(finalMark);
System.out.println("Final Reference: " + finalRef + ", Final Mark: " + finalMark[0]);
```

Output:

```plain
Initial Reference: SnailClimb, Initial Mark: false
Update Success: true
Updated Reference: Daisy, Updated Mark: true
Update with Wrong Mark Success: false
Final Reference: Daisy, Final Mark: true
```

## Atomic Field Updaters

Use a field updater to atomically update a field in an object.

- `AtomicIntegerFieldUpdater`: Atomically updates an integer field.
- `AtomicLongFieldUpdater`: Atomically updates a long field.
- `AtomicReferenceFieldUpdater`: Atomically updates a reference field.

To update a field atomically: first, call the static `newUpdater()` method to create an updater for the target class and field. Second, make sure the field is `volatile` and matches the updater type (`int`, `long`, or a reference). The field cannot be `static` or `final`.

These updaters provide similar methods, so the example uses `AtomicIntegerFieldUpdater`.

**Example using `AtomicIntegerFieldUpdater`:**

```java
// Person class
class Person {
    private String name;
    // The field must be a volatile int for AtomicIntegerFieldUpdater
    volatile int age;
    // Getters, setters, and toString omitted
}

// Create an AtomicIntegerFieldUpdater
AtomicIntegerFieldUpdater<Person> ageUpdater = AtomicIntegerFieldUpdater.newUpdater(Person.class, "age");

// Create a Person object
Person person = new Person("SnailClimb", 22);

// Print the initial value
System.out.println("Initial Person: " + person);

// Update the age field
ageUpdater.incrementAndGet(person); // Increment by one
System.out.println("After Increment: " + person);

ageUpdater.addAndGet(person, 5); // Add 5
System.out.println("After Adding 5: " + person);

ageUpdater.compareAndSet(person, 28, 30); // Set to 30 if the current value is 28
System.out.println("After Compare and Set (28 to 30): " + person);

// Try to update with an incorrect expected value
boolean isUpdated = ageUpdater.compareAndSet(person, 28, 35); // This should fail
System.out.println("Compare and Set (28 to 35) Success: " + isUpdated);
System.out.println("Final Person: " + person);
```

Output:

```plain
Initial Person: Name: SnailClimb, Age: 22
After Increment: Name: SnailClimb, Age: 23
After Adding 5: Name: SnailClimb, Age: 28
After Compare and Set (28 to 30): Name: SnailClimb, Age: 30
Compare and Set (28 to 35) Success: false
Final Person: Name: SnailClimb, Age: 30
```

## Reference

- _The Art of Java Concurrency Programming_

<!-- @include: @article-footer.snippet.md -->
