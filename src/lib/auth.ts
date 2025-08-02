import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

// In-memory storage for development (replace with Redis in production)
const tokenBlacklist = new Set<string>();
const otpStorage = new Map<string, { otp: string; expiresAt: number }>();

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10); // Reduced from 12 to 10 for faster hashing
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyToken = async (token: string): Promise<JWTPayload> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      throw new Error('Token is blacklisted');
    }
    
    return decoded;
  } catch {
    throw new Error('Invalid token');
  }
};

export const verifyRefreshToken = async (token: string): Promise<JWTPayload> => {
  try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
        
        // Check if refresh token is blacklisted
        if (tokenBlacklist.has(token)) {
          throw new Error('Refresh token is blacklisted');
        }
        
        return decoded;
      } catch {
        throw new Error('Invalid refresh token');
      }
    };

export const blacklistToken = async (token: string, expiresIn: number = 3600): Promise<void> => {
  tokenBlacklist.add(token);
  // Clean up after expiry
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, expiresIn * 1000);
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = async (email: string, otp: string): Promise<void> => {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStorage.set(email, { otp, expiresAt });
  
  // Clean up expired OTPs
  setTimeout(() => {
    otpStorage.delete(email);
  }, 5 * 60 * 1000);
};

export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  const stored = otpStorage.get(email);
  if (stored && stored.otp === otp && Date.now() < stored.expiresAt) {
    otpStorage.delete(email);
    return true;
  }
  return false;
};

export const createPasswordResetToken = async (): Promise<string> => {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  // Store in memory for now
  return token;
};

export const verifyPasswordResetToken = async (): Promise<string | null> => {
  // For now, return null - implement proper token storage later
  return null;
}; 