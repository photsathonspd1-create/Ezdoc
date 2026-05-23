import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: session.user.id }
    })

    if (!dbUser) {
      return NextResponse.json([], { status: 200 })
    }

    const memberships = await prisma.orgMember.findMany({
      where: { userId: dbUser.id },
      include: { org: true }
    })

    const orgs = memberships.map(m => m.org)
    return NextResponse.json(orgs)
  } catch (error) {
    console.error('Error in GET /api/orgs:', error)
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, taxId, address, phone, email, website } = body

    if (!name) {
      return NextResponse.json({ error: 'ชื่อบริษัทเป็นข้อมูลที่จำเป็น' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: session.user.id }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in system' }, { status: 404 })
    }

    const org = await prisma.organization.create({
      data: {
        name,
        taxId: taxId || null,
        address: address || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        members: {
          create: {
            userId: dbUser.id,
            role: 'OWNER'
          }
        }
      }
    })

    return NextResponse.json(org, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/orgs:', error)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
}
