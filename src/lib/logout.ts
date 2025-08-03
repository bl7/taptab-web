import { tokenManager } from './token-manager';

export const logout = async (): Promise<void> => {
  try {
    // Get current tokens
    const token = localStorage.getItem('token') || localStorage.getItem('bossToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // Call logout API to blacklist tokens
    if (token || refreshToken) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1'}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ token, refreshToken }),
      });
    }
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    // Always clear local storage and redirect
    tokenManager.logout();
  }
}; 