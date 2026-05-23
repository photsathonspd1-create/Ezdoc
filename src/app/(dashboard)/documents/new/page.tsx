'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrg } from '@/hooks/use-org'
import PageHeader from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Trash2, 
  Save, 
  Calculator, 
  ChevronLeft,
  FileText,
  Building2,
  Calendar,
  Percent,
  Coins,
  Sparkles,
  Loader2
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DocumentType, DocStatus } from '@prisma/client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface LineItem {
  description: string
  quantity: number
  unitPrice: number
}

export default function NewDocumentPage() {
  const router = useRouter()
  const { currentOrg } = useOrg()
  const [loading, setLoading] = useState(false)
  
  // Form State
  const [docType, setDocType] = useState<DocumentType>('QUOTATION')
  const [docNumber, setDocNumber] = useState('')
  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('none')
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState<LineItem[]>([{ description: '', quantity: 1, unitPrice: 0 }])
  const [notes, setNotes] = useState('')
  const [includeVat, setIncludeVat] = useState(true)

  // Master Data
  const [clients, setClients] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    if (!currentOrg) return

    const fetchData = async () => {
      try {
        const [clientsRes, projectsRes] = await Promise.all([
          fetch(`/api/contacts?orgId=${currentOrg.id}&type=CLIENT`),
          fetch(`/api/projects?orgId=${currentOrg.id}`)
        ])
        
        if (clientsRes.ok) setClients(await clientsRes.json())
        if (projectsRes.ok) setProjects(await projectsRes.json())
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [currentOrg])

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items]
    if (field === 'description') {
      newItems[index][field] = value as string
    } else {
      newItems[index][field] = Number(value)
    }
    setItems(newItems)
  }

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const vatAmount = includeVat ? subtotal * 0.07 : 0
  const total = subtotal + vatAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentOrg) return
    if (!clientId) {
      toast.error('กรุณาเลือกลูกค้า')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrg.id,
          type: docType,
          docNumber,
          clientId,
          projectId: projectId === 'none' ? null : projectId,
          issuedDate: new Date(issuedDate),
          dueDate: dueDate ? new Date(dueDate) : null,
          items,
          subtotal,
          vatAmount,
          total: total,
          notes,
          status: 'DRAFT'
        }),
      })

      if (res.ok) {
        toast.success('บันทึกเอกสารเรียบร้อยแล้ว')
        router.push('/documents')
      } else {
        const error = await res.json()
        throw new Error(error.message || 'Failed to save')
      }
    } catch (error: any) {
      console.error('Error saving document:', error)
      toast.error(error.message || 'ไม่สามารถบันทึกเอกสารได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="h-10 w-10 rounded-xl glass-effect border-none"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <PageHeader 
          title="สร้างเอกสารใหม่" 
          subtitle="Generate professional financial documents for your clients"
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* MAIN INFO CARD */}
          <Card className="premium-card border-none shadow-xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                ข้อมูลพื้นฐานของเอกสาร
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="docType" className="text-[10px] font-black uppercase tracking-widest text-slate-400">ประเภทเอกสาร</Label>
                  <Select value={docType} onValueChange={(val) => setDocType(val as DocumentType)}>
                    <SelectTrigger id="docType" className="h-12 rounded-2xl text-sm font-black border-none glass-effect shadow-sm">
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                      <SelectItem value="QUOTATION" className="text-xs font-bold py-2.5">ใบเสนอราคา (Quotation)</SelectItem>
                      <SelectItem value="INVOICE" className="text-xs font-bold py-2.5">ใบแจ้งหนี้ (Invoice)</SelectItem>
                      <SelectItem value="RECEIPT" className="text-xs font-bold py-2.5">ใบเสร็จรับเงิน (Receipt)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docNumber" className="text-[10px] font-black uppercase tracking-widest text-slate-400">เลขที่เอกสาร</Label>
                  <Input 
                    id="docNumber" 
                    placeholder="เช่น INV-2024001" 
                    value={docNumber} 
                    onChange={(e) => setDocNumber(e.target.value)}
                    required
                    className="h-12 rounded-2xl text-sm font-black border-none glass-effect shadow-sm text-blue-600 dark:text-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="client" className="text-[10px] font-black uppercase tracking-widest text-slate-400">ลูกค้า / ผู้รับสัญญา</Label>
                  <Select value={clientId} onValueChange={(val) => setClientId(val || '')}>
                    <SelectTrigger id="client" className="h-12 rounded-2xl text-sm font-black border-none glass-effect shadow-sm">
                      <SelectValue placeholder="เลือกลูกค้า" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-xs font-bold py-2.5">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project" className="text-[10px] font-black uppercase tracking-widest text-slate-400">งาน / โครงการ</Label>
                  <Select value={projectId} onValueChange={(val) => setProjectId(val || 'none')}>
                    <SelectTrigger id="project" className="h-12 rounded-2xl text-sm font-black border-none glass-effect shadow-sm">
                      <SelectValue placeholder="เลือกโครงการ (ถ้ามี)" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                      <SelectItem value="none" className="text-xs font-medium py-2.5">-- ไม่ระบุ --</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs font-bold py-2.5">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="issuedDate" className="text-[10px] font-black uppercase tracking-widest text-slate-400">วันที่ออกเอกสาร</Label>
                  <Input 
                    id="issuedDate" 
                    type="date" 
                    value={issuedDate} 
                    onChange={(e) => setIssuedDate(e.target.value)}
                    required
                    className="h-12 rounded-2xl text-xs font-bold border-none glass-effect shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-[10px] font-black uppercase tracking-widest text-slate-400">วันครบกำหนดชำระ</Label>
                  <Input 
                    id="dueDate" 
                    type="date" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-12 rounded-2xl text-xs font-bold border-none glass-effect shadow-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LINE ITEMS CARD */}
          <Card className="premium-card border-none shadow-xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                รายการสินค้า / บริการ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-950/30">
                  <TableRow className="border-b-slate-100 dark:border-b-slate-800/50">
                    <TableHead className="font-black uppercase text-[10px] tracking-widest pl-8">คำอธิบายรายการ</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-center w-[100px]">จำนวน</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-right w-[150px]">ราคาหน่วยละ</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-right pr-8 w-[150px]">ยอดรวม</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index} className="group hover:bg-blue-50/20 transition-all border-b-slate-50 dark:border-b-slate-800/30">
                      <TableCell className="pl-8 py-5">
                        <Input 
                          placeholder="ระบุรายละเอียดบริการ..."
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="h-10 rounded-xl text-sm font-bold border-none glass-effect shadow-none"
                        />
                      </TableCell>
                      <TableCell className="py-5">
                        <Input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="h-10 rounded-xl text-sm text-center font-black border-none glass-effect shadow-none"
                        />
                      </TableCell>
                      <TableCell className="py-5">
                        <Input 
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="h-10 rounded-xl text-sm text-right font-black border-none glass-effect shadow-none"
                        />
                      </TableCell>
                      <TableCell className="py-5 text-right font-black text-slate-900 dark:text-white pr-8">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </TableCell>
                      <TableCell className="pr-4">
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveItem(index)}
                          className="h-9 w-9 text-slate-300 hover:text-red-500 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddItem}
                  className="rounded-2xl h-11 px-6 font-black text-xs border-none glass-effect hover:bg-white/10 transition-all gap-2"
                >
                  <Plus className="h-4 w-4 text-blue-500" />
                  เพิ่มรายการ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SUMMARY COLUMN */}
        <div className="space-y-8">
          <Card className="premium-card border-none shadow-2xl bg-gradient-to-br from-slate-900 to-slate-950 dark:from-blue-600 dark:to-indigo-700 text-white overflow-hidden">
            <CardHeader className="pb-4 relative">
              <CardTitle className="text-lg font-black flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                   <Calculator className="h-5 w-5 text-white" />
                </div>
                สรุปยอดเงินสุทธิ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative p-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-300" />
                  <span className="text-xs font-bold text-white/90">ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={includeVat} 
                  onChange={(e) => setIncludeVat(e.target.checked)}
                  className="h-5 w-5 rounded-lg border-none bg-white/20 text-blue-500 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="space-y-3 pt-2 text-sm">
                <div className="flex items-center justify-between text-white/60">
                  <span className="font-medium">ยอดรวมก่อนภาษี</span>
                  <span className="font-bold">{formatCurrency(subtotal)}</span>
                </div>
                {includeVat && (
                  <div className="flex items-center justify-between text-blue-300">
                    <span className="font-medium">ภาษีมูลค่าเพิ่ม (7%)</span>
                    <span className="font-black">+{formatCurrency(vatAmount)}</span>
                  </div>
                )}
                <div className="h-px bg-white/10 my-4" />
                <div className="flex items-center justify-between">
                  <span className="text-white font-black text-xs uppercase tracking-widest">ยอดรวมทั้งสิ้น</span>
                  <span className="text-3xl font-black text-white">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card border-none bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl">
             <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                หมายเหตุเพิ่มเติม
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <Textarea 
                id="notes" 
                rows={5}
                placeholder="ระบุข้อมูลเพิ่มเติม หรือเงื่อนไขการชำระเงิน..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-[2rem] text-sm font-medium border-none glass-effect shadow-none min-h-[120px]"
              />
            </CardContent>
            <CardFooter className="p-6 pt-0 flex flex-col gap-3">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 rounded-[1.5rem] font-black text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/25 transition-all active:scale-95 gap-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                บันทึกเอกสาร
              </Button>
              <Button 
                type="button" 
                variant="ghost"
                onClick={() => router.push('/documents')}
                className="w-full h-12 rounded-2xl font-bold text-xs text-slate-400 hover:text-slate-600 transition-all"
              >
                ยกเลิก
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </motion.div>
  )
}
