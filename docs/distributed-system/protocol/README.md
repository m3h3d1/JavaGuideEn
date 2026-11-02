---
title: "Distributed Systems Theory, Algorithms, and Protocols: CAP, BASE, Paxos, Raft, and Consistent Hashing"
description: "A study guide to distributed systems theory and protocols, including CAP, BASE, centralized and decentralized coordination, Byzantine fault tolerance, Paxos, Raft, ZAB, Gossip, and consistent hashing."
category: Distributed Systems
tag:
  - Distributed Systems Theory
  - Distributed Protocols and Algorithms
  - Consensus Algorithms
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: distributed systems theory,distributed algorithms,distributed protocols,centralized,decentralized,CAP,BASE,Byzantine Generals Problem,Paxos,Raft,ZAB,Gossip,consistent hashing,consensus algorithms,Byzantine fault tolerance,BFT,eventual consistency,distributed systems interview questions
---

Distributed systems theory, algorithms, and protocols provide a foundation for understanding distributed systems. Rather than memorizing conclusions, focus on the trade-offs each approach makes among consistency, availability, fault tolerance, consensus, performance, and engineering complexity.

## Who this guide is for

- Backend developers who want to understand distributed consistency, consensus algorithms, and data distribution.
- Candidates preparing for distributed systems, system design, or backend architecture interviews.
- Readers who know terms such as CAP, BASE, Paxos, Raft, ZAB, and Gossip but want to understand them beyond their definitions.
- Engineers who want to understand the mechanisms behind ZooKeeper, Redis Cluster, distributed caches, and service discovery.

## Key topics

- What real engineering trade-offs are behind CAP and BASE?
- What problems do centralized and decentralized designs address? When are Leader-based coordination, majorities, and Gossip useful?
- Paxos, Raft, and ZAB all address consensus. How do their engineering complexity and use cases differ?
- Why is Gossip useful for propagating state across many nodes, and how does it differ from strongly consistent protocols?
- How does consistent hashing reduce data movement when nodes are added or removed?
- How can you explain a protocol in an interview through its problem, core idea, process, trade-offs, and use cases?

## How these articles fit together

[CAP and BASE Explained](./cap-and-base-theorem.md) covers trade-offs among consistency, availability, and partition tolerance. [Distributed Coordination](./centralized-and-decentralized.md) applies these concepts to engineering questions: who makes decisions, why an old Leader can cause problems, and when Gossip is appropriate.

Paxos, Raft, and ZAB form the consensus protocol track. Start with [Raft](./raft-algorithm.md), then read [Paxos](./paxos-algorithm.md) and [ZAB](./zab.md). Raft is a more approachable introduction, Paxos is closer to the classic theory, and ZAB covers ZooKeeper's atomic broadcast and crash recovery.

[Gossip](./gossip-protocol.md) and [consistent hashing](./consistent-hashing.md) do not establish a strongly consistent write order. They address state propagation and data mapping, respectively. Reading them after the consensus protocols helps distinguish propagating state from reaching consensus.

## Suggested reading order

1. [CAP and BASE Explained](./cap-and-base-theorem.md): Build a foundation in the trade-offs among consistency, availability, and partition tolerance.
2. [Distributed Coordination](./centralized-and-decentralized.md): Connect Leader, Quorum, split brain, Lease, Fencing Token, and Gossip.
3. [The Byzantine Generals Problem](./byzantine-generals-problem.md): Understand malicious nodes, conflicting messages, the `3m + 1` node requirement, and the limits of BFT.
4. [Raft](./raft-algorithm.md): Learn consensus through its relatively approachable Leader election and log replication mechanisms.
5. [Paxos](./paxos-algorithm.md): Study the roles, phases, and challenges of the classic consensus algorithm.
6. [ZAB](./zab.md): See how consensus applies to ZooKeeper's message broadcast and crash recovery.
7. [Gossip](./gossip-protocol.md) and [consistent hashing](./consistent-hashing.md): Learn about state propagation and data distribution in large systems.

## Core articles

### Consistency and distributed systems theory

- [CAP and BASE Explained](./cap-and-base-theorem.md): Understand the trade-offs among consistency, availability, and partition tolerance, and how BASE and eventual consistency apply in practice.
- [Distributed Coordination](./centralized-and-decentralized.md): Learn why distributed systems need coordination and how Leader/Quorum, Gossip, Lease, and Fencing Token address different coordination problems.
- [The Byzantine Generals Problem](./byzantine-generals-problem.md): Understand how non-faulty nodes can agree when some nodes are malicious or faulty.

### Consensus algorithms

- [Paxos](./paxos-algorithm.md): Learn about Proposer, Acceptor, and Learner roles, the two-phase process, and Multi-Paxos.
- [Raft](./raft-algorithm.md): Learn about Leader election, log replication, safety constraints, membership changes, and differences from Paxos.
- [ZAB](./zab.md): Learn about ZooKeeper Atomic Broadcast, message broadcast, crash recovery, ZXID, and transaction logs.

### State propagation and data distribution

- [Gossip Protocol](./gossip-protocol.md): Learn about anti-entropy, rumor propagation, Push/Pull modes, SWIM, and eventual consistency.
- [Consistent Hashing](./consistent-hashing.md): Learn about hash rings, virtual nodes, membership changes, data skew, and distributed cache use cases.

## Common interview questions

- What do C, A, and P mean in CAP? Why is partition tolerance usually unavoidable?
- What problems do BASE and eventual consistency address?
- How do centralized and decentralized designs differ? Why does having a Leader not always mean a single point of failure?
- Why is Paxos hard to understand? How do Basic Paxos and Multi-Paxos differ?
- Why is Raft easier to implement in practice? How do Leader election and log replication preserve safety?
- How are ZAB and Raft similar, and how do they differ?
- Where is Gossip useful, and why does it usually not provide strong consistency?
- Why does consistent hashing use virtual nodes?

## Related topics

- [Distributed Systems Guide](../)
- [ZooKeeper Guide](../distributed-process-coordination/zookeeper/)
- [Distributed Configuration Centers](../distributed-configuration-center.md)
- [Distributed ID Generation](../distributed-id.md)

<!-- @include: @article-footer.snippet.md -->
