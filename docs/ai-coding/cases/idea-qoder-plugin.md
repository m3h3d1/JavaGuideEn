---
title: IDEA + Qoder in Practice: API Optimization and Legacy Code Refactoring
description: Two practical examples of using the Qoder plugin in IDEA to optimize deep pagination and refactor legacy code, with a shift from implementing tasks to directing and reviewing the work.
category: AI Coding in Practice
head:
  - - meta
    - name: keywords
      content: Qoder,IDEA plugin,AI coding,AI-assisted development,code refactoring,deep pagination,JetBrains,intelligent coding
---

Hi, I'm Xiao G. If you rely on JetBrains IDEs, you may have faced this dilemma: you want AI assistance, but popular tools such as Cursor, Trae, and Qoder are mostly based on VS Code. Switching means giving up JetBrains' debugging and refactoring tools; staying put can feel like missing out on AI's productivity gains.

Some might ask: “Aren't terminal tools like Claude Code and Gemini CLI great?” They are, but CLI workflows have clear limitations: without a native UI, browsing code and reviewing diffs can be awkward. Open-source projects such as vibe kanban and 1Code can help, but complex projects still have their challenges.

Backend developers today roughly fall into four groups:

| Group                | Tool combination                                                  | Characteristics                                          |
| -------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| **CLI users**        | Claude Code/Gemini CLI/Codex                                      | Efficient terminal workflows, but limited UI interaction |
| **VS Code users**    | VS Code + plugins                                                 | Lightweight and flexible, with some feature limitations  |
| **Hybrid users**     | Write with a CLI or AI IDE (such as Cursor) → review in JetBrains | AI assistance with IDEA as a fallback                    |
| **All-in-one users** | **JetBrains + Qoder plugin**                                      | **Stay focused and work in one window**                  |

I currently use a hybrid setup, mainly Claude Code and IDEA with the Qoder plugin.

For projects with complex logic, the control IDEA provides can be reassuring.

This article looks at how IDEA and Qoder work in practice through two real scenarios and shares a few useful tips.

## Getting Started with the Qoder JetBrains Plugin

### Installation and Setup

**Step 1:** Open **Settings | Plugins**, search for **"qoder"**, select **Qoder - Agentic AI Coding Platform**, and install it.

![Plugin installation screen](../images/shared/plugin-install-interface.png)

**Step 2:** After installation, click **Sign In** to log in or create an account.

![Sign-in screen](../images/shared/login-interface.png)

**Step 3 (optional):** The interface is in English by default. To use Simplified Chinese, open **Plugin Settings** in the upper-right corner and set **Display Language** to Simplified Chinese.

![Language settings](../images/shared/language-settings-interface.png)

**Step 4 (optional):** Configure a database connection. Qoder supports the `@database` context, which can reference database schemas. It is best to configure the database used by your project in advance.

For MySQL, open the **Database** tool window on the right, click **+**, and select **Data Source | MySQL**:

![Add a data source](../images/shared/add-data-source.png)

Enter the connection details, test the connection, and click **OK**.

![Database configuration complete](../images/shared/database-config-complete.png)

This completes the initial setup.

### Task 1: Troubleshooting Deep Pagination Errors in Order Queries

#### Background

This is an e-commerce administration system. The operations team generates monthly business reports. With more than 10 million orders and limited development time, the code has several performance risks.

The operations team reported frequent errors when querying orders. The issue came from this endpoint:

```bash
curl -X POST http://localhost:8080/api/report/orders \
  -H "Content-Type: application/json" \
  -d '{"page": 1000000, "size": 10}'
```

This is a typical deep-pagination request. The endpoint logic is:

