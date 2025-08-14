import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/pg";
import {
  generateOTP,
  storeOTP,
  verifyOTP,
  generateToken,
  generateRefreshToken,
  checkRateLimit,
  recordFailedAttempt,
  logAuditEvent,
} from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";

// Helper function to get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return "unknown";
}

// Helper function to get user agent
function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const { action, email, otp, rememberMe } = body;

    if (action === "requestOTP") {
      // Check rate limiting for OTP requests
      const canRequestOTP = await checkRateLimit(
        email,
        clientIP,
        "otp_request"
      );
      if (!canRequestOTP) {
        await recordFailedAttempt(email, clientIP, "otp_request", userAgent);
        await logAuditEvent(email, "otp_request", false, {
          reason: "Rate limit exceeded",
          ipAddress: clientIP,
          userAgent,
        });

        return NextResponse.json(
          { error: "Too many OTP requests. Please try again later." },
          { status: 429 }
        );
      }

      // Request OTP
      const pool = await getPool();
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      const user = result.rows[0];

      if (!user || !user.isActive) {
        await logAuditEvent(email, "otp_request", false, {
          reason: "User not found or inactive",
          ipAddress: clientIP,
          userAgent,
        });

        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const otpCode = generateOTP();

      // Store OTP first with tenant ID
      await storeOTP(email, otpCode, user.tenantId, clientIP, userAgent);

      // Send email with retry logic
      try {
        await sendOTPEmail(email, otpCode);
        console.log("✅ OTP email sent successfully to:", email);

        // Log successful OTP generation
        await logAuditEvent(email, "otp_email_sent", true, {
          ipAddress: clientIP,
          userAgent,
          tenantId: user.tenantId,
        });
      } catch (emailError) {
        console.error("❌ Failed to send OTP email:", emailError);

        // Log email failure
        await logAuditEvent(email, "otp_email_failed", false, {
          reason: "Email delivery failed",
          ipAddress: clientIP,
          userAgent,
          tenantId: user.tenantId,
        });

        // Don't fail the entire request if email fails
        // The OTP is still stored and can be resent
        return NextResponse.json(
          {
            error: "OTP generated but failed to send email. Please try again.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: "OTP sent successfully" });
    }

    if (action === "verifyOTP") {
      // Check rate limiting for OTP verification
      const canVerifyOTP = await checkRateLimit(email, clientIP, "otp_verify");
      if (!canVerifyOTP) {
        await recordFailedAttempt(email, clientIP, "otp_verify", userAgent);
        await logAuditEvent(email, "otp_verify", false, {
          reason: "Rate limit exceeded",
          ipAddress: clientIP,
          userAgent,
        });

        return NextResponse.json(
          { error: "Too many verification attempts. Please try again later." },
          { status: 429 }
        );
      }

      // Get user first to get tenant ID
      const pool = await getPool();
      const userResult = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      const user = userResult.rows[0];

      if (!user) {
        await logAuditEvent(email, "otp_verify", false, {
          reason: "User not found",
          ipAddress: clientIP,
          userAgent,
        });

        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Verify OTP with tenant ID
      const verificationResult = await verifyOTP(
        email,
        otp,
        user.tenantId,
        clientIP,
        userAgent
      );
      if (!verificationResult.success) {
        return NextResponse.json(
          { error: verificationResult.message },
          { status: 400 }
        );
      }

      const tenantResult = await pool.query(
        "SELECT * FROM tenants WHERE id = $1",
        [user.tenantId]
      );
      const tenant = tenantResult.rows[0];

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      };

      // Generate tokens with remember me option
      const token = generateToken(payload, rememberMe);
      const refreshToken = generateRefreshToken(payload, rememberMe);

      const response = {
        user: {
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
        },
        token,
        refreshToken,
        rememberMe,
      };

      // Console log the token and entire response when logged in
      console.log("=== LOGIN SUCCESS ===");
      console.log("Remember Me:", rememberMe);
      console.log("Token:", token);
      console.log("Full Response:", JSON.stringify(response, null, 2));
      console.log("=====================");

      // Log successful login
      await logAuditEvent(email, "login_success", true, {
        ipAddress: clientIP,
        userAgent,
        tenantId: user.tenantId,
        userId: user.id,
      });

      return NextResponse.json(response);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("❌ Login error:", error);

    // Log the error
    if (error instanceof Error) {
      await logAuditEvent("unknown", "login_error", false, {
        reason: error.message,
        ipAddress: clientIP,
        userAgent,
      });
    }

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("connection")) {
        return NextResponse.json(
          { error: "Database connection failed. Please try again." },
          { status: 503 }
        );
      }
      if (error.message.includes("timeout")) {
        return NextResponse.json(
          { error: "Request timed out. Please try again." },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
