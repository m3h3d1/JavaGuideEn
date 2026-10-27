---
title: Programmer Resume Guide
description: A practical guide to resume structure, project experience, and skills, based on how resumes are screened. Includes templates and common pitfalls to help you get more interviews and give interviewers a clear path to your strengths.
category: Interview Preparation
icon: "mdi:account-tie-outline"
head:
  - - meta
    - name: keywords
      content: programmer resume,Java resume,resume review,project experience,resume templates,new-grad resume,experienced-hire resume,interview preparation
---

::: tip A note
This article is adapted from the **[Java Interview Guide](../zhuanlan/java-mian-shi-zhi-bei.md)**, a companion resource to JavaGuide covering system design, common frameworks, distributed systems, high concurrency, and interview experiences.
:::

## Introduction

A good resume matters throughout the application process and in the interview itself.

**Why does your resume matter?** Here are two reasons:

**1. Your resume is your first impression and can determine whether you get an interview.**

- For an online application, HR will screen your resume. They may spend only about ten seconds deciding whether to move you to the interview stage.
- For a referral, the person referring you can only do so much if your resume does not make your strengths clear.

Even after you pass the initial screening, interviewers use your resume to decide which parts of your experience deserve a closer look.

**2. Your resume largely determines what interviewers ask about.**

- Interviewers usually ask about the skills you list. Java fundamentals, collections, concurrency, MySQL, Redis, Spring, and Spring Boot are common topics. If you say you are proficient with Redis, expect questions about it. If you mention a message queue in a project, expect follow-ups about message queues.
- The proficiency level you claim also affects how deeply interviewers explore a topic.

Writing a strong resume without overstating your abilities is a valuable skill. People with strong technical and learning skills often know how to present those strengths well, too.

## Resume templates

Visual presentation matters. If a resume is difficult to read, interviewers may not want to continue. Recruiters can review hundreds of resumes in a day, so make yours easy to scan.

I recommend writing your resume in Markdown and exporting it as a PDF. If you are unfamiliar with Markdown, you can learn the basics in about half an hour: <http://www.markdown.cn/>.

Here are some resume templates and tools:

- Chinese resume templates (recommended, open source and free): <https://github.com/dyweb/awesome-resume-for-chinese>
- MujiCV (recommended, some features are free): <https://www.mujicv.com/>
- Simple Resume (recommended, some features are free): <https://easycv.cn/>
- Polebrief (free): <https://www.polebrief.com/index>
- Markdown resume formatter (open source and free): <https://resume.mdnice.com/>
- Chinaz Resume (paid, with AI generation): <https://jianli.chinaz.com/>
- Custom resume templates with Typora, Markdown, and CSS: <https://github.com/Snailclimb/typora-markdown-resume>
- WonderCV (some features are paid): <https://www.wondercv.com/>

Most of these templates are limited to one page, which may not leave enough room for your experience. Unless you have exceptional credentials, such as an ACM competition award, include enough detail to show your strengths. As a general guide, keep new-grad resumes to two pages and experienced-hire resumes to three. Be concise and avoid filler.

A few **resume formatting tips**:

- Keep the layout simple and avoid unnecessary decoration.
- Use standard capitalization for technical terms, such as `Java` rather than `java` and `Spring Boot` rather than `spring boot`. Some interviewers care about this detail.
- Add spaces between Chinese text and English words or numbers when they appear together; it improves readability.

The Knowledge Planet community also has real resume examples: <https://t.zsxq.com/12ypxGNzU> (available to [members](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html)).

