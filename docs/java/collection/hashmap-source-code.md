---
title: HashMap Source Code
description: A detailed look at HashMap, including the JDK 7 and JDK 8 implementations, hash spreading, the 0.75 load factor, resizing, and list-to-tree conversion.
category: Java
tag:
  - Java Collections
head:
  - - meta
    - name: keywords
      content: HashMap source code,hash table,red-black tree,linked list,hash spreading,load factor,HashMap resizing,hash collision,JDK 8 improvements
---

<!-- @include: @article-header.snippet.md -->

> Thanks to [changfubai](https://github.com/changfubai) for improving this article!

## Introduction

`HashMap` stores key-value pairs. It is a common, non-thread-safe implementation of the `Map` interface backed by a hash table.

`HashMap` allows one `null` key and multiple `null` values.

Before JDK 8, `HashMap` used an array of linked lists, with separate chaining to handle collisions. Starting with JDK 8, a bucket's list can be converted to a red-black tree when it reaches a threshold of 8. Before treeifying a bucket, `HashMap` checks whether the table has at least 64 slots; if not, it resizes the table first. Treeification can reduce lookup time for longer lists.

`HashMap` has a default initial capacity of 16. It doubles the capacity each time it resizes and always uses a power of two as the table size.

## Underlying Data Structure

### Before JDK 8

Before JDK 8, `HashMap` combined an **array and linked lists**, a structure known as **separate chaining**.

`HashMap` passes each key's `hashCode()` through a hash-spreading function, then uses `(n - 1) & hash` to find the array index, where `n` is the array length. If the bucket already contains an entry, it compares the hash and key. If the key matches, it replaces the value; otherwise, separate chaining handles the collision.

The hash-spreading function is the `HashMap` `hash()` method. It helps reduce collisions when a key's `hashCode()` implementation does not distribute values well.

**The `hash()` method in JDK 8 `HashMap`:**

The JDK 8 `hash()` method is simpler than the JDK 7 version, but the basic idea is the same.

```java
    static final int hash(Object key) {
      int h;
      // key.hashCode(): returns the hash code
      // ^: bitwise XOR
      // >>>: unsigned right shift; fills empty positions with 0
      return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
  }
```

Compare it with the `hash()` method in JDK 7 `HashMap`:

```java
static int hash(int h) {
    // This function ensures that hashCodes that differ only by
    // constant multiples at each bit position have a bounded
    // number of collisions (approximately 8 at default load factor).

    h ^= (h >>> 20) ^ (h >>> 12);
    return h ^ (h >>> 7) ^ (h >>> 4);
}
```

The JDK 7 `hash()` method is slightly more expensive than the JDK 8 version because it performs four rounds of spreading.

**Separate chaining** combines an array with linked lists: each array slot points to a list. When a hash collision occurs, the new entry is added to that bucket's list.

![HashMap's internal structure before JDK 8](https://oss.javaguide.cn/github/javaguide/java/collection/jdk1.7_hashmap.png)

### Starting with JDK 8

Starting with JDK 8, `HashMap` handles hash collisions differently.

When a bucket's list exceeds the threshold (8 by default), `HashMap` calls `treeifyBin()`. This method checks the table size before converting the list to a red-black tree. Treeification only happens when the table has at least 64 slots; otherwise, `resize()` expands the array. The key method to look at is `treeifyBin()`.

![HashMap's internal structure starting with JDK 8](https://oss.javaguide.cn/github/javaguide/java/collection/jdk1.8_hashmap.png)

**Class fields:**

```java
public class HashMap<K,V> extends AbstractMap<K,V> implements Map<K,V>, Cloneable, Serializable {
    // Serialization version
    private static final long serialVersionUID = 362498820763181265L;
    // Default initial capacity: 16
    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4;
    // Maximum capacity
    static final int MAXIMUM_CAPACITY = 1 << 30;
    // Default load factor
    static final float DEFAULT_LOAD_FACTOR = 0.75f;
    // Convert a bucket to a red-black tree when its node count reaches this value.
    static final int TREEIFY_THRESHOLD = 8;
    // Convert a tree bucket back to a list when its node count falls to this value.
    static final int UNTREEIFY_THRESHOLD = 6;
    // Minimum table capacity for treeifying a bucket
    static final int MIN_TREEIFY_CAPACITY = 64;
    // Array storing entries; its length is always a power of two.
    transient Node<k,v>[] table;
    // A collection view of all key-value pairs in the map
    transient Set<map.entry<k,v>> entrySet;
    // Number of entries; this is not the array length.
    transient int size;
    // Counter for resizing and structural changes to the map
    transient int modCount;
    // Threshold (capacity * load factor); resize when the size exceeds it.
    int threshold;
    // Load factor
    final float loadFactor;
}
```

- **The `loadFactor`**

  The load factor controls how full the table is allowed to become. As it approaches 1, more entries are stored in the array, increasing bucket density and potentially lengthening the lists. As it approaches 0, fewer entries are stored in the table.

  **A load factor that is too high can make lookups slower; one that is too low wastes table space. The default value of `0.75f` is a practical balance.**

  With the default capacity of 16 and a load factor of 0.75, the threshold is `16 * 0.75 = 12`. Once the number of entries exceeds 12, the map resizes. Resizing is costly because it allocates a new array and transfers the entries.

- **threshold**

  **`threshold = capacity * loadFactor`.** When `size > threshold`, the table needs to grow. The threshold is the **criterion used to decide when to resize**.

**The `Node` class:**

```java
// Implements Map.Entry<K,V>
static class Node<K,V> implements Map.Entry<K,V> {
       final int hash;// Hash used to compare entries in the map
       final K key;// Key
       V value;// Value
       // Reference to the next node
       Node<K,V> next;
       Node(int hash, K key, V value, Node<K,V> next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }
        public final K getKey()        { return key; }
        public final V getValue()      { return value; }
        public final String toString() { return key + "=" + value; }
        // Override hashCode().
        public final int hashCode() {
            return Objects.hashCode(key) ^ Objects.hashCode(value);
        }

        public final V setValue(V newValue) {
            V oldValue = value;
            value = newValue;
            return oldValue;
        }
        // Override equals().
        public final boolean equals(Object o) {
            if (o == this)
                return true;
            if (o instanceof Map.Entry) {
                Map.Entry<?,?> e = (Map.Entry<?,?>)o;
                if (Objects.equals(key, e.getKey()) &&
                    Objects.equals(value, e.getValue()))
                    return true;
            }
            return false;
        }
}
```

**The tree node class:**

```java
static final class TreeNode<K,V> extends LinkedHashMap.Entry<K,V> {
        TreeNode<K,V> parent;  // Parent
        TreeNode<K,V> left;    // Left child
        TreeNode<K,V> right;   // Right child
        TreeNode<K,V> prev;    // needed to unlink next upon deletion
        boolean red;           // Node color
        TreeNode(int hash, K key, V val, Node<K,V> next) {
            super(hash, key, val, next);
        }
        // Return the root node.
        final TreeNode<K,V> root() {
            for (TreeNode<K,V> r = this, p;;) {
                if ((p = r.parent) == null)
                    return r;
                r = p;
       }
```

## `HashMap` Source Code

### Constructors

`HashMap` has four constructors:

```java
    // Default constructor.
    public HashMap() {
        this.loadFactor = DEFAULT_LOAD_FACTOR; // all   other fields defaulted
     }

     // Constructor that copies entries from another map
     public HashMap(Map<? extends K, ? extends V> m) {
         this.loadFactor = DEFAULT_LOAD_FACTOR;
         putMapEntries(m, false);// See the explanation below.
     }

     // Constructor with a specified initial capacity
     public HashMap(int initialCapacity) {
         this(initialCapacity, DEFAULT_LOAD_FACTOR);
     }

     // Constructor with a specified initial capacity and load factor
     public HashMap(int initialCapacity, float loadFactor) {
         if (initialCapacity < 0)
             throw new IllegalArgumentException("Illegal initial capacity: " + initialCapacity);
         if (initialCapacity > MAXIMUM_CAPACITY)
             initialCapacity = MAXIMUM_CAPACITY;
         if (loadFactor <= 0 || Float.isNaN(loadFactor))
             throw new IllegalArgumentException("Illegal load factor: " + loadFactor);
         this.loadFactor = loadFactor;
         // Store the initial capacity in threshold temporarily; resize() uses it to initialize the table.
         this.threshold = tableSizeFor(initialCapacity);
     }
```

> Note: The supplied `initialCapacity` is not necessarily the final table capacity. `HashMap` calls `tableSizeFor()` to **round it up to the smallest power of two that is greater than or equal to the requested value**, then temporarily stores that value in `threshold`. The `table` array is not initialized until the first call to `resize()`.
>
> For example: `initialCapacity = 9` → `threshold = 16` → the final table length is 16.

**The `putMapEntries()` Method:**

```java
final void putMapEntries(Map<? extends K, ? extends V> m, boolean evict) {
    int s = m.size();
    if (s > 0) {
        // Check whether the table has been initialized.
        if (table == null) { // pre-size
            /*
             * If the table is not initialized, s is the number of entries in m.
             * ft = s / loadFactor, or s = ft * loadFactor, which is related to
             * threshold = capacity * loadFactor. Here, ft is the minimum capacity
             * needed to hold s entries.
             */
            float ft = ((float)s / loadFactor) + 1.0F;
            int t = ((ft < (float)MAXIMUM_CAPACITY) ?
                    (int)ft : MAXIMUM_CAPACITY);
            /*
             * The constructor leaves the table uninitialized, so threshold holds
             * the initial capacity. If the minimum capacity needed for s entries
             * exceeds it, use the nearest power of two as the initial capacity.
             * This does not initialize the resize threshold yet.
             */
            if (t > threshold)
                threshold = tableSizeFor(t);
        }
        // If initialized and m has more entries than the threshold, resize.
        else if (s > threshold)
            resize();
        // Add all entries from m. If the table is not initialized, putVal() calls resize().
        for (Map.Entry<? extends K, ? extends V> e : m.entrySet()) {
            K key = e.getKey();
            V value = e.getValue();
            putVal(hash(key), key, value, false, evict);
        }
    }
}
```

### The `put()` Method

`HashMap` exposes `put()` to add entries. `putVal()` is an internal method called by `put()`.

**The `putVal()` method adds entries as follows:**

1. If the target array slot is empty, insert the entry there.
2. If the slot is occupied, compare the existing key with the key being inserted. If they match, replace the value. Otherwise, if `p` is a tree node, call `putTreeVal()` to add the entry to the tree. If not, traverse the linked list and append the new entry at the tail.

![ ](https://oss.javaguide.cn/github/javaguide/database/sql/put.png)

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    // Initialize or grow the table if it is empty.
    if ((tab = table) == null || (n = tab.length) == 0)
        n = (tab = resize()).length;
    // (n - 1) & hash selects the bucket. If it is empty, place the new node in the array.
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);
    // The bucket already contains an entry; handle the collision.
    else {
        Node<K,V> e; K k;
        // Check the first node's key. If it matches, replace its value.
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
        // Check whether the first node is part of a red-black tree.
        else if (p instanceof TreeNode)
            // Add the entry to the tree.
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        // Otherwise, this is a linked-list node.
        else {
            // Append the node to the end of the list.
            for (int binCount = 0; ; ++binCount) {
                // Reached the end of the list.
                if ((e = p.next) == null) {
                    // Append the new node.
                    p.next = newNode(hash, key, value, null);
                    // If the node count reaches the threshold (8 by default), call treeifyBin().
                    // It converts the bucket to a red-black tree only if the table
                    // has at least 64 slots; otherwise, it resizes the table.
                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                        treeifyBin(tab, hash);
                    // Exit the loop.
                    break;
                }
                // Compare this node's key with the key being inserted.
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    // If they match, exit the loop.
                    break;
                // Advance to the next node in the bucket.
                p = e;
            }
        }
        // An existing node with the same key and hash was found.
        if (e != null) {
            // Save the old value.
            V oldValue = e.value;
            // Replace the value if onlyIfAbsent is false or the old value is null.
            if (!onlyIfAbsent || oldValue == null)
                // Replace the old value with the new value.
                e.value = value;
            // Invoke the callback after access.
            afterNodeAccess(e);
            // Return the old value.
            return oldValue;
        }
    }
    // Record a structural modification.
    ++modCount;
    // Resize if the size exceeds the threshold.
    if (++size > threshold)
        resize();
    // Invoke the callback after insertion.
    afterNodeInsertion(evict);
    return null;
}
```

**Compare this with the `put()` method in JDK 7:**

**The JDK 7 `put()` method works as follows:**

- If the target array slot is empty, insert the entry there.
- If the slot is occupied, traverse the linked list from its head and compare each key with the key being inserted. Replace the value if the keys match; otherwise, add the new entry at the head of the list.

```java
public V put(K key, V value)
    if (table == EMPTY_TABLE) {
    inflateTable(threshold);
}
    if (key == null)
        return putForNullKey(value);
    int hash = hash(key);
    int i = indexFor(hash, table.length);
    for (Entry<K,V> e = table[i]; e != null; e = e.next) { // Traverse first.
        Object k;
        if (e.hash == hash && ((k = e.key) == key || key.equals(k))) {
            V oldValue = e.value;
            e.value = value;
            e.recordAccess(this);
            return oldValue;
        }
    }

    modCount++;
    addEntry(hash, key, value, i);  // Then insert.
    return null;
}
```

### The `get()` Method

```java
public V get(Object key) {
    Node<K,V> e;
    return (e = getNode(hash(key), key)) == null ? null : e.value;
}

final Node<K,V> getNode(int hash, Object key) {
    Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (first = tab[(n - 1) & hash]) != null) {
        // The array entry matches.
        if (first.hash == hash && // always check first node
            ((k = first.key) == key || (key != null && key.equals(k))))
            return first;
        // The bucket contains more than one node.
        if ((e = first.next) != null) {
            // Search the tree.
            if (first instanceof TreeNode)
                return ((TreeNode<K,V>)first).getTreeNode(hash, key);
            // Search the linked list.
            do {
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    return e;
            } while ((e = e.next) != null);
        }
    }
    return null;
}
```

### The `resize()` Method

Resizing traverses the hash table and uses each node's existing hash value and the old capacity to determine its position in the new array. This can be expensive, so avoid unnecessary resizes. The `resize()` method handles both table initialization and expansion; in either case, it assigns a new array to `table`.

```java
final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    int oldThr = threshold;
    int newCap, newThr = 0;
    if (oldCap > 0) {
        // Do not grow beyond the maximum capacity; collisions must be handled within the current table.
        if (oldCap >= MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        // If below the maximum, double the capacity.
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY && oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1; // double threshold
    }
    else if (oldThr > 0) // initial capacity was placed in threshold
        // The constructor stored the requested initial capacity in threshold; use it as the new table capacity.
        newCap = oldThr;
    else {
        // Use defaults: calculate the capacity and threshold for an instance created with the no-argument constructor.
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    if (newThr == 0) {
        // Initialize the threshold when an initial capacity or load factor was specified,
        // or calculate the new resize threshold if the old capacity was below 16.
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ? (int)ft : Integer.MAX_VALUE);
    }
    threshold = newThr;
    @SuppressWarnings({"rawtypes","unchecked"})
        Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
    if (oldTab != null) {
        // Transfer each bucket to the new table.
        for (int j = 0; j < oldCap; ++j) {
            Node<K,V> e;
            if ((e = oldTab[j]) != null) {
                oldTab[j] = null;
                if (e.next == null)
                    // A single node can be moved directly to its new position.
                    newTab[e.hash & (newCap - 1)] = e;
                else if (e instanceof TreeNode)
                    // Split the red-black tree into two trees. Convert a tree to a list
                    // if its node count is at most UNTREEIFY_THRESHOLD (6 by default).
                    // Otherwise, keep it as a tree.
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                else {
                    Node<K,V> loHead = null, loTail = null;
                    Node<K,V> hiHead = null, hiTail = null;
                    Node<K,V> next;
                    do {
                        next = e.next;
                        // Original index
                        if ((e.hash & oldCap) == 0) {
                            if (loTail == null)
                                loHead = e;
                            else
                                loTail.next = e;
                            loTail = e;
                        }
                        // Original index + oldCap
                        else {
                            if (hiTail == null)
                                hiHead = e;
                            else
                                hiTail.next = e;
                            hiTail = e;
                        }
                    } while ((e = next) != null);
                    // Place entries at the original index in the bucket.
                    if (loTail != null) {
                        loTail.next = null;
                        newTab[j] = loHead;
                    }
                    // Place entries at original index + oldCap in the bucket.
                    if (hiTail != null) {
                        hiTail.next = null;
                        newTab[j + oldCap] = hiHead;
                    }
                }
            }
        }
    }
    return newTab;
}
```

## Testing Common `HashMap` Methods

```java
package map;

