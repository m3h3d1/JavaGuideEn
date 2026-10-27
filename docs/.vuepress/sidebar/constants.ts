/**
 * Sidebar icon constants
 * Centralized icons used by sidebar configuration
 */
export const ICONS = {
  // Basic icons
  STAR: "mdi:star-outline",
  BASIC: "mdi:book-open-page-variant-outline",
  CODE: "mdi:code-tags",
  DESIGN: "mdi:palette-swatch-outline",
  ROADMAP: "mdi:map-outline",

  // Technical areas
  JAVA: "mdi:language-java",
  COMPUTER: "mdi:desktop-classic",
  DATABASE: "mdi:database-outline",
  NETWORK: "mdi:lan",

  // Frameworks and tools
  SPRING_BOOT: "mdi:leaf",
  MYBATIS: "mdi:database-cog-outline",
  NETTY: "mdi:server-network-outline",

  // Databases
  MYSQL: "mdi:database",
  REDIS: "mdi:database-sync-outline",
  ELASTICSEARCH: "mdi:database-search-outline",
  MONGODB: "mdi:database-marker-outline",
  SQL: "mdi:database-search",

  // Developer Tools
  TOOL: "mdi:tools",
  MAVEN: "mdi:package-variant-closed",
  GRADLE: "mdi:cog-outline",
  GIT: "mdi:git",
  DOCKER: "mdi:docker",
  IDEA: "mdi:application-brackets-outline",

  // System Design
  COMPONENT: "mdi:widgets-outline",
  CONTAINER: "mdi:cube-outline",
  SECURITY: "mdi:shield-lock-outline",

  // Distributed Systems
  DISTRIBUTED: "mdi:transit-connection-variant",
  GATEWAY: "mdi:gate",
  ID: "mdi:identifier",
  LOCK: "mdi:lock-outline",
  TRANSACTION: "mdi:bank-transfer",
  RPC: "mdi:api",
  FRAMEWORK: "mdi:layers-outline",

  // High Performance
  PERFORMANCE: "mdi:speedometer",
  CDN: "mdi:cloud-outline",
  LOAD_BALANCING: "mdi:scale-balance",
  MQ: "mdi:message-processing-outline",

  // High Availability
  HIGH_AVAILABLE: "mdi:check-network-outline",

  // Operating Systems
  OS: "mdi:desktop-classic",
  LINUX: "mdi:linux",
  VIRTUAL_MACHINE: "mdi:server",

  // Data structures and algorithms
  DATA_STRUCTURE: "mdi:graph-outline",
  ALGORITHM: "mdi:chart-tree",

  // Other
  FEATURED: "mdi:star-four-points-outline",
  INTERVIEW: "mdi:briefcase-outline",
  EXPERIENCE: "mdi:chart-timeline-variant",
  CHAT: "mdi:comment-text-outline",
  BOOK: "mdi:book-open-page-variant-outline",
  PROJECT: "mdi:projector-screen-outline",
  LIBRARY: "mdi:library-outline",
  MACHINE_LEARNING: "mdi:robot-outline",
  BIG_DATA: "mdi:database-search-outline",
  SEARCH: "mdi:magnify",
  WORK: "mdi:office-building-outline",
} as const;

/**
 * Common text constants
 */
export const COMMON_TEXT = {
  IMPORTANT_POINTS: "Key Topics",
  SOURCE_CODE_ANALYSIS: "Source Code Analysis",
} as const;

/**
 * Helper: create a key topics group
 */
export const createImportantSection = (children: any[]) => ({
  text: COMMON_TEXT.IMPORTANT_POINTS,
  icon: ICONS.STAR,
  collapsible: true,
  children,
});

/**
 * Helper: create a source code analysis group
 */
export const createSourceCodeSection = (children: any[]) => ({
  text: COMMON_TEXT.SOURCE_CODE_ANALYSIS,
  icon: ICONS.STAR,
  collapsible: true,
  children,
});
