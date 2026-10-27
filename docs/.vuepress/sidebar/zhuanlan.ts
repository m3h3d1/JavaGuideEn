import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const zhuanlan = arraySidebar([
  {
    text: "Hands-on Projects",
    icon: ICONS.PROJECT,
    collapsible: false,
    children: [
      { text: "Spring AI Interview Assistant", link: "interview-guide" },
      {
        text: "Build an RPC Framework from Scratch",
        link: "handwritten-rpc-framework",
      },
    ],
  },
  {
    text: "Interview Resources",
    icon: ICONS.INTERVIEW,
    collapsible: false,
    children: [
      { text: "Java Interview Guide", link: "java-mian-shi-zhi-bei" },
      {
        text: "Popular Backend System Design and Scenario Questions",
        link: "back-end-interview-high-frequency-system-design-and-scenario-questions",
      },
      {
        text: "Essential Java Source Code Series",
        link: "source-code-reading",
      },
    ],
  },
]);
