---
title: ThreadLocal Explained
description: An in-depth guide to ThreadLocal, ThreadLocalMap, weak references, memory leaks, and common usage patterns.
category: Java
tag:
  - Java Concurrency
head:
  - - meta
    - name: keywords
      content: ThreadLocal,thread-local variables,ThreadLocalMap,memory leaks,weak references,ThreadLocal internals,thread isolation
---

> This article was contributed by 一枝花算不算浪漫. [Original article](https://juejin.cn/post/6844904151567040519).

### Introduction

![](./images/thread-local/1.png)

**This article is over 10,000 words and includes 31 diagrams. It took considerable time and effort to create. Please follow and like the original post to support the author.**

`ThreadLocal` may seem simple at first: each thread gets an isolated copy of a variable. But consider these questions:

- If a `ThreadLocal` key is a **weak reference**, can it become **null** after **GC** when `ThreadLocal.get()` is called?
- What is the **data structure** of `ThreadLocalMap`?
- How does `ThreadLocalMap` calculate **hashes**?
- How does it handle **hash collisions**?
- How does `ThreadLocalMap` **resize**?
- How does it clean up **stale keys**? How do **expunge** and **heuristic cleanup** work?
- How does `ThreadLocalMap.set()` work?
- How does `ThreadLocalMap.get()` work?
- How is `ThreadLocal` used in projects, and what pitfalls should you know about?
- ...

This article uses diagrams and code to answer these questions and explain how `ThreadLocal` works.

### Contents

**Note:** The source analysis is based on `JDK 8`.

### A `ThreadLocal` Example

Here is an example of using `ThreadLocal`:

```java
public class ThreadLocalTest {
    private List<String> messages = Lists.newArrayList();

    public static final ThreadLocal<ThreadLocalTest> holder = ThreadLocal.withInitial(ThreadLocalTest::new);

    public static void add(String message) {
        holder.get().messages.add(message);
    }

    public static List<String> clear() {
        List<String> messages = holder.get().messages;
        holder.remove();

        System.out.println("size: " + holder.get().messages.size());
        return messages;
    }

    public static void main(String[] args) {
        ThreadLocalTest.add("A thread-local message");
        System.out.println(holder.get().messages);
        ThreadLocalTest.clear();
    }
}
```

Output:

```java
[A thread-local message]
size: 0
```

A `ThreadLocal` provides a thread-local variable. Each `Thread` has its own **copy**, so threads do not interfere with one another.

### The `ThreadLocal` Data Structure

![](./images/thread-local/2.png)

The `Thread` class has an instance field named `threadLocals` of type `ThreadLocal.ThreadLocalMap`. Each thread therefore has its own `ThreadLocalMap`.

`ThreadLocalMap` has its own implementation. You can think of its `key` as a `ThreadLocal` and its `value` as the value stored by the code. In fact, the key is a **weak reference** to the `ThreadLocal`.

When a thread stores a value in a `ThreadLocal`, it is saved in that thread's own `ThreadLocalMap`. Reads use the `ThreadLocal` as a key to find the value in the current thread's map, providing **thread isolation**.

`ThreadLocalMap` is somewhat like `HashMap`, but while `HashMap` uses an **array and linked lists** (and may use trees), `ThreadLocalMap` has no **linked-list** structure.

Note that an `Entry`'s key is a `ThreadLocal<?>` held through `WeakReference`.

### Can the Key Become Null After GC?

Returning to the opening question: if a `ThreadLocal` key is a weak reference, can it become `null` after GC when `ThreadLocal.get()` is called?

To answer this, we need to understand Java's **four reference types**:

- **Strong reference:** Objects created with `new` are normally strongly referenced. As long as a strong reference exists, the garbage collector will not reclaim the object, even under memory pressure.
- **Soft reference:** An object referenced through `SoftReference` may be reclaimed when the JVM needs memory.
- **Weak reference:** An object referenced through `WeakReference` is weakly reachable when no strong or soft references to it remain. The garbage collector clears weak references when it processes such objects, though a particular GC run is not guaranteed to process every candidate immediately.
- **Phantom reference:** The weakest reference type, represented by `PhantomReference`. It can be used with a reference queue to receive notification that an object is about to be reclaimed.

The following example uses reflection to inspect `ThreadLocal` data after GC. It is adapted from [this example](https://blog.csdn.net/thewindkee/article/details/103726942) and demonstrates a GC scenario locally.

> `System.gc()` only suggests that the JVM run garbage collection. The output below illustrates the concept, but is not guaranteed on every run.

```java
public class ThreadLocalDemo {

    public static void main(String[] args) throws NoSuchFieldException, IllegalAccessException, InterruptedException {
        Thread t = new Thread(()->test("abc",false));
        t.start();
        t.join();
        System.out.println("--after gc--");
        Thread t2 = new Thread(() -> test("def", true));
        t2.start();
        t2.join();
    }

    private static void test(String s,boolean isGC)  {
        try {
            new ThreadLocal<>().set(s);
            if (isGC) {
                System.gc();
            }
            Thread t = Thread.currentThread();
            Class<? extends Thread> clz = t.getClass();
            Field field = clz.getDeclaredField("threadLocals");
            field.setAccessible(true);
            Object ThreadLocalMap = field.get(t);
            Class<?> tlmClass = ThreadLocalMap.getClass();
            Field tableField = tlmClass.getDeclaredField("table");
            tableField.setAccessible(true);
            Object[] arr = (Object[]) tableField.get(ThreadLocalMap);
            for (Object o : arr) {
                if (o != null) {
                    Class<?> entryClass = o.getClass();
                    Field valueField = entryClass.getDeclaredField("value");
                    Field referenceField = entryClass.getSuperclass().getSuperclass().getDeclaredField("referent");
                    valueField.setAccessible(true);
                    referenceField.setAccessible(true);
                    System.out.println(String.format("weak key: %s, value: %s", referenceField.get(o), valueField.get(o)));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

Example output:

```java
weak key: java.lang.ThreadLocal@433619b6, value: abc
weak key: java.lang.ThreadLocal@418a15e3, value: java.lang.ref.SoftReference@bf97a12
--after gc--
weak key: null, value: def
```

![](./images/thread-local/3.png)

As shown, the `ThreadLocal` created here is not stored in a variable, so there is no strong reference to it:

```java
new ThreadLocal<>().set(s);
```

In this run, the garbage collector processed the `ThreadLocal`, which had only a weak reference, so `referent` became `null`. This depends on whether the JVM runs and completes the relevant garbage collection. **Now change the code:**

![](./images/thread-local/4.png)

At first glance, the combination of **weak references** and **garbage collection** may suggest that the key must be `null`.

That is not necessarily true. Calling `ThreadLocal.get()` means a **strong reference** to the `ThreadLocal` still exists, so the key is not `null` at that point.

![](./images/thread-local/5.png)

If no **strong reference** to the `ThreadLocal` remains, the garbage collector can clear the weak `key`. The `Entry` still strongly references its `value` until a later `ThreadLocalMap` operation cleans up the stale entry, or the thread terminates and the map becomes unreachable. In long-lived threads, such as thread-pool workers, the value may remain for a long time and create a memory-leak risk.

### How `ThreadLocal.set()` Works

![](./images/thread-local/6.png)

As shown above, `ThreadLocal.set()` first checks whether a `ThreadLocalMap` exists, then stores the value in the map.

Here is the code:

```java
public void set(T value) {
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    if (map != null)
        map.set(this, value);
    else
        createMap(t, value);
}

void createMap(Thread t, T firstValue) {
    t.threadLocals = new ThreadLocalMap(this, firstValue);
}
```

The core logic is in `ThreadLocalMap`, which is examined in more detail below.

### The `ThreadLocalMap` Hash Algorithm

Like other maps, `ThreadLocalMap` needs a hash algorithm to determine slots in its array.

```java
int i = key.threadLocalHashCode & (len-1);
```

The hash calculation is simple: `i` is the array index for the current key.

The key part is how `threadLocalHashCode` is calculated. `ThreadLocal` defines `HASH_INCREMENT = 0x61c88647`:

```java
public class ThreadLocal<T> {
    private final int threadLocalHashCode = nextHashCode();

    private static AtomicInteger nextHashCode = new AtomicInteger();

    private static final int HASH_INCREMENT = 0x61c88647;

    private static int nextHashCode() {
        return nextHashCode.getAndAdd(HASH_INCREMENT);
    }

    static class ThreadLocalMap {
        ThreadLocalMap(ThreadLocal<?> firstKey, Object firstValue) {
            table = new Entry[INITIAL_CAPACITY];
            int i = firstKey.threadLocalHashCode & (INITIAL_CAPACITY - 1);

            table[i] = new Entry(firstKey, firstValue);
            size = 1;
            setThreshold(INITIAL_CAPACITY);
        }
    }
}
```

Each time a `ThreadLocal` is created, `nextHashCode` increases by `0x61c88647`.

This constant is not a Fibonacci number. It is a 32-bit hash increment derived from the golden ratio. Successive `ThreadLocal` instances use it to generate hash codes; masking the low bits for an array whose length is a power of two gives a fairly even slot distribution.

You can try it yourself:

![](./images/thread-local/8.png)

The resulting hash codes are distributed fairly evenly. For more detail, look into multiplicative hashing based on the golden ratio.

### `ThreadLocalMap` Hash Collisions

> **Note:** In the diagrams below, **green** `Entry` blocks represent live data, **gray** blocks represent entries whose `key` is `null` after garbage collection, and **white** blocks represent a `null` entry.

Although `ThreadLocalMap` uses the **golden-ratio constant** in its hash calculation to reduce collisions, collisions can still occur.

`HashMap` handles collisions by storing entries in a **linked list** at each array slot. If the list grows beyond a threshold, it can become a **red-black tree**.

`ThreadLocalMap` has no linked-list structure, so it cannot resolve collisions the same way as `HashMap`.

![](./images/thread-local/7.png)

As shown above, inserting `value=27` should place it in slot 4 according to its hash, but that slot already contains an `Entry`.

It then scans forward until it finds a slot whose `Entry` is `null` and stores the element there. Other cases need different handling, such as finding a non-null `Entry` with the same key or an `Entry` whose key is `null`; those cases are explained below.

The diagram also shows an `Entry` whose `key` is `null` (the gray block at **Entry 2**). This can happen because the key is a **weak reference**. When `set` encounters an `Entry` with a stale key, it performs **expunge cleanup**, described later.

### How `ThreadLocalMap.set()` Works

#### `ThreadLocalMap.set()` Diagrams

Now that we have covered the `ThreadLocal` **hash algorithm**, let's look at `set`.

Storing data in `ThreadLocalMap` with `set` can **add** or **update** an entry. The diagrams below show the different cases.

**Case 1:** The slot selected by the hash is empty:

![](./images/thread-local/9.png)

Store the data in that slot.

**Case 2:** The slot is occupied, and its key matches the current `ThreadLocal`:

![](./images/thread-local/10.png)

Update the entry in that slot.

**Case 3:** The slot is occupied, but the forward scan finds no stale key before reaching an empty `Entry` slot:

![](./images/thread-local/11.png)

Scan forward through the hash array. Store the value in the first empty slot, or update an entry if its **key matches**.

**Case 4:** The slot is occupied, and the forward scan encounters a stale key before reaching an empty slot. In the diagram, the `Entry` at `index=7` has `key=null`:

![](./images/thread-local/12.png)

The `Entry` at index 7 has a `null` key, meaning the key was garbage-collected. `replaceStaleEntry()` handles **replacing stale data** and starts expunge cleanup from **index 7**.

The initial scan position for expunging stale data is `slotToExpunge = staleSlot = 7`.

Starting at `staleSlot`, scan backward for other stale entries and update `slotToExpunge` to the earliest one found. Continue until an `Entry` is `null`.

If a stale entry is found, continue scanning backward until an empty slot is reached. In the diagram, **`slotToExpunge` becomes 0**:

![](./images/thread-local/13.png)

Scan backward from the current node (`index=7`) for stale `Entry` values, updating `slotToExpunge` when one is found. Stop at `null`. In this example, `slotToExpunge` becomes 0.

This backward scan updates `slotToExpunge`, the starting index for expunge cleanup. As explained below, it indicates whether there are other stale entries before the current stale slot.

Next, scan forward from `staleSlot` (`index=7`). **If an entry with the same key is found:**

![](./images/thread-local/14.png)

Scan forward from `staleSlot` for an `Entry` with the same key. When found, update its value and swap it with the stale entry at `staleSlot`, then clean up stale entries, as shown below:

![](https://oss.javaguide.cn/java-guide-blog/view.png) **If no entry with the same key is found during the forward scan:**

![](./images/thread-local/15.png)

Scan forward from `staleSlot` until an `Entry` is `null`. As shown above, there is no entry with the same key in the table.

Create a new `Entry` and place it at `table[staleSlot]`:

![](./images/thread-local/16.png)

After replacement, stale entries are cleaned up with `expungeStaleEntry()` and `cleanSomeSlots()`. Their details follow below.

#### `ThreadLocalMap.set()` Source Walkthrough

The diagrams above explain how `set()` works. Now let's look at the source:

`java.lang.ThreadLocal`.`ThreadLocalMap.set()`:

```java
private void set(ThreadLocal<?> key, Object value) {
    Entry[] tab = table;
    int len = tab.length;
    int i = key.threadLocalHashCode & (len-1);

    for (Entry e = tab[i];
         e != null;
         e = tab[i = nextIndex(i, len)]) {
        ThreadLocal<?> k = e.get();

        if (k == key) {
            e.value = value;
            return;
        }

        if (k == null) {
            replaceStaleEntry(key, value, i);
            return;
        }
    }

    tab[i] = new Entry(key, value);
    int sz = ++size;
    if (!cleanSomeSlots(i, sz) && sz >= threshold)
        rehash();
}
```

The key determines its starting slot in the hash table. From there, the method scans forward for a usable slot.

```java
Entry[] tab = table;
int len = tab.length;
int i = key.threadLocalHashCode & (len-1);
```

When can a slot be used?

1. `k == key`: This is an update, so the slot can be used.
2. A stale slot is found and replaced.
3. An empty `Entry` slot is found during the scan.

The `for` loop scans forward. First, here are `nextIndex()` and `prevIndex()`:

![](./images/thread-local/17.png)

```java
private static int nextIndex(int i, int len) {
    return ((i + 1 < len) ? i + 1 : 0);
}

private static int prevIndex(int i, int len) {
    return ((i - 1 >= 0) ? i - 1 : len - 1);
}
```

The rest of the `for` loop works as follows:

1. If the starting slot is empty, there is no collision there. Exit the loop and store the value in that slot.
2. If the slot is occupied:
   2.1. If `k == key`, update the existing entry and return.
   2.2. If `k == null`, the entry is stale. Call `replaceStaleEntry()` and return.
3. If the loop ends, it found an empty slot while scanning forward:
   3.1. Create an `Entry` in that slot.
   3.2. Increment `size`.
4. Call `cleanSomeSlots()` to heuristically remove entries with stale keys:
   4.1. If nothing was cleaned and `size` reaches the threshold (two-thirds of the array length), call `rehash()`.
   4.2. `rehash()` first expunges stale keys. If **`size >= threshold - threshold / 4`** afterward, it resizes the array, as explained below.

Next, look at `replaceStaleEntry()`, which replaces stale data. It corresponds to **Case 4** in the diagrams above:

`java.lang.ThreadLocal.ThreadLocalMap.replaceStaleEntry()`:

```java
private void replaceStaleEntry(ThreadLocal<?> key, Object value,
                                       int staleSlot) {
    Entry[] tab = table;
    int len = tab.length;
    Entry e;

    int slotToExpunge = staleSlot;
    for (int i = prevIndex(staleSlot, len);
         (e = tab[i]) != null;
         i = prevIndex(i, len))

        if (e.get() == null)
            slotToExpunge = i;

    for (int i = nextIndex(staleSlot, len);
         (e = tab[i]) != null;
         i = nextIndex(i, len)) {

        ThreadLocal<?> k = e.get();

        if (k == key) {
            e.value = value;

            tab[i] = tab[staleSlot];
            tab[staleSlot] = e;

            if (slotToExpunge == staleSlot)
                slotToExpunge = i;
            cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);
            return;
        }

        if (k == null && slotToExpunge == staleSlot)
            slotToExpunge = i;
    }

    tab[staleSlot].value = null;
    tab[staleSlot] = new Entry(key, value);

    if (slotToExpunge != staleSlot)
        cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);
}
```

`slotToExpunge` is the starting index for expunge cleanup and defaults to `staleSlot`. Scan backward from `staleSlot` until an `Entry` is `null`. If a stale entry is found, update the cleanup starting index to `i`, that is, `slotToExpunge = i`.

```java
for (int i = prevIndex(staleSlot, len);
     (e = tab[i]) != null;
     i = prevIndex(i, len)){

    if (e.get() == null){
        slotToExpunge = i;
    }
}
```

Next, scan forward from `staleSlot` until an empty slot is found. If **`k == key`**, this is an update: replace the value and swap the entry into the current `staleSlot`. If `slotToExpunge == staleSlot`, neither the backward nor forward scan found another stale entry, so set the cleanup starting index to the current index (`slotToExpunge = i`). Finally, call `cleanSomeSlots(expungeStaleEntry(slotToExpunge), len)` for heuristic cleanup.

```java
if (k == key) {
    e.value = value;

    tab[i] = tab[staleSlot];
    tab[staleSlot] = e;

    if (slotToExpunge == staleSlot)
        slotToExpunge = i;

    cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);
    return;
}
```

`cleanSomeSlots()` and `expungeStaleEntry()` are both cleanup methods, described in detail later. The former heuristically scans for entries with stale keys; the latter expunges stale entries directly.

**If `k != key`**, scanning continues. If `k == null`, the current `Entry` is stale. `slotToExpunge == staleSlot` means the initial backward scan found no stale entries. If both conditions hold, update `slotToExpunge` to the current index.

```java
if (k == null && slotToExpunge == staleSlot)
    slotToExpunge = i;
