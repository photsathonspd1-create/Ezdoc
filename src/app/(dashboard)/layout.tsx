// Dashboard layout with a sidebar and header
import React from 'react'
import Sidebar from '@/components/shared/sidebar'
import Header from '@/components/shared/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa] dark:bg-[#020204] relative">
      {/* Premium Background Accents */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      
      <Sidebar className="border-none" />
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        <Header className="border-none bg-transparent" />
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
