// Transaction related TypeScript interfaces
import { z } from 'zod'

export interface Category {
  id: string
  orgId: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color: string
  icon: string
  isDefault: boolean
  createdAt: Date
}

export interface Transaction {
  id: string
  orgId: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  vatRate: number
  vatAmount: number
  amountExVat: number
  description: string
  categoryId?: string | null
  date: Date
  paymentMethod?: string | null
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  receiptUrl?: string | null
  documentId?: string | null
  projectId?: string | null
  createdById: string
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface TransactionWithCategory extends Transaction {
  category?: Category | null
}

export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('จำนวนเงินต้องมากกว่า 0'),
  vatRate: z.number().default(7),
  description: z.string().min(1, 'กรุณาระบุรายละเอียด'),
  categoryId: z.string().nullable().optional(),
  date: z.union([z.date(), z.string().transform((val) => new Date(val))]),
  paymentMethod: z.string().nullable().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).default('COMPLETED'),
  projectId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>

export const updateTransactionSchema = createTransactionSchema.partial()
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
