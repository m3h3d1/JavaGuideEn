---
title: "Distributed Systems Guide: Fundamentals, Protocols, RPC, Gateways, Locks, Transactions, and IDs"
description: A distributed systems learning and interview guide covering CAP, BASE, Byzantine fault tolerance, Paxos, Raft, ZAB, Gossip, consistent hashing, RPC, API gateways, distributed locks and transactions, and ZooKeeper.
category: Distributed Systems
tag:
  - Distributed Systems
  - System Design
  - Backend Interviews
sitemap:
  changefreq: weekly
  priority: 0.95
head:
  - - meta
    - name: keywords
      content: distributed systems,distributed systems fundamentals,distributed systems interview questions,centralized,decentralized,CAP,BASE,Byzantine Generals Problem,Paxos,Raft,ZAB,Gossip,RPC,Dubbo,API gateway,distributed ID,distributed lock,distributed transaction,configuration center,ZooKeeper,backend interview
---

<!-- @include: @small-advertisement.snippet.md -->

This **distributed systems guide** is for backend developers studying system design or preparing for interviews. Its articles follow this path: fundamentals → communication and calls → service management → consistency and coordination → engineering practice.

If you are new to distributed systems, start with [Distributed Systems Fundamentals](./distributed-system-intro.md) for an overview. If you have limited time, review [Distributed Systems Interview Questions](./distributed-system-interview-questions.md) first. If the role focuses on microservices, continue with [Microservices Interview Questions](./microservices-interview-questions.md) to connect service decomposition, communication, data consistency, and reliability.

## Who This Guide Is For

- Backend developers studying distributed systems in depth.
- Candidates preparing for entry-level or experienced backend interviews.
- Engineers strengthening their knowledge of distributed systems theory, engineering practice, and technology choices.
- Developers with application experience who want to better understand RPC, distributed locks and transactions, and configuration centers.

## Key Topics

- Why do distributed systems require tradeoffs among consistency, availability, performance, and complexity?
- What problems do CAP, BASE, Paxos, Raft, ZAB, Gossip, and consistent hashing solve?
- What roles do RPC, API gateways, configuration centers, and service registries play in microservices?
- What approaches and pitfalls arise when using distributed IDs, locks, and transactions in production?
- How can you connect concepts, mechanisms, use cases, tradeoffs, and practical experience in an interview answer?

## How the Articles Fit Together

The articles can be read along four tracks.

The **theory track** starts with [Distributed Systems Fundamentals](./distributed-system-intro.md), which explains why multi-node systems become complex. [CAP and BASE Explained](./protocol/cap-and-base-theorem.md) covers consistency and availability tradeoffs during partitions. [Distributed Coordination](./protocol/centralized-and-decentralized.md) connects Leader, Quorum, Lease, Fencing Token, and Gossip.

The **service call track** covers communication between services in the [RPC guide](./rpc/), how external traffic enters a system in [API Gateways Explained](./api-gateway.md), and routes, predicates, filters, and rate limiting in [Spring Cloud Gateway Interview Questions](./spring-cloud-gateway-questions.md).

The **data consistency track** covers globally unique identifiers in [Distributed ID Generation](./distributed-id.md), business IDs for orders, coupons, and short URLs in [Distributed ID Design in Practice](./distributed-id-design.md), and cross-node mutual exclusion and cross-service write consistency in [Distributed Locks](./distributed-lock.md) and [Distributed Transactions](./distributed-transaction.md).

The **coordination components track** covers configuration publishing and client-side fault tolerance in [Distributed Configuration Centers](./distributed-configuration-center.md), followed by coordination concepts, ZAB, sessions, Watchers, and Curator practice in the [ZooKeeper guide](./distributed-process-coordination/zookeeper/).

## Suggested Reading Order

1. [Distributed Systems Fundamentals](./distributed-system-intro.md): Learn what distributed systems are and why multiple nodes introduce communication, failure, and consistency challenges.
2. [Distributed Systems Interview Questions](./distributed-system-interview-questions.md): Review common interview topics.
3. [Microservices Interview Questions](./microservices-interview-questions.md): Study service decomposition, communication, data consistency, reliability, and migration.
4. [Distributed Coordination](./protocol/centralized-and-decentralized.md): Understand how Leader, Quorum, Gossip, Lease, split brain, and Fencing Token relate.
5. [CAP and BASE Explained](./protocol/cap-and-base-theorem.md): Learn the core tradeoffs in distributed systems.
6. [The Byzantine Generals Problem](./protocol/byzantine-generals-problem.md): Understand malicious nodes, failure assumptions, and the limits of BFT.
7. [RPC Explained](./rpc/rpc-intro.md): Learn how services communicate and which engineering problems RPC frameworks solve.
8. [Distributed ID Generation](./distributed-id.md), [Distributed Locks](./distributed-lock.md), and [Distributed Transactions](./distributed-transaction.md): Cover common engineering practices.
9. [ZooKeeper Fundamentals](./distributed-process-coordination/zookeeper/zookeeper-intro.md) and [Distributed Configuration Centers](./distributed-configuration-center.md): Learn about coordination and configuration management.

## Core Articles

### Distributed Systems Fundamentals and Protocols

Start here to build a foundation in consistency, availability, partition tolerance, consensus algorithms, and data distribution.

