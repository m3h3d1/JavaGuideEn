---
title: "Greedy Algorithm Interview Guide: Interval Scheduling, Jump Game, and Proof Techniques"
description: An interview guide to greedy algorithms, covering pattern recognition, sorting-based and interval strategies, Jump Game, correctness arguments, and common LeetCode problems.
category: Computer Science Fundamentals
tag:
  - Algorithms
head:
  - - meta
    - name: keywords
      content: greedy algorithms,greedy templates,interval scheduling,sorting,Jump Game,greedy proof,LeetCode greedy,algorithm interview questions
---

Greedy algorithms often have short implementations. The hard part is explaining why a local choice doesn't prevent a globally optimal result. In an interview, code without an explanation of the greedy strategy is likely to invite follow-up questions.

A useful starting point: if a problem can be approached by sorting or maintaining the best current boundary, and each local choice preserves an optimal solution, consider a greedy algorithm.

## What Interviewers Look For

- Identify a greedy strategy.
- Explain why it works using an exchange argument, contradiction, or a clear boundary argument.
- Handle the conditions for iterating through sorted data.
- Distinguish greedy algorithms from dynamic programming.

## How to Approach Greedy Problems

Avoid making choices based only on intuition. Before coding, explain at least two things:

1. What you choose at each step, such as the earliest finishing interval, the farthest reachable position, or a positive gain.
2. Why that choice doesn't make the remaining problem harder.

The proof doesn't need to be overly formal, but it should explain the trade-off. For interval scheduling, for example, choosing the interval that ends earliest leaves the most room for later intervals. Choosing an interval that ends later can't increase the number of intervals you can select.

## Common Patterns

| Pattern             | Greedy strategy                                  | Example problem                                                       |
| ------------------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| Assignment          | Satisfy the easiest-to-satisfy item first.       | Assign Cookies                                                        |
| Stock trading       | Add up all positive gains.                       | Best Time to Buy and Sell Stock II                                    |
| Jumping             | Track the farthest reachable position.           | Jump Game                                                             |
| Intervals           | Sort by the start or end point.                  | Non-overlapping Intervals, Minimum Number of Arrows to Burst Balloons |
| String partitioning | Track remaining counts or the farthest coverage. | Partition Labels                                                      |

Greedy problems often use sorting because it makes the local choice clear. Interval problems are commonly sorted by start or end point. Assignment problems often sort both requirements and resources, then match them with two pointers.

## Jump Game Template

```java
boolean canJump(int[] nums) {
    int farthest = 0;
    for (int i = 0; i < nums.length; i++) {
        if (i > farthest) {
            return false;
        }
        farthest = Math.max(farthest, i + nums[i]);
    }
    return true;
}
```

`farthest` is the most distant position reachable so far. If `i > farthest`, the current position can't be reached.

The greedy choice is to track the farthest reachable position, not the exact jump used to get to `i`. If `i` is within the reachable range, use it to extend that range.

Jump Game II adds the goal of using the fewest jumps. Track two boundaries:

- `curEnd`: the farthest position reachable with the current number of jumps.
- `farthest`: the farthest position reachable with one more jump from the current range.

When the scan reaches `curEnd`, the current jump has covered its range. Increment the jump count and update `curEnd` to `farthest`.

## Interval Greedy Template

For Non-overlapping Intervals, sort by end point in ascending order and keep the interval that ends earliest:

```java
int eraseOverlapIntervals(int[][] intervals) {
    if (intervals.length == 0) {
        return 0;
    }
    Arrays.sort(intervals, Comparator.comparingInt(a -> a[1]));
    int count = 1;
    int end = intervals[0][1];
    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] >= end) {
            count++;
            end = intervals[i][1];
        }
    }
    return intervals.length - count;
}
```

An earlier end leaves more room for later intervals. This is the key choice in this pattern.

The field used for sorting is a common source of mistakes:

- To select the most non-overlapping intervals, sort by end point in ascending order.
- To merge intervals, sort by start point in ascending order.
- To use the fewest arrows for balloons, sort by end point and let each arrow cover as many balloons as possible.

If a greedy strategy is hard to explain, try to find a counterexample with a small input. For instance, choosing the shortest interval may seem reasonable, but it doesn't guarantee the largest set of non-overlapping intervals.

## Example: Minimum Number of Arrows to Burst Balloons

[452. Minimum Number of Arrows to Burst Balloons](https://leetcode.cn/problems/minimum-number-of-arrows-to-burst-balloons/) is a classic interval-greedy problem. Each balloon is an interval `[start, end]`. An arrow at coordinate `x` bursts a balloon when `start <= x <= end`. Find the fewest arrows needed to burst them all.

The greedy choice is to **shoot each arrow at the right endpoint of the current overlap**. Sort by end point and place the first arrow at the first balloon's end. If a later balloon's start is `<= arrow`, the same arrow can burst it. If its start is `> arrow`, add an arrow at that balloon's end.

Handle two details in the code: return `0` for an empty array, and don't compare endpoints with `a[1] - b[1]`, which can overflow for extreme coordinates.

```java
int findMinArrowShots(int[][] points) {
    if (points.length == 0) {
        return 0;
    }
    Arrays.sort(points, (a, b) -> Integer.compare(a[1], b[1]));
    int arrows = 1;
    int arrow = points[0][1];
    for (int i = 1; i < points.length; i++) {
        if (points[i][0] > arrow) {
            arrows++;
            arrow = points[i][1];
        }
    }
    return arrows;
}
```

For `[[10,16],[2,8],[1,6],[7,12]]`, sorting by end point gives `[1,6]`, `[2,8]`, `[7,12]`, `[10,16]`. Put the first arrow at `6` to cover the first two intervals. The next interval starts at `7`, so add an arrow at `12`; that arrow also covers `[10,16]`. The answer is `2`.

## Greedy Algorithms vs. Dynamic Programming

| Aspect          | Greedy                                         | Dynamic programming                               |
| --------------- | ---------------------------------------------- | ------------------------------------------------- |
| Decision        | Choose the current option directly.            | Use multiple previous states.                     |
| Looking back    | Usually not needed.                            | State transitions depend on earlier results.      |
| What to prove   | The local choice preserves the global optimum. | Optimal substructure and overlapping subproblems. |
| Common problems | Intervals, jumps, assignment.                  | Knapsack, subsequences, paths.                    |

If a choice seems reasonable but fails on a small counterexample, the problem may need DP or search instead.

## Common Mistakes

- Many greedy problems require sorting; the wrong sort field can produce the wrong answer.
- Check whether touching interval boundaries count as overlap, such as `[1,2]` and `[2,3]`.
- In Jump Game II, when to increment the jump count depends on the current reachable boundary.
- Explain the greedy strategy; “choose the best option each time” isn't enough.

## Questions to Review

- How do you distinguish greedy from dynamic programming?
- Why are interval problems often sorted by end point?
- Why is tracking the farthest reachable position enough for Jump Game?
- How can an exchange argument or contradiction establish a greedy strategy?
- How should the comparison handle intervals that share a boundary?

## Recommended Practice Problems

- [455. Assign Cookies](https://leetcode.cn/problems/assign-cookies/)
- [122. Best Time to Buy and Sell Stock II](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/)
- [55. Jump Game](https://leetcode.cn/problems/jump-game/)
- [45. Jump Game II](https://leetcode.cn/problems/jump-game-ii/)
- [435. Non-overlapping Intervals](https://leetcode.cn/problems/non-overlapping-intervals/)
- [763. Partition Labels](https://leetcode.cn/problems/partition-labels/)

<!-- @include: @article-footer.snippet.md -->
