---
title: 20 Bad Habits of Poor Programmers
description: Twenty habits that undermine programming quality, including inconsistent terminology, poor communication, weak documentation, and risky code changes.
category: Curated Technical Articles
author: Kaito
tag:
  - Career Growth
head:
  - - meta
    - name: keywords
      content: Bad Programming Habits,Coding Standards,Code Comments,Technical Documentation,Teamwork,Code Commits,Professionalism,Engineering Craft
---

> **Editor's note:** A practical article from Kaito with useful advice.
>
> **Original article:** <https://mp.weixin.qq.com/s/6hUU6SZsxGPWAIIByq93Rw>

You have probably met programmers who seem highly professional whether they are writing code, documenting it, or communicating with others. Whenever I meet someone like this, I wonder how they do it.

Over time, I have noticed that they share small but valuable habits. These habits reflect the basic professionalism of a good programmer.

Today, let's look at the other side: what bad habits should programmers avoid? By avoiding them, we can move closer to becoming better engineers.

## 1. Inconsistent Spelling of Technical Terms

I often see technical terms spelled incorrectly in resumes and technical documents, such as JAVA, javascript, python, MySql, Hbase, and restful.

The correct forms are Java, JavaScript, Python, MySQL, HBase, and RESTful. Do not dismiss this as a minor detail; an interviewer may reject a resume because of it.

## 2. Poor Typography in Mixed Chinese and English Text

Common problems include using English punctuation in Chinese text, using full-width characters for English and numbers, and omitting spaces between Chinese and English text or numbers.

Many people overlook the spaces between Chinese and English text or numbers. Adding them makes the text easier to read. I have tried to follow these details in my own articles.

## 3. Omitting Comments for Important Logic—or Writing Long-Winded Ones

Many programmers leave complex, important logic unexplained. They may understand it themselves, but other people cannot. Others add comments that are long and disorganized.

Important logic should have comments that are concise and clear. Simple code that is immediately understandable may not need comments.

## 4. Writing Long, Complicated Functions

A function may run for hundreds of lines, or a file may contain thousands. When complex functions are not broken down, the code becomes harder to maintain until no one dares to change it.

Follow basic design principles, such as the Single Responsibility Principle: a function should do one thing. Follow the Open/Closed Principle as well: code should be open for extension but closed for modification.

If the logic is genuinely complex, at least make the main flow easy to follow.

## 5. Ignoring Official Documentation and Relying on Low-Quality Blogs

When they encounter a problem, many people do not consult the official documentation first. Instead, they turn to low-quality blogs whose content is copied from one another and riddled with errors.

Many software projects already have excellent documentation that answers common questions. Read it carefully; it is far more useful than low-quality blog posts. Make reading official documentation a habit.

## 6. Claiming Fundamentals Do Not Matter

Some people chase new open-source projects and frameworks but will not spend time learning how things work underneath. They can solve familiar problems, but are helpless when they encounter a deeper one.

Many sophisticated architectural ideas come from fundamentals. Consider how computer architecture, operating systems, and network protocols evolved over many years to address complex problems. Understand the reasoning behind those solutions, and higher-level technologies become easier to grasp.

## 7. Showing Off Technical Jargon

Some people constantly use impressive-sounding technical terms so everyone knows what they have studied. But when asked for details, they cannot explain them.

## 8. Rejecting Questions and Feedback

When someone questions their design, they snap back instead of calmly discussing its trade-offs and treating the conversation as a chance to learn.

They learn a little and think they know a lot, without realizing how little they have seen.

## 9. Leaving API Contracts Unclear

They agree on API details verbally without writing proper documentation. During integration testing, they discover that the implementation does not match what was agreed on—or someone changes the contract without notifying the other team. This makes collaboration frustrating.

## 10. Struggling with a Problem Alone for Too Long

This is common among junior programmers. They keep struggling alone, miss a deadline without producing anything, and only tell their manager they are stuck when asked for an update.

Reporting a problem promptly is part of taking responsibility for yourself and your team.

## 11. Talking Well but Failing to Implement

They describe impressive technical plans, but cannot turn them into working code. They have ideas beyond their practical abilities.

## 12. Communicating Without Structure or Considering the Audience

They discuss a problem without explaining the background and jump straight to their proposed solution, leaving others confused. When asked to start from the beginning, they still cannot explain it clearly.

Good communication is the foundation of collaboration.

## 13. Failing to Think Before Asking for Help

They do not search online or think through a problem before asking someone else. Instead, they expect others to do the work for them.

Everyone's time is valuable. People prefer questions that show some prior thought. This avoids basic questions and makes the discussion more productive.

## 14. Repeating the Same Mistakes

They say they will be more careful next time, but keep making the same mistakes. This shows a lack of responsibility.

## 15. Adding Features Without Considering Extensibility

They focus only on the immediate feature and ignore how it fits into the larger system, piling up code as a result.

Analyze the requirements and possible future changes. Design a more general solution when appropriate to reduce the cost of later development.

## 16. Skipping API Self-Testing and Failing to Add Logs

They hand an API over for integration without testing it themselves. When a problem appears, they say there are no logs to investigate. This makes collaboration inefficient.

## 17. Writing Uninformative Commit Messages

Many people commit code with no description or a meaningless one. This is especially costly when only a small amount of code changes, because it makes the change harder to trace later.

Adopt commit-message conventions so that each commit clearly explains what changed instead of documenting careless edits.

## 18. Editing the Production Database by Hand

They connect directly to the production database to change data. Sometimes they even run an `UPDATE` or `DELETE` statement without a `WHERE` clause, causing a data incident.

Be extremely cautious when changing production data. Have a colleague review the command before running it.

## 19. Coding Before Clarifying the Requirements

They start coding as soon as a request arrives, without thinking it through. Their understanding differs from the actual requirements, leading to wasted rework.

Spend more time clarifying requirements to avoid unnecessary problems.

## 20. Not Documenting Important Designs

They leave important designs undocumented and explain a system verbally during handoffs, losing key information.

For understanding a design, a good document can sometimes be more effective than reading hundreds of lines of code.

## Summary

How many of these habits have you seen in yourself or people around you?

Avoiding them early is part of becoming a good programmer. They fall into four broad areas:

- Strong engineering practices
- A humble attitude toward learning
- Clear communication
- Effective teamwork

It may take a long time to develop strong technical skills, but these basic professional habits can be built much sooner.

Let's correct the habits we recognize and keep improving where we can.

<!-- @include: @article-footer.snippet.md -->
