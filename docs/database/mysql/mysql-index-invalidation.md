---
title: Common Cases Where MySQL Does Not Use Indexes
description: Learn why MySQL may not use indexes, including non-covering queries, leftmost-prefix violations, functions on indexed columns, wildcard searches, OR conditions, type conversion, and sorting.
category: Database
tag:
  - MySQL
  - Performance
head:
  - - meta
    - name: keywords
    - content: MySQL index usage, leftmost-prefix rule, covering index, index condition pushdown, implicit conversion, SQL optimization, full table scan, table lookup
---

Indexes are one of the most effective tools for database optimization. However, **creating an index does not guarantee that MySQL will use it**. A query can remain slow despite an index on the relevant column; `EXPLAIN` may reveal a full table scan.

MySQL may skip an index because of the query or index design. Some cases are obvious, such as violating the leftmost-prefix rule; others are less apparent, such as implicit type conversion. Understanding these cases helps prevent production performance issues.

This guide summarizes common cases where MySQL does not use an index, explains why, and suggests ways to investigate and optimize queries.

### `SELECT *` and cost-based decisions

- **Key point**: `SELECT *` does **not directly disable indexes**. It is usually a non-covering query, but an index can still be considered if the `WHERE` clause matches one.
- **Cost of table lookups**: If requested columns are not in the index, MySQL uses the primary key to fetch full rows from the clustered index. The optimizer compares the cost of an index scan plus row lookups with a full table scan. If many rows match (often around 20–30%), sequential I/O for a full scan may cost less than random lookups, so the optimizer may **choose not to use the index**.
- **Tradeoffs**:
  - **Covering index**: If the query needs only indexed columns, a covering index avoids row lookups.
  - **When lookups are necessary**: Select the required columns. If most columns are needed, readability may matter more than avoiding a few columns; `SELECT *` can be reasonable.
- **Recommendation**: Prefer explicit columns and covering indexes when practical. Do not avoid `SELECT *` dogmatically when many columns are required.

### Violating the leftmost-prefix rule

