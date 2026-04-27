import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookMarked, FileJson, LayoutTemplate, Map } from "lucide-react"

const resourceLinks = [
  {
    title: "Developer platform API (full Markdown)",
    description: "Canonical reference: every route, header, and curl example served from the site.",
    href: "/developer-platform-api-guide.md",
    icon: FileJson,
    external: true,
  },
  {
    title: "Frontend portal guide",
    description: "What the hosted portal implements versus what stays in documentation.",
    href: "/frontend-developer-portal-guide.md",
    icon: LayoutTemplate,
    external: true,
  },
  {
    title: "Platform onboarding journey",
    description: "Narrative journey: accounts, keys, HIPAA/GDPR — Markdown reference.",
    href: "/platform-onboarding-journey.md",
    icon: Map,
    external: true,
  },
  {
    title: "Security & authentication",
    description: "JWT portal sessions, X-API-Key runtime, admin secret usage, and production hardening.",
    href: "/docs/security-auth",
    icon: BookMarked,
    external: false,
  },
]

export default function DocsResourcesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">Resources</h1>
      <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-10">
        Long-form references and downloadable guides. Use{" "}
        <Link href="/docs" className="text-emerald-600 font-medium hover:underline">
          Documentation
        </Link>{" "}
        for guided topics; use the{" "}
        <Link href="/register" className="text-emerald-600 font-medium hover:underline">
          developer portal
        </Link>{" "}
        to register, manage API keys, and copy integration snippets.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {resourceLinks.map((link) => (
          <Link key={link.title + link.href} href={link.href} {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
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
    </div>
  )
}
