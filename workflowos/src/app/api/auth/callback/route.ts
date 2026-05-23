import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      const supabaseUser = data.user
      
      // Check if user exists in Prisma
      let dbUser = await prisma.user.findUnique({
        where: { supabaseId: supabaseUser.id }
      })

      let isNewUser = false
      if (!dbUser) {
        isNewUser = true
        // Create user
        dbUser = await prisma.user.create({
          data: {
            supabaseId: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'ผู้ใช้งานใหม่',
            avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
          }
        })

        // Create default organization
        await prisma.organization.create({
          data: {
            name: `บริษัทของ ${dbUser.name}`,
            members: {
              create: {
                userId: dbUser.id,
                role: 'OWNER'
              }
            }
          }
        })
      }

      if (isNewUser) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}
