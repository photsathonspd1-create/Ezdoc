// Supabase middleware session updater
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  if (!url || url.includes('your_supabase_url') || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return 'https://placeholder-project.supabase.co'
  }
  return url
}

const getSupabaseAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  if (!key || key.includes('your_supabase_anon_key')) {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
  }
  return key
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const placeholderCookie = request.cookies.get('sb-placeholder-token')
  let mockUser: any = null
  if (placeholderCookie) {
    try {
      const payload = JSON.parse(decodeURIComponent(placeholderCookie.value))
      mockUser = {
        id: payload.id,
        email: payload.email,
        user_metadata: {
          full_name: payload.name || (payload.email === 'owner@unizin.co.th' ? 'สมชาย นามดี' : 'ผู้ใช้งานทดลอง')
        }
      }
    } catch (e) {
      console.error('Failed to parse placeholder cookie in middleware', e)
    }
  }

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  if (mockUser) {
    const mockSession = {
      user: mockUser,
      access_token: 'placeholder-access-token',
      refresh_token: 'placeholder-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }

    const originalAuth = supabase.auth
    supabase.auth = new Proxy(originalAuth, {
      get(target, prop, receiver) {
        if (prop === 'getSession') {
          return async () => ({
            data: { session: mockSession },
            error: null,
          })
        }
        if (prop === 'getUser') {
          return async () => ({
            data: { user: mockUser },
            error: null,
          })
        }
        return Reflect.get(target, prop, receiver)
      }
    })
  }

  // This refreshes the session if expired
  await supabase.auth.getUser()

  return supabaseResponse
}
