---
icon: "mdi:head-lightbulb-outline"
title: Java Interview Guide (JavaGuide's General Backend Interview Questions)
description: A structured guide to Java and backend interview questions, covering Java fundamentals, collections, concurrency, the JVM, Spring, MySQL, Redis, system design, and distributed systems. Useful for new-grad and experienced-hire interviews.
sitemap:
  changefreq: weekly
  priority: 1
head:
  - - meta
    - name: keywords
      content: Java interviews,Java interview guide,backend interviews,Java interview questions,Java fundamentals,JVM interviews,concurrency interviews,thread pool interviews,Spring interviews,MySQL interviews,Redis interviews,system design interviews,distributed systems interviews
---

<!-- @include: @small-advertisement.snippet.md -->

<!-- markdownlint-disable MD024 -->

JavaGuide is a structured **Java interview guide** and a general **backend interview study resource**. It covers Java fundamentals, collections, concurrency, the JVM, Spring/Spring Boot, MySQL, Redis, distributed systems, high concurrency, high availability, and system design.

If you're preparing for a new-grad or experienced-hire interview, or looking for a new role, start with the [Java Backend Interview Plan](./interview-preparation/backend-interview-plan.md). Then review the topics below and work through the common Java and backend interview questions.

All content on this site is free and open source. Contributions are welcome—see the [contribution guide](https://javaguide.cn/javaguide/contribution-guideline.html). If you find it useful, please consider giving the project a ⭐!

- **Project**: <https://github.com/Snailclimb/JavaGuide>
- **Read online**: <https://javaguide.cn/>

## More resources

- [Java open-source projects](./open-source-project/): selected projects from Gitee and GitHub that are useful for learning, hands-on practice, and portfolio work.
- [Recommended technical books](./books/): recommendations covering computer science, databases, search engines, distributed systems, and high-availability architecture.

## Interview preparation

- [⭐ Java Backend Interview Plan (covers general backend topics)](./interview-preparation/backend-interview-plan.md) (recommended starting point)
- [How to Prepare for a Java Interview Effectively](./interview-preparation/teach-you-how-to-prepare-for-the-interview-hand-in-hand.md)
- [Key Topics for Java Backend Interviews](./interview-preparation/key-points-of-interview.md)
- [Java Learning Roadmap (latest edition)](./interview-preparation/java-roadmap.md)
- [Programmer Resume Guide](./interview-preparation/resume-guide.md)
- [Project Experience Guide](./interview-preparation/project-experience-guide.md)
- [How to Handle Interview Nerves](./interview-preparation/how-to-handle-interview-nerves.md)
- [What to Do About Internship Experience for Campus Recruitment](./interview-preparation/internship-experience.md)

## Java

### Fundamentals

**Knowledge summaries and interview questions**:

- [Java Fundamentals: Common Topics and Interview Questions (Part 1)](./java/basis/java-basic-questions-01.md)
- [Java Fundamentals: Common Topics and Interview Questions (Part 2)](./java/basis/java-basic-questions-02.md)
- [Java Fundamentals: Common Topics and Interview Questions (Part 3)](./java/basis/java-basic-questions-03.md)

**In-depth explanations**:

- [Why Java Is Pass-by-Value](./java/basis/why-there-only-value-passing-in-java.md)
- [Java Serialization](./java/basis/serialization.md)
- [Generics and Wildcards](./java/basis/generics-and-wildcards.md)
- [Java Reflection](./java/basis/reflection.md)
- [The Proxy Pattern in Java](./java/basis/proxy.md)
- [BigDecimal](./java/basis/bigdecimal.md)
- [Java's Unsafe Class](./java/basis/unsafe.md)
- [Java SPI](./java/basis/spi.md)
- [Java Syntactic Sugar](./java/basis/syntactic-sugar.md)

### Collections

**Knowledge summaries and interview questions**:

- [Java Collections: Common Topics and Interview Questions (Part 1)](./java/collection/java-collection-questions-01.md) (recommended)
- [Java Collections: Common Topics and Interview Questions (Part 2)](./java/collection/java-collection-questions-02.md) (recommended)
- [Java Container Usage: Things to Watch For](./java/collection/java-collection-precautions-for-use.md)

**Source code analysis**:

- [ArrayList Source Code and Growth Strategy](./java/collection/arraylist-source-code.md)
- [LinkedList Source Code](./java/collection/linkedlist-source-code.md)
- [HashMap Source Code and Data Structures](./java/collection/hashmap-source-code.md)
- [ConcurrentHashMap Source Code and Data Structures](./java/collection/concurrent-hash-map-source-code.md)
- [LinkedHashMap Source Code](./java/collection/linkedhashmap-source-code.md)
- [CopyOnWriteArrayList Source Code](./java/collection/copyonwritearraylist-source-code.md)
- [ArrayBlockingQueue Source Code](./java/collection/arrayblockingqueue-source-code.md)
- [PriorityQueue Source Code](./java/collection/priorityqueue-source-code.md)
- [DelayQueue Source Code](./java/collection/priorityqueue-source-code.md)

### I/O

- [Java I/O Fundamentals](./java/io/io-basis.md)
- [I/O Design Patterns](./java/io/io-design-patterns.md)
- [I/O Models](./java/io/io-model.md)
- [NIO Fundamentals](./java/io/nio-basis.md)

### Concurrency

**Knowledge summaries and interview questions** (recommended):

- [Java Concurrency: Common Topics and Interview Questions (Part 1)](./java/concurrent/java-concurrent-questions-01.md)
- [Java Concurrency: Common Topics and Interview Questions (Part 2)](./java/concurrent/java-concurrent-questions-02.md)
- [Java Concurrency: Common Topics and Interview Questions (Part 3)](./java/concurrent/java-concurrent-questions-03.md)

**In-depth explanations**:

- [Optimistic and Pessimistic Locking](./java/concurrent/optimistic-lock-and-pessimistic-lock.md)
- [Compare-and-Swap (CAS)](./java/concurrent/cas.md)
- [Java Memory Model (JMM)](./java/concurrent/jmm.md)
- **Thread pools**: [Java Thread Pools](./java/concurrent/java-thread-pool-summary.md), [Java Thread Pool Best Practices](./java/concurrent/java-thread-pool-best-practices.md)
- [ThreadLocal](./java/concurrent/threadlocal.md)
- [Java Concurrent Collections](./java/concurrent/java-concurrent-collections.md)
- [Atomic Classes](./java/concurrent/atomic-classes.md)
- [AbstractQueuedSynchronizer (AQS)](./java/concurrent/aqs.md)
- [CompletableFuture](./java/concurrent/completablefuture-intro.md)

### JVM (recommended)

This section draws mainly on the [Java 8 Virtual Machine Specification](https://docs.oracle.com/javase/specs/jvms/se8/html/index.html) and the third edition of Zhou Zhiming's _深入理解 Java 虚拟机_ (_Understanding the Java Virtual Machine_), which is well worth reading.

- **[⭐ Common JVM Interview Questions](./java/jvm/jvm-interview-questions.md)**
- **[Java Memory Areas](./java/jvm/memory-area.md)**
- **[JVM Garbage Collection](./java/jvm/jvm-garbage-collection.md)**
- [Class File Structure](./java/jvm/class-file-structure.md)
- **[Class Loading Process](./java/jvm/class-loading-process.md)**
- [Class Loaders](./java/jvm/classloader.md)
- [【In progress】Essential JVM Options (partially translated)](./java/jvm/jvm-parameters-intro.md)
- [【Bonus】The JVM, Explained Simply](./java/jvm/jvm-intro.md)
- [JDK Monitoring and Troubleshooting Tools](./java/jvm/jdk-monitoring-and-troubleshooting-tools.md)

### Java language features

- **Java 8**: [Java 8 Features (translation)](./java/new-features/java8-tutorial-translate.md), [Commonly Used Java 8 Features](./java/new-features/java8-common-new-features.md)
- [Java 9 Features](./java/new-features/java9.md)
- [Java 10 Features](./java/new-features/java10.md)
- [Java 11 Features](./java/new-features/java11.md)
- [Java 12 and 13 Features](./java/new-features/java12-13.md)
- [Java 14 and 15 Features](./java/new-features/java14-15.md)
- [Java 16 Features](./java/new-features/java16.md)
- [Java 17 Features](./java/new-features/java17.md)
- [Java 18 Features](./java/new-features/java18.md)
- [Java 19 Features](./java/new-features/java19.md)
- [Java 20 Features](./java/new-features/java20.md)
- [Java 21 Features](./java/new-features/java21.md)
- [Java 22 and 23 Features](./java/new-features/java22-23.md)
- [Java 24 Features](./java/new-features/java24.md)
- [Java 25 Features](./java/new-features/java25.md)

## Computer science fundamentals

Computer science fundamentals—computer networks, operating systems, data structures, and algorithms—are covered in the [Computer Science Guide](./cs-basics/).

[![Banner](https://oss.javaguide.cn/xingqiu/xingqiu.png)](./about-the-author/zhishixingqiu-two-years.md)

## Databases

### Fundamentals

- [Database Fundamentals](./database/basis.md)
- [NoSQL Fundamentals](./database/nosql.md)
- [Character Sets](./database/character-set.md)
- **SQL**:
  - [SQL Syntax Fundamentals](./database/sql/sql-syntax-summary.md)
  - [Common SQL Interview Questions](./database/sql/sql-questions-01.md)

### MySQL

**Knowledge summaries and interview questions**:

- **[Common MySQL Topics and Interview Questions](./database/mysql/mysql-questions-01.md)** (recommended)
- [MySQL Performance Optimization Recommendations](./database/mysql/mysql-high-performance-optimization-specification-recommendations.md)

**In-depth topics**:

- [MySQL Indexes](./database/mysql/mysql-index.md)
- [When MySQL Indexes Are Not Used](./database/mysql/mysql-index-invalidation.md)
- [MySQL Transaction Isolation Levels](./database/mysql/transaction-isolation-level.md)
- [MySQL's Three Main Logs: binlog, redo log, and undo log](./database/mysql/mysql-logs.md)
- [How InnoDB Implements MVCC](./database/mysql/innodb-implementation-of-mvcc.md)
- [How MySQL Executes SQL Statements](./database/mysql/how-sql-executed-in-mysql.md)
- [MySQL Query Cache](./database/mysql/mysql-query-cache.md)
- [Analyzing MySQL Execution Plans](./database/mysql/mysql-query-execution-plan.md)
- [Are MySQL Auto-Incrementing Primary Keys Always Consecutive?](./database/mysql/mysql-auto-increment-primary-key-continuous.md)
- [Choosing Time Data Types in MySQL](./database/mysql/some-thoughts-on-database-storage-time.md)
- [How Implicit Conversion Can Prevent MySQL from Using an Index](./database/mysql/index-invalidation-caused-by-implicit-conversion.md)

### Redis

**Knowledge summaries and interview questions** (recommended):

- [Common Redis Topics and Interview Questions (Part 1)](./database/redis/redis-questions-01.md)
- [Common Redis Topics and Interview Questions (Part 2)](./database/redis/redis-questions-02.md)

**In-depth topics**:

- [Three Common Cache Read and Write Strategies](./database/redis/3-commonly-used-cache-read-and-write-strategies.md)
- [Can Redis Be Used as a Message Queue?](./database/redis/redis-stream-mq.md)
- [Redis's Five Basic Data Structures](./database/redis/redis-data-structures-01.md)
- [Three Specialized Redis Data Structures](./database/redis/redis-data-structures-02.md)
- [Redis Persistence](./database/redis/redis-persistence.md)
- [Redis Memory Fragmentation](./database/redis/redis-memory-fragmentation.md)
- [Common Causes of Redis Blocking](./database/redis/redis-common-blocking-problems-summary.md)
- [Redis Clusters](./database/redis/redis-cluster.md)

### MongoDB

- [Common MongoDB Topics and Interview Questions (Part 1)](./database/mongodb/mongodb-questions-01.md)
- [Common MongoDB Topics and Interview Questions (Part 2)](./database/mongodb/mongodb-questions-02.md)

## Search engines

[Common Elasticsearch Interview Questions (paid)](./database/elasticsearch/elasticsearch-questions-01.md)

![JavaGuide official WeChat account](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)

## Developer tools

### Maven

- [Maven Core Concepts](./tools/maven/maven-core-concepts.md)
- [Maven Best Practices](./tools/maven/maven-best-practices.md)

### Gradle

[Gradle Core Concepts](./tools/gradle/gradle-core-concepts.md) (optional; Maven is more widely used in China today)

### Docker

- [Docker Core Concepts](./tools/docker/docker-intro.md)
- [Docker in Action](./tools/docker/docker-in-action.md)

### Git

- [Git Core Concepts](./tools/git/git-intro.md)
- [Useful GitHub Tips](./tools/git/github-tips.md)

## System design

- [⭐ Common System Design Interview Questions](./system-design/system-design-questions.md)
- [⭐ Common Design Pattern Interview Questions](https://interview.javaguide.cn/system-design/design-pattern.html)

### Fundamentals

- [A Brief Guide to RESTful APIs](./system-design/basis/RESTfulAPI.md)
- [A Brief Guide to Software Engineering](./system-design/basis/software-engineering.md)
- [Code Naming Guide](./system-design/basis/naming.md)
- [Code Refactoring Guide](./system-design/basis/refactoring.md)
- [Unit Testing Guide](./system-design/basis/unit-test.md)

### Common frameworks

#### Spring and Spring Boot (recommended)

**Knowledge summaries and interview questions**:

- [Common Spring Topics and Interview Questions](./system-design/framework/spring/spring-knowledge-and-questions-summary.md)
- [Common Spring Boot Topics and Interview Questions](./system-design/framework/spring/springboot-knowledge-and-questions-summary.md)
- [Common Spring and Spring Boot Annotations](./system-design/framework/spring/spring-common-annotations.md)
- [Spring Boot Getting Started Guide](https://github.com/Snailclimb/springboot-guide)

**In-depth topics**:

- [IoC and AOP, Explained](./system-design/framework/spring/ioc-and-aop.md)
- [Spring Transactions](./system-design/framework/spring/spring-transaction.md)
- [Design Patterns in Spring](./system-design/framework/spring/spring-design-patterns-summary.md)
- [How Spring Boot Auto-Configuration Works](./system-design/framework/spring/spring-boot-auto-assembly-principles.md)

#### MyBatis

[Common MyBatis Interview Questions](./system-design/framework/mybatis/mybatis-interview.md)

### Security

#### Authentication and authorization

- [Authentication and Authorization Fundamentals](./system-design/security/basis-of-authority-certification.md)
- [JWT Fundamentals](./system-design/security/jwt-intro.md)
- [JWT Trade-offs and Common Solutions](./system-design/security/advantages-and-disadvantages-of-jwt.md)
- [Single Sign-On (SSO)](./system-design/security/sso-intro.md)
- [Designing an Authorization System](./system-design/security/design-of-authority-system.md)

#### Data security

- [Common Encryption Algorithms](./system-design/security/encryption-algorithms.md)
- [Filtering Sensitive Words](./system-design/security/sentive-words-filter.md)
- [Data Masking](./system-design/security/data-desensitization.md)
- [Why Validate Data on Both the Front End and Back End?](./system-design/security/data-validation.md)
- [Why Can a Forgotten Password Be Reset but Not Retrieved?](./system-design/security/why-password-reset-instead-of-retrieval.md)

### Scheduled tasks

[Java Scheduled Tasks](./system-design/schedule-task.md)

### Real-time messaging on the web

[Real-Time Web Messaging](./system-design/web-real-time-message-push.md)

## Distributed systems

- [⭐ Frequently Asked Distributed Systems Interview Questions](https://interview.javaguide.cn/distributed-system/distributed-system.html)
- [Preparing for Distributed Systems Interviews](./distributed-system/distributed-system-interview-questions.md)
- [Preparing for Microservices Interviews](./distributed-system/microservices-interview-questions.md)
- [Distributed Systems: An Introduction](./distributed-system/distributed-system-intro.md)

### Theory, algorithms, and protocols

- [The CAP and BASE Theorems](./distributed-system/protocol/cap-and-base-theorem.md)
- [Centralized and Decentralized Coordination](./distributed-system/protocol/centralized-and-decentralized.md)
- [The Byzantine Generals Problem](./distributed-system/protocol/byzantine-generals-problem.md)
- [The Paxos Algorithm](./distributed-system/protocol/paxos-algorithm.md)
- [The Raft Algorithm](./distributed-system/protocol/raft-algorithm.md)
- [The ZAB Protocol](./distributed-system/protocol/zab.md)
- [The Gossip Protocol](./distributed-system/protocol/gossip-protocol.md)
- [Consistent Hashing](./distributed-system/protocol/consistent-hashing.md)

### RPC

- [RPC Fundamentals](./distributed-system/rpc/rpc-intro.md)
- [Common Dubbo Topics and Interview Questions](./distributed-system/rpc/dubbo.md)

### ZooKeeper

> These two articles may overlap, so we recommend reading both.

- [ZooKeeper Concepts: Getting Started](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-intro.md)
- [ZooKeeper Concepts: Advanced Topics](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-plus.md)

### API gateways

- [API Gateway Fundamentals](./distributed-system/api-gateway.md)
- [Common Spring Cloud Gateway Topics and Interview Questions](./distributed-system/spring-cloud-gateway-questions.md)

### Distributed IDs

- [Common Distributed ID Topics and Interview Questions](./distributed-system/distributed-id.md)
- [A Guide to Designing Distributed IDs](./distributed-system/distributed-id-design.md)

### Distributed locks

- [Distributed Locks](https://javaguide.cn/distributed-system/distributed-lock.html)
- [Common Ways to Implement Distributed Locks](https://javaguide.cn/distributed-system/distributed-lock-implementations.html)

### Distributed transactions

[Common Distributed Transaction Topics and Interview Questions](./distributed-system/distributed-transaction.md)

### Distributed configuration centers

[Common Topics and Interview Questions on Distributed Configuration Centers](./distributed-system/distributed-configuration-center.md)

## High performance

### Database optimization

- [Read/Write Splitting and Database Sharding](./high-performance/read-and-write-separation-and-library-subtable.md)
- [Separating Hot and Cold Data](./high-performance/data-cold-hot-separation.md)
- [Common SQL Optimization Techniques](./high-performance/sql-optimization.md)
- [Deep Pagination and How to Optimize It](./high-performance/deep-pagination-optimization.md)

### Load balancing

[Common Load Balancing Topics and Interview Questions](./high-performance/load-balancing.md)

### CDN

[Common CDN (Content Delivery Network) Topics and Interview Questions](./high-performance/cdn.md)

### Message queues

- [Preparing for Message Queue Interviews](./high-performance/message-queue/message-queue-interview-questions.md)
- [Message Queue Fundamentals](./high-performance/message-queue/message-queue.md)
- [Common Disruptor Topics and Interview Questions](./high-performance/message-queue/disruptor-questions.md)
- [Common RabbitMQ Topics and Interview Questions](./high-performance/message-queue/rabbitmq-questions.md)
- [Common RocketMQ Topics and Interview Questions](./high-performance/message-queue/rocketmq-questions.md)
- [Common Kafka Topics and Interview Questions (Part 1)](./high-performance/message-queue/kafka-questions-01.md)

## High availability

[A Guide to High-Availability System Design](./high-availability/high-availability-system-design.md)

### Redundancy

[Redundancy in System Design](./high-availability/redundancy.md)

### Rate limiting

[Rate Limiting Services](./high-availability/limit-request.md)

### Fallbacks and circuit breakers

[Fallbacks and Circuit Breakers](./high-availability/fallback-and-circuit-breaker.md)

### Timeouts and retries

[Timeouts and Retries](./high-availability/timeout-and-retry.md)

### Clusters

Deploy multiple instances of the same service to avoid a single point of failure.

### Disaster recovery and multi-site active-active deployments

**Disaster recovery** combines disaster tolerance and backups.

- **Backups**: Keep multiple copies of all important data produced by the system.
- **Disaster tolerance**: Set up two identical systems in separate locations. If one location goes down, the application can switch to the other and continue serving users.

**Multi-site active-active** means deploying services in multiple locations and serving traffic from all of them at the same time. The key difference from traditional disaster recovery is that every site is active. This approach helps systems withstand unexpected events such as fires, earthquakes, and other natural or human-caused disasters.

## Star history

![Star history](https://api.star-history.com/svg?repos=Snailclimb/JavaGuide&type=Date)

## WeChat

To follow new articles and other updates, subscribe to the official **JavaGuide** WeChat account.

![JavaGuide official WeChat account](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)
