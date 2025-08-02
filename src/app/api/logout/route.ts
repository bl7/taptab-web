import { NextRequest, NextResponse } from 'next/server';
import { blacklistToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (token) {
      await blacklistToken(token);
    }

    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Failed to logout' },
      { status: 500 }
    );
  }
} 