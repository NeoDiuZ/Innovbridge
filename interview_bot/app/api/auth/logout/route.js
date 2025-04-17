import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the auth cookie
    cookies().delete('authToken');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
}