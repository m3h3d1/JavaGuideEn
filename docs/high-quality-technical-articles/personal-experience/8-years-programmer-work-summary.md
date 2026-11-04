---
title: An Average USTC Student's Eight-Year Career as a Programmer
description: "A programmer reflects on eight years of work, career decisions, technical growth, and lessons learned."
category: Selected Technical Articles
author: Chen Xiaofang
tag:
  - Personal Experience
head:
  - - meta
    - name: keywords
      content: USTC programmer,eight-year career summary,aerospace research institute,Huawei,career development,home-buying experience,technical growth,personal reflection
---

> **Editor's note:** This article recounts an alumnus's eight years of experience: joining a satellite research institute under Shanghai Academy of Spaceflight Technology after graduating in 2013, moving to Huawei, and eventually leaving. Alongside the career story, the author shares reflections on work and life. I found them useful and am grateful to the author for sharing them.
>
> **Original article:** <https://www.cnblogs.com/scada/p/14259332.html>

---

## Introduction

This year, I finally left the big telecom company. My annual compensation was just under RMB 600,000—not much by the standards of Zhihu. I finally have time to tell my career story and reflect on nearly eight years as a programmer.

I made some good decisions over those eight years, and more bad ones. I am writing them down in the hope that others may find them useful. Feel free to contact me to discuss them. Please excuse my writing; I no longer remember every detail, so some parts may not be exact.

_A few notes before I begin; I may not respond to every comment about these points._

1. I was not a strong student at USTC; that is all I mean by “average student.”
2. Buying homes was a major part of my life, so this article discusses home purchases and prices. If those topics bother you, please stop reading. I apologize for taking your time.

## 2013

### Joining a Satellite Research Institute in Shanghai

I was born in 1986 and graduated from USTC in 2013 with a degree related to software. Both my parents were teachers, and I grew up hearing that I should study hard, find a stable “good job,” and serve the country.

So, on impulse, I joined a satellite research institute in Shanghai. I had not thought the decision through and simply followed my parents' advice. That hasty choice contributed to my decision to leave five years later. My first lesson:

**If your family has ordinary means, their advice about major life decisions will often reflect their own circumstances and choices. If you want a different path, treat their advice as one reference, not the only one.**

In April 2013, I took a train to Shanghai and transferred between subway lines to reach Minhang. I walked from the station to work, passing old buildings, and thought, “This looks no different from home. So much for Shanghai.”

The staff member who welcomed me was kind. After I completed the paperwork, I was assigned a dormitory and given about RMB 3,000 to help me settle in. I was thrilled—please forgive a country kid who had never seen that much money. I bought essentials at a nearby shop and began my aerospace career.

After a month of training, I joined a department responsible for embedded software on satellites. The glamorous “satellite software development” initially meant odd jobs: moving boxes and equipment around the lab and factory. Many aerospace workers will recognize the physical side of the job. I was young and focused; after moving equipment during the day, I stayed late to read documentation, draw software flowcharts, and practice programming. I felt productive.

I remember taking home about RMB 5,000 in my first month. It felt low, and many colleagues who started with me complained. I did not; I avoided comparing salaries. My second lesson:

**Do not compare your salary with your coworkers'. It rarely helps and often leaves someone feeling worse—quite possibly you.**

### Standing Out at Work

About a month into the job, an opportunity helped me stand out among the new hires. The government was requiring defense companies to meet the GJB5000A software process maturity standard. A colleague responsible for configuration management resigned after passing the civil-service exam. Our software platform used SVN for version control, which I had used at university. Few students seemed to run their own local version-control systems, and classmates had even teased me for it. It reminded me of Steve Jobs learning calligraphy. My lesson:

**Do not dismiss a skill as useless. Any skill can be valuable if you find the right context for it. If you ever fall into water, you will be glad you learned to swim.**

**To grow at work, take on difficult and challenging tasks. When you turn down the hard work, you may also be turning down an opportunity.**

