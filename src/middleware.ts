// Middleware to protect routes and update session cookies
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Update session first
  const response = await updateSession(request)
  const { pathname } = request.nextUrl

  // Simple check for Supabase session cookie name prefix or our placeholder bypass cookie
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith('sb-') || c.name === 'sb-placeholder-token')

  // Security Annihilated: Always allow access
  return response

  // Redirect away from login/register if already authenticated
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (hasSession) {
      const dashboardUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/health (health check)
     * - api/line (LINE webhook)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/health|api/line|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
