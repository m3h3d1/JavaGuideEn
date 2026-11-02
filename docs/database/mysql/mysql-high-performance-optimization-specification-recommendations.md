---
title: MySQL Performance Optimization Guidelines
description: Guidelines for MySQL naming, schema design, columns, indexes, SQL, and database operations to help build efficient and reliable systems.
category: Database
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MySQL optimization, database design, index design, SQL guidelines, slow query optimization, column types, schema design
---

> Author: Tingfeng. Original article: <https://www.cnblogs.com/huchong/p/10219318.html>.
>
> JavaGuide has the author's permission to publish this article and has expanded the original content.

## Database Naming

- Use lowercase letters and underscores in database object names.
- Avoid MySQL reserved keywords. If a table name contains a keyword, quote it with backticks in queries.
- Choose descriptive names, preferably no longer than 32 characters.
- Prefix temporary tables with `tmp_` and suffix them with a date. Prefix backup tables with `bak_` and suffix them with a date or timestamp.
- Use the same column names and types for the same data, especially for join columns. Type mismatches can trigger implicit conversion, prevent index use, and slow queries.

## Database Design

### Use InnoDB for all tables

Unless a table requires a feature InnoDB does not support, such as column storage or spatial data storage, use InnoDB. MySQL used MyISAM by default before 5.5 and InnoDB by default from 5.6 onward.

InnoDB supports transactions and row-level locks, offers better recovery, and performs better under high concurrency.

### Use a consistent character set

Using a consistent character set improves compatibility and avoids garbled text from conversions. Comparisons between different character sets may require conversion and prevent index use. Use `utf8mb4` if the database must store emoji.

See [MySQL Character Sets](../character-set.md) for details.

### Add comments to tables and columns

Use `COMMENT` clauses to document tables and columns, and maintain the data dictionary from the start.

### Keep table sizes manageable

Five million rows is not a MySQL limit. Larger tables can make schema changes, backups, and restores difficult.

Control table size with archival for historical log data, or sharding for business data.

### Use partitioned tables carefully

Partitioned tables appear as multiple files physically and as one table logically.

Choose partition keys carefully; queries across partitions may be slower.

Consider separate physical tables to manage large datasets.

### Keep frequently used columns together

This can reduce joins.

### Do not add placeholder columns

- Placeholder names are rarely descriptive.
- The future data type is unknown, so the column type cannot be chosen correctly.
- Changing a placeholder column later may lock the table.

### Do not store large files, such as images, in the database

Storing files in the database can hurt performance and consume excessive storage.

Store large binary files on a file server and keep their locations in the database.

### Apply normalization pragmatically

Relational databases are generally designed to satisfy third normal form. This may split data across tables and require joins. To improve query performance, some normalization requirements can be relaxed by storing limited redundant data, a practice called denormalization. Use it carefully.

### Do not run database load tests in production

### Do not connect to production databases from development or test environments

This creates serious security risks. Treat production environments with care.

## Column Design

### Choose the smallest suitable data type

Smaller values use less storage and can improve performance.

**a. Some strings can be stored as numbers; for example, IP addresses can be converted to integers.**

Numeric values are compact and can be processed efficiently.

MySQL provides two functions for IP addresses:

- `INET_ATON()`: Converts an IP address to an integer.
- `INET_NTOA()`: Converts an integer to an IP address.

Before inserting, use `INET_ATON()` to convert the address to an integer. Use `INET_NTOA()` to convert it back when displaying the value.

**b. Prefer unsigned integers for nonnegative values such as auto-increment IDs, integer IP addresses, and ages.**

Unsigned integers provide a larger nonnegative range than signed integers of the same size:

```sql
SIGNED INT -2147483648~2147483647
UNSIGNED INT 0~4294967295
```

**c. Use `TINYINT` for small values such as age or Boolean-like states (0/1).**

### Avoid `TEXT` and `BLOB` where possible

**a. Consider moving `BLOB` and `TEXT` columns to a separate table.**

