"use client"

import { motion } from "framer-motion"

export function LogoBar() {
  const logos = [
    { name: "software AG", display: "software", prefix: "S" },
    { name: "Capterra", display: "Capterra", prefix: "★" },
    { name: "apptim", display: "apptim", prefix: "A" },
    { name: "Cloudoor", display: "Cloudoor", prefix: "" },
    { name: "ebay", display: "ebay", prefix: "" },
  ]

  return (
    <section className="py-16 bg-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
          {/* software AG */}
          <div className="flex items-center gap-1 text-gray-400">
            <span className="text-xl font-bold">S</span>
            <span className="text-lg font-medium tracking-tight">software</span>
            <span className="text-xs align-super">AG</span>
          </div>
          
          {/* Capterra */}
          <div className="flex items-center gap-1 text-gray-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
            <span className="text-lg font-semibold">Capterra</span>
          </div>
          
          {/* apptim */}
          <div className="flex items-center gap-1 text-gray-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-lg font-semibold">apptim</span>
          </div>
          
          {/* Cloudoor */}
          <div className="text-gray-400">
            <span className="text-lg font-semibold tracking-wide">Cloud<span className="font-normal">o</span>or</span>
          </div>
          
          {/* ebay */}
          <div className="text-gray-400">
            <span className="text-xl font-bold tracking-tight">ebay</span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
