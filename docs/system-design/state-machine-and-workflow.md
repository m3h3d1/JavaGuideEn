---
title: "State Machines and Workflow Orchestration: Design Choices, Parallel Tasks, and Reliable Execution"
description: How state machines and workflow orchestration differ, with conditional transitions, parallel joins, workflow versions, idempotent tasks, retries, compensation, and the cost of building an engine.
category: System Design
tag:
  - System Design
  - State Machines
  - Workflows
head:
  - - meta
    - name: keywords
      content: state machines,FSM,workflow orchestration,workflow engine,parallel gateways,idempotent tasks,workflow versions,failure compensation
---

Business processes such as order payments, after-sales reviews, and product inspections need to answer two questions: What state is the process in, and what can happen next? When a process also includes multiple tasks, conditional branches, and asynchronous waits, we need to know which tasks have completed and which can run next.

**A state machine describes rules for changing states; workflow orchestration organizes tasks and their dependencies.** They can work together: a workflow engine schedules tasks, and a state machine within each task constrains transitions such as pending, running, succeeded, and failed.

## What Problems Do State Machines Solve?

A typical business state machine has these elements:

| Element    | Purpose                                          | After-sales request example                                        |
| ---------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| State      | Describes the current business stage             | Pending review, pending refund, refunded, rejected                 |
| Event      | Triggers a state change                          | Review approved, review rejected, refund succeeded                 |
| Transition | Defines an allowed path between states           | On approval, a request moves from pending review to pending refund |
| Guard      | Checks whether a transition is currently allowed | The review record is complete and the refund amount is valid       |
| Action     | Operation performed during a transition          | Save the review result and create a refund task                    |

This brings state checks scattered across multiple APIs into a single set of rules. For example, if an already-refunded request receives another “review approved” event, it must not create another refund.

However, **a state diagram does not provide concurrency control**. Two requests may read “pending review” at the same time, then one tries to approve while the other tries to reject. Use conditional updates, version numbers, or transactional locks to ensure they compete for the same transition, and check the update result. Idempotency records for events must also be reliably coordinated with the business state change.

