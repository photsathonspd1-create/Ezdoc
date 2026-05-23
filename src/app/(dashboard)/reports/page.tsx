'use client'

import React, { useState, useEffect } from 'react'
import { useOrg } from '@/hooks/use-org'
import useSWR from 'swr'
import PageHeader from '@/components/shared/page-header'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Download, 
  Percent, 
  Scale, 
  AlertCircle,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

const CHART_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#14b8a6']
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ReportsPage() {
  const { currentOrg, isLoading: loadingOrg } = useOrg()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data, isLoading: loading } = useSWR(
    currentOrg ? `/api/dashboard/summary?orgId=${currentOrg.id}` : null,
    fetcher,
    { keepPreviousData: true }
  )

  if (loadingOrg || (loading && !data) || !mounted) {
    return (
      <div className="space-y-8 p-4">
        <div className="h-10 w-64 bg-slate-100 dark:bg-slate-900/60 animate-pulse rounded-lg border border-slate-100 dark:border-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-xl bg-slate-100 dark:bg-slate-900/60 animate-pulse border border-slate-100 dark:border-slate-800" />)}
        </div>
        <div className="h-[400px] rounded-xl bg-slate-100 dark:bg-slate-900/60 animate-pulse border border-slate-100 dark:border-slate-800" />
      </div>
    )
  }

  if (!currentOrg) {
    return (
      <EmptyState
        icon={<Building2 className="h-10 w-10 text-slate-400" />}
        title="ไม่พบข้อมูลองค์กร"
        description="กรุณาเลือกหรือสร้างองค์กรก่อนเพื่อดูรายงานการเงิน"
      />
    )
  }

  const { currentMonth, vat, trends, expenseBreakdown, topProducts } = data

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('th-TH').format(val)
  }

  const pieData = expenseBreakdown.map((item: any, idx: number) => ({
    name: item.category,
    value: Number(item.amount),
    color: CHART_COLORS[idx % CHART_COLORS.length]
  }))

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <PageHeader 
            title="รายงานการเงิน" 
            subtitle="Deep financial analytics and tax compliance overview"
          />
        </div>
        <Button 
          onClick={() => toast.success('ระบบกำลังเตรียมไฟล์ PDF...', { icon: <Sparkles className="h-4 w-4 text-blue-500" /> })}
          size="sm"
          className="h-10 px-5 rounded-lg font-semibold text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 shadow-sm active:scale-95 transition-all gap-2"
        >
          <Download className="h-4 w-4 text-blue-500" />
          ส่งออก PDF
        </Button>
      </div>

      {/* OVERVIEW STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          { label: "รายรับสะสมเดือนนี้", val: currentMonth.income, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "รายจ่ายสะสมเดือนนี้", val: currentMonth.expense, icon: TrendingDown, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "กำไรสุทธิ", val: currentMonth.profit, icon: Percent, color: "text-blue-500", bg: "bg-blue-500/10" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="premium-card border-none p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{stat.label}</span>
                <div className={`h-10 w-10 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{formatCurrency(stat.val)}</h3>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Bar Chart */}
        <Card className="lg:col-span-2 premium-card border-none p-2 overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">เปรียบเทียบกระแสเงินสด</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Monthly Cashflow Analysis</CardDescription>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="h-[320px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" className="dark:stroke-white/5" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dy={15} />
                    <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)' }}
                      itemStyle={{ fontWeight: '800', fontSize: '12px' }}
                    />
                    <Bar dataKey="income" name="รายรับ" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                    <Bar dataKey="expense" name="รายจ่าย" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="premium-card border-none p-2 flex flex-col">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-purple-500" />
              สัดส่วนค่าใช้จ่าย
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-center">
            <div className="h-[220px] w-full mb-8">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={index} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-3">
              {pieData.slice(0, 3).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TAX COMPLIANCE SECTION */}
      <Card className="premium-card border-none overflow-hidden">
        <div className="p-8 bg-slate-900 dark:bg-blue-600 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <Scale className="h-7 w-7 text-blue-300" />
                สรุปรายการภาษีมูลค่าเพิ่ม (VAT 7%)
              </h3>
              <p className="text-blue-100/60 text-sm font-bold uppercase tracking-widest">Tax Compliance & Reporting</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-5 rounded-xl border border-white/10 min-w-[240px]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-200 mb-1">ยอดนำส่งสุทธิ</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{formatCurrency(Math.abs(vat.vatPayable))}</span>
                <span className="text-xs font-bold text-blue-200 mb-1.5">{vat.vatPayable >= 0 ? 'ต้องชำระ' : 'ขอคืน'}</span>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-white/5">
              <TableRow className="border-none">
                <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 pl-10 py-6">รายการทางภาษี</TableHead>
                <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 text-right">ยอดรวม (Inc. VAT)</TableHead>
                <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 text-right">ฐานภาษี (Ex. VAT)</TableHead>
                <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 text-right pr-10">ภาษีมูลค่าเพิ่ม</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-b border-slate-100 dark:border-white/5 hover:bg-transparent">
                <TableCell className="pl-10 py-6 font-bold text-slate-900 dark:text-white">ภาษีขาย (Output VAT) จากรายรับ</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(vat.incomeWithVat)}</TableCell>
                <TableCell className="text-right font-bold text-slate-400">{formatCurrency(vat.incomeExVat)}</TableCell>
                <TableCell className="text-right font-semibold text-rose-500 pr-10">+{formatCurrency(vat.outputVat)}</TableCell>
              </TableRow>
              <TableRow className="border-none hover:bg-transparent">
                <TableCell className="pl-10 py-6 font-bold text-slate-900 dark:text-white">ภาษีซื้อ (Input VAT) จากรายจ่าย</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(vat.incomeWithVat - currentMonth.profit)}</TableCell>
                <TableCell className="text-right font-bold text-slate-400">{formatCurrency((vat.incomeWithVat - currentMonth.profit) - vat.inputVat)}</TableCell>
                <TableCell className="text-right font-semibold text-green-500 pr-10">-{formatCurrency(vat.inputVat)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <div className="p-8 pt-0">
             <div className="p-5 rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/10 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold text-sm text-slate-900 dark:text-white">การตรวจสอบความถูกต้องทางภาษี</h5>
                <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                  กรุณาตรวจสอบใบกำกับภาษีฉบับจริงให้ครบถ้วนก่อนการยื่นแบบ ภ.พ.30 ต่อกรมสรรพากรภายในวันที่ <span className="text-blue-600 font-semibold">15 ของเดือนถัดไป</span> ระบบ AI ของเราคำนวณเบื้องต้นเพื่อช่วยในการวางแผนกระแสเงินสดเท่านั้น
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
