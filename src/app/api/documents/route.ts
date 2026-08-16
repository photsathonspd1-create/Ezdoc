// API for managing documents
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { DocumentType, DocStatus } from '@/types'
import { sendLineNotification } from '@/lib/line-notify'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId')
  const type = searchParams.get('type') as DocumentType | null
  const status = searchParams.get('status') as DocStatus | null

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

    const documents = await prisma.document.findMany({
      where: {
        orgId,
        ...(type ? { type } : {}),
        ...(status ? { status } : {})
      },
      include: {
        client: true,
        project: true,
        createdBy: {
          select: { name: true }
        }
      },
      orderBy: {
        issuedDate: 'desc'
      }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
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
    const {
      orgId,
      projectId,
      clientId,
      type,
      docNumber,
      status = 'DRAFT',
      issuedDate,
      dueDate,
      items,
      subtotal,
      vatAmount,
      total,
      notes
    } = body

    if (!orgId || !type || !docNumber || !issuedDate || !items) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

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
      },
      include: {
        org: {
          select: { lineToken: true }
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check for duplicate doc number in same org
    const existingDoc = await prisma.document.findUnique({
      where: {
        orgId_docNumber: {
          orgId,
          docNumber
        }
      }
    })

    if (existingDoc) {
      return NextResponse.json({ error: 'เลขที่เอกสารนี้มีอยู่แล้วในระบบ' }, { status: 400 })
    }

    const document = await prisma.document.create({
      data: {
        orgId,
        projectId,
        clientId,
        type,
        docNumber,
        status,
        issuedDate: new Date(issuedDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        items,
        subtotal: parseFloat(subtotal),
        vatAmount: parseFloat(vatAmount),
        total: parseFloat(total),
        notes,
        createdById: dbUser!.id
      }
    })

    // Fire LINE Notification in background (don't block the response)
    const typeLabel = type === 'INVOICE' ? 'ใบแจ้งหนี้' : type === 'QUOTATION' ? 'ใบเสนอราคา' : type
    const customLineToken = membership.org?.lineToken || undefined
    
    sendLineNotification(
      dbUser.lineUserId, // Or null to send to ADMIN group
      `📄 มีเอกสารใหม่ถูกสร้างขึ้น!\nประเภท: ${typeLabel}\nเลขที่: ${docNumber}\nยอดรวม: ฿${parseFloat(total).toLocaleString()}\nผู้สร้าง: ${dbUser.name}`,
      customLineToken
    )

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
