// API for single transaction operations
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        createdBy: true
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Verify membership
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: session.user.id }
    })

    const membership = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId: transaction.orgId,
          userId: dbUser!.id
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  try {
    const body = await request.json()
    
    // First, find the transaction to check org membership
    const existingTx = await prisma.transaction.findUnique({
      where: { id }
    })

    if (!existingTx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Verify membership
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: session.user.id }
    })

    const membership = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId: existingTx.orgId,
          userId: dbUser!.id
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = { ...body }
    delete updateData.id
    delete updateData.orgId
    delete updateData.createdById

    if (updateData.date) {
      updateData.date = new Date(updateData.date)
    }

    // Recalculate VAT if amount or vatRate changed
    if (updateData.amount !== undefined || updateData.vatRate !== undefined) {
      const amountVal = parseFloat(updateData.amount !== undefined ? updateData.amount : existingTx.amount.toString())
      const vatRateVal = parseFloat(updateData.vatRate !== undefined ? updateData.vatRate : existingTx.vatRate.toString())
      
      const amountExVat = amountVal / (1 + (vatRateVal / 100))
      const vatAmount = amountVal - amountExVat
      
      updateData.amount = amountVal
      updateData.vatRate = vatRateVal
      updateData.amountExVat = amountExVat
      updateData.vatAmount = vatAmount
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  try {
    // First, find the transaction to check org membership
    const existingTx = await prisma.transaction.findUnique({
      where: { id }
    })

    if (!existingTx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Verify membership
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: session.user.id }
    })

    const membership = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId: existingTx.orgId,
          userId: dbUser!.id
        }
      }
    })

    if (!membership || membership.role === 'MEMBER') {
      // Only OWNER or ADMIN can delete transactions
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.transaction.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
