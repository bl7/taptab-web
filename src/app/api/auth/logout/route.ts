import { NextRequest, NextResponse } from 'next/server';
import { blacklistToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, refreshToken } = body;

    // Blacklist the access token if provided
    if (token) {
      await blacklistToken(token, 3600); // Blacklist for 1 hour
    }

    // Blacklist the refresh token if provided
    if (refreshToken) {
      await blacklistToken(refreshToken, 7 * 24 * 3600); // Blacklist for 7 days
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error during logout' 
      },
      { status: 500 }
    );
  }
} 