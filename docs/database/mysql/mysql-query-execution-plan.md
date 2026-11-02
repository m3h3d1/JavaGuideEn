---
title: MySQL Execution Plan Analysis
description: Learn how to read MySQL EXPLAIN output, including key fields such as id, select_type, type, key, rows, and Extra, to identify and optimize SQL performance bottlenecks.
category: Database
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MySQL execution plan, EXPLAIN, query optimizer, SQL performance analysis, index usage, access type, Extra field, slow query optimization
---

The first step in SQL optimization is understanding the query's execution plan. This article explains MySQL `EXPLAIN` output.

> **Version notes**: This article covers MySQL 5.7 and later and MySQL 8.0 and later. The `filtered` and `partitions` columns are available in MySQL 5.7 and later. `EXPLAIN ANALYZE` and hash joins require MySQL 8.0.18 and 8.0.20, respectively.

## What Is an Execution Plan?

An **execution plan** describes how a SQL statement runs after being optimized by the **MySQL query optimizer**.

Execution plans are used to analyze and optimize SQL performance. `EXPLAIN` shows the table access order, access methods, indexes that could be used, the index actually selected, and the estimated number of rows read from each table.

## How to Get an Execution Plan

MySQL provides the `EXPLAIN` command to display execution plan information.

Standard `EXPLAIN` does not execute the statement. It uses the query optimizer to analyze it, choose a plan, and display information about that plan.

MySQL 8.0.18 introduced `EXPLAIN ANALYZE`. It **executes** the query and reports the actual time and row count for each step. This is more reliable than standard `EXPLAIN` estimates and is useful for investigating slow queries in a test environment:

```sql
mysql> EXPLAIN ANALYZE SELECT * FROM users WHERE age = 25\G
*************************** 1. row ***************************
EXPLAIN: -> Covering index lookup on users using idx_age_score_name (age=25)
(cost=1.52 rows=12) (actual time=0.0272..0.0344 rows=12 loops=1)
```

`EXPLAIN FORMAT=JSON` also outputs the optimizer's cost model data (`query_cost`). Its output can make the cost of each step clearer than the tabular format, especially when tuning multi-table joins or subqueries:

```sql
mysql> EXPLAIN FORMAT=JSON SELECT * FROM users WHERE age = 25\G
*************************** 1. row ***************************
EXPLAIN: {
  "query_block": {
    "select_id": 1,
    "cost_info": {
      "query_cost": "1.52"
    },
    "table": {
      "table_name": "users",
      "access_type": "ref",
      "key": "idx_age_score_name",
      "rows_examined_per_scan": 12,
      "filtered": "100.00",
      "using_index": true
    }
  }
}
```

`EXPLAIN` supports `SELECT`, `DELETE`, `INSERT`, `REPLACE`, and `UPDATE` statements. It is most commonly used to analyze `SELECT` queries. Its syntax is simple:

```sql
EXPLAIN SELECT query;
```

Here is an example execution plan.

**Example 1: Single-table query using an index**

```sql
-- Table: users(id, age, score, name, address); composite index idx_age_score_name(age, score, name)
mysql> EXPLAIN SELECT * FROM users WHERE age = 25;
+----+-------------+-------+------------+------+---------------------+---------------------+---------+-------+------+----------+-------------+
| id | select_type | table | partitions | type | possible_keys       | key                 | key_len | ref   | rows | filtered | Extra       |
+----+-------------+-------+------------+------+---------------------+---------------------+---------+-------+------+----------+-------------+
|  1 | SIMPLE      | users | NULL       | ref  | idx_age_score_name  | idx_age_score_name  | 5       | const |   12 |   100.00 | Using index |
+----+-------------+-------+------------+------+---------------------+---------------------+---------+-------+------+----------+-------------+
```

**Example 2: UNION query (where id is NULL)**

```sql
mysql> EXPLAIN SELECT * FROM users WHERE id = 1 UNION SELECT * FROM users WHERE id = 2;
+----+--------------+------------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
| id | select_type  | table      | partitions | type  | possible_keys | key     | key_len | ref   | rows | filtered | Extra |
+----+--------------+------------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
|  1 | PRIMARY      | users      | NULL       | const | PRIMARY       | PRIMARY | 4       | const |    1 |   100.00 | NULL  |
|  2 | UNION        | users      | NULL       | const | PRIMARY       | PRIMARY | 4       | const |    1 |   100.00 | NULL  |
|  3 | UNION RESULT | <union1,2> | NULL       | ALL   | NULL          | NULL    | NULL    | NULL  | NULL |     NULL | Using temporary |
+----+--------------+------------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
```

The execution plan has 12 columns, summarized below:

