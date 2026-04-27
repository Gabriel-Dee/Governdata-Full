"use client"

import { FormEvent, useState } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Stethoscope, User, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { ApiError } from "@/lib/api/client"
import { useSession } from "@/components/auth/session-provider"
import { defaultLandingPath } from "@/lib/rbac"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useSession()

  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("admin123!")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextPath, setNextPath] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return
    const query = new URLSearchParams(window.location.search)
    setNextPath(query.get("next") ?? "")
  }, [])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const session = await login(username, password)
      router.replace(nextPath || defaultLandingPath(session.permissions))
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Unable to login right now. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#E8EDFB] p-3 md:p-5">
      <div className="min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2.5rem)] rounded-3xl border border-white/40 bg-white/70 backdrop-blur-sm overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12">
        <section className="hidden lg:flex lg:col-span-7 relative bg-[#0B1220] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(50,107,241,0.18),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(50,107,241,0.1),transparent_45%)]" />
          <div className="absolute -left-24 top-12 h-[520px] w-[520px] rounded-full border border-white/10" />
          <div className="absolute left-20 top-24 h-[380px] w-[380px] rounded-full border border-white/10" />
          <div className="absolute left-44 top-40 h-[220px] w-[220px] rounded-full border border-white/10" />
          <div className="relative z-10 p-10 flex flex-col justify-between h-full">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-white/90 w-fit">
              <Stethoscope className="w-4 h-4" />
              <span className="text-sm font-medium">EHR-Med Platform</span>
            </div>
            <div className="max-w-md">
              <h2 className="text-white text-4xl font-semibold leading-tight">
                Secure clinical access for your care teams
              </h2>
              <p className="text-white/70 text-sm mt-4">
                Role-based access, governed data visibility, and backend-driven permissions in one workflow.
              </p>
            </div>
          </div>
        </section>

        <section className="col-span-1 lg:col-span-5 bg-white/90 px-6 sm:px-10 py-8 sm:py-10 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <p className="text-xs tracking-wide uppercase text-[#989898]">Welcome back</p>
            <h1 className="text-3xl font-semibold text-[#1F1F1F] mt-1">Sign in to your account</h1>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-[#1F1F1F] mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#989898]" />
                  <input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#326BF1]/30"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#1F1F1F] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#989898]" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#326BF1]/30"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#989898] hover:text-[#326BF1] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#326BF1] hover:bg-[#2758d2] disabled:bg-[#8ba9f5] text-white text-sm font-medium py-2.5 transition-colors inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Signing in..." : "Continue"}
                {!isSubmitting ? <ArrowRight className="w-4 h-4" /> : null}
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-[#326BF1]/20 bg-[#326BF1]/5 px-3 py-2.5 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#326BF1] mt-0.5" />
              <p className="text-xs text-[#326BF1]">
                Auth uses JWT from your backend login endpoint with permission-based UI gates.
              </p>
            </div>

            <p className="text-xs text-[#989898] mt-5">
              Backend URL is read from <code>NEXT_API_BASE_URL</code> in <code>.env.local</code>.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
