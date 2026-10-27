---
title: AI Application and Agent Roadmap for Java and Go Developers (2026)
description: A 2026 roadmap for Java and Go backend developers covering LLM fundamentals, prompt engineering, RAG, agents, LLM APIs, AI system design, production engineering, and projects.
category: Learning Roadmaps
head:
  - - meta
    - name: keywords
      content: Java to AI, Go to AI, 2026 AI roadmap, AI application development roadmap, agent learning roadmap, RAG roadmap, LLM learning roadmap, backend to AI, Java AI development
---

Hi, I'm Guide. This is the 2026 AI application and agent roadmap for Java and Go backend developers. Over the past two years, JavaGuide has published many articles on AI application development, with more than one million total reads on its public account.

I often see questions like these in messages to the public account:

> I'm a Java / Go backend developer and want to move into AI application development. Where should I start?
>
> How much Python should I learn? Should I start with RAG, agents, or prompts?

I usually start by asking one question: **Do you want to work on model algorithms, or integrate LLMs into business systems?**

Most backend developers mean the second option. Your experience with business systems, databases, caching, message queues, rate limiting, circuit breakers, and distributed tracing still applies to AI applications. The main difference is that a predictable HTTP / RPC API is replaced by a slower, more expensive, less predictable model API.

The challenges are different. The same request may get different answers on different days. A model asked for JSON may omit fields, return invalid formatting, time out, or present uncertain information as fact. Along with API failures, concurrency, and data consistency, you now need to handle unpredictable output, context contamination, token costs, and hallucinations.

This roadmap focuses on putting AI applications into production. It has three main parts:

- **Learn the fundamentals:** tokens, context windows, prompts, and structured output.
- **Practice the two main tracks:** RAG and knowledge bases, then agents and tool calls. They often work together, but beginners should practice them separately first.
- **Add production engineering and projects:** asynchronous processing, rate limits, cost management, evaluation, auditing, and security.

The roadmap has eight stages. Follow stages 0–2 in order. You can alternate between stages 3 and 4, build on your existing skills in stage 5, and bring the earlier topics together in a project in stage 6.

The framework examples focus on Java, with Go alternatives where relevant. Prompts, RAG, agents, and evaluation apply across languages.

For advice on changing career paths, see [A Roadmap for Backend Developers Moving into AI Agents (2026)](./backend-to-ai-agent-roadmap.md).

## Stage 0: Build the Right Mental Model (1–2 Days)

This stage doesn't involve coding, but it helps prevent confusion later.

It's tempting to jump straight into RAG and agents. A demo may work, but real data exposes problems: the context overflows, the model generates incorrect tool parameters, or a prompt that worked yesterday becomes unreliable today. Often the underlying issue is an unclear understanding of tokens, sampling parameters, or context windows.

You don't need to study model training here. First understand a few concepts you'll use throughout the roadmap: how tokens are counted, why context windows fill up, why the same input can produce different outputs, what information a prompt should include, and what knowledge gaps RAG can address.

**Recommended reading:**

