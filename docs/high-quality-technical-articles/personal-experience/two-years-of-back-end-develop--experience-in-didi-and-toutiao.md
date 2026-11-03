---
title: Two Years as a Backend Engineer at DiDi and Toutiao
description: Lessons from two and a half years of backend development at DiDi and Toutiao, including deep thinking, continuous learning, ownership, communication, and career growth.
category: Curated Technical Articles
tag:
  - Personal Experience
head:
  - - meta
    - name: keywords
      content: DiDi Work Experience,Toutiao Work Experience,Backend Development,Technical Growth,Career Advice,Deep Thinking,Knowledge Consolidation,Taking Initiative
---

> **Editor's note:** A practical and useful account of lessons learned at work.
>
> **Key takeaways:**
>
> - Think deeply about your work and consolidate what you learn. I consider this the most important and meaningful habit.
> - Keep learning and stay interested in technology. If your technical skills and knowledge grow along with your years of experience, why worry about turning 35? Companies should be eager to hire an engineer like that.
> - To get things done and create value for a company, the most important thing is initiative: take on tasks, communicate, move projects forward, coordinate resources, report progress, and build influence.
> - Be willing to talk to people and integrate into the team. Do not keep problems to yourself and isolate yourself.
> - If you want to flatter people, go ahead; if you do not, there is no need to resent those who do. Respect greatness.
> - Stay prepared. With strong technical skills, you have options; if you are unhappy, you can change jobs.
> - Reflect on your work, share ideas, and develop methods you can reuse.
> - …
>
> **Original article:** <https://www.nowcoder.com/discuss/351805>

Here is some background. I earned a bachelor's and master's degree from an unremarkable Project 985 university, graduated in 2017, and joined DiDi. I had also used Nowcoder with other job seekers during my job search. In the second half of this year, I moved to Toutiao. I have always worked in backend development. I had no internship experience, so I had about two and a half years of work experience at the time. During that period, I was promoted once and changed companies. There were happy and satisfying times, as well as uncertain and difficult ones. Overall, I made a fairly smooth transition from a novice employee to a seasoned expert at looking busy. Along the way, I learned some useful ways to get by at work, from my own experience and conversations with others. I want to share them here.

## Think Deeply and Consolidate What You Learn

**My first and most important piece of advice is to think deeply about your work and consolidate what you learn.**

**First, think deeply.** Programmers often say things like: _“My job has no technical content. I just do CRUD and write if-else statements every day. What the hell am I supposed to learn?”_

Setting aside the joking and sarcasm, this may reflect what some people genuinely think. I used to think that way too. After gaining experience and talking with more senior colleagues, I realized how wrong I was. The belief that there is nothing to learn usually comes from intellectual laziness. **Any seemingly insignificant task can open up a vast body of knowledge if you think deeply, explore it further, or look at it from a wider perspective.**

For example, a colleague once told me that a service had run out of memory that week. After a week of investigation, they found a problem with how `defer` was used, changed a few lines, and deployed a fix. They felt they had nothing to write in their weekly report. Many people have probably faced a similar situation.

Debugging means discovering, investigating, and fixing a problem. It involves triggering and locating the issue, reproducing it, finding the root cause, fixing it, and reviewing what happened. If the work took a week, there must have been many attempts and corrections—and plenty to think about. How did you narrow down the location? Which detours did you take? Which analysis tools did you use? To understand the root cause, you could study Linux and Kubernetes out-of-memory behavior, Go memory management, `defer`, and function closures. If none of those topics were relevant but the investigation still took a week, there should be plenty to discuss in a retrospective. You could probably ask dozens of “why” questions.

**Now, consolidating what you learn.** Many programmers focus on getting the work done but rarely abstract or summarize what they have learned. After years on the job, they may still have only a few disconnected pieces of knowledge. This makes it easy to forget things and narrows their perspective. Summarizing your work at the right time is important. It takes you from techniques to underlying principles, broadens your perspective, and helps you reason at a higher level. When a similar problem comes up, you can apply a method you have already developed and solve it systematically.

