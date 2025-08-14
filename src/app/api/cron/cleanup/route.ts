import { NextResponse } from "next/server";
import { cleanupExpiredOTPs } from "@/lib/auth";
import { getPool } from "@/lib/pg";

// This endpoint is designed to be called by Vercel Cron or external cron services
// to clean up expired data and maintain database performance

export async function GET() {
  try {
    console.log("🧹 Cleanup cron triggered at:", new Date().toISOString());

    // Clean up expired OTPs
    try {
      await cleanupExpiredOTPs();
      console.log("✅ Expired OTPs cleaned up");
    } catch (otpError) {
      console.error("❌ OTP cleanup failed:", otpError);
    }

    // Clean up old failed attempts (older than 30 days)
    try {
      const pool = await getPool();
      const failedResult = await pool.query(
        `DELETE FROM failed_attempts 
         WHERE created_at < NOW() - INTERVAL '30 days' 
         RETURNING COUNT(*)`
      );

      const deletedFailedCount = parseInt(failedResult.rows[0].count);
      if (deletedFailedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedFailedCount} old failed attempts`);
      }
    } catch (failedError) {
      console.error("❌ Failed attempts cleanup failed:", failedError);
    }

    // Clean up old audit logs (older than 90 days)
    try {
      const pool = await getPool();
      const auditResult = await pool.query(
        `DELETE FROM audit_logs 
         WHERE created_at < NOW() - INTERVAL '90 days' 
         RETURNING COUNT(*)`
      );

      const deletedAuditCount = parseInt(auditResult.rows[0].count);
      if (deletedAuditCount > 0) {
        console.log(`🧹 Cleaned up ${deletedAuditCount} old audit logs`);
      }
    } catch (auditError) {
      console.error("❌ Audit logs cleanup failed:", auditError);
    }

    // Return success response
    return NextResponse.json({
      status: "cleanup_completed",
      timestamp: new Date().toISOString(),
      message: "Database cleanup completed successfully",
    });
  } catch (error) {
    console.error("❌ Cleanup cron failed:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}

// Also support POST for cron services that prefer POST
export async function POST() {
  return GET();
}
