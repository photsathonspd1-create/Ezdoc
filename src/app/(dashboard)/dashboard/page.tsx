'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import nextDynamic from 'next/dynamic'
import { useOrg } from '@/hooks/use-org'
import { StatCard } from '@/components/shared/stat-card'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
  Sparkles,
  AlertTriangle,
  Calendar,
  Building2,
  FileText,
  ArrowRight,
  BarChart3
} from 'lucide-react'
import { motion } from 'framer-motion'

// Dynamically import Recharts component to avoid SSR hydration mismatches
const TrendChart = nextDynamic(() => import('@/components/dashboard/trend-chart'), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl animate-pulse flex items-center justify-center text-slate-400 text-xs font-semibold">
      กำลังโหลดแผนภูมิ...
    </div>
  ),
})

const DonutChart = nextDynamic(() => import('@/components/dashboard/donut-chart'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl animate-pulse flex items-center justify-center text-slate-400 text-xs font-semibold">
      กำลังโหลดแผนภูมิ...
    </div>
  ),
})

interface DashboardData {
  currentMonth: {
    income: number
    expense: number
    profit: number
    cashBalance: number
    incomeMoM: number
    expenseMoM: number
    margin: number
  }
  vat: {
    incomeWithVat: number
    incomeExVat: number
    vatPayable: number
    inputVat: number
    outputVat: number
  }
  trends: Array<{
    month: string
    income: number
    expense: number
    profit: number
  }>
  topProducts: Array<{
    rank: number
    name: string
    revenue: number
    profit: number
    margin: number
  }>
  expenseBreakdown: Array<{
    category: string
    amount: number
    isAlert: boolean
  }>
  aiInsights: Array<{
    id: string
    type: 'positive' | 'warning' | 'reminder'
    title: string
    content: string
    createdAt: string
  }>
}

