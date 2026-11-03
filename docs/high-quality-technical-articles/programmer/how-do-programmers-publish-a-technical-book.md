---
title: How Programmers Can Publish a Technical Book
description: A practical guide to planning, writing, and publishing a technical book, including working with publishers, structuring chapters, reaching readers, and building a career.
category: Curated Technical Articles
author: hsm_computer
tag:
  - Programmers
head:
  - - meta
    - name: keywords
      content: publishing a book,technical books,publishers,writing tips,royalties,technical writing,bestsellers
---

> **Editor's note:** A detailed introduction to how programmers can write and publish their first book.
>
> **Original article:** <https://www.cnblogs.com/JavaArchitect/p/12195219.html>

When interviewing or pursuing side projects, credible evidence of your skills can give you a big advantage. The strongest endorsement is experience at a major tech company—for example, working as a senior architect at BAT (Baidu, Alibaba, or Tencent). That can speak for itself.

Not everyone becomes an architect at a major company right away. You can also demonstrate your ability through a public account, a technical column, GitHub contributions, books, or videos. A technical book published by a nationally recognized publisher may be more convincing than these other options. At some small companies, having your own book can even help you skip an interview. This article discusses publishing a technical book.

## 1. Don't Wait Until You're an Expert to Write a Book

Many people I know published their first book within three years of starting work. Some talented people published one while still in school.

Others think they should wait until they've accumulated enough technical experience. But you can improve your skills while writing a book, and the book can help readers too.

For example, if you want to learn Python data analysis and machine learning, first study the topics systematically. Then organize what you've learned about web scraping, data analysis, and machine-learning examples, and explain them in your own words for beginners. Experienced readers may not get as much from the book, but examples can be very helpful to beginners. Having the goal of writing a book can also help you study more deeply instead of stopping at a superficial understanding.

## 2. Different Books Suit Different Experience Levels

Beginner developers may want to write a book based on examples. For a book about Python web scraping, data analysis, and machine learning, look at existing books for inspiration. Their chapters may differ, but together they can show you which topics to cover: one chapter on web scraping, another on pandas, another on matplotlib, and so on. Do not copy their content, but you can use their topic selection as a reference.

After choosing the chapters, outline the sections within each one. For example, a chapter on web-scraping projects could include an introduction to web scraping, setting up Scrapy, and building a Scrapy example. Organize the book from chapters to sections. Since it is an example-driven book, provide runnable code first and use it to teach the basics. The examples do not need to be advanced, but beginners should be able to understand them and follow your learning path. After finishing the book and running its examples, readers should understand the topic and be able to do basic work in the field. With some care and time, this is an achievable goal for a junior developer.

Senior developers and architects can write books that go beyond examples by sharing engineering lessons learned at major companies. For instance, a book about Python and matplotlib could explain techniques for configuring chart legends and axes, along with common problems. Including this practical experience increases the book's value.

Experienced developers and architects can also write more advanced books: high-concurrency engineering, using Kubernetes and Docker to handle high traffic, choosing caches, preventing cache penetration and avalanches, investigating Redis production issues, or designing incident-response plans. Another option is to explore implementation details, such as Dubbo internals, and explain effective configuration and troubleshooting. A book like this, combined with experience at a major tech company, can help build your professional reputation.

## 3. Work Directly with a Publisher or Use a Publishing Company

