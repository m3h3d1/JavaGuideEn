---
title: Java Frameworks and Infrastructure Projects
description: Java frameworks and infrastructure projects for web development, microservices, databases, messaging, observability, and high availability.
category: Open-Source Projects
icon: "mdi:palette-swatch-outline"
---

This page lists frameworks, middleware, and infrastructure used as application dependencies or deployed as standalone services. For complete business applications, see [Hands-On Projects](./practical-project.md). For general-purpose Java libraries, see [Java Utility Libraries](./tool-library.md).

## Core Frameworks

### Web Frameworks

- [Spring Boot](https://github.com/spring-projects/spring-boot "spring-boot"): Build standalone, production-ready Spring applications with auto-configuration, embedded web servers, monitoring, and externalized configuration.
- [Solon](https://gitee.com/opensolon/solon): A Java enterprise framework developed in China for a range of application types.
- [Javalin](https://github.com/tipsy/javalin): A lightweight web framework for Java and Kotlin, used by organizations including Microsoft, Red Hat, and Uber.
- [Play Framework](https://github.com/playframework/playframework): A high-performance web framework for Java and Scala.
- [Blade](https://github.com/lets-blade/blade): A lightweight, efficient web framework built with Java 8 and Netty 4.

### Microservices and Cloud Native

- [Armeria](https://github.com/line/armeria): A framework for microservices that supports technologies including [gRPC](https://grpc.io/), [Thrift](https://thrift.apache.org/), [Kotlin](https://kotlinlang.org/), [Retrofit](https://square.github.io/retrofit/), [Spring Boot](https://spring.io/projects/spring-boot), and [Dropwizard](https://www.dropwizard.io/).
- [Quarkus](https://github.com/quarkusio/quarkus): A Java framework for cloud-native and container environments, with fast startup, low memory use, and native-image support.
- [Helidon](https://github.com/helidon-io/helidon): Java libraries for microservices, with the Helidon MP and Helidon SE programming models.

### API Documentation

- [Swagger Core](https://github.com/swagger-api/swagger-core): The Java implementation of Swagger, used to generate OpenAPI documentation from annotations and models.
- [springdoc-openapi](https://github.com/springdoc/springdoc-openapi): Generates OpenAPI 3 documentation for Spring Boot applications and integrates with Swagger UI. Check that its version supports your Spring Boot version.

### Bean Mapping

- [MapStruct](https://github.com/mapstruct/mapstruct) (recommended): A JSR 269-compliant Java annotation processor that generates type-safe bean-mapping code at compile time, without runtime reflection.
- [MapStruct Plus](https://github.com/linpeilie/mapstruct-plus): An extension to MapStruct that can generate Mapper interfaces automatically.

### Other

- [Guice](https://github.com/google/guice): Google's lightweight dependency-injection framework. It is useful when a project needs dependency injection but not features such as AOP.
- [Spring Batch](https://github.com/spring-projects/spring-batch): A batch-processing framework for reading, processing, and writing large volumes of records. It defines job and step execution; it is not a scheduler such as Quartz or XXL-JOB.

## Authentication and Authorization

### Access Control

- [Sa-Token](https://github.com/dromara/sa-token): A lightweight Java access-control framework with authentication, authorization, single sign-on, forced logout, and automatic token renewal. Its API is more direct than Spring Security's.
- [Spring Security](https://github.com/spring-projects/spring-security): Spring's security framework for authentication, authorization, encryption, and session management. It is one of the most widely used Java security frameworks.
- [Shiro](https://github.com/apache/shiro): A Java security framework with features similar to Spring Security and a simpler API.

### Third-Party Login

- [WxJava](https://github.com/Wechat-Group/WxJava): A Java SDK for WeChat, including WeChat Pay, the Open Platform, Mini Programs, WeCom, and Official Accounts.
- [pac4j](https://github.com/pac4j/pac4j): A Java security engine supporting OpenID Connect, OAuth, SAML, CAS, LDAP, and JWT, with integrations for multiple web frameworks.

### Single Sign-On (SSO)

- [CAS](https://github.com/apereo/cas): An enterprise SSO solution for multilingual web applications.
- [MaxKey](https://gitee.com/dromara/MaxKey): An SSO system for identity management (IDM), authentication (AM), SSO, RBAC authorization, and resource management.
- [Keycloak](https://github.com/keycloak/keycloak): A free, open-source identity and access-management system with configurable SSO.

## Networking

- [Netty](https://github.com/netty/netty): An asynchronous, event-driven network framework based on NIO for TCP, UDP, and HTTP applications.
- [Retrofit](https://github.com/square/retrofit): A type-safe HTTP client for Android and Java. It uses [OkHttp](https://square.github.io/okhttp/), a widely used networking library.
- [Forest](https://gitee.com/dromara/forest): A declarative Java HTTP client that calls third-party REST APIs through interfaces and annotations. It is an alternative to Retrofit and OpenFeign.
- [OpenFeign](https://github.com/OpenFeign/feign): A declarative Java HTTP client for service-to-service APIs, with remote calls described through interfaces and annotations.
- [gRPC-Java](https://github.com/grpc/grpc-java): The Java implementation of gRPC. Based on HTTP/2 and Protocol Buffers, it suits RPC applications that need typed interfaces and streaming.

## Databases

### Connection Pools

- [Druid](https://github.com/alibaba/druid): A JDBC connection pool with monitoring features.
- [HikariCP](https://github.com/brettwooldridge/HikariCP): A lightweight, high-performance JDBC connection pool and the default pool in Spring Boot.

### Database Frameworks

- [MyBatis-Plus](https://github.com/baomidou/mybatis-plus): An extension to [MyBatis](https://mybatis.org/mybatis-3/) with common CRUD operations, query wrappers, pagination, and code generation.
- [MyBatis-Flex](https://gitee.com/mybatis-flex/mybatis-flex): A MyBatis extension supporting CRUD operations, pagination, joins, and batch processing.
- [jOOQ](https://github.com/jOOQ/jOOQ): A type-safe way to write SQL in Java.
- [Redisson](https://github.com/redisson/redisson "redisson"): A Java in-memory data grid built on Redis. It provides distributed objects such as `Set`, `SortedSet`, `Map`, `List`, `Queue`, and `Deque`, as well as distributed locks. See the [Redisson project guide](https://github.com/redisson/redisson/wiki/Redisson%E9%A1%B9%E7%9B%AE%E4%BB%8B%E7%BB%8D).

### Data Synchronization

- [Canal](https://github.com/alibaba/canal "canal"): Parses the MySQL binlog to provide incremental data subscriptions and consumption. Common uses include cache synchronization, data replication, and change-event processing.
- [DataX](https://github.com/alibaba/DataX "DataX"): Alibaba's widely used offline data synchronization tool. It transfers data among heterogeneous sources such as MySQL, Oracle, SQL Server, PostgreSQL, HDFS, Hive, ADS, HBase, TableStore (OTS), MaxCompute (ODPS), and DRDS.

### Time-Series Databases

- [IoTDB](https://github.com/apache/iotdb): A time-series database written in Java for data collection, storage, and analysis. It integrates with Hadoop, Spark, and visualization tools such as Grafana, and supports industrial IoT workloads with large data volumes, high write throughput, and complex queries.
- [QuestDB](https://github.com/questdb/questdb): An open-source time-series database for high-throughput writes and low-latency SQL queries. It supports the PostgreSQL wire protocol, REST, and InfluxDB Line Protocol.

## Search Engines

- [Elasticsearch](https://github.com/elastic/elasticsearch "elasticsearch") (recommended): An open-source, distributed, RESTful search engine.
- [Meilisearch](https://github.com/meilisearch/meilisearch): A fast, easy-to-use open-source search engine that supports Chinese search without additional configuration.
- [Solr](https://github.com/apache/solr): A distributed search platform built on Apache Lucene.

## Testing

### Test Frameworks

- [JUnit 5](https://github.com/junit-team/junit5): A common unit-testing framework for Java and the JVM ecosystem.
- [Mockito](https://github.com/mockito/mockito): A Java mocking framework for isolating objects that are hard to construct or depend on external systems.
- [AssertJ](https://github.com/assertj/assertj): A fluent assertion library for Java and the JVM that improves test readability and error messages.
- [WireMock](https://github.com/tomakehurst/wiremock): A tool for simulating HTTP services and mocking APIs.
- [Testcontainers](https://github.com/testcontainers/testcontainers-java): Starts disposable containers for integration tests, including databases, message queues, browsers, and other containerized dependencies.

Further reading:

- [The Practical Test Pyramid — Martin Fowler](https://martinfowler.com/articles/practical-test-pyramid.html) (This useful article is in English.)

### Testing Platforms

- [MeterSphere](https://github.com/metersphere/metersphere): An open-source continuous-testing platform for test management, API testing, performance testing, and team collaboration.

### API Clients

- [Insomnia](https://github.com/Kong/insomnia): A cross-platform API client for REST, GraphQL, WebSocket, SSE, and gRPC, with local and Git-based data storage.
- [Hoppscotch](https://github.com/hoppscotch/hoppscotch): An open-source API testing tool and alternative to products such as Postman and Insomnia.
- [Restful Fast Request](https://github.com/dromara/fast-request): A Postman-like IntelliJ IDEA plugin for API debugging, management, and search.

## Job Scheduling

- [Quartz](https://github.com/quartz-scheduler/quartz): A widely used Java job scheduler and a common foundation for other scheduling frameworks. For example, Dangdang's `elastic-job` is a distributed scheduler built on Quartz.
- [XXL-JOB](https://github.com/xuxueli/xxl-job): A distributed job-scheduling platform with job management, scheduling logs, failover, and extensible executors.
- [ElasticJob](https://github.com/apache/shardingsphere-elasticjob): A distributed scheduler based on Quartz and ZooKeeper, with sharding, elastic scaling, and failover.
- [DolphinScheduler](https://github.com/apache/dolphinscheduler): A distributed, extensible visual workflow scheduler for tasks with complex dependencies.

## Workflow Engines

1. [Flowable](https://github.com/flowable/flowable-engine): A feature-rich fork of Activiti 5. It adds advanced support for CMMN (Case Management Model and Notation), DMN (Decision Model and Notation), and flexible integrations.
2. [Activiti](https://github.com/Activiti/Activiti): A more conservative extension of the workflow engine, suitable for enterprise applications that need a stable BPMN 2.0 engine.
3. [Warm-Flow](https://gitee.com/dromara/warm-flow): A lightweight, modular, and extensible open-source workflow engine developed in China.
4. [FlowLong](https://gitee.com/aizuda/flowlong): An open-source workflow engine developed in China for business approval processes.

## Distributed Systems

### API Gateways

- [Kong](https://github.com/Kong/kong "kong"): A fast, scalable, cloud-native layer for distributed microservices, also known as an API gateway or API middleware and, in some cases, a service mesh. Released as open source in 2015, it focuses on performance and extensibility.
- [ShenYu](https://github.com/apache/shenyu): An extensible, high-performance, reactive API gateway for microservices.
- [Spring Cloud Gateway](https://github.com/spring-cloud/spring-cloud-gateway): Spring Cloud's API gateway, with routing, filters, rate limiting, and service-discovery integration.
- [Zuul](https://github.com/Netflix/zuul): Netflix's open-source Layer 7 gateway, with dynamic routing, monitoring, resilience, and security features.

### Configuration Centers

- [Apollo](https://github.com/ctripcorp/apollo "apollo") (recommended): A distributed configuration center developed by Ctrip. It centrally manages configuration across application environments and clusters, pushes changes to applications in real time, and provides access-control and workflow governance for microservices.
- [Nacos](https://github.com/alibaba/nacos) (recommended): A service-discovery component in Spring Cloud Alibaba, similar to Consul and Eureka. It also provides distributed configuration management.
- [Spring Cloud Config](https://github.com/spring-cloud/spring-cloud-config): One of the earliest configuration centers in the Spring Cloud ecosystem. It remains suitable for Spring Cloud projects and can be enabled with simple configuration. Consul can also provide configuration-center features.
- [Consul](https://github.com/hashicorp/consul): HashiCorp's open-source tool for service discovery, configuration, and control-plane functions. These features can be used separately or together as a service-mesh solution.

### Distributed Tracing

- [SkyWalking](https://github.com/apache/skywalking "skywalking"): An application performance monitoring and observability platform for distributed, microservices, and cloud-native systems.
- [OpenTelemetry Java](https://github.com/open-telemetry/opentelemetry-java): Java APIs and SDKs for generating and exporting traces, metrics, and logs. It handles instrumentation and collection, not backend storage or visualization.

### Distributed Locks

- [Redisson](https://github.com/redisson/redisson "redisson"): Provides extensive support for distributed locks beyond a basic Redis lock implementation.
- [ShedLock](https://github.com/lukas-krecan/ShedLock): Prevents the same scheduled task from running concurrently on multiple instances. It handles scheduled-job mutual exclusion, not general-purpose distributed locking.

## High Performance

### Thread Pools

- [Dynamic TP](https://github.com/dromara/dynamic-tp): A dynamic thread-pool library with monitoring and alerts. It integrates thread pools from third-party middleware and configuration centers such as Nacos, Apollo, ZooKeeper, Consul, and etcd, and can be extended through SPI.

### Caching

#### Local Caches

- [Caffeine](https://github.com/ben-manes/caffeine): A high-performance Java local cache with eviction policies based on size, time, and references.
- [Guava](https://github.com/google/guava): Google's Java core library, with a mature local-cache implementation.

#### Distributed Caches

- [Redis](https://github.com/redis/redis): An in-memory database written in C and a common choice for distributed caching.
- [Dragonfly](https://github.com/dragonflydb/dragonfly): An in-memory database compatible with Redis and Memcached APIs. Before migrating, check command coverage, persistence, clustering, and client behavior; protocol compatibility alone does not guarantee a drop-in replacement.

#### Multi-Level Caches

- [JetCache](https://github.com/alibaba/jetcache): Alibaba's open-source cache framework, with multi-level caching, automatic refresh of distributed caches, and TTL support.

### Message Queues

**Distributed queues:**

- [RocketMQ](https://github.com/apache/rocketmq "RocketMQ"): A high-performance, high-throughput distributed messaging system originally developed by Alibaba.
- [Kafka](https://github.com/apache/kafka "Kafka"): A distributed publish-subscribe messaging system.
- [RabbitMQ](https://github.com/rabbitmq/rabbitmq-server): A message broker developed in Erlang that implements AMQP.

### Read/Write Splitting and Sharding

- [ShardingSphere](https://github.com/apache/shardingsphere): An open-source distributed database ecosystem consisting of three independent products: Sharding-JDBC, Sharding-Proxy, and the planned Sharding-Sidecar.

## High Availability

### Rate Limiting

Distributed rate limiting:

- [Sentinel](https://github.com/alibaba/Sentinel) (recommended): A high-availability protection component for distributed services. It helps stabilize microservices through traffic control, circuit breaking and fallback, and adaptive system protection.

Single-instance rate limiting:

- [Bucket4j](https://github.com/vladimir-bukhtoyarov/bucket4j): A rate-limiting library based on token-bucket and leaky-bucket algorithms.
- [Resilience4j](https://github.com/resilience4j/resilience4j): A lightweight fault-tolerance library with circuit breaking, rate limiting, retries, and bulkheads.

### Monitoring

- [Spring Boot Admin](https://github.com/codecentric/spring-boot-admin): Manages and monitors Spring Boot applications.
- [Metrics](https://github.com/dropwizard/metrics): Collects JVM and application-level metrics to show what is happening in an application.

### Logging

- **ELK**: Elasticsearch, Logstash, and Kibana.
- **Elastic Stack**: ELK plus data-collection tools such as Beats.
- **EFK**: A logging stack that uses [Fluentd](https://github.com/fluent/fluentd) instead of Logstash.

## Bytecode Manipulation

- [ASM](https://asm.ow2.io/): A general Java bytecode manipulation and analysis framework. It can modify existing classes in binary form or generate classes dynamically.
- [Byte Buddy](https://github.com/raphw/byte-buddy): A Java bytecode generation and manipulation library that creates and modifies classes at runtime without invoking the Java compiler.
- [Javassist](https://github.com/jboss-javassist/javassist): A library for dynamically editing Java bytecode.
- [Recaf](https://github.com/Col-E/Recaf): A modern Java bytecode editor based on ASM that simplifies editing compiled Java applications.
