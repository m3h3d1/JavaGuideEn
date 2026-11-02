---
title: "RPC Guide: Principles, Call Flow, Serialization, Service Discovery, Dubbo, and gRPC"
description: "A study and interview guide to RPC, covering call flow, dynamic proxies, serialization, network transport, service discovery, load balancing, Dubbo, gRPC, and HTTP."
category: Distributed Systems
tag:
  - RPC
  - Dubbo
  - Distributed Systems
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: RPC,RPC principles,RPC frameworks,Dubbo,gRPC,Thrift,remote procedure call,service discovery,dynamic proxy,serialization,load balancing,HTTP vs RPC,backend interviews
---

Remote procedure call (RPC) is a common way for services in a distributed system to communicate. It aims to make calling a remote service feel like calling a local method while encapsulating network communication, serialization, service discovery, load balancing, timeouts, retries, and fault tolerance.

## Who this guide is for

- Backend developers who want to understand how RPC frameworks work.
- Candidates preparing for interviews about RPC, Dubbo, and microservice communication.
- Readers who have used Feign, Dubbo, or gRPC and want to understand their call flow and service governance.
- Engineers deciding whether to use HTTP or RPC for internal service calls.

## Key topics

- RPC is a remote invocation model, not one specific protocol.
- An RPC call typically involves a dynamic proxy, serialization, network transport, service discovery, load balancing, and response deserialization.
- Frameworks such as Dubbo, gRPC, and Thrift have different priorities; RPC cannot be reduced to “better performance.”
- HTTP and RPC are not mutually exclusive: gRPC carries RPC calls over HTTP/2.
- In an interview, explain why RPC is needed, how it works, how frameworks govern services, and how to choose a framework.

## How this guide relates to other articles

RPC addresses **how services call one another**. It often appears alongside an [API gateway](../api-gateway.md), but they have different roles: the gateway handles and governs external traffic, while RPC is commonly used between internal services.

RPC frameworks also depend on service registration and discovery, load balancing, timeouts, retries, and cluster fault tolerance. For the wider context, read the guides to [distributed configuration centers](../distributed-configuration-center.md) and [ZooKeeper](../distributed-process-coordination/zookeeper/).

## Suggested reading order

1. [Why use RPC when HTTP exists?](../../cs-basics/network/http-vs-rpc.md): Understand the relationship between HTTP and RPC.
2. [RPC Explained](./rpc-intro.md): Study the call flow, core components, and framework choices.
3. [Dubbo Interview Questions](./dubbo.md): Explore service governance and production practices in a mature RPC framework.

## Core articles

- [RPC Explained](./rpc-intro.md): Learn the call flow, dynamic proxies, serialization protocols, network transport, and service discovery.
- [Dubbo Interview Questions](./dubbo.md): Review Dubbo architecture, service exposure and references, SPI extensions, load balancing, cluster fault tolerance, registries, and production practice.
- [Why use RPC when HTTP exists?](../../cs-basics/network/http-vs-rpc.md): Understand their relationship without treating RPC as simply a more advanced protocol than HTTP.

## Common interview questions

- What happens during a complete RPC call?
- Why do RPC frameworks commonly use dynamic proxies?
- Which serialization protocols are common in RPC, and how do you choose one?
- How does Dubbo expose and reference services?
- How are Dubbo SPI, load balancing, and cluster fault tolerance implemented?
- How do HTTP and RPC differ? Why is RPC common for internal calls?
- Why is gRPC considered RPC, and why does it use HTTP/2?
- What factors should guide the choice between HTTP and RPC for internal calls?

## Related topics

- [Distributed Systems Guide](../)
- [API Gateways](../api-gateway.md)
- [Spring Cloud Gateway Interview Questions](../spring-cloud-gateway-questions.md)
- [Computer Networking](../../cs-basics/network/)

<!-- @include: @article-footer.snippet.md -->
