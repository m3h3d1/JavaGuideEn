---
title: A Thousand Lines of MySQL Notes
description: A concise MySQL reference covering database and table operations, SQL syntax, indexes, views, stored procedures, and triggers.
category: Database
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MySQL notes, MySQL commands, SQL syntax, database operations, table operations, indexes, views, stored procedures, triggers
---

> Original article: <https://shockerli.net/post/1000-line-mysql-note/>. JavaGuide lightly edited the formatting and added a table of contents.

A useful reference to keep handy for quick lookup.

### Basic operations

```sql
/* Windows service */
-- Start MySQL
			net start mysql
-- Create a Windows service
				sc create mysql binPath= mysqld_bin_path (note: include a space between the equals sign and the value)
/* Connect to and disconnect from the server */
-- Connect to MySQL
				mysql -h host -P port -u username -p password
-- Show running threads
				SHOW PROCESSLIST
-- Show system variables
				SHOW VARIABLES
```

### Database operations

```sql
/* Database operations */
-- Show the current database
    SELECT DATABASE();
-- Show the current time, username, and database version
    SELECT now(), user(), version();
-- Create a database
    CREATE DATABASE[ IF NOT EXISTS] db_name database_options
    Database options:
        CHARACTER SET charset_name
        COLLATE collation_name
-- Show databases
    SHOW DATABASES[ LIKE 'PATTERN']
-- Show the current database definition
    SHOW CREATE DATABASE db_name
-- Modify database options
    ALTER DATABASE db_name options
-- Drop a database
    DROP DATABASE[ IF EXISTS] db_name
        This also removes the database directory and its contents.
```

### Table operations

```sql
/* Table operations */
-- Create a table
    CREATE [TEMPORARY] TABLE[ IF NOT EXISTS] [db_name.]table_name ( table_definition )[ table_options]
        Each column must have a data type.
        Do not add a comma after the last column.
        TEMPORARY creates a temporary table that is dropped when the session ends.
        Column definition:
            column_name data_type [NOT NULL | NULL] [DEFAULT default_value] [AUTO_INCREMENT] [UNIQUE [KEY] | [PRIMARY] KEY] [COMMENT 'string']
-- Table options
    -- Character set
        CHARSET = charset_name
        If no character set is specified, the table uses the database character set.
    -- Storage engine
        ENGINE = engine_name
        Storage engines use different data structures to manage tables, so their behavior and features differ.
        Common engines: InnoDB, MyISAM, Memory/Heap, BDB, Merge, Example, CSV, MaxDB, Archive.
        Engines store table definitions and data in different ways.
        MyISAM files: .frm table definition, .MYD table data, .MYI indexes.
        InnoDB files: .frm table definition, tablespace data, and log files.
        SHOW ENGINES -- Show storage engine status.
        SHOW ENGINE engine_name {LOGS|STATUS} -- Show storage engine logs or status.
    -- Initial auto-increment value
        AUTO_INCREMENT = row_count
    -- Data directory
        DATA DIRECTORY = 'directory'
    -- Index directory
        INDEX DIRECTORY = 'directory'
    -- Table comment
        COMMENT = 'string'
    -- Partitioning options
        PARTITION BY ... (see the manual for details)
-- Show all tables
    SHOW TABLES[ LIKE 'pattern']
    SHOW TABLES FROM  db_name
-- Show the table definition
    SHOW CREATE TABLE table_name (shows more detail)
    DESC table_name / DESCRIBE table_name / EXPLAIN table_name / SHOW COLUMNS FROM table_name [LIKE 'PATTERN']
    SHOW TABLE STATUS [FROM db_name] [LIKE 'pattern']
-- Alter a table
    -- Change table options
        ALTER TABLE table_name table_options
        eg: ALTER TABLE table_name ENGINE=MYISAM;
    -- Rename a table
        RENAME TABLE old_name TO new_name
        RENAME TABLE old_name TO db_name.table_name (moves the table to another database)
        -- RENAME can swap two table names.
    -- Change table columns (see 13.1.2, ALTER TABLE syntax)
        ALTER TABLE table_name operation
        -- Operations
            ADD[ COLUMN] column_definition       -- Add a column
                AFTER column_name          -- Add after this column
                FIRST               -- Add as the first column
            ADD PRIMARY KEY(column_name)   -- Create a primary key
            ADD UNIQUE [index_name] (column_name) -- Create a unique index
            ADD INDEX [index_name] (column_name) -- Create a regular index
            DROP[ COLUMN] column_name      -- Drop a column
            MODIFY[ COLUMN] column_name column_attributes -- Change column attributes, but not its name (include all existing attributes)
            CHANGE[ COLUMN] old_name new_name column_attributes -- Rename a column
            DROP PRIMARY KEY    -- Drop the primary key (remove its AUTO_INCREMENT attribute first)
            DROP INDEX index_name -- Drop an index
            DROP FOREIGN KEY foreign_key -- Drop a foreign key
-- Drop a table
    DROP TABLE[ IF EXISTS] table_name ...
-- Truncate a table
    TRUNCATE [TABLE] table_name
-- Copy a table definition
    CREATE TABLE table_name LIKE source_table
-- Copy a table definition and data
    CREATE TABLE table_name [AS] SELECT * FROM source_table
-- Check tables for errors
    CHECK TABLE tbl_name [, tbl_name] ... [option] ...
-- Optimize a table
    OPTIMIZE [LOCAL | NO_WRITE_TO_BINLOG] TABLE tbl_name [, tbl_name] ...
-- Repair a table
    REPAIR [LOCAL | NO_WRITE_TO_BINLOG] TABLE tbl_name [, tbl_name] ... [QUICK] [EXTENDED] [USE_FRM]
-- Analyze a table
    ANALYZE [LOCAL | NO_WRITE_TO_BINLOG] TABLE tbl_name [, tbl_name] ...
```

