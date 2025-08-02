import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';
import { verifyToken, hashPassword, JWTPayload } from '@/lib/auth';

// Simple in-memory cache for user data (in production, use Redis)
const userCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// GET - List users (with filtering by tenant)
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded: JWTPayload = await verifyToken(token);
    
    // Check cache first
    const cacheKey = `users_${decoded.role}_${decoded.tenantId}`;
    const cached = userCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }
    
    // Super admin can see all users, others only see their tenant's users
    let query = `
      SELECT u.*, t.name as tenant_name 
      FROM users u 
      LEFT JOIN tenants t ON u."tenantId" = t.id
    `;
    const params: string[] = [];
    
    if (decoded.role === 'SUPER_ADMIN') {
      query += ' ORDER BY u."createdAt" DESC';
    } else {
      query += ' WHERE u."tenantId" = $1 ORDER BY u."createdAt" DESC';
      params.push(decoded.tenantId);
    }

    const result = await pool.query(query, params);
    
    const responseData = {
      users: result.rows.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        tenantId: user.tenantId,
        tenantName: user.tenant_name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }))
    };

    // Cache the result
    userCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded: JWTPayload = await verifyToken(token);
    const body = await request.json();
    const { email, firstName, lastName, role, password, tenantId } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check permissions
    if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'TENANT_ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Determine tenant ID
    const userTenantId = decoded.role === 'SUPER_ADMIN' ? tenantId : decoded.tenantId;
    
    if (!userTenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows[0]) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    // Create user
    const result = await pool.query(
      `INSERT INTO users (id, email, password, "firstName", "lastName", role, "tenantId", "isActive", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW())
       RETURNING *`,
      [email, hashedPassword, firstName, lastName, role, userTenantId]
    );

    const newUser = result.rows[0];

    // Clear cache after creating user
    userCache.clear();

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        isActive: newUser.isActive,
        tenantId: newUser.tenantId,
        createdAt: newUser.createdAt,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 