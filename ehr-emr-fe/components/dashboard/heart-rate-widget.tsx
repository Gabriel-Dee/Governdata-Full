"use client"

import { Heart, ArrowUpRight } from "lucide-react"

interface HeartRateWidgetProps {
  heartRate: number
  stressLevel: string
}

export function HeartRateWidget({ heartRate, stressLevel }: HeartRateWidgetProps) {
  const isStressDown = stressLevel.includes("down")
  
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/30 shadow-sm flex-1">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-[#1F1F1F]">Heart Rate</h3>
        </div>
        <button className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
          <ArrowUpRight className="w-4 h-4 text-[#989898]" />
        </button>
      </div>
      
      <p className="text-xs text-[#989898] mb-4">07 - 13 June, 2024</p>

      {/* Chart */}
      <div className="h-24 mb-3">
        <svg className="w-full h-full" viewBox="0 0 220 70" preserveAspectRatio="none">
          {/* Heart rate line (red/coral) */}
          <path
            d="M 10 45 C 30 40, 50 35, 70 30 S 100 40, 120 35 S 150 25, 170 30 S 200 35, 210 30"
            fill="none"
            stroke="#ef8683"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Stress line (blue dashed) */}
          <path
            d="M 10 50 C 30 55, 50 50, 70 55 S 100 48, 120 52 S 150 45, 170 50 S 200 48, 210 52"
            fill="none"
            stroke="#326BF1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="6 4"
          />
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-[#989898] px-1 mb-4">
        <span>07</span>
        <span>08</span>
        <span className="font-semibold text-[#326BF1] bg-blue-50 px-2 py-0.5 rounded">09</span>
        <span>10</span>
        <span>11</span>
        <span>12</span>
        <span>13</span>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-[#989898]">Heart Rate</p>
          <p className="text-lg font-bold text-[#1F1F1F]">{heartRate} bpm</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#989898]">Stress</p>
          <p className={`text-lg font-bold ${isStressDown ? 'text-green-500' : 'text-red-500'}`}>
            {stressLevel}
          </p>
        </div>
      </div>
    </div>
  )
}
