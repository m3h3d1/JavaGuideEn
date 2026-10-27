import { getText } from "@vuepress/helper";
import { getDirname, path } from "vuepress/utils";
import { hopeTheme } from "vuepress-theme-hope";

import navbar from "./navbar.js";
import sidebar from "./sidebar/index.js";

const __dirname = getDirname(import.meta.url);
const docsearchAppId = process.env.DOCSEARCH_APP_ID;
const docsearchApiKey = process.env.DOCSEARCH_API_KEY;
const docsearchIndexName = process.env.DOCSEARCH_INDEX_NAME;
const docsearchOptions =
  docsearchAppId && docsearchApiKey && docsearchIndexName
    ? {
        appId: docsearchAppId,
        apiKey: docsearchApiKey,
        indexName: docsearchIndexName,
        locales: {
          "/": {
            placeholder: "Search JavaGuide",
          },
        },
      }
    : null;
const MIN_META_DESCRIPTION_LENGTH = 150;
const MAX_META_DESCRIPTION_LENGTH = 160;

// Keep high-value legacy URLs found in Search Console working after file moves.
// The redirect plugin normalizes directory-style sources to `index.html`.
const legacyRedirects = {
  "/ai/ai-coding/cc-glm5.1.html": "/ai-coding/cases/cc-glm5.1.html",
  "/ai/ai-coding/trae-m2.7.html": "/ai-coding/cases/trae-m2.7.html",
  "/ai/llm-basis/ai-ide.html": "/ai-coding/practices/ai-ide.html",
  "/category/分布式系统/": "/distributed-system/",
  "/cs-basics/data-structure/bloom-filter/":
    "/cs-basics/data-structure/bloom-filter.html",
  "/cs-basics/network/osi&tcp-ip-model.html":
    "/cs-basics/network/osi-and-tcp-ip-model.html",
  "/database/mysql/mysql知识点&面试题总结/":
    "/database/mysql/mysql-questions-01.html",
  "/distributed-system/protocol/gossip-protocl.html":
    "/distributed-system/protocol/gossip-protocol.html",
  "/distributed-system/theorem&algorithm&protocol/cap&base-theorem.html":
    "/distributed-system/protocol/cap-and-base-theorem.html",
  "/distributed-system/theorem&algorithm&protocol/paxos-algorithm.html":
    "/distributed-system/protocol/paxos-algorithm.html",
  "/distributed-system/theorem&algorithm&protocol/raft-algorithm.html":
    "/distributed-system/protocol/raft-algorithm.html",
  "/distributed-system/理论&算法/paxos&raft算法/":
    "/distributed-system/protocol/",
  "/high-performance/读写分离&分库分表/":
    "/high-performance/read-and-write-separation-and-library-subtable.html",
  "/interview-preparation/java-interview-plan.html":
    "/interview-preparation/backend-interview-plan.html",
  "/java/basis/why-there-only-value-passing-in-java/":
    "/java/basis/why-there-only-value-passing-in-java.html",
  "/java/collection/arraylist-source-code/":
    "/java/collection/arraylist-source-code.html",
  "/java/collection/concurrent-hash-map-source-code/":
    "/java/collection/concurrent-hash-map-source-code.html",
  "/java/collection/hashmap-source-code/":
    "/java/collection/hashmap-source-code.html",
  "/java/concurrent/java并发进阶常见面试题总结/":
    "/java/concurrent/java-concurrent-questions-02.html",
  "/java/jvm/jvm-parameters-intro/": "/java/jvm/jvm-parameters-intro.html",
  "/system-design/basis/naming/": "/system-design/basis/naming.html",
  "/system-design/framework/netty/": "/system-design/framework/netty.html",
  "/system-design/security/advantages&disadvantages-of-jwt.html":
    "/system-design/security/advantages-and-disadvantages-of-jwt.html",
  "/zh-CN/jwt-authentication-pros-and-cons/":
    "/system-design/security/advantages-and-disadvantages-of-jwt.html",
};

