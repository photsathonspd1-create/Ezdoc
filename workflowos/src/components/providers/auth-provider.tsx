'use client'

import * as React from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSupabaseUser, setLoading, reset } = useAuthStore()

  React.useEffect(() => {
    const syncSession = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session && session.user) {
          setSupabaseUser(session.user)
          const res = await fetch('/api/user/me')
          if (res.ok) {
            const dbUser = await res.json()
            setUser(dbUser)
          }
        } else {
          reset()
        }
      } catch (e) {
        console.error('Error syncing auth session:', e)
        reset()
      } finally {
        setLoading(false)
      }
    }

    syncSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        setSupabaseUser(session.user)
        try {
          const res = await fetch('/api/user/me')
          if (res.ok) {
            const dbUser = await res.json()
            setUser(dbUser)
          }
        } catch (e) {
          console.error('Error fetching me user:', e)
        }
      } else {
        reset()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setSupabaseUser, setLoading, reset])

  return <>{children}</>
}
