interface TokenPayload {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  exp: number;
  iat: number;
}

interface RefreshResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  message?: string;
}

class TokenManager {
  private refreshTimeout: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<RefreshResponse> | null = null;

  // Get token from localStorage
  private getToken(): string | null {
    return localStorage.getItem('token') || localStorage.getItem('bossToken');
  }

  // Get refresh token from localStorage
  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  // Set tokens in localStorage
  private setTokens(token: string, refreshToken?: string): void {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  // Clear tokens from localStorage
  private clearTokens(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('bossToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Decode JWT token without verification (for expiration check)
  private decodeToken(token: string): TokenPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  // Check if token is expired or about to expire (within 5 minutes)
  private isTokenExpiringSoon(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;
    
    // Return true if token expires in less than 5 minutes
    return expiresIn < 300; // 5 minutes = 300 seconds
  }

  // Check if token is expired
  private isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }

  // Check if refresh token is expired
  private isRefreshTokenExpired(refreshToken: string): boolean {
    const decoded = this.decodeToken(refreshToken);
    if (!decoded) return true;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }

  // Refresh token by calling the backend
  private async refreshToken(): Promise<RefreshResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return { success: false, message: 'No refresh token available' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1'}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.setTokens(data.token, data.refreshToken);
        return { 
          success: true, 
          token: data.token, 
          refreshToken: data.refreshToken 
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Failed to refresh token' 
        };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return { 
        success: false, 
        message: 'Network error during token refresh' 
      };
    }
  }

  // Get valid token (refresh if needed)
  public async getValidToken(): Promise<string | null> {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    
    if (!token) {
      return null;
    }

    // If token is expired, try to refresh
    if (this.isTokenExpired(token)) {
      if (!refreshToken || this.isRefreshTokenExpired(refreshToken)) {
        // Both tokens expired, clear and redirect to login
        this.clearTokens();
        this.redirectToLogin();
        return null;
      }

      const refreshResult = await this.refreshToken();
      if (refreshResult.success && refreshResult.token) {
        return refreshResult.token;
      } else {
        // Refresh failed, clear tokens and redirect to login
        this.clearTokens();
        this.redirectToLogin();
        return null;
      }
    }

    // If token is expiring soon, refresh in background
    if (this.isTokenExpiringSoon(token)) {
      this.scheduleTokenRefresh();
    }

    return token;
  }

  // Schedule token refresh
  private scheduleTokenRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    const token = this.getToken();
    if (!token) return;

    const decoded = this.decodeToken(token);
    if (!decoded) return;

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;
    
    // Refresh 5 minutes before expiry
    const refreshIn = Math.max(expiresIn - 300, 60) * 1000; // At least 1 minute

    this.refreshTimeout = setTimeout(async () => {
      await this.performTokenRefresh();
    }, refreshIn);
  }

  // Perform token refresh
  private async performTokenRefresh(): Promise<void> {
    if (this.isRefreshing) {
      return; // Already refreshing
    }

    this.isRefreshing = true;

    try {
      const refreshResult = await this.refreshToken();
      
      if (refreshResult.success) {
        console.log('✅ Token refreshed successfully');
        // Schedule next refresh
        this.scheduleTokenRefresh();
      } else {
        console.error('❌ Token refresh failed:', refreshResult.message);
        this.clearTokens();
        this.redirectToLogin();
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      this.clearTokens();
      this.redirectToLogin();
    } finally {
      this.isRefreshing = false;
    }
  }

  // Initialize token manager
  public init(): void {
    const token = this.getToken();
    if (token) {
      this.scheduleTokenRefresh();
    }
  }

  // Handle logout
  public logout(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    this.clearTokens();
    this.redirectToLogin();
  }

  // Redirect to login
  private redirectToLogin(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Get auth headers for API requests
  public async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getValidToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    
    if (!token) return false;
    
    // If access token is valid, user is authenticated
    if (!this.isTokenExpired(token)) {
      return true;
    }
    
    // If access token is expired but refresh token is valid, user is still authenticated
    if (refreshToken && !this.isRefreshTokenExpired(refreshToken)) {
      return true;
    }
    
    return false;
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();

// Initialize token manager when module loads
if (typeof window !== 'undefined') {
  tokenManager.init();
} 