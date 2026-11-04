---
title: Common Computer Networking Interview Questions, Part 1
description: Review common networking interview questions about network layers, HTTP versions, HTTPS, DNS, WebSocket, SSE, and Ping.
category: Computer Science Basics
tag:
  - Computer Networking
head:
  - - meta
    - name: keywords
      content: networking interview questions,TCP/IP four-layer model,HTTP,HTTPS,HTTP/1.1 vs HTTP/2,HTTP/3,QUIC,TCP handshake,UDP,DNS,WebSocket,SSE,GET vs POST,application-layer protocols,network layers,head-of-line blocking,Ping,ARP
---

<!-- markdownlint-disable MD033 -->

Computer networking is a common topic in backend and new-graduate interviews. **TCP/IP layers, HTTP, HTTPS, DNS, WebSocket, and the TCP handshake** come up in real development scenarios, from loading a page after entering a URL to diagnosing slow APIs and failed connections.

This first part of the networking interview guide starts with network-layer models, then reviews key application-layer and HTTP concepts. Use it to review networking fundamentals or as a quick reference before a Java backend or general software interview.

## Networking Fundamentals

### Network Layering Models

#### What Is the OSI Seven-Layer Model, and What Does Each Layer Do?

The **OSI seven-layer model** is a network-layering model proposed by the International Organization for Standardization. The diagram shows its structure and the function of each layer:

![The functions of each OSI layer](../images/shared/osi-7-model.png)

Each layer focuses on a specific responsibility and uses services from the layer below it. For example, the transport layer relies on the network layer for routing and addressing to determine where to send data.

**The OSI model has a clear structure and complete theory, but it is complex and impractical, and some functions are repeated across layers.**

That diagram may feel abstract. Here is another illustration that makes the model easier to visualize:

![Another illustration of the OSI seven-layer model](../images/shared/osi-2.png)

#### ⭐️ What Is the TCP/IP Four-Layer Model, and What Does Each Layer Do?

The **TCP/IP four-layer model** is widely used today. It can be viewed as a simplified version of the OSI model, with four layers:

1. Application layer
2. Transport layer
3. Network layer
4. Network interface layer

The TCP/IP and OSI models do not map to each other exactly, but they can be roughly aligned as shown below:

![How the TCP/IP and OSI models correspond](../images/shared/tcp-ip-4-model.png)

For more on the role of each layer, see [The OSI Seven-Layer Model and the TCP/IP Four-Layer Model](./osi-and-tcp-ip-model.md).

#### Why Are Networks Layered?

Consider a backend application built with a framework. It is often divided into three layers with different responsibilities (complex systems may have more):

1. Repository (database operations)
2. Service (business logic)
3. Controller (frontend/backend communication)

**Complex systems use layers so each one can focus on a particular responsibility. Networks are layered for the same reason.**

There are three main reasons to layer a network:

1. **Layers are independent:** A layer does not need to know how other layers are implemented; it only needs to know how to use the services below it. This is similar to calling an interface in a layered application.
2. **Layers improve flexibility and replaceability:** Each layer can use the technology best suited to its job, as long as its services and interfaces remain consistent. This is similar to high cohesion and loose coupling in application design.
3. **Layers break large problems into smaller ones:** Clear boundaries make complex networking systems easier to design, implement, and standardize. This is similar to decomposing an application into smaller tasks with well-defined goals and interfaces.

There is a well-known saying in computer science:

> Any problem in computer science can be solved by adding a layer of indirection. The computer system as a whole is designed around a strict hierarchy of layers.

### Common Network Protocols

#### ⭐️ What Are Some Common Application-Layer Protocols?

![Common application-layer protocols](../images/shared/application-layer-protocol.png)

- **HTTP (Hypertext Transfer Protocol):** An application-layer protocol for hypertext and multimedia, designed mainly for communication between web clients and servers. HTTP/1.x and HTTP/2 usually use TCP; HTTP/3 runs over QUIC, which is based on UDP.
- **SMTP (Simple Mail Transfer Protocol):** A TCP-based protocol for sending email. Note ⚠️: SMTP sends email but does not retrieve it. Use POP3 or IMAP to receive messages.
- **POP3/IMAP:** TCP-based email retrieval protocols. IMAP is newer and supports features such as search, labels, folders, archiving, and synchronizing mail across devices. Nearly all modern email clients and servers support it.
- **FTP (File Transfer Protocol):** A TCP-based protocol for transferring files between computers independently of their operating systems or storage methods. Note ⚠️: FTP does not encrypt data in transit. Use a more secure protocol such as SFTP for sensitive data.
- **Telnet:** A TCP-based remote terminal protocol. It sends all data, including usernames and passwords, in plaintext, which creates security risks. This is why SSH is commonly used instead.
- **SSH (Secure Shell):** A TCP-based protocol that uses encryption and authentication for secure access and file transfers.
- **RTP (Real-time Transport Protocol):** Usually uses UDP, though TCP is also supported. RTP provides end-to-end real-time data transfer, but does not reserve resources or guarantee delivery quality.
- **DNS (Domain Name System):** Usually uses UDP on port 53 to map domain names to IP addresses. It uses TCP for large responses and zone transfers.

