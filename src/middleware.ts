import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Protected routes
  const protectedPaths = ['/', '/lists', '/search'];
  
  // Check if current path is a protected route
  // Note: /profile/[username] might need to be public or protected depending on design, 
  // but AuthGuard historically allowed public profile access, so we won't strictly block it here.
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname === path || (path !== '/' && request.nextUrl.pathname.startsWith(`${path}/`))
  );

  // If user tries to access a protected route without a token, redirect to login
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure the middleware to only run on relevant paths to save resources
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - register (register page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|.*\\.svg|.*\\.png).*)',
  ],
};
