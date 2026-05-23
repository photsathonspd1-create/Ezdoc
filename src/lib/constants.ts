// App-wide constants

export const APP_NAME = 'WorkflowOS'

export interface NavItem {
  href: string
  labelTh: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    labelTh: 'ภาพรวม (Dashboard)',
    icon: 'LayoutDashboard',
  },
  {
    href: '/transactions',
    labelTh: 'รายการเงิน (Transactions)',
    icon: 'Receipt',
  },
  {
    href: '/projects',
    labelTh: 'งาน/โปรเจกต์ (Projects)',
    icon: 'Briefcase',
  },
  {
    href: '/documents',
    labelTh: 'เอกสาร (Documents)',
    icon: 'FileText',
  },
  {
    href: '/reports',
    labelTh: 'รายงาน (Reports)',
    icon: 'BarChart3',
  },
  {
    href: '/settings',
    labelTh: 'ตั้งค่า (Settings)',
    icon: 'Settings',
  },
]

export const TRANSACTION_TYPES = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const

export const DOCUMENT_TYPES = {
  PV: 'PV',
  RV: 'RV',
  INVOICE: 'INVOICE',
  RECEIPT: 'RECEIPT',
} as const

export const PROJECT_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
} as const