For more detail, see [Common Application-Layer Protocols](./application-layer-protocol.md).

#### What Are Some Common Transport-Layer Protocols?

![Common transport-layer protocols](../images/shared/transport-layer-protocol.png)

- **TCP (Transmission Control Protocol):** Provides **connection-oriented**, **reliable** data delivery.
- **UDP (User Datagram Protocol):** Provides **connectionless, best-effort** delivery without guaranteeing reliability. It is simple and efficient.

#### What Are Some Common Network-Layer Protocols?

![Common network-layer protocols](./images/network-model/nerwork-layer-protocol.png)

- **IP (Internet Protocol):** A core TCP/IP network-layer protocol. It defines packet formats and handles addressing and routing so packets can cross networks and reach their destinations. IPv4 and IPv6 are both in use, with IPv6 designed as IPv4's successor.
- **ARP (Address Resolution Protocol):** Maps network-layer addresses to link-layer addresses. A host needs the next hop's MAC address to transmit an IP datagram over a local link.
- **ICMP (Internet Control Message Protocol):** Carries network status and error messages and is used for diagnosis and troubleshooting. Ping, for example, uses ICMP to test reachability.
- **NAT (Network Address Translation):** Translates addresses between networks, commonly between private and public networks. Hosts in a LAN can use private addresses while sharing public addressing on the internet.
- **OSPF (Open Shortest Path First):** A widely used interior gateway protocol (IGP) based on a link-state algorithm. It considers factors such as bandwidth and delay when selecting routes.
- **RIP (Routing Information Protocol):** A dynamic IGP based on a distance-vector algorithm. It uses hop count as its metric and selects the route with the fewest hops.
- **BGP (Border Gateway Protocol):** Exchanges Network Layer Reachability Information (NLRI) between routing domains and is highly flexible and extensible.

## HTTP

### ⭐️ What Happens Between Entering a URL and Seeing a Web Page? (Very Important)

> A similar question: Which protocols are involved when you open a web page?

Here is an illustration from _Illustrated HTTP_:

<img src="../images/shared/url-to-page-loading-process.jpg" alt="The full process from entering a URL to displaying a web page" style="zoom:50%" />

One correction to the diagram: the protocol is OSPF, not OPSF. OSPF (Open Shortest Path First) is a routing protocol developed by the Internet Engineering Task Force.

The process has these steps:

1. Enter the web page's URL in the browser.
2. The browser uses DNS to find the IP address for the domain.
3. The browser uses the IP address and port to request a TCP connection to the server.
4. Over TCP, the browser sends an HTTP request for the page content.
5. The server processes the request and returns an HTTP response.
6. The browser parses the HTML in the response, renders the page structure and styles, and requests other resources referenced by the HTML, such as images, CSS, and JavaScript, until the page has loaded.
7. When communication is no longer needed, the browser can close the TCP connection or wait for the server to close it.

For details, see [What Happens Between Entering a URL and Seeing a Web Page?](./the-whole-process-of-accessing-web-pages.md). Highly recommended.

### ⭐️ What Are HTTP Status Codes?

HTTP status codes describe the result of an HTTP request. For example, a 2xx code means the request was successfully processed.

![Common HTTP status codes](../images/shared/http-status-code.png)

For a detailed overview, see [Common HTTP Status Codes](./http-status-codes.md).

### What Are Common HTTP Header Fields?

