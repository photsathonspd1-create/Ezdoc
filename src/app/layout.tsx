// Root layout component
import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import '@/app/globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ToastProvider } from '@/components/providers/toast-provider'
import { AuthProvider } from '@/components/providers/auth-provider'

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sarabun',
})

export const metadata: Metadata = {
  title: 'WorkflowOS - ระบบจัดการเอกสารและการเงินสำหรับ SMEs',
  description: 'ระบบจัดการเอกสาร รายรับ-รายจ่าย และงานโปรเจกต์สำหรับ SMEs ไทย',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${sarabun.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
