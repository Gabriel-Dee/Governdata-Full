import Link from "next/link"

export function DocsFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <img
              src="/logo-green.png"
              alt="Governance API"
              className="h-6 w-auto"
            />
          </Link>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#getting-started" className="hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link href="#api-reference" className="hover:text-foreground transition-colors">
              API Reference
            </Link>
            <Link href="https://github.com" className="hover:text-foreground transition-colors">
              GitHub
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            Governance-as-a-Service Platform
          </p>
        </div>
      </div>
    </footer>
  )
}
