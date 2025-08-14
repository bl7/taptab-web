import { NextResponse } from "next/server";
import pool from "@/lib/pg";
import { createTransporter } from "@/lib/email";

// Cache connections globally to persist between cold starts
let cachedPool: typeof pool | null = null;
let cachedTransporter: Awaited<ReturnType<typeof createTransporter>> | null = null;

export async function GET() {
  try {
    // Initialize database connection if not cached
    if (!cachedPool) {
      console.log("🔥 Initializing database connection...");
      cachedPool = pool;
      // Test the connection
      await cachedPool.query("SELECT 1");
      console.log("✅ Database connection established");
    }

    // Initialize email transporter if not cached
    if (!cachedTransporter) {
      console.log("🔥 Initializing email transporter...");
      cachedTransporter = await createTransporter();
      console.log("✅ Email transporter initialized");
    }

    // Test email connection (optional - can be commented out if causing delays)
    try {
      // Just verify the transporter is ready without sending
      if (cachedTransporter.verify) {
        await cachedTransporter.verify();
        console.log("✅ Email connection verified");
      }
    } catch (emailError) {
      console.log("⚠️ Email verification failed (non-critical):", emailError);
    }

    return NextResponse.json({
      status: "warmed",
      timestamp: new Date().toISOString(),
      connections: {
        database: "ready",
        email: "ready",
      },
    });
  } catch (error) {
    console.error("❌ Warmup failed:", error);
    return NextResponse.json(
      {
        error: "Warmup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
