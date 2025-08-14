import { NextRequest, NextResponse } from "next/server";
import {
  verifyRefreshToken,
  generateToken,
  generateRefreshToken,
  isTokenBlacklisted,
} from "@/lib/auth";
import { getPool } from "@/lib/pg";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Check if refresh token is blacklisted
    if (isTokenBlacklisted(refreshToken)) {
      return NextResponse.json(
        { success: false, message: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    // Get user from database to ensure they still exist and are active
    const pool = await getPool();
    const userResult = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND email = $2 AND isActive = true",
      [payload.id, payload.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found or inactive" },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Get tenant information
    const tenantResult = await pool.query(
      "SELECT * FROM tenants WHERE id = $1",
      [user.tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tenant not found" },
        { status: 401 }
      );
    }

    // Create new payload
    const newPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    // Determine if this was a "remember me" session based on refresh token expiry
    const refreshTokenDecoded = verifyRefreshToken(refreshToken);
    const now = Math.floor(Date.now() / 1000);
    const refreshTokenExpiry = refreshTokenDecoded?.exp || 0;
    const isRememberMe = refreshTokenExpiry - now > 7 * 24 * 3600; // More than 7 days

    // Generate new tokens
    const newToken = generateToken(newPayload, isRememberMe);
    const newRefreshToken = generateRefreshToken(newPayload, isRememberMe);

    // Blacklist the old refresh token
    await isTokenBlacklisted(refreshToken);

    console.log("🔄 Token refreshed successfully for:", user.email);
    console.log("📅 Remember Me:", isRememberMe);
    console.log(
      "⏰ New token expires in:",
      isRememberMe ? "30 days" : "24 hours"
    );

    return NextResponse.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenant: {
          id: tenantResult.rows[0].id,
          name: tenantResult.rows[0].name,
          slug: tenantResult.rows[0].slug,
          logo: tenantResult.rows[0].logo,
          primaryColor: tenantResult.rows[0].primaryColor,
          secondaryColor: tenantResult.rows[0].secondaryColor,
        },
      },
    });
  } catch (error) {
    console.error("❌ Token refresh error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
