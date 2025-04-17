import { NextResponse } from 'next/server';
import { registerUser } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { username, email, password, phoneNumber } = await request.json();

    // Validate input
    if (!username || !email || !password || !phoneNumber) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Register user
    const result = await registerUser({ username, email, password, phoneNumber });
    
    // Set cookie for server-side auth checking
    cookies().set({
      name: 'authToken',
      value: result.token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}