import java.util.Collection;
import java.util.HashMap;
import java.util.Set;

public class HashMapDemo {

    public static void main(String[] args) {
        HashMap<String, String> map = new HashMap<String, String>();
        // Keys must be unique; values may be repeated.
        map.put("san", "张三");
        map.put("si", "李四");
        map.put("wu", "王五");
        map.put("wang", "老王");
        map.put("wang", "老王2");// Overwrites the previous value for Wang.
        map.put("lao", "老王");
        System.out.println("------- Print the HashMap -------");
        System.out.println(map);
        /**
         * Iterate over the HashMap.
         */
        // 1. Get all keys in the map.
        System.out.println("------- Get all map keys with for-each -------");
        Set<String> keys = map.keySet();
        for (String key : keys) {
            System.out.print(key+"  ");
        }
        System.out.println();// Print a blank line.
        // 2. Get all values in the map.
        System.out.println("------- Get all map values with for-each -------");
        Collection<String> values = map.values();
        for (String value : values) {
            System.out.print(value+"  ");
        }
        System.out.println();// Print a blank line.
        // 3. Get each key and its corresponding value.
        System.out.println("------- Get each key and its corresponding value -------");
        Set<String> keys2 = map.keySet();
        for (String key : keys2) {
            System.out.print(key + "：" + map.get(key)+"   ");

        }
        /**
         * If you need both keys and values, this approach is preferable.
         * Getting keySet and then calling map.get(key) would traverse the map twice:
         * once to get the key set and once to iterate over all keys.
         */
        // put(key, value) wraps the key and value in an Entry object,
        // then adds that Entry to the array. To get all key-value pairs,
        // iterate over the Entry objects and call getKey() and getValue().
        Set<java.util.Map.Entry<String, String>> entrys = map.entrySet();
        for (java.util.Map.Entry<String, String> entry : entrys) {
            System.out.println(entry.getKey() + "--" + entry.getValue());
        }

        /**
         * Other common HashMap methods
         */
        System.out.println("after map.size()："+map.size());
        System.out.println("after map.isEmpty()："+map.isEmpty());
        System.out.println(map.remove("san"));
        System.out.println("after map.remove()："+map);
        System.out.println("after map.get(si)："+map.get("si"));
        System.out.println("after map.containsKey(si)："+map.containsKey("si"));
        System.out.println("After containsValue: "+map.containsValue("李四"));
        System.out.println(map.replace("si", "李四2"));
        System.out.println("After map.replace: "+map);
    }

}
```

<!-- @include: @article-footer.snippet.md -->
