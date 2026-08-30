import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy / Middleware de Proteção de Rotas (Next.js 16)
 * Garante que o acesso às rotas do /dashboard exija autenticação via Google OAuth (Supabase Auth).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseAuthCookie = request.cookies.get('sb-access-token') || request.cookies.get('supabase-auth-token');

  if (pathname.startsWith('/dashboard') && !supabaseAuthCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
