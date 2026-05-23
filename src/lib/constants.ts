// App-wide constants

export const APP_NAME = 'WorkflowOS'

export interface NavItem {
  href: string
  labelTh: string     // Full label for header/breadcrumb
  labelShort: string  // Short label for sidebar nav items
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',    labelTh: 'ภาพรวม',     labelShort: 'ภาพรวม',    icon: 'LayoutDashboard' },
  { href: '/transactions', labelTh: 'รายการเงิน',  labelShort: 'รายการเงิน', icon: 'Receipt' },
  { href: '/projects',     labelTh: 'งาน/โปรเจกต์', labelShort: 'โปรเจกต์',  icon: 'Briefcase' },
  { href: '/documents',    labelTh: 'เอกสาร',      labelShort: 'เอกสาร',    icon: 'FileText' },
  { href: '/reports',      labelTh: 'รายงาน',      labelShort: 'รายงาน',    icon: 'BarChart3' },
  { href: '/settings',     labelTh: 'ตั้งค่า',     labelShort: 'ตั้งค่า',   icon: 'Settings' },
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
