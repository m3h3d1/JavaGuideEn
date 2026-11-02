---
title: "DFS and BFS Interview Guide: Trees, Graphs, Grid Search, and Shortest Paths"
description: An interview guide to depth-first search, breadth-first search, tree and graph traversal, grid search, level-order traversal, shortest paths, and Java templates.
category: Computer Science Fundamentals
tag:
  - Algorithms
head:
  - - meta
    - name: keywords
      content: DFS,BFS,depth-first search,breadth-first search,tree traversal,graph traversal,grid search,level-order traversal,shortest path,Java DFS,Java BFS,LeetCode
---

DFS and BFS are fundamental to tree, graph, and grid problems. Interviews rarely ask only “What is DFS?” More often, you are given an island, course prerequisites, a shortest-path problem, or a binary tree traversal and need to choose a search strategy and handle its edge cases.

A useful rule of thumb: consider DFS when you need to follow a path to its end, enumerate paths, or explore connected components. Consider BFS when you need to process nodes by level or find the shortest number of steps.

## What Interviewers Look For

- Write recursive DFS and queue-based BFS.
- Explain the complexity of tree and graph searches.
- Use `visited` to avoid revisiting nodes and getting stuck in cycles.
- Distinguish traversing every node from finding the shortest path.
- Model a grid problem as a graph search.

## Choosing Between DFS and BFS

Both DFS and BFS can traverse nodes, but each has different strengths.

| Goal                                          | Common choice     | Why                                                           |
| --------------------------------------------- | ----------------- | ------------------------------------------------------------- |
| Visit every node                              | Either DFS or BFS | Just make sure each node is visited once.                     |
| Find the area of a connected component        | DFS               | It naturally explores outward and often keeps the code short. |
| Find the shortest path in an unweighted graph | BFS               | It expands by levels, so the first visit is the shortest.     |
| Enumerate all paths                           | DFS               | The current path is naturally held on the call stack.         |
| Traverse a binary tree by level               | BFS               | The queue processes nodes level by level.                     |

If a problem asks for the fewest steps, a shortest path, or spreading to every location, consider BFS first. If it asks for all possibilities, whether a path exists, or the size of a connected component, consider DFS first.

## DFS Template

A common DFS implementation for a grid:

```java
void dfs(char[][] grid, int i, int j) {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length) {
        return;
    }
    if (grid[i][j] != '1') {
        return;
    }
    grid[i][j] = '2';
    dfs(grid, i + 1, j);
    dfs(grid, i - 1, j);
    dfs(grid, i, j + 1);
    dfs(grid, i, j - 1);
}
```

This marks visited land by changing it to `'2'`, using the input array as the visited marker. If the problem doesn't allow modifying the input, create a separate `boolean[][] visited`.

Define the meaning of a DFS function before writing it. Here, `dfs(i, j)` marks every land cell connected to `(i, j)`.

That meaning determines the order of operations:

1. Return if the coordinates are out of bounds.
2. Return if the current cell isn't land.
3. Mark the current cell to prevent revisiting it.
4. Visit its four neighbors.

Many DFS bugs come from marking a node too late. If you visit its neighbors before marking it, two adjacent cells can recurse back and forth indefinitely.

## BFS Template

BFS is useful for level-order traversal and shortest-path problems. This template assumes a non-empty rectangular grid where `0` is open and `1` is blocked. It returns the shortest number of steps from the start to the target, or `-1` if a coordinate is out of bounds or the target can't be reached:

```java
int bfs(int[][] grid, int startX, int startY, int targetX, int targetY) {
    if (grid == null || grid.length == 0 || grid[0].length == 0) {
        return -1;
    }
    int rows = grid.length;
    int columns = grid[0].length;
    if (startX < 0 || startX >= rows || startY < 0 || startY >= columns
            || targetX < 0 || targetX >= rows || targetY < 0 || targetY >= columns
            || grid[startX][startY] == 1 || grid[targetX][targetY] == 1) {
        return -1;
    }
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    Queue<int[]> queue = new ArrayDeque<>();
    queue.offer(new int[] {startX, startY});
    boolean[][] visited = new boolean[rows][columns];
    visited[startX][startY] = true;
    int step = 0;
    while (!queue.isEmpty()) {
        int size = queue.size();
        for (int k = 0; k < size; k++) {
            int[] cur = queue.poll();
            if (cur[0] == targetX && cur[1] == targetY) {
                return step;
            }
            for (int[] dir : dirs) {
                int x = cur[0] + dir[0];
                int y = cur[1] + dir[1];
                if (x < 0 || x >= rows || y < 0 || y >= columns
                        || visited[x][y] || grid[x][y] == 1) {
                    continue;
                }
                visited[x][y] = true;
                queue.offer(new int[] {x, y});
            }
        }
        step++;
    }
    return -1;
}
```

