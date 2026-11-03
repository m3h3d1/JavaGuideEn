---
title: How to Spot Exaggeration on a Resume
description: A hiring manager's perspective on assessing resumes, project experience, technical depth, and claims made by candidates.
category: Curated Technical Articles
author: Coody
tag:
  - Interviews
head:
  - - meta
    - name: keywords
      content: Resume Claims,Interviewer's Perspective,Resume Screening,Technical Interviews,Training Programs,Project Experience,Technical Depth,Interview Skills
---

> **Editor's note:** I often hear from friends who attended training programs about how their instructors taught them to “package” their resumes. It is not limited to training programs; many people I know polish their resumes before an interview. The practice is widespread. Interviewers are not all easily fooled, though. This article describes how an interviewer can assess a candidate's claims.
>
> **Original article:** <https://my.oschina.net/hooker/blog/3014656>

## Introduction

Experienced professionals and newcomers alike encounter the idea of “packaging” a resume. When you apply to a company you like, how does its recruiting team assess whether your resume exaggerates your experience? I wrote this article based on my own experience. No one is a genius, and presenting yourself in the best light is understandable. Do not assume that every point applies to you.

## The Article

As the internet expanded rapidly, more workers from many industries entered the IT field.

Back in 2016, my company posted openings for Java and iOS engineers. For the Java role alone, we received nearly 200 resumes a day; for iOS, nearly 1,000.

That was the result of training programs flooding the market with candidates for iOS roles. In the years since, the labor supply has increasingly exceeded demand. Assessing candidates has become a major challenge for employers.

I first interviewed job candidates in June 2015. I had little experience at the time and missed out on some strong candidates.

Three years later, as the company grew, I began interviewing candidates more extensively again.

### 1. Initial Screening: How to Spot a Weak Resume

In addition to technical training, training programs often offer **resume-writing guidance** and **interview coaching**. Their influence can be difficult to detect, but resumes polished by these programs often share the same patterns.

**A relatively young candidate with an advanced degree**

This alone is not a reliable indicator. Most candidates have the educational background commonly expected in the market. A few tech enthusiasts may have earned a degree through self-study, in which case they should be able to demonstrate distinctive technical strengths.

**An older candidate with little technical experience**

This can be more concerning. People generally find it harder to learn new things as they get older, and that includes internet technologies. If an older candidate has little technical experience, there may be two explanations:

1. They changed careers midway, perhaps through a training program or self-study.
2. They left existing experience off the resume because their abilities, experience, or compensation did not align.

**Project experience consists mostly of management systems**

Projects are a useful way to assess a candidate's experience. New internet companies and business models emerge every year. In job postings I recently handled, CRM systems, online stores, generic management systems, survey systems, and classroom systems made up 90% of the listed project experience. Were internal management systems really that popular in 2019? More to the point, when evaluating a resume, consider whether the projects are plausible. For example, did the candidate actually work at the company at that time, and was that company developing the project under the circumstances described? (Outsourced projects are an exception.)

**The project background does not fit the technology trends of the time**

Market trends change each year: e-commerce and online lotteries in earlier years, followed by O2O, prize-draw apps, livestreaming, and new retail. Each type of product emerged in a particular market context. A resume claiming that a project started in 2018 or 2019 for online lotteries (the government banned internet lottery sales in 2015), O2O, online stores, prize-draw apps (banned in early 2017), or livestreaming may not fit the market at the time. Look into the specific circumstances before drawing a conclusion.

**The experience lacks variety**

If several projects across different jobs all use the same architecture and structure, the experience may lack variety. Different companies usually have different technology stacks, product directions, and business models. When a candidate lists nearly identical technologies and workflows for projects at multiple companies, the resume may look tidy but can be less convincing.

**The technologies sound very new, but there is no mention of older ones**

The industry keeps adopting new technologies. But experienced CTOs and architects often choose existing technologies that are more stable, mature, and less costly to learn. Companies do not always pursue new technology for its own sake. Training programs, on the other hand, may teach “whatever is trending.” As a result, some newcomers know little about older technologies or have never heard of them.

**Many years of experience, but only low-level work**

