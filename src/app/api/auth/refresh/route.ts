import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateToken, generateRefreshToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify the refresh token
    const payload = await verifyRefreshToken(refreshToken);

    // Generate new tokens
    const newToken = generateToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    return NextResponse.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Invalid or expired refresh token' 
      },
      { status: 401 }
    );
  }
} 