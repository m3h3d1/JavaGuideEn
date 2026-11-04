---
title: "Outdated Java Technologies You Shouldn't Learn"
description: An overview of outdated Java technologies, including JSP, Struts, EJB, Java Applets, and SOAP, with modern alternatives.
category: About the Author
tag:
  - General
---

A few days ago, I answered a question on Zhihu: “I can't get past JSP while learning Java. What should I do?”

I wanted to help the person avoid a detour, so I said there was no need to learn technologies that had become obsolete. I also listed some technologies that have fallen out of use in Java development.

## Outdated Java Technologies

Here is my original answer, listing several technologies that have fallen out of use in Java development:

**JSP**

- **Why:** JSP is outdated and no longer meets the needs of modern web development. Frontend-backend separation has become the norm.
- **Alternatives:** Template engines such as Thymeleaf and FreeMarker remain common in traditional full-stack development. In frontend-backend separated architectures, modern frontend frameworks such as React, Vue, and Angular have taken over JSP's role.
- **Note:** Some legacy projects at state-owned enterprises may still use JSP, but this is becoming less common.

**Struts (especially 1.x)**

- **Why:** It requires extensive configuration, slows development, and has had serious security vulnerabilities, including well-known Apache Struts 2 vulnerabilities. Community support has also weakened, and its ecosystem has shrunk.
- **Alternatives:** Spring MVC and Spring WebFlux offer a simpler development experience, broader capabilities, and active community support. They have largely replaced Struts.

**EJB (Enterprise JavaBeans)**

- **Why:** EJB is complex, costly to develop with, and has a steep learning curve. In practice, lighter frameworks have gradually replaced it.
- **Alternatives:** Spring and Spring Boot provide simpler, capable solutions for enterprise development and have become the de facto standard in Java enterprise development. The Chinese framework Solon and cloud-native-friendly Quarkus are also worth considering.

**Java Applets**

- **Why:** Modern browsers such as Chrome, Firefox, and Edge have removed support for Java Applets. Applets also have serious security issues.
- **Alternatives:** HTML5, WebAssembly, and modern JavaScript frameworks such as React and Vue can provide safer, more efficient interactive experiences without requiring browser plugins.

**SOAP / JAX-WS**

- **Why:** SOAP and JAX-WS are complex, and their XML payloads are verbose, which can hurt development efficiency and performance.
- **Alternatives:** RESTful APIs and RPC are lighter and more efficient, making them common choices in modern microservice architectures.

**RMI (Remote Method Invocation)**

- **Why:** RMI is an early Java technology for remote calls, but it has poor interoperability, requires extensive configuration, and can perform poorly.
- **Alternatives:** RESTful APIs and RPC provide simpler, more efficient ways to make remote calls and have largely replaced RMI.

**Swing / JavaFX**

- **Why:** Desktop applications have a smaller share of development work, while web and mobile applications have become more common. Swing and JavaFX also have smaller ecosystems than modern cross-platform frameworks.
- **Alternatives:** Cross-platform desktop frameworks such as Flutter Desktop and Electron offer a more modern development experience.
- **Note:** Some legacy projects at state-owned enterprises may still use Swing or JavaFX, but this is becoming less common.

**Ant**

- **Why:** Ant is an XML-based build tool that can be cumbersome to configure and use.
- **Alternatives:** Maven and Gradle provide more efficient dependency management and build features, and are now common choices for Java projects.

## A Predictable Comment

As expected, the comments included a familiar kind of contrarian:

> “You aren't learning technology; you're learning ideas. Is crawling also a skill humans don't need? Why do you have to learn to crawl before you can walk? If you don't understand the fundamentals and just learn frameworks, you'll end up as a useless copy-and-paste programmer!”

<img src="https://oss.javaguide.cn/github/javaguide/about-the-author/prattle/deprecated-java-technologies-zhihu-comments.png" style="zoom:50%;" />

This may sound reasonable at first, but it actually reveals **ignorance and a rigid mindset**.

**The less people know, the more certain they tend to be**, because they have never seriously considered opposing views or developed a broad understanding of how technology evolves.

For example, when I first started learning Java backend development, I had little experience and picked up a book at random. I read **Java Web Integration Development: The Return of the King**—the book that started it all for me.

When I was in college, much of the book was already outdated. It devoted many pages to JSP, Struts, Hibernate, EJB, and SVN. Even so, I'm still grateful to it for introducing me to Java backend development.

![](https://oss.javaguide.cn/github/javaguide/about-the-author/prattle/java-web-integration-development-king-returns.png)

The book has **1,010** pages. I studied it obsessively and spent a long time working my way through the whole thing.

Looking back, I could have saved a lot of time for more relevant and practical topics if I had avoided technologies that were already obsolete.

Are these outdated technologies useful? Honestly, **they're a waste of time**.

**If you're going to spend time learning, why not learn technologies that are more widely used and practically valuable?**

The job market is already competitive. Whether you focus on Java or another area, there is a lot to learn.

If you want to understand the underlying ideas, spend your time studying Servlets, the internals of Spring AOP and IoC, or how Spring MVC works by reading its source code. Those are more useful than spending time on JSP, which has little practical value today.

These topics can help you understand core concepts and apply them in real projects. Isn't that more worthwhile than spending a lot of time on JSP?

## Should You Learn a Technology Just Because Some Companies Still Use It?

After I shared this article on my [WeChat public account](https://mp.weixin.qq.com/s/lf2dXHcrUSU1pn28Ercj0w), I got another kind of comment that I found rather misguided:

- “JSP is old, but you should still learn the basics because many legacy projects use it.”
- “Many old projects at state-owned enterprises still use it, so you definitely need to learn it!”

That argument takes things too far. By the same logic, you'd also need to learn outdated technologies such as Struts 2, SVN, and JavaFX just because some companies still use them. A college classmate of mine joined a state-owned enterprise in Wuhan after graduation, spent a year writing JavaFX, and couldn't take it anymore. He had never used JavaFX before joining, and it never came up in his job interviews.

Don't assume you'll end up working on a project with an outdated technology stack. Look for jobs that use mainstream technologies and offer room to grow in a comfortable environment. If you can't find a suitable role and end up maintaining a legacy project, you can learn what you need as you go.

**Beginners who insist on learning obsolete technologies despite being advised otherwise may want to reconsider whether this field is right for them.**
