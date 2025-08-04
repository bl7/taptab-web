import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';
import { verifyToken, JWTPayload } from '@/lib/auth';

// GET - Get rota for a specific week
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
    const { searchParams } = new URL(request.url);
    const weekStartDate = searchParams.get('weekStartDate');

    if (!weekStartDate) {
      return NextResponse.json(
        { error: 'Week start date is required' },
        { status: 400 }
      );
    }

    // Get rota week info
    const weekResult = await pool.query(
      `SELECT * FROM rota_weeks WHERE "tenantId" = $1 AND "weekStartDate" = $2`,
      [decoded.tenantId, weekStartDate]
    );

    // Get all shifts for the week
    const shiftsResult = await pool.query(
      `SELECT 
        rs.*,
        u."firstName",
        u."lastName",
        u.email
       FROM rota_shifts rs
       JOIN users u ON rs."staffId" = u.id
       WHERE rs."tenantId" = $1 AND rs."weekStartDate" = $2
       ORDER BY rs."dayOfWeek", rs."startTime"`,
      [decoded.tenantId, weekStartDate]
    );

    // Get all staff members for the tenant
    const staffResult = await pool.query(
      `SELECT id, "firstName", "lastName", email, role
       FROM users 
       WHERE "tenantId" = $1 AND "isActive" = true AND role != 'SUPER_ADMIN'
       ORDER BY "firstName", "lastName"`,
      [decoded.tenantId]
    );

    return NextResponse.json({
      week: weekResult.rows[0] || null,
      shifts: shiftsResult.rows,
      staff: staffResult.rows
    });
  } catch (error) {
    console.error('Get rota error:', error);
    return NextResponse.json(
      { error: 'Failed to get rota' },
      { status: 500 }
    );
  }
}

// POST - Create or update rota week
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
    const { weekStartDate, shifts, status = 'draft' } = body;

    if (!weekStartDate || !shifts) {
      return NextResponse.json(
        { error: 'Week start date and shifts are required' },
        { status: 400 }
      );
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create or update rota week
      const weekResult = await client.query(
        `INSERT INTO rota_weeks ("tenantId", "weekStartDate", "status", "updatedAt")
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT ("tenantId", "weekStartDate") 
         DO UPDATE SET "status" = $3, "updatedAt" = NOW()
         RETURNING *`,
        [decoded.tenantId, weekStartDate, status]
      );

      // Delete existing shifts for this week
      await client.query(
        `DELETE FROM rota_shifts WHERE "tenantId" = $1 AND "weekStartDate" = $2`,
        [decoded.tenantId, weekStartDate]
      );

      // Insert new shifts
      let totalHours = 0;
      for (const shift of shifts) {
        const { staffId, dayOfWeek, startTime, endTime, breakDuration = 0, shiftHours, notes, shiftLabel } = shift;
        
        await client.query(
          `INSERT INTO rota_shifts (
            "tenantId", "staffId", "weekStartDate", "dayOfWeek", 
            "startTime", "endTime", "breakDuration", "shiftHours", "notes", "shiftLabel"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [decoded.tenantId, staffId, weekStartDate, dayOfWeek, startTime, endTime, breakDuration, shiftHours, notes, shiftLabel]
        );
        
        totalHours += parseFloat(shiftHours);
      }

      // Update total hours in rota week
      await client.query(
        `UPDATE rota_weeks SET "totalHours" = $1 WHERE "tenantId" = $2 AND "weekStartDate" = $3`,
        [totalHours, decoded.tenantId, weekStartDate]
      );

      await client.query('COMMIT');

      return NextResponse.json({
        message: 'Rota saved successfully',
        week: weekResult.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Save rota error:', error);
    return NextResponse.json(
      { error: 'Failed to save rota' },
      { status: 500 }
    );
  }
} 