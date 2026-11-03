---
title: "Preparing for Technical Interviews: An Interviewer's and Candidate's Perspective"
description: How interviewers can assess technical fundamentals and problem-solving, and how candidates can prepare for technical interviews.
category: Selected Technical Articles
author: Qin Shuiyu
tag:
  - Interviews
head:
  - - meta
    - name: keywords
      content: Technical Interview Preparation,Interviewer Perspective,Candidate Perspective,Technical Fundamentals,Business Assessment,Interview Skills,Technical Depth and Breadth,Interview Methods
---

> **Editor's note**: An excellent discussion of technical interviews from the perspectives of both interviewers and candidates.
>
> **Key points**:
>
> - Assess technical fundamentals to understand a candidate's actual technical ability, including depth and breadth.
> - Connect practice with theory. After a candidate explains the JVM memory layout, ask what can cause an `OutOfMemoryError`, how to prevent it, and whether they have encountered and diagnosed memory leaks.
> - Discuss no more than two projects in depth, since a thorough review takes time. Ask the candidate to choose a project they found valuable, challenging, memorable, or interesting. Then ask about its background, technology stack, modules and interactions, difficult technical problems and solutions, debugging, maintainability, and engineering quality.
> - Ask more and talk less. Give candidates room to demonstrate their skills, and guide the discussion based on their answers.
>
> **Original article**: <https://www.cnblogs.com/lovesqcc/p/15169365.html>

## Assessment Goals and Approach

First, clarify the goals of an initial technical interview:

- Assess the candidate's technical fundamentals.
- Assess how the candidate approaches and solves problems.

Technical fundamentals are the foundation—the part below the waterline—and account for about 70% of the assessment. Problem-solving is the visible result above the waterline and accounts for about 30%. Business experience and technical fundamentals are also assessed in roughly a 30/70 split.

## Assessing Technical Fundamentals

### Why Assess Technical Fundamentals?

The two most important technical thinking skills for a programmer are logical reasoning and abstraction and design. Logical reasoning is foundational; abstraction and design are more advanced. Assessing technical fundamentals can reveal both. Understanding core concepts and their relationships tests logical reasoning. Abstracting business problems into technical problems and mapping them appropriately tests design and abstraction.

Most business problems can be expressed as technical problems. In a sense, a business problem is a technical problem described in a particular domain.

Therefore, **assessing technical fundamentals is how you evaluate a candidate's actual technical ability: their depth and breadth.**

### How to Assess Technical Fundamentals

Use effective questions from multiple angles.

#### Ask “What?” and “Why?”

“What” questions check basic understanding of a concept; “why” questions probe how it works.

For example: What is an index? How is an index implemented?

#### Guide, Broaden, and Probe Deeper

Start with a question such as, “Are you familiar with Java synchronization utilities?” If the candidate says yes, ask which utilities they know to assess breadth.

Based on the answer, ask a deeper question, such as, “Can you explain how `ConcurrentHashMap` or `AQS` works?”

How clearly someone can explain a technical principle—including the reasoning and details—reveals how well they understand it.

#### Ask Connected or Cross-Domain Questions

For example, if the candidate discusses efficient lookup with hashing, ask about consistent hashing. The two concepts are related but have important differences. This can help assess technical breadth.

#### Ask for a Summary

For example: “What lessons from project XXX could you share?” This assesses the candidate's ability to synthesize experience.

#### Connect Practice and Theory

After a candidate explains the JVM memory layout, ask what can cause an `OutOfMemoryError`, what preventive measures are available, and whether they have encountered a memory leak. How would they diagnose and fix it?

If the candidate mentions SQL or index optimization, ask how indexes are implemented and how to choose an effective index.

If they mention transactions, ask how transactions work, what isolation levels exist, and how snapshots are implemented.

#### Ask About Both Familiar and Unfamiliar Areas

