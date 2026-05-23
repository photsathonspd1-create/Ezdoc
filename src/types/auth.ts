// Auth related TypeScript interfaces

export interface User {
  id: string
  supabaseId: string
  email: string
  name: string
  avatarUrl?: string | null
  lineUserId?: string | null
  phone?: string | null
  createdAt: Date
  updatedAt: Date
}
