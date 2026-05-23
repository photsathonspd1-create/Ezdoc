'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useOrg } from '@/hooks/use-org'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Printer, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Download,
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
  User,
  ShieldCheck
} from 'lucide-react'
import { formatCurrency, formatDateThai } from '@/lib/utils'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/shared/loading-spinner'

// Utility function to convert numbers into Thai Baht text representation
function arabicToThaiBahtText(number: number): string {
  if (number === 0) return 'ศูนย์บาทถ้วน'

  const numberStr = number.toFixed(2)
  const [bahtStr, satangStr] = numberStr.split('.')

  const thaiNumbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
  const thaiUnits = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน']

  const convertGroup = (groupStr: string): string => {
    let result = ''
    const len = groupStr.length
    for (let i = 0; i < len; i++) {
      const digit = parseInt(groupStr[i])
      const position = len - 1 - i

      if (digit !== 0) {
        if (position === 1 && digit === 1) {
          result += 'สิบ'
        } else if (position === 1 && digit === 2) {
          result += 'ยี่สิบ'
        } else if (position === 0 && digit === 1 && len > 1) {
          result += 'เอ็ด'
        } else {
          result += thaiNumbers[digit] + thaiUnits[position]
        }
      }
    }
    return result
  }

  let bahtText = ''
  const bahtLen = bahtStr.length

  if (bahtLen > 6) {
    const millionPosition = bahtLen - 6
    const millionPart = bahtStr.substring(0, millionPosition)
    const remainingPart = bahtStr.substring(millionPosition)

    bahtText += convertGroup(millionPart) + 'ล้าน'
    bahtText += convertGroup(remainingPart)
  } else {
    bahtText += convertGroup(bahtStr)
  }

  bahtText += 'บาท'

  const satangVal = parseInt(satangStr)
  if (satangVal === 0 || satangStr === '00') {
    bahtText += 'ถ้วน'
  } else {
    bahtText += convertGroup(satangStr) + 'สตางค์'
  }

  return bahtText
}

export default function DocumentDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="text-sm font-semibold text-slate-500">กำลังโหลดเอกสาร...</span>
      </div>
    }>
      <DocumentDetailContent />
    </Suspense>
  )
}

function DocumentDetailContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentOrg, isLoading: loadingOrg } = useOrg()
  
  const [document, setDocument] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const printTriggered = useRef(false)

  const id = params?.id as string
  const shouldPrintDirectly = searchParams.get('print') === 'true'

  const fetchDocument = async () => {
    if (!currentOrg || !id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/documents/${id}?orgId=${currentOrg.id}`)
      if (res.ok) {
        const data = await res.json()
        setDocument(data)
      } else {
        toast.error('ไม่พบเอกสารนี้ หรือคุณไม่มีสิทธิ์เข้าถึง')
        router.push('/documents')
      }
    } catch (error) {
      console.error('Error fetching document details:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลเอกสาร')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocument()
  }, [currentOrg?.id, id])

  // Trigger print dialog when parameter print=true is provided and details are loaded
  useEffect(() => {
    if (document && shouldPrintDirectly && !printTriggered.current) {
      printTriggered.current = true
      // Short delay to ensure browser layout and styles are fully painted
      setTimeout(() => {
        window.print()
      }, 800)
    }
  }, [document, shouldPrintDirectly])

  const getDocTypeTitle = (type: string) => {
    switch (type) {
      case 'INVOICE': return 'ใบแจ้งหนี้ / ใบวางบิล'
      case 'RECEIPT': return 'ใบเสร็จรับเงิน / ใบกำกับภาษี'
      case 'QUOTATION': return 'ใบเสนอราคา (Quotation)'
      case 'PV': return 'ใบสำคัญจ่าย (Payment Voucher)'
      case 'RV': return 'ใบสำคัญรับ (Receipt Voucher)'
      default: return 'เอกสารทั่วไป'
    }
  }

  const getDocTypeCode = (type: string) => {
    switch (type) {
      case 'INVOICE': return 'INV'
      case 'RECEIPT': return 'REC'
      case 'QUOTATION': return 'QT'
      case 'PV': return 'PV'
      case 'RV': return 'RV'
      default: return 'DOC'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">แบบร่าง</Badge>
      case 'PENDING_APPROVAL': return <Badge className="bg-amber-100 text-amber-700 border-amber-200">รออนุมัติ</Badge>
      case 'APPROVED': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">อนุมัติแล้ว</Badge>
      case 'PAID': return <Badge className="bg-blue-100 text-blue-700 border-blue-200">ชำระเงินแล้ว</Badge>
      case 'CANCELLED': return <Badge variant="destructive">ยกเลิก</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!currentOrg || !id) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrg.id,
          status: newStatus
        })
      })

      if (res.ok) {
        toast.success(`อัปเดตสถานะเอกสารสำเร็จ`)
        fetchDocument()
      } else {
        const data = await res.json()
        toast.error(data.error || 'ไม่สามารถอัปเดตสถานะได้')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!currentOrg || !id) return
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้ถาวร?')) return
    
    setActionLoading(true)
    try {
      const res = await fetch(`/api/documents/${id}?orgId=${currentOrg.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('ลบเอกสารเรียบร้อยแล้ว')
        router.push('/documents')
      } else {
        const data = await res.json()
        toast.error(data.error || 'ไม่สามารถลบเอกสารได้')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('เกิดข้อผิดพลาดในการส่งคำสั่งลบเอกสาร')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loadingOrg || loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <LoadingSpinner />
        <span className="text-sm font-semibold text-slate-500">กำลังดาวน์โหลดข้อมูลเอกสาร...</span>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <span className="text-sm font-semibold text-slate-500">ไม่พบเอกสารที่ท่านต้องการ</span>
        <Button onClick={() => router.push('/documents')} variant="outline">กลับไปหน้าเอกสารทั้งหมด</Button>
      </div>
    )
  }

  // Parse items from JSON or array
  const lineItems = Array.isArray(document.items) 
    ? document.items 
    : typeof document.items === 'string' 
      ? JSON.parse(document.items) 
      : []

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Dynamic style tag to completely support premium A4 printer page margin control and styling */}
      <style jsx global>{`
        @media print {
          /* CSS styling for strict print mode */
          aside,
          header,
          nav,
          footer,
          .no-print,
          .no-print * {
            display: none !important;
            height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            overflow: visible !important;
          }

          body {
            background-color: white !important;
            color: black !important;
            font-size: 12px !important;
          }

          .print-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
          }

          .print-badge {
            border: 1px solid #ccc !important;
            color: #000 !important;
            background: none !important;
          }
        }
      `}</style>

      {/* Control panel (no-print) */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between no-print bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => router.push('/documents')} 
            variant="ghost" 
            size="icon"
            className="rounded-full h-10 w-10 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{document.docNumber}</h1>
              {getStatusBadge(document.status)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">ประเภท: {getDocTypeTitle(document.type)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {document.status === 'DRAFT' && (
            <Button
              onClick={() => handleUpdateStatus('APPROVED')}
              disabled={actionLoading}
              size="sm"
              className="h-9 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              อนุมัติเอกสาร
            </Button>
          )}

          {document.status === 'APPROVED' && (
            <Button
              onClick={() => handleUpdateStatus('PAID')}
              disabled={actionLoading}
              size="sm"
              className="h-9 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              ทำเครื่องหมายว่าชำระแล้ว
            </Button>
          )}

          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="h-9 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <Printer className="mr-2 h-4 w-4 text-slate-400" />
            พิมพ์ / สั่งพิมพ์
          </Button>

          <Button
            onClick={handleDelete}
            disabled={actionLoading}
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            ลบเอกสาร
          </Button>
        </div>
      </div>

      {/* Main Document Content Container */}
      <div className="flex justify-center w-full py-4 print-container">
        {/* A4 Paper Mockup Sheets */}
        <Card className="w-full max-w-[800px] bg-white dark:bg-white text-slate-900 border border-slate-200 shadow-2xl p-8 sm:p-12 relative rounded-xl transition-all duration-300 overflow-hidden print-container">
          
          {/* Watermark of status stamps for web screen preview only */}
          <div className="absolute top-20 right-10 rotate-12 opacity-10 font-bold border-4 rounded-xl p-3 text-4xl select-none no-print uppercase tracking-widest text-red-500 border-red-500">
            {document.status}
          </div>

          {/* Header section (Company / Issuer details & Document Meta) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-200 pb-8 items-start">
            <div className="space-y-4">
              {/* Organization Profile Details */}
              <div className="flex items-center gap-3">
                {currentOrg?.logoUrl ? (
                  <div className="h-16 w-auto flex-shrink-0 flex items-center justify-center overflow-hidden bg-white rounded-lg border border-slate-100 p-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={currentOrg.logoUrl} 
                      alt="Company Logo" 
                      className="h-16 w-auto object-contain" 
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm border border-blue-100">
                    {currentOrg?.name?.charAt(0) || 'E'}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-800">{currentOrg?.name}</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">สำนักงานใหญ่</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed font-medium space-y-1">
                <p className="flex items-start"><Building2 className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0 mt-0.5" />{currentOrg?.address || '-'}</p>
                {currentOrg?.taxId && <p className="font-semibold text-slate-700">เลขประจำตัวผู้เสียภาษี: {currentOrg.taxId}</p>}
                <p>โทรศัพท์: {currentOrg?.phone || '-'} | อีเมล: {currentOrg?.email || '-'}</p>
              </div>
            </div>

            <div className="text-left md:text-right space-y-3">
              <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-bold text-sm rounded-lg uppercase tracking-wider print-badge">
                {getDocTypeTitle(document.type)}
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p><span className="font-bold text-slate-800">เลขที่เอกสาร:</span> {document.docNumber}</p>
                <p><span className="font-bold text-slate-800">วันที่ออก (Issue Date):</span> {formatDateThai(document.issuedDate)}</p>
                {document.dueDate && (
                  <p><span className="font-bold text-slate-800">วันครบกำหนด (Due Date):</span> {formatDateThai(document.dueDate)}</p>
                )}
                {document.project && (
                  <p><span className="font-bold text-slate-800">โครงการ (Project):</span> {document.project.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Client Details section */}
          <div className="py-8 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">ลูกค้า / ผู้รับบริการ (Client)</h3>
              {document.client ? (
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-800">{document.client.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed"><span className="font-semibold">ที่อยู่:</span> {document.client.address || '-'}</p>
                  {document.client.taxId && (
                    <p className="text-xs text-slate-700 font-semibold">เลขประจำตัวผู้เสียภาษี: {document.client.taxId}</p>
                  )}
                  {document.client.phone && (
                    <p className="text-xs text-slate-600">เบอร์โทรศัพท์: {document.client.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-medium">- ไม่มีข้อมูลลูกค้า -</p>
              )}
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">ข้อมูลการชำระเงิน</h3>
              <div className="space-y-1">
                <p className="flex items-center"><CreditCard className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> โอนเงินผ่านบัญชีธนาคาร</p>
                <p className="font-semibold text-slate-700 pl-5">บจก. เอส ด็อค โซลูชั่นส์</p>
                <p className="pl-5 text-slate-500">ธนาคารกสิกรไทย: 012-3-45678-9</p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-8 min-h-[220px]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-800 font-bold">
                  <th className="py-2.5 w-12 text-center">ลำดับ</th>
                  <th className="py-2.5">รายละเอียดรายการสินค้า / บริการ</th>
                  <th className="py-2.5 text-right w-20">จำนวน</th>
                  <th className="py-2.5 text-right w-28">ราคาต่อหน่วย</th>
                  <th className="py-2.5 text-right w-28">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.length > 0 ? (
                  lineItems.map((item: any, idx: number) => (
                    <tr key={idx} className="text-slate-700 font-medium">
                      <td className="py-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-3 font-semibold text-slate-800">{item.description}</td>
                      <td className="py-3 text-right">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">ไม่มีรายการสินค้า / บริการ</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial calculations and totals block */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 border-t border-slate-200">
            {/* Thai Baht text presentation label */}
            <div className="md:col-span-7 bg-slate-50 rounded-xl p-4 flex items-center justify-center border border-slate-100 min-h-[50px]">
              <span className="text-xs font-bold text-slate-700 text-center leading-relaxed">
                ({arabicToThaiBahtText(Number(document.total))})
              </span>
            </div>

            {/* Calculations summaries */}
            <div className="md:col-span-5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>รวมเป็นเงิน (Subtotal):</span>
                <span>{formatCurrency(document.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                <span>{formatCurrency(document.vatAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm border-t border-slate-100 pt-2">
                <span>ยอดเงินสุทธิ (Total Amount):</span>
                <span>{formatCurrency(document.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes and signatures section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-16 mt-8 border-t border-slate-100">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">หมายเหตุ (Notes)</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50/50 rounded-lg p-3 min-h-[60px] border border-slate-100/50">
                {document.notes || 'ไม่มีหมายเหตุเพิ่มเติม'}
              </p>
            </div>

            {/* Authorizer / Issuer signature stamp */}
            <div className="flex flex-col items-center justify-end text-center space-y-4 pt-4">
              <div className="w-48 border-b border-dashed border-slate-300 pb-2">
                {/* Mock signature stamp for premium UI view */}
                {document.status === 'PAID' && (
                  <div className="h-8 flex items-center justify-center font-serif italic text-blue-600 text-lg select-none font-bold tracking-widest relative">
                    Authorized
                    <div className="absolute border border-blue-500 rounded-full text-[8px] uppercase font-bold p-0.5 tracking-tighter opacity-70 scale-90 -rotate-12 bg-white/90">
                      Paid Stamp
                    </div>
                  </div>
                )}
                {document.status !== 'PAID' && <div className="h-8" />}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">ผู้รับเงิน / ผู้มีอำนาจลงนาม</p>
                <p className="text-[10px] text-slate-400 font-semibold">วันที่: {formatDateThai(document.issuedDate)}</p>
              </div>
            </div>
          </div>

        </Card>
      </div>
    </div>
  )
}
