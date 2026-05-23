'use client'

// Settings page with tabs for company info, member management, and subscription
import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useOrg } from '@/hooks/use-org'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Building2, Users, CreditCard, Upload, UserPlus, Trash2, AlertCircle, Shield, Check, ZoomIn, ZoomOut, Sparkles, Loader2, Webhook, Key, Lock, ExternalLink } from 'lucide-react'
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
  taxId: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
})

type CompanyFormData = z.infer<typeof companySchema>

interface Member {
  id: string
  orgId: string
  userId: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
}

export default function SettingsPage() {
  const { currentOrg, setCurrentOrg, fetchUserOrgs, isLoading: loadingOrg } = useOrg()
  const { user } = useAuth()

  // State
  const [activeTab, setActiveTab] = useState('company')
  const [members, setMembers] = useState<Member[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Fetch orgs if missing
  useEffect(() => {
    if (!currentOrg && !loadingOrg) {
      fetchUserOrgs()
    }
  }, [currentOrg, loadingOrg, fetchUserOrgs])

  // Crop states
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  // Member Invite Dialog state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER'>('MEMBER')
  const [inviting, setInviting] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  // React Hook Form for Company details
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      taxId: '',
      address: '',
      phone: '',
      email: '',
    },
  })

  // Integrations form
  const {
    register: registerInt,
    handleSubmit: handleIntSubmit,
    setValue: setIntValue,
    formState: { errors: intErrors }
  } = useForm({
    defaultValues: {
      openaiKey: '',
      lineToken: '',
    }
  })

  // Sync current org data with form inputs
  useEffect(() => {
    if (currentOrg) {
      console.log('GOD: Syncing form with currentOrg data')
      setValue('name', currentOrg.name)
      setValue('taxId', currentOrg.taxId || '')
      setValue('address', currentOrg.address || '')
      setValue('phone', currentOrg.phone || '')
      setValue('email', currentOrg.email || '')
      setValue('website', currentOrg.website || '')
      setLogoPreview(currentOrg.logoUrl || null)
      setIntValue('openaiKey', currentOrg.openaiKey || '')
      setIntValue('lineToken', currentOrg.lineToken || '')
    }
  }, [currentOrg, setValue, setIntValue])

  const fetchMembers = useCallback(async () => {
    if (!currentOrg) return
    setLoadingMembers(true)
    try {
      const res = await fetch(`/api/orgs/${currentOrg.id}/members`)
      if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลสมาชิกได้')
      const data = await res.json()
      setMembers(data)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก')
    } finally {
      setLoadingMembers(false)
    }
  }, [currentOrg?.id])

  // Fetch members when active tab changes to 'members'
  useEffect(() => {
    if (activeTab === 'members' && currentOrg) {
      fetchMembers()
    }
  }, [activeTab, currentOrg?.id, fetchMembers])

  // Update Org handler
  const onUpdateCompany = async (data: CompanyFormData) => {
    const orgToUpdate = currentOrg
    if (!orgToUpdate) {
      toast.error('ไม่พบข้อมูลองค์กรปัจจุบัน กรุณารอระบบโหลดสักครู่')
      return
    }

    setIsUpdatingOrg(true)
    console.log('GOD: Attempting update for org:', orgToUpdate.id, 'with data:', data)

    try {
      const res = await fetch(`/api/orgs/${orgToUpdate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'การบันทึกข้อมูลล้มเหลวที่ระดับเซิร์ฟเวอร์')
      }

      const updated = await res.json()
      console.log('GOD: Update successful!', updated)
      
      // Update local states
      setCurrentOrg(updated)
      setLogoPreview(updated.logoUrl || null)
      
      toast.success('บันทึกข้อมูลบริษัทเรียบร้อยแล้ว', {
        icon: <Sparkles className="w-4 h-4 text-yellow-500" />
      })
    } catch (error) {
      console.error('GOD: Detailed Save Error:', error)
      toast.error(error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsUpdatingOrg(false)
    }
  }

  // Logo Change & Upload Handler
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentOrg) {
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
    if (!selectedImage || !croppedAreaPixels || !currentOrg) return

    setUploadingLogo(true)
    setCropModalOpen(false)
    try {
      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels)
      if (!croppedBlob) {
        throw new Error('ไม่สามารถประมวลผลรูปภาพที่ครอบตัดได้')
      }

      // Name upload file
      const filePath = `${currentOrg.id}/logo-${Date.now()}.png`

      let finalLogoUrl = ''
      try {
        // Upload to supabase storage
        const { error } = await supabase.storage
          .from('company-logos')
          .upload(filePath, croppedBlob, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: true,
          })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('company-logos')
          .getPublicUrl(filePath)

        if (publicUrl.includes('placeholder-project.supabase.co')) {
          throw new Error('Supabase storage is using placeholder URL')
        }

        finalLogoUrl = publicUrl
      } catch (storageError) {
        console.warn('Supabase storage upload failed or unconfigured, falling back to Base64:', storageError)
        // Storage failed -> Fallback to Base64 in database
        finalLogoUrl = await blobToBase64(croppedBlob)
      }

      // Patch DB
      const res = await fetch(`/api/orgs/${currentOrg.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logoUrl: finalLogoUrl }),
      })

      if (!res.ok) throw new Error('ไม่สามารถบันทึกที่อยู่โลโก้ในบริษัทได้')

      const updated = await res.json()
      setCurrentOrg(updated)
      setLogoPreview(finalLogoUrl)
      toast.success('อัปเดตและสัดส่วนโลโก้บริษัทสำเร็จ')
    } catch (error) {
      console.error(error)
      toast.error('เกิดข้อผิดพลาดในการบันทึกโลโก้แบบครอป')
    } finally {
      setUploadingLogo(false)
      setSelectedImage(null)
    }
  }

  // Invite Member handler
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentOrg || !inviteEmail) return

    setInviting(true)
    try {
      const res = await fetch(`/api/orgs/${currentOrg.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'เกิดข้อผิดพลาดในการเชิญสมาชิก')
      }

      toast.success('เชิญสมาชิกเข้าร่วมระบบเรียบร้อยแล้ว')
      setInviteEmail('')
      setIsInviteOpen(false)
      fetchMembers()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'เชิญสมาชิกล้มเหลว')
    } finally {
      setInviting(false)
    }
  }

  // Remove Member handler
  const handleRemoveMember = async (memberUserId: string) => {
    if (!currentOrg) return
    
    const confirmRemove = window.confirm('คุณแน่ใจหรือไม่ที่จะลบสมาชิกท่านนี้ออกจากบริษัท?')
    if (!confirmRemove) return

    try {
      const res = await fetch(`/api/orgs/${currentOrg.id}/members?memberId=${memberUserId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'เกิดข้อผิดพลาดในการลบสมาชิก')
      }

      toast.success('ลบสมาชิกเรียบร้อยแล้ว')
      fetchMembers()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'ไม่สามารถลบสมาชิกได้')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200'
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'เจ้าของ (Owner)'
      case 'ADMIN':
        return 'ผู้ดูแลระบบ (Admin)'
      default:
        return 'สมาชิก (Member)'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">ตั้งค่าระบบ (Settings)</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          ปรับแต่งข้อมูลองค์กร จัดการสิทธิ์ และตั้งค่าการเชื่อมต่อ API ต่างๆ
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col lg:flex-row gap-6">
        <TabsList className="flex flex-col w-full lg:w-64 h-auto p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 gap-1 bg-slate-50 dark:bg-slate-950">
          <TabsTrigger value="company" className="w-full justify-start rounded-xl gap-3 text-sm font-semibold px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <Building2 className="h-4 w-4" /> ข้อมูลบริษัท
          </TabsTrigger>
          <TabsTrigger value="members" className="w-full justify-start rounded-xl gap-3 text-sm font-semibold px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <Users className="h-4 w-4" /> สมาชิกและสิทธิ์
          </TabsTrigger>
          <TabsTrigger value="integrations" className="w-full justify-start rounded-xl gap-3 text-sm font-semibold px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <Webhook className="h-4 w-4" /> การเชื่อมต่อ API
          </TabsTrigger>
          <div className="my-2 border-t border-slate-200/50 dark:border-slate-800/50 w-full" />
          <TabsTrigger value="subscription" className="w-full justify-start rounded-xl gap-3 text-sm font-semibold px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <CreditCard className="h-4 w-4" /> แผนบริการ
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 min-w-0">
          {/* TAB 1: COMPANY INFO */}
        <TabsContent value="company" className="outline-none">
          <Card className="premium-card">
            <form onSubmit={handleSubmit(onUpdateCompany, (errors) => {
              console.error('Form Validation Errors:', errors)
              toast.error('กรุณาตรวจสอบข้อมูลให้ถูกต้อง', {
                description: Object.values(errors).map(e => e?.message).join(', ')
              })
            })}>
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  ข้อมูลผู้เสียภาษีและที่อยู่ออกเอกสาร
                </CardTitle>
                <CardDescription>
                  ข้อมูลส่วนนี้จะนำไปแสดงบนหัวเอกสารทางการเงิน PV, RV, ใบกำกับภาษี ขององค์กรคุณ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo section */}
                <div className="flex flex-col sm:flex-row gap-6 items-center p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="relative group rounded-2xl w-28 h-28 flex items-center justify-center bg-white dark:bg-slate-950 overflow-hidden shadow-2xl ring-1 ring-white/20">
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                    ) : (
                      <Building2 className="h-10 w-10 text-slate-300" />
                    )}
                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <h4 className="font-medium text-sm tracking-tight">โลโก้องค์กร</h4>
                    <p className="text-[11px] text-slate-500 font-medium">สัดส่วนที่แนะนำ 1:1 (Square) รองรับไฟล์ JPG, PNG, WEBP</p>
                    <div className="flex items-center gap-2 justify-center sm:justify-start pt-2">
                      <Button type="button" variant="outline" size="sm" className="relative gap-2 h-9 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm active:scale-95 transition-all">
                        <Upload className="h-4 w-4 text-blue-500" /> เลือกไฟล์ใหม่
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={handleLogoChange}
                          accept="image/jpeg,image/png,image/webp"
                          disabled={uploadingLogo}
                        />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">ชื่อบริษัท / ร้านค้า <span className="text-red-500">*</span></Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี (13 หลัก)</Label>
                    <Input
                      id="taxId"
                      placeholder="0105562000000"
                      maxLength={13}
                      {...register('taxId')}
                      className={errors.taxId ? 'border-red-500' : ''}
                    />
                    {errors.taxId && (
                      <p className="text-red-500 text-[10px] mt-1">{errors.taxId.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">ที่อยู่ทางการเงิน (สำหรับออกเอกสาร)</Label>
                  <Textarea
                    id="address"
                    rows={3}
                    placeholder="ที่อยู่บริษัท แขวง เขต จังหวัด รหัสไปรษณีย์"
                    {...register('address')}
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-[10px] mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input 
                      id="phone" 
                      placeholder="02-123-4567" 
                      {...register('phone')} 
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-[10px] mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมลธุรกิจ</Label>
                    <Input 
                      id="email" 
                      placeholder="billing@company.com" 
                      {...register('email')} 
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-[10px] mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">เว็บไซต์</Label>
                    <Input 
                      id="website" 
                      placeholder="www.company.com" 
                      {...register('website')} 
                      className={errors.website ? 'border-red-500' : ''}
                    />
                    {errors.website && (
                      <p className="text-red-500 text-[10px] mt-1">{errors.website.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-6 border-none">
                <Button 
                  type="submit" 
                  disabled={isUpdatingOrg} 
                  className="h-12 px-8 rounded-2xl font-medium text-sm bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/25 transition-all active:scale-95 gap-2"
                >
                  {isUpdatingOrg ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      บันทึกข้อมูล
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* TAB 2: MEMBERS */}
        <TabsContent value="members" className="outline-none">
          <Card className="premium-card">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  การเข้าถึงและผู้ใช้งาน
                </CardTitle>
                <CardDescription>
                  เชิญพนักงานหรือฝ่ายบัญชีเข้าร่วมองค์กรเพื่อช่วยจัดการระบบ
                </CardDescription>
              </div>

              {/* Invite Member Dialog */}
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1 shadow-sm">
                    <UserPlus className="h-4 w-4" /> เชิญสมาชิกใหม่
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handleInviteMember}>
                    <DialogHeader>
                      <DialogTitle>เชิญสมาชิกเข้าร่วมทีม</DialogTitle>
                      <DialogDescription>
                        ส่งคำเชิญไปยังอีเมลของผู้ใช้ที่ลงทะเบียนในระบบเรียบร้อยแล้ว
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="emailInvite">อีเมลสมาชิก</Label>
                        <Input
                          id="emailInvite"
                          placeholder="name@email.com"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roleInvite">บทบาทการทำงาน (Role)</Label>
                        <Select
                          value={inviteRole}
                          onValueChange={(val) => {
                            if (val) setInviteRole(val)
                          }}
                        >
                          <SelectTrigger id="roleInvite">
                            <SelectValue placeholder="เลือกบทบาท" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">สมาชิกทั่วไป (Member)</SelectItem>
                            <SelectItem value="ADMIN">ผู้ดูแลระบบ (Admin)</SelectItem>
                            <SelectItem value="OWNER">เจ้าขององค์กร (Owner)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setIsInviteOpen(false)}>
                        ยกเลิก
                      </Button>
                      <Button type="submit" disabled={inviting} className="gap-1">
                        {inviting ? 'กำลังส่งเชิญ...' : 'ส่งคำเชิญ'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              {loadingMembers ? (
                <div className="p-12 text-center text-slate-500">กำลังดาวน์โหลดข้อมูลสมาชิก...</div>
              ) : (
                <div className="border-t border-slate-100 dark:border-slate-800">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/60">
                      <TableRow>
                        <TableHead>สมาชิก</TableHead>
                        <TableHead>อีเมล</TableHead>
                        <TableHead>บทบาท / สิทธิ์</TableHead>
                        <TableHead>วันที่เข้าร่วม</TableHead>
                        <TableHead className="text-right">การจัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium flex items-center gap-3 py-4">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={member.user.avatarUrl || ''} />
                              <AvatarFallback className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {member.user.name.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {member.user.name} {member.user.id === user?.id && <span className="text-xs text-slate-400 font-normal">(คุณ)</span>}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">{member.user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${getRoleBadgeColor(member.role)} border px-2 py-0.5 text-xs font-semibold rounded-md`}>
                              {getRoleLabel(member.role)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-500 text-sm">
                            {new Date(member.joinedAt).toLocaleDateString('th-TH', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {member.role !== 'OWNER' && member.user.id !== user?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMember(member.user.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: SUBSCRIPTION */}
        <TabsContent value="subscription" className="outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free tier */}
            <Card className="premium-card">
              {currentOrg?.planTier === 'FREE' && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  แผนงานปัจจุบัน
                </div>
              )}
              <CardHeader>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Free Plan</h3>
                <CardDescription>เหมาะสำหรับการเริ่มต้นทำธุรกิจ</CardDescription>
                <div className="mt-4 flex items-baseline text-slate-900 dark:text-white">
                  <span className="text-4xl font-bold tracking-tight">฿0</span>
                  <span className="ml-1 text-xl font-semibold text-slate-500">/เดือน</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pt-4">
                <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> บันทึกรายรับ-รายจ่ายสูงสุด 50 รายการ/เดือน
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> ออกเอกสารทางการเงิน (PV/RV/INV) 10 ใบ/เดือน
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> จำนวนผู้ใช้งานในระบบสูงสุด 2 ท่าน
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <Shield className="h-4 w-4 text-slate-300 shrink-0" /> ไม่รองรับการวิเคราะห์ AI Insights
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-6">
                <Button className="w-full" variant="outline" disabled>
                  {currentOrg?.planTier === 'FREE' ? 'แผนงานปัจจุบัน' : 'เริ่มต้นใช้งานฟรี'}
                </Button>
              </CardFooter>
            </Card>

            {/* Pro tier */}
            <Card className="premium-card ring-2 ring-blue-600/50">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                แนะนำสำหรับ SMEs
              </div>
              <CardHeader>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Pro Plan</h3>
                <CardDescription>สำหรับธุรกิจขนาดเล็กและร้านค้าออนไลน์</CardDescription>
                <div className="mt-4 flex items-baseline text-slate-900 dark:text-white">
                  <span className="text-4xl font-bold tracking-tight">฿390</span>
                  <span className="ml-1 text-xl font-semibold text-slate-500">/เดือน</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pt-4">
                <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> บันทึกรายการเงินได้ไม่จำกัด
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> ออกเอกสารทางการเงิน PDF ไม่จำกัด
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> จำนวนผู้ใช้งานสูงสุด 5 ท่าน
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> ระบบวิเคราะห์รายได้ AI Insights เบื้องต้น
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> เชื่อมต่อระบบแจ้งเตือน LINE Notify
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-6">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled>
                  อัปเกรดแผนบริการ (เร็วๆ นี้)
                </Button>
              </CardFooter>
            </Card>

            {/* Business tier */}
            <Card className="premium-card">
              <CardHeader>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Business Plan</h3>
                <CardDescription>สำหรับธุรกิจขนาดกลางและบริษัทที่ต้องการระบบครบวงจร</CardDescription>
                <div className="mt-4 flex items-baseline text-slate-900 dark:text-white">
                  <span className="text-4xl font-bold tracking-tight">฿990</span>
                  <span className="ml-1 text-xl font-semibold text-slate-500">/เดือน</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pt-4">
                <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> สมาชิกและพนักงานเข้าใช้งานได้ไม่จำกัด
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> สิทธิ์ใช้งาน AI Financial Consultant วิเคราะห์ข้อมูลเชิงลึก
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> เชื่อมต่อกับผู้จัดการบัญชีส่วนตัวผ่านระบบ LINE Bot
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" /> รองรับระบบส่งอีเมลใบแจ้งหนี้อัตโนมัติ (Resend API)
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-6">
                <Button className="w-full" variant="outline" disabled>
                  ติดต่อเจ้าหน้าที่เพื่ออัปเกรด
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: INTEGRATIONS */}
        <TabsContent value="integrations" className="outline-none">
          <Card className="premium-card border-none shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40">
            <form onSubmit={handleIntSubmit(async (data) => {
              if (!currentOrg) return
              try {
                const res = await fetch(`/api/orgs/${currentOrg.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                })
                if (!res.ok) throw new Error('Failed to update integrations')
                const updated = await res.json()
                setCurrentOrg(updated)
                toast.success('บันทึกคีย์ API สำเร็จ', {
                  icon: <Sparkles className="w-4 h-4 text-yellow-500" />
                })
              } catch (error) {
                toast.error('การบันทึกคีย์ API ล้มเหลว')
              }
            })}>
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-indigo-500" />
                  การเชื่อมต่อ API (Integrations)
                </CardTitle>
                <CardDescription>
                  จัดการรหัสลับสำหรับเชื่อมต่อกับระบบภายนอก (ข้อมูลเหล่านี้ถูกเข้ารหัสและเก็บรักษาอย่างปลอดภัย)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                
                {/* OpenAI */}
                <div className="space-y-3 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-indigo-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          OpenAI API Key
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">AI OCR</Badge>
                        </h4>
                        <p className="text-xs text-slate-500">สำหรับระบบสแกนและอ่านใบเสร็จอัตโนมัติ</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Label className="sr-only">OpenAI Key</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="password"
                        placeholder="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx"
                        className="pl-9 bg-slate-50 dark:bg-slate-900 font-mono text-sm"
                        {...registerInt('openaiKey')}
                      />
                    </div>
                  </div>
                </div>

                {/* LINE OA */}
                <div className="space-y-3 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-indigo-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#00B900]/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#00B900]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.12.3.079.765.038 1.08l-.164.992c-.05.303-.24 1.186 1.049.645 1.287-.54 6.916-4.069 9.436-6.967 1.739-1.907 2.548-3.843 2.548-5.95zm-15.429 2.531H5.433c-.28 0-.508-.228-.508-.508V7.521c0-.28.228-.508.508-.508h3.138c.28 0 .508.228.508.508v.678c0 .28-.228.508-.508.508H6.621v1.171h1.951c.28 0 .508.228.508.508v.678c0 .28-.228.508-.508.508h-1.951v1.172h1.951c.28 0 .508.228.508.508v.677c0 .279-.228.508-.508.508zm3.504 0h-1.018c-.28 0-.508-.228-.508-.508V7.521c0-.28.228-.508.508-.508h1.018c.28 0 .508.228.508.508v4.805c0 .28-.228.508-.508.508zm5.727 0h-1.026c-.198 0-.376-.111-.462-.284l-2.073-4.103v3.879c0 .28-.228.508-.508.508h-1.018c-.28 0-.508-.228-.508-.508V7.521c0-.28.228-.508.508-.508h1.026c.198 0 .375.111.462.284l2.074 4.102V7.521c0-.28.228-.508.508-.508h1.018c.28 0 .508.228.508.508v4.805c0 .28-.228.508-.508.508zm-7.604-.508V7.521c0-.28-.228-.508-.508-.508h-1.018c-.28 0-.508.228-.508.508v4.805c0 .28.228.508.508.508h1.018c.28 0 .508-.228.508-.508z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          LINE Channel Access Token
                          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">Notification</Badge>
                        </h4>
                        <p className="text-xs text-slate-500">สำหรับส่งข้อความแจ้งเตือนผ่าน LINE Official Account</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Label className="sr-only">LINE Token</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="password"
                        placeholder="eyJhbGciOiJIUzI1NiJ9..."
                        className="pl-9 bg-slate-50 dark:bg-slate-900 font-mono text-sm"
                        {...registerInt('lineToken')}
                      />
                    </div>
                  </div>
                </div>

              </CardContent>
              <CardFooter className="pt-4 pb-6 px-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> คีย์ทั้งหมดจะถูกเข้ารหัสก่อนจัดเก็บ
                </p>
                <Button type="submit" className="gap-2 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700">
                  <Check className="h-4 w-4" /> บันทึกการเชื่อมต่อ
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        </div>
      </Tabs>

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
