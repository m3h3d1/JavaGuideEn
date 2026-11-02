---
title: "Binary Search Interview Questions: Boundaries, Binary Search on the Answer, and Java Templates"
description: Learn basic binary search, lower and upper bounds, binary search on the answer, Java templates, complexity, and common LeetCode problems.
category: Computer Science Basics
tag:
  - Algorithms
head:
  - - meta
    - name: keywords
      content: binary search,binary search templates,lower bound,upper bound,binary search on the answer,Java,LeetCode,algorithm interview questions
---

The hardest part of binary search is usually not the idea but the boundaries. If the meanings of `left`, `right`, or `mid`, the loop condition, or the return value are unclear, it is easy to write an infinite loop or miss the answer.

To decide whether binary search applies, ask: **Is the answer space monotonic?** A sorted array is the most obvious case, but problems that ask for a minimum speed, capacity, or number of days can also use binary search over the answer range.

## Interview Topics

- Implement the basic binary search template.
- Handle lower and upper bounds.
- Recognize binary search on the answer, not just searches in arrays.
- Explain why the loop terminates and does not miss the answer.
- State that time complexity is `O(log n)` and space complexity is usually `O(1)`.

## When Should You Consider Binary Search?

Do not think of binary search as a technique only for finding a number in a sorted array. It depends on **monotonicity**.

There are two common forms of monotonicity:

| Type             | Example                                              | How to recognize it                                                            |
| ---------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| Sorted array     | Find `target` in a sorted array.                     | Comparing `nums[mid]` with `target` rules out half of the range.               |
| Monotonic answer | Find the minimum speed, capacity, or number of days. | If one answer is feasible, larger answers may also be feasible, or vice versa. |

For example, in Koko Eating Bananas, a faster eating speed makes it easier to finish within the time limit. The array does not need to be sorted; the relationship between speed and feasibility is monotonic.

In an interview, ask:

1. Is the problem asking for a position, a boundary, or the minimum or maximum feasible value?
2. Given a candidate answer `x`, can you check feasibility in `O(n)` or less?
3. Does feasibility change monotonically as `x` increases or decreases?

If you can answer all three, binary search may be a good fit.

## Basic Binary Search Template

Use this to find a specific value in a sorted array:

```java
int binarySearch(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}
```

This template searches a closed interval, `[left, right]`, so its loop condition is `left <= right`. Each iteration excludes `mid`, which is why the updates use `mid + 1` or `mid - 1`.

Remember: **Every position in the interval may still be the answer; the interval is empty when the loop ends.**

For example, find `7` in `[1, 3, 5, 7, 9]`:

1. `left = 0`, `right = 4`, `mid = 2`, and `nums[mid] = 5`, so the target is to the right.
2. Set `left = mid + 1 = 3`.
3. Now `mid = 3`, and the value `7` is found.

If you search for `6`, eventually `left > right`, meaning the closed interval is empty. Return `-1`.

## Lower Bound Template

Find the first position whose value is greater than or equal to `target`:

```java
int lowerBound(int[] nums, int target) {
    int left = 0;
    int right = nums.length;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] >= target) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    return left;
}
```

This template searches the half-open interval `[left, right)`. `right` starts at `nums.length`; the return value may equal `nums.length`, meaning no array value is greater than or equal to `target`.

The goal is not simply to find `target`, but to find the first position that satisfies a condition. This naturally handles cases where the target is absent.

For example, find the first value greater than or equal to `2` in `[1, 2, 2, 2, 4]`:

- If `nums[mid] >= 2`, `mid` may be the answer, so keep it in the search range by setting `right = mid`.
- If `nums[mid] < 2`, neither `mid` nor any position to its left can be the answer, so set `left = mid + 1`.

When the loop ends, `left == right`, and that index is the first position that satisfies the condition.

## Upper Bound Template

To find the last position whose value is less than or equal to `target`, find the first position greater than `target` and subtract 1:

```java
int upperBound(int[] nums, int target) {
    int left = 0;
    int right = nums.length;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] > target) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    return left - 1;
}
```

This lets you use the same idea for both boundaries: find the first position that satisfies a condition.

Upper-bound searches are easy to get wrong, so convert them to lower-bound searches:

- Last position `<= target` = first position `> target` minus 1.
- Last position `< target` = first position `>= target` minus 1.

This avoids maintaining two separate templates and is less error-prone in an interview.

## Binary Search on the Answer

Binary search on the answer searches for the minimum or maximum feasible value in a range, rather than for an element in an array.

A typical problem gives several piles of bananas and a time limit `h`, then asks for the minimum eating speed. The faster the speed, the easier it is to finish within `h` hours, which gives us monotonicity.

These problems usually have two steps:

1. Set the answer range. For example, the minimum speed is `1`, and the maximum need not exceed the size of the largest pile.
2. Write a `check` function that determines whether a given speed can finish within `h` hours.

This upper bound relies on the problem constraint `h >= piles.length`. At a speed equal to the largest pile, each pile takes at most one hour, so total time does not exceed the number of piles.

```java
int minEatingSpeed(int[] piles, int h) {
    int left = 1;
    int right = 0;
    for (int pile : piles) {
        right = Math.max(right, pile);
    }
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (canFinish(piles, h, mid)) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    return left;
}

boolean canFinish(int[] piles, int h, int speed) {
    long hours = 0;
    for (int pile : piles) {
        hours += (pile + speed - 1) / speed;
    }
    return hours <= h;
}
```

Why return `left`? The loop searches for the first feasible speed. If `canFinish(mid)` is true, `mid` works, but a smaller speed may also work, so the right boundary moves left. When the boundaries meet, they identify the minimum feasible speed.

