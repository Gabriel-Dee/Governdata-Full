"use client"

import { useEffect, useState } from "react"
import { Bar, Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js"
import { SecuredPage } from "@/components/layout/secured-page"
import { DashboardSkeleton } from "@/components/loading/page-skeletons"
import { listDiagnoses, listEncounters, listMedications, listPatients } from "@/lib/api/endpoints"
import type { PatientDto } from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"
import { Search, Users, Stethoscope, Activity, Pill, Sparkles } from "lucide-react"
import { useSession } from "@/components/auth/session-provider"
import { DASHBOARD_PERMISSIONS } from "@/lib/rbac"

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function DashboardPage() {
  const { session, permissions } = useSession()
  const [patients, setPatients] = useState<PatientDto[]>([])
  const [totalPatients, setTotalPatients] = useState(0)
  const [totalEncounters, setTotalEncounters] = useState(0)
  const [totalDiagnoses, setTotalDiagnoses] = useState(0)
  const [totalMedications, setTotalMedications] = useState(0)
  const [lastNameFilter, setLastNameFilter] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const labelForPatient = (patient: PatientDto) => {
    const fullName = `${patient.firstName ?? ""} ${patient.lastName ?? ""}`.trim()
    return fullName || patient.id
  }

  useEffect(() => {
    let isMounted = true

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const [cohortPatientsPage, patientsGlobalPage, encountersPage, diagnosesPage, medicationsPage] = await Promise.all([
          listPatients({ page: 0, size: 20, lastName: lastNameFilter || undefined }),
          listPatients({ page: 0, size: 1 }),
          listEncounters({ page: 0, size: 1 }),
          listDiagnoses({ page: 0, size: 1 }),
          listMedications({ page: 0, size: 1 }),
        ])
        if (!isMounted) return

        const cohortPatients = cohortPatientsPage.content
        setPatients(cohortPatients)
        setTotalPatients(patientsGlobalPage.totalElements)
        setTotalEncounters(encountersPage.totalElements)
        setTotalDiagnoses(diagnosesPage.totalElements)
        setTotalMedications(medicationsPage.totalElements)

      } catch (err) {
        if (!isMounted) return
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError("Unable to load dashboard data.")
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [lastNameFilter])

  const roleLabel = session?.roles?.[0] ?? "USER"
  const accessSummary = {
    canCreatePatient: permissions.includes("patient.create"),
    canCreateEncounter: permissions.includes("encounter.create"),
    canCreateDiagnosis: permissions.includes("diagnosis.create"),
    canCreateMedication: permissions.includes("medication.create"),
    canManageStaff: permissions.includes("staff.manage"),
    canReadAnalytics: permissions.includes("analytics.read"),
  }

  const statCards = [
    {
      label: "Total patients",
      value: totalPatients,
      icon: Users,
      tone: "from-[#326BF1]/10 to-[#326BF1]/5",
    },
    {
      label: "Encounters (dataset)",
      value: totalEncounters,
      icon: Stethoscope,
      tone: "from-emerald-500/10 to-emerald-500/5",
    },
    {
      label: "Diagnoses (dataset)",
      value: totalDiagnoses,
      icon: Activity,
      tone: "from-amber-500/10 to-amber-500/5",
    },
    {
      label: "Medications (dataset)",
      value: totalMedications,
      icon: Pill,
      tone: "from-violet-500/10 to-violet-500/5",
    },
  ]

  const chartBarData = {
    labels: ["Encounters", "Diagnoses", "Medications"],
    datasets: [
      {
        label: "Count",
        data: [totalEncounters, totalDiagnoses, totalMedications],
        borderRadius: 8,
        backgroundColor: ["#326BF1", "#10B981", "#F59E0B"],
      },
    ],
  }

  const chartDonutData = {
    labels: ["Encounters", "Diagnoses", "Medications"],
    datasets: [
      {
        data: [totalEncounters, totalDiagnoses, totalMedications],
        backgroundColor: ["#326BF1", "#10B981", "#F59E0B"],
        borderWidth: 0,
      },
    ],
  }

  return (
    <SecuredPage requiredAny={DASHBOARD_PERMISSIONS}>
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-semibold text-[#1F1F1F]">Dashboard</h1>
              <p className="text-[#989898] text-sm mt-1">
                Signed in as <span className="font-medium text-[#1F1F1F]">{session?.username ?? "user"}</span> ({roleLabel})
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#989898]" />
                <input
                  placeholder="Filter cohort by last name"
                  value={lastNameFilter}
                  onChange={(e) => setLastNameFilter(e.target.value)}
                  className="w-full sm:w-56 pl-10 pr-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#326BF1]/30"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { key: "patient", label: `patient.create: ${accessSummary.canCreatePatient ? "yes" : "no"}` },
              { key: "encounter", label: `encounter.create: ${accessSummary.canCreateEncounter ? "yes" : "no"}` },
              { key: "diagnosis", label: `diagnosis.create: ${accessSummary.canCreateDiagnosis ? "yes" : "no"}` },
              { key: "medication", label: `medication.create: ${accessSummary.canCreateMedication ? "yes" : "no"}` },
              { key: "analytics", label: `analytics.read: ${accessSummary.canReadAnalytics ? "yes" : "no"}` },
              { key: "staff", label: `staff.manage: ${accessSummary.canManageStaff ? "yes" : "no"}` },
            ].map((chip) => (
              <span
                key={chip.key}
                className="px-2.5 py-1 rounded-full text-xs bg-white/70 border border-white/40 text-[#5f6778] backdrop-blur-sm"
              >
                {chip.label}
              </span>
            ))}
          </div>

          {error ? (
            <div className="rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-700 px-4 py-3 mb-5 text-sm">{error}</div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 mb-5">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30 hover:bg-white/90 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-[#989898]">{card.label}</p>
                    <p className="text-2xl font-semibold text-[#1F1F1F] mt-1">{card.value}</p>
                  </div>
                  <div className={`p-2 rounded-xl bg-linear-to-br ${card.tone}`}>
                    <card.icon className="w-4 h-4 text-[#326BF1]" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5 mb-5">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30 h-[320px]">
              <h2 className="text-base font-semibold text-[#1F1F1F] mb-1">Clinical volume</h2>
              <p className="text-xs text-[#989898] mb-3">Chart.js bar chart by module</p>
              <div className="h-[245px]">
                <Bar
                  data={chartBarData}
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

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30 h-[320px]">
              <h2 className="text-base font-semibold text-[#1F1F1F] mb-1">Distribution</h2>
              <p className="text-xs text-[#989898] mb-3">Chart.js doughnut chart</p>
              <div className="h-[245px]">
                <Doughnut
                  data={chartDonutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", color: "#5f6778" } },
                    },
                    cutout: "62%",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
            <h2 className="text-base font-semibold text-[#1F1F1F]">Cohort snapshot</h2>
            <p className="text-sm text-[#989898] mt-1 mb-4">First patients in current cohort (`/api/v1/patients`)</p>
            {patients.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#989898] border-b border-gray-100">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">MRN</th>
                      <th className="py-2 pr-4">DOB</th>
                      <th className="py-2 pr-4">Phone</th>
                      <th className="py-2">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.slice(0, 8).map((patient) => (
                      <tr key={patient.id} className="text-[#1F1F1F] border-b border-gray-50">
                        <td className="py-3 pr-4">{labelForPatient(patient)}</td>
                        <td className="py-3 pr-4">{patient.mrn}</td>
                        <td className="py-3 pr-4">{patient.dob ?? "-"}</td>
                        <td className="py-3 pr-4">{patient.phone ?? "-"}</td>
                        <td className="py-3">{patient.email ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[#989898]">No cohort patient data available for this filter.</p>
            )}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-[#989898]">
              <Sparkles className="w-3.5 h-3.5 text-[#326BF1]" />
              Cards/charts use global endpoint totals; table is a filtered cohort preview.
            </div>
          </div>
        </>
      )}
    </SecuredPage>
  )
}