```java
@Transactional(readOnly = true)
public OrderListResponse getOrderList(OrderListRequest request) {
    int pageNum = request.getPage() == null ? 1 : request.getPage();
    int pageSize = request.getSize() == null ? 10 : request.getSize();

    // Core issue: deep pagination
    Page<Order> pageParam = new Page<>(pageNum, pageSize);

    LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
    if (request.getStatus() != null && !request.getStatus().isEmpty()) {
        wrapper.eq(Order::getStatus, request.getStatus());
    }
    if (request.getShopId() != null) {
        wrapper.eq(Order::getShopId, request.getShopId());
    }

    // The sort field may be unindexed, triggering a full table scan
    wrapper.orderByDesc(Order::getCreatedAt);

    // Deep pagination: LIMIT 9999990, 10
    IPage<Order> orderPage = orderMapper.selectPage(pageParam, wrapper);

    // Join to fetch user and store information...
}
```

When `page=1000000`, MySQL executes `LIMIT 9999990, 10`. It must scan and discard the first 10 million rows, causing a sharp performance drop.

#### Limitations of the Traditional Approach

The traditional endpoint-tuning workflow involves:

1. Read and understand the code.
2. Identify opportunities for optimization.
3. Analyze SQL execution plans alongside logs.
4. Propose and implement a solution.
5. Run regression tests and deploy.

Tracing an issue from the code and SQL execution plan through regression testing and deployment usually takes more than changing one line of SQL. The time required depends on familiarity with the project, data volume, and verification requirements.

#### Qoder's Approach: From Implementer to Reviewer

With Qoder, I spend more time breaking down the task, reviewing the proposed solution, and checking the results.

I organize my thoughts and give it a clear objective:

```bash
The order-list endpoint is timing out with `java.net.SocketTimeoutException: Read timed out`. Analyze the endpoint logic and database, then propose a solution.

Endpoint: POST http://localhost:8080/api/report/orders
Request parameters: {"page": 1000000, "size": 10}

Provide a solution that addresses:
1. Potential causes of the timeout in the endpoint logic.
2. Database issues, including indexes, query performance, and data volume.
3. Specific optimization steps.
```

To give Qoder more context, add the database:

1. Click **+Add Context**.
2. Select **@database**, then choose the relevant database schema.

![Add database context](../images/shared/add-database-context-1.png)

#### Analysis and Proposed Solutions

**Finding the code entry point and possible causes**

Qoder quickly found the code entry point and listed potential causes, including deep pagination and a missing index for sorting. Verify these findings against the slow query log and `EXPLAIN ANALYZE`:

![Code analysis results](../images/shared/code-analysis-result.png)

**A useful feature: joint code and database analysis**

Using the database schema, Qoder produced a combined analysis report. The `@database` context can provide table and index information, but it cannot replace production execution plans or real data distributions:

![Combined analysis report](../images/shared/comprehensive-analysis-report.png)

**Code-level optimization**

Qoder suggested three approaches, including deferred joins: the subquery returns only IDs and uses a covering index to find them quickly.

![Code optimization options](../images/shared/code-optimization-solution.png)

**An approach to consider carefully**

For the total row count, Qoder suggested an estimate based on the number of primary-key index pages and the average rows per page. This is suitable only when an approximate result is acceptable. Gaps, page fill factor, and data distribution can affect the estimate, so do not use it directly for accounting or settlement workflows that require exact counts:

![Database optimization suggestion](../images/shared/database-optimization-suggestion.png)

#### Implementation and Verification

After reviewing the options, I selected deferred joins and index optimization:

```bash
Based on the review, make these optimizations:
1. Refactor deep-pagination queries to use deferred joins.
2. Create optimized indexes based on the recommendations.
3. Write unit tests for core behavior and establish a performance baseline.
```

After Qoder implemented the changes, the `getOrderList` method had been updated to:

- Set and enforce a maximum page number based on the production issue.
- Use different strategies for pagination counts and list queries.

The screenshot shows clearer naming and method separation after refactoring. Confirm that the changes follow team standards with the project's static checks and code review:

![Refactored code](../images/shared/refactored-code.png)

The index script can be run directly from the IDE, so there is no need to switch windows:

![Running the index script](../images/shared/index-execution.png)

**Regression testing:** Qoder analyzed the code branches and generated unit tests for different scenarios:

![Unit tests](../images/shared/unit-test-1.png)

