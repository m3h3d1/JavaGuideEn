---
title: "Backtracking Interview Questions: Combinations, Permutations, Subsets, Pruning, and Java Templates"
description: Learn how to recognize backtracking problems, implement combination, permutation, and subset patterns, prune duplicate or invalid choices, and analyze complexity.
category: Computer Science Basics
tag:
  - Algorithms
head:
  - - meta
    - name: keywords
      content: backtracking,backtracking templates,combinations,permutations,subsets,N-Queens,pruning,Java,LeetCode,algorithm interview questions
---

Backtracking problems ask you to find all solutions, paths, or combinations by exploring a set of choices. It is closely related to DFS, but emphasizes the cycle **choose -> recurse -> undo the choice**.

In an interview, first explain what the recursive function represents. Once that is clear, it is easier to define the parameters, base case, and undo step.

## Interview Topics

- Implement templates for combinations, permutations, and subsets.
- Explain the roles of `path`, `startIndex`, and `used`.
- Determine whether a problem requires deduplication.
- Prune branches that cannot produce valid results.
- Explain how complexity depends on the number of results.

## How to Approach Backtracking

Start by drawing a **decision tree**. Each level represents a choice, the root represents the state before any choices, and each leaf represents a complete solution.

Before coding, answer four questions:

1. What is the path? It is usually the elements already chosen and is often named `path`.
2. What choices are available at this point?
3. What is the stopping condition? When should `path` be added to the answer?
4. Is pruning needed? Which choices cannot lead to a valid solution?

Undoing a choice is essential, not just a convention. The same `path` is reused, so each branch must restore it before the next branch runs.

## Combination Template

Combinations do not depend on order, so `startIndex` usually controls where the next level begins:

```java
List<List<Integer>> combine(int n, int k) {
    List<List<Integer>> ans = new ArrayList<>();
    backtrack(1, n, k, new ArrayList<>(), ans);
    return ans;
}

void backtrack(int start, int n, int k, List<Integer> path, List<List<Integer>> ans) {
    if (path.size() == k) {
        ans.add(new ArrayList<>(path));
        return;
    }
    for (int i = start; i <= n; i++) {
        path.add(i);
        backtrack(i + 1, n, k, path, ans);
        path.remove(path.size() - 1);
    }
}
```

Combinations do not depend on order, so `[1, 2]` and `[2, 1]` are the same result. `start` ensures that later choices come only from positions after the current one, avoiding duplicates.

When choosing `k` numbers from `1..n`, you can also prune branches:

```java
for (int i = start; i <= n - (k - path.size()) + 1; i++) {
    // ...
}
```

If there are not enough numbers from `i` onward to complete a combination of size `k`, there is no need to continue exploring that branch.

## Permutation Template

Permutations depend on order, so use `used` to mark whether an element has already been chosen:

```java
List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> ans = new ArrayList<>();
    boolean[] used = new boolean[nums.length];
    backtrack(nums, used, new ArrayList<>(), ans);
    return ans;
}

void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> ans) {
    if (path.size() == nums.length) {
        ans.add(new ArrayList<>(path));
        return;
    }
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) {
            continue;
        }
        used[i] = true;
        path.add(nums[i]);
        backtrack(nums, used, path, ans);
        path.remove(path.size() - 1);
        used[i] = false;
    }
}
```

Permutations depend on order, so each level can consider every number, but cannot reuse a number. `used[i]` indicates whether `nums[i]` is already in the current path.

Deduplicating permutations is more error-prone than deduplicating combinations when the input contains duplicates. Sort first, then at each level skip a duplicate if the previous equal value has not been used:

```java
if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) {
    continue;
}
```

This keeps duplicate values in a consistent order at each level and prevents duplicate permutations.

## Subset Template

For subset problems, every node in the decision tree is a valid answer:

```java
List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> ans = new ArrayList<>();
    backtrack(0, nums, new ArrayList<>(), ans);
    return ans;
}

void backtrack(int start, int[] nums, List<Integer> path, List<List<Integer>> ans) {
    ans.add(new ArrayList<>(path));
    for (int i = start; i < nums.length; i++) {
        path.add(nums[i]);
        backtrack(i + 1, nums, path, ans);
        path.remove(path.size() - 1);
    }
}
```

Subset problems resemble combinations, but collect an answer at every node instead of only at a fixed length. A path of any length can be a subset.

If duplicates must be removed, as with input `[1, 2, 2]`, sort first and skip repeated values at the same level:

```java
if (i > start && nums[i] == nums[i - 1]) {
    continue;
}
```

## How to Deduplicate Results

If the input contains duplicates, sort it first, then choose a deduplication strategy based on the problem:

- For subsets and combinations, which choose later indexes, skip duplicate values at the same level with a condition such as `i > start && nums[i] == nums[i - 1]`.
- For permutations, which may scan from the beginning at each level, also use `used[]` to prevent reusing the same position.
- Distinguish choosing a duplicate at the same level from reusing an element along the same path. The former can create duplicate answers; the latter may be allowed by the problem.

## Walkthrough and Edge Cases

For combinations with `n = 3` and `k = 2`, the decision tree can be summarized as follows:

| First choice | Available second choices | Result                                   |
| ------------ | ------------------------ | ---------------------------------------- |
| Choose 1     | 2, 3                     | `[1, 2]`, `[1, 3]`                       |
| Choose 2     | 3                        | `[2, 3]`                                 |
| Choose 3     | None                     | Fewer than two numbers remain, so prune. |

Check these edge cases:

| Input              | Check                                                      |
| ------------------ | ---------------------------------------------------------- |
| Empty array        | A subset problem usually returns `[[]]`.                   |
| `k = 0`            | Should a combination problem return the empty combination? |
| Duplicate elements | Sort first and deduplicate at each level.                  |
| Only one result    | Make sure to copy `path`.                                  |

Common mistake:

```java
ans.add(path); // Wrong: path will keep changing during later recursion.
```

Instead, write:

```java
ans.add(new ArrayList<>(path));
```

Backtracking reuses the same `path` object. Without copying it, later recursive calls will change the lists already stored in the answer.

## Common Pitfalls

- Copy `path` when adding it to the answer; do not store the reference directly.
- Use `startIndex` for combinations and `used` for permutations.
- Sort first when deduplicating in the common patterns shown here.
- Pruning must not remove valid answers.
- Backtracking complexity often grows with the number of results; do not casually write `O(n)`.

## Practice Problems

- [77. Combinations](https://leetcode.cn/problems/combinations/)
- [78. Subsets](https://leetcode.cn/problems/subsets/)
- [46. Permutations](https://leetcode.cn/problems/permutations/)
- [39. Combination Sum](https://leetcode.cn/problems/combination-sum/)
- [51. N-Queens](https://leetcode.cn/problems/n-queens/)

<!-- @include: @article-footer.snippet.md -->