The template returns the current level when the target is first removed from the queue. A particular problem may define traversable cells differently from `0` and `1`, so adjust the condition as needed.

BFS works level by level. At the start of each iteration, the queue contains the current level. Save its size, process exactly those nodes, and add their neighbors to the next level.

Why does BFS find the shortest path in an unweighted graph? Every edge has the same cost. The first time BFS reaches a node, it has used the fewest edges possible. Reaching it again later can't produce a shorter path, so mark it visited.

Multi-source BFS is also common. For example, in Rotting Oranges, all rotten oranges spread at the same time. Add every initially rotten orange to the queue, then expand level by level.

## Tree Search vs. Graph Search

Trees have no cycles, so you often don't need `visited`. Graphs can contain cycles, so you need to account for repeat visits.

| Scenario                        | Is `visited` commonly needed? | Why                                                            |
| ------------------------------- | ----------------------------- | -------------------------------------------------------------- |
| Recursive binary tree traversal | Usually not                   | A child has no edge back to its parent.                        |
| Undirected graph traversal      | Yes                           | Otherwise, two nodes can keep visiting each other.             |
| Directed graph traversal        | Usually                       | The graph may contain cycles.                                  |
| Grid search                     | Yes                           | Movement between neighboring cells can lead back to the start. |

## Complexity

For graph searches, `V` is the number of vertices and `E` is the number of edges. With an adjacency list, DFS and BFS usually take `O(V + E)` time and `O(V)` space.

For an `m` by `n` grid, each cell is visited at most once. The time complexity is `O(mn)`, and the visited markers or queue can use up to `O(mn)` space.

## Turning a Grid Problem into a Graph

Treat each cell in a grid as a graph node. Its edges lead to its neighbors, usually the four cells above, below, left, and right.

A common direction array is:

```java
int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
```

For each neighbor:

1. Calculate its coordinates.
2. Check that they are in bounds.
3. Check whether it has been visited and whether it meets the problem's conditions.

If diagonal movement is allowed, add the four diagonal directions. A direction array is less error-prone than writing four nearly identical recursive calls.

## Walkthrough and Edge Cases

For Number of Islands, start a DFS or BFS whenever you find an unvisited land cell, then mark the entire island.

| Step | Action                     | Purpose                               |
| ---- | -------------------------- | ------------------------------------- |
| 1    | Scan the grid for a `1`    | Find a new island.                    |
| 2    | Increment the island count | Record a connected component.         |
| 3    | Run DFS/BFS from that cell | Mark all land in the island.          |
| 4    | Continue scanning          | Avoid counting the same island again. |

Check these grid edge cases:

| Input                          | What to check                                                    |
| ------------------------------ | ---------------------------------------------------------------- |
| Empty grid                     | Check the row and column counts first.                           |
| All water                      | The answer should be `0`.                                        |
| All land                       | The grid should count as one connected component.                |
| Only diagonally adjacent cells | They aren't connected if movement is limited to four directions. |

A common mistake is marking a cell after recursing:

```java
void dfs(char[][] grid, int i, int j) {
    dfs(grid, i + 1, j);
    grid[i][j] = '2'; // Wrong: marking this late can cause repeated recursion.
}
```

Mark a node before exploring its neighbors. If a graph or grid allows a path back to an adjacent node, marking it too late can cause repeated visits or a stack overflow.

## Common Mistakes

- Mark nodes as visited when enqueuing them in BFS to avoid adding the same node repeatedly.
- Deep DFS recursion can overflow the call stack; mention that it can be replaced with an explicit stack.
- Check grid bounds before accessing an array element.
- In an undirected graph, account for the edge back to the parent.
- When counting shortest-path steps, track levels using the queue size at the start of each level.

## Recommended Practice Problems

- [102. Binary Tree Level Order Traversal](https://leetcode.cn/problems/binary-tree-level-order-traversal/)
- [200. Number of Islands](https://leetcode.cn/problems/number-of-islands/)
- [695. Max Area of Island](https://leetcode.cn/problems/max-area-of-island/)
- [994. Rotting Oranges](https://leetcode.cn/problems/rotting-oranges/)
- [207. Course Schedule](https://leetcode.cn/problems/course-schedule/)

<!-- @include: @article-footer.snippet.md -->