Here is another example. Suppose you reduce a backend service's memory use by 1 GB one day and cut read/write latency by 50% the next. Could you summarize your performance optimization approach? At the application layer, you might manage client integrations and review whether their access patterns are reasonable. At the architecture layer, you might use caching, preprocessing, read/write splitting, asynchronous processing, or concurrency. At the code layer, there are even more options: resource pooling, object reuse, lock-free designs, splitting large keys, deferred processing, encoding and compression, garbage-collection tuning, and language-specific performance techniques. The next time you need to optimize performance, you can apply that approach; the remaining work is choosing the tools and implementing it.

Someone might say, “I just argue with the PM and handle feature requests. I do not work on performance optimization.” Even business requirements offer things to reflect on. How do you build a system? Have you thought about its core capabilities, boundaries, bottlenecks, service decomposition, and governance? If you discuss requirements with a PM every day, how can you develop product sense, guide product direction, and design architecture ahead of business growth? These are all worth thinking about. Martin Fowler even developed a whole theory of refactoring from the painful task of maintaining someone else's bad code. There is no reason to dismiss our own work as unimportant.

**Learning and growth are self-driven. If you think there is nothing to learn, it probably means you have not looked deeply enough—or are being lazy in both action and thought. Write technical articles and share your work to make yourself think and reflect. If the article lacks depth, you may not feel comfortable sharing it publicly.**

## Keep Learning and Stay Interested in Technology

In recent years, the “programmer at 35” narrative has spread widely: it claims that programmers should expect to be laid off once they reach 35. It is true that the tech industry does not offer the same stability as public-sector jobs. But “35” here is not just a literal age. It usually refers to programmers whose skills after ten or more years are not much different from those after two or three years. They have relied on what they already know, stopped learning, and lost the desire to grow they had at 25. They may also have more family responsibilities and higher salary expectations, which can make them less competitive to employers.

**If we keep learning and let our technical skills and knowledge grow with our experience, what is there to fear about turning 35? I think companies would be eager to hire an engineer like that.** But **learning is difficult and goes against our natural tendency to stay comfortable, so we need to push ourselves out of our comfort zones and stay curious about technology.** At DiDi, people used to say something like this: **When you step out of your comfort zone and feel pressure and struggle, you may be in the darkness before dawn—that is often when you grow fastest. If every day feels comfortable and you are just putting in the hours, you may be like a frog slowly being boiled.**

The first few years after graduation often leave you with more free time, making them a good time to study technology. Use that time to strengthen your fundamentals, build good study habits, and maintain a positive attitude toward learning. Those habits can benefit you for life. Many experienced engineers have written about how to learn efficiently, and once you join a company, you can often find similar advice on its internal network. I will not go into it here.

**_Join a study group or technical community, inside or outside your company, and keep up with new technology._**

## Take Initiative and Communicate Progress Promptly

The first two points focused on personal growth and maintaining your competitive edge. From a company's perspective, however, the main reason to hire people is for them to create business value. Companies may have training programs for new graduates, but they are not obligated to help us grow.

**To get things done and create value for a company, the most important thing is initiative: take on tasks, communicate, move projects forward, coordinate resources, report progress, and build influence.**

When I first joined, I did my assigned work and then went off to do my own thing. I rarely talked to others proactively or thought of ways to help the project. I assumed that doing my job well was enough. Later I realized that this was only the minimum expectation.

Some colleagues only needed their manager to share the team's direction. They could handle all the work that followed without the manager having to worry. If I were a manager, I would like working with people like that too. This is probably what people mean by “ownership.”

Another important part is keeping your manager informed. If a project is falling behind or you run into a problem, tell your manager promptly. Discuss a technical approach if you are unsure, or ask for help coordinating resources. Do not worry too much about being a burden—that is part of a manager's job.

If a project is going smoothly and does not need your manager's involvement, still share progress and results in a timely way. Bring up your ideas, ask for feedback, and find out what could be improved. This reduces information gaps. It also helps your manager understand your workload and track the project; managers have their own managers to report to as well.

Some people dislike this and call it “managing up.” I have not been very good at it either. But at a minimum, do not accept a task and then work in isolation, fail to update your manager for a month, and hope to surprise everyone with a big reveal. That is likely to end badly.

**Take initiative. You can start by making yourself speak up in public settings. If you have a problem or an idea, bring it up in a one-on-one conversation promptly.**

Here are a few more points I think matter:

## Build Trust First

