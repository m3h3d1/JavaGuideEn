---
title: Seven Tips for Becoming a Senior Engineer
description: Seven practical suggestions for programmers aiming to become senior engineers or technical experts, covering requirements, efficiency, fundamentals, performance, production, systems thinking, and reflection.
category: Curated Technical Articles
author: Kaito
tag:
  - Growth and Learning
head:
  - - meta
    - name: keywords
      content: programmer growth,senior engineer,requirements review,fundamentals,performance optimization,production troubleshooting,reflection,career development
---

> **Editor's note:** What should an average programmer focus on to grow into a senior engineer or expert? Feige, author of the _Strengthening Engineering Fundamentals_ account, offers seven practical suggestions.
>
> **Overview:**
>
> 1. Deliberately improve at reviewing requirements.
> 2. Look for ways to improve efficiency.
> 3. Strengthen your technical fundamentals.
> 4. Think about performance.
> 5. Pay attention to production.
> 6. See the bigger picture.
> 7. Build your ability to summarize and reflect.
>
> **Original article:** <https://mp.weixin.qq.com/s/8lMGzBzXine-NAsqEaIE4g>

### Tip 1: Deliberately Improve at Reviewing Requirements

Let's start with requirements reviews. At internet companies, they are a major entry point for development work.

An average programmer usually takes the product manager's requirements and starts figuring out how to implement the feature and estimate the effort. They act as a translator from requirements to code. They rarely question whether a requirement makes sense or how much value the work will bring.

A senior engineer doesn't jump straight into implementation details. They start with the product and ask why the product manager wants this feature and what it is meant to achieve. In other words, they first consider whether the requirement is reasonable.

If a requirement is unreasonable, discuss it and either adjust or drop it. But negotiation doesn't only mean cutting scope; it can also mean strengthening the requirement.

Product managers may not have a technical background, so they might not have considered every possibility. If you have a better idea, suggest adding it to make the requirement more valuable.

In short, senior engineers don't blindly implement every line of the product manager's document. They think about what benefits the business and **remove, change, or add to requirements accordingly**.

This may not look like development work, but it helps ensure that the team builds something valuable instead of wasting effort. Too much wasted work also undermines developers' sense of achievement.

So, **if you want to grow as a developer, deliberately improve your ability to review requirements**.

### Tip 2: Look for Ways to Improve Efficiency

An average programmer follows instructions: if there is work, they do it; if not, they wait. They rarely ask why the existing code works the way it does, what its benefits are, where it has bottlenecks, or whether it can be improved.

A more experienced programmer doesn't consider a task finished as soon as the assigned code is written. They ask whether the current development process could be better and whether they can build something to make the team more efficient.

For example, when I took over a project six years ago, an operations colleague would ask me four times a month to send a push notification. Previous developers had always done this for her. The request was simple: make a small change and deploy it. But it was disruptive when I was focused on coding. More importantly, frequent manual changes to production add risk; one mistake could bring the service down.

I spent a week building an operations dashboard. After that, she could send notifications herself, and I could spend my time on more valuable work.

So, **look for inefficiencies in your work and take the initiative to fix them**.

### Tip 3: Strengthen Your Technical Fundamentals

What are technical fundamentals? Readers of the _Strengthening Engineering Fundamentals_ account are probably familiar with the term. It refers to subjects such as operating systems and networking that you studied in school.

An average programmer may think, “I already know these basics. I studied them for four years at university.” After starting work, they may not deliberately revisit those subjects or deepen their understanding.

Senior engineers know that what they learned in school was only an introduction. In their spare time, they study topics such as Linux and the internals of networking.

Many prominent engineers in the industry have grown through a deep understanding of these fundamentals. That strong foundation helped them become technical leaders.

It's hard to believe that a developer who doesn't understand the underlying systems and only knows CRUD and how to use other people's frameworks can become a technical expert.

**Keep strengthening your understanding of low-level systems.** If you don't know how to start, follow the _Strengthening Engineering Fundamentals_ account and keep learning.

### Tip 4: Think About Performance

An average programmer often stops thinking once the requirement is implemented and tests pass. They may not consider future traffic or know how much QPS their service can handle.

Senior engineers pay attention to the performance of their code.

During requirements review, they estimate request volume and then design an implementation that meets performance needs.

Before release, they run load tests to check whether the results meet expectations. If not, they find the bottleneck and determine how to optimize it.

So, **actively consider and improve the performance of the services you own**. This is important, but requires strong fundamentals. If you don't understand how networking works, how can you optimize it?

### Tip 5: Pay Attention to Production

An average programmer may pay little attention to production. They know their development and deployment machines but may not know how many production servers there are, how much traffic they handle, or whether traffic has changed recently.

Senior engineers understand that, when possible, they should monitor their production services: how the code is running, whether there are errors in the logs, CPU and memory usage during traffic peaks, network port usage, and whether any configuration should be adjusted.

If performance is unsatisfactory, they revisit the design, implement improvements, and deploy them.

When a production issue occurs, more senior engineers are often the ones who can quickly step in and resolve it.

Feige's fifth suggestion is to **monitor production regularly**. When an incident occurs, familiarity with production helps you diagnose and resolve it quickly.

### Tip 6: See the Bigger Picture

An average programmer may work only on the module assigned to them, setting a narrow boundary around their responsibilities and focusing only on that small area.

A senior engineer learns about all the project's modules, even those they don't own. People with this mindset often grow fastest, both technically and in their understanding of the business. They are also more likely to earn a promotion or take on a more senior role.

Some experienced engineers look beyond their team too, following the work and technology stacks of other teams and the wider industry. This brings to mind Zhang Yiming's advice not to set boundaries around your work.

**Think about the whole project, not just your own module.** You should know what your teammates are working on too.

### Tip 7: Build Your Ability to Summarize and Reflect

An average programmer finishes a task and moves on, rarely reviewing what they learned about the technology or business.

Senior engineers often reflect after completing a major piece of work. They might create a presentation or write a blog post to record what they learned. This helps them consolidate their knowledge and share it with colleagues, supporting the growth of the whole team.

<!-- @include: @article-footer.snippet.md -->
