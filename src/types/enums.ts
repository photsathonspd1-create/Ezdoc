export type PlanTier = 'FREE' | 'PRO' | 'BUSINESS'
export const PlanTier = {
  FREE: 'FREE',
  PRO: 'PRO',
  BUSINESS: 'BUSINESS'
} as const

export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER'
export const OrgRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER'
} as const

export type ContactType = 'PERSON' | 'COMPANY'
export const ContactType = {
  PERSON: 'PERSON',
  COMPANY: 'COMPANY'
} as const

export type TransactionType = 'INCOME' | 'EXPENSE'
export const TransactionType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE'
} as const

export type TxStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'
export const TxStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const

export type ProjectStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
export const ProjectStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const

export type PayStatus = 'UNPAID' | 'PARTIAL' | 'PAID'
export const PayStatus = {
  UNPAID: 'UNPAID',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID'
} as const

export type DocumentType = 'PV' | 'RV' | 'INVOICE' | 'RECEIPT' | 'QUOTATION'
export const DocumentType = {
  PV: 'PV',
  RV: 'RV',
  INVOICE: 'INVOICE',
  RECEIPT: 'RECEIPT',
  QUOTATION: 'QUOTATION'
} as const

export type DocStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELLED'
export const DocStatus = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED'
} as const

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
export const TaskStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED'
} as const

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
} as const
