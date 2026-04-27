"use client"

import { MoreVertical, AlertTriangle } from "lucide-react"

interface AllergiesWidgetProps {
  allergies: string[]
}

export function AllergiesWidget({ allergies }: AllergiesWidgetProps) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/30 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-[#1F1F1F]">Allergies</h3>
        </div>
        <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <MoreVertical className="w-4 h-4 text-[#989898]" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {allergies.map((allergy) => (
          <span
            key={allergy}
            className="px-4 py-2 text-sm text-[#1F1F1F] font-medium"
          >
            {allergy}
          </span>
        ))}
      </div>
    </div>
  )
}