The `check` function is often more important than the binary search itself. Explain what `check` means before writing the search loop.

## Choosing a Binary Search Pattern

| Goal                                           | Template                    | Return value                                     |
| ---------------------------------------------- | --------------------------- | ------------------------------------------------ |
| Find an index equal to `target`                | Basic binary search         | Return its index, or `-1` if absent.             |
| Find the first position satisfying a condition | Lower bound                 | Return `left`, which may equal the array length. |
| Find the minimum feasible answer               | Binary search on the answer | Return the final `left`.                         |

If a problem asks for the “first,” “last,” “minimum feasible,” or “maximum feasible” value, check whether it is a boundary search before using the basic template.

## A Step-by-Step Interview Approach

Binary search code is short. Interviewers are more likely to ask why it is safe to discard half the range. When writing it, follow these steps:

1. State the search space: array indexes or an answer range.
2. Explain the monotonicity: why can one side of `mid` be discarded?
3. Define the interval: closed `[left, right]` or half-open `[left, right)`.
4. Set the update rules: whether `mid` may still be the answer determines whether to use `right = mid` or `right = mid - 1`.
5. Explain the return value: what do `left` and `right` represent when the loop ends?

A useful self-check is: **If `nums[mid]` satisfies the condition, have I accidentally discarded a possible answer?** In lower-bound searches and binary search on the answer, `mid` may still be valid, so do not automatically write `right = mid - 1`.

## Example: Find the First and Last Position

[34. Find First and Last Position of Element in Sorted Array](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/) is a classic boundary-search problem. Return the starting and ending positions of `target`, or `[-1, -1]` if it does not exist.

Do not find one occurrence of `target` and then scan in both directions. That may pass some cases, but can take `O(n)` in the worst case. A more reliable solution performs two boundary searches:

- First, find the first position greater than or equal to `target`.
- Then, find the first position greater than `target` and subtract 1.

The helper methods below match the earlier templates. The full code is included here so you can compare the return values with the main logic.

```java
int[] searchRange(int[] nums, int target) {
    int left = lowerBound(nums, target);
    if (left == nums.length || nums[left] != target) {
        return new int[] {-1, -1};
    }
    int right = upperBound(nums, target) - 1;
    return new int[] {left, right};
}

int lowerBound(int[] nums, int target) {
    int left = 0;
    int right = nums.length;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] >= target) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    return left;
}

int upperBound(int[] nums, int target) {
    int left = 0;
    int right = nums.length;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] > target) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    return left;
}
```

Common follow-up questions include: what if every array element equals `target`? What if `target` is absent but belongs in the middle? Both test whether you understand the return value. `lowerBound` returns the first position satisfying the condition; it does not guarantee that the value there equals `target`, so check before returning.

## Walkthrough and Edge Cases

Using the lower-bound template, find the first value greater than or equal to `2` in `[1, 2, 2, 2, 4]`:

| Iteration | `left` | `right` | `mid` | Check           | Next step   |
| --------- | ------ | ------- | ----- | --------------- | ----------- |
| 1         | 0      | 5       | 2     | `nums[2] >= 2`  | `right = 2` |
| 2         | 0      | 2       | 1     | `nums[1] >= 2`  | `right = 1` |
| 3         | 0      | 1       | 0     | `nums[0] < 2`   | `left = 1`  |
| End       | 1      | 1       | -     | `left == right` | Return 1    |

Check these edge cases before coding:

| Input       | Search             | Expected result                                                  |
| ----------- | ------------------ | ---------------------------------------------------------------- |
| `[]`        | `1`                | Return `-1` or insertion position `0`, depending on the problem. |
| `[1]`       | `1`                | Find the only element.                                           |
| `[1, 1, 1]` | Lower bound of `1` | Return `0`.                                                      |
| `[1, 3, 5]` | Lower bound of `4` | Return `2`.                                                      |
| `[1, 3, 5]` | Lower bound of `6` | Return `3`.                                                      |

Common mistake:

```java
while (left < right) {
    int mid = (left + right) / 2;
    if (nums[mid] >= target) {
        right = mid - 1; // Wrong: mid may be the lower bound, so do not discard it.
    } else {
        left = mid + 1;
    }
}
```

For a lower-bound search, when `nums[mid] >= target`, `mid` may still be the answer, so set `right = mid`.

## Common Pitfalls

- `mid = (left + right) / 2` may overflow; prefer `left + (right - left) / 2`.
- Do not mix update rules for closed and half-open intervals.
- When searching for a boundary, finding a matching value usually is not enough; continue narrowing the interval.
- Prove monotonicity before using binary search on the answer; do not apply it just because a problem asks for a minimum.
- A feasibility function such as `canFinish` may need `long` to avoid overflow when accumulating values.

## Review Questions

- How do `left < right` and `left <= right` differ?
- Why does binary search take `O(log n)` time?
- Why does a lower-bound search move `right` after finding a qualifying value?
- What is binary search on the answer, and how does it differ from ordinary binary search?
- Does binary search always require a sorted array?

## Practice Problems

- [704. Binary Search](https://leetcode.cn/problems/binary-search/)
- [35. Search Insert Position](https://leetcode.cn/problems/search-insert-position/)
- [34. Find First and Last Position of Element in Sorted Array](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/)
- [875. Koko Eating Bananas](https://leetcode.cn/problems/koko-eating-bananas/)
- [1011. Capacity To Ship Packages Within D Days](https://leetcode.cn/problems/capacity-to-ship-packages-within-d-days/)

<!-- @include: @article-footer.snippet.md -->
