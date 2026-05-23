// API for dashboard summary data using real DB queries
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { th } from 'date-fns/locale'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId')
  const monthParam = searchParams.get('month') // Format: YYYY-MM

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

    // Determine target month dates
    const targetDate = monthParam ? new Date(`${monthParam}-01`) : new Date()
    const currentStart = startOfMonth(targetDate)
    const currentEnd = endOfMonth(targetDate)
    const lastMonthStart = startOfMonth(subMonths(currentStart, 1))
    const lastMonthEnd = endOfMonth(subMonths(currentStart, 1))

    // 1. Current Month Summary
    const currentMonthTxs = await prisma.transaction.findMany({
      where: {
        orgId,
        date: { gte: currentStart, lte: currentEnd },
        status: 'COMPLETED'
      }
    })

    const income = currentMonthTxs
      .filter(tx => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
    
    const expense = currentMonthTxs
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
    
    const profit = income - expense
    const margin = income > 0 ? (profit / income) * 100 : 0

    // 2. MoM Growth Calculation
    const lastMonthTxs = await prisma.transaction.findMany({
      where: {
        orgId,
        date: { gte: lastMonthStart, lte: lastMonthEnd },
        status: 'COMPLETED'
      }
    })

    const lastIncome = lastMonthTxs
      .filter(tx => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
    
    const lastExpense = lastMonthTxs
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)

    const incomeMoM = lastIncome > 0 ? ((income - lastIncome) / lastIncome) * 100 : 0
    const expenseMoM = lastExpense > 0 ? ((expense - lastExpense) / lastExpense) * 100 : 0

    // 3. Cash Balance (All time)
    const allTxs = await prisma.transaction.aggregate({
      where: { orgId, status: 'COMPLETED' },
      _sum: { amount: true }
    })
    
    const totalIncome = await prisma.transaction.aggregate({
      where: { orgId, status: 'COMPLETED', type: 'INCOME' },
      _sum: { amount: true }
    })
    
    const totalExpense = await prisma.transaction.aggregate({
      where: { orgId, status: 'COMPLETED', type: 'EXPENSE' },
      _sum: { amount: true }
    })

    const cashBalance = (Number(totalIncome._sum.amount) || 0) - (Number(totalExpense._sum.amount) || 0)

    // 4. VAT Summary
    const outputVat = currentMonthTxs
      .filter(tx => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + Number(tx.vatAmount), 0)
    
    const inputVat = currentMonthTxs
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + Number(tx.vatAmount), 0)
    
    const vatPayable = outputVat - inputVat

    // 5. Trends (Last 6 Months)
    const trends = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(currentStart, i)
      const start = startOfMonth(date)
      const end = endOfMonth(date)

      const txs = await prisma.transaction.findMany({
        where: { orgId, date: { gte: start, lte: end }, status: 'COMPLETED' }
      })

      const inc = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
      const exp = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)

      trends.push({
        month: format(date, 'MMM', { locale: th }),
        income: inc,
        expense: exp,
        profit: inc - exp
      })
    }

    // 6. Expense Breakdown by Category
    const categories = await prisma.category.findMany({
      where: { orgId, type: 'EXPENSE' }
    })

    const expenseBreakdown = await Promise.all(categories.map(async (cat) => {
      const amt = currentMonthTxs
        .filter(tx => tx.categoryId === cat.id && tx.type === 'EXPENSE')
        .reduce((sum, tx) => sum + Number(tx.amount), 0)
      
      // Calculate MoM for this category to show alerts
      const lastAmt = lastMonthTxs
        .filter(tx => tx.categoryId === cat.id && tx.type === 'EXPENSE')
        .reduce((sum, tx) => sum + Number(tx.amount), 0)
      
      const isAlert = lastAmt > 0 && ((amt - lastAmt) / lastAmt) > 0.2

      return {
        category: cat.name,
        amount: amt,
        isAlert
      }
    }))

    // Sort by amount and take top 6
    const sortedBreakdown = expenseBreakdown
      .filter(b => b.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)

    // 7. Top Products (For now, use Top Income Categories)
    const incomeCategories = await prisma.category.findMany({
      where: { orgId, type: 'INCOME' }
    })

    const topProducts = await Promise.all(incomeCategories.map(async (cat, idx) => {
      const revenue = currentMonthTxs
        .filter(tx => tx.categoryId === cat.id && tx.type === 'INCOME')
        .reduce((sum, tx) => sum + Number(tx.amount), 0)
      
      return {
        rank: 0, // Placeholder
        name: cat.name,
        revenue,
        profit: revenue * 0.7, // Simulated profit for now
        margin: 70
      }
    }))

    const sortedProducts = topProducts
      .filter(p => p.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p, i) => ({ ...p, rank: i + 1 }))

    // 8. AI Insights (Simple rule-based)
    const aiInsights = []
    if (profit > 0) {
      aiInsights.push({
        id: '1',
        type: 'positive',
        title: 'กำไรมีการเติบโต',
        content: `เดือนนี้ธุรกิจของคุณมีกำไรสุทธิ ${format(targetDate, 'MMMM', { locale: th })} จำนวน ${profit.toLocaleString()} บาท`,
        createdAt: new Date().toISOString()
      })
    }
    if (expenseMoM > 20) {
      aiInsights.push({
        id: '2',
        type: 'warning',
        title: 'ค่าใช้จ่ายพุ่งสูงขึ้น',
        content: `รายจ่ายในเดือนนี้เพิ่มขึ้นถึง ${expenseMoM.toFixed(1)}% เมื่อเทียบกับเดือนที่แล้ว ควรตรวจสอบหมวดหมู่ที่มีการใช้งานเพิ่มขึ้น`,
        createdAt: new Date().toISOString()
      })
    }
    if (vatPayable > 0) {
      aiInsights.push({
        id: '3',
        type: 'reminder',
        title: 'เตรียมพร้อมจ่าย VAT',
        content: `อย่าลืมเตรียมงบประมาณสำหรับชำระภาษีมูลค่าเพิ่มจำนวน ${vatPayable.toLocaleString()} บาท ภายในวันที่ 15 ของเดือนถัดไป`,
        createdAt: new Date().toISOString()
      })
    }

    return NextResponse.json({
      currentMonth: {
        income,
        expense,
        profit,
        cashBalance,
        incomeMoM,
        expenseMoM,
        margin
      },
      vat: {
        incomeWithVat: income,
        incomeExVat: income - outputVat,
        vatPayable,
        inputVat,
        outputVat
      },
      trends,
      topProducts: sortedProducts,
      expenseBreakdown: sortedBreakdown,
      aiInsights
    })
  } catch (error) {
    console.error('Error calculating dashboard summary:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
