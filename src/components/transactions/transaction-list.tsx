'use client'

import React from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  Receipt
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TransactionListProps {
  transactions: any[]
  onEdit: (transaction: any) => void
  onDelete: (id: string) => void
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        <Receipt className="mx-auto h-10 w-10 text-slate-300 mb-3" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">ไม่พบรายการเงิน</h3>
        <p className="text-xs text-slate-500 mt-1">เริ่มบันทึกรายรับหรือรายจ่ายรายการแรกของคุณ</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/50 backdrop-blur-xl overflow-hidden shadow-xl shadow-slate-200/10 dark:shadow-none">
      <Table>
        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/40">
          <TableRow className="hover:bg-transparent border-b-slate-100 dark:border-b-slate-800/50">
            <TableHead className="w-[140px] font-medium text-xs text-slate-500 uppercase tracking-wider px-6">วันที่</TableHead>
            <TableHead className="font-medium text-xs text-slate-500 uppercase tracking-wider px-4">รายการ</TableHead>
            <TableHead className="font-medium text-xs text-slate-500 uppercase tracking-wider px-4">หมวดหมู่</TableHead>
            <TableHead className="font-medium text-xs text-slate-500 uppercase tracking-wider px-4">วิธีการชำระ</TableHead>
            <TableHead className="text-right font-medium text-xs text-slate-500 uppercase tracking-wider px-6">จำนวนเงิน</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx, idx) => (
            <motion.tr 
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="group hover:bg-blue-50/20 dark:hover:bg-blue-900/5 transition-all border-b-slate-100 dark:border-b-slate-800/30"
            >
              <TableCell className="text-xs text-slate-500 font-normal px-6">
                {formatDate(tx.date)}
              </TableCell>
              <TableCell className="px-4 py-5">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl transition-all group-hover:scale-110",
                    tx.type === 'INCOME' ? "bg-green-100/50 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100/50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  )}>
                    {tx.type === 'INCOME' ? (
                      <ArrowUpCircle className="h-4 w-4 shrink-0" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4 shrink-0" />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{tx.description}</span>
                    {tx.notes && <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{tx.notes}</span>}
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4">
                <Badge variant="outline" className="text-[11px] font-semibold px-3 py-1 rounded-lg border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm">
                  {tx.category?.name || 'ทั่วไป'}
                </Badge>
              </TableCell>
              <TableCell className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-4">
                {tx.paymentMethod || '-'}
              </TableCell>
              <TableCell className="text-right px-6">
                <span className={`text-[15px] font-semibold tracking-tight ${tx.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </TableCell>
              <TableCell className="px-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl p-2 shadow-2xl border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                    <DropdownMenuItem onClick={() => onEdit(tx)} className="text-xs font-bold py-2.5 rounded-xl cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                      แก้ไขรายการ
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(tx.id)} className="text-xs font-bold py-2.5 rounded-xl text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
                      <Trash2 className="mr-2 h-4 w-4" />
                      ลบข้อมูลทิ้ง
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
