'use client'

// Header component with title, month selector, notifications and user menu
import React, { useState, Suspense } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { NAV_ITEMS } from '@/lib/constants'
import { Bell, Menu, User, Settings as SettingsIcon, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useOrg } from '@/hooks/use-org'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Sidebar from './sidebar'
import { cn } from '@/lib/utils'

const getThaiMonths = () => {
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]
  const options = []
  const anchorDate = new Date(2026, 4, 1) // May 2026
  
  for (let i = 0; i < 12; i++) {
    const d = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - i, 1)
    const yearBE = d.getFullYear() + 543
    const monthName = months[d.getMonth()]
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    options.push({
      value: val,
      label: `${monthName} ${yearBE}`
    })
  }
  return options
}

function MonthSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const currentMonthParam = searchParams.get('month') || '2026-05'

  const months = getThaiMonths()

  const handleMonthChange = (val: string | null) => {
    if (!val) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', val)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Select value={currentMonthParam} onValueChange={handleMonthChange}>
      <SelectTrigger className="w-[170px] bg-transparent border-none h-9 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/10 transition-all">
        <SelectValue placeholder="เลือกเดือน" />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
        {months.map((m) => (
          <SelectItem key={m.value} value={m.value} className="text-xs rounded-lg font-bold">
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function Header({ className }: { className?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { currentOrg } = useOrg()
  const searchParams = useSearchParams()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const activeItem = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname?.startsWith(item.href + '/')
  )
  const pageTitle = activeItem ? activeItem.labelTh : 'ยินดีต้อนรับ'

  const monthParam = searchParams.get('month') || new Date().toISOString().substring(0,7)
  const [year, month] = monthParam.split('-')
  const thaiMonthShort = ['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
                          'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  const subtitleText = `${thaiMonthShort[parseInt(month)]} ${parseInt(year)+543}${currentOrg ? ` · ${currentOrg.name}` : ''}`

  return (
    <header className={cn(
      "sticky top-0 z-30 flex h-20 w-full items-center justify-between px-8 bg-transparent transition-all",
      className
    )}>
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-none">
            <Sidebar isMobile={true} onClose={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {pageTitle}
          </h1>
          <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-normal">
            {subtitleText}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Month Selector dropdown */}
        <Suspense fallback={<div className="w-[170px] h-10 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-lg" />}>
          <div className="border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1 rounded-lg shadow-sm">
            <MonthSelector />
          </div>
        </Suspense>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-lg shadow-sm transition-all"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-[#050508]" />
        </Button>

        <div className="h-8 w-px bg-slate-200/50 dark:bg-white/5 mx-1 hidden sm:block" />

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-lg p-0 hover:opacity-90 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden transition-all active:scale-95">
              <Avatar className="h-full w-full rounded-none">
                <AvatarImage src={user?.avatarUrl || ''} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-xs font-semibold">
                  {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 rounded-xl p-3 shadow-2xl border-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl" align="end">
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                  {user?.name || 'บัญชีผู้ใช้'}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate">
                  {user?.email || ''}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 mx-2" />
            <div className="p-2 space-y-1">
              <DropdownMenuItem onClick={() => router.push('/settings')} className="gap-3 cursor-pointer py-3 px-4 rounded-xl text-slate-600 dark:text-slate-300 font-medium text-xs hover:bg-blue-50 dark:hover:bg-blue-900/10 focus:bg-blue-50 dark:focus:bg-blue-900/10 transition-colors">
                <User className="h-4 w-4 text-blue-500" />
                <span>ข้อมูลโปรไฟล์</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')} className="gap-3 cursor-pointer py-3 px-4 rounded-xl text-slate-600 dark:text-slate-300 font-medium text-xs hover:bg-blue-50 dark:hover:bg-blue-900/10 focus:bg-blue-50 dark:focus:bg-blue-900/10 transition-colors">
                <SettingsIcon className="h-4 w-4 text-blue-500" />
                <span>การตั้งค่าองค์กร</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 mx-2" />
            <div className="p-2">
              <DropdownMenuItem onClick={signOut} className="gap-3 cursor-pointer py-3 px-4 rounded-xl text-red-600 dark:text-red-400 font-medium text-xs hover:bg-red-50 dark:hover:bg-red-950/20 focus:bg-red-50 dark:focus:bg-red-950/20 transition-all">
                <LogOut className="h-4 w-4" />
                <span>ออกจากระบบ</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
