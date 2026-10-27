import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const roadmap = arraySidebar([
  {
    text: "Learning Roadmaps",
    icon: ICONS.ROADMAP,
    children: [
      { text: "Learning Roadmaps (2026)", link: "/roadmap/" },
      {
        text: "Java Backend Roadmap (2026)",
        link: "java-roadmap",
      },
      {
        text: "Java/Go to AI Roadmap (2026)",
        link: "java-to-ai-roadmap",
      },
      {
        text: "Backend to AI Agents Roadmap (2026)",
        link: "backend-to-ai-agent-roadmap",
      },
      {
        text: "Backend to Full-Stack Roadmap (2026)",
        link: "full-stack-roadmap",
      },
      {
        text: "Test Development Roadmap (2026)",
        link: "test-development-roadmap",
      },
    ],
  },
]);
