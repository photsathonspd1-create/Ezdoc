import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const router = useRouter()
  const {
    user,
    supabaseUser,
    isLoading,
    isAuthenticated,
    setUser,
    setSupabaseUser,
    setLoading,
    reset,
  } = useAuthStore()

  const checkIsPlaceholder = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    return !url || url === 'your_supabase_url' || url.includes('placeholder-project')
  }

  async function signIn(email: string, password: string): Promise<{ error?: string }> {
    setLoading(true)
    try {
      if (checkIsPlaceholder()) {
        // Local Sandbox Auth Bypass
        // Simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 800))
        
        // Generate mock supabase ID
        const mockSupabaseId = email === 'owner@unizin.co.th' 
          ? 'demo-supabase-uuid-owner-1234' 
          : 'demo-supabase-uuid-new-' + Math.random().toString(36).substring(7)
          
        // Store a lightweight mock session cookie to satisfy next.js middleware
        document.cookie = `sb-placeholder-token=${encodeURIComponent(JSON.stringify({ email, id: mockSupabaseId }))}; path=/; max-age=86400`
        
        const mockUser = {
          id: mockSupabaseId,
          email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            full_name: email === 'owner@unizin.co.th' ? 'สมชาย นามดี' : 'ผู้ใช้งานทดลอง',
          }
        } as any
        
        setSupabaseUser(mockUser)
        
        // Fetch/create custom Prisma user record
        const res = await fetch('/api/user/me')
        if (res.ok) {
          const dbUser = await res.json()
          setUser(dbUser)
        }
        
        router.push('/dashboard')
        return {}
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Map common errors to Thai
        let errMsg = error.message
        if (error.message.includes('Invalid login credentials')) {
          errMsg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
        } else if (error.message.includes('Email not confirmed')) {
          errMsg = 'กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ'
        }
        return { error: errMsg }
      }

      if (data.user) {
        setSupabaseUser(data.user)
        // Fetch custom Prisma user record
        const res = await fetch('/api/user/me')
        if (res.ok) {
          const dbUser = await res.json()
          setUser(dbUser)
        }
      }
      
      router.push('/dashboard')
      return {}
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
      return { error: errMsg }
    } finally {
      setLoading(false)
    }
  }

  async function signUp(email: string, password: string, name: string): Promise<{ error?: string }> {
    setLoading(true)
    try {
      if (checkIsPlaceholder()) {
        // Local Sandbox Auth Bypass for Sign Up
        await new Promise((resolve) => setTimeout(resolve, 800))
        
        const mockSupabaseId = 'demo-supabase-uuid-new-' + Math.random().toString(36).substring(7)
        document.cookie = `sb-placeholder-token=${encodeURIComponent(JSON.stringify({ email, id: mockSupabaseId, name }))}; path=/; max-age=86400`
        
        const mockUser = {
          id: mockSupabaseId,
          email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            full_name: name,
          }
        } as any
        
        setSupabaseUser(mockUser)
        
        // Fetch /api/user/me to auto-provision user in Prisma
        const res = await fetch('/api/user/me')
        if (res.ok) {
          const dbUser = await res.json()
          setUser(dbUser)
        }
        
        router.push('/onboarding')
        return {}
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลงทะเบียน'
      return { error: errMsg }
    } finally {
      setLoading(false)
    }
  }

  async function signOut(): Promise<void> {
    setLoading(true)
    try {
      // Clear placeholder cookies
      document.cookie = 'sb-placeholder-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      
      if (!checkIsPlaceholder()) {
        await fetch('/api/auth/signout', { method: 'POST' })
      }
      
      reset()
      router.push('/login')
    } catch (e) {
      console.error('Error during sign out:', e)
    } finally {
      setLoading(false)
    }
  }

  async function signInWithLine(): Promise<void> {
    setLoading(true)
    try {
      if (checkIsPlaceholder()) {
        // LINE login simulation in local sandbox
        await signIn('owner@unizin.co.th', '123456')
        return
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'keycloak',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        console.error('LINE Sign in error:', error.message)
      }
    } catch (e) {
      console.error('Error signing in with LINE:', e)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    supabaseUser,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    signInWithLine,
  }
}