const segmentDisplayNames = {
  ai: "AI",
  "ai-coding": "AI Coding",
  algorithms: "Algorithms",
  basis: "Fundamentals",
  books: "Technical Books",
  collection: "Java Collections",
  concurrent: "Java Concurrency",
  "cs-basics": "Computer Science",
  "data-structure": "Data Structures",
  database: "Databases",
  "distributed-process-coordination": "Distributed Coordination",
  "distributed-system": "Distributed Systems",
  docker: "Docker",
  elasticsearch: "Elasticsearch",
  framework: "Frameworks",
  git: "Git",
  gradle: "Gradle",
  "high-availability": "High Availability",
  "high-performance": "High Performance",
  "interview-preparation": "Interview Preparation",
  io: "Java IO",
  java: "Java",
  javaguide: "JavaGuide",
  jvm: "JVM",
  "message-queue": "Message Queues",
  mysql: "MySQL",
  network: "Computer Networks",
  "new-features": "Java Features",
  "open-source-project": "Open-Source Projects",
  "operating-system": "Operating Systems",
  protocol: "Distributed Protocols and Algorithms",
  rag: "RAG",
  redis: "Redis",
  rpc: "RPC",
  security: "Security",
  sql: "SQL",
  "system-design": "System Design",
  tools: "Developer Tools",
  zookeeper: "ZooKeeper",
};

const normalizeDescriptionText = (value) =>
  String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
};

const formatPathSegment = (segment) =>
  segmentDisplayNames[segment] ??
  decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getPathTopic = (page) =>
  page.path.split("/").filter(Boolean).map(formatPathSegment).join(" / ");

const getHeaderTitles = (page) =>
  toArray(page.headers)
    .map(({ title }) => normalizeDescriptionText(title))
    .filter(Boolean)
    .slice(0, 4);

const getPageText = (page, app) =>
  normalizeDescriptionText(
    getText(
      page.data.excerpt ?? page.contentRendered ?? page.content ?? "",
      app.siteData.base,
      {
        length: 220,
        singleLine: true,
      },
    ),
  );

