import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  exp: number;
  iat: number;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    // Check if token is expired (with 1 hour buffer)
    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = 60 * 60; // 1 hour in seconds
    return decoded.exp < (currentTime + bufferTime);
  } catch {
    return true;
  }
};

export const getTokenExpirationTime = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
};

export const logoutUser = (): void => {
  // Clear all authentication data
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('bossToken');
  localStorage.removeItem('bossUser');
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const checkTokenAndLogout = (): boolean => {
  const token = localStorage.getItem('token') || localStorage.getItem('bossToken');
  
  if (!token) {
    return false;
  }
  
  if (isTokenExpired(token)) {
    console.log('🔐 Token expired, logging out user');
    logoutUser();
    return true;
  }
  
  return false;
};

export const setupTokenExpirationCheck = (): void => {
  // Check token expiration every minute
  setInterval(() => {
    checkTokenAndLogout();
  }, 60 * 1000); // Check every minute
  
  // Also check when the page becomes visible (user returns to tab)
  if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        checkTokenAndLogout();
      }
    });
  }
}; 