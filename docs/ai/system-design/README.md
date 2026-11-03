---
title: "AI System Design: Production Architecture, Security, Observability, and Voice Agents"
description: A learning path for AI system design, covering production AI architecture, agent security, model gateways, OpenTelemetry traces, AI observability, cost control, and real-time voice agents.
category: AI
tag:
  - AI System Design
  - Large Language Models
  - AI Application Development
  - AI Observability
sidebar: false
---

<!-- @include: @small-advertisement.snippet.md -->

A prompt demo that runs only shows that a model gave a usable answer for one example. In production, more engineering questions follow: How are models routed? What happens when a call fails? How are Token costs attributed? How can an Agent request be reconstructed? Who authorizes and audits sensitive tools?

This **AI system-design section** is for developers who have built demos and are preparing to integrate AI into real business systems. It takes a backend perspective, covering architecture layers, model gateways, RAG, memory, tool calls, observability, evaluation, security, and real-time voice workflows.

## Who Should Read This?

- Developers who have built prompt or RAG demos and want to know what engineering work remains before launch.
- Engineers designing model gateways, multi-model routing, fallbacks, rate limiting, caching, and cost controls.
- Candidates preparing for interviews about AI system design, model gateways, AI observability, and real-time voice agents.

## Key Concepts

- Production AI applications must be sustainable: output quality, latency, fallback behavior, cost, and auditing should be explainable and reviewable.
- A model gateway separates model services from business clients and centralizes multi-model routing, fallbacks, rate limiting, caching, Token budgets, cost attribution, observability, auditing, and security policies.
- Prompt management, RAG, memory, tool calls, asynchronous tasks, evaluation, and observability should be designed as one workflow. There is no universal template; choices depend on business risk, traffic, and cost constraints.
- AI observability should trace an API request through models, retrieval, tools, and agents, while handling cross-thread context propagation, sampling, sensitive data, and production bad-case feedback.
- Real-time voice agents add VAD, ASR, LLM, TTS, streaming playback, interruption handling, and edge-cloud deployment choices to text reasoning, making end-to-end latency more critical.

## Suggested Reading Order

1. [AI Application System Design](./ai-application-architecture.md): Learn which backend capabilities a prompt demo needs before entering production.
2. [LLM and Agent Security in Practice](./llm-security.md): Follow a tool call through direct and indirect prompt injection, resource authorization, approvals, MCP authorization, isolation, and security regression tests.
3. [LLM Gateways](./llm-gateway.md): Learn how a gateway handles model routing, fallbacks, rate limits, and cost attribution.
4. [AI Observability and Tracing](./ai-observability.md): Trace an incorrect answer through models, RAG, tools, and agents, then review context propagation, sampling, and evaluation feedback.
5. [AI Voice Technology](./ai-voice.md): Follow a voice-agent workflow from VAD and ASR through LLM, TTS, playback, and interruption handling.

## Core Guides

- [AI Application System Design](./ai-application-architecture.md): Covers prompt management, model gateways, RAG, memory, tool calls, asynchronous tasks, observability, evaluation, and security compliance.
- [LLM and Agent Security in Practice](./llm-security.md): Uses a refund-support agent to connect indirect prompt injection, tool overreach, MCP authorization, sensitive data, code isolation, supply chains, and security evaluation.
- [LLM Gateways](./llm-gateway.md): Explains gateway responsibilities for model routing, fallbacks, rate limits and quotas, Token budgets, cost attribution, observability, auditing, and caching.
- [AI Observability and Tracing](./ai-observability.md): Explains Session, Run, Trace, Span, and Attempt, and covers agent, RAG, and tool spans, context propagation, sampling, sensitive data, and Spring AI integration.
- [AI Voice Technology](./ai-voice.md): Covers the voice-system workflow, including VAD, ASR, LLM, TTS, streaming playback, interruption handling, and edge-cloud deployment choices.

## Common Questions

- Which engineering capabilities does a prompt demo need before production?
- When an agent reads external documents and calls write tools, how can injection, privilege escalation, and data exfiltration be prevented?
- Why do AI applications often route model calls through a gateway?
- What problems do multi-model routing, fallbacks, rate limiting, and caching solve?
- How should an agent request be divided into spans, and how can its trace be preserved across threads and services?
- How can failed production traces feed back into evaluation sets and regression checks?
- Why are latency, interruption handling, and edge-cloud choices more challenging for real-time voice agents?

## Summary

The challenge in production AI is not getting one model call to work; it is putting quality, latency, cost, permissions, and failure handling into one traceable workflow. Start with the application architecture to understand the layers, use a model gateway to centralize call management, and use traces to reconstruct RAG, tool, and agent execution. Then study voice agents to understand streaming, interruptions, and edge-cloud trade-offs in real-time scenarios. Choose the specific design based on business risk, traffic, and compliance requirements.

## Related Topics

- [AI Application Development](../)
- [LLM Fundamentals](../llm-basis/)
- [AI Agent Guides](../agent/)
- [RAG](../rag/)
- [AI Application Development Interview Questions](../interview-questions/)

<!-- @include: @article-footer.snippet.md -->
