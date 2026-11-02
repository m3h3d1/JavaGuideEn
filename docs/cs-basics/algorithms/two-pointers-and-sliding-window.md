---
title: "Two Pointers and Sliding Window Interview Guide: Common Array, List, and String Templates"
description: An interview guide to two-pointer and sliding-window techniques, covering left and right pointers, fast and slow pointers, read and write pointers, fixed and variable windows, Java templates, and common LeetCode problems.
category: Computer Science Fundamentals
tag:
  - Algorithms
head:
  - - meta
    - name: keywords
      content: two pointers,sliding window,fast and slow pointers,left and right pointers,read and write pointers,fixed window,variable window,array algorithms,linked list algorithms,string algorithms,LeetCode
---

Two pointers and sliding windows are often studied together, but they don't solve exactly the same problems. Two pointers describe a way to move two positions through data; a sliding window maintains state for a contiguous range.

A useful rule of thumb: if the problem depends on the relationship between two positions, consider two pointers. If it concerns a contiguous subarray or substring and requires maintaining a condition within that range, consider a sliding window.

## What Interviewers Look For

- Distinguish left/right pointers, fast/slow pointers, and read/write pointers.
- Maintain counts, sums, maxima, or match state inside a sliding window.
- Explain why pointers move in one direction and the total time is `O(n)`.
- Handle empty arrays, single elements, duplicates, and window boundaries.

## How Are They Different?

Two pointers is a broad technique: any approach where two pointers advance together or independently can fit. A sliding window is more specific. It maintains a contiguous range `[left, right]` and usually tracks state such as character counts, a sum, a maximum, or the number of matches.

| Problem clue                                                | Likely technique        |
| ----------------------------------------------------------- | ----------------------- |
| Find two values in a sorted array                           | Left and right pointers |
| Find a cycle, midpoint, or kth node in a linked list        | Fast and slow pointers  |
| Remove or overwrite elements in place                       | Read and write pointers |
| Find, count, or optimize a contiguous subarray or substring | Sliding window          |

In an interview, state what each pointer means before coding. For example, “`left` is the left boundary of the window, and `right` is the character I'm trying to add.” This makes it easier to reason about when to shrink the window.

## Left and Right Pointers

Left and right pointers are common in sorted arrays and problems that shrink toward the center:

```java
int[] twoSumSorted(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    while (left < right) {
        int sum = nums[left] + nums[right];
        if (sum == target) {
            return new int[] {left, right};
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return new int[] {-1, -1};
}
```

For an unsorted array, you may need to sort it first. Account for the sorting cost: the total complexity then becomes `O(nlogn)`.

This technique works because each comparison can rule out some candidates. For Two Sum in a sorted array:

- If the sum is too small, the left value is too small. Moving the right pointer left would make the sum even smaller, so move the left pointer right.
- If the sum is too large, the right value is too large. Moving the left pointer right would make the sum even larger, so move the right pointer left.

3Sum follows the same idea: fix one value, then solve Two Sum in the remaining range. Handle duplicates by skipping repeated fixed values and repeated matches found by the two pointers.

## Fast and Slow Pointers

Fast and slow pointers are common in linked list problems:

```java
boolean hasCycle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {
            return true;
        }
    }
    return false;
}
```

Keep each pointer's meaning clear, and preserve the order in the loop condition: check `fast != null` before `fast.next`.

Two common speed gaps are:

- `fast` advances two nodes and `slow` one: detect a cycle or find the middle of a list.
- One pointer advances `k` nodes first, then both advance together: find the kth node from the end.

For the kth node from the end, maintain a gap of `k` nodes between the pointers. When the first pointer reaches the end, the second points to the target. When removing the nth node from the end, a dummy node makes it easier to handle removal of the head.

## Read and Write Pointers

Read and write pointers are useful for modifying an array in place:

```java
int removeDuplicates(int[] nums) {
    if (nums.length == 0) {
        return 0;
    }
    int write = 1;
    for (int read = 1; read < nums.length; read++) {
        if (nums[read] != nums[read - 1]) {
            nums[write] = nums[read];
            write++;
        }
    }
    return write;
}
```

`read` scans the input; `write` points to the next position to fill. State what each variable represents before coding.

The idea is to scan the whole array while writing only the values that should be kept into the beginning of the same array. These problems often ask for an in-place update and a new length, not a separate result array.

For each `read` position, decide whether its value should remain. If so, write it at `write` and increment `write`; otherwise, advance only `read`.

## Variable-Size Sliding Window

Here is the Longest Substring Without Repeating Characters pattern:

```java
int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> count = new HashMap<>();
    int left = 0;
    int ans = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        count.put(c, count.getOrDefault(c, 0) + 1);
        while (count.get(c) > 1) {
            char d = s.charAt(left);
            count.put(d, count.get(d) - 1);
            left++;
        }
        ans = Math.max(ans, right - left + 1);
    }
    return ans;
}
```

The right pointer expands the window. When the window becomes invalid, the left pointer shrinks it. Each character enters and leaves the window at most once, so the time complexity is `O(n)`.

A variable window usually follows this sequence:

1. Add a new element with the right pointer and update the window state.
2. While the window doesn't satisfy the condition, advance the left pointer and update the state.
3. Update the answer at the point that matches the problem's requirements.

The update timing differs between longest and shortest problems:

- For the longest valid window, update the answer after restoring validity.
- For the shortest window that satisfies a condition, update the answer while the condition is satisfied, then keep shrinking from the left.

For Minimum Window Substring, once the window covers the target characters, record the answer before shrinking. For Longest Substring Without Repeating Characters, first remove duplicates to make the window valid, then update the answer.

## Fixed-Size Sliding Window

