// Component for creating or editing projects
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProjectStatus, PayStatus } from '@prisma/client'
import { Loader2, Check, Briefcase } from 'lucide-react'

const projectSchema = z.object({
  name: z.string().min(2, { message: 'กรุณากรอกชื่อโครงการอย่างน้อย 2 ตัวอักษร' }),
  clientId: z.string().optional().or(z.literal('')),
  status: z.nativeEnum(ProjectStatus),
  budget: z.string().optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormProps {
  initialData?: any
  clients: any[]
  onSubmit: (data: any) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function ProjectForm({
  initialData,
  clients,
  onSubmit,
  onCancel,
  isSubmitting = false
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData?.name || '',
      clientId: initialData?.clientId || '',
      status: initialData?.status || 'PENDING',
      budget: initialData?.budget ? String(initialData.budget) : '',
      startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
      notes: initialData?.notes || '',
      tags: initialData?.tags?.join(', ') || ''
    }
  })

  const currentStatus = watch('status')
  const currentClientId = watch('clientId')

  const handleFormSubmit = (data: ProjectFormData) => {
    // Process tags into array
    const tagArray = data.tags 
      ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : []

    onSubmit({
      ...data,
      tags: tagArray
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 py-2 text-slate-800 dark:text-slate-200">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          ชื่อโครงการ / งาน <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="เช่น พัฒนาเว็บไซต์ E-Commerce"
          {...register('name')}
          className={`h-11 rounded-2xl text-sm font-black border-none glass-effect shadow-sm focus:ring-2 focus:ring-blue-500/20 ${errors.name ? 'ring-2 ring-red-500/50' : ''}`}
        />
        {errors.name && (
          <p className="text-red-500 text-[10px] font-bold mt-1 pl-2">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="clientId" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            ลูกค้า / ผู้ว่าจ้าง
          </Label>
          <Select
            value={currentClientId || 'none'}
            onValueChange={(val) => setValue('clientId', val === 'none' ? '' : (val ?? ''))}
          >
            <SelectTrigger id="clientId" className="h-11 rounded-2xl text-sm font-bold border-none glass-effect shadow-sm">
              <SelectValue placeholder="เลือกลูกค้า" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
              <SelectItem value="none" className="text-xs font-medium">-- ไม่ระบุ --</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs font-bold py-2.5">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            สถานะโครงการ
          </Label>
          <Select
            value={currentStatus}
            onValueChange={(val) => setValue('status', val as ProjectStatus)}
          >
            <SelectTrigger id="status" className="h-11 rounded-2xl text-sm font-bold border-none glass-effect shadow-sm">
              <SelectValue placeholder="เลือกสถานะ" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
              <SelectItem value="PENDING" className="text-xs font-black text-amber-600 py-2.5">รอดำเนินการ (Pending)</SelectItem>
              <SelectItem value="ACTIVE" className="text-xs font-black text-blue-600 py-2.5">กำลังดำเนินการ (Active)</SelectItem>
              <SelectItem value="COMPLETED" className="text-xs font-black text-green-600 py-2.5">เสร็จสิ้น (Completed)</SelectItem>
              <SelectItem value="CANCELLED" className="text-xs font-black text-rose-600 py-2.5">ยกเลิก (Cancelled)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="budget" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            งบประมาณ (บาท)
          </Label>
          <Input
            id="budget"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('budget')}
            className="h-11 rounded-2xl text-sm font-black border-none glass-effect shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            วันที่เริ่มต้น
          </Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
            className="h-11 rounded-2xl text-xs font-bold border-none glass-effect shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            กำหนดส่งงาน
          </Label>
          <Input
            id="dueDate"
            type="date"
            {...register('dueDate')}
            className="h-11 rounded-2xl text-xs font-bold border-none glass-effect shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          แท็ก / หมวดหมู่ย่อย
        </Label>
        <Input
          id="tags"
          placeholder="เช่น เว็บไซต์, React, Supabase"
          {...register('tags')}
          className="h-11 rounded-2xl text-sm font-bold border-none glass-effect shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          หมายเหตุ / รายละเอียดเพิ่มเติม
        </Label>
        <Textarea
          id="notes"
          rows={4}
          placeholder="รายละเอียดเกี่ยวกับตัวงาน ขอบเขตงาน หรือข้อตกลงพิเศษ..."
          {...register('notes')}
          className="rounded-3xl text-sm font-medium border-none glass-effect shadow-sm min-h-[100px]"
        />
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-12 px-6 rounded-2xl font-black text-xs border-none glass-effect hover:bg-white/10"
          disabled={isSubmitting}
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          className="h-12 px-8 rounded-2xl font-black text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/25 transition-all active:scale-95 gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              บันทึกโครงการ
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