Ask about topics the candidate lists as familiar as well as topics not mentioned on their resume. For example, if a resume says the candidate knows the JVM memory model, ask about memory management and also Java concurrency utilities, whose familiarity is less clear.

#### Ask About Both Facts and Application

For example: Which search algorithms do you know? Candidates will often list linear search, binary search, and hash-based lookup. These are facts they may have memorized.

Then ask when each is appropriate and where they have used one at work, and why. These questions explore how they apply their knowledge.

#### Draw on Learning and Work Experience

Questions can come from problems encountered while studying or working.

For example, a recent chapter in _Operating Systems: Three Easy Pieces_ discussed making data structures thread-safe. This could prompt questions such as: How would you implement a lock, a thread-safe counter, a thread-safe linked list, or a thread-safe `Map`? How would you improve concurrency performance?

Problems encountered at work can also be distilled into technical fundamentals questions.

#### Assess Fit with the Technology Stack

If a candidate's experience matches the company's technology stack, ask deeper questions to understand how well they know those technologies. Strong knowledge can indicate a closer technical fit.

However, this should not be used to reject candidates who have not used the exact same stack. For example, a company may use `MongoDB` and `MySQL`, while a candidate has used `MySQL`, `Redis`, Elasticsearch, and `HBase,` but not MongoDB. Their broader experience may indicate that they can learn MongoDB well.

#### Build a Distinctive Interview Question Bank

Every technical interviewer should build a question bank over time. When a useful question comes to mind, record it.

## Assessing Business Experience

### Why Assess Business Experience?

Focusing only on technical fundamentals can miss non-technical qualities, such as communication, coordination, project leadership, resilience under pressure, practical problem-solving, influence on a team, and other personality traits.

### Why Not Assess Business Experience Alone?

Candidates may know their business domain well and simply describe the existing solution. This may not reveal their depth of understanding, ability to make connections, or ability to synthesize lessons.

Ask targeted questions about how they synthesize experience. For example: “While building, developing, or maintaining microservices—or improving system stability and performance—what lessons did you learn that you could share?”

## Assessing Problem-Solving Ability

Technical fundamentals alone are not enough. It is useful to connect questions to the candidate's actual projects and translate their business problems into technical ones.

Problem-solving questions should progress in stages. This requires the interviewer to listen carefully and draw on technical depth and business experience. Listen to the candidate's explanation, find an appropriate technical angle, and ask a follow-up. If you cannot get into the problem, the assessment is likely to fail.

### Design Questions

- Suppose multiple machines share many business objects, and some fields overlap. How would you avoid storing duplicate data?
- How would you keep a server stable when a large number of requests arrive at once?

### Project Experience

Discuss no more than two projects in depth, since a thorough review takes considerable time.

Usually, ask the candidate to choose a project they found valuable, challenging, memorable, or interesting, then discuss it. Start with the background and ask about the technology stack, the overall design of its modules and interactions, difficult technical problems and their solutions, debugging, maintainability, and engineering quality.

## How Can Interviewers Run a Good Interview?

### Prepare in Advance

Interviewers should prepare by reviewing the candidate's strengths, experience, and other relevant details, then planning the interview.

Before the interview starts, learn about the company, especially its technology stack, business areas and direction, day-to-day work, and promotion system. Technical candidates often ask about these topics.

### Start the Interview

Interviews often begin with the candidate's introduction. Candidates may speak broadly, so I ask directly: “What are your strengths, and what would you like to improve?”

Then I start with a relatively simple technical question: “Which search algorithms are you familiar with?” Most people can name linear search, binary search, and hash-based lookup.

### Design Questions

Read the candidate's resume in advance, identify keywords, and design questions around them.

For example, if the resume mentions `MVVM`, ask how it differs from `MVC`. If it mentions the Observer pattern, ask about that pattern and which other design patterns the candidate knows.

### Keep the Atmosphere Relaxed

