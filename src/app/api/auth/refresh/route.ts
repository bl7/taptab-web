import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateToken, generateRefreshToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';

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

    // Check if the refresh token was a "remember me" token by checking its expiration
    const decoded = jwt.decode(refreshToken) as { iat: number; exp: number } | null;
    if (!decoded) {
      throw new Error('Invalid refresh token');
    }
    
    const tokenDuration = decoded.exp - decoded.iat;
    
    // If refresh token duration is more than 30 days, it was a remember me token
    const rememberMe = tokenDuration > 30 * 24 * 3600; // 30 days in seconds

    // Generate new tokens with the same remember me setting
    const newToken = generateToken(payload, rememberMe);
    const newRefreshToken = generateRefreshToken(payload, rememberMe);

    return NextResponse.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
      rememberMe,
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