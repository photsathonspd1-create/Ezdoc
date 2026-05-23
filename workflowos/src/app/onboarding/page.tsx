'use client'

export const dynamic = 'force-dynamic'

// Onboarding page wizard for setting up organization
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useOrgStore } from '@/stores/org-store'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Building2, Upload, Check, AlertCircle, ArrowRight, ZoomIn, ZoomOut } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Cropper from 'react-easy-crop'

interface Area {
  x: number
  y: number
  width: number
  height: number
}

const getCroppedImg = (imageSrc: string, pixelCrop: Area, maxSize = 300): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = imageSrc
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(null)
        return
      }

      // Calculate target width & height with ratio mapping to ensure max 300px limit
      let targetWidth = pixelCrop.width
      let targetHeight = pixelCrop.height

      if (targetWidth > maxSize || targetHeight > maxSize) {
        const ratio = Math.min(maxSize / targetWidth, maxSize / targetHeight)
        targetWidth = Math.round(targetWidth * ratio)
        targetHeight = Math.round(targetHeight * ratio)
      }

      canvas.width = targetWidth
      canvas.height = targetHeight

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetWidth,
        targetHeight
      )

      canvas.toBlob(
        (blob) => {
          resolve(blob)
        },
        'image/png'
      )
    }
    image.onerror = (error) => reject(error)
  })
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}

// Zod schemas
const companySchema = z.object({
  name: z.string().min(2, { message: 'กรุณาระบุชื่อบริษัทอย่างน้อย 2 ตัวอักษร' }),
  taxId: z.string().max(13).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' }).optional().or(z.literal('')),
  website: z.string().url({ message: 'รูปแบบเว็บไซต์ไม่ถูกต้อง' }).optional().or(z.literal('')),
})

