// Server-side Supabase client helper
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

export function createClient() {
  const cookieStore = cookies()
  const placeholderCookie = cookieStore.get('sb-placeholder-token')
  
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
      console.error('Failed to parse placeholder cookie in createClient', e)
    }
  }

  const client = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Can be ignored if called from a Server Component
          }
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

    // Proxy the auth object methods to return our mocked data
    const originalAuth = client.auth
    client.auth = new Proxy(originalAuth, {
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

  return client
}