### Data operations

```sql
/* Data operations */ ------------------
-- Insert
    INSERT [INTO] table_name [(column_list)] VALUES (value_list)[, (value_list), ...]
        -- Omit the column list if the values cover all columns in order.
        -- Multiple rows can be inserted at once.
        REPLACE is similar to INSERT, but replaces an existing row that matches a primary or unique key; if no row matches, it inserts a new one.
    INSERT [INTO] table_name SET column_name=value[, column_name=value, ...]
-- Select
    SELECT column_list FROM table_name[ other_clauses]
        -- Columns can come from multiple tables.
        -- Other clauses are optional.
        -- Use * in place of the column list to select all columns.
-- Delete
    DELETE FROM table_name[ condition_clause]
        Without a condition, all rows are deleted.
-- Update
    UPDATE table_name SET column_name=new_value[, column_name=new_value] [condition]
```

### Character sets and encodings

```sql
/* Character sets and encodings */ ------------------
-- Character sets can be set at the server, database, table, and column levels.
-- The data encoding does not have to match the client encoding.
SHOW VARIABLES LIKE 'character_set_%'   -- Show character set variables
    character_set_client        Encoding used by the client when sending data to the server
    character_set_results       Encoding used by the server when returning results to the client
    character_set_connection    Connection encoding
SET variable_name = value
    SET character_set_client = gbk;
    SET character_set_results = gbk;
    SET character_set_connection = gbk;
SET NAMES GBK;  -- Equivalent to setting the three variables above.
-- Collations
    Collations define sorting and comparison rules.
    SHOW CHARACTER SET [LIKE 'pattern']/SHOW CHARSET [LIKE 'pattern']   Show character sets
    SHOW COLLATION [LIKE 'pattern']     Show collations
    CHARSET character_set     Set the character set
    COLLATE collation         Set the collation
```

### Data types (column types)

```sql
/* Data types (column types) */ ------------------
1. Numeric types
-- a. Integer types ----------
    Type        Bytes    Range (signed)
    tinyint     1 byte   -128 ~ 127      unsigned: 0 ~ 255
    smallint    2 bytes  -32768 ~ 32767
    mediumint   3 bytes  -8388608 ~ 8388607
    int         4 bytes
    bigint      8 bytes
    int(M): M is the display width.
    - Integer types are signed by default; use the unsigned attribute for nonnegative values.
    - Display width can pad values with leading zeroes when zerofill is used.
        Example: inserting '123' into int(5) displays '00123'.
    - Use the smallest type that meets the requirements.
    - 1 represents true and 0 represents false. MySQL has no Boolean type; Boolean values are commonly stored as 0 and 1 in tinyint(1).
-- b. Floating-point types ----------
    Type                 Bytes    Range
    float (single precision)  4 bytes
    double (double precision) 8 bytes
    Floating-point types support unsigned and zerofill attributes.
        Unlike integers, zeroes can be padded on both sides.
    Specify the total number of digits and the number of decimal places:
        float(M, D)     double(M, D)
        M is the total number of digits; D is the number of decimal places.
        M and D affect the range; unlike integer types, the range is not fixed.
        M represents the number of digits excluding the decimal point and sign, and also the display width including all displayed characters.
        Scientific notation is supported.
        Floating-point values are approximate.
-- c. Fixed-point types ----------
    decimal -- variable length
    decimal(M, D): M is the total number of digits; D is the number of decimal places.
    Stores exact numeric values, unlike floating-point types, which are approximate.
    Values are stored as strings; every 9 digits use 4 bytes.
2. String types
-- a. char, varchar ----------
    char     Fixed-length string; fast, but may waste space.
    varchar  Variable-length string; saves space, with some overhead.
    M is the maximum length in characters, not bytes.
    Storage size depends on the character encoding.
    char supports up to 255 characters, regardless of encoding.
    varchar supports up to 65535 characters, subject to the encoding.
    A row cannot exceed 65535 bytes.
        utf8: up to 21844 characters; gbk: up to 32766; latin1: up to 65532.
    varchar stores its length: one byte for values under 255 bytes, otherwise two bytes.
    The maximum effective varchar length depends on the maximum row size and character set.
    The maximum effective length is 65532 bytes: one byte is reserved and two bytes store the length, so 65535-1-2=65532.
    Example: For CREATE TABLE tb(c1 int, c2 char(30), c3 varchar(N)) charset=utf8, what is the maximum N? Answer: (65535-1-2-4-30*3)/3.
-- b. blob, text ----------
    blob binary string (byte string)
        tinyblob, blob, mediumblob, longblob
    text nonbinary string (character string)
        tinytext, text, mediumtext, longtext
    text does not require a length when defined and its total length is not calculated.
    text columns cannot have a DEFAULT value.
-- c. binary, varbinary ----------
    Similar to char and varchar, but store binary strings (bytes) rather than character strings.
    char, varchar, and text correspond to binary, varbinary, and blob.
3. Date and time types
    Timestamps are often stored as integers because PHP can format them easily.
    datetime    8 bytes    Date and time     1000-01-01 00:00:00 to 9999-12-31 23:59:59
    date        3 bytes    Date              1000-01-01 to 9999-12-31
    timestamp   4 bytes    Timestamp         19700101000000 to 2038-01-19 03:14:07
    time        3 bytes    Time              -838:59:59 to 838:59:59
    year        1 byte     Year              1901 - 2155
datetime    YYYY-MM-DD hh:mm:ss
timestamp   YY-MM-DD hh:mm:ss
            YYYYMMDDhhmmss
            YYMMDDhhmmss
            YYYYMMDDhhmmss
            YYMMDDhhmmss
date        YYYY-MM-DD
            YY-MM-DD
            YYYYMMDD
            YYMMDD
            YYYYMMDD
            YYMMDD
time        hh:mm:ss
            hhmmss
            hhmmss
year        YYYY
            YY
            YYYY
            YY
4. Enumerations and sets
-- Enumeration (enum) ----------
enum(val1, val2, val3...)
    Select one value from a predefined list of up to 65535 values.
    Values are stored as 2-byte integers (smallint), indexed from 1 in declaration order.
    Values behave like strings but are stored as integers.
    The index of NULL is NULL.
    The index of the invalid empty-string value is 0.
-- Set ----------
set(val1, val2, val3...)
    create table tab ( gender set('male', 'female', 'unspecified') );
    insert into tab values ('male, female');
    A set can have up to 64 distinct members. It is stored as an 8-byte bigint using bit operations.
    Trailing spaces are removed from SET members when the table is created.
```

