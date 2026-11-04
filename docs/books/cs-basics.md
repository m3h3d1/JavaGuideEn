---
title: Recommended Books for Computer Science Fundamentals
description: Recommended resources for operating systems, computer networks, algorithms, data structures, mathematics, and compiler design.
category: Computer Science Books
icon: "mdi:desktop-classic"
head:
  - - meta
    - name: keywords
      content: computer science books
---

Many students prefer video courses, so this guide also includes video lectures and projects from universities.

## Operating Systems

**Why study operating systems?**

Operating systems introduce ideas and classic algorithms that also appear in everyday tools and frameworks. For example, an application's cache, such as Redis, has similarities to an operating-system cache. CPU caches address the speed gap between processors and memory. Memory can also be viewed as a cache for secondary storage: programs copy data from storage into faster memory while running. Similarly, Redis helps bridge the performance gap between an application and a conventional relational database.

Caches often rely on locality of reference—the 80/20 principle—and an eviction policy to retain data that is accessed frequently. Redis caches are often designed around the same principle, and many eviction policies resemble those used by operating systems. The hit ratio is another concept shared by caches: it measures how often requested data is found in the cache. A high hit ratio often indicates a reasonable cache design and faster processing.

Operating systems also come up frequently in interviews, especially for new-graduate roles.

In short, studying operating systems can deepen your technical understanding and is useful for interviews.