```

If the forward scan finds no `k == key` and reaches an empty `Entry`, it stops. This is an insertion, so the new entry is placed in `table[staleSlot]`.

```java
tab[staleSlot].value = null;
tab[staleSlot] = new Entry(key, value);
```

Finally, if stale slots were found elsewhere besides `staleSlot`, cleanup begins:

```java
if (slotToExpunge != staleSlot)
    cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);
```

### Expunging Stale Keys in `ThreadLocalMap`

As mentioned above, `ThreadLocalMap` has two ways to clean up stale keys: **expunge cleanup** and **heuristic cleanup**.

Expunge cleanup uses `expungeStaleEntry()`. It scans forward through the hash array, clears stale entries, and rehashes live entries along the way. If an entry's target slot is occupied, it moves the entry to the nearest empty slot, bringing it closer to its correct position. The diagrams below show the process:

![](./images/thread-local/18.png)

As shown above, `set(27)` hashes to `index=4`, but that slot is occupied, so the scan places it at `index=7`. Later, the `Entry` at `index=5` has its `key` cleared to `null`.

![](./images/thread-local/19.png)

Setting another value in the map triggers **expunge cleanup**.

After cleanup, the stale entry at `index=5` is removed. Scanning continues to the entry at `index=7`, whose correct index after rehashing is `4`. Since that slot is occupied, the scan finds the nearest empty slot (`index=5`, just cleared) and moves the entry from `index=7` to `index=5`, closer to its correct position at `index=4`.

After an expunge pass, entries with stale keys are removed. Rehashing moves live entries closer to their target slot, calculated as `i = key.hashCode & (tab.len - 1)`, which can improve lookup performance.

Next, let's walk through `expungeStaleEntry()` using diagrams followed by source code:

![](./images/thread-local/20.png)

Suppose the method is called as `expungeStaleEntry(3)`. The diagram shows the `ThreadLocalMap` table before cleanup:

![](./images/thread-local/21.png)

First, the entry at `staleSlot` is cleared, making `table[3]` `null`. The scan then continues forward:

![](./images/thread-local/22.png)

After the second step, the element at index 4 moves to index 3.

The scan continues. For each live entry, it checks whether the entry has been displaced. If so, it recalculates the slot so the entry is stored at or closer to its correct position.

![](./images/thread-local/23.png)

The scan stops when it reaches an empty slot, completing the expunge pass. Here is the **source implementation**:

```java
private int expungeStaleEntry(int staleSlot) {
    Entry[] tab = table;
    int len = tab.length;

    tab[staleSlot].value = null;
    tab[staleSlot] = null;
    size--;

    Entry e;
    int i;
    for (i = nextIndex(staleSlot, len);
         (e = tab[i]) != null;
         i = nextIndex(i, len)) {
        ThreadLocal<?> k = e.get();
        if (k == null) {
            e.value = null;
            tab[i] = null;
            size--;
        } else {
            int h = k.threadLocalHashCode & (len - 1);
            if (h != i) {
                tab[i] = null;

                while (tab[h] != null)
                    h = nextIndex(h, len);
                tab[h] = e;
            }
        }
    }
    return i;
}
```

Again using `staleSlot=3`, the method first clears `tab[staleSlot]` and decrements `size`. It then scans forward from `staleSlot`; if it finds another stale entry (`k == null`), it clears that slot and decrements `size` again.

```java
ThreadLocal<?> k = e.get();

