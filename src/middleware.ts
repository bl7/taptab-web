import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle incorrect auth routes
  if (pathname === '/auth/login') {
    console.log('🔄 Redirecting /auth/login to /login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/auth/signup') {
    console.log('🔄 Redirecting /auth/signup to /signup');
    return NextResponse.redirect(new URL('/signup', request.url));
  }

  // Handle incorrect auth routes with trailing slash
  if (pathname === '/auth/login/') {
    console.log('🔄 Redirecting /auth/login/ to /login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/auth/signup/') {
    console.log('🔄 Redirecting /auth/signup/ to /signup');
    return NextResponse.redirect(new URL('/signup', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth/login',
    '/auth/signup',
    '/auth/login/',
    '/auth/signup/',
  ],
}; 