import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { OrgRole } from '@prisma/client'

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

    const requesterMembership = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: dbUser.id
        }
      }
    })

    if (!requesterMembership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const members = await prisma.orgMember.findMany({
      where: { orgId },
      include: {
        user: true
      }
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}

export async function POST(
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

    const requesterMembership = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: dbUser.id
        }
      }
    })

    if (!requesterMembership || (requesterMembership.role !== 'OWNER' && requesterMembership.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: คุณไม่มีสิทธิ์เชิญสมาชิกเข้าร่วมบริษัทนี้' }, { status: 403 })
    }

    const body = await request.json()
    const { email, role } = body

    if (!email) {
      return NextResponse.json({ error: 'กรุณาระบุอีเมล' }, { status: 400 })
    }

    if (!role || !['OWNER', 'ADMIN', 'MEMBER'].includes(role)) {
      return NextResponse.json({ error: 'ระบุสิทธิ์ไม่ถูกต้อง' }, { status: 400 })
    }

    const invitee = await prisma.user.findUnique({
      where: { email }
    })

    if (!invitee) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้ที่มีอีเมลนี้ในระบบ กรุณาแจ้งให้สมัครสมาชิกก่อน' }, { status: 404 })
    }

    const existingMember = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: invitee.id
        }
      }
    })

    if (existingMember) {
      return NextResponse.json({ error: 'ผู้ใช้นี้เป็นสมาชิกของบริษัทอยู่แล้ว' }, { status: 400 })
    }

    const newMember = await prisma.orgMember.create({
      data: {
        orgId,
        userId: invitee.id,
        role: role as OrgRole,
      },
      include: {
        user: true
      }
    })

    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    console.error('Error inviting member:', error)
    return NextResponse.json({ error: 'Failed to invite member' }, { status: 500 })
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

    const requesterMembership = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: dbUser.id
        }
      }
    })

    if (!requesterMembership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'กรุณาระบุสมาชิกที่จะลบ' }, { status: 400 })
    }

    const targetMembership = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: memberId
        }
      }
    })

    if (!targetMembership) {
      return NextResponse.json({ error: 'ไม่พบสมาชิกในองค์กร' }, { status: 404 })
    }

    const isSelfRemove = memberId === dbUser.id
    const isOwner = requesterMembership.role === 'OWNER'
    const isAdmin = requesterMembership.role === 'ADMIN'

    let allowed = false

    if (isSelfRemove) {
      if (requesterMembership.role === 'OWNER') {
        return NextResponse.json({ error: 'เจ้าของบริษัทไม่สามารถออกจากบริษัทได้ กรุณาโอนย้ายสิทธิ์หรือลบบริษัท' }, { status: 400 })
      }
      allowed = true
    } else if (isOwner) {
      allowed = true
    } else if (isAdmin) {
      if (targetMembership.role === 'MEMBER') {
        allowed = true
      }
    }

    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden: คุณไม่มีสิทธิ์ลบสมาชิกรายนี้' }, { status: 403 })
    }

    await prisma.orgMember.delete({
      where: {
        orgId_userId: {
          orgId,
          userId: memberId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}