### Column attributes and constraints

```sql
/* Column attributes and constraints */ ------------------
1. PRIMARY KEY
    - A column that uniquely identifies a row can be a primary key.
    - A table can have only one primary key.
    - Primary key values are unique.
    - Mark a column with primary key, or declare the key after the column list:
        Example: create table tab ( id int, stu varchar(10), primary key (id));
    - Primary key columns cannot contain NULL.
    - A primary key can contain multiple columns; declare it after the column list:
        Example: create table tab ( id int, stu varchar(10), age int, primary key (stu, age));
2. UNIQUE index (unique constraint)
    Prevents duplicate values in a column.
3. NULL constraint
    NULL is a column attribute, not a data type. It represents the absence of a value.
    It determines whether a column can contain NULL.
    NULL allows NULL values and is the default.
    NOT NULL disallows NULL values.
    insert into tab values (null, 'val');
        -- This sets the first column to NULL, if that column allows NULL.
4. DEFAULT attribute
    Sets the column's default value.
    insert into tab values (default, 'val');    -- Explicitly use the default value.
    create table tab ( add_time timestamp default current_timestamp );
        -- Use the current timestamp as the default value.
        current_date, current_time
5. AUTO_INCREMENT constraint
    An auto-increment column must be indexed (primary key or unique).
    A table can have only one auto-increment column.
    The default starting value is 1. Set it with the table option auto_increment = x or alter table tbl auto_increment = x;
6. COMMENT
    Example: create table tab ( id int ) comment 'table comment';
7. FOREIGN KEY constraint
    Enforces referential integrity between parent and child tables.
    alter table t1 add constraint `t1_t2_fk` foreign key (t1_id) references t2(id);
        -- Link t1.t1_id to t2.id.
        -- Name a foreign key with CONSTRAINT.
    A table containing a foreign key is the child; the referenced table is the parent.
    Foreign keys preserve data consistency and integrity by constraining child-table values.
    MySQL foreign key constraints are supported by the InnoDB engine.
    Syntax:
    foreign key (foreign_key_column) references parent_table (referenced_column) [ON DELETE action] [ON UPDATE action]
    A child foreign key must match an existing parent value. It can be NULL if the column is not declared NOT NULL.
    If no ON UPDATE or ON DELETE action is specified, the parent operation is rejected.
    ON UPDATE and ON DELETE support these actions:
    1. CASCADE: Update matching child foreign keys when the parent key changes; delete matching child rows when the parent row is deleted.
    2. SET NULL: Set matching child foreign keys to NULL when the parent key changes or row is deleted. The child column must allow NULL.
    3. RESTRICT: Reject parent deletes and updates.
    Foreign keys are supported only by InnoDB.

```

### Table design guidelines

```sql
/* Table design guidelines */ ------------------
    -- Normal Format, NF
        - Store information about one entity in each table.
        - Give each table an ID column as its primary key.
        - Use an ID primary key and atomic columns.
    -- 1NF, First Normal Form
        A table is in first normal form when each column contains an indivisible value.
    -- 2NF, Second Normal Form
        A table in first normal form must have no partial dependencies.
        A single-column key avoids partial dependencies caused by a composite key.
    -- 3NF, Third Normal Form
        A table in second normal form must have no transitive dependencies.
        A transitive dependency occurs when a non-key column depends on another non-key column rather than directly on the primary key.
        Store each entity's data in its own table.
```