For a systematic introduction, start with **[Operating Systems: Three Easy Pieces](https://book.douban.com/subject/33463930/)**. Pair it with **[Computer Systems: A Programmer's Perspective](https://book.douban.com/subject/1230413/)** to learn more about how computer systems work.

![](https://oss.javaguide.cn/github/javaguide/booksimage-20201012191645919.png)

Another good option is the Chinese-authored **[Modern Operating Systems: Principles and Practice](https://book.douban.com/subject/35208251/)**, written by Professor Xia, Professor Chen, and their team.

![](https://oss.javaguide.cn/github/javaguide/books/20210406132050845.png)

If you prefer hands-on work to theory, try **[30 Days to Build Your Own OS](https://book.douban.com/subject/11530329/)**. It guides you through writing an operating system.

Theory alone is not enough; put what you learn into practice. CS students should make time for projects.

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409123802972.png)

Other recommendations:

- **[Write Your Own Operating System](https://book.douban.com/subject/1422377/)**: Explains operating-system fundamentals and uses code examples to guide you through building a basic OS in C and assembly.
- **[Modern Operating Systems](https://book.douban.com/subject/3852290/)**: Covers the subject well, though the translation is uneven. If you read it closely, work through the exercises too.
- **[Understanding the OS from Scratch](https://book.douban.com/subject/26745156/)**: The author, a Peking University graduate and former senior operations engineer at Baidu, studied operating systems in depth after retaking the course at university.
- **[Deep Exploration of the Linux Operating System](https://book.douban.com/subject/25743846/)**: Provides a clear guide to building a complete GNU/Linux system.
- **[Operating System Design and Implementation](https://book.douban.com/subject/2044818/)**: An authoritative textbook.
- **[Orange'S: An Operating System Implementation](https://book.douban.com/subject/3735649/)**: Starts with a 20-line boot-sector program and gradually builds an OS framework. It pairs well with _Operating System Design and Implementation_.

If you prefer video courses, I recommend Professor Zhijun Li's operating systems course from Harbin Institute of Technology. It is an excellent course.

![Course outline](https://oss.javaguide.cn/github/javaguide/books/image-20220414144527747.png)

The course covers six basic OS areas: CPU management, memory management, peripheral devices, disks and file systems, user interfaces, and booting.

The course is challenging, especially the labs. If you want to understand OS internals, complete as many labs as you can. As Professor Li says, “Theory learned from books is shallow; practice is essential.”

![](https://oss.javaguide.cn/github/javaguide/books/image-20220414145210679.png)

Completing several labs independently can significantly improve your understanding of operating systems. If you are studying only for interviews, however, you can skip them.

I particularly enjoy Professor Li's lectures. He understands the gaps between Chinese and international courses and students, and works to help close them. I look forward to his next course.

![](https://oss.javaguide.cn/github/javaguide/books/image-20220414145249714.png)

The international course [Computer Systems: A Programmer's Perspective](https://www.bilibili.com/video/av31289365?from=search&seid=16298868573410423104) is also worth watching.

![](https://oss.javaguide.cn/github/javaguide/booksimage-20201204140653318.png)

## Computer Networks

Computer networks is a broad subject, and university courses in this area are generally well developed.

To study networking, first understand the OSI seven-layer model or the TCP/IP five-layer model: the application layer (application, presentation, and session layers in OSI), transport layer, network layer, data link layer, and physical layer.

![OSI seven-layer model](https://oss.javaguide.cn/github/javaguide/booksosi%E4%B8%83%E5%B1%82%E6%A8%A1%E5%9E%8B2.png)

For a textbook, I strongly recommend **_Computer Networking: A Top-Down Approach_**, published by Machinery Industry Press. It follows the TCP/IP five-layer model and discusses the technologies at each layer in detail. Its table of contents closely matches the syllabus of many university networking courses.

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409123250570.png)

If that textbook feels dry, these two illustrated books are engaging alternatives:

- [Illustrated HTTP](https://book.douban.com/subject/25863515/ "Illustrated HTTP"): Explains HTTP in a comic-book style. It covers common HTTP concepts, though not in full depth. For developers who are not specializing in networking, it may be enough for learning HTTP.
- [How the Internet Works](https://book.douban.com/subject/26941639/ "How the Internet Works"): Follows a request from entering a URL in a browser to displaying a webpage. Illustrations explain the overall process and how network devices and software work.

![](https://oss.javaguide.cn/github/javaguide/booksimage-20201011215144139.png)

Hands-on practice is important for learning networking, just as it is for programming. GitHub has networking labs and projects from several universities:

- [HIT Computer Networks Lab](https://github.com/rccoder/HIT-Computer-Network)
- [Programming assignments and Wireshark labs for _Computer Networking: A Top-Down Approach_, 6th edition](https://github.com/moranzcw/Computer-Networking-A-Top-Down-Approach-NOTES)
- [Final project for computer networks: a Python chat room](https://github.com/KevinWang15/network-pj-chatroom)
- [CMU computer networks course](https://computer-networks.github.io/sp19/lectures.html)

If you prefer video lectures, here are some networking courses:

**1. [HIT computer networks course](http://www.icourse163.org/course/HIT-154005)**: A highly rated national-level course that has run ten times as of this writing.

![](https://oss.javaguide.cn/github/javaguide/booksimage-20201218141241911.png)

**2. [Wangdao computer networks course for graduate entrance exams](https://www.bilibili.com/video/BV19E411D78Q?from=search&seid=17198507506906312317)**: Particularly useful for CS students preparing for graduate school. It had more than 16,000 likes on Bilibili when this article was written.

![](https://oss.javaguide.cn/github/javaguide/booksimage-20201218141652837.png)

## Algorithms

Here are three good introductory books; any one of them can be a good starting point:

1. [My First Book of Algorithms](https://book.douban.com/subject/30357170/)
2. [Grokking Algorithms](https://book.douban.com/subject/26979890/)
3. [Aha! Algorithms](https://book.douban.com/subject/25894685/)

![](https://oss.javaguide.cn/java-guide-blog/image-20210327104418851.png)

I prefer **[My First Book of Algorithms](https://book.douban.com/subject/30357170/)**. It has a slightly lower Douban rating than the other two, but I think its illustrations and explanations are the best. Its main drawback is the lack of code examples. The goal of these introductory books is not to make you an expert programmer; they are meant to open the door to learning algorithms.

For a more comprehensive introduction, see **[Algorithms](https://book.douban.com/subject/19952400/)**.

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409123422140.png)

This clear and accessible book introduces common data structures and algorithms. A professor strongly recommended it to me in my second year of college. I bought a copy and read more than half before graduating; it is a substantial book. It includes detailed Java examples, making it useful for Java developers.

> **The following books are classics, but they are also challenging.**
>
> **If you are preparing only for algorithm interviews, I do not recommend starting with them.**

**[Programming Pearls](https://book.douban.com/subject/3227098/)**

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409145334093.png)

This classic is recommended by leading algorithmists, including ACM champions and runners-up. The author taught James Gosling, creator of Java.

Many readers say the book teaches a way to think about programming rather than specific algorithms. That way of thinking is useful beyond programming as well.

**[The Algorithm Design Manual](https://book.douban.com/subject/4048566/)**

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409145411049.png)

This book is strongly recommended by the popular GitHub self-study curriculum [Teach Yourself Computer Science](https://link.zhihu.com/?target=https%3A//teachyourselfcs.com/).

Other classics include [Introduction to Algorithms](https://book.douban.com/subject/20432061/) and [The Art of Computer Programming, Volume 1](https://book.douban.com/subject/1130500/).

**If you are preparing for interviews, these books may help:**

**[Coding Interviews: Questions, Analysis and Solutions](https://book.douban.com/subject/6966465/)**

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409145506482.png)

This interview guide covers many classic algorithm questions. It is worth considering when preparing for interviews at large technology companies.

The companion open-source explanations for its programming problems are available in [CodingInterviews](https://link.zhihu.com/?target=https%3A//github.com/gatieme/CodingInterviews).

**[Coding Interview Guide, 2nd Edition](https://book.douban.com/subject/30422021/)**

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409145622758.png)

Most problems in the second edition are harder and cover more topics than those in _Coding Interviews_. It contains nearly 300 classic programming interview problems that have appeared in real interviews.

For a video course, I recommend Peking University's national-level course **[Programming and Algorithms II: Algorithm Fundamentals](https://www.icourse163.org/course/PKU-1001894005)**.

![](https://oss.javaguide.cn/github/javaguide/books/22ce4a17dc0c40f6a3e0d58002261b7a.png)

The course covers seven fundamental algorithmic approaches: enumeration, binary search, recursion, divide and conquer, dynamic programming, search, and greedy algorithms. These ideas can help solve many complex problems. Some exercises are comparable to intermediate ACM-ICPC problems. Solving them can give you stronger algorithm skills than many CS undergraduates.

## Data Structures

Several books mentioned above, including _Algorithms_ and _Introduction to Algorithms_, also explain common data structures in detail. Here are a few more recommendations.

**[Data Structures: An Easy Introduction](https://book.douban.com/subject/6424904/)**

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409145803440.png)

This introductory book is accessible and suitable if you are new to data structures or want to review the basics.

**[Data Structures and Algorithm Analysis in Java](https://book.douban.com/subject/3351237/)**

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409145823973.png)

This is a high-quality introduction to common data structures and algorithms.

Other editions include **[Data Structures and Algorithm Analysis in C](https://book.douban.com/subject/1139426/)** and **[Data Structures and Algorithm Analysis in C++](https://book.douban.com/subject/1971825/)**.

![](https://oss.javaguide.cn/github/javaguide/books/d9c450ccc5224a5fba77f4fa937f7b9c.png)

For video lectures, see Zhejiang University's national-level [Data Structures course](https://www.icourse163.org/course/ZJU-93001#/info). The instructor explains the material very well, though some of the exercises are challenging.

## Core Courses in Computer Science

Mathematics and English are general courses, usually completed in the first two years of college. Students gradually begin their major courses in the second or third year. General courses help students transition from high school to university, and they also carry many credits. They account for a large part of a student's GPA, affect class ranking in the first two years, and can affect eligibility for recommendation-based graduate admission after the third year. Mathematics and English are also useful for students who plan to pursue master's or doctoral degrees.

### Mathematics

#### Calculus

Calculus, often called advanced mathematics in China, is a difficult subject for many first-year students. University exams may be less demanding than high-school exams, so getting a high grade may not require as much repetitive problem solving. For CS students, calculus is used in transformations in computer graphics, gradient-based methods in machine learning, signal processing, and other fields.

Calculus covers differentiation and integration, usually in that order. Some universities split the course across two semesters. Differentiation extends the derivatives studied in high school and is often easier to grasp at first. Integration is the inverse operation and may take more time to understand.

All universities offer calculus, and many provide online courses and well-developed textbooks. Studying both together is a reliable way to keep up.

I recommend _The Princeton Calculus Reader_ as a calculus text.

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409155056751.png)

#### Linear Algebra

Linear algebra introduces a new mathematical framework, with unfamiliar notation and theorems. Geometric intuition can help make it easier to understand. Linear algebra and geometry are closely connected; for example, linear algebra provides the basis for transformations in space. Many online resources use visualization to explain the concepts and help learners remember the formulas.

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409153940473.png)

I recommend Professor Shangzhi Li's **[Linear Algebra: A Study Guide](https://book.douban.com/subject/26390093/)**.

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409155325251.png)

#### Probability and Statistics

For CS students, probability theory may be more useful than mathematical statistics. Some universities teach only probability theory; others cover statistics briefly. The learning path is similar to calculus: study formulas and apply them to examples. It is less abstract than linear algebra and often more connected to everyday situations.

Probability and mathematical statistics are important prerequisites for data analysis, and probability is also fundamental to machine learning.

I recommend **[A Course in Probability and Statistics](https://book.douban.com/subject/34897672/)**. Its eight chapters are divided evenly: the first four cover probability distributions and their properties, and the last four cover parameter estimation and hypothesis testing.

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409155738505.png)

#### Discrete Mathematics

Discrete mathematics includes set theory, graph theory, and abstract algebra. It is closely tied to computer science, though its applications may be less visible for undergraduates entering the workforce. It is particularly useful in graph-related fields and is theory-heavy, so students planning graduate study should build a solid foundation.

### English

English is a flexible skill in college. Strong English can support professional growth, though it may not be central to everyone's plans. The notes below are aimed at CS students.

Most undergraduate English courses last only the first two years. Do not rely on the classes alone to improve your English; progress depends on regular practice, review, and focused exercises.

**Pass the College English Test Band 4 and Band 6 (CET-4 and CET-6).** Many employers consider these scores, and passing CET-4 is a baseline expectation. CET-4 is somewhat harder than high-school English. Many students find CET-6 more challenging, so prepare specifically for it. College offers limited English practice, and students with a weaker high-school foundation may need extra preparation. Review past exam papers and high-frequency vocabulary. A score of 425 is a pass; 500 is a good result, and 600 is an excellent result that can strengthen a resume.

IELTS and TOEFL are mainly necessary if you plan to study abroad or apply for a job with specific English requirements. They are difficult to pass without preparation, so a reputable prep course may help.

For CS students, English matters even when employers do not require IELTS or TOEFL. You should be able to:

- **Use software and systems with English interfaces.**
- **Read technical blogs and bug fixes in English.**
- **Read academic papers in English.**
- **Write basic technical papers in English.**

Programming languages use written characters. Reading and writing in English are practical skills for the field.

### Compiler Design

Compiler design is generally less central than the subjects above. It is especially useful for:

- Developing low-level languages, engines, or high-level languages such as MySQL and Java.
- Developing operating systems or embedded systems.
- Applying concepts from lexical, syntactic, and semantic analysis and automata theory.

Formal languages and automata theory are important prerequisites. Automata are widely used in lexical analysis, and studying them helps explain where automata algorithms are useful.

Compiler design may be less directly relevant to many careers, but studying it can strengthen your programming concepts. In addition to course slides, use a compiler textbook as a reference when you need help understanding a topic. The well-known “Dragon Book” is challenging to read from cover to cover.

![](https://oss.javaguide.cn/github/javaguide/books/20210406152148373.png)

Other recommendations:

- **[Modern Compiler Implementation](https://book.douban.com/subject/30191414/)**: An introduction to compiler design.
- **[Compiler Design](https://book.douban.com/subject/20436488/)**: Covers the compiler pipeline from front end to back end.

These books are challenging to finish. I also recommend Harbin Institute of Technology's [compiler design video course](https://www.icourse163.org/course/HIT-1002123007), a national-level course taught by an engaging instructor.

![](https://oss.javaguide.cn/github/javaguide/books/20210406152847824.png)
