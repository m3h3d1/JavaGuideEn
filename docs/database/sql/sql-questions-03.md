---
title: SQL Interview Questions (3)
description: The third set of SQL interview questions covers aggregate functions such as COUNT, SUM, AVG, MAX, and MIN, along with GROUP BY, HAVING, and trimmed average calculations.
category: Database
tag:
  - Database Fundamentals
  - SQL
head:
  - - meta
    - name: keywords
      content: SQL interview questions, aggregate functions, COUNT, SUM, AVG, MAX, MIN, GROUP BY, HAVING, trimmed average
---

> Questions are from [Nowcoder - Advanced SQL Challenges](https://www.nowcoder.com/exam/oj?page=1&tab=SQL%E7%AF%87&topicId=240).

Depending on your experience and interview needs, you may choose to skip the harder problems.

## Aggregate Functions

### Trimmed Average Score for Hard SQL Exams (Advanced)

**Description:** Nowcoder's operations team wants to review scores on hard SQL exams.

Calculate the trimmed average score for all completed hard SQL exams in the `exam_record` table. A trimmed average removes one maximum and one minimum score before calculating the mean.

Sample data: `examination_info` (`exam_id`: exam ID, `tag`: exam category, `difficulty`: exam difficulty, `duration`: exam length, `release_time`: release time)

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2020-01-01 10:00:00 |
| 2   | 9002    | Algorithms | medium     | 80       | 2020-08-02 10:00:00 |

Sample data: `exam_record` (`uid`: user ID, `exam_id`: exam ID, `start_time`: attempt start time, `submit_time`: submission time, `score`: score)

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2020-01-02 09:01:01 | 2020-01-02 09:21:01 | 80     |
| 2   | 1001 | 9001    | 2021-05-02 10:01:01 | 2021-05-02 10:30:01 | 81     |
| 3   | 1001 | 9001    | 2021-06-02 19:01:01 | 2021-06-02 19:31:01 | 84     |
| 4   | 1001 | 9002    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89     |
| 5   | 1001 | 9001    | 2021-09-02 12:01:01 | (NULL)              | (NULL) |
| 6   | 1001 | 9002    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 7   | 1002 | 9002    | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87     |
| 8   | 1002 | 9001    | 2021-05-05 18:01:01 | 2021-05-05 18:59:02 | 90     |
| 9   | 1003 | 9001    | 2021-09-07 12:01:01 | 2021-09-07 10:31:01 | 50     |
| 10  | 1004 | 9001    | 2021-09-06 10:01:01 | (NULL)              | (NULL) |

The query should return:

| tag | difficulty | clip_avg_score |
| --- | ---------- | -------------- |
| SQL | hard       | 81.7           |

According to `examination_info`, exam 9001 is a hard SQL exam. Its scores are [80, 81, 84, 90, 50]. After removing the maximum and minimum, the remaining scores are [80, 81, 84]. Their average is 81.6666667, or 81.7 when rounded to one decimal place.

**Input:**

The input contains at least three valid scores.

**Approach 1:** Join `examination_info` to find hard SQL exams. In this sample, the hard SQL exam has `exam_id = 9001`, which can then be used as a filter.

First, find records for exam 9001: `SELECT * FROM exam_record WHERE exam_id = 9001`.

Next, find the highest score: `SELECT MAX(score) FROM exam_record WHERE exam_id = 9001`.

Then, find the lowest score: `SELECT MIN(score) FROM exam_record WHERE exam_id = 9001`.

To exclude the highest and lowest scores, use `NOT IN` or `NOT EXISTS`. This solution uses `NOT IN`.

Start with the main query: `SELECT tag, difficulty, ROUND(AVG(score), 1) AS clip_avg_score FROM examination_info info INNER JOIN exam_record record`.

**Tip:** MySQL's `ROUND(X)` returns `X` rounded to the nearest integer. `ROUND(X, D)` rounds `X` to `D` decimal places.

Combine the query fragments. In `NOT IN`, combine the maximum and minimum subqueries with `UNION ALL` to return both values in one column.

**Answer 1:**

```sql
SELECT tag, difficulty, ROUND(AVG(score), 1) clip_avg_score
	FROM examination_info info  INNER JOIN exam_record record
		WHERE info.exam_id = record.exam_id
			AND  record.exam_id = 9001
				AND record.score NOT IN(
					SELECT MAX(score)
						FROM exam_record
							WHERE exam_id = 9001
								UNION ALL
					SELECT MIN(score)
						FROM exam_record
							WHERE exam_id = 9001
				)
```

This is the most direct solution, but it relies on the sample exam ID. A solution that follows the requirements more closely is:

```sql
SELECT tag,
       difficulty,
       ROUND(AVG(score), 1) clip_avg_score
FROM examination_info info
INNER JOIN exam_record record
WHERE info.exam_id = record.exam_id
  AND record.exam_id =
    (SELECT examination_info.exam_id
     FROM examination_info
     WHERE tag = 'SQL'
       AND difficulty = 'hard' )
  AND record.score NOT IN
    (SELECT MAX(score)
     FROM exam_record
     WHERE exam_id =
         (SELECT examination_info.exam_id
          FROM examination_info
          WHERE tag = 'SQL'
            AND difficulty = 'hard' )
     UNION ALL SELECT MIN(score)
     FROM exam_record
     WHERE exam_id =
         (SELECT examination_info.exam_id
          FROM examination_info
          WHERE tag = 'SQL'
            AND difficulty = 'hard' ) )
```

This query repeats the same logic several times. Use `WITH` to extract the common part.

**The `WITH` clause:**

The `WITH` clause, also called a common table expression (CTE), defines a temporary named result set in a query. You can reference that result set within the same query.

Basic syntax:

```sql
WITH cte_name (column1, column2, ..., columnN) AS (
    -- CTE query
    SELECT ...
    FROM ...
    WHERE ...
)
-- Main query
SELECT ...
FROM cte_name
WHERE ...
```

The `WITH` clause has these parts:

- `cte_name`: the name used to reference the temporary result in the main query.
- `(column1, column2, ..., columnN)`: optional column names for the temporary result.
- `AS`: required; begins the temporary result definition.
- `CTE query`: the query that defines the rows in the temporary result.

The `WITH` clause can improve readability and maintainability, especially when a query has nested subqueries or repeats the same logic. Putting that logic in a named temporary result organizes the query and avoids repetition.

The `WITH` clause can also support recursive queries. A recursive query repeatedly processes the same table within one query, building the result set step by step. This is useful for hierarchical data, organizational structures, and trees.

**Note:** MySQL 5.7 and earlier do not support using aliases directly in a `WITH` clause.

The improved solution is:

```sql
WITH t1 AS
  (SELECT record.*,
          info.tag,
          info.difficulty
   FROM exam_record record
   INNER JOIN examination_info info ON record.exam_id = info.exam_id
   WHERE info.tag = "SQL"
     AND info.difficulty = "hard" )
SELECT tag,
       difficulty,
       ROUND(AVG(score), 1)
FROM t1
WHERE score NOT IN
    (SELECT max(score)
     FROM t1
     UNION SELECT min(score)
     FROM t1)
```

**Approach 2:**

- Filter hard SQL exams: `WHERE tag = 'SQL' AND difficulty = 'hard'`.
- Calculate the trimmed average as `(sum - maximum - minimum) / (count - 2)`:
  - `(SUM(score) - MAX(score) - MIN(score)) / (COUNT(score) - 2)`.
  - This formula does not handle multiple occurrences of the maximum or minimum separately. The prompt asks to remove one maximum and one minimum, so the formula applies.

**Answer 2:**

```sql
SELECT info.tag,
       info.difficulty,
       ROUND((SUM(record.score)- MIN(record.score)- MAX(record.score)) / (COUNT(record.score)- 2), 1) AS clip_avg_score
FROM examination_info info,
     exam_record record
WHERE info.exam_id = record.exam_id
  AND info.tag = "SQL"
  AND info.difficulty = "hard";
```

### Count Exam Attempts

Given the `exam_record` table, count the total number of attempts (`total_pv`), completed attempts (`complete_pv`), and distinct completed exams (`complete_exam_cnt`).

Sample data from `exam_record` (`uid`: user ID, `exam_id`: exam ID, `start_time`: attempt start time, `submit_time`: submission time, `score`: score):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2020-01-02 09:01:01 | 2020-01-02 09:21:01 | 80     |
| 2   | 1001 | 9001    | 2021-05-02 10:01:01 | 2021-05-02 10:30:01 | 81     |
| 3   | 1001 | 9001    | 2021-06-02 19:01:01 | 2021-06-02 19:31:01 | 84     |
| 4   | 1001 | 9002    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89     |
| 5   | 1001 | 9001    | 2021-09-02 12:01:01 | (NULL)              | (NULL) |
| 6   | 1001 | 9002    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 7   | 1002 | 9002    | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87     |
| 8   | 1002 | 9001    | 2021-05-05 18:01:01 | 2021-05-05 18:59:02 | 90     |
| 9   | 1003 | 9001    | 2021-09-07 12:01:01 | 2021-09-07 10:31:01 | 50     |
| 10  | 1004 | 9001    | 2021-09-06 10:01:01 | (NULL)              | (NULL) |

Example output:

| total_pv | complete_pv | complete_exam_cnt |
| -------- | ----------- | ----------------- |
| 10       | 7           | 2                 |

Explanation: There are 10 exam attempts in total, 7 of which are complete. Attempts exited midway are incomplete, so their submission time and score are `NULL`. The completed exams are 9001 and 9002.

**Approach:** The word "count" suggests using `COUNT`. To count different types of records, use subqueries. This problem can also be solved with `CASE WHEN`, using similar logic. First, review the basic uses of `COUNT`.

The basic syntax of `COUNT()` is:

```sql
COUNT(expression)
```

`expression` can be a column name, expression, constant, or wildcard. Common examples:

1. Count all rows in a table:

```sql
SELECT COUNT(*) FROM table_name;
```

2. Count non-`NULL` values in a column:

```sql
SELECT COUNT(column_name) FROM table_name;
```

3. Count rows that meet a condition:

```sql
SELECT COUNT(*) FROM table_name WHERE condition;
```

4. Use with `GROUP BY` to count rows in each group:

```sql
SELECT column_name, COUNT(*) FROM table_name GROUP BY column_name;
```

5. Count unique combinations of columns:

```sql
SELECT COUNT(DISTINCT column_name1, column_name2) FROM table_name;
```

With no argument or with `COUNT(*)`, `COUNT()` counts all rows. When given a column name, it counts only non-`NULL` values in that column.

`COUNT()` returns an integer. It returns 0, not `NULL`, when there are no matching rows.

**Answer:**

```sql
SELECT
	count(*) total_pv,
	( SELECT count(*) FROM exam_record WHERE submit_time IS NOT NULL ) complete_pv,
	( SELECT COUNT( DISTINCT exam_id, score IS NOT NULL OR NULL ) FROM exam_record ) complete_exam_cnt
FROM
	exam_record
```

The expression `COUNT(DISTINCT exam_id, score IS NOT NULL OR NULL)` checks whether `score` is `NULL`. If it is not `NULL`, the expression is true; otherwise, it returns `NULL`. Without `OR NULL`, the false result would be 0 instead.

`COUNT` alone cannot count combinations of multiple columns. `DISTINCT` treats the columns as a combination, allowing the query to count unique rows. `COUNT(DISTINCT ...)` counts only non-`NULL` results.

This also shows a common way to conditionally count rows: `COUNT(column_condition OR NULL)`.

### Lowest Score at or Above the Average

**Description:** Find the lowest user score on an SQL exam that is at least the average score for all SQL exams.

Sample data from `exam_record` (`uid`: user ID, `exam_id`: exam ID, `start_time`: attempt start time, `submit_time`: submission time, `score`: score):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2020-01-02 09:01:01 | 2020-01-02 09:21:01 | 80     |
| 2   | 1002 | 9001    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89     |
| 3   | 1002 | 9002    | 2021-09-02 12:01:01 | (NULL)              | (NULL) |
| 4   | 1002 | 9003    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 5   | 1002 | 9001    | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87     |
| 6   | 1002 | 9002    | 2021-05-05 18:01:01 | 2021-05-05 18:59:02 | 90     |
| 7   | 1003 | 9002    | 2021-02-06 12:01:01 | (NULL)              | (NULL) |
| 8   | 1003 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86     |
| 9   | 1004 | 9003    | 2021-09-06 12:01:01 | (NULL)              | (NULL) |

`examination_info` (`exam_id`: exam ID, `tag`: exam category, `difficulty`: exam difficulty, `duration`: exam length, `release_time`: release time)

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2020-01-01 10:00:00 |
| 2   | 9002    | SQL        | easy       | 60       | 2020-02-01 10:00:00 |
| 3   | 9003    | Algorithms | medium     | 80       | 2020-08-02 10:00:00 |

Example output:

| min_score_over_avg |
| ------------------ |
| 87                 |

**Explanation:** Exams 9001 and 9002 are in the SQL category. Their scores are [80, 89, 87, 90], with an average of 86.5. The lowest score at or above the average is 87.

**Approach:** This type of problem can seem difficult at first. Read the prompt carefully and identify its key requirements. Here they are:

1. Find scores for **SQL** exams.

2. Find the **average score** for that category.

3. Find the **lowest user score** in that category.

The relation between them is **at least**.

Break the requirements down and solve them one at a time.

```sql
-- Find the scores for the SQL category: 80, 89, 87, 90.
-- Then calculate their average.
select  ROUND(AVG(score), 1) from  examination_info info INNER JOIN exam_record record
	where info.exam_id = record.exam_id
	and tag= 'SQL'
```

Next, find the lowest score in the category and compare the scores [80, 89, 87, 90] with the average to get the final result.

**Answer:**

```sql
SELECT MIN(score) AS min_score_over_avg
FROM examination_info info
INNER JOIN exam_record record
WHERE info.exam_id = record.exam_id
  AND tag= 'SQL'
  AND score >=
    (SELECT ROUND(AVG(score), 1)
     FROM examination_info info
     INNER JOIN exam_record record
     WHERE info.exam_id = record.exam_id
       AND tag= 'SQL' )
```

These requirements may seem convoluted. Break them into smaller conditions, solve each one, then combine them. **Identify the main requirements and handle each condition in turn.**

## Grouping Queries

### Average Active Days and Monthly Active Users

**Description:** Users' exam attempts on Nowcoder are stored in the `exam_record` table:

`exam_record` (`uid`: user ID, `exam_id`: exam ID, `start_time`: attempt start time, `submit_time`: submission time, `score`: score)

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-07-02 09:01:01 | 2021-07-02 09:21:01 | 80     |
| 2   | 1002 | 9001    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 81     |
| 3   | 1002 | 9002    | 2021-09-02 12:01:01 | (NULL)              | (NULL) |
| 4   | 1002 | 9003    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 5   | 1002 | 9001    | 2021-07-02 19:01:01 | 2021-07-02 19:30:01 | 82     |
| 6   | 1002 | 9002    | 2021-07-05 18:01:01 | 2021-07-05 18:59:02 | 90     |
| 7   | 1003 | 9002    | 2021-07-06 12:01:01 | (NULL)              | (NULL) |
| 8   | 1003 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86     |
| 9   | 1004 | 9003    | 2021-09-06 12:01:01 | (NULL)              | (NULL) |
| 10  | 1002 | 9003    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 81     |
| 11  | 1005 | 9001    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88     |
| 12  | 1006 | 9002    | 2021-09-02 12:11:01 | 2021-09-02 12:31:01 | 89     |
| 13  | 1007 | 9002    | 2020-09-02 12:11:01 | 2020-09-02 12:31:01 | 89     |

For each month of 2021, calculate the average number of active days per user (`avg_active_days`) and the number of monthly active users (`mau`). The sample output is:

| month  | avg_active_days | mau |
| ------ | --------------- | --- |
| 202107 | 1.50            | 2   |
| 202109 | 1.25            | 4   |

**Explanation:** In July 2021, two users were active for a total of three days (user 1001 was active for one day and user 1002 for two), so the average is 1.5 days. In September, four users were active for a total of five days, so the average is 1.25 days. Results are rounded to two decimal places.

Note: A user is considered active when they **submit** an exam.

**Approach:** The highlighted requirements point to date functions. Break the problem down. Use `COUNT()` to count active users, and remove duplicates because user 1002 took two different exams in September. Also use `DATE_FORMAT` to display months in the required `202107` format.

Basic syntax:

`DATE_FORMAT(date_value, format)`

- `date_value` is the date or time value to format.
- `format` specifies the output format, similar to Java date formats.

**Answer:**

```sql
SELECT DATE_FORMAT(submit_time, '%Y%m') MONTH,
                                        round(count(DISTINCT UID, DATE_FORMAT(submit_time, '%Y%m%d')) / count(DISTINCT UID), 2) avg_active_days,
                                        COUNT(DISTINCT UID) mau
FROM exam_record
WHERE YEAR (submit_time) = 2021
GROUP BY MONTH
```

`COUNT(DISTINCT uid, DATE_FORMAT(submit_time, '%Y%m%d'))` counts unique combinations of `uid` and `submit_time` formatted as year, month, and day.

### Monthly and Daily Question Attempt Counts

**Description:** The `practice_record` table contains question attempts. Sample rows:

| id  | uid  | question_id | submit_time         | score |
| --- | ---- | ----------- | ------------------- | ----- |
| 1   | 1001 | 8001        | 2021-08-02 11:41:01 | 60    |
| 2   | 1002 | 8001        | 2021-09-02 19:30:01 | 50    |
| 3   | 1002 | 8001        | 2021-09-02 19:20:01 | 70    |
| 4   | 1002 | 8002        | 2021-09-02 19:38:01 | 70    |
| 5   | 1003 | 8002        | 2021-08-01 19:38:01 | 80    |

For each month of 2021, calculate the total number of question attempts (`month_q_cnt`) and the average number per day (`avg_day_q_cnt`). Sort by month in ascending order and include a yearly total. The sample output is:

| submit_month | month_q_cnt | avg_day_q_cnt |
| ------------ | ----------- | ------------- |
| 202108       | 2           | 0.065         |
| 202109       | 3           | 0.100         |
| 2021 total   | 5           | 0.161         |

**Explanation:** August 2021 has two question attempts, or 2/31 = 0.065 per day (rounded to three decimal places). September has three attempts, or 3/30 = 0.100 per day. There are five attempts in 2021. The yearly daily average is not meaningful, so this example divides by 31: 5/31 = 0.161.

> Nowcoder uses a recent version of MySQL. If you see an `ONLY_FULL_GROUP_BY` error, it means that every non-aggregated column in `SELECT` must appear in the `GROUP BY` clause; otherwise, the query is invalid.

**Approach:**

The sample output suggests using date functions. Use `DATE_FORMAT` to create `submit_month`, then count attempts for each month.

Count attempts by month:

```sql
SELECT MONTH ( submit_time ), COUNT( question_id )
FROM
	practice_record
GROUP BY
	MONTH (submit_time)
```

For the third column, use `DAY(LAST_DAY(date_value))` to get the number of days in the given month.

Examples:

```sql
SELECT DAY(LAST_DAY('2023-07-08')) AS days_in_month;
-- Output: 31

SELECT DAY(LAST_DAY('2023-02-01')) AS days_in_month;
-- Output: 28 (February in a non-leap year)

SELECT DAY(LAST_DAY(NOW())) AS days_in_current_month;
-- Output: 31 (number of days in the current month)
```

Use `LAST_DAY()` to get the last day of the given month, then `DAY()` to extract its day number. This gives the number of days in that month.

`LAST_DAY()` returns a date, while `DAY()` extracts the day part of that date.

With this analysis, the query is straightforward. The main challenge is handling dates.

**Answer:**

```sql
SELECT DATE_FORMAT(submit_time, '%Y%m') submit_month,
       count(question_id) month_q_cnt,
       ROUND(COUNT(question_id) / DAY (LAST_DAY(submit_time)), 3) avg_day_q_cnt
FROM practice_record
WHERE DATE_FORMAT(submit_time, '%Y') = '2021'
GROUP BY submit_month
UNION ALL
SELECT '2021 total' AS submit_month,
       count(question_id) month_q_cnt,
       ROUND(COUNT(question_id) / 31, 3) avg_day_q_cnt
FROM practice_record
WHERE DATE_FORMAT(submit_time, '%Y') = '2021'
ORDER BY submit_month
```

The final row contains the yearly total, so add it to the result with `UNION ALL`. Remember to sort the results.

### Valid Users with More Than One Incomplete Exam (Advanced)

**Description:** Sample data from `exam_record` (`uid`: user ID, `exam_id`: exam ID, `start_time`: attempt start time, `submit_time`: submission time, `score`: score):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-07-02 09:01:01 | 2021-07-02 09:21:01 | 80     |
| 2   | 1002 | 9001    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 81     |
| 3   | 1002 | 9002    | 2021-09-02 12:01:01 | (NULL)              | (NULL) |
| 4   | 1002 | 9003    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 5   | 1002 | 9001    | 2021-07-02 19:01:01 | 2021-07-02 19:30:01 | 82     |
| 6   | 1002 | 9002    | 2021-07-05 18:01:01 | 2021-07-05 18:59:02 | 90     |
| 7   | 1003 | 9002    | 2021-07-06 12:01:01 | (NULL)              | (NULL) |
| 8   | 1003 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86     |
| 9   | 1004 | 9003    | 2021-09-06 12:01:01 | (NULL)              | (NULL) |
| 10  | 1002 | 9003    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 81     |
| 11  | 1005 | 9001    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88     |
| 12  | 1006 | 9002    | 2021-09-02 12:11:01 | 2021-09-02 12:31:01 | 89     |
| 13  | 1007 | 9002    | 2020-09-02 12:11:01 | 2020-09-02 12:31:01 | 89     |

The `examination_info` table contains exam information (`exam_id`: exam ID, `tag`: category, `difficulty`: difficulty, `duration`: exam length, `release_time`: release time):

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2020-01-01 10:00:00 |
| 2   | 9002    | SQL        | easy       | 60       | 2020-02-01 10:00:00 |
| 3   | 9003    | Algorithms | medium     | 80       | 2020-08-02 10:00:00 |

For 2021, return data for each valid user with more than one incomplete exam attempt. A valid user has at least one completed attempt and fewer than five incomplete attempts. Return the user ID, incomplete and completed attempt counts, and the set of exam tags they attempted. Sort by incomplete attempt count in descending order. The sample output is:

| uid  | incomplete_cnt | complete_cnt | detail                                                                            |
| ---- | -------------- | ------------ | --------------------------------------------------------------------------------- |
| 1002 | 2              | 4            | 2021-09-01:Algorithms;2021-07-02:SQL;2021-09-02:SQL;2021-09-05:SQL;2021-07-05:SQL |

**Explanation:** In 2021, every user except 1004 meets the definition of a valid user, but only 1002 has more than one incomplete attempt. The `detail` field lists the exams user 1002 attempted as `{date:tag}` pairs, with `:` between the date and tag and `;` between pairs.

**Approach:**

Join the tables because the output must include `tag`.

Filter the rows to 2021:

```sql
SELECT *
FROM exam_record er
LEFT JOIN examination_info ei ON er.exam_id = ei.exam_id
WHERE YEAR (er.start_time)= 2021
```

Group by `uid` and check the conditions for each user: at least one completed attempt, more than one incomplete attempt, and fewer than five incomplete attempts.

The conditions are: `incomplete > 1 AND complete >= 1 AND incomplete < 5`.

The result also needs concatenated strings. Use `GROUP_CONCAT`; its syntax is:

Basic syntax:

```sql
GROUP_CONCAT([DISTINCT] expr [ORDER BY {unsigned_integer | col_name | expr} [ASC | DESC] [, ...]]             [SEPARATOR sep])
```

- `expr`: the column or expression to concatenate.
- `DISTINCT`: optional; removes duplicate values.
- `ORDER BY`: optional; sorts the concatenated values in ascending (`ASC`) or descending (`DESC`) order.
- `SEPARATOR sep`: optional; sets the delimiter. This problem uses `;`.

`GROUP_CONCAT()` is often used with `GROUP BY` to combine values from a group of rows into one string.

**Answer:**

```sql
SELECT a.uid,
       SUM(CASE
               WHEN a.submit_time IS NULL THEN 1
           END) AS incomplete_cnt,
       SUM(CASE
               WHEN a.submit_time IS NOT NULL THEN 1
           END) AS complete_cnt,
       GROUP_CONCAT(DISTINCT CONCAT(DATE_FORMAT(a.start_time, '%Y-%m-%d'), ':', b.tag)
                    ORDER BY start_time SEPARATOR ";") AS detail
FROM exam_record a
LEFT JOIN examination_info b ON a.exam_id = b.exam_id
WHERE YEAR (a.start_time)= 2021
GROUP BY a.uid
HAVING incomplete_cnt > 1
AND complete_cnt >= 1
AND incomplete_cnt < 5
ORDER BY incomplete_cnt DESC
```

- `SUM(CASE WHEN a.submit_time IS NULL THEN 1 END)` counts each user's incomplete attempts.
- `SUM(CASE WHEN a.submit_time IS NOT NULL THEN 1 END)` counts each user's completed attempts.
- `GROUP_CONCAT(DISTINCT CONCAT(DATE_FORMAT(a.start_time, '%Y-%m-%d'), ':', b.tag) ORDER BY a.start_time SEPARATOR ';')` combines each user's exam dates and tags into a string, ordered by attempt start time.

## Nested Subqueries

### Categories Preferred by Users Who Complete at Least Three Exams per Month (Advanced)

**Description:** Sample data from `exam_record` (`uid`: user ID, `exam_id`: exam ID, `start_time`: attempt start time, `submit_time`: submission time, `NULL` if not submitted, `score`: score):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-07-02 09:01:01 | (NULL)              | (NULL) |
| 2   | 1002 | 9003    | 2021-09-01 12:01:01 | 2021-09-01 12:21:01 | 60     |
| 3   | 1002 | 9002    | 2021-09-02 12:01:01 | 2021-09-02 12:31:01 | 70     |
| 4   | 1002 | 9001    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 81     |
| 5   | 1002 | 9002    | 2021-07-06 12:01:01 | (NULL)              | (NULL) |
| 6   | 1003 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86     |
| 7   | 1003 | 9003    | 2021-09-08 12:01:01 | 2021-09-08 12:11:01 | 40     |
| 8   | 1003 | 9001    | 2021-09-08 13:01:01 | (NULL)              | (NULL) |
| 9   | 1003 | 9002    | 2021-09-08 14:01:01 | (NULL)              | (NULL) |
| 10  | 1003 | 9003    | 2021-09-08 15:01:01 | (NULL)              | (NULL) |
| 11  | 1005 | 9001    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88     |
| 12  | 1005 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88     |
| 13  | 1005 | 9002    | 2021-09-02 12:11:01 | 2021-09-02 12:31:01 | 89     |

Sample data from `examination_info` (`exam_id`: exam ID, `tag`: category, `difficulty`: difficulty, `duration`: exam length, `release_time`: release time):

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2020-01-01 10:00:00 |
| 2   | 9002    | C++        | easy       | 60       | 2020-02-01 10:00:00 |
| 3   | 9003    | Algorithms | medium     | 80       | 2020-08-02 10:00:00 |

Find the categories attempted by users who completed at least three exams in a month, along with the number of attempts in each category. Sort by attempt count in descending order. The sample output is:

| tag        | tag_cnt |
| ---------- | ------- |
| C++        | 4       |
| SQL        | 2       |
| Algorithms | 1       |

**Explanation:** Users 1002 and 1005 each completed three exams in September 2021; all other users completed fewer than three. For those two users, the exam tags ranked by attempt count are C++, SQL, and Algorithms.

**Approach:** This problem uses nested subqueries. The key condition is at least three completed exams in a month. The wording is unclear; the query is for September, not for every month or an average across all months.

First, find users with at least three completed exams in a month:

```sql
SELECT UID
FROM exam_record record
GROUP BY UID,
         MONTH (start_time)
HAVING count(submit_time) >= 3
```

Once this is clear, use it as a subquery to find those users, then select the required columns and sort the results.

```sql
SELECT tag,
       count(start_time) AS tag_cnt
FROM exam_record record
INNER JOIN examination_info info ON record.exam_id = info.exam_id
WHERE UID IN
    (SELECT UID
     FROM exam_record record
     GROUP BY UID,
              MONTH (start_time)
     HAVING count(submit_time) >= 3)
GROUP BY tag
ORDER BY tag_cnt DESC
```

### Number of Users and Average Score on an Exam's Release Date

**Description:** Sample data from `user_info` (`uid`: user ID, `nick_name`: nickname, `achievement`: achievement points, `level`: level, `job`: career path, `register_time`: registration time):

| id  | uid  | nick_name | achievement | level | job        | register_time       |
| --- | ---- | --------- | ----------- | ----- | ---------- | ------------------- |
| 1   | 1001 | User 1    | 3100        | 7     | Algorithms | 2020-01-01 10:00:00 |
| 2   | 1002 | User 2    | 2100        | 6     | Algorithms | 2020-01-01 10:00:00 |
| 3   | 1003 | User 3    | 1500        | 5     | Algorithms | 2020-01-01 10:00:00 |
| 4   | 1004 | User 4    | 1100        | 4     | Algorithms | 2020-01-01 10:00:00 |
| 5   | 1005 | User 5    | 1600        | 6     | C++        | 2020-01-01 10:00:00 |
| 6   | 1006 | User 6    | 3000        | 6     | C++        | 2020-01-01 10:00:00 |

**Explanation:** User 1001 has the nickname "User 1," 3,100 achievement points, level 7, a career path in Algorithms, and a registration time of `2020-01-01 10:00:00`.

Sample data from `examination_info` (`exam_id`: exam ID, `tag`: category, `difficulty`: difficulty, `duration`: exam length, `release_time`: release time):

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2021-09-01 06:00:00 |
| 2   | 9002    | C++        | easy       | 60       | 2020-02-01 10:00:00 |
| 3   | 9003    | Algorithms | medium     | 80       | 2020-08-02 10:00:00 |

Sample data from `exam_record` (`uid`: user ID, `exam_id`: exam ID, `start_time`: attempt start time, `submit_time`: submission time, `score`: score):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-07-02 09:01:01 | 2021-09-01 09:41:01 | 70     |
| 2   | 1002 | 9003    | 2021-09-01 12:01:01 | 2021-09-01 12:21:01 | 60     |
| 3   | 1002 | 9002    | 2021-09-02 12:01:01 | 2021-09-02 12:31:01 | 70     |
| 4   | 1002 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 80     |
| 5   | 1002 | 9003    | 2021-08-01 12:01:01 | 2021-08-01 12:21:01 | 60     |
| 6   | 1002 | 9002    | 2021-08-02 12:01:01 | 2021-08-02 12:31:01 | 70     |
| 7   | 1002 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 85     |
| 8   | 1002 | 9002    | 2021-07-06 12:01:01 | (NULL)              | (NULL) |
| 9   | 1003 | 9002    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86     |
| 10  | 1003 | 9003    | 2021-09-08 12:01:01 | 2021-09-08 12:11:01 | 40     |
| 11  | 1003 | 9003    | 2021-09-01 13:01:01 | 2021-09-01 13:41:01 | 70     |
| 12  | 1003 | 9001    | 2021-09-08 14:01:01 | (NULL)              | (NULL) |
| 13  | 1003 | 9002    | 2021-09-08 15:01:01 | (NULL)              | (NULL) |
| 14  | 1005 | 9001    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 90     |
| 15  | 1005 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88     |
| 16  | 1005 | 9002    | 2021-09-02 12:11:01 | 2021-09-02 12:31:01 | 89     |

For each SQL exam, count users above level 5 who attempted it on its release date (`uv`) and calculate their average score (`avg_score`). Sort by user count in descending order, then by average score in ascending order. The sample output is:

| exam_id | uv  | avg_score |
| ------- | --- | --------- |
| 9001    | 3   | 81.3      |

Explanation: There is one SQL exam, ID 9001. On its release date (2021-09-01), users 1001, 1002, 1003, and 1005 attempted it. User 1003 is level 5; the other three are above level 5. Their scores are [70, 80, 85, 90], with an average of 81.3 when rounded to one decimal place.

**Approach:** This problem looks complex, but you can break the outer conditions down and combine them. For multi-table queries, work from the outer requirements inward.

First, join the three tables and apply conditions such as `level > 5`:

```sql
SELECT DISTINCT u_info.uid
FROM examination_info e_info
INNER JOIN exam_record record
INNER JOIN user_info u_info
WHERE e_info.exam_id = record.exam_id
  AND u_info.uid = record.uid
  AND u_info.LEVEL > 5
```

The query asks for users who attempted each SQL exam on its release date. The word **same day** indicates a date comparison.

Compare the exam release date and attempt start date with `DATE(e_info.release_time) = DATE(record.start_time)`. Incomplete attempts with a `NULL` `submit_time` are filtered out by the `WHERE` clause below.

**Answer:**

```sql
SELECT record.exam_id AS exam_id,
       COUNT(DISTINCT u_info.uid) AS uv,
       ROUND(SUM(record.score) / COUNT(u_info.uid), 1) AS avg_score
FROM examination_info e_info
INNER JOIN exam_record record
INNER JOIN user_info u_info
WHERE e_info.exam_id = record.exam_id
  AND u_info.uid = record.uid
  AND DATE (e_info.release_time) = DATE (record.start_time)
  AND submit_time IS NOT NULL
  AND tag = 'SQL'
  AND u_info.LEVEL > 5
GROUP BY record.exam_id
ORDER BY uv DESC,
         avg_score ASC
```

Note the final sort order: sort by user count first, then by average score to break ties.

### User Level Distribution for Exam Scores Above 80

**Description:**

Sample data from `user_info` (`uid`: user ID, `nick_name`: nickname, `achievement`: achievement points, `level`: level, `job`: career path, `register_time`: registration time):

| id  | uid  | nick_name | achievement | level | job        | register_time       |
| --- | ---- | --------- | ----------- | ----- | ---------- | ------------------- |
| 1   | 1001 | User 1    | 3100        | 7     | Algorithms | 2020-01-01 10:00:00 |
| 2   | 1002 | User 2    | 2100        | 6     | Algorithms | 2020-01-01 10:00:00 |
| 3   | 1003 | User 3    | 1500        | 5     | Algorithms | 2020-01-01 10:00:00 |
| 4   | 1004 | User 4    | 1100        | 4     | Algorithms | 2020-01-01 10:00:00 |
| 5   | 1005 | User 5    | 1600        | 6     | C++        | 2020-01-01 10:00:00 |
| 6   | 1006 | User 6    | 3000        | 6     | C++        | 2020-01-01 10:00:00 |

Sample data from `examination_info` (`exam_id`: exam ID, `tag`: category, `difficulty`: difficulty, `duration`: exam length, `release_time`: release time):

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2021-09-01 06:00:00 |
| 2   | 9002    | C++        | easy       | 60       | 2021-09-01 06:00:00 |
| 3   | 9003    | Algorithms | medium     | 80       | 2021-09-01 10:00:00 |

Sample data from `exam_record` (`uid`: user ID, `exam_id`: exam ID, `start_time`: attempt start time, `submit_time`: submission time, `score`: score):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:41:01 | 79     |
| 2   | 1002 | 9003    | 2021-09-01 12:01:01 | 2021-09-01 12:21:01 | 60     |
| 3   | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 70     |
| 4   | 1002 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 80     |
| 5   | 1002 | 9003    | 2021-08-01 12:01:01 | 2021-08-01 12:21:01 | 60     |
| 6   | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 70     |
| 7   | 1002 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 85     |
| 8   | 1002 | 9002    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 9   | 1003 | 9002    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86     |
| 10  | 1003 | 9003    | 2021-09-08 12:01:01 | 2021-09-08 12:11:01 | 40     |
| 11  | 1003 | 9003    | 2021-09-01 13:01:01 | 2021-09-01 13:41:01 | 81     |
| 12  | 1003 | 9001    | 2021-09-01 14:01:01 | (NULL)              | (NULL) |
| 13  | 1003 | 9002    | 2021-09-08 15:01:01 | (NULL)              | (NULL) |
| 14  | 1005 | 9001    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 90     |
| 15  | 1005 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88     |
| 16  | 1005 | 9002    | 2021-09-02 12:11:01 | 2021-09-02 12:31:01 | 89     |

For users who scored above 80 on SQL exams, count users at each level. Sort by count in descending order (the counts are guaranteed to differ). The sample output is:

| level | level_cnt |
| ----- | --------- |
| 6     | 2         |
| 5     | 1         |

Explanation: Exam 9001 is an SQL exam. Three users scored above 80: 1002, 1003, and 1005. Two are level 6, and one is level 5.

**Approach:** This uses the same data as the previous problem, with different query conditions.

**Answer:**

```sql
SELECT u_info.LEVEL AS LEVEL,
       count(u_info.uid) AS level_cnt
FROM examination_info e_info
INNER JOIN exam_record record
INNER JOIN user_info u_info
WHERE e_info.exam_id = record.exam_id
  AND u_info.uid = record.uid
  AND record.score > 80
  AND submit_time IS NOT NULL
  AND tag = 'SQL'
GROUP BY LEVEL
ORDER BY level_cnt DESC
```

## Combining Queries

### Number of Users and Attempts for Each Question and Exam

**Description:**

The `exam_record` table contains exam attempts (`uid`: user ID, `exam_id`: exam ID, `start_time`: attempt start time, `submit_time`: submission time, `score`: score):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:41:01 | 81     |
| 2   | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 70     |
| 3   | 1002 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 80     |
| 4   | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 70     |
| 5   | 1004 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 85     |
| 6   | 1002 | 9002    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |

The `practice_record` table contains question attempts (`uid`: user ID, `question_id`: question ID, `submit_time`: submission time, `score`: score):

| id  | uid  | question_id | submit_time         | score |
| --- | ---- | ----------- | ------------------- | ----- |
| 1   | 1001 | 8001        | 2021-08-02 11:41:01 | 60    |
| 2   | 1002 | 8001        | 2021-09-02 19:30:01 | 50    |
| 3   | 1002 | 8001        | 2021-09-02 19:20:01 | 70    |
| 4   | 1002 | 8002        | 2021-09-02 19:38:01 | 70    |
| 5   | 1003 | 8001        | 2021-08-02 19:38:01 | 70    |
| 6   | 1003 | 8001        | 2021-08-02 19:48:01 | 90    |
| 7   | 1003 | 8002        | 2021-08-01 19:38:01 | 80    |

Count the number of users and attempts for each exam and question. Sort each set by UV and PV in descending order. The sample output is:

| tid  | uv  | pv  |
| ---- | --- | --- |
| 9001 | 3   | 3   |
| 9002 | 1   | 3   |
| 8001 | 3   | 5   |
| 8002 | 2   | 2   |

**Explanation:** For exams, three users made three attempts on exam 9001, and one user made three attempts on exam 9002. For practice questions, three users made five attempts on question 8001, and two users made two attempts on question 8002.

**Approach:** The tricky part is using `UNION` with `ORDER BY`.

Using `UNION` with multiple unparenthesized `ORDER BY` clauses causes an error.

An `ORDER BY` clause inside a query combined with `UNION` may not have the intended effect.

For example, without parentheses:

```sql
SELECT exam_id AS tid,
       COUNT(DISTINCT UID) AS uv,
       COUNT(UID) AS pv
FROM exam_record
GROUP BY exam_id
ORDER BY uv DESC,
         pv DESC
UNION
SELECT question_id AS tid,
       COUNT(DISTINCT UID) AS uv,
       COUNT(UID) AS pv
FROM practice_record
GROUP BY question_id
ORDER BY uv DESC,
         pv DESC
```

This produces a syntax error. Without parentheses, use only one `ORDER BY` clause.

In another case, `ORDER BY` does not affect the `UNION` result unless it is applied in an outer query. Wrap each query in a subquery to apply its ordering there.

**Answer:**

```sql
SELECT *
FROM
  (SELECT exam_id AS tid,
          COUNT(DISTINCT exam_record.uid) uv,
          COUNT(*) pv
   FROM exam_record
   GROUP BY exam_id
   ORDER BY uv DESC, pv DESC) t1
UNION
SELECT *
FROM
  (SELECT question_id AS tid,
          COUNT(DISTINCT practice_record.uid) uv,
          COUNT(*) pv
   FROM practice_record
   GROUP BY question_id
   ORDER BY uv DESC, pv DESC) t2;
```

### Users Who Qualify for Either Activity

**Description:** To encourage users to study and practice on Nowcoder, the platform rewards active users who perform well. Suppose two campaigns offered coupons: one for users who scored at least 85 on every exam attempt (`activity1`), and one for users who completed a hard exam in no more than half the allotted time and scored above 80 at least once (`activity2`).

Select users who qualified for either campaign in 2021 and return their IDs and campaign names. Sort by user ID.

Sample data from `examination_info` (`exam_id`: exam ID, `tag`: category, `difficulty`: difficulty, `duration`: exam length, `release_time`: release time):

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2021-09-01 06:00:00 |
| 2   | 9002    | C++        | easy       | 60       | 2021-09-01 06:00:00 |
| 3   | 9003    | Algorithms | medium     | 80       | 2021-09-01 10:00:00 |

Sample data from `exam_record` (`uid`: user ID, `exam_id`: exam ID, `start_time`: attempt start time, `submit_time`: submission time, `score`: score):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 81     |
| 2   | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 70     |
| 3   | 1003 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | **86** |
| 4   | 1003 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 89     |
| 5   | 1004 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:30:01 | 85     |

Example output:

| uid  | activity  |
| ---- | --------- |
| 1001 | activity2 |
| 1003 | activity1 |
| 1004 | activity1 |
| 1004 | activity2 |

**Explanation:** User 1001's lowest score is 81, so they do not qualify for activity 1. They scored 81 on a 60-minute exam completed in 29 minutes and 59 seconds, so they qualify for activity 2. User 1003's lowest score is 86, so they qualify for activity 1; all their attempts took more than half the allotted time, so they do not qualify for activity 2. User 1004 scored 85 and completed the exam in exactly half the allotted time (30 minutes), qualifying for both activities.

**Approach:** This problem requires calculating the time between two timestamps. Use `TIMESTAMPDIFF()` to get the difference in minutes.

Basic syntax:

Example:

```sql
TIMESTAMPDIFF(MINUTE, start_time, end_time)
```

The first argument to `TIMESTAMPDIFF()` is the unit. Here, `MINUTE` returns the difference in minutes. The second argument is the earlier timestamp, and the third is the later one.

For `activity1`, find users whose scores are at least 85. Writing this part first makes the rest of the query clearer.

```sql
SELECT DISTINCT UID
FROM exam_record
WHERE score >= 85
  AND YEAR (start_time) = '2021'
```

Next, find users who scored above 80 on a hard exam and completed it within half the allotted time:

```sql
SELECT UID
FROM examination_info info
INNER JOIN exam_record record
WHERE info.exam_id = record.exam_id
  AND (TIMESTAMPDIFF(MINUTE, start_time, submit_time)) < (info.duration / 2)
  AND difficulty = 'hard'
  AND score >= 80
```

Then combine the two results with `UNION`. Pay attention to parentheses and the placement of `ORDER BY`, as described in the previous article.

**Answer:**

```sql
SELECT DISTINCT UID UID,
                    'activity1' activity
FROM exam_record
WHERE UID not in
    (SELECT UID
     FROM exam_record
     WHERE score<85
       AND YEAR(submit_time) = 2021 )
UNION
SELECT DISTINCT UID UID,
                    'activity2' activity
FROM exam_record e_r
LEFT JOIN examination_info e_i ON e_r.exam_id = e_i.exam_id
WHERE YEAR(submit_time) = 2021
  AND difficulty = 'hard'
  AND TIMESTAMPDIFF(SECOND, start_time, submit_time) <= duration *30
  AND score>80
ORDER BY UID
```

## Join Queries

### Exam Completions and Question Attempts for Qualified Users (Advanced)

**Description:**

Sample data from `user_info` (`uid`: user ID, `nick_name`: nickname, `achievement`: achievement points, `level`: level, `job`: career path, `register_time`: registration time):

| id  | uid  | nick_name | achievement | level | job        | register_time       |
| --- | ---- | --------- | ----------- | ----- | ---------- | ------------------- |
| 1   | 1001 | User 1    | 3100        | 7     | Algorithms | 2020-01-01 10:00:00 |
| 2   | 1002 | User 2    | 2300        | 7     | Algorithms | 2020-01-01 10:00:00 |
| 3   | 1003 | User 3    | 2500        | 7     | Algorithms | 2020-01-01 10:00:00 |
| 4   | 1004 | User 4    | 1200        | 5     | Algorithms | 2020-01-01 10:00:00 |
| 5   | 1005 | User 5    | 1600        | 6     | C++        | 2020-01-01 10:00:00 |
| 6   | 1006 | User 6    | 2000        | 6     | C++        | 2020-01-01 10:00:00 |

Sample data from `examination_info` (`exam_id`: exam ID, `tag`: category, `difficulty`: difficulty, `duration`: exam length, `release_time`: release time):

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2021-09-01 06:00:00 |
| 2   | 9002    | C++        | hard       | 60       | 2021-09-01 06:00:00 |
| 3   | 9003    | Algorithms | medium     | 80       | 2021-09-01 10:00:00 |

Sample data from `exam_record` (`uid`: user ID, `exam_id`: exam ID, `start_time`: attempt start time, `submit_time`: submission time, `score`: score):

| id  | uid  | exam_id | start_time          | submit_time         | score |
| --- | ---- | ------- | ------------------- | ------------------- | ----- |
| 1   | 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 81    |
| 2   | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 81    |
| 3   | 1003 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 86    |
| 4   | 1003 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:51 | 89    |
| 5   | 1004 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:30:01 | 85    |
| 6   | 1005 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:02 | 85    |
| 7   | 1006 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:21:01 | 84    |
| 8   | 1006 | 9001    | 2021-09-07 10:01:01 | 2021-09-07 10:21:01 | 80    |

Sample data from `practice_record` (`uid`: user ID, `question_id`: question ID, `submit_time`: submission time, `score`: score):

| id  | uid  | question_id | submit_time         | score |
| --- | ---- | ----------- | ------------------- | ----- |
| 1   | 1001 | 8001        | 2021-08-02 11:41:01 | 60    |
| 2   | 1002 | 8001        | 2021-09-02 19:30:01 | 50    |
| 3   | 1002 | 8001        | 2021-09-02 19:20:01 | 70    |
| 4   | 1002 | 8002        | 2021-09-02 19:38:01 | 70    |
| 5   | 1004 | 8001        | 2021-08-02 19:38:01 | 70    |
| 6   | 1004 | 8002        | 2021-08-02 19:48:01 | 90    |
| 7   | 1001 | 8002        | 2021-08-02 19:38:01 | 70    |
| 8   | 1004 | 8002        | 2021-08-02 19:48:01 | 90    |
| 9   | 1004 | 8002        | 2021-08-02 19:58:01 | 94    |
| 10  | 1004 | 8003        | 2021-08-02 19:38:01 | 70    |
| 11  | 1004 | 8003        | 2021-08-02 19:48:01 | 90    |
| 12  | 1004 | 8003        | 2021-08-01 19:38:01 | 80    |

Find level 7 users whose average score on hard SQL exams is above 80. For those users, count their completed exams and question attempts in 2021. Include only users with a completed exam attempt in 2021. Sort by completed exam count in ascending order, then question attempt count in descending order.

Example output:

| uid  | exam_cnt | question_cnt |
| ---- | -------- | ------------ |
| 1001 | 1        | 2            |
| 1003 | 2        | 0            |

Explanation: Users 1001, 1003, 1004, and 1006 have average scores above 80 on hard SQL exams, but only 1001 and 1003 are level 7. User 1001 completed one exam and attempted two questions. User 1003 completed exams 9001 and 9002 and attempted no questions, so the count is 0.

**Approach:**

First, find users who attempted a hard SQL exam:

```sql
SELECT
	record.uid
FROM
	exam_record record
	INNER JOIN examination_info e_info ON record.exam_id = e_info.exam_id
	JOIN user_info u_info ON record.uid = u_info.uid
WHERE
	e_info.tag = 'SQL'
	AND e_info.difficulty = 'hard'
```

Then add the remaining conditions from the prompt.

There are two important details:

1. Do not place `YEAR(submit_time) = 2021` at the end; put it in the `ON` condition. A left join preserves every row from the left table and fills unmatched right-side columns with `NULL`. Filtering by year in `ON` ensures only rows from 2021 are joined, while preserving users with no question attempts. For example, user 1001 completed an exam in 2021 but did not practice any questions. Filtering at the end would exclude this user.

2. Use `COUNT(DISTINCT er.exam_id)` and `COUNT(DISTINCT pr.id)` because the left join can produce duplicate rows.

**Answer:**

```sql
SELECT er.uid AS UID,
       count(DISTINCT er.exam_id) AS exam_cnt,
       count(DISTINCT pr.id) AS question_cnt
FROM exam_record er
LEFT JOIN practice_record pr ON er.uid = pr.uid
AND YEAR (er.submit_time)= 2021
AND YEAR (pr.submit_time)= 2021
WHERE er.uid IN
    (SELECT er.uid
     FROM exam_record er
     LEFT JOIN examination_info ei ON er.exam_id = ei.exam_id
     LEFT JOIN user_info ui ON er.uid = ui.uid
     WHERE tag = 'SQL'
       AND difficulty = 'hard'
       AND LEVEL = 7
     GROUP BY er.uid
     HAVING avg(score) > 80)
GROUP BY er.uid
ORDER BY exam_cnt,
         question_cnt DESC
```

You may wonder why user 1003 still has two exam records even though the conditions include `tag = 'SQL' AND difficulty = 'hard'`, when one record is for a C++ exam. This is due to `LEFT JOIN`: it preserves all rows from the left table, even when no row matches in the right table.

### Activity for Level 6 and 7 Users (Advanced)

**Description:**

Sample data from `user_info` (`uid`: user ID, `nick_name`: nickname, `achievement`: achievement points, `level`: level, `job`: career path, `register_time`: registration time):

| id  | uid  | nick_name | achievement | level | job        | register_time       |
| --- | ---- | --------- | ----------- | ----- | ---------- | ------------------- |
| 1   | 1001 | User 1    | 3100        | 7     | Algorithms | 2020-01-01 10:00:00 |
| 2   | 1002 | User 2    | 2300        | 7     | Algorithms | 2020-01-01 10:00:00 |
| 3   | 1003 | User 3    | 2500        | 7     | Algorithms | 2020-01-01 10:00:00 |
| 4   | 1004 | User 4    | 1200        | 5     | Algorithms | 2020-01-01 10:00:00 |
| 5   | 1005 | User 5    | 1600        | 6     | C++        | 2020-01-01 10:00:00 |
| 6   | 1006 | User 6    | 2600        | 7     | C++        | 2020-01-01 10:00:00 |

Sample data from `examination_info` (`exam_id`: exam ID, `tag`: category, `difficulty`: difficulty, `duration`: exam length, `release_time`: release time):

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2021-09-01 06:00:00 |
| 2   | 9002    | C++        | easy       | 60       | 2021-09-01 06:00:00 |
| 3   | 9003    | Algorithms | medium     | 80       | 2021-09-01 10:00:00 |

Sample data from `exam_record` (`uid`: user ID, `exam_id`: exam ID, `start_time`: attempt start time, `submit_time`: submission time, `score`: score):

| uid  | exam_id | start_time          | submit_time         | score  |
| ---- | ------- | ------------------- | ------------------- | ------ |
| 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 78     |
| 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 81     |
| 1005 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:30:01 | 85     |
| 1005 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:02 | 85     |
| 1006 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:21:59 | 84     |
| 1006 | 9001    | 2021-09-07 10:01:01 | 2021-09-07 10:21:01 | 81     |
| 1002 | 9001    | 2020-09-01 13:01:01 | 2020-09-01 13:41:01 | 81     |
| 1005 | 9001    | 2021-09-01 14:01:01 | (NULL)              | (NULL) |

Sample data from `practice_record` (`uid`: user ID, `question_id`: question ID, `submit_time`: submission time, `score`: score):

| uid  | question_id | submit_time         | score |
| ---- | ----------- | ------------------- | ----- |
| 1001 | 8001        | 2021-08-02 11:41:01 | 60    |
| 1004 | 8001        | 2021-08-02 19:38:01 | 70    |
| 1004 | 8002        | 2021-08-02 19:48:01 | 90    |
| 1001 | 8002        | 2021-08-02 19:38:01 | 70    |
| 1004 | 8002        | 2021-08-02 19:48:01 | 90    |
| 1006 | 8002        | 2021-08-04 19:58:01 | 94    |
| 1006 | 8003        | 2021-08-03 19:38:01 | 70    |
| 1006 | 8003        | 2021-08-02 19:48:01 | 90    |
| 1006 | 8003        | 2020-08-01 19:38:01 | 80    |

For each level 6 or 7 user, count the total active months, active days in 2021, active exam days in 2021, and active question days in 2021. Sort by total active months and then active days in 2021, both in descending order. The sample output is:

| uid  | act_month_total | act_days_2021 | act_days_2021_exam |
| ---- | --------------- | ------------- | ------------------ |
| 1006 | 3               | 4             | 1                  |
| 1001 | 2               | 2             | 1                  |
| 1005 | 1               | 1             | 1                  |
| 1002 | 1               | 0             | 0                  |
| 1003 | 0               | 0             | 0                  |

**Explanation:** There are five level 6 or 7 users. User 1006 was active in September 2021, August 2021, and August 2020, for three months total. They were active on four days in 2021: September 7, August 4, August 3, and August 2. They were active in the exam area for one day (September 7) and in the question practice area for three days.

**Approach:**

The key is using `CASE WHEN THEN`; otherwise, multiple `LEFT JOIN` clauses would produce many result rows.

`CASE WHEN THEN` is a conditional expression that returns different results based on specified conditions.

Syntax:

```sql
CASE
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    ...
    ELSE result
END
```

You can add multiple `WHEN` clauses. Each has a condition and a result. A condition can be any logical expression; if it is true, its result is returned.

The `ELSE` clause is optional and specifies the default result when no condition matches. If omitted, the expression returns `NULL`.

Example:

```sql
SELECT score,
    CASE
        WHEN score >= 90 THEN 'Excellent'
        WHEN score >= 80 THEN 'Good'
        WHEN score >= 60 THEN 'Pass'
        ELSE 'Fail'
    END AS grade
FROM student_scores;
```

In this example, `CASE WHEN THEN` returns a grade based on the student's score. Scores of at least 90 return "Excellent," at least 80 return "Good," at least 60 return "Pass," and lower scores return "Fail."

With this syntax in mind, return the distinct active-day counts required by the problem:

```sql
count(distinct act_month) as act_month_total,
count(distinct case when year(act_time)='2021'then act_day end) as act_days_2021,
count(distinct case when year(act_time)='2021' and tag='exam' then act_day end) as act_days_2021_exam,
count(distinct case when year(act_time)='2021' and tag='question'then act_day end) as act_days_2021_question
```

The `tag` labels each activity so the query can distinguish exams from questions.

Find users' exam attempts:

```sql
SELECT
		uid,
		exam_id AS ans_id,
		start_time AS act_time,
		date_format( start_time, '%Y%m' ) AS act_month,
		date_format( start_time, '%Y%m%d' ) AS act_day,
		'exam' AS tag
	FROM
		exam_record
```

Then find users' question attempts:

```sql
SELECT
		uid,
		question_id AS ans_id,
		submit_time AS act_time,
		date_format( submit_time, '%Y%m' ) AS act_month,
		date_format( submit_time, '%Y%m%d' ) AS act_day,
		'question' AS tag
	FROM
		practice_record
```

Finally, combine the two results with `UNION ALL` and sort the output. This follows a divide-and-conquer approach.

**Answer:**

```sql
SELECT user_info.uid,
       count(DISTINCT act_month) AS act_month_total,
       count(DISTINCT CASE
                          WHEN YEAR (act_time)= '2021' THEN act_day
                      END) AS act_days_2021,
       count(DISTINCT CASE
                          WHEN YEAR (act_time)= '2021'
                               AND tag = 'exam' THEN act_day
                      END) AS act_days_2021_exam,
       count(DISTINCT CASE
                          WHEN YEAR (act_time)= '2021'
                               AND tag = 'question' THEN act_day
                      END) AS act_days_2021_question
FROM
  (SELECT UID,
          exam_id AS ans_id,
          start_time AS act_time,
          date_format(start_time, '%Y%m') AS act_month,
          date_format(start_time, '%Y%m%d') AS act_day,
          'exam' AS tag
   FROM exam_record
   UNION ALL SELECT UID,
                    question_id AS ans_id,
                    submit_time AS act_time,
                    date_format(submit_time, '%Y%m') AS act_month,
                    date_format(submit_time, '%Y%m%d') AS act_day,
                    'question' AS tag
   FROM practice_record) total
RIGHT JOIN user_info ON total.uid = user_info.uid
WHERE user_info.LEVEL IN (6,
                          7)
GROUP BY user_info.uid
ORDER BY act_month_total DESC,
         act_days_2021 DESC
```

<!-- @include: @article-footer.snippet.md -->
