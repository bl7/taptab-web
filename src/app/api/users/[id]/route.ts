import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';
import { verifyToken, hashPassword } from '@/lib/auth';

// Simple in-memory cache for user data (in production, use Redis)
const userCache = new Map<string, { data: unknown; timestamp: number }>();

// GET - Get specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const { id: userId } = await params;

    // Get user with tenant info
    const result = await pool.query(
      `SELECT u.*, t.name as tenant_name 
       FROM users u 
       LEFT JOIN tenants t ON u."tenantId" = t.id 
       WHERE u.id = $1`,
      [userId]
    );

    const user = result.rows[0];
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (decoded.role !== 'SUPER_ADMIN' && user.tenantId !== decoded.tenantId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      user: {
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
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const { id: userId } = await params;
    const body = await request.json();
    const { email, firstName, lastName, role, password, isActive } = body;

    // Check permissions
    if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'TENANT_ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get current user
    const currentUserResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const currentUser = currentUserResult.rows[0];

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check tenant access
    if (decoded.role !== 'SUPER_ADMIN' && currentUser.tenantId !== decoded.tenantId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Build update query
    const updates: string[] = [];
    const values: (string | boolean | number)[] = [];
    let paramCount = 1;

    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (firstName !== undefined) {
      updates.push(`"firstName" = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push(`"lastName" = $${paramCount++}`);
      values.push(lastName);
    }
    if (role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    if (isActive !== undefined) {
      updates.push(`"isActive" = $${paramCount++}`);
      values.push(isActive);
    }
    if (password) {
      const hashedPassword = await hashPassword(password);
      updates.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }

    updates.push(`"updatedAt" = NOW()`);
    values.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    const updatedUser = result.rows[0];

    // Clear cache after updating user
    userCache.clear();

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        tenantId: updatedUser.tenantId,
        updatedAt: updatedUser.updatedAt,
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const { id: userId } = await params;

    // Check permissions
    if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'TENANT_ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get current user
    const currentUserResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const currentUser = currentUserResult.rows[0];

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check tenant access
    if (decoded.role !== 'SUPER_ADMIN' && currentUser.tenantId !== decoded.tenantId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Prevent deleting self
    if (currentUser.id === decoded.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    // Clear cache after deleting user
    userCache.clear();

    return NextResponse.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 