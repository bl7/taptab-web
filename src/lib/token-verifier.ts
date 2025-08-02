import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

/**
 * Verify JWT token - can be used by external backends
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract user info from token without verification
 * Use this for logging/debugging only
 * @param token - JWT token
 * @returns Decoded token payload or null if invalid
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token decoding failed:', error);
    return null;
  }
}

/**
 * Check if user has required role
 * @param token - JWT token
 * @param requiredRoles - Array of allowed roles
 * @returns boolean indicating if user has required role
 */
export function hasRole(token: string, requiredRoles: string[]): boolean {
  const payload = verifyToken(token);
  if (!payload) return false;
  
  return requiredRoles.includes(payload.role);
}

/**
 * Get user tenant ID from token
 * @param token - JWT token
 * @returns tenant ID or null if invalid
 */
export function getTenantId(token: string): string | null {
  const payload = verifyToken(token);
  return payload?.tenantId || null;
}

/**
 * Get user role from token
 * @param token - JWT token
 * @returns user role or null if invalid
 */
export function getUserRole(token: string): string | null {
  const payload = verifyToken(token);
  return payload?.role || null;
}

/**
 * Check if user is super admin
 * @param token - JWT token
 * @returns boolean indicating if user is super admin
 */
export function isSuperAdmin(token: string): boolean {
  return hasRole(token, ['SUPER_ADMIN']);
}

/**
 * Check if user is tenant admin
 * @param token - JWT token
 * @returns boolean indicating if user is tenant admin
 */
export function isTenantAdmin(token: string): boolean {
  return hasRole(token, ['SUPER_ADMIN', 'TENANT_ADMIN']);
}

/**
 * Check if user can manage staff
 * @param token - JWT token
 * @returns boolean indicating if user can manage staff
 */
export function canManageStaff(token: string): boolean {
  return hasRole(token, ['SUPER_ADMIN', 'TENANT_ADMIN']);
}

/**
 * Check if user can access tenant data
 * @param token - JWT token
 * @param tenantId - Tenant ID to check access for
 * @returns boolean indicating if user can access tenant data
 */
export function canAccessTenant(token: string, tenantId: string): boolean {
  const payload = verifyToken(token);
  if (!payload) return false;
  
  // Super admin can access all tenants
  if (payload.role === 'SUPER_ADMIN') return true;
  
  // Other users can only access their own tenant
  return payload.tenantId === tenantId;
}

/**
 * Middleware function for Express.js
 * Verifies token and adds user info to request
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  req.user = payload;
  next();
}

/**
 * Role-based middleware for Express.js
 * @param allowedRoles - Array of allowed roles
 */
export function roleMiddleware(allowedRoles: string[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

/**
 * Tenant access middleware for Express.js
 * Ensures user can only access their own tenant's data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tenantMiddleware(req: any, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  const requestedTenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;
  
  if (requestedTenantId && !canAccessTenant(req.headers.authorization?.replace('Bearer ', ''), requestedTenantId)) {
    return res.status(403).json({ error: 'Access denied to this tenant' });
  }
  
  next();
}

// Example usage for external backend:
/*
import { verifyToken, hasRole, authMiddleware, roleMiddleware } from './token-verifier';

// Simple verification
const token = req.headers.authorization?.replace('Bearer ', '');
const user = verifyToken(token);
if (!user) {
  return res.status(401).json({ error: 'Invalid token' });
}

// Role checking
if (!hasRole(token, ['SUPER_ADMIN', 'TENANT_ADMIN'])) {
  return res.status(403).json({ error: 'Insufficient permissions' });
}

// Express middleware
app.use('/api/protected', authMiddleware);
app.use('/api/admin', authMiddleware, roleMiddleware(['SUPER_ADMIN', 'TENANT_ADMIN']));
*/ 