| Request header      | Description                                                                                    | Example                                                                            |
| :------------------ | :--------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| Accept              | Media types the client can accept.                                                             | `Accept: text/plain`                                                               |
| Accept-Charset      | Character sets the client can accept.                                                          | `Accept-Charset: utf-8`                                                            |
| Accept-Datetime     | A version of the resource identified by a date and time.                                       | `Accept-Datetime: Thu, 31 May 2007 20:35:00 GMT`                                   |
| Accept-Encoding     | Supported content encodings. See HTTP compression.                                             | `Accept-Encoding: gzip, deflate`                                                   |
| Accept-Language     | Natural languages the client can accept.                                                       | `Accept-Language: en-US`                                                           |
| Authorization       | Credentials for authenticating the client to the server.                                       | `Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==`                                |
| Cache-Control       | Directives that caches in the request/response chain must follow.                              | `Cache-Control: no-cache`                                                          |
| Connection          | Connection options preferred by the client.                                                    | `Connection: keep-alive`                                                           |
| Content-Length      | Request-body length in octets.                                                                 | `Content-Length: 348`                                                              |
| Content-MD5         | Base64-encoded MD5 digest of the request body.                                                 | `Content-MD5: Q2hlY2sgSW50ZWdyaXR5IQ==`                                            |
| Content-Type        | Media type of the request body, commonly used with POST and PUT.                               | `Content-Type: application/x-www-form-urlencoded`                                  |
| Cookie              | Cookies previously sent by the server in `Set-Cookie`.                                         | `Cookie: $Version=1; Skin=new;`                                                    |
| Date                | Date and time when the message was sent, in the HTTP-date format.                              | `Date: Tue, 15 Nov 1994 08:12:31 GMT`                                              |
| Expect              | Behavior the client expects from the server.                                                   | `Expect: 100-continue`                                                             |
| From                | Email address of the user making the request.                                                  | `From: user@example.com`                                                           |
| Host                | Target hostname and optional port. The port may be omitted if it is the service's default.     | `Host: en.wikipedia.org`                                                           |
| If-Match            | Perform the method only if the current representation matches one of the supplied entity tags. | `If-Match: "737060cd8c284d8af7ad3082f209582d"`                                     |
| If-Modified-Since   | Return `304 Not Modified` if the resource has not changed since the given date.                | `If-Modified-Since: Sat, 29 Oct 1994 19:43:31 GMT`                                 |
| If-None-Match       | Return `304 Not Modified` if the resource's ETag has not changed.                              | `If-None-Match: "737060cd8c284d8af7ad3082f209582d"`                                |
| If-Range            | Send the requested range if the entity is unchanged; otherwise send the full entity.           | `If-Range: "737060cd8c284d8af7ad3082f209582d"`                                     |
| If-Unmodified-Since | Perform the request only if the entity has not changed since the given date.                   | `If-Unmodified-Since: Sat, 29 Oct 1994 19:43:31 GMT`                               |
| Max-Forwards        | Limit the number of times a message can be forwarded by proxies and gateways.                  | `Max-Forwards: 10`                                                                 |
| Origin              | Identifies the origin making a cross-origin request.                                           | `Origin: http://www.example-social-network.com`                                    |
| Pragma              | Implementation-specific directives that may affect the request or response chain.              | `Pragma: no-cache`                                                                 |
| Proxy-Authorization | Credentials for authenticating to a proxy.                                                     | `Proxy-Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==`                          |
| Range               | Requests only part of a resource. Byte offsets start at zero.                                  | `Range: bytes=500-999`                                                             |
| Referer             | The page that linked the client to the requested page.                                         | `Referer: http://en.wikipedia.org/wiki/Main_Page`                                  |
| TE                  | Transfer encodings the client is willing to accept.                                            | `TE: trailers, deflate`                                                            |
| Upgrade             | Requests an upgrade to another protocol.                                                       | `Upgrade: HTTP/2.0, SHTTP/1.3, IRC/6.9, RTA/x11`                                   |
| User-Agent          | Identifies the client software.                                                                | `User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/21.0` |
| Via                 | Lists the proxies through which the request was sent.                                          | `Via: 1.0 fred, 1.1 example.com (Apache/1.1)`                                      |
| Warning             | General warning that there may be a problem with the response body.                            | `Warning: 199 Miscellaneous warning`                                               |

### ⭐️ What Is the Difference Between HTTP and HTTPS? (Important)

![HTTP compared with HTTPS](../images/shared/http-vs-https.png)

- **Port:** HTTP defaults to port 80; HTTPS defaults to port 443.
- **URL scheme:** HTTP URLs start with `http://`; HTTPS URLs start with `https://`.
- **Security and transport:** HTTP without TLS does not provide confidentiality, integrity, or peer authentication by default. HTTPS uses TLS to protect HTTP. HTTP/1.1 and HTTP/2 usually use TLS over TCP; HTTP/3 uses QUIC with integrated TLS 1.3. The TLS handshake authenticates the peer and establishes traffic keys; symmetric AEAD protects subsequent data. Certificates are mainly used for authentication, so it is inaccurate to say that “the certificate encrypts the symmetric key.”
- **SEO:** Search engines may prefer HTTPS sites because HTTPS provides stronger security and privacy, which can affect search rankings.

For more detail, see [HTTP vs. HTTPS](./http-vs-https.md).

### RSA vs. ECDHE in the HTTPS Handshake (Application Layer)

The key difference is whether the session-key material is **sent to the other side or derived by both sides**.

In a TLS 1.2 static RSA handshake, the client generates `PreMasterSecret`, encrypts it with the RSA public key in the server certificate, and sends it to the server. The server decrypts it with its RSA private key. If an attacker saves the handshake traffic and later obtains the private key, they may recover past session keys. Static RSA does not provide forward secrecy.

ECDHE does not transmit the shared secret. The client and server generate ephemeral key pairs, exchange public keys, and derive the same secret locally. The server's certificate private key signs the temporary parameters to authenticate them; it does not decrypt the session key.

In short: **RSA has the client encrypt and send the secret; ECDHE has both sides derive a secret using temporary keys. ECDHE provides forward secrecy and is the common approach in modern HTTPS.**

For details, see [RSA and ECDHE in the HTTPS Handshake](./https-rsa-vs-ecdhe.md).

### ⭐️ Why Use RPC When We Have HTTP?

HTTP and RPC do not replace each other, and one is not inherently more advanced than the other.

