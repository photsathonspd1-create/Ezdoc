// API for managing transactions
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { TransactionType, TxStatus } from '@/types'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId')
  const type = searchParams.get('type') as TransactionType | null
  const status = searchParams.get('status') as TxStatus | null
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

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

    const transactions = await prisma.transaction.findMany({
      where: {
        orgId,
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
        ...(startDate || endDate ? {
          date: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          }
        } : {})
      },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
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
      type,
      amount,
      vatRate = 7,
      description,
      categoryId,
      date,
      paymentMethod,
      status = 'COMPLETED',
      notes,
      projectId,
      documentId
    } = body

    if (!orgId || !type || !amount || !description || !date) {
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
      }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate VAT amounts
    const amountVal = parseFloat(amount)
    const vatRateVal = parseFloat(vatRate.toString())
    
    // Logic: amount is the total amount (inclusive of VAT if applicable)
    // In many Thai businesses, we record the total. 
    // Let's assume the user enters the total amount.
    const amountExVat = amountVal / (1 + (vatRateVal / 100))
    const vatAmount = amountVal - amountExVat

    const transaction = await prisma.transaction.create({
      data: {
        orgId,
        type,
        amount: amountVal,
        vatRate: vatRateVal,
        vatAmount,
        amountExVat,
        description,
        categoryId,
        date: new Date(date),
        paymentMethod,
        status,
        notes,
        projectId,
        documentId,
        createdById: dbUser.id
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
