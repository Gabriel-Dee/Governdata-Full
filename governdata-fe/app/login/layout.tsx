import { DocsHeader } from "@/components/docs-header"

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DocsHeader />
      <div className="flex flex-1 flex-col min-h-0">{children}</div>
    </div>
  )
}
