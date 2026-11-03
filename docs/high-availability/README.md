---
title: "High Availability: SLA, Rate Limiting, Circuit Breaking, Fallbacks, Retries, Idempotency, Redundancy, and Load Testing"
description: A learning path for high-availability architecture and interviews, covering SLAs, availability metrics, single points of failure, redundancy, disaster recovery, rate limiting, fallbacks, circuit breakers, retries, idempotency, load testing, and failure drills.
category: High Availability
tag:
  - High Availability
  - System Design
  - Backend Interviews
sitemap:
  changefreq: weekly
  priority: 0.95
head:
  - - meta
    - name: keywords
      content: high-availability systems,high-availability system design,high-availability interview questions,SLA,availability metrics,rate limiting,circuit breaking,fallbacks,timeouts and retries,API idempotency,redundancy,disaster recovery,performance testing,failure drills,backend interviews
---

<!-- @include: @small-advertisement.snippet.md -->

This **high-availability knowledge map** is for backend learning, system design, and interview preparation. It groups the site's high-availability articles around reducing failures, containing their impact, recovering quickly, and limiting the effects of duplicate requests and abnormal traffic.

If you have limited time, start with [High-Availability System Design Interview Questions](./high-availability-system-interview-questions.md) for a concise list of common questions. To study the fundamentals systematically, follow the reading order below.

## Who Should Read This?

- Backend developers studying high-availability system design.
- Candidates preparing for graduate or experienced-hire backend interviews, including those at medium-sized and large companies.
- Engineers who want to improve their skills in rate limiting, fallbacks, circuit breaking, retries, idempotency, disaster recovery, and load testing.
- Readers who have encountered request timeouts, duplicate requests, downstream failures, traffic spikes, or cascading failures, but lack a systematic way to address them.

## Key Concepts

- High availability does not mean “no failures.” It means keeping failures controlled, contained, and recoverable.
- SLAs, availability metrics, RTO, and RPO are key ways to measure high-availability design.
- Rate limiting, fallbacks, circuit breakers, timeouts, and retries address different stability problems.
- Idempotency is essential for handling duplicate requests, automatic retries, repeated message consumption, and payment callbacks.
- Redundancy, disaster recovery, load testing, failure drills, and canary releases help determine whether a system can withstand production risks.

## Suggested Reading Order

1. [High-Availability System Design Interview Questions](./high-availability-system-interview-questions.md): Review common questions on SLAs, single points of failure, rate limiting, fallbacks, circuit breaking, retries, idempotency, disaster recovery, and load testing.
2. [High-Availability System Design](./high-availability-system-design.md): Learn the overall approach to designing high-availability architectures.
3. [Rate Limiting](./limit-request.md), [Fallbacks and Circuit Breakers](./fallback-and-circuit-breaker.md), and [Timeouts and Retries](./timeout-and-retry.md): Learn the three core stability controls.
4. [API Idempotency](./idempotency.md): Understand duplicate requests, business idempotency, payment callbacks, and related cases.
5. [Redundancy](./redundancy.md) and [Introduction to Performance Testing](./performance-test.md): Learn disaster recovery, load testing, capacity planning, and failure validation.

## Core Guides

### Overview and Interview Preparation

- [High-Availability System Design Interview Questions](./high-availability-system-interview-questions.md): Covers SLAs, single points of failure, rate limiting, fallbacks, circuit breakers, retries, API idempotency, redundancy, disaster recovery, and load testing.
- [High-Availability System Design](./high-availability-system-design.md): Explains SLAs, availability nines, single-point-of-failure mitigation, cache availability, asynchronous load smoothing, canary releases, and recovery.

### Stability Controls

- [Rate Limiting](./limit-request.md): Learn fixed and sliding windows, token and leaky buckets, Sentinel, Redis Lua, and Redisson rate limiting.
- [Fallbacks and Circuit Breakers](./fallback-and-circuit-breaker.md): Learn fallbacks, fallback switches, circuit-breaker state machines, cascading failures, isolation strategies, and framework selection.
- [Timeouts and Retries](./timeout-and-retry.md): Learn connection and read timeouts, exponential backoff, jitter, retry storms, and idempotency.

### Idempotency, Disaster Recovery, and Validation

- [API Idempotency](./idempotency.md): Covers idempotency keys, tokens, unique indexes, deduplication tables, optimistic and pessimistic locking, distributed locks, and payment callbacks.
- [Redundancy](./redundancy.md): Covers hardware, service, data, and geographic redundancy, as well as regional and cross-region disaster recovery and active-active architectures.
- [Introduction to Performance Testing](./performance-test.md): Learn QPS, TPS, response time, P90/P99/P999, capacity planning, load and stability testing, and testing tools.

## Common Questions

- How is availability defined for a high-availability system? What do the different numbers of nines mean?
- How do RTO and RPO differ?
- What problems do rate limiting, fallbacks, and circuit breakers solve?
- How do token buckets and leaky buckets differ? How is distributed rate limiting implemented?
- Why can timeouts and retries cause cascading failures?
- How can API idempotency be implemented? How can payment callbacks be made idempotent?
- When are redundancy, disaster recovery, regional active-active, and cross-region active-active architectures appropriate?
- How do performance, load, and stability testing differ?
- How can failure drills validate a high-availability design?

## Related Topics

- [High-Performance Systems](../high-performance/)
- [Distributed Systems](../distributed-system/)
- [System Design](../system-design/)
- [Message Queues](../high-performance/message-queue/)

<!-- @include: @article-footer.snippet.md -->
