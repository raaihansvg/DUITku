import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySession } from '@/lib/session-token'

const protectedRoutes = ['/dashboard']
const authRoutes = ['/auth/login', '/auth/register']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(SESSION_COOKIE)?.value
  const session = await verifySession(token)

  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !session) {
    const res = NextResponse.redirect(new URL('/auth/login', req.url))
    // Cookie palsu/kedaluwarsa dihapus supaya tidak terjadi redirect berulang
    if (token) res.cookies.delete(SESSION_COOKIE)
    return res
  }

  // Kalau sudah login tapi buka halaman auth, langsung ke dashboard
  if (authRoutes.includes(pathname) && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  const res = NextResponse.next()
  if (token && !session) res.cookies.delete(SESSION_COOKIE)
  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
