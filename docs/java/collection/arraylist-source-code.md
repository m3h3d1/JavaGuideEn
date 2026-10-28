---
title: ArrayList Source Code
description: A detailed look at ArrayList's backing array, 1.5x growth strategy, RandomAccess support, serialization, and performance compared with Vector.
category: Java
tag:
  - Java Collections
head:
  - - meta
    - name: keywords
      content: ArrayList source code,ArrayList resizing,dynamic array,RandomAccess,ArrayList serialization,ArrayList vs Vector
---

## Introduction

`ArrayList` is backed by an array that can grow dynamically. Before adding many elements, you can call `ensureCapacity` to increase its capacity and reduce the number of reallocations.

`ArrayList` extends `AbstractList` and implements `List`, `RandomAccess`, `Cloneable`, and `java.io.Serializable`.

```java

public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable{

  }
```

- `List`: identifies it as a list that supports operations such as adding, removing, and searching for elements, as well as indexed access.
- `RandomAccess`: a marker interface indicating that the list supports **fast random access**. With `ArrayList`, you can retrieve an element quickly by its index.
- `Cloneable`: indicates that it supports copying with `clone()`. `ArrayList#clone()` returns a shallow copy.
- `Serializable`: indicates that it can be serialized, converting the object to a byte stream for persistent storage or network transfer.

