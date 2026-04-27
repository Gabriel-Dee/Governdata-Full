import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Database, Lock } from "lucide-react"
import Link from "next/link"

export function DocsHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/10 to-background py-16 lg:py-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 left-1/4 h-24 w-24 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
      </div>
      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Shield className="h-4 w-4" />
            Developer API Guide
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground lg:text-5xl text-balance">
            Governance-as-a-Service{" "}
            <span className="text-primary">Developer API</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground text-pretty">
            Integrate your existing systems (EHR/EMR, internal apps, SaaS backends) with the Governance Platform API. 
            This guide covers endpoints, request/response contracts, error handling, and best practices.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90" asChild>
              <Link href="#getting-started">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#api-reference">
                API Reference
              </Link>
            </Button>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground">Policy Enforcement</h3>
            <p className="text-sm text-muted-foreground">
              Evaluate access requests against active policies with JSON DSL or OPA runtime.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground">Audit Storage</h3>
            <p className="text-sm text-muted-foreground">
              Store decisions in Postgres, anchor to blockchain, or both for verifiable audit trails.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground">Compliance Ready</h3>
            <p className="text-sm text-muted-foreground">
              Built for HIPAA, GDPR, and enterprise compliance with full traceability.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
