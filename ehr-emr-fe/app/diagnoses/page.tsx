"use client"

import { useEffect, useState } from "react"
import { SecuredPage } from "@/components/layout/secured-page"
import { TablePageSkeleton } from "@/components/loading/page-skeletons"
import { listDiagnoses } from "@/lib/api/endpoints"
import type { DiagnosisDto } from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"
import { Activity, UserRound, FolderSearch, ChevronLeft, ChevronRight } from "lucide-react"

export default function DiagnosesPage() {
  const [diagnoses, setDiagnoses] = useState<DiagnosisDto[]>([])
  const [pageNumber, setPageNumber] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function loadPage() {
      try {
        setIsLoading(true)
        setError(null)
        const page = await listDiagnoses({ page: pageNumber, size: pageSize })
        if (!isMounted) return
        setDiagnoses(page.content)
        setTotalElements(page.totalElements)
        setTotalPages(page.totalPages)
      } catch (err) {
        if (!isMounted) return
        if (err instanceof ApiError) setError(err.message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadPage()
    return () => {
      isMounted = false
    }
  }, [pageNumber, pageSize])

  return (
    <SecuredPage requiredAny={["diagnosis.read"]}>
      {isLoading ? (
        <TablePageSkeleton />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-semibold text-[#1F1F1F]">Diagnoses</h1>
              <p className="text-[#989898] text-sm mt-1">Global list from `/api/v1/diagnoses`</p>
            </div>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPageNumber(0)
                }}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#326BF1]/30 cursor-pointer"
              >
                <option value={10}>10 rows</option>
                <option value={20}>20 rows</option>
                <option value={50}>50 rows</option>
              </select>
            </div>
          </div>

      {error ? <p className="text-sm text-red-600 mb-3">{error}</p> : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 mb-5">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#989898]">Total diagnoses</p>
                <Activity className="w-4 h-4 text-[#326BF1]" />
              </div>
              <p className="text-2xl font-semibold text-[#1F1F1F] mt-2">{totalElements}</p>
              <p className="text-[11px] text-[#989898] mt-1">from `totalElements`</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#989898]">Rows on current page</p>
                <UserRound className="w-4 h-4 text-[#326BF1]" />
              </div>
              <p className="text-2xl font-semibold text-[#1F1F1F] mt-2">{diagnoses.length}</p>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#989898] border-b border-gray-100">
                  <th className="py-2 pr-4">Patient ID</th>
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Onset date</th>
                  <th className="py-2 pr-4">Resolved date</th>
                  <th className="py-2">Encounter ID</th>
                </tr>
              </thead>
              <tbody>
                {diagnoses.map((diagnosis) => (
                  <tr key={diagnosis.id} className="border-b border-gray-50 text-[#1F1F1F] hover:bg-white/40 transition-colors">
                    <td className="py-3 pr-4">{diagnosis.patientId}</td>
                    <td className="py-3 pr-4">{diagnosis.code}</td>
                    <td className="py-3 pr-4">{diagnosis.description}</td>
                    <td className="py-3 pr-4">{diagnosis.onsetDate}</td>
                    <td className="py-3 pr-4">{diagnosis.resolvedDate ?? "-"}</td>
                    <td className="py-3">{diagnosis.encounterId ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {diagnoses.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-[#326BF1]/10 flex items-center justify-center mb-3">
                  <FolderSearch className="w-5 h-5 text-[#326BF1]" />
                </div>
                <p className="text-sm font-medium text-[#1F1F1F]">No diagnoses found</p>
                <p className="text-xs text-[#989898] mt-1">No diagnosis rows returned on this page.</p>
              </div>
            ) : null}
          </div>

          {!isLoading && totalPages > 0 ? (
            <div className="flex items-center justify-between gap-3 mt-5">
              <p className="text-xs text-[#989898]">
                Page {pageNumber + 1} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageNumber((prev) => Math.max(0, prev - 1))}
                  disabled={pageNumber === 0}
                  className="w-8 h-8 rounded-lg bg-white/70 border border-white/30 flex items-center justify-center text-[#1F1F1F] disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPageNumber((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={pageNumber >= totalPages - 1}
                  className="w-8 h-8 rounded-lg bg-white/70 border border-white/30 flex items-center justify-center text-[#1F1F1F] disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </SecuredPage>
  )
}