![ArrayList class diagram](https://oss.javaguide.cn/github/javaguide/java/collection/arraylist-class-diagram.png)

### How do `ArrayList` and `Vector` differ? (For reference)

- `ArrayList` is a common `List` implementation backed by an `Object[]`. It is suitable for frequent lookups but is not thread-safe.
- `Vector` is a legacy `List` implementation backed by an `Object[]`. It is thread-safe.

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

### How do `ArrayList` and `LinkedList` differ?

- **Thread safety:** Neither `ArrayList` nor `LinkedList` is synchronized, so neither is thread-safe.
- **Underlying data structure:** `ArrayList` uses an **`Object` array**. `LinkedList` uses a **doubly linked list**. The list was circular before JDK 1.7; the circular links were removed in JDK 1.7.
- **How position affects insertion and removal:**
  - `ArrayList` stores elements in an array, so the cost depends on where elements are inserted or removed. Appending with `add(E e)` takes `O(1)` when there is spare capacity. Inserting or removing at index `i` takes `O(n)` because later elements must shift.
  - `LinkedList` stores elements as linked nodes, so insertion and removal at either end take `O(1)` (`addFirst()`, `addLast()`, `removeFirst()`, and `removeLast()`). Operations at index `i` take `O(n)` because the list must first be traversed to that position.
- **Fast random access:** `ArrayList` implements `RandomAccess` and supports efficient indexed access through `get(int index)`. `LinkedList` does not.
- **Memory use:** `ArrayList` may reserve unused capacity at the end of its backing array. Each `LinkedList` node uses extra space for its data and links to its previous and next nodes.

## Understanding the Core `ArrayList` Source Code

The analysis below uses the JDK 8 implementation of `ArrayList`.

```java
public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable {
    private static final long serialVersionUID = 8683452581122892189L;

    /**
     * Default initial capacity
     */
    private static final int DEFAULT_CAPACITY = 10;

    /**
     * Shared empty array used by empty instances.
     */
    private static final Object[] EMPTY_ELEMENTDATA = {};

    // Shared empty array for instances created with the default constructor.
    // It differs from EMPTY_ELEMENTDATA so the first insertion can grow to the default capacity.
    private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

    /**
     * Array storing the ArrayList elements
     */
    transient Object[] elementData; // non-private to simplify nested class access

    /**
     * Number of elements in the ArrayList
     */
    private int size;

    /**
     * Constructor with an initial capacity specified by the caller.
     */
    public ArrayList(int initialCapacity) {
        if (initialCapacity > 0) {
            // If initialCapacity is positive, create an array of that size.
            this.elementData = new Object[initialCapacity];
        } else if (initialCapacity == 0) {
            // If initialCapacity is 0, use an empty array.
            this.elementData = EMPTY_ELEMENTDATA;
        } else {
            // Otherwise, throw an exception.
            throw new IllegalArgumentException("Illegal Capacity: " +
                    initialCapacity);
        }
    }

    /**
     * Default no-argument constructor.
     * DEFAULTCAPACITY_EMPTY_ELEMENTDATA is empty; the array grows to 10 when the first element is added.
     */
    public ArrayList() {
        this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
    }

    /**
     * Constructs a list containing the elements of the specified collection,
     * in the order returned by the collection's iterator.
     */
    public ArrayList(Collection<? extends E> c) {
        // Convert the specified collection to an array.
        elementData = c.toArray();
        // If the elementData array is not empty
        if ((size = elementData.length) != 0) {
            // c.toArray() may return an array whose runtime type is not Object[].
            if (elementData.getClass() != Object[].class)
                // Copy its contents into a new Object[] array.
                elementData = Arrays.copyOf(elementData, size, Object[].class);
        } else {
            // Otherwise, use an empty array.
            this.elementData = EMPTY_ELEMENTDATA;
        }
    }

    /**
     * Trims this ArrayList instance's capacity to its current size.
     * Applications can use this operation to minimize its storage.
     */
    public void trimToSize() {
        modCount++;
        if (size < elementData.length) {
            elementData = (size == 0)
                    ? EMPTY_ELEMENTDATA
                    : Arrays.copyOf(elementData, size);
        }
    }
// The following code implements ArrayList's growth strategy.
// Growing by only one slot each time would cause frequent copying
// and reduce performance; growing by more avoids that overhead.

    /**
     * Increases this ArrayList's capacity, if necessary, to ensure that it can
     * hold at least the specified number of elements.
     *
     * @param minCapacity the minimum required capacity
     */
    public void ensureCapacity(int minCapacity) {
        // For a non-default empty array, minExpand is 0.
        // For the default empty array, minExpand is 10.
        int minExpand = (elementData != DEFAULTCAPACITY_EMPTY_ELEMENTDATA)
                // A non-default array can grow to any required size.
                ? 0
                // The default empty array should grow to the default capacity.
                : DEFAULT_CAPACITY;

        // If the requested minimum exceeds the current capacity
        if (minCapacity > minExpand) {
            // Ensure the capacity meets the request.
            ensureExplicitCapacity(minCapacity);
        }
    }


    // Calculates the required capacity from the minimum and current array.
    private static int calculateCapacity(Object[] elementData, int minCapacity) {
        // For an empty default array, return the larger of the default and minimum capacities.
        if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
            return Math.max(DEFAULT_CAPACITY, minCapacity);
        }
        // Otherwise, return the requested minimum.
        return minCapacity;
    }

    // Ensures that the internal array reaches the specified minimum capacity.
    private void ensureCapacityInternal(int minCapacity) {
        ensureExplicitCapacity(calculateCapacity(elementData, minCapacity));
    }

    // Check whether the array needs to grow.
    private void ensureExplicitCapacity(int minCapacity) {
        modCount++;
        // overflow-conscious code
        if (minCapacity - elementData.length > 0)
            // Call grow() to increase the capacity.
            grow(minCapacity);
    }

    /**
     * Maximum array size to allocate
     */
    private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;

    /**
     * The core method for growing the ArrayList.
     */
    private void grow(int minCapacity) {
        // oldCapacity is the old capacity; newCapacity is the new capacity.
        int oldCapacity = elementData.length;
        // Shifting oldCapacity right by one is equivalent to dividing it by 2.
        // Bit shifts are faster than division; this expression grows capacity to about 1.5 times its old value.
        int newCapacity = oldCapacity + (oldCapacity >> 1);
        // If the new capacity is still below the requested minimum, use that minimum instead.
        if (newCapacity - minCapacity < 0)
            newCapacity = minCapacity;
        // Check whether the new capacity exceeds ArrayList's maximum.
        // If so, hugeCapacity() compares minCapacity with MAX_ARRAY_SIZE.
        // It returns Integer.MAX_VALUE if minCapacity is larger; otherwise, it returns MAX_ARRAY_SIZE.
        if (newCapacity - MAX_ARRAY_SIZE > 0)
            newCapacity = hugeCapacity(minCapacity);
        // minCapacity is usually close to size, so this is a win:
        elementData = Arrays.copyOf(elementData, newCapacity);
    }

    // Compare minCapacity with MAX_ARRAY_SIZE.
    private static int hugeCapacity(int minCapacity) {
        if (minCapacity < 0) // overflow
            throw new OutOfMemoryError();
        return (minCapacity > MAX_ARRAY_SIZE) ?
                Integer.MAX_VALUE :
                MAX_ARRAY_SIZE;
    }

    /**
     * Returns the number of elements in this list.
     */
    public int size() {
        return size;
    }

    /**
     * Returns true if this list contains no elements.
     */
    public boolean isEmpty() {
        // Note the difference between = and ==.
        return size == 0;
    }

    /**
     * Returns true if this list contains the specified element.
     */
    public boolean contains(Object o) {
        // indexOf() returns the index of the first occurrence, or -1 if the element is absent.
        return indexOf(o) >= 0;
    }

    /**
     * Returns the index of the first occurrence of the specified element,
     * or -1 if this list does not contain it.
     */
    public int indexOf(Object o) {
        if (o == null) {
            for (int i = 0; i < size; i++)
                if (elementData[i] == null)
                    return i;
        } else {
            for (int i = 0; i < size; i++)
                // Compare with equals().
                if (o.equals(elementData[i]))
                    return i;
        }
        return -1;
    }

    /**
     * Returns the index of the last occurrence of the specified element,
     * or -1 if this list does not contain it.
     */
    public int lastIndexOf(Object o) {
        if (o == null) {
            for (int i = size - 1; i >= 0; i--)
                if (elementData[i] == null)
                    return i;
        } else {
            for (int i = size - 1; i >= 0; i--)
                if (o.equals(elementData[i]))
                    return i;
        }
        return -1;
    }

    /**
     * Returns a shallow copy of this ArrayList instance.
     * The elements themselves are not copied.
     */
    public Object clone() {
        try {
            ArrayList<?> v = (ArrayList<?>) super.clone();
            // Arrays.copyOf() copies the array and returns the copy.
            v.elementData = Arrays.copyOf(elementData, size);
            v.modCount = 0;
            return v;
        } catch (CloneNotSupportedException e) {
            // This should not happen because this class is Cloneable.
            throw new InternalError(e);
        }
    }

    /**
     * Returns an array containing all elements in this list in order,
     * from the first to the last element.
     * The returned array is safe because the list does not retain a reference to it.
     * In other words, this method must allocate a new array.
     * The caller may freely modify the returned array's structure.
     * Note: If the elements are references, changing an element's state also
     * affects the corresponding object in the original list.
     * This method bridges array-based and collection-based APIs.
     */
    public Object[] toArray() {
        return Arrays.copyOf(elementData, size);
    }

    /**
     * Returns an array containing all elements in this list in order,
     * from the first to the last element. The returned array has the runtime
     * type of the specified array. If the list fits, it is returned in that array.
     * Otherwise, a new array of the specified runtime type and the list's size
     * is allocated.
     * If the specified array is larger than the list, the element immediately
     * after the list's last element is set to null.
     * (This can be used to determine the list's length only if the caller knows
     * that the list contains no null elements.)
     */
    @SuppressWarnings("unchecked")
    public <T> T[] toArray(T[] a) {
        if (a.length < size)
            // Create an array of the requested runtime type and copy the elements.
            return (T[]) Arrays.copyOf(elementData, size, a.getClass());
        // Use System.arraycopy() to copy the elements.
        System.arraycopy(elementData, 0, a, 0, size);
        if (a.length > size)
            a[size] = null;
        return a;
    }

    // Positional Access Operations

    @SuppressWarnings("unchecked")
    E elementData(int index) {
        return (E) elementData[index];
    }

    /**
     * Returns the element at the specified position in this list.
     */
    public E get(int index) {
        rangeCheck(index);

        return elementData(index);
    }

    /**
     * Replaces the element at the specified position with the specified element.
     */
    public E set(int index, E element) {
        // Check that the index is in range.
        rangeCheck(index);

        E oldValue = elementData(index);
        elementData[index] = element;
        // Return the element previously at this position.
        return oldValue;
    }

    /**
     * Appends the specified element to the end of this list.
     */
    public boolean add(E e) {
        ensureCapacityInternal(size + 1);  // Increments modCount!!
        // Adding an element to ArrayList ultimately assigns it into the array.
        elementData[size++] = e;
        return true;
    }

    /**
     * Inserts the specified element at the specified position in this list.
     * First, rangeCheckForAdd() checks the index. Then ensureCapacityInternal()
     * ensures sufficient capacity. The elements from index onward are shifted
     * one position to the right, the new element is inserted, and size is incremented.
     */
    public void add(int index, E element) {
        rangeCheckForAdd(index);

        ensureCapacityInternal(size + 1);  // Increments modCount!!
        // System.arraycopy() copies elements within the same array here.
        System.arraycopy(elementData, index, elementData, index + 1,
                size - index);
        elementData[index] = element;
        size++;
    }

    /**
     * Removes the element at the specified position in this list.
     * Shifts any later elements to the left by one position.
     */
    public E remove(int index) {
        rangeCheck(index);

        modCount++;
        E oldValue = elementData(index);

        int numMoved = size - index - 1;
        if (numMoved > 0)
            System.arraycopy(elementData, index + 1, elementData, index,
                    numMoved);
        elementData[--size] = null; // clear to let GC do its work
        // Element to be removed from the list
        return oldValue;
    }

    /**
     * Removes the first occurrence of the specified element, if present.
     * If the list does not contain the element, it remains unchanged.
     * Returns true if this list contained the specified element.
     */
    public boolean remove(Object o) {
        if (o == null) {
            for (int index = 0; index < size; index++)
                if (elementData[index] == null) {
                    fastRemove(index);
                    return true;
                }
        } else {
            for (int index = 0; index < size; index++)
                if (o.equals(elementData[index])) {
                    fastRemove(index);
                    return true;
                }
        }
        return false;
    }

    /*
     * Private removal method that skips bounds checking and does not return
     * the removed value.
     */
    private void fastRemove(int index) {
        modCount++;
        int numMoved = size - index - 1;
        if (numMoved > 0)
            System.arraycopy(elementData, index + 1, elementData, index,
                    numMoved);
        elementData[--size] = null; // Clear the slot so the garbage collector can reclaim the element.
    }

    /**
     * Removes all elements from the list.
     */
    public void clear() {
        modCount++;

        // Set all array elements to null.
        for (int i = 0; i < size; i++)
            elementData[i] = null;

        size = 0;
    }

    /**
     * Appends all elements from the specified collection to the end of this list,
     * in the order returned by the collection's iterator.
     */
    public boolean addAll(Collection<? extends E> c) {
        Object[] a = c.toArray();
        int numNew = a.length;
        ensureCapacityInternal(size + numNew);  // Increments modCount
        System.arraycopy(a, 0, elementData, size, numNew);
        size += numNew;
        return numNew != 0;
    }

    /**
     * Inserts all elements from the specified collection into this list,
     * starting at the specified position.
     */
    public boolean addAll(int index, Collection<? extends E> c) {
        rangeCheckForAdd(index);

        Object[] a = c.toArray();
        int numNew = a.length;
        ensureCapacityInternal(size + numNew);  // Increments modCount

        int numMoved = size - index;
        if (numMoved > 0)
            System.arraycopy(elementData, index, elementData, index + numNew,
                    numMoved);

        System.arraycopy(a, 0, elementData, index, numNew);
        size += numNew;
        return numNew != 0;
    }

    /**
     * Removes all elements whose indices are between fromIndex (inclusive)
     * and toIndex. Shifts any later elements to the left.
     */
    protected void removeRange(int fromIndex, int toIndex) {
        modCount++;
        int numMoved = size - toIndex;
        System.arraycopy(elementData, toIndex, elementData, fromIndex,
                numMoved);

        // clear to let GC do its work
        int newSize = size - (toIndex - fromIndex);
        for (int i = newSize; i < size; i++) {
            elementData[i] = null;
        }
        size = newSize;
    }

    /**
     * Checks whether the given index is in range.
     */
    private void rangeCheck(int index) {
        if (index >= size)
            throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
    }

    /**
     * Version of rangeCheck() used by add() and addAll().
     */
    private void rangeCheckForAdd(int index) {
        if (index > size || index < 0)
            throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
    }

    /**
     * Returns details for an IndexOutOfBoundsException.
     */
    private String outOfBoundsMsg(int index) {
        return "Index: " + index + ", Size: " + size;
    }

    /**
     * Removes from this list all elements that are also in the specified collection.
     */
    public boolean removeAll(Collection<?> c) {
        Objects.requireNonNull(c);
        // Return true if this list was modified.
        return batchRemove(c, false);
    }

    /**
     * Retains only the elements in this list that are in the specified collection.
     * In other words, removes all elements that are not in the specified collection.
     */
    public boolean retainAll(Collection<?> c) {
        Objects.requireNonNull(c);
        return batchRemove(c, true);
    }


    /**
     * Returns a list iterator over the elements in this list, starting at the
     * specified position.
     * The index indicates the first element returned by next(). The first call
     * to previous() returns the element at index - 1.
     * The returned iterator is fail-fast.
     */
    public ListIterator<E> listIterator(int index) {
        if (index < 0 || index > size)
            throw new IndexOutOfBoundsException("Index: " + index);
        return new ListItr(index);
    }

    /**
     * Returns a list iterator over the elements in this list in order.
     * The returned iterator is fail-fast.
     */
    public ListIterator<E> listIterator() {
        return new ListItr(0);
    }

    /**
     * Returns an iterator over the elements in this list in order.
     * The returned iterator is fail-fast.
     */
    public Iterator<E> iterator() {
        return new Itr();
    }
```

## How `ArrayList` Resizes

### Start with the Constructors

`ArrayList` has three constructors. Here is the JDK 8 source:

```java
/**
 * Default initial capacity
 */
private static final int DEFAULT_CAPACITY = 10;

private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

/**
 * Default constructor. The backing array grows to 10 when the first element is added.
 */
public ArrayList() {
    this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
}

/**
 * Constructor with an initial capacity specified by the caller.
 */
public ArrayList(int initialCapacity) {
    if (initialCapacity > 0) {// initial capacity is greater than 0
        // Create an array of initialCapacity.
        this.elementData = new Object[initialCapacity];
    } else if (initialCapacity == 0) {// initial capacity is 0
        // Use an empty array.
        this.elementData = EMPTY_ELEMENTDATA;
    } else {// initial capacity is less than 0; throw an exception
        throw new IllegalArgumentException("Illegal Capacity: " + initialCapacity);
    }
}


/**
 * Constructs a list containing the elements of the specified collection,
 * in the order returned by the collection's iterator.
 * Throws NullPointerException if the specified collection is null.
 */
public ArrayList(Collection<? extends E> c) {
    elementData = c.toArray();
    if ((size = elementData.length) != 0) {
        // c.toArray might (incorrectly) not return Object[] (see 6260652)
        if (elementData.getClass() != Object[].class)
            elementData = Arrays.copyOf(elementData, size, Object[].class);
    } else {
        // replace with empty array.
        this.elementData = EMPTY_ELEMENTDATA;
    }
}
```

Notice that **the no-argument constructor initially uses an empty array. Capacity is allocated only when an element is added; the first insertion grows the array to 10.** We will revisit this while tracing the resizing logic.

> Note: In JDK 6, creating an `ArrayList` with the no-argument constructor immediately allocated an `Object[]` named `elementData` with a length of 10.

### Walk Through the Resizing Logic

The following analysis uses an `ArrayList` created with the no-argument constructor.

#### The `add()` Method

```java
/**
* Appends the specified element to the end of this list.
*/
public boolean add(E e) {
    // Ensure capacity before adding the element.
    ensureCapacityInternal(size + 1);  // Increments modCount!!
    // Adding an ArrayList element ultimately assigns it into the array.
    elementData[size++] = e;
    return true;
}
```

**Note:** JDK 11 removed `ensureCapacityInternal()` and `ensureExplicitCapacity()`.

Here is the source for `ensureCapacityInternal()`:

```java
// Calculates the required capacity from the requested minimum and current array.
private static int calculateCapacity(Object[] elementData, int minCapacity) {
    // For an empty default array, use the larger of the default and requested capacities.
    if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
        return Math.max(DEFAULT_CAPACITY, minCapacity);
    }
    // Otherwise, use the requested minimum.
    return minCapacity;
}

// Ensures that the internal array reaches the specified minimum capacity.
private void ensureCapacityInternal(int minCapacity) {
    ensureExplicitCapacity(calculateCapacity(elementData, minCapacity));
}
```

`ensureCapacityInternal()` is simple; it calls `ensureExplicitCapacity()`:

```java
// Check whether the array needs to grow.
private void ensureExplicitCapacity(int minCapacity) {
    modCount++;
    // Check whether the current array can hold minCapacity elements.
    if (minCapacity - elementData.length > 0)
        // Grow the array.
        grow(minCapacity);
}
```

Let's walk through what happens:

- When the first element is added, `elementData.length` is 0 because the list is empty. `ensureCapacityInternal()` sets `minCapacity` to 10, so `minCapacity - elementData.length > 0` and `grow(minCapacity)` is called.
- When the second element is added, `minCapacity` is 2. The first insertion has already grown `elementData` to a capacity of 10, so `minCapacity - elementData.length > 0` is false and `grow()` is not called.
- Adding the third through tenth elements also does not call `grow()`; the array remains at a capacity of 10.

When the eleventh element is added, `minCapacity` is 11 and `elementData.length` is 10. Since the requested capacity is larger, `grow()` is called.

#### The `grow()` Method

```java
/**
 * Maximum array size to allocate
 */
private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;

/**
 * Core method for growing the ArrayList.
 */
private void grow(int minCapacity) {
    // oldCapacity is the old capacity; newCapacity is the new capacity.
    int oldCapacity = elementData.length;
    // Shifting oldCapacity right by one is equivalent to dividing it by 2.
    // This bit shift is faster than division and grows capacity to about 1.5 times its old value.
    int newCapacity = oldCapacity + (oldCapacity >> 1);

    // If the new capacity is below the requested minimum, use the minimum instead.
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;

    // If the new capacity exceeds MAX_ARRAY_SIZE, hugeCapacity() compares
    // minCapacity with MAX_ARRAY_SIZE. It returns Integer.MAX_VALUE if minCapacity
    // is larger; otherwise, it returns MAX_ARRAY_SIZE (Integer.MAX_VALUE - 8).
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);

    // minCapacity is usually close to size, so this is a win:
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

**`int newCapacity = oldCapacity + (oldCapacity >> 1)`, so `ArrayList` grows to about 1.5 times its old capacity.** For an even capacity such as 10, the new capacity is 15; for an odd capacity such as 33, it becomes 49 because the fractional part is discarded.

> `>>` is the signed right-shift operator. Shifting right by one bit is equivalent to dividing by 2; shifting by `n` bits is equivalent to dividing by `2ⁿ`. Here, `oldCapacity` is shifted right by one. Bit shifts can be more efficient than arithmetic division because they move bits rather than perform a division operation.

**Let's look at `grow()` with a couple of examples:**

- When the first element is added, `oldCapacity` is 0. The first condition is true, so `newCapacity` becomes `minCapacity` (10). Since it is not larger than `MAX_ARRAY_SIZE`, `hugeCapacity()` is not called. The array grows to 10, `add()` returns `true`, and `size` becomes 1.
- When the eleventh element is added, `oldCapacity` is 10 and `newCapacity` is 15, which is greater than `minCapacity` (11). The first condition is false. Since the new capacity is below the maximum, `hugeCapacity()` is not called. The array grows to 15, `add()` returns `true`, and `size` becomes 11.
- The same pattern continues as more elements are added.

**One important detail that is easy to overlook:**

- In Java, the `length` field is used with arrays.
- The `length()` method is used with strings.
- The `size()` method is used with collections to get the number of elements.

#### The `hugeCapacity()` Method

As shown in `grow()`, if the new capacity exceeds `MAX_ARRAY_SIZE`, `hugeCapacity()` compares `minCapacity` with `MAX_ARRAY_SIZE`. It returns `Integer.MAX_VALUE` if `minCapacity` is larger; otherwise, it returns `MAX_ARRAY_SIZE`, which is `Integer.MAX_VALUE - 8`.

```java
private static int hugeCapacity(int minCapacity) {
    if (minCapacity < 0) // overflow
        throw new OutOfMemoryError();
    // Compare minCapacity with MAX_ARRAY_SIZE.
    // If minCapacity is larger, use Integer.MAX_VALUE as the new array size.
    // Otherwise, use MAX_ARRAY_SIZE.
    // MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;
    return (minCapacity > MAX_ARRAY_SIZE) ?
        Integer.MAX_VALUE :
        MAX_ARRAY_SIZE;
}
```

### `System.arraycopy()` and `Arrays.copyOf()`

The `ArrayList` source uses both methods in several places, including resizing, `add(int index, E element)`, and `toArray()`.

#### The `System.arraycopy()` Method

Source:

```java
    // arraycopy() is a native method. The parameters are explained below.
    /**
    * Copies elements between arrays.
    * @param src the source array
    * @param srcPos the starting position in the source array
    * @param dest the destination array
    * @param destPos the starting position in the destination array
    * @param length the number of array elements to copy
    */
    public static native void arraycopy(Object src,  int  srcPos,
                                        Object dest, int destPos,
                                        int length);
```

Example use:

```java
    /**
     * Inserts the specified element at the specified position in this list.
     * First, rangeCheckForAdd() checks the index; then ensureCapacityInternal()
     * ensures sufficient capacity. Elements from index onward are shifted right,
     * the new element is inserted, and size is incremented.
     */
    public void add(int index, E element) {
        rangeCheckForAdd(index);

        ensureCapacityInternal(size + 1);  // Increments modCount!!
        // arraycopy() copies elements within the same array.
        // elementData: source and destination; index: source start; index + 1: destination start; size - index: number of elements to copy.
        System.arraycopy(elementData, index, elementData, index + 1, size - index);
        elementData[index] = element;
        size++;
    }
```

Here is a simple test:

```java
public class ArraycopyTest {

  public static void main(String[] args) {
    // TODO Auto-generated method stub
    int[] a = new int[10];
    a[0] = 0;
    a[1] = 1;
    a[2] = 2;
    a[3] = 3;
    System.arraycopy(a, 2, a, 3, 3);
    a[2]=99;
    for (int i = 0; i < a.length; i++) {
      System.out.print(a[i] + " ");
    }
  }

}
```

Output:

```plain
0 1 99 2 3 0 0 0 0 0
```

#### The `Arrays.copyOf()` Method

Source:

```java
    public static int[] copyOf(int[] original, int newLength) {
      // Allocate a new array.
        int[] copy = new int[newLength];
  // Copy the source array with System.arraycopy() and return the new array.
        System.arraycopy(original, 0, copy, 0,
                         Math.min(original.length, newLength));
        return copy;
    }
```

Example use:

```java
   /**
     Returns an array containing all elements in this list in order,
     from the first to the last element. The returned array has the runtime
     type of the specified array.
     */
    public Object[] toArray() {
    // elementData is the source array; size is the number of elements to copy.
        return Arrays.copyOf(elementData, size);
    }
```

`Arrays.copyOf()` is often used to grow an existing array. The following code tests it:

```java
public class ArrayscopyOfTest {

  public static void main(String[] args) {
    int[] a = new int[3];
    a[0] = 0;
    a[1] = 1;
    a[2] = 2;
    int[] b = Arrays.copyOf(a, 10);
    System.out.println("b.length"+b.length);
  }
}
```

Output:

```plain
10
```

#### Similarities and Differences

**Similarity:**

The source shows that `copyOf()` calls `System.arraycopy()` internally.

**Difference:**

`arraycopy()` requires a destination array, which can be a separate array or the source array itself. You choose the source position, destination position, and number of elements to copy. `copyOf()` creates and returns a new array for you.

### The `ensureCapacity()` Method

The `ArrayList` source includes an `ensureCapacity()` method that is not called internally. It is provided for callers. What does it do?

```java
    /**
    Increases this ArrayList instance's capacity, if necessary, so it can hold
    at least the number of elements specified by minimum capacity.
     *
     * @param   minCapacity   the minimum required capacity
     */
    public void ensureCapacity(int minCapacity) {
        int minExpand = (elementData != DEFAULTCAPACITY_EMPTY_ELEMENTDATA)
            // any size if not default element table
            ? 0
            // larger than default for default empty table. It's already
            // supposed to be at default size.
            : DEFAULT_CAPACITY;

        if (minCapacity > minExpand) {
            ensureExplicitCapacity(minCapacity);
        }
    }

```

In theory, call `ensureCapacity()` before adding many elements to an `ArrayList` to reduce the number of reallocations.

The following code tests its effect:

```java
public class EnsureCapacityTest {
  public static void main(String[] args) {
    ArrayList<Object> list = new ArrayList<Object>();
    final int N = 10000000;
    long startTime = System.currentTimeMillis();
    for (int i = 0; i < N; i++) {
      list.add(i);
    }
    long endTime = System.currentTimeMillis();
    System.out.println("Before ensureCapacity: "+(endTime - startTime));

  }
}
```

Output:

```plain
Before ensureCapacity: 2158
```

```java
public class EnsureCapacityTest {
    public static void main(String[] args) {
        ArrayList<Object> list = new ArrayList<Object>();
        final int N = 10000000;
        long startTime1 = System.currentTimeMillis();
        list.ensureCapacity(N);
        for (int i = 0; i < N; i++) {
            list.add(i);
        }
        long endTime1 = System.currentTimeMillis();
        System.out.println("After ensureCapacity: "+(endTime1 - startTime1));
    }
}
```

Output:

```plain
After ensureCapacity: 1773
```

The results suggest that calling `ensureCapacity()` before adding many elements can improve performance. However, the difference is small, and real projects rarely add this many elements to a single `ArrayList`.

<!-- @include: @article-footer.snippet.md -->
