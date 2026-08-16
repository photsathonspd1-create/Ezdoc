'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { TransactionType, TxStatus } from '@/types'
import { ReceiptUploader } from './receipt-uploader'

const formSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z.string().min(1, 'กรุณาระบุจำนวนเงิน'),
  description: z.string().min(1, 'กรุณาระบุคำอธิบาย'),
  categoryId: z.string().optional(),
  date: z.date({
    message: 'กรุณาเลือกวันที่',
  } as any),
  paymentMethod: z.string().optional(),
  status: z.nativeEnum(TxStatus),
  notes: z.string().optional(),
  vatRate: z.string(),
})

type TransactionFormValues = z.infer<typeof formSchema>

interface TransactionFormProps {
  orgId: string
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function TransactionForm({ orgId, initialData, onSubmit, onCancel }: TransactionFormProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      amount: initialData.amount.toString(),
      vatRate: initialData.vatRate.toString(),
      date: new Date(initialData.date),
      status: initialData.status,
    } : {
      type: TransactionType.INCOME,
      amount: '',
      description: '',
      status: TxStatus.COMPLETED,
      date: new Date(),
      vatRate: '7',
    },
  })

  const transactionType = form.watch('type')

  const handleScanComplete = (data: { amount: number; date: Date; description: string; category?: string }) => {
    form.setValue('amount', data.amount.toString())
    form.setValue('date', data.date)
    form.setValue('description', data.description)
    if (data.category) {
      form.setValue('type', data.category as TransactionType)
    }
  }

  useEffect(() => {
    async function fetchCategories() {
      setLoadingCategories(true)
      try {
        const res = await fetch(`/api/categories?orgId=${orgId}&type=${transactionType}`)
        if (res.ok) {
          const data = await res.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [orgId, transactionType])

  const onFormSubmit = async (values: TransactionFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit({ ...values, orgId })
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {!initialData && (
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <ReceiptUploader onScanComplete={handleScanComplete} />
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">ประเภท</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value={TransactionType.INCOME} className="text-xs font-semibold">รายรับ (Income)</SelectItem>
                      <SelectItem value={TransactionType.EXPENSE} className="text-xs font-semibold">รายจ่าย (Expense)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs font-bold mt-1.5 mb-1.5">วันที่</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "h-10 pl-3 text-left font-medium text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg shadow-sm",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: th })
                          ) : (
                            <span>เลือกวันที่</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold">รายละเอียด / คำอธิบาย</FormLabel>
                <FormControl>
                  <Input placeholder="เช่น ค่าบริการทำเว็บไซต์, ซื้ออุปกรณ์สำนักงาน" {...field} className="h-10 text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20" />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">จำนวนเงินรวม (รวม VAT)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} className="h-10 text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/20" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">หมวดหมู่</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder={loadingCategories ? "กำลังโหลด..." : "เลือกหมวดหมู่"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-xs font-semibold">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">วิธีการชำระเงิน</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="เลือกวิธีการ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="โอนเงินผ่านธนาคาร" className="text-xs font-semibold">โอนเงินผ่านธนาคาร</SelectItem>
                      <SelectItem value="เงินสด" className="text-xs font-semibold">เงินสด</SelectItem>
                      <SelectItem value="บัตรเครดิต" className="text-xs font-semibold">บัตรเครดิต</SelectItem>
                      <SelectItem value="เช็ค" className="text-xs font-semibold">เช็ค</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vatRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">อัตรา VAT (%)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="เลือกอัตรา" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="7" className="text-xs font-semibold">7% (มาตรฐาน)</SelectItem>
                      <SelectItem value="0" className="text-xs font-semibold">0% (ยกเว้น/ไม่คิด)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold">หมายเหตุ (เพิ่มเติม)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="ข้อมูลเพิ่มเติม..." 
                    {...field} 
                    className="text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg shadow-sm min-h-[80px] focus-visible:ring-2 focus-visible:ring-blue-500/20"
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-10 rounded-lg font-semibold text-xs border border-slate-200 dark:border-slate-800"
              onClick={onCancel}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
