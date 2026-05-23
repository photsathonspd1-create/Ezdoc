import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  
  // Sign out from Supabase
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL('/login', request.url), {
    status: 303, // See Other: forces GET request on redirect
  })
}
