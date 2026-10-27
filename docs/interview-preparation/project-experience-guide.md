---
title: Project Experience Guide
description: A guide to building hands-on project experience when you have no project or your projects feel ordinary. Covers ways to find projects, develop strong highlights, review your work, and present it effectively to improve your resume and interview performance.
category: Interview Preparation
icon: "mdi:projector-screen-outline"
head:
  - - meta
    - name: keywords
      content: project experience,new-grad projects,hands-on projects,project highlights,resume project descriptions,backend projects,interview preparation,project reviews
---

::: tip A note
This article is adapted from the **[Java Interview Guide](../zhuanlan/java-mian-shi-zhi-bei.md)**, a companion resource to JavaGuide covering system design, common frameworks, distributed systems, high concurrency, and interview experiences.
:::

## What if you have no project experience?

Many new graduates face this problem. Some experienced developers are also unhappy with the projects they have worked on and want to build something more technically challenging.

Here are a few practical ways to gain project experience.

### Follow a hands-on course or series

Find a project course or tutorial series that matches your current skills and job goals, then build along with the instructor.

You can find project courses on platforms such as MooC, Bilibili, Lagou, GeekTime, or through training providers such as Black Horse and Shang Silicon Valley.

![Hands-on course on MooC](https://oss.javaguide.cn/javamianshizhibei/mukewangzhiazhanke.png)

Choose a project that fits your needs. You do not have to build a distributed or microservices system. For many learners, building a solid single-process application is already a worthwhile achievement.

I have interviewed many candidates whose resumes listed microservices experience, but a few questions made it clear that they had not built the system themselves or had not thought through the design. That leaves a poor impression.

I made a similar point in the interview preparation section of the **[Java Interview Guide](../zhuanlan/java-mian-shi-zhi-bei.md)**:

> In my view, you do not have to build a microservices or distributed system just for an interview. It may not help, and there are too many concepts to master quickly. These projects can be beyond what most new graduates are expected to build. Even if you complete one, many interviewers may wonder whether you built it yourself.
>
> A well-finished monolith can help you grow just as much as a microservices or distributed project. Beyond code quality, give your project a few clear strengths—for example, how you improved performance or fixed a pain point. Quantify results where possible: “I used XXX to solve YYY, increasing system QPS from A to B.”

Think actively while following a course instead of stopping at the instructor's explanation. A tutorial may only explain enough to finish the project. If you want to build deeper knowledge, study the important topics on your own.

### Explore hands-on open-source projects

There are many practical projects on GitHub and Gitee. Pick one to study. Once you understand the existing code, improve it or add a feature to deepen your understanding.

See the [Java Open-Source Projects for Practice](https://javaguide.cn/open-source-project/practical-project.html "Java Open-Source Projects for Practice") collection. It covers blogs and forums, exam and coding practice systems, online stores, permission systems, rapid development scaffolds, and reusable tools.

![Java open-source projects for practice](https://oss.javaguide.cn/javamianshizhibei/javaguide-practical-project.png)

Remember: **don't just build the project—improve it.** Course projects and open-source projects both have things you can refine.

### Build something from scratch

Choose something you want to create, build it yourself, and learn new concepts as you need them.

This takes more experience. If you have not built a project before, start with one of the first two approaches and try this after you have gained some project experience.

### Enter competitions organized by large companies

Winning an award can make the project experience especially valuable. Even if you do not win, you can still list your participation on your resume.

![Alibaba Cloud Tianchi competition](https://oss.javaguide.cn/xingqiu/up-673f598477242691900a1e72c5d8b26df2c.png)

### Contribute to a real project

Common ways to get involved in real business projects include:

1. A project from a professor or instructor.
2. Freelance work you find yourself.
3. A project from an internship or job.

Instructor-led and freelance projects are often focused on business features and may have little performance work. You can improve them by investing time in one area, such as refining the data model or adding a cache to speed up access.

You may encounter similar business-focused projects in an internship or job. Find opportunities to improve them on your own time.

Actually implementing an improvement is best, and the work helps you grow. If you cannot find time to build it, understand the approach thoroughly and prepare for related interview questions.

## Are there any good projects to try?

The interview preparation section of the **[Java Interview Guide](../zhuanlan/java-mian-shi-zhi-bei.md)** has an article with recommended practice projects, including business applications, reusable tools, public-course labs, and video tutorials. These can work well for learning or building project experience.

![Recommended Java projects for practice](https://oss.javaguide.cn/javamianshizhibei/project-experience-guide.png)

That article recommends more than 15 projects, including business applications and reusable components, open-source projects, and video tutorials. For new-grad recruiting, I recommend building one business application and one reusable tool or component.

## Will interviewers look down on a project I followed in a video?

Many new graduates build projects by following a video, and most interviewers know this.

Some interviewers may not value this approach, but that depends on the person. Most understand that students have limited access to real-world project experience. Many candidates learned from projects they found online or paid courses; only a few worked on production projects.

Choosing to build a hands-on project is a good start, and you can learn a lot from it. What matters is how much you understand and can do yourself. Do not passively follow the video—think about the design and improve the project. A tutorial-based project can still be made better.

**If you want to learn, do more than make the project run. Try to improve it yourself.**

Here are some approachable areas to improve:

1. **Global exception handling**: Many projects handle this poorly. See [A Clean Spring Boot Global Exception Handler with Enums](https://mp.weixin.qq.com/s/Y4Q4yWRqKG_lw0GLUsY2qw).
2. **Technology choices**: For example, replace Guava local caching with **Caffeine**, which performs better in several areas. Also check whether the controller layer contains too much business logic.
3. **Database**: Can the schema or indexes be improved? Can SQL be optimized? Would read/write splitting help?
4. **Caching**: Is frequently accessed data a good candidate for caching to improve response times?
5. **Security**: Are there any security issues in the project?
6. **Other areas**: …

The Knowledge Planet community also has examples of performance optimization in multithreading, asynchronous processing, indexes, and caching: <https://t.zsxq.com/06EqfeMZZ>.

Finally, here is a useful IntelliJ IDEA code inspection tip:

Right-click the project, then choose **Analyze → Inspect Code**.

![](https://oss.javaguide.cn/xingqiu/up-651672bce128025a135c1536cd5dc00532e.png)

After the scan, IDEA reports possible code smells, such as naming issues.

![](https://oss.javaguide.cn/xingqiu/up-05c83b319941995b07c8020fddc57f26037.png)

You can also customize the inspection rules.

![](https://oss.javaguide.cn/xingqiu/up-6b618ad3bad0bc3f76e6066d90c8cd2f255.png)

## How should you prepare for project deep dives?

Completing a project answers only “Do you have a project?” Technical interviews also explore architecture, your responsibilities, technology choices, core request flows, performance metrics, and production incidents. Prepare a 30-second and a three-minute introduction for each key project on your resume, then practice follow-up questions about its database, cache, message queue, and thread pool.

See [How to Present a Backend Project in an Interview](./backend-project-interview-guide.md) for a detailed method. Its order system is only an example of how to structure an answer; use your own real responsibilities and metrics.

## How should you prepare an AI agent project?

For an AI agent project, explain what you built and be ready to discuss why you used an agent, how requests flow through the system, how tool write operations are handled safely, and how you diagnosed and fixed a failure. See [How to Present an AI Agent Project: Architecture, Technology Choices, and Bad-Case Review](../ai/interview-questions/agent-project-interview-guide.md). The example is only a guide to structuring your answer; describe your own responsibilities and metrics accurately.
