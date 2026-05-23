'use client'

// Collapsible left sidebar navigation
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, NavItem } from '@/lib/constants'
import { cn } from '@/lib/utils'
import OrgSwitcher from './org-switcher'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Receipt,
  Briefcase,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'

import { motion } from 'framer-motion'

// Icon mapping helper
const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Receipt,
  Briefcase,
  FileText,
  BarChart3,
  Settings,
}

interface SidebarProps {
  className?: string
  isMobile?: boolean
  onClose?: () => void
}

export default function Sidebar({ className, isMobile = false, onClose }: SidebarProps = {}) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  // Force expanded state on mobile
  const collapsed = isMobile ? false : isCollapsed

  return (
    <aside
      suppressHydrationWarning
      className={cn(
        isMobile
          ? 'flex flex-col h-full bg-white dark:bg-slate-950 select-none'
          : cn(
              'hidden md:flex flex-col h-screen border-r border-slate-200 bg-white dark:border-slate-800 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 select-none z-20 sidebar-glass',
              collapsed ? 'w-24' : 'w-72'
            ),
        className
      )}
    >
      {/* Header section with brand logo & toggle button */}
      <div className="flex h-20 items-center justify-between px-6">
        {(!collapsed || isMobile) && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white text-xl font-black">W</span>
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
              WorkflowOS
            </span>
          </motion.div>
        )}
        {collapsed && !isMobile && (
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mx-auto">
            <span className="text-white text-xl font-black">W</span>
          </div>
        )}
        {!isMobile && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {collapsed && !isMobile && (
           <Button
           variant="ghost"
           size="icon"
           onClick={() => setIsCollapsed(!isCollapsed)}
           className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl absolute -right-4 top-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm z-30"
         >
           <ChevronRight className="h-4 w-4" />
         </Button>
        )}
      </div>

      {/* Org switcher area */}
      <div className={cn('px-4 py-2', collapsed && 'flex justify-center')}>
        {collapsed ? (
          <Avatar className="h-10 w-10 rounded-2xl shrink-0 border-2 border-white dark:border-slate-800 shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-black font-sans">
              WO
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
            <OrgSwitcher />
          </div>
        )}
      </div>

      {/* Navigation section */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item: NavItem, idx: number) => {
          const IconComponent = IconMap[item.icon] || LayoutDashboard
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group cursor-pointer border border-transparent select-none relative overflow-hidden',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/50 hover:shadow-md hover:shadow-slate-200/20 dark:hover:shadow-none',
                  collapsed && 'justify-center px-0 h-14 w-14 mx-auto'
                )}
                title={collapsed ? item.labelTh : undefined}
              >
                <IconComponent
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  )}
                />
                {mounted && (!collapsed || isMobile) && <span className="tracking-wide">{item.labelTh.split(' ')[0]}</span>}
                {mounted && isActive && !collapsed && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/60"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* User profile / footer section */}
      <div className="p-4 mt-auto">
        <div className={cn(
          'bg-slate-900 dark:bg-blue-600 rounded-[2rem] p-4 flex items-center justify-between gap-3 shadow-xl transition-all duration-500',
          collapsed ? 'flex-col p-2 rounded-3xl h-24' : 'h-20'
        )}>
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className={cn(
              'border-2 border-white/20 shrink-0 transition-all',
              collapsed ? 'h-10 w-10 rounded-2xl' : 'h-11 w-11 rounded-full'
            )}>
              <AvatarImage src={user?.avatarUrl || ''} />
              <AvatarFallback className="bg-slate-800 text-white text-xs font-black">
                {user?.name?.substring(0, 2).toUpperCase() || 'US'}
              </AvatarFallback>
            </Avatar>
            {(!collapsed || isMobile) && (
              <div className="flex flex-col text-sm overflow-hidden">
                <span className="font-bold text-white truncate leading-none">
                  {user?.name || 'บัญชีผู้ใช้'}
                </span>
                <span className="text-[10px] text-white/50 truncate mt-1.5 font-medium">
                  {user?.email || ''}
                </span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className={cn(
              'h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-all',
              collapsed && 'h-8 w-8'
            )}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
export { IconMap }
