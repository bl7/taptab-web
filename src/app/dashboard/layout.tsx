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

  const getNavLinkClasses = (isActive: boolean) => {
    const baseClasses = "w-full p-3 transition-colors flex items-center";
    const collapsedClasses = sidebarCollapsed ? 'justify-center group relative' : 'space-x-3';
    const activeClasses = isActive 
      ? 'bg-white bg-opacity-20 text-white rounded-lg mx-2' 
      : 'text-white hover:bg-white hover:bg-opacity-10 mx-2 rounded-lg';
    
    return `${baseClasses} ${collapsedClasses} ${activeClasses}`;
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
          <nav className="flex flex-col items-center flex-1 w-full">
            <Link 
              href="/dashboard" 
              className={getNavLinkClasses(isActiveLink('/dashboard'))}
              title="Dashboard"
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-sm">Dashboard</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Dashboard
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/orders" 
              className={getNavLinkClasses(isActiveLink('/dashboard/orders'))}
              title="Orders"
            >
              <ShoppingCart className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-sm">Orders</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Orders
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/order-taking" 
              className={getNavLinkClasses(isActiveLink('/dashboard/order-taking'))}
              title="Take Orders"
            >
              <Plus className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-sm">Take Orders</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Take Orders
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/staff" 
              className={getNavLinkClasses(isActiveLink('/dashboard/staff'))}
              title="Staff"
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-sm">Staff</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Staff
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/rota" 
              className={getNavLinkClasses(isActiveLink('/dashboard/rota'))}
              title="Rota"
            >
              <Calendar className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-sm">Rota</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Rota
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/menu" 
              className={getNavLinkClasses(isActiveLink('/dashboard/menu'))}
              title="Menu"
            >
              <Menu className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-sm">Menu</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Menu
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/tables" 
              className={getNavLinkClasses(isActiveLink('/dashboard/tables'))}
              title="Tables"
            >
              <Table className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-sm">Tables</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Tables
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/analytics" 
              className={getNavLinkClasses(isActiveLink('/dashboard/analytics'))}
              title="Analytics"
            >
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-sm">Analytics</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Analytics
                </div>
              )}
            </Link>
            
            <Link 
              href="/dashboard/settings" 
              className={getNavLinkClasses(isActiveLink('/dashboard/settings'))}
              title="Settings"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-sm">Settings</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Settings
                </div>
              )}
            </Link>
          </nav>

          {/* User Info */}
          <div className="flex flex-col items-center w-full px-2">
            <div className={`w-full p-3 transition-colors flex items-center ${sidebarCollapsed ? 'justify-center group relative' : 'space-x-3'} text-white`}>
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-300 truncate">
                    {user?.role?.replace('_', ' ') || 'Restaurant Manager'}
                  </p>
                </div>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  <div className="font-semibold">
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                  </div>
                  <div className="text-xs text-gray-300">
                    {user?.role?.replace('_', ' ') || 'Restaurant Manager'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col items-center w-full">
            <button 
              onClick={handleLogout}
              className={`w-full p-3 transition-colors flex items-center ${sidebarCollapsed ? 'justify-center group relative' : 'space-x-3'} text-white hover:bg-white hover:bg-opacity-10 mx-2 rounded-lg`}
              title="Logout"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-sm">Logout</span>}
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