| **Column**    | **Meaning**                                                       |
| ------------- | ----------------------------------------------------------------- |
| id            | Identifier for the `SELECT` query sequence                        |
| select_type   | Type of `SELECT` query                                            |
| table         | Table used                                                        |
| partitions    | Matching partitions; `NULL` for unpartitioned tables              |
| type          | Table access method                                               |
| possible_keys | Indexes that might be used                                        |
| key           | Index actually used                                               |
| key_len       | Length of the selected index                                      |
| ref           | Column or constant compared with the index for an equality lookup |
| rows          | Estimated number of rows to read                                  |
| filtered      | Estimated percentage of rows remaining after filtering            |
| Extra         | Additional information                                            |

## How to Read EXPLAIN Output

To analyze `EXPLAIN` output, understand the key fields in the execution plan.

### id

The `SELECT` identifier indicates the execution order of each `SELECT` statement.

Interpret the `id` column as follows:

- **Same `id`**: Rows are generally executed from top to bottom, often in multi-table joins.
- **Different `id` values**: A larger value has higher execution priority; subqueries run before the outer query.
- **`id` is `NULL`**: The row represents a `UNION RESULT` or `DERIVED` result and is not executed as a separate query.

**Example:**

```sql
mysql> EXPLAIN SELECT * FROM users WHERE id = 1
    -> UNION
    -> SELECT * FROM users WHERE id = 2\G
*************************** 1. row ***************************
           id: 1
  select_type: PRIMARY
        table: users
         type: const
*************************** 2. row ***************************
           id: 2
  select_type: UNION
        table: users
         type: const
*************************** 3. row ***************************
           id: NULL
  select_type: UNION RESULT
        table: <union1,2>
         type: ALL
        Extra: Using temporary
```

In the third row, `id = NULL` and `table = <union1,2>` indicate that it combines the results of the first two queries.

### select_type

The query type distinguishes simple queries, unions, subqueries, and other query forms. Common values include:

- **SIMPLE**: A simple query without a `UNION` or subquery.
- **PRIMARY**: The outer `SELECT` when a query contains subqueries or other components.
- **SUBQUERY**: The first `SELECT` in a subquery.
- **UNION**: A `SELECT` that appears after `UNION`.
- **DERIVED**: A subquery in the `FROM` clause.
- **UNION RESULT**: The result of a `UNION` query.

### table

The table used by the query. Each row has a corresponding table name, which may also be one of these values:

- **`<unionM,N>`**: This row references the `UNION` result from rows with IDs M and N.
- **`<derivedN>`**: This row references a derived table produced by the table with ID N. A derived table may come from a subquery in the `FROM` clause.
- **`<subqueryN>`**: This row references a materialized subquery result produced by the table with ID N.

### type (Important)

The access type describes how the query is executed. **The following order runs from best to worst:**

`system > const > eq_ref > ref > fulltext > ref_or_null > index_merge > unique_subquery > index_subquery > range > index > ALL`

**Rules of thumb:**

- **Good**: Aim for at least `system`, `const`, `eq_ref`, `ref`, or `range`.
- **Needs attention**: `index_merge` and `index` (a full index scan can still be costly on large tables).
- **Needs optimization**: `ALL` (a full table scan).

**Note**: This order reflects **single-table access efficiency**, not overall query performance. For example, `type=ref` with many table lookups may be slower than `type=index` with a covering index.

Common access types mean:

- **system**: The table has zero or one row, and the storage engine can determine the row count exactly. This applies to engines such as MyISAM and Memory. InnoDB optimizes a one-row table to `const`. `system` is a special case of `const`.
- **const**: At most one row matches, so it can be found with a single lookup. This commonly occurs when all columns of a primary or unique index are used as conditions.
- **eq_ref**: In a join, each row from the preceding table matches exactly one row in the current table. Apart from `system` and `const`, this is the best join access type. It commonly uses all columns of a primary key or unique, non-`NULL` index.
- **ref**: A regular index is used, and multiple rows may match. Unlike `eq_ref`, one row from the driving table may match multiple rows from the driven table.
- **index_merge**: MySQL merges scans from multiple indexes when the `WHERE` clause has multiple range conditions that can use different indexes. The `key` column lists the indexes, and `Extra` shows the merge algorithm:

  - `Using union(...)`: Unions results from multiple indexes (an `OR` condition).
  - `Using sort_union(...)`: Sorts index results before unioning them (an `OR` condition with unordered index columns).
  - `Using intersection(...)`: Intersects results from multiple indexes (an `AND` condition).

  **Example:**

  ```sql
  -- An OR condition triggers an index merge union
  EXPLAIN SELECT * FROM employees WHERE emp_no = 10001 OR dept_no = 'd001';
  -- Extra: Using union(PRIMARY,dept_no_index)
  ```

