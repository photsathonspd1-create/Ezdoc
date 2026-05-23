'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const registerSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล'),
  email: z.string().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'),
  confirmPassword: z.string().min(1, 'กรุณากรอกยืนยันรหัสผ่าน'),
  acceptTerms: z.boolean().refine((val) => val === true, 'คุณต้องยอมรับข้อกำหนดการใช้งาน'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { signUp, isLoading } = useAuth()
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [registeredEmail, setRegisteredEmail] = React.useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    const res = await signUp(data.email, data.password, data.name)
    if (res.error) {
      toast.error(res.error)
    } else {
      setRegisteredEmail(data.email)
      setIsSuccess(true)
      toast.success('สมัครสมาชิกสำเร็จ')
    }
  }

  if (isSuccess) {
    return (
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <MailCheck className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">สมัครสมาชิกสำเร็จ!</CardTitle>
          <CardDescription className="text-muted-foreground text-sm mt-2">
            กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            เราได้ส่งลิงก์ยืนยันไปที่ <strong className="text-foreground">{registeredEmail}</strong> แล้ว กรุณาคลิกลิงก์ในอีเมลเพื่อเปิดใช้งานบัญชีของคุณก่อนเข้าสู่ระบบ
          </p>
          <Link 
            href="/login" 
            className={cn(buttonVariants({ variant: "default" }), "w-full mt-4 text-center block")}
          >
            ไปที่หน้าเข้าสู่ระบบ
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="text-center pb-6">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-md">
            W
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">สมัครใช้งาน WorkflowOS</CardTitle>
        <CardDescription className="text-muted-foreground text-sm mt-1">
          เริ่มต้นจัดการบัญชี รายรับ-รายจ่าย และเอกสารของคุณ
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
            <Input
              id="name"
              placeholder="สมชาย นามดี"
              {...register('name')}
              disabled={isLoading}
              className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              disabled={isLoading}
              className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                {...register('password')}
                disabled={isLoading}
                className={errors.password ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                {...register('confirmPassword')}
                disabled={isLoading}
                className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-start space-x-2 pt-2">
            <input
              type="checkbox"
              id="acceptTerms"
              {...register('acceptTerms')}
              disabled={isLoading}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="acceptTerms"
                className="text-xs text-muted-foreground font-normal cursor-pointer select-none"
              >
                ยอมรับ{' '}
                <Link href="/terms" className="text-primary hover:underline font-medium">
                  ข้อกำหนดการใช้งาน
                </Link>{' '}
                และ{' '}
                <Link href="/privacy" className="text-primary hover:underline font-medium">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </label>
              {errors.acceptTerms && (
                <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full mt-4" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังสมัครสมาชิก...
              </>
            ) : (
              'สมัครสมาชิก'
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-4">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            เข้าสู่ระบบ
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
