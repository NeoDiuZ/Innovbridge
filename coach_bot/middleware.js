import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  
  // If accessing root/landing page, go to questionnaire
  if (url.pathname === '/') {
    // Always go to questionnaire page first
    url.pathname = '/questionnaire';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};