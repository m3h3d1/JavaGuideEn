---
title: "Kimi K3 in Practice: A Full-Stack App, Java Project Changes, and an AAA-Style Game Demo"
description: Three hands-on projects—a trend-tracking system, changes to an existing Java project, and a third-person action game demo—explore Kimi K3's performance on long-running agent tasks, multimodal input, and complex engineering work.
category: AI Coding in Practice
head:
  - - meta
    - name: keywords
      content: Kimi K3,Kimi Code,AI coding,Agent coding,full-stack development,Java project changes,multimodal,long-running tasks,game development
---

Hi, I'm Xiao G. Kimi K3 was officially released last Friday.

The question I've heard most over the past few days is: How capable is K3, and how does it feel to code with?

Many developers in China and elsewhere have compared K3 with leading coding models and reported good results. Its subscriptions and usage have also surged over the past few days, putting pressure on compute capacity.

I am more interested in how it performs on real projects. That is the most practical test.

For this article, I prepared three representative cases: a full-stack project, changes to an existing Java project, and a game demo built from scratch.

K3 offers **2.8T parameters, a 1M-token context window, native multimodal support, and architecture optimizations for long-running agent coding.**

The goal is to help an Agent keep reading code, inspecting screenshots, using tools, and fixing issues over longer tasks.

![Official Kimi K3 announcement](../images/shared/k3-official-announcement.png)

As usual, I will start with setup, then look at how it performs on several engineering tasks, and finish with the main changes in K3.

## Set Up Kimi K3

K3 supports most popular coding agents and general-purpose agent frameworks, including Claude Code, Roo Code, OpenCode, OMP, OpenClaw, and Hermes.

I will demonstrate the shortest setup using Kimi's official Kimi Code CLI. If you already use Claude Code, Roo Code, OpenCode, or CC Switch, you can keep your existing toolchain.

### Set Up Kimi Code CLI

This is Kimi's official terminal-based coding agent, similar to Claude Code.

After installation, run `kimi` in the project directory. It can read and edit code, run commands, explain errors, and draft commit messages.

Install on macOS or Linux with:

```bash
curl -fsSL https://code.kimi.com/kimi-code/install.sh | bash
```

In Windows PowerShell, run:

```powershell
irm https://code.kimi.com/kimi-code/install.ps1 | iex
```

After installation, check the version with `kimi --version`:

![Kimi Code CLI installed and version checked](../images/shared/k3-kimi-cli-install.png)

Next, switch to the project you want to test and run:

```bash
kimi
```

The first launch prompts you to sign in to your Kimi account. In Kimi Code CLI, enter `/model` and select `k3`.

![Select k3 from the model list after running kimi -y](../images/shared/k3-kimi-y-model-list.png)

Before using it on a real task, I usually start with a small read-only test:

```text
Read the current project's directory structure and core code, then explain each module's responsibilities. Do not modify files or run commands with side effects.
```

