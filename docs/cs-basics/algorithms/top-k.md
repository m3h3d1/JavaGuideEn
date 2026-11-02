---
title: "Top K Interview Guide: Heaps, Quickselect, Buckets, and Streaming Data"
description: An interview guide to Top K problems, covering kth largest, top-k frequency, min-heaps, Quickselect, bucket sort, streaming medians, Java PriorityQueue, and common LeetCode problems.
category: Computer Science Fundamentals
tag:
  - Algorithms
head:
  - - meta
    - name: keywords
      content: Top K,kth largest,top-k frequency,heap,min-heap,Quickselect,bucket sort,PriorityQueue,streaming median,LeetCode
---

Top K problems are common in backend interviews because they test algorithms and connect naturally to engineering scenarios. Leaderboards, trending terms, streaming medians, and the most common error codes in logs can all be framed as Top K problems.

Don't memorize just one solution. Interviewers may ask how to handle a large dataset, a data stream, or a top-k frequency query. The right approach depends on those requirements.

## What Interviewers Look For

- Use a heap to find the kth largest value or the k most frequent values.
- Explain when to use a min-heap or a max-heap.
- Compare the complexity of heaps, Quickselect, and bucket sort.
- Handle streaming data.
- Write a comparator for Java `PriorityQueue`.

## Choosing an Approach

Check three things first:

1. Do you need only the kth element, or the complete top-k elements?
2. Is the input a fixed collection or a stream that keeps arriving?
3. Does the result need to be sorted?

For a one-time kth-largest query, Quickselect is often faster on average. For a stream, maintaining a heap of size `k` is more natural. For top-k frequency, count each value first, then select by frequency.

## Comparing Approaches

| Approach    | Suitable for                                     | Time complexity         | Space complexity                      |
| ----------- | ------------------------------------------------ | ----------------------- | ------------------------------------- |
| Sorting     | Small inputs or when simplicity matters          | `O(nlogn)`              | Depends on the sorting implementation |
| Min-heap    | Top k largest or kth largest                     | `O(nlogk)`              | `O(k)`                                |
| Quickselect | One-time kth-largest selection                   | Average `O(n)`          | `O(1)` to `O(logn)`                   |
| Bucket sort | Top-k frequencies with a bounded frequency range | `O(n)`                  | `O(n)`                                |
| Two heaps   | Median of a data stream                          | `O(logn)` per insertion | `O(n)`                                |

You can explain the trade-offs in an interview like this:

- Sorting is simplest and works when the input isn't large or optimal complexity isn't required.
- A heap is useful when `k` is much smaller than `n`, and uses `O(k)` space.
- Quickselect finds the kth largest element in average `O(n)` time, but its worst case can degrade.
- Bucket sort works well for frequency-based problems, especially when frequencies are bounded by `n`.

## Find the Kth Largest with a Min-Heap

```java
int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int num : nums) {
        heap.offer(num);
        if (heap.size() > k) {
            heap.poll();
        }
    }
    return heap.peek();
}
```

The heap keeps the largest `k` values seen so far. Its root is the smallest of those values, which is the kth largest overall.

Why a min-heap? When adding a new value makes the heap larger than `k`, discard the smallest value among those `k + 1`. The min-heap root gives that value directly.

To find the kth smallest, reverse the approach: maintain a max-heap of size `k` and remove the largest value whenever the heap exceeds that size.

## Example: Top K Frequent Elements

