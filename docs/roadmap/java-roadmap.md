---
title: Java Backend Roadmap (2026)
description: The 2026 Java backend roadmap covers Java fundamentals, databases, frameworks, tools, the JVM, concurrency, distributed systems, high performance and availability, microservices, AI application development, and projects.
category: Learning Roadmaps
head:
  - - meta
    - name: keywords
      content: Java learning roadmap, Java backend roadmap, 2026 Java roadmap, Java backend, Java interviews, Spring Boot, MySQL, Redis, JVM, Java concurrency, distributed systems, microservices, AI application development
---

This is the 2026 edition of the Java learning roadmap. I update it each year to reflect current Java backend hiring requirements.

This detailed Java backend roadmap is over 40,000 Chinese characters long. You don't need to study everything at once. I'll identify the essentials for entry-level roles at smaller companies and suggest a gradual path for building backend skills.

Beginners can follow the roadmap and resources for structured study. Experienced developers can use it to deepen their Java backend skills.

This article doesn't cover study methods or career growth. For those topics, see these JavaGuide articles:

- [How Programmers Can Learn New Technologies Quickly](https://javaguide.cn/high-quality-technical-articles/advanced-programmer/programmer-quickly-learn-new-technology.html)
- [A Technical Growth Strategy for Programmers](https://javaguide.cn/high-quality-technical-articles/advanced-programmer/the-growth-strategy-of-the-technological-giant.html)
- [Seven Tips for Developers Who Want to Advance](https://javaguide.cn/high-quality-technical-articles/advanced-programmer/seven-tips-for-becoming-an-advanced-programmer.html)

This roadmap doesn't cover computer science fundamentals. For recommended books, see [Computer Science Book Recommendations](https://javaguide.cn/books/cs-basics.html).

If you're new to programming, don't start with a large project. Practice matters, but without the basics, a project can be difficult to follow. Begin with a good video course and work through it step by step.

## Java Backend Roadmap at a Glance

This diagram shows the overall roadmap and the study order I recommend.

Each topic in the diagram is explained below, with recommended resources.

![Java backend roadmap overview](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/java-learning-route-2024.png)

To get the original image and PDF, reply **学习路线** (“learning roadmap”) to the **JavaGuide** WeChat public account.

![JavaGuide official WeChat public account](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)

If you want to work at a smaller company, focus on Java fundamentals, databases, common frameworks, and development tools.

If you're aiming for a large company or want to strengthen your job prospects, spend more time on the JVM, distributed systems, concurrency, availability, and microservices.

Interviews can be competitive, so broader study and practice can help. Some topics may not come up in your day-to-day work, but employers may still ask about them during interviews. This is sometimes summed up as: “Build rockets for the interview; tighten screws on the job.”

## Outdated Java Technologies

[Outdated Java Technologies You Should Avoid](https://javaguide.cn/about-the-author/deprecated-java-technologies.html) covers technologies that are no longer common in Java development. Avoid learning them for new projects unless you need to maintain a legacy system.

**JSP**

- **Reason:** JSP is dated, and frontend-backend separation is now common.
- **Alternatives:** Template engines such as Thymeleaf and FreeMarker remain options for traditional full-stack development. In separated architectures, frameworks such as React, Vue, and Angular fill the frontend role.
- **Note:** Some legacy projects at state-owned enterprises may still use JSP, but this is less common.

**Struts (especially 1.x)**

- **Reason:** It requires extensive configuration, slows development, and has had serious security vulnerabilities. Community support has also declined.
- **Alternatives:** Spring MVC and Spring WebFlux offer a simpler development experience and active community support.

**EJB (Enterprise JavaBeans)**

- **Reason:** EJB is complex, costly to develop with, and has a steep learning curve. Lighter frameworks have replaced it in many projects.
- **Alternatives:** Spring / Spring Boot are widely used for enterprise Java development. Other options include Solon and the cloud-native Quarkus framework.

**Java Applets**

- **Reason:** Modern browsers such as Chrome, Firefox, and Edge no longer support Java Applets, which also had security issues.
- **Alternatives:** HTML5, WebAssembly, and JavaScript frameworks such as React and Vue can provide interactive experiences without browser plugins.

**SOAP / JAX-WS**

- **Reason:** SOAP and JAX-WS can involve complex APIs and verbose XML payloads.
- **Alternatives:** RESTful APIs and RPC are common choices for modern microservices.

**RMI (Remote Method Invocation)**

- **Reason:** RMI is an older Java remoting technology with compatibility and configuration limitations.
- **Alternatives:** RESTful APIs and RPC are common options for remote calls.

**Swing / JavaFX**

- **Reason:** Web and mobile applications are now more common, and Swing and JavaFX have smaller ecosystems than newer cross-platform frameworks.
- **Alternatives:** Frameworks such as Flutter Desktop and Electron offer cross-platform desktop development.
- **Note:** Some legacy projects at state-owned enterprises may still use Swing / JavaFX.

**Ant**

- **Reason:** Ant uses XML configuration and can be cumbersome to maintain.
- **Alternatives:** Maven and Gradle provide dependency management and build features used by many modern Java projects.

## Interview Self-Assessment

To help you apply what you've learned, I've prepared a set of frequently asked questions that follows this roadmap: [Java Backend Roadmap Interview Questions](https://t.zsxq.com/0eM78gbAr), available to [JavaGuide Knowledge Planet](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html) members.

**Use it to:**

- **Assess your knowledge:** Check your understanding of each topic.
- **Find gaps:** Identify areas that need more review.
- **Practice interviews:** Get familiar with common questions and interview pacing.

Self-assessment can help reinforce what you've studied.

## Java Core

### Java Fundamentals

If you're new to programming, start with a video course. Good options include Shangguigu's [Java Fundamentals Series](https://www.bilibili.com/video/BV1PY411e7J6/) and Han Shunping's [Learn Java from Scratch in 30 Days](https://www.bilibili.com/video/BV1fh411y7R8).

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210409143842888.png)

👉 I collected Shangguigu's latest Java backend video courses and materials. If you prefer learning from videos, [download the complete Java backend courses and projects](https://mp.weixin.qq.com/s/jkZthmOSDgTF1PrCeNus_A).

![](https://oss.javaguide.cn/github/javaguide/books/88714e9becd0485aae247772b6ed9949.png)

A good book can complement video lessons. Here are three Java fundamentals books:

**1. _Head First Java_**

![Head First Java](https://oss.javaguide.cn/github/javaguide/books/image-20220424103035793.png)

_Head First Java_ is approachable and engaging. It was one of the books that helped me get started with Java, and many of my friends used it when they were learning.

**Is it suitable for beginners?** I think so, especially if you like the _Head First_ series.

**2. _Core Java, Volumes I and II_**

![Core Java, Volume I](https://oss.javaguide.cn/github/javaguide/books/image-20220424101217849.png)

These books cover a lot of material and take time to read. They're useful as references. I recommend them once you have some Java experience; their coverage is detailed and broad.

**3. _The Logic of Java Programming_**

This book goes deeper than a typical introductory text. It's suitable for beginners and for reviewing Java fundamentals. See [Java Fundamentals: Common Interview Questions](https://mp.weixin.qq.com/s/UceEYGWM9qq9WvntV7y-Aw) for reading suggestions.

![The Logic of Java Programming](https://oss.javaguide.cn/github/javaguide/books/image-20230721153650488.png)

After studying the fundamentals, write a simple Java program or solve programming problems to apply what you've learned.

Games aren't the only way to practice. Beginners may find smaller programming exercises, such as basic algorithm problems, more manageable.

Take notes and keep the API documentation somewhere easy to find. _Effective Java_ and _Refactoring_ are also useful books for writing and improving code.

Make sure you understand:

- Basic syntax and primitive types
- Objects, classes, and interfaces
- Inheritance and generics
- Methods
- Exceptions and assertions
- Collections
- ...

Use these interview questions and topic guides alongside your study:

- **Java fundamentals:**
  - [Common Java Fundamentals Interview Questions (Part 1)](https://javaguide.cn/java/basis/java-basic-questions-01.html): Language concepts, syntax, types, variables, and methods.
  - [Common Java Fundamentals Interview Questions (Part 2)](https://javaguide.cn/java/basis/java-basic-questions-02.html): Object-oriented basics, strings, object comparison, and copying.
  - [Common Java Fundamentals Interview Questions (Part 3)](https://javaguide.cn/java/basis/java-basic-questions-03.html): Exceptions, generics, reflection, SPI, serialization, and annotations.
- **Java collections:**
  - [Common Java Collections Interview Questions (Part 1)](https://javaguide.cn/java/collection/java-collection-questions-01.html): Collection basics, `ArrayList`, `LinkedList`, `HashSet`, `ArrayDeque`, `PriorityQueue`, and `BlockingQueue`.
  - [Common Java Collections Interview Questions (Part 2)](https://javaguide.cn/java/collection/java-collection-questions-02.html): `HashMap`, `ConcurrentHashMap`, and related topics.

### Java Concurrency (Advanced)

Concurrency and multithreading can be difficult to understand and practice. If you've just finished Java fundamentals, first review threads and processes. Return to concurrency in more depth as your Java skills grow.

Recommended books include _Java High Concurrency Programming_, _Java Concurrency in Practice: Beauty of Programming_, and _The Principles of Java Concurrency: JDK Source Code Analysis_.

![Java High Concurrency Programming](https://oss.javaguide.cn/github/javaguide/books/image-20220424112554830.png)

![Java Concurrency in Practice: Beauty of Programming](https://oss.javaguide.cn/github/javaguide/books/image-20220424112413660.png)

![The Principles of Java Concurrency: JDK Source Code Analysis](https://oss.javaguide.cn/github/javaguide/books/0b1b046af81f4c94a03e292e66dd6f7d.png)

Choose one book and study it carefully, or use several together. Look up other explanations when a topic is unclear.

For video lessons, see [Shangguigu's Java Concurrency Course](https://www.bilibili.com/video/BV1ar4y1x727/).

👉 I collected Shangguigu's latest Java backend video courses and materials. [Download the complete Java backend courses and projects](https://mp.weixin.qq.com/s/jkZthmOSDgTF1PrCeNus_A).

![](https://oss.javaguide.cn/github/javaguide/books/88714e9becd0485aae247772b6ed9949.png)

Review these interview questions and key topics as you study:

- [Java Concurrency Interview Questions (Part 1)](https://javaguide.cn/java/concurrent/java-concurrent-questions-01.html): Multithreading basics, threads and processes, and deadlocks.
- [Java Concurrency Interview Questions (Part 2)](https://javaguide.cn/java/concurrent/java-concurrent-questions-02.html): Locks, including optimistic and pessimistic locking, `synchronized`, and `ReentrantLock`.
- [Java Concurrency Interview Questions (Part 3)](https://javaguide.cn/java/concurrent/java-concurrent-questions-03.html): `ThreadLocal`, thread pools, `Future`, AQS, and virtual threads.

### JVM (Advanced)

JVM topics are more advanced than concurrency and can wait until you've studied frameworks. JVM questions are more common at large and mid-sized companies, though preparation depends on the roles you're targeting.

If you have time, studying the JVM can deepen your understanding of Java. Even if your job doesn't involve JVM tuning, knowing how to investigate an OutOfMemoryError (OOM) is useful.

Combine theory with hands-on practice. A recommended book is _Understanding the Java Virtual Machine_.

![Understanding the Java Virtual Machine](https://oss.javaguide.cn/github/javaguide/books/20210710104655705.png)

This is a well-regarded Chinese book. The third edition has been available for some time and covers newer garbage collectors, including ZGC. Read it for interviews or to deepen your Java knowledge, and try the exercises as well. I hope more high-quality books like this are published! 💪

Other options include _Practical Java Virtual Machine_ and _Design and Implementation of a Virtual Machine: A JVM Case Study_.

![Practical Java Virtual Machine](https://oss.javaguide.cn/github/javaguide/books/image-20220424113158144.png)

![Design and Implementation of a Virtual Machine: A JVM Case Study](https://oss.javaguide.cn/github/javaguide/books/image-20220424113210153.png)

If you'd like to build a simple JVM, see _Writing a Java Virtual Machine from Scratch_.

![Writing a Java Virtual Machine from Scratch](https://oss.javaguide.cn/github/javaguide/books/image-20220424113445246.png)

The book's examples are written in Go. Once you understand the concepts, you can try implementing them in Java. There are also Java implementations online, such as [Zachaxy's JVM series](https://zachaxy.github.io/tags/JVM/).

R, a JVM author, also recommends several books in [Learning JVM Implementation from the Inside Out](https://www.douban.com/doulist/2545443/).

For video lessons, see Shangguigu's [JVM Course](https://www.bilibili.com/video/BV1PJ411n7xZ), which has nearly 400 lessons, or the shorter [JVM and GC Tuning Course](https://www.bilibili.com/video/BV1Dz4y1A7FB/).

The course has three parts:

1. Memory and garbage collection
2. Bytecode and class loading
3. Performance monitoring and tuning

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210409181534319.png)

👉 I collected Shangguigu's latest Java backend video courses and materials. [Download the complete Java backend courses and projects](https://mp.weixin.qq.com/s/jkZthmOSDgTF1PrCeNus_A).

![](https://oss.javaguide.cn/github/javaguide/books/88714e9becd0485aae247772b6ed9949.png)

Review these key topics and interview questions:

- [JVM Memory Areas](https://javaguide.cn/java/jvm/memory-area.html)
- [JVM Garbage Collection](https://javaguide.cn/java/jvm/jvm-garbage-collection.html)
- [Class File Structure](https://javaguide.cn/java/jvm/class-file-structure.html)
- [The Class Loading Process](https://javaguide.cn/java/jvm/class-loading-process.html)
- [Class Loaders](https://javaguide.cn/java/jvm/classloader.html)

## Databases

### Fundamentals (Optional)

Database fundamentals are optional, especially if you studied them at university. If you haven't, the resources below can help.

_Database System Concepts_ is a classic textbook that covers database systems in a structured way.

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409150441742.png)

If you prefer video lessons, try Beijing Normal University's [Database System Principles](https://www.icourse163.org/course/BNU-1002842007). It includes detailed lectures, related exercises, and labs.

![](https://oss.javaguide.cn/github/javaguide/books/up-e113c726a41874ef5fb19f7ac14e38e16ce.png)

If you prefer hands-on learning, [Let's Build a Simple Database](https://cstack.github.io/db_tutorial/) walks you through writing a basic database.

![](https://oss.javaguide.cn/github/javaguide/books/up-11de8cb239aa7201cc8d78fa28928b9ec7d.png)

Put the concepts into practice as you study.

### MySQL

PostgreSQL is also popular, but MySQL remains widely used by Java teams and companies in China.

For an introduction, try Black Horse's [MySQL: From Beginner to Pro](https://www.bilibili.com/video/BV1Kr4y1i7ru/) and pair it with a book such as [MySQL Crash Course](https://book.douban.com/subject/3354490/).

At first, focus on these topics:

1. Common MySQL commands:
   - Security: logging in, adding and removing users, and backing up and restoring data.
   - Database operations: creating and dropping databases and tables, and assigning user permissions.
2. Common data types and character set encodings.
3. Basic, conditional, fuzzy, and multi-table queries; sorting, filtering, and grouping results.
4. Indexes, views, stored procedures, cursors, and triggers.

For internals and performance, see [High Performance MySQL](https://book.douban.com/subject/23008813/) and [MySQL Internals](https://book.douban.com/subject/24708143/).

![](https://oss.javaguide.cn/github/javaguide/books/up-3d31e762933f9e50cc7170b2ebd8433917b.png)

[How MySQL Works](https://book.douban.com/subject/35231266/) is another useful book, including for interview preparation.

![](https://oss.javaguide.cn/github/javaguide/csdn/20210703120643370.png)

Pay particular attention to these topics:

1. Indexes: benefits and trade-offs, B-trees and B+ trees, clustered and nonclustered indexes, and covering indexes.
2. Transactions: ACID, concurrent transactions, and isolation levels.
3. Storage engines: MyISAM and InnoDB.
4. Locking and InnoDB lock algorithms.

Recommended reading:

- [Common MySQL Interview Questions](https://javaguide.cn/database/mysql/mysql-questions-01.html): Fundamentals, storage engines, transactions, indexes, locks, and performance.
- [MySQL Indexes](https://javaguide.cn/database/mysql/mysql-index.html)
- [MySQL Logs: binlog, redo log, and undo log](https://javaguide.cn/database/mysql/mysql-logs.html)
- [MySQL Transaction Isolation Levels](https://javaguide.cn/database/mysql/transaction-isolation-level.html)
- [How InnoDB Implements MVCC](https://javaguide.cn/database/mysql/innodb-implementation-of-mvcc.html)
- [How MySQL Executes SQL Statements](https://javaguide.cn/database/mysql/how-sql-executed-in-mysql.html)

### PostgreSQL (Optional)

PostgreSQL is a free, open-source relational database with a broad feature set. Its slogan is “The world's most advanced open-source relational database.”

![](https://oss.javaguide.cn/github/javaguide/books/image-20220702144954370.png)

PostgreSQL has strengths compared with MySQL, but MySQL is still more common in China, so PostgreSQL is optional. See the [PostgreSQL 14 documentation](http://www.postgres.cn/docs/14/index.html) and these [PostgreSQL book recommendations](https://javaguide.cn/books/database.html#postgresql).

### Redis

Backend systems commonly use Redis for distributed caching. It can also provide distributed locks, delayed queues, and message queues.

For video lessons, see GeekHour's [Redis in One Hour](https://www.imooc.com/learn/839) for an introduction, or Shangguigu's [Redis 7 Course](https://www.bilibili.com/video/BV13R4y1v7sP/) for more detail.

Recommended books include [Redis Design and Implementation](https://book.douban.com/subject/25900156/) and [Redis: Core Principles and Practice](https://book.douban.com/subject/26612779/), which uses source code to explain data structures and advanced features.

![Redis books](https://oss.javaguide.cn/github/javaguide/books/redis-books.png)

For a paid course, see Geek Time's [Redis Core Technologies and Practice](https://time.geekbang.org/column/intro/100056701?utm_campaign=geektime_search&utm_content=geektime_search&utm_medium=geektime_search&utm_source=geektime_search&utm_term=geektime_search). It covers Redis broadly, though it may not include newer features.

Recommended reading:

- [Common Caching Interview Questions](https://javaguide.cn/database/redis/cache-basics.html)
- [Common Redis Interview Questions (Part 1)](https://javaguide.cn/database/redis/redis-questions-01.html)
- [Common Redis Interview Questions (Part 2)](https://javaguide.cn/database/redis/redis-questions-01.html)
- [Redis's Five Basic Data Types](https://javaguide.cn/database/redis/redis-data-structures-01.html)
- [Redis's Three Special Data Types](https://javaguide.cn/database/redis/redis-data-structures-02.html)
- [Redis Persistence](https://javaguide.cn/database/redis/redis-persistence.html)
- [Redis Memory Fragmentation](https://javaguide.cn/database/redis/redis-memory-fragmentation.html)

### MongoDB (Optional)

MongoDB is optional for Java backend developers unless a project uses it. These articles cover common interview questions:

- [MongoDB Interview Questions (Part 1)](https://javaguide.cn/database/mongodb/mongodb-questions-01.html)
- [MongoDB Interview Questions (Part 2)](https://javaguide.cn/database/mongodb/mongodb-questions-02.html)

## Development Tools

Git and Docker are especially important. Also learn GitHub basics and tips from [GitHub Tips](https://javaguide.cn/tools/git/github-tips.html).

### IntelliJ IDEA

A good IDE can make development more efficient. Common Java IDEs include Eclipse and IntelliJ IDEA. Choose the one that works best for you.

IDEA supports Java development with features such as context-aware code completion and a wide range of plugins.

AI coding IDEs such as Cursor have added competition, but IDEA remains useful for development and refactoring. Its AI coding features have some room to improve.

The [official IntelliJ IDEA documentation](https://mp.weixin.qq.com/s/GT-zQHLOBB25ZRf1nyyt2Q) is a good place to start.

**IntelliJ IDEA documentation:** <https://www.jetbrains.com/zh-cn/help/idea/getting-started.html>

I also created the [IDEA Efficiency Guide](https://idea.javaguide.cn/), which covers:

- IDEA tips
- Essential plugins
- Plugin development basics
- Refactoring tips
- Reading source code in IDEA

![IDEA Efficiency Guide homepage](https://oss.javaguide.cn/github/awesome-idea-tutorial/awesome-idea-tutorial-website-homepage%20%20%20%20%20%20.png)

### Maven

Maven's basic features are quick to learn, though using it well takes practice. Learn the basics before studying common Java frameworks. Use a package manager instead of downloading JARs manually.

Recommended reading:

- [Maven Core Concepts](https://javaguide.cn/tools/maven/maven-core-concepts.html)
- [Maven Best Practices](https://javaguide.cn/tools/maven/maven-best-practices.html)
- [Maven: A Visual Guide](https://juejin.cn/post/7238823745828405308)

Know how to:

1. Create a Maven project and add dependencies.
2. Resolve dependency conflicts.
3. Build, run, and package a multi-module project.
4. Set up a private Maven repository.

Beginners can focus on the first two items.

### Git

Git is an essential skill. Use it to manage your code while learning, and get familiar with GitHub or GitLab, which many companies use for version control.

[Learn Git Branching](https://learngitbranching.js.org/ "Learn Git Branching") teaches common Git operations interactively, using exercises and animations. Each level includes instructions, and you can use `reset` to start over.

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210423182350378.png)

Use `show solution` to view an answer if needed.

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210423181725451.png)

For a short introduction, see [Git in Brief](https://javaguide.cn/tools/git/git-intro.html). For more detail, read [Pro Git](https://www.progit.cn/ "Pro Git"), which is free and available in Chinese.

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210423183640734.png)

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210423183749743.png)

Another online edition is available at <https://git-scm.com/book/zh/v2>.

For video lessons, see Geek Time's [Git Essentials](http://gk.link/a/10qcT) by Su Ling, who leads Ctrip's code platform team.

### Docker

Projects often depend on MySQL, Redis, FastDFS, and other services. Installing and configuring each environment manually can be complicated and varies by operating system.

Docker runs these services in containers, separating applications from their environments. Benefits include:

1. Consistent environments that are easier to move.
2. Process isolation between containers and more efficient use of system resources.
3. The ability to create consistent containers from images.

Learn the basics in [Docker Concepts](https://javaguide.cn/tools/docker/docker-intro.html), then follow [Docker in Practice](https://javaguide.cn/tools/docker/docker-in-action.html).

The open-source book [Docker — From Beginner to Practitioner](https://yeasy.gitbook.io/docker_practice/introduction/why) is also regularly updated.

![Docker — From Beginner to Practitioner homepage](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-getting-started-practice-website-homepage.png)

For video lessons, try the [One-Hour Docker Quickstart](https://www.bilibili.com/video/BV11L411g7U1/) and its [course materials](https://docker.easydoc.net/doc/81170005/cCewZWoN/lTKfePfP).

![One-Hour Docker Quickstart](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/docker-1-hour-quick-start-guide.png)

After learning the common Docker commands, practice deploying a frontend-backend application. For example, deploy a resume project and add its live demo to your portfolio.

## Design Patterns

**Software reuse** means building on existing frameworks, libraries, design patterns, and principles instead of starting from scratch. Design patterns help make code easier to extend and maintain by encapsulating change.

You can deliver features without knowing design patterns, but understanding them can help you write higher-quality business code. Frameworks such as Spring and MyBatis also use them extensively, so they help explain how those frameworks work.

Study patterns and practice applying them. They aren't a silver bullet: **don't use a pattern just for its own sake**.

For a book, see _Relearning Java Design Patterns_. It explains patterns through examples and practical cases. Practice the examples to build experience applying them.

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b4da6f8cc0cf4a8e8238d3d8671e0462~tplv-k3u1fbpfcp-watermark.image)

For video lessons, see [Shangguigu's Java Design Patterns: Diagrams and Framework Source Code](https://www.bilibili.com/video/BV1G4411c7N4).

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/029687d24c7b4882ba81b5b629c323a1~tplv-k3u1fbpfcp-watermark.image)

The course covers the seven design principles, UML class diagrams and their relationships, and the 23 design patterns and their categories.

## Linux

Java developers should know basic Linux commands for navigating directories, managing files, and compressing or extracting archives. Linux kernel internals are optional.

For an introduction, see [Linux Fundamentals](https://javaguide.cn/cs-basics/operating-system/linux-intro.html), which covers concepts and commands for Java developers.

GeekHour's [Linux in 30 Minutes](https://www.bilibili.com/video/BV1cq421w72c) is a short, practical introduction.

For a more systematic reference, see the _Linux Command Line and Shell Scripting Bible_ series. It's extensive, so use it as a reference or study selected chapters.

![](https://oss.javaguide.cn/github/javaguide/books/linux-private-kitchen-basic-learning.png)

Learn Shell scripting as well. [Shell Scripting Fundamentals](https://javaguide.cn/cs-basics/operating-system/shell-intro.html) covers variables, operators, control flow, and functions.

## Frontend Fundamentals

I mainly work on Java backend development and have limited frontend experience, so these are brief suggestions.

Vue and React are popular frontend frameworks. Vue may be a practical choice in China, where more companies use it, but learning a framework is optional and depends on your goals.

HTML, CSS, and JavaScript remain useful fundamentals. Learn the basics with [W3Schools](http://www.w3school.com.cn/), then build a small project such as a resume page or a recreation of a website.

JavaScript takes more time to master and is a major topic in frontend interviews. The [MDN JavaScript Guide](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript) is a comprehensive resource. You can also use the open-source tutorial [The Modern JavaScript Tutorial](https://javascript.info/), which is available in several languages.

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210409151045407.png)

The tutorial has three parts:

1. JavaScript: fundamentals and advanced topics such as OOP.
2. The browser: documents, events, and interfaces.
3. Other articles: additional JavaScript topics to study as needed.

Most modern projects separate frontend and backend development, testing, and deployment. They communicate through APIs. Backend developers should understand:

- HTTP.
- RESTful API design and use.
- Common communication methods such as Ajax and WebSocket.

## Java EE Fundamentals

### Servlets

Servlets are an older technology, and you'll rarely use the APIs directly in modern development. Understanding them helps explain Web frameworks such as Spring MVC, which builds on the Servlet API.

In a Java Web application, a `Servlet` receives an `HttpServletRequest`, handles methods such as `doGet()` and `doPost()`, and sends an `HttpServletResponse` back to the user.

Books such as _Head First Servlets & JSP_ and _Servlets and JSP: A Tutorial_ cover the basics.

**Note:** JSP is outdated and generally not worth learning for new projects.

### Web Servers

Tomcat is an Apache project commonly used as a Web server.

You can use Spring Boot without studying Tomcat first, though understanding it is useful. Spring Boot's `spring-boot-starter-web` uses Tomcat as its default embedded Servlet container.

Tomcat has two main responsibilities:

1. Handle socket connections and convert network byte streams into Request and Response objects.
2. Load and manage Servlets and process requests.

For more detail, see Geek Time's [Tomcat and Jetty Internals](http://gk.link/a/10r1C), which also discusses system architecture and performance.

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210512202540785.png)

Nginx is another useful tool. It's an HTTP server and reverse proxy often used for reverse proxying and load balancing.

For a detailed guide, see [150 Core Nginx Topics](http://gk.link/a/10r1D), covering concepts, configuration, practice, HTTP, and OpenResty.

## Common Frameworks

Framework questions are less common in interviews. Learn frameworks mainly to meet project and work requirements.

### Spring and Spring Boot

**Can I learn Spring Boot without studying Spring first?**

Yes. Many companies use Spring Boot, and you can build projects with it directly. It can be easier to start with than Spring itself.

It's still useful to understand Spring AOP and IoC. For interviews, learn bean scopes and lifecycles and how Spring MVC works. See [Common Spring Interview Questions](https://javaguide.cn/system-design/framework/spring/spring-knowledge-and-questions-summary.html).

Use the [official Spring Boot documentation](https://spring.io/projects/spring-boot#learn) as a reference.

Practice integrating Spring Boot with technologies such as MyBatis, Elasticsearch, Spring Security, and Redis. Build demos, then use them in a small project.

Frameworks change quickly, so some books become outdated. For hands-on practice, use Shangguigu's projects and the [Java Backend Courses and Projects](https://mp.weixin.qq.com/s/jkZthmOSDgTF1PrCeNus_A) collection.

![](https://oss.javaguide.cn/github/javaguide/books/88714e9becd0485aae247772b6ed9949.png)

For Spring Boot internals, see [_Spring Boot Programming: Core Concepts_](https://book.douban.com/subject/33390560/). It's detailed but may not suit beginners.

![Spring Boot Programming: Core Concepts](https://oss.javaguide.cn/github/javaguide/books/image-20220424113546513.png)

For video lessons, see Shangguigu's [Spring Boot 3 for Beginners (2023)](https://www.bilibili.com/video/BV1Es4y1q7Bf/).

More open-source Spring Boot tutorials are listed in [Java Open-Source Technical Tutorials](https://javaguide.cn/open-source-project/tutorial.html#springboot).

![](https://oss.javaguide.cn/github/javaguide/open-source-project/open-source-project-springboot-technical-course.png)

### MyBatis

MyBatis is widely used in China. Learn it alongside Spring and Spring Boot.

You may also want to learn a MyBatis extension framework:

1. [MyBatis-Plus](https://baomidou.com/): Adds features to MyBatis to simplify development.
2. [MyBatis-Flex](https://mybatis-flex.com/): A lightweight extension that emphasizes performance and flexibility.

You can use one of these frameworks directly in a project.

### Unit Testing

Common Java testing and mocking tools include JUnit, Mockito, Spock, PowerMock, JMockit, and TestableMock.

JUnit is a common choice for tests, but you'll also need a mocking tool. Mockito and Spock are widely used options.

Some differences:

1. Spock can't mock static or private methods. Mockito supports static mocking since version 3.4.0; see [issue 1013](https://github.com/mockito/mockito/issues/1013) and [Mocking Static Methods With Mockito](https://www.baeldung.com/mockito-mock-static-methods).
2. Spock is based on Groovy and uses a readable given-when-then structure. Mockito doesn't prescribe a test structure, so teams need to agree on one. Spock tests are often shorter.
3. Mockito is widely used and is the default mocking tool integrated with Spring Boot Test.

Both are useful; Mockito applies to a wider range of projects.

Recommended testing resources:

1. [Alibaba's Internal Unit Testing Course](https://mp.weixin.qq.com/s/wzGxqNv58Zig9_Izi3VhDg)
2. [What Is Unit Testing and How Should You Do It?](https://javaguide.cn/system-design/basis/unit-test.html)
3. [Integration Testing in Spring](https://www.baeldung.com/integration-testing-in-spring)
4. [Testing the Web Layer](https://spring.io/guides/gs/testing-web/)
5. [An Introduction to Spock Unit Testing](https://mp.weixin.qq.com/s/axNE8OjFh9V9SGgaCZVgOw)
6. [Applying Mockito in Unit Tests](https://mp.weixin.qq.com/s/6s_5XSzKp8fckKuojSvXUw)
7. [How to Write Effective Unit Tests](https://mp.weixin.qq.com/s/Y75fSX92kysSmYrhEH6QFQ)

### Netty (Optional)

Netty is a popular Java networking framework. Whether to study it depends on your goals; many Java business projects don't use it directly.

Netty is built on NIO, a synchronous, non-blocking I/O model introduced in Java 1.4. It simplifies TCP and UDP server development. Projects such as Dubbo, RocketMQ, Elasticsearch, gRPC, and Spark use it, as do parts of frameworks such as Spring Cloud Gateway.

Recommended resources:

- [Netty in Action](https://book.douban.com/subject/27038538/)

![Netty in Action](https://oss.javaguide.cn/github/javaguide/books/image-20220424113715369.png)

This book introduces BIO and NIO before covering Netty's design and core concepts through practical examples.

- [Netty: A Practical Guide](https://book.douban.com/subject/30381214/)

![Netty: A Practical Guide](https://oss.javaguide.cn/github/javaguide/books/image-20220424113747345.png)

This book focuses on practical topics such as memory leaks and is intended for readers who already know the basics.

- [Learn Netty Through an Instant Messaging Project](https://book.douban.com/subject/35752082/)

![](https://oss.javaguide.cn/github/javaguide/open-source-project/image-20220503085034268.png)

It covers a chat project and Netty internals.

For videos, see [Black Horse's Netty Course](https://www.bilibili.com/video/BV1py4y1E7oA), which starts with NIO basics.

![](https://oss.javaguide.cn/github/javaguide/open-source-project/image-20220503115418795.png)

### Workflow Engines (Optional)

Flowable and Activiti are common open-source workflow engines in China. Camunda is another option. For a comparison, see [Choosing an Open-Source Workflow Engine](https://zhuanlan.zhihu.com/p/369761832).

Flowable and Camunda both originated as Activiti 5 forks, but their designs differ.

[LiteFlow](https://liteflow.cc/) handles logic-based flows, not role-based task assignments. For approval flows where tasks pass between roles, consider Flowable or Activiti. LiteFlow is better suited to complex business logic, such as pricing engines and order workflows, where steps can be separated into reusable components.

Further learning resources are available online.

## Search Engines

Search engines help retrieve information efficiently. Elasticsearch and Solr are common options; Elasticsearch is a good place to start.

For Elasticsearch, see the [Elastic Chinese community](http://www.elasticsearch.cn/) and the [official Elastic blog](https://www.elastic.co/cn/blog/), which share practical examples.

For video lessons, see Shangguigu's [Elasticsearch: From Beginner to Advanced](https://www.bilibili.com/video/BV1hh411D7sb/), which covers version 7.x and later adds features from 8.x.

The book _Elasticsearch Explained: Principles, Advanced Topics, and Engineering Practice_ is based on version 8.x and uses real project examples to explain core concepts.

![](https://oss.javaguide.cn/github/javaguide/books/one-book-guide-to-elasticsearch.png)

Further reading:

- [Common Elasticsearch Interview Questions — JavaGuide](https://javaguide.cn/database/elasticsearch/elasticsearch-questions-01.html)
- [An Introduction to Elasticsearch — Tencent](https://mp.weixin.qq.com/s/GG_zrQlaiP2nfPOxzx_j9w)
- [Elasticsearch Practices for Production](https://juejin.cn/post/7244819106343518268)
- [Didi's Elasticsearch Series](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzU1ODEzNjI2NA==&action=getalbum&album_id=3044498415449210882&scene=173&from_msgid=2247560768&from_itemidx=1&count=3&nolastread=1#wechat_redirect)
- [A Deep Dive into Elasticsearch](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzI2NDY1MTA3OQ==&action=getalbum&album_id=1340073242396114944&scene=173&from_msgid=2247487667&from_itemidx=1&count=3&nolastread=1#wechat_redirect): A series of theory and practice articles, with related [video lessons](https://space.bilibili.com/471049389).

## Distributed Systems and Microservices (Advanced)

This section covers several topics. The main ones are distributed algorithms and protocols, configuration centers, and distributed transactions.

Books and articles are useful for studying distributed systems. If you prefer video, look for courses or open lectures that suit your learning style.

**Books (theory):**

_Understanding Distributed Systems_ covers consensus algorithms and includes a Go implementation of Paxos.

![](https://oss.javaguide.cn/github/javaguide/books/deep-understanding-of-distributed-system.png)

_Learning Architecture from Scratch_ covers distributed systems, microservices, concurrency, and availability. It's also available as a [Geek Time course](http://gk.link/a/10pKZ); choose either the book or course.

![](https://oss.javaguide.cn/github/javaguide/books/20210412224443177.png)

Yu's [_Software Architecture Design: Bringing Large-Scale Website Technology and Business Architecture Together_](https://book.douban.com/subject/30443578/) covers similar topics.

![img](https://oss.javaguide.cn/github/javaguide/books/20210412232441459.png)

**Open course (theory):**

MIT 6.824: Distributed Systems is a well-known course. Each lecture studies a classic paper and covers principles and techniques for designing and implementing distributed systems.

- [How to Study MIT 6.824](https://www.zhihu.com/question/29597104)
- [MIT 6.824: Distributed Systems — Chinese Translation Wiki](https://mit-public-courses-cn-translatio.gitbook.io/mit6-824/)
- [MIT 6.824: Distributed Systems — CS Self-Study Guide](https://csdiy.wiki/%E5%B9%B6%E8%A1%8C%E4%B8%8E%E5%88%86%E5%B8%83%E5%BC%8F%E7%B3%BB%E7%BB%9F/MIT6.824/)

**Video course (hands-on):**

Watch Shangguigu's [2024 Spring Cloud course](https://www.bilibili.com/video/BV1gW421P7RD/). It covers the most widely used components in Spring Cloud and Spring Cloud Alibaba and prepares you to build microservice projects.

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/shangguigu-springcloud.png)

### Theory, Algorithms, and Protocols

Important distributed systems concepts include the CAP and BASE theorems, the Paxos and Raft algorithms, and the Gossip protocol.

**Recommended articles:**

- [CAP and BASE Theorems Explained](https://javaguide.cn/distributed-system/protocol/cap-and-base-theorem.html)
- [The Paxos Algorithm Explained](https://javaguide.cn/distributed-system/protocol/paxos-algorithm.html)
- [The Raft Algorithm Explained](https://javaguide.cn/distributed-system/protocol/raft-algorithm.html)
- [The Gossip Protocol Explained](https://javaguide.cn/distributed-system/protocol/gossip-protocol.html)

### Remote Calls

Services commonly communicate in two ways:

- **RPC:** Remote Procedure Call lets a client call a method on a remote service much like a local method. Dubbo is an RPC framework open-sourced by Alibaba and widely used in China.
- **HTTP clients:** Call another service's RESTful API over HTTP. Feign and OpenFeign, Spring Cloud's supported alternative to Feign, are common clients.

OpenFeign and Dubbo are both used for remote calls in microservices. OpenFeign uses HTTP; Dubbo supports several protocols and custom protocols. OpenFeign is common in Spring Cloud projects and is a good starting point.

If your project or job uses Dubbo, focus on it. See these guides:

- [RPC Fundamentals](https://javaguide.cn/distributed-system/rpc/rpc-intro.html)
- [Common Dubbo Questions](https://javaguide.cn/distributed-system/rpc/dubbo.html)

Also see the [official Dubbo documentation](https://cn.dubbo.apache.org/zh-cn/overview/home/).

### Service Registration and Discovery

Eureka, ZooKeeper, Consul, and Nacos provide service registration and discovery.

Nacos is widely used in China and also works as a configuration center.

For Nacos, start with the [official quickstart](https://nacos.io/zh-cn/docs/v2/quickstart/quick-start.html).

Further reading:

- [Nacos Architecture and Principles — Alibaba](https://developer.aliyun.com/ebook/36): Internals, design, and best practices.

- [Nacos Explained in 55 Diagrams](https://www.cnblogs.com/cbvlog/p/15636683.html)

- [How the Nacos Configuration Center Works](https://juejin.cn/post/6844904050840993805)

- [What Problems Does Nacos Solve? Configuration Management](https://nacos.io/zh-cn/blog/5w1h-what.html)

### API Gateways

Gateways can handle request routing, authentication and authorization, traffic control, load balancing, fallbacks, circuit breaking, logging, monitoring, parameter validation, and protocol conversion.

For fundamentals and technology choices, see [API Gateway Fundamentals](https://javaguide.cn/distributed-system/api-gateway.html).

For Spring Cloud projects, Spring Cloud Gateway is a common API gateway and an alternative to Netflix Zuul. It's built on WebFlux and uses a filter chain to provide routing, security, metrics, and rate limiting.

Further reading:

- [Common Spring Cloud Gateway Questions — JavaGuide](https://javaguide.cn/distributed-system/spring-cloud-gateway-questions.html)
- [Understanding Spring Cloud Gateway](https://mp.weixin.qq.com/s/XjFYsP1IUqNzWqXZdJn-Aw)
- [Ten Spring Cloud Gateway Questions](https://www.cnblogs.com/cbvlog/p/15493160.html)
- [Rate Limiting Spring Cloud Gateway with Sentinel](https://www.cnblogs.com/cbvlog/p/15512189.html)
- [Rate Limiting with Spring Cloud Gateway](https://www.aneasystone.com/archives/2020/08/spring-cloud-gateway-current-limiting.html)

### Configuration Centers

As a microservices system grows, it needs more configuration, such as service addresses and database settings.

Static configuration files may not be enough: storing secrets in a code repository can expose them, and changes may require a service restart.

Spring Cloud Config, Nacos, Apollo, and Kubernetes ConfigMaps can serve as configuration centers.

Apollo and Nacos are both good options. Nacos is also a service registry, while Apollo offers more configuration management features.

I recommend learning Nacos first; the resources are listed in the service registration section above.

### Distributed IDs

An ID uniquely identifies a record. A distributed ID is generated for use across a distributed system.

Common approaches include:

- **Algorithms:** UUID and Snowflake.
- **Open-source tools:** UidGenerator (Baidu), Leaf (Meituan), Tinyid (Didi), and IdGenerator.

For an introduction, see:

- [Distributed IDs: Concepts and Implementations](https://javaguide.cn/distributed-system/distributed-id.html)
- [A Guide to Designing Distributed IDs](https://javaguide.cn/distributed-system/distributed-id-design.html)

### Distributed Transactions

In a microservices architecture, a system is split into smaller services.

Each service may run on a different machine and use its own database. A single operation may therefore span multiple services and databases.

For example, placing an e-commerce order may update the order service and reduce inventory in another service, each with its own database.

![Distributed transaction diagram](https://cdn.jsdelivr.net/gh/javaguide-tech/blog-images-6@main/12-04-1/%E5%88%86%E5%B8%83%E5%BC%8F%E4%BA%8B%E5%8A%A1%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

**How can we ensure that all these operations either succeed or fail together?**

Database transactions alone can't guarantee this across services. This is where **distributed transactions** come in.

Common solutions include Seata and Hmily.

1. [Seata](https://seata.io/zh-cn/index.html "Seata"): An open-source distributed transaction solution for microservices.
2. [Hmily](https://gitee.com/shuaiqiyu/hmily "Hmily"): A distributed transaction solution designed for financial systems.

Seata is widely used in China and is a good option to study.

### Distributed Tracing

In distributed systems, requests pass through multiple services, which makes troubleshooting harder. Distributed tracing helps track a request across those services.

Many tracing systems draw on Google's paper _Dapper, a Large-Scale Distributed Systems Tracing Infrastructure_. Common tools include Pinpoint, SkyWalking, and CAT. Other options include Zipkin and Jaeger.

Zipkin is an open-source tracing tool from Twitter. Spring Cloud Sleuth is based on Zipkin.

SkyWalking is an Apache project for distributed tracing, analysis, and alerts, created by Wu Sheng.

SkyWalking is widely used in China and is a good option to learn.

## High Performance (Advanced)

### CDN (Learn the Concepts)

CDNs distribute static assets across locations so users can access them nearby. This improves load times and reduces server and bandwidth usage.

Learn the basic concepts and how to use a cloud provider's CDN service. See [Common CDN Questions](https://javaguide.cn/high-performance/cdn.html).

### Message Queues

Message queues support asynchronous processing, service decoupling, and traffic smoothing in distributed systems.

Common options include:

1. [RocketMQ](https://github.com/apache/rocketmq "RocketMQ"): A high-throughput distributed messaging system from Alibaba.
2. [Kafka](https://github.com/apache/kafka "Kafka"): A distributed publish-subscribe messaging system.
3. [RabbitMQ](https://github.com/rabbitmq "RabbitMQ"): An Erlang-based message broker that supports AMQP.
4. [Pulsar](https://github.com/apache/pulsar): A cloud-native distributed messaging and streaming platform.

Choose either RocketMQ or Kafka to study in depth; learn the basics of the others.

For fundamentals and technology choices, see [Message Queue Fundamentals](https://javaguide.cn/high-performance/message-queue/message-queue.html).

For Kafka, RocketMQ, and RabbitMQ resources, see this [Knowledge Planet post](https://t.zsxq.com/0bEDFwgon).

### Read/Write Separation and Sharding (Learn the Concepts)

Read/write separation routes database writes to a primary node and reads to one or more replicas.

It can improve read performance and is useful when a system has many concurrent reads.

![Read/write separation diagram](https://oss.javaguide.cn/github/javaguide/high-performance/read-and-write-separation-and-library-subtable/read-and-write-separation.png)

Database and table sharding addresses performance problems caused by large data volumes.

Common tools include ShardingSphere-JDBC (formerly Sharding-JDBC), TSharding, MyCAT, and Cobar. ShardingSphere-JDBC is a lightweight Java framework delivered as a JAR and doesn't require a separate service to operate.

![Database and table sharding](https://oss.javaguide.cn/java-guide-blog/662ea3bda90061d0b40177e3a46fefc3.jpg)

Some companies use distributed relational databases such as TiDB, which handle sharding internally. Learn the concepts and principles; extensive practice may not be necessary. See [Common Questions About Read/Write Separation and Sharding](https://javaguide.cn/high-performance/read-and-write-separation-and-library-subtable.html).

### Load Balancing

Load balancers distribute work, such as user requests, across servers to improve performance and reliability.

Load balancing can happen on the **server side** or **client side**. Server-side options include hardware such as F5, A10, and Array, or software such as LVS, Nginx, and HAProxy. Java microservice frameworks such as Dubbo and Spring Cloud provide client-side load balancing. Dubbo includes it by default; Spring Cloud offers it as a component. Common choices are Spring Cloud LoadBalancer and the deprecated Ribbon.

Learn Nginx and Spring Cloud LoadBalancer.

For concepts, algorithms, and implementation options, see [Common Load Balancing Questions](https://javaguide.cn/high-performance/load-balancing.html).

## High Availability (Advanced)

High availability means a system remains accessible most of the time, including during hardware failures and upgrades.

### Rate Limiting, Graceful Degradation, and Circuit Breaking

Rate limiting controls how frequently an API accepts requests to protect it from overload. For example, an endpoint might accept 100 requests per second and reject or queue excess requests.

For rate-limiting algorithms and single-node or distributed implementations, see [Rate Limiting](https://javaguide.cn/high-availability/limit-request.html).

Graceful degradation reduces or disables lower-priority features under heavy load to preserve core functionality.

Graceful degradation handles problems in the current system; circuit breakers protect it when a dependency or third-party service fails.

Netflix's [Hystrix](https://github.com/Netflix/Hystrix "Hystrix") and Alibaba's [Sentinel](https://github.com/alibaba/Sentinel "Sentinel") support rate limiting, graceful degradation, and circuit breaking. Hystrix is no longer maintained; Sentinel is an alternative. See Sentinel's comparison of [common rate-limiting and degradation components](https://github.com/alibaba/Sentinel/wiki/%E5%B8%B8%E7%94%A8%E9%99%90%E6%B5%81%E9%99%8D%E7%BA%A7%E7%BB%84%E4%BB%B6%E5%AF%B9%E6%AF%94).

Sentinel's wiki also explains [how Sentinel differs from Hystrix](https://github.com/alibaba/Sentinel/wiki/Sentinel-%E4%B8%8E-Hystrix-%E7%9A%84%E5%AF%B9%E6%AF%94).

For Sentinel, start with the [official documentation](https://sentinelguard.io/zh-cn/docs/introduction.html).

Further reading:

- [17 Questions About Alibaba Sentinel](https://mp.weixin.qq.com/s/w8lhJfhLdh7POpPw2MyPwA)
- [How Sentinel Works Internally](https://mp.weixin.qq.com/s/FewOTrevjiCfooVIVwo4Xg)
- [Sentinel's Sliding-Window Flow-Control Algorithm](https://mp.weixin.qq.com/s/Q3C3DxtCJvTE5CCl3EWF9w)

### Queues

Queuing is another way to control traffic. For example, online games may place users in a queue during busy periods.

Queues can be implemented with message queues or the blocking queues in the JDK.

### Clusters

Run multiple instances of the same service to avoid a single point of failure.

### Timeouts and Retries

**Set a deadline for each request and fail it if there's no response in time.** Without timeouts, slow requests can pile up until the system can't process more work.

Retries are often limited to three attempts. More retries can increase server load, and some operations shouldn't be retried.

## Cloud Native (Optional)

> **Note:** Cloud-native development requires broad skills and is not usually required for Java backend roles. Skip this section if it isn't relevant to your goals.

Cloud native is an approach to building and running applications in the cloud. It commonly brings together microservices, DevOps, continuous delivery, and containers.

Languages and frameworks continue to add cloud-native support. Examples include Spring Native and Red Hat's Quarkus Java framework.

If you're interested in cloud native, focus on these areas:

1. **Microservices:** Kubernetes is commonly used to build and run cloud-native services; Spring Cloud may not be necessary for this path.
2. **Gateways:** Handle authentication, authorization, routing, rate limits, API management, and load balancing at the system's traffic entry point.
3. **Logs and observability:** Metrics provide dashboards in tools such as Grafana; traces show request paths; logs record events.
4. **Containers:** Docker and other container tools help package applications for consistent deployment.
5. **Kubernetes:** Provides core orchestration capabilities for cloud-native applications.
6. **DevOps:** Automates the application lifecycle, including development, testing, and operations, using practices such as CI/CD.
7. **Service mesh:** Adds a layer for managing service-to-service communication, often without changes to application code.
8. ...

Kubernetes is a key topic. Consider using it in a project.

For an introduction to cloud native, see [What Skills Do Developers Need in the Cloud-Native Era?](https://mp.weixin.qq.com/s/ZVbwNnvRwXxQqk7A-OA27g).

Also see [The Technology Stack for Cloud-Native Architecture in 2024](https://crossoverjie.top/2024/04/11/ob/2024-cloud-native/).

## AI Application Development (Optional)

AI is now part of a Java backend developer's skill set, but you don't need to force it into your initial Java studies. First build a solid foundation in Java, Spring, databases, caching, distributed systems, and hands-on projects. Then follow the roadmap below to learn AI application development.

- [AI Application and Agent Roadmap for Java and Go Developers (2026)](./java-to-ai-roadmap.md): A backend-focused path through LLM fundamentals, LLM APIs, prompts, RAG, agents, production engineering, and hands-on projects.
- [Advice for Backend Developers Moving into AI Agent Development (2026)](./backend-to-ai-agent-roadmap.md): Read this if you're unsure whether to move into AI, whether to choose Java or Python, or which roles to target.
- [AI Application Development Knowledge Base](../ai/): Articles on LLM fundamentals, agents, RAG, MCP, prompt engineering, evaluation, and AI system design.
- [AI Coding Practice Guide](../ai-coding/): A practical guide to Claude Code, Codex, AI IDEs, CLI agents, context management, and AI-assisted workflows.

If you're preparing for Java backend interviews, start with the basic AI concepts. If you want to work in AI application or agent development, follow the roadmap above.

## Conclusion

This roadmap covers a lot. Working through it can help you prepare for a good software development role.

If the full roadmap feels too long, or you're targeting a role at a smaller company, focus on Java fundamentals, databases, commonly used frameworks, and development tools.

Spend more time on the JVM, distributed systems, high concurrency, high availability, and microservices if you're targeting a large tech company or want to strengthen your job applications.

The job market is competitive, so finding a good role takes study and practice. You may not use everything you learn on the job, but interviews often test a broad range of topics because many candidates compete for each role. As the saying goes: “Build a rocket for the interview; tighten screws on the job.”

## Follow JavaGuide

Roadmap updates are posted on the JavaGuide WeChat public account. Follow it to keep up with the latest changes.

![JavaGuide official WeChat public account](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)

## Knowledge Planet

To help more people study Java and prepare for interviews, I created a [Java Interview Knowledge Planet](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html). It costs about one percent as much as a boot camp, while offering in-depth content and a broader range of services for Java learners and interview candidates.

**If you're learning Java or preparing for interviews, join my [Knowledge Planet](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html). It has plenty of practical material and a supportive learning community. The price is low, and the content may be more useful than a boot camp that costs tens of thousands of yuan.**

[![Knowledge Planet services](https://oss.javaguide.cn/xingqiu/xingqiufuwu.png)](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html)
