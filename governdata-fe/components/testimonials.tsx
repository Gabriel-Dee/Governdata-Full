"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState } from "react"

const testimonials = [
  {
    quote: "The Governance API transformed our compliance posture. We went from manual audit logs to cryptographically verified decision trails in days, not months.",
    author: "Dr. Sarah Chen",
    role: "CTO, HealthTech Systems",
  },
  {
    quote: "Finally, a policy engine that speaks our language. The JSON DSL is intuitive for our team, and the OPA integration gives us the flexibility we need for complex scenarios.",
    author: "Michael Rodriguez",
    role: "Security Director, Enterprise SaaS",
  },
  {
    quote: "The blockchain anchoring feature was exactly what our auditors needed. Complete transparency and immutability for every access decision across our EHR platform.",
    author: "Jennifer Park",
    role: "Compliance Officer, MedData Inc",
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <p className="text-emerald-600 text-sm font-medium mb-3">Our clients</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              What developers say about
              <br />
              integrating with us
            </h2>
          </div>
          <div className="flex items-center gap-4 mt-6 md:mt-0">
            <button
              onClick={goToPrevious}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={goToNext}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Testimonial Card */}
        <div className="bg-[#f5f5f5] rounded-3xl p-10 md:p-14">
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-snug mb-10 max-w-4xl">
            {testimonials[currentIndex].quote}
          </blockquote>
          <div>
            <p className="font-semibold text-foreground">{testimonials[currentIndex].author}</p>
            <p className="text-emerald-600 text-sm">{testimonials[currentIndex].role}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
