"use client"

import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

const tabs = [
  { icon: "eye", label: "Overview", active: true },
  { icon: "message", label: "Communication", count: 8 },
  { icon: "note", label: "Notes", count: 2 },
  { icon: "docs", label: "Docs", count: 12 },
  { icon: "labs", label: "Labs", count: 8 },
]

function TabIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "eye":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case "message":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    case "note":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
    case "docs":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="12" y2="17" />
        </svg>
      )
    case "labs":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3v7.5L5.4 17.4c-.8 1.3.2 3 1.7 3H17c1.5 0 2.5-1.7 1.7-3L15 10.5V3" />
          <line x1="9" y1="3" x2="15" y2="3" />
        </svg>
      )
    default:
      return null
  }
}

export function Tabs() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
      {/* Scrollable Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm whitespace-nowrap flex-shrink-0",
              tab.active
                ? "bg-white text-[#326BF1] shadow-md"
                : "bg-white/70 text-[#989898] hover:bg-white hover:text-[#1F1F1F]"
            )}
          >
            <TabIcon type={tab.icon} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-xs font-semibold text-[#989898] ml-1">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#326BF1] text-white rounded-full text-sm font-medium hover:bg-[#2858c9] transition-colors shadow-lg shadow-blue-500/25 w-full lg:w-auto">
        <Plus className="w-4 h-4" />
        <span>Create new appointment</span>
      </button>
    </div>
  )
}
