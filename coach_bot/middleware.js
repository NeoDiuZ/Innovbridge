import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check for auth cookie or token in the request
  const authCookie = request.cookies.get('user_authenticated');
  const url = request.nextUrl.clone();
  
  // Define protected routes that require authentication
  const isProtectedRoute = 
    url.pathname.startsWith('/chat');
  
  // If trying to access a protected route without authentication
  if (isProtectedRoute && !authCookie?.value) {
    // Redirect to login
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  
  // If accessing login/register while already authenticated
  if ((url.pathname === '/' || url.pathname === '/login' || url.pathname === '/register') 
      && authCookie?.value === 'true') {
    // Redirect to chat
    url.pathname = '/chat';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};