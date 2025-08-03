'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedStatusPanel } from '@/components/UnifiedStatusPanel';
import { useAuth } from '@/lib/use-auth';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const router = useRouter();
  
  // Use new auth system
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        if (user.role === 'TENANT_ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'MANAGER') {
          setIsAdmin(true);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    if (token) {
      setJwtToken(token);
    }
  }, []);

  // Check authentication and redirect if needed
  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      console.log('🔐 User not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [isMounted, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar - starts from very top */}
        <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-lg font-semibold text-black">TapTab</span>
            </div>
          </div>

          <nav className="flex-1 px-4 flex flex-col">
            <div className="space-y-2">
              <a href="/dashboard" className="flex items-center px-4 py-2 text-black hover:text-black hover:bg-gray-100 rounded-lg">
                <span className="text-sm">Dashboard</span>
              </a>
              <a href="/dashboard/orders" className="flex items-center px-4 py-2 text-black hover:text-black hover:bg-gray-100 rounded-lg">
                <span className="text-sm">Orders</span>
              </a>
              <a href="/dashboard/order-taking" className="flex items-center px-4 py-2 text-black hover:text-black hover:bg-gray-100 rounded-lg">
                <span className="text-sm">Take Orders</span>
              </a>
              
              {/* Admin-only items - only render after mounting to prevent hydration issues */}
              {isMounted && isAdmin && (
                <>
                  <a href="/dashboard/staff" className="flex items-center px-4 py-2 text-black hover:text-black hover:bg-gray-100 rounded-lg">
                    <span className="text-sm">Staff Management</span>
                  </a>
                  <a href="/dashboard/menu" className="flex items-center px-4 py-2 text-black hover:text-black hover:bg-gray-100 rounded-lg">
                    <span className="text-sm">Menu Management</span>
                  </a>
                  <a href="/dashboard/tables" className="flex items-center px-4 py-2 text-black hover:text-black hover:bg-gray-100 rounded-lg">
                    <span className="text-sm">Table Management</span>
                  </a>
                  <a href="/dashboard/analytics" className="flex items-center px-4 py-2 text-black hover:text-black hover:bg-gray-100 rounded-lg">
                    <span className="text-sm">Analytics</span>
                  </a>
                  <a href="/dashboard/settings" className="flex items-center px-4 py-2 text-black hover:text-black hover:bg-gray-100 rounded-lg">
                    <span className="text-sm">Settings</span>
                  </a>
                </>
              )}
            </div>
            
            {/* User profile section at bottom */}
            <div className="mt-auto border-t border-gray-200 pt-4 pb-4">
              <div className="flex items-center px-4 py-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs text-black">
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-black">
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
                  </p>
                  <p className="text-xs text-black">
                    {user?.role?.replace('_', ' ') || 'User'}
                  </p>
                </div>
              </div>
            </div>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-gray-50">
          {/* Secondary Header for Logged-in Users */}
          {isAuthenticated && (
            <div className="bg-gray-200 border-b border-gray-300 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Welcome back, {user?.firstName || 'User'}</span>
                  <a 
                    href="/dashboard" 
                    className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Dashboard
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{user?.role?.replace('_', ' ') || 'User'}</span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
      
      {/* WebSocket Status Component */}
      {isMounted && (
        <UnifiedStatusPanel jwtToken={jwtToken} userRole={userRole} />
      )}
    </div>
  );
} 