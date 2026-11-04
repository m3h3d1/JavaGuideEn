---
title: Reflections on My First Six Months at Work
description: Reflections on a new graduate's first six months at work, the value of CRUD tasks, learning beyond work, and the transition from school to the workplace.
category: About the Author
tag:
  - Personal Experience
---

If you've read my earlier introduction, you know I'm one of the millions of graduates from 2019. This article shares some personal reflections from my first six months at work. Feel free to disagree in the comments; I respect different perspectives.

I work as a developer at a foreign-owned company. I've been here for a little over six months and have passed the probation period. I've worked on two business-focused projects, one of which is still in progress. You might be surprised that neither backend involved distributed systems or microservices, or used technologies such as Redis and Kafka in practice.

The first was an internal employee development and performance review system. Its stack included Spring Boot, JPA, Spring Security, Kubernetes, Docker, and React. The second, which is still underway, combines a game built with Cocos, a web-based admin console built with Spring Boot and Vue, and a mini program built with Taro.

Yes, most of my work involves CRUD, and I write frontend pages every day too. A friend was surprised to hear that most of my project work was business logic; he thought it wouldn't help me grow. Really? You're a new graduate—if you can't even write business code well, what are we talking about? **I don't understand why people who haven't mastered business code are so quick to dismiss CRUD. My code quality has improved, I can diagnose problems better, I understand the business more deeply, and I can now complete some frontend work on my own.**

Writing good business code isn't as easy as it sounds. Before complaining about doing CRUD every day, take a look at whether your CRUD code is well written. Have you understood the annotations and classes you use regularly? It's like someone who only knows basic annotations such as `@Service`, `@Autowired`, and `@RestController` claiming to have mastered Spring Boot.

At some point, people started treating practical experience with Redis and message queues as a big deal. That may be because of the current interview environment: you need to stand out, and if you want to join a top tech company, these technologies seem to be expected knowledge for most candidates.

**To be honest, I fell into this “false dilemma” in college too.** I first encountered Java in my second year, after joining a technology-focused student media group. We learned Java to build a campus app. I was still a beginner, and it took time to learn the fundamentals before I started studying Android development.

In the first semester of my third year, I decided to pursue Java backend development. After about three months of web development fundamentals, I started studying distributed systems, including Redis and Dubbo. I learned from books, videos, and blogs, and built two complete projects by following tutorials: a typical business system and a distributed system. **I thought I was great after finishing them and felt ordinary CRUD work was beneath my level. Looking back, I was pretty full of myself!**

Then I joined a project with a professor during the summer of my third year, and reality hit. We built a moderately complex performance review system using SSM, Shiro, and JSP. I ran into all kinds of problems and couldn't write much of the code I thought I knew. Even simple CRUD took me several days. I had to review, learn, and code at the same time. It was exhausting, but I learned a lot and became more grounded. The biggest criticism I have of that project is that **it was impossible to maintain**.

Technology changes constantly. Mastering the fundamentals matters most. A few years ago, people used Spring with traditional XML configuration; now Spring Boot helps them develop faster. We used to rely on ActiveMQ for message queues, but today RocketMQ and Kafka are more common. With technology changing this quickly, no one can learn every framework and tool.

**I don't think beginners should jump straight into learning through a project, especially at work.** If your Java or Spring Boot fundamentals are weak, study them first before following a project tutorial or learning by other means. People often say you learn best by working through a project as you go. I think that advice needs a condition: you should already have a basic understanding of the technology and programming.

**The key point: if your fundamentals are weak, blindly following a video tutorial is not useful. You'll finish the video and still be unable to write the code on your own.**

I don't know how developers at other companies feel, but I think technical growth depends largely on what you do in your own time. In most cases, work alone makes you more efficient at completing familiar tasks. It can also improve your sense of code quality, if you pay attention to it.

In my spare time, I study topics that interest me. For example, my first project at the company used Spring Security and JWT, which I wasn't familiar with. I spent about a week learning the technology and building a demo, then shared it here: <https://github.com/Snailclimb/spring-security-jwt-guide>. That led me to write:

- [Authentication vs. Authorization, and Cookies vs. Sessions vs. Tokens](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485626&idx=1&sn=3247aa9000693dd692de8a04ccffeec1&chksm=cea24771f9d5ce675ea0203633a95b68bfe412dc6a9d05f22d221161147b76161d1b470d54b3&token=684071313&lang=zh_CN&scene=21#wechat_redirect)
- [JWT Authentication: Pros, Cons, and Common Solutions](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485655&idx=1&sn=583eeeb081ea21a8ec6347c72aa223d6&chksm=cea2471cf9d5ce0aa135f2fb9aa32d98ebb3338292beaccc1aae43d1178b16c0125eb4139ca4&token=1737409938&lang=zh_CN#rd)

Another example: while staying home during the recent pandemic, I studied Kafka and started preparing a series of beginner articles. These are complete:

1. Kafka for Beginners, in Plain Language
2. Installing Kafka and Trying Its Basic Features
3. Sending and Receiving Messages with Kafka and Spring Boot
4. Transactions and Error Handling When Sending and Receiving Kafka Messages with Spring Boot

Still to come:

1. Advanced Kafka topics, such as its workflow and why Kafka is fast
2. Source-code analysis
3. And more...

**I believe a lot of technical growth happens outside work (unless you're already an expert or naturally very skilled).**

**There is a long road ahead, and no matter how much energy you have, you can't learn every technology you want to. Prioritize, make compromises, and make time to enjoy life.**
