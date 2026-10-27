import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const aiCoding = arraySidebar([
  {
    text: "Getting Started",
    icon: ICONS.BASIC,
    children: [
      {
        text: "Open-Ended AI Coding Interview Questions",
        link: "practices/ai-ide",
      },
      {
        text: "AI Coding: CLI or IDE?",
        link: "practices/cli-vs-ide",
      },
    ],
  },
  {
    text: "Claude Code and Codex",
    icon: ICONS.CODE,
    children: [
      {
        text: "⭐️Claude Code Guide",
        link: "practices/claudecode-tips",
      },
      {
        text: "Claude Code Commands Explained",
        link: "practices/claudecode-commands",
      },
      {
        text: "⭐️OpenAI Codex Best Practices",
        link: "practices/codex-best-practices",
      },
      {
        text: "A Polished OMP Alternative for Claude Code",
        link: "practices/oh-my-pi",
      },
      {
        text: "Installing and Configuring Ghostty: Tips and Tricks",
        link: "practices/ghostty",
      },
      {
        text: "Managing Multiple Sessions with Claude Code Agent View",
        link: "practices/claudecode-agentview",
      },
    ],
  },
  {
    text: "How Claude Code Works",
    icon: ICONS.CODE,
    prefix: "principles/",
    children: [
      {
        text: "Claude Code Context Management",
        link: "claude-code-context-management",
      },
      {
        text: "Claude Code Memory System",
        link: "claude-code-memory",
      },
      {
        text: "How Claude Code Skills Work",
        link: "claude-code-skills",
      },
      {
        text: "How Claude Code Hooks Work",
        link: "claude-code-hooks",
      },
      {
        text: "Claude Code Multi-Agent System",
        link: "claude-code-multi-agent",
      },
    ],
  },
  {
    text: "Standards and Productivity",
    icon: ICONS.PERFORMANCE,
    children: [
      {
        text: "⭐️Practical Vibe Coding Tips",
        link: "practices/the-cool-tricks-for-vibe-coding",
      },
      {
        text: "Spec Coding: Specification-Driven Development",
        link: "practices/spec-coding",
      },
      {
        text: "⭐️CLAUDE.md Best Practices",
        link: "practices/claude-md-best-practices",
      },
      {
        text: "⭐️Essential Skills for AI Coding",
        link: "practices/programmer-essential-skills",
      },
      {
        text: "Choosing and Pruning AI Coding Skills",
        link: "practices/skill-selection-and-pruning",
      },
      {
        text: "A Deep Dive into mattpocock/skills",
        link: "practices/mattpocock-skills",
      },
      {
        text: "A Useful AI Diagramming Skill",
        link: "practices/drawio-chart-skill",
      },
    ],
  },
  {
    text: "AI Coding in Practice",
    icon: ICONS.PROJECT,
    children: [
      {
        text: "IDEA and Qoder Plugins in Practice",
        link: "cases/idea-qoder-plugin",
      },
      {
        text: "Trae and MiniMax in Practice",
        link: "cases/trae-m2.7",
      },
      {
        text: "Using Third-Party Models with Claude Code",
        link: "cases/cc-glm5.1",
      },
      {
        text: "DeepSeek V4 and Claude Code in Practice",
        link: "cases/deepseek-v4-claude-code",
      },
      {
        text: "MiniMax M3 and Claude Code in Practice",
        link: "cases/cc-m3",
      },
      {
        text: "Kimi K3 in Practice",
        link: "cases/kimi-k3",
      },
      {
        text: "IDEA and CC GUI Plugin in Practice",
        link: "project/cc-guide",
      },
    ],
  },
]);
