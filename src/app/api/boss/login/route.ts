import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';
import { verifyPassword, generateToken, generateRefreshToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user with SUPER_ADMIN role
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND role = $2 AND "isActive" = true',
      [email, 'SUPER_ADMIN']
    );
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { message: 'Password not set for this user' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get tenant info (super admin might not have a specific tenant)
    const tenantResult = await pool.query('SELECT * FROM tenants WHERE id = $1', [user.tenantId]);
    const tenant = tenantResult.rows[0];

    // Generate tokens with remember me option
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const token = generateToken(payload, rememberMe);
    const refreshToken = generateRefreshToken(payload, rememberMe);

    return NextResponse.json({
      message: 'Login successful',
      token,
      refreshToken,
      rememberMe,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenant: tenant ? {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        } : null,
      },
    });
  } catch (error) {
    console.error('Boss login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 