Back to the story: I volunteered to help the certification lead, saying I had relevant experience. She was a senior colleague I greatly respected—serious, responsible, and generous, with decades devoted to the country's aerospace program. Many people in the field have made major contributions to national defense while working quietly for modest pay. She had seen my diligence and quick thinking; the certification also required answering experts' questions in person. She accepted my offer. I quickly learned the process and documentation, handled the work step by step, and periodically reviewed what we had done. Reflection may be one of my strengths:

**Many people keep working without stopping to think. Periodic reviews preserve lessons and clarify what to do next. Doing things right matters, but choosing the right things matters more. Do not rush: when the direction is right, moving slowly can be faster.** (I understood the last point only later; perhaps I would be in a different place if I had understood it sooner.)

One month later, we passed the certification without serious trouble. The lead requested a special RMB 2,000 award for me. I was delighted—not so much about the money as about seeing my work valued. The following months were uneventful; I remember only two things.

One was during the Dragon Boat Festival. We were resting in the dormitory when we heard a commotion in the hallway. A Party secretary had come to check on us and gave each person a box of summer drinks. It stayed with me. State-owned companies have many problems, but I felt they often showed more personal care.

### Missing a Chance to Make a Fortune

The other was that my roommate had just bought a home and was constantly looking for ways to make money. He urged me to buy a home, then Bitcoin. I ignored him because I disliked his habits: he smoked in bed and cooked in our poorly ventilated old dorm. I had rhinitis and did not like him much. (I owe him an apology; I was immature.) Bitcoin is now worth tens of thousands of dollars. If I had listened, I could have made some money. (I did buy some in 2018, but sold too soon—that comes later.) My lesson:

**Do not judge people by appearance, habits, education, or other outward traits and dismiss their advice automatically. Evaluate advice objectively and consider it on its merits. Being willing to accept good advice is a valuable quality.**

**It is difficult to earn wealth beyond your understanding, and even if you happen to get it, you may lose it quickly. Rather than envy speculative gains, improve your judgment and financial literacy.**

### My First Formal Aerospace Project

September arrived. I had joined in April, and my first formal aerospace project began. In defense industries, a “model” refers to a product line, similar to Huawei's Mate series. The project assigned to me officially started, and I could finally write code for a satellite.

I was fully focused on software work for the defense industry. My days were split between the lab, test facilities, and review meetings. The work was busy but rewarding. Through hard work and decent technical skills, I soon handled basic project tasks independently. The project leads noticed and began considering me for chief designer, a position usually given to employees with one or two years of experience. I was excited.

## 2014

### A Setback After Becoming a Lead Designer

By the first half of 2014, I had become a lead designer and could handle development work independently. Soon, however, product development hit me with a setback.

We had finished a software version and loaded it onto a satellite for testing. One day, a senior leader visited. By coincidence, the test lead sent a command sequence not normally used on the satellite, as required by another role. I had tested it in the lab, but the software immediately crashed. Because the leader was present, the incident was reported to the quality department, and I began a difficult root-cause investigation.

At least three leaders asked for progress every day. As a new employee, I felt intense pressure, but I could not reproduce the failure; the software worked perfectly in the lab. One day I realized the satellite might have a different environment. The investigation eventually found that an uncontrolled third-party loader had altered four bytes of my program. Those bytes belonged to code executed only by the command sent that day, causing the crash. I spent nearly a month completing the root-cause and technical analysis reports. The technical lead did not blame me and came to value my work more. After that, I wrote an analysis report for every quality issue, no matter how busy I was. This habit helped establish my technical influence and later supported my promotion to software team lead.

**I strongly recommend regular, documented quality reviews in technical teams, followed by in-person discussion. Detailed technical reviews encourage knowledge sharing, build the team's expertise, improve product quality, and help create a stronger team.**

**As an individual, build the habit of writing technical retrospectives. They improve your skills, and sharing them can increase your influence.**

### Rethinking Workplace Soft Skills

The first half of the year was busy. At year-end, the company held a best-team competition that would have a major effect on our group. First, I should mention a colleague: a woman from Nanjing University who joined a year after me. She was proactive, quick-thinking, and excellent at making presentations—outstanding, though a little dark-skinned (I hope she does not come after me if she reads this).