if (k == null) {
    e.value = null;
    tab[i] = null;
    size--;
}
```

If the key is still live, the method recalculates its target index. If that differs from the current slot, a hash collision displaced the entry. The method scans forward from the target index to find the nearest empty slot.

```java
int h = k.threadLocalHashCode & (len - 1);
if (h != i) {
    tab[i] = null;

    while (tab[h] != null)
        h = nextIndex(h, len);

    tab[h] = e;
}
```

This handles live entries displaced by hash collisions. Moving them closer to their target slots can make future lookups faster.

### Resizing `ThreadLocalMap`

At the end of `ThreadLocalMap.set()`, if heuristic cleanup found no stale entries and the number of entries has reached the resize threshold (`len * 2/3`), `rehash()` runs:

```java
if (!cleanSomeSlots(i, sz) && sz >= threshold)
    rehash();
```

Here is the `rehash()` implementation:

```java
private void rehash() {
    expungeStaleEntries();

    if (size >= threshold - threshold / 4)
        resize();
}

private void expungeStaleEntries() {
    Entry[] tab = table;
    int len = tab.length;
    for (int j = 0; j < len; j++) {
        Entry e = tab[j];
        if (e != null && e.get() == null)
            expungeStaleEntry(j);
    }
}
```

First, expunge cleanup scans forward from the start of `table`, as described above. This may remove entries with `null` keys. The method then checks `size >= threshold - threshold / 4` (equivalent to `size >= threshold * 3/4`) to decide whether to resize.

The initial `rehash()` threshold is `size >= threshold`. When explaining how `ThreadLocalMap` resizes, distinguish these two steps:

![](./images/thread-local/24.png)

Now look at `resize()`. For clarity, the example uses `oldTab.len=8`:

![](./images/thread-local/25.png)

The new `tab` has twice the old length. The method walks through the old table, recalculates each entry's hash position, and inserts it into the new array. On collision, it scans forward to the nearest empty slot. Once all entries have moved, it recalculates the next **resize threshold**:

```java
private void resize() {
    Entry[] oldTab = table;
    int oldLen = oldTab.length;
    int newLen = oldLen * 2;
    Entry[] newTab = new Entry[newLen];
    int count = 0;

    for (int j = 0; j < oldLen; ++j) {
        Entry e = oldTab[j];
        if (e != null) {
            ThreadLocal<?> k = e.get();
            if (k == null) {
                e.value = null;
            } else {
                int h = k.threadLocalHashCode & (newLen - 1);
                while (newTab[h] != null)
                    h = nextIndex(h, newLen);
                newTab[h] = e;
                count++;
            }
        }
    }

    setThreshold(newLen);
    size = count;
    table = newTab;
}
```

### How `ThreadLocalMap.get()` Works

The `set()` source above covered storing values, cleaning entries, and optimizing their positions. Now let's look at how `get()` works.

#### `ThreadLocalMap.get()` Diagrams

**Case 1:** The key determines a slot in the hash table, and that slot's `Entry.key` matches the lookup key. The entry is returned directly:

![](./images/thread-local/26.png)

**Case 2:** The `Entry.key` in the slot does not match the lookup key:

![](./images/thread-local/27.png)

Consider `get(ThreadLocal1)`. Its hash maps to slot 4, but that slot contains a different key, so the lookup continues scanning forward.

At `index=5`, `Entry.key` is `null`, so the lookup calls `expungeStaleEntry()`. This clears the stale entries at indexes 5 and 8 and moves the entries at indexes 6 and 7 forward. The lookup then resumes at index 5 and finds a matching key at index 6, as shown below:

![](./images/thread-local/28.png)

#### `ThreadLocalMap.get()` Source Walkthrough

`java.lang.ThreadLocal.ThreadLocalMap.getEntry()`:

```java
private Entry getEntry(ThreadLocal<?> key) {
    int i = key.threadLocalHashCode & (table.length - 1);
    Entry e = table[i];
    if (e != null && e.get() == key)
        return e;
    else
        return getEntryAfterMiss(key, i, e);
}

