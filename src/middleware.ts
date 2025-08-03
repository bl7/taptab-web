import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies or headers (for API requests)
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if current path is an auth route (login/signup)
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
  
  // Check if current path is a dashboard route
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Only redirect from auth pages if we have a token in cookies/headers
  // (This handles cases where tokens are stored in cookies)
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For dashboard routes, let the client-side handle authentication
  // since middleware can't access localStorage
  if (isDashboardRoute) {
    // Allow the request to proceed - client-side will handle redirect if needed
    return NextResponse.next();
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 