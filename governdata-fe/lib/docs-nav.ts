/** Single source of truth for docs header + sidebar. */

export type DocsSidebarLink = { title: string; href: string }

export type DocsSidebarSection = {
  title: string
  /** Primary route; first segment used for “current section” logic */
  href: string
  /** Pathname prefixes that count as this section (e.g. API = reference + api-guide) */
  pathPrefixes: string[]
  items: DocsSidebarLink[]
}

export const docsSidebarSections: DocsSidebarSection[] = [
  {
    title: "Overview",
    href: "/docs",
    pathPrefixes: ["/docs"],
    items: [],
  },
  {
    title: "Getting Started",
    href: "/docs/getting-started",
    pathPrefixes: ["/docs/getting-started"],
    items: [
      { title: "Base URL & transport", href: "/docs/getting-started#base-url" },
      { title: "Architecture", href: "/docs/getting-started#architecture-flow" },
      { title: "Health", href: "/docs/getting-started#health-check" },
      { title: "Provision tenant & key", href: "/docs/getting-started#provision" },
      { title: "Self-service: register & authorize", href: "/docs/getting-started#self-service" },
      { title: "Smoke validation", href: "/docs/getting-started#smoke-validation" },
    ],
  },
  {
    title: "Core Concepts",
    href: "/docs/concepts",
    pathPrefixes: ["/docs/concepts"],
    items: [
      { title: "Policy runtime", href: "/docs/concepts#policy-runtime" },
      { title: "Audit storage", href: "/docs/concepts#audit-storage" },
      { title: "IDs & uniqueness", href: "/docs/concepts#ids-uniqueness" },
      { title: "Best practices", href: "/docs/concepts#best-practices" },
    ],
  },
  {
    title: "API — guide & reference",
    href: "/docs/api-reference",
    pathPrefixes: ["/docs/api-reference", "/docs/api-guide"],
    items: [
      { title: "Full API guide (page)", href: "/docs/api-guide" },
      { title: "Portal & auth", href: "/docs/api-reference#portal-auth" },
      { title: "Admin APIs", href: "/docs/api-reference#admin-apis" },
      { title: "GET /actuator/health", href: "/docs/api-reference#health-check" },
      { title: "GET /actuator/info", href: "/docs/api-reference#actuator-info" },
      { title: "POST /authorize", href: "/docs/api-reference#authorize" },
      { title: "GET /audit/{id}", href: "/docs/api-reference#audit-get" },
      { title: "POST /audit/ingest", href: "/docs/api-reference#audit-ingest" },
      { title: "GET /audit/verify", href: "/docs/api-reference#audit-verify" },
      { title: "GET /metrics", href: "/docs/api-reference#metrics" },
      { title: "GET /compliance/catalog", href: "/docs/api-reference#compliance-catalog" },
      { title: "POST /compliance/evaluate", href: "/docs/api-reference#compliance-evaluate" },
      { title: "POST /benchmark", href: "/docs/api-reference#benchmark" },
      { title: "Error contract", href: "/docs/api-reference#error-contract" },
    ],
  },
  {
    title: "Security & Authentication",
    href: "/docs/security-auth",
    pathPrefixes: ["/docs/security-auth"],
    items: [
      { title: "Current implementation", href: "/docs/security-auth#current-status" },
      { title: "Provisioning (recommended)", href: "/docs/security-auth#provisioning-flow" },
      { title: "Production hardening", href: "/docs/security-auth#production-contract" },
      { title: "By deployment model", href: "/docs/security-auth#model-guidance" },
    ],
  },
  {
    title: "Deploy & operations",
    href: "/docs/deployment-models",
    pathPrefixes: ["/docs/deployment-models", "/docs/error-handling"],
    items: [
      { title: "Deployment models", href: "/docs/deployment-models" },
      { title: "Model A: On-prem", href: "/docs/deployment-models#model-a" },
      { title: "Model B: SaaS", href: "/docs/deployment-models#model-b" },
      { title: "Model C: Hybrid", href: "/docs/deployment-models#model-c" },
      { title: "Error handling", href: "/docs/error-handling" },
      { title: "Error contract", href: "/docs/error-handling#error-contract" },
      { title: "Status codes", href: "/docs/error-handling#status-codes" },
    ],
  },
  {
    title: "Integrations",
    href: "/docs/sdk-examples",
    pathPrefixes: ["/docs/sdk-examples", "/docs/spring-boot"],
    items: [
      { title: "SDK examples", href: "/docs/sdk-examples" },
      { title: "JavaScript/TypeScript", href: "/docs/sdk-examples#javascript" },
      { title: "Python", href: "/docs/sdk-examples#python" },
      { title: "cURL", href: "/docs/sdk-examples#curl" },
      { title: "Audit ingestion", href: "/docs/sdk-examples#audit-ingest" },
      { title: "Spring Boot", href: "/docs/spring-boot" },
      { title: "Configuration", href: "/docs/spring-boot#configuration" },
      { title: "WebClient bean", href: "/docs/spring-boot#webclient-bean" },
      { title: "Policy enforcement", href: "/docs/spring-boot#policy-enforcement" },
      { title: "Audit forwarding", href: "/docs/spring-boot#audit-forwarding" },
    ],
  },
]

export type DocsHeaderLink = {
  label: string
  href: string
  isActive: (pathname: string) => boolean
}

/** Top nav — mirrors main sidebar groups; “API” covers guide + reference */
export const docsHeaderLinks: DocsHeaderLink[] = [
  { label: "Overview", href: "/docs", isActive: (p) => p === "/docs" },
  {
    label: "Getting started",
    href: "/docs/getting-started",
    isActive: (p) => p.startsWith("/docs/getting-started"),
  },
  {
    label: "Concepts",
    href: "/docs/concepts",
    isActive: (p) => p.startsWith("/docs/concepts"),
  },
  {
    label: "API",
    href: "/docs/api-reference",
    isActive: (p) => p.startsWith("/docs/api-reference") || p.startsWith("/docs/api-guide"),
  },
  {
    label: "Security",
    href: "/docs/security-auth",
    isActive: (p) => p.startsWith("/docs/security-auth"),
  },
  {
    label: "Deploy",
    href: "/docs/deployment-models",
    isActive: (p) => p.startsWith("/docs/deployment-models") || p.startsWith("/docs/error-handling"),
  },
  {
    label: "Integrate",
    href: "/docs/sdk-examples",
    isActive: (p) => p.startsWith("/docs/sdk-examples") || p.startsWith("/docs/spring-boot"),
  },
  {
    label: "Resources",
    href: "/docs/resources",
    isActive: (p) => p.startsWith("/docs/resources"),
  },
]

export function sectionIsActive(pathname: string, section: DocsSidebarSection): boolean {
  if (section.pathPrefixes.length === 1 && section.pathPrefixes[0] === "/docs") {
    return pathname === "/docs"
  }
  return section.pathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function parseHref(href: string): { path: string; hash: string | null } {
  const i = href.indexOf("#")
  if (i === -1) return { path: href || "/", hash: null }
  return { path: href.slice(0, i) || "/", hash: href.slice(i + 1) || null }
}

/** Collect #ids for anchors on the current page (for scroll spy) */
export function anchorIdsForPathname(pathname: string): string[] {
  const ids: string[] = []
  for (const section of docsSidebarSections) {
    for (const item of section.items) {
      const { path, hash } = parseHref(item.href)
      if (!hash) continue
      if (path === pathname) ids.push(hash)
    }
  }
  return ids
}
