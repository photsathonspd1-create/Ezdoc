'use client'

import React, { useState, useEffect } from 'react'
import { useOrg } from '@/hooks/use-org'
import useSWR from 'swr'
import { TransactionList } from '@/components/transactions/transaction-list'
import { TransactionForm } from '@/components/transactions/transaction-form'
import PageHeader from '@/components/shared/page-header'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  AlertCircle,
  Receipt,
  ScanLine,
  Sparkles
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function TransactionsPage() {
  const { currentOrg, isLoading: loadingOrg } = useOrg()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: transactions = [], isLoading: loading, mutate } = useSWR(
    currentOrg ? `/api/transactions?orgId=${currentOrg.id}` : null,
    fetcher,
    { keepPreviousData: true }
  )

  const handleCreateOrUpdate = async (formData: any) => {
    const url = editingTransaction 
      ? `/api/transactions/${editingTransaction.id}`
      : '/api/transactions'
    
    const method = editingTransaction ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(editingTransaction ? 'แก้ไขรายการสำเร็จ' : 'บันทึกรายการใหม่สำเร็จ')
        setIsFormOpen(false)
        setEditingTransaction(null)
        mutate()
      } else {
        const err = await res.json()
        toast.error(err.error || 'เกิดข้อผิดพลาดในการบันทึก')
      }
    } catch (error) {
      toast.error('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้')
    }
  }

  const handleDelete = (id: string) => setDeletingId(id)

  const confirmDelete = async () => {
    if (!deletingId) return
    try {
      const res = await fetch(`/api/transactions/${deletingId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('ลบรายการสำเร็จ')
        mutate()
      } else {
        const err = await res.json()
        toast.error(err.error || 'ไม่สามารถลบรายการได้')
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบ')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredTransactions = transactions.filter((tx: any) => 
    tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tx.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loadingOrg || (loading && transactions.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        <LoadingSkeleton variant="card" count={5} />
      </div>
    )
  }

  if (!currentOrg) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-10 w-10 text-slate-400" />}
        title="ไม่พบข้อมูลองค์กร"
        description="กรุณาเลือกหรือสร้างองค์กรก่อนเพื่อจัดการรายการเงิน"
      />
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
           <PageHeader 
            title="รายการเงิน" 
            subtitle="Manage your income, expenses and cashflow with AI assistance"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-11 px-5 rounded-2xl font-semibold text-xs border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md transition-all hover:shadow-md active:scale-95"
          >
            <Download className="mr-2 h-4 w-4 text-slate-500" />
            ส่งออก
          </Button>
          
          <Button 
            onClick={() => {
              setEditingTransaction(null)
              setIsFormOpen(true)
            }}
            size="sm"
            className="h-11 px-6 rounded-2xl font-semibold text-xs bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-95 flex items-center gap-2"
          >
            <div className="bg-white/20 p-1 rounded-lg">
              <Plus className="h-3.5 w-3.5 text-white" />
            </div>
            เพิ่มรายการ
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/60 dark:bg-slate-950/40 backdrop-blur-xl p-5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/10 dark:shadow-none">
        <div className="relative w-full md:w-[450px] group">
          <div className="absolute inset-0 bg-blue-500/5 rounded-xl blur-xl group-focus-within:bg-blue-500/10 transition-all" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input 
            placeholder="ค้นหาตามรายละเอียด, หมวดหมู่, หรือยอดเงิน..." 
            className="pl-11 h-11 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button variant="ghost" size="sm" className="h-10 px-4 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <Filter className="mr-2 h-4 w-4" />
            ตัวกรอง
          </Button>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
          <div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
               {filteredTransactions.length} รายการ
            </p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <TransactionList 
          transactions={filteredTransactions} 
          onEdit={(tx) => {
            setEditingTransaction(tx)
            setIsFormOpen(true)
          }}
          onDelete={handleDelete}
        />
      </motion.div>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        if (!open) {
          setIsFormOpen(false)
          setEditingTransaction(null)
        }
      }}>
        <DialogContent className="sm:max-w-[550px] rounded-2xl border-none shadow-2xl p-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl">
          <DialogHeader className="mb-6">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4">
               <Receipt className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {editingTransaction ? 'แก้ไขรายการเงิน' : 'เพิ่มรายการใหม่'}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">
              {editingTransaction 
                ? 'อัปเดตข้อมูลรายการเงินของคุณให้ถูกต้อง'
                : 'คุณสามารถอัปโหลดใบเสร็จเพื่อให้ AI ช่วยกรอกข้อมูลอัตโนมัติได้'}
            </DialogDescription>
          </DialogHeader>
          
          <TransactionForm 
            orgId={currentOrg.id}
            initialData={editingTransaction}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบรายการ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่? การกระทำนี้ไม่สามารถเลิกทำได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700 rounded-lg">
              ลบรายการ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