In [Side Projects for Programmers: Books and Video Courses](https://www.cnblogs.com/JavaArchitect/p/11616906.html), I compared working directly with a publisher and working through a book-publishing company. Read it and decide which approach suits you.

Whichever route you choose, clarify the following before signing. Some publishing-company staff may not mention these details unless you ask:

- Who is your partner: a book-publishing company or a publisher?
- Which publisher will publish the book? In China, Tsinghua University Press, Posts and Telecommunications Press, Publishing House of Electronics Industry, and China Machine Press are well known. Other publishers may be good too, but these four are widely recognized in the industry.
- Is the person you're speaking with the editor who makes the final decisions, or a publishing-company employee? The publisher's editor decides whether the book can be published and what revisions are required.

Compare the options and clarify the details before deciding how to proceed. Publishers and publishing companies list their contact details on their websites, so you can also reach out by email.

## 4. Walk Away If You're Being Used for Trial and Error or Treated Disrespectfully

I once saw a publishing company recruiting authors for Java books aimed at beginners. I contacted them and mostly heard: “Rewrite it.”

For example, I sent an outline and was told to rewrite it because the reviewer had never studied Java and, as a complete beginner, couldn't learn from my outline. They couldn't explain what the new outline should look like either. I submitted another version, which was rejected again. This time they gave me outlines from a few similar books and asked me to look for useful ideas. They offered no specific feedback—perhaps they couldn't—and left me to keep trying changes until they were satisfied.

By contrast, when I spoke with professional editors at publishers, they pointed out specific issues and gave actionable feedback, even when they found problems in my outline or manuscript. I don't know how publishing companies are organized, but publishers have dedicated departments and editors for computing books. Their suggestions were professional and practical to apply.

I've also seen publishing-company employees publicly post manuscripts they received and point out their problems for others to learn from. Even if they hide the author's identity, publishing a manuscript without the author's permission is disrespectful to someone who trusted them. They could have contacted the author privately instead of exposing an honest mistake in public.

I never had this experience with publishers. The editors I know treat authors with respect. I've also heard positive accounts from friends who worked with book-publishing companies. Still, if you're writing your first book and someone treats you as a test case or speaks to you disrespectfully, walk away. You may not lose anything; taking your current outline or manuscript to a publisher's editor could even lead to a better deal.

## 5. How to Write a 30-Page Chapter

Once you have a contract with a publisher, you can start writing. A book consists of chapters, so here is one way to plan and write a chapter.

Suppose you are writing a chapter on web scraping, about 30 pages long. First outline the sections and subsections. For example, 3.1 could introduce the web-scraping environment, and 3.1.1 could explain how to install the Python Scrapy package. The chapter might cover setting up the environment, Scrapy's key components, developing a crawler, running it, and saving scraped data to a database.

Then break a section down further. Section 3.5 might cover setting up a database, connecting to it from Scrapy, a complete example, and the steps and expected output.

This gives you a chapter outline. In each section, start with runnable code that demonstrates the idea, then explain the code, its configuration, and issues to watch for. Use tables and diagrams where they help. With this structure, a chapter may take up to three weeks; a fast pace might take a week and a half.

A book may have about 12 chapters. The first can cover setup and basic syntax; later chapters can progress from simple to advanced, with one topic per chapter. For a Python web-scraping book, for example, you could cover syntax, HTTP and scraping fundamentals, scraping, data analysis, visualization, and machine learning.

At a pace of two chapters per month, your first book might take six to eight months. Start by outlining the book's learning path. Then outline each topic and use code with explanations to guide readers from basic to advanced material.

## 6. How to Write a Book That Sells 5,000 Copies

A typical print run is around 2,500 copies, and many books are printed only once. Selling 5,000 copies means a book has done well; selling 10,000 is exceptional. Here are some suggestions for writing a book that sells more than 5,000 copies:

1. **Choose a timely topic.** Full-stack development and machine learning are examples of popular topics. To find out what's popular, look at the keywords used by bestselling books on sites such as JD.com. Talk with your publisher's editors: authors may focus on the technology, while editors also consider the market.
2. **Make it useful as a training textbook.** Training companies tend to choose books aimed at beginners, with complete code and comprehensive topic coverage. Talk with your publisher's editor about what this requires.
3. **Write engagingly, but provide substance.** A bestseller needs practical content that solves beginners' problems. For a Python machine-learning book, for example, cover common algorithms through examples, with visualization, data analysis, and web scraping. Attractive visualizations can make the book more appealing too.
4. **Don't treat the work casually.** Getting the code to run isn't enough; make it clear and concise. Write for readers and make sure they can follow along and learn something. This is hard to achieve, but after writing several books, I believe that at the very least, a book should not mislead its readers.

## 7. A Book Is a Milestone, Not the End

Publishing a book isn't easy. Not everyone is willing to spend every evening and weekend for six to eight months writing. But it isn't impossible either: it takes time to test code, write, and communicate with others.

Book royalties are not particularly high. The monthly income may average around 3,000 yuan, and could be lower when working with a publishing company. Still, a book can demonstrate your skills. Don't stop growing after you publish one; major tech companies are full of talented people, many of whom don't need a book to prove themselves.

How can you get more value from publishing? First, use the book to strengthen your applications to major tech companies; having your own book can help in interviews. Second, use it to launch a column, make videos, or start a public account. A publisher's endorsement can help readers trust your expertise. Third, apply the learning habits and drive you developed while writing to keep exploring more advanced technologies. With strong technical skills, you can earn more at a major company and offer more effective corporate training.

<!-- @include: @article-footer.snippet.md -->
