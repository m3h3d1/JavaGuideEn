---
title: Common Java Collection Usage Pitfalls
description: Practical guidance on Java collections based on the Alibaba Java Development Guidelines, including empty checks, Arrays.asList pitfalls, subList behavior, and concurrent collection choices.
category: Java
tag:
  - Java Collections
head:
  - - meta
    - name: keywords
      content: Java collection best practices,collection emptiness checks,Arrays.asList,subList,concurrent collections,collection usage,performance
---

This article summarizes common collection usage pitfalls and explains why they occur, based on the _Alibaba Java Development Guidelines_.

Review these guidelines to avoid common mistakes in your code.

## Checking Whether a Collection Is Empty

The _Alibaba Java Development Guidelines_ state:

> **Use `isEmpty()` to check whether a collection contains elements instead of comparing `size()` with zero.**

`isEmpty()` makes the intent clearer and has a time complexity of `O(1)`.

For most collections, `size()` also takes `O(1)` time. Some collections take longer, however. For example, `ConcurrentLinkedQueue` in `java.util.concurrent` implements `isEmpty()` by calling `first()`, which returns the first node whose value is not `null`. A node's value may be set to `null` when the iterator performs a logical deletion.

```java
public boolean isEmpty() { return first() == null; }

Node<E> first() {
    restartFromHead:
    for (;;) {
        for (Node<E> h = head, p = h, q;;) {
            boolean hasItem = (p.item != null);
            if (hasItem || (q = p.next) == null) {  // The current node has a value, or the queue has ended
                updateHead(h, p);  // Set head to p
                return hasItem ? p : null;
            }
            else if (p == q) continue restartFromHead;
            else p = q;  // p = p.next
        }
    }
}
```

Because `updateHead(h, p)` is called during insertions and removals, `isEmpty()` takes approximately `O(1)` time. The `size()` method traverses the entire list and takes `O(n)` time.

```java
public int size() {
    int count = 0;
    for (Node<E> p = first(); p != null; p = succ(p))
        if (p.item != null)
            if (++count == Integer.MAX_VALUE)
                break;
    return count;
}
```

The time complexities of `size()` and `isEmpty()` also differ in `ConcurrentHashMap` 1.7. It stores counts in individual `Segment`s, so `size()` must total the counts from all segments, while `isEmpty()` can stop as soon as it finds a non-empty segment. In `ConcurrentHashMap` 1.8, both methods call `sumCount()` to total the counts in `baseCount` and `CounterCell[]`. Here is the source for `sumCount()`:

```java
final long sumCount() {
    CounterCell[] as = counterCells; CounterCell a;
    long sum = baseCount;
    if (as != null)
        for (int i = 0; i < as.length; ++i)
            if ((a = as[i]) != null)
                sum += a.value;
    return sum;
}
```

In a concurrent environment, `ConcurrentHashMap` 1.8 spreads contention during count updates across `baseCount` and `CounterCell[]`, instead of storing the count in each `Node`. In `ConcurrentHashMap` 1.7, counts are stored in each `Segment`; `size()` totals all segments, while `isEmpty()` only needs to find one non-empty segment.

## Converting a Collection to a Map

The _Alibaba Java Development Guidelines_ state:

> **When using `java.util.stream.Collectors.toMap()` to create a map, note that a `null` value causes a `NullPointerException`.**

```java
class Person {
    private String name;
    private String phoneNumber;
     // getters and setters
}

List<Person> bookList = new ArrayList<>();
bookList.add(new Person("jack","18163138123"));
bookList.add(new Person("martin",null));
// Throws NullPointerException
bookList.stream().collect(Collectors.toMap(Person::getName, Person::getPhoneNumber));
```

Here is why.

The `toMap()` method in `java.util.stream.Collectors` calls the `Map` interface's `merge()` method internally:

```java
public static <T, K, U, M extends Map<K, U>>
Collector<T, ?, M> toMap(Function<? super T, ? extends K> keyMapper,
                            Function<? super T, ? extends U> valueMapper,
                            BinaryOperator<U> mergeFunction,
                            Supplier<M> mapSupplier) {
    BiConsumer<M, T> accumulator
            = (map, element) -> map.merge(keyMapper.apply(element),
                                          valueMapper.apply(element), mergeFunction);
    return new CollectorImpl<>(mapSupplier, accumulator, mapMerger(mergeFunction), CH_ID);
}
```

The `Map` interface provides `merge()` as a default method:

> If you are not familiar with Java 8 features, see [A Guide to Java 8 Features](https://mp.weixin.qq.com/s/ojyl7B6PiHaTWADqmUq2rw).

```java
default V merge(K key, V value,
        BiFunction<? super V, ? super V, ? extends V> remappingFunction) {
    Objects.requireNonNull(remappingFunction);
    Objects.requireNonNull(value);
    V oldValue = get(key);
    V newValue = (oldValue == null) ? value :
               remappingFunction.apply(oldValue, value);
    if(newValue == null) {
        remove(key);
    } else {
        put(key, newValue);
    }
    return newValue;
}
```

The `merge()` method first calls `Objects.requireNonNull()` to check whether the value is `null`.

```java
public static <T> T requireNonNull(T obj) {
    if (obj == null)
        throw new NullPointerException();
    return obj;
}
```

> `Collectors` also provides a `toMap()` overload without a `mergeFunction`. If duplicate keys occur, that overload throws an exception. When duplicate keys are possible, use the overload that requires a `mergeFunction`.

## Iterating Over a Collection

The _Alibaba Java Development Guidelines_ state:

> **Do not call `remove()` or `add()` on a collection inside a `for-each` loop. Use an `Iterator` to remove elements. For concurrent access, synchronize on the collection while iterating.**

Synchronizing only on the `Iterator` does not prevent other threads from modifying the collection. For example, when using a wrapper returned by `Collections.synchronizedXxx()`, synchronize on the wrapped collection while iterating, and make sure all access goes through that wrapper.

If you decompile a `for-each` loop, you will see that it uses an `Iterator` internally. However, calls to `remove()` or `add()` invoke methods on the collection itself, not methods on the iterator.

As a result, the iterator detects that the collection was modified outside the iterator and throws a `ConcurrentModificationException`. This is the **fail-fast behavior** you can see even in a single-threaded program.

> **Fail-fast behavior:** Modifying a fail-fast collection from multiple threads may cause a `ConcurrentModificationException`. As noted above, this can also happen in a single-threaded program.
>
> Further reading: [What Is Fail-Fast Behavior?](https://www.cnblogs.com/54chensongxia/p/12470446.html).

Since Java 8, you can use `Collection#removeIf()` to remove elements that match a condition:

```java
List<Integer> list = new ArrayList<>();
for (int i = 1; i <= 10; ++i) {
    list.add(i);
}
list.removeIf(filter -> filter % 2 == 0); /* Remove all even numbers from the list */
System.out.println(list); /* [1, 3, 5, 7, 9] */
```

Besides iterating directly with an `Iterator`, you can also:

- Use a regular `for` loop.
- Choose a collection with snapshot or weakly consistent iteration when appropriate. For example, `CopyOnWriteArrayList` iterators use a snapshot, while `ConcurrentHashMap` iterators are weakly consistent.
- ……

## Removing Duplicates from a Collection

The _Alibaba Java Development Guidelines_ state:

> **Use the uniqueness of `Set` elements to remove duplicates efficiently. Avoid repeatedly calling `List.contains()` to remove duplicates or check whether an element is present.**

The following examples compare `HashSet` and `ArrayList`:

```java
// Remove duplicates with a Set
public static <T> Set<T> removeDuplicateBySet(List<T> data) {

    if (CollectionUtils.isEmpty(data)) {
        return new HashSet<>();
    }
    return new HashSet<>(data);
}

// Remove duplicates with a List
public static <T> List<T> removeDuplicateByList(List<T> data) {

    if (CollectionUtils.isEmpty(data)) {
        return new ArrayList<>();

    }
    List<T> result = new ArrayList<>(data.size());
    for (T current : data) {
        if (!result.contains(current)) {
            result.add(current);
        }
    }
    return result;
}

```

The key difference is how each collection implements `contains()`.

`HashSet.contains()` delegates to `HashMap.containsKey()`. Its expected time complexity is close to `O(1)` when hash collisions are limited.

```java
private transient HashMap<E,Object> map;
public boolean contains(Object o) {
    return map.containsKey(o);
}
```

Adding `N` elements to a set therefore takes close to `O(n)` time on average.

`ArrayList.contains()` scans the elements, so each call takes close to `O(n)` time.

```java
public boolean contains(Object o) {
    return indexOf(o) >= 0;
}
public int indexOf(Object o) {
    if (o == null) {
        for (int i = 0; i < size; i++)
            if (elementData[i]==null)
                return i;
    } else {
        for (int i = 0; i < size; i++)
            if (o.equals(elementData[i]))
                return i;
    }
    return -1;
}

```

## Converting a Collection to an Array

The _Alibaba Java Development Guidelines_ state:

> **When converting a collection to an array, use `toArray(T[] array)` and pass an empty array of the exact target type.**

`toArray(T[] array)` accepts a generic array. Calling the no-argument `toArray()` returns an array of type `Object[]`.

```java
String [] s= new String[]{
    "dog", "lazy", "a", "over", "jumps", "fox", "brown", "quick", "A"
};
List<String> list = Arrays.asList(s);
Collections.reverse(list);
// This would fail without specifying the element type
s=list.toArray(new String[0]);
```

Thanks to JVM optimizations, passing `new String[0]` to `Collection.toArray()` is now a good choice. The array acts as a template that specifies the result type; its zero length avoids allocating space that is not needed. See <https://shipilev.net/blog/2016/arrays-wisdom-ancients/>.

## Converting an Array to a Collection

The _Alibaba Java Development Guidelines_ state:

> **When you use `Arrays.asList()` to convert an array to a list, do not call methods that change the list. Its `add()`, `remove()`, and `clear()` methods throw `UnsupportedOperationException`.**

I ran into this issue on a previous project.

`Arrays.asList()` is commonly used to convert an array to a `List`:

```java
String[] myArray = {"Apple", "Banana", "Orange"};
List<String> myList = Arrays.asList(myArray);
// The two statements above are equivalent to this statement
List<String> myList = Arrays.asList("Apple","Banana", "Orange");
```

The JDK source documents the method as follows:

```java
/**
  * Returns a fixed-size list backed by the specified array. This method bridges
  * array-based and collection-based APIs, together with Collection.toArray().
  * The returned List is serializable and implements RandomAccess.
  */
public static <T> List<T> asList(T... a) {
    return new ArrayList<>(a);
}
```

Here are a few things to keep in mind.

**1. `Arrays.asList()` does not box the elements of a primitive array and expand them into separate list elements.**

```java
int[] myArray = {1, 2, 3};
List myList = Arrays.asList(myArray);
System.out.println(myList.size());//1
System.out.println(myList.get(0));// The array object
System.out.println(myList.get(1));// Throws ArrayIndexOutOfBoundsException
int[] array = (int[]) myList.get(0);
System.out.println(array[0]);//1
```

When you pass a primitive array, `Arrays.asList()` receives the array object itself rather than its elements. The list therefore contains that array as its only element, which explains the output above.

Use an array of wrapper types instead:

```java
Integer[] myArray = {1, 2, 3};
```

**2. The collection modification methods `add()`, `remove()`, and `clear()` throw an exception.**

```java
List myList = Arrays.asList(1, 2, 3);
myList.add(4);// Throws UnsupportedOperationException at runtime
myList.remove(1);// Throws UnsupportedOperationException at runtime
myList.clear();// Throws UnsupportedOperationException at runtime
```

`Arrays.asList()` does not return `java.util.ArrayList`. It returns an inner class of `java.util.Arrays` that does not override the collection's modification methods.

```java
List myList = Arrays.asList(1, 2, 3);
System.out.println(myList.getClass());//class java.util.Arrays$ArrayList
```

Here is a simplified version of `java.util.Arrays$ArrayList`, showing the methods it overrides:

```java
  private static class ArrayList<E> extends AbstractList<E>
        implements RandomAccess, java.io.Serializable
    {
        ...

        @Override
        public E get(int index) {
          ...
        }

        @Override
        public E set(int index, E element) {
          ...
        }

        @Override
        public int indexOf(Object o) {
          ...
        }

        @Override
        public boolean contains(Object o) {
           ...
        }

        @Override
        public void forEach(Consumer<? super E> action) {
          ...
        }

        @Override
        public void replaceAll(UnaryOperator<E> operator) {
          ...
        }

        @Override
        public void sort(Comparator<? super E> c) {
          ...
        }
    }
```

The `add()`, `remove()`, and `clear()` methods in `java.util.AbstractList` explain why these calls throw `UnsupportedOperationException`:

```java
public E remove(int index) {
    throw new UnsupportedOperationException();
}
public boolean add(E e) {
    add(size(), e);
    return true;
}
public void add(int index, E element) {
    throw new UnsupportedOperationException();
}

public void clear() {
    removeRange(0, size());
}
protected void removeRange(int fromIndex, int toIndex) {
    ListIterator<E> it = listIterator(fromIndex);
    for (int i=0, n=toIndex-fromIndex; i<n; i++) {
        it.next();
        it.remove();
    }
}
```

**How can you correctly convert an array to an `ArrayList`?**

1. Write a utility method:

```java
//JDK1.5+
static <T> List<T> arrayToList(final T[] array) {
  final List<T> l = new ArrayList<T>(array.length);

  for (final T s : array) {
    l.add(s);
  }
  return l;
}


Integer [] myArray = { 1, 2, 3 };
System.out.println(arrayToList(myArray).getClass());//class java.util.ArrayList
```

2. Use the simplest option:

```java
List list = new ArrayList<>(Arrays.asList("a", "b", "c"))
```

3. Use a Java 8 `Stream` (recommended):

```java
Integer [] myArray = { 1, 2, 3 };
List myList = Arrays.stream(myArray).collect(Collectors.toList());
// Primitive arrays work too; boxed() converts their elements to wrapper types
int [] myArray2 = { 1, 2, 3 };
List myList = Arrays.stream(myArray2).boxed().collect(Collectors.toList());
```

4. Use Guava:

For an immutable collection, use [`ImmutableList`](https://github.com/google/guava/blob/master/guava/src/com/google/common/collect/ImmutableList.java) and its [`of()`](https://github.com/google/guava/blob/master/guava/src/com/google/common/collect/ImmutableList.java#L101) or [`copyOf()`](https://github.com/google/guava/blob/master/guava/src/com/google/common/collect/ImmutableList.java#L225) factory method. The arguments cannot be `null`:

```java
List<String> il = ImmutableList.of("string", "elements");  // from varargs
List<String> il = ImmutableList.copyOf(aStringArray);      // from array
```

For a mutable collection, use [`Lists`](https://github.com/google/guava/blob/master/guava/src/com/google/common/collect/Lists.java) and its [`newArrayList()`](https://github.com/google/guava/blob/master/guava/src/com/google/common/collect/Lists.java#L87) factory method:

```java
List<String> l1 = Lists.newArrayList(anotherListOrCollection);    // from collection
List<String> l2 = Lists.newArrayList(aStringArray);               // from array
List<String> l3 = Lists.newArrayList("or", "string", "elements"); // from varargs
```

5. Use Apache Commons Collections:

```java
List<String> list = new ArrayList<String>();
CollectionUtils.addAll(list, str);
```

6. Use Java 9's `List.of()` method:

```java
Integer[] array = {1, 2, 3};
List<Integer> list = List.of(array);
```

<!-- @include: @article-footer.snippet.md -->