### SELECT

```sql
/* SELECT */ ------------------
SELECT [ALL|DISTINCT] select_expr FROM -> WHERE -> GROUP BY [aggregate_function] -> HAVING -> ORDER BY -> LIMIT
a. select_expr
    -- Use * to select all columns.
        select * from tb;
    -- Expressions can be formulas, function calls, or column references.
        select stu, 29+25, now() from tb;
    -- Use aliases to simplify column labels and avoid duplicate names.
        - Use the AS keyword; it is optional.
        select stu+10 as add10 from tb;
b. FROM clause
    Specifies the source of the query.
    -- Tables can be aliased with AS.
        SELECT * FROM tb1 AS tt, tb2 AS bb;
    -- Multiple tables can follow FROM.
        -- Their rows are combined into a Cartesian product.
        SELECT * FROM tb1, tb2;
    -- Hint to the optimizer which indexes to use or ignore.
        USE INDEX、IGNORE INDEX、FORCE INDEX
        SELECT * FROM table1 USE INDEX (key1,key2) WHERE key1=1 AND key2=2 AND key3=3;
        SELECT * FROM table1 IGNORE INDEX (key3) WHERE key1=1 AND key2=2 AND key3=3;
c. WHERE clause
    -- Filters rows from the FROM data source.
    -- Integer 1 represents true; 0 represents false.
    -- Expressions consist of operators and operands.
        -- Operands: variables (columns), values, and function results.
        -- Operators:
            =, <=>, <>, !=, <=, <, >=, >, !, &&, ||,
            in (not) null, (not) like, (not) in, (not) between and, is (not), and, or, not, xor
            is/is not with true/false/unknown tests a value's truth value.
            <=> behaves like = and can compare NULL values.
d. GROUP BY clause
    GROUP BY column/alias [sort direction]
    Groups are sorted; use ASC for ascending and DESC for descending order.
    The following aggregate functions are commonly used with GROUP BY:
    count returns the number of non-NULL values; count(*) and count(column)
    sum returns the total.
    max returns the maximum.
    min returns the minimum.
    avg returns the average.
    group_concat returns a string containing the concatenated non-NULL values in a group.
e. HAVING clause
    Similar to WHERE, but applied at a different stage.
    WHERE filters source rows before grouping.
    HAVING filters the grouped results.
    HAVING columns must be selected; WHERE columns must exist in the source tables.
    WHERE cannot use column aliases, but HAVING can, because column values may not yet be determined when WHERE runs.
    WHERE cannot use aggregate functions; use HAVING to filter aggregate results.
    The SQL standard requires HAVING to reference a GROUP BY column or a column used by an aggregate function.
f. ORDER BY clause
    order by column/alias sort_direction [,column/alias sort_direction]...
    ASC sorts ascending; DESC sorts descending.
    Multiple columns can be used for sorting.
g. LIMIT clause
    Limits the number of rows in the processed result. Row indexes start at 0 in result order.
    limit offset, row_count
    If offset is omitted, the result starts at index 0: limit row_count
h. DISTINCT and ALL options
    distinct removes duplicate rows.
    The default is all, which returns every row.
```

### UNION

```sql
/* UNION */ ------------------
      Combines the results of multiple SELECT queries into one result set.
      SELECT ... UNION [ALL|DISTINCT] SELECT ...
      DISTINCT is the default, so returned rows are unique.
      Parenthesize each SELECT query.
      When using ORDER BY, combine it with LIMIT.
      Each SELECT query must return the same number of columns.
      Column counts and types should match; result column names come from the first SELECT.
```

### Subqueries

```sql
/* Subqueries */ ------------------
    - Enclose subqueries in parentheses.
-- FROM subqueries
    FROM expects a table, so a subquery result must have an alias.
    - Simplifies conditions within each query.
    - A FROM subquery creates a temporary table, which can release locks on the original table.
    - A table subquery returns a table.
    select * from (select * from tb where id>0) as subfrom where id>1;
-- WHERE subqueries
    - A scalar subquery returns one value.
    - A subquery alias is not required.
    - A table used inside a WHERE subquery cannot be updated directly.
    select * from tb where money = (select max(money) from tb);
    -- Column subqueries
        The subquery returns one column.
        Use IN or NOT IN to query its results.
        EXISTS and NOT EXISTS conditions
            Return 1 or 0 depending on whether the subquery returns rows; commonly used as predicates.
            select column1 from t1 where exists (select * from t2);
    -- Row subqueries
        The condition compares a row.
        select * from t1 where (id, gender) in (select id, gender from t2);
        Row constructors: (col1, col2, ...) or ROW(col1, col2, ...)
        They are commonly compared with subqueries that return two or more columns.
    -- Special operators
    != all()    Equivalent to NOT IN.
    = some()    Equivalent to IN. ANY is an alias for SOME.
    != some()   Not equivalent to NOT IN; the value differs from at least one value.
    ALL and SOME can be used with other operators.
```

### Joins

