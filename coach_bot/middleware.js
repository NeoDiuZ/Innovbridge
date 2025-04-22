import { NextResponse } from 'next/server';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Redirect root to chat
  if (path === '/') {
    return NextResponse.redirect(new URL('/chat', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};