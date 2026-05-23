// API for managing transaction categories
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId')
  const type = searchParams.get('type') // INCOME or EXPENSE

  if (!orgId) {
    return NextResponse.json({ error: 'Org ID is required' }, { status: 400 })
  }

  try {
    // Verify membership
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: session.user.id }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const membership = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: dbUser.id
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const categories = await prisma.category.findMany({
      where: {
        orgId,
        ...(type ? { type: type as any } : {})
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
