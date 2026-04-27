"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PortalHeaderAuth } from "@/components/portal-header-auth"
import { usePortalAuth } from "@/components/providers/portal-auth-provider"
import { docsHeaderLinks } from "@/lib/docs-nav"
import { Github, Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

function linkClass(active: boolean) {
  return cn(
    "shrink-0 whitespace-nowrap text-sm transition-colors",
    active ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
  )
}

export function DocsHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { token, hydrated } = usePortalAuth()
  const loggedIn = hydrated && !!token

  return (
    <header className="sticky top-0 z-50 w-full min-w-0 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="page-shell-x">
        <div className="grid h-16 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
          <Link href="/" className="flex w-fit shrink-0 items-center justify-self-start" aria-label="Home">
            <img src="/logo-green.png" alt="" className="h-7 w-auto max-w-[min(200px,42vw)]" />
          </Link>

          <div className="hidden min-w-0 max-w-full justify-self-stretch overflow-x-auto xl:flex xl:justify-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <nav
              className="flex w-max max-w-full min-w-0 flex-nowrap items-center justify-center gap-x-2.5 px-1 py-1 sm:gap-x-3 2xl:gap-x-4"
              aria-label="Documentation"
            >
              {docsHeaderLinks.map(({ href, label, isActive }) => (
                <Link key={href + label} href={href} className={linkClass(isActive(pathname))}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center justify-end justify-self-end gap-1.5 sm:gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
              </a>
            </Button>
            <PortalHeaderAuth />
            {!loggedIn && (
              <Button asChild className="hidden sm:flex bg-emerald-600 text-white hover:bg-emerald-700 rounded-full px-4">
                <Link href="/docs/getting-started">Get started</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-border bg-background">
          <div className="page-shell-x py-4 space-y-1">
            <nav
              className="flex max-h-[min(70vh,520px)] flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Documentation"
            >
              {docsHeaderLinks.map(({ href, label, isActive }) => (
                <Link
                  key={href + label}
                  href={href}
                  className={cn(linkClass(isActive(pathname)), "rounded-lg px-3 py-2.5")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
            {!loggedIn && (
              <Button asChild className="mt-3 w-full bg-emerald-600 text-white hover:bg-emerald-700 rounded-full sm:hidden">
                <Link href="/docs/getting-started" onClick={() => setMobileMenuOpen(false)}>
                  Get started
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
