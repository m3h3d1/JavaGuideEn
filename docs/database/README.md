---
title: "Database Guide: SQL, MySQL, Redis, MongoDB, and Elasticsearch"
description: A database study and interview guide covering SQL, MySQL indexes and transactions, logs, MVCC, query plans, Redis caching, MongoDB, and Elasticsearch.
category: Databases
tag:
  - Databases
  - MySQL
  - Redis
sitemap:
  changefreq: weekly
  priority: 0.95
head:
  - - meta
    - name: keywords
      content: databases,database interview questions,SQL,MySQL,Redis,MongoDB,Elasticsearch,MySQL indexes,MySQL transactions,MySQL logs,MVCC,Redis cache,Redis persistence,Redis cluster,backend interviews
---

<!-- @include: @small-advertisement.snippet.md -->

This **database guide** is for backend developers studying database fundamentals, applying them in engineering work, and preparing for interviews. It organizes the site's articles in this order: database fundamentals, SQL, MySQL, Redis, and NoSQL and search systems.

If you have limited time, start with [common database interview questions](./basis.md), [SQL syntax fundamentals](./sql/sql-syntax-summary.md), [common MySQL interview questions](./mysql/mysql-questions-01.md), and [common Redis interview questions, part 1](./redis/redis-questions-01.md).

## Who This Guide Is For

- Backend developers studying databases, SQL, MySQL, and Redis systematically.
- Candidates preparing for new graduate or experienced-hire backend interviews.
- Engineers who want to strengthen their understanding of indexes, transactions, logs, query plans, cache consistency, Redis persistence, and clustering.
- Developers who write CRUD code but want a stronger grasp of database internals, performance tuning, and NoSQL selection.

## Key Topics

- What problems do relational databases and NoSQL systems solve, and where are the trade-offs?
- How do you use SQL queries, aggregation, joins, subqueries, and transaction semantics?
- How do MySQL indexes, transaction isolation, MVCC, logs, and query plans fit together?
- Why is Redis fast? How do its data structures, caching strategies, persistence, blocking behavior, and cluster mechanisms work?
- Which concepts about MongoDB and Elasticsearch commonly come up in backend interviews and system selection?

## Suggested Reading Order

1. [Database fundamentals](./basis.md) and [NoSQL fundamentals](./nosql.md): Learn database categories, transactions, normal forms, NoSQL types, and common use cases.
2. [SQL syntax fundamentals](./sql/sql-syntax-summary.md): Review queries, filtering, sorting, aggregation, joins, subqueries, inserts, updates, and deletes.
3. [MySQL](./mysql/): Focus on indexes, transaction isolation, MVCC, logs, execution, and query plans.
4. [Redis](./redis/): Focus on caching, data structures, read/write strategies, persistence, blocking issues, memory fragmentation, and clustering.
5. [MongoDB](./mongodb/) and [Elasticsearch interview questions](./elasticsearch/elasticsearch-questions-01.md): Study document databases and search engines based on the requirements of your role.

## Core Articles

### Database Fundamentals and SQL

Start here to build a general understanding of database types, transaction semantics, character sets, SQL, and common query problems.

- [Common database interview questions](./basis.md): Core concepts, transaction properties, concurrency control, normal forms, and interview questions.
- [NoSQL interview questions](./nosql.md): Key-value, document, column-family, and graph databases and their use cases.
- [Character sets explained](./character-set.md): Character sets, encodings, mojibake, and MySQL character set configuration.
- [SQL](./sql/): SQL fundamentals and common SQL interview questions.
- [SQL syntax fundamentals](./sql/sql-syntax-summary.md): Queries, filtering, sorting, aggregation, grouping, joins, subqueries, and data modification.

### MySQL

MySQL is a core relational database topic for backend interviews. Study indexes, query plans, transactions, MVCC, logs, and performance tuning as connected topics.

- [MySQL](./mysql/): Indexes, transaction isolation, MVCC, logs, query plans, and performance tuning.
- [Common MySQL interview questions](./mysql/mysql-questions-01.md): An overview of frequently asked MySQL questions.
- [MySQL indexes](./mysql/mysql-index.md): Index structures, the leftmost-prefix rule, covering indexes, table lookups, and index design.
- [MySQL transaction isolation levels](./mysql/transaction-isolation-level.md): Dirty reads, non-repeatable reads, phantom reads, and isolation-level trade-offs.
- [How InnoDB implements MVCC](./mysql/innodb-implementation-of-mvcc.md): Read views, hidden columns, undo logs, and consistent reads.
- [MySQL logs](./mysql/mysql-logs.md): The purposes and relationships of the binary log, redo log, and undo log.
- [Syncing MySQL data to Elasticsearch](./mysql/mysql-to-elasticsearch-sync.md): Application-level dual writes, scheduled sync, Canal, Debezium, Flink CDC, full and incremental sync, and consistency.
- [MySQL query plans](./mysql/mysql-query-execution-plan.md): Common `EXPLAIN` fields and how to start analyzing slow queries.

### Redis

Redis is both a cache and a common interview topic. Go beyond memorizing commands and understand caching strategies, data structures, persistence, blocking behavior, and clustering.

- [Redis](./redis/): Caching, data structures, persistence, clustering, blocking issues, and engineering practices.
- [Caching fundamentals](./redis/cache-basics.md): Cache use cases, cache penetration, cache breakdown, cache avalanche, and consistency.
- [Common Redis interview questions, part 1](./redis/redis-questions-01.md) and [part 2](./redis/redis-questions-02.md): Frequently asked Redis questions.
- [Redis's five basic data types](./redis/redis-data-structures-01.md): Use cases for strings, lists, hashes, sets, and sorted sets.
- [Redis persistence](./redis/redis-persistence.md): RDB, AOF, AOF rewriting, and hybrid persistence.
- [Redis clustering](./redis/redis-cluster.md): Primary-replica replication, Sentinel, Cluster, hash slots, and failover.

### NoSQL and Search

Study these topics after relational databases and caching to understand document databases, search engines, and the trade-offs of non-relational storage.

- [MongoDB](./mongodb/): Document models, indexes, replica sets, sharding, transactions, and interview questions.
- [MongoDB interview questions, part 1](./mongodb/mongodb-questions-01.md) and [part 2](./mongodb/mongodb-questions-02.md): Core concepts and engineering practices.
- [Elasticsearch interview questions](./elasticsearch/elasticsearch-questions-01.md): Inverted indexes, shards, replicas, indexing and query flows, and search use cases.

## Common Interview Questions

- How do relational databases and NoSQL differ, and what are their use cases?
- What are the ACID properties of a database transaction? What does each isolation level address?
- How should you understand the order of `WHERE`, `GROUP BY`, `HAVING`, and `ORDER BY` in SQL?
- How do MySQL indexes speed up queries, and what can prevent an index from being used?
- How does InnoDB use MVCC to provide non-locking consistent reads?
- What problems do the binary log, redo log, and undo log solve?
- How do you analyze a SQL execution plan with `EXPLAIN`?
- Why is Redis fast? How do you address cache penetration, breakdown, and avalanche?
- What do Redis persistence, primary-replica replication, Sentinel, and Cluster provide?
- What business use cases fit MongoDB and Elasticsearch?

## Related Topics

- [High-performance systems](../high-performance/)
- [High-availability systems](../high-availability/)
- [Distributed systems](../distributed-system/)
- [System design](../system-design/)

<!-- @include: @article-footer.snippet.md -->