```sql
/* Joins */ ------------------
    Combines columns from multiple tables; a join condition can be specified.
-- Inner join
    - Inner join is the default; INNER can be omitted.
    - Only matching rows are returned; unmatched rows do not appear.
    ON specifies the join condition, using an expression similar to WHERE. It can be omitted (equivalent to true).
    WHERE can also specify the join condition.
    USING is available when join columns have the same name: using(column_name)
    -- Cross join
        An inner join without a condition.
        select * from tb1 cross join tb2;
-- Outer join
    - Rows from one side are returned even when there is no match.
    -- Left outer join
        Unmatched left-table rows are returned, with NULLs for right-table columns.
    -- Right outer join
        Unmatched right-table rows are returned, with NULLs for left-table columns.
-- Natural join
    Automatically determines the join condition.
    Equivalent to omitting USING; columns with matching names are joined automatically.
    natural join
    natural left join
    natural right join
select info.id, info.name, info.stu_num, extra_info.hobby, extra_info.sex from info, extra_info where info.stu_num = extra_info.stu_id;
```

### TRUNCATE

```sql
/* TRUNCATE */ ------------------
TRUNCATE [TABLE] tbl_name
Removes all rows by dropping and recreating the table.
Differences:
1. TRUNCATE drops and recreates the table; DELETE removes rows one by one.
2. TRUNCATE resets AUTO_INCREMENT; DELETE does not.
3. TRUNCATE does not report the number of rows removed; DELETE does.
4. TRUNCATE preserves partitions on a partitioned table.
```

### Backup and restore

```sql
/* Backup and restore */ ------------------
Back up the schema and table data with mysqldump.
-- Export
mysqldump [options] db_name [tables]
mysqldump [options] ---database DB1 [DB2 DB3...]
mysqldump [options] --all--database
1. Export one table:
　　mysqldump -uusername -ppassword db_name table_name > file_name (D:/a.sql)
2. Export multiple tables:
　　mysqldump -uusername -ppassword db_name table1 table2 table3 > file_name (D:/a.sql)
3. Export all tables:
　　mysqldump -uusername -ppassword db_name > file_name (D:/a.sql)
4. Export a database:
　　mysqldump -uusername -ppassword --lock-all-tables --database db_name > file_name (D:/a.sql)
Use -w to add a WHERE condition.
-- Import
1. From a MySQL session:
　　source backup_file
2. Without logging in:
　　mysql -uusername -ppassword db_name < backup_file
```

### Views

```sql
What is a view?
    A view is a virtual table defined by a query. Like a regular table, it has named columns and rows, but it does not store data values. Its rows and columns come from the tables referenced by its defining query and are generated when accessed.
    A view has a table definition file but no data file.
    A view acts like a filter over its underlying tables. Its definition can reference tables in the current or another database, or other views. Queries through views are generally unrestricted, while updates through views have some limitations.
    A view is a query stored in the database. It can hide sensitive data (for example, show names and addresses from a social insurance table without exposing identification numbers or salaries) and make complex queries easier to understand and use.
-- Create a view
CREATE [OR REPLACE] [ALGORITHM = {UNDEFINED | MERGE | TEMPTABLE}] VIEW view_name [(column_list)] AS select_statement
    - A view name must be unique and cannot match a table name.
    - View columns can use names from the SELECT statement or names specified explicitly.
    - Specify the view algorithm with ALGORITHM.
    - If column_list is specified, it must contain as many names as the SELECT query returns.
-- Show the definition
    SHOW CREATE VIEW view_name
-- Drop a view
    - Dropping a view does not remove the underlying data.
    - Multiple views can be dropped at once.
    DROP VIEW [IF EXISTS] view_name ...
-- Alter a view
    - Views are not usually altered because not all view updates map to the underlying tables.
    ALTER VIEW view_name [(column_list)] AS select_statement
-- Uses of views
    1. Simplify business logic.
    2. Hide the underlying table structure from clients.
-- View algorithms (ALGORITHM)
    MERGE       Merge
        Merge the view query with the outer query before execution.
    TEMPTABLE   Temporary table
        Execute the view query to create a temporary table, then run the outer query.
    UNDEFINED   Unspecified (default); MySQL chooses the algorithm.
```

### Transactions

```sql
A transaction is a logical group of operations that either all succeed or all fail.
    - Allows a sequence of SQL statements to succeed or roll back as a unit.
    - Transactions help maintain database integrity.
    - Requires a storage engine such as InnoDB or BDB that supports transactions and autocommit.
    - InnoDB is a transaction-safe engine.
-- Start a transaction
    START TRANSACTION; or BEGIN;
    After a transaction starts, executed SQL statements belong to it.
-- Commit a transaction
    COMMIT;
-- Roll back a transaction
    ROLLBACK;
    If an operation fails, rollback restores the state from before the transaction.
-- Transaction properties
    1. Atomicity
        A transaction is indivisible: either all its operations happen or none do.
    2. Consistency
        Data integrity is preserved before and after a transaction.
        - Data is consistent at the start and end of a transaction.
        - Operations within the transaction form a continuous unit.
    3. Isolation
        Concurrent transactions do not interfere with one another; their data is isolated.
    4. Durability
        Once committed, a transaction's changes are permanent.
-- Using transactions
    1. Use a table type supported by transactions.
    2. Start a transaction before a group of related operations.
    3. Commit if all operations succeed; otherwise, roll back to the transaction's starting point.
-- How transactions work
    Transactions use InnoDB's autocommit feature.
    Normally, each MySQL statement is committed and visible to other clients.
    A transaction temporarily disables autocommit; COMMIT persists its changes.
-- Notes
    1. Data definition language (DDL) statements cannot be rolled back, including statements that create, drop, or alter databases, tables, or stored routines.
    2. Transactions cannot be nested.
-- Savepoints
    SAVEPOINT savepoint_name -- Set a savepoint.
    ROLLBACK TO SAVEPOINT savepoint_name -- Roll back to a savepoint.
    RELEASE SAVEPOINT savepoint_name -- Remove a savepoint.
-- Configure InnoDB autocommit
    SET autocommit = 0|1;   0 disables autocommit; 1 enables it.
    - With autocommit disabled, ordinary changes are not visible to other clients until committed.
    - Disabling autocommit can also start a transaction. Unlike START TRANSACTION,
        SET autocommit changes the connection setting until it is changed again.
        START TRANSACTION records the current state; after commit or rollback, another transaction must be started.

```

