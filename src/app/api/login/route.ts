import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';
import { generateOTP, storeOTP, verifyOTP, generateToken } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, otp } = body;

    if (action === 'requestOTP') {
      // Request OTP
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user || !user.isActive) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const otpCode = generateOTP();
      await storeOTP(email, otpCode);
      await sendOTPEmail(email, otpCode);

      return NextResponse.json({ message: 'OTP sent successfully' });
    }

    if (action === 'verifyOTP') {
      // Verify OTP and login
      const isValid = await verifyOTP(email, otp);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid OTP' },
          { status: 400 }
        );
      }

      const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = userResult.rows[0];

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const tenantResult = await pool.query('SELECT * FROM tenants WHERE id = $1', [user.tenantId]);
      const tenant = tenantResult.rows[0];

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      };

      const token = generateToken(payload);

      const response = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            logo: tenant.logo,
            primaryColor: tenant.primaryColor,
            secondaryColor: tenant.secondaryColor,
          },
        },
        token,
      };

      // Console log the token and entire response when logged in
      console.log('=== LOGIN SUCCESS ===');
      console.log('Token:', token);
      console.log('Full Response:', JSON.stringify(response, null, 2));
      console.log('=====================');

      return NextResponse.json(response);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 