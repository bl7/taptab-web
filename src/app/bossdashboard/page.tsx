'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Activity,
  Eye,
  Plus,
  Settings,
  BarChart3
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalTenants: number;
  activeUsers: number;
  activeTenants: number;
}

export default function BossDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTenants: 0,
    activeUsers: 0,
    activeTenants: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('bossToken');
      if (!token) {
        window.location.href = '/boss/login';
        return;
      }

      // For now, we'll use mock data since we haven't implemented the stats API
      // In a real implementation, you'd fetch from /api/boss/stats
      setStats({
        totalUsers: 156,
        totalTenants: 23,
        activeUsers: 142,
        activeTenants: 21,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-600 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Restaurants</p>
              <p className="text-2xl font-bold text-white">{stats.totalTenants}</p>
            </div>
            <div className="bg-green-600 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Users</p>
              <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
            </div>
            <div className="bg-purple-600 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Restaurants</p>
              <p className="text-2xl font-bold text-white">{stats.activeTenants}</p>
            </div>
            <div className="bg-orange-600 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Manage Users</h3>
              <p className="text-gray-400 text-sm">View and manage all system users</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/bossdashboard/users"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm"
            >
              <Eye className="h-4 w-4 mr-1" />
              View All Users
            </a>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Restaurants</h3>
              <p className="text-gray-400 text-sm">Manage restaurant tenants</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/bossdashboard/tenants"
              className="inline-flex items-center text-green-400 hover:text-green-300 text-sm"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Restaurants
            </a>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-600 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Analytics</h3>
              <p className="text-gray-400 text-sm">System-wide analytics and reports</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/bossdashboard/analytics"
              className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              View Analytics
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
            <div className="bg-green-600 p-2 rounded-full">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white text-sm">New restaurant &quot;Pizza Palace&quot; registered</p>
              <p className="text-gray-400 text-xs">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
            <div className="bg-blue-600 p-2 rounded-full">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white text-sm">5 new users added to &quot;Burger Joint&quot;</p>
              <p className="text-gray-400 text-xs">4 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
            <div className="bg-orange-600 p-2 rounded-full">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white text-sm">System maintenance completed</p>
              <p className="text-gray-400 text-xs">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 