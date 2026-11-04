---
title: An Experienced Programmer's Interview Experiences and Reflections
description: A programmer reflects on interview preparation, technical learning, career choices, and lessons from unsuccessful interviews.
category: Selected Technical Articles
author: Qin Shuiyu
tag:
  - Interviews
head:
  - - meta
    - name: keywords
      content: experienced programmer interviews,interview preparation,resume writing,technical interviews,interview mindset,career planning,interview skills,technical fundamentals
---

> **Editor's note:** The author was 36 and had eight years of Java development experience: three and a half years at Alibaba Cloud and four and a half at Youzan. In this article, the author shares practical advice on interviews and developing your skills.
>
> **Overview:**
>
> 1. Preparing an introduction is an opportunity to understand yourself more clearly and thoroughly.
> 2. A resume is a concise presentation of your strengths and a chance to revisit your experience. Go beyond listing skills and highlight what distinguishes you.
> 3. I prefer targeted applications to applying everywhere. Fewer, well-chosen applications can be more effective.
> 4. Start by understanding how a technology works: its data structures, algorithms, design tradeoffs, mechanisms, and possible optimizations. Work through the details until you can explain them clearly. Read the source code too. It provides firsthand understanding and makes it easier to speak with confidence—unless, perhaps, you are better at pretending than I am.
> 5. Learn from failure. During four months between jobs in Hangzhou, I studied, reflected on unsuccessful interviews, adjusted my approach, and worked on weaknesses. After returning to Wuhan, I received an offer I was happy with within two weeks.
> 6. An interview is a conversation in which both sides get to know each other. Questions vary, but some deserve preparation in advance.
>
> **Original article:** <https://www.cnblogs.com/lovesqcc/p/14354921.html>

Learn from every experience and keep improving through setbacks.

## Introduction

I am 36 and have eight years of Java development experience: three and a half years at Alibaba Cloud and four and a half at Youzan. By common industry standards, I am an older programmer.

Years of reading, learning, and reflection shaped my values and outlook. I realized I wanted to work in education and culture, so in late August I impulsively resigned without another job lined up. Reason did not quite restrain my impulsive side. I do not recommend resigning without a plan; make decisions carefully and prepare first.

I initially thought that, with ambition, goals, motivation, and skills, finding a development job in education would be easy. I was too optimistic. Reality quickly proved otherwise: I failed repeatedly and kept trying. I was surprised by my own resilience. Interviews can be a hard experience, but if failure does not stop you, it can build resilience that carries you further. Everyone experiences setbacks; failure can teach you a great deal if you are willing to learn from it.

I soon identified several weaknesses:

- I had focused on business features and lacked technical depth; my understanding of underlying principles was shallow.
- My experience centered on the order system, with limited knowledge of related areas such as products, marketing, and payments.
- I had spent most of my time on development and testing, with little thought given to operations, product, business processes, or commercial concerns.
- I lacked management experience and was older than many candidates. I had underestimated both disadvantages, and they temporarily shook my confidence, though I eventually recovered.

I had strengths too. In career competition, I see scarcity and differentiation as important. Designing architecture for large projects, solving difficult technical problems, and mastering a specialized field are scarce skills. Thorough execution and experience developing high-traffic, high-concurrency systems can distinguish a candidate. In my view, scarce expertise is the strongest position, differentiation is next, and lowering your standards is a last resort.

I lacked scarce expertise but had some distinguishing strengths:

- I stayed at each job for three to five years and worked diligently. Experience at large companies helped me get interviews, though it did not guarantee an offer.
- I wrote a blog consistently, pursued a deeper understanding of software development, and documented problems and solutions.
- I worked carefully, thought about problems as a whole, and invested in fundamentals.
- I had practical experience with engineering quality, performance optimization, stability, and configurable business logic.
- I had spent years developing and maintaining high-traffic microservice systems.

I applied to relatively few companies. From those interviews, I became skeptical of online claims about receiving offers from dozens of large companies:

- In my view, someone receiving many such offers is likely interviewing for junior roles, unless they have an exceptionally strong background and broad, deep preparation. Interviews for engineers with more than four years of experience can range from algorithms and middleware internals to operational architecture.
- A strong candidate is unlikely to spend that much effort interviewing merely to boast. They are more likely to apply selectively and focus on companies that offer the greatest value to them.
- Some claims are advertisements from training providers, who know that beginners want confidence, even if that confidence is manufactured.

