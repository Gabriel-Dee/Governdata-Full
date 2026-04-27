"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { docsSidebarSections, parseHref, sectionIsActive } from "@/lib/docs-nav"
import { useDocsScrollSpy } from "@/hooks/use-docs-scroll-spy"

function subLinkActive(pathname: string, itemHref: string, activeId: string | null) {
  const { path, hash } = parseHref(itemHref)
  if (path !== pathname) return false
  if (!hash) return !activeId
  return activeId === hash
}

export function DocsSidebar() {
  const pathname = usePathname()
  const activeId = useDocsScrollSpy(pathname)
  const [openSections, setOpenSections] = useState<string[]>([])

  useEffect(() => {
    const active = docsSidebarSections.filter((s) => sectionIsActive(pathname, s) && s.items.length > 0)
    setOpenSections((prev) => {
      const add = active.map((s) => s.title).filter((t) => !prev.includes(t))
      return add.length ? [...prev, ...add] : prev
    })
  }, [pathname])

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  const sectionHeadingActive = (section: DocsSidebarSection) => sectionIsActive(pathname, section)

  return (
    <aside className="hidden lg:block w-72 shrink-0 border-r border-border">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-8 px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <nav className="flex flex-col gap-1" aria-label="Documentation">
          {docsSidebarSections.map((section) => (
            <div key={section.title}>
              {section.items.length > 0 ? (
                <>
                  <div className="flex w-full items-center gap-0.5 rounded-md">
                    <Link
                      href={section.href}
                      className={cn(
                        "min-w-0 flex-1 py-2 text-sm font-semibold transition-colors rounded-md px-1 -mx-1",
                        sectionHeadingActive(section)
                          ? "text-emerald-600"
                          : "text-foreground hover:text-emerald-600"
                      )}
                    >
                      {section.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleSection(section.title)}
                      className={cn(
                        "shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground",
                        sectionHeadingActive(section) && "text-emerald-600"
                      )}
                      aria-expanded={openSections.includes(section.title)}
                      aria-label={`${openSections.includes(section.title) ? "Collapse" : "Expand"} ${section.title}`}
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          openSections.includes(section.title) && "rotate-180"
                        )}
                      />
                    </button>
                  </div>
                  {openSections.includes(section.title) && (
                    <div className="ml-2 flex flex-col gap-0.5 border-l-2 border-emerald-200 pl-3 mb-2">
                      {section.items.map((item) => {
                        const active = subLinkActive(pathname, item.href, activeId)
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "block py-1.5 text-sm transition-colors rounded-r-md pr-1",
                              active
                                ? "text-emerald-700 dark:text-emerald-300 font-medium border-l-2 border-emerald-500 -ml-[2px] pl-2"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {item.title}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={section.href}
                  className={cn(
                    "flex w-full items-center py-2 text-sm font-semibold transition-colors rounded-md px-1 -mx-1",
                    sectionHeadingActive(section) ? "text-emerald-600" : "text-foreground hover:text-emerald-600"
                  )}
                >
                  {section.title}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
