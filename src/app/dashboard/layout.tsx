'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Home, 
  ShoppingCart, 
  Users, 
  Settings, 
  BarChart3, 
  Menu, 
  Table,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { PrintBridgeProvider } from '@/contexts/PrintBridgeContext';
import { UnifiedStatusPanel } from '@/components/UnifiedStatusPanel';
import { useAuth } from '@/lib/use-auth';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  // Get JWT token and user role from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('bossToken');
    const userData = localStorage.getItem('user');
    
    if (token) {
      setJwtToken(token);
    }
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role || '');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('🔐 User not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Check if a link is active
  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <PrintBridgeProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Left Sidebar - Black Navigation */}
        <div className={`${sidebarCollapsed ? 'w-24' : 'w-64'} bg-black flex flex-col items-center py-6 space-y-8 transition-all duration-300 relative`}>
          {/* Logo */}
          <div className="flex items-center justify-center">
            {sidebarCollapsed ? (
              <Image
                src="/icon.png"
                alt="TapTab Icon"
                width={32}
                height={32}
                className="object-contain"
              />
            ) : (
              <Image
                src="/logo.png"
                alt="TapTab Logo"
                width={120}
                height={40}
                className="object-contain"
              />
            )}
          </div>

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center space-y-6 flex-1 w-full px-4">
            <Link 
              href="/dashboard" 
              className={`w-full p-3 rounded-xl transition-colors flex items-center ${sidebarCollapsed ? 'justify-center group relative' : 'space-x-3'} ${
                isActiveLink('/dashboard') 
                  ? 'bg-green-600 text-white' 
                  : 'text-white hover:bg-gray-800'
              }`}
              title="Dashboard"
            >
              <Home className="w-6 h-6 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Dashboard
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/orders" 
              className={`w-full p-3 rounded-xl transition-colors flex items-center ${sidebarCollapsed ? 'justify-center group relative' : 'space-x-3'} ${
                isActiveLink('/dashboard/orders') 
                  ? 'bg-green-600 text-white' 
                  : 'text-white hover:bg-gray-800'
              }`}
              title="Orders"
            >
              <ShoppingCart className="w-6 h-6 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Orders</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Orders
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/order-taking" 
              className={`w-full p-3 rounded-xl transition-colors flex items-center ${sidebarCollapsed ? 'justify-center group relative' : 'space-x-3'} ${
                isActiveLink('/dashboard/order-taking') 
                  ? 'bg-green-600 text-white' 
                  : 'text-white hover:bg-gray-800'
              }`}
              title="Take Orders"
            >
              <Plus className="w-6 h-6 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Take Orders</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Take Orders
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/staff" 
              className={`w-full p-3 rounded-xl transition-colors flex items-center ${sidebarCollapsed ? 'justify-center group relative' : 'space-x-3'} ${
                isActiveLink('/dashboard/staff') 
                  ? 'bg-green-600 text-white' 
                  : 'text-white hover:bg-gray-800'
              }`}
              title="Staff"
            >
              <Users className="w-6 h-6 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Staff</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Staff
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/rota" 
              className={`w-full p-3 rounded-xl transition-colors flex items-center ${sidebarCollapsed ? 'justify-center group relative' : 'space-x-3'} ${
                isActiveLink('/dashboard/rota') 
                  ? 'bg-green-600 text-white' 
                  : 'text-white hover:bg-gray-800'
              }`}
              title="Rota"
            >
              <Calendar className="w-6 h-6 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Rota</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Rota
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/menu" 
              className={`w-full p-3 rounded-xl transition-colors flex items-center ${sidebarCollapsed ? 'justify-center group relative' : 'space-x-3'} ${
                isActiveLink('/dashboard/menu') 
                  ? 'bg-green-600 text-white' 
                  : 'text-white hover:bg-gray-800'
              }`}
              title="Menu"
            >
              <Menu className="w-6 h-6 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Menu</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Menu
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/tables" 
              className={`w-full p-3 rounded-xl transition-colors flex items-center ${sidebarCollapsed ? 'justify-center group relative' : 'space-x-3'} ${
                isActiveLink('/dashboard/tables') 
                  ? 'bg-green-600 text-white' 
                  : 'text-white hover:bg-gray-800'
              }`}
              title="Tables"
            >
              <Table className="w-6 h-6 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Tables</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Tables
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/analytics" 
              className={`w-full p-3 rounded-xl transition-colors flex items-center ${sidebarCollapsed ? 'justify-center group relative' : 'space-x-3'} ${
                isActiveLink('/dashboard/analytics') 
                  ? 'bg-green-600 text-white' 
                  : 'text-white hover:bg-gray-800'
              }`}
              title="Analytics"
            >
              <BarChart3 className="w-6 h-6 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Analytics</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Analytics
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/settings" 
              className={`w-full p-3 rounded-xl transition-colors flex items-center ${sidebarCollapsed ? 'justify-center group relative' : 'space-x-3'} ${
                isActiveLink('/dashboard/settings') 
                  ? 'bg-green-600 text-white' 
                  : 'text-white hover:bg-gray-800'
              }`}
              title="Settings"
            >
              <Settings className="w-6 h-6 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Settings</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Settings
                </div>
              )}
            </Link>
          </nav>

          {/* Bottom Actions */}
          <div className="flex flex-col items-center space-y-4 w-full px-4">
            <button 
              onClick={handleLogout}
              className={`w-full p-3 rounded-xl transition-colors flex items-center ${sidebarCollapsed ? 'justify-center group relative' : 'space-x-3'} text-white hover:bg-gray-800`}
              title="Logout"
            >
              <LogOut className="w-6 h-6 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Logout</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Logout
                </div>
              )}
            </button>
          </div>

          {/* Collapse Handle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-12 bg-gray-800 hover:bg-gray-700 rounded-r-lg flex items-center justify-center transition-colors"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-white" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Header Bar */}
          <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            {/* Left - Brand */}
            <div className="flex items-center space-x-3">
             
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {user?.firstName ? `${user.firstName}` : 'Restaurant'}
                </h1>
              </div>
            </div>

            {/* Right - User Info */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                </p>
                <p className="text-xs text-gray-600">
                  {user?.role?.replace('_', ' ') || 'Restaurant Manager'}
                </p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-gray-50 p-8">
            {children}
          </main>
        </div>
      </div>

      {/* WebSocket Status Panel */}
      <UnifiedStatusPanel jwtToken={jwtToken} userRole={userRole} />
    </PrintBridgeProvider>
  );
} 