We were new and eager to enter the competition. Our leader said the group participated every year. We asked why we had never seen an award certificate, since we did a lot of work. The leader admitted we had never reached the finals. We asked how many teams qualified; the answer was the top 27 out of more than 50. We were stunned.

Our group did a lot each year, and we did not think our ranking reflected that. A few of us planned a new approach. We renovated the office for the on-site judging, organized our year's achievements, and I volunteered to present because communication was one of my strengths. With my colleague's polished slides, we won a bronze team award. My presentation also earned recognition from leadership. Here is another lesson:

**Workplace soft skills, such as presenting your work, matter. Programmers often underinvest in them. Practice and training can strengthen these skills and help later in your career.**

## 2015

Time passed quickly. One event in 2015 had a major impact on me.

### Becoming Deputy Team Lead

Our team had grown to 18 people. As routine work increased, the team lead needed help, so at a department meeting the director asked everyone to vote anonymously for a deputy lead. I was elected, thanks to my technical contributions and communication skills. I was surprised because people often said that without connections, you would remain at the bottom of a state-owned company. After thinking it over, here is my tentative view:

**Do not assume everyone in a state-owned company advances through connections. Favoritism exists, but connections do not necessarily mean low ability. A privileged position can amplify someone's achievements or make their misconduct more visible. Without connections, you can still reach your goals by contributing more; the effort itself is valuable. The people I met who had connections were capable too—perhaps by coincidence, or perhaps because their parents gave them a head start in experience and education.**

### Learning to Manage a Team

As deputy lead, I became busier. I had to handle my own project while coordinating work across the team's other projects. People say we should be sympathetic to frontline team leads in the defense industry, and they are right. I began learning how to build cohesion and coordinate resources. I was still growing, but I made a major strategic mistake that year. The system was partly to blame, but there were things I could have done within my role.

The department used a common matrix structure, with project and administrative reporting lines. The department head was not allowed to be assigned to a specific project because they managed resource allocation. Each of us worked on one or two projects, while also belonging to a horizontal administrative line and a vertical project-management line.

Project work was usually the top priority because the products came first, but individual performance reviews and promotions were managed through the administrative line. This arrangement can work in private or foreign companies with fast communication. In our state-owned organization, slow communication and other constraints left everyone busy with separate project tasks and unable to focus. We worked all year without earning much recognition from the department. I was also stretched between two reporting lines. In retrospect, we might have addressed some of this by focusing on a shared platform, though that was difficult in our industry:

**Individuals and teams have limited resources, so focus matters. If you cannot do one thing well, spreading your effort across many things will make success even harder. But first, think carefully about what deserves your focus. The most important thing is to keep working on the right things.**

## 2016

This was a pivotal year in my life, with many major events.

### Becoming Team Lead

The first was my promotion to team lead. My experience as deputy helped me settle into the role. I kept development on track, led the team to win bronze-level or higher awards several years in a row, and helped us pass various audits. But in my youth, I made a mistake I still regret.

Our department had two large groups: software development and system analysis, which handled system design.

The system group issued software requirements, and our software group implemented them. Due to the department's history, many software engineers had over ten years of experience, while the newly formed system group had many employees with less than two years on the job. At some point, several software colleagues began to feel that they were working for the system group. The system group also lacked design experience, and its requirements inevitably missed details, sometimes causing product defects. Tensions between the groups grew.

The conflict eventually came to a head. The system group promoted a new platform backed by the administrative line, but defense products had a rigorous release process and no project was willing to use it. Some platform leads had never worked on a complete product project. The software group had to implement the platform, but existing resentment made some engineers feel they were doing work for people who would take the credit.

I handled software development and some administrative work, and, being young and immature, shared that view. I will skip the details of the conflicts. Several people from both groups resigned, including the system-group lead; the department director left to start a business. (They had other reasons too, as did I, but I believe this conflict contributed.) I deeply regret not stepping up to mediate between the groups and support the department's technical modernization. Perhaps fewer talented colleagues would have left.

**Strategic shifts and technical modernization are painful. As a frontline leader, set aside personal bias and help the team support the department's and company's main strategy. The team's success depends on that strategy succeeding.**

### Buying a Home

