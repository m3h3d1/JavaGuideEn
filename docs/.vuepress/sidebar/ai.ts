import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const ai = arraySidebar([
  {
    text: "Getting Started",
    icon: ICONS.BASIC,
    children: [
      { text: "⭐️AI Core Concepts at a Glance", link: "ai-core-concepts" },
    ],
  },
  {
    text: "Interview Questions",
    icon: ICONS.INTERVIEW,
    prefix: "interview-questions/",
    children: [
      {
        text: "⭐️AI Application Development Interview Guide",
        link: "ai-interview-guide",
      },
      {
        text: "LLM Fundamentals Interview Questions",
        link: "llm-interview-questions",
      },
      {
        text: "AI Agent Interview Questions",
        link: "agent-interview-questions",
      },
      {
        text: "AI Agent Project Interview Guide",
        link: "agent-project-interview-guide",
      },
      { text: "RAG Interview Questions", link: "rag-interview-questions" },
      {
        text: "AI System Design Interview Questions",
        link: "ai-system-design-interview-questions",
      },
    ],
  },
  {
    text: "LLM Fundamentals",
    icon: ICONS.MACHINE_LEARNING,
    prefix: "llm-basis/",
    children: [
      {
        text: "How LLMs Work: An In-Depth Guide",
        link: "llm-operation-mechanism",
      },
      { text: "Engineering LLM API Calls", link: "llm-api-engineering" },
      {
        text: "Structured Outputs from LLMs",
        link: "structured-output-function-calling",
      },
      { text: "Evaluating AI Applications", link: "llm-evaluation" },
    ],
  },
  {
    text: "AI Agent",
    icon: ICONS.CHAT,
    prefix: "agent/",
    children: [
      { text: "⭐️AI Agent Fundamentals", link: "agent-basis" },
      { text: "⭐️AI Agent Memory Systems", link: "agent-memory" },
      { text: "Designing Multi-Agent Systems", link: "multi-agent" },
      {
        text: "Practical Guide to Prompt Engineering",
        link: "prompt-engineering",
      },
      {
        text: "Practical Guide to Context Engineering",
        link: "context-engineering",
      },
      { text: "Agent Skills: An In-Depth Guide", link: "skills" },
      { text: "The MCP Protocol: An In-Depth Guide", link: "mcp" },
      { text: "Harness Engineering Explained", link: "harness-engineering" },
      { text: "AI Workflows Explained", link: "workflow-graph-loop" },
      { text: "Loop Engineering Explained", link: "loop-engineering" },
    ],
  },
  {
    text: "RAG",
    icon: ICONS.SEARCH,
    prefix: "rag/",
    children: [
      { text: "⭐️RAG Fundamentals", link: "rag-basis" },
      {
        text: "RAG Document Processing and Chunking Strategies",
        link: "rag-document-processing",
      },
      {
        text: "⭐️RAG Vector Indexing Algorithms and Vector Databases",
        link: "rag-vector-store",
      },
      {
        text: "Updating Documents in a RAG Knowledge Base",
        link: "rag-knowledge-update",
      },
      { text: "GraphRAG Explained", link: "graphrag" },
      { text: "RAG Retrieval Optimization", link: "rag-optimization" },
      {
        text: "RAG Evaluation and Production Observability",
        link: "rag-evaluation",
      },
    ],
  },
  {
    text: "AI System Design",
    icon: ICONS.DESIGN,
    prefix: "system-design/",
    children: [
      {
        text: "AI Application System Design",
        link: "ai-application-architecture",
      },
      { text: "Practical LLM and Agent Security", link: "llm-security" },
      { text: "LLM Gateways Explained", link: "llm-gateway" },
      { text: "AI Observability and Tracing", link: "ai-observability" },
      { text: "AI Voice Technology Explained", link: "ai-voice" },
    ],
  },
]);