[347. Top K Frequent Elements](https://leetcode.cn/problems/top-k-frequent-elements/) is a common frequency-based Top K problem. Given an integer array and `k`, return the `k` most frequent values. The result can usually be in any order.

Don't sort the original array, because the ranking is based on frequency, not value. Instead:

1. Use a `HashMap` to count each value.
2. Keep a min-heap ordered by frequency and limited to `k` entries.

Again, the min-heap lets you remove the least frequent candidate when its size exceeds `k`. After processing every distinct value, it contains the `k` most frequent values.

```java
int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> freq = new HashMap<>();
    for (int num : nums) {
        freq.put(num, freq.getOrDefault(num, 0) + 1);
    }
    PriorityQueue<int[]> heap = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
    for (Map.Entry<Integer, Integer> entry : freq.entrySet()) {
        heap.offer(new int[] {entry.getKey(), entry.getValue()});
        if (heap.size() > k) {
            heap.poll();
        }
    }
    int[] ans = new int[k];
    for (int i = k - 1; i >= 0; i--) {
        ans[i] = heap.poll()[0];
    }
    return ans;
}
```

The heap is ordered by ascending frequency, so when it exceeds `k`, the least frequent element is removed.

For `nums = [1,1,1,2,2,3]` and `k = 2`, the frequencies are `{1=3, 2=2, 3=1}`. After adding `3`, the heap exceeds size 2, so `3` is removed. The remaining values are `1` and `2`.

If `k` equals the number of distinct values, the heap retains all values. If the interviewer requires output in descending frequency order, sort the result afterward.

If ties must be resolved by numeric value or lexicographic order, include that secondary rule in the comparator. Top K Frequent Words, for example, orders higher frequencies first and words lexicographically when frequencies tie.

## Quickselect

Quickselect is useful for finding the kth largest value when the first `k` values don't need to be returned in sorted order. Partition the array around a pivot, then use the pivot's rank to choose which side to search next.

Its average time complexity is `O(n)`, but the worst case can be `O(n^2)`. Implementations often choose a random pivot to reduce the chance of a bad partition sequence.

Quickselect avoids maintaining a heap and is fast on average. It is best suited to a one-time query on data in memory. For a continuous stream or data too large to fit in memory, a heap is easier to maintain.

## Streaming Data

Don't sort all the data again whenever a new value arrives. Maintain a suitable data structure as values arrive:

- Kth largest in a stream: maintain a min-heap of size `k`.
- Median of a stream: use two heaps, a max-heap for the smaller half and a min-heap for the larger half.
- Sliding window median: also remove expired values. Since a normal heap doesn't support efficient removal of arbitrary elements, use lazy deletion or an ordered set.

## Walkthrough and Edge Cases

For the second-largest value in `[3, 2, 1, 5, 6, 4]`, maintain a min-heap of size 2. The table shows heap values in ascending order for readability; this isn't the internal array order of Java's `PriorityQueue`.

| Value read | Candidates  | After exceeding K       |
| ---------- | ----------- | ----------------------- |
| 3          | `[3]`       | No action               |
| 2          | `[2, 3]`    | No action               |
| 1          | `[1, 2, 3]` | Remove 1; keep `[2, 3]` |
| 5          | `[2, 3, 5]` | Remove 2; keep `[3, 5]` |
| 6          | `[3, 5, 6]` | Remove 3; keep `[5, 6]` |
| 4          | `[4, 5, 6]` | Remove 4; keep `[5, 6]` |

The heap root is `5`, the second-largest value.

Avoid a comparator that subtracts values, because it can overflow for extreme integers:

```java
PriorityQueue<Integer> heap = new PriorityQueue<>((a, b) -> b - a);
```

Use `Integer.compare` instead:

```java
PriorityQueue<Integer> heap = new PriorityQueue<>((a, b) -> Integer.compare(b, a));
```

## Common Mistakes

- Use a min-heap for the top `k` largest values and a max-heap for the top `k` smallest values.
- Java `PriorityQueue` is a min-heap by default.
- Count frequencies before selecting the top-k frequent values.
- If the result must be sorted, sort it after using a heap or Quickselect.
- For streaming data, don't sort the full dataset after each new value.

## Questions to Review

- Why maintain a min-heap of size `k` to find the kth largest value?
- Which Top K problems call for a min-heap or a max-heap?
- How do heap and Quickselect approaches compare in time and space complexity?
- Why count frequencies before selecting the most frequent values?
- Why use two heaps to maintain a streaming median?

## Recommended Practice Problems

- [215. Kth Largest Element in an Array](https://leetcode.cn/problems/kth-largest-element-in-an-array/)
- [347. Top K Frequent Elements](https://leetcode.cn/problems/top-k-frequent-elements/)
- [692. Top K Frequent Words](https://leetcode.cn/problems/top-k-frequent-words/)
- [703. Kth Largest Element in a Stream](https://leetcode.cn/problems/kth-largest-element-in-a-stream/)
- [295. Find Median from Data Stream](https://leetcode.cn/problems/find-median-from-data-stream/)

<!-- @include: @article-footer.snippet.md -->