My second major event in 2016 was buying a home. Anyone who followed housing prices may remember how sharply they rose in China's major cities that year. Prices in central Shanghai and school districts had already started rising in late 2015. After hearing colleagues discuss the increases, I began considering a purchase. Around the 2016 Lunar New Year, I visited my parents and told them my plan.

My father followed financial commentators on CCTV and believed Shanghai's housing prices were a bubble. He told me not to buy. I was more experienced by then and remembered my first lesson above. I gathered historical housing-price data and government policies. Reviewing 2015, I saw five rounds of interest-rate and reserve-requirement cuts, higher housing-fund loan limits, and looser lending rules. I concluded that prices would continue rising until cities imposed purchase restrictions, and that increases would spread outward from the urban core. For the first time, I firmly disagreed with my parents about a major life decision and insisted on buying. My father wanted to wait until year-end, when my mother's and future mother-in-law's housing-fund savings could be withdrawn. I still disagreed. Eventually he gave in, and we used RMB 500,000 pooled from both families to start looking. Shanghai's subsequent price increases are well known. This was one of the few major decisions I got right.

Ironically, while researching prices, I failed to study the most important factor in buying a home: location. We insisted on buying a new property and ended up with a home in Songjiang that was poorly connected by transit. Its location later contributed to my second resignation, as I will explain.

**If you can afford it, consider buying in a major or emerging major city rather than believing predictions of an imminent housing-market collapse. If you cannot, consider a promising city cluster and, where appropriate, buying in a parent's name. Many people's wealth does not keep pace with inflation. And the three most important factors in buying a home are location, location, and location.**

That morning, my girlfriend and I also registered our marriage. I somehow wrote my ID number incorrectly three times.

I finally had a family of my own, but after the down payment I had almost no money left. Frontline aerospace employees did not earn much. As a team lead, I took home about RMB 7,000–8,000 per month plus a small bonus. The total was still modest, but my housing-fund contributions were substantial and I spent little, so the mortgage was manageable.

After buying the home, I worried that we had drained both families' savings. What if someone got sick? After thinking it over, I used my next paycheck to buy critical-illness and accident insurance for the family. I still do not know whether it was the right decision. Later, both my father-in-law and my mother became ill, but the insurer denied both claims for reasons I could not argue with—one had to do with my nearsightedness. I am grateful for public health insurance, which covered part of the medical costs; otherwise, the burden would have been substantial.

## 2017

The pivotal events of 2016 barely made a ripple in history. In 2017, I joined China's deep-space exploration program. I left aerospace before Tianwen-1 launched, but sometimes I look up at the stars and think that my code may be working somewhere out there. It is moving to feel that I took part in a historic project. Outside work, two major things happened that year.

### Buying a Second Home

The first was buying a second home. It seems absurd: our first purchase had drained the family savings, yet the next year we bought another. Life is unpredictable. By 2017, my mother and mother-in-law had both retired and withdrawn their housing-fund savings. Our families held wedding banquets, and both sets of parents gave us all the gift money. Parents can be incredibly generous. We had no debt beyond the mortgage and lived simply. We began thinking about what to do with the money. One day at the market, someone handed me a flyer. I usually threw those away, but for some reason I read this one: “High-speed rail home in Jiashan, next to Shanghai, RMB 15,000 per square meter.” I was stunned. When I researched Shanghai prices the year before, I remembered seeing Jiashan homes at RMB 5,000–6,000 per square meter. Had I missed an opportunity? My reflection:

**Stay curious at work and in life. Opportunities can hide in small details. If someone had told you twenty years ago that people would shop online or pay by phone, do not dismiss them as a fraud immediately. Think it through. Stay curious, but use your own judgment.**

I hurried home and started analyzing housing markets around major cities. I compared Kunshan, Yanjiao, and Dongguan. Yanjiao had little industry and mainly absorbed population spilling out of Beijing, so its prices were volatile. Kunshan and Dongguan had their own industries and were close to major cities, which seemed to support steadier growth. My wife and I began looking outside Shanghai. We visited Jiashan but felt it lacked an industrial base. Kunshan had purchase restrictions. Jiaxing prices had also risen, and many homes were bought by Shanghai residents as investments or for parents who rarely lived there. I worried about resale liquidity. Then I looked at a map of Hangzhou Bay and wondered about its southern shore: Shaoxing and Ningbo had stronger economies. We focused on Shaoxing and, after a month of searching, bought a small home in a district near Hangzhou. In 2017, prices in smaller cities began rising after those in major cities. Later, government policies for the Greater Bay Area further reassured me about the purchase. Here is my tentative view:

**In a period of steady inflation, debt can be an asset. I expected the Yangtze River Delta to outperform the Guangdong-Hong Kong-Macao region because Hong Kong, Macao, and Shenzhen compete with one another, while cities in the Yangtze River Delta complement one another. I thought Macao might eventually resemble a mid-sized provincial capital.**

### Trying to Have a Child

The second major event was that we began trying to have a child. It did not happen easily, and we started visiting hospitals frequently. We went from general clinics with RMB 10 registration fees to specialist clinics costing RMB 200–300 and premium clinics costing RMB 600; from general hospitals to maternity hospitals; and from Western to traditional Chinese medicine. Every weekend was spent in a hospital or traveling to one. The diagnosis offered some hope, but also real difficulties. I felt as if the world had gone dark. Something I had only seen in the news was happening to us, and we even began looking into an underground market. Medical costs kept rising, and specialist visits were not reimbursed. My income was modest, and mortgage and medical payments became difficult to manage. I even considered selling the smaller home.

## 2018

As mentioned earlier, we were making frequent hospital visits while my project workload kept growing. I was struggling to keep up. The doctors eventually recommended surgery, with a significant chance of failure. My wife and I decided to proceed; if it failed, we would pursue another route, which might require more money. “Even a hero can be defeated by lack of money,” as the saying goes. I had begun thinking about resigning. Life had to go on, so I remembered the bank staff who often visited our workplace and took out a loan for emergencies. I assumed insurance would not cover this situation.

### Project Completion and Resignation

