'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Clock,
  Star
} from 'lucide-react';

interface AnalyticsData {
  sales?: {
    totalSales?: number;
    totalOrders?: number;
    averageOrderValue?: number;
    topItems?: Array<{
      name: string;
      quantity: number;
      revenue: number;
    }>;
    revenueTrend?: number[];
    dailyRevenue?: Array<{
      date: string;
      revenue: number;
      orders: number;
    }>;
  };
  orders?: {
    pendingOrders?: number;
    preparingOrders?: number;
    readyOrders?: number;
    completedOrders?: number;
  };
  performance?: {
    peakHours?: Array<{
      hour: number;
      orders: number;
      revenue: number;
    }>;
    staffPerformance?: Array<{
      name: string;
      ordersHandled: number;
      revenue: number;
      rating: number;
    }>;
  };
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        // Mock data for enhanced analytics
        const mockAnalytics: AnalyticsData = {
          sales: {
            totalSales: 2847.50,
            totalOrders: 156,
            averageOrderValue: 18.25,
            topItems: [
              { name: 'Margherita Pizza', quantity: 45, revenue: 1102.50 },
              { name: 'Chicken Burger', quantity: 38, revenue: 855.00 },
              { name: 'Pasta Carbonara', quantity: 32, revenue: 704.00 },
              { name: 'Caesar Salad', quantity: 28, revenue: 420.00 },
              { name: 'Chocolate Cake', quantity: 25, revenue: 375.00 }
            ],
            revenueTrend: [65, 72, 68, 85, 78, 92, 88, 95],
            dailyRevenue: [
              { date: 'Mon', revenue: 325.50, orders: 18 },
              { date: 'Tue', revenue: 412.75, orders: 22 },
              { date: 'Wed', revenue: 298.25, orders: 16 },
              { date: 'Thu', revenue: 456.80, orders: 25 },
              { date: 'Fri', revenue: 523.40, orders: 28 },
              { date: 'Sat', revenue: 612.90, orders: 33 },
              { date: 'Sun', revenue: 218.90, orders: 12 }
            ]
          },
          orders: {
            pendingOrders: 3,
            preparingOrders: 5,
            readyOrders: 2,
            completedOrders: 146
          },
          performance: {
            peakHours: [
              { hour: 12, orders: 15, revenue: 285.50 },
              { hour: 13, orders: 22, revenue: 412.75 },
              { hour: 14, orders: 18, revenue: 298.25 },
              { hour: 15, orders: 12, revenue: 198.40 },
              { hour: 16, orders: 8, revenue: 145.60 },
              { hour: 17, orders: 10, revenue: 185.30 },
              { hour: 18, orders: 25, revenue: 456.80 },
              { hour: 19, orders: 28, revenue: 523.40 },
              { hour: 20, orders: 18, revenue: 298.25 },
              { hour: 21, orders: 12, revenue: 198.40 },
              { hour: 22, orders: 8, revenue: 145.60 }
            ],
            staffPerformance: [
              { name: 'Sarah Johnson', ordersHandled: 45, revenue: 825.50, rating: 4.8 },
              { name: 'Mike Chen', ordersHandled: 38, revenue: 698.25, rating: 4.6 },
              { name: 'Emma Davis', ordersHandled: 42, revenue: 756.80, rating: 4.9 },
              { name: 'Alex Rodriguez', ordersHandled: 31, revenue: 567.40, rating: 4.4 }
            ]
          }
        };
        
        setAnalytics(mockAnalytics);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const RevenueTrendChart = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black">Revenue Trend</h3>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600">+12.5%</span>
        </div>
      </div>
      
      <div className="h-48 flex items-end justify-between space-x-1">
        {analytics?.sales?.dailyRevenue?.map((day, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t"
              style={{ height: `${(day.revenue / 700) * 100}%` }}
            ></div>
            <span className="text-xs text-gray-500 mt-1">{day.date}</span>
            <span className="text-xs text-gray-400">${day.revenue.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const PeakHoursHeatmap = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-black mb-4">Peak Hours</h3>
      <div className="grid grid-cols-12 gap-1">
        {analytics?.performance?.peakHours?.map((hour, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="w-full rounded-sm transition-all hover:scale-105"
              style={{ 
                height: `${(hour.orders / 30) * 100}px`,
                backgroundColor: `rgba(34, 197, 94, ${hour.orders / 30})`
              }}
            ></div>
            <span className="text-xs text-gray-500 mt-1">{hour.hour}:00</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );

  const TopItemsChart = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-black mb-4">Top Selling Items</h3>
      <div className="space-y-3">
        {analytics?.sales?.topItems?.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">{index + 1}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.quantity} sold</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">${item.revenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{((item.revenue / (analytics?.sales?.totalSales || 1)) * 100).toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const StaffPerformanceCard = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-black mb-4">Staff Performance</h3>
      <div className="space-y-3">
        {analytics?.performance?.staffPerformance?.map((staff, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">{staff.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < Math.floor(staff.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{staff.rating}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{staff.ordersHandled} orders</p>
              <p className="text-xs text-gray-500">${staff.revenue.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Analytics</h1>
          <p className="text-gray-600">View your restaurant&apos;s performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {analytics ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${analytics.sales?.totalSales?.toFixed(2)}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+12.5%</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.sales?.totalOrders}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+8.3%</span>
                  </div>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">${analytics.sales?.averageOrderValue?.toFixed(2)}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+5.2%</span>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(analytics.orders?.pendingOrders || 0) + (analytics.orders?.preparingOrders || 0) + (analytics.orders?.readyOrders || 0)}
                  </p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-4 h-4 text-orange-600 mr-1" />
                    <span className="text-sm text-orange-600">In progress</span>
                  </div>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueTrendChart />
            <PeakHoursHeatmap />
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopItemsChart />
            <StaffPerformanceCard />
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      )}
    </div>
  );
}