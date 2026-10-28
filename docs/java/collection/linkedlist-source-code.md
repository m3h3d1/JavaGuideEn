---
title: LinkedList Source Code
description: A detailed look at LinkedList's doubly linked structure, Deque implementation, O(1) insertions and removals at either end, and how it compares with ArrayList.
category: Java
tag:
  - Java Collections
head:
  - - meta
    - name: keywords
      content: LinkedList source code,doubly linked list,Deque interface,LinkedList vs ArrayList,insertion and removal performance,linked-list implementation
---

<!-- @include: @article-header.snippet.md -->

## Introduction

`LinkedList` is a collection backed by a doubly linked list and is often compared with `ArrayList`. For a detailed comparison, see [Common Java Collection Interview Questions (Part 1)](./java-collection-questions-01.md).

![Doubly linked list](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/bidirectional-linkedlist.png)

In most projects, `ArrayList` can replace `LinkedList` in many of its use cases and often performs better. Josh Bloch, who wrote `LinkedList`, has even said that he never uses it.

![](https://oss.javaguide.cn/github/javaguide/redisimage-20220412110853807.png)

Do not assume that `LinkedList` is always the best choice for frequent insertions and removals. Only operations at the head or tail are close to `O(1)`; most other insertions and removals take `O(n)` because the target node must first be found.

### What are the time complexities of inserting into and removing from a `LinkedList`?

- Inserting or removing at the head takes `O(1)` because it only requires updating the head pointer.
- Inserting or removing at the tail takes `O(1)` because it only requires updating the tail pointer.
- Inserting or removing at a specified index requires finding that position and then updating pointers. Since traversal can start from the closer end, it visits about `n/4` elements on average, but the time complexity is still `O(n)`.

### Why doesn't `LinkedList` implement `RandomAccess`?

`RandomAccess` is a marker interface indicating that a class supports fast indexed access. A `LinkedList` is backed by nodes that are not stored in contiguous memory, so it must follow pointers to locate an element. It does not support fast random access and therefore does not implement `RandomAccess`.

## `LinkedList` Source Code

The following analysis uses the JDK 8 implementation of `LinkedList`.

Here is the class definition:

```java
public class LinkedList<E>
    extends AbstractSequentialList<E>
    implements List<E>, Deque<E>, Cloneable, java.io.Serializable
{
  //...
}
```

`LinkedList` extends `AbstractSequentialList`, which in turn extends `AbstractList`.

Like `ArrayList`, `LinkedList` inherits from `AbstractList`, so many of their methods are similar.

`LinkedList` implements these interfaces:

- `List`: identifies it as a list that supports operations such as adding, removing, and searching for elements, as well as indexed access.
- `Deque`: extends `Queue` with operations at both ends, which is useful for implementing queues and stacks. `Deque` is pronounced "deck" ([dɛk]).
- `Cloneable`: indicates that the class supports copying with `clone()`.
- `Serializable`: indicates that instances can be serialized to a byte stream for storage or network transfer.

![LinkedList class diagram](https://oss.javaguide.cn/github/javaguide/java/collection/linkedlist--class-diagram.png)

`LinkedList` stores its elements in `Node` objects:

```java
private static class Node<E> {
    E item;// Node value
    Node<E> next; // Reference to the next node
    Node<E> prev; // Reference to the previous node

    // Constructor parameters: previous node, node value, and next node
    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}
```

### Initialization

`LinkedList` has a no-argument constructor and a constructor that accepts a collection.

```java
// Create an empty linked list.
public LinkedList() {
}

// Create a linked list containing the elements of the specified collection.
public LinkedList(Collection<? extends E> c) {
    this();
    addAll(c);
}
```

### Inserting Elements

In addition to the methods required by `List`, `LinkedList` implements many `Deque` methods, so there are several ways to insert elements.

This section examines the `add()` methods from the `List` interface.

There are two versions of `add()`:

- `add(E e)`: appends an element to the end of the list in `O(1)` time.
- `add(int index, E element)`: inserts an element at the specified position. The list must first traverse to that position and then update the node pointers. It visits about `n/4` elements on average, but the time complexity is `O(n)`.

```java
// Append an element to the end of the list.
public boolean add(E e) {
    linkLast(e);
    return true;
}

// Insert an element at the specified position.
public void add(int index, E element) {
    // Check that the index is in range.
    checkPositionIndex(index);

    // Check whether index is the end of the list.
    if (index == size)
        // If so, call linkLast() to append the node.
        linkLast(element);
    else
        // Otherwise, call linkBefore() to insert it before the current element.
        linkBefore(element, node(index));
}

// Inserts a node at the end of the list.
void linkLast(E e) {
    // Store the current last node in l.
    final Node<E> l = last;
    // Create a node whose previous node is last and whose next node is null.
    final Node<E> newNode = new Node<>(l, e, null);
    // Update last to point to the new node.
    last = newNode;
    // Check whether the list was empty.
    // If l is null, this is the first insertion.
    if (l == null)
        // Set first to the new node; it is the only element in the list.
        first = newNode;
    else
        // Otherwise, link the previous last node to the new node.
        l.next = newNode;
    size++;
    modCount++;
}

// Inserts a node before the specified successor.
void linkBefore(E e, Node<E> succ) {
    // Assert that succ is not null.
    // Save succ's previous node.
    final Node<E> pred = succ.prev;
    // Create the new node with its previous and next nodes.
    final Node<E> newNode = new Node<>(pred, e, succ);
    // Update succ's previous-node reference.
    succ.prev = newNode;
    // If the previous node is null, succ was the first node.
    if (pred == null)
        // The new node becomes the first node.
        first = newNode;
    else
        // Otherwise, link the previous node to the new node.
        pred.next = newNode;
    size++;
    modCount++;
}
```

### Accessing Elements

`LinkedList` provides three methods for accessing elements:

1. `getFirst()`: returns the first element.
2. `getLast()`: returns the last element.
3. `get(int index)`: returns the element at the specified position.

```java
// Get the first element.
public E getFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return f.item;
}

// Get the last element.
public E getLast() {
    final Node<E> l = last;
    if (l == null)
        throw new NoSuchElementException();
    return l.item;
}

// Get the element at the specified position.
public E get(int index) {
  // Check the index and throw an exception if it is out of range.
  checkElementIndex(index);
  // Return the element at the specified index.
  return node(index).item;
}
```

The key is the `node(int index)` method:

```java
// Returns the non-null node at the specified index.
Node<E> node(int index) {
    // Assert that the index is in range.
    // assert isElementIndex(index);
    // Start from the head if index is in the first half; otherwise, start from the tail.
    if (index < (size >> 1)) {
        Node<E> x = first;
        // Traverse forward until i == index.
        for (int i = 0; i < index; i++)
            x = x.next;
        return x;
    } else {
        Node<E> x = last;
        for (int i = size - 1; i > index; i--)
            x = x.prev;
        return x;
    }
}
```

Methods such as `get(int index)` and `remove(int index)` call this method to find the corresponding node.

The source compares the index with half the list size to decide whether to traverse from the head or the tail. It starts from the closer end, reducing the number of nodes it needs to visit.

### Removing Elements

`LinkedList` provides five methods for removing elements:

1. `removeFirst()`: removes and returns the first element.
2. `removeLast()`: removes and returns the last element.
3. `remove(E e)`: removes the first occurrence of the specified element and returns `false` if it is not found.
4. `remove(int index)`: removes and returns the element at the specified index.
5. `clear()`: removes all elements from the list.

```java
// Remove and return the first element.
public E removeFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return unlinkFirst(f);
}

// Remove and return the last element.
public E removeLast() {
    final Node<E> l = last;
    if (l == null)
        throw new NoSuchElementException();
    return unlinkLast(l);
}

// Remove the first occurrence of the specified element; return false if it is absent.
public boolean remove(Object o) {
    // If the specified element is null, find and remove the first null element.
    if (o == null) {
        for (Node<E> x = first; x != null; x = x.next) {
            if (x.item == null) {
                unlink(x);
                return true;
            }
        }
    } else {
        // Otherwise, find the node to remove.
        for (Node<E> x = first; x != null; x = x.next) {
            if (o.equals(x.item)) {
                unlink(x);
                return true;
            }
        }
    }
    return false;
}

// Remove the element at the specified position.
public E remove(int index) {
    // Check the index and throw an exception if it is out of range.
    checkElementIndex(index);
    return unlink(node(index));
}
```

The key is the `unlink(Node<E> x)` method:

```java
E unlink(Node<E> x) {
    // Assert that x is not null.
    // assert x != null;
    // Get the element stored in x.
    final E element = x.item;
    // Get the next node.
    final Node<E> next = x.next;
    // Get the previous node.
    final Node<E> prev = x.prev;

    // If there is no previous node, x is the head.
    if (prev == null) {
        // Make the next node the new head.
        first = next;
    } else { // If there is a previous node
        // Link the previous node to the next node.
        prev.next = next;
        // Clear x's prev reference so it can be reclaimed by the garbage collector.
        x.prev = null;
    }

    // If there is no next node, x is the tail.
    if (next == null) {
        // Make the previous node the new tail.
        last = prev;
    } else { // If there is a next node
        // Link the next node to the previous node.
        next.prev = prev;
        // Clear x's next reference so it can be reclaimed by the garbage collector.
        x.next = null;
    }

    // Clear x's element so it can be reclaimed by the garbage collector.
    x.item = null;
    size--;
    modCount++;
    return element;
}
```

The `unlink()` method works as follows:

1. Get the previous and next nodes of the node `x` to remove.
2. Check whether `x` is the head or tail:
   - If `x` is the head, set `first` to `x`'s next node.
   - If `x` is the tail, set `last` to `x`'s previous node.
   - If `x` is neither, continue to the next steps.
3. Point `x`'s previous node to `x`'s next node, unlinking `x` from its predecessor.
4. Point `x`'s next node back to `x`'s previous node, unlinking `x` from its successor.
5. Clear `x`'s element and update the list size.

The diagram below illustrates the process. Source: [LinkedList Source Code (JDK 1.8)](https://www.tianxiaobo.com/2018/01/31/LinkedList-%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90-JDK-1-8/).

![How the unlink method works](https://oss.javaguide.cn/github/javaguide/java/collection/linkedlist-unlink.jpg)

### Iterating Over the List

Use a `for-each` loop to iterate over a `LinkedList`; it is compiled to use an iterator.

```java
LinkedList<String> list = new LinkedList<>();
list.add("apple");
list.add("banana");
list.add("pear");

for (String fruit : list) {
    System.out.println(fruit);
}
```

The iterator implementation is central to `LinkedList` traversal.

```java
// Doubly linked list iterator
private class ListItr implements ListIterator<E> {
    // Node returned by the last call to next() or previous()
    private Node<E> lastReturned;
    // Next node to return
    private Node<E> next;
    // Index of the next node to return
    private int nextIndex;
    // Expected modification count, compared with LinkedList.modCount to detect external changes
    private int expectedModCount = modCount;
    …………
}
```

The following sections explain the key methods in the `ListItr` iterator.

First, iteration from head to tail:

```java
// Check whether there is a next node.
public boolean hasNext() {
    // There is another element if the next index is less than the list size.
    return nextIndex < size;
}
// Get the next node.
public E next() {
    // Check whether the list was modified during iteration.
    checkForComodification();
    // Throw NoSuchElementException if there is no next element.
    if (!hasNext())
        throw new NoSuchElementException();
    // Point lastReturned to the current node.
    lastReturned = next;
    // Advance next to the following node.
    next = next.next;
    nextIndex++;
    return lastReturned.item;
}
```

Now, iteration from tail to head:

```java
// Check whether there is a previous node.
public boolean hasPrevious() {
    return nextIndex > 0;
}

// Get the previous node.
public E previous() {
    // Check whether the list was modified during iteration.
    checkForComodification();
    // Throw an exception if there is no previous node.
    if (!hasPrevious())
        throw new NoSuchElementException();
    // Point lastReturned and next to the previous node.
    lastReturned = next = (next == null) ? last : next.prev;
    nextIndex--;
    return lastReturned.item;
}
```

You can also use the iterator to remove or insert elements.

```java
LinkedList<String> list = new LinkedList<>();
list.add("apple");
list.add(null);
list.add("banana");

// Collection.removeIf() also uses an iterator internally.
list.removeIf(Objects::isNull);

for (String fruit : list) {
    System.out.println(fruit);
}
```

The iterator's removal method is shown below:

```java
// Remove the element returned by the last call to next() or previous().
public void remove() {
    // Check whether the list was modified during iteration.
    checkForComodification();
    // Throw an exception if there is no last-returned node.
    if (lastReturned == null)
        throw new IllegalStateException();

    // Get the current node's successor.
    Node<E> lastNext = lastReturned.next;
    // Remove the last-returned node from the list.
    unlink(lastReturned);
    // Update the iterator pointers.
    if (next == lastReturned)
        next = lastNext;
    else
        nextIndex--;
    // Clear the reference to the last-returned node so it can be garbage-collected.
    lastReturned = null;
    expectedModCount++;
}
```

## Testing Common `LinkedList` Methods

Code:

```java
// Create a LinkedList.
LinkedList<String> list = new LinkedList<>();

// Append elements to the list.
list.add("apple");
list.add("banana");
list.add("pear");
System.out.println("List contents: " + list);

// Insert an element at the specified position.
list.add(1, "orange");
System.out.println("List contents: " + list);

// Get the element at the specified position.
String fruit = list.get(2);
System.out.println("Element at index 2: " + fruit);

// Replace the element at the specified position.
list.set(3, "grape");
System.out.println("List contents: " + list);

// Remove the element at the specified position.
list.remove(0);
System.out.println("List contents: " + list);

// Remove the first occurrence of the specified element.
list.remove("banana");
System.out.println("List contents: " + list);

// Get the list size.
int size = list.size();
System.out.println("List size: " + size);

// Clear the list.
list.clear();
System.out.println("List after clearing: " + list);
```

Output:

```plain
Element at index 2: banana
List contents: [apple, orange, banana, grape]
List contents: [orange, banana, grape]
List contents: [orange, grape]
List size: 2
List after clearing: []
```

<!-- @include: @article-footer.snippet.md -->
