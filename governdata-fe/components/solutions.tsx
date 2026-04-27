"use client"

import { Sparkles } from "lucide-react"
import Link from "next/link"

// Custom illustration for Policy Enforcement
function PolicyIllustration() {
  return (
    <div className="relative w-full h-40 flex items-center justify-center">
      {/* Center shield icon */}
      <div className="relative z-10 w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </div>
      
      {/* Top left request */}
      <div className="absolute top-2 left-16">
        <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
      
      {/* Bottom right decision */}
      <div className="absolute bottom-4 right-20">
        <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 160" fill="none">
        <path d="M75 30 Q 85 70, 100 80" stroke="#d1d5db" strokeWidth="2" fill="none" />
        <path d="M100 80 Q 115 90, 130 120" stroke="#d1d5db" strokeWidth="2" fill="none" />
      </svg>
    </div>
  )
}

// Custom illustration for Audit Storage
function AuditIllustration() {
  return (
    <div className="relative w-full h-40 flex items-center justify-center">
      {/* Center database icon */}
      <div className="relative z-10 w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
      </div>
      
      {/* Top monitor - DB */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center">
          <div className="w-8 h-6 bg-gray-800 rounded-sm" />
          <div className="w-2 h-2 bg-gray-800" />
          <div className="w-4 h-1 bg-gray-800 rounded-full" />
        </div>
      </div>
      
      {/* Right blockchain */}
      <div className="absolute top-6 right-12">
        <div className="flex gap-0.5">
          <div className="w-3 h-5 bg-gray-800 rounded-sm" />
          <div className="w-3 h-5 bg-gray-600 rounded-sm" />
          <div className="w-3 h-5 bg-gray-400 rounded-sm" />
        </div>
      </div>
      
      {/* Bottom hash */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div className="w-16 h-5 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
          <span className="text-[8px] text-gray-500 font-mono">hash</span>
        </div>
      </div>
      
      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 160" fill="none">
        <path d="M100 35 L 100 65" stroke="#d1d5db" strokeWidth="2" fill="none" />
        <path d="M100 95 L 100 125" stroke="#d1d5db" strokeWidth="2" fill="none" />
        <path d="M115 75 Q 135 55, 150 45" stroke="#d1d5db" strokeWidth="2" fill="none" />
      </svg>
    </div>
  )
}

// Custom illustration for Compliance
function ComplianceIllustration() {
  return (
    <div className="relative w-full h-40 flex items-center justify-center">
      {/* Center check icon */}
      <div className="relative z-10 w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      </div>
      
      {/* Top HIPAA badge */}
      <div className="absolute top-2 right-16">
        <div className="px-2 py-1 bg-gray-800 rounded text-[8px] text-white font-bold">HIPAA</div>
      </div>
      
      {/* Left GDPR */}
      <div className="absolute bottom-6 left-16">
        <div className="px-2 py-1 bg-gray-800 rounded text-[8px] text-white font-bold">GDPR</div>
      </div>
      
      {/* Right SOC2 */}
      <div className="absolute bottom-6 right-14">
        <div className="px-2 py-1 bg-gray-800 rounded text-[8px] text-white font-bold">SOC2</div>
      </div>
      
      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 160" fill="none">
        <path d="M110 70 Q 130 50, 145 35" stroke="#d1d5db" strokeWidth="2" fill="none" />
        <path d="M90 90 Q 70 100, 60 115" stroke="#d1d5db" strokeWidth="2" fill="none" />
        <path d="M110 90 Q 130 100, 145 115" stroke="#d1d5db" strokeWidth="2" fill="none" />
      </svg>
    </div>
  )
}

const solutions = [
  {
    illustration: PolicyIllustration,
    title: "Policy enforcement runtime",
    description: "Evaluate access requests against JSON DSL or OPA/Rego policies with configurable runtimes and instant ALLOW/DENY decisions.",
  },
  {
    illustration: AuditIllustration,
    title: "Immutable audit storage",
    description: "Store decisions in Postgres, anchor to blockchain, or both. Every action is hashed and traceable for complete auditability.",
  },
  {
    illustration: ComplianceIllustration,
    title: "Compliance-ready",
    description: "Built for healthcare and enterprise with HIPAA, GDPR, and SOC2 requirements in mind. Full forensic replay capability.",
  },
]

export function Solutions() {
  return (
    <section id="solutions" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-emerald-600 text-sm font-medium">Our solution</p>
          <Link 
            href="/docs" 
            className="text-sm font-medium text-foreground hover:text-emerald-600 transition-colors inline-flex items-center gap-1.5"
          >
            Explore more
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>

        {/* Title Row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Governance-as-a-Service API
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs mt-4 lg:mt-1 lg:text-right leading-relaxed">
            Integrate policy enforcement and audit logging into your existing systems.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {solutions.map((solution) => (
            <div
              key={solution.title}
              className="bg-[#f5f5f5] rounded-3xl p-8 pt-6"
            >
              {/* Custom Illustration */}
              <solution.illustration />
              
              {/* Title */}
              <h3 className="text-xl font-bold text-foreground mb-3 leading-tight">
                {solution.title}
              </h3>
              
              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                {solution.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
