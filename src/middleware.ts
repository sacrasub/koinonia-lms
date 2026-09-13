import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

/**
 * Middleware de Segurança, Proteção de Rotas e Rate Limiting (Next.js 15)
 * Koinonia LMS - Blindagem contra scripts automatizados e proteção de rotas.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // ==========================================================================
  // 1. RATE LIMITING EM ENDPOINTS DE AUTENTICAÇÃO E REGISTRO (/api/auth/*)
  // Limite estrito: Máximo de 5 requisições a cada 10 minutos (600s) por IP
  // ==========================================================================
  if (pathname.startsWith('/api/auth/')) {
    const rateLimit = checkRateLimit(`auth_${ip}`, 5, 600);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too Many Requests. Muitas requisições de autenticação detectadas para o seu endereço de IP.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: rateLimit.resetSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetSeconds),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetSeconds),
          },
        }
      );
    }
  }

  // Rate Limiting para Endpoints Administrativos de Segurança (/api/admin/security/*)
  if (pathname.startsWith('/api/admin/security/')) {
    const adminRateLimit = checkRateLimit(`admin_sec_${ip}`, 15, 60);
    if (!adminRateLimit.success) {
      return NextResponse.json(
        { error: 'Too Many Requests. Limite de requisições administrativas excedido.', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429, headers: { 'Retry-After': String(adminRateLimit.resetSeconds) } }
      );
    }
  }

  // ==========================================================================
  // 2. PROTEÇÃO DE ROTAS INTERNAS (/dashboard/*)
  // ==========================================================================
  const supabaseAuthCookie =
    request.cookies.get('sb-access-token') ||
    request.cookies.get('supabase-auth-token') ||
    request.cookies.get('sb:token');

  if (pathname.startsWith('/dashboard') && !supabaseAuthCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  // Headers de Segurança
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  return response;
}

export const config = {
  matcher: [
    '/api/auth/:path*',
    '/api/admin/security/:path*',
    '/dashboard/:path*',
  ],
};