State machines are not limited to linear execution. Conditional transitions represent branches; hierarchical state machines represent nested states; some frameworks also support parallel regions, forks, and joins. For example, [Spring Statemachine](https://docs.spring.io/spring-statemachine/docs/current/reference/) provides guards, regions, forks, and joins. Evaluate the capabilities and maintenance costs of the implementation you use; don't treat a limitation of one simple implementation as a limitation of all state machines.

## When Do You Need Workflow Orchestration?

Suppose a product must pass both a “functional inspection” and a “photo capture” before it can be put into inventory. If you represent every combination in a single status field, you get states such as “inspection complete but photos missing” and “photos complete but inspection missing.” As more tasks are added, this becomes increasingly difficult to maintain.

Instead, track the product's overall status separately from the progress of its inspection, photo, and rework tasks. Let an orchestrator decide when each task is ready to run.

| Business characteristics                                | Possible approach                                      | Capabilities to verify                                        |
| ------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| Few states and stable transition rules                  | State machine or centrally maintained transition table | Concurrent updates, event deduplication, state persistence    |
| Fixed steps within a single request                     | Regular code, a chain of responsibility, or a pipeline | Error propagation, timeouts, step dependencies                |
| Long-running tasks across requests or services          | Persistent workflow orchestration                      | Resuming execution, asynchronous waits, retries, compensation |
| Human reviews, timeout escalation, visual configuration | Workflow engine with the required capabilities         | Task assignment, permissions, history, version migration      |

Calling something “workflow orchestration” does not guarantee reliable execution. Some components only control in-process call order and don't persist progress. Validate recovery after restart, parallel branches, retry behavior, and human intervention with a real workflow instead of comparing only the number of supported node types.

## Separate Workflow Definitions from Execution Instances

A configurable workflow should distinguish at least the following information; each item does not necessarily need its own database table:

- **Node template:** Describes the input, output, and execution capabilities of a type of task, such as image validation.
- **Workflow definition:** Describes nodes, dependencies, branch rules, timeouts, and retry policies, with an explicit version.
- **Workflow instance:** Represents one execution for a business record and is bound to the definition version chosen when it started.
- **Node or task instance:** Records the specific task, inputs, outputs, status, and attempt count for this execution. If a node can run in a loop, distinguish its iterations.
- **Events and execution records:** Record the trigger source, outcome, and errors to support deduplication, recovery, and troubleshooting.

Published workflow definitions should be immutable; changes should be published as a new version. Existing instances can continue with their old version. If you migrate them, explicitly define the current-node mapping, variable conversion, and any business side effects that have already occurred. Merely changing an instance's version number may leave an in-progress task pointing to a node that is missing or incompatible.

## How Should Parallel Branches Join?

Suppose both an inspection and photo capture must finish before a product is placed into inventory. The orchestrator cannot simply continue “after receiving two completion messages,” because both messages might be duplicate notifications for the same task.

Design the join as follows:

1. When creating the branches for this iteration, record the inspection task ID and photo task ID that must complete.
2. When a completion event arrives, update its task idempotently. Duplicate events must not increase the completion count.
3. Serialize the join-condition check and workflow advance. For example, lock the join record in a transaction and then check completion. Once every required task succeeds, use a unique constraint to ensure that the inventory task is created only once. With optimistic locking, the losing request must retry the check; it must not simply drop the event.
4. Define what happens on failure, cancellation, timeout, and rework. Don't wait forever or count an inspection result from a previous iteration toward the current one.

A unique constraint can prevent duplicate follow-up tasks, but it can't guarantee that the workflow advances. Two concurrent transactions may each fail to see the other's just-completed task and conclude that the condition is not yet met. You also need consistent concurrency control for the join and a way to recheck it after interruption, such as redelivering events or scanning for work to resume.

Distinguish conditional branches from parallel branches. An exclusive branch follows only the selected path and must not wait for unselected branches. A parallel branch waits for all required paths. Check the engine's semantics for gateways; see [Camunda's workflow patterns](https://docs.camunda.io/docs/components/concepts/workflow-patterns/).

## Why Do Retries Still Require Idempotency?

When a remote call times out, the other service may not have processed it—or it may have succeeded and only the response was lost. Therefore, when the orchestrator retries a task, the executor must prevent duplicate charges, shipments, or business records.

For example, [Camunda's Job Worker documentation](https://docs.camunda.io/docs/components/concepts/job-workers/) explains that timeouts may cause multiple workers to handle the same job. Job code must support idempotency.

Account for these cases when designing reliable execution:

- **Use a stable idempotency key for each business operation.** Retries should reuse the operation ID. A valid operation in the next iteration should get a new ID; don't deduplicate by node name alone.
- **Reliably coordinate completion with follow-up scheduling.** If you save “complete” and then publish to a message queue, the process may stop before sending the message. Save the task status and an event to publish in the same local transaction, then publish asynchronously; consumers should deduplicate by event ID.
- **Distinguish business rejection from transient failure.** Invalid parameters or a rejected review should usually follow a business branch. Network failures can be retried a limited number of times with backoff; after that, record an exception that can be inspected and handled.
- **Design compensation around the business.** A completed external action cannot necessarily be undone by rolling back a database transaction. Compensation actions—such as issuing a refund, releasing a reservation, or canceling an appointment—can also fail and need idempotency, retries, and a manual handling path.

A workflow engine manages execution progress, but does not automatically turn multiple business systems into one atomic transaction. For cross-service consistency, see [Distributed Transactions](../distributed-system/distributed-transaction.md).

## What Should You Evaluate Before Building an Engine?

Separating workflow configuration, scheduling, and node execution makes it easier to change business rules and task implementations independently. But a usable workflow engine also has to manage progress, recover from failures, and maintain version compatibility. These capabilities are often harder to maintain than the calls between nodes.

Before building one, make sure someone can maintain the following—not just node scheduling:

- Validate workflows before publishing: detect unreachable nodes, missing exits, conflicting branches, endless loops, and invalid inputs or outputs.
- Persist progress, resume interrupted tasks, limit concurrency, and handle backlogs.
- Manage compatibility among workflow versions, executor versions, and in-flight instances.
- Limit the power and resource usage of configuration expressions, and retain publication, rollback, and operation records.
- Show where an instance is stuck, why it failed, whether it can be retried, and who handled it manually.

If most of the complexity comes from a few business-specific differences, first extract the rules and task interfaces, then add orchestration capabilities gradually. Decide whether to adopt an existing engine or build your own based on workflow requirements, migration costs, failure-recovery capabilities, and benchmark results under comparable conditions.

<!-- @include: @article-footer.snippet.md -->
