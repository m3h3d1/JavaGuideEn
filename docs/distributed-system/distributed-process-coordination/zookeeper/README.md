---
title: "ZooKeeper Guide: ZNodes, Watchers, ZAB, Cluster Deployment, Curator, and Distributed Locks"
description: "A ZooKeeper and distributed coordination study guide covering ZNodes, node types, Watchers, ACLs, ZAB, Leader election, deployment, Curator, and distributed locks."
category: Distributed Systems
tag:
  - ZooKeeper
  - Distributed Coordination
  - Distributed Locks
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: ZooKeeper,ZNode,Watcher,ZAB,Leader election,Curator,distributed coordination,distributed locks,service registry,backend interviews
---

ZooKeeper is a distributed coordination service commonly used for service registries, configuration management, distributed locks, Leader election, and cluster metadata. Start with its data model and Watchers, then study ZAB, Leader election, and practical operation.

## Who this guide is for

- Backend developers studying ZooKeeper.
- Candidates preparing for interviews on ZooKeeper, service registries, distributed locks, or coordination.
- Readers who have used ZooKeeper or Curator and want to understand ZNodes, Watchers, ZAB, and Leader election.
- Engineers comparing ZooKeeper, Eureka, Nacos, and other registry or coordination components.

## Key topics

- Why does ZooKeeper use a tree of ZNodes as its data model?
- What problems do ephemeral nodes, sequential nodes, and Watchers solve?
- How does ZAB handle message broadcast, replica synchronization, and crash recovery?
- Why are ZooKeeper clusters usually deployed with an odd number of nodes?
- How does Curator simplify ZooKeeper client development and distributed locks?

## How this guide relates to other articles

[Distributed Coordination](../../protocol/centralized-and-decentralized.md) introduces general concepts such as Leaders, Quorums, split brain, and Leases. This guide applies them to ZNodes, Watchers, sessions, and ZAB.

[ZAB Explained](../../protocol/zab.md) focuses on atomic broadcast and crash recovery. For commands and client code, continue with the [ZooKeeper practical guide](./zookeeper-in-action.md).

## Suggested reading order

1. [Distributed Coordination](../../protocol/centralized-and-decentralized.md): Learn about coordination, Leaders, Quorums, split brain, and Leases.
2. [ZooKeeper Fundamentals](./zookeeper-intro.md): Study ZNodes, Watchers, ACLs, and common use cases.
3. [Advanced ZooKeeper](./zookeeper-plus.md): Explore ZAB, Leader election, cluster deployment, and sessions.
4. [ZooKeeper in Practice](./zookeeper-in-action.md): Work with Docker, zkCli, four-letter commands, and Curator.

## Core articles

- [ZooKeeper Fundamentals](./zookeeper-intro.md): Core concepts, the ZNode model, node types, Watchers, ACLs, and use cases.
- [Advanced ZooKeeper](./zookeeper-plus.md): ZAB, Leader election, cluster deployment, odd node counts, sessions, and comparisons with Eureka and Nacos.
- [ZooKeeper in Practice](./zookeeper-in-action.md): Docker deployment, zkCli, four-letter commands, Curator CRUD operations, and distributed lock examples.

## Common interview questions

- Which distributed coordination problems is ZooKeeper suited to?
- What types of ZNode exist, and why are ephemeral sequential nodes used for distributed locks?
- Why are Watchers one-time triggers, and what should clients account for?
- How does ZAB relate to Raft and Paxos?
- Why do ZooKeeper clusters usually have an odd number of nodes?
- How does ZooKeeper compare with Eureka and Nacos as a service registry?
- What client development problems does Curator solve?

## Related topics

- [Distributed Systems Guide](../../)
- [Distributed Systems Theory and Protocols](../../protocol/)
- [Distributed Coordination](../../protocol/centralized-and-decentralized.md)
- [ZAB Explained](../../protocol/zab.md)
- [Distributed Lock Implementations](../../distributed-lock-implementations.md)
- [Distributed Configuration Centers](../../distributed-configuration-center.md)

<!-- @include: @article-footer.snippet.md -->