Whether you joined through campus recruitment or as an experienced hire, your first task matters a great deal. It shapes your manager's and teammates' first impression. Do it well: at a minimum, complete it successfully without causing a production incident. The goal is to establish trust and show the team that you are reliable. If it goes well, your work will likely get easier. If it goes badly, your manager may give you a second chance; if you fail again, it may be much harder to recover. This matters even more for experienced hires.

When you first join, you may not know the technology stack, and the business can be complicated and hard to understand. The pressure is real. Put in extra effort and talk with your teammates. Ask when you do not know something. **The most efficient way to learn, in my view, is not reading books or watching videos, but talking directly to the people who know the subject. One conversation can make things much clearer than reading documents or code. You skip irrelevant information and learn the history of the business as well. Of course, this takes some communication skills, since your colleagues are busy too.**

**Be willing to talk to people and integrate into the team. Do not keep problems to yourself and isolate yourself.**

## Exceed Expectations

There are many ways to exceed expectations. If your manager asks you to take a support shift and answer questions in a user group, you might also collect and categorize the questions and build an automated Q&A bot to reduce the team's workload. If your manager asks for a small tool for the operations team, you might build a suite of tools that grows into a platform and a full project. That is also exceeding expectations.

It means being able to expand the scope of a task: thinking of something your manager did not, creating practical value, and delivering business results. This ability matters. Some people grow a small project into something much larger, while others do the opposite. People who innovate and regularly exceed expectations clearly have more room to grow.

**This depends a lot on individual ability. I do not know a shortcut—try thinking one step further.**

## Think in Systems and Build Them Systematically

I came up with this phrase while preparing for a promotion. It means building systems with a broad view rather than focusing on one small task. You need to plan well and have a clear roadmap for how the system will evolve.

For example, adding monitoring today and an alert tomorrow should not create isolated features. They can be steps in the first phase of a reliability program. That phase might include organizing alerts and monitoring across machines, systems, business behavior, and data, with an expected benefit of XXX. The work should also have a follow-up roadmap: capacity planning and load testing in phase two, degradation drills and multi-region disaster recovery in phase three, and so on. This makes it clear that you think comprehensively and work systematically.

**Reflect on your work, share ideas, and develop methods you can reuse.**

## Improve Your Soft Skills

By soft skills, I mean presentation decks, communication, speaking, time management, design, documentation, and similar abilities. Honestly, I think one reason I was promoted was that I made better PowerPoint slides.

People often overlook these skills. I used to think they were easy and that I could just do them when needed, but they are more complicated than they seem. A promotion presentation, talk, and defense involve many details: choosing content, designing slides, guiding the audience's attention, and answering the panel's questions. I have seen many colleagues with disorganized slides and awkward presentations. They had done substantial work but struggled to explain it. If they then faced panelists from another department who did not know the details, the disadvantage was predictable.

**_Companies often offer soft-skills training on their internal networks. Look for opportunities to practice deliberately._**

The advice so far may sound very idealistic, but society is not always so nice. The next sections are more cynical. If you prefer to avoid that kind of content, feel free to skip them.

## Flattery Can Pay Off

Before joining the industry, I disliked flattery. One reason I wanted to work for an internet company was that I thought workplace politics would matter less. I was wrong.

A few days before I joined, a senior department leader posted a message in the team group. Dozens of thumbs-up replies immediately followed: “Learned a lot,” “Great point,” “Excellent.” It was like flags waving, drums beating, and firecrackers going off. I was impressed by how quickly everyone saw and responded to the message. Then I noticed that even the flattery followed a hierarchy: a leader of one department replied, then leaders of subdepartments, then team leads, and finally everyone joined in. For a while, I wondered whether the speed of flattering people determined career prospects. (Yes, I have since stopped wondering.)

To be honest, I still have not gotten used to praising people in group chats, but I do not mind it now; I treat it as entertainment. It is not that I lack the eloquence—no particular skill is needed, and people are usually direct. In some situations, to lighten the mood, I can be very sweet with my words and even quote classical poetry to praise a leader. But I noticed my direct manager rarely did this in group chats, so my choice not to praise leaders publicly was, in a way, quietly aligning with my manager's preference...

If you do it in moderation, flattery can still pay off. At worst it does nothing; it probably will not hurt. When everyone's abilities are similar, each chance to praise someone in a group chat is also a chance to get noticed. One colleague called this building your technical influence...

**If you want to flatter people, go ahead; if you do not, there is no need to resent those who do. Respect greatness.**

