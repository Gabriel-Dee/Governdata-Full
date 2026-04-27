"use client"

import { PortalAuthProvider } from "@/components/providers/portal-auth-provider"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PortalAuthProvider>
      {children}
      <Toaster richColors position="top-right" />
    </PortalAuthProvider>
  )
}
