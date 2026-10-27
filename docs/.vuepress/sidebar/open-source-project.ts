import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const openSourceProject = arraySidebar([
  {
    text: "Technical Guides",
    link: "tutorial",
    icon: ICONS.BOOK,
  },
  {
    text: "Hands-on Projects",
    link: "practical-project",
    icon: ICONS.PROJECT,
  },
  {
    text: "AI",
    link: "machine-learning",
    icon: ICONS.MACHINE_LEARNING,
  },
  {
    text: "System Design",
    link: "system-design",
    icon: ICONS.DESIGN,
  },
  {
    text: "Tools and Libraries",
    link: "tool-library",
    icon: ICONS.LIBRARY,
  },
  {
    text: "Developer Tools",
    link: "tools",
    icon: ICONS.TOOL,
  },
  {
    text: "Big Data",
    link: "big-data",
    icon: ICONS.BIG_DATA,
  },
]);