Even if the questions are difficult or numerous, try to keep the atmosphere relaxed.

Before an interview, you can make a lighthearted remark based on the candidate's background. For example, if a candidate's name is Wang Kui, I might say, “We had someone named Yuan Kui on our team, and we called him Master Kui.”

During the interview, occasional hints or sharing a small amount of your own perspective can also ease the candidate's nerves.

### Listen Carefully

Ask more and talk less. Let candidates show what they know, and guide or deepen the discussion based on their answers.

Help candidates demonstrate their strengths and feel at ease. Both sides have invested time and effort; an interview should be a good exchange, not an opportunity for the interviewer to disparage the candidate. You may learn a lot from them, too.

The interviewer and candidate have different roles and positions, but that does not mean the interviewer's skills are necessarily better.

### Record Key Points

Record the candidate's answers carefully and objectively. Avoid subjective judgments and do not embellish the notes. For example, do not summarize the candidate's answer yourself; the ability to summarize is also a candidate quality to assess.

## Making a Decision

The interview process gathers evidence; making a decision is what matters.

A common mistake is to expect too much breadth and depth at once. We may want a candidate to know everything deeply and comprehensively, but that is unrealistic. Candidates with both exceptional depth and breadth may have better offers, or may have weaknesses in other areas, such as teamwork.

A reasonable evaluation asks:

1. Can the candidate's technical level meet the needs of the current role?
2. How does their technical level compare with the rest of the team?
3. Is their technical level appropriate for their years of experience, and do they have the potential to take on more complex work?

**What matters changes with experience.**

For engineers with fewer than three years of experience, technical fundamentals deserve more weight because they indicate future potential. Also assess how the candidate applies them in development, including teamwork, business experience, resilience under pressure, and willingness and ability to learn.

For engineers with more than three years of experience, focus more on business experience and problem-solving. Examine how they analyze concrete problems, and assess the depth and breadth of their technical knowledge within that business domain.

I am still learning how to assess a candidate's actual technical level and fit for a role.

## Advice for Candidates

### Focus on Technical Fundamentals

A common question is: Most business application development does not involve designing and implementing data structures and algorithms. Why ask how `HashMap` works? Why study data structures and algorithms, operating systems, and network communications?

Here is my answer:

- As noted above, most business problems ultimately map to fundamental technical problems: implementing data structures and algorithms, managing memory, controlling concurrency, and communicating over networks. These are essential to understanding large-scale internet systems and solving difficult problems—unless you can guarantee that you will never face a difficult problem and will always be content writing CRUD code.
- These fundamentals are among the most interesting and exciting parts of software. If you have no interest in them, it may be difficult to go deep in this field. Consider another career; the non-technical world is broad and interesting. (Sometimes I also want to travel more and spend less time in the technical world.)
- Technical fundamentals are a programmer's internal strength; specific technologies are the techniques. Techniques without a strong foundation can fail when faced with an expert colleague or a difficult problem.
- A solid technical foundation raises your potential. It helps you solve complex problems and find better solutions to familiar ones.
- People like working with others like themselves, and strong professionals often work well together. If most of a team has strong fundamentals, a colleague with weaker fundamentals can increase coordination costs. If you want to work with strong colleagues and get better results, build a foundation that lets you contribute alongside them.
- Developing other strengths beyond CRUD can also be a good choice. But it may lead to roles such as product manager, project manager, HR professional, operations specialist, or customer support—rather than a career as a programmer. That is a career choice beyond the scope of assessing programmers.

### Do Not Worry About Missing a Question

If the interviewer asks many questions and you cannot answer some of them, do not worry. They may be testing the depth and breadth of your technical knowledge to see whether you meet a certain bar.

What matters is that you can answer some questions in depth and demonstrate careful thought.

I realized this after becoming a technical interviewer. Not every interviewer thinks this way, but I believe it is a more useful approach.

<!-- @include: @article-footer.snippet.md -->