Both can call services. The real difference is whether you model a remote call as a “resource access” or a “method call.”

For external APIs used by websites, apps, or third-party systems, HTTP is often a better fit: it is widely supported, easy to debug, and simple to adopt. Clients can test it with Postman or `curl`.
For frequent internal service calls, RPC may be more convenient, especially when there are many services, long call chains, and needs for discovery, timeouts, retries, load balancing, and tracing. RPC is not just about speed; it also handles common service-call concerns.

Do not reduce the choice to “HTTP for external APIs, RPC for internal services.”

That rule of thumb can help beginners, but a real decision should account for the caller, team infrastructure, troubleshooting, performance needs, and long-term maintenance.

If a small system runs reliably on HTTP, do not add RPC just to make it look more like a microservice architecture.

If internal calls are getting more complex and require more HTTP SDKs, gateway features, monitoring, and retry logic, consider RPC.

In short: **HTTP is capable, and RPC is not magic. Choose the one that solves your current problem at lower overall cost.**

For more, see [⭐️ Why Use RPC When We Have HTTP?](./http-vs-rpc.md).

### What Is the Difference Between HTTP/1.0 and HTTP/1.1?

![HTTP/1.0 compared with HTTP/1.1](../images/shared/http1.0-vs-http1.1.png)

- **Connections:** HTTP/1.0 uses short-lived connections by default; HTTP/1.1 supports persistent connections. These refer to the underlying TCP connection.
- **Status codes:** HTTP/1.1 added many status codes, including `100 Continue` (the server is willing to receive a large request body), `206 Partial Content` (a range request), `409 Conflict` (a request conflicts with the current resource state), and `410 Gone` (the resource is no longer available and may be permanently gone).
- **Caching:** HTTP/1.0 mainly used `If-Modified-Since` and `Expires`. HTTP/1.1 added more cache controls, including entity tags and `If-Unmodified-Since`, `If-Match`, and `If-None-Match`.
- **Bandwidth:** HTTP/1.0 could require a full resource even when the client needed only part of it. HTTP/1.1 added the `Range` request header, allowing partial responses with `206 Partial Content` and making better use of bandwidth and connections.
- **Host header:** HTTP/1.1 added the `Host` header, allowing multiple domain names to be hosted on one IP address. HTTP/1.0 did not support this virtual-hosting mechanism.

For a more detailed comparison, see [HTTP/1.0 vs. HTTP/1.1](./http1.0-vs-http1.1.md).

### ⭐️ What Is the Difference Between HTTP/1.1 and HTTP/2?

![HTTP/1.1 compared with HTTP/2](../images/shared/http1.1-vs-http2.0.png)

- **Multiplexing:** HTTP/2 can carry multiple requests and responses at the same time over one connection. HTTP/1.1 processes requests serially on a connection, and browsers commonly open several TCP connections per origin. HTTP/2 can handle concurrent requests more efficiently and reduce connection overhead.
- **Binary frames:** HTTP/2 uses binary frames, while HTTP/1.1 uses text messages. Frames are more compact and efficient to process.
- **Head-of-line blocking:** HTTP/2 multiplexes requests and responses over one TCP connection, solving HTTP/1.1's application-layer head-of-line blocking. It is still affected by TCP-level head-of-line blocking.
- **Header compression:** HTTP/1.1 supports body compression but not header compression. HTTP/2 uses HPACK to compress headers and reduce network overhead.
- **Server push:** HTTP/2 can push related resources along with a requested resource, reducing client requests and latency. With HTTP/1.1, the client must request each resource itself.