MySQL in-memory temporary tables do not support large types such as `TEXT` and `BLOB`. Queries involving these columns may require on-disk temporary tables for operations such as sorting. MySQL may also need an extra lookup, which can reduce query performance. These types are not always inappropriate, however.

If needed, consider moving these columns to a separate table. Avoid `SELECT *`; select only required columns and omit the `TEXT` column when it is not needed.

**b. `TEXT` and `BLOB` columns require prefix indexes.**

MySQL limits index key length, so `TEXT` columns can only use prefix indexes and cannot have default values.

### Avoid `ENUM`

- Changing `ENUM` values requires an `ALTER` statement.
- `ORDER BY` on an `ENUM` column may require extra work.
- `ENUM` has limitations; for example, avoid using numeric values as its members.

Further reading: [Should you use MySQL's ENUM type?](https://www.zhihu.com/question/404422255/answer/1661698499)

### Prefer `NOT NULL` columns

Use `NOT NULL` unless there is a specific reason to allow `NULL`.

- Indexes on nullable columns require extra storage.
- Comparisons and calculations need special handling for `NULL` values.

Further reading: [Choosing MySQL defaults: empty values or NULL](https://opensource.actionsky.com/20190710-mysql/)

### Do not store dates as strings

Use `DATETIME`, `TIMESTAMP`, or a numeric timestamp instead of strings for dates.

Each option has tradeoffs. Choose the type that fits the use case:

| Type              | Storage   | Format                         | Range                                                        | Includes time zone |
| ----------------- | --------- | ------------------------------ | ------------------------------------------------------------ | ------------------ |
| DATETIME          | 5–8 bytes | YYYY-MM-DD hh:mm:ss[.fraction] | 1000-01-01 00:00:00[.000000] to 9999-12-31 23:59:59[.999999] | No                 |
| TIMESTAMP         | 4–7 bytes | YYYY-MM-DD hh:mm:ss[.fraction] | 1970-01-01 00:00:01[.000000] to 2038-01-19 03:14:07[.999999] | Yes                |
| Numeric timestamp | 4 bytes   | Numeric, e.g. 1578707612       | After 1970-01-01 00:00:01                                    | No                 |

See [Recommendations for storing time data in MySQL](https://javaguide.cn/database/mysql/some-thoughts-on-database-storage-time.html) for details.

### Use `DECIMAL` for financial amounts

- **Approximate numeric types**: `FLOAT`, `DOUBLE`
- **Exact numeric type**: `DECIMAL`

`DECIMAL` stores exact values without precision loss during calculations. Storage depends on the declared precision; every 9 digits require 4 bytes, with additional space for the decimal point. `DECIMAL` can also store integers larger than `BIGINT` supports.

Because `DECIMAL` uses more storage and computation, use it when exact arithmetic is required.

### Avoid excessive columns in a table

If a table has too many columns, consider splitting it into multiple tables and joining them as needed.

## Index Design

### Limit the number of indexes per table

More indexes are not always better. Indexes can improve or reduce performance.

Indexes can speed up queries but slow down inserts and updates. In some cases, they can even reduce query performance.

When optimizing a query, MySQL's optimizer evaluates applicable indexes using available statistics to choose an execution plan. Too many candidate indexes can increase planning time and reduce query performance.

### Avoid full-text indexes for OLTP workloads

Full-text indexes are not suitable for OLTP workloads.

### Do not create a separate index for every column

Before MySQL 5.6, a query could use only one index per table. Later versions introduced Index Merge, but a suitable composite index is often more effective.

### Define a primary key for every InnoDB table

InnoDB is an index-organized table: rows are stored in the order of the clustered index. A table can have multiple indexes, but only one clustered order.

InnoDB organizes the table by primary key when one is defined.

- Avoid frequently updated columns and composite primary keys.
- Avoid UUIDs, hashes, and string columns when sequential growth is required.
- Prefer an auto-incrementing ID for the primary key.

### Columns to consider indexing

- Columns in `WHERE` clauses of `SELECT`, `UPDATE`, and `DELETE` statements.
- Columns used in `ORDER BY`, `GROUP BY`, or `DISTINCT`.
- Rather than indexing each such column separately, consider a composite index for the query patterns.
- Join columns.

### Choose the order of columns in an index

Indexes help locate rows, reduce random I/O, and improve query performance. The more rows an index filters out, the less data must be read from disk.

- **Put the most selective column first**: This is a key guideline. Higher selectivity means fewer rows match and less I/O. Estimate selectivity with `count(distinct column) / count(*)`.
- **Put the most frequently queried column first**: This follows the leftmost-prefix rule and can maximize use of the composite index.
- **Consider column length**: Length has little effect on non-leaf nodes of a composite index, which store all indexed values. It mainly affects storage for the primary key, columns included in other indexes, and leaf nodes. Give length lower priority when ordering composite index columns, but prefer shorter primary keys and indexed columns to save space and I/O.

### Avoid redundant and duplicate indexes

- Duplicate indexes: `PRIMARY KEY(id)`, `INDEX(id)`, and `UNIQUE INDEX(id)`.
- Redundant indexes: `INDEX(a,b,c)`, `INDEX(a,b)`, and `INDEX(a)`.

### Prefer covering indexes for frequent queries

> A covering index contains all columns needed by a query, including those in `WHERE`, `SELECT`, `ORDER BY`, and `GROUP BY`.

**Benefits of covering indexes:**

- **Avoids a second lookup in InnoDB**: Secondary index leaf nodes contain primary key values. A query using a secondary index normally performs another lookup by primary key to retrieve other columns. A covering index contains all required data, avoiding this lookup and reducing I/O.
- **Can reduce random I/O**: Covering indexes store values in key order. For I/O-intensive range scans, reading the index sequentially can require less I/O than fetching each row randomly from disk.

---

### Foreign key guidelines

**Avoid foreign key constraints where possible.**

- Avoid foreign key constraints where possible, but index columns used to relate tables.
- Foreign keys enforce referential integrity, but this can also be handled in the application.
- Foreign keys can affect writes to parent and child tables and reduce performance.

## SQL Development

### Move complex calculations to the application

Avoid unnecessary calculations in the database and move complex work to the application. This reduces database load and protects performance and stability. A database primarily stores and manages data.

### Optimize high-impact SQL statements

Prioritize the most frequently executed statements or those with the greatest potential improvement. Use the MySQL slow query log to identify candidates.

### Use existing indexes effectively

Avoid patterns with a leading wildcard, such as `a LIKE '%123%'`. A trailing wildcard alone, such as `a LIKE '123%'`, can use an index.

For a range condition on a composite index, later columns may not be used for index lookup. For example, with an index on `(a,b,c)`, a range condition on `a` prevents `b` and `c` from narrowing the lookup.

When designing a composite index, put columns used for range lookup toward the right where possible. Rewrite `NOT IN` with `LEFT JOIN` or `NOT EXISTS` where appropriate, since `NOT IN` may prevent index use.

### Prefer explicit column lists over `SELECT *`

- `SELECT *` can use more CPU.
- Unneeded columns increase network usage and transfer time, especially large columns such as `VARCHAR`, `BLOB`, and `TEXT`.
- Selecting all columns can prevent a covering-index optimization.
- Explicit column lists reduce the impact of schema changes.

### Include column lists in `INSERT` statements

**Avoid:**

```sql
insert into t values ('a','b','c');
```

**Prefer:**

```sql
insert into t(c1,c2,c3) values ('a','b','c');
```

### Use prepared statements

- Prepared statements can reuse execution plans, reduce SQL compilation time, and help prevent SQL injection in dynamic SQL.
- Sending parameters is more efficient than resending the full SQL statement.
- The same statement can be parsed once and executed many times.

### Avoid implicit type conversion

Implicit conversion can prevent index use. For example:

```sql
select name,phone from customer where id = '111';
```

See [How Implicit Conversion Can Disable MySQL Indexes](./index-invalidation-caused-by-implicit-conversion.md) for details.

### Consider rewriting subqueries as joins

Rewriting a subquery as a join may help when it appears in an `IN` clause and contains simple SQL without `UNION`, `GROUP BY`, `ORDER BY`, or `LIMIT`.

**Why some subqueries perform poorly:** Their result sets may be materialized in temporary tables without indexes, whether in memory or on disk. Large result sets can consume CPU and I/O and slow queries. The actual plan depends on the query and MySQL version.

### Avoid joins across too many tables

MySQL uses join buffers whose size is configured by `join_buffer_size`.

Each additional join in a query may require another join buffer, so queries joining many tables can use more memory.

Frequent multi-table joins combined with an improperly configured `join_buffer_size` can create memory pressure and affect database stability.

Joins may also require temporary tables. MySQL allows up to 61 tables in a join; this guideline recommends staying below five.

### Reduce database round trips

Databases handle batch operations efficiently. Combine similar operations where practical.

### Use `IN` for multiple comparisons on the same column

Keep `IN` lists below 500 values. `IN` may use indexes more effectively than multiple `OR` conditions.

### Avoid `ORDER BY RAND()`

`ORDER BY RAND()` loads matching rows into memory, generates random values, and sorts the rows. Large result sets can consume substantial CPU, I/O, and memory.

Instead, generate a random value in the application and use it to retrieve rows from the database.

### Do not apply functions or calculations to columns in `WHERE`

Applying a function or calculation to a column can prevent index use.

**Avoid:**

```sql
where date(create_time)='20190101'
```

**Prefer:**

```sql
where create_time >= '20190101' and create_time < '20190102'
```

### Use `UNION ALL` when duplicates are not possible

- `UNION` combines both result sets in a temporary table and removes duplicates.
- `UNION ALL` does not remove duplicates.

### Split complex SQL into smaller statements

- Large statements may have complex logic and require substantial CPU time.
- A single SQL statement may use only one CPU for computation.
- Splitting work can allow parallel execution and improve throughput.

### Use separate accounts for separate databases

- Makes future migrations and sharding easier.
- Reduces coupling between services.
- Limits security risks from excessive privileges.

## Operational Guidelines

### Batch writes affecting over one million rows

**Large operations can cause substantial replication lag.**

Large writes can take a long time. In a primary-replica setup, replicas apply them after the primary completes the operation, which can cause significant lag.

**Row-based binlogs can grow substantially.**

Large writes generate many log events. Row-based binlogs record each changed row, so larger changes increase log volume and replication or recovery time.

**Avoid large transactions.**

Updating many rows in one transaction can hold many locks and block other operations, harming MySQL performance.

Long blocking periods can consume all available database connections and prevent production applications from connecting. Process large writes in batches.

### Consider `pt-online-schema-change` for large tables

- Can reduce replication lag caused by altering large tables.
- Can avoid locking the table while changing columns.

Schema changes on large tables require care because they can cause significant locking, especially in production.

`pt-online-schema-change` creates a table with the same schema, applies the changes to it, and copies the original rows. It adds triggers to copy new changes into the new table. After copying completes, it swaps the table names and drops the original, dividing one DDL operation into smaller batches.

### Do not grant `SUPER` to application accounts

- A user with `SUPER` can still connect when the maximum connection limit is reached.
- Reserve `SUPER` for DBA accounts used to resolve incidents.

### Apply least privilege to application accounts

- Limit each application account to one database; do not grant cross-database access.
- Application accounts should generally not have `DROP` privilege.

## Further Reading

- [MySQL design guidelines every engineer should know](https://mp.weixin.qq.com/s/XC8e5iuQtfsrEOERffEZ-Q)
- [15 tips for designing database tables](https://mp.weixin.qq.com/s/NM-aHaW6TXrnO6la6Jfl5A)

<!-- @include: @article-footer.snippet.md -->
