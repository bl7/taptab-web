import { ReactNode } from 'react';

export default function BossDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-black border-r border-gray-800">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-white font-bold text-lg">Boss Panel</span>
            </div>
          </div>
          
          <nav className="mt-8 px-4">
            <div className="space-y-2">
              <a href="/bossdashboard" className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">
                <span className="text-sm">Dashboard</span>
              </a>
              <a href="/bossdashboard/tenants" className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">
                <span className="text-sm">Restaurants</span>
              </a>
              <a href="/bossdashboard/users" className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">
                <span className="text-sm">All Users</span>
              </a>
              <a href="/bossdashboard/analytics" className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">
                <span className="text-sm">Analytics</span>
              </a>
            </div>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-gray-900">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 