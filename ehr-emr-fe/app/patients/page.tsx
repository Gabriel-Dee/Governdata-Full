"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { RequireAuth } from "@/components/auth/require-auth"
import { useSession } from "@/components/auth/session-provider"
import { listPatients } from "@/lib/api/endpoints"
import type { PatientDto } from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"
import { Search, Plus, ChevronDown, FolderSearch, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function PatientsListPage() {
  const { canAny } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "date">("name")
  const [patients, setPatients] = useState<PatientDto[]>([])
  const [pageNumber, setPageNumber] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canCreatePatient = canAny(["patient.create"])
  const canOpenPatientDetail = canAny(["patient.read"])

  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        setIsLoading(true)
        setError(null)
        const page = await listPatients({ page: pageNumber, size: pageSize, lastName: searchQuery || undefined })
        if (!isMounted) return
        setPatients(page.content)
        setTotalElements(page.totalElements)
        setTotalPages(page.totalPages)
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof ApiError ? err.message : "Unable to load patients.")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [searchQuery, pageNumber, pageSize])

  useEffect(() => {
    setPageNumber(0)
  }, [searchQuery, pageSize])

  const nameOf = (patient: PatientDto) => {
    const value = `${patient.firstName ?? ""} ${patient.lastName ?? ""}`.trim()
    return value || patient.id
  }

  const sortedPatients = useMemo(() => [...patients].sort((a, b) => {
    if (sortBy === "name") return nameOf(a).localeCompare(nameOf(b))
    if (sortBy === "date") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    return 0
  }), [patients, sortBy])

  function getAge(dob: string | null, ageValue: number | null) {
    if (ageValue !== null) return ageValue
    if (!dob) return "-"
    const birth = new Date(dob)
    const now = new Date()
    let computedAge = now.getFullYear() - birth.getFullYear()
    const monthDiff = now.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) computedAge--
    return Number.isFinite(computedAge) ? computedAge : "-"
  }

  const pageButtons = useMemo(() => {
    if (totalPages <= 1) return []
    const start = Math.max(0, pageNumber - 2)
    const end = Math.min(totalPages - 1, start + 4)
    const fixedStart = Math.max(0, end - 4)
    return Array.from({ length: end - fixedStart + 1 }).map((_, index) => fixedStart + index)
  }, [pageNumber, totalPages])

  return (
    <RequireAuth requiredAny={["patient.list", "patient.read"]}>
      <div className="min-h-screen bg-[#E8EDFB]">
        <Sidebar />

        <main className="p-4 pt-16 lg:pt-6 lg:pl-[252px] lg:pr-6 lg:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-[#1F1F1F]">Patients</h1>
            <p className="text-[#989898] text-sm mt-1">{totalElements} total patients</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#989898]" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#326BF1]/30"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "date")}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#326BF1]/30 cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Updated</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#989898] pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#326BF1]/30 cursor-pointer"
              >
                <option value={10}>10 rows</option>
                <option value={20}>20 rows</option>
                <option value={50}>50 rows</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#989898] pointer-events-none" />
            </div>

            {/* Add Patient Button */}
            <button
              disabled={!canCreatePatient}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#326BF1] disabled:bg-[#8ba9f5] text-white rounded-xl text-sm font-medium hover:bg-[#2858d1] disabled:hover:bg-[#8ba9f5] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Patient</span>
            </button>
          </div>
        </div>

        {error ? <div className="rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-700 px-4 py-3 mb-5 text-sm">{error}</div> : null}

        {/* Patients Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30 overflow-x-auto">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: pageSize }).map((_, index) => (
              <div key={index} className="h-10 rounded-lg bg-white/70 animate-pulse" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#989898] border-b border-gray-100">
                <th className="py-2 pr-4">Patient</th>
                <th className="py-2 pr-4">MRN</th>
                <th className="py-2 pr-4">Age</th>
                <th className="py-2 pr-4">Gender</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Updated</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-50 text-[#1F1F1F] hover:bg-white/40 transition-colors">
                  <td className="py-3 pr-4 font-medium">{nameOf(patient)}</td>
                  <td className="py-3 pr-4">{patient.mrn}</td>
                  <td className="py-3 pr-4">{getAge(patient.dob, patient.age)}</td>
                  <td className="py-3 pr-4">{patient.gender}</td>
                  <td className="py-3 pr-4">{patient.phone ?? "-"}</td>
                  <td className="py-3 pr-4">{new Date(patient.updatedAt).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    {canOpenPatientDetail ? (
                      <Link href={`/patients/${patient.id}`} className="text-xs font-medium text-[#326BF1] hover:underline">
                        View Details
                      </Link>
                    ) : (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">List only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>

        {/* Empty State */}
        {!isLoading && sortedPatients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-[#326BF1]/10 rounded-full flex items-center justify-center mb-4">
              <FolderSearch className="w-8 h-8 text-[#326BF1]" />
            </div>
            <h3 className="text-lg font-medium text-[#1F1F1F] mb-2">No patients found</h3>
            <p className="text-sm text-[#989898]">Try adjusting your search query</p>
          </div>
        )}

        {!isLoading && totalPages > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5">
            <p className="text-xs text-[#989898]">
              Page {pageNumber + 1} of {totalPages} ({totalElements} total records)
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPageNumber((prev) => Math.max(0, prev - 1))}
                disabled={pageNumber === 0}
                className="w-8 h-8 rounded-lg bg-white/70 border border-white/30 flex items-center justify-center text-[#1F1F1F] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {pageButtons.map((page) => (
                <button
                  key={page}
                  onClick={() => setPageNumber(page)}
                  className={`min-w-8 h-8 px-2 rounded-lg border text-xs font-medium ${
                    page === pageNumber
                      ? "bg-[#326BF1] text-white border-[#326BF1]"
                      : "bg-white/70 border-white/30 text-[#1F1F1F]"
                  }`}
                >
                  {page + 1}
                </button>
              ))}

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
        </main>
      </div>
    </RequireAuth>
  )
}
