'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, FileText, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useOrg } from '@/hooks/use-org'

interface ReceiptUploaderProps {
  onScanComplete: (data: {
    amount: number
    date: Date
    description: string
    category?: string
  }) => void
}

export function ReceiptUploader({ onScanComplete }: ReceiptUploaderProps) {
  const { currentOrg } = useOrg()
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    await processReceipt(file)
  }

  const processReceipt = async (file: File) => {
    setIsUploading(true)
    try {
      // Create base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(',')[1]) // remove data:image/...;base64,
        reader.readAsDataURL(file)
      })

      const response = await fetch('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageBase64: base64,
          orgId: currentOrg?.id
        }),
      })

      if (!response.ok) throw new Error('Failed to process receipt')

      const result = await response.json()
      const data = result.data
      
      onScanComplete({
        amount: Number(data.totalAmount || 0),
        date: data.date ? new Date(data.date) : new Date(),
        description: data.description || data.vendorName || 'AI Auto-filled Receipt',
        category: undefined // Could map logic here later
      })

      toast.success('วิเคราะห์ใบเสร็จสำเร็จ!', {
        description: `พบยอดเงิน ฿${Number(data.totalAmount || 0).toLocaleString()} จาก ${data.vendorName || 'ไม่ระบุร้านค้า'}`,
        icon: <Sparkles className="w-4 h-4 text-yellow-500" />
      })
    } catch (error) {
      console.error(error)
      toast.error('ไม่สามารถวิเคราะห์ใบเสร็จได้ กรุณากรอกข้อมูลเอง')
    } finally {
      setIsUploading(false)
    }
  }

  const clearPreview = () => {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
      />

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="bg-blue-100 dark:bg-blue-500/10 p-3 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                อัปโหลดใบเสร็จเพื่อใช้ AI ช่วยกรอกข้อมูล
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ลากไฟล์มาวาง หรือคลิกเพื่อเลือกรูปภาพ
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <Card className="overflow-hidden border-2 border-blue-500/20 bg-slate-50 dark:bg-slate-900/50">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={preview}
                  alt="Receipt Preview"
                  fill
                  className="object-contain p-2"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p className="text-sm font-bold animate-pulse">กำลังใช้ AI วิเคราะห์ข้อมูล...</p>
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full w-8 h-8"
                  onClick={clearPreview}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
