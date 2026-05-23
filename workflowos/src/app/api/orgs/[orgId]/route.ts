import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orgId } = params

  try {
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

    const org = await prisma.organization.findUnique({
      where: { id: orgId }
    })

    return NextResponse.json(org)
  } catch (error) {
    console.error('Error fetching org:', error)
    return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  console.log('GOD: PATCH /api/orgs/' + params.orgId + ' called')
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orgId } = params

  try {
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

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: คุณไม่มีสิทธิ์แก้ไขข้อมูลบริษัทนี้' }, { status: 403 })
    }

    const body = await request.json()
    console.log('GOD: PATCH body:', body)
    const { name, taxId, address, phone, email, website, logoUrl, openaiKey, lineToken } = body

    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: {
        name: name !== undefined ? name : undefined,
        taxId: taxId !== undefined ? taxId : undefined,
        address: address !== undefined ? address : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        website: website !== undefined ? website : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        openaiKey: openaiKey !== undefined ? openaiKey : undefined,
        lineToken: lineToken !== undefined ? lineToken : undefined,
      }
    })

    return NextResponse.json(updatedOrg)
  } catch (error) {
    console.error('Error updating org:', error)
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orgId } = params

  try {
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

    if (!membership || membership.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden: เฉพาะเจ้าขององค์กรเท่านั้นที่สามารถลบองค์กรได้' }, { status: 403 })
    }

    await prisma.organization.delete({
      where: { id: orgId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting org:', error)
    return NextResponse.json({ error: 'Failed to delete organization' }, { status: 500 })
  }
}
