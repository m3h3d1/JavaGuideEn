---
title: Java Open-Source Projects for Hands-On Practice
description: Recommended Java projects for hands-on learning and resumes, including rapid-development platforms, e-commerce systems, and access-control systems.
category: Open-Source Projects
icon: "mdi:projector-screen-outline"
---

Hands-on projects let you study domain modeling, access control, data access, testing, and deployment. Before listing a project on your resume, run it locally, understand one core business flow, and make a change you can explain.

## Official Sample Projects

- [Spring Petclinic](https://github.com/spring-projects/spring-petclinic): An application maintained by the Spring team. It is small enough to read end to end, with clear examples of web development, data access, validation, and testing.

## AI

- [interview-guide](https://github.com/Snailclimb/interview-guide): Uses Spring Boot 4.0, Java 21, Spring AI, PostgreSQL, pgvector, RustFS, and Redis to analyze resumes, run AI mock interviews, and retrieve information from a RAG knowledge base.
- [PaiAgent](https://github.com/itwanger/PaiAgent): A visual AI workflow platform. Drag and drop model and processing nodes to learn workflow definitions, task scheduling, and multi-model integration.

## Rapid-Development Platforms

- [Snowy](https://gitee.com/xiaonuobase/snowy): A rapid-development platform with Chinese cryptographic algorithms, frontend-backend separation, and plugin support.
- [RuoYi](https://gitee.com/y_project/RuoYi): A Spring Boot access-control system with common admin features for users, roles, menus, departments, and dictionaries. It can be run directly.
- [EuBackend](https://gitee.com/zhaoeryu/eu-backend): A lightweight rapid-development platform built with Spring Boot.
- [RuoYi-Vue-Pro](https://github.com/YunaiV/ruoyi-vue-pro): A redesigned Pro edition of RuoYi-Vue. It includes data permissions, SaaS multi-tenancy, Flowable workflows, third-party login, and payments.
- [RuoYi-Vue-Plus](https://gitee.com/dromara/RuoYi-Vue-Plus): A rewritten Plus edition of RuoYi-Vue that integrates Sa-Token, MyBatis-Plus, Jackson, SpringDoc, Hutool, and scheduled OSS synchronization.
- [pig](https://gitee.com/log4j/pig "pig"): An RBAC access-control system built with Spring Boot, Spring Cloud, and OAuth 2.0.
- [Guns](https://gitee.com/stylefeng/guns): A foundation framework for Java application development.
- [JeecgBoot](https://github.com/zhangdaiscott/jeecg-boot): A J2EE low-code platform built around code generation. It can generate projects with separate frontends and backends.
- [Erupt](https://gitee.com/erupt/erupt): A full-stack low-code framework that uses Java annotations to generate pages, CRUD operations, and access control.
- [BallCat](https://github.com/ballcat-projects/ballcat): A rapid-development scaffold with access control, scheduled tasks, XSS filtering, SQL injection protection, and data masking.
- [JHipster](https://github.com/jhipster/generator-jhipster): An application generator for projects combining Spring Boot with frontend frameworks such as Angular and React.

## Blog and Forum Systems

- [paicoding](https://github.com/itwanger/paicoding): An open-source community built with the Spring Boot ecosystem, with detailed tutorials.
- [Halo](https://github.com/halo-dev/halo): An open-source site builder for blogs, knowledge bases, and company websites. Study its plugin system, content management, and theme extensions.

## Wiki and Document Systems

- [kkFileView](https://gitee.com/kekingcn/file-online-preview): An online document preview service that supports common formats, including DOC, DOCX, PPT, PPTX, WPS, XLS, XLSX, ZIP, RAR, OFD, XMind, BPMN, EML, EPUB, 3DS, DWG, PSD, MP4, and MP3.

## File Management and Cloud Storage

- [free-fs](https://gitee.com/dh_free/free-fs): A cloud storage management system built with Spring Boot, MyBatis-Plus, MySQL, Sa-Token, and Layui. It supports Qiniu Cloud and Alibaba Cloud OSS, as well as upload, download, preview, move, rename, and access-control features.
- [zfile](https://github.com/zfile-dev/zfile): An online drive built with Spring Boot and Vue. It supports S3, OneDrive, SharePoint, Google Drive, Duogiyun, UpYun, local storage, FTP, and SFTP. It can browse images, play audio and video, and preview text, Office, and OBJ (3D) files.

## Exam and Practice Systems

- [PlayEdu](https://github.com/PlayEdu/PlayEdu): An open-source system for building branded internal training platforms for companies and organizations.
- [uexam](https://gitee.com/mindskip/uexam): An online examination system with question banks, tests, grading, and user management.

## E-Commerce Systems

E-commerce projects have many business flows and dependencies. If you have not built a Spring Boot project independently, start with a smaller example instead of using one of these projects as a graduation-project template.

- [mall](https://github.com/macrozheng/mall "mall"): An e-commerce application with a storefront and admin system, built mainly with Spring Boot and MyBatis.
- [mall-swarm](https://github.com/macrozheng/mall-swarm "mall-swarm"): A microservices e-commerce system based on Spring Cloud Greenwich, Spring Boot 2, MyBatis, Docker, and Elasticsearch. Existing systems can be useful references; evaluate framework versions and security updates before choosing a stack for a new project.

## Ticketing Systems

- [damai](https://gitee.com/java-up-up/damai): A concert-ticketing project focused on inventory, rate limiting, and order processing during high-concurrency ticket sales.

## Industry Applications

- [DataEase](https://github.com/dataease/dataease): An open-source BI and data-visualization platform. Study its data-source integration, access control, chart configuration, and dashboards.
- [ThingsBoard](https://github.com/thingsboard/thingsboard): An open-source IoT platform covering device management, data collection, rule processing, and visualization. It is large, so read it after learning Spring and messaging systems.
- [Apache Fineract](https://github.com/apache/fineract): An extensible open-source core banking platform with domain models for accounts, loans, and transactions. Its complex business rules make it useful for studying domain modeling, but it is not a beginner project.
- [Jeepay](https://gitee.com/jeequan/jeepay): An open-source payment system covering transactions, refunds, transfers, and split payments, with integrations for WeChat Pay, Alipay, and UnionPay. Payment systems involve financial and compliance requirements; study its domain model and API design, but do not use it in production without a security review.

## Build Your Own

- [guide-rpc-framework](https://github.com/Snailclimb/guide-rpc-framework): An RPC framework built with Netty, Kryo, and ZooKeeper, with implementation notes and tutorials.
- [mini-spring](https://github.com/DerekYRC/mini-spring): A simplified Spring implementation for learning its source code and core principles. It retains key features such as IoC, AOP, and resource loading.
- [mini-spring-cloud](https://github.com/DerekYRC/mini-spring-cloud): A simplified, hand-written Spring Cloud implementation for understanding service discovery, configuration, and service calls. See also [Build a Simplified Spring Cloud](https://mp.weixin.qq.com/s/v3FUp-keswE2EhcTaLpSMQ).
