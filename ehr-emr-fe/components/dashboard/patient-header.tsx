"use client"

import { Search, Bell, ChevronDown, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Patient } from "@/lib/data/patients"

interface PatientHeaderProps {
  patient: Patient
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Left - Patient Info */}
      <div className="flex items-center gap-3">
        <Link 
          href="/patients"
          className="p-2 rounded-lg hover:bg-white/50 transition-colors lg:hidden"
        >
          <ArrowLeft className="w-5 h-5 text-[#1F1F1F]" />
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-[#1F1F1F]">Patients</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <svg className="w-4 h-4 text-[#326BF1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-[#989898] text-sm">{patient.name}</span>
          </div>
        </div>
      </div>

      {/* Right - Search, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Search Icon */}
        <button className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
          <Search className="w-5 h-5 text-[#989898]" />
        </button>

        {/* Notification Icon with Badge */}
        <button className="relative w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
          <Bell className="w-5 h-5 text-[#989898]" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Doctor Profile */}
        <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white transition-colors cursor-pointer">
          <div className="relative w-9 h-9 rounded-full overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
              alt="Dr. Courtney Henry"
              fill
              className="object-cover"
            />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-[#1F1F1F] leading-tight">Dr. Courtney Henry</p>
            <p className="text-xs text-[#989898]">Therapist</p>
          </div>
          <ChevronDown className="w-4 h-4 text-[#989898] hidden md:block" />
        </div>
      </div>
    </div>
  )
}
