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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-transparent dark:from-blue-950/10 pointer-events-none" />

      <div className="w-full max-w-md space-y-8 rounded-2xl p-8 border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl relative z-10">
        {children}
      </div>
    </div>
  )
}
