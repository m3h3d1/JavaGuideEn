import { sidebar } from "vuepress-theme-hope";

import { aboutTheAuthor } from "./about-the-author.js";
import { ai } from "./ai.js";
import { aiCoding } from "./ai-coding.js";
import { books } from "./books.js";
import { csBasics } from "./cs-basics.js";
import { highQualityTechnicalArticles } from "./high-quality-technical-articles.js";
import { openSourceProject } from "./open-source-project.js";
import { roadmap } from "./roadmap.js";
import { zhuanlan } from "./zhuanlan.js";
import {
  ICONS,
  createImportantSection,
  createSourceCodeSection,
} from "./constants.js";

export default sidebar({
  // More specific paths should come first
  "/ai-coding/": aiCoding,
  "/ai/": ai,
  "/roadmap/": roadmap,
  "/cs-basics/": csBasics,
  "/open-source-project/": openSourceProject,
  "/books/": books,
  "/about-the-author/": aboutTheAuthor,
  "/high-quality-technical-articles/": highQualityTechnicalArticles,
  "/zhuanlan/": zhuanlan,
  // Must be placed last
  "/": [
    {
      text: "About the Project",
      icon: ICONS.STAR,
      collapsible: true,
      prefix: "javaguide/",
      children: ["intro", "use-suggestion", "contribution-guideline", "faq"],
    },
    {
      text: "Interview Preparation (Start Here)",
      icon: ICONS.INTERVIEW,
      collapsible: true,
      prefix: "interview-preparation/",
      children: [
        {
          text: "Interview Preparation Guide",
          link: "/interview-preparation/",
        },
        {
          text: "⭐ Java Backend Interview Plan",
          link: "backend-interview-plan",
        },
        {
          text: "⭐How to Prepare for Java Interviews",
          link: "teach-you-how-to-prepare-for-the-interview-hand-in-hand",
        },
        { text: "⭐Programmer Resume Guide", link: "resume-guide" },
        {
          text: "⭐Key Topics for Java Backend Interviews",
          link: "key-points-of-interview",
        },
        {
          text: "Java and Backend Interview PDFs",
          link: "pdf-interview-javaguide",
        },
        { text: "Java Learning Roadmap", link: "java-roadmap" },
        {
          text: "⭐Project Experience Guide",
          link: "project-experience-guide",
        },
        {
          text: "⭐How to Present Backend Projects in Interviews?",
          link: "backend-project-interview-guide",
        },
        "how-to-handle-interview-nerves",
        "internship-experience",
      ],
    },
    {
      text: "Java",
      icon: ICONS.JAVA,
      collapsible: true,
      prefix: "java/",
      children: [
        {
          text: "Java Guide",
          link: "/java/",
        },
        {
          text: "Fundamentals",
          prefix: "basis/",
          icon: ICONS.BASIC,
          children: [
            {
              text: "⭐ Java Fundamentals: Common Interview Questions (Part 1)",
              link: "java-basic-questions-01",
            },
            {
              text: "⭐ Java Fundamentals: Common Interview Questions (Part 2)",
              link: "java-basic-questions-02",
            },
            {
              text: "⭐ Java Fundamentals: Common Interview Questions (Part 3)",
              link: "java-basic-questions-03",
            },
            createImportantSection([
              "why-there-only-value-passing-in-java",
              "serialization",
              "generics-and-wildcards",
              "reflection",
              "proxy",
              "bigdecimal",
              {
                text: "Choosing a Java Type for Monetary Values",
                link: "money-long-vs-bigdecimal",
              },
              "unsafe",
              "spi",
              "syntactic-sugar",
            ]),
          ],
        },
        {
          text: "Collections",
          prefix: "collection/",
          icon: ICONS.CONTAINER,
          children: [
            {
              text: "⭐Common Java Collections Interview Questions (Part 1)",
              link: "java-collection-questions-01",
            },
            {
              text: "⭐Common Java Collections Interview Questions (Part 2)",
              link: "java-collection-questions-02",
            },
            "java-collection-precautions-for-use",
            createSourceCodeSection([
              "arraylist-source-code",
              "linkedlist-source-code",
              "hashmap-source-code",
              "concurrent-hash-map-source-code",
              "linkedhashmap-source-code",
              "copyonwritearraylist-source-code",
              "arrayblockingqueue-source-code",
              "priorityqueue-source-code",
              "delayqueue-source-code",
            ]),
          ],
        },
        {
          text: "Concurrency",
          prefix: "concurrent/",
          icon: ICONS.PERFORMANCE,
          children: [
            {
              text: "⭐Common Java Concurrency Interview Questions (Part 1)",
              link: "java-concurrent-questions-01",
            },
            {
              text: "⭐Common Java Concurrency Interview Questions (Part 2)",
              link: "java-concurrent-questions-02",
            },
            {
              text: "⭐Common Java Concurrency Interview Questions (Part 3)",
              link: "java-concurrent-questions-03",
            },
            createImportantSection([
              { text: "Java Locks Explained", link: "java-lock" },
              "optimistic-lock-and-pessimistic-lock",
              "cas",
              "jmm",
              "java-thread-pool-summary",
              "java-thread-pool-best-practices",
              "java-concurrent-collections",
              "aqs",
              "atomic-classes",
              "threadlocal",
              "completablefuture-intro",
              "virtual-thread",
            ]),
          ],
        },
        {
          text: "IO",
          prefix: "io/",
          icon: ICONS.CODE,
          collapsible: true,
          children: ["io-basis", "io-design-patterns", "io-model", "nio-basis"],
        },
        {
          text: "JVM",
          prefix: "jvm/",
          icon: ICONS.VIRTUAL_MACHINE,
          collapsible: true,
          children: [
            {
              text: "⭐Common JVM Interview Questions",
              link: "jvm-interview-questions",
            },
            "memory-area",
            "jvm-garbage-collection",
            "class-file-structure",
            "class-loading-process",
            "classloader",
            "jvm-parameters-intro",
            "jdk-monitoring-and-troubleshooting-tools",
            {
              text: "Troubleshooting Java Backend Production Issues",
              link: "jvm-in-action",
            },
          ],
        },
        {
          text: "New Features",
          prefix: "new-features/",
          icon: ICONS.FEATURED,
          collapsible: true,
          children: [
            "java8-common-new-features",
            "java8-tutorial-translate",
            "java9",
            "java10",
            "java11",
            "java12-13",
            "java14-15",
            "java16",
            "java17",
            "java18",
            "java19",
            "java20",
            "java21",
            "java22-23",
            "java24",
            "java25",
          ],
        },
      ],
    },
    {
      text: "Databases",
      icon: ICONS.DATABASE,
      prefix: "database/",
      collapsible: true,
      children: [
        {
          text: "Database Guide",
          link: "/database/",
        },
        {
          text: "Fundamentals",
          icon: ICONS.BASIC,
          children: [
            "basis",
            "nosql",
            {
              text: "Character Sets Explained",
              link: "character-set",
            },
            {
              text: "SQL",
              icon: ICONS.SQL,
              prefix: "sql/",
              collapsible: true,
              children: [
                "sql-syntax-summary",
                "sql-questions-01",
                "sql-questions-02",
                "sql-questions-03",
                "sql-questions-04",
                "sql-questions-05",
              ],
            },
          ],
        },
        {
          text: "MySQL",
          prefix: "mysql/",
          icon: ICONS.MYSQL,
          children: [
            {
              text: "⭐Common MySQL Interview Questions",
              link: "mysql-questions-01",
            },
            "mysql-high-performance-optimization-specification-recommendations",
            createImportantSection([
              "mysql-index",
              "mysql-index-invalidation",
              {
                text: "MySQL Three Main Logs Explained",
                link: "mysql-logs",
              },
              {
                text: "MySQL Backup and Recovery",
                link: "mysql-backup-and-restore",
              },
              {
                text: "MySQL-to-Elasticsearch Synchronization",
                link: "mysql-to-elasticsearch-sync",
              },
              "transaction-isolation-level",
              "innodb-implementation-of-mvcc",
              "how-sql-executed-in-mysql",
              "mysql-query-cache",
              "mysql-query-execution-plan",
              "mysql-auto-increment-primary-key-continuous",
              "some-thoughts-on-database-storage-time",
              "index-invalidation-caused-by-implicit-conversion",
            ]),
          ],
        },
        {
          text: "Redis",
          prefix: "redis/",
          icon: ICONS.REDIS,
          children: [
            "cache-basics",
            {
              text: "⭐Common Redis Interview Questions (Part 1)",
              link: "redis-questions-01",
            },
            {
              text: "⭐Common Redis Interview Questions (Part 2)",
              link: "redis-questions-02",
            },
            createImportantSection([
              "redis-delayed-task",
              "redis-stream-mq",
              "3-commonly-used-cache-read-and-write-strategies",
              "redis-data-structures-01",
              "redis-data-structures-02",
              "redis-skiplist",
              "redis-persistence",
              "redis-memory-fragmentation",
              "redis-common-blocking-problems-summary",
              "redis-cluster",
            ]),
          ],
        },
        {
          text: "Elasticsearch",
          prefix: "elasticsearch/",
          icon: ICONS.ELASTICSEARCH,
          collapsible: true,
          children: ["elasticsearch-questions-01"],
        },
        {
          text: "MongoDB",
          prefix: "mongodb/",
          icon: ICONS.MONGODB,
          collapsible: true,
          children: ["mongodb-questions-01", "mongodb-questions-02"],
        },
      ],
    },
    {
      text: "Developer Tools",
      icon: ICONS.TOOL,
      prefix: "tools/",
      collapsible: true,
      children: [
        {
          text: "Developer Tools Guide",
          link: "/tools/",
        },
        {
          text: "Maven",
          icon: ICONS.MAVEN,
          prefix: "maven/",
          children: [
            { text: "Maven Core Concepts", link: "maven-core-concepts" },
            { text: "Maven Best Practices", link: "maven-best-practices" },
          ],
        },
        {
          text: "Gradle",
          icon: ICONS.GRADLE,
          prefix: "gradle/",
          children: ["gradle-core-concepts"],
        },
        {
          text: "Git",
          icon: ICONS.GIT,
          prefix: "git/",
          children: ["git-intro", "github-tips"],
        },
        {
          text: "Docker",
          icon: ICONS.DOCKER,
          prefix: "docker/",
          children: ["docker-intro", "docker-in-action"],
        },
        {
          text: "IDEA",
          icon: ICONS.IDEA,
          link: "https://gitee.com/SnailClimb/awesome-idea-tutorial",
        },
      ],
    },
    {
      text: "Common Frameworks",
      prefix: "system-design/framework/",
      icon: ICONS.COMPONENT,
      collapsible: true,
      children: [
        {
          text: "Spring&Spring Boot",
          icon: ICONS.SPRING_BOOT,
          prefix: "spring/",
          children: [
            {
              text: "Common Spring Interview Questions",
              link: "spring-knowledge-and-questions-summary",
            },
            {
              text: "Common Spring Boot Interview Questions",
              link: "springboot-knowledge-and-questions-summary",
            },
            "spring-common-annotations",
            "springboot-source-code",
            createImportantSection([
              "ioc-and-aop",
              "spring-transaction",
              "spring-design-patterns-summary",
              "spring-boot-auto-assembly-principles",
              "spring-boot-executable-jar",
              "async",
            ]),
          ],
        },
        {
          text: "Common MyBatis Interview Questions",
          link: "mybatis/mybatis-interview",
        },
        "netty",
      ],
    },
    {
      text: "System Design",
      icon: ICONS.DESIGN,
      prefix: "system-design/",
      collapsible: true,
      children: [
        {
          text: "System Design Guide",
          link: "/system-design/",
        },
        {
          text: "Fundamentals",
          prefix: "basis/",
          icon: ICONS.BASIC,
          collapsible: true,
          children: [
            "RESTfulAPI",
            "software-engineering",
            "naming",
            "refactoring",
            {
              text: "Unit Testing Guide",
              link: "unit-test",
            },
          ],
        },
        {
          text: "Authentication and Authorization",
          prefix: "security/",
          icon: ICONS.SECURITY,
          collapsible: true,
          children: [
            "basis-of-authority-certification",
            "jwt-intro",
            "advantages-and-disadvantages-of-jwt",
            "sso-intro",
            "design-of-authority-system",
          ],
        },
        {
          text: "Data Security",
          prefix: "security/",
          icon: ICONS.SECURITY,
          collapsible: true,
          children: [
            "encryption-algorithms",
            "sentive-words-filter",
            "data-desensitization",
            "data-validation",
            "why-password-reset-instead-of-retrieval",
          ],
        },
        {
          text: "⭐Common System Design Interview Questions",
          link: "system-design-questions",
        },
        {
          text: "⭐Common Design Pattern Interview Questions",
          link: "https://interview.javaguide.cn/system-design/design-pattern.html",
        },
        "state-machine-and-workflow",
        "schedule-task",
        "web-real-time-message-push",
      ],
    },
    {
      text: "Distributed Systems",
      icon: ICONS.DISTRIBUTED,
      prefix: "distributed-system/",
      collapsible: true,
      children: [
        {
          text: "Distributed Systems: An Introduction",
          link: "distributed-system-intro",
        },
        {
          text: "⭐Popular Distributed Systems Interview Questions",
          link: "distributed-system-interview-questions",
        },
        {
          text: "⭐Popular Microservices Interview Questions",
          link: "microservices-interview-questions",
        },
        {
          text: "Theory, Algorithms, and Protocols",
          icon: ICONS.ALGORITHM,
          prefix: "protocol/",
          collapsible: true,
          children: [
            {
              text: "Theory, Algorithms, and Protocols",
              link: "/distributed-system/protocol/",
            },
            { text: "The CAP and BASE Theorems", link: "cap-and-base-theorem" },
            {
              text: "Distributed Coordination Explained",
              link: "centralized-and-decentralized",
            },
            {
              text: "The Byzantine Generals Problem",
              link: "byzantine-generals-problem",
            },
            { text: "The Paxos Algorithm", link: "paxos-algorithm" },
            { text: "The Raft Algorithm", link: "raft-algorithm" },
            { text: "The ZAB Protocol", link: "zab" },
            { text: "The Gossip Protocol", link: "gossip-protocol" },
            { text: "Consistent Hashing", link: "consistent-hashing" },
          ],
        },
        {
          text: "API Gateways",
          icon: ICONS.GATEWAY,
          children: [
            { text: "API Gateway Fundamentals", link: "api-gateway" },
            {
              text: "Spring Cloud Gateway Interview Questions",
              link: "spring-cloud-gateway-questions",
            },
          ],
        },
        {
          text: "Distributed IDs",
          icon: ICONS.ID,
          children: [
            {
              text: "Distributed ID Generation Methods",
              link: "distributed-id",
            },
            {
              text: "Practical Guide to Distributed ID Design",
              link: "distributed-id-design",
            },
          ],
        },
        {
          text: "Distributed Locks",
          icon: ICONS.LOCK,
          children: [
            {
              text: "Introduction to Distributed Locks",
              link: "distributed-lock",
            },
            {
              text: "Common Ways to Implement Distributed Locks",
              link: "distributed-lock-implementations",
            },
          ],
        },
        {
          text: "Distributed Transactions",
          icon: ICONS.TRANSACTION,
          children: [
            {
              text: "Distributed Transaction Solutions",
              link: "distributed-transaction",
            },
          ],
        },
        {
          text: "Distributed Configuration Centers",
          icon: ICONS.MAVEN,
          children: [
            {
              text: "Distributed Configuration Center Interview Questions",
              link: "distributed-configuration-center",
            },
          ],
        },
        {
          text: "RPC",
          prefix: "rpc/",
          icon: ICONS.RPC,
          collapsible: true,
          children: [
            { text: "RPC", link: "/distributed-system/rpc/" },
            { text: "RPC Fundamentals", link: "rpc-intro" },
            { text: "Dubbo Interview Questions", link: "dubbo" },
          ],
        },
        {
          text: "ZooKeeper",
          prefix: "distributed-process-coordination/zookeeper/",
          icon: ICONS.FRAMEWORK,
          collapsible: true,
          children: [
            {
              text: "ZooKeeper",
              link: "/distributed-system/distributed-process-coordination/zookeeper/",
            },
            {
              text: "ZooKeeper Getting Started Guide",
              link: "zookeeper-intro",
            },
            { text: "Advanced ZooKeeper Topics", link: "zookeeper-plus" },
            { text: "ZooKeeper in Practice", link: "zookeeper-in-action" },
          ],
        },
      ],
    },
    {
      text: "High Performance",
      icon: ICONS.PERFORMANCE,
      prefix: "high-performance/",
      collapsible: true,
      children: [
        {
          text: "⭐Popular High-Performance System Design Interview Questions",
          link: "high-performance-system-interview-questions",
        },
        {
          text: "CDN",
          icon: ICONS.CDN,
          children: ["cdn"],
        },
        {
          text: "Load Balancing",
          icon: ICONS.LOAD_BALANCING,
          children: [
            {
              text: "Load Balancing Principles and Algorithms",
              link: "load-balancing",
            },
          ],
        },
        {
          text: "Database Optimization",
          icon: ICONS.MYSQL,
          children: [
            "read-and-write-separation-and-library-subtable",
            "data-cold-hot-separation",
            "sql-optimization",
            "deep-pagination-optimization",
          ],
        },
        {
          text: "Message Queues",
          prefix: "message-queue/",
          icon: ICONS.MQ,
          collapsible: true,
          children: [
            {
              text: "⭐Popular Message Queue Interview Questions",
              link: "message-queue-interview-questions",
            },
            "message-queue",
            "disruptor-questions",
            "kafka-questions-01",
            "rocketmq-questions",
            "rabbitmq-questions",
          ],
        },
      ],
    },
    {
      text: "High Availability",
      icon: ICONS.HIGH_AVAILABLE,
      prefix: "high-availability/",
      collapsible: true,
      children: [
        {
          text: "⭐High-Availability System Interview Questions",
          link: "high-availability-system-interview-questions",
        },
        {
          text: "High-Availability System Design Guide",
          link: "high-availability-system-design",
        },
        {
          text: "⭐API Idempotency Strategies",
          link: "idempotency",
        },
        {
          text: "⭐Service Rate Limiting",
          link: "limit-request",
        },
        {
          text: "⭐Timeouts and Retries",
          link: "timeout-and-retry",
        },
        {
          text: "Service Degradation and Circuit Breakers",
          link: "fallback-and-circuit-breaker",
        },
        {
          text: "Redundancy Design",
          link: "redundancy",
        },
        {
          text: "Performance Testing: An Introduction",
          link: "performance-test",
        },
      ],
    },
  ],
});
