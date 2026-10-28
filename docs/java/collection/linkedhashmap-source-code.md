---
title: LinkedHashMap Source Code
description: A detailed look at how LinkedHashMap preserves insertion or access order with a doubly linked list, implements LRU caches, and differs from HashMap.
category: Java
tag:
  - Java Collections
head:
  - - meta
    - name: keywords
      content: LinkedHashMap source code,insertion order,access order,LRU cache,doubly linked list,ordered map,LinkedHashMap implementation
---

## Introduction

`LinkedHashMap` is a Java collection that extends `HashMap` and maintains a doubly linked list of entries. This gives it the following properties:

1. Iteration can follow insertion order.
2. It can order entries by access, which is useful for implementing an LRU cache.
3. Because it iterates over a doubly linked list of entries, iteration time is proportional to the number of entries. This can be faster than iterating over a `HashMap`, where the cost is proportional to the table capacity.

The diagram below shows the structure of `LinkedHashMap`. It maintains a doubly linked list across the nodes in the underlying `HashMap`, linking entries from different buckets, lists, or red-black trees in order.

![LinkedHashMap structure](https://oss.javaguide.cn/github/javaguide/java/collection/linkhashmap-structure-overview.png)

## `LinkedHashMap` Examples

### Iterating in Insertion Order

The following example adds entries to a `LinkedHashMap` and then iterates over them.

```java
HashMap < String, String > map = new LinkedHashMap < > ();
map.put("a", "2");
map.put("g", "3");
map.put("r", "1");
map.put("e", "23");

for (Map.Entry < String, String > entry: map.entrySet()) {
    System.out.println(entry.getKey() + ":" + entry.getValue());
}
```

Output:

```java
a:2
g:3
r:1
e:23
```

The iteration order of `LinkedHashMap` matches the insertion order. `HashMap` does not guarantee this behavior.

### Iterating in Access Order

`LinkedHashMap` has a boolean `accessOrder` flag. It defaults to `false`, which preserves insertion order; set it to `true` to preserve access order.

To iterate in access order, use a `LinkedHashMap` constructor that accepts `accessOrder` and set it to `true`.

```java
LinkedHashMap<Integer, String> map = new LinkedHashMap<>(16, 0.75f, true);
map.put(1, "one");
map.put(2, "two");
map.put(3, "three");
map.put(4, "four");
map.put(5, "five");
// Access element 2; it moves to the end of the list.
map.get(2);
// Access element 3; it moves to the end of the list.
map.get(3);
for (Map.Entry<Integer, String> entry : map.entrySet()) {
    System.out.println(entry.getKey() + " : " + entry.getValue());
}
```

Output:

```java
1 : one
4 : four
5 : five
2 : two
3 : three
```

The iteration order now follows the access order.

### LRU Cache

As shown above, you can use `LinkedHashMap` to implement a simple LRU (**l**east **r**ecently **u**sed) cache that removes the least recently accessed entry when the cache exceeds its capacity.

![](https://oss.javaguide.cn/github/javaguide/java/collection/lru-cache.png)

The implementation works as follows:

- Extend `LinkedHashMap`.
- Set `accessOrder` to `true` in the constructor. Accessed entries move to the tail, leaving the least recently accessed entry at the head.
- Override `removeEldestEntry()`, which returns a boolean indicating whether `LinkedHashMap` should remove the head entry when the cache has a size limit.

```java
public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    /**
     * Return true when size exceeds capacity so LinkedHashMap removes
     * the eldest cache entry (the first entry in the list).
     */
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}
```

The test below creates a cache with a capacity of 3, then adds 4 entries in order.

```java
LRUCache<Integer, String> cache = new LRUCache<>(3);
cache.put(1, "one");
cache.put(2, "two");
cache.put(3, "three");
cache.put(4, "four");
cache.put(5, "five");
for (int i = 1; i <= 5; i++) {
    System.out.println(cache.get(i));
}
```

Output:

```java
null
null
three
four
five
```

Because the cache holds at most 3 entries, adding the fourth removes the first entry. Adding a fifth entry then removes the second.

## `LinkedHashMap` Source Code

### Node Design

Before looking at `LinkedHashMap` itself, let's examine its `Entry` nodes. In `HashMap`, a bucket's linked list can be converted to a red-black tree when both of the following conditions are met:

1. ~~The list reaches the treeification threshold of 7, or `TREEIFY_THRESHOLD - 1`.~~
2. The table reaches the minimum capacity for treeification, `MIN_TREEIFY_CAPACITY`.

> **🐛 Correction (see [issue #2147](https://github.com/Snailclimb/JavaGuide/issues/2147)):**
>
> The list threshold is 8, not 7. The source starts iterating from the first node, whose index is 0. The condition is therefore checked when the index reaches `8 - 1 = 7`, by which point the list has at least 8 nodes and can be treeified.
>
> ![](https://oss.javaguide.cn/github/javaguide/java/jvm/LinkedHashMap-putval-TREEIFY.png)

`LinkedHashMap` adds a doubly linked list across the nodes in each `HashMap` bucket. As a result, nodes that are converted to a red-black tree must retain their linked-list properties. Each tree node needs two additional references for its predecessor and successor, which complicates the design of `TreeNode`.

The class diagram below shows the relationship between the node classes:

1. `LinkedHashMap.Entry` extends the `HashMap` node and adds `before` and `after` references for the doubly linked list.
2. `HashMap.TreeNode` extends `LinkedHashMap.Entry`, so tree nodes also have the linked-list references.

![Relationship between LinkedHashMap and HashMap](https://oss.javaguide.cn/github/javaguide/java/collection/map-hashmap-linkedhashmap.png)

You may wonder why `HashMap.TreeNode` gets its linked-list references through `LinkedHashMap.Entry` instead of adding predecessor and successor references directly to `Node`.

The reason is that `LinkedHashMap` adds doubly linked references to the `HashMap` nodes. When a bucket in `LinkedHashMap` is converted to a red-black tree, its nodes must retain those references. Therefore, `TreeNode` extends `LinkedHashMap.Entry`.

Adding predecessor and successor references directly to `HashMap.Node` would also work, but it would waste memory: ordinary `HashMap` nodes would carry two references that they do not need.

This design keeps `HashMap.Node` free of unnecessary references while allowing `LinkedHashMap.Entry` to store `before` and `after` links. `TreeNode` then inherits those links through `Entry`.

```java
static class Entry<K,V> extends HashMap.Node<K,V> {
        Entry<K,V> before, after;
        Entry(int hash, K key, V value, Node<K,V> next) {
            super(hash, key, value, next);
        }
    }
```

Doesn't this still add two unnecessary references to `TreeNode` when it is used by `HashMap`? Isn't that also a waste of space?

```java
static final class TreeNode<K,V> extends LinkedHashMap.Entry<K,V> {
  // Omitted

}
```

The authors address this in a comment: with a good `hashCode()` implementation, a `HashMap` is unlikely to treeify a bucket. Even when it does, removal or resizing can convert a `TreeNode` back to a regular `Node`. Since tree nodes are relatively uncommon, the extra memory use is acceptable.

```bash
Because TreeNodes are about twice the size of regular nodes, we
use them only when bins contain enough nodes to warrant use
(see TREEIFY_THRESHOLD). And when they become too small (due to
removal or resizing) they are converted back to plain bins.  In
usages with well-distributed user hashCodes, tree bins are
rarely used.  Ideally, under random hashCodes, the frequency of
nodes in bins follows a Poisson distribution
```

### Constructors

`LinkedHashMap` has four constructors. They are simple and delegate initialization to the `HashMap` constructor.

```java
public LinkedHashMap() {
    super();
    accessOrder = false;
}

public LinkedHashMap(int initialCapacity) {
    super(initialCapacity);
    accessOrder = false;
}

public LinkedHashMap(int initialCapacity, float loadFactor) {
    super(initialCapacity, loadFactor);
    accessOrder = false;
}

public LinkedHashMap(int initialCapacity,
    float loadFactor,
    boolean accessOrder) {
    super(initialCapacity, loadFactor);
    this.accessOrder = accessOrder;
}
```

As noted above, `accessOrder` defaults to `false`. To order entries by access, call the fourth constructor with `accessOrder` set to `true`. The least recently accessed entry stays at the head, and each recently accessed entry moves to the tail.

### The `get()` Method

`get()` is the only lookup or update method that `LinkedHashMap` overrides. When `accessOrder` is `true`, it moves the accessed entry to the end of the list after finding it.

```java
public V get(Object key) {
     Node < K, V > e;
     // Get the entry for key; return immediately if it is absent.
     if ((e = getNode(hash(key), key)) == null)
         return null;
     // If accessOrder is true, move the entry to the end of the list.
     if (accessOrder)
         afterNodeAccess(e);
     // Return the entry's value.
     return e.value;
 }
```

The `get()` method follows these steps:

1. Call `HashMap.getNode()` to find the entry. If it is absent, return immediately.
2. Check whether `accessOrder` is `true`.
3. If so, call the overridden `afterNodeAccess()` to move the entry to the end of the list.

The key is `afterNodeAccess()`, which moves an entry to the end of the list.

```java
void afterNodeAccess(Node < K, V > e) { // move node to last
    LinkedHashMap.Entry < K, V > last;
    // If accessOrder is true and the current node is not the tail
    if (accessOrder && (last = tail) != e) {

        // Get the current node, its predecessor, and its successor.
        LinkedHashMap.Entry < K, V > p =
            (LinkedHashMap.Entry < K, V > ) e, b = p.before, a = p.after;

        // Clear the current node's successor reference.
        p.after = null;

        // If there is no predecessor, the current node is the head; set its successor as the new head.
        if (b == null)
            head = a;
        else
            // Otherwise, link the predecessor to the successor.
            b.after = a;

        // If there is a successor, link it to the predecessor.
        if (a != null)
            a.before = b;
        else
            // If there is no successor, the current node is the tail.
            last = b;

        // If last is null, p is the only node; set head to p.
        if (last == null)
            head = p;
        else {
            // Otherwise, link p after the current tail.
            p.before = last;
            last.after = p;
        }
        // Set p as the new tail.
        tail = p;

        ++modCount;
    }
}
```

The `afterNodeAccess()` method performs these operations:

1. If `accessOrder` is `true` and `p` is not already the tail, move it to the tail.
2. Get `p`, its predecessor `b`, and its successor `a`.
3. Clear `p`'s successor reference.
4. Link the predecessor to the successor. If there is no predecessor, `p` was the head, so set `a` as the new head.
5. Link the successor back to the predecessor.
6. Append `p` to the end of the list. If there was no tail, `p` is the only node, so set it as the head.
7. Set the tail pointer to `p`.

The diagram shows how the entry with key 13 moves to the end of the list.

![LinkedHashMap moves entry 13 to the end of the list](https://oss.javaguide.cn/github/javaguide/java/collection/linkedhashmap-get.png)

If the details are not clear yet, focus on what the method does and return to the implementation later.

### `newNode()`: Append New Nodes to the List

The previous section explained how `afterNodeAccess()` moves an **existing node** to the tail. How are **new nodes** added to the list?

`LinkedHashMap` overrides `HashMap.newNode()`. When `HashMap` inserts a new key-value pair, it calls `newNode()` to create the node. The override creates an `Entry` and calls `linkNodeLast()` to append it to the doubly linked list:

```java
// HashMap's default newNode() implementation
Node<K,V> newNode(int hash, K key, V value, Node<K,V> next) {
    return new Node<>(hash, key, value, next);
}

// LinkedHashMap overrides newNode() and calls linkNodeLast().
Node<K,V> newNode(int hash, K key, V value, Node<K,V> e) {
    LinkedHashMap.Entry<K,V> p =
        new LinkedHashMap.Entry<>(hash, key, value, e);
    linkNodeLast(p);  // Append the new node to the list.
    return p;
}
```

Here is the implementation of `linkNodeLast()`:

```java
// Append a node to the end of the doubly linked list.
private void linkNodeLast(LinkedHashMap.Entry<K,V> p) {
    LinkedHashMap.Entry<K,V> last = tail;
    tail = p;  // Point tail to the new node.
    if (last == null)
        head = p;  // The list was empty, so head also points to the new node.
    else {
        p.before = last;  // The new node's predecessor is the old tail.
        last.after = p;   // The old tail's successor is the new node.
    }
}
```

**This is how `LinkedHashMap` preserves insertion order:** each new node is appended to the doubly linked list by the overridden `newNode()` method and `linkNodeLast()`. Iteration starts at `head` and follows the `after` references, returning entries in insertion order.

`LinkedHashMap` also overrides `newTreeNode()` so that new tree nodes are appended to the list as well:

```java
TreeNode<K,V> newTreeNode(int hash, K key, V value, Node<K,V> next) {
    TreeNode<K,V> p = new TreeNode<K,V>(hash, key, value, next);
    linkNodeLast(p);
    return p;
}
```

### Removal Hook: `afterNodeRemoval()`

`LinkedHashMap` inherits `HashMap.remove()` rather than overriding it. To also remove an entry from the doubly linked list, it overrides the empty `HashMap.afterNodeRemoval()` hook.

```java
final Node<K,V> removeNode(int hash, Object key, Object value,
                               boolean matchValue, boolean movable) {
        // Omitted
            if (node != null && (!matchValue || (v = node.value) == value ||
                                 (value != null && value.equals(v)))) {
                if (node instanceof TreeNode)
                    ((TreeNode<K,V>)node).removeTreeNode(this, tab, movable);
                else if (node == p)
                    tab[index] = node.next;
                else
                    p.next = node.next;
                ++modCount;
                --size;
                // HashMap.removeNode() calls afterNodeRemoval() after removing the entry.
                afterNodeRemoval(node);
                return node;
            }
        }
        return null;
    }
// Empty implementation
void afterNodeRemoval(Node<K,V> p) { }
```

The inherited `remove()` method calls `removeNode()` to remove the entry from its bucket, then calls `afterNodeRemoval()`.

```java
void afterNodeRemoval(Node<K,V> e) { // unlink

    // Get p, its predecessor b, and its successor a.
        LinkedHashMap.Entry<K,V> p =
            (LinkedHashMap.Entry<K,V>)e, b = p.before, a = p.after;
    // Clear p's predecessor and successor references.
        p.before = p.after = null;

    // If there is no predecessor, p is the head; set head to its successor a.
        if (b == null)
            head = a;
        else
        // Otherwise, link predecessor b to successor a.
            b.after = a;

    // If there is no successor, p is the tail; set tail to predecessor b.
        if (a == null)
            tail = b;
        else
        // Otherwise, link the successor back to the predecessor.
            a.before = b;
    }
```

The `afterNodeRemoval()` method unlinks `p` from its predecessor and successor so it can be garbage-collected. Its steps are:

1. Get `p`, its predecessor `b`, and its successor `a`.
2. Clear `p`'s references to its neighbors.
3. Link `b` to `a`. If `b` is null, `p` was the head, so set `head` to `a`.
4. Link `a` back to `b`. If `a` is null, `p` was the tail, so set `tail` to `b`.

The diagram shows how the entry with key 13 is removed from the list.

![LinkedHashMap removes entry 13](https://oss.javaguide.cn/github/javaguide/java/collection/linkedhashmap-remove.png)

If the details are not clear yet, focus on what the method does and return to the implementation later.

### Insertion Hook: `afterNodeInsertion()`

`LinkedHashMap` also inherits the insertion methods from `HashMap`. To maintain the order of its doubly linked list, it does two things:

1. It overrides `afterNodeAccess()`. If the key already exists, the insertion operation calls this method to move the existing entry to the tail when access-order behavior is enabled.
2. It overrides `HashMap.afterNodeInsertion()`. If `removeEldestEntry()` returns `true`, it removes the head entry from the list.

You can see this in `HashMap`'s core insertion method, `putVal()`:

```java
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
          // Omitted
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                 // If the key already exists in the map, call afterNodeAccess().
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        if (++size > threshold)
            resize();
         // Call the insertion hook overridden by LinkedHashMap.
        afterNodeInsertion(evict);
        return null;
    }
```

The previous sections covered the other steps. Here, we focus on `afterNodeInsertion()`. Suppose `removeEldestEntry()` is overridden to return `true` when the list size exceeds its capacity.

```java
/**
 * Return true when size exceeds capacity so LinkedHashMap removes
 * the eldest cache entry (the first entry in the list).
 */
protected boolean removeEldestEntry(Map.Entry < K, V > eldest) {
    return size() > capacity;
}
```

In the example below, a new entry with key 19 is inserted and the capacity is 4. `removeEldestEntry()` returns `true`, so the head entry must be removed.

![Insert a new entry with key 19 into LinkedHashMap](https://oss.javaguide.cn/github/javaguide/java/collection/linkedhashmap-after-insert-1.png)

Removal is straightforward: if the list has a head node, unlink it from its successor and point `head` to the next node. In this example, `head` now points to 12, and no references point to node 10, so it can be garbage-collected.

![LinkedHashMap after inserting a new entry with key 19](https://oss.javaguide.cn/github/javaguide/java/collection/linkedhashmap-after-insert-2.png)

```java
void afterNodeInsertion(boolean evict) { // possibly remove eldest
        LinkedHashMap.Entry<K,V> first;
        // If evict is true, the list is non-empty, and removeEldestEntry() returns true, remove the eldest entry.
        if (evict && (first = head) != null && removeEldestEntry(first)) {
          // Get the key of the first entry in the list.
            K key = first.key;
            // Remove the entry from the HashMap bucket and unlink it from the LinkedHashMap list.
            removeNode(hash(key), key, null, false, true);
        }
    }
```

The `afterNodeInsertion()` method performs these operations:

1. Check whether `evict` is true, the list is non-empty (`(first = head) != null`), and `removeEldestEntry()` returns true. If all three conditions hold, remove the eldest entry.
2. Get the key of the first entry in the list.
3. Call `HashMap.removeNode()` to remove the entry from its bucket. This also invokes the overridden `afterNodeRemoval()` hook to unlink it from the `LinkedHashMap` list.

## Iteration Performance: `LinkedHashMap` vs. `HashMap`

`LinkedHashMap` maintains a doubly linked list that records entry order, so its iterators follow that list. This can be more efficient than the way `HashMap` scans its buckets.

The iterator implementations illustrate this difference. `HashMap` uses `nextNode()` to return the next entry and scan buckets until it finds a non-empty one.

```java
 final class EntryIterator extends HashIterator
 implements Iterator < Map.Entry < K, V >> {
     public final Map.Entry < K,
     V > next() {
         return nextNode();
     }
 }

 // Get the next Node.
 final Node < K, V > nextNode() {
     Node < K, V > [] t;
     // Get the next element.
     Node < K, V > e = next;
     if (modCount != expectedModCount)
         throw new ConcurrentModificationException();
     if (e == null)
         throw new NoSuchElementException();
     // Advance next to the next non-empty bucket.
     if ((next = (current = e).next) == null && (t = table) != null) {
         do {} while (index < t.length && (next = t[index++]) == null);
     }
     return e;
 }
```

By contrast, `LinkedHashMap`'s iterator uses the `after` reference to move directly to the current node's successor.

```java
 final class LinkedEntryIterator extends LinkedHashIterator
 implements Iterator < Map.Entry < K, V >> {
     public final Map.Entry < K,
     V > next() {
         return nextNode();
     }
 }
 // Get the next Node.
 final LinkedHashMap.Entry < K, V > nextNode() {
     // Get the next node.
     LinkedHashMap.Entry < K, V > e = next;
     if (modCount != expectedModCount)
         throw new ConcurrentModificationException();
     if (e == null)
         throw new NoSuchElementException();
     // Point current to the current node.
     current = e;
     // Use the current node's after reference to move directly to the next node.
     next = e.after;
     return e;
 }
```

To compare the two collections, the following benchmark measures the time to insert and iterate over 10 million entries:

```java
int count = 1000_0000;
Map<Integer, Integer> hashMap = new HashMap<>();
Map<Integer, Integer> linkedHashMap = new LinkedHashMap<>();

long start, end;

start = System.currentTimeMillis();
for (int i = 0; i < count; i++) {
    hashMap.put(ThreadLocalRandom.current().nextInt(1, count), ThreadLocalRandom.current().nextInt(0, count));
}
end = System.currentTimeMillis();
System.out.println("map time putVal: " + (end - start));

start = System.currentTimeMillis();
for (int i = 0; i < count; i++) {
    linkedHashMap.put(ThreadLocalRandom.current().nextInt(1, count), ThreadLocalRandom.current().nextInt(0, count));
}
end = System.currentTimeMillis();
System.out.println("linkedHashMap putVal time: " + (end - start));

start = System.currentTimeMillis();
long num = 0;
for (Integer v : hashMap.values()) {
    num = num + v;
}
end = System.currentTimeMillis();
System.out.println("map get time: " + (end - start));

start = System.currentTimeMillis();
for (Integer v : linkedHashMap.values()) {
    num = num + v;
}
end = System.currentTimeMillis();
System.out.println("linkedHashMap get time: " + (end - start));
System.out.println(num);
```

The results show that insertions take longer in `LinkedHashMap` because it must maintain a doubly linked list. Iteration is faster because each entry has explicit predecessor and successor links. Overall, however, the difference is modest for a data set this large.

```bash
map time putVal: 5880
linkedHashMap putVal time: 7567
map get time: 143
linkedHashMap get time: 67
63208969074998
```

## Common `LinkedHashMap` Interview Questions

### What is `LinkedHashMap`?

`LinkedHashMap` is a subclass of `HashMap`. It inherits its properties and methods, and overrides `afterNodeRemoval()`, `afterNodeInsertion()`, and `afterNodeAccess()` to preserve insertion or access order.

### How does `LinkedHashMap` iterate in insertion order?

Insertion-order iteration is the default. `LinkedHashMap` maintains a doubly linked list in insertion order, so its iterator returns entries in the order they were added.

### How does `LinkedHashMap` iterate in access order?

Set the constructor's `accessOrder` parameter to `true`. Each time an entry is accessed, it moves to the end of the list, so iteration follows access order.

### How does `LinkedHashMap` implement an LRU cache?

Set `accessOrder` to `true` and override `removeEldestEntry()` to return `true` when the list exceeds its capacity. Each access moves the entry to the tail. When an insertion causes `removeEldestEntry()` to return `true`, `LinkedHashMap` removes the head entry, implementing an LRU cache.

### How does `LinkedHashMap` differ from `HashMap`?

Both classes implement `Map`. Their main difference is iteration order: `HashMap` does not guarantee an order, while `LinkedHashMap` can iterate by insertion or access order. `LinkedHashMap` maintains a doubly linked list to track that order, which can make insertion slightly slower but iteration faster than in `HashMap`.

## References

- [A Detailed Analysis of LinkedHashMap Source Code (JDK 8)](https://www.imooc.com/article/22931)
- [HashMap and LinkedHashMap](https://www.cnblogs.com/Spground/p/8536148.html)
- [Based on the LinkedHashMap Source Code](https://leetcode.cn/problems/lru-cache/solution/yuan-yu-linkedhashmapyuan-ma-by-jeromememory/)
<!-- @include: @article-footer.snippet.md -->
