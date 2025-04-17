import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request) {
  // For server-side redirects we need to check the cookie, not localStorage
  // We'll set the token as a cookie when logging in
  const token = request.cookies.get('authToken')?.value;
  const path = request.nextUrl.pathname;
  
  // Check if user is on auth page (login or register)
  const isAuthPage = path === '/login' || path === '/register';
  
  // Check if user is trying to access protected pages
  const isProtectedPage = path === '/chat' || path === '/';
  
  // If accessing protected page without token, redirect to login
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If accessing auth page with token, redirect to chat
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/register', '/chat'],
};