With that context, here are my interview experiences and reflections.

## Preparation

An interview may last only an hour or 90 minutes. Helping someone understand more than 30 years of your life in that time requires careful preparation. Like a performance, a few minutes on stage can depend on years of practice.

Preparation includes your resume and introduction, researching the company, studying technical topics, practicing communication, anticipating common questions, preparing for senior roles, and managing your mindset. It is a chance to reassess yourself and the world around you.

At first, I thought updating my resume was enough. After repeated setbacks, I realized how unprepared I was. I now think of interviews as 70% preparation and 30% adaptation. Preparation means understanding your own experience and anticipating questions about the depth and breadth of your systems, projects, and technical knowledge. Adaptation means showing how you would approach an unfamiliar problem, then using unanswered questions to identify gaps and strengthen your foundations.

The process is also a way to learn: reflect, distill what you know, study new material, and reconsider your past experience.

### Preparing a Resume

Initially, I took my old resume, added my latest job, and made minor edits without changing the overall format.

I handled the basics carefully: I described my skills and experience honestly and made the layout clean and readable, drawing on some UI design experience. I neither exaggerated nor pretended to be modest.

But I had not thought enough about what set me apart. One day a recruiter asked, “What is your greatest strength?” I could not answer and initially gave it little thought. After several failed interviews shook my confidence, I reflected more carefully. I put my practical experience and thinking about engineering quality, performance, stability, and configurable business logic at the top of my skills section. It was a concrete and accurate summary of my work.

The order of information matters too. I had listed languages and technologies first and project management and team influence later. After Nian Gao Mama rejected my application without an interview, I wondered whether my management experience seemed insufficient. I moved management and team influence to the top, but received no response to the revised resume. I realized the ordering might imply that I was primarily a manager—one recruiter even asked whether I still wrote code. Management was actually a weaker area, so I restored the original order to emphasize my engineering strengths and refined the wording further.

As interviews progressed, I found gaps in my resume and past preparation. For an order-export project, I had said only that I greatly improved performance and stability, so I added figures: it previously blocked at 20,000 records and later supported over three million, at 10,000 records per minute. I also added a sentence explaining my gap between leaving in August and interviewing in December, because employers asked about it. For representative systems and projects, I prepared to explain each one's value and purpose, even when that detail was not on the resume. This preparation takes work.

I had described my Youzan experience in detail but barely updated the Alibaba Cloud section. Some employers were more interested in the latter, yet I remembered only a few highlights and what I had recorded in blog posts. The problem was not just the resume; I had failed to review my past work. Write a personal retrospective after each project so time does not erase valuable experience.

Most people have plenty to discuss, but how much have they recorded and reflected on? It is hard to reconstruct that work when an interview arrives.

**Lessons from updating my resume:**

- Use the resume to present your strengths concisely and revisit your experience.
- Go beyond listing skills and experience; highlight what differentiates you.
- Describe your work in a way that makes your contributions clear.
- Record lessons from each project to prepare for future job searches and interviews.

### Introducing Yourself

Interviews often begin with a brief introduction. It provides a transition into the conversation and helps ease tension.

My first introductions wandered through my personality, hobbies, work history, and interests because I did not know what to emphasize. An introduction is your front page: it should make your main strengths clear, which requires examining and distilling your experience. Mine now covers my personality, working style, strongest qualities—such as ownership, execution, and engineering judgment—and a brief work history explaining my responsibilities, contributions, and lessons at each company. Keep it concise.

Preparing an introduction also helps you understand yourself more clearly and thoroughly.

### Researching the Company

Like me, many people apply without knowing much about a company's business. I prefer targeted applications over applying everywhere. There are fewer opportunities, but a clear direction makes the search more efficient. It is like my apartment searches on Douban: the selection may be smaller, but a good match is valuable.

Apply because a company fits your goals and is worth pursuing. To assess that fit, research its main business, plans, industry position, financial health, and reputation among employees and the wider industry.

Thoughtful discussion of the company's business can strengthen an interview. Your research also helps when you are asked, “Do you have any questions?”

### Studying Technology

Technical ability is fundamental for an engineer. Whatever role you pursue, strong technical skills remain valuable and deserve attention.

