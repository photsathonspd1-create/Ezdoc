// Auth layout containing a centered card surface
import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#020204] px-4 py-12 relative overflow-hidden">
      {/* Premium Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <div className="w-full max-w-md space-y-8 rounded-2xl p-8 border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl relative z-10">
        {children}
      </div>
    </div>
  )
}