HTTP/2 multiplexing (image source: [HTTP/2 for Web Developers](https://blog.cloudflare.com/http-2-for-web-developers/)):

![HTTP/2 multiplexes requests and responses over one TCP connection](../images/shared/http2.0-multiplexing.png)

HTTP/2 multiplexing lets requests and responses share one TCP connection, avoiding the need for multiple parallel connections and reducing connection setup and maintenance overhead. HTTP/1.1 supports persistent connections, but browsers commonly open several connections to the same host to mitigate head-of-line blocking.

### What Is the Difference Between HTTP/2 and HTTP/3?

![HTTP/2 compared with HTTP/3](../images/shared/http2.0-vs-http3.0.png)

- **Transport:** HTTP/2 uses TCP. HTTP/3 maps HTTP semantics onto QUIC, which runs over UDP and implements reliable delivery, congestion control, flow control, and TLS 1.3 protection.
- **Connection setup:** HTTPS with HTTP/2 establishes TCP and then performs a TLS handshake. HTTP/3 combines transport negotiation and TLS 1.3 in QUIC setup. New QUIC connections usually take 1 RTT. 0-RTT is for resumption when the client has prior connection state, and early data can be replayed. Compare latency using the same measurement, such as when the first request can be sent or when the first byte arrives.
- **Header compression:** HTTP/2 uses HPACK; HTTP/3 uses QPACK.
- **Head-of-line blocking:** HTTP/2 multiplexes streams over one TCP connection, so packet loss blocks all streams on that connection. QUIC provides independent reliable, ordered delivery for each stream. Loss delays the affected stream but usually does not stop other streams.
- **Connection migration:** QUIC identifies connections with a Connection ID independent of the IP/port four-tuple. A Connection ID is not fixed at 64 bits: QUIC v1 allows IDs from zero to 20 bytes, and endpoints can issue and retire multiple IDs. After a network-address change, endpoints can validate the new path and keep the logical connection.
- **Recovery:** HTTP/3 can recover from packet loss and delay without relying on TCP's recovery mechanism.
- **Security:** HTTP/2 typically uses TLS to protect HTTP headers and payloads, but IP/TCP headers and outer TLS record fields remain visible. QUIC uses TLS-derived keys to protect packet payloads and header protection for packet numbers and some first-byte fields. IP/UDP headers and some QUIC fields remain visible, and Version Negotiation packets do not have the same cryptographic protection. QUIC does not encrypt every header in the packet.

Protocol stack comparison for HTTP/1.0, HTTP/2, and HTTP/3:

![Protocol stacks for HTTP/1, HTTP/2, and HTTP/3](../images/shared/http-3-implementation.png)

The diagram below compares HTTP/2 and HTTP/3 in more detail:

![Detailed comparison of HTTP/2 and HTTP/3](../images/shared/http2-and-http3-stacks-comparison.png)

As shown above:

- **HTTP/2:** Uses TCP, HPACK for header compression, and TLS for encryption.
- **HTTP/3:** Uses QUIC over UDP, QPACK for header compression, and TLS integrated into QUIC. QUIC supports connection migration, congestion control, and flow control.

For a detailed history from HTTP/1.0 to HTTP/3, see [Engineering Optimizations from HTTP/1 to HTTP/3](https://dbwu.tech/posts/http_evolution/).

### How Does Head-of-Line Blocking Differ Between HTTP/1.1 and HTTP/2?

HTTP/1.1 head-of-line blocking mainly results from the lack of multiplexing:

- On one TCP connection, requests and responses are processed in order. If a large resource is being transferred, smaller resources such as CSS files must wait for it to finish.
- To load several resources at once, browsers often open multiple TCP connections (commonly up to six). Each connection is still limited to sequential request-response handling, so **application-layer head-of-line blocking** remains.

HTTP/2 multiplexes requests and responses over a single TCP connection, solving **HTTP/1.1's application-layer head-of-line blocking**. However, HTTP/2 is still affected by **TCP-level head-of-line blocking**:

- HTTP/2 splits resources into frames and assigns each resource a stream ID, allowing data from multiple resources to be interleaved on one TCP connection.
- TCP delivers data in order. If a packet is lost, later packets must wait until the missing data is retransmitted, even if they have already arrived. This causes **TCP-level head-of-line blocking**.
- For example, if a TCP packet carrying data for several resources, such as JavaScript and CSS, is lost, all streams wait for retransmission of the missing packet.

This table summarizes the difference:

| Aspect               | HTTP/1.1 head-of-line blocking                                                       | HTTP/2 head-of-line blocking                                      |
| -------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| **Layer**            | Application layer (HTTP limitation)                                                  | Transport layer (TCP limitation)                                  |
| **Cause**            | No multiplexing; requests and responses are sequential                               | TCP delivers data in order, so packet loss blocks the connection  |
| **Scope**            | One request/response can hold up later requests                                      | One lost TCP packet affects all HTTP/2 streams on that connection |
| **Mitigation**       | Open multiple TCP connections                                                        | Reduce packet loss or use QUIC over UDP                           |
| **Typical scenario** | Occurs with sequential requests, especially when a large resource blocks a small one | More visible on networks with higher packet loss                  |

### ⭐️ HTTP Is Stateless. How Can an Application Preserve User State?

HTTP is **stateless**. By default, the server cannot tell whether two consecutive requests came from the same user or what that user did before. It is like a forgetful server that does not remember who you are or what you ordered the last time.

Real web applications, such as online stores and login systems, need to remember state like shopping-cart items and login information. Common mechanisms include:

**Option 1: Session with Cookie (the traditional approach):**

![How a session and cookie preserve login state](../images/shared/session-cookie-authentication-process.png)

This is one of the oldest and most common approaches:

1. The user sends a username, password, and verification code to the server to log in.
2. After validating them, the server creates and stores a session for the user, containing state such as cart items or login information, and assigns it a unique `SessionID`.
3. The server sends the `SessionID` to the browser in the `Set-Cookie` response header.
4. The browser stores it as a cookie and automatically includes it in later requests to the server while the user remains logged in.
5. The server reads the `SessionID` from the cookie and uses it to find the session and retrieve the user's state.

Keep these points in mind when using sessions:

- **Cookie support:** Session-based features require cookies to be enabled in the user's browser.
- **Session expiration:** Choose an expiration time that balances security and user experience.
- **Session ID security:** Set `HttpOnly` on the cookie to prevent client-side scripts such as JavaScript from reading it. Set `Secure` to send the `SessionID` only over HTTPS.

Session data is stored on the server. Common storage options include:

- **Server memory:** Simple and fast, but data is lost on restart and sharing state across servers is difficult. Suitable for small applications.
- **Database (such as MySQL or PostgreSQL):** Persistent, but reads and writes are slower, so this is less common.
- **Distributed cache (such as Redis):** Fast and supports distributed deployments; widely used in large applications.

**Option 2: URL rewriting when cookies are disabled**

If the browser has cookies disabled or they cannot be used, URL rewriting is an alternative. It appends the `SessionID` to the URL as a parameter, for example, <http://www.example.com/page?sessionid=xxxxxx>. The server reads the `sessionid` parameter to find the session data.

This approach is uncommon because:

- URLs become longer and less readable.
- The `SessionID` is exposed in the URL and can be copied, shared, or logged, creating security risks.
- It can be unfriendly to search engine optimization (SEO).

**Option 3: Token-based authentication (such as JWT)**

This stateless authentication approach is increasingly popular, especially in decoupled frontend/backend architectures and microservices.

![JWT authentication flow](../images/shared/jwt-authentication-process.png)

Using JWT as an example (the same general idea applies to other tokens), the simplified flow is:

1. The user sends a username, password, and verification code to the server to log in.
2. If they are valid, the server returns a signed token such as a JWT.
3. The client stores the token, for example in the browser's `localStorage`.
4. The client includes the JWT in the header of later requests.
5. The server validates the JWT and reads the relevant user information.

For more on JWT, see:

- [JWT Fundamentals](https://javaguide.cn/system-design/security/jwt-intro.html)
- [Advantages and Disadvantages of JWT Authentication](https://javaguide.cn/system-design/security/advantages-and-disadvantages-of-jwt.html)

In summary, although HTTP is stateless, web applications can track user state with cookies and sessions, URL rewriting, or tokens. **Cookie plus session is the traditional approach, while token-based authentication is increasingly common in modern web applications.**

### What Is the Difference Between a URI and a URL?

- A URI (Uniform Resource Identifier) identifies a resource.
- A URL (Uniform Resource Locator) identifies a resource and provides its location. A URL is a specific type of URI.

A URI is like an ID number; a URL is more like a street address. A URL identifies the resource and tells you where to find it.

### What Is the Difference Between a Cookie and a Session?

More precisely, this is part of authentication and authorization. See [Authentication and Authorization Fundamentals](https://javaguide.cn/system-design/security/basis-of-authority-certification.html) for details.

### ⭐️ What Is the Difference Between GET and POST?

This question has been widely discussed on Zhihu: <https://www.zhihu.com/question/28586791>.

GET and POST are common HTTP methods with different purposes and use cases. You can compare them in several ways, but focus on their semantics:

- **Semantics (the main difference):** GET usually retrieves a resource; POST usually creates or modifies one.
- **Idempotency:** GET is idempotent: repeating it does not change the resource state. POST is not necessarily idempotent; each request may produce a different result or change state.
- **Format:** GET parameters are usually in the URL query string. POST parameters are usually in the body, which can use formats such as `application/x-www-form-urlencoded`, `multipart/form-data`, or `application/json`. URL length is limited by browsers and servers, while POST body size has no universal limit. GET can technically carry a body, but this is not recommended because of compatibility and semantic issues.
- **Caching:** Because GET is idempotent, browsers and intermediaries such as proxies and gateways may cache it. POST can have side effects and is less commonly cached.
- **Security:** GET and POST are both insecure over plain HTTP because HTTP sends data in plaintext; use HTTPS to encrypt transport. GET parameters are more likely to appear in URLs and may be exposed in logs or browser history.

The key is to understand the semantic difference and choose the method accordingly. Some projects use POST for every request; this is a team convention rather than a universal rule.

## WebSocket

### What Is WebSocket?

WebSocket is a full-duplex communication protocol that runs over TCP. The client and server can both send and receive data.

The protocol was introduced in 2008 and became an international standard in 2011. Most modern browsers support it, and WebSocket libraries are available for many programming languages, frameworks, and servers.

WebSocket is an application-layer protocol that provides persistent communication. After a single handshake, the client and server can keep a connection open and exchange data in both directions.

![WebSocket uses a persistent connection for two-way communication](../images/shared/websocket-communication-diagram.png)

Common use cases include:

- Live video comments
- Real-time message delivery; see [Real-Time Messaging on the Web](https://javaguide.cn/system-design/web-real-time-message-push.html)
- Multiplayer games
- Collaborative editing
- Chat applications
- …

### ⭐️ How Does WebSocket Differ from HTTP?

WebSocket and HTTP are both application-layer protocols that can run over TCP.

Their main differences are:

- WebSocket supports real-time, two-way communication. HTTP follows a request-response model initiated by the client; the server cannot send an unsolicited response over an ordinary HTTP request.
- WebSocket uses the `ws://` or `wss://` scheme (`wss` is protected by TLS), while HTTP uses `http://` or `https://`.
- WebSocket supports extensions and subprotocols, for example for compression or encryption.
- WebSocket frames have relatively small protocol overhead. HTTP requests carry headers, though HTTP/2 uses binary frames and header compression to reduce overhead.

### How Does a WebSocket Connection Work?

A WebSocket connection is established in these steps:

1. The client sends an HTTP request with fields such as `Upgrade: websocket` and `Sec-WebSocket-Key` to request a protocol upgrade.
2. If the server supports WebSocket, it responds with status `101` and fields such as `Connection: Upgrade` and `Sec-WebSocket-Accept`.
3. The client and server exchange data in both directions. Data is sent in frames; a message can consist of one or more frames, which the receiver reassembles.
4. Either side can send a close frame. The other side responds with a close frame, after which both sides close the TCP connection.

Applications may also use heartbeats to monitor an otherwise idle connection.

### ⭐️ WebSocket vs. Short Polling vs. Long Polling

All three approaches help a client receive new server data without a page refresh, but they differ in latency, resource use, and complexity.

**1. Short polling**

- **How it works:** The client sends an HTTP request at a fixed interval, such as every five seconds. The server responds immediately.
- **Advantages:** Simple to implement and works with ordinary HTTP infrastructure.
- **Disadvantages:** Updates may wait until the next poll. Most requests may return no new data, increasing server and network load.

**2. Long polling**

- **How it works:** If no new data is available, the server keeps the request open until data arrives or the request times out. The client then sends another request.
- **Advantages:** New data can be delivered without waiting for the next polling interval; fewer responses contain no data.
- **Disadvantages:** The server must keep many requests open, consuming connection or thread resources. The client still needs to send another request after each response, using HTTP's request-response model.

**3. WebSocket**

- **How it works:** The client and server establish a persistent TCP connection through an HTTP Upgrade handshake, then either side can send data at any time.
- **Advantages:** Low latency, two-way communication, and no repeated request setup.
- **Disadvantages:** Both sides must support WebSocket. Applications need to manage connection health and reconnection, making it more complex to implement than polling.

![WebSocket compared with short and long polling](../images/shared/websocket-communication-diagram.png)

### ⭐️ How Does SSE Differ from WebSocket?

Server-Sent Events (SSE) and WebSocket can both deliver real-time updates to a browser. Their main differences are:

1. **Direction:** SSE is one-way: the server sends events to the client. The client needs a separate HTTP request to send data. WebSocket supports two-way communication.
2. **Protocol:** SSE uses a long-lived HTTP or HTTPS response stream, so it works with standard HTTP infrastructure. WebSocket uses `ws://` or `wss://`, is established through an HTTP Upgrade request, and requires a server that supports the WebSocket protocol.
3. **Complexity:** SSE mainly requires server-side handling, and browsers provide the `EventSource` API. WebSocket requires server-side connection handling and a client API, plus heartbeats and reconnection where needed.
4. **Reconnection:** `EventSource` reconnects automatically. WebSocket reconnection is usually implemented by the application.
5. **Data:** SSE is designed for UTF-8 text; binary data needs an encoding such as Base64. WebSocket supports both text and binary data directly.

SSE is a common choice for streaming responses from large language model APIs such as OpenAI and DeepSeek because it uses standard HTTP and is relatively simple to deploy.

For example, a request to DeepSeek can be inspected in the browser's developer tools:

![DeepSeek response headers](../images/shared/deepseek-sse.png)

![DeepSeek sends events continuously with text/event-stream](../images/shared/deepseek-sse-eventstream.png)

The `text/event-stream` response header indicates SSE. The response data is delivered as a stream of chunks.

## PING

### What Does the PING Command Do?

The `ping` command is a common network diagnostic tool for checking connectivity and latency between hosts.

For example, we can ping Baidu:

```bash
# Send four ping requests to www.baidu.com
❯ ping -c 4 www.baidu.com

PING www.a.shifen.com (14.119.104.189): 56 data bytes
64 bytes from 14.119.104.189: icmp_seq=0 ttl=54 time=27.867 ms
64 bytes from 14.119.104.189: icmp_seq=1 ttl=54 time=28.732 ms
64 bytes from 14.119.104.189: icmp_seq=2 ttl=54 time=27.571 ms
64 bytes from 14.119.104.189: icmp_seq=3 ttl=54 time=27.581 ms

--- www.a.shifen.com ping statistics ---
4 packets transmitted, 4 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 27.571/27.938/28.732/0.474 ms
```

The output usually includes:

1. **ICMP Echo Request details:** sequence number and TTL (Time to Live).
2. **Target hostname or IP address:** shown on the first line.
3. **Round-trip time (RTT):** time from sending an ICMP Echo Request to receiving the Echo Reply. This measures network latency.
4. **Statistics:** packets sent and received, packet loss, and minimum, average, maximum, and standard deviation of RTT.

If the target does not respond, there may be a connectivity problem, although some hosts or network administrators block ICMP Echo requests. A high RTT indicates high latency.

### How Does the PING Command Work?

`ping` uses **ICMP (Internet Control Message Protocol)** at the network layer. It works by sending and receiving ICMP messages.

An ICMP message includes a type field. ICMP has many message types, broadly divided into two categories:

- **Query messages:** send a request to a host and expect a response.
- **Error messages:** report a network error to the source host.

`ping` uses ICMP Echo Request (type 8) and Echo Reply (type 0), which are query messages.

- `ping` sends an ICMP Echo Request to the target.
- If the path allows it, the target returns an ICMP Echo Reply.

### ⭐️ If Ping Works, Does That Mean TCP Will Work?

The short answer is **no**.

Ping uses ICMP at the network layer, while TCP connections use TCP at the transport layer. They may follow the same route, but network devices can apply different policies by protocol, port, connection state, or security rules. A successful ping only shows that ICMP Echo messages can travel to and from the target; it does not prove that a TCP port is reachable.

![The paths taken by ICMP and TCP can differ](../images/shared/can-ping-but-tcp-may-not-connect-icmp-and-tcp-path-differences.png)

Common causes include:

- **Different firewall rules:** A network may allow ICMP for diagnostics but restrict TCP ports, allowing only ports such as `22`, `80`, and `443`.
- **The service is down or not listening:** The host may respond to ICMP even if Nginx is stopped or MySQL is not listening.
- **NAT, load balancers, or security devices:** A public IP may belong to an intermediary, so its ICMP response does not prove that a backend service is available.
- **TLS SNI filtering:** The TCP handshake may succeed, but a middlebox may block or reset the connection after inspecting the SNI in the TLS `ClientHello`.

The reverse is also true: **a failed ping does not prove that TCP is blocked**. Some servers and cloud security groups block ICMP while allowing application ports.

For troubleshooting, check DNS first when using a hostname, then use `ping` to check ICMP, `nc` to test a port, and `curl` or `openssl s_client` to inspect HTTPS/TLS. A single command cannot establish that every layer is working.

![Troubleshooting HTTPS connections by layer](../images/shared/can-ping-but-tcp-may-not-connect-https-connection-troubleshooting-layers.png)

For details, see [If Ping Works, Does That Mean TCP Will Work?](./can-ping-but-tcp-may-not-connect.md).

## DNS

### What Does DNS Do?

DNS (Domain Name System) is one of the first protocols involved when a browser visits a website. It maps **domain names to IP addresses**.

![Overview of how DNS resolves domain names to IP addresses](../images/shared/dns-overview.png)

DNS results may be cached by the browser, operating system, or router. If none of those caches has an answer, the resolver performs a DNS lookup.

DNS uses a distributed, hierarchical database. **It is an application-layer protocol that can run over UDP or TCP on port 53.**

### What Types of DNS Servers Are There? How Many Root Servers Are There?

DNS can be described from two perspectives. The authoritative hierarchy includes root, top-level domain, and zone-authoritative servers. Query-side roles include stub resolvers, recursive resolvers, and forwarders. One server or software package may perform multiple roles, so these categories are not mutually exclusive or exhaustive.

- Root DNS servers refer queries to top-level domain servers.
- Top-level domain servers usually refer queries to the authoritative servers for a domain.
- Authoritative DNS servers store data for one or more zones and provide authoritative answers for those zones.
- Recursive resolvers receive client queries, check their cache, and, if necessary, query root, TLD, and authoritative servers. This is a query-side role, not a layer in the authoritative hierarchy.

The root server system has 13 named identifiers, from `a.root-servers.net` to `m.root-servers.net`, operated by 12 independent organizations. Anycast allows each identifier to serve many physical instances. Their number and locations change; see [Root-Servers.org](https://root-servers.org/) for current data. The 13 identifiers do not mean there are only 13 physical servers worldwide.

### ⭐️ How Does DNS Resolution Work?

The lookup involves several steps. See [DNS Explained (Application Layer)](https://javaguide.cn/cs-basics/network/dns.html) for details.

### What Is DNS Hijacking, and How Can You Respond?

DNS hijacking is an attack that changes DNS responses so a domain resolves to the wrong IP address. Users may be unable to reach the intended site or may be redirected to a malicious one. It is also called DNS redirection, DNS spoofing, or DNS poisoning.

## References

- _Illustrated HTTP_
- _Computer Networking: A Top-Down Approach_, 7th edition
- HTTP/2 and HTTPS explained: <https://juejin.cn/post/7034668672262242318>
- HTTP request header fields: <https://www.flysnow.org/tools/table/http-request-headers/>
- HTTP/1, HTTP/2, and HTTP/3: <https://juejin.cn/post/6855470356657307662>
- What do you think of HTTP/3? Answer by Che Xiaopang on Zhihu: <https://www.zhihu.com/question/302412059/answer/533223530>

<!-- @include: @article-footer.snippet.md -->
