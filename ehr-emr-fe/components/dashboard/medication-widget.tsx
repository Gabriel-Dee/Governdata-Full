"use client"

import { ArrowUpRight, Sun, Moon } from "lucide-react"
import type { Medication } from "@/lib/data/patients"

const days = [
  { day: "Mon", date: "07" },
  { day: "Tue", date: "08" },
  { day: "Wed", date: "09", active: true },
  { day: "Thu", date: "10" },
  { day: "Fri", date: "11" },
  { day: "Sat", date: "12" },
  { day: "Sun", date: "13" },
]

interface MedicationWidgetProps {
  medications: Medication[]
}

export function MedicationWidget({ medications }: MedicationWidgetProps) {
  // Transform medications to match the display format
  const displayMedications = medications.map((med) => {
    const schedule = days.map((d) => {
      const key = `${d.day} ${d.date}`
      const daySchedule = med.schedule[key]
      return daySchedule || null
    })

    return {
      name: med.name,
      dose: med.dosage,
      color: med.color,
      schedule,
    }
  })

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/30 shadow-sm w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#326BF1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
          <h3 className="text-lg font-semibold text-[#1F1F1F]">Medication</h3>
        </div>
        <button className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
          <ArrowUpRight className="w-4 h-4 text-[#989898]" />
        </button>
      </div>

      {/* Calendar Header */}
      <div className="grid grid-cols-8 gap-1 mb-3">
        <div></div>
        {days.map((d) => (
          <div
            key={d.date}
            className={`text-center text-xs ${
              d.active ? "text-[#326BF1] font-semibold" : "text-[#989898]"
            }`}
          >
            <div>{d.day}</div>
            <div className={`mt-0.5 ${d.active ? "font-bold text-sm" : ""}`}>{d.date}</div>
          </div>
        ))}
      </div>

      {/* Medication Rows */}
      <div className="space-y-2 flex-1">
        {displayMedications.map((med, idx) => (
          <div key={idx} className="grid grid-cols-8 gap-1 items-center">
            {/* Medication Info */}
            <div className="flex items-center gap-1.5">
              <span 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: med.color }}
              ></span>
              <div className="min-w-0">
                <span className="text-xs text-[#1F1F1F] font-medium truncate block">{med.name}</span>
                <span className="text-[10px] text-[#989898]">{med.dose}</span>
              </div>
            </div>
            
            {/* Schedule cells */}
            {med.schedule.map((item, dayIdx) => (
              <div key={dayIdx} className="flex justify-center items-center gap-0.5">
                {item ? (
                  <div className="flex items-center gap-0.5">
                    {item.morning && (
                      <span className="flex items-center gap-0.5 px-1 py-0.5 bg-amber-50 rounded text-[9px] text-amber-600 font-medium">
                        <Sun className="w-2.5 h-2.5" />
                        {item.morning}
                      </span>
                    )}
                    {item.evening && (
                      <span className="flex items-center gap-0.5 px-1 py-0.5 bg-blue-50 rounded text-[9px] text-blue-600 font-medium">
                        <Moon className="w-2.5 h-2.5" />
                        {item.evening}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-amber-50 rounded">
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xs text-[#989898]">Morning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-blue-50 rounded">
            <Moon className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-xs text-[#989898]">Evening</span>
        </div>
      </div>
    </div>
  )
}