const trimDescription = (description) => {
  if (description.length <= MAX_META_DESCRIPTION_LENGTH) return description;

  const trimmed = description.slice(0, MAX_META_DESCRIPTION_LENGTH);
  const lastStop = Math.max(
    trimmed.lastIndexOf("."),
    trimmed.lastIndexOf("!"),
    trimmed.lastIndexOf("?"),
    trimmed.lastIndexOf(";"),
  );

  if (lastStop >= MIN_META_DESCRIPTION_LENGTH - 5)
    return trimmed.slice(0, lastStop + 1);

  const lastSoftStop = trimmed.lastIndexOf(",");

  if (lastSoftStop >= MIN_META_DESCRIPTION_LENGTH - 5) {
    const base = trimmed.slice(0, lastSoftStop).replace(/[,;\s]+$/, "");
    const result = `${base}, and related topics.`;

    return result.length <= MAX_META_DESCRIPTION_LENGTH
      ? result
      : `${result.slice(0, MAX_META_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
  }

  return `${description.slice(0, MAX_META_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
};

const buildSeoDescription = (page, app) => {
  const existingDescription = normalizeDescriptionText(
    page.frontmatter.description,
  );

  if (existingDescription.length >= MIN_META_DESCRIPTION_LENGTH)
    return trimDescription(existingDescription);

  if (page.path === "/")
    return trimDescription(
      "JavaGuide is a study guide for Java backend developers and interview candidates. It covers Java fundamentals, collections, concurrency, the JVM, MySQL, Redis, distributed systems, high concurrency, high availability, system design, message queues, computer science, and AI application development. Use it to prepare for interviews, review key topics, and plan your learning.",
    );

  if (page.path === "/home.html")
    return trimDescription(
      "The JavaGuide home page brings together Java backend learning roadmaps, core topic guides, and popular interview questions. It covers Java fundamentals, concurrency, the JVM, databases, Redis, distributed systems, system design, high performance, high availability, computer science, and AI application development.",
    );

  if (page.path === "/404.html")
    return trimDescription(
      "This page could not be found. Continue exploring JavaGuide's Java interview guide, backend topics, computer science fundamentals, databases, Redis, distributed systems, system design, and AI application development resources.",
    );

  const title = normalizeDescriptionText(page.title);
  const category = toArray(page.frontmatter.category)
    .map(normalizeDescriptionText)
    .filter(Boolean);
  const tags = toArray(page.frontmatter.tag ?? page.frontmatter.tags)
    .map(normalizeDescriptionText)
    .filter(Boolean)
    .slice(0, 4);
  const headers = getHeaderTitles(page);
  const focusItems = [...headers, ...tags].filter(Boolean).slice(0, 5);
  const topic = getPathTopic(page) || title || category[0] || "JavaGuide";
  const pageText = getPageText(page, app);
  const parts = [
    existingDescription || (title ? `${title}: ` : ""),
    focusItems.length ? `Key topics include ${focusItems.join(", ")}. ` : "",
    `This page uses JavaGuide's topic guides to explain ${topic}: core concepts, practical approaches, common questions, and interview topics. It covers how things work, when to use them, trade-offs, and lessons from practice.`,
    pageText && !existingDescription.includes(pageText.slice(0, 24))
      ? pageText
      : "",
  ];

  return trimDescription(
    normalizeDescriptionText(parts.filter(Boolean).join("")),
  );
};

export default hopeTheme({
  hostname: "https://m3h3d1.github.io/",
  logo: "/logo.png",
  favicon: "/favicon.ico",

  author: {
    name: "Guide",
    url: "https://javaguide.cn/article/",
  },

  repo: "https://github.com/m3h3d1/JavaGuideEn",
  docsDir: "docs",
  pure: true,
  focus: false,
  print: false,
  breadcrumb: false,
  navbar,
  sidebar,
  footer:
    '<a href="https://beian.miit.gov.cn/" target="_blank">Hubei ICP filing no. 鄂ICP备2020015769号-1</a>',
  displayFooter: true,

  pageInfo: ["Author", "Category", "Tag", "Original", "Word", "ReadingTime"],

  blog: {
    intro: "/about-the-author/",
    medias: {
      Zhihu: "https://www.zhihu.com/people/javaguide",
      Github: "https://github.com/Snailclimb",
      Gitee: "https://gitee.com/SnailClimb",
    },
  },

  markdown: {
    align: true,
    codeTabs: true,
    mermaid: true,
    gfm: true,
    linksCheck: {
      build: "error",
    },
    include: {
      resolvePath: (file, cwd) => {
        if (file.startsWith("@"))
          return path.resolve(
            __dirname,
            "../snippets",
            file.replace("@", "./"),
          );

        return path.resolve(cwd, file);
      },
    },
    tasklist: true,
  },

  plugins: {
    blog: true,
    seo: {
      canonical: "https://m3h3d1.github.io/JavaGuideEn",
      fallBackImage: "https://javaguide.cn/logo.png",
      ogp: (ogp, page, app) => ({
        ...ogp,
        "og:description": buildSeoDescription(page, app),
      }),
      jsonLd: (jsonLD, page, app) => ({
        ...jsonLD,
        description: buildSeoDescription(page, app),
      }),
      customHead: (head, page, app) => {
        page.frontmatter.description = buildSeoDescription(page, app);

        if (page.path === "/")
          head.push([
            "script",
            { type: "application/ld+json" },
            JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "JavaGuide",
              alternateName: "Java Interview Guide",
              url: "https://m3h3d1.github.io/JavaGuideEn/",
              inLanguage: "en-US",
              description:
                "JavaGuide is a guide to Java interviews and backend engineering, covering Java, MySQL, Redis, Spring, distributed systems, and system design.",
              publisher: {
                "@type": "Person",
                name: "Guide",
                url: "https://javaguide.cn/article/",
              },
            }),
          ]);

        if (page.path === "/home.html")
          head.push([
            "script",
            { type: "application/ld+json" },
            JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Core Java Interview Topics",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Java Fundamentals Interview Questions",
                  url: "https://javaguide.cn/java/basis/java-basic-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Java Collections Interview Questions",
                  url: "https://javaguide.cn/java/collection/java-collection-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Java Concurrency Interview Questions",
                  url: "https://javaguide.cn/java/concurrent/java-concurrent-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: "JVM Interview Questions",
                  url: "https://javaguide.cn/java/jvm/memory-area.html",
                },
                {
                  "@type": "ListItem",
                  position: 5,
                  name: "Spring Interview Questions",
                  url: "https://javaguide.cn/system-design/framework/spring/spring-knowledge-and-questions-summary.html",
                },
                {
                  "@type": "ListItem",
                  position: 6,
                  name: "MySQL Interview Questions",
                  url: "https://javaguide.cn/database/mysql/mysql-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 7,
                  name: "Redis Interview Questions",
                  url: "https://javaguide.cn/database/redis/redis-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 8,
                  name: "System Design Interview Questions",
                  url: "https://javaguide.cn/system-design/system-design-questions.html",
                },
              ],
            }),
          ]);

        if (page.path === "/ai/")
          head.push([
            "script",
            { type: "application/ld+json" },
            JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Core AI Application Development Interview Topics",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "AI Application Development Interview Guide",
                  url: "https://javaguide.cn/ai/interview-questions/ai-interview-guide.html",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "LLM Fundamentals Interview Questions",
                  url: "https://javaguide.cn/ai/interview-questions/llm-interview-questions.html",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "AI Agent Interview Questions",
                  url: "https://javaguide.cn/ai/interview-questions/agent-interview-questions.html",
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: "RAG Interview Questions",
                  url: "https://javaguide.cn/ai/interview-questions/rag-interview-questions.html",
                },
                {
                  "@type": "ListItem",
                  position: 5,
                  name: "AI System Design Interview Questions",
                  url: "https://javaguide.cn/ai/interview-questions/ai-system-design-interview-questions.html",
                },
                {
                  "@type": "ListItem",
                  position: 6,
                  name: "AI Application System Design",
                  url: "https://javaguide.cn/ai/system-design/ai-application-architecture.html",
                },
              ],
            }),
          ]);

        if (page.path === "/cs-basics/")
          head.push([
            "script",
            { type: "application/ld+json" },
            JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Core Computer Science Interview Topics",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Common Computer Networking Interview Questions",
                  url: "https://javaguide.cn/cs-basics/network/other-network-questions.html",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Common Operating Systems Interview Questions",
                  url: "https://javaguide.cn/cs-basics/operating-system/operating-system-basic-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Linear Data Structures",
                  url: "https://javaguide.cn/cs-basics/data-structure/linear-data-structure.html",
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: "Ten Classic Sorting Algorithms",
                  url: "https://javaguide.cn/cs-basics/algorithms/10-classical-sorting-algorithms.html",
                },
                {
                  "@type": "ListItem",
                  position: 5,
                  name: "HTTP and HTTPS",
                  url: "https://javaguide.cn/cs-basics/network/http-vs-https.html",
                },
                {
                  "@type": "ListItem",
                  position: 6,
                  name: "TCP Three-Way Handshake and Four-Way Teardown",
                  url: "https://javaguide.cn/cs-basics/network/tcp-connection-and-disconnection.html",
                },
              ],
            }),
          ]);
      },
    },
    sitemap: {
      changefreq: "monthly",
    },

    redirect: {
      config: legacyRedirects,
    },

    // The upstream copyright plugin can throw during hydration if `#app` is unavailable.
    // Keep it disabled until the plugin adds a null-safe mount path.
    copyright: false,

    feed: {
      atom: true,
      json: true,
      rss: true,
    },

    icon: {
      assets: "iconify",
    },

    photoSwipe: false,

    // Configure the environment variables above after obtaining a DocSearch key. Until then, local search indexing is disabled.
    ...(docsearchOptions ? { docsearch: docsearchOptions } : {}),
    search: false,
  },
});
