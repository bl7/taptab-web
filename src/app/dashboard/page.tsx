'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  BarChart3,
  Package,
  Plus,
  Star,
  TrendingDown
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  averageOrderValue: number;
  ordersToday: number;
  revenueGrowth: number;
  orderGrowth: number;
}

interface LiveOrder {
  id: string;
  tableNumber: number;
  items: string[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  timeAgo: string;
}

interface PopularCombination {
  items: string[];
  frequency: number;
  revenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    ordersToday: 0,
    revenueGrowth: 0,
    orderGrowth: 0
  });

  const [liveOrders] = useState<LiveOrder[]>([
    {
      id: '1',
      tableNumber: 5,
      items: ['Margherita Pizza', 'Coke'],
      total: 24.50,
      status: 'pending',
      timeAgo: '2 min ago'
    },
    {
      id: '2',
      tableNumber: 3,
      items: ['Chicken Burger', 'Fries', 'Milkshake'],
      total: 18.75,
      status: 'preparing',
      timeAgo: '5 min ago'
    },
    {
      id: '3',
      tableNumber: 7,
      items: ['Pasta Carbonara', 'Garlic Bread'],
      total: 22.00,
      status: 'ready',
      timeAgo: '8 min ago'
    }
  ]);

  const [popularCombinations] = useState<PopularCombination[]>([
    {
      items: ['Margherita Pizza', 'Coke'],
      frequency: 45,
      revenue: 1102.50
    },
    {
      items: ['Chicken Burger', 'Fries'],
      frequency: 38,
      revenue: 855.00
    },
    {
      items: ['Pasta Carbonara', 'Garlic Bread'],
      frequency: 32,
      revenue: 704.00
    },
    {
      items: ['Caesar Salad', 'Iced Tea'],
      frequency: 28,
      revenue: 420.00
    }
  ]);

  useEffect(() => {
    // Simulate loading stats
    setStats({
      totalOrders: 156,
      activeOrders: 8,
      totalRevenue: 2847.50,
      totalCustomers: 89,
      averageOrderValue: 18.25,
      ordersToday: 12,
      revenueGrowth: 12.5,
      orderGrowth: 8.3
    });
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'green',
    subtitle,
    trend
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color?: 'green' | 'blue' | 'purple' | 'orange';
    subtitle?: string;
    trend?: number;
  }) => {
    const colorClasses = {
      green: 'bg-green-50 text-green-600 border-green-200',
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200'
    };

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {typeof value === 'number' && title.toLowerCase().includes('revenue') 
                ? `$${value.toFixed(2)}` 
                : value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                {trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(trend)}% from last month
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  const LiveOrdersCard = () => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Live Orders</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Real-time</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {liveOrders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                order.status === 'pending' ? 'bg-yellow-500' :
                order.status === 'preparing' ? 'bg-blue-500' :
                order.status === 'ready' ? 'bg-green-500' :
                'bg-gray-500'
              }`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Table {order.tableNumber}</p>
                <p className="text-xs text-gray-500">{order.items.join(', ')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">${order.total.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{order.timeAgo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PopularCombinationsCard = () => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Popular Combinations</h3>
        <Star className="w-5 h-5 text-yellow-500" />
      </div>
      
      <div className="space-y-3">
        {popularCombinations.map((combo, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{combo.items.join(' + ')}</p>
              <p className="text-xs text-gray-500">{combo.frequency} orders</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">${combo.revenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RevenueChart = () => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-600">+{stats.revenueGrowth}%</span>
        </div>
      </div>
      
      <div className="h-32 flex items-end justify-between space-x-2">
        {[65, 72, 68, 85, 78, 92, 88, 95].map((height, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t"
              style={{ height: `${height}%` }}
            ></div>
            <span className="text-xs text-gray-500 mt-1">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today'][index]}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="green"
          subtitle="This month"
          trend={stats.orderGrowth}
        />
        <StatCard
          title="Active Orders"
          value={stats.activeOrders}
          icon={Clock}
          color="blue"
          subtitle="Currently processing"
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={DollarSign}
          color="purple"
          subtitle="This month"
          trend={stats.revenueGrowth}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="orange"
          subtitle="+5 new this week"
        />
      </div>

      {/* Live Orders and Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveOrdersCard />
        <RevenueChart />
      </div>

      {/* Popular Combinations and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularCombinationsCard />
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors">
              <Plus className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">New Order</p>
              <p className="text-xs text-gray-500">Take order</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Analytics</p>
              <p className="text-xs text-gray-500">View reports</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <Package className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Menu</p>
              <p className="text-xs text-gray-500">Manage items</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-colors">
              <Users className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Staff</p>
              <p className="text-xs text-gray-500">Manage team</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 