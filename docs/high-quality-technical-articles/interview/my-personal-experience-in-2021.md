---
title: My Experience Joining Feishu Through Campus Recruiting
description: A personal account of campus recruiting for Feishu, covering interview experiences, internship recruiting, preparation, and practical job-search advice.
category: Selected Technical Articles
author: The Moonlight Is Beautiful
tag:
  - Interviews
head:
  - - meta
    - name: keywords
      content: ByteDance Interviews,Feishu Campus Recruiting,C++ Interviews,Spring Internships,Internships,Interview Tips,Algorithm Practice
---

> **Editor's note**: The author joined Feishu as a developer through campus recruiting. This article shares that experience and lessons learned.
>
> **Original article**: <https://www.ihewro.com/archives/1217/>

## Background

My focus was primarily on C++ backend development.

I joined the Feishu client team at ByteDance through the 2021 spring recruiting season. Before joining ByteDance, I had received an offer from Baidu for its live audio/video team. I had also passed the HR interview for Tencent PCG (Weishi and backend development), but had not yet received a formal offer.

## A Difficult Spring Recruiting Season

### Finding a Spring Internship Was Not Easy

My lab officially closed for the New Year holiday on January 1, but I continued working remotely. The workload did not decrease: day after day, I tested and debugged the streaming conference system we were developing.

On the third-to-last day of January, we held an online year-end review. As a second-year master's student, I was beginning to wrap up my lab work and started preparing for spring recruiting.

I had started preparing sporadically before February, mostly by solving problems on LeetCode. I could only do a few a day, and eventually just kept up the appearance of practice by completing the daily problem. This did little to improve my algorithm skills.

In early February, I had solved only about 40 LeetCode problems. I then spent several weeks updating version 8.x of the Handsome theme, which kept me busy until its release on Lunar New Year's Day. After the holiday, I continued fixing bugs and releasing patches. February slipped by.

### Applying for Internships

**Early March 2021**

I applied to Alibaba's early recruiting round. I did not realize it would end on March 4, and the phone screen scheduled for that day was canceled. Soon after, during a lab meeting to share progress, I realized that everyone else had already reached the first, second, or third interview round, while I had not even started applying.

**March 8, 2021**

I applied to ByteDance's Feishu team.

**Early April 2021**

I had my first interviews with ByteDance and Tencent.

**Mid-April 2021**

I had the first and second rounds with Meituan, the second first-round and second-round interviews with Tencent, and three rounds with Baidu, which I passed.

**Late April 2021**

I had the third first-round interview with Tencent and the second first-round interview with ByteDance.

**Early May 2021**

I had the third second-round interview with Tencent and the second second-round interview with ByteDance. I passed both.

#### Alibaba

I first applied to DingTalk but was rejected during resume screening because I did poorly on the aptitude test.

The second time, I applied to Alibaba Mama for a backend role. I thought the first phone interview went well and solved the coding problem. At the end, I asked the interviewer for feedback. They said I would be better off applying for Java roles at Alibaba. After the call, I was rejected.

That really discouraged me. The interview had been at 7:30 p.m., and I had spent the evening studying without even eating.

That was the end of my spring recruiting attempt with Alibaba.

#### Meituan

The interviewer in my first Meituan round was very kind, and the conversation was relaxed. The role was in Java, so they did not ask C++ questions. We discussed fundamentals for a while, then spent half an hour on non-technical questions: which programmers online I liked, how to write clean code, and which technical books I recommended. I mentioned Wang Yin as a programmer I admired. The interviewer smiled and said they liked him, too. It was a comfortable interview.

The second round focused almost entirely on one project from my resume and lasted about 90 minutes. I felt from the start that the interviewer was not very interested in hiring me. I suspect my C++ background and the cost of switching to Java were factors. HR later told me the result was pending; a few days later I was rejected.

#### Baidu

Baidu held all three interview rounds in one afternoon. It was intense. The first round covered basic C++ questions and a coding problem. I explained my approach but was not asked to run the code (and it might not have run correctly anyway :)).

