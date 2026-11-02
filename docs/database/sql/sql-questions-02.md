---
title: SQL Interview Questions (2)
description: The second set of SQL interview questions covers DML statements such as INSERT, UPDATE, and DELETE, including bulk inserts, importing rows from other tables, and upserts.
category: Database
tag:
  - Database Fundamentals
  - SQL
head:
  - - meta
    - name: keywords
      content: SQL interview questions, INSERT, UPDATE, DELETE, bulk insert, REPLACE INTO, data manipulation
---

> Questions are from [Nowcoder - Advanced SQL Challenges](https://www.nowcoder.com/exam/oj?page=1&tab=SQL%E7%AF%87&topicId=240).

## INSERT, UPDATE, and DELETE

Common ways to insert rows in SQL:

- **Insert all columns:** `INSERT INTO table_name VALUES (value1, value2, ...)`
- **Insert selected columns:** `INSERT INTO table_name (column1, column2, ...) VALUES (value1, value2, ...)`
- **Insert multiple rows:** `INSERT INTO table_name (column1, column2, ...) VALUES (value1_1, value1_2, ...), (value2_1, value2_2, ...), ...`
- **Import from another table:** `INSERT INTO table_name SELECT * FROM table_name2 [WHERE key=value]`
- **Insert with replacement:** `REPLACE INTO table_name VALUES (value1, value2, ...)` (If a primary key or unique index conflicts, this deletes the existing row and inserts a new one.)

### Insert Rows (1)

**Description:** Nowcoder stores each user's exam attempts in the `exam_record` table. Two users have the following records:

- User 1001 started exam 9001 at 10:11:12 PM on September 1, 2021, submitted it 50 minutes later, and scored 90.
- User 1002 started exam 9002 at 7:01:02 AM on September 4, 2021, then left the platform 10 minutes later.

The `exam_record` table already exists with the schema below. Insert both records with one statement.

| Filed       | Type       | Null | Key | Extra          | Default | Comment  |
| ----------- | ---------- | ---- | --- | -------------- | ------- | -------- |
| id          | int(11)    | NO   | PRI | auto_increment | (NULL)  | 自增 ID  |
| uid         | int(11)    | NO   |     |                | (NULL)  | 用户 ID  |
| exam_id     | int(11)    | NO   |     |                | (NULL)  | 试卷 ID  |
| start_time  | datetime   | NO   |     |                | (NULL)  | 开始时间 |
| submit_time | datetime   | YES  |     |                | (NULL)  | 提交时间 |
| score       | tinyint(4) | YES  |     |                | (NULL)  | 得分     |

**Answer:**

```sql
-- The primary key is auto-incremented, so it does not need a value.
INSERT INTO exam_record (uid, exam_id, start_time, submit_time, score) VALUES
(1001, 9001, '2021-09-01 22:11:12', '2021-09-01 23:01:12', 90),
(1002, 9002, '2021-09-04 07:01:02', NULL, NULL);
```

### Insert Rows (2)

**Description:** The `exam_record` table contains users' exam attempts from many years. As the data grows and becomes harder to maintain, reduce the table size and back up historical records.

`exam_record`:

| Filed       | Type       | Null | Key | Extra          | Default | Comment  |
| ----------- | ---------- | ---- | --- | -------------- | ------- | -------- |
| id          | int(11)    | NO   | PRI | auto_increment | (NULL)  | 自增 ID  |
| uid         | int(11)    | NO   |     |                | (NULL)  | 用户 ID  |
| exam_id     | int(11)    | NO   |     |                | (NULL)  | 试卷 ID  |
| start_time  | datetime   | NO   |     |                | (NULL)  | 开始时间 |
| submit_time | datetime   | YES  |     |                | (NULL)  | 提交时间 |
| score       | tinyint(4) | YES  |     |                | (NULL)  | 得分     |

The `exam_record_before_2021` table has been created to back up completed exam attempts from before 2021. It has the same schema as `exam_record`. Import the completed attempts from before 2021 into it.

**Answer:**

```sql
INSERT INTO exam_record_before_2021 (uid, exam_id, start_time, submit_time, score)
SELECT uid,exam_id,start_time,submit_time,score
FROM exam_record
WHERE YEAR(submit_time) < 2021;
```

### Insert Rows (3)

**Description:** A difficult SQL exam with ID 9003 lasts 90 minutes. Insert it into `examination_info` with a release time of `2021-01-01 00:00:00`. The insert must succeed whether or not an exam with this ID already exists.

`examination_info`:

| Filed        | Type        | Null | Key | Extra          | Default | Comment      |
| ------------ | ----------- | ---- | --- | -------------- | ------- | ------------ |
| id           | int(11)     | NO   | PRI | auto_increment | (NULL)  | 自增 ID      |
| exam_id      | int(11)     | NO   | UNI |                | (NULL)  | 试卷 ID      |
| tag          | varchar(32) | YES  |     |                | (NULL)  | 类别标签     |
| difficulty   | varchar(8)  | YES  |     |                | (NULL)  | 难度         |
| duration     | int(11)     | NO   |     |                | (NULL)  | 时长(分钟数) |
| release_time | datetime    | YES  |     |                | (NULL)  | 发布时间     |

**Answer:**

```sql
REPLACE INTO examination_info VALUES
 (NULL, 9003, "SQL", "hard", 90, "2021-01-01 00:00:00");
```

### Update Rows (1)

**Description:** The `examination_info` table has the following schema:

| Filed        | Type     | Null | Key | Extra          | Default | Comment  |
| ------------ | -------- | ---- | --- | -------------- | ------- | -------- |
| id           | int(11)  | NO   | PRI | auto_increment | (NULL)  | 自增 ID  |
| exam_id      | int(11)  | NO   | UNI |                | (NULL)  | 试卷 ID  |
| tag          | char(32) | YES  |     |                | (NULL)  | 类别标签 |
| difficulty   | char(8)  | YES  |     |                | (NULL)  | 难度     |
| duration     | int(11)  | NO   |     |                | (NULL)  | 时长     |
| release_time | datetime | YES  |     |                | (NULL)  | 发布时间 |

Change every `tag` value of `PYTHON` to `Python` in `examination_info`.

**Approach:** There are two ways to solve this. The most direct is to update rows with `UPDATE` and `WHERE`. Another option is to use `REPLACE` on the column being changed.

**Answer 1:**

```sql
UPDATE examination_info SET tag = 'Python' WHERE tag='PYTHON'
```

**Answer 2:**

```sql
UPDATE examination_info
SET tag = REPLACE(tag,'PYTHON','Python')

# REPLACE (target_column, "search_value", "replacement_value")
```

### Update Rows (2)

**Description:** The `exam_record` table contains users' exam attempts from many years. Its schema is shown below. In this table, **`submit_time`** is the completion time.

| Filed       | Type       | Null | Key | Extra          | Default | Comment  |
| ----------- | ---------- | ---- | --- | -------------- | ------- | -------- |
| id          | int(11)    | NO   | PRI | auto_increment | (NULL)  | 自增 ID  |
| uid         | int(11)    | NO   |     |                | (NULL)  | 用户 ID  |
| exam_id     | int(11)    | NO   |     |                | (NULL)  | 试卷 ID  |
| start_time  | datetime   | NO   |     |                | (NULL)  | 开始时间 |
| submit_time | datetime   | YES  |     |                | (NULL)  | 提交时间 |
| score       | tinyint(4) | YES  |     |                | (NULL)  | 得分     |

**Task:** Mark all incomplete attempts in `exam_record` that started **before** September 1, 2021 as completed. Set the completion time to `2099-01-01 00:00:00` and the score to 0.

**Approach:** The key condition is that the attempt started before a given time. Compare timestamps directly, such as `xxx_time < '2021-09-01 00:00:00'`, or use the `DATE()` function. The second condition is that the attempt is incomplete, meaning its completion time is `NULL`; here, `submit_time` is `NULL`.

**Answer:**

```sql
UPDATE exam_record SET submit_time = '2099-01-01 00:00:00', score = 0 WHERE DATE(start_time) < "2021-09-01" AND submit_time IS null
```

### Delete Rows (1)

**Description:** The `exam_record` table contains users' exam attempts from many years. Its schema is shown below.

In `exam_record`, **`start_time`** is when the attempt began, and **`submit_time`** is when it was submitted, or completed.

| Filed       | Type       | Null | Key | Extra          | Default | Comment  |
| ----------- | ---------- | ---- | --- | -------------- | ------- | -------- |
| id          | int(11)    | NO   | PRI | auto_increment | (NULL)  | 自增 ID  |
| uid         | int(11)    | NO   |     |                | (NULL)  | 用户 ID  |
| exam_id     | int(11)    | NO   |     |                | (NULL)  | 试卷 ID  |
| start_time  | datetime   | NO   |     |                | (NULL)  | 开始时间 |
| submit_time | datetime   | YES  |     |                | (NULL)  | 提交时间 |
| score       | tinyint(4) | YES  |     |                | (NULL)  | 得分     |

**Task:** Delete rows from `exam_record` for attempts lasting less than five minutes with a failing score (below 60).

**Approach:** Although this is a deletion exercise, it tests date and time functions. Common functions for comparing elapsed minutes are **`TIMEDIFF`** and **`TIMESTAMPDIFF`**. They differ slightly; `TIMESTAMPDIFF` is more flexible. Choose the one you prefer.

1. `TIMEDIFF`: the difference between two times.

```sql
TIMEDIFF(time1, time2)
```

Both arguments are required and must be time or datetime expressions. If either argument is invalid or `NULL`, the function returns `NULL`.

For this problem, pass the `TIMEDIFF` result to `MINUTE`. `TIMEDIFF` returns a time difference, and `MINUTE` extracts its minute component.

2. `TIMESTAMPDIFF`: calculates the difference between two dates or times.

```sql
TIMESTAMPDIFF(unit,datetime_expr1,datetime_expr2)
-- Parameters:
-- unit: the unit returned for the difference. Common values:
SECOND: seconds
MINUTE: minutes
HOUR: hours
DAY: days
WEEK: weeks
MONTH: months
QUARTER: quarters
YEAR: years
-- TIMESTAMPDIFF returns datetime_expr2 - datetime_expr1 (the second value minus the first).
-- Both expressions can be DATE or DATETIME values, such as '2023-01-01' or '2023-01-01 00:00:00'.
```

For this problem, compare minutes with `TIMESTAMPDIFF(MINUTE, start_time, submit_time) < 5`.

**Answer:**

```sql
DELETE FROM exam_record WHERE MINUTE (TIMEDIFF(submit_time , start_time)) < 5 AND score < 60
```

```sql
DELETE FROM exam_record WHERE TIMESTAMPDIFF(MINUTE, start_time, submit_time) < 5 AND score < 60
```

### Delete Rows (2)

**Description:** The `exam_record` table contains users' exam attempts from many years. Its schema is shown below.

In `exam_record`, `start_time` is when the attempt began, and `submit_time` is when it was submitted, or completed. It is `NULL` if the attempt is incomplete.

| Filed       | Type       | Null | Key | Extra          | Default | Comment  |
| ----------- | ---------- | :--: | --- | -------------- | ------- | -------- |
| id          | int(11)    |  NO  | PRI | auto_increment | (NULL)  | 自增 ID  |
| uid         | int(11)    |  NO  |     |                | (NULL)  | 用户 ID  |
| exam_id     | int(11)    |  NO  |     |                | (NULL)  | 试卷 ID  |
| start_time  | datetime   |  NO  |     |                | (NULL)  | 开始时间 |
| submit_time | datetime   | YES  |     |                | (NULL)  | 提交时间 |
| score       | tinyint(4) | YES  |     |                | (NULL)  | 分数     |

**Task:** Among attempts that are incomplete **or** lasted less than five minutes, delete the three rows with the earliest start times.

**Approach:** Note that the task states the completion time is empty when an attempt is incomplete. This gives one condition.

The other condition is a duration under five minutes, as in the previous problem. Here the conditions are joined by **OR**, so either one is sufficient. The query also uses sorting and `LIMIT`.

**Answer:**

```sql
DELETE FROM exam_record WHERE submit_time IS null OR TIMESTAMPDIFF(MINUTE, start_time, submit_time) < 5
ORDER BY start_time
LIMIT 3
# Ascending order is the default; DESC sorts in descending order.
```

### Delete Rows (3)

**Description:** The `exam_record` table contains users' exam attempts from many years. Its schema is shown below.

| Filed       | Type       | Null | Key | Extra          | Default | Comment  |
| ----------- | ---------- | :--: | --- | -------------- | ------- | -------- |
| id          | int(11)    |  NO  | PRI | auto_increment | (NULL)  | 自增 ID  |
| uid         | int(11)    |  NO  |     |                | (NULL)  | 用户 ID  |
| exam_id     | int(11)    |  NO  |     |                | (NULL)  | 试卷 ID  |
| start_time  | datetime   |  NO  |     |                | (NULL)  | 开始时间 |
| submit_time | datetime   | YES  |     |                | (NULL)  | 提交时间 |
| score       | tinyint(4) | YES  |     |                | (NULL)  | 分数     |

**Task:** Delete all rows from `exam_record` **and reset the auto-incrementing primary key**.

**Approach:** This problem tests the differences among three deletion statements. Note that the task requires resetting the primary key.

- `DROP`: removes the table and its schema; this cannot be undone.
- `TRUNCATE`: removes all rows but keeps the table schema; this cannot be undone.
- `DELETE`: removes rows and can be rolled back.

Use `TRUNCATE` here because it operates on a table, removes all rows while preserving the schema, constraints, and indexes, and resets the auto-increment value. It also returns the space used by the table and its indexes to their initial size.

You can also use `DELETE`, but then you must use `ALTER` to reset the primary key's initial value.

You could also use `DROP` to remove the entire table, including its schema, and then create it again.

**Answer:**

```sql
TRUNCATE  exam_record;
```

## Tables and Indexes

### Create a Table

**Description:** A user information table contains details of users who have registered over the years. As the Nowcoder platform and its user base grow, move some users into a new table to serve highly active users efficiently.

The original user information table:

| Filed         | Type        | Null | Key | Default           | Extra          | Comment  |
| ------------- | ----------- | ---- | --- | ----------------- | -------------- | -------- |
| id            | int(11)     | NO   | PRI | (NULL)            | auto_increment | 自增 ID  |
| uid           | int(11)     | NO   | UNI | (NULL)            |                | 用户 ID  |
| nick_name     | varchar(64) | YES  |     | (NULL)            |                | 昵称     |
| achievement   | int(11)     | YES  |     | 0                 |                | 成就值   |
| level         | int(11)     | YES  |     | (NULL)            |                | 用户等级 |
| job           | varchar(32) | YES  |     | (NULL)            |                | 职业方向 |
| register_time | datetime    | YES  |     | CURRENT_TIMESTAMP |                | 注册时间 |

As a data analyst, **create a premium user information table named `user_info_vip`** with the same schema as the user information table.

The expected output is shown below. Write a `CREATE TABLE` statement that includes all constraints and comments shown in the table.

| Filed         | Type        | Null | Key | Default           | Extra          | Comment  |
| ------------- | ----------- | ---- | --- | ----------------- | -------------- | -------- |
| id            | int(11)     | NO   | PRI | (NULL)            | auto_increment | 自增 ID  |
| uid           | int(11)     | NO   | UNI | (NULL)            |                | 用户 ID  |
| nick_name     | varchar(64) | YES  |     | (NULL)            |                | 昵称     |
| achievement   | int(11)     | YES  |     | 0                 |                | 成就值   |
| level         | int(11)     | YES  |     | (NULL)            |                | 用户等级 |
| job           | varchar(32) | YES  |     | (NULL)            |                | 职业方向 |
| register_time | datetime    | YES  |     | CURRENT_TIMESTAMP |                | 注册时间 |

**Approach:** If the old table's name were given, you could use `CREATE TABLE new_table AS SELECT * FROM old_table;`. Since it is not provided, create the table yourself and specify its defaults and keys. (On Nowcoder, the comments must match the problem exactly, including capitalization, and the character set must also be set.)

Answer:

```sql
CREATE TABLE IF NOT EXISTS user_info_vip(
    id INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '自增ID',
    uid INT(11) UNIQUE NOT NULL COMMENT '用户ID',
    nick_name VARCHAR(64) COMMENT '昵称',
    achievement INT(11) DEFAULT 0 COMMENT '成就值',
    `level` INT(11) COMMENT '用户等级',
    job VARCHAR(32) COMMENT '职业方向',
    register_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间'
)CHARACTER SET UTF8
```

### Alter a Table

**Description:** The `user_info` table contains details of users who have registered over the years.

**User information table `user_info`:**

| Filed         | Type        | Null | Key | Default           | Extra          | Comment  |
| ------------- | ----------- | ---- | --- | ----------------- | -------------- | -------- |
| id            | int(11)     | NO   | PRI | (NULL)            | auto_increment | 自增 ID  |
| uid           | int(11)     | NO   | UNI | (NULL)            |                | 用户 ID  |
| nick_name     | varchar(64) | YES  |     | (NULL)            |                | 昵称     |
| achievement   | int(11)     | YES  |     | 0                 |                | 成就值   |
| level         | int(11)     | YES  |     | (NULL)            |                | 用户等级 |
| job           | varchar(32) | YES  |     | (NULL)            |                | 职业方向 |
| register_time | datetime    | YES  |     | CURRENT_TIMESTAMP |                | 注册时间 |

**Task:** Add a `school` column after `level` that can store up to 15 characters. Rename `job` to `profession` and change its `VARCHAR` length to 10. Set the default value of `achievement` to 0.

**Approach:** First, review the basic syntax of `ALTER TABLE`:

- Add a column: `ALTER TABLE table_name ADD COLUMN column_name type [FIRST | AFTER column_name];` (`FIRST` places it first; `AFTER` places it after the specified column.)
- Change a column's type or constraints: `ALTER TABLE table_name MODIFY COLUMN column_name new_type [new_constraints];`
- Rename a column: `ALTER TABLE table_name CHANGE COLUMN old_name new_name type;`
- Drop a column: `ALTER TABLE table_name DROP COLUMN column_name;`
- Rename a table: `ALTER TABLE table_name RENAME [TO] new_table_name;`
- Move a column to the first position: `ALTER TABLE table_name MODIFY COLUMN column_name type FIRST;`

The `COLUMN` keyword is optional, but it is included here for clarity.

You can combine multiple changes in one statement, but take care with the syntax.

**Answer:**

```sql
ALTER TABLE user_info
    ADD school VARCHAR(15) AFTER level,
    CHANGE job profession VARCHAR(10),
    MODIFY achievement INT(11) DEFAULT 0;
```

### Drop Tables

**Description:** The `exam_record` table contains users' exam attempts from many years. A backup table named `exam_record_{YEAR}` is usually created for each year, where `{YEAR}` is the corresponding year.

As the data grows, storage is running low. Drop the old backup tables from 2011 through 2014, if they exist.

**Approach:** Drop the tables directly. You can list multiple tables separated by commas in one statement. If there are many tables, you can write a script to drop them.

**Answer:**

```sql
DROP TABLE IF EXISTS exam_record_2011;
DROP TABLE IF EXISTS exam_record_2012;
DROP TABLE IF EXISTS exam_record_2013;
DROP TABLE IF EXISTS exam_record_2014;
```

### Create Indexes

**Description:** The `examination_info` table contains information about different exams. Create the following indexes to make queries more efficient.

Create a regular index named `idx_duration` on `duration`, a unique index named `uniq_idx_exam_id` on `exam_id`, and a full-text index named `full_idx_tag` on `tag`.

The expected output is:

| examination_info | 0   | PRIMARY          | 1   | id       | A   | 0   |     |     |     | BTREE    |
| ---------------- | --- | ---------------- | --- | -------- | --- | --- | --- | --- | --- | -------- |
| examination_info | 0   | uniq_idx_exam_id | 1   | exam_id  | A   | 0   |     |     | YES | BTREE    |
| examination_info | 1   | idx_duration     | 1   | duration | A   | 0   |     |     |     | BTREE    |
| examination_info | 1   | full_idx_tag     | 1   | tag      |     | 0   |     |     | YES | FULLTEXT |

Note: The platform compares the output of `SHOW INDEX FROM examination_info`.

**Approach:** First, understand these common index types:

- **B-tree index:** The most common and default index type. It can quickly locate matching data and supports equality searches, range searches, and sorting.
- **Unique index:** Similar to a regular B-tree index, but values in the indexed column must be unique. MySQL enforces this when rows are inserted or updated.
- **Primary key index:** A special unique index that identifies each row. A table can have only one primary key, which helps improve data access and integrity.
- **Full-text index:** Used for full-text searches in text data. It supports keyword searches rather than only equality or range searches.

```sql
-- Examples:
-- Add a B-tree index:
    CREATE INDEX idx_name ON table_name (column_name); -- idx_name is the index name used below.
-- Create a unique index:
    CREATE UNIQUE INDEX idx_name ON table_name (column_name);
-- Create a primary key index:
    ALTER TABLE table_name ADD PRIMARY KEY (column_name);
-- Create a full-text index:
    ALTER TABLE table_name ADD FULLTEXT INDEX idx_name (column_name);

-- Both CREATE and ALTER can add indexes.
```

With these basics, the solution is:

**Answer:**

```sql
ALTER TABLE examination_info
    ADD INDEX idx_duration(duration),
    ADD UNIQUE INDEX uniq_idx_exam_id(exam_id),
    ADD FULLTEXT INDEX full_idx_tag(tag);
```

### Drop Indexes

**Description:** Drop the unique index `uniq_idx_exam_id` and the full-text index `full_idx_tag` from `examination_info`.

**Approach:** This problem tests the basic syntax for dropping indexes:

```sql
-- Drop an index with DROP INDEX.
DROP INDEX idx_name ON table_name;

-- Drop an index with ALTER TABLE.
ALTER TABLE employees DROP INDEX idx_email;
```

Note that MySQL does not support dropping multiple indexes in one operation. Specify one index name each time you drop an index.

Use the **DROP** command with care.

**Answer:**

```sql
DROP INDEX uniq_idx_exam_id ON examination_info;
DROP INDEX full_idx_tag ON examination_info;
```

<!-- @include: @article-footer.snippet.md -->