![Kimi reads the Java project's directory structure and core code](../images/shared/k3-case2-read-java-project.png)

### Keep Using Your Existing Coding Agent

If you are already comfortable with Claude Code, Roo Code, or OpenCode, there is no need to rebuild your workflow for K3. Create a Kimi Code API key and connect K3 through a compatible API.

General-purpose agent frameworks such as OpenClaw and Hermes can also call Kimi Code. K3 handles model inference; the surrounding agent framework still manages file access, tool calls, and permissions.

For example, in CC Switch, select Kimi For Coding when adding a provider:

![Select Kimi For Coding when adding a provider](../images/shared/k3-provider-select.png)

Enter the API key and endpoint URL. The default API format is fine:

![Configure the Kimi For Coding API key and endpoint URL](../images/shared/k3-provider-config.png)

Retrieve the model list and map the model roles to `k3`:

![Select k3 in the Kimi For Coding model mapping](../images/shared/k3-provider-model-mapping.png)

No additional routing configuration is needed:

![Select Kimi For Coding directly in CC Switch](../images/shared/k3-cc-switch-direct-provider.png)

Here is a test:

![Claude Code connected to Kimi](../images/shared/k3-claude-code-read-project.png)

## Case 1: Build a Trend-Tracking System

For the first case, I asked K3 to build a **trend-tracking system** called **HotPulse**.

I did not ask it to build only an attractive frontend. The UI matters, but I also wanted to see whether it could connect the backend, database, queue, tests, and error recovery.

The acceptance target was a working MVP: users create keyword monitors; the system fetches Hacker News or RSS on a schedule or on demand; raw content becomes an Observation, the analyze stage produces an Entry, and the Notify stage delivers it. The frontend should show the feed, monitor runs, and delivery status, and support reading, bookmarking, and archiving.

I specified several constraints in the system design: use Hono, SQLite, and Drizzle on the backend; React 19, React Router, TanStack Query, and Socket.IO on the frontend. Tests must not depend on the public internet. Use a fake webhook server for notifications and a temporary SQLite database.

Use `kimi -y` to skip manual approval for file writes and command execution.

I used the `/goal` command to run the task. To evaluate the model's ability to handle long tasks, I did not enable any Skills or project-specific extensions.

![Run the HotPulse task with goal in Kimi Code CLI](../images/shared/k3-hotpulse-goal-active.png)

One detail: the screenshot shows more than eight hours, but that does not mean the model worked continuously for that long. I started around midnight, left it when it got stuck, then resumed in the morning. The effective working time was about an hour.

### It Got the Backend Flow Working First

K3 followed a steady implementation order: it started with shared contracts, Zod schemas, and unit tests, then added server configuration, the database, queues, and domain services. Finally, it connected fetching, analysis, notifications, scheduling, background workers, and maintenance tasks.

It did not all go smoothly. K3 ran TypeScript checks and tests, then went back to fix helpers, handlers, and tests when it found errors.

![Kimi fixes server tests and TypeScript errors](../images/shared/k3-hotpulse-server-tests.png)

### It Started the Frontend After the Backend Passed

The server tests first reached `94/94` passing, and then K3 moved on to the client.

![K3 starts the frontend SPA after the server tests pass](../images/shared/k3-hotpulse-client-stage.png)

The frontend added Monitor, Feed, Targets, Deliveries, and System pages.

Here is the final delivery report for the HotPulse MVP:

![Final HotPulse MVP delivery report](../images/shared/k3-hotpulse-goal-complete.png)

The delivered features largely met the MVP acceptance criteria.

The first version worked, but was rough and still felt like an MVP.

The Monitor editor lets users configure the name, keywords, run interval, enabled status, and sources:

![HotPulse Monitor editor](../images/shared/k3-hotpulse-monitor-edit.png)

The Feed page displays fetched and analyzed entries and can filter by status, monitor, sort order, and bookmarks:

![HotPulse Feed page](../images/shared/k3-hotpulse-feed.png)

### Further Improvements

I then asked Kimi to make several more rounds of improvements.

![Final report after further HotPulse MVP improvements](../images/shared/k3-hotpulse-optimization-report.png)

This round moved the first version from merely usable toward a more polished product. It added a default home page, onboarding, feedback for manual runs, pending button states, duplicate-submission prevention, toast notifications, delete confirmations, and more consistent copy.

I also asked it to add **support for multiple sources**.

This went beyond UI improvements. HotPulse no longer handles only Hacker News and RSS; it now connects RSS, webpages, GitHub, and Twitter to the same scrape → analyze → notify pipeline.

![HotPulse V1.1 multiple-source support completed and verified](../images/shared/k3-hotpulse-v11-multisource-complete.png)

The interesting part was not just adding more fetchers. K3 unified the sources through a `source_items` intermediate layer, used `(monitorId, externalId)` as a unique key, and used `contentFingerprint` to detect content changes.

A real monitoring system must stay stable when a source goes down, a page structure changes, or an API slows down. It should degrade gracefully, keep running, and expose where the problem occurred.

The current result is close to a product.

Demo video: <https://www.zhihu.com/pin/2062834508802569097>

The most valuable part of this case is that **K3 stayed focused on a long task: reading requirements, breaking down modules, changing code, running tests, fixing errors, and delivering a verifiable result.**

## Case 2: Improve an Existing Project

For the second case, I chose two small tasks that fix issues or add features to an existing project.

These tasks differ from the full-stack MVP. The Agent must first understand the existing code, then trace the observed behavior through call chains, data sources, and implementation details. This is closer to everyday coding-agent work: reproduce an issue, find its cause, make the smallest necessary change, and verify it.

The examples use a multi-agent stock analysis project from the membership community. Its tutorial is still being expanded and refined.

The first task is to fix garbled text in stock search results.

### Fix Garbled Text in Stock Search

The issue is easy to spot: Chinese stock names in the search results are garbled, while the stock codes remain readable.

![Garbled stock search results](../images/shared/k3-case2-stock-garbled-before.png)

I gave K3 the screenshot and described the issue. It traced the search entry point to `marketDataService.searchStock`, then followed the data-source fallback logic.

The problem was in the `HttpBodyFetcher` / `HttpUtils` path. Sina's `suggest3.sinajs.cn` search API and `hq.sinajs.cn` market data API return GBK-encoded data, but the project's `SinaDataSource` used `HttpUtils.get`, which always decoded responses as UTF-8. That corrupted the Chinese names.

The fix was to decode Sina data as GBK and add a request method that supports the `Referer` header.

![Kimi finds and fixes garbled stock search results](../images/shared/k3-case2-stock-garbled-fixed.png)

After the fix, K3 ran `mvn -pl stock-crawler -am install`, restarted the backend, and tested `GET /api/market/search?keyword=%E5%BC%80`. The response contained readable Chinese stock names such as Shenkai Co., Ltd., Kaili Medical, Jingwei Huikai, Kaikai B-shares, and Kaifa Technology.

This was a small task, but it revealed more about the model's engineering habits than “write a utility class.” It traced the issue from the entry point through the data source and HTTP decoding utility to the external API encoding, without changing unrelated modules.

### Build a Portfolio Performance Dashboard

The second task was to add a **portfolio performance dashboard** to the stock project.

It uses each watchlist stock's cost basis, position size, and current market price to calculate total market value, unrealized profit and loss, today's profit and loss, largest position, and other metrics. Its styling should match the existing application.

![K3 receives the portfolio dashboard task](../images/shared/k3-case2-portfolio-task.png)

The request sounds like a single page, but requires backend calculations, API layers, frontend components, and tests.

K3 first read the watchlist fields, market data API, and existing architecture. It used `BigDecimal` for monetary calculations and degraded the display for an individual stock when market data was missing, instead of letting one error break the entire page.

![K3 completes the portfolio dashboard and reports verification results](../images/shared/k3-case2-portfolio-complete.png)

The result was a working dashboard with summary cards for total market value, total cost, and unrealized profit and loss, plus each stock's cost, current price, position, and return. It also added the backend API, frontend route, and tests.

![Final portfolio performance dashboard](../images/shared/k3-case2-portfolio-dashboard.png)

At this point, it was usable.

But I realized that real projects involve more than whether the page exists. Metrics must use consistent definitions, errors must be handled, and indicators should support further analysis.

So I asked K3 to create a V2 based on the dashboard.

This version refined the business calculations and added risk metrics. It fixed inconsistent totals when some market data was unavailable and added return contribution rankings, the share of the three largest holdings, HHI concentration, annualized volatility, and maximum drawdown.

![K3 continues work on portfolio dashboard V2](../images/shared/k3-case2-portfolio-v2-task.png)

One thing I found interesting was that it did not simply add fields to the frontend. It first checked the backend candlestick service, aligned trading dates, determined how to handle suspended stocks and insufficient data, and moved the calculations into a separate `PortfolioRiskCalculator`.

That is a sensible engineering workflow.

![K3 completes and verifies portfolio dashboard V2](../images/shared/k3-case2-portfolio-v2-complete.png)

The V2 page keeps the original position details and adds return contributions and a risk overview below them.

The contribution section shows which stocks drive portfolio gains and losses. The risk overview includes annualized volatility, maximum drawdown, VaR, HHI concentration, and the share of the three largest holdings.

![Portfolio performance dashboard V2](../images/shared/k3-case2-portfolio-v2-dashboard.png)

In this case, it worked within the existing project's constraints to connect the full flow: reuse the available data, add calculations and APIs, then run tests and check the page. More importantly, it traced the business definitions during the second round of improvements, moving beyond displaying data to making its calculations more consistent.

Afterward, I used GPT 5.6 Sol to review the code. I found no issues with the overall implementation or code quality, and considered it ready to submit.

## Case 3: Build an AAA-Style Game Demo from Scratch

I initially hesitated over the third case.

I already had a full-stack project and changes to an existing Java project. Another ordinary bug fix would have been repetitive.

So I chose something more visual.

Game development.

This is a different kind of task. Business systems involve layers, APIs, tests, and data definitions. Games require a different set of capabilities: visuals, physics, input feel, camera, combat feedback, audio, UI, performance, and, above all, whether the game is actually playable.

K3's game development results were surprising.

I saw similar feedback in online communities. Some people said K3 could make impressive mini-games from a one-line prompt, and even used it to recreate a Minecraft-style 3D demo.

![Community feedback on K3's game development capabilities](../images/shared/k3-game-community-feedback.png)

I thought, all right, I should try it myself instead of just watching others.

So I gave it a try.

My prompt was simple: build an AAA-style third-person sci-fi action game demo from scratch in the current empty directory. Set it in an abandoned industrial facility of the future. The player must enter the facility, defeat enemies, retrieve an energy core, fight a mechanical boss, and escape.

For the technology stack, I specified Vite, TypeScript, Three.js, and Rapier. Do not write a physics engine; use Rapier for movement, collisions, and gravity. The game must include movement, running, dodging, aiming, shooting, taking damage, death and restart, regular and elite enemies, a multi-phase boss, a complete mission loop, PBR materials, dynamic lighting, shadows, fog, particles, bloom, hit feedback, and camera shake.

![Prompt K3 to build an AAA-style third-person action game demo from scratch](../images/shared/k3-game-steel-haven-prompt.jpg)

To be honest, I did not have high expectations when I wrote the prompt.

Games are not ordinary web pages.

A slightly misaligned button on a web page may go unnoticed. But in a game, players immediately notice if the camera, collisions, shooting, enemy AI, boss phases, effects, or sound are off.

K3 first produced the game design and technical plan. The project was called _STEEL HAVEN_. Its mission loop includes landing, breaching the facility gate, fighting an elite guard in the central courtyard, retrieving the energy core, awakening the WARDEN-9 boss, completing a three-phase boss fight, holding the extraction point, and restarting from a checkpoint after death.

![Game design and directory structure from K3](../images/shared/k3-game-steel-haven-design.jpg)

Then it started building the project.

The first delivery was already well beyond “put a few blocks on screen and call it a game.”

It implemented a complete gameplay loop: third-person controls, WASD movement, Shift to run, Space to dodge, right-click to aim, left-click to shoot, R to reload, E to interact, regular and elite enemies, a three-phase boss, mission objectives, a boss health bar, death and restart, and a victory screen. It also included PBR materials, environment reflections, shadows, fog, bloom, muzzle flashes, explosion particles, hit markers, and screen shake.

![STEEL HAVEN first delivery report](../images/shared/k3-game-steel-haven-report-v1.jpg)

The first version still had issues.

K3's delivery report listed several known issues: there was no jump action, the boss could briefly occlude itself when facing the player, and the build was large. More importantly, after playing it myself, I could tell that the shooting feel needed more work.

That led to the second round.

I asked it to improve shooting and combat without rebuilding the game. It inspected screenshots and code, then listed seven issues affecting the feel: the left hand did not support the weapon, the muzzle and crosshair were misaligned, the character blocked the view while aiming, the body obscured muzzle flashes, sustained fire did not match the weapon spread, hit feedback lacked variety, and reload audio did not match the animation.

It then changed the Player, PlayerController, CameraRig, Weapon, Game, Physics, AudioManager, HUD, and enemy modules.

![K3's second round of improvements to shooting and combat](../images/shared/k3-game-steel-haven-report-v2.jpg)

The changes made the game feel more polished.

While aiming, the character moves from the center to the lower right, leaving a clearer view around the crosshair. Firing adds weapon recoil and camera kick; sustained fire increases spread. Reloading now has separate motions for lowering and tilting the weapon, ejecting and inserting the magazine, and pulling the charging handle. Hits, critical hits, and kills have distinct markers and sounds. Wall sparks now follow the surface normal rather than appearing as hard-coded decals.

Demo video: <https://www.zhihu.com/pin/2062833196090275836>

Why include this case?

It demonstrates K3's multimodal and long-running agent capabilities.

In the first round, it had to turn a brief request into gameplay, levels, enemies, a boss, physics, visuals, audio, UI, and tests. In the second, it used screenshots and playtesting feedback to improve the feel, moving from “playable” toward “more like a game.”

This is more than generating a frontend page.

It involves translating subjective experiences into implementation details.

The feel of shooting is difficult to define in a unit test. Whether the character blocks the crosshair, firing feels responsive, hits provide feedback, reloading has a rhythm, and a boss fight feels tense all require visual inspection and playtesting.

This suggests K3 can do more than business coding; it can also handle broader creative engineering tasks. With clear goals and acceptance criteria, it can go from game design to a playable browser demo and then make another round of improvements based on feedback.

That exceeded my expectations.

## Highlights of the K3 Update

K3 ranks in the top tier on several coding benchmarks and is first on some of them. Its results are particularly strong on tests closer to everyday development and long-running tasks, such as Terminal Bench, Program Bench, and SWE Marathon.

![Kimi K3 coding benchmark comparison](../images/shared/k3-coding-benchmarks.png)

Of course, benchmarks are only a reference.

Real projects are more complex. As tasks run longer, requirements, code, logs, and test output all accumulate in the context.

A 1M-token context window can help keep more requirements, code, and terminal output available, so earlier details are less likely to disappear after several rounds.

However, a 1M-token window only increases capacity; it does not guarantee that the model uses context well. K3 also introduces Kimi Delta Attention and Attention Residuals. The release claims up to 6.3× faster decoding with million-token contexts and about a 25% improvement in training efficiency at less than 2% additional cost.

The short version is: **K3 is more reliable on long-running tasks.**

The Agent and multimodal results are also notable. K3 ranks in the top tier on general agent, spreadsheet, and browser tasks, and first on some. Its visual task results are competitive as well, making for a balanced showing overall.

![Kimi K3 General Agents and Visual Agents benchmark comparison](../images/shared/k3-agent-visual-benchmarks.png)

Most developers ultimately care about three things: **quality, cost, and speed.**

K3 felt fast, and its price is relatively low compared with similar models. It is close to Sonnet's price while, in my experience, offering an Opus-level experience on complex tasks. Its value for money is strong.

**⭐️ Recommended reading:**

- [Backend Development and Interview Guide](https://javaguide.cn/home.html): Java, computer science fundamentals, databases, frameworks, system design, and backend interviews.
- [AI Application Development and Interview Guide](https://javaguide.cn/ai/): LLMs, RAG, Agents, MCP, prompting, evaluation, system design, and AI application interviews.
- [AI Coding in Practice](https://javaguide.cn/ai-coding/): Tools such as Claude Code, Cursor, Codex, and Trae, plus interview topics.

## Summary

These cases provide a more concrete view of K3's capabilities than parameters and benchmark rankings alone.

Kimi has long been among the strongest models for frontend work. The K3 release broadens its capabilities further.

In the full-stack MVP, `/goal` helped move a long-running task forward. In the existing project, K3 traced issues through the entry point, service layer, data source, and utility classes. In the game demo, it connected gameplay, physics, camera, shooting feel, and feedback systems.

I would use it for tasks with clear goals and acceptance criteria where it can run commands and make fixes over time. Building an MVP, fixing a cross-module bug, or creating a playable interactive demo reveals more about a coding agent than generating a page alone.

What impressed me was K3's ability to stay on track in long tasks. The results were strong, and these cases had few bugs after completion.

If its price, speed, and availability remain stable, K3 could be a competitive top-tier model in both capability and value.

I will not claim that it “beats” or “crushes” another model.

The practical questions are simple: Can it finish the task, fix errors, pass code review, and remain affordable for everyday use?

K3 has drawn a lot of discussion in China, including negative reviews. My advice is not to follow either the praise or the criticism blindly. Try it on a real project and judge it from your own experience.