**Load testing:** Qoder generated load-test code with JIT warm-up. Warm-up reduces interference from cold starts and just-in-time compilation, but does not make a test representative of production. To evaluate the optimization, also record the hardware, JDK and GC, data distribution, cache state, concurrency model, sample size, and p95/p99 latency:

![Load test](../images/shared/stress-test.png)

Finally, Qoder produced a work summary with the technical approach and suggestions for communicating the results:

![Work summary](../images/shared/work-summary.png)

Click Qoder in the commit window to draft a commit message from the current diff. In this demo, generating the proposed changes took about 10 minutes from providing the context. Reviewing the plan, load testing, code review, and deployment verification were not included.

![Commit message](../images/shared/commit-message.png)

### Task 2: Understand and Refactor Legacy Refund Code

#### Background: Legacy Code No One Dares to Touch

The refund module's `applyRefund` method had **more than 150 lines, no comments, magic numbers, and duplicated logic**. A new risk-control rule was needed: **users with an unfinished order from the last 72 hours cannot request a refund**.

**Limitations of the traditional approach:**

- The logic is complex, so changing it feels risky.
- Adding a rule requires a full regression test.
- The effort to add characterization tests, refactor, and run regression tests depends on the project.

#### Understand the Logic: Let the Agent Read the Legacy Code

Qoder combines the model's context reasoning with the agent's planning and execution capabilities. It can inspect and refactor the business logic:

```bash
Explain the complete refund application flow with a simple data-flow diagram, and add relevant comments to the code.
```

To reduce the agent's guesses about the schema, provide the existing database schema as context. The schema adds database structure, but does not guarantee that the agent will understand the business rules correctly:

![Add database context](../images/shared/add-database-context-2.png)

Qoder started with a high-level overview, then worked through the code branch by branch and added comments:

![Logic analysis](../images/shared/logic-analysis-process.png)

The commented code is easier to read, but verify the comments and data flow against the original implementation, tests, and product rules:

![Example of commented code](../images/shared/commented-code-example.png)

After the task, Qoder summarized the endpoint logic and special rules:

![Summary](../images/shared/summary-conclusion.png)

#### Refactor the Code: Establish a Regression Baseline First

After understanding the logic, I gave it a second instruction to refactor the feature and run regression tests:

```bash
Refactor the refund application module systematically according to our coding standards and the techniques in *Refactoring: Improving the Design of Existing Code*. Before refactoring, add characterization tests for current behavior. Afterward, run unit tests, integration tests, and key feature tests covering identified business branches and edge cases. Report uncovered branches and behaviors that need human review. Do not treat code coverage as proof that the old and new implementations are equivalent.
```

Qoder then:

1. Inspected the target file and located the code to refactor.
2. Identified issues such as magic numbers, duplicate code, and overly long methods.
3. Refactored the code by introducing constants, extracting duplicate logic, modeling the domain, and separating responsibilities.
4. Added tests for regression coverage.

The resulting code is shown below. Qoder left the original `RefundService` unchanged and created `RefundServiceRefactored`, which allows the old and new implementations to be compared. However, creating a new class alone is not a “safe refactoring.” Define how traffic is routed, use a canary or feature flag, compare results for the same inputs, and set a retirement date for the old implementation. Otherwise, the two implementations may drift apart.