### Table locks

```sql
/* Table locks */
Table locks prevent other clients from reading or writing a table improperly.
MyISAM supports table locks; InnoDB supports row locks.
-- Lock
    LOCK TABLES tbl_name [AS alias]
-- Unlock
    UNLOCK TABLES
```

### Triggers

```sql
/* Triggers */ ------------------
    A trigger is a named database object associated with a table. It runs when a specified event occurs on that table.
    Events: row insertion, update, and deletion.
-- Create a trigger
CREATE TRIGGER trigger_name trigger_time trigger_event ON tbl_name FOR EACH ROW trigger_stmt
    Parameters:
    trigger_time specifies when the trigger runs: BEFORE or AFTER the statement that activates it.
    trigger_event specifies the statement type that activates the trigger:
        INSERT: activated when a row is inserted.
        UPDATE: activated when a row is updated.
        DELETE: activated when a row is deleted.
    tbl_name is the table being monitored. It must be a permanent table; triggers cannot be associated with TEMPORARY tables or views.
    trigger_stmt is executed when the trigger runs. Use a BEGIN...END compound statement for multiple statements.
-- Drop a trigger
DROP TRIGGER [schema_name.]trigger_name
Use OLD and NEW to refer to the previous and new row values:
    UPDATE: OLD is the row before the update; NEW is the row after it.
    DELETE: only OLD is available.
    INSERT: only NEW is available.
-- Note
    1. A table cannot have two triggers with the same timing and event.
-- String concatenation functions
concat(str1,str2,...])
concat_ws(separator,str1,str2,...)
-- Conditional statement
if condition then
    statements
elseif condition then
    statements
else
    statements
end if;
-- Change the outer statement delimiter
delimiter custom_delimiter
    SQL statements
custom_delimiter
delimiter ;     -- Restore the semicolon delimiter.
-- Statement block
begin
    statements
end
-- Special behavior
1. Inserting a row activates the trigger.
2. INSERT ... ON DUPLICATE KEY UPDATE activates:
    For a new row: BEFORE INSERT, AFTER INSERT.
    For a duplicate row that is updated: BEFORE INSERT, BEFORE UPDATE, AFTER UPDATE.
    For a duplicate row with no change: BEFORE INSERT, BEFORE UPDATE.
3. REPLACE activates BEFORE INSERT, BEFORE DELETE, AFTER DELETE, and AFTER INSERT when a row already exists.
```

### SQL programming