Principles and design ideas are central to software technology. I divide them broadly into:

- **Principles:** The fundamental rules and processes behind how something works.
- **Architecture:** How to organize logic at scale.

**Start by understanding the principles. Without them, knowledge remains superficial. Study the data structures and algorithms, design considerations, mechanisms, and optimization options. Work through the process until the details are clear, then practice explaining them in an organized way.**

**Read the source code when studying internals. You may be able to repeat an explanation without it, but reading the implementation can give you your own understanding and more confidence. Perhaps I simply lack the ability to pretend otherwise.**

I do not favor preparing solely by drilling interview questions. It can be a shortcut to an offer, but it has drawbacks:

- You may be learning someone else's knowledge structure instead of building your own.
- Technical study should prepare you for future work. If it only serves an immediate interview, you may struggle after joining.

By organizing my knowledge, I developed an outline that works for me: [Common Technical Ideas and Mechanisms in Internet Backend Applications](https://www.cnblogs.com/lovesqcc/p/13633409.html). On that foundation, I find it useful to learn from others and use interview questions to test myself and find gaps. I plan to keep developing that framework.

### Communication

Most companies interview primarily through conversation, sometimes with a written or coding test. Conversation has limits: it places a high demand on communication and may not reveal the full depth and breadth of someone's expertise in a few minutes. The more someone knows, the harder a concise explanation can be, and engineers often have little practice explaining their work.

I write more than I speak, so I am not always fluent. I sometimes dive in without context, ramble, jump between points, and repeat myself—perhaps better suited to a novel than an interview. Clear structure matters. Test yourself: how is Dubbo's architecture designed? How does Redis persistence work? Try answering aloud.

Some basic communication practices:

- Start with the overview, then explain the details.
- Explain the basic approach before discussing optimizations.
- Make it a conversation. Give an overview, ask which part the interviewer wants to explore, then elaborate. For system-design questions, clarify requirements such as time and space constraints, data volume, concurrency, and relevant failure scenarios.

### Common Questions

An interview helps both sides understand each other. Questions vary, but some are worth preparing for:

Common personal questions include:

- Why did you leave your previous employer?
- What salary are you looking for?
- Can you explain the gap in your employment?
- What are your career plans?

Frequently covered technical topics include:

- **Fundamentals:** Data structures, algorithms, and networking.
- **Microservices:** Technology stacks, components, and infrastructure.
- **Dubbo:** Architecture, extension mechanisms, service exposure and references, invocation, and graceful shutdown.
- **MySQL:** Index and transaction internals, SQL optimization, database and table sharding.
- **Redis:** Data structures, caching, distributed locks, persistence, and replication.
- **Distributed systems:** Distributed transactions and consistency.
- **Messaging:** Principles and comparisons between message brokers.
- **Architecture:** Design approaches, experience, and patterns.
- **Performance:** JVM, garbage collection, and application-level optimization.
- **Concurrency:** `ConcurrentHashMap`, AQS, CAS, and thread pools.
- **High concurrency:** I/O multiplexing and cache problems and solutions.
- **Stability:** Principles and practical experience.
- **Production incidents:** Tools and troubleshooting methods.

### Senior and Expert Roles

Perhaps I lacked some confidence. I applied with the goal of being a dependable engineer.

Employers had higher expectations for an older programmer. Each application for a senior engineer role was converted into an interview for a technical expert or architect role, which felt daunting. These interviews need more preparation:

- Have you led a team?
- How much of your experience involved architecture design?
- What is your design process? What architectural ideas or methods do you use?

Without preparation, these questions can leave you flustered. I had approached expert and architect interviews as if they were senior engineer interviews, hoping that would be enough, and failed each time. I had it backwards: I needed to prepare at the expert or architect level even when interviewing for a senior engineer role.

So I decided to face the challenge. I am not afraid of difficult work.

I suggest setting aside at least a day to prepare for an expert or architect interview. Those with extensive experience in those roles may need less.

### Maintaining Perspective

Mindset matters. Mine moved from optimism, to self-doubt, and eventually back to confidence.

For a long time, I was so eager to succeed that I worried an unanswered technical question would ruin the interview. I became cautious and nervous, and even material I had prepared came out unclearly. Interviewing with the sole aim of getting an offer made me feel powerless and miserable; I even considered lowering my standards.

Sometimes I wondered how I had reached this point. I felt I should already be able to pursue work I loved. I had become complacent, kept too narrow a view, and failed to build enough knowledge.

I am punctual and expect the same where possible. Interviewers in Hangzhou were generally on time, or only slightly late. After I returned to Wuhan, a few companies disrupted that pattern. Once or twice, I did not know when the interviewer would join the meeting. I felt somewhat disrespected, though I politely said it was fine. I remain wary of joining a company that does not respect candidates. Should a difficult job search make me abandon that principle and accept such an offer?

I realized that earning mutual respect through ability makes future collaboration easier. If that respect is absent, it may be better to part ways. I could keep improving my skills and finding my strengths regardless of others' doubts. My focus shifted toward communicating, understanding the other side, and earning its respect, rather than merely obtaining an offer.

A story about a stone and jade makes a similar point: value yourself and work to improve, and others may recognize that value; undervalue yourself and stop improving, and they may treat you accordingly. Even before you have every skill you want, assess a prospective employer as a professional choosing where to contribute, not only as someone seeking more money.

Anxiety can also be addressed by examining the gap between your situation and your goals. Assess whether a goal is realistic and how to reach it. Adjust it if needed; if it is feasible, make a plan and act consistently. Decision-making, persistence, and knowing when to act can all be developed.

## Interview Experiences

Engineering interviews emphasize technical depth and breadth, so prepare for both. An interviewer may ask about a few topics, while a candidate faces the combined range of many interviewers. Remember that before assuming, as an interviewer, that you know more than a candidate.

I interviewed at relatively few companies because I wanted to work in education and filtered invitations by interest and motivation. In Hangzhou, I interviewed mainly with education companies and declined invitations from Alibaba, Huawei, and others, although I might not have passed their interviews. My approach was rigid, but I wanted to put most of my energy into the work I hoped to pursue.

To me, education extends beyond online and K–12 education to anything that helps people learn, including teaching, reading, music, and design.

### Relay Baton Technology — Senior Engineer

This was my first interview. We had a good conversation, but I heard nothing afterward and did not dwell on it. Questions focused on transaction-related business processes; the deepest was how to maintain application data consistency.

It felt like throwing a small stone ahead to test the path. I had not yet understood the situation I was in.

### NetEase Cloud Music — Senior Engineer

Next was NetEase Cloud Music. The first round covered caching, distributed locks, Dubbo, ZooKeeper, and message-queue internals. I had spent too little time studying their principles and could answer very little. I failed decisively.

I began to recognize gaps in my technical foundations. I studied widely, worked through principles from the ground up, and organized what I learned into an initial knowledge framework for backend development.

### Mingshitang — Technical Expert

An architect interviewed me on databases, Redis, and other topics. The feedback was that my technical skills were adequate but I lacked management experience. It was the first time I understood how that could disadvantage an older candidate. Small and medium-sized companies often expect management experience even for technical expert roles, so check the requirements.

After some thought, I came up with two responses:

- Improve what you can and study what you cannot immediately change. I could deepen my technical knowledge and learn management fundamentals, even though I could not instantly gain years of management experience.
- Find relevant experience in your past work. I had not formally led a team, but I had led projects and engineers and managed part of a business system.

### ByteDance Education — Senior Engineer

In this interview, I created several difficulties for myself.

When asked about a project I was proud of, I chose a recurring-purchase project from nearly four years earlier. It was my first representative project at Youzan, but I had not documented it carefully and had forgotten many details. I remembered its integrated design but could no longer explain why we chose it.

For a classroom system-design question, I asked whether to use client-server or browser-server architecture. The interviewer chose client-server, which I did not know well. I had made the question harder for myself; I could have explained the browser-based approach I knew.

The feedback was that I understood business needs but needed to improve my system design. I thought that was fair and began reading practical system-design articles and practicing my reasoning.

My lessons:

- Record each project's technology stack, decisions, reasons, and technical details as you work.
- Prepare representative projects in advance; avoid relying on old projects whose details you did not record.
- Discuss projects and architectures you know well so you can make a clear first impression.

### Migu Digital Media — Architect

Three interviewers questioned me at once. I had little experience with panels; perhaps state-owned companies favor them for senior roles to get multiple perspectives. Questions ranged from Elasticsearch fundamentals to data-center migration. I had studied some mechanisms but did not understand them well enough to explain them. For example, after discussing inverted indexes, I could not clearly explain the term index and trie trees in Elasticsearch search. Recognizing a concept is not the same as understanding it well enough to explain its details.

One question stayed with me: “What architectural principles do you use?” It was my first architecture-design question, and I panicked. I had thought and written about design but had not formed a concise, systematic approach, so my answer was disorganized.

### Tuya Smart — Senior Engineer

I applied because Tuya seemed like a good company. It is worth talking with good companies; there may be an opportunity to work together later. Keeping an open mind matters.

My overall impression was positive. The interviewer was courteous and patient and asked many questions about architecture, technology, and projects. Some were in areas I knew, and I answered reasonably well. Perhaps my experience matched their needs.

If I had not been so determined to work in education, I probably would have joined. The Internet of Things seemed like an interesting field.

### GSX Techedu — Technical Expert

I could answer most questions at GSX Techedu. The feedback was that I did not always identify the key point of a question and had not organized my technical knowledge well enough. I initially disagreed: I had written many articles and thought deeply, so surely I had only a few blind spots. Technology is vast; who has none?

Looking back, the feedback was fair. My understanding of technical mechanisms and production troubleshooting was not clear or detailed enough, and my design experience was not organized systematically. I needed to keep working on both.

The more I interviewed, the more I noticed my communication problems: rambling, expanding one point indefinitely, proposing solutions without context, and jumping back and forth. An interviewer could easily lose patience. Starting with an overview and then explaining the approach, implementation, and optimizations would be clearer. Communication matters; coding alone is not enough. I also became nervous at education companies because I feared missing the opportunity.

This was the second company to tell me directly that my age and experience did not match its expectations. It increased my concern about age and weakened my confidence.

I regained confidence by reminding myself that, if I kept improving my technical skills, I could find an organization that valued them—or contribute to open source. Good technical work is not limited to a company, nor should it be limited by someone else's age bias. External recognition matters, but so does the value of the work itself.

### Yitong Education — Architect

Three people interviewed me together, mostly about project experience rather than deep technical details. I thought my answers were reasonable, though I did only moderately well on architecture questions. I still had not realized that I was preparing for an architect role as if it were a senior engineer role.

The interviewers were kind and the recruiter communicated actively, so my impression was good. I did not ask for feedback, however, and heard nothing further.

### New Oriental — Senior Engineer

I interviewed with New Oriental because it matched my interest in education, although the role involved information management systems rather than my ideal work. We found that they needed stronger operations experience than I had. The interviewer was kind and came from Yichang, where I had attended university, so the experience was pleasant.

I needed to study operations. A strong engineer or architect should understand the system's components, middleware, deployment, and operations as a whole. I may have realized this late, but better late than never.

### Zoom — Senior Engineer

One of the two Zoom interviewers gave me perhaps my worst interview experience. One was patient; the other sat with his belly sticking out, yawned, and appeared uninterested in the interview or in me. I wondered why he had agreed to interview me and whether he thought candidates were beneath him. I even thought I could beat him up if our positions were reversed. Still, I remained polite and acted as if nothing had happened. Companies choose candidates, and candidates choose companies too.

My company had used Zoom during the pandemic, and I had liked the product. I was surprised by the interviewer's attitude. Was he an exceptional expert? In my experience, many Chinese companies relied on or customized frameworks, middleware, and infrastructure developed abroad, with relatively little built from scratch. I did not see a reason for complacency.

### Ayou Culture — Senior Engineer

Ayou held four technical rounds. The first interviewer seemed particularly strong in operating-system internals, and I could not answer many questions. I thought I had failed, but got another chance. The second round covered projects and technical topics I knew well. The third interviewer asked a broad range of questions and was patient when I could not answer some. The fourth, a technical director, also asked wide-ranging, detailed questions.

The atmosphere was relaxed. Ayou did not have an urgent hiring need and seemed likely to contact me when an opportunity arose. By then, I was preparing to return to Wuhan, mainly to spend more time with my aging parents.

Looking back, I often made decisions too simply, without working through complex tradeoffs.

### Xiaomi — Expert / Architect

I applied because the role resembled my transaction-platform work at Youzan. After reading Xiaomi's website, I admired its work, though it did not closely match my goal of working in education or culture.

My limited desire to join reduced my motivation in the interview. That is something I need to work on.

### Visual China Group — Senior Engineer

The questions covered technology, projects, and experience, without being especially difficult technically. The HR interviewer was kind. I expected intense questions about my history, but instead explained Youzan's products, services, and business model and briefly discussed my own experience.

### iFlytek — Architect

In the first two rounds, the interviewers seemed uninterested. An architect role requires strong technical and design skills. The first round touched on both; the second focused on my background and nontechnical matters, with little discussion of my abilities. The conversation felt shallow.

Candidates have different levels of ability, but basic respect should be consistent. To me, respecting a candidate means paying attention to their skills and knowledge.

### QingTeng Cloud — Senior Engineer

QingTeng's technical interview was gentle and candid. I felt that my work was recognized and that the recruiter was eager to find good people. It matched my belief that ability should earn respect and appreciation.

### Tencent Meeting — Senior Engineer

I interviewed for Tencent Meeting using Tencent Meeting. The network was unstable, and we often could not finish a sentence before the audio broke up. Both sides were very patient, and we completed the first round together. An interview tests people, but it is also a collaboration in which both sides discover each other. That experience made me question the idea of an interview as a one-sided screening exercise.

I had already received an offer, and the Tencent Meeting role did not fit my original goals, so I told Tencent I would not continue to the second round.

### The Final Choice

When choosing between offers, I considered:

1. My interests and motivation.
2. Compensation.
3. The company's prospects and room for personal growth.
4. The working environment.
5. Whether the company was small and effective.

I compared Visual China Group with QingTeng Cloud:

- **Compensation:** The offers were similar, and both companies valued my experience. Visual China offered a leader role; QingTeng offered work on its core business.
- **Environment:** QingTeng seemed more engineering-oriented, while Visual China was more business-oriented.
- **Challenge:** QingTeng offered stronger technical challenges; Visual China offered stronger business challenges.
- **Interest and motivation:** Visual China was closer to my interest in culture. QingTeng's security work was more technical and lower-level than the human-centered education and culture work I wanted. Still, security is valuable and could serve education in the future. Founder Zhang Fu's ideal of bringing security to every corner of the internet, and his commitment to it, particularly moved me. Ultimately, security appealed to me slightly more than image copyright protection.

I also felt programming or engineer education would suit me best. I wanted to become a system designer and needed more production experience. I could work with junior and mid-level engineers, mentor them at work, or record videos for Bilibili in my spare time. Perhaps one day I would write a book on programming and design, drawing on what I had learned.

After a day of careful thought, I decided to join QingTeng Cloud Security. That also meant a larger challenge: I knew very little about security and had much to learn, especially as an older programmer changing fields.

## Conclusion

Even a difficult job search as an older programmer can be approached systematically: set clear goals, make considered decisions, strengthen the fundamentals, keep working, and act at the right opportunities. Most preparation happens before the job search. If you neglect learning during normal work, interviews demand more catch-up and bring more setbacks. Keep a broad view throughout your career rather than waiting for interviews to expose the gaps.

Learn from failure. During four months between jobs in Hangzhou, I studied, reflected on failed interviews, adjusted my approach, improved my preparation, and addressed weaknesses. That work helped me receive an offer I was happy with within two weeks of returning to Wuhan.

Writing a blog can be valuable for engineers. Interviews have limits, and they can miss suitable candidates for several reasons:

1. Time is short, and even an experienced interviewer can misjudge someone.
2. The questions may happen to cover topics the candidate does not know.
3. The interviewer may be distracted or uninterested.
4. The interviewer's own skills affect the assessment.

Being rejected despite genuine ability is disappointing, but it does not define you. A blog provides another way to show your thinking and everyday work.

A company that values candidates should consider multiple sources, including their writing, and weigh strengths and weaknesses against the role. A company that relies on superficial filters may screen quickly, but risks overlooking ability and learning little about how to recognize it.

These interviews helped me grow since resigning. I had not transformed completely, but I had made progress. I still saw a gap between my abilities and the expert or architect roles at well-known companies. That reflected the challenges in my past work, the limits of my perspective, and insufficient reflection. Next time, I hope to be better prepared and closer to work I find meaningful.

An interview journey is a work experience of its own.

<!-- @include: @article-footer.snippet.md -->