private Entry getEntryAfterMiss(ThreadLocal<?> key, int i, Entry e) {
    Entry[] tab = table;
    int len = tab.length;

    while (e != null) {
        ThreadLocal<?> k = e.get();
        if (k == key)
            return e;
        if (k == null)
            expungeStaleEntry(i);
        else
            i = nextIndex(i, len);
        e = tab[i];
    }
    return null;
}
```

### Heuristic Cleanup of Stale Keys in `ThreadLocalMap`

The two cleanup methods mentioned above are **expunge cleanup (`expungeStaleEntry()`)** and **heuristic cleanup (`cleanSomeSlots()`)**.

Expunge cleanup scans forward from the current `Entry` and stops when it reaches a `null` value. This is a form of **linear probing**.

The author describes heuristic cleanup as: **“Heuristically scan some cells looking for stale entries.”**

![](./images/thread-local/29.png)

Here is the implementation:

```java
private boolean cleanSomeSlots(int i, int n) {
    boolean removed = false;
    Entry[] tab = table;
    int len = tab.length;
    do {
        i = nextIndex(i, len);
        Entry e = tab[i];
        if (e != null && e.get() == null) {
            n = len;
            removed = true;
            i = expungeStaleEntry(i);
        }
    } while ( (n >>>= 1) != 0);
    return removed;
}
```

### `InheritableThreadLocal`

With `ThreadLocal`, a child thread does not automatically inherit the parent's thread-local values in an asynchronous task.

The JDK provides `InheritableThreadLocal` for cases where a child thread should inherit values from its parent. Consider this example:

```java
public class InheritableThreadLocalDemo {
    public static void main(String[] args) {
        ThreadLocal<String> ThreadLocal = new ThreadLocal<>();
        ThreadLocal<String> inheritableThreadLocal = new InheritableThreadLocal<>();
        ThreadLocal.set("parent value: threadLocal");
        inheritableThreadLocal.set("parent value: inheritableThreadLocal");

        new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("Child thread's ThreadLocal value: " + ThreadLocal.get());
                System.out.println("Child thread's InheritableThreadLocal value: " + inheritableThreadLocal.get());
            }
        }).start();
    }
}
```

Output:

```java
Child thread's ThreadLocal value: null
Child thread's InheritableThreadLocal value: parent value: inheritableThreadLocal
```

When the parent creates a child by calling `new Thread()`, the constructor calls `Thread#init`. That method copies inheritable thread-local values from the parent to the child:

