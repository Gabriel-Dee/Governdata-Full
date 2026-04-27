import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Skeleton className="h-8 w-44 bg-white/70" />
          <Skeleton className="h-4 w-72 mt-2 bg-white/70" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-44 rounded-xl bg-white/70" />
          <Skeleton className="h-10 w-52 rounded-xl bg-white/70" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl bg-white/80 border border-white/40 p-5">
            <Skeleton className="h-3 w-24 bg-white/70" />
            <Skeleton className="h-8 w-16 mt-3 bg-white/70" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
        <div className="rounded-2xl bg-white/80 border border-white/40 p-5">
          <Skeleton className="h-5 w-40 mb-4 bg-white/70" />
          <Skeleton className="h-[260px] w-full rounded-xl bg-white/70" />
        </div>
        <div className="rounded-2xl bg-white/80 border border-white/40 p-5">
          <Skeleton className="h-5 w-28 mb-4 bg-white/70" />
          <Skeleton className="h-[260px] w-full rounded-xl bg-white/70" />
        </div>
      </div>

      <div className="rounded-2xl bg-white/80 border border-white/40 p-5">
        <Skeleton className="h-5 w-36 bg-white/70" />
        <Skeleton className="h-4 w-56 mt-2 mb-4 bg-white/70" />
        <div className="space-y-3">
          <Skeleton className="h-9 w-full rounded-lg bg-white/70" />
          <Skeleton className="h-9 w-full rounded-lg bg-white/70" />
          <Skeleton className="h-9 w-full rounded-lg bg-white/70" />
        </div>
      </div>
    </>
  )
}

export function TablePageSkeleton() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Skeleton className="h-8 w-40 bg-white/70" />
          <Skeleton className="h-4 w-64 mt-2 bg-white/70" />
        </div>
        <Skeleton className="h-10 w-56 rounded-xl bg-white/70" />
      </div>
      <div className="rounded-2xl bg-white/80 border border-white/40 p-5">
        <div className="space-y-3">
          <Skeleton className="h-9 w-full rounded-lg bg-white/70" />
          <Skeleton className="h-9 w-full rounded-lg bg-white/70" />
          <Skeleton className="h-9 w-full rounded-lg bg-white/70" />
          <Skeleton className="h-9 w-full rounded-lg bg-white/70" />
          <Skeleton className="h-9 w-full rounded-lg bg-white/70" />
        </div>
      </div>
    </>
  )
}

export function AuthGateSkeleton() {
  return (
    <div className="min-h-screen bg-[#E8EDFB]">
      <aside className="hidden lg:block fixed left-4 top-4 bottom-4 w-[220px] rounded-2xl bg-white/70 border border-white/30 p-4">
        <Skeleton className="h-8 w-32 bg-white/70" />
        <div className="mt-6 space-y-2">
          <Skeleton className="h-9 w-full rounded-xl bg-white/70" />
          <Skeleton className="h-9 w-full rounded-xl bg-white/70" />
          <Skeleton className="h-9 w-full rounded-xl bg-white/70" />
          <Skeleton className="h-9 w-full rounded-xl bg-white/70" />
        </div>
      </aside>
      <main className="p-4 pt-16 lg:pt-6 lg:pl-[252px] lg:pr-6 lg:py-6">
        <DashboardSkeleton />
      </main>
    </div>
  )
}