By August, my project was winding down. A satellite launched successfully, and the deep-space project passed its preliminary-model stage. My first job had reached a natural endpoint. I began applying online. My technical skills were decent and I communicated well, so interviews went smoothly. Within a month, I received six offers, including one from Huawei: level 16A, with a monthly salary of RMB 25,000. A later policy change added RMB 6,000 in performance pay. (My level and total compensation were still somewhat low, partly because my state-owned employer had paid less. Huawei's levels later seemed inflated; PhDs could easily start at level 17.) Huawei's offer approval process was the longest I had seen. My contact followed up daily, and it took nearly two months. I told my manager I was leaving. Resigning was painful, as anyone who has done it knows. Why Huawei? I urgently needed money, and I felt an embedded-systems engineer should experience Huawei. In hindsight, joining without understanding the company's culture was rash:

**If you do not identify with a company's culture, you are unlikely to stay long or reach senior roles. In IT, staying below senior levels can create problems as your career progresses. Companies hire both qualified people, who have the required skills, and suitable people, who identify with the culture. They hire qualified people first, then use ongoing messaging and workplace norms to push out those who do not fit.**

### Joining Huawei

After a difficult resignation, I joined Huawei. Before leaving, I did something risky. I had some cash but was paying interest on a loan and wanted to put the money to work. Through our medical situation, I had heard about the underground market and learned about Bitcoin. I took the plunge and bought some. Its price fluctuated, and I eventually sold at a profit—but far below what it would be worth later. It was a test of human nature.

## 2019

### Passing Probation

Huawei's probation period was long: six months, with monthly progress reviews and interviews. I finally passed, receiving an “Excellent” rating in my review and a small raise. I do not want to say too much about Huawei. I do not feel qualified to judge the company; from a corporate perspective, it is remarkable, and its founder is an entrepreneur worthy of respect.

After six months, I realized again that I had joined too hastily without learning enough about the role or department. **I was in a software team inside a hardware department. What was I thinking?**

**Try to work on your department's main line of business rather than at its periphery, especially in fast-moving departments with strict performance reviews.**

Worse, our larger team was spread across four locations. The group lead (called an LM at Huawei) was in Shanghai, with a local business lead at each site. I immediately realized that year-end evaluations would divide credit across the four locations, and each local lead would have an advantage. My own team would struggle to stand out, and competition for resources would be intense.

### A Successful Pregnancy

Setting that aside, my wife's surgery in 2018 was successful. After she recovered, we began trying for a child in early 2019. We were fortunate, and she became pregnant quickly. I commuted 90 minutes by subway each way and had a demanding workload, but I was happy. Then my team lead (PL) told me that the group lead (LM) needed someone to support work at the Hangzhou research center and considered me the best choice. My wife needed support, and I knew a move to Hangzhou would likely hurt my year-end review. I explained my preference to the LM, but in the end I went to Hangzhou.

I began traveling between the two cities and returned to Shanghai once a month. Meanwhile, our hometown's urban-renewal project provided some compensation. My parents sold a home near their old school, and my mother-in-law sold some family property. They gave us the proceeds. Using these last family assets and Huawei's steady income, I bought homes in areas of Shaoxing and Ningbo without purchase restrictions. I was not trying to speculate; I only wanted to protect our money from inflation. In hindsight, I may have guessed right again. My view:

**Hangzhou, Shaoxing, and Ningbo will become closely connected economically. I think it is unlikely that Hangzhou will annex parts of Shaoxing administratively; city expansion is more likely to absorb subordinate cities first.**

### The Baby Arrives

Enough about property; back to work. In October, after nearly a year at Huawei, my mentor in its mentor-apprentice program quietly told me I had been named a backup PL. I did not know whether it was true, but I was pleased. I was also beginning to realize that this might not be the company I wanted. It had taken me years to understand what I wanted. My baby was born, and looking at this tiny money-eater, I realized I was a father.

As the United States escalated sanctions against Huawei, 2019 came to an end, and the extraordinary year 2020 was about to begin.

## 2020

> I will write less about 2020. Some things may be better left forgotten.

### Working from Home

The COVID-19 pandemic hit hard at the start of the year and changed many things. Huawei's execution stood out: working from home did little to reduce productivity, and the company returned to work quickly. In March and April, Huawei reviewed the previous year's performance. I suspected my earlier concerns would prove true. Performance was tied to compensation, and Huawei was highly risk-conscious; the previous year's sanctions would lead the company to prepare for risk. Most colleagues liked my work, but I knew that might not matter to the reviewers. The result came out, and I was unhappy. The LM held an unusually long performance discussion with me, and I spoke frankly. The LM promised my compensation would not decrease; I will leave that comment there. Later, during a reorganization, a new team was formed and the LM called to offer me the lead role. I declined. I do not know whether that was right, but this was my reasoning:

1. **A promotion is not always a good thing; a higher role brings greater demands. A candidate should either have spare capacity in the current role or enough time and energy. I had neither. I lived far from home, and perhaps the LM was trying to compensate for my performance review.**
2. **Huawei would not collapse, I believed, but it would eventually contract strategically. It was unclear who would remain on the ship, and frontline employees could be the ones sacrificed.**
3. **I was 34.**

### Resigning

I had been thinking about what to do next and had begun to see a path. After receiving my annual bonus, I submitted my resignation in July. The department asked me to make one final contribution and kept me until October so I could be included in the first-half review. I ended up with a C—the worst rating of my career.

One more detail: what did I do in those final three months? Since March 2020, I had handled some recruiting for the department (Huawei employees know why people outside HR are asked to recruit; it is a trap, and I will say no more). Even as an employee about to leave, I kept recruiting. It was ridiculous, but I had also recruited at my previous job, so I knew the process. I reviewed about 50 resumes a day, carefully, because I did not want to overlook a strong candidate. It was slow work, but I learned a few things about how programmers should write resumes.

## Conclusion

That is my story of more than seven, nearly eight, years at work. Whatever happened in the past, I will keep working toward the future. If you found this useful, please recommend it so more people can read it and perhaps avoid some of my mistakes. Feel free to contact me (WeChat ID: `jingyewandeng`) to discuss careers or direction. I can also review your resume for free. Do not worry about bothering me; helping others is rewarding, and I learn from it too. Programmers should not be too shy.

<!-- @include: @article-footer.snippet.md -->
