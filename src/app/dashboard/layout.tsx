'use client';

import { ReactNode, useState, useEffect } from 'react';
import { UnifiedStatusPanel } from '@/components/UnifiedStatusPanel';
import { useTokenExpiration } from '@/lib/use-token-expiration';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  
  // Check token expiration
  useTokenExpiration();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
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
              <a href="/dashboard/deliveroo" className="flex items-center px-4 py-2 text-black hover:text-black hover:bg-gray-100 rounded-lg">
                <span className="text-sm">Deliveroo</span>
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
            
            {/* User profile and logout section at bottom */}
            <div className="mt-auto border-t border-gray-200 pt-4 pb-4">
              <div className="flex items-center px-4 py-2 mb-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs text-black">U</span>
                </div>
                <div className="ml-3">
                              <p className="text-sm font-medium text-black">User</p>
            <p className="text-xs text-black">Restaurant Admin</p>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className="w-full flex items-center px-4 py-2 text-black hover:text-black hover:bg-gray-100 rounded-lg"
              >
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-gray-50">
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