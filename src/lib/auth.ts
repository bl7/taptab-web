import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getPool } from "./pg";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

// In-memory storage for development (replace with Redis in production)
const tokenBlacklist = new Set<string>();

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  exp?: number;
  iat?: number;
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (
  payload: JWTPayload,
  rememberMe = false
): string => {
  const expiresIn = rememberMe ? "30d" : "24h";
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const generateRefreshToken = (
  payload: JWTPayload,
  rememberMe = false
): string => {
  const expiresIn = rememberMe ? "90d" : "7d";
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch {
    return null;
  }
};

export const blacklistToken = async (token: string): Promise<void> => {
  tokenBlacklist.add(token);

  // Clean up old blacklisted tokens (keep last 1000)
  if (tokenBlacklist.size > 1000) {
    const tokensArray = Array.from(tokenBlacklist);
    tokenBlacklist.clear();
    tokensArray.slice(-1000).forEach((t) => tokenBlacklist.add(t));
  }
};

export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check if user has exceeded rate limits
export const checkRateLimit = async (
  email: string,
  ipAddress: string,
  action: string
): Promise<boolean> => {
  const pool = await getPool();

  try {
    // Check failed attempts in the last hour
    const failedResult = await pool.query(
      `SELECT COUNT(*) FROM failed_attempts 
       WHERE email = $1 AND ip_address = $2 AND attempt_type = $3 
       AND created_at > NOW() - INTERVAL '1 hour'`,
      [email, ipAddress, action]
    );

    const failedCount = parseInt(failedResult.rows[0].count);

    // Different limits for different actions
    const limits = {
      otp_request: 5, // Max 5 OTP requests per hour
      otp_verify: 10, // Max 10 OTP verification attempts per hour
      login: 20, // Max 20 login attempts per hour
    };

    return failedCount < (limits[action as keyof typeof limits] || 10);
  } catch (error) {
    // Graceful fallback if table doesn't exist yet
    if (error instanceof Error && error.message.includes("does not exist")) {
      console.log("⚠️ Security tables not created yet, skipping rate limiting");
      return true; // Allow all requests until tables are created
    }
    console.error("Rate limit check failed:", error);
    return true; // Allow if check fails
  }
};

// Record failed attempt
export const recordFailedAttempt = async (
  email: string,
  ipAddress: string,
  action: string,
  userAgent?: string
): Promise<void> => {
  const pool = await getPool();

  try {
    await pool.query(
      `INSERT INTO failed_attempts (email, ip_address, user_agent, attempt_type) 
       VALUES ($1, $2, $3, $4)`,
      [email, ipAddress, userAgent, action]
    );
  } catch (error) {
    // Graceful fallback if table doesn't exist yet
    if (error instanceof Error && error.message.includes("does not exist")) {
      console.log(
        "⚠️ Security tables not created yet, skipping failed attempt logging"
      );
      return;
    }
    console.error("Failed to record failed attempt:", error);
  }
};

// Store OTP in database with security tracking
export const storeOTP = async (
  email: string,
  otp: string,
  tenantId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  const pool = await getPool();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  try {
    // Delete any existing OTPs for this email and tenant
    await pool.query("DELETE FROM otps WHERE email = $1 AND tenant_id = $2", [
      email,
      tenantId,
    ]);

    // Insert new OTP
    await pool.query(
      `INSERT INTO otps (email, tenant_id, otp, expires_at) 
       VALUES ($1, $2, $3, $4)`,
      [email, tenantId, otp, expiresAt]
    );

    // Log successful OTP generation
    await logAuditEvent(email, "otp_generated", true, {
      ipAddress,
      userAgent,
      tenantId,
    });
  } catch (error) {
    console.error("Failed to store OTP:", error);
    throw new Error("Failed to generate OTP");
  }
};

// Verify OTP from database with security checks and attempt tracking
export const verifyOTP = async (
  email: string,
  otp: string,
  tenantId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{
  success: boolean;
  message: string;
  attemptsRemaining?: number;
}> => {
  const pool = await getPool();

  try {
    // Get OTP from database
    const result = await pool.query(
      `SELECT * FROM otps WHERE email = $1 AND tenant_id = $2 AND expires_at > NOW() AND used = false`,
      [email, tenantId]
    );

    if (result.rows.length === 0) {
      await logAuditEvent(email, "otp_verify", false, {
        ipAddress,
        userAgent,
        tenantId,
        reason: "OTP expired, not found, or already used",
      });
      return {
        success: false,
        message: "OTP has expired or is invalid. Please request a new one.",
      };
    }

    const storedOTP = result.rows[0];
    const currentAttempts = storedOTP.attempts || 0;
    const maxAttempts = storedOTP.max_attempts || 3;

    // Check if max attempts reached
    if (currentAttempts >= maxAttempts) {
      await logAuditEvent(email, "otp_verify", false, {
        ipAddress,
        userAgent,
        tenantId,
        reason: "Max attempts reached",
        attempts: currentAttempts,
      });
      return {
        success: false,
        message: "Too many wrong attempts. Please request a new OTP.",
      };
    }

    // Check if OTP matches
    if (storedOTP.otp === otp) {
      // Mark OTP as used
      await pool.query(
        "UPDATE otps SET used = true, used_at = NOW() WHERE id = $1",
        [storedOTP.id]
      );

      // Log successful verification
      await logAuditEvent(email, "otp_verify", true, {
        ipAddress,
        userAgent,
        tenantId,
        attempts: currentAttempts + 1,
      });

      return { success: true, message: "OTP verified successfully" };
    } else {
      // Increment attempt counter
      const newAttempts = currentAttempts + 1;
      await pool.query("UPDATE otps SET attempts = $1 WHERE id = $2", [
        newAttempts,
        storedOTP.id,
      ]);

      // Record failed attempt
      await recordFailedAttempt(
        email,
        ipAddress || "unknown",
        "otp_verify",
        userAgent
      );

      // Log failed verification
      await logAuditEvent(email, "otp_verify", false, {
        ipAddress,
        userAgent,
        tenantId,
        reason: "Invalid OTP code",
        attempts: newAttempts,
        attemptsRemaining: maxAttempts - newAttempts,
      });

      const attemptsRemaining = maxAttempts - newAttempts;
      const message =
        attemptsRemaining > 0
          ? `Wrong OTP. ${attemptsRemaining} attempt${
              attemptsRemaining === 1 ? "" : "s"
            } remaining.`
          : "Too many wrong attempts. Please request a new OTP.";

      return {
        success: false,
        message,
        attemptsRemaining: attemptsRemaining > 0 ? attemptsRemaining : 0,
      };
    }
  } catch (error) {
    console.error("OTP verification failed:", error);
    await logAuditEvent(email, "otp_verify", false, {
      ipAddress,
      userAgent,
      tenantId,
      reason: "System error",
    });
    return {
      success: false,
      message: "System error. Please try again.",
    };
  }
};

// Clean up expired OTPs (run this periodically)
export const cleanupExpiredOTPs = async (): Promise<void> => {
  const pool = await getPool();

  try {
    const result = await pool.query(
      "DELETE FROM otps WHERE expires_at < NOW() RETURNING COUNT(*)"
    );

    const deletedCount = parseInt(result.rows[0].count);
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} expired OTPs`);
    }
  } catch (error) {
    console.error("Failed to cleanup expired OTPs:", error);
  }
};

// Log audit events
export const logAuditEvent = async (
  email: string,
  action: string,
  success: boolean,
  details?: Record<string, unknown>,
  userId?: string
): Promise<void> => {
  const pool = await getPool();

  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, email, action, success, details) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, email, action, success, details ? JSON.stringify(details) : null]
    );
  } catch (error) {
    // Graceful fallback if table doesn't exist yet
    if (error instanceof Error && error.message.includes("does not exist")) {
      console.log("⚠️ Audit table not created yet, skipping audit logging");
      return;
    }
    console.error("Failed to log audit event:", error);
  }
};

export const createPasswordResetToken = async (): Promise<string> => {
  return crypto.randomUUID();
};

export const verifyPasswordResetToken = async (): Promise<string | null> => {
  // For now, return null - implement proper token storage later
  return null;
};
