"use client"

import { Search, Bell, ChevronDown } from "lucide-react"
import Image from "next/image"

export function Header() {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-[#1F1F1F]">Patients</h1>
        <div className="flex items-center gap-2 mt-1">
          <svg className="w-4 h-4 text-[#989898]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-sm text-[#989898]">Avram Korni</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Icon Button */}
        <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/60 hover:bg-white/80 transition-colors border border-white/40">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#989898]" />
        </button>
        
        {/* Notification Bell with Red Badge */}
        <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/60 hover:bg-white/80 transition-colors border border-white/40 relative">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#989898]" />
          <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        {/* Doctor Profile with Dropdown */}
        <button className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 ml-1 sm:ml-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
              alt="Dr. Courtney Henry"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-[#1F1F1F]">Dr. Courtney Henry</p>
            <p className="text-xs text-[#989898]">Therapist</p>
          </div>
          <ChevronDown className="w-4 h-4 text-[#989898] hidden sm:block" />
        </button>
      </div>
    </header>
  )
}
