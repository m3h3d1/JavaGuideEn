---
title: "Dynamic Programming Interview Guide: State Transitions, Knapsack, Subsequences, and Java Templates"
description: An interview guide to dynamic programming, covering state definitions, transitions, initialization, iteration order, 0/1 and unbounded knapsack, subsequences, interval DP, and common LeetCode problems.
category: Computer Science Fundamentals
tag:
  - Algorithms
head:
  - - meta
    - name: keywords
      content: dynamic programming,DP,state transition,knapsack,0/1 knapsack,unbounded knapsack,subsequence,interval DP,Java dynamic programming,LeetCode DP
---

Dynamic programming is hard not because the code is always long, but because a wrong state definition leads to the wrong transitions, initialization, and iteration order.

Don't start an interview by reciting a template. First ask: Can this problem be broken into smaller subproblems? Does the current answer depend on answers already computed? If both are true, DP may be a good fit.

## What Interviewers Look For

- Explain what `dp[i]` or `dp[i][j]` represents.
- Write the state transition.
- Choose the right initialization and iteration order.
- Decide whether the space can be reduced.
- Recognize common patterns such as knapsack, subsequences, and interval DP.

## When to Consider Dynamic Programming

Don't apply DP just because a problem asks for an optimum. A better starting point is to check two things:

1. Can the problem be split into smaller problems of the same kind?
2. Are the same subproblems computed repeatedly?

For example, Fibonacci number `f(n)` depends on `f(n - 1)` and `f(n - 2)`, and the recursive calculation repeats work for `f(n - 2)`. Store those intermediate answers and you have DP.

In an interview, you can start with a brute-force recursive solution, explain where it repeats work, and then improve it with memoization or tabulation. This shows your reasoning more clearly than starting with a `dp` array from memory.

## The Five Steps of DP

1. Define the state: What exactly does `dp[i]` represent?
2. Write the transition: Which states determine the current state?
3. Initialize the base cases: What is the answer before any transitions?
4. Choose the iteration order: Which states must be calculated first?
5. Check a sample: Work through a small input by hand.

The state definition is the most important step. If the meaning of `dp[i]` is vague, the code that follows often becomes guesswork.

A good state definition usually:

- Covers the answer the problem asks for.
- Can be derived from smaller states.
- Uses as few dimensions as practical without making the meaning unclear.

## One-Dimensional DP Example

Climbing Stairs:

```java
int climbStairs(int n) {
    if (n <= 2) {
        return n;
    }
    int prev2 = 1;
    int prev1 = 2;
    for (int i = 3; i <= n; i++) {
        int cur = prev1 + prev2;
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}
```

State meaning: the number of ways to reach step `i`. Transition: `dp[i] = dp[i - 1] + dp[i - 2]`.

The recurrence follows from the last move: to reach step `i`, take one step from `i - 1` or two steps from `i - 2`.

Since `dp[i]` depends only on the previous two states, the array can be reduced to two variables. Only compress the space after confirming that older states aren't needed later.

## 0/1 Knapsack Template

Each item can be selected at most once:

```java
int knapsack01(int[] weights, int[] values, int capacity) {
    int[] dp = new int[capacity + 1];
    for (int i = 0; i < weights.length; i++) {
        for (int j = capacity; j >= weights[i]; j--) {
            dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
        }
    }
    return dp[capacity];
}
```

Iterate through capacities in descending order so the same item isn't used more than once in an iteration.

This is one of the most common knapsack follow-up questions. If capacities were processed in ascending order, `dp[j]` could use a value updated earlier in the same iteration, effectively selecting the same item multiple times. That would turn it into unbounded knapsack.

A 0/1 knapsack problem may not be described as a knapsack problem. For example, “Can the array be split into two subsets with equal sums?” can be reframed as asking whether some values sum to half of the total.

## Unbounded Knapsack Template

Each item can be selected multiple times:

```java
int unboundedKnapsack(int[] weights, int[] values, int capacity) {
    int[] dp = new int[capacity + 1];
    for (int i = 0; i < weights.length; i++) {
        for (int j = weights[i]; j <= capacity; j++) {
            dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
        }
    }
    return dp[capacity];
}
```

Iterate through capacities in ascending order to allow reuse of the current item.

For unbounded knapsack, ascending order is what lets an item be reused. In Coin Change, for example, each coin can be used multiple times, so a larger amount can build on a state already updated using the current coin.

The iteration order also changes depending on whether the problem asks for combinations or permutations:

- For combinations, usually iterate over items first, then capacities.
- For permutations, usually iterate over capacities first, then items.

This distinction matters in problems such as Coin Change II.

## Common DP Patterns

| Pattern                        | State design                                                                        | Examples      |
| ------------------------------ | ----------------------------------------------------------------------------------- | ------------- |
| Climbing stairs / House Robber | `dp[i]` is the best answer for the first `i` positions.                             | 70, 198       |
| Knapsack                       | `dp[j]` is the best value or number of ways for capacity `j`.                       | 416, 518, 322 |
| Subsequences                   | `dp[i]` or `dp[i][j]` describes a subsequence ending at a position or two prefixes. | 300, 1143     |
| Palindromes                    | `dp[i][j]` describes whether interval `[i, j]` meets a condition or its best value. | 647, 516      |
| Paths                          | `dp[i][j]` is the answer for reaching cell `(i, j)`.                                | 62, 64        |

## Memoization or Tabulation?

Both approaches store answers to subproblems.