If someone has substantial work experience but has done only low-level tasks, there may be a problem. Perhaps the former employer did not provide opportunities to grow, or perhaps the candidate lacked the ability to take on more advanced work. Another possibility is that the resume exaggerates the length of their experience. Consider the former company's size and background when assessing this.

**The companies are in different cities or provinces**

Like many employers, I have recently received resumes from many candidates who changed jobs across cities. More than 60% came from Wuhan, often from small companies named “Wuhan XX Network Technology Co., Ltd.” with fewer than 50 employees. Others came from Xiamen, Ningbo, Nanjing, and elsewhere. I will leave this point there; readers can draw their own conclusions. Cross-region job changes can be difficult to verify.

**No evidence of technical interest outside work**

Some developers overestimate their skills after working on a few management systems. They may list distributed systems, clusters, high concurrency, big data, message queues, search engines, containers, multiple databases, data centers, and more—and expect a salary above the market rate. Someone passionate about technology is likely to spend some free time learning it. You can check their blog or GitHub profile, or search by phone number, email, nickname, or handle to see whether they have a technical presence in forums, communities, or open-source projects.

### 2. During the Interview: How to Assess a Candidate's Claims

There is no definitive standard for evaluating how much a candidate has embellished their experience. Here are a few approaches I have used in interviews.

**Check whether the company size, team structure, roles, and collaboration model make sense for the claimed experience.**

For junior and mid-level candidates, ask questions such as: How many people worked at the company? How large was the product team? How many people worked in product, engineering, backend, frontend, client development, UI, and testing? How did the team collaborate? How long did development take? When did the product launch? How often did you release versions or campaigns? How many users did the product have, and what was its concurrency? Based on my experience, someone without relevant work experience may answer vaguely or give implausible details.

**Verify employment dates, project timelines, technology choices, and release processes.**

Some candidates embellish their resumes in pursuit of higher pay. Ask when they joined the company, when the project launched, what technologies it used, and how releases were reviewed. Their answers may not match the resume. You can sometimes check a project's website or app for technology clues, such as its HTTP behavior and error characteristics. If those clues conflict with the candidate's explanation, investigate further.

**Assess technical depth.**

1. Identify the candidate's technology stack. Ask which project they are most proud of and why, and which technologies they prefer and why.
2. Understand the project's maturity. Ask how long it ran, how many versions shipped, how many users it had, how much concurrency it handled, and what transaction volume it reached.
3. Learn about the candidate's technical engagement. Ask how they exchange ideas with other engineers and what topics they have discussed.

Many candidates I have interviewed list a wide range of technologies. To avoid asking outside their claimed expertise, I focus on technologies they list or say they have used. Here are a couple of examples.

**1) A candidate claims to be proficient with Redis.**

1. Which Redis data structures have you used, and in what business scenarios?
2. Which client or library did you use to access Redis?
3. Which serialization format did you use?
4. What was the most memorable problem you encountered with Redis?

**2) A candidate claims to know HTTP well and to have written web crawlers.**

1. Name some HTTP headers you know and explain what they are used for.
2. If the frontend reports a successful request but the backend receives no data, how would you investigate?
3. Describe the basic structure of an HTTP message.
4. If the server returns a cookie, which response header carries it?
5. What does `Transfer-Encoding: chunked` mean?
6. Do you know how partial or segmented loading works? Describe the process.

The level of depth expected depends on the technology.

The general idea is simple: if someone says they have slaughtered pigs, ask how many, when, how large they were, and what colors they were. They might answer that they slaughtered more than ten, including 50-kilogram pigs in green, yellow, red, and blue. That answer raises questions.

I have met candidates who had used Git for two years but did not know GitHub; used Redis for a year but did not know its data structures or serialization; specialized in web crawling but did not know what `Content-Type` means; used search technology but could not name two analyzers; or implemented database read/write splitting but did not know about replication lag.

To conclude, I do not think candidates should be forbidden from presenting themselves favorably. They should keep their claims within reasonable bounds. This article does not have a perfect ending, but it shares lessons from interviews that did not work out. In the end, I hired some good teammates. I hope other technical interviewers find people who fit their products and teams.

<!-- @include: @article-footer.snippet.md -->
