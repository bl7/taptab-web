'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

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
  };
  orders?: {
    pendingOrders?: number;
    preparingOrders?: number;
    readyOrders?: number;
    completedOrders?: number;
  };
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const salesData = await api.getSalesAnalytics();
        const orderData = await api.getOrderAnalytics();
        setAnalytics({ sales: salesData, orders: orderData });
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Analytics</h1>
        <p className="text-gray-600">View your restaurant&apos;s performance metrics</p>
      </div>

      {analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sales Analytics */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-4">Sales Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sales:</span>
                <span className="font-semibold">${analytics.sales?.totalSales?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders:</span>
                <span className="font-semibold">{analytics.sales?.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Order:</span>
                <span className="font-semibold">${analytics.sales?.averageOrderValue?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Order Analytics */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-4">Order Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold">{analytics.orders?.pendingOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Preparing:</span>
                <span className="font-semibold">{analytics.orders?.preparingOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ready:</span>
                <span className="font-semibold">{analytics.orders?.readyOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span className="font-semibold">{analytics.orders?.completedOrders || 0}</span>
              </div>
            </div>
          </div>

          {/* Top Items */}
          <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-2">
            <h3 className="text-lg font-semibold text-black mb-4">Top Selling Items</h3>
            <div className="space-y-2">
              {analytics.sales?.topItems?.slice(0, 5).map((item, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.name}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{item.quantity} sold</span>
                    <span className="font-semibold">${item.revenue?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
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