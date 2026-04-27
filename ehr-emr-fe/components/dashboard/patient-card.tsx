"use client"

import { MapPin, Calendar, Phone, MessageCircle, Video } from "lucide-react"
import Image from "next/image"
import type { Patient } from "@/lib/data/patients"

interface PatientCardProps {
  patient: Patient
}

export function PatientCard({ patient }: PatientCardProps) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/30 shadow-sm w-full flex flex-col">
      {/* Patient Image with overlay info */}
      <div className="relative h-56 flex-shrink-0">
        <Image
          src={patient.image}
          alt={patient.name}
          fill
          className="object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Patient info overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-semibold text-xl">{patient.name}</h3>
          <p className="text-white/80 text-sm">{patient.age} years old</p>
        </div>
        
        {/* Action buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button className="w-8 h-8 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
            <MessageCircle className="w-4 h-4 text-white" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-[#326BF1] rounded-full hover:bg-[#2858c9] transition-colors">
            <Video className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-4 space-y-3 flex-1">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-[#326BF1]" />
          </div>
          <p className="text-sm text-[#1F1F1F]">
            {patient.address}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-[#326BF1]" />
          </div>
          <p className="text-sm text-[#989898]">
            Last Appointment: <span className="text-[#1F1F1F]">{patient.lastAppointment}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 text-[#326BF1]" />
          </div>
          <p className="text-sm text-[#1F1F1F]">Call: {patient.phone}</p>
        </div>
      </div>
    </div>
  )
}
