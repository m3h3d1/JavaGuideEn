---
title: "Computer Networking: Layered Models, HTTP, HTTPS, DNS, TCP, UDP, ARP, and NAT"
description: A computer networking study and interview guide covering the OSI and TCP/IP models, HTTP, HTTPS, DNS, TCP, UDP, ARP, NAT, network security, and common interview questions.
category: Computer Science Fundamentals
tag:
  - Computer Networking
  - TCP/IP
  - HTTP
sidebar: false
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: computer networking, networking interview questions, OSI model, TCP/IP, HTTP, HTTPS, DNS, TCP, UDP, ARP, NAT, backend interviews
---

This **computer networking guide** is for backend developers learning networking and preparing for interviews. It organizes the articles on this site in this order: network models, the application layer, the transport layer, the network layer, and security.

## Who Should Read This

- Backend developers studying computer networking systematically.
- Candidates preparing for networking interviews for internships, new graduate roles, or experienced positions.
- Readers who know HTTP, HTTPS, TCP, DNS, or sockets only as disconnected facts.
- Engineers who want to connect networking concepts to RPC, gateways, load balancing, and system design.

## Key Topics

- Network layers divide complex communication into responsibilities handled by separate layers.
- HTTP, HTTPS, and DNS are application-layer protocols backend developers use frequently.
- Common TCP topics include connection management, reliable delivery, congestion control, TIME_WAIT, and keepalive.
- ARP and NAT help explain local network communication, access between private and public networks, and troubleshooting.
- In interviews, be ready to trace a request through its protocols, connections, encryption, name resolution, and data transfer.

## Suggested Reading Order

1. [Common Computer Networking Interview Questions, Part 1](./other-network-questions.md) and [Part 2](./other-network-questions2.md): Start with a list of frequently asked questions.
2. [The OSI Seven-Layer Model and the TCP/IP Four-Layer Model](./osi-and-tcp-ip-model.md): Learn how network layers work and what each one does.
3. [What Happens Between Entering a URL and Seeing a Web Page?](./the-whole-process-of-accessing-web-pages.md): Follow a request through DNS, TCP, HTTP, and browser processing.
4. [HTTP vs. HTTPS](./http-vs-https.md), [RSA and ECDHE in the HTTPS Handshake](./https-rsa-vs-ecdhe.md), and [Common HTTP Status Codes](./http-status-codes.md): Cover key application-layer topics.
5. [TCP's Three-Way Handshake and Four-Way Teardown](./tcp-connection-and-disconnection.md), [How TCP Provides Reliable Delivery](./tcp-reliability-guarantee.md), and [TCP TIME_WAIT Explained](./tcp-time-wait.md): Focus on TCP.

## Core Articles

### Overview and Fundamentals

- [Common Computer Networking Interview Questions, Part 1](./other-network-questions.md): Network models, HTTP, HTTPS, DNS, and other fundamentals.
- [Common Computer Networking Interview Questions, Part 2](./other-network-questions2.md): TCP, UDP, sockets, network security, and related topics.
- [The OSI Seven-Layer Model and the TCP/IP Four-Layer Model](./osi-and-tcp-ip-model.md): Network models, protocol layers, and encapsulation.
- [What Happens Between Entering a URL and Seeing a Web Page?](./the-whole-process-of-accessing-web-pages.md): Networking concepts along a complete request path.

### Application Layer

- [Common Application-Layer Protocols](./application-layer-protocol.md): HTTP, WebSocket, SMTP, FTP, SSH, DNS, and more.
- [HTTP vs. HTTPS](./http-vs-https.md): HTTPS encryption, certificates, authentication, and integrity.
- [RSA and ECDHE in the HTTPS Handshake](./https-rsa-vs-ecdhe.md): Key exchange and forward secrecy.
- [HTTP/1.0 vs. HTTP/1.1](./http1.0-vs-http1.1.md): Persistent connections, caching, the Host header, and other differences.
- [Common HTTP Status Codes](./http-status-codes.md): The meaning and use of status codes from 1xx through 5xx.
- [DNS Explained](./dns.md): Name resolution, recursive and iterative queries, and caching.
- [Why Use RPC When We Have HTTP?](./http-vs-rpc.md): How HTTP and RPC relate and differ.

### Transport Layer, Network Layer, and Security

- [TCP's Three-Way Handshake and Four-Way Teardown](./tcp-connection-and-disconnection.md): Connection setup, teardown, and key states.
- [How TCP Provides Reliable Delivery](./tcp-reliability-guarantee.md): Sequence numbers, acknowledgments, retransmission, flow control, and congestion control.
- [TCP TIME_WAIT Explained](./tcp-time-wait.md): Why TIME_WAIT exists, its effects, and when tuning may be appropriate.
- [TCP Keepalive vs. HTTP Keep-Alive](./tcp-keepalive-vs-http-keepalive.md): Transport-layer keepalive and application-layer persistent connections.
- [Why TCP Is a Byte Stream While UDP Is Message-Oriented](./tcp-byte-stream-udp-datagram.md): Data boundaries in TCP and UDP.
- [ARP](./arp.md), [NAT](./nat.md), and [Common Network Attacks](./network-attack-means.md): Network-layer and security fundamentals.

## Common Questions

- How do the OSI seven-layer model and the TCP/IP four-layer model differ?
- What happens at the network layer between entering a URL and seeing a web page?
- How do HTTP and HTTPS differ, and how does the HTTPS handshake work?
- What are the main differences between HTTP/1.0, HTTP/1.1, and HTTP/2?
- What do common HTTP status codes mean?
- Why does TCP use a three-way handshake and a four-way teardown?
- How does TCP provide reliable delivery? How do flow control and congestion control differ?
- Why does TIME_WAIT exist, and how do you investigate a large number of TIME_WAIT connections?
- How do TCP Keepalive and HTTP Keep-Alive differ?
- What problems do DNS, ARP, and NAT solve?

## Related Guides

- [Computer Science Fundamentals](../)
- [Operating Systems](../operating-system/)
- [Distributed Systems](../../distributed-system/)
- [RPC](../../distributed-system/rpc/)
- [High-Performance Systems](../../high-performance/)

<!-- @include: @article-footer.snippet.md -->
