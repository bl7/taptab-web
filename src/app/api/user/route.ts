import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const tenantResult = await pool.query('SELECT * FROM tenants WHERE id = $1', [user.tenantId]);
    const tenant = tenantResult.rows[0];

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
} 