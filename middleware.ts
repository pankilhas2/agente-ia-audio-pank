import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value

  const urlProtegida = request.nextUrl.pathname.startsWith('/vip') || request.nextUrl.pathname.startsWith('/admin')

  if (urlProtegida && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
