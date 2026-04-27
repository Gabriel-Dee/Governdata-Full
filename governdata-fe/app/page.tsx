import { DocsHeader } from "@/components/docs-header"
import { Hero } from "@/components/hero"
import { LogoBar } from "@/components/logo-bar"
import { Solutions } from "@/components/solutions"
import { Features } from "@/components/features"
import { Testimonials } from "@/components/testimonials"
import { CTA } from "@/components/cta"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <DocsHeader />
      <Hero />
      <LogoBar />
      <Solutions />
      <Features />
      <Testimonials />
      <CTA />
    </main>
  )
}
