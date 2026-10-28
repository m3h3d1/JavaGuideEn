---
title: Common Java Collection Interview Questions (Part 2)
description: Common Java collection interview questions about HashMap, red-black tree conversion, hash collisions, ConcurrentHashMap thread safety, and how it differs from Hashtable.
category: Java
tag:
  - Java Collections
head:
  - - meta
    - name: keywords
      content: HashMap,ConcurrentHashMap,Hashtable,red-black tree,hash collisions,thread safety,collection interview questions
---

<!-- @include: @article-header.snippet.md -->

## Maps

### ⭐️ How do `HashMap` and `Hashtable` differ?

- **Thread safety:** `HashMap` is not thread-safe. `Hashtable` is thread-safe because most of its methods are synchronized. Use `ConcurrentHashMap` when you need a concurrent map.
- **Performance:** `HashMap` is generally faster because it does not synchronize its methods. `Hashtable` is a legacy class and should not be used in new code.
- **`null` keys and values:** `HashMap` allows one `null` key and multiple `null` values. `Hashtable` does not allow `null` keys or values and throws a `NullPointerException` if you try to add one.
- **Initial capacity and resizing:** Without an initial capacity, `Hashtable` starts with a capacity of 11 and grows to `2n + 1`; `HashMap` starts with a capacity of 16 and doubles its capacity when it resizes. If you provide an initial capacity, `Hashtable` uses it directly, while `HashMap` rounds it up to a power of two. The `tableSizeFor()` method, shown below, does this. The reason for using powers of two is explained later.
- **Underlying data structure:** Starting with JDK 8, a `HashMap` bucket can be converted from a linked list to a red-black tree when its length exceeds a threshold (8 by default). Before doing so, `HashMap` checks whether the table has at least 64 slots; if not, it resizes the table first. This can reduce lookup time. `Hashtable` does not use this mechanism.
- **Hash function:** `HashMap` mixes the high and low bits of a key's hash to reduce collisions, while `Hashtable` uses the key's `hashCode()` directly.

**A `HashMap` constructor with an initial capacity:**

```java
    public HashMap(int initialCapacity, float loadFactor) {
        if (initialCapacity < 0)
            throw new IllegalArgumentException("Illegal initial capacity: " +
                                               initialCapacity);
        if (initialCapacity > MAXIMUM_CAPACITY)
            initialCapacity = MAXIMUM_CAPACITY;
        if (loadFactor <= 0 || Float.isNaN(loadFactor))
            throw new IllegalArgumentException("Illegal load factor: " +
                                               loadFactor);
        this.loadFactor = loadFactor;
        this.threshold = tableSizeFor(initialCapacity);
    }
     public HashMap(int initialCapacity) {
        this(initialCapacity, DEFAULT_LOAD_FACTOR);
    }
```

The following method ensures that `HashMap` uses a power of two as its table size:

```java
/**
 * Returns a power of two size for the given target capacity.
 */
static final int tableSizeFor(int cap) {
    int n = cap - 1;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
}
```

### How do `HashMap` and `HashSet` differ?

`HashSet` is backed by a `HashMap`. Its source code is short because most operations delegate to `HashMap`; `HashSet` mainly implements methods such as `clone()`, `writeObject()`, and `readObject()` itself.

|            `HashMap`            |                                     `HashSet`                                     |
| :-----------------------------: | :-------------------------------------------------------------------------------: |
|            `HashMap`            |                                     `HashSet`                                     |
|               ---               |                                        ---                                        |
|        Implements `Map`         |                                 Implements `Set`                                  |
|     Stores key-value pairs      |                               Stores elements only                                |
|    Adds entries with `put()`    |                            Adds elements with `add()`                             |
| Computes the hash from each key | Computes the hash from each element; `equals()` checks equality when hashes match |

### ⭐️ How do `HashMap` and `TreeMap` differ?

Both `TreeMap` and `HashMap` extend `AbstractMap`. `TreeMap` also implements the `NavigableMap` and `SortedMap` interfaces.

