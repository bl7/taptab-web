import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';
import { verifyToken } from '@/lib/auth';
import { sendRotaEmail } from '@/lib/email';

// POST - Publish rota and send emails
export async function POST(request: NextRequest) {
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
    
    const body = await request.json();
    const { weekStartDate } = body;

    if (!weekStartDate) {
      return NextResponse.json(
        { error: 'Week start date is required' },
        { status: 400 }
      );
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get rota week and shifts
      const weekResult = await client.query(
        `SELECT * FROM rota_weeks WHERE "tenantId" = $1 AND "weekStartDate" = $2`,
        [decoded.tenantId, weekStartDate]
      );

      if (!weekResult.rows[0]) {
        throw new Error('Rota week not found');
      }

      const shiftsResult = await client.query(
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

      // Get tenant info
      const tenantResult = await client.query(
        `SELECT name FROM tenants WHERE id = $1`,
        [decoded.tenantId]
      );

      const tenantName = tenantResult.rows[0]?.name || 'Your Restaurant';

      // Update rota week status to published
      await client.query(
        `UPDATE rota_weeks 
         SET "status" = 'published', "publishedAt" = NOW(), "publishedBy" = $1
         WHERE "tenantId" = $2 AND "weekStartDate" = $3`,
        [decoded.id, decoded.tenantId, weekStartDate]
      );

      // Update all shifts status to published
      await client.query(
        `UPDATE rota_shifts 
         SET "status" = 'published'
         WHERE "tenantId" = $1 AND "weekStartDate" = $2`,
        [decoded.tenantId, weekStartDate]
      );

      // Group shifts by staff member
      const staffShifts = new Map();
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      shiftsResult.rows.forEach((shift: {
        staffId: string;
        firstName: string;
        lastName: string;
        email: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        shiftHours: number;
        breakDuration: number;
        notes?: string;
        shiftLabel?: string;
      }) => {
        if (!staffShifts.has(shift.staffId)) {
          staffShifts.set(shift.staffId, {
            staffId: shift.staffId,
            firstName: shift.firstName,
            lastName: shift.lastName,
            email: shift.email,
            shifts: []
          });
        }
        staffShifts.get(shift.staffId).shifts.push({
          day: dayNames[shift.dayOfWeek],
          startTime: shift.startTime,
          endTime: shift.endTime,
          shiftHours: shift.shiftHours,
          breakDuration: shift.breakDuration,
          notes: shift.notes,
          shiftLabel: shift.shiftLabel
        });
      });

      // Send emails to each staff member
      const emailPromises = [];
      for (const [staffId, staffData] of staffShifts) {
        // Create notification record
        await client.query(
          `INSERT INTO rota_notifications ("tenantId", "weekStartDate", "staffId", "emailSent", "sentAt")
           VALUES ($1, $2, $3, true, NOW())
           ON CONFLICT ("tenantId", "weekStartDate", "staffId") 
           DO UPDATE SET "emailSent" = true, "sentAt" = NOW()`,
          [decoded.tenantId, weekStartDate, staffId]
        );

        // Send email
        const emailPromise = sendRotaEmail(
          staffData.email,
          staffData.firstName,
          staffData.lastName,
          tenantName,
          weekStartDate,
          staffData.shifts
        ).catch(error => {
          console.error(`Failed to send email to ${staffData.email}:`, error);
          return null;
        });

        emailPromises.push(emailPromise);
      }

      await client.query('COMMIT');

      // Wait for all emails to be sent (don't fail if some emails fail)
      await Promise.allSettled(emailPromises);

      return NextResponse.json({
        message: 'Rota published successfully',
        emailsSent: staffShifts.size
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Publish rota error:', error);
    return NextResponse.json(
      { error: 'Failed to publish rota' },
      { status: 500 }
    );
  }
} 