- **Key point**: For a composite index, MySQL matches query columns from left to right in index order. Conditions on the leftmost columns let MySQL filter rows using the index.
- **Effect of range conditions**: In a composite index, columns up to and including a range condition (such as `>`, `<`, `BETWEEN`, or prefix `LIKE 'abc%'`) can help locate rows. Later columns cannot further narrow the lookup in the same way because they are ordered only when preceding columns have equal values. In MySQL 5.6 and later, index condition pushdown (ICP) can still filter on later columns during a range scan and reduce row lookups.
- **Index Skip Scan (ISS)**: Introduced in MySQL 8.0.13, ISS can skip a missing leftmost prefix by enumerating distinct values of the leading column and scanning later index columns.
  - **Version warning**: MySQL **8.0.31** has a serious ISS bug ([[Bug #109145]](https://bugs.mysql.com/bug.php?id=109145)) that can return incomplete results when reading across ranges because a stale range boundary is not cleared.
  - **Recommendation**: ISS can help when the leading column has low cardinality, since fewer distinct values require fewer scans. Low cardinality is not a formal requirement; the optimizer decides based on cost. **Do not rely on ISS to compensate for poor index design**. Adjust the composite index order or include the leading column in the query.

**Index Skip Scan failure path:**

```mermaid
sequenceDiagram
    participant Executor
    participant InnoDB_Index

    Note over Executor, InnoDB_Index: ISS bug scenario in MySQL 8.0.31
    Executor->>InnoDB_Index: Read Range 1 (Prefix A)
    InnoDB_Index-->>Executor: Return Rows, Set End-of-Range = X
    Executor->>InnoDB_Index: Read Range 2 (Prefix B)
    Note right of InnoDB_Index: [BUG] Previous range boundary X was not cleared
    InnoDB_Index-->>Executor: Current value > X; incorrectly treated as out of range, so scanning stops early
    Note over Executor: Rows are missing (incorrect result)
```

Examples:

```sql
-- Index: (sname, s_code, address)
SELECT * FROM students WHERE s_code = 1;                  -- Skips the leftmost column sname; index cannot locate matching rows
SELECT * FROM students WHERE sname = 'A' AND address = 'Shanghai'; -- Skips s_code; sname narrows the scan, and ICP may filter address
SELECT * FROM students WHERE sname = 'A' AND s_code > 1 AND address = 'Shanghai'; -- address filters rows after the range; it cannot narrow the lookup
```

### Applying calculations, functions, or conversions to indexed columns

- **Key point**: A B+Tree index stores the column's **original values**. Applying a function such as `ABS()` or `DATE()`, or performing arithmetic on the indexed column in a `WHERE` condition, changes the values being compared.
- **Why index lookup is affected**: The B+Tree is ordered by original values, not the results of arbitrary functions. MySQL may be unable to use the index to locate rows efficiently.
- **Functional indexes**: MySQL 8.0 supports functional indexes, but rewriting the query is often preferable.

Examples:

```sql
SELECT * FROM students WHERE height + 1 = 170;            -- Calculation on an indexed column
SELECT * FROM students WHERE DATE(create_time) = '2022-01-01'; -- Function on an indexed column
```

Rewrite the predicates:

```sql
SELECT * FROM students WHERE height = 169;                -- Move the calculation to the other side
SELECT * FROM students WHERE create_time BETWEEN '2022-01-01 00:00:00' AND '2022-01-01 23:59:59';
```

### `LIKE` patterns with a leading wildcard

- **Key point**: A `LIKE` pattern must start with literal characters to use the index ordering, for example `WHERE sname LIKE 'Guide%'`. A leading `%` wildcard prevents MySQL from locating the start of the matching range.
- **Why a leading wildcard matters**: With a pattern such as `'%abc'`, the prefix is unknown, so matches may occur anywhere in the index.
- **Recommendations**:
  - If a leading wildcard is necessary, select only columns covered by an index when possible. `EXPLAIN` may show `type: index` (an **index full scan**); it scans the full index but avoids row lookups, and may be cheaper than `ALL`.
  - Use **Elasticsearch** or another search engine for large-scale searches in core workloads.

Examples:

```sql
SELECT * FROM students WHERE sname LIKE '%Guide';          -- Leading wildcard; may scan the table
SELECT * FROM students WHERE sname LIKE '%Guide%';         -- Wildcards on both sides; may scan the table
```

### `OR` conditions and Index Merge

- **Key point**: If any `OR` condition has no supporting index, MySQL may choose a full table scan.
- **Index Merge**: If both sides of an `OR` have indexes, MySQL 5.1 and later may use Index Merge to scan both indexes and combine the results. If many rows match, combining results may cost more than a full table scan.
- **Recommendations**:
  - Consider rewriting `OR` as `UNION ALL` so each query can use its own index.
  - Use `UNION ALL` only when the results cannot contain duplicates; otherwise use `UNION`, which removes duplicates at extra cost.

Example:

```sql
-- Assume sname and address are indexed, but each matches over 30% of rows.
SELECT * FROM students WHERE sname = 'Student 1' OR address = 'Shanghai'; -- May choose a full table scan

-- Consider rewriting as:
SELECT * FROM students WHERE sname = 'Student 1'
UNION ALL
SELECT * FROM students WHERE address = 'Shanghai'; -- Each query can use its index.
```

**Verification**: `EXPLAIN` showing `type: index_merge` and `Extra: Using union; Using where` indicates Index Merge.

### Misuse of `IN` and `NOT IN`

**Length of an `IN` list**:

- `eq_range_index_dive_limit` (default **200**) affects **row estimates**, not index eligibility directly:
  - **<= 200**: MySQL uses an **index dive** to estimate row counts from the index.
  - **> 200**: When the list exceeds the limit (200 by default in MySQL 5.7.4+), the optimizer estimates from `index_statistics`. Stale cardinality statistics may skew cost estimates, leading it to choose a full scan instead of a range scan.
- Consider increasing `eq_range_index_dive_limit` or using a temporary table and `JOIN`.

**`NOT IN`:**

- **Constant list** (such as `NOT IN (1,2,3)`): May require scanning all rows to identify values outside the list.
- **Subquery on an indexed column**: `WHERE id NOT IN (SELECT user_id FROM orders WHERE user_id > 1000)` can use the `orders.user_id` index.
- **Alternatives**: Consider `NOT EXISTS` or `LEFT JOIN ... IS NULL` for clearer semantics and potentially better performance.

Examples:

```sql
SELECT * FROM students WHERE s_code IN (1, 2, 3, ..., 500); -- A long list may trigger estimates based on statistics
SELECT * FROM students WHERE s_code NOT IN (1, 2, 3);     -- Constant list; may scan the table
```

### Implicit type conversion

This is an easy issue to miss: **the direction of conversion determines whether the index can be used**.

| Scenario                          | Example             | Conversion                        | Index usable? |
| --------------------------------- | ------------------- | --------------------------------- | ------------- |
| **String column + numeric value** | `varchar_col = 123` | String column converted to number | ❌ No         |
| **Numeric column + string value** | `int_col = '123'`   | Constant converted to number      | ✅ Yes        |

**Key points:**

- Index use is affected when **conversion applies to the indexed column**.
- When comparing strings and numbers, MySQL converts the string to **`DOUBLE`** (see [rule 7 in the MySQL documentation](https://dev.mysql.com/doc/refman/8.0/en/type-conversion.html)). Converting an indexed column prevents the B+Tree from locating values by their original order and may require a full scan.
- `int_col = '123'` converts the constant, effectively comparing `int_col` with `CAST('123' AS DOUBLE)`, so the indexed column is unchanged.

**More details**: [How Implicit Conversion Can Disable MySQL Indexes](https://javaguide.cn/database/mysql/index-invalidation-caused-by-implicit-conversion.html)

### `ORDER BY` and sorting pitfalls

Even a selective `WHERE` condition can result in a slow query if `ORDER BY` cannot use an index.

**Common causes of `Using filesort`:**

- The sort columns are not indexed.
- Index column order does not match `ORDER BY` (for example, index `(a,b)` with `ORDER BY b,a`).
- `WHERE` and `ORDER BY` use different indexes.
- Sorting requires non-indexed columns returned by `SELECT *`.

**Optimization:**

- Use a **covering index** for both `WHERE` and `ORDER BY`. For example, index `(name, age)` can support `SELECT name, age FROM users WHERE name = 'A' ORDER BY age`.
- Order index columns to match `ORDER BY` where appropriate.

**Verification**: `Using filesort` in the `Extra` column of `EXPLAIN` indicates a separate sort operation.

### Summary

The cases above fall into two broad categories:

**1. Query conditions conflict with the index structure**

These are common cases where query conditions prevent the B+Tree from locating rows efficiently.

- **Leftmost-prefix violations**: Skipping a leading index column or using a range condition can prevent later columns from narrowing the lookup.
- **Transforming indexed columns**: Calculations or functions in `WHERE` change the values being compared and can prevent index lookup.
- **Implicit type conversion**: Comparing a string column with a numeric value can convert the indexed column and disrupt index lookup.
- **Leading wildcard in `LIKE`**: A pattern such as `LIKE "%abc"` does not provide a known range start.
- **`ORDER BY` pitfalls**: A missing or mismatched index can require an extra in-memory or on-disk sort (`Using filesort`).

**2. Cost-based optimizer decisions**

In these cases, an index is available, but the optimizer estimates that another plan will cost less. **A full table scan or row lookup can be the correct cost-based choice, not necessarily a performance problem.**

- **Row lookups are normal**: If a query needs columns outside an index, MySQL must fetch the rows. This is standard behavior. Investigate only when many rows are fetched and a full scan may be cheaper.
- **A full scan may be optimal**: When an index matches many rows, sequential I/O can be cheaper than random lookups. This is not necessarily index failure; the optimizer may have selected the better plan.
- **Use `SELECT *` pragmatically**: Prefer the required columns and a covering index when possible. If many non-indexed columns are needed, readability may matter more than saving a few fields.
- **`OR` conditions**: If either side lacks an index, MySQL may scan the table. Even with indexes on both sides, the optimizer may reject Index Merge if its estimated cost is too high.
- **Long `IN` lists**: Lists above the default threshold of 200 can switch estimates from index dives to statistics. Stale statistics may lead to poor cost estimates.

**Practical guidance:**

1. **Use `EXPLAIN`**: Inspect `type`, `key`, `rows`, and `Extra` for complex queries. **Note:** `type: ALL` is not always a problem; it may be the optimizer's correct choice.
2. **Choose a query strategy for the workload**:
   - Prefer a covering index when it contains all required columns.
   - If several non-indexed columns are needed, avoid splitting one query into multiple round trips just to select fewer columns.
3. **Use consistent data types**: Match predicate values to column types to avoid implicit conversion.
4. **Design composite indexes carefully**: Order columns based on query frequency and selectivity.
5. **Use a search engine for large-scale fuzzy searches**: Consider Elasticsearch for patterns such as `%keyword%`.

Index optimization is a core database skill, but decisions should reflect the workload and data distribution. Understanding why MySQL skips an index makes performance issues easier to diagnose.

**Further reading:**

- [MySQL Indexes](https://javaguide.cn/database/mysql/mysql-index.html)
- [MySQL Execution Plans](https://javaguide.cn/database/mysql/mysql-query-execution-plan.html)
- [How Implicit Conversion Can Disable MySQL Indexes](https://javaguide.cn/database/mysql/index-invalidation-caused-by-implicit-conversion.html)
