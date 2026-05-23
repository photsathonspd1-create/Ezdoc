// Browser Supabase client helper
import { createBrowserClient } from '@supabase/ssr'

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

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseAnonKey()

export const createClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey)

export const supabase = createClient()

