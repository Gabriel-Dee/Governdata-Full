import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-6 bg-foreground border-t border-background/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <Link href="/" className="text-emerald-500 font-semibold">
              PassCode
            </Link>
            <Link href="#" className="text-background/60 hover:text-background transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-background/60 hover:text-background transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-background/60 hover:text-background transition-colors">
              Cookies
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-6 text-sm">
            <Link href="#" className="text-background/60 hover:text-background transition-colors">
              Instagram
            </Link>
            <Link href="#" className="text-background/60 hover:text-background transition-colors">
              LinkedIn
            </Link>
            <Link href="#" className="text-background/60 hover:text-background transition-colors">
              Facebook
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