```java
private void init(ThreadGroup g, Runnable target, String name,
                      long stackSize, AccessControlContext acc,
                      boolean inheritThreadLocals) {
    if (name == null) {
        throw new NullPointerException("name cannot be null");
    }

    if (inheritThreadLocals && parent.inheritableThreadLocals != null)
        this.inheritableThreadLocals =
            ThreadLocal.createInheritedMap(parent.inheritableThreadLocals);
    this.stackSize = stackSize;
    tid = nextThreadID();
}
```

`InheritableThreadLocal` has a limitation with thread pools. It copies values when a new thread is created, but thread pools reuse existing threads, so later tasks may not inherit the current submitting thread's values.

Alibaba's open-source `TransmittableThreadLocal` library addresses this use case. See its documentation for details.

### Using `ThreadLocal` in Applications

#### A Common Use Case

Many projects use the ELK stack with Logstash for logging, then view and search logs in Kibana.

In a distributed system, a `traceId` can connect calls between services. How can it be passed from one service to another?

`org.slf4j.MDC` can do this using `ThreadLocal` internally. The flow is:

When a request reaches **Service A**, it generates a `traceId` (often a UUID) and stores it in the current thread's `ThreadLocal`. When calling **Service B**, it adds the `traceId` to the request header. Service B reads the header and stores the ID in its own thread's `ThreadLocal`.

