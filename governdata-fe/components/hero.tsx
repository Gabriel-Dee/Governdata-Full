"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Shield, Database, FileCheck, Lock, Server, Fingerprint } from "lucide-react"

const floatingIcons = [
  {
    icon: Shield,
    position: "top-28 left-[10%]",
    size: "w-14 h-14",
    iconSize: "w-6 h-6",
    bg: "from-[#d4ede4] to-[#c5e8db]",
    iconColor: "text-emerald-600",
    rotate: "-6deg",
  },
  {
    icon: Server,
    position: "top-24 right-[10%]",
    size: "w-12 h-12",
    iconSize: "w-5 h-5",
    bg: "from-[#3d6b5c] to-[#2d5a4a]",
    iconColor: "text-emerald-200",
    rotate: "6deg",
  },
  {
    icon: Database,
    position: "top-[42%] left-[5%]",
    size: "w-14 h-14",
    iconSize: "w-6 h-6",
    bg: "from-[#d4ede4] to-[#c5e8db]",
    iconColor: "text-emerald-600",
    rotate: "-3deg",
  },
  {
    icon: Lock,
    position: "top-[36%] right-[5%]",
    size: "w-12 h-12",
    iconSize: "w-5 h-5",
    bg: "from-[#4a7d6b] to-[#3a6a5a]",
    iconColor: "text-emerald-200",
    rotate: "8deg",
  },
  {
    icon: FileCheck,
    position: "bottom-36 left-[16%]",
    size: "w-12 h-12",
    iconSize: "w-5 h-5",
    bg: "from-[#d4ede4] to-[#c5e8db]",
    iconColor: "text-emerald-600",
    rotate: "-8deg",
  },
  {
    icon: Fingerprint,
    position: "bottom-28 right-[8%]",
    size: "w-14 h-14",
    iconSize: "w-6 h-6",
    bg: "from-[#5a8b7a] to-[#4a7a6a]",
    iconColor: "text-emerald-200",
    rotate: "4deg",
  },
]

export function Hero() {
  return (
    <section className="page-shell-x pt-4 pb-0">
      {/* Floating card container */}
      <div className="relative min-h-[85vh] rounded-[2.5rem] overflow-hidden bg-gradient-to-b from-[#e6f2ed] via-[#eaf4ef] to-[#dfeee8]">
        {/* Floating 3D Icons - Static positioned */}
        {floatingIcons.map((item, index) => (
          <div
            key={index}
            className={`absolute ${item.position} ${item.size}`}
            style={{ transform: `rotate(${item.rotate})` }}
          >
            <div className="relative w-full h-full">
              {/* Shadow */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[70%] h-2 bg-black/10 rounded-full blur-sm" />
              {/* Icon container with 3D effect */}
              <div className={`relative w-full h-full bg-gradient-to-br ${item.bg} rounded-xl flex items-center justify-center shadow-lg border border-white/30`}>
                <item.icon className={`${item.iconSize} ${item.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
        
        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(85vh-4rem)] px-4 sm:px-6 lg:px-8 text-center pt-16 md:pt-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-emerald-100/50 mb-8">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-foreground">Enterprise-grade governance</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6">
            <span className="text-emerald-500">Govern</span>{" "}
            <span className="text-foreground">and</span>{" "}
            <span className="text-emerald-500">audit</span>
            <br />
            <span className="text-foreground">your access decisions</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Integrate policy enforcement and audit logging into your EHR/EMR, internal apps, and SaaS backends with a simple REST API.
          </p>
          
          {/* CTA */}
          <Button 
            asChild
            size="lg" 
            className="bg-foreground hover:bg-foreground/90 text-background rounded-full px-8 py-6 text-base font-medium"
          >
            <Link href="/docs">
              Get Started
              <Sparkles className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
