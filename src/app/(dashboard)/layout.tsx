// Dashboard layout with a sidebar and header
import React, { Suspense } from 'react'
import Sidebar from '@/components/shared/sidebar'
import Header from '@/components/shared/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-transparent dark:from-blue-950/10 pointer-events-none" />
      <Sidebar className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Suspense fallback={<div className="h-20 w-full bg-slate-50/50 dark:bg-slate-900/50 animate-pulse border-b border-slate-200 dark:border-slate-800" />}>
          <Header />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
