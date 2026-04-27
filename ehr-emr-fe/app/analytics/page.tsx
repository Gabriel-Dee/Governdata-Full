"use client"

import { useEffect, useMemo, useState } from "react"
import { Bar, Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js"
import { SecuredPage } from "@/components/layout/secured-page"
import { DashboardSkeleton } from "@/components/loading/page-skeletons"
import { listPatients } from "@/lib/api/endpoints"
import type { PatientDto } from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"
import { BarChart3, Users, UserRound } from "lucide-react"

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function AnalyticsPage() {
  const [patients, setPatients] = useState<PatientDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        setIsLoading(true)
        const page = await listPatients({ page: 0, size: 100 })
        if (!isMounted) return
        setPatients(page.content)
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
  }, [])

  const genderData = useMemo(() => {
    const map = new Map<string, number>()
    patients.forEach((patient) => {
      map.set(patient.gender, (map.get(patient.gender) ?? 0) + 1)
    })
    return Array.from(map.entries()).map(([gender, count]) => ({ gender, count }))
  }, [patients])

  const barData = {
    labels: genderData.map((item) => item.gender),
    datasets: [
      {
        label: "Patients",
        data: genderData.map((item) => item.count),
        borderRadius: 8,
        backgroundColor: ["#326BF1", "#10B981", "#F59E0B", "#A855F7"],
      },
    ],
  }

  const donutData = {
    labels: genderData.map((item) => item.gender),
    datasets: [
      {
        data: genderData.map((item) => item.count),
        borderWidth: 0,
        backgroundColor: ["#326BF1", "#10B981", "#F59E0B", "#A855F7"],
      },
    ],
  }

  return (
    <SecuredPage requiredAny={["analytics.read"]}>
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-semibold text-[#1F1F1F]">Analytics</h1>
              <p className="text-[#989898] text-sm mt-1">Permission-gated analytics view (`analytics.read`)</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#326BF1] px-3 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30">
              <BarChart3 className="w-4 h-4" />
              Clinical overview
            </div>
          </div>

          {error ? (
            <div className="rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-700 px-4 py-3 mb-5 text-sm">{error}</div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 mb-5">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#989898]">Total patients in analytics set</p>
                <Users className="w-4 h-4 text-[#326BF1]" />
              </div>
              <p className="text-2xl font-semibold text-[#1F1F1F] mt-2">{patients.length}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#989898]">Distinct gender buckets</p>
                <UserRound className="w-4 h-4 text-[#326BF1]" />
              </div>
              <p className="text-2xl font-semibold text-[#1F1F1F] mt-2">{genderData.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30 h-[360px]">
              <h2 className="text-base font-semibold text-[#1F1F1F] mb-1">Patients by gender</h2>
              <p className="text-xs text-[#989898] mb-3">Chart.js bar chart</p>
              <div className="h-[280px]">
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false }, ticks: { color: "#7f8798" } },
                      y: { beginAtZero: true, ticks: { precision: 0, color: "#7f8798" }, grid: { color: "#edf1fb" } },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30 h-[360px]">
              <h2 className="text-base font-semibold text-[#1F1F1F] mb-1">Gender mix</h2>
              <p className="text-xs text-[#989898] mb-3">Chart.js doughnut chart</p>
              <div className="h-[280px]">
                <Doughnut
                  data={donutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "62%",
                    plugins: {
                      legend: { position: "bottom", labels: { color: "#5f6778", usePointStyle: true, pointStyle: "circle" } },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </SecuredPage>
  )
}
