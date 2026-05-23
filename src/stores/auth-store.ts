// Zustand auth store
import { create } from 'zustand'
import { User } from '@/types/auth'
import { User as SupabaseUser } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  supabaseUser: SupabaseUser | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setSupabaseUser: (user: SupabaseUser | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  supabaseUser: null,
  isLoading: false,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setSupabaseUser: (supabaseUser) => set({ supabaseUser }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, supabaseUser: null, isAuthenticated: false, isLoading: false }),
}))

