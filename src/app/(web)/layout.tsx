'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/use-auth';

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <>
      <Navigation />
      
      {/* Secondary Header for Logged-in Users */}
      {isAuthenticated && (
        <div className="bg-gray-200 border-b border-gray-300 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Welcome back, {user?.firstName || 'User'}
              </span>
              <a 
                href="/dashboard" 
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors"
              >
                Dashboard
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {user?.role?.replace('_', ' ') || 'User'}
              </span>
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
      
      <main>
        {children}
      </main>
      <Footer />
    </>
  );
} 