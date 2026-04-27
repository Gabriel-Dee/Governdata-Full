"use client"

import { anchorIdsForPathname } from "@/lib/docs-nav"
import { useEffect, useMemo, useState } from "react"

const HEADER_OFFSET = 96

/**
 * Tracks which in-page #id is nearest above the header while scrolling (docs pages).
 */
export function useDocsScrollSpy(pathname: string) {
  const ids = useMemo(() => anchorIdsForPathname(pathname), [pathname])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (ids.length === 0) {
      setActiveId(null)
      return
    }

    const update = () => {
      const h = typeof window !== "undefined" ? window.location.hash.slice(1) : ""
      if (h && ids.includes(h)) {
        setActiveId(h)
        return
      }
      let current: string | null = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top <= HEADER_OFFSET) current = id
      }
      setActiveId(current)
    }

    update()

    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    window.addEventListener("hashchange", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      window.removeEventListener("hashchange", update)
    }
  }, [pathname, ids])

  return activeId
}
