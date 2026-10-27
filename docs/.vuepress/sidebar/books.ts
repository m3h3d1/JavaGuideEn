import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const books = arraySidebar([
  {
    text: "Computer Science",
    link: "cs-basics",
    icon: ICONS.COMPUTER,
  },
  {
    text: "Databases",
    link: "database",
    icon: ICONS.DATABASE,
  },
  {
    text: "Search Engines",
    link: "search-engine",
    icon: ICONS.SEARCH,
  },
  {
    text: "Java",
    link: "java",
    icon: ICONS.JAVA,
  },
  {
    text: "Software Quality",
    link: "software-quality",
    icon: ICONS.HIGH_AVAILABLE,
  },

  {
    text: "Distributed Systems",
    link: "distributed-system",
    icon: ICONS.DISTRIBUTED,
  },
]);