![TreeMap inheritance hierarchy](https://oss.javaguide.cn/github/javaguide/java/collection/treemap_hierarchy.png)

Implementing `NavigableMap` gives `TreeMap` additional ways to search its entries.

`NavigableMap` provides methods for finding and working with key-value pairs:

1. **Search by key:** Methods such as `ceilingEntry()`, `floorEntry()`, `higherEntry()`, and `lowerEntry()` find the nearest entry whose key is greater than or equal to, less than or equal to, greater than, or less than a given key.
2. **Range views:** `subMap()`, `headMap()`, and `tailMap()` create efficient views of part of the map without copying all its entries.
3. **Descending view:** `descendingMap()` returns a reverse-order view that lets you iterate over the `TreeMap` in descending order.
4. **Boundary operations:** Methods such as `firstEntry()`, `lastEntry()`, `pollFirstEntry()`, and `pollLastEntry()` provide access to, or remove, the first and last entries.

These operations use the properties of a red-black tree. Because the tree stays balanced, searches take `O(log n)` time, making `TreeMap` useful for searching ordered data.

Implementing `SortedMap` allows `TreeMap` to sort entries by key. It sorts keys in ascending natural order by default, but you can provide a comparator. For example:

```java
/**
 * @author shuang.kou
 * @createTime June 15, 2020, 17:02:00
 */
public class Person {
    private Integer age;

    public Person(Integer age) {
        this.age = age;
    }

    public Integer getAge() {
        return age;
    }


    public static void main(String[] args) {
        TreeMap<Person, String> treeMap = new TreeMap<>(new Comparator<Person>() {
            @Override
            public int compare(Person person1, Person person2) {
                int num = person1.getAge() - person2.getAge();
                return Integer.compare(num, 0);
            }
        });
        treeMap.put(new Person(3), "person1");
        treeMap.put(new Person(18), "person2");
        treeMap.put(new Person(35), "person3");
        treeMap.put(new Person(16), "person4");
        treeMap.entrySet().stream().forEach(personStringEntry -> {
            System.out.println(personStringEntry.getValue());
        });
    }
}
```

Output:

```plain
person1
person4
person2
person3
```

The entries in the `TreeMap` are sorted by the `Person` object's `age` field in ascending order.

The example above uses an anonymous inner class. You can replace it with a lambda expression:

```java
TreeMap<Person, String> treeMap = new TreeMap<>((person1, person2) -> {
  int num = person1.getAge() - person2.getAge();
  return Integer.compare(num, 0);
});
```

**In short, compared with `HashMap`, `TreeMap` keeps entries sorted by key and provides additional search operations.**

### How does `HashSet` check for duplicates?

The following is adapted from the second edition of _Head First Java_:

> When you add an object to a `HashSet`, it calculates the object's hash code to determine where to store it and compares that value with the hash codes of existing objects. If no hash codes match, `HashSet` assumes the object is unique. If it finds an object with the same hash code, it calls `equals()` to check whether the objects are actually equal. If they are, the addition is rejected.

In JDK 8, `HashSet.add()` calls `HashMap.put()` and checks its return value to determine whether the element was already present. Here is the relevant source:

```java
// Returns: true if this set did not already contain the specified element
// Returns true if the set did not already contain the element
public boolean add(E e) {
        return map.put(e, PRESENT)==null;
}
```

The `HashMap.putVal()` method includes this note:

```java
// Returns : previous value, or null if none
// Returns null if there was no previous value at this position; otherwise, returns the previous value
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
...
}
```

In JDK 8, if the `HashSet` already contains an equal element, the backing `HashMap` keeps the existing key and `HashSet.add()` returns `false`. Otherwise, it adds the element and returns `true`.

### ⭐️ How is `HashMap` implemented?

#### Before JDK 8

Before JDK 8, `HashMap` combined an **array and linked lists**, a structure known as **separate chaining**. It passed each key's `hashCode()` through a hash-spreading function, then used `(n - 1) & hash` to find the array index, where `n` is the array length. If the bucket already contained an entry, `HashMap` compared the hash and key. It replaced the value if the key matched; otherwise, it added the entry to the bucket's linked list.

The hash-spreading function (the `hash` method) improves the distribution of hash values. By processing the original `hashCode()`, it can reduce collisions caused by poorly distributed hash codes.

**The `hash` method in JDK 8's `HashMap`:**

The JDK 8 `hash` method is simpler than the JDK 7 version, but the basic idea is the same.

```java
    static final int hash(Object key) {
      int h;
      // key.hashCode(): returns the hash code
      // ^: bitwise XOR
      // >>>: unsigned right shift; fills empty positions with 0
      return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
  }
```

Compare it with the `hash` method in JDK 7's `HashMap`:

```java
static int hash(int h) {
    // This function ensures that hashCodes that differ only by
    // constant multiples at each bit position have a bounded
    // number of collisions (approximately 8 at default load factor).

    h ^= (h >>> 20) ^ (h >>> 12);
    return h ^ (h >>> 7) ^ (h >>> 4);
}
```

The JDK 7 `hash` method is slightly more expensive than the JDK 8 version because it performs four rounds of spreading.

**Separate chaining** combines an array with linked lists: each array slot points to a list. When a hash collision occurs, the new entry is added to that bucket's list.

![HashMap's internal structure before JDK 8](https://oss.javaguide.cn/github/javaguide/java/collection/jdk1.7_hashmap.png)

#### Starting with JDK 8

Starting with JDK 8, `HashMap` handles collisions differently. When a bucket's linked list exceeds a threshold (8 by default), it can be converted to a red-black tree. Before converting it, `HashMap` checks whether the table has at least 64 slots; if not, it resizes the table first.

This reduces lookup time. Searching a linked list takes `O(n)`, where `n` is the list length; searching a red-black tree takes `O(log n)`. The difference is small for short lists, but lookups slow down as a list grows.

![HashMap's internal structure starting with JDK 8](https://oss.javaguide.cn/github/javaguide/java/collection/jdk1.8_hashmap.png)

**Why resize before converting a bucket to a red-black tree?**

Resizing spreads entries across a larger table and reduces the chance of hash collisions. In most cases, this is more efficient than converting a bucket to a red-black tree.

Red-black trees require extra work to stay balanced, so using them too early would add unnecessary overhead and complexity.

**Why are the thresholds 8 and 64?**

1. A Poisson distribution estimates that a bucket reaching a length of 8 is very unlikely (less than one in ten million). The threshold of 8 balances performance and memory use in typical cases.
2. The table-size threshold of 64 is also based on practical experience. Resizing a small table is inexpensive and avoids introducing a tree too early. Once the table reaches 64 slots, treeification is more likely to improve performance.

> `TreeMap`, `TreeSet`, and `HashMap` starting with JDK 8 use red-black trees. Red-black trees address a weakness of ordinary binary search trees, which can degrade into a linear structure in some cases.

Let's look at the source code that converts a `HashMap` bucket from a linked list to a red-black tree.

**1. `putVal()` checks whether a bucket should be treeified.**

When a bucket's list grows beyond 8 entries, `putVal()` calls `treeifyBin()` to consider converting it.

```java
// Traverse the linked list
for (int binCount = 0; ; ++binCount) {
    // Find the last node in the linked list
    if ((e = p.next) == null) {
        p.next = newNode(hash, key, value, null);
        // If the list contains more than TREEIFY_THRESHOLD (8) elements
        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
            // Consider converting the bucket to a red-black tree
            treeifyBin(tab, hash);
        break;
    }
    if (e.hash == hash &&
        ((k = e.key) == key || (key != null && key.equals(k))))
        break;
    p = e;
}
```

**2. `treeifyBin()` checks whether to convert the bucket.**

```java
final void treeifyBin(Node<K,V>[] tab, int hash) {
    int n, index; Node<K,V> e;
    // Check whether the current table has fewer than 64 slots
    if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
        // If so, resize the table first
        resize();
    else if ((e = tab[index = (n - 1) & hash]) != null) {
        // Otherwise, convert the list to a red-black tree

        TreeNode<K,V> hd = null, tl = null;
        do {
            TreeNode<K,V> p = replacementTreeNode(e, null);
            if (tl == null)
                hd = p;
            else {
                p.prev = tl;
                tl.next = p;
            }
            tl = p;
        } while ((e = e.next) != null);
        if ((tab[index] = hd) != null)
            hd.treeify(tab);
    }
}
```

Before converting a bucket to a red-black tree, `HashMap` checks the table size. If it has fewer than 64 slots, it resizes the table first.

### ⭐️ Why is a `HashMap` table size a power of two?

To make lookups efficient and reduce collisions, `HashMap` aims to distribute entries evenly. Java hash codes are usually `int` values, ranging from `-2147483648` to `2147483647`—about four billion possible values. A table that large would use too much memory, so `HashMap` maps each hash code to an array index using the table length.

**How should the index be calculated?**

One option is the remainder operator (`%`). For a non-negative `hash`, when `length` is a power of two, `hash % length` is equivalent to `hash & (length - 1)`. `HashMap` uses the latter to calculate the array index.

Bitwise operations are faster than calculating a remainder, but another important benefit is that **a power-of-two table size helps distribute entries evenly when the table grows**. For example:

- When `length = 8`, `length - 1 = 7`, or `0111` in binary.
- When `length = 16`, `length - 1 = 15`, or `1111` in binary.

When `HashMap` recalculates an entry's index using `hash & (length - 1)`, its new position depends on the fourth bit of the hash value (counting from the right). There are two cases:

1. If the fourth bit is `0`, the entry stays at the same index in the new table.
2. If the fourth bit is `1`, the entry moves to the corresponding position in the new half of the table.

For example:

```plain
Suppose an entry has the hash value `10101100`.

Index in the old table:
hash        = 10101100
length - 1  = 00000111
& -----------------
index       = 00000100  (4)

Index in the new table:
hash        = 10101100
length - 1  = 00001111
& -----------------
index       = 00001100  (12)

Check the fourth bit from the right:
1. If it is `0`, the entry stays at the same index.
2. If it is `1`, the entry moves to its new index (the old index plus the old capacity).
```

⚠️ Note: In this example, we check the fourth bit. More generally, the relevant bit is the newly exposed high-order bit. For example, when `length = 32`, `length - 1 = 31` (`11111` in binary), so the fifth bit from the right determines whether an entry moves.

After resizing, if hash values were reasonably well distributed in the old table, entries should also be distributed well in the new table. Ideally, about half stay in the old half and half move to the new half. The distribution depends on each object's `hashCode()` implementation and the hash-spreading function.

This also makes resizing simpler: check the newly exposed hash bit to decide whether an entry stays in place or moves by the old table capacity.

To summarize, `HashMap` uses a power-of-two table size because:

1. **Bitwise operations are efficient:** For a non-negative hash and a power-of-two length, `hash % length` is equivalent to `hash & (length - 1)`.
2. **Entries are distributed more evenly after resizing:** If the old table's entries were distributed evenly, the new table should be too. Ideally, half remain in the old half and half move to the new half.
3. **Resizing is simpler:** Check the newly exposed hash bit to determine whether an entry stays at the same index or moves by the old capacity.

### ⭐️ How could concurrent `HashMap` operations cause an infinite loop?

In JDK 7 and earlier, concurrent resizing of a `HashMap` could create an infinite loop. If a bucket contained multiple entries, concurrent threads could modify its linked list during resizing. Because resizing used head insertion, the nodes could end up pointing to one another and form a cycle. A later lookup could then loop forever.

JDK 8 changed resizing to preserve the relative order of nodes rather than inserting each node at the head, avoiding this cycle. However, `HashMap` is still not safe for concurrent use because writes can overwrite each other. Use `ConcurrentHashMap` when multiple threads need to access a map.

This level of detail is usually enough for an interview. For a deeper explanation of the infinite loop during `HashMap` resizing, see [The Infinite Loop in Java HashMap](https://coolshell.cn/articles/9606.html).

### ⭐️ Why isn't `HashMap` thread-safe?

`HashMap` is not thread-safe. Concurrent writes can cause two main problems:

1. **Lost updates:** One thread's `put` may overwrite an entry written by another thread.
2. **Infinite loops:** In JDK 7 and earlier, concurrent resizing could create a cycle in a bucket's linked list, causing a `get` operation to loop indefinitely and potentially drive CPU usage to 100%.

Lost updates can occur in both JDK 7 and JDK 8. The example below uses JDK 8.

In JDK 8, multiple key-value pairs may be assigned to the same bucket and stored in a linked list or red-black tree. Concurrent `put` operations can race and overwrite data.

For example:

- Threads 1 and 2 call `put` at the same time and encounter a hash collision, so the keys map to the same bucket.
- Thread 1 checks the bucket, then is paused when its time slice ends. Thread 2 completes its insertion first.
- Thread 1 resumes and inserts based on its earlier check, overwriting the value written by thread 2.

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
    // ...
    // Check for a hash collision
    // (n - 1) & hash selects the bucket. If it is empty, put the new node in the array.
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);
    // The bucket already contains an element; handle the collision.
    else {
    // ...
}
```

Concurrent `put` operations can also leave `size` incorrect:

1. Thread 1 evaluates `if (++size > threshold)`, reads `size` as 10, and is paused when its time slice ends.
2. Thread 2 also reads 10, inserts its element, and updates `size` to 11.
3. Thread 1 resumes, inserts its element, and also updates `size` to 11.
4. Both threads completed a `put`, but `size` increased by only 1. This lost update means `size` alone may not reflect the actual number of entries.

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
    // ...
    // Resize if the actual size exceeds the threshold
    if (++size > threshold)
        resize();
    // Invoke the callback after insertion
    afterNodeInsertion(evict);
    return null;
}
```

### What are common ways to iterate over a `HashMap`?

[Seven Ways to Iterate Over a `HashMap` and Their Performance](https://mp.weixin.qq.com/s/zQBN3UvJDhRTKP6SzcZFKw)

**🐛 Correction (see [issue #1411](https://github.com/Snailclimb/JavaGuide/issues/1411)):**

The article's performance analysis of `parallelStream` iteration was incorrect. In short: **`parallelStream` performs best when the work blocks and worst when it does not.**

Without blocking work, `parallelStream` performs worst:

```plain
Benchmark               Mode  Cnt     Score      Error  Units
Test.entrySet           avgt    5   288.651 ±   10.536  ns/op
Test.keySet             avgt    5   584.594 ±   21.431  ns/op
Test.lambda             avgt    5   221.791 ±   10.198  ns/op
Test.parallelStream     avgt    5  6919.163 ± 1116.139  ns/op
```

After adding the blocking call `Thread.sleep(10)`, `parallelStream` performs best:

```plain
Benchmark               Mode  Cnt           Score          Error  Units
Test.entrySet           avgt    5  1554828440.000 ± 23657748.653  ns/op
Test.keySet             avgt    5  1550612500.000 ±  6474562.858  ns/op
Test.lambda             avgt    5  1551065180.000 ± 19164407.426  ns/op
Test.parallelStream     avgt    5   186345456.667 ±  3210435.590  ns/op
```

### ⭐️ How do `ConcurrentHashMap` and `Hashtable` differ?

The main difference between `ConcurrentHashMap` and `Hashtable` is how they provide thread safety.

- **Underlying data structure:** JDK 7 `ConcurrentHashMap` uses segments of arrays and linked lists. In JDK 8, it uses the same general structure as `HashMap`: an array of linked-list or red-black-tree buckets. `Hashtable`, like `HashMap` before JDK 8, uses an array of linked lists to handle collisions.
- **How thread safety is implemented:**
- **How thread safety is implemented:**
  - In JDK 7, `ConcurrentHashMap` divided its table into segments, each protected by its own lock. Threads could access different segments without contending for the same lock.
  - In JDK 8, `ConcurrentHashMap` dropped segment locking and uses an array of `Node`s with linked lists or red-black trees. It uses `synchronized` and CAS for concurrent updates. Although the `Segment` class still exists in JDK 8, its role is reduced for backward compatibility.
  - **`Hashtable` uses a single lock:** Its methods are synchronized, so only one thread can use a synchronized method at a time. For example, while one thread calls `put`, another cannot call either `put` or `get`, which can create heavy contention.

The diagrams below compare their underlying data structures.

**`Hashtable`:**

![Hashtable's internal structure](https://oss.javaguide.cn/github/javaguide/java/collection/jdk1.7_hashmap.png)

<p style="text-align:right;font-size:13px;color:gray">https://www.cnblogs.com/chengxiao/p/6842045.html></p>

**JDK 7 `ConcurrentHashMap`:**

![JDK 7 ConcurrentHashMap storage structure](https://oss.javaguide.cn/github/javaguide/java/collection/java7_concurrenthashmap.png)

`ConcurrentHashMap` consists of an array of `Segment`s, each containing an array of `HashEntry`s.

Each `Segment` contains a `HashEntry` array whose entries form linked lists.

**JDK 8 `ConcurrentHashMap`:**

![JDK 8 ConcurrentHashMap storage structure](https://oss.javaguide.cn/github/javaguide/java/collection/java8_concurrenthashmap.png)

JDK 8 `ConcurrentHashMap` no longer uses **a `Segment` array + `HashEntry` arrays + linked lists**. It uses **a `Node` array + linked lists or red-black trees**. A `Node` is used for a linked-list bucket; a tree bucket uses `TreeNode`. A collision list can be converted to a red-black tree once it reaches a certain length.

`TreeNode` stores a red-black tree node and is wrapped by `TreeBin`. `TreeBin` keeps the tree root in its `root` field. A tree rotation can replace the root with one of its children; a concurrent write during that change could be unsafe. `TreeBin` uses its `waiter` field to track a thread using the tree and prevent conflicting access.

```java
static final class TreeBin<K,V> extends Node<K,V> {
        TreeNode<K,V> root;
        volatile TreeNode<K,V> first;
        volatile Thread waiter;
        volatile int lockState;
        // values for lockState
        static final int WRITER = 1; // set while holding write lock
        static final int WAITER = 2; // set when waiting for write lock
        static final int READER = 4; // increment value for setting read lock
...
}
```

### ⭐️ How does `ConcurrentHashMap` provide thread safety?

#### Before JDK 8

![JDK 7 ConcurrentHashMap storage structure](https://oss.javaguide.cn/github/javaguide/java/collection/java7_concurrenthashmap.png)

The table was divided into segments, each protected by its own lock. While one thread held a segment's lock, other threads could still access different segments.

**`ConcurrentHashMap` consists of an array of `Segment`s and arrays of `HashEntry`s.**

`Segment` extends `ReentrantLock`, so each segment acts as a reentrant lock. `HashEntry` stores key-value pairs.

```java
static class Segment<K,V> extends ReentrantLock implements Serializable {
}
```

Each `ConcurrentHashMap` contains a `Segment` array whose size **cannot change after initialization**. The default size is 16, allowing up to 16 concurrent writes to different segments by default.

Each `Segment` has a structure similar to `HashMap`: an array of linked-list buckets. A segment protects the entries in its `HashEntry` array, so a thread must acquire that segment's lock before modifying an entry. Writes to the same segment block one another, while writes to different segments can proceed concurrently.

#### Starting with JDK 8

![JDK 8 ConcurrentHashMap storage structure](https://oss.javaguide.cn/github/javaguide/java/collection/java8_concurrenthashmap.png)

Java 8 almost completely rewrote `ConcurrentHashMap`; the implementation grew from more than 1,000 lines in Java 7 to more than 6,000 lines.

`ConcurrentHashMap` removed segment locks and uses `Node`, CAS, and `synchronized` to coordinate concurrent updates. Its data structure is similar to JDK 8 `HashMap`: an array of linked-list or red-black-tree buckets. When a linked list exceeds a threshold (8), it can be converted to a red-black tree, reducing lookup time from `O(n)` to `O(log n)`.

In Java 8, locking is more fine-grained. Updates to a non-empty bucket usually synchronize on its first node, so updates to different buckets can often proceed in parallel. Reads do not use these bucket locks.

### ⭐️ How does `ConcurrentHashMap` differ between JDK 7 and JDK 8?

- **Thread safety:** JDK 7 uses `Segment` locks, with each `Segment` extending `ReentrantLock`. JDK 8 replaces them with `Node`, CAS, and `synchronized`. The lock is more fine-grained and usually protects only the first node of the current list or tree bucket.
- **Hash collisions:** JDK 7 uses separate chaining. JDK 8 combines separate chaining with red-black trees, converting a bucket's list when it exceeds a threshold.
- **Concurrency:** In JDK 7, concurrent updates are mainly limited by the number of segments, which defaults to 16. JDK 8 has no fixed segment count, and updates to different buckets can often proceed in parallel.

### Why can't `ConcurrentHashMap` keys and values be `null`?

`ConcurrentHashMap` disallows `null` keys and values to avoid ambiguity. If `null` were allowed as a key, you could not tell whether the map contains that key or has no such key. Likewise, a `null` value would make it impossible to distinguish a stored `null` from the result returned when a key is absent.

For example, `get()` can return `null` in two cases:

- The key is not in the map.
- The value associated with the key is `null`.

This is the source of the ambiguity.

See [ConcurrentHashMap Source Code](https://javaguide.cn/java/collection/concurrent-hash-map-source-code.html) for details.

In a concurrent environment, another thread may modify the map between calls. You cannot reliably use `containsKey(key)` to determine whether a key-value pair exists and thereby avoid this ambiguity.

By contrast, `HashMap` allows a single `null` key and multiple `null` values. A `null` key is assigned a hash of zero. In a single-threaded context, no other thread can modify the map between calls, so you can use `containsKey(key)` to distinguish a missing key from a key mapped to `null`.

In short, concurrent modifications can make it impossible to determine whether a key-value pair exists, while in a single-threaded context you can make that distinction.

If you need to represent `null` in a `ConcurrentHashMap`, use a dedicated static sentinel object instead:

```java
public static final Object NULL = new Object();
```

Doug Lea, the author of `ConcurrentHashMap`, explains the restriction as follows:

> The main reason that nulls aren't allowed in ConcurrentMaps (ConcurrentHashMaps, ConcurrentSkipListMaps) is that ambiguities that may be just barely tolerable in non-concurrent maps can't be accommodated. The main one is that if `map.get(key)` returns `null`, you can't detect whether the key explicitly maps to `null` vs the key isn't mapped. In a non-concurrent map, you can check this via `map.contains(key)`, but in a concurrent one, the map might have changed between calls.

In other words, a non-concurrent map can tolerate this ambiguity because it can be checked in a later call; a concurrent map cannot, since another thread may change the map between calls.

### ⭐️ Does `ConcurrentHashMap` make compound operations atomic?

`ConcurrentHashMap` is thread-safe, so it supports concurrent reads and writes without corrupting its internal state. It also avoids issues such as the `HashMap` resizing loop that could occur in JDK 7 and earlier. However, this does not make every compound operation atomic.

A compound operation combines multiple basic operations such as `put`, `get`, `remove`, and `containsKey`. For example, checking for a key with `containsKey(key)` and then inserting or updating it with `put(key, value)` is a compound operation. Another thread can modify the map between those calls, producing an unexpected result.

For example, threads A and B might both perform this compound operation:

```java
// Thread A
if (!map.containsKey(key)) {
map.put(key, value);
}
// Thread B
if (!map.containsKey(key)) {
map.put(key, anotherValue);
}
```

Suppose they run in this order:

1. Thread A checks that the map does not contain the key.
2. Thread B also checks that the map does not contain the key.
3. Thread B inserts `(key, anotherValue)` into the map.
4. Thread A inserts `(key, value)` into the map.

The final value is `(key, value)`, not the expected `(key, anotherValue)`. This is a consequence of the compound operation not being atomic.

**How can you make a compound operation atomic with `ConcurrentHashMap`?**

`ConcurrentHashMap` provides atomic compound methods such as `putIfAbsent`, `compute`, `computeIfAbsent`, `computeIfPresent`, and `merge`. These methods accept a function that computes a value for a key and updates the map atomically.

The example above can be rewritten as:

```java
// Thread A
map.putIfAbsent(key, value);
// Thread B
map.putIfAbsent(key, anotherValue);
```

Or:

```java
// Thread A
map.computeIfAbsent(key, k -> value);
// Thread B
map.computeIfAbsent(key, k -> anotherValue);
```

You could also synchronize the whole operation yourself, but that often defeats the purpose of using `ConcurrentHashMap`. Prefer its atomic compound methods when they fit your use case.

## The `Collections` Utility Class (Optional)

**Common `Collections` utility methods:**

- Sorting
- Searching and replacement
- Synchronization wrappers (generally avoid these; consider a concurrent collection from `java.util.concurrent` when you need thread safety)

### Sorting

```java
void reverse(List list)// Reverse the list
void shuffle(List list)// Randomly shuffle the list
void sort(List list)// Sort in ascending natural order
void sort(List list, Comparator c)// Sort using the supplied Comparator
void swap(List list, int i , int j)// Swap the elements at two indices
void rotate(List list, int distance)// Rotate the list; positive moves the last elements to the front, negative moves the first elements to the end
```

### Searching and Replacing

```java
int binarySearch(List list, Object key)// Binary-search a sorted list and return the index
int max(Collection coll)// Return the greatest element by natural order; see also min(Collection coll)
int max(Collection coll, Comparator c)// Return the greatest element by the supplied Comparator; see also min(Collection coll, Comparator c)
void fill(List list, Object obj)// Replace every element in the list with obj
int frequency(Collection c, Object o)// Count how many times an element occurs
int indexOfSubList(List list, List target)// Return the first index of target, or -1; see also lastIndexOfSubList
boolean replaceAll(List list, Object oldVal, Object newVal)// Replace every occurrence of oldVal with newVal
```

### Synchronization Wrappers

`Collections` provides `synchronizedXxx()` methods that wrap a collection with synchronized access, helping protect it from concurrent access by multiple threads.

All access must go through the returned wrapper. When iterating with an `Iterator`, `Spliterator`, or `Stream`, you must also synchronize on the wrapper.

`HashSet`, `TreeSet`, `ArrayList`, `LinkedList`, `HashMap`, and `TreeMap` are not thread-safe. `Collections` provides static methods that wrap them with synchronized access.

**Avoid these wrappers when possible. For a thread-safe collection, consider a concurrent implementation from `java.util.concurrent`.**

The methods include:

```java
synchronizedCollection(Collection<T> c) // Return a synchronized collection backed by the specified collection.
synchronizedList(List<T> list)// Return a synchronized list backed by the specified list.
synchronizedMap(Map<K,V> m) // Return a synchronized map backed by the specified map.
synchronizedSet(Set<T> s) // Return a synchronized set backed by the specified set.
```

<!-- @include: @article-footer.snippet.md -->
