'use client';

import { useState, useEffect } from 'react';
import { tokenManager } from './token-manager';
import { logout } from './logout';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    colors: Record<string, string>;
    isActive: boolean;
  };
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = tokenManager.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    };

    // Check auth immediately
    checkAuth();

    // Set up interval to check auth status
    const interval = setInterval(checkAuth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    logout: handleLogout,
  };
}; 