"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSession } from "@/components/auth/session-provider"
import {
  Home,
  Users,
  CalendarDays,
  FileText,
  Pill,
  Activity,
  Upload,
  Shield,
  BarChart3,
  LogOut,
  Stethoscope,
  Menu,
  X,
} from "lucide-react"
import { defaultLandingPath, hasAnyPermission } from "@/lib/rbac"

const menuItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/dashboard",
    requiredAny: ["patient.read", "encounter.read", "diagnosis.read", "medication.read", "analytics.read"],
  },
  { icon: Users, label: "Patients", href: "/patients", requiredAny: ["patient.list", "patient.read"] },
  { icon: CalendarDays, label: "Encounters", href: "/encounters", requiredAny: ["encounter.read"] },
  { icon: Activity, label: "Diagnoses", href: "/diagnoses", requiredAny: ["diagnosis.read"] },
  { icon: Pill, label: "Medications", href: "/medications", requiredAny: ["medication.read"] },
  { icon: BarChart3, label: "Analytics", href: "/analytics", requiredAny: ["analytics.read"] },
  { icon: Upload, label: "CSV Import", href: "/admin/import", requiredAny: ["staff.manage"] },
  { icon: Shield, label: "Audit Log", href: "/admin/audit", requiredAny: ["audit.read"] },
]

const bottomMenuItems = [
  { icon: FileText, label: "Swagger UI", href: "http://localhost:8080/swagger-ui.html", external: true },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { permissions, logout, session } = useSession()
  const homeHref = defaultLandingPath(permissions)

  const isActive = (href: string) => {
    if (href === "/patients") {
      return pathname === "/patients" || pathname.startsWith("/patients/")
    }
    return pathname === href
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-lg"
      >
        <Menu className="w-5 h-5 text-[#1F1F1F]" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-4 top-4 bottom-4 w-[220px] flex flex-col rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-lg z-50 transition-transform duration-300",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"
        )}
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 lg:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-[#989898]" />
        </button>

        {/* Logo */}
        <Link href={homeHref} className="flex items-center gap-2 px-5 py-5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#326BF1]/10">
            <Stethoscope className="w-5 h-5 text-[#326BF1]" />
          </div>
          <span className="text-lg font-semibold text-[#1F1F1F]">EHR-Med</span>
        </Link>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems
              .filter((item) => hasAnyPermission(permissions, item.requiredAny))
              .map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-[#326BF1]/10 text-[#326BF1]"
                        : "text-[#1F1F1F] hover:bg-[#326BF1]/5"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", active ? "text-[#326BF1]" : "text-[#989898]")} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "ml-auto text-xs font-semibold px-2 py-0.5 rounded-full",
                          item.badgeVariant === "warning"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-[#326BF1]/10 text-[#326BF1]"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.badgeText && (
                      <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-[#989898]">
                        {item.badgeText}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom Navigation */}
        <div className="px-3 py-2 border-t border-gray-100">
          <ul className="space-y-1">
            {bottomMenuItems.map((item) => (
              <li key={item.label}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#1F1F1F] hover:bg-[#326BF1]/5 transition-all duration-200"
                  >
                    <item.icon className="w-5 h-5 text-[#989898]" />
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#1F1F1F] hover:bg-[#326BF1]/5 transition-all duration-200"
                  >
                    <item.icon className="w-5 h-5 text-[#989898]" />
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <p className="text-xs text-[#989898] px-3 pb-2 truncate">{session?.username}</p>
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#1F1F1F] hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5 text-[#989898]" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
