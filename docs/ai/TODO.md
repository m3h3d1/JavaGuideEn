---
sitemap: false
head:
  - - meta
    - name: robots
      content: noindex, nofollow
---

# AI Content Planning TODO

Last organized: 2026-08-15

Supporting material: `MATERIALS.md` is referenced below but is not present in this checkout. Check existing articles before writing to avoid repeating research or inventing duplicate frameworks.

## Completed or Added

| Content                                                | Status                                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `llm-basis/llm-evaluation.md`                          | Complete; added to the LLM fundamentals and top-level indexes                       |
| `system-design/llm-gateway.md`                         | Complete; added to the system design and top-level indexes                          |
| `agent/workflow-graph-loop.md`                         | Added to the Agent and top-level indexes and interview questions                    |
| `agent/multi-agent.md`                                 | Complete; added to the Agent and top-level indexes and interview questions          |
| `interview-questions/agent-project-interview-guide.md` | Complete; added to the interview and top-level indexes and project experience guide |
| `system-design/ai-application-architecture.md`         | Added to the system design and top-level indexes and interview questions            |
| `system-design/ai-voice.md`                            | Added to the system design and top-level indexes and interview questions            |
| `MATERIALS.md`                                         | Listed as an internal writing index, but the file is absent from this checkout      |

## P0 · System Design and Security

| File                                    | Title                                                                               | Focus                                                                                                                                                                                |
| --------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `system-design/llm-security.md`         | LLM Application Security: Prompt Injection, Tool Authorization, and Data Protection | Start from untrusted input and cover direct and indirect prompt injection, tool permissions, MCP server risks, least privilege, auditing, and the OWASP Top 10 for LLM Applications. |
| `system-design/ai-observability.md`     | AI Observability and Tracing: Why an Agent's Final Answer Is Not Enough             | Trace model calls, retrieval, tools, context assembly, retries, and fallbacks; cover Langfuse, OpenTelemetry, audit tables, and Java backend implementation.                         |
| `agent/tool-calling.md` (do not create) | Link to the existing tool-calling article (done)                                    | Linked [Structured Output and Function Calling](./llm-basis/structured-output-function-calling.md). Write a separate article only for Agent Loop gaps not covered there.             |

## P1 · Agent Engineering Gaps

| File                                        | Title                                                            | Focus                                                                                                                                                                                            |
| ------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `agent/agent-evaluation.md` (do not create) | Link to the existing evaluation article (done)                   | Linked [How Should You Evaluate an Agent Application?](./llm-basis/llm-evaluation.md#how-should-you-evaluate-an-agent-application). Write separately only for Agent Loop gaps not covered there. |
| `llm-basis/llm-model-selection.md`          | LLM Selection: General, Reasoning, Coding, and Multimodal Models | Compare capabilities, routing, fallbacks, and multi-model orchestration; provide selection tables for customer support, RAG, coding, and voice agents.                                           |

## P1 · Advanced RAG

| File                    | Title                                                                                              | Focus                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `embedding-reranker.md` | Selecting Embedding and Reranker Models: RAG Problems Are Not Always Caused by the Vector Database | Compare embedding models, reranker principles, and selection scenarios.                                |
| `rag-multimodal.md`     | Multimodal RAG: Processing PDF Tables, Images, Screenshots, and Video                              | Cover difficult enterprise knowledge-base content, OCR, chart understanding, and multimodal retrieval. |
| `finetune-vs-rag.md`    | Fine-Tuning, Distillation, or RAG: When Should You Train a Model?                                  | Compare SFT, LoRA, DPO, and RFT, and explain when prompt changes are insufficient.                     |

## P2 · Java AI Frameworks

| File                       | Title                                                                               | Writing order                                              |
| -------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `framework/README.md`      | AI Frameworks: Spring AI, LangChain4j, and AI Workflow Engineering                  | Add the index first so `framework/` does not remain empty. |
| `spring-ai.md`             | Getting Started with Spring AI: Connecting Java Backends to LLMs                    | Write first for JavaGuide readers.                         |
| `langchain4j.md`           | LangChain4j in Practice: Building RAG and Agents in Java                            | Write second.                                              |
| `ai-workflow-framework.md` | LangGraph and Spring AI Alibaba Graph: Implementing AI Workflows, Graphs, and Loops | Write third and cross-link with `workflow-graph-loop.md`.  |

## P2 · Advanced MCP and Compliance

| File               | Title                                                                                            | Focus                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `mcp-advanced.md`  | MCP Production Security and Advanced Capabilities: Roots, Sampling, Elicitation, and Permissions | MCP servers introduce an attack surface beyond their tools.                      |
| `ai-compliance.md` | AI Compliance and Privacy: Security, Auditing, and Privacy Before Release                        | Enterprise use is growing, and these topics may appear more often in interviews. |

## Suggested Work Order

1. `system-design/llm-security.md`: Move from familiar web security concepts to AI-specific attack surfaces.
2. `system-design/ai-observability.md`: Connect it with `harness-engineering.md`, `rag-optimization.md`, and `llm-evaluation.md` to cover debugging, evaluation, and observability.
3. Tool calling and Agent evaluation: Links to existing articles have been added to the Agent index, introduction, and interview questions. Do not create `agent/tool-calling.md` or `agent/agent-evaluation.md` unless there are Agent Loop-specific gaps.
4. `framework/README.md` and `framework/spring-ai.md`: Add the index first; Spring AI is the most accessible starting point for Java readers.

## Maintenance Rules

1. After adding an article, check the top-level and topic indexes, interview questions, the planned materials index, and this file.
2. Do not link internal maintenance documents from reader-facing articles. Keep internal documents marked `sitemap: false` and `noindex, nofollow`.
3. Verify changeable details such as model and platform capabilities, prices, context windows, and API parameters against official documentation before publishing.
4. Move completed work to “Completed or Added” promptly to avoid reassessing it later.