| Approach    | Characteristics                                               | Useful when                                               |
| ----------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| Memoization | Recurse from the target state and calculate states as needed. | Transitions are complex or recursion is more natural.     |
| Tabulation  | Fill a table from smaller states to larger states.            | The iteration order is clear or you want to reduce space. |

If the iteration order isn't clear at first, write a memoized solution. Once the state relationships are clear, convert it to tabulation if useful. Memoization can also be easier to get right for tree DP and interval DP.

## A Good Interview Explanation

Before coding a DP problem, explain these four points:

1. What the `dp` array means and where the final answer is stored.
2. Which previous states the current state depends on and why they are already available.
3. Why the initialization is correct, especially what `0`, `1`, or infinity represents.
4. Why the iteration order doesn't use a state too early or reuse an item when it shouldn't.

If these points aren't clear, the code may only work because you memorized it, and variations will be harder to handle.

## Example: Coin Change

[322. Coin Change](https://leetcode.cn/problems/coin-change/) is a useful unbounded knapsack problem for interviews. Given coin denominations and a target amount, find the fewest coins needed to make that amount. Each coin can be used any number of times.

Define the state as:

```text
dp[j] is the minimum number of coins needed to make amount j.
```

Initialization matters. `dp[0] = 0` because no coins are needed to make amount 0. Set all other amounts to a large value that represents “not reachable yet.”

The code uses `Arrays.fill`, so import `java.util.Arrays`.

```java
int coinChange(int[] coins, int amount) {
    int max = amount + 1;
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, max);
    dp[0] = 0;

    for (int coin : coins) {
        for (int j = coin; j <= amount; j++) {
            dp[j] = Math.min(dp[j], dp[j - coin] + 1);
        }
    }

    return dp[amount] == max ? -1 : dp[amount];
}
```

Why iterate through amounts in ascending order? A coin can be used more than once. When calculating `dp[j]`, the state `dp[j - coin]` may already include the current coin, allowing it to be reused. That's exactly what unbounded knapsack requires.

If each coin could only be used once, iterate through amounts in descending order. The iteration direction controls whether the same item can be used more than once.

## Comparing State Definitions

DP problems are often hard because the state is defined incorrectly, not because the transition is difficult. These similar-looking states lead to different solutions:

| Pattern                        | State meaning                                              | What the transition considers                                |
| ------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------ |
| Longest Increasing Subsequence | `dp[i]` is the LIS length ending at `nums[i]`.             | `nums[i]` must be included; look for smaller earlier values. |
| House Robber                   | `dp[i]` is the maximum amount from the first `i` houses.   | Rob or skip house `i`.                                       |
| Longest Common Subsequence     | `dp[i][j]` is the LCS length of two prefixes.              | Compare the last character of each prefix.                   |
| Palindromic substring          | `dp[i][j]` says whether interval `[i, j]` is a palindrome. | Depends on the inner interval `[i + 1, j - 1]`.              |

In an interview, clarify whether `dp[i]` means “ending at `i`” or “within the first `i` elements.” That distinction prevents many subsequence mistakes.

## Walkthrough and Edge Cases

For Climbing Stairs with `n = 5`, the states change like this:

| `i` | `dp[i - 2]` | `dp[i - 1]` | `dp[i]` |
| --- | ----------- | ----------- | ------- |
| 3   | 1           | 2           | 3       |
| 4   | 2           | 3           | 5       |
| 5   | 3           | 5           | 8       |

The important point isn't the values: each state depends only on the previous two, so the array can be reduced to two variables.

Check these DP edge cases:

| Input                            | What to check                                   |
| -------------------------------- | ----------------------------------------------- |
| `n = 0` or empty array           | Does the initialization cover it?               |
| Only one element                 | Could the code access `dp[1]` out of bounds?    |
| Target is unreachable            | Can the initial value represent “unreachable”?  |
| Counting the number of solutions | Are initialization and iteration order correct? |

A common mistake in 0/1 knapsack is to iterate through capacity in ascending order:

```java
for (int j = weights[i]; j <= capacity; j++) {
    dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]); // Wrong for 0/1 knapsack.
}
```

For 0/1 knapsack, capacity must be processed in descending order. Otherwise, an updated state can be reused in the same iteration, selecting the same item multiple times.

## Common Mistakes

- Keep the meaning of `dp` consistent.
- Choose initialization based on the state meaning; don't fill every state with `0` by default.
- Iterate through capacity in descending order for 0/1 knapsack and ascending order for unbounded knapsack.
- The initialization for counting solutions differs from the initialization for optimization problems.
- In subsequence problems, distinguish “ending at `i`” from “within the first `i` elements.”

## Questions to Review

- Why is defining the state the first step in DP?
- How do memoization and tabulation differ? When is memoization a good starting point?
- Why does 0/1 knapsack iterate through capacity in descending order?
- Why can unbounded knapsack iterate through capacity in ascending order?
- How does the transition change when `dp[i]` means “ending at `i`” rather than “within the first `i` elements”?
- What should you consider when initializing DP for a minimum, maximum, or number of ways?

## Recommended Practice Problems

- [70. Climbing Stairs](https://leetcode.cn/problems/climbing-stairs/)
- [198. House Robber](https://leetcode.cn/problems/house-robber/)
- [322. Coin Change](https://leetcode.cn/problems/coin-change/)
- [416. Partition Equal Subset Sum](https://leetcode.cn/problems/partition-equal-subset-sum/)
- [300. Longest Increasing Subsequence](https://leetcode.cn/problems/longest-increasing-subsequence/)
- [1143. Longest Common Subsequence](https://leetcode.cn/problems/longest-common-subsequence/)

<!-- @include: @article-footer.snippet.md -->
