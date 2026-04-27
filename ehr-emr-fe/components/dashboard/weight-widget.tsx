"use client"

import { ArrowUpRight, ChevronDown, TrendingUp } from "lucide-react"
import type { WeightRecord } from "@/lib/data/patients"

interface WeightWidgetProps {
  weightRecords: WeightRecord[]
  latestWeight: number
  targetWeight: string
  height: string
}

export function WeightWidget({ weightRecords, latestWeight, targetWeight, height }: WeightWidgetProps) {
  const activeIndex = weightRecords.findIndex(r => r.isActive)
  
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/30 shadow-sm w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#326BF1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-[#1F1F1F]">Weight Control</h3>
        </div>
        <button className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
          <ArrowUpRight className="w-4 h-4 text-[#989898]" />
        </button>
      </div>

      {/* Month Filter */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[#989898]">Month Records</span>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-[#1F1F1F] font-medium">
          June 2024
          <ChevronDown className="w-4 h-4 text-[#989898]" />
        </button>
      </div>

      {/* Chart Area */}
      <div className="relative flex-1 min-h-[140px] mb-3">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 text-xs text-[#989898]">75 kg</div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-[#989898]">65 kg</div>
        <div className="absolute left-0 bottom-4 text-xs text-[#989898]">60 kg</div>
        
        {/* Chart */}
        <svg className="w-full h-full pl-10" viewBox="0 0 260 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="10" x2="260" y2="10" stroke="#f0f0f0" strokeWidth="1" />
          <line x1="0" y1="50" x2="260" y2="50" stroke="#f0f0f0" strokeWidth="1" />
          <line x1="0" y1="90" x2="260" y2="90" stroke="#f0f0f0" strokeWidth="1" />
          
          {/* Line chart */}
          <path
            d="M 20 70 Q 60 65, 100 50 T 180 40 T 240 45"
            fill="none"
            stroke="#326BF1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Active point */}
          <circle cx="100" cy="50" r="6" fill="#326BF1" />
          <circle cx="100" cy="50" r="10" fill="#326BF1" fillOpacity="0.2" />
        </svg>

        {/* Annotations */}
        <div className="absolute right-0 top-0 text-[9px] bg-white/90 rounded-lg px-2 py-1.5 shadow-sm border border-gray-100">
          <div className="text-[#989898]">June 8 - June 15:</div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-green-500 font-medium">+3 kg(+4.2%)</span>
          </div>
          <div className="text-[#989898]">End Weight: <span className="text-[#1F1F1F] font-medium">{latestWeight} kg</span></div>
          <div className="text-[#989898]">Suggestion: <span className="text-[#1F1F1F]">Aim to reduce by 1 kg</span></div>
        </div>

        {/* Weight change markers */}
        <div className="absolute" style={{ left: '35%', top: '45%' }}>
          <span className="text-[10px] text-red-500 font-medium">-2 kg</span>
        </div>
        <div className="absolute" style={{ left: '55%', top: '25%' }}>
          <span className="text-[10px] text-green-500 font-medium">+1 kg</span>
        </div>
        <div className="absolute" style={{ left: '75%', top: '35%' }}>
          <span className="text-[10px] text-green-500 font-medium">+3 kg</span>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-[#989898] px-10 mb-4">
        {weightRecords.map((record, idx) => (
          <span 
            key={record.period}
            className={idx === activeIndex ? "font-semibold text-[#326BF1]" : ""}
          >
            {record.period}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-[#989898]">Latest weight:</span>
          <span className="text-xl font-bold text-[#1F1F1F]">{latestWeight} KG</span>
        </div>
        <p className="text-xs text-[#989898] mt-1">
          {targetWeight} Target Weight
        </p>
        <p className="text-xs text-[#989898]">{height} Height</p>
      </div>
    </div>
  )
}
