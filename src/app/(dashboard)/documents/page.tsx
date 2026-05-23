'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useOrg } from '@/hooks/use-org'
import useSWR from 'swr'
import PageHeader from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Download,
  AlertCircle,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DocStatus, DocumentType } from '@prisma/client'
import { EmptyState } from '@/components/shared/empty-state'
import { PDFDownloadButton } from '@/components/documents/pdf-download-button'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
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

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function DocumentsPage() {
  const router = useRouter()
  const { currentOrg } = useOrg()
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: documents = [], isLoading: loading, mutate } = useSWR(
    currentOrg ? `/api/documents?orgId=${currentOrg.id}` : null,
    fetcher,
    { keepPreviousData: true }
  )

  const handleDelete = (id: string) => setDeletingId(id)

  const confirmDelete = async () => {
    if (!deletingId) return
    try {
      const res = await fetch(`/api/documents/${deletingId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('ลบเอกสารเรียบร้อยแล้ว')
        mutate()
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('ไม่สามารถลบเอกสารได้')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusBadge = (status: DocStatus) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900 border-none font-semibold text-[11px]">แบบร่าง</Badge>
      case 'PENDING_APPROVAL':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-none font-semibold text-[11px]">รออนุมัติ</Badge>
      case 'APPROVED':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none font-semibold text-[11px]">อนุมัติแล้ว</Badge>
      case 'PAID':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none font-semibold text-[11px]">ชำระเงินแล้ว</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-none font-semibold text-[11px]">ปฏิเสธ</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary" className="border-none font-semibold text-[11px]">ยกเลิก</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'INVOICE': return 'ใบแจ้งหนี้'
      case 'RECEIPT': return 'ใบเสร็จรับเงิน'
      case 'QUOTATION': return 'ใบเสนอราคา'
      default: return type
    }
  }

  const filteredDocuments = documents.filter((doc: any) => 
    doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!currentOrg) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-10 w-10 text-slate-400" />}
        title="ไม่พบข้อมูลองค์กร"
        description="กรุณาเลือกหรือสร้างองค์กรก่อนเพื่อจัดการเอกสาร"
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
            title="เอกสาร" 
            subtitle="Manage your quotations, invoices and financial documents"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => router.push('/documents/new')}
            size="sm"
            className="h-10 px-5 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-95 flex items-center gap-2 text-white"
          >
            <Plus className="h-4 w-4" />
            สร้างเอกสารใหม่
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/60 dark:bg-slate-950/40 backdrop-blur-xl p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/5 dark:shadow-none">
        <div className="relative w-full md:w-[450px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input 
            placeholder="ค้นหาตามเลขที่เอกสาร หรือชื่อลูกค้า..." 
            className="pl-11 h-11 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button variant="ghost" size="sm" className="h-10 px-4 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
            <Filter className="mr-2 h-4 w-4" />
            ตัวกรอง
          </Button>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
          <div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-xl border-none">
            <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
               {filteredDocuments.length} รายการ
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-100 dark:bg-slate-900/60 animate-pulse border border-slate-100 dark:border-slate-800" />
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-10 w-10 text-slate-400" />}
          title="ยังไม่มีเอกสาร"
          description="เริ่มต้นสร้างใบเสนอราคาหรือใบแจ้งหนี้ใบแรกของคุณ"
          action={
            <Button onClick={() => router.push('/documents/new')} className="h-10 px-5 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-95 text-white">
              <Plus className="mr-2 h-4 w-4" /> สร้างเอกสารใหม่
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border-none bg-white/80 dark:bg-slate-950/50 backdrop-blur-xl overflow-hidden shadow-xl shadow-slate-200/10 dark:shadow-none">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/40">
              <TableRow className="hover:bg-transparent border-b-slate-100 dark:border-b-slate-800/50">
                <TableHead className="w-[140px] font-semibold text-[11px] uppercase tracking-wider text-slate-500 px-6">เลขที่เอกสาร</TableHead>
                <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 px-4">ลูกค้า</TableHead>
                <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 px-4">ประเภท</TableHead>
                <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 px-4">วันที่</TableHead>
                <TableHead className="text-right font-semibold text-[11px] uppercase tracking-wider text-slate-500 px-4">จำนวนเงิน</TableHead>
                <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 px-4">สถานะ</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc: any, idx: number) => (
                <motion.tr 
                  key={doc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group hover:bg-blue-50/20 dark:hover:bg-blue-900/5 transition-all border-b-slate-100 dark:border-b-slate-800/30"
                >
                  <TableCell className="font-medium text-sm text-blue-600 dark:text-blue-400 px-6">
                    {doc.docNumber}
                  </TableCell>
                  <TableCell className="px-4 font-bold text-slate-900 dark:text-white">
                    {doc.client?.name || '-'}
                  </TableCell>
                  <TableCell className="px-4 text-xs font-medium text-slate-500">
                    {getTypeLabel(doc.type)}
                  </TableCell>
                  <TableCell className="px-4 text-xs text-slate-400 font-bold">
                    {formatDate(doc.issuedDate)}
                  </TableCell>
                  <TableCell className="text-right px-4 font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(doc.total)}
                  </TableCell>
                  <TableCell className="px-4">
                    {getStatusBadge(doc.status)}
                  </TableCell>
                  <TableCell className="px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-2xl border-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                        <DropdownMenuItem onClick={() => router.push(`/documents/${doc.id}`)} className="text-xs font-bold py-2.5 rounded-xl cursor-pointer">
                          <ExternalLink className="mr-2 h-4 w-4 text-blue-500" />
                          ดูรายละเอียด
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs font-bold py-2.5 rounded-xl cursor-pointer" asChild>
                          <PDFDownloadButton document={doc} org={currentOrg} />
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-xs font-bold py-2.5 rounded-xl text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
                          <Trash2 className="mr-2 h-4 w-4" />
                          ลบเอกสาร
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบเอกสาร</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่? การกระทำนี้ไม่สามารถเลิกทำได้และจะส่งผลต่อการรายงานภาษี
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700 rounded-lg">
              ลบเอกสาร
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