- **range**: A range scan on an index column. The `key` column shows which index is used.
- **index**: A full index scan that traverses the entire index tree. Like `ALL` (a full table scan), but often with lower cost because index entries are smaller than full rows and fewer I/O pages are needed. A covering index can also avoid table lookups. A full index scan can still cause substantial I/O on very large tables, so do not ignore its cost just because `index` ranks above `ALL`.
- **ALL**: A full table scan.

### possible_keys

The `possible_keys` column lists indexes that MySQL might use. If it is `NULL`, no candidate index was found. Check the columns in the `WHERE` clause and consider whether indexing one or more of them could improve performance.

### key (Important)

The `key` column shows the index MySQL actually uses. If it is `NULL`, no index is used.

### key_len

The `key_len` column shows the maximum length of the index MySQL uses. For a composite index, it may be the combined length of multiple columns. Shorter is better when the query requirements are met. If `key` is `NULL`, `key_len` is also `NULL`.

### rows

The `rows` column **estimates** how many rows must be read to find the required records, based on table statistics and index selection. A smaller value is generally better.

This is an estimate, not an exact count. InnoDB statistics are based on random sampling of index pages:

- The number of sampled pages is controlled by `innodb_stats_persistent_sample_pages` (20 pages by default).
- After frequent data changes or bulk imports, estimates may differ from actual row counts by 10–50% or more.
- **Small-table caveat**: For a very small table (for example, fewer than 100 rows), the optimizer may choose a full table scan because its estimated cost is lower than using an index.

**To verify:**

```sql
-- Estimated rows from the execution plan
mysql> EXPLAIN SELECT * FROM users WHERE age = 25\G
rows: 12

-- Actual rows (use COUNT(*) carefully on large tables)
mysql> SELECT COUNT(*) FROM users WHERE age = 25;
+----------+
| COUNT(*) |
+----------+
|       12 |
+----------+
```

If the execution plan does not match observed performance, run `ANALYZE TABLE` to refresh the statistics, then check the plan again.

### filtered

The `filtered` column **estimates** the percentage (0–100) of rows returned by the storage engine that remain after the Server layer applies the `WHERE` condition. The formula is: `filtered = (rows after filtering / rows returned by the storage engine) × 100`.

**Interpretation:**

- When `filtered = 100`, all rows returned by the storage engine satisfy the `WHERE` condition (ideal).
- When `filtered < 100`, the Server layer filters out some rows, which may mean the index does not cover all query conditions.
- **In joins**, the optimizer estimates the rows passed to the next table (the fan-out) as `rows × (filtered / 100)`.

This field is especially important in multi-table joins: a larger fan-out means the driving table must match more rows in the driven table. A low `filtered` value indicates effective filtering. A high `rows` value combined with a low `filtered` value can signal a bottleneck; consider index condition pushdown (ICP) or a better index to reduce fan-out.

### Extra (Important)

This column contains additional information about how MySQL executes the query. Common values include:

- **Using filesort**: MySQL cannot use an index to satisfy the `ORDER BY` or `GROUP BY` sorting requirement, so it performs an additional sort after retrieving the result set. If the result fits in `sort_buffer_size`, sorting is done in memory; otherwise, temporary disk files are used. “Filesort” is a legacy name and does not necessarily mean disk I/O occurs.
- **Using temporary**: MySQL creates a temporary table to store query results, often for `ORDER BY` and `GROUP BY` operations.
- **Using index**: The query uses a covering index and does not need a table lookup.
- **Using index condition**: The optimizer uses Index Condition Pushdown.
- **Using where**: The MySQL Server layer applies additional `WHERE` filtering to rows returned by the storage engine. This can appear even when an index is used, such as `type=ref`, if the index satisfies only some query conditions.
- **Using join buffer (Block Nested Loop)**: If a join does not use an index on the driven table, MySQL first loads rows from the driving table into a join buffer, then scans the driven table for matches (O(N×M)).
- **Using join buffer (hash join)**: MySQL 8.0.18 introduced hash joins, **for equality joins only** (such as `t1.id = t2.id`). They replaced BNL by default in 8.0.20. A hash join takes O(N) to build and O(M) to probe, which is more efficient than BNL's O(N×M).

  **Exceptions** (which still fall back to BNL):

  - Non-equality joins (such as `t1.id > t2.id`).
  - The join condition contains a function or expression.
  - An index is available on the driven table (in which case Index Nested Loop is used).

If `Extra` contains `Using filesort` or `Using temporary`, query performance may suffer. Avoid these operations where possible.

## References

- <https://dev.mysql.com/doc/refman/8.0/en/explain-output.html>
- <https://dev.mysql.com/doc/refman/8.0/en/explain.html>
- <https://juejin.cn/post/6953444668973514789>

<!-- @include: @article-footer.snippet.md -->
