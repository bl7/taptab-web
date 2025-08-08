"use client";

import { useState, useEffect } from "react";
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
  TrendingDown,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  DashboardSummary,
  LiveOrder,
  PopularCombination,
  RevenueTrend,
  Table,
} from "@/lib/api";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<{
    summary: DashboardSummary;
    liveOrders: LiveOrder[];
    popularCombinations: PopularCombination[];
    revenueTrend: RevenueTrend;
    tables: Table[];
  } | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all dashboard data in parallel
        const [
          overview,
          liveOrders,
          popularCombinations,
          revenueTrend,
          tables,
        ] = await Promise.all([
          api.getDashboardOverview("month"),
          api.getLiveOrders(),
          api.getPopularCombinations(5),
          api.getRevenueTrend(7),
          api.getTables(),
        ]);

        setDashboardData({
          summary: overview.summary,
          liveOrders: liveOrders.orders,
          popularCombinations: popularCombinations.combinations,
          revenueTrend: revenueTrend,
          tables: tables.tables,
        });
      } catch (err) {
        console.error("thisbitch", "Error loading dashboard data:", err);
        console.error("thisbitch", "Error details:", {
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
        });
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "green",
    subtitle,
    trend,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color?: "green" | "blue" | "purple" | "orange" | "red";
    subtitle?: string;
    trend?: number;
  }) => {
    const colorClasses = {
      green: "bg-green-50 text-green-600 border-green-200",
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
      red: "bg-red-50 text-red-600 border-red-200",
    };

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {typeof value === "number" &&
              title.toLowerCase().includes("revenue")
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
                <span
                  className={`text-sm ${
                    trend > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
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

  const LiveOrdersCard = () => {
    const getTableName = (tableNumber: string) => {
      // First try to match by table number (for QR orders)
      let table = dashboardData?.tables.find((t) => t.number === tableNumber);

      // If not found, try to match by table ID (for waiter/cashier orders)
      if (!table) {
        table = dashboardData?.tables.find((t) => t.id === tableNumber);
      }

      return table ? `Table ${table.number}` : `Table ${tableNumber}`;
    };

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Live Orders</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Real-time</span>
          </div>
        </div>

        <div className="space-y-3">
          {dashboardData?.liveOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    order.status === "pending"
                      ? "bg-yellow-500"
                      : order.status === "preparing"
                      ? "bg-blue-500"
                      : order.status === "ready"
                      ? "bg-green-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getTableName(order.tableNumber)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.items
                      .map((item) => `${item.quantity}x ${item.menuItemName}`)
                      .join(", ")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  ${order.total.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">{order.timeAgo}</p>
              </div>
            </div>
          )) || []}
        </div>
      </div>
    );
  };

  const PopularCombinationsCard = () => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Popular Combinations
        </h3>
        <Star className="w-5 h-5 text-yellow-500" />
      </div>

      <div className="space-y-3">
        {dashboardData?.popularCombinations.map((combo, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {combo.combination}
              </p>
              <p className="text-xs text-gray-500">{combo.orderCount} orders</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                ${combo.revenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
          </div>
        )) || []}
      </div>
    </div>
  );

  const RevenueChart = () => {
    const dailyData = dashboardData?.revenueTrend?.dailyData || [];
    const growth = dashboardData?.revenueTrend?.growth || 0;

    if (dailyData.length === 0) {
      return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Revenue Trend
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-500">No data</span>
            </div>
          </div>
          <div className="h-48 flex items-center justify-center">
            <p className="text-gray-500">No revenue data available</p>
          </div>
        </div>
      );
    }

    const maxRevenue = Math.max(...dailyData.map((d) => d.revenue));

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span
              className={`text-sm font-medium ${
                growth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {growth >= 0 ? "+" : ""}
              {growth.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="h-64 relative">
          {/* Y-axis labels - NORMAL (0 at bottom, max at top) */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
            {[0, 25, 50, 75, 100].map((percent) => (
              <div key={percent} className="text-right">
                ${((maxRevenue * percent) / 100).toFixed(0)}
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="ml-12 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-b border-gray-100"></div>
              ))}
            </div>

            {/* SVG Chart */}
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="lineGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient
                  id="areaGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Area fill - NORMAL Y-axis */}
              <path
                d={`M 0,100 ${dailyData
                  .map((day, index) => {
                    const x = (index / (dailyData.length - 1)) * 100;
                    const y = 100 - (day.revenue / maxRevenue) * 100; // NORMAL: higher revenue = higher Y
                    return `L ${x},${y}`;
                  })
                  .join(" ")} L 100,100 Z`}
                fill="url(#areaGradient)"
              />

              {/* Line - NORMAL Y-axis, very thin */}
              <polyline
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={dailyData
                  .map((day, index) => {
                    const x = (index / (dailyData.length - 1)) * 100;
                    const y = 100 - (day.revenue / maxRevenue) * 100; // NORMAL: higher revenue = higher Y
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
            </svg>

            {/* Revenue values on the line */}
            <div className="absolute inset-0 flex justify-between items-center px-2">
              {dailyData.map((day, index) => {
                const y = 100 - (day.revenue / maxRevenue) * 100;
                return (
                  <div
                    key={index}
                    className="text-xs font-semibold text-gray-800 bg-white/90 px-1 py-0.5 rounded"
                    style={{
                      transform: `translateY(${y}%)`,
                      marginTop: "-8px",
                    }}
                  >
                    ${day.revenue.toFixed(0)}
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
              {dailyData.map((day, index) => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString("en-US", {
                  weekday: "short",
                });
                return (
                  <div key={index} className="text-center">
                    {dayName}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Revenue:</span>
            <span className="font-semibold text-gray-900">
              ${dashboardData?.revenueTrend?.totalRevenue?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/order-taking"
            className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <Plus className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">New Order</p>
            <p className="text-xs text-gray-500">Take order</p>
          </Link>

          <Link
            href="/dashboard/analytics"
            className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Analytics</p>
            <p className="text-xs text-gray-500">View reports</p>
          </Link>

          <Link
            href="/dashboard/menu"
            className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <Package className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Menu</p>
            <p className="text-xs text-gray-500">Manage items</p>
          </Link>

          <Link
            href="/dashboard/staff"
            className="p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <Users className="w-6 h-6 text-orange-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Staff</p>
            <p className="text-xs text-gray-500">Manage team</p>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={dashboardData.summary.totalOrders.value}
          icon={ShoppingCart}
          color="green"
          subtitle={dashboardData.summary.totalOrders.period}
          trend={dashboardData.summary.totalOrders.growth}
        />
        <StatCard
          title="Active Orders"
          value={dashboardData.summary.activeOrders.value}
          icon={Clock}
          color="blue"
          subtitle={dashboardData.summary.activeOrders.status}
        />
        <StatCard
          title="Cancelled Orders"
          value={dashboardData.summary.cancelledOrders.value}
          icon={XCircle}
          color="red"
          subtitle={dashboardData.summary.cancelledOrders.status}
        />
        <StatCard
          title="Total Revenue"
          value={dashboardData.summary.totalRevenue.value}
          icon={DollarSign}
          color="purple"
          subtitle={dashboardData.summary.totalRevenue.period}
          trend={dashboardData.summary.totalRevenue.growth}
        />
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Methods
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(dashboardData.summary.paymentMethods).map(
            ([method, data]) => (
              <div
                key={method}
                className="text-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm font-medium text-gray-600 mb-1">
                  {method.toUpperCase()}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {data.count} orders
                </div>
                <div className="text-sm text-green-600 font-medium">
                  ${data.revenue.toFixed(2)}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Live Orders and Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveOrdersCard />
        <RevenueChart />
      </div>

      {/* Popular Combinations */}
      <div className="grid grid-cols-1 gap-6">
        <PopularCombinationsCard />
      </div>
    </div>
  );
}