![](https://oss.javaguide.cn/javamianshizhibei/image-20230918073550606.png)

## Resume content

### Personal information

- **Essential**: legal name, age, phone number, place of origin, contact information, and email address.
- **Optional**: GitHub profile and blog. Leave them out if they do not contain relevant technical work.

Example:

![](https://oss.javaguide.cn/zhishixingqiu/20210428212337599.png)

**Should you include a photo?** This is a common question.

Either choice is fine and usually has little impact, unless the role specifically requires a photo. If you include one, use a professional headshot rather than a casual photo.

### Target role

State which role you are applying for and your preferred location. You can put this in the personal information section as well.

Example:

![](https://oss.javaguide.cn/zhishixingqiu/20210428212410288.png)

### Education

Include your degree, major, school, and graduation dates so interviewers can quickly understand your education background.

Example:

> Beijing Institute of Technology, M.Eng. in Software Engineering, Sep 2019–Jan 2022
>
> Hunan University, B.Sc. in Applied Chemistry, Sep 2015–Jun 2019

### Technical skills

Start by listing the skills you have, then compare them with the requirements of your target roles. HR may not have a technical background, so they often screen for keywords. If a company asks for a skill you do not yet have, you can spend a few days learning the basics and list it as a skill you are familiar with.

The template below lists common Java backend development skills. Adjust it to match your experience and the job description; the goal is to cover the role's requirements honestly.

![Java backend skills template](https://oss.javaguide.cn/zhishixingqiu/jinengmuban.png)

Here is a skills section from a candidate's resume. Let's identify some issues:

![](https://oss.javaguide.cn/zhishixingqiu/up-a58d644340f8ce5cd32f9963f003abe4233.png)

Issues with the skills section above:

- Use standard capitalization for technical terms, such as `Java` rather than `java` and `Spring Boot` rather than `spring boot`. Some interviewers care about this detail.
- The skills list is unfocused and does not highlight a strength. You do not need to be good at everything; show where you are strong.
- Some Java backend skills, such as Spring Boot, are listed only as “familiar,” which may not meet an employer's expectations.

### Internships and work experience (important)

Work experience is generally for experienced-hire candidates; internships are generally for new-grad candidates.

List work experience in reverse chronological order. For each role or internship, briefly highlight your main contributions.

Example:

> **XXX Company (Month 201X–Month 201X)**
>
> - **Role**: Java Backend Developer
> - **Responsibilities**: Primarily responsible for XXX

### Project experience (important)

It is common to list one or two projects, but many candidates struggle to present them well. Project descriptions are often too long, too brief, or missing a clear highlight.

Use this template:

> **Project name** (use a larger font)
>
> May 2017–June 2018 · Java Backend Developer, Taobao
>
> - **Project summary**: Briefly explain what the project does.
> - **Tech stack**: List the technologies used, such as Spring Boot, MySQL, Redis, MyBatis-Plus, Spring Security, and OAuth 2.0.
> - **Contributions and responsibilities**: Explain what you did, what problem you solved, and what improved. Highlight your skills instead of listing routine tasks.
> - **What you learned (optional)**: Mention useful skills or technologies you picked up. This is usually unnecessary if your responsibilities already show what you learned.
> - **Project results (optional)**: Briefly state the project's outcomes.

**1. Focus on your contribution and briefly describe the project.**

Keep the project summary to about two lines. Include enough context to make it clear, but do not spend too much space on it.

What you learned and the project results are optional. If you include them, keep them brief; your main focus should be your responsibilities and contributions.

**2. List technology names in the architecture section; do not explain what each technology does.** That explanation usually adds little value.

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/46c92fbc5160e65dd85c451143177144.png)

**3. Avoid describing only routine business tasks. Find a few contributions that show your range.** Around six to eight responsibility bullets is usually enough. You might explain how you coordinated development with teammates, solved a difficult problem, or improved a module's performance.

Even if you did not build a feature or solve a problem yourself, you can still use it as a project highlight once you understand it thoroughly; polish the wording as needed.

Performance improvements are often easy to prepare before an interview, but do not make every bullet about performance. That can become one-sided.

Whenever possible, quantify the outcome of technical improvements:

- Used **XXX** to solve **YYY**, increasing system QPS from **A** to **B**.
- Optimized the **XXX** endpoint using **YYY**, increasing system QPS from **A** to **B**.
- Used **XXX** to solve **YYY**, improving query speed by **Z** and reaching 100,000+ QPS.
- Optimized the **XXX** module using **YYY**, reducing response time from two seconds to 0.2 seconds.
- …

Example responsibility bullets (do not copy them directly; tailor them to your own projects, or you may be unable to answer follow-up questions):

- Implemented unified authentication and authorization for microservices using Spring Cloud Gateway, Spring Security OAuth 2.0, and JWT, with dynamic access control based on RBAC.
- Contributed to the order module, building order creation, deletion, and query features and using a Spring state machine to manage order transitions.
- Added Elasticsearch for product and order search, including product recommendations and search suggestions.
- Integrated Canal and RabbitMQ to sync incremental MySQL data, such as product and order records, to Elasticsearch.
- Used RabbitMQ's delayed-message plugin for tasks such as automatic cancellation of expired orders, coupon expiration reminders, and refund processing.
- Added RabbitMQ to a notification system for asynchronous processing, load leveling, and service decoupling. The peak delivery rate reached 100,000 messages per second, with up to 20 million messages per day.
- Used MAT to analyze a heap dump and resolve widespread service-timeout alerts after a new version of the advertising service was deployed.
- Diagnosed and fixed a deadlock in the billing module caused by a parent billing task and an anti-fraud subtask sharing a thread pool.
- Built advertising data import and export with EasyExcel, inserted records in batches with MyBatis, and used a task table for asynchronous processing.
- Developed the user statistics module and used CompletableFuture to load data concurrently, reducing average response time from 3.5 seconds to one second.
- Used Sentinel for rate limiting and graceful degradation in key scenarios, including registration, login, and address lookup.
- Added Redis and Caffeine as a two-level cache for popular data, including the homepage and popular blogs, addressing cache breakdown and penetration. Query times reached the millisecond range, with QPS above 300,000.
- Used CompletableFuture to coordinate asynchronous RPC calls for user, product, and coupon data in the shopping cart module, reducing response time from two seconds to 0.2 seconds.
- Set up EasyMock to simulate third-party APIs, making integration work possible in an isolated network environment.
- Built distributed tracing and end-to-end monitoring with SkyWalking and Elasticsearch.

**4. If your project's technology stack is dated, you can improve it on your own time.** The important thing is to give the project a clear strength; how you do that is up to you.

Project experience is an important part of your resume. The interview preparation section of the [Java Interview Guide](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html) has several articles on improving project descriptions; they are worth reading.

![](https://oss.javaguide.cn/zhishixingqiu/4e11dbc842054e53ad6c5f0445023eb5~tplv-k3u1fbpfcp-zoom-1.png)

**5. Do not make every responsibility bullet about the same technology.**

![](https://oss.javaguide.cn/zhishixingqiu/image-20230424222513028.png)

**6. Avoid vague wording. Be specific about the technology, scenario, and result, and keep the writing concise.** Do not pile up technology names or include unnecessary details.

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/project-experience-avoiding-ambiguity-descriptio.png)

### Awards (optional)

If you have a significant competition award, such as an ACM contest or Alibaba's Tianchi competition, include it. You can place this section near the top of your resume to make it more visible.

### Campus activities (optional)

Briefly mention noteworthy campus activities. Leave this section out if you do not have relevant experience.

### Personal summary

Use a concise personal summary to highlight your strengths. Avoid filler or vague claims such as “hard-working” and “willing to put in long hours”; interviewers rarely find them useful.

You can write about:

- Writing, learning, communication, and teamwork skills.
- Your attitude toward work and sense of responsibility.
- How you handle pressure and difficult problems.
- Your interest in technology and code quality.
- Experience developing or maintaining distributed and high-concurrency systems.

Here are three examples based on real experience:

- **Fast learner**: Quickly learned Python during my third year to build a configurable web crawler for a national software design competition.
- **Team player**: Coordinated five developers in a national software design competition and helped teammates resolve coding issues; we completed the core features in one month.
- **Project experience**: Led the development of several enterprise projects while at university.

## STAR and FAB methods

### STAR (Situation, Task, Action, Result)

The STAR method can help you structure your resume and communicate with interviewers. Its name comes from the first letters of four words:

- **Situation**: What was happening?
- **Task**: What were you responsible for?
- **Action**: What did you do?
- **Result**: What was the outcome?

### FAB (Feature, Advantage, Benefit)

The FAB method is also used in sales. Its name comes from:

- **Feature**: What are your strengths or distinguishing qualities?
- **Advantage**: What do you do better than others?
- **Benefit**: What value would an employer gain by hiring you?

In short, **FAB helps interviewers understand your strengths and the value you can bring to a company.**

## Tips

### Keep the page count reasonable

Be concise and highlight your strengths. As a general guide, keep a new-grad resume to two pages and an experienced-hire resume to three. If you have more to say, you do not have to squeeze everything onto one page; prioritize a clean, readable layout.

After reviewing thousands of resumes, I have seen a few that were close to ten pages long. That's a lot to get through.

![A resume that is too long](https://oss.javaguide.cn/zhishixingqiu/image-20230508223646164.png)

### Avoid vague language

Avoid subjective claims and vague adjectives. Keep the wording clear and the structure easy to follow.

For example:

- **Weak**: I played a very important role on the team.
- **Stronger**: As the backend lead, I led the design and development of the backend system.

### Use a clear layout

Resume layout matters. You do not need decorative design, but the structure should be clear and easy to read.

### Other advice

- Submit your resume as a PDF, not a Word document or another format.
- Do not list skills you do not have. Keep your resume truthful; clear, polished wording is fine.
- List work experience in reverse chronological order. For internships, put the most relevant experience first.
- Present your project experience clearly. Focus on what you did and your contributions, not just what the project does.
- List projects in reverse chronological order. Choose two or three strong projects rather than listing many without clear highlights.
- During interview preparation, focus on the claims in your resume, especially your projects and skills.
- Interviews and day-to-day work are different. Guide the conversation toward areas you know well, but remember that earning the offer you want still requires strong skills.

## Resume reviews

So far, I have provided free resume reviews to **6,000+** Knowledge Planet members. Because of limited time, this service is available only to members. To request a review, join the [official JavaGuide Knowledge Planet](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html#%E7%AE%80%E5%8E%86%E4%BF%AE%E6%94%B9) (follow the link for details).

![Resume review](https://oss.javaguide.cn/xingqiu/%E7%AE%80%E5%8E%86%E4%BF%AE%E6%94%B92.jpg)

Membership costs about one percent of a typical training program, while offering in-depth content and a wide range of services for Java learners and interview candidates.

Here are some of the services included (click the image for details about Knowledge Planet):

[![Knowledge Planet services](https://oss.javaguide.cn/xingqiu/xingqiufuwu.png)](../about-the-author/zhishixingqiu-two-years.md)

Here's a limited-time coupon:

![¥30 Knowledge Planet coupon](https://oss.javaguide.cn/xingqiu/xingqiuyouhuijuan-30.jpg)
