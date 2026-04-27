"use client"

import { cn } from "@/lib/utils"
import { Search, Plus, MoreVertical, Calendar } from "lucide-react"
import Image from "next/image"
import type { Appointment } from "@/lib/data/patients"

// Custom category icons matching the design
function CategoryIcon({ type, className }: { type: string; className?: string }) {
  switch (type.toLowerCase()) {
    case "eye":
    case "ophthalmologist":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case "brain":
    case "psychologist":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      )
    case "allergist":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4.93 19.07A10 10 0 1 0 19.07 4.93" />
          <path d="M15 9l-6 6" />
          <path d="M9 9l6 6" />
        </svg>
      )
    case "syringe":
    case "immunologist":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4" />
        </svg>
      )
    case "scale":
    case "bariatrician":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
        </svg>
      )
    case "heart":
    case "cardiologist":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      )
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
  }
}

interface AppointmentsTableProps {
  appointments: Appointment[]
}

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/30 shadow-sm w-full flex flex-col">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5 gap-3">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
          <button className="text-xs sm:text-sm font-semibold text-[#326BF1] border-b-2 border-[#326BF1] pb-2 whitespace-nowrap">
            Upcoming Appointments
          </button>
          <button className="text-xs sm:text-sm font-medium text-[#989898] hover:text-[#1F1F1F] transition-colors pb-2 whitespace-nowrap">
            Past Appointments
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-gray-100 transition-colors border border-gray-100">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#989898]" />
          </button>
          <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#326BF1] text-white hover:bg-[#2858c9] transition-colors">
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="flex flex-col gap-3 md:hidden flex-1">
        {appointments.map((apt) => (
          <div key={apt.id} className="bg-white/50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <CategoryIcon type={apt.categoryIcon} className="w-4 h-4 text-[#989898]" />
                <span className="text-sm font-medium text-[#1F1F1F]">{apt.category}</span>
              </div>
              <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <MoreVertical className="w-4 h-4 text-[#989898]" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                  src={apt.doctorImage}
                  alt={apt.doctor}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-[#1F1F1F]">{apt.doctor}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-[#989898] mb-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {apt.date}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  apt.resultsStatus === "red" ? "bg-red-400" : apt.resultsStatus === "green" ? "bg-green-400" : "bg-[#326BF1]"
                )}></span>
                <span className={apt.resultsStatus === "red" ? "text-red-500" : "text-[#989898]"}>
                  {apt.results}
                </span>
              </div>
            </div>
            
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#326BF1] rounded-full transition-all"
                style={{ width: `${apt.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto flex-1">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-[#989898]">
              <th className="pb-4 font-medium">Category</th>
              <th className="pb-4 font-medium">Doctor</th>
              <th className="pb-4 font-medium">
                <div className="flex items-center gap-1">
                  Date
                  <span className="text-[10px]">&#8597;</span>
                </div>
              </th>
              <th className="pb-4 font-medium">Results</th>
              <th className="pb-4 font-medium">Treatment process</th>
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.id} className="border-t border-gray-50">
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <CategoryIcon type={apt.categoryIcon} className="w-4 h-4 text-[#989898]" />
                    <span className="text-sm text-[#1F1F1F]">{apt.category}</span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={apt.doctorImage}
                        alt={apt.doctor}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm text-[#1F1F1F]">{apt.doctor}</span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-1.5 text-sm text-[#989898]">
                    <Calendar className="w-3.5 h-3.5" />
                    {apt.date}
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      apt.resultsStatus === "red" ? "bg-red-400" : apt.resultsStatus === "green" ? "bg-green-400" : "bg-[#326BF1]"
                    )}></span>
                    <span className={apt.resultsStatus === "red" ? "text-red-500" : "text-[#989898]"}>
                      {apt.results}
                    </span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#326BF1] rounded-full transition-all"
                      style={{ width: `${apt.progress}%` }}
                    ></div>
                  </div>
                </td>
                <td className="py-4">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreVertical className="w-4 h-4 text-[#989898]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
