"use client"

import { useEffect, useState } from "react"
import { SecuredPage } from "@/components/layout/secured-page"
import { TablePageSkeleton } from "@/components/loading/page-skeletons"
import { listAuditEvents } from "@/lib/api/endpoints"
import type { AuditEventDto } from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"
import { Search, ShieldCheck, Clock } from "lucide-react"

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEventDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [resourceType, setResourceType] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        setIsLoading(true)
        setError(null)
        const page = await listAuditEvents({ page: 0, size: 50, resourceType: resourceType || undefined })
        if (!isMounted) return
        setEvents(page.content)
      } catch (err) {
        if (!isMounted) return
        if (err instanceof ApiError) setError(err.message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [resourceType])

  return (
    <SecuredPage requiredAny={["audit.read"]}>
      {isLoading ? (
        <TablePageSkeleton />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-[#1F1F1F]">Audit log</h1>
          <p className="text-[#989898] text-sm mt-1">Admin-only `audit.read` view</p>
        </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#989898]" />
              <input
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                placeholder="Filter by resource type"
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#326BF1]/30"
              />
            </div>
      </div>

      {error ? <p className="text-sm text-red-600 mb-3">{error}</p> : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 mb-5">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#989898]">Loaded events</p>
                <ShieldCheck className="w-4 h-4 text-[#326BF1]" />
              </div>
              <p className="text-2xl font-semibold text-[#1F1F1F] mt-2">{events.length}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#989898]">Last visible event</p>
                <Clock className="w-4 h-4 text-[#326BF1]" />
              </div>
              <p className="text-sm font-medium text-[#1F1F1F] mt-2">
                {events[0] ? new Date(events[0].occurredAt).toLocaleString() : "No records"}
              </p>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#989898] border-b border-gray-100">
              <th className="py-2 pr-4">Occurred at</th>
              <th className="py-2 pr-4">Actor user</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2 pr-4">Resource type</th>
              <th className="py-2 pr-4">Resource ID</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
                  <tr key={event.id} className="border-b border-gray-50 text-[#1F1F1F] hover:bg-white/40 transition-colors">
                <td className="py-3 pr-4">{new Date(event.occurredAt).toLocaleString()}</td>
                <td className="py-3 pr-4">{event.actorUserId}</td>
                <td className="py-3 pr-4">{event.action}</td>
                <td className="py-3 pr-4">{event.resourceType}</td>
                <td className="py-3 pr-4">{event.resourceId ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
            {events.length === 0 ? <p className="text-sm text-[#989898] py-6">No audit events found for this filter.</p> : null}
      </div>
        </>
      )}
    </SecuredPage>
  )
}