```java
/**
 * Refund application (refactored)
 */
@Transactional(rollbackFor = Exception.class)
public RefundResponse applyRefund(RefundApplyRequest request) {
    log.info("[Refund] Processing started: orderId={}, userId={}, amount={}",
            request.getOrderId(), request.getUserId(), request.getRefundAmount());

    // 1. Retrieve and validate the order
    Order order = getAndValidateOrder(request.getOrderId(), request.getUserId());

    // 2. Determine the refund type and process it
    if (request.getOrderItemId() != null) {
        return processPartialRefund(request, order);   // Partial refund
    } else {
        return processFullRefund(request, order);      // Full refund
    }
}

/**
 * Process a partial refund
 */
private RefundResponse processPartialRefund(RefundApplyRequest request, Order order) {
    log.info("[Refund] Processing partial refund: orderItemId={}", request.getOrderItemId());

    // Retrieve and validate the order item
    OrderItem orderItem = orderItemMapper.selectById(request.getOrderItemId());
    refundValidator.validateOrderItemBelongsToOrder(orderItem, order.getId());

    // Validate the refund quantity and amount
    Integer refundQuantity = getRefundQuantity(request.getQuantity());
    refundValidator.validateRefundQuantity(refundQuantity, orderItem.getRefundableQuantity());
    BigDecimal itemRefundableAmount = refundCalculator.calculateItemRefundableAmount(orderItem, refundQuantity);
    refundValidator.validateRefundAmount(request.getRefundAmount(), itemRefundableAmount);

    // Perform the risk check and create the refund record
    performRiskCheck(order, request.getRefundAmount(), request.getUserId());
    Refund refund = createRefundRecord(request, order, refundQuantity);

    log.info("[Refund] Partial refund succeeded: refundId={}", refund.getId());
    return RefundResponse.success(refund.getId());
}
```

**Refactoring highlights:**

| Improvement                | Description                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| **Method extraction**      | The main method is only 15 lines; partial and full refund logic are separated            |
| **Separation of concerns** | `refundValidator` and `refundCalculator` handle validation and calculation independently |
| **Clear comments**         | Each step is explained                                                                   |
| **Consistent logs**        | Key events are labeled for easier tracing                                                |
| **Exception handling**     | Transaction rollback is configured for checked exceptions                                |

The unit test report shows about 80% branch coverage. This indicates that some paths were executed, but does not prove that behavior is identical before and after refactoring. Critical paths involving amounts, state transitions, concurrent requests, and external dependency failures still need characterization tests, integration tests, or comparisons between the old and new implementations:

![Unit test verification](../images/shared/unit-test-verification.png)

#### Feature Iteration: Add a Rule with a Single Instruction

After refactoring and establishing the regression baseline, I found the risk-control method `validateRiskMaxAmount` and gave Qoder one final instruction:

```bash
Add a refund restriction to the risk-control system: if a user has any unfinished orders from the last 72 hours (three days), automatically reject their refund request.
```

The implementation is shown below. After documenting the existing logic, the validation framework has clear responsibilities and supporting unit tests, making future incremental changes easier to implement and verify:

![Feature implementation](../images/shared/feature-iteration-implementation.png)

#### Memory: Learning Your Coding Preferences Over Time

After the task, Qoder created project-specific memories. Memory is an official capability, but whether it helps later tasks depends on whether the information is saved and recalled correctly and whether it conflicts with the current state of the project:

- **Project-specific practices**: Prefer deferred joins over cursor pagination; pair endpoint optimization with performance testing.
- **Coding standards**: Follow the Alibaba Java Coding Guidelines; compare `BigDecimal` values with `compareTo`.
- **Business rules**: Refund risk controls, such as blocking refunds when an unfinished order exists within 72 hours and enforcing a per-transaction limit.

In this demo, the refund rules and coding conventions were added to the memory list. Review recalled information in later tasks and remove rules that are no longer valid:

![Saved memories](../images/shared/memory-accumulation.png)

## Qoder's Capabilities in This Example

The two examples above illustrate how Qoder can fit into a development workflow.

### 1. Project Awareness and Context

Qoder's ability to understand large projects:

- **Database schema awareness**: In Task 1, Qoder used the `@database` context to inspect the order table and existing indexes, then suggested candidate indexes. Whether to use them still depends on the full SQL, selectivity, and execution plan.

- **Code tracing**: In Task 2, Qoder used static analysis to map the flow through the long, uncommented refund code: order validation → amount calculation → risk checks → data persistence. It also identified code smells such as duplication and magic values.

- **Cross-file references**: Qoder can find related files, tracing dependencies from `RefundService` to components such as `OrderMapper` and `RefundValidator` without requiring each one to be added as context manually.

### 2. End-to-End Task Execution

Qoder does more than code completion. In these examples, it also helped analyze the code, make changes, and generate tests:

| Capability              | Observed behavior                                                 | What still needs human verification                                              |
| ----------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Project awareness**   | Analyzed database schemas and code dependencies                   | SQL execution plans, data distribution, and business rules                       |
| **Task execution**      | Helped with analysis, design, implementation, and test generation | Test quality, code review, and deployment verification                           |
| **Refactoring support** | Preserved the original and generated a new implementation         | Traffic routing, comparison of old and new behavior, and removal of the old code |
| **Project memory**      | Saved project conventions and some business rules                 | Whether memories are recalled accurately and remain valid                        |

### 3. Incremental Refactoring and Iteration

In Task 2, the original implementation was preserved and a new one was generated. This can be a starting point for a gradual migration.

- **Incremental refactoring**: Qoder left `RefundService` unchanged and created `RefundServiceRefactored`. This approach is useful only when accompanied by a migration plan:

  - Keep the original implementation for behavioral comparison.
  - Switch gradually using a feature flag or canary routing.
  - Remove the old implementation after verification to avoid maintaining duplicate logic indefinitely.

- **Separation of concerns**: Following the Single Responsibility Principle (SRP), Qoder extracted validation, amount calculation, and refund number generation into separate components:

  - `RefundValidator`: Centralized business validation.
  - `RefundCalculator`: Amount calculation.
  - `RefundNoGenerator`: Refund number generation.

- **Transaction boundaries**: `rollbackFor = Exception.class` takes effect only when the method is called through a Spring proxy, the exception is rethrown, and the resources participate in the same transaction. Self-invocation, swallowed exceptions, and cross-service operations need separate handling.

### 4. Memory and Continuous Learning

These memories may be recalled in later interactions. Keep authoritative business rules in reviewable, version-controlled project documentation; use Memory only as supplementary context.

## Summary

The Qoder JetBrains plugin offers backend developers another way to work: **keep using a familiar JetBrains IDE while applying an AI agent's reasoning and coding capabilities**.

Looking back at the two examples:

| Area         | How Qoder can help                            | Engineering work still required                            |
| ------------ | --------------------------------------------- | ---------------------------------------------------------- |
| **Analysis** | Search code and inspect schemas               | Check logs, execution plans, and business rules            |
| **Changes**  | Generate a candidate implementation and tests | Code review and comparison with the old behavior           |
| **Workflow** | Handle most interactions in IDEA              | Production-like load tests, canary rollout, and monitoring |
| **Memory**   | Save some project-specific context            | Version rules and remove outdated information              |

## Final Thoughts

Today's development environment is like building a structure. AI and new frameworks can put up the scaffolding quickly, and plugins like Qoder let you do much of the work in a familiar IDE without switching windows. But without a grounding in fundamentals and software architecture, you cannot ensure delivery quality, even if AI helps implement the features.

Consider what the two examples show:

- **Deferred joins in Task 1**: Understanding database indexes is necessary to judge whether Qoder's suggestion is appropriate.

- **Refactoring in Task 2**: Familiarity with SRP, DRY, and principles from _Refactoring: Improving the Design of Existing Code_ and the _Alibaba Java Coding Guidelines_ helps you evaluate Qoder's work.

- **JIT warm-up in performance benchmarks**: It addresses only some sources of interference. Results can still be misleading without understanding the JVM, data, and workload model.

- **Choosing and evaluating solutions**: You need to understand the business scenario and technical constraints. For example, choosing deferred joins over cursor pagination may be about user experience. AI cannot make that judgment for you.

Three suggestions for using Qoder on tasks like these:

1. **Keep learning the fundamentals**: Database indexes, the JVM memory model, and concurrency principles remain essential even with AI.

2. **Read established books**: _Refactoring_, _Design Patterns_, _High Performance MySQL_, and _Understanding the Java Virtual Machine_ can help you judge the quality of AI output.

3. **Develop architectural thinking**: Use the time you save to think about system architecture and the underlying business needs.

If you mainly use JetBrains IDEs, consider the Qoder plugin as an option. It reduces editor switching, but delivery quality still depends on planning, testing, review, and deployment verification.
