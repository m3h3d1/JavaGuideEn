---
title: Common Java Collection Interview Questions (Part 1)
description: A guide to the Java Collections Framework, including Collection, List, Set, and Queue interfaces, common implementations such as ArrayList, LinkedList, and HashMap, and their underlying data structures and use cases.
category: Java
tag:
  - Java Collections
head:
  - - meta
    - name: keywords
      content: Java collections,Collection,List,Set,Queue,ArrayList,LinkedList,HashMap,collection framework,Java interview questions
---

<!-- markdownlint-disable MD024 -->

## Collections Overview

### Overview of Java Collections

Java collections, also called containers, are built around two main interfaces: `Collection`, which stores individual elements, and `Map`, which stores key-value pairs. The `Collection` interface has three main subinterfaces: `List`, `Set`, and `Queue`.

The diagram below shows the Java Collections Framework:

![Overview of the Java Collections Framework](https://oss.javaguide.cn/github/javaguide/java/collection/java-collection-hierarchy.png)

Note: The diagram shows only the main inheritance relationships. It omits abstract classes such as `AbstractList` and `NavigableSet`, along with other helper classes. See the source code for the full hierarchy.

### ⭐️ How do `List`, `Set`, `Queue`, and `Map` differ?

- `List` stores elements in order and allows duplicates.
- `Set` stores unique elements.
- `Queue` stores elements in an order determined by its queueing policy and allows duplicates.
- `Map` stores key-value pairs, like a mathematical function `y = f(x)`, where `x` is the key and `y` is the value. Keys are unique, while values may repeat. A `HashMap` does not guarantee an iteration order; implementations such as `LinkedHashMap` and `TreeMap` maintain an order using additional data structures, such as a doubly linked list or a red-black tree.

### Data Structures Used by the Collections Framework

First, let's look at collections under the `Collection` interface.

#### List

- `ArrayList`: an `Object[]` array. See [ArrayList Source Code](./arraylist-source-code.md) for details.
- `Vector`: an `Object[]` array.
- `LinkedList`: a doubly linked list. It was circular before JDK 1.7; the circular links were removed in JDK 1.7. See [LinkedList Source Code](./linkedlist-source-code.md) for details.

#### Set

- `HashSet` (unordered, unique): backed by a `HashMap`, which stores its elements.
- `LinkedHashSet`: a subclass of `HashSet` backed by a `LinkedHashMap`.
- `TreeSet` (ordered, unique): uses a red-black tree, a self-balancing binary search tree.

#### Queue

- `PriorityQueue`: implements a min-heap using an `Object[]` array. See [PriorityQueue Source Code](./priorityqueue-source-code.md) for details.
- `DelayQueue`: uses a `PriorityQueue`. See [DelayQueue Source Code](./delayqueue-source-code.md) for details.
- `ArrayDeque`: a resizable array that supports operations at both ends.

Now let's look at implementations of the `Map` interface.

#### Map

- `HashMap`: Before JDK 8, it used an array of linked lists, with the lists handling hash collisions through separate chaining. Starting in JDK 8, a bucket's list can become a red-black tree when it grows beyond a threshold (8 by default). Before treeifying a bucket, `HashMap` checks whether the table has at least 64 slots; if not, it resizes the table first. See [HashMap Source Code](./hashmap-source-code.md) for details, or start with [Hash Table Interview Questions](../../cs-basics/data-structure/hash-table.md).
- `LinkedHashMap`: extends `HashMap` and uses the same underlying array-and-bucket structure of lists or red-black trees. It also maintains a doubly linked list to preserve insertion order or, when configured, access order. See [LinkedHashMap Source Code](./linkedhashmap-source-code.md) and [LRU Cache Interview Questions](../../cs-basics/data-structure/lru-cache.md).
- `Hashtable`: uses an array of linked lists, with the lists handling hash collisions.
- `TreeMap`: uses a red-black tree, a self-balancing binary search tree.

### How Should You Choose a Collection?

Choose a collection based on the behavior you need. For example:

- Use a `Map` implementation when you need to look up values by key. Choose `TreeMap` when you need sorted keys, `HashMap` when you do not need ordering, and `ConcurrentHashMap` when you need thread-safe access.
- Use a `Collection` implementation when you only need to store elements. Choose a `Set` implementation such as `TreeSet` or `HashSet` when elements must be unique, or a `List` implementation such as `ArrayList` or `LinkedList` when they do not. Then choose an implementation based on its specific characteristics.

### Why Use Collections?

Arrays are a basic and common way to store values of the same type, but their fixed size can be inconvenient when the amount of data is unknown or changes over time. Java collections provide a more flexible way to store and work with multiple objects. The Collections Framework offers a range of interfaces and implementations, along with built-in operations and algorithms. Unlike arrays, many collections can grow or shrink dynamically and support generics for type safety.

## List

### ⭐️ How does `ArrayList` differ from an array?

`ArrayList` is backed by a resizable array, so it is more flexible than a regular fixed-size array:

- `ArrayList` grows as needed and can shrink its backing array with `trimToSize()`. An array's length cannot change after it is created.
- `ArrayList` supports generics for type safety; arrays do not provide the same kind of generic type checking.
- `ArrayList` stores objects, so primitive values need their wrapper types, such as `Integer` or `Double`. Arrays can store either primitive values or objects.
- `ArrayList` provides common operations such as insertion, removal, and iteration through methods like `add()` and `remove()`. A regular array has a fixed length and supports indexed access, but it cannot grow or shrink dynamically.
- You do not need to specify an initial size when creating an `ArrayList`; an array requires a length.

Here is a simple comparison:

`Array`：

```java
 // Create a String array
 String[] stringArr = new String[]{"hello", "world", "!"};
 // Change an array element
 stringArr[0] = "goodbye";
 System.out.println(Arrays.toString(stringArr));// [goodbye, world, !]
 // Remove an element by shifting the remaining elements
 for (int i = 0; i < stringArr.length - 1; i++) {
     stringArr[i] = stringArr[i + 1];
 }
 stringArr[stringArr.length - 1] = null;
 System.out.println(Arrays.toString(stringArr));// [world, !, null]
```

`ArrayList`：

```java
// Create a String ArrayList
 ArrayList<String> stringList = new ArrayList<>(Arrays.asList("hello", "world", "!"));
// Add an element to the ArrayList
 stringList.add("goodbye");
 System.out.println(stringList);// [hello, world, !, goodbye]
 // Change an ArrayList element
 stringList.set(0, "hi");
 System.out.println(stringList);// [hi, world, !, goodbye]
 // Remove an ArrayList element
 stringList.remove(0);
 System.out.println(stringList); // [world, !, goodbye]
```

### How do `ArrayList` and `Vector` differ? (For reference)

- `ArrayList` is a common `List` implementation backed by an `Object[]`. It is suitable for frequent lookups but is not thread-safe.
- `Vector` is a legacy `List` implementation backed by an `Object[]`. It is thread-safe.

### How do `Vector` and `Stack` differ? (For reference)

- Both `Vector` and `Stack` are thread-safe and use `synchronized` for synchronization.
- `Stack` extends `Vector` and provides last-in, first-out (LIFO) behavior, while `Vector` is a list.

As Java's concurrency libraries have evolved, `Vector` and `Stack` have become legacy choices. Prefer modern concurrent collections, such as `ConcurrentHashMap` and `CopyOnWriteArrayList`, or add synchronization when appropriate.

### Can `ArrayList` contain `null`?

`ArrayList` can store objects of any type, including `null`. However, avoid adding `null` unless it has a clear meaning. It can make code harder to maintain, and a missed null check can cause a `NullPointerException`.

Example:

```java
ArrayList<String> listOfStrings = new ArrayList<>();
listOfStrings.add(null);
listOfStrings.add("java");
System.out.println(listOfStrings);
```

Output:

```plain
[null, java]
```

### ⭐️ What are the time complexities of inserting into and removing from an `ArrayList`?

For insertion:

- Inserting at the beginning takes `O(n)` because every existing element must shift one position.
- Appending takes `O(1)` when there is spare capacity. If the backing array is full, it must first be copied into a larger array, which takes `O(n)`; adding the element afterward takes `O(1)`.
- Inserting at a specified index takes `O(n)` because the elements after that index must shift right. On average, about half of the elements move.

For removal:

- Removing the first element takes `O(n)` because every remaining element must shift one position.
- Removing the last element takes `O(1)`.
- Removing an element at a specified index takes `O(n)` because later elements must shift left to fill the gap. On average, about half of the elements move.

Here is a simple example:

```java
// The backing array has a capacity of 10 and currently stores 7 elements
+---+---+---+---+---+---+---+---+---+---+
| 1 | 2 | 3 | 4 | 5 | 6 | 7 |   |   |   |
+---+---+---+---+---+---+---+---+---+---+
  0   1   2   3   4   5   6   7   8   9
// Insert 8 at index 1; all later elements shift right by one position
+---+---+---+---+---+---+---+---+---+---+
| 1 | 8 | 2 | 3 | 4 | 5 | 6 | 7 |   |   |
+---+---+---+---+---+---+---+---+---+---+
  0   1   2   3   4   5   6   7   8   9
// Remove the element at index 1; all later elements shift left by one position
+---+---+---+---+---+---+---+---+---+---+
| 1 | 2 | 3 | 4 | 5 | 6 | 7 |   |   |   |
+---+---+---+---+---+---+---+---+---+---+
  0   1   2   3   4   5   6   7   8   9
```

### ⭐️ What are the time complexities of inserting into and removing from a `LinkedList`?

- Inserting or removing at the head takes `O(1)` because it only requires updating the head pointer.
- Inserting or removing at the tail takes `O(1)` because it only requires updating the tail pointer.
- Inserting or removing at a specified index requires first locating that position and then updating pointers. Since traversal can start from the closer end, it visits about `n/4` elements on average, but the time complexity is still `O(n)`.

For example, to remove node 9, the list must first be traversed to find it. The node pointers are then updated. See [LinkedList Source Code](https://javaguide.cn/java/collection/linkedlist-source-code.html) for the implementation.

![How the unlink method works](https://oss.javaguide.cn/github/javaguide/java/collection/linkedlist-unlink.jpg)

### Why doesn't `LinkedList` implement `RandomAccess`?

`RandomAccess` is a marker interface indicating that a class supports fast indexed access. A `LinkedList` is backed by linked nodes that are not stored in contiguous memory, so it must follow pointers to locate an element. It does not support fast random access and therefore does not implement `RandomAccess`.

### ⭐️ How do `ArrayList` and `LinkedList` differ?

- **Thread safety:** Neither `ArrayList` nor `LinkedList` is synchronized, so neither is thread-safe.
- **Underlying data structure:** `ArrayList` uses an **`Object` array**. `LinkedList` uses a **doubly linked list**. The list was circular before JDK 1.7; the circular links were removed in JDK 1.7. The difference between doubly linked and doubly circular linked lists is explained below.
- **How position affects insertion and removal:**
  - `ArrayList` stores elements in an array, so the cost depends on where elements are inserted or removed. Appending with `add(E e)` takes `O(1)` when there is spare capacity. Inserting or removing at index `i` takes `O(n)` because later elements must shift.
  - `LinkedList` stores elements as linked nodes, so insertion and removal at either end take `O(1)` (`addFirst()`, `addLast()`, `removeFirst()`, and `removeLast()`). Operations at index `i` take `O(n)` because the list must first be traversed to that position.
- **Fast random access:** `ArrayList` implements `RandomAccess` and supports efficient indexed access through `get(int index)`. `LinkedList` does not.
- **Memory use:** `ArrayList` may reserve unused capacity at the end of its backing array. Each `LinkedList` node uses extra space for its data and links to its previous and next nodes.

In many projects, `ArrayList` can replace `LinkedList` and often performs better. Josh Bloch, who wrote `LinkedList`, has even said that he never uses it.

![](https://oss.javaguide.cn/github/javaguide/redisimage-20220412110853807.png)

Do not assume that `LinkedList` is always the best choice for frequent insertions and removals. Only operations at the head or tail are close to `O(1)`; most other insertions and removals take `O(n)` because the target node must first be found.

#### More on Doubly Linked and Doubly Circular Linked Lists

**Doubly linked list:** Each node has two pointers: `prev` points to the previous node, and `next` points to the next node.

![Doubly linked list](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/bidirectional-linkedlist.png)

**Doubly circular linked list:** The last node's `next` points to the head, and the head's `prev` points to the last node, forming a loop.

![Doubly circular linked list](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/bidirectional-circular-linkedlist.png)

#### More on the `RandomAccess` Interface

```java
public interface RandomAccess {
}
```

The source shows that `RandomAccess` does not define any methods. It is a marker interface that identifies classes with fast random access.

The `binarySearch()` method checks whether the supplied list implements `RandomAccess`. If it does, it calls `indexedBinarySearch()`; otherwise, it calls `iteratorBinarySearch()`.

```java
    public static <T>
    int binarySearch(List<? extends Comparable<? super T>> list, T key) {
        if (list instanceof RandomAccess || list.size()<BINARYSEARCH_THRESHOLD)
            return Collections.indexedBinarySearch(list, key);
        else
            return Collections.iteratorBinarySearch(list, key);
    }
```

`ArrayList` implements `RandomAccess`, while `LinkedList` does not. This reflects their underlying data structures: arrays support indexed access in `O(1)` time, while linked lists must traverse to the requested position in `O(n)` time. Implementing `RandomAccess` marks the `ArrayList` as suitable for fast random access; it does not give the class that capability.

### ⭐️ How does `ArrayList` grow?

See [How `ArrayList` Resizes](./arraylist-source-code.md#how-arraylist-resizes) for details.

### ⭐️ What are fail-fast and fail-safe behaviors in collections?

`fail-fast` and `fail-safe` describe two different approaches to handling concurrent modifications in the Java Collections Framework.

The following description of `fail-fast` and `fail-safe` is adapted from an article on Medium:

> Fail-fast systems are designed to immediately stop functioning upon encountering an unexpected condition. This immediate failure helps to catch errors early, making debugging more straightforward.

Fail-fast behavior detects an unexpected condition and stops immediately. Catching errors early can make debugging easier and help prevent failures from cascading.

Most collections in `java.util`, such as `ArrayList` and `HashMap`, are not thread-safe. Many of their iterators use a `modCount` field to track structural changes. During iteration, the iterator compares its expected modification count, `expectedModCount`, with `modCount`. If they differ, it detects an unexpected modification and fails fast instead of continuing with potentially inconsistent state.

**Example: `ArrayList` fail-fast behavior**

```java
     // ArrayList is not thread-safe and uses fail-fast iterators
      List<Integer> list = new ArrayList<>();
      CountDownLatch latch = new CountDownLatch(2);

      for (int i = 0; i < 5; i++) {
          list.add(i);
      }
      System.out.println("Initial list: " + list);

      Thread t1 = new Thread(() -> {
          try {
              for (Integer i : list) {
                  System.out.println("Iterator Thread (t1) sees: " + i);
                  Thread.sleep(100);
              }
          } catch (ConcurrentModificationException e) {
              System.err.println("!!! Iterator Thread (t1) caught ConcurrentModificationException as expected.");
          } catch (InterruptedException e) {
              e.printStackTrace();
          } finally {
              latch.countDown();
          }
      });

      Thread t2 = new Thread(() -> {
          try {
              Thread.sleep(50);
              System.out.println("-> Modifier Thread (t2) is removing element 1...");
              list.remove(Integer.valueOf(1));
              System.out.println("-> Modifier Thread (t2) finished removal.");
          } catch (InterruptedException e) {
              e.printStackTrace();
          } finally {
              latch.countDown();
          }
      });

      t1.start();
      t2.start();
      latch.await();

      System.out.println("Final list state: " + list);
```

Output:

```
Initial list: [0, 1, 2, 3, 4]
Iterator Thread (t1) sees: 0
-> Modifier Thread (t2) is removing element 1...
-> Modifier Thread (t2) finished removal.
!!! Iterator Thread (t1) caught ConcurrentModificationException as expected.
Final list state: [0, 2, 3, 4]
```

After thread `t2` modifies the list, thread `t1` throws a `ConcurrentModificationException` on its next iteration. The `ArrayList` iterator checks whether `modCount` has changed on each call to `next()`. If the collection was modified outside the iterator, iteration stops rather than continuing with potentially inconsistent data.

The iterator's `next()` method, which a `for-each` loop uses internally, calls `checkForComodification()` to compare modification counts:

```java
 public E next() {
			// Check for concurrent modification
            checkForComodification();
            //......
            // Return the next element
            return (E) elementData[lastRet = i];
        }

final void checkForComodification() {
		// Throw ConcurrentModificationException if the modification counts differ
            if (modCount != expectedModCount)
                throw new ConcurrentModificationException();
        }

```

`Fail-safe` behavior aims to continue safely despite changes. It is useful in situations where the collection may be modified during iteration:

> Fail-safe systems take a different approach, aiming to recover and continue even in the face of unexpected conditions. This makes them particularly suited for uncertain or volatile environments.

This idea is used in concurrent collections. A common example is `CopyOnWriteArrayList`: each write copies the array, applies the change to the copy, and then points the list to the new array. Iterators keep using the snapshot they started with, so concurrent writes do not disrupt iteration. The tradeoff is that an iterator does not see changes made after its snapshot was created.

![](https://oss.javaguide.cn/github/javaguide/java/collection/fail-fast-and-fail-safe-copyonwritearraylist.png)

The following code shows the core of this behavior in `CopyOnWriteArrayList`. It gets the current array with `getArray()`, copies it with `Arrays.copyOf()`, adds the element to the copy, and then updates the `array` reference:

```java
public boolean add(E e) {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            // Get the current array
            Object[] elements = getArray();
            int len = elements.length;
            // Copy the array to create a snapshot
            Object[] newElements = Arrays.copyOf(elements, len + 1);
            // Add the element
            newElements[len] = e;
            // Point array to the new array
            setArray(newElements);
            return true;
        } finally {
            lock.unlock();
        }
    }
```

## Set

### How do `Comparable` and `Comparator` differ?

`Comparable` and `Comparator` are Java interfaces used to compare and sort objects:

- `Comparable` is in `java.lang` and defines `compareTo(Object obj)`.
- `Comparator` is in `java.util` and defines `compare(Object obj1, Object obj2)`.

To define a custom order, implement `compareTo()` or provide a `Comparator`. If you need multiple orderings—for example, sorting a `Song` by title or by artist—keep one natural ordering in `compareTo()` and define additional orderings with separate `Comparator`s. Use the two-argument form of `Collections.sort()` to supply a comparator.

#### Custom Ordering with `Comparator`

```java
ArrayList<Integer> arrayList = new ArrayList<Integer>();
arrayList.add(-1);
arrayList.add(3);
arrayList.add(3);
arrayList.add(-5);
arrayList.add(7);
arrayList.add(4);
arrayList.add(-9);
arrayList.add(-7);
System.out.println("Original list:");
System.out.println(arrayList);
// void reverse(List list): reverse the list
Collections.reverse(arrayList);
System.out.println("Collections.reverse(arrayList):");
System.out.println(arrayList);

// void sort(List list): sort in ascending natural order
Collections.sort(arrayList);
System.out.println("Collections.sort(arrayList):");
System.out.println(arrayList);
// Use a custom ordering
Collections.sort(arrayList, new Comparator<Integer>() {
    @Override
    public int compare(Integer o1, Integer o2) {
        return o2.compareTo(o1);
    }
});
System.out.println("After custom sorting:");
System.out.println(arrayList);
```

Output:

```plain
Original list:
[-1, 3, 3, -5, 7, 4, -9, -7]
Collections.reverse(arrayList):
[-7, -9, 4, 7, -5, 3, 3, -1]
Collections.sort(arrayList):
[-9, -7, -5, -1, 3, 3, 4, 7]
After custom sorting:
[7, 4, 3, 3, -1, -5, -7, -9]
```

#### Sort by Age by Implementing `compareTo()`

```java
// Person does not implement Comparable, so implement it to define the ordering required by TreeMap.
// String already implements Comparable, as do types such as Integer, so no extra implementation is needed for them.
public  class Person implements Comparable<Person> {
    private String name;
    private int age;

    public Person(String name, int age) {
        super();
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    /**
     * Sort by age by overriding compareTo.
     */
    @Override
    public int compareTo(Person o) {
        if (this.age > o.getAge()) {
            return 1;
        }
        if (this.age < o.getAge()) {
            return -1;
        }
        return 0;
    }
}

```

```java
    public static void main(String[] args) {
        TreeMap<Person, String> pdata = new TreeMap<Person, String>();
        pdata.put(new Person("张三", 30), "zhangsan");
        pdata.put(new Person("李四", 20), "lisi");
        pdata.put(new Person("王五", 10), "wangwu");
        pdata.put(new Person("小红", 5), "xiaohong");
        // Get each key and its corresponding value
        Set<Person> keys = pdata.keySet();
        for (Person key : keys) {
            System.out.println(key.getAge() + "-" + key.getName());

        }
    }
```

Output：

```plain
5-小红
10-王五
20-李四
30-张三
```

### What Do Unordered and Unique Mean?

- Unordered does not mean random. In a hash-based collection, an element's position in the backing array is determined by its hash value, not by the order in which it was added.
- Unique means that the collection treats elements as equal according to `equals()`. For custom types, override both `equals()` and `hashCode()` consistently.

### How do `HashSet`, `LinkedHashSet`, and `TreeSet` differ?

- All three implement `Set`, keep elements unique, and are not thread-safe.
- Their main difference is the underlying data structure. `HashSet` uses a hash table backed by `HashMap`. `LinkedHashSet` combines a hash table with a linked list and preserves insertion order. `TreeSet` uses a red-black tree to keep elements sorted, either by their natural order or by a custom comparator.
- Choose `HashSet` when element order does not matter, `LinkedHashSet` when you want insertion order preserved, and `TreeSet` when you need sorted elements.

## Queue

### How do `Queue` and `Deque` differ?

`Queue` is a single-ended queue: elements are added at one end and removed from the other. Most implementations follow the **first-in, first-out (FIFO)** rule.

`Queue` extends `Collection`. Its methods fall into two groups based on how they handle failure, such as when a capacity limit prevents an operation: one group throws an exception, while the other returns a special value.

| `Queue` operation    | Throws an exception | Returns a special value |
| -------------------- | ------------------- | ----------------------- |
| Add at the tail      | `add(E e)`          | `offer(E e)`            |
| Remove from the head | `remove()`          | `poll()`                |
| Examine the head     | `element()`         | `peek()`                |

`Deque` is a double-ended queue that allows insertion and removal at both ends.

`Deque` extends `Queue` with methods for adding and removing elements at either end. These methods also fall into two groups based on how they handle failure:

| `Deque` operation    | Throws an exception | Returns a special value |
| -------------------- | ------------------- | ----------------------- |
| Add at the head      | `addFirst(E e)`     | `offerFirst(E e)`       |
| Add at the tail      | `addLast(E e)`      | `offerLast(E e)`        |
| Remove from the head | `removeFirst()`     | `pollFirst()`           |
| Remove from the tail | `removeLast()`      | `pollLast()`            |
| Examine the head     | `getFirst()`        | `peekFirst()`           |
| Examine the tail     | `getLast()`         | `peekLast()`            |

`Deque` also provides methods such as `push()` and `pop()` that can be used to implement a stack.

### How do `ArrayDeque` and `LinkedList` differ?

Both `ArrayDeque` and `LinkedList` implement `Deque`. How do they differ?

- `ArrayDeque` uses a resizable array and two indices, while `LinkedList` uses linked nodes.

- `ArrayDeque` does not allow `null` elements; `LinkedList` does.

- `ArrayDeque` was introduced in JDK 1.6, while `LinkedList` has been available since JDK 1.2.

- `ArrayDeque` may need to resize, but insertion is still `O(1)` on an amortized basis. `LinkedList` does not resize, but each insertion allocates a new node, which usually has higher overhead.

For better performance, prefer `ArrayDeque` over `LinkedList` when implementing a queue. `ArrayDeque` can also be used as a stack.

### What Is `PriorityQueue`?

`PriorityQueue` was introduced in JDK 1.5. Unlike a regular queue, it removes elements according to priority, with the highest-priority element removed first.

Key points:

- `PriorityQueue` uses a binary heap backed by a resizable array.
- It inserts elements and removes the heap's root in `O(log n)` time by sifting elements up or down.
- It is not thread-safe and does not allow `null` elements. Without a `Comparator`, elements must implement `Comparable`; with a `Comparator`, the elements must be comparable by that comparator.
- It is a min-heap by default. Pass a `Comparator` to the constructor to define a different priority order.

In interviews, `PriorityQueue` often appears in coding problems such as heap sort, finding the Kth-largest element, and traversing a weighted graph. Make sure you are comfortable using it.

For a review of heaps and common Top K patterns, see [Heaps](../../cs-basics/data-structure/heap.md) and [Top K Interview Questions](../../cs-basics/algorithms/top-k.md).

### What Is a `BlockingQueue`?

`BlockingQueue` is an interface that extends `Queue`. Its insertion and removal methods provide four ways to handle failure: throw an exception, return a special value, block indefinitely, or wait for a specified time. For example, `take()` blocks while the queue is empty, and `put()` blocks when a bounded queue is full.

```java
public interface BlockingQueue<E> extends Queue<E> {
  // ...
}
```

`BlockingQueue` is commonly used in the producer-consumer pattern: producer threads add data to the queue, and consumer threads retrieve and process it.

![BlockingQueue](https://oss.javaguide.cn/github/javaguide/java/collection/blocking-queue.png)

### What Are Some `BlockingQueue` Implementations?

![Implementations of BlockingQueue](https://oss.javaguide.cn/github/javaguide/java/collection/blocking-queue-hierarchy.png)

Common `BlockingQueue` implementations include:

1. `ArrayBlockingQueue`: a bounded array-based blocking queue. Specify its capacity when creating it. It supports both fair and non-fair lock acquisition.
2. `LinkedBlockingQueue`: an optionally bounded blocking queue backed by a singly linked list. You can specify its capacity; otherwise, it defaults to `Integer.MAX_VALUE`. Unlike `ArrayBlockingQueue`, it only supports non-fair lock acquisition.
3. `PriorityBlockingQueue`: an unbounded blocking queue that orders elements by priority. Elements must implement `Comparable` or be comparable with a `Comparator` passed to the constructor. It does not allow `null` elements.
4. `SynchronousQueue`: a blocking queue that stores no elements. Each insertion waits for a corresponding removal, and each removal waits for an insertion. It is commonly used to transfer data directly between threads.
5. `DelayQueue`: a queue whose elements can only be removed after their delay has expired.
6. ……

These queues are not used often in everyday development, so a basic understanding is usually enough.

### ⭐️ How do `ArrayBlockingQueue` and `LinkedBlockingQueue` differ?

`ArrayBlockingQueue` and `LinkedBlockingQueue` are two common, thread-safe blocking queues in Java. They differ in several ways:

- **Implementation:** `ArrayBlockingQueue` uses an array; `LinkedBlockingQueue` uses a linked list.
- **Capacity:** `ArrayBlockingQueue` is bounded, and you must specify its capacity when creating it. `LinkedBlockingQueue` defaults to a capacity of `Integer.MAX_VALUE`, but you can specify a smaller capacity to make it bounded.
- **Locks:** `ArrayBlockingQueue` uses one lock for both producers and consumers. `LinkedBlockingQueue` uses separate `putLock` and `takeLock` locks, reducing contention between producers and consumers.
- **Memory use:** `ArrayBlockingQueue` allocates its array when it is created, so it reserves capacity up front. `LinkedBlockingQueue` allocates nodes as elements are added, so its memory use grows with the queue.

## Further Reading on Data Structures

Java collection interviews often cover the underlying data structures. These guides are useful to review alongside this article:

- [Linear Data Structures](../../cs-basics/data-structure/linear-data-structure.md): Understand arrays, linked lists, stacks, queues, `ArrayList`, `LinkedList`, and `ArrayDeque`.
- [Hash Table Interview Questions](../../cs-basics/data-structure/hash-table.md): Review hash collisions, resizing, and the ideas behind `HashMap`.
- [Red-Black Trees](../../cs-basics/data-structure/red-black-tree.md): Learn about the trees used by `TreeMap`, `TreeSet`, and treeified `HashMap` buckets.
- [Heaps](../../cs-basics/data-structure/heap.md): Learn about the data structure behind `PriorityQueue` and common Top K problems.

<!-- @include: @article-footer.snippet.md -->