![](./images/thread-local/30.png)

The diagram uses `requestId` as the `traceId` that connects calls across services. It can be used to find the full request path. There are other cases to consider as well:

![](./images/thread-local/31.png)

The following examples show ways to handle these cases.

#### Passing the ID with Feign

**Sending service:**

```java
@Component
@Slf4j
public class FeignInvokeInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        String requestId = MDC.get("requestId");
        if (StringUtils.isNotBlank(requestId)) {
            template.header("requestId", requestId);
        }
    }
}
```

**Receiving service:**

```java
@Slf4j
@Component
public class LogInterceptor extends HandlerInterceptorAdapter {

    @Override
    public void afterCompletion(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2, Exception arg3) {
        MDC.remove("requestId");
    }

    @Override
    public void postHandle(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2, ModelAndView arg3) {
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        String requestId = request.getHeader(BaseConstant.REQUEST_ID_KEY);
        if (StringUtils.isBlank(requestId)) {
            requestId = UUID.randomUUID().toString().replace("-", "");
        }
        MDC.put("requestId", requestId);
        return true;
    }
}
```

#### Passing `requestId` to Asynchronous Thread-Pool Tasks

Because `MDC` uses `ThreadLocal`, an asynchronous child thread cannot read the submitting thread's values automatically. One option is to customize the task executor to capture and restore the context:

```java
public class MyThreadPoolTaskExecutor extends ThreadPoolTaskExecutor {

    @Override
    public void execute(Runnable runnable) {
        Map<String, String> context = MDC.getCopyOfContextMap();
        super.execute(() -> run(runnable, context));
    }

    @Override
    private void run(Runnable runnable, Map<String, String> context) {
        if (context != null) {
            MDC.setContextMap(context);
        }
        try {
            runnable.run();
        } finally {
            MDC.remove();
        }
    }
}
```

#### Passing the ID Through a Message Queue

Add a `requestId` property to the message sent through the message queue. The consumer can read and use it after receiving the message.

<!-- @include: @article-footer.snippet.md -->