The second round also covered fundamentals. I was asked to merge two sorted arrays and then implement merge sort. My merge sort was incorrect, so the interviewer gave me another problem: breadth-first search on a tree. At the end, the interviewer asked how I thought the interview went. I said that although one solution was wrong, my approach was correct and I might have made a small implementation mistake; overall, I thought it had gone reasonably well. I passed the second round.

The third round had fewer technical questions and lasted about 30 minutes. I was asked about my background and some fundamentals, and then asked what the team worked on. The interviewer said HR would contact me with more information.

#### ByteDance Feishu

I failed the first-round interview, probably because my coding test answers were wrong.

The second first-round interview, in late April, went smoothly. After the second round, which was after Labor Day, the interviewer asked a senior student in my lab to tell me to review smart pointers. In the interview, I was asked to implement `shared_ptr` by hand. I had read about its implementation but had never written one myself, so my code missed some important cases. The team lead repeatedly pointed out how I could improve it.

I thought I had failed. By mid-May, I was preparing to join Baidu, when ByteDance told me that I had passed. I decided to join Feishu.

#### Lessons Learned

What stood out to me was how much the coding questions mattered. I was not particularly strong in fundamentals, and if I also failed to solve the one or two algorithm problems, the interview was usually over. The written test before the interviews seemed less important and was not as difficult. Solving one or two of four problems was generally enough to get an interview. The problems were mostly comparable to those in LeetCode Top 100.

I get nervous when solving problems in interviews, and my mind can go blank. A small mistake, such as a wrong symbol or an incorrect linked-list assignment, can be hard to find and can make the final answer wrong.

## Starting an Internship at ByteDance

Before joining ByteDance, I thought Feishu would be the best fit because I worked mostly in C++ and assumed Feishu used C++ extensively. After joining, I realized I might not enjoy client-side development; it seemed complicated. Maybe server-side work would suit me better, but I still was not sure.

ByteDance's internship benefits seemed among the best of these companies. The desk was a little narrow, and the work intensity seemed higher than at other internet companies. The cafeteria food was free and quite good. ByteDance has many office buildings, and mine was relatively small.

For now, I needed to relax and gradually read the codebase. My mentor told me not to rush, and to ask questions instead of getting stuck and wasting time. After receiving a return offer, I still wanted to try applying to foreign or state-owned companies during fall recruiting. I was finding it difficult to adapt to such a demanding job.

I hoped to share more about the experience later, once I had adjusted to the work.

## Job Search Advice

### A Few Terms

#### How Do Regular Internships Differ from Formal Summer Internships?

- **A regular internship may be available year-round when a team has an ongoing need for interns.** Any current student can apply. Formal summer internships have a more fixed start period, usually from March to June.
- Regular internships may be easier to get, but some do not offer a path to full-time conversion. Check this in advance.
- **At ByteDance, regular and formal interns follow the same process for full-time conversion.**

#### When Can You Start After Receiving a Summer Internship Offer?

After receiving a summer internship offer, you can **start right away** (the process usually takes about a week) or **start later**. You can often choose a start date in the company's system or discuss it with HR.

#### How Do Early and Regular Recruiting Rounds Differ?

For internships:

- Early recruiting comes before the regular round. It often hires directly through the team, **outside the main recruiting system**, with **no written test** and a **faster process**. Passing the first round may lead to a second round soon after.
- Regular-round interviews receive written evaluations. A failed interview can affect how a later application is evaluated, so apply thoughtfully.

#### How Does an Internship Offer Differ from a Full-Time Offer?

An internship offer gives you the opportunity to intern. If you perform well, you may be converted to a full-time employee and receive a full-time offer.

Signing a full-time offer does not mean you have to start work immediately. As a campus hire, you can continue interning at a percentage of the full-time salary, or take time off and begin full-time after graduation.

### Recruiting Timeline

> Prepare your resume early, ideally now. You still remember your lab projects well, so writing about them is easier. It can become much harder a few months later.

The previous year's timeline was roughly:

- Alibaba's early recruiting opened in mid-February; it was one of the few companies to open that early. Its early round ended on March 8. Tencent's early round began in March and ended on April 15.
- Internship offers arrived from March to May. Ideally, secure your preferred offer by April.
- Internships ran from April to August. Fall recruiting's early round began in early July, followed by the regular round in late July or early August. Recruiting slowed down by late September, but opportunities remained.
- Fall recruiting mostly ended by late October, followed by additional hiring to fill remaining positions.

---

- **Finding an internship**: I recommend asking people you know for referrals. A referral can help you check application progress and may connect you directly with a team, helping you avoid teams that are a poor fit. You can also learn what the team does in advance.
- **Internships matter**: It is easier to prepare for fall recruiting if you have already found a company you want to join. Converting an internship to a full-time role is often straightforward, and converted offers may be better than those from regular fall recruiting (though strong fall interviews can also lead to good offers). Many people around me received their full-time offers through internship conversion.
- **Manage your internship schedule**: Preparing for fall recruiting while interning is tiring. The workload can be heavy, leaving little time to practice problems.

### Interview Preparation

#### Project Experience

I think lab projects are perfectly valid interview material; what matters is explaining them well.

- **Project introduction**: You may be asked what the project does and, especially, **why you built it**.
- **Project results**: Be ready to discuss measurable outcomes, such as how many people could use the conference system at once, the user experience, or other benefits.
- **Project challenges**: Interviewers will ask what problems or challenges you encountered and how you resolved them. This is where they assess the technical aspects of the project.

In my view, a challenge is a problem that took several days to resolve.

Here are two examples:

**Debugging a problem**: Suppose a memory leak takes a week to find. Explain how you investigated it. You might start by searching for the error, then identify keywords in the material you find, such as relevant tools. Learning to use those tools is part of the troubleshooting process.

**Designing a solution to a requirement**: A requirement may have several possible implementations. Explain why you chose the final approach and compare its advantages and disadvantages with the alternatives.

For more on this topic, see [“What Was the Most Difficult Problem You Solved at Work?”](https://blog.csdn.net/u012423865/article/details/79452713).

Some people say they solve problems by searching online. In practice, you may start by searching for an error or issue, but the answer is rarely immediate. You find a useful keyword in one result and keep investigating from there.

#### Written Tests

Internship coding tests are usually manageable. If there are four problems, solving one or two may be enough to get an interview.

LeetCode Top 100 is a familiar starting point. Practice can feel difficult at first, but after about 40 problems, you may start recognizing patterns. I recommend starting with linked lists and binary trees; array problems often have less reusable techniques.

- **Practice on a whiteboard**. This is not only about remembering APIs for an interview. Repeated whiteboard practice helps you code more fluently and reason independently.
- Algorithms matter, but the goal is not difficult problems. Become fluent in common, frequent problems at easy and medium difficulty.
- If you encounter a problem during a coding test, **ask to use a local IDE for debugging as soon as possible**. Otherwise, you may spend too long looking for the issue and lose your chance.

#### Interviews

A typical one-hour interview has two parts: fundamentals or project experience in the first half, then coding.

**You do not need to review every fundamental topic systematically at the beginning. Start by making sure you know the frequently asked questions**, such as common computer network and operating system topics. Interview write-ups can help you identify them. Missing an obscure question is usually not decisive.

- **Read interview write-ups!** Do not study in isolation; learn which questions are commonly asked.
- For an internship, **cover all common topics**. Missing an obscure detail is less important than gaps in the basics.
- **Explain as much as you can about what you do know.** If necessary, connect the question to a related area you understand and guide the discussion there.
- The coding questions in a live interview differ from written tests. They may not be as difficult, but they test calm reasoning and clean, correct code. Think it through before you start writing.
- When discussing a difficult project problem, do not say that researching documentation was the challenge. Focus on the technical difficulty and how you solved it. This gives the interviewer a chance to explore your technical ability.

<!-- @include: @article-footer.snippet.md -->