## Workplace Conflicts and Blame-Shifting Never Go Away

Where there are people, there are social dynamics. Technical teams may not be especially calculating, but arguments, blame-shifting, taking credit, and fighting over work still happen. I have even seen people argue by sending mass emails.

These topics involve sensitive information, so I will not say more. Junior employees may not encounter them often, but sooner or later you will see this kind of workplace drama. Be alert when you do.

**Be careful. We should not bully others, but we should not let others bully us either.**

## Do Not Let Empty Promises Blind You

To be honest, I dislike motivational speeches about passion, dreams, and hard work. It is almost the year 2020, yet this kind of propaganda is still widespread. I do not know whether that is funny or sad.

There is nothing wrong with these ideas themselves, but motivation should come from within rather than being imposed from outside. “I need to work hard” sounds reasonable. “You must work hard” feels strange: work hard so the company's shareholders can get richer? When the pay is not enough, that kind of pressure is especially exploitative.

Stay clear-eyed about a manager's promises and analyze the situation rationally. For example, if you feel your pay is too low—or your level is too low—you might be in one of these situations:

1. Your manager has not noticed that you are underpaid.
2. Your manager knows you are underpaid but does not realize how strongly you want a raise.
3. Your manager knows you want a raise but thinks your ability is not yet sufficient.
4. Your manager knows you want a raise and thinks you are capable, but does not want to give you one.
5. Your manager wants to give you a raise and has advocated for you, but lacks the budget or resources.

Give your manager feedback and discuss the situation. In cases one and two, communication can clear up the misunderstanding. Case three needs more discussion. In cases four and five, you can consider leaving. There is no need to complain; it will not solve anything. Improve your skills, stay competitive, and change jobs when the time is right.

**Stay prepared. With strong technical skills, you have options; if you are unhappy, you can change jobs.**

## Learn to Present Your Work

Put simply, you need to know how to sell your work. I cannot remember where I first saw it, but the three key workplace skills are speaking, writing, and execution. Speaking matters because it can help you win projects, secure resources, and recruit people.

Different people can describe the same work in very different ways. If I launch a small tool, I might describe only the facts. My manager might say it “created a strategic tool for XXX, improved the entire XXX ecosystem, and completed the XXX business loop.” I give up—you can have all the credit. In my experience, every internet company has its own set of buzzwords: “strategic lever,” “ecosystem,” “closed loop,” “alignment,” “streamlining,” “iteration,” “ownership,” and so on. Learn them by heart—no, learn to use them well.

The same applies to presenting yourself. This matters especially in promotions and interviews, which are short, high-stakes evaluations. I will not go into all the tactics here. The following examples come from conversations with an interviewer at one company; you can get a feel for them:

1. “We operate in a market worth 40 or 50 billion dollars...”
2. “I worked on a system that handled hundreds of billions of visits a day...”
3. “That is impressive for someone with only two years of experience...”
4. “Your company's technical culture is excellent, and its business has a bright future...”
5. “Likewise!”
6. “I have heard a lot about you!”

Life is a play; it all comes down to acting.

**Look at your manager's presentations and listen to leaders' upward reports and company talks.**

## Which Matters More: Choices or Effort?

Do we even need to ask? Choices, of course. In front of a perfect choice, effort can seem worthless. A high-school classmate I had not spoken to in years rang the opening bell in Times Square this year...

But stories like that are rare. The odds of making a perfect choice are low, and the uncertainty is high. Most new graduates cannot yet assess an industry, their own abilities, or the difficulty of starting a company accurately. Gathering a few people and starting a business at that point is risky.

A safer path, in my view, is to join a reasonably large company, find a good manager, build a strong working relationship, and improve your abilities. A good platform, a supportive manager, and personal effort can help you grow quickly. After building a network and savings, understanding the market and its needs, and gaining confidence, you can consider starting a business.

## Afterword

I meant to share some personal stories too, but this article has already become long, so I will stop here. I do not always follow my own advice and still have room to improve. Some of these opinions may reflect my limited perspective and may not apply to everyone. They may even change after I gain a few more years of experience. Feel free to discuss them with me. (And there, I have passed the buck successfully.)

I hope everyone finds a job they like, enjoys their work and life, and makes the most of the opportunities ahead.

<!-- @include: @article-footer.snippet.md -->
