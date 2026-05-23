import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const placeholderCookie = cookieStore.get('sb-placeholder-token')
  let supabaseUser: { id: string; email: string; user_metadata?: { full_name?: string } } | null = null

  if (placeholderCookie) {
    try {
      const payload = JSON.parse(decodeURIComponent(placeholderCookie.value))
      supabaseUser = {
        id: payload.id,
        email: payload.email,
        user_metadata: {
          full_name: payload.name || (payload.email === 'owner@unizin.co.th' ? 'สมชาย นามดี' : 'ผู้ใช้งานทดลอง')
        }
      }
    } catch (e) {
      console.error('Failed to parse placeholder cookie', e)
    }
  }

  if (!supabaseUser) {
    const supabase = createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // session.user email is optional in Supabase, ensure it exists or default to empty string
    supabaseUser = {
        id: session.user.id,
        email: session.user.email || '',
        user_metadata: {
            full_name: session.user.user_metadata?.full_name
        }
    }
  }

  if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let dbUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id }
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || 'ผู้ใช้งานใหม่',
        avatarUrl: null,
      }
    })

    // Find if user already belongs to an org, if not create one
    const existingMember = await prisma.orgMember.findFirst({
      where: { userId: dbUser.id }
    })

    if (!existingMember) {
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
  }

  return NextResponse.json(dbUser)
}
