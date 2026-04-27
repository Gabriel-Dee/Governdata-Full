import Link from "next/link"

export function CTA() {
  return (
    <section className="bg-[#1a1a1a] pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA Content */}
        <div className="text-center pb-24">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Integrate governance and audit into your systems in minutes
          </p>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full text-sm font-medium transition-colors"
          >
            Get Started
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-80">
              <path d="M8 3L8 3.5M8 12.5V13M13 8H12.5M3.5 8H3M11.182 11.182L10.828 10.828M5.172 5.172L4.818 4.818M11.182 4.818L10.828 5.172M5.172 10.828L4.818 11.182" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </Link>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left side */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link href="/" className="flex items-center text-emerald-500 font-bold">
                <img
                  src="/logo-green.png"
                  alt="Governance API"
                  className="h-6 w-auto"
                />
              </Link>
              <Link href="#" className="text-white/50 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-white/50 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/docs" className="text-white/50 hover:text-white transition-colors">
                Documentation
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 text-sm">
              <Link href="#" className="text-white/50 hover:text-white transition-colors">
                GitHub
              </Link>
              <span className="text-emerald-500 text-xs">&#8226;</span>
              <Link href="#" className="text-white/50 hover:text-white transition-colors">
                Twitter
              </Link>
              <span className="text-emerald-500 text-xs">&#8226;</span>
              <Link href="#" className="text-white/50 hover:text-white transition-colors">
                Discord
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
