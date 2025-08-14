import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';
import { verifyToken } from '@/lib/auth';

// GET - Get all saved rotas for the tenant
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
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Only TENANT_ADMIN can access rota management
    if (decoded.role !== 'TENANT_ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get all rota weeks for the tenant
    const result = await pool.query(
      `SELECT 
        "weekStartDate",
        status,
        "totalHours",
        "publishedAt",
        "createdAt"
       FROM rota_weeks 
       WHERE "tenantId" = $1 
       ORDER BY "weekStartDate" DESC`,
      [decoded.tenantId]
    );

    return NextResponse.json({
      rotas: result.rows
    });
  } catch (error) {
    console.error('Get rotas list error:', error);
    return NextResponse.json(
      { error: 'Failed to get rotas list' },
      { status: 500 }
    );
  }
} 