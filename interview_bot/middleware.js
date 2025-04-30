import { NextResponse } from 'next/server';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // If accessing root, redirect to questionnaire
  if (path === '/') {
    return NextResponse.redirect(new URL('/questionnaire', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};