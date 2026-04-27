import { DashboardGate } from "@/components/portal/dashboard-gate"
import { DocsHeader } from "@/components/docs-header"
import { PortalSidebar } from "@/components/portal/portal-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardGate>
      <div className="min-h-screen flex flex-col bg-background">
        <DocsHeader />
        <div className="page-shell-x flex flex-1 min-h-0 flex-col gap-0 md:flex-row md:gap-8 lg:gap-10">
          <PortalSidebar />
          <main className="flex-1 min-w-0 py-6 sm:py-8 md:py-10 md:px-8 lg:px-10">
            {children}
          </main>
        </div>
      </div>
    </DashboardGate>
  )
}
