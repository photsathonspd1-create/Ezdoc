// Document related TypeScript interfaces
import { z } from 'zod'
import { Project, Contact } from './project'
import { User } from './auth'

export interface DocumentLineItem {
  description: string
  quantity: number
  price: number
  amount: number
}

export interface Document {
  id: string
  orgId: string
  projectId?: string | null
  clientId?: string | null
  type: 'PV' | 'RV' | 'INVOICE' | 'RECEIPT' | 'QUOTATION'
  docNumber: string
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELLED'
  issuedDate: Date
  dueDate?: Date | null
  items: DocumentLineItem[]
  subtotal: number
  vatAmount: number
  total: number
  pdfUrl?: string | null
  notes?: string | null
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface DocumentWithRelations extends Document {
  project?: Project | null
  client?: Contact | null
  createdBy?: User | null
}

export const createDocumentSchema = z.object({
  projectId: z.string().nullable().optional(),
  clientId: z.string().nullable().optional(),
  type: z.enum(['PV', 'RV', 'INVOICE', 'RECEIPT', 'QUOTATION']),
  docNumber: z.string().min(1, 'กรุณาระบุเลขที่เอกสาร'),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED']).default('DRAFT'),
  issuedDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
  dueDate: z.union([z.date(), z.string(), z.null()]).optional().transform((val) => val ? new Date(val) : null),
  items: z.array(z.object({
    description: z.string().min(1, 'ระบุรายการ'),
    quantity: z.number().positive(),
    price: z.number().nonnegative(),
    amount: z.number(),
  })).min(1, 'ต้องมีอย่างน้อย 1 รายการ'),
  subtotal: z.number(),
  vatAmount: z.number(),
  total: z.number(),
  notes: z.string().nullable().optional(),
})

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>