const formatBaht = (value: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="text-sm font-semibold text-slate-500">กำลังโหลดแดชบอร์ด...</span>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const { currentOrg, isLoading: loadingOrg } = useOrg()
  const searchParams = useSearchParams()
  const [selectedMonth, setSelectedMonth] = useState(searchParams.get('month') || new Date().toISOString().substring(0, 7))

  const [data, setData] = useState<DashboardData | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentOrg) return
    const orgId = currentOrg.id

    async function fetchDashboardData() {
      setLoadingData(true)
      setError(null)
      try {
        const res = await fetch(`/api/dashboard/summary?orgId=${orgId}&month=${selectedMonth}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        } else {
          const err = await res.json()
          setError(err.error || 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้')
        }
      } catch (e) {
        console.error('Error fetching dashboard summary:', e)
        setError('เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์')
      } finally {
        setLoadingData(false)
      }
    }

    fetchDashboardData()
  }, [currentOrg?.id, selectedMonth])

  // Calculate Averages from Trends
  const averages = useMemo(() => {
    if (!data || !data.trends || data.trends.length === 0) {
      return { avgIncome: 0, avgExpense: 0, avgProfit: 0, avgMargin: 0 }
    }
    const len = data.trends.length
    const totalIncome = data.trends.reduce((sum, t) => sum + t.income, 0)
    const totalExpense = data.trends.reduce((sum, t) => sum + t.expense, 0)
    const totalProfit = data.trends.reduce((sum, t) => sum + t.profit, 0)

    const avgIncome = totalIncome / len
    const avgExpense = totalExpense / len
    const avgProfit = totalProfit / len
    const avgMargin = avgIncome > 0 ? (avgProfit / avgIncome) * 100 : 0

    return { avgIncome, avgExpense, avgProfit, avgMargin }
  }, [data])

  if (loadingOrg || (loadingData && !data)) {
    return (
      <div className="space-y-6 animate-pulse">
        <LoadingSkeleton variant="card" count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <LoadingSkeleton variant="chart" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LoadingSkeleton variant="card" count={1} />
              <LoadingSkeleton variant="card" count={1} />
            </div>
          </div>
          <div className="space-y-6">
            <LoadingSkeleton variant="card" count={1} />
            <LoadingSkeleton variant="card" count={1} />
          </div>
        </div>
      </div>
    )
  }

  if (!currentOrg) {
    return (
      <EmptyState
        icon={<Building2 className="h-10 w-10 text-slate-400" />}
        title="ยินดีต้อนรับสู่ WorkflowOS"
        description="กรุณาเลือกองค์กรจากแถบสวิตช์ด้านซ้ายเพื่อเปิดใช้งานแดชบอร์ด หรือสร้างองค์กรแรกของคุณในระบบ"
      />
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-10 w-10 text-red-500" />}
        title="เกิดข้อผิดพลาดในการโหลดข้อมูล"
        description={error}
        action={
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition duration-200"
          >
            ลองใหม่อีกครั้ง
          </button>
        }
      />
    )
  }

  if (!data) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white">ภาพรวมองค์กร</h2>
          <p className="text-xs text-slate-400 font-normal">สรุปผลประกอบการประจำเดือน</p>
        </div>
        <div>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* SECTION 6A: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "รายรับรวมประจำเดือน", value: data.currentMonth.income, trend: data.currentMonth.incomeMoM, icon: TrendingUp, color: "success" },
          { title: "รายจ่ายรวมประจำเดือน", value: data.currentMonth.expense, trend: data.currentMonth.expenseMoM, icon: TrendingDown, color: "destructive" },
          { title: "กำไรสุทธิ (Net Profit)", value: data.currentMonth.profit, subtitle: `Margin ${data.currentMonth.margin.toFixed(1)}%`, icon: Percent, color: "info" },
          { title: "กระแสเงินสดคงเหลือ", value: data.currentMonth.cashBalance, subtitle: "ยอดเงินในบัญชีทั้งหมด", icon: Wallet, color: "neutral" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatCard
              title={stat.title}
              value={formatBaht(stat.value)}
              trend={'trend' in stat ? stat.trend : undefined}
              trendLabel="เทียบกับเดือนก่อน"
              subtitle={'subtitle' in stat ? stat.subtitle : undefined}
              icon={<stat.icon className="h-5 w-5" />}
              color={stat.color as any}
              className="premium-card h-full"
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 6C: LineChart Trend Analysis */}
          <Card className="premium-card border-none shadow-xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">แนวโน้มรายรับ-รายจ่าย</CardTitle>
                  <CardDescription className="text-xs font-medium text-slate-500">Financial Performance Analysis</CardDescription>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                   <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <TrendChart data={data.trends} />
              
              {/* 4 Average Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100/50 dark:border-slate-800/50">
                {[
                  { label: "รายรับเฉลี่ย", val: averages.avgIncome },
                  { label: "รายจ่ายเฉลี่ย", val: averages.avgExpense },
                  { label: "กำไรเฉลี่ย", val: averages.avgProfit },
                  { label: "Margin เฉลี่ย", val: `${averages.avgMargin.toFixed(1)}%` }
                ].map((avg, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{avg.label}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {typeof avg.val === 'number' ? formatBaht(avg.val) : avg.val}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SECTION 6D: Expense Breakdown */}
            <Card className="premium-card border-none bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">โครงสร้างค่าใช้จ่าย</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Expense Distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <DonutChart 
                  data={data.expenseBreakdown.map(e => ({
                    name: e.category,
                    value: e.amount,
                    color: e.isAlert ? '#f59e0b' : undefined // highlight alerts with amber
                  }))} 
                />
              </CardContent>
            </Card>

            {/* SECTION 6E: Top 5 Products */}
            <Card className="premium-card border-none bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">ผลิตภัณฑ์สร้างรายได้</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Top Performing Services</CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t border-slate-100 dark:border-slate-800/50">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-950/30">
                    <TableRow>
                      <TableHead className="w-[50px] text-center font-semibold text-[11px] uppercase">#</TableHead>
                      <TableHead className="font-semibold text-[11px] uppercase">ชื่อบริการ</TableHead>
                      <TableHead className="text-right font-semibold text-[11px] uppercase">รายได้</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topProducts.map((p) => (
                      <TableRow key={p.rank} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                        <TableCell className="text-center font-semibold text-slate-500">{p.rank}</TableCell>
                        <TableCell className="font-normal text-slate-900 dark:text-slate-200">{p.name}</TableCell>
                        <TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400">{formatBaht(p.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          {/* SECTION 6B: VAT Summary Card */}
          <Card className="premium-card border-none bg-gradient-to-br from-slate-900 to-slate-950 dark:from-blue-600 dark:to-indigo-700 text-white shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            <CardHeader className="pb-4 relative">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                   <FileText className="h-5 w-5 text-white" />
                </div>
                สรุปภาษี (VAT)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative text-sm">
              <div className="flex justify-between items-center text-white/70">
                <span className="font-medium">ภาษีขาย</span>
                <span className="font-bold">{formatBaht(data.vat.outputVat)}</span>
              </div>
              <div className="flex justify-between items-center text-white/70">
                <span className="font-medium">ภาษีซื้อ</span>
                <span className="font-bold">{formatBaht(data.vat.inputVat)}</span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between items-end">
                <span className="font-semibold text-white uppercase tracking-wider text-xs">ยอดนำส่งสุทธิ</span>
                <span className="font-bold text-2xl text-white">
                  {formatBaht(data.vat.vatPayable)}
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-6 relative">
              <div className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-[11px] leading-relaxed font-medium flex gap-3">
                <Calendar className="h-4 w-4 shrink-0 text-blue-300" />
                <span>กำหนดส่ง ภ.พ.30 ภายในวันที่ <span className="underline decoration-blue-400">15 มิ.ย. 69</span></span>
              </div>
            </CardFooter>
          </Card>

          {/* SECTION 6F: AI Insights Panel */}
          <Card className="premium-card border-none bg-indigo-50/50 dark:bg-slate-900/40 border border-indigo-100 dark:border-indigo-900/20 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.aiInsights.map((insight, idx) => (
                <motion.div 
                  key={insight.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (idx * 0.1) }}
                  className="p-4 rounded-xl bg-white dark:bg-slate-950 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow group cursor-default"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">{insight.title}</h4>
                    <ArrowRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">{insight.content}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
