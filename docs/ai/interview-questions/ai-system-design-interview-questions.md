---
title: AI System-Design Interview Questions
description: Common AI system-design interview questions covering production architecture, model gateways, prompt management, RAG, memory, tool calling, observability, evaluation, security, and real-time voice agents, with links to detailed guides.
category: AI
tag:
  - AI System Design
  - AI Interviews
  - LLM Applications
head:
  - - meta
    - name: keywords
      content: AI system-design interview questions,AI application architecture interviews,LLM application system design,LLM gateway interview questions,AI observability interviews,AI evaluation interviews,voice agent interviews,AI security interviews
---

AI system-design questions often begin with a concrete scenario, such as an enterprise knowledge base, customer-service system, agent platform, or real-time voice assistant. Follow-up questions explore how model calls, context, retrieval, tools, security, cost, and evaluation fit into one production workflow.

The questions are grouped by topic in JavaGuide's AI system-design section. Each group links to a detailed guide; this page collects common questions, while specific solutions and implementation details remain in those guides.

## Production AI Application Architecture

Related guide: [AI Application System Design: From Prompt Demo to Production Architecture](../system-design/ai-application-architecture.md)

Architecture questions start with the full request path, then examine each component's responsibilities and when to use synchronous, streaming, or asynchronous processing. Prompts, RAG, memory, and tools should be discussed in the parts of the workflow they serve.

Common interview questions:

- What engineering work is needed to move from a prompt demo to a production system?
- How would you design the overall architecture of a production AI application?
- Which components does an AI request pass through, from entry to response?
- What are the responsibilities of the ingress, orchestration, prompt/context, RAG/memory/tool, model gateway, and evaluation/observability layers?
- Which scenarios suit synchronous responses, streaming responses, and asynchronous tasks?
- Why should prompts be versioned? How should templates, variables, and model versions be associated?
- What information do RAG, memory, and tools manage, and why should they be governed separately?
- How should the intermediate state of a long-running task be saved and recovered after a service restart?
- What data should be recorded at minimum to support request replay?

## Model Gateways and Call Management

Related guides: [LLM Gateways: Unified Access, Model Routing, Rate Limits, Quotas, and Cost Management](../system-design/llm-gateway.md) and [Engineering LLM API Calls: Streaming, Retries, Rate Limiting, and Structured Output](../llm-basis/llm-api-engineering.md)

Gateway questions focus on multi-provider integration, model routing, and failure handling. Rate limiting involves more than request counts; it can also account for tokens, concurrency, tenant budgets, and provider quotas.

Common interview questions:

- Why is an LLM Gateway needed in production, and what problems arise when business services call model APIs directly?
- How does an LLM Gateway differ from an LLM Router?
- What capabilities does a model gateway typically provide?
- How should request parameters, response formats, and error codes from multiple model providers be normalized?
- What information can guide model routing, and how can requests be kept away from unsuitable models?
- Why should LLM rate limiting consider RPM, TPM, concurrency, and tenant budgets?
- Which model-call errors are retryable, and which should fail immediately?
- How should model fallbacks be designed, and which tasks should not be downgraded automatically?
- How should Token costs be attributed to tenants, users, features, models, and prompt versions?
- How much latency does a model gateway add, and which operations belong there?
- Which requests suit semantic caching, and how should data freshness and authorization be handled?
- How would you divide a production LLM Gateway into modules?

## Security, Authorization, and Auditing

Related guides: [LLM and Agent Security in Practice: Prompt Injection, Tool Privilege Escalation, and Sandboxing](../system-design/llm-security.md), [AI Application System Design: From Prompt Demo to Production Architecture](../system-design/ai-application-architecture.md), and [Structured Output for LLMs: From JSON Contracts to Function Calling](../llm-basis/structured-output-function-calling.md)

The model can generate tool-call intents and parameters, but the backend still performs the business operation. Follow-up questions examine where identity, resources, parameters, operation risks, and audit records should be validated.

Common interview questions:

- Where is the security boundary for tool calling?
- Why can tool descriptions and prompts not replace backend authorization checks?
- Why do high-risk tool calls require a second confirmation?
- How should write operations handle idempotency, timeouts, and uncertain outcomes?
- How can prompt injection be defended against at the system-design level?
- How can RAG retrieval prevent returning content the current user is not authorized to view?
- Should PII masking happen at input, logging, model-call, or output stages?
- Which fields should tool-call audit logs record?
- Why should structured parameters not be executed directly even after passing Schema validation?

## Observability, Evaluation, and Release

Related guides: [AI Application Evaluation: From Golden Sets to Online Canary Feedback](../llm-basis/llm-evaluation.md) and [AI Application System Design: From Prompt Demo to Production Architecture](../system-design/ai-application-architecture.md)

AI application release checks must cover answer quality, retrieval results, tool traces, and structured output, in addition to whether the API succeeds. Changes to models, prompts, retrieval settings, and code must be comparable and reversible.

Common interview questions:

- Which observability metrics should an AI application include?
- Why is it difficult to tell whether a change helped without an evaluation set?
- How should a Golden Set cover normal paths, edge cases, adversarial examples, and high-risk failures?
- What problems do offline evaluation, trace replay, and online canary releases each address?
- Why should RAG, agents, and structured output use different evaluation metrics?
- What biases can LLM-as-Judge have, and how can human sampling and rule-based checks calibrate it?
- How can AI evaluation in CI control cost and runtime?
- Why should evaluation records be tied to model, prompt, retrieval configuration, and code versions?
- When production quality declines, how can model, prompt, retrieval, tool, and data-distribution issues be distinguished?
- How should an AI application handle canary releases, rollback, and feedback from failed cases?

## Real-Time Voice Agents

Related guide: [AI Voice Technology: Engineering Real-Time Voice Agents with ASR and TTS](../system-design/ai-voice.md)

Real-time voice systems connect audio capture, VAD, ASR, LLMs, tool calls, TTS, and playback. Questions focus on end-to-end latency, interruptions, state management, and choosing between cloud and edge processing.

Common interview questions:

- How would you design a real-time voice agent?
- What roles do ASR, LLMs, TTS, and VAD play in a voice system?
- Which stages contribute most to a voice agent's end-to-end latency?
- When the user interrupts, how should the system stop playback and generation and update the context?
- How should states such as `listening`, `thinking`, `speaking`, and `interrupted` be managed?
- What are the advantages and disadvantages of cascaded ASR + LLM + TTS versus native speech-to-speech models?
- How should cloud APIs, local models, and hybrid edge-cloud deployments be chosen?
- Which metrics are affected by browser-side audio preprocessing?
- What observability data should a voice agent collect?

## Integrated Design Questions

- How would you design a multi-agent system that supports task decomposition, parallel execution, shared state, conflict handling, and failure recovery? See [Multi-Agent System Design: Task Decomposition, Shared State, Conflict Handling, and Failure Recovery](../agent/multi-agent.md).
- How would you design an enterprise RAG system with authorization, source attribution, and knowledge-base updates?
- How would you design an agent platform that supports long-running tasks, tool calls, interruption recovery, and human handoff?
- If customer-service traffic suddenly rises while a model provider is rate-limiting requests, how should the system queue, degrade, and protect core requests?
- After a model or prompt upgrade, structured-output success and answer quality decline. How would you diagnose and roll back the change?
- If an agent can look up orders and issue refunds, how should authorization, parameter validation, confirmation, idempotency, and auditing be designed?
- How would you design a voice customer-service system with real-time interruption, low latency, and failure fallback?