```sql
/* SQL programming */ ------------------
--// Local variables ----------
-- Declare a variable
    declare var_name[,...] type [default value]
    Declares local variables. Add a DEFAULT clause to provide an initial value; the value can be an expression, not just a constant. Without DEFAULT, the initial value is NULL.
-- Assign a value
    Use SET and SELECT ... INTO statements to assign values to variables.
    - Note: functions can use user-defined session variables.
--// User-defined variables ----------
-- Define and assign
The SET statement can define and assign a variable.
set @var = value;
SELECT ... INTO can also initialize and assign variables. The SELECT query must return one row, but can return multiple columns; the number of variables must match the number of columns.
An assignment can also be treated as an expression and run with SELECT. Use := to avoid interpreting = as a comparison operator. SET supports both = and :=.
select @var:=20;
select @v1:=id, @v2=name from t1 limit 1;
select * from tbl_name where @var:=30;
SELECT ... INTO can assign query results to variables.
    -| select max(height) into @max_height from tb;
-- User-defined variable names
To avoid conflicts with system identifiers (usually column names) in SELECT statements, user-defined variables start with @.
@var=10;
    - Variables remain defined for the session, from login to disconnect.
--// Control structures ----------
-- IF statement
if search_condition then
    statement_list
[elseif search_condition then
    statement_list]
...
[else
    statement_list]
end if;
-- CASE statement
CASE value WHEN [compare-value] THEN result
[WHEN [compare-value] THEN result ...]
[ELSE result]
END
-- WHILE loop
[begin_label:] while search_condition do
    statement_list
end while [end_label];
-- Use matching labels to exit a WHILE loop early.
    -- Loop control
        LEAVE exits the loop.
        ITERATE starts the next iteration.
        Use the label to specify which loop to exit or continue.
--// Built-in functions ----------
-- Numeric functions
abs(x)          -- Absolute value: abs(-10.9) = 10.
format(x, d)    -- Format with thousands separators: format(1234567.456, 2) = 1,234,567.46.
ceil(x)         -- Round up: ceil(10.1) = 11.
floor(x)        -- Round down: floor (10.1) = 10.
round(x)        -- Round to the nearest integer.
mod(m, n)       -- Remainder: m%n or m mod n; 10%3=1.
pi()            -- Return pi.
pow(m, n)       -- m^n
sqrt(x)         -- Square root.
rand()          -- Random number.
truncate(x, d)  -- Truncate to d decimal places.
-- Date and time functions
now(), current_timestamp();     -- Current date and time.
current_date();                 -- Current date.
current_time();                 -- Current time.
date('yyyy-mm-dd hh:ii:ss');    -- Extract the date.
time('yyyy-mm-dd hh:ii:ss');    -- Extract the time.
date_format('yyyy-mm-dd hh:ii:ss', '%d %y %a %d %m %b %j'); -- Format a date and time.
unix_timestamp();               -- Return a Unix timestamp.
from_unixtime();                -- Convert a timestamp to a date and time.
-- String functions
length(string)          -- String length in bytes.
char_length(string)     -- Number of characters in the string.
substring(str, position [,length])      -- Return length characters from str, starting at position.
replace(str ,search_str ,replace_str)   -- Replace search_str with replace_str in str.
instr(string ,substring)    -- Return the first position of substring in string.
concat(string [,...])   -- Concatenate strings.
charset(str)            -- Return the string's character set.
lcase(string)           -- Convert to lowercase.
left(string, length)    -- Return the leftmost length characters.
load_file(file_name)    -- Read content from a file.
locate(substring, string [,start_position]) -- Like instr, with an optional start position.
lpad(string, length, pad)   -- Pad the start of the string until it reaches length.
ltrim(string)           -- Remove leading spaces.
repeat(string, count)   -- Repeat the string count times.
rpad(string, length, pad)   -- Pad the end of the string until it reaches length.
rtrim(string)           -- Remove trailing spaces.
strcmp(string1 ,string2)    -- Compare two strings character by character.
-- Control-flow functions
case when [condition] then result [when [condition] then result ...] [else result] end   Multiple branches.
if(expr1,expr2,expr3)  Two branches.
-- Aggregate functions
count()
sum();
max();
min();
avg();
group_concat()
-- Other common functions
md5();
default();
--// Stored functions (user-defined functions) ----------
-- Create
    CREATE FUNCTION function_name (parameter_list) RETURNS return_type
        function_body
    - The function name must be a valid identifier and should not conflict with a keyword.
    - A function belongs to a database. Call it as db_name.function_name, or use the current database.
    - Each parameter has a name and type; separate parameters with commas.
    - The function body can contain MySQL statements, control flow, and variable declarations.
    - Enclose multiple statements in a BEGIN...END block.
    - A RETURN statement is required.
-- Drop
    DROP FUNCTION [IF EXISTS] function_name;
-- Show
    SHOW FUNCTION STATUS LIKE 'partten'
    SHOW CREATE FUNCTION function_name;
-- Alter
    ALTER FUNCTION function_name function_options
--// Stored procedures ----------
-- Definition
A stored procedure is a sequence of SQL statements stored in the database.
A procedure usually implements a business task, such as registration, collecting fees, or processing an order.
A function usually performs a focused operation for use by other statements. A procedure is invoked directly with CALL.
-- Create
CREATE PROCEDURE sp_name (parameter_list)
    procedure_body
Parameter list: unlike function parameters, each procedure parameter must specify a mode.
IN means input.
OUT means output.
INOUT means input and output.
Procedures do not return a value.
```

### Stored procedures

```sql
/* Stored procedures */ ------------------
A stored procedure is a set of executable statements, usually focused on business logic rather than a single function.
Call it with: CALL procedure_name
-- Notes
- Procedures do not return a value.
- They must be called separately, not embedded in another statement.
-- Parameters
IN|OUT|INOUT parameter_name data_type
IN      Input: passes data into the procedure body.
OUT     Output: returns the processed result to the client.
INOUT   Input and output: can pass data in and return a result.
-- Syntax
CREATE PROCEDURE procedure_name (parameter_list)
BEGIN
    procedure_body
END
```

### User and privilege management

