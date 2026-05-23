// Project and Client related TypeScript interfaces
import { z } from 'zod'

export interface Contact {
  id: string
  orgId: string
  name: string
  type: 'PERSON' | 'COMPANY'
  taxId?: string | null
  address?: string | null
  email?: string | null
  phone?: string | null
  lineUserId?: string | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  orgId: string
  name: string
  clientId?: string | null
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  budget?: number | null
  paidAmount: number
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID'
  startDate?: Date | null
  dueDate?: Date | null
  tags: string[]
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ProjectWithClient extends Project {
  client?: Contact | null
}

export const createProjectSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อโปรเจกต์'),
  clientId: z.string().nullable().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  budget: z.number().nonnegative().nullable().optional(),
  paidAmount: z.number().nonnegative().default(0),
  paymentStatus: z.enum(['UNPAID', 'PARTIAL', 'PAID']).default('UNPAID'),
  startDate: z.union([z.date(), z.string(), z.null()]).optional().transform((val) => val ? new Date(val) : null),
  dueDate: z.union([z.date(), z.string(), z.null()]).optional().transform((val) => val ? new Date(val) : null),
  tags: z.array(z.string()).default([]),
  notes: z.string().nullable().optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const updateProjectSchema = createProjectSchema.partial()
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
