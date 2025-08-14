import { NextResponse } from "next/server";
import { getPool } from "@/lib/pg";
import { createTransporter } from "@/lib/email";

// This endpoint is designed to be called by Vercel Cron or external cron services
// to keep the serverless functions warm and connections ready

export async function GET() {
  try {
    console.log("🔥 Cron warmup triggered at:", new Date().toISOString());

    // Warm up database connection
    try {
      const pool = await getPool();
      await pool.query("SELECT 1");
      console.log("✅ Database warmed up");
    } catch (dbError) {
      console.error("❌ Database warmup failed:", dbError);
    }

    // Warm up email connection
    try {
      const transporter = await createTransporter();
      if (transporter.verify) {
        await transporter.verify();
        console.log("✅ Email connection warmed up");
      }
    } catch (emailError) {
      console.error("❌ Email warmup failed:", emailError);
    }

    // Return success response
    return NextResponse.json({
      status: "warmed",
      timestamp: new Date().toISOString(),
      message: "Functions warmed up successfully",
    });
  } catch (error) {
    console.error("❌ Cron warmup failed:", error);
    return NextResponse.json({ error: "Warmup failed" }, { status: 500 });
  }
}

// Also support POST for cron services that prefer POST
export async function POST() {
  return GET();
}
