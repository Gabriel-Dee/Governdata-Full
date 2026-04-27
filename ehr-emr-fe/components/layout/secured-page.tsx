"use client"

import { RequireAuth } from "@/components/auth/require-auth"
import { Sidebar } from "@/components/dashboard/sidebar"

type SecuredPageProps = {
  children: React.ReactNode
  requiredAny: string[]
}

export function SecuredPage({ children, requiredAny }: SecuredPageProps) {
  return (
    <RequireAuth requiredAny={requiredAny}>
      <div className="min-h-screen bg-[#E8EDFB]">
        <Sidebar />
        <main className="p-4 pt-16 lg:pt-6 lg:pl-[252px] lg:pr-6 lg:py-6">{children}</main>
      </div>
    </RequireAuth>
  )
}