- [Distributed Systems Fundamentals](./distributed-system-intro.md): Learn the definition, architectural evolution, key characteristics, common systems, and study path.
- [Microservices Interview Questions](./microservices-interview-questions.md): Connect service decomposition, RPC and messaging, data ownership, distributed transactions, fault tolerance, observability, and migration.
- [Distributed Systems Theory, Algorithms, and Protocols](./protocol/): Study CAP, BASE, Paxos, Raft, ZAB, Gossip, and consistent hashing together.
- [Distributed Coordination](./protocol/centralized-and-decentralized.md): Connect Leader/Quorum, split brain, Lease, Fencing Token, and Gossip to understand decision-making and state propagation.
- [CAP and BASE Explained](./protocol/cap-and-base-theorem.md): Learn about consistency, availability, partition tolerance, and eventual consistency.
- [The Byzantine Generals Problem](./protocol/byzantine-generals-problem.md): Learn about consensus with malicious nodes, the `3m + 1` node requirement, and BFT fault tolerance.
- [Raft Explained](./protocol/raft-algorithm.md): Use an approachable consensus algorithm to learn about leader election and log replication.
- [Paxos Explained](./protocol/paxos-algorithm.md): Learn the roles, process, and challenges of a classic consensus algorithm.
- [ZAB Protocol Explained](./protocol/zab.md): Learn about ZooKeeper's atomic broadcast, crash recovery, and transaction log.
- [Gossip Protocol Explained](./protocol/gossip-protocol.md): Learn how information propagates among large numbers of nodes and how eventual consistency works.
- [Consistent Hashing Explained](./protocol/consistent-hashing.md): Learn how data is distributed in distributed caches, load balancing, and database sharding.

### RPC and Service Calls

RPC addresses the engineering complexity of remote service calls, including serialization, network transport, service discovery, load balancing, timeouts, retries, and service management.

- [RPC Guide](./rpc/): Build an understanding of service calls, from RPC fundamentals and Dubbo to the relationship between HTTP and RPC.
- [RPC Explained](./rpc/rpc-intro.md): Learn the call flow, dynamic proxies, serialization, network transport, and framework selection.
- [Dubbo Interview Questions](./rpc/dubbo.md): Review Dubbo architecture, service exposure and references, SPI, load balancing, and cluster fault tolerance.
- [Why Use RPC When We Have HTTP?](../cs-basics/network/http-vs-rpc.md): Understand how HTTP and RPC relate and when to choose each.

### API Gateways and Traffic Entry Points

API gateways provide a unified entry point for routing, authentication and authorization, rate limiting, circuit breaking, canary releases, and cross-origin handling.

- [API Gateways Explained](./api-gateway.md): Learn about request routing, authentication and authorization, rate limiting, circuit breaking, load balancing, and two-tier gateway architecture.
- [Spring Cloud Gateway Interview Questions](./spring-cloud-gateway-questions.md): Review Predicate, GatewayFilter, GlobalFilter, rate limiting, circuit breaking, and common production issues.

### Distributed IDs, Locks, and Transactions

These engineering practices commonly apply to orders, payments, flash sales, inventory updates, data consistency, and cross-service collaboration.

- [Distributed ID Generation](./distributed-id.md): Compare UUIDs, database auto-increment, segment allocation, Redis, Snowflake, Leaf, and TinyID.
- [Distributed ID Design in Practice](./distributed-id-design.md): Study business IDs for orders, payment codes, coupons, and one-code payments.
- [Distributed Locks](./distributed-lock.md): Learn mutual exclusion, lock granularity, safe release, lease renewal, and Fencing Tokens.
- [Distributed Lock Implementations](./distributed-lock-implementations.md): Compare distributed locks using Redis, Redisson, Redlock, ZooKeeper, and Curator.
- [Distributed Transaction Solutions](./distributed-transaction.md): Learn about XA, AT, TCC, Saga, the transactional outbox, transaction messages, and best-effort delivery.

### Configuration Centers and ZooKeeper

Configuration centers and ZooKeeper address service configuration, service registration and discovery, distributed coordination, and cluster consistency.

- [Distributed Configuration Centers](./distributed-configuration-center.md): Compare Apollo, Nacos, Spring Cloud Config, and Kubernetes ConfigMap.
- [ZooKeeper Guide](./distributed-process-coordination/zookeeper/): Learn ZooKeeper fundamentals, ZAB, leader election, Curator, and distributed lock implementations.
- [ZooKeeper Fundamentals](./distributed-process-coordination/zookeeper/zookeeper-intro.md): Learn about ZNodes, Watchers, ACLs, and common use cases.
- [ZooKeeper Advanced Guide](./distributed-process-coordination/zookeeper/zookeeper-plus.md): Learn about ZAB, leader election, cluster deployment, and session management.
- [ZooKeeper in Practice](./distributed-process-coordination/zookeeper/zookeeper-in-action.md): Practice with Docker, `zkCli`, four-letter commands, and Curator.

## Common Interview Questions

- Why can't a distributed system perfectly guarantee consistency, availability, and partition tolerance at the same time?
- How are CAP and BASE related, and when is eventual consistency appropriate?
- Why do distributed systems need coordination? When are centralized and decentralized approaches suitable?
- How do Paxos, Raft, and ZAB differ, and where is each used?
- How do RPC and HTTP differ, and why is RPC common for internal service calls?
- How can a distributed ID be globally unique, roughly time-ordered, and useful to the business?
- What are common pitfalls of Redis distributed locks? Is Redlock always reliable?
- What distributed transaction patterns are available, and when are TCC, Saga, and the transactional outbox appropriate?
- How do configuration centers differ from service registries? How should you choose among Apollo, Nacos, and Spring Cloud Config?
- How should microservices be decomposed, and when can they become a distributed monolith?
- How should microservices handle communication failures, cross-service data consistency, and canary releases?

## Related Guides

- [System Design](../system-design/)
- [High Availability](../high-availability/)
- [High Performance](../high-performance/)
- [Computer Networks](../cs-basics/network/)

<!-- @include: @article-footer.snippet.md -->
