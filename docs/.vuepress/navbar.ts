import { navbar } from "vuepress-theme-hope";

export default navbar([
  { text: "Backend Development", icon: "mdi:language-java", link: "/home.md" },
  {
    text: "Computer Science",
    icon: "mdi:desktop-classic",
    link: "/cs-basics/",
  },
  { text: "AI Applications", icon: "mdi:robot-outline", link: "/ai/" },
  { text: "AI Coding", icon: "mdi:code-tags", link: "/ai-coding/" },
  {
    text: "Recommended",
    icon: "mdi:book-open-page-variant-outline",
    children: [
      { text: "Learning Roadmaps", icon: "mdi:map-outline", link: "/roadmap/" },
      {
        text: "Open-Source Projects",
        icon: "mdi:github",
        link: "/open-source-project/",
      },
      {
        text: "Technical Books",
        icon: "mdi:book-open-page-variant-outline",
        link: "/books/",
      },
      {
        text: "Life as a Developer",
        icon: "mdi:code-tags",
        link: "/high-quality-technical-articles/",
      },
    ],
  },
  {
    text: "About This Site",
    icon: "mdi:information-outline",
    children: [
      {
        text: "About the Author",
        icon: "mdi:account-edit-outline",
        link: "/about-the-author/",
      },
      {
        text: "Download PDFs",
        icon: "mdi:file-pdf-box",
        link: "/interview-preparation/pdf-interview-javaguide.md",
      },
      {
        text: "Interview Crash Course",
        icon: "mdi:file-pdf-box",
        link: "https://interview.javaguide.cn/home.html",
      },
      {
        text: "Changelog",
        icon: "mdi:history",
        link: "/timeline/",
      },
    ],
  },
]);
