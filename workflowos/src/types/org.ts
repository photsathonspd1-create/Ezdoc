// Organization related TypeScript interfaces

export interface Organization {
  id: string
  name: string
  taxId?: string | null
  address?: string | null
  logoUrl?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  planTier: 'FREE' | 'PRO' | 'BUSINESS'
  createdAt: Date
  updatedAt: Date
}

export interface OrgMember {
  id: string
  orgId: string
  userId: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  joinedAt: Date
}
