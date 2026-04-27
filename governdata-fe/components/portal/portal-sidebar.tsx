"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FileCode2, KeyRound, LayoutDashboard } from "lucide-react"

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/keys", label: "API keys", icon: KeyRound },
  { href: "/dashboard/snippets", label: "Snippets", icon: FileCode2 },
] as const

function isActive(href: string, pathname: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function PortalSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-full shrink-0 border-b border-border bg-muted/20 md:w-52 md:border-b-0 md:border-r flex flex-col">
      <div className="md:hidden sticky top-16 z-30 bg-background/95 px-3 py-2 backdrop-blur supports-backdrop-filter:bg-background/80">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Portal">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                isActive(href, pathname)
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
                  : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <aside className="hidden md:block">
        <nav className="sticky top-16 py-6 px-3 flex flex-col gap-0.5">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Portal</p>
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(href, pathname)
                  ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  )
}
