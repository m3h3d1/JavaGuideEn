---
title: ConcurrentHashMap Source Code Analysis
description: Compare the segmented locks in JDK 7 with the CAS and synchronized design in JDK 8, and learn how ConcurrentHashMap provides thread safety under high concurrency.
category: Java
tag:
  - Java Collections
head:
  - - meta
    - name: keywords
      content: ConcurrentHashMap source code, thread-safe map, segmented locks, CAS, concurrent collections, JDK 7 and JDK 8 differences
---

> Contributed by Mudu Code: <https://mp.weixin.qq.com/s/AHWzboztt53ZfFZmsSnMSw>. JavaGuide has substantially revised and improved the original.

The previous article on the `HashMap` source code received a good response and sparked useful discussion. This article looks at `ConcurrentHashMap`, a widely used thread-safe map. How is it structured, and how does it work?

## 1. ConcurrentHashMap in Java 7

### 1. Data Structure

![Java 7 ConcurrentHashMap data structure](https://oss.javaguide.cn/github/javaguide/java/collection/java7_concurrenthashmap.png)

As shown above, Java 7 `ConcurrentHashMap` is composed of multiple `Segment` instances. Each `Segment` has a structure similar to `HashMap` and can resize independently. The number of `Segment` instances is fixed after initialization. The default is 16, so up to 16 segments can perform updates concurrently.

### 2. Initialization

Let's trace initialization through the no-argument `ConcurrentHashMap` constructor.

```java
    /**
     * Creates a new, empty map with a default initial capacity (16),
     * load factor (0.75) and concurrencyLevel (16).
     */
    public ConcurrentHashMap() {
        this(DEFAULT_INITIAL_CAPACITY, DEFAULT_LOAD_FACTOR, DEFAULT_CONCURRENCY_LEVEL);
    }
```

The no-argument constructor calls a constructor with three default values:

```java
    /**
     * Default initial capacity
     */
    static final int DEFAULT_INITIAL_CAPACITY = 16;

    /**
     * Default load factor
     */
    static final float DEFAULT_LOAD_FACTOR = 0.75f;

    /**
     * Default concurrency level
     */
    static final int DEFAULT_CONCURRENCY_LEVEL = 16;
```

Next, look at the parameterized constructor:

```java
@SuppressWarnings("unchecked")
public ConcurrentHashMap(int initialCapacity,float loadFactor, int concurrencyLevel) {
    // Validate the arguments
    if (!(loadFactor > 0) || initialCapacity < 0 || concurrencyLevel <= 0)
        throw new IllegalArgumentException();
    // Cap the concurrency level at 1 << 16
    if (concurrencyLevel > MAX_SEGMENTS)
        concurrencyLevel = MAX_SEGMENTS;
    // Find power-of-two sizes best matching arguments
    // Find the next power of two
    int sshift = 0;
    int ssize = 1;
    // Find the smallest power of two greater than or equal to concurrencyLevel
    while (ssize < concurrencyLevel) {
        ++sshift;
        ssize <<= 1;
    }
    // Record the segment shift
    this.segmentShift = 32 - sshift;
    // Record the segment mask
    this.segmentMask = ssize - 1;
    // Set the capacity
    if (initialCapacity > MAXIMUM_CAPACITY)
        initialCapacity = MAXIMUM_CAPACITY;
    // Calculate the HashMap-like capacity for each Segment
    int c = initialCapacity / ssize;
    if (c * ssize < initialCapacity)
        ++c;
    int cap = MIN_SEGMENT_TABLE_CAPACITY;
    // The HashMap-like capacity of a Segment must be a power of two and at least 2
    while (cap < c)
        cap <<= 1;
    // Create the Segment array and initialize segments[0]
    Segment<K,V> s0 = new Segment<K,V>(loadFactor, (int)(cap * loadFactor),
                         (HashEntry<K,V>[])new HashEntry[cap]);
    Segment<K,V>[] ss = (Segment<K,V>[])new Segment[ssize];
    UNSAFE.putOrderedObject(ss, SBASE, s0); // ordered write of segments[0]
    this.segments = ss;
}
```

To summarize, Java 7 `ConcurrentHashMap` initializes as follows:

1. Validate the required arguments.
2. Cap `concurrencyLevel` at its maximum. The no-argument constructor uses **16**.
3. Find the smallest **power of two** greater than or equal to `concurrencyLevel`; this is the length of the `segments` array, **16 by default**.
4. Set `segmentShift` to **32 - sshift**. This value is used to calculate a segment index during `put`; its default is 28.
5. Set `segmentMask` to `ssize - 1`, which is 15 by default.
6. **Initialize `segments[0]`** with a default capacity of **2** and a **load factor of 0.75**. Its resize threshold is **2 \* 0.75 = 1.5**, so it resizes when the second element is inserted.

### 3. put

With initialization covered, let's look at the `put` method.

```java
/**
 * Maps the specified key to the specified value in this table.
 * Neither the key nor the value can be null.
 *
 * <p> The value can be retrieved by calling the <tt>get</tt> method
 * with a key that is equal to the original key.
 *
 * @param key key with which the specified value is to be associated
 * @param value value to be associated with the specified key
 * @return the previous value associated with <tt>key</tt>, or
 *         <tt>null</tt> if there was no mapping for <tt>key</tt>
 * @throws NullPointerException if the specified key or value is null
 */
public V put(K key, V value) {
    Segment<K,V> s;
    if (value == null)
        throw new NullPointerException();
    int hash = hash(key);
    // Shift the hash right by segmentShift, then apply the segment mask
    // This selects the high four bits using segmentMask (1111)
    int j = (hash >>> segmentShift) & segmentMask;
    if ((s = (Segment<K,V>)UNSAFE.getObject          // nonvolatile; recheck
         (segments, (j << SSHIFT) + SBASE)) == null) //  in ensureSegment
        // Initialize the segment if it is missing
        s = ensureSegment(j);
    return s.put(key, hash, value, false);
}

/**
 * Returns the segment for the given index, creating it and
 * recording in segment table (via CAS) if not already present.
 *
 * @param k the index
 * @return the segment
 */
@SuppressWarnings("unchecked")
private Segment<K,V> ensureSegment(int k) {
    final Segment<K,V>[] ss = this.segments;
    long u = (k << SSHIFT) + SBASE; // raw offset
    Segment<K,V> seg;
        // Check whether the segment at u is null
    if ((seg = (Segment<K,V>)UNSAFE.getObjectVolatile(ss, u)) == null) {
        Segment<K,V> proto = ss[0]; // Use segment 0 as the prototype
        // Get the initial HashEntry array length from segment 0
        int cap = proto.table.length;
        // All segments use the same load factor
        float lf = proto.loadFactor;
        // Calculate the resize threshold
        int threshold = (int)(cap * lf);
        // Create a HashEntry array with capacity cap
        HashEntry<K,V>[] tab = (HashEntry<K,V>[])new HashEntry[cap];
        if ((seg = (Segment<K,V>)UNSAFE.getObjectVolatile(ss, u)) == null) { // recheck
            // Recheck in case another thread initialized this segment
            Segment<K,V> s = new Segment<K,V>(lf, threshold, tab);
            // Spin until the segment at u is initialized
            while ((seg = (Segment<K,V>)UNSAFE.getObjectVolatile(ss, u))
                   == null) {
                // Use CAS to initialize the segment; only one thread succeeds
                if (UNSAFE.compareAndSwapObject(ss, u, null, seg = s))
                    break;
            }
        }
    }
    return seg;
}
```

The code above shows how `ConcurrentHashMap` handles a `put`. The steps are:

1. Calculate the position for the key and get the corresponding `Segment`.

2. If the segment at that position is null, initialize it.

   **Segment initialization:**

   1. Check whether the segment at the calculated position is null.
   2. If it is, create a `HashEntry` array using the capacity and load factor from `Segment[0]`.
   3. Check again whether the target segment is still null.
   4. Initialize the segment with the new `HashEntry` array.
   5. Spin until the target position is filled, using CAS to set the segment.

3. Call `Segment.put` to insert the key-value pair.

We have covered how a `Segment` is retrieved and initialized. Next, let's examine its `put` method.

```java
final V put(K key, int hash, V value, boolean onlyIfAbsent) {
    // Acquire the ReentrantLock, or use scanAndLockForPut if it is unavailable
    HashEntry<K,V> node = tryLock() ? null : scanAndLockForPut(key, hash, value);
    V oldValue;
    try {
        HashEntry<K,V>[] tab = table;
        // Calculate the index for the new entry
        int index = (tab.length - 1) & hash;
        // Read the value at index with CAS-based access
        HashEntry<K,V> first = entryAt(tab, index);
        for (HashEntry<K,V> e = first;;) {
            if (e != null) {
                // Check whether the key exists; if so, find it in the list and replace its value
                K k;
                if ((k = e.key) == key ||
                    (e.hash == hash && key.equals(k))) {
                    oldValue = e.value;
                    if (!onlyIfAbsent) {
                        e.value = value;
                        ++modCount;
                    }
                    break;
                }
                e = e.next;
            }
            else {
                // Insert at the head of the list when there is a collision
                if (node != null)
                    node.setNext(first);
                else
                    node = new HashEntry<K,V>(hash, key, value, first);
                int c = count + 1;
                // Resize if the threshold is exceeded and capacity is below the maximum
                if (c > threshold && tab.length < MAXIMUM_CAPACITY)
                    rehash(node);
                else
                    // Set node at index; it may be a single entry or the list head
                    setEntryAt(tab, index, node);
                ++modCount;
                count = c;
                oldValue = null;
                break;
            }
        }
    } finally {
        unlock();
    }
    return oldValue;
}
```

Because `Segment` extends `ReentrantLock`, it can acquire a lock directly. The `put` flow uses this behavior:

1. Try to acquire the lock with `tryLock()`. If that fails, continue with **`scanAndLockForPut`**.

2. Calculate the index for the entry and get the `HashEntry` at that position.

3. Traverse the entries before inserting. The `HashEntry` at this position may be null or may be the head of an existing list, so each case is handled separately.

   If there is **no `HashEntry` at this position**:

   1. **Resize** if the threshold is exceeded and capacity is below the maximum.
   2. Insert at the head of the list.

   If a **`HashEntry` already exists at this position**:

   1. Compare each entry's key and hash with the key being inserted. If both match, replace its value.
   2. Otherwise, move to the next node until a match is found or the list ends. If no match is found:
      1. **Resize** if the threshold is exceeded and capacity is below the maximum.
      2. Insert the new entry at the head of the list.

4. If the key already existed, return its old value after replacing it; otherwise, return `null`.

The `scanAndLockForPut` method repeatedly spins while trying to acquire the lock with `tryLock()`. After a specified number of attempts, it blocks on `lock()`. While spinning, it also locates the `HashEntry` for the hash position.

```java
private HashEntry<K,V> scanAndLockForPut(K key, int hash, V value) {
    HashEntry<K,V> first = entryForHash(this, hash);
    HashEntry<K,V> e = first;
    HashEntry<K,V> node = null;
    int retries = -1; // negative while locating node
    // Spin while trying to acquire the lock
    while (!tryLock()) {
        HashEntry<K,V> f; // to recheck first below
        if (retries < 0) {
            if (e == null) {
                if (node == null) // speculatively create node
                    node = new HashEntry<K,V>(hash, key, value, null);
                retries = 0;
            }
            else if (key.equals(e.key))
                retries = 0;
            else
                e = e.next;
        }
        else if (++retries > MAX_SCAN_RETRIES) {
                // After enough retries, block until the lock is acquired
            lock();
            break;
        }
        else if ((retries & 1) == 0 &&
                 (f = entryForHash(this, hash)) != first) {
            e = first = f; // re-traverse if entry changed
            retries = -1;
        }
    }
    return node;
}

```

### 4. Resizing with rehash

`ConcurrentHashMap` doubles its capacity when resizing. An entry from the old array either stays at the same index or moves to `index + oldSize`. The `node` argument is inserted at the head of its list after resizing.

```java
private void rehash(HashEntry<K,V> node) {
    HashEntry<K,V>[] oldTable = table;
    // Old capacity
    int oldCapacity = oldTable.length;
    // Double the capacity
    int newCapacity = oldCapacity << 1;
    // New resize threshold
    threshold = (int)(newCapacity * loadFactor);
    // Create a new array
    HashEntry<K,V>[] newTable = (HashEntry<K,V>[]) new HashEntry[newCapacity];
    // New mask; for example, a capacity of 4 gives a mask of 3 (binary 11)
    int sizeMask = newCapacity - 1;
    for (int i = 0; i < oldCapacity ; i++) {
        // Traverse the old array
        HashEntry<K,V> e = oldTable[i];
        if (e != null) {
            HashEntry<K,V> next = e.next;
            // The new index is either unchanged or the old index plus the old capacity
            int idx = e.hash & sizeMask;
            if (next == null)   //  Single node on list
                // A single entry can be copied directly
                newTable[idx] = e;
            else { // Reuse consecutive sequence at same slot
                // Handle a list of entries
                HashEntry<K,V> lastRun = e;
                int lastIdx = idx;
                // Each new index is either unchanged or the old index plus the old capacity
                // After traversal, all entries from lastRun onward share the same new index
                for (HashEntry<K,V> last = next; last != null; last = last.next) {
                    int k = last.hash & sizeMask;
                    if (k != lastIdx) {
                        lastIdx = k;
                        lastRun = last;
                    }
                }
                // Entries from lastRun onward can be reused at their new index
                newTable[lastIdx] = lastRun;
                // Clone remaining nodes
                for (HashEntry<K,V> p = e; p != lastRun; p = p.next) {
                // Copy the remaining entries into their new lists
                    V v = p.value;
                    int h = p.hash;
                    int k = h & sizeMask;
                    HashEntry<K,V> n = newTable[k];
                    newTable[k] = new HashEntry<K,V>(h, p.key, v, n);
                }
            }
        }
    }
    // Insert the new node at the head of its list
    int nodeIndex = node.hash & sizeMask; // add the new node
    node.setNext(newTable[nodeIndex]);
    newTable[nodeIndex] = node;
    table = newTable;
}
```

The two loops near the end may be confusing. The first finds a node after which all entries have the same new index, then reuses that suffix as a list at the new position. The second copies the remaining entries into their new lists. ~~This implementation may be based on probability; readers who have studied it in more depth are welcome to share their findings.~~

The second `for` loop creates new `HashEntry` instances with `new HashEntry<K,V>(h, p.key, v, n)` instead of reusing the old ones. Reusing them would change their links and could disrupt a thread traversing the list, for example, in a `get` call. As the source comment says:

> Replaced nodes can be garbage-collected once they are no longer referenced by any reader that may be traversing the table.
>
> The nodes they replace will be garbage collectable as soon as they are no longer referenced by any reader thread that may be in the midst of concurrently traversing table

The loop that finds `lastRun` reduces the number of objects that need to be created. As the source comment explains:

> Statistically, at the default threshold, only about one-sixth of the nodes need to be cloned when the table doubles in size.
>
> Statistically, at the default threshold, only about one-sixth of them need cloning when a table doubles.

### 5. get

The `get` method is straightforward and takes two steps:

1. Calculate the position for the key.
2. Traverse that position to find the matching key and return its value.

```java
public V get(Object key) {
    Segment<K,V> s; // manually integrate access methods to reduce overhead
    HashEntry<K,V>[] tab;
    int h = hash(key);
    long u = (((h >>> segmentShift) & segmentMask) << SSHIFT) + SBASE;
    // Calculate the position for the key
    if ((s = (Segment<K,V>)UNSAFE.getObjectVolatile(segments, u)) != null &&
        (tab = s.table) != null) {
        for (HashEntry<K,V> e = (HashEntry<K,V>) UNSAFE.getObjectVolatile
                 (tab, ((long)(((tab.length - 1) & h)) << TSHIFT) + TBASE);
             e != null; e = e.next) {
            // If the entry is in a list, find the matching key
            K k;
            if ((k = e.key) == key || (e.hash == h && key.equals(k)))
                return e.value;
        }
    }
    return null;
}
```

## 2. ConcurrentHashMap in Java 8

Overall, `ConcurrentHashMap` changed significantly from Java 7 to Java 8.

### 1. Data Structure

![Java 8 ConcurrentHashMap data structure (image from javadoop)](https://oss.javaguide.cn/github/javaguide/java/collection/java8_concurrenthashmap.png)

Java 8 `ConcurrentHashMap` differs substantially from Java 7. Its structure is no longer **a Segment array + HashEntry arrays + linked lists**; it is now **a Node array + linked lists / red-black trees**. A collision list becomes a red-black tree when it reaches a certain length.

### 2. Initialization with initTable

```java
/**
 * Initializes table, using the size recorded in sizeCtl.
 */
private final Node<K,V>[] initTable() {
    Node<K,V>[] tab; int sc;
    while ((tab = table) == null || tab.length == 0) {
        // If sizeCtl < 0, another thread has won the CAS and is initializing
        if ((sc = sizeCtl) < 0)
            // Yield the CPU
            Thread.yield(); // lost initialization race; just spin
        else if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
            try {
                if ((tab = table) == null || tab.length == 0) {
                    int n = (sc > 0) ? sc : DEFAULT_CAPACITY;
                    @SuppressWarnings("unchecked")
                    Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                    table = tab = nt;
                    sc = n - (n >>> 2);
                }
            } finally {
                sizeCtl = sc;
            }
            break;
        }
    }
    return tab;
}
```

The source shows that initialization uses **spinning and CAS**. Pay attention to `sizeCtl` (short for size control), whose value represents the current initialization state:

1. `-1` means initialization is in progress; other threads spin and wait.
2. `-N` means the table is being resized. The high 16 bits contain the resize stamp; the low 16 bits, minus 1, represent the number of threads helping with the resize.
3. `0` means the table has not been initialized and will use the default capacity.
4. A positive value is the resize threshold once the table has been initialized.

### 3. put

Let's walk through the `put` source:

```java
public V put(K key, V value) {
    return putVal(key, value, false);
}

/** Implementation for put and putIfAbsent */
final V putVal(K key, V value, boolean onlyIfAbsent) {
    // Neither key nor value can be null
    if (key == null || value == null) throw new NullPointerException();
    int hash = spread(key.hashCode());
    int binCount = 0;
    for (Node<K,V>[] tab = table;;) {
        // f is the element at the target position
        Node<K,V> f; int n, i, fh;// fh stores the hash of the element at the target position
        if (tab == null || (n = tab.length) == 0)
            // Initialize the table if it is empty (spin + CAS)
            tab = initTable();
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            // If the bin is empty, insert with CAS and no lock
            if (casTabAt(tab, i, null,new Node<K,V>(hash, key, value, null)))
                break;  // no lock when adding to empty bin
        }
        else if ((fh = f.hash) == MOVED)
            tab = helpTransfer(tab, f);
        else {
            V oldVal = null;
            // Use synchronized to add the node
            synchronized (f) {
                if (tabAt(tab, i) == f) {
                    // This is a linked list
                    if (fh >= 0) {
                        binCount = 1;
                        // Add a new node or replace an existing one
                        for (Node<K,V> e = f;; ++binCount) {
                            K ek;
                            if (e.hash == hash &&
                                ((ek = e.key) == key ||
                                 (ek != null && key.equals(ek)))) {
                                oldVal = e.val;
                                if (!onlyIfAbsent)
                                    e.val = value;
                                break;
                            }
                            Node<K,V> pred = e;
                            if ((e = e.next) == null) {
                                pred.next = new Node<K,V>(hash, key,
                                                          value, null);
                                break;
                            }
                        }
                    }
                    else if (f instanceof TreeBin) {
                        // Red-black tree
                        Node<K,V> p;
                        binCount = 2;
                        if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key,
                                                       value)) != null) {
                            oldVal = p.val;
                            if (!onlyIfAbsent)
                                p.val = value;
                        }
                    }
                }
            }
            if (binCount != 0) {
                if (binCount >= TREEIFY_THRESHOLD)
                    treeifyBin(tab, i);
                if (oldVal != null)
                    return oldVal;
                break;
            }
        }
    }
    addCount(1L, binCount);
    return null;
}
```

1. Calculate the hash code for the key.

2. Check whether the table needs to be initialized.

3. If the node at the key's position is null, try to insert the data with CAS. If it fails, loop again and check the latest state.

4. If the hash at the current position is `MOVED` (`-1`), help with resizing.

5. Otherwise, use `synchronized` to write the data.

6. If the bin size exceeds `TREEIFY_THRESHOLD`, call the treeification method. `treeifyBin` converts the list to a red-black tree only when the table length is at least 64.

### 4. get

The `get` flow is straightforward:

```java
public V get(Object key) {
    Node<K,V>[] tab; Node<K,V> e, p; int n, eh; K ek;
    // Hash position for the key
    int h = spread(key.hashCode());
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (e = tabAt(tab, (n - 1) & h)) != null) {
        // If the element exists at this position and the head hash matches
        if ((eh = e.hash) == h) {
            if ((ek = e.key) == key || (ek != null && key.equals(ek)))
                // The hash and key match, so return the value
                return e.val;
        }
        else if (eh < 0)
            // A negative head hash indicates resizing or a red-black tree; search with find
            return (p = e.find(h, key)) != null ? p.val : null;
        while ((e = e.next) != null) {
            // Search the linked list
            if (e.hash == h &&
                ((ek = e.key) == key || (ek != null && key.equals(ek))))
                return e.val;
        }
    }
    return null;
}
```

To summarize, `get` works as follows:

1. Calculate the position from the hash.
2. Check the entry at that position. If the head is the requested entry, return its value.
3. If the head hash is negative, the bin is being resized or is a red-black tree; search it.
4. If the bin is a linked list, traverse it to find the entry.

### 5. Counting Elements with size

`ConcurrentHashMap`'s `size()` method returns the number of elements in the map. Accurately and efficiently counting elements under high concurrency is challenging, so Java 8 uses a split counter.

#### 5.1 Why Split the Counter?

If multiple threads run `put` at the same time, they all need to update the element count. A single shared counter would create contention as every thread competes to update the same variable, hurting performance.

To reduce this contention, `ConcurrentHashMap` spreads updates across multiple counters instead of using a single one.

#### 5.2 baseCount and counterCells

`ConcurrentHashMap` maintains two key fields for counting:

- **`baseCount`**: The base counter. When there is no contention, it is updated directly with CAS.
- **`counterCells`**: An array of counters. When threads contend unsuccessfully for `baseCount`, they try to spread increments across different cells in this array.
  - Each thread uses its **probe value** (a hash-like value associated with the thread) to select a slot and normally updates that slot.
  - **Note:** A slot is not strictly private to one thread. Hash collisions can cause multiple threads to update the same slot.

**For example**, suppose 10 threads add elements to a map at the same time. One thread updates `baseCount` with CAS. If the other nine encounter contention, they can increment different cells in `counterCells`, spreading the contention across multiple locations.

#### 5.3 Updating the Count During put

At the end of `putVal`, `addCount(1L, binCount)` updates the element count.

The `addCount` logic can be summarized as follows:

1. **Try to update `baseCount` first**

   - If `counterCells` has not been initialized (`counterCells == null`), the thread tries to update `baseCount` directly with CAS.
   - If CAS succeeds, contention is low, so the operation can return.

2. **Use `counterCells` when contention occurs**

   - If updating `baseCount` with CAS fails, or `counterCells` already exists, the thread tries to update a cell:
     - Use its probe value to select a slot.
     - Increment that slot's `CounterCell` with CAS.
   - If the slot is empty or CAS still fails, the thread takes the slower `fullAddCount` path, which initializes cells or selects another slot.

3. **Initialize or resize `counterCells` as needed**
   - When contention is high, such as frequent CAS failures on a cell, `fullAddCount` uses the lightweight spin lock `cellsBusy` to:
     - Initialize a small array (for example, length 2) if `counterCells` does not exist.
     - Double the array length if it exists and has not reached its limit, usually the number of CPU cores, creating more slots to spread updates.

This design keeps the path short at low concurrency by using only `baseCount`. Under higher contention, it switches to split counting and can resize `counterCells` to spread updates, balancing performance and accuracy.

#### 5.4 How sumCount Calculates the Total

When `size()` is called, it eventually uses `sumCount()` to calculate the total:

1. Read `baseCount` as the starting value.
2. Traverse `counterCells` and add the count from each non-null cell.
3. Return the total.

**Notes:**

- **Weak consistency:** `sumCount()` does not acquire a lock. If another thread inserts data during the calculation, the result is only an **estimate**. Under high concurrency, obtaining an exact count at a single instant would be expensive; an estimate is usually sufficient.
- **Integer overflow:** `size()` returns an `int` and returns `Integer.MAX_VALUE` if the number of elements exceeds that limit. Java 8 added **`mappingCount()`**, which returns a `long` for larger counts, though it can still return an estimate during concurrent updates.

## 3. Summary

In Java 7, `ConcurrentHashMap` uses segment-level locks. Only one thread at a time can operate on a given segment. Each `Segment` has a resizable, `HashMap`-like array whose collisions are stored in linked lists. The number of segments cannot change after initialization.

Java 8 `ConcurrentHashMap` uses `synchronized` and CAS. Its structure evolved from Java 7's **`Segment` array + `HashEntry` arrays + linked lists** into a **Node array + linked lists / red-black trees**. A `Node` is similar to a `HashEntry`. When a bin reaches `TREEIFY_THRESHOLD = 8`, it becomes a red-black tree; when it falls below `UNTREEIFY_THRESHOLD = 6`, it becomes a linked list again.

If you have concerns about `synchronized` performance, note that lock optimizations have improved it significantly. You can read more about **lock inflation and optimization** in Java.

<!-- @include: @article-footer.snippet.md -->