A fixed window is useful for problems about a subarray or substring of length `k`:

```java
int maxSum(int[] nums, int k) {
    int window = 0;
    for (int i = 0; i < k; i++) {
        window += nums[i];
    }
    int ans = window;
    for (int right = k; right < nums.length; right++) {
        window += nums[right];
        window -= nums[right - k];
        ans = Math.max(ans, window);
    }
    return ans;
}
```

At each step, add one element on the right and remove one element on the left.

A fixed-size window doesn't need a `while` loop to shrink; its length never changes. Treat it as a rolling aggregate:

- Add the new element.
- Remove the element that leaves the window.
- Update the answer.

If you need to maintain a maximum or minimum in the window, a regular variable isn't enough. A monotonic queue is often appropriate. For Sliding Window Maximum, for example, store the indexes that could still be the maximum; the index at the front identifies the current maximum.

## A Reliable Interview Workflow

The main risk in these problems is changing what a pointer means halfway through. Use this order:

1. Identify the pattern: inward-moving pointers, fast/slow pointers, in-place overwrite, or a contiguous window.
2. Define each pointer: where do `left`, `right`, `slow`, `fast`, and `write` point?
3. Define the window state: a sum, counts, a maximum, or a match count?
4. State the move conditions: when does the right pointer expand and when does the left pointer shrink?
5. State when to update the answer: after restoring validity for longest windows, or while the condition holds for shortest windows.

In short: **longest-window problems usually restore validity before updating the answer; shortest-window problems usually record the answer before shrinking further.**

## Example: Minimum Window Substring

[76. Minimum Window Substring](https://leetcode.cn/problems/minimum-window-substring/) tests the details of sliding windows. Find the shortest substring of `s` containing every character in `t`, including the required number of occurrences.

Track three things:

- `need`: the number of times each character occurs in `t`.
- `window`: the number of times each character occurs in the current window.
- `valid`: the number of distinct characters that have reached their required counts.

When `valid == need.size()`, the window covers `t`. Update the answer, then try to shrink the window from the left.

```java
String minWindow(String s, String t) {
    Map<Character, Integer> need = new HashMap<>();
    Map<Character, Integer> window = new HashMap<>();
    for (char c : t.toCharArray()) {
        need.put(c, need.getOrDefault(c, 0) + 1);
    }

    int left = 0;
    int valid = 0;
    int start = 0;
    int minLen = Integer.MAX_VALUE;

    for (int right = 0; right < s.length(); right++) {
        char in = s.charAt(right);
        if (need.containsKey(in)) {
            window.put(in, window.getOrDefault(in, 0) + 1);
            if (window.get(in).equals(need.get(in))) {
                valid++;
            }
        }

        while (valid == need.size()) {
            if (right - left + 1 < minLen) {
                start = left;
                minLen = right - left + 1;
            }
            char out = s.charAt(left);
            left++;
            if (need.containsKey(out)) {
                if (window.get(out).equals(need.get(out))) {
                    valid--;
                }
                window.put(out, window.get(out) - 1);
            }
        }
    }

    return minLen == Integer.MAX_VALUE ? "" : s.substring(start, start + minLen);
}
```

Two easy-to-miss details:

- Decrement `valid` before reducing `window[out]`, because the window still exactly meets the requirement at that point.
- Update the answer inside `while (valid == need.size())`, since only a window that covers `t` is a candidate.

## Walkthrough and Edge Cases

For Longest Substring Without Repeating Characters, the window for `abba` changes like this:

| Right character | Window after adding | Valid? | Left pointer movement          | Longest so far |
| --------------- | ------------------- | ------ | ------------------------------ | -------------- |
| `a`             | `a`                 | Yes    | No movement                    | 1              |
| `b`             | `ab`                | Yes    | No movement                    | 2              |
| `b`             | `abb`               | No     | Remove `a`, then the first `b` | 2              |
| `a`             | `ba`                | Yes    | No movement                    | 2              |

Check these edge cases for sliding windows:

| Input                                  | What to check                                 |
| -------------------------------------- | --------------------------------------------- |
| Empty string or array                  | Should the answer immediately be 0?           |
| All characters are the same            | Does the left boundary keep advancing?        |
| No repeated characters                 | Can the answer grow to the full input length? |
| Best window is at the beginning or end | Is the answer updated at the right time?      |

A common mistake is to move the left pointer only once:

```java
if (count.get(c) > 1) {
    left++; // Wrong: one step may not restore a valid window.
}
```

Variable windows usually need `while` to shrink until the condition is restored. One step may not be enough for inputs such as `abba` or `aaabc`.

## Common Mistakes

- Define both pointer meanings before coding.
- Update the answer at the right time for a longest or shortest window.
- Update window counts, sums, and match counts whenever the left pointer moves.
- Check `fast` and `fast.next` before dereferencing them in linked list problems.
- Handle duplicate values explicitly in problems such as 3Sum.

## Questions to Review

- Why do many two-pointer solutions run in `O(n)` rather than `O(n^2)`?
- Why does 3Sum usually sort the input, and where does it need deduplication?
- For an even-length linked list, does a fast/slow solution return the first or second middle node?
- When is a single `if` enough to shrink a window, and when is a `while` necessary?
- How does answer-update timing differ for longest and shortest windows?

## Recommended Practice Problems

- [26. Remove Duplicates from Sorted Array](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/)
- [15. 3Sum](https://leetcode.cn/problems/3sum/)
- [141. Linked List Cycle](https://leetcode.cn/problems/linked-list-cycle/)
- [3. Longest Substring Without Repeating Characters](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)
- [76. Minimum Window Substring](https://leetcode.cn/problems/minimum-window-substring/)

<!-- @include: @article-footer.snippet.md -->
