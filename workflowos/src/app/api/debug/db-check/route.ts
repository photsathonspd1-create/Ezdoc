import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const orgs = await prisma.organization.findMany({
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    })
    return NextResponse.json(orgs)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
