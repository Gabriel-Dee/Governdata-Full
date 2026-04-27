import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Shield,
  Database,
  FileCheck,
  Code,
  Terminal,
  BookOpen,
  Lock,
  Building2,
  AlertTriangle,
  FileText,
} from "lucide-react"

const quickLinks = [
  {
    title: "Getting Started",
    description: "Provision tenant, API key, first authorize and audit calls",
    href: "/docs/getting-started",
    icon: BookOpen,
  },
  {
    title: "Full API guide",
    description: "Canonical Markdown index: every route, header, and curl example",
    href: "/docs/api-guide",
    icon: FileText,
  },
  {
    title: "API Reference",
    description: "Portal auth, admin, runtime — in-app summary with curl",
    href: "/docs/api-reference",
    icon: Code,
  },
  {
    title: "Core Concepts",
    description: "Understand policy runtime, audit storage, and IDs",
    href: "/docs/concepts",
    icon: Shield,
  },
  {
    title: "SDK Examples",
    description: "JavaScript, Python, and cURL code examples",
    href: "/docs/sdk-examples",
    icon: Terminal,
  },
  {
    title: "Security & Authentication",
    description: "Portal JWT, X-API-Key runtime, optional admin secret",
    href: "/docs/security-auth",
    icon: Lock,
  },
  {
    title: "Deployment Models",
    description: "On-prem, SaaS, and hybrid deployment guidance",
    href: "/docs/deployment-models",
    icon: Building2,
  },
  {
    title: "Spring Boot Integration",
    description: "Java-first integration blueprint and code snippets",
    href: "/docs/spring-boot",
    icon: Database,
  },
  {
    title: "Error Handling",
    description: "Structured error contract, status codes, and conflicts",
    href: "/docs/error-handling",
    icon: AlertTriangle,
  },
]

const features = [
  {
    title: "Policy Enforcement",
    description: "Evaluate access requests against JSON DSL or OPA/Rego policies",
    icon: Shield,
  },
  {
    title: "Audit Storage",
    description: "DB-only, blockchain-only, or both for maximum verifiability",
    icon: Database,
  },
  {
    title: "Compliance Ready",
    description: "Built for HIPAA, GDPR, and SOC2 requirements",
    icon: FileCheck,
  },
]

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="mb-16">
        <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
          Developer Guide
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
          Governance-as-a-Service
          <br />
          <span className="text-emerald-600">API Documentation</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Integrate EHR/EMR backends and internal apps with tenant-scoped <code className="rounded bg-muted px-1 text-sm">X-API-Key</code>{" "}
          and operator-provisioned organizations via <code className="rounded bg-muted px-1 text-sm">X-Admin-Secret</code>. Policy enforcement, audit anchoring, and compliance catalog APIs match the current backend.
        </p>
      </div>

      {/* Quick Links Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-16">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full hover:border-emerald-500/50 hover:shadow-md transition-all group cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-3">
                    <link.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="text-lg">{link.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{link.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* What this guide covers */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6">What this guide explains</h2>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
            <span>What each endpoint does and when to call it</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
            <span>Request/response contracts with full examples</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
            <span>Error handling expectations and status codes</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
            <span>Integration patterns and best practices</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
            <span>Deployment and authentication choices for hospital and enterprise environments</span>
          </li>
        </ul>
      </div>

      {/* Features Overview */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6">Core Capabilities</h2>
        <div className="grid gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-4 p-4 rounded-xl bg-muted/50">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Base URL Info */}
      <div className="rounded-xl border border-border p-6 bg-muted/30">
        <h3 className="font-semibold text-foreground mb-4">Quick reference</h3>
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground w-28 shrink-0">Base URL:</span>
            <code className="rounded bg-muted px-2 py-1 font-mono">http://localhost:8080</code>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground w-28 shrink-0">Runtime:</span>
            <span className="text-foreground text-sm">
              <code className="rounded bg-muted px-1 font-mono">X-API-Key</code> on authorize, audit, compliance, metrics
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground w-28 shrink-0">Portal:</span>
            <span className="text-foreground text-sm">
              <code className="rounded bg-muted px-1 font-mono">Bearer JWT</code> on <code className="rounded bg-muted px-1 font-mono">/api/v1/portal/*</code>;{" "}
              <code className="rounded bg-muted px-1 font-mono">/auth/register</code>, <code className="rounded bg-muted px-1 font-mono">/auth/login</code> unauthenticated
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground w-28 shrink-0">Admin:</span>
            <span className="text-foreground">
              <code className="rounded bg-muted px-1 font-mono">X-Admin-Secret</code> on <code className="rounded bg-muted px-1 font-mono">/api/v1/admin/*</code>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground w-28 shrink-0">Markdown:</span>
            <span className="flex flex-col gap-1 text-xs">
              <a href="/developer-platform-api-guide.md" className="text-emerald-600 hover:underline font-mono break-all">
                /developer-platform-api-guide.md
              </a>
              <a href="/frontend-developer-portal-guide.md" className="text-emerald-600 hover:underline font-mono break-all">
                /frontend-developer-portal-guide.md
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
