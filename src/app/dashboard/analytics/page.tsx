"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, ShoppingCart, Star } from "lucide-react";
import { api } from "@/lib/api";
import { PageLoader } from "@/lib/utils";
import {
  ComprehensiveAnalytics,
  PeakHours,
  TopItems,
  StaffPerformance,
} from "@/lib/api";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{
    comprehensive: ComprehensiveAnalytics;
    peakHours: PeakHours;
    topItems: TopItems;
    staffPerformance: StaffPerformance[];
  } | null>(null);
  const [timeRange, setTimeRange] = useState<
    "yesterday" | "week" | "month" | "year"
  >("week");
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all analytics data in parallel
        const [comprehensive, peakHours, topItems, staffPerformance] =
          await Promise.all([
            api.getComprehensiveAnalytics({
              period: customDateRange ? "custom" : timeRange,
              startDate: customDateRange?.startDate,
              endDate: customDateRange?.endDate,
            }),
            api.getPeakHours(customDateRange ? 0 : 30), // Use custom date range if available
            api.getTopItems(timeRange === "yesterday" ? "week" : timeRange, 10),
            api.getStaffPerformance(
              timeRange === "yesterday" ? "week" : timeRange
            ),
          ]);

        console.log("thisbitch", "Analytics data loaded:", {
          comprehensive,
          peakHours,
          topItems,
          staffPerformance,
        });

        setAnalytics({
          comprehensive,
          peakHours,
          topItems,
          staffPerformance: staffPerformance.staffPerformance,
        });
      } catch (err) {
        console.error("thisbitch", "Error loading analytics:", err);
        console.error("thisbitch", "Error details:", {
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
        });
        setError("Failed to load analytics data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [timeRange, customDateRange]);

  const RevenueTrendChart = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black">Revenue Trend</h3>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600">
            +{analytics?.comprehensive.growth.revenue.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="h-48 flex items-end justify-between space-x-1">
        {analytics?.comprehensive.dailyData.map((day, index) => {
          const maxRevenue = Math.max(
            ...analytics.comprehensive.dailyData.map((d) => d.revenue)
          );
          const height = (day.revenue / maxRevenue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t"
                style={{ height: `${height}%` }}
              ></div>
              <span className="text-xs text-gray-500 mt-1">
                {new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </span>
              <span className="text-xs text-gray-400">
                ${day.revenue.toFixed(0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const PeakHoursHeatmap = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-black mb-4">Peak Hours</h3>
      <div className="grid grid-cols-12 gap-1">
        {analytics?.peakHours.peakHours.map((hour, index) => {
          const maxOrders = Math.max(
            ...analytics.peakHours.peakHours.map((h) => h.orderCount)
          );
          const intensity = hour.orderCount / maxOrders;
          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-full rounded-sm transition-all hover:scale-105"
                style={{
                  height: `${intensity * 100}px`,
                  backgroundColor: `rgba(34, 197, 94, ${intensity})`,
                }}
              ></div>
              <span className="text-xs text-gray-500 mt-1">{hour.hour}:00</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );

  const TopItemsChart = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-black mb-4">
        Top Selling Items
      </h3>
      <div className="space-y-3">
        {analytics?.topItems.topItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">
                  {item.rank}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.quantity} sold</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                ${item.revenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {item.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const StaffPerformanceCard = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-black mb-4">
        Staff Performance
      </h3>
      <div className="space-y-3">
        {analytics?.staffPerformance.map((staff, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">
                  {staff.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {staff.name}
                </p>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(staff.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">
                    {staff.rating}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {staff.orderCount} orders
              </p>
              <p className="text-xs text-gray-500">
                ${staff.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <PageLoader message="Loading analytics data..." />;
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

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-black">
            View your restaurant&apos;s performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Preset Date Range */}
          <select
            value={timeRange}
            onChange={(e) => {
              setTimeRange(
                e.target.value as "yesterday" | "week" | "month" | "year"
              );
              setCustomDateRange(null);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black bg-white"
          >
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          {/* Custom Date Range */}
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={customDateRange?.startDate || ""}
              onChange={(e) =>
                setCustomDateRange((prev) => ({
                  startDate: e.target.value,
                  endDate: prev?.endDate || "",
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black bg-white"
              placeholder="Start Date"
            />
            <span className="text-black">to</span>
            <input
              type="date"
              value={customDateRange?.endDate || ""}
              onChange={(e) =>
                setCustomDateRange((prev) => ({
                  startDate: prev?.startDate || "",
                  endDate: e.target.value,
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black bg-white"
              placeholder="End Date"
            />
            {customDateRange?.startDate && customDateRange?.endDate && (
              <button
                onClick={() => setCustomDateRange(null)}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${analytics.comprehensive.summary.totalRevenue.toFixed(2)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">
                    +{analytics.comprehensive.growth.revenue.toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.comprehensive.summary.totalOrders}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">
                    +{analytics.comprehensive.growth.orders.toFixed(1)}%
                  </span>
                </div>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${analytics.comprehensive.summary.avgOrderValue.toFixed(2)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">
                    +{analytics.comprehensive.growth.avgOrderValue.toFixed(1)}%
                  </span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
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
    </div>
  );
}