```sql
/* User and privilege management */ ------------------
-- Reset the root password
1. Stop the MySQL service.
2.  [Linux] /usr/local/mysql/bin/safe_mysqld --skip-grant-tables &
    [Windows] mysqld --skip-grant-tables
3. use mysql;
4. UPDATE `user` SET PASSWORD=PASSWORD("password") WHERE `user` = "root";
5. FLUSH PRIVILEGES;
User account table: mysql.user
-- Reload privileges
FLUSH PRIVILEGES;
-- Create a user
CREATE USER username IDENTIFIED BY [PASSWORD] password_string
    - Requires the global CREATE USER privilege or INSERT privilege on the mysql database.
    - Creates a user but does not grant privileges.
    - Quote the username, for example: 'user_name'@'192.168.1.1'
    - Quote the password, including numeric-only passwords.
    - Omit PASSWORD to specify a plain-text password. Include PASSWORD to specify a hash returned by PASSWORD().
-- Rename a user
RENAME USER old_user TO new_user
-- Set a password
SET PASSWORD = PASSWORD('password')  -- Set the current user's password.
SET PASSWORD FOR username = PASSWORD('password') -- Set a specified user's password.
-- Drop a user
DROP USER username
-- Grant privileges / add a user
GRANT privilege_list ON table_name TO username [IDENTIFIED BY [PASSWORD] 'password']
    - ALL PRIVILEGES means all privileges.
    - *.* means all tables in all databases.
    - db_name.table_name specifies a table in a database.
    GRANT ALL PRIVILEGES ON `pms`.* TO 'pms'@'%' IDENTIFIED BY 'pms0817';
-- Show privileges
SHOW GRANTS FOR username
    -- Show the current user's privileges.
    SHOW GRANTS; or SHOW GRANTS FOR CURRENT_USER; or SHOW GRANTS FOR CURRENT_USER();
-- Revoke privileges
REVOKE privilege_list ON table_name FROM username
REVOKE ALL PRIVILEGES, GRANT OPTION FROM username   -- Revoke all privileges.
-- Privilege levels
-- To use GRANT or REVOKE, you need the GRANT OPTION privilege and the privileges being granted or revoked.
Global level: applies to all databases on a server; mysql.user
    GRANT ALL ON *.* and REVOKE ALL ON *.* affect only global privileges.
Database level: applies to all objects in a database; mysql.db, mysql.host
    GRANT ALL ON db_name.* and REVOKE ALL ON db_name.* affect only database privileges.
Table level: applies to all columns in a table; mysql.tables_priv
    GRANT ALL ON db_name.tbl_name and REVOKE ALL ON db_name.tbl_name affect only table privileges.
Column level: applies to a single column; mysql.columns_priv
    When using REVOKE, specify the same columns that were granted.
-- Privilege list
ALL [PRIVILEGES]    -- All privileges except GRANT OPTION.
ALTER   -- Allows ALTER TABLE.
ALTER ROUTINE   -- Alters or drops stored routines.
CREATE  -- Allows CREATE TABLE.
CREATE ROUTINE  -- Creates stored routines.
CREATE TEMPORARY TABLES     -- Allows CREATE TEMPORARY TABLE.
CREATE USER     -- Allows CREATE USER, DROP USER, RENAME USER, and REVOKE ALL PRIVILEGES.
CREATE VIEW     -- Allows CREATE VIEW.
DELETE  -- Allows DELETE.
DROP    -- Allows DROP TABLE.
EXECUTE     -- Allows execution of stored routines.
FILE    -- Allows SELECT...INTO OUTFILE and LOAD DATA INFILE.
INDEX   -- Allows CREATE INDEX and DROP INDEX.
INSERT  -- Allows INSERT.
LOCK TABLES     -- Allows LOCK TABLES on tables for which you have SELECT privilege.
PROCESS     -- Allows SHOW FULL PROCESSLIST.
REFERENCES  -- Not implemented.
RELOAD  -- Allows FLUSH.
REPLICATION CLIENT  -- Allows querying the address of a source or replica server.
REPLICATION SLAVE   -- Allows replicas to read binary log events from a source server.
SELECT  -- Allows SELECT.
SHOW DATABASES  -- Shows all databases.
SHOW VIEW   -- Allows SHOW CREATE VIEW.
SHUTDOWN    -- Allows mysqladmin shutdown.
SUPER   -- Allows CHANGE MASTER, KILL, PURGE MASTER LOGS, SET GLOBAL, and mysqladmin debug; permits one connection after max_connections is reached.
UPDATE  -- Allows UPDATE.
USAGE   -- Synonym for no privileges.
GRANT OPTION    -- Allows granting privileges.
```

### Table maintenance

```sql
/* Table maintenance */
-- Analyze and store key distribution for a table.
ANALYZE [LOCAL | NO_WRITE_TO_BINLOG] TABLE table_name ...
-- Check one or more tables for errors.
CHECK TABLE tbl_name [, tbl_name] ... [option] ...
option = {QUICK | FAST | MEDIUM | EXTENDED | CHANGED}
-- Defragment table data files.
OPTIMIZE [LOCAL | NO_WRITE_TO_BINLOG] TABLE tbl_name [, tbl_name] ...
```

### Miscellaneous

```sql
/* Miscellaneous */ ------------------
1. Use backticks around identifiers (database, table, column, index, or alias names) to avoid keyword conflicts. Identifiers can also contain non-ASCII characters.
2. Each database directory contains a db.opt file with database options.
3. Comments:
    Single-line comment: # comment text
    Block comment: /* comment text */
    Single-line comment: -- comment text (standard SQL style; the two hyphens must be followed by whitespace)
4. Pattern wildcards:
    _   Any single character
    %   Any number of characters, including zero
    Escape single quotes.
5. In the CMD client, statement terminators can be a semicolon, \G, or \g; these affect output formatting only. Other contexts use a semicolon. delimiter changes the terminator for the current session.
6. SQL is case-insensitive.
7. Clear the current statement with the client command.
```

<!-- @include: @article-footer.snippet.md -->