type CompanyFormData = z.infer<typeof companySchema>

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stepParam = searchParams.get('step')
  const currentStep = stepParam ? parseInt(stepParam, 10) : 1

  const { setCurrentOrg } = useOrgStore()
  const { user, isLoading: authLoading } = useAuth()
  
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Crop states
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      taxId: '',
      address: '',
      phone: '',
      email: '',
      website: '',
    },
  })

  // Watch for auth loading state
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const setStep = (step: number) => {
    router.push(`/onboarding?step=${step}`)
  }

  // Handle Form Submission (Step 1)
  const onSubmitCompany = async (data: CompanyFormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/orgs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'เกิดข้อผิดพลาดในการตั้งค่าบริษัท')
      }

      const org = await res.json()
      setCreatedOrgId(org.id)
      setCurrentOrg(org)
      toast.success('ตั้งค่าข้อมูลบริษัทเรียบร้อยแล้ว')
      setStep(2)
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Logo Select
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 10 * 1024 * 1024) {
        toast.error('ขนาดไฟล์ห้ามเกิน 10MB')
        return
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('รองรับเฉพาะไฟล์ JPG, PNG, WEBP เท่านั้น')
        return
      }

      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setSelectedImage(reader.result as string)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setCropModalOpen(true)
      })
      reader.readAsDataURL(file)
      // Clear input value so selection of same file is possible
      e.target.value = ''
    }
  }

  const handleCropConfirm = async () => {
    if (!selectedImage || !croppedAreaPixels) return

    try {
      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels)
      if (!croppedBlob) {
        throw new Error('ไม่สามารถประมวลผลรูปภาพที่ครอบตัดได้')
      }

      // Convert Blob to File
      const file = new File([croppedBlob], 'cropped-logo.jpg', { type: 'image/jpeg' })
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(croppedBlob))
      toast.success('ครอบตัดและเตรียมรูปภาพเรียบร้อยแล้ว')
      setCropModalOpen(false)
    } catch (error) {
      console.error(error)
      toast.error('เกิดข้อผิดพลาดในการครอปรูปภาพ')
    } finally {
      setSelectedImage(null)
    }
  }

  // Handle Logo Upload (Step 2)
  const handleUploadLogo = async () => {
    if (!createdOrgId || !logoFile) {
      setStep(3)
      return
    }

    setUploadingLogo(true)
    try {
      const fileExt = logoFile.name.split('.').pop()
      const filePath = `${createdOrgId}/logo-${Date.now()}.${fileExt}`

      let finalLogoUrl = ''
      try {
        // Upload file to storage
        const { error } = await supabase.storage
          .from('company-logos')
          .upload(filePath, logoFile, {
            cacheControl: '3600',
            upsert: true,
          })

        if (error) {
          throw error
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('company-logos')
          .getPublicUrl(filePath)

        if (publicUrl.includes('placeholder-project.supabase.co')) {
          throw new Error('Supabase storage is using placeholder URL')
        }

        finalLogoUrl = publicUrl
      } catch (storageError) {
        console.warn('Supabase storage upload failed or unconfigured during onboarding, falling back to Base64:', storageError)
        finalLogoUrl = await blobToBase64(logoFile)
      }

      // Update organization in DB
      const res = await fetch(`/api/orgs/${createdOrgId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logoUrl: finalLogoUrl }),
      })

      if (!res.ok) {
        throw new Error('ไม่สามารถบันทึกที่อยู่โลโก้ในบริษัทได้')
      }

      const updatedOrg = await res.json()
      setCurrentOrg(updatedOrg)
      toast.success('อัปโหลดโลโก้เรียบร้อยแล้ว')
      setStep(3)
    } catch (error) {
      console.error('Logo upload error:', error)
      toast.error('ไม่สามารถอัปโหลดโลโก้ได้ (โปรดตรวจสอบสิทธิ์จัดเก็บข้อมูล) ข้ามไปขั้นตอนถัดไป...')
      // Degrade gracefully, proceed to Step 3
      setStep(3)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleFinish = () => {
    toast.success('ยินดีต้อนรับเข้าสู่ WorkflowOS!')
    router.push('/dashboard')
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-slate-500 dark:text-slate-400">กำลังดาวน์โหลดข้อมูลผู้ใช้...</p>
        </div>
      </div>
    )
  }

  const progressValue = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-4 shadow-lg shadow-primary/20">
          <Building2 className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          ยินดีต้อนรับสู่ WorkflowOS
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          ตั้งค่าองค์กรของคุณใน 3 ขั้นตอนง่ายๆ เพื่อเริ่มใช้งานระบบ
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="px-4 mb-6">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
            <span className={currentStep >= 1 ? 'text-primary' : ''}>1. ตั้งค่าบริษัท</span>
            <span className={currentStep >= 2 ? 'text-primary' : ''}>2. อัปโหลดโลโก้</span>
            <span className={currentStep >= 3 ? 'text-primary' : ''}>3. เสร็จสิ้น</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        <Card className="shadow-xl border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          {/* STEP 1: COMPANY INFO */}
          {currentStep === 1 && (
            <form onSubmit={handleSubmit(onSubmitCompany)}>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  กรอกข้อมูลบริษัท/ร้านค้า
                </CardTitle>
                <CardDescription>
                  ข้อมูลส่วนนี้จะนำไปแสดงผลบนเอกสารทางการเงิน เช่น ใบเสร็จรับเงิน และใบกำกับภาษี
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อบริษัท / ชื่อร้านค้า <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    placeholder="เช่น บริษัท ยูนิซิน จำกัด"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี (13 หลัก)</Label>
                    <Input
                      id="taxId"
                      placeholder="เช่น 0105562000000"
                      maxLength={13}
                      {...register('taxId')}
                      className={errors.taxId ? 'border-red-500' : ''}
                    />
                    {errors.taxId && (
                      <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" /> {errors.taxId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์ติดต่อ</Label>
                    <Input
                      id="phone"
                      placeholder="เช่น 02-123-4567"
                      {...register('phone')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">ที่อยู่บริษัท</Label>
                  <Textarea
                    id="address"
                    rows={3}
                    placeholder="เลขที่ หมู่บ้าน ถนน แขวง เขต จังหวัด รหัสไปรษณีย์"
                    {...register('address')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมลติดต่อสำหรับธุรกิจ</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@company.com"
                      {...register('email')}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" /> {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">เว็บไซต์บริษัท</Label>
                    <Input
                      id="website"
                      placeholder="https://company.com"
                      {...register('website')}
                      className={errors.website ? 'border-red-500' : ''}
                    />
                    {errors.website && (
                      <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" /> {errors.website.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-6">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      ขั้นตอนต่อไป <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          )}

          {/* STEP 2: UPLOAD LOGO */}
          {currentStep === 2 && (
            <div>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  อัปโหลดโลโก้บริษัท (ถ้ามี)
                </CardTitle>
                <CardDescription>
                  อัปโหลดโลโก้ของคุณเพื่อพิมพ์บนเอกสาร หัวจดหมาย หรือรายงานทางการเงิน
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex flex-col items-center py-6">
                <div className="relative group border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-2xl w-48 h-48 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 transition cursor-pointer">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={handleLogoChange}
                    accept="image/jpeg,image/png,image/webp"
                  />
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center space-y-2 text-slate-500 dark:text-slate-400">
                      <Upload className="h-10 w-10 mx-auto text-slate-400 group-hover:text-primary group-hover:scale-110 transition duration-200" />
                      <span className="text-sm font-medium block">คลิกเพื่ออัปโหลด</span>
                      <span className="text-xs text-slate-400">ขนาดแนะนำ: สี่เหลี่ยมจัตุรัส</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  รองรับไฟล์ PNG, JPG, WEBP ขนาดไม่เกิน 10MB (มีระบบช่วยครอบตัดรูปภาพ 1:1)
                </p>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
                <Button variant="outline" onClick={() => setStep(3)} disabled={uploadingLogo}>
                  ข้ามขั้นตอนนี้
                </Button>
                <Button onClick={handleUploadLogo} disabled={uploadingLogo} className="gap-2">
                  {uploadingLogo ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      กำลังอัปโหลด...
                    </>
                  ) : (
                    <>
                      {logoFile ? 'อัปโหลดและถัดไป' : 'ขั้นตอนต่อไป'} <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </div>
          )}

          {/* STEP 3: DONE */}
          {currentStep === 3 && (
            <div>
              <CardHeader className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4 mx-auto animate-bounce">
                  <Check className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">ยินดีด้วย! ตั้งค่าสำเร็จ</CardTitle>
                <CardDescription>
                  องค์กรของคุณได้รับการลงทะเบียนในระบบเรียบร้อยแล้ว
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">สรุปข้อมูลองค์กร:</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-slate-500">ชื่อร้าน/บริษัท:</span>
                    <span className="col-span-2 font-medium text-slate-900 dark:text-white">{getValues('name') || 'บริษัทของคุณ'}</span>
                    
                    {getValues('taxId') && (
                      <>
                        <span className="text-slate-500">เลขผู้เสียภาษี:</span>
                        <span className="col-span-2 font-medium text-slate-900 dark:text-white">{getValues('taxId')}</span>
                      </>
                    )}
                    
                    {getValues('phone') && (
                      <>
                        <span className="text-slate-500">เบอร์โทรศัพท์:</span>
                        <span className="col-span-2 font-medium text-slate-900 dark:text-white">{getValues('phone')}</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-6">
                <Button onClick={handleFinish} size="lg" className="w-full sm:w-auto gap-2">
                  เริ่มต้นใช้งานแดชบอร์ด <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </div>
          )}
        </Card>
      </div>
      {/* Premium Logo Crop Modal */}
      <Dialog open={cropModalOpen} onOpenChange={(open) => {
        if (!open) {
          setSelectedImage(null)
        }
        setCropModalOpen(open)
      }}>
        <DialogContent className="sm:max-w-[550px] p-6 gap-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-950 dark:text-white">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </span>
              ครอบตัดรูปภาพโลโก้องค์กร (1:1 Ratio)
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
              ลากเพื่อปรับตำแหน่ง หรือใช้แถบเลื่อนด้านล่างเพื่อซูม ให้โลโก้อยู่ตรงกลางอย่างสวยงาม
            </DialogDescription>
          </DialogHeader>

          {/* Cropper Container */}
          <div className="relative w-full h-[320px] rounded-xl overflow-hidden bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-inner">
            {selectedImage && (
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                classes={{
                  containerClassName: "bg-slate-900",
                  mediaClassName: "max-w-none",
                  cropAreaClassName: "border-2 border-primary shadow-[0_0_0_9999px_rgba(15,23,42,0.75)] rounded-lg"
                }}
              />
            )}
          </div>

          {/* Slider controls with zoom icons */}
          <div className="space-y-2.5 px-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><ZoomOut className="h-3.5 w-3.5" /> ซูมออก</span>
              <span className="flex items-center gap-1">ซูมเข้า <ZoomIn className="h-3.5 w-3.5" /></span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                aria-label="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <DialogFooter className="flex sm:justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCropModalOpen(false)
                setSelectedImage(null)
              }}
              className="rounded-xl px-4 py-2 border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900/50"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={handleCropConfirm}
              className="rounded-xl px-5 py-2 font-semibold shadow-md shadow-primary/10 transition-transform active:scale-95 bg-primary text-white hover:bg-primary/90"
            >
              บันทึกและครอบตัด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
