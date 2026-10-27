import { createRequire } from "node:module";
import { viteBundler } from "@vuepress/bundler-vite";
import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

const require = createRequire(import.meta.url);
const mermaidComponentPath = require.resolve(
  "@vuepress/plugin-markdown-chart/client/components/Mermaid.js",
);

export default defineUserConfig({
  dest: "./dist",
  base: "/JavaGuideEn/",

  title: "JavaGuide",
  description:
    "JavaGuide is a study and interview guide for backend developers, covering Java, MySQL, Redis, distributed systems, high concurrency, high availability, and system design.",
  lang: "en-US",

  head: [
    // meta
    ["meta", { name: "robots", content: "all" }],
    ["meta", { name: "author", content: "Guide" }],
    // [
    //   "meta",
    //   {
    //     name: "keywords",
    //     content:
    //       "JavaGuide, backend interviews, backend development, Java interviews, Java fundamentals, concurrency, JVM, databases, MySQL, Redis, Spring, distributed systems, high concurrency, high performance, high availability, system design, message queues, caching, computer networks, Linux",
    //   },
    // ],
    // [
    //   "meta",
    //   {
    //     name: "description",
    //     content:
    //       "JavaGuide is a study and interview guide for backend developers, covering Java, MySQL, Redis, distributed systems, high concurrency, high availability, and system design.",
    //   },
    // ],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    // Load Baidu Analytics asynchronously to avoid blocking rendering.
    [
      "script",
      { defer: true },
      `var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "https://hm.baidu.com/hm.js?5dd2e8c97962d57b7b8fea1737c01743";
          hm.async = true;
          var s = document.getElementsByTagName("script")[0]; 
          s.parentNode.insertBefore(hm, s);
        })();`,
    ],
  ],

  bundler: viteBundler({
    viteOptions: {
      resolve: {
        alias: {
          "@vuepress/plugin-markdown-chart/client/components/Mermaid.js":
            mermaidComponentPath,
        },
      },
      css: {
        preprocessorOptions: {
          scss: {
            silenceDeprecations: ["if-function"],
          },
        },
      },
    },
  }),

  theme,

  pagePatterns: [
    "**/*.md",
    "!**/*.snippet.md",
    "!**/TODO.md",
    "!.vuepress",
    "!node_modules",
  ],

  shouldPrefetch: false,
  shouldPreload: false,
});
