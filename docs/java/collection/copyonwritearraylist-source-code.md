---
title: CopyOnWriteArrayList Source Code Analysis
description: An in-depth look at CopyOnWriteArrayList, its copy-on-write mechanism, read-heavy use cases, snapshot consistency, and memory costs.
category: Java
tag:
  - Java Collections
head:
  - - meta
    - name: keywords
      content: CopyOnWriteArrayList source code, copy-on-write, thread-safe list, read-heavy workloads, concurrent collections, snapshot consistency
---

## Introduction to CopyOnWriteArrayList

Before JDK 1.5, thread-safe `List` options included `Vector` and the synchronized wrapper returned by `Collections.synchronizedList()`. `Vector` is a legacy collection. Most of its operations are synchronized, which protects the entire collection with one lock and can limit performance.

JDK 1.5 introduced the `java.util.concurrent` (JUC) package, which provides many thread-safe containers designed for concurrent use. One thread-safe `List` implementation in the package is `CopyOnWriteArrayList`. See [A Guide to Java Concurrent Collections](https://javaguide.cn/java/concurrent/java-concurrent-collections.html) for an overview of other common containers.

### What Makes CopyOnWriteArrayList Useful?

In many applications, reads are much more frequent than writes. Since reads do not modify the data, locking on every read can waste resources. Multiple threads can safely read the list's internal data at the same time.

This resembles the idea behind `ReentrantReadWriteLock`: reads can run together, while writes exclude other reads and writes. `CopyOnWriteArrayList` takes this further: reads do not acquire a lock, and writes do not block reads. Only concurrent writes contend with one another, which can improve read performance.

`CopyOnWriteArrayList` is thread-safe because it uses a **copy-on-write (COW)** strategy, as its name suggests.

### What Is Copy-on-Write?

“Copy-on-write,” or COW, means copying data when it is modified.

The following is a concise description of copy-on-write:

> Copy-on-write is an optimization strategy in which multiple callers share a pointer to the same resource, such as data in memory or on disk. When a caller tries to modify the resource, the system creates a private copy for that caller while the others continue to see the original. If nobody modifies the resource, no copy is made, so callers that only read can share it.

In `CopyOnWriteArrayList`, operations such as `add`, `set`, and `remove` do not modify the original array. They copy the array, apply the change to the copy, and then publish the new array. A write therefore does not affect readers already using the old array.

Copy-on-write works well for concurrent workloads with many reads and few writes.

Copy-on-write also has trade-offs:

1. **Memory use:** Every write copies the existing data, requiring additional memory. Large lists can put pressure on available memory.
2. **Write cost:** A write copies the array before updating it, so frequent writes can hurt performance.
3. **Snapshot behavior:** An iterator retains the array snapshot from its creation time; later changes are not visible through that iterator.
4. ……

## CopyOnWriteArrayList Source Code

The following walkthrough uses JDK 8 to examine the core implementation of `CopyOnWriteArrayList`.

The class is declared as follows:

```java
public class CopyOnWriteArrayList<E>
extends Object
implements List<E>, RandomAccess, Cloneable, Serializable
{
  //...
}
```

`CopyOnWriteArrayList` implements these interfaces:

- `List`: A list that supports operations such as adding, removing, and searching for elements, as well as indexed access.
- `RandomAccess`: A marker interface indicating that indexed access is fast.
- `Cloneable`: Indicates that the object can be copied with `clone()`. `CopyOnWriteArrayList#clone()` returns a shallow copy.
- `Serializable`: Indicates that the object can be serialized to a byte stream for storage or network transfer.

![CopyOnWriteArrayList class diagram](https://oss.javaguide.cn/github/javaguide/java/collection/copyonwritearraylist-class-diagram.png)

### Initialization

`CopyOnWriteArrayList` has one no-argument constructor and two constructors that accept arguments.

```java
// Create an empty CopyOnWriteArrayList
public CopyOnWriteArrayList() {
    setArray(new Object[0]);
}

// Create a CopyOnWriteArrayList containing the elements in the collection's iteration order
public CopyOnWriteArrayList(Collection<? extends E> c) {
    Object[] elements;
    if (c.getClass() == CopyOnWriteArrayList.class)
        elements = ((CopyOnWriteArrayList<?>)c).getArray();
    else {
        elements = c.toArray();
        // c.toArray might (incorrectly) not return Object[] (see 6260652)
        if (elements.getClass() != Object[].class)
            elements = Arrays.copyOf(elements, elements.length, Object[].class);
    }
    setArray(elements);
}

// Create a list containing a copy of the specified array
public CopyOnWriteArrayList(E[] toCopyIn) {
    setArray(Arrays.copyOf(toCopyIn, toCopyIn.length, Object[].class));
}
```

### Adding Elements

`CopyOnWriteArrayList` provides three `add()` variants:

- `add(E e)`: Appends an element to the list.
- `add(int index, E element)`: Inserts an element at the specified index.
- `addIfAbsent(E e)`: Adds the element only if it is not already present. Returns `true` if the element was added.

Here is how `add(E e)` works:

```java
// Append an element to the CopyOnWriteArrayList
public boolean add(E e) {
    final ReentrantLock lock = this.lock;
    // Acquire the lock
    lock.lock();
    try {
        // Get the current array
        Object[] elements = getArray();
        // Length of the current array
        int len = elements.length;
        // Copy the current elements into a new array with one extra slot
        Object[] newElements = Arrays.copyOf(elements, len + 1);
        // Add the element at the end of the new array
        newElements[len] = e;
        // Point array to the new array
        setArray(newElements);
        return true;
    } finally {
        // Release the lock
        lock.unlock();
    }
}
```

The source shows that:

- `add` uses a `ReentrantLock` to prevent concurrent writes. The lock field is `final`, and the `finally` block ensures that the lock is released.
- Writes copy the backing array, add the element to the copy, and then replace the old array. This is the copy-on-write strategy that makes `CopyOnWriteArrayList` thread-safe.
- Each write copies the backing array with `Arrays.copyOf`, which takes O(n) time and extra memory. This makes the list a better fit for read-heavy workloads with infrequent writes and enough memory.
- Unlike `ArrayList`, `CopyOnWriteArrayList` does not grow its backing array with a `grow()` method.

> `Arrays.copyOf` takes O(n) time, where n is the length of the array being copied. It creates a new array, copies the source elements, and returns the new array. Although it uses low-level copy operations, copying large arrays still requires time and memory, so avoid doing it too often.

### Reading Elements

Reads use the internal `array`, which is not modified in place. They therefore need no synchronization or lock, allowing multiple threads to read the list at the same time.

```java
// Backing array; access it only through getArray and setArray
private transient volatile Object[] array;

public E get(int index) {
    return get(getArray(), index);
}

final Object[] getArray() {
    return array;
}

private E get(Object[] a, int index) {
    return (E) a[index];
}
```

The `get` method may return a value from an older snapshot.

`get(int index)` has two steps:

1. Get the current array reference with `getArray()`.
2. Read the element at the specified index from that array.

Because this process does not acquire a lock, the following can happen during concurrent access:

1. Thread 1 calls `get(int index)` and obtains the current `array` reference through `getArray()`.
2. Thread 2 calls a modifying method such as `add`, `set`, or `remove`, which updates the `array` reference through `setArray`.
3. Thread 1 still reads from the old array.

### Getting the Number of Elements

```java
public int size() {
    return getArray().length;
}
```

Each copied `array` contains exactly enough space for its elements; unlike `ArrayList`, it does not reserve extra capacity. The array length is therefore the list size, so `size()` can return it directly.

### Removing Elements

`CopyOnWriteArrayList` provides four removal methods:

1. `remove(int index)`: Removes the element at the specified index and shifts later elements one position to the left.
2. `boolean remove(Object o)`: Removes the first matching element, or returns `false` if none is found.
3. `boolean removeAll(Collection<?> c)`: Removes all elements that are also in the specified collection.
4. `void clear()`: Removes all elements.

Here is how `remove(int index)` works:

```java
public E remove(int index) {
    // Get the reentrant lock
    final ReentrantLock lock = this.lock;
    // Acquire the lock
    lock.lock();
    try {
         // Get the current array
        Object[] elements = getArray();
        // Get the current array length
        int len = elements.length;
        // Get the element at the specified index
        E oldValue = get(elements, index);
        int numMoved = len - index - 1;
        // Check whether this is the last element
        if (numMoved == 0)
             // Copy all preceding elements into a new array
            setArray(Arrays.copyOf(elements, len - 1));
        else {
            // Copy the elements before and after index into a new array
            // The new array is one element shorter
            Object[] newElements = new Object[len - 1];
            System.arraycopy(elements, 0, newElements, 0, index);
            System.arraycopy(elements, index + 1, newElements, index,
                             numMoved);
            // Point array to the new array
            setArray(newElements);
        }
        return oldValue;
    } finally {
         // Release the lock
        lock.unlock();
    }
}
```

### Checking Whether an Element Exists

`CopyOnWriteArrayList` provides two methods for checking whether elements are in the list:

- `contains(Object o)`: Checks whether the list contains the specified element.
- `containsAll(Collection<?> c)`: Checks whether the list contains every element in the specified collection.

```java
// Check whether the list contains the specified element
public boolean contains(Object o) {
    // Get the current array
    Object[] elements = getArray();
    // Search for the element; a non-negative index means it was found
    return indexOf(o, elements, 0, elements.length) >= 0;
}

// Check whether the list contains every element in the collection
public boolean containsAll(Collection<?> c) {
    // Get the current array
    Object[] elements = getArray();
    // Get the array length
    int len = elements.length;
    // Iterate over the specified collection
    for (Object e : c) {
        // Return false as soon as an element is not found
        if (indexOf(e, elements, 0, len) < 0)
            return false;
    }
    // All elements were found, or the collection was empty
    return true;
}
```

## Common CopyOnWriteArrayList Operations

Example:

```java
// Create a CopyOnWriteArrayList
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();

// Add elements to the list
list.add("Java");
list.add("Python");
list.add("C++");
System.out.println("Initial list: " + list);

// Get the element at the specified index
System.out.println("Second element: " + list.get(1));

// Remove the specified element
boolean result = list.remove("C++");
System.out.println("Removed: " + result);
System.out.println("List after removal: " + list);

// Update the element at the specified index
list.set(1, "Golang");
System.out.println("Updated list: " + list);

// Insert an element at the specified index
list.add(0, "PHP");
System.out.println("List after insertion: " + list);

// Get the list size
System.out.println("List size: " + list.size());

// Remove all elements that also appear in the specified collection
result = list.removeAll(List.of("Java", "Golang"));
System.out.println("Removed any elements: " + result);
System.out.println("List after removing elements: " + list);

// Clear the list
list.clear();
System.out.println("List after clearing: " + list);
```

Output:

```plain
Updated list: [Java, Golang]
List after insertion: [PHP, Java, Golang]
List size: 3
Removed any elements: true
List after removing elements: [PHP]
List after clearing: []
```

<!-- @include: @article-footer.snippet.md -->
