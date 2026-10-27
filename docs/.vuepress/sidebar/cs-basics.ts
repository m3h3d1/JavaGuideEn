import { ICONS, createImportantSection } from "./constants.js";

export const csBasics = [
  {
    text: "Networking",
    prefix: "network/",
    icon: ICONS.NETWORK,
    children: [
      {
        text: "Interview Questions",
        icon: ICONS.INTERVIEW,
        children: [
          {
            text: "⭐️Common Computer Networking Interview Questions (Part 1)",
            link: "other-network-questions",
          },
          {
            text: "⭐️Common Computer Networking Interview Questions (Part 2)",
            link: "other-network-questions2",
          },
          // { text: "Computer Networking Fundamentals", link: "computer-network-xiexiren-summary" },
        ],
      },
      {
        text: "Fundamentals",
        icon: ICONS.STAR,
        collapsible: true,
        children: [
          {
            text: "The OSI Seven-Layer Model and TCP/IP Four-Layer Model",
            link: "osi-and-tcp-ip-model",
          },
          {
            text: "What Happens After You Enter a URL?",
            link: "the-whole-process-of-accessing-web-pages",
          },
        ],
      },
      {
        text: "Application Layer",
        icon: ICONS.CODE,
        collapsible: true,
        children: [
          {
            text: "⭐️Common Application-Layer Protocols",
            link: "application-layer-protocol",
          },
          { text: "⭐️HTTP vs HTTPS", link: "http-vs-https" },
          { text: "⭐️Why Use RPC When We Have HTTP?", link: "http-vs-rpc" },
          {
            text: "RSA and ECDHE in the HTTPS Handshake",
            link: "https-rsa-vs-ecdhe",
          },
          { text: "HTTP 1.0 vs HTTP 1.1", link: "http1.0-vs-http1.1" },
          { text: "Common HTTP Status Codes", link: "http-status-codes" },
          { text: "The Domain Name System (DNS)", link: "dns" },
        ],
      },
      {
        text: "Transport Layer",
        icon: ICONS.NETWORK,
        collapsible: true,
        children: [
          {
            text: "⭐️TCP Three-Way Handshake and Four-Way Teardown",
            link: "tcp-connection-and-disconnection",
          },
          { text: "TCP TIME_WAIT Explained", link: "tcp-time-wait" },
          {
            text: "TCP Keepalive vs. HTTP Keep-Alive",
            link: "tcp-keepalive-vs-http-keepalive",
          },
          {
            text: "TCP Byte Streams vs. UDP Datagrams",
            link: "tcp-byte-stream-udp-datagram",
          },
          {
            text: "⭐️How TCP Ensures Reliable Delivery",
            link: "tcp-reliability-guarantee",
          },
          {
            text: "If Ping Works, Does That Mean TCP Will Connect?",
            link: "can-ping-but-tcp-may-not-connect",
          },
          {
            text: "Can TCP and UDP Use the Same Port?",
            link: "can-tcp-and-udp-use-the-same-port",
          },
          {
            text: "How Many TCP Connections Can a Host Maintain?",
            link: "maximum-number-of-tcp-connections-per-host",
          },
        ],
      },
      {
        text: "Network Layer",
        icon: ICONS.NETWORK,
        collapsible: true,
        children: [
          { text: "The ARP Protocol", link: "arp" },
          { text: "The NAT Protocol", link: "nat" },
        ],
      },
      {
        text: "Security",
        icon: ICONS.SECURITY,
        collapsible: true,
        children: [
          {
            text: "Common Types of Network Attacks",
            link: "network-attack-means",
          },
        ],
      },
    ],
  },
  {
    text: "Operating Systems",
    prefix: "operating-system/",
    icon: ICONS.OS,
    children: [
      {
        text: "Interview Questions",
        icon: ICONS.INTERVIEW,
        children: [
          {
            text: "⭐️Common Operating Systems Interview Questions (Part 1)",
            link: "operating-system-basic-questions-01",
          },
          {
            text: "⭐️Common Operating Systems Interview Questions (Part 2)",
            link: "operating-system-basic-questions-02",
          },
        ],
      },
      {
        text: "Key Interview Topics",
        icon: ICONS.STAR,
        children: [
          { text: "⭐️Virtual Memory Explained", link: "virtual-memory" },
          { text: "⭐️I/O Multiplexing Explained", link: "io-multiplexing" },
          { text: "⭐️Zero-Copy Explained", link: "zero-copy" },
        ],
      },
      {
        text: "Memory and File Systems",
        icon: ICONS.OS,
        collapsible: true,
        children: [
          { text: "Memory Management Explained", link: "memory-management" },
          { text: "File Systems Explained", link: "file-system" },
        ],
      },
      {
        text: "Processes and Threads",
        icon: ICONS.STAR,
        collapsible: true,
        children: [
          {
            text: "⭐️Processes and Threads Explained",
            link: "process-and-thread",
          },
          { text: "⭐️Locks and Synchronization", link: "os-lock-and-sync" },
          { text: "⭐️Deadlocks Explained", link: "dead-lock" },
          {
            text: "Interrupts, Exceptions, and System Calls",
            link: "interrupt-exception-syscall",
          },
          {
            text: "CPU Scheduling and System Load",
            link: "cpu-scheduling-and-load",
          },
          { text: "Interprocess Communication (IPC)", link: "ipc" },
        ],
      },
      {
        text: "Linux",
        icon: ICONS.LINUX,
        children: [
          { text: "Linux Fundamentals", link: "linux-intro" },
          { text: "Shell Scripting Fundamentals", link: "shell-intro" },
        ],
      },
    ],
  },
  {
    text: "Data Structures",
    prefix: "data-structure/",
    icon: ICONS.DATA_STRUCTURE,
    collapsible: true,
    children: [
      {
        text: "Topic Guide",
        link: "/cs-basics/data-structure/",
      },
      {
        text: "Basic Structures",
        collapsible: true,
        children: [
          { text: "Linear Data Structures", link: "linear-data-structure" },
          { text: "⭐️Hash Tables", link: "hash-table" },
        ],
      },
      {
        text: "Trees and Heaps",
        collapsible: true,
        children: [
          { text: "⭐️Trees", link: "tree" },
          { text: "⭐️Heaps", link: "heap" },
          { text: "Red-Black Trees", link: "red-black-tree" },
        ],
      },
      {
        text: "Graphs and Sets",
        collapsible: true,
        children: [
          { text: "Graphs", link: "graph" },
          { text: "⭐️Disjoint-Set Union", link: "union-find" },
        ],
      },
      {
        text: "Strings and Ordered Indexes",
        collapsible: true,
        children: [
          { text: "Trie (Prefix Tree)", link: "trie" },
          { text: "Skip Lists", link: "skip-list" },
        ],
      },
      {
        text: "Practical Data Structures",
        collapsible: true,
        children: [
          { text: "⭐️Bloom Filters", link: "bloom-filter" },
          { text: "⭐️LRU Cache", link: "lru-cache" },
        ],
      },
    ],
  },
  {
    text: "Algorithms",
    prefix: "algorithms/",
    icon: ICONS.ALGORITHM,
    collapsible: true,
    children: [
      { text: "Complexity Analysis", link: "complexity-analysis" },
      { text: "Binary Search", link: "binary-search" },
      {
        text: "Two Pointers and Sliding Windows",
        link: "two-pointers-and-sliding-window",
      },
      { text: "DFS and BFS", link: "dfs-bfs" },
      { text: "Backtracking", link: "backtracking" },
      { text: "Dynamic Programming", link: "dynamic-programming" },
      { text: "Greedy Algorithms", link: "greedy" },
      { text: "Top K Problems", link: "top-k" },
      {
        text: "Classic Algorithmic Techniques",
        link: "classical-algorithm-problems-recommendations",
      },
      {
        text: "LeetCode Data Structures",
        link: "common-data-structures-leetcode-recommendations",
      },
      { text: "String Algorithm Problems", link: "string-algorithm-problems" },
      {
        text: "Linked-List Algorithm Problems",
        link: "linkedlist-algorithm-problems",
      },
      { text: "Sword Offer", link: "the-sword-refers-to-offer" },
      {
        text: "Classic Sorting Algorithms",
        link: "10-classical-sorting-algorithms",
      },
    ],
  },
];