- [How LLMs Work: A Detailed Guide](https://javaguide.cn/ai/llm-basis/llm-operation-mechanism.html): Start with tokens, context windows, and Temperature to understand why model responses can vary.
- [Structured Output from LLMs](https://javaguide.cn/ai/llm-basis/structured-output-function-calling.html): Compare JSON Schema, Function Calling, Tool Calling, and MCP.
- [Prompt Engineering in Practice](https://javaguide.cn/ai/agent/prompt-engineering.html): Review the basics now and return to it in stage 2.
- [Context Engineering in Practice](https://javaguide.cn/ai/agent/context-engineering.html): Focus on token budgets, context assembly, and fallback strategies.
- [RAG Fundamentals: A Detailed Guide](https://javaguide.cn/ai/rag/rag-basis.html): Learn the main ideas before setting up a vector database.

### From Deterministic to Probabilistic Systems

CRUD work can make us assume that the same inputs should always produce the same results. HTTP APIs, SQL queries, and cache reads usually behave that way.

LLMs work differently. They predict the next token from the current context, append it, and predict the next one. This process is called **autoregressive generation**. Temperature, Top-p, context order, and model version all affect sampling, so the same question can produce different results.

Treat this as a system constraint. Before model output reaches business logic, validate its format and fields, retry failures when appropriate, and provide a fallback when needed. If the model lacks information, don't let it invent an answer.

Models also have limits. GPT, Claude, DeepSeek, and Qwen have different strengths. Some tasks need only a well-written prompt; others need RAG, and only some call for fine-tuning. Choose an approach based on the problem.

### Tokens, Context Windows, and Context Engineering

These terms will come up throughout the roadmap, so keep them distinct.

**A token** is the unit a model processes. A tokenizer uses subword algorithms such as BPE to split text into pieces of different lengths. Common words may remain intact, while less common words are split into smaller pieces. As a rough estimate, one token covers 3–4 English characters or 1–2 Chinese characters.

**The context window** is the total amount of material a model can see in a request. A 128K or 200K window sounds large, but the System Prompt, tool schemas, conversation history, and RAG passages all use part of it. A larger window doesn't guarantee that a model will use all the information well. Many models pay more attention to the beginning and end, and may overlook material in the middle—a problem known as “Lost in the Middle.”

In production, calculate a **token budget**. A simple formula is `window >= input_tokens + max_output_tokens`. Leave a 10%–20% safety margin. Also, many providers charge 2–4 times more for **output tokens** than input tokens, so a longer prompt with a shorter response can cost less.

**Context engineering** is the practice of deciding what goes into the limited context window for each response. That includes core instructions, conversation history, RAG results, and tool state. Agent memory involves the same decisions: what to keep in context, what to store externally, and what to remove when tokens run short.

### Sampling Parameters: Temperature, Top-p, and Max Tokens

These settings can have a noticeable effect on production behavior.

**Temperature** is the most common setting to adjust. For structured output such as JSON, try 0–0.3. For analysis or brainstorming, 0.4–0.8 allows more variation. Some models also support a `seed` parameter to help make output more consistent.

You don't need to tune **Top-p and Top-k** separately at first. Low Temperature with Top-p at 0.9 is enough for many applications.

**Max Tokens** sets the output limit. If the response is cut off—for example, if a JSON closing brace is missing—the parser will fail. Set the limit high enough and handle parsing errors. Some providers also support **stop sequences**, which stop generation at a specified string. A poorly chosen sequence may cut off an important field.

Use **Repetition Penalty** carefully with structured output. JSON and XML contain repeated patterns, so a strong penalty can break valid formatting. Presence Penalty can also make RAG answers less faithful by encouraging the model to introduce new content.

### Prompt Engineering Basics

An improvised prompt may work for a prototype but become hard to maintain. If the output feeds a business system, vague format requirements will cause problems in the parsing layer.

Treat a prompt like a short requirements document: who is responding, what task to perform, what context is available, and what format to return. These are often called Role, Task, Context, and Format. You don't always need all four, but don't leave the task or output format unclear.

Keep the System Prompt and User Prompt separate. Put behavior rules in the System Prompt and the current request in the User Prompt. If the boundary is unclear, user input may interfere with the model's instructions.

For complex reasoning, Chain of Thought (CoT) can ask a model to work through steps before giving an answer. In production, consider whether to expose those intermediate steps: they may reveal internal rules, retrieved passages, or sensitive information. One approach is to wrap them in `<thinking>` and the final answer in `<result>`, then return only the latter from the server.

Few-shot examples can also help. Instead of a long list of abstract requirements, provide 1–3 input and output examples to show the expected format, style, and level of detail. More examples can cost extra tokens without improving results.

Two topics need more attention: task decomposition and prompt injection. Break complex tasks into steps, and isolate and filter malicious input. Stage 2 covers prompt injection in more detail.

### Structured Output: A Bridge to Business Logic

LLM output that enters a business system eventually needs a structured format. Here are three common approaches; stage 2 covers implementation.

| Approach                    | Benefits                                               | Drawbacks                                                                         | Use cases                                          |
| --------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- | -------------------------------------------------- |
| JSON Schema constraints     | Simple and widely supported                            | Fields or types may still be wrong; the model may add text around the JSON        | Prototypes and switching between models            |
| Function Calling            | Clearer structure and intent                           | Providers differ; the model produces an intended call but does not execute it     | Agent tool calls                                   |
| Structured Outputs (Strict) | Constrained decoding greatly reduces formatting errors | Requires provider support, and providers support different subsets of JSON Schema | Production systems with strict format requirements |

JSON Schema is widely compatible but may require server-side fixes. Strict mode is more consistent but limits model choices. Remember: **JSON Mode enforces valid syntax, JSON Schema defines the data contract, Structured Outputs applies that contract during generation, and the server still performs final validation**.

The server can process the response in this order:

```text
Generate -> Parse -> Repair (optional) -> Validate
```

The model generates the response, parsing converts it to structured data, and optional repair handles fixable formatting issues such as a missing bracket. Business logic is still responsible for validation.

### RAG Fundamentals

Retrieval-Augmented Generation (RAG) addresses a practical problem: a general-purpose model doesn't know your company's internal documents.

If someone asks about your expense reimbursement process, the model won't know your company's policy unless you provide it. RAG processes internal documents into a searchable knowledge base, retrieves relevant passages for a question, and gives the passages and question to the model so it can answer from that material.

RAG uses embeddings to map text into a high-dimensional vector space. Texts with similar meanings usually have vectors closer together. Common distance measures include cosine similarity, dot product, and L2 distance; recommended settings vary by model and vector database.

Keep two engineering concerns in mind.

First, consider dimensions and storage costs. A 1024-dimensional vector is about 4 KB, so one million chunks need roughly 4 GB before index overhead. Include that overhead when choosing a vector database and estimating storage costs.

Second, embeddings from different models use different vector spaces. When you switch models, you usually need to regenerate all vectors. Mixing vectors from different models can reduce retrieval quality.

Don't split documents by character count alone. Split by semantic paragraphs or headings, with some overlap so key information isn't separated across chunks.

Later, you'll use hybrid retrieval and reranking. Vector search captures semantic similarity; BM25 is better at exact terms. A reranker moves the most relevant candidates to the top. Query rewriting can also help: vague questions may need to be rewritten in terms that are easier to search.

## Stage 1: LLM Integration (1–2 Weeks)

This is the first hands-on coding stage.

Start with a Hello World using the official SDK, then go further. In real projects, you'll need to handle streaming responses, timeouts, and missing JSON fields. These are easier to address before adding RAG or agents.

Build the LLM integration layer as a shared infrastructure component. Keep it out of scattered HTTP calls in business code.

**Recommended reading:**

- [Engineering Practices for Calling LLM APIs](https://javaguide.cn/ai/llm-basis/llm-api-engineering.html): Implement streaming, retries, rate limiting, and structured responses in a Java backend.
- [Structured Output from LLMs](https://javaguide.cn/ai/llm-basis/structured-output-function-calling.html): Understand JSON Schema, Function Calling, and Tool Calling.
- [LLM Gateways](https://javaguide.cn/ai/system-design/llm-gateway.html): Learn about model routing, fallbacks, rate limits, cost attribution, monitoring, and auditing.
- [Choosing a Java AI Framework and Project Recommendations](https://javaguide.cn/open-source-project/machine-learning.html)

### LLM APIs: From First Call to Production

For Java, consider Spring AI or LangChain4j; for Go, consider LangChainGo. These frameworks provide a consistent model API, so switching from OpenAI to Gemini, Claude, or a local model requires fewer business-code changes.

Don't treat the framework as a black box. Understand authentication, SSE parsing, error handling, and timeouts so you can identify whether a production issue comes from the framework, model API, or your own code.

Streaming responses are useful because a complete LLM answer can take 10 seconds or longer. Server-Sent Events (SSE) can send output as it is generated, but need different handling from REST APIs. For example, newlines must be escaped correctly or the frontend may receive incomplete events. If Nginx sits in front of the service, disable `proxy_buffering` so it doesn't hold chunks before sending them.

Function Calling is a prerequisite for building agents. The model doesn't execute Java methods; it returns the tool it wants to call and its parameters. Java code validates the parameters, executes the method, and returns the result to the model. Keep this boundary clear.

OpenAI-compatible APIs are common. DeepSeek, Qwen, Ollama, and vLLM support similar formats, so switching models may require changing only the base URL and API key.

Projects often need to support multiple models, including models from Chinese providers. Spring AI Alibaba has deeper integration with Qwen. A common approach is to prototype with a lower-cost model, then choose a production model based on capability and compliance requirements.

Multimodal input can wait. For images, audio, and document images, the Java side mainly handles Base64, file uploads, and multimodal prompts. Learn the details when you need them.

When usage grows, consider an AI gateway between business services and model APIs. It can centralize authentication, rate limiting, routing, logs, billing, and model switching. A production LLM request may pass through request handling, context assembly, token estimation, gateway routing, provider API calls, response parsing, state updates, monitoring, and alerts.

> **Risk: synchronous, blocking LLM calls.**
>
> An LLM response can take 10 seconds to a minute. Synchronous calls in Spring MVC can exhaust the Tomcat thread pool under high concurrency and stall the service. Design for asynchronous calls from the start; stage 5 covers implementation options.

### Frameworks and Architecture

Three common Java options are:

| Framework         | Strengths                                                                                                                                                           | Use cases                                                               | Considerations                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------- |
| Spring AI         | From the Spring team; integrates with Spring Boot and provides abstractions such as ChatClient, VectorStore, Function Calling, and ChatMemory                       | Adding AI to existing Spring Boot projects; infrastructure layers       | Fewer agent orchestration features                  |
| LangChain4j       | Community-driven, broad feature set, quick multi-model support, and extensive RAG and agent capabilities                                                            | Prototypes, model switching, and complex workflows                      | Fast-moving, with occasional breaking changes       |
| Spring AI Alibaba | Built on Spring AI for multi-agent and workflow orchestration; includes an Agent Framework, Graph Runtime, visual Admin platform, and support for MCP / A2A / Nacos | Multi-agent collaboration, complex workflows, and enterprise governance | Newer, with a growing community and set of examples |

These frameworks aren't mutually exclusive. One option is Spring AI for model integration and LangChain4j or Spring AI Alibaba for agent orchestration. Keep the framework behind your own domain interfaces; fast-moving APIs and breaking changes shouldn't spread into business code.

Go developers can look at [LangChainGo](https://github.com/tmc/langchaingo) and the [Go MCP SDK](https://github.com/mark3labs/mcp-golang). The Go ecosystem is a little less mature than Java's, but the concepts are the same.

Practice in this order: non-streaming calls, streaming output, Function Calling, then fault-injection tests.

Simulate API timeouts, truncated JSON, and network failures. Check that retries, fallbacks, and user messages work as expected before adding RAG and agents.

## Stage 2: Prompt Engineering (1–2 Weeks)

An improvised prompt may work during development and give the impression that little engineering is involved.

Production brings concrete problems: the model omits fields from JSON, follows a prompt injection, or changes its output after a provider updates the model.

Prompts need versioning, gradual rollouts, rollback, and testing. Treat them like configuration and database migrations.

**Recommended reading:**

- [Prompt Engineering in Practice](https://javaguide.cn/ai/agent/prompt-engineering.html)
- [Structured Output from LLMs](https://javaguide.cn/ai/llm-basis/structured-output-function-calling.html)
- [AI Application Evaluation](https://javaguide.cn/ai/llm-basis/llm-evaluation.html): Evaluate prompt changes, structured output, and agent tool calls.

### Prompt Structure

An overly simple prompt might look like this:

```text
You are an interview assistant. Answer this question: {user_input}
```

This leaves the model without clear guidance on its role, level of detail, output format, or boundaries.

Structure a prompt around four elements: Role, Task, Context, and Format. State what the model needs to know. Put the role at the beginning and format requirements at the end; models often pay more attention to the start and end of the context.

Think of a prompt as a short requirements document. Include the background, goal, boundaries, and expected output, just as you would when assigning work to a new team member. The model needs this context in each conversation.

Agents often use a “think, act, observe, conclude” pattern, as in ReAct. Chain of Thought (CoT) can help with complex reasoning by asking the model to break a task into steps. Variants include Zero-shot CoT, guided CoT, autonomous CoT, tool-augmented CoT, and multimodal CoT.

Intermediate reasoning may reveal internal rules, retrieved passages, or another user's input. In production, you can wrap intermediate content in `<thinking>` and the final answer in `<result>`, then return only the latter from the server.

Few-shot examples can be more useful than a long list of rules. Give 1–3 examples that match the real task, cover edge cases, and show the expected format, style, and level of detail.

### Manage Prompts as Business Configuration

Prompts are often hard-coded as Java strings alongside business logic. That's fine for a prototype, but in production every change then requires a code release and makes rollback harder.

Manage prompts as business rules. They affect model behavior just as rate limits and pricing rules affect a service, so avoid hard-coding them.

A better approach is to store them separately, for example in `.st` (Spring Template) files. Core prompts can live in a configuration center such as Nacos or Apollo and be updated without redeploying.

**Variable injection** needs care. Concatenating user input directly into a prompt can place it in the instruction area. Special markers such as `<system>` may interfere with model behavior. Sanitize input or isolate it with XML tags such as `<user_input>`, and make clear that it is data, not a system instruction.

**Prompt injection** can take many forms, including encoded instructions in URLs, hidden text, or attempts spread across several turns. Defenses include input filtering, separating system instructions from user input, and output guardrails. Use **defense in depth**: limit permissions and sandbox execution, clearly mark user input, and require human approval for sensitive actions such as database writes or payments.

Apply guardrails to both input and output. Filter sensitive information, personal data (PII), and harmful content before output reaches business logic. Detect known jailbreaks, attacks, and dangerous tool requests before model execution.

Version prompt changes and roll them out gradually. Test a small share of traffic and compare results before a full release.

### Structured Output and Correction Loops

LLM output can be inconsistent. A request for JSON may produce missing fields, extra explanation, or unclosed brackets, leaving the backend with text that needs parsing and validation.

Handle this in two steps: **constrain, then validate**.

For constraints, use JSON Schema, Function Calling, or Structured Outputs (Strict Mode). Prefer Strict Mode in production when the provider supports it. Otherwise use Function Calling or JSON Schema with a fallback for invalid output.

For validation, define a strict response type with Java 14+ records or Lombok, then use JSR-380 annotations such as `@NotNull`, `@Size`, and `@Pattern`. This is the same kind of validation used for HTTP request parameters, applied to LLM output.

You may also need an **error-driven correction loop**.

If Jackson parsing or Bean Validation fails, send the error and original output back to the LLM and ask it to try again instead of immediately returning the error to the user.

Set a limit, such as three attempts. If they all fail, return a fallback or ask the user to try again later. This retry and reflection loop lets the application correct some output errors.

The flow looks like this:

```text
User request -> Build prompt -> LLM generation -> Parse JSON -> Validate fields
                                                        ↓ on failure
                                              Ask LLM to correct -> Parse and validate again (up to 3 times)
                                                        ↓ retry limit reached
                                              Return a fallback response
```

Where appropriate, validate factual claims against a knowledge graph or fact database. Stage 3 covers this in the RAG section.

## Stage 3: RAG and Knowledge Graphs (2–3 Weeks)

“I built a RAG system, but it can't answer anything correctly.”

RAG looks like “retrieve, then answer,” but it's a data pipeline: document parsing, chunking, embedding, retrieval, reranking, and generation. Any step can fail. Low recall may come from chunks that are too small; hallucinations may start with retrieving the wrong documents; irrelevant answers may point to an embedding model that handles Chinese poorly.

Move from getting a demo to work to finding and measuring problems. Without evaluation, RAG tuning becomes guesswork. Metrics show whether a change helps or hurts.

**Recommended reading:**

- [RAG Fundamentals: A Detailed Guide](https://javaguide.cn/ai/rag/rag-basis.html)
- [RAG Document Processing and Chunking](https://javaguide.cn/ai/rag/rag-document-processing.html)
- [Vector Indexing Algorithms and Vector Databases for RAG](https://javaguide.cn/ai/rag/rag-vector-store.html)
- [Updating Documents in a RAG Knowledge Base](https://javaguide.cn/ai/rag/rag-knowledge-update.html)
- [GraphRAG: A Detailed Guide](https://javaguide.cn/ai/rag/graphrag.html)
- [RAG Retrieval Optimization](https://javaguide.cn/ai/rag/rag-optimization.html)
- [AI Application Evaluation](https://javaguide.cn/ai/llm-basis/llm-evaluation.html): Focus on retrieval and generation evaluation, and trace replay.

### Offline Data Pipeline

When RAG results are poor, people often switch embedding models or increase Top-K first.

Start by checking document ingestion. Were headings lost? Were tables split incorrectly? Was the reading order of a PDF preserved? Retrieval tuning can't fix incorrect source data.

Apache Tika or POI is usually enough for standard Office documents (Word, Excel, and PowerPoint). PDFs, especially scans and complex layouts, are harder to parse. Tools such as Docling, Unstructured, and LlamaParse are **layout-aware parsers**: they use text position, font size, and spacing to infer reading order. A multimodal model can also convert a PDF to Markdown.

Avoid splitting only by fixed character counts. Split by semantic paragraphs or heading levels, with some overlap to preserve context.

For large datasets, Spring Batch can orchestrate document cleaning and embedding as an offline pipeline.

One common issue is filtering permissions after vector search. If the top 10 results include eight documents the user can't access, only two remain, and recall may appear low. Filter by metadata such as `tenant_id`, document type, version, and update time before vector or hybrid search whenever possible.

### Vector Search

Vector search finds documents by meaning. For example, a question about expense reimbursement can match a document titled “Expense Application Process,” even if it doesn't contain the same words.

Embeddings map text into a high-dimensional vector space, where texts with similar meanings are closer together. Examples include OpenAI Embeddings, BGE, and Qwen embeddings. Embedding models represent meaning; chat models generate answers.

Use Spring AI's VectorStore interface instead of tying the application to one vector database. PG + pgvector is enough for local development; production options include Milvus and Elasticsearch. This is similar to using a DAO interface to isolate a database implementation.

Vector search is good at semantic matching but less reliable for exact terms. Searching for a product ID such as `"SKU-2024-0512"` may return a document with a similar meaning but the wrong ID.

Production systems often use hybrid search: vector search for semantic matches and BM25 for exact terms, with Reciprocal Rank Fusion (RRF) to combine rankings. Avoid comparing raw scores from different methods.

For rough candidate results, add a reranker. A Cross-Encoder scores the relevance of each question and candidate passage, then moves stronger matches up. It can't find results missing from the candidate set. A typical setup might retrieve 30–100 candidates (`recall_top_k`), keep 5–10 after reranking (`rerank_top_n`), and place 3–6 in the context (`context_top_n`).

### Semantic Caching

Semantic caching can help when users ask many similar questions, such as repeated questions about an internal reimbursement policy.

Embed each question and search for similar ones in Redis or a dedicated cache. If similarity exceeds a threshold, return the cached answer without calling the LLM.

### Knowledge Graphs and GraphRAG

Vector-only RAG struggles with relationships spread across documents. A question about whether two people are on the same project team may require information from an org chart, project documents, and meeting notes.

A knowledge graph represents entities (people, organizations, projects), relationships (belongs to, leads, participates in), and properties (name, date, amount) as triples: `(entity)-[relationship]->(entity)`. Neo4j is a good place to start; consider NebulaGraph for very large datasets.

Extracting entities and relationships is the hard part. Instead of maintaining rules or training an NER model, you can ask an LLM to produce JSON triples, then parse and write them to Neo4j from Java. Accuracy won't be perfect, but this may be sufficient for some enterprise knowledge bases.

GraphRAG combines knowledge graphs with vector search. Vector search finds relevant nodes, then Cypher queries expand through their relationships. The LLM uses the resulting context to form an answer.

For a question about a specific entity, Local Search finds the entity and expands through its neighbors and relationships. Global Search uses community summaries to answer broader questions across a corpus. DRIFT Search combines the two by using community summaries while expanding from relevant entities.

GraphRAG adds structured facts to the context and lets the model build an answer from known relationships, which can reduce hallucinations.

Another pattern is Text2Cypher: the LLM generates a Cypher query from the graph schema, then uses the query results to answer a natural-language question. In production, restrict it with an approved schema, query validation, read-only access, and result limits.

### RAG Evaluation

Many teams launch RAG after trying a few questions. When users report incorrect answers, they change chunking, embeddings, or reranking and judge the results by feel. Metrics help show which changes work and whether they cause regressions.

Track retrieval and generation separately.

Retrieval metrics measure whether the right evidence was found. Common metrics include Hit Rate@K, MRR, Context Recall, and Context Precision.

Generation metrics measure answer quality. Common metrics include Faithfulness, Answer Relevance, Citation Accuracy, and Hallucination Rate.

Tools include RAGAS, DeepEval, and LangSmith. Java services can run an evaluation pipeline on a schedule. Treat LLM-as-a-Judge as one signal and manually review a sample before launch.

Maintain an end-to-end benchmark set of questions and reference answers for each knowledge base. Run it whenever the RAG pipeline changes and compare the results.

This takes time, especially when creating reference answers, but skipping evaluation makes it hard to know whether the system has improved.

### From RAG to Agentic RAG

Traditional RAG follows a fixed path: receive a question, retrieve documents, and generate an answer. It doesn't decide whether the results are sufficient, whether to rewrite the query, or whether to search another knowledge base.

RAG approaches have evolved. Naive RAG uses chunking, Top-K retrieval, and generation. Advanced RAG adds query rewriting, hybrid search, reranking, and context compression. Modular RAG separates retrievers, rerankers, compressors, routers, and generators into replaceable components.

Agentic RAG gives the agent control over retrieval decisions. It can decide when and what to retrieve, whether to search again, or whether to switch sources based on the current context. The key change is from a fixed pipeline to a workflow that can make decisions.

## Stage 4: Core Agent Capabilities (2–3 Weeks)

Tool use is only one part of an agent. Production systems also need to handle interrupted tasks, approvals for sensitive actions, full context windows, and information that should persist between conversations.

These problems require engineering for state, permissions, memory, and observability; prompts alone aren't enough.

**Recommended reading:**

- [AI Agent Fundamentals](https://javaguide.cn/ai/agent/agent-basis.html)
- [AI Agent Memory Systems](https://javaguide.cn/ai/agent/agent-memory.html)
- [Context Engineering in Practice](https://javaguide.cn/ai/agent/context-engineering.html)
- [Agent Skills: A Detailed Guide](https://javaguide.cn/ai/agent/skills.html)
- [The MCP Protocol: A Detailed Guide](https://javaguide.cn/ai/agent/mcp.html)
- [Harness Engineering](https://javaguide.cn/ai/agent/harness-engineering.html)
- [Workflows, Graphs, and Loops in AI](https://javaguide.cn/ai/agent/workflow-graph-loop.html)
- [AI Agent Interview Questions](https://javaguide.cn/ai/interview-questions/agent-interview-questions.html): Review after completing this stage.

### 4.1 Tool Calling and Protocols

Tool Calling lets an agent interact with external systems, such as databases, APIs, and files.

A common approach is to describe tools with OpenAI Function Calling schemas that define their names, descriptions, and parameters as JSON. The model selects a tool and parameters based on the user's request. Java code registers service methods as tools and executes them.

For example, a user might ask for recent slow SQL queries. The agent selects a tool, sets a time range and threshold, and calls a Java method. The method queries a database or Elasticsearch and returns structured results for the model to summarize.

Validate parameters carefully. The model may interpret “recent” as the string `"recent"`, while the method expects specific dates. Use Bean Validation to reject invalid values.

Tool methods also need authorization checks. Database writes, file deletion, and outgoing email require permission boundaries and, in some cases, approval. A model's decision to call a tool doesn't make the call safe.

Add timeouts and circuit breakers. LLMs are already slow, and a stalled tool can block the whole workflow. You can use `CompletableFuture` for timeouts or Sentinel for circuit breakers.

MCP (Model Context Protocol) is an open protocol introduced by Anthropic in late 2024. Based on JSON-RPC 2.0, it defines Tools, Resources, and Prompts. Developers can expose capabilities through an MCP Server for compatible hosts to use. The TypeScript SDK is more mature, the Python SDK is developing, and Java support is available through the Spring AI community. Follow its development, but evaluate it before adopting it in a project.

### 4.2 Agent Patterns: ReAct, Plan-and-Execute, and Reflection

Agents use several patterns to organize reasoning and actions.

ReAct (Reasoning + Acting) cycles through reasoning, actions, observations, and further actions until it reaches an answer. In Java, a scheduler controls the number of steps and when to stop. Complex tasks can loop, and more calls increase latency.

Plan-and-Execute asks the model to create a plan, then carries it out. This provides an overall view of the task but requires an extra planning call, and the plan may be wrong. Java code must track completed and failed steps and decide when to replan.

Reflection supports correction. Examples include Reflexion, Self-Refine, and CRITIC. It works better with an external source of facts, such as a knowledge graph or database. Asking a model to review only its own answer can lead to circular reasoning.

Projects often combine these patterns: Plan-and-Execute sets the structure, ReAct handles each step, and Reflection checks the result.

Agentic Workflows use a workflow for the main process and add agent loops only where decisions are needed. Graph orchestration commonly uses Nodes for tasks, Edges for transitions, and shared State for context. Loops need continuation and exit conditions, plus limits such as maximum steps, timeouts, and token budgets. For Java, see Spring AI Alibaba Graph; for Python, LangGraph.

Patterns are only a starting point. Production agents also need persistent state.

If a service restarts during a long task, or a user returns after closing the page, the agent needs to resume from its last saved state. Spring State Machine, Temporal.io, and Camunda can model execution as persistent state transitions and resume from a checkpoint after a failure.

Sensitive actions also need human approval. An agent shouldn't independently decide to write to a database, make a payment, or send an email. With Human-in-the-Loop, it pauses until a person approves the action. You can also ask the agent to estimate its confidence and request help when uncertain.

### 4.3 Context and Memory

Short-term memory often starts with putting the conversation history in the context window. Complex agents can fill that window, so projects commonly cache history in Redis and use a sliding window or token limit to keep the latest turns. Large tool results can be stored externally and referenced in the prompt.

When older messages are removed, some information is lost. Long-term memory can store user preferences, historical knowledge, and important facts in Neo4j or a vector database. One approach is to extract useful facts after a conversation, then retrieve relevant memories for a user's query at the start of a new session. Use idempotency keys and confidence checks so assumptions aren't saved as user preferences.

Memory can also be compressed: when conversation history reaches a threshold, use an LLM to summarize it and replace the original messages. This saves tokens but loses detail. Long-term memory should also support forgetting. Assign each memory a decay score, such as `relevance × importance × decay(t)`, and periodically remove outdated or low-value content.

In multi-tenant systems, isolate memory by `tenant_id` or `user_id` in Redis and the vector database. Sharing one user's preferences with another is a data security issue. RAG and long-term memory may both use vectors and semantic search, but they serve different sources: RAG uses shared knowledge, while long-term memory stores information for a specific user.

Finally, assemble context dynamically. Don't send only the System Prompt and conversation history. Rank system instructions, important user memories, tool results, and chat history by priority. Remove lower-priority content first when tokens run short. Keep only the information needed for the current task.

## Stage 5: Production Engineering (1–2 Weeks)

Rate limiting, circuit breakers, asynchronous processing, and transaction boundaries also matter in AI projects. The main difference is latency and cost. A slow LLM call holds threads and connections and increases token costs. An agent without a stopping condition may keep calling models and tools.

**Recommended reading:**

- [AI Application System Design](https://javaguide.cn/ai/system-design/ai-application-architecture.html): Gateways, RAG, memory, tools, evaluation, observability, and security.
- [LLM Gateways](https://javaguide.cn/ai/system-design/llm-gateway.html): Model routing, fallbacks, quotas, token budgets, and cost attribution.
- [AI Application Evaluation](https://javaguide.cn/ai/llm-basis/llm-evaluation.html): Golden Sets, LLM-as-a-Judge, trace replay, gradual rollouts, and CI regression.
- [AI System Design Interview Questions](https://javaguide.cn/ai/interview-questions/ai-system-design-interview-questions.html): Review system design after this stage.

### 5.1 Concurrency and Streaming Responses

In Spring MVC's synchronous model, each request occupies a Tomcat thread. A normal API may return in milliseconds, but an LLM call can take 10 seconds to a minute. A small number of concurrent calls can occupy the thread pool while the service waits for model responses.

Use Spring's `SseEmitter` or WebFlux to stream Server-Sent Events (SSE). Since LLMs generate tokens incrementally, returning the first token early improves responsiveness.

Move LLM network I/O off business threads with an asynchronous or virtual thread pool. You can also use a message queue: enqueue the request, call the LLM asynchronously, and return the result through SSE or WebSocket. Existing experience with asynchronous jobs and smoothing traffic peaks applies here.

Don't stream every API. Internal tasks such as classification, risk scoring, and routing may not benefit from streaming. A synchronous call with a short timeout can be simpler. For user-facing streaming, track **TTFT (time to first token)** as well as total latency.

### 5.2 Databases and Transaction Safety

Calling an LLM inside a `@Transactional` method can hold a database connection while waiting for the model. If the call takes 30 seconds, the connection stays occupied for that time. Under concurrency, the pool may fill up and block other database writes.

Keep transactions short. Call the LLM and validate its response outside a transaction, then open a short transaction for the database writes that need to be consistent. Don't include network I/O in the transaction.

### 5.3 Reliability and Fallbacks

Plan for rate limits, unstable model services, and occasional provider errors such as HTTP 500.

Use Resilience4j or Sentinel for rate limiting and circuit breakers. You can also configure multiple model endpoints and switch to a backup if the primary is unavailable.

Cache responses in Redis when prompts are identical or similar. This can help with frequent RAG questions.

Use exponential backoff, a maximum retry count, and a total timeout. Some network timeouts, rate limits, and HTTP 500 errors are temporary, but repeated retries can make an outage worse.

Control the **token budget** before calling a model. If the input exceeds the limit, remove low-relevance RAG passages first, then compress older messages or reduce tool schemas. If it still doesn't fit, use a model with a larger context window or ask the user to narrow the request. Truncation can remove important facts.

### 5.4 Observability and Cost Management (FinOps)

An agent may loop if its prompt is unclear, a tool returns an error, or the loop has no exit condition. Monitor usage so you can detect the issue before reviewing a bill.

Use a Spring Interceptor to record prompt and completion tokens for each LLM call. Export token usage and cost through Micrometer and Prometheus to a Grafana dashboard.

Set alerts for unusual daily token usage. Start with a threshold based on normal weekly usage, then refine it by tenant, use case, and model price.

Use OpenTelemetry and custom spans for tracing. A single agent request may trigger several model and tool calls. Record the prompt version, retrieved passages and scores, tool parameters and results, model TTFT, total latency, and cost by tenant and use case. These records support trace replay, gradual rollouts, and incident reviews.

### 5.5 Automated Testing for AI Systems

Traditional unit tests assume deterministic input and output. An LLM may return different wording, formatting, or content for the same prompt, so AI systems need additional evaluation.

First, keep deterministic tests. Mock LLM HTTP calls with WireMock or Mockito and return fixed JSON. Use these tests for parsing, tool orchestration, and error handling. They run quickly in CI and don't depend on model variation.

Second, evaluate prompts. Use Promptfoo or LLM-as-a-Judge to run a set of inputs and assess accuracy, relevance, and hallucination rates. Maintain a **Golden Set** of 50–200 examples covering real usage. Build it from sampled production logs, edge cases, and failures found after launch.

For agents, also track tool selection and parameter accuracy, unnecessary calls, and failure recovery. A correct final answer may still come from a fragile path that fails on a similar input.

Record evaluation results alongside prompt and model versions. This helps identify whether a production issue came from a prompt change, model update, or knowledge base change.

### 5.6 Data Compliance and Security

Detect and mask personally identifiable information (PII), such as ID numbers, phone numbers, and bank card numbers, before sending user input to an LLM.

**Don't put security controls only in prompts.** Prompts can ask a model not to reveal private information, but code and infrastructure must enforce access control, masking, auditing, and approval for sensitive actions.

Keep audit logs of LLM interactions, including prompts, outputs, token usage, and timestamps. Finance, healthcare, and government projects may also restrict data transfers outside their environment. Confirm legal and compliance requirements before choosing a deployment model or provider.

Configure data retention by tenant and use case. Keeping request logs and observability data indefinitely can create compliance risks. For RAG and tool calls, apply the user's access control list before retrieval so they can't receive unauthorized document passages.

Filter model output for unsafe content. Applications in China can use content safety APIs from cloud providers.

## Stage 6: Project Practice (2–4 Weeks)

Use a project to combine the skills from the first five stages. Implementation brings together parsing, retrieval, streaming, evaluation, and permissions.

### Smart Interview Platform

Build a platform where users upload a resume, get an analysis of their project experience, receive interview questions, and get feedback on their answers. Add a RAG knowledge base with JavaGuide articles, interview questions, and personal notes to create an interview study assistant.

Key challenges include extracting skills and responsibilities from resumes, matching question difficulty to a user's level, and measuring retrieval quality.

**Open-source repositories (stars are welcome):**

- GitHub: <https://github.com/Snailclimb/interview-guide>
- Gitee: <https://gitee.com/SnailClimb/interview-guide>

### Agent Project (In Progress)

This project is in preparation. It will use ReAct and multiple tools, with Tool Calling, memory management, and persistent state. More tutorial material will follow.

You can start with a small knowledge-base agent that searches documents, remembers the current session, and resumes an interrupted task.

Use these initial criteria:

- It can call at least three tools, such as a database query, knowledge-base search, and Web search.
- It can restore context after a conversation is interrupted.
- It has basic retry handling.

Common implementation issues include losing context when memory is trimmed, stalled workflows when tool timeouts aren't handled, and long tool results obscuring important information. Iterating on these cases helps clarify the engineering work agents require.

## Stage 7: Further Optimization (Ongoing)

At this point, you have the core skills. Study based on your project's needs: multimodal models for images, multi-agent systems for complex workflows, and local deployment or caching to manage costs.

You don't need to study every topic. Focus on what you need.

**Recommended reading:**

- [AI Voice Technology](https://javaguide.cn/ai/system-design/ai-voice.html): For voice agents, real-time ASR / TTS, and interruption handling.
- [AI Application Development Interview Guide](https://javaguide.cn/ai/interview-questions/ai-interview-guide.html): Review LLMs, RAG, agents, and system design together.
- [LLM Fundamentals Interview Questions](https://javaguide.cn/ai/interview-questions/llm-interview-questions.html) and [RAG Interview Questions](https://javaguide.cn/ai/interview-questions/rag-interview-questions.html): Review after studying the related stages.

| Topic                     | When to study it                                           | Is it worth the time?                                                               |
| ------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Multi-agent collaboration | When a single agent can't handle a complex workflow        | Yes. Agent-to-agent communication is needed in some projects.                       |
| Local LLM deployment      | When data must stay in-house or you need to reduce costs   | Yes. Ollama / vLLM are accessible options, and Java can use OpenAI-compatible APIs. |
| Performance optimization  | When QPS grows and LLM calls become a bottleneck           | Yes. Batching, cache warming, and graph query optimization build on backend skills. |
| A2A protocol              | When agents need standardized communication across systems | Keep an eye on it. Google's Agent-to-Agent protocol is still new.                   |
| Evaluation                | When an agent is in production but its quality is unclear  | Yes. Production systems need evaluation and A/B testing.                            |
| Fine-tuning               | When prompts and RAG aren't accurate enough                | Learn the basics of LoRA / QLoRA; you don't need to train a model yourself.         |
| Multimodal agents         | When handling screenshots, document images, or UI actions  | Yes. Computer Use may be useful for RPA and UI testing.                             |
| AI feature experiments    | When comparing prompts, models, or strategies              | Yes. Prompt, model, and strategy rollouts support ongoing improvement.              |

## FAQ

### How Should I Learn AI Coding?

Don't focus only on tool comparisons or try to read every article in sequence. Start with the [AI Coding Practices Guide](../ai-coding/).

It covers tools such as Claude Code, Codex, Cursor, Trae, and Qoder in real development workflows. Topics include task breakdown, context, project rules, limiting changes, code review, testing, and rollback. It also covers CLI and IDE choices, `CLAUDE.md`, Skills, Spec Coding, agent collaboration, and backend project examples.

Follow the guide's reading order: start with tool selection and methods, then try Claude Code or Codex, and finish with examples from your own projects. Apply AI coding in a real development workflow rather than stopping at prompts and demos.

### Should I Learn Python?

Learn enough to read code and debug projects.

Python helps you understand projects such as LangChain and LlamaIndex and apply useful patterns in Java / Go. Many companies use Python for AI components and Java / Go for business logic. Reading, changing, and debugging Python code is enough; you don't need to prepare as an algorithms engineer.

### How Long Will It Take?

With programming experience and 3–6 hours of study each day:

| Stages | Suggested time | Notes                                                 |
| ------ | -------------- | ----------------------------------------------------- |
| 0–2    | 2–3 weeks      | Build the fundamentals.                               |
| 3–4    | 3–4 weeks      | Core skills; include hands-on practice.               |
| 5      | 1–2 weeks      | Production engineering; use your existing experience. |
| 6      | 2–6 weeks      | Apply and consolidate your skills in a project.       |

The total is about 2–4 months. With a strong engineering foundation and focused study, it may take about a month.

This estimate is optimistic. RAG tuning and agent state management may take longer, so adjust the schedule as needed.

### Do I Need an Algorithms Background?

No. This roadmap focuses on engineering, not model training or algorithm development.

You should understand:

- The limits of LLMs, including why they hallucinate.
- What prompts, RAG, and agents are each used for.
- How to integrate these capabilities into production with Java / Go.

You don't need to derive Transformer or embedding equations, but understand the concepts before choosing models, embeddings, and vector databases.

### How Should I Choose an LLM?

| Use case                  | Suggested models               | Notes                                                    |
| ------------------------- | ------------------------------ | -------------------------------------------------------- |
| Development and debugging | DeepSeek / Qwen                | Lower cost and good Chinese support.                     |
| Production                | GPT / Claude / Gemini          | Broad capabilities and reliability.                      |
| Data security             | Ollama + Qwen deployed locally | For internal environments where data must stay in-house. |

Use a lower-cost model for development, then validate with a more capable model before launch. OpenAI-compatible APIs often make switching models as simple as changing the base URL.

### What Are Common Enterprise AI Application Problems?

| Problem                   | Symptom                                                       | Mitigation                                                             |
| ------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Thread pool exhaustion    | Slow LLM calls block Tomcat threads.                          | Use `SseEmitter` / WebFlux and asynchronous execution.                 |
| Long transactions         | LLM calls inside `@Transactional` methods use up connections. | Call the LLM outside the transaction.                                  |
| Uncontrolled costs        | Agent loops increase token usage.                             | Monitor token use and set alerts.                                      |
| Hallucinations            | LLM output contains false claims.                             | Retrieve evidence with RAG; consider a knowledge graph for validation. |
| Invalid structured output | JSON parsing fails.                                           | Use low Temperature, Strict Mode, and a retry loop.                    |

Stage 5 covers these topics. Use this table as a project checklist.

### What If I Don't Know Frontend Development?

Frontend work can slow down an AI project, especially chat interfaces, SSE rendering, and live Markdown. You can:

- Use open-source chat UI components such as ChatUI or LobeChat.
- Use AI coding tools such as Cursor or Claude Code to build a basic interface.
- Test backend logic with a CLI, Postman, or `curl`, then add the frontend later.

Get the backend workflow working first and improve the frontend over time.

### How Can I Keep Up with Changes in AI?

Follow a few sources:

- Spring AI and LangChain4j release notes for framework changes.
- Technical blogs from Anthropic, OpenAI, and Google for model and API updates.
- AI projects on GitHub Trending to see what developers are building.

With a solid foundation, learn new tools and protocols as needed. Understanding the fundamentals makes it easier to evaluate new releases.

## Appendix: Resume Skills After Moving into AI

Here are two resume examples: a detailed version for AI application roles and a shorter version to add AI skills to an engineering resume. Adapt them to your experience.

### Core Engineering Skills

- **Computer science fundamentals:** Computer networks, data structures and algorithms, and operating systems.
- **Java:** JVM tuning and production troubleshooting.
- **Frameworks:** Spring, Spring Boot, MyBatis, and related tools.
- **Databases and caching:** MySQL, Redis, and Elasticsearch, including query and performance optimization.
- **Distributed systems:** CAP, Raft, Spring Cloud Alibaba, and service fallback and circuit breaking under high concurrency.
- **Development and deployment:** Maven, Git, Docker, Linux deployment, and DevOps CI.

### AI Application Development and Engineering (Detailed)

For AI application roles, emphasizing production engineering:

- **AI frameworks:** Spring AI, LangChain4j, SSE, Function Calling, and MCP.
- **Prompt engineering and security:** Context Engineering, structured prompts (CoT, few-shot), prompt injection defenses, and correction loops for structured output.
- **RAG and knowledge bases:** RAG optimization, ETL pipelines, semantic caching, vector search, and private knowledge bases using pgvector or Milvus.
- **Agent development and orchestration:** Agentic Workflows, ReAct, long-running task state management, A2A, and multi-agent systems.
- **AI-assisted development:** Spec Coding, TDD, Cursor, Claude Code, code generation, and automated validation.

### AI Application Development and Engineering (Short)

For adding AI skills to a backend resume:

- **AI engineering:** Spring AI / LangChain4j, RAG optimization, vector databases, and private knowledge bases.
- **Agents and integrations:** Agentic Workflows, ReAct, Function Calling / Tool Calling, MCP, structured prompts, and prompt injection defenses.
- **AI-assisted development:** Spec Coding, TDD, Cursor, Claude Code, and automated validation.
