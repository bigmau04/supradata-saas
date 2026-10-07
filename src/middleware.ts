import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const path = request.nextUrl.pathname;

  // Si trata de entrar a cualquier parte del dashboard y no tiene cookie de sesión
  if (!session && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let role = null;
  if (session) {
    const payload = await decrypt(session);
    role = payload?.role;
  }

  // Restricciones para Recepcionistas
  if (role === 'receptionist') {
    if (path === '/dashboard' || path.startsWith('/dashboard/finance') || path.startsWith('/dashboard/coaches') || path.startsWith('/dashboard/team')) {
      return NextResponse.redirect(new URL('/dashboard/reception', request.url));
    }
  }

  // Si ya está logueado y trata de ir a la página de login o index, mandarlo al dashboard correcto
  if (session && (path === '/login' || path === '/' || path === '/register')) {
    if (role === 'receptionist') {
      return NextResponse.redirect(new URL('/dashboard/reception', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|pass).*)'],
};
